import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 밸브를 독자가 열게 하면 닫힌 채 견주는 장면(두 화살표의 길이 차)을 건너뛰고 곧장 열어,
 * 「왜 작은 쪽이 지는가」 의 근거를 보기 전에 결과만 본다. 거품 크기를 끌게 하면 두 거품을
 * 같게 맞추는 순간(불안정한 평형)에서 멈춰 한 주기의 이야기가 끊긴다. 이 조각이 답하는 것은
 * **어느 쪽이 어느 쪽으로 빨려 드는가** 하나이고, 그 답은 아무것도 누르지 않아도 한 주기
 * 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
