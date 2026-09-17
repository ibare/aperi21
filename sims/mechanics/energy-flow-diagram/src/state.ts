import type { StageDef } from '@aperi21/schema';
import { BULB, DOTS } from './schema';
import { flowsAt, makeDots, readFlows, type Dot } from './physics';

/**
 * 상태.
 *
 * 흐름과 알갱이는 시각의 함수라 상태에 쌓지 않는다. 쌓는 것은 전구를 바꿨을 때
 * 배분이 부드럽게 옮겨 가는 `mix` 하나뿐이다 — 누른 순간부터 흐른 시간에 달렸다.
 */
export interface EnergyFlowDiagramState {
  /** 고른 전구. 조작기(`param-chips`)가 적는다. 0 백열 · 1 LED. */
  bulb: number;
  /** 화면에 보이는 전구 상태 0~1. `bulb` 를 향해 부드럽게 따라간다. */
  mix: number;
  /** 캡션의 「빛」 값. 화면의 「빛 N」 과 같은 반올림 정수. */
  lightText: string;
  /** 캡션의 「나머지」 값 = 100 − 빛. */
  restText: string;
  /** 알갱이 — 시드에서 뽑은 차선 · 위상 · 흔들림. 바뀌지 않는다. */
  dots: readonly Dot[];
}

export function initialState(params: { stage: StageDef }): EnergyFlowDiagramState {
  const mix = 0;
  const f = flowsAt(mix, readFlows(params.stage));
  return {
    bulb: BULB.incandescent,
    mix,
    lightText: String(f.light),
    restText: String(100 - f.light),
    dots: makeDots(DOTS.count, DOTS.seed),
  };
}
