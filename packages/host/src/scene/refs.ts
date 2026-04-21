import type { Primitive, SceneGraph, SceneGraphRefs } from '@aperi21/schema';

export class SceneGraphRefsImpl implements SceneGraphRefs {
  private readonly byIdMap: Map<string, Primitive>;
  private readonly byTypeMap: Map<string, Primitive[]>;

  constructor(scene: SceneGraph) {
    this.byIdMap = new Map();
    this.byTypeMap = new Map();

    for (const primitive of scene) {
      if (primitive.id) {
        this.byIdMap.set(primitive.id, primitive);
      }
      const bucket = this.byTypeMap.get(primitive.type);
      if (bucket) {
        bucket.push(primitive);
      } else {
        this.byTypeMap.set(primitive.type, [primitive]);
      }
    }
  }

  byId(id: string): Primitive | undefined {
    return this.byIdMap.get(id);
  }

  ofType<T extends Primitive['type']>(type: T): Extract<Primitive, { type: T }>[] {
    const bucket = this.byTypeMap.get(type) ?? [];
    return bucket as Extract<Primitive, { type: T }>[];
  }
}
