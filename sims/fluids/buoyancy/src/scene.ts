// ========================================================================
// buoyancy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 물통(trajectory) · 물(region) ·
// 상자(body) · 면을 미는 힘(vector) · 두 면의 힘 막대와 그 차이(region) · 이름표(readout).
//
// 색은 뜻마다 하나다 — 물이 면을 미는 힘은 화살표든 막대든 먹색(같은 대상), 물은 secondary,
// 상자는 muted. **강조색은 「아랫면이 더 받는 몫 = 부력」 한 가지 뜻에만** 쓴다 — 막대의
// 초과분과 상자의 부력 화살표. 둘은 길이도 같다.
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
import { readConstants, readDepth, readFaces, sceneOpacity } from './physics';
import {
  BAR_BASE_Y,
  BAR_BOTTOM_X,
  BAR_HALF_WIDTH,
  BAR_LABEL_Y,
  BAR_TOP_X,
  FACE_ARROW_XS,
  SCENE_BOUNDS,
  SIDE_ARROW_FRACTIONS,
  TANK_FLOOR_Y,
  TANK_HALF_WIDTH,
  TANK_RIM_Y,
  text,
} from './schema';
import type { BuoyancyState } from './state';

/** 면을 미는 화살표 굵기(화면 px). 부력 화살표(테마의 굵은 선)보다 한 단 가늘다 — 원인이지 결과가 아니다. */
const PUSH_WIDTH = 2;
/**
 * 면을 미는 화살표를 선언하는 최소 길이(월드 m). 이보다 짧으면 화살촉이 길이의 0.35 로 줄어
 * 방향 없는 눈금으로 읽힌다(장부 G02). 그래서 수면 바로 아래의 힘은 그리지 않는다 — 화살표가
 * 0 에서 자라는 대신 이 길이에서 나타난다.
 */
const MIN_PUSH = 0.08;
/** 옆면 화살표의 짙기. 좌우가 서로 지워 주장에 남지 않는 힘이라 물러나 있다. */
const SIDE_OPACITY = 0.45;
/** 물의 짙기 — 잠긴 상자가 비쳐 보이는 정도. */
const WATER_FILL = 0.3;
/** 수면 일렁임(화면 px). */
const RIPPLE_PX = 1.2;
/** 막대 가운데 몫(두 면이 같이 받는 만큼)의 짙기 · 강조 몫의 짙기. */
const BAR_FILL = 0.3;
const NET_FILL = 0.85;
/** 부력 화살표 굵기(화면 px). 면을 미는 화살표보다 굵다 — 그 힘들이 남긴 결과다. */
const NET_WIDTH = 4;
/** 강조 몫 이름표를 막대 오른쪽에서 띄우는 거리(화면 px). */
const NET_LABEL_GAP = 8;
/** 막대 이름표 글자 크기(화면 px). */
const BAR_LABEL_PX = 12;
/** 물통 벽 굵기 · 막대 기준선 굵기(화면 px). */
const WALL_WIDTH = 2;
const GUIDE_WIDTH = 1;

