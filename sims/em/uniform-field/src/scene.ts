// ========================================================================
// uniform-field — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 장선과 판 전하 분포는 state 에 한 번 풀어 둔 것을 읽는다.
// 자유 렌더 계층을 쓰지 않는다 — 장선(lineSet) · 판(body rect) · 부호(readout) ·
// 시험 전하(body) · 받는 힘과 견줌 점선(vector)이 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 판과 부호는 먹, 장선은 secondary, 시험 전하는 옅은 원.
// **강조색은 「시험 전하가 지금 받는 힘」 한 가지 뜻에만** 쓴다. 판 밖 전하 곁의
// 견줌 점선은 판 사이 힘과 같은 길이 · 방향이라 강조색을 쓰지 않고 secondary 점선이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  ViewDef,
} from '@aperi21/schema';
import {
  compareOpacity,
  forceArrow,
  insideArrow,
  exitingProbe,
  probeAt,
  probeOpacity,
  readConstants,
} from './physics';
import { FIELD_CLIP, SCENE_BOUNDS, text } from './schema';
import type { UniformFieldState } from './state';

/** 장선 굵기(화면 px). 배경 정보라 힘 화살표보다 한참 가늘다. */
const FIELD_LINE_WIDTH = 1.2;
/** 장선 불투명도. 판 사이를 채우되 힘 화살표를 누르지 않는다. */
const FIELD_LINE_OPACITY = 0.75;
/** 받는 힘 화살표의 굵기(화면 px) · 머리 크기(월드). */
const FORCE_WIDTH = 4;
const FORCE_HEAD = 0.2;
/** 견줌 점선 화살표의 굵기(화면 px). */
const COMPARE_WIDTH = 2;
/** 판 부호 글자 크기(화면 px) · 판에서 띄우는 거리(화면 px). */
const PLATE_SIGN_PX = 18;
const PLATE_SIGN_GAP = 14;
/** 시험 전하 부호 글자 크기(화면 px) · 전하 왼쪽으로 띄우는 거리(화면 px). */
const PROBE_SIGN_PX = 13;
const PROBE_SIGN_GAP = 15;

export function scene(params: {
  state: UniformFieldState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const { plates, lines } = params.state;
  const out: Primitive[] = [];
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const top = c.gap / 2;

  // 1. 장선 — 판 사이에서 곧고, 양 끝에서만 밖으로 부푼다. 캡션 띠 위에서 자른다.
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines,
    width: FIELD_LINE_WIDTH,
    opacity: FIELD_LINE_OPACITY,
    clip: { min: FIELD_CLIP.min, max: FIELD_CLIP.max },
    style: { colorRole: 'secondary', emphasis: 'medium' },
  });

  // 2. 두 판 — 먹색 얇은 막대. 위 +, 아래 −.
  ([['plate-top', top], ['plate-bottom', -top]] as const).forEach(([id, y]) => {
    out.push({
      type: 'body',
      id,
      pos: [0, y],
      shape: 'rect',
      size: [c.plateLength, c.plateThickness],
      glow: false,
      outline: 'none',
      style: ink,
    });
  });
  out.push({
    type: 'readout',
    id: 'plate-top-sign',
    anchor: { world: [0, top], offset: [0, -PLATE_SIGN_GAP] },
    text: text('mark.plus'),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: PLATE_SIGN_PX,
    align: 'center',
    style: ink,
  });
  out.push({
    type: 'readout',
    id: 'plate-bottom-sign',
    anchor: { world: [0, -top], offset: [0, PLATE_SIGN_GAP] },
    text: text('mark.minus'),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: PLATE_SIGN_PX,
    align: 'center',
    style: ink,
  });

  const shown = probeOpacity(tl);
  if (shown <= 0) return out;

  const exiting = exitingProbe(c);
  const probes = c.starts.map((_, i) => probeAt(i, tl, c));

  // 3. 견줌 — 판 밖으로 나가는 전하 곁에 판 사이 힘을 점선으로. 나가는 동안 나타난다.
  const compare = compareOpacity(tl);
  if (compare > 0) {
    out.push({
      type: 'vector',
      id: 'compare',
      from: probes[exiting]!,
      delta: insideArrow(plates, c),
      headSize: FORCE_HEAD,
      width: COMPARE_WIDTH,
      opacity: compare,
      style: { colorRole: 'secondary', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  probes.forEach((pos, i) => {
    // 4. 시험 전하 — 작은 옅은 원과 왼쪽의 부호.
    out.push({
      type: 'body',
      id: `probe-${i}`,
      pos,
      shape: 'circle',
      size: c.probeRadius,
      glow: false,
      outline: 'line',
      opacity: shown,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
    out.push({
      type: 'readout',
      id: `probe-sign-${i}`,
      anchor: { world: pos, offset: [-PROBE_SIGN_GAP, 0] },
      text: text('mark.plus'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: PROBE_SIGN_PX,
      align: 'center',
      opacity: shown,
      style: ink,
    });

    // 5. 받는 힘 — 지금 자리의 장 × 배율. 판 사이 어디서나 같은 길이 · 방향이다.
    out.push({
      type: 'vector',
      id: `force-${i}`,
      from: pos,
      delta: forceArrow(pos, plates, c),
      headSize: FORCE_HEAD,
      width: FORCE_WIDTH,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
