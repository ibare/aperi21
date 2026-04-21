import type {
  EnvironmentDef,
  LocalizedText,
  SceneGraph,
  StageDef,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import type { ProjectileState } from './state';

function stageText(stage: StageDef, g: number): LocalizedText {
  const l = stage.label;
  const gStr = `g=${g.toFixed(1)} m/s²`;
  if (typeof l === 'string') return `${l} · ${gStr}`;
  if (l && typeof l === 'object' && !Array.isArray(l)) {
    const dict = l as { [k: string]: string };
    const ko = dict.ko ?? dict.en ?? stage.id;
    const en = dict.en ?? dict.ko ?? stage.id;
    return { ko: `${ko} · ${gStr}`, en: `${en} · ${gStr}` };
  }
  return `${stage.id} · ${gStr}`;
}

/**
 * 뷰·스테이지·환경별 Scene Graph.
 * - 중력(g)이 0 이면 지평선을 그리지 않는다(우주 진공).
 * - 중력 화살표 + 스테이지 라벨(g 값)을 월드 좌표 고정 지점에 렌더해
 *   지구/달/우주 전환 시 즉시 시각 변화가 보이도록 한다.
 * - 대기 환경(비/바람)은 월드 좌표 상단에 뱃지로 표시.
 *
 * 에너지 뷰는 Phase 2 설계 변경으로 Graph 프리미티브를 포함하지 않는다 —
 * 호스트의 EnergyHUD 가 derivedValues 를 읽어 자동 렌더.
 */
export function scene(params: {
  state: ProjectileState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, view, stage, environments } = params;
  const [x, y] = state.pos;
  const [vx, vy] = state.vel;
  const g = stage.constants.g ?? 0;
  const hasAtmosphere = (stage.constants.hasAtmosphere ?? 0) > 0;

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

  // 스테이지 뱃지: 월드 원점 뒤쪽 상단에 라벨.
  const stageBadge = {
    type: 'marker' as const,
    id: 'stage-badge',
    pos: [-1.5, 3.2] as Vec2,
    kind: 'label' as const,
    text: stageText(stage, g),
  };

  // 중력 화살표: 월드 좌표에서 원점 좌상단에 고정. g 스케일만 시각화.
  const gravityArrow =
    g > 0
      ? [
          {
            type: 'vector' as const,
            id: 'g-arrow',
            from: [-1, 3] as Vec2,
            delta: [0, -Math.min(2.5, 0.25 * g)] as Vec2,
            label: { ko: 'g', en: 'g' },
            style: { colorRole: 'muted' as const, emphasis: 'medium' as const },
          },
        ]
      : [];

  // 환경 뱃지(대기 있음 + 환경 활성). 우주/달에서는 hasAtmosphere=0 이므로 생략.
  const envBadges =
    hasAtmosphere && environments.length > 0
      ? environments.map((env, i) => ({
          type: 'marker' as const,
          id: `env-${env.id}`,
          pos: [3 + i * 3, 3.2] as Vec2,
          kind: 'label' as const,
          text: env.label,
        }))
      : [];

  const stageVisuals = [stageBadge, ...gravityArrow, ...envBadges];

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
    return [...ground, ...stageVisuals, trail, ball, ...landingFlash];
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
    return [...ground, ...stageVisuals, trail, ball, resultant, vxVector, vyVector];
  }

  if (view.id === 'energy' && state.phase !== 'idle') {
    // 에너지 뷰는 Graph 프리미티브를 포함하지 않는다 (Phase 2 설계 변경).
    // 대신 속도 벡터만 강조 표시.
    const velocityVec = {
      type: 'vector' as const,
      id: 'v',
      from: [x, y] as Vec2,
      delta: [vx, vy] as Vec2,
      label: { ko: '속도', en: 'Velocity' },
      style: { colorRole: 'accent' as const },
    };
    return [...ground, ...stageVisuals, trail, ball, velocityVec, ...landingFlash];
  }

  return [...ground, ...stageVisuals, trail, ball, ...landingFlash];
}
