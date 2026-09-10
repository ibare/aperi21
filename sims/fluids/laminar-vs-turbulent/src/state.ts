export interface LaminarVsTurbulentState {
  /** 시퀀스 시계(초). 손을 뗀 뒤 복귀할 때 옮겨진다. */
  t: number;
  /** 지금 유속(m/s). 자동 진행 중에는 목표를 감쇠 추종하고, 잡고 있으면 조작기가 쓴다. */
  v: number;
  /** 눈금을 잡고 있는가. 조작기(`scale-drag`)가 쓴다. */
  held: boolean;
  /** 손을 뗀 뒤 흐른 시간(초). 자동 진행 중이면 `null`. */
  idle: number | null;
}

import { SPEED_STOPS } from './schema';

export function initialState(): LaminarVsTurbulentState {
  return { t: 0, v: SPEED_STOPS[0]!, held: false, idle: null };
}
