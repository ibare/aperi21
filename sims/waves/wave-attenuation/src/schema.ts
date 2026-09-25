// ========================================================================
// wave-attenuation — 선언
// ========================================================================
// 질문: 퍼지지 않는 파동도 나아가면서 약해지는가. 약해진다면 어떤 식으로 줄어드는가.
//
// 한 줄 위를 파동이 오른쪽으로 나아간다. 줄은 파동을 넓게 퍼뜨리지 않는데도(거리 제곱
// 퍼짐은 `sound-intensity` 몫이다) 마루는 나아갈수록 낮아진다 — 줄이 파동의 에너지를
// 흡수한다. 마루 하나를 따라가며, 같은 거리 d 를 지날 때마다 그 자리 높이를 아래 판에
// 막대로 남긴다. 새 막대는 앞 막대 높이의 점선 윤곽 안에서 늘 같은 몫(절반)까지만 찬다 —
// 같은 거리마다 같은 **양**이 아니라 같은 **비율**로 준다. A = A0 · e^(−αx).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-attenuation` 와 문자 그대로 일치한다 (C4). */
export const WAVE_ATTENUATION_ID = 'wave-attenuation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 손잡이 자리(x = 0)의 진폭 A0(m). */
export const AMPLITUDE = 0.8;
/** 파장 λ(m). */
export const WAVELENGTH = 1;
/** 주기 T(s). 파속 = λ / T = 1.25 m/s. */
export const PERIOD = 0.8;
/**
 * 흡수 계수 α(1/m). 진폭이 e^(−αx) 로 준다. 기본값은 표시점 간격 d 마다 진폭이 절반이
 * 되도록 ln 2 / 2.5 ≈ 0.2773 으로 잡았다 — e^(−0.2773 × 2.5) = 0.49995.
 */
export const ABSORPTION = 0.2773;
/** 높이를 재는 표시점 사이의 거리 d(m). 같은 거리라는 것이 이 조각의 전제다. */
export const MARK_SPACING = 2.5;
/**
 * 표시점 하나를 지날 때 남는 몫(정박값). 화면의 `×0.5` 가 이 값이다 — 계산한 e^(−αd) 를
 * 반올림해 띄우지 않는다 (S-piece 유효숫자). α · d 와의 관계는 선언할 자리가 없다(G143).
 */
export const STEP_RATIO = 0.5;
/** 표시점 개수(x = 0 포함). 네 개면 1 → 1/2 → 1/4 → 1/8 까지 보인다. */
export const MARK_COUNT = 4;

// ------------------------------------------------------------------------
// 배치 — 월드 미터
// ------------------------------------------------------------------------

/** 줄의 평형 높이. */
export const ROPE_Y = 0;
/** 마지막 표시점 너머로 줄이 더 나가는 길이. 마루가 표시점을 지나 빠져나갈 자리다. */
export const ROPE_TAIL = 0.7;
/** 높이 막대 판의 바닥선 높이. 줄의 가장 깊은 골(−A0) 아래에 띄운다. */
export const BAR_BASE_Y = -1.95;

/**
 * 프레이밍은 주장의 일부다. 가로는 손잡이 앞부터 줄 끝 너머까지, 세로는 거리 치수선
 * 아래부터 가장 높은 마루 위의 캡션 줄 자리까지. 기본 상수(A0 0.8 · d 2.5 · 표시점 4)에
 * 맞춘 고정값이다 — 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.6, maxX: 8.65, minY: -2.55, maxY: 1.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이
// ------------------------------------------------------------------------

/**
 * 마루 하나가 줄을 건너가는 동안. 기본값은 (마지막 표시점 + λ) / 파속 에 여유를 더한 수다 —
 * 마루가 x = 0 에 들어서기까지 최대 한 파장을 기다린다. 마루의 자리는 단계 경계가 아니라
 * 파속 × 흐른 시간이라, 이 길이를 바꿔도 막대가 남는 자리는 틀리지 않는다(G13).
 */
/** 마루가 마지막 표시점을 지나 줄 끝으로 빠져나갈 여유(초). */
export const TRAVEL_MARGIN = 0.3;
export const TRAVEL =
  ((MARK_COUNT - 1) * MARK_SPACING + WAVELENGTH) / (WAVELENGTH / PERIOD) + TRAVEL_MARGIN;
