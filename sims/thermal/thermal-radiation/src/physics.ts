// ========================================================================
// thermal-radiation — 순수 물리 · 배치 계산
// ========================================================================
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
//
// - 가리개 높이는 `lift` · `drop` 진행도에서 온다.
// - 줄기마다 가리개 아래 끝이 그 줄기를 지나는 시각(가려짐이 풀림 · 다시 가려짐)을
//   그 진행도에서 되짚고, 그 시각부터 물결 앞머리 · 꼬리가 판으로 간다 (`span` — 시차 출발).
// - 판이 받은 몫은 줄기마다 판에 닿아 있던 시간을 더한 것이다. 막대는 그 몫만큼 오른다.
// - 공기 알갱이는 (시드, 시각)의 닫힌 식으로 벽에서 튄다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  AIR_COUNT,
  AIR_SEED,
  AIR_SPEED,
  BLOCK_SIZE,
  BLOCK_TEMP,
  BLOCK_X,
  BOX,
  GAP,
  GAUGE_MAX,
  GAUGE_MIN,
  PLATE_END,
  PLATE_START,
  RIPPLE_SPEED,
  SHIELD_AT,
  SHIELD_CLEAR,
  SHIELD_SIZE,
  WAVE_AMP,
  WAVE_LENGTH,
} from './schema';
import type { ThermalRadiationState } from './state';

export interface ThermalRadiationConstants {
  blockTemp: number;
  plateStart: number;
  plateEnd: number;
  gaugeMin: number;
  gaugeMax: number;
  gap: number;
  waveLength: number;
  waveAmp: number;
  rippleSpeed: number;
  airCount: number;
  airSpeed: number;
  seed: number;
}

export function readConstants(stage: StageDef): ThermalRadiationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    blockTemp: c.blockTemp ?? BLOCK_TEMP,
    plateStart: c.plateStart ?? PLATE_START,
    plateEnd: c.plateEnd ?? PLATE_END,
    gaugeMin: c.gaugeMin ?? GAUGE_MIN,
    gaugeMax: c.gaugeMax ?? GAUGE_MAX,
    gap: c.gap ?? GAP,
    waveLength: c.waveLength ?? WAVE_LENGTH,
    waveAmp: c.waveAmp ?? WAVE_AMP,
    rippleSpeed: c.rippleSpeed ?? RIPPLE_SPEED,
    airCount: c.airCount ?? AIR_COUNT,
    airSpeed: c.airSpeed ?? AIR_SPEED,
    seed: c.seed ?? AIR_SEED,
  };
}

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

export interface Layout {
  /** 덩이 오른쪽 면 — 물결이 나가는 자리. */
  blockFace: number;
  /** 판 왼쪽 면 — 물결이 닿는 자리. */
  plateFace: number;
  /** 가리개 가운데 x · 왼쪽 면(물결이 끊기는 자리). */
  shieldX: number;
  shieldFace: number;
  /** 내린 · 걷은 가리개의 아래 끝 높이. */
  shieldDownBottom: number;
  shieldUpBottom: number;
}

export function layout(c: ThermalRadiationConstants): Layout {
  const blockFace = BLOCK_X + BLOCK_SIZE[0] / 2;
  const plateFace = blockFace + c.gap;
  const shieldX = blockFace + c.gap * SHIELD_AT;
  return {
    blockFace,
    plateFace,
    shieldX,
    shieldFace: shieldX - SHIELD_SIZE[0] / 2,
    shieldDownBottom: -SHIELD_SIZE[1] / 2,
    shieldUpBottom: BOX.maxY + SHIELD_CLEAR,
  };
}

/** 가리개가 걷힌 정도 0~1. `lift` 에서 오르고 `drop` 에서 내려온다. */
export function shieldRaise(tl: TimelineFrame): number {
  return tl.at('lift') - tl.at('drop');
}

/** 지금 가리개 아래 끝의 높이. */
export function shieldBottom(tl: TimelineFrame, L: Layout): number {
  return L.shieldDownBottom + (L.shieldUpBottom - L.shieldDownBottom) * shieldRaise(tl);
}

// ------------------------------------------------------------------------
// 물결 줄기
// ------------------------------------------------------------------------

export interface BeamReading {
  /** 가리개를 지난 물결의 꼬리 · 앞머리 x. 같으면 가리개 너머에 물결이 없다. */
  tail: number;
  front: number;
  /** 이 줄기가 판에 닿아 있는 시간 구간(주기 안 시각). */
  arrive: number;
  leave: number;
}

/**
 * 줄기 하나. 가리개 아래 끝이 줄기 위쪽 끝(`y + amp`)을 지나는 순간 가려짐이 풀리고,
 * 내려올 때 같은 자리를 지나는 순간 다시 가려진다. `lift` · `drop` 이 `linear` 라서
 * 그 시각은 진행도의 비례로 되짚힌다.
 */
