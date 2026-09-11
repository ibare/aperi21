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
import type { HostCapabilities } from '../host';

export type BundleLoader = () => Promise<unknown>;

const bundles = new Map<string, Bundle>();
const loaders = new Map<string, BundleLoader>();
const inflight = new Map<string, Promise<Bundle | null>>();

/**
 * 번들이 함께 들고 온 능력. 생성기(`pnpm gen:capabilities`)가 만든 것을 loader 가
 * 넘긴다. Bundle 인터페이스에 넣지 않는 이유는 이것이 **선언이 아니라 배선**이라
 * sim 이 알 필요가 없기 때문이다 (원칙 1).
 */
const capabilities = new WeakMap<Bundle, HostCapabilities>();

/**
 * 이미 import 된 Bundle 을 id 와 함께 등록. 같은 id 가 이미 있으면 덮어쓴다.
 *
 * `caps` 는 이 번들이 쓰는 표준 능력이다 — 렌더러·조작기. host 가 전부를 미리
 * 알고 있지 않아도 되게 하는 것이 목적이므로(R10), 번들과 함께 온다.
 */
export function registerBundle(id: string, bundle: Bundle, caps?: HostCapabilities): Bundle {
  bundles.set(id, bundle);
  if (caps) capabilities.set(bundle, caps);
  return bundle;
}

/** 번들이 들고 온 능력. 없으면 undefined. */
export function getBundleCapabilities(bundle: Bundle): HostCapabilities | undefined {
  return capabilities.get(bundle);
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
 * 등록된 모든 bundle loader id 목록. 모듈을 로드하지 않고 "추가 가능한 시각화"
 * 집합을 알아야 하는 카탈로그 생성·정합성 검증에서 사용한다.
 */
export function listBundleLoaderIds(): string[] {
  return [...loaders.keys()];
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
    // 조작기 선언은 데이터다 (원칙 7 ④). 함수를 받던 시절의 검사를 남겨 두면
    // 배열을 든 조각이 전부 "등록 안 됨" 으로 조용히 떨어진다.
    Array.isArray(v.controllers)
  );
}
