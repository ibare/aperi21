// ========================================================================
// boundary-layer — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 층 띠(`region`) · 흐름 점(`particleSystem`, 속도 꼬리) · 자리 기둥
// (`lineSet`) · 속도 화살표(`vector`) · 화살표 끝을 잇는 곡선과 층 가장자리(`trajectory`) ·
// 판(`region` 빗금)이 모두 표준 어휘로 있다.
//
// 색: 판은 먹색, 흐름 점은 먹색 옅게, 속도 화살표와 그 끝 곡선은 주색. 강조색은 **층**
// 한 가지 뜻에만 쓴다 — 옅은 띠와 그 가장자리 점선.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { derive, profileRatio, readConstants, rowClock, rowPosition, speedAt, thickness } from './physics';
import { FLOW_BOX, PLATE_END, PLATE_THICK, SCENE_BOUNDS } from './schema';
import type { BoundaryLayerState } from './state';

/**
 * 흐름 점 줄의 높이(월드). 벽 가까이를 촘촘히 — 속도가 바뀌는 곳이 거기다.
 * 점의 자리는 배치이지 주장의 물리량이 아니다.
 */
const DOT_ROWS: readonly number[] = [0.05, 0.12, 0.2, 0.3, 0.42, 0.56, 0.72, 0.9, 1.1, 1.32, 1.56, 1.82, 2.1, 2.4];
/** 줄마다의 점 수. 한 바퀴 시간에 고르게 뿌린다 — 느린 곳에서 점이 모인다(참 운동). */
const DOTS_PER_ROW = 22;
/** 줄마다 출발을 어긋나게 하는 비(황금비의 소수부) — 점이 세로로 줄지어 서지 않게. */
const ROW_STAGGER = 0.618034;

/** 화살표 묶음의 첫 높이 · 간격(월드). */
const ARROW_Y0 = 0.1;
const ARROW_DY = 0.2;
/** 화살표 끝 곡선 · 층 가장자리의 표본 수. */
const CURVE_SAMPLES = 64;

const rect = (x0: number, x1: number, y0: number, y1: number): Vec2[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** 0 이상 m 미만으로 감는다. */
const wrap = (x: number, m: number): number => ((x % m) + m) % m;

export function scene(params: {
  state: BoundaryLayerState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('boundary-layer: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline);
  const op = r.opacity;
  const top = FLOW_BOX.maxY;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 층 띠 — 앞전에서 흐름을 따라 뻗어 나가며 두꺼워진다 ----
  const reach = PLATE_END * r.layer;
  const edge: Vec2[] = [];
  if (reach > 0) {
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      // 앞전 가까이는 √x 가 가파르므로 촘촘히 표본한다.
      const x = reach * (i / CURVE_SAMPLES) ** 2;
      edge.push([x, thickness(x, c)]);
    }
    g.push({
      type: 'region',
      id: 'layer',
      points: [[0, 0], ...edge, [reach, 0]],
      fillOpacity: 0.2,
      opaque: true,
      opacity: op,
      style: accent,
    });
  }

  // ---- 흐름 점 — 줄마다 제 높이의 빠르기로 흐른다. 벽 가까이일수록 꼬리가 짧다 ----
  const positions: Vec2[] = [];
  const velocities: Vec2[] = [];
  DOT_ROWS.forEach((y, row) => {
    const clock = rowClock(y, FLOW_BOX.minX, FLOW_BOX.maxX, c);
    const offset = wrap(row * ROW_STAGGER, 1) * clock.period;
    for (let k = 0; k < DOTS_PER_ROW; k++) {
      const tau = wrap(timeline.t + offset + (k * clock.period) / DOTS_PER_ROW, clock.period);
      const x = rowPosition(clock, tau);
      positions.push([x, y]);
      velocities.push([speedAt(x, y, c), 0]);
    }
  });
  g.push({
    type: 'particleSystem',
    id: 'flow-dots',
    positions,
    velocities,
    trail: true,
    trailStyle: { seconds: 0.3, width: 1.4, opacity: 0.5 },
    sizes: 1.7,
    opacity: 0.7,
    clip: { min: [FLOW_BOX.minX, 0], max: [FLOW_BOX.maxX, top] },
    style: { colorRole: 'ink', emphasis: 'subtle' },
  });

  // ---- 세 자리의 속도 화살표 묶음 ----
  if (r.arrows > 0) {
    const bases: Vec2[][] = c.stations.map((x) => [
      [x, 0],
      [x, top],
    ]);
    g.push({
      type: 'lineSet',
      id: 'station-bases',
      lines: bases,
      width: 1,
      opacity: op * r.arrows * 0.6,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    c.stations.forEach((x, s) => {
      const d = thickness(x, c);
      for (let y = ARROW_Y0; y < top; y += ARROW_DY) {
        const len = c.arrowLength * profileRatio(y / d) * r.arrows;
        g.push({
          type: 'vector',
          id: `arrow-${s}-${Math.round(y * 100)}`,
          from: [x, y],
          delta: [len, 0],
          width: 2,
          opacity: op,
          style: { colorRole: 'primary', emphasis: 'strong' },
        });
      }

      // 화살표 끝을 잇는 곡선 — 벽에서 0, 층 가장자리에서 꺾여 곧게 선다.
      const tips: Vec2[] = [];
      for (let i = 0; i <= CURVE_SAMPLES; i++) {
        const y = top * (i / CURVE_SAMPLES) ** 1.6;
        tips.push([x + c.arrowLength * profileRatio(y / d) * r.arrows, y]);
      }
      g.push({
        type: 'trajectory',
        id: `profile-${s}`,
        points: tips,
        width: 2,
        opacity: op,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    });
  }

  // ---- 층 가장자리 — 띠 위에 점선으로 ----
  if (edge.length > 1) {
    g.push({
      type: 'trajectory',
      id: 'layer-edge',
      points: edge,
      width: 1.5,
      opacity: op,
      style: { ...accent, lineStyle: 'dashed' },
    });
  }

  // ---- 판 — 빗금으로 「붙박인 벽」 을 보인다 ----
  g.push({
    type: 'region',
    id: 'plate',
    points: rect(0, PLATE_END, -PLATE_THICK, 0),
    fill: 'hatch',
    fillOpacity: 0.85,
    opaque: true,
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
