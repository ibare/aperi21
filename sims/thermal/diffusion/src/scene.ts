// ========================================================================
// diffusion — 장면 선언
// ========================================================================
// 그리지 않고 선언한다. 캔버스 · 색 · 좌표 변환을 만지지 않는다 (S-sim).
//
// 위 — 물통. 잉크 알갱이 무리와, 그중 한 알갱이의 걸어온 길.
// 아래 — 같은 가로축을 구간으로 나눠 센 알갱이 수 막대. 물통 안의 옅은 가름선이 그 구간이다.
//
// 걸음 번호 = 단계(`leave` · `spread` · `even`)마다 진행도 × 그 단계의 걸음 수의 합. 단계 안을 코드로
// 가르지 않는다 — 나타남 · 사라짐은 `drop` · `clear` 단계의 진행도다 (S-piece).
// ========================================================================

import type { Bounds, EnvironmentDef, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { countBins, positionAt, readConstants } from './physics';
import { BAR_BASE_Y, BAR_LABEL_AT, SCENE_BOUNDS, TANK, text } from './schema';
import type { DiffusionState } from './state';

/** 알갱이 점 반지름(화면 px). */
const PARTICLE_PX = 2.2;
/** 무리 알갱이 불투명도 — 따라가는 한 알갱이와 그 길이 위에서 읽히도록 조금 옅게. */
const PARTICLE_OPACITY = 0.75;
/** 따라가는 알갱이의 반지름(월드). */
const TRACKED_R = 0.11;
/** 따라가는 알갱이 경로 굵기(화면 px). */
const PATH_WIDTH_PX = 1.5;
/** 물의 채움 불투명도. */
const WATER_FILL = 0.14;
/** 물통 안 구간 가름선의 불투명도 · 굵기(화면 px). */
const COLUMN_OPACITY = 0.35;
const COLUMN_WIDTH_PX = 1;
/** 막대 채움 불투명도. */
const BAR_FILL = 0.55;
/** 막대 사이 틈(구간 폭에 대한 몫, 한쪽). */
const BAR_GAP = 0.08;
/** 막대 바닥선 굵기(화면 px). */
const BASELINE_WIDTH_PX = 1;
/** 막대 이름표 글자 크기(화면 px). */
const LABEL_PX = 11;

export function scene(params: {
  state: DiffusionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  const c = readConstants(stage);
  const out: SceneGraph[number][] = [];

  // 시간표가 없으면(정지 미리보기) 퍼지는 중간을 보인다.
  const k = tl
    ? tl.at('leave') * c.leaveSteps + tl.at('spread') * c.spreadSteps + tl.at('even') * c.settleSteps
    : c.leaveSteps + c.spreadSteps / 2;
  const show = tl ? tl.at('drop') * (1 - tl.at('clear')) : 1;

  // --- 물통 -----------------------------------------------------------
  out.push({
    type: 'region',
    id: 'water',
    points: [
      [TANK.minX, TANK.maxY],
      [TANK.minX, TANK.minY],
      [TANK.maxX, TANK.minY],
      [TANK.maxX, TANK.maxY],
    ],
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
    fillOpacity: WATER_FILL,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 구간 가름선 — 아래 막대 한 칸이 물통의 어느 띠를 센 것인지.
  const binW = (TANK.maxX - TANK.minX) / c.bins;
  const columns: Vec2[][] = [];
  for (let b = 1; b < c.bins; b++) {
    const x = TANK.minX + b * binW;
    columns.push([
      [x, TANK.minY],
      [x, TANK.maxY],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'strips',
    lines: columns,
    width: COLUMN_WIDTH_PX,
    opacity: COLUMN_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // --- 알갱이 ---------------------------------------------------------
  const n = c.particles;
  const crowd: Vec2[] = [];
  const xs: number[] = [];
  let trackedPos: Vec2 = [0, 0];
  for (let i = 0; i < n; i++) {
    const p = positionAt(state, i, k);
    xs.push(p[0]);
    if (i === state.tracked) trackedPos = p;
    else crowd.push(p);
  }

  if (show > 0) {
    out.push({
      type: 'particleSystem',
      id: 'ink',
      positions: crowd,
      sizes: PARTICLE_PX,
      opacity: PARTICLE_OPACITY * show,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 따라가는 한 알갱이의 걸어온 길 — 최근 trailSteps 걸음.
    const path: Vec2[] = [];
    for (let s = Math.max(0, Math.ceil(k) - c.trailSteps); s <= Math.floor(k); s++) path.push(positionAt(state, state.tracked, s));
    path.push(trackedPos);
    if (path.length >= 2) {
      out.push({
        type: 'trajectory',
        id: 'tracked-path',
        points: path,
        width: PATH_WIDTH_PX,
        opacity: show,
        style: { colorRole: 'accent', emphasis: 'medium', fade: 'tail' },
      });
    }
    out.push({
      type: 'body',
      id: 'tracked',
      pos: trackedPos,
      shape: 'circle',
      size: TRACKED_R,
      outline: 'background',
      glow: false,
      opacity: show,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // --- 구간 막대 ------------------------------------------------------
  out.push({
    type: 'trajectory',
    id: 'baseline',
    points: [
      [TANK.minX, BAR_BASE_Y],
      [TANK.maxX, BAR_BASE_Y],
    ],
    width: BASELINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const counts = countBins(xs, c.bins);
  counts.forEach((count, b) => {
    const h = count * c.barScale * show;
    if (h <= 0) return;
    const x0 = TANK.minX + (b + BAR_GAP) * binW;
    const x1 = TANK.minX + (b + 1 - BAR_GAP) * binW;
    out.push({
      type: 'region',
      id: `bar-${b}`,
      points: [
        [x0, BAR_BASE_Y],
        [x1, BAR_BASE_Y],
        [x1, BAR_BASE_Y + h],
        [x0, BAR_BASE_Y + h],
      ],
      fillOpacity: BAR_FILL,
      style: { colorRole: 'primary', emphasis: 'medium' },
    });
  });

  out.push({
    type: 'readout',
    id: 'bars-label',
    anchor: { world: BAR_LABEL_AT },
    text: text('label.bars'),
    align: 'left',
    font: 'text',
    chip: false,
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
