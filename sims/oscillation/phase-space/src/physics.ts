// ========================================================================
// phase-space — 순수 물리
// ========================================================================
// 감쇠 진자 θ'' = −ω0² sinθ − γ θ' 를 무리 520개와 추적 하나에 같은 식으로 적분한다.
//
// 상태를 쌓는 조각이다 — 무리의 자리와 추적 궤적은 닫힌 형태가 없다. 그래서
// `step` 이 일을 하고, 도착 순간의 앞당김은 `schema.preroll` 이 건다.
// ========================================================================

import {
  CLOUD_COUNT,
  OMEGA_MAX,
  PHASE_SPACE_TIMELINE,
  SETTLED,
  SUBSTEPS,
  TICK,
  TRACKED_START,
  TRAIL_TICKS,
  W0SQ,
} from './schema';
import type { PhaseSpaceState, PhaseState } from './state';

/** 무리를 다시 흩뿌리는 주기(초) — 시간표 단계 길이의 합. */
export const cycleLength: number = PHASE_SPACE_TIMELINE.phases.reduce(
  (sum, p) => sum + p.duration,
  0,
);

/** 부동소수 누적으로 한 걸음을 놓치지 않게 두는 여유. */
const TICK_EPS = 1e-9;

/** 각도를 −π~π 로 감는다. 좌우 가장자리는 같은 「거꾸로 선 자리」다. */
export function wrapAngle(th: number): number {
  let a = (th + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
}

/**
 * mulberry32 한 번. 원본 하네스와 같은 생성기라 시드 1 에서 같은 무리가 나온다.
 * 순수 함수 — 다음 상태와 값을 함께 돌려준다.
 */
function nextRandom(s: number): { s: number; r: number } {
  const next = (s + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { s: next, r: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}

/** 한 주기의 무리 · 잔상 · 추적을 새로 놓는다. */
export function seedCycle(rng: number): Pick<
  PhaseSpaceState,
  'th' | 'om' | 'histTh' | 'histOm' | 'histHead' | 'histCount' | 'tracked' | 'path' | 'rng' | 'cycleTicks'
> {
  const th = new Float64Array(CLOUD_COUNT);
  const om = new Float64Array(CLOUD_COUNT);
  let s = rng;
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const a = nextRandom(s);
    const b = nextRandom(a.s);
    s = b.s;
    th[i] = -Math.PI + 2 * Math.PI * a.r;
    om[i] = (2 * b.r - 1) * OMEGA_MAX * 0.95;
  }
  const tracked = { th: TRACKED_START.th, om: TRACKED_START.om };
  return {
    th,
    om,
    histTh: new Float32Array(CLOUD_COUNT * TRAIL_TICKS),
    histOm: new Float32Array(CLOUD_COUNT * TRAIL_TICKS),
    histHead: 0,
    histCount: 0,
    tracked,
    path: [tracked],
    rng: s,
    cycleTicks: 0,
  };
}

/** 고정 걸음 하나 — 부분 단계 `SUBSTEPS` 번의 심플렉틱 오일러. 받은 배열을 고친다. */
function advance(s: PhaseSpaceState, gamma: number): void {
  const h = TICK / SUBSTEPS;
  const { th, om } = s;
  let tth = s.tracked.th;
  let tom = s.tracked.om;
  for (let k = 0; k < SUBSTEPS; k++) {
    for (let i = 0; i < CLOUD_COUNT; i++) {
      om[i] = om[i]! + (-W0SQ * Math.sin(th[i]!) - gamma * om[i]!) * h;
      th[i] = wrapAngle(th[i]! + om[i]! * h);
    }
    tom += (-W0SQ * Math.sin(tth) - gamma * tom) * h;
    tth = wrapAngle(tth + tom * h);
  }
  const base = s.histHead * CLOUD_COUNT;
  for (let i = 0; i < CLOUD_COUNT; i++) {
    s.histTh[base + i] = th[i]!;
    s.histOm[base + i] = om[i]!;
  }
  s.histHead = (s.histHead + 1) % TRAIL_TICKS;
  s.histCount = Math.min(TRAIL_TICKS, s.histCount + 1);
  s.tracked = { th: tth, om: tom };
  s.path = [...s.path, s.tracked];
  s.cycleTicks += 1;
}

/** 추적 상태가 바닥 근처에서 거의 멈췄는가. */
export function isSettled(p: PhaseState): boolean {
  return Math.abs(p.om) < SETTLED.om && Math.abs(p.th) < SETTLED.th;
}

export function step(params: { state: PhaseSpaceState; dt: number }): PhaseSpaceState {
  const prev = params.state;
  let acc = prev.acc + params.dt;
  if (acc < TICK - TICK_EPS) return { ...prev, acc };

  // 받은 상태는 건드리지 않는다 — 고칠 배열을 먼저 복사한다.
  const s: PhaseSpaceState = {
    ...prev,
    th: prev.th.slice(),
    om: prev.om.slice(),
    histTh: prev.histTh.slice(),
    histOm: prev.histOm.slice(),
  };
  const gamma = Math.max(0, s.friction);
  while (acc >= TICK - TICK_EPS) {
    const cycle = Math.floor((s.ticks * TICK) / cycleLength + TICK_EPS);
    if (cycle !== s.cycle) {
      Object.assign(s, seedCycle(s.rng));
      s.cycle = cycle;
    }
    advance(s, gamma);
    s.ticks += 1;
    acc -= TICK;
  }
  s.acc = Math.max(0, acc);
  s.frictionZero = gamma < TICK_EPS;
  s.settled = isSettled(s.tracked);
  return s;
}
