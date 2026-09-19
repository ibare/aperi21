// ========================================================================
// phase-in-ac-circuit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 세 줄(저항 · 축전기 · 코일)이 위아래로 있고, 한 줄은 왼쪽부터 —
//   소자 기호(trajectory · lineSet)와 표식 `R` · `C` · `L`, 이름(readout)
//   기록지 — 시간축(lineSet) · 전압 마루 기준선(세로 점선) · 전압(실선) · 전류(파선) ·
//            간격 막대(dimension, 강조색) · 커서(세로선)와 두 점(body)
//   회전 화살표 — 테두리 원(trajectory) · 전압 화살표(실선) · 전류 화살표(파선)
//
// 색은 뜻마다 하나다. 기호 · 파형 · 화살표 · 글자는 먹색, 축 · 커서 · 기준선은 muted.
// **강조색은 「어긋남」 한 뜻에만** — 간격 막대와 그 글자 `T/4`. 전압과 전류는 색이 아니라
// 선 모양(실선 · 파선)과 표식 `V` · `I` 로 가른다 (S-piece). 기록지와 화살표가 같은 선 모양을 쓴다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  currentAt,
  currentCrest,
  currentLead,
  readConstants,
  voltageAt,
  voltagePhase,
  type Element,
  type PhaseInAcCircuitConstants,
} from './physics';
import {
  GAP_BAR_Y,
  PHASE_CAPACITOR,
  PHASE_INDUCTOR,
  PHASE_RESISTOR,
  PHASOR_X,
  ROW_CAPACITOR_Y,
  ROW_INDUCTOR_Y,
  ROW_RESISTOR_Y,
  SCENE_BOUNDS,
  SCOPE_HALF_H,
  SCOPE_LEFT,
  SCOPE_RIGHT,
  SYMBOL_HALF_LEN,
  SYMBOL_X,
  text,
  type PhaseInAcCircuitMessageKey,
} from './schema';
import type { PhaseInAcCircuitState } from './state';

// ------------------------------------------------------------------------
// 굵기 · 글자 · 크기 · 표본 (화면 px · 월드 · 개수)
// ------------------------------------------------------------------------

const SYMBOL_WIDTH = 2;
const PLATE_WIDTH = 3.5;
const AXIS_WIDTH = 1;
const GUIDE_WIDTH = 1.2;
const CURSOR_WIDTH = 1.2;
const VOLTAGE_WIDTH = 2.2;
const CURRENT_WIDTH = 2.4;
const PHASOR_WIDTH = 2.4;
const RIM_WIDTH = 1;
const SYMBOL_PX = 15;
const NAME_PX = 12;
const LABEL_PX = 13;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 9;
/** 소자 이름을 기호 아래로 띄우는 거리(화면 px). */
const NAME_DROP = 16;
/** 전압 표식 `V` 를 간격 막대 높이 위로 띄우는 거리(화면 px) — 막대 글자 `T/4` 와 같은 줄. */
const VOLTAGE_LABEL_LIFT = 11;
/** 전류 표식 `I` 를 전류 마루 아래(혹 안쪽)로 내리는 거리(화면 px). */
const CURRENT_LABEL_DROP = 11;
/** 커서 점의 반지름(월드). */
const DOT_R = 0.085;
/** 화살표 머리 크기(월드). */
const PHASOR_HEAD = 0.2;
/** 저항 지그재그 — 꺾임 수 · 반 높이(월드) · 몸통 반 길이(월드). */
const ZIGZAG_TEETH = 6;
const ZIGZAG_HALF_H = 0.16;
const BODY_HALF_LEN = 0.38;
/** 축전기 판 — 반 높이 · 판 사이 반 간격(월드). */
const PLATE_HALF_H = 0.28;
const PLATE_HALF_GAP = 0.08;
/** 코일 — 감은 수 · 혹 높이(월드). */
const COIL_TURNS = 4;
const COIL_BUMP = 0.2;
/** 파형 표본 수 — 한 폭(1.25 주기)에 충분히 매끈하게. */
const TRACE_SAMPLES = 240;
const COIL_SAMPLES_PER_TURN = 14;
const RIM_SAMPLES = 72;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const GAP = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 줄 — 소자와 그 줄을 부각하는 시간표 단계. 줄 수 · 순서는 도식 배치다. */
const ROWS: readonly {
  element: Element;
  y: number;
  phase: string;
  symbol: PhaseInAcCircuitMessageKey;
  name: PhaseInAcCircuitMessageKey;
}[] = [
  { element: 'resistor', y: ROW_RESISTOR_Y, phase: PHASE_RESISTOR, symbol: 'label.resistor', name: 'label.resistorName' },
  { element: 'capacitor', y: ROW_CAPACITOR_Y, phase: PHASE_CAPACITOR, symbol: 'label.capacitor', name: 'label.capacitorName' },
  { element: 'inductor', y: ROW_INDUCTOR_Y, phase: PHASE_INDUCTOR, symbol: 'label.inductor', name: 'label.inductorName' },
];

