// ========================================================================
// poiseuille-flow — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 물 · 단면 · 받는 칸의 물(region) · 벽(surface) · 입구출구 타원과 단면 테두리
// (trajectory closed) · 흐름 점(particleSystem) · 염료 전선(lineSet) · 칸 테두리(lineSet).
// 자유 렌더 없음.
//
// 색은 셋뿐이다 — 물(secondary 옅게), 염료(secondary 짙게), 벽(먹). 같은 물은 관 속이든
// 단면이든 칸 속이든 같은 색이다. 강조색은 쓰지 않는다 (NOTES.md).
// ========================================================================

import type {
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  Surface,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  cells,
  dotPositions,
  dotSeeds,
  dyeFronts,
  PIPE_LENGTH,
  worldY,
  type Pipe,
} from './physics';
import {
  CELL,
  DOTS,
  DYE,
  PIPE_X,
  PIPES,
  poiseuilleFlowSchema,
  SCENE_BOUNDS,
  SECTION_X,
  WALL,
} from './schema';
import type { PoiseuilleFlowState } from './state';

/** 원 · 타원을 긋는 점 수. 곡선 어휘가 없어 점으로 표본한다 (NOTES 「어휘 부족」 G28). */
const CURVE_SAMPLES = 64;

/** 물의 색 — 관 속 · 단면 · 받는 칸이 모두 이것이다. 겹쳐도 짙어지지 않게 불투명하게 깐다. */
const WATER_STYLE = { colorRole: 'secondary', emphasis: 'medium' } as const;

/** 흐름 점의 처음 자리. 시드가 선언에 있으므로 언제나 같은 배치다. */
const SEEDS = dotSeeds();

function ellipse(center: Vec2, rx: number, ry: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const a = (i / CURVE_SAMPLES) * Math.PI * 2;
    out.push([center[0] + rx * Math.cos(a), center[1] + ry * Math.sin(a)]);
  }
  return out;
}

function rect(min: Vec2, max: Vec2): Vec2[] {
  return [
    [min[0], min[1]],
    [max[0], min[1]],
    [max[0], max[1]],
    [min[0], max[1]],
  ];
}

function water(id: string, points: Vec2[]): Region {
  return { type: 'region', id, points, opaque: true, style: WATER_STYLE };
}

function wall(id: string, from: Vec2, to: Vec2): Surface {
  return { type: 'surface', id, geometry: { kind: 'wall', from, to }, material: 'solid' };
}

function rim(id: string, points: Vec2[], width: number): Trajectory {
  return {
    type: 'trajectory',
    id,
    points,
    closed: true,
    width,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function pipeScene(pipe: Pipe, flowT: number, fraction: number): Primitive[] {
  const out: Primitive[] = [];
  const cy = worldY(pipe.cy);
  const R = pipe.radius;
  const top = cy + R;
  const bottom = cy - R;
  const id = pipe.id;

  // ---- 단면 ----
  // 옆모습만으로는 굵기가 두 배로만 보인다. 넓이 네 배를 보여야 16 = 4 × 4 가 선다.
  const section = ellipse([SECTION_X, cy], R, R);
  out.push(water(`${id}-section`, section));
  out.push(rim(`${id}-section-rim`, section, WALL.rimWidth));

  // ---- 관 속 물 ----
  out.push(water(`${id}-water`, rect([PIPE_X.inlet, bottom], [PIPE_X.outlet, top])));

  // ---- 흐름 점 ----
  // 전선 사이에서도 흐름이 멈추지 않았고, 가장자리일수록 느리다는 결.
  const dots: ParticleSystem = {
    type: 'particleSystem',
    id: `${id}-dots`,
    positions: dotPositions(pipe, SEEDS[PIPES.indexOf(pipe)] ?? [], flowT),
    sizes: DOTS.size,
    // 물보다 밝은 점. 바탕색 역할이 없어 빛의 양 0(= 바탕색)으로 근사한다 (NOTES 「어휘 부족」).
    luminance: 0,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(dots);

  // ---- 염료 전선 ----
  // 같은 순간 입구를 지난 유체 면. 모양이 곧 속도 분포다. 두 관에 같은 수명이라
  // 같은 나이의 전선끼리 포물선 끝의 앞섬을 견줄 수 있다.
  const fronts = dyeFronts(pipe, flowT);
  const dye: LineSet = {
    type: 'lineSet',
    id: `${id}-dye`,
    lines: fronts.lines,
    opacities: fronts.opacities,
    width: DYE.width,
    clip: { min: [PIPE_X.inlet, bottom], max: [PIPE_X.inlet + PIPE_LENGTH, top] },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
  out.push(dye);

  // ---- 벽 ----
  out.push(wall(`${id}-wall-top`, [PIPE_X.inlet, top], [PIPE_X.outlet, top]));
  out.push(wall(`${id}-wall-bottom`, [PIPE_X.inlet, bottom], [PIPE_X.outlet, bottom]));
  out.push(rim(`${id}-inlet`, ellipse([PIPE_X.inlet, cy], R * WALL.ellipseRatio, R), WALL.ellipseWidth));
  out.push(rim(`${id}-outlet`, ellipse([PIPE_X.outlet, cy], R * WALL.ellipseRatio, R), WALL.ellipseWidth));

  // ---- 받는 칸 ----
  // 같은 크기의 칸. 비는 숫자가 아니라 차오르는 칸의 개수로 센다.
  const grid = cells(pipe, fraction);
  grid.forEach((c, i) => {
    if (c.fill <= 0) return;
    const h = CELL.size * c.fill;
    out.push(water(`${id}-cell-${i}`, rect(c.min, [c.max[0], c.min[1] + h])));
  });
  const outlines: LineSet = {
    type: 'lineSet',
    id: `${id}-cell-outlines`,
    // 원본의 반 픽셀 안쪽 테두리.
    lines: grid.map((c) => {
      const pts = rect([c.min[0] + 0.5, c.min[1] + 0.5], [c.max[0] - 0.5, c.max[1] - 0.5]);
      return [...pts, pts[0]!];
    }),
    width: WALL.cellWidth,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(outlines);

  return out;
}

export function scene(params: {
  state: PoiseuilleFlowState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('poiseuille-flow: schema.timeline 이 선언되어야 한다');

  // 받는 칸은 시간표의 채움 단계 진행도다 — 머무는 동안 1, 새 주기에 0 부터.
  const fraction = timeline.at('fill');
  // 흐름 점 · 염료는 도착한 순간부터 흐른다. 앞당긴 것은 칸의 위상뿐이다 (원본과 같다).
  const flowT = timeline.t - (poiseuilleFlowSchema.startAt ?? 0);

  const out: Primitive[] = [];
  for (const pipe of PIPES) out.push(...pipeScene(pipe, flowT, fraction));
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같아야 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
