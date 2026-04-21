import raw from './catalog.json';
import type { Bundle, Catalog, CategoryId } from '../types/catalog';

export const catalog = raw as unknown as Catalog;

export function bundlesByCategory(categoryId: CategoryId): Bundle[] {
  return catalog.bundles.filter((b) => b.category === categoryId);
}

export function findBundle(id: string): Bundle | undefined {
  return catalog.bundles.find((b) => b.id === id);
}

export function countPhenomena(bundle: Bundle): number {
  return bundle.phenomena.length;
}

export function countCategoryPhenomena(categoryId: CategoryId): number {
  return bundlesByCategory(categoryId).reduce(
    (sum, b) => sum + b.phenomena.length,
    0,
  );
}

export const IMPLEMENTED_BUNDLE_IDS = new Set<string>();

export function isBundleImplemented(id: string): boolean {
  return IMPLEMENTED_BUNDLE_IDS.has(id);
}
