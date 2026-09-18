// ========================================================================
// star-color-temperature — 순수 계산
// ========================================================================
// 흑체 복사(플랑크 식) · 봉우리 파장 · 그 스펙트럼을 눈으로 본 빛의 색.
// DOM · 캔버스 · 테마 색을 모른다. 색 계산은 `@aperi21/plugin-optics` 의 순수 함수에 맡긴다 —
// 온도 → RGB 표를 여기서 손으로 만들지 않는다 (C2).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { spectrumToLinearRgb, type LinearRgb } from '@aperi21/plugin-optics';
import { T_COOL, T_HOT, T_MID } from './schema';
import type { StarColorTemperatureState } from './state';

export interface StarColorTemperatureConstants {
  /** 세 별의 표면 온도(K). */
  tCool: number;
  tMid: number;
  tHot: number;
}

export function readConstants(stage: StageDef): StarColorTemperatureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { tCool: c.tCool ?? T_COOL, tMid: c.tMid ?? T_MID, tHot: c.tHot ?? T_HOT };
}

/**
 * 지금 표면 온도(K). **단계 경계는 선언이 정한다** — 단계 id 로 가르지 않고 오르는 단계 ·
 * 식는 단계의 진행도(`at`)를 로그 온도에 더해 쌓는다. 머무는 단계에서는 앞 단계의 `at` 이 1 이고
 * 뒤 단계의 `at` 이 0 이라 분기가 필요 없다. 저작자가 단계 길이를 바꿔도 따라간다.
 */
export function temperatureAt(tl: TimelineFrame, c: StarColorTemperatureConstants): number {
  const l0 = Math.log(c.tCool);
  const l1 = Math.log(c.tMid);
  const l2 = Math.log(c.tHot);
  const l = l0 + (l1 - l0) * tl.at('warm') + (l2 - l1) * tl.at('heat') - (l2 - l0) * tl.at('back');
  return Math.exp(l);
}

/**
 * 머무는 단계라면 그 단계의 **선언 온도**, 오르내리는 중이면 null. 화면의 온도 글자는 선언값만
 * 쓴다 — 오르는 도중의 값을 반올림해 띄우지 않는다 (S-piece 유효숫자).
 */
export function heldTemperature(tl: TimelineFrame, c: StarColorTemperatureConstants): number | null {
  const held: Record<string, number> = { cool: c.tCool, mid: c.tMid, hot: c.tHot };
  return held[tl.phase] ?? null;
}

// ------------------------------------------------------------------------
// 흑체 복사
// ------------------------------------------------------------------------

/** 플랑크 식의 둘째 복사 상수 hc/k (nm · K). */
const PLANCK_C2_NM_K = 1.4388e7;
/** 파장 단위 플랑크 식의 봉우리 조건 x = hc/(λkT) 의 해 (x = 5(1 − e^−x)). */
const WIEN_X = 4.965114231744276;

/** 온도 T(K) 흑체가 파장 nm 에서 내는 복사 세기(상대값, 앞 상수는 뺐다). */
export function planck(nm: number, T: number): number {
  return 1 / (Math.pow(nm, 5) * (Math.exp(PLANCK_C2_NM_K / (nm * T)) - 1));
}

/** 복사 곡선의 봉우리 파장(nm). */
export function peakNm(T: number): number {
  return PLANCK_C2_NM_K / (WIEN_X * T);
}

/** 봉우리를 1 로 맞춘 세기. 곡선의 **모양**만 보이려는 것이다 — 밝기(T⁴)는 NOTES (b). */
export function relativeIntensity(nm: number, T: number): number {
  return planck(nm, T) / planck(peakNm(T), T);
}

/**
 * 흑체의 빛 색(선형광). 플랑크 스펙트럼을 눈에 보이는 색으로 옮기고(가시광 띠만 적분된다),
 * **가장 큰 성분이 1** 이 되게 나눈다 — 별의 밝기가 아니라 색만 말한다. 색역 밖 음수 성분은 0 으로 자른다.
 */
export function blackbodyRgb(T: number): LinearRgb {
  const v = spectrumToLinearRgb((nm) => planck(nm, T));
  const c: [number, number, number] = [Math.max(0, v[0]), Math.max(0, v[1]), Math.max(0, v[2])];
  const m = Math.max(c[0], c[1], c[2]) || 1;
  return [c[0] / m, c[1] / m, c[2] / m];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StarColorTemperatureState }): StarColorTemperatureState {
  return params.state;
}
