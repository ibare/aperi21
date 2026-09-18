// ========================================================================
// decay-types — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 알갱이 하나의 일생은 (시드, 줄, 번호)와 시각의 함수다.
//
// - 나오는 시각 — 번호 × 간격에 결정적 난수로 조금 흔든다. 번호는 음수도 된다
//   (도착한 순간 줄이 이미 차 있다).
// - 벽을 만나는 시각 — 나온 시각 + 거리 / 속력. 그 순간 벽이 서 있었는지는 **그 시각의
//   주기 안 자리**를 시간표 단계 경계(`end('paperIn')` · `start('clear')`)에 대 본다.
//   그래서 벽이 들어선 뒤에 도착한 알갱이만 멈추고, 이미 지나간 것은 그대로 간다.
// - 멈추는 자리 — α 는 어느 벽이든 앞면에서, β 는 종이를 지나 알루미늄 안(두께의 비 범위에서
//   고르게), γ 는 종이 · 알루미늄을 지나 납 안에서 지수 분포 깊이 −ln(1−r)/μ 로. 그 깊이가
//   납 두께보다 깊으면 뚫고 나간다.
//
// 같은 시각은 언제나 같은 화면이다 — `step` 은 항등이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AL_MM,
  ALPHA_INTERVAL,
  ALPHA_SPEED,
  BETA_INTERVAL,
  BETA_SPEED,
  BETA_STOP_MAX,
  BETA_STOP_MIN,
  EMIT_X,
  GAMMA_INTERVAL,
  GAMMA_MU_PER_CM,
  GAMMA_SPEED,
  LANE_END_X,
  LANE_SPREAD,
  LANE_Y,
  LEAD_CM,
  RING_LIFE,
  SEED,
  STUCK_LIFE,
  WALL_W,
  WALL_X,
} from './schema';
import type { DecayTypesState } from './state';

export type Radiation = 'alpha' | 'beta' | 'gamma';
export const RADIATIONS: readonly Radiation[] = ['alpha', 'beta', 'gamma'];

/** 벽 순서 — 종이 · 알루미늄 · 납. 시간표에서 벽이 들어서는 단계 id 와 짝이다. */
export type Wall = 'paper' | 'aluminium' | 'lead';
export const WALLS: readonly Wall[] = ['paper', 'aluminium', 'lead'];
const WALL_IN_PHASE: Readonly<Record<Wall, string>> = { paper: 'paperIn', aluminium: 'aluIn', lead: 'leadIn' };
const CLEAR_PHASE = 'clear';

export interface DecayTypesConstants {
  seed: number;
  speed: Readonly<Record<Radiation, number>>;
  interval: Readonly<Record<Radiation, number>>;
  alMm: number;
  leadCm: number;
  gammaMuPerCm: number;
  betaStopMin: number;
  betaStopMax: number;
  stuckLife: number;
  ringLife: number;
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): DecayTypesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    seed: c.seed ?? SEED,
    speed: {
      alpha: c.alphaSpeed ?? ALPHA_SPEED,
      beta: c.betaSpeed ?? BETA_SPEED,
      gamma: c.gammaSpeed ?? GAMMA_SPEED,
    },
    interval: {
      alpha: c.alphaInterval ?? ALPHA_INTERVAL,
      beta: c.betaInterval ?? BETA_INTERVAL,
      gamma: c.gammaInterval ?? GAMMA_INTERVAL,
    },
    alMm: c.alMm ?? AL_MM,
    leadCm: c.leadCm ?? LEAD_CM,
    gammaMuPerCm: c.gammaMuPerCm ?? GAMMA_MU_PER_CM,
    betaStopMin: c.betaStopMin ?? BETA_STOP_MIN,
    betaStopMax: c.betaStopMax ?? BETA_STOP_MAX,
    stuckLife: c.stuckLife ?? STUCK_LIFE,
    ringLife: c.ringLife ?? RING_LIFE,
  };
}

// ------------------------------------------------------------------------
// 결정적 난수 — (시드, 줄, 번호, 칸)마다 같은 값. 다른 sim 의 것을 가져오지 않는다 (S-sim).
// ------------------------------------------------------------------------

