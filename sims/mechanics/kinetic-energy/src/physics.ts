// ========================================================================
// kinetic-energy — 순수 물리
// ========================================================================
// 등감속 운동 하나뿐이다. 상자가 거친 바닥에 들어간 뒤로는
//   x = v·s − ½·a·s²,  속력 = v − a·s  (s 는 들어간 뒤 흐른 시간, 멈추면 고정)
// 이고, 멈출 때까지 미끄러진 거리는 v²/2a 라서 속력의 **제곱**을 따라간다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DECEL, ROUGH_START, V_FAST, V_SLOW } from './schema';
import type { KineticEnergyState } from './state';

export interface KineticEnergyConstants {
  /** 거친 바닥이 주는 감속(m/s²). 두 상자가 같다. */
  decel: number;
  /** 위 · 아래 레인의 진입 속력(m/s). */
  vSlow: number;
  vFast: number;
}

export function readConstants(stage: StageDef): KineticEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { decel: c.decel ?? DECEL, vSlow: c.vSlow ?? V_SLOW, vFast: c.vFast ?? V_FAST };
}

export interface BoxReading {
  /** 상자 중심의 월드 x. */
  x: number;
  /** 지금 속력(m/s). 멈추면 0. */
  speed: number;
  /** 거친 바닥 위를 미끄러지는 중인가 — 마찰 화살표를 그릴 조건이다. */
  sliding: boolean;
  /** 멈췄는가 — 미끄러진 거리를 재는 치수선을 그릴 조건이다. */
  stopped: boolean;
  /** 거친 바닥에 들어간 뒤 지나온 거리(m). 0 이면 아직 들어가지 않았다. */
  slid: number;
}

/**
 * 상자 하나를 읽는다. **단계 경계는 선언이 정한다** — 들어오는 동안의 길이도, 그것이
 * 끝나는 시각도 `timeline` 에게 묻는다 (S-piece 「시간표는 선언이다」). 모듈 상수와
 * 견주어 단계를 가르면 저작자가 `enter` 를 늘여도 물리가 따라가지 않는다.
 *
 * 들어오는 시간을 두 상자가 함께 쓰므로 둘은 **같은 순간** 거친 바닥에 닿는다 —
 * 진입 시각이 다르면 「같은 시간에 얼마나 갔나」 를 견줄 수 없다. 그래서 들어오는
 * 자리를 「남은 진입 시간 × 진입 속력」 으로 되짚는다. 분기가 필요 없다: 들어오는
 * 동안은 미끄러진 거리가 0 이고, 들어간 뒤에는 남은 진입 시간이 0 이다.
 */
export function readBox(
  tl: TimelineFrame,
  entrySpeed: number,
  c: KineticEnergyConstants,
): BoxReading {
  const stopTime = entrySpeed / c.decel;
  // 들어오는 동안 남은 시간(초). `at` 은 그 단계 전 0 · 동안 0~1 · 뒤 1 이다.
  const remaining = tl.duration('enter') * (1 - tl.at('enter'));
  // 거친 바닥에 들어간 뒤 흐른 시간. 단계가 끝나는 시각도 선언이 안다.
  const elapsed = Math.max(0, tl.u - tl.end('enter'));
  const s = Math.min(elapsed, stopTime);
  const slid = entrySpeed * s - 0.5 * c.decel * s * s;
  // 멈춤은 **물리**가 정한다 — 단계 경계가 아니라 v/a 다.
  const stopped = elapsed >= stopTime;
  return {
    x: ROUGH_START - entrySpeed * remaining + slid,
    speed: Math.max(0, entrySpeed - c.decel * s),
    sliding: elapsed > 0 && !stopped,
    stopped,
    slid,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 상자를 지우고 다시 들여보낸다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: KineticEnergyState }): KineticEnergyState {
  return params.state;
}
