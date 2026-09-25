// ========================================================================
// buoyancy — 선언
// ========================================================================
// 질문: 물은 왜 물체를 **위로** 미는가. 그리고 그 힘은 왜 깊이 내려가도 그대로인가.
//
// 물은 물체의 모든 면을 민다. 옆면을 미는 힘은 좌우가 서로 지운다. 남는 것은 위아래다 —
// 아랫면이 윗면보다 깊어서 더 세게 밀린다. 그 차이가 부력이다. 두 면의 깊이 차는 언제나
// 물체의 (잠긴) 높이라서, 차이는 잠긴 만큼만 자라고 더 깊이 가도 커지지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:buoyancy` 와 문자 그대로 일치한다 (C4). */
export const BUOYANCY_ID = 'buoyancy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 깊이의 단위는 월드 m 이고, 압력은 ρg 를 1 로 둔 「깊이」 그 자체로 센다.
// 대기압은 모든 면에 똑같이 더해져 차이에서 지워지므로 두지 않는다 (NOTES (b)).
// ------------------------------------------------------------------------

/** 상자 가로 · 세로(m). 세로가 곧 윗면과 아랫면의 깊이 차다. */
export const BOX_WIDTH = 1.3;
export const BOX_HEIGHT = 0.6;
/** 처음 자리 — 아랫면이 수면 위 이만큼(m)에 떠 있다. */
export const START_CLEARANCE = 0.2;
/** 가장 깊이 내려갔을 때 윗면의 깊이(m). */
export const MAX_TOP_DEPTH = 1.2;
/** 면을 미는 화살표 길이 = 깊이 × 이 값(m per m). 1 보다 작아 윗면 화살표가 물 밖으로 나가지 않는다. */
export const ARROW_PER_DEPTH = 0.35;
/** 물통 옆 막대 높이 = 깊이 × 이 값. 부력 화살표 길이도 같은 배율 — 막대의 초과분과 같은 길이다. */
export const BAR_PER_DEPTH = 1.0;

// ------------------------------------------------------------------------
// 배치 — 월드 m. 수면이 y = 0, 상자 가운데가 x = 0.
// ------------------------------------------------------------------------

/** 물통 안쪽 가로 반폭 · 바닥 깊이. 가장 깊은 자리의 아랫면 화살표와 옆면 화살표가 들어간다. */
export const TANK_HALF_WIDTH = 1.6;
export const TANK_FLOOR_Y = -2.55;
/** 물통 벽이 수면 위로 올라온 높이. */
export const TANK_RIM_Y = 0.35;

/** 면마다 화살표를 놓는 가로 자리 — 상자 반폭에 대한 비율. 가운데는 부력 화살표 자리라 비운다. */
export const FACE_ARROW_XS: readonly number[] = [-0.72, -0.3, 0.3, 0.72];
/** 옆면 화살표를 놓는 높이 — 아랫면에서 잰 상자 높이의 비율. */
export const SIDE_ARROW_FRACTIONS: readonly number[] = [0.2, 0.5, 0.8];

/** 막대 둘의 가운데 x · 반폭. 바닥은 물통 바닥과 같은 높이다. */
export const BAR_TOP_X = 2.25;
export const BAR_BOTTOM_X = 3.0;
export const BAR_HALF_WIDTH = 0.2;
export const BAR_BASE_Y = TANK_FLOOR_Y;
/** 막대 이름표 높이. */
export const BAR_LABEL_Y = TANK_FLOOR_Y - 0.24;

/**
 * 프레이밍은 주장의 일부다. 가로는 물통 왼쪽 벽부터 강조 몫 이름표까지, 세로는 물 밖에
 * 뜬 상자 위부터 막대 이름표 · 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.8, maxX: 3.95, minY: -3.2, maxY: 0.9 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 물 밖에 뜬 상자가 나타나는 동안. */
