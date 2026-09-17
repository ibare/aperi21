// ========================================================================
// tidal-force — 순수 물리
// ========================================================================
// 천체는 원점, 먼지 구름은 -x 쪽에서 정지 상태로 놓아 준다. 입자끼리는 서로 끌지
// 않는다 — 조석력만 보이도록 시험 입자로 둔다 (원본 inventory 「hidden」).
//
// 적분은 원본과 같은 반암시적 오일러이고, 걸음은 1/60 초를 넘지 않게 쪼갠다.
// 검사 시각 이동(`?t=`)은 엔진이 1/60 × 재생 속도로 한 걸음씩 부르므로 원본과
// 같은 걸음이 된다.
// ========================================================================

import type { EnvironmentDef, StageDef, TimelineFrame } from '@aperi21/schema';
import { tidalForceSchema } from './schema';
import type { TidalForceState } from './state';

/** 적분 걸음의 상한(초). 원본 `PieceKit.DT`. */
const DT = 1 / 60;
/** 흐름 무늬 위상의 개수. 원본이 뽑아 둔 수 그대로 — 격자 칸이 이보다 적어 한 바퀴 돌지 않는다. */
const STREAK_SEED_COUNT = 400;

type Constants = Record<string, number>;

function constant(c: Constants, name: string): number {
  const v = c[name];
  if (typeof v !== 'number') throw new Error(`tidal-force: stage.constants.${name} 이 선언되어야 한다`);
  return v;
}

/** 시드 난수 (mulberry32) — 원본 `PieceKit.random` 과 같은 수열이다. */
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

/**
 * 먼지의 처음 상대 위치와 흐름 무늬 위상. 원본과 같은 순서로 뽑는다 —
 * 먼저 원판 안 자리(반지름, 각), 이어서 위상 400 개.
 */
export function seededOffsets(c: Constants): { offsets: number[]; streakSeeds: number[] } {
  const random = mulberry32(constant(c, 'seed'));
  const r0 = constant(c, 'r0');
  const n = constant(c, 'dustCount');
  const offsets = [r0, 0, -r0, 0];
  for (let i = 2; i < n; i++) {
    const r = r0 * Math.sqrt(random());
    const a = random() * Math.PI * 2;
    offsets.push(r * Math.cos(a), r * Math.sin(a));
  }
  const streakSeeds: number[] = [];
  for (let i = 0; i < STREAK_SEED_COUNT; i++) streakSeeds.push(random());
  return { offsets, streakSeeds };
}

/** 중력 상수 × 천체 질량. 중심이 `freeFallTime` 에 천체에 닿도록 고른다. */
export function gravityParameter(c: Constants): number {
  const d0 = constant(c, 'd0');
  const tff = constant(c, 'freeFallTime');
  return ((Math.PI / 2) ** 2 * d0 ** 3) / (2 * tff * tff);
}

/** 자리 (x, y) 의 중력 가속도. */
export function gravityAt(gm: number, x: number, y: number): [number, number] {
  const r2 = x * x + y * y;
  const r = Math.sqrt(r2);
  const k = -gm / (r2 * r);
  return [k * x, k * y];
}

/** 입자 하나를 한 걸음. `a` 는 [x, y, vx, vy] 가 `i` 에서 시작하는 배열이다. */
function advance(gm: number, a: number[], i: number, h: number): void {
  const [ax, ay] = gravityAt(gm, a[i]!, a[i + 1]!);
  a[i + 2] = a[i + 2]! + ax * h;
  a[i + 3] = a[i + 3]! + ay * h;
  a[i] = a[i]! + a[i + 2]! * h;
  a[i + 1] = a[i + 1]! + a[i + 3]! * h;
}

function integrate(gm: number, center: number[], dust: number[], h: number): void {
  advance(gm, center, 0, h);
  for (let i = 0; i < dust.length; i += 4) advance(gm, dust, i, h);
}

/** 양 끝이 모두 처음 반지름의 `stretchRatio` 배를 넘었는가 — 캡션이 화면에서 잰 값으로 갈린다. */
function isStretched(c: Constants, center: readonly number[], dust: readonly number[]): boolean {
  const near = dust[0]! - center[0]!;
  const far = center[0]! - dust[4]!;
  return Math.min(near, far) / constant(c, 'r0') > constant(c, 'stretchRatio');
}

/** 구름을 처음 자리에 놓고 `headStart` 만큼 미리 떨어뜨린다. 매 주기 시작이 이 모습이다. */
export function resetCloud(
  c: Constants,
  offsets: readonly number[],
  streakSeeds: readonly number[],
  clock: number,
  cycle: number,
): TidalForceState {
  const gm = gravityParameter(c);
  const d0 = constant(c, 'd0');
  const center = [-d0, 0, 0, 0];
  const dust: number[] = [];
  for (let i = 0; i < offsets.length; i += 2) dust.push(-d0 + offsets[i]!, offsets[i + 1]!, 0, 0);
  const n = Math.round(constant(c, 'headStart') / DT);
  for (let i = 0; i < n; i++) integrate(gm, center, dust, DT);
  return {
    clock,
    cycle,
    center,
    dust,
    offsets,
    streakSeeds,
    stretched: isStretched(c, center, dust),
  };
}

/** 시간표 선언에서 한 주기의 길이와 적분이 멈추는 시각(흐려지는 단계의 시작). */
function cycleShape(): { period: number; freezeAt: number } {
  const phases = tidalForceSchema.timeline?.phases ?? [];
  let period = 0;
  let freezeAt = Number.POSITIVE_INFINITY;
  for (const p of phases) {
    if (p.id === 'fade') freezeAt = period;
    period += p.duration;
  }
  return { period, freezeAt };
}

export function step(params: {
  state: TidalForceState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): TidalForceState {
  const { state, dt, stage } = params;
  const c = stage.constants;
  const { period, freezeAt } = cycleShape();
  const clock = state.clock + dt;
  const cycle = Math.floor(clock / period);

  // 주기가 넘어가면 둥근 구름이 먼 자리에서 다시 떨어지기 시작한다.
  if (cycle !== state.cycle) return resetCloud(c, state.offsets, state.streakSeeds, clock, cycle);

  // 흐려지는 동안에는 멈춘 채로 흐려진다.
  if (clock - cycle * period >= freezeAt) return { ...state, clock };

  const gm = gravityParameter(c);
  const center = state.center.slice();
  const dust = state.dust.slice();
  const n = Math.max(1, Math.ceil(dt / DT - 1e-9));
  const h = dt / n;
  for (let i = 0; i < n; i++) integrate(gm, center, dust, h);
  return { ...state, clock, center, dust, stretched: isStretched(c, center, dust) };
}

/**
 * **화면에서 흐른 시간** — 흐름 무늬의 위상이 이것으로 돈다.
 *
 * 원본은 가장 늘어난 모습을 느리게 보여 주는 동안에도 무늬는 보통 빠르기로 흘렀다.
 * 조각 시계는 느린 단계에서 느리게 흐르므로, 단계마다 `timeScale` 로 나눠 되돌린다.
 */
export function screenClock(frame: TimelineFrame): number {
  const phases = tidalForceSchema.timeline?.phases ?? [];
  let screenPeriod = 0;
  let screenU = 0;
  let start = 0;
  for (const p of phases) {
    const scale = p.timeScale ?? 1;
    const inPhase = Math.min(Math.max(frame.u - start, 0), p.duration);
    screenU += inPhase / scale;
    screenPeriod += p.duration / scale;
    start += p.duration;
  }
  return frame.cycle * screenPeriod + screenU;
}
