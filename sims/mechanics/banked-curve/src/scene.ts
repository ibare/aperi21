// ========================================================================
// banked-curve — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 왼쪽 단면: 길(region + trajectory) · 경사각(trajectory 점선 + sector 호 + readout) ·
//   중심 쪽 표지(vector + readout) · 차(body rect) · 무게 · 길이 미는 힘 · 안쪽 몫(vector) ·
//   필요한 만큼 막대(trajectory 셋) · 투영 점선(trajectory).
// 오른쪽 위에서 본 길: 고리(region 원판 둘 + trajectory closed 둘) · 중심 점(body) ·
//   지난 자취와 각도(trajectory + readout) · 지금 자취(trajectory) · 차(body rect).
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 좌표는 원본 캔버스 px 로 계산한 뒤 `world` 로 옮긴다 — 월드 1 = 원본 100 px, y 는 위.
// ========================================================================

import type {
  Body,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  Sector,
  Trajectory,
  Vec2,
  Vector,
} from '@aperi21/schema';
import {
  ANGLE_MARK,
  ARROW_HEAD,
  CENTER_MARK,
  COMPARE_ROWS,
  FLAT_EPS,
  FORCE_LABELS,
  G,
  INWARD_DOT_BELOW,
  OFF_ROAD_Y,
  ORIGIN_CANVAS,
  PAST_LABEL,
  R0,
  R_IN,
  R_OUT,
  SCENE_BOUNDS,
  SECTION,
  SECTION_CAR,
  TOP,
  TOP_CAR,
  text,
} from './schema';
import type { BankedCurveState } from './state';

/** 원본 px → 월드. */
const PX = 1 / 100;
function world(px: number, py: number): Vec2 {
  return [px * PX, (ORIGIN_CANVAS.height - py) * PX];
}
/** 원본 px 길이 → 월드 길이. */
function len(px: number): number {
  return px * PX;
}

/** 둥근 길 윤곽의 점 개수. */
const RING_SEGMENTS = 120;

// ---- 굵기(화면 px) — 원본 값 그대로. 굵기는 위계라 배율을 따라가지 않는다 ----
const ROAD_EDGE_WIDTH = 2;
const GUIDE_WIDTH = 1;
const CENTER_ARROW_WIDTH = 1.2;
const FORCE_WIDTH = 2;
const NEED_WIDTH = 1.2;
const INWARD_WIDTH = 3;
const RING_EDGE_WIDTH = 1.5;
const PAST_WIDTH = 2;
const TRAIL_WIDTH = 2.5;

// ---- 글자 크기(화면 px) — 원본 값 그대로 ----
const LABEL_FONT = 12;
const ANGLE_FONT = 13;
const OFF_ROAD_FONT = 13;

/** 지난 자취의 옅기. 원본 rgba(차 색, 0.28). */
const PAST_ALPHA = 0.28;
/** 길 채움의 옅기 — 원본 길 색(옅은 회색)에 가깝게. */
const ROAD_FILL_OPACITY = 0.2;

// ---- 색 — 같은 대상은 같은 색. 강조색은 「길이 안쪽으로 미는 몫」 한 곳에만 ----
const ROAD_STYLE = { colorRole: 'muted', emphasis: 'medium' } as const;
const ROAD_EDGE_STYLE = { colorRole: 'muted', emphasis: 'medium' } as const;
const GUIDE_STYLE = { colorRole: 'muted', emphasis: 'strong' } as const;
const LABEL_STYLE = { colorRole: 'muted', emphasis: 'strong' } as const;
const INK_STYLE = { colorRole: 'ink', emphasis: 'strong' } as const;
const CAR_STYLE = { colorRole: 'secondary', emphasis: 'strong' } as const;
const INWARD_STYLE = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 그림 속 글자 한 줄. 월드에 붙고 칩을 깔지 않는다. */
function label(
  id: string,
  at: Vec2,
  body: Readout['text'],
  opts: {
    align?: Readout['align'];
    fontSize?: number;
    style?: Readout['style'];
    vars?: Readout['vars'];
    offset?: Vec2;
  } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: at, offset: opts.offset } : { world: at },
    text: body,
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: opts.fontSize ?? LABEL_FONT,
    style: opts.style ?? LABEL_STYLE,
  };
}