// ------------------------------------------------------------------------
// 도우미
// ------------------------------------------------------------------------

type Highlight = 'normal' | 'dimmed';

function label(
  id: string,
  body: LocalizedText,
  pos: Vec2,
  offset: Vec2,
  align: 'left' | 'center' | 'right',
  fontSize: number,
  style: Readout['style'],
  highlight: Highlight,
  italic: boolean,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: body,
    chip: false,
    font: 'text',
    align,
    fontSize,
    italic,
    highlight,
    style,
  };
}

/** 기록지 폭 안 시각 s(0~1) → 월드 x. */
function scopeX(s: number): number {
  return SCOPE_LEFT + (SCOPE_RIGHT - SCOPE_LEFT) * s;
}

/** 소자 기호 — 가로로 누운 회로 기호에 양쪽 도선을 붙인다. */
function symbolOf(out: Primitive[], prefix: string, element: Element, y0: number, hl: Highlight): void {
  const left = SYMBOL_X - SYMBOL_HALF_LEN;
  const right = SYMBOL_X + SYMBOL_HALF_LEN;
  if (element === 'capacitor') {
    out.push({
      type: 'lineSet',
      id: `${prefix}-leads`,
      lines: [
        [[left, y0], [SYMBOL_X - PLATE_HALF_GAP, y0]],
        [[SYMBOL_X + PLATE_HALF_GAP, y0], [right, y0]],
      ],
      width: SYMBOL_WIDTH,
      highlight: hl,
      style: INK,
    });
    out.push({
      type: 'lineSet',
      id: `${prefix}-plates`,
      lines: [
        [[SYMBOL_X - PLATE_HALF_GAP, y0 - PLATE_HALF_H], [SYMBOL_X - PLATE_HALF_GAP, y0 + PLATE_HALF_H]],
        [[SYMBOL_X + PLATE_HALF_GAP, y0 - PLATE_HALF_H], [SYMBOL_X + PLATE_HALF_GAP, y0 + PLATE_HALF_H]],
      ],
      width: PLATE_WIDTH,
      highlight: hl,
      style: INK,
    });
    return;
  }
  const pts: Vec2[] = [[left, y0], [SYMBOL_X - BODY_HALF_LEN, y0]];
  if (element === 'resistor') {
    const seg = (2 * BODY_HALF_LEN) / ZIGZAG_TEETH;
    for (let k = 0; k < ZIGZAG_TEETH; k++) {
      pts.push([SYMBOL_X - BODY_HALF_LEN + seg * (k + 0.5), y0 + (k % 2 === 0 ? ZIGZAG_HALF_H : -ZIGZAG_HALF_H)]);
    }
  } else {
    // 옆에서 본 감긴 도선 — 위로 불룩한 혹이 감은 수만큼 이어진다.
    const seg = (2 * BODY_HALF_LEN) / COIL_TURNS;
    for (let k = 0; k < COIL_TURNS; k++) {
      const xc = SYMBOL_X - BODY_HALF_LEN + seg * (k + 0.5);
      for (let i = 0; i <= COIL_SAMPLES_PER_TURN; i++) {
        const th = Math.PI - (Math.PI * i) / COIL_SAMPLES_PER_TURN;
        pts.push([xc + (seg / 2) * Math.cos(th), y0 + COIL_BUMP * Math.sin(th)]);
      }
    }
  }
  pts.push([SYMBOL_X + BODY_HALF_LEN, y0], [right, y0]);
  out.push({ type: 'trajectory', id: `${prefix}-symbol-line`, points: pts, width: SYMBOL_WIDTH, highlight: hl, style: INK });
}

