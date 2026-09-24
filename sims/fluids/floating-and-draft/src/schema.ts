// ========================================================================
// floating-and-draft — 선언
// ========================================================================
// 질문: 뜨는 물체는 어디까지 잠기는가.
//
// 뜬 물체는 제 무게만큼의 물을 밀어낼 때까지 잠긴다. 밀어낸 물의 무게가 곧 떠받치는 힘이라,
// 그 힘이 무게와 같아지는 깊이에서 멈춘다. 같은 크기라면 잠기는 몫은 물체 밀도 ÷ 물 밀도 —
// 얼음(0.92)은 90% 넘게 잠기고, 물이 진한 소금물이 되면 같은 무게를 적게 잠겨서 떠받친다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:floating-and-draft` 와 문자 그대로 일치한다 (C4). */
export const FLOATING_AND_DRAFT_ID = 'floating-and-draft';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 밀도는 g/cm³, 길이는 월드 m. 상자는 모두 같은 크기라 무게는 밀도에 비례한다.
// 힘은 폭 · g 를 1 로 둔 「밀도 × 높이」 로 센다 — 무게 = ρ물체 H, 떠받치는 힘 = ρ물 × 잠긴 깊이.
// ------------------------------------------------------------------------

/** 세 상자의 밀도(g/cm³). 왼쪽부터 코르크 · 나무 · 얼음. */
export const RHO_CORK = 0.25;
export const RHO_WOOD = 0.6;
export const RHO_ICE = 0.92;
/** 처음 물의 밀도 · 진해진 소금물의 밀도(g/cm³). */
export const RHO_WATER = 1.0;
export const RHO_SALT = 1.2;
/** 밀도 이름표의 소수 자릿수 — 표시 형식도 선언이다(1.00 · 0.60). 코드가 자릿수를 정하지 않는다 (S-piece 유효숫자). */
export const DENSITY_DIGITS = 2;
/** 상자 가로 · 세로(m). 세 상자가 같다. */
export const BLOCK_WIDTH = 0.8;
export const BLOCK_HEIGHT = 0.8;
/** 힘 화살표 길이 = 힘 × 이 값(m). 무게와 떠받치는 힘이 같은 배율이라 길이로 견줄 수 있다. */
export const FORCE_SCALE = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 m. 수면이 y = 0.
// ------------------------------------------------------------------------

/** 세 상자의 가운데 x. */
export const BLOCK_XS: readonly number[] = [-1.6, 0, 1.6];
/**
 * 물통 안쪽 가로 반폭 · 바닥 깊이 · 벽이 수면 위로 올라온 높이. 가로는 얼음 오른쪽에 두 힘의 이름이
 * 들어갈 만큼 넓다. 바닥은 얼음의 무게 화살표 끝과 그 이름이 들어갈 만큼만 깊다 — 세로가 비싸다.
 */
export const TANK_HALF_WIDTH = 2.9;
export const TANK_FLOOR_Y = -1.1;
export const TANK_RIM_Y = 0.3;
/** 상자 이름표 높이 — 물통 바닥 아래, 각 상자 바로 밑. 위에 두면 그만큼 세로가 늘어난다. */
export const MATERIAL_LABEL_Y = TANK_FLOOR_Y - 0.2;
/** 물 이름표 자리 — 물통 안 왼쪽 아래. */
export const FLUID_LABEL_X = -TANK_HALF_WIDTH + 0.12;
export const FLUID_LABEL_Y = TANK_FLOOR_Y + 0.15;

/**
 * 프레이밍은 주장의 일부다. 가로는 물통 두 벽, 세로는 수면에 올려 둔 상자의 윗면부터 물통 아래
 * 상자 이름표 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.05, maxX: 3.05, minY: -1.75, maxY: 0.92 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 수면에 올려 둔 상자가 나타나는 동안. */
