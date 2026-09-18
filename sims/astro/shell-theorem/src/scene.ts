// ========================================================================
// shell-theorem — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 껍질 · 조각(trajectory),
// 원뿔 쐐기(region), 당김(vector), 시험 질량(body), 합 표지(readout)가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 껍질은 배경 쪽 회색(muted), 원뿔 쐐기는 secondary 옅은 칠,
// 시험 질량은 먹색(ink), 당김은 밖이든 안이든 같은 primary(같은 것 — 껍질의 당김),
// **강조색은 「원뿔이 오려 낸 두 조각」 한 가지 뜻에만** 쓴다.
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
  coneAxis,
  coneOpacity,
  conePiece,
  massAt,
  massOpacity,
  outsidePull,
  readConstants,
} from './physics';
import { SCENE_BOUNDS, SHELL_SAMPLES, text } from './schema';
import type { ShellTheoremState } from './state';

/** 껍질 선 굵기(화면 px). 속 빈 얇은 껍질 — 질량이 선 위에만 있다. */
const SHELL_WIDTH = 4;
/** 오려 낸 조각 굵기(화면 px). 껍질보다 굵어 「이 부분」 이 떠오른다. */
const PIECE_WIDTH = 7;
/** 쐐기 채움 불투명도. 껍질과 조각이 비쳐 보이는 정도. */
const WEDGE_FILL = 0.2;
/** 당김 화살표 굵기(화면 px). */
const PULL_WIDTH = 3;
/**
 * 합 표지를 시험 질량에서 띄우는 거리(화면 px). 원뿔 축에 **수직인 쪽**으로 띄운다 — 축 위에
 * 두면 도는 동안 화살표를 가린다. 수직 방향은 축과 함께 돌아 표지가 끊김 없이 따라간다.
 */
const NET_GAP = 34;

export function scene(params: {
  state: ShellTheoremState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const out: Primitive[] = [];

  const pos = massAt(tl, c);
  const shown = massOpacity(tl);
  const cone = coneOpacity(tl) * shown;
  const axis = coneAxis(tl, c);
  const pieces = cone > 0 ? [conePiece(pos, axis, c), conePiece(pos, axis + Math.PI, c)] : [];

  // 1. 원뿔 쐐기 — 시험 질량에서 양쪽으로 뻗어 껍질을 오려 낸다. 껍질 아래에 옅게 깔린다.
  pieces.forEach((piece, i) => {
    out.push({
      type: 'region',
      id: `wedge-${i}`,
      points: piece.wedge,
      fillOpacity: WEDGE_FILL,
      opacity: cone,
      style: { colorRole: 'secondary', emphasis: 'medium' },
    });
  });

  // 2. 껍질 — 속 빈 얇은 구의 단면. 질량은 이 선 위에만 있다.
  const shell: Vec2[] = [];
  for (let k = 0; k < SHELL_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / SHELL_SAMPLES;
    shell.push([c.shellRadius * Math.cos(a), c.shellRadius * Math.sin(a)]);
  }
  out.push({
    type: 'trajectory',
    id: 'shell',
    points: shell,
    closed: true,
    width: SHELL_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 3. 오려 낸 두 조각 — 가까운 쪽은 좁고, 먼 쪽은 넓다. 강조색은 여기에만.
  pieces.forEach((piece, i) => {
    out.push({
      type: 'trajectory',
      id: `piece-${i}`,
      points: piece.arc,
      width: PIECE_WIDTH,
      opacity: cone,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  });

  // 4. 껍질 밖 당김 — 중심 쪽. 껍질 안이면 길이 0 이라 선언하지 않는다.
  const outside = outsidePull(pos, c);
  if (shown > 0 && (outside[0] !== 0 || outside[1] !== 0)) {
    out.push({
      type: 'vector',
      id: 'pull-outside',
      from: pos,
      delta: outside,
      width: PULL_WIDTH,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 5. 두 조각의 당김 — 각자 제 조각 쪽. 같은 길이로 맞선다.
  pieces.forEach((piece, i) => {
    out.push({
      type: 'vector',
      id: `pull-piece-${i}`,
      from: pos,
      delta: piece.pull,
      width: PULL_WIDTH,
      outline: 'background',
      opacity: cone,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  });

  // 6. 시험 질량 — 작은 먹색 공. 두 화살표의 꼬리를 덮는다.
  if (shown > 0) {
    out.push({
      type: 'body',
      id: 'mass',
      pos,
      shape: 'circle',
      size: c.massRadius,
      glow: false,
      outline: 'background',
      opacity: shown,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 7. 합 표지 — 두 당김이 맞서는 동안만. 질량을 따라다닌다.
  if (cone > 0) {
    out.push({
      type: 'readout',
      id: 'net',
      // 월드 수직 (−sin, cos) 를 화면으로 — 화면 y 는 아래가 + 라 부호가 뒤집힌다.
      anchor: { world: pos, offset: [-Math.sin(axis) * NET_GAP, -Math.cos(axis) * NET_GAP] },
      text: text('label.net'),
      font: 'mono',
      opacity: cone,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
