import type { Body, Primitive, SceneGraphRefs, Vec2, VectorComputeFn } from '@aperi21/schema';

/**
 * 코어에 포함되는 표준 compute 메서드들.
 * - `uniform` : 방향과 크기가 위치 독립적인 상수 벡터장 (중력 균일장 등)
 * - `gravity` : 점 중력원의 중첩. args.sources 는 Body 프리미티브 ID 배열.
 *
 * **어휘가 아니라 Host 서비스다.** plugin 이 `compute` 로 계산 메서드를 등록하고
 * (`PluginManager`), 그것을 부르는 것은 그 plugin 의 렌더러나 sim 이다. 장(field)
 * 프리미티브를 2026-09-12 에 선언에서 지운 것과는 다른 축이라 여기는 남는다 —
 * `gravity` 는 `Body` 를 읽으므로 지금도 유효하다.
 */

interface UniformArgs {
  vector: Vec2;
}

interface GravityArgs {
  sources: string[];
}

/** 중력 상수 (값의 크기는 시각 목적상 충분히 크게). */
const G = 6.674e-11;

function isBody(p: Primitive | undefined): p is Body {
  return p?.type === 'body';
}

export const uniformVectorField: VectorComputeFn = (_x, _y, args): Vec2 => {
  const uniform = args as UniformArgs;
  return uniform?.vector ?? [0, 0];
};

export const gravityVectorField: VectorComputeFn = (
  x,
  y,
  args,
  scene: SceneGraphRefs,
): Vec2 => {
  const gravity = args as GravityArgs;
  let ax = 0;
  let ay = 0;

  for (const id of gravity?.sources ?? []) {
    const body = scene.byId(id);
    if (!isBody(body)) continue;
    const [sx, sy] = body.pos;
    const dx = sx - x;
    const dy = sy - y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-9) continue;
    const r = Math.sqrt(r2);
    const mass = typeof body.mass === 'number' ? body.mass : 1;
    const magnitude = (G * mass) / r2;
    ax += magnitude * (dx / r);
    ay += magnitude * (dy / r);
  }

  return [ax, ay];
};
