/**
 * @aperi21/host-tiptap — Aperi21 시뮬레이션 번들을 Tiptap 에디터에 인라인으로
 * 마운트하는 어댑터.
 *
 * DSL: {aperi21:<id>} 단일 식별자.
 * id 는 host runtime 의 bundle 레지스트리(getBundleById) 에서 조회된다.
 *
 * 사용:
 *   import { BundleExtension, renderBundleMarkdown } from '@aperi21/host-tiptap';
 *   const html = renderBundleMarkdown(md);
 *   const editor = new Editor({
 *     extensions: [StarterKit, BundleExtension.configure({ locale: 'ko', theme: 'light' })],
 *     content: html,
 *   });
 */

import { Node, mergeAttributes, InputRule, PasteRule } from '@tiptap/core';
import type { Host } from '@aperi21/host';
import { createBundleNodeView } from './node-view.js';

// id 본문은 영문자 시작, 영숫자/하이픈/언더스코어. snake_case 와 kebab-case 모두 허용.
const BUNDLE_PATTERN_INPUT = /\{(aperi21:[a-zA-Z][a-zA-Z0-9_-]*)\}$/;
const BUNDLE_PATTERN_GLOBAL = /\{(aperi21:[a-zA-Z][a-zA-Z0-9_-]*)\}/g;
const BUNDLE_PATTERN_FULL = /^\{(aperi21:[a-zA-Z][a-zA-Z0-9_-]*)\}$/;

/** `{aperi21:foo}` 표현에서 전체 id(`aperi21:foo`) 추출. 형식이 맞지 않으면 null. */
export function parseBundleRaw(raw: string): string | null {
  const m = BUNDLE_PATTERN_FULL.exec(raw.trim());
  return m ? m[1]! : null;
}

export type BundleExtensionOptions = {
  /** runBundle 에 전달할 locale. 변경 시 호스트가 editor 를 재생성해야 반영된다. */
  locale?: string;
  /** runBundle 에 전달할 theme. */
  theme?: 'light' | 'dark';
  /**
   * NodeView 의 runBundle 이 사용할 Host. plugin(optics/circuit)이 설치된 host 를
   * 넘기면 plugin 의존 번들(ray-tracing/dc-circuit)의 renderer 가 그 host 에서
   * 조회된다. 생략하면 runBundle 이 마운트마다 plugin 없는 host 를 새로 만든다 —
   * 코어 렌더러만 쓰는 번들(projectile)만 정상 동작.
   * 보통은 @aperi21/host-tiptap-bundle 의 createAperi21Extension 이 주입한다.
   */
  host?: Host;
};

export const BundleExtension = Node.create<BundleExtensionOptions>({
  name: 'aperi21',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return { locale: undefined, theme: undefined, host: undefined };
  },

  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-aperi21-id') ?? '',
        renderHTML: (attrs) => {
          const id = typeof attrs.id === 'string' ? attrs.id : '';
          return id ? { 'data-aperi21-id': id } : {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-aperi21]',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return false;
          const id = node.getAttribute('data-aperi21-id') ?? '';
          return id ? { id } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-aperi21': 'true' }), ''];
  },

  addNodeView() {
    return createBundleNodeView();
  },

  addInputRules() {
    const type = this.type;
    return [
      new InputRule({
        find: BUNDLE_PATTERN_INPUT,
        handler: ({ state, range, match }) => {
          const id = match[1];
          if (!id) return null;
          state.tr.replaceRangeWith(range.from, range.to, type.create({ id }));
          return;
        },
      }),
    ];
  },

  addPasteRules() {
    const type = this.type;
    return [
      new PasteRule({
        find: BUNDLE_PATTERN_GLOBAL,
        handler: ({ state, range, match }) => {
          const id = match[1];
          if (!id) return null;
          state.tr.replaceRangeWith(range.from, range.to, type.create({ id }));
          return;
        },
      }),
    ];
  },
});

export { createBundleNodeView } from './node-view.js';
export { renderBundleMarkdown } from './markdown.js';
