// ========================================================================
// magnet-attraction — 순수 계산
// ========================================================================
// 모든 것이 자석의 자리 하나의 함수다. 자석 가운데 x 는 시간표 `sweep` 진행도로
// 처음 → 끝을 곧게 간다. 당기는 물건마다 「붙을 자리」 가 자석에 정해져 있고,
// 그 자리가 물건 위로 `pullReach` 만큼 다가오면 물건이 책상을 떠나 그 자리가 바로 위에
// 왔을 때 붙는다. 붙은 뒤로는 그 자리에 매달려 딸려 간다.
//
// 튀어 오르는 시각은 물건마다 다르다 — 시간표 단계가 아니라 자석의 자리가 정한다.
// 당기지 않는 물건은 자석이 어디 있든 제자리다. 쌓는 상태가 없어 같은 시각은 같은 화면이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  ALUMINUM_ATTRACTED,
  ALUMINUM_SLOT,
  CLIP_ATTRACTED,
  CLIP_SLOT,
  COPPER_ATTRACTED,
  COPPER_SLOT,
  MAGNET_HEIGHT,
  MAGNET_LENGTH,
  MAGNET_WIDTH,
  NAIL_ATTRACTED,
  NAIL_SLOT,
  PLASTIC_ATTRACTED,
  PLASTIC_SLOT,
  PULL_REACH,
  ROW_GAP,
  ROW_START,
  SWEEP_FROM,
  SWEEP_TO,
  WOOD_ATTRACTED,
  WOOD_SLOT,
} from './schema';
import type { MagnetAttractionState } from './state';

/** 자석 앞 끝 아래에 붙는 물건을 끝면에서 안쪽으로 들이는 거리(월드). 끝에 걸쳐 보이지 않게. */
const UNDER_INSET = 0.04;

/**
 * 물건 종류와 치수 [가로, 세로](월드). 모양은 scene 이 종류 id 로 고른다.
 * 목록 길이 · 치수가 코드에 남는다 (장부 G105).
 */
export const ITEM_KINDS = [
  { id: 'wood', size: [0.75, 0.45] },
  { id: 'nail', size: [0.9, 0.18] },
  { id: 'copper', size: [0.84, 0.21] },
  { id: 'plastic', size: [0.54, 0.33] },
  { id: 'clip', size: [0.75, 0.24] },
  { id: 'aluminum', size: [0.84, 0.09] },
] as const satisfies readonly { id: string; size: Vec2 }[];

export type ItemKind = (typeof ITEM_KINDS)[number]['id'];

export interface MagnetAttractionConstants {
  magnetLength: number;
  magnetWidth: number;
  magnetHeight: number;
  sweepFrom: number;
  sweepTo: number;
  pullReach: number;
  rowStart: number;
  rowGap: number;
  /** 종류마다 줄 안의 자리. */
  slot: Record<ItemKind, number>;
  /** 종류마다 자석이 당기는지. */
  attracted: Record<ItemKind, boolean>;
}

export function readConstants(stage: StageDef): MagnetAttractionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    magnetHeight: c.magnetHeight ?? MAGNET_HEIGHT,
    sweepFrom: c.sweepFrom ?? SWEEP_FROM,
    sweepTo: c.sweepTo ?? SWEEP_TO,
    pullReach: c.pullReach ?? PULL_REACH,
    rowStart: c.rowStart ?? ROW_START,
    rowGap: c.rowGap ?? ROW_GAP,
    slot: {
      wood: c.woodSlot ?? WOOD_SLOT,
      nail: c.nailSlot ?? NAIL_SLOT,
      copper: c.copperSlot ?? COPPER_SLOT,
      plastic: c.plasticSlot ?? PLASTIC_SLOT,
      clip: c.clipSlot ?? CLIP_SLOT,
      aluminum: c.aluminumSlot ?? ALUMINUM_SLOT,
    },
    attracted: {
      wood: (c.woodAttracted ?? WOOD_ATTRACTED) !== 0,
      nail: (c.nailAttracted ?? NAIL_ATTRACTED) !== 0,
      copper: (c.copperAttracted ?? COPPER_ATTRACTED) !== 0,
      plastic: (c.plasticAttracted ?? PLASTIC_ATTRACTED) !== 0,
      clip: (c.clipAttracted ?? CLIP_ATTRACTED) !== 0,
      aluminum: (c.aluminumAttracted ?? ALUMINUM_ATTRACTED) !== 0,
    },
  };
}

