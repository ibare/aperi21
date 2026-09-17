/**
 * 결과 손잡이 — 선언을 생략하면 지금까지의 그림 그대로여야 한다.
 *
 * `region.fill: 'hatch'` 의 clip 은 따로 가둬야 한다. 가두지 않으면 뒤에 긋는 굵은
 * 변이 폴리곤 밖 절반을 잃는데 예외도 없다. `point-drag.handle: 'ring'` 은 채우지 않는다 —
 * 채우면 아래 화살표 머리를 가린다.
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec, Region, RenderContext, Vec2 } from '@aperi21/schema';
import { getTheme } from '../theme';
import { PointDragController, renderRegion, type ControllerRenderContext } from '../index';

/** 호출 이름을 순서대로 적는 2D 컨텍스트 스텁. jsdom 은 진짜 컨텍스트를 주지 않는다. */
function makeCtx(calls: string[]): CanvasRenderingContext2D {
  return new Proxy(
    {},
    {
      get(_t, prop: string | symbol) {
        if (typeof prop !== 'string') return undefined;
        return () => {
          calls.push(prop);
        };
      },
      set: () => true,
    },
  ) as CanvasRenderingContext2D;
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

const square = (over: Partial<Region>): Region => ({
  type: 'region',
  points: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  outline: [[0, 1]],
  ...over,
});

describe('region.fill', () => {
  it('생략하면 clip 도 사선도 없다', () => {
    const calls: string[] = [];
    renderRegion(makeRc(calls), square({}));
    expect(calls).not.toContain('clip');
  });

  it("'hatch' 의 clip 은 굵은 변을 긋기 전에 풀린다", () => {
    const calls: string[] = [];
    renderRegion(makeRc(calls), square({ fill: 'hatch' }));
    const clip = calls.indexOf('clip');
    expect(clip).toBeGreaterThan(-1);
    const released = calls.indexOf('restore', clip);
    const outlineStroke = calls.lastIndexOf('stroke');
    expect(released).toBeGreaterThan(-1);
    expect(released).toBeLessThan(outlineStroke);
    expect(calls.filter((c) => c === 'save').length).toBe(calls.filter((c) => c === 'restore').length);
  });
});

describe('point-drag.handle', () => {
  type Spec = Extract<ControllerSpec, { type: 'point-drag' }>;
  const spec = (over: Partial<Spec>): Spec => ({
    id: 'tip',
    type: 'point-drag',
    binds: { pos: 'tip', held: 'held' },
    ...over,
  });
  const draw = (s: Spec): string[] => {
    const calls: string[] = [];
    const rc = {
      ctx: makeCtx(calls),
      ui: getTheme('light').ui,
      toScreen,
    } as unknown as ControllerRenderContext;
    new PointDragController().render(rc, s, { tip: [1, 1], held: false });
    return calls;
  };

  it("생략하면 채운 점이다 (지금까지의 그림)", () => {
    expect(draw(spec({}))).toContain('fill');
  });

  it("'ring' 은 채우지 않고 테두리만 긋는다", () => {
    const calls = draw(spec({ handle: 'ring' }));
    expect(calls).not.toContain('fill');
    expect(calls).toContain('stroke');
  });
});
