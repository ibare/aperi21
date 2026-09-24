// ========================================================================
// velocity-selector — 선언
// ========================================================================
// 질문: 전기장과 자기장이 서로 직각으로 겹친 곳에 여러 속력의 전하를 쏘면 어떻게 되는가.
//
// 답: 전기력 qE 는 속력과 상관없이 같고, 자기력 qvB 는 속력에 비례한다. 두 힘이 맞서는
// 방향으로 장을 겹치면 **v = E/B 인 전하만** 힘의 합이 0 이라 곧게 지나 출구 슬릿을
// 빠져나온다. 느린 전하는 전기력 쪽으로, 빠른 전하는 자기력 쪽으로 휘어 판에 닿는다.
//
// 동사: 딱 맞는 속력만 **곧게 지나간다** — 나머지는 휜다.
//
// 이웃 `lorentz-force` 는 한 순간 힘의 방향을, `charged-particle-in-magnetic-field` 는 자기장
// 하나가 만드는 원운동을 말한다. 여기서는 두 힘의 **크기 경쟁**과 그것이 속력을 골라내는 일만 다룬다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:velocity-selector` 와 문자 그대로 일치한다 (C4). */
export const VELOCITY_SELECTOR_ID = 'velocity-selector';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 길이는 임의 단위, 원점은 입구 슬릿. 전하는 +x 로 날아간다.
// 위 판이 + · 아래 판이 − 라 E 는 아래(−y), B 는 종이 안(⊗)이다.
// ------------------------------------------------------------------------

/** 전하량(임의 단위, 양). 두 힘 화살표 길이에 곱해진다. */
export const CHARGE = 1;
/** 전하량 / 질량 — 자기장 속에서 도는 빠르기 ω = (q/m)·B. */
export const CHARGE_TO_MASS = 1;
/** 전기장 세기(임의 단위). 방향은 아래(+ 판 → − 판)로 고정이다. */
export const FIELD_E = 2;
/** 자기장 세기(임의 단위). 방향은 종이 안(⊗)으로 고정이다. */
export const FIELD_B = 1;

/**
 * 느린 · 빠른 전하의 속력(월드 단위/초). 세 번째 전하는 선언하지 않는다 — 그 속력은
 * `fieldE / fieldB` 로 정해진다(physics `RUNS`). 느린 것은 E/B 보다 작고 빠른 것은 커야
 * 캡션이 참이다 — 이 관계는 선언할 자리가 없다(NOTES c, G143).
 */
export const SPEED_SLOW = 1.2;
export const SPEED_FAST = 3;

/** 판 길이 — 교차장 영역의 가로(월드). 입구 슬릿이 x = 0, 출구 슬릿이 x = 판 길이. */
export const PLATE_LENGTH = 6;
/** 판 사이 간격의 반(월드). 전하가 이만큼 벗어나면 판에 닿는다. */
export const PLATE_HALF_GAP = 1.2;
/** 출구 슬릿 폭의 반(월드). 이 안으로 오는 전하만 빠져나간다. */
export const SLIT_HALF = 0.14;
/** 전하가 떠나는 자리(월드 x). 입구 슬릿 왼쪽, 장이 없는 곳이다. */
export const SOURCE_X = -1.8;
/** 빠져나온 전하가 닿는 검출기 자리(월드 x). */
export const DETECTOR_X = 8;

