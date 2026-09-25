// ========================================================================
// non-inertial-frame — 선언
// ========================================================================
// 질문: 버스가 출발하면 바닥의 공이 뒤로 굴러간다. 무엇이 공을 뒤로 밀었는가?
//
// 아무것도 밀지 않았다. 공은 길 위 제자리에 남고 버스가 앞으로 빠져나간다.
// 같은 순간을 위(길에서 본 모습)·아래(버스 안에서 본 모습) 두 판으로 나란히 그린다.
//
// 값은 모두 원본(tasks/piece-lab/non-inertial-frame/index.html)에서 그대로 옮겼다.
// 물리는 m · s 이고, 화면은 원본 논리 캔버스 1px = 월드 1 이다 (y 만 뒤집는다).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:non-inertial-frame` 와 문자 그대로 일치한다 (C4). */
export const NON_INERTIAL_FRAME_ID = 'non-inertial-frame';

// ------------------------------------------------------------------------
// 물리 (m, s)
// ------------------------------------------------------------------------

/** 버스 가속도. */
export const A = 1.5;
/** 버스 안쪽 길이. */
export const BUS_LEN = 10;
/** 버스 높이. */
export const BUS_H = 2.6;
/** 공 반지름. */
export const BALL_R = 0.35;
/** 뒷벽에서 공 중심까지 처음 거리. */
export const BALL_START = 5;
/** 길 위 버스 뒷벽의 처음 위치. */
export const REAR0 = 1;
/** 길가 눈금 간격. */
export const POST_GAP = 2;

/** 출발 전 서 있는 시간. */
export const T_REST = 0.5;
/** 출발에서 공이 뒷벽에 닿기까지 — ½·A·τ² = BALL_START − BALL_R. */
export const T_SLIDE = Math.sqrt((2 * (BALL_START - BALL_R)) / A);
/** 원본 `T_FADE_OUT` — 출발부터 흐려지기 시작할 때까지 주기 안 시각. */
const T_FADE_OUT = 4.2;
/** 흐려짐 · 다시 나타남 길이. */
export const T_FADE = 0.4;

/**
 * 도착한 순간 버스는 이미 출발해 있다 — 원본이 주기 위상을 1 초 앞당겼다(`OFFSET`).
 */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 화면 — 원본 논리 캔버스 860 × 366
// ------------------------------------------------------------------------

