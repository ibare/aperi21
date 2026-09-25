// ========================================================================
// ionizing-radiation — 선언
// ========================================================================
// 질문: 빛을 많이 쬐면 분자가 부서질까.
//
// 광자 하나가 분자에게 주는 에너지는 E = hf 하나뿐이고, 몫이 여러 광자에 걸쳐 쌓이지
// 않는다. 그래서 전파 광자는 아무리 쏟아져도 결합을 끊지 못하고, 스펙트럼을 훑어 올라가
// 광자 하나의 에너지가 결합을 끊는 문턱(10 eV 안팎)을 넘는 곳부터 — 자외선 중간부터 —
// 광자 **하나**가 결합 **하나**를 끊는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 금속에서 전자가 튀어나오는 장면은 이웃 `photoelectric-effect` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ionizing-radiation` 와 문자 그대로 일치한다 (C4). */
export const IONIZING_RADIATION_ID = 'ionizing-radiation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 결합을 끊는(이온화하는) 문턱(eV). 원자 · 분자에 따라 다르고 10 eV 안팎이다. */
export const THRESHOLD_EV = 10;
/** 에너지 축의 양 끝(eV) — 긴 전파부터 딱딱한 X선까지. */
export const AXIS_MIN_EV = 1e-9;
export const AXIS_MAX_EV = 1e5;
/**
 * 대역 경계(eV). 파장 1 m · 1 mm · 750 nm · 380 nm · 10 nm 에 해당한다 (E = 1240 / λ[nm]).
 * 대역마다 한 단계씩 이 경계 사이를 훑는다. 문턱은 자외선 한가운데에 있다.
 */
export const MICROWAVE_MIN_EV = 1.24e-6;
export const INFRARED_MIN_EV = 1.24e-3;
export const VISIBLE_MIN_EV = 1.65;
export const ULTRAVIOLET_MIN_EV = 3.26;
export const XRAY_MIN_EV = 124;
/** 파장 ↔ 에너지 환산 hc(eV · nm). 가시광 조각의 빛 색을 파장에서 얻는 데 쓴다. */
export const HC_EV_NM = 1240;

/** 대역마다 광원이 내보내는 광자 수(개/초). 전파가 가장 많다 — 「아무리 쏟아져도」. */
export const RATE_RADIO = 9;
export const RATE_MICROWAVE = 7;
export const RATE_INFRARED = 4;
export const RATE_VISIBLE = 3;
export const RATE_ULTRAVIOLET = 2.5;
/** 문턱을 넘은 뒤(자외선 윗부분 · X선)의 광자 수 — 하나하나를 셀 수 있게 드물게. */
export const RATE_IONIZING = 1.25;

/** 광자가 나는 빠르기(월드/초). 빛의 속력이 아니라 눈으로 따라갈 수 있는 빠르기다. */
export const PHOTON_SPEED = 5.5;
/**
 * 물결 간격 — 문턱 에너지 광자의 간격(월드)과 압축 지수. 간격 = 이 값 × (문턱 / E)^지수.
 * 파장은 14 자릿수에 걸치므로 그대로 그릴 수 없다. 지수로 눌러 「훑어 올라갈수록 촘촘해진다」 만
 * 남긴다 — 화면에 알리지 않는다 (NOTES (b)).
 */
export const WAVE_SPACING_AT_THRESHOLD = 0.12;
export const WAVE_COMPRESSION = 0.1;
/**
 * 문턱 에너지를 받은 결합이 늘어나는 폭(월드). 문턱 아래 광자는 E / 문턱 에 **선형으로** 비례해
 * 흔든다 — 전파 광자는 1e-9 배라 흔들림이 보이지 않는 것이 참이다.
 */
export const SHAKE_AT_THRESHOLD = 0.18;
/** 흔들림이 잦아드는 시간 상수(초) · 흔들리는 진동수(Hz). 몫은 쌓이지 않고 흩어진다. */
export const SHAKE_DECAY = 0.45;
export const SHAKE_HZ = 5;
/** 끊어진 두 원자가 벌어지는 거리(월드) · 멈추기까지의 시간 상수(초). */
export const FRAGMENT_GAP = 0.2;
export const FRAGMENT_SETTLE = 0.3;
/** 광자 일정 · 겨냥 분자 · 분자 기울기를 뽑는 시드. */
export const SEED = 11;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 에너지 축 — 가로 양 끝 · 높이. */
export const AXIS = { x0: -4.3, x1: 4.3, y: 2.2 } as const;
/** 광원(광자가 떠나는 자리). */
export const SOURCE = { x: -4.1, y: -0.05 } as const;
/** 분자 격자 — 열 · 행 · 첫 분자 자리 · 간격 · 둘째 행 어긋남. */
export const MOLECULES = { cols: 3, rows: 2, x0: 1.05, y0: 0.5, dx: 1.15, dy: -1.1, stagger: 0.45 } as const;
/** 결합 길이(두 원자 중심 사이, 월드). */
export const BOND_LENGTH = 0.36;

