// ========================================================================
// star-radiation-gravity-balance — 선언
// ========================================================================
// 질문: 별은 왜 제 무게에 무너지지도, 제 열에 흩어지지도 않는가.
//
// 별의 단면 하나. 어느 층에서나 안으로 당기는 중력과 밖으로 미는 압력(중심 핵융합이
// 데운 가스 · 복사)이 맞선다. 중심이 내는 에너지를 키우면 압력이 이겨 별이 부풀고,
// 부풀며 식어 미는 힘이 줄어 더 큰 크기에서 다시 균형을 찾는다. 줄이면 중력이 이겨
// 오그라들고, 오그라들며 데워져 미는 힘이 커져 더 작은 크기에서 균형을 찾는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:star-radiation-gravity-balance` 와 문자 그대로 일치한다 (C4). */
export const STAR_RADIATION_GRAVITY_BALANCE_ID = 'star-radiation-gravity-balance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 모두 상대값이다 — 이 조각은 크기의 비와 힘의 비만 말한다.
// ------------------------------------------------------------------------

/** 처음 · 키운 · 줄인 중심 에너지(상대값). */
export const ENERGY_CALM = 1;
export const ENERGY_HIGH = 1.6;
export const ENERGY_LOW = 0.6;
/** 처음 에너지에서 균형을 이루는 반지름(월드). */
export const CALM_RADIUS = 2;
/**
 * 압력이 반지름에 따라 줄어드는 가파름 n — 압력 ∝ 에너지 / Rⁿ. 중력(1/R²)보다 가팔라야(n > 2)
 * 부풀면 압력이 더 빨리 줄고(식음) 오그라들면 더 빨리 커져(데워짐) 균형으로 되돌아온다.
 * 균형 반지름 = 처음 반지름 × (에너지비)^(1/(n−2)) — n = 4 에서 반지름 범위는 약 1.55 ~ 2.53.
 */
export const PRESSURE_EXPONENT = 4;
/** 화살표 길이(월드) = 이 값 × 힘 / (처음 별 표면의 중력). */
export const ARROW_PER_FORCE = 0.6;
/** 안쪽 층의 자리 — 반지름에 대한 비. 별이 통째로 닮은꼴로 커지고 줄어 이 층도 같은 비를 지킨다. */
export const INNER_LAYER = 0.55;
/** 새 균형으로 가라앉는 빠르기. 단계 진행도 p 에서 1 − e^(−k·p) 의 k. */
export const SETTLE_SHARPNESS = 2.5;
/** 중심(핵융합 자리)의 반지름(월드) — 처음 에너지일 때. 에너지에 비례해 커지고 준다. */
export const CORE_RADIUS = 0.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 별의 중심이 원점.
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 에너지를 늘린 직후 처음 별에서 뻗는 압력 화살표(2 + 0.96), 가장 부푼 별(약 2.53),
 * 에너지를 되돌린 직후 가장 작은 별에서 뻗는 압력 화살표(약 1.55 + 1.66)가 모두 들어가고, 아래에 캡션 줄이
 * 남는다. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -6, maxX: 6, minY: -4.0, maxY: 3.3 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 균형에 머물며 두 화살표가 같은 것을 읽는 동안(초). */
