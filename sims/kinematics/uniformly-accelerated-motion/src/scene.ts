// ========================================================================
// uniformly-accelerated-motion — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 선로(trajectory) · 찍힌 자리(trace tick) · 물체와 간격 막대(body) 가 모두 표준 어휘로 있다.
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

import { distance, gap, moveTime, readConstants, splitBar } from './physics';
import type { UniformlyAcceleratedMotionState } from './state';

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(840 × 262)를 월드로 그대로 옮긴다
// ------------------------------------------------------------------------
//
// 원본 1px = 월드 1. 월드는 y 가 위라 원본 y 에 부호를 뒤집는다.

const REF = {
  width: 840,
  height: 262,
  /** 출발점 = 사다리 왼쪽 끝. */
  x0: 40,
  /** 선로가 출발점 왼쪽으로 더 나가는 길이. */
  trackLead: 16,
  /** 선로 오른쪽 끝이 캔버스 끝에서 들어온 거리. */
  trackTail: 24,
  trackY: 50,
  /** 선로 아래에서 자라는 막대의 윗변. */
  segY: 70,
  /** 사다리 첫 줄의 윗변. */
  ladderY0: 100,
  /** 사다리 줄 간격. */
  row: 20,
  /** 막대 두께. */
  barH: 12,
  /** 찍힌 자리가 선로 위아래로 뻗는 길이. */
  tickHalf: 9,
  /** 물체 반지름. */
  ballR: 8,
} as const;

/**
 * 러너가 경계 둘레에 두르는 여백(화면 px) — 맞춤 패딩 12 + 기본 여백 24.
 * 경계를 그만큼 안으로 잡아 원본 폭(840)에서 배율 1 을 만든다. 선로 머리(x 24)와
 * 캡션 줄은 이 경계 밖이지만 캔버스 안이라 그대로 보인다.
 */
const FIT_INSET = 36;

/** 선로 굵기(화면 px). 원본 그대로. */
const TRACK_WIDTH_PX = 2;
/** 찍힌 자리 획 굵기(화면 px). 원본 그대로. */
const TICK_WIDTH_PX = 1.5;
/** 찍힌 자리가 보는 쪽 — 선로를 가로지르는 세로 눈금. */
const TICK_DIRECTION: Vec2 = [0, 1];

/** 원본 y(아래로 +) → 월드 y. */
function wy(y: number): number {
  return -y;
}

/** 원본의 왼쪽 위 모서리 사각형을 중심 기준 막대로 낸다. */
function bar(id: string, x: number, y: number, len: number, extra: boolean, opacity: number): Body {
  return {
    type: 'body',
    id,
    shape: 'rect',
    pos: [x + len / 2, wy(y + REF.barH / 2)],
    size: [len, REF.barH],
    fill: 'solid',
    // 원본은 채우기만 한다. 윤곽이 붙으면 몸통과 늘어난 몫 사이에 금이 가 계단이 끊긴다.
    outline: 'none',
    // 강조색은 '앞 간격보다 늘어난 몫' 하나에만 쓴다. 몸통은 같은 대상(간격)이라 한 색.
    style: extra
      ? { colorRole: 'accent', emphasis: 'strong' }
      : { colorRole: 'muted', emphasis: 'medium' },
    opacity,
  };
}

export function scene(params: {
  state: UniformlyAcceleratedMotionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('uniformly-accelerated-motion: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const u = tl.u;
  const move = moveTime(c);
  const s = Math.min(u, move);
  const pos = (time: number): number => REF.x0 + distance(c, time);
  /** 바퀴 끝에서만 흐려진다. 선로와 캡션은 흐려지지 않는다 (원본 그대로). */
  const alpha = 1 - tl.at('fade');

  const out: Primitive[] = [];

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`).

  // ---- 선로 ----
  const track: Trajectory = {
    type: 'trajectory',
    id: 'track',
    points: [
      [REF.x0 - REF.trackLead, wy(REF.trackY)],
      [REF.width - REF.trackTail, wy(REF.trackY)],
    ],
    width: TRACK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(track);

  // ---- 간격 막대 ----
  // 몸통과 늘어난 몫을 인스턴스 둘로 가른다 — 색이 인스턴스 단위라서.
  const bars: { id: string; x: number; y: number; len: number; prev: number | null }[] = [];

  // 1) 선로 아래에서 자라는 간격 — 지금 달리는 구간.
  if (u < move) {
    const k = Math.floor(s / c.interval);
    const start = pos(k * c.interval);
    bars.push({
      id: `gap-${k + 1}`,
      x: start,
      y: REF.segY,
      len: pos(s) - start,
      prev: k >= 1 ? gap(c, k) : null,
    });
  }

  // 2) 다 벌어진 간격 — 사다리로 내려가는 중이거나 이미 내려가 쌓인 것.
  //    n 번째 간격은 n·간격 초에 떠나 `drop` 초에 걸쳐 제 줄로 내려간다 (시차 출발).
  for (let n = 1; n <= c.count; n++) {
    const leave = n * c.interval;
    if (u < leave) break;
    const p = tl.span(leave, leave + c.drop, 'smooth');
    const fromX = pos((n - 1) * c.interval);
    const toY = REF.ladderY0 + (n - 1) * REF.row;
    bars.push({
      id: `gap-${n}`,
      x: fromX + (REF.x0 - fromX) * p,
      y: REF.segY + (toY - REF.segY) * p,
      len: gap(c, n),
      prev: n >= 2 ? gap(c, n - 1) : null,
    });
  }

  for (const b of bars) {
    const part = splitBar(b.len, b.prev);
    if (part.body > 0) out.push(bar(`${b.id}-body`, b.x, b.y, part.body, false, alpha));
  }
  for (const b of bars) {
    const part = splitBar(b.len, b.prev);
    if (part.extra > 0) out.push(bar(`${b.id}-extra`, b.x + part.body, b.y, part.extra, true, alpha));
  }

  // ---- 찍힌 자리 ----
  // 늙지 않는다. 지나온 자리를 지우면 간격이 벌어진다는 증거가 사라진다.
  const marks: { pos: Vec2 }[] = [];
  for (let k = 0; k <= c.count; k++) {
    if (k * c.interval > u) break;
    marks.push({ pos: [pos(k * c.interval), wy(REF.trackY)] });
  }
  const stamps: Trace = {
    type: 'trace',
    id: 'stamps',
    marks,
    shape: 'tick',
    direction: TICK_DIRECTION,
    size: REF.tickHalf * 2,
    width: TICK_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: alpha,
  };
  out.push(stamps);

  // ---- 물체 ----
  const ball: Body = {
    type: 'body',
    id: 'object',
    shape: 'circle',
    pos: [pos(s), wy(REF.trackY)],
    size: REF.ballR,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
    opacity: alpha,
  };
  out.push(ball);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/**
 * 고정 경계 — 원본 캔버스 전체를 러너 여백만큼 안으로 잡은 것. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece).
 */
export function boundsHint(): Bounds {
  return {
    minX: FIT_INSET,
    maxX: REF.width - FIT_INSET,
    minY: wy(REF.height - FIT_INSET),
    maxY: wy(FIT_INSET),
  };
}
