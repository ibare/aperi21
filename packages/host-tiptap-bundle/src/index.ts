/**
 * @aperi21/host-tiptap-bundle — 외부 호스트 앱(예: 노트 에디터)이 단일 의존으로
 * 소비하는 ESM 번들 진입점.
 *
 * 책임 (얇은 포장):
 *  - @aperi21/host-tiptap 의 공개 표면 재노출
 *    (BundleExtension, parseBundleRaw, createBundleNodeView, renderBundleMarkdown).
 *  - @aperi21/bootstrap 의 bootstrap 함수 재노출.
 *  - @aperi21/host 에서 외부 호스트가 필요로 할 만한 진입점(createHost, runBundle,
 *    레지스트리 함수) 도 노출 — 호스트가 자기 Host 인스턴스를 만들고 plugin/번들
 *    설치를 통제할 수 있게.
 *
 * 호스트 사용 흐름:
 *   import {
 *     BundleExtension,
 *     bootstrapAperi21,
 *     createHost,
 *     installAperi21Plugins,
 *   } from '@aperi21/host-tiptap-bundle';
 *
 *   const host = createHost({ theme: 'light', lang: 'ko' });
 *   await bootstrapAperi21(host);             // bundle loader 등록 + plugin 설치
 *   new Editor({
 *     extensions: [StarterKit, BundleExtension.configure({ locale: 'ko', theme: 'light' })],
 *     content: html,
 *   });
 *
 * lazy 보존:
 *  - @aperi21/bootstrap 의 import('@aperi21/bundle-*') 가 rollup 의 dynamic
 *    import 로 살아남아 bundle 별 chunk 로 분리된다. 호스트 Vite 가 그 chunk
 *    그래프를 그대로 이어받는다.
 */

export {
  BundleExtension,
  parseBundleRaw,
  createBundleNodeView,
  renderBundleMarkdown,
  type BundleExtensionOptions,
} from '@aperi21/host-tiptap';

export {
  bootstrapAperi21,
  registerAperi21Bundles,
  installAperi21Plugins,
} from '@aperi21/bootstrap';

export {
  createHost,
  Host,
  runBundle,
  registerBundle,
  registerBundleLoader,
  getBundleById,
  hasBundleLoader,
  loadBundle,
  type RunBundleOptions,
  type BundleRunHandle,
  type BundleLoader,
} from '@aperi21/host';
