/**
 * Bundle 단일 출처 레지스트리.
 *
 * - 정적 등록: registerBundle(id, bundle) — 이미 import 된 Bundle 을 즉시 등록.
 * - 동적 등록: registerBundleLoader(id, () => import(...)) — 번들러가 dynamic
 *   import 경계로 인식하도록 lazy loader 만 등록.
 * - 조회/로드: getBundleById, hasBundleLoader, loadBundle.
 *
 * loadBundle 은 동시에 같은 id 가 호출되어도 동일한 Promise 를 공유한다.
 *
 * 모듈 레벨 싱글톤 — 외부 호스트 앱이 bundle 을 단일 출처로 다루도록.
 */

import type { Bundle } from '@aperi21/schema';

export type BundleLoader = () => Promise<unknown>;

const bundles = new Map<string, Bundle>();
const loaders = new Map<string, BundleLoader>();
const inflight = new Map<string, Promise<Bundle | null>>();

/** 이미 import 된 Bundle 을 id 와 함께 등록. 같은 id 가 이미 있으면 덮어쓴다. */
export function registerBundle(id: string, bundle: Bundle): Bundle {
  bundles.set(id, bundle);
  return bundle;
}

/** 등록된 Bundle 을 id 로 조회. */
export function getBundleById(id: string): Bundle | undefined {
  return bundles.get(id);
}

/** dynamic import 경로를 가진 lazy loader 등록. */
export function registerBundleLoader(id: string, loader: BundleLoader): void {
  loaders.set(id, loader);
}

export function hasBundleLoader(id: string): boolean {
  return loaders.has(id);
}

/**
 * id 의 loader 를 호출해 Bundle 을 등록·반환. loader 결과가 Bundle 자체이거나,
 * { default: Bundle } 형태이거나, 등록 함수가 호출된 뒤 registerBundle 을 통해
 * 캐시에 들어간 형태 모두를 허용한다.
 *
 * 동시 호출 보호: 동일 id 동시 호출은 같은 Promise 를 공유.
 */
export function loadBundle(id: string): Promise<Bundle | null> {
  const cached = bundles.get(id);
  if (cached) return Promise.resolve(cached);

  const inProgress = inflight.get(id);
  if (inProgress) return inProgress;

  const loader = loaders.get(id);
  if (!loader) return Promise.resolve(null);

  const p = loader()
    .then((mod) => {
      // 1) loader 가 register 함수를 호출했으면 캐시에 이미 들어와 있음
      const fromCache = bundles.get(id);
      if (fromCache) return fromCache;

      // 2) loader 결과가 Bundle 같이 생겼으면 그대로 등록
      const candidate = unwrapBundle(mod);
      if (candidate) {
        bundles.set(id, candidate);
        return candidate;
      }
      return null;
    })
    .finally(() => {
      inflight.delete(id);
    });

  inflight.set(id, p);
  return p;
}

/** 테스트용. 모듈 레벨 상태를 깨끗이 비운다. */
export function clearBundleRegistry(): void {
  bundles.clear();
  loaders.clear();
  inflight.clear();
}

function unwrapBundle(mod: unknown): Bundle | null {
  if (!mod || typeof mod !== 'object') return null;
  const m = mod as Record<string, unknown>;
  if (looksLikeBundle(m)) return m as unknown as Bundle;
  if (m.default && looksLikeBundle(m.default as Record<string, unknown>)) {
    return m.default as unknown as Bundle;
  }
  return null;
}

function looksLikeBundle(v: Record<string, unknown> | null | undefined): boolean {
  if (!v || typeof v !== 'object') return false;
  return (
    typeof v.schema === 'object' &&
    typeof v.initialState === 'function' &&
    typeof v.step === 'function' &&
    typeof v.scene === 'function' &&
    typeof v.controllers === 'function'
  );
}
