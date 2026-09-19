import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 **삼중점에서 조금만 벗어나도 하나만 남는다** 하나이고, 네 방향
 * (온도 ↑ · ↓, 압력 ↓ · ↑)이 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 * 점을 끌게 하면 확대창 밖의 영역(끓는 물 · 임계점)으로 나가 이웃 `phase-diagram` 의 몫과 겹친다.
 */
export const controllers: readonly ControllerSpec[] = [];
