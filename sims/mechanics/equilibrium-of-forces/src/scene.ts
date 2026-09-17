// ========================================================================
// equilibrium-of-forces — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 천장(trajectory) · 도르래(body circle 테두리 + 가운데 점) · 줄(trajectory) ·
// 추(body rect 채움 + trajectory 테두리) · 매듭(body circle) · 알짜힘(vector 강조색) ·
// 끝과 끝으로 이은 세 힘(vector 먹색 + trace tick 칸 눈금) · 틈(vector 강조색 점선).
// 자유 렌더 계층을 쓰지 않는다. 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { forces, outerTop, readConstants, tangentTop } from './physics';
import {
  ARROW_HEAD,
  ARROW_WIDTH_PX,
  BLOCK_EDGE_PX,
  BLOCK_GAP,
  BLOCK_H,
  BLOCK_W,
  CEILING_LEFT,
  CEILING_RIGHT,
  CEILING_WIDTH_PX,
  HANG,
  KNOT_R,
  ORIGIN_DOT,
  POLYGON_ORIGIN,
  POST_WIDTH_PX,
  PULLEY_HUB,
  PULLEY_LEFT,
  PULLEY_R,
  PULLEY_RIGHT,
  ROPE_WIDTH_PX,
  SCENE_BOUNDS,
  TICK_LEN,
  TICK_WIDTH_PX,
  UNIT,
} from './schema';
import type { EquilibriumOfForcesState } from './state';

// ------------------------------------------------------------------------
// 색 — 원본 팔레트를 색 역할로. 강조색은 **알짜힘 하나**에만 쓴다 (원본 그대로).
// ------------------------------------------------------------------------

/** 천장 · 도르래 · 추 테두리 · 매듭 · 세 힘. 원본 --ink #2b2b2b. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 줄. 원본 --rope #8a8a8a — 먹이 아닌 `muted` 를 빛의 양으로 얹었다. */
const ROPE = { colorRole: 'muted', emphasis: 'strong' } as const;
const ROPE_LUMINANCE = 0.9;
/** 추 채움. 원본 --block #e6e3dc — 옅은 회색이라 `muted` 를 조금만 얹는다. */
const BLOCK = { colorRole: 'muted', emphasis: 'strong' } as const;
const BLOCK_LUMINANCE = 0.22;
/** 알짜힘 · 틈. 원본 --accent #d9480f. */
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

function line(id: string, a: Vec2, b: Vec2, width: number, style: Trajectory['style'], luminance?: number): Trajectory {
  return {
    type: 'trajectory',
    id,
    points: [a, b],
    width,
    style,
    ...(luminance === undefined ? {} : { luminance }),
  };
}

/** 추 `count` 칸을 가운데 x, 윗면 y 에서 아래로 쌓는다. 원본 stack. */
function stack(id: string, cx: number, top: number, count: number): Primitive[] {
  const out: Primitive[] = [];
  for (let i = 0; i < count; i++) {
    const y0 = top - i * (BLOCK_H + BLOCK_GAP);
    const y1 = y0 - BLOCK_H;
    const fill: Body = {
      type: 'body',
      id: `${id}-${i}`,
      pos: [cx, (y0 + y1) / 2],
      shape: 'rect',
      size: [BLOCK_W, BLOCK_H],
      outline: 'none',
      style: BLOCK,
      luminance: BLOCK_LUMINANCE,
    };
    // 테두리는 먹색이라 채움과 색이 다르다 — body 의 둘레는 선 색 · 바탕 · 제 색 중에서만
    // 고를 수 있어 닫힌 궤적으로 긋는다 (NOTES 「어휘 부족」).
    const h = BLOCK_W / 2;
    const edge: Trajectory = {
      type: 'trajectory',
      id: `${id}-${i}-edge`,
      points: [
        [cx - h, y0],
        [cx + h, y0],
        [cx + h, y1],
        [cx - h, y1],
      ],
      closed: true,
      width: BLOCK_EDGE_PX,
      style: INK,
    };
    out.push(fill, edge);
  }
  return out;
}

/** 원본 arrow — 굵기 2.2, 머리 9 px. */
function arrow(id: string, from: Vec2, delta: Vec2, style: Vector['style']): Vector {
  return {
    type: 'vector',
    id,
    from,
    delta,
    width: ARROW_WIDTH_PX,
    headSize: ARROW_HEAD,
    style,
  };
}

