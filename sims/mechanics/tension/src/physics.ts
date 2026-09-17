// ========================================================================
// tension — 순수 물리
// ========================================================================
// 줄은 늘지 않고 질량이 없다. 저울 셋은 똑같은 용수철이다. 줄 한 가닥이므로 어느
// 곳이든 장력은 손이 당기는 힘 F 와 같다.
//
//   저울 하나의 늘음      = F × PX_PER_N
//   수평 줄의 미끄러짐    = 수직 저울의 늘음 (줄이 도르래를 넘어 수평 쪽으로 온다)
//   손이 물러난 거리      = 세 저울 늘음의 합 = 3 × F × PX_PER_N
//
// 그림 속 모든 길이가 한 값 F 에서 나오므로 서로 어긋나지 않는다.
// ========================================================================

import type { EnvironmentDef, StageDef, TimelineEase, Vec2 } from '@aperi21/schema';
import {
  ANCHOR,
  CANVAS_W,
  F_MAX,
  FORCE_HIGH,
  FORCE_LOW,
  FORCE_MID,
  FORCE_START,
  HOOK_R,
  PULLEY,
  PX,
  PX_PER_N,
  RELEASE_BLEND,
  ROD_LEN,
  ROPE_A,
  ROPE_B,
  ROPE_C,
  ROPE_D,
  ROPE_TOP_Y,
  SPRING_REST,
  tensionSchema,
  world,
} from './schema';
import type { TensionState } from './state';

export interface TensionConstants {
  forceStart: number;
  forceHigh: number;
  forceLow: number;
  forceMid: number;
  forceMax: number;
  releaseBlend: number;
}

export function readConstants(stage: StageDef): TensionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    forceStart: c.forceStart ?? FORCE_START,
    forceHigh: c.forceHigh ?? FORCE_HIGH,
    forceLow: c.forceLow ?? FORCE_LOW,
    forceMid: c.forceMid ?? FORCE_MID,
    forceMax: c.forceMax ?? F_MAX,
    releaseBlend: c.releaseBlend ?? RELEASE_BLEND,
  };
}

type ForceKey = 'forceStart' | 'forceHigh' | 'forceLow' | 'forceMid';

/**
 * 시간표 단계마다 힘이 어디서 어디로 가는가 — 스테이지 상수 이름으로 가리킨다.
 * 단계의 길이 · 순서 · 이징은 선언(`schema.timeline`)에 있다.
 */
export const PHASE_FORCES: Record<string, readonly [ForceKey, ForceKey]> = {
  pull: ['forceStart', 'forceHigh'],
  holdHigh: ['forceHigh', 'forceHigh'],
  letOut: ['forceHigh', 'forceLow'],
  holdLow: ['forceLow', 'forceLow'],
  pullAgain: ['forceLow', 'forceMid'],
  holdMid: ['forceMid', 'forceMid'],
  settle: ['forceMid', 'forceStart'],
};

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/** 원본 smooth — 놓은 뒤 섞기에도 같은 곡선을 쓴다. */
const smooth = EASES.smooth;

/**
 * 시계 → 지금 단계와 이징한 진행도. **선언의 단계 목록을 읽는다** — 단계 경계를
 * 상수로 두지 않는다. 엔진의 시간표 계산과 같은 일을 하는 것은 `step` 이
 * `TimelineFrame` 을 받지 못해서다 (NOTES 「어휘 부족」).
 */
export function phaseAt(clock: number): { id: string; progress: number } {
  const phases = tensionSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0)) return { id: 'pull', progress: 0 };
  let u = ((clock % period) + period) % period;
  for (const p of phases) {
    if (u < p.duration) {
      const ease = EASES[p.ease ?? 'linear'];
      return { id: p.id, progress: ease(Math.min(1, Math.max(0, u / p.duration))) };
    }
    u -= p.duration;
  }
  const last = phases[phases.length - 1]!;
  return { id: last.id, progress: 1 };
}

/** 대본이 그 시각에 손에 거는 힘(N). 원본 autoForce. */
export function scriptedForce(clock: number, c: TensionConstants): number {
  const { id, progress } = phaseAt(clock);
  const [from, to] = PHASE_FORCES[id] ?? ['forceStart', 'forceStart'];
  return c[from] + (c[to] - c[from]) * progress;
}

/** 화면의 모든 눈금 글자·캡션이 읽는 값. 원본 `Math.round(F)`. */
export function readingOf(force: number): string {
  return String(Math.round(force));
}