export const APPEAR = 0.5;
/** 놓인 상자가 잠겨 들어 멈추는 동안. */
export const SETTLE = 3;
/** 멈춘 자리를 읽는 동안. */
export const HOLD = 1.8;
/** 물이 소금물로 진해지는 동안. */
export const SALT = 2.4;
/** 소금물에서 멈춘 자리를 읽는 동안 · 흐려지는 동안. */
export const HOLD_SALT = 2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const floatingAndDraftMessages = Object.freeze({
  'label.title': {
    ko: '뜨는 깊이',
    en: 'How deep a floating body sits',
    ja: '浮かぶ物体の沈む深さ',
    zh: '漂浮物体浸入的深度',
    ar: 'إلى أي عمق يغوص الجسم الطافي',
    es: 'Cuánto se hunde un cuerpo que flota',
    fr: "À quelle profondeur s'enfonce un corps flottant",
    hi: 'तैरती वस्तु कितनी गहराई तक डूबती है',
    id: 'Seberapa dalam benda terapung tenggelam',
    pt: 'Quanto afunda um corpo que flutua',
  },
  'label.operation': {
    ko: '잠기는 부피가 정해지는 방식',
    en: 'What sets the submerged volume',
    ja: '沈んだ部分の体積を決めるもの',
    zh: '浸没体积由什么决定',
    ar: 'ما الذي يحدد الحجم المغمور',
    es: 'Qué determina el volumen sumergido',
    fr: 'Ce qui fixe le volume immergé',
    hi: 'डूबे आयतन को क्या तय करता है',
    id: 'Apa yang menentukan volume yang tercelup',
    pt: 'O que define o volume submerso',
  },
  'label.stage': {
    ko: '물통',
    en: 'Water tank',
    ja: '水槽',
    zh: '水槽',
    ar: 'خزان ماء',
    es: 'Tanque de agua',
    fr: "Cuve d'eau",
    hi: 'पानी की टंकी',
    id: 'Tangki air',
    pt: 'Tanque de água',
  },
  'label.view': {
    ko: '같은 크기 세 상자',
    en: 'Three blocks of one size',
    ja: '同じ大きさの三つのブロック',
    zh: '三个同样大小的方块',
    ar: 'ثلاث كتل بحجم واحد',
    es: 'Tres bloques del mismo tamaño',
    fr: 'Trois blocs de même taille',
    hi: 'एक ही आकार के तीन गुटके',
    id: 'Tiga balok berukuran sama',
    pt: 'Três blocos do mesmo tamanho',
  },
  /** 상자 이름표 — 재료와 밀도. */
  'label.cork': {
    ko: '코르크 {rho}',
    en: 'cork {rho}',
    ja: 'コルク {rho}',
    zh: '软木 {rho}',
    ar: 'فلّين {rho}',
    es: 'corcho {rho}',
    fr: 'liège {rho}',
    hi: 'कॉर्क {rho}',
    id: 'gabus {rho}',
    pt: 'cortiça {rho}',
  },
  'label.wood': {
    ko: '나무 {rho}',
    en: 'wood {rho}',
    ja: '木 {rho}',
    zh: '木块 {rho}',
    ar: 'خشب {rho}',
    es: 'madera {rho}',
    fr: 'bois {rho}',
    hi: 'लकड़ी {rho}',
    id: 'kayu {rho}',
    pt: 'madeira {rho}',
  },
  'label.ice': {
    ko: '얼음 {rho}',
    en: 'ice {rho}',
    ja: '氷 {rho}',
    zh: '冰 {rho}',
    ar: 'جليد {rho}',
    es: 'hielo {rho}',
    fr: 'glace {rho}',
    hi: 'बर्फ़ {rho}',
    id: 'es {rho}',
    pt: 'gelo {rho}',
  },
  /** 물 이름표 — 물의 종류와 밀도(단위는 여기 한 번만). */
  'label.water': {
    ko: '물 {rho} g/cm³',
    en: 'water {rho} g/cm³',
    ja: '水 {rho} g/cm³',
    zh: '水 {rho} g/cm³',
    ar: 'ماء {rho} g/cm³',
    es: 'agua {rho} g/cm³',
    fr: 'eau {rho} g/cm³',
    hi: 'पानी {rho} g/cm³',
    id: 'air {rho} g/cm³',
    pt: 'água {rho} g/cm³',
  },
  'label.salt': {
    ko: '소금물 {rho} g/cm³',
    en: 'salt water {rho} g/cm³',
    ja: '塩水 {rho} g/cm³',
    zh: '盐水 {rho} g/cm³',
    ar: 'ماء مالح {rho} g/cm³',
    es: 'agua salada {rho} g/cm³',
    fr: 'eau salée {rho} g/cm³',
    hi: 'खारा पानी {rho} g/cm³',
    id: 'air garam {rho} g/cm³',
    pt: 'água salgada {rho} g/cm³',
  },
  /** 힘 화살표 이름 — 얼음 상자에만 단다. */
  'label.weight': {
    ko: '무게',
    en: 'weight',
    ja: '重さ',
    zh: '重力',
    ar: 'الوزن',
    es: 'peso',
    fr: 'poids',
    hi: 'भार',
    id: 'berat',
    pt: 'peso',
  },
  'label.lift': {
    ko: '밀어낸 물의 무게',
    en: 'weight of water pushed aside',
    ja: '押しのけた水の重さ',
    zh: '排开的水所受的重力',
    ar: 'وزن الماء المُزاح',
    es: 'peso del agua desalojada',
    fr: "poids de l'eau déplacée",
    hi: 'हटाए गए पानी का भार',
    id: 'berat air yang dipindahkan',
    pt: 'peso da água deslocada',
  },
  'caption.settle': {
    ko: '잠겨 들수록 밀어낸 물이 늘어 위로 떠받치는 힘이 자란다',
    en: 'As each block sinks in, it pushes more water aside and the upward push grows',
    ja: '沈み込むほど押しのける水が増え、上向きに押す力が大きくなる',
    zh: '方块越往下沉，排开的水越多，向上托的力越大',
    ar: 'كلما غاصت كل كتلة أكثر أزاحت ماءً أكثر، فيكبر الدفع إلى الأعلى',
    es: 'A medida que cada bloque se hunde, desaloja más agua y el empuje hacia arriba crece',
    fr: "À mesure que chaque bloc s'enfonce, il déplace plus d'eau et la poussée vers le haut augmente",
    hi: 'हर गुटका जितना डूबता है, उतना अधिक पानी हटाता है और ऊपर की ओर धक्का बढ़ता है',
    id: 'Makin dalam tiap balok tercelup, makin banyak air yang dipindahkan dan dorongan ke atas makin besar',
    pt: 'À medida que cada bloco afunda, desloca mais água e o empurrão para cima cresce',
  },
  'caption.hold': {
    ko: '제 무게만큼 물을 밀어낸 깊이에서 멈춘다 — 무거운 얼음은 거의 다 잠긴다',
    en: 'Each stops once it has pushed aside its own weight of water — the heavy ice sits almost fully under',
    ja: 'それぞれ自分の重さと同じだけの水を押しのけた深さで止まる — 重い氷はほとんど沈む',
    zh: '每个方块排开与自身等重的水时便停下 — 重的冰几乎完全没入水中',
    ar: 'تتوقف كل كتلة حين تُزيح ماءً يساوي وزنها — فيغوص الجليد الثقيل كله تقريبًا',
    es: 'Cada uno se detiene al desalojar su propio peso en agua — el hielo, pesado, queda casi todo sumergido',
    fr: "Chacun s'arrête une fois qu'il a déplacé son propre poids d'eau — la glace, lourde, est presque entièrement immergée",
    hi: 'हर गुटका अपने भार जितना पानी हटाते ही रुक जाता है — भारी बर्फ़ लगभग पूरी डूब जाती है',
    id: 'Masing-masing berhenti begitu memindahkan air seberat dirinya — es yang berat hampir seluruhnya tercelup',
    pt: 'Cada um para ao deslocar o próprio peso em água — o gelo, pesado, fica quase todo submerso',
  },
  'caption.salt': {
    ko: '물이 진해지면 덜 밀어내도 제 무게만큼이 되어 떠오른다',
    en: 'As the water gets denser, less of it makes up the same weight, so the blocks rise',
    ja: '水が濃くなると少ない水で同じ重さになるので、ブロックは浮き上がる',
    zh: '水的密度变大，较少的水就有同样的重量，于是方块上浮',
    ar: 'كلما ازدادت كثافة الماء صار قدر أقل منه يعادل الوزن نفسه، فترتفع الكتل',
    es: 'A medida que el agua se vuelve más densa, basta menos para igualar el mismo peso, así que los bloques suben',
    fr: "Quand l'eau devient plus dense, il en faut moins pour faire le même poids : les blocs remontent",
    hi: 'पानी जितना घना होता है, उतने ही भार के लिए कम पानी काफ़ी होता है, इसलिए गुटके ऊपर उठते हैं',
    id: 'Saat air makin rapat, lebih sedikit air sudah menyamai berat yang sama, sehingga balok-balok naik',
    pt: 'À medida que a água fica mais densa, menos dela basta para o mesmo peso, e os blocos sobem',
  },
  'caption.holdSalt': {
    ko: '무게는 그대로인데 진한 소금물에서는 덜 잠긴다',
    en: 'Same weight, but in dense salt water they sit higher',
    ja: '重さは同じでも、濃い塩水では浅くしか沈まない',
    zh: '重量不变，但在较浓的盐水中它们浮得更高',
    ar: 'الوزن نفسه، لكنها تطفو أعلى في الماء المالح الكثيف',
    es: 'Mismo peso, pero en el agua salada densa flotan más alto',
    fr: "Même poids, mais dans l'eau salée dense ils flottent plus haut",
    hi: 'भार वही, पर घने खारे पानी में वे ऊँचे तैरते हैं',
    id: 'Beratnya sama, tetapi di air garam yang rapat balok-balok terapung lebih tinggi',
    pt: 'Mesmo peso, mas na água salgada densa eles flutuam mais alto',
  },
} satisfies Record<string, LocalizedText>);

