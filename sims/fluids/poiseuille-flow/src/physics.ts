// ========================================================================
// poiseuille-flow — 순수 물리
// ========================================================================
// 원본 좌표계(y 아래로 증가)에서 계산하고, 월드로 옮기는 것은 `worldY` 하나가 한다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { CELL, DOTS, DYE, FRAME, PIPE_X, PIPES, U_BASE } from './schema';
import type { PoiseuilleFlowState } from './state';

export type Pipe = (typeof PIPES)[number];

/** 원본 y(아래로 증가) → 월드 y(위로 증가). */
export function worldY(y: number): number {
  return FRAME.height - y;
}

/** 관 길이(월드). */
export const PIPE_LENGTH = PIPE_X.outlet - PIPE_X.inlet;

/** 중심 속도(월드/초) — 반지름 제곱에 비례. */
export function centerSpeed(pipe: Pipe): number {
  return U_BASE * pipe.speedFactor;
}

/** 포물선 속도 분포. `s` 는 중심선에서의 상대 거리 −1..1, 벽에서 0. */
export function speedAt(pipe: Pipe, s: number): number {
  return centerSpeed(pipe) * (1 - s * s);
}

/** 시드 난수 (mulberry32). 원본 하네스와 같은 수열이라 같은 시드는 같은 점 배치를 만든다. */
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

/** 흐름 점의 처음 자리. 관 순서대로 한 수열에서 뽑는다 — 원본과 같은 순서. */
export interface DotSeed {
  /** 중심선에서의 상대 거리 −1..1. */
  s: number;
  /** 입구에서의 처음 거리 0..L. */
  x0: number;
}

export function dotSeeds(seed: number = DOTS.seed): DotSeed[][] {
  const random = mulberry32(seed);
  return PIPES.map((pipe) => {
    const n = Math.round((DOTS.perSevenRadius * pipe.radius) / 7);
    const out: DotSeed[] = [];
    for (let i = 0; i < n; i++) {
      const s = random() * 2 - 1;
      out.push({ s, x0: random() * PIPE_LENGTH });
    }
    return out;
  });
}

/** 흐름 점의 지금 자리(월드). 위치 = 처음 위치 + u(s)·t 를 관 길이로 나눈 나머지. */
export function dotPositions(pipe: Pipe, seeds: readonly DotSeed[], t: number): Vec2[] {
  return seeds.map((d) => [
    PIPE_X.inlet + ((d.x0 + speedAt(pipe, d.s) * t) % PIPE_LENGTH),
    worldY(pipe.cy + d.s * (pipe.radius - DOTS.inset)),
  ]);
}

/**
 * 살아 있는 염료 전선. 입구에서 `DYE.interval` 마다 곧게 그어진 줄이 x(s) = 입구 + u(s)·나이
 * 로 늘어나 포물선이 된다. 나이에 따라 옅어진다 — 불투명도 1 − 나이/수명.
 */
export function dyeFronts(pipe: Pipe, t: number): { lines: Vec2[][]; opacities: number[] } {
  const lines: Vec2[][] = [];
  const opacities: number[] = [];
  const k0 = Math.ceil((t - DYE.life) / DYE.interval);
  const k1 = Math.floor(t / DYE.interval);
  for (let k = k0; k <= k1; k++) {
    const age = t - k * DYE.interval;
    if (age < 0 || age > DYE.life) continue;
    const line: Vec2[] = [];
    for (let i = 0; i <= DYE.samples; i++) {
      const s = -1 + (2 * i) / DYE.samples;
      line.push([PIPE_X.inlet + speedAt(pipe, s) * age, worldY(pipe.cy + s * pipe.radius)]);
    }
    lines.push(line);
    opacities.push(Math.max(0, 1 - age / DYE.life));
  }
  return { lines, opacities };
}

/** 받는 칸 하나 — 월드 사각형과 채움 비율 0..1. */
export interface CellFill {
  /** 왼쪽 아래 모서리(월드). */
  min: Vec2;
  /** 오른쪽 위 모서리(월드). */
  max: Vec2;
  fill: number;
}

/**
 * 받는 칸들. `fraction` 은 가는 관 한 칸 기준 채움 비율 0..1 이고, 굵은 관은 같은 비율에
 * 칸 수를 곱한 만큼을 아래 줄부터 한 칸씩 채운다.
 */
export function cells(pipe: Pipe, fraction: number): CellFill[] {
  const rows = Math.ceil(pipe.cells / pipe.cols);
  const gh = rows * CELL.size + (rows - 1) * CELL.gap;
  const gy = pipe.cy - gh / 2;
  const filled = fraction * pipe.cells;
  const out: CellFill[] = [];
  for (let i = 0; i < pipe.cells; i++) {
    const col = i % pipe.cols;
    const row = rows - 1 - Math.floor(i / pipe.cols);
    const x = CELL.left + col * (CELL.size + CELL.gap);
    const y = gy + row * (CELL.size + CELL.gap);
    out.push({
      min: [x, worldY(y + CELL.size)],
      max: [x + CELL.size, worldY(y)],
      fill: Math.max(0, Math.min(1, filled - i)),
    });
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PoiseuilleFlowState }): PoiseuilleFlowState {
  return params.state;
}
