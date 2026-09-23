// ========================================================================
// free-fall — 상태
// ========================================================================
// 두 공은 **각자** 적분한다. 서로의 값을 한 번도 읽지 않는다 — 나란함이
// "맞춰 준 것" 이 되는 순간 이 조각은 주장을 잃는다.
// ========================================================================

import { AUTO, MASSES, Y_TOP } from './schema';

/** 공 하나. 원본 `newBall()`. */
export interface FreeFallBall {
  /** 중심의 높이(m). 월드는 위가 양수다. */
  y: number;
  /** **아래로** 향하는 속력(m/s). 원본과 같은 부호 규약. */
  v: number;
  landed: boolean;
  /** 닿은 주기 안 시각(초). 아직이면 −1. 착지 울림의 나이가 여기서 나온다. */
  landTau: number;
}

/** 지나온 높이 한 칸 — 같은 시각의 두 공. 가로 자리는 고정이라 담지 않는다. */
export interface FreeFallRung {
  yHeavy: number;
  yLight: number;
}

export interface FreeFallState {
  /**
   * 이번 주기 안에서 흐른 시간(초).
   *
   * 시간표(`schema.timeline`)와 **같은 상수**로 도는 두 번째 시계다. `Bundle.step` 이
   * 시간표를 받지 않아서 생긴 것이고, 둘 다 러너가 주는 같은 `dt` 를 더하므로
   * 어긋나지 않는다 (`newtons-first-law` 과 같은 모양).
   */
  tau: number;
  /** 몇 번째로 떨어뜨리는 중인가. "차례로 바꾸기" 가 이 수를 본다. */
  cyc: number;

  heavy: FreeFallBall;
  light: FreeFallBall;

  /** 낙하 사다리. 낙하가 끝나면 통째로 남고, 주기가 넘어가면 비운다. */
  rungs: readonly FreeFallRung[];
  /** 다음 칸까지 쌓인 시간(초). */
  strobe: number;

  /** 조작기가 고른 것. `AUTO` 면 떨어뜨릴 때마다 스스로 순환한다. */
  massChoice: number | string;
  /** 이번에 떨어뜨리는 무거운 공의 질량(kg). 놓는 순간 굳는다. */
  heavyMass: number;

  /**
   * 캡션이 보는 자리. 두 공이 **모두** 내려섰고 무거운 쪽이 그 무게였는가.
   *
   * 셋으로 갈라 둔 것은 캡션 슬롯에 `vars` 가 없기 때문이다 — 문안 하나에 값을
   * 끼울 수 있으면 boolean 하나로 족하다 (NOTES 「어휘 부족」).
   */
  landedAs2: boolean;
  landedAs10: boolean;
  landedAs50: boolean;
}

/** 들려 있는 공. */
export function newBall(): FreeFallBall {
  return { y: Y_TOP, v: 0, landed: false, landTau: -1 };
}

export function initialState(): FreeFallState {
  return {
    tau: 0,
    cyc: 0,
    heavy: newBall(),
    light: newBall(),
    rungs: [],
    strobe: 0,
    massChoice: AUTO,
    heavyMass: MASSES[0],
    landedAs2: false,
    landedAs10: false,
    landedAs50: false,
  };
}
