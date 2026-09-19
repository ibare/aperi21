// ========================================================================
// microscope — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 두 렌즈는 plugin `opticalElement` `lens-convex` 다. 같은 요소를 `findImage` 에 넘겨 실상
//   (대물)과 허상(접안)의 자리 · 크기를 얻는다 — 상 점과 줄기 교점이 한 계산이다.
// - 대물 줄기 둘(나란히 가다 꺾이는 줄기, 렌즈 한가운데를 곧게 지나는 줄기)은 시료 끝에서
//   실상 끝까지, 접안 줄기 둘은 실상 끝에서 접안렌즈를 지나 허상 끝에서 온 것처럼 퍼져 나간다.
//   퍼지는 줄기를 거꾸로 이은 점선(`trajectory`)이 허상 끝에서 만난다.
// - 시료 · 실상은 먹색 화살표, 허상은 먹색 점선 화살표다 — 색이 아니라 선 모양으로 가른다.
// - 오른쪽 막대 셋은 `region` 사각형과 칸 금(`lineSet`)이다. 칸 한 개 = 시료 높이.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  OpticalElement,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { findImage } from '@aperi21/plugin-optics';
import { readConstants, show, subPath } from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  BAR_ROW_Y_EYEPIECE,
  BAR_ROW_Y_OBJECTIVE,
  BAR_ROW_Y_TOTAL,
  BAR_THICKNESS,
  BAR_X,
  EXIT_LENGTH,
  EYEPIECE_SIZE,
  FOCUS_DOT_RADIUS,
  OBJECTIVE_SIZE,
  SCENE_BOUNDS,
  TUBE_HALF,
  text,
  type MicroscopeMessageKey,
} from './schema';
import type { MicroscopeState } from './state';

/** 광축 · 경통 벽 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 시료 · 실상 · 허상 화살표 굵기(화면 px). */
const ARROW_WIDTH_PX = 3;
/** 거꾸로 이은 점선 굵기(화면 px). */
const BACK_LINE_WIDTH_PX = 1.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 초점 표식 `F` 글자 크기(화면 px). */
const FOCUS_LABEL_PX = 12;
/** 막대 값 글자 크기(화면 px). */
const MAG_LABEL_PX = 14;
/** 이름표가 기준점에서 떨어진 거리(화면 px). */
const LABEL_GAP_PX = 10;
/** 초점 표식이 초점 점 아래로 내려간 거리(화면 px). */
const FOCUS_LABEL_DROP_PX = 11;
/** 막대 줄 이름 · 값 글자가 막대 끝에서 떨어진 거리(화면 px). */
const BAR_TEXT_GAP_PX = 8;
/** 막대 채움 불투명도. */
const BAR_FILL_OPACITY = 0.35;
/** 칸 금 굵기(화면 px) — 시료 한 칸 경계. */
const CELL_LINE_PX = 1;
/** 전체 막대의 토막 금 굵기(화면 px) — 대물 막대 하나의 경계. */
const BLOCK_LINE_PX = 2.5;

