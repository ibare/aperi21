// ========================================================================
// capillary-action — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 액체 속 압력장 — 대야 · 관 속 기둥 · 색 기준 띠 — 은 `scalarField` 발산형이다.
// 원호 메니스커스로 끝나는 기둥 모양은 관 사각형 격자에서 액체 밖 칸을 대기압 값(바탕)으로
// 두어 만든다. 액체가 대기압 칸에서 공기 · 바탕과 섞여 사라지지 않도록 액체 위에 옅은
// `region` 막을 한 겹 덮는다 (NOTES 「어휘 부족」).
// ========================================================================

import type {
  Primitive,
  Readout,
  Region,
  ScalarField,
  SceneGraph,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { basinPressure, colorValue, liquidOf, tubePressure, type LiquidDerived } from './physics';
import {
  BASIN,
  CELLS_PER_PX,
  DEPTH,
  FRAME,
  LEGEND,
  PX_PER_MM,
  SCENE_BOUNDS,
  TUBE_HALF_W,
  TUBE_TOP,
  TUBE_X,
  WALL,
  Y0,
  text,
} from './schema';
import type { CapillaryActionState } from './state';

/** 원본 논리 좌표(y 아래로) → 월드(y 위로). */
const P = (x: number, y: number): Vec2 => [x, FRAME.height - y];
const mm2px = (m: number): number => m * 1000 * PX_PER_MM;

/** 관 아래 끝(논리 y). */
const TUBE_BOTTOM = Y0 + mm2px(DEPTH);
/** 발산형 — 대기압보다 낮음은 파랑(강조, 이 뜻에만), 높음은 갈색. */
const PRESSURE_COLORS: ScalarField['colors'] = { low: 'secondary', high: 'accent' };
/** 액체 막의 채움 불투명도 — 대기압 액체가 바탕과 갈리는 정도(원본의 옅은 회색 중립). */
const LIQUID_VEIL_OPACITY = 0.16;
/** 메니스커스 원호를 표본하는 점 수. */
const ARC_SAMPLES = 24;
/** 글자 크기(화면 px) — 원본. */
const LABEL_FONT_PX = 12;
const LEVEL_FONT_PX = 13;
/** 원본 글자 자리 오프셋(논리 px). */
const HEIGHT_LABEL_GAP = 6;
const RADIUS_LABEL_DY = 20;
const LEVEL_LABEL_GAP = 12;
const LEVEL_LINE_OVERHANG = 6;
const LEGEND_TEXT_DX = 18;
const LEGEND_TITLE_DY = 14;
const LEGEND_EDGE_DY = 6;
const LEGEND_TICK = { dx0: -3, dx1: 15 } as const;
const RADIUS_TEXT = ['0.25', '0.5', '1'] as const;

/** 메니스커스 면의 논리 y — 관 중심에서 `dx` 떨어진 자리. 오목(물)은 가운데가 낮고, 볼록(수은)은 가운데가 높다. */
function meniscusY(d: LiquidDerived, w: number, yh: number, dx: number): number {
  const R = w / Math.abs(d.cos === 0 ? 1e-6 : d.cos);
  const root = Math.sqrt(Math.max(R * R - dx * dx, 0));
  return d.cos >= 0 ? yh - R + root : yh + R - root;
}

function tubeField(d: LiquidDerived, i: number, h: number): ScalarField {
  const x = TUBE_X[i]!;
  const w = TUBE_HALF_W[i]!;
  const yh = Y0 - mm2px(h);
  const cols = Math.round(2 * w * CELLS_PER_PX);
  const rows = Math.round((TUBE_BOTTOM - TUBE_TOP) * CELLS_PER_PX);
  const values: number[] = new Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const ly = TUBE_TOP + (r + 0.5) / CELLS_PER_PX;
    const yM = (Y0 - ly) / PX_PER_MM / 1000;
    const p = colorValue(tubePressure(d, i, h, Math.min(yM, h)), d.pMax);
    for (let c = 0; c < cols; c++) {
      const dx = -w + (c + 0.5) / CELLS_PER_PX;
      // 액체 밖(관 속 공기)은 대기압 값 = 바탕으로 둔다 — 대야 액체를 지운다.
      values[r * cols + c] = ly >= meniscusY(d, w, yh, dx) ? p : 0;
    }
  }
  return {
    type: 'scalarField',
    id: `tube-liquid-${i}`,
    min: P(x - w, TUBE_BOTTOM),
    max: P(x + w, TUBE_TOP),
    cols,
    rows,
    values,
    range: [-1, 1],
    colors: PRESSURE_COLORS,
  };
}

