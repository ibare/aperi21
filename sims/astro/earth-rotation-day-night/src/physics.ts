// ========================================================================
// earth-rotation-day-night — 순수 물리 · 배치 계산
// ========================================================================
// 햇빛은 태양 쪽(SUN_ANGLE)에서 평행하게 온다. 그래서 지구에서 햇빛을 받는 것은
// 언제나 태양 쪽 반쪽이다 — 이 반쪽은 지구가 돌아도 제자리다.
//
// 북극 위에서 내려다본 지구의 가장자리에 선 관측자는 각 φ 에 있다. 그 자리가
// 햇빛 반쪽에 드는지는 cos(φ − 태양 쪽) > 0 하나로 정해진다. 지구가 돌면 φ 만
// 바뀐다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { NIGHT_LIGHT, SPIN, SUN_ANGLE } from './schema';
import type { EarthRotationDayNightState } from './state';

export interface EarthRotationDayNightConstants {
  /** 자전 방향. +1 = 북극 위에서 반시계. */
  spin: number;
}

export function readConstants(stage: StageDef): EarthRotationDayNightConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const spin = c.spin ?? SPIN;
  // 방향만 뜻이 있다 — 크기는 시간표가 정한다.
  return { spin: spin < 0 ? -1 : 1 };
}

/** 한 바퀴를 네 토막으로 가른 단계 id — 해 뜸 → 정오 → 해 짐 → 자정 → 해 뜸. */
const QUARTERS = ['morning', 'afternoon', 'evening', 'night'] as const;

/**
 * 이번 바퀴에서 돈 몫 0~1. 해 뜨는 순간이 0, 다음 해 뜨는 순간이 1.
 *
 * 토막마다 4 분의 1 바퀴다 — 해 뜸 · 정오 · 해 짐 · 자정은 4 분의 1 바퀴 간격인 자리라서다.
 * 토막 길이는 시간표 선언이 정한다. 저작자가 한 토막을 늘이면 그 토막 동안 천천히 돈다.
 */
export function turnFraction(tl: TimelineFrame): number {
  let sum = 0;
  for (const id of QUARTERS) sum += tl.at(id);
  return sum / QUARTERS.length;
}

/** 해 뜨는 자리 — 자전 방향으로 가면서 그늘에서 햇빛으로 들어서는 경계. */
export function sunriseAngle(c: EarthRotationDayNightConstants): number {
  return SUN_ANGLE - (c.spin * Math.PI) / 2;
}

/** 이번 바퀴에서 몫 f 만큼 돈 관측자의 각(라디안). */
export function angleAt(f: number, c: EarthRotationDayNightConstants): number {
  return sunriseAngle(c) + c.spin * 2 * Math.PI * f;
}

/** 각 φ 의 자리가 받는 빛의 세기 — 햇빛 반쪽이면 1, 그늘 반쪽이면 NIGHT_LIGHT. */
export function lightAt(phi: number): number {
  return Math.cos(phi - SUN_ANGLE) > 0 ? 1 : NIGHT_LIGHT;
}

/**
 * 관측자가 겪은 빛을 띠 칸으로 편다. 칸 i 는 몫 (i + ½)/cells 자리의 빛이고,
 * 아직 돌지 않은 몫(> f)은 `NaN` — 칠하지 않는다.
 */
export function stripValues(f: number, cells: number, c: EarthRotationDayNightConstants): number[] {
  const out = new Array<number>(cells);
  for (let i = 0; i < cells; i++) {
    const g = (i + 0.5) / cells;
    out[i] = g <= f ? lightAt(angleAt(g, c)) : Number.NaN;
  }
  return out;
}

/** 햇빛 반쪽이 정확히 반 바퀴라 해 지는 몫은 ½ 이다 — 띠 눈금 「해 짐」 자리. */
export const SUNSET_FRACTION = 0.5;

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EarthRotationDayNightState }): EarthRotationDayNightState {
  return params.state;
}
