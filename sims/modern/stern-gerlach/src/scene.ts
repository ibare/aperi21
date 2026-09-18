// ========================================================================
// stern-gerlach — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 가마 · 슬릿 · 옆 스크린(body rect) ·
// 자극과 스크린 정면 판(region) · 지나간 길(lineSet) · 날아가는 원자(particleSystem) · 가정 원자의
// 자석 바늘(vector) · 가정 원자의 자국(trace ring) · 실제 원자의 자국(particleSystem) · 이름표(readout).
//
// 색 — 장치와 글자는 무채색(muted), 원자 · 자국은 먹(ink). 강조색은 쓰지 않는다. 가정과 실제는 색이
// 아니라 **모양**으로 가른다 — 가정 원자는 바늘을 달고 날아가 속 빈 고리로 떨어지고, 실제 원자는
// 바늘 없이 날아가 채운 점으로 떨어진다 (S-piece: 색으로 설명하지 않는다).
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { expectAtoms, fullPath, readAtoms, readConstants, realAtoms, type AtomView } from './physics';
import {
  MAGNET_X0,
  MAGNET_X1,
  OVEN_X,
  PANEL_CX,
  PANEL_HALF,
  POLE_INNER,
  POLE_OUTER,
  SCENE_BOUNDS,
  SCREEN_HALF,
  SCREEN_X,
  SLIT_X,
  text,
  type SternGerlachMessageKey,
} from './schema';
import type { SternGerlachState } from './state';

/** 가마 크기(월드) — 가로 · 세로. */
const OVEN_SIZE: Vec2 = [2, 1.6];
/** 슬릿 판 — 두께(월드), 틈 반폭(월드), 판 반높이(월드). */
const SLIT_THICK = 0.18;
const SLIT_GAP = 0.3;
const SLIT_HALF = 1.1;
/** 옆에서 본 스크린 두께(월드). */
const SCREEN_THICK = 0.16;
/** 자극 · 정면 판의 옅은 칠. */
const POLE_FILL = 0.2;
const PANEL_FILL = 0.08;
/** 지나간 길 굵기(화면 px) · 짙기. 가정 원자의 부채는 띠가 물러날 때 함께 옅어진다. */
const PATH_WIDTH = 1;
const EXPECT_PATH_OPACITY = 0.28;
const REAL_PATH_OPACITY = 0.18;
/** 날아가는 원자 점 크기(화면 px). */
const ATOM_PX = 2.6;
/** 가정 원자의 자석 바늘 — 반길이(월드) · 굵기(화면 px) · 머리 크기(월드). */
const NEEDLE_HALF = 0.42;
const NEEDLE_WIDTH = 1.4;
const NEEDLE_HEAD = 0.26;
/** 가정 원자의 자국 — 속 빈 고리 반지름(화면 px) · 굵기(화면 px). */
const RING_PX = 2.6;
const RING_WIDTH = 1.1;
/** 예상한 띠의 짙기 — 채워지는 동안 · 흔적으로 물러난 뒤. */
const EXPECT_MARK_OPACITY = 0.9;
const GHOST_OPACITY = 0.3;
/** 실제 원자의 자국 — 채운 점 크기(화면 px). */
const HIT_PX = 2.2;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const POLE_PX = 14;
const SPIN_PX = 16;
/** 장치 이름표를 장치 위로 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 판 오른쪽 이름표를 판에서 띄우는 거리(월드). */
const SIDE_LABEL_GAP = 0.45;

