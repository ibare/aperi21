// ========================================================================
// ionizing-radiation — 선언
// ========================================================================
// 질문: 이온화 방사선은 왜 따로 이름을 얻을 만큼 해로운가.
//
// 물 분자 하나에서 전자를 떼어 내려면 12.6 eV 가 든다. 그 아래 자외선 광자는 물 분자에 닿아도
// 이온을 하나도 만들지 못한다. X선 광자(1 keV)는 문턱의 수십 배라, 하나가 전자 하나를 떼어 내고
// 그 전자가 제 길을 따라 물 분자를 줄줄이 이온화한다 — 광자 **하나**가 이온 **수십 개**로 번진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다. 이웃과 가른 것:
//   photon-bond-threshold  광자 하나가 결합 **하나**를 끊는 문턱 (스펙트럼을 훑는다)
//   photoelectric-effect   금속 표면에서 전자가 **나오느냐** (세기 대 진동수)
//   이 조각                광자 하나가 떼어 낸 전자가 이온을 **수십 개** 남기는 것
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ionizing-radiation` 와 문자 그대로 일치한다 (C4). */
export const IONIZING_RADIATION_ID = 'ionizing-radiation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 물 분자 하나의 이온화 에너지(eV) — 기체 분자 값. 액체 물은 약 11 eV 다 (NOTES (b)). */
export const IONIZATION_EV = 12.6;
/** 문턱 아래 자외선 광자의 에너지(eV). 물이 흡수하는 자외선(약 7 eV 위)이면서 문턱 아래다. */
export const UV_EV = 8;
/** X선 광자의 에너지(keV). */
export const XRAY_KEV = 1;
/**
 * X선 광자 하나가 남기는 이온 수 — 전자를 떼어 낸 첫 분자를 **포함**한다. 물 분자에서 이온 하나를
 * 만드는 데 평균 약 30 eV(W 값)가 들어 1 keV / 30 eV ≈ 33 이다. 이 관계는 선언할 자리가 없다
 * (장부 G143) — 화면의 `+` 수와 캡션의 수가 모두 이 값 하나를 읽는다.
 */
export const ION_COUNT = 33;
/** 물 분자 흩뿌림 · 전자 궤적을 뽑는 시드. 주기와 무관하다 — 매 주기 같은 길이다. */
export const SEED = 5;

/** 광자가 나는 빠르기는 단계 길이가 정한다. 물결 간격(월드) — 가시광 밖이라 간격만 다르다(압축, NOTES (b)). */
export const UV_WAVE = 0.5;
export const XRAY_WAVE = 0.14;
/** 광자 물결 뭉치의 길이(월드) · 흔들림 폭(월드). */
export const PACKET_LENGTH = 1.5;
export const PACKET_AMPLITUDE = 0.16;

/** 광자가 들어오는 x(월드) — 경계 왼쪽 끝. 두 광자 모두 가로로 날아 제 표적에 닿는다. */
export const PHOTON_START_X = -6.2;
/** 자외선 광자의 표적 분자 · X선 광자의 표적 분자(첫 이온) 자리(월드). */
export const UV_TARGET_X = -1.6;
export const UV_TARGET_Y = 1.3;
export const XRAY_TARGET_X = -3.4;
export const XRAY_TARGET_Y = -0.9;

/**
 * 전자 궤적 — 이온화 자리 사이 걸음 길이(월드)의 처음 · 끝. 끝으로 갈수록 짧다: 전자가 느려질수록
 * 같은 길이에서 더 자주 이온화한다. 걸음마다 방향이 최대 `turnMax`(라디안)까지 꺾이고, 꺾임은
 * 끝으로 갈수록 커진다(느린 전자일수록 잘 휜다). 처음 방향 `startAngle`(라디안).
 */
export const STEP_START = 0.62;
export const STEP_END = 0.24;
export const TURN_MAX = 0.95;
export const START_ANGLE = 0.25;

/** 물 분자 흩뿌림 — 격자 열 · 행, 칸 안 흔들림 비율. 이온 자리 · 표적 가까이의 점은 뺀다(그 자리의 분자는 따로 둔다). */
export const MEDIUM_COLS = 16;
export const MEDIUM_ROWS = 7;
export const MEDIUM_JITTER = 0.7;
/** 이온 자리 · 표적에서 이만큼(월드) 안에 드는 흩뿌림 점은 뺀다. */
export const MEDIUM_CLEAR = 0.12;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 물 분자가 깔리는 상자, 전자 궤적도 이 안에서 돈다. */
export const MEDIUM = { minX: -5.6, maxX: 5.6, minY: -2.3, maxY: 2.3 } as const;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 0.7;

/** 프레이밍은 고정 — 캡션 띠부터 문턱 이름표까지. */
export const SCENE_BOUNDS = {
  minX: -6.4,
  maxX: 6.0,
  minY: MEDIUM.minY - 0.3 - CAPTION_BAND,
  maxY: MEDIUM.maxY + 0.8,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 자외선은 대조라 짧게, 연쇄(track)에 시간을 준다.
// ------------------------------------------------------------------------

export const PHASE_APPEAR = 0.6;
export const PHASE_UV_IN = 1.0;
export const PHASE_UV_HIT = 1.4;
export const PHASE_XRAY_IN = 0.9;
export const PHASE_XRAY_HIT = 1.0;
export const PHASE_TRACK = 4.8;
export const PHASE_HOLD = 2.6;
export const PHASE_FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const ionizingRadiationMessages = Object.freeze({
  'label.title': {
    ko: '이온화 방사선',
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
    ko: '원자에서 전자를 떼어 낼 만큼 큰 에너지의 방사선',
    en: 'Radiation energetic enough to strip electrons from atoms',
    ja: '原子から電子をはぎ取れるほど大きなエネルギーの放射',
    zh: '能量大到足以从原子中剥离电子的辐射',
    ar: 'إشعاع يحمل طاقة تكفي لانتزاع الإلكترونات من الذرات',
    es: 'Radiación con energía suficiente para arrancar electrones de los átomos',
    fr: 'Un rayonnement assez énergétique pour arracher des électrons aux atomes',
    hi: 'इतनी ऊर्जा वाला विकिरण जो परमाणुओं से इलेक्ट्रॉन छीन ले',
    id: 'Radiasi berenergi cukup besar untuk melepaskan elektron dari atom',
    pt: 'Radiação com energia suficiente para arrancar elétrons dos átomos',
  },
  'label.stage': {
    ko: '물 분자',
    en: 'Water molecules',
    ja: '水分子',
    zh: '水分子',
    ar: 'جزيئات الماء',
    es: 'Moléculas de agua',
    fr: 'Molécules d’eau',
    hi: 'जल के अणु',
    id: 'Molekul air',
    pt: 'Moléculas de água',
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
  'label.threshold': {
    ko: '물 분자를 이온화하는 문턱 {e} eV',
    en: 'Threshold to ionize a water molecule {e} eV',
    ja: '水分子を電離するしきい値 {e} eV',
    zh: '使水分子电离的阈值 {e} eV',
    ar: 'عتبة تأيين جزيء الماء {e} eV',
    es: 'Umbral para ionizar una molécula de agua {e} eV',
    fr: 'Seuil d’ionisation d’une molécule d’eau {e} eV',
    hi: 'जल के अणु के आयनन की देहली {e} eV',
    id: 'Ambang untuk mengionisasi molekul air {e} eV',
    pt: 'Limiar para ionizar uma molécula de água {e} eV',
  },
  /** 광자 에너지 이름표 — 값과 단위만이라 모든 언어가 같다. */
  'label.uvPhoton': {
    ko: '{e} eV',
    en: '{e} eV',
    ja: '{e} eV',
    zh: '{e} eV',
    ar: '{e} eV',
    es: '{e} eV',
    fr: '{e} eV',
    hi: '{e} eV',
    id: '{e} eV',
    pt: '{e} eV',
  },
  'label.xrayPhoton': {
    ko: '{e} keV',
    en: '{e} keV',
    ja: '{e} keV',
    zh: '{e} keV',
    ar: '{e} keV',
    es: '{e} keV',
    fr: '{e} keV',
    hi: '{e} keV',
    id: '{e} keV',
    pt: '{e} keV',
  },
  /** 표식 — 모든 언어가 같다. */
  'mark.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  'mark.ion': {
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
  'caption.appear': {
    ko: '물 분자가 흩어져 있다',
    en: 'Water molecules are scattered about',
    ja: '水分子が散らばっている',
    zh: '水分子散布四周',
    ar: 'جزيئات الماء متناثرة',
    es: 'Hay moléculas de agua dispersas',
    fr: 'Des molécules d’eau sont dispersées',
    hi: 'जल के अणु बिखरे हुए हैं',
    id: 'Molekul-molekul air tersebar',
    pt: 'Há moléculas de água espalhadas',
  },
  'caption.uvIn': {
    ko: '문턱 아래의 자외선 광자 하나가 들어온다',
    en: 'One ultraviolet photon below the threshold comes in',
    ja: 'しきい値より下の紫外線の光子が1個入ってくる',
    zh: '一个低于阈值的紫外线光子射入',
    ar: 'يدخل فوتون واحد من الأشعة فوق البنفسجية تحت العتبة',
    es: 'Entra un fotón ultravioleta por debajo del umbral',
    fr: 'Un photon ultraviolet sous le seuil arrive',
    hi: 'देहली से नीचे का एक पराबैंगनी फोटॉन आता है',
    id: 'Satu foton ultraungu di bawah ambang masuk',
    pt: 'Entra um fóton ultravioleta abaixo do limiar',
  },
  'caption.uvHit': {
    ko: '물 분자에 닿았지만 이온은 하나도 생기지 않는다',
    en: 'It reaches a water molecule, yet not a single ion forms',
    ja: '水分子に当たっても、イオンは1個もできない',
    zh: '它碰到了水分子，却一个离子也没有产生',
    ar: 'يصل إلى جزيء ماء، ومع ذلك لا يتكوّن أي أيون',
    es: 'Llega a una molécula de agua, pero no se forma ni un solo ion',
    fr: 'Il atteint une molécule d’eau, mais aucun ion ne se forme',
    hi: 'यह जल के अणु तक पहुँचता है, फिर भी एक भी आयन नहीं बनता',
    id: 'Foton itu mengenai molekul air, tetapi tidak satu ion pun terbentuk',
    pt: 'Chega a uma molécula de água, mas não se forma nenhum íon',
  },
  'caption.xrayIn': {
    ko: 'X선 광자 하나가 들어온다',
    en: 'One X-ray photon comes in',
    ja: 'X線の光子が1個入ってくる',
    zh: '一个X射线光子射入',
    ar: 'يدخل فوتون واحد من الأشعة السينية',
    es: 'Entra un fotón de rayos X',
    fr: 'Un photon X arrive',
    hi: 'एक X-किरण फोटॉन आता है',
    id: 'Satu foton sinar-X masuk',
    pt: 'Entra um fóton de raios X',
  },
  'caption.xrayHit': {
    ko: '광자가 사라지며 물 분자에서 전자 하나를 떼어 낸다',
    en: 'The photon vanishes and knocks one electron out of a water molecule',
    ja: '光子が消え、水分子から電子を1個はぎ取る',
    zh: '光子消失，从水分子中打出一个电子',
    ar: 'يختفي الفوتون وينتزع إلكترونًا واحدًا من جزيء ماء',
    es: 'El fotón desaparece y arranca un electrón de una molécula de agua',
    fr: 'Le photon disparaît et arrache un électron à une molécule d’eau',
    hi: 'फोटॉन मिट जाता है और जल के एक अणु से एक इलेक्ट्रॉन निकाल देता है',
    id: 'Foton lenyap dan melepaskan satu elektron dari molekul air',
    pt: 'O fóton desaparece e arranca um elétron de uma molécula de água',
  },
  'caption.track': {
    ko: '떨어져 나간 전자가 지나는 길을 따라 물 분자가 하나씩 이온이 된다',
    en: 'Along the freed electron’s path, water molecules become ions one after another',
    ja: 'はぎ取られた電子が通る道筋で、水分子が次々にイオンになる',
    zh: '被打出的电子经过之处，水分子一个接一个变成离子',
    ar: 'على طول مسار الإلكترون المنتزع تتحول جزيئات الماء إلى أيونات واحدًا تلو الآخر',
    es: 'A lo largo del camino del electrón liberado, las moléculas de agua se vuelven iones una tras otra',
    fr: 'Le long du trajet de l’électron arraché, les molécules d’eau deviennent des ions l’une après l’autre',
    hi: 'मुक्त इलेक्ट्रॉन के रास्ते भर जल के अणु एक-एक कर आयन बनते जाते हैं',
    id: 'Di sepanjang lintasan elektron yang lepas, molekul air satu per satu menjadi ion',
    pt: 'Ao longo do caminho do elétron arrancado, as moléculas de água viram íons uma após outra',
  },
  'caption.left': {
    ko: '광자 하나가 이온 {n}개를 남겼다',
    en: 'One photon has left {n} ions behind',
    ja: '光子1個が {n} 個のイオンを残した',
    zh: '一个光子留下了 {n} 个离子',
    ar: 'ترك فوتون واحد وراءه {n} أيونًا',
    es: 'Un solo fotón ha dejado {n} iones',
    fr: 'Un seul photon a laissé {n} ions',
    hi: 'एक फोटॉन ने {n} आयन पीछे छोड़े',
    id: 'Satu foton meninggalkan {n} ion',
    pt: 'Um único fóton deixou {n} íons',
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

  // 조작기가 없다 — 한 주기에 두 광자를 차례로 보낸다.
  parameters: [],

  stages: [
    {
      id: 'water',
      label: text('label.stage'),
      constants: {
        ionizationEv: IONIZATION_EV,
        uvEv: UV_EV,
        xrayKev: XRAY_KEV,
        ionCount: ION_COUNT,
        seed: SEED,
        uvWave: UV_WAVE,
        xrayWave: XRAY_WAVE,
        packetLength: PACKET_LENGTH,
        packetAmplitude: PACKET_AMPLITUDE,
        photonStartX: PHOTON_START_X,
        uvTargetX: UV_TARGET_X,
        uvTargetY: UV_TARGET_Y,
        xrayTargetX: XRAY_TARGET_X,
        xrayTargetY: XRAY_TARGET_Y,
        stepStart: STEP_START,
        stepEnd: STEP_END,
        turnMax: TURN_MAX,
        startAngle: START_ANGLE,
        mediumCols: MEDIUM_COLS,
        mediumRows: MEDIUM_ROWS,
        mediumJitter: MEDIUM_JITTER,
        mediumClear: MEDIUM_CLEAR,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓은 물 한 판 · 캡션 한 줄. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 한 주기 = 나타남 → 자외선 광자 들어옴 → 닿음(아무 일 없음) → X선 광자 들어옴 → 닿음(첫 이온 ·
   * 전자 떠남) → 전자의 길(이온이 줄줄이) → 머묾 → 흐려짐.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: PHASE_APPEAR, caption: key('caption.appear') },
      { id: 'uvIn', duration: PHASE_UV_IN, caption: key('caption.uvIn') },
      { id: 'uvHit', duration: PHASE_UV_HIT, caption: key('caption.uvHit') },
      { id: 'xrayIn', duration: PHASE_XRAY_IN, caption: key('caption.xrayIn') },
      { id: 'xrayHit', duration: PHASE_XRAY_HIT, caption: key('caption.xrayHit') },
      { id: 'track', duration: PHASE_TRACK, caption: key('caption.track') },
      { id: 'hold', duration: PHASE_HOLD, caption: key('caption.left') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.left') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 물 분자가 깔려 있고 자외선 광자가 막 들어오기 시작한 자리. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — W 값 · 이온화 에너지의 뜻은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n: 'ionCount' },
  },

  messages: ionizingRadiationMessages,
};
