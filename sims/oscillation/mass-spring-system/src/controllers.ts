import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기 없음. 자동 진행 한 주기로 주장(질량 네 배 → 주기 두 배, 진폭 무관)이 끝난다.
 *
 * 질량 칩을 두면 흔들림 단계 길이가 무거운 추의 주기라 고른 질량을 따라가지 못해
 * 「셋이 다시 모인다」 가 깨진다 (장부 G13). 두지 않은 이유는 NOTES (b).
 */
export const controllers: readonly ControllerSpec[] = [];
