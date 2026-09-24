// ========================================================================
// wave-energy — 선언
// ========================================================================
// 질문: 진폭이 두 배인 파동은 에너지를 얼마나 더 나르나.
//
// 같은 줄 둘이 같은 진동수 · 같은 파장으로 흔들린다. 아래 줄만 진폭이 두 배다.
// 줄 오른쪽 끝의 고리가 파동을 받아 삼키고, 그 옆 막대가 끝에 닿은 에너지를 쌓는다.
// 막대는 고리가 빨리 움직이는 순간에 빨리 차고(받는 일률 ∝ 고리 속력²), 두 막대는
// 같은 박자에 차오른다. 같은 시간이 지나면 위 막대는 한 칸, 아래 막대는 네 칸이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-energy` 와 문자 그대로 일치한다 (C4). */
export const WAVE_ENERGY_ID = 'wave-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 위 줄의 진폭 A(m). */
export const AMPLITUDE = 0.3;
/** 아래 줄의 진폭 배수. 이 조각이 바꾸는 유일한 수다 — 화면의 `2A` 가 이 값이다. */
export const AMPLITUDE_RATIO = 2;
/** 파장 λ(m). 두 줄이 같다. */
export const WAVELENGTH = 2;
/** 주기 T(s). 두 줄이 같다 — 같은 진동수. */
export const PERIOD = 1.2;
/**
 * 손잡이에서 받는 고리까지의 줄 길이(m). 세 파장이 들어간다. 고리가 받는 일률의 위상이
 * 이 길이에 달려 있어 물리량이다. 경계(`SCENE_BOUNDS`) · 막대 자리(`BAR_START`)는 이 기본값에 맞춰 잡았다.
 */
export const ROPE_LENGTH = 6;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 줄을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 줄의 왼쪽 끝(흔드는 손잡이) 자리. 배치의 원점이다. */
export const ROPE_START = 0;

/** 위 줄(진폭 A) · 아래 줄(진폭 2A)의 평형 높이. */
export const LANE_TOP_Y = 1.55;
export const LANE_BOTTOM_Y = 0;

/** 에너지 막대가 시작하는 x 와 한 칸의 가로 길이(월드 m). 한 칸 = 위 줄이 채우는 양. */
export const BAR_START = 6.75;
export const CELL = 0.72;
/** 에너지 막대의 두께(월드 m). 줄의 평형 높이에 가운데를 맞춘다. */
export const BAR_THICKNESS = 0.34;

/** A 치수선이 줄 왼쪽 끝에서 떨어진 x. */
export const AMPLITUDE_DIM_X = -0.55;

/**
 * 프레이밍은 주장의 일부다. 가로는 A 치수선 글자부터 네 칸 막대 끝 너머까지, 세로는
 * 아래 줄의 바닥(−2A)과 눈금 이름표 아래 · 위 줄 마루 위의 캡션 줄 자리까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.15, maxX: 10.05, minY: -1.05, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이
// ------------------------------------------------------------------------

/** 막대가 비어 있는 채 두 줄이 흔들리는 것을 보는 동안. */
export const WATCH = 1.8;
/**
 * 끝에 닿은 에너지가 쌓이는 동안. 물리는 이 단계의 **시작과 끝**을 시간표에게 묻는다
 * (`start('fill')` · `end('fill')`) — 길이를 바꾸면 한 칸을 채우는 데 걸리는 시간만 바뀌고
 * 「위 한 칸 · 아래 네 칸」 은 그대로다.
 */
export const FILL = 4.8;
/** 다 찬 그림을 읽는 동안 · 막대가 흐려지는 동안. */
export const HOLD = 2.8;
export const FADE = 0.6;
/**
 * 도착한 순간 이미 진행 중이다 — 쌓이기 시작한 지 한 주기 남짓 지난 자리에서 연다.
 * 두 줄은 흔들리고 있고 막대가 조금씩 차 있다.
 */