// ------------------------------------------------------------------------
// 줄 길이 보존 — 원본 논리 좌표(px, y 아래)로 계산한다. 월드로 옮기는 것은 scene.
// ------------------------------------------------------------------------

/** 저울 하나의 전체 길이(윗고리 가운데 → 아랫고리 가운데). 원본 scaleLen. */
export function scaleLength(force: number): number {
  return SPRING_REST + force * PX_PER_N + ROD_LEN + 2 * HOOK_R;
}

export interface RopeLayout {
  /** 저울 하나의 전체 길이. */
  s: number;
  /** 저울 2 의 오른쪽(도르래 쪽) 고리 · 왼쪽 고리. */
  s2Right: number;
  s2Left: number;
  /** 저울 1 의 오른쪽 고리 · 왼쪽 고리. */
  s1Right: number;
  s1Left: number;
  /** 손이 쥔 줄 끝. */
  handX: number;
  /** 저울 3 의 위 고리 · 아래 고리(y). */
  s3Top: number;
  s3Bottom: number;
}

/** 힘 하나에서 줄 위 모든 자리를 계산한다. 원본 render 머리의 계산 그대로. */
export function ropeLayout(force: number): RopeLayout {
  const s = scaleLength(force);
  // 수직 저울이 늘어난 만큼 줄이 도르래를 넘어 수평 쪽으로 미끄러진다.
  const s2Right = PULLEY.x - (ROPE_A + force * PX_PER_N);
  const s2Left = s2Right - s;
  const s1Right = s2Left - ROPE_B;
  const s1Left = s1Right - s;
  const handX = s1Left - ROPE_C;
  const s3Bottom = ANCHOR.y - ROPE_D;
  const s3Top = s3Bottom - s;
  return { s, s2Right, s2Left, s1Right, s1Left, handX, s3Top, s3Bottom };
}

/** 주먹 가로 가운데가 줄 끝에서 떨어진 거리(px). 원본 주먹 사각형 handX − 18 ~ handX + 4. */
export const FIST_CENTER_DX = -7;

/** 조작기 손잡이 — 주먹 가운데(월드). */
export function handleAt(force: number): Vec2 {
  return world(ropeLayout(force).handX + FIST_CENTER_DX, ROPE_TOP_Y);
}

/** 힘이 0 일 때 손이 서 있던 자리(px). 원본 HAND_X0. */
const HAND_X0 = ropeLayout(0).handX;

/**
 * 손잡이의 가로 자리 → 힘. 원본 forceAt — 물러난 거리 / (3 × PX_PER_N), 0 ~ F_MAX.
 * 세로는 보지 않는다(가로 투영). 손잡이는 주먹 가운데라 줄 끝과의 차이를 되돌린다.
 */
export function forceFromHandle(handle: Vec2, c: TensionConstants): number {
  const x = handle[0] / PX + CANVAS_W / 2 - FIST_CENTER_DX;
  const f = (HAND_X0 - x) / (3 * PX_PER_N);
  return Math.max(0, Math.min(c.forceMax, f));
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 잡고 있으면 손잡이의 가로 자리가 힘이다. 놓는 순간의 힘에서 `releaseBlend` 초 동안
 * 자동 진행 값으로 smooth 하게 섞어 돌아간다. 그 밖에는 대본의 힘이다 (원본 step).
 */
export function step(params: {
  state: TensionState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TensionState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(params.stage);

  const clock = state.clock + dt;
  const target = scriptedForce(clock, c);
  let force: number;
  let releaseFrom = state.releaseFrom;
  let releaseAge = state.releaseAge;

  if (state.held) {
    force = forceFromHandle(state.handle, c);
    releaseFrom = null;
  } else {
    if (state.wasHeld) {
      // 방금 놓았다 — 그 순간의 힘에서 섞기 시작한다.
      releaseFrom = state.force;
      releaseAge = 0;
    }
    if (releaseFrom !== null) {
      releaseAge += dt;
      const u = Math.min(1, releaseAge / c.releaseBlend);
      force = releaseFrom + (target - releaseFrom) * smooth(u);
      if (u >= 1) releaseFrom = null;
    } else {
      force = target;
    }
  }

  return {
    ...state,
    clock,
    force,
    reading: readingOf(force),
    // 잡고 있지 않으면 손잡이가 주먹을 따라온다.
    handle: state.held ? state.handle : handleAt(force),
    wasHeld: state.held,
    releaseFrom,
    releaseAge,
  };
}
