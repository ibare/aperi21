// ========================================================================
// @aperi21/bundle-projectile — Scene Graph 모델 구현
// ========================================================================
// 설계 결정 #01 + Scene Graph 스키마를 기반으로
// 포물선 번들을 선언적으로 재작성.
//
// v3 데모의 Canvas 직접 그리기 코드가 완전히 사라지고,
// Bundle은 네 개의 순수 함수로만 구성된다:
//   - initialState
//   - step
//   - scene
//   - controllers
//
// 렌더링, 조작 UI, 시간 제어는 모두 호스트의 책임이다.
// ========================================================================

import type {
  Bundle, BundleSchema, SceneGraph, ControllerSpec,
  StageDef, EnvironmentDef, ViewDef, Vec2,
} from './aperi21-scene-graph-schema';


// ========================================================================
// 1. Bundle 상태 타입
// ========================================================================

interface ProjectileState {
  /** 시뮬레이션 경과 시간 (초). */
  t: number;

  /** 현재 위치 (m). */
  pos: Vec2;

  /** 현재 속도 (m/s). */
  vel: Vec2;

  /** 지나온 궤적. 매 step마다 기록됨. */
  history: Vec2[];

  /** 발사 단계. */
  phase: 'idle' | 'flying' | 'landed';

  /** 초기 조건 (참조용). */
  launch: { v0: number; theta: number };
}


// ========================================================================
// 2. 스키마 — 정적 메타데이터
// ========================================================================

const schema: BundleSchema = {
  id: 'projectile',
  label: { ko: '발사체', en: 'Projectile' },
  category: 'mechanics',
  operation: {
    ko: '각도 다이얼 + 핀볼 런처',
    en: 'Angle dial + pinball launcher',
  },
  timeModel: 'linear',

  parameters: [
    {
      id: 'v0',
      label: { ko: '초기 속도', en: 'Initial velocity' },
      unit: 'm/s',
      range: [1, 60],
      default: 20,
      step: 0.5,
    },
    {
      id: 'theta',
      label: { ko: '발사각', en: 'Launch angle' },
      unit: '°',
      range: [0, 90],
      default: 45,
      step: 1,
    },
  ],

  stages: [
    {
      id: 'earth',
      label: { ko: '지구', en: 'Earth' },
      description: { ko: 'g = 9.8 m/s², 대기 있음', en: 'g = 9.8 m/s², atmosphere' },
      constants: { g: 9.8, hasAtmosphere: 1 },
    },
    {
      id: 'moon',
      label: { ko: '달', en: 'Moon' },
      description: { ko: 'g = 1.6 m/s², 대기 없음', en: 'g = 1.6 m/s², no atmosphere' },
      constants: { g: 1.6, hasAtmosphere: 0 },
    },
    {
      id: 'vacuum',
      label: { ko: '우주', en: 'Vacuum' },
      description: { ko: 'g = 0, 자유 공간', en: 'g = 0, free space' },
      constants: { g: 0, hasAtmosphere: 0 },
    },
  ],

  environments: [
    {
      id: 'rain',
      label: { ko: '비', en: 'Rain' },
      description: { ko: '공기저항 k = 0.08', en: 'Air drag k = 0.08' },
      availableInStages: ['earth'],
      effects: { drag: 0.08 },
    },
    {
      id: 'headwind',
      label: { ko: '앞바람', en: 'Headwind' },
      description: { ko: '수평 반대 방향 −3 m/s²', en: 'Counter-horizontal −3 m/s²' },
      availableInStages: ['earth'],
      effects: { wind: -3 },
    },
    {
      id: 'tailwind',
      label: { ko: '뒷바람', en: 'Tailwind' },
      description: { ko: '수평 같은 방향 +3 m/s²', en: 'Pro-horizontal +3 m/s²' },
      availableInStages: ['earth'],
      effects: { wind: 3 },
    },
  ],

  views: [
    { id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true },
    { id: 'forces',     label: { ko: '분해', en: 'Forces' } },
    { id: 'energy',     label: { ko: '에너지', en: 'Energy' } },
  ],
};


// ========================================================================
// 3. 초기 상태 생성
// ========================================================================

