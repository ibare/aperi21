// ========================================================================
// wave-basics — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 줄 · 평형선 · 자취(trajectory),
// P · 마루 표지(body), 치수선(dimension), 흔들림 폭 · 눈금(lineSet), 시간 축(vector),
// 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 줄은 먹색, **P 와 P 의 높이 자취는 primary**(같은 점의 두 모습),
// **강조색은 「마루가 간 거리」 한 뜻에만**(따라가는 마루 표지와 λ 위를 채우는 막대).
// 평형선 · 치수선 · 축 · 기호는 배경 정보라 muted.
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

import { displacement, markOpacity, readConstants, trackedCrestX, waveTime } from './physics';
import {
  AMPLITUDE_DIM_X,
  LAMBDA_GAP,
  POINT_X,
  ROPE_END,
  ROPE_START,
  SCENE_BOUNDS,
  TRACE_AXIS_OVERRUN,
  TRACE_WIDTH,
  TRACE_X,
  text,
} from './schema';
import type { WaveBasicsState } from './state';

// ---- 표본 수 — 상태로 계산하지 않는다 ----
/** 줄의 표본 수. 가장 짧은 파장(1.5 m)에서도 한 파장에 약 60 점. */
const ROPE_SAMPLES = 320;
/** 자취가 한 주기를 그리는 표본 수. */
const TRACE_SAMPLES = 120;

// ---- 선 굵기(화면 px) ----
const ROPE_WIDTH_PX = 2.5;
const TRACE_WIDTH_PX = 2;
/** 마루가 간 거리 막대. 치수선(점선) 위를 덮어 채워야 해서 굵다. */
const BAR_WIDTH_PX = 4;
const GUIDE_WIDTH_PX = 1;

// ---- 짙기 ----
/** 평형선 · 흔들림 폭 · 눈금. 줄보다 뒤로 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.55;
/** P 와 자취 머리를 잇는 점선. 같은 높이라는 것만 알리는 안내선이라 가장 옅다. */
const LINK_OPACITY = 0.45;

// ---- 크기(월드 m) ----
const POINT_RADIUS = 0.14;
const CREST_RADIUS = 0.11;
const TRACE_HEAD_RADIUS = 0.08;
/** 흔들림 폭 · 자취 눈금 끝의 가로 눈금 반 길이. */
const TICK_HALF = 0.1;

// ---- 글자 ----
const SYMBOL_PX = 15;
/** 기호를 대상에서 띄우는 거리(월드 m). */
const LAMBDA_LABEL_GAP = 0.2;
const AMPLITUDE_LABEL_GAP = 0.22;
const POINT_LABEL_GAP = 0.28;
const TRACE_LABEL_GAP = 0.25;