export const HOLD_CALM = 3.5;
export const HOLD = 2.5;
/** 중심 에너지를 바꾸는 동안(초). 이 동안 별은 아직 제 크기다 — 한쪽이 이기는 순간을 먼저 본다. */
export const CHANGE = 1;
/** 별이 새 균형으로 부풀거나 오그라드는 동안(초). */
export const SETTLE = 5;
export const RETURN = 4.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const starRadiationGravityBalanceMessages = Object.freeze({
  'label.title': {
    ko: '복사압과 중력의 평형',
    en: 'Radiation pressure and gravity in balance',
    ja: '放射圧と重力のつり合い',
    zh: '辐射压与引力的平衡',
    ar: 'توازن ضغط الإشعاع والجاذبية',
    es: 'Equilibrio entre presión de radiación y gravedad',
    fr: 'Équilibre entre pression de radiation et gravité',
    hi: 'विकिरण दाब और गुरुत्व का संतुलन',
    id: 'Keseimbangan tekanan radiasi dan gravitasi',
    pt: 'Equilíbrio entre pressão de radiação e gravidade',
  },
  'label.operation': {
    ko: '별이 무너지지도 흩어지지도 않는 이유',
    en: 'Why a star neither collapses nor flies apart',
    ja: '星がつぶれも飛び散りもしない理由',
    zh: '恒星为何既不坍缩也不飞散',
    ar: 'لماذا لا ينهار النجم ولا يتناثر',
    es: 'Por qué una estrella ni colapsa ni se dispersa',
    fr: 'Pourquoi une étoile ne s’effondre ni ne se disperse',
    hi: 'तारा क्यों न ढहता है, न बिखरता है',
    id: 'Mengapa bintang tidak runtuh dan tidak tercerai-berai',
    pt: 'Por que uma estrela nem colapsa nem se desfaz',
  },
  'label.stage': {
    ko: '별 하나',
    en: 'One star',
    ja: '一つの星',
    zh: '一颗恒星',
    ar: 'نجم واحد',
    es: 'Una estrella',
    fr: 'Une étoile',
    hi: 'एक तारा',
    id: 'Satu bintang',
    pt: 'Uma estrela',
  },
  'label.view': {
    ko: '별의 단면',
    en: 'Cross-section of a star',
    ja: '星の断面',
    zh: '恒星的截面',
    ar: 'مقطع عرضي لنجم',
    es: 'Sección transversal de una estrella',
    fr: 'Coupe d’une étoile',
    hi: 'तारे का अनुप्रस्थ काट',
    id: 'Penampang bintang',
    pt: 'Corte transversal de uma estrela',
  },
  /** 화살표 이름. 한 낱말이지만 분야 원어 약자가 아니라 언어마다 다르다 — 문안. */
  'label.gravity': {
    ko: '중력',
    en: 'gravity',
    ja: '重力',
    zh: '引力',
    ar: 'الجاذبية',
    es: 'gravedad',
    fr: 'gravité',
    hi: 'गुरुत्व',
    id: 'gravitasi',
    pt: 'gravidade',
  },
  'label.pressure': {
    ko: '압력',
    en: 'pressure',
    ja: '圧力',
    zh: '压力',
    ar: 'الضغط',
    es: 'presión',
    fr: 'pression',
    hi: 'दाब',
    id: 'tekanan',
    pt: 'pressão',
  },
  'label.calmSize': {
    ko: '처음 크기',
    en: 'original size',
    ja: 'もとの大きさ',
    zh: '原来的大小',
    ar: 'الحجم الأصلي',
    es: 'tamaño original',
    fr: 'taille d’origine',
    hi: 'मूल आकार',
    id: 'ukuran semula',
    pt: 'tamanho original',
  },
  'caption.calm': {
    ko: '어느 층에서나 안으로 당기는 중력과 밖으로 미는 압력이 같다 — 별은 제 크기를 지킨다',
    en: 'At every layer the inward pull of gravity and the outward push of pressure are equal — the star keeps its size',
    ja: 'どの層でも、内向きに引く重力と外向きに押す圧力が等しい — 星は大きさを保つ',
    zh: '在每一层，向内拉的引力与向外推的压力相等 — 恒星保持自身大小',
    ar: 'في كل طبقة يتساوى شدّ الجاذبية إلى الداخل ودفع الضغط إلى الخارج — فيحافظ النجم على حجمه',
    es: 'En cada capa, el tirón de la gravedad hacia dentro y el empuje de la presión hacia fuera son iguales — la estrella conserva su tamaño',
    fr: 'À chaque couche, l’attraction de la gravité vers l’intérieur et la poussée de la pression vers l’extérieur sont égales — l’étoile garde sa taille',
    hi: 'हर परत पर गुरुत्व का भीतर की ओर खिंचाव और दाब का बाहर की ओर धक्का बराबर हैं — तारा अपना आकार बनाए रखता है',
    id: 'Di setiap lapisan, tarikan gravitasi ke dalam dan dorongan tekanan ke luar sama besar — bintang mempertahankan ukurannya',
    pt: 'Em cada camada, a atração da gravidade para dentro e o empurrão da pressão para fora são iguais — a estrela mantém seu tamanho',
  },
  'caption.swell': {
    ko: '중심에서 내는 에너지가 늘자 압력이 이겨 별이 부푼다 — 부풀수록 식어 미는 힘이 줄어든다',
    en: 'The core puts out more energy, pressure wins and the star swells — as it swells it cools and the push weakens',
    ja: '中心核の出すエネルギーが増えると圧力が勝ち、星は膨らむ — 膨らむほど冷えて押す力は弱まる',
    zh: '核心释放的能量增加，压力占上风，恒星膨胀 — 越膨胀越冷，向外的推力随之减弱',
    ar: 'يُطلق اللبّ طاقة أكبر، فيتغلّب الضغط وينتفخ النجم — وكلما انتفخ برد وضعف الدفع',
    es: 'El núcleo emite más energía, la presión gana y la estrella se hincha — al hincharse se enfría y el empuje se debilita',
    fr: 'Le cœur libère plus d’énergie, la pression l’emporte et l’étoile gonfle — en gonflant, elle refroidit et la poussée faiblit',
    hi: 'क्रोड अधिक ऊर्जा छोड़ता है, दाब जीतता है और तारा फूलता है — फूलते-फूलते वह ठंडा होता है और धक्का कमज़ोर पड़ता है',
    id: 'Inti mengeluarkan lebih banyak energi, tekanan menang dan bintang mengembang — makin mengembang makin dingin dan dorongannya melemah',
    pt: 'O núcleo libera mais energia, a pressão vence e a estrela incha — ao inchar, esfria e o empurrão enfraquece',
  },
  'caption.big': {
    ko: '압력과 중력이 다시 같아졌다 — 더 큰 별이 되어 새 균형에 멈췄다',
    en: 'Pressure and gravity are equal again — the star has settled into a new balance, larger than before',
    ja: '圧力と重力が再び等しくなった — 星は以前より大きくなって新しいつり合いに落ち着いた',
    zh: '压力与引力再次相等 — 恒星变得比之前更大，稳定在新的平衡中',
    ar: 'تساوى الضغط والجاذبية من جديد — استقرّ النجم على توازن جديد وهو أكبر من قبل',
    es: 'La presión y la gravedad vuelven a igualarse — la estrella se ha asentado en un nuevo equilibrio, más grande que antes',
    fr: 'Pression et gravité sont de nouveau égales — l’étoile s’est stabilisée dans un nouvel équilibre, plus grande qu’avant',
    hi: 'दाब और गुरुत्व फिर बराबर हो गए — तारा पहले से बड़ा होकर नए संतुलन में ठहर गया है',
    id: 'Tekanan dan gravitasi kembali sama — bintang telah menetap dalam keseimbangan baru, lebih besar daripada sebelumnya',
    pt: 'Pressão e gravidade voltam a ser iguais — a estrela se acomodou num novo equilíbrio, maior do que antes',
  },
  'caption.shrink': {
    ko: '에너지가 줄자 중력이 이겨 별이 오그라든다 — 오그라들수록 데워져 미는 힘이 커진다',
    en: 'The energy drops, gravity wins and the star shrinks — as it shrinks it heats up and the push grows',
    ja: 'エネルギーが減ると重力が勝ち、星は縮む — 縮むほど熱くなって押す力は強まる',
    zh: '能量减少，引力占上风，恒星收缩 — 越收缩越热，向外的推力随之增强',
    ar: 'تنخفض الطاقة، فتتغلّب الجاذبية وينكمش النجم — وكلما انكمش سخن وقوي الدفع',
    es: 'La energía baja, la gravedad gana y la estrella se encoge — al encogerse se calienta y el empuje crece',
    fr: 'L’énergie baisse, la gravité l’emporte et l’étoile se contracte — en se contractant, elle chauffe et la poussée augmente',
    hi: 'ऊर्जा घटती है, गुरुत्व जीतता है और तारा सिकुड़ता है — सिकुड़ते-सिकुड़ते वह गर्म होता है और धक्का बढ़ता है',
    id: 'Energi turun, gravitasi menang dan bintang menyusut — makin menyusut makin panas dan dorongannya menguat',
    pt: 'A energia cai, a gravidade vence e a estrela encolhe — ao encolher, esquenta e o empurrão cresce',
  },
  'caption.small': {
    ko: '다시 같아졌다 — 더 작고 뜨거운 별이 되어 균형을 찾았다',
    en: 'Equal again — the star has found its balance as a smaller, hotter star',
    ja: '再び等しくなった — 星はより小さく熱い星として、つり合いを見つけた',
    zh: '再次相等 — 恒星变成更小、更热的恒星，找到了平衡',
    ar: 'تساويا من جديد — وجد النجم توازنه نجمًا أصغر وأسخن',
    es: 'Iguales de nuevo — la estrella ha encontrado su equilibrio como una estrella más pequeña y más caliente',
    fr: 'De nouveau égales — l’étoile a trouvé son équilibre, plus petite et plus chaude',
    hi: 'फिर बराबर — तारे ने छोटे और अधिक गर्म तारे के रूप में अपना संतुलन पा लिया है',
    id: 'Sama lagi — bintang menemukan keseimbangannya sebagai bintang yang lebih kecil dan lebih panas',
    pt: 'Iguais de novo — a estrela encontrou seu equilíbrio como uma estrela menor e mais quente',
  },
  'caption.return': {
    ko: '에너지가 처음으로 돌아가면 별도 밀려 나가 처음 크기에서 다시 멈춘다',
    en: 'When the energy returns to where it began, the star is pushed back out and stops at its original size',
    ja: 'エネルギーがもとに戻ると、星は押し戻されて広がり、もとの大きさで再び止まる',
    zh: '能量回到最初的水平时，恒星被推回向外，重新停在原来的大小',
    ar: 'حين تعود الطاقة إلى ما بدأت به يُدفع النجم إلى الخارج من جديد ويتوقف عند حجمه الأصلي',
    es: 'Cuando la energía vuelve a su valor inicial, la estrella es empujada de nuevo hacia fuera y se detiene en su tamaño original',
    fr: 'Quand l’énergie revient à sa valeur de départ, l’étoile est repoussée vers l’extérieur et s’arrête à sa taille d’origine',
    hi: 'ऊर्जा जब शुरुआती स्तर पर लौटती है, तो तारा फिर बाहर की ओर धकेला जाता है और अपने मूल आकार पर रुकता है',
    id: 'Saat energi kembali ke nilai awalnya, bintang terdorong keluar lagi dan berhenti pada ukuran semula',
    pt: 'Quando a energia volta ao valor inicial, a estrela é empurrada de novo para fora e para no tamanho original',
  },
} satisfies Record<string, LocalizedText>);

