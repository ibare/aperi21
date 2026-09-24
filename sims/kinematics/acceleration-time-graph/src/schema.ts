// ========================================================================
// acceleration-time-graph — 선언
// ========================================================================
// 질문: 가속도-시간 그래프 아래 넓이가 왜 속도 변화인가.
//
// 1초 칸의 넓이를 떼어 오른쪽 막대에 모양 그대로 얹으면, 쌓인 높이가 곧 속도 변화다.
// 축 아래 넓이는 쌓인 것을 깎아 낸다.
//
// 값은 모두 원본(tasks/piece-lab/acceleration-time-graph/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:acceleration-time-graph` 와 문자 그대로 일치한다 (C4). */
export const ACCELERATION_TIME_GRAPH_ID = 'acceleration-time-graph';

// ------------------------------------------------------------------------
// 물리 — 1초 칸마다 일정한 가속도 (m/s²)
// ------------------------------------------------------------------------

/**
 * 0~2 s 2 · 2~4 s 1 · 4~5 s 0 · 5~7 s −1.5. 구간마다 일정해서 1초 칸 넓이가 근사가
 * 아니라 정확한 값이다. 속도 변화는 2 → 4 → 5 → 6 → 6 → 4.5 → 3.
 */
export const ACCEL: readonly number[] = [2, 2, 1, 1, 0, -1.5, -1.5];

/** 가속도 값을 적는 구간 `[시작 s, 끝 s]`. 같은 값이 이어지는 칸을 한 번만 적는다. */
export const SEGMENTS: readonly (readonly [number, number])[] = [
  [0, 2],
  [2, 4],
  [4, 5],
  [5, 7],
];

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스(860 × 300, px, y 아래로) 그대로
// ------------------------------------------------------------------------

/**
 * 두 좌표계가 맞물리는 조건 — 칸 폭(1 s = 80 px)이 막대 폭과 같고, 1 m/s² 의 높이(40 px)가
 * 1 m/s 의 높이와 같다. 그래서 칸의 높이가 그대로 쌓인 높이가 된다.
 */
export const LAYOUT = {
  width: 860,
  height: 300,
  /** 시간 0 의 x. */
  graphX0: 60,
  /** 1 초의 폭. */
  pxPerS: 80,
  /** 가속도 0 의 y. */
  axisY: 150,
  /** 1 m/s² 의 높이. */
  pxPerA: 40,
  /** 속도 변화 막대 왼쪽. */
  barX: 700,
  /** 속도 변화 0 의 y. */
  barBase: 280,
  /** 캡션이 캔버스 안으로 들어오며 그림 아래 더 잡는 자리. 원본은 캔버스 밖 한 줄. */
  captionRoom: 34,
} as const;

/** 글자 크기(화면 px). 원본 값 그대로. */
export const FONT = { label: 13, value: 15, caption: 15 } as const;

/**
 * 칸 하나의 연출 길이(초) — 떼어 옮기는 비행, 축 아래 칸이 막대를 깎는 시간.
 * 칸마다 시차를 두고 되풀이되는 일이라 단계로 나누지 못하고 스테이지 상수로 둔다
 * (NOTES 「어휘 부족」). 아래 시간표의 단계 길이는 이 둘에서 나왔다.
 */
