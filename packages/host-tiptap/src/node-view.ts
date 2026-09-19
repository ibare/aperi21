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
  getTheme,
  hasBundleLoader,
  I18nResolver,
  loadBundle,
  runBundle,
  type BundleRunHandle,
  type Host,
  type HostI18n,
  type HostTheme,
  type ThemeMode,
  type UiTheme,
} from '@aperi21/host';

/**
 * 플레이스홀더(로딩·오류 배지)의 치수 기본값.
 *
 * 이 배지는 시각화 본체가 아니라 어댑터가 그리는 안내 표식이라 선언 대상이 아니다.
 * C2 가 요구하는 "코드에 남는 기본값은 named 상수로 한 곳에" 를 따른다.
 * 색은 상수로 두지 않는다 — theme 에서 받는다.
 */
const PLACEHOLDER = { padding: '2px 8px' } as const;

function renderError(
  mount: HTMLElement,
  message: string,
  i18n: HostI18n,
  ui: UiTheme,
): void {
  mount.textContent = '';
  const box = document.createElement('span');
  box.className = 'aperi21-bundle-node__error';
  box.style.display = 'inline-block';
  box.style.padding = PLACEHOLDER.padding;
  box.style.borderRadius = `${ui.radius.medium}px`;
  box.style.background = ui.surface;
  box.style.color = ui.text;
  box.style.border = `${ui.strokeWidth.regular}px solid ${ui.border}`;
  box.style.fontSize = `${ui.fontSize.regular}px`;
  box.textContent = i18n.t('ui.nodeView.error', '[bundle] {message}', { message });
  mount.appendChild(box);
}

export function createBundleNodeView(): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    const { node, extension } = props;
    const opts = (extension.options ?? {}) as {
      locale?: string;
      theme?: ThemeMode | HostTheme;
      host?: Host;
    };
    // host 가 주입돼 있으면 plugin 설치된 그 host 를 재사용. 없으면 runBundle 이
    // 마운트마다 plugin 없는 host 를 만든다 (코어 렌더러 번들만 정상).
    const runOptions = { locale: opts.locale, theme: opts.theme, host: opts.host };
    // 플레이스홀더 색은 토큰에서 받는다 (C2). host 가 주입돼 있으면 그 테마를 그대로 쓴다.
    // host 가 주입돼 있으면 그 테마가 이긴다. 없으면 옵션이 준 한 벌이거나 기본 모드.
    const declared = opts.host?.theme ?? opts.theme;
    // 배지 문구 조회기. host 가 주입돼 있으면 그 조회기를 쓴다 (C1 — 조회기는 하나).
    const i18n: HostI18n = opts.host?.i18n ?? new I18nResolver(opts.locale ?? 'en');
    const ui: UiTheme = (
      typeof declared === 'object' ? declared : getTheme(declared ?? 'light')
    ).ui;

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
      box.style.padding = PLACEHOLDER.padding;
      box.style.fontSize = `${ui.fontSize.regular}px`;
      box.style.color = ui.label;
      box.textContent = i18n.t('ui.nodeView.loading', '[bundle] loading…');
      mount.appendChild(box);
    };

    const mountInstance = (id: string): void => {
      currentId = id;
      const token = ++mountToken;
      dom.setAttribute('data-aperi21-id', id);
      mount.textContent = '';

      if (!id) {
        renderError(mount, 'missing id', i18n, ui);
        return;
      }

      // 1. 동기 경로: 이미 등록된 bundle 이면 즉시 마운트
      const cached = getBundleById(id);
      if (cached) {
        try {
          handle = runBundle(cached, mount, runOptions);
        } catch (err) {
          renderError(mount, err instanceof Error ? err.message : String(err), i18n, ui);
        }
        return;
      }

      // 2. 비동기 경로: loader 가 등록되어 있으면 lazy-load 후 마운트
      if (!hasBundleLoader(id)) {
        renderError(mount, `unknown bundle: ${id}`, i18n, ui);
        return;
      }

      renderLoading();
      void loadBundle(id).then(
        (bundle) => {
          if (token !== mountToken) return;
          if (!bundle) {
            renderError(mount, `unknown bundle: ${id}`, i18n, ui);
            return;
          }
          mount.textContent = '';
          try {
            handle = runBundle(bundle, mount, runOptions);
          } catch (err) {
            renderError(mount, err instanceof Error ? err.message : String(err), i18n, ui);
          }
        },
        (err: unknown) => {
          if (token !== mountToken) return;
          renderError(mount, err instanceof Error ? err.message : String(err), i18n, ui);
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
