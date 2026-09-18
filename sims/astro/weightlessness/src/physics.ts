// ========================================================================
// weightlessness — 순수 물리
// ========================================================================
// 정거장과 사람은 같은 중력 가속도 g' = g · (gPercent / 100) 를 받는다. 둘이 함께
// 떨어지면 서로에 대한 가속도가 0 이라 발이 저울을 누르지 않는다 — 저울 눈금 0.
// 정거장을 붙잡아 두면(가속도 0) 저울이 사람을 떠받쳐야 해서 눈금 = 지상 눈금 × g' / g.
// 저울은 지상 몸무게를 100 으로 둔 % 로 읽는다 — 붙잡힌 눈금이 곧 선언된 `gPercent` 다.
//
// 떨어진 거리는 ½ g' s² 꼴(진행도의 제곱)로 그린다. 크기는 화면 배치라 scene 이 준다.
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ALTITUDE_KM, EARTH_RADIUS_KM, G_PERCENT } from './schema';
import type { WeightlessnessState } from './state';

export interface WeightlessnessConstants {
  /** 지구 반지름(km). */
  earthRadiusKm: number;
  /** 정거장 고도(km). */
  altitudeKm: number;
  /** 그 높이의 중력 — 지상의 %. 선언값 그대로 화면에 쓴다. */
  gPercent: number;
}

export function readConstants(stage: StageDef): WeightlessnessConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    earthRadiusKm: c.earthRadiusKm ?? EARTH_RADIUS_KM,
    altitudeKm: c.altitudeKm ?? ALTITUDE_KM,
    gPercent: c.gPercent ?? G_PERCENT,
  };
}

/** 궤도 반지름 / 지구 반지름. 궤도 그림의 비율이다. */
export function orbitRatio(c: WeightlessnessConstants): number {
  return 1 + c.altitudeKm / c.earthRadiusKm;
}

/** 그 높이 중력의 지상 대비 비(0~1). 화살표 길이의 비가 된다. */
export function gRatio(c: WeightlessnessConstants): number {
  return c.gPercent / 100;
}

/** 정거장을 붙잡아 두었을 때 저울이 가리키는 값(지상 = 100) — 선언된 % 그대로. */
export function heldReading(c: WeightlessnessConstants): number {
  return c.gPercent;
}

/**
 * 정거장이 궤도를 도는 시간(초) — 주기 안 시각에서 붙잡혀 멈춘 동안(`catch` · `held`)을 뺀다.
 * 두 단계는 이징을 `catch` 에 걸었으므로 멈춘 시간은 진행도가 아니라 구간으로 잰다.
 */
export function movingTime(tl: TimelineFrame): number {
  const stopFrom = tl.start('catch');
  const stopTo = tl.end('held');
  if (tl.u <= stopFrom) return tl.u;
  if (tl.u >= stopTo) return tl.u - (stopTo - stopFrom);
  return stopFrom;
}

/**
 * 궤도 위 정거장의 각(rad). 도는 시간 전부를 합쳐 정확히 한 바퀴 — 주기 끝에서 제자리로
 * 이어진다. 붙잡는 순간의 각이 `holdAngle`(rad) 이 되도록 출발각을 되짚는다.
 */
export function orbitAngle(tl: TimelineFrame, holdAngle: number): number {
  const turning = tl.period - (tl.end('held') - tl.start('catch'));
  const omega = (2 * Math.PI) / turning;
  return holdAngle + omega * (movingTime(tl) - tl.start('catch'));
}

/**
 * 확대 그림에서 정거장(과 함께 있는 모든 것)이 내려간 거리. `fall` 동안 진행도의 제곱으로
 * `fallDrop` 까지, `release` 동안 거기서 `releaseDrop` 을 더 — 둘 다 등가속 낙하의 꼴이다.
 * `reset` 에서 처음 자리로 돌아간다.
 */
export function stationDrop(tl: TimelineFrame, fallDrop: number, releaseDrop: number): number {
  const f = tl.at('fall');
  const r = tl.at('release');
  const down = fallDrop * f * f + releaseDrop * r * r;
  return down * (1 - tl.at('reset'));
}

/**
 * 발과 저울 사이의 틈(0~1, 1 = 떠 있는 처음 틈). 함께 떨어지는 동안에는 그대로이고,
 * 붙잡힌 정거장에서만 사람이 저울로 내려앉는다(`catch`). 되돌리며 다시 떠오른다.
 */
export function footGap(tl: TimelineFrame): number {
  const settled = tl.at('catch');
  return Math.max(0, 1 - settled) + settled * tl.at('reset');
}

/**
 * 저울 눈금(지상 = 100). 함께 떨어지는 동안 0. 붙잡혀 사람이 내려앉는 동안 오르고,
 * 놓는 순간 곧바로 0 이다 — 떨어지기 시작하면 누르지 않는다.
 */
export function scaleReading(tl: TimelineFrame, c: WeightlessnessConstants): number {
  if (tl.phase === 'catch') return heldReading(c) * tl.at('catch');
  if (tl.phase === 'held') return heldReading(c);
  return 0;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WeightlessnessState }): WeightlessnessState {
  return params.state;
}
