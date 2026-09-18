// ========================================================================
// orbital-velocity — 순수 물리
// ========================================================================
// 산꼭대기(행성 중심에서 r₀)에서 옆으로(반지름에 직각으로) 쏜다. 속도는 그 높이의 원 궤도
// 속도 v_c = √(GM/r₀) 의 k 배다. 쏘는 순간 속도가 반지름에 직각이므로 쏜 자리는 궤도의
// 가장 가까운 점이거나 가장 먼 점이고, 궤도는 쏜 뒤 돈 각 φ 의 닫힌 식으로 나온다:
//
//   r(φ) = r₀·k² / (1 + (k² − 1)·cos φ)
//
//   k < 1  — 쏜 자리가 가장 먼 점인 타원. 가장 가까운 점이 땅속이면 땅에 떨어진다
//   k = 1  — 원
//   1 < k < √2 — 쏜 자리가 가장 가까운 점인 타원
//   k ≥ √2 — 포물선 · 쌍곡선. 닫히지 않는다
//
// 시간은 면적 속도가 일정하다는 것(dt/dφ = r²/h, h = r₀·v₀)을 φ 를 따라 누적해 얻는다.
// GM = 1 로 둔다 — 물리 시간을 원 궤도 한 바퀴(2π·r₀^1.5)로 나눠 화면 시간으로 바꾸므로 값이
// 남지 않는다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_PER_SPEED,
  CIRCLE_LAP_SECONDS,
  LAUNCH_RADIUS,
  PLANET_RADIUS,
  SPEED_1,
  SPEED_2,
  SPEED_3,
  SPEED_4,
  SPEED_5,
} from './schema';
import type { OrbitalVelocityState } from './state';

export interface OrbitalVelocityConstants {
  launchRadius: number;
  planetRadius: number;
  /** 샷마다의 속도(원 궤도 속도의 배수). 샷 순서다. */
  speeds: readonly number[];
  circleLapSeconds: number;
  arrowPerSpeed: number;
}

/**
 * 샷 단계 id. 샷 i 는 `speeds[i]` 로 쏜다. 스테이지 상수를 목록으로 선언할 수 없어(장부 G105)
 * 속도 다섯과 단계 다섯을 여기서 짝짓는다.
 */
export const SHOT_PHASES = ['shot1', 'shot2', 'shot3', 'shot4', 'shot5'] as const;

export function readConstants(stage: StageDef): OrbitalVelocityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    launchRadius: c.launchRadius ?? LAUNCH_RADIUS,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    speeds: [
      c.speed1 ?? SPEED_1,
      c.speed2 ?? SPEED_2,
      c.speed3 ?? SPEED_3,
      c.speed4 ?? SPEED_4,
      c.speed5 ?? SPEED_5,
    ],
    circleLapSeconds: c.circleLapSeconds ?? CIRCLE_LAP_SECONDS,
    arrowPerSpeed: c.arrowPerSpeed ?? ARROW_PER_SPEED,
  };
}

/** 궤도 표본 간격(rad). 0.5° — 원 · 타원이 각져 보이지 않는 촘촘함. */
const PHI_STEP = Math.PI / 360;
/**
 * 열린 궤도를 어디까지 따라갈지(쏜 반지름의 배수). 화면 밖으로 충분히 나간 뒤다 —
 * 자취가 화면 끝에서 끊겨 보이지 않을 만큼.
 */
const OPEN_REACH = 6;

/** 궤도가 끝나는 방식. */
export type OrbitEnd = 'land' | 'closed' | 'open';

export interface Orbit {
  /** 쏜 속도(원 궤도 속도의 배수). */
  speed: number;
  end: OrbitEnd;
  /** 궤도 위 표본점(월드). 첫 점이 산꼭대기다. */
  points: Vec2[];
  /** 각 표본점에 닿는 화면 시각(초, 쏜 순간 0). */
  times: number[];
  /** 비행이 끝나는 화면 시각 — 떨어진 순간 · 한 바퀴 · 따라가기를 멈춘 순간. */
  duration: number;
}

/** 쏜 뒤 돈 각 φ 의 자리. 행성 꼭대기에서 오른쪽(시계 방향)으로 돈다. */
function place(r: number, phi: number): Vec2 {
  return [r * Math.sin(phi), r * Math.cos(phi)];
}

