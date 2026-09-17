// ========================================================================
// atomic-orbital — 순수 계산
// ========================================================================
// 수소 궤도의 |ψ|² 에서 발견 자리를 표집하고, 측정률 곡선을 적분해 쌓는다.
// DOM · 캔버스 · 색을 모른다. 난수는 상태의 시드에서 이어진다 (S-sim).
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { FLASH, FRAME, HEAD_START, MEASURE, type OrbitalKey } from './schema';
import type { AtomicOrbitalState, Found } from './state';

export type Measure = { -readonly [K in keyof typeof MEASURE]: number };

/** 스테이지 상수에서 측정 곡선을 읽는다. 비어 있으면 선언의 기본값. */
export function readMeasure(stage: StageDef | undefined): Measure {
  const c = stage?.constants ?? {};
  return {
    cap: c.cap ?? MEASURE.cap,
    slowRate: c.slowRate ?? MEASURE.slowRate,
    slowFor: c.slowFor ?? MEASURE.slowFor,
    growth: c.growth ?? MEASURE.growth,
    maxRate: c.maxRate ?? MEASURE.maxRate,
    fewBelow: c.fewBelow ?? MEASURE.fewBelow,
    formingBelow: c.formingBelow ?? MEASURE.formingBelow,
  };
}

/** 초당 측정 횟수. */
export function rateAt(tau: number, m: Measure): number {
  if (tau < m.slowFor) return m.slowRate;
  return Math.min(m.maxRate, m.slowRate * Math.exp(m.growth * (tau - m.slowFor)));
}

/** 방금 발견된 자리로 보이는 시간. 빨라져도 동시에 십여 개만 강조되게 줄인다. */
export function flashLife(rate: number): number {
  return Math.min(FLASH.maxLife, FLASH.perRate / rate);
}

// ------------------------------------------------------------------------
// 표집 — 원본과 같은 난수 소비 순서를 지킨다 (같은 시드면 같은 자리)
// ------------------------------------------------------------------------

/** mulberry32 한 걸음. 원본 하네스(piece-kit)와 같은 수열이다. */
function makeRandom(seed: number): { next: () => number; seed: () => number } {
  let s = seed >>> 0;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    seed: () => s,
  };
}

type Random = () => number;

/** 정수 k 감마 표집 = 지수분포 k 개의 합. */
function gamma(R: Random, k: number, scale: number): number {
  let p = 1;
  for (let i = 0; i < k; i++) p *= 1 - R();
  return -Math.log(p) * scale;
}

/** 구면 위 균일 방향. */
function direction(R: Random): [number, number, number] {
  const z = 2 * R() - 1;
  const ph = 2 * Math.PI * R();
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(ph), s * Math.sin(ph), z];
}

/**
 * 수소 궤도의 |ψ|² 를 **정확히** 표집한다 (원자 단위, 보어 반지름 = 1).
 * 동경 부분 r²|R(r)|² 은 감마분포, 각도 부분은 거부 표집.
 */
export function sampleOrbital(key: OrbitalKey, R: Random): [number, number, number] {
  if (key === '1s') {
    // |ψ|² ∝ e^{-2r}
    const r = gamma(R, 3, 0.5);
    const d = direction(R);
    return [r * d[0], r * d[1], r * d[2]];
  }
  if (key === '2p') {
    // 2p_x : |ψ|² ∝ x² e^{-r}. 엽을 x 축에 둔다 — z 축 대칭이면 흔들어도 변화가 안 보인다.
    const r = gamma(R, 5, 1);
    let d: [number, number, number];
    do {
      d = direction(R);
    } while (R() > d[0] * d[0]);
    return [r * d[0], r * d[1], r * d[2]];
  }
  // 3d_z² : |ψ|² ∝ (3z² − r²)² e^{-2r/3}
  const r = gamma(R, 7, 1.5);
  let d: [number, number, number];
  do {
    d = direction(R);
  } while (R() > Math.pow((3 * d[2] * d[2] - 1) / 2, 2));
  return [r * d[0], r * d[1], r * d[2]];
}

// ------------------------------------------------------------------------
// 쌓기
// ------------------------------------------------------------------------

