import type { ControllerSpec } from '@aperi21/schema';

/**
 * 빛 원판 셋과 고리를 끌어 옮긴다. 자동 진행에 없는 조합(빨강 + 파랑 = 자홍)을
 * 독자가 직접 만들어 보게 한다.
 *
 * 고리를 먼저 선언한다 — 원판 위에 얹혀 있어 겹치면 고리가 잡혀야 한다(원본과 같다).
 * 잡는 반경은 화면 px 이라 원판 반지름(월드 64)과 정확히 같게 줄 수 없다 (NOTES G21).
 */
export const controllers: readonly ControllerSpec[] = [
  { id: 'drag-probe', type: 'point-drag', binds: { pos: 'pos.probe', held: 'held.probe' }, grabRadius: 14, handle: 'ring' },
  { id: 'drag-red', type: 'point-drag', binds: { pos: 'pos.r', held: 'held.r' }, grabRadius: 48, handle: 'ring' },
  { id: 'drag-green', type: 'point-drag', binds: { pos: 'pos.g', held: 'held.g' }, grabRadius: 48, handle: 'ring' },
  { id: 'drag-blue', type: 'point-drag', binds: { pos: 'pos.b', held: 'held.b' }, grabRadius: 48, handle: 'ring' },
];
