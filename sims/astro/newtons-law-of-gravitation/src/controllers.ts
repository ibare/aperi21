import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 거리를 끌게 하면 가까운 쪽에서는 화살표가 서로를 넘어 겹치고(처음 거리가 두 머리가
 * 맞닿는 길이다), 먼 쪽에서는 1/n² 이 몇 px 로 사라진다. 끌어서 얻는 것은 「가까우면
 * 세다」 라는 이미 아는 방향뿐이고, 이 조각이 말할 **2배 → 1/4 · 3배 → 1/9** 는 정박한
 * 두 거리에서 멈춰 잔상과 견줄 때 읽힌다. 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
