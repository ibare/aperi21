// ========================================================================
// newtons-first-law — 순수 물리
// ========================================================================
// 한 문장으로: **제동은 버스에만 걸린다.** 승객에게 걸리는 수평힘은 바닥과의
// 마찰뿐이고, 그것이 0 이면 승객의 가속도는 0 이라 속도가 그대로다. 앞칸에 닿는
// 순간에야 승객에게 처음으로 힘이 걸린다.
//
// 적분은 원본(tasks/piece-lab/newtons-first-law/index.html)의 `step` 을 그대로 옮긴
// 것이다. 단위만 월드로 바뀌었다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import {
  A_BRAKE,
  CYCLE,
  FRIC_MAX,
  REF,
  REL_EPS,
  SAMPLE_DT,
  SAMPLE_MOVE,
  T_BRAKE,
  px,
} from './schema';
import { freshState, type NewtonsFirstLawState, type Sample } from './state';

/** 조작기 값(0~100) → 승객에게 걸리는 마찰 가속도. */
export function frictionAccel(friction: number): number {
  return (Math.max(0, Math.min(100, friction)) / 100) * FRIC_MAX;
}

/** 앞칸 칸막이의 x. 승객이 결국 닿게 되는 벽이다. */
export function wallX(busX: number): number {
  return busX + px(REF.wallDx);
}

/** 접촉 표시의 나이(초). 아직 닿지 않았으면 `null`. */
export function impactAge(state: NewtonsFirstLawState): number | null {
  return state.hitAt < 0 ? null : state.e - state.hitAt;
}

export function step(params: {
  state: NewtonsFirstLawState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): NewtonsFirstLawState {
  const s = params.state;
  const dt = params.dt;
  const e = s.e + dt;

  // 사이클이 끝나면 처음으로 돌아간다. 조각은 문단 옆에 늘 놓여 있어서 끝난
  // 화면이 남으면 할 말을 멈춘 것이 된다 (S-piece).
  if (e >= CYCLE) return freshState(s.friction);

  // ---- 버스 — 제동은 여기에만 걸린다 ----
  let ab = 0;
  if (e >= T_BRAKE && s.busV > 0) ab = -A_BRAKE;
  let busV = s.busV + ab * dt;
  if (busV < 0) {
    busV = 0;
    ab = 0;
  }
  const busX = s.busX + busV * dt;
  const wheel = s.wheel + (busV * dt) / px(REF.wheelR);

  // ---- 승객 — 바닥과의 마찰만이 승객에게 걸리는 유일한 수평힘이다 ----
  const f = frictionAccel(s.friction);
  const rel = s.riderV - busV;
  let riderV: number;
  if (Math.abs(rel) > REL_EPS) {
    // 미끄러지는 중 — 마찰이 상대속도를 줄이는 쪽으로 걸린다.
    riderV = s.riderV + (rel > 0 ? -f : f) * dt;
  } else {
    // 미끄러지지 않는 동안 — 마찰이 감당할 수 있는 만큼만 버스를 따라 선다.
    riderV = busV + (Math.abs(ab) <= f ? ab : -f) * dt;
  }
  if (riderV < 0) riderV = 0;
  let riderX = s.riderX + riderV * dt;

  // ---- 앞칸 — 여기 닿고서야 승객에게 처음으로 힘이 걸린다 ----
  let hitAt = s.hitAt;
  const wall = wallX(busX);
  if (riderX + px(REF.riderHalf) >= wall) {
    riderX = wall - px(REF.riderHalf);
    riderV = busV;
    if (hitAt < 0) hitAt = e;
  }

  // ---- 자취 — 0.3 초마다 한 쌍 ----
  let samples = s.samples;
  let nextSample = s.nextSample;
  if (e >= nextSample) {
    const last = samples[samples.length - 1];
    const mark = busX + px(REF.markDx);
    // 같은 자리에 겹쳐 찍지 않는다 — 멎은 뒤로 점이 쌓이면 진해지기만 한다.
    const moved =
      !last || Math.abs(mark - last.bus) > SAMPLE_MOVE || Math.abs(riderX - last.rider) > SAMPLE_MOVE;
    if (moved) {
      const next: Sample = { bus: mark, rider: riderX };
      samples = [...samples, next];
    }
    nextSample += SAMPLE_DT;
  }

  // ---- 캡션이 볼 조건 ----
  // 선언은 `when: 'hitWall'` 처럼 **이름**만 가리킨다. 부정·비교·논리 결합을
  // 선언에 넣지 않기 위해 여기서 계산해 둔다 (원칙 2).
  //
  // 순서는 원본 `captionText()` 의 if 사슬 그대로다. 제동 전에는 셋 다 거짓이라
  // 단계의 문장("같은 속도로 간다")이 이긴다.
  const braking = e >= T_BRAKE;
  const hitWall = hitAt >= 0;
  const stoppedTogether =
    braking && f > 0 && busV <= REL_EPS && Math.abs(riderV - busV) <= REL_EPS;
  const gripping = braking && f > 0 && !hitWall;

  return {
    e,
    busX,
    busV,
    wheel,
    riderX,
    riderV,
    samples,
    nextSample,
    hitAt,
    friction: s.friction,
    hitWall,
    gripping,
    stoppedTogether,
  };
}
