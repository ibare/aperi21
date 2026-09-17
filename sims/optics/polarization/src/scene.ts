// ========================================================================
// polarization — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 3 차원 장면을 원본과 같은 비스듬 시점으로 투영한 좌표(physics.ts `project`)를 월드 좌표로 쓴다.
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`) — 원본 그리기 순서 그대로.
//
// 색 — 진동은 모든 구간에서 같은 색(ink). 판 · 결 · 축선 · 각도 글자는 회색(muted).
// 강조색(accent)은 한 뜻에만 — 독자가 끼우고 돌리는 가운데 판의 축선과 각도 글자.
// 스크린에 닿은 빛은 밝기 자체가 주장이라 역할 색이 아니라 빛의 세기 채널(`colors: 'light'`)로 칠한다 —
// 두 테마에서 극성이 같다. 진동(전기장)은 대상 그림이라 역할 색(ink)을 쓴다 — 줄기 길이가 진폭이지 밝기가 아니다.
// ========================================================================

import type {
  Bounds,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  ScalarField,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import {
  clipToPlate,
  currentPose,
  degLabel,
  fieldSamples,
  project,
  relIntensity,
  screenBox,
  screenValues,
  type Pose,
} from './physics';
import {
  HALF,
  HATCH_GAP,
  HATCH_REACH,
  LIFT,
  SCENE_BOUNDS,
  SCREEN_GRID,
  SLOT_REACH,
  Z,
  text,
} from './schema';
import type { PolarizationState } from './state';

/**
 * 원본 색의 알파 — 같은 역할 색을 원본의 rgba 불투명도만큼 흐리게 쓴다.
 * 진동 띠 0.13 · 줄기 0.40, 판 채움 0.08 · 결 0.22 · 테두리 0.55, 빛길 중심선 0.35.
 */
const ALPHA = { sheet: 0.13, stem: 0.4, plateFill: 0.08, hatch: 0.22, edge: 0.55, axis: 0.35 } as const;
/** 원본 선 굵기(화면 px) — 곡선 1.8 · 줄기 1 · 결 1 · 축선 2.4 · 테두리 1.2 · 중심선 1. */
const WIDTH = { curve: 1.8, stem: 1, hatch: 1, slot: 2.4, edge: 1.2, axis: 1 } as const;
/** 판 각도 글자 — 원본 13 px, 판 왼쪽 아래 모서리에서 오른쪽으로 5 px. */
const LABEL_FONT_PX = 13;
const LABEL_OFFSET: Vec2 = [5, 0];

// ------------------------------------------------------------------------
// 빛의 전기장 진동
// ------------------------------------------------------------------------

function fieldPrimitives(t: number, pose: Pose): Primitive[] {
  const pts = fieldSamples(t, pose);

  // 진동면 띠 — 같은 묶음 · 구간이 이어지는 동안 축과 끝점 사이를 옅게 채운다. 묶음마다 원본의 닫힌
  // 경로를 한 다각형에 이어 붙인다(축 위로 되돌아오는 변은 넓이가 0 이라 채움이 달라지지 않는다).
  const sheet: Vec2[] = [];
  let run: typeof pts = [];
  const flush = (): void => {
    if (run.length > 1) {
      sheet.push(run[0]!.foot);
      for (const q of run) sheet.push(q.tip);
      sheet.push(run[run.length - 1]!.foot);
    }
    run = [];
  };
  for (const q of pts) {
    if (run.length && run[run.length - 1]!.key !== q.key) flush();
    run.push(q);
  }
  flush();

  // 끝점 곡선 — 묶음 · 구간 경계에서 끊는다.
  const curves: Vec2[][] = [];
  let cur: Vec2[] = [];
  let prevKey: number | null = null;
  for (const q of pts) {
    if (prevKey !== q.key && cur.length) {
      curves.push(cur);
      cur = [];
    }
    cur.push(q.tip);
    prevKey = q.key;
  }
  if (cur.length) curves.push(cur);

  const out: Primitive[] = [];
  if (sheet.length >= 3) {
    const band: Region = {
      type: 'region',
      id: 'field-sheet',
      points: sheet,
      fillOpacity: ALPHA.sheet,
      style: { colorRole: 'ink', emphasis: 'medium' },
    };
    out.push(band);
  }
  const stems: LineSet = {
    type: 'lineSet',
    id: 'field-stems',
    lines: pts.map((q) => [q.foot, q.tip]),
    width: WIDTH.stem,
    opacity: ALPHA.stem,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
  const curve: LineSet = {
    type: 'lineSet',
    id: 'field-curve',
    lines: curves.filter((c) => c.length >= 2),
    width: WIDTH.curve,
    style: { colorRole: 'ink', emphasis: 'medium' },
  };
  out.push(stems, curve);
  return out;
}

// ------------------------------------------------------------------------
// 편광판
// ------------------------------------------------------------------------

function plateCorners(z: number, yoff: number): Vec2[] {
  return [
    project(-HALF, -HALF + yoff, z),
    project(HALF, -HALF + yoff, z),
    project(HALF, HALF + yoff, z),
    project(-HALF, HALF + yoff, z),
  ];
}

function plate(
  id: string,
  z: number,
  phiDeg: number,
  yoff: number,
  slotRole: 'muted' | 'accent',
  label: Readout['text'],
  vars?: Readout['vars'],
): Primitive[] {
  const phi = (phiDeg * Math.PI) / 180;
  // 투과축 방향 u, 결 간격 방향 n (판 좌표 x 가로, y 세로).
  const ux = Math.sin(phi);
  const uy = Math.cos(phi);
  const nx = Math.cos(phi);
  const ny = -Math.sin(phi);
  const lift = (p: Vec2): Vec2 => project(p[0], p[1] + yoff, z);

  const hatch: Vec2[][] = [];
  for (let o = -HATCH_REACH; o <= HATCH_REACH + 1e-4; o += HATCH_GAP) {
    const seg = clipToPlate(
      [nx * o - ux * SLOT_REACH, ny * o - uy * SLOT_REACH],
      [nx * o + ux * SLOT_REACH, ny * o + uy * SLOT_REACH],
    );
    if (seg) hatch.push([lift(seg[0]), lift(seg[1])]);
  }
  const slotSeg = clipToPlate([-ux * SLOT_REACH, -uy * SLOT_REACH], [ux * SLOT_REACH, uy * SLOT_REACH]);
  const corners = plateCorners(z, yoff);

  const out: Primitive[] = [];
  const fill: Region = {
    type: 'region',
    id: `${id}-fill`,
    points: corners,
    fillOpacity: ALPHA.plateFill,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  const grain: LineSet = {
    type: 'lineSet',
    id: `${id}-grain`,
    lines: hatch,
    width: WIDTH.hatch,
    opacity: ALPHA.hatch,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(fill, grain);
  if (slotSeg) {
    const slot: Trajectory = {
      type: 'trajectory',
      id: `${id}-slot`,
      points: [lift(slotSeg[0]), lift(slotSeg[1])],
      width: WIDTH.slot,
      style: { colorRole: slotRole, emphasis: slotRole === 'accent' ? 'strong' : 'medium' },
    };
    out.push(slot);
  }
  const edge: Trajectory = {
    type: 'trajectory',
    id: `${id}-edge`,
    points: corners,
    closed: true,
    width: WIDTH.edge,
    opacity: ALPHA.edge,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  const tag: Readout = {
    type: 'readout',
    id: `${id}-label`,
    anchor: { world: project(-HALF, HALF + yoff, z), offset: LABEL_OFFSET },
    text: label,
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align: 'left',
    style: { colorRole: slotRole, emphasis: slotRole === 'accent' ? 'strong' : 'medium' },
  };
  out.push(edge, tag);
  return out;
}

// ------------------------------------------------------------------------
// 스크린
// ------------------------------------------------------------------------

function screen(pose: Pose): Primitive[] {
  const box = screenBox();
  const glow: ScalarField = {
    type: 'scalarField',
    id: 'screen-glow',
    min: box.min,
    max: box.max,
    cols: SCREEN_GRID.cols,
    rows: SCREEN_GRID.rows,
    values: screenValues(relIntensity(pose)),
    range: [0, 1],
    colors: 'light',
  };
  const edge: Trajectory = {
    type: 'trajectory',
    id: 'screen-edge',
    points: plateCorners(Z.screen, 0),
    closed: true,
    width: WIDTH.edge,
    opacity: ALPHA.edge,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  return [glow, edge];
}

// ------------------------------------------------------------------------
// 조립
// ------------------------------------------------------------------------

export function scene(params: { state: PolarizationState; timeline?: TimelineFrame }): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const pose = currentPose(params.state, tl);

  const axis: Trajectory = {
    type: 'trajectory',
    id: 'beam-axis',
    points: [project(0, 0, Z.start), project(0, 0, Z.screen)],
    width: WIDTH.axis,
    opacity: ALPHA.axis,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  };

  return [
    axis,
    ...fieldPrimitives(tl.t, pose),
    ...plate('plate-first', Z.p1, 0, 0, 'muted', text('label.first')),
    ...plate('plate-middle', Z.p2, pose.thetaDeg, LIFT * (1 - pose.inserted), 'accent', text('label.middle'), {
      deg: degLabel(pose.thetaDeg),
    }),
    ...plate('plate-last', Z.p3, 90, 0, 'muted', text('label.last')),
    ...screen(pose),
  ];
}

/** 고정 프레이밍 — 원본 캔버스 사각형에 캡션 · 조작 줄을 더한 것. 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
