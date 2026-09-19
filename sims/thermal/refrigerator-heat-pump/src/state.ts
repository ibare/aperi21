// ========================================================================
// refrigerator-heat-pump — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface RefrigeratorHeatPumpState {
  /** 넣는 일(J). */
  workText: string;
  /** 냉장고 안에서 빼는 열(J). */
  qColdText: string;
  /** 부엌으로 나가는 열(J) — 선언한 정박값 `qHot` 의 글자. 뺀 열 + 넣은 일과 같아야 한다(G143). */
  qHotText: string;
  /** 냉장고 안 · 부엌 온도(℃). */
  tColdText: string;
  tHotText: string;
}

export function initialState(params: { stage: StageDef }): RefrigeratorHeatPumpState {
  const c = readConstants(params.stage);
  return {
    workText: String(c.work),
    qColdText: String(c.qCold),
    qHotText: String(c.qHot),
    tColdText: String(c.tCold),
    tHotText: String(c.tHot),
  };
}
