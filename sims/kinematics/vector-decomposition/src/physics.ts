// ========================================================================
// vector-decomposition — 순수 계산
// ========================================================================
// 성분 분해 자체는 계산할 것이 없다 — 끝점 (x, y) 의 발이 (x, 0) 과 (0, y) 다.
// 여기가 하는 일은 둘이다.
//
// 1. 주기 번호와 돌아가는 정도에서 **자동 화살표**를 고른다 (scene 과 step 이 함께 쓴다).
// 2. 손잡이가 설 자리를 상태에 적는다. 조작기는 상태 경로만 읽고 `step` 은
//    `TimelineFrame` 을 받지 않으므로, 선언된 단계 길이를 여기서 직접 읽어 시계에서
//    주기 번호와 `turn` 진행도를 다시 계산한다 (NOTES 「어휘 부족」 1). 단계 길이를
//    상수로 옮겨 오지 않는다 — 선언을 읽는다.
// ========================================================================

import type { TimelineEase, Vec2 } from '@aperi21/schema';

import { MAX_R, MIN_TIP_Y, VECTORS, vectorDecompositionSchema } from './schema';
import type { VectorDecompositionState } from './state';

/** 자동 화살표를 고르는 데 필요한 두 값. `TimelineFrame` 의 `cycle` · `at('turn')` 과 같다. */
export interface AutoFrame {
  cycle: number;
  turn: number;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function ease(kind: TimelineEase | undefined, x: number): number {
  const k = clamp01(x);
  if (kind === 'smooth') return k * k * (3 - 2 * k);
  if (kind === 'inOutCubic') return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
  return k;
}

/** 주기 번호의 화살표(월드). 원본 `vecOf(i)`. */
export function vectorOf(i: number): Vec2 {
  const n = VECTORS.length;
  const v = VECTORS[((i % n) + n) % n] ?? { deg: 0, len: 1 };
  const r = v.len * MAX_R;
  const a = (v.deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

/**
 * 자동으로 도는 원래 화살표. 돌아가는 동안은 이번 화살표에서 다음 화살표로 각도와
 * 길이를 따로 보간한다 — 끝점을 곧게 옮기면 도는 것이 아니라 줄었다 늘어난다.
 */
export function autoTip(f: AutoFrame): Vec2 {
  const a = vectorOf(f.cycle);
  if (f.turn <= 0) return a;
  const b = vectorOf(f.cycle + 1);
  const aa = Math.atan2(a[1], a[0]);
  const ab = Math.atan2(b[1], b[0]);
  const ra = Math.hypot(a[0], a[1]);
  const rb = Math.hypot(b[0], b[1]);
  const ang = aa + (ab - aa) * f.turn;
  const r = ra + (rb - ra) * f.turn;
  return [r * Math.cos(ang), r * Math.sin(ang)];
}

/**
 * 시계에서 주기 번호와 `turn` 진행도를 계산한다. **선언된 시간표를 읽는다.**
 * 엔진의 `TimelineFrame` 과 같은 규칙(주기 = 단계 길이의 합, 단계 전 0 · 뒤 1)이다.
 */
export function frameAt(clock: number): AutoFrame {
  const phases = vectorDecompositionSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0)) return { cycle: 0, turn: 0 };
  const cycle = Math.floor(clock / period);
  const u = clock - cycle * period;
  let start = 0;
  for (const p of phases) {
    if (p.id === 'turn') return { cycle, turn: ease(p.ease, (u - start) / p.duration) };
    start += p.duration;
  }
  return { cycle, turn: 0 };
}

/**
 * 끌린 끝점을 쓸 수 있는 자리로 되돌린다. 원본 `setFromPointer()` 와 같은 순서 —
 * 먼저 최대 반지름으로 줄이고, 그 다음 원점 아래로 너무 내려가지 않게 자른다.
 */
export function settleTip(p: Vec2): Vec2 {
  let [x, y] = p;
  const L = Math.hypot(x, y);
  if (L > MAX_R) {
    x *= MAX_R / L;
    y *= MAX_R / L;
  }
  if (y < MIN_TIP_Y) y = MIN_TIP_Y;
  return [x, y];
}

/**
 * 한 걸음.
 *
 * 잡고 있는 동안은 조작기가 쓴 자리가 독자의 화살표가 된다. 놓아도 그 화살표를
 * 유지한다 — 원본도 `userVec` 을 지우지 않았다. 갈라짐·이어 붙임 주기는 그대로 돈다.
 */
export function step(params: { state: VectorDecompositionState; dt: number }): VectorDecompositionState {
  const { state, dt } = params;
  const clock = state.clock + dt;
  if (state.held) {
    const user = settleTip(state.tip);
    return { clock, tip: user, user, held: true };
  }
  const tip = state.user ?? autoTip(frameAt(clock));
  return { clock, tip, user: state.user, held: false };
}
