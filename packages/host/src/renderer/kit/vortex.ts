/**
 * 소용돌이 다발 — `vortexField` 와 `filament` 가 공유하는 재료.
 *
 * 원본은 `tasks/piece-lab/laminar-vs-turbulent` 에서 **네 번 재튜닝한** 것이다
 * (벽에 눌러붙음 → 벽 근처 톱니 진동 → 가운데가 빈 껍질 → 지금). 조각이
 * 다시 겪을 일이 아니라 여기 둔다.
 */

import { stableRandom } from './particles';

export interface Vortex {
  x: number;
  y: number;
  /** 반지름(월드). */
  r: number;
  /** 회전 방향과 세기. */
  s: number;
  /** 0~1 로 정규화한 나이. */
  age: number;
  /** 흐름이 이만큼 흐르는 동안 산다(월드 거리). */
  life: number;
  /** 지금 세기 — 태어날 때 0, 한창때 1, 죽을 때 0. */
  e: number;
}

export interface VortexBagOptions {
  count: number;
  minX: number;
  maxX: number;
  centerY: number;
  spreadY: number;
  radius: readonly [number, number];
  span: readonly [number, number];
}

/** 소용돌이 하나를 새로 뽑는다. `spread` 면 화면 전체에 흩어 놓는다(첫 프레임). */
export function spawnVortex(
  seed: number,
  o: VortexBagOptions,
  spread: boolean,
): Vortex {
  const r0 = stableRandom(seed, 1);
  const r1 = stableRandom(seed, 2);
  const r2 = stableRandom(seed, 3);
  const r3 = stableRandom(seed, 4);
  const r4 = stableRandom(seed, 5);
  const width = o.maxX - o.minX;
  return {
    x: spread ? o.minX + r0 * width : o.minX - width * 0.05 + r0 * width,
    y: o.centerY + (r1 - 0.5) * o.spreadY,
    r: o.radius[0] + r2 * (o.radius[1] - o.radius[0]),
    s: (r3 < 0.5 ? -1 : 1) * (0.55 + r4 * 0.75),
    age: spread ? r0 : 0,
    life: o.span[0] + r1 * (o.span[1] - o.span[0]),
    e: 0,
  };
}

export function createVortexBag(o: VortexBagOptions): Vortex[] {
  return Array.from({ length: o.count }, (_, i) => spawnVortex(i, o, true));
}

/**
 * 한 프레임 전진. `flow` 는 이 프레임에 흐름이 흐른 월드 거리다.
 *
 * 소용돌이는 흐름보다 조금 느리게 간다(0.86) — 같은 속도로 가면 실과 함께
 * 떠내려가 실을 흔들지 못한다.
 */
export function advanceVortices(
  bag: Vortex[],
  flow: number,
  o: VortexBagOptions,
  reseed: number,
): void {
  for (let k = 0; k < bag.length; k++) {
    const v = bag[k]!;
    v.x += flow * 0.86;
    v.age += v.life > 0 ? flow / v.life : 1;
    if (v.age >= 1 || v.x > o.maxX + (o.maxX - o.minX) * 0.1) {
      bag[k] = spawnVortex(reseed * 977 + k, o, false);
    } else {
      v.e = Math.sin(Math.PI * v.age);
    }
  }
}

/** 이 자리의 속도장. 가우시안 소용돌이의 합. */
export function sampleVortices(
  bag: Vortex[],
  x: number,
  y: number,
): { vx: number; vy: number } {
  let sx = 0;
  let sy = 0;
  for (const v of bag) {
    const dx = (x - v.x) / v.r;
    const dy = (y - v.y) / v.r;
    const q = dx * dx + dy * dy;
    if (q < 6) {
      const w = v.s * v.e * Math.exp(-q);
      sx += w * -dy;
      sy += w * dx;
    }
  }
  return { vx: sx * 1.6, vy: sy * 1.6 };
}
