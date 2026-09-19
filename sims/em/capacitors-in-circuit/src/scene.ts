// ========================================================================
// capacitors-in-circuit — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 패널마다 두 층이다.
//   위 — 도식. 축전기 기호는 plugin-circuit 의 `circuitElement`(capacitor)를 **선언만**
//        한다(import 하지 않는다). 값 글자는 스테이지 상수 `capacitance` 그대로(`2μF`).
//        기호 둘레의 이음선 · 단자는 `trajectory` · `terminal` 이다.
//   아래 — 판 그림. 전지(lineSet 두 획) · 도선(trajectory) · 판(body rect) · 전하 표식
//        (lineSet) · 간격 치수선(dimension) · 이름표(readout).
//
// 색은 뜻마다 하나다 — 전지 · 도선 · 판 · 도식은 먹색(장치), **강조색은 「판에 담긴
// 전하」 한 가지 뜻에만**(+ · − 표식과 Q 이름표). + 와 − 는 색이 아니라 모양으로 가른다.
// 넓이 · 간격 · 전압 · 패널 이름은 muted. 병렬과 직렬을 색으로 가르지 않는다 — 두
// 패널의 축전기는 같은 축전기다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  markLayout,
  parallelMarks,
  readConstants,
  readJoin,
  seriesMarks,
  type CapacitorsInCircuitConstants,
  type JoinReading,
} from './physics';
import {
  BATTERY_DX,
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  CAPACITOR_COUNT,
  DEVICE_DX,
  DEVICE_Y,
  MARK_INSET,
  PARALLEL_CX,
  PARALLEL_SPACE,
  PLATE_THICKNESS,
  SCENE_BOUNDS,
  SCHEMATIC_PARALLEL_SPREAD,
  SCHEMATIC_Y,
  SERIES_BRIDGE,
  SERIES_CX,
  WIRE_BOTTOM_Y,
  WIRE_TOP_Y,
  text,
} from './schema';
import type { CapacitorsInCircuitState } from './state';

/** 전하 표식 +/− 의 반 길이(월드 단위) · 획 굵기(화면 px). */
const MARK_HALF = 0.1;
const MARK_WIDTH_PX = 2.4;
/** 판 그림 도선 굵기(화면 px). */
const WIRE_WIDTH_PX = 2.5;
/**
 * 도식 이음선 굵기(화면 px). `circuitElement` 리드선이 테마의 `thick`(2 px)으로 그어지므로
 * 같은 굵기로 맞춘다 — 기호와 이음선이 한 선으로 읽혀야 한다.
 */
const SCHEMATIC_WIRE_PX = 2;
/** 전지 기호 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 이름표를 대상에서 띄우는 거리(월드 단위). */
const VOLTAGE_LABEL_GAP = 0.7;
const CHARGE_LABEL_GAP = 0.22;
const AREA_LABEL_RISE = 0.34;
const AREA_LABEL_INSET = 0.12;
const GAP_MEASURE_OFFSET = 0.42;
const GAP_LABEL_GAP = 0.18;
const PANEL_LABEL_GAP = 0.35;

/**
 * `circuitElement` 기호 한 칸의 반 길이(월드 단위) — 렌더러가 소자 로컬 ±1 을 두 단자로
 * 쓴다. 리드선은 그 바깥 25% 까지만 그어지고(±1 → ±0.5) 기호는 가운데 ±3 px 에 그려져,
 * 둘 사이가 빈다(장부 G178 의 축전기 판). 그 빈 곳을 이음선으로 채운다.
 */
const SYMBOL_HALF = 1;
const SYMBOL_LEAD_END = 0.5;
/** 빈 곳을 채우는 이음선이 기호 가운데에서 멈추는 거리(월드 단위) — 판 획 안쪽에 닿는다. */
const SYMBOL_LEAD_REACH = 0.07;
/** 도식 바깥 단자까지의 이음선 길이(월드 단위). */
const SCHEMATIC_LEAD = 0.5;

