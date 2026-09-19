// ========================================================================
// parallel-plate-capacitor — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 전지 기호(lineSet) ·
// 도선(trajectory) · 판(body rect) · 전하 표식(lineSet) · 간격 치수선(dimension) ·
// 전류 화살표(vector) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 전지 · 도선 · 판은 먹색(장치), **강조색은 「판에 담긴 전하」
// 한 가지 뜻에만**(+ · − 표식과 Q 이름표). + 와 − 는 색이 아니라 모양으로 가른다.
// 전류 화살표는 secondary, 간격 · 넓이 · 전압 표식은 muted.
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
import { markLayout, readConstants, readPlates } from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  BATTERY_X,
  GAP_MEASURE_X,
  MARK_INSET,
  PLATE_THICKNESS,
  PLATE_X0,
  SCENE_BOUNDS,
  WIRE_ATTACH_X,
  WIRE_Y,
  text,
} from './schema';
import type { ParallelPlateCapacitorState } from './state';

/** 전하 표식 +/− 의 반 길이(월드 단위) · 획 굵기(화면 px). */
const MARK_HALF = 0.11;
const MARK_WIDTH_PX = 2.4;
/** 도선 굵기(화면 px). */
const WIRE_WIDTH_PX = 2.5;
/** 전지 기호 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 전류 화살표의 길이 · 도선에서 안쪽으로 띄운 거리(월드 단위). */
const CURRENT_ARROW_LEN = 1.3;
const CURRENT_ARROW_GAP = 0.36;
/** 전류 화살표가 놓이는 가로 가운데 — 전지와 판 사이 도선의 한가운데. */
const CURRENT_X = (BATTERY_X + WIRE_ATTACH_X) / 2;
/** 이름표를 대상에서 띄우는 거리(월드 단위). */
const VOLTAGE_LABEL_GAP = 0.75;
const GAP_LABEL_GAP = 0.2;
const CHARGE_LABEL_GAP = 0.3;
const AREA_LABEL_RISE = 0.38;
const AREA_LABEL_INSET = 0.1;

