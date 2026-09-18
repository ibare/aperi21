// ========================================================================
// reflection-of-waves — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 줄(trajectory) · 벽(surface wall,
// 결 있는 면) · 고리가 미끄러지는 막대(trajectory) · 고리 · 매듭(body) · 끝 이름표(readout)
// 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 두 줄은 같은 대상(같은 펄스를 실은 줄)이라 같은 먹색이다. 끝의
// 장치(벽 · 막대)는 배경 정보라 muted. **강조색은 쓰지 않는다** — 뒤집힘은 줄이 아래로
// 솟는 모양으로 보이고, 두 줄을 가르는 것은 끝의 생김새와 이름표다 (S-piece).
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
import { displacement, pulseCenter, readConstants, type EndKind, type ReflectionConstants } from './physics';
import {
  END_LABEL_GAP,
  FIXED_LANE_Y,
  FREE_LANE_Y,
  ROD_ABOVE,
  ROD_BELOW,
  SCENE_BOUNDS,
  WALL_HALF,
  text,
} from './schema';
import type { ReflectionOfWavesState } from './state';

/** 줄 표본 수 — 펄스 폭(0.42)에 표본이 열넷쯤 들어가 곡선이 각지지 않는다. */
const STRING_SAMPLES = 200;
/** 줄 굵기(화면 px). */
const STRING_WIDTH_PX = 2.5;
/** 고리가 미끄러지는 막대 굵기(화면 px). 안내선이라 가늘다. */
const ROD_WIDTH_PX = 2;
/** 고리 반지름(월드). 막대를 감싸는 작은 원. */
const RING_RADIUS = 0.1;
/** 끝 이름 글자 크기(화면 px). */
const END_NAME_PX = 15;
/** 끝 설명 글자 크기(화면 px). */
const END_NOTE_PX = 12;
/** 끝 이름을 줄 높이 위로 · 설명을 아래로 띄우는 거리(화면 px). */
const END_NAME_LIFT_PX = -10;
const END_NOTE_DROP_PX = 10;

/** 한 줄의 점들. x = 0 에서 끝 x = L 까지. */
function stringPoints(laneY: number, s: number, end: EndKind, c: ReflectionConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= STRING_SAMPLES; i++) {
    const x = (c.stringLength * i) / STRING_SAMPLES;
    pts.push([x, laneY + displacement(x, s, end, c)]);
  }
  return pts;
}

/** 끝 이름 · 설명 한 벌. 끝 오른쪽, 줄 높이에 선다. */
function endLabels(
  prefix: string,
  at: Vec2,
  name: ReturnType<typeof text>,
  note: ReturnType<typeof text>,
): Primitive[] {
  return [
    {
      type: 'readout',
      id: `${prefix}-name`,
      anchor: { world: at, offset: [0, END_NAME_LIFT_PX] },
      text: name,
      chip: false,
      font: 'text',
      fontSize: END_NAME_PX,
      weight: 'bold',
      align: 'left',
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: `${prefix}-note`,
      anchor: { world: at, offset: [0, END_NOTE_DROP_PX] },
      text: note,
      chip: false,
      font: 'text',
      fontSize: END_NOTE_PX,
      align: 'left',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: ReflectionOfWavesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('reflection-of-waves: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = pulseCenter(tl, c);
  const L = c.stringLength;
  const out: Primitive[] = [];

  // ---- 위 줄: 고정단 ----
  // 벽은 결 있는 면 — 결이 벽 바깥(오른쪽)에 서서 「단단히 박힌 것」 으로 읽힌다.
  out.push({
    type: 'surface',
    id: 'wall',
    geometry: { kind: 'wall', from: [L, FIXED_LANE_Y - WALL_HALF], to: [L, FIXED_LANE_Y + WALL_HALF] },
    material: 'rough',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'string-fixed',
    points: stringPoints(FIXED_LANE_Y, s, 'fixed', c),
    width: STRING_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  // 매듭 — 끝이 벽에 묶여 있다. 줄 끝 변위는 언제나 0 이라 자리가 움직이지 않는다.
  out.push({
    type: 'body',
    id: 'knot',
    pos: [L, FIXED_LANE_Y + displacement(L, s, 'fixed', c)],
    shape: 'point',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 아래 줄: 자유단 ----
  // 고리가 막대를 따라 위아래로 미끄러진다. 막대는 고리가 두 배 높이까지 오르는 자리를 덮는다.
  out.push({
    type: 'trajectory',
    id: 'rod',
    points: [
      [L, FREE_LANE_Y - ROD_BELOW],
      [L, FREE_LANE_Y + ROD_ABOVE],
    ],
    width: ROD_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const ringY = FREE_LANE_Y + displacement(L, s, 'free', c);
  out.push({
    type: 'trajectory',
    id: 'string-free',
    points: stringPoints(FREE_LANE_Y, s, 'free', c),
    width: STRING_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'ring',
    pos: [L, ringY],
    shape: 'circle',
    size: RING_RADIUS,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 끝 이름표 ----
  // 줄 높이(평형)에 고정 — 고리가 오르내려도 글자는 움직이지 않는다.
  out.push(
    ...endLabels('fixed-end', [L + END_LABEL_GAP, FIXED_LANE_Y], text('label.fixedEnd'), text('label.fixedEndNote')),
    ...endLabels('free-end', [L + END_LABEL_GAP, FREE_LANE_Y], text('label.freeEnd'), text('label.freeEndNote')),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
