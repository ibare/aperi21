/**
 * 직교 라우팅 — 도선은 가로·세로로만 꺾이고, 소자 상자를 가로지르지 않는다.
 */
import { describe, expect, it } from 'vitest';
import type { Vec2 } from '@aperi21/schema';
import { manhattanRoute } from '../index';

/** 이웃한 두 점이 한 축만 다른가 — 대각선 도선이 없는가. */
function isOrthogonal(path: readonly Vec2[]): boolean {
  return path.every((p, i) => {
    const q = path[i + 1];
    return !q || p[0] === q[0] || p[1] === q[1];
  });
}

describe('manhattanRoute', () => {
  it('기본은 가로 먼저인 L 자다', () => {
    expect(manhattanRoute([0, 0], [4, 3])).toEqual([
      [0, 0],
      [4, 0],
      [4, 3],
    ]);
  });

  it('preferAxis y 면 세로 먼저다', () => {
    expect(manhattanRoute([0, 0], [4, 3], { preferAxis: 'y' })).toEqual([
      [0, 0],
      [0, 3],
      [4, 3],
    ]);
  });

  it('bend 를 주면 그 자리에서 꺾는다', () => {
    expect(manhattanRoute([0, 0], [4, 3], { bend: [0, 3] })).toEqual([
      [0, 0],
      [0, 3],
      [4, 3],
    ]);
  });

  it('가로 먼저인 길이 상자에 막히면 세로 먼저로 돌아간다', () => {
    const box = { minX: 1, minY: -1, maxX: 3, maxY: 1 };
    const path = manhattanRoute([0, 0], [4, 3], { avoid: [box] });
    expect(path).toEqual([
      [0, 0],
      [0, 3],
      [4, 3],
    ]);
  });

  it('두 L 이 다 막히면 가운데서 한 번 더 꺾는 Z 로 우회한다', () => {
    const boxes = [
      { minX: 3, minY: -1, maxX: 5, maxY: 1 }, // 가로 먼저 L 의 첫 변
      { minX: -1, minY: 3, maxX: 1, maxY: 5 }, // 세로 먼저 L 의 첫 변
    ];
    const path = manhattanRoute([0, 0], [6, 6], { avoid: boxes });
    expect(path).toHaveLength(4);
    expect(path[0]).toEqual([0, 0]);
    expect(path[3]).toEqual([6, 6]);
    expect(isOrthogonal(path)).toBe(true);
  });

  it('어느 경우에도 양 끝을 지키고 직교한다', () => {
    const box = { minX: 1, minY: 1, maxX: 2, maxY: 2 };
    for (const end of [
      [5, 0],
      [0, 5],
      [3, 3],
      [-2, 4],
    ] as Vec2[]) {
      const path = manhattanRoute([0, 0], end, { avoid: [box] });
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual(end);
      expect(isOrthogonal(path)).toBe(true);
    }
  });
});