export const APPEAR = 0.5;
/** 아랫면이 수면에 닿아 윗면까지 잠기는 동안. */
export const ENTER = 3;
/** 다 잠긴 채 더 깊이 내려가는 동안. */
export const SINK = 5;
/** 가장 깊은 자리에서 멈춰 읽는 동안 · 흐려지는 동안. */
export const HOLD = 2.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const buoyancyMessages = Object.freeze({
  'label.title': {
    ko: '부력',
    en: 'Buoyancy',
    ja: '浮力',
    zh: '浮力',
    ar: 'قوة الطفو',
    es: 'Empuje',
    fr: 'Poussée d’Archimède',
    hi: 'उत्प्लावन बल',
    id: 'Gaya apung',
    pt: 'Empuxo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '아랫면이 더 세게 밀리는 만큼 남는 위쪽 힘',
    en: 'The upward force left over as the bottom face is pushed harder',
    ja: '下の面がより強く押される分だけ残る上向きの力',
    zh: '下表面被推得更用力，由此剩下的向上的力',
    ar: 'القوة المتجهة إلى الأعلى التي تبقى لأن الوجه السفلي يُدفع بقوة أكبر',
    es: 'La fuerza hacia arriba que queda porque la cara inferior es empujada con más fuerza',
    fr: 'La force vers le haut qui reste parce que la face inférieure est poussée plus fort',
    hi: 'निचली सतह पर अधिक ज़ोर पड़ने से बचा रहने वाला ऊपर की ओर बल',
    id: 'Gaya ke atas yang tersisa karena permukaan bawah terdorong lebih kuat',
    pt: 'A força para cima que sobra porque a face de baixo é empurrada com mais força',
  },
  'label.stage': {
    ko: '물통',
    en: 'Water tank',
    ja: '水槽',
    zh: '水槽',
    ar: 'خزان ماء',
    es: 'Tanque de agua',
    fr: 'Cuve d’eau',
    hi: 'पानी की टंकी',
    id: 'Tangki air',
    pt: 'Tanque de água',
  },
  'label.view': {
    ko: '면마다 미는 힘',
    en: 'Push on each face',
    ja: '面ごとに押す力',
    zh: '每个面受到的推力',
    ar: 'الدفع على كل وجه',
    es: 'Empuje sobre cada cara',
    fr: 'Poussée sur chaque face',
    hi: 'हर फलक पर धक्का',
    id: 'Dorongan pada tiap sisi',
    pt: 'Empurrão em cada face',
  },
  /** 막대 이름표 — 어느 면이 받는 힘인가. */
  'label.topFace': {
    ko: '윗면',
    en: 'top',
    ja: '上面',
    zh: '上表面',
    ar: 'الوجه العلوي',
    es: 'cara superior',
    fr: 'face du haut',
    hi: 'ऊपरी फलक',
    id: 'sisi atas',
    pt: 'face superior',
  },
  'label.bottomFace': {
    ko: '아랫면',
    en: 'bottom',
    ja: '下面',
    zh: '下表面',
    ar: 'الوجه السفلي',
    es: 'cara inferior',
    fr: 'face du bas',
    hi: 'निचला फलक',
    id: 'sisi bawah',
    pt: 'face inferior',
  },
  'label.buoyancy': {
    ko: '부력',
    en: 'buoyancy',
    ja: '浮力',
    zh: '浮力',
    ar: 'قوة الطفو',
    es: 'empuje',
    fr: 'poussée d’Archimède',
    hi: 'उत्प्लावन बल',
    id: 'gaya apung',
    pt: 'empuxo',
  },
  'caption.enter': {
    ko: '잠겨 들수록 아랫면이 깊어져 물이 더 세게 밀어 올린다',
    en: 'As it goes in, the bottom face gets deeper and the water pushes it up harder',
    ja: '沈み込むほど下面が深くなり、水がより強く押し上げる',
    zh: '越往下沉，下表面越深，水向上推得越用力',
    ar: 'كلما غاص أكثر، ازداد عمق الوجه السفلي ودفعه الماء إلى الأعلى بقوة أكبر',
    es: 'Al sumergirse, la cara inferior queda más honda y el agua la empuja hacia arriba con más fuerza',
    fr: 'À mesure qu’il s’enfonce, la face du bas descend et l’eau la pousse vers le haut plus fort',
    hi: 'जैसे-जैसे यह डूबता है, निचला फलक गहरा होता जाता है और पानी इसे और ज़ोर से ऊपर धकेलता है',
    id: 'Makin masuk, sisi bawah makin dalam dan air mendorongnya ke atas makin kuat',
    pt: 'À medida que entra, a face inferior fica mais funda e a água a empurra para cima com mais força',
  },
  'caption.sink': {
    ko: '더 내려가면 윗면도 아랫면도 더 세게 밀린다 — 둘의 차이는 그대로다',
    en: 'Going deeper, both faces are pushed harder — the difference between them stays the same',
    ja: 'さらに深く沈むと、上面も下面もより強く押される — 両者の差は変わらない',
    zh: '沉得更深时，上下两个表面都被推得更用力 — 两者之差保持不变',
    ar: 'مع النزول أعمق، يُدفع الوجهان كلاهما بقوة أكبر — ويبقى الفرق بينهما كما هو',
    es: 'Más abajo, ambas caras reciben un empuje mayor — la diferencia entre ellas sigue igual',
    fr: 'Plus bas, les deux faces sont poussées plus fort — l’écart entre elles reste le même',
    hi: 'और गहरे जाने पर दोनों फलकों पर धक्का बढ़ता है — दोनों का अंतर वही रहता है',
    id: 'Makin dalam, kedua sisi didorong makin kuat — selisih keduanya tetap sama',
    pt: 'Mais fundo, as duas faces são empurradas com mais força — a diferença entre elas continua a mesma',
  },
  'caption.hold': {
    ko: '아랫면은 윗면보다 상자 높이만큼 깊다 — 그만큼 더 받는 힘이 부력이다',
    en: 'The bottom face is one block-height deeper than the top — that extra push is the buoyant force',
    ja: '下面は上面より箱の高さの分だけ深い — その分だけ余分に受ける力が浮力だ',
    zh: '下表面比上表面深一个木块的高度 — 多受的那部分推力就是浮力',
    ar: 'الوجه السفلي أعمق من العلوي بمقدار ارتفاع الكتلة — وذلك الدفع الإضافي هو قوة الطفو',
    es: 'La cara inferior está una altura de bloque más honda que la superior — esa fuerza extra es el empuje',
    fr: 'La face du bas est plus profonde que celle du haut d’une hauteur de bloc — ce surplus de poussée, c’est la poussée d’Archimède',
    hi: 'निचला फलक ऊपरी फलक से एक गुटके की ऊँचाई जितना गहरा है — वही अतिरिक्त धक्का उत्प्लावन बल है',
    id: 'Sisi bawah lebih dalam daripada sisi atas sejauh tinggi balok — dorongan tambahan itulah gaya apung',
    pt: 'A face inferior está uma altura de bloco mais funda que a superior — esse empurrão extra é o empuxo',
  },
} satisfies Record<string, LocalizedText>);