export type StarRadiationGravityBalanceMessageKey = keyof typeof starRadiationGravityBalanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StarRadiationGravityBalanceMessageKey): LocalizedText =>
  starRadiationGravityBalanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StarRadiationGravityBalanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const starRadiationGravityBalanceSchema: BundleSchema = {
  id: STAR_RADIATION_GRAVITY_BALANCE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 에너지가 늘고, 별이 부풀어 멈추고, 줄고, 오그라들어 멈추고, 돌아간다.
  parameters: [],

  stages: [
    {
      id: 'one-star',
      label: text('label.stage'),
      constants: {
        energyCalm: ENERGY_CALM,
        energyHigh: ENERGY_HIGH,
        energyLow: ENERGY_LOW,
        calmRadius: CALM_RADIUS,
        pressureExponent: PRESSURE_EXPONENT,
        arrowPerForce: ARROW_PER_FORCE,
        innerLayer: INNER_LAYER,
        settleSharpness: SETTLE_SHARPNESS,
        coreRadius: CORE_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cross-section', label: text('label.view'), default: true }],

  /** 원판 하나라 세로가 그림 크기를 정한다. 기본 높이로 둔다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 별의 칠이 맨 아래, 그 위에 층 고리, 화살표는 맨 위에 와야
   * 별 안쪽을 향하는 중력 화살표가 칠에 묻히지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 균형 → 에너지 늘림 → 부풂 → 큰 균형 → 에너지 줄임 → 오그라듦 → 작은 균형 →
   * 에너지 되돌림 → 처음 크기로. 바꾸는 단계(`boost` · `cut` · `restore`) 동안 별은 아직 제 크기라
   * 한쪽이 이기는 것이 먼저 보이고, 가라앉는 단계(`swell` · `shrink` · `return`)에서 크기가 따라간다.
   */
  timeline: {
    phases: [
      { id: 'calm', duration: HOLD_CALM, caption: key('caption.calm') },
      { id: 'boost', duration: CHANGE, ease: 'smooth', caption: key('caption.swell') },
      { id: 'swell', duration: SETTLE, caption: key('caption.swell') },
      { id: 'big', duration: HOLD, caption: key('caption.big') },
      { id: 'cut', duration: CHANGE, ease: 'smooth', caption: key('caption.shrink') },
      { id: 'shrink', duration: SETTLE, caption: key('caption.shrink') },
      { id: 'small', duration: HOLD, caption: key('caption.small') },
      { id: 'restore', duration: CHANGE, ease: 'smooth', caption: key('caption.return') },
      { id: 'return', duration: RETURN, caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 균형을 1 초 남짓 보고 곧 에너지가 늘기 시작한다. */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정역학 평형의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: starRadiationGravityBalanceMessages,
};
