// ========================================================================
// angle-of-friction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 바닥 · 받침대는 `trajectory`, 각도 호는 `sector`(호만) + `readout`, 미끄러진 각 눈금은
// `trace`(tick), 판 · 턱 · 경첩 · 상자는 `body`, 기록은 `readout` 이다. 판의 기울기와
// 상자의 투명도는 시간표에서, 상자 자리 · 더미 수 · 기록은 상태에서 읽는다.
// 원본의 픽셀 상수는 schema.ts 「배치」에 그대로 있고 이 파일은 옮기기만 한다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  Sector,
  StageDef,
  TimelineFrame,
  Trace,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { boardAngle, boxAlpha, onBoard } from './physics';
import { LAYOUT, SCENE_BOUNDS, THETA_S_DEG, text, toUnit, worldX, worldY } from './schema';
import type { AngleOfFrictionState } from './state';

/** 바닥선 굵기(화면 px). 원본 1.5. */
const FLOOR_WIDTH_PX = 1.5;
/** 받침대 굵기. 원본 4. */
const POST_WIDTH_PX = 4;
/** 각도 호 굵기. 원본 1.2. */
const ARC_WIDTH_PX = 1.2;
/** 미끄러진 각 눈금 굵기. 원본 3. */
const SLIP_TICK_WIDTH_PX = 3;
// 판 · 상자 테두리 굵기는 테마의 선이다(원본 1.5) — body 는 굵기를 받지 않는다.

/** 채움과 테두리를 두 겹으로 — 옅은 채움 위에 한 단 짙은 테두리(원본 두 색). */
function twoTone(
  id: string,
  pos: Vec2,
  size: Vec2,
  orientation: number,
  role: 'muted' | 'primary',
  opacity: number,
): Body[] {
  return [
    {
      type: 'body',
      id: `${id}-fill`,
      shape: 'rect',
      pos,
      size,
      orientation,
      outline: 'none',
      opacity,
      style: { colorRole: role, emphasis: 'subtle' },
    },
    {
      type: 'body',
      id: `${id}-edge`,
      shape: 'rect',
      pos,
      size,
      orientation,
      fill: 'none',
      outline: 'role',
      opacity,
      style: { colorRole: role, emphasis: 'strong' },
    },
  ];
}

/** 판에 수직으로 쌓은 상자 `count` 개. 원본 `drawStack`. */
function stack(id: string, sPx: number, count: number, rad: number, alpha: number): Body[] {
  const out: Body[] = [];
  const box = toUnit(LAYOUT.boxPx);
  for (let i = 0; i < count; i++) {
    const pos = onBoard(sPx, LAYOUT.boxPx * (i + 0.5), rad);
    out.push(...twoTone(`${id}-${i}`, pos, [box, box], rad, 'primary', alpha));
  }
  return out;
}