/** 힘 1 이 차지하는 월드 길이 — 두 힘 화살표 길이 배율. 상한이 없어 비례가 끊기지 않는다. */
export const FORCE_SCALE = 0.3;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽 발사구부터 오른쪽 검출기까지, 위아래는 판 바깥 이름표와 아래 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -2.4, maxX: 8.6, minY: -2.55, maxY: 1.85 } as const;
/** 캡션을 세우는 월드 자리 — 아래 판 밑, 가로 가운데. */
export const CAPTION_AT = [3.1, -2.1] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const velocitySelectorMessages = Object.freeze({
  'label.title': {
    ko: '속도 선택기',
    en: 'Velocity selector',
    ja: '速度選択器',
    zh: '速度选择器',
    ar: 'مُنتقي السرعة',
    es: 'Selector de velocidades',
    fr: 'Sélecteur de vitesse',
    hi: 'वेग चयनक',
    id: 'Pemilih kecepatan',
    pt: 'Seletor de velocidades',
  },
  'label.operation': {
    ko: '전기력과 자기력의 균형',
    en: 'Balancing the electric and magnetic forces',
    ja: '電気力と磁気力のつり合い',
    zh: '电场力与磁场力的平衡',
    ar: 'موازنة القوتين الكهربائية والمغناطيسية',
    es: 'Equilibrio entre las fuerzas eléctrica y magnética',
    fr: 'Équilibre des forces électrique et magnétique',
    hi: 'विद्युत बल और चुंबकीय बल का संतुलन',
    id: 'Menyeimbangkan gaya listrik dan gaya magnet',
    pt: 'Equilíbrio entre as forças elétrica e magnética',
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

  /** 장 · 힘 · 판 부호. 물리 기호라 두 언어가 같다 (C1 판정 3). */
  'label.fieldE': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.fieldB': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.forceE': {
    ko: 'qE',
    en: 'qE',
    ja: 'qE',
    zh: 'qE',
    ar: 'qE',
    es: 'qE',
    fr: 'qE',
    hi: 'qE',
    id: 'qE',
    pt: 'qE',
  },
  'label.forceB': {
    ko: 'qvB',
    en: 'qvB',
    ja: 'qvB',
    zh: 'qvB',
    ar: 'qvB',
    es: 'qvB',
    fr: 'qvB',
    hi: 'qvB',
    id: 'qvB',
    pt: 'qvB',
  },
  'label.plus': {
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
  'label.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
  },

  /** 지나간 전하 궤적 끝의 이름표. */
  'label.slow': {
    ko: '느린 전하',
    en: 'slower',
    ja: '遅い電荷',
    zh: '较慢的电荷',
    ar: 'الشحنة الأبطأ',
    es: 'más lenta',
    fr: 'plus lente',
    hi: 'धीमा आवेश',
    id: 'lebih lambat',
    pt: 'mais lenta',
  },
  'label.fast': {
    ko: '빠른 전하',
    en: 'faster',
    ja: '速い電荷',
    zh: '较快的电荷',
    ar: 'الشحنة الأسرع',
    es: 'más rápida',
    fr: 'plus rapide',
    hi: 'तेज़ आवेश',
    id: 'lebih cepat',
    pt: 'mais rápida',
  },
  'label.match': {
    ko: '두 힘이 맞는 속력',
    en: 'forces balance',
    ja: '力がつり合う',
    zh: '两力平衡',
    ar: 'القوتان متوازنتان',
    es: 'fuerzas equilibradas',
    fr: 'forces équilibrées',
    hi: 'बल संतुलित',
    id: 'gaya seimbang',
    pt: 'forças equilibradas',
  },

  'caption.slow': {
    ko: '느린 전하 — 자기력이 전기력보다 약해, 전기력 쪽으로 휘어 아래 판에 닿는다.',
    en: 'A slower charge: the magnetic push is weaker than the electric one, so it bends toward the electric force and hits the lower plate.',
    ja: '遅い電荷：磁気力が電気力より弱いため、電気力の側に曲がって下の極板に当たる。',
    zh: '较慢的电荷：磁场力比电场力弱，于是向电场力一侧偏转，打在下极板上。',
    ar: 'شحنة أبطأ: الدفع المغناطيسي أضعف من الكهربائي، فتنحني نحو القوة الكهربائية وتصطدم باللوح السفلي.',
    es: 'Una carga más lenta: el empuje magnético es más débil que el eléctrico, así que se curva hacia la fuerza eléctrica y choca con la placa inferior.',
    fr: 'Une charge plus lente : la poussée magnétique est plus faible que la poussée électrique, elle s’incurve donc vers la force électrique et heurte la plaque inférieure.',
    hi: 'धीमा आवेश: चुंबकीय धक्का विद्युत धक्के से कमज़ोर है, इसलिए वह विद्युत बल की ओर मुड़कर निचली प्लेट से टकराता है।',
    id: 'Muatan yang lebih lambat: dorongan magnet lebih lemah daripada dorongan listrik, sehingga ia membelok ke arah gaya listrik dan menumbuk pelat bawah.',
    pt: 'Uma carga mais lenta: o empurrão magnético é mais fraco que o elétrico, então ela se curva para o lado da força elétrica e atinge a placa inferior.',
  },
  'caption.fast': {
    ko: '빠른 전하 — 자기력이 전기력보다 세서, 자기력 쪽으로 휘어 위 판에 닿는다.',
    en: 'A faster charge: the magnetic push beats the electric one, so it bends toward the magnetic force and hits the upper plate.',
    ja: '速い電荷：磁気力が電気力に勝るため、磁気力の側に曲がって上の極板に当たる。',
    zh: '较快的电荷：磁场力胜过电场力，于是向磁场力一侧偏转，打在上极板上。',
    ar: 'شحنة أسرع: الدفع المغناطيسي يغلب الكهربائي، فتنحني نحو القوة المغناطيسية وتصطدم باللوح العلوي.',
    es: 'Una carga más rápida: el empuje magnético supera al eléctrico, así que se curva hacia la fuerza magnética y choca con la placa superior.',
    fr: 'Une charge plus rapide : la poussée magnétique l’emporte sur la poussée électrique, elle s’incurve donc vers la force magnétique et heurte la plaque supérieure.',
    hi: 'तेज़ आवेश: चुंबकीय धक्का विद्युत धक्के पर भारी पड़ता है, इसलिए वह चुंबकीय बल की ओर मुड़कर ऊपरी प्लेट से टकराता है।',
    id: 'Muatan yang lebih cepat: dorongan magnet mengalahkan dorongan listrik, sehingga ia membelok ke arah gaya magnet dan menumbuk pelat atas.',
    pt: 'Uma carga mais rápida: o empurrão magnético supera o elétrico, então ela se curva para o lado da força magnética e atinge a placa superior.',
  },
  'caption.match': {
    ko: '두 힘이 똑같이 맞서는 속력 — 합이 0 이라 곧게 날아가 출구 슬릿을 빠져나온다.',
    en: 'At the speed where the two forces cancel, the charge flies straight and out through the exit slit.',
    ja: '二つの力が打ち消し合う速さでは、電荷はまっすぐ飛んで出口のスリットから抜け出る。',
    zh: '在两个力相互抵消的速度下，电荷沿直线飞行，从出口狭缝穿出。',
    ar: 'عند السرعة التي تُلغي فيها القوتان إحداهما الأخرى، تطير الشحنة في خط مستقيم وتخرج من شق الخروج.',
    es: 'A la rapidez en que las dos fuerzas se anulan, la carga vuela en línea recta y sale por la rendija de salida.',
    fr: 'À la vitesse où les deux forces s’annulent, la charge file tout droit et ressort par la fente de sortie.',
    hi: 'जिस चाल पर दोनों बल एक-दूसरे को निरस्त कर देते हैं, उस पर आवेश सीधा उड़ता है और निकास झिरी से बाहर निकल जाता है।',
    id: 'Pada kelajuan saat kedua gaya saling meniadakan, muatan melaju lurus dan keluar melalui celah keluaran.',
    pt: 'Na velocidade em que as duas forças se anulam, a carga voa em linha reta e sai pela fenda de saída.',
  },
  'caption.hold': {
    ko: '세 전하 가운데 곧게 지나간 것은 두 힘이 맞는 속력 하나뿐이다.',
    en: 'Of the three charges, only the one at the balancing speed made it straight through.',
    ja: '三つの電荷のうち、まっすぐ通り抜けたのは力がつり合う速さのものだけだ。',
    zh: '三个电荷中，只有速度使两力平衡的那个沿直线穿了过去。',
    ar: 'من بين الشحنات الثلاث، لم تعبر في خط مستقيم إلا الشحنة ذات سرعة التوازن.',
    es: 'De las tres cargas, solo la que iba a la rapidez de equilibrio pasó en línea recta.',
    fr: 'Des trois charges, seule celle à la vitesse d’équilibre est passée tout droit.',
    hi: 'तीनों आवेशों में से केवल संतुलन वाली चाल का आवेश सीधा पार निकल पाया।',
    id: 'Dari ketiga muatan, hanya yang berkelajuan seimbang yang lolos lurus.',
    pt: 'Das três cargas, só a que estava na velocidade de equilíbrio passou em linha reta.',
  },
} satisfies Record<string, LocalizedText>);

export type VelocitySelectorMessageKey = keyof typeof velocitySelectorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: VelocitySelectorMessageKey): LocalizedText => velocitySelectorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VelocitySelectorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const velocitySelectorSchema: BundleSchema = {
  id: VELOCITY_SELECTOR_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        charge: CHARGE,
        chargeToMass: CHARGE_TO_MASS,
        fieldE: FIELD_E,
        fieldB: FIELD_B,
        speedSlow: SPEED_SLOW,
        speedFast: SPEED_FAST,
        plateLength: PLATE_LENGTH,
        plateHalfGap: PLATE_HALF_GAP,
        slitHalf: SLIT_HALF,
        sourceX: SOURCE_X,
        detectorX: DETECTOR_X,
        forceScale: FORCE_SCALE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 발사구 · 판 · 검출기가 한 줄. 세로는 판 간격과 캡션 한두 줄이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 장 무늬 · 판 · 지난 궤적 · 지금 궤적 · 힘 화살표 · 전하 · 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 느린 전하가 이미 장 속에서 휘고 있다 (S-piece). */
  startAt: 2.6,

  /**
   * 한 주기 17 초.
   *
   * - `appear` — 장치만 있다. 앞 주기의 궤적이 물러난 뒤 한 박자.
   * - `slow` · `fast` · `match` — 그 속력의 전하 하나가 발사구를 떠나 판 사이를 지난다.
   *   진행도 × 단계 길이가 발사 뒤 흐른 시간이다(`ease` 없음). 판에 닿으면 그 자리에 멈춘다.
   *   단계 길이는 가장 긴 비행(맞는 전하가 검출기까지)보다 길게 잡았다 — 비행 시간이 속력 상수를
   *   따라가지 않는다(NOTES c, G13).
   * - `hold` — 세 궤적이 한 화면에 남는다.
   * - `fade` — 궤적이 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4 },
      { id: 'slow', duration: 4.4, caption: key('caption.slow') },
      { id: 'fast', duration: 3.2, caption: key('caption.fast') },
      { id: 'match', duration: 5.4, caption: key('caption.match') },
      { id: 'hold', duration: 3, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 아래 판 밑 가운데 — 장치가 가로로 길어 오른쪽에 빈 자리가 없다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'center',
    fontSize: 15,
    wrapWidth: 560,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본). 잴 것이 거리가 아니라 휘는 쪽이다.

  messages: velocitySelectorMessages,
};
