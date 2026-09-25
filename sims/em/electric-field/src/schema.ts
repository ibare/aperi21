// ========================================================================
// electric-field — 선언
// ========================================================================
// 질문: 전기장은 무엇을 적어 둔 것인가.
//
// 양전하 하나 둘레의 **모든 자리**에 화살표가 적혀 있다 — 그 자리에 단위 시험 전하를
// 두면 받을 힘이다. 세 자리에 작은 시험 전하 q 를 놓으면 받는 힘이 그 자리 화살표와
// 꼭 겹친다. 한 자리의 전하를 k 배로 키우면 받는 힘은 k 배가 되지만 **그 자리 화살표는
// 그대로다** — 화살표는 놓인 전하가 아니라 자리의 것이다. 놓아주면 저마다 그 자리
// 화살표 방향으로 밀려 간다.
//
// 이웃 `field-lines` 는 알갱이 흐름 · 전기력선이다. 여기서는 선을 긋지 않고, 자리마다의
// 화살표와 그것을 받는 시험 전하만 둔다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electric-field` 와 문자 그대로 일치한다 (C4). */
export const ELECTRIC_FIELD_ID = 'electric-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이(격자 한 칸이 1), 시간은 초, 전하는 시험 전하 q 가 1 인 단위다.
// ------------------------------------------------------------------------

/** 원천 전하의 kQ(장 단위 × 월드²). 장 세기 E = kQ / r². 양수라 장이 바깥을 향한다. */
export const KQ = 1;
/** 원천 전하의 그림 반지름(월드). */
export const SOURCE_RADIUS = 0.3;
/**
 * 장 → 화살표 길이 배율(월드 길이 per 장 단위). 화살표 길이 = 배율 × kQ / r².
 * 시험 전하가 받는 힘 화살표도 **같은 배율**이다 — 단위 전하의 힘이 곧 장 화살표다.
 */
export const ARROW_SCALE = 3.2;
/**
 * 장 화살표 길이 상한(월드). 격자 간격(1)보다 짧아 이웃 칸을 덮지 않는다.
 * 원천 곁 12 자리(r < 2)만 여기 걸린다 — 그 안에서는 비례가 끊긴다 (NOTES b).
 * 시험 전하는 상한에 걸리지 않는 자리에만 놓는다.
 */
export const ARROW_MAX = 0.8;
/** 격자 간격(월드). 화살표는 반 칸 어긋난 자리(±0.5, ±1.5 …)에 놓인다. */
export const GRID_STEP = 1;
/** 격자 반폭 · 반높이(칸 수). 가로 10 칸 × 세로 4 칸 — 세로가 비싸다. */
export const GRID_HALF_COLS = 5;
export const GRID_HALF_ROWS = 2;
/** 원천 전하 둘레에서 이만큼 안쪽에 드는 격자 자리는 비운다(월드). */
export const GRID_CLEARANCE = 0.4;

/**
 * 세 시험 전하가 놓이는 자리 — 모두 격자 자리이고 상한에 걸리지 않는다. 오른쪽 ·
 * 왼쪽 · 오른쪽 위. B(왼쪽)가 k 배로 커지는 전하다. A 와 B 는 원천에서 같은 거리라
 * 자리 화살표 길이가 같다 — B 가 커진 뒤 두 받는 힘을 견줄 수 있다.
 */
export const PROBE_A: readonly [number, number] = [2.5, -0.5];
export const PROBE_B: readonly [number, number] = [-2.5, 0.5];
export const PROBE_C: readonly [number, number] = [1.5, 1.5];
/** 시험 전하 그림 반지름(월드). 원천과 크기로 갈린다 — 「작은 시험 전하」. */
export const PROBE_RADIUS = 0.15;
/** B 의 전하를 키우는 배수. 받는 힘이 이만큼 커지고, 자리 화살표는 그대로다. */
export const CHARGE_FACTOR = 2;
/**
 * 시험 전하의 질량(힘 단위 · 초² / 월드). 밀려 가는 빠르기만 정한다 — 오른쪽 위 전하(C)가
 * `push` 동안 그림 위 끝을 넘지 않을 만큼 무겁게 잡았다.
 */
