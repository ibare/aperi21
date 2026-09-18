// ========================================================================
// nuclear-fusion — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 핵의 자리 · 막대 높이 · 화살표 길이는 모두 스테이지 상수와
// 시간표 진행도의 함수다. `step` 은 항등이다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { DEFAULTS, LAYOUT, type NuclearFusionConstantKey } from './schema';
import type { NuclearFusionState } from './state';

export type NuclearFusionConstants = { readonly [K in NuclearFusionConstantKey]: number };

/** 띄우는 정박값과 계산값이 어긋나도 되는 폭 — 소수 여섯째 자리의 반. */
const MASS_TOLERANCE = 5e-7;
/** 에너지 정박값(소수 첫째 자리)과 계산값이 어긋나도 되는 폭. */
const ENERGY_TOLERANCE = 0.05;

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * 합 · 결손 · 에너지는 띄우는 정박값이라 따로 선언되지만 서로 관계가 있다. 저작자가 한쪽만
 * 바꾸면 화면이 스스로와 어긋나므로 여기서 던진다 — 관계를 선언할 자리는 없다 (장부 G143).
 */
export function readConstants(stage: StageDef): NuclearFusionConstants {
  const c = (stage.constants ?? {}) as Partial<Record<NuclearFusionConstantKey, number>>;
  const k = {} as Record<NuclearFusionConstantKey, number>;
  for (const name of Object.keys(DEFAULTS) as NuclearFusionConstantKey[]) {
    k[name] = c[name] ?? DEFAULTS[name];
  }
  const fail = (what: string): never => {
    throw new Error(`nuclear-fusion: 스테이지 상수가 서로 맞지 않는다 — ${what}`);
  };
  if (Math.abs(k.massD + k.massT - k.sumBefore) > MASS_TOLERANCE) fail('sumBefore ≠ massD + massT');
  if (Math.abs(k.massHe + k.massN - k.sumAfter) > MASS_TOLERANCE) fail('sumAfter ≠ massHe + massN');
  if (Math.abs(k.sumBefore - k.sumAfter - k.massDefect) > MASS_TOLERANCE) fail('massDefect ≠ sumBefore − sumAfter');
  if (Math.abs(k.massDefect * k.uToMeV - k.energyMeV) > ENERGY_TOLERANCE) fail('energyMeV ≠ massDefect × uToMeV');
  if (Math.abs(k.energyHeMeV + k.energyNMeV - k.energyMeV) > ENERGY_TOLERANCE) fail('energyHeMeV + energyNMeV ≠ energyMeV');
  if (k.zoomFactor <= 0) fail('zoomFactor ≤ 0');
  return k;
}

/**
 * 헬륨 속력 ÷ 중성자 속력. 운동 에너지 E = ½mv² 에서 v ∝ √(E/m).
 * 운동량이 같으니 약 1/4 이다 — 무거운 헬륨은 느리게, 가벼운 중성자는 빠르게 간다.
 */
export function speedRatioHeToN(k: NuclearFusionConstants): number {
  return Math.sqrt(k.energyHeMeV / k.massHe) / Math.sqrt(k.energyNMeV / k.massN);
}

/** 온 막대에서 질량 m(u) 의 윗면 높이(월드). */
export function fullBarY(m: number): number {
  return LAYOUT.barBaseY + m * LAYOUT.barPerU;
}

/**
 * 확대창에서 질량 m(u) 의 높이(월드). 반응 전 합의 위 끝이 창 위에서 `zoomHeadroom` 만큼
 * 아래에 오고, 1 u 는 온 막대의 `zoomFactor` 배로 늘어난다.
 */
export function zoomBarY(m: number, k: NuclearFusionConstants): number {
  const top = LAYOUT.zoomMax[1] - LAYOUT.zoomHeadroom;
  return top - (k.sumBefore - m) * LAYOUT.barPerU * k.zoomFactor;
}

/** 확대창이 온 막대에서 비추는 질량 구간 [아래, 위](u) — 온 막대에 그 자리를 표시한다. */
export function zoomWindowU(k: NuclearFusionConstants): readonly [number, number] {
  const perU = LAYOUT.barPerU * k.zoomFactor;
  const topU = k.sumBefore + LAYOUT.zoomHeadroom / perU;
  const bottomU = topU - (LAYOUT.zoomMax[1] - LAYOUT.zoomMin[1]) / perU;
  return [bottomU, topU];
}

export function step(params: { state: NuclearFusionState }): NuclearFusionState {
  return params.state;
}
