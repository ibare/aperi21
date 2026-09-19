// ========================================================================
// amperes-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 고리 · 걸어온 길 · 기준선은
// `trajectory`, 전선 · 걷는 점 · 토막 경계는 `body`, 장과 그 길 방향 몫은 `vector`, 막대는
// `region`, 토막 눈금은 `lineSet`, 기호는 `readout` 이다.
//
// 색은 뜻마다 하나다 — 전선 · 고리 · 작은 그림은 먹색(`ink`), 장 B 와 쌓인 합은 같은 양의
// 두 모습이라 `primary`, 기준선은 배경 정보라 `muted`. **강조색은 「지금 더하는 몫」 한 가지
// 뜻에만** 쓴다 — 걷는 점, 그 자리 B 의 길 방향 몫, 막대 꼭대기에서 지금 쌓이는(덜어지는) 토막.
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
  LOOP_IDS,
  peakSumAt,
  loopShape,
  readConstants,
  samplePath,
  sumAt,
  walkAt,
  walkedPoints,
  type AmperesLawConstants,
  type SampledPath,
} from './physics';
import {
  COLUMN_BASE_Y,
  COLUMN_FIRST_X,
  COLUMN_GAP,
  COLUMN_WIDTH,
  MINI_SCALE,
  MINI_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { AmperesLawState } from './state';

/** 전선 원의 반지름 · ⊙ 점 반지름(월드)과 원 굵기(화면 px). */
const WIRE_RADIUS = 0.1;
const WIRE_DOT_RADIUS = 0.035;
const WIRE_WIDTH_PX = 2;
/** 전선 원을 이루는 꼭짓점 수. */
const WIRE_SEGMENTS = 36;
/** 전류 기호 I 를 전선에서 띄우는 거리(화면 px) — 오른쪽 위. */
const CURRENT_LABEL_OFFSET: Vec2 = [14, -14];
/** 기호 글자 크기(화면 px). */
const SYMBOL_PX = 14;

/** 끝난 고리의 짙기와 굵기(화면 px). 세 막대를 견줄 때 어느 길이었는지만 남긴다. */
const DONE_OPACITY = 0.25;
const DONE_WIDTH_PX = 1.4;
/** 걷는 고리 전체(아직 안 걸은 쪽 포함)의 짙기 · 굵기, 걸어온 쪽의 굵기(화면 px). */
const AHEAD_OPACITY = 0.4;
const AHEAD_WIDTH_PX = 1.4;
const WALKED_WIDTH_PX = 2.8;
/** 토막 경계 점의 짙기. */
const CUT_OPACITY = 0.75;

/** 장 B 화살표의 굵기와, 그 길 방향 몫 화살표의 굵기 · 짙기(화면 px). 몫은 B 아래에 넓게 깔린다. */
const FIELD_WIDTH_PX = 2;
const ALONG_WIDTH_PX = 6;
const ALONG_OPACITY = 0.6;
/** B 끝에서 길 방향 몫 끝으로 내린 수선의 굵기(화면 px) · 짙기. */
const DROP_WIDTH_PX = 1;
const DROP_OPACITY = 0.8;

/** 막대의 채움 짙기 · 지금 토막의 채움 짙기 · 덜어진 몫(빗금 칸)의 채움 짙기. */
const BAR_FILL = 0.45;
const BLOCK_FILL = 0.85;
const GHOST_FILL = 0.3;
/** 토막 눈금의 굵기(화면 px) · 짙기. 막대가 토막으로 쌓였다는 것을 보인다. */
const TICK_WIDTH_PX = 1;
const TICK_OPACITY = 0.7;
/** 기준선(0 · μ₀I)이 막대 바깥으로 나가는 길이(월드) · 굵기(화면 px). */
const RULE_OVERHANG = 0.3;
const RULE_WIDTH_PX = 1.2;
/** 기준선 이름표를 선 왼끝에서 띄우는 거리(월드). */
const RULE_LABEL_GAP = 0.2;
/** 작은 고리 그림의 선 굵기(화면 px) · 걷지 않는 고리의 짙기. */
const MINI_WIDTH_PX = 1.2;
const MINI_IDLE_OPACITY = 0.45;

function circlePoints(center: Vec2, radius: number, segments: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i * 2 * Math.PI) / segments;
    pts.push([center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]);
  }
  return pts;
}

