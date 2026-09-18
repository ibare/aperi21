// ========================================================================
// work-function-and-threshold — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`) — 가시광 띠 · 축 ·
// 커서 · 두 직선 · 미끄러지는 사본 · 문턱 표지 · 측정점 · 이름표.
//
// 색 — 두 직선 · 측정점은 먹(`ink`). 나트륨과 구리를 색으로 가르지 않는다 — 이름표와 자리로
// 갈린다 (S-piece). 축 · 사본 · 이름표는 배경 정보라 `muted`. 강조색(`accent`)은 「문턱」 한 뜻에만
// 쓴다: 가로축 위 문턱 점 · 넘는 순간 퍼지는 고리 · 문턱 이름표. 빛은 빛 채널로만 —
// 가시광 띠와 커서가 그 진동수 빛의 색이고, 가시광 밖에서는 색을 지어내지 않고 회색 커서로 둔다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { VISIBLE_NM, wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import {
  METALS,
  activeMetal,
  anchorOf,
  frequencyOf,
  kmax,
  plotPoint,
  readConstants,
  sinceCrossing,
  sweepOf,
  thresholdOf,
  wavelengthNm,
  workFunctionOf,
  type Metal,
  type WorkFunctionConstants,
} from './physics';
import { PLOT, SCENE_BOUNDS, text, type WorkFunctionAndThresholdMessageKey } from './schema';
import type { WorkFunctionAndThresholdState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 월드 길이
// ------------------------------------------------------------------------

/** 축 · 직선 · 사본 · 커서 굵기(화면 px). */
const AXIS_PX = 1;
const LINE_PX = 2.5;
const GHOST_PX = 2.5;
const CURSOR_PX = 2;
/** 가시광 띠의 칸 수. */
const STRIP_COLS = 64;
/** 측정점 반지름(월드). 문턱 아래는 속 빈 고리, 넘으면 채운 점. */
const DOT_R = 0.2;
/** 가로축 위 문턱 점 반지름(월드). */
const THRESHOLD_R = 0.14;
/** 문턱 고리 — 처음 · 끝 반지름(화면 px) · 굵기(화면 px). */
const PULSE_FROM_PX = 6;
const PULSE_TO_PX = 30;
const PULSE_WIDTH_PX = 2;
/** 사본 짙기. */
const GHOST_OPACITY = 0.85;
/** 글자 크기(화면 px). */
const LABEL_PX = 12;
const METAL_PX = 13;
/** 축 이름 띄움(화면 px). */
const AXIS_LABEL_GAP = 12;
/** 문턱 이름표가 가로축에서 내려앉는 거리(화면 px) — 가시광 띠 아래. */
const THRESHOLD_LABEL_DY = 28;
/** 금속 이름표가 직선 끝에서 떨어지는 거리(화면 px). */
const METAL_LABEL_DX = 10;
/** 「기울기 h」 이름표가 직선 가운데에서 떨어지는 거리(화면 px) — 왼쪽 위. */
const SLOPE_LABEL_OFFSET: Vec2 = [-10, -10];
/** 「자외선」 이름표가 가시광 띠 끝 아래 모서리에서 떨어지는 거리(화면 px) — 가로축 선에 걸리지 않게 띠 아래로. */
const UV_LABEL_OFFSET: Vec2 = [8, 8];
/** 「기울기 h」 이름표를 다는 자리 — 문턱에서 훑는 끝까지 중 이 몫. */
const SLOPE_LABEL_AT = 0.5;

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const METAL_LABEL: Record<Metal, WorkFunctionAndThresholdMessageKey> = {
  na: 'label.sodium',
  cu: 'label.copper',
};

function label(
  id: string,
  key: WorkFunctionAndThresholdMessageKey,
  anchor: Readout['anchor'],
  opts: {
    align?: 'left' | 'center' | 'right';
    fontSize?: number;
    style?: Readout['style'];
    opacity?: number;
    vars?: Record<string, string | number>;
  } = {},
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align ?? 'center',
    fontSize: opts.fontSize ?? LABEL_PX,
    opacity: opts.opacity ?? 1,
    style: opts.style ?? MUTED,
  };
}

