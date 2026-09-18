import type { StageDef } from '@aperi21/schema';
import { ratioText, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 두 문의 각은 모두 시간표 진행도의 함수다.
 *
 * 남는 것은 캡션이 끼울 팔 길이 비의 글자 하나 — 캡션 슬롯의 `vars` 는 state 경로만
 * 가리킬 수 있어서, 스테이지 상수에서 만든 글자를 여기 둔다.
 */
export interface TorqueState {
  /** 긴 팔 ÷ 짧은 팔. 캡션의 `{k}` 자리. */
  ratio: string;
}

export function initialState(params: { stage: StageDef }): TorqueState {
  const c = readConstants(params.stage);
  return { ratio: ratioText(c) };
}
