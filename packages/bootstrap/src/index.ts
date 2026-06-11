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
 *  - bootstrapAperi21(host?): registerAperi21Bundles 를 호출하고, host 가
 *    주어지면 installAperi21Plugins(host) 도 함께 호출. 외부 호스트가 한 번에
 *    부팅하기 위한 단일 진입점.
 *
 * 소비자:
 *  - apps/catalog (dev) — EngineProvider 에서 호출
 *  - @aperi21/host-tiptap-bundle (외부 호스트 tarball) — re-export
 */

import {
  registerBundle,
  registerBundleLoader,
  type Host,
} from '@aperi21/host';

let bundlesRegistered = false;

export function registerAperi21Bundles(): void {
  if (bundlesRegistered) return;
  bundlesRegistered = true;

  registerBundleLoader('aperi21:projectile', async () => {
    const m = await import('@aperi21/sim-projectile');
    return registerBundle('aperi21:projectile', m.projectileBundle);
  });

  registerBundleLoader('aperi21:ray-tracing', async () => {
    const m = await import('@aperi21/sim-ray-tracing');
    return registerBundle('aperi21:ray-tracing', m.rayTracingBundle);
  });

  registerBundleLoader('aperi21:dc-circuit', async () => {
    const m = await import('@aperi21/sim-dc-circuit');
    return registerBundle('aperi21:dc-circuit', m.dcCircuitBundle);
  });
}

let pluginsInstalledFor = new WeakSet<Host>();

export async function installAperi21Plugins(host: Host): Promise<void> {
  if (pluginsInstalledFor.has(host)) return;
  pluginsInstalledFor.add(host);

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

// 카탈로그 — 호스트가 시각화 모듈을 로드하지 않고 "추가 가능한 목록" 을 그릴 수 있게.
export { getAperi21Catalog } from './catalog.js';
export type { Aperi21CatalogEntry } from './catalog-types.js';
