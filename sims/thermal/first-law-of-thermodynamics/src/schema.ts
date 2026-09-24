// ========================================================================
// first-law-of-thermodynamics — 선언
// ========================================================================
// 질문: 기체에 열을 넣으면 그 열은 다 어디로 가는가.
//
// 추를 얹은 자유 피스톤 실린더에 열 알갱이를 하나씩 넣는다. 알갱이는 기체에 남는
// 더미(ΔU)와 피스톤을 민 더미(W)로 갈린다 — 단원자 기체의 등압 가열에서 3 : 2.
// 두 번째 판에서 피스톤을 핀으로 고정하면 같은 알갱이가 모두 기체에 남고, 온도 막대가
// 앞 판 눈금보다 더 올라간다. 동사: 갈린다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:first-law-of-thermodynamics` 와 문자 그대로 일치한다 (C4). */
export const FIRST_LAW_OF_THERMODYNAMICS_ID = 'first-law-of-thermodynamics';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const firstLawOfThermodynamicsMessages = Object.freeze({
  'label.title': { ko: '열역학 제1법칙', en: 'First law of thermodynamics' },
  'label.stage': { ko: '단원자 기체', en: 'Monatomic gas' },
  'label.view': { ko: '실린더와 열 알갱이', en: 'Cylinder and heat grains' },

  'label.q': { ko: '넣은 열 {q} J', en: 'Heat in {q} J' },
  'label.du': { ko: '기체에 남은 몫', en: 'Stays in gas' },
  'label.w': { ko: '피스톤을 민 몫', en: 'Pushes piston' },
  'label.gas': { ko: '헬륨 {n} mol', en: 'Helium {n} mol' },
  'label.heater': { ko: '가열', en: 'Heater' },
  'label.temperature': { ko: '온도', en: 'Temp.' },
  'label.t0': { ko: '{t} K', en: '{t} K' },
  'label.rise': { ko: '+{dt} K', en: '+{dt} K' },

  'caption.free.intro': {
    ko: '추를 얹은 피스톤이 자유롭게 오르내린다 — 기체는 {t0} K',
    en: 'A weighted piston is free to move — the gas is at {t0} K',
  },
  'caption.free.heat': {
    ko: '아래에서 열 알갱이 {grains}개를 넣는다 — 기체에 남는 것과 피스톤으로 가는 것이 갈린다',
    en: 'Feeding in {grains} grains of heat — some stay in the gas, some go to the piston',
  },
  'caption.free.result': {
    ko: '{u}개는 기체에 남아 {dtf} K 데웠고, {w}개는 추를 밀어 올렸다',
    en: '{u} stayed in the gas and warmed it {dtf} K; {w} pushed the weight up',
  },
  'caption.lock.intro': {
    ko: '같은 기체, {t0} K — 이번에는 피스톤을 핀으로 고정했다',
    en: 'Same gas at {t0} K — this time the piston is pinned',
  },
  'caption.lock.heat': {
    ko: '같은 열 알갱이 {grains}개를 넣는다 — 피스톤은 움직이지 않는다',
    en: 'Feeding in the same {grains} grains — the piston does not move',
  },
  'caption.lock.result': {
    ko: '{grains}개가 모두 기체에 남아 {dtl} K 데웠다 — 앞에서는 {dtf} K',
    en: 'All {grains} stayed in the gas and warmed it {dtl} K — {dtf} K before',
  },
} satisfies Record<string, LocalizedText>);

export type FirstLawOfThermodynamicsMessageKey = keyof typeof firstLawOfThermodynamicsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FirstLawOfThermodynamicsMessageKey): LocalizedText => firstLawOfThermodynamicsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FirstLawOfThermodynamicsMessageKey): string {
  return k;
}

/** 알갱이 하나가 날아가는 단계 길이(초). 알갱이마다 단계를 따로 선언한다 — 아래 `timeline`. */
const GRAIN_S = 0.8;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const firstLawOfThermodynamicsSchema: BundleSchema = {
  id: FIRST_LAW_OF_THERMODYNAMICS_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',
  parameters: [],

  /**
   * 주장이 기대는 물리량 — 모두 선언이다. 식으로 만들지 않는다.
   *
   * - `q` 넣은 열(J) · `n` 몰수 · `t0` 처음 온도(K)
   * - `dTFree` 자유 피스톤(등압)의 온도 상승(K) · `dTLocked` 고정 피스톤(등적)의 온도 상승(K).
   *   단원자 이상 기체라 q = 5/2·n·R·dTFree = 3/2·n·R·dTLocked 이 되도록 골랐다(0.4 mol · 750 J → 90 K · 150 K).
   * - `grains` 열 알갱이 수 · `uPart` 기체에 남는 알갱이 · `wPart` 피스톤을 미는 알갱이 (3 : 2).
   *   `grains` 는 시간표의 알갱이 단계 수(`free-g*` · `lock-g*`)와 같아야 한다.
   * - `molecules` 분자 수 · `seed` 분자 자리의 시드 · `molSpeed` 처음 온도에서 분자 걸음(상자 폭/초)
   */
  stages: [
    {
      id: 'monatomic',
      label: text('label.stage'),
      constants: {
        q: 750,
        n: 0.4,
        t0: 300,
        dTFree: 90,
        dTLocked: 150,
        grains: 5,
        uPart: 3,
        wPart: 2,
        molecules: 22,
        seed: 11,
        molSpeed: 0.55,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 실린더 벽이 핀 · 피스톤 가장자리 위에, 날아가는 알갱이가 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 두 판. 자유 피스톤(free) 다음에 고정 피스톤(lock).
   * 알갱이 하나가 날아가는 동안이 한 단계다 — 단계 안을 코드로 다시 가르지 않는다(S-piece).
   */
  timeline: {
    phases: [
      { id: 'free-in', duration: 0.4, caption: key('caption.free.intro') },
      { id: 'free-show', duration: 1.2, caption: key('caption.free.intro') },
      { id: 'free-g1', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g2', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g3', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g4', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-g5', duration: GRAIN_S, ease: 'smooth', caption: key('caption.free.heat') },
      { id: 'free-hold', duration: 2.6, caption: key('caption.free.result') },
      { id: 'free-out', duration: 0.5, caption: key('caption.free.result') },
      { id: 'lock-in', duration: 0.4, caption: key('caption.lock.intro') },
      { id: 'lock-show', duration: 1.4, caption: key('caption.lock.intro') },
      { id: 'lock-g1', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g2', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g3', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g4', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-g5', duration: GRAIN_S, ease: 'smooth', caption: key('caption.lock.heat') },
      { id: 'lock-hold', duration: 3.2, caption: key('caption.lock.result') },
      { id: 'lock-out', duration: 0.5, caption: key('caption.lock.result') },
    ],
  },

  /** 도착한 순간 이미 두 번째 알갱이가 날아가는 중이다. */
  startAt: 2.4,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      t0: 't0Text',
      grains: 'grainsText',
      u: 'uText',
      w: 'wText',
      dtf: 'dTFreeText',
      dtl: 'dTLockedText',
    },
  },

  messages: firstLawOfThermodynamicsMessages,
};
