// ========================================================================
// black-hole-horizon — 순수 물리
// ========================================================================
// 질량 M 은 그대로, 반지름 R 만 줄인다.
//
//   지평선 반지름   Rs = 2GM/c²
//   표면의 탈출 속도 v = √(2GM/R) = c · √(Rs/R)   — R = Rs 에서 정확히 c
//
// 뉴턴식 탈출 속도로 문턱을 정의하는 것은 근사다. 일반 상대론의 슈바르츠실트 반지름과 값이 우연히
// 같게 나올 뿐이고, 빛이 「올라갔다가 떨어진다」 는 그림도 뉴턴의 빛 알갱이 그림이다 — NOTES (b).
//
// 지평선 안(R < Rs)에서 바깥으로 쏜 빛은 반지름 방향 케플러 운동으로 푼다. 길이는 Rs, 시간은 Rs/c
// 단위로 두면 GM = 1/2, c = 1 이다. 에너지 ε = 1/2 − 1/(2R) < 0 이라 돌아온다.
//   r = a(1 − cos E),  t = √(a³/GM) (E − sin E),  a = GM / (−2ε)
// 가장 높이 오르는 곳은 2a = R/(1 − R). R = Rs/2 이면 정확히 지평선(1)이다.
// 모든 자리가 시각의 닫힌 식이라 쌓는 상태가 없다 — 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  BAR_LENGTH,
  GRAVITATIONAL_CONSTANT,
  HORIZON_LABEL_KM,
  HORIZON_WORLD,
  INSIDE_FACTOR,
  LIGHT_SPEED,
  LINEAR_UP_TO,
  RADIUS_1_KM,
  RADIUS_2_KM,
  RADIUS_3_KM,
  STAR_MASS_KG,
  WORLD_PER_DECADE,
} from './schema';
import type { BlackHoleHorizonState } from './state';

export interface BlackHoleHorizonConstants {
  gravitationalConstant: number;
  massKg: number;
  lightSpeed: number;
  /** 멈춰 서는 반지름 셋(km). 시간표의 `sun-*` · `dwarf-*` · `neutron-*` 과 같은 순서다. */
  stopRadiiKm: readonly number[];
  insideFactor: number;
  horizonLabelKm: number;
  horizonWorld: number;
  linearUpTo: number;
  worldPerDecade: number;
  barLength: number;
}

export function readConstants(stage: StageDef): BlackHoleHorizonConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravitationalConstant: c.gravitationalConstant ?? GRAVITATIONAL_CONSTANT,
    massKg: c.massKg ?? STAR_MASS_KG,
    lightSpeed: c.lightSpeed ?? LIGHT_SPEED,
    stopRadiiKm: [c.radius1Km ?? RADIUS_1_KM, c.radius2Km ?? RADIUS_2_KM, c.radius3Km ?? RADIUS_3_KM],
    insideFactor: c.insideFactor ?? INSIDE_FACTOR,
    horizonLabelKm: c.horizonLabelKm ?? HORIZON_LABEL_KM,
    horizonWorld: c.horizonWorld ?? HORIZON_WORLD,
    linearUpTo: c.linearUpTo ?? LINEAR_UP_TO,
    worldPerDecade: c.worldPerDecade ?? WORLD_PER_DECADE,
    barLength: c.barLength ?? BAR_LENGTH,
  };
}

/** 멈춤 하나를 이루는 세 단계 — 펄스 전 · 펄스 · 펄스 뒤. */
export interface StopPhases {
  readonly before: string;
  readonly pulse: string;
  readonly after: string;
}

/**
 * 멈춰 서는 단계 id. 스테이지 상수 `radius1Km`~`radius3Km` 와 한 줄씩 짝이다 — 목록을 선언할
 * 자리가 없다 (장부 G105). 이 멈춤에서는 `pulse` 단계 동안 표면에서 쏜 빛이 빠져나간다.
 */
export const STOP_PHASES: readonly StopPhases[] = [
  { before: 'sun-before', pulse: 'sun-pulse', after: 'sun-after' },
  { before: 'dwarf-before', pulse: 'dwarf-pulse', after: 'dwarf-after' },
  { before: 'neutron-before', pulse: 'neutron-pulse', after: 'neutron-after' },
];
/** 반지름을 줄이는 단계 id. `squeeze{i}` 는 멈춤 i 에서 다음 멈춤(마지막 둘은 지평선 · 그 안)으로 간다. */
export const SQUEEZE_PHASES = ['squeeze1', 'squeeze2', 'squeeze3', 'squeeze4'] as const;
/** 지평선 안에서 빛을 쏘는 멈춤의 세 단계 id. `pulse` 동안 빛이 떠나 표면으로 돌아온다. */
export const TRAPPED_PHASES: StopPhases = {
  before: 'trapped-before',
  pulse: 'trapped-pulse',
  after: 'trapped-after',
};
/** 표면이 지평선에 닿아 있는 단계 id. 이 단계부터 지평선 이름표가 선다. */
export const HORIZON_PHASE = 'horizon';
/** 흐려지는 단계 id. */
export const FADE_PHASE = 'fade';

