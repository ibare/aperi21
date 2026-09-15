import type {
  EnvironmentDef,
  Gauge,
  SceneGraph,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import type { ProjectileState } from './state';
import { derivedValues } from './physics';
import { ENERGY_BARS, ENERGY_UNIT } from './schema';

/**
 * 뷰·스테이지·환경별 Scene Graph.
 * - 중력(g)이 0 이면 지평선을 그리지 않는다(우주 진공).
 *
 * **에너지 뷰의 막대는 이 선언이 만든다.** 예전에는 러너가 `autoViews.energy` 를
 * 보고 HUD 를 자동으로 띄웠는데, 그러면 무엇을 보여 줄지가 조각의 결정이 아니게
 * 된다 (S-piece 「화면에 없는 것도 결정이다」). 이제 `gauge` 를 선언한다.
 */
export function scene(params: {
  state: ProjectileState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, view, stage } = params;
  const [x, y] = state.pos;
  const [vx, vy] = state.vel;
  const g = stage.constants.g ?? 0;

  // 중력이 있는 스테이지에만 지평선 렌더.
  const ground =
    g > 0
      ? [
          {
            type: 'surface' as const,
            id: 'ground',
            geometry: { kind: 'ground' as const, y: 0 },
            material: 'solid' as const,
          },
        ]
      : [];

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

  const landingFlash =
    state.phase === 'landed' && state.landedAt !== undefined
      ? [
          {
            type: 'event' as const,
            id: 'landing-flash',
            pos: [x, y] as Vec2,
            kind: 'flash' as const,
            duration: 0.6,
            startedAt: state.landedAt,
            style: { colorRole: 'accent' as const, emphasis: 'strong' as const },
          },
        ]
      : [];

  if (view.id === 'trajectory') {
    return [...ground, trail, ball, ...landingFlash];
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
    return [...ground, trail, ball, resultant, vxVector, vyVector];
  }

  if (view.id === 'energy' && state.phase !== 'idle') {
    const velocityVec = {
      type: 'vector' as const,
      id: 'v',
      from: [x, y] as Vec2,
      delta: [vx, vy] as Vec2,
      label: { ko: '속도', en: 'Velocity' },
      style: { colorRole: 'accent' as const },
    };
    // 운동·위치·손실을 한 눈금자 위에 놓는다. 셋이 같은 범위(처음의 전체 에너지)를
    // 나눠 쓰므로 막대 길이끼리 견줄 수 있다 — 셋이 각자 제 범위를 쓰면 "옮겨
    // 갔다" 가 보이지 않는다.
    const d = derivedValues(state, stage);
    const span: [number, number] = [0, Math.max(1e-6, d.initialTotal ?? 1)];
    const bars = ENERGY_BARS.map((b): Gauge => ({
      type: 'gauge',
      id: `energy-${b.key}`,
      value: d[b.key] ?? 0,
      range: span,
      unit: ENERGY_UNIT,
      kind: 'linear',
      label: b.label,
      style: { colorRole: b.role, emphasis: 'strong' },
    }));
    return [...ground, trail, ball, velocityVec, ...bars, ...landingFlash];
  }

  return [...ground, trail, ball, ...landingFlash];
}
