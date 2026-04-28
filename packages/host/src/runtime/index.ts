/**
 * Bundle 런타임 — registry + DOM 마운트 진입점.
 *
 * 외부 호스트 (예: Tiptap NodeView) 가 React 라이프사이클 밖에서 시뮬레이션을
 * 띄울 때 사용한다. react/embed 진입점과 별개로 유지된다.
 */
export {
  registerBundle,
  registerBundleLoader,
  getBundleById,
  hasBundleLoader,
  loadBundle,
  clearBundleRegistry,
  type BundleLoader,
} from './bundleRegistry';
export {
  runBundle,
  type RunBundleOptions,
  type BundleRunHandle,
} from './runBundle';
