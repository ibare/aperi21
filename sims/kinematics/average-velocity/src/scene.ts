// ========================================================================
// average-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// ---- 한 월드 ----
// 월드는 원본 캔버스(900 × 330 px)를 1/100 로 줄여 y 를 위로 뒤집은 것이다. 그래서
// 아래 `REF` 의 숫자는 원본 `draw()` 의 배치 값과 같다. 그래프의 시간·위치와 곁의
// 세로 도로가 **같은 py** 를 공유한다 — 도로가 위치축과 같은 눈금인 것이 이 조각의
// 전제다.
//
// ---- `graph` 를 쓰지 않은 이유 ----
// `graph` 는 화면 카드로 떠서 월드에 있는 띠 · 직선 · 곁 도로와 좌표를 공유하지 못한다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import { intervalFrom, position } from './physics';
import {
  CURVE_SAMPLES,
  LINE_EXTEND,
  text,
  T_MAX,
  T_MIN,
  X_MAX,
  X_MIN,
  type AverageVelocityMessageKey,
} from './schema';
import type { AverageVelocityState } from './state';

// ------------------------------------------------------------------------
// 자리 — 원본 배치 픽셀 그대로
// ------------------------------------------------------------------------

/** 원본 배치(px). 보고서 폭 900 에서 캔버스는 900 × 330 이고 `gR = W − 28`. */
const REF = {
  width: 900,
  height: 330,
  /** 그래프가 담는 세로 끝 — 축 이름 `시간 (s)` 의 아랫줄까지. 캡션은 슬롯이 그 아래에 둔다. */
  contentBottom: 304,
  roadX: 56,
  gL: 128,
  gR: 872,
  gT: 18,
  gB: 262,
  /** 눈금 길이. */
  tick: 4,
  /** 도로 굵기와 옅기. */
  roadWidth: 10,
  roadAlpha: 0.25,
  /** 안내선이 도로에서 떨어져 시작하는 거리. */
  guideGap: 8,
  /** 곡선 · 직선 · 연장선 · 화살표 굵기. */
  curveWidth: 2.5,
  lineWidth: 3,
  extendWidth: 1.5,
  extendAlpha: 0.45,
  arrowWidth: 2.5,
  /** 화살촉 길이. */
  arrowHead: 10,
  /** 이보다 짧은 변위는 화살표 대신 점 둘. */
  arrowMin: 10,
  /** 끝 점 · 도로 위 점 반지름. */
  endDot: 5,
  roadDot: 4,
  /** 안내선 · 축 · 삼각형 굵기. */
  hair: 1,
  /** 글자. 원본 12 px. 기준선 'top' 을 가운데 기준으로 옮기려고 반 줄(6)을 더한다. */
  fontSize: 12,
  halfLine: 6,
  /** 구간 띠의 세기. 원본 FAINT(#e8e4da)는 배경보다 한 톤 짙은 정도다. */
  bandFill: 0.11,
} as const;

/** 원본 1 px 이 월드로 얼마인가. */
const PX = 1 / 100;
/** 원본 캔버스 x(px) → 월드 x. */
const wx = (n: number): number => n * PX;
/** 원본 캔버스 y(px) → 월드 y. 위가 자란다. */
const wy = (n: number): number => (REF.height - n) * PX;

/** 시각(초) → 원본 px. */
const pxT = (tau: number): number => REF.gL + ((tau - T_MIN) / (T_MAX - T_MIN)) * (REF.gR - REF.gL);
/** 위치(m) → 원본 px. */
const pyX = (pos: number): number => REF.gB - ((pos - X_MIN) / (X_MAX - X_MIN)) * (REF.gB - REF.gT);
/** (시각, 위치) → 월드. */
const G = (tau: number, pos: number): Vec2 => [wx(pxT(tau)), wy(pyX(pos))];

// ------------------------------------------------------------------------
// 색 — 강조색은 '두 끝을 잇는 직선' 한 가지 뜻
// ------------------------------------------------------------------------

/** 곡선 · 끝 점 · 변위 화살표. 원본 INK. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 축 · 눈금 · 안내선 · 삼각형 · 도로. 원본 MUTED. */
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 두 끝을 잇는 직선. 원본 ACCENT. */
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 선언 도우미
// ------------------------------------------------------------------------

function line(
  id: string,
  points: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  opacity = 1,
): Trajectory {
  return { type: 'trajectory', id, points, width, style, opacity };
}

