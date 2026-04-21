import { describe, expect, it } from 'vitest';
import type { Body, SceneGraph } from '@aperi21/schema';
import {
  createHost,
  gravityVectorField,
  I18nResolver,
  preprocessScene,
  RendererRegistry,
  SceneGraphRefsImpl,
  uniformVectorField,
  type HostPlugin,
} from '../index';

const noopRenderer = () => {
  /* noop */
};

describe('PluginManager', () => {
  it('빈 Plugin 을 정상 등록하고 중복 등록 시 에러를 낸다', () => {
    const host = createHost();
    const plugin: HostPlugin = {
      id: 'test/empty',
      version: '1.0.0',
      label: 'empty',
      primitiveTypes: [],
      renderers: {},
    };
    host.pluginManager.register(plugin);
    expect(host.pluginManager.has('test/empty')).toBe(true);
    expect(() => host.pluginManager.register(plugin)).toThrow(/already registered/);
  });

  it('primitive 타입 네임스페이스 충돌 시 등록을 롤백한다', () => {
    const host = createHost();
    const first: HostPlugin = {
      id: 'plugin/a',
      version: '1.0.0',
      label: 'a',
      primitiveTypes: ['ray'],
      renderers: { ray: noopRenderer },
    };
    const second: HostPlugin = {
      id: 'plugin/b',
      version: '1.0.0',
      label: 'b',
      primitiveTypes: ['ray'],
      renderers: { ray: noopRenderer },
    };
    host.pluginManager.register(first);
    expect(() => host.pluginManager.register(second)).toThrow(/already taken/);
    expect(host.pluginManager.has('plugin/b')).toBe(false);
    expect(host.rendererRegistry.has('ray')).toBe(true);
  });

  it('의존성이 등록되지 않으면 실패한다', () => {
    const host = createHost();
    const plugin: HostPlugin = {
      id: 'plugin/dep',
      version: '1.0.0',
      label: 'dep',
      primitiveTypes: [],
      renderers: {},
      requires: ['plugin/missing'],
    };
    expect(() => host.pluginManager.register(plugin)).toThrow(/requires/);
  });

  it('utilities 를 등록하고 getUtility 로 조회할 수 있다', () => {
    const host = createHost();
    const trace = () => 42;
    host.pluginManager.register({
      id: 'plugin/util',
      version: '1.0.0',
      label: 'util',
      primitiveTypes: [],
      renderers: {},
      utilities: { trace },
    });
    const fn = host.pluginManager.getUtility<() => number>('plugin/util', 'trace');
    expect(fn?.()).toBe(42);
  });
});

describe('RendererRegistry', () => {
  it('등록/조회/기본 z-layer 반환', () => {
    const reg = new RendererRegistry();
    reg.register('body', noopRenderer);
    expect(reg.get('body')).toBe(noopRenderer);
    expect(reg.getZ('body')).toBe(40);
    expect(reg.getZ('ray')).toBe(22);
  });

  it('plugin 이 제공한 zHint 가 기본값을 override', () => {
    const reg = new RendererRegistry();
    reg.register('customType', noopRenderer, 33);
    expect(reg.getZ('customType')).toBe(33);
  });
});

