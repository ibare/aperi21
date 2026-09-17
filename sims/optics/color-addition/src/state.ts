import type { Vec2 } from '@aperi21/schema';
import { OFFSET } from './schema';
import { autoPositions } from './physics';

/**
 * 자동 진행에서는 모든 것이 시각의 함수다. 그래도 상태를 두는 것은 손 조작 때문이다.
 *
 * - `pos` — 끌기 손잡이(`point-drag`)가 읽고 쓰는 자리. 자동 진행 동안에도 손잡이가
 *   원판을 따라다녀야 해서 `step` 이 자체 시계(`clock`)로 채운다 (NOTES 「어휘 부족」 G01).
 * - `manual` — 한 번이라도 잡으면 참. 그 뒤로는 손으로 놓은 자리를 유지한다(원본과 같다).
 * - `manualCaption` — 손으로 옮긴 뒤 고리 자리의 실제 조합. 캡션 슬롯 `cases` 가 읽는다.
 */
export interface ColorAdditionState {
  clock: number;
  manual: boolean;
  pos: { r: Vec2; g: Vec2; b: Vec2; probe: Vec2 };
  held: { r: boolean; g: boolean; b: boolean; probe: boolean };
  manualCaption: Record<string, boolean>;
}

export function initialState(): ColorAdditionState {
  return {
    clock: OFFSET,
    manual: false,
    pos: autoPositions(OFFSET),
    held: { r: false, g: false, b: false, probe: false },
    manualCaption: {},
  };
}
