// ========================================================================
// simple-harmonic-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 천장(surface + region) ·
// 용수철(constraint) · 추와 펜(body) · 시간축 · 이음선 · 곡선(trajectory) ·
// 힘 화살표(vector) · 축 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 추 · 펜 · 곡선은 먹색(추가 곧 곡선을 그린 것이라 같은 대상),
// **강조색은 「되미는 힘」 한 가지 뜻에만** (추 위 화살표와 곡선 위에 남긴 화살표).
// 천장 · 시간축 · 이음선은 배경 정보라 muted.
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
  displacementAt,
  elapsed,
  periodOf,
  readConstants,
  readPen,
  recordOpacity,
  restoringForce,
} from './physics';
import {
  AXIS_END,
  CEILING_DEPTH,
  CEILING_HALF,
  CEILING_Y,
  FORCE_SCALE,
  MASS_SIZE,
  MASS_X,
  PAPER_LENGTH,
  PAPER_START,
  SCENE_BOUNDS,
  SPRING_COILS,
  STAMPS_PER_PERIOD,
  text,
} from './schema';
import type { SimpleHarmonicMotionState } from './state';

/** 곡선 표본 수(쓰기 구간 전체). 세 주기에 이만큼이면 꺾임이 보이지 않는다. */
const CURVE_SAMPLES = 360;
/** 곡선 굵기(화면 px). 이 그림의 주인공이라 기본보다 조금 굵다. */
const CURVE_WIDTH = 2.5;
/** 안내선(시간축 · 이음선) 굵기(화면 px). 재는 선이지 그림이 아니라 가장 가늘게. */
const GUIDE_WIDTH = 1;
/** 시간축 짙기. 곡선 · 화살표보다 뒤로 물러나 있어야 한다. */
const AXIS_OPACITY = 0.7;
/** 곡선 위에 남긴 화살표의 굵기(화면 px) · 짙기. 살아 있는 추 위 화살표보다 한 단 가볍다. */
const STAMP_WIDTH = 2;
const STAMP_OPACITY = 0.6;
/** 이 변위(m) 아래로는 힘 화살표를 남기지 않는다 — 축을 지나는 순간 힘이 0 이다. */
const ZERO_EPS = 1e-6;
/** 펜 점 반지름(m). */
const PEN_SIZE = 0.07;
/** 시간축 기호를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_LABEL_OFFSET: Vec2 = [12, 0];
/** 추 위 힘 화살표를 추 왼쪽 모서리에서 띄우는 거리(m). */
const FORCE_GAP = 0.14;
/** 천장 빗금 띠의 짙기. */
const CEILING_FILL = 0.35;

