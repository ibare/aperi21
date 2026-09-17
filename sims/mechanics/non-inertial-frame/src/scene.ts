// ========================================================================
// non-inertial-frame — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 길 · 버스 윤곽 · 바닥 · 바퀴 살 · 점선(trajectory) · 버스 몸체 · 창 · 바퀴 · 공(body) ·
// 길가 눈금 · 지점 표식(trace tick) · 판 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 원본 좌표(아래로 +)를 월드(위로 +)로 옮길 때 y 만 뒤집는다. 두 판은 한 월드에 위아래로
// 놓이고, 판마다 모든 인스턴스에 `clip` 을 건다 — 아래 판의 길 눈금이 흘러 캔버스
// 가로 끝을 넘는다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { readRide } from './physics';
import {
  BALL_R,
  BALL_START,
  BUS_H,
  BUS_LEN,
  H,
  PANEL_SPLIT,
  POST_GAP,
  PPM,
  REAR0,
  ROAD_Y_BUS,
  ROAD_Y_GROUND,
  W,
  X0,
  text,
  type NonInertialFrameMessageKey,
} from './schema';
import type { NonInertialFrameState } from './state';

// ------------------------------------------------------------------------
// 원본 그리기 치수 (px)
// ------------------------------------------------------------------------

/** 길 선 — 길 높이에서 내린 거리, 굵기. */
const ROAD_DROP = 12;
const ROAD_WIDTH = 2;
/** 길가 눈금 — 길 선에서 아래로 12..22, 굵기. 눈금을 만드는 세계 범위(m). */
const POST_FROM = 12;
const POST_TO = 22;
const POST_WIDTH = 1.5;
const POST_RANGE: readonly [number, number] = [-20, 60];
/** 화면 밖 눈금을 거르는 여유. */
const POST_CULL = 5;
/** 공이 놓였던 지점 — 점선(아래 끝 y+22, 위 끝 버스 높이), 표식(y+12..24, 굵기 3). */
const SPOT_DASH_FROM = 22;
const SPOT_DASH_WIDTH = 1.5;
const SPOT_TICK_FROM = 12;
const SPOT_TICK_TO = 24;
const SPOT_TICK_WIDTH = 3;
/** 버스 — 바닥 높이(m, 길 위), 몸체가 옆으로 삐져나온 폭, 바닥 아래로 내려온 폭, 모서리, 선 굵기. */
const FLOOR_UP = 1.0;
const BODY_SIDE = 6;
const BODY_SKIRT = 22;
const BODY_CORNER = 10;
const BUS_STROKE = 2;
/** 모서리 하나를 닫힌 선으로 근사할 때의 분할 수. */
const CORNER_SEGMENTS = 8;
/** 창 — 개수, 몸체 안쪽 여백, 창 사이 반틈, 위 여백, 높이(m). */
const WINDOWS = 4;
const WINDOW_INSET = 14;
const WINDOW_GAP = 4;
const WINDOW_TOP = 10;
const WINDOW_H = 0.8;
/** 바퀴 — 반지름(m), 뒷벽·앞벽에서 들어온 자리(m), 살 길이 비, 살 굵기. */
const WHEEL_R = 0.45;
const WHEEL_INSET = 1.8;
const SPOKE_REACH = 0.7;
const SPOKE_WIDTH = 2;
/** 공이 바닥에서 뜬 거리(px). */
const BALL_LIFT = 1;
/** 판 이름표 — 왼쪽 여백, 길 높이에서 올라간 윗줄, 글자 크기. */
const LABEL_LEFT = 12;
const LABEL_RISE = 150;
const LABEL_FONT = 14;

/**
 * 무채색의 빛의 양. 원본은 밝은 바탕 위 무채색 여러 톤이었다. 색 리터럴 대신 같은
 * 역할을 바탕 쪽으로 섞는다 (C2). 값은 원본 톤이 **원본 바탕과 벌어진 선형광의 차**를
 * 이 역할이 바탕과 벌어진 차로 나눈 것이다. 길 선과 바퀴는 그 비가 1 에
 * 닿아 섞지 않는다.
 */
const LUM = {
  /** 길가 눈금. */
  post: 0.7,
  /** 버스 몸체. */
  body: 0.16,
  /** 창. */
  window: 0.38,
  /** 바퀴 살 — 짙은 바퀴 위의 옅은 선. */
  spoke: 0.2,
} as const;

type Clip = { min: Vec2; max: Vec2 };

/** 원본 좌표 → 월드. y 만 뒤집는다. */
function at(x: number, y: number): Vec2 {
  return [x, -y];
}

/** 세계 가로(m) → 원본 가로(px). */
function sx(xm: number): number {
  return (xm - X0) * PPM;
}

interface Panel {
  id: string;
  roadY: number;
  label: NonInertialFrameMessageKey;
  clip: Clip;
}

