// ========================================================================
// bernoullis-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 관 속 압력 명암(region 띠) · 물감 띠(trajectory) · 관 벽(trajectory) · 속도 몫과
// 물기둥(region) · 유리관(trajectory) · 합 수준선(trajectory 점선) · 이름표(readout).
// 겹침은 원본의 그리는 순서 그대로다 (`drawOrder: 'scene'`).
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import {
  currentRatio,
  pressureHead,
  pressureLevel,
  stations,
  stripPositions,
  tubeWidth,
} from './physics';
import {
  LAYOUT,
  LINE_PX,
  SCENE_BOUNDS,
  SHADE,
  STRIP,
  VELOCITY_FILL,
  text,
  worldX,
  worldY,
} from './schema';
import type { BernoullisPrincipleState } from './state';

/** 원본 px 좌표 한 점 → 월드. */
function w(xPx: number, yPx: number): Vec2 {
  return [worldX(xPx), worldY(yPx)];
}

/** 원본 px 사각형(왼쪽 · 위 · 폭 · 높이) → 월드 다각형. */
function rectPx(x: number, y: number, width: number, height: number): Vec2[] {
  return [w(x, y), w(x + width, y), w(x + width, y + height), w(x, y + height)];
}

/** 압력 수두 → 물 명암(빛의 양). 짙을수록 높은 압력. */
function shadeOf(hp: number): number {
  return SHADE.min + (SHADE.max - SHADE.min) * pressureLevel(hp);
}

/** 압력 명암으로 칠한 물. 관 속 물과 유리관 속 물이 같은 규칙이라 '같은 물' 로 읽힌다. */
function water(id: string, points: Vec2[], hp: number): Region {
  return {
    type: 'region',
    id,
    points,
    fillOpacity: 1,
    luminance: shadeOf(hp),
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };
}

function line(id: string, points: Vec2[], widthPx: number, style: Trajectory['style']): Trajectory {
  return { type: 'trajectory', id, points, width: widthPx, style };
}

export function scene(params: {
  state: BernoullisPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('bernoullis-principle: schema.timeline 이 선언되어야 한다');
  const ratio = currentRatio(state, timeline);
  const L = LAYOUT;
  const CY = L.cyPx;
  const totalY = CY - L.totalHeadPx;
  const xs = stations();
  const out: Primitive[] = [];

  // ---- 관 속 물의 압력 명암 ----
  // 2 px 폭 세로 띠를 관 굵기만큼 이어 붙인다. 파랑 한 색, 농도만 바뀐다.
  for (let x = L.xInPx; x < L.xOutPx; x += L.shadeStepPx) {
    const wd = tubeWidth(x + 1, ratio);
    const fill = Math.min(L.shadeFillPx, L.xOutPx - x);
    out.push(water(`shade-${x}`, rectPx(x, CY - wd / 2, fill, wd), pressureHead(x + 1, ratio)));
  }

  // ---- 물감 띠 ----
  // 같은 시간 간격으로 흘려 넣은 물의 단면. 띠 사이가 벌어진 곳이 물이 빨리 지나가는 곳이다.
  stripPositions(timeline.t, ratio).forEach((x, i) => {
    const wd = tubeWidth(x, ratio);
    out.push({
      ...line(`strip-${i}`, [w(x, CY - wd / 2 + 1), w(x, CY + wd / 2 - 1)], STRIP.widthPx, {
        colorRole: 'ink',
        emphasis: 'strong',
      }),
      opacity: STRIP.opacity,
    });
  });

  // ---- 관 벽 ----
  for (const sgn of [-1, 1] as const) {
    const pts: Vec2[] = [];
    for (let x = L.xInPx; x <= L.xOutPx; x += 2) pts.push(w(x, CY + (sgn * tubeWidth(x, ratio)) / 2));
    out.push(line(sgn < 0 ? 'wall-top' : 'wall-bottom', pts, LINE_PX.wall, { colorRole: 'ink', emphasis: 'strong' }));
  }

  // ---- 속도로 바뀐 몫 ----
  // 물기둥 윗면부터 합 수준선까지. 강조색은 이 뜻 하나에만 쓴다.
  const inner = L.tubeWPx - 4;
  for (const x of xs) {
    const bottom = CY - pressureHead(x, ratio);
    out.push({
      type: 'region',
      id: `velocity-${x}`,
      points: rectPx(x - L.tubeWPx / 2 + 2, totalY, inner, bottom - totalY),
      opaque: true,
      fillOpacity: VELOCITY_FILL,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 물기둥 ----
  // 관 윗벽에서 압력 수두 높이까지. 좁은 곳이 좁아질수록 가운데 물기둥이 실제로 내려간다.
  for (const x of xs) {
    const hp = pressureHead(x, ratio);
    const wallY = CY - tubeWidth(x, ratio) / 2;
    out.push(water(`column-${x}`, rectPx(x - L.tubeWPx / 2 + 2, CY - hp, inner, wallY - (CY - hp) + 1), hp));
  }

  // ---- 물기둥 유리관 ----
  const tubeTop = CY - L.totalHeadPx - L.tubeOverPx;
  for (const x of xs) {
    const wallY = CY - tubeWidth(x, ratio) / 2;
    for (const side of [-1, 1] as const) {
      const gx = x + side * (L.tubeWPx / 2 - 1);
      out.push(
        line(`tube-${x}-${side < 0 ? 'l' : 'r'}`, [w(gx, tubeTop), w(gx, wallY)], LINE_PX.tube, {
          colorRole: 'muted',
          emphasis: 'strong',
        }),
      );
    }
  }

  // ---- 합 수준선 ----
  // 압력 몫 + 속도 몫. 이상 유체라 어디서나 같다 — 이 선이 없으면 교환이 읽히지 않는다.
  out.push(
    line('level', [w(xs[0]! - L.levelOverPx, totalY), w(xs[xs.length - 1]! + L.levelOverPx, totalY)], LINE_PX.level, {
      colorRole: 'ink',
      emphasis: 'strong',
      lineStyle: 'dashed',
    }),
  );

  // ---- 이름표 ----
  out.push({
    type: 'readout',
    id: 'label-level',
    anchor: { world: w(xs[0]! - L.levelOverPx, totalY - L.levelLabelDyPx) },
    text: text('label.level'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: L.labelFontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 목 물기둥 옆에 두 몫의 이름을 붙인다.
  const throatX = xs[Math.floor(xs.length / 2)]!;
  const labelX = throatX + L.tubeWPx / 2 + L.shareLabelDxPx;
  const topW = CY - pressureHead(throatX, ratio);
  // 원본은 호박색 구간이 22 px 보다 짧으면 '속도 몫' 을 숨긴다.
  if (topW - totalY > L.velocityLabelMinPx) {
    out.push({
      type: 'readout',
      id: 'label-velocity',
      anchor: { world: w(labelX, (totalY + topW) / 2) },
      text: text('label.velocityShare'),
      chip: false,
      align: 'left',
      font: 'text',
      fontSize: L.labelFontPx,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'label-pressure',
    anchor: { world: w(labelX, topW + L.pressureLabelDyPx) },
    text: text('label.pressureShare'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: L.labelFontPx,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 원본 캔버스 + 캡션 · 슬라이더 줄. 매 프레임 같은 값이다.
  return { ...SCENE_BOUNDS };
}
