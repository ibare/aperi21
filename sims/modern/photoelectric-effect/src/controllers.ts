import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 한 주기 안에 「빨강을 세게 해도 안 나온다」 와 「보라는 약해도 나온다」 가 모두 일어난다.
 * 진동수를 끄는 조작기를 두면 문턱을 찾아 넘는 놀이가 되는데, 그것은 이웃 조각
 * `work-function-and-threshold` 의 주장이다.
 */
export const controllers: readonly ControllerSpec[] = [];
