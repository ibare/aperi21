// ========================================================================
// newtons-third-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 얼음판·팔다리(trajectory) · 몸과 처음 선 자리·작용점(body) · 힘(vector) ·
// 이름표(readout) 가 모두 표준 어휘로 있다.
// ========================================================================

import type {
  Body,
  Bounds,
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

import { displacement, forceShape, pushEndDisplacement, readAccel } from './physics';
import { text } from './schema';
import type { NewtonsThirdLawState } from './state';

// ------------------------------------------------------------------------
// 축척 — 원본 배치(820 × 250 캔버스)를 월드로 그대로 옮긴다
// ------------------------------------------------------------------------
//
// 원본 1px = 월드 1. 세로는 얼음판(원본 y 196)을 0 으로 잡고 위를 + 로 뒤집는다.

const REF = {
  width: 820,
  /** 얼음판의 원본 y. 월드 0. */
  iceY: 196,
  /** 가운데. */
  mid: 410,
  /** 얼음판 선이 캔버스 양끝에서 들어온 거리. */
  iceInset: 20,
  /** 처음 몸 중심과 가운데 사이 거리. */
  startHalf: 40,
  /** 힘 최대일 때 화살표 길이. */
  maxArrow: 78,
  /** 화살표 높이(얼음판 위). */
  arrowUp: 64,
  /** 이름표 기준선이 화살표 위로 뜬 거리(화면 px). */
  labelRise: 16,
} as const;

/** 세로 프레이밍(월드). 머리 꼭대기 125 위 여유, 아래는 삼각형 −12 와 캡션 자리. */
const FRAME = { above: 135, below: 45 } as const;

/** 긁힌 자국 — 원본 16개, x = 50 + 48i, 길이 14, 얼음판 아래 8. */
const SCRATCH = { count: 16, x0: 50, gap: 48, len: 14, down: 8 } as const;

/** 사람 한 명의 치수(얼음판 위, 몸 중심 기준). */
const PERSON = {
  hipUp: 40,
  footUp: 6,
  legTop: 3,
  legBottom: 10,
  bladeUp: 3,
  bladeHalf: 22,
  shoulderUp: 92,
  armFromX: 10,
  armFromDown: 4,
  armToDown: 12,
} as const;

/**
 * 몸통(둥근 사각 30 × 62, 모서리 10)과 머리(반지름 13). pos 기준 월드, y 위.
 * 원본 `roundRect(cx − 15, shoulderY − 6, 30, hipY − shoulderY + 10, 10)` · `arc(cx, headY, 13)`.
 */
const TORSO_AND_HEAD =
  'M -5 36 H 5 A 10 10 0 0 1 15 46 V 88 A 10 10 0 0 1 5 98 H -5 A 10 10 0 0 1 -15 88 V 46 A 10 10 0 0 1 -5 36 Z ' +
  'M 13 112 A 13 13 0 1 1 -13 112 A 13 13 0 1 1 13 112 Z';

/** 처음 선 자리 — 얼음판 아래 작은 삼각형. 원본 (x, +2) · (x ∓ 6, +12). */
const START_MARK = 'M 0 -2 L -6 -12 L 6 -12 Z';

/** 선 굵기(화면 px). 원본 값. 굵기는 위계라 배율을 따르지 않는다. */
const WIDTH = { ice: 1.5, scratch: 1, limb: 3, arm: 5, force: 4 } as const;
/** 화살촉 크기(월드). 원본 `min(14, len × 0.6)`. */
const ARROW_HEAD = 14;
/** 작용점 반지름(월드). */
const POINT_R = 4.5;
/** 손을 맞댄 동안 손끝이 가운데에서 떨어진 거리. */
const HAND_GAP = 2;
/** 거둔 팔의 손끝이 몸 중심에서 떨어진 거리. */
const ARM_REST = 22;
/** 나타날 때의 처음 불투명도. */
const APPEAR_FROM = 0.35;
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT = 14;

function line(id: string, points: readonly Vec2[], width: number, role: 'ink' | 'muted', opacity = 1): Trajectory {
  return {
    type: 'trajectory',
    id,
    points,
    width,
    opacity,
    style: { colorRole: role, emphasis: 'strong' },
  };
}

function person(id: string, cx: number, dir: 1 | -1, handX: number, opacity: number): Primitive[] {
  const P = PERSON;
  const shoulder = P.shoulderUp;
  const torso: Body = {
    type: 'body',
    id: `${id}-body`,
    pos: [cx, 0],
    shape: 'custom',
    customPath: TORSO_AND_HEAD,
    opacity,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  return [
    line(`${id}-leg-back`, [[cx - P.legTop, P.hipUp], [cx - P.legBottom, P.footUp]], WIDTH.limb, 'ink', opacity),
    line(`${id}-leg-front`, [[cx + P.legTop, P.hipUp], [cx + P.legBottom, P.footUp]], WIDTH.limb, 'ink', opacity),
    line(`${id}-blade`, [[cx - P.bladeHalf, P.bladeUp], [cx + P.bladeHalf, P.bladeUp]], WIDTH.limb, 'ink', opacity),
    torso,
    line(
      `${id}-arm`,
      [[cx + dir * P.armFromX, shoulder - P.armFromDown], [handX, shoulder - P.armToDown]],
      WIDTH.arm,
      'ink',
      opacity,
    ),
  ];
}

/**
 * 한 사람이 받는 힘 — 몸통 중심에서 바깥쪽으로. 작용점을 손끝이 아니라 몸 중심에
 * 둔다(원본 NOTES (c)): 손끝에 두면 두 꼬리가 가운데에 붙어 양쪽 화살표 하나로 읽힌다.
 */
function force(
  id: string,
  cx: number,
  dir: 1 | -1,
  len: number,
  f: number,
  label: 'label.forceOnLeft' | 'label.forceOnRight',
): Primitive[] {
  const y = REF.arrowUp;
  const arrow: Vector = {
    type: 'vector',
    id: `${id}-arrow`,
    from: [cx, y],
    delta: [dir * len, 0],
    width: WIDTH.force,
    headSize: Math.min(ARROW_HEAD, len * 0.6),
    // 먹색 몸 위를 지나므로 바탕색 테두리로 제 경계를 떼어 낸다.
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  const point: Body = {
    type: 'body',
    id: `${id}-point`,
    pos: [cx, y],
    shape: 'circle',
    size: POINT_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  // 이름표는 화살표 최대 길이 끝 바깥에 고정한다 — 두 사람이 붙어 있을 때 머리 위
  // 이름표가 서로 겹친다(원본 NOTES (c)).
  const name: Readout = {
    type: 'readout',
    id: `${id}-label`,
    anchor: {
      world: [cx + dir * REF.maxArrow, y],
      // 원본은 기준선을 16px 위에 두었다. readout 은 글의 가운데를 앵커에 맞추므로
      // 글자 반 높이(약 5px)를 더 올린다.
      offset: [0, -(REF.labelRise + 5)],
    },
    text: text(label),
    chip: false,
    font: 'text',
    weight: 'bold',
    fontSize: LABEL_FONT,
    align: dir < 0 ? 'right' : 'left',
    opacity: Math.min(1, f * 3),
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  return [arrow, point, name];
}

export function scene(params: {
  state: NewtonsThirdLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('newtons-third-law: schema.timeline 이 선언되어야 한다');
  const a = readAccel(stage);
  const pushDur = tl.duration('push');

  // ---- 시각 → 운동 ----
  const s = displacement(a, pushDur, tl.u - tl.start('push'));
  const f = forceShape(tl.at('push'));
  const contact = tl.u < tl.end('push');
  const opacity = (APPEAR_FROM + (1 - APPEAR_FROM) * tl.at('ready')) * (1 - tl.at('fade'));

  const leftX = REF.mid - REF.startHalf - s;
  const rightX = REF.mid + REF.startHalf + s;

  // 손끝: 닿아 있는 동안은 가운데에서 만나고, 떨어진 뒤에는 팔을 거둔다.
  let leftHand: number;
  let rightHand: number;
  if (contact) {
    leftHand = REF.mid - HAND_GAP;
    rightHand = REF.mid + HAND_GAP;
  } else {
    const k = 1 - tl.at('release');
    const reach0 = REF.startHalf + pushEndDisplacement(a, pushDur) - HAND_GAP;
    const reach = ARM_REST + (reach0 - ARM_REST) * k;
    leftHand = leftX + reach;
    rightHand = rightX - reach;
  }

  const out: Primitive[] = [];

  // ---- 얼음판 ----
  out.push(line('ice', [[REF.iceInset, 0], [REF.width - REF.iceInset, 0]], WIDTH.ice, 'muted'));
  // 움직임을 읽을 기준이 되는 고정된 긁힌 자국.
  for (let i = 0; i < SCRATCH.count; i++) {
    const x = SCRATCH.x0 + i * SCRATCH.gap;
    out.push(line(`scratch-${i}`, [[x, -SCRATCH.down], [x + SCRATCH.len, -SCRATCH.down]], WIDTH.scratch, 'muted'));
  }

  // ---- 처음 선 자리 ----
  // 멈춘 한 장에서도 "둘 다 제자리를 떠났다" 가 읽히도록.
  for (const [i, x] of [REF.mid - REF.startHalf, REF.mid + REF.startHalf].entries()) {
    out.push({
      type: 'body',
      id: `start-${i}`,
      pos: [x, 0],
      shape: 'custom',
      customPath: START_MARK,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 두 사람 ---- 같은 색·같은 모양의 거울상. 사람을 색으로 가르지 않는다.
  out.push(...person('left', leftX, 1, leftHand, opacity));
  out.push(...person('right', rightX, -1, rightHand, opacity));

  // ---- 두 힘 ---- 같은 함수로 길이를 정해 매 순간 길이가 같다.
  const len = f * REF.maxArrow;
  if (len >= 2) {
    out.push(...force('left-force', leftX, -1, len, f, 'label.forceOnLeft'));
    out.push(...force('right-force', rightX, 1, len, f, 'label.forceOnRight'));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계. 프레이밍은 주장의 일부라 매 프레임 같은 값이다.
 *
 * 가로는 원본 캔버스 폭 전체(얼음판 양끝과 멀어지는 두 사람). 세로는 원본의 위쪽
 * 빈 띠(원본 y 0~70)를 빼고 머리 꼭대기에서 긁힌 자국 아래까지만 잡는다 — 임베드는
 * 세로가 비싸 빈 띠까지 담으면 그림 전체가 작아진다. 캡션은 화면 고정 슬롯이라
 * 아래에 자리를 남긴다.
 */
export function boundsHint(): Bounds {
  return {
    minX: 0,
    maxX: REF.width,
    minY: -FRAME.below,
    maxY: FRAME.above,
  };
}
