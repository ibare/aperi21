// ========================================================================
// fermi-level — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 모든 자리가 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 이 조각의 물리는 하나다.
//
//   페르미-디랙 분포   f(E) = 1 / (1 + exp((E − E_F) / kT))
//                     kT → 0 이면 E_F 에서 1 → 0 으로 끊기는 계단이다.
//
// 준위 하나(자리 `slotsPerLevel` 개)에 앉는 전자 수는 자리 수 × f(E) 를 반올림한 것이다.
// 준위가 E_F 둘레에 대칭으로 놓이고 f(E_F + x) = 1 − f(E_F − x) 라서, 아래 준위의 빈자리 수와
// 그 짝인 위 준위의 전자 수가 언제나 같다 — 전자는 새로 생기지 않고 아래에서 위로 옮겨 간다.
//
// 나머지는 배치 계산이다 — 에너지 → 월드 높이, 칸의 가로 자리, 시드로 고른 칸 순서.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_TOP_EV,
  CURVE_X0,
  CURVE_X1,
  FERMI_EV,
  KT_HIGH_EV,
  KT_LOW_EV,
  LEVEL_SPACING_EV,
  PANEL_BOTTOM_Y,
  PANEL_TOP_Y,
  SEED,
  SLOTS_PER_LEVEL,
  TEMP_HIGH_K,
  TEMP_LOW_K,
  ZOOM_HALF_EV,
  ZOOM_LEFT_X,
  ZOOM_RIGHT_X,
} from './schema';
import type { FermiLevelState } from './state';

/** 채워질 확률 곡선의 표본 수. 확대 창 높이를 이만큼 나눠 잰다. */
const CURVE_SAMPLES = 141;

export function step(params: { state: FermiLevelState }): FermiLevelState {
  return params.state;
}

export interface FermiLevelConstants {
  fermiEv: number;
  bandTopEv: number;
  tempLowK: number;
  kTLowEv: number;
  tempHighK: number;
  kTHighEv: number;
  zoomHalfEv: number;
  levelSpacingEv: number;
  slotsPerLevel: number;
  seed: number;
}

export function readConstants(stage: StageDef): FermiLevelConstants {
  const c = stage.constants ?? {};
  return {
    fermiEv: c.fermiEv ?? FERMI_EV,
    bandTopEv: c.bandTopEv ?? BAND_TOP_EV,
    tempLowK: c.tempLowK ?? TEMP_LOW_K,
    kTLowEv: c.kTLowEv ?? KT_LOW_EV,
    tempHighK: c.tempHighK ?? TEMP_HIGH_K,
    kTHighEv: c.kTHighEv ?? KT_HIGH_EV,
    zoomHalfEv: c.zoomHalfEv ?? ZOOM_HALF_EV,
    levelSpacingEv: c.levelSpacingEv ?? LEVEL_SPACING_EV,
    slotsPerLevel: Math.max(1, Math.round(c.slotsPerLevel ?? SLOTS_PER_LEVEL)),
    seed: Math.round(c.seed ?? SEED),
  };
}

// ------------------------------------------------------------------------
// 분포
// ------------------------------------------------------------------------

/** 페르미-디랙 분포. `dE` 는 E − E_F(eV). kT = 0 이면 계단(E_F 바로 위는 0). */
export function fermiDirac(dE: number, kT: number): number {
  if (kT <= 0) return dE < 0 ? 1 : 0;
  return 1 / (1 + Math.exp(dE / kT));
}

/**
 * 지금의 kT(eV). 데우는 단계 동안 0 → 낮은 온도 → 높은 온도로 오르고, 식히는 단계 동안 0 으로
 * 돌아간다. 사이 값은 곡선이 옮겨 가는 모양일 뿐, 화면에 수로 띄우지 않는다.
 */
export function kTNow(tl: TimelineFrame, c: FermiLevelConstants): number {
  const warmed = c.kTLowEv * tl.at('warm') + (c.kTHighEv - c.kTLowEv) * tl.at('hot');
  return warmed * (1 - tl.at('cool'));
}

/** 화면에 띄우는 목표 온도 — 데우는 중이면 도달할 온도. */
export type TempMark = 'zero' | 'low' | 'high';

export function tempMark(tl: TimelineFrame): TempMark {
  if (tl.at('cool') > 0) return 'zero';
  if (tl.at('hot') > 0) return 'high';
  if (tl.at('warm') > 0) return 'low';
  return 'zero';
}

/** 그 온도의 선언된 kT 값(eV). 치수선의 값 글자가 쓴다. */
export function kTOfMark(c: FermiLevelConstants, mark: TempMark): number {
  return mark === 'high' ? c.kTHighEv : mark === 'low' ? c.kTLowEv : 0;
}

// ------------------------------------------------------------------------
// 확대 창 — 준위 배치
// ------------------------------------------------------------------------

/** E_F 한쪽에 놓이는 준위 수. 준위는 E_F ± (k + ½) × 간격 에 선다. */
export function levelsPerSide(c: FermiLevelConstants): number {
  return Math.max(1, Math.floor(c.zoomHalfEv / c.levelSpacingEv + 1e-9));
}

