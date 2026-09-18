// ========================================================================
// radiometric-dating — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 곡선 판 — 축은 `trajectory` 한 줄 + 축 이름 `readout` 둘(장부 G47), 눈금은 `lineSet`,
// 붕괴 곡선은 표본을 잇는 `trajectory`(장부 G28). 곡선은 처음부터 다 그려져 있다 —
// 이 조각에서 곡선은 읽는 도구이고, 그려지는 것은 이웃 `radioactive-decay` 의 몫이다.
//
// 시료 막대 — 세로축 왼쪽. 테두리(`trajectory` closed)가 살아 있을 때의 양(1)이고,
// 채움(`region`)이 시료에 남은 양이다. 세로축과 같은 눈금이라 채움의 위 끝이 곧 읽을 높이다.
//
// 읽는 경로 — 채움 높이에서 가로로 곡선까지, 곡선에서 곧장 가로축까지(`trajectory` 둘),
// 가로축 아래에서 반감기 하나씩 거꾸로 되짚는 화살표(`vector`), 곡선을 거슬러 오르는
// 점(`body`), 읽어 낸 연대(`readout`).
//
// 색 — 곡선 · 시료 채움은 먹(`ink`), 축 · 눈금 · 막대 테두리 · 되짚은 자리 안내선은 회색(`muted`).
// 강조색(`accent`)은 「읽는 경로」 한 뜻에만 쓴다: 읽기 선 · 되짚는 화살표 · 읽기 점 · 연대.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  curvePoint,
  hopRange,
  plotPoint,
  ratioOf,
  readConstants,
  remaining,
  type RadiometricDatingConstants,
} from './physics';
import {
  AGE_Y,
  BAR,
  HOP_DROP,
  HOP_PHASES,
  PLOT,
  SCENE_BOUNDS,
  text,
  type RadiometricDatingMessageKey,
} from './schema';
import type { RadiometricDatingState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 곡선 표본 수. 매끈한 지수 곡선을 폴리라인으로 긋는다 (장부 G28). */
const CURVE_SAMPLES = 120;
/** 선 굵기(화면 px). */
const AXIS_PX = 1;
const TICK_PX = 1;
const BAR_FRAME_PX = 1;
const CURVE_PX = 2.5;
const READ_PX = 2;
const GUIDE_PX = 1;
const HOP_PX = 2.5;
/** 눈금 길이(월드). */
const TICK_LEN = 0.12;
/** 읽기 점 반지름(월드). */
const DOT_R = 0.13;
/** 시료 채움 불투명도 — 테두리 안이 비쳐 「전체 중 얼마」 로 읽히는 정도. */
const SAMPLE_FILL_OPACITY = 0.55;
/** 되짚은 자리 안내선 짙기. */
const GUIDE_OPACITY = 0.8;
/** 글자 크기(화면 px). */
const AXIS_LABEL_PX = 12;
const TICK_LABEL_PX = 12;
const BAR_LABEL_PX = 13;
const HOP_LABEL_PX = 13;
const AGE_PX = 18;
/** 글자 띄움(화면 px). */
const AXIS_LABEL_GAP = 12;
const TICK_LABEL_GAP = 10;
const BAR_LABEL_GAP = 12;
const HOP_LABEL_GAP = 14;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

function label(
  id: string,
  key: RadiometricDatingMessageKey,
  anchor: Readout['anchor'],
  fontSize: number,
  align: 'left' | 'center' | 'right',
  opacity: number,
  style: Readout['style'],
  vars?: Record<string, string | number>,
  weight?: Readout['weight'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    ...(weight ? { weight } : {}),
    style,
  };
}

/** 가는 선 하나. 점선 가닥은 `lineSet` 에 선 모양이 없어 낱개로 선언한다 (장부 G68). */
function line(
  id: string,
  points: Vec2[],
  width: number,
  opacity: number,
  style: Trajectory['style'],
  out: Primitive[],
): void {
  if (opacity <= 0) return;
  const t: Trajectory = { type: 'trajectory', id, points, width, opacity, style };
  out.push(t);
}

/** 곡선 판 — 축 · 눈금 · 축 이름 · 곡선. 주기 내내 그대로다. */
function plot(k: RadiometricDatingConstants, out: Primitive[]): void {
  const yTop = PLOT.perRatio + PLOT.axisOvershoot;
  const xEnd = PLOT.endHalfLives * PLOT.perHalfLife;
  line('axes', [[0, yTop], [0, 0], [xEnd, 0]], AXIS_PX, 1, MUTED, out);
  out.push(label('axis-ratio', 'label.axisRatio', { world: [0, yTop], offset: [0, -AXIS_LABEL_GAP] }, AXIS_LABEL_PX, 'left', 1, MUTED));
  out.push(label('axis-time', 'label.axisTime', { world: [xEnd, 0], offset: [0, AXIS_LABEL_GAP] }, AXIS_LABEL_PX, 'right', 1, MUTED));

  // 가로축 눈금 — 반감기 경계마다. 수는 띄우지 않는다: 읽는 것은 되짚는 화살표의 개수다.
  const ticks: Vec2[][] = [];
  for (let n = 1; n <= Math.floor(PLOT.endHalfLives); n++) {
    const [x] = plotPoint(n, 0);
    ticks.push([[x, 0], [x, -TICK_LEN]]);
  }
  // 세로축 눈금 — 반감기마다의 비율 1, 1/2, … 과 측정 비율.
  const whole = Math.floor(k.halfLives);
  for (let n = 0; n <= whole; n++) {
    const [, y] = plotPoint(0, remaining(n));
    ticks.push([[0, y], [-TICK_LEN, y]]);
  }
  const [, yr] = plotPoint(0, ratioOf(k));
  ticks.push([[0, yr], [-TICK_LEN, yr]]);
  const tickSet: LineSet = { type: 'lineSet', id: 'ticks', lines: ticks, width: TICK_PX, style: MUTED };
  out.push(tickSet);

  // 세로축 눈금 글자. 측정 비율의 글자는 여기 두지 않는다 — 읽기 선이 막대에서 세로축을 지나며
  // 그 자리를 가로지른다. 측정 비율은 시료 막대 왼쪽에 선언값으로 붙인다(`sampleBar`).
  for (let n = 0; n <= whole; n++) {
    if (n === k.halfLives) continue;
    const [, y] = plotPoint(0, remaining(n));
    const anchor: Readout['anchor'] = { world: [-TICK_LEN, y], offset: [-TICK_LABEL_GAP, 0] };
    if (n === 0) out.push(label('tick-one', 'label.one', anchor, TICK_LABEL_PX, 'right', 1, MUTED));
    // 1/2ⁿ 의 분모 — 2 의 거듭제곱이라 정수로 떨어진다(반올림하지 않는다).
    else out.push(label(`tick-${n}`, 'label.fraction', anchor, TICK_LABEL_PX, 'right', 1, MUTED, { n: 1, d: Math.pow(2, n) }));
  }

  const curve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) curve.push(curvePoint((PLOT.endHalfLives * i) / CURVE_SAMPLES));
  line('decay-curve', curve, CURVE_PX, 1, INK, out);
}