/** 한 금속의 직선 — 문턱에서 지금 커서까지. */
function metalLine(m: Metal, f: number, k: WorkFunctionConstants, opacity: number): Trajectory | null {
  const f0 = thresholdOf(m, k);
  if (f <= f0) return null;
  const w = workFunctionOf(m, k);
  return {
    type: 'trajectory',
    id: `line-${m}`,
    points: [plotPoint(f0, 0), plotPoint(f, kmax(f, w, k))],
    width: LINE_PX,
    opacity,
    style: INK,
  };
}

export function scene(params: {
  state: WorkFunctionAndThresholdState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('work-function-and-threshold: schema.timeline 이 선언되어야 한다');
  const k = readConstants(stage);
  const alpha = 1 - tl.at('fade');
  const out: Primitive[] = [];

  // ── 가시광 띠 — 가로축 바로 아래. 진동수가 오를수록 빨강 → 보라, 그 너머가 자외선 ──
  const fLo = frequencyOf(VISIBLE_NM.max);
  const fHi = frequencyOf(VISIBLE_NM.min);
  const colW = (fHi - fLo) / STRIP_COLS;
  const strip: ScalarField = {
    type: 'scalarField',
    id: 'visible-strip',
    min: [fLo, -PLOT.stripH],
    max: [fHi, 0],
    cols: STRIP_COLS,
    rows: 1,
    values: Array.from({ length: STRIP_COLS }, (_, i) => wavelengthToLinearRgb(wavelengthNm(fLo + (i + 0.5) * colW))).flatMap(
      (rgb) => [rgb[0], rgb[1], rgb[2]],
    ),
    range: [0, 1],
    colors: 'lightRgb',
  };
  out.push(strip);
  out.push(
    label('uv', 'label.ultraviolet', { world: [fHi, -PLOT.stripH], offset: UV_LABEL_OFFSET }, { align: 'left' }),
  );

  // ── 축 ──
  const yTop = PLOT.axisTopEv * PLOT.perEv;
  const axes: Trajectory = {
    type: 'trajectory',
    id: 'axes',
    points: [[0, yTop], [0, 0], [PLOT.axisEndF, 0]],
    width: AXIS_PX,
    style: MUTED,
  };
  out.push(axes);
  out.push(label('axis-k', 'label.axisK', { world: [0, yTop], offset: [0, -AXIS_LABEL_GAP] }, { align: 'left' }));
  out.push(
    label('axis-f', 'label.axisF', { world: [PLOT.axisEndF, 0], offset: [AXIS_LABEL_GAP, 0] }, { align: 'left' }),
  );

  // ── 커서 — 지금 비추는 빛의 진동수. 가시광 안이면 그 빛의 색, 밖이면 회색 ──
  const active = activeMetal(tl);
  if (active) {
    const f = sweepOf(active, tl, k)!;
    const nm = wavelengthNm(f);
    const visible = nm >= VISIBLE_NM.min && nm <= VISIBLE_NM.max;
    const cursor: Trajectory = {
      type: 'trajectory',
      id: 'cursor',
      points: [[f, 0], [f, yTop]],
      width: CURSOR_PX,
      style: { ...MUTED, lineStyle: 'dashed' },
      ...(visible ? { light: { rgb: wavelengthToLinearRgb(nm) } } : {}),
    };
    out.push(cursor);
  }

  // ── 두 직선 — 문턱에서 떠나 곧게 자란다 ──
  for (const m of METALS) {
    const f = sweepOf(m, tl, k);
    if (f === null) continue;
    const line = metalLine(m, f, k, alpha);
    if (line) out.push(line);
  }

  // ── 미끄러지는 사본 — 나트륨의 직선을 문턱 차이만큼 오른쪽으로. 훑는 끝에서 자른다 ──
  const slide = tl.at('slide');
  if (slide > 0) {
    const d = (thresholdOf('cu', k) - thresholdOf('na', k)) * slide;
    const wNa = workFunctionOf('na', k);
    const ghost: Trajectory = {
      type: 'trajectory',
      id: 'ghost-na',
      points: [plotPoint(thresholdOf('na', k) + d, 0), plotPoint(k.sweepTo, kmax(k.sweepTo - d, wNa, k))],
      width: GHOST_PX,
      opacity: GHOST_OPACITY * alpha,
      style: { ...MUTED, lineStyle: 'dashed' },
    };
    out.push(ghost);
  }

  // ── 문턱 — 가로축 위 강조색 점 · 넘는 순간 퍼지는 고리 · 정박값 이름표 ──
  for (const m of METALS) {
    const since = sinceCrossing(m, tl);
    if (since === null) continue;
    const at = plotPoint(thresholdOf(m, k), 0);
    const pulse: Trace = {
      type: 'trace',
      id: `pulse-${m}`,
      marks: since <= k.pulseSeconds ? [{ pos: at, age: since }] : [],
      life: k.pulseSeconds,
      shape: 'ring',
      size: PULSE_FROM_PX,
      spreadTo: PULSE_TO_PX,
      width: PULSE_WIDTH_PX,
      opacity: alpha,
      style: ACCENT,
    };
    out.push(pulse);
    const mark: Body = {
      type: 'body',
      id: `threshold-${m}`,
      shape: 'circle',
      pos: at,
      size: THRESHOLD_R,
      outline: 'background',
      glow: false,
      opacity: alpha,
      style: ACCENT,
    };
    out.push(mark);
    out.push(
      label(`threshold-${m}-label`, 'label.threshold', { world: at, offset: [0, THRESHOLD_LABEL_DY] }, {
        style: ACCENT,
        opacity: alpha,
        vars: { f: String(anchorOf(m, k)) },
      }),
    );
  }

  // ── 측정점 — 지금 훑는 금속. 문턱 아래는 가로축에 붙은 속 빈 고리(전자 없음), 넘으면 채운 점 ──
  if (active) {
    const f = sweepOf(active, tl, k)!;
    const w = workFunctionOf(active, k);
    const above = f > thresholdOf(active, k);
    const dot: Body = {
      type: 'body',
      id: 'probe',
      shape: 'circle',
      pos: plotPoint(f, kmax(f, w, k)),
      size: DOT_R,
      fill: above ? 'solid' : 'none',
      outline: above ? 'background' : 'role',
      glow: false,
      style: INK,
    };
    out.push(dot);
  }

  // ── 금속 이름표 — 직선이 닿을 끝 자리. 그 금속을 훑기 시작할 때부터 ──
  for (const m of METALS) {
    if (sweepOf(m, tl, k) === null) continue;
    const w = workFunctionOf(m, k);
    out.push(
      label(`metal-${m}`, METAL_LABEL[m], { world: plotPoint(k.sweepTo, kmax(k.sweepTo, w, k)), offset: [METAL_LABEL_DX, 0] }, {
        align: 'left',
        fontSize: METAL_PX,
        style: INK,
        opacity: alpha,
        vars: { w: String(w) },
      }),
    );
  }

  // ── 겹친 뒤 — 두 직선에 「기울기 h」 ──
  const match = tl.at('match');
  if (match > 0) {
    for (const m of METALS) {
      const f0 = thresholdOf(m, k);
      const f = f0 + (k.sweepTo - f0) * SLOPE_LABEL_AT;
      out.push(
        label(`slope-${m}`, 'label.slope', { world: plotPoint(f, kmax(f, workFunctionOf(m, k), k)), offset: SLOPE_LABEL_OFFSET }, {
          align: 'right',
          style: INK,
          opacity: alpha,
        }),
      );
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
