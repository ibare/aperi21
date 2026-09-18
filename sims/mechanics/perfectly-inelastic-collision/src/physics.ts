// ========================================================================
// perfectly-inelastic-collision — 순수 물리
// ========================================================================
// 완전 비탄성 충돌: 붙은 뒤의 속력 v′ = m_A·v / (m_A + m_B). 운동량은 그대로이고
// 그 운동량을 더 큰 질량이 나눠 싣는다.
//
// 여기서 계산하는 것은 그 속력과, 운동량을 **칸**으로 쪼갠 배치다. 칸 하나가
// 운동량 한 몫이고, 칸 수는 충돌 전후로 같다 — 그것이 이 조각이 보이려는 것이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  EPISODES,
  HEIGHT_PER_SPEED,
  MASS_A,
  SPEED_A,
  STRUCK_LEFT,
  TILE_H,
  TILE_W,
  UNIT_W,
  type EpisodeDef,
} from './schema';
import type { PerfectlyInelasticCollisionState } from './state';

export interface PerfectlyInelasticCollisionConstants {
  /** 달려오는 수레의 질량. */
  massA: number;
  /** 달려오는 속력(월드/초). */
  speedA: number;
}

export function readConstants(stage: StageDef): PerfectlyInelasticCollisionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { massA: c.massA ?? MASS_A, speedA: c.speedA ?? SPEED_A };
}

/** 지금 시각이 속한 충돌. 단계 이름은 선언(`EPISODES`)이 가진다. */
export function episodeOf(phase: string): EpisodeDef {
  const found = EPISODES.find((e) => Object.values(e.phases).includes(phase));
  if (!found) throw new Error(`perfectly-inelastic-collision: 모르는 단계 ${phase}`);
  return found;
}

/** 한 충돌의 세 국면 — 달려오는 중 · 붙으며 퍼지는 중 · 함께 가는 중. */
export type EpisodePhase = 'before' | 'merge' | 'after';

export function phaseOf(tl: TimelineFrame, ep: EpisodeDef): EpisodePhase {
  if (tl.phase === ep.phases.merge) return 'merge';
  if (tl.phase === ep.phases.together || tl.phase === ep.phases.fade) return 'after';
  return 'before';
}

/** 한 충돌의 치수 — 폭 · 속력 · 칸의 줄 수. 모두 질량과 속력에서 나온다. */
export interface Layout {
  /** 달려오는 수레 · 멈춘 수레의 폭. */
  widthA: number;
  widthB: number;
  /** 붙은 뒤의 속력. */
  speedAfter: number;
  /** 충돌 전 칸 배치(가로 칸 수 · 세로 줄 수). */
  colsBefore: number;
  rowsBefore: number;
  /** 붙은 뒤 칸 배치. */
  colsAfter: number;
  rowsAfter: number;
  /** 칸의 개수. 충돌 전후가 같다. */
  tiles: number;
  /** 붙는 순간 달려온 수레의 왼쪽 끝이 놓이는 자리. */
  contactLeft: number;
}

export function layoutOf(
  ep: EpisodeDef,
  c: PerfectlyInelasticCollisionConstants,
): Layout {
  const widthA = c.massA * UNIT_W;
  const widthB = ep.massB * UNIT_W;
  const speedAfter = (c.massA * c.speedA) / (c.massA + ep.massB);
  const colsBefore = Math.round(widthA / TILE_W);
  const rowsBefore = Math.round((c.speedA * HEIGHT_PER_SPEED) / TILE_H);
  const colsAfter = Math.round((widthA + widthB) / TILE_W);
  const rowsAfter = Math.round((speedAfter * HEIGHT_PER_SPEED) / TILE_H);
  return {
    widthA,
    widthB,
    speedAfter,
    colsBefore,
    rowsBefore,
    colsAfter,
    rowsAfter,
    tiles: colsBefore * rowsBefore,
    contactLeft: STRUCK_LEFT - widthA,
  };
}

/**
 * 달려오는(그리고 붙은 뒤 함께 가는) 수레의 왼쪽 끝.
 *
 * 출발 자리를 상수로 두지 않는다 — 달려오는 단계가 **끝나는 순간** 붙는 자리에
 * 닿도록 거꾸로 센다. 그래서 저작자가 단계 길이를 늘리면 출발 자리가 따라 멀어진다.
 */
export function movingLeft(
  tl: TimelineFrame,
  ep: EpisodeDef,
  lay: Layout,
  c: PerfectlyInelasticCollisionConstants,
): number {
  if (phaseOf(tl, ep) === 'before') {
    return lay.contactLeft - c.speedA * (tl.end(ep.phases.approach) - tl.u);
  }
  return lay.contactLeft + lay.speedAfter * (tl.u - tl.start(ep.phases.merge));
}

/** 칸 하나의 자리 — 칸 격자의 (가로 번호, 세로 번호). 소수도 된다(퍼지는 중). */
export interface Cell {
  col: number;
  row: number;
}

/**
 * 칸 여덟 개의 자리.
 *
 * 충돌 전에는 달려오는 수레 위에 `colsBefore` 칸씩 쌓이고, 붙은 뒤에는 `colsAfter`
 * 칸씩 쌓인다. 번호 순서가 같으므로 **아래 줄은 제자리에 남고 위 줄이 오른쪽으로
 * 흘러내린다** — 쏟아져 퍼지는 모양이 여기서 나온다.
 *
 * 붙는 동안에는 두 자리를 진행도로 섞는다. 진행도의 이징은 선언이 정한다.
 */
export function tileCells(lay: Layout, spread: number): Cell[] {
  const out: Cell[] = [];
  for (let i = 0; i < lay.tiles; i++) {
    const before: Cell = { col: i % lay.colsBefore, row: Math.floor(i / lay.colsBefore) };
    const after: Cell = { col: i % lay.colsAfter, row: Math.floor(i / lay.colsAfter) };
    out.push({
      col: before.col + (after.col - before.col) * spread,
      row: before.row + (after.row - before.row) * spread,
    });
  }
  return out;
}

/** 퍼진 정도 0~1. 달려오는 동안 0, 붙는 동안 자라고, 함께 가는 동안 1. */
export function spreadOf(tl: TimelineFrame, ep: EpisodeDef): number {
  return tl.at(ep.phases.merge);
}

/**
 * 이번 충돌이 화면에 드러난 정도 0~1. 나타나며 짙어지고 사라지며 옅어진다.
 *
 * 한 주기에 충돌이 둘이라 갈아 끼우는 자리가 필요하다. 수레가 갑자기 사라지고
 * 다시 나타나면 그 순간이 충돌만큼 눈에 띄어 주장을 가린다.
 */
export function revealOf(tl: TimelineFrame, ep: EpisodeDef): number {
  return tl.at(ep.phases.appear) * (1 - tl.at(ep.phases.fade));
}

/** 쌓는 상태가 없다 — 수레도 칸도 모두 시각의 함수다. */
export function step(params: {
  state: PerfectlyInelasticCollisionState;
}): PerfectlyInelasticCollisionState {
  return params.state;
}
