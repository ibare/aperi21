// ========================================================================
// sound-through-materials — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 시각의 함수이고, `step` 은 항등이다.
//
//   떨림 덩어리의 가운데   x_c(τ) = −2σ + v τ          (판 뒤에서 출발해 통을 건너간다)
//   알갱이의 밀려남        u(x, τ) = A · exp(−((x − x_c)/σ)²)
//
// 네 통이 다른 것은 v 하나다. 진공 통에는 알갱이가 없으므로 u 를 실어 나를 것이 없다 — 떨림은 판에서
// 멈춘다. 듣는 곳은 덩어리 가운데가 통 끝(x = L)에 닿는 순간 켜진다.
//
// 단계 경계를 상수로 두지 않는다 — 시간표의 `duration(id)` · `at(id)` 로 읽는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';

import {
  LANE_HALF,
  LANE_LENGTH,
  LANE_Y,
  PULSE_AMPLITUDE,
  PULSE_WIDTH,
  JITTER_AIR,
  JITTER_STEEL,
  JITTER_WATER,
  SEED,
  SPACING_AIR,
  SPACING_STEEL,
  SPACING_WATER,
  SPEED_AIR,
  SPEED_STEEL,
  SPEED_WATER,
} from './schema';
import type { SoundThroughMaterialsState } from './state';

export interface SoundThroughMaterialsConstants {
  /** 쇠 · 물 · 공기 속 소리 빠르기(m/s). */
  speedSteel: number;
  speedWater: number;
  speedAir: number;
  /** 통 길이(m). */
  laneLength: number;
  /** 떨림 덩어리 반폭 σ(m). */
  pulseWidth: number;
  /** 알갱이가 밀려나는 폭(m). */
  amplitude: number;
  /** 알갱이 간격(m). */
  spacingSteel: number;
  spacingWater: number;
  spacingAir: number;
  /** 알갱이 흩뿌림 폭(간격 대비). */
  jitterSteel: number;
  jitterWater: number;
  jitterAir: number;
  /** 흩뿌림 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): SoundThroughMaterialsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    speedSteel: c.speedSteel ?? SPEED_STEEL,
    speedWater: c.speedWater ?? SPEED_WATER,
    speedAir: c.speedAir ?? SPEED_AIR,
    laneLength: c.laneLength ?? LANE_LENGTH,
    pulseWidth: c.pulseWidth ?? PULSE_WIDTH,
    amplitude: c.amplitude ?? PULSE_AMPLITUDE,
    spacingSteel: c.spacingSteel ?? SPACING_STEEL,
    spacingWater: c.spacingWater ?? SPACING_WATER,
    spacingAir: c.spacingAir ?? SPACING_AIR,
    jitterSteel: c.jitterSteel ?? JITTER_STEEL,
    jitterWater: c.jitterWater ?? JITTER_WATER,
    jitterAir: c.jitterAir ?? JITTER_AIR,
    seed: c.seed ?? SEED,
  };
}

export type LaneId = 'steel' | 'water' | 'air' | 'vacuum';

/** 통 하나 — 소리 빠르기(진공은 없음)와 알갱이 간격(진공은 없음). */
export interface Lane {
  id: LaneId;
  speed: number | null;
  spacing: number | null;
}

/** 네 통 — 위부터 쇠 · 물 · 공기 · 진공. */
export function lanes(c: SoundThroughMaterialsConstants): readonly Lane[] {
  return [
    { id: 'steel', speed: c.speedSteel, spacing: c.spacingSteel },
    { id: 'water', speed: c.speedWater, spacing: c.spacingWater },
    { id: 'air', speed: c.speedAir, spacing: c.spacingAir },
    { id: 'vacuum', speed: null, spacing: null },
  ];
}

/**
 * 판을 두드린 뒤 흐른 물리 시간(초). 단계의 **선언된 길이 × 진행도** 라서 두드리기 전에는 0,
 * `hold` · `fade` 동안은 건너감 끝 시각에 붙잡힌다 (S-piece).
 */
export function travelTime(tl: TimelineFrame): number {
  return tl.duration('travel') * tl.at('travel');
}

/** 떨림 덩어리 가운데의 자리(판에서 m). 판 뒤 2σ 에서 출발한다. */
export function pulseCenter(speed: number, tau: number, c: SoundThroughMaterialsConstants): number {
  return -2 * c.pulseWidth + speed * tau;
}

/** 평형 자리 x 의 알갱이가 밀려난 거리(m, 오른쪽이 +). */
export function displacement(x: number, center: number, c: SoundThroughMaterialsConstants): number {
  const d = (x - center) / c.pulseWidth;
  return c.amplitude * Math.exp(-d * d);
}

/** 떨림이 통 끝에 닿았는가. 진공은 언제나 거짓이다. */
export function arrived(lane: Lane, tau: number, c: SoundThroughMaterialsConstants): boolean {
  if (lane.speed === null) return false;
  return pulseCenter(lane.speed, tau, c) >= c.laneLength;
}

/** 흐려지는 단계의 짙기 0~1. 다음 주기가 두드림부터 다시 시작한다. */
export function markOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

// ------------------------------------------------------------------------
// 알갱이 배치 — 시드 결정적
// ------------------------------------------------------------------------

/** mulberry32 — 시드를 받는 결정적 난수. `Math.random` 을 쓰지 않는다 (S-sim). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 알갱이를 통 벽에서 띄우는 몫(간격 대비). */
const WALL_MARGIN = 0.5;

/**
 * 한 통의 알갱이 평형 자리. 가로 · 세로 간격이 같은 격자에 흩뿌림을 얹는다. 흩뿌린 자리가 통 밖으로
 * 나가지 않게 자른다. 진공은 빈 배열이다.
 */
export function restPositions(lane: Lane, c: SoundThroughMaterialsConstants): Vec2[] {
  if (lane.spacing === null || lane.id === 'vacuum') return [];
  const s = lane.spacing;
  const share = lane.id === 'steel' ? c.jitterSteel : lane.id === 'water' ? c.jitterWater : c.jitterAir;
  const jitter = share * s;
  const rand = mulberry32(c.seed * 97 + lanes(c).findIndex((l) => l.id === lane.id));
  const y0 = LANE_Y[lane.id];
  const inner = LANE_HALF - WALL_MARGIN * s;
  const rows = Math.max(1, Math.floor((2 * inner) / s + 1e-9) + 1);
  const cols = Math.max(1, Math.floor((c.laneLength - 2 * WALL_MARGIN * s) / s + 1e-9) + 1);
  const rowStart = y0 - ((rows - 1) * s) / 2;
  const out: Vec2[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const jx = (rand() * 2 - 1) * jitter;
      const jy = (rand() * 2 - 1) * jitter;
      const x = Math.min(c.laneLength - WALL_MARGIN * s, Math.max(WALL_MARGIN * s, WALL_MARGIN * s + k * s + jx));
      const y = Math.min(y0 + inner, Math.max(y0 - inner, rowStart + r * s + jy));
      out.push([x, y]);
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 자리가 시각의 함수다. */
export function step(params: { state: SoundThroughMaterialsState }): SoundThroughMaterialsState {
  return params.state;
}