function initialState(params: {
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


// ========================================================================
// 4. 시간 스텝 — 순수 함수 수치 적분
// ========================================================================

function step(params: {
  state: ProjectileState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): ProjectileState {
  const { state, dt, stage, environments } = params;

  // 비행 중이 아니면 그대로.
  if (state.phase !== 'flying') return state;

  const g = stage.constants.g ?? 0;

  // 환경 효과 누적
  let drag = 0;
  let wind = 0;
  for (const env of environments) {
    drag += env.effects.drag ?? 0;
    wind += env.effects.wind ?? 0;
  }

  const [vx, vy] = state.vel;
  const ax = -drag * vx + wind;
  const ay = -g - drag * vy;

  const newVx = vx + ax * dt;
  const newVy = vy + ay * dt;
  const newX = state.pos[0] + newVx * dt;
  const newY = state.pos[1] + newVy * dt;
  const newT = state.t + dt;

  // 착지 판정 (지면이 있는 스테이지만)
  const hasGround = g !== 0;  // 우주 스테이지는 지면 없음
  const landed = hasGround && newY <= 0 && state.t > 0.05;

  if (landed) {
    // 착지 보정 — 이전 점과 현재 점 사이에서 y=0인 시점 찾기
    const prevY = state.pos[1];
    const alpha = prevY / (prevY - newY);
    const landedX = state.pos[0] + alpha * (newX - state.pos[0]);
    const landedT = state.t + alpha * dt;

    return {
      ...state,
      t: landedT,
      pos: [landedX, 0],
      vel: [newVx, newVy],
      history: [...state.history, [landedX, 0]],
      phase: 'landed',
    };
  }

  return {
    ...state,
    t: newT,
    pos: [newX, newY],
    vel: [newVx, newVy],
    history: [...state.history, [newX, newY]],
  };
}


// ========================================================================
// 5. Scene Graph 선언 — 뷰별로 무엇이 있는가
// ========================================================================

function scene(params: { state: ProjectileState; view: ViewDef }): SceneGraph {
  const { state, view } = params;
  const [x, y] = state.pos;
  const [vx, vy] = state.vel;

  // === 공통 프리미티브 (모든 뷰가 공유) ===

  const ground = {
    type: 'surface' as const,
    id: 'ground',
    geometry: { kind: 'ground' as const, y: 0 },
    material: 'solid' as const,
  };

  const trail = {
    type: 'trajectory' as const,
    id: 'trail',
    points: state.history,
    style: { colorRole: 'primary' as const, fade: 'tail' as const },
  };

  const ball = {
    type: 'body' as const,
    id: 'ball',
    pos: [x, y] as Vec2,
    shape: 'circle' as const,
    size: 0.3,
    style: { colorRole: 'primary' as const, emphasis: 'strong' as const },
  };

  // === 뷰별 추가 프리미티브 ===

  if (view.id === 'trajectory') {
    return [ground, trail, ball];
  }

  if (view.id === 'forces' && state.phase === 'flying') {
    const vxVector = {
      type: 'vector' as const,
      id: 'vx',
      from: [x, y] as Vec2,
      delta: [vx, 0] as Vec2,
      label: { ko: 'vₓ', en: 'vₓ' },
      style: { colorRole: 'secondary' as const },
    };

    const vyVector = {
      type: 'vector' as const,
      id: 'vy',
      from: [x, y] as Vec2,
      delta: [0, vy] as Vec2,
      label: { ko: 'vᵧ', en: 'vᵧ' },
      style: { colorRole: 'accent' as const },
    };

    const resultant = {
      type: 'vector' as const,
      id: 'v',
      from: [x, y] as Vec2,
      delta: [vx, vy] as Vec2,
      label: { ko: 'v', en: 'v' },
      style: { colorRole: 'muted' as const, emphasis: 'subtle' as const },
    };

    return [ground, trail, ball, resultant, vxVector, vyVector];
  }

  if (view.id === 'energy' && state.phase !== 'idle') {
    // 에너지는 derivedValues에서도 계산되지만, 뷰에서 즉시 보여주기 위해
    // Graph 프리미티브를 Scene Graph에 직접 포함.
    const m = 1;
    const ke = 0.5 * m * (vx * vx + vy * vy);
    const pe = m * (params.state.pos[1] > 0 ? params.state.pos[1] : 0) * 9.8;  // 간소화
    const total = ke + pe;
    const initialKE = 0.5 * m * (state.launch.v0 ** 2);  // 초기 KE

    const energyGraph = {
      type: 'graph' as const,
      id: 'energy-bars',
      style: 'bar' as const,
      horizontal: true,
      series: [
        {
          id: 'ke',
          label: { ko: '운동 에너지', en: 'Kinetic' },
          data: [{ x: ke, y: 0 }],
          colorRole: 'accent' as const,
        },
        {
          id: 'pe',
          label: { ko: '위치 에너지', en: 'Potential' },
          data: [{ x: pe, y: 1 }],
          colorRole: 'secondary' as const,
        },
        {
          id: 'total',
          label: { ko: '합', en: 'Total' },
          data: [{ x: total, y: 2 }],
          colorRole: 'positive' as const,
        },
      ],
      xAxis: {
        label: { ko: '에너지 (J)', en: 'Energy (J)' },
        range: [0, initialKE * 1.1],
      },
      reference: {
        value: initialKE,
        label: { ko: '초기 총 에너지', en: 'Initial total' },
      },
    };

    const velocityVec = {
      type: 'vector' as const,
      id: 'v',
      from: [x, y] as Vec2,
      delta: [vx, vy] as Vec2,
      label: { ko: '속도', en: 'Velocity' },
      style: { colorRole: 'accent' as const },
    };

    return [ground, trail, ball, velocityVec, energyGraph];
  }

  return [ground, trail, ball];
}


// ========================================================================
// 6. 컨트롤러 선언
// ========================================================================

function controllers(): ControllerSpec[] {
  return [
    {
      type: 'angle-dial',
      binds: { angle: 'launch.theta' },
      range: [0, 90],
      tickAt: [45],  // 물리적 특수점 — 최대 비거리
    },
    {
      type: 'pinball-launcher',
      binds: {
        power: 'launch.v0',
        trigger: 'phase',  // 발사 시 phase → 'flying'
      },
      powerRange: [1, 60],
    },
  ];
}


// ========================================================================
// 7. 파생값 — 에너지 뷰와 정보 패널에 자동 공급
// ========================================================================

function derivedValues(state: ProjectileState, stage: StageDef): Record<string, number> {
  const m = 1;
  const [vx, vy] = state.vel;
  const y = Math.max(0, state.pos[1]);

  // 거리·높이 (현재까지의 최대)
  let maxHeight = 0;
  let maxRange = 0;
  for (const [px, py] of state.history) {
    if (py > maxHeight) maxHeight = py;
    if (px > maxRange) maxRange = px;
  }

  return {
    t: state.t,
    ke: 0.5 * m * (vx * vx + vy * vy),
    pe: m * (stage.constants.g ?? 0) * y,
    speed: Math.hypot(vx, vy),
    maxHeight,
    range: maxRange,
    flightTime: state.phase === 'landed' ? state.t : 0,
  };
}


// ========================================================================
// 8. 종료 판정
// ========================================================================

function isTerminated(state: ProjectileState): boolean {
  return state.phase === 'landed';
}


// ========================================================================
// 9. Bundle 조립 & 내보내기
// ========================================================================

export const projectileBundle: Bundle<ProjectileState> = {
  schema,
  initialState,
  step,
  scene,
  controllers,
  derivedValues,
  isTerminated,
};

export default projectileBundle;


// ========================================================================
// 참고 — 이 파일에서 사라진 것들 (v3 대비)
// ========================================================================
// - Canvas / ctx 참조: 전혀 없음
// - requestAnimationFrame: 호스트가 제어
// - 입자 애니메이션 (비, 별): 환경/스테이지 설정이 호스트 배경 렌더러에 전달됨
// - 핀볼 런처의 드래그 처리: 호스트의 controller 라이브러리가 담당
// - 각도 다이얼 그리기: 호스트의 controller 라이브러리가 담당
// - 카메라 / 줌 / 팬: 호스트의 카메라 시스템
// - HUD / 정보 패널 / 뷰 탭: 호스트의 UI 레이어
// - 다국어 실제 해석: 호스트의 i18n이 LocalizedText를 resolve
// - 테마 색상: colorRole → 호스트 테마 엔진이 현재 색상으로 변환
//
// 이 Bundle 파일은 약 ~300줄.
// 이 중 약 60%가 스키마 선언 (메타데이터), 40%가 물리 로직.
// 렌더링 코드가 0줄이라는 점이 Scene Graph 모델의 핵심 이점.
