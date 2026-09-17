// ========================================================================
// drag-force — 순수 물리
// ========================================================================
// 일정한 힘으로 미는 물체, 저항 = 1차 몫(b·v) + 2차 몫(c·v²). 원본 `advance(dt)`
// 를 그대로 옮겼다. 멈추는 조건만 바뀌었다 — 구간 끝이 아니라 빗금 몫이 채움 몫을
// 분명히 앞지른 순간이다 (schema.ts `PHYSICS.overtake`, NOTES (a)).
// ========================================================================

import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import { LAYOUT, PHYSICS } from './schema';
import { initialState, type DragForceState } from './state';

export interface DragForceConstants {
  force: number;
  mass: number;
  linear: number;
  quadratic: number;
  strobe: number;
  hold: number;
  overtake: number;
}

export function readConstants(stage: StageDef): DragForceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    force: c.force ?? PHYSICS.force,
    mass: c.mass ?? PHYSICS.mass,
    linear: c.linear ?? PHYSICS.linear,
    quadratic: c.quadratic ?? PHYSICS.quadratic,
    strobe: c.strobe ?? PHYSICS.strobe,
    hold: c.hold ?? PHYSICS.hold,
    overtake: c.overtake ?? PHYSICS.overtake,
  };
}

/** 속도에 비례하는 몫. */
export function linearPart(v: number, k: DragForceConstants): number {
  return k.linear * v;
}

/** 속도 제곱에 비례하는 몫. */
export function quadraticPart(v: number, k: DragForceConstants): number {
  return k.quadratic * v * v;
}

/** 1차 몫이 아직 큰가. 정지(v = 0)도 여기 든다 — 두 몫이 다 0 인 출발 순간이다. */
function linearDominant(v: number, k: DragForceConstants): boolean {
  return k.quadratic * v < k.linear;
}

/**
 * 한 걸음. 순수 함수.
 *
 * 멈춘 장면을 `hold` 만큼 붙잡은 뒤 처음으로 되감는다(원본은 되감을 때 미리 굴리지
 * 않는다 — 출발부터 다시 본다).
 */
export function step(params: {
  state: DragForceState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): DragForceState {
  const { state: s, dt, stage } = params;
  if (!(dt > 0)) return s;
  const k = readConstants(stage);

  if (s.hold > 0) {
    const hold = s.hold - dt;
    if (hold <= 0) return initialState();
    return { ...s, hold };
  }

  const drag = linearPart(s.v, k) + quadraticPart(s.v, k);
  const v = s.v + ((k.force - drag) / k.mass) * dt;
  let x = s.x + v * dt;
  const clock = s.clock + dt;

  let nextStrobe = s.nextStrobe;
  let strobes = s.strobes;
  if (clock >= nextStrobe - 1e-9) {
    strobes = [...strobes, { x, v }];
    nextStrobe += k.strobe;
  }

  // 빗금 몫이 채움 몫을 분명히 앞지르면 멈춘다. 구간 끝은 안전장치로만 남긴다.
  let hold = 0;
  // c·v² ≥ r·b·v 를 v 로 나눈 꼴 — v = 0 에서 두 몫이 다 0 이라 참이 되는 것을 막는다.
  if (k.quadratic * v >= k.overtake * k.linear) hold = k.hold;
  if (x >= LAYOUT.course) {
    x = LAYOUT.course;
    hold = k.hold;
  }

  return { x, v, clock, nextStrobe, strobes, hold, linearDominant: linearDominant(v, k) };
}
