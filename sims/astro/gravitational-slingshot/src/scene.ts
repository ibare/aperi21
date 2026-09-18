// ========================================================================
// gravitational-slingshot — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 행성 · 탐사선(body) · 지나온 길
// (trajectory) · 같은 시간 간격 점(trace) · 속도 화살표(vector) · 판 이름표(readout)가 모두
// 표준 어휘로 있다.
//
// 두 판이 한 월드에 나란히 놓인다. 판마다 원점을 더해 자리를 옮긴다 (판 단위 좌표계가 없다 —
// 장부 G10).
//
// 색은 뜻마다 하나다 — 탐사선과 그 점은 먹색(같은 대상), 탐사선의 속도(u · v)는 두 판 모두
// primary(같은 물리량을 다른 틀에서 잰 것), 행성의 속도 V 는 secondary, 행성 · 길 · 판 경계는
// 배경 정보라 muted. 강조색은 쓰지 않는다 — 견줄 것은 색이 아니라 길이와 간격이다.
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
  flightTime,
  planetFrame,
  planetShift,
  readConstants,
  sceneOpacity,
  strobeTimes,
  type SlingshotConstants,
} from './physics';
import {
  DIVIDER_X,
  PANEL_LABEL_Y,
  PLANET_FRAME_LABEL_X,
  PLANET_FRAME_ORIGIN,
  SCENE_BOUNDS,
  SUN_FRAME_LABEL_X,
  SUN_FRAME_ORIGIN,
  text,
  type GravitationalSlingshotMessageKey,
} from './schema';
import type { GravitationalSlingshotState } from './state';

/** 행성 원판의 반지름(월드). 가장 가까운 거리(약 0.31)보다 작아 탐사선이 겉을 스친다. */
const PLANET_RADIUS = 0.17;
/** 탐사선의 반지름(월드). */
const PROBE_RADIUS = 0.06;
/** 지나온 길의 굵기(화면 px) · 짙기. 점을 받치는 안내선이라 가늘고 옅다. */
const PATH_WIDTH_PX = 1;
const PATH_OPACITY = 0.55;
/** 같은 시간 간격 점의 크기(화면 px 반지름) · 짙기. */
const STROBE_DOT_PX = 2.2;
const STROBE_OPACITY = 0.8;
/** 태양 틀의 공전 길(점선)의 굵기 · 짙기와, 행성이 지나는 구간 양 끝 너머로 더 긋는 길이(월드). */
const ORBIT_WIDTH_PX = 1;
const ORBIT_OPACITY = 0.5;
const ORBIT_OVERHANG = 0.45;
/** 판 경계선의 굵기 · 짙기와 위아래 끝(월드 y). */
const DIVIDER_WIDTH_PX = 1;
const DIVIDER_OPACITY = 0.5;
const DIVIDER_TOP_Y = 2.2;
const DIVIDER_BOTTOM_Y = -2.3;
/** 길을 점 간격의 몇 분의 1 로 표본하는가. 가장 가까운 순간 휘는 곳이 각지지 않게. */
const PATH_SPLIT = 4;
/** 판 이름표 글자 크기(화면 px). */
const PANEL_LABEL_PX = 13;
/** 이어 붙인 삼각형 화살표의 굵기(화면 px). 탐사선의 속도 화살표보다 한 단 가늘다. */
const TRIANGLE_WIDTH_PX = 2;