export function readBeam(
  tl: TimelineFrame,
  L: Layout,
  y: number,
  c: ThermalRadiationConstants,
): BeamReading {
  const edge = y + c.waveAmp;
  const travel = L.shieldUpBottom - L.shieldDownBottom;
  const frac = Math.min(1, Math.max(0, (edge - L.shieldDownBottom) / travel));
  const uncover = tl.start('lift') + tl.duration('lift') * frac;
  const cover = tl.start('drop') + tl.duration('drop') * (1 - frac);
  const dCross = tl.duration('cross');
  const dDrain = tl.duration('drain');
  const reach = L.plateFace - L.shieldFace;
  return {
    front: L.shieldFace + reach * tl.span(uncover, uncover + dCross),
    tail: L.shieldFace + reach * tl.span(cover, cover + dDrain),
    arrive: uncover + dCross,
    leave: cover + dDrain,
  };
}

/**
 * 판이 이번 주기에 받은 몫 0~1 — 줄기마다 판에 닿아 있던 시간을 더해 전체로 나눈다.
 * 막대는 이 몫만큼 처음 온도에서 멈춘 온도로 오르고, `fade` 에서 처음으로 돌아간다.
 */
export function absorbed(tl: TimelineFrame, beams: readonly BeamReading[]): number {
  let got = 0;
  let total = 0;
  for (const b of beams) {
    const len = Math.max(0, b.leave - b.arrive);
    total += len;
    got += Math.min(len, Math.max(0, tl.u - b.arrive));
  }
  const f = total > 0 ? got / total : 0;
  return f * (1 - tl.at('fade'));
}

/** 줄기 하나의 물결 표본. `from` → `to` 사이, 위상은 시계를 따라 판 쪽으로 흐른다. */
export function waveLine(
  from: number,
  to: number,
  y: number,
  origin: number,
  t: number,
  c: ThermalRadiationConstants,
  samplesPerWave: number,
): Vec2[] {
  const len = to - from;
  if (len <= 0) return [];
  const n = Math.max(2, Math.ceil((len / c.waveLength) * samplesPerWave) + 1);
  const k = (2 * Math.PI) / c.waveLength;
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const x = from + (len * i) / (n - 1);
    pts.push([x, y + c.waveAmp * Math.sin(k * (x - origin - c.rippleSpeed * t))]);
  }
  return pts;
}

// ------------------------------------------------------------------------
// 공기 알갱이 — (시드, 시각)의 닫힌 식
// ------------------------------------------------------------------------

/** 시드 결정적 난수 (mulberry32). `Math.random` 을 쓰지 않는다 — 같은 시각은 같은 화면. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** 선분 [lo, hi] 안에서 벽에 튀는 1차원 자리. */
function bounce(p: number, lo: number, hi: number): number {
  const w = hi - lo;
  const m = (((p - lo) % (2 * w)) + 2 * w) % (2 * w);
  return lo + (m <= w ? m : 2 * w - m);
}

/**
 * 공기 알갱이 자리. 펌프가 끄는 정도(`pull`) 만큼 구멍 쪽으로 모인다 — `pump` 에서 0 → 1,
 * `fade` 에서 1 → 0 (다시 들어온 공기가 퍼진다).
 */
export function airPositions(
  tl: TimelineFrame,
  c: ThermalRadiationConstants,
  port: Vec2,
  margin: number,
): { positions: Vec2[]; pull: number } {
  const pull = tl.at('pump') * (1 - tl.at('fade'));
  const r = rng(c.seed);
  const lo: Vec2 = [BOX.minX + margin, BOX.minY + margin];
  const hi: Vec2 = [BOX.maxX - margin, BOX.maxY - margin];
  const positions: Vec2[] = [];
  for (let i = 0; i < c.airCount; i++) {
    const x0 = lo[0] + r() * (hi[0] - lo[0]);
    const y0 = lo[1] + r() * (hi[1] - lo[1]);
    const a = r() * 2 * Math.PI;
    const x = bounce(x0 + Math.cos(a) * c.airSpeed * tl.t, lo[0], hi[0]);
    const y = bounce(y0 + Math.sin(a) * c.airSpeed * tl.t, lo[1], hi[1]);
    positions.push([x + (port[0] - x) * pull, y + (port[1] - y) * pull]);
  }
  return { positions, pull };
}

/** 판의 지금 온도(℃) — 받은 몫만큼 처음 온도에서 멈춘 온도로. */
export function plateTemp(c: ThermalRadiationConstants, f: number): number {
  return c.plateStart + (c.plateEnd - c.plateStart) * f;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ThermalRadiationState }): ThermalRadiationState {
  return params.state;
}
