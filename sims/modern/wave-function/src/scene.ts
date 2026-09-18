// ========================================================================
// wave-function — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 곡선 · 축 · 안내선은 `trajectory`,
// 점 더미(점이 든 칸에만 윗변 외곽선) · 측정 띠는 `region`, 측정 점은 `particleSystem`,
// 방금 찍힌 점과 곡선 위 자리는 `body`, 판 기호 · 이름은 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 세 판이 같은 x 를 쓴다 — 위 ψ, 가운데 |ψ|², 아래 측정 띠. 한 세로줄이 한 자리다.
//
// 색은 뜻마다 하나다. 두 곡선은 먹색(같은 ψ 의 두 얼굴), 측정 점과 그 더미는 primary(같은
// 측정들), 축 · 띠 · 판 이름은 muted. **강조색은 「방금 한 측정」 한 뜻에만** — 새 점,
// 세 판을 잇는 안내선, 그 자리의 곡선 위 점. 부호는 색이 아니라 축 위 · 아래 높이로 보인다.
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
  binCounts,
  density,
  drawCycle,
  peaks,
  psi,
  readConstants,
  readMeasure,
} from './physics';
import {
  PANEL_LABEL_GAP,
  PROB_BASE,
  PROB_HEIGHT,
  PSI_BASE,
  PSI_HALF,
  SCENE_BOUNDS,
  STRIP_MAX,
  STRIP_MIN,
  X_HALF,
  X_SCALE,
  text,
} from './schema';
import type { WaveFunctionState } from './state';

/** 곡선 표본 수. */
const CURVE_SAMPLES = 240;
/** 곡선 · 축 · 안내선 굵기(화면 px). 더미 윗변은 region 외곽선(테마 굵기)이다. */
const CURVE_WIDTH_PX = 2.5;
const AXIS_WIDTH_PX = 1;
const GUIDE_WIDTH_PX = 1.5;
/** 점 더미 채움 · 측정 띠 바탕의 짙기. */
const PILE_FILL_OPACITY = 0.3;
const STRIP_FILL_OPACITY = 0.12;
/** 측정 점 반지름(화면 px). 천 개가 넘어도 빈 틈(마디)이 보이도록 작게. */
const DOT_PX = 1.4;
/** 방금 찍힌 점의 반지름(월드). */
const NEWEST_SIZE = 0.22;
/** 판 기호 · 띠 이름 글자 크기(화면 px). */
const SYMBOL_PX = 16;
const NAME_PX = 12;

