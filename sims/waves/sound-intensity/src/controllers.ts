import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다. 말할 것은 멈춘 세 자리(r · 2r · 4r)에서 읽히고 누르지 않아도 한 주기에
 * 끝난다. 귀를 끌게 하면 멈춘 자리 사이에서 값 글자를 붙일 정박값이 없어, 계산한 dB 를
 * 반올림해 띄우거나 글자를 빼야 한다 (S-piece 유효숫자).
 */
export const controllers: readonly ControllerSpec[] = [];
