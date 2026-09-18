// ========================================================================
// stellar-spectral-class — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 스펙트럼 띠 — `scalarField` `lightRgb` 640 × 1. 칸마다 그 파장의 색 × 투과 세기. 흡수선은
//     **빛을 덜어낸 자리**라 두 테마 모두에서 검다(빛 없음 쪽으로 내려간다).
//   · 발머선 이름표 — `readout` 먹색 + 띠로 내리는 짧은 `lineSet` 눈금. 아래 수소 곡선과 같은 먹색이다.
//   · 파장 눈금 — 띠 아래 `lineSet` + `readout` muted.
//   · 온도 축 — `trajectory` muted, 분광형 자리 눈금 `lineSet`, 글자 `readout`.
//   · 선 세기 곡선 — `trajectory` 셋. 수소 먹색 실선(주인공) · 금속 muted 파선 · 분자 muted 점선.
//     색으로 가르지 않고 선 모양과 이름표로 가른다 (S-piece 「색으로 설명하지 않는다」).
//   · 지금 온도 — 강조색 점선 커서 + 곡선 위 점 + 지금 가장 가까운 분광형 글자.
//     **강조색은 「지금 온도」 한 뜻에만.**
//
// 빛은 띠뿐이다. 축 · 곡선 · 글자 · 캡션은 역할 색 그대로다.
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
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { groupStrength, heldClass, nearestClass, readConstants, temperatureAt, transmission } from './physics';
import {
  ABSORPTION_LINES,
  AXIS_T,
  CLASS_IDS,
  CLASS_LABEL_Y,
  GRAPH_H,
  GRAPH_Y0,
  LINE_LABEL_Y,
  LINE_TICK,
  PANEL_W,
  PANEL_X0,
  SCENE_BOUNDS,
  STRENGTH_LABEL_POS,
  STRIP_COLS,
  STRIP_NM,
  STRIP_Y0,
  STRIP_Y1,
  TEMP_LABEL_Y,
  WAVELENGTH_LABEL_Y,
  WAVELENGTH_TICKS,
  text,
  type LineGroup,
  type SpectralClass,
  type StellarSpectralClassMessageKey,
} from './schema';
import type { StellarSpectralClassState } from './state';

/** 곡선을 표본하는 점 수. */
const CURVE_SAMPLES = 160;
/** 선 굵기(화면 px) — 주인공 곡선 · 곁 곡선 · 축과 눈금 · 커서. */
const HYDROGEN_WIDTH = 2.5;
const SIDE_CURVE_WIDTH = 1.75;
const GUIDE_WIDTH = 1;
const CURSOR_WIDTH = 1.5;
/** 눈금 길이(월드). */
const TICK_LEN = 0.12;
/** 글자 크기(화면 px). */
const LABEL_PX = 11;
const LINE_LABEL_PX = 12;
const CLASS_PX = 16;
const TEMP_PX = 13;
/** 곡선 이름표를 곡선 꼭대기 위로 띄우는 거리(월드). */
const CURVE_LABEL_GAP = 0.3;
/** 커서가 짙기 1 높이 위로 조금 더 올라가는 거리(월드). */
const CURSOR_OVERSHOOT = 0.12;
/** 방향 글자(← 뜨겁다 · 차갑다 →)를 패널 끝에서 바깥으로 두는 거리(월드). */
const DIRECTION_INSET = 0.25;

/** 파장 nm → 월드 x (띠). */
function xOfNm(nm: number): number {
  return PANEL_X0 + ((nm - STRIP_NM.min) / (STRIP_NM.max - STRIP_NM.min)) * PANEL_W;
}

/** 온도 K → 월드 x (온도 축, 왼쪽이 뜨겁다 · 로그). */
function xOfT(T: number): number {
  return PANEL_X0 + (Math.log(AXIS_T.hot / T) / Math.log(AXIS_T.hot / AXIS_T.cool)) * PANEL_W;
}

/** 월드 x → 온도 K (곡선 표본용). */
function tOfX(x: number): number {
  return AXIS_T.hot / Math.pow(AXIS_T.hot / AXIS_T.cool, (x - PANEL_X0) / PANEL_W);
}

function label(
  id: string,
  pos: Vec2,
  key: StellarSpectralClassMessageKey,
  opts: {
    vars?: Record<string, string>;
    fontSize?: number;
    role?: 'muted' | 'accent' | 'ink';
    weight?: 'normal' | 'bold';
    italic?: boolean;
  } = {},
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    fontSize: opts.fontSize ?? LABEL_PX,
    ...(opts.weight ? { weight: opts.weight } : {}),
    ...(opts.italic ? { italic: true } : {}),
    style: { colorRole: opts.role ?? 'muted', emphasis: 'strong' },
  };
}

/** 선 세기 곡선 셋 — 무리 · 선 모양 · 역할 · 이름표 · 이름표를 다는 분광형. */
const CURVES: readonly {
  group: LineGroup;
  key: StellarSpectralClassMessageKey;
  role: 'ink' | 'muted';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  width: number;
  labelAt: SpectralClass;
}[] = [
  { group: 'hydrogen', key: 'label.hydrogen', role: 'ink', lineStyle: 'solid', width: HYDROGEN_WIDTH, labelAt: 'A' },
  { group: 'metals', key: 'label.metals', role: 'muted', lineStyle: 'dashed', width: SIDE_CURVE_WIDTH, labelAt: 'K' },
  { group: 'molecules', key: 'label.molecules', role: 'muted', lineStyle: 'dotted', width: SIDE_CURVE_WIDTH, labelAt: 'M' },
];

