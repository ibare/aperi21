import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 속력 · 간격을 끌게 하면 센 수가 정수에서 벗어나 「몇 개를 셌나」 가 흐려지고, 네모 줄이
 * 화면 밖으로 나가 프레이밍이 무너진다. 이 조각이 답하는 것은 **빨라지거나 촘촘해지면
 * 같은 시간에 지나는 전하가 는다** 하나이고, 그 답은 세 도선을 나란히 두어 아무것도
 * 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
