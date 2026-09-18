// ========================================================================
// orbital-decay — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 대기 · 에너지 기둥(region), 행성 ·
// 위성(body), 처음 궤도 · 나선 자취 · 기준선(trajectory), 속도 · 항력(vector), 이름표(readout).
//
// 색은 뜻마다 하나다 — 위성은 먹색, 속도와 「빨라진 몫」 은 primary(빠르기), 항력과 「공기가 가져간 몫」 은
// 강조색(accent, 공기가 끄는 것 한 뜻), 위성이 내려앉은 길과 「내놓은 위치 에너지」 는 secondary(내려앉음),
// 행성 · 대기 · 처음 궤도 · 기준선은 배경이라 muted.
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
import { cycleOpacity, flightSeconds, readConstants, satelliteAt } from './physics';
import { BARS_AT, SCENE_BOUNDS, text } from './schema';
import type { OrbitalDecayState } from './state';

/** 위성 반지름(월드). */
const SAT_R = 0.07;
/** 행성의 짙기 — 배경이라 한 걸음 물린다. */
const PLANET_OPACITY = 0.7;
/** 대기 원판 수. 겹칠수록 짙어져 아래로 갈수록 짙은 공기가 된다(장부 G31). */
const ATMOSPHERE_LAYERS = 7;
/** 대기 원판 한 장의 채움 불투명도. 지면 바로 위에서 일곱 장이 겹친다. */
const ATMOSPHERE_FILL = 0.09;
/** 대기 윗자락이 처음 궤도 바깥으로 나가는 여유(월드). 위성이 처음부터 옅은 공기 속에 있다. */
const ATMOSPHERE_MARGIN = 0.15;
/** 원 · 원판을 긋는 표본 수 — 각져 보이지 않는 촘촘함. */
const CIRCLE_SAMPLES = 144;
/** 처음 궤도 점선의 짙기. */
const GUIDE_OPACITY = 0.8;
/** 안내선(처음 궤도 · 기준선) 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1;
/** 나선 자취 굵기(화면 px). 간격이 촘촘한 처음 바퀴들이 뭉개지지 않게 가늘게. */
const TRAIL_WIDTH_PX = 1.5;
/** 속도 · 항력 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 2.5;
/** 에너지 기둥 폭(월드). */
const BAR_WIDTH = 0.5;
/** 두 기둥 사이 틈(월드). */
const BAR_GAP = 0.6;
/** 기둥 채움 불투명도 — 막대라 짙게. */
const BAR_FILL = 0.85;
/** 기둥 머리 이름표를 기준선 위로 띄우는 거리(화면 px). */
const HEAD_GAP_PX = 20;
/** 기둥 머리 이름표 줄바꿈 폭(화면 px). */
const HEAD_WRAP_PX = 64;
/** 조각 오른쪽 이름표를 기둥에서 띄우는 거리(월드). */
const SIDE_LABEL_GAP = 0.15;
/** 조각 이름표끼리 · 기준선과 떨어뜨리는 최소 세로 거리(월드). 기둥이 짧을 때 겹치지 않게. */
const SIDE_LABEL_MIN = 0.3;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

