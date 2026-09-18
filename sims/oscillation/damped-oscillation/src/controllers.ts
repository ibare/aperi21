import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 감쇠 계수를 끌게 하면 마루 비가 바뀌고, 세게 끌면 진동하지 않는 영역으로 넘어간다 —
 * 그 변화가 말하는 것은 감쇠의 세 갈래(`damping-regimes`)와 봉우리의 날카로움
 * (`quality-factor`)이고 이웃 조각의 주장이다. 이 조각이 답하는 것은 **한 감쇠에서
 * 마루가 회마다 같은 비율로 줄고 간격은 그대로다** 하나이고, 그 답은 아무것도 누르지
 * 않아도 다섯 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
