// ========================================================================
// string-vibration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 줄 · 점선 틀 · 프렛 · 파형은
// `trajectory`, 너트 · 줄받침 · 손가락 · 파형 머리는 `body`, 흔들리는 길이는 `dimension`,
// 글자는 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 줄과 그 흔들림(파형)은 같은 먹색, 점선 틀 · 프렛 · 받침 · 치수선 ·
// 누르지 않은 줄의 파형은 배경 정보라 muted. 강조색은 쓰지 않는다 — 짧아짐과 빨라짐은
// 치수선의 길이와 파형창에 담긴 흔들림 수가 가른다 (S-piece).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  displacement,
  envelope,
  frequency,
  openPhase,
  readConstants,
  vibratingLength,
  vibrationPhase,
  type StringVibrationConstants,
} from './physics';
import {
  DIMENSION_Y,
  END_BLOCK,
  FINGER_RADIUS,
  FRET_HALF,
  SCENE_BOUNDS,
  SCOPE_AMPLITUDE,
  SCOPE_BASE_Y,
  STRING_Y,
  text,
} from './schema';
import type { StringVibrationState } from './state';

/** 줄 표본 수 — 흔들리는 부분이 가장 짧아도(절반) 반파장에 표본이 100 개쯤 들어간다. */
const STRING_SAMPLES = 240;
/** 파형창 표본 수 — 가장 빠른 흔들림(두 배)에서 한 번 흔들림에 표본이 75 개쯤 들어간다. */
const SCOPE_SAMPLES = 300;
/** 줄 · 파형 굵기(화면 px). */
const STRING_WIDTH_PX = 2.5;
const TRACE_WIDTH_PX = 2;
/** 점선 틀 · 누르지 않은 줄의 파형 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1.25;
/** 프렛 · 파형창 기준선 굵기(화면 px). */
const FRET_WIDTH_PX = 2;
const AXIS_WIDTH_PX = 1;
/** 글자 크기(화면 px). */
const FINGER_LABEL_PX = 12;
const SCOPE_LABEL_PX = 12;
const FREQ_LABEL_PX = 14;
/** 글자 띄움(화면 px). */
const FINGER_LABEL_GAP_PX = 14;
const FINGER_LABEL_RISE_PX = 14;
const SCOPE_LABEL_RISE_PX = 12;
const SIDE_LABEL_GAP_PX = 10;

/** 흔들리는 길이의 몫을 글자 자리에 넣을 분수 — 선언된 두 수 그대로 (S-piece 유효숫자). */
interface Stop {
  num: number;
  den: number;
}

/** 머무는 단계라면 그 자리의 분수. 누르지 않은 줄은 1/1. 미끄러지는 동안은 없다. */
function holdingStop(tl: TimelineFrame, c: StringVibrationConstants): Stop | undefined {
  switch (tl.phase) {
    case 'open':
    case 'mute':
      return { num: 1, den: 1 };
    case 'stop-1':
      return { num: c.stop1Num, den: c.stop1Den };
    case 'stop-2':
      return { num: c.stop2Num, den: c.stop2Den };
    default:
      return undefined;
  }
}

