// ========================================================================
// drag-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 공 · 지난 자리는 `body`(지난 자리는 `fill: 'none'`),
// 두 힘은 `vector`, 저항 막대는 `region`(1차 몫 채움 · 2차 몫 `fill: 'hatch'`),
// 기준선 · 바닥 · 연결선 · 막대 테두리는 `trajectory`, 이름은 `readout`.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 월드 = 원본 캔버스 px (y 만 뒤집음). 원본의 그리기 순서를 그대로 따른다
// (`drawOrder: 'scene'`).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { linearPart, quadraticPart, readConstants } from './physics';
import { FONT, LAYOUT as L, text } from './schema';
import type { DragForceState } from './state';

/** 원본 캔버스 좌표(px, y 아래로)를 월드로. */
const W = (x: number, y: number): Vec2 => [x, L.height - y];

// ------------------------------------------------------------------------
// 색 — 강조색 하나 = 저항. 공과 미는 힘은 먹, 지난 자리와 바닥은 회색
// ------------------------------------------------------------------------
// 1차/2차 몫은 색이 아니라 채움/빗금으로 가른다 (S-piece: 색으로 설명하지 않는다).

/** 원본 INK. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 원본 SOFT(#9a9a9a). */
const SOFT = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 원본 DRAG. */
const DRAG = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 지난 자리에서 막대로 내려가는 연결선의 진하기. 원본 rgba(154,154,154,0.35). */
const DROP_OPACITY = 0.35;
/** 막대 이름 연결선의 진하기. 원본 rgba(43,43,43,0.4). */
const LEADER_OPACITY = 0.4;
/** 빗금 칸의 바탕 채움. 원본은 바탕 위 강조색 사선이라 칸 전체가 옅게 읽힌다. */
const HATCH_FILL = 0.45;

/** 기준선 · 바닥이 구간 밖으로 나오는 길이(px). */
const RULE_OVERRUN = 10;
/** '미는 힘' 글자가 기준선 위로 뜬 거리(px). */
const PUSH_TEXT_DY = 11;
/** 공 둘레와 화살표 뿌리 사이 틈(px). */
const ARROW_GAP = 2;
/** 화살촉 길이(px). 원본 head = 8. */
const HEAD = 8;
/** 화살표 굵기(화면 px). 원본 lineWidth 2. */
const ARROW_WIDTH = 2;
/** 연결선이 공 둘레 · 막대 꼭대기와 띄우는 거리(px). */
const DROP_TOP_GAP = 2;
const DROP_BAR_GAP = 3;
/** 막대 이름 연결선이 막대 오른쪽 · 글자 왼쪽과 띄우는 거리(px). */
const LEADER_BAR_GAP = 3;
const LEADER_TEXT_GAP = 4;
/** 두 이름표 사이 최소 간격(px). */
const LABEL_MIN_SEP = 20;
/** 막대 빗금 칸을 그리기 시작하는 높이(px). 원본 `hq >= 1`. */
const HATCH_MIN_PX = 1;

function line(id: string, points: readonly Vec2[], style: Trajectory['style'], opacity = 1): Trajectory {
  return { type: 'trajectory', id, points, width: 1, style, opacity };
}

interface Rect {
  x: number;
  /** 위 모서리 y (원본 px, 아래로). */
  y: number;
  w: number;
  h: number;
}

function corners(r: Rect): Vec2[] {
  return [W(r.x, r.y + r.h), W(r.x + r.w, r.y + r.h), W(r.x + r.w, r.y), W(r.x, r.y)];
}

function bar(id: string, r: Rect, fill: Region['fill']): Region {
  return {
    type: 'region',
    id,
    points: corners(r),
    fill,
    fillOpacity: fill === 'hatch' ? HATCH_FILL : 1,
    opaque: true,
    style: DRAG,
  };
}

/** 원본 `strokeRect(x+.5, y+.5, w−1, h−1)`. */
function barEdge(id: string, r: Rect): Trajectory {
  const inset: Rect = { x: r.x + 0.5, y: r.y + 0.5, w: r.w - 1, h: Math.max(0, r.h - 1) };
  return { ...line(id, corners(inset), DRAG), closed: true };
}

/** 원본 `fillText(s, x, y)` — textBaseline middle · 왼쪽 정렬. */
function label(id: string, x: number, y: number, body: Readout['text']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: W(x, y) },
    text: body,
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: FONT.label,
    style: INK,
  };
}

