// ========================================================================
// specific-heat — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
//   세 레인           왼쪽부터 물 · 알루미늄 · 구리. 레인끼리 다른 것은 비열뿐이다
//   가열기           body(rect) + lineSet 코일 — 셋이 같은 모양, 같은 순간 켜지고 꺼진다
//   들어가는 열       body(circle) — 알갱이. 세 레인이 같은 간격 · 같은 자리로 오른다
//   덩이             body(rect) — 셋이 같은 크기 · 같은 색. 안에 같은 질량 글자
//   온도 막대         region 넷 — 관 바탕 · 처음 온도까지 · 오른 몫 · 관 둘레
//   처음 온도 선      trajectory(점선) — 세 막대가 오른 몫을 재는 같은 바닥
//   캡션             BundleSchema.caption 슬롯
//
// ---- 색은 뜻마다 하나다 ----
//   accent  온도의 높이 — 세 막대가 같은 색이다. 물질을 색으로 가르지 않는다 (S-piece)
//   primary 들어가는 열 — 알갱이 · 켜진 코일 · 받은 열 글자
//   ink     물질 이름
//   muted   물건과 자 — 덩이 · 가열기 · 관 둘레 · 처음 온도 선 · 글자
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
  departTime,
  hash01,
  heatShare,
  heatTime,
  heaterLevel,
  readConstants,
  sceneOpacity,
  tempAt,
  type SpecificHeatConstants,
} from './physics';
import {
  BLOCK_BOTTOM,
  BLOCK_DX,
  BLOCK_SIZE,
  GRAIN_FROM_Y,
  GRAIN_SPREAD,
  GRAIN_TO_Y,
  HEATER_SIZE,
  LANE_GAP,
  NAME_Y,
  SCALE_BOTTOM,
  SCALE_TOP,
  SCENE_BOUNDS,
  SPEC_Y,
  TUBE_DX,
  TUBE_WIDTH,
  text,
  type SpecificHeatMessageKey,
} from './schema';
import type { SpecificHeatState } from './state';

/** 물질 이름 글자 크기(화면 px). */
const NAME_PX = 14;
/** 비열 · 질량 · 온도 · 받은 열 글자 크기(화면 px). */
const VALUE_PX = 12;
/** 처음 온도 글자를 관에서 띄우는 거리(화면 px). */
const LABEL_GAP = 6;
/** 코일 · 처음 온도 선 굵기(화면 px). 관 둘레(`region` outline)는 굵기 필드가 없어 테마 굵기다. */
const COIL_WIDTH = 2;
const START_LINE_WIDTH = 1.5;
/** 처음 온도 선이 관 양옆으로 삐져나오는 길이(월드). */
const START_LINE_OVERHANG = 0.12;
/** 관 바탕의 옅기 — 빈 관이 비어 보이게 한다. */
const TUBE_BG = 0.06;
/** 처음 온도까지의 채움 짙기(세 막대가 같다)와, 오른 몫의 채움 짙기. */
const BASE_FILL = 0.35;
const RISE_FILL = 0.9;
/** 덩이 · 가열기의 불투명도. 물건이라 옅다. */
const BLOCK_OPACITY = 0.9;
/** 알갱이 반지름(월드). */
const GRAIN_R = 0.055;
/** 질량 글자가 놓이는 높이 — 덩이 바닥에서 덩이 높이에 대한 몫. 알갱이가 닿는 자리 위다. */
const MASS_LABEL_AT = 0.62;
/** 코일 지그재그의 꺾임 수 · 가열기 폭에 대한 몫 · 높이(월드). */
const COIL_TURNS = 8;
const COIL_SPAN = 0.8;
const COIL_AMP = 0.07;

const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const BLOCK = { colorRole: 'muted', emphasis: 'subtle' } as const;
const HEAT_LEVEL = { colorRole: 'accent', emphasis: 'strong' } as const;
const HEAT_FLOW = { colorRole: 'primary', emphasis: 'strong' } as const;
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

