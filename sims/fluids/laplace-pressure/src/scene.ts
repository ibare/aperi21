// ========================================================================
// laplace-pressure — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 공기(region) · 관 벽 · 막
// (trajectory) · 밸브(body) · 흐름(stream) · 압력(vector)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 공기와 막 · 흐름은 secondary(같은 공기와 그것을 두른 막), 두
// 압력 화살표는 primary(같은 양 둘, 길이로만 견준다), 관과 밸브는 먹색. 강조색은 쓰지
// 않는다 — 이 그림에서 가를 것은 색이 아니라 두 화살표의 길이다.
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
import { capArc, readBubbles, readConstants } from './physics';
import {
  FLOW_SPEED_SCALE,
  LARGE_X,
  PIPE_Y,
  PRESSURE_SCALE,
  SCENE_BOUNDS,
  SMALL_X,
  text,
} from './schema';
import type { LaplacePressureState } from './state';

/** 공기 면의 짙기. 거품과 관 속이 같은 공기로 이어져 보이는 정도. */
const AIR_FILL = 0.16;
/** 막 선 굵기(화면 px). 막이 이 조각의 주인공이라 궤적 기본보다 굵다. */
const FILM_WIDTH = 2.5;
/** 관 벽 굵기(화면 px). 장치라 막보다 가늘다. */
const WALL_WIDTH = 1.5;
/** 밸브 판의 두께 · 관을 가로지르는 길이(관 폭보다 조금 길어 벽을 넘어 보인다). */
const GATE_THICK = 0.12;
const GATE_OVERHANG = 0.08;
/** 밸브 판이 열리며 올라가는 거리 = 관 폭 + 이만큼. */
const GATE_LIFT_EXTRA = 0.05;
/** 압력 화살표 끝과 밸브 판 가운데 사이의 틈. */
const ARROW_GAP = 0.12;
/** 흐름 획이 이 빠르기(월드/초)보다 느리면 그리지 않는다 — 수명이 끝없이 길어진다. */
const FLOW_MIN_SPEED = 0.15;
/** 흐름 획의 방출 수(초당, 흐름이 가장 셀 때 기준). */
const FLOW_RATE = 60;
/** 이 빠르기(월드/초)에서 흐름 획이 가장 짙다. 그보다 느리면 옅어진다. */
const FLOW_FULL_SPEED = 1.5;
/** 흐름 획의 짙기 — 막 · 화살표보다 한 단 뒤에 있다. */
const FLOW_OPACITY = 0.8;
/** 흐름 획이 지나는 줄을 관 가운데에서 이만큼(관 반폭 비) 아래로 내린다 — 압력 화살표와 한 줄에 겹치지 않게. */
const FLOW_LANE = 0.45;

export function scene(params: {
  state: LaplacePressureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('laplace-pressure: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const b = readBubbles(timeline, c);
  const a = c.mouthRadius;
  const alpha = b.alpha;
  const out: Primitive[] = [];

  const smallArc = capArc(SMALL_X, b.hSmall, a);
  const largeArc = capArc(LARGE_X, b.hLarge, a);

  // 관 안쪽 벽이 이루는 경로 — 가로 토막은 PIPE_Y ± a.
  const top = PIPE_Y + a;
  const bottom = PIPE_Y - a;
  const outerWall: Vec2[] = [
    [SMALL_X - a, 0],
    [SMALL_X - a, bottom],
    [LARGE_X + a, bottom],
    [LARGE_X + a, 0],
  ];
  const innerWall: Vec2[] = [
    [SMALL_X + a, 0],
    [SMALL_X + a, top],
    [LARGE_X - a, top],
    [LARGE_X - a, 0],
  ];

  // ---- 공기 ----
  // 작은 거품 → 관 → 큰 거품이 한 덩어리 공기다. 한 다각형으로 두어 이음새가 짙어지지 않게 한다.
  const air: Vec2[] = [
    ...smallArc,
    ...innerWall,
    ...largeArc.slice(1),
    ...[...outerWall].reverse().slice(1, -1),
  ];
  out.push({
    type: 'region',
    id: 'air',
    points: air,
    fillOpacity: AIR_FILL,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 관 벽 ----
  out.push(wall('wall-outer', outerWall, alpha), wall('wall-inner', innerWall, alpha));

  // ---- 공기 흐름 ----
  // 작은 거품 입에서 내려가 가로 토막을 지나 큰 거품 입으로 올라간다. 획의 빠르기가 옮기는
  // 부피 빠르기를 따른다 — 쪼그라들수록 빨라지다가 막이 펴지며 잦아든다.
  const speed = b.flowRate * FLOW_SPEED_SCALE;
  if (speed > FLOW_MIN_SPEED) {
    const flow = Math.min(1, speed / FLOW_FULL_SPEED);
    const lane = PIPE_Y - FLOW_LANE * a;
    const legs: { id: string; from: Vec2; dir: Vec2; len: number }[] = [
      { id: 'flow-down', from: [SMALL_X, 0], dir: [0, -1], len: -lane },
      { id: 'flow-across', from: [SMALL_X, lane], dir: [1, 0], len: LARGE_X - SMALL_X },
      { id: 'flow-up', from: [LARGE_X, lane], dir: [0, 1], len: -lane },
    ];
    for (const leg of legs) {
      out.push({
        type: 'stream',
        id: leg.id,
        from: leg.from,
        velocity: [leg.dir[0] * speed, leg.dir[1] * speed],
        rate: FLOW_RATE * (leg.len / (LARGE_X - SMALL_X)),
        life: leg.len / speed,
        width: 2.5,
        jitter: 8,
        flow,
        opacity: alpha * FLOW_OPACITY,
        style: { colorRole: 'secondary', emphasis: 'strong' },
      });
    }
  }

  // ---- 막 ----
  out.push(film('film-small', smallArc, alpha), film('film-large', largeArc, alpha));

  // ---- 밸브 ----
  // 관을 가로지르는 판. 열리며 위로 빠진다 — 판이 관 위로 나와 「열렸다」 가 모양으로 읽힌다.
  const lift = (2 * a + GATE_LIFT_EXTRA) * b.valveOpen;
  out.push({
    type: 'body',
    id: 'valve',
    pos: [0, PIPE_Y + lift],
    shape: 'rect',
    size: [GATE_THICK, 2 * a + 2 * GATE_OVERHANG],
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 두 거품 안의 압력 ----
  // 밸브 양쪽에서 마주 민다. 길이 = 압력 × 같은 배율 — 긴 쪽이 이기는 쪽이고, 두 막이
  // 똑같이 휘면 길이가 같아진다.
  const lenS = b.pSmall * PRESSURE_SCALE;
  const lenL = b.pLarge * PRESSURE_SCALE;
  out.push(
    pressure('pressure-small', [-ARROW_GAP - lenS, PIPE_Y], [lenS, 0], alpha),
    pressure('pressure-large', [ARROW_GAP + lenL, PIPE_Y], [-lenL, 0], alpha),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

function wall(id: string, points: readonly Vec2[], alpha: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: WALL_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
}

function film(id: string, points: readonly Vec2[], alpha: number): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: FILM_WIDTH,
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

function pressure(id: string, from: Vec2, delta: Vec2, alpha: number): Primitive {
  return {
    type: 'vector',
    id,
    from,
    delta,
    label: text('label.pressure'),
    labelSide: 'auto',
    outline: 'background',
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
