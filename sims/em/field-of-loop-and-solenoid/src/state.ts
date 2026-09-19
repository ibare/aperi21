// ========================================================================
// field-of-loop-and-solenoid — 상태
// ========================================================================
// 움직이는 것은 시간표 진행도의 함수뿐이라 쌓는 것이 없다. state 에 두는 것은 둘이다.
//
// 1. 세 배치(고리 하나 · 몇 개 · 많이)의 기하 — 장선 · 격자 자리마다의 장. 스테이지
//    상수의 함수라 여기서 한 번 계산한다. 장선 추적은 한 배치에 수십 ms 가 들어
//    프레임마다 다시 하지 않는다. 모듈 스코프 캐시를 두지 않는다 (원칙 6 — 인스턴스 독립).
// 2. 캡션 `vars` 가 가리킬 **선언값의 글자** — 캡션 `vars` 가 state 경로만 가리키므로
//    (장부 G133) 스테이지 상수를 여기서 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { arrowGrid, deriveConfig, loopPositions, readConstants, type LoopConfig } from './physics';

export interface FieldOfLoopAndSolenoidState {
  /** 화살표 격자 자리 — 세 배치가 같은 자리를 쓴다. */
  readonly grid: readonly Vec2[];
  readonly one: LoopConfig;
  readonly few: LoopConfig;
  readonly many: LoopConfig;
  /** 선언한 고리 수의 글자. */
  readonly oneText: string;
  readonly fewText: string;
  readonly manyText: string;
}

export function initialState(params: { stage: StageDef }): FieldOfLoopAndSolenoidState {
  const c = readConstants(params.stage);
  const allLoops = [
    ...loopPositions(c.loopsOne, c),
    ...loopPositions(c.loopsFew, c),
    ...loopPositions(c.loopsMany, c),
  ];
  const grid = arrowGrid(c, allLoops);
  return {
    grid,
    one: deriveConfig(c.loopsOne, grid, c),
    few: deriveConfig(c.loopsFew, grid, c),
    many: deriveConfig(c.loopsMany, grid, c),
    oneText: String(c.loopsOne),
    fewText: String(c.loopsFew),
    manyText: String(c.loopsMany),
  };
}
