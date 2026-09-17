/**
 * 06-newtonian 에서 올린 것 — 그림 속 자리 누르기.
 * 선언을 생략하면 지금까지의 그림·동작 그대로여야 한다.
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec, RenderContext, Vec2 } from '@aperi21/schema';
import { getTheme } from '../theme';
import { PressAreaController, type ControllerEventContext } from '../index';

/** 호출 이름과 붓 색을 순서대로 적는 2D 컨텍스트 스텁. */
function makeCtx(calls: string[]): CanvasRenderingContext2D {
  const target: Record<string, unknown> = {};
  return new Proxy(target, {
    get(_t, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      if (prop in target) return target[prop];
      return (...args: unknown[]) => {
        calls.push(prop === 'stroke' ? `stroke@${String(target.lineDashOffset ?? 'unset')}` : prop);
        void args;
        return { width: 0 };
      };
    },
    set(_t, prop: string | symbol, value: unknown) {
      if (typeof prop === 'string') target[prop] = value;
      return true;
    },
  }) as CanvasRenderingContext2D;
}

const toScreen = (w: Vec2): Vec2 => [w[0] * 10, 100 - w[1] * 10];

function makeRc(calls: string[]): RenderContext {
  return {
    ctx: makeCtx(calls),
    store: <T,>(_k: string, init: () => T): T => init(),
    toScreen,
    toWorld: (s: Vec2): Vec2 => [s[0] / 10, (100 - s[1]) / 10],
    scale: 10,
    viewport: { width: 200, height: 200 },
    theme: { ...getTheme('light').scene, resolveColor: () => '#123456' },
    i18n: { resolve: () => '', t: () => '' } as unknown as RenderContext['i18n'],
    time: 0,
    deltaTime: 0,
    scene: { byId: () => undefined, ofType: () => [] },
    measure: { textWidth: () => 0 } as unknown as RenderContext['measure'],
  } as RenderContext;
}

describe('press-area', () => {
  type Spec = Extract<ControllerSpec, { type: 'press-area' }>;
  const spec: Spec = { id: 'cup', type: 'press-area', binds: { pressed: 'press.cup' }, area: { min: [1, 1], max: [3, 2] } };
  // 월드 [1,1]~[3,2] → 화면 x 10~30, y 80~90.
  const ctx = { toScreen } as unknown as ControllerEventContext;
  const at = (px: number, py: number) => ({ px, py, button: 0, buttons: 1 });

  it('자리 안을 누르면 선언한 경로에 true 를 적는다', () => {
    const c = new PressAreaController();
    expect(c.hitTest(at(20, 85), ctx, spec)).toBe(true);
    expect(c.onPointerDown(at(20, 85), ctx, spec, { press: { cup: false }, other: 1 })).toEqual({ press: { cup: true }, other: 1 });
  });

  it('자리 밖은 잡지 않는다', () => {
    const c = new PressAreaController();
    expect(c.hitTest(at(20, 70), ctx, spec)).toBe(false);
    expect(c.onPointerDown(at(40, 85), ctx, spec, { press: { cup: false } })).toBeNull();
  });

  it('그리지 않고, 화면 상자를 비우게 하지 않는다', () => {
    const c = new PressAreaController();
    expect(c.render()).toBeUndefined();
    expect('screenBounds' in c).toBe(false);
  });
});

