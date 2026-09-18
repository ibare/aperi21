// ========================================================================
// michelson-morley — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 돌판(`region`) · 빛줄기(`lineSet`) · 광원 · 반거울 · 거울 ·
// 망원경(`body`) · 팔 길이(`dimension`) · 처음 방향(`trajectory` 점선) · 돈 각(`sector`) ·
// 에테르 바람(`particleSystem` 꼬리) · 무늬 띠(`scalarField` 빛 세기) · 기준선(`lineSet`) ·
// 이름표(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: 장치는 먹색, 빛줄기는 보조색, 가정한 바람과 안내선은 무채색. 무늬는 테마와 무관한
// 빛의 세기로 칠한다 — 밝은 무늬가 두 테마에서 늘 밝다. 강조색은 **에테르 가설이 예측한
// 밀림** 한 가지 뜻에만 쓴다(밀린 무늬 표지 · 치수선).
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
import {
  derive,
  FRINGE_COLS,
  FRINGE_ROWS,
  fringeValues,
  readConstants,
  windStreaks,
} from './physics';
import {
  ARM,
  FRINGE_PERIOD,
  OBSERVE_Y0,
  OBSERVE_Y1,
  PREDICT_Y0,
  PREDICT_Y1,
  RIG_CENTER,
  SCENE_BOUNDS,
  SLAB_HALF,
  STRIP_X0,
  STRIP_X1,
  WIND_MAX,
  WIND_MIN,
  text,
} from './schema';
import type { MichelsonMorleyState } from './state';

// ---- 크기 · 굵기 · 띄움 (화면 px 또는 월드) ----
/** 빛줄기 굵기(화면 px). */
const BEAM_PX = 2;
/** 기준선 · 예측 표지 굵기(화면 px). */
const REF_PX = 2;
/** 안내선(처음 방향 · 띠 테두리) 굵기(화면 px). */
const GUIDE_PX = 1;
/** 이름표 글자 크기 · 기호 글자 크기(화면 px). */
const LABEL_PX = 12;
const SYMBOL_PX = 13;
/** 돌판 채움 불투명도 · 돈 각 부채꼴 채움. */
const SLAB_FILL = 0.16;
const SWEEP_FILL = 0.14;
/** 처음 방향 점선의 불투명도. */
const GHOST_OPACITY = 0.75;
/** 점선 · 부채꼴을 둘 최소 돈 몫 — 폭이 0 인 부채꼴을 선언하지 않기 위한 문턱이다(단계를 가르지 않는다). */
const GHOST_MIN_SHARE = 0.001;
/** 바람 줄무늬 알갱이 크기(화면 px) · 꼬리 길이(초) · 꼬리 길이 상한(화면 px) · 굵기. */
const WIND_DOT_PX = 1.4;
const WIND_TRAIL_S = 0.5;
const WIND_TRAIL_MAX_PX = 44;
const WIND_TRAIL_PX = 1.2;
/** 바람 이름표 옆 화살표의 길이(월드)와 자리. */
const WIND_ARROW_LEN = 0.8;
const WIND_ARROW_TIP_X = -5.45;
const WIND_LABEL_Y = 2.12;
/** 바람 이름표를 화살표 꼬리에서 띄우는 거리(화면 px). */
const WIND_LABEL_GAP: Vec2 = [8, 0];

// ---- 장치 치수 (월드, 돌판 좌표) ----
const SOURCE_R = 0.1;
const SPLITTER_SIZE: Vec2 = [0.44, 0.05];
const MIRROR_LONG = 0.46;
const MIRROR_THIN = 0.06;
const SCOPE_SIZE: Vec2 = [0.2, 0.32];
/** 망원경을 팔 끝에서 조금 더 내리는 거리. */
const SCOPE_DROP = 0.05;
/** 거울 이름표를 거울 바깥으로 띄우는 거리. */
const MIRROR_LABEL_OUT = 0.3;
/** 팔 길이 치수선을 M₁ 팔 아래로 내리는 거리. */
const ARM_DIM_DROP = 0.32;
/** 돈 각 부채꼴의 반지름 · 각 글자의 반지름. */
const SWEEP_R = ARM * 0.62;
const SWEEP_LABEL_R = ARM * 0.62 + 0.26;

// ---- 무늬 띠 (월드) ----
/** 기준선이 띠 위로 · 아래로 삐져나오는 길이. 다크에서 먹색 기준선이 밝은 무늬와 같은 톤이라 띠 밖 꼬투리로 읽힌다. */
const REF_OVER_TOP = 0.14;
const REF_OVER_BOTTOM = 0.1;
/** 예측 무늬 표지의 길이(띠 위). */
const MARK_LEN = 0.2;
/** 예측 밀림 치수선의 높이(띠 위). */
const SHIFT_DIM_Y = 0.36;
/** 띠 이름표를 띠 아래로 내리는 거리(화면 px). */
const STRIP_LABEL_OFFSET: Vec2 = [0, 16];
/** 「제자리」 글자를 띠 위로 올리는 거리(화면 px). */
const STILL_LABEL_OFFSET: Vec2 = [0, -18];

