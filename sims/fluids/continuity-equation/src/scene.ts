// ========================================================================
// continuity-equation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 관 속 물(region) · 칠한 물 둘(region, accent) · 흐름 점(particleSystem) · 관 벽
// (trajectory) · 두 문(trajectory 점선) · 칸 나눔선(lineSet) · 길이 치수(dimension) ·
// 문 단면 기호(readout). 겹침은 선언 순서 그대로다 (`drawOrder: 'scene'`).
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

import {
  dotCloud,
  paintAt,
  paintOpacity,
  pipeHeight,
  readConstants,
  revealOpacity,
  volumeTable,
  type ContinuityConstants,
  type PaintReading,
} from './physics';
import {
  DIM_LIFT,
  DOT_STYLE,
  DOT_TRAIL_SECONDS,
  GATE_LABEL_FONT_PX,
  GATE_LABEL_DROP,
  GATE_NARROW_X,
  GATE_OVERHANG,
  GATE_WIDE_X,
  LINE_PX,
  PAINT_FILL,
  PIPE,
  SCENE_BOUNDS,
  text,
  type ContinuityEquationMessageKey,
} from './schema';
import type { ContinuityEquationState } from './state';

/** 벽 · 칠한 물의 경계를 표본하는 x 간격(m). 가늘어지는 구간이 매끈하게 보일 만큼. */
const SAMPLE_DX = 0.05;

/** [a, b] 를 표본 간격으로 나눈 x 목록. 양 끝을 반드시 넣는다. */
function samples(a: number, b: number): number[] {
  const n = Math.max(1, Math.ceil((b - a) / SAMPLE_DX));
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  return out;
}

/** 관 속 [a, b] 구간을 벽 모양대로 감싼 다각형 — 윗벽을 따라 가고 아랫벽을 따라 돌아온다. */
function pipeSlice(a: number, b: number, c: ContinuityConstants): Vec2[] {
  const xs = samples(a, b);
  const top = xs.map((x): Vec2 => [x, pipeHeight(x, c) / 2]);
  const bottom = xs.map((x): Vec2 => [x, -pipeHeight(x, c) / 2]).reverse();
  return [...top, ...bottom];
}

/** 문 하나 — 관을 가로지르는 점선과 그 아래 단면 기호. */
function gate(
  id: string,
  x: number,
  c: ContinuityConstants,
  label: ContinuityEquationMessageKey,
): Primitive[] {
  const half = pipeHeight(x, c) / 2;
  return [
    {
      type: 'trajectory',
      id: `gate-${id}`,
      points: [
        [x, -half - GATE_OVERHANG],
        [x, half + GATE_OVERHANG],
      ],
      width: LINE_PX.gate,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    },
    {
      type: 'readout',
      id: `gate-label-${id}`,
      anchor: { world: [x, -half - GATE_LABEL_DROP] },
      text: text(label),
      chip: false,
      align: 'center',
      font: 'mono',
      italic: true,
      fontSize: GATE_LABEL_FONT_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

/** 칠한 물 — 문을 같은 시간 동안 지난 물. 강조색은 이 뜻 하나에만 쓴다. */
function paint(id: string, p: PaintReading, c: ContinuityConstants, opacity: number): Primitive | null {
  if (!p.started || p.xFront - p.xBack < 1e-4) return null;
  return {
    type: 'region',
    id: `paint-${id}`,
    points: pipeSlice(p.xBack, p.xFront, c),
    fillOpacity: PAINT_FILL,
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

/** 칠한 물 위에 뜨는 길이 치수. 칠의 윗면에서 조금 띄운다. */
function lengthDim(
  id: string,
  p: PaintReading,
  c: ContinuityConstants,
  label: ContinuityEquationMessageKey,
  opacity: number,
): Primitive {
  const y = pipeHeight(p.xBack, c) / 2 + DIM_LIFT;
  return {
    type: 'dimension',
    id: `dim-${id}`,
    from: [p.xBack, y],
    to: [p.xFront, y],
    text: text(label),
    opacity,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: ContinuityEquationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('continuity-equation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const table = volumeTable(c);
  const out: Primitive[] = [];

  // ---- 관 속 물 ----
  out.push({
    type: 'region',
    id: 'water',
    points: pipeSlice(PIPE.xIn, PIPE.xOut, c),
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // ---- 칠한 물 ----
  // 두 문을 같은 시간 동안 지난 물. 굵은 문 칠은 짧고 굵게, 가는 문 칠은 두 배 빨리 뻗는다.
  const wide = paintAt(GATE_WIDE_X, tl, c, table);
  const narrow = paintAt(GATE_NARROW_X, tl, c, table);
  const pOpacity = paintOpacity(tl);
  for (const prim of [paint('wide', wide, c, pOpacity), paint('narrow', narrow, c, pOpacity)]) {
    if (prim) out.push(prim);
  }

  // ---- 흐름 점 ----
  // 부피로 같은 간격에 놓인 점. 가는 곳에서 기둥 간격이 벌어지고 꼬리가 길어진다 — 빨라진다.
  const dots = dotCloud(tl.t, c, table);
  out.push({
    type: 'particleSystem',
    id: 'dots',
    positions: dots.positions,
    velocities: dots.velocities,
    sizes: DOT_STYLE.size,
    trail: true,
    trailStyle: { seconds: DOT_TRAIL_SECONDS, width: DOT_STYLE.trailWidth, opacity: DOT_STYLE.trailOpacity },
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // ---- 관 벽 ----
  for (const sgn of [1, -1] as const) {
    out.push({
      type: 'trajectory',
      id: sgn > 0 ? 'wall-top' : 'wall-bottom',
      points: samples(PIPE.xIn, PIPE.xOut).map((x): Vec2 => [x, (sgn * pipeHeight(x, c)) / 2]),
      width: LINE_PX.wall,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 두 문 ----
  out.push(...gate('wide', GATE_WIDE_X, c, 'label.gateWide'));
  out.push(...gate('narrow', GATE_NARROW_X, c, 'label.gateNarrow'));

  // ---- 칸 나눔선 · 길이 치수 ----
  // 칠을 멈춘 뒤에 떠오른다. 굵은 칠은 가로로, 가는 칠은 세로로 반 나눈다 — 둘 다 같은
  // 크기의 칸 두 개다. 쌓였느냐 나란하냐만 다르다.
  const rOpacity = revealOpacity(tl);
  if (rOpacity > 0 && wide.started && narrow.started) {
    const nHalf = pipeHeight(narrow.xMid, c) / 2;
    out.push({
      type: 'lineSet',
      id: 'dividers',
      lines: [
        [
          [wide.xBack, 0],
          [wide.xFront, 0],
        ],
        [
          [narrow.xMid, -nHalf],
          [narrow.xMid, nHalf],
        ],
      ],
      width: LINE_PX.divider,
      opacity: rOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push(lengthDim('wide', wide, c, 'label.length', rOpacity));
    out.push(lengthDim('narrow', narrow, c, 'label.length2', rOpacity));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
