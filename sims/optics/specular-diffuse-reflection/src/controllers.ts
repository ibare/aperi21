import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 거칠기를 끌게 하는 것도 생각했지만, 주장은 「거칠기가 클수록 더 흩어진다」 는 정도가 아니라
 * 「거친 면에서도 줄기마다 제 법선을 따른다」 이다. 한 주기의 자동 진행(나란히 → 흩어짐 →
 * 법선이 제각각)으로 할 말이 끝난다. 거칠기 · 줄기 수는 스테이지 상수로 저작자가 바꾼다.
 */
export const controllers: readonly ControllerSpec[] = [];
