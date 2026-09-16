import type { ControllerSpec } from '@aperi21/schema';

import { CURVE } from './physics';

/**
 * 잡히는 반경(화면 px). 달리는 점(반지름 6.2)보다 넉넉히 두어 손가락으로도
 * 잡힌다. 원본은 **화면 아무 데나** 눌러도 점이 그리로 옮겨갔는데, 엔진의
 * 판정은 손잡이 둘레의 원이라 그 자리는 NOTES.md 「어휘 부족」에 남긴다.
 */
const GRAB_RADIUS_PX = 20;

/**
 * 달리는 점을 잡아 길 위로 끈다.
 *
 * 급히 굽는 자리와 느슨히 굽는 자리를 자기 손으로 왕복해 보는 것이 "원의 크기가
 * 자리에만 달렸다" 를 확인하는 가장 빠른 길이다. 자동 진행만으로도 조각은 할 말을
 * 마치므로 이것은 없어도 성립하는 덤이다 (S-piece).
 *
 * **무엇이 제약인지는 조각이 정한다** — `snapTo` 에 길의 표본 점열을 준다. 엔진이
 * 경로를 알아서 고르지 않으므로, 끌린 자리는 언제나 길 위의 한 점이 된다.
 */
export const controllers: readonly ControllerSpec[] = [
  {
    id: 'runner-drag',
    type: 'point-drag',
    binds: { pos: 'pos', held: 'held' },
    grabRadius: GRAB_RADIUS_PX,
    snapTo: CURVE.points,
  },
];
