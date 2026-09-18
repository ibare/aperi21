// ========================================================================
// drag-in-fluid — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 연기 · 염료(particleSystem),
// 두 몸(body circle · custom), 레인 경계(trajectory), 저항(vector), 이름표(readout).
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 두 몸은 먹색(다른 것은 모양뿐), 연기는 회색, 몸 뒤에서 흘린
// 염료는 보조색(두 레인 같은 칠). **강조색은 저항 한 뜻에만** — 두 화살표와 그 이름.
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
  arrowGrowth,
  arrowOpacity,
  readConstants,
  streamlinedShape,
  tracerVelocities,
  type DragInFluidConstants,
  type LaneKind,
} from './physics';
import { LAYOUT, text, type DragInFluidMessageKey } from './schema';
import type { DragInFluidState, LaneTracers } from './state';

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const SMOKE = { colorRole: 'muted', emphasis: 'strong' } as const;
const DYE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const DRAG = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 알갱이 크기(화면 px) · 꼬리. 연기는 옅게 물러나 있고 염료가 자국을 그린다. */
const SMOKE_SIZE = 1.3;
const SMOKE_OPACITY = 0.55;
const DYE_SIZE = 1.8;
const TRAIL = { seconds: 0.07, maxLength: 12, width: 1, opacity: 0.45 } as const;
/** 저항 화살표 — 뒤꼍에서 띄운 거리(월드) · 굵기 · 머리(화면 px). */
const ARROW_GAP = 5;
const ARROW_WIDTH = 3;
const ARROW_HEAD = 10;
/**
 * 저항 이름표가 화살표 위로 뜬 높이(월드). 끝이 아니라 **위**에 둔다 — 월드 앵커 칩은
 * `align` 을 무시하고 가운데에 놓여(장부 G122) 짧은 화살표 끝에 두면 화살표를 덮는다.
 */
const DRAG_LABEL_DY = 15;
/** 몸 이름표가 몸 위로 뜬 높이(월드). */
const NAME_DY = 16;

function svgPath(points: readonly (readonly [number, number])[]): string {
  return (
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z'
  );
}

interface Lane {
  kind: LaneKind;
  cy: number;
  name: DragInFluidMessageKey;
  /** 뒤꼍 x — 저항 화살표가 여기서 출발한다. */
  rear: number;
  /** 이름표 x — 몸 가운데. */
  nameX: number;
  cd: number;
}

function lanePrimitives(
  lane: Lane,
  tracers: LaneTracers,
  s: DragInFluidState,
  k: DragInFluidConstants,
  tl: TimelineFrame,
): Primitive[] {
  const off = (p: readonly [number, number]): Vec2 => [p[0], p[1] + lane.cy];
  const clip = {
    min: [LAYOUT.x0, lane.cy - LAYOUT.half] as Vec2,
    max: [LAYOUT.x1, lane.cy + LAYOUT.half] as Vec2,
  };
  const R = k.thickness / 2;
  const out: Primitive[] = [];

  // ---- 연기 · 염료 ----
  const smokeV = tracerVelocities(tracers.smoke, lane.kind, s.clock, k);
  out.push({
    type: 'particleSystem',
    id: `smoke-${lane.kind}`,
    positions: tracers.smoke.map((t) => off([t.x, t.y])),
    velocities: smokeV,
    sizes: SMOKE_SIZE,
    trail: true,
    trailStyle: TRAIL,
    opacity: SMOKE_OPACITY,
    clip,
    style: SMOKE,
  });
  const dyeV = tracerVelocities(tracers.dye, lane.kind, s.clock, k);
  out.push({
    type: 'particleSystem',
    id: `dye-${lane.kind}`,
    positions: tracers.dye.map((t) => off([t.x, t.y])),
    velocities: dyeV,
    sizes: DYE_SIZE,
    trail: true,
    trailStyle: TRAIL,
    clip,
    style: DYE,
  });

  // ---- 몸 — 같은 먹색. 다른 것은 뒤 모양뿐이다 ----
  if (lane.kind === 'cylinder') {
    out.push({
      type: 'body',
      id: 'body-cylinder',
      pos: [0, lane.cy],
      shape: 'circle',
      size: R,
      outline: 'none',
      glow: false,
      style: INK,
    });
  } else {
    out.push({
      type: 'body',
      id: 'body-streamlined',
      pos: [0, lane.cy],
      shape: 'custom',
      customPath: svgPath(streamlinedShape(k).outline),
      style: INK,
    });
  }
  out.push({
    type: 'readout',
    id: `name-${lane.kind}`,
    anchor: { world: [lane.nameX, lane.cy + R + NAME_DY] },
    text: text(lane.name),
    chip: true,
    align: 'center',
    font: 'text',
    fontSize: LAYOUT.labelPx,
    style: INK,
  });

  // ---- 저항 — 같은 배율. `drag` 동안 자라고 `fade` 에 거둔다 ----
  const grow = arrowGrowth(tl);
  const alpha = arrowOpacity(tl);
  if (grow > 0 && alpha > 0) {
    const len = lane.cd * k.arrowPerCd * grow;
    const x = lane.rear + ARROW_GAP;
    out.push({
      type: 'vector',
      id: `drag-${lane.kind}`,
      from: [x, lane.cy],
      delta: [len, 0],
      width: ARROW_WIDTH,
      headSize: ARROW_HEAD,
      outline: 'background',
      opacity: alpha,
      style: DRAG,
    });
    out.push({
      type: 'readout',
      id: `drag-name-${lane.kind}`,
      anchor: { world: [x + len / 2, lane.cy + DRAG_LABEL_DY] },
      text: text('label.drag'),
      chip: true,
      align: 'center',
      font: 'text',
      fontSize: LAYOUT.labelPx,
      opacity: alpha * Math.min(1, Math.max(0, grow * 2 - 1)),
      style: DRAG,
    });
  }
  return out;
}

export function scene(params: {
  state: DragInFluidState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state: s, stage, timeline } = params;
  if (!timeline) throw new Error('drag-in-fluid: schema.timeline 이 선언되어야 한다');
  const k = readConstants(stage);
  const sl = streamlinedShape(k);
  const R = k.thickness / 2;

  const out: Primitive[] = [];
  // 두 레인을 가르는 선. 두 흐름은 서로 닿지 않는다.
  out.push({
    type: 'trajectory',
    id: 'lane-divider',
    points: [
      [LAYOUT.x0, 0],
      [LAYOUT.x1, 0],
    ],
    width: 1,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  const top: Lane = {
    kind: 'cylinder',
    cy: LAYOUT.laneTop,
    name: 'label.cylinder',
    rear: R,
    nameX: 0,
    cd: k.cdCylinder,
  };
  const bottom: Lane = {
    kind: 'streamlined',
    cy: LAYOUT.laneBottom,
    name: 'label.streamlined',
    rear: sl.tail,
    nameX: (sl.tail - R) / 2,
    cd: k.cdStreamlined,
  };
  out.push(...lanePrimitives(top, s.cylinder, s, k, timeline));
  out.push(...lanePrimitives(bottom, s.streamlined, s, k, timeline));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return {
    minX: LAYOUT.x0,
    maxX: LAYOUT.x1,
    minY: LAYOUT.laneBottom - LAYOUT.half - LAYOUT.captionRoom,
    maxY: LAYOUT.laneTop + LAYOUT.half,
  };
}
