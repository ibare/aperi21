// ========================================================================
// diffraction-grating — 선언
// ========================================================================
// 질문: 틈을 여러 개 나란히 두면 스크린의 밝은 줄이 어떻게 달라지는가.
//
// 틈 간격은 그대로 두고 틈 수만 2 → 5 → 20 으로 늘린다. 밝은 줄(주극대)의 자리는 간격과
// 파장만으로 정해지므로 움직이지 않는다. 대신 줄이 가늘고 날카로워지고, 줄 사이는 작은 봉우리
// 몇 개만 남긴 채 어두워진다. 마지막에 흰빛을 넣으면 가운데 줄은 희고 옆 줄은 파장마다 다른
// 자리로 갈라진다.
//
// 가림벽에는 가장 많은 틈 수만큼 자리를 두고 가운데부터 틈을 연다. 틈이 열리는 정도를 그 틈의
// 진폭으로 삼아 곡선이 끊기지 않고 변한다. 엔진 위에서 바로 만든 조각이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diffraction-grating` 와 문자 그대로 일치한다 (C4). */
export const DIFFRACTION_GRATING_ID = 'diffraction-grating';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 한 색 빛의 파장(nm). 초록. */
export const WAVELENGTH_NM = 532;
/** 이웃한 틈 사이 간격(nm). 1차 줄이 sin θ = λ/d ≈ 0.30 에 선다. */
export const SPACING_NM = 1800;
/** 틈 수 — 처음 · 가운데 · 마지막. 간격은 셋 모두 같다. */
export const SLITS_FEW = 2;
export const SLITS_MID = 5;
export const SLITS_MANY = 20;
/**
 * 격자에서 스크린까지(그림 단위). 실제 스크린은 격자 폭의 수만 배 멀다 — 그대로 그리면 스크린이
 * 화면 밖이다. 곡선은 먼 거리 근사(방향마다의 세기)로 셈하고 이 거리에 tan θ 로 펼친다 (NOTES (b)).
 */
export const SCREEN_DISTANCE = 8;
/** 들어오는 파면이 움직이는 빠르기(그림 단위/초). 보이기 위한 값이다. */
export const WAVE_SPEED = 0.9;

// ------------------------------------------------------------------------
// 배치 — 그림 단위. 격자 가운데가 원점, 빛은 왼쪽에서 오른쪽으로 간다.
// ------------------------------------------------------------------------

/** 가림벽 두께. */
export const BARRIER_T = 0.3;
/** 틈 자리가 차지하는 반높이 — 가장 많은 틈 수의 자리가 이 안에 고르게 선다. */
export const GRATING_HALF = 5.4;
/** 틈 하나의 열린 높이 — 그린 틈 간격에 대한 몫. */
export const SLIT_OPEN_FRAC = 0.45;
/** 가림벽 · 스크린의 위아래 끝(± 이 값). 2차 줄(약 5.9)까지 담는다. */
export const SCREEN_HALF = 6.6;
/** 스크린 띠의 두께. */
export const SCREEN_W = 0.8;
/** 스크린 띠와 세기 곡선 0 기준선 사이. */
export const CURVE_GAP = 0.6;
/** 세기 곡선의 최대 폭(세기 1). */
export const CURVE_W = 11;
/** 들어오는 파면이 차지하는 가로 범위와 세로 반폭, 그린 간격. 간격은 그림용이다(실제 λ 와 축척이 다르다). */
export const WAVE_REACH = 3.6;
export const WAVE_HALF = 6;
export const WAVE_GAP = 0.7;
/** 파면이 가림벽 앞에서 끊기는 거리. */
export const WAVE_STOP = 0.35;

/** 캡션 줄이 놓일 아래 띠. 캡션 자리가 프레이밍 여백으로 잡히지 않는다 (장부 G24). */
export const CAPTION_BAND = 2.2;

