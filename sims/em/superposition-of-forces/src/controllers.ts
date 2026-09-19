import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 원천을 끌게 하면 「옮긴 원천의 몫만 바뀐다」 를 독자가 해 볼 수는 있으나, 한 주기의
 * `move` 단계가 이미 그것을 보이고 옮기기 전 합력을 점선으로 남겨 견주게 한다. 끄는
 * 동안에는 이어 붙인 화살표가 원천에 닿거나 화면 밖으로 나갈 수 있어 판정 장치가
 * 흔들린다. 이 조각이 답하는 것은 **여러 힘을 어떻게 하나로 합하는가** 하나이고, 그 답은
 * 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
