// ========================================================================
// pressure-from-collisions — 순수 물리
// ========================================================================
// 분자는 벽 사이를 오가는 닫힌 식이다 — (시드, 시각)이 같으면 같은 자리다 (S-sim).
// 모든 분자는 같은 가로 속력 v(오른쪽 상자는 kv)로 오가므로, 한 번 벽을 때릴 때
// 벽이 받는 운동량 변화는 상자마다 하나(2mv · 2m·kv)다.
//
// 오른쪽 벽에 닿는 순간은 가로 위상이 반 바퀴(k + ½)를 지나는 시각이다. 그 시각들을
// 닫힌 식으로 풀어 섬광 · 세는 눈금 · 막대 칸을 **실제로 부딪힌 순간**에 쌓는다.
// 횟수를 코드가 적어 두지 않는다 — 세는 동안이 한 번 오가는 시간과 같으면 왼쪽 상자는
// 분자마다 정확히 한 번, 오른쪽 상자는 k 번이 **계산으로** 나온다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  ARROW_PER_MOMENTUM,
  BLOCK_PER_MOMENTUM,
  BOX_HEIGHT,
  BOX_WIDTH,
  FLASH_SECONDS,
  MOLECULE_COUNT,
  MOLECULE_MARGIN,
  MOLECULE_MASS,
  MOLECULE_SEED,
  MOLECULE_SPEED,
  SPEED_FACTOR,
  VERTICAL_RATE_MAX,
  VERTICAL_RATE_MIN,
} from './schema';
import type { PressureFromCollisionsState } from './state';

export interface PressureFromCollisionsConstants {
  /** 분자 질량 · 왼쪽 상자의 가로 속력 · 오른쪽 상자의 속력 배수. */
  mass: number;
  speed: number;
  speedFactor: number;
  molecules: number;
  seed: number;
  verticalRateMin: number;
  verticalRateMax: number;
  /** 상자 안쪽 가로 · 세로(월드). */
  boxWidth: number;
  boxHeight: number;
  /** 표시 배율 — 운동량 1 의 화살표 길이 · 막대 칸 높이(월드). */
  arrowPerMomentum: number;
  blockPerMomentum: number;
  /** 벽 섬광이 남는 시간(초). */
  flashSeconds: number;
}

export function readConstants(stage: StageDef): PressureFromCollisionsConstants {
  const c = stage.constants ?? {};
  return {
    mass: c.mass ?? MOLECULE_MASS,
    speed: c.speed ?? MOLECULE_SPEED,
    speedFactor: c.speedFactor ?? SPEED_FACTOR,
    molecules: c.molecules ?? MOLECULE_COUNT,
    seed: c.seed ?? MOLECULE_SEED,
    verticalRateMin: c.verticalRateMin ?? VERTICAL_RATE_MIN,
    verticalRateMax: c.verticalRateMax ?? VERTICAL_RATE_MAX,
    boxWidth: c.boxWidth ?? BOX_WIDTH,
    boxHeight: c.boxHeight ?? BOX_HEIGHT,
    arrowPerMomentum: c.arrowPerMomentum ?? ARROW_PER_MOMENTUM,
    blockPerMomentum: c.blockPerMomentum ?? BLOCK_PER_MOMENTUM,
    flashSeconds: c.flashSeconds ?? FLASH_SECONDS,
  };
}

// ------------------------------------------------------------------------
// 분자 — 시드에서 한 번 뽑는다
// ------------------------------------------------------------------------

/** 분자 하나. 처음 위상(가로 · 세로, 0~1)과 세로로 오가는 빈도(회/초, 왼쪽 상자). */
export interface Molecule {
  x0: number;
  y0: number;
  ry: number;
}

/** 시드 결정적 난수 (mulberry32). 같은 시드는 같은 줄을 낸다 (S-sim). */
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

export function createMolecules(c: PressureFromCollisionsConstants): Molecule[] {
  const rand = mulberry32(c.seed);
  const span = c.verticalRateMax - c.verticalRateMin;
  const out: Molecule[] = [];
  for (let i = 0; i < c.molecules; i++) {
    out.push({ x0: rand(), y0: rand(), ry: c.verticalRateMin + span * rand() });
  }
  return out;
}

