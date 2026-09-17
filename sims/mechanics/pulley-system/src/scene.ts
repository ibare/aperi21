// ========================================================================
// pulley-system — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 천장 · 짐 · 도르래 채움 · 손은 body, 바닥 · 짐 자리 점선 · 줄 · 도르래 윤곽 · 바큇살 ·
// 길이 막대는 trajectory, 힘은 vector, 값과 이름은 readout. 자유 렌더는 쓰지 않는다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { geometry, riseAt, sheaveAngle, type PanelGeometry, type Sheave } from './physics';
import {
  CEIL_Y,
  FLOOR_Y,
  LOAD_H,
  LOAD_TOP0,
  LOAD_W,
  PANELS,
  PPM,
  R,
  RISE_M,
  SCENE_BOUNDS,
  WEIGHT_N,
  text,
  worldX,
  worldY,
} from './schema';
import type { PulleySystemState } from './state';

// ---- 원본 획 · 글자 치수(화면 px) ----
/** 천장 막대 두께(논리 px)와 왼쪽 시작. */
const CEIL_BAR_H = 6;
const CEIL_BAR_LEFT = 12;
/** 바닥선 굵기와 좌우 여백. */
const FLOOR_WIDTH_PX = 1.5;
const FLOOR_LEFT = 8;
const FLOOR_RIGHT_INSET = 12;
/** 짐 처음 자리 점선 굵기. */
const GHOST_WIDTH_PX = 1.2;
/** 도르래 매단 줄 · 움직도르래 막대 굵기. */
const HANGER_WIDTH_PX = 2;
/** 도르래 윤곽 · 바큇살 굵기와 바큇살 길이(반지름 − 3). */
const SHEAVE_EDGE_PX = 1.5;
const SPOKE_INSET = 3;
/** 도르래 윤곽을 잇는 꼭짓점 수. */
const CIRCLE_SEGMENTS = 64;
/** 줄 굵기. 원본 3.2 — 바탕 줄과 무늬를 같은 굵기로 겹쳐 긋는다. */
const ROPE_WIDTH_PX = 3.2;
/** 호 한 바퀴를 나누는 표본 수. 호 길이가 시각에 따라 변하지 않아 무늬 좌표가 흔들리지 않는다. */
const ARC_SAMPLES_PER_TURN = 64;
/** 오른 높이 막대 — 짐 가운데에서 떨어진 거리 · 눈금 반폭 · 굵기 · 글자 자리. */
const RISE_BAR_DX = 33;
const RISE_TICK = 3;
const RISE_WIDTH_PX = 1.2;
const RISE_TEXT_DX = 7;
const RISE_LABEL_DY = 12;
const RISE_VALUE_DY = 28;
/** 당긴 줄 막대 — 줄 위 높이 · 눈금 반폭 · 굵기 · 글자 높이. */
const PULL_BAR_DY = 16;
const PULL_TICK = 4;
const PULL_WIDTH_PX = 2;
const PULL_TEXT_DY = 12;
/** 손 — 둥근 사각형(논리 px). */
const HAND_W = 12;
const HAND_H = 16;
const HAND_RADIUS = 4;
const HAND_LEFT = 2;
/** 힘 화살표 — 손에서 떨어진 거리 · 줄 아래 높이 · 길이(12 + F × 1.8) · 굵기 · 머리 · 글자 높이. */
const FORCE_DX = 12;
const FORCE_DY = 22;
const FORCE_BASE = 12;
const FORCE_PER_N = 1.8;
const FORCE_WIDTH_PX = 3;
const FORCE_HEAD = 10;
const FORCE_TEXT_DY = 17;
/** 가닥 수 글자 자리. */
const STRANDS_X = 12;
const STRANDS_DY = 18;
/** 글자 크기. 원본 13 px(값) · 14 px(가닥 수). */
const TEXT_PX = 13;
const STRANDS_TEXT_PX = 14;

// ---- 색 — 원본 팔레트를 역할로 ----
// 강조색(accent)은 '당긴 줄 길이' 하나에만 쓴다. 줄 · 짐 · 도르래는 세 장치가 같은 색이다.
/** 도르래 채움의 빛의 양(옅은 회색, 불투명 — 움직도르래가 줄을 덮는다). */
const SHEAVE_FILL_LUMINANCE = 0.22;
/** 도르래 윤곽 · 바큇살 · 매단 줄의 먹 농도. 원본은 글자보다 옅은 먹이다. */
const SHEAVE_EDGE_OPACITY = 0.8;
/** 줄 바탕의 빛의 양. 무늬(먹)가 그 위에서 읽히는 중간 톤. */
const ROPE_LUMINANCE = 0.7;
/** 천장 막대 · 바닥선의 빛의 양. */
const CEILING_LUMINANCE = 0.6;