export function scene(params: {
  state: CapacitorsInCircuitState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('capacitors-in-circuit: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const j = readJoin(timeline);
  const out: Primitive[] = [];
  const marks = new MarkSink();

  parallelPanel(out, marks, c, j);
  seriesPanel(out, marks, c, j);
  marks.flush(out);

  // 이름표는 표식 위에 온다 — scene 순서로 겹친다(`drawOrder: 'scene'`).
  parallelLabels(out, c, j);
  seriesLabels(out, c, j);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

// ------------------------------------------------------------------------
// 병렬 — 두 축전기가 옆으로 다가가 판이 한 장으로 붙는다
// ------------------------------------------------------------------------

/** 병렬 두 축전기의 가운데 가로 자리. 빈 폭이 `1 − join` 을 따라 줄어 0 이면 판이 붙는다. */
function parallelCenters(c: CapacitorsInCircuitConstants, j: JoinReading): [number, number] {
  const capX = PARALLEL_CX + DEVICE_DX;
  const sep = c.plateLength + PARALLEL_SPACE * (1 - j.join);
  return [capX - sep / 2, capX + sep / 2];
}

function parallelPanel(out: Primitive[], marks: MarkSink, c: CapacitorsInCircuitConstants, j: JoinReading): void {
  const cx = PARALLEL_CX;
  const [xa, xb] = parallelCenters(c, j);
  const topInner = DEVICE_Y + c.plateGap / 2;
  const botInner = DEVICE_Y - c.plateGap / 2;
  const topOuter = topInner + PLATE_THICKNESS;
  const botOuter = botInner - PLATE_THICKNESS;

  schematicParallel(out, cx + DEVICE_DX, c);
  battery(out, 'par', cx, c);

  // 도선 — 전지 + 단자에서 두 위 판으로, − 단자에서 두 아래 판으로. 갈림점은 먹색 점.
  const bx = cx + BATTERY_DX;
  out.push(wire('par-wire-top', [
    [bx, DEVICE_Y + BATTERY_PLATE_GAP / 2],
    [bx, WIRE_TOP_Y],
    [xa, WIRE_TOP_Y],
    [xa, topOuter],
  ]));
  out.push(wire('par-wire-top-branch', [
    [xa, WIRE_TOP_Y],
    [xb, WIRE_TOP_Y],
    [xb, topOuter],
  ]));
  out.push(wire('par-wire-bottom', [
    [bx, DEVICE_Y - BATTERY_PLATE_GAP / 2],
    [bx, WIRE_BOTTOM_Y],
    [xa, WIRE_BOTTOM_Y],
    [xa, botOuter],
  ]));
  out.push(wire('par-wire-bottom-branch', [
    [xa, WIRE_BOTTOM_Y],
    [xb, WIRE_BOTTOM_Y],
    [xb, botOuter],
  ]));
  out.push({ type: 'terminal', id: 'par-junction-top', pos: [xa, WIRE_TOP_Y], kind: 'junction' });
  out.push({ type: 'terminal', id: 'par-junction-bottom', pos: [xa, WIRE_BOTTOM_Y], kind: 'junction' });

  // 판 — 두 축전기는 같은 대상이라 같은 색 · 같은 모양이다.
  const n = parallelMarks(c);
  for (const [k, xc] of [['a', xa], ['b', xb]] as const) {
    const x0 = xc - c.plateLength / 2;
    const x1 = xc + c.plateLength / 2;
    out.push(plate(`par-plate-top-${k}`, x0, x1, topInner + PLATE_THICKNESS / 2, PLATE_THICKNESS, 1));
    out.push(plate(`par-plate-bottom-${k}`, x0, x1, botInner - PLATE_THICKNESS / 2, PLATE_THICKNESS, 1));
    marks.row('plus', x0, c.plateLength, n, topInner - MARK_INSET, 1);
    marks.row('minus', x0, c.plateLength, n, botInner + MARK_INSET, 1);
  }
}

function parallelLabels(out: Primitive[], c: CapacitorsInCircuitConstants, j: JoinReading): void {
  if (!j.settled) return;
  const [xa, xb] = parallelCenters(c, j);
  const topY = DEVICE_Y + c.plateGap / 2 + PLATE_THICKNESS / 2;
  const botY = DEVICE_Y - c.plateGap / 2 - PLATE_THICKNESS / 2;
  const areaY = DEVICE_Y + c.plateGap / 2 + PLATE_THICKNESS + AREA_LABEL_RISE;
  const n = String(CAPACITOR_COUNT);

  if (j.settled === 'two') {
    for (const [k, xc] of [['a', xa], ['b', xb]] as const) {
      const right = xc + c.plateLength / 2;
      out.push(chargeLabel(`par-q-plus-${k}`, [right + CHARGE_LABEL_GAP, topY], text('label.chargePlus')));
      out.push(chargeLabel(`par-q-minus-${k}`, [right + CHARGE_LABEL_GAP, botY], text('label.chargeMinus')));
      out.push(geometryLabel(`par-area-${k}`, [right - AREA_LABEL_INSET, areaY], text('label.area'), undefined, 'right'));
    }
    return;
  }
  // 합친 하나 — 넓이 2A, 전하 2Q.
  const right = xb + c.plateLength / 2;
  out.push(chargeLabel('par-q-plus', [right + CHARGE_LABEL_GAP, topY], text('label.chargePlusMultiplied'), { n }));
  out.push(chargeLabel('par-q-minus', [right + CHARGE_LABEL_GAP, botY], text('label.chargeMinusMultiplied'), { n }));
  out.push(geometryLabel('par-area', [right - AREA_LABEL_INSET, areaY], text('label.areaMultiplied'), { n }, 'right'));
}

// ------------------------------------------------------------------------
// 직렬 — 두 축전기를 잇는 가운데 도체가 얇아져 사라진다
// ------------------------------------------------------------------------

interface SeriesGeometry {
  /** 가운데 도체가 남은 몫 = 1 − join. 두께와 짙기가 이것을 따른다. */
  keep: number;
  /** 가운데 도체의 위 · 아래 면. */
  midTop: number;
  midBottom: number;
  /** 바깥 두 판의 안쪽 면. 늘 가운데 도체에서 간격 d 만큼 떨어져 있다. */
  topInner: number;
  botInner: number;
}

function seriesGeometry(c: CapacitorsInCircuitConstants, j: JoinReading): SeriesGeometry {
  const keep = 1 - j.join;
  const middle = 2 * PLATE_THICKNESS + SERIES_BRIDGE;
  const midTop = DEVICE_Y + (keep * middle) / 2;
  const midBottom = DEVICE_Y - (keep * middle) / 2;
  return { keep, midTop, midBottom, topInner: midTop + c.plateGap, botInner: midBottom - c.plateGap };
}

function seriesPanel(out: Primitive[], marks: MarkSink, c: CapacitorsInCircuitConstants, j: JoinReading): void {
  const cx = SERIES_CX;
  const capX = cx + DEVICE_DX;
  const g = seriesGeometry(c, j);
  const x0 = capX - c.plateLength / 2;
  const x1 = capX + c.plateLength / 2;
  const t = PLATE_THICKNESS;

  schematicSeries(out, capX, c);
  battery(out, 'ser', cx, c);

  // 도선 — 전지 + 단자에서 맨 위 판으로, 맨 아래 판에서 − 단자로.
  const bx = cx + BATTERY_DX;
  out.push(wire('ser-wire-top', [
    [bx, DEVICE_Y + BATTERY_PLATE_GAP / 2],
    [bx, WIRE_TOP_Y],
    [capX, WIRE_TOP_Y],
    [capX, g.topInner + t],
  ]));
  out.push(wire('ser-wire-bottom', [
    [bx, DEVICE_Y - BATTERY_PLATE_GAP / 2],
    [bx, WIRE_BOTTOM_Y],
    [capX, WIRE_BOTTOM_Y],
    [capX, g.botInner - t],
  ]));

  // 바깥 두 판.
  out.push(plate('ser-plate-top', x0, x1, g.topInner + t / 2, t, 1));
  out.push(plate('ser-plate-bottom', x0, x1, g.botInner - t / 2, t, 1));

  // 가운데 도체 — 위 축전기의 아래 판 + 잇는 도선 + 아래 축전기의 위 판. 두께가 0 으로
  // 줄며 옅어진다. 다 사라지면 그리지 않는다(두께 0 인 사각형은 선언할 것이 없다).
  if (g.keep > 0) {
    const tk = t * g.keep;
    out.push(plate('ser-plate-mid-upper', x0, x1, g.midTop - tk / 2, tk, g.keep));
    out.push(plate('ser-plate-mid-lower', x0, x1, g.midBottom + tk / 2, tk, g.keep));
    out.push(wire('ser-bridge', [
      [capX, g.midTop - tk],
      [capX, g.midBottom + tk],
    ], g.keep));
  }

  // 전하 — 바깥 판은 늘 Q/2. 가운데 도체의 두 면(−Q/2 · +Q/2)은 도체와 함께 옅어진다.
  const n = seriesMarks(c);
  marks.row('plus', x0, c.plateLength, n, g.topInner - MARK_INSET, 1);
  marks.row('minus', x0, c.plateLength, n, g.botInner + MARK_INSET, 1);
  if (g.keep > 0) {
    marks.row('minus', x0, c.plateLength, n, g.midTop + MARK_INSET, g.keep);
    marks.row('plus', x0, c.plateLength, n, g.midBottom - MARK_INSET, g.keep);
  }

  // 간격 치수선 — 떨어져 있을 때는 두 간격 d 를 따로, 합친 하나는 한 번에 잰다.
  const mx = x0 - GAP_MEASURE_OFFSET;
  if (j.settled === 'merged') {
    out.push(measure('ser-gap', mx, g.botInner, g.topInner));
  } else {
    out.push(measure('ser-gap-upper', mx, g.midTop, g.topInner));
    out.push(measure('ser-gap-lower', mx, g.botInner, g.midBottom));
  }
}

function seriesLabels(out: Primitive[], c: CapacitorsInCircuitConstants, j: JoinReading): void {
  if (!j.settled) return;
  const g = seriesGeometry(c, j);
  const capX = SERIES_CX + DEVICE_DX;
  const right = capX + c.plateLength / 2 + CHARGE_LABEL_GAP;
  const left = capX - c.plateLength / 2 - GAP_MEASURE_OFFSET - GAP_LABEL_GAP;
  const t = PLATE_THICKNESS;
  const n = { n: String(CAPACITOR_COUNT) };

  // 바깥 두 판은 두 그림 모두 Q/2.
  out.push(chargeLabel('ser-q-plus', [right, g.topInner + t / 2], text('label.chargePlusDivided'), n));
  out.push(chargeLabel('ser-q-minus', [right, g.botInner - t / 2], text('label.chargeMinusDivided'), n));

  if (j.settled === 'two') {
    out.push(chargeLabel('ser-q-mid-minus', [right, g.midTop - t / 2], text('label.chargeMinusDivided'), n));
    out.push(chargeLabel('ser-q-mid-plus', [right, g.midBottom + t / 2], text('label.chargePlusDivided'), n));
    out.push(geometryLabel('ser-gap-upper-label', [left, (g.midTop + g.topInner) / 2], text('label.gap'), undefined, 'right'));
    out.push(geometryLabel('ser-gap-lower-label', [left, (g.botInner + g.midBottom) / 2], text('label.gap'), undefined, 'right'));
    return;
  }
  // 합친 하나 — 간격 2d.
  out.push(geometryLabel('ser-gap-label', [left, DEVICE_Y], text('label.gapMultiplied'), n, 'right'));
}

// ------------------------------------------------------------------------
// 도식 — circuitElement(capacitor) 선언
// ------------------------------------------------------------------------

/** 병렬 도식 — 기호 둘이 위아래로 서고 양옆 세로선이 둘을 묶는다. */
function schematicParallel(out: Primitive[], capX: number, c: CapacitorsInCircuitConstants): void {
  const yTop = SCHEMATIC_Y + SCHEMATIC_PARALLEL_SPREAD / 2;
  const yBot = SCHEMATIC_Y - SCHEMATIC_PARALLEL_SPREAD / 2;
  capacitorSymbol(out, 'par-sym-1', [capX, yTop], c);
  capacitorSymbol(out, 'par-sym-2', [capX, yBot], c);
  const l = capX - SYMBOL_HALF;
  const r = capX + SYMBOL_HALF;
  out.push(schematicWire('par-sym-bus-left', [[l, yTop], [l, yBot]]));
  out.push(schematicWire('par-sym-bus-right', [[r, yTop], [r, yBot]]));
  out.push(schematicWire('par-sym-lead-left', [[l, SCHEMATIC_Y], [l - SCHEMATIC_LEAD, SCHEMATIC_Y]]));
  out.push(schematicWire('par-sym-lead-right', [[r, SCHEMATIC_Y], [r + SCHEMATIC_LEAD, SCHEMATIC_Y]]));
  out.push({ type: 'terminal', id: 'par-sym-junction-left', pos: [l, SCHEMATIC_Y], kind: 'junction' });
  out.push({ type: 'terminal', id: 'par-sym-junction-right', pos: [r, SCHEMATIC_Y], kind: 'junction' });
  out.push({ type: 'terminal', id: 'par-sym-end-left', pos: [l - SCHEMATIC_LEAD, SCHEMATIC_Y], kind: 'node' });
  out.push({ type: 'terminal', id: 'par-sym-end-right', pos: [r + SCHEMATIC_LEAD, SCHEMATIC_Y], kind: 'node' });
  out.push(panelLabel('par-name', [l - SCHEMATIC_LEAD - PANEL_LABEL_GAP, SCHEMATIC_Y], text('label.parallel')));
}

/** 직렬 도식 — 기호 둘이 한 줄로 맞붙는다. */
function schematicSeries(out: Primitive[], capX: number, c: CapacitorsInCircuitConstants): void {
  capacitorSymbol(out, 'ser-sym-1', [capX - SYMBOL_HALF, SCHEMATIC_Y], c);
  capacitorSymbol(out, 'ser-sym-2', [capX + SYMBOL_HALF, SCHEMATIC_Y], c);
  const l = capX - 2 * SYMBOL_HALF;
  const r = capX + 2 * SYMBOL_HALF;
  out.push(schematicWire('ser-sym-lead-left', [[l, SCHEMATIC_Y], [l - SCHEMATIC_LEAD, SCHEMATIC_Y]]));
  out.push(schematicWire('ser-sym-lead-right', [[r, SCHEMATIC_Y], [r + SCHEMATIC_LEAD, SCHEMATIC_Y]]));
  out.push({ type: 'terminal', id: 'ser-sym-end-left', pos: [l - SCHEMATIC_LEAD, SCHEMATIC_Y], kind: 'node' });
  out.push({ type: 'terminal', id: 'ser-sym-end-right', pos: [r + SCHEMATIC_LEAD, SCHEMATIC_Y], kind: 'node' });
  out.push(panelLabel('ser-name', [l - SCHEMATIC_LEAD - PANEL_LABEL_GAP, SCHEMATIC_Y], text('label.series')));
}

/**
 * 축전기 기호 하나(가로로 누움) — 선언만 한다. 값 글자는 스테이지 상수 그대로이고
 * 단위는 표식이다. 리드선 끝과 기호 사이의 빈 곳은 이음선 두 토막으로 채운다(G178).
 */
function capacitorSymbol(out: Primitive[], id: string, pos: Vec2, c: CapacitorsInCircuitConstants): void {
  out.push({
    type: 'circuitElement',
    id,
    subtype: 'capacitor',
    pos,
    rotation: 0,
    value: c.capacitance,
    unit: 'μF',
  });
  const [x, y] = pos;
  out.push(schematicWire(`${id}-fill-a`, [[x - SYMBOL_LEAD_END, y], [x - SYMBOL_LEAD_REACH, y]]));
  out.push(schematicWire(`${id}-fill-b`, [[x + SYMBOL_LEAD_REACH, y], [x + SYMBOL_LEAD_END, y]]));
}

// ------------------------------------------------------------------------
// 공통 조각
// ------------------------------------------------------------------------

/** 전지 — 긴 판(+)이 위, 짧은 판(−)이 아래. 왼쪽에 전압 이름표. (G178: circuitElement battery 대신) */
function battery(out: Primitive[], prefix: string, cx: number, c: CapacitorsInCircuitConstants): void {
  const bx = cx + BATTERY_DX;
  const top = DEVICE_Y + BATTERY_PLATE_GAP / 2;
  const bottom = DEVICE_Y - BATTERY_PLATE_GAP / 2;
  out.push({
    type: 'lineSet',
    id: `${prefix}-battery-plus`,
    lines: [[[bx - BATTERY_LONG_HALF, top], [bx + BATTERY_LONG_HALF, top]]],
    width: BATTERY_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: `${prefix}-battery-minus`,
    lines: [[[bx - BATTERY_SHORT_HALF, bottom], [bx + BATTERY_SHORT_HALF, bottom]]],
    width: BATTERY_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `${prefix}-voltage`,
    anchor: { world: [bx - VOLTAGE_LABEL_GAP, DEVICE_Y] },
    text: text('label.voltage'),
    vars: { v: String(c.voltage) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
}

function wire(id: string, points: Vec2[], opacity = 1): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: WIRE_WIDTH_PX,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function schematicWire(id: string, points: Vec2[]): Primitive {
  return {
    type: 'trajectory',
    id,
    points,
    width: SCHEMATIC_WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function plate(id: string, x0: number, x1: number, y: number, thickness: number, opacity: number): Primitive {
  return {
    type: 'body',
    id,
    pos: [(x0 + x1) / 2, y],
    shape: 'rect',
    size: [x1 - x0, thickness],
    outline: 'none',
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function measure(id: string, x: number, from: number, to: number): Primitive {
  return {
    type: 'dimension',
    id,
    from: [x, from],
    to: [x, to],
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function chargeLabel(id: string, at: Vec2, label: LocalizedText, vars?: Record<string, string>): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    vars,
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    weight: 'bold',
    align: 'left',
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

function geometryLabel(
  id: string,
  at: Vec2,
  label: LocalizedText,
  vars: Record<string, string> | undefined,
  align: 'left' | 'right',
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    vars,
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function panelLabel(id: string, at: Vec2, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/**
 * 전하 표식 모으개 — + 는 두 획, − 는 한 획. 두 패널의 표식을 한 묶음(+ 하나, − 하나)
 * 으로 모아 선언한다. 짙기는 획마다 준다(가운데 도체와 함께 옅어지는 표식).
 */
class MarkSink {
  private plus: Vec2[][] = [];
  private plusOpacity: number[] = [];
  private minus: Vec2[][] = [];
  private minusOpacity: number[] = [];

  row(sign: 'plus' | 'minus', x0: number, length: number, count: number, y: number, opacity: number): void {
    for (const m of markLayout(count, length)) {
      const x = x0 + m.x;
      const a = m.opacity * opacity;
      if (sign === 'plus') {
        this.plus.push([[x - MARK_HALF, y], [x + MARK_HALF, y]]);
        this.plus.push([[x, y - MARK_HALF], [x, y + MARK_HALF]]);
        this.plusOpacity.push(a, a);
      } else {
        this.minus.push([[x - MARK_HALF, y], [x + MARK_HALF, y]]);
        this.minusOpacity.push(a);
      }
    }
  }

  flush(out: Primitive[]): void {
    out.push({
      type: 'lineSet',
      id: 'charge-plus',
      lines: this.plus,
      opacities: this.plusOpacity,
      width: MARK_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: 'charge-minus',
      lines: this.minus,
      opacities: this.minusOpacity,
      width: MARK_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
}