export function scene(params: {
  state: WaveBasicsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('wave-basics: schema.timeline 이 선언되어야 한다');
  const { period } = readConstants(stage);
  const tau = waveTime(timeline, period);
  const alpha = markOpacity(timeline);
  const A = state.amplitude;
  const lambda = state.wavelength;
  const out: Primitive[] = [];

  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

  // ---- 평형선 ----
  // 줄이 쉬고 있을 자리. 진폭은 여기서 잰 높이다.
  out.push({
    type: 'trajectory',
    id: 'equilibrium',
    points: [
      [ROPE_START, 0],
      [ROPE_END, 0],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- A 치수선 ----
  // 줄 왼쪽 끝 바깥에 평형선에서 마루 높이까지. 진폭 조작기를 끌면 함께 늘고 준다.
  out.push({
    type: 'dimension',
    id: 'amplitude-dim',
    from: [AMPLITUDE_DIM_X, 0],
    to: [AMPLITUDE_DIM_X, A],
    style: muted,
  });
  out.push(symbol('amplitude-label', [AMPLITUDE_DIM_X - AMPLITUDE_LABEL_GAP, A / 2], 'label.amplitude'));

  // ---- λ 치수선 ----
  // τ = 0 의 이웃한 두 마루(P 에서 한 파장 뒤 · P) 사이. 마루가 한 주기 동안 갈 길이기도 하다.
  const barY = A + LAMBDA_GAP;
  const crestStart = POINT_X - lambda;
  out.push({
    type: 'dimension',
    id: 'lambda-dim',
    from: [crestStart, barY],
    to: [POINT_X, barY],
    style: muted,
  });
  out.push(symbol('lambda-label', [(crestStart + POINT_X) / 2, barY + LAMBDA_LABEL_GAP], 'label.lambda'));

  // ---- 마루가 간 거리 막대 ----
  // 따라가는 마루의 바로 위에서 자라 λ 치수선을 덮어 간다 — 한 주기가 끝나는 순간 꼭 λ 가 찬다.
  const crestX = trackedCrestX(tau, state, period);
  if (crestX > crestStart) {
    out.push({
      type: 'trajectory',
      id: 'crest-travel',
      points: [
        [crestStart, barY],
        [crestX, barY],
      ],
      width: BAR_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- P 의 흔들림 폭 ----
  // P 가 오르내리는 범위 −A ~ +A. 옆으로는 움직이지 않는다는 것이 이 세로선 하나로 보인다.
  out.push({
    type: 'lineSet',
    id: 'point-range',
    lines: [
      [
        [POINT_X, -A],
        [POINT_X, A],
      ],
      [
        [POINT_X - TICK_HALF, A],
        [POINT_X + TICK_HALF, A],
      ],
      [
        [POINT_X - TICK_HALF, -A],
        [POINT_X + TICK_HALF, -A],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: muted,
  });
  out.push(symbol('point-label', [POINT_X, -A - POINT_LABEL_GAP], 'label.point'));

  // ---- 줄 ----
  const rope: Vec2[] = [];
  for (let i = 0; i <= ROPE_SAMPLES; i++) {
    const x = ROPE_START + ((ROPE_END - ROPE_START) * i) / ROPE_SAMPLES;
    rope.push([x, displacement(x, tau, state, period)]);
  }
  out.push({
    type: 'trajectory',
    id: 'rope',
    points: rope,
    width: ROPE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 따라가는 마루 ----
  // 줄의 꼭대기에 얹혀 오른쪽으로 간다. 이 점이 가는 거리가 곧 위의 막대다.
  out.push({
    type: 'body',
    id: 'tracked-crest',
    pos: [crestX, displacement(crestX, tau, state, period)],
    shape: 'circle',
    size: CREST_RADIUS,
    outline: 'background',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- P ----
  const pointY = displacement(POINT_X, tau, state, period);
  out.push({
    type: 'body',
    id: 'point',
    pos: [POINT_X, pointY],
    shape: 'circle',
    size: POINT_RADIUS,
    outline: 'background',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- P 의 높이 자취 ----
  // 가로 = 시간(한 주기가 TRACE_WIDTH), 세로 = 줄과 같은 축척의 높이. 한 주기가 끝나면
  // 자취는 꼭 한 번 오르내린 모양으로 T 눈금에 닿는다.
  const traceEnd = TRACE_X + TRACE_WIDTH;
  out.push({
    type: 'vector',
    id: 'time-axis',
    from: [TRACE_X, 0],
    delta: [TRACE_WIDTH + TRACE_AXIS_OVERRUN, 0],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: muted,
  });
  out.push(
    symbol('time-label', [traceEnd + TRACE_AXIS_OVERRUN, -TRACE_LABEL_GAP], 'label.time'),
  );
  out.push({
    type: 'lineSet',
    id: 'period-tick',
    lines: [
      [
        [traceEnd, -A],
        [traceEnd, A],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: GUIDE_OPACITY,
    style: { ...muted },
  });
  out.push(symbol('period-label', [traceEnd, -A - TRACE_LABEL_GAP], 'label.period'));

  const frac = tau / period;
  const n = Math.max(1, Math.round(TRACE_SAMPLES * frac));
  const trace: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const s = (tau * i) / n;
    trace.push([TRACE_X + (TRACE_WIDTH * s) / period, displacement(POINT_X, s, state, period)]);
  }
  const headX = TRACE_X + TRACE_WIDTH * frac;
  if (frac > 0) {
    out.push({
      type: 'trajectory',
      id: 'point-trace',
      points: trace,
      width: TRACE_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }
  // P 와 자취 머리를 잇는다 — 같은 높이라는 것만 알린다.
  out.push({
    type: 'trajectory',
    id: 'point-link',
    points: [
      [POINT_X, pointY],
      [headX, pointY],
    ],
    width: GUIDE_WIDTH_PX,
    opacity: LINK_OPACITY * alpha,
    style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dotted' },
  });
  out.push({
    type: 'body',
    id: 'trace-head',
    pos: [headX, pointY],
    shape: 'circle',
    size: TRACE_HEAD_RADIUS,
    outline: 'none',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 그림에 새긴 기호 하나 — 기울인 수식 글자, 칩 없음. */
function symbol(
  id: string,
  at: Vec2,
  key: 'label.lambda' | 'label.amplitude' | 'label.period' | 'label.time' | 'label.point',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(key),
    chip: false,
    fontSize: SYMBOL_PX,
    font: 'text',
    italic: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
