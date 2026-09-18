// ========================================================================
// pauli-exclusion — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 전자마다 어느 자리로 가는지, 지금 어디 있는지, 얼마나 짙은지가 모두
// 시간표 시각과 스테이지 상수의 함수다. `step` 은 항등이다.
//
// 배타 원리 — 전자의 상태는 (준위 n, 스핀 s) 한 쌍이고 s 는 ↑ · ↓ 둘뿐이다. 같은 상태에는
// 전자가 하나만 들어간다. 전자를 하나씩 넣으면 각자 **가장 낮은 빈 상태**로 가므로
//   i 번째 전자(0 부터) → 준위 ⌊i / 2⌋ + 1, 스핀 i 가 짝수면 ↑ · 홀수면 ↓
// 가 된다. 이 배정이 이 조각의 물리 전부다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { ELECTRON_COUNT, LEVEL_COUNT, LEVEL_GAP, QUEUE, SEAT } from './schema';
import type { PauliExclusionState } from './state';

/** 스핀 ½ 전자의 상태 수 — ↑ · ↓. 준위 하나의 자리 수다. 물리라 선언값이 아니다. */
const SPIN_STATES = 2;

export type Spin = 'up' | 'down';

export interface PauliConstants {
  levelCount: number;
  electronCount: number;
  levelGap: number;
}

export function readConstants(stage: StageDef): PauliConstants {
  const c = stage.constants ?? {};
  const out: PauliConstants = {
    levelCount: c.levelCount ?? LEVEL_COUNT,
    electronCount: c.electronCount ?? ELECTRON_COUNT,
    levelGap: c.levelGap ?? LEVEL_GAP,
  };
  if (out.electronCount > out.levelCount * SPIN_STATES) {
    throw new Error('pauli-exclusion: 전자 수가 자리 수(준위 수 × 2)보다 많다');
  }
  return out;
}

/** 준위 번호(1 부터)의 높이(월드). 바닥 준위가 0. */
export const levelY = (n: number, c: PauliConstants): number => (n - 1) * c.levelGap;

/** 자리의 가로 자리 — ↑ 는 왼쪽, ↓ 는 오른쪽. */
export const seatX = (spin: Spin): number => (spin === 'up' ? -SEAT.x : SEAT.x);

/** 한 자리 — 준위 번호와 스핀. */
export interface Seat {
  n: number;
  spin: Spin;
}

/** i 번째 전자(0 부터)가 가는 자리. 가장 낮은 빈 상태 — 같은 상태에 둘은 없다. */
export function seatOf(i: number): Seat {
  return {
    n: Math.floor(i / SPIN_STATES) + 1,
    spin: i % SPIN_STATES === 0 ? 'up' : 'down',
  };
}

/** 자리의 가운데(월드). */
export const seatPos = (s: Seat, c: PauliConstants): Vec2 => [seatX(s.spin), levelY(s.n, c)];

/** i 번째 전자가 기다리는 대기열 자리(월드). 맨 위 준위 높이, 사다리에 가까운 쪽이 먼저. */
export const queuePos = (i: number, c: PauliConstants): Vec2 => [
  QUEUE.x0 + i * QUEUE.gap,
  levelY(c.levelCount, c),
];

/** 전자 하나의 모습 — 어디 있는가, 스핀, 얼마나 짙은가. */
export interface ElectronView {
  i: number;
  pos: Vec2;
  spin: Spin;
  alpha: number;
  /** 대기열에서 기다림 · 자리로 옮겨 가는 중 · 제자리. */
  where: 'queue' | 'moving' | 'seat';
}

/**
 * 대기열 → 자리 경로. 2차 곡선 — 대기열에서 사다리 위로 떠올라 자기 스핀 줄로 내려앉는다.
 * 조절점은 자리 바로 위, 대기열보다 `QUEUE.lift` 높은 곳이다. 그래서 끝 무렵에는 곧게 아래로
 * 내려와, 위 층 자리들을 지나 가장 낮은 빈자리에 멈추는 것이 보인다.
 */
function pathAt(from: Vec2, to: Vec2, p: number): Vec2 {
  const ctrl: Vec2 = [to[0], from[1] + QUEUE.lift];
  const q = 1 - p;
  return [
    q * q * from[0] + 2 * q * p * ctrl[0] + p * p * to[0],
    q * q * from[1] + 2 * q * p * ctrl[1] + p * p * to[1],
  ];
}

/**
 * 모든 전자의 지금 모습. i 번째 전자는 단계 `drop{i+1}` 동안 옮겨 간다 — 그 전에는 대기열, 뒤에는
 * 제자리. `fade` 단계 동안 제자리의 전자는 옅어지고 대기열이 다시 짙어진다.
 */
export function readElectrons(tl: TimelineFrame, c: PauliConstants): ElectronView[] {
  const fade = tl.at('fade');
  const out: ElectronView[] = [];
  for (let i = 0; i < c.electronCount; i++) {
    const p = tl.at(`drop${i + 1}`);
    const seat = seatOf(i);
    const home = queuePos(i, c);
    if (p <= 0) {
      out.push({ i, pos: home, spin: seat.spin, alpha: 1, where: 'queue' });
      continue;
    }
    out.push({
      i,
      pos: pathAt(home, seatPos(seat, c), p),
      spin: seat.spin,
      alpha: p < 1 ? 1 : 1 - fade,
      where: p < 1 ? 'moving' : 'seat',
    });
    // 비우는 동안 대기열 자리에 다시 나타난다 — 다음 주기의 첫 화면과 이어진다.
    if (fade > 0) out.push({ i, pos: home, spin: seat.spin, alpha: fade, where: 'queue' });
  }
  return out;
}

export function step(params: { state: PauliExclusionState }): PauliExclusionState {
  return params.state;
}
