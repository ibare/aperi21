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
 * phase==='flying' 일 때만 시간 전진. Semi-implicit (symplectic) Euler 적분 —
 * 새 vel 로 pos 를 갱신하므로 같은 dt 에서 forward Euler 보다 에너지 보존이 훨씬
 * 안정적이다. 환경 배열은 매 프레임 최신 값이 전달되므로 "비행 중 비 토글"
 * 같은 라이브 개입이 자동으로 반영된다.
 */
export function step(params: {
  state: ProjectileState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ProjectileState {
  const { state, dt, stage, environments } = params;
  if (state.phase !== 'flying') {
    // `idle` 은 **발사 직전**이다. 한 번 날아간 뒤 다시 당기면 런처는 `phase` 만
    // 되돌린다 — 그 조작기는 조각의 상태 구조를 모르고, 알아서도 안 된다
    // (「무엇으로 돌아갈지는 조각이 안다」). 그래서 착지 자리의 `t`·`pos`·`vel`·
    // `history` 가 그대로 남고, 다음 발사가 그 자리에서 시작해 **공이 날지 않는다.**
    // 예외도 안 나고 타입도 통과한다.
    if (state.phase === 'idle' && state.t !== 0) {
      const rad = (state.launch.theta * Math.PI) / 180;
      return {
        ...state,
        t: 0,
        pos: [0, 0],
        vel: [state.launch.v0 * Math.cos(rad), state.launch.v0 * Math.sin(rad)],
        history: [[0, 0]],
        landedAt: undefined,
      };
    }
    return state;
  }

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

  // semi-implicit Euler: vel 먼저 갱신 후 그 vel 로 pos 적분.
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

/**
 * 카메라 자동 프레이밍용 바운드 — 레퍼런스(prototype) 의 autoFrame 과 동일 설계.
 *
 * 비행 중에는 **관찰된 trajectory 의 현재까지의 extent** 만으로 프레이밍한다.
 * 예측·윈도·tracking 없음. 매 프레임 bounds 가 공의 진행에 맞춰 자라고 중심도
 * 이동하므로 카메라가 자연스럽게 공을 따라가는 flow 가 생긴다.
 *
 *   cx     = maxX / 2
 *   cy     = (maxY + minY) / 2
 *   halfW  = max(maxX*0.6, 10)        // worldW = maxX*1.2 과 동등
 *   halfH  = max((maxY-minY)*0.7, 5)
 *
 * idle 에는 아직 trajectory 가 시작점 하나뿐이라 예측 분석식으로만 프레임한다.
 */
export function boundsHint(state: ProjectileState, stage: StageDef): Bounds {
  const g = stage.constants.g ?? 0;

  if (state.phase === 'idle') {
    const v0 = Math.max(0.1, state.launch.v0);
    const rad = (state.launch.theta * Math.PI) / 180;
    const estRange = g > 0 ? (v0 * v0 * Math.sin(2 * rad)) / g : v0 * Math.cos(rad) * 10;
    const sinT = Math.sin(rad);
    const estH = g > 0 ? (v0 * v0 * sinT * sinT) / (2 * g) : Math.max(1, v0 * sinT * 5);
    const cx = estRange / 2;
    const cy = estH / 2;
    const halfW = Math.max(estRange * 0.65, 10);
    const halfH = Math.max(estH * 1.1, 5);
    // 중력이 있는 stage 에서는 지면(y=0) 아래로 카메라가 새지 않도록 고정.
    // halfH 의 하한(5) 때문에 v0 가 작으면 cy-halfH < 0 이 되어 발사점이 화면
    // 위쪽으로 밀리는 현상을 방지한다.
    const minY = g > 0 ? 0 : cy - halfH;
    const maxY = g > 0 ? Math.max(estH * 1.2, halfH * 2) : cy + halfH;
    return {
      minX: cx - halfW,
      maxX: cx + halfW,
      minY,
      maxY,
    };
  }

  let maxX = 0;
  let maxY = 0;
  let minY = 0;
  for (const [hx, hy] of state.history) {
    if (hx > maxX) maxX = hx;
    if (hy > maxY) maxY = hy;
    if (hy < minY) minY = hy;
  }
  const cx = maxX / 2;
  const cy = (maxY + minY) / 2;
  const halfW = Math.max(maxX * 0.6, 10);
  const halfH = Math.max((maxY - minY) * 0.7, 5);
  return {
    minX: cx - halfW,
    maxX: cx + halfW,
    minY: cy - halfH,
    maxY: cy + halfH,
  };
}
