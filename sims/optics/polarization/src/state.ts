/**
 * 그림은 전부 시각(과 조작값)의 함수다. 상태가 드는 것은 조작기 인계와 캡션 판정 몫뿐이다.
 *
 * - `clock` — 조각 시계. `step` 은 `TimelineFrame` 을 받지 못해 따로 센다(NOTES 「어휘 부족」).
 *   자동 진행 중에 슬라이더 손잡이 · 버튼 문안 · 캡션 판정을 화면에 맞추는 데만 쓴다.
 * - `manual` — 한 번이라도 조작했으면 true. 그 뒤로 자동 진행이 멈춘다(원본 규칙).
 * - `target` — 조작 중 가운데 판이 가려는 곳. 1 = 빛길 안, 0 = 빠짐.
 * - `inserted` — 끼워진 정도 0~1. `thetaDeg` — 가운데 판 축 각도(첫 판 세로 축에서 잰 도).
 * - `dir` — +1 끼우는 중, −1 빼는 중, 0 멈춤.
 * - `angleDeg` · `angleHeld` — 슬라이더가 쓰는 자리.
 * - `togglePressed` — 끼우기/빼기 단추가 쓰는 자리. `step` 이 소비하고 지운다.
 * - `showRemove` · `showInsert` — 두 단추 중 어느 것을 보일지(`visibleWhen`).
 * - `cap*` — 캡션 슬롯 `cases` 가 보는 자리. 값(상대 세기)으로 문장이 갈리는 때만 켠다.
 */
export interface PolarizationState {
  clock: number;
  manual: boolean;
  target: 0 | 1;
  inserted: number;
  thetaDeg: number;
  dir: -1 | 0 | 1;
  angleDeg: number;
  angleHeld: boolean;
  togglePressed: boolean;
  showRemove: boolean;
  showInsert: boolean;
  capBlocked: boolean;
  capInserting: boolean;
  capRemoving: boolean;
  capParallel: boolean;
  capCrossed: boolean;
  capDim: boolean;
  capRevived: boolean;
}

export function initialState(): PolarizationState {
  return {
    clock: 0,
    manual: false,
    target: 1,
    inserted: 0,
    thetaDeg: 45,
    dir: 0,
    angleDeg: 45,
    angleHeld: false,
    togglePressed: false,
    showRemove: false,
    showInsert: true,
    capBlocked: false,
    capInserting: false,
    capRemoving: false,
    capParallel: false,
    capCrossed: false,
    capDim: false,
    capRevived: false,
  };
}
