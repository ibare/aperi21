import type { StageDef } from '@aperi21/schema';
import { ratioText, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 판 · 층 · 염료 · 화살표가 모두 시간표의 함수다.
 *
 * 남는 것은 캡션 문안에 끼울 점성 비의 글자 하나뿐이다 — 캡션 슬롯의 `vars` 는 state
 * 경로만 가리킬 수 있어서, 스테이지 상수에서 한 번 계산해 둔다.
 */
export interface ViscosityState {
  /** 끈적한 쪽 점성 ÷ 묽은 쪽 점성을 글자로. 캡션 `{ratio}` 자리. */
  ratioText: string;
}

export function initialState(params: { stage: StageDef }): ViscosityState {
  return { ratioText: ratioText(readConstants(params.stage)) };
}
