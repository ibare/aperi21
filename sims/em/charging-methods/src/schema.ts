// ========================================================================
// charging-methods — 선언
// ========================================================================
// 질문: 물체를 대전시키는 세 방법(마찰 · 접촉 · 유도)은 무엇이 다른가?
//
// 답: 셋 다 **전자만 옮겨 다닌다** — 원자핵의 + 는 제자리다. 다른 것은 전자가
// 어디서 어디로 가느냐이고, 그래서 남는 부호가 갈린다.
//
//   마찰 — 문지르는 동안 전자가 한쪽(털가죽)에서 다른 쪽(막대)으로 옮겨 가 두
//          물체가 **반대 부호**가 된다.
//   접촉 — − 로 대전된 도체가 중성 도체에 닿으면 남는 전자를 나눠 가져 둘 다
//          **같은 부호**가 된다.
//   유도 — − 막대를 가까이 대면 도체 속 전자가 먼 쪽으로 밀리고, 그쪽을 땅에
//          이었다 끊고 막대를 치우면 전자가 모자란 채 **반대 부호**가 남는다.
//
// 이 조각은 부호에만 머문다. 대전된 두 물체가 서로 미는지 당기는지(electric-charge),
// 힘의 크기(coulombs-law), 도체 겉면의 전하 분포(charge-on-conductor-surface)는 하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charging-methods` 와 문자 그대로 일치한다 (C4). */
export const CHARGING_METHODS_ID = 'charging-methods';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 물체 하나에 든 원자핵 + 의 수. 중성이면 전자도 이만큼이다. */
export const NUCLEI_PER_OBJECT = 4;
/** 마찰 — 문지르는 동안 털가죽에서 막대로 옮겨 가는 전자 수. */
export const RUB_TRANSFER = 2;
/** 접촉 — 처음 대전된 도체가 가진 남는 전자 수. 같은 도체 둘이 닿으면 반씩 나눈다. */
export const CONTACT_EXCESS = 2;
/** 유도 — 가까이 대는 막대가 가진 남는 전자 수. 막대의 전자는 옮겨 가지 않는다. */
export const INDUCER_EXCESS = 2;
/** 유도 — 접지한 동안 도체에서 땅으로 빠져나가는 전자 수. */
export const GROUND_OUT = 2;
/** 마찰 — 문지르는 단계 동안 막대가 오가는 횟수. */
export const RUB_STROKES = 3;
/** 마찰 — 막대가 오가는 폭(월드 단위, 한쪽). */
export const RUB_AMPLITUDE = 0.3;
/**
 * 유도 — 밀려난 전자가 몰리는 폭(도체 안쪽 폭에 대한 비). 표시 배율이다 — 실제로는
 * 겉면에 얇게 몰리지만 알갱이가 겹치지 않고 읽히는 만큼만 좁힌다.
 */
export const CROWD_FRACTION = 0.55;
/**
 * 유도 — 접지선으로 빠지는 전자끼리의 시차(단계 길이에 대한 비). 한꺼번에 떠나면 선 위에서
 * 겹쳐 하나로 보인다. 알갱이마다 다른 시각이라 단계로 풀지 못해 상수로 둔다 (NOTES (c)).
 */
export const ELECTRON_STAGGER = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위는 임의 길이. 세 판이 가로로 나란하다.
// ------------------------------------------------------------------------

/** 세 판의 가운데 x. 왼쪽부터 마찰 · 접촉 · 유도. */
export const PANEL_X = [-4.0, 0, 4.3] as const;
/** 판 이름의 높이. */
export const PANEL_TITLE_Y = 1.65;
/** 물체 높이 — 모든 물체가 같다. 위 줄에 +, 아래 두 줄에 전자. */
export const OBJECT_H = 0.9;
/** 결과 표식(중성 · − 대전 · + 대전)을 물체 아래로 내리는 거리(월드). */
export const TAG_DROP = 0.28;

/** 마찰 — 막대와 털가죽의 폭 · 가운데 높이. 문지를 때 막대가 털가죽 위에 얹힌다. */
export const FRICTION = {
  width: 2.0,
  furY: -0.5,
  rodRubY: 0.4,
  rodApartY: 0.95,
} as const;

