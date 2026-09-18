import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「자기장을 걸면 한 줄이던 선이 세 줄로 갈라지고, 키우면 더 벌어진다」 하나이고,
 * 그 답은 아무것도 누르지 않아도 한 주기 안에 자기장을 켜고 · 키우고 · 끄며 일어난다 (S-piece).
 * 자기장 손잡이를 두면 자동 진행과 같은 값을 다투게 되고, 끌어 보는 것이 보여 줄 것은 두 정박값의
 * 대비가 이미 보인다.
 */
export const controllers: readonly ControllerSpec[] = [];