export function scene(params: {
  state: OrbitalDecayState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('orbital-decay: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const fade = cycleOpacity(tl);
  const out: Primitive[] = [];

  // ---- 대기 — 겹친 옅은 원판. 아래로 갈수록 짙다 ----
  const top = c.startRadius + ATMOSPHERE_MARGIN;
  for (let i = 0; i < ATMOSPHERE_LAYERS; i++) {
    const r = c.planetRadius + ((top - c.planetRadius) * (i + 1)) / ATMOSPHERE_LAYERS;
    out.push({
      type: 'region',
      id: `air-${i}`,
      points: circle(r),
      fillOpacity: ATMOSPHERE_FILL,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'planet',
    pos: [0, 0],
    shape: 'circle',
    size: c.planetRadius,
    outline: 'none',
    glow: false,
    opacity: PLANET_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 처음 궤도 — 어디서 내려앉기 시작했는지 ----
  out.push({
    type: 'trajectory',
    id: 'start-orbit',
    points: circle(c.startRadius),
    closed: true,
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
  });

  const sat = satelliteAt(c, flightSeconds(tl));

  // ---- 나선 자취 — 간격이 벌어지는 것이 「내려앉음이 빨라진다」 다 ----
  if (sat.trail.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'trail',
      points: sat.trail,
      width: TRAIL_WIDTH_PX,
      opacity: fade,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ---- 에너지 기둥 ----
  out.push(...energyBars(c.barPerEnergy, sat.released, sat.toSpeed, sat.toAir, fade));

  // ---- 속도 · 항력 — 떨어진 뒤에는 없다 ----
  if (!sat.landed) {
    const speed = Math.hypot(sat.vel[0], sat.vel[1]);
    const ux = sat.vel[0] / speed;
    const uy = sat.vel[1] / speed;
    out.push({
      type: 'vector',
      id: 'drag',
      from: sat.pos,
      delta: [-ux * c.dragArrowLength, -uy * c.dragArrowLength],
      width: ARROW_WIDTH_PX,
      label: text('label.drag'),
      labelSide: 'ccw',
      labelChip: true,
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'vector',
      id: 'velocity',
      from: sat.pos,
      delta: [sat.vel[0] * c.arrowPerSpeed, sat.vel[1] * c.arrowPerSpeed],
      width: ARROW_WIDTH_PX,
      label: text('label.velocity'),
      labelSide: 'ccw',
      labelChip: true,
      opacity: fade,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  out.push({
    type: 'body',
    id: 'satellite',
    pos: sat.pos,
    shape: 'circle',
    size: SAT_R,
    outline: 'background',
    glow: false,
    opacity: fade,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 두 기둥이 한 기준선에 매달린다. 왼쪽은 내려앉으며 내놓은 위치 에너지, 오른쪽은 그것이 간 곳 —
 * 위에 「빨라진 몫」, 아래에 「공기가 가져간 몫」 을 쌓는다. 두 기둥의 길이는 에너지 보존으로 같다.
 */
function energyBars(
  perEnergy: number,
  released: number,
  toSpeed: number,
  toAir: number,
  fade: number,
): Primitive[] {
  const [x0, y0] = BARS_AT;
  const xa = x0;
  const xb = x0 + BAR_WIDTH + BAR_GAP;
  const lenA = Math.max(released, 0) * perEnergy;
  const lenSpeed = Math.max(toSpeed, 0) * perEnergy;
  const lenAir = Math.max(toAir, 0) * perEnergy;
  const out: Primitive[] = [];

  out.push({
    type: 'trajectory',
    id: 'bar-baseline',
    points: [
      [xa - BAR_GAP / 2, y0],
      [xb + BAR_WIDTH + BAR_GAP / 2, y0],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(bar('bar-released', xa, y0, lenA, 'secondary', fade));
  out.push(bar('bar-speed', xb, y0, lenSpeed, 'primary', fade));
  out.push(bar('bar-air', xb, y0 - lenSpeed, lenAir, 'accent', fade));

  out.push(head('head-released', [xa + BAR_WIDTH / 2, y0], text('label.released')));
  out.push(head('head-went', [xb + BAR_WIDTH / 2, y0], text('label.wentTo')));

  // 조각 이름표는 오른쪽 기둥 옆, 조각 가운데 높이. 기둥이 짧으면 겹치지 않게 최소 거리를 둔다.
  const side = xb + BAR_WIDTH + SIDE_LABEL_GAP;
  const ySpeed = y0 - Math.max(lenSpeed / 2, SIDE_LABEL_MIN);
  const yAir = Math.min(y0 - lenSpeed - lenAir / 2, ySpeed - SIDE_LABEL_MIN);
  out.push(sideLabel('side-speed', [side, ySpeed], text('label.toSpeed')));
  out.push(sideLabel('side-air', [side, yAir], text('label.toAir')));
  return out;
}

function bar(
  id: string,
  x: number,
  yTop: number,
  len: number,
  role: 'primary' | 'secondary' | 'accent',
  opacity: number,
): Primitive {
  return {
    type: 'region',
    id,
    points: [
      [x, yTop],
      [x + BAR_WIDTH, yTop],
      [x + BAR_WIDTH, yTop - len],
      [x, yTop - len],
    ],
    fillOpacity: BAR_FILL,
    opacity,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function head(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: [0, -HEAD_GAP_PX] },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    wrapWidth: HEAD_WRAP_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
}

function sideLabel(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
}

function circle(r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const th = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    pts.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return pts;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
