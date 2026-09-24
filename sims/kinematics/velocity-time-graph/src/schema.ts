// ========================================================================
// velocity-time-graph — 선언
// ========================================================================
// 질문: 속도-시간 그래프 아래 넓이가 왜 간 거리인가.
//
// 그래프 아래 쌓인 넓이는 그 동안 물체가 간 거리와 같다. 1초마다 쌓인 기둥을
// 떼어 길에 펴면 그 1초 동안 간 거리를 꼭 채운다.
//
// 값은 모두 원본(tasks/piece-lab/velocity-time-graph/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:velocity-time-graph` 와 문자 그대로 일치한다 (C4). */
export const VELOCITY_TIME_GRAPH_ID = 'velocity-time-graph';

// ------------------------------------------------------------------------
// 운동 — 속도는 꺾은선으로 주어진다 (시각 s, 속도 m/s)
// ------------------------------------------------------------------------

/**
 * 빨라짐 → 일정 → 느려짐 → 낮게 일정 → 멈춤. 기둥 크기가 커졌다 작아지므로
 * 말뚝 간격이 넓어졌다 좁아지는 것이 한 번에 보인다. 간 거리는 30.75 m.
 */
export const KNOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [2.5, 6],
  [4.5, 6],
  [5.5, 3],
  [6.5, 3],
  [9, 0],
];
/** 운동이 끝나는 시각(s). */
export const T_END = 9;
/** 그래프 세로축 끝(m/s). */
export const V_MAX = 6;

// ------------------------------------------------------------------------
// 떼어 옮기는 방식 — 단계의 길이는 아래 `timeline`
// ------------------------------------------------------------------------

/** 1초 기둥을 가는 띠 몇 개로 떼는가. */
export const SUB = 24;
/**
 * 띠 사이 시차. 0 이다 — 시차를 두면 왼쪽 띠가 먼저 오른쪽으로 밀려 오른쪽 띠와
 * 겹쳐 뭉친다. 0 이면 이웃 띠가 늘 맞붙어 기둥이 한 덩어리로 떨어지며 납작해진다.
 */