export const PROBE_MASS = 0.8;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 격자 10 × 4 칸과 위로 밀려 가는 전하(C)의 끝 자리를 담고,
 * 아래에 캡션 띠를 남긴다
 * (캡션 슬롯이 프레이밍 여백으로 잡히지 않는다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -5.1, maxX: 5.1, minY: -2.55, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 화살표만 적힌 그림을 읽는 동안. */
export const FIELD_HOLD = 1.8;
/** 시험 전하 셋이 나타나는 동안 · 그 그림을 읽는 동안. */
export const PLACE = 0.8;
export const READ = 1.8;
/** B 의 전하가 k 배로 커지는 동안 · 그 그림을 읽는 동안. */
export const GROW = 1.2;
export const DOUBLE_HOLD = 2.4;
/** 놓아주어 밀려 가는 동안 · 다음 주기로 넘어가며 사라지는 동안. */
export const PUSH = 2.6;
export const CLEAR = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electricFieldMessages = Object.freeze({
  'label.title': {
    ko: '전기장',
    en: 'Electric field',
    ja: '電場',
    zh: '电场',
    ar: 'المجال الكهربائي',
    es: 'Campo eléctrico',
    fr: 'Champ électrique',
    hi: 'विद्युत क्षेत्र',
    id: 'Medan listrik',
    pt: 'Campo elétrico',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '단위 전하가 받는 힘',
    en: 'The force on a unit charge',
    ja: '単位電荷が受ける力',
    zh: '单位电荷所受的力',
    ar: 'القوة المؤثرة في شحنة الوحدة',
    es: 'La fuerza sobre una carga unitaria',
    fr: 'La force sur une charge unité',
    hi: 'एकांक आवेश पर लगने वाला बल',
    id: 'Gaya pada muatan satuan',
    pt: 'A força sobre uma carga unitária',
  },
  'label.stage': {
    ko: '양전하 하나',
    en: 'One positive charge',
    ja: '一つの正電荷',
    zh: '一个正电荷',
    ar: 'شحنة موجبة واحدة',
    es: 'Una carga positiva',
    fr: 'Une charge positive',
    hi: 'एक धनावेश',
    id: 'Satu muatan positif',
    pt: 'Uma carga positiva',
  },
  'label.view': {
    ko: '장',
    en: 'Field',
    ja: '場',
    zh: '场',
    ar: 'المجال',
    es: 'Campo',
    fr: 'Champ',
    hi: 'क्षेत्र',
    id: 'Medan',
    pt: 'Campo',
  },
  /** 전하 부호 · 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'mark.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'mark.q': {
    ko: '+q',
    en: '+q',
    ja: '+q',
    zh: '+q',
    ar: '+q',
    es: '+q',
    fr: '+q',
    hi: '+q',
    id: '+q',
    pt: '+q',
  },
  /** 배수가 끼는 기호. 배수는 스테이지 상수에서 온다. */
  'mark.kq': {
    ko: '+{k}q',
    en: '+{k}q',
    ja: '+{k}q',
    zh: '+{k}q',
    ar: '+{k}q',
    es: '+{k}q',
    fr: '+{k}q',
    hi: '+{k}q',
    id: '+{k}q',
    pt: '+{k}q',
  },
  'caption.field': {
    ko: '양전하 둘레 모든 자리에 화살표가 적혀 있다 — 가까울수록 길다',
    en: 'Every spot around the positive charge carries an arrow — longer closer in',
    ja: '正電荷のまわりのどの場所にも矢印が書かれている — 近いほど長い',
    zh: '正电荷周围的每个位置都标着一个箭头 — 越近越长',
    ar: 'كل موضع حول الشحنة الموجبة يحمل سهمًا — أطول كلما اقترب منها',
    es: 'Cada punto alrededor de la carga positiva lleva una flecha — más larga cuanto más cerca',
    fr: 'Chaque point autour de la charge positive porte une flèche — plus longue près de la charge',
    hi: 'धनावेश के चारों ओर हर स्थान पर एक तीर है — जितना पास, उतना लंबा',
    id: 'Setiap titik di sekitar muatan positif memiliki panah — makin dekat makin panjang',
    pt: 'Cada ponto ao redor da carga positiva tem uma seta — mais longa quanto mais perto',
  },
  'caption.place': {
    ko: '작은 시험 전하 q 를 놓으면, 받는 힘이 그 자리 화살표와 꼭 겹친다',
    en: 'Place a small test charge q, and the force on it matches the arrow at that spot',
    ja: '小さな試験電荷 q を置くと、受ける力がその場所の矢印とぴったり重なる',
    zh: '放上一个小试探电荷 q，它受的力与该处的箭头恰好重合',
    ar: 'ضع شحنة اختبار صغيرة q، فتنطبق القوة المؤثرة فيها على السهم في ذلك الموضع',
    es: 'Coloca una pequeña carga de prueba q, y la fuerza sobre ella coincide con la flecha de ese punto',
    fr: 'Placez une petite charge d’essai q : la force qu’elle subit coïncide avec la flèche en ce point',
    hi: 'एक छोटा परीक्षण आवेश q रखें, तो उस पर लगने वाला बल उस स्थान के तीर से ठीक मेल खाता है',
    id: 'Letakkan muatan uji kecil q, dan gaya padanya tepat berimpit dengan panah di titik itu',
    pt: 'Coloque uma pequena carga de prova q, e a força sobre ela coincide com a seta daquele ponto',
  },
  'caption.grow': {
    ko: '한 자리의 전하를 {k}배로 키운다',
    en: 'One charge is made {k} times larger',
    ja: '一つの電荷を{k}倍に大きくする',
    zh: '把其中一个电荷增大到{k}倍',
    ar: 'تُكبَّر إحدى الشحنات {k} مرات',
    es: 'Una carga se hace {k} veces mayor',
    fr: 'Une charge est rendue {k} fois plus grande',
    hi: 'एक आवेश को {k} गुना बड़ा किया जाता है',
    id: 'Satu muatan diperbesar {k} kali',
    pt: 'Uma carga fica {k} vezes maior',
  },
  'caption.double': {
    ko: '{k}배가 된 전하는 {k}배의 힘을 받는다 — 그 자리 화살표는 그대로다',
    en: 'The charge made {k} times larger feels {k} times the force — the arrow at that spot stays the same',
    ja: '{k}倍になった電荷は{k}倍の力を受ける — その場所の矢印は変わらない',
    zh: '增大到{k}倍的电荷受到{k}倍的力 — 该处的箭头保持不变',
    ar: 'الشحنة التي كُبِّرت {k} مرات تتأثر بقوة أكبر {k} مرات — ويبقى السهم في ذلك الموضع كما هو',
    es: 'La carga {k} veces mayor siente {k} veces la fuerza — la flecha de ese punto sigue igual',
    fr: 'La charge rendue {k} fois plus grande subit {k} fois la force — la flèche en ce point reste la même',
    hi: '{k} गुना बड़ा आवेश {k} गुना बल अनुभव करता है — उस स्थान का तीर वैसा ही रहता है',
    id: 'Muatan yang {k} kali lebih besar merasakan gaya {k} kali lipat — panah di titik itu tetap sama',
    pt: 'A carga {k} vezes maior sente {k} vezes a força — a seta daquele ponto continua a mesma',
  },
  'caption.push': {
    ko: '놓아주면 저마다 그 자리 화살표 방향으로 밀려 간다',
    en: 'Let go, and each one is pushed along the arrow where it sits',
    ja: '放すと、それぞれがその場所の矢印の向きに押されていく',
    zh: '一松手，每个电荷都沿着所在位置的箭头方向被推走',
    ar: 'اتركها، فتُدفع كل واحدة على امتداد السهم في موضعها',
    es: 'Al soltarlas, cada una es empujada según la flecha del punto donde está',
    fr: 'Lâchez-les : chacune est poussée le long de la flèche de l’endroit où elle se trouve',
    hi: 'छोड़ते ही हर एक अपने स्थान के तीर की दिशा में धकेला जाता है',
    id: 'Lepaskan, dan masing-masing terdorong searah panah di tempatnya',
    pt: 'Solte, e cada uma é empurrada ao longo da seta do ponto onde está',
  },
} satisfies Record<string, LocalizedText>);

export type ElectricFieldMessageKey = keyof typeof electricFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectricFieldMessageKey): LocalizedText => electricFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectricFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electricFieldSchema: BundleSchema = {
  id: ELECTRIC_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 화살표가 적혀 있고, 전하가 놓이고, 커지고, 밀려 간다.
  parameters: [],

  stages: [
    {
      id: 'one-charge',
      label: text('label.stage'),
      constants: {
        kQ: KQ,
        sourceRadius: SOURCE_RADIUS,
        arrowScale: ARROW_SCALE,
        arrowMax: ARROW_MAX,
        gridStep: GRID_STEP,
        gridHalfCols: GRID_HALF_COLS,
        gridHalfRows: GRID_HALF_ROWS,
        gridClearance: GRID_CLEARANCE,
        probeAX: PROBE_A[0],
        probeAY: PROBE_A[1],
        probeBX: PROBE_B[0],
        probeBY: PROBE_B[1],
        probeCX: PROBE_C[0],
        probeCY: PROBE_C[1],
        probeRadius: PROBE_RADIUS,
        chargeFactor: CHARGE_FACTOR,
        probeMass: PROBE_MASS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'field', label: text('label.view'), default: true }],

  /** 가로로 넓은 격자(10 × 4 칸)와 캡션 한두 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 받는 힘(굵은 강조 화살표) **위에** 그 자리 장 화살표(가는 선)를
   * 한 번 더 얹어야 「힘이 k 배로 자라도 자리 화살표는 그대로」 가 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 화살표만 → 시험 전하를 놓음 → 한 전하를 k 배로 → 놓아줌 → 사라짐.
   * 전하가 커지는 동안만 `smooth` 로 흘린다.
   */
  timeline: {
    phases: [
      { id: 'field', duration: FIELD_HOLD, caption: key('caption.field') },
      { id: 'place', duration: PLACE, ease: 'smooth', caption: key('caption.place') },
      { id: 'read', duration: READ, caption: key('caption.place') },
      { id: 'grow', duration: GROW, ease: 'smooth', caption: key('caption.grow') },
      { id: 'double', duration: DOUBLE_HOLD, caption: key('caption.double') },
      { id: 'push', duration: PUSH, caption: key('caption.push') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.push') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 화살표는 첫 프레임부터 온전히 적혀 있고, 0.8 초 뒤
   * 시험 전하가 놓이기 시작한다.
   */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 배수는 스테이지 상수에서 state 로 옮긴 글자다 (장부 G133). */
    vars: { k: 'factor' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **화살표 길이의 견줌**이라
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 화살표가 놓인 반 칸
   * 어긋난 자리 자체가 이 그림의 격자다.
   */

  messages: electricFieldMessages,
};
