// ========================================================================
// reference-frame — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 땅선·전봇대·사람·자취 곡선(trajectory) · 기차 칸·바퀴·공(body) · 자취 점(trace) ·
// 판 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 원본 좌표(아래로 +)를 월드(위로 +)로 옮길 때 y 만 뒤집는다. 두 판은 한 월드에
// 나란히 놓이고, 판마다 모든 인스턴스에 `clip` 을 걸어 경계 밖으로 넘친 칸·전봇대를
// 자른다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { ballY, groundHandX, groundTraceX, readDrop, type Drop } from './physics';
import {
  BALL_R,
  CAR_LEN,
  CAR_SPACING,
  CAR_TOP,
  FLOOR_Y,
  GAP,
  GROUND_Y,
  H,
  HAND_IN_CAR,
  HAND_Y,
  PANEL_H,
  PANEL_W,
  POLE_SHIFT,
  POLE_SPACING,
  RIDER_IN_CAR,
  START_AT,
  TRACE_DT,
  TRAIN_CAR_X,
  V,
  W,
  text,
} from './schema';
import type { ReferenceFrameState } from './state';

// ------------------------------------------------------------------------
// 원본 그리기 치수 (px)
// ------------------------------------------------------------------------

/** 땅선 굵기. */
const GROUND_WIDTH = 2;
/** 전봇대 굵기 · 꼭대기 · 가로대 높이 · 가로대 반폭. */
const POLE_WIDTH = 3;
const POLE_TOP = 150;
const POLE_ARM_Y = 156;
const POLE_ARM_HALF = 8;
/** 칸 윤곽 굵기. */
const CAR_STROKE = 2;
/** 바퀴 — 칸 양끝에서 안쪽으로, y, 반지름. */
const WHEEL_INSET = 50;
const WHEEL_Y = 208;
const WHEEL_R = 8;
/**
 * 칸 채움의 빛의 양. 원본은 바탕(#fbfaf7)보다 살짝 짙은 무채색(#f1eee7)이었다.
 * 색 리터럴 대신 칸 윤곽과 같은 무채색 역할을 바탕 쪽으로 옅게 섞는다 (C2).
 */
const CAR_FILL_LUMINANCE = 0.1;
/** 사람 — 머리 중심 y · 반지름, 목 · 어깨 · 엉덩이 y, 다리 벌림, 선 굵기. */
const HEAD_Y = 112;
const HEAD_R = 9;
const NECK_Y = 121;
const SHOULDER_Y = 132;
const HIP_Y = 168;
const LEG_SPREAD = 9;
const RIDER_WIDTH = 2.5;
/** 머리 원을 닫힌 선으로 근사할 때의 꼭짓점 수. */
const HEAD_SEGMENTS = 28;
/** 자취 — 점 반지름, 점 알파, 곡선 알파, 곡선 굵기, 곡선 분할 수. */
const TRACE_DOT_R = 3;
const TRACE_DOT_ALPHA = 0.45;
const TRACE_LINE_ALPHA = 0.3;
const TRACE_LINE_WIDTH = 1.5;
const TRACE_LINE_SEGMENTS = 40;
/** 판 이름표 — 판 오른쪽 끝에서 들어온 거리, 윗줄 y, 글자 크기. */
const LABEL_INSET_GROUND = 110;
const LABEL_INSET_TRAIN = 124;
const LABEL_TOP = 12;
const LABEL_FONT = 14;
/** 판 경계 — 위아래 여백, 굵기, 옅기(원본 #dcd8cf 는 전봇대보다 한 겹 옅다). */
const DIVIDER_INSET = 8;
const DIVIDER_WIDTH = 1;
const DIVIDER_OPACITY = 0.6;

/** 원본 좌표 → 월드. 판의 가로 원점을 더하고 y 를 뒤집는다. */
function at(x0: number, x: number, y: number): Vec2 {
  return [x0 + x, -y];
}

type Clip = { min: Vec2; max: Vec2 };

/** 판 하나의 자르기 사각형. */
function panelClip(x0: number): Clip {
  return { min: [x0, -PANEL_H], max: [x0 + PANEL_W, 0] };
}

function line(
  id: string,
  pts: readonly Vec2[],
  width: number,
  style: Trajectory['style'],
  clip: Clip,
  extra: Partial<Trajectory> = {},
): Trajectory {
  return { type: 'trajectory', id, points: pts, width, style, clip, ...extra };
}

// ------------------------------------------------------------------------
// 판 안의 것들
// ------------------------------------------------------------------------

