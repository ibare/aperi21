// ========================================================================
// blackbody-radiation — 선언
// ========================================================================
// 질문: 뜨거운 물체가 내는 빛을 고전 물리로 계산하면 무엇이 틀리는가.
//
// 한 그래프에 두 곡선을 겹친다. 같은 5000 K 흑체를 두고 —
//   · 고전 이론(레일리-진스, ∝ T/λ⁴) 이 예측하는 복사 세기
//   · 관측되는 복사 세기(플랑크 곡선)
// 긴 파장에서 짧은 파장 쪽으로 훑어 가면, 처음에는 둘이 가깝게 나란히 가다가 갈라진다.
// 관측은 봉우리를 지나 0 으로 내려오는데, 고전 이론은 가시광에 닿기도 전에 그래프 천장을
// 뚫고 나가 자외선 쪽으로 끝없이 치솟는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 별의 색(`star-color-temperature`)과 봉우리 이동(`wien-displacement-law`)은 이웃의 몫이라
// 두지 않는다 — 온도는 하나로 고정이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:blackbody-radiation` 와 문자 그대로 일치한다 (C4). */
export const BLACKBODY_RADIATION_ID = 'blackbody-radiation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 흑체의 온도(K). 봉우리(약 580 nm)가 가시광 띠 안에 든다. */
export const TEMPERATURE_K = 5000;
/** 훑기가 시작하는 파장(nm) — 그래프 오른쪽 끝. 두 곡선이 가깝게 나란한 긴 파장 쪽이다. */
export const NM_START = 3000;
/** 「나란히 간다」 가 끝나는 파장(nm). 여기서부터 둘이 눈에 띄게 갈라진다. */
export const NM_AGREE = 2000;
/** 「갈라진다」 가 끝나는 파장(nm) — 가시광 띠의 긴 쪽 끝. 고전 이론은 이미 천장 밖이다. */
export const NM_PART = 780;
/**
 * 관측 곡선 이름표가 나오는 파장(nm) — 가시광 짧은 쪽. 훑는 자리가 이것을 지나면(`uvDeep` 단계)
 * 이름표가 선다. 이름표 자리(`OBSERVED_LABEL_NM`)보다 짧아야 어긋남 점선이 이름표를 가로지르지 않는다.
 */
export const NM_LABEL = 700;
/** 훑기가 멈추는 파장(nm) — 자외선 깊이. 관측 곡선은 거의 0 이다. */
export const NM_END = 100;
/**
 * 그래프 천장의 높이 — 관측 곡선 봉우리의 몇 배인가. 고전 이론 곡선은 이 높이에서 그래프를
 * 뚫고 나간다. 봉우리에서 고전 이론은 관측의 약 29 배라 천장을 아무리 높여도 곡선이 머물지
 * 못한다 — 관측 곡선이 읽힐 만큼만 준다.
 */
export const CEILING_RATIO = 2.2;
/**
 * 천장 위 화살표가 가득 자라는 자릿수. 천장을 넘은 뒤 고전 이론의 세기가 천장의 10^이 값 배가
 * 되면 화살표가 가장 길다. 100 nm 에서 약 10^4.2 배다. 화살표 길이는 로그라 눈금을 달지 않는다.
 */
export const ARROW_DECADES = 4.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 그래프 원점(0 nm, 세기 0)이 월드 원점이다.
// ------------------------------------------------------------------------

