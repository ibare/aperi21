// ========================================================================
// banked-curve — 순수 물리
// ========================================================================
// 마찰 없는 원뿔면 위 질점. 높이 z = (r − R0)·tanθ, 각운동량 L = r²φ̇ 보존,
//   r̈ (1 + k²) = L²/r³ − g k      (k = tanθ)
// 원본의 RK4 · 시도 순환 상태기계를 그대로 옮겼다. 결과를 연출하지 않는다.
// ========================================================================

import {
  ATTEMPTS,
  FIXED_DT,
  FLAT_EPS,
  G,
  PREDICT_FRAMES,
  R_IN,
  R_OUT,
  SUB,
  T_FLY,
  T_HOLD,
  T_HOLD_LAP,
  T_TILT,
  TIME_SCALE,
} from './schema';
import {
  freshCar,
  syncXY,
  type BankedCurveState,
  type CaptionFlags,
  type Car,
  type Outcome,
} from './state';

/** 고정 걸음 적립의 여유 — 러너가 1/60 을 정확히 주어도 부동소수 오차로 한 걸음을 놓치지 않게. */
const ACC_EPS = 1e-6;
/** 한 번의 `step` 이 쪼개 걷는 걸음 수 상한. 폭주 방지일 뿐이다. */
const MAX_FIXED_STEPS = 12;

function accel(r: number, k: number, L: number): number {
  return (L * L / (r * r * r) - G * k) / (1 + k * k);
}

function rk4(c: Car, k: number, h: number): Car {
  const L = c.L;
  const f = (r: number, rd: number): [number, number, number] => [rd, accel(r, k, L), L / (r * r)];
  const a = f(c.r, c.rd);
  const b = f(c.r + (a[0] * h) / 2, c.rd + (a[1] * h) / 2);
  const d1 = f(c.r + (b[0] * h) / 2, c.rd + (b[1] * h) / 2);
  const d = f(c.r + d1[0] * h, c.rd + d1[1] * h);
  return {
    ...c,
    r: c.r + (h / 6) * (a[0] + 2 * b[0] + 2 * d1[0] + d[0]),
    rd: c.rd + (h / 6) * (a[1] + 2 * b[1] + 2 * d1[1] + d[1]),
    phi: c.phi + (h / 6) * (a[2] + 2 * b[2] + 2 * d1[2] + d[2]),
  };
}

/** 기울기 `deg` 에서 화면 시간 `dtReal` 만큼 적분한다. 원본 `physStep`. */
export function physStep(car: Car, deg: number, dtReal: number): Car {
  const k = Math.tan((deg * Math.PI) / 180);
  const h = (dtReal * TIME_SCALE) / SUB;
  let c = car;
  for (let i = 0; i < SUB; i++) c = rk4(c, k, h);
  return syncXY(c);
}

/**
 * 결과를 미리 계산한다 — 캡션이 결과를 말하려면 같은 시뮬레이션을 앞질러 한 번 돌려야 한다.
 * 실제 달리기와 **같은 고정 걸음**이라 여기서 안 결과가 화면에서 그대로 일어난다.
 */
export function predict(deg: number): Outcome {
  let c = freshCar();
  for (let i = 0; i < PREDICT_FRAMES; i++) {
    c = physStep(c, deg, FIXED_DT);
    if (c.r > R_OUT) return 'out';
    if (c.r < R_IN) return 'in';
    if (c.phi >= 2 * Math.PI) return 'round';
  }
  return 'round';
}

/**
 * 캡션 슬롯이 읽는 자리. 원본 `captionText` 의 분기 순서 그대로.
 *
 * 하나만 다르다 — 「길을 …로 기울인다」 는 **실제로 기울기가 바뀌는** 기울임에서만 말한다.
 * 손으로 정한 각을 되풀이할 때는 같은 각에서 같은 각으로 0.8 초를 쉬는데, 원본은 그때도
 * 기울인다고 말해 화면(움직이지 않는 길)과 어긋났다. 그 동안은 결과 문장을 이어 말한다.
 */
export function captionFlags(s: BankedCurveState): CaptionFlags {
  const tilt = s.phase === 'tilt' && Math.abs(s.toDeg - s.fromDeg) >= FLAT_EPS;
  const round = !tilt && s.outcome === 'round';
  const flat = !tilt && !round && s.deg < FLAT_EPS;
  const out = !tilt && !round && !flat && s.outcome === 'out';
  return { tilt, round, flat, out, deg: s.deg.toFixed(1), to: s.toDeg.toFixed(1) };
}

// ------------------------------------------------------------------------
// 상태기계 — 원본 startRun · startTilt · afterAttempt · step
// 모두 새 객체를 돌려준다. 자취 배열은 원본처럼 한 걸음에 한 점씩 늘어난다.
// ------------------------------------------------------------------------