export function scene(params: {
  state: DragForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state: s, stage } = params;
  const k = readConstants(stage);
  const out: Primitive[] = [];

  const px = (L.xEnd - L.x0) / L.course;
  const sx = (x: number): number => L.x0 + x * px;
  const heights = (v: number): { hl: number; hq: number } => ({
    hl: linearPart(v, k) * L.forcePx,
    hq: quadraticPart(v, k) * L.forcePx,
  });

  // ---- 미는 힘 기준선 ----
  const forceY = L.baseY - k.force * L.forcePx;
  out.push(
    line('push-rule', [W(L.x0 - RULE_OVERRUN, forceY), W(L.xEnd + RULE_OVERRUN, forceY)], {
      ...INK,
      lineStyle: 'dashed',
    }),
  );
  out.push(label('push-name', L.x0 - RULE_OVERRUN, forceY - PUSH_TEXT_DY, text('label.push')));

  // ---- 바닥선 ----
  out.push(
    line('floor', [W(L.x0 - RULE_OVERRUN, L.baseY + 0.5), W(L.xEnd + RULE_OVERRUN, L.baseY + 0.5)], SOFT),
  );

  // ---- 지난 자리 ----
  s.strobes.forEach((p, i) => {
    const ghost: Body = {
      type: 'body',
      id: `strobe-${i}`,
      pos: W(sx(p.x), L.laneY),
      shape: 'circle',
      size: L.ballR,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: SOFT,
    };
    out.push(ghost);
  });
  // 지난 자리에서 막대로 내려가는 가는 연결선.
  s.strobes.forEach((p, i) => {
    const { hl, hq } = heights(p.v);
    const top = L.baseY - hl - hq;
    out.push(
      line(
        `drop-${i}`,
        [W(sx(p.x), L.laneY + L.ballR + DROP_TOP_GAP), W(sx(p.x), top - DROP_BAR_GAP)],
        SOFT,
        DROP_OPACITY,
      ),
    );
  });

  // ---- 저항 막대 — 아래 칸 채움(1차), 위 칸 빗금(2차). 같은 강조색 ----
  s.strobes.forEach((p, i) => {
    const { hl, hq } = heights(p.v);
    const x = sx(p.x) - L.barW / 2;
    out.push(bar(`bar-linear-${i}`, { x, y: L.baseY - hl, w: L.barW, h: hl }, 'solid'));
    if (hq >= HATCH_MIN_PX) {
      const r: Rect = { x, y: L.baseY - hl - hq, w: L.barW, h: hq };
      out.push(bar(`bar-quadratic-${i}`, r, 'hatch'));
      out.push(barEdge(`bar-quadratic-edge-${i}`, r));
    }
  });

  // ---- 막대 이름 — 가장 최근 막대의 두 칸에서 오른쪽 여백으로 ----
  const last = s.strobes[s.strobes.length - 1];
  if (last) {
    const { hl, hq } = heights(last.v);
    const bx = sx(last.x) + L.barW / 2 + LEADER_BAR_GAP;
    const lx = L.xEnd + L.labelGap;
    const yl = L.baseY - hl / 2;
    const yq = Math.min(L.baseY - hl - hq / 2, yl - LABEL_MIN_SEP);
    out.push(line('leader-linear', [W(bx, L.baseY - hl / 2), W(lx - LEADER_TEXT_GAP, yl)], INK, LEADER_OPACITY));
    out.push(
      line('leader-quadratic', [W(bx, L.baseY - hl - hq / 2), W(lx - LEADER_TEXT_GAP, yq)], INK, LEADER_OPACITY),
    );
    out.push(label('name-linear', lx, yl, text('label.linear')));
    out.push(label('name-quadratic', lx, yq, text('label.quadratic')));
  }

  // ---- 두 힘 — 같은 배율(힘 1 = arrowPx) ----
  const bx = sx(s.x);
  const push: Vector = {
    type: 'vector',
    id: 'push',
    from: W(bx + L.ballR + ARROW_GAP, L.laneY),
    delta: [k.force * L.arrowPx, 0],
    headSize: HEAD,
    width: ARROW_WIDTH,
    style: INK,
  };
  out.push(push);

  const d = linearPart(s.v, k) + quadraticPart(s.v, k);
  const drag: Vector = {
    type: 'vector',
    id: 'drag',
    from: W(bx - L.ballR - ARROW_GAP, L.laneY),
    delta: [-d * L.arrowPx, 0],
    headSize: HEAD,
    width: ARROW_WIDTH,
    style: DRAG,
  };
  out.push(drag);

  // ---- 공 ----
  const ball: Body = {
    type: 'body',
    id: 'ball',
    pos: W(bx, L.laneY),
    shape: 'circle',
    size: L.ballR,
    outline: 'none',
    glow: false,
    style: INK,
  };
  out.push(ball);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 원본 캔버스 한 장 + 캡션 자리.
  return { minX: 0, maxX: L.width, minY: -L.captionRoom, maxY: L.height };
}
