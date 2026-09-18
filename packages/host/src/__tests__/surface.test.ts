/**
 * 면(`surface`) — 선언한 모양과 재질이 그대로 그려지는가.
 *
 * `arc` 와 `material` 은 오래 선언만 있고 렌더러가 읽지 않았다(장부 G119 · G138). 조각들은
 * 예외 없이 아무것도 안 그려지는 것을 보고 선으로 우회했다. 여기서는 분기마다 실제로
 * 캔버스 호출이 달라지는지를 본다 — 다시 선언만 남는 일이 생기면 여기서 깨진다.
 */
import { describe, expect, it } from 'vitest';
import { getTheme } from '../theme';
import type { RenderContext, Surface, Vec2 } from '@aperi21/schema';
import { renderSurface } from '../index';

interface Recorder {
  calls: string[];
  alphas: number[];
  dashes: string[];
}

/** 호출을 기록하는 2D 컨텍스트 스텁. jsdom 은 진짜 컨텍스트를 주지 않는다. */
function makeCtx(rec: Recorder): CanvasRenderingContext2D {
  return new Proxy(
    {},
    {
      get(_t, prop: string | symbol) {
        if (typeof prop !== 'string') return undefined;
        if (prop === 'measureText') return () => ({ width: 0 });
        return (...args: unknown[]) => {
          if (prop === 'setLineDash') rec.dashes.push(JSON.stringify(args[0]));
          rec.calls.push(`${prop}(${args.map((a) => String(a)).join(',')})`);
        };
      },
      set(_t, prop, value) {
        if (prop === 'globalAlpha') rec.alphas.push(value as number);
        return true;
      },
    },
  ) as CanvasRenderingContext2D;
}

function makeRc(rec: Recorder): RenderContext {
  return {
    ctx: makeCtx(rec),
    store: <T,>(_k: string, init: () => T): T => init(),
    // 월드 1 = 화면 10px, y 는 뒤집힌다.
    toScreen: (w: Vec2): Vec2 => [w[0] * 10, 100 - w[1] * 10],
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

const draw = (s: Omit<Surface, 'type'>): Recorder => {
  const rec: Recorder = { calls: [], alphas: [], dashes: [] };
  renderSurface(makeRc(rec), { type: 'surface', ...s } as Surface, {
    byId: () => undefined,
    ofType: () => [],
  });
  return rec;
};

const count = (rec: Recorder, name: string): number =>
  rec.calls.filter((c) => c.startsWith(`${name}(`)).length;

describe('renderSurface', () => {
  it('arc 는 원호 하나를 긋는다 — 각은 월드 반시계, 화면에서는 부호가 뒤집힌다', () => {
    const rec = draw({ geometry: { kind: 'arc', center: [1, 2], radius: 3, from: 0, to: Math.PI / 2 } });
    const arcs = rec.calls.filter((c) => c.startsWith('arc('));
    expect(arcs).toHaveLength(1);
    // 중심 (1,2) → 화면 (10, 80), 반지름 3 → 30px, 0 → -π/2, 반시계.
    expect(arcs[0]).toBe(`arc(10,80,30,0,${-Math.PI / 2},true)`);
    expect(count(rec, 'fillRect')).toBe(0);
  });

  it('arc 의 to 가 from 보다 작으면 시계 방향으로 긋는다', () => {
    const rec = draw({ geometry: { kind: 'arc', center: [0, 0], radius: 1, from: Math.PI, to: 0 } });
    expect(rec.calls.find((c) => c.startsWith('arc('))).toMatch(/,false\)$/);
  });

  it('solid 바닥은 선과 옅은 띠 — 재질을 안 적으면 solid', () => {
    const solid = draw({ geometry: { kind: 'ground', y: 0 }, material: 'solid' });
    const bare = draw({ geometry: { kind: 'ground', y: 0 } });
    expect(count(solid, 'fillRect')).toBe(1);
    expect(solid.calls).toEqual(bare.calls);
  });

  it('smooth 는 결 없는 면 — solid 와 같은 그림이다', () => {
    const smooth = draw({ geometry: { kind: 'ground', y: 0 }, material: 'smooth' });
    const solid = draw({ geometry: { kind: 'ground', y: 0 }, material: 'solid' });
    expect(smooth.calls).toEqual(solid.calls);
  });

  it('transparent 는 경계선만 옅은 점선 — 띠(아래 매질)는 그대로 깐다', () => {
    const rec = draw({ geometry: { kind: 'ground', y: 0 }, material: 'transparent' });
    expect(count(rec, 'fillRect')).toBe(1);
    expect(rec.dashes.some((d) => d !== '[]')).toBe(true);
    expect(rec.alphas.some((a) => a > 0.5 && a < 1)).toBe(true);
  });

  it('rough 는 solid 에 결 사선을 더 긋는다 — 바닥은 화면 폭만큼만', () => {
    const solid = draw({ geometry: { kind: 'ground', y: 0 }, material: 'solid' });
    const rough = draw({ geometry: { kind: 'ground', y: 0 }, material: 'rough' });
    const extraMoves = count(rough, 'moveTo') - count(solid, 'moveTo');
    // 화면 폭 200px ÷ 간격 7px ≈ 28 획. 월드 ±1000 을 다 긋지 않는다.
    expect(extraMoves).toBeGreaterThan(20);
    expect(extraMoves).toBeLessThan(40);
  });

  it('rough 벽의 결은 월드에서 from→to 의 오른쪽 — 동쪽으로 뻗은 바닥이면 아래(화면 y 증가)', () => {
    const rec = draw({ geometry: { kind: 'wall', from: [0, 5], to: [10, 5] }, material: 'rough' });
    // 바닥선은 화면 y = 50. 결 사선의 끝(lineTo)은 그보다 아래여야 한다.
    const ends = rec.calls
      .filter((c) => c.startsWith('lineTo('))
      .map((c) => Number(c.slice(7, -1).split(',')[1]))
      .filter((y) => y !== 50);
    expect(ends.length).toBeGreaterThan(5);
    expect(ends.every((y) => y > 50)).toBe(true);
  });

  it('rough 벽 · 원호도 결을 긋는다', () => {
    const wall = draw({ geometry: { kind: 'wall', from: [0, 0], to: [5, 0] }, material: 'rough' });
    const arc = draw({
      geometry: { kind: 'arc', center: [0, 0], radius: 2, from: 0, to: Math.PI },
      material: 'rough',
    });
    expect(count(wall, 'moveTo')).toBeGreaterThan(1);
    expect(count(arc, 'moveTo')).toBeGreaterThan(1);
  });

  it('선언한 색 역할을 따른다 — 선언이 없으면 전경색', () => {
    const colors: string[] = [];
    const rec: Recorder = { calls: [], alphas: [], dashes: [] };
    const rc = makeRc(rec);
    const ctx = new Proxy(rc.ctx, {
      set(t, prop, value) {
        if (prop === 'strokeStyle') colors.push(String(value));
        return Reflect.set(t, prop, value);
      },
    });
    const withCtx = { ...rc, ctx } as RenderContext;
    const scene = { byId: () => undefined, ofType: () => [] };
    renderSurface(withCtx, { type: 'surface', geometry: { kind: 'wall', from: [0, 0], to: [1, 0] } } as Surface, scene);
    renderSurface(
      withCtx,
      { type: 'surface', geometry: { kind: 'wall', from: [0, 0], to: [1, 0] }, style: { colorRole: 'muted' } } as Surface,
      scene,
    );
    expect(colors[0]).toBe(rc.theme.foreground);
    expect(colors[1]).toBe('#123456');
  });
});
