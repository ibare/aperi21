// ========================================================================
// maxwell-boltzmann-distribution — 런타임 상태
// ========================================================================
// 자동 진행만 보면 모든 것이 시각의 함수다. 상태가 비지 않는 이유는 둘이다.
//
// 1. 독자가 슬라이더를 건드리면 온도가 그 값으로 **부드럽게 따라간다** — 누적이다.
// 2. 캡션이 온도 변화 **방향**(직전 걸음 대비)으로 문장을 고른다 — 앞 걸음의 온도가 필요하다.
//
// 표본(분자마다의 300 K 속력과 높이 비율)은 시드에서 한 번 뽑아 상태에 둔다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { readConstants, sampleMolecules } from './physics';

export interface MaxwellBoltzmannDistributionState {
  /** 조각 시계(초). `step` 이 시간표를 받지 못해 따로 센다 (NOTES 「어휘 부족」 G01). */
  readonly clock: number;
  /** 지금 온도(K). */
  readonly temp: number;
  /** 온도 변화 방향. +1 데우는 중 · −1 식히는 중 · 0 멈춤. */
  readonly dir: number;
  /** 독자가 한 번이라도 슬라이더를 잡았는가. 참이면 자동 진행으로 돌아가지 않는다(원본 그대로). */
  readonly manual: boolean;
  /** 슬라이더를 잡고 있는가 (`ControllerInstance.heldPath` 가 러너에서 적는다). */
  readonly held: boolean;
  /** 슬라이더가 가리키는 값(K). 자동일 때는 조각이 지금 온도를 정수로 적고, 수동일 때는 목표 온도다. */
  readonly sliderT: number;

  /** 분자마다의 300 K 속력(m/s). 오름차순 — 층별 추출. */
  readonly baseSpeeds: readonly number[];
  /** 분자마다의 높이 비율 0.03~0.97. 곡선 아래를 고르게 채우는 뜻 없는 채움 좌표. */
  readonly heightFracs: readonly number[];

  // ---- 캡션 슬롯이 가리키는 자리 (`CaptionSlotDef.cases` · `vars`) ----
  readonly manualHeating: boolean;
  readonly manualCooling: boolean;
  readonly manualCold: boolean;
  readonly manualWarm: boolean;
  /** 온도가 멈춰 있고 기준 온도다(자동 · 수동 공통). */
  readonly restingCold: boolean;
  /** 반올림한 지금 온도. 유효숫자는 조각이 정한다. */
  readonly tempText: string;
  /** 분자 수. 캡션이 선언의 값을 말하게 한다. */
  readonly countText: string;
}

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): MaxwellBoltzmannDistributionState {
  const c = readConstants(params.stage);
  const { baseSpeeds, heightFracs } = sampleMolecules(c);
  return {
    clock: 0,
    temp: c.t0,
    dir: 0,
    manual: false,
    held: false,
    sliderT: c.t0,
    baseSpeeds,
    heightFracs,
    manualHeating: false,
    manualCooling: false,
    manualCold: false,
    manualWarm: false,
    restingCold: true,
    tempText: String(Math.round(c.t0)),
    countText: String(c.count),
  };
}
