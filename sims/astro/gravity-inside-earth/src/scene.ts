// ========================================================================
// gravity-inside-earth — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 지구 · 당기는 공(region),
// 테 · 축 · 곡선 · 안내선(trajectory), 중력(vector), 시험 질량 · 그래프 점(body),
// 이름표(readout)가 모두 표준 어휘다.
//
// 지구 중심이 그래프 원점이다. 시험 질량은 가로축(지구를 관통하는 굴) 위를 움직이고,
// 그 바로 위 곡선의 높이가 그 자리의 중력이다.
//
// 색은 뜻마다 하나다 — 지구는 배경 쪽 회색(muted), 시험 질량 · 그려지는 곡선은 먹색(ink),
// 중력은 화살표든 그래프 점이든 같은 primary(같은 것 — 그 자리의 중력),
// **강조색은 「지금 당기는 안쪽 공」 한 가지 뜻에만** 쓴다.
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
  curve,
  graphPoint,
  gravityRatio,
  massOpacity,
  massR,
  readConstants,
  zeroOpacity,
} from './physics';
import { CIRCLE_SAMPLES, SCENE_BOUNDS, text } from './schema';
import type { GravityInsideEarthState } from './state';

/** 지구 채움 불투명도 · 테 굵기(화면 px). */
const EARTH_FILL = 0.28;
const EARTH_RIM_WIDTH = 2;
/** 당기는 안쪽 공의 채움 불투명도 · 테 굵기(화면 px). */
const BALL_FILL = 0.34;
const BALL_RIM_WIDTH = 2;
/** 축 · 안내선 굵기(화면 px). */
const AXIS_WIDTH = 1;
/** 미리 깔린 곡선(옅게) · 질량이 그려 온 곡선의 굵기(화면 px)와 옅은 곡선의 불투명도. */
const GUIDE_CURVE_WIDTH = 1.5;
const GUIDE_CURVE_OPACITY = 0.55;
const TRACE_WIDTH = 3;
/** 중력 화살표 굵기(화면 px). */
const PULL_WIDTH = 3;
/** 그래프 점 반지름 — 시험 질량 반지름에 대한 비. */
const POINT_SIZE_RATIO = 0.85;
/** 세로축 끝 — 그래프 높이에 대한 비. */
const G_AXIS_RATIO = 1.18;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 축 이름표를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_LABEL_GAP = 9;
/** 지표 반지름 이름표를 꺾임 자리에서 오른쪽 아래로 띄우는 거리(화면 px) — 지구 테 · 점선과 겹치지 않게. */
const RADIUS_LABEL_GAP: Vec2 = [6, 14];
/** 지표 중력 이름표를 꼭짓점에서 띄우는 거리(화면 px). */
const PEAK_LABEL_GAP: Vec2 = [10, -12];
/** 「g = 0」 표지를 원점에서 띄우는 거리(화면 px) — 원점 왼쪽 위. */
const ZERO_LABEL_GAP: Vec2 = [-34, -20];
/**
 * 공 · 껍질 이름표가 나타나는 문턱(월드). 공 반지름이 이보다 작거나 껍질이 이보다 얇으면
 * 글자가 들어가지 않는다. `LABEL_FADE` 폭에 걸쳐 흐려진다.
 */
