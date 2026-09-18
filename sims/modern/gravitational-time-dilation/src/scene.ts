// ========================================================================
// gravitational-time-dilation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 땅(surface) · 탑(lineSet) ·
// 탑 높이(dimension) · 문자판(body 속 빈 원) · 바늘과 12시 눈금(lineSet) · 앞선 몫
// (sector) · A 바늘 자리의 그림자(trajectory 점선) · 기록 줄(trajectory) · 째깍 기록
// (trace tick + readout) · 기록 커서(lineSet)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 두 시계는 모두 먹색(같은 시계다), 탑 · 땅 · A 의 기록은 muted,
// **강조색은 「B 가 앞선 것」 한 가지 뜻에만** (B 의 째깍 기록 · 숫자 · B 문자판 위 앞선 몫).
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
import { clockFrame, heightFraction, readConstants, tripDurations } from './physics';
import {
  CLOCK_A_X,
  CLOCK_B_X,
  CLOCK_LABEL_RISE,
  CLOCK_RADIUS,
  CLOCK_Y,
  HEIGHT_DIM_X,
  SCENE_BOUNDS,
  STRIP_A_Y,
  STRIP_B_RISE,
  STRIP_B_Y,
  STRIP_SPEED,
  STRIP_X0,
  TOWER_HALF,
  TOWER_TOP,
  TOWER_X,
  text,
} from './schema';
import type { GravitationalTimeDilationState } from './state';

/** 바늘 굵기(화면 px). 시계에서 가장 먼저 읽혀야 하는 선이다. */
const HAND_WIDTH_PX = 2.5;
/** 바늘 길이 — 문자판 반지름에 대한 비. */
const HAND_SHARE = 0.82;
/** 12시 눈금 — 문자판 안쪽으로 들어오는 길이의 비와 굵기(화면 px). */
const NOON_SHARE = 0.22;
const NOON_WIDTH_PX = 2;
/** B 문자판 위 앞선 몫 부채꼴의 채움 짙기. */
const LEAD_FILL = 0.32;
/** B 문자판 위에 A 바늘 자리를 비추는 점선 굵기(화면 px) · 짙기. */
const GHOST_WIDTH_PX = 1.5;
const GHOST_OPACITY = 0.7;
/** 탑 — 다리 · 가새 굵기(화면 px) · 가새 한 칸 높이(월드) · 짙기. */
const TOWER_WIDTH_PX = 1.5;
const TOWER_BRACE_WIDTH_PX = 1;
const TOWER_BRACE_STEP = 0.5;
const TOWER_OPACITY = 0.75;
/** 가새 칸을 나누는 부동소수 허용치(월드). */
const BRACE_EPS = 1e-9;
/** 기록 줄 굵기(화면 px) · 짙기. 배경 정보라 가늘다. */
const STRIP_WIDTH_PX = 1.5;
const STRIP_OPACITY = 0.7;
/** 기록 줄 모양을 긋는 표본 수(기록 구간 전체에 대해). */
const STRIP_SAMPLES = 96;
/** 째깍 기록 눈금의 길이(월드)와 굵기(화면 px). */
const RECORD_TICK_LEN = 0.26;
const RECORD_TICK_WIDTH_PX = 2;
/** 기록 숫자를 줄에서 띄우는 거리(월드) — A 는 아래, B 는 위. */
const COUNT_GAP = 0.3;
/** 기록 숫자 · 줄 이름 · 시계 이름 · 탑 높이 · 실제 크기 글자 크기(화면 px). */
const COUNT_PX = 11;
const ROW_LABEL_PX = 13;
const CLOCK_LABEL_PX = 14;
const NOTE_PX = 11;
/** 줄 이름(A · B)을 줄 시작에서 왼쪽으로 띄우는 거리(월드). */
const ROW_LABEL_GAP = 0.2;
/** 기록 커서 — 줄 위아래로 넘는 길이(월드) · 굵기(화면 px) · 짙기. */
const CURSOR_OVERHANG = 0.3;
const CURSOR_WIDTH_PX = 1;
const CURSOR_OPACITY = 0.5;
/** 「시간 →」 이름표를 기록 띠 끝에서 오른쪽으로 띄우는 거리(월드). */
const TIME_LABEL_GAP = 0.15;
/** B 째깍에서 A 줄로 내리는 안내선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.55;
/** 실제 크기 문안의 자리(월드)와 줄바꿈 폭(화면 px). 기록 띠 위의 빈 자리다. */
const NOTE_POS: Vec2 = [3.1, 3.2];
const NOTE_WRAP_PX = 380;

