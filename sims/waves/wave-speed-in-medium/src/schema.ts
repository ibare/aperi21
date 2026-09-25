// ========================================================================
// wave-speed-in-medium — 선언
// ========================================================================
// 질문: 파동이 얼마나 빨리 가는지는 누가 정하나.
//
// 세 줄에 같은 모양의 펄스를 같은 순간 보낸다. 가운데가 기준 줄(장력 T · 선밀도 μ),
// 위는 장력만 네 배, 아래는 선밀도만 네 배다. 같은 시간 동안 위 줄의 펄스는 기준의 두 배를,
// 아래 줄의 펄스는 절반을 간다 — 속도는 펄스가 아니라 줄(매질)이 정한다. 식 v = √(T/μ) 는
// 문단이 말하고 그림은 간 거리 막대의 길이로 보인다.
//
// 이웃과 가르는 것 — `wave-basics` 는 한 줄 위에서 v = λ/T 의 일치를, `transverse-wave` 는
// 흔들림과 나아감의 방향을 보인다. 이 조각은 λ · T 표지도, 구슬 자취도 두지 않고 줄 셋의 경주로 간다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-speed-in-medium` 와 문자 그대로 일치한다 (C4). */
export const WAVE_SPEED_IN_MEDIUM_ID = 'wave-speed-in-medium';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기준 줄의 장력 T(N). */
export const TENSION = 10;
/** 기준 줄의 선밀도 μ(kg/m). 기준 파속 √(T/μ) = 10 m/s. */
export const LINEAR_DENSITY = 0.1;
/** 위 줄의 장력 배수 — 장력만 이만큼 크다. 이름표 `4T` 의 수가 이 값이다. */
export const TENSION_FACTOR = 4;
/** 아래 줄의 선밀도 배수 — 줄만 이만큼 무겁다. 이름표 `4μ` 의 수가 이 값이다. */
export const DENSITY_FACTOR = 4;
/** 줄의 길이(m). 왼쪽 끝이 벽, 오른쪽 끝을 장력으로 당긴다. */
export const STRING_LENGTH = 10;
/** 펄스가 출발하는 자리(펄스 가운데, 벽에서 m). */
export const PULSE_START = 1;
/** 펄스 높이(m). 세 줄 모두 같다. */
export const PULSE_AMPLITUDE = 0.4;
/** 펄스 반폭(가우스 폭 σ, m). 세 줄 모두 같다 — 모양은 같고 빠르기만 다르다. */
export const PULSE_WIDTH = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 줄은 x 축을 따라 놓이고 벽이 x = 0 이다.
// ------------------------------------------------------------------------

/** 세 줄의 평형 높이 — 위(장력 배수) · 가운데(기준) · 아래(선밀도 배수). */
export const LANE_Y = { taut: 2.6, base: 1.3, heavy: 0 } as const;
/** 간 거리 막대가 줄 평형선 아래로 떨어진 간격. */
export const BAR_GAP = 0.2;
/** 장력 T 하나에 해당하는 당김 화살표 길이(m). 네 배 장력은 네 배 길이다. */
export const ARROW_PER_TENSION = 0.3;
/** 당김 화살표가 줄 끝에서 떨어진 간격. */
export const ARROW_GAP = 0.08;
/** 벽 두께 · 한 줄 몫 높이(m). */
export const WALL_WIDTH = 0.16;
export const WALL_HALF_HEIGHT = 0.5;
/** 줄 이름표 자리 — 벽 왼쪽. */
export const LABEL_X = -0.75;

/**
 * 프레이밍 — 가로는 이름표부터 네 배 장력 화살표 끝까지, 세로는 아래 줄 막대부터 위 줄 펄스 위
 * 캡션 줄 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 11.9, minY: -0.65, maxY: 3.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (조각 시계 초 = 물리 초)
// ------------------------------------------------------------------------

/** 가장 빠른 줄(장력 배수)의 파속 — 기본값으로 센다. 단계 길이를 정하는 데만 쓴다. */
const FASTEST_SPEED = Math.sqrt((TENSION * TENSION_FACTOR) / LINEAR_DENSITY);
/**
 * 경주 — 가장 빠른 펄스가 줄 끝 가까이(벽에서 L − 출발 자리)에 닿는 시간. 물리는 이 단계의
 * 길이와 진행도로 시각을 읽는다(`τ = duration · at`). 기본값으로 0.4 초.
 */
