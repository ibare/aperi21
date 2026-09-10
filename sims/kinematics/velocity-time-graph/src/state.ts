import type { StageDef } from '@aperi21/schema';
import { START_AT } from './schema';

export interface VelocityTimeGraphState {
  /** 운동 시계(초). 이 조각의 상태는 시간뿐이다 — 나머지는 전부 t 의 함수. */
  t: number;
}

/**
 * 운동 시계를 `startAt` 만큼 앞당겨 연다. 도착한 순간 이미 첫 기둥이 떨어지는
 * 중이다 (S-piece). 원본의 `tau(t) = (t + 1.5) % 12.4` 에서 1.5 가 이것이다.
 */
export function initialState(params: { stage: StageDef }): VelocityTimeGraphState {
  const startAt = params.stage.constants.startAt;
  return { t: typeof startAt === 'number' ? startAt : START_AT };
}
