// ========================================================================
// energy-flow-diagram — 선언
// ========================================================================
// 질문: 에너지는 보존된다는데, 석탄을 태운 에너지 가운데 전구 빛이 되는 건 얼마고
// 나머지는 어디서 없어지는가.
//
// 답의 동사: 갈라져 나간다. 발전소 · 송전선 · 전구를 지날 때마다 열 갈래로
// 떨어져 나가, 빛에 닿는 줄기는 처음의 몇 분의 일로 가늘어진다.
//
// 원본: tasks/piece-lab/energy-flow-diagram (손으로 짠 캔버스 한 장).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-flow-diagram` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_FLOW_DIAGRAM_ID = 'energy-flow-diagram';

/**
 * 흐름값 — 석탄 100 기준, 대략값. 발전 효율 · 송전 손실 · 전구 효율은 설비마다 달라
 * 문단에서 "대략" 임을 밝힌다. 저작자가 바꿀 수 있게 스테이지 상수로 둔다 (원칙 2).
 */
export const FLOWS = {
  /** 발전소 폐열. */
  plantHeat: 62,
  /** 송전선에서 열로. */
  lineHeat: 3,
  /** 집에 닿는 전기. */
  atHome: 35,
  /** 백열전구의 빛. */
  lightIncandescent: 2,
  /** LED 전구의 빛. */
  lightLed: 14,
} as const;

/** 전구 종류. 조작기가 state 의 `bulb` 에 적는 값이다. */
export const BULB = { incandescent: 0, led: 1 } as const;

/**
 * 배치 — 원본 캔버스(860 × 340 px)의 좌표를 그대로 월드 단위로 쓴다. 월드 y 는 위라
 * 원본의 화면 y 를 뒤집어 넣는다 (`physics.ts` 의 `at`).
 *
 * 흐름 1 당 굵기 `unit` 이 곧 주장이다 — 굵기 = 양.
 */
export const LAYOUT = {
  width: 860,
  height: 340,
  /** 줄기가 시작하는 x. */
  x0: 84,
  /** 발전소 · 송전선 · 전구 마디의 x. */
  nodes: [210, 440, 650] as readonly number[],
  /** 빛 갈래가 끝나는 x. */
  xEnd: 780,
  /** 줄기 윗변 y. */
  y0: 44,
  /** 흐름 1 당 굵기. */
  unit: 1.6,
  /** 열 갈래가 아래로 내려와 닿는 y. */
  yEnd: 272,
  /** 열이 흩어지는 꼬리 길이. */
  fade: 58,
  /** 갈래가 꺾일 때 안쪽 반지름. */
  bend: 16,
  /** 마디 막대 폭. */
  nodeWidth: 3,
} as const;

/** 에너지 알갱이. 위치 = (위상 + t · 속도) mod 주기 를 경로에 투영한다. */
export const DOTS = {
  count: 900,
  /** 경로 길이 주기(월드). */
  period: 1000,
  /** 흐르는 속도(월드/초). */
  speed: 72,
  /** 난수 시드. 같은 시각은 언제나 같은 화면이다. */
  seed: 1,
} as const;

/** 전구를 바꿨을 때 배분이 옮겨 가는 빠르기(1/초). 약 0.6 초에 끝난다. */
export const MIX_RATE = 1.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyFlowDiagramMessages = Object.freeze({
  'label.title': { ko: '에너지 흐름도', en: 'Energy flow diagram' },
  'label.operation': {
    ko: '갈래의 굵기로 나타낸 에너지의 행방',
    en: 'Where the energy goes, shown by branch thickness',
  },
  'label.stage': { ko: '석탄에서 전구까지', en: 'From coal to bulb' },
  'label.view': { ko: '흐름도', en: 'Flow' },
  'stage.plant': { ko: '발전소', en: 'Power plant' },
  'stage.line': { ko: '송전선', en: 'Power line' },
  'stage.bulb': { ko: '전구', en: 'Bulb' },
  /** 출발점. 두 줄로 쌓는다. */
  'value.source': { ko: '석탄\n{amount}', en: 'Coal\n{amount}' },
  'value.heat': { ko: '열 {n}', en: 'Heat {n}' },
  'value.light': { ko: '빛 {n}', en: 'Light {n}' },
  'option.incandescent': { ko: '백열전구', en: 'Incandescent' },
  'option.led': { ko: 'LED 전구', en: 'LED bulb' },
  'caption.main': {
    ko: '석탄 100 가운데 빛에 닿는 것은 {light}, 나머지 {rest} 은 발전소 · 송전선 · 전구에서 차례로 열 갈래로 새어 나간다.',
    en: 'Of 100 units of coal energy, {light} reaches light; the other {rest} leaks away as heat at the plant, the line and the bulb, one after another.',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyFlowDiagramMessageKey = keyof typeof energyFlowDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EnergyFlowDiagramMessageKey): LocalizedText => energyFlowDiagramMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyFlowDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyFlowDiagramSchema: BundleSchema = {
  id: ENERGY_FLOW_DIAGRAM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'coal-to-bulb', label: text('label.stage'), constants: { ...FLOWS } }],
  environments: [],
  views: [{ id: 'flow', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px 위로 전구 선택 줄, 아래로 캡션 한 줄. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침 순서가 그림이다 — 열 갈래 위에 줄기, 줄기 위에 빛 갈래와 마디, 그 위를 알갱이가
   * 흐르고 글자가 맨 위. 원본이 그린 순서 그대로다.
   */
  drawOrder: 'scene',

  /**
   * 한 단계 — 알갱이 경로가 한 바퀴 도는 시간(주기 1000 / 속도 72). 연출 단계가 없고
   * 흐름은 처음부터 띠 전체에 차 있다(위상이 흩어져 있다). 그래서 앞당길 시각도 없다.
   */
  timeline: {
    phases: [{ id: 'flow', duration: DOTS.period / DOTS.speed }],
  },
  startAt: 0,

  /** 그림 아래 한 줄. 숫자는 화면의 「빛 N」 과 같은 값에서 나온다 (state 경로). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -2] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
    vars: { light: 'lightText', rest: 'restText' },
  },

  messages: energyFlowDiagramMessages,
};
