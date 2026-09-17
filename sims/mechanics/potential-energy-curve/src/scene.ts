// ========================================================================
// potential-energy-curve — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 순서는 원본이 그린 순서 그대로다(`drawOrder: 'scene'`) —
// 전환점 고리가 물체 위에 얹혀 겹쳐도 보인다.
//
// 강조색은 「되돌아오는 점」 한 가지 뜻에만. 곡선 · 막대는 같은 계열(같은 에너지
// 도표의 두 부분), 물체 · 선은 먹색.
// ========================================================================

import type { Bounds, Primitive, SceneGraph, Vec2 } from '@aperi21/schema';
import { potential } from './physics';
import {
  BODY_R,
  CANVAS_CLIP,
  CANVAS_H_PX,
  CANVAS_W_PX,
  DROP_BOTTOM_Y,
  GAP_HALF_W,
  GAP_LABEL_MIN,
  PAD_B_PX,
  PAD_L_PX,
  PAD_R_PX,
  PAD_T_PX,
  PX,
  RING_DOT_PX,
  RING_PX,
  SCENE_BOUNDS,
  TRAIL_DOT_PX,
  U_MAX,
  U_MIN,
  Y_BOT,
  Y_TOP,
  text,
} from './schema';
import type { PotentialEnergyCurveState } from './state';

/** 곡선 · 벽을 표본하는 칸 수. 원본 400. */
const SAMPLES = 400;
/** 원본 캔버스 위 끝 — 곡선이 이보다 높으면 벽 채움을 여기서 자른다. */
const TOP_Y = (CANVAS_H_PX / 2) * PX;

/** 위치 → 월드 x. 원본 `sx` 를 px 그대로 옮기고 100 px 을 1 로 줄였다. */
export function worldX(u: number): number {
  const px = PAD_L_PX + ((u - U_MIN) / (U_MAX - U_MIN)) * (CANVAS_W_PX - PAD_L_PX - PAD_R_PX);
  return (px - CANVAS_W_PX / 2) * PX;
}

/** 에너지 → 월드 y. 원본 `sy`. */
export function worldY(e: number): number {
  const py = PAD_T_PX + ((Y_TOP - e) / (Y_TOP - Y_BOT)) * (CANVAS_H_PX - PAD_T_PX - PAD_B_PX);
  return (CANVAS_H_PX / 2 - py) * PX;
}

const sampleU = (i: number): number => U_MIN + ((U_MAX - U_MIN) * i) / SAMPLES;

/** 퍼텐셜 곡선의 점들. 모양이 고정이라 한 번만 만든다. */
const CURVE_POINTS: readonly Vec2[] = Array.from({ length: SAMPLES + 1 }, (_, i) => {
  const u = sampleU(i);
  return [worldX(u), worldY(potential(u))] as const;
});

/** 곡선이 선보다 높은 구간마다 선과 곡선 사이 다각형 — 들어갈 수 없는 곳. */
function wallPolygons(E: number): Vec2[][] {
  const lineY = worldY(E);
  const out: Vec2[][] = [];
  let open: Vec2[] | null = null;
  for (let i = 0; i <= SAMPLES; i++) {
    const u = sampleU(i);
    const p = potential(u);
    const above = p > E;
    const x = worldX(u);
    if (above && !open) open = [[x, lineY]];
    if (above && open) open.push([x, Math.min(worldY(p), TOP_Y)]);
    if ((!above || i === SAMPLES) && open) {
      open.push([x, lineY]);
      out.push(open);
      open = null;
    }
  }
  return out;
}

