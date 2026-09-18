// ========================================================================
// gravitational-slingshot — 순수 물리
// ========================================================================
// 행성 틀에서 탐사선은 쌍곡선 케플러 궤도를 난다. 먼 곳 접근 속도 u∞ 와 꺾임 각 δ 에서
//   a = GM / u∞²,  e = 1 / sin(δ/2),  가장 가까운 거리 = a(e − 1)
// 이고, 가장 가까운 순간에서 τ 만큼 지난 자리는 쌍곡선 케플러 방정식
//   e·sinh H − H = n·τ,  n = √(GM / a³)
// 의 H 로 곧바로 풀린다 — 적분을 쌓지 않으니 같은 시각은 언제나 같은 자리다.
//
// 태양 틀은 행성의 등속 운동을 더한 것뿐이다(갈릴레이 변환). 자리도 속도도
//   태양 틀 = 행성 틀 + 행성의 것(V)
// 이다. 행성 틀에서 들어올 때와 나갈 때 빠르기가 같은 것은 궤도가 가장 가까운 점을 두고
// 대칭이기 때문이고, 태양 틀에서 둘이 달라지는 것은 같은 V 를 **다른 방향의** u 에 더하기 때문이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APPROACH_SPEED,
  ARROW_SCALE,
  DEFLECTION_DEG,
  FLIGHT_HALF,
  GM,
  PLANET_SPEED,
  STROBE_STEP,
} from './schema';
import type { GravitationalSlingshotState } from './state';

export interface SlingshotConstants {
  gm: number;
  /** 행성 틀에서 본 먼 곳 접근 속도 u∞. */
  approachSpeed: number;
  /** 태양 틀에서 행성의 공전 속도 V(+x 쪽). */
  planetSpeed: number;
  /** 행성 틀에서 꺾이는 각(도). */
  deflectionDeg: number;
  /** 비행의 반(월드 시간). */
  flightHalf: number;
  /** 속도 → 화살표 길이 배율. */
  arrowScale: number;
  /** 같은 시간 간격 점의 간격(월드 시간). */
  strobeStep: number;
}

export function readConstants(stage: StageDef): SlingshotConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM,
    approachSpeed: c.approachSpeed ?? APPROACH_SPEED,
    planetSpeed: c.planetSpeed ?? PLANET_SPEED,
    deflectionDeg: c.deflectionDeg ?? DEFLECTION_DEG,
    flightHalf: c.flightHalf ?? FLIGHT_HALF,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    strobeStep: c.strobeStep ?? STROBE_STEP,
  };
}

/** 쌍곡선의 모양 — 긴반지름 a, 이심률 e, 평균 운동 n. */
interface Hyperbola {
  a: number;
  e: number;
  n: number;
}

function hyperbolaOf(c: SlingshotConstants): Hyperbola {
  const a = c.gm / (c.approachSpeed * c.approachSpeed);
  const e = 1 / Math.sin(((c.deflectionDeg * Math.PI) / 180) / 2);
  return { a, e, n: Math.sqrt(c.gm / (a * a * a)) };
}

/** 뉴턴 반복 횟수. 비행 구간(|nτ| ≲ 수 배)에서 이 횟수면 배정밀도 끝까지 닿는다. */
const KEPLER_ITERATIONS = 30;

/** 쌍곡선 케플러 방정식 e·sinh H − H = M 의 H. */
function anomaly(h: Hyperbola, tau: number): number {
  const m = h.n * tau;
  let H = Math.asinh(m / h.e);
  for (let i = 0; i < KEPLER_ITERATIONS; i++) {
    H -= (h.e * Math.sinh(H) - H - m) / (h.e * Math.cosh(H) - 1);
  }
  return H;
}

/**
 * 행성 틀의 탐사선 — 행성에서 본 자리와 속도. τ 는 가장 가까운 순간에서 지난 시간이다.
 *
 * 방향 배치: 가장 가까운 점은 행성의 **뒤쪽**(−x, 행성이 태양 틀에서 +x 로 달리므로)이고, 그 순간
 * 탐사선은 아래(−y)로 지난다. 그러면 들어오는 다리는 위에서, 나가는 다리는 아래로 뻗고, 두 다리가
 * 행성 진행 방향에 수직인 축(−y)을 두고 대칭이 된다 — 꺾인 뒤의 속도가 V 쪽으로 돈다.
 */
export function planetFrame(c: SlingshotConstants, tau: number): { pos: Vec2; vel: Vec2 } {
  const h = hyperbolaOf(c);
  const H = anomaly(h, tau);
  const b = h.a * Math.sqrt(h.e * h.e - 1);
  // 근점 좌표(x 가 근점 쪽)를 180° 돌려 놓는다 — 근점이 −x, 근점에서의 속도가 −y.
  const pos: Vec2 = [-h.a * (h.e - Math.cosh(H)), -b * Math.sinh(H)];
  const dH = h.n / (h.e * Math.cosh(H) - 1);
  const vel: Vec2 = [h.a * Math.sinh(H) * dH, -b * Math.cosh(H) * dH];
  return { pos, vel };
}

/** 태양 틀에서 행성이 가장 가까운 순간의 자리로부터 옮겨 간 거리(+x). */
export function planetShift(c: SlingshotConstants, tau: number): number {
  return c.planetSpeed * tau;
}

/**
 * 지금 비행 시각 τ(−flightHalf ~ +flightHalf). **단계 경계는 선언이 정한다** — 비행은 `approach`
 * 의 시작에서 `depart` 의 끝까지이고, 그 사이를 고르게 흐른다(각 단계의 `timeScale` 이 화면에서의
 * 빠르기를 따로 정한다). 그 뒤로는 끝 자리에 머문다.
 */
export function flightTime(tl: TimelineFrame, c: SlingshotConstants): number {
  const from = tl.start('approach');
  const to = tl.end('depart');
  const k = Math.min(1, Math.max(0, (tl.u - from) / (to - from)));
  return -c.flightHalf + 2 * c.flightHalf * k;
}

/** 같은 시간 간격 점을 찍은 시각들 — 비행 처음부터 지금(τ)까지. 두 판이 같은 시각을 쓴다. */
export function strobeTimes(c: SlingshotConstants, tau: number): number[] {
  const out: number[] = [];
  const count = Math.floor((2 * c.flightHalf) / c.strobeStep + 1e-9);
  for (let i = 0; i <= count; i++) {
    const t = -c.flightHalf + i * c.strobeStep;
    if (t > tau + 1e-9) break;
    out.push(t);
  }
  return out;
}

/** 한 주기에서 그림이 흐려진 정도를 뺀 불투명도 0~1. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravitationalSlingshotState }): GravitationalSlingshotState {
  return params.state;
}