const STRIP_XC = (STRIP_X0 + STRIP_X1) / 2;

function rotator(angle: number): (p: Vec2) => Vec2 {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  return ([x, y]) => [RIG_CENTER[0] + ca * x - sa * y, RIG_CENTER[1] + sa * x + ca * y];
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: MichelsonMorleyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('michelson-morley: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const rot = rotator(r.angle);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const beam = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ================= 왼쪽 — 위에서 본 간섭계 =================

  // ---- 돌판 ----
  g.push({
    type: 'region',
    id: 'slab',
    points: rect(-SLAB_HALF, -SLAB_HALF, SLAB_HALF, SLAB_HALF).map(rot),
    fillOpacity: SLAB_FILL,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: muted,
  });

  // ---- 돈 각 — 처음 M₁ 방향(점선)에서 지금 M₁ 방향까지 쓸고 간 부채꼴 ----
  const turnedShare = r.turnAngle === 0 ? 0 : r.angle / r.turnAngle;
  if (turnedShare > GHOST_MIN_SHARE) {
    g.push({
      type: 'trajectory',
      id: 'start-direction',
      points: [
        [RIG_CENTER[0], RIG_CENTER[1]],
        [RIG_CENTER[0] + SLAB_HALF, RIG_CENTER[1]],
      ],
      width: GUIDE_PX,
      opacity: GHOST_OPACITY * r.turnIn,
      style: { ...muted, lineStyle: 'dashed' },
    });
    g.push({
      type: 'sector',
      id: 'sweep',
      center: [RIG_CENTER[0], RIG_CENTER[1]],
      radius: SWEEP_R,
      from: 0,
      to: r.angle,
      fillOpacity: SWEEP_FILL,
      rimWidth: GUIDE_PX,
      style: muted,
    });
  }
  if (r.settled > 0) {
    const mid = r.turnAngle / 2;
    g.push({
      type: 'readout',
      id: 'turned',
      anchor: {
        world: [
          RIG_CENTER[0] + Math.cos(mid) * SWEEP_LABEL_R,
          RIG_CENTER[1] + Math.sin(mid) * SWEEP_LABEL_R,
        ],
      },
      text: text('label.turned'),
      vars: { deg: String(c.turnDegrees) },
      chip: true,
      font: 'mono',
      fontSize: LABEL_PX,
      style: muted,
    });
  }

  // ---- 빛줄기 — 광원 → 반거울 → 두 거울 → 반거울 → 망원경 ----
  g.push({
    type: 'lineSet',
    id: 'beams',
    lines: [
      [rot([-ARM, 0]), rot([0, 0])],
      [rot([0, 0]), rot([ARM, 0])],
      [rot([0, 0]), rot([0, ARM])],
      [rot([0, 0]), rot([0, -ARM])],
    ],
    width: BEAM_PX,
    style: beam,
  });

  // ---- 장치 ----
  g.push({
    type: 'body',
    id: 'source',
    pos: rot([-ARM, 0]),
    shape: 'circle',
    size: SOURCE_R,
    glow: false,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'splitter',
    pos: rot([0, 0]),
    shape: 'rect',
    size: SPLITTER_SIZE,
    orientation: Math.PI / 4 + r.angle,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'mirror-1',
    pos: rot([ARM, 0]),
    shape: 'rect',
    size: [MIRROR_THIN, MIRROR_LONG],
    orientation: r.angle,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'mirror-2',
    pos: rot([0, ARM]),
    shape: 'rect',
    size: [MIRROR_LONG, MIRROR_THIN],
    orientation: r.angle,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'scope',
    pos: rot([0, -ARM - SCOPE_DROP]),
    shape: 'rect',
    size: SCOPE_SIZE,
    orientation: r.angle,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'mirror-1-name',
    anchor: { world: rot([ARM + MIRROR_LABEL_OUT, 0]) },
    text: text('label.mirror1'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'mirror-2-name',
    anchor: { world: rot([0, ARM + MIRROR_LABEL_OUT]) },
    text: text('label.mirror2'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    style: ink,
  });

  // ---- 팔 길이 — M₁ 팔을 따라 잰다. 그림의 팔은 축척이 아니므로 값은 글자가 말한다 ----
  // 돌기 앞머리(`turnIn`) 동안 걷는다 — 기울어진 치수선 글자가 거울 이름표와 겹치고,
  // 길이는 처음 방향에서 이미 말했다. 다음 주기 `rest` 에서 다시 나온다.
  const armLabelOpacity = 1 - r.turnIn;
  if (armLabelOpacity > 0) g.push({
    type: 'dimension',
    id: 'arm-length',
    opacity: armLabelOpacity,
    from: rot([0, -ARM_DIM_DROP]),
    to: rot([ARM, -ARM_DIM_DROP]),
    text: text('label.arm'),
    vars: { l: String(c.armLengthM) },
    style: muted,
  });

  // ---- 가정한 에테르 바람 — 장치 위를 가로질러 흐른다 ----
  const wind = windStreaks(timeline.t, c);
  g.push({
    type: 'particleSystem',
    id: 'ether-wind',
    positions: wind.positions,
    velocities: wind.velocities,
    opacities: wind.opacities,
    sizes: WIND_DOT_PX,
    trail: true,
    trailStyle: { seconds: WIND_TRAIL_S, maxLength: WIND_TRAIL_MAX_PX, width: WIND_TRAIL_PX, opacity: 1 },
    clip: { min: [WIND_MIN[0], WIND_MIN[1]], max: [WIND_MAX[0], WIND_MAX[1]] },
    style: muted,
  });
  g.push({
    type: 'vector',
    id: 'wind-arrow',
    from: [WIND_ARROW_TIP_X + WIND_ARROW_LEN, WIND_LABEL_Y],
    delta: [-WIND_ARROW_LEN, 0],
    width: GUIDE_PX,
    style: { ...muted, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'wind-name',
    anchor: { world: [WIND_ARROW_TIP_X + WIND_ARROW_LEN, WIND_LABEL_Y], offset: WIND_LABEL_GAP },
    text: text('label.wind'),
    vars: { v: String(c.etherSpeedKms) },
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: muted,
  });

  // ================= 오른쪽 — 망원경 속 무늬 띠 둘 =================

  const strips = [
    { id: 'predicted', y0: PREDICT_Y0, y1: PREDICT_Y1, shift: r.predictedShift, name: 'label.predicted' },
    { id: 'observed', y0: OBSERVE_Y0, y1: OBSERVE_Y1, shift: r.observedShift, name: 'label.observed' },
  ] as const;
  for (const s of strips) {
    g.push({
      type: 'scalarField',
      id: `${s.id}-fringes`,
      min: [STRIP_X0, s.y0],
      max: [STRIP_X1, s.y1],
      cols: FRINGE_COLS,
      rows: FRINGE_ROWS,
      values: fringeValues(s.shift),
      range: [0, 1],
      colors: 'light',
    });
    g.push({
      type: 'trajectory',
      id: `${s.id}-frame`,
      points: rect(STRIP_X0, s.y0, STRIP_X1, s.y1),
      closed: true,
      width: GUIDE_PX,
      style: muted,
    });
    g.push({
      type: 'readout',
      id: `${s.id}-name`,
      anchor: { world: [STRIP_X0, s.y0], offset: STRIP_LABEL_OFFSET },
      text: text(s.name),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: LABEL_PX,
      style: ink,
    });
  }

  // 기준선 — 처음 밝은 무늬가 있던 자리. 두 띠를 같은 x 에서 꿴다.
  g.push({
    type: 'lineSet',
    id: 'reference',
    lines: strips.map((s) => [
      [STRIP_XC, s.y0 - REF_OVER_BOTTOM] as Vec2,
      [STRIP_XC, s.y1 + REF_OVER_TOP] as Vec2,
    ]),
    width: REF_PX,
    style: ink,
  });

  // 예측 무늬 표지 — 에테르 가설이 말하는 밝은 무늬의 자리. 강조색의 유일한 뜻.
  const markX = STRIP_XC + r.predictedShift * FRINGE_PERIOD;
  g.push({
    type: 'trajectory',
    id: 'predicted-mark',
    points: [
      [markX, PREDICT_Y0],
      [markX, PREDICT_Y1 + MARK_LEN],
    ],
    width: REF_PX,
    style: accent,
  });

  if (r.settled > 0) {
    g.push({
      type: 'dimension',
      id: 'predicted-shift',
      from: [STRIP_XC, PREDICT_Y1 + SHIFT_DIM_Y],
      to: [markX, PREDICT_Y1 + SHIFT_DIM_Y],
      text: text('label.shift'),
      vars: { n: String(c.predictedShiftLabel) },
      style: accent,
    });
    g.push({
      type: 'readout',
      id: 'observed-still',
      anchor: { world: [STRIP_XC, OBSERVE_Y1], offset: STILL_LABEL_OFFSET },
      text: text('label.still'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