export function scene(params: { state: PotentialEnergyCurveState }): SceneGraph {
  const s = params.state;
  const lineY = worldY(s.E);
  const g: Primitive[] = [];

  // ── 들어갈 수 없는 곳 ──
  wallPolygons(s.E).forEach((points, i) => {
    g.push({
      type: 'region',
      id: `wall-${i}`,
      points,
      fillOpacity: 0.07,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });

  // ── 퍼텐셜 에너지 곡선 + 이름표 ──
  g.push({
    type: 'trajectory',
    id: 'potential-curve',
    points: CURVE_POINTS,
    width: 2.5,
    clip: CANVAS_CLIP,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  g.push({
    type: 'readout',
    id: 'potential-label',
    anchor: { world: [worldX(1.07), worldY(0.52)], offset: [-10, -4.5] },
    text: text('label.potential'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'right',
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ── 전체 에너지 선: 닿을 수 없는 구간은 옅은 점선, 오가는 구간은 진한 실선 ──
  g.push({
    type: 'trajectory',
    id: 'energy-line-full',
    points: [
      [worldX(U_MIN), lineY],
      [worldX(U_MAX), lineY],
    ],
    width: 1.2,
    opacity: 0.28,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });
  g.push({
    type: 'trajectory',
    id: 'energy-line-reach',
    points: [
      [worldX(s.uL), lineY],
      [worldX(s.uR), lineY],
    ],
    width: 2,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 에너지 높이 손잡이 이름표 ──
  g.push({
    type: 'readout',
    id: 'energy-handle-label',
    anchor: { world: [worldX(0.8), lineY], offset: [0, -12] },
    text: text('label.total'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'right',
    style: s.manual
      ? { colorRole: 'ink', emphasis: 'strong' }
      : { colorRole: 'muted', emphasis: 'strong' },
  });

  // ── 물체가 지나온 자리: 같은 시간 간격 자국. 오래될수록 옅다 ──
  const n = s.trail.length;
  const positions: Vec2[] = [];
  const opacities: number[] = [];
  s.trail.forEach((u, i) => {
    // 에너지가 줄기 전 자국은 벽 안쪽에 남기지 않는다.
    if (u < s.uL || u > s.uR) return;
    positions.push([worldX(u), lineY]);
    opacities.push(0.08 + (0.42 * (i + 1)) / n);
  });
  if (positions.length > 0) {
    g.push({
      type: 'particleSystem',
      id: 'trail',
      positions,
      opacities,
      sizes: TRAIL_DOT_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ── 운동 에너지 틈: 물체 자리에서 곡선부터 선까지 세운 막대 ──
  const bx = worldX(s.u);
  const curveY = worldY(potential(s.u));
  const gap = Math.max(0, lineY - curveY);
  if (gap > 0) {
    g.push({
      type: 'region',
      id: 'kinetic-gap',
      points: [
        [bx - GAP_HALF_W, lineY],
        [bx + GAP_HALF_W, lineY],
        [bx + GAP_HALF_W, curveY],
        [bx - GAP_HALF_W, curveY],
      ],
      fillOpacity: 0.28,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }
  if (gap > GAP_LABEL_MIN) {
    const rightSide = s.u < 0.9;
    g.push({
      type: 'readout',
      id: 'kinetic-label',
      anchor: { world: [bx, (lineY + curveY) / 2], offset: [rightSide ? 10 : -10, 0] },
      text: text('label.kinetic'),
      chip: false,
      font: 'text',
      fontSize: 12,
      align: rightSide ? 'left' : 'right',
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // ── 물체: 에너지 선 위의 점 ──
  g.push({
    type: 'body',
    id: 'object',
    pos: [bx, lineY],
    shape: 'circle',
    size: BODY_R,
    outline: 'background',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ── 되돌아오는 점: 고리 + 가운데 점 + 아래로 내린 세로선 ──
  const turns: Vec2[] = [
    [worldX(s.uL), lineY],
    [worldX(s.uR), lineY],
  ];
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  g.push({
    type: 'trace',
    id: 'turning-rings',
    marks: turns.map((pos) => ({ pos })),
    shape: 'ring',
    size: RING_PX,
    width: 2,
    style: accent,
  });
  g.push({
    type: 'trace',
    id: 'turning-dots',
    marks: turns.map((pos) => ({ pos })),
    shape: 'dot',
    size: RING_DOT_PX,
    style: accent,
  });
  g.push({
    type: 'lineSet',
    id: 'turning-drops',
    lines: turns.map(([x, y]) => [
      [x, y - RING_PX * PX],
      [x, DROP_BOTTOM_Y],
    ]),
    width: 2,
    style: accent,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 원본 캔버스와 그 아래 캡션 줄. 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
