// ========================================================================
// brownian-motion — 순수 물리
// ========================================================================
// DOM · 캔버스 · 색을 모른다. 난수는 (시드, 주기 번호, 칸 번호)에서 뽑는다 (S-sim).
//
// 알갱이(질량 M, 반지름 1)를 분자(질량 m, 속력 u)가 때린다. 분자 하나가 법선에서 α
// 기울어 들어와 탄성으로 튕겨 나가면 알갱이는 법선 안쪽으로
//
//   Δv = 2 m u cos α / M
//
// 만큼 속도를 얻는다. 물의 끌림이 그 속도를 비율 `drag` 로 줄인다. 충돌 사이에는
//
//   v(t) = v₀ e^{−γt}     x(t) = x₀ + v₀ (1 − e^{−γt}) / γ
//
// 로 정확히 흐르므로, 충돌 목록만 있으면 어느 시각의 자리든 닫힌 계산으로 나온다.
// `step` 에 쌓지 않는다 — 같은 시각은 언제나 같은 화면이다.
//
// 한 주기의 충돌 목록은 그 주기 번호에서 새로 뽑는다. 주기 끝의 자리를 0 으로 되돌리는
// 곧은 보정(다리)을 빼 주어, 주기가 바뀌는 순간에도 알갱이가 튀지 않는다. 보정은
// kick ~ push 구간 밖에만 나눠 건다 — 그 구간의 변위는 충돌이 만든 그대로다 (NOTES (b)).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ARROW_SCALE,
  BIN_SECONDS,
  DRAG,
  GRAIN_MASS,
  HIT_RATE,
  KICK_HEAVY,
  KICK_LIGHT,
  KICK_MIN_SHIFT,
  KICK_SPREAD,
  MAX_TILT,
  MOLECULE_MASS,
  MOLECULE_SPEED,
  PATH_SCALE,
  SEED,
  TRACK_SECONDS,
  TRAIL_SECONDS,
} from './schema';
import type { BrownianMotionState } from './state';

export interface BrownianConstants {
  seed: number;
  moleculeMass: number;
  grainMass: number;
  /** 분자 속력(반지름/초). */
  moleculeSpeed: number;
  /** 초당 충돌 수. */
  hitRate: number;
  /** 충돌을 뽑는 칸의 길이(초). */
  binSeconds: number;
  /** 끌림 비율 γ (1/초). */
  drag: number;
  /** 비스듬히 들어오는 최대 기울기(라디안). */
  maxTilt: number;
  /** kick 칸에서 많이 맞는 쪽 · 적게 맞는 쪽 충돌 수. 많은 쪽이 언제나 더 많다. */
  kickHeavy: number;
  kickLight: number;
  /** kick 칸 충돌 자리가 축에서 벌어지는 최대 각(라디안). */
  kickSpread: number;
  /** 보통 배율 판의 경로 배율(월드 / 반지름). */
  pathScale: number;
  /** 보통 배율 판 자취의 길이(초). */
  trailSeconds: number;
  /** 확대 창이 알갱이를 따라가는 늦음(초). */
  trackSeconds: number;
  /** 순 충격 화살표 배율(월드 / (반지름/초)). */
  arrowScale: number;
  /** kick 시작~튐 끝 사이 창 안 알갱이가 순 충격 쪽으로 적어도 이만큼(반지름) 움직인다. */
  kickMinShift: number;
}

export function readConstants(stage: StageDef): BrownianConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    seed: Math.round(c.seed ?? SEED),
    moleculeMass: c.moleculeMass ?? MOLECULE_MASS,
    grainMass: c.grainMass ?? GRAIN_MASS,
    moleculeSpeed: c.moleculeSpeed ?? MOLECULE_SPEED,
    hitRate: c.hitRate ?? HIT_RATE,
    binSeconds: Math.max(0.05, c.binSeconds ?? BIN_SECONDS),
    drag: Math.max(1e-3, c.drag ?? DRAG),
    // 법선에서 직각 이상 기울면 알갱이를 밀지 못한다 — 튐 하한 계산이 그 앞에서만 선다.
    maxTilt: Math.min(MAX_TILT_LIMIT, Math.max(0, c.maxTilt ?? MAX_TILT)),
    kickLight: Math.max(0, Math.round(c.kickLight ?? KICK_LIGHT)),
    // 많은 쪽이 적은 쪽보다 적어도 하나 많다 — 「한쪽이 더 많다」 가 선언값으로도 깨지지 않게.
    kickHeavy: Math.max(Math.max(0, Math.round(c.kickLight ?? KICK_LIGHT)) + 1, Math.round(c.kickHeavy ?? KICK_HEAVY)),
    kickSpread: Math.min(MAX_TILT_LIMIT, Math.max(0, c.kickSpread ?? KICK_SPREAD)),
    pathScale: c.pathScale ?? PATH_SCALE,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    trackSeconds: Math.max(1e-3, c.trackSeconds ?? TRACK_SECONDS),
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    kickMinShift: c.kickMinShift ?? KICK_MIN_SHIFT,
  };
}