export const START_AT = WATCH + 1.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveEnergyMessages = Object.freeze({
  'label.title': {
    ko: '파동의 에너지',
    en: 'Energy of a wave',
    ja: '波のエネルギー',
    zh: '波的能量',
    ar: 'طاقة الموجة',
    es: 'Energía de una onda',
    fr: 'Énergie d’une onde',
    hi: 'तरंग की ऊर्जा',
    id: 'Energi gelombang',
    pt: 'Energia de uma onda',
  },
  'label.operation': {
    ko: '진폭 제곱에 비례하는 에너지',
    en: 'Energy grows with the square of the amplitude',
    ja: 'エネルギーは振幅の2乗に比例して増える',
    zh: '能量随振幅的平方增长',
    ar: 'تزداد الطاقة مع مربع السعة',
    es: 'La energía crece con el cuadrado de la amplitud',
    fr: 'L’énergie croît avec le carré de l’amplitude',
    hi: 'ऊर्जा आयाम के वर्ग के साथ बढ़ती है',
    id: 'Energi bertambah sebanding dengan kuadrat amplitudo',
    pt: 'A energia cresce com o quadrado da amplitude',
  },
  'label.stage': {
    ko: '같은 진동수의 두 줄',
    en: 'Two ropes at the same frequency',
    ja: '同じ振動数の2本のロープ',
    zh: '同一频率的两根绳',
    ar: 'حبلان بالتردد نفسه',
    es: 'Dos cuerdas con la misma frecuencia',
    fr: 'Deux cordes à la même fréquence',
    hi: 'समान आवृत्ति वाली दो रस्सियाँ',
    id: 'Dua tali dengan frekuensi sama',
    pt: 'Duas cordas com a mesma frequência',
  },
  'label.view': {
    ko: '줄과 끝의 에너지 막대',
    en: 'Ropes and the energy bars at their ends',
    ja: 'ロープと端のエネルギー棒',
    zh: '绳子与末端的能量条',
    ar: 'الحبال وأشرطة الطاقة عند أطرافها',
    es: 'Las cuerdas y las barras de energía en sus extremos',
    fr: 'Les cordes et les barres d’énergie à leurs extrémités',
    hi: 'रस्सियाँ और उनके सिरों पर ऊर्जा पट्टियाँ',
    id: 'Tali dan batang energi di ujungnya',
    pt: 'As cordas e as barras de energia nas pontas',
  },
  /** 그림에 새긴 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). 배수는 스테이지 상수다. */
  'label.amplitude': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.amplitudeScaled': {
    ko: '{k}A',
    en: '{k}A',
    ja: '{k}A',
    zh: '{k}A',
    ar: '{k}A',
    es: '{k}A',
    fr: '{k}A',
    hi: '{k}A',
    id: '{k}A',
    pt: '{k}A',
  },
  /** 막대 눈금 이름표. E 는 위 줄이 채운 한 칸이다. 표식이다. */
  'label.energyUnit': {
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
  'label.energyMultiple': {
    ko: '{n}E',
    en: '{n}E',
    ja: '{n}E',
    zh: '{n}E',
    ar: '{n}E',
    es: '{n}E',
    fr: '{n}E',
    hi: '{n}E',
    id: '{n}E',
    pt: '{n}E',
  },
  'caption.watch': {
    ko: '같은 진동수 — 아래 줄만 진폭이 두 배라, 끝의 고리가 두 배 빠르게 오르내린다',
    en: 'Same frequency — only the lower rope has twice the amplitude, so its end ring moves twice as fast',
    ja: '同じ振動数 — 下のロープだけ振幅が2倍なので、端の輪が2倍の速さで上下する',
    zh: '相同频率 — 只有下面的绳振幅是两倍，所以末端的环以两倍的速度上下运动',
    ar: 'التردد نفسه — الحبل السفلي وحده سعته مضاعفة، لذا تتحرك حلقة طرفه بسرعة مضاعفة',
    es: 'Misma frecuencia — solo la cuerda de abajo tiene el doble de amplitud, así que la anilla de su extremo se mueve el doble de rápido',
    fr: 'Même fréquence — seule la corde du bas a une amplitude double, donc l’anneau à son extrémité bouge deux fois plus vite',
    hi: 'समान आवृत्ति — केवल नीचे की रस्सी का आयाम दोगुना है, इसलिए उसके सिरे का छल्ला दोगुनी तेज़ी से चलता है',
    id: 'Frekuensi sama — hanya tali bawah yang amplitudonya dua kali, jadi cincin di ujungnya bergerak dua kali lebih cepat',
    pt: 'Mesma frequência — só a corda de baixo tem o dobro da amplitude, então o anel na ponta se move duas vezes mais rápido',
  },
  'caption.fill': {
    ko: '끝에 닿은 에너지가 쌓인다 — 두 막대는 같은 박자에 차고, 아래 막대는 네 배씩 찬다',
    en: 'The energy reaching the ends piles up — both bars grow on the same beat, the lower one four times as much',
    ja: '端に届いたエネルギーがたまっていく — 2本の棒は同じ拍子で伸び、下の棒は4倍ずつ伸びる',
    zh: '到达末端的能量不断累积 — 两根条按同样的节拍增长，下面那根增长四倍',
    ar: 'تتراكم الطاقة الواصلة إلى الأطراف — يمتلئ الشريطان على الإيقاع نفسه، والسفلي بأربعة أضعاف',
    es: 'La energía que llega a los extremos se acumula — ambas barras crecen al mismo compás, la de abajo cuatro veces más',
    fr: 'L’énergie qui atteint les extrémités s’accumule — les deux barres montent au même rythme, celle du bas quatre fois plus',
    hi: 'सिरों तक पहुँची ऊर्जा जमा होती जाती है — दोनों पट्टियाँ एक ही लय में बढ़ती हैं, नीचे वाली चार गुना',
    id: 'Energi yang sampai di ujung menumpuk — kedua batang bertambah pada ketukan yang sama, yang bawah empat kali lipat',
    pt: 'A energia que chega às pontas se acumula — as duas barras crescem no mesmo ritmo, a de baixo quatro vezes mais',
  },
  'caption.result': {
    ko: '같은 시간 동안 진폭이 두 배인 파동은 네 배의 에너지를 날랐다',
    en: 'In the same time, the wave with twice the amplitude carried four times the energy',
    ja: '同じ時間に、振幅が2倍の波は4倍のエネルギーを運んだ',
    zh: '在相同时间内，振幅为两倍的波输送了四倍的能量',
    ar: 'في الزمن نفسه، نقلت الموجة ذات السعة المضاعفة أربعة أضعاف الطاقة',
    es: 'En el mismo tiempo, la onda con el doble de amplitud transportó cuatro veces la energía',
    fr: 'Dans le même temps, l’onde d’amplitude double a transporté quatre fois plus d’énergie',
    hi: 'समान समय में, दोगुने आयाम वाली तरंग ने चार गुना ऊर्जा पहुँचाई',
    id: 'Dalam waktu yang sama, gelombang dengan amplitudo dua kali membawa energi empat kali lipat',
    pt: 'No mesmo tempo, a onda com o dobro da amplitude transportou quatro vezes a energia',
  },
} satisfies Record<string, LocalizedText>);

