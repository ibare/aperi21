// ========================================================================
// biot-savart-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 고리 · 축 · 조각 경계 · 조각에서 P 로
// 가는 선은 `trajectory` 와 `body` 점, 작은 장 · 합 · 전류 표식은 `vector`, P 이름표는
// `readout` 이다. 3차원 배치(고리 · 사슬)의 투영은 `physics.project` 가 한다 (장부 G55).
//
// 색은 뜻마다 하나다 — 도선 · P · 전류 표식은 먹색(`ink`), 장(조각의 dB 와 합 B)은 같은
// 양이라 같은 `primary` 이고 굵기로 부분과 전체를 가른다. **강조색은 「지금 더하는 조각」
// 한 가지 뜻에만** 쓴다(켜진 조각 · 그 조각에서 P 로 가는 선 · 새로 붙는 dB). 축은 배경 정보라
// `muted`.
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
  activePiece,
  chainNodes,
  depth,
  observationPoint,
  pieceAngles,
  pieceField,
  pieceGrowth,
  project,
  readConstants,
  ringPoint,
  type BiotSavartLawConstants,
  type Vec3,
} from './physics';
import { AXIS_FROM, AXIS_TO, SCENE_BOUNDS, text } from './schema';
import type { BiotSavartLawState } from './state';

/** 고리 도선의 굵기(화면 px). */
const WIRE_WIDTH_PX = 2.4;
/** 고리 뒤쪽 반의 짙기. 앞 · 뒤를 가르는 것은 이것 하나다 (장부 G121). */
const FAR_OPACITY = 0.35;
/** 반원 하나를 이루는 꼭짓점 수. 이 정도면 매끈한 호로 읽힌다. */
const HALF_RING_SEGMENTS = 48;
/** 켜진 조각의 호를 이루는 꼭짓점 수와 굵기(화면 px). 도선보다 굵어야 「이 조각」 이 읽힌다. */
const PIECE_SEGMENTS = 8;
const PIECE_WIDTH_PX = 5;
/** 켜진 조각에서 P 로 가는 선의 굵기(화면 px). 재는 선이라 가늘게. */
const REACH_WIDTH_PX = 1.2;
/** 축 점선의 굵기(화면 px) · 짙기. 기준선이지 그림의 일부가 아니다. */
const AXIS_WIDTH_PX = 1;
const AXIS_OPACITY = 0.7;
/** 이어 붙은 dB 의 굵기(화면 px) · 지금 붙는 dB 의 굵기 · 합 B 의 굵기. 부분은 가늘고 전체는 굵다. */
const CHAIN_WIDTH_PX = 2;
const ACTIVE_WIDTH_PX = 2.6;
const TOTAL_WIDTH_PX = 4;
/** 전류 표식 I 화살표 — 고리 앞쪽 옆에서 바깥으로 띄운 거리와 길이(월드 m). */
const CURRENT_ARROW_GAP = 0.14;
const CURRENT_ARROW_LEN = 0.5;
/** P 이름표를 점에서 띄우는 거리(화면 px) — 오른쪽 아래. 조각에서 P 로 오는 선은 왼쪽에서, 사슬은 위로 떠나므로 비어 있다. */
const POINT_LABEL_OFFSET: Vec2 = [10, 14];
/** P 이름표 글자 크기(화면 px). */
const POINT_LABEL_PX = 14;

function arc(from: number, to: number, segments: number, c: BiotSavartLawConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= segments; k++) {
    pts.push(project(ringPoint(from + ((to - from) * k) / segments, c), c));
  }
  return pts;
}

function add(a: Vec3, b: Vec3, s: number): Vec3 {
  return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
}

