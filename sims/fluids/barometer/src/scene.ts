// ========================================================================
// barometer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 수은(region) · 유리관과
// 접시(lineSet) · 기압 화살표(vector) · 눈금자(scale linear) · 이름표(readout)가 모두
// 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 수은은 먹색(접시와 기둥이 같은 수은이라 같은 색), 유리는 muted,
// 기압 화살표와 그 기호는 primary. 강조색은 눈금자(`scale` 이 눈금 숫자에 쓴다)의
// 「기둥 높이를 읽는 자리」 한 뜻에만 쓰인다.
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
import { readColumn, readConstants } from './physics';
import {
  AIR_ARROWS_X,
  AIR_ARROW_AT_P0,
  DISH_FLOOR,
  DISH_HALF,
  DISH_RIM,
  RULER_LENGTH,
  RULER_TICKS,
  RULER_X,
  SCENE_BOUNDS,
  TUBE_BOTTOM,
  TUBE_HALF,
  TUBE_INNER_HALF,
  TUBE_TOP,
  text,
} from './schema';
import type { BarometerState } from './state';

/** 수은 채움 짙기. 짙은 금속이라 넉넉히, 그래도 선보다 옅게. */
const MERCURY_FILL = 0.55;
/** 유리 · 접시 선 굵기(화면 px). */
const GLASS_WIDTH = 2;
/** p₀ 화살표 잔상의 짙기와 굵기(화면 px). 살아 있는 화살표보다 옅고 가늘다. */
const GHOST_OPACITY = 0.4;
const GHOST_WIDTH = 2;
/** 잔상 기호 `p₀` 의 짙기. 잔상 선보다는 또렷해야 읽힌다. */
const GHOST_LABEL_OPACITY = 0.7;
/** 기호 · 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 기압 기호를 가장 왼쪽 화살표에서 왼쪽으로 띄우는 거리(화면 px). */
const PRESSURE_LABEL_GAP = 14;
/** 진공 이름표를 관 벽에서 왼쪽으로 띄우는 거리(화면 px). */
const VACUUM_LABEL_GAP = 8;
/** 진공 이름표를 켜는 빈 곳의 최소 높이(cm). 그보다 좁으면 글자가 빈 곳을 벗어난다. */
const VACUUM_LABEL_MIN = 8;
/** 눈금자 단위를 윗끝에서 띄우는 거리(화면 px). */
const UNIT_GAP = 10;

export function scene(params: {
  state: BarometerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('barometer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const col = readColumn(timeline, c);
  const h = col.height;
  const out: Primitive[] = [];

  // ---- 수은 — 접시에 담긴 것과 관 속 기둥은 같은 수은이다 ----
  out.push({
    type: 'region',
    id: 'mercury-pool',
    points: [
      [-DISH_HALF, DISH_FLOOR],
      [DISH_HALF, DISH_FLOOR],
      [DISH_HALF, 0],
      [-DISH_HALF, 0],
    ],
    fillOpacity: MERCURY_FILL,
    opaque: true,
    outline: [[2, 3]],
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'region',
    id: 'mercury-column',
    points: [
      [-TUBE_INNER_HALF, TUBE_BOTTOM],
      [TUBE_INNER_HALF, TUBE_BOTTOM],
      [TUBE_INNER_HALF, h],
      [-TUBE_INNER_HALF, h],
    ],
    fillOpacity: MERCURY_FILL,
    opaque: true,
    outline: [[2, 3]],
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 유리관(위가 막혔다)과 접시 ----
  out.push({
    type: 'lineSet',
    id: 'glass',
    lines: [
      [
        [-TUBE_HALF, TUBE_BOTTOM],
        [-TUBE_HALF, TUBE_TOP],
        [TUBE_HALF, TUBE_TOP],
        [TUBE_HALF, TUBE_BOTTOM],
      ],
      [
        [-DISH_HALF, DISH_RIM],
        [-DISH_HALF, DISH_FLOOR],
        [DISH_HALF, DISH_FLOOR],
        [DISH_HALF, DISH_RIM],
      ],
    ],
    width: GLASS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 눈금자 — 접시 수면(0)에서 잰 세로 높이 ----
  // 숫자는 선언된 두 높이만 붙인다. 0 은 수은 면에 걸쳐 읽히지 않아 눈금선만 두고 — 자가
  // 수면에서 시작하는 것으로 0 을 말한다. 표식(▶)이 기둥 윗면 높이를 따라간다.
  out.push({
    type: 'scale',
    id: 'ruler',
    shape: 'linear',
    pos: [RULER_X, 0],
    direction: [0, 1],
    size: RULER_LENGTH,
    range: [0, RULER_LENGTH],
    value: h,
    tickAt: [...RULER_TICKS, c.columnLow, c.columnHigh],
    labelAt: [c.columnLow, c.columnHigh],
    digits: 0,
  });
  out.push({
    type: 'readout',
    id: 'ruler-unit',
    anchor: { world: [RULER_X, RULER_LENGTH], offset: [0, -UNIT_GAP] },
    text: text('label.unit'),
    chip: false,
    font: 'mono',
    fontSize: LABEL_PX - 2,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 진공 — 기둥 위 빈 곳 ----
  const vacuum = TUBE_TOP - h;
  if (vacuum >= VACUUM_LABEL_MIN) {
    out.push({
      type: 'readout',
      id: 'vacuum-label',
      anchor: { world: [-TUBE_HALF, (h + TUBE_TOP) / 2], offset: [-VACUUM_LABEL_GAP, 0] },
      text: text('label.vacuum'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX - 1,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 기압 — 바깥 공기가 열린 수은 면을 내리누른다 ----
  // 길이가 곧 기압이다. p₀ 에서 벗어나 있는 동안 p₀ 의 길이를 잔상으로 남겨 견주게 한다.
  const len = AIR_ARROW_AT_P0 * col.pressureRatio;
  AIR_ARROWS_X.forEach((x, i) => {
    if (col.lowered) {
      out.push({
        type: 'vector',
        id: `air-ghost-${i}`,
        from: [x, AIR_ARROW_AT_P0] as Vec2,
        delta: [0, -AIR_ARROW_AT_P0] as Vec2,
        width: GHOST_WIDTH,
        opacity: GHOST_OPACITY,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'vector',
      id: `air-${i}`,
      from: [x, len] as Vec2,
      delta: [0, -len] as Vec2,
      outline: 'background',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });

  // 기호 — 살아 있는 화살표 곁에 `p`, 잔상 윗끝에 `p₀`.
  const leftX = Math.min(...AIR_ARROWS_X);
  out.push({
    type: 'readout',
    id: 'pressure-label',
    anchor: { world: [leftX, len / 2], offset: [-PRESSURE_LABEL_GAP, 0] },
    text: text('label.pressure'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    italic: true,
    align: 'right',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  if (col.lowered) {
    out.push({
      type: 'readout',
      id: 'pressure-p0-label',
      anchor: { world: [leftX, AIR_ARROW_AT_P0], offset: [-PRESSURE_LABEL_GAP, 0] },
      text: text('label.pressureP0'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      italic: true,
      align: 'right',
      opacity: GHOST_LABEL_OPACITY,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