/** 고정 프레이밍 — 들어오는 파면부터 곡선 끝까지, 스크린 위아래 끝과 캡션 띠. */
export const SCENE_BOUNDS = {
  minX: -BARRIER_T / 2 - WAVE_REACH - 0.4,
  maxX: SCREEN_DISTANCE + SCREEN_W + CURVE_GAP + CURVE_W + 0.5,
  minY: -SCREEN_HALF - CAPTION_BAND,
  maxY: SCREEN_HALF + 0.3,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diffractionGratingMessages = Object.freeze({
  'label.title': {
    ko: '회절 격자',
    en: 'Diffraction grating',
    ja: '回折格子',
    zh: '衍射光栅',
    ar: 'محزوز الحيود',
    es: 'Red de difracción',
    fr: 'Réseau de diffraction',
    hi: 'विवर्तन ग्रेटिंग',
    id: 'Kisi difraksi',
    pt: 'Rede de difração',
  },
  'label.operation': {
    ko: '여러 슬릿이 만드는 날카로운 극대',
    en: 'Sharp maxima made by many slits',
    ja: '多数のスリットがつくる鋭い極大',
    zh: '多条狭缝形成的尖锐极大',
    ar: 'قمم حادة تصنعها شقوق كثيرة',
    es: 'Máximos nítidos creados por muchas rendijas',
    fr: 'Des maxima nets créés par de nombreuses fentes',
    hi: 'अनेक झिरियों से बनने वाले तीक्ष्ण उच्चिष्ठ',
    id: 'Maksimum tajam yang dibentuk banyak celah',
    pt: 'Máximos nítidos formados por muitas fendas',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'caption.few': {
    ko: '틈 {n1}개 — 밝은 줄이 굵고, 줄 사이로 서서히 어두워진다',
    en: '{n1} slits — the bright lines are broad and fade slowly into the dark between them',
    ja: 'スリット{n1}本 — 明るい線は太く、線と線の間の暗がりへゆるやかに暗くなる',
    zh: '{n1} 条狭缝——亮纹较宽，向亮纹之间的暗处缓缓变暗',
    ar: 'عدد الشقوق {n1} — الخطوط المضيئة عريضة وتخفت ببطء نحو العتمة بينها',
    es: '{n1} rendijas — las líneas brillantes son anchas y se apagan poco a poco hacia la oscuridad entre ellas',
    fr: '{n1} fentes — les raies brillantes sont larges et s’estompent lentement vers l’obscurité qui les sépare',
    hi: '{n1} झिरियाँ — चमकीली रेखाएँ चौड़ी हैं और उनके बीच के अँधेरे में धीरे-धीरे मंद पड़ती हैं',
    id: '{n1} celah — garis-garis terang lebar dan perlahan meredup ke gelap di antaranya',
    pt: '{n1} fendas — as linhas claras são largas e se apagam aos poucos no escuro entre elas',
  },
  'caption.openMid': {
    ko: '틈 간격은 그대로 두고 틈을 {n2}개로 늘린다',
    en: 'Keep the spacing and open more slits, up to {n2}',
    ja: 'スリットの間隔はそのままで、スリットを{n2}本まで増やす',
    zh: '保持缝距不变，把狭缝增加到 {n2} 条',
    ar: 'تبقى المسافة بين الشقوق كما هي، ويُفتح مزيد من الشقوق حتى {n2}',
    es: 'Se mantiene la separación y se abren más rendijas, hasta {n2}',
    fr: 'On garde l’écart et on ouvre davantage de fentes, jusqu’à {n2}',
    hi: 'अंतराल वही रखकर और झिरियाँ खोली जाती हैं, {n2} तक',
    id: 'Jarak antarcelah tetap, dan celah ditambah hingga {n2}',
    pt: 'O espaçamento se mantém e mais fendas se abrem, até {n2}',
  },
  'caption.mid': {
    ko: '밝은 줄은 같은 자리에 있고 점선보다 좁다 — 줄 사이에 작은 봉우리가 생겼다',
    en: 'The bright lines stay in place and are narrower than the dashed curve — small bumps appear between them',
    ja: '明るい線は同じ位置のまま、点線より細い — 線の間に小さな山が現れた',
    zh: '亮纹位置不变，比虚线更窄——亮纹之间出现了小峰',
    ar: 'تبقى الخطوط المضيئة في أماكنها وهي أضيق من المنحنى المتقطع — وتظهر بينها نتوءات صغيرة',
    es: 'Las líneas brillantes siguen en su sitio y son más estrechas que la curva discontinua — aparecen pequeños picos entre ellas',
    fr: 'Les raies brillantes restent en place et sont plus étroites que la courbe en pointillés — de petites bosses apparaissent entre elles',
    hi: 'चमकीली रेखाएँ अपनी जगह पर रहती हैं और बिंदुकित वक्र से पतली हैं — उनके बीच छोटे उभार दिखते हैं',
    id: 'Garis-garis terang tetap di tempatnya dan lebih sempit daripada kurva putus-putus — muncul tonjolan kecil di antaranya',
    pt: 'As linhas claras ficam no mesmo lugar e são mais estreitas que a curva tracejada — surgem pequenos picos entre elas',
  },
  'caption.openMany': {
    ko: '틈을 {n3}개로 늘린다',
    en: 'Open more slits, up to {n3}',
    ja: 'スリットを{n3}本まで増やす',
    zh: '把狭缝增加到 {n3} 条',
    ar: 'يُفتح مزيد من الشقوق حتى {n3}',
    es: 'Se abren más rendijas, hasta {n3}',
    fr: 'On ouvre davantage de fentes, jusqu’à {n3}',
    hi: 'और झिरियाँ खोली जाती हैं, {n3} तक',
    id: 'Celah ditambah hingga {n3}',
    pt: 'Mais fendas se abrem, até {n3}',
  },
  'caption.many': {
    ko: '밝은 줄은 여전히 같은 자리 — 가늘고 날카로워졌고, 그 사이는 거의 어둡다',
    en: 'Still in the same places — the bright lines are thin and sharp, and nearly dark in between',
    ja: '依然として同じ位置 — 明るい線は細く鋭くなり、その間はほとんど暗い',
    zh: '仍在原来的位置——亮纹变得又细又锐，其间几乎全暗',
    ar: 'لا تزال في الأماكن نفسها — الخطوط المضيئة رفيعة وحادة، وما بينها مظلم تقريبًا',
    es: 'Siguen en los mismos lugares — las líneas brillantes son finas y nítidas, y entre ellas casi todo está oscuro',
    fr: 'Toujours aux mêmes endroits — les raies brillantes sont fines et nettes, et l’espace entre elles est presque sombre',
    hi: 'अब भी उन्हीं जगहों पर — चमकीली रेखाएँ पतली और तीक्ष्ण हैं, और बीच में लगभग अँधेरा है',
    id: 'Masih di tempat yang sama — garis-garis terang tipis dan tajam, dan di antaranya hampir gelap',
    pt: 'Ainda nos mesmos lugares — as linhas claras são finas e nítidas, e entre elas está quase escuro',
  },
  'caption.whiteIn': {
    ko: '흰빛을 비춘다',
    en: 'Shine white light',
    ja: '白色光を当てる',
    zh: '照射白光',
    ar: 'يُسلَّط ضوء أبيض',
    es: 'Se ilumina con luz blanca',
    fr: 'On éclaire en lumière blanche',
    hi: 'श्वेत प्रकाश डाला जाता है',
    id: 'Sinari dengan cahaya putih',
    pt: 'Incide luz branca',
  },
  'caption.white': {
    ko: '가운데 줄은 희고, 옆 줄은 보라에서 빨강까지 갈라져 늘어선다',
    en: 'The middle line is white; the side lines split into a row from violet to red',
    ja: '中央の線は白く、両側の線は紫から赤へと分かれて並ぶ',
    zh: '中央亮纹是白色的；两侧亮纹从紫到红分开排列',
    ar: 'الخط الأوسط أبيض؛ وتنقسم الخطوط الجانبية إلى صف من البنفسجي إلى الأحمر',
    es: 'La línea central es blanca; las laterales se separan en una fila del violeta al rojo',
    fr: 'La raie centrale est blanche ; les raies latérales s’étalent en une rangée du violet au rouge',
    hi: 'बीच की रेखा सफ़ेद है; बगल की रेखाएँ बैंगनी से लाल तक एक पंक्ति में बँट जाती हैं',
    id: 'Garis tengah berwarna putih; garis-garis samping terpecah menjadi deretan dari ungu hingga merah',
    pt: 'A linha central é branca; as laterais se separam em uma fileira do violeta ao vermelho',
  },
  'caption.reset': {
    ko: '한 색 빛, 틈 {n1}개로 되돌린다',
    en: 'Back to one colour and {n1} slits',
    ja: '単色の光、スリット{n1}本に戻す',
    zh: '回到单色光和 {n1} 条狭缝',
    ar: 'العودة إلى ضوء بلون واحد وعدد شقوق {n1}',
    es: 'De vuelta a un solo color y {n1} rendijas',
    fr: 'Retour à une seule couleur et {n1} fentes',
    hi: 'वापस एक रंग और {n1} झिरियों पर',
    id: 'Kembali ke satu warna dan {n1} celah',
    pt: 'De volta a uma só cor e {n1} fendas',
  },
} satisfies Record<string, LocalizedText>);

export type DiffractionGratingMessageKey = keyof typeof diffractionGratingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiffractionGratingMessageKey): LocalizedText => diffractionGratingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiffractionGratingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diffractionGratingSchema: BundleSchema = {
  id: DIFFRACTION_GRATING_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 틈 수를 늘리는 순서와 흰빛 단계가 저절로 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        wavelengthNm: WAVELENGTH_NM,
        spacingNm: SPACING_NM,
        slitsFew: SLITS_FEW,
        slitsMid: SLITS_MID,
        slitsMany: SLITS_MANY,
        screenDistance: SCREEN_DISTANCE,
        waveSpeed: WAVE_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 그림(약 25 × 15.4). */
  canvas: { height: 440, minHeight: 380 },

  /** 빛 없음 바탕 위에 파면, 그 위에 가림벽 — 쓴 순서대로 겹친다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 틈 적게 → 늘리기 → 가운데 → 늘리기 → 많이 → 흰빛 → 되돌리기.
   * 늘리는 단계는 짧게, 보는 단계는 길게 둔다.
   */
  timeline: {
    phases: [
      { id: 'few', duration: 3.5, caption: key('caption.few') },
      { id: 'open-mid', duration: 2.0, ease: 'smooth', caption: key('caption.openMid') },
      { id: 'mid', duration: 4.2, caption: key('caption.mid') },
      { id: 'open-many', duration: 2.5, ease: 'smooth', caption: key('caption.openMany') },
      { id: 'many', duration: 4.5, caption: key('caption.many') },
      { id: 'white-in', duration: 1.5, ease: 'smooth', caption: key('caption.whiteIn') },
      { id: 'white', duration: 4.5, caption: key('caption.white') },
      { id: 'reset', duration: 2.0, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 빛이 격자로 들어오고 스크린에 줄이 서 있다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 보이는 것만 말한다 — 격자 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [10, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n1: 'few', n2: 'mid', n3: 'many' },
  },

  messages: diffractionGratingMessages,
};