function startRun(s: BankedCurveState, deg: number): BankedCurveState {
  const car = freshCar();
  return {
    ...s,
    phase: 'run',
    phaseT: 0,
    deg,
    car,
    trail: [[car.x, car.y]],
    outcome: predict(deg),
    exitSide: null,
    alpha: 1,
  };
}

function startTilt(s: BankedCurveState, to: number, clearPast: boolean): BankedCurveState {
  let past = s.past;
  if (s.trail.length > 1) past = [...past, { deg: s.deg, pts: s.trail }];
  if (clearPast) past = [];
  return {
    ...s,
    past,
    trail: [],
    phase: 'tilt',
    phaseT: 0,
    fromDeg: s.deg,
    toDeg: to,
    car: freshCar(),
    alpha: 1,
    outcome: predict(to),
  };
}

function afterAttempt(s: BankedCurveState): BankedCurveState {
  if (s.manual) return startTilt(s, s.deg, true);
  const last = s.idx === ATTEMPTS.length - 1;
  const idx = last ? 0 : s.idx + 1;
  return startTilt({ ...s, idx }, ATTEMPTS[idx]!, last);
}

/** 고정 걸음 하나. 원본 `step(dt)` 그대로. */
function fixedStep(s0: BankedCurveState, dt: number): BankedCurveState {
  const s = { ...s0, phaseT: s0.phaseT + dt };

  if (s.phase === 'tilt') {
    const u = Math.min(1, s.phaseT / T_TILT);
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    if (u >= 1) return startRun({ ...s, deg: s.toDeg }, s.toDeg);
    return { ...s, deg: s.fromDeg + (s.toDeg - s.fromDeg) * e };
  }

  if (s.phase === 'run') {
    const car = physStep(s.car, s.deg, dt);
    const trail = [...s.trail, [car.x, car.y] as const];
    if (car.r > R_OUT || car.r < R_IN) {
      return { ...s, car, trail, exitSide: car.r > R_OUT ? 'out' : 'in', phase: 'fly', phaseT: 0 };
    }
    if (car.phi >= 2 * Math.PI) return { ...s, car, trail, phase: 'hold', phaseT: 0 };
    return { ...s, car, trail };
  }

  if (s.phase === 'fly') {
    // 길을 벗어난 뒤: 붙잡아 주는 면이 없으니 수평으로 곧게 나아가며 흐려진다
    const c = s.car;
    const car = { ...c, x: c.x + c.vx * dt * TIME_SCALE, y: c.y + c.vy * dt * TIME_SCALE };
    const trail = [...s.trail, [car.x, car.y] as const];
    const alpha = Math.max(0, 1 - s.phaseT / T_FLY);
    if (s.phaseT >= T_FLY) return { ...s, car, trail, alpha, phase: 'hold', phaseT: 0 };
    return { ...s, car, trail, alpha };
  }

  // hold
  const lim = s.exitSide ? T_HOLD : T_HOLD_LAP;
  return s.phaseT >= lim ? afterAttempt(s) : s;
}

/**
 * 한 걸음.
 *
 * 1. 조작기 소비 — 「자동으로 보기」 누름은 언제나 지운다. 슬라이더 값이 바뀌었으면
 *    손으로 정한 것으로 보고 그 기울기로 곧장 다시 달린다(원본 `input` 처리).
 * 2. 러너의 걸음을 1/60 고정 걸음으로 쪼개 원본 상태기계를 돌린다.
 * 3. 자동일 때 슬라이더가 지금 기울기를 따라간다. 캡션 자리를 채운다.
 */
export function step(params: { state: BankedCurveState; dt: number }): BankedCurveState {
  let s: BankedCurveState = params.state;

  if (s.pressed) {
    s = { ...s, pressed: false };
    // 원본은 자동일 때 단추가 숨어 있다. 숨은 단추는 눌리지 않지만, 눌려도 뜻이 같다.
    s = startTilt({ ...s, manual: false, idx: 0, past: [] }, ATTEMPTS[0]!, true);
  }

  if (s.held && s.slider !== s.sliderSeen) {
    // 손대는 순간 자동을 멈추고 그 기울기로 처음부터 다시 달린다.
    const to = s.slider;
    s = startTilt({ ...s, manual: true, past: [], sliderSeen: to }, to, true);
    s = { ...s, fromDeg: to, deg: to, phaseT: T_TILT }; // 바로 출발
  }

  let acc = s.acc + params.dt;
  for (let i = 0; i < MAX_FIXED_STEPS && acc >= FIXED_DT - ACC_EPS; i++) {
    s = fixedStep(s, FIXED_DT);
    acc -= FIXED_DT;
  }
  // 상한에 걸려 남은 몫은 버린다 — 탭을 오래 떠났다 돌아온 걸음이 한꺼번에 몰리지 않게.
  acc = Math.max(0, Math.min(acc, FIXED_DT));

  if (!s.manual && !s.held) {
    const v = Number(s.deg.toFixed(1));
    s = { ...s, slider: v, sliderSeen: v };
  }

  return { ...s, acc, caption: captionFlags(s) };
}
