import type { BundleSchema, Primitive, SceneGraph, SceneGraphRefs } from '@aperi21/schema';
import { SceneGraphRefsImpl } from './refs';

export interface PreprocessedScene {
  refs: SceneGraphRefs;
  orderedScene: Primitive[];
}

/**
 * 참조(id) 의존성을 기준으로 위상 정렬한다. 참조를 가진 어휘가 지금은 없다
 * 한 쌍만 실제로 의미가 있지만, 동일한 로직이 Phase 2 이후에 등장할 다른
 * 참조(ray → opticalElement 리스트 등)에도 쓰일 수 있도록 일반화해 둔다.
 *
 * 사이클이 감지되면 원본 순서를 유지한다(렌더러는 스킵하거나 경고만 남긴다).
 */
function topoSort(scene: readonly Primitive[]): Primitive[] {
  const idToIndex = new Map<string, number>();
  scene.forEach((p, i) => {
    if (p.id) idToIndex.set(p.id, i);
  });

  // 참조 의존을 가진 어휘가 지금은 없다. `fieldLine` 이 `vectorField` 를 따르던
  // 분기가 있었으나 두 어휘를 2026-09-12 에 선언에서 지웠다 — 렌더러가 없어
  // 저작자에게 거짓말을 하고 있었다 (S-render). 위상 정렬 자체는 남겨 둔다:
  // 다음에 참조를 가진 어휘가 오면 여기에 의존을 채운다.
  const deps: number[][] = scene.map(() => []);

  const order: number[] = [];
  const visited = new Array<0 | 1 | 2>(scene.length).fill(0);

  function visit(i: number): boolean {
    if (visited[i] === 2) return true;
    if (visited[i] === 1) return false; // 사이클
    visited[i] = 1;
    for (const d of deps[i]!) {
      if (!visit(d)) return false;
    }
    visited[i] = 2;
    order.push(i);
    return true;
  }

  for (let i = 0; i < scene.length; i++) {
    if (!visit(i)) {
      // 사이클 감지 시 원본 순서 반환.
      return [...scene];
    }
  }

  return order.map((i) => scene[i]!);
}

/**
 * 그리는 순서. 기본(`layer`)은 어휘별 z 층, `scene` 은 scene 에 쓴 순서 그대로
 * (먼저 쓴 것이 아래). 두 러너(`runBundle` · react `Canvas`)가 이것 하나를 부른다.
 *
 * **`preprocessScene` 의 `orderedScene` 을 받는다.** 원래 scene 을 받으면 참조
 * 의존(fieldLine → vectorField)이 풀리기 전 순서로 그린다. 정렬은 안정 정렬이라
 * 같은 층 안에서는 위상 정렬 순서가 남는다.
 */
export function orderForDrawing(
  ordered: readonly Primitive[],
  drawOrder: BundleSchema['drawOrder'],
  getZ: (type: string) => number,
): Primitive[] {
  if (drawOrder === 'scene') return [...ordered];
  return [...ordered].sort((a, b) => getZ(a.type) - getZ(b.type));
}

export function preprocessScene(scene: SceneGraph): PreprocessedScene {
  const refs = new SceneGraphRefsImpl(scene);
  const visible = scene.filter((p) => !p.hidden);
  const orderedScene = topoSort(visible);
  return { refs, orderedScene };
}