type Px = readonly [number, number];

/** 패널 안 논리 px → 월드. */
function toWorld(x0: number, [x, y]: Px): Vec2 {
  return [worldX(x0 + x), worldY(y)];
}

function stroke(
  id: string,
  points: readonly Vec2[],
  width: number,
  extra: Partial<Trajectory> = {},
): Trajectory {
  return {
    type: 'trajectory',
    id,
    points,
    width,
    style: { colorRole: 'ink', emphasis: 'strong' },
    ...extra,
  };
}

/** 줄 경로를 묶인 끝에서부터 점으로 표본한다. 원본 `tracePath`. */
function ropePoints(x0: number, g: PanelGeometry): Vec2[] {
  const out: Vec2[] = [];
  const first = g.segs[0]!;
  if (first.kind === 'line') out.push(toWorld(x0, [first.x1, first.y1]));
  for (const seg of g.segs) {
    if (seg.kind === 'line') {
      out.push(toWorld(x0, [seg.x2, seg.y2]));
    } else {
      const k = Math.max(2, Math.round((Math.abs(seg.a1 - seg.a0) / (2 * Math.PI)) * ARC_SAMPLES_PER_TURN));
      for (let i = 0; i <= k; i++) {
        const a = seg.a0 + ((seg.a1 - seg.a0) * i) / k;
        out.push(toWorld(x0, [seg.cx + Math.cos(a) * R, seg.cy + Math.sin(a) * R]));
      }
    }
  }
  return out;
}

/**
 * 도르래 하나 — 채움 · 윤곽 · 바큇살 셋 · 축. 원본 `drawSheave`.
 * `angle` 은 원본의 캔버스 각(y 아래, 시계 +)이다. 바큇살 끝을 논리 px 에서 계산한 뒤 월드로
 * 옮기므로 부호를 따로 뒤집지 않는다.
 */
