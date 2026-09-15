import type { BundleSchema } from '@aperi21/schema';

export const schema: BundleSchema = {
  id: 'dc_circuit',
  label: { ko: 'DC 회로', en: 'DC Circuit' },
  category: 'electromagnetism',
  operation: {
    ko: '배터리·저항으로 단순·직렬·병렬 회로를 구성해 전압·전류를 확인.',
    en: 'Build simple/series/parallel DC circuits with batteries and resistors; inspect V/I.',
  },
  timeModel: 'static',

  parameters: [
    {
      id: 'V',
      label: { ko: '기전력', en: 'EMF' },
      unit: 'V',
      range: [1, 24],
      default: 9,
      step: 0.5,
    },
    {
      id: 'R1',
      label: { ko: '저항 R1', en: 'Resistor R1' },
      unit: 'Ω',
      range: [1, 1000],
      default: 100,
      step: 1,
    },
    {
      id: 'R2',
      label: { ko: '저항 R2', en: 'Resistor R2' },
      unit: 'Ω',
      range: [1, 1000],
      default: 200,
      step: 1,
    },
  ],

  stages: [
    {
      id: 'simple',
      label: { ko: '단순 회로', en: 'Simple' },
      description: { ko: '배터리 + 저항 1', en: 'Battery + single resistor' },
      constants: { topology: 1 },
    },
    {
      id: 'series',
      label: { ko: '직렬', en: 'Series' },
      description: { ko: '배터리 + 저항 2 직렬', en: 'Battery + two resistors in series' },
      constants: { topology: 2 },
    },
    {
      id: 'parallel',
      label: { ko: '병렬', en: 'Parallel' },
      description: { ko: '배터리 + 저항 2 병렬', en: 'Battery + two resistors in parallel' },
      constants: { topology: 3 },
    },
  ],

  environments: [],

  views: [
    { id: 'schematic', label: { ko: '회로도', en: 'Schematic' }, default: true },
    { id: 'meters', label: { ko: '계측', en: 'Meters' } },
  ],

};
