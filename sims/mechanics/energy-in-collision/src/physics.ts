// ========================================================================
// energy-in-collision — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 같은 질량 m 두 수레, 뒤 수레는 서 있다. 속력은 처음 속력 v 에 대한 몫으로 센다.
//
//   눌림    uA = 1 − p/2 ,        uB = p/2              (p: 0 → 1, 세 줄이 같다)
//   되밀림  uA = ½ − e·q/2 ,      uB = ½ + e·q/2        (q: 0 → 1, e 만큼 돌려받는다)
//
//   운동량  m·v·(uA + uB) = m·v                          언제나 그대로
//   운동 에너지  ½mv²·(uA² + uB²)                         눌림 끝에서 ½, 되밀림 끝에서 (1+e²)/2
//
// 부딪히는 동안 오간 충격량이 진행도에 비례한다고 둔 것이다. 그래서 속력이 진행도에
// 대해 곧게 바뀌고, 네모의 한 변이 곧게 자라거나 줄어든다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { A_START_X, B_REST_X, CART_W, RESTITUTION } from './schema';
import type { EnergyInCollisionState } from './state';

export interface EnergyInCollisionConstants {
  /** 세 줄의 반발 계수(위에서부터). */
  restitution: readonly [number, number, number];
}

export function readConstants(stage: StageDef): EnergyInCollisionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    restitution: [
      c.restitutionTop ?? RESTITUTION[0],
      c.restitutionMiddle ?? RESTITUTION[1],
      c.restitutionBottom ?? RESTITUTION[2],
    ],
  };
}

/** 달려오는 수레가 서 있는 수레에 닿는 순간의 중심 x. */
export const CONTACT_X = B_REST_X - CART_W;

export interface LaneReading {
  /** 두 수레의 중심 x(월드). */
  xA: number;
  xB: number;
  /** 두 수레의 속력 — 처음 속력에 대한 몫. 장부 네모의 한 변이자 화살표 길이다. */
  uA: number;
  uB: number;
  /** 처음 운동 에너지에 대해 지금 운동 에너지로 남지 않은 몫(0~1). */
  missing: number;
}

export interface Reading {
  lanes: LaneReading[];
  /** 빈자리를 빗금(찌그러짐에 든 몫)으로 칠하는 정도. 걷히면 0. */
  stored: number;
  /** 빈자리에 「사라진 몫」 이름이 드는 정도. */
  lostLabel: number;
  /** 수레 · 장부의 불투명도. 나타나고 물러난다. */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계의 진행도를 준다
 * (단계 앞에서는 0, 지난 뒤에는 1).
 */
export function derive(tl: TimelineFrame, c: EnergyInCollisionConstants): Reading {
  const approach = tl.at('approach');
  const p = tl.at('compress');
  const q = tl.at('restore');

  // 달려오는 빠르기(월드/초). 출발 자리에서 닿는 자리까지를 `approach` 동안 간다 —
  // 단계 길이를 바꾸면 빠르기가 따라온다.
  const speed = (CONTACT_X - A_START_X) / tl.duration('approach');

  // 눌림 · 되밀림은 조각 시계로 짧아(느리게 흘려 본다) 그동안 한 쌍은 공통 속력으로
  // 거의 제자리다. 붙은 채로 무게중심 속력(½v)만큼 옮긴다 — 실제의 찌그러짐 깊이는
  // 화면에서 몇 px 이라, 겹쳐 그리면 「파고든다」 는 없는 모양이 생긴다.
  const contactTime = p * tl.duration('compress') + q * tl.duration('restore');
  const pairShift = 0.5 * speed * contactTime;

  // 떨어진 뒤 흐른 시간 — `release` · `reveal` · `coast` 동안 굴러간다.
  const after =
    tl.at('release') * tl.duration('release') +
    tl.at('reveal') * tl.duration('reveal') +
    tl.at('coast') * tl.duration('coast');

  const lanes = c.restitution.map((e): LaneReading => {
    let uA: number;
    let uB: number;
    if (q > 0) {
      uA = 0.5 - (e * q) / 2;
      uB = 0.5 + (e * q) / 2;
    } else {
      uA = 1 - p / 2;
      uB = p / 2;
    }
    const xA0 = A_START_X + (CONTACT_X - A_START_X) * approach + pairShift;
    const xA = xA0 + uA * speed * after;
    const xB = xA0 + CART_W + uB * speed * after;
    return {
      xA,
      xB: approach < 1 ? B_REST_X : xB,
      uA,
      uB,
      missing: Math.max(0, 1 - uA * uA - uB * uB),
    };
  });

  return {
    lanes,
    stored: 1 - tl.at('release'),
    lostLabel: tl.at('reveal'),
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: EnergyInCollisionState }): EnergyInCollisionState {
  return params.state;
}
