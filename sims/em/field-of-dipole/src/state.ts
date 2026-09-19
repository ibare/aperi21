// ========================================================================
// field-of-dipole — 상태
// ========================================================================
// 움직이는 것은 시간표 진행도의 함수뿐이라 쌓는 것이 없다. state 에 두는 것은 둘이다.
//
// 1. 전기력선과 축 위 세기 곡선 — 스테이지 상수의 함수라 여기서 한 번 계산한다.
//    추적은 프레임마다 다시 할 만큼 가볍지 않다 (장부 G189). 모듈 스코프 캐시를 두지
//    않는다 (원칙 6 — 인스턴스 독립).
// 2. 캡션 `vars` 가 가리킬 **선언값의 글자** — 캡션 `vars` 가 state 경로만 가리키므로
//    (장부 G133) 스테이지 상수를 여기서 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants, strengthCurve, traceFieldLines, type FieldLine, type StrengthSample } from './physics';

export interface FieldOfDipoleState {
  readonly lines: readonly FieldLine[];
  readonly curve: readonly StrengthSample[];
  /** 선언한 배수의 글자. */
  readonly reachText: string;
}

export function initialState(params: { stage: StageDef }): FieldOfDipoleState {
  const c = readConstants(params.stage);
  return {
    lines: traceFieldLines(c),
    curve: strengthCurve(c),
    reachText: String(c.probeReach),
  };
}