function minus(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scene(params: {
  state: BiotSavartLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('biot-savart-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  // 사슬 · 합 · 켜진 조각이 다음 주기로 넘어가며 흐려지는 정도.
  const alpha = 1 - tl.at('fade');

  const p = observationPoint(c);
  const pScreen = project(p, c);

  // ---- 축 ----
  // 합 B 가 이 선 위에 놓이는지, 사슬이 이 선으로 되돌아오는지가 판정이다.
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [project([AXIS_FROM, 0, 0], c), project([AXIS_TO, 0, 0], c)],
    width: AXIS_WIDTH_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 고리 ----
  // 뒤쪽 반(보는 사람에게서 먼 쪽, sin φ < 0)은 옅게 먼저, 앞쪽 반은 짙게 위에.
  out.push({
    type: 'trajectory',
    id: 'ring-far',
    points: arc(Math.PI, 2 * Math.PI, HALF_RING_SEGMENTS, c),
    width: WIRE_WIDTH_PX,
    opacity: FAR_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'ring-near',
    points: arc(0, Math.PI, HALF_RING_SEGMENTS, c),
    width: WIRE_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 조각 경계. 고리가 몇 조각으로 나뉘었는지를 점으로 센다.
  for (let i = 0; i < c.pieces; i++) {
    const at = ringPoint(pieceAngles(i, c).from, c);
    out.push({
      type: 'body',
      id: `cut-${i}`,
      pos: project(at, c),
      shape: 'point',
      opacity: depth(at, c) < 0 ? FAR_OPACITY : 1,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 전류 방향. 앞쪽 옆(φ = 90°)에서 dl̂ = −û 라 아래로 흐른다 — 화면에서 반시계로 돈다.
  const side = project(ringPoint(Math.PI / 2, c), c);
  out.push({
    type: 'vector',
    id: 'current',
    from: [side[0] - CURRENT_ARROW_GAP, side[1] + CURRENT_ARROW_LEN / 2],
    delta: [0, -CURRENT_ARROW_LEN],
    label: text('label.current'),
    labelSide: 'cw',
    width: CHAIN_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지금 더하는 조각 ----
  const active = activePiece(tl, c);
  if (active >= 0) {
    const { from, mid, to } = pieceAngles(active, c);
    out.push({
      type: 'trajectory',
      id: 'piece-active',
      points: arc(from, to, PIECE_SEGMENTS, c),
      width: PIECE_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    // 조각에서 P 로 — dB 의 방향이 이 선과 조각의 방향 둘 다에 수직이라는 것을 보는 기준.
    out.push({
      type: 'trajectory',
      id: 'reach',
      points: [project(ringPoint(mid, c), c), pScreen],
      width: REACH_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 머리-꼬리 사슬 ----
  // 조각 i 의 dB 를 앞 조각들의 합 끝에 붙인다. 자라는 중인 화살표는 강조색으로 맨 위에.
  const nodes = chainNodes(c);
  const activeArrows: Primitive[] = [];
  for (let i = 0; i < c.pieces; i++) {
    const g = pieceGrowth(i, tl, c);
    if (g <= 0) continue;
    const tail = project(nodes[i]!, c);
    const head = project(add(nodes[i]!, pieceField(i, c), g), c);
    if (i === active) {
      activeArrows.push({
        type: 'vector',
        id: `dB-${i}`,
        from: tail,
        delta: minus(head, tail),
        label: text('label.pieceField'),
        width: ACTIVE_WIDTH_PX,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    } else {
      out.push({
        type: 'vector',
        id: `dB-${i}`,
        from: tail,
        delta: minus(head, tail),
        width: CHAIN_WIDTH_PX,
        opacity: alpha,
        style: { colorRole: 'primary', emphasis: 'strong' },
      });
    }
  }
  out.push(...activeArrows);

  // ---- 합 B ----
  // P 에서 사슬 끝까지. 사슬 끝이 축 위에 떨어지므로 이 화살표는 축을 따라 선다.
  const grow = tl.at('sum');
  if (grow > 0) {
    const end = project(nodes[c.pieces]!, c);
    const full = minus(end, pScreen);
    out.push({
      type: 'vector',
      id: 'total',
      from: pScreen,
      delta: [full[0] * grow, full[1] * grow],
      label: text('label.totalField'),
      labelSide: 'cw',
      width: TOTAL_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 관측점 ----
  out.push({
    type: 'body',
    id: 'point',
    pos: pScreen,
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'point-label',
    anchor: { world: pScreen, offset: POINT_LABEL_OFFSET },
    text: text('label.point'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: POINT_LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
