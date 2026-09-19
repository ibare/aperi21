import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 입사각을 끌게 하면 멈춘 각이 선언값이 아니게 되어 각도 글자를 띄울 수 없다 —
 * 계산한 각을 반올림해 쓰지 않는다 (S-piece 유효숫자). 세 선언값(20° · 45° · 70°)을
 * 차례로 멈춰 보이는 자동 진행으로 「나가는 빛이 같은 값으로 따라간다」 가 끝난다.
 */
export const controllers: readonly ControllerSpec[] = [];
