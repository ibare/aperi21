// ========================================================================
// fermi-level — 선언
// ========================================================================
// 질문: 금속의 전자는 띠를 어디까지 채우는가? 그리고 온도가 오르면 그 경계는 어떻게 되는가?
//
// 답: **채워진 데까지의 경계가 페르미 준위다.** 절대 0도에서 전자는 가장 낮은 자리부터
// 빈틈없이 차서 페르미 준위에서 칼같이 끊기고, 그 위는 텅 비어 있다. 온도를 올리면 페르미
// 준위 바로 아래의 전자 몇 개만 바로 위로 올라가 경계가 kT 폭만큼 무뎌진다(페르미-디랙 분포).
// kT 는 페르미 준위 높이(수 eV)에 비하면 아주 작아서, 깊은 곳의 전자는 꼼짝하지 않는다.
//
// 화면에서는 왼쪽에 띠 전체(구리)를, 가운데에 페르미 준위 둘레를 확대한 준위 그림을,
// 오른쪽에 같은 세로축의 「채워질 확률」 곡선을 둔다. 0 K → 300 K → 1000 K → 0 K 를 돈다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:fermi-level` 와 문자 그대로 일치한다 (C4). */
export const FERMI_LEVEL_ID = 'fermi-level';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 페르미 준위 — 띠 바닥에서 잰 높이(eV). 구리 7 eV. */
export const FERMI_EV = 7;
/** 왼쪽 띠 그림의 꼭대기(eV). 페르미 준위 위의 빈 자리를 보일 만큼. */
export const BAND_TOP_EV = 10;
/** 데운 두 온도(K)와 그때의 kT(eV). kT = k_B T — 둘 사이 관계는 저작자가 맞춘다 (NOTES c, G143). */
export const TEMP_LOW_K = 300;
export const KT_LOW_EV = 0.026;
export const TEMP_HIGH_K = 1000;
export const KT_HIGH_EV = 0.086;
/**
 * 확대 창의 반높이(eV) — 페르미 준위 위아래로 이만큼을 가운데 그림에 편다. 1000 K 에서도
 * 창의 맨 아래 준위들은 그대로여야 「깊은 곳은 꼼짝하지 않는다」 가 창 안에서도 보인다.
 */
export const ZOOM_HALF_EV = 0.35;
/** 확대 창 안 준위 간격(eV). 페르미 준위는 두 준위 한가운데에 온다. 간격 자체는 표현이다. */
export const LEVEL_SPACING_EV = 0.05;
/** 준위 하나에 앉는 전자 자리 수. */
export const SLOTS_PER_LEVEL = 12;
/** 데웠을 때 어느 칸의 전자가 떠나고 어느 칸에 앉는지 고르는 시드 (S-sim — 같은 시각은 같은 화면). */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 왼쪽 띠 전체 · 가운데 확대 창 · 오른쪽 채움 확률 곡선.
// ------------------------------------------------------------------------

/** 세 그림이 서는 바닥과 높이(월드). 세 그림이 같은 높이를 쓴다. */
export const PANEL_BOTTOM_Y = 0;
export const PANEL_TOP_Y = 3;
/** 왼쪽 띠 그림의 가운데 x · 반너비. */
export const WHOLE_X = -4.3;
export const WHOLE_HALF_W = 0.45;
/** 가운데 확대 창의 왼쪽 · 오른쪽 x. */
export const ZOOM_LEFT_X = -3.0;
export const ZOOM_RIGHT_X = 0;
/** 채움 확률 곡선의 f = 0 · f = 1 자리 x. */
export const CURVE_X0 = 0.55;
export const CURVE_X1 = 2.55;