export const RACE = (STRING_LENGTH - 2 * PULSE_START) / FASTEST_SPEED;
/** 경주를 느리게 흘린다 — 실시간 0.4 초는 눈으로 견줄 수 없다. 화면에서 4 초. */
export const SLOW_MOTION = 0.1;
/** 멈춘 그림을 읽는 동안 · 펄스와 막대가 흐려지는 동안. */
export const HOLD = 2.6;
export const FADE = 0.6;
/** 도착한 순간 이미 진행 중이다 — 경주의 30 % 에서 연다. 세 펄스가 이미 벌어져 있다. */
export const START_AT = RACE * 0.3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveSpeedInMediumMessages = Object.freeze({
  'label.title': {
    ko: '매질과 파동 속도',
    en: 'Wave speed and the medium',
    ja: '媒質と波の速さ',
    zh: '介质与波速',
    ar: 'سرعة الموجة والوسط',
    es: 'La rapidez de onda y el medio',
    fr: 'La vitesse d’une onde et le milieu',
    hi: 'तरंग की चाल और माध्यम',
    id: 'Kelajuan gelombang dan medium',
    pt: 'A velocidade da onda e o meio',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '장력과 선밀도가 정하는 속도',
    en: 'The speed set by tension and linear density',
    ja: '張力と線密度が決める速さ',
    zh: '由张力和线密度决定的速率',
    ar: 'السرعة التي تحددها قوة الشد والكثافة الطولية',
    es: 'La rapidez fijada por la tensión y la densidad lineal',
    fr: 'La vitesse fixée par la tension et la masse linéique',
    hi: 'तनाव और रैखिक घनत्व से तय होने वाली चाल',
    id: 'Kelajuan yang ditentukan oleh tegangan tali dan rapat massa linear',
    pt: 'A velocidade definida pela tração e pela densidade linear',
  },
  'label.stage': {
    ko: '세 줄 경주',
    en: 'Three-string race',
    ja: '3本の弦の競走',
    zh: '三根弦的赛跑',
    ar: 'سباق الأوتار الثلاثة',
    es: 'Carrera de tres cuerdas',
    fr: 'Course de trois cordes',
    hi: 'तीन डोरियों की दौड़',
    id: 'Balapan tiga tali',
    pt: 'Corrida de três cordas',
  },
  'label.view': {
    ko: '같은 펄스, 다른 줄',
    en: 'Same pulse, different strings',
    ja: '同じパルス、違う弦',
    zh: '同样的脉冲，不同的弦',
    ar: 'النبضة نفسها، أوتار مختلفة',
    es: 'Mismo pulso, distintas cuerdas',
    fr: 'Même impulsion, cordes différentes',
    hi: 'एक ही स्पंद, अलग-अलग डोरियाँ',
    id: 'Pulsa sama, tali berbeda',
    pt: 'Mesmo pulso, cordas diferentes',
  },
  /** 줄 이름표. 수식 표기라 번역 대상이 아니다 (C1 판정 3). 배수는 스테이지 상수를 `{k}` 로 끼운다. */
  'label.laneTaut': {
    ko: '{k}T · μ',
    en: '{k}T · μ',
    ja: '{k}T · μ',
    zh: '{k}T · μ',
    ar: '{k}T · μ',
    es: '{k}T · μ',
    fr: '{k}T · μ',
    hi: '{k}T · μ',
    id: '{k}T · μ',
    pt: '{k}T · μ',
  },
  'label.laneBase': {
    ko: 'T · μ',
    en: 'T · μ',
    ja: 'T · μ',
    zh: 'T · μ',
    ar: 'T · μ',
    es: 'T · μ',
    fr: 'T · μ',
    hi: 'T · μ',
    id: 'T · μ',
    pt: 'T · μ',
  },
  'label.laneHeavy': {
    ko: 'T · {k}μ',
    en: 'T · {k}μ',
    ja: 'T · {k}μ',
    zh: 'T · {k}μ',
    ar: 'T · {k}μ',
    es: 'T · {k}μ',
    fr: 'T · {k}μ',
    hi: 'T · {k}μ',
    id: 'T · {k}μ',
    pt: 'T · {k}μ',
  },
  'caption.race': {
    ko: '세 줄에 같은 모양의 펄스를 동시에 보냈다 — 줄마다 나아가는 빠르기가 다르다',
    en: 'The same pulse was sent down three strings at once — each string carries it at a different speed',
    ja: '同じ形のパルスを3本の弦に同時に送った — 弦ごとに伝わる速さが違う',
    zh: '同样的脉冲同时沿三根弦发出 — 每根弦传播它的速率各不相同',
    ar: 'أُرسلت النبضة نفسها على ثلاثة أوتار في آنٍ واحد — ينقلها كل وتر بسرعة مختلفة',
    es: 'Se envió el mismo pulso por tres cuerdas a la vez — cada cuerda lo lleva con una rapidez distinta',
    fr: 'La même impulsion a été envoyée sur trois cordes à la fois — chaque corde la transporte à une vitesse différente',
    hi: 'एक ही स्पंद तीन डोरियों पर एक साथ भेजा गया — हर डोरी उसे अलग चाल से ले जाती है',
    id: 'Pulsa yang sama dikirim lewat tiga tali sekaligus — tiap tali membawanya dengan kelajuan berbeda',
    pt: 'O mesmo pulso foi enviado por três cordas ao mesmo tempo — cada corda o leva com uma velocidade diferente',
  },
  'caption.result': {
    ko: '같은 시간 동안 팽팽한 줄의 펄스는 기준의 두 배를, 무거운 줄의 펄스는 절반을 갔다',
    en: 'In the same time, the pulse on the tighter string went twice as far, and on the heavier string half as far',
    ja: '同じ時間に、張りの強い弦のパルスは2倍、重い弦のパルスは半分の距離を進んだ',
    zh: '在相同时间内，较紧的弦上的脉冲走了两倍远，较重的弦上的脉冲只走了一半',
    ar: 'في الزمن نفسه، قطعت النبضة على الوتر الأشد توترًا ضعف المسافة، وعلى الوتر الأثقل نصفها',
    es: 'En el mismo tiempo, el pulso de la cuerda más tensa llegó el doble de lejos, y el de la más pesada, la mitad',
    fr: 'Dans le même temps, l’impulsion sur la corde plus tendue est allée deux fois plus loin, et sur la corde plus lourde, moitié moins loin',
    hi: 'समान समय में, अधिक तनी डोरी पर स्पंद दोगुनी दूरी तक गया, और भारी डोरी पर आधी दूरी तक',
    id: 'Dalam waktu yang sama, pulsa pada tali yang lebih tegang menempuh jarak dua kali, dan pada tali yang lebih berat setengahnya',
    pt: 'No mesmo tempo, o pulso na corda mais tensa foi duas vezes mais longe, e na corda mais pesada, metade da distância',
  },
} satisfies Record<string, LocalizedText>);

