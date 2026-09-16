// ========================================================================
// relative-velocity — 순수 물리
// ========================================================================
// 한 문장으로: **배는 아무것도 다르게 하지 않는다.** 뱃머리를 +y 로 고정한 채
// 물에 대해 1.6 m/s 로 나아가고, 물이 +x 로 1.2 m/s 로 실어 나른다. 달라지는
// 것은 보는 사람뿐이고, 그래서 배가 지나온 길이 기운다.
//
// 기준틀 변환은 손으로 짜지 않는다 — `@aperi21/plugin-mechanics` 의 순수 계산을
// 쓴다. 원칙 1 이 sim 에 허용하는 것이 「도메인 plugin 의 순수 계산 함수·타입」이다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { advanceObserver, type SpacetimeEvent } from '@aperi21/plugin-mechanics';

import {
  CROSS_T,
  CYCLE,
  DOT_DT,
  FOAM_COUNT,
  FRAME_TOUR,
  GHOST_LIFE,
  HANDOFF_BLEND,
  HANDOFF_DELAY,
  PEBBLE_COUNT,
  RIVER_W,
  SCATTER_SEED,
  SPAN,
  U_EPS,
  U_RANGE,
  V_BOAT,
  V_WATER,
  worldYFromPx,
} from './schema';
import { tripStartX, type Ghost, type RelativeVelocityState, type Trip } from './state';

// ------------------------------------------------------------------------
// 흩뿌린 것들 — 시드에서 나온다
// ------------------------------------------------------------------------
//
// 같은 시각이 언제나 같은 화면이어야 하므로 난수는 시드를 받는다 (S-sim).
// 생성기와 뽑는 순서를 원본 하네스(`piece-kit.js` 의 mulberry32, 시드 1)와
// 똑같이 두었다 — 그래서 물거품과 자갈이 원본과 한 알도 다르지 않다.

/** mulberry32. 원본 하네스와 같은 생성기다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 물에 얹혀 물과 똑같이 떠가는 것. 물의 운동 자체를 눈에 보이게 한다. */
export interface Foam {
  /** 세계 좌표 x (주기 `SPAN` 안). */
  readonly x: number;
  /** 세계 좌표 y. */
  readonly y: number;
  /** 획의 세기 0~1. 진하기이자 길이다. */
  readonly strength: number;
}

/** 땅에 붙박인 것. 강둑의 기준틀에서만 멈춰 있다. */
export interface Pebble {
  readonly x: number;
  readonly y: number;
  /** 반지름(화면 px). */
  readonly r: number;
}

/**
 * 물거품과 자갈을 한 시드에서 함께 뽑는다.
 *
 * **둘을 한 함수에 둔 것은 순서 때문이다.** 원본이 물거품 150개를 먼저 뽑고
 * 자갈 90개를 뽑았으므로, 같은 자리를 얻으려면 같은 생성기에서 같은 순서로
 * 뽑아야 한다.
 */
export function scatter(seed: number): { foam: Foam[]; pebbles: Pebble[] } {
  const rnd = mulberry32(seed);
  const foam: Foam[] = [];
  for (let i = 0; i < FOAM_COUNT; i++) {
    const x = rnd() * SPAN;
    const y = 0.25 + rnd() * (RIVER_W - 0.5);
    // 원본은 길이와 알파를 따로 뽑았다. 어휘가 자국마다 줄 수 있는 것은 세기
    // 하나뿐이라 길이 쪽 난수는 버리고 알파를 세기로 쓴다 (NOTES 「어휘 부족」).
    rnd();
    const strength = 0.25 + rnd() * 0.45;
    foam.push({ x, y, strength });
  }
  const pebbles: Pebble[] = [];
  for (let j = 0; j < PEBBLE_COUNT; j++) {
    const far = rnd() < 0.5;
    const x = rnd() * SPAN;
    // 원본은 자갈의 세로를 **화면 픽셀**로 흩뿌렸다 — 맞은편 둑 y 2~27 px,
    // 이쪽 둑 y 203~229 px. 그 숫자를 그대로 두고 월드로 환산한다.
    const y = worldYFromPx(far ? rnd() * 25 + 2 : 203 + rnd() * 26);
    const r = 0.7 + rnd() * 1.8;
    pebbles.push({ x, y, r });
  }
  return { foam, pebbles };
}

const SCATTER = scatter(SCATTER_SEED);
/** 물거품 150개. 한 번 뽑고 계속 쓴다 — 자리는 세계 좌표라 기준틀과 무관하다. */
export const FOAM: readonly Foam[] = SCATTER.foam;
/** 자갈 90개. */
export const PEBBLES: readonly Pebble[] = SCATTER.pebbles;

// ------------------------------------------------------------------------
// 자동 순회 — 선언한 표를 읽는다
// ------------------------------------------------------------------------

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** 엔진 시간표의 `smooth` 와 같은 곡선이다. */
function smooth(s: number): number {
  return s * s * (3 - 2 * s);
}

/** `smooth` 의 역. 손을 뗀 자리에 해당하는 위상을 되찾는 데 쓴다. */
function invSmooth(y: number): number {
  return 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(y)) / 3);
}

/**
 * 순회 위상 `p` 에서의 λ (0 = 강둑, 1 = 강물).
 *
 * 단계 경계를 상수로 두지 않는다. `FRAME_TOUR` 를 훑어 지금 단계를 찾고, 그
 * 단계의 이징과 끝값으로 섞는다 — 같은 표가 `schema.timeline` 이기도 하다.
 */
