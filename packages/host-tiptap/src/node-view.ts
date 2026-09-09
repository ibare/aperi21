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
  loadBundle,
  runBundle,
  type BundleRunHandle,
  type Host,
  type HostTheme,
} from '@aperi21/host';

const STATUS_BY_LOCALE: Record<string, { loading: string; errorPrefix: string }> = {
  en: { loading: '[bundle] loading…', errorPrefix: '[bundle]' },
  ko: { loading: '[bundle] 로딩…', errorPrefix: '[bundle]' },
};

/**
 * 플레이스홀더(로딩·오류 배지)의 치수 기본값.
 *
 * 이 배지는 시각화 본체가 아니라 어댑터가 그리는 안내 표식이라 선언 대상이 아니다.
 * C2 가 요구하는 "코드에 남는 기본값은 named 상수로 한 곳에" 를 따른다.
 * 색은 상수로 두지 않는다 — theme 에서 받는다.
 */
const PLACEHOLDER = {
  padding: '2px 8px',
  fontSize: '12px',
} as const;

function pickStatus(locale: string | undefined) {
  if (locale && STATUS_BY_LOCALE[locale]) return STATUS_BY_LOCALE[locale]!;
  return STATUS_BY_LOCALE.en!;
}

function renderError(
  mount: HTMLElement,
  message: string,
  locale: string | undefined,
  theme: HostTheme,
): void {
  mount.textContent = '';
  const box = document.createElement('span');
  box.className = 'aperi21-bundle-node__error';
  box.style.display = 'inline-block';
  box.style.padding = PLACEHOLDER.padding;
  box.style.borderRadius = `${theme.radiusMedium}px`;
  const danger = theme.resolveColor('negative', 'strong');
  box.style.background = theme.background;
  box.style.color = danger;
  box.style.border = `1px solid ${danger}`;
  box.style.fontSize = PLACEHOLDER.fontSize;
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
    // 플레이스홀더 색은 토큰에서 받는다 (C2). host 가 주입돼 있으면 그 테마를 그대로 쓴다.
    const theme: HostTheme = opts.host?.theme ?? getTheme(opts.theme ?? 'light');

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
      box.style.fontSize = PLACEHOLDER.fontSize;
      box.style.color = theme.muted;
      box.textContent = pickStatus(opts.locale).loading;
      mount.appendChild(box);
    };

    const mountInstance = (id: string): void => {
      currentId = id;
      const token = ++mountToken;
      dom.setAttribute('data-aperi21-id', id);
      mount.textContent = '';

      if (!id) {
        renderError(mount, 'missing id', opts.locale, theme);
        return;
      }

      // 1. 동기 경로: 이미 등록된 bundle 이면 즉시 마운트
      const cached = getBundleById(id);
      if (cached) {
        try {
          handle = runBundle(cached, mount, runOptions);
        } catch (err) {
          renderError(mount, err instanceof Error ? err.message : String(err), opts.locale, theme);
        }
        return;
      }

      // 2. 비동기 경로: loader 가 등록되어 있으면 lazy-load 후 마운트
      if (!hasBundleLoader(id)) {
        renderError(mount, `unknown bundle: ${id}`, opts.locale, theme);
        return;
      }

      renderLoading();
      void loadBundle(id).then(
        (bundle) => {
          if (token !== mountToken) return;
          if (!bundle) {
            renderError(mount, `unknown bundle: ${id}`, opts.locale, theme);
            return;
          }
          mount.textContent = '';
          try {
            handle = runBundle(bundle, mount, runOptions);
          } catch (err) {
            renderError(mount, err instanceof Error ? err.message : String(err), opts.locale, theme);
          }
        },
        (err: unknown) => {
          if (token !== mountToken) return;
          renderError(mount, err instanceof Error ? err.message : String(err), opts.locale, theme);
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
