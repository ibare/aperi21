// ========================================================================
// resolving-power — 선언
// ========================================================================
// 질문: 두 점이 가까워지면 왜 어느 순간 하나로 뭉쳐 보이는가. 구멍을 키우면 왜 다시 갈리는가.
//
// 원형 구멍을 지난 점 하나의 빛은 스크린에 점이 아니라 가운데 밝은 원반과 첫 어두운 고리를 가진
// 무늬를 남긴다. 두 점의 무늬를 겹쳐 두고(세기의 합) 두 점을 다가가게 하면, 한쪽 봉우리가 다른
// 쪽의 첫 어두운 자리에 닿을 때 합 곡선의 가운데 골이 얕아지고, 그보다 안으로 들어오면 골이
// 사라져 하나로 뭉친다. 같은 간격에서 구멍 지름을 키우면 무늬가 좁아져 다시 둘로 갈린다.
//
// 각도 단위는 μrad 다 — 파장(nm) / 지름(mm) 이 곧 μrad 이다. 엔진 위에서 바로 만든 조각이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:resolving-power` 와 문자 그대로 일치한다 (C4). */
export const RESOLVING_POWER_ID = 'resolving-power';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 빛의 파장(nm). */
export const WAVELENGTH_NM = 550;
/** 처음 구멍 지름(mm). */
export const APERTURE_SMALL = 2;
/** 마지막 단계에서 키운 구멍 지름(mm). */
export const APERTURE_LARGE = 5;
/**
 * 두 점의 각 간격 목록 — **처음 구멍의 레일리 각(첫 어두운 자리까지의 각) 배수**로 둔다.
 * 레일리 단계가 파장 · 지름을 바꿔도 늘 첫 어두운 자리에 서게 하려는 단위다.
 */
export const SEP_FAR = 1.8;
export const SEP_RAYLEIGH = 1;
export const SEP_NEAR = 0.5;
/** 표시 배율 — 스크린 위 1 μrad 가 차지하는 월드 길이. */
export const IMAGE_SCALE = 0.012;
/** 표시 배율 — 구멍 그림에서 지름 1 mm 가 차지하는 월드 길이. */
export const APERTURE_SCALE = 0.6;
/** 표시 배율 — 세기 1 이 곡선에서 차지하는 높이(월드). */
export const CURVE_HEIGHT = 2.2;
/** 스크린 상의 노출 — 세기 합에 곱하는 빛의 양. 가장 뭉친 가운데가 가득 찬 빛을 넘지 않게 잡는다. */
export const EXPOSURE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 스크린 상과 곡선이 같은 가로축(각)을 나눠 쓴다.
// ------------------------------------------------------------------------

/** 스크린 상 사각형의 가로 반폭과 위 · 아래 끝. */
export const IMG_HALF_W = 8;
export const IMG_BOTTOM = 0.6;
export const IMG_TOP = 6.6;
/** 곡선의 0 기준선 높이. */
export const PROFILE_BASE = -3.8;
/** 구멍 그림의 가운데. */
export const APERTURE_X = -11.5;
export const APERTURE_Y = (IMG_BOTTOM + IMG_TOP) / 2;

/** 캡션 줄이 놓일 아래 띠(월드). 캡션 자리가 프레이밍 여백으로 잡히지 않는다 (장부 G24). */
export const CAPTION_BAND = 2.0;

