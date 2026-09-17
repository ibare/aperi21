import { AUTO } from './schema';

/**
 * 그림은 전부 시각(과 좁은 곳 굵기)의 함수다. 상태가 드는 것은 조작기 몫뿐이다.
 *
 * - `ratio` — 슬라이더가 가리키는 좁은 곳 굵기. 손대기 전에는 `step` 이 자동 값을 적어
 *   손잡이가 화면을 따라가게 한다.
 * - `held` — 슬라이더를 잡고 있는 동안 true (`heldPath`).
 * - `manual` — 한 번이라도 잡았으면 true. 그 뒤로 자동 변화가 멈춘다(원본 규칙).
 * - `manualEven` · `manualNarrow` — 손댄 뒤 캡션 슬롯이 문장을 고르는 자리(`caption.cases`).
 * - `clock` — 손잡이를 자동 값에 맞추기 위한 조각 시계. `step` 은 `TimelineFrame` 을 받지
 *   못해 따로 센다(NOTES 「어휘 부족」). 그림은 이것을 읽지 않는다.
 */
export interface BernoullisPrincipleState {
  clock: number;
  ratio: number;
  held: boolean;
  manual: boolean;
  manualEven: boolean;
  manualNarrow: boolean;
}

export function initialState(): BernoullisPrincipleState {
  const clock = AUTO.startAt;
  return {
    clock,
    ratio: AUTO.mean + AUTO.swing * Math.cos((2 * Math.PI * clock) / AUTO.period),
    held: false,
    manual: false,
    manualEven: false,
    manualNarrow: false,
  };
}
