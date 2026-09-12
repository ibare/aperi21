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
  listBundleLoaderIds,
  loadBundle,
  clearBundleRegistry,
  type BundleLoader,
} from './bundleRegistry';
export {
  runBundle,
  // 두 러너가 같은 규약을 쓰도록 react 쪽(`useBundleRuntime`)도 이것을 가져간다 —
  // 한쪽만 굴리면 같은 조각이 카탈로그와 외부 호스트에서 다른 화면으로 열린다.
  prerollState,
  markHeld,
  type RunBundleOptions,
  type BundleRunHandle,
} from './runBundle';
