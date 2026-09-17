// ========================================================================
// spring-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 벽은 `body` rect + `trace` tick(빗금) + `trajectory`(벽 면),
// 원래 길이 선은 `trajectory` dashed + `readout`, 늘임 눈금은 `trajectory` + `trace` tick +
// `readout`, 용수철은 `constraint` spring, 물체는 `body` rect, 손잡이는 `trajectory` +
// `body` circle(속 빔) + `readout`, 되돌리는 힘과 자국은 `vector`. 캡션은 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// **원본 캔버스 1px 을 월드 1 로** 두고 y 만 위로 뒤집는다. 배치 상수를 그대로 옮긴다.
// ========================================================================

import type {
  Body,
  Constraint,
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
import { restoringForce } from './physics';
import { holdId, moveId, RETURN, STEPS, text } from './schema';
import type { SpringForceState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 860;
const H = 270;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 34;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

/** 벽 면. */
const WALL_X = 60;
/** 원래 길이일 때 물체 왼쪽 면. */
const NATURAL_X = 320;
/** 늘임 한 칸. */
const UNIT = 100;
const BLOCK_W = 50;
const BLOCK_H = 50;
/** 용수철 · 물체 중심 높이. */
const SPRING_Y = 95;
/** 지금 힘 화살표 높이. */
const LIVE_ARROW_Y = 42;
/** 남겨 둔 화살표 줄. */
const GHOST_Y0 = 182;
const GHOST_DY = 22;
/** 힘의 축척: 늘임 1칸의 힘 = 화살표 100px. 그래서 화살표 끝은 언제나 원래 길이 선에 닿는다. */
const FORCE_PX_PER_UNIT = UNIT;

/** 벽 판 — 벽 면 왼쪽 18px 폭, 중심에서 위아래 60. */
const WALL_T = 18;
const WALL_HALF = 60;
/** 빗금 — 판 안 첫 줄 · 간격 · 한 획의 가로(=세로) 폭. */
const HATCH_Y0 = SPRING_Y - 56;
const HATCH_DY = 12;
const HATCH_RUN = 12;
/** 원래 길이 점선의 위·아래 끝. */
const NATURAL_TOP = 20;
const NATURAL_BOTTOM = H - 8;
/** '원래 길이' 글자 — 선에서 왼쪽으로 띄운 거리와 기준선 높이. */
const NATURAL_LABEL_DX = 6;
const NATURAL_LABEL_Y = 30;
/** 눈금 줄 — 물체 아래끝에서 더 내린 거리, 눈금 반 길이, 숫자 기준선까지. */
const SCALE_DY = 14;
const TICK_HALF = 4;
const SCALE_LABEL_DY = 18;
/** 손잡이 — 줄 길이, 고리 중심까지, 고리 반지름, '당김' 기준선 높이. */
const HANDLE_LINE = 26;
const HANDLE_RING_DX = 34;
const HANDLE_RING_R = 8;
const HANDLE_LABEL_DY = 16;
/** '되돌리는 힘' 글자 — 물체 왼쪽 면에서, 기준선이 화살표보다 내려간 만큼. 이보다 짧으면 이름을 뺀다. */
const FORCE_LABEL_DX = 6;
const FORCE_LABEL_DY = 5;
const FORCE_LABEL_MIN = 40;
/** 자국은 멈춘 순간 이만큼(s) 떠오른다. */
const GHOST_RISE = 0.2;
/** 되돌아갈 때 자국은 되돌아감의 1/1.4 동안 사라진다. */
const GHOST_FADE_RATE = 1.4;
/** 자국의 진하기. */
const GHOST_OPACITY = 0.55;

/**
 * 원본 캔버스 글자는 기준선(alphabetic)에 놓였고 readout 은 가운데(middle)에 놓는다.
 * 13~14px 글자에서 기준선과 가운데의 거리.
 */
const BASELINE_TO_MIDDLE = 5;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 13;
const FORCE_FONT_PX = 14;
const W_THIN = 1;
const W_LINE = 2;
const W_LIVE = 4;
const W_GHOST = 3;
/** 원본 화살촉 최대 크기. */
const HEAD = 14;
/** 원본 용수철 감은 수 — 위·아래 한 벌이 코일 하나. */
const COILS = 14;

// ------------------------------------------------------------------------
// 색 — 강조색(accent)은 되돌리는 힘에만. 용수철은 secondary, 나머지는 회색·먹색.
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const MUTED = { colorRole: 'muted', emphasis: 'strong' } as const;
const SPRING = { colorRole: 'secondary', emphasis: 'strong' } as const;
const FORCE = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 벽 판 채움 — 원본의 옅은 회색. */
const WALL_FILL_OPACITY = 0.25;

function label(
  id: string,
  pos: Vec2,
  text_: Readout['text'],
  align: NonNullable<Readout['align']>,
  style: Readout['style'],
  fontSize = FONT_PX,
  vars?: Readout['vars'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    vars,
    chip: false,
    align,
    font: 'text',
    fontSize,
    style,
  };
}

function line(id: string, a: Vec2, b: Vec2, width: number, style: Trajectory['style']): Trajectory {
  return { type: 'trajectory', id, points: [a, b], width, style };
}

/** 왼쪽을 향한 힘 화살표 — 꼬리 x, 높이 y, 길이 len(원본 px). */
function arrowLeft(id: string, xTail: number, y: number, len: number, width: number, opacity: number): Vector {
  return {
    type: 'vector',
    id,
    from: at(xTail, y),
    delta: [-len, 0],
    width,
    headSize: HEAD,
    style: FORCE,
    opacity,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: SpringForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('spring-force: schema.timeline 이 선언되어야 한다');

  // 늘인 칸 수 — 당김 단계마다 한 칸씩 붙고, 되돌아감에서 네 칸이 함께 빠진다.
  let stretch = 0;
  for (let i = 1; i <= STEPS; i++) stretch += tl.at(moveId(i));
  stretch -= STEPS * tl.at('return');
  const blockX = NATURAL_X + stretch * UNIT; // 물체 왼쪽 면
  const out: Primitive[] = [];

  // ---- 벽 ----
  const wall: Body = {
    type: 'body',
    id: 'wall',
    shape: 'rect',
    pos: at(WALL_X - WALL_T / 2, SPRING_Y),
    size: [WALL_T, WALL_HALF * 2],
    outline: 'none',
    style: MUTED,
    opacity: WALL_FILL_OPACITY,
  };
  out.push(wall);
  const hatch: Trace['marks'][number][] = [];
  for (let y = HATCH_Y0; y < SPRING_Y + WALL_HALF; y += HATCH_DY) {
    // 원본 획: (WALL_X-18, y+10) → (WALL_X-6, y-2). 가운데와 방향으로 옮긴다.
    hatch.push({ pos: at(WALL_X - WALL_T + HATCH_RUN / 2, y + 10 - HATCH_RUN / 2) });
  }
  const hatchTrace: Trace = {
    type: 'trace',
    id: 'wall-hatch',
    marks: hatch,
    shape: 'tick',
    size: Math.hypot(HATCH_RUN, HATCH_RUN),
    direction: [1, 1],
    width: W_THIN,
    style: MUTED,
  };
  out.push(hatchTrace);
  out.push(line('wall-face', at(WALL_X, SPRING_Y - WALL_HALF), at(WALL_X, SPRING_Y + WALL_HALF), W_LINE, INK));

  // ---- 원래 길이 선 ----
  out.push(
    line('natural', at(NATURAL_X, NATURAL_TOP), at(NATURAL_X, NATURAL_BOTTOM), W_THIN, {
      ...MUTED,
      lineStyle: 'dashed',
    }),
  );
  out.push(
    label(
      'natural-label',
      at(NATURAL_X - NATURAL_LABEL_DX, NATURAL_LABEL_Y - BASELINE_TO_MIDDLE),
      text('label.natural'),
      'right',
      MUTED,
    ),
  );

  // ---- 늘임 눈금 ----
  const scaleY = SPRING_Y + BLOCK_H / 2 + SCALE_DY;
  out.push(line('scale-line', at(NATURAL_X, scaleY), at(NATURAL_X + STEPS * UNIT, scaleY), W_THIN, MUTED));
  const ticks: Trace['marks'][number][] = [];
  for (let i = 0; i <= STEPS; i++) ticks.push({ pos: at(NATURAL_X + i * UNIT, scaleY) });
  const tickTrace: Trace = {
    type: 'trace',
    id: 'scale-ticks',
    marks: ticks,
    shape: 'tick',
    size: TICK_HALF * 2,
    width: W_THIN,
    style: MUTED,
  };
  out.push(tickTrace);
  for (let i = 1; i <= STEPS; i++) {
    out.push(
      label(
        `scale-label-${i}`,
        at(NATURAL_X + i * UNIT, scaleY + SCALE_LABEL_DY - BASELINE_TO_MIDDLE),
        text('label.unit'),
        'center',
        MUTED,
        FONT_PX,
        { n: i },
      ),
    );
  }

  // ---- 용수철 ----
  const spring: Constraint = {
    type: 'constraint',
    id: 'spring',
    subtype: 'spring',
    from: at(WALL_X, SPRING_Y),
    to: at(blockX, SPRING_Y),
    coils: COILS,
    style: SPRING,
  };
  out.push(spring);

  // ---- 물체 ----
  const block: Body = {
    type: 'body',
    id: 'block',
    shape: 'rect',
    pos: at(blockX + BLOCK_W / 2, SPRING_Y),
    size: [BLOCK_W, BLOCK_H],
    outline: 'none',
    style: INK,
  };
  out.push(block);

  // ---- 손잡이 ----
  const handleX = blockX + BLOCK_W;
  out.push(line('handle-line', at(handleX, SPRING_Y), at(handleX + HANDLE_LINE, SPRING_Y), W_LINE, INK));
  const ring: Body = {
    type: 'body',
    id: 'handle-ring',
    shape: 'circle',
    pos: at(handleX + HANDLE_RING_DX, SPRING_Y),
    size: HANDLE_RING_R,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: INK,
  };
  out.push(ring);
  out.push(
    label(
      'handle-label',
      at(handleX + HANDLE_RING_DX, SPRING_Y - HANDLE_LABEL_DY - BASELINE_TO_MIDDLE),
      text('label.pull'),
      'center',
      MUTED,
    ),
  );

  // ---- 되돌리는 힘 ----
  const len = restoringForce(stretch) * FORCE_PX_PER_UNIT;
  out.push(arrowLeft('force', blockX, LIVE_ARROW_Y, len, W_LIVE, 1));
  if (len > FORCE_LABEL_MIN) {
    out.push(
      label(
        'force-label',
        at(blockX + FORCE_LABEL_DX, LIVE_ARROW_Y + FORCE_LABEL_DY - BASELINE_TO_MIDDLE),
        text('label.force'),
        'left',
        FORCE,
        FORCE_FONT_PX,
      ),
    );
  }

  // ---- 남겨 둔 힘 화살표 ----
  // 칸 i 에서 멈춘 순간부터 쉼 전까지 남는다. 멈춘 순간 0.2초 동안 떠오르고,
  // 되돌아갈 때 함께 흐려진다.
  if (tl.phase !== 'rest') {
    const fadeFrom = tl.start('return');
    const fading = 1 - tl.span(fadeFrom, fadeFrom + RETURN / GHOST_FADE_RATE);
    for (let i = 1; i <= STEPS; i++) {
      const from = tl.start(holdId(i));
      if (tl.u < from) break;
      const rise = tl.span(from, from + GHOST_RISE);
      const a = rise * fading * GHOST_OPACITY;
      out.push(
        arrowLeft(`ghost-${i}`, NATURAL_X + i * UNIT, GHOST_Y0 + (i - 1) * GHOST_DY, restoringForce(i) * FORCE_PX_PER_UNIT, W_GHOST, a),
      );
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(860 × 270)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
