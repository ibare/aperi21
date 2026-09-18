// ========================================================================
// manometer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 기체 · 액체(region) ·
// 관 벽(lineSet) · 압력 차 화살표(vector) · 높이 차 치수선(dimension) · 기준선
// (lineSet) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 두 U자관은 가운데 기체 통을 사이에 두고 거울상으로 놓인다 — 기체 쪽 팔이 안쪽,
// 열린 팔이 바깥쪽이다. 오른쪽(수은) 관의 모양을 한 번 계산하고 x 부호만 뒤집어
// 왼쪽(물) 관을 얻는다.
//
// 색은 뜻마다 하나다 — 물은 secondary, 수은은 먹색(ink) 면, 기체는 옅은 muted,
// 관 벽은 ink, 압력 차 화살표는 primary, **강조색은 「높이 차」 한 가지 뜻에만**
// (치수선). 기준선 · 이름표는 muted.
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
import { readConstants, readManometer } from './physics';
import {
  AIR_LABEL_Y,
  ARROW_MAX,
  BEND_RADIUS,
  BRACKET_X,
  GAS_ARM_X,
  LIQUID_LABEL_Y,
  OPEN_ARM_X,
  OPEN_TOP,
  PIPE_BOTTOM,
  PIPE_TOP,
  REST_LEVEL,
  SCENE_BOUNDS,
  TANK_BOTTOM,
  TANK_HALF,
  TANK_TOP,
  TUBE_HALF,
  text,
  type ManometerMessageKey,
} from './schema';
import type { ManometerState } from './state';

/** 굽이 반원을 나누는 점 수. 곡선 어휘가 없어 점으로 표본한다 (G28). */
const ARC_SAMPLES = 28;
/** 관 벽 굵기(화면 px). 유리관의 윤곽이라 액면 · 기준선보다 굵다. */
const WALL_WIDTH = 2;
/** 기준선 굵기 · 짙기. 재는 선이지 그림의 일부가 아니라 가장 가늘고 옅게. */
const GUIDE_WIDTH = 1;
const GUIDE_OPACITY = 0.6;
/** 기준선이 치수선 너머로 나가는 길이(m). 치수선의 끝점이 선 위에 앉게 한다. */
const GUIDE_OVERHANG = 0.012;
/** 면의 짙기. 기체는 비어 보일 만큼 옅게, 수은은 금속처럼 짙게. */
const GAS_FILL = 0.14;
const WATER_FILL = 0.5;
const MERCURY_FILL = 0.6;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 이 높이 차(m) 아래로는 치수선을 긋지 않는다 — 두 끝점이 한 점에 겹친다. */
const MIN_BRACKET = 0.0005;

/** 오른쪽(+x) 기준의 점을 한쪽으로 옮긴다. `side` 가 −1 이면 거울상. */
function mirror(points: readonly Vec2[], side: number): Vec2[] {
  return points.map(([x, y]) => [x * side, y] as Vec2);
}