export const SLAB_TIMING = { flight: 0.9, erase: 0.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const accelerationTimeGraphMessages = Object.freeze({
  'label.title': {
    ko: '가속도-시간 그래프',
    en: 'Acceleration-time graph',
    ja: '加速度-時間グラフ',
    zh: '加速度-时间图像',
    ar: 'التمثيل البياني للتسارع والزمن',
    es: 'Gráfica aceleración-tiempo',
    fr: 'Graphique accélération-temps',
    hi: 'त्वरण-समय ग्राफ़',
    id: 'Grafik percepatan-waktu',
    pt: 'Gráfico aceleração-tempo',
  },
  'label.operation': {
    ko: '넓이가 속도 변화인 표현',
    en: 'The area under the graph is the change in velocity',
    ja: 'グラフの下の面積は速度の変化',
    zh: '图像下方的面积就是速度的变化量',
    ar: 'المساحة تحت المنحنى هي التغير في السرعة',
    es: 'El área bajo la gráfica es el cambio de velocidad',
    fr: 'L’aire sous le graphique est la variation de vitesse',
    hi: 'ग्राफ़ के नीचे का क्षेत्रफल वेग में परिवर्तन है',
    id: 'Luas di bawah grafik adalah perubahan kecepatan',
    pt: 'A área sob o gráfico é a variação da velocidade',
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
  /** 그래프 세로축 이름. */
  'label.axisA': {
    ko: '가속도',
    en: 'acceleration',
    ja: '加速度',
    zh: '加速度',
    ar: 'التسارع',
    es: 'aceleración',
    fr: 'accélération',
    hi: 'त्वरण',
    id: 'percepatan',
    pt: 'aceleração',
  },
  /** 그래프 가로축 이름. */
  'label.axisT': {
    ko: '시간',
    en: 'time',
    ja: '時間',
    zh: '时间',
    ar: 'الزمن',
    es: 'tiempo',
    fr: 'temps',
    hi: 'समय',
    id: 'waktu',
    pt: 'tempo',
  },
  /** 막대 이름. */
  'label.bar': {
    ko: '속도 변화',
    en: 'change in velocity',
    ja: '速度の変化',
    zh: '速度的变化量',
    ar: 'التغير في السرعة',
    es: 'cambio de velocidad',
    fr: 'variation de vitesse',
    hi: 'वेग में परिवर्तन',
    id: 'perubahan kecepatan',
    pt: 'variação da velocidade',
  },
  /** 한 칸의 폭. 수와 단위는 표식이다 (C1 판정 3). */
  'label.second': {
    ko: '1 s',
    en: '1 s',
    ja: '1 s',
    zh: '1 s',
    ar: '1 s',
    es: '1 s',
    fr: '1 s',
    hi: '1 s',
    id: '1 s',
    pt: '1 s',
  },
  /** 구간 가속도 값. */
  'label.accel': {
    ko: '{a} m/s²',
    en: '{a} m/s²',
    ja: '{a} m/s²',
    zh: '{a} m/s²',
    ar: '{a} m/s²',
    es: '{a} m/s²',
    fr: '{a} m/s²',
    hi: '{a} m/s²',
    id: '{a} m/s²',
    pt: '{a} m/s²',
  },
  /** 날아가는 칸의 넓이 · 막대의 속도 변화 값. */
  'label.velocity': {
    ko: '{v} m/s',
    en: '{v} m/s',
    ja: '{v} m/s',
    zh: '{v} m/s',
    ar: '{v} m/s',
    es: '{v} m/s',
    fr: '{v} m/s',
    hi: '{v} m/s',
    id: '{v} m/s',
    pt: '{v} m/s',
  },
  'caption.fill': {
    ko: '가속도 아래 넓이가 1초씩 채워진다',
    en: 'The area under the acceleration fills one second at a time',
    ja: '加速度の下の面積が1秒ずつ満たされていく',
    zh: '加速度下方的面积一秒一秒地被填满',
    ar: 'تمتلئ المساحة تحت التسارع ثانيةً بعد ثانية',
    es: 'El área bajo la aceleración se llena segundo a segundo',
    fr: 'L’aire sous l’accélération se remplit seconde par seconde',
    hi: 'त्वरण के नीचे का क्षेत्रफल एक-एक सेकंड करके भरता है',
    id: 'Luas di bawah percepatan terisi detik demi detik',
    pt: 'A área sob a aceleração se preenche um segundo de cada vez',
  },
  'caption.stack': {
    ko: '1초 동안의 넓이가 모양 그대로 속도 변화에 얹힌다',
    en: "Each second's area lands on the change in velocity, shape unchanged",
    ja: '1秒ごとの面積が、形はそのままで速度の変化に積み重なる',
    zh: '每一秒的面积保持形状不变，叠到速度的变化量上',
    ar: 'تستقر مساحة كل ثانية على التغير في السرعة دون أن يتغير شكلها',
    es: 'El área de cada segundo se apila sobre el cambio de velocidad, sin cambiar de forma',
    fr: 'L’aire de chaque seconde vient s’empiler sur la variation de vitesse, sans changer de forme',
    hi: 'हर सेकंड का क्षेत्रफल अपना आकार बदले बिना वेग में परिवर्तन पर जा टिकता है',
    id: 'Luas tiap detik mendarat di atas perubahan kecepatan tanpa berubah bentuk',
    pt: 'A área de cada segundo pousa sobre a variação da velocidade, sem mudar de forma',
  },
  'caption.zero': {
    ko: '가속도가 0인 동안은 얹을 넓이가 없다',
    en: 'While the acceleration is zero there is no area to add',
    ja: '加速度が0の間は、積む面積がない',
    zh: '加速度为零时，没有面积可以叠加',
    ar: 'ما دام التسارع صفرًا فلا مساحة تُضاف',
    es: 'Mientras la aceleración es cero no hay área que añadir',
    fr: 'Tant que l’accélération est nulle, il n’y a pas d’aire à ajouter',
    hi: 'जब तक त्वरण शून्य है, जोड़ने को कोई क्षेत्रफल नहीं है',
    id: 'Selama percepatannya nol, tidak ada luas yang ditambahkan',
    pt: 'Enquanto a aceleração é zero, não há área para somar',
  },
  'caption.cut': {
    ko: '축 아래 넓이는 쌓인 속도 변화를 깎아 낸다',
    en: 'Area below the axis cuts away the stacked change in velocity',
    ja: '軸の下の面積は、積み重なった速度の変化を削り取る',
    zh: '轴下方的面积会削去已叠起的速度变化量',
    ar: 'المساحة تحت المحور تقتطع من التغير المتراكم في السرعة',
    es: 'El área bajo el eje recorta el cambio de velocidad acumulado',
    fr: 'L’aire sous l’axe retranche une part de la variation de vitesse empilée',
    hi: 'अक्ष के नीचे का क्षेत्रफल जमा हुए वेग परिवर्तन को काट देता है',
    id: 'Luas di bawah sumbu memangkas perubahan kecepatan yang sudah tertumpuk',
    pt: 'A área abaixo do eixo corta a variação da velocidade acumulada',
  },
  'caption.total': {
    ko: '넓이를 모두 얹고 깎은 높이 {total} m/s 가 속도 변화다',
    en: 'The height left after adding and cutting all the area, {total} m/s, is the change in velocity',
    ja: '面積をすべて積んで削った残りの高さ {total} m/s が速度の変化だ',
    zh: '把面积全部叠上又削去后剩下的高度 {total} m/s，就是速度的变化量',
    ar: 'الارتفاع المتبقي بعد إضافة المساحة كلها واقتطاعها، {total} m/s، هو التغير في السرعة',
    es: 'La altura que queda tras añadir y recortar toda el área, {total} m/s, es el cambio de velocidad',
    fr: 'La hauteur qui reste après avoir ajouté et retranché toute l’aire, {total} m/s, est la variation de vitesse',
    hi: 'सारा क्षेत्रफल जोड़ने और काटने के बाद बची ऊँचाई, {total} m/s, वेग में परिवर्तन है',
    id: 'Tinggi yang tersisa setelah semua luas ditambahkan dan dipangkas, {total} m/s, adalah perubahan kecepatan',
    pt: 'A altura que sobra depois de somar e cortar toda a área, {total} m/s, é a variação da velocidade',
  },
} satisfies Record<string, LocalizedText>);

export type AccelerationTimeGraphMessageKey = keyof typeof accelerationTimeGraphMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AccelerationTimeGraphMessageKey): LocalizedText =>
  accelerationTimeGraphMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AccelerationTimeGraphMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const accelerationTimeGraphSchema: BundleSchema = {
  id: ACCELERATION_TIME_GRAPH_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 한 바퀴(11 초)에 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { flight: SLAB_TIMING.flight, erase: SLAB_TIMING.erase },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 그림 300px + 캔버스 밖 캡션 한 줄. 캡션이 안으로 들어오고 러너가 사방에 여백을 둔다. */
  canvas: { height: 380, minHeight: 340 },

  // 원본이 그린 순서 그대로 겹친다 — 깎이는 칸은 막대 **위**, 날아가는 칸은 그 위.
  drawOrder: 'scene',

  /** 도착한 순간 첫 칸이 이미 막대로 날아가는 중이다 (원본 START_OFFSET = 1.6 s). */
  startAt: 1.6,

  /**
   * 한 바퀴 11 s. 단계는 **캡션이 말하는 구간**이다. 칸 k 는 k 초에 채워지기 시작해
   * k+1 초에 떠나고 `flight` 뒤 내려앉는다(축 아래 칸은 `erase` 동안 더 깎는다).
   *
   * - fill   0 ~ 1      첫 칸이 채워진다 (앞당긴 시계로는 지나간 뒤에 도착한다)
   * - stack  1 ~ 4.9    양의 칸 넷이 날아가 얹힌다 (마지막 비행이 4 + 0.9 에 끝)
   * - zero   4.9 ~ 5.2  가속도 0 구간 — 얹을 넓이가 없다
   * - fill2  5.2 ~ 6    축 아래 첫 칸이 채워진다
   * - cut    6 ~ 8.4    축 아래 칸 둘이 날아가 깎는다 (7 + 0.9 + 0.5 에 끝)
   * - total  8.4 ~ 10.4 합이 속도 변화다
   * - fade   10.4 ~ 11  막대와 자리가 흐려진다
   */
  timeline: {
    phases: [
      { id: 'fill', duration: 1, caption: key('caption.fill') },
      { id: 'stack', duration: 3.9, caption: key('caption.stack') },
      { id: 'zero', duration: 0.3, caption: key('caption.zero') },
      { id: 'fill2', duration: 0.8, caption: key('caption.fill') },
      { id: 'cut', duration: 2.4, caption: key('caption.cut') },
      { id: 'total', duration: 2, caption: key('caption.total') },
      { id: 'fade', duration: 0.6, caption: key('caption.total') },
    ],
  },

  // 슬롯 하나. 원본은 그림 아래 가운데 한 줄, 바로 바뀐다.
  caption: {
    anchor: { screen: 'bottom-center' },
    align: 'center',
    fontSize: FONT.caption,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { total: 'totalText' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 가속도 축 눈금 숫자도 두지 않는다 — 구간마다
   * 값을 선 옆에 직접 적었다. 격자는 "칸 넓이를 세라" 는 지시가 되어 동사를 가로챈다.
   */

  messages: accelerationTimeGraphMessages,
};