function discPath(r: number): string {
  return `M ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 Z`;
}

function rect(x0: number, x1: number, y0: number, y1: number): Vec2[] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** 막대 k 의 가운데 x. */
function columnX(k: number): number {
  return COLUMN_FIRST_X + k * COLUMN_GAP;
}

/** 고리 하나의 막대 — 쌓인 합 · 지금 토막 · 토막 눈금. */
function column(
  out: Primitive[],
  k: number,
  path: SampledPath,
  f: number,
  walking: boolean,
  alpha: number,
  c: AmperesLawConstants,
): void {
  const x = columnX(k);
  const x0 = x - COLUMN_WIDTH / 2;
  const x1 = x + COLUMN_WIDTH / 2;
  const toY = (s: number): number => COLUMN_BASE_Y + s * c.sumToLength;

  const s = sumAt(path, f, c);
  // 지금 토막이 시작한 자리. 걷는 중이 아니면 토막이 없다(다 쌓였다).
  const done = walking ? Math.min(c.segments, Math.floor(f * c.segments)) : c.segments;
  const sj = walking ? sumAt(path, done / c.segments, c) : s;
  const lower = Math.min(s, sj);
  const upper = Math.max(s, sj);
  const peak = peakSumAt(path, f, c);

  // 덜어진 몫 — 걸어오며 올랐던 가장 높은 자리에서 지금 합까지. 빗금 칸으로 남아
  // 막대가 0 으로 돌아온 뒤에도 「올랐다가 내려왔다」 가 읽힌다.
  if (peak > upper) {
    out.push({
      type: 'region',
      id: `ghost-${k}`,
      points: rect(x0, x1, toY(upper), toY(peak)),
      fillOpacity: GHOST_FILL,
      fill: 'hatch',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  if (lower !== 0) {
    out.push({
      type: 'region',
      id: `bar-${k}`,
      points: rect(x0, x1, toY(0), toY(lower)),
      fillOpacity: BAR_FILL,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 토막 눈금 — 다 쌓인 경계 중 막대 안에 든 것.
  const ticks: Vec2[][] = [];
  const last = walking ? done : c.segments - 1;
  for (let j = 1; j <= last; j++) {
    const level = sumAt(path, j / c.segments, c);
    if (level > 0 && level < lower) ticks.push([[x0, toY(level)], [x1, toY(level)]]);
  }
  if (ticks.length > 0) {
    out.push({
      type: 'lineSet',
      id: `ticks-${k}`,
      lines: ticks,
      width: TICK_WIDTH_PX,
      opacity: TICK_OPACITY * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 지금 토막. 쌓이면 막대 꼭대기에서 자라고, 덜어지면 꼭대기 위(빗금 칸 아래 끝)에서 줄어든다.
  if (walking && upper > lower) {
    out.push({
      type: 'region',
      id: `block-${k}`,
      points: rect(x0, x1, toY(lower), toY(upper)),
      fillOpacity: BLOCK_FILL,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
}

/** 막대 아래 작은 고리 그림 — 전선 점과 고리를 함께 줄여 막대 가운데 아래에 둔다. */
function miniature(out: Primitive[], k: number, path: SampledPath, lit: boolean, alpha: number): void {
  const pts = path.points.slice(0, -1).map(([px, py]): Vec2 => [px * MINI_SCALE, py * MINI_SCALE]);
  const xs = [0, ...pts.map((p) => p[0])];
  const ys = [0, ...pts.map((p) => p[1])];
  const dx = columnX(k) - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = MINI_Y - (Math.min(...ys) + Math.max(...ys)) / 2;
  const opacity = (lit ? 1 : MINI_IDLE_OPACITY) * alpha;
  out.push({
    type: 'trajectory',
    id: `mini-loop-${k}`,
    points: pts.map(([px, py]): Vec2 => [px + dx, py + dy]),
    closed: true,
    width: MINI_WIDTH_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: `mini-wire-${k}`,
    pos: [dx, dy],
    shape: 'point',
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

export function scene(params: {
  state: AmperesLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('amperes-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  // 다음 주기로 넘어가며 흐려지는 정도.
  const alpha = 1 - tl.at('fade');

  const paths = LOOP_IDS.map((id) => samplePath(loopShape(id, c), c));

  // ---- 기준선 ----
  const ruleFrom = columnX(0) - COLUMN_WIDTH / 2 - RULE_OVERHANG;
  const ruleTo = columnX(LOOP_IDS.length - 1) + COLUMN_WIDTH / 2 + RULE_OVERHANG;
  const refY = COLUMN_BASE_Y + c.current * c.sumToLength;
  out.push({
    type: 'trajectory',
    id: 'rule-zero',
    points: [
      [ruleFrom, COLUMN_BASE_Y],
      [ruleTo, COLUMN_BASE_Y],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'rule-enclosed',
    points: [
      [ruleFrom, refY],
      [ruleTo, refY],
    ],
    width: RULE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'rule-zero-label',
    anchor: { world: [ruleFrom - RULE_LABEL_GAP, COLUMN_BASE_Y] },
    text: text('label.zero'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'rule-enclosed-label',
    anchor: { world: [ruleFrom - RULE_LABEL_GAP, refY] },
    text: text('label.enclosed'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 고리와 막대 ----
  // 끝난 고리를 먼저(옅게), 걷는 고리를 나중에 — 걷는 고리가 위에 온다.
  const walker: Primitive[] = [];
  LOOP_IDS.forEach((id, k) => {
    const path = paths[k]!;
    const walkId = `walk-${id}`;
    const f = tl.at(walkId);
    const walking = tl.phase === walkId;
    const closing = tl.phase === `close-${id}`;
    const started = walking || f >= 1;

    miniature(out, k, path, walking || closing, alpha);
    if (!started) return;
    column(out, k, path, f, walking, alpha, c);

    if (!walking && !closing) {
      out.push({
        type: 'trajectory',
        id: `loop-${id}`,
        points: path.points,
        closed: true,
        width: DONE_WIDTH_PX,
        opacity: DONE_OPACITY * alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
      return;
    }

    // 걷는 · 방금 다 걸은 고리.
    out.push({
      type: 'trajectory',
      id: `loop-${id}`,
      points: path.points,
      closed: true,
      width: AHEAD_WIDTH_PX,
      opacity: AHEAD_OPACITY,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: `walked-${id}`,
      points: walkedPoints(path, f),
      width: WALKED_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    for (let j = 0; j < c.segments; j++) {
      out.push({
        type: 'body',
        id: `cut-${id}-${j}`,
        pos: walkAt(path, j / c.segments).pos,
        shape: 'point',
        opacity: CUT_OPACITY,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }

    if (!walking) return;

    // ---- 걷는 점 ----
    // B 와 그 길 방향 몫. 몫은 B 아래에 넓게 깔려, 길과 나란하면 B 를 통째로 감싸고
    // 길을 거스르면 뒤로 향한다.
    const w = walkAt(path, f);
    const b = fieldAt(w.pos, c);
    const bArrow: Vec2 = [b[0] * c.fieldToLength, b[1] * c.fieldToLength];
    const along = b[0] * w.tangent[0] + b[1] * w.tangent[1];
    const aArrow: Vec2 = [
      w.tangent[0] * along * c.fieldToLength,
      w.tangent[1] * along * c.fieldToLength,
    ];
    walker.push({
      type: 'vector',
      id: 'along',
      from: w.pos,
      delta: aArrow,
      width: ALONG_WIDTH_PX,
      opacity: ALONG_OPACITY,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    walker.push({
      type: 'trajectory',
      id: 'drop',
      points: [
        [w.pos[0] + bArrow[0], w.pos[1] + bArrow[1]],
        [w.pos[0] + aArrow[0], w.pos[1] + aArrow[1]],
      ],
      width: DROP_WIDTH_PX,
      opacity: DROP_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    walker.push({
      type: 'vector',
      id: 'field',
      from: w.pos,
      delta: bArrow,
      label: text('label.field'),
      width: FIELD_WIDTH_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    walker.push({
      type: 'body',
      id: 'walker',
      pos: w.pos,
      shape: 'point',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // ---- 전선 ----
  out.push({
    type: 'trajectory',
    id: 'wire-ring',
    points: circlePoints([0, 0], WIRE_RADIUS, WIRE_SEGMENTS),
    closed: true,
    width: WIRE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'wire-out',
    pos: [0, 0],
    shape: 'custom',
    customPath: discPath(WIRE_DOT_RADIUS),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'wire-label',
    anchor: { world: [0, 0], offset: CURRENT_LABEL_OFFSET },
    text: text('label.current'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: SYMBOL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  out.push(...walker);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
