// ========================================================================
// rolling-without-slipping — 순수 물리
// ========================================================================
// 바퀴 중심은 빠르기 v 로 곧게 나아가고, 바퀴는 각속도 ω 로 시계 방향으로 돈다.
// 테 위 한 점의 속도 = 중심의 v + 축을 도는 ωR (테에 접한 방향). 수직 지름 위에서는
// 셋 다 가로라서 꼭대기 v + ωR, 중심 v, 바닥에 닿은 점 v − ωR 이다.
//
//   구름(v = ωR)  — 접점의 속도가 0. 표시한 점의 자취는 바닥에서 뾰족한 사이클로이드.
//   끌림(v > ωR)  — 접점이 v − ωR 로 앞으로 미끄러진다. 자취는 바닥에서도 매끈하다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { RADIUS, SLIP_RATIO, SPEED, START_X } from './schema';
import type { RollingWithoutSlippingState } from './state';

export interface RollingConstants {
  /** 두 바퀴 중심의 빠르기(m/s). */
  speed: number;
  /** 바퀴 반지름(m). */
  radius: number;
  /** 아래 바퀴의 각속도 ÷ (v/R). */
  slipRatio: number;
}

export function readConstants(stage: StageDef): RollingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    speed: c.speed ?? SPEED,
    radius: c.radius ?? RADIUS,
    slipRatio: c.slipRatio ?? SLIP_RATIO,
  };
}

/** 굴러가는 단계들. 이 단계 동안만 물리 시간이 흐른다 — `freeze` · `hold` · `fade` 에는 멈춘다. */
const MOVING_PHASES = ['roll-in', 'touch', 'leave', 'roll-out'] as const;

/**
 * 이번 주기에서 **굴러간 시간**(물리 초). 단계 경계는 선언이 안다 — 단계마다 길이 ×
 * 진행도를 더한다. `freeze` 동안은 더해지는 것이 없어 바퀴가 그 자리에 선다.
 */
export function rolledTime(tl: TimelineFrame): number {
  let s = 0;
  for (const id of MOVING_PHASES) s += tl.duration(id) * tl.at(id);
  return s;
}

/** 표시한 점이 바닥에 닿는 물리 시각 — 멈춤 단계가 시작하는 자리다. */
export function touchTime(tl: TimelineFrame): number {
  return tl.duration('roll-in') + tl.duration('touch');
}

/** 한 레인의 한 순간. */
export interface WheelReading {
  /** 바퀴 중심(월드). 바닥 높이 `floorY` 기준으로 반지름만큼 위다. */
  center: Vec2;
  /** 바닥에 닿은 점(월드). */
  contact: Vec2;
  /** 각속도 × 반지름(m/s) — 테가 축을 도는 빠르기. */
  spinSpeed: number;
  /** 수직 지름 위 세 점의 가로 속도(m/s). 앞이 +. */
  topSpeed: number;
  centerSpeed: number;
  contactSpeed: number;
  /** 표시한 점의 각(월드 x 축에서 반시계, 라디안). 바퀴살도 이 각에서 시작한다. */
  markAngle: number;
  /** 표시한 점(월드). */
  mark: Vec2;
  /** 이번 주기 처음부터 지금까지 표시한 점이 지나온 자리. */
  trace: Vec2[];
  /** 접점이 바닥을 긁고 지나온 구간 [시작 x, 지금 x]. 구르면 없다. */
  skid: readonly [number, number] | null;
}

/** 자취를 표본하는 물리 시간 간격(초). 뾰족한 끝이 뭉개지지 않을 만큼 촘촘하게. */
const TRACE_STEP = 0.01;
/** 이보다 작은 접점 속도는 0 으로 본다 — 부동소수 찌꺼기로 자국이 생기지 않게. */
const REST_EPS = 1e-9;

/**
 * 한 레인을 읽는다. `ratio` 는 이 바퀴의 각속도 ÷ (v/R) — 위 레인은 1, 아래 레인은
 * `slipRatio`.
 *
 * 표시한 점은 **닿는 시각에 바닥에 오도록** 각을 되짚는다: θ(s) = −π/2 + ω(s닿음 − s).
 * 그래서 두 레인의 표시한 점이 같은 순간 바닥에 닿고, 멈춤 단계가 그 순간을 붙잡는다.
 */
export function readWheel(
  tl: TimelineFrame,
  floorY: number,
  ratio: number,
  c: RollingConstants,
): WheelReading {
  const s = rolledTime(tl);
  const sTouch = touchTime(tl);
  const omega = (ratio * c.speed) / c.radius;
  const spinSpeed = omega * c.radius;

  const centerAt = (t: number): Vec2 => [START_X + c.speed * t, floorY + c.radius];
  const angleAt = (t: number): number => -Math.PI / 2 + omega * (sTouch - t);
  const markAt = (t: number): Vec2 => {
    const [cx, cy] = centerAt(t);
    const a = angleAt(t);
    return [cx + c.radius * Math.cos(a), cy + c.radius * Math.sin(a)];
  };

  const trace: Vec2[] = [];
  for (let t = 0; t < s; t += TRACE_STEP) trace.push(markAt(t));
  trace.push(markAt(s));

  const center = centerAt(s);
  const contactSpeed = c.speed - spinSpeed;
  return {
    center,
    contact: [center[0], floorY],
    spinSpeed,
    topSpeed: c.speed + spinSpeed,
    centerSpeed: c.speed,
    contactSpeed,
    markAngle: angleAt(s),
    mark: markAt(s),
    trace,
    // 접점이 미끄러지면 그 빠르기와 무관하게 접점이 지나온 바닥 전체가 긁힌다.
    skid: Math.abs(contactSpeed) > REST_EPS && s > 0 ? [START_X, center[0]] : null,
  };
}

/** 멈춤 단계에 있는가 — 접점의 두 성분(v · ωR)을 펼쳐 보이는 조건이다. */
export function isFrozen(tl: TimelineFrame): boolean {
  return tl.phase === 'freeze';
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 처음 자리로 돌아간다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RollingWithoutSlippingState }): RollingWithoutSlippingState {
  return params.state;
}
