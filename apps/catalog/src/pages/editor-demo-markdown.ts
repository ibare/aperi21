/**
 * 마크다운 → HTML 변환. 본문에 등장하는 `{aperi21:<id>}` 토큰을
 * `<span data-aperi21="true" data-aperi21-id="<id>"></span>` 로 치환한다.
 *
 * inline-level marked extension 으로 등록하므로 `코드` 블록과 ```펜스 안의
 * 동일 패턴은 치환되지 않는다.
 *
 * **호스트 쪽 코드다.** editor-demo 가 외부 호스트 노릇을 하느라 두는 것이지 aperi21 의
 * 발행 표면이 아니다. 예전에는 `@aperi21/host-tiptap` 이 내보냈는데, 실제 호스트는
 * 제 마크다운 파이프라인에서 토큰을 바꾸므로 쓰지 않았고, 번들 첫 로딩에 marked 만
 * 싣고 있었다 (S-host: DSL 은 호스트의 관심사). 토큰 문법이 바뀌면
 * `packages/host-tiptap/src/index.ts` 의 정규식과 함께 고친다.
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
    return `<span data-aperi21="true" data-aperi21-id="${t.id}"></span>`;
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
