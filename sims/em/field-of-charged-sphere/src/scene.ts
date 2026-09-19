// ========================================================================
// field-of-charged-sphere — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 위 — 공간. 구 껍질(body) · 겉면 전하 `+`(readout) · 자리마다 적힌 장 화살표(vector) ·
//      장이 0 인 자리의 점(particleSystem) · 시험 전하(body)와 받는 힘(vector).
// 아래 — E–r 그래프. `graph` 는 화면 카드라 위 그림과 가로축을 나눠 쓸 수 없어서, 축 ·
//      곡선 · 지금 점을 월드의 `trajectory` · `body` · `readout` 으로 조립한다 (NOTES c).
//      가로는 월드 x = r 그대로다 — 구의 가운데 바로 아래가 r = 0, 겉면 바로 아래가 r = R.
//
// 색은 뜻마다 하나다 — 적힌 장 화살표는 secondary, **강조색은 「시험 전하가 받는 힘(그 자리의
// 장 세기)」 한 가지 뜻에만** 쓴다: 받는 힘 화살표 · 그래프에 그어지는 곡선 · 그 끝 점.
// 한 점 전하의 곡선은 대상이 달라 색이 아니라 먹색 점선으로 가른다.
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
  circlePoints,
  fieldArrow,
  fieldStrength,
  graphY,
  gridSpots,
  pointChargeCurve,
  probeOpacity,
  probeR,
  probeTrace,
  readConstants,
  shellMarkAngles,
  shellRadius,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { FieldOfChargedSphereState } from './state';

/** 적힌 장 화살표의 굵기(화면 px). 받는 힘(굵은 강조)보다 가늘어 위계가 갈린다. */
const FIELD_ARROW_WIDTH = 1.5;
/** 받는 힘 화살표의 굵기(화면 px) · 머리 크기(월드). */
const FORCE_WIDTH = 4;
const FORCE_HEAD = 0.16;
/** 장이 0 인 자리의 점 크기(화면 px). 「여기는 화살표 길이가 0」 을 가리키는 표식이다. */
const ZERO_DOT_PX = 2.5;
/** 구 껍질의 둘레 굵기는 body 기본값을 쓴다. 원래 구 자리 점선의 굵기(화면 px). */
const GHOST_WIDTH = 1;
/** 겉면 전하 `+` 의 글자 크기(화면 px) · 한 점 전하의 `+` 글자 크기. */
const SHELL_SIGN_PX = 13;
const POINT_SIGN_PX = 15;
/** 시험 전하 이름표 글자 크기 · 전하 위로 띄우는 거리(화면 px). */
const PROBE_LABEL_PX = 12;
const PROBE_LABEL_GAP = -15;
/** 그래프 축 · 안내선 굵기(화면 px). 곡선(강조)보다 가늘다. */
const AXIS_WIDTH = 1;
/** 시험 전하가 그은 곡선 · 한 점 전하 점선 곡선의 굵기(화면 px). */
const TRACE_WIDTH = 3;
const POINT_CURVE_WIDTH = 1.5;
/** 그래프 축 이름 · 눈금 이름 글자 크기(화면 px)와 띄움 거리(화면 px). */
const AXIS_LABEL_PX = 12;
const AXIS_LABEL_GAP = 12;
/** R 눈금의 세로 길이(월드). */
const TICK_LEN = 0.08;
/** 겉면에서 그래프로 내리는 안내선 · 시험 전하에서 그래프로 내리는 이음선의 불투명도. */
const GUIDE_OPACITY = 0.6;
const LINK_OPACITY = 0.35;