/** 원본 `arrow` 의 화살촉: min(9, 길이/2) px. */
function head(lengthPx: number): number {
  return len(Math.min(ARROW_HEAD, lengthPx * 0.5));
}

/** 원본 px 좌표 두 점을 잇는 화살표. 1 px 아래는 원본도 긋지 않았다. */
function arrow(
  id: string,
  from: readonly [number, number],
  to: readonly [number, number],
  width: number,
  style: Vector['style'],
): Vector | null {
  const lengthPx = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (lengthPx < 1) return null;
  const a = world(from[0], from[1]);
  const b = world(to[0], to[1]);
  return {
    type: 'vector',
    id,
    from: a,
    delta: [b[0] - a[0], b[1] - a[1]],
    headSize: head(lengthPx),
    width,
    style,
  };
}

function line(
  id: string,
  pts: readonly (readonly [number, number])[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: pts.map(([x, y]) => world(x, y)), width, style, ...extra };
}

function circlePoints(cx: number, cy: number, rPx: number): Vec2[] {
  return Array.from({ length: RING_SEGMENTS }, (_, i): Vec2 => {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    return world(cx + rPx * Math.cos(a), cy + rPx * Math.sin(a));
  });
}

// ------------------------------------------------------------------------
// 왼쪽 — 단면
// ------------------------------------------------------------------------

