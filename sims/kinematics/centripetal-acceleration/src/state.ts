import type { StageDef } from '@aperi21/schema';
import { START_TIME } from './schema';

export interface CentripetalAccelerationState {
  /**
   * 운동 시계(초). 공의 각과 주기 안의 단계가 전부 이것의 함수라 쌓는 상태가 없다.
   * 지난 Δv 도 주기 번호에서 매번 다시 계산한다.
   */
  t: number;
}

/**
 * 도착한 순간 이미 진행 중 — 운동 시계를 스테이지 상수 `startAt` 만큼 앞당겨 연다.
 * 시작 시점은 선언이다 (원칙 2). 코드의 `START_TIME` 은 선언이 비었을 때의 기본값뿐이다.
 */
export function initialState(params: { stage: StageDef }): CentripetalAccelerationState {
  const startAt = params.stage.constants.startAt;
  return { t: typeof startAt === 'number' ? startAt : START_TIME };
}
