import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 초점 거리를 끌게 하는 것은 **형제 조각 `focal-length` 의 몫**이다. 물체 거리를
 * 끌게 하는 것도 두지 않았다 — 물체를 초점 안쪽으로 넣으면 세 광선이 렌즈 뒤에서
 * 만나지 않고 벌어져(허상) 이 조각이 말하는 그림이 아니게 되고, 초점 위에서는
 * 상이 무한히 멀어져 고정 경계가 성립하지 않는다 (원칙 6). 상의 크기가 물체
 * 거리를 따라 바뀌는 것은 `magnification` 이 이미 갖고 있다.
 *
 * 이 조각이 답하는 것은 **상이 어디에 맺히는지를 어떻게 알아내는가** 하나이고,
 * 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