/** 확대 창에서 E − E_F(eV) → 월드 y. 창 가운데가 E_F 다. */
export function zoomY(c: FermiLevelConstants, dE: number): number {
  const mid = (PANEL_BOTTOM_Y + PANEL_TOP_Y) / 2;
  const half = (PANEL_TOP_Y - PANEL_BOTTOM_Y) / 2;
  return mid + (dE / c.zoomHalfEv) * half;
}

/** 준위 k(0 이 E_F 에 가장 가깝다)의 E − E_F. `side` 는 위(+1) · 아래(−1). */
export function levelDE(c: FermiLevelConstants, k: number, side: 1 | -1): number {
  return side * (k + 0.5) * c.levelSpacingEv;
}

/** 확대 창 칸 j 의 가로 자리. */
export function slotX(c: FermiLevelConstants, j: number): number {
  const pitch = (ZOOM_RIGHT_X - ZOOM_LEFT_X) / c.slotsPerLevel;
  return ZOOM_LEFT_X + (j + 0.5) * pitch;
}

/** 아래 준위 k 의 빈자리 수(= 위 준위 k 의 전자 수) — 온도가 kT 일 때. */
export function vacancies(c: FermiLevelConstants, k: number, kT: number): number {
  const dE = levelDE(c, k, -1);
  return Math.round(c.slotsPerLevel * (1 - fermiDirac(dE, kT)));
}

// ------------------------------------------------------------------------
// 시드 결정적 칸 순서
// ------------------------------------------------------------------------

/** 32 비트 정수 시드 → [0, 1) 난수열 (mulberry32). 시드가 같으면 늘 같은 열이다. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** (시드, 준위, 위아래)로 정한 칸 순서. 앞쪽 칸부터 전자가 떠나거나(아래) 앉는다(위). */
export function slotOrder(c: FermiLevelConstants, k: number, side: 1 | -1): number[] {
  const next = rng(c.seed * 7919 + k * 104729 + (side > 0 ? 1 : 2) * 1299709);
  const order = Array.from({ length: c.slotsPerLevel }, (_, j) => j);
  for (let i = order.length - 1; i > 0; i--) {
    const r = Math.floor(next() * (i + 1));
    [order[i], order[r]] = [order[r]!, order[i]!];
  }
  return order;
}

// ------------------------------------------------------------------------
// 전자 자리
// ------------------------------------------------------------------------

/**
 * 확대 창의 전자. 아래 준위 k 의 칸 순서 앞쪽 `vacancies(kTLow)` 개는 `warm` 동안, 그다음
 * `vacancies(kTHigh)` 까지는 `hot` 동안 위 준위 k 의 칸 순서 같은 자리로 옮겨 가고, `cool` 동안
 * 함께 돌아온다. 위 준위의 나머지 칸과 창 밖(더 깊은 곳)은 비어 있거나 가득 차 있다.
 */
export function zoomElectrons(tl: TimelineFrame, c: FermiLevelConstants): Vec2[] {
  const positions: Vec2[] = [];
  const back = 1 - tl.at('cool');
  const pWarm = tl.at('warm') * back;
  const pHot = tl.at('hot') * back;
  const n = levelsPerSide(c);
  for (let k = 0; k < n; k++) {
    const vLow = vacancies(c, k, c.kTLowEv);
    const vHigh = Math.max(vLow, vacancies(c, k, c.kTHighEv));
    const below = slotOrder(c, k, -1);
    const above = slotOrder(c, k, 1);
    const y0 = zoomY(c, levelDE(c, k, -1));
    const y1 = zoomY(c, levelDE(c, k, 1));
    below.forEach((j, r) => {
      const from: Vec2 = [slotX(c, j), y0];
      if (r >= vHigh) {
        positions.push(from);
        return;
      }
      const to: Vec2 = [slotX(c, above[r]!), y1];
      const p = r < vLow ? pWarm : pHot;
      positions.push([from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p]);
    });
  }
  return positions;
}

// ------------------------------------------------------------------------
// 채워질 확률 곡선
// ------------------------------------------------------------------------

/** 확률 f → 곡선 판의 가로 자리. */
export function curveX(f: number): number {
  return CURVE_X0 + (CURVE_X1 - CURVE_X0) * f;
}

/** 확대 창 높이 전체에 걸친 f(E) 곡선. kT = 0 이면 모서리가 날카로운 계단이다. */
export function occupancyCurve(c: FermiLevelConstants, kT: number): Vec2[] {
  if (kT <= 0) {
    const yF = zoomY(c, 0);
    return [
      [curveX(1), PANEL_BOTTOM_Y],
      [curveX(1), yF],
      [curveX(0), yF],
      [curveX(0), PANEL_TOP_Y],
    ];
  }
  const pts: Vec2[] = [];
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const dE = -c.zoomHalfEv + (2 * c.zoomHalfEv * i) / (CURVE_SAMPLES - 1);
    pts.push([curveX(fermiDirac(dE, kT)), zoomY(c, dE)]);
  }
  return pts;
}

// ------------------------------------------------------------------------
// 띠 전체 — 왼쪽 그림
// ------------------------------------------------------------------------

/** 띠 전체 그림에서 에너지(띠 바닥에서 잰 eV) → 월드 y. */
export function wholeY(c: FermiLevelConstants, e: number): number {
  return PANEL_BOTTOM_Y + (e / c.bandTopEv) * (PANEL_TOP_Y - PANEL_BOTTOM_Y);
}