export function scene(params: {
  state: ParallelPlateCapacitorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('parallel-plate-capacitor: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const p = readPlates(timeline, c);
  const out: Primitive[] = [];

  const half = p.gap / 2;
  const plateRight = PLATE_X0 + p.length;
  /** 위 판 · 아래 판 바깥 면의 높이 — 도선이 닿는 자리. */
  const topOuter = half + PLATE_THICKNESS;
  const bottomOuter = -half - PLATE_THICKNESS;
  /** 전지 두 판의 높이 — 도선이 닿는 자리. */
  const batteryTop = BATTERY_PLATE_GAP / 2;
  const batteryBottom = -BATTERY_PLATE_GAP / 2;

  // ---- 도선 ----
  // 전지의 + 단자(위)에서 위 판으로, − 단자(아래)에서 아래 판으로. 판이 움직이면
  // 판에 닿는 세로 토막만 늘고 준다.
  out.push({
    type: 'trajectory',
    id: 'wire-top',
    points: [
      [BATTERY_X, batteryTop],
      [BATTERY_X, WIRE_Y],
      [WIRE_ATTACH_X, WIRE_Y],
      [WIRE_ATTACH_X, topOuter],
    ],
    width: WIRE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'wire-bottom',
    points: [
      [BATTERY_X, batteryBottom],
      [BATTERY_X, -WIRE_Y],
      [WIRE_ATTACH_X, -WIRE_Y],
      [WIRE_ATTACH_X, bottomOuter],
    ],
    width: WIRE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 ----
  // 긴 판(+)이 위, 짧은 판(−)이 아래 — 위 도선이 + 단자에서 나간다. `circuitElement`
  // battery 는 리드선 끝과 기호 사이가 비어 회로가 끊긴 것처럼 보여 쓰지 않았다 (NOTES (c)).
  out.push({
    type: 'lineSet',
    id: 'battery-plus',
    lines: [
      [
        [BATTERY_X - BATTERY_LONG_HALF, batteryTop],
        [BATTERY_X + BATTERY_LONG_HALF, batteryTop],
      ],
    ],
    width: BATTERY_LONG_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'battery-minus',
    lines: [
      [
        [BATTERY_X - BATTERY_SHORT_HALF, batteryBottom],
        [BATTERY_X + BATTERY_SHORT_HALF, batteryBottom],
      ],
    ],
    width: BATTERY_SHORT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'voltage-label',
    anchor: { world: [BATTERY_X - VOLTAGE_LABEL_GAP, 0] },
    text: text('label.voltage'),
    vars: { v: String(c.voltage) },
    chip: false,
    fontSize: LABEL_PX,
    align: 'right',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 판 ----
  // 두 판은 같은 대상이라 같은 색 · 같은 모양이다. 넓힐 때는 오른쪽으로만 자란다.
  for (const [id, y] of [
    ['plate-top', half + PLATE_THICKNESS / 2],
    ['plate-bottom', -half - PLATE_THICKNESS / 2],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [PLATE_X0 + p.length / 2, y],
      shape: 'rect',
      size: [p.length, PLATE_THICKNESS],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 전하 표식 ----
  // 마주 보는 안쪽 면에 + 와 − 가 같은 수만큼. 개수가 곧 담긴 전하다 — 막 들어오는
  // 마지막 표식은 소수부만큼 옅다.
  const layout = markLayout(p.marks, p.length);
  const plusY = half - MARK_INSET;
  const minusY = -half + MARK_INSET;
  const plusLines: Vec2[][] = [];
  const plusOpacities: number[] = [];
  const minusLines: Vec2[][] = [];
  const minusOpacities: number[] = [];
  for (const m of layout) {
    const x = PLATE_X0 + m.x;
    plusLines.push([
      [x - MARK_HALF, plusY],
      [x + MARK_HALF, plusY],
    ]);
    plusLines.push([
      [x, plusY - MARK_HALF],
      [x, plusY + MARK_HALF],
    ]);
    plusOpacities.push(m.opacity, m.opacity);
    minusLines.push([
      [x - MARK_HALF, minusY],
      [x + MARK_HALF, minusY],
    ]);
    minusOpacities.push(m.opacity);
  }
  out.push({
    type: 'lineSet',
    id: 'charge-plus',
    lines: plusLines,
    opacities: plusOpacities,
    width: MARK_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'charge-minus',
    lines: minusLines,
    opacities: minusOpacities,
    width: MARK_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 간격 치수선 ----
  // 판 안쪽 면 사이를 늘 잰다. 이름표(d · d/2)는 판이 멈춰 있을 때만 붙는다 — 움직이는
  // 동안 `d` 가 남아 있으면 화면과 어긋난다.
  out.push({
    type: 'dimension',
    id: 'gap-measure',
    from: [GAP_MEASURE_X, -half],
    to: [GAP_MEASURE_X, half],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  if (p.settled) {
    const near = p.settled === 'near';
    const wide = p.settled === 'wide';
    out.push({
      type: 'readout',
      id: 'gap-label',
      anchor: { world: [GAP_MEASURE_X - GAP_LABEL_GAP, 0] },
      text: near ? text('label.gapDivided') : text('label.gap'),
      vars: near ? { n: String(c.gapDivisor) } : undefined,
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'area-label',
      anchor: { world: [plateRight - AREA_LABEL_INSET, topOuter + AREA_LABEL_RISE] },
      text: wide ? text('label.areaMultiplied') : text('label.area'),
      vars: wide ? { n: String(c.areaMultiple) } : undefined,
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      align: 'right',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });

    // 담긴 전하. 처음 판은 Q, 좁히거나 넓힌 판은 그 배수 — 배수는 스테이지 상수 그대로다.
    const multiple = near ? c.gapDivisor : wide ? c.areaMultiple : undefined;
    const labels = [
      {
        id: 'charge-label-plus',
        y: half + PLATE_THICKNESS / 2,
        base: text('label.chargePlus'),
        more: text('label.chargePlusMultiplied'),
      },
      {
        id: 'charge-label-minus',
        y: -half - PLATE_THICKNESS / 2,
        base: text('label.chargeMinus'),
        more: text('label.chargeMinusMultiplied'),
      },
    ];
    for (const l of labels) {
      out.push({
        type: 'readout',
        id: l.id,
        anchor: { world: [plateRight + CHARGE_LABEL_GAP, l.y] },
        text: multiple === undefined ? l.base : l.more,
        vars: multiple === undefined ? undefined : { n: String(multiple) },
        chip: false,
        fontSize: LABEL_PX,
        italic: true,
        weight: 'bold',
        align: 'left',
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // ---- 전류 ----
  // 전하가 바뀌는 동안에만. 들어올 때는 + 단자에서 위 판으로, 아래 판에서 − 단자로
  // (관례 전류 I). 돌아갈 때는 반대다.
  if (p.flow !== 0) {
    const top = p.flow * CURRENT_ARROW_LEN;
    // 이름 I 는 두 도선 사이 안쪽에 둔다 — 바깥쪽이면 도선에 얹힌다.
    const inward = p.flow > 0 ? 'cw' : 'ccw';
    out.push({
      type: 'vector',
      id: 'current-top',
      from: [CURRENT_X - top / 2, WIRE_Y - CURRENT_ARROW_GAP],
      delta: [top, 0],
      label: text('label.current'),
      labelSide: inward,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
    out.push({
      type: 'vector',
      id: 'current-bottom',
      from: [CURRENT_X + top / 2, -WIRE_Y + CURRENT_ARROW_GAP],
      delta: [-top, 0],
      label: text('label.current'),
      labelSide: inward,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
