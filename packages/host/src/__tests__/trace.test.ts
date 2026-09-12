/**
 * 자국(`trace`) — 지나간 자리의 목록.
 *
 * 조각 여섯이 각자 짜던 것이라 여기서 흔들리면 그 조각들이 같이 흔들린다. 특히
 * **나이를 주지 않은 자국은 늙지 않는다** 는 규약이 중요하다 — 스트로보는 지나온
 * 자리를 지우지 않고 남기며, 점 사이 간격이 곧 속력이라 지우면 주장이 사라진다.
 */
import { describe, expect, it } from 'vitest';
import type { RenderContext, Trace, Vec2 } from '@aperi21/schema';
import { renderTrace } from '../index';

interface Recorder {
  calls: string[];
  alphas: number[];
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
    theme: {
      background: '#ffffff',
      foreground: '#000000',
      muted: '#888888',
      line: '#cccccc',
      fontFamily: 'sans-serif',
      fontFamilyMono: 'monospace',
      resolveColor: () => '#123456',
    } as unknown as RenderContext['theme'],
    i18n: { resolve: () => '', t: () => '' } as unknown as RenderContext['i18n'],
    time: 0,
    deltaTime: 0,
    scene: { byId: () => undefined, ofType: () => [] },
    measure: { textWidth: () => 0 } as unknown as RenderContext['measure'],
  } as RenderContext;
}

const trace = (over: Partial<Trace>): Trace =>
  ({ type: 'trace', marks: [{ pos: [0, 0] }], ...over }) as Trace;

describe('renderTrace', () => {
  it('자국이 없으면 아무것도 그리지 않는다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(makeRc(rec), trace({ marks: [] }), { byId: () => undefined, ofType: () => [] });
    expect(rec.calls.filter((c) => c.startsWith('arc'))).toHaveLength(0);
  });

  it('점 하나에 원 하나 — 자리는 toScreen 을 거친다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(
      makeRc(rec),
      trace({ marks: [{ pos: [1, 0] }, { pos: [2, 0] }] }),
      { byId: () => undefined, ofType: () => [] },
    );
    const arcs = rec.calls.filter((c) => c.startsWith('arc('));
    expect(arcs).toHaveLength(2);
    expect(arcs[0]).toContain('10,100');
    expect(arcs[1]).toContain('20,100');
  });

  it('나이를 주지 않으면 늙지 않는다 — 스트로보는 지나온 자리를 지우지 않는다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(
      makeRc(rec),
      trace({ marks: [{ pos: [0, 0] }, { pos: [1, 0] }], life: 1 }),
      { byId: () => undefined, ofType: () => [] },
    );
    // 나이가 없으므로 둘 다 같은 알파로 그려진다.
    const drawn = rec.alphas.filter((a) => a > 0);
    expect(new Set(drawn).size).toBe(1);
  });

  it('나이가 수명에 가까울수록 옅어지고, 다 늙으면 그리지 않는다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(
      makeRc(rec),
      trace({
        marks: [{ pos: [0, 0], age: 0 }, { pos: [1, 0], age: 0.5 }, { pos: [2, 0], age: 1 }],
        life: 1,
      }),
      { byId: () => undefined, ofType: () => [] },
    );
    // 다 늙은 셋째는 건너뛴다 — 원이 둘만 그려진다.
    expect(rec.calls.filter((c) => c.startsWith('arc('))).toHaveLength(2);
  });

  it('ring 에 spreadTo 를 주면 나이와 함께 퍼진다 — 반지름 차가 곧 시각 차다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(
      makeRc(rec),
      trace({
        marks: [{ pos: [0, 0], age: 0 }, { pos: [0, 0], age: 0.5 }],
        life: 1,
        shape: 'ring',
        size: 8,
        spreadTo: 34,
      }),
      { byId: () => undefined, ofType: () => [] },
    );
    const arcs = rec.calls.filter((c) => c.startsWith('arc('));
    expect(arcs).toHaveLength(2);
    // 갓 태어난 것은 size, 절반 늙은 것은 size 와 spreadTo 의 가운데.
    expect(arcs[0]).toContain(',8,');
    expect(arcs[1]).toContain(',21,');
  });

  it('세기가 크기와 진하기에 함께 걸린다', () => {
    const rec: Recorder = { calls: [], alphas: [] };
    renderTrace(
      makeRc(rec),
      trace({ marks: [{ pos: [0, 0], strength: 0.5 }], size: 4 }),
      { byId: () => undefined, ofType: () => [] },
    );
    expect(rec.calls.filter((c) => c.startsWith('arc('))[0]).toContain(',2,');
    expect(rec.alphas).toContain(0.5);
  });
});
