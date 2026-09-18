// ========================================================================
// constructive-destructive — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 평형선 · 기준선 · 두 파동 · 합은
// 모두 `trajectory`, 줄 이름과 기준선 표식은 `readout` 이다. 캡션은 선언의 캡션 슬롯이
// 그린다.
//
// 색은 뜻마다 하나다 — 합은 먹색 굵은 선(주인공), 두 파동은 같은 무채색 가는 선이고
// 둘을 가르는 것은 **선 모양**(실선 · 점선)이다. 같은 부류의 둘을 역할색으로 가르면
// 범례가 되고, 「위상이 맞으면 포개진다」 가 두 색이 섞이는 문제로 바뀐다 (S-piece).
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
  components,
  phaseDifference,
  readConstants,
  travelPhase,
  type ConstructiveDestructiveConstants,
} from './physics';
import { ROW_SUM_Y, ROW_WAVES_Y, SCENE_BOUNDS, STRING_HALF, text } from './schema';
import type { ConstructiveDestructiveState } from './state';

/** 곡선 표본 간격(월드 칸). 파장 4 칸에 표본 100 개 — 마루가 각지지 않는다. */
const SAMPLE_STEP = 0.04;
/** 합 굵기 · 두 파동 굵기 · 평형선 · 기준선 굵기(화면 px). 합이 주인공이라 가장 굵다. */
const SUM_WIDTH = 2.75;
const WAVE_WIDTH = 1.5;
const REST_WIDTH = 1;
const GUIDE_WIDTH = 1;
/** 기준선 표식(A · 2A) 글자 크기와 줄 끝에서 띄우는 거리(화면 px). */
const MARK_PX = 12;
const MARK_GAP_PX = 12;
/** 줄 이름(두 파동 · 합) 글자 크기와 기준선 위로 띄우는 거리(화면 px). */
const ROW_LABEL_PX = 12;
const ROW_LABEL_GAP_PX = 12;

/** 줄 끝에서 끝까지 표본해 곡선 하나를 뽑는다. */
function curve(y0: number, fn: (x: number) => number): Vec2[] {
  const n = Math.ceil((2 * STRING_HALF) / SAMPLE_STEP);
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = -STRING_HALF + (2 * STRING_HALF * i) / n;
    pts.push([x, y0 + fn(x)]);
  }
  return pts;
}

/** 수평선 하나 — 평형선 · 기준선. */
function hline(y: number): Vec2[] {
  return [
    [-STRING_HALF, y],
    [STRING_HALF, y],
  ];
}

/**
 * 한 줄의 틀 — 평형선, 위아래 기준선(±높이), 오른쪽 끝 표식, 왼쪽 위 줄 이름.
 * 기준선은 「얼마나 높이 출렁이는가」 를 읽는 자다. 두 줄의 세로 배율이 같으므로
 * 아래 줄의 2A 가 위 줄 A 의 꼭 두 배 높이로 보인다.
 */
function frame(
  id: string,
  y0: number,
  height: number,
  mark: LocalizedText,
  name: LocalizedText,
): Primitive[] {
  return [
    {
      type: 'trajectory',
      id: `rest-${id}`,
      points: hline(y0),
      width: REST_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    },
    {
      type: 'trajectory',
      id: `guide-top-${id}`,
      points: hline(y0 + height),
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dotted' },
    },
    {
      type: 'trajectory',
      id: `guide-bottom-${id}`,
      points: hline(y0 - height),
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dotted' },
    },
    {
      type: 'readout',
      id: `mark-${id}`,
      anchor: { world: [STRING_HALF, y0 + height], offset: [MARK_GAP_PX, 0] },
      text: mark,
      chip: false,
      align: 'left',
      fontSize: MARK_PX,
      font: 'text',
      italic: true,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: `name-${id}`,
      anchor: { world: [-STRING_HALF, y0 + height], offset: [0, -ROW_LABEL_GAP_PX] },
      text: name,
      chip: false,
      align: 'left',
      fontSize: ROW_LABEL_PX,
      font: 'text',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

function wavesRow(c: ConstructiveDestructiveConstants, travel: number, dphi: number): Primitive[] {
  const at = (x: number) => components(x, travel, dphi, c);
  return [
    ...frame('waves', ROW_WAVES_Y, c.amplitude, text('label.amp'), text('label.waves')),
    // 첫째 파동 — 실선. 위상차의 기준이라 움직이지 않고 흐르기만 한다.
    {
      type: 'trajectory',
      id: 'wave-1',
      points: curve(ROW_WAVES_Y, (x) => at(x).y1),
      width: WAVE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
    },
    // 둘째 파동 — 점선. 위상차만큼 뒤로 밀린다. 위상이 맞으면 실선 위에 포개져 한 줄로
    // 보이고, 반 파장 어긋나면 실선의 거울상이 된다.
    {
      type: 'trajectory',
      id: 'wave-2',
      points: curve(ROW_WAVES_Y, (x) => at(x).y2),
      width: WAVE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    },
  ];
}

function sumRow(c: ConstructiveDestructiveConstants, travel: number, dphi: number): Primitive[] {
  return [
    ...frame('sum', ROW_SUM_Y, 2 * c.amplitude, text('label.ampDouble'), text('label.sum')),
    // 합 — 점마다 두 변위를 더한 줄. 높이가 위상차를 따라 2A 에서 0 까지 오르내린다.
    {
      type: 'trajectory',
      id: 'wave-sum',
      points: curve(ROW_SUM_Y, (x) => {
        const v = components(x, travel, dphi, c);
        return v.y1 + v.y2;
      }),
      width: SUM_WIDTH,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'solid' },
    },
  ];
}

export function scene(params: {
  state: ConstructiveDestructiveState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('constructive-destructive: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const travel = travelPhase(timeline, c);
  const dphi = phaseDifference(timeline, c);
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return [...wavesRow(c, travel, dphi), ...sumRow(c, travel, dphi)];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
