// ========================================================================
// triple-point — 순수 물리
// ========================================================================
// 삼중점 둘레의 상평형 그림을 삼중점에서 잰 좌표(ΔT K, Δp Pa)로 둔다. 세 경계는
// 삼중점에서 나오는 곧은 선이다 — 확대창(±1.8 K · ±100 Pa) 안에서는 곡률이 보이지 않는다.
//   승화선  Δp = subSlope · ΔT   (ΔT ≤ 0)
//   증발선  Δp = vapSlope · ΔT   (ΔT ≥ 0)
//   융해선  ΔT = Δp / meltSlope × meltTiltGain   (Δp ≥ 0, 기울기 과장 — schema 참고)
// 점이 어느 영역에 드는지가 곧 그릇에 남는 상이다.
//
// 모든 것이 시각의 닫힌 식이라 쌓는 상태가 없다. DOM · 캔버스 · 시간을 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  D_P,
  D_T,
  EXCURSIONS,
  ICE_CUBES,
  MELT_SLOPE,
  MELT_TILT_GAIN,
  P_TP,
  SEED,
  SHARE_ICE,
  SHARE_VAPOR,
  SHARE_WATER,
  SUB_SLOPE,
  T_TP,
  VAPOR_DOTS,
  VAPOR_DRIFT_S,
  VAP_SLOPE,
  WIN_P,
  WIN_T,
  phaseId,
  type Excursion,
} from './schema';
import type { TriplePointState } from './state';

export interface TriplePointConstants {
  /** 삼중점 온도(℃) · 압력(Pa). */
  tTp: number;
  pTp: number;
  /** 벗어나는 폭(K · Pa). */
  dT: number;
  dP: number;
  /** 세 경계의 기울기 dp/dT (Pa/K)와 융해선 기울어짐 과장 배율. */
  subSlope: number;
  vapSlope: number;
  meltSlope: number;
  meltTiltGain: number;
  /** 확대창 반폭(K · Pa). */
  winT: number;
  winP: number;
  /** 삼중점에서 세 몫의 비. */
  shareIce: number;
  shareWater: number;
  shareVapor: number;
  /** 얼음 조각 수 · 김 알갱이 최대 수 · 시드 · 알갱이가 한 번 떠도는 시간(초). */
  iceCubes: number;
  vaporDots: number;
  seed: number;
  vaporDriftS: number;
}

export function readConstants(stage: StageDef): TriplePointConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    tTp: c.tTp ?? T_TP,
    pTp: c.pTp ?? P_TP,
    dT: c.dT ?? D_T,
    dP: c.dP ?? D_P,
    subSlope: c.subSlope ?? SUB_SLOPE,
    vapSlope: c.vapSlope ?? VAP_SLOPE,
    meltSlope: c.meltSlope ?? MELT_SLOPE,
    meltTiltGain: c.meltTiltGain ?? MELT_TILT_GAIN,
    winT: c.winT ?? WIN_T,
    winP: c.winP ?? WIN_P,
    shareIce: c.shareIce ?? SHARE_ICE,
    shareWater: c.shareWater ?? SHARE_WATER,
    shareVapor: c.shareVapor ?? SHARE_VAPOR,
    iceCubes: c.iceCubes ?? ICE_CUBES,
    vaporDots: c.vaporDots ?? VAPOR_DOTS,
    seed: c.seed ?? SEED,
    vaporDriftS: c.vaporDriftS ?? VAPOR_DRIFT_S,
  };
}

// ------------------------------------------------------------------------
// 상평형 그림 (삼중점에서 잰 좌표)
// ------------------------------------------------------------------------

export type Phase = 'ice' | 'water' | 'vapor';

