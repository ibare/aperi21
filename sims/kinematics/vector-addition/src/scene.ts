// ========================================================================
// vector-addition — 선언으로서의 장면
// ========================================================================
// 그리지 않는다, 선언한다 (원칙 1).
//
// 자유 렌더를 쓰지 않는다. 화살표(vector) · 자국(trajectory) · 점(body) ·
// 안내 글자(readout) 가 모두 표준 어휘로 있다. 원본이 손으로 짜던 것 중 엔진에
// 없던 넷 — 점선 화살표 · 이름 쪽 고르기 · 이름 칩 · 배경색 테두리 — 은 이
// 조각 때문에 어휘로 올라왔고 여기서 실제로 쓴다 (원칙 4).
//
// 단계 경계 상수와 `if (u < B1)` 사슬은 옮겨 오지 않았다. 시간표는 선언이고
// (`schema.timeline`), 여기서는 단계의 **이름**만 부른다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';

import {
  GHOST_ALPHA,
  GHOST_HEAD,
  GHOST_WIDTH_PX,
  HINT_FONT_PX,
  HINT_IN,
  HINT_OFFSET,
  HINT_OUT,
  ORIGIN,
  SCENE_BOUNDS,
  SUM_HEAD,
  SUM_LABEL_AT,
  SUM_WIDTH_PX,
  TAIL_RADIUS,
  TRAIL_ALPHA,
  TRAIL_WIDTH_PX,
  VECTOR_HEAD,
  VECTOR_WIDTH_PX,
  WALKER_RADIUS,
  text,
} from './schema';
import type { VectorAdditionState } from './state';

/** 점선 잔상이 나타나기 시작하는 떠남 정도. 원본 `sc.s <= 0.02` 는 그리지 않았다. */
const GHOST_ON = 0.02;

function add(p: Vec2, q: Vec2): Vec2 {
  return [p[0] + q[0], p[1] + q[1]];
}

function mul(p: Vec2, k: number): Vec2 {
  return [p[0] * k, p[1] * k];
}

