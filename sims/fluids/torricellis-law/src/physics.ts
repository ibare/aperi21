// ========================================================================
// torricellis-law — 순수 물리
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { HOLES, WATER_LEVEL, PULSE_HOLD, PULSE_PERIOD, DROPLET_LIFE } from './schema';
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
 * 동시 출발 표지의 나이(초). 주기 안에서 지금 표지 물방울이 몇 초를 날았는가.
 *
 * 수명(0.26 s)에 이르면 `PULSE_HOLD` 동안 그 자리에 멈춰 머문다. 이때 표지는
 * 정확히 각 물줄기의 **선두**에 놓이고, "같은 시간, 다른 거리" 라는 문장이
 * 그림 안에서 문자 그대로 일어난다.
 */
export function pulseAge(t: number): number | null {
  const phase = t % PULSE_PERIOD;
  if (phase > DROPLET_LIFE + PULSE_HOLD) return null;
  return Math.min(phase, DROPLET_LIFE);
}

/** 시간만 전진한다. 물줄기는 시간의 함수라 상태를 쌓지 않는다. */
export function step(params: { state: TorricellisLawState; dt: number }): TorricellisLawState {
  return { t: params.state.t + params.dt };
}