export function scene(params: {
  state: MicroscopeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('microscope: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = show(timeline, c);
  const h = c.specimenHeight;
  const L = c.tubeLength;

  // ---- 렌즈 · 상 ----
  const objective: OpticalElement = {
    type: 'opticalElement',
    id: 'objective',
    subtype: 'lens-convex',
    pos: [0, 0],
    orientation: 0,
    size: OBJECTIVE_SIZE,
    focalLength: c.objectiveFocal,
  };
  const eyepiece: OpticalElement = {
    type: 'opticalElement',
    id: 'eyepiece',
    subtype: 'lens-convex',
    pos: [L, 0],
    orientation: 0,
    size: EYEPIECE_SIZE,
    focalLength: c.eyepieceFocal,
  };
  const specBase: Vec2 = [-c.specimenDistance, 0];
  const specTip: Vec2 = [-c.specimenDistance, h];
  const real = findImage(specTip, objective);
  if (!real) throw new Error('microscope: 시료가 대물렌즈 초점 위에 있다 — 스테이지 상수를 확인한다');
  const realTip = real.position;
  const realBase: Vec2 = [realTip[0], 0];
  const virtual = findImage(realTip, eyepiece);
  if (!virtual) throw new Error('microscope: 실상이 접안렌즈 초점 위에 있다 — 스테이지 상수를 확인한다');
  const virtTip = virtual.position;
  const virtBase: Vec2 = [virtTip[0], 0];

  const out: Primitive[] = [];

  // ---- 광축 · 경통 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  for (const side of [1, -1] as const) {
    out.push({
      type: 'trajectory',
      id: side > 0 ? 'tube-top' : 'tube-bottom',
      points: [
        [0, side * TUBE_HALF],
        [L, side * TUBE_HALF],
      ],
      width: GUIDE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 앞 초점 둘 — 시료는 대물 초점 바로 바깥, 실상은 접안 초점 안쪽 ----
  const foci: { id: string; x: number }[] = [
    { id: 'objective', x: -c.objectiveFocal },
    { id: 'eyepiece', x: L - c.eyepieceFocal },
  ];
  for (const f of foci) {
    out.push({
      type: 'body',
      id: `focus-${f.id}`,
      shape: 'circle',
      pos: [f.x, 0],
      size: FOCUS_DOT_RADIUS,
      fill: 'solid',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `focus-label-${f.id}`,
      anchor: { world: [f.x, 0], offset: [0, FOCUS_LABEL_DROP_PX] },
      text: text('label.focus'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: FOCUS_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  out.push(objective, eyepiece);

  // ---- 접안 줄기를 거꾸로 이은 점선 — 허상 끝에서 만난다 ----
  const eyeHitParallel: Vec2 = [L, realTip[1]];
  const eyeHitCenter: Vec2 = [L, 0];
  if (s.backReach > 0 && s.keep > 0) {
    for (const [id, hit] of [
      ['back-parallel', eyeHitParallel],
      ['back-center', eyeHitCenter],
    ] as const) {
      out.push({
        type: 'trajectory',
        id,
        points: [hit, [hit[0] + (virtTip[0] - hit[0]) * s.backReach, hit[1] + (virtTip[1] - hit[1]) * s.backReach]],
        width: BACK_LINE_WIDTH_PX,
        opacity: s.keep,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 줄기 — 대물 둘, 접안 둘 ----
  const exit = (hit: Vec2): Vec2 => {
    // 접안렌즈를 지난 줄기는 허상 끝에서 온 것처럼 곧게 간다.
    const dx = hit[0] - virtTip[0];
    const dy = hit[1] - virtTip[1];
    const len = Math.hypot(dx, dy);
    return [hit[0] + (dx / len) * EXIT_LENGTH, hit[1] + (dy / len) * EXIT_LENGTH];
  };
  const paths: { id: string; points: Vec2[]; window: readonly [number, number] }[] = [
    { id: 'ray-obj-parallel', points: [specTip, [0, h], realTip], window: s.objRays },
    { id: 'ray-obj-center', points: [specTip, [0, 0], realTip], window: s.objRays },
    { id: 'ray-eye-parallel', points: [realTip, eyeHitParallel, exit(eyeHitParallel)], window: s.eyeRays },
    { id: 'ray-eye-center', points: [realTip, eyeHitCenter, exit(eyeHitCenter)], window: s.eyeRays },
  ];
  for (const p of paths) {
    const shown = subPath(p.points, p.window[0], p.window[1]);
    if (shown.length >= 2) out.push({ type: 'ray', id: p.id, segments: shown, showArrow: true });
  }

  // ---- 시료 · 실상 · 허상 ----
  out.push({
    type: 'vector',
    id: 'specimen',
    from: specBase,
    delta: [0, specTip[1]],
    width: ARROW_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  if (s.realImage > 0) {
    out.push({
      type: 'vector',
      id: 'real-image',
      from: realBase,
      delta: [0, realTip[1]],
      width: ARROW_WIDTH_PX,
      opacity: s.realImage,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (s.virtualImage > 0) {
    out.push({
      type: 'vector',
      id: 'virtual-image',
      from: virtBase,
      delta: [0, virtTip[1]],
      width: ARROW_WIDTH_PX,
      opacity: s.virtualImage,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 이름표 ----
  const label = (
    id: string,
    key: MicroscopeMessageKey,
    world: Vec2,
    offset: Vec2,
    align: 'left' | 'center' | 'right',
    opacity: number,
  ): void => {
    if (opacity <= 0) return;
    out.push({
      type: 'readout',
      id,
      anchor: { world, offset },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align,
      opacity,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  };
  label('label-specimen', 'label.specimen', specTip, [0, -LABEL_GAP_PX], 'center', 1);
  label('label-objective', 'label.objective', [0, -OBJECTIVE_SIZE / 2], [0, LABEL_GAP_PX], 'center', 1);
  label('label-eyepiece', 'label.eyepiece', [L, TUBE_HALF], [0, -LABEL_GAP_PX], 'center', 1);
  label('label-tube', 'label.tube', [L / 2, TUBE_HALF], [0, -LABEL_GAP_PX], 'center', 1);
  label('label-real', 'label.realImage', [realTip[0], realTip[1] / 2], [-LABEL_GAP_PX, 0], 'right', s.realImage);
  // 허상 이름표는 허상 끝 왼쪽 — 가운데 높이에 두면 경통 아래 벽과 겹친다(첫 촬영).
  label('label-virtual', 'label.virtualImage', virtTip, [-LABEL_GAP_PX, 0], 'right', s.virtualImage);

  // ---- 막대 셋 — 칸 한 개 = 시료 높이 ----
  const bar = (id: string, y: number, cells: number, blockCells: number | null, opacity: number): void => {
    if (opacity <= 0) return;
    const x1 = BAR_X + cells * h;
    const y0 = y - BAR_THICKNESS / 2;
    const y1 = y + BAR_THICKNESS / 2;
    out.push({
      type: 'region',
      id: `bar-${id}`,
      points: [
        [BAR_X, y0],
        [x1, y0],
        [x1, y1],
        [BAR_X, y1],
      ],
      fillOpacity: BAR_FILL_OPACITY,
      outline: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      opacity,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    const cellLines: Vec2[][] = [];
    const blockLines: Vec2[][] = [];
    for (let k = 1; k < cells; k++) {
      const x = BAR_X + k * h;
      const line: Vec2[] = [
        [x, y0],
        [x, y1],
      ];
      if (blockCells !== null && k % blockCells === 0) blockLines.push(line);
      else cellLines.push(line);
    }
    if (cellLines.length > 0) {
      out.push({
        type: 'lineSet',
        id: `bar-${id}-cells`,
        lines: cellLines,
        width: CELL_LINE_PX,
        opacity,
        style: { colorRole: 'primary', emphasis: 'medium' },
      });
    }
    if (blockLines.length > 0) {
      out.push({
        type: 'lineSet',
        id: `bar-${id}-blocks`,
        lines: blockLines,
        width: BLOCK_LINE_PX,
        opacity,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  };
  const rowName = (id: string, key: MicroscopeMessageKey, y: number, opacity: number): void =>
    label(`bar-name-${id}`, key, [BAR_X, y], [-BAR_TEXT_GAP_PX, 0], 'right', opacity);
  const mark = (id: string, y: number, cells: number, m: string, opacity: number): void => {
    if (opacity <= 0) return;
    out.push({
      type: 'readout',
      id: `bar-mag-${id}`,
      anchor: { world: [BAR_X + cells * h, y], offset: [BAR_TEXT_GAP_PX, 0] },
      text: text('label.mag'),
      vars: { m },
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: MAG_LABEL_PX,
      align: 'left',
      opacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  };

  bar('objective', BAR_ROW_Y_OBJECTIVE, s.objectiveCells, null, 1);
  rowName('objective', 'label.barObjective', BAR_ROW_Y_OBJECTIVE, 1);
  mark('objective', BAR_ROW_Y_OBJECTIVE, c.objectiveMag, state.objectiveMag, s.objectiveMark);

  bar('eyepiece', BAR_ROW_Y_EYEPIECE, s.eyepieceCells, null, 1);
  rowName('eyepiece', 'label.barEyepiece', BAR_ROW_Y_EYEPIECE, 1);
  mark('eyepiece', BAR_ROW_Y_EYEPIECE, c.eyepieceMag, state.eyepieceMag, s.eyepieceMark);

  // 전체 막대 — 대물 막대(대물 배율만큼의 칸)가 토막 하나다. 토막 금이 대물 막대 하나의 경계.
  bar('total', BAR_ROW_Y_TOTAL, c.objectiveMag * s.totalBlocks, c.objectiveMag, s.totalBar);
  rowName('total', 'label.barTotal', BAR_ROW_Y_TOTAL, s.totalBar);
  mark('total', BAR_ROW_Y_TOTAL, c.totalMag, state.totalMag, s.totalMark);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