/** 접촉 — 두 도체의 폭 · 자리. A 가 오른쪽으로 가 B 에 닿았다 돌아온다. */
export const CONTACT = {
  width: 1.4,
  y: -0.5,
  aX: -0.85,
  aTouchX: -0.55,
  bX: 0.85,
} as const;

/** 유도 — 막대 · 도체 · 땅의 자리. 접지선은 도체 오른쪽 끝에서 땅으로 내려간다. */
export const INDUCTION = {
  rodW: 1.4,
  rodY: -0.5,
  rodFarX: -1.5,
  rodNearX: -1.0,
  condW: 1.6,
  condX: 0.8,
  condY: -0.5,
  /** 접지선이 꺾이는 x 와 땅 기호 윗선의 높이. */
  wireX: 1.85,
  earthY: -1.2,
} as const;

/**
 * 프레이밍 — 세 판과 판 이름 · 결과 표식 · 땅 아래 전자까지. 캡션 줄은 아래 여백이 받는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -5.2, maxX: 6.55, minY: -1.9, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chargingMethodsMessages = Object.freeze({
  'label.title': { ko: '대전 방법', en: 'Charging methods' },
  'label.operation': { ko: '마찰·접촉·유도', en: 'Friction, contact and induction' },
  'label.stage': { ko: '세 가지 대전', en: 'Three ways to charge' },
  'label.view': { ko: '세 판', en: 'Three panels' },

  /** 판 이름. */
  'panel.friction': { ko: '마찰', en: 'Friction' },
  'panel.contact': { ko: '접촉', en: 'Contact' },
  'panel.induction': { ko: '유도', en: 'Induction' },

  /** 원자핵 · 전자 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  'mark.electron': { ko: 'e⁻', en: 'e⁻' },

  /** 물체 아래 결과 표식. 전자 수와 + 수를 세지 않고도 부호를 읽게 한다. */
  'tag.neutral': { ko: '중성', en: 'neutral' },
  'tag.negative': { ko: '− 대전', en: 'charged −' },
  'tag.positive': { ko: '+ 대전', en: 'charged +' },

  'caption.appear': {
    ko: '+ 는 원자핵, e⁻ 는 전자다.',
    en: 'The + marks are nuclei; e⁻ are electrons.',
  },
  'caption.rub': {
    ko: '마찰 — 막대로 털가죽을 문지르는 동안 전자만 털가죽에서 막대로 옮겨 간다. 원자핵 + 는 제자리다.',
    en: 'Friction — while the rod rubs the fur, only electrons move from the fur to the rod. The + nuclei stay put.',
  },
  'caption.rubApart': {
    ko: '떼어 놓으면 막대는 전자가 남아 −, 털가죽은 모자라 + — 두 물체가 반대 부호다.',
    en: 'Pulled apart, the rod has extra electrons (−) and the fur is short of them (+): opposite signs.',
  },
  'caption.touch': {
    ko: '접촉 — − 로 대전된 도체가 다가가 중성 도체에 닿는다.',
    en: 'Contact — a conductor charged − moves over and touches a neutral one.',
  },
  'caption.share': {
    ko: '닿은 자리로 남는 전자가 건너가 두 도체가 나눠 가진다.',
    en: 'The extra electrons cross where they touch, and the two conductors share them.',
  },
  'caption.contactApart': {
    ko: '떼어 놓으면 둘 다 − — 접촉은 같은 부호를 나눠 준다.',
    en: 'Pulled apart, both are − : contact passes on the same sign.',
  },
  'caption.near': {
    ko: '유도 — 막대(− 대전)를 닿지 않게 가까이 대면 도체 속 전자가 먼 쪽으로 밀려난다. 도체는 아직 중성이다.',
    en: 'Induction — with a rod (charged −) held close but not touching, the electrons in the conductor are pushed to the far side. It is still neutral.',
  },
  'caption.connect': {
    ko: '막대를 댄 채 도체의 먼 쪽을 땅에 잇는다.',
    en: 'With the rod still close, the far side is connected to the ground.',
  },
  'caption.ground': {
    ko: '밀려난 전자가 접지선을 따라 땅으로 빠져나간다.',
    en: 'The pushed electrons escape down the wire into the ground.',
  },
  'caption.unground': {
    ko: '막대를 댄 채 땅과의 연결을 끊는다. 빠져나간 전자는 돌아오지 못한다.',
    en: 'With the rod still close, the ground wire is cut. The electrons that left cannot come back.',
  },
  'caption.withdraw': {
    ko: '막대를 치우면 남은 전자가 고르게 퍼지고, 도체는 막대와 반대인 + 로 남는다.',
    en: 'With the rod taken away, the remaining electrons spread out and the conductor is left +, opposite to the rod.',
  },
  'caption.hold': {
    ko: '문지르면 반대 부호, 닿으면 같은 부호, 가까이 대고 접지했다 떼면 반대 부호가 남는다.',
    en: 'Rubbing leaves opposite signs, touching leaves the same sign, and inducing with a ground leaves the opposite sign.',
  },
} satisfies Record<string, LocalizedText>);

