// ========================================================================
// projectile-in-wind — 순수 물리
// ========================================================================
// 공은 제 속도가 아니라 **공기에 대한 속도**만큼 저항을 받는다. 공기가 가로로
// 속력 w 로 흐르면
//
//   ẍ = −k (ẋ − w),   ÿ = −g − k ẏ
//
// 이고, 둘 다 1차 선형이라 닫힌 꼴이 있다.
//
//   x(t) = w·t + (v₀x − w)(1 − e^(−k t))/k
//   y(t) =       (v₀y + g/k)(1 − e^(−k t))/k − (g/k)·t
//
// **세로 식에 w 가 없다.** 바람은 가로로만 불기 때문이다 — 그래서 세 레인의 공은
// 같은 높이를 함께 지나가고 같은 순간 땅에 닿는다. 달라지는 것은 x 뿐이고,
// 그 차이는 `x(T, w) − x(T, 0) = w · (T − (1 − e^(−kT))/k)` 로 **바람에 비례**한다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';

import {
  ANGLE_DEG,
  DRAG,
  flightTime,
  G,
  V0,
  VEL_ARROW_SCALE,
  WIND,
  WIND_ARROW_SCALE,
} from './schema';
import type { ProjectileInWindState } from './state';

export interface ProjectileInWindConstants {
  /** 처음 속력(m/s)과 발사 각(°). 세 레인이 같다. */
  v0: number;
  angleDeg: number;
  /** 중력 가속도(m/s²). */
  g: number;
  /** 저항 계수 k(1/s). */
  drag: number;
  /** 바람 세기(m/s) 기본값. 앞바람 레인은 −wind, 뒷바람 레인은 +wind 를 쓴다. */
  wind: number;
  /** 바람 세기 · 처음 속력을 화살표 길이로 옮기는 배율(m per m/s). */
  windArrowScale: number;
  velArrowScale: number;
  /** 위 상수에서 따라 나오는 값 — 발사 속도의 두 몫과 체공 시간(초). */
  v0x: number;
  v0y: number;
  flight: number;
}

/** 주장이 기대는 물리량은 `stages[].constants` 에 선언하고 여기서 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): ProjectileInWindConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const v0 = c.v0 ?? V0;
  const angleDeg = c.angleDeg ?? ANGLE_DEG;
  const g = c.g ?? G;
  const drag = c.drag ?? DRAG;
  const rad = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);
  return {
    v0,
    angleDeg,
    g,
    drag,
    wind: c.wind ?? WIND.default,
    windArrowScale: c.windArrowScale ?? WIND_ARROW_SCALE,
    velArrowScale: c.velArrowScale ?? VEL_ARROW_SCALE,
    v0x,
    v0y,
    flight: flightTime(v0y, g, drag),
  };
}

/** 발사 뒤 `t` 초에 공이 있는 자리(발사점 기준 m). 같은 시각은 언제나 같은 자리다. */
export function posAt(t: number, wind: number, c: ProjectileInWindConstants): Vec2 {
  const k = c.drag;
  const decay = (1 - Math.exp(-k * t)) / k;
  const terminal = c.g / k;
  return [wind * t + (c.v0x - wind) * decay, (c.v0y + terminal) * decay - terminal * t];
}

/** 이 바람에서 공이 닿는 자리(발사점에서의 거리 m). */
export function landingX(wind: number, c: ProjectileInWindConstants): number {
  return posAt(c.flight, wind, c)[0];
}

/** 발사점에서 지금까지의 궤적 표본. `t` 가 0 이면 빈 배열이다. */
export function pathTo(
  t: number,
  wind: number,
  c: ProjectileInWindConstants,
  samples: number,
): Vec2[] {
  if (t <= 0) return [];
  const out: Vec2[] = [];
  for (let i = 0; i <= samples; i++) out.push(posAt((t * i) / samples, wind, c));
  return out;
}

/**
 * 쌓는 상태가 없다 — 공의 자리는 모두 시각의 함수이고, 바람 세기는 독자가 끄는
 * 값이라 러너가 직접 적는다.
 */
export function step(params: { state: ProjectileInWindState }): ProjectileInWindState {
  return params.state;
}
