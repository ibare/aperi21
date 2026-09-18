import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기를 두지 않는다. 이 조각의 비교는 「같은 빠르기」 라는 조건 하나에 기대고,
 * 자동 진행이 그 조건을 이미 세운다. 빠르기를 독자가 바꾸게 하면 두 칸의 조건을
 * 함께 바꿔야 해서 손이 할 일이 비교를 흔드는 것뿐이다 (NOTES (b)).
 */
export const controllers: readonly ControllerSpec[] = [];
