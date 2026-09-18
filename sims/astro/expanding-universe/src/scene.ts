// ========================================================================
// expanding-universe — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 공간 격자 · 지나온 자취(lineSet),
// 은하 · 처음 자리(particleSystem), 줄 선 은하 · 관찰 고리(body), 속도(vector), 거리(dimension),
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 흩뿌린 은하는 모두 같은 대상이라 한 색(secondary), **강조색은 「관찰
// 은하에서 d · 2d 떨어진 두 은하와 그 속도」 한 가지 뜻에만** 쓴다. 관찰 은하는 먹색, 공간
// 격자 · 처음 자리 · 자취는 배경 정보라 muted.
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
  readConstants,
  readExpansion,
  recession,
  rowGalaxies,
  scatteredGalaxies,
  stretched,
  type Expansion,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ExpandingUniverseState } from './state';

/** 공간 격자 선 굵기(화면 px) · 짙기. 무대라 가장 옅다. */
const GRID_WIDTH = 1;
const GRID_OPACITY = 0.35;
/** 격자를 경계 밖으로 더 까는 칸 수 — 늘어나며 가장자리가 화면 안으로 들어오지 않게. */
const GRID_MARGIN_CELLS = 5;
/** 흩뿌린 은하 반지름(화면 px) — 은하마다 이 사이. */
const GALAXY_MIN_PX = 1.8;
const GALAXY_MAX_PX = 3.4;
/** 처음 자리(늘기 전) 표지 — 작고 옅은 점. 지나온 거리의 출발점이다. */
const GHOST_PX = 1.4;
const GHOST_OPACITY = 0.55;
/** 지나온 자취 굵기(화면 px) · 짙기. */
const TRAIL_WIDTH = 1.2;
const TRAIL_OPACITY = 0.7;
/** 줄 선 은하의 크기(월드 반지름). */
const ROW_GALAXY_SIZE = 0.085;
/** 관찰 고리 반지름(월드) · 굵기는 body 둘레 기본. */
const OBSERVER_RING_SIZE = 0.2;
/** 관찰 이름표를 고리 위로 띄우는 거리(화면 px). */
const OBSERVER_LABEL_OFFSET: Vec2 = [0, -26];
const LABEL_PX = 12;
/** 속도 화살표 굵기(화면 px). */
const ARROW_WIDTH = 2.4;
/** 치수선 두 줄이 줄 아래로 놓이는 깊이(월드). 흩뿌린 은하를 두지 않는 띠(physics) 안이다. */
const DIM_DEPTH_NEAR = 0.38;
const DIM_DEPTH_FAR = 0.78;
/** 관찰 고리가 은하에 도착했다고 볼 거리(월드). */
const ARRIVED_EPS = 1e-6;

/** 공변 좌표의 격자 선 — 가운데 은하를 지나는 선을 기준으로 간격마다. */
function gridLines(rowX: number, rowY: number, step: number, e: Expansion): Vec2[][] {
  const m = GRID_MARGIN_CELLS * step;
  const x0 = SCENE_BOUNDS.minX - m;
  const x1 = SCENE_BOUNDS.maxX + m;
  const y0 = SCENE_BOUNDS.minY - m;
  const y1 = SCENE_BOUNDS.maxY + m;
  const lines: Vec2[][] = [];
  for (let k = Math.ceil((x0 - rowX) / step); rowX + k * step <= x1; k++) {
    const x = rowX + k * step;
    lines.push([stretched([x, y0], e), stretched([x, y1], e)]);
  }
  for (let k = Math.ceil((y0 - rowY) / step); rowY + k * step <= y1; k++) {
    const y = rowY + k * step;
    lines.push([stretched([x0, y], e), stretched([x1, y], e)]);
  }
  return lines;
}

