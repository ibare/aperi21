// ========================================================================
// trajectory-equation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 지면 · 경로 · 지우개 선은 `trajectory`, 눈금 점은
// `trace`, 시각 글자는 월드에 붙는 `readout`, 공은 `body`, 지우개 뒤 번짐은
// `region` 띠 여러 장으로 근사했다 (NOTES 「어휘 부족」).
//
// 상수(굵기 · 반지름 · 간격 · 옅기)는 원본 index.html 에서 그대로 가져왔다.
// ========================================================================

import type {
  Body,
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
  ViewDef,
} from '@aperi21/schema';

import {
  ballAlpha,
  eraserVisible,
  eraserX,
  flown,
  pathAlpha,
  posAt,
  tickAlpha,
  TICK_TIMES,
} from './physics';
import { ERASE_FADE_M, GROUND_OVERHANG, RANGE, SCENE_BOUNDS, TICK, text } from './schema';
import type { TrajectoryEquationState } from './state';

/** 원본 배율(px/m). 화면 px 로 적힌 원본 치수를 월드로 옮길 때만 쓴다. */
const ORIGINAL_PX_PER_M = 16.8;

/** 지면 굵기(화면 px). 원본 `lineWidth 1.5`. */
const GROUND_WIDTH_PX = 1.5;
/** 경로 굵기(화면 px). 원본 `lineWidth 2.5`. */
const PATH_WIDTH_PX = 2.5;
/** 경로를 샘플하는 마디 수. 원본 `n = 120`. */
const PATH_SAMPLES = 120;

/** 눈금 점 반지름(화면 px). 원본 `arc(…, 4, …)`. */
const TICK_DOT_PX = 4;
/** 시각 글자 크기(화면 px). 원본 `13px`. */
const TICK_FONT_PX = 13;
/**
 * 시각 글자 자리 — 점 위 9 px 에 글자 **아랫변**을 둔다(원본 `textBaseline bottom`).
 * readout 은 가운데 기준이라 글자 높이 절반을 더 올린다.
 */
const TICK_LABEL_OFFSET: Vec2 = [0, -9 - TICK_FONT_PX / 2];

/** 지우개 선 굵기(화면 px). 원본 `lineWidth 2`. */
const ERASER_WIDTH_PX = 2;
/**
 * 지우개 색의 세기. 원본은 바탕에 가까운 옅은 베이지(`--eraser`)를 쓴다. 테마에
 * 그런 역할이 없어 회색(`muted`)을 이만큼만 올려 같은 밝기를 낸다.
 */
const ERASER_LINE_OPACITY = 0.25;
/** 번짐 띠의 가장 짙은 쪽 채움. 원본 `globalAlpha 0.35` × 지우개 색을 t=4 대조 화면의 밝기로 맞춘 값. */
const ERASER_BAND_MAX = 0.18;
/** 번짐 띠를 나누는 장 수. 원본은 선형 그라데이션이다. */
const ERASER_BAND_STRIPS = 10;
/** 지우개 위끝. 원본은 캔버스 위에서 8 px — 지면(246 px)에서 238 px 위. */
const ERASER_TOP_M = 238 / ORIGINAL_PX_PER_M;

/** 공 반지름. 원본 7 px 를 원본 배율로 옮긴 월드 값. */
const BALL_R = 7 / ORIGINAL_PX_PER_M;

export function scene(params: {
  state: TrajectoryEquationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('trajectory-equation: schema.timeline 이 선언되어야 한다');

  const s = flown(tl);
  const pAlpha = pathAlpha(tl);
  const ex = eraserX(tl);
  const out: Primitive[] = [];

  // ---- 지면 ----
  // 발사 높이이자 착지 높이. 축이 아니라 무대다 — 눈금은 없다.
  const ground: Trajectory = {
    type: 'trajectory',
    id: 'ground',
    points: [
      [-GROUND_OVERHANG, 0],
      [RANGE + GROUND_OVERHANG, 0],
    ],
    width: GROUND_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(ground);

  // ---- 경로 ----
  // 지우개가 지나가도 한 픽셀도 변하지 않는다. 이것이 조각의 주장이다.
  if (pAlpha > 0 && s > 0) {
    const points: Vec2[] = [];
    for (let i = 0; i <= PATH_SAMPLES; i++) points.push(posAt((s * i) / PATH_SAMPLES));
    const path: Trajectory = {
      type: 'trajectory',
      id: 'path',
      points,
      width: PATH_WIDTH_PX,
      opacity: pAlpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(path);
  }

  // ---- 시각 눈금 ----
  // 경로에 딸린 부가 정보라 회색. 지우개가 지나간 자리부터 투명해진다.
  // 눈금마다 세기가 달라서 눈금마다 한 벌씩 선언한다 (NOTES 「어휘 부족」).
  for (const tk of TICK_TIMES) {
    if (tk > s + 1e-9) break;
    const pos = posAt(tk);
    const alpha = Math.min(tickAlpha(pos[0], ex), pAlpha);
    if (alpha <= 0) continue;
    const idx = Math.round(tk / TICK);
    const dot: Trace = {
      type: 'trace',
      id: `tick-dot-${idx}`,
      marks: [{ pos }],
      shape: 'dot',
      size: TICK_DOT_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(dot);
    const label: Readout = {
      type: 'readout',
      id: `tick-label-${idx}`,
      anchor: { world: pos, offset: TICK_LABEL_OFFSET },
      text: text('label.tick'),
      // 간격이 0.5 초라 소수 한 자리에서 반올림이 일어나지 않는다. 0 만 "0초".
      vars: { t: tk === 0 ? '0' : tk.toFixed(1) },
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: TICK_FONT_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(label);
  }

  // ---- 지우개 ----
  // 페이드 한 번이 아니라 공간을 쓸고 가는 행위다. 지나는 순간 왼쪽은 경로만,
  // 오른쪽은 경로 + 시각인 화면이 한 장에 같이 있다.
  if (eraserVisible(tl)) {
    const bandStep = ERASE_FADE_M / ERASER_BAND_STRIPS;
    for (let i = 0; i < ERASER_BAND_STRIPS; i++) {
      const x0 = ex - ERASE_FADE_M + i * bandStep;
      const x1 = x0 + bandStep;
      const strip: Region = {
        type: 'region',
        id: `eraser-band-${i}`,
        points: [
          [x0, 0],
          [x1, 0],
          [x1, ERASER_TOP_M],
          [x0, ERASER_TOP_M],
        ],
        fillOpacity: (ERASER_BAND_MAX * (i + 0.5)) / ERASER_BAND_STRIPS,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      out.push(strip);
    }
    const edge: Trajectory = {
      type: 'trajectory',
      id: 'eraser',
      points: [
        [ex, 0],
        [ex, ERASER_TOP_M],
      ],
      width: ERASER_WIDTH_PX,
      opacity: ERASER_LINE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(edge);
  }

  // ---- 공 ----
  // 경로와 같은 대상의 현재라 같은 파랑. 지우기 전에 옅어지며 퇴장한다.
  const bAlpha = ballAlpha(tl);
  if (bAlpha > 0) {
    const ball: Body = {
      type: 'body',
      id: 'ball',
      pos: posAt(s),
      shape: 'circle',
      size: BALL_R,
      fill: 'solid',
      outline: 'none',
      glow: false,
      opacity: bAlpha,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    };
    out.push(ball);
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 프레이밍. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
