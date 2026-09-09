// ========================================================================
// archimedes-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다 (S-sim). 캔버스·좌표 변환·색을 만지지 않는다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Marker,
  Primitive,
  SceneGraph,
  StageDef,
  Surface,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  asPrimitive,
  text,
  FORCE_UNIT,
  type DialScalePrimitive,
  type WaterStreamPrimitive,
  type WaterVolumePrimitive,
} from './schema';
import { clamp01, deriveCupLevel, deriveReadings, readConstants } from './physics';
import type { ArchimedesPrincipleState } from './state';

// ------------------------------------------------------------------------
// 장치의 치수 — 월드 좌표 (m), y 위쪽 양수, y = 0 이 실험대 상판.
// ------------------------------------------------------------------------
// 실물 비례를 지킨다: 물체는 1.0 L 정육면체이므로 한 변 0.10 m 다.
// 컵의 안쪽 넓이(0.13 m × 0.10 m)로 1.0 L 를 나누면 수면이 0.077 m 올라온다.

// 세로가 비싸다: 카메라는 월드 원점을 화면 중앙보다 60px 아래(SCREEN_Y_BIAS)에
// 두고 경계 중점을 그 자리에 맞추므로, 세로 가용 픽셀은 실제로 `캔버스 높이 − 192`
// 다. 장치를 위로 길게 뽑을수록 눈금판이 읽을 수 없이 작아진다. 그래서 매다는 보를
// 두지 않고, 눈금판을 크게(0.16 m) 잡아 이 조각의 주인공 자리에 놓았다.
const LAYOUT = {
  ground: 0,

  /** 주둥이까지 가득 찬 넘침 그릇. 수면이 주둥이에 물려 있어 자리가 없다. */
  can: {
    left: -0.46,
    right: -0.14,
    bottom: 0,
    top: 0.34,
    /** 주둥이 구멍이 뚫린 오른쪽 벽 구간. */
    holeLow: 0.24,
    holeHigh: 0.28,
    /** 주둥이 끝. */
    tipX: 0,
    tipHigh: 0.255,
    tipLow: 0.215,
    waterLevel: 0.26,
  },

  /** 2.0 kg · 1.0 L 물체. */
  block: { size: 0.1, x: -0.3, gap: 0.05 },

  /**
   * 넘친 물을 받는 컵. 저울에 매달려 있다.
   *
   * 주둥이에서 가깝게 둔다. 물줄기는 수평 속도가 일정한 채로 낙하가 가속하는
   * 포물선이라, 컵을 멀리 두면 왼쪽 벽에 닿을 무렵 이미 테두리보다 낮아진다 —
   * 물줄기가 벽을 뚫고 들어가는 그림이 된다. 가로 간격은 착수점까지 거리의
   * 절반 아래로 유지한다.
   */
  cup: {
    left: 0.07,
    right: 0.2,
    bottom: 0.05,
    top: 0.18,
    /** 안쪽 너비 (m). */
    width: 0.13,
    /** 화면에 보이지 않는 안쪽 깊이 (m) — 수면 높이를 부피에서 얻기 위한 것. */
    depth: 0.1,
    centerX: 0.135,
    /** 물줄기가 떨어지는 지점의 x. */
    landingX: 0.155,
  },

  dial: { radius: 0.16, y: 0.63, objectX: -0.3, waterX: 0.135 },

  /** 힘 벡터 길이 배율 (m/N). 9.8 N 이 물체 한 변만큼. */
  forceScale: 0.01,

  /** 물줄기 최대 굵기 (m). */
  streamWidth: 0.018,

  /** 수면 일렁임 진폭 (m). */
  ripple: 0.004,

  /** 두 눈금판이 공유하는 눈금 범위 (N). 같아야 부채꼴이 비교된다. */
  dialRange: [0, 20] as const,

  bounds: { minX: -0.5, maxX: 0.34, minY: -0.09, maxY: 0.86 },
} as const;

export const ARCHIMEDES_LAYOUT = LAYOUT;

// ------------------------------------------------------------------------

function wall(id: string, from: Vec2, to: Vec2): Surface {
  return { type: 'surface', id, geometry: { kind: 'wall', from, to }, material: 'solid' };
}

/** 물체 아래 면의 월드 y. approach 구간에서는 수면 위에 떠 있다. */
export function blockBottomY(state: ArchimedesPrincipleState): number {
  const { can, block } = LAYOUT;
  return (
    can.waterLevel +
    block.gap * (1 - clamp01(state.approach)) -
    block.size * clamp01(state.submersion)
  );
}

