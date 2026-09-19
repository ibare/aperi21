// ========================================================================
// thermistor-and-ldr — 순수 물리
// ========================================================================
// 분압기 — 레일 전압 V 가 소자(위, 저항 Rs)와 고정 저항(아래, R)에 나뉘어 걸린다. 같은 전류가 둘을
// 지나므로 고정 저항 양단의 출력 전압은 V·R/(R + Rs) 다. Rs 가 내려가면 출력이 오른다.
//
// 써미스터(NTC)는 데우면, 광저항(LDR)은 빛을 받으면 저항이 내려간다. 두 소자 모두 저항이 온도 ·
// 조도에 대해 곱셈꼴로(지수 · 거듭제곱) 변하므로 두 표본 사이를 **로그 눈금에서 곧게**(기하 보간) 잇는다.
// 출력 전압계는 이상적이라 전류를 먹지 않는다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BAR_PER_KOHM,
  LDR_R_BRIGHT,
  LDR_R_DARK,
  METER_DIGITS,
  METER_TICK,
  OUT_BRIGHT,
  OUT_COLD,
  OUT_DARK,
  OUT_HOT,
  PHOTONS_PER_RAY,
  PHOTON_SPEED,
  RAYS_BRIGHT,
  RAYS_DARK,
  R_FIXED,
  TEMP_COLD,
  TEMP_HOT,
  THERM_R_COLD,
  THERM_R_HOT,
  VOLTS,
} from './schema';
import type { ThermistorAndLdrState } from './state';

/** 광선마다 출발을 어긋나게 두는 몫 — 황금비의 소수부. 이웃 광선의 알갱이가 나란히 서지 않는다. */
const GOLDEN = 0.618034;

export interface ThermistorAndLdrConstants {
  /** 레일 전압(V) · 고정 저항(kΩ). */
  volts: number;
  rFixed: number;
  /** 써미스터 표본 — 온도(°C)와 저항(kΩ). */
  tempCold: number;
  tempHot: number;
  thermRCold: number;
  thermRHot: number;
  /** 광저항 표본 — 닿는 광선 수와 저항(kΩ). */
  raysDark: number;
  raysBright: number;
  ldrRDark: number;
  ldrRBright: number;
  /** 표본마다 출력 전압계가 읽는 값(V) — 바늘의 정박값. */
  outCold: number;
  outHot: number;
  outDark: number;
  outBright: number;
  /** 저항 1 kΩ 의 막대 길이(월드). */
  barPerKohm: number;
  /** 전압계 눈금 간격(V) · 지금 값 글자의 소수 자릿수. */
  meterTick: number;
  meterDigits: number;
  /** 광선 하나에 떠 있는 알갱이 수 · 초당 광선 길이의 몇 몫을 가는지. */
  photonsPerRay: number;
  photonSpeed: number;
}

export function readConstants(stage: StageDef): ThermistorAndLdrConstants {
  const c = stage.constants ?? {};
  return {
    volts: c.volts ?? VOLTS,
    rFixed: c.rFixed ?? R_FIXED,
    tempCold: c.tempCold ?? TEMP_COLD,
    tempHot: c.tempHot ?? TEMP_HOT,
    thermRCold: c.thermRCold ?? THERM_R_COLD,
    thermRHot: c.thermRHot ?? THERM_R_HOT,
    raysDark: c.raysDark ?? RAYS_DARK,
    raysBright: c.raysBright ?? RAYS_BRIGHT,
    ldrRDark: c.ldrRDark ?? LDR_R_DARK,
    ldrRBright: c.ldrRBright ?? LDR_R_BRIGHT,
    outCold: c.outCold ?? OUT_COLD,
    outHot: c.outHot ?? OUT_HOT,
    outDark: c.outDark ?? OUT_DARK,
    outBright: c.outBright ?? OUT_BRIGHT,
    barPerKohm: c.barPerKohm ?? BAR_PER_KOHM,
    meterTick: c.meterTick ?? METER_TICK,
    meterDigits: c.meterDigits ?? METER_DIGITS,
    photonsPerRay: c.photonsPerRay ?? PHOTONS_PER_RAY,
    photonSpeed: c.photonSpeed ?? PHOTON_SPEED,
  };
}