/** 네 막대가 다 선 그림을 읽는 동안 · 막대가 흐려지는 동안. */
export const HOLD = 3.6;
export const FADE = 0.6;
/**
 * 도착한 순간 이미 진행 중이다 — 마루가 첫 표시점을 지나 첫 막대가 서 있는 자리에서 연다.
 * 줄은 조각 시계의 함수라 처음부터 물결이 차 있다.
 */
export const START_AT = 1.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveAttenuationMessages = Object.freeze({
  'label.title': {
    ko: '파동의 감쇠',
    en: 'Attenuation of a wave',
    ja: '波の減衰',
    zh: '波的衰减',
    ar: 'توهين الموجة',
    es: 'Atenuación de una onda',
    fr: 'Atténuation d’une onde',
    hi: 'तरंग का क्षीणन',
    id: 'Atenuasi gelombang',
    pt: 'Atenuação de uma onda',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '같은 거리마다 같은 비율로 낮아지는 진폭',
    en: 'An amplitude that falls by the same ratio over each equal distance',
    ja: '同じ距離ごとに同じ割合で小さくなる振幅',
    zh: '每经过相同距离就按相同比例减小的振幅',
    ar: 'سعة تنخفض بالنسبة نفسها عبر كل مسافة متساوية',
    es: 'Una amplitud que baja en la misma proporción en cada distancia igual',
    fr: 'Une amplitude qui baisse dans la même proportion à chaque distance égale',
    hi: 'ऐसा आयाम जो हर समान दूरी पर समान अनुपात में घटता है',
    id: 'Amplitudo yang turun dengan rasio sama pada setiap jarak yang sama',
    pt: 'Uma amplitude que diminui na mesma proporção a cada distância igual',
  },
  'label.stage': {
    ko: '흡수하는 줄',
    en: 'An absorbing rope',
    ja: '吸収するロープ',
    zh: '吸收能量的绳',
    ar: 'حبل ماصّ',
    es: 'Una cuerda que absorbe',
    fr: 'Une corde absorbante',
    hi: 'अवशोषित करने वाली रस्सी',
    id: 'Tali yang menyerap',
    pt: 'Uma corda que absorve',
  },
  'label.view': {
    ko: '줄과 높이 막대',
    en: 'Rope and height bars',
    ja: 'ロープと高さの棒',
    zh: '绳与高度条',
    ar: 'الحبل وأعمدة الارتفاع',
    es: 'Cuerda y barras de altura',
    fr: 'Corde et barres de hauteur',
    hi: 'रस्सी और ऊँचाई की पट्टियाँ',
    id: 'Tali dan batang tinggi',
    pt: 'Corda e barras de altura',
  },
  /** 새 막대가 앞 막대 높이의 몇 배인지. 수식 표기라 번역 대상이 아니다 (C1 판정 3). 값은 스테이지 상수다. */
  'label.stepRatio': {
    ko: '×{q}',
    en: '×{q}',
    ja: '×{q}',
    zh: '×{q}',
    ar: '×{q}',
    es: '×{q}',
    fr: '×{q}',
    hi: '×{q}',
    id: '×{q}',
    pt: '×{q}',
  },
  /** 표시점 사이 거리. 단위 표기라 표식이다. 값은 스테이지 상수다. */
  'label.spacing': {
    ko: '{d} m',
    en: '{d} m',
    ja: '{d} m',
    zh: '{d} m',
    ar: '{d} m',
    es: '{d} m',
    fr: '{d} m',
    hi: '{d} m',
    id: '{d} m',
    pt: '{d} m',
  },
  'caption.travel': {
    ko: '퍼지지 않는 한 줄인데도 마루는 나아갈수록 낮아진다 — 줄이 파동의 에너지를 흡수한다',
    en: 'The rope does not spread the wave, yet the crest gets lower as it travels — the rope absorbs its energy',
    ja: 'ロープは波を広げないのに、山は進むほど低くなる — ロープが波のエネルギーを吸収している',
    zh: '绳子并不让波扩散，波峰却越走越低 — 绳子吸收了波的能量',
    ar: 'لا ينشر الحبل الموجة، ومع ذلك تنخفض القمة كلما تقدمت — فالحبل يمتص طاقتها',
    es: 'La cuerda no dispersa la onda, y aun así la cresta baja a medida que avanza — la cuerda absorbe su energía',
    fr: 'La corde n’étale pas l’onde, et pourtant la crête s’abaisse à mesure qu’elle avance — la corde absorbe son énergie',
    hi: 'रस्सी तरंग को फैलाती नहीं, फिर भी आगे बढ़ते हुए शिखर नीचा होता जाता है — रस्सी उसकी ऊर्जा अवशोषित करती है',
    id: 'Tali tidak menyebarkan gelombang, tetapi puncak makin rendah seiring merambat — tali menyerap energinya',
    pt: 'A corda não espalha a onda, mas a crista fica mais baixa à medida que avança — a corda absorve sua energia',
  },
  'caption.result': {
    ko: '같은 거리를 지날 때마다 앞 높이의 같은 몫만 남는다 — 줄어드는 양이 아니라 비율이 같다',
    en: 'Each equal stretch leaves the same fraction of the height before it — the ratio is fixed, not the amount lost',
    ja: '同じ距離を進むたびに、手前の高さの同じ割合だけが残る — 一定なのは減る量ではなく比率だ',
    zh: '每经过相同的一段距离，都只剩下前一个高度的相同比例 — 不变的是比例，而不是减少的量',
    ar: 'كل مسافة متساوية تُبقي الكسر نفسه من الارتفاع الذي قبلها — الثابت هو النسبة لا المقدار المفقود',
    es: 'Cada tramo igual deja la misma fracción de la altura anterior — lo fijo es la proporción, no la cantidad perdida',
    fr: 'Chaque tronçon égal laisse la même fraction de la hauteur précédente — c’est le rapport qui est fixe, pas la quantité perdue',
    hi: 'हर बराबर दूरी पिछली ऊँचाई का वही अंश छोड़ती है — स्थिर अनुपात है, घटी हुई मात्रा नहीं',
    id: 'Setiap jarak yang sama menyisakan bagian yang sama dari tinggi sebelumnya — yang tetap adalah rasionya, bukan jumlah yang hilang',
    pt: 'Cada trecho igual deixa a mesma fração da altura anterior — o que é fixo é a razão, não a quantidade perdida',
  },
} satisfies Record<string, LocalizedText>);

