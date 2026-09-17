import { OFFSET, SEED } from './schema';
import { captionOf, drawCycle, type CycleDraw } from './physics';

/**
 * 조각 시계와, 그 시계의 순환에서 뽑은 원자 수명 · 캡션 값.
 *
 * 화면은 시각의 함수다. 상태에 두는 것은 둘뿐이다 —
 * - `draw`: 순환마다 한 번 뽑는 난수(자리 흔들림 · 수명). 프레임마다 다시 뽑지 않으려고 둔다.
 * - `caption`: 캡션 슬롯의 `vars` 가 state 경로만 가리킬 수 있어서 둔다.
 *
 * `step` 이 시간표 프레임을 받지 못해 시계를 따로 센다 (장부 G01).
 */
export interface RadioactiveDecayState {
  /** 조각 시계(초). 엔진 시계와 같이 `startAt` 에서 출발한다. */
  t: number;
  draw: CycleDraw;
  caption: { n: string; start: string; now: string; counts: string };
}

export function initialState(): RadioactiveDecayState {
  const t = OFFSET;
  const draw = drawCycle(SEED, 0);
  return { t, draw, caption: captionOf(draw, t) };
}
