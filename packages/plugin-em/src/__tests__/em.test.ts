/**
 * 전자기 순수 계산 — 바늘이 장을 따라 돌아서는 식과 곧은 전선의 자기장.
 */
import { describe, expect, it } from 'vitest';
import { followAngle, wireFieldDirection, wireFieldMagnitude, wrapAngle } from '../index';

describe('followAngle', () => {
  it('목표 쪽으로 돌고, 충분히 가면 목표에 머문다', () => {
    let theta = 0;
    for (let i = 0; i < 2000; i++) theta = followAngle(theta, 1, 1 / 60, { rate: 3 });
    expect(theta).toBeCloseTo(1, 6);
  });

  it('±π 경계를 넘는 목표도 가까운 쪽으로 돈다', () => {
    // 3 rad 에서 −3 rad 로: 차이 −6 이지만 실제로는 +0.28 rad 만 돌면 된다.
    const next = followAngle(3, -3, 0.01, { rate: 1 });
    expect(next).toBeGreaterThan(3);
  });

  it('장이 약한 자리는 같은 시간에 덜 돌아선다', () => {
    const step = (strength: number): number => followAngle(0, 1, 0.1, { rate: 1, strength });
    expect(step(0.5)).toBeLessThan(step(2));
    expect(step(0)).toBe(0);
  });
});

describe('wrapAngle', () => {
  it('-π..π 로 접는다', () => {
    expect(wrapAngle(0)).toBeCloseTo(0, 12);
    expect(wrapAngle(Math.PI * 2 + 0.5)).toBeCloseTo(0.5, 12);
    expect(wrapAngle(-Math.PI * 2 - 0.5)).toBeCloseTo(-0.5, 12);
    expect(wrapAngle(3 * Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 12);
  });
});

describe('곧은 전선의 자기장', () => {
  it('세기는 거리에 반비례한다', () => {
    expect(wireFieldMagnitude(1, 4) / wireFieldMagnitude(2, 4)).toBeCloseTo(2, 12);
    expect(wireFieldMagnitude(0, 4)).toBe(0);
  });

  it('방향은 반지름에 수직인 단위 벡터이고, 전류가 바뀌면 반대로 돈다', () => {
    const [x, y] = wireFieldDirection(3, 4, 1);
    expect(Math.hypot(x, y)).toBeCloseTo(1, 12);
    expect(x * 3 + y * 4).toBeCloseTo(0, 12);
    // 전류가 화면 밖으로 나오면 반시계로 감는다 — (1, 0) 자리에서 +y.
    expect(wireFieldDirection(1, 0, 1)).toEqual([-0, 1]);
    const [rx, ry] = wireFieldDirection(3, 4, -1);
    expect(rx).toBeCloseTo(-x, 12);
    expect(ry).toBeCloseTo(-y, 12);
  });

  it('전선 위에서는 방향이 없다', () => {
    expect(wireFieldDirection(0, 0, 1)).toEqual([0, 0]);
  });
});
