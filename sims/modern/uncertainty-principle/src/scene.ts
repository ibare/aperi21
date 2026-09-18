// ========================================================================
// uncertainty-principle — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 분포 봉우리(region 채움 +
// trajectory 윤곽) · 폭 치수선(dimension) · 축(trajectory) · 빗금 구역(region hatch) ·
// 바닥 곡선(trajectory) · 지금 상태 점(body) · 안내선(trajectory 점선) · 기호(readout)가
// 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 두 분포는 같은 입자의 것이라 둘 다 primary, **강조색은 「폭」
// 한 가지 뜻에만**(Δx · Δp 치수선, 평면 축 위 폭 막대, 지금 상태 점). 축 · 곡선 · 기호는
// 먹색, 빗금 구역 · 안내선은 배경 정보라 muted.
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
import { gaussianDensity, peakDensities, readConstants, readSpreads, sigmaP } from './physics';
import {
  FORBIDDEN_LABEL_AT,
  PANEL_NAME_DY,
  PANEL_P_BASE,
  PANEL_SPAN_SIGMAS,
  PANEL_WIDTH,
  PANEL_X_BASE,
  PEAK_HEIGHT,
  PLANE_HEADROOM,
  PLANE_ORIGIN,
  PLANE_SIZE,
  SCENE_BOUNDS,
  text,
  type UncertaintyPrincipleMessageKey,
} from './schema';
import type { UncertaintyPrincipleState } from './state';

/** 분포 곡선 하나의 표본 수. 가장 좁은 봉우리도 폭 안에 20 점 넘게 든다. */
const DENSITY_SAMPLES = 320;
/** 바닥 곡선의 표본 수(로그 간격). */
const FLOOR_SAMPLES = 120;
/** 분포 윤곽 굵기(화면 px) · 채움 짙기. 이 그림의 주인공이다. */
const DENSITY_WIDTH_PX = 2.4;
const DENSITY_FILL = 0.26;
/** 축 굵기(화면 px). */
const AXIS_WIDTH_PX = 1.2;
/** 바닥 곡선 굵기(화면 px). */
const FLOOR_WIDTH_PX = 2;
/** 빗금 구역 채움 짙기. */
const FORBIDDEN_FILL = 0.4;
/** 평면 축 위 폭 막대 굵기(화면 px). 축보다 굵어야 축 위에서 읽힌다. */
const SPREAD_BAR_WIDTH_PX = 4;
/** 점에서 축으로 내린 안내선 굵기(화면 px) · 짙기. */
const GUIDE_WIDTH_PX = 1;
const GUIDE_OPACITY = 0.8;
/** 지금 상태 점의 반지름(월드). */
const STATE_DOT_R = 0.14;
/** 기호 글자 크기(화면 px) · 판 이름 글자 크기. */
const LABEL_PX = 14;
const NAME_PX = 13;
/** 축 끝 기호를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_LABEL_GAP_PX = 12;
/** 바닥 곡선 이름표를 곡선 윗끝 오른쪽으로 띄우는 거리(화면 px). */
const FLOOR_LABEL_GAP_PX = 10;
/** 가우스에서 ±σ 자리의 높이 비 e^(−1/2). 치수선이 봉우리 윤곽에 닿는 높이다. */
const SIGMA_HEIGHT_RATIO = Math.exp(-0.5);

/** 한 분포 판의 선언 — 축 높이 · 가로 반범위(물리 단위) · 세로 배율 · 폭 · 기호. */
interface Panel {
  id: 'x' | 'p';
  base: number;
  halfRange: number;
  yScale: number;
  sigma: number;
  name: UncertaintyPrincipleMessageKey;
  axis: UncertaintyPrincipleMessageKey;
  spread: UncertaintyPrincipleMessageKey;
}

/** 판 안의 물리 좌표 u → 월드 가로. 판 가운데가 0 이다. */
function panelX(panel: Panel, u: number): number {
  return PANEL_WIDTH / 2 + (u / panel.halfRange) * (PANEL_WIDTH / 2);
}

/** 봉우리 윤곽 — 판 가로 끝에서 끝까지. */
function densityPoints(panel: Panel): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= DENSITY_SAMPLES; i++) {
    const u = -panel.halfRange + (2 * panel.halfRange * i) / DENSITY_SAMPLES;
    pts.push([panelX(panel, u), panel.base + panel.yScale * gaussianDensity(u, panel.sigma)]);
  }
  return pts;
}

