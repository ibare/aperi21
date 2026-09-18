import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 아래 바퀴의 도는 몫을 끌게 하면 1 에 가까울 때 두 레인이 같아져 대비가 사라지고,
 * 1 을 넘기면 헛도는 바퀴가 되어 접점이 **뒤로** 끌리는 다른 이야기가 된다. 이 조각이
 * 답하는 것은 **v = ωR 일 때 접점이 멈춰 있다** 하나이고, 그 답은 아무것도 누르지
 * 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
