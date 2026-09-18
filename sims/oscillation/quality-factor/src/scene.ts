// ========================================================================
// quality-factor — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 공명 곡선 · 시간 기록 ·
// 재는 막대(trajectory) · 축(lineSet) · 매단 판(surface) · 용수철(constraint) ·
// 추와 곡선 위 점(body) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 진동자와 그 응답(추 · 곡선 · 기록)은 먹색, 구동(진동수 커서)은
// secondary, **강조색은 「Q 를 잰 길이」 한 가지 뜻에만**(봉우리 폭 막대 · 울린 길이 막대).
// 축 · 이름표 · 「구동 멈춤」 선은 배경 정보라 muted. 두 진동자는 같은 색이다 — 다른 것은
// Q 하나뿐이라 색을 가르면 「다른 종류」 로 읽힌다 (S-piece).
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
  amplitude,
  displacement,
  halfPowerBand,
  readConstants,
  readDrive,
  recordAt,
  recorded,
  ringTime,
  sceneOpacity,
  sinceRelease,
  stripSpan,
  type QualityFactorConstants,
} from './physics';
import {
  AXIS_LABEL_DY,
  BAR_TICK,
  BOB_SIZE,
  CURVE_LEFT,
  CURVE_SAMPLES,
  CURVE_WIDTH,
  LANE_HIGH_Y,
  LANE_LABEL_X,
  LANE_LOW_Y,
  OSC_X,
  RING_BAR_Y,
  SCENE_BOUNDS,
  STRIP_DT,
  STRIP_LEFT,
  STRIP_WIDTH,
  SUPPORT_HALF,
  SUPPORT_Y,
  SWING,
  TICK_LABEL_DY,
  text,
} from './schema';
import type { QualityFactorState } from './state';

/** 곡선 · 기록 선 굵기(화면 px). 진동자의 응답이라 가장 굵다. */
const RESPONSE_WIDTH = 2;
/** 재는 막대 굵기(화면 px). 곡선보다 굵어 「잰 길이」 로 먼저 읽힌다. */
const BAR_WIDTH = 3;
/** 재는 막대 끝 눈금 굵기(화면 px). */
const BAR_TICK_WIDTH = 2;
/** 축 · 영점선 · 「구동 멈춤」 선 굵기(화면 px)와 짙기. 재는 선이지 그림의 일부가 아니다. */
const GUIDE_WIDTH = 1;
const GUIDE_OPACITY = 0.5;
/** 구동 진동수 커서 굵기(화면 px). */
const CURSOR_WIDTH = 1.5;
/** 곡선 위 지금 자리 점 반지름(월드). */
const DOT_RADIUS = 0.07;
/** 이름표 글자 크기(화면 px). 레인 이름표만 한 단 크다. */
const LABEL_PX = 11;
const LANE_LABEL_PX = 13;
/** 용수철 감은 수. */
const COILS = 6;

/** 한 레인의 선언 — 가운데 높이와 Q. */
interface Lane {
  id: string;
  y: number;
  q: number;
}