/** 한 소자의 지금 — 표본 사이 몫(0 = 차가움 · 어두움, 1 = 뜨거움 · 밝음), 저항(kΩ), 출력 전압(V). */
export interface SensorNow {
  x: number;
  r: number;
  out: number;
}

/** 써미스터가 데워진 몫. 데움 단계의 진행도에서 식힘 단계의 진행도를 뺀다 — 쉬는 단계에서는 0 이나 1 이다. */
export function heatFraction(tl: TimelineFrame): number {
  return tl.at('heat') - tl.at('cool');
}

/** 광저항이 밝아진 몫. 빛 늘림 단계의 진행도에서 빛 줄임 단계의 진행도를 뺀다. */
export function lightFraction(tl: TimelineFrame): number {
  return tl.at('brighten') - tl.at('dim');
}

/** 두 표본 사이 저항 — 로그 눈금에서 곧게(기하 보간). */
export function resistanceBetween(r0: number, r1: number, x: number): number {
  return r0 * Math.pow(r1 / r0, x);
}

/** 분압기 출력 — 고정 저항 양단 전압(V). */
export function dividerOut(volts: number, rFixed: number, rSensor: number): number {
  return (volts * rFixed) / (rFixed + rSensor);
}

/**
 * 바늘이 읽는 값(V). 멈춘 자리에서는 **선언한 정박값 그대로**이고(x = 0 → `out0`, x = 1 → `out1`),
 * 그 사이는 분압 곡선이 오르는 모양을 따라 옮긴다. 정박값이 분압과 맞으면(기본값) 곧 분압 값 자체다.
 */
function needleBetween(
  c: ThermistorAndLdrConstants,
  r0: number,
  r1: number,
  out0: number,
  out1: number,
  x: number,
): number {
  if (x <= 0) return out0;
  if (x >= 1) return out1;
  const d0 = dividerOut(c.volts, c.rFixed, r0);
  const d1 = dividerOut(c.volts, c.rFixed, r1);
  const dx = dividerOut(c.volts, c.rFixed, resistanceBetween(r0, r1, x));
  const s = d1 === d0 ? x : (dx - d0) / (d1 - d0);
  return out0 + (out1 - out0) * s;
}

export function thermistorNow(tl: TimelineFrame, c: ThermistorAndLdrConstants): SensorNow {
  const x = heatFraction(tl);
  return {
    x,
    r: resistanceBetween(c.thermRCold, c.thermRHot, x),
    out: needleBetween(c, c.thermRCold, c.thermRHot, c.outCold, c.outHot, x),
  };
}

export function ldrNow(tl: TimelineFrame, c: ThermistorAndLdrConstants): SensorNow {
  const x = lightFraction(tl);
  return {
    x,
    r: resistanceBetween(c.ldrRDark, c.ldrRBright, x),
    out: needleBetween(c, c.ldrRDark, c.ldrRBright, c.outDark, c.outBright, x),
  };
}

/**
 * 광선마다 보이는 정도(0~1). 닿는 광선 수가 표본 사이에서 곧게 늘어나고, 새 광선은 한 줄씩 차오른다.
 * 광선 수 자체가 빛의 양이다 — 색으로 칠하지 않는다.
 */
export function rayOpacities(c: ThermistorAndLdrConstants, x: number): number[] {
  const n = Math.max(0, Math.round(Math.max(c.raysDark, c.raysBright)));
  const lit = c.raysDark + (c.raysBright - c.raysDark) * x;
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.min(1, Math.max(0, lit - i)));
  return out;
}

/**
 * 광선 위 알갱이의 자리 — 광선 길이의 몫(0 = 등, 1 = 광저항). 시각의 함수라 같은 시각은 같은 자리다.
 * 광선마다 출발을 어긋나게 둔다(황금비 몫) — 난수가 아니라 광선 번호에서 정한다.
 */
export function photonFractions(c: ThermistorAndLdrConstants, t: number, ray: number): number[] {
  const out: number[] = [];
  const k = Math.max(1, Math.round(c.photonsPerRay));
  for (let j = 0; j < k; j++) {
    const s = t * c.photonSpeed + j / k + ray * GOLDEN;
    out.push(s - Math.floor(s));
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ThermistorAndLdrState }): ThermistorAndLdrState {
  return params.state;
}