/** 32비트 정수 섞기(mulberry32 한 걸음). */
function mix(a: number): number {
  let t = (a + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** [0, 1) 난수 하나. `slot` 은 같은 알갱이의 서로 다른 뽑기(시각 · 높이 · 깊이)를 가른다. */
export function rand(seed: number, lane: number, index: number, slot: number): number {
  const h = Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(lane + 1, 0x85ebca6b) ^ Math.imul(index | 0, 0xc2b2ae35) ^ Math.imul(slot + 1, 0x27d4eb2f);
  return mix(h);
}

/** 난수 칸 이름. */
const SLOT_TIME = 0;
const SLOT_Y = 1;
const SLOT_DEPTH = 2;
/** 나오는 시각의 흔들림 — 간격에 대한 비. 1 보다 작아야 순서가 뒤집히지 않는다. */
const EMIT_JITTER = 0.8;

// ------------------------------------------------------------------------
// 벽
// ------------------------------------------------------------------------

/** 주기 안 자리 u 에 벽 w 가 서 있어 알갱이를 막는가. */
export function wallBlocks(tl: TimelineFrame, w: Wall, u: number): boolean {
  return u >= tl.end(WALL_IN_PHASE[w]) && u < tl.start(CLEAR_PHASE);
}

/** 지금 벽이 얼마나 보이는가 0~1 — 들어서며 짙어지고 물러나며 옅어진다. */
export function wallOpacity(tl: TimelineFrame, w: Wall): number {
  return tl.at(WALL_IN_PHASE[w]) * (1 - tl.at(CLEAR_PHASE));
}

/** 조각 시각 t 의 주기 안 자리. */
function cycleU(tl: TimelineFrame, t: number): number {
  return t - tl.period * Math.floor(t / tl.period);
}

/**
 * 벽 w 에서 이 알갱이가 멈추는 깊이(벽 두께에 대한 비, 0 = 앞면). 뚫고 지나가면 null.
 * 벽이 서 있는지는 여기서 보지 않는다.
 */
function stopDepth(c: DecayTypesConstants, r: Radiation, w: Wall, lane: number, i: number): number | null {
  if (r === 'alpha') return 0;
  if (r === 'beta') {
    if (w === 'paper') return null;
    const u = rand(c.seed, lane, i, SLOT_DEPTH);
    const f = c.betaStopMin + (c.betaStopMax - c.betaStopMin) * u;
    // 납은 알루미늄보다 훨씬 빨리 세운다 — 알루미늄이 없이 납만 서는 일은 이 시간표에 없어 가장 얕게 둔다.
    return w === 'aluminium' ? f : c.betaStopMin;
  }
  if (w !== 'lead') return null;
  const u = rand(c.seed, lane, i, SLOT_DEPTH);
  const depthCm = -Math.log(1 - u) / c.gammaMuPerCm;
  return depthCm < c.leadCm ? depthCm / c.leadCm : null;
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

export interface Particle {
  kind: Radiation;
  /** 줄 번호(α 0 · β 1 · γ 2)와 그 줄의 번호. */
  lane: number;
  index: number;
  /** 지금 자리(월드). */
  x: number;
  y: number;
  /** 날아가는 중이면 true, 벽에서 멈췄으면 false. */
  moving: boolean;
  /** 멈춘 뒤 흐른 시간(초). 날아가는 중이면 0. */
  stoppedAge: number;
  /** 멈춘 벽. 날아가는 중이면 null. */
  wall: Wall | null;
}

/**
 * 조각 시각 t 에 화면에 있는 알갱이 목록. 날아가는 것과, 멈춘 뒤 `max(stuckLife, ringLife)` 가
 * 지나지 않은 것을 담는다. 오른쪽 끝을 넘은 것은 뺀다.
 */
export function particlesAt(c: DecayTypesConstants, tl: TimelineFrame): Particle[] {
  const t = tl.t;
  const out: Particle[] = [];
  const linger = Math.max(c.stuckLife, c.ringLife);
  RADIATIONS.forEach((kind, lane) => {
    const v = c.speed[kind];
    const dt = c.interval[kind];
    const travel = (LANE_END_X - EMIT_X) / v;
    const first = Math.floor((t - travel - linger) / dt) - 1;
    const last = Math.floor(t / dt) + 1;
    for (let i = first; i <= last; i++) {
      const te = (i + EMIT_JITTER * (rand(c.seed, lane, i, SLOT_TIME) - 0.5)) * dt;
      if (te > t) continue;
      const y = LANE_Y[lane]! + LANE_SPREAD * (2 * rand(c.seed, lane, i, SLOT_Y) - 1);
      const p = fate(c, tl, kind, lane, i, te, y, v, t, linger);
      if (p) out.push(p);
    }
  });
  return out;
}

function fate(
  c: DecayTypesConstants,
  tl: TimelineFrame,
  kind: Radiation,
  lane: number,
  index: number,
  te: number,
  y: number,
  v: number,
  t: number,
  linger: number,
): Particle | null {
  const flyX = EMIT_X + v * (t - te);
  for (let k = 0; k < WALLS.length; k++) {
    const w = WALLS[k]!;
    const front = WALL_X[k]!;
    const tHit = te + (front - EMIT_X) / v;
    if (tHit > t) break; // 아직 이 벽에 닿지 않았다
    if (!wallBlocks(tl, w, cycleU(tl, tHit))) continue;
    const d = stopDepth(c, kind, w, lane, index);
    if (d === null) continue;
    const xStop = front + d * WALL_W[k]!;
    const tStop = te + (xStop - EMIT_X) / v;
    if (tStop > t) break; // 벽 안에서 멈추러 가는 중
    const age = t - tStop;
    if (age >= linger) return null;
    return { kind, lane, index, x: xStop, y, moving: false, stoppedAge: age, wall: w };
  }
  if (flyX > LANE_END_X) return null;
  return { kind, lane, index, x: flyX, y, moving: true, stoppedAge: 0, wall: null };
}

/** 캡션 `vars` 가 가리킬 문자열 — 스테이지 상수를 그대로 쓴다 (S-piece 유효숫자). */
export function captionOf(c: DecayTypesConstants): DecayTypesState['caption'] {
  return { al: String(c.alMm), pb: String(c.leadCm) };
}

/** 쌓는 상태가 없다 — 캡션 문자열만 들고 있다. */
export function step(params: { state: DecayTypesState }): DecayTypesState {
  return params.state;
}
