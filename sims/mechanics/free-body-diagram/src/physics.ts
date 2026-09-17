// ========================================================================
// free-body-diagram — 순수 진행
// ========================================================================
// 물리 적분은 없다. 원본의 순서 진행기(`{ k, pt }`)와 누름 처리를 옮긴다.
// ========================================================================

import { CYCLE, ORDER, type ObjectId } from './schema';
import type { FreeBodyDiagramState } from './state';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/** 원본 이징 — smoothstep. */
const ease = (v: number): number => {
  const s = clamp01(v);
  return s * s * (3 - 2 * s);
};

/** 누름을 훑는 순서 — 원본 HIT 순서(컵 · 책 · 책상). 조작기 선언 순서와 같다. */
const PRESS_ORDER: readonly ObjectId[] = ['cup', 'book', 'table'];

export interface Pose {
  /** 지금 떼어 내는 물체. */
  selected: ObjectId;
  /** 0 = 제자리, 1 = 오른쪽 칸으로 떼어 냄. */
  sep: number;
  /** 이름표 불투명도 0~1. */
  labels: number;
  /** 떼어 낸 물체의 옮김(월드) — 옆으로 옮기면서 살짝 들어 올린다. */
  offset: readonly [number, number];
}

/** 원본 `phase()` · `offsetOf()`. */
export function pose(state: FreeBodyDiagramState, shift: number, lift: number): Pose {
  const pt = state.pt;
  let sep: number;
  if (pt < CYCLE.sepStart) sep = 0;
  else if (pt < CYCLE.sepEnd) sep = ease((pt - CYCLE.sepStart) / (CYCLE.sepEnd - CYCLE.sepStart));
  else if (pt < CYCLE.returnStart) sep = 1;
  else sep = 1 - ease((pt - CYCLE.returnStart) / (CYCLE.returnEnd - CYCLE.returnStart));
  const labels =
    pt < CYCLE.returnStart
      ? ease((pt - CYCLE.labelIn) / (CYCLE.labelInEnd - CYCLE.labelIn))
      : 1 - ease((pt - CYCLE.returnStart) / CYCLE.labelOut);
  return {
    selected: ORDER[state.k] ?? 'book',
    sep,
    labels,
    offset: [shift * sep, lift * Math.sin(Math.PI * sep)],
  };
}

/**
 * 한 걸음. 누름은 걸음 첫머리에서 소비하고 언제나 지운다 — 누른 물체의 주기에서
 * 떼어 내기 0.2 초 전으로 뛴 뒤 자동 순서(책 → 컵 → 책상)를 이어 간다.
 */
export function step(params: { state: FreeBodyDiagramState; dt: number }): FreeBodyDiagramState {
  const { state, dt } = params;
  let k = state.k;
  let pt = state.pt;

  const hit = PRESS_ORDER.find((id) => state.pressed[id]);
  if (hit) {
    k = ORDER.indexOf(hit);
    pt = CYCLE.pressTo;
  }

  pt += dt;
  while (pt >= CYCLE.period) {
    pt -= CYCLE.period;
    k = (k + 1) % ORDER.length;
  }

  const sel = ORDER[k];
  const lift = pt < CYCLE.sepEnd;
  const free = !lift && pt < CYCLE.returnStart;
  const back = !lift && !free;

  return {
    k,
    pt,
    pressed: { book: false, cup: false, table: false },
    caption: {
      bookLift: sel === 'book' && lift,
      bookFree: sel === 'book' && free,
      bookBack: sel === 'book' && back,
      cupLift: sel === 'cup' && lift,
      cupFree: sel === 'cup' && free,
      cupBack: sel === 'cup' && back,
      tableLift: sel === 'table' && lift,
      tableFree: sel === 'table' && free,
      tableBack: sel === 'table' && back,
    },
  };
}
