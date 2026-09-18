// ========================================================================
// beats-in-oscillation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 천장(surface) ·
// 용수철(constraint spring) · 추(body) · 막대와 기록(trajectory) · 줄 이름표
// (readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 추 넷은 먹색(같은 대상이라 같은 색), 두 추를 잇는 막대와
// 용수철 · 포락선은 muted, **강조색(primary)은 「두 진동의 합」 한 가지 뜻에만**
// (막대 가운데 점과 그것이 남긴 기록).
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
import { readConstants, readPair, type BeatsInOscillationConstants } from './physics';
import {
  CEILING_OVERHANG,
  CEILING_Y,
  MASS_SIZE,
  MASS_X,
  PEN_RADIUS,
  ROW_BOTTOM_Y,
  ROW_LABEL_Y,
  ROW_TOP_Y,
  SAMPLES_PER_SECOND,
  SCENE_BOUNDS,
  SPRING_COILS,
  TRACE_SPAN,
  text,
  type BeatsInOscillationMessageKey,
} from './schema';
import type { BeatsInOscillationState } from './state';

/** 기록 선 굵기(화면 px). 이 그림의 주인공이라 포락선보다 굵다. */
const TRACE_WIDTH = 1.6;
/** 포락선 굵기(화면 px). 읽는 것을 돕기만 하는 안내선이다. */
const ENVELOPE_WIDTH = 1;
/** 막대 굵기(화면 px). 추를 잇는 가벼운 막대라 추보다 가늘다. */
const BAR_WIDTH = 2.5;
/** 기록지 기준선 굵기(화면 px). 0 이 어디인지만 알린다. */
const BASELINE_WIDTH = 1;
/** 줄 이름표 글자 크기(화면 px). */
const ROW_LABEL_PX = 12;

/** 한 줄의 선언 — 평형 높이 · 진동수 차이 · 이름표. */
interface Row {
  id: string;
  y: number;
  df: number;
  label: BeatsInOscillationMessageKey;
}

export function scene(params: {
  state: BeatsInOscillationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('beats-in-oscillation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const t = timeline.t;
  const out: Primitive[] = [];

  const rows: Row[] = [
    { id: 'top', y: ROW_TOP_Y, df: c.dfTop, label: 'label.rowTop' },
    { id: 'bottom', y: ROW_BOTTOM_Y, df: c.dfBottom, label: 'label.rowBottom' },
  ];

  for (const row of rows) {
    out.push(...recording(row, t, c));
    out.push(...rig(row, t, c));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). 여기에 id `caption` 을
  // 두지 않는다 — 엔진 예약이다 (S-piece).

  return out;
}

/**
 * 기록지 — 가운데 점이 지나온 자리. 오른쪽 끝(x=0)이 지금이고 왼쪽으로 흘러
 * `TRACE_SPAN` 에서 사라진다. 지나간 자리도 같은 닫힌 식으로 계산하므로 상태를
 * 쌓지 않는다 — 같은 시각은 언제나 같은 기록이다.
 *
 * 포락선(흔들림의 폭)을 점선으로 위아래에 둔다. 진폭이 부풀었다 잦아드는 것을
 * 봉우리를 하나하나 눈으로 이어 보지 않아도 읽게 하는 안내선이다.
 */
function recording(row: Row, t: number, c: BeatsInOscillationConstants): Primitive[] {
  const speed = TRACE_SPAN / c.window;
  const n = Math.ceil(c.window * SAMPLES_PER_SECOND);
  const ink: Vec2[] = [];
  const upper: Vec2[] = [];
  const lower: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    // i = 0 이 가장 오래된 자리, i = n 이 지금.
    const age = c.window * (1 - i / n);
    const s = t - age;
    const x = -age * speed;
    const r = readPair(s, row.df, c);
    ink.push([x, row.y + r.mid]);
    upper.push([x, row.y + r.envelope]);
    lower.push([x, row.y - r.envelope]);
  }

  return [
    {
      type: 'trajectory',
      id: `baseline-${row.id}`,
      points: [
        [-TRACE_SPAN, row.y],
        [0, row.y],
      ],
      width: BASELINE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    },
    {
      type: 'trajectory',
      id: `envelope-upper-${row.id}`,
      points: upper,
      width: ENVELOPE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
    {
      type: 'trajectory',
      id: `envelope-lower-${row.id}`,
      points: lower,
      width: ENVELOPE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
    {
      type: 'trajectory',
      id: `ink-${row.id}`,
      points: ink,
      width: TRACE_WIDTH,
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: `row-label-${row.id}`,
      anchor: { world: [-TRACE_SPAN / 2, row.y + ROW_LABEL_Y] },
      text: text(row.label),
      chip: false,
      font: 'text',
      fontSize: ROW_LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

/**
 * 장치 — 천장에 매단 용수철 추 둘과 그 둘을 잇는 막대, 막대 가운데 점.
 *
 * 두 추는 같은 크기 · 같은 색이다. 다른 것은 진동수뿐이고, 그것은 흔들림으로만
 * 보인다 — 색이나 크기로 가르면 「다른 종류의 추」 로 읽힌다 (S-piece).
 */
function rig(row: Row, t: number, c: BeatsInOscillationConstants): Primitive[] {
  const r = readPair(t, row.df, c);
  const ceiling = row.y + CEILING_Y;
  const [w, h] = MASS_SIZE;
  const left: Vec2 = [-MASS_X, row.y + r.left];
  const right: Vec2 = [MASS_X, row.y + r.right];
  const out: Primitive[] = [
    {
      type: 'surface',
      id: `ceiling-${row.id}`,
      geometry: {
        kind: 'wall',
        from: [-MASS_X - CEILING_OVERHANG, ceiling],
        to: [MASS_X + CEILING_OVERHANG, ceiling],
      },
      material: 'solid',
    },
  ];

  for (const [side, pos] of [
    ['left', left],
    ['right', right],
  ] as const) {
    out.push({
      type: 'constraint',
      id: `spring-${row.id}-${side}`,
      subtype: 'spring',
      from: [pos[0], ceiling],
      to: [pos[0], pos[1] + h / 2],
      coils: SPRING_COILS,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `mass-${row.id}-${side}`,
      pos,
      shape: 'rect',
      size: [w, h],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 막대. 두 추의 가운데를 잇는다 — 두 추가 발맞추면 수평을 지키며 오르내리고,
  // 엇갈리면 가운데를 축으로 시소처럼 기운다.
  out.push({
    type: 'trajectory',
    id: `bar-${row.id}`,
    points: [left, right],
    width: BAR_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 막대 가운데 점 = 두 변위의 평균. 이 점이 기록지에 잉크를 남긴다.
  out.push({
    type: 'body',
    id: `pen-${row.id}`,
    pos: [0, row.y + r.mid],
    shape: 'circle',
    size: PEN_RADIUS,
    glow: false,
    outline: 'background',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
