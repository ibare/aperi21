import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

/**
 * 쌓는 상태가 없다. 빛과 시계의 자리는 모두 스테이지 상수와 시간표 시각의 함수다.
 *
 * 들고 있는 것은 캡션에 끼울 문자열뿐이다 — 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수
 * 있어서, 스테이지 상수(`beta` · `gammaNum` · `gammaDen`)를 그대로 `String` 으로 여기 둔다
 * (장부 G133). 시각과 무관하므로 `step` 이 다시 만들 필요가 없다.
 */
export interface LightClockState {
  caption: {
    beta: string;
    n: string;
    d: string;
  };
}

export function initialState(params: { stage: StageDef }): LightClockState {
  const c = readConstants(params.stage);
  return { caption: { beta: String(c.beta), n: String(c.gammaNum), d: String(c.gammaDen) } };
}