/**
 * 프레이밍 — 왼쪽 띠 전체와 그 이름표, 오른쪽 kT 치수와 그 값. 아래는 그림 이름과 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -5.6, maxX: 4.9, minY: -1.05, maxY: 3.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fermiLevelMessages = Object.freeze({
  'label.title': { ko: '페르미 준위', en: 'Fermi level' },
  'label.operation': { ko: '전자가 채워진 높이', en: 'How high the electrons fill' },
  'label.stage': { ko: '구리', en: 'Copper' },
  'label.view': { ko: '띠 그림과 채워질 확률', en: 'Band diagram and occupation' },

  /** 그림 이름. */
  'label.whole': { ko: '띠 전체', en: 'Whole band' },
  'label.zoom': { ko: '페르미 준위 둘레 (확대)', en: 'Around the Fermi level (magnified)' },
  'label.occupancy': { ko: '채워질 확률', en: 'Chance of being filled' },
  /** 기호 · 단위 · 눈금 숫자. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.fermi': { ko: 'E_F', en: 'E_F' },
  'label.energy': { ko: '{e} eV', en: '{e} eV' },
  'label.kT': { ko: 'kT = {e} eV', en: 'kT = {e} eV' },
  'label.temp': { ko: 'T = {t} K', en: 'T = {t} K' },
  'label.tempZero': { ko: 'T = 0 K', en: 'T = 0 K' },
  'label.zero': { ko: '0', en: '0' },
  'label.one': { ko: '1', en: '1' },

  'caption.cold': {
    ko: '절대 0도 — 전자가 페르미 준위까지 빈틈없이 차 있고 그 위는 텅 비어 있다. 채움이 칼같이 끊긴다.',
    en: 'At absolute zero the electrons fill every state up to the Fermi level and none above it. The filling stops with a sharp edge.',
  },
  'caption.warm': {
    ko: '상온으로 데우면 페르미 준위 바로 아래의 전자 몇 개만 바로 위로 올라간다. 경계가 kT 폭만큼 무뎌진다.',
    en: 'Warm it to room temperature and only a few electrons just below the Fermi level move just above it. The edge blurs by about kT.',
  },
  'caption.hot': {
    ko: '더 뜨겁게 하면 무뎌지는 폭이 kT 를 따라 넓어진다. 그래도 kT 는 페르미 준위 높이에 비하면 아주 작아, 깊은 곳의 전자는 꼼짝하지 않는다.',
    en: 'Hotter still, the blur widens with kT. But kT is tiny next to the Fermi energy, so the electrons deep below never move.',
  },
  'caption.cool': {
    ko: '식히면 올라갔던 전자가 빈자리로 돌아와 경계가 다시 날카로워진다.',
    en: 'Cool it down and the raised electrons drop back into the gaps; the edge turns sharp again.',
  },
} satisfies Record<string, LocalizedText>);

export type FermiLevelMessageKey = keyof typeof fermiLevelMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FermiLevelMessageKey): LocalizedText => fermiLevelMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FermiLevelMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fermiLevelSchema: BundleSchema = {
  id: FERMI_LEVEL_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'copper',
      label: text('label.stage'),
      constants: {
        fermiEv: FERMI_EV,
        bandTopEv: BAND_TOP_EV,
        tempLowK: TEMP_LOW_K,
        kTLowEv: KT_LOW_EV,
        tempHighK: TEMP_HIGH_K,
        kTHighEv: KT_HIGH_EV,
        zoomHalfEv: ZOOM_HALF_EV,
        levelSpacingEv: LEVEL_SPACING_EV,
        slotsPerLevel: SLOTS_PER_LEVEL,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'bands', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 그림이 나란히. 세로는 확대 창의 준위 열네 줄이 정한다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 띠 · 준위 · 창 테두리 · 전자 · 페르미 준위 · 곡선 · 이름표.
   * 페르미 준위 점선이 전자 점 위를 지나야 경계로 읽힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 절대 0도의 날카로운 경계가 서 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 13 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `cold` — 절대 0도. 채움이 페르미 준위에서 칼같이 끊긴다.
   * - `warm` · `warmHold` — 상온(`tempLowK`)으로 데운다. 페르미 준위 바로 아래 전자 몇 개가 바로 위로
   *   오르고, 곡선의 모서리가 kT 폭으로 무뎌진다.
   * - `hot` · `hotHold` — 더 뜨겁게(`tempHighK`). 더 많은 전자가 오르고 무뎌진 폭이 넓어진다.
   * - `cool` · `coolHold` — 절대 0도로 식힌다. 올라갔던 전자가 제자리로 돌아온다. 다음 주기의 `cold` 로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'cold', duration: 2.6, caption: key('caption.cold') },
      { id: 'warm', duration: 1.3, ease: 'smooth', caption: key('caption.warm') },
      { id: 'warmHold', duration: 2.4, caption: key('caption.warm') },
      { id: 'hot', duration: 1.5, ease: 'smooth', caption: key('caption.hot') },
      { id: 'hotHold', duration: 3.0, caption: key('caption.hot') },
      { id: 'cool', duration: 1.4, ease: 'smooth', caption: key('caption.cool') },
      { id: 'coolHold', duration: 0.8, caption: key('caption.cool') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: fermiLevelMessages,
};
