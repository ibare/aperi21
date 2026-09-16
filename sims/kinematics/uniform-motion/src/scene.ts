// ========================================================================
// uniform-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 바닥선(trajectory) · 가는 것과 걸음 막대(body) · 자국과 반원 파동(trace) 이
// 모두 표준 어휘로 있다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';

import { barFade, barProgress, lerp, markAge, markPulse, readLap } from './physics';
import { MARK_LIFE, STEPS } from './schema';
import type { UniformMotionState } from './state';

// ------------------------------------------------------------------------
// 축척 — 원본 배치(880 × 214 캔버스)를 월드로 그대로 옮긴다
// ------------------------------------------------------------------------
//
// 원본 1px = 월드 1. 원본의 세로는 px 고정이고 가로만 폭에 비례했는데, 월드로
// 옮기면 배율 하나가 두 축에 함께 걸려 **좁은 컨테이너에서도 그림이 같은 비율로**
// 줄어든다. 원본 NOTES (d) 4 가 바라던 것이 이것이다.
//
// 세로는 바닥선을 0 으로 잡고 위를 +로 뒤집는다 (월드는 y 가 위).

/** 원본의 배치 상수(px). 기준 폭 880 의 캔버스에서 그대로 읽었다. */
const REF = {
  /** 원본 컨테이너 최대 폭. */
  width: 880,
  /** 트랙 양옆 여백. 물체의 출발점이자 쌓인 막대의 왼쪽 끝. */
  pad: 30,
  /** 바닥선이 여백 바깥으로 더 나가는 길이. */
  overhang: 12,
  /** 바닥선의 원본 y. 여기를 월드 0 으로 둔다. */
  groundY: 86,
  /** 물체 중심이 바닥선 위로 뜬 높이. */
  ballLift: 13,
  /** 물체 반지름. */
  ballR: 12,
  /** 자국이 바닥선 위로 뻗는 길이. */
  tickUp: 3,
  /** 자국이 바닥선 아래로 뻗는 길이. */
  tickDown: 13,
  /** 방금 찍힌 자국이 아래로 더 뻗는 길이. */
  tickPulse: 8,
  /** 반원 파동의 처음 반지름. */
  rippleR0: 8,
  /** 파동이 수명 동안 더 자라는 길이. */
  rippleGrow: 26,
  /** 막대가 떨어져 나오는 자리 — 바닥선 아래 이만큼. */
  dropY: 20,
  /** 쌓인 막대 첫 줄의 원본 y. */
  rowTop: 128,
  /** 줄 사이 간격. */
  rowH: 13,
  /** 막대 두께. */
  barH: 8,
} as const;

/** 트랙 폭. 물체는 빠르기 1.00 일 때 6초에 이만큼 간다. */
const SPAN = REF.width - REF.pad * 2;
/** 트랙 왼쪽 끝 = 첫 자국의 자리 = 쌓인 막대의 왼쪽 끝. */
const X0 = REF.pad;
/** 첫 줄이 바닥선 아래로 내려간 깊이. */
const ROW_TOP = REF.rowTop - REF.groundY;

/** 바닥선 아래로만 퍼지는 반원 — 월드 x 축에서 반시계로 −π..0 이 아래쪽 반이다. */
const RIPPLE_ARC: readonly [number, number] = [-Math.PI, 0];
/** 자국이 보는 쪽. 바닥선을 가로지르는 세로 눈금이다. */
const TICK_DIRECTION: Vec2 = [0, 1];

/**
 * 자국의 획 굵기(화면 px). 축의 굵기 어휘(1.5 / 2 / 3)에 없는 값이라 이 조각
 * 고유의 치수로 둔다 — 자국은 물체의 자취라 안내선보다 굵고 물체보다 가늘다.
 */
const TICK_WIDTH_PX = 2.5;
/** 바닥선의 굵기(화면 px). 재라는 선이 아니라 견줄 바닥이라 가늘다. */
const GROUND_WIDTH_PX = 1.5;
/** 반원 파동의 옅기. 자국보다 한 겹 뒤에 있는 여파다. */
const RIPPLE_OPACITY = 0.75;
/** 캡션 한 줄이 그림 아래에 차지하는 자리(월드). */
const CAPTION_ROOM = 34;

/** 걸음 막대 k 줄의 윗변(월드 y). */
function rowY(k: number): number {
  return -(ROW_TOP + k * REF.rowH);
}

/** 빠르기에서 나오는 속력(월드/초). 트랙 폭에 비례하므로 폭이 바뀌어도 랩이 깨지지 않는다. */
function speedToV(speed: number): number {
  return (SPAN / STEPS) * speed;
}

