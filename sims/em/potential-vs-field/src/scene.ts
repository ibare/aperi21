// ========================================================================
// potential-vs-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 전위 곡선 · 탐침 세로선 ·
// 접선(trajectory), 장 화살표(vector), 「0」 점 · 곡선 위 탐침 점(body), 전하 띠
// (region), 부호 · 축(lineSet), 축 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전위 곡선은 먹색, 읽어 남긴 장 화살표는 primary, **강조색은
// 「지금 탐침이 읽는 자리」 한 가지 뜻에만**(세로선 · 접선 · 곡선 위 점 · 그 자리의
// 화살표). 축 · 전하 띠 · 「0」 점은 배경 정보라 muted. + 띠와 − 띠는 색이 아니라
// 부호 획으로 가른다 (S-piece — 색으로 설명하지 않는다).
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
  fieldAt,
  potentialAt,
  potentialCurve,
  probeX,
  probing,
  readConstants,
  readOpacity,
  waypoints,
  type PotentialVsFieldConstants,
} from './physics';
import {
  ARROW_Y,
  AXIS_FROM,
  AXIS_TO,
  GLYPH_HALF,
  GLYPH_Y,
  GRAPH_BOTTOM,
  GRAPH_TOP,
  PROBE_BOTTOM,
  PROBE_TOP,
  SAMPLE_FROM,
  SCENE_BOUNDS,
  STRIP_BOTTOM,
  STRIP_TOP,
  V_AXIS_BOTTOM,
  V_AXIS_TOP,
  V_AXIS_X,
  V_LABEL_Y,
  X_LABEL_X,
  text,
} from './schema';
import type { PotentialVsFieldState } from './state';

/** 전위 곡선 굵기(화면 px). 이 그림의 주인공이라 두껍다. */
const CURVE_WIDTH_PX = 2.5;
/** 축선 굵기(화면 px). 재는 선이지 그림이 아니라 가장 가늘게. */
const AXIS_WIDTH_PX = 1;
/** 축선 짙기. 곡선 · 화살표보다 뒤로 물러나 있어야 한다. */
const AXIS_OPACITY = 0.55;
/** 축 기호 글자 크기(화면 px). */
const AXIS_LABEL_PX = 14;
/** 탐침 세로선 굵기(화면 px) — 안내선이라 가늘다. */
const PROBE_LINE_PX = 1.5;
/** 접선 토막 굵기(화면 px). 곡선보다 굵어야 곡선 위에서 떼어 읽힌다. */
const TANGENT_WIDTH_PX = 3;
/** 읽어 남긴 화살표 · 탐침 화살표 굵기(화면 px). 탐침 쪽이 한 단 굵다. */
const ARROW_WIDTH_PX = 2.5;
const PROBE_ARROW_WIDTH_PX = 3;
/** 읽어 남긴 화살표와 탐침 화살표 끝 사이에 두는 틈(월드). 둘이 한 줄에서 겹치지 않게. */
const ARROW_GAP = 0.08;
/** 전하 띠 칠의 짙기. 띠는 자리만 알리면 되므로 옅다. */
const STRIP_FILL = 0.16;
/** 부호 획 굵기(화면 px). */
const GLYPH_WIDTH_PX = 1.5;
/** 「0」 점 짙기 — 화살표가 없다는 표지라 화살표보다 옅다. */
const ZERO_DOT_OPACITY = 0.8;

