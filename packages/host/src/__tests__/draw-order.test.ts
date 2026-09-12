/**
 * 그리는 순서 — 어휘별 층(`layer`)과 scene 에 쓴 순서(`scene`).
 *
 * 순서가 틀려도 타입은 통과하고 예외도 나지 않는다. "말뚝을 띠 위에 긋는다" 처럼
 * 겹침이 판정 장치인 그림에서는 그림이 조용히 거짓말을 한다.
 */
import { describe, expect, it } from 'vitest';
import type { Primitive } from '@aperi21/schema';
import { orderForDrawing, preprocessScene } from '../index';

const Z: Record<string, number> = { vectorField: 0, trajectory: 20, region: 45 };
const getZ = (type: string): number => Z[type] ?? 100;

const prim = (type: string, id: string, extra: object = {}): Primitive =>
  ({ type, id, ...extra }) as unknown as Primitive;

const ids = (scene: readonly Primitive[]): (string | undefined)[] => scene.map((p) => p.id);

describe('orderForDrawing', () => {
  const scene = [prim('region', 'band'), prim('trajectory', 'stake'), prim('region', 'column')];

  it('기본은 어휘별 층 — 같은 층 안에서는 쓴 순서가 남는다', () => {
    expect(ids(orderForDrawing(scene, undefined, getZ))).toEqual(['stake', 'band', 'column']);
    expect(ids(orderForDrawing(scene, 'layer', getZ))).toEqual(['stake', 'band', 'column']);
  });

  it("'scene' 이면 쓴 순서 그대로 — 먼저 쓴 것이 아래", () => {
    expect(ids(orderForDrawing(scene, 'scene', getZ))).toEqual(['band', 'stake', 'column']);
  });

  it("'scene' 이어도 전처리를 거친 순서를 받는다", () => {
    // 참조 의존을 가진 어휘가 지금은 없다(`fieldLine` 과 함께 지웠다). 전처리를
    // 지나도 쓴 순서가 보존되는 것만 잰다 — 다음에 참조 어휘가 오면 여기에
    // 의존 사례를 되살린다.
    const refScene = [prim('trace', 'marks'), prim('body', 'ball')];
    const { orderedScene } = preprocessScene(refScene);
    expect(ids(orderForDrawing(orderedScene, 'scene', getZ))).toEqual(['marks', 'ball']);
  });
});