/** 지평선 반지름 Rs = 2GM/c² (km). */
export function horizonRadiusKm(c: BlackHoleHorizonConstants): number {
  return (2 * c.gravitationalConstant * c.massKg) / (c.lightSpeed * c.lightSpeed) / 1000;
}

/**
 * 지금 별의 반지름 — 지평선 반지름 단위(x = R/Rs). 멈춤 사이는 로그 등간격으로 줄인다.
 * 단계 경계를 코드로 가르지 않는다 — 시간표의 `at()` 이 줄이기 단계마다 0 → 1 을 준다.
 */
export function starRadius(c: BlackHoleHorizonConstants, tl: TimelineFrame): number {
  const rs = horizonRadiusKm(c);
  const logs = [...c.stopRadiiKm.map((km) => Math.log(km / rs)), 0, Math.log(c.insideFactor)];
  let log = logs[0]!;
  SQUEEZE_PHASES.forEach((id, i) => {
    log += tl.at(id) * (logs[i + 1]! - logs[i]!);
  });
  return Math.exp(log);
}

/** 표면의 탈출 속도 / 광속 = √(Rs/R). */
export function escapeOverLight(x: number): number {
  return Math.sqrt(1 / x);
}

/**
 * 반지름(지평선 단위) → 중심에서의 월드 거리. `linearUpTo` 까지는 그대로 비례하고, 그 밖은
 * 한 자리수마다 `worldPerDecade` 만 는다 — 태양 크기와 지평선 근처를 한 화면에 담는 배치 계산이다.
 */
export function displayRadius(c: BlackHoleHorizonConstants, x: number): number {
  const k = c.horizonWorld;
  if (x <= c.linearUpTo) return k * x;
  return k * c.linearUpTo + c.worldPerDecade * Math.log10(x / c.linearUpTo);
}

/**
 * 지평선 원의 짙기 0~1. 별이 선형 구간(`linearUpTo`) 밖이면 0 — 눌러 그린 자리에서는 지평선과 별의
 * 비율이 거짓이라 원을 두지 않는다. 별이 선형 구간에 들어와 지평선에 닿을 때까지 차오른다.
 */
export function horizonOpacity(c: BlackHoleHorizonConstants, x: number): number {
  if (c.linearUpTo <= 1) return 1;
  return Math.min(1, Math.max(0, (c.linearUpTo - x) / (c.linearUpTo - 1)));
}

/** 지금 멈춤의 번호(0~2) — 펄스 전 · 펄스 · 펄스 뒤 모두. 멈춤이 아니면 null. */
export function currentStop(tl: TimelineFrame): number | null {
  const i = STOP_PHASES.findIndex((s) => tl.phase === s.before || tl.phase === s.pulse || tl.phase === s.after);
  return i < 0 ? null : i;
}

/**
 * 펄스 단계 안의 비행 진행도 0~1. 그 단계가 아니면 null(펄스가 없다). 단계 경계는 시간표가
 * 정한다 — 코드는 `at()` 을 읽기만 한다.
 */
export function flightProgress(tl: TimelineFrame, pulsePhase: string): number | null {
  return tl.phase === pulsePhase ? tl.at(pulsePhase) : null;
}

/** 흐려지는 단계의 짙기. */
export function fadeOpacity(tl: TimelineFrame): number {
  return 1 - tl.at(FADE_PHASE);
}

// ------------------------------------------------------------------------
// 지평선 안에서 쏜 빛 — 반지름 방향 케플러 운동 (GM = 1/2, c = 1)
// ------------------------------------------------------------------------

const GM = 0.5;
/** 이분법 반복 수. 2⁻⁶⁰ 이면 double 한계까지 좁혀진다. */
const BISECT_STEPS = 60;

/**
 * 반지름 R0(< 1, 지평선 단위)의 표면에서 광속으로 바깥에 쏜 빛의 거리. f 는 비행 진행도 0~1 —
 * 0 이 떠나는 순간, 1 이 표면으로 돌아오는 순간이다. 비행 안에서는 물리 시각에 비례한다.
 */
export function trappedRadius(r0: number, f: number): number {
  if (r0 >= 1) return r0;
  const eps = 0.5 - GM / r0;
  const a = GM / (-2 * eps);
  const kepler = (e: number): number => e - Math.sin(e);
  const e0 = Math.acos(1 - r0 / a);
  const e1 = 2 * Math.PI - e0;
  const target = kepler(e0) + f * (kepler(e1) - kepler(e0));
  let lo = e0;
  let hi = e1;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const m = (lo + hi) / 2;
    if (kepler(m) < target) lo = m;
    else hi = m;
  }
  const e = (lo + hi) / 2;
  return a * (1 - Math.cos(e));
}

/** 상태가 시계뿐이다 — 누적할 것이 없다. */
export function step(params: { state: BlackHoleHorizonState }): BlackHoleHorizonState {
  return params.state;
}