function groundAndPoles(out: Primitive[], p: string, x0: number, shift: number, clip: Clip): void {
  const mod = (a: number, m: number): number => ((a % m) + m) % m;
  const poleStyle: Trajectory['style'] = { colorRole: 'muted', emphasis: 'subtle' };
  let k = 0;
  for (let x = mod(shift, POLE_SPACING) - POLE_SPACING; x < PANEL_W + POLE_SPACING; x += POLE_SPACING) {
    out.push(line(`${p}-pole-${k}`, [at(x0, x, GROUND_Y), at(x0, x, POLE_TOP)], POLE_WIDTH, poleStyle, clip));
    out.push(
      line(
        `${p}-pole-arm-${k}`,
        [at(x0, x - POLE_ARM_HALF, POLE_ARM_Y), at(x0, x + POLE_ARM_HALF, POLE_ARM_Y)],
        POLE_WIDTH,
        poleStyle,
        clip,
      ),
    );
    k++;
  }
  out.push(
    line(`${p}-ground`, [at(x0, 0, GROUND_Y), at(x0, PANEL_W, GROUND_Y)], GROUND_WIDTH, {
      colorRole: 'muted',
      emphasis: 'medium',
    }, clip),
  );
}

function carAndRider(out: Primitive[], id: string, x0: number, cx: number, clip: Clip): void {
  const carStyle: Body['style'] = { colorRole: 'muted', emphasis: 'strong' };
  // 칸 채움 — 윤곽은 따로 긋는다. body 의 윤곽은 굵기를 고를 수 없다 (NOTES 「어휘 부족」).
  const fill: Body = {
    type: 'body',
    id: `${id}-fill`,
    shape: 'rect',
    pos: at(x0, cx + CAR_LEN / 2, (CAR_TOP + FLOOR_Y) / 2),
    size: [CAR_LEN, FLOOR_Y - CAR_TOP],
    fill: 'solid',
    outline: 'none',
    luminance: CAR_FILL_LUMINANCE,
    style: carStyle,
    clip,
  };
  out.push(fill);
  out.push(
    line(
      `${id}-outline`,
      [at(x0, cx, CAR_TOP), at(x0, cx + CAR_LEN, CAR_TOP), at(x0, cx + CAR_LEN, FLOOR_Y), at(x0, cx, FLOOR_Y)],
      CAR_STROKE,
      carStyle,
      clip,
      { closed: true },
    ),
  );
  [cx + WHEEL_INSET, cx + CAR_LEN - WHEEL_INSET].forEach((wx, i) => {
    const wheel: Body = {
      type: 'body',
      id: `${id}-wheel-${i}`,
      shape: 'circle',
      pos: at(x0, wx, WHEEL_Y),
      size: WHEEL_R,
      fill: 'solid',
      outline: 'none',
      glow: false,
      style: carStyle,
      clip,
    };
    out.push(wheel);
  });

  // 사람 — 선으로 그린다. 머리는 원 윤곽인데 body 윤곽 굵기가 1 로 고정이라 닫힌 선으로 근사한다.
  const bx = cx + RIDER_IN_CAR;
  const hx = cx + HAND_IN_CAR;
  const ink: Trajectory['style'] = { colorRole: 'ink', emphasis: 'strong' };
  const head: Vec2[] = [];
  for (let i = 0; i < HEAD_SEGMENTS; i++) {
    const a = (i / HEAD_SEGMENTS) * Math.PI * 2;
    head.push(at(x0, bx + HEAD_R * Math.cos(a), HEAD_Y + HEAD_R * Math.sin(a)));
  }
  out.push(line(`${id}-rider-head`, head, RIDER_WIDTH, ink, clip, { closed: true }));
  out.push(line(`${id}-rider-body`, [at(x0, bx, NECK_Y), at(x0, bx, HIP_Y)], RIDER_WIDTH, ink, clip));
  out.push(
    line(
      `${id}-rider-legs`,
      [at(x0, bx - LEG_SPREAD, FLOOR_Y), at(x0, bx, HIP_Y), at(x0, bx + LEG_SPREAD, FLOOR_Y)],
      RIDER_WIDTH,
      ink,
      clip,
    ),
  );
  out.push(
    line(`${id}-rider-arm`, [at(x0, bx, SHOULDER_Y), at(x0, hx, HAND_Y + BALL_R + 2)], RIDER_WIDTH, ink, clip),
  );
}