export function scene(params: {
  state: FieldOfChargedSphereState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  const R = c.sphereRadius;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const shell = shellRadius(tl, c);
  const gathered = tl.at('gather');
  const back = tl.at('clear');
  const base = c.graphBaseY;

  // ── 아래: 그래프 판 ─────────────────────────────────────────────────
  // 1. 두 축 — r 은 구의 가운데 바로 아래에서 오른쪽으로, E 는 그 자리에서 위로.
  out.push({
    type: 'trajectory',
    id: 'axis-r',
    points: [
      [0, base],
      [c.graphEndR, base],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'axis-e',
    points: [
      [0, base],
      [0, graphY(c.graphTopE, c)],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  // R 눈금
  out.push({
    type: 'trajectory',
    id: 'tick-r',
    points: [
      [R, base - TICK_LEN],
      [R, base + TICK_LEN],
    ],
    width: AXIS_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const axisLabel = (id: string, pos: Vec2, offset: Vec2, key: 'mark.e' | 'mark.r' | 'mark.radius' | 'mark.origin') => {
    out.push({
      type: 'readout',
      id,
      anchor: { world: pos, offset },
      text: text(key),
      chip: false,
      font: 'text',
      italic: key !== 'mark.origin',
      fontSize: AXIS_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  };
  axisLabel('label-e', [0, graphY(c.graphTopE, c)], [-AXIS_LABEL_GAP, 0], 'mark.e');
  axisLabel('label-r', [c.graphEndR, base], [AXIS_LABEL_GAP, 0], 'mark.r');
  axisLabel('label-radius', [R, base], [0, AXIS_LABEL_GAP], 'mark.radius');
  axisLabel('label-origin', [0, base], [0, AXIS_LABEL_GAP], 'mark.origin');

  // 2. 겉면에서 그래프로 내리는 안내선 — 위 그림의 겉면과 아래 곡선의 뛰어오름이 같은 r 이다.
  out.push({
    type: 'trajectory',
    id: 'guide-surface',
    points: [
      [R, 0],
      [R, base],
    ],
    width: AXIS_WIDTH,
    opacity: GUIDE_OPACITY,
    style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
  });

  // ── 위: 공간 ───────────────────────────────────────────────────────
  // 3. 원래 구의 자리 — 전하를 모으기 시작하면 점선으로 남는다(「구 밖」 의 경계).
  const ghost = gathered * (1 - back);
  if (ghost > 0) {
    out.push({
      type: 'trajectory',
      id: 'sphere-ghost',
      points: circlePoints(R),
      closed: true,
      width: GHOST_WIDTH,
      opacity: ghost,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 4. 적힌 장 — 자리마다 화살표, 장이 0 인 자리는 점. 구 안 자리는 전하를 모으면 화살표가
  //    생기고, 다음 주기로 넘어가며(clear) 다시 점으로 돌아간다. 구 밖 자리는 늘 그대로다.
  const zeroDots: Vec2[] = [];
  const zeroOpacities: number[] = [];
  gridSpots(c).forEach((spot, i) => {
    const r = Math.hypot(spot[0], spot[1]);
    const insideSphere = r < R;
    const delta = fieldArrow(spot, shell, c);
    const hasArrow = delta[0] !== 0 || delta[1] !== 0;
    const arrowOpacity = insideSphere ? 1 - back : 1;
    if (hasArrow && arrowOpacity > 0) {
      out.push({
        type: 'vector',
        id: `field-${i}`,
        from: spot,
        delta,
        width: FIELD_ARROW_WIDTH,
        opacity: arrowOpacity,
        style: { colorRole: 'secondary', emphasis: 'medium' },
      });
    }
    const dotOpacity = !hasArrow ? 1 : insideSphere ? back : 0;
    if (dotOpacity > 0) {
      zeroDots.push(spot);
      zeroOpacities.push(dotOpacity);
    }
  });
  if (zeroDots.length > 0) {
    out.push({
      type: 'particleSystem',
      id: 'zero-spots',
      positions: zeroDots,
      opacities: zeroOpacities,
      sizes: ZERO_DOT_PX,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  }

  // 5. 전하가 퍼진 껍질 — 처음엔 구의 겉면, 모으는 동안 가운데로 줄어든다.
  const shellShown = 1 - back;
  const pushShell = (id: string, radius: number, opacity: number) => {
    if (opacity <= 0) return;
    if (radius > c.pointRadius) {
      out.push({
        type: 'body',
        id: `${id}-body`,
        pos: [0, 0],
        shape: 'circle',
        size: radius,
        fill: 'none',
        outline: 'role',
        glow: false,
        opacity,
        style: { colorRole: 'muted', emphasis: 'strong' },
      });
    }
    shellMarkAngles(c).forEach((a, k) => {
      out.push({
        type: 'readout',
        id: `${id}-mark-${k}`,
        anchor: { world: [radius * Math.cos(a), radius * Math.sin(a)] },
        text: text('mark.plus'),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: SHELL_SIGN_PX,
        align: 'center',
        opacity,
        style: ink,
      });
    });
  };
  pushShell('shell', shell, shellShown);
  // 다음 주기로 넘어가며 제자리 구가 다시 떠오른다.
  pushShell('rim', R, back);

  // 6. 한 점에 모인 전하 — 모이는 만큼 짙어진다.
  const pointShown = gathered * (1 - back);
  if (pointShown > 0) {
    out.push({
      type: 'body',
      id: 'point-charge',
      pos: [0, 0],
      shape: 'circle',
      size: c.pointRadius,
      glow: false,
      outline: 'line',
      opacity: pointShown,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
    out.push({
      type: 'readout',
      id: 'point-sign',
      anchor: { world: [0, 0] },
      text: text('mark.plus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: POINT_SIGN_PX,
      align: 'center',
      opacity: pointShown,
      style: ink,
    });
  }

  // ── 그래프 곡선 ─────────────────────────────────────────────────────
  const shown = probeOpacity(tl);
  const r = probeR(tl, c);
  // 그래프의 지금 점은 **구 껍질의** 곡선 위를 간다 — 모으는 동안 그 점은 흐려질 뿐 옮겨 가지 않는다.
  const eSphere = fieldStrength(r, R, c);

  // 7. 시험 전하가 그은 곡선 — 다가오는 동안 자라고, 겉면에서 0 으로 떨어진다.
  if (shown > 0 && tl.at('approach') > 0) {
    out.push({
      type: 'trajectory',
      id: 'probe-trace',
      points: probeTrace(r, c),
      width: TRACE_WIDTH,
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 8. 한 점 전하의 곡선 — 먹색 점선. 구 밖에서는 위의 곡선에 꼭 얹히고, 안에서는 판을 뚫고 오른다.
  const pointCurve = tl.at('reveal') * (1 - back);
  if (pointCurve > 0) {
    out.push({
      type: 'trajectory',
      id: 'point-curve',
      points: pointChargeCurve(c),
      width: POINT_CURVE_WIDTH,
      opacity: pointCurve,
      style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  if (shown <= 0) return out;

  // ── 시험 전하 ──────────────────────────────────────────────────────
  const pos: Vec2 = [r, 0];
  // 9. 그래프 위 지금 점과 그리로 내리는 이음선 — 껍질의 곡선을 긋는 동안만(모으기 전까지).
  const dotShown = shown * (1 - gathered);
  if (dotShown > 0) {
    out.push({
      type: 'trajectory',
      id: 'probe-link',
      points: [pos, [r, graphY(eSphere, c)]],
      width: AXIS_WIDTH,
      opacity: dotShown * LINK_OPACITY,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
    });
    out.push({
      type: 'body',
      id: 'probe-graph-dot',
      pos: [r, graphY(eSphere, c)],
      shape: 'point',
      opacity: dotShown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 10. 시험 전하와 받는 힘.
  out.push({
    type: 'body',
    id: 'probe',
    pos,
    shape: 'circle',
    size: c.probeRadius,
    glow: false,
    outline: 'line',
    opacity: shown,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  out.push({
    type: 'vector',
    id: 'probe-force',
    from: pos,
    delta: fieldArrow(pos, shell, c),
    headSize: FORCE_HEAD,
    width: FORCE_WIDTH,
    outline: 'background',
    opacity: shown,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'probe-label',
    anchor: { world: pos, offset: [0, PROBE_LABEL_GAP] },
    text: text('mark.q'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: PROBE_LABEL_PX,
    align: 'center',
    opacity: shown,
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
