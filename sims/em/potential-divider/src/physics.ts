// ========================================================================
// potential-divider — 순수 물리
// ========================================================================
// 굵기가 고른 저항선 하나가 전지에 걸려 있다. 저항은 길이에 비례하고 선을 따라 흐르는 전류는
// 어디서나 같으므로, 전위는 B(0 V)에서 A(전지 전압)까지 **길이에 비례해 고르게** 오른다.
// 접점이 B 에서 잰 길이의 몫 f 에 서면 R₂ = f·R, R₁ = (1 − f)·R 이고 B 와 접점 사이 전압은
// V₂ = V·R₂/(R₁ + R₂) = V·f 다. 전압계는 이상적이라(전류를 먹지 않는다) 나눔을 흐트러뜨리지 않는다 —
// 부하가 나눔을 어긋나게 하는 일은 이 조각이 다루지 않는다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  METER_DIGITS,
  METER_TICK,
  STOP_1,
  STOP_2,
  STOP_3,
  VOLTS,
  VOLT_HEIGHT,
} from './schema';
import type { PotentialDividerState } from './state';

export interface PotentialDividerConstants {
  /** 전지 전압(V). */
  volts: number;
  /** 접점이 멈추는 세 자리에서 전압계가 읽는 V₂(V). */
  stop1: number;
  stop2: number;
  stop3: number;
  /** 전위 1 V 가 판에서 차지하는 높이(월드). */
  voltHeight: number;
  /** 전압계 눈금 간격(V) · 지금 값 글자의 소수 자릿수. */
  meterTick: number;
  meterDigits: number;
}

export function readConstants(stage: StageDef): PotentialDividerConstants {
  const c = stage.constants ?? {};
  return {
    volts: c.volts ?? VOLTS,
    stop1: c.stop1 ?? STOP_1,
    stop2: c.stop2 ?? STOP_2,
    stop3: c.stop3 ?? STOP_3,
    voltHeight: c.voltHeight ?? VOLT_HEIGHT,
    meterTick: c.meterTick ?? METER_TICK,
    meterDigits: c.meterDigits ?? METER_DIGITS,
  };
}

/**
 * 지금 전압계가 읽는 V₂(V). 세 이동 단계의 진행도를 차례로 더한다 — 이동 전에는 0, 뒤에는 1 이라
 * 멈춘 단계에서는 정박값이 그대로 나온다(주기 첫머리 = `stop1`, `move-12` 뒤 = `stop2`, …).
 */
export function tappedVolts(tl: TimelineFrame, c: PotentialDividerConstants): number {
  return (
    c.stop1 +
    (c.stop2 - c.stop1) * tl.at('move-12') +
    (c.stop3 - c.stop2) * tl.at('move-23') +
    (c.stop1 - c.stop3) * tl.at('back')
  );
}

/** 접점이 선 위에 선 자리 — B 에서 잰 길이의 몫(0 ~ 1). 고른 선이라 V₂ / V 와 같다. */
export function contactFraction(v2: number, c: PotentialDividerConstants): number {
  return Math.min(1, Math.max(0, v2 / c.volts));
}

/** 선 위 몫 f 자리의 전위(V) — B 가 0 V. 고르게 오른다. */
export function potentialAlong(f: number, c: PotentialDividerConstants): number {
  return c.volts * f;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PotentialDividerState }): PotentialDividerState {
  return params.state;
}
