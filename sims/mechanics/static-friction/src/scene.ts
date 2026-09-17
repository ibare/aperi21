// ========================================================================
// static-friction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 바닥은 `trajectory`(선) + `trace`(tick 빗금), 상자는 `body`(rect) 두 겹,
// 한계 표시는 `trajectory`(점선 · 눈금) + `readout`, 두 힘은 `vector` 다.
// 원본의 픽셀 상수는 schema.ts 「배치」에 그대로 있고 이 파일은 옮기기만 한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Trace,
  TimelineFrame,
  Trajectory,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import { readConstants, readingAt } from './physics';
import { LAYOUT, SCENE_BOUNDS, text, toUnit, worldX, worldY } from './schema';
import type { StaticFrictionState } from './state';

/** 바닥선 굵기(화면 px). 원본 2. */
const FLOOR_WIDTH_PX = 2;
/** 바닥 결 굵기(화면 px). 원본 1. */
const GRAIN_WIDTH_PX = 1;
// 상자 테두리 굵기는 테마의 가는 선이다(원본 1.5) — body 는 굵기를 받지 않는다.
/** 두 힘 화살표 굵기(화면 px). 원본 5 — 같은 굵기라야 길이만 비교된다. */
const FORCE_WIDTH_PX = 5;
/** 한계 점선 · 눈금 굵기(화면 px). 원본 1.5 · 2.5. */
const LIMIT_LINE_PX = 1.5;
const LIMIT_TICK_PX = 2.5;
/** 미끄러지는 동안 한계 표시의 옅기. 원본 0.55. */
const LIMIT_ALPHA_MOVING = 0.55;
/** 정지 중 한계 표시의 옅기 — 0.35 에서 마찰이 한계에 가까워질수록 세제곱으로 또렷해진다. */
const LIMIT_ALPHA_BASE = 0.35;
const LIMIT_ALPHA_GAIN = 0.65;
const LIMIT_ALPHA_POWER = 3;

export function scene(params: {
  state: StaticFrictionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('static-friction: schema.timeline 이 선언되어야 한다');
  const r = readingAt(timeline, readConstants(stage));
  const out: Primitive[] = [];

  // ---- 바닥 ---- 흐려지지 않는다. 주기가 되풀이되는 동안 늘 그 자리에 있다.
  const floor: Trajectory = {
    type: 'trajectory',
    id: 'floor',
    points: [
      [worldX(LAYOUT.floorInsetPx), 0],
      [worldX(LAYOUT.widthPx - LAYOUT.floorInsetPx), 0],
    ],
    width: FLOOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(floor);

  // 거친 결 — 바닥선에서 왼쪽 아래로 내린 짧은 빗금. tick 은 가운데를 기준으로 긋는다.
  const grain: Trace['marks'][number][] = [];
  const run = LAYOUT.grainRunPx;
  for (let gx = LAYOUT.grainStartPx; gx < LAYOUT.widthPx - LAYOUT.floorInsetPx; gx += LAYOUT.grainStepPx) {
    grain.push({ pos: [worldX(gx - run / 2), worldY(LAYOUT.floorYPx + run / 2)] });
  }
  out.push({
    type: 'trace',
    id: 'floor-grain',
    marks: grain,
    shape: 'tick',
    direction: [-1, -1],
    size: toUnit(Math.hypot(run, run)),
    width: GRAIN_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 상자 ----
  const bx = LAYOUT.boxX0Px + r.slid * LAYOUT.slideDistPx;
  const bcx = bx + LAYOUT.boxWPx / 2;
  const boxCenter = [worldX(bcx), worldY(LAYOUT.floorYPx - LAYOUT.boxHPx / 2)] as const;
  const boxSize = [toUnit(LAYOUT.boxWPx), toUnit(LAYOUT.boxHPx)] as const;
  // 채움과 테두리를 두 겹으로 — 옅은 채움 위에 한 단 짙은 테두리(원본 두 색).
  const boxFill: Body = {
    type: 'body',
    id: 'box',
    shape: 'rect',
    pos: boxCenter,
    size: boxSize,
    outline: 'none',
    opacity: r.alpha,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const boxEdge: Body = {
    type: 'body',
    id: 'box-edge',
    shape: 'rect',
    pos: boxCenter,
    size: boxSize,
    fill: 'none',
    outline: 'role',
    opacity: r.alpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(boxFill, boxEdge);

  // ---- 마찰 한계 표시 ---- 마찰 화살표가 뻗는 끝에 미리 그어 둔다.
  const fy = worldY(LAYOUT.floorYPx + LAYOUT.frictionDyPx);
  const tipPx = bcx - LAYOUT.pxPerFs;
  const near = r.moving
    ? LIMIT_ALPHA_MOVING
    : LIMIT_ALPHA_BASE + LIMIT_ALPHA_GAIN * Math.pow(r.friction, LIMIT_ALPHA_POWER);
  const limitAlpha = r.alpha * near;
  const half = toUnit(LAYOUT.limitTickHalfPx);
  out.push({
    type: 'trajectory',
    id: 'limit-reach',
    points: [
      [worldX(bcx), fy],
      [worldX(tipPx), fy],
    ],
    width: LIMIT_LINE_PX,
    opacity: limitAlpha,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'limit-tick',
    points: [
      [worldX(tipPx), fy + half],
      [worldX(tipPx), fy - half],
    ],
    width: LIMIT_TICK_PX,
    opacity: limitAlpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  const limitLabel: Readout = {
    type: 'readout',
    id: 'limit-label',
    // 원본은 글 윗변을 눈금 아래 15 px 에 맞췄다. readout 은 글 가운데로 놓으므로 반 줄 더 내린다.
    anchor: {
      world: [worldX(Math.max(LAYOUT.limitLabelMinXPx, tipPx)), fy],
      offset: [0, LAYOUT.limitLabelDyPx + LAYOUT.limitLabelFontPx / 2],
    },
    text: text('label.limit'),
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: LAYOUT.limitLabelFontPx,
    opacity: limitAlpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(limitLabel);

  // ---- 두 힘 ---- 같은 축척(PX_PER_FS)으로 상자 양쪽에 뻗는다.
  const head = toUnit(LAYOUT.headPx);
  const friction: Vector = {
    type: 'vector',
    id: 'friction',
    from: [worldX(bcx), fy],
    delta: [-toUnit(r.friction * LAYOUT.pxPerFs), 0],
    headSize: head,
    width: FORCE_WIDTH_PX,
    opacity: r.alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  const pull: Vector = {
    type: 'vector',
    id: 'pull',
    from: [worldX(bx + LAYOUT.boxWPx), boxCenter[1]],
    delta: [toUnit(r.pull * LAYOUT.pxPerFs), 0],
    headSize: head,
    width: FORCE_WIDTH_PX,
    opacity: r.alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(friction, pull);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 원본 캔버스와 캡션 한 줄. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
