// ========================================================================
// dielectric — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 판(body rect) · 유전체 판(region) ·
// 분자 쌍극자(body custom 타원 + lineSet 의 + · − 획) · 자유 전하 표식(lineSet) ·
// 장 화살표(vector) · 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 판은 먹색(장치), **강조색은 「판의 자유 전하」 한 뜻에만**(+ · − 표식과
// Q 이름표). 장 화살표와 E 이름표는 primary. 유전체 면과 κ 는 muted, 쌍극자(묶인 전하)는
// 먹색 — 판의 전하와 다른 대상이라 강조색을 빌리지 않는다. + 와 − 는 색이 아니라 모양으로 가른다.
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
  alignment,
  dipoleAngle,
  markLayout,
  molecules,
  readConstants,
  readSlab,
} from './physics';
import {
  MARK_INSET,
  PLATE_THICKNESS,
  PLATE_X0,
  SCENE_BOUNDS,
  SLAB_CLEARANCE,
  text,
} from './schema';
import type { DielectricState } from './state';

/** 자유 전하 표식 +/− 의 반 길이(월드 단위) · 획 굵기(화면 px). */
const MARK_HALF = 0.1;
const MARK_WIDTH_PX = 2.4;
/** 쌍극자 타원의 긴 · 짧은 반지름(월드 단위). */
const DIPOLE_HALF_LONG = 0.27;
const DIPOLE_HALF_SHORT = 0.13;
/** 쌍극자 안 + · − 가 가운데에서 떨어진 거리 · 그 획의 반 길이(월드 단위) · 굵기(화면 px). */
const POLE_OFFSET = 0.15;
const POLE_HALF = 0.06;
const POLE_WIDTH_PX = 1.6;
/** 장 화살표 굵기(화면 px). */
const FIELD_WIDTH_PX = 2.2;
/** 유전체 면의 채움 불투명도. 쌍극자 · 화살표가 비쳐 보이는 정도. */
const SLAB_FILL_OPACITY = 0.16;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 전하 · κ 이름표를 판 바깥 면에서 띄우는 높이, 장 이름표를 판 왼쪽 끝에서 띄우는 거리(월드 단위). */
const LABEL_RISE = 0.34;
const FIELD_LABEL_GAP = 0.3;

/** 타원 외형(쌍극자). pos 기준 월드 단위, 긴 축이 x — `orientation` 만큼 돈다. */
const DIPOLE_PATH =
  `M ${-DIPOLE_HALF_LONG} 0 ` +
  `A ${DIPOLE_HALF_LONG} ${DIPOLE_HALF_SHORT} 0 1 0 ${DIPOLE_HALF_LONG} 0 ` +
  `A ${DIPOLE_HALF_LONG} ${DIPOLE_HALF_SHORT} 0 1 0 ${-DIPOLE_HALF_LONG} 0 Z`;

/** 가로 · 세로 두 획의 + 표식. */
function plusMark(x: number, y: number, half: number): Vec2[][] {
  return [
    [
      [x - half, y],
      [x + half, y],
    ],
    [
      [x, y - half],
      [x, y + half],
    ],
  ];
}

/** 가로 한 획의 − 표식. */
function minusMark(x: number, y: number, half: number): Vec2[] {
  return [
    [x - half, y],
    [x + half, y],
  ];
}

