// ========================================================================
// quantum-tunneling — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가
// 가리킬 **선언값의 글자** 하나뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133)
// 스테이지 상수 `widthRatio` 를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface QuantumTunnelingState {
  /** 두꺼운 장벽의 두께 배수(선언값 그대로의 글자). `compare` 캡션의 `{ratio}`. */
  ratio: string;
}

export function initialState(params: { stage: StageDef }): QuantumTunnelingState {
  const c = readConstants(params.stage);
  return { ratio: String(c.widthRatio) };
}
