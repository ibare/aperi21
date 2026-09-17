import type { ControllerSpec } from '@aperi21/schema';
import { DRAG } from './schema';

/**
 * 지도 위 원천 전하를 끌어 옮긴다 — 양전하 · 음전하 하나씩.
 *
 * 주장은 「늘」 이다. 배치를 바꿔 지형 · 등전위선 · 경로가 모두 달라져도 자취가 등전위선을
 * 직각으로 가로지르는지 독자가 직접 확인하는 자리다. 누르지 않아도 조각은 할 말을 마친다 (S-piece).
 *
 * 끄는 동안 `step` 이 배치를 옮기고 파생(지형 · 지도 · 등전위선 · 경로)을 다시 구한다. 다른 전하에
 * 너무 가까우면 옮기지 않는다(원본 그대로). 놓으면 손잡이가 전하 자리로 돌아간다.
 *
 * 원본은 손잡이를 그리지 않고 커서 모양만 바꿨다. `point-drag` 는 손잡이를 숨길 수 없어
 * 테두리 고리(`ring`)로 둔다 — 채운 점이면 +/- 기호를 가린다 (NOTES.md G21).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'plus-drag',
    type: 'point-drag',
    binds: { pos: 'drag.plus.pos', held: 'drag.plus.held' },
    grabRadius: DRAG.grabRadius,
    handle: 'ring',
  },
  {
    id: 'minus-drag',
    type: 'point-drag',
    binds: { pos: 'drag.minus.pos', held: 'drag.minus.held' },
    grabRadius: DRAG.grabRadius,
    handle: 'ring',
  },
];