export function scene(params: {
  state: SimpleHarmonicMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('simple-harmonic-motion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const pen = readPen(timeline);
  const recordAlpha = recordOpacity(timeline);
  const period = periodOf(c);
  const out: Primitive[] = [];

  // 쓰기 구간의 시각 s(주기 안) → 기록지 x. 가로 거리가 곧 시간이다.
  const span = pen.to - pen.from;
  const xOf = (s: number): number => PAPER_START + (PAPER_LENGTH * (s - pen.from)) / span;
  const yOf = (s: number): number => displacementAt(s - pen.from, c);

  // ---- 천장 ----
  out.push({
    type: 'region',
    id: 'ceiling-hatch',
    points: [
      [MASS_X - CEILING_HALF, CEILING_Y],
      [MASS_X + CEILING_HALF, CEILING_Y],
      [MASS_X + CEILING_HALF, CEILING_Y + CEILING_DEPTH],
      [MASS_X - CEILING_HALF, CEILING_Y + CEILING_DEPTH],
    ],
    fill: 'hatch',
    fillOpacity: CEILING_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'surface',
    id: 'ceiling',
    geometry: { kind: 'wall', from: [MASS_X - CEILING_HALF, CEILING_Y], to: [MASS_X + CEILING_HALF, CEILING_Y] },
    material: 'solid',
  });

  // ---- 시간축 = 평형선 ----
  // 추가 오르내리는 한가운데와 곡선의 축이 **같은 선**이다. 둘을 따로 그으면 「추의 평형점」
  // 과 「곡선의 0」 이 같은 것이라는 연결이 끊긴다.
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [MASS_X - MASS_SIZE[0], 0],
      [AXIS_END, 0],
    ],
    width: GUIDE_WIDTH,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'axis-label',
    anchor: { world: [AXIS_END, 0], offset: AXIS_LABEL_OFFSET },
    text: text('label.time'),
    chip: false,
    font: 'text',
    italic: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 곡선 위에 남긴 화살표 ----
  // 1/8 주기마다 그 순간 추에 걸렸던 힘을 곡선 위 그 자리에 옮겨 적는다. 곡선보다 먼저
  // 선언해 곡선 아래로 깔린다 (`drawOrder: 'scene'`). 축을 지나는 순간은 힘이 0 이라
  // 아무것도 남지 않는다 — 그 빈자리도 주장의 일부다.
  const nowS = pen.from + pen.progress * span;
  const stampDt = period / STAMPS_PER_PERIOD;
  for (let i = 0; pen.from + i * stampDt <= nowS + 1e-9; i++) {
    const s = pen.from + i * stampDt;
    const y = yOf(s);
    if (Math.abs(y) < ZERO_EPS * c.amplitude) continue;
    out.push({
      type: 'vector',
      id: `stamp-${i}`,
      from: [xOf(s), y],
      delta: [0, restoringForce(y, c) * FORCE_SCALE],
      width: STAMP_WIDTH,
      opacity: STAMP_OPACITY * recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 적힌 곡선 ----
  const curve: Vec2[] = [];
  const n = Math.ceil(CURVE_SAMPLES * pen.progress);
  for (let k = 0; k <= n; k++) {
    const s = Math.min(pen.from + (k * span) / CURVE_SAMPLES, nowS);
    curve.push([xOf(s), yOf(s)]);
  }
  if (curve.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'record',
      points: curve,
      width: CURVE_WIDTH,
      opacity: recordAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 추 ----
  // 추는 바퀴 내내 돈다 — 한 바퀴가 주기의 정수배라 바퀴가 넘어가도 끊기지 않는다.
  const y = displacementAt(elapsed(timeline), c);
  const half = MASS_SIZE[1] / 2;

  // 추와 펜을 잇는 이음선. 펜이 적는 높이가 추의 높이라는 것을 가로로 보여 준다.
  if (pen.writing) {
    out.push({
      type: 'trajectory',
      id: 'link',
      points: [
        [MASS_X + MASS_SIZE[0] / 2, y],
        [xOf(nowS), y],
      ],
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
  }

  out.push({
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: [MASS_X, CEILING_Y],
    to: [MASS_X, y + half],
    coils: SPRING_COILS,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'mass',
    pos: [MASS_X, y],
    shape: 'rect',
    size: MASS_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 되미는 힘. 늘 평형점을 향하고 길이가 변위에 비례한다 — 멀수록 길고, 한가운데를 지날 때
  // 사라진다. 추 몸 위에 그으면 짧은 화살표가 먹색 추에 묻혀, 추 **왼쪽 옆** 에 추의 높이에서
  // 출발시킨다. 기호는 늘 바깥(왼쪽)에 둔다 — 오른쪽이면 추 몸에 얹힌다. 화살표가 뒤집히면
  // `cw` · `ccw` 도 뒤집히므로 방향에 따라 고른다(아래로 향하면 cw 가 왼쪽).
  if (Math.abs(y) >= ZERO_EPS * c.amplitude) {
    const force = restoringForce(y, c);
    out.push({
      type: 'vector',
      id: 'force',
      from: [MASS_X - MASS_SIZE[0] / 2 - FORCE_GAP, y],
      delta: [0, force * FORCE_SCALE],
      label: text('label.force'),
      labelSide: force < 0 ? 'cw' : 'ccw',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 펜. 곡선 끝 위에 올라온다.
  if (pen.writing) {
    out.push({
      type: 'body',
      id: 'pen',
      pos: [xOf(nowS), yOf(nowS)],
      shape: 'circle',
      size: PEN_SIZE,
      glow: false,
      outline: 'background',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
