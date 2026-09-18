// ========================================================================
// exoplanet-detection — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 판 — 관측자가 옆에서 본 궤도(별 · 행성 · 궤도 타원)와 그 아래 별빛의 스펙트럼 띠(흡수선 하나).
// 오른쪽 판 — 관측자가 받는 두 기록. 위는 별빛 밝기, 아래는 흡수선의 자리. 가로가 한 주기(두 바퀴)이고,
// 지금 자리까지는 이번 바퀴를 짙게, 그 뒤는 지난 주기를 옅게 긋는다(오실로스코프처럼 쓸고 지나간다).
//
// 색은 뜻마다 하나다.
//   · 별은 빛(빛 채널 1), 행성은 빛 없음(빛 채널 0) — 별빛을 가리는 검은 원판.
//   · 스펙트럼 띠는 파장마다 제 색(`@aperi21/plugin-optics`), 흡수선은 빛 없음.
//   · 두 기록 곡선은 같은 먹색 — 같은 별에서 온 두 기록이다.
//   · **강조색은 「지금」 한 뜻에만** — 두 기록 위의 지금 자리 점.
//   · 통과 순간을 잇는 세로선 · 주기 치수선 · 이름표 · 궤도 타원은 muted / secondary.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  angleAtFraction,
  cycleFraction,
  fluxAt,
  lineNm,
  orbitHalf,
  planetRadius,
  plotX,
  readConstants,
  recessionAt,
  sideView,
  stripColors,
  stripX,
  transitFractions,
  type ExoplanetDetectionConstants,
} from './physics';
import {
  FLUX_PLOT,
  PLOT,
  RATIO_ROW_Y,
  SCENE_BOUNDS,
  SHIFT_PLOT,
  SIDE_CENTER,
  STRIP,
  text,
  type ExoplanetDetectionMessageKey,
} from './schema';
import type { ExoplanetDetectionState } from './state';

/** 궤도 타원 반쪽의 표본 수. */
const ORBIT_SAMPLES = 90;
/** 기록 곡선의 한 주기 표본 수. 통과(한 바퀴의 1/10 남짓)가 곡선에서 모나지 않을 만큼. */
const CURVE_SAMPLES = 720;
/** 스펙트럼 띠의 칸 수. */
const STRIP_COLS = 200;

/** 궤도 타원 굵기(화면 px). 안내선이라 가늘다. */
const ORBIT_WIDTH_PX = 1.25;
/** 기록 곡선 굵기(화면 px). */
const CURVE_WIDTH_PX = 2;
/** 기록의 제자리 선 · 통과 세로선 · 스펙트럼 제자리 눈금 굵기(화면 px). */
const GUIDE_WIDTH_PX = 1;
/** 지난 주기 곡선의 불투명도 — 이번 바퀴가 쓸고 지나가며 새로 긋는다. */
const LAST_PASS_OPACITY = 0.3;
/** 지금 자리 점의 반지름(월드). */
const NOW_DOT_R = 0.07;
/** 흡수선 굵기(월드). */
const ABSORPTION_WIDTH = 0.05;
/** 스펙트럼 제자리 눈금이 띠 위아래로 삐져나오는 길이(월드). */
const REST_TICK_OVERHANG = 0.1;

/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 반지름 비 · 기록 이름 글자 크기(화면 px). */
const TITLE_PX = 13;
/** 주기 기호 `P` 글자 크기(화면 px). */
const PERIOD_PX = 14;

/** 기록 이름이 기록 위로 떨어진 거리(월드). */
const TITLE_GAP = 0.45;
/** 기록 왼쪽 이름표(붉은 쪽 · 푸른 쪽 · 제자리)를 기록 왼쪽 끝에서 띄우는 거리(화면 px). */
const SIDE_LABEL_GAP = 8;
/** 주기 치수선을 기록에서 띄우는 거리(월드) — 밝기 기록 위, 선 자리 기록 아래. */
const PERIOD_DIM_GAP = 0.22;
/** 주기 기호를 치수선에서 띄우는 거리(화면 px). */
const PERIOD_LABEL_GAP = 11;
/** 깊이 치수선을 첫 통과 자리에서 오른쪽으로 비키는 거리(월드). 파인 곳 바닥이 좁아 옆에 세운다. */
const DEPTH_DIM_DX = 0.28;
/** 깊이 이름표를 치수선에서 띄우는 거리(화면 px). */
const DEPTH_LABEL_GAP = 6;
/** 스펙트럼 제자리 이름표를 띠 아래로 내리는 거리(화면 px). */
const REST_LABEL_DROP = 14;

