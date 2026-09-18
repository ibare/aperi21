// ========================================================================
// superposition — 순수 물리
// ========================================================================
// 줄 위의 펄스 둘은 모양을 바꾸지 않고 제 속력으로 미끄러진다. 줄의 변위는 두 펄스
// 변위의 **합** 이다 — 이것이 중첩 원리의 전부이고, 겹치는 동안에도 각 펄스는 따로
// 제 모양대로 움직인다.
//
//   y(x, s) = a(x − xA(s)) + σ · b(x − xB(s)),   xA = −D + v·s,  xB = +D − v·s
//
// σ 는 줄마다 +1(위 · 위) · −1(위 · 아래)이다. 펄스 모양은 밑변이 유한한 올린 코사인
// 이라 「겹친다」 와 「떨어졌다」 가 정확히 갈린다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { AMP_A, AMP_B, SPEED, START_OFFSET, WIDTH_A, WIDTH_B } from './schema';
import type { SuperpositionState } from './state';

export interface SuperpositionConstants {
  /** 펄스 A(왼쪽에서 옴)의 높이 · 밑변 폭(칸). */
  ampA: number;
  widthA: number;
  /** 펄스 B(오른쪽에서 옴)의 높이 · 밑변 폭(칸). 부호는 줄이 정한다. */
  ampB: number;
  widthB: number;
  /** 두 펄스의 속력(칸/초). */
  speed: number;
  /** 출발할 때 두 중심이 줄 가운데에서 떨어진 거리(칸). */
  startOffset: number;
}

export function readConstants(stage: StageDef): SuperpositionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    ampA: c.ampA ?? AMP_A,
    widthA: c.widthA ?? WIDTH_A,
    ampB: c.ampB ?? AMP_B,
    widthB: c.widthB ?? WIDTH_B,
    speed: c.speed ?? SPEED,
    startOffset: c.startOffset ?? START_OFFSET,
  };
}

/** 펄스 하나의 모양 — 중심에서 떨어진 거리 d 에서의 변위. 밑변 밖은 0. */
export function pulse(d: number, amp: number, width: number): number {
  const half = width / 2;
  if (Math.abs(d) >= half) return 0;
  return amp * 0.5 * (1 + Math.cos((Math.PI * d) / half));
}

/**
 * 이번 주기에서 펄스가 움직인 시간(초).
 *
 * 주기 안 시각 그대로 흐르다가, 중심이 포개지는 `peak` 단계 동안은 멈춘다 — 그 순간의
 * 합을 읽게 두는 정지다. 마지막 `fade` 에서는 도착한 자리에 선다. 단계 길이 · 경계는
 * 선언이 안다 (`duration` · `end`).
 */
export function motionTime(tl: TimelineFrame): number {
  const held = tl.duration('peak') * tl.at('peak');
  const last = tl.end('depart') - tl.duration('peak');
  return Math.min(Math.max(0, tl.u - held), last);
}

export interface PulsePositions {
  /** 두 펄스의 중심(월드 x). */
  xA: number;
  xB: number;
  /** 두 펄스의 밑변이 겹쳐 있는가 — 펄스 이름표를 걷고 더하기 화살표를 세울 조건. */
  overlapping: boolean;
}

export function readPulses(tl: TimelineFrame, c: SuperpositionConstants): PulsePositions {
  const s = motionTime(tl);
  const xA = -c.startOffset + c.speed * s;
  const xB = c.startOffset - c.speed * s;
  return { xA, xB, overlapping: Math.abs(xA - xB) < (c.widthA + c.widthB) / 2 };
}

/** 한 점에서의 두 성분 변위. `sign` 은 B 의 방향(+1 위 · −1 아래). */
export function components(
  x: number,
  p: PulsePositions,
  c: SuperpositionConstants,
  sign: number,
): { a: number; b: number } {
  return { a: pulse(x - p.xA, c.ampA, c.widthA), b: sign * pulse(x - p.xB, c.ampB, c.widthB) };
}

/** 이번 주기에서 그림이 드러난 정도 0~1. 처음에 나타나고 마지막에 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SuperpositionState }): SuperpositionState {
  return params.state;
}
