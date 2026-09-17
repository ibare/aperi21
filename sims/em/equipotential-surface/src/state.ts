// ========================================================================
// equipotential-surface — 런타임 상태
// ========================================================================
// 쌓이는 것은 둘이다 — 조각 시계와 원천 전하 배치. 시험 전하의 자리는 시계의 함수다.
//
// `terrain` 은 배치에서 파생된 계산 결과(밝기 격자 · 깊이 · 등전위선 · 경로)다. 배치가 바뀔
// 때만 다시 구한다 — 원본 `rebuild` 와 같다. 매 프레임 scene 에서 구하면 곡면 깊이 판정을
// 프레임마다 다시 한다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { buildTerrain, mapWorld, type Charge, type Terrain } from './physics';
import { CHARGES } from './schema';

/** 끌기 조작기 하나의 자리. 잡고 있는 동안은 러너가 `pos` 에 포인터 자리(월드)를 쓴다. */
export interface DragHandle {
  readonly pos: Vec2;
  readonly held: boolean;
}

export interface EquipotentialSurfaceState {
  /** 조각 시계(초). 시험 전하 여섯의 자리가 이 시각의 함수다. */
  readonly t: number;
  /** 원천 전하 — 0 번이 양전하, 1 번이 음전하. */
  readonly charges: readonly [Charge, Charge];
  readonly terrain: Terrain;
  readonly drag: { readonly plus: DragHandle; readonly minus: DragHandle };
}

export function initialState(): EquipotentialSurfaceState {
  const charges: [Charge, Charge] = [{ ...CHARGES[0] }, { ...CHARGES[1] }];
  return {
    t: 0,
    charges,
    terrain: buildTerrain(charges),
    drag: {
      plus: { pos: mapWorld(charges[0].x, charges[0].y), held: false },
      minus: { pos: mapWorld(charges[1].x, charges[1].y), held: false },
    },
  };
}
