// ========================================================================
// compton-scattering — 선언
// ========================================================================
// 질문: 빛이 운동량을 가진 알갱이라면, 전자와 부딪혀 튕겨 나갈 때 무엇이 달라지나.
//
// X선 광자 하나가 멈춰 있는 전자와 당구공처럼 부딪히면 전자가 밀려나며 운동량을 가져간다.
// 운동량을 잃은 광자는 파장이 길어져 나온다 — 크게 꺾일수록 더 많이 잃어 더 길다.
// Δλ = (h/mc)(1 − cos θ): 0° 에서 0, 90° 에서 2.43 pm, 180° 에서 4.85 pm.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 광자가 전자에 에너지를 통째로 주는 것은 이웃 `photoelectric-effect` 의 몫이라 금속판을 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:compton-scattering` 와 문자 그대로 일치한다 (C4). */
export const COMPTON_SCATTERING_ID = 'compton-scattering';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 들어오는 X선의 파장(pm). 센 X선이라 콤프턴 이동이 파장에 견줄 만큼 크다 — 효과를 키우는
 * 배율 없이 그대로 그린다 (NOTES (b)).
 */
export const INCIDENT_PM = 10;
/** 전자의 콤프턴 파장 h/mc(pm). 튕겨 나간 광자의 파장이 여기서 나온다. */
export const COMPTON_PM = 2.426;
/** 튕겨 나가는 각(도) — 차례대로. 목록을 선언할 자리가 없어 이름 다섯으로 흩는다 (장부 G105). */
export const ANGLES_DEG = [0, 45, 90, 135, 180] as const;
/**
 * 각마다 화면에 띄우는 파장 증가(pm) — 정박값이다. COMPTON_PM × (1 − cos θ) 를 유효숫자 셋으로
 * 둔 값이라 각이나 콤프턴 파장을 바꾸면 이것도 함께 바꾼다 (장부 G143).
 */
export const SHIFTS_PM = [0, 0.71, 2.43, 4.14, 4.85] as const;
/** 광자 물결 뭉치 하나의 물결 수. 모두 같아서 뭉치 길이가 파장에 비례한다. */
export const PACKET_CYCLES = 5;
/**
 * 물결 간격 배율(월드/pm) — 10 pm 이 0.3 월드. 화면에 알리지 않는다: 들어온 파장과 견준
 * **비**가 주장이고 절대 길이는 뜻이 없다 (NOTES (b)).
 */
export const WAVE_SCALE = 0.03;
/** 광자가 나는 빠르기(월드/초). 빛의 속력이 아니라 눈으로 따라갈 수 있는 빠르기다. */
export const PHOTON_SPEED = 2.2;
/**
 * 되튄 전자의 빠르기 배율(월드/초) — 들어온 광자의 운동량만큼을 받은 전자가 이 빠르기로 난다.
 * 받은 운동량의 비만 보이고 절대 빠르기는 뜻이 없다.
 */
export const RECOIL_SPEED = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 전자가 원점.
// ------------------------------------------------------------------------

/** 튕겨 나간 광자가 멈춰 서는 자리의 안쪽 반지름 — 모든 뭉치가 여기서 시작해 길이가 견줘진다. */
export const PARK_RADIUS = 0.9;

/**
 * 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다.
 */
export const CAPTION_BAND = 0.55;

/**
 * 프레이밍은 고정 — 가장 긴 뭉치(180°, 14.85 pm)의 이름표가 왼쪽 끝, 90° 이름표가 위 끝,
 * 되튄 전자와 캡션 띠가 아래 끝이다.
 */
