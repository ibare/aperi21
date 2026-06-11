/**
 * Bundle NodeView — Aperi21 Bundle 런타임(runBundle) 에 위임.
 *
 * node.attrs.id 로 등록된 Bundle 을 조회하여 mount 영역에 인스턴스화.
 * 노드 update/destroy 시 BundleRunHandle 의 destroy 를 호출해 라이프사이클 일치.
 *
 * 동기 경로: getBundleById(id) 가 캐시에서 즉시 반환되면 바로 마운트.
 * 비동기 경로: hasBundleLoader(id) 면 loadBundle(id) 후 마운트.
 */

import type { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import {
  getBundleById,
  hasBundleLoader,
  loadBundle,
  runBundle,
  type BundleRunHandle,
  type Host,
} from '@aperi21/host';

const STATUS_BY_LOCALE: Record<string, { loading: string; errorPrefix: string }> = {
  en: { loading: '[bundle] loading…', errorPrefix: '[bundle]' },
  ko: { loading: '[bundle] 로딩…', errorPrefix: '[bundle]' },
};

function pickStatus(locale: string | undefined) {
  if (locale && STATUS_BY_LOCALE[locale]) return STATUS_BY_LOCALE[locale]!;
  return STATUS_BY_LOCALE.en!;
}

function renderError(mount: HTMLElement, message: string, locale?: string): void {
  mount.textContent = '';
  const box = document.createElement('span');
  box.className = 'aperi21-bundle-node__error';
  box.style.display = 'inline-block';
  box.style.padding = '2px 8px';
  box.style.borderRadius = '4px';
  box.style.background = '#FAECE7';
  box.style.color = '#A8331C';
  box.style.fontSize = '12px';
  box.textContent = `${pickStatus(locale).errorPrefix} ${message}`;
  mount.appendChild(box);
}

export function createBundleNodeView(): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    const { node, extension } = props;
    const opts = (extension.options ?? {}) as {
      locale?: string;
      theme?: 'light' | 'dark';
      host?: Host;
    };
    // host 가 주입돼 있으면 plugin 설치된 그 host 를 재사용. 없으면 runBundle 이
    // 마운트마다 plugin 없는 host 를 만든다 (코어 렌더러 번들만 정상).
    const runOptions = { locale: opts.locale, theme: opts.theme, host: opts.host };

    const dom = document.createElement('span');
    dom.className = 'aperi21-bundle-node';
    dom.setAttribute('data-aperi21', 'true');
    dom.contentEditable = 'false';
    dom.style.display = 'inline-block';
    dom.style.width = '100%';

    const mount = document.createElement('div');
    mount.className = 'aperi21-bundle-mount';
    mount.style.display = 'block';
    dom.appendChild(mount);

    let handle: BundleRunHandle | null = null;
    let currentId = '';
    let mountToken = 0;

    const renderLoading = () => {
      mount.textContent = '';
      const box = document.createElement('span');
      box.className = 'aperi21-bundle-node__loading';
      box.style.display = 'inline-block';
      box.style.padding = '2px 8px';
      box.style.fontSize = '12px';
      box.style.color = '#888';
      box.textContent = pickStatus(opts.locale).loading;
      mount.appendChild(box);
    };

    const mountInstance = (id: string): void => {
      currentId = id;
      const token = ++mountToken;
      dom.setAttribute('data-aperi21-id', id);
      mount.textContent = '';

      if (!id) {
        renderError(mount, 'missing id', opts.locale);
        return;
      }

      // 1. 동기 경로: 이미 등록된 bundle 이면 즉시 마운트
      const cached = getBundleById(id);
      if (cached) {
        try {
          handle = runBundle(cached, mount, runOptions);
        } catch (err) {
          renderError(mount, err instanceof Error ? err.message : String(err), opts.locale);
        }
        return;
      }

      // 2. 비동기 경로: loader 가 등록되어 있으면 lazy-load 후 마운트
      if (!hasBundleLoader(id)) {
        renderError(mount, `unknown bundle: ${id}`, opts.locale);
        return;
      }

      renderLoading();
      void loadBundle(id).then(
        (bundle) => {
          if (token !== mountToken) return;
          if (!bundle) {
            renderError(mount, `unknown bundle: ${id}`, opts.locale);
            return;
          }
          mount.textContent = '';
          try {
            handle = runBundle(bundle, mount, runOptions);
          } catch (err) {
            renderError(mount, err instanceof Error ? err.message : String(err), opts.locale);
          }
        },
        (err: unknown) => {
          if (token !== mountToken) return;
          renderError(mount, err instanceof Error ? err.message : String(err), opts.locale);
        },
      );
    };

    const teardownInstance = () => {
      mountToken++;
      if (handle) {
        try {
          handle.destroy();
        } catch {
          // ignore
        }
        handle = null;
      }
    };

    mountInstance(typeof node.attrs.id === 'string' ? node.attrs.id : '');

    return {
      dom,
      update(updatedNode) {
        if (updatedNode.type.name !== node.type.name) return false;
        const nextId = typeof updatedNode.attrs.id === 'string' ? updatedNode.attrs.id : '';
        if (nextId !== currentId) {
          teardownInstance();
          mountInstance(nextId);
        }
        return true;
      },
      destroy() {
        teardownInstance();
      },
      ignoreMutation() {
        return true;
      },
      stopEvent() {
        return false;
      },
    };
  };
}
