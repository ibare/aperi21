import type { ScalarComputeFn, VectorComputeFn } from '@aperi21/schema';

/**
 * Compute 메서드 레지스트리. 벡터장과 스칼라장 메서드를 독립 네임스페이스로 관리.
 * 등록 실패(이름 충돌)는 throw 한다.
 */
export class ComputeRegistry {
  private readonly vectorMethods = new Map<string, VectorComputeFn>();
  private readonly scalarMethods = new Map<string, ScalarComputeFn>();

  registerVector(name: string, fn: VectorComputeFn): void {
    if (this.vectorMethods.has(name)) {
      throw new Error(`[aperi21] vector compute method '${name}' already registered`);
    }
    this.vectorMethods.set(name, fn);
  }

  registerScalar(name: string, fn: ScalarComputeFn): void {
    if (this.scalarMethods.has(name)) {
      throw new Error(`[aperi21] scalar compute method '${name}' already registered`);
    }
    this.scalarMethods.set(name, fn);
  }

  unregisterVector(name: string): void {
    this.vectorMethods.delete(name);
  }

  unregisterScalar(name: string): void {
    this.scalarMethods.delete(name);
  }

  getVector(name: string): VectorComputeFn | undefined {
    return this.vectorMethods.get(name);
  }

  getScalar(name: string): ScalarComputeFn | undefined {
    return this.scalarMethods.get(name);
  }

  hasVector(name: string): boolean {
    return this.vectorMethods.has(name);
  }

  hasScalar(name: string): boolean {
    return this.scalarMethods.has(name);
  }

  listVector(): string[] {
    return [...this.vectorMethods.keys()];
  }

  listScalar(): string[] {
    return [...this.scalarMethods.keys()];
  }
}
