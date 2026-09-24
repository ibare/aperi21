// ========================================================================
// wave-basics — 선언
// ========================================================================
// 질문: 파장 · 진동수 · 속력 · 진폭은 서로 어떻게 묶여 있나.
//
// 오른쪽으로 가는 한 줄 파동. 줄 위의 한 점 P 는 제자리에서 오르내리기만 하고,
// 오른쪽 작은 자취가 P 의 높이를 시간에 따라 적는다. P 에서 한 파장 뒤에 있던 마루가
// 강조색으로 따라가며 λ 치수선 위 막대를 채운다 — P 가 한 번 오르내림을 마치는 순간
// (자취가 정확히 한 주기) 그 마루가 P 에 닿는다(막대가 정확히 λ). 한 번 흔들리는 시간에
// 한 파장을 가므로 파동의 속력은 λ/T 다. 식은 문단이 말하고 그림은 그 일치를 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-basics` 와 문자 그대로 일치한다 (C4). */
export const WAVE_BASICS_ID = 'wave-basics';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파장 λ(m). 조작기가 이 값에서 출발한다. */
export const WAVELENGTH = 2;
/** 진폭 A(m). 조작기가 이 값에서 출발한다. */
export const AMPLITUDE = 0.5;
/**
 * 주기 T(s). 진동수 f = 1/T. 이 조각은 진동수를 조작하지 않는다 — 한 번 흔들리는 시간이
 * 시간표 `travel` 단계의 한 벌이라서, 값을 바꾸면 단계 길이가 따라가야 한다(장부 G13).
 */
export const PERIOD = 2;

/**
 * 조작기 범위 — 정적 선언이다 (원칙 7). 에디터가 편집하는 데이터이고 상태로 계산하지 않는다.
 * 가장 큰 파장 · 진폭이 들어가도록 경계(`SCENE_BOUNDS`)를 처음부터 잡았다.
 */
export const WAVELENGTH_RANGE = { min: 1.5, max: 3, step: 0.5 } as const;
export const AMPLITUDE_RANGE = { min: 0.2, max: 0.8, step: 0.1 } as const;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 줄은 x 축을 따라 놓이고 평형 자리가 y = 0 이다.
// ------------------------------------------------------------------------

/** 줄의 왼쪽 · 오른쪽 끝. */
export const ROPE_START = 0;
export const ROPE_END = 7.7;
/**
 * 지켜보는 점 P 의 자리. 가장 긴 파장(3 m)에서도 한 파장 뒤 마루(4 m)가 줄 안에 있고,
 * 오른쪽 자취와 가깝도록 줄 오른쪽 끝 가까이에 둔다.
 */
export const POINT_X = 7;

/** P 의 높이를 적는 시간 자취 — 왼쪽 끝 x 와 한 주기에 해당하는 가로 길이. */
export const TRACE_X = 8.6;
export const TRACE_WIDTH = 3;
/** 시간 축이 T 눈금 너머로 조금 더 나가는 길이(화살촉 자리). */
export const TRACE_AXIS_OVERRUN = 0.45;

/** λ 치수선 · 마루가 간 거리 막대가 진폭 위로 떨어져 놓이는 간격. */
export const LAMBDA_GAP = 0.32;
/** A 치수선이 줄 왼쪽 끝에서 떨어진 간격. */
export const AMPLITUDE_DIM_X = -0.35;

/**
 * 프레이밍은 주장의 일부다. 가로는 A 치수선 글자부터 시간 축 화살촉까지, 세로는 가장 큰
 * 진폭 ± 0.8 과 그 위 λ 막대 · 글자, 위의 캡션 줄 · 아래 조작기 줄 자리까지.
 * 매 프레임 같은 값이다 (원칙 6) — 조작기로 진폭을 바꿔도 움직이지 않는다.
 */