/** 판 원점을 더한다. */
function at(origin: readonly [number, number], p: Vec2): Vec2 {
  return [origin[0] + p[0], origin[1] + p[1]];
}

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function scale(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

/** 화살표 이름을 둘 쪽. */
type Side = 'auto' | 'cw' | 'ccw';

/** 한 판에서 탐사선이 그 시각 있는 자리. `frame` 이 판마다 다르다. */
type FramePos = (tau: number) => Vec2;

/** 판 하나의 탐사선 무리 — 지나온 길 · 같은 시간 간격 점 · 탐사선. 두 판이 같은 모양으로 쓴다. */
function probeLayer(
  id: string,
  pos: FramePos,
  c: SlingshotConstants,
  tau: number,
  alpha: number,
): Primitive[] {
  const out: Primitive[] = [];
  const times = strobeTimes(c, tau);
  const path: Vec2[] = [];
  const dt = c.strobeStep / PATH_SPLIT;
  for (let t = -c.flightHalf; t < tau; t += dt) path.push(pos(t));
  path.push(pos(tau));
  out.push({
    type: 'trajectory',
    id: `path-${id}`,
    points: path,
    width: PATH_WIDTH_PX,
    opacity: PATH_OPACITY * alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trace',
    id: `strobe-${id}`,
    marks: times.map((t) => ({ pos: pos(t) })),
    shape: 'dot',
    size: STROBE_DOT_PX,
    opacity: STROBE_OPACITY * alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: `probe-${id}`,
    pos: pos(tau),
    shape: 'circle',
    size: PROBE_RADIUS,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  return out;
}

/**
 * 들어올 때 · 나갈 때의 속도 화살표. 들어오는 화살표는 **머리가 출발 자리에 닿고**(그 앞에서
 * 날아온 것처럼), 나가는 화살표는 **꼬리가 끝 자리에 붙는다** — 둘 다 길 바깥에 놓여 점과 겹치지 않는다.
 */
function endArrows(
  id: string,
  entry: Vec2,
  exit: Vec2,
  vIn: Vec2,
  vOut: Vec2,
  labelIn: GravitationalSlingshotMessageKey,
  labelOut: GravitationalSlingshotMessageKey,
  sides: { in: Side; out: Side },
  c: SlingshotConstants,
  alpha: number,
  exitAlpha: number,
): Primitive[] {
  const out: Primitive[] = [];
  const dIn = scale(vIn, c.arrowScale);
  out.push({
    type: 'vector',
    id: `in-${id}`,
    from: [entry[0] - dIn[0], entry[1] - dIn[1]],
    delta: dIn,
    label: text(labelIn),
    labelSide: sides.in,
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  if (exitAlpha > 0) {
    out.push({
      type: 'vector',
      id: `out-${id}`,
      from: exit,
      delta: scale(vOut, c.arrowScale),
      label: text(labelOut),
      labelSide: sides.out,
      opacity: alpha * exitAlpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  return out;
}

export function scene(params: {
  state: GravitationalSlingshotState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('gravitational-slingshot: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const tau = flightTime(timeline, c);
  const T = c.flightHalf;
  // 나가는 화살표는 비행이 끝나고 나타난다. 삼각형은 그 뒤에 이어 붙는다.
  const exitAlpha = timeline.at('reveal');
  const triangleAlpha = timeline.at('build');
  const out: Primitive[] = [];

  const rel = (t: number) => planetFrame(c, t);
  const planetV: Vec2 = [c.planetSpeed, 0];

  // ---- 판 경계 ----
  out.push({
    type: 'trajectory',
    id: 'divider',
    points: [
      [DIVIDER_X, DIVIDER_BOTTOM_Y],
      [DIVIDER_X, DIVIDER_TOP_Y],
    ],
    width: DIVIDER_WIDTH_PX,
    opacity: DIVIDER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 판 이름표 ----
  // 판이 둘이라 어느 틀인지 말해야 한다. 이것은 제목이 아니라 판의 이름이다.
  out.push({
    type: 'readout',
    id: 'label-planet-frame',
    anchor: { world: [PLANET_FRAME_LABEL_X, PANEL_LABEL_Y] },
    text: text('label.planetFrame'),
    chip: false,
    font: 'text',
    weight: 'bold',
    align: 'left',
    fontSize: PANEL_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-sun-frame',
    anchor: { world: [SUN_FRAME_LABEL_X, PANEL_LABEL_Y] },
    text: text('label.sunFrame'),
    chip: false,
    font: 'text',
    weight: 'bold',
    align: 'right',
    fontSize: PANEL_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ======================================================================
  // 왼쪽 판 — 행성과 함께 움직이는 틀. 행성은 가만히 있다.
  // ======================================================================
  const pf = PLANET_FRAME_ORIGIN;
  out.push({
    type: 'body',
    id: 'planet-planet-frame',
    pos: at(pf, [0, 0]),
    shape: 'circle',
    size: PLANET_RADIUS,
    outline: 'none',
    glow: false,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(...probeLayer('planet-frame', (t) => at(pf, rel(t).pos), c, tau, alpha));
  out.push(
    ...endArrows(
      'planet-frame',
      at(pf, rel(-T).pos),
      at(pf, rel(T).pos),
      rel(-T).vel,
      rel(T).vel,
      'label.u',
      'label.u',
      { in: 'auto', out: 'auto' },
      c,
      alpha,
      exitAlpha,
    ),
  );

  // ======================================================================
  // 오른쪽 판 — 태양 틀. 행성이 V 로 오른쪽으로 달린다.
  // ======================================================================
  const sf = SUN_FRAME_ORIGIN;
  const planetAt = (t: number): Vec2 => at(sf, [planetShift(c, t), 0]);
  const sunPos = (t: number): Vec2 => add(planetAt(t), rel(t).pos);
  const sunVel = (t: number): Vec2 => add(rel(t).vel, planetV);

  // 공전 길. 태양은 화면 밖 멀리 있어 이 구간에서 길은 곧다.
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: [
      [planetAt(-T)[0] - ORBIT_OVERHANG, sf[1]],
      [planetAt(T)[0] + ORBIT_OVERHANG, sf[1]],
    ],
    width: ORBIT_WIDTH_PX,
    opacity: ORBIT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const planetNow = planetAt(tau);
  out.push({
    type: 'body',
    id: 'planet-sun-frame',
    pos: planetNow,
    shape: 'circle',
    size: PLANET_RADIUS,
    outline: 'none',
    glow: false,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // 행성의 속도 V. 원판 가장자리에서 나간다.
  out.push({
    type: 'vector',
    id: 'planet-velocity',
    from: [planetNow[0] + PLANET_RADIUS, planetNow[1]],
    delta: scale(planetV, c.arrowScale),
    label: text('label.planetVelocity'),
    labelSide: 'ccw',
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push(...probeLayer('sun-frame', sunPos, c, tau, alpha));

  // 이어 붙인 삼각형 — v = V + u. 들어올 때와 나갈 때 **같은 V** 를 먼저 놓고 그 끝에 그 순간의 u 를
  // 붙이면 탐사선의 속도 화살표 머리에 닿는다. u 는 왼쪽 판의 화살표와 같은 길이 · 같은 방향이다.
  if (triangleAlpha > 0) {
    const a = alpha * triangleAlpha;
    const dV = scale(planetV, c.arrowScale);
    const entry = sunPos(-T);
    const exit = sunPos(T);
    const inTail: Vec2 = [entry[0] - sunVel(-T)[0] * c.arrowScale, entry[1] - sunVel(-T)[1] * c.arrowScale];
    // 이름은 삼각형 바깥에 둔다 — V 는 두 끝 모두 위쪽, u 는 들어올 때 오른쪽 아래 · 나갈 때 오른쪽 위.
    const legs: { id: string; tail: Vec2; u: Vec2 }[] = [
      { id: 'in', tail: inTail, u: rel(-T).vel },
      { id: 'out', tail: exit, u: rel(T).vel },
    ];
    for (const leg of legs) {
      out.push({
        type: 'vector',
        id: `triangle-v-${leg.id}`,
        from: leg.tail,
        delta: dV,
        label: text('label.planetVelocity'),
        labelSide: 'ccw',
        width: TRIANGLE_WIDTH_PX,
        opacity: a,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
      out.push({
        type: 'vector',
        id: `triangle-u-${leg.id}`,
        from: add(leg.tail, dV),
        delta: scale(leg.u, c.arrowScale),
        label: text('label.u'),
        labelSide: 'ccw',
        width: TRIANGLE_WIDTH_PX,
        opacity: a,
        style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  out.push(
    ...endArrows(
      'sun-frame',
      sunPos(-T),
      sunPos(T),
      sunVel(-T),
      sunVel(T),
      'label.vIn',
      'label.vOut',
      // 삼각형이 붙으면 v 는 그 한 변이 된다 — 이름을 삼각형 **바깥**에 둔다. 들어올 때는 v 의 오른쪽,
      // 나갈 때는 v 의 위쪽이 삼각형 안이다.
      { in: 'cw', out: 'cw' },
      c,
      alpha,
      exitAlpha,
    ),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
