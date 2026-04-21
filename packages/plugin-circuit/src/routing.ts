import type { Vec2 } from '@aperi21/schema';

/**
 * Manhattan(직교) 라우팅.
 *
 * 단순 버전 — 시작점과 끝점 사이를 가로·세로로 꺾어 잇는 L / Z 형상을 선택한다.
 * `preferAxis` 가 'x' 면 먼저 수평, 'y' 면 먼저 수직으로 움직인다.
 *
 * 복잡한 장애물 회피는 MVP 범위 밖. 대신 `avoid` 에 포함된 직사각형(소자 bbox) 을
 * 만나면 한 번 더 꺾어 우회하는 Z 경로를 생성한다.
 */
export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RouteOptions {
  preferAxis?: 'x' | 'y';
  avoid?: readonly AABB[];
  /** 사전 bend 위치(월드 좌표). 있으면 start→bend→end 의 L 로 강제. */
  bend?: Vec2;
}

function segmentsIntersectAABB(a: Vec2, b: Vec2, box: AABB): boolean {
  // 수평/수직 세그먼트로만 들어온다고 가정.
  if (a[0] === b[0]) {
    const x = a[0];
    if (x <= box.minX || x >= box.maxX) return false;
    const y0 = Math.min(a[1], b[1]);
    const y1 = Math.max(a[1], b[1]);
    return y0 < box.maxY && y1 > box.minY;
  }
  if (a[1] === b[1]) {
    const y = a[1];
    if (y <= box.minY || y >= box.maxY) return false;
    const x0 = Math.min(a[0], b[0]);
    const x1 = Math.max(a[0], b[0]);
    return x0 < box.maxX && x1 > box.minX;
  }
  return false;
}

function pathHitsObstacle(points: Vec2[], obstacles: readonly AABB[]): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    for (const o of obstacles) {
      if (segmentsIntersectAABB(points[i]!, points[i + 1]!, o)) return true;
    }
  }
  return false;
}

export function manhattanRoute(start: Vec2, end: Vec2, options: RouteOptions = {}): Vec2[] {
  if (options.bend) {
    return [start, options.bend, end];
  }

  const prefer = options.preferAxis ?? 'x';
  const [sx, sy] = start;
  const [ex, ey] = end;

  const lShapeX: Vec2[] = [start, [ex, sy], end];
  const lShapeY: Vec2[] = [start, [sx, ey], end];

  const obstacles = options.avoid ?? [];
  const primary = prefer === 'x' ? lShapeX : lShapeY;
  const secondary = prefer === 'x' ? lShapeY : lShapeX;

  if (!pathHitsObstacle(primary, obstacles)) return primary;
  if (!pathHitsObstacle(secondary, obstacles)) return secondary;

  // Z-shape: 중점에서 한 번 더 꺾는다.
  const midX = (sx + ex) / 2;
  const zShape: Vec2[] = [start, [midX, sy], [midX, ey], end];
  if (!pathHitsObstacle(zShape, obstacles)) return zShape;

  const midY = (sy + ey) / 2;
  const zShapeV: Vec2[] = [start, [sx, midY], [ex, midY], end];
  if (!pathHitsObstacle(zShapeV, obstacles)) return zShapeV;

  // 포기 — 직선 L 폴백.
  return primary;
}