export const SCENE_BOUNDS = { minX: -1.0, maxX: 12.3, minY: -2.05, maxY: 2.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이
// ------------------------------------------------------------------------

/**
 * 한 번 오르내리는 동안 — 조각 시계로 한 주기다. 물리는 이 단계의 **진행도**로 파동의
 * 시각을 읽으므로(`τ = T · at('travel')`) 단계 길이를 바꾸면 재생 속도만 바뀌고 "한 번
 * 흔들리는 동안 한 파장" 은 그대로다.
 */
export const TRAVEL = PERIOD;
/** 한 주기를 절반 속도로 흘린다 — 실시간 2 초는 오르내림과 전진을 함께 보기 짧다. */
export const SLOW_MOTION = 0.5;
/** 멈춘 그림을 읽는 동안 · 막대와 자취가 흐려지는 동안. */
export const HOLD = 2.6;
export const FADE = 0.5;
/**
 * 도착한 순간 이미 진행 중이다 — 반 주기에서 연다. P 는 바닥에 있고 마루는 λ 의 절반을
 * 왔으며, 자취는 반 주기를 그렸다.
 */
export const START_AT = TRAVEL / 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveBasicsMessages = Object.freeze({
  'label.title': {
    ko: '파동의 기본량',
    en: 'Basic quantities of a wave',
    ja: '波の基本量',
    zh: '波的基本物理量',
    ar: 'الكميات الأساسية للموجة',
    es: 'Magnitudes básicas de una onda',
    fr: 'Grandeurs fondamentales d’une onde',
    hi: 'तरंग की मूल राशियाँ',
    id: 'Besaran dasar gelombang',
    pt: 'Grandezas básicas de uma onda',
  },
  'label.operation': {
    ko: '파장·진동수·속력·진폭',
    en: 'Wavelength, frequency, speed and amplitude',
    ja: '波長・振動数・速さ・振幅',
    zh: '波长、频率、波速和振幅',
    ar: 'الطول الموجي والتردد والسرعة والسعة',
    es: 'Longitud de onda, frecuencia, rapidez y amplitud',
    fr: 'Longueur d’onde, fréquence, vitesse et amplitude',
    hi: 'तरंगदैर्घ्य, आवृत्ति, चाल और आयाम',
    id: 'Panjang gelombang, frekuensi, kelajuan, dan amplitudo',
    pt: 'Comprimento de onda, frequência, velocidade e amplitude',
  },
  'label.stage': {
    ko: '한 줄 파동',
    en: 'Wave on a rope',
    ja: 'ロープを伝わる波',
    zh: '绳上的波',
    ar: 'موجة على حبل',
    es: 'Onda en una cuerda',
    fr: 'Onde sur une corde',
    hi: 'रस्सी पर तरंग',
    id: 'Gelombang pada tali',
    pt: 'Onda numa corda',
  },
  'label.view': {
    ko: '줄과 한 점의 자취',
    en: 'Rope and one point’s trace',
    ja: 'ロープと一点の軌跡',
    zh: '绳与一个点的轨迹',
    ar: 'الحبل وأثر نقطة واحدة',
    es: 'Cuerda y trazo de un punto',
    fr: 'Corde et trace d’un point',
    hi: 'रस्सी और एक बिंदु का पथ-चिह्न',
    id: 'Tali dan jejak satu titik',
    pt: 'Corda e rastro de um ponto',
  },
  /** 조작기 이름표. 값은 슬라이더가 붙인다. */
  'label.wavelengthControl': {
    ko: '파장 λ',
    en: 'Wavelength λ',
    ja: '波長 λ',
    zh: '波长 λ',
    ar: 'الطول الموجي λ',
    es: 'Longitud de onda λ',
    fr: 'Longueur d’onde λ',
    hi: 'तरंगदैर्घ्य λ',
    id: 'Panjang gelombang λ',
    pt: 'Comprimento de onda λ',
  },
  'label.amplitudeControl': {
    ko: '진폭 A',
    en: 'Amplitude A',
    ja: '振幅 A',
    zh: '振幅 A',
    ar: 'السعة A',
    es: 'Amplitud A',
    fr: 'Amplitude A',
    hi: 'आयाम A',
    id: 'Amplitudo A',
    pt: 'Amplitude A',
  },
  /** 그림에 새긴 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.lambda': { ko: 'λ', en: 'λ', ja: 'λ', zh: 'λ', ar: 'λ', es: 'λ', fr: 'λ', hi: 'λ', id: 'λ', pt: 'λ' },
  'label.amplitude': { ko: 'A', en: 'A', ja: 'A', zh: 'A', ar: 'A', es: 'A', fr: 'A', hi: 'A', id: 'A', pt: 'A' },
  'label.period': { ko: 'T', en: 'T', ja: 'T', zh: 'T', ar: 'T', es: 'T', fr: 'T', hi: 'T', id: 'T', pt: 'T' },
  'label.time': { ko: 't', en: 't', ja: 't', zh: 't', ar: 't', es: 't', fr: 't', hi: 't', id: 't', pt: 't' },
  'label.point': { ko: 'P', en: 'P', ja: 'P', zh: 'P', ar: 'P', es: 'P', fr: 'P', hi: 'P', id: 'P', pt: 'P' },
  'caption.travel': {
    ko: 'P 는 제자리에서 오르내리고, 뒤에서 오던 마루는 P 를 향해 나아간다',
    en: 'P only rises and falls in place, while the crest behind it moves toward P',
    ja: 'P はその場で上下するだけで、後ろの山は P へ向かって進む',
    zh: 'P 只在原地上下起伏，而它后面的波峰朝 P 前进',
    ar: 'P يرتفع وينخفض في مكانه فقط، بينما تتقدم القمة التي خلفه نحو P',
    es: 'P solo sube y baja en su sitio, mientras la cresta que viene detrás avanza hacia P',
    fr: 'P ne fait que monter et descendre sur place, tandis que la crête derrière lui avance vers P',
    hi: 'P अपनी जगह पर केवल ऊपर-नीचे होता है, जबकि उसके पीछे का शिखर P की ओर बढ़ता है',
    id: 'P hanya naik turun di tempatnya, sementara puncak di belakangnya bergerak menuju P',
    pt: 'P só sobe e desce no lugar, enquanto a crista atrás dele avança em direção a P',
  },
  'caption.result': {
    ko: 'P 가 한 번 오르내린 시간 T 동안 마루는 꼭 한 파장 λ 를 갔다',
    en: 'In the time T that P took to rise and fall once, the crest moved exactly one wavelength λ',
    ja: 'P が一回上下する時間 T の間に、山はちょうど一波長 λ 進んだ',
    zh: '在 P 上下起伏一次所用的时间 T 内，波峰恰好前进了一个波长 λ',
    ar: 'في الزمن T الذي استغرقه P ليرتفع وينخفض مرة واحدة، تقدمت القمة طولًا موجيًا واحدًا λ بالضبط',
    es: 'En el tiempo T que tardó P en subir y bajar una vez, la cresta avanzó exactamente una longitud de onda λ',
    fr: 'Pendant le temps T qu’a mis P pour monter et descendre une fois, la crête a avancé d’exactement une longueur d’onde λ',
    hi: 'जितने समय T में P एक बार ऊपर-नीचे हुआ, उतने में शिखर ठीक एक तरंगदैर्घ्य λ आगे गया',
    id: 'Dalam waktu T yang diperlukan P untuk naik turun sekali, puncak bergerak tepat satu panjang gelombang λ',
    pt: 'No tempo T que P levou para subir e descer uma vez, a crista avançou exatamente um comprimento de onda λ',
  },
} satisfies Record<string, LocalizedText>);

export type WaveBasicsMessageKey = keyof typeof waveBasicsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveBasicsMessageKey): LocalizedText => waveBasicsMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveBasicsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveBasicsSchema: BundleSchema = {
  id: WAVE_BASICS_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  parameters: [],

  stages: [
    {
      id: 'rope',
      label: text('label.stage'),
      constants: { wavelength: WAVELENGTH, amplitude: AMPLITUDE, period: PERIOD },
    },
  ],

  environments: [],

  views: [{ id: 'rope', label: text('label.view'), default: true }],

  /**
   * 가로로 긴 그림이다 — 줄 7.7 m 와 자취 3 m 를 나란히 두고, 세로는 진폭 ± 0.8 과 위의
   * 캡션 줄 · 아래의 조작기 줄뿐이다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다. λ 치수선(점선) 위를 강조 막대가 덮어 가며 채워야 하고, P 는
   * 줄 위에 얹혀야 한다. 층 순서로는 치수선이 막대 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 한 번 오르내림(절반 속도) → 멈춘 그림 → 흐려짐.
   *
   * `travel` 이 끝나는 순간 물결은 정확히 한 주기를 돌아 **처음과 같은 모양**이라, 멈춘 뒤
   * 다음 주기의 `travel` 로 넘어가도 줄이 튀지 않는다. 흐려지는 것은 막대 · 자취 · 마루
   * 표지뿐이다.
   */
  timeline: {
    phases: [
      {
        id: 'travel',
        duration: TRAVEL,
        timeScale: SLOW_MOTION,
        caption: key('caption.travel'),
      },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — v = λ/T 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 「마루가 간 거리 =
   * 마루 사이 거리」 한 쌍이라, 치수선 하나로 직접 견준다.
   */

  messages: waveBasicsMessages,
};
