// ========================================================================
// work-energy-theorem — 순수 물리
// ========================================================================
// 정지에서 출발해 일정한 힘 F 로 거리 D 만큼 밀린 뒤 그대로 달린다. 마찰이 없어
// 미는 힘이 곧 알짜힘이다.
//   밀리는 동안  x = ½·(F/m)·s²,  속력 = (F/m)·s          (s ≤ T = √(2mD/F))
//   그 뒤        x = D + v·(s − T), 속력 = v = √(2FD/m)
// 끝 속력이 F·D(한 일)에만 달려 있어, 2F × d 와 F × 2d 는 같은 v 를 낸다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DIST_LONG, DIST_SHORT, FORCE_BIG, FORCE_SMALL, MASS } from './schema';
import type { WorkEnergyTheoremState } from './state';

export interface WorkEnergyTheoremConstants {
  mass: number;
  /** 위 수레: 힘(N) · 민 거리(m). */
  forceBig: number;
  distShort: number;
  /** 아래 수레: 힘(N) · 민 거리(m). */
  forceSmall: number;
  distLong: number;
}

export function readConstants(stage: StageDef): WorkEnergyTheoremConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    mass: c.mass ?? MASS,
    forceBig: c.forceBig ?? FORCE_BIG,
    distShort: c.distShort ?? DIST_SHORT,
    forceSmall: c.forceSmall ?? FORCE_SMALL,
    distLong: c.distLong ?? DIST_LONG,
  };
}

export interface CartReading {
  /** 출발점에서 온 거리(m) — 수레 중심의 월드 x 이기도 하다(출발점이 0). */
  x: number;
  /** 지금 속력(m/s). */
  speed: number;
  /** 밀리는 중인가 — 미는 힘 화살표를 그릴 조건이다. */
  pushed: boolean;
  /** 밀기가 끝났는가 — 속도 화살표에 끝 속력 기호를 붙일 조건이다. */
  released: boolean;
  /** 지금까지 한 일의 거리 몫(m). 0 ~ D. 일 칸이 이만큼 칠해진다. */
  workedDist: number;
}

/**
 * 수레 하나를 읽는다. **단계 경계는 선언이 정한다** — 밀기가 시작되는 시각을
 * `timeline` 에게 묻는다(`start('push-both')`). 밀기가 **끝나는** 것은 단계 경계가 아니라
 * 물리다 — 수레가 제 거리 D 를 다 갔을 때(√(2mD/F)). 그래서 저작자가 `push-both` 를
 * 늘여도 수레는 d 에서 밀기를 마치고, 캡션만 늦게 바뀐다.
 */
export function readCart(
  tl: TimelineFrame,
  force: number,
  dist: number,
  mass: number,
): CartReading {
  const a = force / mass;
  const pushTime = Math.sqrt((2 * dist) / a);
  const vFinal = a * pushTime;
  const s = Math.max(0, tl.u - tl.start('push-both'));
  if (s <= pushTime) {
    return {
      x: 0.5 * a * s * s,
      speed: a * s,
      pushed: s > 0,
      released: false,
      workedDist: 0.5 * a * s * s,
    };
  }
  return {
    x: dist + vFinal * (s - pushTime),
    speed: vFinal,
    pushed: false,
    released: true,
    workedDist: dist,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 수레를 지우고 다시 세운다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WorkEnergyTheoremState }): WorkEnergyTheoremState {
  return params.state;
}
