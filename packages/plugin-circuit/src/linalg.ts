/**
 * 소형 선형 시스템 Ax = b 에 대한 부분 피봇팅 가우스 소거법.
 * DC Circuit 규모(노드 수 ≤ 수십) 에서 충분한 성능·정확도.
 *
 * A 는 n×n 2차원 배열(행 주도), b 는 길이 n 배열. x 를 반환, 특이행렬은 null.
 */
export function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  // deep clone — A/b 보존
  const M: number[][] = A.map((row) => row.slice());
  const v: number[] = b.slice();

  for (let k = 0; k < n; k++) {
    // 부분 피봇팅
    let maxRow = k;
    let maxAbs = Math.abs(M[k]![k]!);
    for (let i = k + 1; i < n; i++) {
      const a = Math.abs(M[i]![k]!);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = i;
      }
    }
    if (maxAbs < 1e-12) return null;
    if (maxRow !== k) {
      [M[k], M[maxRow]] = [M[maxRow]!, M[k]!];
      [v[k], v[maxRow]] = [v[maxRow]!, v[k]!];
    }
    // 소거
    const pivot = M[k]![k]!;
    for (let i = k + 1; i < n; i++) {
      const factor = M[i]![k]! / pivot;
      if (factor === 0) continue;
      M[i]![k] = 0;
      for (let j = k + 1; j < n; j++) {
        M[i]![j]! -= factor * M[k]![j]!;
      }
      v[i]! -= factor * v[k]!;
    }
  }

  // 역대입
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = v[i]!;
    for (let j = i + 1; j < n; j++) {
      sum -= M[i]![j]! * x[j]!;
    }
    const pivot = M[i]![i]!;
    if (Math.abs(pivot) < 1e-12) return null;
    x[i] = sum / pivot;
  }
  return x;
}
