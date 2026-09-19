// ========================================================================
// potential-vs-field — 순수 물리
// ========================================================================
// 축에 수직인 넓은 판 모양 전하 띠들이 만드는 1차원 장이다(ε₀ = 1 단위).
//
//   E(x) = (x 왼쪽에 있는 전하) − (전체 전하) / 2
//   V(x) = −∫ E dx        (왼쪽 끝 AXIS_FROM 에서 V = 0)
//
// 띠 안에서 E 는 직선으로, V 는 포물선으로 바뀐다. 전하 합이 0 이면 띠 바깥의 장은
// 0 이고 전위 곡선이 평평하다. 기울기 dV/dx = −E 가 이 조각의 주장 그 자체다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  ARROW_SPACING,
  AXIS_FROM,
  AXIS_TO,
  GLYPHS_PER_CHARGE,
  MIN_ARROW_LEN,
  SLAB1_FROM,
  SLAB1_RHO,
  SLAB1_TO,
  SLAB2_FROM,
  SLAB2_RHO,
  SLAB2_TO,
  SLAB3_FROM,
  SLAB3_RHO,
  SLAB3_TO,
  TANGENT_LEN,
  ZERO_ARROW_LEN,
} from './schema';
import type { PotentialVsFieldState } from './state';

/** 전하 띠 하나 — [from, to] 구간에 밀도 rho 로 고르게 퍼진 전하. */
export interface Slab {
  from: number;
  to: number;
  rho: number;
}

export interface PotentialVsFieldConstants {
  slabs: readonly Slab[];
  arrowScale: number;
  arrowSpacing: number;
  zeroArrowLen: number;
  minArrowLen: number;
  glyphsPerCharge: number;
  tangentLen: number;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다. 띠가 셋이라는 것(목록 길이)은 스테이지 상수가
 * 수 하나씩뿐이라 여기 이름 셋으로 흩었다 — 장부 G105.
 */
export function readConstants(stage: StageDef): PotentialVsFieldConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    slabs: [
      { from: c.slab1From ?? SLAB1_FROM, to: c.slab1To ?? SLAB1_TO, rho: c.slab1Rho ?? SLAB1_RHO },
      { from: c.slab2From ?? SLAB2_FROM, to: c.slab2To ?? SLAB2_TO, rho: c.slab2Rho ?? SLAB2_RHO },
      { from: c.slab3From ?? SLAB3_FROM, to: c.slab3To ?? SLAB3_TO, rho: c.slab3Rho ?? SLAB3_RHO },
    ],
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    arrowSpacing: c.arrowSpacing ?? ARROW_SPACING,
    zeroArrowLen: c.zeroArrowLen ?? ZERO_ARROW_LEN,
    minArrowLen: c.minArrowLen ?? MIN_ARROW_LEN,
    glyphsPerCharge: c.glyphsPerCharge ?? GLYPHS_PER_CHARGE,
    tangentLen: c.tangentLen ?? TANGENT_LEN,
  };
}

function slabCharge(s: Slab): number {
  return s.rho * (s.to - s.from);
}

function totalCharge(slabs: readonly Slab[]): number {
  return slabs.reduce((q, s) => q + slabCharge(s), 0);
}

/** x 왼쪽에 있는 띠 전하. */
function chargeLeftOf(x: number, s: Slab): number {
  return s.rho * Math.min(Math.max(x - s.from, 0), s.to - s.from);
}

/** `chargeLeftOf` 를 −∞ 부터 x 까지 적분한 것. 띠 안은 포물선, 지나면 직선. */
function chargeLeftIntegral(x: number, s: Slab): number {
  const w = s.to - s.from;
  if (x <= s.from) return 0;
  if (x <= s.to) return (s.rho * (x - s.from) ** 2) / 2;
  return s.rho * ((w * w) / 2 + w * (x - s.to));
}

/** 전기장 E(x). 양수면 +x 쪽(오른쪽)을 향한다. */
export function fieldAt(x: number, slabs: readonly Slab[]): number {
  const half = totalCharge(slabs) / 2;
  return slabs.reduce((e, s) => e + chargeLeftOf(x, s), 0) - half;
}