/** 띠 칸마다의 가운데 파장과 그 파장의 색 — 온도와 무관해 한 번만 센다. */
const STRIP_NMS: readonly number[] = Array.from(
  { length: STRIP_COLS },
  (_, i) => STRIP_NM.min + ((i + 0.5) / STRIP_COLS) * (STRIP_NM.max - STRIP_NM.min),
);
const STRIP_RGB = STRIP_NMS.map((nm) => wavelengthToLinearRgb(nm));

export function scene(params: {
  state: StellarSpectralClassState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('stellar-spectral-class: 시간표가 없다');
  const c = readConstants(params.stage);
  const T = temperatureAt(tl, c);
  const out: Primitive[] = [];

  // ---- 스펙트럼 띠: 연속 색 × 투과 세기 ----
  const tr = transmission(STRIP_NMS, T, c);
  const values: number[] = [];
  for (let i = 0; i < STRIP_COLS; i++) {
    const rgb = STRIP_RGB[i]!;
    const k = tr[i]!;
    values.push(rgb[0] * k, rgb[1] * k, rgb[2] * k);
  }
  out.push({
    type: 'scalarField',
    id: 'spectrum',
    min: [PANEL_X0, STRIP_Y0],
    max: [PANEL_X0 + PANEL_W, STRIP_Y1],
    cols: STRIP_COLS,
    rows: 1,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  });

  // ---- 발머선 이름표 ----
  const named = ABSORPTION_LINES.filter((l) => l.labelKey);
  out.push({
    type: 'lineSet',
    id: 'balmer-ticks',
    lines: named.map((l) => [
      [xOfNm(l.nm), LINE_TICK[0]],
      [xOfNm(l.nm), LINE_TICK[1]],
    ]),
    width: GUIDE_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  for (const l of named) {
    out.push(label(`balmer-${l.nm}`, [xOfNm(l.nm), LINE_LABEL_Y], l.labelKey!, { fontSize: LINE_LABEL_PX, role: 'ink', italic: true }));
  }

  // ---- 파장 눈금 ----
  out.push({
    type: 'lineSet',
    id: 'wavelength-ticks',
    lines: WAVELENGTH_TICKS.map(({ nm }) => [
      [xOfNm(nm), STRIP_Y0],
      [xOfNm(nm), STRIP_Y0 - TICK_LEN],
    ]),
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  for (const { nm, key } of WAVELENGTH_TICKS) out.push(label(`wl-${nm}`, [xOfNm(nm), WAVELENGTH_LABEL_Y], key));

  // ---- 온도 축과 분광형 자리 ----
  out.push({
    type: 'trajectory',
    id: 'temperature-axis',
    points: [
      [PANEL_X0, GRAPH_Y0],
      [PANEL_X0 + PANEL_W, GRAPH_Y0],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'lineSet',
    id: 'class-ticks',
    lines: CLASS_IDS.map((k) => [
      [xOfT(c.classT[k]), GRAPH_Y0],
      [xOfT(c.classT[k]), GRAPH_Y0 - TICK_LEN],
    ]),
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push(label('strength-name', [STRENGTH_LABEL_POS[0], STRENGTH_LABEL_POS[1]], 'label.strength'));

  // ---- 선 세기 곡선 ----
  const yOf = (s: number): number => GRAPH_Y0 + GRAPH_H * s;
  for (const cv of CURVES) {
    const pts: Vec2[] = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const x = PANEL_X0 + (i / CURVE_SAMPLES) * PANEL_W;
      pts.push([x, yOf(groupStrength(cv.group, tOfX(x), c))]);
    }
    out.push({
      type: 'trajectory',
      id: `curve-${cv.group}`,
      points: pts,
      width: cv.width,
      style: { colorRole: cv.role, emphasis: 'strong', lineStyle: cv.lineStyle },
    });
    const lt = c.classT[cv.labelAt];
    out.push(
      label(`curve-name-${cv.group}`, [xOfT(lt), yOf(groupStrength(cv.group, lt, c)) + CURVE_LABEL_GAP], cv.key, {
        role: cv.role,
      }),
    );
  }

  // ---- 지금 온도 ----
  const xT = xOfT(T);
  out.push({
    type: 'trajectory',
    id: 'cursor',
    points: [
      [xT, GRAPH_Y0],
      [xT, GRAPH_Y0 + GRAPH_H + CURSOR_OVERSHOOT],
    ],
    width: CURSOR_WIDTH,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  for (const cv of CURVES) {
    out.push({
      type: 'body',
      id: `cursor-dot-${cv.group}`,
      pos: [xT, yOf(groupStrength(cv.group, T, c))],
      shape: 'point',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 분광형 글자 — 지금 가장 가까운 것만 강조색 ----
  const now = nearestClass(T, c);
  for (const k of CLASS_IDS) {
    const key = `class.${k}` as StellarSpectralClassMessageKey;
    out.push(
      label(`class-${k}`, [xOfT(c.classT[k]), CLASS_LABEL_Y], key, {
        fontSize: CLASS_PX,
        role: k === now ? 'accent' : 'muted',
        weight: 'bold',
      }),
    );
  }
  out.push(label('dir-hot', [PANEL_X0 + DIRECTION_INSET, CLASS_LABEL_Y], 'label.hotter'));
  out.push(label('dir-cool', [PANEL_X0 + PANEL_W - DIRECTION_INSET, CLASS_LABEL_Y], 'label.cooler'));

  // ---- 머무는 온도 — 선언값 그대로 ----
  const held = heldClass(tl);
  if (held !== null) {
    out.push(
      label('temperature', [xOfT(c.classT[held]), TEMP_LABEL_Y], 'label.temperature', {
        vars: { t: String(c.classT[held]) },
        fontSize: TEMP_PX,
        role: 'ink',
      }),
    );
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
