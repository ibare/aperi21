import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 거리를 끄는 조작기를 두면 멈추는 자리가 2r · 3r 에서 벗어나 「네 칸 중 한 칸」 ·
 * 「아홉 칸 중 한 칸」 이라는 판정 장치가 흔들린다. 이 조각이 답하는 것은 **거리를
 * 두 배 · 세 배로 하면 힘이 몇 분의 일이 되는가** 하나이고, 그 답은 아무것도 누르지
 * 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
