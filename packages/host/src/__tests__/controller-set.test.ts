/**
 * 조작기 등록부와 묶음 — 등록부는 만드는 법만, 인스턴스는 임베드마다.
 *
 * host 는 문서 전체가 공유한다. 등록부가 인스턴스를 들고 있으면 한 문서의 모든 임베드가
 * 조작기의 드래그 상태를 나눠 쓴다. 타입도 통과하고 예외도 나지 않는다.
 */
import { describe, expect, it } from 'vitest';
import { ControllerRegistry, type ControllerImpl } from '../index';

function fake(type: ControllerImpl['type']): ControllerImpl {
  return {
    type,
    render: () => undefined,
    hitTest: () => false,
    onPointerDown: () => null,
    onPointerMove: () => null,
    onPointerUp: () => null,
    isDragging: () => false,
  };
}

describe('ControllerRegistry · ControllerSet', () => {
  it('묶음이 다르면 인스턴스도 다르다', () => {
    const registry = new ControllerRegistry();
    registry.register('slider', () => fake('slider'));
    const a = registry.createSet().get('slider');
    const b = registry.createSet().get('slider');
    expect(a).toBeDefined();
    expect(a).not.toBe(b);
  });

  it('한 묶음 안에서는 같은 인스턴스다 — 드래그가 프레임을 넘어 이어진다', () => {
    const registry = new ControllerRegistry();
    registry.register('slider', () => fake('slider'));
    const set = registry.createSet();
    expect(set.get('slider')).toBe(set.get('slider'));
  });

  it('등록되지 않은 type 은 없다. 묶음을 만든 뒤 등록된 type 은 잡힌다', () => {
    const registry = new ControllerRegistry();
    const set = registry.createSet();
    expect(set.get('slider')).toBeUndefined();
    registry.register('slider', () => fake('slider'));
    expect(set.get('slider')?.type).toBe('slider');
  });

  it('키와 다른 조작기를 만드는 팩토리는 던진다', () => {
    const registry = new ControllerRegistry();
    registry.register('slider', () => fake('angle-dial'));
    expect(() => registry.createSet().get('slider')).toThrow();
  });

  it('같은 type 을 두 번 등록하면 던진다', () => {
    const registry = new ControllerRegistry();
    registry.register('slider', () => fake('slider'));
    expect(() => registry.register('slider', () => fake('slider'))).toThrow();
  });
});
