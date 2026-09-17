// ========================================================================
// hr-diagram — 순수 계산
// ========================================================================
// 주계열 관계 · 별 진화 경로 · 전향점 질량 · 흑체색 온도. DOM · 캔버스 · 색을 모른다.
// 식과 상수는 원본(tasks/piece-lab/hr-diagram/index.html)을 그대로 옮겼다.
// ========================================================================

import type { TimelineDef, Vec2 } from '@aperi21/schema';
import { CANVAS_H, CANVAS_W, CLUSTER, L_AXIS, PLOT, T_AXIS, hrDiagramSchema } from './schema';
import type { HrDiagramState } from './state';

// ------------------------------------------------------------------------
// 좌표 — 원본 화면 px(y 아래) → 월드(y 위)
// ------------------------------------------------------------------------

/** log10 온도 → 원본 화면 x. */
export function sx(lt: number): number {
  return PLOT.left + ((T_AXIS.left - lt) / (T_AXIS.left - T_AXIS.right)) * (CANVAS_W - PLOT.left - PLOT.right);
}

/** log10 광도 → 원본 화면 y. */
export function sy(ll: number): number {
  return PLOT.top + ((L_AXIS.top - ll) / (L_AXIS.top - L_AXIS.bottom)) * (CANVAS_H - PLOT.top - PLOT.bottom);
}

/** 원본 화면 좌표 → 월드. */
export function at(x: number, y: number): Vec2 {
  return [x, -y];
}

// ------------------------------------------------------------------------
// 주계열 관계 (구간 멱법칙 근사)
// ------------------------------------------------------------------------

export function msLogL(M: number): number {
  if (M < 0.43) return Math.log10(0.23 * Math.pow(M, 2.3));
  if (M < 2) return 4 * Math.log10(M);
  return Math.log10(1.4 * Math.pow(M, 3.5));
}

export function msLogR(M: number): number {
  return M < 1 ? 0.8 * Math.log10(M) : 0.57 * Math.log10(M);
}

export function msLogT(M: number): number {
  return Math.log10(5772) + 0.25 * (msLogL(M) - 2 * msLogR(M));
}

/** 주계열 수명(년): 연료(질량) / 소비율(광도). */
export function lifetime(M: number): number {
  return (1e10 * M) / Math.pow(10, msLogL(M));
}

// ------------------------------------------------------------------------
// 별 무리 — 시드 난수 (원본 하니스와 같은 mulberry32)
// ------------------------------------------------------------------------

export interface Star {
  M: number;
  L0: number;
  T0: number;
  tau: number;
  dL: number;
  dT: number;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 질량을 멱법칙에서 뽑아 별 무리를 만든다. 뽑는 순서(질량 · 밝기 흩뜨림 · 온도 흩뜨림)가 원본과 같다. */
export function makeStars(count: number, seed: number): Star[] {
  const random = mulberry32(seed);
  const a = 1 - CLUSTER.alpha;
  const lo = Math.pow(CLUSTER.mMin, a);
  const hi = Math.pow(CLUSTER.mMax, a);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const u = random();
    const M = Math.pow(lo + u * (hi - lo), 1 / a);
    stars.push({
      M,
      L0: msLogL(M),
      T0: msLogT(M),
      tau: lifetime(M),
      dL: (random() - 0.5) * 0.14,
      dT: (random() - 0.5) * 0.025,
    });
  }
  return stars;
}

// ------------------------------------------------------------------------
// 진화 경로
// ------------------------------------------------------------------------

export type StarKind = 'ms' | 'giant' | 'wd';

export interface StarState {
  lt: number;
  ll: number;
  alpha: number;
  kind: StarKind;
}

const lerp = (a: number, b: number, s: number): number => a + (b - a) * s;
const clamp01 = (s: number): number => Math.max(0, Math.min(1, s));