/** 파장 축이 끝나는 파장(nm)과 그 축의 길이(월드). */
export const NM_AXIS = 3000;
export const GRAPH_W = 14.5;
/** 관측 곡선 봉우리의 높이(월드). 천장은 이것의 `CEILING_RATIO` 배다. */
export const PEAK_H = 1.5;
/** 천장 위 화살표가 가장 길 때의 길이(월드). */
export const ARROW_MAX = 1.25;
/** 축 아래 무지개 띠의 두께(월드). */
export const STRIP_H = 0.18;
/** 눈금 · 띠 이름 줄의 높이(월드). */
export const TICK_LABEL_Y = -0.5;
/** 파장 눈금(nm)과 그 이름표 키. */
export const WAVELENGTH_TICKS: readonly { nm: number; key: BlackbodyRadiationMessageKey }[] = [
  { nm: 1000, key: 'tick.1000' },
  { nm: 2000, key: 'tick.2000' },
];
/** 띠 이름을 놓는 파장(nm). 적외선은 띠가 넓어 눈금 글자 사이에 둔다. */
export const BAND_LABEL_NM = { uv: 190, visible: 580, ir: 1500 } as const;
/**
 * 관측 곡선 이름표를 붙이는 파장(nm) — 봉우리 오른쪽, 고전 곡선이 이미 천장 밖인 자리 위.
 * 나오는 때는 시간표가 정한다(`uvDeep` 단계, 정박 파장 `nmLabel`).
 */
export const OBSERVED_LABEL_NM = 1000;

/**
 * 프레이밍은 주장의 일부다. 가로는 세로축 이름부터 3000 nm 너머까지, 세로는 캡션 줄 · 눈금
 * 글자부터 천장 위 화살표 · ∞ 까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.1, maxX: 15.2, minY: -1.35, maxY: 5.25 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 긴 파장 쪽을 훑는 동안(초) — 둘이 나란하다. */