export function scene(params: {
  state: QualityFactorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('quality-factor: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(tl);
  const drive = readDrive(tl, c);
  const release = sinceRelease(tl);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'low', y: LANE_LOW_Y, q: c.qLow },
    { id: 'high', y: LANE_HIGH_Y, q: c.qHigh },
  ];

  // 곡선 판 가로: 구동 진동수 비 → 월드 x.
  const curveX = (r: number): number =>
    CURVE_LEFT + ((r - c.sweepFrom) / (c.sweepTo - c.sweepFrom)) * CURVE_WIDTH;
  // 기록 판 가로: 구동 시작 뒤 시각(초) → 월드 x. 초당 폭은 시간표가 정한다.
  const perSecond = STRIP_WIDTH / stripSpan(tl);
  const stripX = (tau: number): number => STRIP_LEFT + tau * perSecond;
  const releaseX = stripX(tl.duration('drive'));

  for (const lane of lanes) {
    pushLane(out, lane, c, tl, drive, release, alpha, curveX, stripX, releaseX);
  }

  // ---- 축 이름표 — 아래 레인 밑에만. 두 레인이 같은 축이다. ----
  const below = LANE_HIGH_Y + AXIS_LABEL_DY;
  out.push(label('axis-drive', [CURVE_LEFT + CURVE_WIDTH / 2, below], text('label.driveAxis'), 'center'));
  out.push(label('axis-time', [STRIP_LEFT + STRIP_WIDTH, below], text('label.timeAxis'), 'right'));

  // 「구동 멈춤」 이름표 — 위 레인 기록 판 위에 한 번. 멈춘 뒤에만 뜬다.
  if (!drive.driving) {
    out.push(
      label('release-label', [releaseX, LANE_LOW_Y + SWING + 0.22], text('label.release'), 'center'),
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

function pushLane(
  out: Primitive[],
  lane: Lane,
  c: QualityFactorConstants,
  tl: TimelineFrame,
  drive: ReturnType<typeof readDrive>,
  release: number,
  alpha: number,
  curveX: (r: number) => number,
  stripX: (tau: number) => number,
  releaseX: number,
): void {
  const base = lane.y - SWING;
  const top = lane.y + SWING;
  const curveY = (a: number): number => base + 2 * SWING * a;

  // ---- 레인 이름표 ----
  out.push({
    type: 'readout',
    id: `q-${lane.id}`,
    anchor: { world: [LANE_LABEL_X, lane.y] },
    text: text('label.q'),
    vars: { q: lane.q },
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LANE_LABEL_PX,
    align: 'right',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 곡선 판 축 · f₀ 눈금 ----
  const f0x = curveX(1);
  out.push({
    type: 'lineSet',
    id: `curve-axis-${lane.id}`,
    lines: [
      [
        [curveX(c.sweepFrom), base],
        [curveX(c.sweepTo), base],
      ],
      [
        [f0x, base],
        [f0x, base - 0.1],
      ],
    ],
    width: GUIDE_WIDTH,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push(label(`f0-${lane.id}`, [f0x, lane.y + TICK_LABEL_DY], text('label.f0'), 'center'));

  // ---- 공명 곡선 — 훑은 데까지 그려진다 ----
  const pts: Vec2[] = [];
  const span = drive.drawnTo - c.sweepFrom;
  const n = Math.max(2, Math.round((CURVE_SAMPLES * span) / (c.sweepTo - c.sweepFrom)));
  for (let i = 0; i <= n; i++) {
    const r = c.sweepFrom + (span * i) / n;
    pts.push([curveX(r), curveY(amplitude(r, lane.q))]);
  }
  out.push({
    type: 'trajectory',
    id: `curve-${lane.id}`,
    points: pts,
    width: RESPONSE_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 봉우리 폭 — 곡선이 봉우리를 지나 반전력 자리까지 그려진 뒤에 뜬다 ----
  const [r1, r2] = halfPowerBand(lane.q, c.sweepFrom, c.sweepTo);
  if (drive.drawnTo >= r2) {
    const y = curveY(Math.SQRT1_2);
    pushBar(out, `width-${lane.id}`, curveX(r1), curveX(r2), y, alpha);
  }

  // ---- 구동 커서 · 곡선 위 지금 자리 — 구동 중에만 ----
  if (drive.driving) {
    const x = curveX(drive.r);
    out.push({
      type: 'trajectory',
      id: `cursor-${lane.id}`,
      points: [
        [x, base],
        [x, top],
      ],
      width: CURSOR_WIDTH,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `dot-${lane.id}`,
      pos: [x, curveY(amplitude(drive.r, lane.q))],
      shape: 'circle',
      size: DOT_RADIUS,
      outline: 'background',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 기록 판 영점선 ----
  const stripEnd = stripX(tl.duration('drive') + tl.duration('ring'));
  out.push({
    type: 'lineSet',
    id: `strip-axis-${lane.id}`,
    lines: [
      [
        [stripX(0), lane.y],
        [stripEnd, lane.y],
      ],
    ],
    width: GUIDE_WIDTH,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 「구동 멈춤」 선 — 멈춘 뒤에만.
  if (!drive.driving) {
    out.push({
      type: 'trajectory',
      id: `release-${lane.id}`,
      points: [
        [releaseX, lane.y - SWING - 0.08],
        [releaseX, lane.y + SWING + 0.08],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 시간 기록 — 구동 시작부터 지금까지 추가 지나온 자리 ----
  const done = recorded(tl);
  if (done > 0) {
    const trace: Vec2[] = [];
    const steps = Math.ceil(done / STRIP_DT);
    for (let i = 0; i <= steps; i++) {
      const tau = Math.min(done, i * STRIP_DT);
      trace.push([stripX(tau), lane.y + SWING * recordAt(tl, tau, lane.q, c)]);
    }
    out.push({
      type: 'trajectory',
      id: `trace-${lane.id}`,
      points: trace,
      width: RESPONSE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 울린 길이 — 진폭이 e^(−π) 로 줄어든 뒤에 뜬다 ----
  const ring = ringTime(lane.q, c);
  if (!drive.driving && release >= ring) {
    const y = lane.y + RING_BAR_Y;
    pushBar(out, `ring-${lane.id}`, releaseX, stripX(tl.duration('drive') + ring), y, alpha);
  }

  // ---- 진동자 — 매단 판 · 용수철 · 추 ----
  const x = displacement(drive, release, lane.q, c);
  const bobY = lane.y + SWING * x;
  const supportY = lane.y + SUPPORT_Y;
  out.push({
    type: 'surface',
    id: `support-${lane.id}`,
    geometry: { kind: 'wall', from: [OSC_X - SUPPORT_HALF, supportY], to: [OSC_X + SUPPORT_HALF, supportY] },
    material: 'solid',
  });
  out.push({
    type: 'constraint',
    id: `spring-${lane.id}`,
    subtype: 'spring',
    from: [OSC_X, supportY],
    to: [OSC_X, bobY + BOB_SIZE[1] / 2],
    coils: COILS,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: `bob-${lane.id}`,
    pos: [OSC_X, bobY],
    shape: 'rect',
    size: BOB_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
}

/** 재는 막대 — 강조색 가로선과 양 끝 눈금. 봉우리 폭과 울린 길이가 같은 모양을 쓴다. */
function pushBar(out: Primitive[], id: string, x1: number, x2: number, y: number, alpha: number): void {
  out.push({
    type: 'trajectory',
    id,
    points: [
      [x1, y],
      [x2, y],
    ],
    width: BAR_WIDTH,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: `${id}-ends`,
    lines: [
      [
        [x1, y - BAR_TICK],
        [x1, y + BAR_TICK],
      ],
      [
        [x2, y - BAR_TICK],
        [x2, y + BAR_TICK],
      ],
    ],
    width: BAR_TICK_WIDTH,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
}

/** muted 이름표 한 줄. */
function label(
  id: string,
  at: Vec2,
  t: ReturnType<typeof text>,
  align: 'left' | 'center' | 'right',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: t,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