export type BuoyancyMessageKey = keyof typeof buoyancyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BuoyancyMessageKey): LocalizedText => buoyancyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BuoyancyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const buoyancySchema: BundleSchema = {
  id: BUOYANCY_ID,
  label: text('label.title'),
  category: 'fluids',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기가 잠겨 드는 구간과 더 깊이 가는 구간을 모두 지나며 주장을 마친다.
  parameters: [],

  stages: [
    {
      id: 'tank',
      label: text('label.stage'),
      constants: {
        boxWidth: BOX_WIDTH,
        boxHeight: BOX_HEIGHT,
        startClearance: START_CLEARANCE,
        maxTopDepth: MAX_TOP_DEPTH,
        arrowPerDepth: ARROW_PER_DEPTH,
        barPerDepth: BAR_PER_DEPTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'faces', label: text('label.view'), default: true }],

  /** 물통이 세로로 깊어 가로보다 세로가 먼저 찬다. 캡션 한 줄만큼 더 잡는다. */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 물은 상자 **위**에 반투명으로 덮여야 「잠겼다」 로 읽히고,
   * 면을 미는 화살표는 물 위에 와야 읽힌다. 막대의 강조 몫은 막대 위에 얹힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 잠겨 듦 → 더 깊이 → 멈춤 → 흐려짐.
   * 상자의 깊이는 이 진행도들의 합으로만 정해진다 (physics `readDepth`).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.enter') },
      { id: 'enter', duration: ENTER, ease: 'smooth', caption: key('caption.enter') },
      { id: 'sink', duration: SINK, ease: 'smooth', caption: key('caption.sink') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 상자는 이미 반쯤 잠겨 내려가는 중이다. */
  startAt: APPEAR + ENTER / 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 두 힘의 차이다.

  messages: buoyancyMessages,
};