export function scene(params: {
  state: StringVibrationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('string-vibration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const L = c.stringLength;
  const length = vibratingLength(tl, c);
  const xf = L - length;
  const phase = vibrationPhase(tl, c);
  const env = envelope(tl);
  const stop = holdingStop(tl, c);
  const pressed = tl.phase !== 'open' && tl.phase !== 'mute';
  const out: Primitive[] = [];

  // ---- 프렛 — 손가락이 누를 두 자리 ----
  for (const [id, share] of [
    ['fret-1', c.stop1Num / c.stop1Den],
    ['fret-2', c.stop2Num / c.stop2Den],
  ] as const) {
    const x = L * (1 - share);
    out.push({
      type: 'trajectory',
      id,
      points: [
        [x, STRING_Y - FRET_HALF],
        [x, STRING_Y + FRET_HALF],
      ],
      width: FRET_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 점선 틀 — 흔들리는 부분이 그리는 반파장 하나 ----
  const segment = (sign: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= STRING_SAMPLES; i++) {
      const x = xf + (length * i) / STRING_SAMPLES;
      pts.push([x, STRING_Y + sign * env * c.amplitude * Math.sin((Math.PI * (x - xf)) / length)]);
    }
    return pts;
  };
  for (const [id, sign] of [
    ['envelope-upper', 1],
    ['envelope-lower', -1],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: segment(sign),
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 줄 — 너트에서 줄받침까지. 손가락 왼쪽은 눌려 평평하다 ----
  const stringPts: Vec2[] = [[0, STRING_Y]];
  for (let i = 0; i <= STRING_SAMPLES; i++) {
    const x = xf + (length * i) / STRING_SAMPLES;
    stringPts.push([x, STRING_Y + displacement(x, length, phase, env, c)]);
  }
  out.push({
    type: 'trajectory',
    id: 'string',
    points: stringPts,
    width: STRING_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 너트 · 줄받침 ----
  for (const [id, x] of [
    ['nut', 0],
    ['bridge', L],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [x, STRING_Y],
      shape: 'rect',
      size: [END_BLOCK[0], END_BLOCK[1]],
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 손가락 — 누르는 동안만 ----
  if (pressed) {
    out.push({
      type: 'body',
      id: 'finger',
      pos: [xf, STRING_Y],
      shape: 'circle',
      size: FINGER_RADIUS,
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'finger-label',
      anchor: { world: [xf, STRING_Y + FINGER_RADIUS], offset: [-FINGER_LABEL_GAP_PX, -FINGER_LABEL_RISE_PX] },
      text: text('label.finger'),
      chip: false,
      font: 'text',
      fontSize: FINGER_LABEL_PX,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 흔들리는 길이 — 손가락(또는 너트)에서 줄받침까지 ----
  out.push({
    type: 'dimension',
    id: 'vibrating-length',
    from: [xf, DIMENSION_Y],
    to: [L, DIMENSION_Y],
    ...(stop
      ? stop.num === stop.den
        ? { text: text('label.len.open') }
        : { text: text('label.len.frac'), vars: { a: String(stop.num), b: String(stop.den) } }
      : {}),
  });

  // ---- 파형창 — 가운데 점이 같은 시간 동안 흔들린 모양 ----
  // 오른쪽 끝이 지금, 왼쪽으로 갈수록 이전이다. 창의 길이는 누르지 않은 줄이 `scopeCycles`
  // 번 흔들리는 시간 — 같은 창에 담긴 흔들림 수가 진동수의 비다.
  const f1 = frequency(L, c);
  const f = frequency(length, c);
  const scopeSpan = c.scopeCycles / f1;
  const back = (x: number): number => ((L - x) / L) * scopeSpan;
  const trace = (fq: number, ph: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= SCOPE_SAMPLES; i++) {
      const x = (L * i) / SCOPE_SAMPLES;
      pts.push([x, SCOPE_BASE_Y + env * SCOPE_AMPLITUDE * Math.cos(ph - 2 * Math.PI * fq * back(x))]);
    }
    return pts;
  };
  out.push({
    type: 'trajectory',
    id: 'scope-axis',
    points: [
      [0, SCOPE_BASE_Y],
      [L, SCOPE_BASE_Y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'scope-reference',
    points: trace(f1, openPhase(tl, c)),
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const tracePts = trace(f, phase);
  out.push({
    type: 'trajectory',
    id: 'scope-trace',
    points: tracePts,
    width: TRACE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'scope-head',
    pos: [L, SCOPE_BASE_Y + env * SCOPE_AMPLITUDE * Math.cos(phase)],
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'scope-label',
    anchor: { world: [0, SCOPE_BASE_Y + SCOPE_AMPLITUDE], offset: [0, -SCOPE_LABEL_RISE_PX] },
    text: text('label.scope'),
    chip: false,
    font: 'text',
    fontSize: SCOPE_LABEL_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'reference-label',
    anchor: { world: [0, SCOPE_BASE_Y], offset: [-SIDE_LABEL_GAP_PX, 0] },
    text: text('label.reference'),
    chip: false,
    font: 'text',
    fontSize: SCOPE_LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 진동수 — 머무는 동안만. 분수는 흔들리는 길이의 역수, 선언된 두 수 그대로다.
  if (stop) {
    const freqText: { text: LocalizedText; vars?: Record<string, string> } =
      stop.num === stop.den
        ? { text: text('label.freq.open') }
        : stop.num === 1
          ? { text: text('label.freq.whole'), vars: { n: String(stop.den) } }
          : { text: text('label.freq.frac'), vars: { a: String(stop.den), b: String(stop.num) } };
    out.push({
      type: 'readout',
      id: 'freq-label',
      anchor: { world: [L, SCOPE_BASE_Y], offset: [SIDE_LABEL_GAP_PX, 0] },
      ...freqText,
      chip: false,
      font: 'text',
      fontSize: FREQ_LABEL_PX,
      italic: true,
      align: 'left',
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
