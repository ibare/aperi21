// ========================================================================
// albedo — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 하늘 · 표면 · 막대 채움(region) ·
// 햇빛 알갱이(particleSystem) · 칸 테두리(lineSet) · 막대 관(body) · 이름표(readout).
//
// 햇빛과 표면은 **빛의 세기 채널**(`light`)로 칠한다. 햇빛 알갱이는 가득 찬 빛, 하늘은 빛 없음,
// 표면은 제 반사율만큼의 빛이다 — 되돌려 보내는 빛의 몫이 곧 표면의 밝기라, 역할색으로
// 표면을 가르지 않는다. 빛은 두 테마에서 극성이 같아 라이트에서도 뒤집히지 않는다.
// 강조색은 「온도」 한 뜻에만(막대 채움). 칸 테두리 · 막대 관은 muted, 글자는 ink.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { albedoAt, laneCenter, lanes, rays, readConstants, sinkDepthOf } from './physics';
import {
  BAR_BOTTOM,
  BAR_DX,
  BAR_LABEL_Y,
  BAR_TOP,
  BAR_W,
  GROUND_DEPTH,
  LANE_W,
  NAME_Y,
  SCENE_BOUNDS,
  SKY_TOP,
  TEXT_DX,
  VALUE_Y,
  text,
} from './schema';
import type { AlbedoState } from './state';

/** 칸 테두리 · 표면 윗면 굵기(화면 px). */
const FRAME_PX = 1.5;
/** 햇빛 알갱이 반지름(화면 px). */
const RAY_DOT_PX = 2.6;
/** 알갱이 꼬리 — 길이(속도 × 초) · 굵기(화면 px) · 불투명도. 내려오는지 올라가는지를 꼬리가 말한다. */
const RAY_TRAIL_S = 0.26;
const RAY_TRAIL_PX = 1.6;
const RAY_TRAIL_OPACITY = 0.7;
/** 먹힌 알갱이가 가라앉는 깊이 — 표면 두께의 몫. */
const SINK_FRAC = 0.6;
/** 온도 막대 채움 짙기. */
const BAR_FILL = 0.85;
/** 이름표 · 반사율 · 막대 이름 글자 크기(화면 px). */
const NAME_PX = 12;
const LABEL_PX = 11;

/** 칸마다의 이름 문안. 칸 순서는 `lanes()` 와 같다 (G105). */
const LANE_NAMES: readonly LocalizedText[] = [
  text('label.snow'),
  text('label.desert'),
  text('label.forest'),
  text('label.ocean'),
];

function rect(minX: number, minY: number, maxX: number, maxY: number): Vec2[] {
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

export function scene(params: {
  state: AlbedoState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('albedo: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const defs = lanes(c);
  const out: Primitive[] = [];
  const frames: Vec2[][] = [];
  const barH = BAR_TOP - BAR_BOTTOM;
  const emptying = 1 - tl.at('clear');
  // 녹는 칸의 이름표 — 옛 것은 `melt` 동안 사라지고 `refrozen` 에 돌아온다. 새 것은 `reveal` 에
  // 떠오르고 `clear` 에 사라진다. 두 이름표가 같은 때 떠 있지 않다.
  const oldLabel = Math.min(1, 1 - tl.at('melt') + tl.at('refrozen'));
  const newLabel = tl.at('reveal') * (1 - tl.at('clear'));

  defs.forEach((lane, i) => {
    const x0 = laneCenter(i, defs.length);
    const l = x0 - LANE_W / 2;
    const r = x0 + LANE_W / 2;

    // ---- 하늘 — 빛 없음 바탕. 흰 햇빛이 두 테마에서 보인다 ----
    out.push({
      type: 'region',
      id: `sky-${i}`,
      points: rect(l, 0, r, SKY_TOP),
      light: 0,
      fillOpacity: 1,
    });

    // ---- 표면 — 지금 반사율만큼의 빛 ----
    out.push({
      type: 'region',
      id: `ground-${i}`,
      points: rect(l, -GROUND_DEPTH, r, 0),
      light: albedoAt(lane, c, tl, tl.u),
      fillOpacity: 1,
    });

    // 칸 테두리와 표면 윗면 — 바다처럼 어두운 표면도 하늘과 갈라진다.
    frames.push(
      [
        [l, -GROUND_DEPTH],
        [r, -GROUND_DEPTH],
        [r, SKY_TOP],
        [l, SKY_TOP],
        [l, -GROUND_DEPTH],
      ],
      [
        [l, 0],
        [r, 0],
      ],
    );

    // ---- 햇빛 알갱이 ----
    const rd = rays(tl, c, lane, i, x0, sinkDepthOf(SINK_FRAC));
    if (rd.positions.length > 0) {
      out.push({
        type: 'particleSystem',
        id: `rays-${i}`,
        positions: rd.positions,
        velocities: rd.velocities,
        opacities: rd.opacities,
        sizes: RAY_DOT_PX,
        trail: true,
        trailStyle: { seconds: RAY_TRAIL_S, width: RAY_TRAIL_PX, opacity: RAY_TRAIL_OPACITY },
        light: 1,
        // 칸 안에만 — 막 떠난 · 막 빠져나가는 알갱이의 꼬리가 하늘 위 끝 밖으로 삐져나오지 않는다.
        clip: { min: [l, -GROUND_DEPTH], max: [r, SKY_TOP] },
      });
    }

    // ---- 이름표 · 반사율 ----
    const tx = x0 + TEXT_DX;
    const nameFade = lane.melts ? oldLabel : 1;
    out.push({
      type: 'readout',
      id: `name-${i}`,
      anchor: { world: [tx, NAME_Y] },
      text: LANE_NAMES[i] ?? text('label.ocean'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: NAME_PX,
      opacity: nameFade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `albedo-${i}`,
      anchor: { world: [tx, VALUE_Y] },
      text: text('label.albedo'),
      vars: { a: String(lane.albedo) },
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      opacity: nameFade,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    if (lane.melts) {
      // 녹은 뒤의 이름 · 값 — 바다의 선언값 그대로.
      out.push({
        type: 'readout',
        id: `name-${i}-melted`,
        anchor: { world: [tx, NAME_Y] },
        text: text('label.meltedSea'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: NAME_PX,
        opacity: newLabel,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      out.push({
        type: 'readout',
        id: `albedo-${i}-melted`,
        anchor: { world: [tx, VALUE_Y] },
        text: text('label.albedo'),
        vars: { a: String(c.albedoOcean) },
        chip: false,
        font: 'mono',
        fontSize: LABEL_PX,
        opacity: newLabel,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    // ---- 온도 막대 — 먹힌 알갱이 하나가 한 계단 ----
    const bx = x0 + BAR_DX;
    const bl = bx - BAR_W / 2;
    const br = bx + BAR_W / 2;
    const fill = rd.perCycle > 0 ? Math.min(1, rd.absorbed / rd.perCycle) * emptying : 0;
    if (fill > 0) {
      out.push({
        type: 'region',
        id: `bar-fill-${i}`,
        points: rect(bl, BAR_BOTTOM, br, BAR_BOTTOM + barH * fill),
        fillOpacity: BAR_FILL,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'body',
      id: `bar-tube-${i}`,
      pos: [bx, (BAR_BOTTOM + BAR_TOP) / 2],
      shape: 'rect',
      size: [BAR_W, barH],
      fill: 'none',
      outline: 'role',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `bar-label-${i}`,
      anchor: { world: [bx, BAR_LABEL_Y] },
      text: text('label.temp'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  out.push({
    type: 'lineSet',
    id: 'frames',
    lines: frames,
    width: FRAME_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
