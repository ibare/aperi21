// ========================================================================
// fictitious-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 바깥 풍경: 나무(body custom 삼각형, 옅게, 캔버스 폭으로 clip) · 땅 선(trajectory).
// 기둥과 팔: trajectory 둘 + 꼭대기 고리(trajectory closed 타원 표본).
// 추마다: 줄(trajectory) · 두 힘의 합 점선(trajectory dashed 둘) · 중력 · 관성력(vector) ·
//   추(body circle) · 질량 글자(readout). 오른쪽 추에만 힘 이름표(readout 둘).
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 좌표는 원본 캔버스 px 로 계산한 뒤 `world` 로 옮긴다 — 월드 1 = 원본 100 px, y 는 위.
// ========================================================================

import type { Body, Primitive, Readout, SceneGraph, Trajectory, Vec2, Vector } from '@aperi21/schema';
import {
  ARROW_HEAD,
  BOB_RADIUS,
  FORCE_LABEL,
  FRAME,
  HUB,
  L,
  LABEL_FONT,
  LIGHT_M,
  MASS_LABEL_GAP,
  ORIGIN_CANVAS,
  PPM,
  PPN,
  R,
  SCENERY,
  SCENE_BOUNDS,
  text,
} from './schema';
import { forcesOn, omegaAt } from './physics';
import type { Bob, FictitiousForceState } from './state';

/** 원본 px → 월드. */
const PX = 1 / 100;
function world(px: number, py: number): Vec2 {
  return [px * PX, (ORIGIN_CANVAS.height - py) * PX];
}
function len(px: number): number {
  return px * PX;
}

/** 고리 타원의 표본 점 개수. */
const RING_SEGMENTS = 48;

// ---- 굵기(화면 px) — 원본 값 그대로. 굵기는 위계라 배율을 따라가지 않는다 ----
const GROUND_WIDTH = 1;
const POLE_WIDTH = 6;
const ARM_WIDTH = 4;
const RING_WIDTH = 1.5;
const STRING_WIDTH = 1.5;
const SUM_WIDTH = 1;
const GRAVITY_WIDTH = 2.5;
const INERTIAL_WIDTH = 3;

/** 나무 채움의 옅기 — 원본은 바탕에 가까운 옅은 베이지. */
const TREE_OPACITY = 0.14;

// ---- 색 — 같은 대상은 같은 색. 강조색은 관성력 한 가지 뜻에만 ----
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const FAINT = { colorRole: 'muted', emphasis: 'subtle' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 캔버스 폭 밖으로 나가는 나무를 자른다 — 임베드가 원본보다 넓어도 풍경은 원본 폭까지만. */
const CANVAS_CLIP = {
  min: [SCENE_BOUNDS.minX, 0] as Vec2,
  max: [SCENE_BOUNDS.maxX, SCENE_BOUNDS.maxY] as Vec2,
};

function line(
  id: string,
  pts: readonly (readonly [number, number])[],
  width: number,
  style: Trajectory['style'],
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: pts.map(([x, y]) => world(x, y)), width, style, ...extra };
}

/** 원본 `arrow` — 1 px 아래는 긋지 않는다. 화살촉은 min(10, 길이 × 0.45) px. */
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
    headSize: len(Math.min(ARROW_HEAD, lengthPx * 0.45)),
    width,
    style,
  };
}

/** 그림 속 글자 한 줄. 월드에 붙고 칩을 깔지 않는다. `dy` 는 화면 px. */
function label(
  id: string,
  at: Vec2,
  body: Readout['text'],
  align: Readout['align'],
  style: Readout['style'],
  dy: number,
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: [0, dy] },
    text: body,
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize: LABEL_FONT,
    style,
  };
}

// ------------------------------------------------------------------------
// 바깥 풍경 · 기둥과 팔
// ------------------------------------------------------------------------

function scenery(phi: number, out: Primitive[]): void {
  // 그네와 함께 도는 눈으로 보면 멀리 있는 나무들이 옆으로 흘러간다
  const { spacing, pxPerRad, halfWidth, baseHeight, heightStep } = SCENERY;
  const shift = (((phi * pxPerRad) % spacing) + spacing) % spacing;
  const count = Math.ceil(ORIGIN_CANVAS.width / spacing) + 1;
  for (let i = -1; i <= count; i++) {
    const x = i * spacing - shift;
    const h = baseHeight + (((i % 3) + 3) % 3) * heightStep;
    const w = len(halfWidth);
    const tree: Body = {
      type: 'body',
      id: `tree-${i}`,
      pos: world(x, FRAME.groundY),
      shape: 'custom',
      customPath: `M ${-w} 0 L 0 ${len(h)} L ${w} 0 Z`,
      opacity: TREE_OPACITY,
      clip: CANVAS_CLIP,
      style: MUTED,
    };
    out.push(tree);
  }
  out.push(
    line('ground', [[0, FRAME.groundY + 0.5], [ORIGIN_CANVAS.width, FRAME.groundY + 0.5]], GROUND_WIDTH, FAINT),
  );
}

