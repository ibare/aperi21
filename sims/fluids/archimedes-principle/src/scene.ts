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
  Region,
  Scale,
  SceneGraph,
  StageDef,
  Stream,
  Surface,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import { text, FORCE_UNIT } from './schema';
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

  /** 물줄기 획 굵기 (화면 px). */
  streamWidthPx: 3,
  /** 물줄기 방출 밀도(개/초)와 물방울 수명(초)의 상한. */
  streamRate: 90,

  /** 수면 일렁임 진폭 (화면 px). 일렁임은 물리량이 아니라 표현이다. */
  ripplePx: 4,

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
  const cupLevelHeight = Math.max(0, cupLevel - cup.bottom);

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
  // `region` 은 매질(45)이라 물체(40) 위에 반투명으로 덮인다. 그래야 잠긴
  // 부분이 물빛 아래로 비쳐 "잠겼다" 로 읽힌다.
  const canWater: Region = {
    type: 'region',
    id: 'can-water',
    points: [
      [can.left, can.bottom],
      [can.right, can.bottom],
      [can.right, can.waterLevel],
      [can.left, can.waterLevel],
    ],
    // 주둥이에 물려 있어 오르지 않는다. 들어간 만큼 그대로 넘어간다.
    ripple: { edge: [2, 3], amplitude: LAYOUT.ripplePx },
    outline: [[2, 3]],
    style: { colorRole: 'secondary', emphasis: 'medium' },
  };

  const cupWater: Region = {
    type: 'region',
    id: 'cup-water',
    points: [
      [cup.left, cup.bottom],
      [cup.right, cup.bottom],
      [cup.right, cup.bottom + cupLevelHeight],
      [cup.left, cup.bottom + cupLevelHeight],
    ],
    // 컵은 처음에 비어 있다. 얕은 물이 바닥을 뚫고 출렁이지 않게 진폭을 묶는다.
    ripple: { edge: [2, 3], amplitude: Math.min(LAYOUT.ripplePx, cupLevelHeight * 400) },
    outline: [[2, 3]],
    style: { colorRole: 'secondary', emphasis: 'medium' },
    hidden: cupLevelHeight <= 0.001,
  };

  // 물줄기 — 주둥이를 떠나 컵으로 떨어진다.
  //
  // 수평 속도는 일정하고 낙하는 가속한다. 착수점에서 속도를 역산하는 것은
  // sim 의 물리다 — 어휘는 "어디서 어떤 속도로 떠났는가" 만 받는다.
  const spoutY = (can.tipHigh + can.tipLow) / 2;
  const fallHeight = Math.max(0.001, spoutY - (cupLevel + 0.006));
  const fallTime = Math.sqrt((2 * fallHeight) / c.g);
  const overflow: Stream = {
    type: 'stream',
    id: 'overflow',
    from: [can.tipX, spoutY],
    velocity: [(cup.landingX - can.tipX) / fallTime, 0],
    acceleration: [0, -c.g],
    rate: LAYOUT.streamRate,
    life: fallTime,
    width: LAYOUT.streamWidthPx,
    flow: Math.max(0, state.flow),
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };

  // ---- 두 저울 — 마주 움직인다 ----
  // 같은 눈금 범위를 쓰므로 두 부채꼴의 각도 폭이 곧 변화량이고,
  // 그 둘은 매 순간 합동이다. 그것이 이 조각이 하는 말이다.
  const objectScale: Scale = {
    type: 'scale',
    id: 'scale-object',
    shape: 'dial',
    pos: [dial.objectX, dial.y],
    size: dial.radius,
    value: r.apparentWeight,
    origin: r.weightInAir,
    range: LAYOUT.dialRange,
    unit: FORCE_UNIT,
    label: text('label.objectScale'),
    style: { colorRole: 'negative', emphasis: 'strong' },
  };

  const waterScale: Scale = {
    type: 'scale',
    id: 'scale-water',
    shape: 'dial',
    pos: [dial.waterX, dial.y],
    size: dial.radius,
    value: r.spilledWeight,
    origin: 0,
    range: LAYOUT.dialRange,
    unit: FORCE_UNIT,
    label: text('label.waterScale'),
    style: { colorRole: 'positive', emphasis: 'strong' },
  };

  // 저울이 무엇을 들고 있는지 — 매단 줄. 선 하나면 되므로 어휘를 새로 만들지
  // 않는다 (원칙 4 — 두 번째 사례가 나온 뒤에 만든다).
  const tethers: Surface[] = [
    wall('tether-object', [dial.objectX, dial.y - dial.radius], [block.x, bottomY + block.size]),
    wall('tether-water', [dial.waterX, dial.y - dial.radius], [cup.centerX, cup.top]),
  ];

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
    ...tethers,
    object,
    buoyancy,
    ...notes,
    canWater,
    cupWater,
    overflow,
    objectScale,
    waterScale,
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
