// ========================================================================
// drag-in-fluid — 런타임 상태
// ========================================================================
// 상태를 비울 수 없는 조각이다. 연기 · 염료 알갱이는 소용돌이가 흐르는 **시간에 따라
// 변하는** 속도장을 따라가므로 자리를 닫힌 꼴로 구할 수 없다 — 매 걸음 적분해 쌓는다.
// 소용돌이 자체의 자리는 시계의 닫힌 함수라 상태에 두지 않는다 (physics.ts).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';

/** 알갱이 하나 — 레인 좌표(몸 중심 = 0)의 자리. */
export interface Tracer {
  readonly x: number;
  readonly y: number;
  /** 태어난 뒤 흐른 시간(초). 염료가 하류에서 옅어지는 데 쓴다. */
  readonly age: number;
}

/** 한 레인의 알갱이. */
export interface LaneTracers {
  /** 앞에서 오는 연기. */
  readonly smoke: readonly Tracer[];
  /** 몸 뒤에서 흘리는 염료 — 자국의 너비를 그린다. */
  readonly dye: readonly Tracer[];
}

export interface DragInFluidState {
  /** 흐름 시계(초). 소용돌이가 떨어지는 시각이 이 시계의 함수다. */
  readonly clock: number;
  /** 고정 걸음으로 나누고 남은 시간(초). */
  readonly acc: number;
  /** 다음 방출까지 남은 시간(초) — 연기 · 염료. */
  readonly smokeDue: number;
  readonly dyeDue: number;
  /** 위 레인(원기둥) · 아래 레인(유선형). */
  readonly cylinder: LaneTracers;
  readonly streamlined: LaneTracers;
}

export function initialState(_params?: {
  values: Record<string, number>;
  stage: StageDef;
  environments: EnvironmentDef[];
}): DragInFluidState {
  const empty: LaneTracers = { smoke: [], dye: [] };
  return {
    clock: 0,
    acc: 0,
    smokeDue: 0,
    dyeDue: 0,
    cylinder: empty,
    streamlined: empty,
  };
}