export function scene(params: {
  state: PotentialVsFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('potential-vs-field: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  // ---- 곡선 판 사상: 가장 낮은 전위 → GRAPH_BOTTOM, 가장 높은 전위 → GRAPH_TOP ----
  // 전위는 차이만 뜻이 있어서 판에 맞춰 넣는다. 세로 배율은 두 판이 나눠 쓰지 않는다 —
  // 견주는 것은 **같은 x 자리**이지 같은 세로 눈금이 아니다.
  const curve = potentialCurve(c.slabs);
  const vSpan = Math.max(curve.vMax - curve.vMin, Number.EPSILON);
  const vScale = (GRAPH_TOP - GRAPH_BOTTOM) / vSpan;
  const toGraphY = (v: number): number => GRAPH_BOTTOM + (v - curve.vMin) * vScale;

  // ---- 전하 띠 ----
  pushStrips(out, c);

  // ---- 축: 전위 축(세로) · 장 줄(가로) ----
  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [V_AXIS_X, V_AXIS_BOTTOM],
        [V_AXIS_X, V_AXIS_TOP],
      ],
      [
        [AXIS_FROM, ARROW_Y],
        [AXIS_TO, ARROW_Y],
      ],
    ],
    width: AXIS_WIDTH_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  pushAxisLabel(out, 'axis-v', [V_AXIS_X, V_LABEL_Y], 'label.v');
  pushAxisLabel(out, 'axis-e', [V_AXIS_X, ARROW_Y], 'label.e');
  pushAxisLabel(out, 'axis-x', [X_LABEL_X, ARROW_Y], 'label.x');

  // ---- 전위 곡선 ----
  out.push({
    type: 'trajectory',
    id: 'potential',
    points: curve.xs.map((x, i): Vec2 => [x, toGraphY(curve.vs[i]!)]),
    width: CURVE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 읽어 남긴 장 화살표 ----
  // 탐침이 지나간 자리에만 남는다 — 화살표는 곡선에서 **읽어 낸** 것이라는 순서가
  // 화면에 남아야 한다. 훑는 동안은 그 화살표의 오른쪽 끝이 탐침 화살표의 왼쪽 끝에
  // 닿기 전까지만 남겨, 한 줄에서 둘이 겹치지 않게 한다.
  const w = waypoints(c.slabs);
  const px = probeX(timeline, w);
  const live = probing(timeline);
  const alpha = readOpacity(timeline);
  const probeHalf = Math.abs(fieldAt(px, c.slabs) * c.arrowScale) / 2;
  const zeroDots: number[] = [];
  let k = 0;
  for (let x = SAMPLE_FROM; x <= AXIS_TO + 1e-9; x = SAMPLE_FROM + ++k * c.arrowSpacing) {
    const len = fieldAt(x, c.slabs) * c.arrowScale;
    const reached = live ? x + Math.abs(len) / 2 + ARROW_GAP <= px - probeHalf : x <= px;
    if (!reached) continue;
    if (Math.abs(len) < c.zeroArrowLen) {
      zeroDots.push(x);
      continue;
    }
    // 0 은 아니지만 머리가 읽히지 않을 만큼 짧은 표본은 뺀다 (NOTES (b), 장부 G02).
    if (Math.abs(len) < c.minArrowLen) continue;
    out.push({
      type: 'vector',
      id: `field-${k}`,
      from: [x - len / 2, ARROW_Y],
      delta: [len, 0],
      width: ARROW_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  zeroDots.forEach((x, i) => {
    out.push({
      type: 'body',
      id: `zero-${i}`,
      pos: [x, ARROW_Y],
      shape: 'point',
      opacity: alpha * ZERO_DOT_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // ---- 탐침: 세로선 · 접선 · 곡선 위 점 · 그 자리의 화살표 ----
  if (live) pushProbe(out, c, px, toGraphY, vScale);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 전하 띠와 부호. 부호 수는 띠 전하량에 비례해 촘촘함이 밀도를 말한다. */
function pushStrips(out: Primitive[], c: PotentialVsFieldConstants): void {
  const plus: Vec2[][] = [];
  const minus: Vec2[][] = [];
  c.slabs.forEach((s, i) => {
    out.push({
      type: 'region',
      id: `slab-${i}`,
      points: [
        [s.from, STRIP_BOTTOM],
        [s.to, STRIP_BOTTOM],
        [s.to, STRIP_TOP],
        [s.from, STRIP_TOP],
      ],
      fillOpacity: STRIP_FILL,
      opaque: true,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    const n = Math.max(1, Math.round(Math.abs(s.rho * (s.to - s.from)) * c.glyphsPerCharge));
    const gap = (s.to - s.from) / n;
    for (let j = 0; j < n; j++) {
      const x = s.from + gap * (j + 0.5);
      const bar: Vec2[] = [
        [x - GLYPH_HALF, GLYPH_Y],
        [x + GLYPH_HALF, GLYPH_Y],
      ];
      if (s.rho >= 0) {
        plus.push(bar, [
          [x, GLYPH_Y - GLYPH_HALF],
          [x, GLYPH_Y + GLYPH_HALF],
        ]);
      } else {
        minus.push(bar);
      }
    }
  });
  out.push({
    type: 'lineSet',
    id: 'glyphs',
    lines: [...plus, ...minus],
    width: GLYPH_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

function pushAxisLabel(
  out: Primitive[],
  id: string,
  at: Vec2,
  label: 'label.v' | 'label.e' | 'label.x',
): void {
  out.push({
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(label),
    chip: false,
    fontSize: AXIS_LABEL_PX,
    align: 'center',
    font: 'text',
    italic: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
}

function pushProbe(
  out: Primitive[],
  c: PotentialVsFieldConstants,
  px: number,
  toGraphY: (v: number) => number,
  vScale: number,
): void {
  const e = fieldAt(px, c.slabs);
  const vy = toGraphY(potentialAt(px, c.slabs));

  out.push({
    type: 'trajectory',
    id: 'probe-line',
    points: [
      [px, PROBE_TOP],
      [px, PROBE_BOTTOM],
    ],
    width: PROBE_LINE_PX,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // 접선. 곡선 판의 기울기는 dV/dx = −E 에 세로 배율을 곱한 것이다. 길이는 늘 같고
  // 기울기만 바뀐다 — 가파름을 토막의 각도로 읽는다.
  const slope = -e * vScale;
  const norm = Math.hypot(1, slope);
  const hx = c.tangentLen / 2 / norm;
  const hy = (c.tangentLen / 2) * (slope / norm);
  out.push({
    type: 'trajectory',
    id: 'tangent',
    points: [
      [px - hx, vy - hy],
      [px + hx, vy + hy],
    ],
    width: TANGENT_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'probe-point',
    pos: [px, vy],
    shape: 'point',
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 그 자리의 화살표 — 곡선이 평평해 너무 짧으면 「0」 점으로 대신한다.
  const len = e * c.arrowScale;
  if (Math.abs(len) < c.zeroArrowLen) {
    out.push({
      type: 'body',
      id: 'probe-zero',
      pos: [px, ARROW_Y],
      shape: 'point',
      outline: 'background',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    return;
  }
  out.push({
    type: 'vector',
    id: 'probe-field',
    from: [px - len / 2, ARROW_Y],
    delta: [len, 0],
    width: PROBE_ARROW_WIDTH_PX,
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
