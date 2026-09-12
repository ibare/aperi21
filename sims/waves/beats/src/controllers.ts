import type { ControllerSpec } from '@aperi21/schema';
import { text } from './schema';

/**
 * 조작기는 하나다.
 *
 * 아무것도 누르지 않아도 울렁임은 2.2 초마다 한 번씩 완성된다 (S-piece: 자동
 * 진행으로 주장이 일어난다). 이 슬라이더는 그와 별개로, **"차이가 박자를 정한다"**
 * 를 독자가 손으로 확인하는 자리다. 값을 바꿔도 위상이 누적이라 파형이 끊기지
 * 않고, 화면에 남아 있는 옛 마디 칸과 새 칸이 나란히 놓여 좁아졌는지 넓어졌는지가
 * 기억이 아니라 화면에서 비교된다.
 *
 * 자리를 오른쪽 아래로 준다. 기본 자리(오른쪽 위)는 판 오른쪽 끝 — 곧 '지금' 의
 * 원 셋이 흔들리는 자리 — 를 덮는다. 자리는 저작 결정이다 (원칙 7 ③).
 *
 * `heldPath` 는 잡고 있다는 사실을 적는 자리다. 잡힘을 조각이 따로 짜지 않는다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'df',
    type: 'slider',
    binds: { value: 'df' },
    heldPath: 'held',
    range: [0, 1],
    label: text('control.df'),
    unit: 'Hz',
    at: { screen: 'bottom-right' },
  },
];
