// ========================================================================
// gravity-inside-earth — 선언
// ========================================================================
// 질문: 지구 속으로 파고들면 중력은 어떻게 되는가. 중심에 가까워지니 더 세지나?
//
// 지구를 관통하는 굴을 따라 작은 질량이 밖에서 중심으로 들어온다. 지구 단면의 중심이
// 곧 g–r 그래프의 원점이라, 질량 **바로 위** 곡선의 높이가 그 자리의 중력이다.
// 밖에서는 1/r² 로 자라다가 지표에서 가장 세고, 안으로 들어서면 바깥 껍질은 당기지
// 않고 안쪽 공만 당기는데 그 공이 줄어들어 중력이 **곧은 선을 따라** 줄다가 중심에서 0 이다.
//
// 밀도가 고르다고 둔다(실제 지구는 중심이 더 조밀하다 — NOTES).
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravity-inside-earth` 와 문자 그대로 일치한다 (C4). */
export const GRAVITY_INSIDE_EARTH_ID = 'gravity-inside-earth';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 지구 반지름이 1 인 길이다. 지구 중심이 월드 원점이자 그래프 원점이다.
// ------------------------------------------------------------------------

/** 지표 중력(m/s²). 그래프 꼭짓점 이름표에 선언값 그대로 뜬다. */
export const SURFACE_G = 9.8;
/** 지구 반지름(km). 그래프 가로축 꺾임 자리 이름표에 선언값 그대로 뜬다. */
export const EARTH_RADIUS_KM = 6370;
/** 지구 반지름(월드). */
export const EARTH_RADIUS = 1;
/** 그래프에서 지표 중력이 차지하는 높이(월드). */
export const GRAPH_HEIGHT = 1.1;
/** 지표에서 중력 화살표 길이(월드). 길이 ∝ g. */
export const ARROW_AT_SURFACE = 0.8;
/** 시험 질량이 출발하는 거리(지구 반지름의 배수). */
export const START_R = 2.4;
/** 그래프 가로축 끝(지구 반지름의 배수). */
export const AXIS_R = 2.65;
/** 시험 질량 반지름(월드). */
export const MASS_RADIUS = 0.06;

/** 원 · 곡선 표본 점 수. 그림의 매끄러움이다. */
export const CIRCLE_SAMPLES = 96;
export const CURVE_SAMPLES = 120;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 지구(±1) · 출발점(2.4) · 가로축 끝(2.65) · 그래프 꼭짓점(1.1)과
 * 세로축 이름표를 담고, 아래에 캡션 띠를 남긴다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 —
 * 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.15, maxX: 2.85, minY: -1.28, maxY: 1.33 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 시험 질량이 출발점에 나타나는 동안. */
export const APPEAR = 0.5;
/** 지표까지 다가오는 동안 — 중력이 1/r² 로 자란다. */
export const APPROACH = 3.2;
/** 지표에 머무는 동안 — 가장 센 자리. */
export const SURFACE = 1.2;
/** 굴을 따라 중심까지 내려가는 동안 — 중력이 곧게 준다. */
export const DESCEND = 4.8;
/** 중심에 머무는 동안 — 중력 0. */
export const CENTER = 2.2;
/** 다음 주기로 넘어가며 질량 · 그린 곡선이 사라지는 동안. */
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravityInsideEarthMessages = Object.freeze({
  'label.title': {
    ko: '지구 내부의 중력',
    en: 'Gravity inside the Earth',
    ja: '地球内部の重力',
    zh: '地球内部的重力',
    ar: 'الجاذبية داخل الأرض',
    es: 'Gravedad en el interior de la Tierra',
    fr: 'Gravité à l’intérieur de la Terre',
    hi: 'पृथ्वी के अंदर गुरुत्व',
    id: 'Gravitasi di dalam Bumi',
    pt: 'Gravidade dentro da Terra',
  },
  'label.operation': {
    ko: '깊이에 따라 줄어드는 중력',
    en: 'Gravity that weakens with depth',
    ja: '深さとともに弱まる重力',
    zh: '随深度减弱的重力',
    ar: 'جاذبية تضعف مع العمق',
    es: 'Gravedad que disminuye con la profundidad',
    fr: 'Une gravité qui faiblit avec la profondeur',
    hi: 'गहराई के साथ घटता गुरुत्व',
    id: 'Gravitasi yang melemah seiring kedalaman',
    pt: 'Gravidade que enfraquece com a profundidade',
  },
  'label.stage': {
    ko: '밀도가 고른 지구',
    en: 'Uniform-density Earth',
    ja: '密度が一様な地球',
    zh: '密度均匀的地球',
    ar: 'أرض منتظمة الكثافة',
    es: 'Tierra de densidad uniforme',
    fr: 'Terre de masse volumique uniforme',
    hi: 'एकसमान घनत्व वाली पृथ्वी',
    id: 'Bumi dengan massa jenis seragam',
    pt: 'Terra de densidade uniforme',
  },
  'label.view': {
    ko: '단면과 그래프',
    en: 'Cross-section and graph',
    ja: '断面とグラフ',
    zh: '截面与图像',
    ar: 'المقطع العرضي والتمثيل البياني',
    es: 'Sección transversal y gráfica',
    fr: 'Coupe et graphique',
    hi: 'अनुप्रस्थ काट और ग्राफ़',
    id: 'Penampang dan grafik',
    pt: 'Corte transversal e gráfico',
  },
  'label.axisR': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'label.axisG': {
    ko: 'g',
    en: 'g',
    ja: 'g',
    zh: 'g',
    ar: 'g',
    es: 'g',
    fr: 'g',
    hi: 'g',
    id: 'g',
    pt: 'g',
  },
  'label.surfaceG': {
    ko: '{g} m/s²',
    en: '{g} m/s²',
    ja: '{g} m/s²',
    zh: '{g} m/s²',
    ar: '{g} m/s²',
    es: '{g} m/s²',
    fr: '{g} m/s²',
    hi: '{g} m/s²',
    id: '{g} m/s²',
    pt: '{g} m/s²',
  },
  'label.radius': {
    ko: '{r} km',
    en: '{r} km',
    ja: '{r} km',
    zh: '{r} km',
    ar: '{r} km',
    es: '{r} km',
    fr: '{r} km',
    hi: '{r} km',
    id: '{r} km',
    pt: '{r} km',
  },
  'label.ball': {
    ko: '당기는 공',
    en: 'pulling ball',
    ja: '引く球',
    zh: '产生引力的球',
    ar: 'الكرة الجاذبة',
    es: 'esfera que atrae',
    fr: 'boule qui attire',
    hi: 'खींचने वाला गोला',
    id: 'bola yang menarik',
    pt: 'esfera que atrai',
  },
  'label.shell': {
    ko: '바깥 껍질: 합 0',
    en: 'outer shell: net 0',
    ja: '外側の殻: 合計 0',
    zh: '外层球壳：合力 0',
    ar: 'القشرة الخارجية: المحصلة 0',
    es: 'cáscara exterior: resultante 0',
    fr: 'coquille extérieure : résultante 0',
    hi: 'बाहरी कोश: कुल 0',
    id: 'kulit luar: resultan 0',
    pt: 'casca externa: resultante 0',
  },
  'label.zero': {
    ko: 'g = 0',
    en: 'g = 0',
    ja: 'g = 0',
    zh: 'g = 0',
    ar: 'g = 0',
    es: 'g = 0',
    fr: 'g = 0',
    hi: 'g = 0',
    id: 'g = 0',
    pt: 'g = 0',
  },
  'caption.outside': {
    ko: '지구 밖에서는 가까워질수록 지구 전체가 더 세게 당긴다',
    en: 'Outside, the whole Earth pulls harder as the mass closes in',
    ja: '地球の外では、質量が近づくほど地球全体がより強く引く',
    zh: '在地球外，质量越靠近，整个地球的引力就越强',
    ar: 'خارج الأرض، كلما اقتربت الكتلة جذبتها الأرض كلها بقوة أكبر',
    es: 'Fuera, la Tierra entera atrae con más fuerza a medida que la masa se acerca',
    fr: 'À l’extérieur, la Terre entière attire plus fort à mesure que la masse approche',
    hi: 'बाहर, द्रव्यमान जितना पास आता है, पूरी पृथ्वी उसे उतने ही ज़ोर से खींचती है',
    id: 'Di luar, seluruh Bumi menarik makin kuat saat massa makin dekat',
    pt: 'Do lado de fora, a Terra inteira puxa com mais força à medida que a massa se aproxima',
  },
  'caption.surface': {
    ko: '지표에서 가장 세다',
    en: 'The pull is strongest at the surface',
    ja: '引力は地表で最も強い',
    zh: '引力在地表最强',
    ar: 'الجذب أقوى ما يكون عند السطح',
    es: 'La atracción es máxima en la superficie',
    fr: 'L’attraction est la plus forte à la surface',
    hi: 'सतह पर खिंचाव सबसे अधिक होता है',
    id: 'Tarikan paling kuat di permukaan',
    pt: 'A atração é mais forte na superfície',
  },
  'caption.inside': {
    ko: '들어갈수록 바깥 껍질은 당기지 않고, 당기는 안쪽 공이 작아져 중력이 곧게 줄어든다',
    en: 'Going deeper, the outer shell stops pulling and the pulling ball shrinks — gravity falls in a straight line',
    ja: '深く進むと外側の殻は引かなくなり、引く球が小さくなる — 重力は直線的に減る',
    zh: '越往深处，外层球壳不再产生引力，产生引力的球变小 — 重力沿直线减小',
    ar: 'كلما تعمّقنا توقفت القشرة الخارجية عن الجذب وصغرت الكرة الجاذبة — فتتناقص الجاذبية على خط مستقيم',
    es: 'Al ir más hondo, la cáscara exterior deja de atraer y la esfera que atrae se encoge — la gravedad baja en línea recta',
    fr: 'En s’enfonçant, la coquille extérieure cesse d’attirer et la boule qui attire rétrécit — la gravité décroît en ligne droite',
    hi: 'जितना गहरे जाते हैं, बाहरी कोश खींचना बंद कर देता है और खींचने वाला गोला छोटा होता जाता है — गुरुत्व सीधी रेखा में घटता है',
    id: 'Makin dalam, kulit luar berhenti menarik dan bola yang menarik mengecil — gravitasi turun mengikuti garis lurus',
    pt: 'Mais fundo, a casca externa deixa de puxar e a esfera que atrai encolhe — a gravidade cai em linha reta',
  },
  'caption.center': {
    ko: '중심에서는 사방이 똑같이 당겨 중력이 0 이다',
    en: 'At the center everything pulls equally from all sides — gravity is zero',
    ja: '中心では四方から等しく引かれる — 重力はゼロだ',
    zh: '在中心，四面八方的引力相等 — 重力为零',
    ar: 'في المركز يتساوى الجذب من كل الجهات — فالجاذبية صفر',
    es: 'En el centro todo atrae por igual desde todos los lados — la gravedad es cero',
    fr: 'Au centre, tout attire également de tous côtés — la gravité est nulle',
    hi: 'केंद्र पर हर ओर से बराबर खिंचाव होता है — गुरुत्व शून्य है',
    id: 'Di pusat, semua sisi menarik sama kuat — gravitasi nol',
    pt: 'No centro, tudo puxa igualmente de todos os lados — a gravidade é zero',
  },
} satisfies Record<string, LocalizedText>);

export type GravityInsideEarthMessageKey = keyof typeof gravityInsideEarthMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravityInsideEarthMessageKey): LocalizedText => gravityInsideEarthMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravityInsideEarthMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravityInsideEarthSchema: BundleSchema = {
  id: GRAVITY_INSIDE_EARTH_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 질량이 다가오고, 굴을 따라 중심까지 내려간다.
  parameters: [],

  stages: [
    {
      id: 'uniform-earth',
      label: text('label.stage'),
      constants: {
        surfaceG: SURFACE_G,
        earthRadiusKm: EARTH_RADIUS_KM,
        earthRadius: EARTH_RADIUS,
        graphHeight: GRAPH_HEIGHT,
        arrowAtSurface: ARROW_AT_SURFACE,
        startR: START_R,
        axisR: AXIS_R,
        massRadius: MASS_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 가로로 긴 축(2.65R)과 지구 하나, 캡션 한 줄. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 지구 · 당기는 공(면)이 맨 아래, 축 · 곡선이 그 위, 화살표 · 질량 ·
   * 그래프 점이 맨 위에 놓여야 「이 자리의 중력이 저 높이」 가 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 지표 → 내려감 → 중심 → 흐려짐. 지표를 넘는 순간은
   * 단계 경계이기도 하지만, 곡선의 꺾임은 자리(r 와 R)가 정한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.outside') },
      { id: 'approach', duration: APPROACH, ease: 'smooth', caption: key('caption.outside') },
      { id: 'surface', duration: SURFACE, caption: key('caption.surface') },
      { id: 'descend', duration: DESCEND, ease: 'smooth', caption: key('caption.inside') },
      { id: 'center', duration: CENTER, caption: key('caption.center') },
      { id: 'fade', duration: FADE, caption: key('caption.center') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 질량이 지구 쪽으로 다가오는 도중에 연다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 그래프는 축 두 개와 이름표 둘(지표 자리 · 지표 중력)만
   * 둔다 — 잴 것은 곡선의 모양(곧은 선 · 꺾임 · 1/r² 꼬리)이다.
   */

  messages: gravityInsideEarthMessages,
};
