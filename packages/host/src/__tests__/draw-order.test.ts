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

  it("'scene' 이어도 참조 의존은 지킨다 — 위상 정렬 결과를 받기 때문", () => {
    const refScene = [prim('fieldLine', 'line', { follows: 'field' }), prim('vectorField', 'field')];
    const { orderedScene } = preprocessScene(refScene);
    expect(ids(orderForDrawing(orderedScene, 'scene', getZ))).toEqual(['field', 'line']);
  });
});
