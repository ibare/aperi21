// ========================================================================
// moment-of-inertia — 상태
// ========================================================================
// 자동 진행의 화면은 모두 시각의 함수다 — scene 이 `params.timeline` 에서 읽는다.
// 상태가 드는 것은 셋뿐이다.
//
// 1. 캡션 `vars` 가 읽는 문자열 — 자릿수는 조각이 정한다(거리 비 · 각 비는 소수 첫째 자리).
// 2. 독자 조작 — 슬라이더 값 `r`, 잡힘 `held`, 수동 시행 여부와 그때 이어 받은 바퀴 각.
// 3. 조각 시계의 사본 `clock` — `step` 이 시간표 프레임을 받지 못해(장부 G01) 잡는 순간의
//    바퀴 각과 자동 진행 중 슬라이더 표시값을 계산하려고 따로 센다.
// ========================================================================

import {
  START_AT,
  TRIALS,
} from './schema';
import { distRatioText, inertiaRatioText, rText } from './physics';

export interface MomentOfInertiaState {
  /** 조각 시계 사본(초). 잡는 동안 0 — 러너의 `restart` 와 맞춘다. */
  clock: number;
  /** 슬라이더 값 = 오른쪽 질량의 반지름(R). 자동 진행 중에는 지금 표시 반지름을 따른다. */
  r: number;
  /** 슬라이더를 잡고 있는가 (`heldPath`). */
  held: boolean;
  /** 지난 걸음에 잡혀 있었는가 — 잡는 순간을 알아챈다. */
  wasHeld: boolean;
  /** 독자가 한 번이라도 만졌는가. 그 뒤로는 수동 시행이 반복된다. */
  manual: boolean;
  /** 수동 시행이 시작될 때 이어 받은 두 바퀴의 각(라디안, 화면 시계방향). */
  baseL: number;
  baseR: number;
  /** 캡션 `cases` — 수동 시행에서 거리가 같은가 / 다른가. */
  manualSame: boolean;
  manualLag: boolean;
  /** 캡션 `vars`. */
  farDist: string;
  farRatio: string;
  midDist: string;
  midRatio: string;
  manDist: string;
  manRatio: string;
  toMid: string;
  toNear: string;
  toFar: string;
}

export function initialState(): MomentOfInertiaState {
  const r0 = TRIALS[0].r;
  return {
    clock: START_AT,
    r: r0,
    held: false,
    wasHeld: false,
    manual: false,
    baseL: 0,
    baseR: 0,
    manualSame: false,
    manualLag: false,
    farDist: distRatioText(TRIALS[0].r),
    farRatio: inertiaRatioText(TRIALS[0].r),
    midDist: distRatioText(TRIALS[1].r),
    midRatio: inertiaRatioText(TRIALS[1].r),
    manDist: distRatioText(r0),
    manRatio: inertiaRatioText(r0),
    toMid: rText(TRIALS[1].r),
    toNear: rText(TRIALS[2].r),
    toFar: rText(TRIALS[0].r),
  };
}
