// ========================================================================
// thin-film-interference — 선언
// ========================================================================
// 질문: 비눗물은 무색 투명한데, 왜 비누막에는 색이 보이고 자리마다 색이 다른가.
//
// 두께가 바뀌면 간섭으로 지워지는 파장이 옮겨 가고, 남은 빛이 그 자리의 색이 된다.
//
// 원본: tasks/piece-lab/thin-film-interference/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thin-film-interference` 와 문자 그대로 일치한다 (C4). */
export const THIN_FILM_INTERFERENCE_ID = 'thin-film-interference';

// ------------------------------------------------------------------------
// 월드 — 원본 캔버스 px 를 그대로 월드 단위로 쓴다 (y 는 위)
// ------------------------------------------------------------------------

/** 원본 캔버스 폭 · 높이. 원본은 폭을 720~900 에서 골랐다 — 860 으로 고정한다. */
export const CANVAS_W = 860;
export const CANVAS_H = 290;

/** 원본 화면 y(아래로) → 월드 y(위로). */
export const worldY = (screenY: number): number => CANVAS_H - screenY;

/** 비누막 사각형 (원본 화면 좌표). */
export const FILM = { x: 28, y: 22, w: 190, h: 246 } as const;
/** 두께 단면 판. 가로가 두께 0 ~ `dMax` nm. */
export const THICK = { x0: 250, x1: 390, dMax: 1200 } as const;
/** 스펙트럼 판. 원본 `W - 120` 을 폭 860 에서 계산했다. */
export const SPEC = { x0: 440, x1: CANVAS_W - 120, top: 44, bottom: 232, l0: 380, l1: 740 } as const;
/** 보이는 색 원판. 원본 `W - 62`. */
export const SWATCH = { x: CANVAS_W - 62, y: 138, r: 28 } as const;

/** 관찰점이 놓이는 가로 자리(막 폭의 비). */
export const PROBE_X = 0.5;
/** 관찰 높이 기본값 · 끌기 범위(막 높이의 비, 위가 0). */
export const PROBE_Y_DEFAULT = 0.6;
export const PROBE_Y_RANGE = [0.04, 0.97] as const;

/** 글자 크기(화면 px). 원본 12px · 캡션 15px. */
export const LABEL_FONT = 12;
export const CAPTION_FONT = 15;

