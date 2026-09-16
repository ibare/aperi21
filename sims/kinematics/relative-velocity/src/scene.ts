// ========================================================================
// relative-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각이 매 프레임 하는 일은 **세계를 지금 기준틀의 좌표로 다시 찍는 것**이다.
// 세계 좌표에 궤적을 한 번 그려 놓고 카메라만 옮기는 방식으로는 전단이 나오지
// 않는다. 그리고 그 변환은 둘로 갈린다 —
//
//   지금 있는 것:   positionInFrame  →  x − Xobs
//   지나간 사건:    eventInFrame     →  x − Xobs + u·(t − tᵢ)
//
// 둘째 줄의 전단항을 빠뜨리면 궤적만 안 기우는데 **예외도 안 나고 타입도 통과하고
// 그림만 그럴듯하게 틀린다.** 그래서 손으로 쓰지 않고 이름이 갈린 두 함수를 쓴다.
//
// 뱃머리는 어느 쪽 변환도 받지 않는다. 자리만 옮기고 **각도는 그대로다** — 그것이
// 이 조각의 잠금장치다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  eventInFrame,
  positionInFrame,
  tiledPositions,
  type ObserverFrame,
} from '@aperi21/plugin-mechanics';

import { FOAM, PEBBLES, boatAt } from './physics';
import {
  BLEED,
  BOAT_PATH,
  BOAT_SEAT,
  DOT_PX,
  FOAM_LUMINANCE,
  FOAM_TICK_PX,
  FOAM_WIDTH_PX,
  GHOST_ALPHA,
  GHOST_LIFE,
  NEAR_LAND_BOTTOM,
  PIER_FAR_Y,
  PIER_L,
  PIER_NEAR_Y,
  PIER_SIZE,
  RIVER_W,
  SCENE_BOUNDS,
  SPAN,
  TRAIL_ALPHA,
  TRAIL_WIDTH_PX,
  V_WATER,
  VIEW_TOP,
  VIEW_W,
} from './schema';
import type { RelativeVelocityState } from './state';

/** 띠의 왼쪽 끝(기준틀 좌표). 띠는 x 에 대해 한결같으니 관측자를 따라 밀 것이 없다. */
const BAND_L = -BLEED;
const BAND_R = VIEW_W + BLEED;

/** 물거품 획의 방향 — 흐르는 쪽으로 눕는다. */
const FOAM_DIR: Vec2 = [1, 0];

/** 강물과 땅을 덮는 정도. 잠긴 것을 비쳐 보이게 할 것이 없어 불투명하게 깐다. */
const RIVER_FILL = 0.55;
const LAND_FILL = 0.3;

/** 자국 하나. `Trace.marks` 가 읽기 전용 배열이라 쌓을 그릇을 따로 둔다. */
type Mark = Trace['marks'][number];

/**
 * 가로로 누운 띠. 물이거나 땅이다.
 *
 * `edge` 를 주면 `y1` 쪽 변만 또렷하게 긋는다 — 물가 경계다. 그래서 물가를
 * 언제나 `y1` 에 둔다(이쪽 둑은 위끝, 맞은편 둑은 아래끝).
 */