/** 고정 프레이밍 — 구멍 그림부터 스크린 상 오른쪽 끝까지, 점 표식 위부터 눈금 아래 캡션 띠까지. */
export const SCENE_BOUNDS = {
  minX: APERTURE_X - 2,
  maxX: IMG_HALF_W + 0.5,
  minY: PROFILE_BASE - 0.5 - CAPTION_BAND,
  maxY: IMG_TOP + 0.8,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const resolvingPowerMessages = Object.freeze({
  'label.title': {
    ko: '분해능',
    en: 'Resolving power',
    ja: '分解能',
    zh: '分辨本领',
    ar: 'قدرة التحليل',
    es: 'Poder de resolución',
    fr: 'Pouvoir de résolution',
    hi: 'विभेदन क्षमता',
    id: 'Daya urai',
    pt: 'Poder de resolução',
  },
  'label.operation': {
    ko: '두 점을 가르는 한계',
    en: 'The limit of telling two points apart',
    ja: '2点を見分ける限界',
    zh: '分辨两个点的极限',
    ar: 'حدّ التمييز بين نقطتين',
    es: 'El límite para distinguir dos puntos',
    fr: 'La limite pour distinguer deux points',
    hi: 'दो बिंदुओं को अलग पहचानने की सीमा',
    id: 'Batas untuk membedakan dua titik',
    pt: 'O limite para distinguir dois pontos',
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
  /** 도식 표식 — 구멍 지름 기호. 번역하지 않는다 (C1 판정 3). */
  'mark.diameter': {
    ko: 'D',
    en: 'D',
    ja: 'D',
    zh: 'D',
    ar: 'D',
    es: 'D',
    fr: 'D',
    hi: 'D',
    id: 'D',
    pt: 'D',
  },
  'caption.far': {
    ko: '두 점의 무늬 사이에 어두운 골이 깊다 — 두 점으로 보인다',
    en: 'A deep dark dip lies between the two patterns — two points are seen',
    ja: '2つの模様の間に深く暗い谷がある — 2点に見える',
    zh: '两个图样之间有一道深深的暗谷 — 看得出是两个点',
    ar: 'بين النمطين انخفاض مظلم عميق — تُرى نقطتان',
    es: 'Entre los dos patrones hay un valle oscuro y profundo — se ven dos puntos',
    fr: 'Un creux sombre et profond sépare les deux figures — on voit deux points',
    hi: 'दोनों पैटर्न के बीच एक गहरी अँधेरी घाटी है — दो बिंदु दिखते हैं',
    id: 'Ada lembah gelap yang dalam di antara kedua pola — terlihat dua titik',
    pt: 'Há um vale escuro e profundo entre os dois padrões — veem-se dois pontos',
  },
  'caption.approach': {
    ko: '두 점이 가까워진다',
    en: 'The two points move closer',
    ja: '2点が近づく',
    zh: '两个点靠近',
    ar: 'تقترب النقطتان',
    es: 'Los dos puntos se acercan',
    fr: 'Les deux points se rapprochent',
    hi: 'दोनों बिंदु पास आते हैं',
    id: 'Kedua titik saling mendekat',
    pt: 'Os dois pontos se aproximam',
  },
  'caption.rayleigh': {
    ko: '한쪽 봉우리가 다른 쪽의 첫 어두운 자리에 닿았다 — 골이 얕아졌지만 아직 둘이다',
    en: "Each peak now sits on the other's first dark spot — the dip is shallow, but there are still two",
    ja: 'それぞれの山が相手の最初の暗い所に重なった — 谷は浅くなったが、まだ2つだ',
    zh: '每个峰都落在另一个的第一暗处上 — 谷变浅了，但仍是两个',
    ar: 'تقع كل قمة الآن على أول بقعة مظلمة للأخرى — صار الانخفاض ضحلًا، لكنهما ما زالتا اثنتين',
    es: 'Cada pico cae ahora sobre la primera zona oscura del otro — el valle es poco profundo, pero todavía son dos',
    fr: 'Chaque pic tombe maintenant sur la première zone sombre de l’autre — le creux est faible, mais il y en a encore deux',
    hi: 'अब हर शिखर दूसरे के पहले अँधेरे स्थान पर है — घाटी उथली हो गई, पर अभी भी दो हैं',
    id: 'Kini tiap puncak berada di titik gelap pertama milik yang lain — lembahnya dangkal, tetapi masih dua',
    pt: 'Agora cada pico está sobre a primeira região escura do outro — o vale é raso, mas ainda são dois',
  },
  'caption.approachMore': {
    ko: '두 점이 더 가까워진다',
    en: 'The two points move closer still',
    ja: '2点がさらに近づく',
    zh: '两个点靠得更近',
    ar: 'تقترب النقطتان أكثر',
    es: 'Los dos puntos se acercan aún más',
    fr: 'Les deux points se rapprochent encore',
    hi: 'दोनों बिंदु और पास आते हैं',
    id: 'Kedua titik makin mendekat',
    pt: 'Os dois pontos se aproximam ainda mais',
  },
  'caption.merged': {
    ko: '봉우리가 첫 어두운 자리보다 안으로 들어오자 골이 사라졌다 — 하나로 뭉쳐 보인다',
    en: "With each peak inside the other's first dark spot, the dip is gone — they blur into one",
    ja: 'それぞれの山が相手の最初の暗い所より内側に入ると、谷が消えた — 1つにぼやけて見える',
    zh: '每个峰都进入另一个的第一暗处以内，谷消失了 — 模糊成一个',
    ar: 'حين تدخل كل قمة داخل أول بقعة مظلمة للأخرى يختفي الانخفاض — فتندمجان في واحدة',
    es: 'Con cada pico dentro de la primera zona oscura del otro, el valle desaparece — se funden en uno',
    fr: 'Chaque pic étant à l’intérieur de la première zone sombre de l’autre, le creux disparaît — ils se fondent en un seul',
    hi: 'हर शिखर के दूसरे के पहले अँधेरे स्थान के भीतर आते ही घाटी मिट जाती है — दोनों धुँधलाकर एक हो जाते हैं',
    id: 'Dengan tiap puncak di dalam titik gelap pertama milik yang lain, lembahnya hilang — keduanya melebur menjadi satu',
    pt: 'Com cada pico dentro da primeira região escura do outro, o vale some — eles se fundem em um só',
  },
  'caption.widen': {
    ko: '간격은 그대로 두고 구멍 지름을 {dSmall} mm 에서 {dLarge} mm 로 키운다',
    en: 'Keep the spacing and widen the aperture from {dSmall} mm to {dLarge} mm',
    ja: '間隔はそのままで、開口の直径を{dSmall} mmから{dLarge} mmに広げる',
    zh: '保持间距不变，把孔径从 {dSmall} mm 扩大到 {dLarge} mm',
    ar: 'مع إبقاء المسافة كما هي، تُوسَّع الفتحة من {dSmall} mm إلى {dLarge} mm',
    es: 'Con la misma separación, la apertura se ensancha de {dSmall} mm a {dLarge} mm',
    fr: 'À écart constant, l’ouverture passe de {dSmall} mm à {dLarge} mm',
    hi: 'दूरी वही रखकर द्वारक को {dSmall} mm से {dLarge} mm तक चौड़ा किया जाता है',
    id: 'Jaraknya tetap, apertur diperlebar dari {dSmall} mm menjadi {dLarge} mm',
    pt: 'Mantendo o espaçamento, a abertura aumenta de {dSmall} mm para {dLarge} mm',
  },
  'caption.split': {
    ko: '무늬가 좁아져 봉우리가 다시 첫 어두운 자리 바깥에 섰다 — 골이 생겨 둘로 갈린다',
    en: "The patterns narrow and each peak stands outside the other's first dark spot again — a dip opens and they split in two",
    ja: '模様が細くなり、それぞれの山が再び相手の最初の暗い所の外に出た — 谷ができて2つに分かれる',
    zh: '图样变窄，每个峰又落到另一个的第一暗处之外 — 谷出现，分成两个',
    ar: 'يضيق النمطان وتعود كل قمة خارج أول بقعة مظلمة للأخرى — ينفتح انخفاض فتنفصلان إلى اثنتين',
    es: 'Los patrones se estrechan y cada pico vuelve a quedar fuera de la primera zona oscura del otro — se abre un valle y se separan en dos',
    fr: 'Les figures s’affinent et chaque pic se retrouve hors de la première zone sombre de l’autre — un creux se forme et ils se séparent en deux',
    hi: 'पैटर्न संकरे होते हैं और हर शिखर फिर दूसरे के पहले अँधेरे स्थान के बाहर आ जाता है — घाटी बनती है और वे दो में बँट जाते हैं',
    id: 'Pola menyempit dan tiap puncak kembali berada di luar titik gelap pertama milik yang lain — lembah terbuka dan keduanya terpisah menjadi dua',
    pt: 'Os padrões se estreitam e cada pico volta a ficar fora da primeira região escura do outro — abre-se um vale e eles se separam em dois',
  },
  'caption.reset': {
    ko: '구멍을 {dSmall} mm 로 되돌리고 두 점을 다시 벌린다',
    en: 'Return the aperture to {dSmall} mm and move the points apart again',
    ja: '開口を{dSmall} mmに戻し、2点を再び離す',
    zh: '把孔径恢复为 {dSmall} mm，再把两个点分开',
    ar: 'تُعاد الفتحة إلى {dSmall} mm وتُبعَد النقطتان من جديد',
    es: 'La apertura vuelve a {dSmall} mm y los puntos se separan de nuevo',
    fr: 'L’ouverture revient à {dSmall} mm et les points s’écartent de nouveau',
    hi: 'द्वारक को फिर {dSmall} mm पर लाकर बिंदुओं को दोबारा दूर किया जाता है',
    id: 'Apertur dikembalikan ke {dSmall} mm dan kedua titik dijauhkan lagi',
    pt: 'A abertura volta a {dSmall} mm e os pontos se afastam de novo',
  },
} satisfies Record<string, LocalizedText>);

export type ResolvingPowerMessageKey = keyof typeof resolvingPowerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ResolvingPowerMessageKey): LocalizedText => resolvingPowerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ResolvingPowerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const resolvingPowerSchema: BundleSchema = {
  id: RESOLVING_POWER_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 다가가기 → 레일리 기준 → 뭉침 → 구멍 키우기가 저절로 돈다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        wavelengthNm: WAVELENGTH_NM,
        apertureSmall: APERTURE_SMALL,
        apertureLarge: APERTURE_LARGE,
        sepFar: SEP_FAR,
        sepRayleigh: SEP_RAYLEIGH,
        sepNear: SEP_NEAR,
        imageScale: IMAGE_SCALE,
        apertureScale: APERTURE_SCALE,
        curveHeight: CURVE_HEIGHT,
        exposure: EXPOSURE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 그림(약 22 × 13.6). */
  canvas: { height: 440, minHeight: 380 },

  /** 곡선 위에 골 막대 · 눈금이, 구멍 빛 위에 둘레가 온다 — 쓴 순서대로 겹친다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 멀리 → 다가감 → 레일리 기준 → 더 다가감 → 뭉침 → 구멍 키우기 → 갈림 → 되돌리기.
   * 움직이는 단계는 짧게, 그 결과를 읽는 단계는 길게 둔다.
   */
  timeline: {
    phases: [
      { id: 'far', duration: 3.0, caption: key('caption.far') },
      { id: 'approach', duration: 2.4, ease: 'smooth', caption: key('caption.approach') },
      { id: 'rayleigh', duration: 3.8, caption: key('caption.rayleigh') },
      { id: 'approach-more', duration: 2.2, ease: 'smooth', caption: key('caption.approachMore') },
      { id: 'merged', duration: 3.6, caption: key('caption.merged') },
      { id: 'widen', duration: 2.6, ease: 'smooth', caption: key('caption.widen') },
      { id: 'split', duration: 3.8, caption: key('caption.split') },
      { id: 'reset', duration: 2.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 두 점의 무늬가 스크린에 서 있다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 보이는 것만 말한다 — 기준의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [10, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { dSmall: 'dSmall', dLarge: 'dLarge' },
  },

  messages: resolvingPowerMessages,
};
