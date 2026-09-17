// ========================================================================
// balance-scale — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 수평 기준선(trajectory 점선) · 받침대(region 둘) · 저울대(trajectory 굵은 선) ·
// 받침점 구멍(body circle) · 거리 눈금(trace tick) · 추(body rect). 자유 렌더 계층을
// 쓰지 않는다. 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
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
import { beamPoint, readConstants } from './physics';
import {
  BEAM_WIDTH_PX,
  BLOCK,
  BLOCK_GAP,
  BLOCK_LIFT,
  HALF,
  LEVEL_OVERHANG,
  NOTCHES,
  PIVOT_HOLE,
  PLATE_HALF,
  PLATE_THICK,
  SCENE_BOUNDS,
  STAND_HALF,
  STAND_HEIGHT,
  STAND_TOP,
  TICK_FAR,
  TICK_NEAR,
  TICK_WIDTH_PX,
  UNIT,
} from './schema';
import type { BalanceScaleState } from './state';

// ------------------------------------------------------------------------
// 색 — 원본 팔레트를 색 역할로. 강조색은 쓰지 않는다 (원본 그대로).
// 원본의 옅은 회색 둘은 먹이 아닌 `muted` 를 바탕 위에 **빛의 양**으로 얹어 옮겼다.
// ------------------------------------------------------------------------

/** 저울대. 원본 --ink #2b2b2b. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 받침대 · 눈금. 원본 --soft #9a968d. */
const SOFT = { colorRole: 'muted', emphasis: 'strong' } as const;
const SOFT_LUMINANCE = 0.8;
/** 수평 기준선. 원본 --faint #d9d5cc. */
const FAINT_LUMINANCE = 0.35;
/**
 * 추 둘 — 같은 대상이라 같은 색. 원본 --weight #5b6f86 (청회색).
 * 테마에 청회색 역할이 없다. 먹을 빛의 양으로 얹으면 받침대와 같은 무채 회색이 되어
 * 다른 대상과 섞이므로, 파랑(`secondary`)을 조금 옅게 얹어 청색 계열을 지킨다.
 */
const WEIGHT = { colorRole: 'secondary', emphasis: 'strong' } as const;
const WEIGHT_LUMINANCE = 0.9;
/** 받침점 구멍 — 바탕색. 빛의 양 0 이면 바탕 그대로다. */
const HOLE_LUMINANCE = 0;

/** 블록 `count` 개를 저울대 위 `s` 자리에 쌓는다. 원본 drawBlocks. */
function blocks(id: string, s: number, count: number, theta: number): Body[] {
  const out: Body[] = [];
  for (let i = 0; i < count; i++) {
    const up = BLOCK_LIFT + BLOCK * i + BLOCK_GAP * i + BLOCK / 2;
    out.push({
      type: 'body',
      id: `${id}-${i}`,
      pos: beamPoint(s, up, theta),
      shape: 'rect',
      size: [BLOCK, BLOCK],
      orientation: -theta,
      outline: 'none',
      style: WEIGHT,
      luminance: WEIGHT_LUMINANCE,
    });
  }
  return out;
}

export function scene(params: {
  state: BalanceScaleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const theta = state.theta;
  const out: Primitive[] = [];

  // ---- 수평 기준선 ----
  // 동사가 「수평으로 돌아온다」 라서 수평을 판정할 기준이 필요하다.
  const levelLine: Trajectory = {
    type: 'trajectory',
    id: 'level-line',
    points: [
      [-HALF - LEVEL_OVERHANG, 0],
      [HALF + LEVEL_OVERHANG, 0],
    ],
    width: 1,
    style: { ...SOFT, lineStyle: 'dashed' },
    luminance: FAINT_LUMINANCE,
  };
  out.push(levelLine);

  // ---- 받침대 ----
  const stand: Region = {
    type: 'region',
    id: 'stand',
    points: [
      [0, -STAND_TOP],
      [-STAND_HALF, -STAND_HEIGHT],
      [STAND_HALF, -STAND_HEIGHT],
    ],
    fillOpacity: 1,
    style: SOFT,
    luminance: SOFT_LUMINANCE,
  };
  const plate: Region = {
    type: 'region',
    id: 'stand-plate',
    points: [
      [-PLATE_HALF, -STAND_HEIGHT],
      [PLATE_HALF, -STAND_HEIGHT],
      [PLATE_HALF, -STAND_HEIGHT - PLATE_THICK],
      [-PLATE_HALF, -STAND_HEIGHT - PLATE_THICK],
    ],
    fillOpacity: 1,
    style: SOFT,
    luminance: SOFT_LUMINANCE,
  };
  out.push(stand, plate);

  // ---- 저울대 + 받침점 구멍 ----
  const beam: Trajectory = {
    type: 'trajectory',
    id: 'beam',
    points: [beamPoint(-HALF, 0, theta), beamPoint(HALF, 0, theta)],
    width: BEAM_WIDTH_PX,
    style: INK,
  };
  const hole: Body = {
    type: 'body',
    id: 'pivot-hole',
    pos: [0, 0],
    shape: 'circle',
    size: PIVOT_HOLE,
    outline: 'none',
    glow: false,
    style: INK,
    luminance: HOLE_LUMINANCE,
  };
  out.push(beam, hole);

  // ---- 거리 눈금 ----
  // 주장이 「두 배 멀리」 라서 거리를 셀 수 있어야 한다. 저울대와 함께 기운다.
  const normal: Vec2 = [Math.sin(theta), Math.cos(theta)];
  const marks: Trace['marks'][number][] = [];
  for (const side of [-1, 1]) {
    for (let i = 1; i <= NOTCHES; i++) {
      marks.push({ pos: beamPoint(side * i * UNIT, -(TICK_NEAR + TICK_FAR) / 2, theta) });
    }
  }
  const ticks: Trace = {
    type: 'trace',
    id: 'arm-ticks',
    marks,
    shape: 'tick',
    size: TICK_FAR - TICK_NEAR,
    direction: normal,
    width: TICK_WIDTH_PX,
    style: SOFT,
    luminance: SOFT_LUMINANCE,
  };
  out.push(ticks);

  // ---- 추 ----
  // 무게는 블록 개수로, 거리는 눈금 칸 수로 보인다. 숫자를 쓰지 않는다.
  out.push(...blocks('heavy', -c.heavyArm * UNIT, Math.round(c.heavyMass), theta));
  out.push(...blocks('light', state.xLight * UNIT, Math.round(c.lightMass), theta));

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