export function scene(params: {
  state: ArchimedesPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const r = deriveReadings(state.submersion, c);
  const { can, block, cup, dial } = LAYOUT;

  const bottomY = blockBottomY(state);
  const centerY = bottomY + block.size / 2;
  const cupLevel = deriveCupLevel(r.displacedVolume, cup);

  // ---- 장치 골격 — 표준 어휘 (surface) 로 충분한 부분 ----
  const frame: Surface[] = [
    { type: 'surface', id: 'bench', geometry: { kind: 'ground', y: LAYOUT.ground }, material: 'solid' },

    wall('can-left', [can.left, can.bottom], [can.left, can.top]),
    wall('can-bottom', [can.left, can.bottom], [can.right, can.bottom]),
    wall('can-right-low', [can.right, can.bottom], [can.right, can.holeLow]),
    wall('can-right-high', [can.right, can.holeHigh], [can.right, can.top]),
    wall('spout-high', [can.right, can.holeHigh], [can.tipX, can.tipHigh]),
    wall('spout-low', [can.right, can.holeLow], [can.tipX, can.tipLow]),

    wall('cup-left', [cup.left, cup.bottom], [cup.left, cup.top]),
    wall('cup-bottom', [cup.left, cup.bottom], [cup.right, cup.bottom]),
    wall('cup-right', [cup.right, cup.bottom], [cup.right, cup.top]),
  ];

  // ---- 물체 ----
  const object: Body = {
    type: 'body',
    id: 'object',
    pos: [block.x, centerY],
    shape: 'rect',
    size: [block.size, block.size],
    mass: c.objectMass,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };

  // ---- 부력 — 잠긴 만큼 자란다 ----
  const buoyancy: Vector = {
    type: 'vector',
    id: 'buoyancy',
    from: [block.x, centerY],
    delta: [0, r.buoyancy * LAYOUT.forceScale],
    label: text('label.buoyancy'),
    headSize: 0.02,
    style: { colorRole: 'positive', emphasis: 'strong' },
    hidden: r.buoyancy <= 0,
  };

  // ---- 물 — 넘친다 ----
  const canWater: WaterVolumePrimitive = {
    type: 'waterVolume',
    id: 'can-water',
    bounds: { min: [can.left, can.bottom], max: [can.right, can.waterLevel] },
    // 주둥이에 물려 있어 오르지 않는다. 들어간 만큼 그대로 넘어간다.
    level: can.waterLevel,
    ripple: LAYOUT.ripple,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  };

  const cupWater: WaterVolumePrimitive = {
    type: 'waterVolume',
    id: 'cup-water',
    bounds: { min: [cup.left, cup.bottom], max: [cup.right, cup.top] },
    level: cupLevel,
    ripple: LAYOUT.ripple,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  };

  const stream: WaterStreamPrimitive = {
    type: 'waterStream',
    id: 'overflow',
    from: [can.tipX, (can.tipHigh + can.tipLow) / 2],
    to: [cup.landingX, cupLevel + 0.006],
    flow: Math.max(0, state.flow),
    width: LAYOUT.streamWidth,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };

  // ---- 두 저울 — 마주 움직인다 ----
  // 같은 눈금 범위를 쓰므로 두 부채꼴의 각도 폭이 곧 변화량이고,
  // 그 둘은 매 순간 합동이다. 그것이 이 조각이 하는 말이다.
  const objectScale: DialScalePrimitive = {
    type: 'dialScale',
    id: 'scale-object',
    pos: [dial.objectX, dial.y],
    radius: dial.radius,
    value: r.apparentWeight,
    origin: r.weightInAir,
    range: LAYOUT.dialRange,
    unit: FORCE_UNIT,
    label: text('label.objectScale'),
    tether: [block.x, bottomY + block.size],
    style: { colorRole: 'negative', emphasis: 'strong' },
  };

  const waterScale: DialScalePrimitive = {
    type: 'dialScale',
    id: 'scale-water',
    pos: [dial.waterX, dial.y],
    radius: dial.radius,
    value: r.spilledWeight,
    origin: 0,
    range: LAYOUT.dialRange,
    unit: FORCE_UNIT,
    label: text('label.waterScale'),
    tether: [cup.centerX, cup.top],
    style: { colorRole: 'positive', emphasis: 'strong' },
  };

  // ---- 주석 ----
  const notes: Marker[] = [
    {
      type: 'marker',
      id: 'note-brim',
      kind: 'label',
      pos: [block.x, can.bottom + 0.02],
      text: text('label.brimFull'),
      style: { colorRole: 'muted', emphasis: 'medium' },
    },
    {
      type: 'marker',
      id: 'note-claim',
      kind: 'label',
      pos: [-0.05, -0.08],
      text: text('label.claim'),
      style: { colorRole: 'accent', emphasis: 'strong' },
    },
  ];

  const declared: Primitive[] = [
    ...frame,
    object,
    buoyancy,
    ...notes,
    asPrimitive(canWater),
    asPrimitive(cupWater),
    asPrimitive(stream),
    asPrimitive(objectScale),
    asPrimitive(waterScale),
  ];

  return declared;
}

export function boundsHint(): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  // 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...LAYOUT.bounds };
}