/** 승화선 · 증발선의 압력(ΔT 에서). */
export const subP = (c: TriplePointConstants, dT: number): number => c.subSlope * dT;
export const vapP = (c: TriplePointConstants, dT: number): number => c.vapSlope * dT;
/** 그리는 융해선의 온도(Δp 에서). 기울어짐을 `meltTiltGain` 만큼 키운다. */
export const meltT = (c: TriplePointConstants, dp: number): number => (dp / c.meltSlope) * c.meltTiltGain;

/** (ΔT, Δp) 가 든 영역. 그리는 선과 같은 식으로 판정한다 — 점과 영역이 어긋나지 않게. */
export function phaseAt(c: TriplePointConstants, dT: number, dp: number): Phase {
  if (dT <= 0 && dp <= 0) return dp > subP(c, dT) ? 'ice' : 'vapor';
  if (dT > 0 && dp <= vapP(c, dT)) return 'vapor';
  return dT < meltT(c, Math.max(0, dp)) ? 'ice' : 'water';
}

// ------------------------------------------------------------------------
// 지금 — 어느 벗어남의 어디쯤인가
// ------------------------------------------------------------------------

export type Shares = Record<Phase, number>;

export interface NowReading {
  ex: Excursion;
  /** 지금 점(삼중점에서 잰 ΔT K · Δp Pa). */
  at: Vec2;
  /** 벗어난 끝 자리와 그 영역. */
  target: Vec2;
  targetPhase: Phase;
  /** 옮기기 시작해 되돌아오기 전까지 참 — 화살표와 폭 글자를 둘 조건. */
  departed: boolean;
  /** 옮긴 몫 0~1 (되돌림에서 줄어든다). */
  reach: number;
  /** 그릇 속 세 몫(합 1). */
  shares: Shares;
}

/** 삼중점에서의 세 몫(합 1). */
export function tpShares(c: TriplePointConstants): Shares {
  const sum = c.shareIce + c.shareWater + c.shareVapor;
  return { ice: c.shareIce / sum, water: c.shareWater / sum, vapor: c.shareVapor / sum };
}

/**
 * 시간표에서 지금을 읽는다. 단계 경계는 선언이 안다 — 지금 벗어남은 그 다섯 단계의
 * 시작 · 끝 시각으로 고르고, 옮김 · 바뀜 · 되돌림의 진행도는 `at()` 으로 읽는다.
 */
export function readNow(tl: TimelineFrame, c: TriplePointConstants): NowReading {
  const ex =
    EXCURSIONS.find((e) => tl.u >= tl.start(phaseId(e, 'tp')) && tl.u < tl.end(phaseId(e, 'back'))) ??
    EXCURSIONS[EXCURSIONS.length - 1]!;
  const move = tl.at(phaseId(ex, 'move'));
  const change = tl.at(phaseId(ex, 'change'));
  const back = tl.at(phaseId(ex, 'back'));

  const target: Vec2 = ex.axis === 'T' ? [ex.sign * c.dT, 0] : [0, ex.sign * c.dP];
  const targetPhase = phaseAt(c, target[0], target[1]);
  const reach = move - back;
  const g = change - back;

  const s0 = tpShares(c);
  const s1: Shares = { ice: 0, water: 0, vapor: 0 };
  s1[targetPhase] = 1;
  const lerp = (a: number, b: number): number => a + (b - a) * g;

  return {
    ex,
    at: [target[0] * reach, target[1] * reach],
    target,
    targetPhase,
    departed: move > 0 && back < 1,
    reach,
    shares: { ice: lerp(s0.ice, s1.ice), water: lerp(s0.water, s1.water), vapor: lerp(s0.vapor, s1.vapor) },
  };
}

// ------------------------------------------------------------------------
// 결정적 난수 — (시드, 번호, 갈래)의 함수. 같은 시각은 같은 화면이다.
// ------------------------------------------------------------------------

export function hash01(seed: number, i: number, k: number): number {
  let h = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(i + 1, 0x85ebca77) ^ Math.imul(k + 1, 0xc2b2ae3d)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TriplePointState }): TriplePointState {
  return params.state;
}
