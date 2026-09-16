// ========================================================================
// free-fall — 순수 물리
// ========================================================================
// 이 파일의 주제는 **질량이 들어갔다 사라지는 것**이다. `drop()` 의 두 줄을
// 한 줄(`a = g`)로 줄이면 조각이 말하려는 것이 코드에서 사라진다.
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';

import { CYCLE, HOLD, MASSES, M_LIGHT, STROBE, Y_LAND } from './schema';
import { newBall, type FreeFallBall, type FreeFallRung, type FreeFallState } from './state';

/** 스테이지가 준 중력가속도(m/s²). */
export function readG(stage: StageDef): number {
  return stage.constants.g ?? 9.8;
}

/** 이번 주기의 무거운 공 질량. 고른 것이 없으면 떨어뜨릴 때마다 차례로 바뀐다. */
export function resolveMass(choice: number | string, cyc: number): number {
  if (typeof choice === 'number') return choice;
  return MASSES[cyc % MASSES.length]!;
}

/**
 * 공 하나를 `dt` 만큼 떨어뜨린다.
 *
 * 무게(중력)는 무거울수록 크지만, 가속도로 바꾸는 순간 같은 `m` 으로 나뉘어 사라진다.
 * **두 줄을 한 줄로 줄이지 않는다** — 무게가 실제로 계산에 들어갔다가 나눗셈에서
 * 상쇄되는 것이 이 조각이 말하려는 것이다.
 *
 * 인자는 이 공의 것뿐이다. 다른 공의 상태를 받지 않는다.
 */
function drop(b: FreeFallBall, m: number, g: number, dt: number, tau: number): FreeFallBall {
  if (b.landed) return b;

  const F = m * g; // 이 공을 끌어내리는 힘 — 무거울수록 크다
  const a = F / m; // 그 힘이 만드는 가속도 — 나누면 m 이 지워진다

  const v = b.v + a * dt;
  const y = b.y - v * dt; // 월드는 위가 양수라 내려가는 만큼 뺀다

  if (y <= Y_LAND) return { y: Y_LAND, v: 0, landed: true, landTau: tau };
  return { y, v, landed: false, landTau: -1 };
}

export function step(params: {
  state: FreeFallState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): FreeFallState {
  const s = params.state;
  const dt = params.dt;
  const g = readG(params.stage);

  let tau = s.tau + dt;
  let cyc = s.cyc;
  let heavy = s.heavy;
  let light = s.light;
  let rungs: readonly FreeFallRung[] = s.rungs;
  let strobe = s.strobe;

  // 주기가 넘어가면 처음으로 돌아간다. 조각은 문단 옆에 늘 놓여 있어서 끝난 화면이
  // 남으면 할 말을 멈춘 것이 된다 (S-piece).
  if (tau >= CYCLE) {
    tau -= CYCLE;
    cyc += 1;
    heavy = newBall();
    light = newBall();
    rungs = [];
    strobe = 0;
  }

  // 아직 들고 있는 동안에는 조작기가 고른 무게가 바로 반영된다. 놓고 나면 이번
  // 낙하의 무게로 굳는다 — 떨어지는 도중에 딱지만 바뀌면 "숫자만 갈아 끼웠다" 로
  // 읽힌다 (NOTES 「원본과 달라진 점」).
  const heavyMass = tau < HOLD ? resolveMass(s.massChoice, cyc) : s.heavyMass;

  if (tau < HOLD) {
    return {
      ...s,
      tau,
      cyc,
      heavy,
      light,
      rungs,
      strobe,
      heavyMass,
      landedAs2: false,
      landedAs10: false,
      landedAs50: false,
    };
  }

  const before = heavy.landed;
  heavy = drop(heavy, heavyMass, g, dt, tau);
  light = drop(light, M_LIGHT, g, dt, tau);

  // 사다리 — 낙하 중 0.09 초마다 한 칸. 닿는 프레임에서 한 칸을 더 남겨 마지막
  // 칸이 바닥에 붙는다.
  if (!before) {
    strobe += dt;
    if (strobe >= STROBE || heavy.landed) {
      if (strobe >= STROBE) strobe -= STROBE;
      rungs = [...rungs, { yHeavy: heavy.y, yLight: light.y }];
    }
  }

  const landed = heavy.landed && light.landed;
  return {
    ...s,
    tau,
    cyc,
    heavy,
    light,
    rungs,
    strobe,
    heavyMass,
    landedAs2: landed && heavyMass === MASSES[0],
    landedAs10: landed && heavyMass === MASSES[1],
    landedAs50: landed && heavyMass === MASSES[2],
  };
}

/** 착지 울림의 나이(초). 아직 닿지 않았으면 `null`. */
export function landingAge(b: FreeFallBall, tau: number): number | null {
  if (!b.landed || b.landTau < 0) return null;
  return tau - b.landTau;
}