const BALL_LABEL_MIN = 0.42;
const SHELL_LABEL_MIN = 0.18;
const LABEL_FADE = 0.15;

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function circle(r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < CIRCLE_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / CIRCLE_SAMPLES;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: GravityInsideEarthState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const R = c.earthRadius;
  const out: Primitive[] = [];

  const r = massR(tl, c);
  const shown = massOpacity(tl);
  const ratio = gravityRatio(r, c);
  // 지금 당기는 몫 — 안에서는 반지름 r 인 안쪽 공, 밖에서는 지구 전체.
  const ball = Math.min(r, R);

  // 1. 지구 — 밀도가 고른 구의 단면. 옅은 회색 면과 테.
  const earth = circle(R);
  out.push({
    type: 'region',
    id: 'earth',
    points: earth,
    fillOpacity: EARTH_FILL,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'earth-rim',
    points: earth,
    closed: true,
    width: EARTH_RIM_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 2. 당기는 안쪽 공 — 강조색은 여기에만. 질량이 들어갈수록 함께 줄어든다.
  if (shown > 0 && ball > 0) {
    const pts = circle(ball);
    out.push({
      type: 'region',
      id: 'ball',
      points: pts,
      fillOpacity: BALL_FILL,
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'medium' },
    });
    out.push({
      type: 'trajectory',
      id: 'ball-rim',
      points: pts,
      closed: true,
      width: BALL_RIM_WIDTH,
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 3. 공 · 껍질 이름표 — 아래 반쪽, 중심 바로 아래 줄에 놓인다(위 반쪽은 그래프 자리).
  const ballLabel = shown * clamp01((ball - BALL_LABEL_MIN) / LABEL_FADE);
  if (ballLabel > 0) {
    out.push({
      type: 'readout',
      id: 'label-ball',
      anchor: { world: [0, -ball * 0.5] },
      text: text('label.ball'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: ballLabel,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  const shellLabel = shown * clamp01((R - ball - SHELL_LABEL_MIN) / LABEL_FADE);
  if (shellLabel > 0) {
    out.push({
      type: 'readout',
      id: 'label-shell',
      anchor: { world: [0, -(ball + R) * 0.5] },
      text: text('label.shell'),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: shellLabel,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 4. 그래프 축 — 가로축은 지구 중심에서 오른쪽으로(질량이 지나는 굴), 세로축은 위로.
  const gTop = c.graphHeight * G_AXIS_RATIO;
  out.push({
    type: 'trajectory',
    id: 'axis-r',
    points: [
      [0, 0],
      [c.axisR, 0],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'axis-g',
    points: [
      [0, 0],
      [0, gTop],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-axis-r',
    anchor: { world: [c.axisR, 0], offset: [AXIS_LABEL_GAP, 0] },
    text: text('label.axisR'),
    chip: false,
    font: 'text',
    italic: true,
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-axis-g',
    anchor: { world: [0, gTop], offset: [0, -AXIS_LABEL_GAP] },
    text: text('label.axisG'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 5. 지표 자리 — 꺾임에서 가로축까지 내린 점선과 두 이름표(반지름 · 지표 중력, 선언값 그대로).
  const peak = graphPoint(R, c);
  out.push({
    type: 'trajectory',
    id: 'surface-guide',
    points: [[R, 0], peak],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'label-radius',
    anchor: { world: [R, 0], offset: RADIUS_LABEL_GAP },
    text: text('label.radius'),
    vars: { r: String(c.earthRadiusKm) },
    chip: false,
    font: 'mono',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'label-peak',
    anchor: { world: peak, offset: PEAK_LABEL_GAP },
    text: text('label.surfaceG'),
    vars: { g: String(c.surfaceG) },
    chip: false,
    font: 'mono',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 6. g–r 곡선 — 전체를 옅게 깔고, 질량이 지나온 몫을 먹색으로 굵게 그린다.
  out.push({
    type: 'trajectory',
    id: 'curve-guide',
    points: curve(0, c.axisR, c),
    width: GUIDE_CURVE_WIDTH,
    opacity: GUIDE_CURVE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  if (shown > 0 && c.startR > r) {
    out.push({
      type: 'trajectory',
      id: 'curve-trace',
      points: curve(r, c.startR, c),
      width: TRACE_WIDTH,
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 7. 질량에서 그래프 점까지 — 「이 자리의 중력은 저 높이」.
  const point = graphPoint(r, c);
  if (shown > 0 && point[1] > 0) {
    out.push({
      type: 'trajectory',
      id: 'link',
      points: [[r, 0], point],
      width: AXIS_WIDTH,
      opacity: shown,
      style: { colorRole: 'secondary', emphasis: 'strong', lineStyle: 'dotted' },
    });
  }

  // 8. 중력 — 중심 쪽, 길이 ∝ g. 중심에서는 길이 0 이라 선언하지 않는다.
  if (shown > 0 && ratio > 0) {
    out.push({
      type: 'vector',
      id: 'pull',
      from: [r, 0],
      delta: [-c.arrowAtSurface * ratio, 0],
      width: PULL_WIDTH,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 9. 시험 질량 — 작은 먹색 공.
  if (shown > 0) {
    out.push({
      type: 'body',
      id: 'mass',
      pos: [r, 0],
      shape: 'circle',
      size: c.massRadius,
      glow: false,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // 10. 그래프 점 — 화살표와 같은 것(그 자리의 중력)이라 같은 색.
    out.push({
      type: 'body',
      id: 'graph-point',
      pos: point,
      shape: 'circle',
      size: c.massRadius * POINT_SIZE_RATIO,
      glow: false,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 11. 중심 — 중력 0 표지.
  const zero = zeroOpacity(tl);
  if (zero > 0) {
    out.push({
      type: 'readout',
      id: 'label-zero',
      anchor: { world: [0, 0], offset: ZERO_LABEL_GAP },
      text: text('label.zero'),
      font: 'mono',
      fontSize: LABEL_PX,
      opacity: zero,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
