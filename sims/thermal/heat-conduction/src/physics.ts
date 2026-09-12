// ========================================================================
// heat-conduction — 순수 물리
// ========================================================================
// 1차원 열확산 ∂θ/∂t = α ∂²θ/∂x² 를 노드 N+1 개 격자에서 explicit 유한차분으로
// 푼다. 왼쪽 끝은 고정 온도(버너), 오른쪽 끝은 단열, 두 막대의 코드는 완전히
// 같고 α 만 다르다.
// ========================================================================

import {
  A_STEEL,
  DX,
  FLOOR,
  GRAVITY,
  N,
  ROD_MM,
  SEC_PER_SEC,
  STABILITY,
  THETA_MELT,
} from './schema';
import type { Bead, HeatConductionState, Rod } from './state';

/**
 * 이 걸음을 안정하게 밟는 데 필요한 서브스텝 수.
 *
 * 원본은 12 를 손으로 계산해 박아 두고 "재질이나 격자를 건드릴 때마다 다시
 * 계산할 값" 이라고 적었다. 여기서는 안정조건에서 뽑는다.
 *
 * **가장 빠른 막대가 정하고 두 막대가 그 수를 함께 쓴다.** 서브스텝을 막대마다
 * 따로 잡으면 적분기가 둘이 되고, 그러면 "같은 코드로 돌았다" 는 이 조각의
 * 산출물이 깨진다 — 대조 쌍은 조건이 같다는 것을 화면이 스스로 보증해야 선다.
 */
export function substeps(dtPhys: number): number {
  const r = (A_STEEL * dtPhys) / (DX * DX);
  return Math.max(1, Math.ceil(r / STABILITY));
}

/** 한 걸음의 확산. 입력 배열을 건드리지 않는다. */
export function diffuse(
  T: readonly number[],
  alpha: number,
  dtPhys: number,
  sub: number,
): number[] {
  const dts = dtPhys / sub;
  const r = (alpha * dts) / (DX * DX);

  let cur = T.slice();
  let next = new Array<number>(N + 1).fill(0);
  for (let s = 0; s < sub; s++) {
    // 데운 끝 — 고정 온도.
    next[0] = 1;
    for (let i = 1; i < N; i++) {
      next[i] = cur[i]! + r * (cur[i + 1]! - 2 * cur[i]! + cur[i - 1]!);
    }
    // 반대쪽 끝 — 단열. 열이 더 갈 데가 없어 여기서 쌓인다.
    next[N] = cur[N]! + r * 2 * (cur[N - 1]! - cur[N]!);
    const tmp = cur;
    cur = next;
    next = tmp;
  }
  return cur;
}

/** 배열에서 임의 지점(mm)의 온도를 선형보간해 뽑는다. */
export function thetaAt(T: readonly number[], xmm: number): number {
  const p = xmm / DX;
  const i = Math.min(N - 1, Math.floor(p));
  const f = p - i;
  return T[i]! * (1 - f) + T[i + 1]! * f;
}

/**
 * 60 ℃ 가 닿은 가장 먼 지점(mm).
 *
 * 구슬은 15 mm 마다 찍히는 이산 사건이라 그 사이에 아무 일도 없어 보인다. 이
 * 값이 그 사이를 잇는다 — 화면의 앞머리 선과 캡션이 **같은 값**에서 나온다.
 */
export function frontMm(T: readonly number[]): number {
  for (let i = 1; i <= N; i++) {
    if (T[i]! < THETA_MELT) {
      const f = (T[i - 1]! - THETA_MELT) / (T[i - 1]! - T[i]!);
      return (i - 1 + f) * DX;
    }
  }
  return ROD_MM;
}

/** 앞머리가 닿은 거리(cm). 캡션과 화면이 같은 값을 쓴다. */
export function frontCm(rod: Rod): number {
  return rod.front / 10;
}

/**
 * 구슬 하나를 전진시킨다.
 *
 * 문턱을 넘으면 촉발되고 **돌아오지 않는다.** 그 뒤로는 중력을 적분하다 바닥에서
 * 멈춘다 — 멈춘 구슬은 지워지지 않아서, 늦게 온 독자도 지나간 일을 셀 수 있다.
 */
function advanceBead(b: Bead, T: readonly number[], dt: number): Bead {
  const released = b.released || thetaAt(T, b.xmm) >= THETA_MELT;
  if (!released) return b;
  if (b.y >= FLOOR) return b.released ? b : { ...b, released };

  let vy = b.vy + GRAVITY * dt;
  let y = b.y + vy * dt;
  const rot = b.rot + b.vrot * dt;
  if (y >= FLOOR) {
    y = FLOOR;
    vy = 0;
  }
  return { ...b, released, y, vy, rot };
}

/** 한 스텝 전진. 순수 함수 — DOM·캔버스·시간을 모른다. */
export function step(params: { state: HeatConductionState; dt: number }): HeatConductionState {
  const { state, dt } = params;
  if (!(dt > 0)) return state;

  const dtPhys = dt * SEC_PER_SEC;
  const sub = substeps(dtPhys);

  const rods = state.rods.map((rod): Rod => {
    const T = diffuse(rod.T, rod.alpha, dtPhys, sub);
    return {
      ...rod,
      T,
      front: frontMm(T),
      beads: rod.beads.map((b) => advanceBead(b, T, dt)),
    };
  });

  const steel = rods[0]!;
  const wood = rods[1]!;
  return {
    t: state.t + dt,
    rods,
    // 캡션이 보는 자리. 조건을 세는 것은 여기(physics)이고 선언은 이름만 가리킨다.
    steelThrough: steel.beads.every((b) => b.released),
    woodFell: wood.beads.some((b) => b.released),
  };
}