function tracePoints(y0: number, f: (s: number) => number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= TRACE_SAMPLES; i++) {
    const s = i / TRACE_SAMPLES;
    pts.push([scopeX(s), y0 + f(s)]);
  }
  return pts;
}

/** 한 줄 — 기호 · 기록지 · 커서 · 회전 화살표. */
function row(
  out: Primitive[],
  r: (typeof ROWS)[number],
  cursor: number,
  hl: Highlight,
  c: PhaseInAcCircuitConstants,
): void {
  const { element, y: y0 } = r;
  const p = element;

  // ---- 소자 기호와 이름 ----
  symbolOf(out, p, element, y0, hl);
  out.push(label(`${p}-symbol`, text(r.symbol), [SYMBOL_X, y0 + PLATE_HALF_H], [0, -LABEL_GAP], 'center', SYMBOL_PX, INK, hl, true));
  out.push(label(`${p}-name`, text(r.name), [SYMBOL_X, y0 - PLATE_HALF_H], [0, NAME_DROP], 'center', NAME_PX, MUTED, hl, false));

  // ---- 기록지 축 · 전압 마루 기준선 ----
  const vCrestX = scopeX(0.5);
  out.push({
    type: 'lineSet',
    id: `${p}-axes`,
    lines: [
      [[SCOPE_LEFT, y0], [SCOPE_RIGHT, y0]],
      [[SCOPE_LEFT, y0 - SCOPE_HALF_H], [SCOPE_LEFT, y0 + SCOPE_HALF_H]],
    ],
    width: AXIS_WIDTH,
    highlight: hl,
    style: MUTED,
  });
  out.push(label(`${p}-t`, text('label.time'), [SCOPE_RIGHT, y0], [LABEL_GAP, 0], 'left', LABEL_PX, MUTED, hl, true));
  out.push({
    type: 'trajectory',
    id: `${p}-crest-guide`,
    points: [[vCrestX, y0 - SCOPE_HALF_H], [vCrestX, y0 + GAP_BAR_Y]],
    width: GUIDE_WIDTH,
    highlight: hl,
    style: { ...MUTED, lineStyle: 'dotted' },
  });

  // ---- 두 파형 — 전압 실선, 전류 파선 ----
  out.push({
    type: 'trajectory',
    id: `${p}-voltage`,
    points: tracePoints(y0, (s) => voltageAt(s, c)),
    width: VOLTAGE_WIDTH,
    highlight: hl,
    style: INK,
  });
  out.push({
    type: 'trajectory',
    id: `${p}-current`,
    points: tracePoints(y0, (s) => currentAt(element, s, c)),
    width: CURRENT_WIDTH,
    highlight: hl,
    style: { ...INK, lineStyle: 'dashed' },
  });

  // ---- 표식 — V 는 전압 마루 위(간격 막대 높이), I 는 전류 마루 안쪽(마루 아래) ----
  const iCrestX = scopeX(currentCrest(element, c));
  out.push(
    label(`${p}-v`, text('label.voltage'), [vCrestX, y0 + GAP_BAR_Y], [0, -VOLTAGE_LABEL_LIFT], 'center', LABEL_PX, INK, hl, true),
  );
  out.push(
    label(`${p}-i`, text('label.current'), [iCrestX, y0 + c.currentAmplitude], [0, CURRENT_LABEL_DROP], 'center', LABEL_PX, INK, hl, true),
  );

  // ---- 간격 막대 — 전류 마루에서 전압 마루까지. 저항은 어긋남이 없어 두지 않는다 ----
  if (currentLead(element) !== 0) {
    out.push({
      type: 'dimension',
      id: `${p}-gap`,
      from: [iCrestX, y0 + GAP_BAR_Y],
      to: [vCrestX, y0 + GAP_BAR_Y],
      text: text('label.quarterPeriod'),
      highlight: hl,
      style: GAP,
    });
  }

  // ---- 커서 — 지금 시각. 두 점이 마루에 닿는 순서가 「먼저 · 늦게」 다 ----
  const cx = scopeX(cursor);
  out.push({
    type: 'trajectory',
    id: `${p}-cursor`,
    points: [[cx, y0 - SCOPE_HALF_H], [cx, y0 + SCOPE_HALF_H]],
    width: CURSOR_WIDTH,
    highlight: hl,
    style: MUTED,
  });
  out.push({
    type: 'body',
    id: `${p}-cursor-v`,
    pos: [cx, y0 + voltageAt(cursor, c)],
    shape: 'circle',
    size: DOT_R,
    outline: 'background',
    glow: false,
    highlight: hl,
    style: INK,
  });
  out.push({
    type: 'body',
    id: `${p}-cursor-i`,
    pos: [cx, y0 + currentAt(element, cursor, c)],
    shape: 'circle',
    size: DOT_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    highlight: hl,
    style: INK,
  });

  // ---- 회전 화살표 — 세로 성분이 그 순간의 파형 높이다(위가 마루) ----
  const rim: Vec2[] = [];
  for (let i = 0; i < RIM_SAMPLES; i++) {
    const th = (2 * Math.PI * i) / RIM_SAMPLES;
    rim.push([PHASOR_X + c.voltageAmplitude * Math.cos(th), y0 + c.voltageAmplitude * Math.sin(th)]);
  }
  out.push({ type: 'trajectory', id: `${p}-rim`, points: rim, closed: true, width: RIM_WIDTH, highlight: hl, style: MUTED });
  const thV = Math.PI / 2 + voltagePhase(cursor, c);
  const thI = thV + currentLead(element);
  out.push({
    type: 'vector',
    id: `${p}-phasor-v`,
    from: [PHASOR_X, y0],
    delta: [c.voltageAmplitude * Math.cos(thV), c.voltageAmplitude * Math.sin(thV)],
    headSize: PHASOR_HEAD,
    width: PHASOR_WIDTH,
    highlight: hl,
    style: INK,
  });
  out.push({
    type: 'vector',
    id: `${p}-phasor-i`,
    from: [PHASOR_X, y0],
    delta: [c.currentAmplitude * Math.cos(thI), c.currentAmplitude * Math.sin(thI)],
    headSize: PHASOR_HEAD,
    width: PHASOR_WIDTH,
    highlight: hl,
    style: { ...INK, lineStyle: 'dashed' },
  });
}

export function scene(params: {
  state: PhaseInAcCircuitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('phase-in-ac-circuit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  // 단계마다 커서가 기록지 한 폭을 한 번 쓴다 — 진행도가 곧 커서 자리다.
  const cursor = timeline.progress;
  // 한 줄을 부각하는 단계면 나머지 줄을 흐리게. 「나란히」 단계에는 모두 온전하다.
  const focused = ROWS.some((r) => r.phase === timeline.phase);
  const out: Primitive[] = [];
  for (const r of ROWS) {
    row(out, r, cursor, focused && r.phase !== timeline.phase ? 'dimmed' : 'normal', c);
  }
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
