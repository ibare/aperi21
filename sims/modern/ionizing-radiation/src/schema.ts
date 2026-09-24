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
  'label.title': { ko: '이온화 복사', en: 'Ionizing radiation' },
  'label.stage': { ko: '분자 결합', en: 'Molecular bonds' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 결합을 끊는 문턱. 값은 선언한 정박값을 끼운다 (C1 · S-piece 유효숫자). */
  'label.threshold': { ko: '결합을 끊는 문턱 {e} eV', en: 'bond-breaking threshold {e} eV' },
  /** 에너지 축 이름. */
  'label.axis': { ko: '광자 하나의 에너지', en: 'energy of one photon' },
  'band.radio': { ko: '전파', en: 'radio' },
  'band.microwave': { ko: '마이크로파', en: 'microwave' },
  'band.infrared': { ko: '적외선', en: 'infrared' },
  'band.visible': { ko: '가시광', en: 'visible' },
  'band.ultraviolet': { ko: '자외선', en: 'ultraviolet' },
  'band.xray': { ko: 'X선', en: 'X-ray' },
  /** 로그 눈금 이름표 — 지수를 코드로 조립하지 않고 보일 문자열을 통째로 둔다. */
  'tick.milliEv': { ko: '1 meV', en: '1 meV' },
  'tick.ev': { ko: '1 eV', en: '1 eV' },
  'tick.kiloEv': { ko: '1 keV', en: '1 keV' },
  'caption.appear': {
    ko: '결합으로 이어진 분자 여섯이 광원 앞에 놓인다',
    en: 'Six bonded molecules sit in front of the light source',
  },
  'caption.radio': {
    ko: '전파 광자가 쉴 새 없이 쏟아져도 분자는 꿈쩍하지 않는다',
    en: 'Radio photons pour in nonstop, yet the molecules do not even stir',
  },
  'caption.microwave': {
    ko: '마이크로파 광자가 수없이 닿아도 결합은 그대로다',
    en: 'Countless microwave photons land, and every bond holds',
  },
  'caption.infrared': {
    ko: '적외선 광자가 닿아도 분자는 거의 흔들리지 않는다',
    en: 'Infrared photons land, and the molecules barely stir',
  },
  'caption.visible': {
    ko: '가시광 광자는 분자를 살짝 흔들 뿐 결합을 끊지 못한다',
    en: 'Visible photons give a molecule a small shake but cannot break a bond',
  },
  'caption.ultraviolet': {
    ko: '문턱 아래의 자외선 광자는 결합을 크게 흔들지만 끊지 못한다',
    en: 'Ultraviolet photons below the threshold stretch a bond hard, yet it holds',
  },
  'caption.ionizing': {
    ko: '문턱을 넘은 광자는 하나만 닿아도 결합이 끊어진다',
    en: 'Past the threshold, a single photon is enough to break a bond',
  },
  'caption.xray': {
    ko: 'X선 광자도 하나가 결합 하나를 끊는다',
    en: 'X-ray photons too break one bond apiece',
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
  title: text('label.title'),
  category: 'modern',
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