export function scene(params: {
  state: AngleOfFrictionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('angle-of-friction: schema.timeline 이 선언되어야 한다');

  const deg = boardAngle(timeline);
  const rad = (deg * Math.PI) / 180;
  const alpha = boxAlpha(timeline);
  const end = onBoard(LAYOUT.boardLenPx, 0, rad);
  const out: Primitive[] = [];

  // ---- 바닥 ----
  out.push({
    type: 'trajectory',
    id: 'floor',
    points: [
      [worldX(LAYOUT.floorX0Px), 0],
      [worldX(LAYOUT.floorX1Px), 0],
    ],
    width: FLOOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 받침대 ---- 판 끝 바로 안쪽에서 바닥까지.
  const postX = end[0] - toUnit(LAYOUT.postInsetPx);
  out.push({
    type: 'trajectory',
    id: 'post',
    points: [
      [postX, end[1] - toUnit(LAYOUT.postDropPx)],
      [postX, 0],
    ],
    width: POST_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 각도 호 ---- 수평에서 판까지, 호만. 숫자는 바닥선 아래 — 작은 각에서도 판과 겹치지 않는다.
  const arcR = toUnit(LAYOUT.arcRPx);
  const arc: Sector = {
    type: 'sector',
    id: 'angle-arc',
    center: [0, 0],
    radius: arcR,
    from: 0,
    to: rad,
    fillOpacity: 0,
    rimWidth: ARC_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  const angleLabel: Readout = {
    type: 'readout',
    id: 'angle-label',
    // 원본은 글 윗변을 바닥선 아래 6 px 에 맞췄다. readout 은 글 가운데로 놓으므로 반 줄 더 내린다.
    anchor: {
      world: [arcR, 0],
      offset: [0, LAYOUT.angleLabelDyPx + LAYOUT.angleLabelFontPx / 2],
    },
    text: text('label.angle'),
    vars: { deg: deg.toFixed(1) },
    chip: false,
    font: 'text',
    align: 'center',
    fontSize: LAYOUT.angleLabelFontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(arc, angleLabel);

  // ---- 나무판 · 아래 끝 턱 ----
  out.push(
    ...twoTone(
      'board',
      onBoard(LAYOUT.boardLenPx / 2, -LAYOUT.boardThickPx / 2, rad),
      [toUnit(LAYOUT.boardLenPx), toUnit(LAYOUT.boardThickPx)],
      rad,
      'muted',
      1,
    ),
  );
  const stopper: Body = {
    type: 'body',
    id: 'stopper',
    shape: 'rect',
    pos: onBoard(LAYOUT.stopperPx / 2, LAYOUT.stopperHPx / 2, rad),
    size: [toUnit(LAYOUT.stopperPx), toUnit(LAYOUT.stopperHPx)],
    orientation: rad,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(stopper);

  // ---- 미끄러진 각 눈금 ---- 첫 미끄러짐부터 남는다. 강조색은 이 각 하나에만.
  if (state.records.length > 0) {
    const a = (THETA_S_DEG * Math.PI) / 180;
    const dir: Vec2 = [Math.cos(a), Math.sin(a)];
    const slipTick: Trace = {
      type: 'trace',
      id: 'slip-tick',
      marks: [{ pos: [dir[0] * arcR, dir[1] * arcR] }],
      shape: 'tick',
      direction: dir,
      size: toUnit(LAYOUT.slipTickHalfPx * 2),
      width: SLIP_TICK_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(slipTick);
  }

  // ---- 경첩 ----
  out.push({
    type: 'body',
    id: 'hinge',
    shape: 'circle',
    pos: [0, 0],
    size: toUnit(LAYOUT.hingeRPx),
    outline: 'none',
    glow: false,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 두 상자 ---- 같은 재질이라 같은 색. 무게 차이는 쌓인 개수로 보인다.
  out.push(...stack('heavy', state.sH, state.n, rad, alpha));
  out.push(...stack('light', state.sL, 1, rad, alpha));

  // ---- 미끄러진 각 기록 ----
  if (state.records.length > 0) {
    const x0 = worldX(LAYOUT.recordX0Px);
    const x1 = worldX(LAYOUT.recordX0Px + LAYOUT.recordValueDxPx);
    out.push({
      type: 'readout',
      id: 'record-title',
      anchor: { world: [x0, worldY(LAYOUT.recordY0Px)] },
      text: text('label.recordTitle'),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: LAYOUT.recordTitleFontPx,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    const slip = THETA_S_DEG.toFixed(1);
    state.records.forEach((n, i) => {
      const y = worldY(LAYOUT.recordY0Px + LAYOUT.recordFirstDyPx + i * LAYOUT.recordRowPx);
      out.push(
        {
          type: 'readout',
          id: `record-row-${i}`,
          anchor: { world: [x0, y] },
          text: text('label.recordRow'),
          vars: { n },
          chip: false,
          font: 'text',
          align: 'left',
          fontSize: LAYOUT.recordRowFontPx,
          style: { colorRole: 'ink', emphasis: 'strong' },
        },
        {
          type: 'readout',
          id: `record-angle-${i}`,
          anchor: { world: [x1, y] },
          text: text('label.angle'),
          vars: { deg: slip },
          chip: false,
          font: 'text',
          align: 'right',
          fontSize: LAYOUT.recordRowFontPx,
          style: { colorRole: 'accent', emphasis: 'strong' },
        },
      );
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 원본 캔버스. 매 프레임 같은 값이라 카메라가 흔들리지 않는다.
  return { ...SCENE_BOUNDS };
}
