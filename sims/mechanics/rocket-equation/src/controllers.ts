import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기를 두지 않는다. 독자가 손으로 해 볼 것이 없다 — 주장은 여덟 칸이 차례로
 * 타면서 저절로 일어나고, 바꿀 수 있는 값을 주면 「같은 연료 · 같은 빠르기」 라는
 * 전제가 흔들린다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