export function scene(params: {
  state: ExpandingUniverseState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('expanding-universe: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const e = readExpansion(timeline, c);
  const alpha = e.alpha;
  const out: Primitive[] = [];
  if (alpha <= 0) return out;

  const row = rowGalaxies(c);
  const galaxies = scatteredGalaxies(c);

  // ---- 공간 격자 — 공간 자체. 은하와 함께 늘어난다 ----
  out.push({
    type: 'lineSet',
    id: 'space-grid',
    lines: gridLines(c.rowX, c.rowY, c.gridStep, e),
    width: GRID_WIDTH,
    opacity: GRID_OPACITY * alpha,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 처음 자리와 지나온 자취 — 늘이기가 시작된 뒤 ----
  // 자취는 관찰 은하에서 곧게 뻗어 나가는 쪽을 향하고, 길이가 거리에 비례한다.
  const allQ: Vec2[] = [...galaxies.map((g) => g.q), row.left, row.middle, row.right];
  if (e.stretching) {
    out.push({
      type: 'particleSystem',
      id: 'start-places',
      positions: allQ,
      sizes: GHOST_PX,
      opacity: GHOST_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: 'trails',
      lines: allQ.map((q) => [q, stretched(q, e)]),
      width: TRAIL_WIDTH,
      opacity: TRAIL_OPACITY * alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 흩뿌린 은하 ----
  out.push({
    type: 'particleSystem',
    id: 'galaxies',
    positions: galaxies.map((g) => stretched(g.q, e)),
    sizes: galaxies.map((g) => GALAXY_MIN_PX + (GALAXY_MAX_PX - GALAXY_MIN_PX) * g.size),
    opacity: alpha,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 줄 선 세 은하 ----
  // 관찰 고리가 앉은 은하가 관찰 은하(먹색), 나머지 둘이 d · 2d 은하(강조색)다. 고리가
  // 옮겨 가는 동안에는 셋 다 강조색 — 아직 아무 데도 서지 않았다.
  const rowList: { id: string; q: Vec2 }[] = [
    { id: 'row-left', q: row.left },
    { id: 'row-middle', q: row.middle },
    { id: 'row-right', q: row.right },
  ];
  // 고리가 가운데 은하를 스쳐 지나는 순간에도 먹색이 되면 「가운데에 섰다」 로 읽힌다 —
  // 옮겨 가기(`move`)가 끝난 뒤에만 도착으로 본다.
  const arrived = e.side === 'left' || timeline.at('move') >= 1;
  const isObserver = (q: Vec2): boolean =>
    arrived && Math.hypot(q[0] - e.observer[0], q[1] - e.observer[1]) < ARRIVED_EPS;
  for (const g of rowList) {
    out.push({
      type: 'body',
      id: g.id,
      pos: stretched(g.q, e),
      shape: 'circle',
      size: ROW_GALAXY_SIZE,
      outline: 'none',
      glow: false,
      opacity: alpha,
      style: { colorRole: isObserver(g.q) ? 'ink' : 'accent', emphasis: 'strong' },
    });
  }

  // ---- 속도와 거리 — 관찰 은하에서 본 d · 2d 은하 ----
  if (e.stretching) {
    const far = e.side === 'left' ? row.right : row.left;
    const measured: { id: string; q: Vec2; speed: 'label.nearSpeed' | 'label.farSpeed' }[] = [
      { id: 'speed-near', q: row.middle, speed: 'label.nearSpeed' },
      { id: 'speed-far', q: far, speed: 'label.farSpeed' },
    ];
    for (const m of measured) {
      const pos = stretched(m.q, e);
      const v = recession(pos, e, c);
      out.push({
        type: 'vector',
        id: m.id,
        from: pos,
        delta: [v[0] * c.arrowSeconds, v[1] * c.arrowSeconds],
        label: text(m.speed),
        width: ARROW_WIDTH,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    const o = e.observer;
    const near = stretched(row.middle, e);
    const farPos = stretched(far, e);
    out.push({
      type: 'dimension',
      id: 'distance-near',
      from: [o[0], o[1] - DIM_DEPTH_NEAR],
      to: [near[0], near[1] - DIM_DEPTH_NEAR],
      text: text('label.near'),
      opacity: alpha,
    });
    out.push({
      type: 'dimension',
      id: 'distance-far',
      from: [o[0], o[1] - DIM_DEPTH_FAR],
      to: [farPos[0], farPos[1] - DIM_DEPTH_FAR],
      text: text('label.far'),
      opacity: alpha,
    });
  }

  // ---- 관찰 고리 — 「여기서 본다」 ----
  out.push({
    type: 'body',
    id: 'observer-ring',
    pos: e.observer,
    shape: 'circle',
    size: OBSERVER_RING_SIZE,
    fill: 'none',
    outline: 'role',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'observer-label',
    anchor: { world: e.observer, offset: OBSERVER_LABEL_OFFSET },
    text: text('label.observer'),
    font: 'text',
    chip: true,
    fontSize: LABEL_PX,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
