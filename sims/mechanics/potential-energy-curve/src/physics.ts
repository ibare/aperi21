// ========================================================================
// potential-energy-curve — 순수 물리
// ========================================================================
// 1 차원 운동 u'' = −dU/du. 일반 적분기는 전환점에서 에너지가 새어 나가므로
// 속력을 하위 단계마다 √(2(E−U)) 로 다시 맞춘다 — 운동 에너지 막대와 움직임이
// 어긋나지 않는 것이 이 조각의 요점이다 (원본 NOTES).
//
// 에너지는 올릴 때는 바로(밀어 줌), 내릴 때는 움직이는 동안 마찰로만 뺀다.
// 선을 억지로 끌어내리면 물체가 벽에 붙어 기어 내려가는 비물리 운동이 생긴다.
// ========================================================================

import type { EnvironmentDef, StageDef, TimelineEase } from '@aperi21/schema';
import {
  E_HIGH,
  E_LOW,
  FRAME_DT,
  FRICTION_AUTO,
  FRICTION_MANUAL,
  SUBSTEPS,
  TILT,
  TIME_SCALE,
  TRAIL_EVERY,
  TRAIL_MAX,
  U_MAX,
  U_MIN,
  potentialEnergyCurveSchema,
} from './schema';
import type { PotentialEnergyCurveState } from './state';

export interface PotentialEnergyCurveConstants {
  eLow: number;
  eHigh: number;
  frictionAuto: number;
  frictionManual: number;
}

export function readConstants(stage: StageDef): PotentialEnergyCurveConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    eLow: c.eLow ?? E_LOW,
    eHigh: c.eHigh ?? E_HIGH,
    frictionAuto: c.frictionAuto ?? FRICTION_AUTO,
    frictionManual: c.frictionManual ?? FRICTION_MANUAL,
  };
}

/** 퍼텐셜 U(u). */
export function potential(u: number): number {
  return u * u * u * u - u * u + TILT * u;
}

/** 힘 −dU/du. */
function force(u: number): number {
  return -(4 * u * u * u - 2 * u + TILT);
}

/** 가운데 언덕 꼭대기. 원본처럼 수치로 찾는다 — 캡션 판정에만 쓴다. */
export const BARRIER_U: number = (() => {
  let at = 0;
  let best = -Infinity;
  for (let i = 0; i <= 2000; i++) {
    const u = -0.4 + (0.8 * i) / 2000;
    if (potential(u) > best) {
      best = potential(u);
      at = u;
    }
  }
  return at;
})();

/** 곡선이 선을 넘는 자리(이분법). `uIn` 은 선 아래, `uOut` 은 위. */
function crossing(uIn: number, uOut: number, E: number): number {
  let a = uIn;
  let b = uOut;
  for (let i = 0; i < 40; i++) {
    const m = 0.5 * (a + b);
    if (potential(m) <= E) a = m;
    else b = m;
  }
  return 0.5 * (a + b);
}

/** 물체 자리에서 좌우로 곡선이 선보다 높아지는 첫 자리까지 — 닿을 수 있는 구간. */
export function reachable(u: number, E: number): [number, number] {
  const N = 800;
  const du = (U_MAX - U_MIN) / N;
  let left = U_MIN;
  let right = U_MAX;
  for (let x = u; x > U_MIN; x -= du) {
    if (potential(x - du) > E) {
      left = crossing(x, x - du, E);
      break;
    }
  }
  for (let x = u; x < U_MAX; x += du) {
    if (potential(x + du) > E) {
      right = crossing(x, x + du, E);
      break;
    }
  }
  return [left, right];
}

/** 전환점과 캡션 국면. */
export function deriveReadings(
  u: number,
  E: number,
): Pick<PotentialEnergyCurveState, 'uL' | 'uR' | 'spansBoth' | 'trappedLeft'> {
  const [uL, uR] = reachable(u, E);
  const spansBoth = uL < BARRIER_U && uR > BARRIER_U;
  return { uL, uR, spansBoth, trappedLeft: !spansBoth && u < BARRIER_U };
}

// ------------------------------------------------------------------------
// 에너지 일정 — 선언의 단계 목록을 읽는다
// ------------------------------------------------------------------------

