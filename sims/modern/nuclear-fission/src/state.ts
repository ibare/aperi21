import type { StageDef } from '@aperi21/schema';
import { captionOf, readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 핵의 모양 · 조각과 중성자의 자리는 모두 스테이지 상수와 시간표
 * 진행도의 함수다.
 *
 * 들고 있는 것은 캡션 문자열뿐이다 — 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수
 * 있어서, 스테이지 상수에서 만든 기호 · 수를 여기 둔다 (장부 G133). 시각과 무관하므로
 * `step` 이 다시 만들 필요가 없다.
 */
export interface NuclearFissionState {
  caption: {
    sT: string;
    aT: string;
    aC: string;
    sH: string;
    aH: string;
    sL: string;
    aL: string;
    n: string;
    e: string;
  };
}

export function initialState(params: { stage: StageDef }): NuclearFissionState {
  return { caption: captionOf(readConstants(params.stage)) };
}
