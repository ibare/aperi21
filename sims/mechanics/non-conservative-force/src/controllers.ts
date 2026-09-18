import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 지나치는 거리 D 를 끌게 하면 아래 막대가 2L 이 아닌 값에서 멎어 캡션의 「두 배」 가
 * 값에 따라 흔들리고, D 가 커지면 막대가 화면 밖으로 나가 프레이밍이 무너진다. 이 조각이
 * 답하는 것은 **같은 A→B 인데 왜 잃은 것이 다른가** 하나이고, 그 답은 아무것도 누르지
 * 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
