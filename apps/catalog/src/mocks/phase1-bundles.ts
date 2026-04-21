import type { Bundle } from '@aperi21/schema';

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

export const mockProjectileBundle: Bundle = placeholder({
  id: 'projectile',
  label: { ko: '발사체', en: 'Projectile' },
  category: 'mechanics',
  operation: {
    ko: '각도 다이얼 + 핀볼 런처로 발사',
    en: 'Angle dial + pinball launcher',
  },
  timeModel: 'linear',
  parameters: [
    { id: 'angle', label: { ko: '각도', en: 'angle' }, unit: 'deg', default: 45, range: [0, 90] },
    { id: 'power', label: { ko: '출력', en: 'power' }, unit: '0-100', default: 50, range: [0, 100] },
  ],
  stages: [
    { id: 'earth', label: { ko: '지구', en: 'Earth' }, constants: { g: 9.8 } },
    { id: 'moon', label: { ko: '달', en: 'Moon' }, constants: { g: 1.62 } },
  ],
  environments: [
    {
      id: 'vacuum',
      label: { ko: '진공', en: 'Vacuum' },
      availableInStages: ['earth', 'moon'],
      effects: { drag: 0 },
    },
    {
      id: 'windy',
      label: { ko: '바람', en: 'Wind' },
      availableInStages: ['earth'],
      effects: { wind: 1 },
    },
  ],
  views: [
    { id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true },
    { id: 'energy', label: { ko: '에너지', en: 'Energy' } },
  ],
});

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
  projectile: mockProjectileBundle,
  ray_tracing: mockRayTracingBundle,
  dc_circuit: mockDcCircuitBundle,
};
