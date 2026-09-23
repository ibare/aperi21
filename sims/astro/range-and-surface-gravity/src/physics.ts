// ========================================================================
// range-and-surface-gravity — 순수 물리
// ========================================================================
// 저항 없는 포물선 하나뿐이다. 떠난 뒤로는
//   x = v₀cosθ · s,  y = v₀sinθ · s − ½ g s²   (s 는 떠난 뒤 흐른 시간)
// 이고, 떨어지기까지의 시간은 2v₀sinθ/g, 그때까지 간 가로 거리는
// v₀²sin2θ/g 라서 **둘 다 g 에 반비례**한다. 가로 속력 v₀cosθ 는 g 와 무관해
// 두 레인이 똑같다 — 달리는 것은 같고 떠 있는 시간만 다르다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ANGLE_DEG, ARROW_SCALE, CELL_COUNT, G_EARTH, G_MOON, V0 } from './schema';
import type { RangeAndSurfaceGravityState } from './state';

export interface RangeAndSurfaceGravityConstants {
  /** 발사 속력(m/s). 두 레인이 같다. */
  v0: number;
  /** 발사각(°). 두 레인이 같다. */
  angleDeg: number;
  /** 지구 · 달의 표면 중력(m/s²). 이 둘만 다르다. */
  gEarth: number;
  gMoon: number;
  /** 눈금 칸 수. 한 칸은 지구에서의 사거리다. */
  cells: number;
  /** 발사 속력 → 화살표 길이 배율(m per m/s). */
  arrowScale: number;
}

export function readConstants(stage: StageDef): RangeAndSurfaceGravityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    v0: c.v0 ?? V0,
    angleDeg: c.angleDeg ?? ANGLE_DEG,
    gEarth: c.gEarth ?? G_EARTH,
    gMoon: c.gMoon ?? G_MOON,
    cells: c.cells ?? CELL_COUNT,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

/** 발사각(라디안). 선언은 도(°)로 두고 계산만 라디안으로 옮긴다. */
export function angleRad(c: RangeAndSurfaceGravityConstants): number {
  return (c.angleDeg * Math.PI) / 180;
}

/** 떨어지기까지의 시간(초) = 2v₀sinθ / g. */
export function flightTime(c: RangeAndSurfaceGravityConstants, g: number): number {
  return (2 * c.v0 * Math.sin(angleRad(c))) / g;
}

/** 떨어진 자리까지의 가로 거리(m) = v₀²sin2θ / g. 한 칸(R)은 지구 쪽 값이다. */
export function rangeOf(c: RangeAndSurfaceGravityConstants, g: number): number {
  return (c.v0 * c.v0 * Math.sin(2 * angleRad(c))) / g;
}

export interface BallReading {
  /** 공 중심의 땅 기준 가로 · 세로 자리(m). */
  x: number;
  y: number;
  /** 떨어졌는가 — 착지 자국을 놓을 조건이다. */
  landed: boolean;
  /** 떨어진 뒤 흐른 시간(초). 착지 울림이 늙는 나이다. */
  landedAge: number;
  /** 떠난 뒤 지금까지 그린 포물선의 점들(땅 기준). */
  path: readonly (readonly [number, number])[];
}

/** 포물선을 몇 점으로 나눠 그릴지. 그림의 결이라 물리량이 아니다. */
const PATH_SAMPLES = 48;

/**
 * 공 하나를 읽는다. **떠난 순간은 선언이 정한다** — 시간표에게 `fly-both` 가
 * 시작하는 시각을 묻는다 (S-piece 「시간표는 선언이다」). 단계 경계를 모듈 상수와
 * 견주어 가르면 저작자가 단계를 늘여도 물리가 따라가지 않는다.
 *
 * **떨어지는 순간은 물리가 정한다** — 단계 경계가 아니라 2v₀sinθ/g 다. 그래서 두
 * 공은 같은 순간 떠나고, 떨어지는 순간만 제 중력에 따라 갈린다.
 */
export function ballAt(
  tl: TimelineFrame,
  c: RangeAndSurfaceGravityConstants,
  g: number,
): BallReading {
  const th = angleRad(c);
  const vx = c.v0 * Math.cos(th);
  const vy = c.v0 * Math.sin(th);
  const total = flightTime(c, g);
  const elapsed = Math.max(0, tl.u - tl.start('fly-both'));
  const s = Math.min(elapsed, total);
  const path: [number, number][] = [];
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const t = (s * i) / PATH_SAMPLES;
    path.push([vx * t, vy * t - 0.5 * g * t * t]);
  }
  return {
    x: vx * s,
    y: Math.max(0, vy * s - 0.5 * g * s * s),
    landed: elapsed >= total,
    landedAge: Math.max(0, elapsed - total),
    path,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 떠나게 한다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 두 공의 자리가 모두 시각의 함수다. */
export function step(params: { state: RangeAndSurfaceGravityState }): RangeAndSurfaceGravityState {
  return params.state;
}