function label(
  id: string,
  key: ExoplanetDetectionMessageKey,
  world: Vec2,
  offset: Vec2,
  align: Readout['align'],
  fontSize: number,
  vars?: Record<string, string>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset },
    text: text(key),
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    fontSize,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 한 주기 [from, to] 구간의 기록 곡선 점들. */
function curve(
  from: number,
  to: number,
  y: (theta: number) => number,
  c: ExoplanetDetectionConstants,
): Vec2[] {
  const pts: Vec2[] = [];
  const n = Math.max(2, Math.ceil((to - from) * CURVE_SAMPLES));
  for (let i = 0; i <= n; i++) {
    const s = from + ((to - from) * i) / n;
    pts.push([plotX(s, PLOT.x0, PLOT.x1), y(angleAtFraction(s, c))]);
  }
  return pts;
}

export function scene(params: {
  state: ExoplanetDetectionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('exoplanet-detection: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const now = cycleFraction(tl);
  const theta = angleAtFraction(now, c);
  const view = sideView(theta, c);
  const out: Primitive[] = [];

  // ====================================================================
  // 왼쪽 판 — 옆에서 본 궤도
  // ====================================================================

  // 궤도 뒤 반은 점선 — 별 뒤로 돌아가는 쪽. 별 아래에 긋는다.
  out.push({
    type: 'trajectory',
    id: 'orbit-back',
    points: orbitHalf(false, ORBIT_SAMPLES, c),
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'medium', lineStyle: 'dashed' },
  });

  const planet: Primitive = {
    type: 'body',
    id: 'planet',
    pos: view.planet,
    shape: 'circle',
    size: planetRadius(c),
    light: 0,
    outline: 'line',
    glow: false,
  };
  if (!view.planetInFront) out.push(planet);

  // 별 — 빛. 가득 찬 빛은 라이트 바탕에 묻혀(G92) 테마의 선으로 둘레를 긋는다.
  out.push({
    type: 'body',
    id: 'star',
    pos: view.star,
    shape: 'circle',
    size: c.starRadius,
    light: 1,
    outline: 'line',
    glow: false,
  });

  // 궤도 앞 반은 실선 — 관측자 쪽. 별 앞을 지난다.
  out.push({
    type: 'trajectory',
    id: 'orbit-front',
    points: orbitHalf(true, ORBIT_SAMPLES, c),
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  if (view.planetInFront) out.push(planet);

  // 반지름 비 — 선언한 수를 그대로 쓴다(S-piece 유효숫자).
  out.push(
    label('radius-ratio', 'label.radiusRatio', [SIDE_CENTER[0], RATIO_ROW_Y], [0, 0], 'center', TITLE_PX, {
      star: String(c.starToPlanetRadius),
    }),
  );

  // ---- 스펙트럼 띠와 흡수선 ----
  out.push({
    type: 'scalarField',
    id: 'spectrum',
    min: [STRIP.x0, STRIP.y0],
    max: [STRIP.x1, STRIP.y1],
    cols: STRIP_COLS,
    rows: 1,
    values: stripColors(STRIP_COLS, c),
    range: [0, 1],
    colors: 'lightRgb',
  });
  const restX = stripX(c.restNm, c);
  out.push({
    type: 'trajectory',
    id: 'rest-tick',
    points: [
      [restX, STRIP.y0 - REST_TICK_OVERHANG],
      [restX, STRIP.y1 + REST_TICK_OVERHANG],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'body',
    id: 'absorption-line',
    pos: [stripX(lineNm(theta, c), c), (STRIP.y0 + STRIP.y1) / 2],
    shape: 'rect',
    size: [ABSORPTION_WIDTH, STRIP.y1 - STRIP.y0],
    light: 0,
    outline: 'none',
  });
  out.push(
    label(
      'rest-label',
      'label.rest',
      [restX, STRIP.y0 - REST_TICK_OVERHANG],
      [0, REST_LABEL_DROP],
      'center',
      LABEL_PX,
    ),
  );

  // ====================================================================
  // 오른쪽 판 — 두 기록
  // ====================================================================

  const fluxY = (th: number): number => FLUX_PLOT.top + ((fluxAt(th, c) - 1) / c.fluxWindow) * FLUX_PLOT.height;
  const shiftY = (th: number): number => SHIFT_PLOT.zero + recessionAt(th) * SHIFT_PLOT.amplitude;
  const shiftTop = SHIFT_PLOT.zero + SHIFT_PLOT.amplitude;
  const shiftBottom = SHIFT_PLOT.zero - SHIFT_PLOT.amplitude;

  out.push(label('flux-title', 'label.flux', [PLOT.x0, FLUX_PLOT.top + TITLE_GAP], [0, 0], 'left', TITLE_PX));
  out.push(label('shift-title', 'label.shift', [PLOT.x0, shiftTop + TITLE_GAP], [0, 0], 'left', TITLE_PX));

  // 선 자리 기록의 제자리 선과 양쪽 이름
  out.push({
    type: 'trajectory',
    id: 'shift-zero',
    points: [
      [PLOT.x0, SHIFT_PLOT.zero],
      [PLOT.x1, SHIFT_PLOT.zero],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push(label('shift-red', 'label.red', [PLOT.x0, shiftTop], [-SIDE_LABEL_GAP, 0], 'right', LABEL_PX));
  out.push(label('shift-rest', 'label.rest', [PLOT.x0, SHIFT_PLOT.zero], [-SIDE_LABEL_GAP, 0], 'right', LABEL_PX));
  out.push(label('shift-blue', 'label.blue', [PLOT.x0, shiftBottom], [-SIDE_LABEL_GAP, 0], 'right', LABEL_PX));

  // ---- 통과 순간을 잇는 세로선 · 같은 길이의 주기 치수선 둘 ----
  const transits = transitFractions(c).map((s) => plotX(s, PLOT.x0, PLOT.x1));
  const fluxDimY = FLUX_PLOT.top + PERIOD_DIM_GAP;
  const shiftDimY = shiftBottom - PERIOD_DIM_GAP;
  transits.forEach((x, i) => {
    out.push({
      type: 'trajectory',
      id: `transit-link-${i}`,
      points: [
        [x, fluxDimY],
        [x, shiftDimY],
      ],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
    });
  });
  const tA = transits[0];
  const tB = transits[1];
  if (tA !== undefined && tB !== undefined) {
    const mid = (tA + tB) / 2;
    out.push({ type: 'dimension', id: 'period-flux', from: [tA, fluxDimY], to: [tB, fluxDimY] });
    out.push(label('period-flux-label', 'label.period', [mid, fluxDimY], [0, -PERIOD_LABEL_GAP], 'center', PERIOD_PX));
    out.push({ type: 'dimension', id: 'period-shift', from: [tA, shiftDimY], to: [tB, shiftDimY] });
    out.push(label('period-shift-label', 'label.period', [mid, shiftDimY], [0, PERIOD_LABEL_GAP], 'center', PERIOD_PX));
  }

  // ---- 깊이 치수선 — 첫 통과 옆 ----
  if (tA !== undefined) {
    const depth = 1 / (c.starToPlanetRadius * c.starToPlanetRadius);
    const x = tA + DEPTH_DIM_DX;
    const bottom = FLUX_PLOT.top - (depth / c.fluxWindow) * FLUX_PLOT.height;
    out.push({ type: 'dimension', id: 'depth', from: [x, FLUX_PLOT.top], to: [x, bottom] });
    out.push(
      label('depth-label', 'label.depth', [x, (FLUX_PLOT.top + bottom) / 2], [DEPTH_LABEL_GAP, 0], 'left', LABEL_PX),
    );
  }

  // ---- 기록 곡선 — 지난 주기(옅게) · 이번 바퀴(짙게) ----
  const records: { id: string; y: (th: number) => number }[] = [
    { id: 'flux', y: fluxY },
    { id: 'shift', y: shiftY },
  ];
  for (const r of records) {
    if (now < 1) {
      out.push({
        type: 'trajectory',
        id: `${r.id}-last`,
        points: curve(now, 1, r.y, c),
        width: CURVE_WIDTH_PX,
        opacity: LAST_PASS_OPACITY,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    if (now > 0) {
      out.push({
        type: 'trajectory',
        id: `${r.id}-this`,
        points: curve(0, now, r.y, c),
        width: CURVE_WIDTH_PX,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'body',
      id: `${r.id}-now`,
      pos: [plotX(now, PLOT.x0, PLOT.x1), r.y(theta)],
      shape: 'circle',
      size: NOW_DOT_R,
      outline: 'background',
      glow: false,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