export function lambdaAt(phase: number): number {
  let p = phase % CYCLE;
  if (p < 0) p += CYCLE;
  let start = 0;
  for (const seg of FRAME_TOUR) {
    if (p < start + seg.duration) {
      const u = clamp01((p - start) / seg.duration);
      const eased = seg.ease === 'smooth' ? smooth(u) : u;
      return seg.from + (seg.to - seg.from) * eased;
    }
    start += seg.duration;
  }
  const last = FRAME_TOUR[FRAME_TOUR.length - 1];
  return last ? last.to : 0;
}

/**
 * λ 값에 해당하는 순회 위상. **올라가는 단계**에서 찾는다.
 *
 * 손을 뗀 뒤 자동으로 돌아갈 때 "놓은 자리에서 순회를 이어 가게" 하는 것이다.
 * 처음부터 다시 돌면 독자가 만든 자리가 지워지고, 이어 가면 독자의 손이
 * 이야기의 한 대목이 된다.
 */
export function phaseForLambda(lambda: number): number {
  let start = 0;
  for (const seg of FRAME_TOUR) {
    if (seg.to > seg.from) {
      const y = clamp01((lambda - seg.from) / (seg.to - seg.from));
      const u = seg.ease === 'smooth' ? invSmooth(y) : y;
      return start + seg.duration * u;
    }
    start += seg.duration;
  }
  return 0;
}

// ------------------------------------------------------------------------
// 배
// ------------------------------------------------------------------------

function clampU(u: number): number {
  return Math.max(U_RANGE[0], Math.min(U_RANGE[1], u));
}

/** 이 항해에서 배가 있는 세계 좌표. 뱃머리는 언제나 +y 다. */
export function boatAt(trip: Trip, t: number): SpacetimeEvent {
  const tau = t - trip.tStart;
  return { x: trip.x0 + V_WATER * tau, y: V_BOAT * tau, t };
}

// ------------------------------------------------------------------------
// step
// ------------------------------------------------------------------------

export function step(params: {
  state: RelativeVelocityState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): RelativeVelocityState {
  const s = params.state;
  const dt = params.dt;
  const t = s.frame.t + dt;

  // ---- 지금 누구의 눈으로 보는가 ----
  // 잡고 있는 동안은 독자가 정하고, 놓은 뒤 잠시 그 값에 머물다, 놓은 자리에서
  // 순회를 이어 간다. 러너는 잡혔다는 사실만 적고 그 뒤는 여기서 한다
  // (`ControllerInstance.heldPath`).
  let auto = s.auto;
  let lastInput = s.lastInput;
  let blend = s.blend;
  let blendFrom = s.blendFrom;
  let phaseOff = s.phaseOff;
  let u: number;

  if (s.ui.held) {
    auto = false;
    lastInput = t;
    blend = 0;
    u = clampU(s.ui.u);
  } else if (!auto && t - lastInput <= HANDOFF_DELAY) {
    u = clampU(s.ui.u);
  } else {
    if (!auto) {
      // 돌아가는 첫 프레임 — 놓아 둔 값에 해당하는 위상으로 순회를 옮긴다.
      blendFrom = clampU(s.ui.u);
      phaseOff = phaseForLambda(blendFrom / V_WATER) - t;
      auto = true;
      blend = 1;
    }
    const uAuto = lambdaAt(t + phaseOff) * V_WATER;
    if (blend > 0) {
      blend = Math.max(0, blend - dt / HANDOFF_BLEND);
      u = uAuto + (blendFrom - uAuto) * smooth(blend);
    } else {
      u = uAuto;
    }
  }

  // ---- 보는 사람이 여기까지 흘러온 거리 ----
  // **적분이어야 한다.** `x − u·t` 로 쓰면 기준틀이 변하는 동안 화면이 폭주한다.
  const frame = advanceObserver(s.frame, [u, 0], dt);

  // ---- 배 ----
  let trip = s.trip;
  let trail = s.trail;
  let dots = s.dots;
  let ghost = s.ghost;

  if (t - trip.tStart >= CROSS_T) {
    // 한 항해가 끝났다. 앞 자취를 짧게 남기고 새 배가 떠난다 — 딱딱한 끊김을
    // 없애려는 것이지 두 배를 보여 주려는 것이 아니다.
    const deadAt = trip.tStart + CROSS_T;
    if (trail.length > 1) ghost = { trail, deadAt } satisfies Ghost;
    trip = { x0: tripStartX(frame.at[0]), tStart: deadAt };
    trail = [];
    dots = [];
  }

  const here = boatAt(trip, t);
  trail = [...trail, here];
  const k = Math.floor((t - trip.tStart) / DOT_DT);
  if (dots.length <= k) dots = [...dots, here];

  if (ghost && t - ghost.deadAt > GHOST_LIFE) ghost = null;

  // ---- 캡션이 볼 조건 ----
  // 순서는 원본 `caption()` 의 if 사슬 그대로다. 선언은 이름만 가리킨다 (원칙 2).
  const atBank = Math.abs(u) < U_EPS;
  const atRiver = !atBank && Math.abs(u - V_WATER) < U_EPS;
  const other = !atBank && !atRiver;

  return {
    frame,
    trip,
    trail,
    dots,
    ghost,
    auto,
    lastInput,
    blend,
    blendFrom,
    phaseOff,
    ui: { u, held: s.ui.held },
    atBank,
    atRiver,
    upstream: other && u < 0,
    slower: other && u > 0 && u < V_WATER,
    faster: other && u > V_WATER,
  };
}