function sheave(id: string, x0: number, s: Sheave, angle: number): Primitive[] {
  const center = toWorld(x0, [s.x, s.y]);
  const out: Primitive[] = [];
  const fill: Body = {
    type: 'body',
    id: `${id}-fill`,
    pos: center,
    shape: 'circle',
    size: R / PPM,
    outline: 'none',
    glow: false,
    luminance: SHEAVE_FILL_LUMINANCE,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(fill);
  const rim: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    rim.push(toWorld(x0, [s.x + Math.cos(a) * R, s.y + Math.sin(a) * R]));
  }
  out.push(stroke(`${id}-rim`, rim, SHEAVE_EDGE_PX, { closed: true, opacity: SHEAVE_EDGE_OPACITY }));
  for (let k = 0; k < 3; k++) {
    const a = angle + (k * 2 * Math.PI) / 3;
    out.push(
      stroke(
        `${id}-spoke-${k}`,
        [center, toWorld(x0, [s.x + Math.cos(a) * (R - SPOKE_INSET), s.y + Math.sin(a) * (R - SPOKE_INSET)])],
        SHEAVE_EDGE_PX,
        { opacity: SHEAVE_EDGE_OPACITY },
      ),
    );
  }
  out.push({
    type: 'body',
    id: `${id}-hub`,
    pos: center,
    shape: 'point',
    opacity: SHEAVE_EDGE_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  return out;
}

/** 월드 단위 둥근 사각형(가운데 기준). SVG 경로 — 대칭이라 y 방향과 무관하다. */
function roundRectPath(w: number, h: number, r: number): string {
  const x = w / 2;
  const y = h / 2;
  const f = (v: number): string => v.toFixed(4);
  return [
    `M ${f(-x + r)} ${f(-y)}`,
    `H ${f(x - r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(-y + r)}`,
    `V ${f(y - r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(x - r)} ${f(y)}`,
    `H ${f(-x + r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(-x)} ${f(y - r)}`,
    `V ${f(-y + r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(-x + r)} ${f(-y)}`,
    'Z',
  ].join(' ');
}

function label(
  id: string,
  at: Vec2,
  offset: Vec2,
  key: Parameters<typeof text>[0],
  vars: Record<string, string>,
  extra: Partial<Readout> = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: TEXT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
    ...extra,
  };
}

export function scene(params: {
  state: PulleySystemState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('pulley-system: schema.timeline 이 선언되어야 한다');
  const c = (stage.constants ?? {}) as Record<string, number>;
  const weight = c['weight'] ?? WEIGHT_N;
  const riseM = riseAt(timeline, c['rise'] ?? RISE_M);

  const panels = PANELS.map((p) => ({ p, g: geometry(p.n, riseM), base: geometry(p.n, 0) }));
  const out: Primitive[] = [];

  // ---- 천장과 바닥 ----
  for (const { p, g } of panels) {
    const right = g.exitX + R + 2;
    out.push({
      type: 'body',
      id: `ceiling-${p.n}`,
      pos: toWorld(p.x0, [(CEIL_BAR_LEFT + right) / 2, CEIL_Y - CEIL_BAR_H / 2]),
      shape: 'rect',
      size: [(right - CEIL_BAR_LEFT) / PPM, CEIL_BAR_H / PPM],
      outline: 'none',
      luminance: CEILING_LUMINANCE,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push(
      stroke(`floor-${p.n}`, [toWorld(p.x0, [FLOOR_LEFT, FLOOR_Y]), toWorld(p.x0, [p.w - FLOOR_RIGHT_INSET, FLOOR_Y])], FLOOR_WIDTH_PX, {
        luminance: CEILING_LUMINANCE,
        style: { colorRole: 'muted', emphasis: 'strong' },
      }),
    );
  }

  // ---- 짐의 처음 자리 ----
  for (const { p } of panels) {
    const l = p.loadX - LOAD_W / 2;
    const r = p.loadX + LOAD_W / 2;
    out.push(
      stroke(
        `ghost-${p.n}`,
        [
          toWorld(p.x0, [l, LOAD_TOP0]),
          toWorld(p.x0, [r, LOAD_TOP0]),
          toWorld(p.x0, [r, LOAD_TOP0 + LOAD_H]),
          toWorld(p.x0, [l, LOAD_TOP0 + LOAD_H]),
        ],
        GHOST_WIDTH_PX,
        { closed: true, style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' } },
      ),
    );
  }

  // ---- 고정 도르래 ----
  for (const { p, g, base } of panels) {
    g.fixed.forEach((f, k) => {
      out.push(
        stroke(`hanger-${p.n}-${k}`, [toWorld(p.x0, [f.x, CEIL_Y]), toWorld(p.x0, [f.x, f.y])], HANGER_WIDTH_PX, {
          opacity: SHEAVE_EDGE_OPACITY,
        }),
      );
      out.push(...sheave(`fixed-${p.n}-${k}`, p.x0, f, sheaveAngle(f, base.fixed[k]!)));
    });
  }

  // ---- 줄 ----
  // 묶인 끝에서 손까지 한 경로. 바탕 줄 위에 같은 경로의 점 무늬를 겹쳐 긋는다.
  for (const { p, g } of panels) {
    const pts = ropePoints(p.x0, g);
    out.push(
      stroke(`rope-${p.n}`, pts, ROPE_WIDTH_PX, {
        luminance: ROPE_LUMINANCE,
        style: { colorRole: 'muted', emphasis: 'strong' },
      }),
    );
    out.push(
      stroke(`rope-mark-${p.n}`, pts, ROPE_WIDTH_PX, {
        style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dotted' },
        // 무늬 = 재료 좌표. 경로의 첫 점이 줄의 묶인 끝(1가닥은 짐에 매인 끝)이라 그 점에서
        // 잰 길이가 곧 줄의 재료 좌표다. 무늬는 경로 첫 점에서 시작하므로, 가닥이 짧아지고
        // 손 쪽이 길어지는 만큼 무늬가 도르래를 타고 손 쪽으로 흘러간다 (원본 `lineDashOffset = 0`).
      }),
    );
  }

  // ---- 움직도르래 ----
  for (const { p, g, base } of panels) {
    if (g.moving.length === 0) continue;
    const xs = g.moving.map((m) => m.x);
    if (xs.length > 1) {
      out.push(
        stroke(`yoke-${p.n}`, [toWorld(p.x0, [xs[0]!, g.ym]), toWorld(p.x0, [xs[xs.length - 1]!, g.ym])], HANGER_WIDTH_PX, {
          opacity: SHEAVE_EDGE_OPACITY,
        }),
      );
    }
    out.push(
      stroke(`hook-${p.n}`, [toWorld(p.x0, [p.loadX, g.ym]), toWorld(p.x0, [p.loadX, g.loadTop])], HANGER_WIDTH_PX, {
        opacity: SHEAVE_EDGE_OPACITY,
      }),
    );
    g.moving.forEach((m, k) => {
      out.push(...sheave(`moving-${p.n}-${k}`, p.x0, m, sheaveAngle(m, base.moving[k]!)));
    });
  }

  // ---- 짐 ----
  for (const { p, g } of panels) {
    const center = toWorld(p.x0, [p.loadX, g.loadTop + LOAD_H / 2]);
    out.push({
      type: 'body',
      id: `load-${p.n}`,
      pos: center,
      shape: 'rect',
      size: [LOAD_W / PPM, LOAD_H / PPM],
      outline: 'none',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push(
      label(`load-weight-${p.n}`, center, [0, 1], 'label.weight', { w: String(weight) }, {
        align: 'center',
        weight: 'bold',
        style: { colorRole: 'ink', emphasis: 'strong' },
      }),
    );
  }

  // ---- 오른 높이 ----
  for (const { p, g } of panels) {
    const x = p.loadX + RISE_BAR_DX;
    const ink = { style: { colorRole: 'ink', emphasis: 'strong' } } as const;
    out.push(stroke(`rise-tick0-${p.n}`, [toWorld(p.x0, [x - RISE_TICK, LOAD_TOP0]), toWorld(p.x0, [x + RISE_TICK, LOAD_TOP0])], RISE_WIDTH_PX, ink));
    out.push(stroke(`rise-bar-${p.n}`, [toWorld(p.x0, [x, LOAD_TOP0]), toWorld(p.x0, [x, g.loadTop])], RISE_WIDTH_PX, ink));
    out.push(stroke(`rise-tick1-${p.n}`, [toWorld(p.x0, [x - RISE_TICK, g.loadTop]), toWorld(p.x0, [x + RISE_TICK, g.loadTop])], RISE_WIDTH_PX, ink));
    const at = toWorld(p.x0, [x, LOAD_TOP0]);
    out.push(label(`rise-label-${p.n}`, at, [RISE_TEXT_DX, RISE_LABEL_DY], 'label.rise', {}));
    out.push(label(`rise-value-${p.n}`, at, [RISE_TEXT_DX, RISE_VALUE_DY], 'label.riseValue', { h: g.riseM.toFixed(2) }));
  }

  // ---- 당긴 줄 길이 ----
  for (const { p, g } of panels) {
    const y = g.exitY - PULL_BAR_DY;
    const accent = { style: { colorRole: 'accent', emphasis: 'strong' } } as const;
    out.push(stroke(`pull-tick0-${p.n}`, [toWorld(p.x0, [g.hand0, y - PULL_TICK]), toWorld(p.x0, [g.hand0, y + PULL_TICK])], PULL_WIDTH_PX, accent));
    out.push(stroke(`pull-bar-${p.n}`, [toWorld(p.x0, [g.hand0, y]), toWorld(p.x0, [g.handX, y])], PULL_WIDTH_PX, accent));
    out.push(stroke(`pull-tick1-${p.n}`, [toWorld(p.x0, [g.handX, y - PULL_TICK]), toWorld(p.x0, [g.handX, y + PULL_TICK])], PULL_WIDTH_PX, accent));
    out.push(
      label(`pull-value-${p.n}`, toWorld(p.x0, [g.hand0, y]), [0, -PULL_TEXT_DY], 'label.pulled', { d: g.pulledM.toFixed(2) }, {
        weight: 'bold',
        style: { colorRole: 'accent', emphasis: 'strong' },
      }),
    );
  }

  // ---- 손 ----
  for (const { p, g } of panels) {
    out.push({
      type: 'body',
      id: `hand-${p.n}`,
      pos: toWorld(p.x0, [g.handX - HAND_LEFT + HAND_W / 2, g.exitY]),
      shape: 'custom',
      customPath: roundRectPath(HAND_W / PPM, HAND_H / PPM, HAND_RADIUS / PPM),
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 당기는 힘 ----
  for (const { p, g } of panels) {
    const force = weight / p.n;
    const len = FORCE_BASE + force * FORCE_PER_N; // 40 N → 84 px, 20 N → 48 px, 10 N → 30 px
    const x1 = g.handX + FORCE_DX;
    const y = g.exitY + FORCE_DY;
    out.push({
      type: 'vector',
      id: `force-${p.n}`,
      from: toWorld(p.x0, [x1, y]),
      delta: [len / PPM, 0],
      headSize: FORCE_HEAD / PPM,
      width: FORCE_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push(label(`force-value-${p.n}`, toWorld(p.x0, [x1, y]), [0, FORCE_TEXT_DY], 'label.force', { f: String(force) }));
  }

  // ---- 받치는 줄 가닥 수 ----
  for (const { p } of panels) {
    out.push(
      label(`strands-${p.n}`, toWorld(p.x0, [STRANDS_X, FLOOR_Y]), [0, STRANDS_DY], 'label.strands', { n: String(p.n) }, {
        fontSize: STRANDS_TEXT_PX,
        style: { colorRole: 'muted', emphasis: 'strong' },
      }),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