/** 단계마다 선의 목표가 어디서 어디로 가는가 — 스테이지 상수 이름으로 가리킨다. */
const PHASE_TARGETS: Record<string, readonly ['eLow' | 'eHigh', 'eLow' | 'eHigh']> = {
  low: ['eLow', 'eLow'],
  rise: ['eLow', 'eHigh'],
  high: ['eHigh', 'eHigh'],
  // 목표는 낮은 선이지만 실제로는 마찰로만 내려간다 (`applyEnergy`).
  fall: ['eLow', 'eLow'],
};

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/**
 * 시계 → 선의 목표 높이. 단계 경계를 상수로 두지 않고 `schema.timeline` 을 읽는다.
 * 엔진의 시간표 계산과 같은 일을 여기서 하는 것은 `step` 이 `TimelineFrame` 을
 * 받지 못해서다 (NOTES 「어휘 부족」 G01).
 */
export function scheduledEnergy(clock: number, c: PotentialEnergyCurveConstants): number {
  const phases = potentialEnergyCurveSchema.timeline?.phases ?? [];
  const period = phases.reduce((s, p) => s + p.duration, 0);
  if (!(period > 0)) return c.eLow;
  let t = ((clock % period) + period) % period;
  for (const p of phases) {
    if (t < p.duration) {
      const k = EASES[p.ease ?? 'linear'](Math.min(1, Math.max(0, t / p.duration)));
      const [from, to] = PHASE_TARGETS[p.id] ?? ['eLow', 'eLow'];
      return c[from] + (c[to] - c[from]) * k;
    }
    t -= p.duration;
  }
  return c.eLow;
}

// ------------------------------------------------------------------------
// 적분
// ------------------------------------------------------------------------

interface Motion {
  u: number;
  v: number;
  E: number;
}

/** 올리기는 바로, 내리기는 움직이는 동안 마찰로(dE/dt = −γ·2K). */
function applyEnergy(m: Motion, target: number, dt: number, friction: number): void {
  if (target >= m.E) {
    m.E = target;
  } else {
    const K = Math.max(0, m.E - potential(m.u));
    m.E = Math.max(target, m.E - friction * 2 * K * dt * TIME_SCALE);
  }
}

/** 속도 베를레 한 하위 단계 + 에너지에 맞춘 속력 재설정. */
function substep(m: Motion, h: number): void {
  const a0 = force(m.u);
  const vHalf = m.v + 0.5 * h * a0;
  const uNew = m.u + h * vHalf;
  const K = m.E - potential(uNew);
  if (K < 0) {
    // 선을 넘어선 자리: 들어가지 못하고 그 자리에서 되돌아온다.
    m.v = 0;
    return;
  }
  const aNew = force(uNew);
  const vNew = vHalf + 0.5 * h * aNew;
  let sgn = Math.sign(vNew);
  if (sgn === 0) sgn = Math.sign(aNew) || 1;
  m.u = uNew;
  m.v = sgn * Math.sqrt(2 * K);
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 원본은 고정 걸음(1/60 초)마다 16 하위 단계를 돌고 5 걸음마다 자국을 찍었다. 자국의
 * 간격이 곧 속력이라 걸음 길이가 흔들리면 그림이 거짓말을 한다 — 누적기로 같은
 * 걸음을 지킨다.
 */
export function step(params: {
  state: PotentialEnergyCurveState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): PotentialEnergyCurveState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(params.stage);

  // 한 번이라도 잡으면 그 뒤로는 끈 높이가 목표다 (원본 `state.manual`).
  const manual = state.manual || state.held;
  const m: Motion = { u: state.u, v: state.v, E: state.E };
  let clock = state.clock;
  let frame = state.frame;
  let acc = state.acc + dt;
  let trail = state.trail;
  const h = (FRAME_DT * TIME_SCALE) / SUBSTEPS;

  while (acc >= FRAME_DT - 1e-9) {
    acc -= FRAME_DT;
    const target = manual ? state.target : scheduledEnergy(clock, c);
    applyEnergy(m, target, FRAME_DT, manual ? c.frictionManual : c.frictionAuto);
    for (let i = 0; i < SUBSTEPS; i++) substep(m, h);
    frame++;
    if (frame % TRAIL_EVERY === 0) {
      trail = trail.length >= TRAIL_MAX ? [...trail.slice(1), m.u] : [...trail, m.u];
    }
    clock += FRAME_DT;
  }

  return {
    ...state,
    u: m.u,
    v: m.v,
    E: m.E,
    clock,
    acc: Math.max(0, acc),
    frame,
    trail,
    manual,
    // 손대기 전에는 손잡이가 선을 따라온다.
    target: manual ? state.target : m.E,
    ...deriveReadings(m.u, m.E),
  };
}