function label(
  id: string,
  key: SternGerlachMessageKey,
  pos: Vec2,
  align: Readout['align'],
  opts: { size?: number; offset?: Vec2; opacity?: number; bold?: boolean } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: opts.size ?? LABEL_PX,
    align,
    ...(opts.bold ? { weight: 'bold' as const } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function rect(id: string, center: Vec2, size: Vec2, role: 'ink' | 'muted'): Body {
  return {
    type: 'body',
    id,
    pos: center,
    shape: 'rect',
    size,
    outline: 'none',
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function box(id: string, x0: number, x1: number, y0: number, y1: number, fill: number): Region {
  return {
    type: 'region',
    id,
    points: [
      [x0, y1],
      [x1, y1],
      [x1, y0],
      [x0, y0],
    ],
    opaque: true,
    fillOpacity: fill,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 스크린에 닿은 원자들의 온 길. */
function landedPaths(views: readonly AtomView[]): Vec2[][] {
  return views.flatMap((v) => (v.hit ? [fullPath(v.atom)] : []));
}

export function scene(params: {
  state: SternGerlachState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('stern-gerlach: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const expect = readAtoms(expectAtoms(tl, c), tl, c);
  const real = readAtoms(realAtoms(tl, c), tl, c);
  /** 주기 끝에서 길 · 자국이 함께 흐려진다. */
  const keep = 1 - tl.at('fade');
  /** 예상한 띠가 흔적으로 물러난 정도. */
  const dim = tl.at('dim');
  const expectOpacity = (EXPECT_MARK_OPACITY + (GHOST_OPACITY - EXPECT_MARK_OPACITY) * dim) * keep;
  const out: Primitive[] = [];

  // ── 스크린 정면 판 ─────────────────────────────────
  out.push(box('panel', PANEL_CX - PANEL_HALF, PANEL_CX + PANEL_HALF, -SCREEN_HALF, SCREEN_HALF, PANEL_FILL));

  // ── 자석 — 위가 N, 아래가 S. 옆에서 보면 두 자극 사이를 빔이 지난다 ──
  out.push(box('pole-north', MAGNET_X0, MAGNET_X1, POLE_INNER, POLE_OUTER, POLE_FILL));
  out.push(box('pole-south', MAGNET_X0, MAGNET_X1, -POLE_OUTER, -POLE_INNER, POLE_FILL));

  // ── 지나간 길 — 가정 원자는 부채, 실제 원자는 두 갈래 ──────────
  const fan = landedPaths(expect);
  if (fan.length > 0 && keep > 0) {
    out.push({
      type: 'lineSet',
      id: 'expect-paths',
      lines: fan,
      width: PATH_WIDTH,
      opacity: (EXPECT_PATH_OPACITY * expectOpacity) / EXPECT_MARK_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
  }
  const fork = landedPaths(real);
  if (fork.length > 0 && keep > 0) {
    out.push({
      type: 'lineSet',
      id: 'real-paths',
      lines: fork,
      width: PATH_WIDTH,
      opacity: REAL_PATH_OPACITY * keep,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
  }

  // ── 가마 · 슬릿 · 옆에서 본 스크린 ───────────────────────
  out.push(rect('oven', [OVEN_X - OVEN_SIZE[0] / 2, 0], OVEN_SIZE, 'ink'));
  const slitLen = SLIT_HALF - SLIT_GAP;
  out.push(rect('slit-top', [SLIT_X, SLIT_GAP + slitLen / 2], [SLIT_THICK, slitLen], 'ink'));
  out.push(rect('slit-bottom', [SLIT_X, -SLIT_GAP - slitLen / 2], [SLIT_THICK, slitLen], 'ink'));
  out.push(rect('screen', [SCREEN_X + SCREEN_THICK / 2, 0], [SCREEN_THICK, 2 * SCREEN_HALF], 'muted'));

  // ── 스크린에 남은 자국 — 가정은 속 빈 고리, 실제는 채운 점 ──────────
  const rings = expect.flatMap((v) => (v.hit ? [{ pos: v.hit }] : []));
  if (rings.length > 0 && keep > 0) {
    out.push({
      type: 'trace',
      id: 'expect-marks',
      marks: rings,
      shape: 'ring',
      size: RING_PX,
      width: RING_WIDTH,
      opacity: expectOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies Trace);
  }
  const dots = real.flatMap((v) => (v.hit ? [v.hit] : []));
  if (dots.length > 0 && keep > 0) {
    out.push({
      type: 'particleSystem',
      id: 'real-marks',
      positions: dots,
      sizes: HIT_PX,
      opacity: keep,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }

  // ── 날아가는 원자 — 가정 원자는 자석 바늘을 달고 간다 ───────────
  const flying = [...expect, ...real].flatMap((v) => (v.pos ? [v.pos] : []));
  if (flying.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'atoms',
      positions: flying,
      sizes: ATOM_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
  }
  expect.forEach((v, i) => {
    if (!v.pos || !v.atom.needle) return;
    const [nx, nz] = v.atom.needle;
    out.push({
      type: 'vector',
      id: `needle-${i}`,
      from: [v.pos[0] - nx * NEEDLE_HALF, v.pos[1] - nz * NEEDLE_HALF],
      delta: [2 * nx * NEEDLE_HALF, 2 * nz * NEEDLE_HALF],
      headSize: NEEDLE_HEAD,
      width: NEEDLE_WIDTH,
      style: { colorRole: 'ink', emphasis: 'medium' },
    } satisfies Vector);
  });

  // ── 이름표 ──────────────────────────────────────
  out.push(label('oven-label', 'label.oven', [OVEN_X - OVEN_SIZE[0] / 2, OVEN_SIZE[1] / 2], 'center', { offset: [0, -LABEL_GAP] }));
  out.push(label('magnet-label', 'label.magnet', [(MAGNET_X0 + MAGNET_X1) / 2, POLE_OUTER], 'center', { offset: [0, -LABEL_GAP] }));
  out.push(label('screen-label', 'label.screen', [SCREEN_X, SCREEN_HALF], 'center', { offset: [0, -LABEL_GAP] }));
  out.push(label('face-label', 'label.face', [PANEL_CX, SCREEN_HALF], 'center', { offset: [0, -LABEL_GAP] }));
  const poleX = (MAGNET_X0 + MAGNET_X1) / 2;
  const poleMid = (POLE_INNER + POLE_OUTER) / 2;
  out.push(label('north', 'mark.north', [poleX, poleMid], 'center', { size: POLE_PX, bold: true }));
  out.push(label('south', 'mark.south', [poleX, -poleMid], 'center', { size: POLE_PX, bold: true }));

  // 예상한 띠 — 띠가 흔적으로 물러나며 나타난다. 띠의 한가운데(실제 원자가 하나도 오지 않는 자리) 옆에 둔다.
  const sideX = PANEL_CX + PANEL_HALF + SIDE_LABEL_GAP;
  if (dim > 0 && keep > 0) {
    out.push(label('expected-label', 'label.expected', [sideX, 0], 'left', { opacity: dim * keep }));
  }
  // 두 점 — 스핀의 두 값. 실제 원자가 다 닿은 뒤 나타난다.
  const reveal = tl.at('reveal') * keep;
  if (reveal > 0) {
    out.push(label('spin-up', 'mark.up', [sideX, c.deflection], 'left', { size: SPIN_PX, bold: true, opacity: reveal }));
    out.push(label('spin-down', 'mark.down', [sideX, -c.deflection], 'left', { size: SPIN_PX, bold: true, opacity: reveal }));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
