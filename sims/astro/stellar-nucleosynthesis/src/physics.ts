// ========================================================================
// stellar-nucleosynthesis — 순수 물리
// ========================================================================
// 한 겹 더할 때마다 원자핵의 핵자당 결합 에너지가 오르고, 오른 만큼 에너지가
// 나온다(질량 결손). 곡선의 꼭대기가 철이라 그 너머로 가면 내려간다 — 에너지를
// 먹는다. 여기서는 그 값을 선언에서 읽어 곡선 위 자리로 옮기고, 겹마다 쌓인 정도를
// 시간표에서 읽는다. 누적할 것이 없어 모든 것이 시각의 함수다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { NUCLIDES, PLOT, SHELLS, bindingKey } from './schema';
import type { StellarNucleosynthesisState } from './state';

/** 핵종 id → 핵자당 결합 에너지(MeV). 스테이지 상수가 이기고, 없으면 표의 기본값. */
export type BindingTable = ReadonlyMap<string, number>;

export function readConstants(stage: StageDef): BindingTable {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return new Map(NUCLIDES.map((n) => [n.id, c[bindingKey(n.id)] ?? n.binding]));
}

function massNumberOf(id: string): number {
  const n = NUCLIDES.find((d) => d.id === id);
  if (!n) throw new Error(`stellar-nucleosynthesis: 없는 핵종 ${id}`);
  return n.massNumber;
}

/**
 * 곡선 판 위의 월드 자리. 가로는 ln(질량수) — 가벼운 원소가 몰린 자리를 벌려 계단을
 * 셀 수 있게 한다. 눈금 숫자를 두지 않으므로 가로에서 읽는 것은 **순서**뿐이다.
 */
export function plotPoint(massNumber: number, binding: number): Vec2 {
  return [
    PLOT.originX + Math.log(massNumber) * PLOT.perLnA,
    PLOT.originY + binding * PLOT.perMeV,
  ];
}

/** 핵종 하나의 곡선 위 자리. */
export function nuclidePoint(id: string, table: BindingTable): Vec2 {
  const b = table.get(id);
  if (b === undefined) throw new Error(`stellar-nucleosynthesis: 결합 에너지가 없는 핵종 ${id}`);
  return plotPoint(massNumberOf(id), b);
}

/** 곡선 전체 — 표의 핵종을 질량수 순서로 잇는다. */
export function curvePoints(table: BindingTable): Vec2[] {
  return NUCLIDES.map((n) => nuclidePoint(n.id, table));
}

export interface ShellReading {
  /** 이 겹이 중심에서 자라난 정도 0~1. 맨 바깥(수소)은 늘 1. */
  grown: number;
  /** 지금 자라는 겹인가 — 불꽃 테와 곡선 위 머리 점을 그릴 조건이다. */
  growing: boolean;
}

/**
 * 겹마다 읽는다. **단계 경계는 선언이 정한다** — 겹마다 단계 이름만 알고 그 진행도를
 * 시간표에게 묻는다(`at`). 모듈 상수와 견주어 가르지 않는다 (S-piece).
 */
export function readShells(tl: TimelineFrame): ShellReading[] {
  return SHELLS.map((s) => {
    if (!s.phase) return { grown: 1, growing: false };
    const grown = tl.at(s.phase);
    return { grown, growing: tl.phase === s.phase };
  });
}

/** 철 너머로 붙여 본 정도 0~1. */
export function wallProgress(tl: TimelineFrame): number {
  return tl.at('wall-try');
}

/** 곁말(철보다 무거운 원소)이 나타난 정도 0~1. */
export function beyondProgress(tl: TimelineFrame): number {
  return tl.at('beyond');
}

/** 이번 주기에서 쌓인 것이 흐려진 정도의 나머지 0~1. 마지막 단계에서 지우고 다시 쌓는다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StellarNucleosynthesisState }): StellarNucleosynthesisState {
  return params.state;
}
