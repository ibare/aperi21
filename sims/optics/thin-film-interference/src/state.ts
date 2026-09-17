import type { Vec2 } from '@aperi21/schema';
import { FILM, PROBE_X, PROBE_Y_DEFAULT, worldY } from './schema';

/**
 * 상태는 관찰점 하나뿐이다. 막 · 스펙트럼 · 색은 모두 조각 시계의 함수라 쌓지 않는다.
 *
 * - `pos` — 관찰점의 월드 자리. `point-drag` 가 세로 열 위로 붙여 옮긴다.
 * - `held` — 끄는 중인지. 러너가 적는다.
 */
export interface ThinFilmInterferenceState {
  pos: Vec2;
  held: boolean;
}

/** 관찰 높이(막 높이의 비, 위가 0) → 월드 자리. */
export function probePos(yFrac: number): Vec2 {
  return [FILM.x + PROBE_X * FILM.w, worldY(FILM.y + yFrac * FILM.h)];
}

export function initialState(): ThinFilmInterferenceState {
  return { pos: probePos(PROBE_Y_DEFAULT), held: false };
}
