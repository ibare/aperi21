import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 이 조각이 답하는 것은 「어디까지 닿는가」 와 「틀을 바꿔도 그 경계가 그대로인가」
 * 둘이고, 둘 다 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece). 틀의 속도를
 * 끌게 하면 사건이 경계 밖으로 멀리 미끄러져 고정 경계(`boundsHint`)를 벗어난다.
 */
export const controllers: readonly ControllerSpec[] = [];