export function scene(params: {
  state: DielectricState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('dielectric: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = readSlab(timeline, c);
  const out: Primitive[] = [];

  const half = c.plateGap / 2;
  const plateLeft = PLATE_X0;
  const plateRight = PLATE_X0 + c.plateLength;
  const topOuter = half + PLATE_THICKNESS;
  const bottomOuter = -half - PLATE_THICKNESS;
  const slabHalf = half - SLAB_CLEARANCE;
  const slabRight = s.slabLeft + c.plateLength;
  const kappaText = String(c.kappa);

  // ---- 유전체 판 ----
  out.push({
    type: 'region',
    id: 'slab',
    points: [
      [s.slabLeft, -slabHalf],
      [slabRight, -slabHalf],
      [slabRight, slabHalf],
      [s.slabLeft, slabHalf],
    ],
    fillOpacity: SLAB_FILL_OPACITY,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 분자 쌍극자 ----
  // 타원 하나에 + 와 − 한 짝. 판 가장자리를 지나며 쉬던 방향에서 장 방향(아래)으로 돈다.
  const poleLines: Vec2[][] = [];
  molecules(c).forEach((m, i) => {
    const x = s.slabLeft + m.u * c.plateLength;
    const y = -slabHalf + m.v * 2 * slabHalf;
    const a = alignment(x, plateLeft, plateRight, c.fringe);
    const th = dipoleAngle(m.rest, a);
    out.push({
      type: 'body',
      id: `dipole-${i}`,
      pos: [x, y],
      shape: 'custom',
      customPath: DIPOLE_PATH,
      orientation: th,
      fill: 'none',
      outline: 'role',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
    const ux = Math.cos(th) * POLE_OFFSET;
    const uy = Math.sin(th) * POLE_OFFSET;
    poleLines.push(...plusMark(x + ux, y + uy, POLE_HALF));
    poleLines.push(minusMark(x - ux, y - uy, POLE_HALF));
  });
  out.push({
    type: 'lineSet',
    id: 'dipole-poles',
    lines: poleLines,
    width: POLE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 장 화살표 ----
  // 쌍극자 열 사이마다 하나. 판이 도체라 장은 판 사이 어디서나 같다 — 유전체가 반만
  // 들어와도 모든 화살표가 함께 짧아진다.
  const cols = Math.max(1, Math.round(c.moleculeColumns));
  const len = c.fieldArrowLength * s.fieldRatio;
  for (let k = 1; k < cols; k++) {
    const x = plateLeft + (k * c.plateLength) / cols;
    out.push({
      type: 'vector',
      id: `field-${k}`,
      from: [x, len / 2],
      delta: [0, -len],
      width: FIELD_WIDTH_PX,
      // 유전체가 들어오는 동안 쌍극자 타원 위를 지난다 — 바탕으로 도려내 제 모양을 지킨다.
      outline: 'background',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 판 ----
  for (const [id, y] of [
    ['plate-top', half + PLATE_THICKNESS / 2],
    ['plate-bottom', -half - PLATE_THICKNESS / 2],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [plateLeft + c.plateLength / 2, y],
      shape: 'rect',
      size: [c.plateLength, PLATE_THICKNESS],
      outline: 'none',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 자유 전하 표식 ----
  // 수는 한 주기 내내 같다(전지에서 뗀 판). 유전체가 덮은 쪽으로 κ 배 촘촘히 몰린다.
  const layout = markLayout(Math.round(c.chargeMarks), c.plateLength, s.filled, c.kappa);
  const plusLines: Vec2[][] = [];
  const minusLines: Vec2[][] = [];
  for (const mx of layout) {
    const x = plateLeft + mx;
    plusLines.push(...plusMark(x, half - MARK_INSET, MARK_HALF));
    minusLines.push(minusMark(x, -half + MARK_INSET, MARK_HALF));
  }
  out.push({
    type: 'lineSet',
    id: 'charge-plus',
    lines: plusLines,
    width: MARK_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'charge-minus',
    lines: minusLines,
    width: MARK_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 이름표 ----
  // 판의 전하는 늘 같다 — +Q · −Q 는 바뀌지 않는다.
  for (const l of [
    { id: 'charge-label-plus', y: topOuter + LABEL_RISE, t: text('label.chargePlus') },
    { id: 'charge-label-minus', y: bottomOuter - LABEL_RISE, t: text('label.chargeMinus') },
  ]) {
    out.push({
      type: 'readout',
      id: l.id,
      anchor: { world: [plateLeft, l.y] },
      text: l.t,
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      weight: 'bold',
      align: 'left',
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 유전율은 유전체 판을 따라다닌다 — 판 위쪽 바깥에.
  out.push({
    type: 'readout',
    id: 'kappa-label',
    anchor: { world: [s.slabLeft + c.plateLength / 2, topOuter + LABEL_RISE] },
    text: text('label.kappa'),
    vars: { k: kappaText },
    chip: false,
    fontSize: LABEL_PX,
    italic: true,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 장의 이름은 유전체가 멈춰 있을 때만 — 움직이는 동안 `E` 가 남아 있으면 화면과 어긋난다.
  if (s.settled) {
    out.push({
      type: 'readout',
      id: 'field-label',
      anchor: { world: [plateLeft - FIELD_LABEL_GAP, 0] },
      text: s.settled === 'filled' ? text('label.fieldDivided') : text('label.field'),
      vars: s.settled === 'filled' ? { k: kappaText } : undefined,
      chip: false,
      fontSize: LABEL_PX,
      italic: true,
      weight: 'bold',
      align: 'right',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
