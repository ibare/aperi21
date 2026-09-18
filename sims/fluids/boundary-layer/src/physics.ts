// ========================================================================
// boundary-layer — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시각의 함수이고, `step` 은 항등이다.
//
// 평판 층류 경계층을 쓴다.
//
//   δ(x)   = k · √x                        층 두께는 앞전에서의 거리의 제곱근에 비례한다
//   u/U    = 2η − 2η³ + η⁴   (η = y/δ < 1)  층 안의 속도 분포(폴하우젠 4차 근사)
//   u/U    = 1               (η ≥ 1)        층 위는 바깥 빠르기 그대로
//
// 블라시우스 해의 수표 대신 폴하우젠 다항식을 쓴다 — 벽에서 0, 가장자리에서 U 와 기울기 0 을
// 맞추고, 모양이 블라시우스와 몇 퍼센트 안에서 겹친다. 앞전 앞(x < 0)은 흐름이 판을 아직
// 모르므로 어디나 U 다. 세로 속도(층이 두꺼워지며 흐름을 조금 밀어 올리는 것)는 두지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ARROW_LENGTH, FREE_SPEED, LAYER_COEFF, STATION_1, STATION_2, STATION_3 } from './schema';
import type { BoundaryLayerState } from './state';

export interface BoundaryLayerConstants {
  /** 바깥 빠르기 U(월드/초). */
  freeSpeed: number;
  /** 층 두께 계수 k — δ = k√x. */
  layerCoeff: number;
  /** 화살표 묶음을 세우는 자리들(앞전에서의 거리). */
  stations: readonly number[];
  /** U 에 해당하는 화살표 길이(월드). */
  arrowLength: number;
}

export function readConstants(stage: StageDef): BoundaryLayerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    freeSpeed: c.freeSpeed ?? FREE_SPEED,
    layerCoeff: c.layerCoeff ?? LAYER_COEFF,
    stations: [c.station1 ?? STATION_1, c.station2 ?? STATION_2, c.station3 ?? STATION_3],
    arrowLength: c.arrowLength ?? ARROW_LENGTH,
  };
}

/** 앞전에서 x 떨어진 자리의 층 두께. 앞전 앞은 0. */
export function thickness(x: number, c: BoundaryLayerConstants): number {
  return x > 0 ? c.layerCoeff * Math.sqrt(x) : 0;
}

/** 층 안 속도 비 u/U (η = y/δ). */
export function profileRatio(eta: number): number {
  if (eta >= 1) return 1;
  if (eta <= 0) return 0;
  const e2 = eta * eta;
  return 2 * eta - 2 * e2 * eta + e2 * e2;
}

/** (x, y) 의 흐름 빠르기(월드/초). 판 윗면이 y = 0. */
export function speedAt(x: number, y: number, c: BoundaryLayerConstants): number {
  const d = thickness(x, c);
  if (d <= 0) return c.freeSpeed;
  return c.freeSpeed * profileRatio(y / d);
}

// ------------------------------------------------------------------------
// 흐름 점 — 한 줄(같은 높이)을 따라 가는 점의 자리를 시각에서 닫힌 꼴로 얻는다.
// ------------------------------------------------------------------------

/**
 * 높이 y 의 줄을 x0 에서 x1 까지 지나는 데 걸리는 누적 시간표.
 *
 * 속도가 x 에 따라 바뀌므로(층이 두꺼워지며 같은 높이가 점점 층 안쪽이 된다) 자리는 시각의
 * 닫힌 꼴이 없다. 줄마다 T(x) = ∫ dx / u 를 한 번 쌓아 두고 뒤집어 읽는다 — 같은 시각은
 * 언제나 같은 자리다.
 */
export interface RowClock {
  y: number;
  xs: readonly number[];
  /** xs[i] 에 닿는 누적 시간. ts[0] = 0. */
  ts: readonly number[];
  /** 한 바퀴(x0 → x1) 시간. */
  period: number;
}

/** 누적 시간표의 칸 수. */
const ROW_SAMPLES = 240;

export function rowClock(y: number, x0: number, x1: number, c: BoundaryLayerConstants): RowClock {
  const xs: number[] = [];
  const ts: number[] = [];
  const dx = (x1 - x0) / ROW_SAMPLES;
  let t = 0;
  for (let i = 0; i <= ROW_SAMPLES; i++) {
    const x = x0 + i * dx;
    if (i > 0) {
      // 사다리꼴 — 1/u 를 칸 양끝에서 평균.
      const a = 1 / speedAt(x - dx, y, c);
      const b = 1 / speedAt(x, y, c);
      t += ((a + b) / 2) * dx;
    }
    xs.push(x);
    ts.push(t);
  }
  return { y, xs, ts, period: t };
}

/** 줄 위 누적 시간 τ(0 ≤ τ < period)에 있는 점의 x. */
export function rowPosition(clock: RowClock, tau: number): number {
  const { xs, ts } = clock;
  let lo = 0;
  let hi = ts.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ts[mid]! <= tau) lo = mid;
    else hi = mid;
  }
  const t0 = ts[lo]!;
  const t1 = ts[hi]!;
  const f = t1 > t0 ? (tau - t0) / (t1 - t0) : 0;
  return xs[lo]! + f * (xs[hi]! - xs[lo]!);
}

// ------------------------------------------------------------------------
// 연출
// ------------------------------------------------------------------------

export interface Reading {
  /** 화살표 묶음이 자란 정도 0~1. */
  arrows: number;
  /** 층 띠가 앞전에서 판 끝까지 뻗어 나간 정도 0~1. */
  layer: number;
  /** 물러나며 옅어지는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 * 단계 경계를 상수로 두지 않는다 — 진행도는 `at(id)` 가 준다.
 */
export function derive(tl: TimelineFrame): Reading {
  return {
    arrows: tl.at('profile'),
    layer: tl.at('thicken'),
    opacity: 1 - tl.at('fade'),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: BoundaryLayerState }): BoundaryLayerState {
  return params.state;
}