export function scene(params: {
  state: VectorAdditionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('vector-addition: schema.timeline 이 선언되어야 한다');

  // 끄는 동안은 완성된 삼각형에 머문다 — 걷는 점까지 함께 움직이면 시선이 갈라져
  // "합이 따라 바뀐다" 가 안 보인다 (NOTES.md 「끌어 보기」).
  const frozen = state.dragging;
  const phase = frozen ? 'hold' : timeline.phase;
  // 나의 꼬리가 가의 머리로 간 정도. 미끄러져 가고(slide) 되돌아온다(back).
  const s = frozen ? 1 : timeline.at('slide') * (1 - timeline.at('back'));
  const backAmt = frozen ? 0 : timeline.at('back');

  const a: Vec2 = [state.aTip[0] - ORIGIN[0], state.aTip[1] - ORIGIN[1]];
  const b = state.bDelta;
  const aHead = state.aTip;
  const bTail = add(ORIGIN, mul(a, s));
  const end = add(aHead, b);

  // 걷는 점 — 가를 끝까지 걷고 멈추지 않고 이어 나를 걷는다.
  let walk: Vec2 | null = null;
  let walkAlpha = 0;
  if (phase === 'walkA') {
    walk = add(ORIGIN, mul(a, timeline.at('walkA')));
    walkAlpha = 1;
  } else if (phase === 'walkB' || phase === 'grow' || phase === 'hold') {
    walk = add(aHead, mul(b, frozen ? 1 : timeline.at('walkB')));
    walkAlpha = 1;
  } else if (phase === 'back') {
    walk = end;
    walkAlpha = 1 - backAmt;
  }

  // 합 — 자라고(grow), 유지되고(hold), 흐려진다(back).
  let sumT = 0;
  let sumAlpha = 0;
  if (phase === 'grow' || phase === 'hold') {
    sumT = frozen ? 1 : timeline.at('grow');
    sumAlpha = 1;
  } else if (phase === 'back') {
    sumT = 1;
    sumAlpha = 1 - backAmt;
  }

  // '끌기' 글자는 삼각형이 완성되어 아무것도 안 움직이는 구간에만 떠올랐다
  // 사라진다. 걷는 동안 띄우면 가의 머리(= 나의 꼬리)라는 이음매가 글자에 묻힌다.
  const hold0 = timeline.start('hold');
  const hold1 = timeline.end('hold');
  const hint = frozen
    ? 1
    : Math.min(
        timeline.span(hold0, hold0 + HINT_IN, 'smooth'),
        1 - timeline.span(hold1 - HINT_OUT, hold1, 'smooth'),
      );

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`).
  const out: Primitive[] = [];

  // ---- 나의 원래 자리 ----
  // 옮겼다는 사실의 증거. 미끄러짐이 끝난 뒤에 도착한 독자도 "원래 거기 있었다" 를
  // 볼 수 있어야 한다. 머리는 실선으로 나간다 — 점선으로 끊으면 방향이 안 읽힌다.
  if (s > GHOST_ON) {
    const ghost: Vector = {
      type: 'vector',
      id: 'b-ghost',
      from: ORIGIN,
      delta: b,
      width: GHOST_WIDTH_PX,
      headSize: GHOST_HEAD,
      opacity: GHOST_ALPHA * s,
      // 흐린 회색은 '지금 유효하지 않은 것' 한 뜻으로만 쓴다 — 떠나간 자리와 안내
      // 글자 둘뿐이다. `subtle` 은 역할색을 종이에 옅게 얹는 자리다.
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
    };
    out.push(ghost);
  }

  // ---- 걸어온 자국 ----
  // 점만 있으면 "지금 어디" 만 보이고 "어떻게 왔는가" 가 안 남는다. 합이 자랄 때
  // 비교 대상이 되어야 하므로 꺾인 두 도막이 화면에 남아야 한다.
  if (walk && walkAlpha > 0) {
    const trail: Trajectory = {
      type: 'trajectory',
      id: 'trail',
      points: phase === 'walkA' ? [ORIGIN, walk] : [ORIGIN, aHead, walk],
      width: TRAIL_WIDTH_PX,
      opacity: TRAIL_ALPHA * walkAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(trail);
  }

  // ---- 가와 나 ----
  // **같은 색이다.** 둘은 같은 종류의 대상(더해지는 벡터)이고, 색이 갈리는 순간
  // "색이 다르니 뭔가 다른 것" 이라는 없는 뜻이 생긴다. 둘을 가르는 것은 위치와
  // 순서다 (S-piece MUST NOT).
  //
  // 이름 쪽은 `auto` — 독자가 끌어 방향이 뒤집혀도 이름이 남의 화살표에 올라타지
  // 않는다. 칩을 깐 것은 이름이 삼각형 안쪽에 놓여 합의 화살표와 만날 수 있어서다.
  const vecA: Vector = {
    type: 'vector',
    id: 'a',
    from: ORIGIN,
    delta: a,
    width: VECTOR_WIDTH_PX,
    headSize: VECTOR_HEAD,
    label: text('label.a'),
    labelSide: 'auto',
    labelChip: true,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(vecA);

  const vecB: Vector = {
    type: 'vector',
    id: 'b',
    from: bTail,
    delta: b,
    width: VECTOR_WIDTH_PX,
    headSize: VECTOR_HEAD,
    label: text('label.b'),
    labelSide: 'auto',
    labelChip: true,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(vecB);

  // ---- 합 ----
  // 강조색을 쓰는 곳은 여기 하나뿐이다 — 화면에 강조색이 보이면 그건 언제나 합이다.
  // 이름은 자람이 절반을 넘긴 뒤에 붙는다.
  if (sumAlpha > 0) {
    const grown: Vec2 = [(end[0] - ORIGIN[0]) * sumT, (end[1] - ORIGIN[1]) * sumT];
    const sum: Vector = {
      type: 'vector',
      id: 'sum',
      from: ORIGIN,
      delta: grown,
      width: SUM_WIDTH_PX,
      headSize: SUM_HEAD,
      opacity: sumAlpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
      ...(sumT > SUM_LABEL_AT ? { label: text('label.sum'), labelSide: 'auto' as const } : {}),
    };
    out.push(sum);
  }

  // ---- 출발 꼬리 ----
  // 주장의 문장이 "**처음 꼬리**에서 마지막 머리까지" 다. 그 자리가 지목되지
  // 않으면 문장이 가리킬 데가 없다. 속을 비운 것은 화살표들이 여기서 나가기
  // 때문이다 — 채우면 세 화살표의 출발이 점에 먹힌다.
  const tail: Body = {
    type: 'body',
    id: 'tail',
    pos: ORIGIN,
    shape: 'circle',
    size: TAIL_RADIUS,
    // 속을 비우고 둘레는 **제 색**으로 — 테마의 선 색으로 고정되면 옅은 고리가 되어
    // 화살표들이 어디서 나가는지가 흐려진다.
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(tail);

  // ---- 걷는 점 ----
  // 화살표 위를 지나므로 제 경계를 바탕색으로 도려내 읽히게 한다.
  if (walk && walkAlpha > 0) {
    const walker: Body = {
      type: 'body',
      id: 'walker',
      pos: walk,
      shape: 'circle',
      size: WALKER_RADIUS,
      outline: 'background',
      glow: false,
      opacity: walkAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(walker);
  }

  // ---- '끌기' ----
  // 손잡이만으로는 만질 수 있다는 걸 모른다. 캡션 슬롯을 나눠 쓰지 않으려고
  // 글자를 손잡이 옆에 붙였다 — 조작 안내는 그림의 일부지 캡션의 몫이 아니다.
  if (hint > 0) {
    for (const [id, at] of [
      ['hint-a', aHead],
      ['hint-b', state.bTip],
    ] as const) {
      const note: Readout = {
        type: 'readout',
        id,
        anchor: { world: at, offset: HINT_OFFSET },
        text: text('label.drag'),
        chip: false,
        align: 'left',
        font: 'text',
        fontSize: HINT_FONT_PX,
        opacity: hint,
        style: { colorRole: 'muted', emphasis: 'subtle' },
      };
      out.push(note);
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 끄는 동안 카메라가 따라 흔들리면 독자가 바꾼 것이 무엇인지 흐려진다.
  return { ...SCENE_BOUNDS };
}
