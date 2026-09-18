import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 네 통이 이미 쇠 · 물 · 공기 · 진공을 같은 순간 나란히 견준다. 빠르기 손잡이를 두면 한 통만 바뀌어
 * 대조가 흐려지고, 건너감 단계의 길이가 값을 따라가지 못해(장부 G13) 공기를 느리게 하면 떨림이 끝에
 * 닿기 전에 주기가 끝난다. 빠르기는 스테이지 상수다.
 */
export const controllers: readonly ControllerSpec[] = [];
