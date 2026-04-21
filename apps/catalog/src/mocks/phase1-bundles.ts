import type { Bundle } from '@aperi21/schema';
import { projectileBundle } from '@aperi21/bundle-projectile';

/**
 * Phase 1 placeholder Bundle. 실제 Scene Graph/step 로직은 Phase 2+ 의 개별
 * bundle 패키지가 맡는다. 카탈로그의 상세 페이지에서 Embed 컴포넌트에 넘기기
 * 위한 최소 schema + no-op 함수만 정의한다.
 */
function placeholder(schema: Bundle['schema']): Bundle {
  return {
    schema,
    initialState: () => ({}),
    step: ({ state }) => state,
    scene: () => [],
    controllers: () => [],
  };
}

/** Phase 2: 실제 구현된 projectile bundle. */
export const projectile: Bundle = projectileBundle as unknown as Bundle;

export const mockRayTracingBundle: Bundle = placeholder({
  id: 'ray_tracing',
  label: { ko: '광선 추적', en: 'Ray tracing' },
  category: 'optics',
  operation: {
    ko: '광원과 렌즈를 드래그해 광로 탐색',
    en: 'Drag light source & lens to explore ray path',
  },
  timeModel: 'static',
  parameters: [
    { id: 'wavelength', label: { ko: '파장', en: 'wavelength' }, unit: 'nm', default: 550, range: [380, 780] },
  ],
  stages: [
    { id: 'default', label: { ko: '기본', en: 'Default' }, constants: {} },
  ],
  environments: [],
  views: [
    { id: 'rays', label: { ko: '광선', en: 'Rays' }, default: true },
    { id: 'wavefronts', label: { ko: '파면', en: 'Wavefronts' } },
  ],
  plugins: ['optics'],
});

export const mockDcCircuitBundle: Bundle = placeholder({
  id: 'dc_circuit',
  label: { ko: 'DC 회로', en: 'DC circuit' },
  category: 'electromagnetism',
  operation: {
    ko: '전지와 저항을 배치하고 스위치를 조작',
    en: 'Place battery & resistors, toggle switch',
  },
  timeModel: 'steady_state',
  parameters: [
    { id: 'emf', label: { ko: '기전력', en: 'EMF' }, unit: 'V', default: 9, range: [0, 24] },
  ],
  stages: [
    { id: 'default', label: { ko: '기본', en: 'Default' }, constants: {} },
  ],
  environments: [],
  views: [
    { id: 'schematic', label: { ko: '회로도', en: 'Schematic' }, default: true },
    { id: 'numeric', label: { ko: '수치', en: 'Numeric' } },
  ],
  plugins: ['circuit'],
});

export const MOCK_BUNDLES: Record<string, Bundle> = {
  projectile,
  ray_tracing: mockRayTracingBundle,
  dc_circuit: mockDcCircuitBundle,
};
