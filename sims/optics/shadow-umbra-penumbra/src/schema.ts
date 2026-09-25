// ========================================================================
// shadow-umbra-penumbra — 선언
// ========================================================================
// 질문: 크기 있는 광원의 그림자는 왜 두 겹인가, 그 두 겹은 광원 크기에 따라 어떻게 바뀌는가.
//
// 어두운 방에 크기 있는 광원(세로 막대) · 가림판 · 스크린이 한 줄로 놓여 있다. 광원 위 · 아래
// 끝에서 가림판 위 · 아래 가장자리를 스치는 네 곧은 선이 스크린을 셋으로 나눈다 — 광원이 하나도
// 보이지 않는 본그림자, 광원 일부만 보이는 반그림자, 광원이 다 보이는 밝은 곳. 광원을 키우면
// 본그림자 띠가 좁아지고 반그림자 띠가 넓어진다. 스크린 옆 곡선은 스크린 각 높이에서 보이는
// 광원의 몫이다.
//
// 이웃 `rectilinear-propagation` 은 점광원의 그림자 끝(가림판 자리)을, `astro/eclipse` 는 해 ·
// 지구 · 달이 한 줄에 설 때를 말한다. 여기는 거리를 고정하고 광원 크기만 바꾼다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:shadow-umbra-penumbra` 와 문자 그대로 일치한다 (C4). */
export const SHADOW_UMBRA_PENUMBRA_ID = 'shadow-umbra-penumbra';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 광원 가운데 자리(월드). */
export const SOURCE_X = -6;
export const SOURCE_Y = 0;
/** 가림판 x · 높이 · 가운데 높이. 광원 → 가림판 거리 = 6. */
export const PLATE_X = 0;
export const PLATE_HEIGHT = 1.6;
export const PLATE_Y = 0;
/** 스크린 앞면 x 와 반높이. 광원 → 스크린 거리 = 12. */
export const SCREEN_X = 6;
export const SCREEN_HALF = 3.1;
/**
 * 광원 폭(세로 길이, 월드)의 세 정박값 — 작다 · 중간 · 크다.
 * 본그림자가 스크린까지 닿으려면 가장 큰 폭도 가림판 높이 × (광원 → 스크린) ÷ (가림판 → 스크린)
 * 보다 작아야 한다 (NOTES (c) G143).
 */
export const SOURCE_SMALL = 0.3;
export const SOURCE_MID = 1.2;
export const SOURCE_LARGE = 2.4;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 어두운 방의 왼쪽 · 위 · 아래 경계. 오른쪽 경계는 스크린 뒷면이다. */
export const ROOM = { minX: -6.7, minY: -3.3, maxY: 3.3 } as const;
/** 광원 · 가림판 · 스크린 두께. */
export const SOURCE_THICK = 0.16;
export const PLATE_THICK = 0.1;
export const SCREEN_THICK = 0.3;
/** 방 아래 이름표 줄의 높이. */
export const NAME_Y = -3.6;
/** 밝기 곡선 — 스크린 뒷면에서 띄운 거리와 「다 보임(1)」 까지의 가로 길이. */
export const CURVE_GAP = 0.3;
export const CURVE_WIDTH = 1.6;
/** 곡선 오른쪽 띠 치수선을 띄운 거리, 띠 이름표를 치수선에서 띄운 거리. */
export const BAND_DIM_GAP = 0.2;
export const BAND_LABEL_GAP = 0.15;
/** 곡선 눈금 글자(0 · 1)와 곡선 제목을 스크린 위 끝에서 띄운 거리. 아래는 이름표 줄이라 위에 둔다. */
export const CURVE_TICK_GAP = 0.25;
export const CURVE_HEAD_GAP = 0.65;

/**
 * 프레이밍은 주장의 일부다. 방 전체 + 오른쪽 곡선 · 띠 이름표 + 아래 이름표 · 캡션 줄.
 * 가장 큰 광원일 때의 반그림자까지 들어가도록 처음부터 잡는다. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6.8, maxX: 9.9, minY: -4.35, maxY: 4.0 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 한 광원 폭에 멈춘 동안 · 폭을 바꾸는 동안 · 처음으로 되돌리는 동안(초). */
