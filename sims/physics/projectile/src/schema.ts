import type { BundleSchema } from '@aperi21/schema';

export const schema: BundleSchema = {
  id: 'projectile',
  label: { ko: '발사체', en: 'Projectile' },
  category: 'mechanics',
  operation: {
    ko: '각도 다이얼 + 핀볼 런처',
    en: 'Angle dial + pinball launcher',
  },
  timeModel: 'linear',

  parameters: [
    {
      id: 'v0',
      label: { ko: '초기 속도', en: 'Initial velocity' },
      unit: 'm/s',
      range: [1, 60],
      default: 20,
      step: 0.5,
      statePath: 'launch.v0',
    },
    {
      id: 'theta',
      label: { ko: '발사각', en: 'Launch angle' },
      unit: '°',
      range: [0, 90],
      default: 45,
      step: 1,
      statePath: 'launch.theta',
    },
  ],

  stages: [
    {
      id: 'earth',
      label: { ko: '지구', en: 'Earth' },
      description: { ko: 'g = 9.8 m/s², 대기 있음', en: 'g = 9.8 m/s², atmosphere' },
      constants: { g: 9.8, hasAtmosphere: 1 },
    },
    {
      id: 'moon',
      label: { ko: '달', en: 'Moon' },
      description: { ko: 'g = 1.6 m/s², 대기 없음', en: 'g = 1.6 m/s², no atmosphere' },
      constants: { g: 1.6, hasAtmosphere: 0 },
    },
    {
      id: 'vacuum',
      label: { ko: '우주', en: 'Vacuum' },
      description: { ko: 'g = 0, 자유 공간', en: 'g = 0, free space' },
      constants: { g: 0, hasAtmosphere: 0 },
    },
  ],

  environments: [
    {
      id: 'rain',
      label: { ko: '비', en: 'Rain' },
      description: { ko: '공기저항 k = 0.08', en: 'Air drag k = 0.08' },
      availableInStages: ['earth'],
      effects: { drag: 0.08 },
    },
    {
      id: 'headwind',
      label: { ko: '앞바람', en: 'Headwind' },
      description: { ko: '수평 반대 방향 −3 m/s²', en: 'Counter-horizontal −3 m/s²' },
      availableInStages: ['earth'],
      effects: { wind: -3 },
    },
    {
      id: 'tailwind',
      label: { ko: '뒷바람', en: 'Tailwind' },
      description: { ko: '수평 같은 방향 +3 m/s²', en: 'Pro-horizontal +3 m/s²' },
      availableInStages: ['earth'],
      effects: { wind: 3 },
    },
  ],

  views: [
    { id: 'trajectory', label: { ko: '궤적', en: 'Trajectory' }, default: true },
    { id: 'forces', label: { ko: '분해', en: 'Forces' } },
    { id: 'energy', label: { ko: '에너지', en: 'Energy' } },
  ],


  /**
   * 이 그림은 사거리를 재는 것이 주장의 일부다 — 각도를 바꾸면 얼마나 멀리
   * 가는가. 그래서 거리 격자를 **켠다.** 기본값이 아니라 이 그림의 선택이다.
   */
  chrome: { grid: true },

  /**
   * 지면에서 위로 날아가는 그림이라 세로 쓰임이 위쪽으로 치우쳐 있다.
   * 원점을 중앙보다 60px 내려 위쪽 공간을 넓게 쓴다.
   */
  camera: { screenYBias: 60 },
};

/**
 * 에너지 뷰 막대 셋의 문안과 색 역할.
 *
 * 문안은 선언에 둔다 — 화면에 뜨는 글자가 scene 코드에 있으면 저작자가 바꿀 수
 * 없다 (원칙 2 · C1 · S-sim).
 *
 * `accent` 를 쓰지 않는다. 이 조각에서 accent 는 이미 **속도 벡터**의 뜻이고,
 * 강조색은 한 가지 뜻에만 쓴다 (S-piece). 운동·위치는 같은 에너지의 두 형태라
 * 주·보조로 가르고, 손실은 `negative` 가 정의 그대로 받는다.
 */
export const ENERGY_UNIT = { ko: 'J', en: 'J' } as const;

export const ENERGY_BARS = [
  { key: 'ke', role: 'primary', label: { ko: '운동', en: 'KE' } },
  { key: 'pe', role: 'secondary', label: { ko: '위치', en: 'PE' } },
  { key: 'lost', role: 'negative', label: { ko: '손실', en: 'Lost' } },
] as const;