function section(s: BankedCurveState, out: Primitive[]): void {
  const th = (s.deg * Math.PI) / 180;
  const k = Math.tan(th);
  const c = s.car;
  const onRoad = s.phase !== 'fly' && !(s.phase === 'hold' && s.exitSide);
  const toPx = (r: number): [number, number] => [
    SECTION.cx + (r - R0) * SECTION.pxPerM,
    SECTION.cy - (r - R0) * k * SECTION.pxPerM,
  ];
  const [ix, iy] = toPx(R_IN);
  const [ox, oy] = toPx(R_OUT);

  // ---- 기울어진 길 단면 ----
  const road: Region = {
    type: 'region',
    id: 'section-road',
    points: [world(ix, iy), world(ox, oy), world(ox, SECTION.floorY), world(ix, SECTION.floorY)],
    fillOpacity: ROAD_FILL_OPACITY,
    opaque: true,
    style: ROAD_STYLE,
  };
  out.push(road);
  out.push(line('section-road-edge', [[ix, iy], [ox, oy]], ROAD_EDGE_WIDTH, ROAD_EDGE_STYLE));

  // ---- 경사각 표시 ----
  out.push(
    line('angle-level', [[ix, iy], [ix + ANGLE_MARK.lineLength, iy]], GUIDE_WIDTH, {
      ...GUIDE_STYLE,
      lineStyle: 'dashed',
    }),
  );
  if (s.deg > FLAT_EPS) {
    const arc: Sector = {
      type: 'sector',
      id: 'angle-arc',
      center: world(ix, iy),
      radius: len(ANGLE_MARK.arcRadius),
      from: 0,
      to: th,
      fillOpacity: 0,
      rimWidth: GUIDE_WIDTH,
      style: GUIDE_STYLE,
    };
    out.push(arc);
  }
  out.push(
    label('angle-text', world(ix + ANGLE_MARK.textDx, iy + ANGLE_MARK.textDy), text('label.angle'), {
      vars: { deg: s.deg.toFixed(1) },
      fontSize: ANGLE_FONT,
      style: INK_STYLE,
    }),
  );

  // ---- 중심 쪽 표시 ----
  const centerArrow = arrow(
    'center-arrow',
    [CENTER_MARK.fromX, CENTER_MARK.y],
    [CENTER_MARK.toX, CENTER_MARK.y],
    CENTER_ARROW_WIDTH,
    GUIDE_STYLE,
  );
  if (centerArrow) out.push(centerArrow);
  out.push(label('center-text', world(CENTER_MARK.textX, CENTER_MARK.y), text('label.center')));

  if (!onRoad && s.phase !== 'tilt') {
    out.push(
      label('off-road', world(SECTION.cx, OFF_ROAD_Y), text('label.offRoad'), {
        align: 'center',
        fontSize: OFF_ROAD_FONT,
      }),
    );
    return;
  }

  // ---- 차 (단면) ----
  const rShow = Math.max(R_IN, Math.min(R_OUT, c.r));
  const [px, py] = toPx(rShow);
  const nx = -Math.sin(th);
  const ny = -Math.cos(th); // 면에 수직, 위·안쪽 (원본 화면 좌표)
  const mx = px + (nx * SECTION_CAR.height) / 2;
  const my = py + (ny * SECTION_CAR.height) / 2;
  const car: Body = {
    type: 'body',
    id: 'section-car',
    pos: world(mx, my),
    shape: 'rect',
    size: [len(SECTION_CAR.width), len(SECTION_CAR.height)],
    orientation: th,
    outline: 'none',
    style: CAR_STYLE,
  };
  out.push(car);

  const vphi = c.L / c.r;
  const need = (vphi * vphi) / c.r; // 원을 유지하려면 필요한 안쪽 가속도
  const N = G * Math.cos(th) + Math.sin(th) * need; // 수직항력 (질량당)
  const Nin = N * Math.sin(th); // 그 안쪽 성분
  const fs = SECTION.pxPerAccel;

  // ---- 무게 ----
  const weight = arrow('weight', [mx, my], [mx, my + G * fs], FORCE_WIDTH, INK_STYLE);
  if (weight) out.push(weight);
  out.push(
    label('weight-text', world(mx + FORCE_LABELS.weightDx, my + G * fs + FORCE_LABELS.weightDy), text('label.weight')),
  );

  // ---- 길이 미는 힘 ----
  const nEx = mx + nx * N * fs;
  const nEy = my + ny * N * fs;
  const normal = arrow('normal', [mx, my], [nEx, nEy], FORCE_WIDTH, INK_STYLE);
  if (normal) out.push(normal);
  out.push(
    label('normal-text', world((mx + nEx) / 2 + FORCE_LABELS.normalDx, (my + nEy) / 2), text('label.normal')),
  );

  // ---- 돌기에 필요한 만큼 ----
  const { needY, inwardY, tick, textDx } = COMPARE_ROWS;
  const x2 = mx - need * fs;
  out.push(line('need-bar', [[mx, needY], [x2, needY]], NEED_WIDTH, INK_STYLE));
  out.push(line('need-tick-car', [[mx, needY - tick], [mx, needY + tick]], NEED_WIDTH, INK_STYLE));
  out.push(line('need-tick-end', [[x2, needY - tick], [x2, needY + tick]], NEED_WIDTH, INK_STYLE));
  out.push(label('need-text', world(mx + textDx, needY), text('label.need')));

  // ---- 안쪽으로 미는 몫 ----
  out.push(
    line('inward-projection', [[nEx, nEy], [nEx, inwardY]], GUIDE_WIDTH, { ...GUIDE_STYLE, lineStyle: 'dotted' }),
  );
  if (Nin * fs < INWARD_DOT_BELOW) {
    const dot: Body = {
      type: 'body',
      id: 'inward-dot',
      pos: world(mx, inwardY),
      shape: 'point',
      style: INWARD_STYLE,
    };
    out.push(dot);
  } else {
    const inward = arrow('inward', [mx, inwardY], [mx - Nin * fs, inwardY], INWARD_WIDTH, INWARD_STYLE);
    if (inward) out.push(inward);
  }
  out.push(label('inward-text', world(mx + textDx, inwardY), text('label.inward'), { style: INWARD_STYLE }));
}

