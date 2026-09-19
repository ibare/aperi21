import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 주장은 「받은 열의 일부만 일이 되고 나머지는 버려진다」 와 「버릴 곳을 없애면 기관이 선다」
 * 둘이 한 흐름으로 이어진 것이고, 둘 다 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 * 일의 몫을 끌게 하면 100 까지 끌어 올리는 조작이 「다 일로 바꿀 수 있다」 는 화면을 만들어
 * 주장을 뒤집는다 — 버리는 몫을 0 으로 하는 시도는 찬 열원을 떼어 내는 단계가 보인다.
 */
export const controllers: readonly ControllerSpec[] = [];
