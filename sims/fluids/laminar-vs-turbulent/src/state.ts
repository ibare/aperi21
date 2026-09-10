export interface LaminarVsTurbulentState {
  /** 흐른 시간(초). */
  t: number;
  /** 지금 유속(m/s). 목표를 감쇠 추종한다. */
  v: number;
}

import { SPEED_STOPS } from './schema';

export function initialState(): LaminarVsTurbulentState {
  return { t: 0, v: SPEED_STOPS[0]! };
}
