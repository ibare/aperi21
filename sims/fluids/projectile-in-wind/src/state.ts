import type { StageDef } from '@aperi21/schema';

import { readConstants } from './physics';

/**
 * 상태는 **바람 세기 하나**다. 공의 자리 · 궤적 · 착지 자국은 모두 시간표 선언에서
 * 엔진이 `scene` 에 넘기는 시각의 함수라 상태가 아니다.
 *
 * `wind` 는 슬라이더가 잡는 값이고, 기본값은 스테이지 상수에서 온다 (원칙 2).
 * 앞바람 레인은 `−wind`, 뒷바람 레인은 `+wind` 를 쓴다.
 */
export interface ProjectileInWindState {
  wind: number;
}

export function initialState(params: { stage: StageDef }): ProjectileInWindState {
  return { wind: readConstants(params.stage).wind };
}
