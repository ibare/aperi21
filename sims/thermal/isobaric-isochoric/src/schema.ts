// ========================================================================
// isobaric-isochoric — 선언
// ========================================================================
// 질문: 같은 열을 넣어도 무엇을 붙드느냐에 따라 기체는 어디로 가는가.
//
// 같은 처음 상태의 기체 두 통에 같은 열을 넣는다. 추를 얹은 자유 피스톤(압력 고정)은
// 부피가 늘어 P-V 그림에서 가로로 가고, 그 아래 넓이(일)가 칠해진다. 핀으로 고정한
// 피스톤(부피 고정)은 압력만 올라 세로로 가고, 그 아래 넓이는 0 이다. 일을 하지 않은
// 쪽의 온도 막대가 더 높이 오른다(3 : 5). 동사: (경로가) 갈린다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:isobaric-isochoric` 와 문자 그대로 일치한다 (C4). */
export const ISOBARIC_ISOCHORIC_ID = 'isobaric-isochoric';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const isobaricIsochoricMessages = Object.freeze({
  'label.title': { ko: '등압·등적 과정', en: 'Isobaric and isochoric processes' },
  'label.stage': { ko: '단원자 기체 두 통', en: 'Two cylinders of monatomic gas' },
  'label.view': { ko: 'P-V 그림과 두 실린더', en: 'P-V diagram and two cylinders' },

  'label.isobaric': { ko: '압력 고정', en: 'Fixed pressure' },
  'label.isochoric': { ko: '부피 고정', en: 'Fixed volume' },
  'label.rise': { ko: '+{dt} K', en: '+{dt} K' },

  'caption.intro': {
    ko: '같은 기체, 같은 {t0} K — 왼쪽 피스톤은 추를 얹고 자유롭게, 오른쪽 피스톤은 핀으로 고정했다',
    en: 'Same gas, same {t0} K — the left piston is free under a weight, the right one is pinned',
  },
  'caption.heat': {
    ko: '두 실린더에 같은 열을 넣는다 — 한 점은 가로로, 한 점은 세로로 간다',
    en: 'Both cylinders get the same heat — one state moves sideways, the other straight up',
  },
  'caption.result': {
    ko: '같은 열에 압력 고정 쪽은 {dtp} K, 부피 고정 쪽은 {dtv} K 올랐다 — 칠해진 넓이는 가로선 아래뿐이다',
    en: 'Same heat: the fixed-pressure gas rose {dtp} K, the fixed-volume gas {dtv} K — only the sideways path has area under it',
  },
} satisfies Record<string, LocalizedText>);

export type IsobaricIsochoricMessageKey = keyof typeof isobaricIsochoricMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IsobaricIsochoricMessageKey): LocalizedText => isobaricIsochoricMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IsobaricIsochoricMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const isobaricIsochoricSchema: BundleSchema = {
  id: ISOBARIC_ISOCHORIC_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',
  parameters: [],

  /**
   * 주장이 기대는 물리량 — 모두 선언이다.
   *
   * - `t0` 두 통의 처음 온도(K) · `v0` 처음 부피(L) · `p0` 처음 압력(P 축 한 칸)
   * - `dTp` 압력 고정(자유 피스톤) 쪽 온도 상승(K) · `dTv` 부피 고정(핀) 쪽 온도 상승(K).
   *   같은 열 Q 를 단원자 이상 기체에 넣으면 Q = 5/2·nR·dTp = 3/2·nR·dTv 이라 3 : 5 가
   *   되도록 골랐다(180 : 300). 두 값 사이의 관계는 선언할 자리가 없다(장부 G143).
   *
   * 끝 부피 · 끝 압력은 이상 기체의 배치 계산이다 — V = v0·T/t0, P = p0·T/t0.
   */
  stages: [
    {
      id: 'monatomic',
      label: text('label.stage'),
      constants: {
        t0: 300,
        v0: 1,
        p0: 1,
        dTp: 180,
        dTv: 300,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 실린더 벽이 피스톤 · 핀 위에 온다. */
  drawOrder: 'scene',

  /** 한 판 — 두 통을 나란히 같은 시각에 데운다. */
  timeline: {
    phases: [
      { id: 'in', duration: 0.4, caption: key('caption.intro') },
      { id: 'show', duration: 1.6, caption: key('caption.intro') },
      { id: 'heat', duration: 4.2, ease: 'smooth', caption: key('caption.heat') },
      { id: 'hold', duration: 4.4, caption: key('caption.result') },
      { id: 'out', duration: 0.5, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 두 점이 갈라져 가는 중이다. */
  startAt: 3.0,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      t0: 't0Text',
      dtp: 'dTpText',
      dtv: 'dTvText',
    },
  },

  messages: isobaricIsochoricMessages,
};
