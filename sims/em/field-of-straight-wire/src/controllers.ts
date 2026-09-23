import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 자동 진행이 한 주기 안에 끄기·뒤집기·세기 변화를 모두 훑으므로
 * 슬라이더를 달면 같은 값을 두 곳에서 밀게 된다 (원본 NOTES).
 */
export const controllers: readonly ControllerSpec[] = [];