export type ChargingMethodsMessageKey = keyof typeof chargingMethodsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChargingMethodsMessageKey): LocalizedText => chargingMethodsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChargingMethodsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chargingMethodsSchema: BundleSchema = {
  id: CHARGING_METHODS_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-ways',
      label: text('label.stage'),
      constants: {
        nucleiPerObject: NUCLEI_PER_OBJECT,
        rubTransfer: RUB_TRANSFER,
        contactExcess: CONTACT_EXCESS,
        inducerExcess: INDUCER_EXCESS,
        groundOut: GROUND_OUT,
        rubStrokes: RUB_STROKES,
        rubAmplitude: RUB_AMPLITUDE,
        crowdFraction: CROWD_FRACTION,
        electronStagger: ELECTRON_STAGGER,
      },
    },
  ],
  environments: [],
  views: [{ id: 'panels', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 판이 나란하다. 세로는 판 하나의 높이와 캡션만큼이면 된다. */
  canvas: { height: 340, minHeight: 290 },

  /** 도착한 순간 이미 막대가 털가죽을 문지르고 있다 (S-piece). */
  startAt: 1.4,

  /**
   * 한 주기. 세 판이 차례로 움직이고, 앞 판은 결과를 그대로 들고 있다.
   *
   * - `appear` — 모든 물체가 나타난다. 마찰 · 유도의 도체는 중성, 접촉의 왼쪽 도체와
   *   유도의 막대는 처음부터 − 다.
   * - `rub` · `rubApart` — 마찰. 문지르는 동안 전자가 옮겨 가고, 떼어 놓는다.
   * - `touch` · `share` · `contactApart` — 접촉. 다가가 닿고, 전자를 나누고, 떨어진다.
   * - `near` · `connect` · `ground` · `unground` · `withdraw` — 유도. 막대를 대고,
   *   접지선을 잇고, 전자가 빠지고, 선을 끊고, 막대를 치운다.
   * - `hold` — 세 결과를 나란히 둔다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.6, caption: key('caption.appear') },
      { id: 'rub', duration: 2.4, ease: 'smooth', caption: key('caption.rub') },
      { id: 'rubApart', duration: 1.0, ease: 'smooth', caption: key('caption.rubApart') },
      { id: 'touch', duration: 0.9, ease: 'smooth', caption: key('caption.touch') },
      { id: 'share', duration: 1.2, ease: 'smooth', caption: key('caption.share') },
      { id: 'contactApart', duration: 1.0, ease: 'smooth', caption: key('caption.contactApart') },
      { id: 'near', duration: 1.4, ease: 'smooth', caption: key('caption.near') },
      { id: 'connect', duration: 0.8, caption: key('caption.connect') },
      { id: 'ground', duration: 1.4, ease: 'smooth', caption: key('caption.ground') },
      { id: 'unground', duration: 0.9, caption: key('caption.unground') },
      { id: 'withdraw', duration: 1.4, ease: 'smooth', caption: key('caption.withdraw') },
      { id: 'hold', duration: 3.6, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 묻는 것은 거리가 아니라
  // 전자가 어디로 갔는가다 — 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: chargingMethodsMessages,
};
