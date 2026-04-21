import type { SceneGraph, Vec2, ViewDef } from '@aperi21/schema';
import type { ProjectileState } from './state';

/**
 * 뷰별 Scene Graph. 에너지 뷰는 Phase 2 설계 변경으로 Graph 프리미티브를
 * 포함하지 않는다 — 호스트의 EnergyHUD 가 derivedValues 를 읽어 자동 렌더.
 */
export function scene(params: { state: ProjectileState; view: ViewDef }): SceneGraph {
  const { state, view } = params;
  const [x, y] = state.pos;
  const [vx, vy] = state.vel;

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
    return [ground, trail, ball, ...landingFlash];
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
    // 에너지 뷰는 Graph 프리미티브를 포함하지 않는다 (Phase 2 설계 변경).
    // 대신 속도 벡터만 강조 표시. 에너지 바 HUD 는 호스트의 EnergyHUD 가
    // schema.autoViews.energy + bundle.derivedValues 로 자동 생성.
    const velocityVec = {
      type: 'vector' as const,
      id: 'v',
      from: [x, y] as Vec2,
      delta: [vx, vy] as Vec2,
      label: { ko: '속도', en: 'Velocity' },
      style: { colorRole: 'accent' as const },
    };
    return [ground, trail, ball, velocityVec, ...landingFlash];
  }

  return [ground, trail, ball, ...landingFlash];
}