// ------------------------------------------------------------------------
// 오른쪽 — 위에서 본 둥근 길
// ------------------------------------------------------------------------

/** 위에서 본 평면 좌표(m, y 아래) → 원본 px. */
function tp(x: number, y: number): [number, number] {
  return [TOP.cx + x * TOP.pxPerM, TOP.cy + y * TOP.pxPerM];
}

function top(s: BankedCurveState, out: Primitive[]): void {
  // ---- 위에서 본 둥근 길 ----
  // region 에 구멍이 없어 원판 둘을 겹친다 — 바깥 원판을 길 색으로, 안쪽 원판을 바탕색으로.
  const outer: Region = {
    type: 'region',
    id: 'ring-outer',
    points: circlePoints(TOP.cx, TOP.cy, R_OUT * TOP.pxPerM),
    fillOpacity: ROAD_FILL_OPACITY,
    opaque: true,
    style: ROAD_STYLE,
  };
  const inner: Region = {
    type: 'region',
    id: 'ring-inner',
    points: circlePoints(TOP.cx, TOP.cy, R_IN * TOP.pxPerM),
    fillOpacity: 0,
    opaque: true,
    style: ROAD_STYLE,
  };
  out.push(outer, inner);
  const edge = (id: string, r: number): Trajectory => ({
    type: 'trajectory',
    id,
    points: circlePoints(TOP.cx, TOP.cy, r * TOP.pxPerM),
    closed: true,
    width: RING_EDGE_WIDTH,
    style: ROAD_EDGE_STYLE,
  });
  out.push(edge('ring-edge-outer', R_OUT), edge('ring-edge-inner', R_IN));
  const hub: Body = {
    type: 'body',
    id: 'ring-hub',
    pos: world(TOP.cx, TOP.cy),
    shape: 'circle',
    size: len(TOP.hubRadius),
    outline: 'none',
    glow: false,
    style: ROAD_EDGE_STYLE,
  };
  out.push(hub);

  // ---- 이전 시도의 자취 ----
  s.past.forEach((p, i) => {
    out.push(
      line(`past-${i}`, p.pts.map(([x, y]) => tp(x, y)), PAST_WIDTH, CAR_STYLE, { opacity: PAST_ALPHA }),
    );
    const endPt = p.pts[p.pts.length - 1]!;
    const [lx, ly] = tp(endPt[0], endPt[1]);
    out.push(
      label(`past-${i}-text`, world(lx + PAST_LABEL.dx, ly + PAST_LABEL.dy), text('label.angle'), {
        vars: { deg: p.deg.toFixed(1) },
      }),
    );
  });

  // ---- 차의 자취 ----
  if (s.trail.length >= 2) {
    out.push(line('trail', s.trail.map(([x, y]) => tp(x, y)), TRAIL_WIDTH, CAR_STYLE));
  }

  // ---- 차 (위) ----
  const c = s.car;
  const [a, b] = tp(c.x, c.y);
  const car: Body = {
    type: 'body',
    id: 'top-car',
    pos: world(a, b),
    shape: 'rect',
    size: [len(TOP_CAR.width), len(TOP_CAR.height)],
    // 원본은 y 가 아래인 화면에서 atan2(vy, vx) 로 돌렸다. 월드는 y 가 위라 부호를 뒤집는다.
    orientation: Math.atan2(-c.vy, c.vx),
    outline: 'none',
    opacity: s.alpha,
    style: CAR_STYLE,
  };
  out.push(car);
}

export function scene(params: { state: BankedCurveState }): SceneGraph {
  const out: Primitive[] = [];
  section(params.state, out);
  top(params.state, out);
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
