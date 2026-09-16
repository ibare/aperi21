// ========================================================================
// position-time-graph — 순수 물리
// ========================================================================
// 등속이다. 높이 = 빠르기 × 시간, 꼭대기(1)에서 멈춘다. 그 한 줄이 전부이고,
// 나머지는 **지나온 것을 남기는 일**이다 — 0.05 초마다의 표본과 정수 초의 자국.
//
// 판의 경계는 `schema.timeline` 이 선언한 길이에서 다시 센다. `step` 은
// `TimelineFrame` 을 받지 못하기 때문이다 (NOTES 「어휘 부족」).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { CYCLE, ROUND_SPAN, RUN, SAMPLE, V_FAST, V_SLOW } from './schema';
import { freshLane, type LaneState, type PositionTimeGraphState } from './state';

function mod(x: number, m: number): number {
  return ((x % m) + m) % m;
}

/**
 * 한 통로를 한 걸음. 높이를 적분하고, 표본과 자국을 남긴다.
 *
 * 표본은 `SAMPLE` 마다만 남긴다 — 매 프레임 남기면 자취가 프레임률을 따라간다.
 * 자국은 정수 초를 **지나는 걸음**에 한 번, 그 순간의 높이로 남는다.
 */
function advance(lane: LaneState, dt: number, prevT: number, nextT: number): LaneState {
  const pos = Math.min(1, lane.pos + lane.v * dt);
  let trail = lane.trail;
  const last = trail[trail.length - 1];
  if (!last || nextT - last[0] >= SAMPLE) trail = [...trail, [nextT, pos] as Vec2];
  let ticks = lane.ticks;
  if (Math.floor(nextT) > Math.floor(prevT)) {
    ticks = [...ticks, [Math.floor(nextT), pos] as Vec2];
  }
  return { ...lane, pos, trail, ticks };
}

/** 이번 판에 쓸 두 빠르기. 둘째 판에서 서로 맞바꾼다 — 그 맞바꿈이 이 조각의 증명이다. */
export function speedsOfRound(round: number): readonly [number, number] {
  return round === 0 ? [V_SLOW, V_FAST] : [V_FAST, V_SLOW];
}

/** 꼭대기에 닿았거나 주행이 끝났는가. 수동 진행이 스스로 다시 시작하는 조건이다. */
function finished(s: PositionTimeGraphState): boolean {
  return s.tr >= RUN || s.a.pos >= 1 || s.b.pos >= 1;
}

export function step(params: {
  state: PositionTimeGraphState;
  dt: number;
}): PositionTimeGraphState {
  const { dt } = params;
  const t = params.state.t + dt;
  // 손을 대는 순간 주도권이 넘어오고, 놓아도 돌아가지 않는다. 자동이 판을 지우며
  // 빠르기를 되돌리면 독자가 방금 올린 손잡이가 저 혼자 제자리로 간다.
  const manual = params.state.manual || params.state.heldA || params.state.heldB;
  let s: PositionTimeGraphState = { ...params.state, t, manual };

  if (manual) {
    if (finished(s)) {
      // 빠르기는 손잡이가 쥔 값 그대로 가져간다.
      s = { ...s, round: -1, tr: 0, a: freshLane(s.a.v), b: freshLane(s.b.v) };
    } else {
      s = { ...s, round: -1 };
    }
    const tr = s.tr + dt;
    return { ...s, tr, a: advance(s.a, dt, s.tr, tr), b: advance(s.b, dt, s.tr, tr) };
  }

  const tc = mod(t, CYCLE);
  const round = tc < ROUND_SPAN ? 0 : 1;
  const inRound = tc - round * ROUND_SPAN;
  if (round !== s.round) {
    const [va, vb] = speedsOfRound(round);
    s = { ...s, round, tr: 0, a: freshLane(va), b: freshLane(vb) };
  }
  // 주행이 끝나면 더 적분하지 않는다 — 유지와 지우기 동안 그래프는 그대로 있다.
  if (inRound >= RUN) return s;
  const tr = s.tr + dt;
  return { ...s, tr, a: advance(s.a, dt, s.tr, tr), b: advance(s.b, dt, s.tr, tr) };
}
