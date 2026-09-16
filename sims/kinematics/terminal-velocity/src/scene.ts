// ========================================================================
// terminal-velocity — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더 계층을 쓰지 않는다. 자국 사다리(trace · tick) · 두 힘의 화살표
// (vector) · 떨어지는 물체(body) · 자국 주기 표시(readout) 가 모두 표준
// 어휘로 있고, 캡션은 선언의 슬롯(`schema.caption`)이 그린다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  Trace,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { dragLength } from './physics';
import {
  ARROW_GAP,
  BODY_R,
  GRAVITY_LEN,
  HEAD,
  LADDER,
  LADDER_OPACITY,
  SCENE_BOUNDS,
  STROBE,
  STROBE_NOTE,
  text,
} from './schema';
import type { TerminalVelocityState } from './state';

/** 화살표 획 굵기(화면 px). 원본 `lineWidth = 2.5`. */
const ARROW_WIDTH = 2.5;
/** 자국 가로대의 획 굵기(화면 px). 원본 `lineWidth = 1.5`. */
const LADDER_WIDTH = 1.5;
/** 자국 주기 표시의 글자 크기(화면 px). 원본 `11px`. */
const NOTE_FONT_PX = 11;
/** 자국 가로대가 뻗는 쪽(월드). 축을 가로지르는 가로선이다. */
const ACROSS: Vec2 = [1, 0];

/**
 * 자국 사다리 한쪽.
 *
 * 좌우를 두 인스턴스로 낸다 — 가운데를 비우기 위해서다. 화살표가 그 통로로
 * 지나가므로 자국과 화살표가 겹치지 않는다. 같은 종류를 둘 쓰려고 종류 이름을
 * 따로 만들지 않는다 (원칙 7).
 *
 * 자국에 `age` 를 주지 않는다 — 스트로보는 지나온 자리를 **지우지 않는다.**
 * 지우면 "위는 촘촘하고 아래는 일정하다" 가 한 화면에 남지 않는다.
 */
function ladder(id: string, x: number, marks: readonly number[]): Trace {
  return {
    type: 'trace',
    id,
    marks: marks.map((y) => ({ pos: [x, y] as Vec2 })),
    shape: 'tick',
    direction: ACROSS,
    size: LADDER.length,
    width: LADDER_WIDTH,
    // 물체와 같은 잉크로, 옅게. 지나간 자국은 지금 떨어지는 것과 같은 대상이다.
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: LADDER_OPACITY,
  };
}

export function scene(params: {
  state: TerminalVelocityState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];

  out.push(ladder('ladder-left', -LADDER.center, state.marks));
  out.push(ladder('ladder-right', LADDER.center, state.marks));

  // 간격을 속도로 읽으려면 시간 간격이 일정하다는 것을 알아야 한다. 이 한 줄이
  // 없으면 사다리는 그냥 무늬다 — 주장이 성립하는 조건이라 둔다.
  const note: Readout = {
    type: 'readout',
    id: 'strobe-note',
    anchor: { world: [STROBE_NOTE.x, STROBE_NOTE.y] },
    text: text('label.strobe'),
    vars: { dt: STROBE },
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: NOTE_FONT_PX,
    // 좁은 컨테이너에서 왼쪽 끝으로 밀려도 글자가 잘리지 않게 안으로 당긴다.
    // 이 줄은 **사라지면 안 되므로** `hideWhenClipped` 는 켜지 않는다.
    clamp: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(note);

  // ---- 두 힘. 같은 점에서 반대로, 같은 자로 재어 뻗는다 ----
  //
  // 딱지는 둘 다 화살표의 **오른쪽**에 붙는다. 아래로 가는 화살표에서는 `ccw`,
  // 위로 가는 화살표에서는 `cw` 가 그 쪽이다. 두 화살표는 방향이 뒤집히지 않으므로
  // 자리를 고정해도 남의 그림 위에 얹히지 않는다.
  const gravity: Vector = {
    type: 'vector',
    id: 'gravity',
    from: [0, state.y - BODY_R - ARROW_GAP],
    // 길이가 끝까지 변하지 않는다. mg 는 낙하 내내 일정하다.
    delta: [0, -GRAVITY_LEN],
    label: text('label.gravity'),
    labelSide: 'ccw',
    labelChip: true,
    headSize: HEAD,
    width: ARROW_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gravity);

  const drag: Vector = {
    type: 'vector',
    id: 'drag',
    from: [0, state.y + BODY_R + ARROW_GAP],
    delta: [0, dragLength(state)],
    label: text('label.drag'),
    labelSide: 'cw',
    labelChip: true,
    headSize: HEAD,
    width: ARROW_WIDTH,
    // 강조색은 오직 '공기 저항' 한 뜻에만 쓴다. 균형에 이른 순간에도 색을 바꾸지
    // 않는다 — 균형은 이미 도형(대칭)으로 보인다.
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(drag);

  const faller: Body = {
    type: 'body',
    id: 'faller',
    pos: [0, state.y],
    shape: 'circle',
    size: BODY_R,
    // 원본은 채운 원 하나였다. 테두리도 후광도 없다.
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(faller);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). 상태로 셋 중 하나가
  // 골라지고, 자리는 오른쪽 남는 가로다.

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 프레이밍이 곧 주장이다 — 낙하 전부가 한 화면에 남아야 한다.
  return { ...SCENE_BOUNDS };
}