export const STAGGER = 0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const velocityTimeGraphMessages = Object.freeze({
  'label.title': {
    ko: '속도-시간 그래프',
    en: 'Velocity-time graph',
    ja: '速度-時間グラフ',
    zh: '速度-时间图像',
    ar: 'التمثيل البياني للسرعة والزمن',
    es: 'Gráfica velocidad-tiempo',
    fr: 'Graphique vitesse-temps',
    hi: 'वेग-समय ग्राफ़',
    id: 'Grafik kecepatan-waktu',
    pt: 'Gráfico velocidade-tempo',
  },
  'label.operation': {
    ko: '그래프 아래 넓이가 간 거리다',
    en: 'The area under the graph is the distance travelled',
    ja: 'グラフの下の面積が進んだ距離だ',
    zh: '图像下方的面积就是通过的距离',
    ar: 'المساحة تحت المنحنى هي المسافة المقطوعة',
    es: 'El área bajo la gráfica es la distancia recorrida',
    fr: 'L’aire sous le graphique est la distance parcourue',
    hi: 'ग्राफ़ के नीचे का क्षेत्रफल ही तय की गई दूरी है',
    id: 'Luas di bawah grafik adalah jarak yang ditempuh',
    pt: 'A área sob o gráfico é a distância percorrida',
  },
  'label.stage': {
    ko: '직선 길',
    en: 'Straight road',
    ja: 'まっすぐな道',
    zh: '笔直的道路',
    ar: 'طريق مستقيم',
    es: 'Camino recto',
    fr: 'Route droite',
    hi: 'सीधी सड़क',
    id: 'Jalan lurus',
    pt: 'Estrada reta',
  },
  'label.view': {
    ko: '넓이와 길',
    en: 'Area and road',
    ja: '面積と道',
    zh: '面积与道路',
    ar: 'المساحة والطريق',
    es: 'Área y camino',
    fr: 'Aire et route',
    hi: 'क्षेत्रफल और सड़क',
    id: 'Luas dan jalan',
    pt: 'Área e estrada',
  },
  /** 그래프 세로축 이름. 주제가 "속도-시간 그래프" 그 자체라 축 이름은 둔다. */
  'label.axisV': {
    ko: '속도',
    en: 'velocity',
    ja: '速度',
    zh: '速度',
    ar: 'السرعة',
    es: 'velocidad',
    fr: 'vitesse',
    hi: 'वेग',
    id: 'kecepatan',
    pt: 'velocidade',
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
  'caption.main': {
    ko: '1초마다 그래프 아래 쌓인 넓이를 떼어 길에 펴 놓으면, 그 1초 동안 물체가 간 거리에 꼭 맞는다.',
    en: 'Peel off the area piled up under the graph each second and lay it on the road — it exactly fills the distance travelled in that second.',
    ja: '1秒ごとにグラフの下にたまった面積をはがして道に広げると、その1秒間に物体が進んだ距離にぴったり収まる。',
    zh: '把每一秒在图像下方累积的面积剥下来铺在路上——它正好填满物体在这一秒内通过的距离。',
    ar: 'انزع المساحة المتراكمة تحت المنحنى في كل ثانية وافرشها على الطريق — فتملأ تمامًا المسافة المقطوعة في تلك الثانية.',
    es: 'Despega el área acumulada bajo la gráfica cada segundo y extiéndela sobre el camino: llena exactamente la distancia recorrida en ese segundo.',
    fr: 'Détachez l’aire accumulée sous le graphique à chaque seconde et étalez-la sur la route : elle remplit exactement la distance parcourue pendant cette seconde.',
    hi: 'हर सेकंड ग्राफ़ के नीचे जमा हुए क्षेत्रफल को उतारकर सड़क पर बिछाएँ — वह उस सेकंड में तय की गई दूरी को ठीक-ठीक भर देता है।',
    id: 'Kupas luas yang menumpuk di bawah grafik setiap detik dan bentangkan di jalan — luas itu tepat mengisi jarak yang ditempuh dalam detik itu.',
    pt: 'Destaque a área acumulada sob o gráfico a cada segundo e estenda-a na estrada — ela preenche exatamente a distância percorrida naquele segundo.',
  },
} satisfies Record<string, LocalizedText>);

export type VelocityTimeGraphMessageKey = keyof typeof velocityTimeGraphMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: VelocityTimeGraphMessageKey): LocalizedText {
  return velocityTimeGraphMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VelocityTimeGraphMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const velocityTimeGraphSchema: BundleSchema = {
  id: VELOCITY_TIME_GRAPH_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조작기가 없다. 운동 하나를 끝까지 보여 주면 할 말이 끝난다.
  parameters: [],

  stages: [{ id: 'main', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 원본은 그림 250px + 캔버스 밖 캡션이었다. 캡션이 캔버스 안(화면 고정 줄)으로
   * 들어오고 러너가 사방에 여백을 두므로 그만큼 더 잡는다.
   */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 한 바퀴 12.4 s — 운동(꺾은선의 길이) → 마지막 기둥이 내려앉음 → 다 펴진 채 머묾
   * → 흐려짐.
   *
   * - 운동의 첫머리(`appear`)에 지금 점과 물체가 나타난다. `appear` + `motion` 이
   *   꺾은선의 길이(9 s)다.
   * - 기둥 i 는 운동 시각 i 초에 떠나 `land` 만큼 날아간다. 마지막 기둥이 떠나는 순간이
   *   운동의 끝이라 `land` 가 곧 한 기둥의 비행 시간이다.
   * - 도착한 순간 이미 첫 기둥이 떨어지는 중이다 (1.5 s 앞당김, S-piece).
   */
  startAt: 1.5,
  timeline: {
    phases: [
      { id: 'appear', duration: 0.3 },
      { id: 'motion', duration: T_END - 0.3 },
      { id: 'land', duration: 0.8 },
      { id: 'hold', duration: 2.0 },
      { id: 'fade', duration: 0.6 },
    ],
  },

  // 원본이 그린 순서 그대로 겹친다 — 말뚝은 펼친 넓이 **위에** 긋는다. 띠가 말뚝
  // 사이를 꼭 채우는지가 이 조각의 증거라, 선이 면 아래로 가면 판정 장치가 흐려진다.
  drawOrder: 'scene',

  // 슬롯 하나, 고정. 지금 화면에서 매초 반복되는 일 하나만 말한다.
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    text: key('caption.main'),
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 눈금·격자는 "숫자로 확인하라" 는 신호가
   * 되어 동사를 약하게 한다 — 같음은 칠 넓이로 이미 성립한다. 카메라를 주면 두
   * 칸이 하나의 축척에서 서로에게서 유도된다는 약속을 독자가 흔들 수 있다.
   */

  messages: velocityTimeGraphMessages,
};