describe('Theme.resolveColor', () => {
  it('6개 colorRole 전부를 문자열로 반환', () => {
    const host = createHost({ theme: 'light' });
    const roles = ['primary', 'secondary', 'accent', 'muted', 'positive', 'negative'] as const;
    for (const role of roles) {
      const value = host.theme.resolveColor(role);
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('emphasis 별로 다른 값을 반환', () => {
    const host = createHost({ theme: 'light' });
    const strong = host.theme.resolveColor('primary', 'strong');
    const medium = host.theme.resolveColor('primary', 'medium');
    const subtle = host.theme.resolveColor('primary', 'subtle');
    expect(strong).not.toBe(medium);
    expect(medium).not.toBe(subtle);
  });

  it('setTheme 으로 다크 모드로 전환하면 배경이 변경', () => {
    const host = createHost({ theme: 'light' });
    const lightBg = host.theme.background;
    host.setTheme('dark');
    expect(host.theme.background).not.toBe(lightBg);
    expect(host.theme.mode).toBe('dark');
  });
});

describe('I18nResolver', () => {
  it('평문 문자열을 그대로 반환', () => {
    const r = new I18nResolver('ko');
    expect(r.resolve('속도')).toBe('속도');
  });

  it('@i18n: 접두어는 사전에서 조회', () => {
    const r = new I18nResolver('ko', { ko: { 'physics.velocity': '속도' } });
    expect(r.resolve('@i18n:physics.velocity')).toBe('속도');
  });

  it('사전에 없으면 원본 키를 폴백으로 반환', () => {
    const r = new I18nResolver('ko', {});
    expect(r.resolve('@i18n:physics.velocity')).toBe('@i18n:physics.velocity');
  });

  it('객체 형태는 현재 lang → en → 첫 값 순으로 선택', () => {
    const r = new I18nResolver('ko');
    expect(r.resolve({ ko: '속도', en: 'velocity' })).toBe('속도');

    const rFr = new I18nResolver('fr');
    expect(rFr.resolve({ ko: '속도', en: 'velocity' })).toBe('velocity');

    const rXx = new I18nResolver('xx');
    expect(rXx.resolve({ ja: '速度' })).toBe('速度');
  });
});

describe('SceneGraphRefs & preprocessor', () => {
  const body: Body = { type: 'body', id: 'earth', pos: [0, 0], mass: 5.972e24 };
  const scene: SceneGraph = [
    body,
    { type: 'body', id: 'moon', pos: [384e6, 0], mass: 7.342e22 },
    { type: 'trajectory', points: [[0, 0]] },
  ];

  it('id 로 프리미티브를 찾는다', () => {
    const refs = new SceneGraphRefsImpl(scene);
    expect(refs.byId('earth')).toBe(body);
    expect(refs.byId('missing')).toBeUndefined();
  });

  it('ofType 은 해당 타입만 반환', () => {
    const refs = new SceneGraphRefsImpl(scene);
    const bodies = refs.ofType('body');
    expect(bodies).toHaveLength(2);
    expect(bodies.every((b) => b.type === 'body')).toBe(true);
  });

  it('preprocessScene 은 hidden 프리미티브를 제외', () => {
    const withHidden: SceneGraph = [
      { type: 'body', pos: [0, 0], hidden: true },
      { type: 'body', pos: [1, 1] },
    ];
    const { orderedScene } = preprocessScene(withHidden);
    expect(orderedScene).toHaveLength(1);
  });
});

describe('Standard compute methods', () => {
  it('uniformVectorField 는 인자 벡터를 그대로 반환', () => {
    const refs = new SceneGraphRefsImpl([]);
    expect(uniformVectorField(10, 20, { vector: [1, -9.8] }, refs)).toEqual([1, -9.8]);
  });

  it('gravity 가 점 중력원을 바라보는 방향으로 작용', () => {
    const earth: Body = { type: 'body', id: 'earth', pos: [0, 0], mass: 1e24 };
    const refs = new SceneGraphRefsImpl([earth]);
    const [ax, ay] = gravityVectorField(1, 0, { sources: ['earth'] }, refs);
    // sample 점에서 원점 방향이므로 x 성분은 음수, y 는 0 근처.
    expect(ax).toBeLessThan(0);
    expect(Math.abs(ay)).toBeLessThan(1e-10);
  });

  it('createHost 가 uniform/gravity 를 자동 등록', () => {
    const host = createHost();
    expect(host.computeRegistry.hasVector('uniform')).toBe(true);
    expect(host.computeRegistry.hasVector('gravity')).toBe(true);
  });
});