export function scene(params: {
  state: UniformMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const lap = readLap(state);
  const v = speedToV(state.speed);
  const out: Primitive[] = [];

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`).

  // ---- 바닥 ----
  // 물체가 지나가는 길. 눈금도 격자도 없는 선 하나 — 위치를 견주는 바닥면이다.
  const ground: Trajectory = {
    type: 'trajectory',
    id: 'ground',
    points: [
      [X0 - REF.overhang, 0],
      [REF.width - X0 + REF.overhang, 0],
    ],
    width: GROUND_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
    opacity: lap.alpha,
  };
  out.push(ground);

  // ---- 걸음 막대 ----
  // 구간 k 는 자국 k 와 k+1 사이. 자국 k+1 이 찍히는 순간 그 구간 자리 바로 아래에서
  // 떨어져 나와 제 줄로 내려가 왼쪽 끝을 맞춰 쌓인다.
  //
  // **폭은 도중에 변하지 않는다.** 이 조각의 주장 자체가 "길이가 보존된 채 옮겨진다"
  // 라서, 위치만 보간하고 크기는 상수 `v` 로 둔다. 전이가 폭을 건드리면 그림이
  // 거짓말을 한다.
  for (let k = 0; k < STEPS; k++) {
    if (lap.lapT < k + 1) break;
    const p = barProgress(lap.lapT, k);
    const x = lerp(X0 + v * k, X0, p);
    const y = lerp(-REF.dropY, rowY(k), p);
    const bar: Body = {
      type: 'body',
      id: `bar-${k}`,
      shape: 'rect',
      // 원본은 왼쪽 위 모서리로 놓았고 어휘는 중심으로 놓는다.
      pos: [x + v / 2, y - REF.barH / 2],
      size: [v, REF.barH],
      // 원본은 채우기만 한다. 기본값(채움 + 윤곽)이면 막대마다 테두리가 붙어
      // 여섯 개가 한 덩어리로 읽히지 않는다.
      fill: 'solid',
      outline: 'none',
      // 물체·자국과 같은 색이되 한 단계 옅다. 서로 다른 무엇이 아니라 같은 한
      // 물체가 남긴 것이고, 옅기는 "떨어져 나온 흔적" 이라는 층위 표시다.
      style: { colorRole: 'primary', emphasis: 'medium' },
      opacity: lap.alpha * barFade(p),
    };
    out.push(bar);
  }

  // ---- 자국 ----
  // 바닥선 **아래로만** 뻗는다. 위로도 뻗게 하면 물체가 그 위를 지나며 방금 찍힌
  // 자국의 반짝임을 가린다 — 박자가 일어나는 바로 그 순간이 가려지면 안 된다.
  //
  // 인스턴스를 둘로 나눈다. 색은 인스턴스 단위이고, 방금 찍힌 자국 하나만 강조색이다.
  const plain: { pos: Vec2 }[] = [];
  let fresh: { k: number; pulse: number } | null = null;
  for (let k = 0; k <= lap.lastMark; k++) {
    const pulse = markPulse(lap.lapT, k);
    if (pulse > 0) fresh = { k, pulse };
    else plain.push({ pos: [X0 + v * k, tickCenterY(0)] });
  }

  if (plain.length > 0) {
    const ticks: Trace = {
      type: 'trace',
      id: 'marks',
      marks: plain,
      shape: 'tick',
      direction: TICK_DIRECTION,
      // 자국은 늙지 않는다. 지나온 자리를 지우면 간격이 같다는 증거가 사라진다.
      size: tickLength(0),
      width: TICK_WIDTH_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
      opacity: lap.alpha,
    };
    out.push(ticks);
  }

  if (fresh) {
    const x = X0 + v * fresh.k;
    // 방금 찍힌 자국 — 강조색으로 더 길어진다. 강조색은 한 가지 뜻에만 쓴다:
    // "바로 지금 한 걸음이 찍혔다".
    const hot: Trace = {
      type: 'trace',
      id: 'mark-fresh',
      marks: [{ pos: [x, tickCenterY(fresh.pulse)] }],
      shape: 'tick',
      direction: TICK_DIRECTION,
      size: tickLength(fresh.pulse),
      width: TICK_WIDTH_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: lap.alpha,
    };
    out.push(hot);

    // 바닥 아래로 한 번 퍼지는 반원 파동. 온전한 원으로 그리면 바닥 위로도 퍼져
    // 물체가 지나는 층을 침범한다.
    const ripple: Trace = {
      type: 'trace',
      id: 'mark-ripple',
      marks: [{ pos: [x, 0], age: markAge(lap.lapT, fresh.k) }],
      shape: 'ring',
      arc: RIPPLE_ARC,
      size: REF.rippleR0,
      spreadTo: REF.rippleR0 + REF.rippleGrow,
      life: MARK_LIFE,
      style: { colorRole: 'accent', emphasis: 'strong' },
      opacity: lap.alpha * RIPPLE_OPACITY,
    };
    out.push(ripple);
  }

  // ---- 가는 것 ----
  // 후광 없는 짙은 공. 등속으로 움직이는 물체의 현재 위치다.
  const ball: Body = {
    type: 'body',
    id: 'mover',
    shape: 'circle',
    pos: [X0 + v * lap.walked, REF.ballLift],
    size: REF.ballR,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: { colorRole: 'primary', emphasis: 'strong' },
    opacity: lap.alpha,
  };
  out.push(ball);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 자국 하나의 길이(화면 px). 방금 찍힌 자국은 `tickPulse` 만큼 더 길다.
 *
 * `tick` 은 자리를 중심으로 양쪽으로 뻗으므로, 길이와 중심을 함께 옮겨
 * 원본의 «바닥선 위 3, 아래 13(+8)» 을 만든다.
 */
function tickLength(pulse: number): number {
  return REF.tickUp + REF.tickDown + REF.tickPulse * pulse;
}

function tickCenterY(pulse: number): number {
  return (REF.tickUp - (REF.tickDown + REF.tickPulse * pulse)) / 2;
}

/**
 * 고정 경계. 프레이밍은 주장의 일부라 매 프레임 같은 값이다 (S-piece).
 *
 * 가로는 바닥선 끝에서 끝까지, 세로는 물체 꼭대기에서 여섯째 줄 아래까지다.
 * 빠르기를 낮춰 물체가 덜 가도 프레임은 흔들리지 않는다 — 트랙이 줄어드는 것이
 * 아니라 걸음이 좁아지는 것이어야 한다.
 */
export function boundsHint(): Bounds {
  return {
    minX: X0 - REF.overhang,
    maxX: REF.width - X0 + REF.overhang,
    minY: rowY(STEPS - 1) - REF.barH - CAPTION_ROOM,
    maxY: REF.ballLift + REF.ballR,
  };
}
