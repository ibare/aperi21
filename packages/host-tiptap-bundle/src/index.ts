/**
 * @aperi21/host-tiptap-bundle — 외부 호스트 앱(예: 노트 에디터)이 단일 의존으로
 * 소비하는 ESM 번들 진입점.
 *
 * 책임 (얇은 포장):
 *  - createAperi21Extension — 권장 진입점. host 생성 + plugin/번들 부팅 + 설정된
 *    BundleExtension 반환을 한 호출로 끝낸다.
 *  - @aperi21/host-tiptap 의 공개 표면 재노출
 *    (BundleExtension, parseBundleRaw, createBundleNodeView, renderBundleMarkdown).
 *  - @aperi21/bootstrap 의 bootstrap 함수 · getAperi21Catalog(locale) ·
 *    loadFrameworkMessages(locale) 재노출.
 *  - @aperi21/host 에서 외부 호스트가 필요로 할 만한 진입점(createHost, runBundle,
 *    레지스트리 함수) 도 노출 — 호스트가 자기 Host 인스턴스를 만들고 plugin/번들
 *    설치를 직접 통제하고 싶을 때(고급).
 *
 * 권장 사용 흐름 (한 콘텐츠에 에디터가 여럿 있어도 호출마다 host 가 격리된다):
 *   import { createAperi21Extension } from '@aperi21/host-tiptap-bundle';
 *
 *   new Editor({
 *     extensions: [StarterKit, createAperi21Extension({ locale: 'ko', theme: 'light' })],
 *     content: html,   // {aperi21:<id>} 토큰을 호스트 마크다운이 span 으로 변환한 HTML
 *   });
 *
 * lazy 보존:
 *  - @aperi21/bootstrap 의 import('@aperi21/sim-*') 가 rollup 의 dynamic
 *    import 로 살아남아 sim 별 chunk 로 분리된다 (dist/sims/<category>/<name>-[hash].js).
 *    plugin(optics/circuit) 도 동일하게 dynamic import 로 분리된다. 호스트 Vite 가
 *    그 chunk 그래프를 그대로 이어받는다.
 */

import { BundleExtension } from '@aperi21/host-tiptap';
import { bootstrapAperi21, loadFrameworkMessages } from '@aperi21/bootstrap';
import { createHost, type HostTheme, type ThemeMode } from '@aperi21/host';

export type CreateAperi21ExtensionOptions = {
  /** runBundle 에 전달할 locale. host 의 lang 으로도 쓰인다. */
  locale?: string;
  /**
   * 테마. 모드 이름이거나 **완성된 한 벌**이다 — 호스트가 자기 색·치수로 갈아
   * 끼우려면 `HostTheme` 을 통째로 준다.
   */
  theme?: ThemeMode | HostTheme;
};

/**
 * 권장 진입점 — 외부 호스트가 한 줄로 소비하는 팩토리.
 *
 * 동작:
 *  1. 이 호출 전용 Host 를 생성한다 (theme/lang 주입). 호출마다 host 가 분리되므로
 *     한 콘텐츠에 에디터/번들이 여럿 떠도 서로 간섭하지 않는다.
 *  2. bootstrapAperi21(host) 로 bundle loader(모듈 전역·멱등) 등록 + 이 host 에
 *     plugin(optics/circuit) 설치를 시작한다. plugin 설치는 dynamic import 라
 *     비동기지만, NodeView 의 runBundle RAF 루프가 매 프레임 rendererRegistry 를
 *     다시 조회하므로 설치가 끝나는 즉시 plugin 의존 렌더러가 채워진다.
 *  3. 그 host 를 주입한 설정된 BundleExtension 을 반환한다.
 *
 * 반환값을 그대로 Editor 의 extensions 배열에 넣으면 된다.
 */
export function createAperi21Extension(options: CreateAperi21ExtensionOptions = {}) {
  const host = createHost({ theme: options.theme, lang: options.locale });
  // bundle loader 등록 + 이 host 에 plugin 설치. 비동기 완료를 기다리지 않는다
  // (runBundle 루프가 self-heal). 호출자가 부팅 완료를 보장할 필요 없음.
  void bootstrapAperi21(host);
  // 프레임워크 문구 번들을 등록한다. 조회기가 조회 시점에 읽으므로 기다리지 않아도
  // 도착한 뒤 그려지는 문구는 그 언어로 나온다. 첫 화면부터 맞추려면 호스트가
  // `await loadFrameworkMessages(locale)` 를 먼저 부른다.
  void loadFrameworkMessages(options.locale);
  return BundleExtension.configure({ host, locale: options.locale, theme: options.theme });
}

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

// 카탈로그 — 호스트가 시각화 모듈 로드 없이 "추가 가능한 시각화 목록" 을 한 언어로
// 불러와 검색·삽입 UI 를 그리게 하는 경량 메타데이터. FACET 의 getFacetCatalog 과 같은 모양.
// 프레임워크 문구 — 조작기·배지 문구를 호스트 locale 로 등록한다.
export {
  getAperi21Catalog,
  loadFrameworkMessages,
  type Aperi21Catalog,
  type Aperi21CatalogDomain,
  type Aperi21CatalogEntry,
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
