// ========================================================================
// tension — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 천장·바닥(trajectory + trace tick 빗금) · 도르래(body 바탕 칠 + trajectory 테·안쪽 원 +
// body 축) · 바닥 고리(trajectory 고리 · 기둥 + region 받침판) · 줄(trajectory) ·
// 저울 셋(trajectory 고리·몸통·막대·바늘 + trace tick 눈금 + constraint spring + readout 값) ·
// 손(trajectory 팔 + region 주먹 바탕 + trajectory 주먹 테·손가락 금).
// 자유 렌더 계층을 쓰지 않는다. 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
//
// 좌표는 원본 논리 좌표(px, y 아래)로 계산하고 `world` 로 옮긴다 — 원본 상수·배치를
// 그대로 가져오려는 것이다.
// ========================================================================

import type {
  Body,
  Constraint,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { ropeLayout } from './physics';
import {
  ANCHOR,
  CASE_CORNER,
  CASE_LEN,
  CASE_W,
  CEIL_Y,
  F_MAX,
  FLOOR_Y,
  HOOK_R,
  PULLEY,
  PX,
  PX_PER_N,
  ROD_LEN,
  ROPE_TOP_Y,
  SCENE_BOUNDS,
  SPRING_COILS,
  SPRING_REST,
  SPRING_START,
  TICK_LONG,
  TICK_LONG_EVERY,
  TICK_SHORT,
  TICK_STEP,
  VERT_X,
  text,
  world,
} from './schema';
import type { TensionState } from './state';

// ------------------------------------------------------------------------
// 색 — 원본 팔레트를 색 역할로. 강조색은 「저울이 가리키는 값」 하나에만 (원본 그대로).
// ------------------------------------------------------------------------

/** 줄 · 고리 · 용수철 · 막대 · 주먹 테. 원본 --ink. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 천장·바닥 선 · 도르래 · 받침판 · 저울 몸통 · 눈금 · 팔. 원본 --muted. */
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const MUTED_LUMINANCE = 0.8;
/** 빗금 · 도르래 안쪽 원. 원본 --faint. */
const FAINT_LUMINANCE = 0.35;
/** 바늘 · 읽은 값. 원본 --accent. */
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 바탕 칠 — 먹을 빛의 양 0 으로 얹으면 바탕 그대로다. */
const BACKGROUND_LUMINANCE = 0;

// ------------------------------------------------------------------------
// 원본 굵기(화면 px) · 치수(px)
// ------------------------------------------------------------------------

const W_FRAME = 2;
const W_HATCH = 1;
const W_HANGER = 3;
const W_PULLEY = 2;
const W_PULLEY_INNER = 1;
const W_ANCHOR = 2.5;
const W_ROPE = 2.5;
const W_HOOK = 2;
const W_CASE = 1.5;
const W_TICK = 1;
const W_ROD = 2;
const W_POINTER = 2.5;
const W_ARM = 12;
const W_FIST = 2;
const W_KNUCKLE = 1;

/** 빗금 — 간격 · 한 획의 가로·세로 길이. 원본 10 · 6. */
const HATCH_GAP = 10;
const HATCH_RUN = 6;
/** 도르래 안쪽 원 · 축 반지름. 원본 r − 6 · 3.5. */
const PULLEY_INNER_INSET = 6;
const AXLE_R = 3.5;
/** 바닥 고리 반지름 · 받침판 반폭 · 두께. 원본 6 · 14 · 4. */
const ANCHOR_R = 6;
const PLATE_HALF = 14;
const PLATE_THICK = 4;
/** 바늘이 몸통 테에서 안쪽으로 물러난 길이. 원본 1. */
const POINTER_INSET = 1;
/** 읽은 값 글자 — 크기 · 수평 저울 아래 간격 · 수직 저울 왼쪽 간격. 원본 14 · 26 · 18. */
const READING_FONT = 14;
const READING_BELOW = 26;
const READING_LEFT = 18;
/** 팔 — 왼쪽 가장자리 밖 출발점 · 줄 높이에서 내린 거리 · 주먹 안쪽 끝. 원본 −10 · 22 · 6 · 16. */
const ARM_START_X = -10;
const ARM_START_DY = 22;
const ARM_END_DY = 6;
const ARM_END_DX = -16;
/** 팔을 늘여 출발시키는 자리(px) — 어떤 임베드 너비에서도 캔버스 왼쪽 밖이다. */
const ARM_REACH_X = -600;
/** 주먹 — 줄 끝에서 왼쪽 · 한 변 · 모서리 반지름 · 손가락 금 반폭. 원본 18 · 22 · 7 · 4. */
const FIST_LEFT = 18;
const FIST_SIZE = 22;
const FIST_CORNER = 7;
const KNUCKLE_HALF = 4;

/** 원을 폴리라인으로 — 한 바퀴를 몇 조각으로 나누는가. */
const CIRCLE_SEGMENTS = 48;
/** 둥근 모서리 하나를 몇 조각으로 나누는가. */
const CORNER_SEGMENTS = 6;

// ------------------------------------------------------------------------
// 원본 px 좌표 도구
// ------------------------------------------------------------------------

type Px = readonly [number, number];

function toWorld(points: readonly Px[]): Vec2[] {
  return points.map(([x, y]) => world(x, y));
}

/** 원 둘레 점(px). `from`·`to` 는 캔버스 각(y 아래, 시계 방향). */
function arcPx(cx: number, cy: number, r: number, from = 0, to = Math.PI * 2, n = CIRCLE_SEGMENTS): Px[] {
  const out: Px[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** 둥근 사각형 둘레 점(px). 원본 roundRect. */
function roundRectPx(x: number, y: number, w: number, h: number, r: number): Px[] {
  const q = Math.PI / 2;
  return [
    ...arcPx(x + w - r, y + r, r, -q, 0, CORNER_SEGMENTS),
    ...arcPx(x + w - r, y + h - r, r, 0, q, CORNER_SEGMENTS),
    ...arcPx(x + r, y + h - r, r, q, 2 * q, CORNER_SEGMENTS),
    ...arcPx(x + r, y + r, r, 2 * q, 3 * q, CORNER_SEGMENTS),
  ];
}

function line(
  id: string,
  points: readonly Px[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: toWorld(points), width, style, ...extra };
}

function ring(id: string, cx: number, cy: number, r: number, width: number, style: Trajectory['style'], extra: Partial<Trajectory> = {}): Trajectory {
  return line(id, arcPx(cx, cy, r).slice(0, -1), width, style, { closed: true, ...extra });
}

// ------------------------------------------------------------------------
// 저울 — 윗고리(끝점 a)에서 방향 `dir` 로 늘어난다. 원본 drawScale.
// ------------------------------------------------------------------------

/**
 * 저울 좌표(u: 늘어나는 방향, v: 그 옆) → 캔버스 px.
 * 원본은 `rotate(angle)` 로 돌렸다 — 수평 저울 π(왼쪽으로), 수직 저울 π/2(아래로).
 */
type Frame = (u: number, v: number) => Px;

function frameOf(ax: number, ay: number, angle: number): Frame {
  const c = Math.round(Math.cos(angle));
  const s = Math.round(Math.sin(angle));
  return (u, v) => [ax + u * c - v * s, ay + u * s + v * c];
}

function springScale(
  id: string,
  ax: number,
  ay: number,
  angle: number,
  force: number,
  reading: string,
  label: { at: Px; align: 'center' | 'right' },
): Primitive[] {
  const f = frameOf(ax, ay, angle);
  const ext = force * PX_PER_N;
  const pointerU = HOOK_R + SPRING_REST + ext;
  const rodEnd = pointerU + ROD_LEN;
  const out: Primitive[] = [];

  // 고리 (윗쪽)
  const [hx, hy] = f(0, 0);
  out.push(ring(`${id}-hook-top`, hx, hy, HOOK_R, W_HOOK, INK));

  // 투명 몸통
  const caseLocal = roundRectPx(HOOK_R, -CASE_W / 2, CASE_LEN, CASE_W, CASE_CORNER);
  out.push(
    line(`${id}-case`, caseLocal.map(([u, v]) => f(u, v)), W_CASE, MUTED, {
      closed: true,
      luminance: MUTED_LUMINANCE,
    }),
  );

  // 눈금: 0 ~ 80 N, 10 N 마다. 몸통 양쪽 테에서 안으로. 원본은 옅은 색을 정했다가
  // 긋기 직전에 --muted 로 바꿨다 — 그 결과대로 muted 다.
  const normal = f(0, 1);
  const origin = f(0, 0);
  const direction: Vec2 = [normal[0] - origin[0], -(normal[1] - origin[1])];
  const shortMarks: Trace['marks'][number][] = [];
  const longMarks: Trace['marks'][number][] = [];
  for (let n = 0; n <= F_MAX; n += TICK_STEP) {
    const u = HOOK_R + SPRING_REST + n * PX_PER_N;
    const long = n % TICK_LONG_EVERY === 0;
    const len = long ? TICK_LONG : TICK_SHORT;
    const marks = long ? longMarks : shortMarks;
    marks.push({ pos: world(...f(u, -CASE_W / 2 + len / 2)) });
    marks.push({ pos: world(...f(u, CASE_W / 2 - len / 2)) });
  }
  const tick = (suffix: string, marks: Trace['marks'][number][], len: number): Trace => ({
    type: 'trace',
    id: `${id}-ticks-${suffix}`,
    marks,
    shape: 'tick',
    size: len * PX,
    direction,
    width: W_TICK,
    style: MUTED,
    luminance: MUTED_LUMINANCE,
  });
  out.push(tick('short', shortMarks, TICK_SHORT), tick('long', longMarks, TICK_LONG));

  // 용수철 (몸통 안, 윗끝 → 바늘)
  const spring: Constraint = {
    type: 'constraint',
    id: `${id}-spring`,
    subtype: 'spring',
    from: world(...f(SPRING_START, 0)),
    to: world(...f(pointerU, 0)),
    coils: SPRING_COILS,
    style: INK,
  };
  out.push(spring);

  // 막대 (바늘 → 아랫고리, 몸통 밖으로 나온다) + 아랫고리
  out.push(line(`${id}-rod`, [f(pointerU, 0), f(rodEnd, 0)], W_ROD, INK));
  const [rx, ry] = f(rodEnd + HOOK_R, 0);
  out.push(ring(`${id}-hook-bottom`, rx, ry, HOOK_R, W_ROD, INK));

  // 바늘 (강조색 = 저울이 가리키는 값)
  out.push(
    line(
      `${id}-pointer`,
      [f(pointerU, -CASE_W / 2 + POINTER_INSET), f(pointerU, CASE_W / 2 - POINTER_INSET)],
      W_POINTER,
      ACCENT,
    ),
  );

  // 읽은 값 (회전하지 않은 글자)
  const value: Readout = {
    type: 'readout',
    id: `${id}-reading`,
    anchor: { world: world(...label.at) },
    text: text('label.reading'),
    vars: { force: reading },
    chip: false,
    fontSize: READING_FONT,
    font: 'text',
    weight: 'bold',
    align: label.align,
    style: ACCENT,
  };
  out.push(value);
  return out;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: TensionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const F = params.state.force;
  const reading = params.state.reading;
  const L = ropeLayout(F);
  const ext = F * PX_PER_N;
  const out: Primitive[] = [];

  // ---- 천장과 바닥 ----
  out.push(
    line('ceiling', [[PULLEY.x - 40, CEIL_Y], [PULLEY.x + 60, CEIL_Y]], W_FRAME, MUTED, {
      luminance: MUTED_LUMINANCE,
    }),
    line('floor', [[PULLEY.x - 60, FLOOR_Y], [PULLEY.x + 120, FLOOR_Y]], W_FRAME, MUTED, {
      luminance: MUTED_LUMINANCE,
    }),
  );
  const hatch: Trace['marks'][number][] = [];
  for (let x = PULLEY.x - 36; x < PULLEY.x + 60; x += HATCH_GAP) {
    hatch.push({ pos: world(x + HATCH_RUN / 2, CEIL_Y - HATCH_RUN / 2) });
  }
  for (let x = PULLEY.x - 56; x < PULLEY.x + 120; x += HATCH_GAP) {
    hatch.push({ pos: world(x - HATCH_RUN / 2, FLOOR_Y + HATCH_RUN / 2) });
  }
  const hatches: Trace = {
    type: 'trace',
    id: 'hatch',
    marks: hatch,
    shape: 'tick',
    size: HATCH_RUN * Math.SQRT2 * PX,
    // 원본 획 (x, y) → (x + 6, y − 6): 월드(y 위)에서는 오른쪽 위로.
    direction: [1, 1],
    width: W_HATCH,
    style: MUTED,
    luminance: FAINT_LUMINANCE,
  };
  out.push(hatches);

  // ---- 도르래 ----
  out.push(
    line('pulley-hanger', [[PULLEY.x, CEIL_Y], [PULLEY.x, PULLEY.y]], W_HANGER, MUTED, {
      luminance: MUTED_LUMINANCE,
    }),
  );
  const pulleyFill: Body = {
    type: 'body',
    id: 'pulley-fill',
    pos: world(PULLEY.x, PULLEY.y),
    shape: 'circle',
    size: PULLEY.r * PX,
    outline: 'none',
    glow: false,
    style: INK,
    luminance: BACKGROUND_LUMINANCE,
  };
  out.push(pulleyFill);
  out.push(ring('pulley-rim', PULLEY.x, PULLEY.y, PULLEY.r, W_PULLEY, MUTED, { luminance: MUTED_LUMINANCE }));
  out.push(
    ring('pulley-inner', PULLEY.x, PULLEY.y, PULLEY.r - PULLEY_INNER_INSET, W_PULLEY_INNER, MUTED, {
      luminance: FAINT_LUMINANCE,
    }),
  );
  const axle: Body = {
    type: 'body',
    id: 'pulley-axle',
    pos: world(PULLEY.x, PULLEY.y),
    shape: 'circle',
    size: AXLE_R * PX,
    outline: 'none',
    glow: false,
    style: MUTED,
    luminance: MUTED_LUMINANCE,
  };
  out.push(axle);

  // ---- 바닥 고리 ----
  out.push(ring('anchor-ring', ANCHOR.x, ANCHOR.y, ANCHOR_R, W_ANCHOR, INK));
  const plate: Region = {
    type: 'region',
    id: 'anchor-plate',
    points: toWorld([
      [ANCHOR.x - PLATE_HALF, FLOOR_Y - PLATE_THICK],
      [ANCHOR.x + PLATE_HALF, FLOOR_Y - PLATE_THICK],
      [ANCHOR.x + PLATE_HALF, FLOOR_Y],
      [ANCHOR.x - PLATE_HALF, FLOOR_Y],
    ]),
    fillOpacity: 1,
    style: MUTED,
    luminance: MUTED_LUMINANCE,
  };
  out.push(plate);
  out.push(
    line('anchor-post', [[ANCHOR.x, ANCHOR.y + ANCHOR_R], [ANCHOR.x, FLOOR_Y - PLATE_THICK]], W_ANCHOR, INK),
  );

  // ---- 줄 ----
  out.push(
    line('rope-hand', [[L.handX, ROPE_TOP_Y], [L.s1Left, ROPE_TOP_Y]], W_ROPE, INK),
    line('rope-between', [[L.s1Right, ROPE_TOP_Y], [L.s2Left, ROPE_TOP_Y]], W_ROPE, INK),
    // 저울2 → 도르래 꼭대기 → 둘레 사분원 → 수직으로 저울3
    line(
      'rope-over-pulley',
      [
        [L.s2Right, ROPE_TOP_Y],
        ...arcPx(PULLEY.x, PULLEY.y, PULLEY.r, -Math.PI / 2, 0, CIRCLE_SEGMENTS / 4),
        [VERT_X, L.s3Top],
      ],
      W_ROPE,
      INK,
    ),
    line('rope-anchor', [[VERT_X, L.s3Bottom], [ANCHOR.x, ANCHOR.y - ANCHOR_R]], W_ROPE, INK),
  );

  // ---- 저울 셋 ----
  // 저울1·2 는 오른쪽(도르래 쪽) 고리가 줄에 걸리고 왼쪽(손 쪽)으로 늘어난다.
  const pointerFromHook = HOOK_R + SPRING_REST + ext;
  out.push(
    ...springScale('scale-1', L.s1Right, ROPE_TOP_Y, Math.PI, F, reading, {
      at: [L.s1Right - pointerFromHook, ROPE_TOP_Y + READING_BELOW],
      align: 'center',
    }),
    ...springScale('scale-2', L.s2Right, ROPE_TOP_Y, Math.PI, F, reading, {
      at: [L.s2Right - pointerFromHook, ROPE_TOP_Y + READING_BELOW],
      align: 'center',
    }),
    // 저울3 은 위쪽 고리가 도르래 쪽 줄에 걸리고 아래로 늘어난다. 글자는 돌리지 않고 왼쪽에.
    ...springScale('scale-3', VERT_X, L.s3Top, Math.PI / 2, F, reading, {
      at: [VERT_X - READING_LEFT, L.s3Top + pointerFromHook],
      align: 'right',
    }),
  );

  // ---- 손 ----
  // 원본은 캔버스 왼쪽 가장자리 밖(x = −10)에서 출발해 팔이 화면 끝에서 들어온다. 엔진의
  // 캔버스는 경계보다 넓을 수 있어 그 자리에서 끊으면 팔이 허공에서 시작한다 — 같은 직선을
  // 왼쪽으로 늘여 캔버스 밖에서 출발시킨다.
  const armA: Px = [ARM_START_X, ROPE_TOP_Y + ARM_START_DY];
  const armB: Px = [L.handX + ARM_END_DX, ROPE_TOP_Y + ARM_END_DY];
  const k = (armA[0] - ARM_REACH_X) / (armB[0] - armA[0]);
  const armStart: Px = [ARM_REACH_X, armA[1] - (armB[1] - armA[1]) * k];
  out.push(
    line('arm', [armStart, armB], W_ARM, MUTED, {
      luminance: MUTED_LUMINANCE,
    }),
  );
  const fistOutline = roundRectPx(L.handX - FIST_LEFT, ROPE_TOP_Y - FIST_SIZE / 2, FIST_SIZE, FIST_SIZE, FIST_CORNER);
  const fistFill: Region = {
    type: 'region',
    id: 'fist-fill',
    points: toWorld(fistOutline),
    fillOpacity: 1,
    style: INK,
    luminance: BACKGROUND_LUMINANCE,
  };
  out.push(fistFill);
  out.push(line('fist', fistOutline, W_FIST, INK, { closed: true }));
  for (let i = 1; i < 3; i++) {
    const y = ROPE_TOP_Y - FIST_SIZE / 2 + (FIST_SIZE / 3) * i;
    out.push(line(`fist-knuckle-${i}`, [[L.handX - KNUCKLE_HALF, y], [L.handX + KNUCKLE_HALF, y]], W_KNUCKLE, INK));
  }

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
