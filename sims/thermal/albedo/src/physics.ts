// ========================================================================
// albedo — 순수 물리 · 배치 계산
// ========================================================================
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
//
// - 알갱이 k 는 시각 k / rayRate 에 하늘 위 끝을 떠나 fallTime 뒤 표면에 닿는다. 네 칸이
//   같은 k 를 같은 시각에 받는다 — 「같은 수의 햇빛」.
// - 되튈지는 닿는 순간의 반사율 a 로 floor((k+1)a + φ) − floor(ka + φ) 가 1 인지로 정한다.
//   반사율이 그대로면 어느 구간에서나 되튄 수 / 닿은 수가 a 에서 한 알갱이 이상 어긋나지
//   않는다 — 무작위로 뽑으면 짧은 구간에서 바다가 눈보다 많이 되튀는 주기가 생긴다.
// - 막대는 이번 주기에 먹힌 알갱이 수다. 한 알갱이가 한 계단이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ALBEDO_DESERT,
  ALBEDO_FOREST,
  ALBEDO_OCEAN,
  ALBEDO_SNOW,
  FALL_TIME,
  GROUND_DEPTH,
  LANE_GAP,
  LANE_W,
  RAY_MARGIN,
  RAY_RATE,
  RAY_SEED,
  SINK_TIME,
  SKY_TOP,
  SUN_SLANT,
} from './schema';
import type { AlbedoState } from './state';

export interface AlbedoConstants {
  albedoSnow: number;
  albedoDesert: number;
  albedoForest: number;
  albedoOcean: number;
  rayRate: number;
  seed: number;
  fallTime: number;
  sinkTime: number;
}

export function readConstants(stage: StageDef): AlbedoConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    albedoSnow: c.albedoSnow ?? ALBEDO_SNOW,
    albedoDesert: c.albedoDesert ?? ALBEDO_DESERT,
    albedoForest: c.albedoForest ?? ALBEDO_FOREST,
    albedoOcean: c.albedoOcean ?? ALBEDO_OCEAN,
    rayRate: c.rayRate ?? RAY_RATE,
    seed: c.seed ?? RAY_SEED,
    fallTime: c.fallTime ?? FALL_TIME,
    sinkTime: c.sinkTime ?? SINK_TIME,
  };
}

// ------------------------------------------------------------------------
// 칸
// ------------------------------------------------------------------------

/**
 * 칸 하나의 반사율. `melts` 인 칸은 `melt` 동안 바다의 값으로 내려가고 `clear` 동안 되돌아온다.
 * 칸 수 · 순서는 코드에 있다 (장부 G105 — 목록을 스테이지 상수로 선언할 수 없다).
 */
export interface LaneDef {
  albedo: number;
  melts: boolean;
}

export function lanes(c: AlbedoConstants): LaneDef[] {
  return [
    { albedo: c.albedoSnow, melts: true },
    { albedo: c.albedoDesert, melts: false },
    { albedo: c.albedoForest, melts: false },
    { albedo: c.albedoOcean, melts: false },
  ];
}

/** 칸 i 의 가운데 x. 칸들이 원점을 가운데로 가로로 늘어선다. */
export function laneCenter(i: number, count: number): number {
  const pitch = LANE_W + LANE_GAP;
  return (i - (count - 1) / 2) * pitch;
}

// ------------------------------------------------------------------------
// 시각
// ------------------------------------------------------------------------

/** 주기 안 시각 u 에서 구간 [from, to] 의 선형 진행도 0~1. */
function linearSpan(u: number, from: number, to: number): number {
  if (to <= from) return u >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (u - from) / (to - from)));
}

/**
 * 녹는 정도 0~1 — 주기 안 시각 u 에서. `melt` 동안 0 → 1, `clear` 동안 1 → 0.
 * 지난 시각(알갱이가 닿은 때)을 묻기 때문에 `at()` 대신 단계의 시작 · 끝에서 선형으로 되짚는다.
 */
export function meltAt(tl: TimelineFrame, u: number): number {
  const m = linearSpan(u, tl.start('melt'), tl.end('melt'));
  const f = linearSpan(u, tl.start('clear'), tl.end('clear'));
  return m * (1 - f);
}

/** 칸의 반사율 — 주기 안 시각 u 에서. */
export function albedoAt(lane: LaneDef, c: AlbedoConstants, tl: TimelineFrame, u: number): number {
  if (!lane.melts) return lane.albedo;
  return lane.albedo + (c.albedoOcean - lane.albedo) * meltAt(tl, u);
}

