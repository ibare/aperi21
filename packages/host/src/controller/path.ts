/**
 * 'launch.v0' 같은 dot notation 경로로 state 를 읽고 쓰는 유틸.
 * Controller 가 Bundle state 를 건드릴 때 경로 기반으로 immutable update 한다.
 */

export function readPath<T = unknown>(state: unknown, path: string): T | undefined {
  if (!path) return state as T;
  const segs = path.split('.');
  let cur: unknown = state;
  for (const seg of segs) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur as T;
}

/**
 * 경로에 value 를 쓴 새 객체 반환. 원본은 건드리지 않는다. 중간 경로가 객체가
 * 아니면 빈 객체로 대체한다.
 */
export function writePath<S>(state: S, path: string, value: unknown): S {
  if (!path) return value as S;
  const segs = path.split('.');
  return writeRecursive(state as unknown, segs, 0, value) as S;
}

function writeRecursive(node: unknown, segs: string[], i: number, value: unknown): unknown {
  const key = segs[i]!;
  const isLeaf = i === segs.length - 1;
  const base =
    node && typeof node === 'object' && !Array.isArray(node)
      ? (node as Record<string, unknown>)
      : {};
  if (isLeaf) {
    return { ...base, [key]: value };
  }
  const child = base[key];
  return { ...base, [key]: writeRecursive(child, segs, i + 1, value) };
}
