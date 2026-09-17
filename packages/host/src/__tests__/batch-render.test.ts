/**
 * 묶음 그리기 — 「선언은 묶음 하나, 그리기는 한 번」 (표현력 검증 턴 1 뒤, 장부 G29 · G30 · G32 · G37 · G40 · G41 · G43).
 * 그리기 호출 수가 항목 수가 아니라 불투명도 단계 수에 묶이는지, 생략하면 지금까지의 그림 그대로인지.
 */
import { afterEach, describe, expect, it } from 'vitest';
import type { LineSet, ParticleSystem, RenderContext, ScalarField, Vec2 } from '@aperi21/schema';
import { getTheme } from '../theme';
import { OPACITY_LEVELS, opacityBuckets, renderLineSet, renderParticleSystem, renderScalarField } from '../index';

function makeCtx(calls: string[]): CanvasRenderingContext2D {
  const target: Record<string, unknown> = {};
  return new Proxy(target, {
    get(_t, prop: string | symbol) {
      if (typeof prop !== 'string') return undefined;
      if (prop in target) return target[prop];
      return (...args: unknown[]) => {
        calls.push(prop === 'lineTo' ? `lineTo:${(args as number[]).map((n) => Math.round(n)).join(',')}` : prop);
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
  const scene = getTheme('light').scene;
  return {
    ctx: makeCtx(calls),
    store: <T,>(_k: string, init: () => T): T => init(),
    toScreen,
    toWorld: (s: Vec2): Vec2 => [s[0] / 10, (100 - s[1]) / 10],
    scale: 10,
    viewport: { width: 200, height: 200 },
    theme: scene,
    i18n: { resolve: () => '', t: () => '' } as unknown as RenderContext['i18n'],
    time: 0,
    deltaTime: 0,
    scene: { byId: () => undefined, ofType: () => [] },
    measure: { textWidth: () => 0 } as unknown as RenderContext['measure'],
  } as RenderContext;
}

const count = (calls: string[], name: string): number => calls.filter((c) => c === name).length;

describe('opacityBuckets', () => {
  it('생략하면 모든 항목이 알파 1 한 단계다', () => {
    expect(opacityBuckets(3, undefined)).toEqual([{ alpha: 1, indices: [0, 1, 2] }]);
  });

  it('단계 수를 넘지 않고, 알파 0 은 뺀다', () => {
    const opacities = Array.from({ length: 200 }, (_, i) => i / 199);
    const buckets = opacityBuckets(200, opacities);
    expect(buckets.length).toBeLessThanOrEqual(OPACITY_LEVELS);
    expect(buckets.flatMap((b) => b.indices)).not.toContain(0);
  });
});

describe('particleSystem 묶음', () => {
  const dots = (over: Partial<ParticleSystem>): ParticleSystem => ({
    type: 'particleSystem',
    positions: Array.from({ length: 50 }, (_, i): Vec2 => [i * 0.1, 1]),
    ...over,
  });

  it('생략하면 경로 하나를 한 번 채운다 (지금까지의 그림)', () => {
    const calls: string[] = [];
    renderParticleSystem(makeRc(calls), dots({}));
    expect(count(calls, 'fill')).toBe(1);
    expect(count(calls, 'stroke')).toBe(0);
  });

  it('입자별 불투명도는 단계마다 한 번씩만 채운다', () => {
    const calls: string[] = [];
    renderParticleSystem(makeRc(calls), dots({ opacities: Array.from({ length: 50 }, (_, i) => (i + 1) / 50) }));
    expect(count(calls, 'fill')).toBeLessThanOrEqual(OPACITY_LEVELS);
    expect(count(calls, 'fill')).toBeGreaterThan(1);
  });

  it('showParticles false 면 점을 그리지 않고, square 는 네모로 그린다', () => {
    const off: string[] = [];
    renderParticleSystem(
      makeRc(off),
      dots({ showParticles: false, trail: true, velocities: Array.from({ length: 50 }, (): Vec2 => [1, 0]) }),
    );
    expect(count(off, 'fill')).toBe(0);
    expect(count(off, 'stroke')).toBe(1);
    const sq: string[] = [];
    renderParticleSystem(makeRc(sq), dots({ shape: 'square' }));
    expect(count(sq, 'rect')).toBe(50);
    expect(count(sq, 'arc')).toBe(0);
  });

  it('trailStyle.maxLength 는 속도 획을 화면 px 상한으로 자른다', () => {
    const calls: string[] = [];
    renderParticleSystem(
      makeRc(calls),
      dots({
        positions: [[0, 0]],
        velocities: [[-1000, 0]],
        trail: true,
        trailStyle: { maxLength: 12 },
        showParticles: false,
      }),
    );
    // 입자는 화면 (0,100). 속도 반대(+x)로 획이 가지만 12 px 에서 멈추고, 끝은 입자 자리다.
    expect(calls).toContain('lineTo:0,100');
    expect(calls).toContain('moveTo');
  });
});

describe('lineSet', () => {
  const set = (over: Partial<LineSet>): LineSet => ({
    type: 'lineSet',
    lines: Array.from({ length: 300 }, (_, i): Vec2[] => [
      [i * 0.01, 0],
      [i * 0.01, 1],
    ]),
    ...over,
  });

  it('선이 수백 개여도 생략하면 한 번 긋는다', () => {
    const calls: string[] = [];
    renderLineSet(makeRc(calls), set({}));
    expect(count(calls, 'stroke')).toBe(1);
  });

  it('선별 불투명도는 단계 수만큼만 긋는다', () => {
    const calls: string[] = [];
    renderLineSet(makeRc(calls), set({ opacities: Array.from({ length: 300 }, (_, i) => (i + 1) / 300) }));
    expect(count(calls, 'stroke')).toBeLessThanOrEqual(OPACITY_LEVELS);
  });
});

describe('scalarField', () => {
  const original = (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas;
  afterEach(() => {
    (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas = original;
  });

  function installCanvas(): { data: Uint8ClampedArray[] } {
    const written: { data: Uint8ClampedArray[] } = { data: [] };
    (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas = class {
      constructor(public width: number, public height: number) {}
      getContext() {
        return {
          createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: (img: { data: Uint8ClampedArray }) => written.data.push(img.data),
        };
      }
    };
    return written;
  }

  const field = (over: Partial<ScalarField>): ScalarField => ({
    type: 'scalarField',
    min: [0, 0],
    max: [3, 1],
    cols: 3,
    rows: 1,
    values: [-1, 0, 1],
    range: [-1, 1],
    colors: { low: 'secondary', high: 'primary' },
    ...over,
  });

  it('칸이 몇 개든 이미지 한 장을 한 번 그린다', () => {
    installCanvas();
    const calls: string[] = [];
    renderScalarField(makeRc(calls), field({ cols: 100, rows: 80, values: new Array(8000).fill(0.3) }));
    expect(count(calls, 'drawImage')).toBe(1);
  });

  it('발산형은 가운데가 테마 바탕이고 끝이 두 역할 색이다', () => {
    const written = installCanvas();
    const calls: string[] = [];
    const rc = makeRc(calls);
    renderScalarField(rc, field({}));
    const px = written.data[0]!;
    const hex = (i: number): string =>
      '#' + [px[i * 4]!, px[i * 4 + 1]!, px[i * 4 + 2]!].map((v) => v.toString(16).padStart(2, '0')).join('');
    expect(hex(1).toLowerCase()).toBe(rc.theme.background.toLowerCase());
    expect(hex(0).toLowerCase()).toBe(rc.theme.resolveColor('secondary', 'strong').toLowerCase());
    expect(hex(2).toLowerCase()).toBe(rc.theme.resolveColor('primary', 'strong').toLowerCase());
  });

  it('캔버스를 만들 수 없는 환경에서는 그리지 않는다', () => {
    (globalThis as { OffscreenCanvas?: unknown }).OffscreenCanvas = undefined;
    const calls: string[] = [];
    renderScalarField(makeRc(calls), field({}));
    expect(count(calls, 'drawImage')).toBe(0);
  });
});