/** 조각 시계 t 를 주기 안 시각으로 — 지금 주기보다 앞이면 앞 주기의 시각. */
function cycleTime(tl: TimelineFrame, t: number): number {
  const u = tl.u - (tl.t - t);
  return ((u % tl.period) + tl.period) % tl.period;
}

// ------------------------------------------------------------------------
// 결정적 난수 — `Math.random` 을 쓰지 않는다 (같은 시각은 같은 화면)
// ------------------------------------------------------------------------

/** (시드, 칸, 번호) → [0, 1). 알갱이마다 제 자리를 뽑아 프레임마다 떨지 않는다. */
function hash01(seed: number, lane: number, k: number): number {
  let x = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(lane + 1, 0x85ebca6b) ^ Math.imul(k | 0, 0xc2b2ae35)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** 알갱이 k 가 반사율 a 에서 되튀는가. φ 는 칸마다 어긋나게 하는 몫. */
export function bounces(k: number, a: number, phi: number): boolean {
  return Math.floor((k + 1) * a + phi) - Math.floor(k * a + phi) >= 1;
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

export interface RayReading {
  positions: Vec2[];
  velocities: Vec2[];
  opacities: number[];
  /** 이번 주기에 이 칸에 먹힌 알갱이 수. */
  absorbed: number;
  /** 한 주기 동안 한 칸에 닿는 알갱이 수 — 막대가 가득 차는 수. */
  perCycle: number;
}

/**
 * 칸 하나의 알갱이. 떨어지는 것은 비스듬히 내려오고, 되튄 것은 거울처럼 비스듬히 올라가
 * 하늘 위 끝을 지나 사라지고, 먹힌 것은 표면 속으로 가라앉으며 흐려진다.
 */
export function rays(
  tl: TimelineFrame,
  c: AlbedoConstants,
  lane: LaneDef,
  laneIdx: number,
  x0: number,
  sinkDepth: number,
): RayReading {
  const vy = SKY_TOP / c.fallTime;
  const vx = SUN_SLANT * vy;
  const drift = SUN_SLANT * SKY_TOP;
  const lo = x0 - LANE_W / 2 + RAY_MARGIN + drift;
  const span = Math.max(0, LANE_W - 2 * (RAY_MARGIN + drift));
  const phi = hash01(c.seed, laneIdx, -1);
  const life = c.fallTime + Math.max(c.fallTime, c.sinkTime);

  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  const opacities: number[] = [];

  const kFirst = Math.ceil((tl.t - life) * c.rayRate);
  const kLast = Math.floor(tl.t * c.rayRate);
  for (let k = kFirst; k <= kLast; k++) {
    const born = k / c.rayRate;
    const arrive = born + c.fallTime;
    const xa = lo + span * hash01(c.seed, laneIdx, k);
    const age = tl.t - born;
    if (age < 0) continue;
    if (tl.t < arrive) {
      const s = arrive - tl.t;
      positions.push([xa - vx * s, vy * s]);
      velocities.push([vx, -vy]);
      opacities.push(1);
      continue;
    }
    const after = tl.t - arrive;
    const a = albedoAt(lane, c, tl, cycleTime(tl, arrive));
    if (bounces(k, a, phi)) {
      if (after > c.fallTime) continue;
      positions.push([xa + vx * after, vy * after]);
      velocities.push([vx, vy]);
      opacities.push(1);
    } else {
      if (after > c.sinkTime) continue;
      const p = after / c.sinkTime;
      positions.push([xa, -sinkDepth * p]);
      velocities.push([0, 0]);
      opacities.push(1 - p);
    }
  }

  // 이번 주기에 닿은 알갱이 중 먹힌 것.
  const cycleStart = tl.t - tl.u;
  const aFirst = Math.ceil((cycleStart - c.fallTime) * c.rayRate);
  const aLast = Math.floor((tl.t - c.fallTime) * c.rayRate);
  let absorbed = 0;
  for (let k = aFirst; k <= aLast; k++) {
    const arrive = k / c.rayRate + c.fallTime;
    if (arrive < cycleStart) continue;
    const a = albedoAt(lane, c, tl, cycleTime(tl, arrive));
    if (!bounces(k, a, phi)) absorbed++;
  }

  return { positions, velocities, opacities, absorbed, perCycle: c.rayRate * tl.period };
}

/** 먹힌 알갱이가 표면 속으로 가라앉는 깊이 — 표면 두께의 이 몫. */
export function sinkDepthOf(frac: number): number {
  return GROUND_DEPTH * frac;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AlbedoState }): AlbedoState {
  return params.state;
}
