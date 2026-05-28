import type { BundleSchema } from '@aperi21/schema';

export const schema: BundleSchema = {
  id: 'ray_tracing',
  label: { ko: '광선 추적', en: 'Ray Tracing' },
  category: 'optics',
  operation: {
    ko: '광원과 렌즈·거울을 배치해 광선 경로와 결상을 관찰.',
    en: 'Place source and lens/mirror to watch ray paths and image formation.',
  },
  timeModel: 'static',

  parameters: [
    {
      id: 'objectDistance',
      label: { ko: '물체 거리', en: 'Object distance' },
      unit: 'm',
      range: [2, 40],
      default: 20,
      step: 1,
    },
    {
      id: 'objectHeight',
      label: { ko: '물체 높이', en: 'Object height' },
      unit: 'm',
      range: [-8, 8],
      default: 3,
      step: 0.5,
    },
    {
      id: 'focalLength',
      label: { ko: '초점 거리', en: 'Focal length' },
      unit: 'm',
      range: [-15, 15],
      default: 8,
      step: 0.5,
    },
  ],

  stages: [
    {
      id: 'convex-lens',
      label: { ko: '볼록 렌즈', en: 'Convex lens' },
      constants: { subtype: 1, orientation: 0, n: 1 },
    },
    {
      id: 'concave-lens',
      label: { ko: '오목 렌즈', en: 'Concave lens' },
      constants: { subtype: 2, orientation: 0, n: 1 },
    },
    {
      id: 'flat-mirror',
      label: { ko: '평면거울', en: 'Flat mirror' },
      constants: { subtype: 3, orientation: 0, n: 1 },
    },
  ],

  environments: [],

  views: [
    { id: 'rays', label: { ko: '광선', en: 'Rays' }, default: true },
    { id: 'image', label: { ko: '결상', en: 'Image' } },
  ],

  autoViews: { energy: false },
};
