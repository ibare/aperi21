/**
 * 빛의 세기 채널 — 테마와 무관한 밝음 · 어둠 (장부 G34).
 * 색 역할은 테마마다 밝기가 뒤집히지만 빛은 뒤집히면 안 된다. 사각형이 아닌 영역은 NaN 칸으로 비운다.
 */
import { afterEach, describe, expect, it } from 'vitest';
import type { Body, RenderContext, ScalarField, Vec2 } from '@aperi21/schema';
import { getTheme } from '../theme';
import { lightColor, linearRgbOf, primitiveColor, renderScalarField } from '../index';

const brightness = (color: string): number => {
  const lin = linearRgbOf(color);
  if (!lin) throw new Error(`색을 읽지 못함: ${color}`);
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
};

function makeRc(mode: 'light' | 'dark'): RenderContext {
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (t, prop: string | symbol) => (typeof prop === 'string' && prop in t ? t[prop] : () => undefined),
    set: (t, prop: string | symbol, v: unknown) => {
      if (typeof prop === 'string') t[prop] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return {
    ctx,
    store: <T,>(_k: string, init: () => T): T => init(),
    toScreen: (w: Vec2): Vec2 => [w[0] * 10, 100 - w[1] * 10],
    toWorld: (s: Vec2): Vec2 => [s[0] / 10, (100 - s[1]) / 10],
    scale: 10,
    viewport: { width: 200, height: 200 },
    theme: getTheme(mode).scene,
    i18n: { resolve: () => '', t: () => '' } as unknown as RenderContext['i18n'],
    time: 0,
    deltaTime: 0,
    scene: { byId: () => undefined, ofType: () => [] },
    measure: { textWidth: () => 0 } as unknown as RenderContext['measure'],
  } as RenderContext;
}

describe('빛의 세기 채널', () => {
  it('어느 테마에서나 빛 없음이 가득 찬 빛보다 어둡다 — 역할 ink 는 테마마다 뒤집힌다', () => {
    for (const mode of ['light', 'dark'] as const) {
      const { light } = getTheme(mode).scene;
      expect(brightness(light.none)).toBeLessThan(brightness(light.full));
    }
    const inkLight = brightness(getTheme('light').scene.resolveColor('ink', 'strong'));
    const inkDark = brightness(getTheme('dark').scene.resolveColor('ink', 'strong'));
    expect(inkLight).toBeLessThan(inkDark);
  });

  it('light 는 선형광으로 섞여 세기 순서를 지킨다', () => {
    const rc = makeRc('light');
    const q = brightness(lightColor(rc, 0.25));
    const h = brightness(lightColor(rc, 0.5));
    expect(q).toBeLessThan(h);
    expect(brightness(lightColor(rc, 0))).toBeCloseTo(brightness(rc.theme.light.none), 3);
    expect(brightness(lightColor(rc, 1))).toBeCloseTo(brightness(rc.theme.light.full), 3);
  });

  it('primitiveColor 는 light 가 있으면 역할 · 강조를 보지 않는다', () => {
    for (const mode of ['light', 'dark'] as const) {
      const rc = makeRc(mode);
      const lit: Body = { type: 'body', shape: 'circle', pos: [0, 0], size: 1, light: 1, style: { colorRole: 'ink', emphasis: 'subtle' } };
      const unlit: Body = { ...lit, light: 0 };
      expect(brightness(primitiveColor(rc, lit))).toBeGreaterThan(brightness(primitiveColor(rc, unlit)));
    }
  });
});

describe("scalarField colors: 'light' · NaN", () => {
  const original = (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas;
  afterEach(() => {
    (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas = original;
  });

  function installCanvas(): Uint8ClampedArray[] {
    const written: Uint8ClampedArray[] = [];
    (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas = class {
      constructor(public width: number, public height: number) {}
      getContext() {
        return {
          createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: (img: { data: Uint8ClampedArray }) => written.push(img.data),
        };
      }
    };
    return written;
  }

  const field: ScalarField = {
    type: 'scalarField',
    min: [0, 0],
    max: [3, 1],
    cols: 3,
    rows: 1,
    values: [0, 1, Number.NaN],
    range: [0, 1],
    colors: 'light',
  };

  it('두 테마에서 값 1 칸이 값 0 칸보다 밝고, NaN 칸은 투명이다', () => {
    for (const mode of ['light', 'dark'] as const) {
      const written = installCanvas();
      renderScalarField(makeRc(mode), field);
      const px = written[0]!;
      const at = (i: number): string =>
        `rgb(${px[i * 4]!}, ${px[i * 4 + 1]!}, ${px[i * 4 + 2]!})`;
      expect(brightness(at(1))).toBeGreaterThan(brightness(at(0)));
      expect(px[0 * 4 + 3]).toBe(255);
      expect(px[2 * 4 + 3]).toBe(0);
    }
  });

  it('역할 색 모드에서도 NaN 칸은 칠하지 않는다', () => {
    const written = installCanvas();
    renderScalarField(makeRc('light'), { ...field, colors: { high: 'primary' } });
    expect(written[0]![2 * 4 + 3]).toBe(0);
    expect(written[0]![1 * 4 + 3]).toBe(255);
  });
});
