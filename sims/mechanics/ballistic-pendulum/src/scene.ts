// ========================================================================
// ballistic-pendulum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 천장 보(`surface`) · 줄(`constraint`) · 탄알과
// 나무토막(`body`) · 막대 칸(`region`) · 사라진 몫의 자리(`trajectory` 점선) ·
// 그대로인 높이(`trajectory` 강조 점선) · 이름표(`readout`) · 높이(`dimension`)
// 가 모두 표준 어휘로 있다.
//
// 색: 탄알 · 토막 · 줄은 먹색(같은 장치), 두 막대는 같은 보조색(둘 다 「잰 양」
// 이고 가르는 것은 이름표다). 강조색은 **그 단계에서 그대로인 양의 높이**
// 한 가지 뜻에만 쓴다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { derive, readConstants, type Reading } from './physics';
import {
  BAR_BASE_Y,
  BAR_E_X,
  BAR_FULL,
  BAR_HALF_W,
  BAR_P_X,
  BEAM_HALF_W,
  BLOCK_HALF_H,
  BLOCK_HALF_W,
  BULLET_HALF_H,
  BULLET_HALF_L,
  HANG_HALF_W,
  PIVOT_Y,
  SCENE_BOUNDS,
  SEGMENT_LABEL_MIN,
  text,
} from './schema';
import type { BallisticPendulumState } from './state';

/** 이름표를 막대에서 띄우는 거리(화면 px). */
const SIDE_LABEL_OFFSET: Vec2 = [9, 0];
/** 막대 이름을 바닥 아래로 내리는 거리(화면 px). */
const BASE_LABEL_OFFSET: Vec2 = [0, 15];
/** 「그대로」 표지를 점선 위로 올리는 거리(화면 px). */
const KEPT_LABEL_OFFSET: Vec2 = [10, -12];
/** 강조 점선이 막대 밖으로 나가는 길이(월드). */
const KEPT_OVERHANG = 0.07;
/** 높이 치수선을 토막 오른쪽으로 띄우는 거리(월드). */
const DIM_GAP = 0.15;

const rect = (cx: number, halfW: number, yFrom: number, yTo: number): Vec2[] => [
  [cx - halfW, yFrom],
  [cx + halfW, yFrom],
  [cx + halfW, yTo],
  [cx - halfW, yTo],
];