export function scene(params: {
  state: UncertaintyPrincipleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('uncertainty-principle: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = readSpreads(timeline, c);
  const peaks = peakDensities(c);
  const out: Primitive[] = [];

  // 두 판의 가로 반범위는 가장 넓은 분포의 ±Nσ, 세로 배율은 가장 뾰족한 봉우리가
  // PEAK_HEIGHT 에 닿도록. 그러면 두 판의 넓이(확률 1)가 화면에서도 같다 — 좁아진
  // 쪽이 높아지는 것은 넓이가 그대로이기 때문이다.
  const panels: Panel[] = [
    {
      id: 'x',
      base: PANEL_X_BASE,
      halfRange: PANEL_SPAN_SIGMAS * c.sigmaXWide,
      yScale: PEAK_HEIGHT / peaks.x,
      sigma: s.sigmaX,
      name: 'label.position',
      axis: 'label.x',
      spread: 'label.dx',
    },
    {
      id: 'p',
      base: PANEL_P_BASE,
      halfRange: PANEL_SPAN_SIGMAS * sigmaP(c.sigmaXNarrow, c),
      yScale: PEAK_HEIGHT / peaks.p,
      sigma: s.sigmaP,
      name: 'label.momentum',
      axis: 'label.p',
      spread: 'label.dp',
    },
  ];

  // ---- 분포 판 둘 ----
  for (const panel of panels) {
    const curve = densityPoints(panel);

    // 봉우리 채움. 축을 따라 닫는다.
    out.push({
      type: 'region',
      id: `density-fill-${panel.id}`,
      points: [...curve, [PANEL_WIDTH, panel.base], [0, panel.base]],
      fillOpacity: DENSITY_FILL,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
    // 축.
    out.push({
      type: 'trajectory',
      id: `axis-${panel.id}`,
      points: [
        [0, panel.base],
        [PANEL_WIDTH, panel.base],
      ],
      width: AXIS_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    // 봉우리 윤곽. 두 판이 같은 색 · 같은 굵기다 — 같은 입자의 두 얼굴이다.
    out.push({
      type: 'trajectory',
      id: `density-${panel.id}`,
      points: curve,
      width: DENSITY_WIDTH_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });

    // 폭 치수선 — ±σ 에서 윤곽에 닿는 높이에 긋는다. 이 조각이 재는 것이다.
    const yAtSigma = panel.base + panel.yScale * gaussianDensity(0, panel.sigma) * SIGMA_HEIGHT_RATIO;
    out.push({
      type: 'dimension',
      id: `spread-${panel.id}`,
      from: [panelX(panel, -panel.sigma), yAtSigma],
      to: [panelX(panel, panel.sigma), yAtSigma],
      text: text(panel.spread),
      style: { colorRole: 'accent', emphasis: 'strong' },
    });

    // 축 기호(x · p)와 판 이름(위치 · 운동량).
    out.push({
      type: 'readout',
      id: `axis-label-${panel.id}`,
      anchor: { world: [PANEL_WIDTH, panel.base], offset: [AXIS_LABEL_GAP_PX, 0] },
      text: text(panel.axis),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: LABEL_PX,
      align: 'left',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `name-${panel.id}`,
      anchor: { world: [0, panel.base + PANEL_NAME_DY] },
      text: text(panel.name),
      chip: false,
      font: 'text',
      fontSize: NAME_PX,
      align: 'left',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- (Δx, Δp) 평면 ----
  const [ox, oy] = PLANE_ORIGIN;
  const dxMax = c.sigmaXWide * PLANE_HEADROOM;
  const dpMax = sigmaP(c.sigmaXNarrow, c) * PLANE_HEADROOM;
  const toPlane = (dx: number, dp: number): Vec2 => [ox + (dx / dxMax) * PLANE_SIZE, oy + (dp / dpMax) * PLANE_SIZE];

  // 바닥 곡선 ΔxΔp = ħ/2 — 평면 위 끝(Δp = dpMax)에서 오른쪽 끝(Δx = dxMax)까지 로그 간격.
  const dxMin = c.hbar / (2 * dpMax);
  const floor: Vec2[] = [];
  for (let i = 0; i <= FLOOR_SAMPLES; i++) {
    const dx = dxMin * Math.pow(dxMax / dxMin, i / FLOOR_SAMPLES);
    floor.push(toPlane(dx, c.hbar / (2 * dx)));
  }

  // 빗금 구역 — 곱이 바닥보다 작은 곳. 원점 · 위 끝 · 곡선 · 오른쪽 끝으로 닫는다.
  out.push({
    type: 'region',
    id: 'forbidden',
    points: [toPlane(0, 0), toPlane(0, dpMax), ...floor, toPlane(dxMax, 0)],
    fill: 'hatch',
    fillOpacity: FORBIDDEN_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 평면 축.
  out.push({
    type: 'trajectory',
    id: 'plane-axes',
    points: [toPlane(0, dpMax), toPlane(0, 0), toPlane(dxMax, 0)],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 바닥 곡선.
  out.push({
    type: 'trajectory',
    id: 'floor',
    points: floor,
    width: FLOOR_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 지금 상태 — 점에서 두 축으로 안내선, 축 위에는 원점부터 폭만큼 강조색 막대.
  const here = toPlane(s.sigmaX, s.sigmaP);
  const onX = toPlane(s.sigmaX, 0);
  const onP = toPlane(0, s.sigmaP);
  for (const [id, end] of [
    ['guide-x', onX],
    ['guide-p', onP],
  ] as const) {
    out.push({
      type: 'trajectory',
      id,
      points: [here, end],
      width: GUIDE_WIDTH_PX,
      opacity: GUIDE_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }
  out.push({
    type: 'trajectory',
    id: 'spread-bar-x',
    points: [toPlane(0, 0), onX],
    width: SPREAD_BAR_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'spread-bar-p',
    points: [toPlane(0, 0), onP],
    width: SPREAD_BAR_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'state',
    pos: here,
    shape: 'circle',
    size: STATE_DOT_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 평면 기호 — 축 끝의 Δx · Δp, 곡선 윗끝의 이름, 빗금 구역의 이름.
  out.push({
    type: 'readout',
    id: 'plane-label-dx',
    anchor: { world: toPlane(dxMax, 0), offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.dx'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plane-label-dp',
    anchor: { world: toPlane(0, dpMax), offset: [0, -AXIS_LABEL_GAP_PX] },
    text: text('label.dp'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'floor-label',
    anchor: { world: floor[0]!, offset: [FLOOR_LABEL_GAP_PX, 0] },
    text: text('label.floor'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    align: 'left',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'forbidden-label',
    anchor: { world: toPlane(dxMax * FORBIDDEN_LABEL_AT[0], dpMax * FORBIDDEN_LABEL_AT[1]) },
    text: text('label.forbidden'),
    chip: true,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
