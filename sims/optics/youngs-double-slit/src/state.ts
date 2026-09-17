/**
 * 그림은 전부 시각과 「아래 슬릿이 열려 있던 창 목록」의 함수다. 상태가 드는 것은 단추 인계와 캡션 판정 몫뿐이다.
 *
 * - `clock` — 조각 시계. `step` 은 `TimelineFrame` 을 받지 못해 따로 센다(NOTES 「어휘 부족」).
 * - `manual` — 한 번이라도 단추를 눌렀으면 true. 그 뒤로 자동 주기가 멈춘다(원본 규칙).
 * - `windows` — 수동일 때 아래 슬릿이 열린 창 목록. `off` 가 null 이면 아직 열려 있다.
 * - `togglePressed` — 열기/닫기 단추가 쓰는 자리. `step` 이 소비하고 지운다.
 * - `showOpen` · `showClose` — 두 단추 중 어느 것을 보일지(`visibleWhen`).
 * - `cap*` — 캡션 슬롯 `cases` 가 보는 자리. 원본 `stateOf` 의 다섯 갈래.
 */
export interface SlitWindow {
  on: number;
  off: number | null;
}

export interface YoungsDoubleSlitState {
  clock: number;
  manual: boolean;
  windows: readonly SlitWindow[];
  togglePressed: boolean;
  showOpen: boolean;
  showClose: boolean;
  capSingle: boolean;
  capTraveling: boolean;
  capArriving: boolean;
  capDark: boolean;
  capLeaving: boolean;
}

export function initialState(): YoungsDoubleSlitState {
  return {
    clock: 0,
    manual: false,
    windows: [],
    togglePressed: false,
    showOpen: true,
    showClose: false,
    capSingle: true,
    capTraveling: false,
    capArriving: false,
    capDark: false,
    capLeaving: false,
  };
}