export const HOLD = 3.2;
export const GROW = 1.6;
export const SHRINK = 2;
/** 도착한 순간 이미 그림자가 드리워져 있다 — 첫 멈춤 단계 안에서 연다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const shadowUmbraPenumbraMessages = Object.freeze({
  'label.title': {
    ko: '본그림자와 반그림자',
    en: 'Umbra and penumbra',
    ja: '本影と半影',
    zh: '本影与半影',
    ar: 'الظل وشبه الظل',
    es: 'Umbra y penumbra',
    fr: 'Ombre et pénombre',
    hi: 'प्रच्छाया और उपच्छाया',
    id: 'Umbra dan penumbra',
    pt: 'Umbra e penumbra',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '광원의 크기가 만드는 경계',
    en: 'How the size of a light source shapes a shadow’s edge',
    ja: '光源の大きさが影の縁をどう形づくるか',
    zh: '光源的大小如何塑造影子的边缘',
    ar: 'كيف يشكّل حجم مصدر الضوء حافة الظل',
    es: 'Cómo el tamaño de una fuente de luz da forma al borde de una sombra',
    fr: 'Comment la taille d’une source lumineuse façonne le bord d’une ombre',
    hi: 'प्रकाश स्रोत का आकार छाया के किनारे को कैसे गढ़ता है',
    id: 'Bagaimana ukuran sumber cahaya membentuk tepi bayang-bayang',
    pt: 'Como o tamanho de uma fonte de luz molda a borda de uma sombra',
  },
  'label.stage': {
    ko: '광원 · 가림판 · 스크린',
    en: 'Source, plate, screen',
    ja: '光源・遮蔽板・スクリーン',
    zh: '光源、挡板、光屏',
    ar: 'مصدر، حاجز، شاشة',
    es: 'Fuente, placa, pantalla',
    fr: 'Source, plaque, écran',
    hi: 'स्रोत, अवरोधक, पर्दा',
    id: 'Sumber, pelat, layar',
    pt: 'Fonte, placa, tela',
  },
  'label.view': {
    ko: '옆에서 본 모습',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  'label.source': {
    ko: '광원',
    en: 'source',
    ja: '光源',
    zh: '光源',
    ar: 'المصدر',
    es: 'fuente',
    fr: 'source',
    hi: 'स्रोत',
    id: 'sumber',
    pt: 'fonte',
  },
  'label.plate': {
    ko: '가림판',
    en: 'plate',
    ja: '板',
    zh: '挡板',
    ar: 'اللوح',
    es: 'placa',
    fr: 'plaque',
    hi: 'प्लेट',
    id: 'pelat',
    pt: 'placa',
  },
  'label.screen': {
    ko: '스크린',
    en: 'screen',
    ja: 'スクリーン',
    zh: '光屏',
    ar: 'الشاشة',
    es: 'pantalla',
    fr: 'écran',
    hi: 'पर्दा',
    id: 'layar',
    pt: 'tela',
  },
  'label.umbra': {
    ko: '본그림자',
    en: 'umbra',
    ja: '本影',
    zh: '本影',
    ar: 'الظل',
    es: 'umbra',
    fr: 'ombre',
    hi: 'प्रच्छाया',
    id: 'umbra',
    pt: 'umbra',
  },
  'label.penumbra': {
    ko: '반그림자',
    en: 'penumbra',
    ja: '半影',
    zh: '半影',
    ar: 'شبه الظل',
    es: 'penumbra',
    fr: 'pénombre',
    hi: 'उपच्छाया',
    id: 'penumbra',
    pt: 'penumbra',
  },
  'label.curve': {
    ko: '보이는 광원',
    en: 'source visible',
    ja: '見える光源',
    zh: '可见的光源',
    ar: 'الجزء المرئي من المصدر',
    es: 'fuente visible',
    fr: 'source visible',
    hi: 'दिखने वाला स्रोत',
    id: 'sumber yang terlihat',
    pt: 'fonte visível',
  },
  'tick.none': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  'tick.all': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'caption.small': {
    ko: '광원이 작다 — 본그림자가 넓고, 그 가장자리의 반그림자는 가는 띠다',
    en: 'A small source — the umbra is wide and the penumbra at its edge is a thin band',
    ja: '小さな光源 — 本影は広く、その縁の半影は細い帯だ',
    zh: '光源很小——本影很宽，边缘的半影是一条细带',
    ar: 'مصدر صغير — الظل عريض، وشبه الظل عند حافته شريط رفيع',
    es: 'Una fuente pequeña — la umbra es ancha y la penumbra en su borde es una banda delgada',
    fr: 'Une petite source — l’ombre est large et la pénombre sur son bord n’est qu’une mince bande',
    hi: 'छोटा स्रोत — प्रच्छाया चौड़ी है और उसके किनारे की उपच्छाया एक पतली पट्टी है',
    id: 'Sumber kecil — umbra lebar dan penumbra di tepinya berupa pita tipis',
    pt: 'Uma fonte pequena — a umbra é larga e a penumbra na borda é uma faixa fina',
  },
  'caption.growMid': {
    ko: '광원을 키운다',
    en: 'The source grows',
    ja: '光源が大きくなる',
    zh: '光源变大',
    ar: 'يكبر المصدر',
    es: 'La fuente crece',
    fr: 'La source s’agrandit',
    hi: 'स्रोत बड़ा होता है',
    id: 'Sumber membesar',
    pt: 'A fonte cresce',
  },
  'caption.mid': {
    ko: '네 선이 더 벌어졌다 — 본그림자가 좁아지고 반그림자 띠가 넓어졌다',
    en: 'The four lines have spread — the umbra is narrower and the penumbra bands are wider',
    ja: '4本の線が広がった — 本影は狭くなり、半影の帯は広くなった',
    zh: '四条线张开了——本影变窄，半影带变宽',
    ar: 'انفرجت الخطوط الأربعة — ضاق الظل واتسع شريطا شبه الظل',
    es: 'Las cuatro líneas se han abierto — la umbra es más estrecha y las bandas de penumbra, más anchas',
    fr: 'Les quatre droites se sont écartées — l’ombre est plus étroite et les bandes de pénombre plus larges',
    hi: 'चारों रेखाएँ फैल गई हैं — प्रच्छाया संकरी हुई और उपच्छाया की पट्टियाँ चौड़ी हुईं',
    id: 'Keempat garis melebar — umbra menyempit dan pita penumbra melebar',
    pt: 'As quatro linhas se abriram — a umbra está mais estreita e as faixas de penumbra, mais largas',
  },
  'caption.growLarge': {
    ko: '광원을 더 키운다',
    en: 'The source grows further',
    ja: '光源がさらに大きくなる',
    zh: '光源继续变大',
    ar: 'يكبر المصدر أكثر',
    es: 'La fuente crece aún más',
    fr: 'La source s’agrandit encore',
    hi: 'स्रोत और बड़ा होता है',
    id: 'Sumber makin membesar',
    pt: 'A fonte cresce ainda mais',
  },
  'caption.large': {
    ko: '본그림자는 가운데 좁은 띠만 남고, 반그림자가 스크린 대부분을 덮는다',
    en: 'Only a narrow umbra is left in the middle; the penumbra covers most of the screen',
    ja: '中央に細い本影だけが残り、半影がスクリーンの大部分を覆う',
    zh: '中间只剩一条窄窄的本影，半影覆盖了光屏的大部分',
    ar: 'لم يبقَ إلا ظل تام ضيق في الوسط، ويغطي شبه الظل معظم الشاشة',
    es: 'Solo queda una umbra estrecha en el centro; la penumbra cubre casi toda la pantalla',
    fr: 'Il ne reste qu’une ombre étroite au milieu ; la pénombre couvre presque tout l’écran',
    hi: 'बीच में केवल एक संकरी प्रच्छाया बची है; उपच्छाया पर्दे के अधिकांश भाग को ढकती है',
    id: 'Hanya umbra sempit yang tersisa di tengah; penumbra menutupi sebagian besar layar',
    pt: 'Só resta uma umbra estreita no meio; a penumbra cobre a maior parte da tela',
  },
  'caption.shrink': {
    ko: '광원을 다시 줄인다',
    en: 'The source shrinks back',
    ja: '光源が元の大きさに縮む',
    zh: '光源缩回原样',
    ar: 'يصغر المصدر من جديد',
    es: 'La fuente vuelve a encogerse',
    fr: 'La source rétrécit à nouveau',
    hi: 'स्रोत फिर छोटा हो जाता है',
    id: 'Sumber mengecil kembali',
    pt: 'A fonte volta a encolher',
  },
} satisfies Record<string, LocalizedText>);

export type ShadowUmbraPenumbraMessageKey = keyof typeof shadowUmbraPenumbraMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ShadowUmbraPenumbraMessageKey): LocalizedText => shadowUmbraPenumbraMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ShadowUmbraPenumbraMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const shadowUmbraPenumbraSchema: BundleSchema = {
  id: SHADOW_UMBRA_PENUMBRA_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 광원이 작다 → 중간 → 크다로 자랐다가 돌아온다.
  parameters: [],

  stages: [
    {
      id: 'extended-source',
      label: text('label.stage'),
      constants: {
        sourceX: SOURCE_X,
        sourceY: SOURCE_Y,
        plateX: PLATE_X,
        plateHeight: PLATE_HEIGHT,
        plateY: PLATE_Y,
        screenX: SCREEN_X,
        screenHalf: SCREEN_HALF,
        sourceSmall: SOURCE_SMALL,
        sourceMid: SOURCE_MID,
        sourceLarge: SOURCE_LARGE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 광원 · 가림판 · 스크린을 한 줄로 늘어놓는다 (S-piece — 세로가 비싸다). */
  canvas: { height: 380, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 빛 없음 방 → 빛 부채 → 반그림자 쐐기 → 본그림자 쐐기 → 네 선 → 가림판 · 스크린 순서로 얹는다.
   * 층 순서로는 `region`(방 · 쐐기)이 선 위로 올라와 가린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 작은 광원 → 키우기 → 중간 → 더 키우기 → 큰 광원 → 되돌리기. 폭을 바꾸는 동안
   * 광원 폭이 `smooth` 로 변하고 네 선 · 스크린 밝기 · 곡선이 그 폭을 따른다.
   */
  timeline: {
    phases: [
      { id: 'small', duration: HOLD, caption: key('caption.small') },
      { id: 'grow-mid', duration: GROW, ease: 'smooth', caption: key('caption.growMid') },
      { id: 'mid', duration: HOLD, caption: key('caption.mid') },
      { id: 'grow-large', duration: GROW, ease: 'smooth', caption: key('caption.growLarge') },
      { id: 'large', duration: HOLD, caption: key('caption.large') },
      { id: 'shrink', duration: SHRINK, ease: 'smooth', caption: key('caption.shrink') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 660,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값).

  messages: shadowUmbraPenumbraMessages,
};