/** 사각형 네 꼭짓점(아래 왼쪽부터 반시계). */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: BuoyancyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('buoyancy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const f = readFaces(readDepth(timeline, c), c);
  const out: Primitive[] = [];

  const halfW = c.boxWidth / 2;
  const yBottom = -f.bottomDepth;
  const yTop = yBottom + c.boxHeight;
  const yCenter = yBottom + c.boxHeight / 2;
  const k = c.arrowPerDepth;

  // ---- 물통 ----
  out.push({
    type: 'trajectory',
    id: 'tank',
    points: [
      [-TANK_HALF_WIDTH, TANK_RIM_Y],
      [-TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [TANK_HALF_WIDTH, TANK_RIM_Y],
    ],
    width: WALL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 상자 ---- 물보다 먼저 선언해 물이 잠긴 부분 위에 덮인다.
  out.push({
    type: 'body',
    id: 'block',
    pos: [0, yCenter],
    shape: 'rect',
    size: [c.boxWidth, c.boxHeight],
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 물 ----
  out.push({
    type: 'region',
    id: 'water',
    points: [
      [-TANK_HALF_WIDTH, 0],
      [TANK_HALF_WIDTH, 0],
      [TANK_HALF_WIDTH, TANK_FLOOR_Y],
      [-TANK_HALF_WIDTH, TANK_FLOOR_Y],
    ],
    ripple: { edge: [0, 1], amplitude: RIPPLE_PX },
    fillOpacity: WATER_FILL,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 옆면을 미는 힘 ---- 같은 높이의 왼쪽 · 오른쪽이 같은 길이로 마주 민다.
  SIDE_ARROW_FRACTIONS.forEach((frac, i) => {
    const depth = f.bottomDepth - frac * c.boxHeight;
    const len = k * depth;
    if (len < MIN_PUSH) return;
    const y = yBottom + frac * c.boxHeight;
    out.push({
      type: 'vector',
      id: `side-left-${i}`,
      from: [-halfW - len, y],
      delta: [len, 0],
      width: PUSH_WIDTH,
      opacity: alpha * SIDE_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'vector',
      id: `side-right-${i}`,
      from: [halfW + len, y],
      delta: [-len, 0],
      width: PUSH_WIDTH,
      opacity: alpha * SIDE_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // ---- 윗면 · 아랫면을 미는 힘 ---- 머리가 면에 닿는다. 길이가 그 면의 깊이를 따른다.
  const topLen = k * f.top;
  const bottomLen = k * f.bottom;
  FACE_ARROW_XS.forEach((dx, i) => {
    const x = dx * halfW;
    if (topLen >= MIN_PUSH) {
      out.push({
        type: 'vector',
        id: `push-top-${i}`,
        from: [x, yTop + topLen],
        delta: [0, -topLen],
        width: PUSH_WIDTH,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    if (bottomLen >= MIN_PUSH) {
      out.push({
        type: 'vector',
        id: `push-bottom-${i}`,
        from: [x, yBottom - bottomLen],
        delta: [0, bottomLen],
        width: PUSH_WIDTH,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  });

  // ---- 부력 ---- 아랫면이 더 받는 몫. 막대의 강조 몫과 같은 배율 · 같은 길이다.
  if (f.net > 0) {
    out.push({
      type: 'vector',
      id: 'buoyancy',
      from: [0, yCenter],
      delta: [0, c.barPerDepth * f.net],
      // 이름을 달지 않는다 — 가운데 틈이 좁아 이름이 화살표나 윗면 화살표에 얹힌다.
      // 같은 강조색 · 같은 길이의 막대 몫이 이름을 가진다.
      width: NET_WIDTH,
      outline: 'background',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 두 면의 힘 막대 ---- 같은 바닥에 나란히 세운다. 아랫면 막대는 윗면과 같이 받는
  // 만큼(먹색)과 더 받는 몫(강조색)으로 나뉜다. 깊이 가면 두 막대가 함께 자라고 강조 몫은 그대로다.
  const bk = c.barPerDepth;
  const topH = bk * f.top;
  const bottomH = bk * f.bottom;
  if (topH > 0) {
    out.push({
      type: 'region',
      id: 'bar-top',
      points: rect(BAR_TOP_X - BAR_HALF_WIDTH, BAR_BASE_Y, BAR_TOP_X + BAR_HALF_WIDTH, BAR_BASE_Y + topH),
      fillOpacity: BAR_FILL,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'region',
      id: 'bar-bottom-shared',
      points: rect(BAR_BOTTOM_X - BAR_HALF_WIDTH, BAR_BASE_Y, BAR_BOTTOM_X + BAR_HALF_WIDTH, BAR_BASE_Y + topH),
      fillOpacity: BAR_FILL,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 윗면 막대 꼭대기를 아랫면 막대까지 잇는다 — 어디서부터가 「더 받는 몫」 인지.
    out.push({
      type: 'trajectory',
      id: 'bar-guide',
      points: [
        [BAR_TOP_X - BAR_HALF_WIDTH, BAR_BASE_Y + topH],
        [BAR_BOTTOM_X + BAR_HALF_WIDTH, BAR_BASE_Y + topH],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }
  if (bottomH > topH) {
    out.push({
      type: 'region',
      id: 'bar-bottom-net',
      points: rect(
        BAR_BOTTOM_X - BAR_HALF_WIDTH,
        BAR_BASE_Y + topH,
        BAR_BOTTOM_X + BAR_HALF_WIDTH,
        BAR_BASE_Y + bottomH,
      ),
      fillOpacity: NET_FILL,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'net-label',
      anchor: {
        world: [BAR_BOTTOM_X + BAR_HALF_WIDTH, BAR_BASE_Y + (topH + bottomH) / 2],
        offset: [NET_LABEL_GAP, 0],
      },
      text: text('label.buoyancy'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: BAR_LABEL_PX,
      align: 'left',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 막대 기준선과 이름표 — 막대가 비어 있어도 자리는 남는다.
  out.push({
    type: 'trajectory',
    id: 'bar-base',
    points: [
      [BAR_TOP_X - BAR_HALF_WIDTH - 0.12, BAR_BASE_Y],
      [BAR_BOTTOM_X + BAR_HALF_WIDTH + 0.12, BAR_BASE_Y],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-label-top',
    anchor: { world: [BAR_TOP_X, BAR_LABEL_Y] },
    text: text('label.topFace'),
    chip: false,
    font: 'text',
    fontSize: BAR_LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'bar-label-bottom',
    anchor: { world: [BAR_BOTTOM_X, BAR_LABEL_Y] },
    text: text('label.bottomFace'),
    chip: false,
    font: 'text',
    fontSize: BAR_LABEL_PX,
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