/** 레인 — 왼쪽부터. 레인 수와 순서는 코드에 있다(장부 G105), 비열은 스테이지 상수다. */
interface Lane {
  id: 'water' | 'aluminum' | 'copper';
  name: SpecificHeatMessageKey;
  spec: (c: SpecificHeatConstants) => number;
}

const LANES: readonly Lane[] = [
  { id: 'water', name: 'label.water', spec: (c) => c.cWater },
  { id: 'aluminum', name: 'label.aluminum', spec: (c) => c.cAluminum },
  { id: 'copper', name: 'label.copper', spec: (c) => c.cCopper },
];

/** 온도(℃) → 막대 높이(월드 y). 세 막대가 같은 눈금이다. */
function yOf(temp: number, c: SpecificHeatConstants): number {
  const f = (temp - c.axisMin) / (c.axisMax - c.axisMin);
  return SCALE_BOTTOM + f * (SCALE_TOP - SCALE_BOTTOM);
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 가열기 윗면 위 코일 지그재그. */
function coil(cx: number): Vec2[] {
  const half = (HEATER_SIZE[0] * COIL_SPAN) / 2;
  const y = -HEATER_SIZE[1] / 2;
  const pts: Vec2[] = [];
  for (let i = 0; i <= COIL_TURNS; i++) {
    const x = cx - half + (2 * half * i) / COIL_TURNS;
    pts.push([x, y + (i % 2 === 0 ? -COIL_AMP : COIL_AMP)]);
  }
  return pts;
}

export function scene(params: {
  state: SpecificHeatState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('specific-heat: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(tl);
  const share = heatShare(tl);
  const level = heaterLevel(tl);
  const s = heatTime(tl);
  const heatDuration = tl.duration('heat');
  const heated = tl.at('off') >= 1;
  const out: Primitive[] = [];

  LANES.forEach((lane, i) => {
    const cx = (i - 1) * LANE_GAP;
    const bx = cx + BLOCK_DX;
    const [bw, bh] = BLOCK_SIZE;

    // ---- 가열기 ----
    // 셋이 같은 모양이다. 코일은 늘 먹선으로 있고, 켜진 만큼 열 색 코일이 위에 겹친다.
    out.push({
      type: 'body',
      id: `heater-${lane.id}`,
      shape: 'rect',
      pos: [bx, -HEATER_SIZE[1] / 2],
      size: HEATER_SIZE,
      opacity: alpha * BLOCK_OPACITY,
      style: BLOCK,
    });
    out.push({
      type: 'lineSet',
      id: `coil-${lane.id}`,
      lines: [coil(bx)],
      width: COIL_WIDTH,
      opacity: alpha,
      style: MUTED,
    });
    if (level > 0) {
      out.push({
        type: 'lineSet',
        id: `coil-on-${lane.id}`,
        lines: [coil(bx)],
        width: COIL_WIDTH,
        opacity: alpha * level,
        style: HEAT_FLOW,
      });
    }

    // ---- 덩이 ----
    out.push({
      type: 'body',
      id: `block-${lane.id}`,
      shape: 'rect',
      pos: [bx, BLOCK_BOTTOM + bh / 2],
      size: BLOCK_SIZE,
      opacity: alpha * BLOCK_OPACITY,
      style: BLOCK,
    });
    out.push({
      type: 'readout',
      id: `mass-${lane.id}`,
      anchor: { world: [bx, BLOCK_BOTTOM + bh * MASS_LABEL_AT] },
      text: text('label.mass'),
      vars: { m: state.massText },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      opacity: alpha,
      style: MUTED,
    });

    // ---- 들어가는 열 알갱이 ----
    // 같은 간격으로 가열기를 떠나 틈을 건너 덩이 안으로 든다. 세 레인이 같은 시드라
    // 같은 순간 같은 자리에 있다 — 들어가는 열이 같다는 것이 모양으로 보인다.
    if (s > 0 && s < heatDuration) {
      for (let n = 0; n < c.grains; n++) {
        const p = (s - departTime(n, heatDuration, c)) / c.grainTravel;
        if (p < 0 || p >= 1) continue;
        const half = (bw * GRAIN_SPREAD) / 2;
        const ax = bx - half + hash01(c.seed, n, 0) * 2 * half;
        const tx = bx - half + hash01(c.seed, n, 1) * 2 * half;
        out.push({
          type: 'body',
          id: `grain-${lane.id}-${n}`,
          shape: 'circle',
          size: GRAIN_R,
          pos: [ax + (tx - ax) * p, GRAIN_FROM_Y + (GRAIN_TO_Y - GRAIN_FROM_Y) * p],
          glow: false,
          opacity: alpha,
          style: HEAT_FLOW,
        });
      }
    }

    // ---- 받은 열 ----
    // 가열기를 끈 뒤에만, 가열기 윗면과 덩이 바닥 사이 틈 가운데에 — 세 덩이 모두 같은 선언값이다.
    if (heated) {
      out.push({
        type: 'readout',
        id: `heat-${lane.id}`,
        anchor: { world: [bx, BLOCK_BOTTOM / 2] },
        text: text('label.heat'),
        vars: { q: state.heatText },
        chip: false,
        font: 'mono',
        weight: 'bold',
        fontSize: VALUE_PX,
        opacity: alpha,
        style: HEAT_FLOW,
      });
    }

    // ---- 이름 · 비열 ----
    out.push({
      type: 'readout',
      id: `name-${lane.id}`,
      anchor: { world: [bx, NAME_Y] },
      text: text(lane.name),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: NAME_PX,
      opacity: alpha,
      style: INK,
    });
    out.push({
      type: 'readout',
      id: `spec-${lane.id}`,
      anchor: { world: [bx, SPEC_Y] },
      text: text('label.specificHeat'),
      vars: { c: String(lane.spec(c)) },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      opacity: alpha,
      style: MUTED,
    });

    // ---- 온도 막대 ----
    // 관 바탕 → 처음 온도까지(세 막대가 같다) → 오른 몫(짙게) → 관 둘레.
    const tx = cx + TUBE_DX;
    const x0 = tx - TUBE_WIDTH / 2;
    const x1 = tx + TUBE_WIDTH / 2;
    const yStart = yOf(c.tStart, c);
    const yNow = yOf(tempAt(share, lane.spec(c), c), c);
    out.push({
      type: 'region',
      id: `tube-bg-${lane.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, SCALE_TOP),
      opaque: true,
      fillOpacity: TUBE_BG,
      opacity: alpha,
      style: MUTED,
    });
    out.push({
      type: 'region',
      id: `tube-base-${lane.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, yStart),
      fillOpacity: BASE_FILL,
      opacity: alpha,
      style: HEAT_LEVEL,
    });
    if (yNow > yStart) {
      out.push({
        type: 'region',
        id: `tube-rise-${lane.id}`,
        points: rect(x0, yStart, x1, yNow),
        fillOpacity: RISE_FILL,
        opacity: alpha,
        style: HEAT_LEVEL,
      });
    }
    out.push({
      type: 'region',
      id: `tube-rim-${lane.id}`,
      points: rect(x0, SCALE_BOTTOM, x1, SCALE_TOP),
      fillOpacity: 0,
      outline: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      opacity: alpha,
      style: MUTED,
    });

    // ---- 처음 온도 선 ----
    // 세 막대가 오른 몫을 재는 같은 바닥. 글자는 선언한 처음 온도다.
    out.push({
      type: 'trajectory',
      id: `start-line-${lane.id}`,
      points: [
        [x0 - START_LINE_OVERHANG, yStart],
        [x1 + START_LINE_OVERHANG, yStart],
      ],
      width: START_LINE_WIDTH,
      opacity: alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    });
    out.push({
      type: 'readout',
      id: `start-temp-${lane.id}`,
      anchor: { world: [x1 + START_LINE_OVERHANG, yStart], offset: [LABEL_GAP, 0] },
      text: text('label.temp'),
      vars: { t: state.startText },
      chip: false,
      font: 'mono',
      fontSize: VALUE_PX,
      align: 'left',
      opacity: alpha,
      style: MUTED,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
