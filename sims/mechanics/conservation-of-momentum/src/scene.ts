// ========================================================================
// conservation-of-momentum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 레일 · 벽(`surface`) · 벽 뒤 빗금(`region`) · 범퍼
// (`constraint` spring) · 수레(`body`) · 힘과 운동량(`vector`) · 이어 붙인 자리와
// 0 의 자리(`trajectory`) · 이름(`readout`) 이 모두 표준 어휘로 있다.
//
// 색: 수레 · 벽 · 레일은 먹색(장치), 두 수레의 운동량 화살표는 같은 보조색(둘 다
// 「한 수레의 운동량」 이고 가르는 것은 줄 이름이다), 미는 힘은 무채색. 강조색은
// **합** 한 가지 뜻에만 쓴다.
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
import { derive, readConstants, type Reading } from './physics';
import {
  CART_A_H,
  CART_A_W,
  CART_B_H,
  CART_B_W,
  CHAIN_ORIGIN_X,
  CHAIN_SCALE,
  FORCE_SCALE,
  ROW_A_Y,
  ROW_B_Y,
  ROW_LABEL_X,
  ROW_TOTAL_Y,
  SCENE_BOUNDS,
  SPRING_Y,
  TRACK_END_X,
  WALL_H,
  WALL_T,
  text,
} from './schema';
import type { ConservationOfMomentumState } from './state';

/** 수레 이름을 수레 위로 띄우는 거리(화면 px). */
const CART_LABEL_OFFSET: Vec2 = [0, -12];
/** 「0」 을 0 의 선 위로 띄우는 거리(화면 px). */
const ZERO_LABEL_OFFSET: Vec2 = [0, -10];
/** 「처음 합」 을 표지 아래로 내리는 거리(화면 px). */
const START_LABEL_OFFSET: Vec2 = [0, 10];
/** 처음 합 표지가 합 줄 위아래로 뻗는 길이(월드). */
const START_MARK_HALF = 0.12;
/** 0 의 선 · 이어 붙인 선이 줄 밖으로 나가는 길이(월드). */
const GUIDE_OVERHANG = 0.1;
/** 힘 화살표가 이 길이(N)보다 작으면 두지 않는다 — 머리만 남은 점이 된다. */
const FORCE_MIN = 0.08;

