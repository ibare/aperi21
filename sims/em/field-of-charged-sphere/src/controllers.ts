import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기가 없다.
 *
 * 시험 전하를 독자가 끌게 하는 `point-drag` 를 생각했지만, 자동 진행이 이미 멀리서 겉면을 지나
 * 안쪽까지 한 줄로 훑어 그래프 전체를 긋는다. 이 조각이 답하는 것 — 안은 0, 밖은 가운데 점전하와
 * 같다 — 은 아무것도 누르지 않아도 한 주기 안에 끝난다 (S-piece).
 */
export const controllers: readonly ControllerSpec[] = [];