/** 굽이의 반원(아래쪽) 표본. 중심 (cx, 0), 각 `from` → `to`. */
function arc(cx: number, r: number, from: number, to: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const a = from + ((to - from) * i) / ARC_SAMPLES;
    out.push([cx + r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

/** 오른쪽 U자관 굽이 중심의 x. 두 팔 한가운데다. */
const BEND_CX = GAS_ARM_X + BEND_RADIUS;
const R_OUT = BEND_RADIUS + TUBE_HALF;
const R_IN = BEND_RADIUS - TUBE_HALF;

/**
 * 관 속 액체. 기체 쪽 팔의 액면 `gasLevel` 에서 내려가 굽이를 돌아 열린 팔의
 * 액면 `openLevel` 까지 — 구멍 없는 U자 다각형 하나다.
 */
function liquidPolygon(gasLevel: number, openLevel: number): Vec2[] {
  const gIn = GAS_ARM_X - TUBE_HALF;
  const gOut = GAS_ARM_X + TUBE_HALF;
  const oIn = OPEN_ARM_X - TUBE_HALF;
  const oOut = OPEN_ARM_X + TUBE_HALF;
  return [
    [gIn, gasLevel],
    [gIn, 0],
    ...arc(BEND_CX, R_OUT, Math.PI, 2 * Math.PI),
    [oOut, 0],
    [oOut, openLevel],
    [oIn, openLevel],
    [oIn, 0],
    ...arc(BEND_CX, R_IN, 2 * Math.PI, Math.PI),
    [gOut, 0],
    [gOut, gasLevel],
  ];
}

/**
 * 관 벽 두 줄. 바깥 줄은 기체 통에서 가로 관 아랫벽을 따라 나와 기체 쪽 팔의 안쪽 벽을
 * 타고 내려가 굽이 바깥을 돌아 열린 팔 바깥 벽으로 올라간다. 안쪽 줄은 가로 관 윗벽에서
 * 같은 길을 굽이 안쪽으로 돈다.
 */
function wallLines(): Vec2[][] {
  const gIn = GAS_ARM_X - TUBE_HALF;
  const gOut = GAS_ARM_X + TUBE_HALF;
  const oIn = OPEN_ARM_X - TUBE_HALF;
  const oOut = OPEN_ARM_X + TUBE_HALF;
  return [
    [
      [TANK_HALF, PIPE_BOTTOM],
      [gIn, PIPE_BOTTOM],
      [gIn, 0],
      ...arc(BEND_CX, R_OUT, Math.PI, 2 * Math.PI),
      [oOut, 0],
      [oOut, OPEN_TOP],
    ],
    [
      [TANK_HALF, PIPE_TOP],
      [gOut, PIPE_TOP],
      [gOut, 0],
      ...arc(BEND_CX, R_IN, Math.PI, 2 * Math.PI),
      [oIn, 0],
      [oIn, OPEN_TOP],
    ],
  ];
}

/** 기체 쪽 한 갈래 — 통 옆구리에서 가로 관을 지나 팔을 타고 액면까지. */
function gasBranch(gasLevel: number): Vec2[] {
  const gIn = GAS_ARM_X - TUBE_HALF;
  const gOut = GAS_ARM_X + TUBE_HALF;
  return [
    [TANK_HALF, PIPE_BOTTOM],
    [gIn, PIPE_BOTTOM],
    [gIn, gasLevel],
    [gOut, gasLevel],
    [gOut, PIPE_TOP],
    [TANK_HALF, PIPE_TOP],
  ];
}

interface Tube {
  side: number;
  /** 이 관의 높이 차(m). */
  h: number;
  liquidId: string;
  colorRole: 'secondary' | 'ink';
  fill: number;
  labelKey: ManometerMessageKey;
}

export function scene(params: {
  state: ManometerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('manometer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const m = readManometer(timeline, c);
  const out: Primitive[] = [];

  const tubes: Tube[] = [
    { side: -1, h: m.hLight, liquidId: 'water', colorRole: 'secondary', fill: WATER_FILL, labelKey: 'label.water' },
    { side: 1, h: m.hHeavy, liquidId: 'mercury', colorRole: 'ink', fill: MERCURY_FILL, labelKey: 'label.mercury' },
  ];
  // 기체 쪽 액면이 h/2 내려가고 열린 쪽이 h/2 올라간다 — 두 팔의 굵기가 같다.
  const levels = tubes.map((t) => ({ gas: REST_LEVEL - t.h / 2, open: REST_LEVEL + t.h / 2 }));

  // ---- 기체 ----
  // 통과 두 갈래. 겹치는 이음에서 짙어지지 않게 불투명하게 깐다 — 같은 기체다.
  out.push({
    type: 'region',
    id: 'gas-tank',
    points: [
      [-TANK_HALF, TANK_BOTTOM],
      [TANK_HALF, TANK_BOTTOM],
      [TANK_HALF, TANK_TOP],
      [-TANK_HALF, TANK_TOP],
    ],
    fillOpacity: GAS_FILL,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  tubes.forEach((t, i) => {
    out.push({
      type: 'region',
      id: `gas-${t.liquidId}`,
      points: mirror(gasBranch(levels[i]!.gas), t.side),
      fillOpacity: GAS_FILL,
      opaque: true,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 액체 ----
  tubes.forEach((t, i) => {
    out.push({
      type: 'region',
      id: t.liquidId,
      points: mirror(liquidPolygon(levels[i]!.gas, levels[i]!.open), t.side),
      fillOpacity: t.fill,
      opaque: true,
      style: { colorRole: t.colorRole, emphasis: 'strong' },
    });
  });

  // ---- 관 벽 ----
  // `surface` arc 는 렌더러가 없어 굽이를 그리지 못한다 — 곧은 벽과 굽이를 한 줄로
  // 이어 `lineSet` 으로 긋는다(새 부족, NOTES).
  const walls = wallLines();
  out.push({
    type: 'lineSet',
    id: 'walls',
    lines: [
      ...walls.map((l) => mirror(l, -1)),
      ...walls.map((l) => mirror(l, 1)),
      // 기체 통 — 옆구리의 가로 관 자리만 비운다.
      [
        [TANK_HALF, PIPE_BOTTOM],
        [TANK_HALF, TANK_BOTTOM],
        [-TANK_HALF, TANK_BOTTOM],
        [-TANK_HALF, PIPE_BOTTOM],
      ],
      [
        [TANK_HALF, PIPE_TOP],
        [TANK_HALF, TANK_TOP],
        [-TANK_HALF, TANK_TOP],
        [-TANK_HALF, PIPE_TOP],
      ],
    ],
    width: WALL_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  tubes.forEach((t, i) => {
    const { gas, open } = levels[i]!;
    const s = t.side;
    const visible = t.h > MIN_BRACKET;

    // ---- 기준선 ----
    // 기체 쪽 액면 높이를 열린 팔 너머 치수선까지 끌어온다. 두 액면의 어긋남을 같은
    // 자리(치수선)에서 재게 하는 선이다.
    if (visible) {
      out.push({
        type: 'lineSet',
        id: `guide-${t.liquidId}`,
        lines: [
          mirror(
            [
              [GAS_ARM_X - TUBE_HALF, gas],
              [BRACKET_X + GUIDE_OVERHANG, gas],
            ],
            s,
          ),
          mirror(
            [
              [OPEN_ARM_X - TUBE_HALF, open],
              [BRACKET_X + GUIDE_OVERHANG, open],
            ],
            s,
          ),
        ],
        width: GUIDE_WIDTH,
        opacity: GUIDE_OPACITY * m.fraction,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }

    // ---- 압력 차 화살표 ----
    // 기체 쪽 액면을 누르는 몫(바깥 공기보다 더 누르는 만큼). 두 관에서 **같은 길이**다 —
    // 같은 압력 차가 다른 높이 차를 만든다는 것을 이 둘이 보증한다.
    const len = ARROW_MAX * m.fraction;
    out.push({
      type: 'vector',
      id: `push-${t.liquidId}`,
      from: [s * GAS_ARM_X, gas + len],
      delta: [0, -len],
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // ---- 높이 차 ----
    if (visible) {
      out.push({
        type: 'dimension',
        id: `head-${t.liquidId}`,
        from: [s * BRACKET_X, gas],
        to: [s * BRACKET_X, open],
        opacity: m.fraction,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }

    // ---- 이름표 ----
    out.push(
      {
        type: 'readout',
        id: `label-${t.liquidId}`,
        anchor: { world: [s * BEND_CX, LIQUID_LABEL_Y] },
        text: text(t.labelKey),
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'center',
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
      {
        type: 'readout',
        id: `label-air-${t.liquidId}`,
        anchor: { world: [s * OPEN_ARM_X, AIR_LABEL_Y] },
        text: text('label.air'),
        chip: false,
        font: 'text',
        fontSize: LABEL_PX,
        align: 'center',
        style: { colorRole: 'muted', emphasis: 'strong' },
      },
    );
  });

  out.push({
    type: 'readout',
    id: 'label-gas',
    anchor: { world: [0, (TANK_BOTTOM + TANK_TOP) / 2] },
    text: text('label.gas'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
