// ========================================================================
// gravitational-potential-energy — 순수 물리
// ========================================================================
// 추 하나의 세 국면이다.
//   올림   — 같은 속력으로 목표 높이 H 까지. 속도는 그리지 않는다(느린 일정한 올림).
//   떨어짐 — 자유 낙하. 밑면 = 기준 + H − ½gs²,  속력 = g·s
//   박힘   — 말뚝 머리를 때린 뒤 말뚝과 함께 등감속. 땅이 R 로 붙잡고 무게가 mg 로
//            보태므로 감속은 (R/mg − 1)·g, 멈출 때까지 박힌 깊이는 H/(R/mg − 1).
// 말뚝은 가볍다고 본다 — 때리는 순간 추와 함께 움직이고, 부딪힘에서 잃는 몫이 없다.
// 그래야 「높이에 담긴 것이 그대로 말뚝에 간다」 가 화면에서 참이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { GRAVITY, H_HIGH, H_LOW, RESIST_RATIO, STAKE_TOP_0 } from './schema';
import type { GravitationalPotentialEnergyState } from './state';

export interface GravitationalPotentialEnergyConstants {
  /** 중력 가속도(m/s²). */
  gravity: number;
  /** 왼쪽 · 오른쪽 추를 들어 올리는 높이(m). */
  hLow: number;
  hHigh: number;
  /** 땅이 붙잡는 힘 / 추의 무게. 1 보다 커야 말뚝이 멈춘다. */
  resistRatio: number;
}

export function readConstants(stage: StageDef): GravitationalPotentialEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravity: c.gravity ?? GRAVITY,
    hLow: c.hLow ?? H_LOW,
    hHigh: c.hHigh ?? H_HIGH,
    resistRatio: c.resistRatio ?? RESIST_RATIO,
  };
}

export interface WeightReading {
  /** 추 밑면의 월드 y. */
  bottom: number;
  /** 말뚝 머리의 월드 y. 박히기 전에는 처음 자리다. */
  stakeTop: number;
  /** 지금 들어 올린 높이(m) — 처음 말뚝 머리에서 추 밑면까지. 올리는 동안만 자란다. */
  lifted: number;
  /** 목표 높이에 다다랐는가 — 높이 이름표를 거는 조건이다. */
  reached: boolean;
  /** 놓았는가 — 줄에서 떨어졌다. */
  released: boolean;
  /** 떨어지거나 박히는 중의 속력(m/s). 매달려 있거나 멈추면 0. */
  speed: number;
  /** 말뚝이 다 박혀 멈췄는가 — 깊이 이름표를 거는 조건이다. */
  stopped: boolean;
}

/**
 * 추 하나를 읽는다. **단계 경계는 선언이 정한다** — 올리는 두 단계의 진행도와 떨어지는
 * 단계가 시작하는 시각을 `timeline` 에게 묻는다 (S-piece 「시간표는 선언이다」). 모듈
 * 상수와 견주어 단계를 가르면 저작자가 `hold` 를 늘여도 물리가 따라가지 않는다.
 *
 * 올리는 몫은 두 단계에 나눠 싣는다. 왼쪽 추(H = hLow)는 `lift-more` 몫이 0 이라 그
 * 단계 동안 매달린 채 서 있고, 오른쪽 추는 같은 속력으로 계속 올라간다.
 *
 * 놓은 뒤는 물리가 정한다 — 땅에 닿는 순간도 멈추는 순간도 단계 경계가 아니라 √(2H/g) ·
 * v/a 다. 두 추가 **같은 순간** 놓인다.
 */
export function readWeight(
  tl: TimelineFrame,
  height: number,
  c: GravitationalPotentialEnergyConstants,
): WeightReading {
  const firstLeg = Math.min(height, c.hLow);
  const secondLeg = Math.max(0, height - c.hLow);
  const lifted = firstLeg * tl.at('lift-both') + secondLeg * tl.at('lift-more');
  const reached = lifted >= height - 1e-9;

  // 놓은 뒤 흐른 시간. `drop` 이 시작하기 전에는 0 이다.
  const elapsed = Math.max(0, tl.u - tl.start('drop'));
  const released = elapsed > 0;
  if (!released) {
    return {
      bottom: STAKE_TOP_0 + lifted,
      stakeTop: STAKE_TOP_0,
      lifted,
      reached,
      released,
      speed: 0,
      stopped: false,
    };
  }

  const g = c.gravity;
  const fall = Math.sqrt((2 * height) / g);
  if (elapsed < fall) {
    return {
      bottom: STAKE_TOP_0 + height - 0.5 * g * elapsed * elapsed,
      stakeTop: STAKE_TOP_0,
      lifted: height,
      reached: true,
      released,
      speed: g * elapsed,
      stopped: false,
    };
  }

  const hit = g * fall;
  const decel = (c.resistRatio - 1) * g;
  const stopTime = hit / decel;
  const s = Math.min(elapsed - fall, stopTime);
  const driven = hit * s - 0.5 * decel * s * s;
  return {
    bottom: STAKE_TOP_0 - driven,
    stakeTop: STAKE_TOP_0 - driven,
    lifted: height,
    reached: true,
    released,
    speed: Math.max(0, hit - decel * s),
    stopped: elapsed - fall >= stopTime,
  };
}

/** 이번 주기에서 그림이 보이는 정도 0~1. 처음에 떠오르고 마지막에 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GravitationalPotentialEnergyState }): GravitationalPotentialEnergyState {
  return params.state;
}
