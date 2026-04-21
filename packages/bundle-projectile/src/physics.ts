import type { Bounds, EnvironmentDef, StageDef } from '@aperi21/schema';
import type { ProjectileState } from './state';

/** 기본 질량 (kg) — 에너지 계산·라벨용 가상값. */
export const MASS = 1;

export function initialState(params: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ProjectileState {
  const v0 = params.values.v0 ?? 20;
  const theta = params.values.theta ?? 45;
  const rad = (theta * Math.PI) / 180;
  return {
    t: 0,
    pos: [0, 0],
    vel: [v0 * Math.cos(rad), v0 * Math.sin(rad)],
    history: [[0, 0]],
    phase: 'idle',
    launch: { v0, theta },
  };
}

/**
 * phase==='flying' 일 때만 시간 전진. Euler 적분 — dt 가 작을 때 (RAF ≈ 16ms)
 * 시각 수준 정확도는 충분. 환경 배열은 매 프레임 최신 값이 전달되므로
 * "비행 중 비 토글" 같은 라이브 개입이 자동으로 반영된다.
 */
export function step(params: {
  state: ProjectileState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ProjectileState {
  const { state, dt, stage, environments } = params;
  if (state.phase !== 'flying') return state;

  // 발사 순간 initialState 로 이미 vel 이 세팅되어 있을 수도 있지만,
  // 런처가 phase 를 flying 으로 전환할 때 launch.v0/theta 만 바꾸고 vel 을
  // 안 건드리는 경우가 있으므로 첫 step 에서 vel 을 재동기화한다.
  let workingState = state;
  if (state.t === 0 && state.pos[0] === 0 && state.pos[1] === 0) {
    const rad = (state.launch.theta * Math.PI) / 180;
    const vx = state.launch.v0 * Math.cos(rad);
    const vy = state.launch.v0 * Math.sin(rad);
    workingState = { ...state, vel: [vx, vy] };
  }

  const g = stage.constants.g ?? 0;
  let drag = 0;
  let wind = 0;
  for (const env of environments) {
    drag += env.effects.drag ?? 0;
    wind += env.effects.wind ?? 0;
  }

  const [vx, vy] = workingState.vel;
  const ax = -drag * vx + wind;
  const ay = -g - drag * vy;

  const newVx = vx + ax * dt;
  const newVy = vy + ay * dt;
  const newX = workingState.pos[0] + newVx * dt;
  const newY = workingState.pos[1] + newVy * dt;
  const newT = workingState.t + dt;

  const hasGround = g !== 0;
  const landed = hasGround && newY <= 0 && workingState.t > 0.05;
  if (landed) {
    const prevY = workingState.pos[1];
    const alpha = prevY / (prevY - newY || 1);
    const landedX = workingState.pos[0] + alpha * (newX - workingState.pos[0]);
    const landedT = workingState.t + alpha * dt;
    return {
      ...workingState,
      t: landedT,
      pos: [landedX, 0],
      vel: [newVx, newVy],
      history: [...workingState.history, [landedX, 0]],
      phase: 'landed',
      landedAt: landedT,
    };
  }
  return {
    ...workingState,
    t: newT,
    pos: [newX, newY],
    vel: [newVx, newVy],
    history: [...workingState.history, [newX, newY]],
  };
}

/**
 * 에너지 값(ke/pe/total/initialTotal/lost) 등 InfoPanel·EnergyHUD 에서 쓸
 * 파생값. 환경이 없으면 ke+pe 는 초기 total 로 보존된다.
 */
export function derivedValues(
  state: ProjectileState,
  stage: StageDef,
): Record<string, number> {
  const [vx, vy] = state.vel;
  const g = stage.constants.g ?? 0;
  const y = Math.max(0, state.pos[1]);
  const ke = 0.5 * MASS * (vx * vx + vy * vy);
  const pe = MASS * g * y;
  const initialKE = 0.5 * MASS * state.launch.v0 * state.launch.v0;
  const total = ke + pe;
  const lost = Math.max(0, initialKE - total);

  let maxHeight = 0;
  let maxRange = 0;
  for (const p of state.history) {
    if (p[1] > maxHeight) maxHeight = p[1];
    if (p[0] > maxRange) maxRange = p[0];
  }

  return {
    t: state.t,
    speed: Math.hypot(vx, vy),
    ke,
    pe,
    total,
    initialTotal: initialKE,
    lost,
    maxHeight,
    range: maxRange,
    flightTime: state.phase === 'landed' ? state.t : 0,
  };
}

export function isTerminated(state: ProjectileState): boolean {
  return state.phase === 'landed';
}

export function boundsHint(
  state: ProjectileState,
  _stage: StageDef,
): Bounds {
  let maxX = Math.max(state.pos[0], state.launch.v0);
  let maxY = Math.max(state.pos[1], state.launch.v0 * 0.5);
  for (const [px, py] of state.history) {
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  return {
    minX: -2,
    maxX: Math.max(10, maxX * 1.15),
    minY: 0,
    maxY: Math.max(8, maxY * 1.4),
  };
}
