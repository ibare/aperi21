// ========================================================================
// kinetic-friction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 바닥은 `trajectory`(선) + `readout`(줄 이름), 자리 눈금은 `trace`(tick),
// 상자는 `body`(rect) 두 겹, 속도 · 마찰은 `vector` + `readout`(붙는 글자)이다.
// 원본의 픽셀 상수는 schema.ts 「배치」에 그대로 있고 이 파일은 옮기기만 한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import { readConstants, slideAt, tickPositions } from './physics';
import {
  LAYOUT,
  SCENE_BOUNDS,
  text,
  toUnit,
  worldX,
  worldY,
  type KineticFrictionMessageKey,
} from './schema';
import type { KineticFrictionState } from './state';

/** 바닥선 굵기(화면 px). 원본 2. */
const FLOOR_WIDTH_PX = 2;
/** 자리 눈금 굵기(화면 px). 원본 2. */
const TICK_WIDTH_PX = 2;
/** 속도 화살표 굵기(화면 px). 원본 2.5. */
const VELOCITY_WIDTH_PX = 2.5;
/** 마찰 화살표 굵기(화면 px). 원본 3. */
const FRICTION_WIDTH_PX = 3;
/** 상자 채움의 옅기. */
const BOX_FILL_OPACITY = 0.3;
// 상자 테두리 굵기는 테마의 가는 선이다(원본 2) — body 는 굵기를 받지 않는다.

/**
 * 원본은 글자를 기준선(alphabetic)에 맞췄고 readout 월드 앵커는 글 가운데에 놓는다.
 * 글 가운데는 기준선에서 글자 크기의 약 1/3 위다.
 */
const BASELINE_TO_MIDDLE = 1 / 3;

interface LaneDecl {
  id: 'fast' | 'slow';
  name: KineticFrictionMessageKey;
  floorYPx: number;
}

const LANES: readonly LaneDecl[] = [
  { id: 'fast', name: 'label.laneFast', floorYPx: LAYOUT.floorYFastPx },
  { id: 'slow', name: 'label.laneSlow', floorYPx: LAYOUT.floorYSlowPx },
];

/** 원본처럼 기준선 자리에 글자를 둔다. */
function label(
  id: string,
  key: KineticFrictionMessageKey,
  xPx: number,
  baselinePx: number,
  fontPx: number,
  align: 'left' | 'center',
  style: Readout['style'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: [worldX(xPx), worldY(baselinePx)], offset: [0, -fontPx * BASELINE_TO_MIDDLE] },
    text: text(key),
    chip: false,
    font: 'text',
    align,
    fontSize: fontPx,
    style,
  };
}

