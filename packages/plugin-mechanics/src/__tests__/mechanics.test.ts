/**
 * 역학 순수 계산 — 조각들이 공유하는 식이 뜻을 지키는지.
 *
 * 여기 있는 함수들은 틀려도 그림이 그려진다. 회전이 반대로 돌거나, 궤적만 안
 * 기울거나, 에너지가 조금씩 새는 식으로 **예외 없이 뜻만 바뀐다.** 그래서 값이 아니라
 * 성질(보존 · 역함수 · 대칭)로 고정한다.
 */
import { describe, expect, it } from 'vitest';
import type { Vec2 } from '@aperi21/schema';
import {
  G,
  advanceObserver,
  advanceOnPath,
  angleAtArcLength,
  arcLengthAtAngle,
  clockAngleOf,
  eventInFrame,
  observerAtRest,
  pathFromCurvatureRadius,
  pointAtClockAngle,
  positionInFrame,
  sampleAtArcLength,
  speedFromDrop,
  tiledPositions,
} from '../index';

describe('speedFromDrop', () => {
  it('v = √(2gh)', () => {
    expect(speedFromDrop(5, 10)).toBeCloseTo(10, 12);
    expect(speedFromDrop(1)).toBeCloseTo(Math.sqrt(2 * G), 12);
  });

  it('출발점보다 높은 자리에서는 0 — 음수의 제곱근을 만들지 않는다', () => {
    expect(speedFromDrop(-1)).toBe(0);
  });
});

describe('advanceOnPath', () => {
  const dt = 1 / 60;

  it('빗면 위의 물체가 내려온 높이만큼의 속력을 낸다', () => {
    // 45° 빗면: u 가 곧 x, y = 10 − u.
    const at = (u: number): readonly [number, number] => [u, 10 - u];
    let u = 0.01;
    let prev = u;
    for (let i = 0; i < 60; i++) {
      prev = u;
      u = advanceOnPath(u, dt, { at, startY: 10, g: 10 });
    }
    // 마지막 한 걸음의 평균 속력 — 그 걸음의 가운데 자리 속력과 맞대야 한다.
    const pathSpeed = (Math.SQRT2 * (u - prev)) / dt;
    expect(pathSpeed).toBeCloseTo(speedFromDrop((u + prev) / 2, 10), 3);
  });

  it('모양이 다른 두 길도 같은 높이를 내려오면 같은 속력이다', () => {
    const straight = (u: number): readonly [number, number] => [u, 1 - u];
    const curved = (u: number): readonly [number, number] => [u, (1 - u) ** 2];
    const drop = (at: (u: number) => readonly [number, number]): number => {
      let u = 0.001;
      for (let i = 0; i < 2000 && u < 1; i++) u = advanceOnPath(u, 1 / 600, { at, startY: 1, uMax: 1 });
      return 1 - at(u)[1];
    };
    expect(speedFromDrop(drop(straight))).toBeCloseTo(speedFromDrop(drop(curved)), 6);
  });

  it('uMax 를 넘지 않는다', () => {
    const at = (u: number): readonly [number, number] => [u, -u];
    let u = 0.5;
    for (let i = 0; i < 1000; i++) u = advanceOnPath(u, 0.1, { at, startY: 0, uMax: 2 });
    expect(u).toBe(2);
  });
});

describe('시계각', () => {
  const c: Vec2 = [1, 2];

  it('0 은 12시(+y), π/2 는 3시(+x) — 시계방향이다', () => {
    const top = pointAtClockAngle(c, 1, 0);
    expect(top[0]).toBeCloseTo(1, 12);
    expect(top[1]).toBeCloseTo(3, 12);
    const right = pointAtClockAngle(c, 1, Math.PI / 2);
    expect(right[0]).toBeCloseTo(2, 12);
    expect(right[1]).toBeCloseTo(2, 12);
  });

  it('clockAngleOf 는 pointAtClockAngle 의 역이고 [0, 2π) 에 든다', () => {
    for (const theta of [0, 0.3, 1.5, 3, 4.5, 6]) {
      const back = clockAngleOf(c, pointAtClockAngle(c, 2.5, theta));
      expect(back).toBeGreaterThanOrEqual(0);
      expect(back).toBeLessThan(Math.PI * 2);
      expect(back).toBeCloseTo(theta, 12);
    }
  });
});

