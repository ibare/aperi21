// ========================================================================
// connected-bodies — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 바닥 · 끈은 `trajectory`, 같은 시각 눈금은 `trace` tick,
// 물체는 `body` rect, 질량 글자와 힘 글자는 `readout`, 당기는 힘은 `vector`.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본은 840 × 236 캔버스 한 장에 세 줄을 같은 x 척도로 쌓았다. **원본 캔버스 1px 을
// 월드 1 로** 두고 y 만 위로 뒤집는다. 원본의 배치 상수를 그대로 옮길 수 있다.
// 선 굵기 · 글자 크기는 화면 px 그대로다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { acceleration, distance, strobeCount } from './physics';
import { FORCE, LANES, RUN, STROBE, text } from './schema';
import type { ConnectedBodiesState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 840;
const H = 236;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 34;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

const PX_PER_KG = 40;
const BLOCK_H = 34;
const ROPE_GAP = 34;
const LANE_TOP = 18;
const LANE_STEP = 72;
/** 가장 긴 줄(두 물체 + 끈)의 길이. */
const LONGEST = 3 * PX_PER_KG + ROPE_GAP;
/** 맨 앞면의 출발 x. */
const FRONT_START = 24 + LONGEST;
/** 한 번 달린 뒤 맨 앞면의 x — 오른쪽에 힘 화살표와 글자 자리를 남긴다. */
const FRONT_END = W - 96;
/** 바닥선 좌우 끝의 여백. */
const FLOOR_INSET = 16;
/** 힘 1 N 당 화살표 길이. */
const PX_PER_N = 10;
/** 눈금 — 바닥선 아래 4px 에서 14px 까지. */
const TICK_TOP = 4;
const TICK_BOTTOM = 14;
/** 힘 글자의 기준선 — 화살표 위로. */
const FORCE_LABEL_RISE = 9;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 13;
/** 원본의 기준선(alphabetic) 글자를 가운데 정렬(readout)로 옮길 때 올리는 양 — 글자 크기 반. */
const BASELINE_TO_MIDDLE = FONT_PX / 2;
const W_FLOOR = 1.5;
const W_TICK = 1.5;
const W_ROPE = 2;
const W_FORCE = 3;
const FORCE_HEAD = 9;

// ------------------------------------------------------------------------
// 색 — 물체 한 색, 강조색은 바깥에서 당기는 힘 하나에만
// ------------------------------------------------------------------------

const FLOOR = { colorRole: 'muted', emphasis: 'subtle' } as const;
const TICK = { colorRole: 'muted', emphasis: 'medium' } as const;
const ROPE = { colorRole: 'ink', emphasis: 'strong' } as const;
const BLOCK = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 물체 위 질량 글자 — 원본은 흰 글자였다. 바탕색 글자 역할이 없어 먹색 (NOTES (b) 1). */
const BLOCK_INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const PULL = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 운동 → 화면
// ------------------------------------------------------------------------

/** 세 줄의 가속도. 줄마다 계산하지만 합이 같아 모두 같다 — 그것이 주장이다. */
const ACC = LANES.map((masses) => acceleration(FORCE, masses));
/** 한 번 달린 거리(m)가 [FRONT_START, FRONT_END] 를 채우도록 하는 척도. 기준은 첫 줄. */
const PX_PER_M = (FRONT_END - FRONT_START) / distance(ACC[0] ?? 0, RUN);

/** 줄 i 의 맨 앞면 x(원본 px). */
const frontX = (i: number, tau: number): number => FRONT_START + distance(ACC[i] ?? 0, tau) * PX_PER_M;
/** 줄 i 의 바닥선 y(원본 px, 아래로). */
const floorY = (i: number): number => LANE_TOP + i * LANE_STEP + BLOCK_H;

function label(id: string, pos: Vec2, text_: Readout['text'], vars: Readout['vars'], style: Readout['style']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    vars,
    chip: false,
    align: 'center',
    font: 'text',
    weight: 'bold',
    fontSize: FONT_PX,
    style,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: ConnectedBodiesState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('connected-bodies: schema.timeline 이 선언되어야 한다');
  const tau = tl.at('run') * tl.duration('run'); // 달린 시간
  const out: Primitive[] = [];

  // ---- 바닥 ----
  LANES.forEach((_, i) => {
    const y = floorY(i) + W_FLOOR / 2;
    const floor: Trajectory = {
      type: 'trajectory',
      id: `floor-${i}`,
      points: [at(FLOOR_INSET, y), at(W - FLOOR_INSET, y)],
      width: W_FLOOR,
      style: FLOOR,
    };
    out.push(floor);
  });

  // ---- 같은 시각 눈금 ----
  // 0.5 초마다 앞면이 있던 자리. 세 줄의 눈금이 세로로 겹쳐 선다.
  const count = strobeCount(tau, STROBE);
  LANES.forEach((_, i) => {
    const y = floorY(i) + (TICK_TOP + TICK_BOTTOM) / 2;
    const marks: { pos: Vec2 }[] = [];
    for (let k = 0; k <= count; k++) marks.push({ pos: at(frontX(i, k * STROBE), y) });
    const trace: Trace = {
      type: 'trace',
      id: `strobe-${i}`,
      marks,
      shape: 'tick',
      size: TICK_BOTTOM - TICK_TOP,
      width: W_TICK,
      style: TICK,
    };
    out.push(trace);
  });

  // ---- 끈 ----
  LANES.forEach((masses, i) => {
    const front = masses[0];
    if (masses.length < 2 || front === undefined) return;
    const y = floorY(i) - BLOCK_H / 2;
    const frontBack = frontX(i, tau) - front * PX_PER_KG;
    const rope: Trajectory = {
      type: 'trajectory',
      id: `rope-${i}`,
      points: [at(frontBack - ROPE_GAP, y), at(frontBack, y)],
      width: W_ROPE,
      style: ROPE,
    };
    out.push(rope);
  });

  // ---- 물체 ----
  LANES.forEach((masses, i) => {
    const yMid = floorY(i) - BLOCK_H / 2;
    let right = frontX(i, tau);
    masses.forEach((m, j) => {
      const w = m * PX_PER_KG;
      const cx = right - w / 2;
      const block: Body = {
        type: 'body',
        id: `block-${i}-${j}`,
        shape: 'rect',
        pos: at(cx, yMid),
        size: [w, BLOCK_H],
        outline: 'none',
        style: BLOCK,
      };
      out.push(block);
      out.push(label(`mass-${i}-${j}`, at(cx, yMid), text('label.mass'), { m }, BLOCK_INK));
      right -= w + ROPE_GAP;
    });
  });

  // ---- 당기는 힘 ----
  LANES.forEach((_, i) => {
    const y = floorY(i) - BLOCK_H / 2;
    const fx = frontX(i, tau);
    const len = FORCE * PX_PER_N;
    const arrow: Vector = {
      type: 'vector',
      id: `pull-${i}`,
      from: at(fx, y),
      delta: [len, 0],
      width: W_FORCE,
      headSize: FORCE_HEAD,
      style: PULL,
    };
    out.push(arrow);
    out.push(
      label(
        `pull-label-${i}`,
        at(fx + len / 2, y - FORCE_LABEL_RISE - BASELINE_TO_MIDDLE),
        text('label.force'),
        { f: FORCE },
        PULL,
      ),
    );
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(840 × 236)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