export function scene(params: {
  state: WaveFunctionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('wave-function: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const { psiMax, densityMax } = peaks(c);
  const psiScale = psiMax > 0 ? PSI_HALF / psiMax : 0;
  const probScale = densityMax > 0 ? PROB_HEIGHT / densityMax : 0;
  const left = -X_HALF * X_SCALE;
  const right = X_HALF * X_SCALE;
  const wx = (x: number): number => x * X_SCALE;
  const out: Primitive[] = [];

  const axis = (id: string, y: number): Primitive => ({
    type: 'trajectory',
    id,
    points: [
      [left, y],
      [right, y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // `|ψ|²` 를 기울이면 세로 막대가 빗금처럼 누워 절댓값으로 읽히지 않는다 — 곧게 세운다.
  const panelLabel = (id: string, y: number, key: 'label.psi' | 'label.prob'): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: [left - PANEL_LABEL_GAP, y] },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    italic: key === 'label.psi',
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 위 판 — ψ. 부호가 있어 축 아래로도 처진다 ----
  out.push(axis('psi-axis', PSI_BASE));
  const psiPts: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = -X_HALF + (2 * X_HALF * i) / CURVE_SAMPLES;
    psiPts.push([wx(x), PSI_BASE + psiScale * psi(x, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'psi',
    points: psiPts,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(panelLabel('psi-label', PSI_BASE, 'label.psi'));

  // ---- 측정 — 이번 주기의 결과 목록에서 지금까지 찍힌 만큼 ----
  const ms = drawCycle(c, tl.cycle);
  const { count, newest, opacity } = readMeasure(tl, c);

  // ---- 가운데 판 — 점 더미(도수)와 |ψ|² ----
  // 더미 높이 한 점 몫 = |ψ|² 판 배율 / (측정 수 × 칸 폭). 다 찍으면 더미가 곡선에 닿는다.
  out.push(axis('prob-axis', PROB_BASE));
  const binW = (2 * X_HALF) / c.binCount;
  const perDot = c.dotCount > 0 ? probScale / (c.dotCount * binW) : 0;
  const bins = binCounts(ms, count, c);
  if (count > 0 && opacity > 0) {
    // 윗변은 점이 든 칸에만 긋는다 — 빈 칸까지 이으면 축 위에 강조 없는 선이 한 줄 더 생겨
    // 축이 다른 색으로 보인다. 칸 i 의 왼 · 오른 끝은 1 + 2i · 2 + 2i 번이다.
    const top: Vec2[] = [];
    for (let i = 0; i < c.binCount; i++) {
      const x0 = wx(-X_HALF + i * binW);
      const x1 = wx(-X_HALF + (i + 1) * binW);
      const y = PROB_BASE + bins[i]! * perDot;
      top.push([x0, y], [x1, y]);
    }
    const edges: [number, number][] = [];
    const filled = (i: number): boolean => (bins[i] ?? 0) > 0;
    for (let i = 0; i < c.binCount; i++) {
      if (filled(i)) edges.push([1 + 2 * i, 2 + 2 * i]);
      if (filled(i) || filled(i + 1)) edges.push([2 + 2 * i, 3 + 2 * i]);
    }
    if (filled(0)) edges.push([0, 1]);
    out.push({
      type: 'region',
      id: 'pile',
      points: [[left, PROB_BASE], ...top, [right, PROB_BASE]],
      fillOpacity: PILE_FILL_OPACITY,
      outline: edges,
      opacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // |ψ|² — `square` 동안 ψ 의 사본(같은 높이 배율)에서 제곱으로 바뀐다. 처진 봉우리가 뒤집혀
  // 솟고, 마디는 0 에 남는다.
  const sq = tl.at('square');
  const probPts: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = -X_HALF + (2 * X_HALF * i) / CURVE_SAMPLES;
    const signed = psiScale * psi(x, c);
    const squared = probScale * density(x, c);
    probPts.push([wx(x), PROB_BASE + (1 - sq) * signed + sq * squared]);
  }
  out.push({
    type: 'trajectory',
    id: 'prob',
    points: probPts,
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(panelLabel('prob-label', PROB_BASE, 'label.prob'));

  // ---- 아래 — 측정 띠. 세로 자리는 뜻이 없고 가로 자리만 측정값이다 ----
  out.push({
    type: 'region',
    id: 'strip',
    points: [
      [left, STRIP_MIN],
      [right, STRIP_MIN],
      [right, STRIP_MAX],
      [left, STRIP_MAX],
    ],
    fillOpacity: STRIP_FILL_OPACITY,
    opaque: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'strip-label',
    anchor: { world: [left - PANEL_LABEL_GAP, (STRIP_MIN + STRIP_MAX) / 2] },
    text: text('label.measure'),
    chip: false,
    font: 'text',
    fontSize: NAME_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const stripAt = (k: number): Vec2 => [
    wx(ms[k]!.x),
    STRIP_MIN + ms[k]!.lane * (STRIP_MAX - STRIP_MIN),
  ];
  if (count > 0 && opacity > 0) {
    const dots: Vec2[] = [];
    for (let k = 0; k < count; k++) dots.push(stripAt(k));
    out.push({
      type: 'particleSystem',
      id: 'dots',
      positions: dots,
      sizes: DOT_PX,
      opacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 방금 한 측정 — 세 판을 잇는 안내선과 그 자리의 곡선 위 점 ----
  if (newest !== undefined) {
    const m = ms[newest]!;
    const x = wx(m.x);
    out.push({
      type: 'trajectory',
      id: 'guide',
      points: [
        [x, STRIP_MIN],
        [x, PSI_BASE + PSI_HALF],
      ],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'body',
      id: 'guide-psi',
      pos: [x, PSI_BASE + psiScale * psi(m.x, c)],
      shape: 'point',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'guide-prob',
      pos: [x, PROB_BASE + probScale * density(m.x, c)],
      shape: 'point',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: 'newest',
      pos: stripAt(newest),
      shape: 'circle',
      size: NEWEST_SIZE,
      glow: false,
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