/** 원본의 `textBaseline` 기준 글자를 월드에 붙인다. y 는 글자 한가운데의 원본 px. */
function label(
  id: string,
  x: number,
  y: number,
  align: NonNullable<Readout['align']>,
  key: AverageVelocityMessageKey,
  vars?: Record<string, string>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: [wx(x), wy(y)] },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    align,
    font: 'text',
    fontSize: REF.fontSize,
    style: MUTED,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: AverageVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('average-velocity: schema.timeline 이 선언되어야 한다');

  const { a, b } = intervalFrom((id) => timeline.at(id));
  const xa = position(a);
  const xb = position(b);
  const out: Primitive[] = [];

  // ---- 구간 띠 ----
  const band: Region = {
    type: 'region',
    id: 'band',
    points: [
      [wx(pxT(a)), wy(REF.gT)],
      [wx(pxT(b)), wy(REF.gT)],
      [wx(pxT(b)), wy(REF.gB)],
      [wx(pxT(a)), wy(REF.gB)],
    ],
    fillOpacity: REF.bandFill,
    opaque: true,
    style: MUTED,
  };
  out.push(band);

  // ---- 축 ----
  out.push(
    line(
      'axes',
      [
        [wx(REF.gL), wy(REF.gT)],
        [wx(REF.gL), wy(REF.gB)],
        [wx(REF.gR), wy(REF.gB)],
      ],
      REF.hair,
      MUTED,
    ),
  );
  const timeTicks: number[] = [];
  for (let s = 0; s <= 10; s += 2) timeTicks.push(s);
  const posTicks: number[] = [];
  for (let m = 0; m <= 30; m += 10) posTicks.push(m);

  // 눈금 금은 자국(`trace` tick)이다. 가운데 기준이라 반 길이만큼 밖으로 옮긴다.
  const ticks: Trace = {
    type: 'trace',
    id: 'ticks',
    shape: 'tick',
    size: wx(REF.tick),
    width: REF.hair,
    marks: [
      ...timeTicks.map((s) => ({
        pos: [wx(pxT(s)), wy(REF.gB + REF.tick / 2)] as Vec2,
        direction: [0, 1] as Vec2,
      })),
      ...posTicks.map((m) => ({
        pos: [wx(REF.gL - REF.tick / 2), wy(pyX(m))] as Vec2,
        direction: [1, 0] as Vec2,
      })),
    ],
    style: MUTED,
  };
  out.push(ticks);
  for (const s of timeTicks) {
    out.push(label(`tick-t-${s}`, pxT(s), REF.gB + 7 + REF.halfLine, 'center', 'label.tick', { v: String(s) }));
  }
  out.push(label('axis-time', REF.gR, REF.gB + 22 + REF.halfLine, 'right', 'label.timeAxis'));
  for (const m of posTicks) {
    out.push(label(`tick-x-${m}`, REF.gL - 7, pyX(m), 'right', 'label.tick', { v: String(m) }));
  }
  out.push(label('axis-position', REF.gL + 6, REF.gT - 2 + REF.halfLine, 'left', 'label.positionAxis'));

  // ---- 도로 ----
  out.push(
    line(
      'road',
      [
        [wx(REF.roadX), wy(pyX(X_MIN))],
        [wx(REF.roadX), wy(pyX(X_MAX))],
      ],
      REF.roadWidth,
      MUTED,
      REF.roadAlpha,
    ),
  );
  out.push(label('road-label', REF.roadX, REF.gB + 7 + REF.halfLine, 'center', 'label.road'));

  // ---- 위치 안내선 ----
  out.push(
    line('guide-a', [[wx(REF.roadX + REF.guideGap), wy(pyX(xa))], G(a, xa)], REF.hair, {
      ...MUTED,
      lineStyle: 'dashed',
    }),
  );
  out.push(
    line('guide-b', [[wx(REF.roadX + REF.guideGap), wy(pyX(xb))], G(b, xb)], REF.hair, {
      ...MUTED,
      lineStyle: 'dashed',
    }),
  );

  // ---- 위치-시간 곡선 ----
  const curve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const tau = T_MIN + ((T_MAX - T_MIN) * i) / CURVE_SAMPLES;
    curve.push(G(tau, position(tau)));
  }
  out.push(line('curve', curve, REF.curveWidth, INK));

  // ---- 기울기 삼각형 ----
  out.push(line('triangle', [G(a, xa), G(b, xa), G(b, xb)], REF.hair, MUTED));

  // ---- 두 끝을 잇는 직선 ----
  // 구간 밖으로 조금 연장해 기울기가 눈에 띄게 한다. 옅은 연장과 진한 본선은 경계가
  // 또렷해야 해서 인스턴스 둘이다.
  const slope = b > a ? (xb - xa) / (b - a) : 0;
  const t0 = Math.max(T_MIN, a - LINE_EXTEND);
  const t1 = Math.min(T_MAX, b + LINE_EXTEND);
  out.push(
    line(
      'secant-extend',
      [G(t0, xa + slope * (t0 - a)), G(t1, xa + slope * (t1 - a))],
      REF.extendWidth,
      ACCENT,
      REF.extendAlpha,
    ),
  );
  out.push(line('secant', [G(a, xa), G(b, xb)], REF.lineWidth, ACCENT));

  // ---- 구간 양 끝 점 ----
  const ends: Trace = {
    type: 'trace',
    id: 'ends',
    shape: 'dot',
    size: REF.endDot,
    marks: [{ pos: G(a, xa) }, { pos: G(b, xb) }],
    style: INK,
  };
  out.push(ends);

  // ---- 변위 화살표 ----
  const y0 = pyX(xa);
  const y1 = pyX(xb);
  const long = Math.abs(y1 - y0) > REF.arrowMin;
  const roadDots: Vec2[] = [[wx(REF.roadX), wy(y0)]];
  if (!long) roadDots.push([wx(REF.roadX), wy(y1)]);
  // 원본 순서 — 시작 위치의 점을 먼저, 그 위에 화살표.
  out.push({
    type: 'trace',
    id: 'road-dots',
    shape: 'dot',
    size: REF.roadDot,
    marks: roadDots.map((pos) => ({ pos })),
    style: INK,
  });
  if (long) {
    const arrow: Vector = {
      type: 'vector',
      id: 'displacement',
      from: [wx(REF.roadX), wy(y0)],
      delta: [0, wy(y1) - wy(y0)],
      headSize: wx(REF.arrowHead),
      width: REF.arrowWidth,
      style: INK,
    };
    out.push(arrow);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계 — 원본 캔버스의 가로 전체와 축 이름까지의 세로. 매 프레임 같은 값이다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: wx(0),
    maxX: wx(REF.width),
    minY: wy(REF.contentBottom),
    maxY: wy(0),
  };
}