export interface Item {
  kind: ItemKind;
  size: Vec2;
  /** 책상 위에 놓인 자리(가운데). 밑면이 책상 면 y = 0 에 닿는다. */
  rest: Vec2;
  /** 당기는 물건이면 자석에 붙는 자리(자석 가운데 기준 오프셋). 아니면 없다. */
  attach?: Vec2;
}

/**
 * 줄 위의 물건들. 당기는 물건은 줄에서 왼쪽부터(자석이 먼저 닿는 차례로) 붙을 자리를 받는다 —
 * 첫째는 앞 끝(N) 아래, 둘째는 앞 끝면, 셋째부터는 앞 끝 아래에서 뒤쪽으로 차례로.
 * 극 가까이에 모이는 것은 막대자석이 끝에서 가장 세게 당기기 때문이다.
 */
export function deriveItems(c: MagnetAttractionConstants): Item[] {
  const halfL = c.magnetLength / 2;
  const halfW = c.magnetWidth / 2;
  const sorted = [...ITEM_KINDS].sort((a, b) => c.slot[a.id] - c.slot[b.id]);
  let order = 0;
  let underCursor = halfL - UNDER_INSET;
  return sorted.map((k) => {
    const [w, h] = k.size;
    const item: Item = {
      kind: k.id,
      size: k.size,
      rest: [c.rowStart + c.slot[k.id] * c.rowGap, h / 2],
    };
    if (c.attracted[k.id]) {
      if (order === 1) {
        // 앞 끝면에 옆으로 붙는다.
        item.attach = [halfL + w / 2, 0];
      } else {
        // 앞 끝 아래에 매달린다. 둘 이상이면 뒤쪽으로 이어 붙는다.
        item.attach = [underCursor - w / 2, -halfW - h / 2];
        underCursor -= w;
      }
      order += 1;
    }
    return item;
  });
}

/** 자석 가운데 x. `sweep` 은 시간표 `sweep` 단계의 진행도(0~1)다. */
export function magnetX(c: MagnetAttractionConstants, sweep: number): number {
  return c.sweepFrom + (c.sweepTo - c.sweepFrom) * sweep;
}

/**
 * 끌림 진행도 0~1. 붙을 자리가 물건 위로 `pullReach` 만큼 다가오면 0, 바로 위에 오면 1.
 * 자석은 한 방향(+x)으로만 가므로 한 번 붙으면 떨어지지 않는다.
 */
export function pullProgress(c: MagnetAttractionConstants, item: Item, xm: number): number {
  if (!item.attach) return 0;
  const gap = item.rest[0] - (xm + item.attach[0]);
  return Math.min(1, Math.max(0, 1 - gap / c.pullReach));
}

/** 물건의 지금 자리. 끌려오는 동안은 책상 자리에서 붙을 자리로 곧게 옮겨 간다. */
export function itemPos(c: MagnetAttractionConstants, item: Item, xm: number): Vec2 {
  if (!item.attach) return item.rest;
  const p = pullProgress(c, item, xm);
  const target: Vec2 = [xm + item.attach[0], c.magnetHeight + item.attach[1]];
  return [
    item.rest[0] + (target[0] - item.rest[0]) * p,
    item.rest[1] + (target[1] - item.rest[1]) * p,
  ];
}

/** 상태가 시계뿐이다 — 항등 걸음 (S-sim). */
export function step(params: { state: MagnetAttractionState }): MagnetAttractionState {
  return params.state;
}
