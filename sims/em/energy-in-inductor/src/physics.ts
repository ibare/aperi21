// ========================================================================
// energy-in-inductor — 순수 물리
// ========================================================================
// 코일에 전류 i 가 흐르면 자기 선속 쇄교는 LI 이고, 그래서 LI–I 는 원점을 지나는 직선이다.
//
// 전류를 di 만큼 키우는 동안 코일 양 끝에는 역기전력 ε = L di/dt 가 선다. 그것을 거슬러
// 전류 i 를 밀어 넣는 일률은 ε i 이므로, 그동안 한 일은
//   dW = ε i dt = i · L di = i · d(LI)
// 이다. 가로 I · 세로 LI 그래프에서 이것은 직선 아래 i ~ i+di 의 가느다란 띠 넓이다.
// 0 에서 I 까지 모으면 직선 아래 삼각형, ½LI² 이 된다 — 근사가 아니다.
//
// 전류를 줄이면 같은 띠를 거꾸로 지나며, 코일이 전류와 같은 쪽으로 밀어 그 일을 돌려준다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CURRENT_ARROW_PER_AMP,
  EMF_ARROW_PER_VOLT,
  FIELD_LINES,
  FINAL_CURRENT,
  INDUCTANCE,
} from './schema';
import type { EnergyInInductorState } from './state';

export interface EnergyInInductorConstants {
  /** 인덕턴스(H). */
  inductance: number;
  /** 키워 올린 끝 전류(A). */
  finalCurrent: number;
  /** 끝 전류에서 축 위 · 아래 각각의 자기력선 수. 1 이상의 정수로 읽는다. */
  fieldLines: number;
  /** 전류 화살표 길이(월드 단위) ÷ 전류(A). */
  currentArrowPerAmp: number;
  /** 역기전력 화살표 길이(월드 단위) ÷ 역기전력(V). */
  emfArrowPerVolt: number;
}

export function readConstants(stage: StageDef): EnergyInInductorConstants {
  const c = stage.constants ?? {};
  return {
    inductance: c.inductance ?? INDUCTANCE,
    finalCurrent: c.finalCurrent ?? FINAL_CURRENT,
    fieldLines: Math.max(1, Math.round(c.fieldLines ?? FIELD_LINES)),
    currentArrowPerAmp: c.currentArrowPerAmp ?? CURRENT_ARROW_PER_AMP,
    emfArrowPerVolt: c.emfArrowPerVolt ?? EMF_ARROW_PER_VOLT,
  };
}

/**
 * 지금 전류(A). **단계 경계는 선언이 정한다** — `rise` 동안 0 → 끝 전류, `release` 동안
 * 끝 전류 → 0. 두 단계 모두 `linear` 이라 전류가 고르게 바뀐다.
 */
export function currentAt(tl: TimelineFrame, c: EnergyInInductorConstants): number {
  return c.finalCurrent * (tl.at('rise') - tl.at('release'));
}

export interface EmfReading {
  /** 역기전력 크기(V). 전류가 바뀌지 않으면 0. */
  volts: number;
  /**
   * 전류에 대한 방향. `oppose` 는 전류를 거스른다(키우는 동안 — 우리가 일을 한다),
   * `aid` 는 전류를 앞으로 민다(줄이는 동안 — 코일이 일을 돌려준다).
   */
  sense?: 'oppose' | 'aid';
}

/**
 * 역기전력 = L × 전류 변화율. 변화율은 끝 전류 ÷ 그 단계 길이다 — 단계 길이는 선언이
 * 정하므로, 저작자가 `rise` 를 늘리면 역기전력 화살표가 따라 짧아진다.
 */
export function emfAt(tl: TimelineFrame, c: EnergyInInductorConstants): EmfReading {
  if (tl.phase === 'rise') {
    return { volts: (c.inductance * c.finalCurrent) / tl.duration('rise'), sense: 'oppose' };
  }
  if (tl.phase === 'release') {
    return { volts: (c.inductance * c.finalCurrent) / tl.duration('release'), sense: 'aid' };
  }
  return { volts: 0 };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EnergyInInductorState }): EnergyInInductorState {
  return params.state;
}
