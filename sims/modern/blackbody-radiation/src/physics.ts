// ========================================================================
// blackbody-radiation — 순수 계산
// ========================================================================
// 같은 흑체의 복사 세기를 두 식으로 센다.
//
//   관측(플랑크)       B(λ) ∝ 1 / (λ⁵ (e^{hc/λkT} − 1))
//   고전(레일리-진스)  B(λ) ∝ T / (λ⁴ · hc/k)          — 위 식에서 e^x − 1 ≈ x 로 둔 것
//
// 두 식은 앞 상수가 같아(뺐다) **같은 눈금**에 겹친다. 긴 파장(x 가 작다)에서는 둘이 가깝고,
// 짧은 파장에서 관측은 e^x 에 눌려 0 으로 가는데 고전은 λ⁻⁴ 로 끝없이 커진다.
// 높이는 관측 곡선의 봉우리를 1 로 맞춘다 — 절대 세기는 이 그림의 질문이 아니다 (NOTES (b)).
//
// DOM · 캔버스 · 테마 색을 모른다. 모든 것이 시각의 함수다 — 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_DECADES,
  CEILING_RATIO,
  NM_AGREE,
  NM_END,
  NM_LABEL,
  NM_PART,
  NM_START,
  TEMPERATURE_K,
} from './schema';
import type { BlackbodyRadiationState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface BlackbodyConstants {
  /** 흑체 온도(K). */
  temperature: number;
  /** 훑는 파장의 정박점(nm) — 시작 · 나란함 끝 · 갈라짐 끝 · 관측 이름표 · 멈춤. */
  nmStart: number;
  nmAgree: number;
  nmPart: number;
  nmLabel: number;
  nmEnd: number;
  /** 천장 높이 — 관측 봉우리의 몇 배. */
  ceilingRatio: number;
  /** 천장 위 화살표가 가득 자라는 자릿수. */
  arrowDecades: number;
}

export function readConstants(stage: StageDef): BlackbodyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    temperature: c.temperature ?? TEMPERATURE_K,
    nmStart: c.nmStart ?? NM_START,
    nmAgree: c.nmAgree ?? NM_AGREE,
    nmPart: c.nmPart ?? NM_PART,
    nmLabel: c.nmLabel ?? NM_LABEL,
    nmEnd: c.nmEnd ?? NM_END,
    ceilingRatio: c.ceilingRatio ?? CEILING_RATIO,
    arrowDecades: c.arrowDecades ?? ARROW_DECADES,
  };
}

// ------------------------------------------------------------------------
// 두 복사 식
// ------------------------------------------------------------------------

/** 플랑크 식의 둘째 복사 상수 hc/k (nm · K). */
const PLANCK_C2_NM_K = 1.4388e7;
/** 파장 단위 플랑크 식의 봉우리 조건 x = hc/(λkT) 의 해 (x = 5(1 − e^−x)). */
const WIEN_X = 4.965114231744276;

/** 관측(플랑크) 복사 세기 — 앞 상수를 뺀 상대값. */
export function planck(nm: number, T: number): number {
  return 1 / (Math.pow(nm, 5) * (Math.exp(PLANCK_C2_NM_K / (nm * T)) - 1));
}

/** 고전(레일리-진스) 복사 세기 — `planck` 과 같은 앞 상수를 뺀 상대값. */
export function rayleighJeans(nm: number, T: number): number {
  return T / (PLANCK_C2_NM_K * Math.pow(nm, 4));
}

/** 관측 곡선의 봉우리 파장(nm). 높이를 맞추는 기준으로만 쓴다 — 화면에 띄우지 않는다. */
function peakNm(T: number): number {
  return PLANCK_C2_NM_K / (WIEN_X * T);
}

/** 관측 곡선 봉우리를 1 로 맞춘 두 세기. */
export function relativeIntensities(nm: number, T: number): { observed: number; classical: number } {
  const p0 = planck(peakNm(T), T);
  return { observed: planck(nm, T) / p0, classical: rayleighJeans(nm, T) / p0 };
}

/**
 * 고전 곡선이 천장(관측 봉우리의 `ceilingRatio` 배)에 닿는 파장(nm). λ⁻⁴ 라 닫힌 식으로 풀린다.
 * 그 이름표를 이 자리에 붙인다.
 */
export function ceilingNm(c: BlackbodyConstants): number {
  const T = c.temperature;
  const p0 = planck(peakNm(T), T);
  return Math.pow(T / (PLANCK_C2_NM_K * c.ceilingRatio * p0), 0.25);
}

/**
 * 천장 위 화살표의 길이 비율 0~1. 고전 세기가 천장을 넘은 배수의 로그를 `arrowDecades` 로 나눈다 —
 * 천장에 막 닿으면 0, 천장의 10^arrowDecades 배면 1.
 */
export function overflowFraction(classical: number, c: BlackbodyConstants): number {
  const over = classical / c.ceilingRatio;
  if (over <= 1) return 0;
  return Math.min(1, Math.log10(over) / c.arrowDecades);
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 지금 훑고 있는 파장(nm). **단계 경계는 선언이 정한다** — 단계 id 로 가르지 않고 네 훑기 단계의
 * 진행도(`at`)를 정박 파장 사이의 걸음에 곱해 쌓는다. 머묾 · 지움 단계에서는 넷 다 1 이라 멈춘
 * 자리에 있다.
 */
export function sweepNm(tl: TimelineFrame, c: BlackbodyConstants): number {
  return (
    c.nmStart -
    (c.nmStart - c.nmAgree) * tl.at('agree') -
    (c.nmAgree - c.nmPart) * tl.at('part') -
    (c.nmPart - c.nmLabel) * tl.at('uv') -
    (c.nmLabel - c.nmEnd) * tl.at('uvDeep')
  );
}

/** 관측 곡선 이름표를 세울지 — 훑는 자리가 `nmLabel` 을 지난 뒤(`uvDeep` 단계부터). */
export function observedLabelShown(tl: TimelineFrame): boolean {
  return tl.at('uvDeep') > 0;
}

/** 그림 전체의 짙기 — 지움 단계에서 옅어져 처음으로 돌아간다. */
export function drawingOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('clear');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BlackbodyRadiationState }): BlackbodyRadiationState {
  return params.state;
}
