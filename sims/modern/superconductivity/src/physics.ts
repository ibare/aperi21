// ========================================================================
// superconductivity — 순수 물리
// ========================================================================
// 정상 상태의 금속 저항을 R(T) = 잔류 + (처음 − 잔류)·(T/T_max)^n 으로 근사한다.
// 온도가 내려가면 격자 진동이 얼어붙어 T^n 몫이 사라지고 불순물 · 결함이 만드는
// 잔류 몫만 남는다 — 구리의 곡선이 바닥에서 평평해지는 이유다.
//
// 수은은 T_c 위에서는 같은 꼴이고, T_c 에서 저항이 0 이 된다. 실제 전이 폭은
// 수백분의 1 K 라서 판에서는 수직선이다. 그 한순간을 눈으로 보게 시간표가
// `drop` 단계 동안 온도를 T_c 에 붙잡아 둔다.
//
// 모든 것이 시간표 시각의 함수다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  COPPER_RESIDUAL,
  COPPER_TOP,
  EXPONENT,
  MERCURY_RESIDUAL,
  MERCURY_TOP,
  T_C,
  T_END,
  T_MAX,
} from './schema';
import type { SuperconductivityState } from './state';

export interface SuperconductivityConstants {
  /** 식히기 시작 · 임계 · 멈춤 온도(K). */
  tMax: number;
  tc: number;
  tEnd: number;
  /** 줄어드는 몫의 거듭제곱. */
  exponent: number;
  /** 구리 · 수은의 처음 저항과 잔류 저항(상대 단위). */
  copperTop: number;
  copperResidual: number;
  mercuryTop: number;
  mercuryResidual: number;
}

export function readConstants(stage: StageDef): SuperconductivityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tMax: c.tMax ?? T_MAX,
    tc: c.tc ?? T_C,
    tEnd: c.tEnd ?? T_END,
    exponent: c.exponent ?? EXPONENT,
    copperTop: c.copperTop ?? COPPER_TOP,
    copperResidual: c.copperResidual ?? COPPER_RESIDUAL,
    mercuryTop: c.mercuryTop ?? MERCURY_TOP,
    mercuryResidual: c.mercuryResidual ?? MERCURY_RESIDUAL,
  };
}

/** 정상 상태 금속의 저항(상대 단위). */
export function normalResistance(T: number, top: number, residual: number, c: SuperconductivityConstants): number {
  return residual + (top - residual) * Math.pow(Math.max(0, T) / c.tMax, c.exponent);
}

export function copperResistance(T: number, c: SuperconductivityConstants): number {
  return normalResistance(T, c.copperTop, c.copperResidual, c);
}

/** 수은이 정상 상태로 남아 있을 때의 저항 — T_c 바로 위의 값을 여기서 얻는다. */
export function mercuryNormalResistance(T: number, c: SuperconductivityConstants): number {
  return normalResistance(T, c.mercuryTop, c.mercuryResidual, c);
}

export interface CoolingReading {
  /** 지금 온도(K). `drop` 동안은 T_c 에 머문다. */
  T: number;
  /** 수은이 떨어진 정도 0~1. 떨어지기 전 0, 다 떨어진 뒤 1. */
  drop: number;
  /** T_c 아래로 내려간 정도 0~1. */
  below: number;
  /** 지금 수은의 저항(상대 단위). */
  mercury: number;
  /** 지금 구리의 저항(상대 단위). */
  copper: number;
  /** 그림 전체의 불투명도. 마지막 단계에서 흐려졌다가 다음 주기로 넘어간다. */
  alpha: number;
}

/**
 * 지금 시각의 온도와 두 저항을 읽는다. **단계 경계는 선언이 정한다** — 경계 시각을
 * 모듈 상수와 견주지 않고 `at()` 으로 묻는다 (S-piece 「시간표는 선언이다」).
 *
 * 온도는 두 식힘 단계의 진행도 합이라 분기가 없다: `drop` 동안은 첫 식힘이 1, 둘째가
 * 0 이라서 저절로 T_c 에 머문다.
 */
export function readCooling(tl: TimelineFrame, c: SuperconductivityConstants): CoolingReading {
  const cool = tl.at('cool-normal');
  const drop = tl.at('drop');
  const below = tl.at('cool-below');
  const T = c.tMax - (c.tMax - c.tc) * cool - (c.tc - c.tEnd) * below;
  // 수은: 떨어지기 전에는 정상 상태의 곡선, 떨어지는 동안은 T_c 에서의 값에서 0 으로.
  const mercury = drop > 0 ? mercuryNormalResistance(c.tc, c) * (1 - drop) : mercuryNormalResistance(T, c);
  return {
    T,
    drop,
    below,
    mercury,
    copper: copperResistance(T, c),
    alpha: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SuperconductivityState }): SuperconductivityState {
  return params.state;
}
