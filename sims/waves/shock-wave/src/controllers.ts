import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기를 두지 않는다. 주장은 「음속을 넘으면 파면이 원뿔에 모인다」 하나이고, 자동 진행이
 * u = v(벽)와 u > v(원뿔)를 한 주기 안에 모두 세운다. 빠르기 슬라이더를 두면 「빠를수록
 * 원뿔이 좁다」 라는 두 번째 주장이 생긴다 — 그것은 다른 조각의 몫이다.
 */
export const controllers: readonly ControllerSpec[] = [];