export const SCENE_BOUNDS = {
  minX: -5.3,
  maxX: 4.3,
  minY: -1.25 - CAPTION_BAND,
  maxY: 3.75,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 광자가 왼쪽에서 날아와 전자에 닿기까지. */
export const PHASE_IN = 1.1;
/** 튕겨 나간 광자가 제자리에 멈추고 전자가 되튀기까지. */
export const PHASE_OUT = 2.1;
export const PHASE_FADE = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const comptonScatteringMessages = Object.freeze({
  'label.title': {
    ko: '콤프턴 산란',
    en: 'Compton scattering',
    ja: 'コンプトン散乱',
    zh: '康普顿散射',
    ar: 'تشتت كومبتون',
    es: 'Dispersión Compton',
    fr: 'Diffusion Compton',
    hi: 'कॉम्पटन प्रकीर्णन',
    id: 'Hamburan Compton',
    pt: 'Espalhamento Compton',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '광자가 운동량을 가진다는 증거',
    en: 'Evidence that a photon carries momentum',
    ja: '光子が運動量をもつ証拠',
    zh: '光子具有动量的证据',
    ar: 'دليل على أن للفوتون زخمًا',
    es: 'Prueba de que un fotón tiene momento lineal',
    fr: 'Preuve qu’un photon porte une quantité de mouvement',
    hi: 'इस बात का प्रमाण कि फोटॉन में संवेग होता है',
    id: 'Bukti bahwa foton membawa momentum',
    pt: 'Evidência de que um fóton tem quantidade de movimento',
  },
  'label.stage': {
    ko: '센 X선과 전자 하나',
    en: 'Hard X-ray and one electron',
    ja: '硬X線と電子1個',
    zh: '硬X射线与一个电子',
    ar: 'أشعة سينية صلبة وإلكترون واحد',
    es: 'Rayos X duros y un electrón',
    fr: 'Rayons X durs et un électron',
    hi: 'कठोर X-किरणें और एक इलेक्ट्रॉन',
    id: 'Sinar-X keras dan satu elektron',
    pt: 'Raios X duros e um elétron',
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
  /** 들어오는 광자. 값은 선언한 입사 파장을 끼운다 (C1 · S-piece 유효숫자). */
  'label.incident': {
    ko: 'X선 {l} pm',
    en: 'X-ray {l} pm',
    ja: 'X線 {l} pm',
    zh: 'X射线 {l} pm',
    ar: 'أشعة سينية {l} pm',
    es: 'Rayo X {l} pm',
    fr: 'Rayon X {l} pm',
    hi: 'X-किरण {l} pm',
    id: 'Sinar-X {l} pm',
    pt: 'Raio X {l} pm',
  },
  /** 튕겨 나간 광자 — 각과 늘어난 파장. 값은 선언한 정박값이다. */
  'label.shift': {
    ko: '{a}°  +{d} pm',
    en: '{a}°  +{d} pm',
    ja: '{a}°  +{d} pm',
    zh: '{a}°  +{d} pm',
    ar: '{a}°  +{d} pm',
    es: '{a}°  +{d} pm',
    fr: '{a}°  +{d} pm',
    hi: '{a}°  +{d} pm',
    id: '{a}°  +{d} pm',
    pt: '{a}°  +{d} pm',
  },
  /** 전자 표식. */
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
  'caption.shot1': {
    ko: '꺾이지 않고 지나간 광자는 파장이 그대로라 점선에서 끝난다 — 전자도 제자리다',
    en: 'A photon that passes straight on keeps its wavelength and ends at the dashed line — the electron stays put',
    ja: 'まっすぐ通り抜けた光子は波長が変わらず、点線で止まる — 電子もその場にとどまる',
    zh: '径直穿过的光子波长不变，停在虚线处 — 电子也留在原处',
    ar: 'الفوتون الذي يمر مستقيمًا يحتفظ بطوله الموجي وينتهي عند الخط المتقطع — ويبقى الإلكترون في مكانه',
    es: 'Un fotón que sigue de largo conserva su longitud de onda y termina en la línea discontinua — el electrón no se mueve',
    fr: 'Un photon qui passe tout droit garde sa longueur d’onde et s’arrête à la ligne pointillée — l’électron ne bouge pas',
    hi: 'सीधा निकल जाने वाला फोटॉन अपनी तरंगदैर्घ्य बनाए रखता है और बिंदुकित रेखा पर रुकता है — इलेक्ट्रॉन अपनी जगह रहता है',
    id: 'Foton yang lewat lurus mempertahankan panjang gelombangnya dan berakhir di garis putus-putus — elektron tetap di tempat',
    pt: 'Um fóton que passa direto mantém seu comprimento de onda e termina na linha tracejada — o elétron fica parado',
  },
  'caption.shot2': {
    ko: '조금 꺾여 나간 광자는 파장이 늘어 점선을 넘는다 — 전자가 밀려난다',
    en: 'A photon bounced off at a small angle comes out stretched past the dashed line — the electron is pushed away',
    ja: '小さく曲げられた光子は波長が伸びて点線を越える — 電子が押しのけられる',
    zh: '以小角度弹开的光子波长变长，越过虚线 — 电子被推开',
    ar: 'الفوتون المرتد بزاوية صغيرة يخرج ممتدًا متجاوزًا الخط المتقطع — ويُدفع الإلكترون بعيدًا',
    es: 'Un fotón desviado en un ángulo pequeño sale estirado más allá de la línea discontinua — el electrón es empujado',
    fr: 'Un photon dévié d’un petit angle ressort étiré au-delà de la ligne pointillée — l’électron est repoussé',
    hi: 'छोटे कोण पर मुड़ा फोटॉन खिंचकर बिंदुकित रेखा से आगे निकलता है — इलेक्ट्रॉन धकेला जाता है',
    id: 'Foton yang terpental dengan sudut kecil keluar meregang melewati garis putus-putus — elektron terdorong menjauh',
    pt: 'Um fóton desviado num ângulo pequeno sai esticado além da linha tracejada — o elétron é empurrado',
  },
  'caption.shot3': {
    ko: '옆으로 꺾인 광자는 파장이 더 늘어났고, 전자는 더 세게 밀려난다',
    en: 'A photon bounced off sideways is stretched further, and the electron is pushed harder',
    ja: '横へ曲げられた光子は波長がさらに伸び、電子はより強く押しのけられる',
    zh: '向侧面弹开的光子波长更长，电子被推得更猛',
    ar: 'الفوتون المرتد جانبيًا يمتد أكثر، ويُدفع الإلكترون بقوة أكبر',
    es: 'Un fotón desviado hacia un lado se estira aún más, y el electrón es empujado con más fuerza',
    fr: 'Un photon dévié sur le côté est encore plus étiré, et l’électron est repoussé plus fort',
    hi: 'बगल की ओर मुड़ा फोटॉन और अधिक खिंचता है, और इलेक्ट्रॉन और ज़ोर से धकेला जाता है',
    id: 'Foton yang terpental ke samping meregang lebih jauh, dan elektron terdorong lebih kuat',
    pt: 'Um fóton desviado para o lado se estica ainda mais, e o elétron é empurrado com mais força',
  },
  'caption.shot4': {
    ko: '크게 꺾일수록 광자는 더 많이 잃고 파장이 더 길어진다',
    en: 'The sharper the bounce, the more the photon loses and the longer its wavelength',
    ja: '大きく曲がるほど光子は多くを失い、波長が長くなる',
    zh: '弹开的角度越大，光子损失越多，波长越长',
    ar: 'كلما اشتد الارتداد، خسر الفوتون أكثر وطال طوله الموجي',
    es: 'Cuanto más brusco el rebote, más pierde el fotón y más larga es su longitud de onda',
    fr: 'Plus le rebond est prononcé, plus le photon perd et plus sa longueur d’onde est grande',
    hi: 'मोड़ जितना तीखा, फोटॉन उतना अधिक खोता है और उसकी तरंगदैर्घ्य उतनी लंबी होती है',
    id: 'Makin tajam pantulannya, makin banyak yang hilang dari foton dan makin panjang gelombangnya',
    pt: 'Quanto mais forte o desvio, mais o fóton perde e maior fica seu comprimento de onda',
  },
  'caption.shot5': {
    ko: '거꾸로 되돌아 나온 광자가 가장 길다 — 전자는 곧장 앞으로 가장 세게 밀려난다',
    en: 'The photon bounced straight back is the longest — the electron is shoved straight ahead, hardest of all',
    ja: 'まっすぐ跳ね返った光子がいちばん長い — 電子はまっすぐ前へ、最も強く押し出される',
    zh: '被直接弹回的光子最长 — 电子被笔直地向前推出，力度最大',
    ar: 'الفوتون المرتد إلى الخلف مباشرةً هو الأطول — ويُدفع الإلكترون إلى الأمام مباشرةً بأشد قوة',
    es: 'El fotón que rebota justo hacia atrás es el más largo — el electrón sale empujado justo hacia delante, con más fuerza que ninguno',
    fr: 'Le photon renvoyé droit en arrière est le plus long — l’électron est projeté droit devant, plus fort que tous',
    hi: 'ठीक पीछे लौटा फोटॉन सबसे लंबा है — इलेक्ट्रॉन सीधे आगे, सबसे ज़ोर से धकेला जाता है',
    id: 'Foton yang terpental lurus ke belakang paling panjang — elektron terdorong lurus ke depan, paling kuat',
    pt: 'O fóton que volta direto para trás é o mais longo — o elétron é lançado direto para a frente, com mais força que todos',
  },
} satisfies Record<string, LocalizedText>);

export type ComptonScatteringMessageKey = keyof typeof comptonScatteringMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ComptonScatteringMessageKey): LocalizedText => comptonScatteringMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ComptonScatteringMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const comptonScatteringSchema: BundleSchema = {
  id: COMPTON_SCATTERING_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 다섯 각이 차례로 쌓여 부채꼴에서 한눈에 견줘진다.
  parameters: [],

  stages: [
    {
      id: 'hard-xray',
      label: text('label.stage'),
      constants: {
        incidentWavelength: INCIDENT_PM,
        comptonWavelength: COMPTON_PM,
        angle1: ANGLES_DEG[0],
        angle2: ANGLES_DEG[1],
        angle3: ANGLES_DEG[2],
        angle4: ANGLES_DEG[3],
        angle5: ANGLES_DEG[4],
        shift1: SHIFTS_PM[0],
        shift2: SHIFTS_PM[1],
        shift3: SHIFTS_PM[2],
        shift4: SHIFTS_PM[3],
        shift5: SHIFTS_PM[4],
        packetCycles: PACKET_CYCLES,
        waveScale: WAVE_SCALE,
        photonSpeed: PHOTON_SPEED,
        recoilSpeed: RECOIL_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 위로 반원인 부채꼴 하나 · 캡션 한 줄. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 한 주기 = 광자 다섯 발. 발마다 들어옴(in) → 튕겨 나감(out). 튕겨 나간 광자는 제자리에
   * 멈춰 남아 다음 발과 나란히 견줘진다. 마지막에 흐려지고 처음으로.
   *
   * 단계 id 에서 몇 번째 각인지로 가는 짝은 physics 의 `SHOTS` 가 안다 — 단계에 값을 실을
   * 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'in-1', duration: PHASE_IN, caption: key('caption.shot1') },
      { id: 'out-1', duration: PHASE_OUT, caption: key('caption.shot1') },
      { id: 'in-2', duration: PHASE_IN, caption: key('caption.shot2') },
      { id: 'out-2', duration: PHASE_OUT, caption: key('caption.shot2') },
      { id: 'in-3', duration: PHASE_IN, caption: key('caption.shot3') },
      { id: 'out-3', duration: PHASE_OUT, caption: key('caption.shot3') },
      { id: 'in-4', duration: PHASE_IN, caption: key('caption.shot4') },
      { id: 'out-4', duration: PHASE_OUT, caption: key('caption.shot4') },
      { id: 'in-5', duration: PHASE_IN, caption: key('caption.shot5') },
      { id: 'out-5', duration: PHASE_OUT, caption: key('caption.shot5') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.shot5') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 첫 광자가 전자 쪽으로 날아가는 중에 연다. */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Δλ 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: comptonScatteringMessages,
};