/** 시료 막대 — 테두리 = 살아 있을 때(1), 채움 = 시료에 남은 몫. */
function sampleBar(k: RadiometricDatingConstants, out: Primitive[]): void {
  const top = PLOT.perRatio;
  const fillTop = ratioOf(k) * PLOT.perRatio;
  const frame: Trajectory = {
    type: 'trajectory',
    id: 'alive-frame',
    points: [[BAR.x0, 0], [BAR.x1, 0], [BAR.x1, top], [BAR.x0, top]],
    closed: true,
    width: BAR_FRAME_PX,
    style: MUTED,
  };
  out.push(frame);
  const fill: Region = {
    type: 'region',
    id: 'sample-fill',
    points: [[BAR.x0, 0], [BAR.x1, 0], [BAR.x1, fillTop], [BAR.x0, fillTop]],
    fillOpacity: SAMPLE_FILL_OPACITY,
    outline: [[2, 3]],
    style: INK,
  };
  out.push(fill);
  const mid = (BAR.x0 + BAR.x1) / 2;
  out.push(label('alive-name', 'label.alive', { world: [mid, top], offset: [0, -BAR_LABEL_GAP] }, BAR_LABEL_PX, 'center', 1, MUTED));
  // 측정 비율 — 채움 위 끝 높이, 막대 왼쪽. 선언한 분자 · 분모 그대로.
  out.push(
    label('sample-ratio', 'label.fraction', { world: [BAR.x0, fillTop], offset: [-TICK_LABEL_GAP, 0] }, BAR_LABEL_PX, 'right', 1, INK, {
      n: k.ratioNumerator,
      d: k.ratioDenominator,
    }),
  );
  out.push(label('sample-name', 'label.sample', { world: [mid, 0], offset: [0, BAR_LABEL_GAP] }, BAR_LABEL_PX, 'center', 1, INK));
}

