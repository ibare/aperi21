// ========================================================================
// power-transmission — 순수 물리
// ========================================================================
// 발전소가 보내는 전력 P 가 정해져 있으면 송전선의 전류는 I = P / V 다 — 전압을 올리면
// 전류가 그만큼 준다. 송전선은 저항 R 이라 1 초에 I²R 만큼을 열로 낸다. 마을에 닿는 것은
// P − I²R 이다. 단위는 kW · kV · A · Ω 이라 I(A) = P(kW) / V(kV), 손실(kW) = I²R / 1000.
//
// 모든 것이 조각 시계의 닫힌 식이다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  BAR_WORLD_PER_KW,
  CARRIERS_PER_WORLD_PER_AMP,
  CARRIER_SPEED,
  CURRENT_ARROW_PER_AMP,
  LINE_RESISTANCE,
  LOSS_DIVISOR,
  POWER,
  VOLTAGE_FACTOR,
  VOLTAGE_HIGH,
  VOLTAGE_LOW,
  WISP_LIFE,
  WISP_RATE_PER_KW,
  WISP_RISE,
} from './schema';
import type { PowerTransmissionState } from './state';

/** W 를 kW 로 — 손실 I²R(W)을 보낸 전력과 같은 단위로 맞춘다. 단위 환산이라 선언이 아니다. */
const WATTS_PER_KILOWATT = 1000;

export interface PowerTransmissionConstants {
  power: number;
  lineResistance: number;
  voltageLow: number;
  voltageHigh: number;
  voltageFactor: number;
  lossDivisor: number;
  barWorldPerKw: number;
  carriersPerWorldPerAmp: number;
  carrierSpeed: number;
  currentArrowPerAmp: number;
  wispRatePerKw: number;
  wispRise: number;
  wispLife: number;
}

export function readConstants(stage: StageDef): PowerTransmissionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    power: c.power ?? POWER,
    lineResistance: c.lineResistance ?? LINE_RESISTANCE,
    voltageLow: c.voltageLow ?? VOLTAGE_LOW,
    voltageHigh: c.voltageHigh ?? VOLTAGE_HIGH,
    voltageFactor: c.voltageFactor ?? VOLTAGE_FACTOR,
    lossDivisor: c.lossDivisor ?? LOSS_DIVISOR,
    barWorldPerKw: c.barWorldPerKw ?? BAR_WORLD_PER_KW,
    carriersPerWorldPerAmp: c.carriersPerWorldPerAmp ?? CARRIERS_PER_WORLD_PER_AMP,
    carrierSpeed: c.carrierSpeed ?? CARRIER_SPEED,
    currentArrowPerAmp: c.currentArrowPerAmp ?? CURRENT_ARROW_PER_AMP,
    wispRatePerKw: c.wispRatePerKw ?? WISP_RATE_PER_KW,
    wispRise: c.wispRise ?? WISP_RISE,
    wispLife: c.wispLife ?? WISP_LIFE,
  };
}

/** 한 줄 송전의 결과 — 선 전류(A), 선에서 열로 샌 전력(kW), 마을에 닿은 전력(kW). */
export interface LineBudget {
  current: number;
  loss: number;
  delivered: number;
}

/**
 * 전력 `power`(kW)를 전압 `voltage`(kV)로 저항 `resistance`(Ω) 선에 보낼 때.
 * 손실이 보낸 전력을 넘으면(저작자가 극단값을 넣으면) 보낸 만큼에서 자른다 — 마을 막대가 음수가 되지 않게.
 */
export function lineBudget(power: number, voltage: number, resistance: number): LineBudget {
  const current = power / voltage;
  const loss = Math.min(power, (current * current * resistance) / WATTS_PER_KILOWATT);
  return { current, loss, delivered: power - loss };
}

/**
 * 선 위 전류 알갱이의 x 자리. 길이 `length` 인 선 위에 밀도 `density`(월드당 개수)로 놓고
 * 빠르기 `speed` 로 흘린다(음수면 x 가 줄어드는 쪽으로). 시각 `t` 의 함수라 같은 시각은 같은 자리다.
 */
export function carrierXs(from: number, length: number, density: number, speed: number, t: number): number[] {
  const n = Math.max(1, Math.round(length * density));
  const pitch = length / n;
  const shift = (((speed * t) % pitch) + pitch) % pitch;
  const out: number[] = [];
  for (let k = 0; k < n; k++) out.push(from + shift + k * pitch);
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PowerTransmissionState }): PowerTransmissionState {
  return params.state;
}