/** 원본이 앞서 시작할 때 쓰던 고정 걸음(초). */
const HEAD_START_STEP = 1 / 60;

interface Accum {
  key: OrbitalKey;
  tau: number;
  acc: number;
  added: Found[];
  count: number;
}

/** 측정 시계를 dt 만큼 밀고, 그동안 찬 측정마다 한 자리씩 뽑는다. */
function advance(a: Accum, dt: number, m: Measure, R: Random): void {
  a.acc += rateAt(a.tau, m) * dt;
  a.tau += dt;
  while (a.acc >= 1) {
    a.acc -= 1;
    if (a.count >= m.cap) continue;
    const [x, y, z] = sampleOrbital(a.key, R);
    a.added.push({ x, y, z, born: a.tau, life: flashLife(rateAt(a.tau, m)) });
    a.count++;
  }
}

/**
 * 한 걸음. 궤도가 바뀌었으면 비우고 `HEAD_START` 만큼 앞서 다시 쌓는다.
 *
 * 발견 배열은 새 자리가 생긴 걸음에서만 새로 만든다 — 상한에 닿으면 같은 배열을
 * 그대로 넘긴다.
 */
export function step(params: {
  state: AtomicOrbitalState;
  dt: number;
  stage?: StageDef;
}): AtomicOrbitalState {
  const { state, dt } = params;
  const m = readMeasure(params.stage);
  const rnd = makeRandom(state.rng);
  const R = rnd.next;

  const restart = state.orbital !== state.shown;
  const base: readonly Found[] = restart ? [] : state.found;
  const a: Accum = {
    key: state.orbital,
    tau: restart ? 0 : state.tau,
    acc: restart ? 0 : state.acc,
    added: [],
    count: base.length,
  };
  if (restart) {
    const steps = Math.round(HEAD_START / HEAD_START_STEP);
    for (let i = 0; i < steps; i++) advance(a, HEAD_START_STEP, m, R);
  }
  advance(a, dt, m, R);

  const found = a.added.length > 0 ? base.concat(a.added) : base;
  const n = found.length;
  return {
    orbital: state.orbital,
    shown: state.orbital,
    found,
    tau: a.tau,
    acc: a.acc,
    rng: rnd.seed(),
    clock: state.clock + dt,
    few: n < m.fewBelow,
    forming: n >= m.fewBelow && n < m.formingBelow,
  };
}

// ------------------------------------------------------------------------
// 투영 — 3차원 자리를 흔들고 내려다본 월드 좌표로
// ------------------------------------------------------------------------

/** 지금 흔들기 각. 옆모습 주변으로 좌우로만 흔든다(한 바퀴 돌리면 두 엽이 겹친다). */
export function swayAt(clock: number): number {
  return FRAME.swayAmp * Math.sin(FRAME.swayRate * clock);
}

/** 궤도마다의 확대율(월드 = 원본 px / 보어 반지름). */
export function scaleFor(reach: number): number {
  return (FRAME.refHeight * FRAME.fill) / reach;
}

/**
 * 투영. z 축이 화면 위쪽, 수직축 둘레로 `yaw` 만큼 돌리고 `pitch` 만큼 내려다본다.
 * 돌려주는 `depth` 는 양수가 안쪽(뒤)이다.
 */
export function project(
  f: Found,
  yaw: number,
  scale: number,
): { x: number; y: number; depth: number } {
  const cyw = Math.cos(yaw);
  const syw = Math.sin(yaw);
  const cp = Math.cos(FRAME.pitch);
  const sp = Math.sin(FRAME.pitch);
  const x1 = f.x * cyw - f.y * syw;
  const y1 = f.x * syw + f.y * cyw;
  const sy = f.z * cp - y1 * sp;
  const depth = y1 * cp + f.z * sp;
  return { x: x1 * scale, y: sy * scale, depth };
}

/** 깊이 단계 0(뒤) ~ bands−1(앞). */
export function depthBand(depth: number, reach: number): number {
  const f = Math.max(0, Math.min(0.999, 0.5 - depth / (2 * reach)));
  return Math.floor(f * FRAME.bands);
}
