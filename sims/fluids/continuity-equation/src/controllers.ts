import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 이 조각이 답하는 것은 「절반 굵기면 왜 두 배 빠른가」 하나다 — 굵기를
 * 끌게 하면 칸이 정사각이 아니게 되고 치수 기호(ℓ · 2ℓ)와 캡션의 「두 배」 가 값에 따라
 * 틀려진다. 자동 진행만으로 할 말을 마친다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