const PANELS: readonly Panel[] = [
  { id: 'ground', roadY: ROAD_Y_GROUND, label: 'label.ground', clip: { min: [0, -PANEL_SPLIT], max: [W, 0] } },
  { id: 'bus', roadY: ROAD_Y_BUS, label: 'label.bus', clip: { min: [0, -H], max: [W, -PANEL_SPLIT] } },
];

// ------------------------------------------------------------------------
// 판 안의 것들
// ------------------------------------------------------------------------

function line(
  id: string,
  pts: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  v: Panel,
  alpha: number,
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: pts, width, style, clip: v.clip, opacity: alpha, ...extra };
}

/** 길과 길가 눈금. `shift` 는 판이 붙은 대상이 길 위에서 간 거리(m). */
function road(out: Primitive[], v: Panel, shift: number, alpha: number): void {
  const y = v.roadY;
  out.push(
    line(`${v.id}-road`, [at(0, y + ROAD_DROP), at(W, y + ROAD_DROP)], ROAD_WIDTH, { colorRole: 'muted', emphasis: 'strong' }, v, alpha),
  );
  const marks: Trace['marks'][number][] = [];
  for (let p = POST_RANGE[0]; p <= POST_RANGE[1]; p += POST_GAP) {
    if (p === REAR0 + BALL_START) continue; // 공이 놓인 지점은 따로 그린다
    const x = sx(p - shift);
    if (x < -POST_CULL || x > W + POST_CULL) continue;
    marks.push({ pos: at(x, y + (POST_FROM + POST_TO) / 2) });
  }
  const posts: Trace = {
    type: 'trace',
    id: `${v.id}-posts`,
    marks,
    shape: 'tick',
    size: POST_TO - POST_FROM,
    width: POST_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
    luminance: LUM.post,
    opacity: alpha,
    clip: v.clip,
  };
  out.push(posts);
}

