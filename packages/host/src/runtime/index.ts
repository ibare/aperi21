/**
 * Bundle 런타임 — registry + DOM 마운트 진입점.
 *
 * 러너는 하나다. React 든 Tiptap NodeView 든 이 진입점을 거친다.
 */
export {
  registerBundle,
  registerBundleLoader,
  getBundleById,
  hasBundleLoader,
  listBundleLoaderIds,
  loadBundle,
  clearBundleRegistry,
  type BundleLoader,
} from './bundleRegistry';
export {
  runBundle,
  prerollState,
  markHeld,
  type RunBundleOptions,
  type BundleRunHandle,
} from './runBundle';