export const W = 860;
export const H = 366;
/** 1 m 의 화면 길이. 원본은 세계 −1 m ~ 23 m 를 가로에 담았다. */
export const PPM = W / 24;
/** 가로 왼쪽 끝의 세계 좌표(m). */
export const X0 = -1;
/** 두 판의 길 높이(원본 y, 아래로 +). */
export const ROAD_Y_GROUND = 155;
export const ROAD_Y_BUS = 340;
/** 두 판을 가르는 원본 y. 위 판 눈금 끝(179)과 아래 판 이름표(190) 사이. */
export const PANEL_SPLIT = H / 2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nonInertialFrameMessages = Object.freeze({
  'label.title': {
    ko: '비관성계',
    en: 'Non-inertial frame',
    ja: '非慣性系',
    zh: '非惯性参考系',
    ar: 'الإطار المرجعي غير القصوري',
    es: 'Sistema de referencia no inercial',
    fr: 'Référentiel non inertiel',
    hi: 'अजड़त्वीय निर्देश तंत्र',
    id: 'Kerangka acuan non-inersial',
    pt: 'Referencial não inercial',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '가속하는 기준틀에서의 운동',
    en: 'Motion seen from an accelerating frame',
    ja: '加速する座標系から見た運動',
    zh: '从加速参考系看到的运动',
    ar: 'الحركة كما تُرى من إطار مرجعي متسارع',
    es: 'El movimiento visto desde un sistema de referencia acelerado',
    fr: 'Le mouvement vu depuis un référentiel accéléré',
    hi: 'त्वरित निर्देश तंत्र से देखी गई गति',
    id: 'Gerak yang dilihat dari kerangka acuan yang dipercepat',
    pt: 'O movimento visto de um referencial acelerado',
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
  /** 판 이름표 — 두 판이 어느 기준틀에서 본 것인지가 주장에 필요하다 (원본 NOTES (c)). */
  'label.ground': {
    ko: '길에서 본 모습',
    en: 'Seen from the road',
    ja: '道路から見ると',
    zh: '从路边看',
    ar: 'كما يُرى من الطريق',
    es: 'Visto desde la calle',
    fr: 'Vu depuis la route',
    hi: 'सड़क से देखने पर',
    id: 'Dilihat dari jalan',
    pt: 'Visto da rua',
  },
  'label.bus': {
    ko: '버스 안에서 본 모습',
    en: 'Seen from inside the bus',
    ja: 'バスの中から見ると',
    zh: '从公交车里看',
    ar: 'كما يُرى من داخل الحافلة',
    es: 'Visto desde dentro del autobús',
    fr: 'Vu depuis l’intérieur du bus',
    hi: 'बस के अंदर से देखने पर',
    id: 'Dilihat dari dalam bus',
    pt: 'Visto de dentro do ônibus',
  },
  'caption.rest': {
    ko: '버스가 서 있다. 공은 바닥 가운데 놓여 있다.',
    en: 'The bus is standing still. The ball sits in the middle of the floor.',
    ja: 'バスは止まっている。ボールは床の真ん中に置かれている。',
    zh: '公交车停着。球放在车厢地板的正中间。',
    ar: 'الحافلة متوقفة. والكرة موضوعة في منتصف الأرضية.',
    es: 'El autobús está detenido. La pelota está en el centro del suelo.',
    fr: 'Le bus est à l’arrêt. La balle est posée au milieu du plancher.',
    hi: 'बस खड़ी है। गेंद फ़र्श के बीच में रखी है।',
    id: 'Bus sedang diam. Bola terletak di tengah lantai.',
    pt: 'O ônibus está parado. A bola está no meio do piso.',
  },
  'caption.slide': {
    ko: '버스 안에서는 공이 뒤로 밀려 가지만, 길에서 보면 공은 제자리에 남아 있다.',
    en: 'Inside the bus the ball seems pushed backward, but seen from the road it stays where it was.',
    ja: 'バスの中ではボールが後ろへ押されていくように見えるが、道路から見るとボールはその場にとどまっている。',
    zh: '在车里看，球好像被推向后方；但从路边看，球仍留在原处。',
    ar: 'داخل الحافلة تبدو الكرة وكأنها تُدفع إلى الخلف، لكنها كما تُرى من الطريق تبقى في مكانها.',
    es: 'Dentro del autobús la pelota parece empujada hacia atrás, pero vista desde la calle se queda donde estaba.',
    fr: 'Dans le bus, la balle semble poussée vers l’arrière, mais vue depuis la route, elle reste où elle était.',
    hi: 'बस के अंदर गेंद पीछे की ओर धकेली जाती लगती है, पर सड़क से देखने पर वह जहाँ थी वहीं रहती है।',
    id: 'Di dalam bus bola tampak terdorong ke belakang, tetapi dilihat dari jalan bola tetap di tempatnya.',
    pt: 'Dentro do ônibus a bola parece empurrada para trás, mas vista da rua ela fica onde estava.',
  },
  'caption.hit': {
    ko: '뒷벽에 닿고 나서야 공이 버스와 함께 앞으로 간다.',
    en: 'Only after it reaches the back wall does the ball move forward with the bus.',
    ja: '後ろの壁に当たってはじめて、ボールはバスと一緒に前へ進む。',
    zh: '直到碰到后壁，球才随公交车一起向前运动。',
    ar: 'لا تتحرك الكرة إلى الأمام مع الحافلة إلا بعد أن تصل إلى الجدار الخلفي.',
    es: 'Solo al llegar a la pared trasera la pelota avanza junto con el autobús.',
    fr: 'Ce n’est qu’après avoir atteint la paroi arrière que la balle avance avec le bus.',
    hi: 'पीछे की दीवार तक पहुँचने के बाद ही गेंद बस के साथ आगे बढ़ती है।',
    id: 'Baru setelah mencapai dinding belakang, bola bergerak maju bersama bus.',
    pt: 'Só depois de chegar à parede de trás a bola avança junto com o ônibus.',
  },
} satisfies Record<string, LocalizedText>);

export type NonInertialFrameMessageKey = keyof typeof nonInertialFrameMessages;

export const text = (key: NonInertialFrameMessageKey): LocalizedText => nonInertialFrameMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NonInertialFrameMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nonInertialFrameSchema: BundleSchema = {
  id: NON_INERTIAL_FRAME_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 가속도 크기는 주장을 바꾸지 않는다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 폭 900 에서 논리 860 × 366 캔버스 + 아래 한 줄 캡션(DOM, 15px)이었다. */
  canvas: { height: 430, minHeight: 340 },

  /** 원본 `OFFSET`. 모든 것이 시각의 함수라 시계만 앞당기면 된다. */
  startAt: START_AT,

  /**
   * 한 주기 5 s. 원본 `stateAt` · `captionFor` 의 경계를 단계로 옮겼다.
   *
   * - rest — 버스가 서 있다
   * - slide — 출발. 공은 길 위 제자리, 버스 안에서는 뒤로 미끄러진다. 길이는 공이
   *   뒷벽에 닿기까지의 시간이라 이 단계가 끝나는 순간이 곧 닿는 순간이다
   * - carry — 뒷벽에 붙은 공이 버스와 함께 간다
   * - fadeOut — 계속 가면서 흐려진다
   * - fadeIn — 처음 자리에 선 버스가 다시 나타난다
   */
  timeline: {
    phases: [
      { id: 'rest', duration: T_REST, caption: key('caption.rest') },
      { id: 'slide', duration: T_SLIDE, caption: key('caption.slide') },
      { id: 'carry', duration: T_FADE_OUT - T_REST - T_SLIDE, caption: key('caption.hit') },
      { id: 'fadeOut', duration: T_FADE, caption: key('caption.hit') },
      { id: 'fadeIn', duration: T_FADE, caption: key('caption.rest') },
    ],
  },

  /**
   * 겹침이 원본의 순서여야 한다 — 이름표 → 길 → 버스 → 공이 놓였던 지점 → 공.
   * 층 기본값은 `trajectory`(점선)를 `body`(버스) 아래에 두어 위 판의 점선이 버스에 가려진다.
   */
  drawOrder: 'scene',

  /** 슬롯 하나. 원본은 캔버스 아래 왼쪽(여백 16px) 한 줄이었다. */
  caption: {
    anchor: { world: [16, -(H + 18)] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드도 카메라 버튼도 없다 — 원본에 없고, 길가 눈금이 이미 땅의 기준이다. */

  messages: nonInertialFrameMessages,
};