/** 나이 A(년)에서 별 하나의 자리. 사라졌으면 null. */
export function stateOf(s: Star, A: number): StarState | null {
  const f = A / s.tau;
  const endL = s.L0 + 0.3;
  const endT = s.T0 - 0.03;
  if (f <= 1) {
    return { lt: s.T0 - 0.03 * f + s.dT, ll: s.L0 + 0.3 * f + s.dL, alpha: 1, kind: 'ms' };
  }
  const phi = f - 1;
  if (s.M >= 8) {
    // 초거성: 밝기는 거의 그대로, 오른쪽으로 식으며 건너간다. 끝나면 사라진다.
    if (phi > 0.12) return null;
    const k = clamp01(phi / 0.1);
    const alpha = 1 - clamp01((phi - 0.1) / 0.02);
    return { lt: lerp(endT, 3.56, k) + s.dT, ll: endL + 0.1 * k + s.dL, alpha, kind: 'giant' };
  }
  const tipL = Math.max(endL + 0.1, 3.2);
  const sgT = Math.min(endT, 3.7);
  if (phi <= 0.06) {
    // 준거성: 오른쪽으로
    const k = phi / 0.06;
    return { lt: lerp(endT, sgT, k) + s.dT, ll: endL + 0.1 * k + s.dL, alpha: 1, kind: 'giant' };
  }
  if (phi <= 0.16) {
    // 적색거성: 위로 부푼다, 끝에서 껍질을 벗고 흐려진다
    const k = clamp01((phi - 0.06) / 0.08);
    const alpha = 1 - clamp01((phi - 0.14) / 0.02);
    return { lt: lerp(sgT, 3.58, k) + s.dT, ll: lerp(endL + 0.1, tipL, k * k) + s.dL, alpha, kind: 'giant' };
  }
  // 백색왜성: 반지름은 고정, 식어 가며 왼쪽 아래에서 오른쪽 아래로 내려간다
  const tc = A - 1.16 * s.tau;
  const T = 50000 * Math.pow(1 + tc / 1e6, -0.3);
  const lt = Math.log10(T);
  const ll = 2 * Math.log10(0.013) + 4 * (lt - Math.log10(5772));
  const alpha = clamp01(tc / (0.02 * s.tau + 1e5));
  return { lt: lt + s.dT * 0.5, ll: ll + s.dL * 0.5, alpha, kind: 'wd' };
}

/** 주계열 수명 = 나이 가 되는 질량(전향점). */
export function turnoffMass(A: number): number {
  let lo = Math.log10(0.1);
  let hi = Math.log10(CLUSTER.mMax);
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (lifetime(Math.pow(10, mid)) > A) lo = mid;
    else hi = mid;
  }
  return Math.pow(10, (lo + hi) / 2);
}

/** 별 반지름(원본 px). 백색왜성은 가장 작게, 나머지는 광도에 따라 1.1~3.6. */
export function starRadius(st: StarState): number {
  return st.kind === 'wd' ? 1.1 : Math.max(1.1, Math.min(3.6, 1.6 + 0.35 * st.ll));
}

// ------------------------------------------------------------------------
// 시각 → 성단 나이
// ------------------------------------------------------------------------

/** `run` 단계 진행도(0~1) → 성단 나이(년). 로그로 흐른다. */
export function ageAtProgress(p: number): number {
  return Math.pow(10, CLUSTER.logAge0 + (CLUSTER.logAge1 - CLUSTER.logAge0) * p);
}

/**
 * 주기 안 시각 u 에서의 `run` 진행도. 시간표 선언의 단계 길이를 읽는다.
 *
 * scene 은 지금 진행도를 `timeline.at('run')` 으로 받지만, **0.3 초 전의 진행도**는
 * 물을 자리가 없어 여기서 같은 셈을 한다 (NOTES 「어휘 부족」). `run` 은 선형이다.
 */
export function runProgressAt(timeline: TimelineDef, u: number): number {
  let start = 0;
  for (const ph of timeline.phases) {
    if (ph.id === 'run') return clamp01((u - start) / ph.duration);
    start += ph.duration;
  }
  throw new Error('hr-diagram: 시간표에 run 단계가 없다');
}

// ------------------------------------------------------------------------
// 캡션 값 — 유효숫자 2자리 고정 (원본 fmtAge · fmtMass)
// ------------------------------------------------------------------------

const sig2 = (v: number): string => String(Number(v.toPrecision(2)));

export function captionValues(t: number): Pick<HrDiagramState, 'ageInEok' | 'ageMan' | 'ageEok' | 'ageMyr' | 'massText'> {
  const timeline = hrDiagramSchema.timeline!;
  const period = timeline.phases.reduce((s, ph) => s + ph.duration, 0);
  const u = ((t % period) + period) % period;
  const A = ageAtProgress(runProgressAt(timeline, u));
  const v = Number(A.toPrecision(2));
  return {
    ageInEok: v >= 1e8,
    ageMan: sig2(v / 1e4),
    ageEok: sig2(v / 1e8),
    ageMyr: sig2(v / 1e6),
    massText: sig2(turnoffMass(A)),
  };
}

/**
 * 한 걸음. 별은 시각의 함수라 쌓을 것이 없고, 캡션 값만 시계에 맞춰 새로 적는다.
 * 캡션 슬롯의 `vars` 가 state 만 읽고 `step` 은 시간표를 받지 못하므로(G01) 시계를 따로 센다.
 */
export function step(params: { state: HrDiagramState; dt: number }): HrDiagramState {
  const { state, dt } = params;
  const t = state.t + dt;
  const next = captionValues(t);
  if (
    next.ageInEok === state.ageInEok &&
    next.ageMan === state.ageMan &&
    next.ageEok === state.ageEok &&
    next.ageMyr === state.ageMyr &&
    next.massText === state.massText
  ) {
    return { ...state, t };
  }
  return { ...state, t, ...next };
}
