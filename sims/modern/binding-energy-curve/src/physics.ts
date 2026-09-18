// ========================================================================
// binding-energy-curve — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 곡선 · 점 · 화살표는 모두 스테이지 상수와 시간표 진행도의
// 함수다. `step` 은 항등이다.
//
// 좌표 — 가로는 질량수 그대로, 세로는 핵자당 결합 에너지(MeV). 질량수를 로그로 펴지
// 않는 것이 이 조각의 선택이다: 수소 쪽 오르막이 가파르고 철 너머 내리막이 길고
// 완만한 참 모양이 그대로 보여야 「철이 꼭짓점」 이 읽힌다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { FUSE_COUNT, NUCLIDES, PEAK_MEV, PLOT, bindingKey, type NuclideDef } from './schema';
import type { BindingEnergyCurveState } from './state';

export interface BindingEnergyCurveConstants {
  /** 핵종 id → 핵자당 결합 에너지(MeV). */
  binding: Readonly<Record<string, number>>;
  fuseCount: number;
  peakMeV: number;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * 융합의 질량수가 맞지 않으면 던진다 — 수소 `fuseCount` 개가 헬륨-4 하나가 되어야 한다.
 */
export function readConstants(stage: StageDef): BindingEnergyCurveConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const binding: Record<string, number> = {};
  for (const n of NUCLIDES) binding[n.id] = c[bindingKey(n.id)] ?? n.binding;
  const k: BindingEnergyCurveConstants = {
    binding,
    fuseCount: c.fuseCount ?? FUSE_COUNT,
    peakMeV: c.peakMeV ?? PEAK_MEV,
  };
  if (k.fuseCount !== nuclide('He4').massNumber / nuclide('H1').massNumber) {
    throw new Error('binding-energy-curve: 수소 fuseCount 개의 질량수가 헬륨-4 와 같아야 한다');
  }
  return k;
}

export function nuclide(id: string): NuclideDef {
  const n = NUCLIDES.find((x) => x.id === id);
  if (!n) throw new Error(`binding-energy-curve: 핵종 표에 없는 id — ${id}`);
  return n;
}

/** (질량수, 결합 에너지) → 월드. */
export function plotPoint(massNumber: number, binding: number): Vec2 {
  return [massNumber * PLOT.perA, binding * PLOT.perMeV];
}

export function nuclidePoint(id: string, k: BindingEnergyCurveConstants): Vec2 {
  return plotPoint(nuclide(id).massNumber, k.binding[id]!);
}

/** 곡선 — 안정한 핵종을 질량수 순으로 잇는다. */
export function curvePoints(k: BindingEnergyCurveConstants): Vec2[] {
  return NUCLIDES.filter((n) => n.onCurve)
    .slice()
    .sort((a, b) => a.massNumber - b.massNumber)
    .map((n) => plotPoint(n.massNumber, k.binding[n.id]!));
}

/** 곡선 위 질량수 `a` 의 높이(MeV) — 곡선 표본 사이를 곧게 잇는다. */
export function curveAt(a: number, k: BindingEnergyCurveConstants): number {
  const pts = NUCLIDES.filter((n) => n.onCurve)
    .slice()
    .sort((x, y) => x.massNumber - y.massNumber);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]!;
    const q = pts[i]!;
    if (a <= q.massNumber) {
      const u = (a - p.massNumber) / (q.massNumber - p.massNumber);
      return k.binding[p.id]! + (k.binding[q.id]! - k.binding[p.id]!) * Math.max(0, u);
    }
  }
  return k.binding[pts[pts.length - 1]!.id]!;
}

/**
 * 여러 조각의 핵자당 결합 에너지 평균(MeV) — 핵자 수로 무게를 단다. 분열 뒤 핵자 하나가
 * 평균으로 얼마나 올랐는지가 오른 높이 화살표의 끝이다. 화면에 수로 띄우지 않는다.
 */
export function meanBinding(ids: readonly string[], k: BindingEnergyCurveConstants): number {
  let a = 0;
  let b = 0;
  for (const id of ids) {
    const m = nuclide(id).massNumber;
    a += m;
    b += m * k.binding[id]!;
  }
  return b / a;
}

export function step(params: { state: BindingEnergyCurveState }): BindingEnergyCurveState {
  return params.state;
}
