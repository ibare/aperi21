// ========================================================================
// two-body-problem — 순수 물리
// ========================================================================
// 두 천체(질량 m₁ ≥ m₂)가 원 궤도로 서로를 돈다. 질량 중심을 원점에 두면
//   r₁ = d · m₂ / (m₁ + m₂),   r₂ = d · m₁ / (m₁ + m₂)   (d 는 둘 사이 거리)
// 이라 m₁r₁ = m₂r₂ 이고, 둘은 원점을 사이에 두고 늘 반대편에 있다:
//   가벼운 쪽 = +r₂ · ê(θ),   무거운 쪽 = −r₁ · ê(θ)
// 둘의 각은 같은 θ 하나다 — 같은 주기로 돈다는 것이 식에서 이미 참이다.
//
// 질량 합과 d 를 그대로 두므로 케플러 제3법칙(T² ∝ d³ / M)의 주기도 그대로다. 그래서
// 질량비를 옮겨도 각속도는 하나로 둔다 — 바뀌는 것은 두 원의 몫(무거운 쪽 질량 몫 f)뿐이다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BODY_SCALE,
  MASS_EQUAL,
  MASS_HEAVY,
  MASS_LIGHT,
  MASS_MID,
  SEPARATION,
  START_ANGLE_DEG,
  TURNS_PER_CYCLE,
} from './schema';
import type { TwoBodyProblemState } from './state';

export interface TwoBodyProblemConstants {
  /** 두 천체 사이 거리(월드 단위). */
  separation: number;
  /** 가벼운 천체 질량(상대값). */
  massLight: number;
  /** 단계마다 무거운 천체 질량(상대값). */
  massEqual: number;
  massMid: number;
  massHeavy: number;
  /** 시간표 한 주기 동안의 바퀴 수. */
  turnsPerCycle: number;
  /** 천체 반지름 배율(월드 단위). */
  bodyScale: number;
  /** 주기 첫 순간 가벼운 천체의 자리(도). */
  startAngle: number;
}

export function readConstants(stage: StageDef): TwoBodyProblemConstants {
  const c = stage.constants ?? {};
  return {
    separation: c.separation ?? SEPARATION,
    massLight: c.massLight ?? MASS_LIGHT,
    massEqual: c.massEqual ?? MASS_EQUAL,
    massMid: c.massMid ?? MASS_MID,
    massHeavy: c.massHeavy ?? MASS_HEAVY,
    turnsPerCycle: c.turnsPerCycle ?? TURNS_PER_CYCLE,
    bodyScale: c.bodyScale ?? BODY_SCALE,
    startAngle: c.startAngle ?? START_ANGLE_DEG,
  };
}

/** 무거운 쪽 질량이 m 일 때 그 쪽의 질량 몫 m / (m + 가벼운 쪽). */
function heavyShare(c: TwoBodyProblemConstants, m: number): number {
  return m / (m + c.massLight);
}

/**
 * 지금 무거운 쪽의 질량 몫 f = m₁ / (m₁ + m₂).
 *
 * 머무는 단계에서는 선언한 질량비의 몫 그대로이고, 옮겨 가는 단계(`shift` · `deepen` ·
 * `back`)의 진행도만큼 다음 값으로 간다. 단계 경계는 시간표가 정한다 — `at()` 의 합으로
 * 읽을 뿐 시각을 상수와 견주지 않는다.
 */
export function heavyFraction(tl: TimelineFrame, c: TwoBodyProblemConstants): number {
  const fEqual = heavyShare(c, c.massEqual);
  const fMid = heavyShare(c, c.massMid);
  const fHeavy = heavyShare(c, c.massHeavy);
  return (
    fEqual +
    (fMid - fEqual) * tl.at('shift') +
    (fHeavy - fMid) * tl.at('deepen') +
    (fEqual - fHeavy) * tl.at('back')
  );
}

/** 지금 두 천체의 공통 각(rad). 한 주기에 `turnsPerCycle` 바퀴 — 주기 끝에서 이어진다. */
export function angleAt(tl: TimelineFrame, c: TwoBodyProblemConstants): number {
  return (c.startAngle * Math.PI) / 180 + (2 * Math.PI * c.turnsPerCycle * tl.u) / tl.period;
}

export interface PairReading {
  /** 무거운 천체의 궤도 반지름 r₁ = d · (1 − f). */
  heavyOrbit: number;
  /** 가벼운 천체의 궤도 반지름 r₂ = d · f. */
  lightOrbit: number;
  /** 무거운 천체 자리. 원점 너머 가벼운 쪽의 반대편이다. */
  heavyPos: Vec2;
  /** 가벼운 천체 자리. */
  lightPos: Vec2;
  /** 천체 반지름 — 밀도가 같다고 보고 질량 몫의 세제곱근에 비례시킨다. */
  heavySize: number;
  lightSize: number;
}

export function readPair(tl: TimelineFrame, c: TwoBodyProblemConstants): PairReading {
  const f = heavyFraction(tl, c);
  const theta = angleAt(tl, c);
  const e: Vec2 = [Math.cos(theta), Math.sin(theta)];
  const heavyOrbit = c.separation * (1 - f);
  const lightOrbit = c.separation * f;
  return {
    heavyOrbit,
    lightOrbit,
    heavyPos: [-e[0] * heavyOrbit, -e[1] * heavyOrbit],
    lightPos: [e[0] * lightOrbit, e[1] * lightOrbit],
    heavySize: c.bodyScale * Math.cbrt(f),
    lightSize: c.bodyScale * Math.cbrt(1 - f),
  };
}

/** 옮겨 가는 단계에서 앞 표시가 다 사라지고 다음 표시가 나타나기 시작하는 진행도. */
const CROSSFADE_SPLIT = 0.5;

/**
 * 질량비 표시 셋의 짙기. 머무는 단계에서는 그 단계의 표시 하나만 1 이고, 옮겨 가는 단계의
 * 앞 절반에 앞 표시가 사라지고 뒤 절반에 다음 표시가 나타난다 — 같은 자리에서 두 수가
 * 겹쳐 보이지 않게.
 */
export function ratioOpacity(tl: TimelineFrame): { equal: number; mid: number; heavy: number } {
  const out = (p: number): number => Math.max(0, 1 - p / CROSSFADE_SPLIT);
  const into = (p: number): number => Math.max(0, (p - CROSSFADE_SPLIT) / (1 - CROSSFADE_SPLIT));
  const shift = tl.at('shift');
  const deepen = tl.at('deepen');
  const back = tl.at('back');
  return {
    equal: out(shift) + into(back),
    mid: into(shift) - (1 - out(deepen)),
    heavy: into(deepen) - (1 - out(back)),
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TwoBodyProblemState }): TwoBodyProblemState {
  return params.state;
}
