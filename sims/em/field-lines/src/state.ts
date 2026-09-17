// ========================================================================
// field-lines — 런타임 상태
// ========================================================================
// 누적 상태는 둘이다 — 알갱이 무리와 음전하의 자리. 둘 다 시각의 함수가 아니다
// (알갱이는 적분되고, 음전하는 목표를 늦게 따라간다). 전기력선은 상태가 아니다 —
// 매 프레임 음전하의 지금 자리에서 다시 추적한다 (scene.ts).
//
// 좌표는 원본 캔버스 px(y 아래)다. `drag.pos` 만 월드(y 위)다 — 조작기가 쓰는 자리라서.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { autoPath, createGrains, toWorld, type Grain } from './physics';
import { GRAIN_SEED } from './schema';

export interface FieldLinesState {
  /** 조각 시계(초). 음전하 자동 경로가 이 시각의 함수다. */
  readonly t: number;
  /** 시드 난수의 현재 값. 알갱이가 다시 태어날 자리를 뽑는다 — 같은 걸음은 같은 화면. */
  readonly rng: number;
  readonly grains: readonly Grain[];
  /** 음전하 중심(px). */
  readonly minus: { readonly x: number; readonly y: number };
  /**
   * 끌기 조작기의 자리. 잡고 있는 동안은 러너가 `pos` 에 포인터 자리를 쓰고,
   * 놓여 있는 동안은 `step` 이 음전하 자리를 되써서 손잡이가 전하를 따라간다.
   */
  readonly drag: { readonly pos: Vec2; readonly held: boolean };
}

export function initialState(): FieldLinesState {
  const { grains, rng } = createGrains(GRAIN_SEED);
  const minus = autoPath(0);
  return { t: 0, rng, grains, minus, drag: { pos: toWorld(minus.x, minus.y), held: false } };
}
