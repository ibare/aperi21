import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 세 줄이 이미 「장력을 올린 줄」 과 「무거운 줄」 을 기준 곁에서 동시에 달리게 한다. 장력 · 선밀도
 * 손잡이를 두면 한 번에 한 줄만 바뀌어 대조가 흐려지고, 단계 길이가 값을 따라가지 못해(장부 G13)
 * 빠른 펄스가 경주 도중 줄 끝을 넘는다. 값은 스테이지 상수다.
 */
export const controllers: readonly ControllerSpec[] = [];
