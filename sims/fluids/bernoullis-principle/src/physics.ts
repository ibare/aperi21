// ========================================================================
// bernoullis-principle — 순수 계산
// ========================================================================
// 벤투리관: 부피 흐름량이 일정한 이상 유체. 관 굵기 w(x) 에서 속도 u = u0 · W0 / w,
// 압력 수두 = 합 수두 − 속도 수두. 모든 길이는 원본 캔버스 px 다 (월드 변환은 scene).
// ========================================================================

import type { TimelineFrame } from '@aperi21/schema';

import { AUTO, EVEN_RATIO, LAYOUT, RELEASE, THROAT_MIN, THROAT_RANGE } from './schema';
import type { BernoullisPrincipleState } from './state';

/** 주기 안 시각 → 자동 굵기. 주기 첫머리가 가장 고른 관이다. */
export function autoRatioAt(u: number, period: number): number {
  return AUTO.mean + AUTO.swing * Math.cos((2 * Math.PI * u) / period);
}

/** 지금 화면의 좁은 곳 굵기 — 손댔으면 조작값, 아니면 시간표에서. */
export function currentRatio(state: BernoullisPrincipleState, tl: TimelineFrame): number {
  return state.manual ? state.ratio : autoRatioAt(tl.u, tl.period);
}

/** 좁아지는 모양 — 목 중심 평평한 구간 1, 경사 구간 smoothstep, 바깥 0. 원본 `bump`. */
function bump(x: number): number {
  const d = Math.abs(x - LAYOUT.xcPx);
  if (d <= LAYOUT.plateauPx) return 1;
  if (d >= LAYOUT.plateauPx + LAYOUT.rampPx) return 0;
  const s = 1 - (d - LAYOUT.plateauPx) / LAYOUT.rampPx;
  return s * s * (3 - 2 * s);
}

/** 관 굵기(px). */
export function tubeWidth(x: number, ratio: number): number {
  return LAYOUT.w0Px * (1 - (1 - ratio) * bump(x));
}

/** 유속(px/s). */
export function flowSpeed(x: number, ratio: number): number {
  return (LAYOUT.u0Px * LAYOUT.w0Px) / tubeWidth(x, ratio);
}

/** 속도 수두(px). */
export function velocityHead(x: number, ratio: number): number {
  const k = LAYOUT.w0Px / tubeWidth(x, ratio);
  return LAYOUT.vh0Px * k * k;
}

/** 압력 수두(px) — 중심선에서 물기둥 윗면까지. */
export function pressureHead(x: number, ratio: number): number {
  return LAYOUT.totalHeadPx - velocityHead(x, ratio);
}

/** 압력 수두의 범위 — **가장 좁은 관 기준으로 고정**한다. 조작값에 따라 명암이 흔들리지 않게. */
const HP_MAX = LAYOUT.totalHeadPx - LAYOUT.vh0Px;
const HP_MIN = LAYOUT.totalHeadPx - LAYOUT.vh0Px / (THROAT_MIN * THROAT_MIN);

/** 압력 수두 → 0(가장 낮음)~1(가장 높음). 원본 `waterColor` 의 f. */
export function pressureLevel(hp: number): number {
  return Math.max(0, Math.min(1, (hp - HP_MIN) / (HP_MAX - HP_MIN)));
}

/** 유리관 자리(px). */
export function stations(): number[] {
  return Array.from({ length: LAYOUT.stationCount }, (_, i) => LAYOUT.stationX0Px + i * LAYOUT.stationGapPx);
}

/**
 * 물감 띠의 가로 자리(px). 원본 `stripPositions` 그대로.
 *
 * 지금 관 모양에서 목 중심까지 걸리는 시간 τ(x) 로 자리를 정한다. 띠 간격 = 그 자리 유속 ×
 * RELEASE 가 언제나 성립해, 간격이 곧 지금의 빠르기다. (관 모양이 바뀐 이력을 적분하면 고른
 * 관에서도 간격이 들쭉날쭉 남아 캡션과 어긋난다 — 원본 NOTES (b).)
 */
export function stripPositions(t: number, ratio: number): number[] {
  const xs: number[] = [];
  const taus: number[] = [];
  let tau = 0;
  for (let x = LAYOUT.xInPx; x <= LAYOUT.xOutPx; x += 2) {
    taus.push(tau);
    tau += 2 / flowSpeed(x + 1, ratio);
  }
  const iC = Math.round((LAYOUT.xcPx - LAYOUT.xInPx) / 2);
  const off = taus[iC]!;
  let prev = Math.floor((taus[0]! - off - t) / RELEASE);
  for (let i = 1; i < taus.length; i++) {
    const cur = Math.floor((taus[i]! - off - t) / RELEASE);
    if (cur !== prev) {
      const target = Math.max(cur, prev) * RELEASE + t + off;
      const f = (target - taus[i - 1]!) / (taus[i]! - taus[i - 1]!);
      xs.push(LAYOUT.xInPx + (i - 1 + f) * 2);
      prev = cur;
    }
  }
  return xs;
}

/**
 * 한 걸음. 잡는 순간 자동을 멈추고(원본: 한 번 만지면 자동 변화가 멈춘다), 자동 중에는
 * 손잡이가 지금 굵기를 따라가게 조작값을 자동 값으로 덮는다.
 */
export function step(params: { state: BernoullisPrincipleState; dt: number }): BernoullisPrincipleState {
  const { state, dt } = params;
  const clock = state.clock + dt;
  const manual = state.manual || state.held;
  const ratio = manual
    ? Math.max(THROAT_RANGE[0], Math.min(THROAT_RANGE[1], state.ratio))
    : autoRatioAt(clock % AUTO.period, AUTO.period);
  return {
    clock,
    ratio,
    held: state.held,
    manual,
    manualEven: manual && ratio >= EVEN_RATIO,
    manualNarrow: manual && ratio < EVEN_RATIO,
  };
}
