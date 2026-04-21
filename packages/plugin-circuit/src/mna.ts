import { solveLinear } from './linalg';

/**
 * Modified Nodal Analysis (MNA) DC 솔버.
 *
 * 소자:
 *  - resistor: 두 노드 사이 저항.
 *  - voltageSource: 두 노드 사이 EMF (기준점 → 양극). MNA 확장 전류 변수 추가.
 *  - currentSource: 두 노드 사이 정전류원 (기준점 → 양극으로 전류가 유입된다고 가정; 부호 반대인 경우 음수).
 *  - switch: closed 면 0Ω resistor, open 이면 회로에서 빠짐.
 *  - ground: ref node 를 강제로 노드 0 에 정렬. 여러 개 있으면 모두 노드 0.
 *
 * 입력: MnaElement 배열 (노드 id 는 문자열). 노드 0 은 자동으로 ground.
 *   명시적 `ground` 소자가 있으면 해당 노드를 ground 와 병합.
 *
 * 반환: { nodeVoltages: Record<nodeId, V>, branchCurrents: Record<elementId, A> } | null (특이/모순)
 */

export type MnaElementKind =
  | 'resistor'
  | 'voltageSource'
  | 'currentSource'
  | 'switch'
  | 'ground';

export interface MnaElement {
  id: string;
  kind: MnaElementKind;
  /** a 는 + 단자, b 는 − 단자. ground 는 a 만 사용. */
  a: string;
  b?: string;
  /** resistor: Ω, voltageSource: V, currentSource: A (a→b 로 흐르는 전류) */
  value?: number;
  /** switch 전용. */
  state?: 'open' | 'closed';
}

export interface MnaSolution {
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
}

export function solveMna(elements: readonly MnaElement[]): MnaSolution | null {
  // 1. 노드 수집 + ground 병합
  const groundNodes = new Set<string>();
  for (const el of elements) {
    if (el.kind === 'ground') groundNodes.add(el.a);
  }
  // ground 가 없으면 임의의 첫 노드를 기준으로 삼는다.
  let implicitGround: string | null = null;
  if (groundNodes.size === 0) {
    for (const el of elements) {
      if (el.kind === 'resistor' || el.kind === 'voltageSource' || el.kind === 'currentSource') {
        implicitGround = el.a;
        break;
      }
    }
    if (implicitGround) groundNodes.add(implicitGround);
  }

  const nodeSet = new Set<string>();
  for (const el of elements) {
    nodeSet.add(el.a);
    if (el.b) nodeSet.add(el.b);
  }
  // 인덱싱: ground 노드는 모두 0 번(행렬에서 제외). 나머지는 1..n
  const nonGround = [...nodeSet].filter((n) => !groundNodes.has(n));
  nonGround.sort();
  const nodeIndex = new Map<string, number>();
  for (const g of groundNodes) nodeIndex.set(g, 0);
  nonGround.forEach((n, i) => nodeIndex.set(n, i + 1));
  const n = nonGround.length;

  // 2. voltage sources 를 확장 변수로 추가 (MNA 2형식).
  //    switch 가 closed 이면 저항 0Ω 으로 처리 — 여기서는 매우 작은 저항 대신
  //    0V 전압원으로 모델링해서 전류를 정확히 추적 가능하게 함.
  const vsrcs: Array<{ el: MnaElement; effective: number }> = [];
  for (const el of elements) {
    if (el.kind === 'voltageSource') {
      vsrcs.push({ el, effective: el.value ?? 0 });
    } else if (el.kind === 'switch' && el.state === 'closed') {
      vsrcs.push({ el, effective: 0 });
    }
  }
  const m = vsrcs.length;
  const size = n + m;
  if (size === 0) {
    // 아무 것도 풀 게 없음
    return { nodeVoltages: Object.fromEntries([...groundNodes].map((g) => [g, 0])), branchCurrents: {} };
  }

  const A: number[][] = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const b: number[] = new Array<number>(size).fill(0);

  const gIdx = (node: string): number => nodeIndex.get(node)!; // 0=ground, >0 otherwise

  // 3. resistor 채움 (ground=0 행/열은 스킵)
  for (const el of elements) {
    if (el.kind !== 'resistor' || !el.b) continue;
    const R = el.value ?? 0;
    if (R <= 0) return null; // 0Ω 이면 단락 — switch 방식으로 넣어야 함
    const g = 1 / R;
    const ia = gIdx(el.a);
    const ib = gIdx(el.b);
    if (ia > 0) A[ia - 1]![ia - 1]! += g;
    if (ib > 0) A[ib - 1]![ib - 1]! += g;
    if (ia > 0 && ib > 0) {
      A[ia - 1]![ib - 1]! -= g;
      A[ib - 1]![ia - 1]! -= g;
    }
  }

  // 4. current sources (a→b 로 전류 I 가 흐른다; KCL 에서 a 에서 나가고 b 로 들어감)
  for (const el of elements) {
    if (el.kind !== 'currentSource' || !el.b) continue;
    const I = el.value ?? 0;
    const ia = gIdx(el.a);
    const ib = gIdx(el.b);
    if (ia > 0) b[ia - 1]! -= I;
    if (ib > 0) b[ib - 1]! += I;
  }

  // 5. voltage sources — 각 소자마다 추가 전류 변수 j_k
  //    KCL 에 j_k 의 기여 삽입:
  //      node a: + j_k, node b: − j_k
  //    보조식: V(a) − V(b) = effective
  for (let k = 0; k < m; k++) {
    const { el, effective } = vsrcs[k]!;
    if (!el.b) return null;
    const row = n + k;
    const ia = gIdx(el.a);
    const ib = gIdx(el.b);
    if (ia > 0) {
      A[ia - 1]![row]! += 1;
      A[row]![ia - 1]! += 1;
    }
    if (ib > 0) {
      A[ib - 1]![row]! -= 1;
      A[row]![ib - 1]! -= 1;
    }
    b[row]! = effective;
  }

  const x = solveLinear(A, b);
  if (!x) return null;

  const nodeVoltages: Record<string, number> = {};
  for (const g of groundNodes) nodeVoltages[g] = 0;
  nonGround.forEach((name, i) => {
    nodeVoltages[name] = x[i]!;
  });

  const branchCurrents: Record<string, number> = {};
  for (let k = 0; k < m; k++) {
    branchCurrents[vsrcs[k]!.el.id] = x[n + k]!;
  }
  // resistor 전류도 계산 (a→b 방향)
  for (const el of elements) {
    if (el.kind === 'resistor' && el.b) {
      const R = el.value ?? 0;
      if (R > 0) {
        branchCurrents[el.id] = (nodeVoltages[el.a]! - nodeVoltages[el.b]!) / R;
      }
    } else if (el.kind === 'currentSource') {
      branchCurrents[el.id] = el.value ?? 0;
    } else if (el.kind === 'switch' && el.state === 'open') {
      branchCurrents[el.id] = 0;
    }
  }

  return { nodeVoltages, branchCurrents };
}