export function scene(params: {
  state: RadiometricDatingState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('radiometric-dating: schema.timeline 이 선언되어야 한다');
  const k = readConstants(params.stage);

  const level = tl.at('level');
  const meet = tl.at('meet');
  const drop = tl.at('drop');
  const ageIn = tl.at('age-in');
  const keep = 1 - tl.at('clear');
  const out: Primitive[] = [];

  plot(k, out);
  sampleBar(k, out);

  // ================= 읽는 경로 =================
  const read = curvePoint(k.halfLives);
  const barTop: Vec2 = [BAR.x1, read[1]];

  // 채움 높이에서 가로로 곡선까지.
  if (level > 0) line('read-level', [barTop, [lerp(barTop[0], read[0], level), read[1]]], READ_PX, keep, ACCENT, out);
  // 곡선에서 곧장 가로축까지.
  if (drop > 0) line('read-drop', [read, [read[0], lerp(read[1], 0, drop)]], READ_PX, keep, ACCENT, out);

  // 거꾸로 되짚기 — 반감기 하나씩. 화살표는 가로축 아래, 점은 곡선을 거슬러 오른다.
  let dotAt = k.halfLives;
  HOP_PHASES.forEach((phase, i) => {
    const grow = tl.at(phase);
    if (grow <= 0) return;
    const [from, to] = hopRange(k, i);
    dotAt = lerp(from, to, grow);
    const [x0] = plotPoint(from, 0);
    const [x1] = plotPoint(to, 0);
    const hop: Vector = {
      type: 'vector',
      id: `hop-${i + 1}`,
      from: [x0, -HOP_DROP],
      delta: [(x1 - x0) * grow, 0],
      width: HOP_PX,
      opacity: keep,
      style: ACCENT,
    };
    out.push(hop);
    // 온전한 반감기 하나일 때만 년 수를 붙인다 — 짧은 마지막 걸음에 반감기 값을 붙이면 거짓이다.
    if (from - to === 1) {
      out.push(
        label(`hop-${i + 1}-years`, 'label.halfLife', { world: [(x0 + x1) / 2, -HOP_DROP], offset: [0, HOP_LABEL_GAP] }, HOP_LABEL_PX, 'center', grow * keep, ACCENT, {
          half: k.halfLifeYears,
        }),
      );
    }
    // 되짚어 닿은 자리 — 비율이 두 배가 된 높이를 세로축 · 가로축까지 옅게 잇는다.
    if (to > 0) {
      const land = curvePoint(to);
      line(`hop-${i + 1}-guide-level`, [[0, land[1]], land], GUIDE_PX, GUIDE_OPACITY * grow * keep, { ...MUTED, lineStyle: 'dotted' }, out);
      line(`hop-${i + 1}-guide-drop`, [land, [land[0], 0]], GUIDE_PX, GUIDE_OPACITY * grow * keep, { ...MUTED, lineStyle: 'dotted' }, out);
    }
  });

  // 읽기 점 — 곡선에 닿은 순간 서고, 되짚는 동안 곡선을 거슬러 오른다.
  if (meet > 0) {
    const dot: Body = {
      type: 'body',
      id: 'read-dot',
      shape: 'circle',
      pos: curvePoint(dotAt),
      size: DOT_R,
      outline: 'background',
      glow: false,
      opacity: meet * keep,
      style: ACCENT,
    };
    out.push(dot);
  }

  // 읽어 낸 연대 — 내려온 자리 아래.
  if (ageIn > 0) {
    out.push(label('age', 'label.age', { world: [read[0], AGE_Y] }, AGE_PX, 'center', ageIn * keep, ACCENT, { age: k.ageYears }, 'bold'));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