/** 모서리가 둥근 사각형의 둘레 점 — 원본 좌표(아래로 +), 반시계. */
function roundRectPoints(left: number, top: number, w: number, h: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  const corner = (cx: number, cy: number, a0: number): void => {
    for (let i = 0; i <= CORNER_SEGMENTS; i++) {
      const a = a0 + (i / CORNER_SEGMENTS) * (Math.PI / 2);
      pts.push(at(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    }
  };
  corner(left + w - r, top + r, -Math.PI / 2);
  corner(left + w - r, top + h - r, 0);
  corner(left + r, top + h - r, Math.PI / 2);
  corner(left + r, top + r, Math.PI);
  return pts;
}

/** 월드 단위(y 위) 둥근 사각형 SVG 경로 — `pos` 가 가운데. */
function roundRectPath(w: number, h: number, r: number): string {
  const x = w / 2;
  const y = h / 2;
  return [
    `M ${-x + r} ${-y}`,
    `H ${x - r}`,
    `A ${r} ${r} 0 0 1 ${x} ${-y + r}`,
    `V ${y - r}`,
    `A ${r} ${r} 0 0 1 ${x - r} ${y}`,
    `H ${-x + r}`,
    `A ${r} ${r} 0 0 1 ${-x} ${y - r}`,
    `V ${-y + r}`,
    `A ${r} ${r} 0 0 1 ${-x + r} ${-y}`,
    'Z',
  ].join(' ');
}

/** 버스 옆 단면. `rear` 는 뒷벽의 세계 가로(m), `s` 는 간 거리(바퀴가 돈 각). 바닥 y 를 돌려준다. */
function bus(out: Primitive[], v: Panel, rear: number, s: number, alpha: number): number {
  const y = v.roadY;
  const floorY = y - FLOOR_UP * PPM;
  const left = sx(rear);
  const right = sx(rear + BUS_LEN);
  const top = floorY - BUS_H * PPM;
  const lineStyle: Trajectory['style'] = { colorRole: 'muted', emphasis: 'strong' };

  // 몸체 — 채움은 둥근 사각형 custom, 둘레는 굵기를 고를 수 있는 닫힌 선으로 따로 긋는다.
  const bw = right - left + BODY_SIDE * 2;
  const bh = floorY - top + BODY_SKIRT;
  const bl = left - BODY_SIDE;
  const fill: Body = {
    type: 'body',
    id: `${v.id}-bus-fill`,
    shape: 'custom',
    pos: at(bl + bw / 2, top + bh / 2),
    customPath: roundRectPath(bw, bh, BODY_CORNER),
    fill: 'solid',
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
    luminance: LUM.body,
    opacity: alpha,
    clip: v.clip,
  };
  out.push(fill);
  out.push(
    line(`${v.id}-bus-outline`, roundRectPoints(bl, top, bw, bh, BODY_CORNER), BUS_STROKE, lineStyle, v, alpha, {
      closed: true,
    }),
  );

  // 창
  const pitch = (right - left - WINDOW_INSET * 2) / WINDOWS;
  const wh = WINDOW_H * PPM;
  for (let i = 0; i < WINDOWS; i++) {
    const wx = left + WINDOW_INSET + i * pitch + WINDOW_GAP;
    const ww = pitch - WINDOW_GAP * 2;
    const pane: Body = {
      type: 'body',
      id: `${v.id}-bus-window-${i}`,
      shape: 'rect',
      pos: at(wx + ww / 2, top + WINDOW_TOP + wh / 2),
      size: [ww, wh],
      fill: 'solid',
      outline: 'none',
      style: { colorRole: 'muted', emphasis: 'strong' },
      luminance: LUM.window,
      opacity: alpha,
      clip: v.clip,
    };
    out.push(pane);
  }

  // 바닥
  out.push(line(`${v.id}-bus-floor`, [at(left, floorY), at(right, floorY)], BUS_STROKE, lineStyle, v, alpha));

  // 바퀴 — 간 거리만큼 돈다
  const wr = WHEEL_R * PPM;
  const ang = s / WHEEL_R;
  [rear + WHEEL_INSET, rear + BUS_LEN - WHEEL_INSET].forEach((wxm, i) => {
    const cx = sx(wxm);
    const cy = y + ROAD_DROP - wr;
    const wheel: Body = {
      type: 'body',
      id: `${v.id}-bus-wheel-${i}`,
      shape: 'circle',
      pos: at(cx, cy),
      size: wr,
      fill: 'solid',
      outline: 'none',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
      opacity: alpha,
      clip: v.clip,
    };
    out.push(wheel);
    const dx = Math.cos(ang) * wr * SPOKE_REACH;
    const dy = Math.sin(ang) * wr * SPOKE_REACH;
    out.push(
      line(
        `${v.id}-bus-spoke-${i}`,
        [at(cx - dx, cy + dy), at(cx + dx, cy - dy)],
        SPOKE_WIDTH,
        { colorRole: 'muted', emphasis: 'strong' },
        v,
        alpha,
        { luminance: LUM.spoke },
      ),
    );
  });

  return floorY;
}

/** 공이 처음 놓였던 길 위 지점 — 공과 같은 색의 점선과 길에 박힌 표식. */
function spot(out: Primitive[], v: Panel, shift: number, alpha: number): void {
  const x = sx(REAR0 + BALL_START - shift);
  const y = v.roadY;
  const style = { colorRole: 'primary', emphasis: 'strong' } as const;
  out.push(
    line(`${v.id}-spot-dash`, [at(x, y + SPOT_DASH_FROM), at(x, y - BUS_H * PPM)], SPOT_DASH_WIDTH, { ...style, lineStyle: 'dashed' }, v, alpha),
  );
  const tick: Trace = {
    type: 'trace',
    id: `${v.id}-spot-tick`,
    marks: [{ pos: at(x, y + (SPOT_TICK_FROM + SPOT_TICK_TO) / 2) }],
    shape: 'tick',
    size: SPOT_TICK_TO - SPOT_TICK_FROM,
    width: SPOT_TICK_WIDTH,
    style,
    opacity: alpha,
    clip: v.clip,
  };
  out.push(tick);
}

function ball(v: Panel, xm: number, floorY: number, alpha: number): Body {
  const r = BALL_R * PPM;
  return {
    type: 'body',
    id: `${v.id}-ball`,
    shape: 'circle',
    pos: at(sx(xm), floorY - r - BALL_LIFT),
    size: r,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
    opacity: alpha,
    clip: v.clip,
  };
}

function label(v: Panel): Readout {
  // 원본은 윗줄(top) 기준. readout 월드 앵커는 가운데 줄 기준이라 반 글자 내린다.
  return {
    type: 'readout',
    id: `${v.id}-label`,
    anchor: { world: at(LABEL_LEFT, v.roadY - LABEL_RISE + LABEL_FONT / 2) },
    text: text(v.label),
    chip: false,
    align: 'left',
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_FONT,
    style: { colorRole: 'ink', emphasis: 'strong' },
    clip: v.clip,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: NonInertialFrameState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('non-inertial-frame: schema.timeline 이 선언되어야 한다');
  const { s, ballRel, alpha } = readRide(tl);
  const [ground, onBus] = PANELS as [Panel, Panel];
  const out: Primitive[] = [];

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`).
  // 이름표는 흐려지지 않는다.
  out.push(label(ground), label(onBus));

  // ── 위: 길에 선 사람의 눈 (길이 멈춰 있다) ──
  road(out, ground, 0, alpha);
  const gFloor = bus(out, ground, REAR0 + s, s, alpha);
  spot(out, ground, 0, alpha);
  out.push(ball(ground, REAR0 + s + ballRel, gFloor, alpha));

  // ── 아래: 버스에 탄 사람의 눈 (버스가 멈춰 있다) ──
  road(out, onBus, s, alpha);
  const bFloor = bus(out, onBus, REAR0, s, alpha);
  spot(out, onBus, s, alpha);
  out.push(ball(onBus, REAR0 + ballRel, bFloor, alpha));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 논리 캔버스 전체와 그 아래 캡션 한 줄. 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: W, minY: -(H + 30), maxY: 0 };
}