export const AGREE = 3.5;
/** 적외선 가운데를 훑는 동안(초) — 둘이 갈라지고 고전 이론이 천장을 뚫는다. */
export const PART = 4;
/** 가시광 긴 쪽(`nmPart`)에서 관측 이름표 파장(`nmLabel`)까지 훑는 동안(초). 관측은 봉우리를 향해 오르고 고전 이론은 천장 밖에서 치솟는다. */
export const UV = 1;
/** `nmLabel` 에서 자외선 끝까지 훑는 동안(초) — 관측은 봉우리를 지나 0 으로 내려온다. 관측 이름표가 이 단계에 선다. */
export const UV_DEEP = 3.5;
/** 다 그린 그림에 머무는 동안(초). */
export const HOLD = 4;
/** 지우고 처음으로 돌아가는 동안(초). */
export const CLEAR = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const blackbodyRadiationMessages = Object.freeze({
  'label.title': {
    ko: '흑체 복사',
    en: 'Blackbody radiation',
    ja: '黒体放射',
    zh: '黑体辐射',
    ar: 'إشعاع الجسم الأسود',
    es: 'Radiación de cuerpo negro',
    fr: 'Rayonnement du corps noir',
    hi: 'कृष्णिका विकिरण',
    id: 'Radiasi benda hitam',
    pt: 'Radiação de corpo negro',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '고전 이론의 파탄',
    en: 'Where classical theory breaks down',
    ja: '古典論が破綻するところ',
    zh: '经典理论失效之处',
    ar: 'حيث تنهار النظرية الكلاسيكية',
    es: 'Donde la teoría clásica falla',
    fr: 'Là où la théorie classique s’effondre',
    hi: 'जहाँ चिरसम्मत सिद्धांत विफल होता है',
    id: 'Tempat teori klasik gagal',
    pt: 'Onde a teoria clássica falha',
  },
  'label.stage': {
    ko: '5000 K 흑체',
    en: 'A 5000 K blackbody',
    ja: '5000 K の黒体',
    zh: '5000 K 的黑体',
    ar: 'جسم أسود عند 5000 K',
    es: 'Un cuerpo negro a 5000 K',
    fr: 'Un corps noir à 5000 K',
    hi: '5000 K की कृष्णिका',
    id: 'Benda hitam 5000 K',
    pt: 'Um corpo negro a 5000 K',
  },
  'label.view': {
    ko: '복사 곡선',
    en: 'Radiation curves',
    ja: '放射曲線',
    zh: '辐射曲线',
    ar: 'منحنيات الإشعاع',
    es: 'Curvas de radiación',
    fr: 'Courbes de rayonnement',
    hi: 'विकिरण वक्र',
    id: 'Kurva radiasi',
    pt: 'Curvas de radiação',
  },
  'label.classical': {
    ko: '고전 이론 (레일리-진스)',
    en: 'classical theory (Rayleigh–Jeans)',
    ja: '古典論（レイリー・ジーンズ）',
    zh: '经典理论（瑞利-金斯）',
    ar: 'النظرية الكلاسيكية (رايلي–جينز)',
    es: 'teoría clásica (Rayleigh–Jeans)',
    fr: 'théorie classique (Rayleigh–Jeans)',
    hi: 'चिरसम्मत सिद्धांत (रैले–जीन्स)',
    id: 'teori klasik (Rayleigh–Jeans)',
    pt: 'teoria clássica (Rayleigh–Jeans)',
  },
  'label.observed': {
    ko: '관측 (플랑크)',
    en: 'observed (Planck)',
    ja: '観測（プランク）',
    zh: '观测（普朗克）',
    ar: 'المرصود (بلانك)',
    es: 'observado (Planck)',
    fr: 'observé (Planck)',
    hi: 'प्रेक्षित (प्लांक)',
    id: 'teramati (Planck)',
    pt: 'observado (Planck)',
  },
  'label.intensity': {
    ko: '세기',
    en: 'intensity',
    ja: '強さ',
    zh: '强度',
    ar: 'الشدة',
    es: 'intensidad',
    fr: 'intensité',
    hi: 'तीव्रता',
    id: 'intensitas',
    pt: 'intensidade',
  },
  'label.wavelength': {
    ko: '파장',
    en: 'wavelength',
    ja: '波長',
    zh: '波长',
    ar: 'الطول الموجي',
    es: 'longitud de onda',
    fr: 'longueur d’onde',
    hi: 'तरंगदैर्घ्य',
    id: 'panjang gelombang',
    pt: 'comprimento de onda',
  },
  /** 띠 이름. 분야 원어 약자가 아니라 언어마다 다르다 — 문안. */
  'label.uv': {
    ko: '자외선',
    en: 'UV',
    ja: '紫外線',
    zh: '紫外',
    ar: 'فوق البنفسجية',
    es: 'UV',
    fr: 'UV',
    hi: 'पराबैंगनी',
    id: 'UV',
    pt: 'UV',
  },
  'label.visible': {
    ko: '가시광',
    en: 'visible',
    ja: '可視光',
    zh: '可见光',
    ar: 'المرئي',
    es: 'visible',
    fr: 'visible',
    hi: 'दृश्य',
    id: 'tampak',
    pt: 'visível',
  },
  'label.ir': {
    ko: '적외선',
    en: 'IR',
    ja: '赤外線',
    zh: '红外',
    ar: 'تحت الحمراء',
    es: 'IR',
    fr: 'IR',
    hi: 'अवरक्त',
    id: 'inframerah',
    pt: 'IV',
  },
  /** 끝없이 — 기호다 (C1 판정 3). */
  'label.infinity': {
    ko: '∞',
    en: '∞',
    ja: '∞',
    zh: '∞',
    ar: '∞',
    es: '∞',
    fr: '∞',
    hi: '∞',
    id: '∞',
    pt: '∞',
  },
  /** 온도 — 값과 단위 기호. 단위는 표식이다 (C1 판정 3). */
  'label.temperature': {
    ko: '{t} K',
    en: '{t} K',
    ja: '{t} K',
    zh: '{t} K',
    ar: '{t} K',
    es: '{t} K',
    fr: '{t} K',
    hi: '{t} K',
    id: '{t} K',
    pt: '{t} K',
  },
  /** 파장 눈금. 수와 단위 기호뿐인 표식이다. */
  'tick.1000': {
    ko: '1000 nm',
    en: '1000 nm',
    ja: '1000 nm',
    zh: '1000 nm',
    ar: '1000 nm',
    es: '1000 nm',
    fr: '1000 nm',
    hi: '1000 nm',
    id: '1000 nm',
    pt: '1000 nm',
  },
  'tick.2000': {
    ko: '2000 nm',
    en: '2000 nm',
    ja: '2000 nm',
    zh: '2000 nm',
    ar: '2000 nm',
    es: '2000 nm',
    fr: '2000 nm',
    hi: '2000 nm',
    id: '2000 nm',
    pt: '2000 nm',
  },
  'caption.agree': {
    ko: '긴 파장 쪽에서는 고전 이론이 관측과 가깝게 나란히 간다',
    en: 'At long wavelengths the classical prediction runs close to what is observed',
    ja: '長い波長の側では、古典論の予測は観測に近く並んで進む',
    zh: '在长波一侧，经典理论的预测与观测紧紧并行',
    ar: 'عند الأطوال الموجية الطويلة يسير تنبؤ النظرية الكلاسيكية قريبًا مما يُرصد',
    es: 'En las longitudes de onda largas, la predicción clásica va muy cerca de lo observado',
    fr: 'Aux grandes longueurs d’onde, la prédiction classique suit de près ce qu’on observe',
    hi: 'लंबी तरंगदैर्घ्य पर चिरसम्मत पूर्वानुमान प्रेक्षित मान के पास-पास चलता है',
    id: 'Pada panjang gelombang panjang, prediksi klasik berjalan dekat dengan yang teramati',
    pt: 'Nos comprimentos de onda longos, a previsão clássica acompanha de perto o que se observa',
  },
  'caption.part': {
    ko: '파장이 짧아지자 둘이 갈라진다 — 고전 이론만 가파르게 올라 그래프 천장을 뚫고 나간다',
    en: 'As the wavelength shortens the two split — only the classical curve climbs steeply, breaking through the top of the graph',
    ja: '波長が短くなると二つは分かれる — 古典論の曲線だけが急に上り、グラフの上端を突き抜ける',
    zh: '随着波长变短，两者分开 — 只有经典曲线陡然上升，冲破图的顶端',
    ar: 'مع قِصَر الطول الموجي يفترق المنحنيان — وحده المنحنى الكلاسيكي يصعد بحدّة مخترقًا أعلى الرسم',
    es: 'Al acortarse la longitud de onda, las dos se separan — solo la curva clásica sube empinada y atraviesa el borde superior del gráfico',
    fr: 'Quand la longueur d’onde raccourcit, les deux se séparent — seule la courbe classique grimpe en flèche et crève le haut du graphique',
    hi: 'तरंगदैर्घ्य छोटी होने पर दोनों अलग हो जाते हैं — केवल चिरसम्मत वक्र तेज़ी से चढ़कर ग्राफ़ का ऊपरी सिरा पार कर जाता है',
    id: 'Saat panjang gelombang memendek keduanya berpisah — hanya kurva klasik yang naik curam, menembus batas atas grafik',
    pt: 'À medida que o comprimento de onda diminui, as duas se separam — só a curva clássica sobe íngreme e rompe o topo do gráfico',
  },
  'caption.uv': {
    ko: '관측된 복사는 봉우리를 지나 0 으로 내려오는데, 고전 이론은 자외선 쪽으로 갈수록 끝없이 치솟는다',
    en: 'The observed radiation passes its peak and falls to zero, while the classical curve soars without limit into the ultraviolet',
    ja: '観測された放射はピークを越えて 0 へ下がるのに、古典論の曲線は紫外線の側へ限りなく跳ね上がる',
    zh: '观测到的辐射越过峰值后降到零，而经典曲线朝紫外区无限飙升',
    ar: 'يتجاوز الإشعاع المرصود ذروته وينخفض إلى الصفر، بينما يرتفع المنحنى الكلاسيكي بلا حدّ نحو الأشعة فوق البنفسجية',
    es: 'La radiación observada pasa su pico y cae a cero, mientras la curva clásica se dispara sin límite hacia el ultravioleta',
    fr: 'Le rayonnement observé passe son pic et retombe à zéro, tandis que la courbe classique s’envole sans limite vers l’ultraviolet',
    hi: 'प्रेक्षित विकिरण अपने शिखर को पार कर शून्य तक गिरता है, जबकि चिरसम्मत वक्र पराबैंगनी की ओर असीम रूप से चढ़ता जाता है',
    id: 'Radiasi yang teramati melewati puncaknya dan turun ke nol, sedangkan kurva klasik melonjak tanpa batas ke arah ultraungu',
    pt: 'A radiação observada passa pelo pico e cai a zero, enquanto a curva clássica dispara sem limite rumo ao ultravioleta',
  },
  'caption.hold': {
    ko: '짧은 파장 끝에서 관측은 0 인데 고전 이론은 무한대다 — 두 곡선이 완전히 어긋났다',
    en: 'At the short-wavelength end the observed value is zero and the classical one is infinite — the curves have parted completely',
    ja: '短い波長の端では観測値は 0、古典論は無限大 — 二つの曲線は完全に食い違った',
    zh: '在短波一端，观测值为零，经典值却是无穷大 — 两条曲线彻底分道扬镳',
    ar: 'عند طرف الأطوال الموجية القصيرة تكون القيمة المرصودة صفرًا والقيمة الكلاسيكية لا نهائية — افترق المنحنيان تمامًا',
    es: 'En el extremo de longitudes de onda cortas, el valor observado es cero y el clásico es infinito — las curvas se han separado por completo',
    fr: 'À l’extrémité des courtes longueurs d’onde, la valeur observée est nulle et la valeur classique infinie — les courbes se sont complètement séparées',
    hi: 'छोटी तरंगदैर्घ्य वाले सिरे पर प्रेक्षित मान शून्य है और चिरसम्मत मान अनंत — दोनों वक्र पूरी तरह अलग हो चुके हैं',
    id: 'Di ujung panjang gelombang pendek, nilai teramati nol dan nilai klasik tak hingga — kedua kurva sudah berpisah sepenuhnya',
    pt: 'Na extremidade de comprimentos de onda curtos, o valor observado é zero e o clássico é infinito — as curvas se separaram por completo',
  },
} satisfies Record<string, LocalizedText>);

