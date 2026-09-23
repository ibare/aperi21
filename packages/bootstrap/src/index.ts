/**
 * @aperi21/bootstrap — 카탈로그 단일 출처.
 *
 * 정적 부트스트랩:
 *  - installAperi21Plugins(host): 외부 호스트가 만든 Host 인스턴스에 도메인
 *    플러그인(optics, circuit) 을 등록한다. 이미 같은 plugin 이 등록되어
 *    있으면 PluginManager 가 throw 하므로, 호출자가 1회만 부르면 된다.
 *
 * 동적 부트스트랩:
 *  - registerAperi21Bundles(): bundle 패키지를 lazy loader 로 등록한다.
 *    각 import() 가 번들러의 dynamic import 경계로 인식되어 bundle 별 chunk
 *    로 분리된다. 호스트 Vite/Rollup 가 그 chunk 그래프를 그대로 이어받는다.
 *
 * 편의용:
 *  - getAperi21Catalog(locale): sim 을 로드하지 않고 추가 가능 목록을 한 언어로 조회.
 *  - loadFrameworkMessages(locale): 프레임워크 문구 번들을 host 에 등록.
 *  - bootstrapAperi21(host?): registerAperi21Bundles 를 호출하고, host 가
 *    주어지면 installAperi21Plugins(host) 도 함께 호출. 외부 호스트가 한 번에
 *    부팅하기 위한 단일 진입점.
 *
 * 소비자:
 *  - apps/catalog (dev) — EngineProvider 에서 호출
 *  - @aperi21/host-tiptap-bundle (외부 호스트 tarball) — re-export
 */

import { type Host } from '@aperi21/host';

import { registerGeneratedBundles } from './bundles.generated.js';

let bundlesRegistered = false;

/**
 * 조각 loader 를 등록한다. 멱등 — 여러 번 불러도 한 번만 등록한다.
 *
 * 등록 본문은 `bundles.generated.ts` 가 갖는다. 한 조각의 정체가 디렉터리 · 패키지 이름 ·
 * 등록 키 · 능력 경로 · 번들 export 다섯 꼴로 반복되는데, 손으로 유지하면 그중 하나만
 * 어긋나도 **검사가 잡지 못하는 오배선**이 된다 — 키가 남의 조각을 부르면 목록에는 제
 * 이름이 뜨고 화면에는 다른 조각이 나온다. 원본을 디렉터리 하나로 모아 그 자리를 없앴다.
 */
export function registerAperi21Bundles(): void {
  if (bundlesRegistered) return;
  bundlesRegistered = true;
  registerGeneratedBundles();
}

let pluginsInstalledFor = new WeakSet<Host>();

export async function installAperi21Plugins(host: Host): Promise<void> {
  if (pluginsInstalledFor.has(host)) return;
  pluginsInstalledFor.add(host);

  // 여기 오는 것은 **여러 sim 이 공유하는 도메인 어휘**뿐이다.
  //
  // 조각 하나가 자기 시각화를 직접 그리는 경우는 `Bundle.renderers` 로 간다.
  // 그것까지 여기 태우면 조각이 화면에 없어도 부팅만으로 통째로 로드되고,
  // 첫 페이로드가 조각 수에 비례해 자란다 (R10). 실제로 sim 2개 때문에
  // 11.4 KB(gz) 가 항상 실리고 있었다.
  const [{ opticsPlugin }, { circuitPlugin }] = await Promise.all([
    import('@aperi21/plugin-optics'),
    import('@aperi21/plugin-circuit'),
  ]);
  host.pluginManager.register(opticsPlugin);
  host.pluginManager.register(circuitPlugin);
}

/**
 * 외부 호스트가 단일 호출로 bundle 레지스트리 부팅 + (옵션) plugin 설치까지 끝내기 위한 진입점.
 * host 인자가 없으면 plugin 설치는 건너뛰고 bundle loader 만 등록한다 — 호스트가
 * 자기 Host 인스턴스를 만든 다음 별도로 installAperi21Plugins(host) 를 호출.
 */
export async function bootstrapAperi21(host?: Host): Promise<void> {
  registerAperi21Bundles();
  if (host) await installAperi21Plugins(host);
}

/** 테스트용. */
export function _resetBootstrapState(): void {
  bundlesRegistered = false;
  pluginsInstalledFor = new WeakSet<Host>();
}

// 카탈로그 — 호스트가 시각화 모듈을 로드하지 않고 "추가 가능한 목록" 을 한 언어로 그릴 수 있게.
export { getAperi21Catalog } from './catalog.js';
export type {
  Aperi21Catalog,
  Aperi21CatalogDomain,
  Aperi21CatalogEntry,
} from './catalog-types.js';

// 프레임워크 문구 — 호스트 locale 의 번들을 host 의 문구 저장소에 등록한다.
export { loadFrameworkMessages } from './messages.js';
