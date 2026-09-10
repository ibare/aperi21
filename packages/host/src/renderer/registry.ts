import type { PrimitiveRenderer } from '@aperi21/schema';

/**
 * `docs/06-renderer-spec.md` §2 의 기본 z-layer. 프리미티브 타입이 명시적
 * zHint 를 갖지 않을 때 적용된다.
 */
export const DEFAULT_Z_LAYERS: Readonly<Record<string, number>> = {
  // 0: 배경 장
  vectorField: 0,
  scalarField: 0,
  // 소용돌이 장은 **실보다 먼저 돌아야 한다** — 같은 프레임의 실이 갱신된
  // 장을 봐야 하기 때문이다.
  vortexField: 0,
  // 10: 구조물
  surface: 10,
  container: 10,
  opticalElement: 12,
  wire: 11,
  // 20: 궤적 · 장선
  trajectory: 20,
  fieldLine: 20,
  ray: 22,
  // 30: 파동 · 실
  wave: 30,
  // 실은 매질(45) 아래, 구조물 위 — 관 안을 흐르는 것이라 벽에 가리지 않는다.
  filament: 34,
  // 40: 물체
  body: 40,
  charge: 40,
  coil: 40,
  circuitElement: 40,
  terminal: 41,
  particleSystem: 40,
  // 45: 매질 · 흐름
  //
  // **물체(40) 위에 온다.** 반투명하게 덮여야 잠긴 것이 아래로 비쳐 보이고,
  // 그래야 "잠겼다" 로 읽힌다. 물체 아래로 깔면 물에 들어간 것이 물 밖에 있는
  // 것처럼 보인다.
  region: 45,
  stream: 46,
  // 50: 벡터 · 이벤트
  vector: 50,
  axis: 50,
  event: 50,
  // 60: 주석 · 값
  marker: 60,
  gauge: 60,
  dimension: 58,
  scale: 61,
  // 값은 주석 위 — 가려지면 읽을 수 없다.
  readout: 62,
  // 70: 스크린 오버레이
  graph: 70,
  energyLevels: 65,
  // Emitter 는 source 자체라 벡터 레이어에 가깝게.
  emitter: 40,
};

export class RendererRegistry {
  private readonly renderers = new Map<string, PrimitiveRenderer>();
  private readonly zOverrides = new Map<string, number>();

  register(type: string, renderer: PrimitiveRenderer, zHint?: number): void {
    if (this.renderers.has(type)) {
      throw new Error(`[aperi21] renderer for primitive type '${type}' already registered`);
    }
    this.renderers.set(type, renderer);
    if (typeof zHint === 'number') {
      this.zOverrides.set(type, zHint);
    }
  }

  unregister(type: string): void {
    this.renderers.delete(type);
    this.zOverrides.delete(type);
  }

  get(type: string): PrimitiveRenderer | undefined {
    return this.renderers.get(type);
  }

  has(type: string): boolean {
    return this.renderers.has(type);
  }

  /** 타입의 z-layer 를 돌려준다. override → default → 100 (미지정 타입 후순위). */
  getZ(type: string): number {
    return this.zOverrides.get(type) ?? DEFAULT_Z_LAYERS[type] ?? 100;
  }

  listTypes(): string[] {
    return [...this.renderers.keys()];
  }
}