describe('tiledPositions', () => {
  it('주기마다 되풀이되는 자리 중 범위 안의 것만 돌려준다', () => {
    expect(tiledPositions(1, { period: 10, from: -15, to: 25 })).toEqual([-9, 1, 11, 21]);
  });

  it('주기가 0 이하이거나 범위가 뒤집히면 빈 배열', () => {
    expect(tiledPositions(0, { period: 0, from: 0, to: 10 })).toEqual([]);
    expect(tiledPositions(0, { period: 1, from: 10, to: 0 })).toEqual([]);
  });

  it('상한을 넘겨 폭주하지 않는다', () => {
    expect(tiledPositions(0, { period: 1e-9, from: 0, to: 1 })).toHaveLength(1024);
    expect(tiledPositions(0, { period: 1, from: 0, to: 100, limit: 5 })).toHaveLength(5);
  });
});

describe('갈릴레이 기준틀', () => {
  it('관측자 위치는 적분이다 — 속도가 바뀌어도 가짜 이동이 없다', () => {
    let f = observerAtRest();
    for (let i = 0; i < 10; i++) f = advanceObserver(f, [1, 0], 0.1);
    for (let i = 0; i < 10; i++) f = advanceObserver(f, [0, 0], 0.1);
    // `x − u·t` 로 쓰면 지금 속도 0 이라 자리가 0 으로 돌아간다. 적분은 1 에 머문다.
    expect(f.at[0]).toBeCloseTo(1, 12);
    expect(f.t).toBeCloseTo(2, 12);
  });

  it('지금 있는 것은 관측자만큼만 밀린다', () => {
    let f = observerAtRest();
    f = advanceObserver(f, [2, 0], 1);
    expect(positionInFrame(f, [5, 1])).toEqual([3, 1]);
  });

  it('지나간 사건에는 전단이 붙는다 — 과거일수록 더 밀린다', () => {
    let f = observerAtRest();
    f = advanceObserver(f, [2, 0], 3);
    const now = eventInFrame(f, { x: 6, y: 0, t: 3 });
    const past = eventInFrame(f, { x: 6, y: 0, t: 1 });
    expect(now).toEqual(positionInFrame(f, [6, 0]));
    expect(past[0] - now[0]).toBeCloseTo(2 * 2, 12);
  });
});

describe('pathFromCurvatureRadius', () => {
  it('R 이 일정하면 원이다 — 닫히고, 둘레가 2πR, 곡률 중심이 한 점이다', () => {
    const path = pathFromCurvatureRadius({ radiusAt: () => 3 });
    expect(path.closed).toBe(true);
    expect(path.totalLength).toBeCloseTo(2 * Math.PI * 3, 9);
    for (const c of path.evolute) {
      expect(c[0]).toBeCloseTo(0, 9);
      expect(c[1]).toBeCloseTo(0, 9);
    }
    for (const p of path.points) expect(Math.hypot(p[0], p[1])).toBeCloseTo(3, 9);
  });

  it('2차 이상 조화만 쓰면 닫히고, 1차 조화가 섞이면 벌어진다', () => {
    expect(pathFromCurvatureRadius({ radiusAt: (p) => 4 - 3 * Math.cos(2 * p) }).closed).toBe(true);
    const open = pathFromCurvatureRadius({ radiusAt: (p) => 4 + Math.cos(p) });
    expect(open.closed).toBe(false);
    expect(open.closureGap).toBeGreaterThan(0.1);
  });

  it('호길이 ↔ 각이 서로 역이다', () => {
    const path = pathFromCurvatureRadius({ radiusAt: (p) => 4 - 3 * Math.cos(2 * p) });
    for (const phi of [0.2, 1, 2.5, 4, 6]) {
      expect(angleAtArcLength(path, arcLengthAtAngle(path, phi))).toBeCloseTo(phi, 6);
    }
  });

  it('닫힌 곡선은 바퀴를 감는다 — 한 바퀴 더 가면 φ 가 2π 늘어난다', () => {
    const path = pathFromCurvatureRadius({ radiusAt: () => 2 });
    const s = 1.3;
    expect(angleAtArcLength(path, s + path.totalLength) - angleAtArcLength(path, s)).toBeCloseTo(
      Math.PI * 2,
      9,
    );
  });

  it('표본의 곡률 반지름은 넘긴 R 이다', () => {
    const radiusAt = (p: number): number => 4 - 3 * Math.cos(2 * p);
    const path = pathFromCurvatureRadius({ radiusAt });
    const sample = sampleAtArcLength(path, arcLengthAtAngle(path, 1.1));
    expect(sample.radius).toBeCloseTo(radiusAt(sample.phi), 3);
    // 곡률 중심은 점에서 R 만큼 떨어져 있다.
    const d = Math.hypot(sample.point[0] - sample.center[0], sample.point[1] - sample.center[1]);
    expect(d).toBeCloseTo(sample.radius, 3);
  });
});