export type FloatingAndDraftMessageKey = keyof typeof floatingAndDraftMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FloatingAndDraftMessageKey): LocalizedText => floatingAndDraftMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FloatingAndDraftMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const floatingAndDraftSchema: BundleSchema = {
  id: FLOATING_AND_DRAFT_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기가 세 밀도(물체 쪽)와 두 밀도(물 쪽)를 모두 지나며 주장을 마친다.
  parameters: [],

  stages: [
    {
      id: 'tank',
      label: text('label.stage'),
      constants: {
        rhoCork: RHO_CORK,
        rhoWood: RHO_WOOD,
        rhoIce: RHO_ICE,
        rhoWater: RHO_WATER,
        rhoSalt: RHO_SALT,
        densityDigits: DENSITY_DIGITS,
        blockWidth: BLOCK_WIDTH,
        blockHeight: BLOCK_HEIGHT,
        forceScale: FORCE_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'blocks', label: text('label.view'), default: true }],

  /** 물통이 가로로 넓고 세로로 얕다. 캡션 한 줄만큼 아래를 더 잡는다. */
  canvas: { height: 380, minHeight: 320 },

  /**
   * 겹침이 판정 장치다 — 물은 상자 **위**에 반투명으로 덮여야 잠긴 몫이 「잠겼다」 로 읽히고,
   * 힘 화살표는 물 위에 와야 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 잠겨 듦 → 멈춤 → 소금물 → 멈춤 → 흐려짐.
   * 잠긴 깊이는 `settle` 진행도와 물 밀도(`salt` 진행도)로만 정해진다 (physics `readDraft`).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.settle') },
      { id: 'settle', duration: SETTLE, ease: 'smooth', caption: key('caption.settle') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'salt', duration: SALT, ease: 'smooth', caption: key('caption.salt') },
      { id: 'holdSalt', duration: HOLD_SALT, caption: key('caption.holdSalt') },
      { id: 'fade', duration: FADE, caption: key('caption.holdSalt') },
    ],
  },

  /** 도착한 순간 세 상자는 이미 잠겨 드는 중이다. */
  startAt: APPEAR + SETTLE * 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 두 힘이 같아지는 자리다.

  messages: floatingAndDraftMessages,
};