/** 대야 액체 + 관 속 기둥을 한 경계로 두른 다각형 — 액체 막이 덮을 자리. */
function liquidOutline(d: LiquidDerived, h: readonly number[]): Vec2[] {
  const pts: Vec2[] = [P(BASIN.x0, Y0)];
  TUBE_X.forEach((x, i) => {
    const w = TUBE_HALF_W[i]!;
    const yh = Y0 - mm2px(h[i]!);
    pts.push(P(x - w, Y0));
    for (let k = 0; k <= ARC_SAMPLES; k++) {
      const dx = -w + (2 * w * k) / ARC_SAMPLES;
      pts.push(P(x + dx, meniscusY(d, w, yh, dx)));
    }
    pts.push(P(x + w, Y0));
  });
  pts.push(P(BASIN.x1, Y0), P(BASIN.x1, BASIN.bottom), P(BASIN.x0, BASIN.bottom));
  return pts;
}

function veil(id: string, points: Vec2[]): Region {
  return {
    type: 'region',
    id,
    points,
    fillOpacity: LIQUID_VEIL_OPACITY,
    style: { colorRole: 'muted' },
  };
}

function rect(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  return [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)];
}

function label(
  id: string,
  at: Vec2,
  body: Readout['text'],
  align: Readout['align'],
  fontSize: number,
  role: 'ink' | 'muted',
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: body,
    ...(vars ? { vars } : {}),
    chip: false,
    font: 'text',
    align,
    fontSize,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

export function scene(params: { state: CapillaryActionState }): SceneGraph {
  const { state } = params;
  const d = liquidOf(state.applied);
  const out: Primitive[] = [];

  // ---- 대야 액체 ----
  // 세로로만 변하는 정수압이라 가로 칸은 하나.
  const basinRows = Math.round((BASIN.bottom - Y0) * CELLS_PER_PX);
  const basinDepthM = (BASIN.bottom - Y0) / PX_PER_MM / 1000;
  const basinValues: number[] = [];
  for (let r = 0; r < basinRows; r++) {
    basinValues.push(colorValue(basinPressure(d, (basinDepthM * (r + 0.5)) / basinRows), d.pMax));
  }
  out.push({
    type: 'scalarField',
    id: 'basin-liquid',
    min: P(BASIN.x0, BASIN.bottom),
    max: P(BASIN.x1, Y0),
    cols: 1,
    rows: basinRows,
    values: basinValues,
    range: [-1, 1],
    colors: PRESSURE_COLORS,
  });

  // ---- 관 속 액체 기둥 ----
  for (let i = 0; i < TUBE_X.length; i++) out.push(tubeField(d, i, state.h[i]!));

  // ---- 액체 막 ----
  out.push(veil('liquid-veil', liquidOutline(d, state.h)));

  // ---- 대야 벽 ----
  const basinWall: Trajectory = {
    type: 'trajectory',
    id: 'basin-wall',
    points: [
      P(BASIN.x0, Y0 - BASIN.wallRise),
      P(BASIN.x0, BASIN.bottom),
      P(BASIN.x1, BASIN.bottom),
      P(BASIN.x1, Y0 - BASIN.wallRise),
    ],
    width: 2,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(basinWall);

  // ---- 유리관 ----
  TUBE_X.forEach((x, i) => {
    const w = TUBE_HALF_W[i]!;
    for (const [side, x0] of [['l', x - w - WALL], ['r', x + w]] as const) {
      out.push({
        type: 'region',
        id: `glass-${i}-${side}`,
        points: rect(x0, TUBE_TOP, x0 + WALL, TUBE_BOTTOM),
        fillOpacity: 1,
        opaque: true,
        style: { colorRole: 'muted', emphasis: 'medium' },
      });
    }
  });

  // ---- 바깥 수면 높이 ----
  out.push({
    type: 'trajectory',
    id: 'outer-level',
    points: [P(BASIN.x0 - LEVEL_LINE_OVERHANG, Y0 + 0.5), P(BASIN.x1 + LEVEL_LINE_OVERHANG, Y0 + 0.5)],
    width: 1,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push(label('outer-level-label', P(BASIN.x0 - LEVEL_LABEL_GAP, Y0), text('label.outerLevel'), 'right', LEVEL_FONT_PX, 'ink'));

  // ---- 기둥 높이 값 ----
  TUBE_X.forEach((x, i) => {
    const h = state.h[i]!;
    const mm = h * 1000;
    const value = (mm < 0 ? '−' : '') + Math.abs(mm).toFixed(1);
    out.push(
      label(
        `height-${i}`,
        P(x + TUBE_HALF_W[i]! + WALL + HEIGHT_LABEL_GAP, Y0 - mm2px(h)),
        text('label.height'),
        'left',
        LABEL_FONT_PX,
        'muted',
        { h: value },
      ),
    );
  });

  // ---- 관 반지름 표시 ----
  TUBE_X.forEach((x, i) => {
    out.push(
      label(`radius-${i}`, P(x, BASIN.bottom + RADIUS_LABEL_DY), text('label.radius'), 'center', LABEL_FONT_PX, 'muted', {
        r: RADIUS_TEXT[i]!,
      }),
    );
  });

  // ---- 압력 색 기준 ----
  // 액체와 같은 척도 함수(`colorValue`)에서 뽑는다 — 척도와 띠가 따로 놀지 않게.
  const legendRows = Math.round(LEGEND.y2 - LEGEND.y1);
  const legendValues: number[] = [];
  for (let r = 0; r < legendRows; r++) {
    const p = -d.pMax + (2 * d.pMax * (r + 0.5)) / legendRows;
    legendValues.push(colorValue(p, d.pMax));
  }
  out.push({
    type: 'scalarField',
    id: 'legend-bar',
    min: P(LEGEND.x, LEGEND.y2),
    max: P(LEGEND.x + LEGEND.width, LEGEND.y1),
    cols: 1,
    rows: legendRows,
    values: legendValues,
    range: [-1, 1],
    colors: PRESSURE_COLORS,
  });
  out.push(veil('legend-veil', rect(LEGEND.x, LEGEND.y1, LEGEND.x + LEGEND.width, LEGEND.y2)));
  const mid = (LEGEND.y1 + LEGEND.y2) / 2;
  out.push({
    type: 'trajectory',
    id: 'legend-tick',
    points: [P(LEGEND.x + LEGEND_TICK.dx0, mid), P(LEGEND.x + LEGEND_TICK.dx1, mid)],
    width: 1,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const lx = LEGEND.x + LEGEND_TEXT_DX;
  out.push(label('legend-title', P(LEGEND.x, LEGEND.y1 - LEGEND_TITLE_DY), text('label.pressure'), 'left', LABEL_FONT_PX, 'ink'));
  out.push(label('legend-low', P(lx, LEGEND.y1 + LEGEND_EDGE_DY), text('label.low'), 'left', LABEL_FONT_PX, 'muted'));
  out.push(label('legend-atm', P(lx, mid), text('label.atmospheric'), 'left', LABEL_FONT_PX, 'muted'));
  out.push(label('legend-high', P(lx, LEGEND.y2 - LEGEND_EDGE_DY), text('label.high'), 'left', LABEL_FONT_PX, 'muted'));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같아야 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