export function scene(params: {
  state: EquilibriumOfForcesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const knot = state.knot;
  const f = forces(knot, state.left, c);
  const out: Primitive[] = [];

  // ---- 천장 ----
  out.push(
    line('ceiling', CEILING_LEFT, CEILING_RIGHT, CEILING_WIDTH_PX, INK),
    line('post-left', [PULLEY_LEFT[0], CEILING_LEFT[1]], PULLEY_LEFT, POST_WIDTH_PX, INK),
    line('post-right', [PULLEY_RIGHT[0], CEILING_LEFT[1]], PULLEY_RIGHT, POST_WIDTH_PX, INK),
  );

  // ---- 도르래 ----
  for (const [id, P] of [
    ['pulley-left', PULLEY_LEFT],
    ['pulley-right', PULLEY_RIGHT],
  ] as const) {
    out.push(
      {
        type: 'body',
        id,
        pos: P,
        shape: 'circle',
        size: PULLEY_R,
        fill: 'none',
        outline: 'role',
        glow: false,
        style: INK,
      },
      {
        type: 'body',
        id: `${id}-hub`,
        pos: P,
        shape: 'circle',
        size: PULLEY_HUB,
        outline: 'none',
        glow: false,
        style: INK,
      },
    );
  }

  // ---- 줄 ----
  // 줄 길이가 보존되므로, 매듭이 도르래에서 멀어진 만큼 바깥 추가 올라간다.
  const topL = outerTop(PULLEY_LEFT, knot);
  const topR = outerTop(PULLEY_RIGHT, knot);
  const midTop = knot[1] - HANG;
  const outerLX = PULLEY_LEFT[0] - PULLEY_R;
  const outerRX = PULLEY_RIGHT[0] + PULLEY_R;
  out.push(
    line('rope-knot-left', knot, tangentTop(PULLEY_LEFT, knot), ROPE_WIDTH_PX, ROPE, ROPE_LUMINANCE),
    line('rope-knot-right', knot, tangentTop(PULLEY_RIGHT, knot), ROPE_WIDTH_PX, ROPE, ROPE_LUMINANCE),
    line('rope-outer-left', [outerLX, PULLEY_LEFT[1]], [outerLX, topL], ROPE_WIDTH_PX, ROPE, ROPE_LUMINANCE),
    line('rope-outer-right', [outerRX, PULLEY_RIGHT[1]], [outerRX, topR], ROPE_WIDTH_PX, ROPE, ROPE_LUMINANCE),
    line('rope-middle', knot, [knot[0], midTop], ROPE_WIDTH_PX, ROPE, ROPE_LUMINANCE),
  );

  // ---- 추 ----
  // 무게는 칸 수로 보인다. 숫자를 쓰지 않는다.
  out.push(
    ...stack('weight-left', outerLX, topL, state.left),
    ...stack('weight-right', outerRX, topR, Math.round(c.right)),
    ...stack('weight-middle', knot[0], midTop, Math.round(c.middle)),
  );

  // ---- 매듭 ----
  out.push({
    type: 'body',
    id: 'knot',
    pos: knot,
    shape: 'circle',
    size: KNOT_R,
    outline: 'none',
    glow: false,
    style: INK,
  });

  // ---- 매듭을 끄는 알짜힘 ----
  // 틈이 닫혔는지는 캡션과 같은 값(state.closed)으로 가른다.
  if (!state.closed) {
    out.push(arrow('net-force', knot, [f.net[0] * UNIT, f.net[1] * UNIT], ACCENT));
  }

  // ---- 끝과 끝으로 이은 세 힘 — 가운데 추의 무게, 왼쪽 줄, 오른쪽 줄 순서 ----
  const marks: { pos: Vec2; direction: Vec2 }[] = [];
  let tip: Vec2 = POLYGON_ORIGIN;
  for (const [id, v] of [
    ['force-weight', f.w],
    ['force-left', f.tl],
    ['force-right', f.tr],
  ] as const) {
    out.push(arrow(id, tip, [v[0] * UNIT, v[1] * UNIT], INK));
    const n = Math.hypot(v[0], v[1]);
    const ux = v[0] / n;
    const uy = v[1] / n;
    // 추 한 칸마다 눈금 — 크기를 숫자 없이 세게 한다.
    for (let k = 1; k < Math.round(n); k++) {
      marks.push({ pos: [tip[0] + ux * UNIT * k, tip[1] + uy * UNIT * k], direction: [-uy, ux] });
    }
    tip = [tip[0] + v[0] * UNIT, tip[1] + v[1] * UNIT];
  }
  const ticks: Trace = {
    type: 'trace',
    id: 'force-ticks',
    marks,
    shape: 'tick',
    size: TICK_LEN,
    width: TICK_WIDTH_PX,
    style: INK,
  };
  out.push(ticks, {
    type: 'body',
    id: 'polygon-origin',
    pos: POLYGON_ORIGIN,
    shape: 'circle',
    size: ORIGIN_DOT,
    outline: 'none',
    glow: false,
    style: INK,
  });

  // ---- 닫히지 않은 틈 ----
  if (!state.closed) {
    out.push(
      arrow(
        'gap',
        POLYGON_ORIGIN,
        [tip[0] - POLYGON_ORIGIN[0], tip[1] - POLYGON_ORIGIN[1]],
        { ...ACCENT, lineStyle: 'dashed' },
      ),
    );
  }

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
