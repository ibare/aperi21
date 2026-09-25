/**
 * NodeView 의 수명 — 마운트한 것을 반드시 거둔다 (C5 · 원칙 6).
 *
 * 러너(`runBundle`)만 가짜로 바꾼다. 레지스트리는 **실제 것**을 쓴다 — 원본 모듈을
 * 펼친 위에 `runBundle` 하나만 덮으므로, 테스트가 등록한 조각을 NodeView 가 같은
 * 인스턴스에서 찾는다 (원칙 3). 레지스트리 함수도 반드시 `@aperi21/host` 루트에서
 * 가져온다.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NodeViewRendererProps } from '@tiptap/core';
import type { Bundle } from '@aperi21/schema';
import {
  clearBundleRegistry,
  registerBundle,
  registerBundleLoader,
  runBundle,
} from '@aperi21/host';
import { createBundleNodeView } from '../node-view';

vi.mock('@aperi21/host', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aperi21/host')>();
  return { ...actual, runBundle: vi.fn() };
});

const run = vi.mocked(runBundle);

type View = {
  dom: HTMLElement;
  update(node: unknown): boolean;
  destroy(): void;
};

/** 조각처럼 생긴 최소 객체. 러너가 가짜라 내용은 쓰이지 않는다. */
function fakeBundle(id: string): Bundle {
  return {
    schema: { id },
    initialState: () => ({}),
    step: ({ state }: { state: unknown }) => state,
    scene: () => [],
    controllers: [],
  } as unknown as Bundle;
}

const node = (id: string) => ({ type: { name: 'aperi21' }, attrs: { id } });

function mount(id: string): View {
  const props = { node: node(id), extension: { options: { locale: 'en' } } };
  return createBundleNodeView()(props as unknown as NodeViewRendererProps) as unknown as View;
}

/** 대기 중인 마이크로태스크(loader 의 then)를 흘려보낸다. */
const flush = () => new Promise((r) => setTimeout(r, 0));

let handles: { destroy: ReturnType<typeof vi.fn> }[];

beforeEach(() => {
  clearBundleRegistry();
  handles = [];
  run.mockReset();
  run.mockImplementation(() => {
    const handle = { destroy: vi.fn() };
    handles.push(handle);
    return handle;
  });
});

afterEach(() => {
  clearBundleRegistry();
});

describe('BundleNodeView', () => {
  it('등록된 조각은 즉시 마운트하고, destroy 에서 그 handle 을 거둔다', () => {
    const bundle = fakeBundle('a');
    registerBundle('aperi21:a', bundle);
    const view = mount('aperi21:a');

    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]![0]).toBe(bundle);
    expect(view.dom.getAttribute('data-aperi21-id')).toBe('aperi21:a');

    view.destroy();
    expect(handles[0]!.destroy).toHaveBeenCalledTimes(1);
  });

  it('loader 만 있으면 로딩 표시 뒤 마운트한다', async () => {
    registerBundleLoader('aperi21:lazy', async () => fakeBundle('lazy'));
    const view = mount('aperi21:lazy');

    expect(run).not.toHaveBeenCalled();
    expect(view.dom.querySelector('.aperi21-bundle-node__loading')).not.toBeNull();

    await flush();
    expect(run).toHaveBeenCalledTimes(1);
    expect(view.dom.querySelector('.aperi21-bundle-node__loading')).toBeNull();

    view.destroy();
    expect(handles[0]!.destroy).toHaveBeenCalledTimes(1);
  });

  it('로딩 중에 destroy 되면 뒤늦게 도착한 조각을 마운트하지 않는다', async () => {
    registerBundleLoader('aperi21:lazy', async () => fakeBundle('lazy'));
    const view = mount('aperi21:lazy');
    view.destroy();

    await flush();
    // 마운트하면 거둘 사람이 없는 RAF 루프가 남는다.
    expect(run).not.toHaveBeenCalled();
  });

  it('id 가 바뀌면 앞의 것을 거두고 새 것을 마운트한다', () => {
    registerBundle('aperi21:a', fakeBundle('a'));
    registerBundle('aperi21:b', fakeBundle('b'));
    const view = mount('aperi21:a');

    expect(view.update(node('aperi21:b'))).toBe(true);
    expect(handles[0]!.destroy).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(2);
    expect(view.dom.getAttribute('data-aperi21-id')).toBe('aperi21:b');

    // 같은 id 로 다시 오면 아무것도 하지 않는다.
    view.update(node('aperi21:b'));
    expect(run).toHaveBeenCalledTimes(2);

    view.destroy();
    expect(handles[1]!.destroy).toHaveBeenCalledTimes(1);
  });

  it('다른 종류의 노드로 바꾸려 하면 거절한다', () => {
    registerBundle('aperi21:a', fakeBundle('a'));
    const view = mount('aperi21:a');
    expect(view.update({ type: { name: 'paragraph' }, attrs: {} })).toBe(false);
    view.destroy();
  });

  it('등록도 loader 도 없는 id 는 오류 표시만 하고 러너를 부르지 않는다', () => {
    const view = mount('aperi21:nope');
    const error = view.dom.querySelector('.aperi21-bundle-node__error');
    expect(error?.textContent).toContain('aperi21:nope');
    expect(run).not.toHaveBeenCalled();
    view.destroy();
  });

  it('id 가 비었으면 오류 표시', () => {
    const view = mount('');
    expect(view.dom.querySelector('.aperi21-bundle-node__error')).not.toBeNull();
    expect(run).not.toHaveBeenCalled();
  });

  it('러너가 던지면 오류 표시로 바꾸고 번지지 않는다', () => {
    registerBundle('aperi21:a', fakeBundle('a'));
    run.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const view = mount('aperi21:a');
    expect(view.dom.querySelector('.aperi21-bundle-node__error')?.textContent).toContain('boom');
    expect(() => view.destroy()).not.toThrow();
  });

  it('주입한 host 와 locale 을 러너에 넘긴다', () => {
    registerBundle('aperi21:a', fakeBundle('a'));
    const host = { theme: undefined, i18n: undefined };
    const props = { node: node('aperi21:a'), extension: { options: { locale: 'ko', host } } };
    const view = createBundleNodeView()(props as unknown as NodeViewRendererProps) as unknown as View;
    expect(run.mock.calls[0]![2]).toMatchObject({ locale: 'ko', host });
    view.destroy();
  });
});
