// ========================================================================
// rolling-race — 순수 물리
// ========================================================================
// 미끄러지지 않고 구르는 물체 하나. 비탈을 따라
//   a = g·sinθ / (1 + k),  s = ½·a·τ²,  돈 각 φ = s / R
// 이고 (τ 는 놓은 뒤 흐른 시간), k = I/(mR²) 는 모양만의 수다. 질량과 반지름은 a 에
// 들어 있지 않다 — 반지름은 **도는 빠르기**(φ)에만 들어간다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ANGLE,
  GRAVITY,
  K_DISC,
  K_HOOP,
  K_SPHERE,
  LENGTH,
  R_DISC_LARGE,
  R_DISC_SMALL,
  R_HOOP,
  R_SPHERE,
  type RollingRaceMessageKey,
} from './schema';
import type { RollingRaceState } from './state';

export interface RollingRaceConstants {
  g: number;
  /** 비탈 각도(라디안). */
  angle: number;
  /** 출발선 → 결승선, 비탈을 따라 잰 길이(m). */
  length: number;
  kSphere: number;
  kDisc: number;
  kHoop: number;
  rHoop: number;
  rDiscLarge: number;
  rDiscSmall: number;
  rSphere: number;
}

export function readConstants(stage: StageDef): RollingRaceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? GRAVITY,
    angle: c.angle ?? ANGLE,
    length: c.length ?? LENGTH,
    kSphere: c.kSphere ?? K_SPHERE,
    kDisc: c.kDisc ?? K_DISC,
    kHoop: c.kHoop ?? K_HOOP,
    rHoop: c.rHoop ?? R_HOOP,
    rDiscLarge: c.rDiscLarge ?? R_DISC_LARGE,
    rDiscSmall: c.rDiscSmall ?? R_DISC_SMALL,
    rSphere: c.rSphere ?? R_SPHERE,
  };
}

/** 질량이 어떻게 놓였나 — 그림의 칠이 이것을 따른다. */
export type Shape = 'hoop' | 'disc' | 'sphere';

export interface Racer {
  id: string;
  shape: Shape;
  /** 모양 계수 I/(mR²). */
  k: number;
  /** 반지름(m). */
  r: number;
  name: RollingRaceMessageKey;
}

/** 레인 넷, 위에서 아래로. 원판 둘을 붙여 두어야 「나란히」 를 맞대 볼 수 있다. */
export function racers(c: RollingRaceConstants): Racer[] {
  return [
    { id: 'hoop', shape: 'hoop', k: c.kHoop, r: c.rHoop, name: 'label.hoop' },
    { id: 'disc-large', shape: 'disc', k: c.kDisc, r: c.rDiscLarge, name: 'label.disc' },
    { id: 'disc-small', shape: 'disc', k: c.kDisc, r: c.rDiscSmall, name: 'label.disc' },
    { id: 'sphere', shape: 'sphere', k: c.kSphere, r: c.rSphere, name: 'label.sphere' },
  ];
}

export interface RacerReading {
  /** 출발선에서 비탈을 따라 온 거리(m). 결승선에서 멈춘다. */
  s: number;
  /** 놓인 뒤 돈 각(라디안, 시계 방향이 양). */
  turned: number;
  /** 결승선에 닿았는가 — 멈춤은 물리가 정한다(√(2L/a)), 단계 경계가 아니다. */
  arrived: boolean;
  /** 닿은 뒤 흐른 시간(초). 닿기 전에는 음수다 — 도착 파문의 나이가 된다. */
  sinceArrival: number;
}

/** 굴러 내려가는 가속도(m/s²). */
export function accel(k: number, c: RollingRaceConstants): number {
  return (c.g * Math.sin(c.angle)) / (1 + k);
}

/**
 * 물체 하나를 읽는다. 놓는 시각은 선언이 정한다 — `ready` 단계가 끝나는 때다
 * (S-piece 「시간표는 선언이다」). 저작자가 `ready` 를 늘여도 넷이 함께 늦게 떠난다.
 */
export function readRacer(tl: TimelineFrame, racer: Racer, c: RollingRaceConstants): RacerReading {
  const a = accel(racer.k, c);
  const arrival = Math.sqrt((2 * c.length) / a);
  const elapsed = Math.max(0, tl.u - tl.end('ready'));
  const tau = Math.min(elapsed, arrival);
  const s = 0.5 * a * tau * tau;
  return { s, turned: s / racer.r, arrived: elapsed >= arrival, sinceArrival: elapsed - arrival };
}

/**
 * 도착 순위(1 부터). 같은 k 는 같은 순간 닿으므로 같은 순위다 — 크기가 다른 원판 둘이
 * 함께 2 를 받는다. 순위는 k 만으로 정해진다: 질량 · 반지름을 보지 않는다.
 */
export function rankOf(racer: Racer, all: readonly Racer[]): number {
  const faster = new Set(all.filter((o) => o.k < racer.k).map((o) => o.k));
  return faster.size + 1;
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 출발선에 세운다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RollingRaceState }): RollingRaceState {
  return params.state;
}
