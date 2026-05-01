/**
 * 마크다운 → HTML 변환. 본문에 등장하는 `{aperi21:<id>}` 토큰을
 * `<span data-bundle="true" data-bundle-id="<id>"></span>` 로 치환한다.
 *
 * inline-level marked extension 으로 등록하므로 `코드` 블록과 ```펜스 안의
 * 동일 패턴은 치환되지 않는다.
 */

import { marked, type MarkedExtension, type TokenizerAndRendererExtension } from 'marked';

type BundleToken = {
  type: 'bundleInline';
  raw: string;
  id: string;
};

const BUNDLE_TOKEN_PATTERN = /^\{(aperi21:[a-zA-Z][a-zA-Z0-9_-]*)\}/;

const bundleInlineExtension: TokenizerAndRendererExtension = {
  name: 'bundleInline',
  level: 'inline',
  start(src: string): number | undefined {
    const i = src.indexOf('{aperi21:');
    return i < 0 ? undefined : i;
  },
  tokenizer(src: string): BundleToken | undefined {
    const m = BUNDLE_TOKEN_PATTERN.exec(src);
    if (!m) return undefined;
    return { type: 'bundleInline', raw: m[0], id: m[1]! };
  },
  renderer(token): string {
    const t = token as unknown as BundleToken;
    return `<span data-bundle="true" data-bundle-id="${t.id}"></span>`;
  },
};

let installed = false;
function ensureInstalled(): void {
  if (installed) return;
  installed = true;
  marked.use({ extensions: [bundleInlineExtension] } satisfies MarkedExtension);
}

/** 마크다운 문자열을 HTML 로 변환. aperi21 토큰은 인라인 placeholder span 으로. */
export function renderBundleMarkdown(md: string): string {
  ensureInstalled();
  return marked.parse(md, { async: false }) as string;
}