/**
 * 프레이밍 — 원본 캔버스 아래에 캡션 한 줄 자리를 둔다. 원본은 캔버스 밖 DOM 캡션이었다.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -40, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 시간표 — 원본 상수
// ------------------------------------------------------------------------

/** 막 한 장이 사는 시간(초). */
export const PERIOD = 13;
/** 새 막이 위에서부터 덮이는 시간(초). */
export const WIPE = 1;
/** 도착했을 때 이미 흘러내리는 중이도록 앞당기는 시간(초). */
export const OFFSET = 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thinFilmInterferenceMessages = Object.freeze({
  'label.title': {
    ko: '박막 간섭',
    en: 'Thin-film interference',
    ja: '薄膜干渉',
    zh: '薄膜干涉',
    ar: 'تداخل الأغشية الرقيقة',
    es: 'Interferencia en películas delgadas',
    fr: 'Interférences en lame mince',
    hi: 'पतली फ़िल्म में व्यतिकरण',
    id: 'Interferensi lapisan tipis',
    pt: 'Interferência em películas finas',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '두께가 만드는 색',
    en: 'Colour made by thickness',
    ja: '厚さがつくる色',
    zh: '由厚度产生的颜色',
    ar: 'لون يصنعه السُّمك',
    es: 'Color creado por el espesor',
    fr: 'La couleur créée par l’épaisseur',
    hi: 'मोटाई से बनने वाला रंग',
    id: 'Warna yang dibentuk oleh ketebalan',
    pt: 'Cor criada pela espessura',
  },
  'label.stage': {
    ko: '비누막',
    en: 'Soap film',
    ja: 'シャボン膜',
    zh: '肥皂膜',
    ar: 'غشاء الصابون',
    es: 'Película de jabón',
    fr: 'Film de savon',
    hi: 'साबुन की फ़िल्म',
    id: 'Lapisan sabun',
    pt: 'Película de sabão',
  },
  'label.view': {
    ko: '정면에서 본 비누막',
    en: 'Soap film seen face-on',
    ja: '正面から見たシャボン膜',
    zh: '正面看到的肥皂膜',
    ar: 'غشاء الصابون من الأمام',
    es: 'Película de jabón vista de frente',
    fr: 'Film de savon vu de face',
    hi: 'सामने से दिखती साबुन की फ़िल्म',
    id: 'Lapisan sabun dilihat dari depan',
    pt: 'Película de sabão vista de frente',
  },
  'caption.main': {
    ko: '두께가 바뀌는 자리마다 지워지는 파장이 옮겨 가고, 남은 빛이 그 자리의 색이 된다.',
    en: 'Wherever the thickness changes, the cancelled wavelength shifts, and the light that remains becomes the colour of that spot.',
    ja: '厚さが変わるところごとに打ち消される波長が移り、残った光がその場所の色になる。',
    zh: '厚度变化的地方，被抵消的波长随之移动，剩下的光就成了那一处的颜色。',
    ar: 'حيثما تغيّر السُّمك انزاح الطول الموجي الذي يُلغى، ويصبح الضوء المتبقي لونَ تلك البقعة.',
    es: 'Donde cambia el espesor, la longitud de onda que se anula se desplaza, y la luz que queda se vuelve el color de ese punto.',
    fr: 'Partout où l’épaisseur change, la longueur d’onde éteinte se déplace, et la lumière restante devient la couleur de cet endroit.',
    hi: 'जहाँ-जहाँ मोटाई बदलती है, वहाँ मिटने वाली तरंगदैर्घ्य खिसक जाती है, और बचा हुआ प्रकाश उस जगह का रंग बन जाता है।',
    id: 'Di mana pun ketebalannya berubah, panjang gelombang yang saling meniadakan bergeser, dan cahaya yang tersisa menjadi warna tempat itu.',
    pt: 'Onde a espessura muda, o comprimento de onda cancelado se desloca, e a luz que resta se torna a cor daquele ponto.',
  },
  'label.thickness': {
    ko: '막 두께',
    en: 'Film thickness',
    ja: '膜の厚さ',
    zh: '膜厚',
    ar: 'سُمك الغشاء',
    es: 'Espesor de la película',
    fr: 'Épaisseur du film',
    hi: 'फ़िल्म की मोटाई',
    id: 'Ketebalan lapisan',
    pt: 'Espessura da película',
  },
  'label.spectrum': {
    ko: '관찰점에서 되돌아오는 빛',
    en: 'Light returning from the probe point',
    ja: '観察点から戻ってくる光',
    zh: '从观察点返回的光',
    ar: 'الضوء العائد من نقطة الرصد',
    es: 'Luz que vuelve del punto de observación',
    fr: 'Lumière renvoyée par le point d’observation',
    hi: 'प्रेक्षण बिंदु से लौटता प्रकाश',
    id: 'Cahaya yang kembali dari titik pengamatan',
    pt: 'Luz que volta do ponto de observação',
  },
  'label.wavelength': {
    ko: '파장 (nm)',
    en: 'Wavelength (nm)',
    ja: '波長 (nm)',
    zh: '波长 (nm)',
    ar: 'الطول الموجي (nm)',
    es: 'Longitud de onda (nm)',
    fr: 'Longueur d’onde (nm)',
    hi: 'तरंगदैर्घ्य (nm)',
    id: 'Panjang gelombang (nm)',
    pt: 'Comprimento de onda (nm)',
  },
  'label.seenColor': {
    ko: '보이는 색',
    en: 'Colour seen',
    ja: '見える色',
    zh: '看到的颜色',
    ar: 'اللون المرئي',
    es: 'Color que se ve',
    fr: 'Couleur perçue',
    hi: 'दिखने वाला रंग',
    id: 'Warna yang terlihat',
    pt: 'Cor vista',
  },
  'label.tick': {
    ko: '{v}',
    en: '{v}',
    ja: '{v}',
    zh: '{v}',
    ar: '{v}',
    es: '{v}',
    fr: '{v}',
    hi: '{v}',
    id: '{v}',
    pt: '{v}',
  },
  'label.nm': {
    ko: '{v} nm',
    en: '{v} nm',
    ja: '{v} nm',
    zh: '{v} nm',
    ar: '{v} nm',
    es: '{v} nm',
    fr: '{v} nm',
    hi: '{v} nm',
    id: '{v} nm',
    pt: '{v} nm',
  },
} satisfies Record<string, LocalizedText>);

export type ThinFilmInterferenceMessageKey = keyof typeof thinFilmInterferenceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: ThinFilmInterferenceMessageKey): LocalizedText => thinFilmInterferenceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThinFilmInterferenceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thinFilmInterferenceSchema: BundleSchema = {
  id: THIN_FILM_INTERFERENCE_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 굴절률 · 입사각 조절을 두지 않는다 — 원본 「hidden」. 비스듬히 보는 색은 다른 질문이다.
  parameters: [],
  stages: [{ id: 'film', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'face', label: text('label.view'), default: true }],

  /** 원본은 860 × 290 캔버스 + 아래 캡션 한 줄이었다. */
  canvas: { height: 340, minHeight: 300 },

  /** 막(`scalarField`) 위에 틀 · 관찰점이 와야 한다. scene 에 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  /** 원본 `OFFSET = 2` — 도착한 순간 막은 이미 2 초째 흘러내리고 있다. */
  startAt: OFFSET,

  /**
   * 한 주기 = 13 초. 첫 1 초는 새 막이 위에서부터 이전 막을 덮는 단계, 나머지는 흘러내림.
   * scene 은 `at('wipe')` 로 경계 높이를, `phase` 로 경계선을 보일지 정한다.
   * 캡션은 한 줄 고정이라 단계가 말하지 않고 슬롯의 `text` 가 말한다.
   */
  timeline: {
    phases: [
      { id: 'wipe', duration: WIPE },
      { id: 'drain', duration: PERIOD - WIPE },
    ],
  },

  /** 원본 캡션은 캔버스 아래 왼쪽 정렬 한 줄, 고정. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 0] },
    align: 'left',
    fontSize: CAPTION_FONT,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
    text: key('caption.main'),
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 원본에 없다. */

  messages: thinFilmInterferenceMessages,
};
