import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 열면 이미 두 구가 가라앉고 있고, 큰 구가 바닥에 닿으면 붙잡았다가 다시 놓는다.
 * 반지름 비를 고르게 하면(칩 1.5 · 2 · 3 배) 「제곱」 을 더 시험해 볼 수 있지만, 3 배면
 * 작은 구가 9분의 1 만 내려와 간격이 획 굵기와 맞먹어 읽히지 않는다. 한 비(2 배 → 4 배)
 * 를 또렷이 보이는 쪽을 골랐다 (NOTES (b)).
 */
export const controllers: readonly ControllerSpec[] = [];
