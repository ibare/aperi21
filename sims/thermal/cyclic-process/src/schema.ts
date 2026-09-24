// ========================================================================
// cyclic-process — 선언
// ========================================================================
// 질문: 기체가 한 바퀴 돌아 처음 상태로 오면 아무 일도 없었던 것과 같은가.
//
// P-V 그림에서 네 꼭짓점 직사각형 순환(등압 · 등적 두 쌍)을 시계 방향으로 돈다.
// 팽창 구간 아래가 칠해지고(한 일), 압축 구간 아래가 빗금으로 바뀌고(받은 일),
// 빗금 친 몫이 지워져 고리 안만 남는다. 옆 온도계는 처음 눈금으로 돌아온다.
// 동사: (고리 안 넓이가) 남는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:cyclic-process` 와 문자 그대로 일치한다 (C4). */
export const CYCLIC_PROCESS_ID = 'cyclic-process';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const cyclicProcessMessages = Object.freeze({
  'label.title': { ko: '순환 과정', en: 'Cyclic process' },
  'label.stage': { ko: '직사각형 순환', en: 'Rectangular cycle' },
  'label.view': { ko: 'P-V 그림과 온도계', en: 'P-V diagram and thermometer' },

  'label.workOut': { ko: '한 일', en: 'Work done' },
  'label.workIn': { ko: '받은 일', en: 'Work received' },
  'label.net': { ko: '남은 일', en: 'Work left' },
  'label.start': { ko: '처음', en: 'Start' },

  'caption.start': {
    ko: '상태 A 에서 출발한다 — 온도계의 지금 높이가 「처음」 눈금',
    en: 'Starting from state A — the thermometer sits at the "Start" mark',
  },
  'caption.expand': {
    ko: '압력을 그대로 두고 부피가 늘어난다 — 지나온 길 아래가 칠해지고 온도계가 오른다',
    en: 'Volume grows at constant pressure — the area under the path fills and the thermometer rises',
  },
  'caption.cool': {
    ko: '부피를 그대로 두고 식힌다 — 압력이 내려가고, 칠해지는 넓이는 없다',
    en: 'Cooling at fixed volume — the pressure drops and no area fills',
  },
  'caption.compress': {
    ko: '압력을 그대로 두고 부피가 줄어든다 — 지나온 길 아래가 빗금으로 바뀐다',
    en: 'Volume shrinks at constant pressure — the area under the path turns hatched',
  },
  'caption.heat': {
    ko: '부피를 그대로 두고 데운다 — 압력이 오르고 온도계가 올라간다',
    en: 'Heating at fixed volume — the pressure rises and so does the thermometer',
  },
  'caption.cancel': {
    ko: '다시 A — 빗금 친 넓이가 칠해진 넓이에서 지워진다',
    en: 'Back at A — the hatched area is taken away from the shaded area',
  },
  'caption.result': {
    ko: '온도계는 「처음」 눈금 그대로인데, 고리 안 넓이는 남았다',
    en: 'The thermometer is back at "Start", yet the area inside the loop is left',
  },
} satisfies Record<string, LocalizedText>);

export type CyclicProcessMessageKey = keyof typeof cyclicProcessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CyclicProcessMessageKey): LocalizedText => cyclicProcessMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CyclicProcessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const cyclicProcessSchema: BundleSchema = {
  id: CYCLIC_PROCESS_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',
  parameters: [],

  /**
   * 네 꼭짓점 — 모두 선언이다. P 는 임의 단위, V 는 L.
   *
   * - `pHigh` 팽창하는 쪽 압력 · `pLow` 압축하는 쪽 압력
   * - `v1` 작은 부피 · `v2` 큰 부피
   *
   * A = (v1, pHigh) → B = (v2, pHigh) → C = (v2, pLow) → D = (v1, pLow) → A.
   * 온도는 P·V 에 비례해 온도계 높이가 된다 (이상 기체, 물질량 고정).
   */
  stages: [
    {
      id: 'rectangle',
      label: text('label.stage'),
      constants: { pHigh: 3, pLow: 1, v1: 1, v2: 4 },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 340, minHeight: 320 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 상태점이 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 한 바퀴. 네 다리(expand · cool · compress · heat)가 직사각형의 네 변이고,
   * cancel 에서 빗금 친 몫이 지워지고 hold 에서 고리 안만 남는다. out 에서 옅어져 다시 연다.
   */
  timeline: {
    phases: [
      { id: 'show', duration: 0.8, caption: key('caption.start') },
      { id: 'expand', duration: 2.6, ease: 'smooth', caption: key('caption.expand') },
      { id: 'cool', duration: 1.4, ease: 'smooth', caption: key('caption.cool') },
      { id: 'compress', duration: 2.6, ease: 'smooth', caption: key('caption.compress') },
      { id: 'heat', duration: 1.4, ease: 'smooth', caption: key('caption.heat') },
      { id: 'cancel', duration: 1.2, ease: 'smooth', caption: key('caption.cancel') },
      { id: 'hold', duration: 2.8, caption: key('caption.result') },
      { id: 'out', duration: 0.5, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 부피가 늘며 길 아래가 칠해지는 중이다. */
  startAt: 1.6,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 600,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  messages: cyclicProcessMessages,
};