function band(
  id: string,
  y0: number,
  y1: number,
  fill: number,
  role: 'secondary' | 'muted',
  edge = false,
): Region {
  return {
    type: 'region',
    id,
    points: [
      [BAND_L, y0],
      [BAND_R, y0],
      [BAND_R, y1],
      [BAND_L, y1],
    ],
    opaque: true,
    fillOpacity: fill,
    ...(edge ? { outline: [[2, 3] as const] } : {}),
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 지금 보이는 세계 좌표 범위. 되풀이를 여기까지 감아 놓는다. */
function visibleWorld(frame: ObserverFrame): { from: number; to: number } {
  return { from: frame.at[0] + BAND_L, to: frame.at[0] + BAND_R };
}

export function scene(params: {
  state: RelativeVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const frame = state.frame;
  const view = visibleWorld(frame);
  const out: Primitive[] = [];

  // ---- 강물 ----
  out.push(band('river', 0, RIVER_W, RIVER_FILL, 'secondary'));

  // ---- 물거품 ----
  // 물에 얹혀 물과 똑같이 1.2 m/s 로 떠간다. 물의 운동 자체를 눈에 보이게 한다 —
  // 기준틀이 강물에 닿으면 **화면에서 멈춰 선다.**
  //
  // 되풀이는 `tiledPositions` 가 맡는다. 원본은 이 감기를 한 조각 안에서 세 번
  // 다시 짰다 (물거품 · 자갈 · 선착장).
  const foamMarks: Mark[] = [];
  for (const f of FOAM) {
    for (const x of tiledPositions(f.x + V_WATER * frame.t, { period: SPAN, ...view })) {
      foamMarks.push({ pos: positionInFrame(frame, [x, f.y]), strength: f.strength });
    }
  }
  const foam: Trace = {
    type: 'trace',
    id: 'foam',
    marks: foamMarks,
    shape: 'tick',
    direction: FOAM_DIR,
    size: FOAM_TICK_PX,
    width: FOAM_WIDTH_PX,
    luminance: FOAM_LUMINANCE,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(foam);

  // ---- 강둑 ----
  // 땅에 붙박인 것. 강둑의 기준틀에서만 멈춰 서고 다른 기준틀에서는 미끄러진다.
  // 맞은편 둑은 위끝이, 이쪽 둑은 아래끝이 물가다. 둘 다 물 쪽 변에 경계선을 둔다.
  out.push(band('far-land', VIEW_TOP + BLEED, RIVER_W, LAND_FILL, 'muted', true));
  out.push(band('near-land', NEAR_LAND_BOTTOM, 0, LAND_FILL, 'muted', true));

  const pebblePos: Vec2[] = [];
  const pebbleSizes: number[] = [];
  for (const p of PEBBLES) {
    for (const x of tiledPositions(p.x, { period: SPAN, ...view })) {
      pebblePos.push(positionInFrame(frame, [x, p.y]));
      pebbleSizes.push(p.r);
    }
  }
  const pebbles: ParticleSystem = {
    type: 'particleSystem',
    id: 'pebbles',
    positions: pebblePos,
    sizes: pebbleSizes,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(pebbles);

  // ---- 선착장 ----
  // 땅에 박힌 눈금. 배가 출발한 자리를 표시하고, 둑이 얼마나 미끄러지는지를
  // 읽게 한다. 주기를 말뚝 간격 그대로 두면 이음매에서 간격이 어긋나지 않는다
  // (원본은 60 m 를 감았는데 60 = 12 × 5 라 나오는 자리가 같다).
  tiledPositions(0, { period: PIER_L, ...view }).forEach((x, i) => {
    const pos = positionInFrame(frame, [x, PIER_NEAR_Y]);
    out.push(pier(`pier-near-${i}`, pos));
  });
  tiledPositions(PIER_L / 2, { period: PIER_L, ...view }).forEach((x, i) => {
    const pos = positionInFrame(frame, [x, PIER_FAR_Y]);
    out.push(pier(`pier-far-${i}`, pos));
  });

  // ---- 지나온 길 ----
  // 이 조각의 주장이 일어나는 자리. 과거 사건마다 `u·(t − tᵢ)` 만큼 밀려 선
  // 전체가 전단된다 — 컷이 바뀌는 것이 아니라 한 선이 돌아간다.
  if (state.ghost) {
    const age = frame.t - state.ghost.deadAt;
    out.push(
      path('ghost-trail', state.ghost.trail, frame, GHOST_ALPHA * (1 - age / GHOST_LIFE)),
    );
  }
  out.push(path('trail', state.trail, frame, TRAIL_ALPHA));

  // ---- 시간 자국 ----
  // 0.4 초마다 하나. 같은 시간 간격이라 자국 사이 거리가 곧 이 기준틀에서 본
  // 배의 빠르기다 — 강둑에서 벌어지고 강물에서 좁아진다. 늙지 않는다.
  const dots: Trace = {
    type: 'trace',
    id: 'time-marks',
    marks: state.dots.map((e) => ({ pos: eventInFrame(frame, e) })),
    shape: 'dot',
    size: DOT_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
  out.push(dots);

  // ---- 배 ----
  // 자리만 지금 기준틀로 옮긴다. **뱃머리 각도는 변환을 받지 않는다** —
  // 다른 모든 것이 뒤집히는 동안 이것만 꼼짝 않는 것이 주장의 잠금장치다.
  const last = state.trail[state.trail.length - 1] ?? boatAt(state.trip, frame.t);
  const at = positionInFrame(frame, [last.x, last.y]);
  const hull: Body = {
    type: 'body',
    id: 'boat',
    pos: at,
    shape: 'custom',
    customPath: BOAT_PATH,
    // 종이색 테두리. 붉은 배가 붉은 자취 위에 얹혀도 제 경계가 떼어져 읽힌다.
    outline: 'background',
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
  out.push(hull);
  const seat: Body = {
    type: 'body',
    id: 'boat-seat',
    pos: [at[0], at[1] + BOAT_SEAT.y],
    shape: 'rect',
    size: [BOAT_SEAT.size[0], BOAT_SEAT.size[1]],
    outline: 'none',
    // 빛의 양 0 = 바탕색. 바탕색으로 **채우는** 것을 달리 말할 길이 없다
    // (NOTES 「어휘 부족」).
    luminance: 0,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
  out.push(seat);

  return out;
}

function pier(id: string, pos: Vec2): Body {
  return {
    type: 'body',
    id,
    pos,
    shape: 'rect',
    size: [PIER_SIZE[0], PIER_SIZE[1]],
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 사건의 목록을 지금 기준틀의 꺾은선으로. */
function path(
  id: string,
  events: readonly { x: number; y: number; t: number }[],
  frame: ObserverFrame,
  alpha: number,
): Trajectory {
  return {
    type: 'trajectory',
    id,
    points: events.map((e) => eventInFrame(frame, e)),
    width: TRAIL_WIDTH_PX,
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
}

/**
 * 프레이밍은 주장의 일부다. 고정값이라야 카메라가 흔들리지 않는다 (S-piece).
 * 원본 캔버스(860 × 272 px, 1 m = 21 px)가 담던 만큼이다.
 */
export function boundsHint(): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return { ...SCENE_BOUNDS };
}
