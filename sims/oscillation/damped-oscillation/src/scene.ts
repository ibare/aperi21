// ========================================================================
// damped-oscillation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 천장(surface + region) ·
// 액체 통(trajectory + region) · 용수철(constraint) · 추와 펜(body) · 시간축 · 이음선 ·
// 곡선 · 포락선(trajectory) · 마루 막대(lineSet) · 마루 비(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 추 · 펜 · 곡선은 먹색(추가 곧 곡선을 그린 것이라 같은 대상),
// **강조색은 「마루의 높이」 한 가지 뜻에만** (마루 막대 · 마루 비 · 마루를 잇는 포락선).
// 액체는 secondary(물과 같은 역할), 천장 · 통 · 시간축 · 이음선 · 용수철은 배경 정보라 muted.
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
  crestRatio,
  displacementAt,
  envelopeAt,
  envelopeProgress,
  massDisplacement,
  periodOf,
  readConstants,
  readPen,
  recordOpacity,
} from './physics';
import {
  AXIS_END,
  CEILING_DEPTH,
  CEILING_HALF,
  CEILING_Y,
  LIQUID_LEVEL,
  MASS_SIZE,
  MASS_X,
  PAPER_LENGTH,
  PAPER_START,
  RATIO_DIGITS,
  SCENE_BOUNDS,
  SPRING_COILS,
  TANK_BOTTOM,
  TANK_HALF,
  TANK_TOP,
  text,
} from './schema';
import type { DampedOscillationState } from './state';

/** 곡선 표본 수(쓰기 구간 전체). 다섯 주기에 이만큼이면 꺾임이 보이지 않는다. */
const CURVE_SAMPLES = 600;
/** 포락선 표본 수. 매끄러운 지수 곡선이라 적어도 된다. */
const ENVELOPE_SAMPLES = 160;
/** 곡선 굵기(화면 px). 이 그림의 주인공이라 기본보다 조금 굵다. */
const CURVE_WIDTH = 2.5;
/** 마루 막대 굵기(화면 px). 곡선보다 가볍게. */
const BAR_WIDTH = 2;
/** 포락선 굵기(화면 px). 막대 끝을 잇는 선이라 막대와 같은 무게. */
const ENVELOPE_WIDTH = 1.5;
/** 안내선(시간축 · 이음선 · 통) 굵기(화면 px). 재는 선이지 그림이 아니라 가장 가늘게. */
const GUIDE_WIDTH = 1;
const TANK_WIDTH = 1.5;
/** 시간축 짙기. 곡선 · 막대보다 뒤로 물러나 있어야 한다. */
const AXIS_OPACITY = 0.7;
/** 액체 채움 짙기. 잠긴 추가 비쳐 보여야 한다. */
const LIQUID_FILL = 0.28;
/** 천장 빗금 띠의 짙기. */
const CEILING_FILL = 0.35;
/** 펜 점 반지름(m). */
const PEN_SIZE = 0.07;
/** 시간축 기호를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_LABEL_OFFSET: Vec2 = [12, 0];
/** 마루 비 칩을 포락선 위로 띄우는 거리(화면 px). */
const RATIO_OFFSET: Vec2 = [0, -20];
/** 마루 판정 허용(주기 비). 부동소수 때문에 마지막 마루가 빠지지 않게. */
const CREST_EPS = 1e-6;

export function scene(params: {
  state: DampedOscillationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('damped-oscillation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const pen = readPen(timeline);
  const recordAlpha = recordOpacity(timeline);
  const period = periodOf(c);
  const ratio = crestRatio(c).toFixed(RATIO_DIGITS);
  const out: Primitive[] = [];

  // 쓰기 구간의 시각 s(주기 안) → 기록지 x. 가로 거리가 곧 시간이다.
  const span = pen.to - pen.from;
  const xOf = (s: number): number => PAPER_START + (PAPER_LENGTH * (s - pen.from)) / span;
  const yOf = (s: number): number => displacementAt(s - pen.from, c);
  const nowS = pen.from + pen.progress * span;

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
  // 추가 오르내리는 한가운데와 곡선의 축이 같은 선이다 (simple-harmonic-motion 과 같은 약속).
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

  // ---- 마루 막대 ----
  // 마루는 정확히 한 주기마다(τ = nT) 오고 그 높이가 포락선 A·e^(−γτ) 다. 펜이 마루를 지나면
  // 축에서 마루까지 막대를 남긴다. 곡선보다 먼저 선언해 곡선 아래로 깔린다.
  const crests: { s: number; h: number }[] = [];
  for (let n = 0; pen.from + n * period <= Math.min(nowS, pen.to) + CREST_EPS * period; n++) {
    const s = pen.from + n * period;
    crests.push({ s, h: envelopeAt(s - pen.from, c) });
  }
  if (crests.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'crest-bars',
      lines: crests.map(({ s, h }): readonly Vec2[] => [
        [xOf(s), 0],
        [xOf(s), h],
      ]),
      width: BAR_WIDTH,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 포락선 ----
  // 다 적은 뒤 마루 끝을 왼쪽부터 매끄럽게 잇는다. 막대 끝이 모두 이 한 곡선 위에 있다.
  const env = envelopeProgress(timeline);
  if (env > 0) {
    const pts: Vec2[] = [];
    const m = Math.max(1, Math.ceil(ENVELOPE_SAMPLES * env));
    for (let k = 0; k <= m; k++) {
      const s = pen.from + (span * env * k) / m;
      pts.push([xOf(s), envelopeAt(s - pen.from, c)]);
    }
    out.push({
      type: 'trajectory',
      id: 'envelope',
      points: pts,
      width: ENVELOPE_WIDTH,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
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

  // ---- 마루 비 ----
  // 이웃한 두 마루 사이, 포락선 위에 「뒤 ÷ 앞」 을 적는다. 뒤 마루가 적히는 순간 나타난다.
  // 몇 번째 쌍이든 같은 값이다 — 같은 글자가 줄지어 서는 것이 주장이다.
  for (let i = 1; i < crests.length; i++) {
    const mid = (crests[i - 1]!.s + crests[i]!.s) / 2;
    out.push({
      type: 'readout',
      id: `ratio-${i}`,
      anchor: { world: [xOf(mid), envelopeAt(mid - pen.from, c)], offset: RATIO_OFFSET },
      text: text('label.ratio'),
      vars: { r: ratio },
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 추 ----
  const y = massDisplacement(timeline, c);
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
    // 액체가 secondary 라 용수철은 muted 로 물러난다 — 둘이 같은 색이면 잠긴 아랫부분이 섞인다.
    style: { colorRole: 'muted', emphasis: 'strong' },
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

  // ---- 액체 통 ----
  // 액체는 추 **위** 에 반투명으로 덮인다 — 잠긴 것이 비쳐 보여야 「잠겼다」 로 읽힌다.
  out.push({
    type: 'region',
    id: 'liquid',
    points: [
      [MASS_X - TANK_HALF, TANK_BOTTOM],
      [MASS_X + TANK_HALF, TANK_BOTTOM],
      [MASS_X + TANK_HALF, LIQUID_LEVEL],
      [MASS_X - TANK_HALF, LIQUID_LEVEL],
    ],
    fillOpacity: LIQUID_FILL,
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'tank',
    points: [
      [MASS_X - TANK_HALF, TANK_TOP],
      [MASS_X - TANK_HALF, TANK_BOTTOM],
      [MASS_X + TANK_HALF, TANK_BOTTOM],
      [MASS_X + TANK_HALF, TANK_TOP],
    ],
    width: TANK_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

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