export function scene(params: {
  state: ConservationOfMomentumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('conservation-of-momentum: schema.timeline 이 선언되어야 한다');
  const r: Reading = derive(timeline, readConstants(params.stage));
  const op = r.opacity;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const bar = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ---- 레일 · 벽 ----
  // 페이드에서 뺀다 — 주기가 바뀌는 순간 무대까지 깜빡이면 그것이 충돌만큼 눈에 띈다.
  g.push({
    type: 'surface',
    id: 'track',
    geometry: { kind: 'wall', from: [r.wallX - WALL_T, 0], to: [TRACK_END_X, 0] },
    material: 'solid',
  });
  g.push({
    type: 'region',
    id: 'wall-body',
    points: [
      [r.wallX - WALL_T, 0],
      [r.wallX, 0],
      [r.wallX, WALL_H],
      [r.wallX - WALL_T, WALL_H],
    ],
    fill: 'hatch',
    fillOpacity: 0.35,
    style: muted,
  });
  g.push({
    type: 'surface',
    id: 'wall',
    geometry: { kind: 'wall', from: [r.wallX, 0], to: [r.wallX, WALL_H] },
    material: 'solid',
  });

  // ---- 범퍼 용수철 ----
  const aLeft = r.xA - CART_A_W / 2;
  const aRight = r.xA + CART_A_W / 2;
  const bLeft = r.xB - CART_B_W / 2;
  g.push({
    type: 'constraint',
    id: 'bumper-wall',
    subtype: 'spring',
    from: [r.wallX, SPRING_Y],
    to: [r.wallX + r.bumperWall, SPRING_Y],
    coils: 4,
    style: ink,
  });
  g.push({
    type: 'constraint',
    id: 'bumper-b',
    subtype: 'spring',
    from: [bLeft - r.bumperB, SPRING_Y],
    to: [bLeft, SPRING_Y],
    coils: 5,
    opacity: op,
    style: ink,
  });

  // ---- 수레 ----
  // 속을 비운다 — 미는 힘을 수레 안에 긋는다. 채운 먹색 위의 화살표는 바탕 테두리를
  // 둘러도 흐리게 읽혔다.
  g.push({
    type: 'body',
    id: 'cart-a',
    pos: [r.xA, CART_A_H / 2],
    shape: 'rect',
    size: [CART_A_W, CART_A_H],
    fill: 'none',
    outline: 'role',
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'cart-b',
    pos: [r.xB, CART_B_H / 2],
    shape: 'rect',
    size: [CART_B_W, CART_B_H],
    fill: 'none',
    outline: 'role',
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'cart-a-name',
    anchor: { world: [r.xA, CART_A_H], offset: CART_LABEL_OFFSET },
    text: text('label.cartA'),
    chip: false,
    font: 'text',
    fontSize: 13,
    weight: 'bold',
    align: 'center',
    opacity: op,
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'cart-b-name',
    anchor: { world: [r.xB, CART_B_H], offset: CART_LABEL_OFFSET },
    text: text('label.cartB'),
    chip: false,
    font: 'text',
    fontSize: 13,
    weight: 'bold',
    align: 'center',
    opacity: op,
    style: ink,
  });

  // ---- 미는 힘 ----
  // 수레끼리는 크기가 같고 방향이 반대인 한 쌍, 벽은 A 에 하나. 둘 다 같은 무채색 —
  // 가르는 것은 쌍이냐 홀로냐이고, 그것이 곧 계 안이냐 밖이냐다.
  const forceY = SPRING_Y;
  if (r.pairForce > FORCE_MIN) {
    const len = r.pairForce * FORCE_SCALE;
    g.push({
      type: 'vector',
      id: 'force-on-a',
      from: [aRight, forceY],
      delta: [-len, 0],
      opacity: op,
      style: muted,
    });
    g.push({
      type: 'vector',
      id: 'force-on-b',
      from: [bLeft, forceY],
      delta: [len, 0],
      opacity: op,
      style: muted,
    });
  }
  if (r.wallForce > FORCE_MIN) {
    g.push({
      type: 'vector',
      id: 'force-wall',
      from: [aLeft, forceY],
      delta: [r.wallForce * FORCE_SCALE, 0],
      opacity: op,
      style: muted,
    });
  }

  // ---- 운동량 줄 ----
  // 위 두 줄은 수레마다 하나, 아래 줄은 그 둘을 이어 붙인 끝까지의 합.
  const x0 = CHAIN_ORIGIN_X;
  const aHead = x0 + r.pA * CHAIN_SCALE;
  const total = r.pA + r.pB;
  const tHead = x0 + total * CHAIN_SCALE;

  // 0 의 자리 — 세 줄이 같은 곳에서 잰다는 것.
  g.push({
    type: 'trajectory',
    id: 'zero-line',
    points: [
      [x0, ROW_TOTAL_Y - GUIDE_OVERHANG],
      [x0, ROW_A_Y + GUIDE_OVERHANG],
    ],
    width: 1,
    opacity: op * 0.8,
    style: muted,
  });
  g.push({
    type: 'readout',
    id: 'zero-name',
    anchor: { world: [x0, ROW_A_Y + GUIDE_OVERHANG], offset: ZERO_LABEL_OFFSET },
    text: text('label.zero'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'center',
    opacity: op,
    style: muted,
  });

  // 이어 붙인 자리 — A 끝에서 B 가 시작하고, B 끝이 곧 합의 끝이다.
  g.push({
    type: 'trajectory',
    id: 'join-ab',
    points: [
      [aHead, ROW_A_Y],
      [aHead, ROW_B_Y],
    ],
    width: 1,
    opacity: op * 0.8,
    style: { ...muted, lineStyle: 'dotted' },
  });
  g.push({
    type: 'trajectory',
    id: 'join-total',
    points: [
      [tHead, ROW_B_Y],
      [tHead, ROW_TOTAL_Y],
    ],
    width: 1,
    opacity: op * 0.8,
    style: { ...muted, lineStyle: 'dotted' },
  });

  g.push({
    type: 'vector',
    id: 'momentum-a',
    from: [x0, ROW_A_Y],
    delta: [r.pA * CHAIN_SCALE, 0],
    opacity: op,
    style: bar,
  });
  g.push({
    type: 'vector',
    id: 'momentum-b',
    from: [aHead, ROW_B_Y],
    delta: [r.pB * CHAIN_SCALE, 0],
    opacity: op,
    style: bar,
  });

  // 처음 합의 끝 — 주기 내내 세워 둔다. 수레끼리 미는 동안 합의 끝이 이 선을 떠나지
  // 않고, 벽이 미는 동안에만 떠난다. 잣대가 없으면 「움직이지 않는다」 를 눈대중한다.
  const startHead = x0 + r.total0 * CHAIN_SCALE;
  g.push({
    type: 'trajectory',
    id: 'start-total',
    points: [
      [startHead, ROW_TOTAL_Y - START_MARK_HALF],
      [startHead, ROW_TOTAL_Y + START_MARK_HALF],
    ],
    width: 1.5,
    opacity: op,
    style: { ...muted, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'start-total-name',
    anchor: { world: [startHead, ROW_TOTAL_Y - START_MARK_HALF], offset: START_LABEL_OFFSET },
    text: text('label.start'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'center',
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'vector',
    id: 'momentum-total',
    from: [x0, ROW_TOTAL_Y],
    delta: [total * CHAIN_SCALE, 0],
    opacity: op,
    style: accent,
  });

  // 줄 이름 — 왼쪽 한 줄로 세운다.
  const rows: readonly {
    id: string;
    key: 'label.cartA' | 'label.cartB' | 'label.total';
    y: number;
    total: boolean;
  }[] = [
    { id: 'row-a', key: 'label.cartA', y: ROW_A_Y, total: false },
    { id: 'row-b', key: 'label.cartB', y: ROW_B_Y, total: false },
    { id: 'row-total', key: 'label.total', y: ROW_TOTAL_Y, total: true },
  ];
  for (const row of rows) {
    g.push({
      type: 'readout',
      id: row.id,
      anchor: { world: [ROW_LABEL_X, row.y] },
      text: text(row.key),
      chip: false,
      font: 'text',
      fontSize: 13,
      weight: 'bold',
      align: 'right',
      opacity: op,
      style: row.total ? accent : ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
