// ========================================================================
// newtons-first-law — 조작기 선언
// ========================================================================

import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 조작기는 하나다 — 승객의 신발과 바닥 사이 마찰.
 *
 * 기본값 0 이고, 올리면 승객에게 **실제로 수평힘이 걸려** 승객의 자취 간격도
 * 좁아진다. 끝까지 올리면 앞칸에 닿지도 않고 버스와 함께 선다. 주장("힘이 없으면
 * 그대로 간다")의 대우를 독자가 손으로 시험하는 자리다.
 *
 * 자리는 오른쪽 아래다. 그림은 도로 위쪽을 다 쓰고 왼쪽 아래는 캡션 자리라,
 * 비어 있는 곳이 여기뿐이다 — 원본에서 조작기가 그림 아래 한 줄이었던 것과 같다.
 *
 * `heldPath` 를 두지 않았다. 이 값을 미는 것은 독자뿐이고 자동 진행이 같은 값을
 * 다투지 않아서, 잡혔다는 사실을 적어도 읽는 쪽이 없다 (NOTES.md 「어휘 부족」).
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'friction',
    type: 'slider',
    binds: { value: 'friction' },
    range: [0, 100],
    label: text('label.friction'),
    at: { screen: 'bottom-right' },
    size: [260, 44],
  },
];
