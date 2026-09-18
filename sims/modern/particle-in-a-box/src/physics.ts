// ========================================================================
// particle-in-a-box — 순수 물리
// ========================================================================
// 무한 우물 [0, L] 의 정상 상태: ψₙ(x) = sin(nπx / L), Eₙ = n² E₁.
// 양 벽에서 ψ = 0 이 되려면 반파장 n 개가 L 에 맞아야 하고(λₙ = 2L / n),
// 운동 에너지 p² / 2m 과 p = h / λ 에서 에너지가 n² 로 오른다.
//
// 모든 것이 시각의 함수다 — 상태를 쌓지 않는다. 준위마다 오름 · 자라남 진행도는
// 시간표 선언에게 묻는다 (S-piece 「시간표는 선언이다」).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BOX_WIDTH, ENERGY_UNIT, LEVEL_COUNT, PSI_HEIGHT } from './schema';
import type { ParticleInABoxState } from './state';

export interface ParticleInABoxConstants {
  /** 우물 폭(월드). */
  boxWidth: number;
  /** E₁ 한 칸의 월드 높이. */
  energyUnit: number;
  /** 보일 준위 수. */
  levelCount: number;
  /** 준위 위에 얹는 ψ 의 높이(월드). */
  psiHeight: number;
}

export function readConstants(stage: StageDef): ParticleInABoxConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    boxWidth: c.boxWidth ?? BOX_WIDTH,
    energyUnit: c.energyUnit ?? ENERGY_UNIT,
    levelCount: c.levelCount ?? LEVEL_COUNT,
    psiHeight: c.psiHeight ?? PSI_HEIGHT,
  };
}

/** 준위 n 의 에너지(E₁ 단위). 정수의 제곱이라 반올림할 것이 없다. */
export function levelMultiple(n: number): number {
  return n * n;
}

/** 준위 n − 1 에서 n 으로 오르는 칸 수(E₁ 단위) = 2n − 1. */
export function gapMultiple(n: number): number {
  return levelMultiple(n) - levelMultiple(n - 1);
}

/** 준위 n 의 월드 높이. */
export function levelY(n: number, c: ParticleInABoxConstants): number {
  return levelMultiple(n) * c.energyUnit;
}

/** 정상 상태 n 의 파동 함수(최대 1). 양 벽 x = 0 · L 에서 0 이다. */
export function psi(x: number, n: number, c: ParticleInABoxConstants): number {
  return Math.sin((n * Math.PI * x) / c.boxWidth);
}

export interface LevelReading {
  /** 아래 준위에서 이 준위까지 오른 비율 0~1. 바닥 준위는 언제나 1. */
  climb: number;
  /** 이 준위에 ψ 가 자라난 비율 0~1. 바닥 준위는 언제나 1. */
  grow: number;
}

/**
 * 준위 n 의 지금 모습. 단계 id 는 `climb-n` · `grow-n` 이다 — 준위 수와 단계 목록은
 * 짝이라 상수만 바꾸면 없는 단계를 불러 엔진이 던진다 (장부 G13).
 */
export function readLevel(tl: TimelineFrame, n: number): LevelReading {
  if (n <= 1) return { climb: 1, grow: 1 };
  return { climb: tl.at(`climb-${n}`), grow: tl.at(`grow-${n}`) };
}

/** 위 준위들이 흐려진 정도 0~1. 주기 끝에서 바닥 준위 하나로 돌아간다. */
export function fadeOut(tl: TimelineFrame): number {
  return tl.at('fade');
}

/** 상태가 시계뿐인 조각 — 항등 step (S-sim). */
export function step(params: { state: ParticleInABoxState }): ParticleInABoxState {
  return params.state;
}