/** 문자판 하나 — 테 · 12시 눈금 · 바늘. `turns` 는 바늘이 돈 바퀴 수. */
function clockParts(id: string, center: Vec2, turns: number): Primitive[] {
  const [cx, cy] = center;
  const angle = 2 * Math.PI * turns; // 12시에서 시계 방향
  const handTip: Vec2 = [
    cx + Math.sin(angle) * CLOCK_RADIUS * HAND_SHARE,
    cy + Math.cos(angle) * CLOCK_RADIUS * HAND_SHARE,
  ];
  return [
    {
      type: 'body',
      id: `${id}-face`,
      pos: center,
      shape: 'circle',
      size: CLOCK_RADIUS,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `${id}-noon`,
      lines: [
        [
          [cx, cy + CLOCK_RADIUS],
          [cx, cy + CLOCK_RADIUS * (1 - NOON_SHARE)],
        ],
      ],
      width: NOON_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `${id}-hand`,
      lines: [[center, handTip]],
      width: HAND_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

/** 12시에서 시계 방향으로 `turns` 바퀴 돈 바늘의 월드 각(x 축에서 반시계). */
function handAngle(turns: number): number {
  return Math.PI / 2 - 2 * Math.PI * turns;
}

export function scene(params: {
  state: GravitationalTimeDilationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('gravitational-time-dilation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const d = tripDurations(tl);
  const f = clockFrame(tl, c);
  const out: Primitive[] = [];

  /** 기록은 다시 맞추는 동안 흐려진다. */
  const recordAlpha = 1 - tl.at('reset');
  /** 기록 커서는 쌓는 동안만 있고, 견주는 동안 흐려진다. */
  const cursorAlpha = f.t >= 0 ? CURSOR_OPACITY * (1 - tl.at('compare')) : 0;
  /** 실제 크기 문안 — B 가 내려오며 나타나 다시 맞출 때 사라진다. */
  const noteAlpha = tl.at('lower') * recordAlpha;

  const stripX = (t: number): number => STRIP_X0 + STRIP_SPEED * t;
  const stripBY = (t: number): number => STRIP_B_Y + STRIP_B_RISE * heightFraction(t, d);

  // ---- 땅 ----
  out.push({ type: 'surface', id: 'ground', geometry: { kind: 'ground', y: 0 }, style: { colorRole: 'muted' } });

  // ---- 탑 — 다리 둘 · 꼭대기 · 가새 ----
  const left = TOWER_X - TOWER_HALF;
  const right = TOWER_X + TOWER_HALF;
  const braces: Vec2[] = [];
  for (let i = 0, y = 0; y < TOWER_TOP - BRACE_EPS; i++, y += TOWER_BRACE_STEP) {
    const y1 = Math.min(TOWER_TOP, y + TOWER_BRACE_STEP);
    braces.push(i % 2 === 0 ? [left, y] : [right, y], i % 2 === 0 ? [right, y1] : [left, y1]);
  }
  out.push({
    type: 'lineSet',
    id: 'tower-legs',
    lines: [
      [
        [left, 0],
        [left, TOWER_TOP],
        [right, TOWER_TOP],
        [right, 0],
      ],
    ],
    width: TOWER_WIDTH_PX,
    opacity: TOWER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'tower-braces',
    lines: [braces],
    width: TOWER_BRACE_WIDTH_PX,
    opacity: TOWER_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'dimension',
    id: 'tower-height',
    from: [HEIGHT_DIM_X, 0],
    to: [HEIGHT_DIM_X, TOWER_TOP],
    text: text('label.height'),
    vars: { h: String(c.heightM) },
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 기록 띠 ----
  if (f.t >= 0) {
    const n = Math.max(2, Math.ceil((STRIP_SAMPLES * f.tRecord) / f.span) + 1);
    const bLine: Vec2[] = [];
    for (let i = 0; i < n; i++) {
      const t = (f.tRecord * i) / (n - 1);
      bLine.push([stripX(t), stripBY(t)]);
    }
    out.push({
      type: 'trajectory',
      id: 'strip-a',
      points: [
        [stripX(0), STRIP_A_Y],
        [stripX(f.tRecord), STRIP_A_Y],
      ],
      width: STRIP_WIDTH_PX,
      opacity: STRIP_OPACITY * recordAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'strip-b',
      points: bLine,
      width: STRIP_WIDTH_PX,
      opacity: STRIP_OPACITY * recordAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 커서 — 지금 기록이 쓰이는 자리. 눈금 아래로 지나가도록 먼저 선언한다.
  if (cursorAlpha > 0) {
    const x = stripX(f.tRecord);
    out.push({
      type: 'lineSet',
      id: 'strip-cursor',
      lines: [
        [
          [x, STRIP_A_Y - CURSOR_OVERHANG],
          [x, STRIP_B_Y + STRIP_B_RISE + CURSOR_OVERHANG],
        ],
      ],
      width: CURSOR_WIDTH_PX,
      opacity: cursorAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // B 의 째깍에서 A 줄로 내리는 안내선 — B 의 k 가 A 의 k 보다 얼마나 앞에 떨어졌는지를 잇는다.
  f.bTicks.forEach((t, k) => {
    if (k === 0) return;
    out.push({
      type: 'trajectory',
      id: `guide-${k}`,
      points: [
        [stripX(t), stripBY(t)],
        [stripX(t), STRIP_A_Y],
      ],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY * recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  });

  // A 의 째깍 — 땅에 있는 시계. 고른 간격이다.
  if (f.aTicks.length > 0) {
    out.push({
      type: 'trace',
      id: 'ticks-a',
      marks: f.aTicks.map((t) => ({ pos: [stripX(t), STRIP_A_Y] as Vec2 })),
      shape: 'tick',
      size: RECORD_TICK_LEN,
      width: RECORD_TICK_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    f.aTicks.forEach((t, k) =>
      out.push({
        type: 'readout',
        id: `count-a-${k}`,
        anchor: { world: [stripX(t), STRIP_A_Y - COUNT_GAP] },
        text: text('label.count'),
        vars: { n: k },
        chip: false,
        fontSize: COUNT_PX,
        align: 'center',
        opacity: recordAlpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      }),
    );
  }

  // B 의 째깍 — 위에 있는 동안 간격이 좁아져 A 보다 점점 앞으로 어긋난다.
  if (f.bTicks.length > 0) {
    out.push({
      type: 'trace',
      id: 'ticks-b',
      marks: f.bTicks.map((t) => ({ pos: [stripX(t), stripBY(t)] as Vec2 })),
      shape: 'tick',
      size: RECORD_TICK_LEN,
      width: RECORD_TICK_WIDTH_PX,
      opacity: recordAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    f.bTicks.forEach((t, k) =>
      out.push({
        type: 'readout',
        id: `count-b-${k}`,
        anchor: { world: [stripX(t), stripBY(t) + COUNT_GAP] },
        text: text('label.count'),
        vars: { n: k },
        chip: false,
        fontSize: COUNT_PX,
        align: 'center',
        weight: 'bold',
        opacity: recordAlpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      }),
    );
  }

  // 줄 이름과 시간 방향.
  out.push({
    type: 'readout',
    id: 'row-a',
    anchor: { world: [STRIP_X0 - ROW_LABEL_GAP, STRIP_A_Y] },
    text: text('label.a'),
    chip: false,
    fontSize: ROW_LABEL_PX,
    align: 'right',
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'row-b',
    anchor: { world: [STRIP_X0 - ROW_LABEL_GAP, STRIP_B_Y] },
    text: text('label.b'),
    chip: false,
    fontSize: ROW_LABEL_PX,
    align: 'right',
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'time-arrow',
    anchor: { world: [stripX(f.span) + TIME_LABEL_GAP, STRIP_A_Y] },
    text: text('label.time'),
    chip: false,
    font: 'text',
    fontSize: COUNT_PX,
    align: 'left',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 두 시계 ----
  const aCenter: Vec2 = [CLOCK_A_X, CLOCK_Y];
  const bCenter: Vec2 = [CLOCK_B_X, CLOCK_Y + TOWER_TOP * f.bHeight];

  // B 문자판 위에 앞선 몫 — A 의 바늘 자리에서 B 의 바늘까지. 바늘 아래로 먼저 깐다.
  if (f.lead > 0) {
    out.push({
      type: 'sector',
      id: 'lead',
      center: bCenter,
      radius: CLOCK_RADIUS * HAND_SHARE,
      from: handAngle(f.aTurns),
      to: handAngle(f.bTurns),
      fillOpacity: LEAD_FILL,
      rimWidth: 0,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    const a = handAngle(f.aTurns);
    out.push({
      type: 'trajectory',
      id: 'lead-ghost',
      points: [
        bCenter,
        [bCenter[0] + Math.cos(a) * CLOCK_RADIUS * HAND_SHARE, bCenter[1] + Math.sin(a) * CLOCK_RADIUS * HAND_SHARE],
      ],
      width: GHOST_WIDTH_PX,
      opacity: GHOST_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  out.push(...clockParts('clock-a', aCenter, f.aTurns));
  out.push(...clockParts('clock-b', bCenter, f.bTurns));
  out.push({
    type: 'readout',
    id: 'name-a',
    anchor: { world: [CLOCK_A_X, CLOCK_Y + CLOCK_LABEL_RISE] },
    text: text('label.a'),
    chip: false,
    fontSize: CLOCK_LABEL_PX,
    align: 'center',
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'name-b',
    anchor: { world: [bCenter[0], bCenter[1] + CLOCK_LABEL_RISE] },
    text: text('label.b'),
    chip: false,
    fontSize: CLOCK_LABEL_PX,
    align: 'center',
    weight: 'bold',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 실제 크기 — 부풀렸다는 것을 숨기지 않는다 ----
  if (noteAlpha > 0) {
    out.push({
      type: 'readout',
      id: 'real-size',
      anchor: { world: NOTE_POS },
      text: text('label.real'),
      vars: { h: String(c.heightM), ns: String(c.realNsPerDay) },
      chip: false,
      font: 'text',
      fontSize: NOTE_PX,
      align: 'center',
      wrapWidth: NOTE_WRAP_PX,
      opacity: noteAlpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
