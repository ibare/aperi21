// ========================================================================
// newtons-second-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 줄 이름은 `readout`, 선로는 `trajectory`, 매초 자리는
// `trace` tick, 수레는 `body` custom(둥근 사각) + `body` circle(바퀴), 미는 힘은
// `vector`, 속도 막대의 1초 칸은 `body` rect. 캡션은 선언의 캡션 슬롯이 그린다.
//
// ---- 월드 = 원본 캔버스 ----
// 원본은 880 × 270 캔버스 한 장에 줄 셋을 같은 출발선·같은 축척으로 놓았다.
// **원본 캔버스 1px 을 월드 1 로** 두고 y 만 위로 뒤집는다. 원본의 배치 상수를
// 한 글자도 바꾸지 않고 옮길 수 있다. 선 굵기 · 글자 크기는 화면 px 그대로다.
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
import { distance, fullSeconds, velocity } from './physics';
import { FORCES, RUN, text } from './schema';
import type { NewtonsSecondLawState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 index.html 의 상수 그대로
// ------------------------------------------------------------------------

/** 원본 캔버스(px). */
const W = 880;
const H = 270;
/** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리(원본 px). */
const CAPTION_ROOM = 34;

/** 원본 px(y 아래) → 월드(y 위). */
const at = (x: number, y: number): Vec2 => [x, H - y];

const LANE_TOP = 12;
const LANE_H = 84;
/** 수레 뒤끝의 출발 위치. */
const TRACK_X0 = 124;
/** 위치 축척: 3배 수레가 4초에 24 단위 → 696px. */
const PX_PER_M = 29;
const CART_W = 44;
const CART_H = 24;
const CART_R = 4;
/** 수레 밑면이 선로에서 뜬 높이. */
const CART_LIFT = 6;
const WHEEL_R = 4;
/** 바퀴 중심 — 수레 뒤끝·앞끝에서 들어온 거리, 선로에서 뜬 높이. */
const WHEEL_INSET = 10;
const WHEEL_LIFT = 4;
/** 힘 1 단위당 화살표 길이. */
const FORCE_PX = 18;
/** 화살표 끝과 수레 뒤끝 사이 틈. */
const FORCE_GAP = 3;
const BAR_X0 = TRACK_X0;
/** 속도 1 단위당 막대 길이. */
const PX_PER_V = 60;
/** 선로 기준선 — 줄 위끝에서. */
const TRACK_DY = 44;
/** 막대 위끝 — 줄 위끝에서. */
const BAR_DY = 55;
const BAR_H = 14;
/** 칸 경계 틈(원본의 흰 선 2px). */
const DIVIDER = 2;
/** 줄 이름 자리. */
const LABEL_X = 8;
const LABEL_FORCE_DY = 30;
const LABEL_VELOCITY_DY = 62;

// ------------------------------------------------------------------------
// 굵기 · 글자 — 원본 px
// ------------------------------------------------------------------------

const FONT_PX = 13;
const W_TRACK = 2;
const W_FORCE = 4;
const FORCE_HEAD = 9;
/** 매초 자리 눈금 — 선로를 가로지르는 길이(월드)와 굵기. */
const TICK_LEN = 14;
const W_TICK = 2;

// ------------------------------------------------------------------------
// 색 — 수레 한 색, 힘 한 색(강조), 속도 한 계열(채워지는 칸만 옅게)
// ------------------------------------------------------------------------
// 색이 뜻을 설명하지 않고 같은 대상을 묶기만 한다. 매초 자리는 수레가 지나간
// 자리라 수레와 같은 색을 옅게 쓴다.

const CART = { colorRole: 'ink', emphasis: 'strong' } as const;
const FORCE = { colorRole: 'accent', emphasis: 'strong' } as const;
const BAR = { colorRole: 'secondary', emphasis: 'strong' } as const;
const TRACK = { colorRole: 'muted', emphasis: 'subtle' } as const;
const LABEL = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 매초 자리의 진하기. */
const TICK_OPACITY = 0.45;
/** 채워지는 중인 칸의 진하기 — 원본의 옅은 파랑. */
const FILLING_OPACITY = 0.45;

/** 둥근 사각. pos(수레 가운데) 기준 월드, y 위. */
const CART_PATH = (() => {
  const w = CART_W / 2;
  const h = CART_H / 2;
  const r = CART_R;
  return [
    `M ${-w + r} ${-h}`,
    `L ${w - r} ${-h}`,
    `A ${r} ${r} 0 0 1 ${w} ${-h + r}`,
    `L ${w} ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `L ${-w + r} ${h}`,
    `A ${r} ${r} 0 0 1 ${-w} ${h - r}`,
    `L ${-w} ${-h + r}`,
    `A ${r} ${r} 0 0 1 ${-w + r} ${-h}`,
    'Z',
  ].join(' ');
})();

const laneY = (i: number): number => LANE_TOP + i * LANE_H;
/** 수레 뒤끝의 x(원본 px). */
const cartX = (force: number, tau: number): number => TRACK_X0 + distance(force, tau) * PX_PER_M;

function label(id: string, pos: Vec2, text_: Readout['text'], vars?: Readout['vars']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text_,
    vars,
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: FONT_PX,
    style: LABEL,
  };
}

/** 막대 칸 하나 — 원본 px 의 [x0, x1] 가로 구간. */
function cell(id: string, x0: number, x1: number, y: number, opacity: number): Body | null {
  const w = x1 - x0;
  if (w <= 0) return null;
  return {
    type: 'body',
    id,
    shape: 'rect',
    pos: at(x0 + w / 2, y + BAR_H / 2),
    size: [w, BAR_H],
    outline: 'none',
    style: BAR,
    opacity,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: NewtonsSecondLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('newtons-second-law: schema.timeline 이 선언되어야 한다');
  const tau = tl.at('push') * RUN; // 밀어 준 시간
  const pushing = tl.phase === 'push';
  const full = fullSeconds(tau);
  const out: Primitive[] = [];

  // ---- 줄 이름 ----
  FORCES.forEach((f, i) => {
    out.push(label(`name-force-${f}`, at(LABEL_X, laneY(i) + LABEL_FORCE_DY), text('label.force'), { f }));
    out.push(label(`name-velocity-${f}`, at(LABEL_X, laneY(i) + LABEL_VELOCITY_DY), text('label.velocity')));
  });

  // ---- 선로 ----
  FORCES.forEach((f, i) => {
    const yBase = laneY(i) + TRACK_DY + 0.5;
    const track: Trajectory = {
      type: 'trajectory',
      id: `track-${f}`,
      points: [at(TRACK_X0 - 4, yBase), at(W - 8, yBase)],
      width: W_TRACK,
      style: TRACK,
    };
    out.push(track);
  });

  // ---- 매초 자리 ----
  // 원본은 매초 수레 윤곽 네모를 남겼는데, 첫 1초 이동이 수레 길이보다 짧아 0초·1초
  // 네모가 겹쳤다. 수레 가운데 자리에 선로를 가로지르는 짧은 눈금으로 남긴다.
  // 간격이 벌어지는 것은 그대로 보인다 (NOTES.md (a)).
  FORCES.forEach((f, i) => {
    const yBase = laneY(i) + TRACK_DY;
    const marks: { pos: Vec2 }[] = [];
    for (let k = 0; k <= full; k++) marks.push({ pos: at(cartX(f, k) + CART_W / 2, yBase) });
    const trace: Trace = {
      type: 'trace',
      id: `seconds-${f}`,
      marks,
      shape: 'tick',
      size: TICK_LEN,
      width: W_TICK,
      style: CART,
      opacity: TICK_OPACITY,
    };
    out.push(trace);
  });

  // ---- 수레 ----
  FORCES.forEach((f, i) => {
    const yBase = laneY(i) + TRACK_DY;
    const x = cartX(f, tau);
    const cart: Body = {
      type: 'body',
      id: `cart-${f}`,
      shape: 'custom',
      pos: at(x + CART_W / 2, yBase - CART_LIFT - CART_H / 2),
      customPath: CART_PATH,
      style: CART,
    };
    out.push(cart);
    for (const [side, wx] of [
      ['rear', x + WHEEL_INSET],
      ['front', x + CART_W - WHEEL_INSET],
    ] as const) {
      const wheel: Body = {
        type: 'body',
        id: `wheel-${f}-${side}`,
        shape: 'circle',
        pos: at(wx, yBase - WHEEL_LIFT),
        size: WHEEL_R,
        glow: false,
        outline: 'none',
        style: CART,
      };
      out.push(wheel);
    }
  });

  // ---- 미는 힘 ----
  // 미는 동안만. 멈춘 화면에 힘이 남아 있으면 거짓말이다.
  if (pushing) {
    FORCES.forEach((f, i) => {
      const yMid = laneY(i) + TRACK_DY - CART_LIFT - CART_H / 2;
      const tip = cartX(f, tau) - FORCE_GAP;
      const arrow: Vector = {
        type: 'vector',
        id: `force-${f}`,
        from: at(tip - f * FORCE_PX, yMid),
        delta: [f * FORCE_PX, 0],
        width: W_FORCE,
        headSize: FORCE_HEAD,
        style: FORCE,
      };
      out.push(arrow);
    });
  }

  // ---- 속도 막대 ----
  // 칸 하나 = 1초 동안 붙은 속도 = 가속도. 다 찬 칸은 진하게, 채워지는 칸은 옅게.
  // 칸 경계는 원본의 흰 선 2px 자리를 비워 바탕이 보이게 한다.
  FORCES.forEach((f, i) => {
    const y = laneY(i) + BAR_DY;
    const unit = f * PX_PER_V; // 1초 칸의 길이
    const half = DIVIDER / 2;
    for (let k = 0; k < Math.min(full, RUN); k++) {
      const x0 = BAR_X0 + k * unit + (k > 0 ? half : 0);
      const x1 = BAR_X0 + (k + 1) * unit - half;
      const c = cell(`bar-${f}-${k}`, x0, x1, y, 1);
      if (c) out.push(c);
    }
    if (tau > full) {
      const x0 = BAR_X0 + full * unit + (full > 0 ? half : 0);
      const x1 = BAR_X0 + velocity(f, tau) * PX_PER_V;
      const c = cell(`bar-${f}-filling`, x0, x1, y, FILLING_OPACITY);
      if (c) out.push(c);
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계. 원본 캔버스 한 장(880 × 270)을 그대로 담고, 아래로 캡션 자리를 더 잡는다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { minX: 0, maxX: W, minY: -CAPTION_ROOM, maxY: H };
}