/** 자취 — 놓은 뒤 TRACE_DT 마다 공이 있던 자리와 옅은 곡선. xOf(s) 가 관찰자에 따른 가로 위치. */
function trace(out: Primitive[], p: string, x0: number, d: Drop, xOf: (s: number) => number, clip: Clip): void {
  if (!d.released) return;
  // 공과 두 판의 자취는 같은 대상이라 같은 색 하나다.
  const style = { colorRole: 'primary', emphasis: 'strong' } as const;
  const marks: { pos: Vec2 }[] = [];
  for (let k = 0; k * TRACE_DT <= d.s + 1e-9; k++) {
    const s = k * TRACE_DT;
    marks.push({ pos: at(x0, xOf(s), ballY(s)) });
  }
  const dots: Trace = {
    type: 'trace',
    id: `${p}-trace-dots`,
    marks,
    shape: 'dot',
    size: TRACE_DOT_R,
    style,
    opacity: TRACE_DOT_ALPHA * d.alpha,
    clip,
  };
  out.push(dots);

  const pts: Vec2[] = [];
  for (let i = 0; i <= TRACE_LINE_SEGMENTS; i++) {
    const s = (d.s * i) / TRACE_LINE_SEGMENTS;
    pts.push(at(x0, xOf(s), ballY(s)));
  }
  out.push(
    line(`${p}-trace-line`, pts, TRACE_LINE_WIDTH, style, clip, { opacity: TRACE_LINE_ALPHA * d.alpha }),
  );
}

function ball(id: string, x0: number, x: number, d: Drop, clip: Clip): Body {
  return {
    type: 'body',
    id,
    shape: 'circle',
    pos: at(x0, x, d.y),
    size: BALL_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
    opacity: d.alpha,
    clip,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: ReferenceFrameState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('reference-frame: schema.timeline 이 선언되어야 한다');
  const d = readDrop(tl);
  const out: Primitive[] = [];

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`).

  // ── 왼쪽: 땅에 서서 본 화면 (땅이 멈춰 있다) ──
  const gx0 = 0;
  const gClip = panelClip(gx0);
  const handX = groundHandX(tl);
  const carX = handX - HAND_IN_CAR;
  groundAndPoles(out, 'ground', gx0, POLE_SHIFT, gClip);
  for (const i of [-1, 0, 1]) carAndRider(out, `ground-car${i + 1}`, gx0, carX + i * CAR_SPACING, gClip);
  trace(out, 'ground', gx0, d, groundTraceX, gClip);
  // 공은 기차와 같은 가로 속력을 지니므로 놓기 전·낙하 중·착지 후 모두 손의 가로 위치에 있다.
  out.push(ball('ground-ball', gx0, handX, d, gClip));

  // ── 오른쪽: 기차에 타고 본 화면 (기차가 멈춰 있다) ──
  const tx0 = PANEL_W + GAP;
  const tClip = panelClip(tx0);
  // 땅은 주기와 무관하게 흘러간다 — 원본은 주기 위상이 아니라 페이지 시계(앞당기기 전)를 썼다.
  groundAndPoles(out, 'train', tx0, POLE_SHIFT - V * (tl.t - START_AT), tClip);
  carAndRider(out, 'train-car', tx0, TRAIN_CAR_X, tClip);
  const trainHandX = TRAIN_CAR_X + HAND_IN_CAR;
  trace(out, 'train', tx0, d, () => trainHandX, tClip);
  out.push(ball('train-ball', tx0, trainHandX, d, tClip));

  // ── 판 이름표 ──
  // 원본은 윗줄 기준(top)으로 놓았다. readout 의 월드 앵커는 가운데 줄 기준이라 반 글자 내린다.
  const labelY = LABEL_TOP + LABEL_FONT / 2;
  out.push({
    type: 'readout',
    id: 'label-ground',
    anchor: { world: at(gx0, PANEL_W - LABEL_INSET_GROUND, labelY) },
    text: text('label.ground'),
    chip: false,
    align: 'left',
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_FONT,
    style: { colorRole: 'muted', emphasis: 'strong' },
    clip: gClip,
  });
  out.push({
    type: 'readout',
    id: 'label-train',
    anchor: { world: at(tx0, PANEL_W - LABEL_INSET_TRAIN, labelY) },
    text: text('label.train'),
    chip: false,
    align: 'left',
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_FONT,
    style: { colorRole: 'muted', emphasis: 'strong' },
    clip: tClip,
  });

  // ── 판 경계 ── 두 판 사이 틈에 있어 어느 판에도 속하지 않는다.
  out.push({
    type: 'trajectory',
    id: 'divider',
    points: [at(0, PANEL_W + GAP / 2, DIVIDER_INSET), at(0, PANEL_W + GAP / 2, PANEL_H - DIVIDER_INSET)],
    width: DIVIDER_WIDTH,
    style: { colorRole: 'muted', emphasis: 'subtle' },
    opacity: DIVIDER_OPACITY,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 논리 캔버스 전체. 프레이밍은 주장의 일부라 매 프레임 같은 값이다. */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: W, minY: -H, maxY: 0 };
}