/** 속도 k 로 쏜 궤도를 표본으로 얻는다. */
export function orbitOf(c: OrbitalVelocityConstants, k: number): Orbit {
  const r0 = c.launchRadius;
  const e = k * k - 1;
  const p = r0 * k * k;
  const radius = (phi: number): number => {
    const d = 1 + e * Math.cos(phi);
    return d > 0 ? p / d : Infinity;
  };
  // GM = 1: 원 궤도 속도 √(1/r₀), 면적 속도 h = r₀·k·√(1/r₀).
  const h = r0 * k * Math.sqrt(1 / r0);
  const toScreen = c.circleLapSeconds / (2 * Math.PI * Math.pow(r0, 1.5));

  const points: Vec2[] = [place(r0, 0)];
  const times: number[] = [0];
  let t = 0;
  let prevR = r0;
  let end: OrbitEnd = 'closed';
  const n = Math.ceil((2 * Math.PI) / PHI_STEP);
  for (let i = 1; i <= n; i++) {
    const phi = Math.min(i * PHI_STEP, 2 * Math.PI);
    const r = radius(phi);
    if (r <= c.planetRadius) {
      // 땅에 닿는 자리를 두 표본 사이에서 선형으로 찾는다.
      const f = (prevR - c.planetRadius) / (prevR - r);
      const hitPhi = phi - PHI_STEP + f * PHI_STEP;
      const hitR = c.planetRadius;
      t += ((prevR * prevR + hitR * hitR) / 2 / h) * (f * PHI_STEP) * toScreen;
      points.push(place(hitR, hitPhi));
      times.push(t);
      end = 'land';
      break;
    }
    if (r > OPEN_REACH * r0) {
      end = 'open';
      break;
    }
    t += ((prevR * prevR + r * r) / 2 / h) * PHI_STEP * toScreen;
    points.push(place(r, phi));
    times.push(t);
    prevR = r;
  }
  return { speed: k, end, points, times, duration: t };
}

/** 궤도에서 화면 시각 s 까지 간 자취와 그 끝 자리. 닫힌 궤도는 한 바퀴를 넘으면 계속 돈다. */
export function progressAlong(orbit: Orbit, s: number): { trail: Vec2[]; at: Vec2; reached: number } {
  const { points, times, duration } = orbit;
  if (s >= duration) {
    const at =
      orbit.end === 'closed' && duration > 0
        ? pointAtTime(orbit, s % duration)
        : points[points.length - 1]!;
    return { trail: points, at, reached: points.length - 1 };
  }
  // times 는 늘어나기만 한다 — 이분 탐색.
  let lo = 0;
  let hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid]! <= s) lo = mid;
    else hi = mid;
  }
  const at = pointAtTime(orbit, s);
  return { trail: [...points.slice(0, lo + 1), at], at, reached: lo };
}

function pointAtTime(orbit: Orbit, s: number): Vec2 {
  const { points, times } = orbit;
  let lo = 0;
  let hi = times.length - 1;
  if (s <= 0) return points[0]!;
  if (s >= times[hi]!) return points[hi]!;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid]! <= s) lo = mid;
    else hi = mid;
  }
  const a = points[lo]!;
  const b = points[hi]!;
  const f = (s - times[lo]!) / (times[hi]! - times[lo]!);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/**
 * 샷 i 가 쏜 뒤 흐른 화면 시간. 단계 전에는 음수(아직 안 쐈다), 단계가 지나면 단계 길이에서
 * 멈춘다 — 저작자가 단계를 비행보다 짧게 줄이면 자취가 그 자리에서 멈춘다.
 */
export function shotElapsed(tl: TimelineFrame, i: number): number {
  const id = SHOT_PHASES[i]!;
  const s = tl.u - tl.start(id);
  return Math.min(s, tl.duration(id));
}

/** 지금 쏘고 있는 샷의 번호. 샷 단계가 아니면 -1. */
export function currentShot(tl: TimelineFrame): number {
  return (SHOT_PHASES as readonly string[]).indexOf(tl.phase);
}

/** 자취의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 새로 쌓인다. */
export function trailOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: OrbitalVelocityState }): OrbitalVelocityState {
  return params.state;
}
