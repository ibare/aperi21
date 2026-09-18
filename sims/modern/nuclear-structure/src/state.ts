import type { StageDef } from '@aperi21/schema';
import { captionOf, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 핵 셋과 그 변화는 모두 스테이지 상수와 시간표 진행도의 함수다.
 *
 * 들고 있는 것은 캡션 문자열뿐이다 — 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수
 * 있어서, 스테이지 상수에서 만든 수 · 기호를 여기 둔다. 시각과 무관하므로 `step` 이
 * 다시 만들 필요가 없다.
 */
export interface NuclearStructureState {
  caption: { z1: string; n1: string; a1: string; a2: string; z2: string; z3: string; s3: string };
}

export function initialState(params: { stage: StageDef }): NuclearStructureState {
  return { caption: captionOf(readConstants(params.stage)) };
}