/**
 * 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다.
 */
export const CAPTION_BAND = 0.5;

/** 프레이밍은 고정 — 분자 아래 캡션 띠부터 에너지 축 위 문턱 이름표까지. */
export const SCENE_BOUNDS = {
  minX: -4.7,
  maxX: 4.7,
  minY: MOLECULES.y0 + MOLECULES.dy - 0.45 - CAPTION_BAND,
  maxY: 3.05,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const PHASE_APPEAR = 0.6;
export const PHASE_RADIO = 3.2;
export const PHASE_MICROWAVE = 2.2;
export const PHASE_INFRARED = 2.4;
export const PHASE_VISIBLE = 1.6;
export const PHASE_ULTRAVIOLET = 2.2;
export const PHASE_IONIZING = 2.4;
export const PHASE_XRAY = 2.4;
export const PHASE_HOLD = 1.8;
export const PHASE_FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ionizingRadiationMessages = Object.freeze({
  'label.title': {
    ko: '이온화 복사',
    en: 'Ionizing radiation',
    ja: '電離放射線',
    zh: '电离辐射',
    ar: 'الإشعاع المؤيِّن',
    es: 'Radiación ionizante',
    fr: 'Rayonnement ionisant',
    hi: 'आयनकारी विकिरण',
    id: 'Radiasi pengion',
    pt: 'Radiação ionizante',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '결합을 끊을 만큼 큰 광자 에너지',
    en: 'Photon energy large enough to break bonds',
    ja: '結合を切るほど大きな光子のエネルギー',
    zh: '大到足以打断化学键的光子能量',
    ar: 'طاقة فوتون كبيرة بما يكفي لكسر الروابط',
    es: 'Energía de fotón suficiente para romper enlaces',
    fr: 'Une énergie de photon assez grande pour rompre des liaisons',
    hi: 'बंधों को तोड़ने लायक बड़ी फोटॉन ऊर्जा',
    id: 'Energi foton yang cukup besar untuk memutus ikatan',
    pt: 'Energia de fóton grande o bastante para romper ligações',
  },
  'label.stage': {
    ko: '분자 결합',
    en: 'Molecular bonds',
    ja: '分子の結合',
    zh: '分子中的化学键',
    ar: 'الروابط الجزيئية',
    es: 'Enlaces moleculares',
    fr: 'Liaisons moléculaires',
    hi: 'आण्विक बंध',
    id: 'Ikatan molekul',
    pt: 'Ligações moleculares',
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
  /** 결합을 끊는 문턱. 값은 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.threshold': {
    ko: '결합을 끊는 문턱 {e} eV',
    en: 'bond-breaking threshold {e} eV',
    ja: '結合を切るしきい値 {e} eV',
    zh: '断键阈值 {e} eV',
    ar: 'عتبة كسر الرابطة {e} eV',
    es: 'umbral de ruptura de enlace {e} eV',
    fr: 'seuil de rupture de liaison {e} eV',
    hi: 'बंध तोड़ने की देहली {e} eV',
    id: 'ambang pemutusan ikatan {e} eV',
    pt: 'limiar de ruptura de ligação {e} eV',
  },
  /** 에너지 축 이름. */
  'label.axis': {
    ko: '광자 하나의 에너지',
    en: 'energy of one photon',
    ja: '光子1個のエネルギー',
    zh: '单个光子的能量',
    ar: 'طاقة فوتون واحد',
    es: 'energía de un fotón',
    fr: 'énergie d’un photon',
    hi: 'एक फोटॉन की ऊर्जा',
    id: 'energi satu foton',
    pt: 'energia de um fóton',
  },
  'band.radio': {
    ko: '전파',
    en: 'radio',
    ja: '電波',
    zh: '无线电波',
    ar: 'موجات الراديو',
    es: 'radio',
    fr: 'radio',
    hi: 'रेडियो',
    id: 'radio',
    pt: 'rádio',
  },
  'band.microwave': {
    ko: '마이크로파',
    en: 'microwave',
    ja: 'マイクロ波',
    zh: '微波',
    ar: 'الموجات الدقيقة',
    es: 'microondas',
    fr: 'micro-ondes',
    hi: 'सूक्ष्मतरंग',
    id: 'gelombang mikro',
    pt: 'micro-ondas',
  },
  'band.infrared': {
    ko: '적외선',
    en: 'infrared',
    ja: '赤外線',
    zh: '红外线',
    ar: 'الأشعة تحت الحمراء',
    es: 'infrarrojo',
    fr: 'infrarouge',
    hi: 'अवरक्त',
    id: 'inframerah',
    pt: 'infravermelho',
  },
  'band.visible': {
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
  'band.ultraviolet': {
    ko: '자외선',
    en: 'ultraviolet',
    ja: '紫外線',
    zh: '紫外线',
    ar: 'الأشعة فوق البنفسجية',
    es: 'ultravioleta',
    fr: 'ultraviolet',
    hi: 'पराबैंगनी',
    id: 'ultraungu',
    pt: 'ultravioleta',
  },
  'band.xray': {
    ko: 'X선',
    en: 'X-ray',
    ja: 'X線',
    zh: 'X射线',
    ar: 'الأشعة السينية',
    es: 'rayos X',
    fr: 'rayons X',
    hi: 'X-किरणें',
    id: 'sinar-X',
    pt: 'raios X',
  },
  /** 로그 눈금 이름표 — 지수를 코드로 조립하지 않고 보일 문자열을 통째로 둔다. */
  'tick.milliEv': {
    ko: '1 meV',
    en: '1 meV',
    ja: '1 meV',
    zh: '1 meV',
    ar: '1 meV',
    es: '1 meV',
    fr: '1 meV',
    hi: '1 meV',
    id: '1 meV',
    pt: '1 meV',
  },
  'tick.ev': {
    ko: '1 eV',
    en: '1 eV',
    ja: '1 eV',
    zh: '1 eV',
    ar: '1 eV',
    es: '1 eV',
    fr: '1 eV',
    hi: '1 eV',
    id: '1 eV',
    pt: '1 eV',
  },
  'tick.kiloEv': {
    ko: '1 keV',
    en: '1 keV',
    ja: '1 keV',
    zh: '1 keV',
    ar: '1 keV',
    es: '1 keV',
    fr: '1 keV',
    hi: '1 keV',
    id: '1 keV',
    pt: '1 keV',
  },
  'caption.appear': {
    ko: '결합으로 이어진 분자 여섯이 광원 앞에 놓인다',
    en: 'Six bonded molecules sit in front of the light source',
    ja: '結合でつながった6個の分子が光源の前に置かれる',
    zh: '六个由化学键连接的分子摆在光源前',
    ar: 'ستة جزيئات مترابطة تقف أمام مصدر الضوء',
    es: 'Seis moléculas enlazadas están frente a la fuente de luz',
    fr: 'Six molécules liées se tiennent devant la source lumineuse',
    hi: 'बंधों से जुड़े छह अणु प्रकाश स्रोत के सामने रखे हैं',
    id: 'Enam molekul berikatan berada di depan sumber cahaya',
    pt: 'Seis moléculas ligadas estão diante da fonte de luz',
  },
  'caption.radio': {
    ko: '전파 광자가 쉴 새 없이 쏟아져도 분자는 꿈쩍하지 않는다',
    en: 'Radio photons pour in nonstop, yet the molecules do not even stir',
    ja: '電波の光子が絶え間なく降り注いでも、分子はびくともしない',
    zh: '无线电波光子源源不断地涌来，分子却纹丝不动',
    ar: 'تنهمر فوتونات الراديو بلا توقف، ومع ذلك لا تتحرك الجزيئات قيد أنملة',
    es: 'Los fotones de radio llegan sin parar, pero las moléculas ni se inmutan',
    fr: 'Les photons radio affluent sans arrêt, et pourtant les molécules ne bougent même pas',
    hi: 'रेडियो फोटॉन लगातार बरसते हैं, फिर भी अणु ज़रा भी नहीं हिलते',
    id: 'Foton radio terus mengalir tanpa henti, namun molekul sama sekali tidak bergeming',
    pt: 'Fótons de rádio chegam sem parar, mas as moléculas nem se mexem',
  },
  'caption.microwave': {
    ko: '마이크로파 광자가 수없이 닿아도 결합은 그대로다',
    en: 'Countless microwave photons land, and every bond holds',
    ja: '数えきれないマイクロ波の光子が当たっても、結合はすべてそのままだ',
    zh: '无数微波光子落下，每一个键都完好无损',
    ar: 'تصل فوتونات موجات دقيقة لا تُحصى، وتصمد كل رابطة',
    es: 'Llegan incontables fotones de microondas, y todos los enlaces resisten',
    fr: 'D’innombrables photons micro-ondes arrivent, et chaque liaison tient',
    hi: 'अनगिनत सूक्ष्मतरंग फोटॉन आ पड़ते हैं, और हर बंध टिका रहता है',
    id: 'Foton gelombang mikro yang tak terhitung datang, dan setiap ikatan tetap utuh',
    pt: 'Incontáveis fótons de micro-ondas chegam, e todas as ligações resistem',
  },
  'caption.infrared': {
    ko: '적외선 광자가 닿아도 분자는 거의 흔들리지 않는다',
    en: 'Infrared photons land, and the molecules barely stir',
    ja: '赤外線の光子が当たっても、分子はほとんど揺れない',
    zh: '红外线光子落下，分子几乎不动',
    ar: 'تصل فوتونات الأشعة تحت الحمراء، وبالكاد تتحرك الجزيئات',
    es: 'Llegan fotones infrarrojos, y las moléculas apenas se mueven',
    fr: 'Des photons infrarouges arrivent, et les molécules bougent à peine',
    hi: 'अवरक्त फोटॉन आ पड़ते हैं, और अणु मुश्किल से हिलते हैं',
    id: 'Foton inframerah datang, dan molekul nyaris tidak bergerak',
    pt: 'Fótons infravermelhos chegam, e as moléculas mal se mexem',
  },
  'caption.visible': {
    ko: '가시광 광자는 분자를 살짝 흔들 뿐 결합을 끊지 못한다',
    en: 'Visible photons give a molecule a small shake but cannot break a bond',
    ja: '可視光の光子は分子を少し揺らすだけで、結合を切ることはできない',
    zh: '可见光光子只让分子轻轻晃动，却打不断化学键',
    ar: 'تهزّ فوتونات الضوء المرئي الجزيء هزة خفيفة لكنها لا تستطيع كسر رابطة',
    es: 'Los fotones visibles sacuden un poco una molécula, pero no pueden romper un enlace',
    fr: 'Les photons visibles secouent un peu une molécule mais ne peuvent pas rompre une liaison',
    hi: 'दृश्य फोटॉन अणु को हल्का-सा हिलाते हैं, पर बंध नहीं तोड़ पाते',
    id: 'Foton tampak sedikit mengguncang molekul tetapi tidak dapat memutus ikatan',
    pt: 'Fótons visíveis dão uma leve sacudida na molécula, mas não conseguem romper uma ligação',
  },
  'caption.ultraviolet': {
    ko: '문턱 아래의 자외선 광자는 결합을 크게 흔들지만 끊지 못한다',
    en: 'Ultraviolet photons below the threshold stretch a bond hard, yet it holds',
    ja: 'しきい値より下の紫外線の光子は結合を大きく引き伸ばすが、結合は持ちこたえる',
    zh: '低于阈值的紫外线光子把化学键拉得很长，但键依然没断',
    ar: 'فوتونات الأشعة فوق البنفسجية التي تحت العتبة تشدّ الرابطة بقوة، ومع ذلك تصمد',
    es: 'Los fotones ultravioleta por debajo del umbral estiran mucho un enlace, pero este resiste',
    fr: 'Les photons ultraviolets sous le seuil étirent fortement une liaison, mais elle tient',
    hi: 'देहली से नीचे के पराबैंगनी फोटॉन बंध को ज़ोर से खींचते हैं, फिर भी वह टिका रहता है',
    id: 'Foton ultraungu di bawah ambang meregangkan ikatan dengan kuat, namun ikatan tetap bertahan',
    pt: 'Fótons ultravioleta abaixo do limiar esticam muito uma ligação, mas ela resiste',
  },
  'caption.ionizing': {
    ko: '문턱을 넘은 광자는 하나만 닿아도 결합이 끊어진다',
    en: 'Past the threshold, a single photon is enough to break a bond',
    ja: 'しきい値を超えると、光子1個だけで結合が切れる',
    zh: '越过阈值后，一个光子就足以打断一个键',
    ar: 'بعد تجاوز العتبة، يكفي فوتون واحد لكسر رابطة',
    es: 'Pasado el umbral, basta un solo fotón para romper un enlace',
    fr: 'Passé le seuil, un seul photon suffit à rompre une liaison',
    hi: 'देहली पार होते ही एक ही फोटॉन बंध तोड़ने के लिए काफ़ी है',
    id: 'Melewati ambang, satu foton saja cukup untuk memutus ikatan',
    pt: 'Passado o limiar, um único fóton basta para romper uma ligação',
  },
  'caption.xray': {
    ko: 'X선 광자도 하나가 결합 하나를 끊는다',
    en: 'X-ray photons too break one bond apiece',
    ja: 'X線の光子も、1個で結合を1本ずつ切る',
    zh: 'X射线光子也是一个光子打断一个键',
    ar: 'وفوتونات الأشعة السينية أيضًا يكسر كل منها رابطة واحدة',
    es: 'Los fotones de rayos X también rompen un enlace cada uno',
    fr: 'Les photons X aussi rompent chacun une liaison',
    hi: 'X-किरण फोटॉन भी हर एक, एक बंध तोड़ता है',
    id: 'Foton sinar-X juga masing-masing memutus satu ikatan',
    pt: 'Fótons de raios X também rompem uma ligação cada',
  },
} satisfies Record<string, LocalizedText>);

export type IonizingRadiationMessageKey = keyof typeof ionizingRadiationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IonizingRadiationMessageKey): LocalizedText => ionizingRadiationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IonizingRadiationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const ionizingRadiationSchema: BundleSchema = {
  id: IONIZING_RADIATION_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 스펙트럼 전체를 훑어 문턱의 양쪽을 모두 보인다.
  parameters: [],

  stages: [
    {
      id: 'bonds',
      label: text('label.stage'),
      constants: {
        thresholdEv: THRESHOLD_EV,
        axisMinEv: AXIS_MIN_EV,
        axisMaxEv: AXIS_MAX_EV,
        microwaveMinEv: MICROWAVE_MIN_EV,
        infraredMinEv: INFRARED_MIN_EV,
        visibleMinEv: VISIBLE_MIN_EV,
        ultravioletMinEv: ULTRAVIOLET_MIN_EV,
        xrayMinEv: XRAY_MIN_EV,
        hcEvNm: HC_EV_NM,
        rateRadio: RATE_RADIO,
        rateMicrowave: RATE_MICROWAVE,
        rateInfrared: RATE_INFRARED,
        rateVisible: RATE_VISIBLE,
        rateUltraviolet: RATE_ULTRAVIOLET,
        rateIonizing: RATE_IONIZING,
        photonSpeed: PHOTON_SPEED,
        waveSpacingAtThreshold: WAVE_SPACING_AT_THRESHOLD,
        waveCompression: WAVE_COMPRESSION,
        shakeAtThreshold: SHAKE_AT_THRESHOLD,
        shakeDecay: SHAKE_DECAY,
        shakeHz: SHAKE_HZ,
        fragmentGap: FRAGMENT_GAP,
        fragmentSettle: FRAGMENT_SETTLE,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 축 한 줄 · 분자 두 줄 · 캡션 한 줄. 세로가 비싸다 (S-piece). 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 340 },

  /** 겹침이 판정 장치다 — 문턱 띠 위에 축 · 표지가, 결합선 위에 원자가 놓여야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 전파 → 마이크로파 → 적외선 → 가시광 → 자외선(문턱 아래) → 자외선(문턱 위)
   * → X선 → 머묾 → 흐려짐.
   *
   * 대역 단계마다 광자 에너지 표지가 그 대역의 두 경계 사이를 훑는다. 단계 id 에서 대역 경계 ·
   * 광자 수로 가는 짝은 physics 의 `SWEEP` 이 안다 — 단계에 값을 실을 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: PHASE_APPEAR, caption: key('caption.appear') },
      { id: 'radio', duration: PHASE_RADIO, caption: key('caption.radio') },
      { id: 'microwave', duration: PHASE_MICROWAVE, caption: key('caption.microwave') },
      { id: 'infrared', duration: PHASE_INFRARED, caption: key('caption.infrared') },
      { id: 'visible', duration: PHASE_VISIBLE, caption: key('caption.visible') },
      { id: 'ultraviolet', duration: PHASE_ULTRAVIOLET, caption: key('caption.ultraviolet') },
      { id: 'ionizing', duration: PHASE_IONIZING, caption: key('caption.ionizing') },
      { id: 'xray', duration: PHASE_XRAY, caption: key('caption.xray') },
      { id: 'hold', duration: PHASE_HOLD, caption: key('caption.xray') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.xray') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 전파 광자가 이미 분자에 닿고 있는 자리에서 연다.
   * 0 이면 분자가 나타나는 중이고 광자는 아직 광원을 떠나지 않았다.
   */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — E = hf 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: ionizingRadiationMessages,
};
