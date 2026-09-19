// ========================================================================
// ac-generation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 (drawOrder: 'scene') —
//   자기력선(lineSet) → 극 조각(body rect) · 극 글자(readout) → 코일(lineSet) · 굴대 · 표지 끝(body)
//   → 기록지 축(lineSet) · 축 기호(readout) → 대응 점선(trajectory dotted) → 코일 자세 글리프(lineSet · body)
//   → 지난 자취(trajectory dotted) · 표식 → 지금 자취(trajectory) · 표식 → 지금 적는 점(body point).
//
// 색은 뜻마다 하나다 — 극 · 코일 · 축 · 글리프 · 지난 자취는 먹색, 자기력선 · 대응 점선은 muted,
// **강조색은 「지금 적히는 기전력」 한 가지 뜻에만.** 두 자취는 색이 아니라 선 모양(실선 · 점선)과
// 표식(`ω` · `{k}ω`)으로 가른다.
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
  coilAngle,
  coilDirection,
  emfAt,
  omegaOf,
  quarterTimes,
  readConstants,
  runStartAngle,
  type AcGenerationConstants,
  type Run,
} from './physics';
import {
  AXIS_HALF_HEIGHT,
  AXIS_OVERHANG,
  AXLE,
  COIL_RADIUS,
  FIELD_LINE_COUNT,
  FIELD_LINE_STEP,
  GLYPH_HALF,
  GLYPH_ROW_Y,
  GRAPH_ORIGIN,
  GRAPH_WIDTH,
  POLE_GAP_HALF,
  POLE_H,
  POLE_W,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { AcGenerationState } from './state';

// ------------------------------------------------------------------------
// 모양 — 굵기 · 글자 크기 · 불투명도 · 띄움(화면 px 또는 0~1). 물리량이 아니라 위계다 (C2).
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const FIELD = { colorRole: 'muted', emphasis: 'medium' } as const;
const EMF = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 자기력선 굵기 · 불투명도. 배경 정보라 가늘고 옅다. */
const FIELD_LINE_PX = 1;
const FIELD_LINE_OPACITY = 0.7;
/** 옆에서 본 코일 굵기. */
const COIL_PX = 4;
/** 굴대 반지름 · 코일 표지 끝 반지름(월드). */
const HUB_SIZE = 0.08;
const TAG_SIZE = 0.12;
/** 극 조각 — S 극의 빛의 양, N 극에서 파낸 글자의 빛의 양, 극 글자 크기(generator 와 같다). */
const SOUTH_LUMINANCE = 0.33;
const KNOCKOUT_LUMINANCE = 0.04;
const POLE_FONT_PX = 14;
/** 기록지 축 굵기. 안내선이라 가늘다. */
const AXIS_PX = 1;
/** 축 기호 · 자취 표식 글자 크기, 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_PX = 14;
const AXIS_LABEL_GAP_PX = 10;
const TRACE_LABEL_GAP_PX = 12;
/** 자취 굵기 — 지금 적는 것은 굵게, 지난 것은 가늘게. */
const TRACE_PX = 2.5;
const PAST_TRACE_PX = 1.5;
/** 지난 자취의 불투명도. */
const PAST_OPACITY = 0.7;
/** 기록지 한 폭을 표본하는 점 수 — 빠른 돌림의 마루가 모나지 않을 만큼. */
const TRACE_SAMPLES = 320;
/** 코일 자세 글리프 굵기 · 표지 끝 반지름(월드). */
const GLYPH_PX = 2.5;
const GLYPH_TAG_SIZE = 0.05;
/** 대응 점선 굵기 · 불투명도, 글리프 끝에서 띄우는 거리(월드). */
const LINK_PX = 1.5;
const LINK_OPACITY = 1;
const LINK_GAP = 0.06;

// ------------------------------------------------------------------------

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function scaled(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

/** 기록지 위 자리 — 돌림 안 진행도(0~1) · 기전력(V). */
function graphPoint(frac: number, emf: number, c: AcGenerationConstants): Vec2 {
  return [GRAPH_ORIGIN[0] + frac * GRAPH_WIDTH, GRAPH_ORIGIN[1] + emf * c.emfToWorld];
}

interface RunFrame {
  run: Run;
  /** 돌림이 시작할 때의 코일 각. */
  theta0: number;
  /** 돌림 길이(초). 기록지 한 폭이 이 시간이다. */
  duration: number;
  /** 지금까지 적힌 시간(초). */
  elapsed: number;
}

function runFrame(run: Run, tl: TimelineFrame, c: AcGenerationConstants): RunFrame {
  const duration = tl.duration(run);
  return { run, theta0: runStartAngle(run, tl, c), duration, elapsed: tl.at(run) * duration };
}

/** 돌림 시작부터 τ 초 뒤의 기록지 자리. */
function tracePointAt(f: RunFrame, tau: number, c: AcGenerationConstants): Vec2 {
  const theta = f.theta0 + omegaOf(f.run, c) * tau;
  return graphPoint(tau / f.duration, emfAt(theta, f.run, c), c);
}

/** 적힌 만큼의 자취 표본. */
function tracePoints(f: RunFrame, c: AcGenerationConstants): Vec2[] {
  const n = Math.max(1, Math.ceil((TRACE_SAMPLES * f.elapsed) / f.duration));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) pts.push(tracePointAt(f, (f.elapsed * i) / n, c));
  return pts;
}

/** 사분 시각 중 양의 마루를 가려내는 문턱(sin 값). 사분 시각의 sin 은 −1 · 0 · 1 뿐이다. */
const CREST_SIN_MIN = 0.5;

/** 첫 양의 마루 시각 — 표식을 그 위에 단다. 아직 적히지 않았으면 없다. */
function firstCrest(f: RunFrame, c: AcGenerationConstants): number | undefined {
  const w = omegaOf(f.run, c);
  return quarterTimes(f.run, f.theta0, f.duration, c).find(
    (tau) => tau <= f.elapsed && Math.sin(f.theta0 + w * tau) > CREST_SIN_MIN,
  );
}

/** 자취 하나 — 선과 표식. `live` 면 강조색 실선, 아니면 먹 점선. */
function trace(id: string, f: RunFrame, live: boolean, fade: number, c: AcGenerationConstants): Primitive[] {
  const out: Primitive[] = [
    {
      type: 'trajectory',
      id: `${id}-trace`,
      points: tracePoints(f, c),
      width: live ? TRACE_PX : PAST_TRACE_PX,
      opacity: (live ? 1 : PAST_OPACITY) * fade,
      style: live ? EMF : { ...INK, lineStyle: 'dotted' },
    },
  ];
  const crest = firstCrest(f, c);
  if (crest !== undefined) {
    const slow = f.run === 'slow';
    out.push({
      type: 'readout',
      id: `${id}-label`,
      anchor: { world: tracePointAt(f, crest, c), offset: [0, -TRACE_LABEL_GAP_PX] },
      text: slow ? text('label.omega') : text('label.omegaTimes'),
      vars: slow ? undefined : { k: String(c.speedRatio) },
      chip: false,
      font: 'text',
      italic: true,
      align: 'center',
      fontSize: LABEL_PX,
      opacity: (live ? 1 : PAST_OPACITY) * fade,
      style: live ? EMF : INK,
    });
  }
  return out;
}

/**
 * 사분 주기마다의 코일 자세 글리프와, 그것을 곡선 위 같은 시각의 점에 잇는 점선.
 * 펜이 그 시각을 지난 것만 둔다 — 적히는 대로 하나씩 새겨진다.
 */
function glyphs(f: RunFrame, fade: number, c: AcGenerationConstants): Primitive[] {
  const w = omegaOf(f.run, c);
  const links: Primitive[] = [];
  const tags: Primitive[] = [];
  const bars: Vec2[][] = [];
  quarterTimes(f.run, f.theta0, f.duration, c)
    .filter((tau) => tau <= f.elapsed)
    .forEach((tau, i) => {
      const theta = f.theta0 + w * tau;
      const onCurve = tracePointAt(f, tau, c);
      const center: Vec2 = [onCurve[0], GLYPH_ROW_Y];
      const dir = coilDirection(theta);
      bars.push([add(center, scaled(dir, -GLYPH_HALF)), add(center, scaled(dir, GLYPH_HALF))]);
      tags.push({
        type: 'body',
        id: `${f.run}-glyph-tag-${i}`,
        pos: add(center, scaled(dir, GLYPH_HALF)),
        shape: 'circle',
        size: GLYPH_TAG_SIZE,
        glow: false,
        outline: 'none',
        opacity: fade,
        style: INK,
      });
      // 글리프 위 끝에서 곡선 위 점까지. 곡선이 글리프 줄보다 아래로 내려오는 일은 없다
      // (기본값에서 가장 깊은 골 −1.26 + 0.2 > −1.55).
      links.push({
        type: 'trajectory',
        id: `${f.run}-link-${i}`,
        points: [[center[0], GLYPH_ROW_Y + GLYPH_HALF + LINK_GAP], onCurve],
        width: LINK_PX,
        opacity: LINK_OPACITY * fade,
        style: { ...FIELD, lineStyle: 'dotted' },
      });
    });
  const out: Primitive[] = [...links];
  if (bars.length > 0) {
    out.push({ type: 'lineSet', id: `${f.run}-glyphs`, lines: bars, width: GLYPH_PX, opacity: fade, style: INK });
  }
  out.push(...tags);
  return out;
}

export function scene(params: {
  state: AcGenerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const theta = coilAngle(tl, c);
  const out: Primitive[] = [];

  // ---- 자기력선 — N 극면에서 S 극면으로 곧게 ----
  const faceL = AXLE[0] - POLE_GAP_HALF;
  const faceR = AXLE[0] + POLE_GAP_HALF;
  const fieldLines: Vec2[][] = [];
  for (let i = 0; i < FIELD_LINE_COUNT; i++) {
    const y = AXLE[1] + (i - (FIELD_LINE_COUNT - 1) / 2) * FIELD_LINE_STEP;
    fieldLines.push([
      [faceL, y],
      [faceR, y],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines: fieldLines,
    width: FIELD_LINE_PX,
    opacity: FIELD_LINE_OPACITY,
    style: FIELD,
  });

  // ---- 극 조각 — N 은 먹, S 는 옅게 (generator · lenz-law 의 자석과 같은 모양) ----
  const nPos: Vec2 = [faceL - POLE_W / 2, AXLE[1]];
  const sPos: Vec2 = [faceR + POLE_W / 2, AXLE[1]];
  out.push(
    { type: 'body', id: 'pole-n', pos: nPos, shape: 'rect', size: [POLE_W, POLE_H], style: INK },
    {
      type: 'body',
      id: 'pole-s',
      pos: sPos,
      shape: 'rect',
      size: [POLE_W, POLE_H],
      style: INK,
      luminance: SOUTH_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-n-label',
      anchor: { world: nPos },
      text: text('label.poleN'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      style: INK,
      luminance: KNOCKOUT_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-s-label',
      anchor: { world: sPos },
      text: text('label.poleS'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      style: INK,
    },
  );

  // ---- 코일 — 굴대 쪽에서 보면 선 하나. 한 끝에 표지를 달아 반 바퀴마다 뒤집히는 것을 읽게 한다 ----
  const dir = coilDirection(theta);
  const tagEnd = add(AXLE, scaled(dir, COIL_RADIUS));
  const otherEnd = add(AXLE, scaled(dir, -COIL_RADIUS));
  out.push(
    { type: 'lineSet', id: 'coil', lines: [[otherEnd, tagEnd]], width: COIL_PX, style: INK },
    { type: 'body', id: 'hub', pos: AXLE, shape: 'circle', size: HUB_SIZE, glow: false, outline: 'background', style: INK },
    { type: 'body', id: 'coil-tag', pos: tagEnd, shape: 'circle', size: TAG_SIZE, glow: false, outline: 'background', style: INK },
  );

  // ---- 기록지 축 — 세로 ε, 가로 t ----
  const [ox, oy] = GRAPH_ORIGIN;
  const axisEnd = ox + GRAPH_WIDTH + AXIS_OVERHANG;
  out.push(
    {
      type: 'lineSet',
      id: 'axes',
      lines: [
        [
          [ox, oy - AXIS_HALF_HEIGHT],
          [ox, oy + AXIS_HALF_HEIGHT],
        ],
        [
          [ox, oy],
          [axisEnd, oy],
        ],
      ],
      width: AXIS_PX,
      style: INK,
    },
    {
      type: 'readout',
      id: 'axis-emf',
      anchor: { world: [ox, oy + AXIS_HALF_HEIGHT], offset: [0, -AXIS_LABEL_GAP_PX] },
      text: text('label.axisEmf'),
      chip: false,
      font: 'text',
      italic: true,
      align: 'center',
      fontSize: LABEL_PX,
      style: INK,
    },
    {
      type: 'readout',
      id: 'axis-t',
      anchor: { world: [axisEnd, oy], offset: [AXIS_LABEL_GAP_PX, 0] },
      text: text('label.axisT'),
      chip: false,
      font: 'text',
      italic: true,
      align: 'center',
      fontSize: LABEL_PX,
      style: INK,
    },
  );

  // ---- 자취 · 글리프 — 느린 돌림 동안은 느린 것만, 그 뒤로는 느린 것이 점선으로 남는다 ----
  const fade = 1 - tl.at('clear');
  const slow = runFrame('slow', tl, c);
  if (tl.phase === 'slow') {
    out.push(...glyphs(slow, fade, c), ...trace('slow', slow, true, fade, c));
    out.push({ type: 'body', id: 'pen', pos: tracePointAt(slow, slow.elapsed, c), shape: 'point', style: EMF });
  } else {
    const fast = runFrame('fast', tl, c);
    out.push(...glyphs(fast, fade, c), ...trace('slow', slow, false, fade, c), ...trace('fast', fast, true, fade, c));
    if (tl.phase === 'fast') {
      out.push({ type: 'body', id: 'pen', pos: tracePointAt(fast, fast.elapsed, c), shape: 'point', style: EMF });
    }
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
