import { AOA } from './schema';
import { freshFlow } from './physics';

/** 같은 순간 한 줄로 뿌린 연기 표지들. `id` 는 방출 순번 — 네 줄에 하나가 추적 줄이다. */
export interface SmokeLine {
  id: number;
  xs: readonly number[];
  ys: readonly number[];
  age: number;
}

/**
 * 연기 표지는 속도장 위에서 적분으로 쌓이는 상태다. 압력장은 받음각이 바뀔 때만 다시 굽는다.
 *
 * - `aoaDeg` — 슬라이더가 가리키는 받음각(°).
 * - `flowAoaDeg` — 지금 연기 줄 · 압력장이 계산된 받음각. `aoaDeg` 와 다르면 `step` 이 새로 흘린다.
 * - `lines` · `releaseClock` · `releaseCount` — 원본 `lines` · `releaseClock` · `releaseCount`.
 * - `field` — 압력장 칸 값(행 우선, 첫 행이 위). 받음각이 바뀔 때만 바뀐다.
 * - `acc` — 고정 걸음(1/60 초)을 맞추는 누적기. 실시간 dt 는 가변이다.
 * - `flat` — 받음각 0° 일 때 true. 캡션 슬롯 `cases` 가 읽는다.
 */
export interface LiftForceState {
  aoaDeg: number;
  flowAoaDeg: number;
  lines: readonly SmokeLine[];
  releaseClock: number;
  releaseCount: number;
  field: readonly number[];
  acc: number;
  flat: boolean;
}

/** 받음각 기본값에서 첫 줄 하나를 뿌린 상태. 7 초 미리 진행은 선언(`preroll`)이 한다. */
export function initialState(): LiftForceState {
  return freshFlow(AOA.default);
}
