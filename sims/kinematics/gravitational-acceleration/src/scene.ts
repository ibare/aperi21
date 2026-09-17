// ========================================================================
// gravitational-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 땅 · 기준선(trajectory) · 공 · 속도 0 점(body) · 속도 화살표와 변화량 화살표(vector)
// 가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  flightElapsed,
  heightAt,
  readConstants,
  sampleCount,
  sampleVelocity,
  shownSamples,
  velocityAt,
} from './physics';
import {
  ARROW_HEAD,
  ARROW_PER_MS,
  ARROW_WIDTH,
  BALL,
  BALL_ARROW_X,
  BALL_DELTA_X,
  DOT_R,
  FAINT_OPACITY,
  GROUND,
  HEIGHT_PER_M,
  ROW,
  ROW_DELTA_DX,
  SAMPLE_DT,
  SCENE_BOUNDS,
} from './schema';
import type { GravitationalAccelerationState } from './state';

/** 땅 선 · 기준선 굵기(화면 px) — 원본 2 · 1. */
const GROUND_WIDTH_PX = 2;
const BASELINE_WIDTH_PX = 1;
/**
 * 이 길이(월드 = 원본 px) 아래의 속도는 점으로 그린다. 원본은 1.5 였으나 vector
 * 어휘가 2px 아래를 그리지 않으므로 그 사이가 빈 화면이 되지 않게 2 로 맞춘다.
 */
const DOT_BELOW = 2;

/** 안내선 — 옅은 가로 선. */
function faintLine(id: string, from: Vec2, to: Vec2, width: number): Trajectory {
  return {
    type: 'trajectory',
    id,
    points: [from, to],
    width,
    opacity: FAINT_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 속도 0 을 뜻하는 먹색 점. */
function dot(id: string, pos: Vec2): Body {
  return {
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: DOT_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

/** 세로 화살표. 속도는 먹색, 0.2 초 동안의 변화량은 강조색 — 강조색은 이 뜻에만 쓴다. */
function arrow(id: string, from: Vec2, dy: number, kind: 'velocity' | 'change'): Vector {
  return {
    type: 'vector',
    id,
    from,
    delta: [0, dy],
    width: ARROW_WIDTH,
    headSize: ARROW_HEAD,
    style: { colorRole: kind === 'velocity' ? 'ink' : 'accent', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: GravitationalAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('gravitational-acceleration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const s = flightElapsed(tl);
  const landed = tl.phase === 'hold';
  /** 0.2 초 동안 더해지는 속도 변화의 화살표 길이 — 언제나 아래, 언제나 같다. */
  const change = -c.g * SAMPLE_DT * ARROW_PER_MS;
  const out: Primitive[] = [];

  // ---- 땅 ----
  out.push(faintLine('ground', [GROUND.from, GROUND.y], [GROUND.to, GROUND.y], GROUND_WIDTH_PX));

  // ---- 공 ----
  const ballY = GROUND.y + BALL.r + Math.max(0, heightAt(c, s)) * HEIGHT_PER_M;
  out.push({
    type: 'body',
    id: 'ball',
    pos: [BALL.x, ballY],
    shape: 'circle',
    size: BALL.r,
    glow: false,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 공 옆 속도와 다음 순간 더해질 변화 — 착지 뒤에는 지운다 ----
  if (!landed) {
    const v = velocityAt(c, s) * ARROW_PER_MS;
    const tipY = ballY + v;
    if (Math.abs(v) < DOT_BELOW) out.push(dot('ball-v', [BALL_ARROW_X, ballY]));
    else out.push(arrow('ball-v', [BALL_ARROW_X, ballY], v, 'velocity'));
    out.push(arrow('ball-dv', [BALL_DELTA_X, tipY], change, 'change'));
  }

  // ---- 속도 0 기준선 ----
  out.push(
    faintLine('baseline', [ROW.x0 - ROW.overhang, ROW.y], [ROW.x1 + ROW.overhang, ROW.y], BASELINE_WIDTH_PX),
  );

  // ---- 0.2 초마다 찍힌 속도 ----
  const n = sampleCount(c);
  const stepX = (ROW.x1 - ROW.x0) / n;
  const shown = shownSamples(c, s);
  for (let k = 0; k <= shown; k++) {
    const x = ROW.x0 + k * stepX;
    const vk = sampleVelocity(c, k);
    if (vk === 0) out.push(dot(`row-v-${k}`, [x, ROW.y]));
    else out.push(arrow(`row-v-${k}`, [x, ROW.y], vk * ARROW_PER_MS, 'velocity'));
  }

  // ---- 이웃한 두 끝 사이에 더해진 변화 — 모든 칸에서 같은 길이 ----
  for (let k = 1; k <= shown; k++) {
    const x = ROW.x0 + k * stepX + ROW_DELTA_DX;
    const from = ROW.y + sampleVelocity(c, k - 1) * ARROW_PER_MS;
    const to = ROW.y + sampleVelocity(c, k) * ARROW_PER_MS;
    out.push(arrow(`row-dv-${k}`, [x, from], to - from, 'change'));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 배율이 원본과 같아야 화살표 척도와 강조색 조각 길이가 같다.
  return { ...SCENE_BOUNDS };
}
