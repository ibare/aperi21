import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 구동 진동수 슬라이더를 두면 독자는 곧장 고유 진동수 근처로 끌고 가 진폭이 치솟는
 * 것을 보게 된다 — 그것은 이웃 조각 `resonance` 의 주장이다. 이 조각의 주장(추는
 * 손의 박자로, 느리면 같이 · 빠르면 반대로)은 두 박자를 나란히 두는 것으로 끝난다.
 * 슬라이더로 한 레인의 박자를 바꾸면 정상 상태가 깨져 과도 응답이 섞이는데, 이
 * 조각은 쌓는 상태 없이 정상 상태 해만 쓴다.
 */
export const controllers: readonly ControllerSpec[] = [];
