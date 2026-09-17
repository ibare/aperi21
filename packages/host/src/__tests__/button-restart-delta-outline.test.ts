/**
 * 05-newtonian 에서 올린 손잡이 넷 — 누르는 단추 · 바꾸면 다시 놓기 · 차이 글자 끄기 ·
 * 화살표 바탕 테두리. 선언을 생략하면 지금까지의 그림·동작 그대로여야 한다.
 */
import { describe, expect, it } from 'vitest';
import type { ControllerSpec, RenderContext, Scale, Vec2, Vector } from '@aperi21/schema';
import { getTheme } from '../theme';
import {
  ButtonController,
  LinearTimeEngine,
  renderScale,
  renderVector,
  restartOnChange,
  type ControllerEventContext,
  type ControllerRenderContext,
} from '../index';

const BACKGROUND = getTheme('light').scene.background;

/** 호출 이름과 붓 색을 순서대로 적는 2D 컨텍스트 스텁. */
function makeCtx(calls: string[]): CanvasRenderingContext2D {
  const target: Record<string, unknown> = {};
  return new Proxy(target, {
    get(_t, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      if (prop in target) return target[prop];
      return (...args: unknown[]) => {
        calls.push(prop === 'fillText' ? `fillText:${String(args[0])}` : prop === 'stroke' ? `stroke:${String(target.strokeStyle)}` : prop);
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

describe('vector.outline', () => {
  const arrow = (over: Partial<Vector>): Vector => ({ type: 'vector', from: [0, 0], delta: [5, 0], ...over });

  it('생략하면 바탕색으로 긋지 않는다', () => {
    const calls: string[] = [];
    renderVector(makeRc(calls), arrow({}));
    expect(calls).not.toContain(`stroke:${BACKGROUND}`);
  });

  it("'background' 는 축과 머리를 바탕색으로 먼저 깔고 그 위에 긋는다", () => {
    const calls: string[] = [];
    renderVector(makeRc(calls), arrow({ outline: 'background' }));
    const strokes = calls.filter((c) => c.startsWith('stroke:'));
    expect(strokes.slice(0, 2)).toEqual([`stroke:${BACKGROUND}`, `stroke:${BACKGROUND}`]);
    expect(strokes[2]).not.toBe(`stroke:${BACKGROUND}`);
    expect(calls.indexOf(`stroke:${BACKGROUND}`)).toBeLessThan(calls.indexOf('fill'));
  });
});

describe('scale.showDelta', () => {
  const dial = (over: Partial<Scale>): Scale => ({
    type: 'scale',
    shape: 'dial',
    pos: [5, 5],
    size: 3,
    range: [0, 100],
    value: 72,
    origin: 60,
    digits: 0,
    ...over,
  });
  const deltaTexts = (calls: string[]): string[] => calls.filter((c) => c.startsWith('fillText:+') || c.startsWith('fillText:−'));

  it('생략하면 차이 글자를 쓴다 (지금까지의 그림)', () => {
    const calls: string[] = [];
    renderScale(makeRc(calls), dial({}));
    expect(deltaTexts(calls)).toEqual(['fillText:+12']);
  });

  it('false 면 차이 글자를 쓰지 않고 부채꼴은 그린다', () => {
    const on: string[] = [];
    const off: string[] = [];
    renderScale(makeRc(on), dial({}));
    renderScale(makeRc(off), dial({ showDelta: false }));
    expect(deltaTexts(off)).toEqual([]);
    expect(off.filter((c) => c === 'arc').length).toBe(on.filter((c) => c === 'arc').length);
  });
});

describe('scale(dial).labelAt', () => {
  const dial = (over: Partial<Scale>): Scale => ({
    type: 'scale',
    shape: 'dial',
    pos: [5, 5],
    size: 3,
    range: [30, 90],
    // 지금 값 글자(45)는 눈금 숫자와 가르기 위해 어떤 labelAt 과도 겹치지 않게 둔다.
    value: 45,
    digits: 0,
    ...over,
  });
  const tickNumbers = (calls: string[]): string[] => calls.filter((c) => /^fillText:\d+$/.test(c) && c !== 'fillText:45');

  it('생략하면 눈금 숫자가 없다 (지금까지의 그림)', () => {
    const calls: string[] = [];
    renderScale(makeRc(calls), dial({}));
    expect(tickNumbers(calls)).toEqual([]);
  });

  it('선언한 값에만 숫자를 붙인다', () => {
    const calls: string[] = [];
    renderScale(makeRc(calls), dial({ labelAt: [30, 60, 90] }));
    expect(tickNumbers(calls)).toEqual(['fillText:30', 'fillText:60', 'fillText:90']);
  });
});

describe('button', () => {
  type Spec = Extract<ControllerSpec, { type: 'button' }>;
  const spec: Spec = { id: 'release', type: 'button', binds: { pressed: 'release' }, label: { ko: '지금 놓기', en: 'Release now' } };

  function rendered(): ButtonController {
    const calls: string[] = [];
    const rc = {
      ctx: makeCtx(calls),
      ui: getTheme('light').ui,
      toScreen,
      viewport: { width: 400, height: 300 },
      slot: 0,
      i18n: { resolve: () => '지금 놓기', t: () => '' },
      measure: { textWidth: () => 40 },
    } as unknown as ControllerRenderContext;
    const button = new ButtonController();
    button.render(rc, spec, { release: false });
    return button;
  }
  const at = (b: ButtonController): { px: number; py: number; button: number; buttons: number } => {
    const box = b.screenBounds()!;
    return { px: box.x + box.w / 2, py: box.y + box.h / 2, button: 0, buttons: 1 };
  };
  const ctx = {} as ControllerEventContext;

  it('누르면 선언한 경로에 true 를 적는다', () => {
    const b = rendered();
    expect(b.onPointerDown(at(b), ctx, spec, { release: false, other: 1 })).toEqual({ release: true, other: 1 });
  });

  it('단추 밖을 누르면 상태를 바꾸지 않는다', () => {
    const b = rendered();
    const outside = { px: -50, py: -50, button: 0, buttons: 1 };
    expect(b.onPointerDown(outside, ctx, spec, { release: false })).toBeNull();
  });

  it('떼어도 되돌리지 않는다 — 소비하고 지우는 것은 조각의 step 이다', () => {
    const b = rendered();
    expect(b.onPointerUp()).toBeNull();
  });
});

describe('ControllerInstance.restart', () => {
  const slider = (restart?: boolean): ControllerSpec => ({
    id: 'diff',
    type: 'slider',
    binds: { value: 'diff' },
    range: [0, 2],
    label: { ko: '차이', en: 'Difference' },
    ...(restart === undefined ? {} : { restart }),
  });

  it('생략하면 시계를 건드리지 않는다', () => {
    const engine = new LinearTimeEngine();
    engine.start();
    engine.seek(3.2);
    restartOnChange(engine, slider());
    expect(engine.currentTime).toBe(3.2);
  });

  it('true 면 시계를 주기 첫머리(0)로 되돌린다', () => {
    const engine = new LinearTimeEngine();
    engine.start();
    engine.seek(3.2);
    restartOnChange(engine, slider(true));
    expect(engine.currentTime).toBe(0);
    expect(engine.state).toBe('running');
  });

  it('멈춘(terminated) 시계는 다시 흐르게 하고, 멈춰 둔(paused) 시계는 그대로 둔다', () => {
    const ended = new LinearTimeEngine();
    ended.start();
    ended.markTerminated();
    restartOnChange(ended, slider(true));
    expect(ended.state).toBe('running');

    const paused = new LinearTimeEngine();
    paused.start();
    paused.pause();
    restartOnChange(paused, slider(true));
    expect(paused.state).toBe('paused');
  });
});