// ------------------------------------------------------------------------
// 시드 난수
// ------------------------------------------------------------------------

/** 정수 여럿을 한 시드로 섞는다. 같은 입력은 언제나 같은 수다. */
function hash(...parts: number[]): number {
  let h = 0x811c9dc5;
  for (const p of parts) {
    h = Math.imul(h ^ (p | 0), 0x01000193);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

/** mulberry32. 같은 시드는 언제나 같은 수열을 준다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** kick 칸 · push 짝을 뽑을 때 쓰는 소금 — 보통 칸 번호와 겹치지 않게. */
const KICK_SALT = 0x4b1c;
const PUSH_SALT = 0x9e37;
/** 기울기 · 벌림각의 상한(라디안). 직각(π/2)보다 작아야 충돌이 알갱이를 민다. */
const MAX_TILT_LIMIT = 1.5;

// ------------------------------------------------------------------------
// 충돌
// ------------------------------------------------------------------------

export interface Hit {
  /** 주기 안 시각(초). */
  t: number;
  /** 맞은 자리의 바깥 법선(단위). 알갱이 중심 기준 맞은 자리 = 이 방향 × 반지름. */
  n: Vec2;
  /** 분자가 날아오던 방향(단위, 안쪽을 향한다). */
  d: Vec2;
  /** 알갱이가 얻은 속력(반지름/초). 방향은 `−n`. */
  dv: number;
  /** kick 칸의 충돌인가. */
  kick: boolean;
}

function drawHits(
  rand: () => number,
  count: number,
  from: number,
  to: number,
  c: BrownianConstants,
  kick: boolean,
): Hit[] {
  const out: Hit[] = [];
  for (let i = 0; i < count; i++) {
    const t = from + rand() * (to - from);
    const th = 2 * Math.PI * rand();
    const tilt = (2 * rand() - 1) * c.maxTilt;
    out.push(makeHit(t, th, tilt, c, kick));
  }
  return out;
}

/** 시각 `t` 에 법선 각 `th` 자리를 기울기 `tilt` 로 맞은 충돌. */
function makeHit(t: number, th: number, tilt: number, c: BrownianConstants, kick: boolean): Hit {
  const n: Vec2 = [Math.cos(th), Math.sin(th)];
  // 날아오는 방향 = 안쪽 법선을 기울기만큼 돌린 것.
  const d: Vec2 = [-Math.cos(th + tilt), -Math.sin(th + tilt)];
  const dv = (2 * c.moleculeMass * c.moleculeSpeed * Math.cos(tilt)) / c.grainMass;
  return { t, n, d, dv, kick };
}

/** 정면 충돌 하나가 알갱이에 주는 속력(반지름/초). */
function headOnKick(c: BrownianConstants): number {
  return (2 * c.moleculeMass * c.moleculeSpeed) / c.grainMass;
}

/** 충돌 목록이 알갱이에 준 속도의 합(반지름/초). */
export function netKick(hits: readonly Hit[]): Vec2 {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    x -= h.n[0] * h.dv;
    y -= h.n[1] * h.dv;
  }
  return [x, y];
}

// ------------------------------------------------------------------------
// 한 주기의 경로
// ------------------------------------------------------------------------

/** 경로 표본 간격(초, 주기 안 시각). */
const SAMPLE_DT = 1 / 60;

export interface WalkCycle {
  period: number;
  /** 시각순 충돌 목록. */
  hits: Hit[];
  /** kick 칸의 충돌과 그 순 충격(반지름/초). */
  kickHits: Hit[];
  kickJ: Vec2;
  /** 표본 k 의 보정 전 자리 · 속도 (시각 k·SAMPLE_DT). */
  raw: { x: number; y: number; vx: number; vy: number }[];
  /** 보정 전 주기 끝 자리 — 다리 보정이 이만큼을 되돌린다. */
  end: Vec2;
  /** 다리 보정을 걸지 않는 구간(주기 안 시각). kick 시작 ~ push 끝. */
  hold: readonly [number, number];
  /** 창이 따라가는 자리(보정 후) 표본. */
  track: Vec2[];
  gamma: number;
}

/** 충돌 목록을 한 주기 동안 흘려 표본 · 보정 · 창 추적을 만든다. */
function integrate(
  c: BrownianConstants,
  period: number,
  hits: Hit[],
  hold: readonly [number, number],
): Pick<WalkCycle, 'raw' | 'end' | 'hold' | 'track' | 'gamma'> {
  const gamma = c.drag;
  const k = Math.ceil(period / SAMPLE_DT);
  const raw: WalkCycle['raw'] = [];
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let now = 0;
  let hi = 0;
  const advance = (to: number): void => {
    const dt = to - now;
    if (dt <= 0) return;
    const e = Math.exp(-gamma * dt);
    x += (vx * (1 - e)) / gamma;
    y += (vy * (1 - e)) / gamma;
    vx *= e;
    vy *= e;
    now = to;
  };
  for (let s = 0; s <= k; s++) {
    const ts = Math.min(period, s * SAMPLE_DT);
    while (hi < hits.length && hits[hi]!.t <= ts) {
      const h = hits[hi]!;
      advance(h.t);
      vx -= h.n[0] * h.dv;
      vy -= h.n[1] * h.dv;
      hi++;
    }
    advance(ts);
    raw.push({ x, y, vx, vy });
  }
  const last = raw[raw.length - 1]!;
  const end: Vec2 = [last.x, last.y];

  // 창이 따라가는 자리 — 보정 후 경로의 지수 이동 평균. 주기 처음에서 자리 0 에 맞춰 연다.
  const alpha = 1 - Math.exp(-SAMPLE_DT / c.trackSeconds);
  const track: Vec2[] = [];
  let mx = 0;
  let my = 0;
  raw.forEach((r, s) => {
    const t = Math.min(period, s * SAMPLE_DT);
    const k = bridgeShare(period, hold, t);
    mx += (r.x - end[0] * k - mx) * alpha;
    my += (r.y - end[1] * k - my) * alpha;
    track.push([mx, my]);
  });
  return { raw, end, hold, track, gamma };
}

/**
 * 시각 `t` 까지 걸린 다리 보정의 몫 0~1. `hold` 구간에서는 늘지 않는다 — 그 구간의 변위는
 * 충돌이 만든 그대로다.
 */
function bridgeShare(period: number, hold: readonly [number, number], t: number): number {
  const span = period - (hold[1] - hold[0]);
  if (span <= 0) return 0;
  const outside = t <= hold[0] ? t : t <= hold[1] ? hold[0] : t - (hold[1] - hold[0]);
  return outside / span;
}

/** 충돌 목록을 시각 `t` 까지 흘린 알갱이 속도(반지름/초). */
function velocityAt(hits: readonly Hit[], gamma: number, t: number): Vec2 {
  let vx = 0;
  let vy = 0;
  let now = 0;
  for (const h of hits) {
    if (h.t > t) break;
    const e = Math.exp(-gamma * (h.t - now));
    vx = vx * e - h.n[0] * h.dv;
    vy = vy * e - h.n[1] * h.dv;
    now = h.t;
  }
  const e = Math.exp(-gamma * (t - now));
  return [vx * e, vy * e];
}

/**
 * kick 칸 — 뽑아 고르지 않고 **구성**한다. 어느 주기 · 어느 시드에서도 다음이 성립한다.
 *
 *  - 많이 맞는 쪽 `kickHeavy` 번 · 적게 맞는 쪽 `kickLight` 번 (`kickHeavy > kickLight`)
 *  - 적게 맞은 충돌마다 같은 시각 정반대 자리의 많은 쪽 충돌을 짝지어 둘이 정확히 상쇄한다.
 *    남은 많은 쪽 충돌은 축에 거울 짝으로 둔다 — 순 충격이 정확히 `φ` 방향이다
 *  - 남은 충돌은 모두 법선이 축에서 `spread` 안이라 알갱이를 `φ` 쪽으로 민다
 *
 * `φ` 는 (시드, 주기)로 정하되 kick 직전 알갱이 속도와 같은 반평면에서 고른다 — 앞서
 * 움직이던 몫이 튐을 되돌리지 않게.
 */
function buildKick(
  c: BrownianConstants,
  cycle: number,
  kickFrom: number,
  kickTo: number,
  spread: number,
  v0: Vec2,
): Hit[] {
  const rand = mulberry32(hash(c.seed, cycle, KICK_SALT));
  const base = v0[0] === 0 && v0[1] === 0 ? 2 * Math.PI * rand() : Math.atan2(v0[1], v0[0]);
  const phi = base + ((2 * rand() - 1) * Math.PI) / 2;
  const heavyAt = phi + Math.PI; // 많이 맞는 쪽 — 그 법선의 반대(φ)로 민다
  const time = (): number => kickFrom + rand() * (kickTo - kickFrom);
  const tilt = (): number => (2 * rand() - 1) * c.maxTilt;
  const hits: Hit[] = [];

  // 짝 상쇄 — 적은 쪽 충돌 하나 = 같은 시각 정반대 자리의 많은 쪽 충돌 하나.
  for (let i = 0; i < c.kickLight; i++) {
    const t = time();
    const th = heavyAt + (2 * rand() - 1) * spread;
    const a = tilt();
    hits.push(makeHit(t, th, a, c, true), makeHit(t, th + Math.PI, a, c, true));
  }
  // 남은 많은 쪽 충돌 — 축에 거울 짝, 홀수면 하나는 축 위 정면.
  const rest = c.kickHeavy - c.kickLight;
  for (let i = 0; i < Math.floor(rest / 2); i++) {
    const off = (2 * rand() - 1) * spread;
    const a = tilt();
    hits.push(makeHit(time(), heavyAt + off, a, c, true), makeHit(time(), heavyAt - off, -a, c, true));
  }
  if (rest % 2 === 1) hits.push(makeHit(time(), heavyAt, 0, c, true));
  return hits;
}

/**
 * kick 뒤 push 구간의 보통 충돌 — 같은 시각 정반대 자리 짝이라 순 충격이 0 이다.
 * 사방에서 맞는 것은 그대로 보이고, 튐을 되돌리지 않는다.
 */
function buildPushPairs(c: BrownianConstants, cycle: number, from: number, to: number): Hit[] {
  const rand = mulberry32(hash(c.seed, cycle, PUSH_SALT));
  const pairs = Math.floor(Math.round(c.hitRate * (to - from)) / 2);
  const hits: Hit[] = [];
  for (let i = 0; i < pairs; i++) {
    const t = from + rand() * (to - from);
    const th = 2 * Math.PI * rand();
    const a = (2 * rand() - 1) * c.maxTilt;
    hits.push(makeHit(t, th, a, c, false), makeHit(t, th + Math.PI, a, c, false));
  }
  return hits;
}

/**
 * 튐의 하한이 `kickMinShift` 를 넘도록 kick 충돌의 벌림각을 정한다.
 *
 * kick 시작 ~ `checkTo` 사이 순 충격 쪽 변위 ≥
 *   (kickHeavy − kickLight) · Δv₀ · cos(maxTilt) · cos(벌림각) · (1 − e^{−γ·(checkTo − kickTo)}) / γ
 * (앞선 속도 몫 ≥ 0, 짝 상쇄 몫 = 0, push 짝 몫 = 0). 선언한 `kickSpread` 로 하한이 문턱에 못 미치면
 * 벌림각을 좁힌다. 벌림각 0 에서도 못 미치면 그 상수 조합으로는 문턱이 닿지 않는 것이다 —
 * 방향(적게 맞은 쪽으로)은 그래도 언제나 참이다.
 */
function kickSpreadFor(c: BrownianConstants, kickTo: number, checkTo: number): number {
  const rest = c.kickHeavy - c.kickLight;
  const reach = 1 - Math.exp(-c.drag * Math.max(0, checkTo - kickTo));
  const floor0 = (rest * headOnKick(c) * Math.cos(c.maxTilt) * reach) / c.drag;
  if (floor0 <= 0) return 0;
  const need = c.kickMinShift / floor0;
  if (need >= 1) return 0;
  return Math.min(c.kickSpread, Math.acos(need));
}

/**
 * 주기 `cycle` 의 충돌 목록과 경로.
 *
 * `kickFrom`~`kickTo` 는 kick 단계, `kickTo`~`checkTo` 는 push 단계의 주기 안 시각이다.
 * 그 두 구간의 충돌은 보통 칸에서 뽑지 않고 구성한다 (`buildKick` · `buildPushPairs`).
 */
export function walkCycle(
  c: BrownianConstants,
  cycle: number,
  period: number,
  kickFrom: number,
  kickTo: number,
  checkTo: number,
): WalkCycle {
  const regular: Hit[] = [];
  const bins = Math.ceil(period / c.binSeconds);
  for (let b = 0; b < bins; b++) {
    const a = b * c.binSeconds;
    const z = Math.min(period, a + c.binSeconds);
    const count = Math.round(c.hitRate * (z - a));
    for (const h of drawHits(mulberry32(hash(c.seed, cycle, b)), count, a, z, c, false)) {
      if (h.t < kickFrom || h.t >= checkTo) regular.push(h);
    }
  }
  regular.sort((p, q) => p.t - q.t);

  const v0 = velocityAt(regular, c.drag, kickFrom);
  const kickHits = buildKick(c, cycle, kickFrom, kickTo, kickSpreadFor(c, kickTo, checkTo), v0);
  const hits = [...regular, ...kickHits, ...buildPushPairs(c, cycle, kickTo, checkTo)].sort((p, q) => p.t - q.t);
  return { period, hits, kickHits, kickJ: netKick(kickHits), ...integrate(c, period, hits, [kickFrom, checkTo]) };
}

/** 주기 안 시각 `u` 의 알갱이 자리(반지름, 보정 후). 충돌 사이를 닫힌 식으로 흐른다. */
export function positionAt(w: WalkCycle, u: number): Vec2 {
  const t = Math.max(0, Math.min(w.period, u));
  const s = Math.min(w.raw.length - 1, Math.floor(t / SAMPLE_DT));
  const t0 = Math.min(w.period, s * SAMPLE_DT);
  const r = w.raw[s]!;
  let { x, y, vx, vy } = r;
  let now = t0;
  const advance = (to: number): void => {
    const dt = to - now;
    if (dt <= 0) return;
    const e = Math.exp(-w.gamma * dt);
    x += (vx * (1 - e)) / w.gamma;
    y += (vy * (1 - e)) / w.gamma;
    vx *= e;
    vy *= e;
    now = to;
  };
  for (const h of w.hits) {
    if (h.t <= t0) continue;
    if (h.t > t) break;
    advance(h.t);
    vx -= h.n[0] * h.dv;
    vy -= h.n[1] * h.dv;
  }
  advance(t);
  const k = bridgeShare(w.period, w.hold, t);
  return [x - w.end[0] * k, y - w.end[1] * k];
}

/** 표본 `s` 의 알갱이 자리(보정 후). */
export function sampleAt(w: WalkCycle, s: number): Vec2 {
  const r = w.raw[s]!;
  const t = Math.min(w.period, s * SAMPLE_DT);
  const k = bridgeShare(w.period, w.hold, t);
  return [r.x - w.end[0] * k, r.y - w.end[1] * k];
}

/** 표본 수와 간격. scene 이 자취를 고를 때 쓴다. */
export function sampleCount(w: WalkCycle): number {
  return w.raw.length;
}
export function sampleTime(w: WalkCycle, s: number): number {
  return Math.min(w.period, s * SAMPLE_DT);
}

/** 주기 안 시각 `u` 에 창이 따라가 있는 자리(반지름). 표본 사이를 곧게 잇는다. */
export function trackAt(w: WalkCycle, u: number): Vec2 {
  const f = Math.max(0, Math.min(w.track.length - 1, u / SAMPLE_DT));
  const s = Math.floor(f);
  const a = w.track[s]!;
  const b = w.track[Math.min(w.track.length - 1, s + 1)]!;
  const k = f - s;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/**
 * 충돌 `h` 의 분자가 시각 `u` 에 있는 자리와 속도 — 알갱이 중심 기준(반지름).
 * 맞기 전에는 `d` 로 날아오고, 맞은 뒤에는 표면에서 거울처럼 튕겨 나간다.
 */
export function moleculeAt(h: Hit, u: number, c: BrownianConstants, contactR: number): { pos: Vec2; vel: Vec2 } {
  const cx = h.n[0] * contactR;
  const cy = h.n[1] * contactR;
  const sp = c.moleculeSpeed;
  if (u < h.t) {
    const back = (h.t - u) * sp;
    return { pos: [cx - h.d[0] * back, cy - h.d[1] * back], vel: [h.d[0] * sp, h.d[1] * sp] };
  }
  const dn = h.d[0] * h.n[0] + h.d[1] * h.n[1];
  const ox = h.d[0] - 2 * dn * h.n[0];
  const oy = h.d[1] - 2 * dn * h.n[1];
  const out = (u - h.t) * sp;
  return { pos: [cx + ox * out, cy + oy * out], vel: [ox * sp, oy * sp] };
}

/** 쌓는 상태가 없다 — 모든 것이 (시드, 시각)의 함수다. */
export function step(params: { state: BrownianMotionState }): BrownianMotionState {
  return params.state;
}
