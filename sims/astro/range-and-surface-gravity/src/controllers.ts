import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 중력을 끌게 하는 다이얼을 두면 g 가 1/6 이 아닌 자리에서 눈금 여섯 칸과 캡션의
 * 칸 수가 화면과 어긋나고, 각도나 속력을 끌게 하면 이 조각이 **중력만 다르게**
 * 한다는 전제가 흔들린다 — 각도는 이웃 `projectile-range` 의 주장이다.
 *
 * 이 조각이 답하는 것은 **같은 발사가 왜 달에서 훨씬 멀리 가는가** 하나이고,
 * 그 답은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
