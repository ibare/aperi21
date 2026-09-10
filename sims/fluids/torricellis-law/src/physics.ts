// ========================================================================
// torricellis-law — 순수 물리
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { HOLES, WATER_LEVEL } from './schema';
import type { TorricellisLawState } from './state';

export interface TorricellisConstants {
  g: number;
  waterLevel: number;
}

export function readConstants(stage: StageDef): TorricellisConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { g: c.g ?? 9.8, waterLevel: c.waterLevel ?? WATER_LEVEL };
}

/** 토리첼리 — 구멍 위 물기둥 h 에서 나오는 속도. */
export function jetSpeed(depth: number, g: number): number {
  return Math.sqrt(2 * g * Math.max(0, depth));
}

export interface HoleReading {
  id: string;
  /** 구멍 높이(월드 y). */
  y: number;
  /** 구멍 위 물기둥(m). */
  depth: number;
  /** 분출 속도(m/s). */
  speed: number;
  /** 깊이 표시가 꺾이는 x. */
  depthInset: number;
}

export function readings(c: TorricellisConstants): HoleReading[] {
  return HOLES.map((h) => {
    const depth = c.waterLevel - h.y;
    return { id: h.id, y: h.y, depth, speed: jetSpeed(depth, c.g), depthInset: h.depthInset };
  });
}

/**
 * 동시 출발 표지의 나이(초, 물리 시간). 표지가 없는 단계면 `null`.
 *
 * 날아가는 동안(fly) 자라고, 수명에 이르면 머무는 동안(hold) 그 값에 멈춘다. 이때
 * 표지는 정확히 각 물줄기의 **선두**에 놓이고, "같은 시간, 다른 거리" 라는 문장이
 * 그림 안에서 문자 그대로 일어난다. 단계의 길이는 선언(`schema.timeline`)이 정한다.
 */
export function pulseAge(tl: TimelineFrame): number | null {
  if (tl.phase === 'fly') return tl.u - tl.start('fly');
  if (tl.phase === 'hold') return tl.duration('fly');
  return null;
}

/** 쌓는 상태가 없다 — 물줄기와 표지가 모두 시각의 함수다. */
export function step(params: { state: TorricellisLawState }): TorricellisLawState {
  return params.state;
}