export type WaveAttenuationMessageKey = keyof typeof waveAttenuationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveAttenuationMessageKey): LocalizedText => waveAttenuationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveAttenuationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveAttenuationSchema: BundleSchema = {
  id: WAVE_ATTENUATION_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 마루가 건너가며 막대를 남기고, 다 선 그림을 보인 뒤 다시 시작한다.
  parameters: [],

  stages: [
    {
      id: 'absorbing-rope',
      label: text('label.stage'),
      constants: {
        amplitude: AMPLITUDE,
        wavelength: WAVELENGTH,
        period: PERIOD,
        absorption: ABSORPTION,
        markSpacing: MARK_SPACING,
        stepRatio: STEP_RATIO,
        markCount: MARK_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rope', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 줄 하나와 그 아래 막대 판뿐이다 (S-piece — 세로가 비싸다). */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다. 새 막대는 앞 높이의 점선 윤곽 **안**에 차올라 보여야 하고, 마루를
   * 타는 점은 줄 **위**에 얹혀야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 마루 하나가 건너가며 막대를 남김 → 다 선 그림 → 막대가 흐려짐.
   *
   * 줄의 물결은 조각 시계 `t` 의 함수라 주기가 바뀌어도 끊기지 않는다. 따라가는 마루만
   * 매 주기 `travel` 의 시작에서 x = 0 에 가장 가까운 마루로 다시 고른다.
   */
  timeline: {
    phases: [
      { id: 'travel', duration: TRAVEL, caption: key('caption.travel') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — A = A0 · e^(−αx) 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 표시점 사이의 같은 거리(치수선)와 막대가
   * 앞 윤곽을 채운 몫이다.
   */

  messages: waveAttenuationMessages,
};
