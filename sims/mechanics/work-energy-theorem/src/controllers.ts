import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 힘이나 거리를 끌게 하면 곱이 달라지는 순간 「같은 일 → 같은 속력」 이 「다른 일 →
 * 다른 속력」 으로 바뀌어 한 조각이 두 주장을 하게 되고, 곱이 커지면 수레가 화면 밖으로
 * 나가 프레이밍이 무너진다. 이 조각이 답하는 것은 **힘과 거리를 달리 나눠도 한 일이
 * 같으면 붙는 속력이 같다** 하나이고, 그 답은 아무것도 누르지 않아도 한 주기 안에
 * 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