export type WaveEnergyMessageKey = keyof typeof waveEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveEnergyMessageKey): LocalizedText => waveEnergyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveEnergyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveEnergySchema: BundleSchema = {
  id: WAVE_ENERGY_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 줄이 흔들리고, 막대가 차고, 다시 비워진다.
  parameters: [],

  stages: [
    {
      id: 'two-ropes',
      label: text('label.stage'),
      constants: {
        amplitude: AMPLITUDE,
        amplitudeRatio: AMPLITUDE_RATIO,
        wavelength: WAVELENGTH,
        period: PERIOD,
        ropeLength: ROPE_LENGTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ropes', label: text('label.view'), default: true }],

  /**
   * 가로로 긴 그림이다 — 줄 6 m 와 막대 네 칸을 나란히 두고, 세로는 두 줄과 캡션 줄뿐이다
   * (S-piece — 세로가 비싸다).
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다. 차오르는 막대는 빈 막대 틀 **위**에, 눈금선은 그 위에, 고리는
   * 줄 끝 **위**에 얹혀야 한다. 층 순서로는 `region` 이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 막대가 빈 채 보기 → 쌓임 → 다 찬 그림 → 흐려짐.
   *
   * 줄의 물결은 조각 시계 `t` 의 함수라 주기가 바뀌어도 끊기지 않는다. 막대만 매 주기
   * `fill` 의 시작에서 0 부터 다시 쌓인다.
   */
  timeline: {
    phases: [
      { id: 'watch', duration: WATCH, caption: key('caption.watch') },
      { id: 'fill', duration: FILL, caption: key('caption.fill') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — E ∝ A² 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **칸 수**라, 막대 눈금으로
   * 직접 센다.
   */

  messages: waveEnergyMessages,
};
