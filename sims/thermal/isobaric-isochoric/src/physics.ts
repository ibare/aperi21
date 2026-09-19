// ========================================================================
// isobaric-isochoric — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 시간표도 모른다 — scene 이 가열 단계의 진행도를
// 넘기면 두 통의 지금 온도 · 부피 · 압력을 낸다. 두 통은 같은 진행도로 같은 열을
// 받는다. 모든 것이 (진행도, 선언값)의 함수라 쌓는 것이 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { IsobaricIsochoricState } from './state';

export interface IsobaricIsochoricConstants {
  /** 처음 온도(K). */
  t0: number;
  /** 처음 부피(L). */
  v0: number;
  /** 처음 압력(P 축 한 칸). */
  p0: number;
  /** 압력 고정 쪽 온도 상승(K). */
  dTp: number;
  /** 부피 고정 쪽 온도 상승(K). */
  dTv: number;
}

export function readConstants(stage: StageDef): IsobaricIsochoricConstants {
  const c = stage.constants ?? {};
  return {
    t0: c.t0 ?? 300,
    v0: c.v0 ?? 1,
    p0: c.p0 ?? 1,
    dTp: c.dTp ?? 180,
    dTv: c.dTv ?? 300,
  };
}

/** 한 통의 지금 상태 — 온도 상승(K) · 부피(L) · 압력(칸). */
export interface GasNow {
  dT: number;
  v: number;
  p: number;
}

/**
 * 압력 고정 — 추를 얹은 자유 피스톤. 압력은 그대로, 부피가 온도에 비례해 는다.
 * `heat` 는 가열 단계 진행도(0~1, 이징은 선언).
 */
export function isobaricAt(heat: number, c: IsobaricIsochoricConstants): GasNow {
  const dT = c.dTp * heat;
  return { dT, v: (c.v0 * (c.t0 + dT)) / c.t0, p: c.p0 };
}

/** 부피 고정 — 핀으로 박은 피스톤. 부피는 그대로, 압력이 온도에 비례해 오른다. */
export function isochoricAt(heat: number, c: IsobaricIsochoricConstants): GasNow {
  const dT = c.dTv * heat;
  return { dT, v: c.v0, p: (c.p0 * (c.t0 + dT)) / c.t0 };
}

/** 캡션 `vars` 가 가리킬 선언값의 글자. 계산해 줄이지 않는다. */
export function deriveTexts(c: IsobaricIsochoricConstants): IsobaricIsochoricState {
  return {
    t0Text: String(c.t0),
    dTpText: String(c.dTp),
    dTvText: String(c.dTv),
  };
}

/** 쌓는 것이 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: IsobaricIsochoricState }): IsobaricIsochoricState {
  return params.state;
}