/** 전위 V(x). 왼쪽 끝 `AXIS_FROM` 에서 0 이다 — 전위는 차이만 뜻이 있다. */
export function potentialAt(x: number, slabs: readonly Slab[]): number {
  const half = totalCharge(slabs) / 2;
  const integral = (at: number): number =>
    slabs.reduce((acc, s) => acc + chargeLeftIntegral(at, s), 0) - half * at;
  return -(integral(x) - integral(AXIS_FROM));
}

/** 곡선 표본 수. 표본 간격이 띠 폭보다 훨씬 좁아야 포물선이 꺾은선으로 보이지 않는다. */
const CURVE_SAMPLES = 240;
/** 장이 0 인 자리를 찾는 이분법 반복 수. */
const BISECT_STEPS = 48;

/** 곡선을 그릴 표본과 그 전위의 범위 — 곡선 판에 맞춰 넣는 데 쓴다. */
export function potentialCurve(slabs: readonly Slab[]): {
  xs: number[];
  vs: number[];
  vMin: number;
  vMax: number;
} {
  const xs: number[] = [];
  const vs: number[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = AXIS_FROM + ((AXIS_TO - AXIS_FROM) * i) / CURVE_SAMPLES;
    xs.push(x);
    vs.push(potentialAt(x, slabs));
  }
  return { xs, vs, vMin: Math.min(...vs), vMax: Math.max(...vs) };
}

/**
 * 탐침이 멈춰 서는 자리들 — 첫 띠가 시작하는 곳, 장이 0 이 되는 골짜기 바닥, 마지막
 * 띠가 끝나는 곳. 시간표 단계의 경계가 이 자리들이다.
 *
 * 바닥은 띠 구간 안에서 장의 부호가 처음 바뀌는 곳이다. 부호가 바뀌지 않는 배치
 * (저작자가 바꾼 경우)면 띠 구간 한가운데로 둔다 — 캡션 「바닥」 이 틀리게 되므로
 * 그런 배치는 이 조각의 주장 밖이다.
 */
export function waypoints(slabs: readonly Slab[]): {
  left: number;
  start: number;
  bottom: number;
  end: number;
  right: number;
} {
  const start = Math.min(...slabs.map((s) => s.from));
  const end = Math.max(...slabs.map((s) => s.to));
  let bottom = (start + end) / 2;
  const scan = CURVE_SAMPLES;
  for (let i = 0; i < scan; i++) {
    const a = start + ((end - start) * i) / scan;
    const b = start + ((end - start) * (i + 1)) / scan;
    const fa = fieldAt(a, slabs);
    const fb = fieldAt(b, slabs);
    if (fa !== 0 && fa * fb < 0) {
      let lo = a;
      let hi = b;
      for (let k = 0; k < BISECT_STEPS; k++) {
        const mid = (lo + hi) / 2;
        if (fieldAt(lo, slabs) * fieldAt(mid, slabs) <= 0) hi = mid;
        else lo = mid;
      }
      bottom = (lo + hi) / 2;
      break;
    }
  }
  return { left: AXIS_FROM, start, bottom, end, right: AXIS_TO };
}

/**
 * 탐침의 x. **단계 경계는 선언이 정한다** — 단계마다 한 구간을 진행도 `at()` 만큼
 * 간다. 분기가 없다: 지난 단계는 1, 오지 않은 단계는 0 이라 더하기만 하면 된다.
 * `hold` · `fade` 동안은 오른쪽 끝에 머문다(모든 단계가 1).
 */
export function probeX(tl: TimelineFrame, w: ReturnType<typeof waypoints>): number {
  return (
    w.left +
    (w.start - w.left) * tl.at('enter') +
    (w.bottom - w.start) * tl.at('descend') +
    (w.end - w.bottom) * tl.at('ascend') +
    (w.right - w.end) * tl.at('exit')
  );
}

/** 탐침이 아직 훑는 중인가. 다 훑으면 탐침을 거두고 읽은 줄만 남긴다. */
export function probing(tl: TimelineFrame): boolean {
  return tl.at('exit') < 1;
}

/** 이번 주기에서 그림이 흐려진 정도의 반대 0~1. 마지막 단계에서 읽은 줄을 지운다. */
export function readOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 탐침 자리와 읽은 줄이 모두 시각의 함수다. */
export function step(params: { state: PotentialVsFieldState }): PotentialVsFieldState {
  return params.state;
}
