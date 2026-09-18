// ========================================================================
// equilibrium-points — 순수 물리
// ========================================================================
// 공 하나를 곡선 위의 구슬로 본다. 바닥 높이를 h(x) 라 하면 가로 자리 x 는
//   ẍ = −(g·h′ + h′·h″·ẋ²) / (1 + h′²) − γ·ẋ
// 를 따른다. 비탈 방향으로 받는 가속도는 −g·h′/√(1+h′²) 이다 — **기울기 h′ 가 0 인
// 자리에서는 힘이 없다.** 그것이 셋 모두 평형인 이유이고, 조금 옮겼을 때 h′ 의 부호가
// 어느 쪽으로 서는지가 셋을 가른다.
//
//   골   h = H·sin²(πx/2W)   옮긴 쪽과 반대로 민다 → 돌아온다
//   마루 h = H·cos²(πx/2W)   옮긴 쪽으로 더 민다   → 굴러떨어진다
//   평지 h = 0               밀지 않는다           → 머문다
//
// W 는 굽이의 반폭이고, |x| > W 는 판 끝까지 평평하다(골은 H, 마루는 0 높이).
// 골과 마루는 서로 거울상이라 가운데의 굽은 정도가 같다 — 다른 것은 굽은 **방향**뿐이다.
//
// 같은 시각은 언제나 같은 화면이어야 하므로 상태를 쌓지 않는다. 놓은 순간부터 지금까지를
// 매 프레임 고정 걸음으로 다시 적분한다 (걸음이 일정해 시각의 순수 함수다).
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BALL_RADIUS, DAMPING, GRAVITY, HALF_WIDTH, HUMP_HALF_WIDTH, NUDGE, RELIEF } from './schema';
import type { EquilibriumPointsState } from './state';

/** 바닥 모양. 판 하나가 하나를 갖는다. */
export type GroundKind = 'valley' | 'crest' | 'flat';

export interface EquilibriumConstants {
  gravity: number;
  damping: number;
  nudge: number;
}

export function readConstants(stage: StageDef): EquilibriumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravity: c.gravity ?? GRAVITY,
    damping: c.damping ?? DAMPING,
    nudge: c.nudge ?? NUDGE,
  };
}

/** 굽이 안쪽으로 자른 자리. 바깥은 굽이 끝과 같은 높이 · 기울기 0 으로 평평하다. */
function inHump(x: number): number {
  return Math.max(-HUMP_HALF_WIDTH, Math.min(HUMP_HALF_WIDTH, x));
}

/** 바닥 높이 h(x) (판 가운데 기준 가로 자리 x). */
export function groundHeight(kind: GroundKind, x: number): number {
  const s = Math.sin((Math.PI * inHump(x)) / (2 * HUMP_HALF_WIDTH));
  if (kind === 'valley') return RELIEF * s * s;
  if (kind === 'crest') return RELIEF * (1 - s * s);
  return 0;
}

/** 기울기 h′(x). 굽이 밖은 0 이다. */
export function groundSlope(kind: GroundKind, x: number): number {
  if (Math.abs(x) >= HUMP_HALF_WIDTH) return 0;
  const k = (RELIEF * Math.PI) / (2 * HUMP_HALF_WIDTH);
  const g = k * Math.sin((Math.PI * x) / HUMP_HALF_WIDTH);
  if (kind === 'valley') return g;
  if (kind === 'crest') return -g;
  return 0;
}

/** 굽은 정도 h″(x). 굽이 밖은 0 이다. */
function groundCurvature(kind: GroundKind, x: number): number {
  if (Math.abs(x) >= HUMP_HALF_WIDTH) return 0;
  const k = (RELIEF * Math.PI * Math.PI) / (2 * HUMP_HALF_WIDTH * HUMP_HALF_WIDTH);
  const g = k * Math.cos((Math.PI * x) / HUMP_HALF_WIDTH);
  if (kind === 'valley') return g;
  if (kind === 'crest') return -g;
  return 0;
}

/**
 * 공이 닿을 수 있는 가로 자리의 끝. 마루 판의 양 끝에 멈춤막이가 있고, 공은 그 막에
 * 몸이 닿는 자리(반지름만큼 안쪽)에서 선다 — 평평한 발 위라 멈춘 뒤 비탈 힘이 없다.
 * 골의 공은 거기까지 가지 않는다.
 */
export const X_LIMIT = HALF_WIDTH - BALL_RADIUS;

/** 적분 걸음(초). 고정이라야 같은 시각이 같은 자리를 낸다. */
const DT = 1 / 240;

/** 놓은 뒤 `s` 초가 지난 자리 · 속도. 매번 놓은 순간부터 다시 적분한다. */
function rollFrom(kind: GroundKind, x0: number, s: number, c: EquilibriumConstants): number {
  let x = x0;
  let v = 0;
  const steps = Math.floor(s / DT);
  const rest = s - steps * DT;
  const accel = (px: number, pv: number): number => {
    const h1 = groundSlope(kind, px);
    const h2 = groundCurvature(kind, px);
    return -(c.gravity * h1 + h1 * h2 * pv * pv) / (1 + h1 * h1) - c.damping * pv;
  };
  const advance = (dt: number): void => {
    // 반암시 오일러 — 감쇠 진동이 에너지를 거짓으로 얻지 않는다.
    v += accel(x, v) * dt;
    x += v * dt;
    // 멈춤막이 — 부딪치면 그 자리에 선다(튕기지 않는다).
    if (x > X_LIMIT) {
      x = X_LIMIT;
      v = 0;
    } else if (x < -X_LIMIT) {
      x = -X_LIMIT;
      v = 0;
    }
  };
  for (let i = 0; i < steps; i++) advance(DT);
  if (rest > 0) advance(rest);
  return x;
}

export interface BallReading {
  /** 판 가운데 기준 가로 자리(바닥에 닿은 점). */
  x: number;
  /** 바닥이 비탈 방향으로 주는 가속도(m/s²). 부호는 +x 로 올라가는 접선 방향 기준. */
  pull: number;
  /** 바닥의 단위 접선 · 단위 법선. 공 중심과 힘 화살표의 방향을 정한다. */
  tangent: readonly [number, number];
  normal: readonly [number, number];
}

/**
 * 공 하나를 읽는다. **단계 경계는 선언이 정한다** — 옮기는 진행도도, 놓는 시각도
 * `timeline` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 *
 * 분기가 필요 없다: 옮기는 동안은 놓은 뒤 흐른 시간이 0 이라 적분이 제자리를 돌려주고,
 * 놓은 뒤에는 옮긴 진행도가 1 이다.
 */
export function readBall(kind: GroundKind, tl: TimelineFrame, c: EquilibriumConstants): BallReading {
  const held = c.nudge * tl.at('nudge');
  const sinceRelease = Math.max(0, tl.u - tl.end('nudge'));
  const x = rollFrom(kind, held, sinceRelease, c);
  const h1 = groundSlope(kind, x);
  const len = Math.hypot(1, h1);
  return {
    x,
    pull: (-c.gravity * h1) / len,
    tangent: [1 / len, h1 / len],
    normal: [-h1 / len, 1 / len],
  };
}

/** 이번 주기에서 공 · 화살표가 흐려진 정도. 마지막 단계에서 지우고 다시 세운다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EquilibriumPointsState }): EquilibriumPointsState {
  return params.state;
}
