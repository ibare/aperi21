// ========================================================================
// vector-decomposition — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다 (원칙 1). 자유 렌더 0건.
//
// 축 · 수선은 `trajectory`, 원래 화살표와 두 성분은 `vector` 다. 단계 경계 상수와
// `if (u < …)` 사슬은 옮겨 오지 않았다 — 시간표는 `schema.timeline` 이고 여기서는
// 단계 **이름**만 부른다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  AXIS_BELOW,
  AXIS_R,
  AXIS_WIDTH_PX,
  GUIDE_FADE,
  GUIDE_RISE,
  GUIDE_WIDTH_PX,
  HEAD,
  ORIGIN,
  PART_WIDTH_PX,
  SCENE_BOUNDS,
  SPLIT_ON,
  VECTOR_WIDTH_PX,
} from './schema';
import { autoTip } from './physics';
import type { VectorDecompositionState } from './state';

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function scene(params: {
  state: VectorDecompositionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('vector-decomposition: schema.timeline 이 선언되어야 한다');

  // 원래 화살표. 독자가 정했으면 그것, 아니면 시간표의 주기·돌아감에서 고른다.
  const v: Vec2 = state.user ?? autoTip({ cycle: timeline.cycle, turn: timeline.at('turn') });

  // split: 0 = 성분 끝이 원래 끝점에 겹침, 1 = 축 위로 내려앉음.
  // 되돌림은 이어 붙임이 풀리는 것과 함께 시작해 조금 더 길게 간다.
  const split =
    timeline.at('split') *
    (1 - timeline.span(timeline.start('unchain'), timeline.end('unsplit'), 'smooth'));
  // chain: 세로 성분의 꼬리가 원점에서 가로 성분 끝으로 옮겨 간 정도.
  const chain = timeline.at('chain') * (1 - timeline.at('unchain'));

  const footX: Vec2 = [v[0], 0];
  const footY: Vec2 = [0, v[1]];

  const out: Primitive[] = [];

  // ---- 두 축 ----
  // 분해는 "축 방향으로" 나누는 것이라 축이 없으면 주장이 서지 않는다. 눈금·숫자·
  // 화살촉은 두지 않는다 — 길이를 재라는 그림이 아니다.
  const axisX: Trajectory = {
    type: 'trajectory',
    id: 'axis-x',
    points: [
      [-AXIS_R, 0],
      [AXIS_R, 0],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  const axisY: Trajectory = {
    type: 'trajectory',
    id: 'axis-y',
    points: [
      [0, -AXIS_BELOW],
      [0, AXIS_R],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(axisX, axisY);

  // ---- 끝점에서 축으로 내린 수선 ----
  // 성분의 끝이 어디서 정해지는지가 질문의 핵심이라, 끝이 이 선을 따라 움직인다.
  // 갈라지는 동안 나타나고 이어 붙인 뒤에는 옅어진다.
  const guideAlpha = clamp01(split * GUIDE_RISE) * (1 - chain * GUIDE_FADE);
  if (guideAlpha > 0) {
    for (const [id, foot] of [
      ['guide-x', footX],
      ['guide-y', footY],
    ] as const) {
      const guide: Trajectory = {
        type: 'trajectory',
        id,
        points: [v, foot],
        width: GUIDE_WIDTH_PX,
        opacity: guideAlpha,
        style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
      };
      out.push(guide);
    }
  }

  // ---- 원래 화살표 ----
  const original: Vector = {
    type: 'vector',
    id: 'original',
    from: ORIGIN,
    delta: v,
    width: VECTOR_WIDTH_PX,
    headSize: HEAD,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(original);

  // ---- 두 성분 ----
  // **같은 색이다.** 강조색은 "성분" 한 뜻에만 쓴다. 어느 축 위에 있는지는 위치가
  // 말한다 — 가로·세로를 색으로 가르면 색이 위치의 일을 가로챈다 (원본 NOTES (c)).
  if (split > SPLIT_ON) {
    // 가로 성분: 끝이 원래 끝점에서 수선을 따라 x 축 위 발까지 내려온다.
    const xEnd: Vec2 = [v[0], v[1] * (1 - split)];
    const partX: Vector = {
      type: 'vector',
      id: 'part-x',
      from: ORIGIN,
      delta: xEnd,
      width: PART_WIDTH_PX,
      headSize: HEAD,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    // 세로 성분: 끝이 y 축 위 발까지 내려오고, 이어 붙일 때는 통째로 옆으로 옮겨 간다.
    const shift = footX[0] * chain;
    const partY: Vector = {
      type: 'vector',
      id: 'part-y',
      from: [shift, 0],
      delta: [v[0] * (1 - split), v[1]],
      width: PART_WIDTH_PX,
      headSize: HEAD,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(partX, partY);
  }

  // 끝점 손잡이는 조작기(`point-drag`, `handle: 'ring'`)가 그린다.
  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 끄는 동안 카메라가 따라 흔들리면 독자가 바꾼 것이 무엇인지 흐려진다.
  return { ...SCENE_BOUNDS };
}