export type WaveSpeedInMediumMessageKey = keyof typeof waveSpeedInMediumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveSpeedInMediumMessageKey): LocalizedText => waveSpeedInMediumMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveSpeedInMediumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveSpeedInMediumSchema: BundleSchema = {
  id: WAVE_SPEED_IN_MEDIUM_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 손잡이를 두지 않는다 — 세 줄이 이미 「장력을 올린 줄」 과 「무거운 줄」 의 대조를 동시에 보인다.
  parameters: [],

  stages: [
    {
      id: 'race',
      label: text('label.stage'),
      constants: {
        tension: TENSION,
        linearDensity: LINEAR_DENSITY,
        tensionFactor: TENSION_FACTOR,
        densityFactor: DENSITY_FACTOR,
        length: STRING_LENGTH,
        pulseStart: PULSE_START,
        amplitude: PULSE_AMPLITUDE,
        pulseWidth: PULSE_WIDTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'race', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 줄 셋과 위의 캡션 한 줄뿐 (S-piece — 세로가 비싸다). */
  canvas: { height: 320, minHeight: 280 },

  /** 겹침 순서가 판정 장치다 — 막대 · 눈금 → 줄 → 벽 · 화살표. 층 순서로는 막대가 줄 위로 올라온다. */
  drawOrder: 'scene',

  /**
   * 경주(느리게) → 멈춘 그림 → 흐려짐. 멈추는 동안 물리 시각은 `at('race') = 1` 에 붙잡힌다.
   */
  timeline: {
    phases: [
      { id: 'race', duration: RACE, timeScale: SLOW_MOTION, caption: key('caption.race') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — v = √(T/μ) 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 견주는 것은 막대 셋의 길이다. */

  messages: waveSpeedInMediumMessages,
};