function frame(out: Primitive[]): void {
  const { cx, armY, groundY } = FRAME;
  out.push(line('pole', [[cx, groundY], [cx, armY - HUB.poleAbove]], POLE_WIDTH, INK));
  out.push(line('arm', [[cx - R * PPM, armY], [cx + R * PPM, armY]], ARM_WIDTH, INK));
  // 도는 축 표시 — 기둥 꼭대기의 납작한 고리
  const ring = Array.from({ length: RING_SEGMENTS }, (_, i): [number, number] => {
    const a = (i / RING_SEGMENTS) * Math.PI * 2;
    return [cx + HUB.ringRx * Math.cos(a), armY + HUB.ringDy + HUB.ringRy * Math.sin(a)];
  });
  out.push(line('hub-ring', ring, RING_WIDTH, MUTED, { closed: true }));
}

// ------------------------------------------------------------------------
// 추 하나
// ------------------------------------------------------------------------

function bob(name: 'left' | 'right', b: Bob, m: number, omega: number, out: Primitive[]): void {
  const side = name === 'left' ? -1 : 1;
  const pivotX = FRAME.cx + side * R * PPM;
  const x = pivotX + side * L * PPM * Math.sin(b.th);
  const y = FRAME.armY + L * PPM * Math.cos(b.th);
  const f = forcesOn(b, m, omega);
  const gy = f.gravity * PPN;
  const ix = side * f.inertial * PPN;

  // ---- 줄 ----
  out.push(line(`${name}-string`, [[pivotX, FRAME.armY], [x, y]], STRING_WIDTH, MUTED));

  // ---- 두 힘의 합 — 직사각형의 먼 꼭짓점은 언제나 줄의 연장선 위 ----
  const dashed = { ...FAINT, lineStyle: 'dashed' } as const;
  out.push(line(`${name}-sum-rect`, [[x + ix, y], [x + ix, y + gy], [x, y + gy]], SUM_WIDTH, dashed));
  out.push(line(`${name}-sum-diagonal`, [[x, y], [x + ix, y + gy]], SUM_WIDTH, dashed));

  // ---- 중력 · 관성력 ----
  const gravity = arrow(`${name}-gravity`, [x, y], [x, y + gy], GRAVITY_WIDTH, MUTED);
  if (gravity) out.push(gravity);
  const inertial = arrow(`${name}-inertial`, [x, y], [x + ix, y], INERTIAL_WIDTH, ACCENT);
  if (inertial) out.push(inertial);

  // ---- 추와 질량 글자 ----
  const rad = BOB_RADIUS * Math.cbrt(m);
  const body: Body = {
    type: 'body',
    id: `${name}-bob`,
    pos: world(x, y),
    shape: 'circle',
    size: len(rad),
    outline: 'none',
    glow: false,
    style: INK,
  };
  out.push(body);
  // 추 아래 기둥 쪽 — 줄·화살표와 겹치지 않는 자리. 원본은 글자 윗변을 이 높이에 맞췄다.
  out.push(
    label(
      `${name}-mass`,
      world(x - side * (rad + MASS_LABEL_GAP), y + rad + MASS_LABEL_GAP),
      text('label.massValue'),
      side < 0 ? 'left' : 'right',
      INK,
      LABEL_FONT / 2,
      { m: m.toFixed(0) },
    ),
  );

  // ---- 힘 이름표 — 화살표가 큰 오른쪽에만 ----
  if (side > 0) {
    // 관성력: 원본은 글자 아랫변을 추 위 6 px 에 맞췄다.
    out.push(
      label('name-inertial', world(x + ix / 2, y + FORCE_LABEL.inertialDy), text('label.inertial'), 'center', ACCENT, -LABEL_FONT / 2),
    );
    out.push(
      label(
        'name-gravity',
        world(x + FORCE_LABEL.gravityDx, y + gy * FORCE_LABEL.gravityAt),
        text('label.gravity'),
        'left',
        MUTED,
        0,
      ),
    );
  }
}

export function scene(params: { state: FictitiousForceState }): SceneGraph {
  const s = params.state;
  const omega = omegaAt(s.t);
  const out: Primitive[] = [];
  scenery(s.phi, out);
  frame(out);
  bob('left', s.left, LIGHT_M, omega, out);
  bob('right', s.right, s.heavyMass, omega, out);
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
