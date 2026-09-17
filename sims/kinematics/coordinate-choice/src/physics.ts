// ========================================================================
// coordinate-choice — 순수 물리와 투영
// ========================================================================
// 좌표는 **원본 캔버스 픽셀**(패널 안, y 아래로)이다. 원본의 계산을 한 줄씩 대조할 수
// 있게 그대로 두고, 월드(m, y 위)로 옮기는 것은 scene 이 한 곳에서 한다. 투영은
// 선형 변환에 대해 보존되므로 어느 좌표에서 계산해도 같은 자리다.
// ========================================================================

import {
  A_SLOPE,
  BLOCK_PX,
  D0_PX,
  LX_AXIS_BELOW_PX,
  LY_AXIS_X_PX,
  PX_PER_M,
  RY_ALONG_PX,
  R_OFF_PX,
  SLOPE_LEN_PX,
  STAMP_DT,
  THETA,
  TOP_PX,
} from './schema';
import type { CoordinateChoiceState } from './state';

/** 캔버스 좌표의 점(px, y 아래로). */
export interface PxPoint {
  readonly x: number;
  readonly y: number;
}

const c = Math.cos(THETA);
const s = Math.sin(THETA);

/** 빗면 아래 방향 단위벡터(캔버스). */
export const U: PxPoint = { x: c, y: s };
/** 빗면에서 바깥(위) 방향 단위벡터(캔버스). */
export const N_UP: PxPoint = { x: s, y: -c };

export const TOP: PxPoint = TOP_PX;
export const BOT: PxPoint = { x: TOP.x + SLOPE_LEN_PX * c, y: TOP.y + SLOPE_LEN_PX * s };

/** 왼쪽 패널 x 축의 세로 자리. */
export const LX_AXIS_Y = BOT.y + LX_AXIS_BELOW_PX;
/** 왼쪽 패널 y 축의 가로 자리. */
export const LY_AXIS_X = LY_AXIS_X_PX;
/** 오른쪽 패널 x′ 축의 원점 — 빗면 꼭대기에서 빗면에 수직으로 40 px 아래. */
export const RX0: PxPoint = { x: TOP.x - R_OFF_PX * s, y: TOP.y + R_OFF_PX * c };
/** 오른쪽 패널 y′ 축이 x′ 축과 만나는 자리. */
export const RY_BASE: PxPoint = { x: RX0.x + RY_ALONG_PX * c, y: RX0.y + RY_ALONG_PX * s };

export function add(p: PxPoint, d: PxPoint, k = 1): PxPoint {
  return { x: p.x + d.x * k, y: p.y + d.y * k };
}

/**
 * 빗면을 따라 간 거리(px). `tau` 는 출발 뒤 흐른 시간(초) — 호출부가 미끄럼 구간
 * 안으로 잘라 넘긴다.
 */
export function alongAt(tau: number): number {
  const tt = Math.max(tau, 0);
  return D0_PX + 0.5 * A_SLOPE * tt * tt * PX_PER_M;
}

/** 물체 중심 — 빗면 위에 반 변만큼 올라앉는다. */
export function blockCenter(d: number): PxPoint {
  return add(add(TOP, U, d), N_UP, BLOCK_PX / 2);
}

/** 축 하나 — 위치를 축 위로 내리는 투영과, 발자국을 비껴 놓을 바깥쪽 방향. */
export interface AxisDef {
  id: 'x' | 'y' | 'xp' | 'yp';
  /** 점을 이 축 위로 내린다. */
  project(p: PxPoint): PxPoint;
  /** 축 바깥쪽 단위벡터(캔버스) — 물체가 있는 쪽의 반대. 발자국이 이쪽에 선다. */
  outward: PxPoint;
}

/** 왼쪽 패널 — 수평·수직 축. */
export const LEFT_AXES: readonly AxisDef[] = [
  { id: 'x', project: (p) => ({ x: p.x, y: LX_AXIS_Y }), outward: { x: 0, y: 1 } },
  { id: 'y', project: (p) => ({ x: LY_AXIS_X, y: p.y }), outward: { x: -1, y: 0 } },
];

/** 오른쪽 패널 — 빗면 방향(x′)과 빗면에 수직(y′) 축. */
export const RIGHT_AXES: readonly AxisDef[] = [
  {
    id: 'xp',
    project: (p) => {
      const k = (p.x - RX0.x) * U.x + (p.y - RX0.y) * U.y;
      return add(RX0, U, k);
    },
    outward: { x: -N_UP.x, y: -N_UP.y },
  },
  {
    id: 'yp',
    project: (p) => {
      const k = (p.x - RY_BASE.x) * N_UP.x + (p.y - RY_BASE.y) * N_UP.y;
      return add(RY_BASE, N_UP, k);
    },
    outward: U,
  },
];

/**
 * 발자국을 찍은 시각들 — 0 부터 `STAMP_DT` 간격으로 `tau` 까지.
 * 누적 상태가 아니라 매 프레임 다시 샘플한다.
 */
export function stampTimes(tau: number): number[] {
  const out: number[] = [];
  for (let k = 0; k * STAMP_DT <= tau + 1e-9; k++) out.push(k * STAMP_DT);
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CoordinateChoiceState }): CoordinateChoiceState {
  return params.state;
}
