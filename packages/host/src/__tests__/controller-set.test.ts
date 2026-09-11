/**
 * 조작기 등록부와 묶음 — 등록부는 만드는 법(클래스)만, 인스턴스는 선언(`id`)마다.
 *
 * 등록부가 인스턴스를 들고 있거나 묶음이 종류마다 하나만 만들면, 같은 조작기를 둘
 * 선언한 조각과 한 문서의 여러 임베드가 드래그 상태를 나눠 쓴다. 타입도 통과하고
 * 예외도 나지 않는다 (원칙 7, C5).
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec } from '@aperi21/schema';
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

const slider = (id: string): ControllerSpec => ({
  id,
  type: 'slider',
  binds: { value: id },
  range: [0, 1],
  label: { en: id },
});

/**
 * 묶음은 이제 `{spec, slot}` 을 받는다 — slot 을 세는 일은 거르기 전에
 * `visibleControllers` 가 한다 (visibility.test.ts).
 */
const entries = (...specs: ControllerSpec[]): { spec: ControllerSpec; slot: number }[] => {
  const slots = new Map<ControllerSpec['type'], number>();
  return specs.map((spec) => {
    const slot = slots.get(spec.type) ?? 0;
    slots.set(spec.type, slot + 1);
    return { spec, slot };
  });
};

function registry(): ControllerRegistry {
  const r = new ControllerRegistry();
  r.register('slider', () => fake('slider'));
  return r;
}

describe('ControllerSet', () => {
  it('선언 하나에 인스턴스 하나 — 같은 종류를 넷 선언하면 넷이다', () => {
    const resolved = registry()
      .createSet()
      .resolve(entries(slider('a'), slider('b'), slider('c'), slider('d')));
    expect(resolved).toHaveLength(4);
    expect(new Set(resolved.map((r) => r.impl)).size).toBe(4);
  });

  it('받은 slot 을 그대로 쓴다 — 다시 세지 않는다', () => {
    const resolved = registry()
      .createSet()
      .resolve([
        { spec: slider('a'), slot: 0 },
        // 앞의 것이 숨어도 뒤의 것은 제 자리를 지킨다.
        { spec: slider('b'), slot: 2 },
      ]);
    expect(resolved.map((r) => r.slot)).toEqual([0, 2]);
  });

  it('한 묶음 안에서는 같은 인스턴스다 — 드래그가 프레임을 넘어 이어진다', () => {
    const set = registry().createSet();
    const first = set.resolve(entries(slider('a')))[0]!.impl;
    const again = set.resolve(entries(slider('a')))[0]!.impl;
    expect(first).toBe(again);
  });

  it('묶음이 다르면(임베드가 다르면) 인스턴스도 다르다', () => {
    const r = registry();
    const a = r.createSet().resolve(entries(slider('a')))[0]!.impl;
    const b = r.createSet().resolve(entries(slider('a')))[0]!.impl;
    expect(a).not.toBe(b);
  });

  it('한 조각 안에서 id 가 겹치면 던진다 — 조용히 인스턴스를 나눠 쓰지 않는다', () => {
    expect(() => registry().createSet().resolve(entries(slider('a'), slider('a')))).toThrow();
  });

  it('같은 id 가 다른 종류로 바뀌면 던진다', () => {
    const r = registry();
    r.register('angle-dial', () => fake('angle-dial'));
    const set = r.createSet();
    set.resolve(entries(slider('a')));
    expect(() =>
      set.resolve(entries({ id: 'a', type: 'angle-dial', binds: { angle: 'a' } })),
    ).toThrow();
  });

  it('등록되지 않은 종류는 건너뛰고, 묶음을 만든 뒤 등록된 종류는 잡힌다', () => {
    const r = new ControllerRegistry();
    const set = r.createSet();
    expect(set.resolve(entries(slider('a')))).toHaveLength(0);
    r.register('slider', () => fake('slider'));
    expect(set.resolve(entries(slider('a')))).toHaveLength(1);
  });

  it('키와 다른 조작기를 만드는 팩토리는 던진다', () => {
    const r = new ControllerRegistry();
    r.register('slider', () => fake('angle-dial'));
    expect(() => r.createSet().resolve(entries(slider('a')))).toThrow();
  });

  it('같은 종류를 두 번 등록하면 던진다', () => {
    const r = registry();
    expect(() => r.register('slider', () => fake('slider'))).toThrow();
  });
});
