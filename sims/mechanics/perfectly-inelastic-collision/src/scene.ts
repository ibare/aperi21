// ========================================================================
// perfectly-inelastic-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 화면에 있는 것은 레일 · 수레 둘 · 그 위에 쌓인 운동량 칸 여덟 · 기둥 옆 속력
// 표식 · 수레 아래 질량 표식, 그리고 붙기 전 기둥의 자리를 남긴 점선 테두리다.
//
// 색은 두 가지 뜻만 쓴다 — 물체(먹색)와 운동량 칸(보조색). 두 수레는 같은 대상이라
// 같은 색이고, 가르는 것은 폭(질량)뿐이다. 강조색은 쓰지 않는다 (S-piece).
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
  episodeOf,
  layoutOf,
  movingLeft,
  phaseOf,
  readConstants,
  revealOf,
  spreadOf,
  tileCells,
} from './physics';
import {
  CART_H,
  COLUMN_BASE,
  HEIGHT_PER_SPEED,
  RAIL_Y,
  SCENE_BOUNDS,
  STRUCK_LEFT,
  TILE_GAP,
  TILE_H,
  TILE_W,
  text,
} from './schema';
import type { PerfectlyInelasticCollisionState } from './state';

/** 레일 굵기(화면 px). 바닥은 안내선이라 가늘다. */
const RAIL_WIDTH_PX = 1.2;
/** 붙기 전 기둥의 자리를 남긴 테두리 굵기(화면 px). */
const GHOST_WIDTH_PX = 1.4;
/** 질량 표식이 레일 아래로 내려가는 거리(화면 px). */
const MASS_LABEL_OFFSET: Vec2 = [0, 16];
/** 속력 표식이 기둥 왼쪽으로 나오는 거리(화면 px). */
const SPEED_LABEL_OFFSET: Vec2 = [-9, 0];
/** 표식 글자 크기(화면 px). */
const LABEL_FONT_PX = 14;
/** 칸의 채움 — 겹쳐도 짙어지지 않게 불투명하게 깐다(퍼지는 동안 잠깐 겹친다). */
const TILE_FILL = 0.62;

/** 네 모서리로 사각형 하나. 왼쪽 아래에서 시계 반대 방향. */
function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

export function scene(params: {
  state: PerfectlyInelasticCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) {
    throw new Error('perfectly-inelastic-collision: schema.timeline 이 선언되어야 한다');
  }
  const c = readConstants(stage);
  const ep = episodeOf(timeline.phase);
  const lay = layoutOf(ep, c);
  const phase = phaseOf(timeline, ep);
  const reveal = revealOf(timeline, ep);
  const spread = spreadOf(timeline, ep);
  const left = movingLeft(timeline, ep, lay, c);
  const struckLeft = phase === 'before' ? STRUCK_LEFT : left + lay.widthA;

  const g: Primitive[] = [];

  // ── 레일 ──
  // 나타나고 사라지는 것은 수레와 칸이다. 레일은 늘 같은 자리에 있어야 갈아 끼우는
  // 순간이 깜빡이지 않는다.
  g.push({
    type: 'trajectory',
    id: 'rail',
    points: [
      [SCENE_BOUNDS.minX, RAIL_Y],
      [SCENE_BOUNDS.maxX, RAIL_Y],
    ],
    width: RAIL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 수레 둘 ──
  // 폭이 곧 질량이다. 붙은 뒤에는 두 사각형이 맞닿아 한 덩어리로 읽힌다 —
  // 둘레 선이 맞닿은 자리에 이음매를 남긴다.
  g.push({
    type: 'body',
    id: 'cart-moving',
    pos: [left + lay.widthA / 2, RAIL_Y + CART_H / 2],
    shape: 'rect',
    size: [lay.widthA, CART_H],
    opacity: reveal,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  g.push({
    type: 'body',
    id: 'cart-struck',
    pos: [struckLeft + lay.widthB / 2, RAIL_Y + CART_H / 2],
    shape: 'rect',
    size: [lay.widthB, CART_H],
    opacity: reveal,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 수레 아래 질량 표식 ──
  g.push({
    type: 'readout',
    id: 'mass-moving',
    anchor: { world: [left + lay.widthA / 2, RAIL_Y], offset: MASS_LABEL_OFFSET },
    text: text('label.mass1'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_FONT_PX,
    align: 'center',
    opacity: reveal,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  g.push({
    type: 'readout',
    id: 'mass-struck',
    anchor: { world: [struckLeft + lay.widthB / 2, RAIL_Y], offset: MASS_LABEL_OFFSET },
    text: text(ep.massLabel),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_FONT_PX,
    align: 'center',
    opacity: reveal,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 붙기 전 기둥의 자리 ──
  // 함께 가는 동안만 남긴다. 낮고 넓은 기둥 옆에 높고 좁은 테두리가 서 있어야
  // "같은 넓이" 가 눈으로 견줘진다.
  if (phase === 'after') {
    const ghostTop = COLUMN_BASE + c.speedA * HEIGHT_PER_SPEED;
    g.push({
      type: 'trajectory',
      id: 'column-before',
      points: rect(left, COLUMN_BASE, left + lay.widthA, ghostTop),
      closed: true,
      width: GHOST_WIDTH_PX,
      opacity: reveal,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ── 운동량 칸 ──
  // 칸 하나가 운동량 한 몫이다. 달려오는 수레 위에 여덟 개가 두 칸씩 네 줄로 쌓여
  // 있고, 붙는 동안 아래 줄은 남고 위 줄이 오른쪽으로 흘러내려 두 수레를 덮는다.
  // 칸이 새로 생기거나 사라지지 않는 것이 이 조각이 보이려는 것이다.
  tileCells(lay, spread).forEach((cell, i) => {
    const x0 = left + cell.col * TILE_W + TILE_GAP / 2;
    const y0 = COLUMN_BASE + cell.row * TILE_H + TILE_GAP / 2;
    g.push({
      type: 'region',
      id: `tile-${i}`,
      points: rect(x0, y0, x0 + TILE_W - TILE_GAP, y0 + TILE_H - TILE_GAP),
      fillOpacity: TILE_FILL,
      opaque: true,
      opacity: reveal,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  });

  // ── 기둥 옆 속력 표식 ──
  // 기둥의 높이가 곧 속력이라는 것을 이 글자 하나가 말한다. 퍼지는 동안에는 기둥이
  // 사각형이 아니라 높이가 하나로 정해지지 않으므로 붙이지 않는다.
  if (phase !== 'merge') {
    const speed = phase === 'before' ? c.speedA : lay.speedAfter;
    const top = COLUMN_BASE + speed * HEIGHT_PER_SPEED;
    g.push({
      type: 'readout',
      id: 'speed-label',
      anchor: { world: [left, (COLUMN_BASE + top) / 2], offset: SPEED_LABEL_OFFSET },
      text: phase === 'before' ? text('label.speed') : text('label.speedAfter'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      align: 'right',
      opacity: reveal,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이다 — 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