// ------------------------------------------------------------------------
// 상자 하나 — 속력 배수 s(왼쪽 1, 오른쪽 k)
// ------------------------------------------------------------------------

/** 상자 안쪽의 왼쪽 아래 모서리(월드). */
export interface BoxFrame {
  left: number;
  bottom: number;
}

/** 분자가 오가는 폭 · 높이(월드) — 벽에서 여유만큼 들인 것. */
function travel(c: PressureFromCollisionsConstants): { w: number; h: number } {
  return { w: c.boxWidth - 2 * MOLECULE_MARGIN, h: c.boxHeight - 2 * MOLECULE_MARGIN };
}

/** 가로로 한 번 오가기(위상 1)의 빈도(회/초). 거리 2w 를 속력 s·v 로. */
function crossRate(c: PressureFromCollisionsConstants, s: number): number {
  return (s * c.speed) / (2 * travel(c).w);
}

/** 한 번 오가기(위상 0~1)를 0 → 1 → 0 자리로 접는다. ½ 이 오른쪽 벽이다. */
function fold(theta: number): number {
  const f = theta - Math.floor(theta);
  return 1 - Math.abs(1 - 2 * f);
}
/** 접은 자리의 기울기 부호 — 가는 중이면 +, 돌아오는 중이면 −. */
function foldSlope(theta: number): number {
  const f = theta - Math.floor(theta);
  return f < 0.5 ? 2 : -2;
}

export interface MoleculeField {
  positions: [number, number][];
  velocities: [number, number][];
}

/** 시각 t 의 분자 자리와 속도(월드). 속도는 자취 획에만 쓴다. */
export function readMolecules(
  molecules: readonly Molecule[],
  t: number,
  s: number,
  box: BoxFrame,
  c: PressureFromCollisionsConstants,
): MoleculeField {
  const { w, h } = travel(c);
  const rx = crossRate(c, s);
  const positions: [number, number][] = [];
  const velocities: [number, number][] = [];
  for (const m of molecules) {
    const ry = m.ry * s;
    const tx = m.x0 + rx * t;
    const ty = m.y0 + ry * t;
    positions.push([box.left + MOLECULE_MARGIN + w * fold(tx), box.bottom + MOLECULE_MARGIN + h * fold(ty)]);
    velocities.push([w * foldSlope(tx) * rx, h * foldSlope(ty) * ry]);
  }
  return { positions, velocities };
}

/** 오른쪽 벽에 닿은 한 번 — 시각(초)과 닿은 높이(월드 y). */
export interface WallHit {
  time: number;
  y: number;
}

/**
 * 구간 (from, to] 안에 오른쪽 벽에 닿은 모든 순간, 시각 순.
 *
 * 가로 위상 x0 + r·t 가 n + ½ 을 지나는 시각이 닿는 순간이다. 구간의 위상 차가 정수면
 * 분자마다 그 수만큼 정확히 닿는다 — 반열린 구간이라 경계에서 두 번 세지 않는다.
 */
export function wallHits(
  molecules: readonly Molecule[],
  from: number,
  to: number,
  s: number,
  box: BoxFrame,
  c: PressureFromCollisionsConstants,
): WallHit[] {
  if (to <= from) return [];
  const { h } = travel(c);
  const rx = crossRate(c, s);
  const out: WallHit[] = [];
  for (const m of molecules) {
    const first = Math.floor(m.x0 + rx * from - 0.5) + 1;
    const last = Math.floor(m.x0 + rx * to - 0.5);
    for (let n = first; n <= last; n++) {
      const time = (n + 0.5 - m.x0) / rx;
      const y = box.bottom + MOLECULE_MARGIN + h * fold(m.y0 + m.ry * s * time);
      out.push({ time, y });
    }
  }
  return out.sort((a, b) => a.time - b.time);
}

/** 한 번 벽을 때릴 때 벽이 받는 운동량 변화 2m·(s·v). */
export function impulsePerHit(c: PressureFromCollisionsConstants, s: number): number {
  return 2 * c.mass * s * c.speed;
}

/** 쌓는 상태가 없다 — 모든 움직임이 시각의 함수다. */
export function step(params: { state: PressureFromCollisionsState }): PressureFromCollisionsState {
  return params.state;
}