export type BlackbodyRadiationMessageKey = keyof typeof blackbodyRadiationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BlackbodyRadiationMessageKey): LocalizedText => blackbodyRadiationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BlackbodyRadiationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const blackbodyRadiationSchema: BundleSchema = {
  id: BLACKBODY_RADIATION_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 긴 파장에서 짧은 파장 쪽으로 두 곡선이 함께 그려진다.
  parameters: [],

  stages: [
    {
      id: 'blackbody-5000',
      label: text('label.stage'),
      constants: {
        temperature: TEMPERATURE_K,
        nmStart: NM_START,
        nmAgree: NM_AGREE,
        nmPart: NM_PART,
        nmLabel: NM_LABEL,
        nmEnd: NM_END,
        ceilingRatio: CEILING_RATIO,
        arrowDecades: ARROW_DECADES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'curves', label: text('label.view'), default: true }],

  /** 가로로 넓은 그래프다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침이 판정 장치다 — 무지개 띠 · 축 · 천장선이 곡선 **아래**, 곡선 머리점이 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 긴 파장에서 나란히 → 갈라짐 · 천장 뚫기 → 자외선에서 치솟음 · 0 으로 내려옴 →
   * 머묾 → 지움. 훑는 파장은 단계마다 정박 파장 사이를 곧게 옮겨 간다.
   */
  timeline: {
    phases: [
      { id: 'agree', duration: AGREE, caption: key('caption.agree') },
      { id: 'part', duration: PART, caption: key('caption.part') },
      { id: 'uv', duration: UV, caption: key('caption.uv') },
      { id: 'uvDeep', duration: UV_DEEP, caption: key('caption.uv') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 곡선이 긴 파장 쪽에서 나란히 그려지고 있다. */
  startAt: 1.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 레일리-진스 식 · 플랑크 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: blackbodyRadiationMessages,
};
