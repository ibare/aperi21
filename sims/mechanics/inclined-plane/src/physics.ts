// ========================================================================
// inclined-plane — 순수 계산
// ========================================================================
// 성분 분해는 면 방향 단위벡터 하나로 끝난다. 여기가 하는 일은 셋이다.
//
// 1. 두 단계의 진행도에서 **자동 진행의 각**을 만든다 (scene 과 step 이 함께 쓴다).
// 2. 각에서 빗면 · 물체 · 세 힘의 자리를 계산한다 (`geometry`).
// 3. 슬라이더를 잡고 놓는 것에 따라 독자의 각을 자동 진행에 섞는다 (`step`).
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import {
  ANGLE_MAX_DEG,
  ANGLE_MIN_DEG,
  BLOCK_S,
  BLOCK_SIZE,
  G_LEN,
  RETURN_TIME,
  RETURN_WAIT,
  SLOPE_LEN,
  inclinedPlaneSchema,
} from './schema';
import type { InclinedPlaneState } from './state';

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * 자동 진행의 각(도). `steepen`·`flatten` 진행도에서 원본 `35 − 25·cos` 를 만든다.
 * `k` 가 0 → 1 → 0 으로 오가고, 각은 그 위에 코사인 반주기를 입힌 모양이다.
 */
export function swingAngle(steepen: number, flatten: number): number {
  const k = clamp01(steepen - flatten);
  return ANGLE_MIN_DEG + ((ANGLE_MAX_DEG - ANGLE_MIN_DEG) * (1 - Math.cos(Math.PI * k))) / 2;
}

/**
 * 시계에서 자동 진행의 각. **선언된 시간표를 읽는다** — 엔진의 `TimelineFrame` 과
 * 같은 규칙(주기 = 단계 길이의 합, 단계 전 0 · 동안 선형 · 뒤 1)이다.
 */
export function autoAngleAt(clock: number): number {
  const phases = inclinedPlaneSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0)) return ANGLE_MIN_DEG;
  const u = clock - Math.floor(clock / period) * period;
  const at: Record<string, number> = {};
  let start = 0;
  for (const p of phases) {
    at[p.id] = clamp01((u - start) / p.duration);
    start += p.duration;
  }
  return swingAngle(at.steepen ?? 0, at.flatten ?? 0);
}

/** 화면에 그릴 각(도). 독자의 각이 남아 있으면 그만큼 섞는다. 원본 `draw()` 첫 줄. */
export function displayAngle(state: InclinedPlaneState, auto: number): number {
  return state.weight > 0 ? auto + (state.manual - auto) * state.weight : auto;
}

export interface InclineGeometry {
  /** 빗면 꼭대기. */
  top: Vec2;
  /** 꼭대기 아래 바닥. */
  foot: Vec2;
  /** 물체 중심 — 세 힘의 꼬리. */
  center: Vec2;
  /** 물체 회전(라디안, 반시계). */
  orientation: number;
  /** 중력. 길이 `G_LEN` 고정. */
  gravity: Vec2;
  /** 면에 나란한 성분 (빗면 아래쪽). */
  parallel: Vec2;
  /** 면에 수직인 성분 (면 속으로). */
  normal: Vec2;
}

/** 각(도)에서 장면의 자리. 꼭짓점이 원점, y 위가 +. */
export function geometry(deg: number): InclineGeometry {
  const th = (deg * Math.PI) / 180;
  const s = Math.sin(th);
  const c = Math.cos(th);
  // 꼭짓점에서 빗면 위쪽 (-c, s), 면 바깥 (s, c), 빗면 아래쪽 (c, -s), 면 속 (-s, -c).
  const half = BLOCK_SIZE[1] / 2;
  return {
    top: [-c * SLOPE_LEN, s * SLOPE_LEN],
    foot: [-c * SLOPE_LEN, 0],
    center: [-c * BLOCK_S + s * half, s * BLOCK_S + c * half],
    orientation: -th,
    gravity: [0, -G_LEN],
    parallel: [c * G_LEN * s, -s * G_LEN * s],
    normal: [-s * G_LEN * c, -c * G_LEN * c],
  };
}

/**
 * 한 걸음. 원본 `step()` 과 같은 섞기다.
 *
 * - 잡고 있는 동안: 슬라이더 값이 독자의 각이 되고 섞기는 1.
 * - 놓은 뒤: `RETURN_WAIT` 초 기다렸다가 `RETURN_TIME` 초에 걸쳐 섞기를 0 으로.
 * - 섞기가 0 이면 슬라이더가 자동 진행의 각을 따라간다.
 */
export function step(params: { state: InclinedPlaneState; dt: number }): InclinedPlaneState {
  const { state, dt } = params;
  const clock = state.clock + dt;
  let { manual, weight, idle, slider } = state;
  if (state.held) {
    manual = slider;
    weight = 1;
    idle = 0;
  } else if (weight > 0) {
    idle += dt;
    if (idle > RETURN_WAIT) weight = Math.max(0, weight - dt / RETURN_TIME);
  }
  if (weight === 0) slider = Math.round(autoAngleAt(clock));
  return { clock, slider, manual, weight, idle, held: state.held };
}