export function scene(params: {
  state: BallisticPendulumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('ballistic-pendulum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r: Reading = derive(timeline, c, params.state.blockMass);
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const bar = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const blockX = r.blockDx;
  const blockY = r.blockDy;

  // ---- 천장 보와 매단 줄 ----
  g.push({
    type: 'surface',
    id: 'beam',
    geometry: { kind: 'wall', from: [-BEAM_HALF_W, PIVOT_Y], to: [BEAM_HALF_W, PIVOT_Y] },
    material: 'solid',
    opacity: op,
  });
  // 줄 두 가닥. 나란하므로 토막은 기울지 않고 평행하게 올라간다 — 올라간 높이가
  // 토막 전체의 높이라는 것이 이 배치로 보장된다.
  ([-1, 1] as const).forEach((side, i) => {
    g.push({
      type: 'constraint',
      id: `string-${i}`,
      subtype: 'string',
      from: [side * HANG_HALF_W, PIVOT_Y],
      to: [blockX + side * HANG_HALF_W, blockY + BLOCK_HALF_H],
      opacity: op,
      style: ink,
    });
  });

  // ---- 탄알 · 나무토막 ----
  // 탄알을 먼저 선언한다. 박힌 부분이 토막 뒤로 들어가야 「박혔다」 로 읽힌다
  // (`drawOrder: 'scene'`).
  g.push({
    type: 'body',
    id: 'bullet',
    pos: [r.bulletX, blockY],
    shape: 'rect',
    size: [BULLET_HALF_L * 2, BULLET_HALF_H * 2],
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'block',
    pos: [blockX, blockY],
    shape: 'rect',
    size: [BLOCK_HALF_W * 2, BLOCK_HALF_H * 2],
    opacity: op,
    style: ink,
  });

  // ---- 올라간 높이 ----
  // 재는 단계에만 둔다. 늘 띄워 두면 오르는 동안 「높이가 자란다」 가 수의 일이
  // 되어 버린다 — 오르는 동안의 주장은 막대 쪽이다.
  if (r.measuring) {
    const dimX = blockX + BLOCK_HALF_W + DIM_GAP;
    g.push({
      type: 'trajectory',
      id: 'rest-level',
      points: [
        [-BLOCK_HALF_W, 0],
        [dimX, 0],
      ],
      width: 1,
      opacity: op * 0.7,
      style: { ...muted, lineStyle: 'dashed' },
    });
    g.push({
      type: 'dimension',
      id: 'height',
      from: [dimX, 0],
      to: [dimX, blockY],
      text: text('label.height'),
      opacity: op,
      style: muted,
    });
  }

  // ---- 운동량 막대 ----
  const pScale = BAR_FULL / r.momentum0;
  const pTop = BAR_BASE_Y + r.momentum * pScale;
  if (pTop > BAR_BASE_Y) {
    g.push({
      type: 'region',
      id: 'momentum-bar',
      points: rect(BAR_P_X, BAR_HALF_W, BAR_BASE_Y, pTop),
      fillOpacity: 0.5,
      opaque: true,
      opacity: op,
      style: bar,
    });
  }
  g.push({
    type: 'readout',
    id: 'momentum-label',
    anchor: { world: [BAR_P_X, BAR_BASE_Y], offset: BASE_LABEL_OFFSET },
    text: text('label.momentum'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'center',
    opacity: op,
    style: ink,
  });

  // ---- 에너지 막대 — 아래가 위치(빗금), 위가 운동(채움) ----
  // 둘은 **같은 대상의 다른 몫**이라 색이 같다. 가르는 것은 결이다 (S-piece).
  const eScale = BAR_FULL / r.energy0;
  const uTop = BAR_BASE_Y + r.potential * eScale;
  const kTop = uTop + r.kinetic * eScale;
  if (uTop > BAR_BASE_Y) {
    g.push({
      type: 'region',
      id: 'potential-bar',
      points: rect(BAR_E_X, BAR_HALF_W, BAR_BASE_Y, uTop),
      fill: 'hatch',
      fillOpacity: 0.5,
      opaque: true,
      opacity: op,
      style: bar,
    });
  }
  if (kTop > uTop) {
    g.push({
      type: 'region',
      id: 'kinetic-bar',
      points: rect(BAR_E_X, BAR_HALF_W, uTop, kTop),
      fillOpacity: 0.5,
      opaque: true,
      opacity: op,
      style: bar,
    });
  }
  // 사라진 몫 — 비워 둔 자리를 점선으로만 남긴다. 채우면 아직 있는 에너지로 읽힌다.
  const lostTop = BAR_BASE_Y + BAR_FULL;
  if (lostTop - kTop > 0.01) {
    g.push({
      type: 'trajectory',
      id: 'lost-outline',
      points: rect(BAR_E_X, BAR_HALF_W, kTop, lostTop),
      closed: true,
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
  }
  g.push({
    type: 'readout',
    id: 'energy-label',
    anchor: { world: [BAR_E_X, BAR_BASE_Y], offset: BASE_LABEL_OFFSET },
    text: text('label.energy'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'center',
    opacity: op,
    style: ink,
  });

  // 칸 이름표 — 칸이 글자를 담을 만큼 두꺼울 때만 붙인다. 위치 몫은 막대 왼쪽,
  // 운동 몫과 사라진 몫은 오른쪽에 둔다. 한쪽에 몰면 오르는 동안 두 칸이 비슷하게
  // 얇아지는 구간에서 이름표끼리 붙는다.
  const segments: readonly {
    id: string;
    key: 'label.kinetic' | 'label.potential' | 'label.lost';
    from: number;
    to: number;
    left: boolean;
  }[] = [
    { id: 'kinetic', key: 'label.kinetic', from: uTop, to: kTop, left: false },
    { id: 'potential', key: 'label.potential', from: BAR_BASE_Y, to: uTop, left: true },
    { id: 'lost', key: 'label.lost', from: kTop, to: lostTop, left: false },
  ];
  for (const seg of segments) {
    if (seg.to - seg.from < SEGMENT_LABEL_MIN) continue;
    g.push({
      type: 'readout',
      id: `${seg.id}-name`,
      anchor: {
        world: [BAR_E_X + (seg.left ? -BAR_HALF_W : BAR_HALF_W), (seg.from + seg.to) / 2],
        offset: seg.left ? [-SIDE_LABEL_OFFSET[0], SIDE_LABEL_OFFSET[1]] : SIDE_LABEL_OFFSET,
      },
      text: text(seg.key),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: seg.left ? 'right' : 'left',
      opacity: op,
      style: muted,
    });
  }

  // ---- 그대로인 양 ----
  // 강조색은 이 한 가지 뜻에만. 박히는 동안은 운동량 막대의 높이가, 올라가는
  // 동안은 에너지 막대의 높이가 바뀌지 않는다.
  const keptX = r.keptMomentum ? BAR_P_X : BAR_E_X;
  const keptY = r.keptMomentum ? BAR_BASE_Y + BAR_FULL : kTop;
  if (r.keptMomentum || r.keptEnergy) {
    g.push({
      type: 'trajectory',
      id: 'kept-level',
      points: [
        [keptX - BAR_HALF_W - KEPT_OVERHANG, keptY],
        [keptX + BAR_HALF_W + KEPT_OVERHANG, keptY],
      ],
      width: 2,
      opacity: op,
      style: { ...accent, lineStyle: 'dashed' },
    });
    g.push({
      type: 'readout',
      id: 'kept-name',
      anchor: { world: [keptX + BAR_HALF_W + KEPT_OVERHANG, keptY], offset: KEPT_LABEL_OFFSET },
      text: text('label.kept'),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: 'left',
      opacity: op,
      style: accent,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