export function scene(params: {
  state: KineticFrictionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('kinetic-friction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  // 주기 안 시각 — 원본 `(t + OFFSET) % CYCLE`. 앞당김은 `startAt` 이 한다.
  const tc = timeline.u;
  const head = toUnit(LAYOUT.headPx);
  const out: Primitive[] = [];

  // ---- 바닥 · 줄 이름 ----
  LANES.forEach((lane) => {
    const fy = worldY(lane.floorYPx);
    out.push({
      type: 'trajectory',
      id: `floor-${lane.id}`,
      points: [
        [worldX(LAYOUT.floorInsetPx), fy],
        [worldX(LAYOUT.widthPx - LAYOUT.floorInsetPx), fy],
      ],
      width: FLOOR_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    out.push(
      label(
        `lane-name-${lane.id}`,
        lane.name,
        LAYOUT.laneNameXPx,
        lane.floorYPx - LAYOUT.laneNameDyPx,
        LAYOUT.laneNameFontPx,
        'left',
        { colorRole: 'muted', emphasis: 'strong' },
      ),
    );
  });

  // ---- 자리 눈금 ---- 1 초마다 상자 앞면이 있던 자리. 지워지지 않는다(age 없음).
  LANES.forEach((lane, i) => {
    const v0 = c.v0[i]!;
    const midPx = lane.floorYPx + (LAYOUT.tickTopDyPx + LAYOUT.tickBottomDyPx) / 2;
    const marks: Trace['marks'][number][] = tickPositions(v0, c.decel, c.tickEvery, tc).map((x) => ({
      pos: [worldX(LAYOUT.startXPx + x * LAYOUT.pxPerM), worldY(midPx)],
    }));
    out.push({
      type: 'trace',
      id: `ticks-${lane.id}`,
      marks,
      shape: 'tick',
      direction: [0, 1],
      size: toUnit(LAYOUT.tickBottomDyPx - LAYOUT.tickTopDyPx),
      width: TICK_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
  });

  // ---- 상자 ---- 두 상자는 같은 색이다(같은 대상).
  LANES.forEach((lane, i) => {
    const s = slideAt(c.v0[i]!, c.decel, tc);
    const front = LAYOUT.startXPx + s.x * LAYOUT.pxPerM;
    const center = [
      worldX(front - LAYOUT.boxWPx / 2),
      worldY(lane.floorYPx - LAYOUT.boxHPx / 2),
    ] as const;
    const size = [toUnit(LAYOUT.boxWPx), toUnit(LAYOUT.boxHPx)] as const;
    // 옅은 채움 위에 짙은 테두리 — 원본 두 색을 두 겹으로.
    const fill: Body = {
      type: 'body',
      id: `box-${lane.id}`,
      shape: 'rect',
      pos: center,
      size,
      outline: 'none',
      // 원본 채움은 거의 흰 회색(#e9ecef)이다. 가장 옅은 강조도 짙어 불투명도로 더 옅게 한다.
      opacity: BOX_FILL_OPACITY,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    const edge: Body = {
      type: 'body',
      id: `box-edge-${lane.id}`,
      shape: 'rect',
      pos: center,
      size,
      fill: 'none',
      outline: 'role',
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(fill, edge);
  });

  // ---- 속도 화살표 ---- 상자 위. 멈추면 사라진다.
  LANES.forEach((lane, i) => {
    const s = slideAt(c.v0[i]!, c.decel, tc);
    if (s.stopped || s.v <= 0) return;
    const front = LAYOUT.startXPx + s.x * LAYOUT.pxPerM;
    const x1 = front - LAYOUT.boxWPx / 2;
    const yPx = lane.floorYPx - LAYOUT.boxHPx - LAYOUT.velocityDyPx;
    const velocity: Vector = {
      type: 'vector',
      id: `velocity-${lane.id}`,
      from: [worldX(x1), worldY(yPx)],
      delta: [toUnit(s.v * LAYOUT.vPxPerMps), 0],
      headSize: head,
      width: VELOCITY_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(velocity);
    out.push(
      label(
        `velocity-label-${lane.id}`,
        'label.velocity',
        x1 + LAYOUT.velocityLabelDxPx,
        yPx - LAYOUT.velocityLabelDyPx,
        LAYOUT.arrowLabelFontPx,
        'left',
        { colorRole: 'ink', emphasis: 'strong' },
      ),
    );
  });

  // ---- 마찰 화살표 ---- 상자 뒷면 아래에서 왼쪽으로. 미끄러지는 내내 같은 길이, 멈추면 사라진다.
  LANES.forEach((lane, i) => {
    const s = slideAt(c.v0[i]!, c.decel, tc);
    if (s.stopped) return;
    const back = LAYOUT.startXPx + s.x * LAYOUT.pxPerM - LAYOUT.boxWPx;
    const yPx = lane.floorYPx - LAYOUT.frictionDyPx;
    const friction: Vector = {
      type: 'vector',
      id: `friction-${lane.id}`,
      from: [worldX(back), worldY(yPx)],
      delta: [-toUnit(LAYOUT.frictionPx), 0],
      headSize: head,
      width: FRICTION_WIDTH_PX,
      // 강조색은 마찰력 한 가지 뜻에만 쓴다.
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(friction);
    out.push(
      label(
        `friction-label-${lane.id}`,
        'label.friction',
        back - LAYOUT.frictionPx / 2,
        yPx - LAYOUT.frictionLabelDyPx,
        LAYOUT.arrowLabelFontPx,
        'center',
        { colorRole: 'accent', emphasis: 'strong' },
      ),
    );
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 원본 캔버스 전체. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
