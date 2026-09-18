// ========================================================================
// elastic-potential-energy — 순수 물리
// ========================================================================
// 공 하나를 받침판째 용수철 위에 얹고 x 만큼 눌렀다가 놓는다. 용수철은 질량이 없고,
// 공은 용수철이 원래 길이로 돌아오는 순간 떨어져 나간다.
//
// 놓은 자리(가장 눌린 자리)에서 정점까지 오른 높이를 H 라 하면 에너지 보존으로
//   ½·k·x² = m·g·H   →   H = (k/m)·x² / 2g
// 이다. 오른 높이를 **놓은 자리부터** 재야 비가 정확히 x² 을 따른다 — 용수철이 펴지는
// 동안에도 공은 이미 오르고 있어서, 원래 길이 자리부터 재면 두 배 누름이 4.x 배가 된다.
//
// 좌표 y 는 원래 길이에서 잰 공의 변위(위가 +). 눌린 동안은 음수다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import type { ElasticPotentialEnergyState } from './state';

export interface ElasticPotentialEnergyConstants {
  /** 중력 가속도(m/s²). */
  g: number;
  /** 용수철 상수 ÷ 공 질량 k/m (1/s²). 두 레인이 같다 — 같은 용수철, 같은 공. */
  stiffness: number;
  /** 왼쪽 · 오른쪽 레인을 누르는 깊이(m). 오른쪽이 정확히 두 배다. */
  pressSlow: number;
  pressDeep: number;
}

/**
 * 스테이지 상수를 읽는다. 없으면 던진다 — 기본값으로 조용히 넘어가면 선언과 화면이
 * 어긋난 채로 그려진다. 값은 `schema.ts` 의 스테이지 선언이 갖는다.
 */
export function readConstants(stage: StageDef): ElasticPotentialEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number | undefined>;
  const need = (k: keyof ElasticPotentialEnergyConstants): number => {
    const v = c[k];
    if (typeof v !== 'number') throw new Error(`elastic-potential-energy: 스테이지 상수 ${k} 가 없다`);
    return v;
  };
  return {
    g: need('g'),
    stiffness: need('stiffness'),
    pressSlow: need('pressSlow'),
    pressDeep: need('pressDeep'),
  };
}

/** 한 번 튀어 오르는 동안의 시각들. 모두 놓은 순간부터 잰 물리 시간(초). */
export interface Flight {
  /** 용수철이 원래 길이로 펴져 공이 떨어져 나가기까지. */
  push: number;
  /** 떨어져 나간 뒤 정점까지. */
  rise: number;
  /** 떨어져 나가는 순간의 속력(m/s). */
  launchSpeed: number;
  /** 놓은 뒤 정점까지 = push + rise. */
  peak: number;
  /** 한 번 튀어 올라 다시 가장 눌린 자리로 돌아오기까지 = 2·peak. */
  period: number;
  /** 놓은 자리부터 정점까지 오른 높이(m) = (k/m)·x²/2g. */
  height: number;
}

/**
 * 눌린 깊이 x 에서 놓았을 때의 한 번 튀어 오름. 닫힌 식이다.
 *
 * 닿아 있는 동안은 평형점 −g/ω² 둘레의 단진동 — y = y_e + (−x − y_e)·cos ωt 이고,
 * y = 0 이 되는 순간 떨어져 나간다. 그 뒤는 연직 위로 던진 운동이다.
 */
export function flightOf(x: number, g: number, stiffness: number): Flight {
  const w = Math.sqrt(stiffness);
  const ye = -g / stiffness;
  const push = Math.acos((0 - ye) / (-x - ye)) / w;
  const launchSpeed = Math.sqrt(Math.max(0, stiffness * x * x - 2 * g * x));
  const rise = launchSpeed / g;
  const peak = push + rise;
  return { push, rise, launchSpeed, peak, period: 2 * peak, height: (stiffness * x * x) / (2 * g) };
}

/**
 * 놓은 뒤 s 초가 지난 공의 변위(원래 길이 기준, 위가 +). 에너지를 잃지 않으므로 한 번
 * 튀어 오른 뒤 다시 x 만큼 눌렸다가 또 튀어 오른다 — `period` 로 되풀이한다.
 */
export function displacementAfterRelease(s: number, x: number, g: number, stiffness: number): number {
  const f = flightOf(x, g, stiffness);
  let q = s % f.period;
  // 내려오는 반쪽은 올라간 반쪽을 거꾸로 되짚는다.
  if (q > f.peak) q = f.period - q;
  if (q <= f.push) {
    const ye = -g / stiffness;
    return ye + (-x - ye) * Math.cos(Math.sqrt(stiffness) * q);
  }
  const a = q - f.push;
  return f.launchSpeed * a - 0.5 * g * a * a;
}

/** 한 레인을 지금 시각에 읽은 것. */
export interface LaneReading {
  /** 공의 변위(원래 길이 기준 m, 위가 +). 받침판도 공이 닿아 있는 동안 같이 간다. */
  y: number;
  /** 용수철 윗끝의 변위 = min(y, 0). 떨어져 나가면 원래 길이로 선다. */
  springTop: number;
  /** 지금까지 눌린 깊이(m). 누르는 동안 자라고, 그 뒤로는 기록으로 남는다. */
  pressed: number;
  /** 아직 누르고 있는가 — 누르는 힘 화살표를 그릴 조건이다. */
  holding: boolean;
  /** 이번 주기에 놓은 자리부터 가장 높이 오른 만큼(m). 정점을 지나면 H 로 선다. */
  risen: number;
  /** 정점을 지났는가. */
  peaked: boolean;
}

/**
 * 한 레인을 읽는다. **단계 경계는 선언이 정한다** — 누르는 진행도는 `at('press')`,
 * 놓는 순간은 `start('launch')` 로 시간표에게 묻는다 (S-piece 「시간표는 선언이다」).
 * 모듈 상수와 견주어 단계를 가르면 저작자가 `hold` 를 늘여도 물리가 따라가지 않는다.
 *
 * 놓은 뒤 흐른 시간이 0 이하인 동안은 `max(0, …)` 가 0 을 돌려 분기가 필요 없다 —
 * 그때 변위는 −x 그대로이고, 누르는 진행도가 1 보다 작으면 덜 눌린 자리다.
 */
export function readLane(tl: TimelineFrame, depth: number, c: ElasticPotentialEnergyConstants): LaneReading {
  const f = flightOf(depth, c.g, c.stiffness);
  const pressed = depth * tl.at('press');
  const released = Math.max(0, tl.u - tl.start('launch'));
  const holding = released === 0;
  const y = holding ? -pressed : displacementAfterRelease(released, depth, c.g, c.stiffness);
  // 이번 주기에 가장 높이 오른 만큼 — 정점을 지나면 H 에서 멈춘다(떨어지는 동안에도).
  const peaked = released >= f.peak;
  const risen = peaked ? f.height : holding ? 0 : y + depth;
  return { y, springTop: Math.min(y, 0), pressed, holding, risen, peaked };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 누른다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ElasticPotentialEnergyState }): ElasticPotentialEnergyState {
  return params.state;
}
