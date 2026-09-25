// ========================================================================
// relativity-of-simultaneity — 선언
// ========================================================================
// 질문: 「동시에 일어났다」 는 누구에게나 같은 말인가?
//
// 아인슈타인 기차. 달리는 기차 한가운데의 등이 앞뒤로 빛을 쏜다. 같은 한 번의
// 번쩍임을 두 판에 나란히 둔다 —
//
//   위 판(기차 안에서 본 것): 기차는 서 있고 선로가 뒤로 흘러간다. 빛은 등에서
//     양쪽으로 같은 빠르기로 퍼져 **두 끝에 동시에** 닿는다.
//   아래 판(선로에서 본 것): 기차가 달린다. 빛은 선로 위 번쩍인 자리에서 양쪽으로
//     같은 빠르기로 퍼지는데, 그동안 뒤 끝은 빛을 마중 나가고 앞 끝은 달아난다 —
//     **뒤 끝에 먼저** 닿는다.
//
// 두 판의 시계는 각 틀의 시각이고, 번쩍임이 두 판 모두의 원점(0, 0)이다. 그래서
// 아래 판의 도착 시각은 위 판 도착 사건의 로런츠 변환과 정확히 같다.
//
// 시공간 도표(spacetime-diagram)의 동시선 기울기는 쓰지 않는다 — 여기 있는 것은
// 기차와 빛 자체다. 시간 지연(time-dilation)의 시계도 없다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:relativity-of-simultaneity` 와 문자 그대로 일치한다 (C4). */
export const RELATIVITY_OF_SIMULTANEITY_ID = 'relativity-of-simultaneity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 가로 단위는 임의(기차 고유 길이 4).
// ------------------------------------------------------------------------

/** 기차의 속력 v/c. 뒤 끝과 앞 끝의 도착 시각이 세 배 벌어지는 값이다. */
export const BETA = 0.5;
/** 기차의 고유 길이(월드) — 기차 안에서 잰 길이. 선로에서 보면 1/γ 로 줄어 있다. */
export const PROPER_LENGTH = 4;
/**
 * 화면에서 빛이 가는 빠르기(월드/초). **실제 빛을 이만큼 느리게 보인다** — 사람 눈이
 * 따라갈 수 있게 한 배율이다. 기차는 β 배 빠르기로 달린다.
 */
export const LIGHT_SPEED = 1.5;
/** 기차 끝 벽에서 감지기 안쪽 면까지(월드, 기차 안에서 잰 길이). 빛은 이 면에 닿는다. */
export const DETECTOR_INSET = 0.12;
/** 선로 침목 간격(월드, 선로에서 잰 길이). 기차 안에서 보면 1/γ 로 줄어 흘러간다. */
export const SLEEPER_SPACING = 0.4;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초).
// `travel` 은 선로 판의 앞 끝 도착(기본값 2.17 초)보다 길어야 한다. 그 뒤로는 두 판의
// 시각이 `travel` 끝에서 멈춘다(`hold` · `fade` 는 정지 화면).
// ------------------------------------------------------------------------

/** 기차(선로 판) · 침목(기차 판)이 나타나는 동안. */
export const APPEAR = 0.3;
/** 번쩍이기 전 — 기차가 달려 들어온다. */
export const APPROACH = 1.0;
/** 번쩍인 뒤 빛이 두 끝에 닿기까지. */
export const TRAVEL = 2.6;
/** 멈춘 화면에서 두 판의 도착 순서를 읽는 동안. */
export const HOLD = 2.4;
/** 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드. 위 판(기차 틀)과 아래 판(선로 틀)을 세로로 쌓는다.
// 판마다 선로 높이 하나를 두고, 칸 · 빛 · 이름표는 그 위로 같은 간격에 놓는다.
// ------------------------------------------------------------------------

/** 판별 선로 높이. */
export const TRAIN_PANEL_Y = 1.0;
export const GROUND_PANEL_Y = -0.95;
/** 선로에서 칸 바닥 · 칸 지붕까지. */
export const FLOOR_ABOVE = 0.13;
export const ROOF_ABOVE = 0.63;
/** 선로에서 빛 · 등의 높이까지(칸 가운데). */
export const LIGHT_ABOVE = 0.38;
/** 선로에서 바퀴 중심까지 · 바퀴 반지름. */
export const WHEEL_ABOVE = 0.07;
export const WHEEL_R = 0.06;
/** 감지기 크기 [가로, 세로](월드). */
export const DETECTOR_SIZE: readonly [number, number] = [0.1, 0.3];
/** 침목 길이(선로 아래로, 월드). */
export const SLEEPER_LEN = 0.07;
/** 선로에서 도착 이름표(먼저 · 나중 · 동시)까지. */
export const ARRIVAL_LABEL_ABOVE = 0.8;
/** 선로에서 판 이름표까지. */
export const PANEL_LABEL_ABOVE = 1.07;
/** 선로에서 움직임 이름표까지(선로 아래). */
export const MOTION_LABEL_BELOW = 0.22;
/** 판 이름표 왼쪽 끝 · 기차 판 움직임 이름표 가운데(월드 x, 칸 오른쪽 · 빛 높이). */
export const PANEL_LABEL_X = -3.2;
export const TRAIN_PANEL_MOTION_X = 3.1;
/** 두 판 사이 나눔선 높이. */
export const DIVIDER_Y = 0.62;

/**
 * 프레이밍은 주장의 일부다. 가로는 선로 판 기차가 달려 들어오는 자리부터 앞 끝이
 * 멈추는 자리까지, 세로는 위 판 이름표부터 아래 판 움직임 이름표 밑 캡션 줄까지.
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.3, maxX: 4.1, minY: -1.6, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const relativityOfSimultaneityMessages = Object.freeze({
  'label.title': {
    ko: '동시성의 상대성',
    en: 'Relativity of simultaneity',
    ja: '同時性の相対性',
    zh: '同时的相对性',
    ar: 'نسبية التزامن',
    es: 'Relatividad de la simultaneidad',
    fr: 'Relativité de la simultanéité',
    hi: 'समकालिकता की आपेक्षिकता',
    id: 'Relativitas keserempakan',
    pt: 'Relatividade da simultaneidade',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '기준틀마다 다른 \'동시\'',
    en: 'A ‘same time’ that differs from frame to frame',
    ja: '基準系ごとに違う「同時」',
    zh: '因参考系而异的“同时”',
    ar: '«تزامن» يختلف من إطار مرجعي إلى آخر',
    es: 'Un «al mismo tiempo» que cambia de un sistema de referencia a otro',
    fr: 'Un « en même temps » qui diffère d’un référentiel à l’autre',
    hi: 'हर संदर्भ फ्रेम में अलग ‘एक साथ’',
    id: '‘Serentak’ yang berbeda di tiap kerangka acuan',
    pt: 'Um «ao mesmo tempo» que difere de um referencial para outro',
  },
  'label.stage': {
    ko: '달리는 기차',
    en: 'A moving train',
    ja: '走る列車',
    zh: '行驶的列车',
    ar: 'قطار متحرك',
    es: 'Un tren en movimiento',
    fr: 'Un train en mouvement',
    hi: 'चलती रेलगाड़ी',
    id: 'Kereta yang bergerak',
    pt: 'Um trem em movimento',
  },
  'label.view': {
    ko: '두 틀을 나란히',
    en: 'Two frames side by side',
    ja: '二つの座標系を並べて',
    zh: '并排的两个参考系',
    ar: 'إطاران مرجعيان جنبًا إلى جنب',
    es: 'Dos sistemas de referencia lado a lado',
    fr: 'Deux référentiels côte à côte',
    hi: 'दो निर्देश तंत्र साथ-साथ',
    id: 'Dua kerangka acuan berdampingan',
    pt: 'Dois referenciais lado a lado',
  },
  'label.trainFrame': {
    ko: '기차 안에서 본 것',
    en: 'Seen from the train',
    ja: '列車の中から見た様子',
    zh: '从列车上看',
    ar: 'كما يُرى من القطار',
    es: 'Visto desde el tren',
    fr: 'Vu depuis le train',
    hi: 'रेलगाड़ी से देखने पर',
    id: 'Dilihat dari kereta',
    pt: 'Visto do trem',
  },
  'label.groundFrame': {
    ko: '선로에서 본 것',
    en: 'Seen from the track',
    ja: '線路から見た様子',
    zh: '从轨道旁看',
    ar: 'كما يُرى من السكة',
    es: 'Visto desde la vía',
    fr: 'Vu depuis la voie',
    hi: 'पटरी से देखने पर',
    id: 'Dilihat dari rel',
    pt: 'Visto dos trilhos',
  },
  'label.trainMoves': {
    ko: '기차 {beta}c →',
    en: 'train {beta}c →',
    ja: '列車 {beta}c →',
    zh: '列车 {beta}c →',
    ar: 'القطار {beta}c →',
    es: 'tren {beta}c →',
    fr: 'train {beta}c →',
    hi: 'रेलगाड़ी {beta}c →',
    id: 'kereta {beta}c →',
    pt: 'trem {beta}c →',
  },
  'label.trackMoves': {
    ko: '← 선로 {beta}c',
    en: '← track {beta}c',
    ja: '← 線路 {beta}c',
    zh: '← 轨道 {beta}c',
    ar: '← السكة {beta}c',
    es: '← vía {beta}c',
    fr: '← voie {beta}c',
    hi: '← पटरी {beta}c',
    id: '← rel {beta}c',
    pt: '← trilhos {beta}c',
  },
  'label.same': {
    ko: '동시',
    en: 'same time',
    ja: '同時',
    zh: '同时',
    ar: 'في آن واحد',
    es: 'a la vez',
    fr: 'en même temps',
    hi: 'एक साथ',
    id: 'serentak',
    pt: 'ao mesmo tempo',
  },
  'label.first': {
    ko: '먼저',
    en: 'first',
    ja: '先',
    zh: '先',
    ar: 'أولًا',
    es: 'primero',
    fr: 'en premier',
    hi: 'पहले',
    id: 'lebih dulu',
    pt: 'primeiro',
  },
  'label.second': {
    ko: '나중',
    en: 'later',
    ja: '後',
    zh: '后',
    ar: 'لاحقًا',
    es: 'después',
    fr: 'plus tard',
    hi: 'बाद में',
    id: 'kemudian',
    pt: 'depois',
  },
  'caption.approach': {
    ko: '달리는 기차 한가운데의 등이 곧 앞뒤로 빛을 쏜다',
    en: 'A lamp in the middle of a moving train is about to flash toward both ends',
    ja: '走る列車の真ん中のランプが、まもなく前後へ光を放つ',
    zh: '行驶列车正中的灯即将向两端闪光',
    ar: 'مصباح في منتصف قطار متحرك على وشك أن يومض نحو الطرفين',
    es: 'Una lámpara en medio de un tren en movimiento está a punto de destellar hacia ambos extremos',
    fr: 'Une lampe au milieu d’un train en mouvement va bientôt lancer un éclair vers les deux bouts',
    hi: 'चलती रेलगाड़ी के बीचोंबीच का लैंप दोनों सिरों की ओर चमकने वाला है',
    id: 'Lampu di tengah kereta yang bergerak akan segera berkedip ke arah kedua ujung',
    pt: 'Uma lâmpada no meio de um trem em movimento está prestes a piscar em direção às duas pontas',
  },
  'caption.travel': {
    ko: '빛은 두 틀 모두에서 같은 빠르기로 퍼진다 — 선로에서 보면 뒤 끝은 빛을 마중 나가고 앞 끝은 달아난다',
    en: 'Light spreads at the same speed in both frames — from the track, the rear runs to meet it and the front runs away',
    ja: '光はどちらの座標系でも同じ速さで広がる — 線路から見ると、後ろの端は光を迎えに行き、前の端は逃げていく',
    zh: '光在两个参考系中都以相同的速率传播——从轨道看，车尾迎向光，车头则远离光',
    ar: 'ينتشر الضوء بالسرعة نفسها في الإطارين — من السكة، يندفع الطرف الخلفي لملاقاته ويبتعد الطرف الأمامي عنه',
    es: 'La luz se propaga con la misma rapidez en ambos sistemas de referencia — desde la vía, el extremo trasero va a su encuentro y el delantero se aleja',
    fr: 'La lumière se propage à la même vitesse dans les deux référentiels — vu de la voie, l’arrière court à sa rencontre et l’avant s’enfuit',
    hi: 'प्रकाश दोनों निर्देश तंत्रों में समान चाल से फैलता है — पटरी से देखने पर पिछला सिरा उससे मिलने आगे बढ़ता है और अगला सिरा दूर भागता है',
    id: 'Cahaya menyebar dengan kelajuan yang sama di kedua kerangka acuan — dilihat dari rel, ujung belakang menyongsongnya dan ujung depan menjauh',
    pt: 'A luz se espalha com a mesma velocidade nos dois referenciais — vista dos trilhos, a traseira corre ao seu encontro e a frente foge',
  },
  'caption.result': {
    ko: '기차 안에서는 두 끝에 동시에 닿았고, 선로에서는 뒤 끝에 먼저 닿았다',
    en: 'On the train the light hit both ends at once; from the track it hit the rear first',
    ja: '列車の中では光は両端に同時に届き、線路からは後ろの端に先に届いた',
    zh: '在列车上，光同时到达两端；从轨道看，光先到达车尾',
    ar: 'في القطار بلغ الضوء الطرفين في آن واحد؛ ومن السكة بلغ الطرف الخلفي أولًا',
    es: 'En el tren, la luz llegó a ambos extremos a la vez; desde la vía, llegó primero al trasero',
    fr: 'Dans le train, la lumière a atteint les deux bouts en même temps ; vu de la voie, elle a atteint l’arrière en premier',
    hi: 'रेलगाड़ी में प्रकाश दोनों सिरों पर एक साथ पहुँचा; पटरी से देखने पर वह पिछले सिरे पर पहले पहुँचा',
    id: 'Di dalam kereta, cahaya mengenai kedua ujung serentak; dilihat dari rel, cahaya mengenai ujung belakang lebih dulu',
    pt: 'No trem, a luz atingiu as duas pontas ao mesmo tempo; vista dos trilhos, atingiu a traseira primeiro',
  },
} satisfies Record<string, LocalizedText>);

export type RelativityOfSimultaneityMessageKey = keyof typeof relativityOfSimultaneityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RelativityOfSimultaneityMessageKey): LocalizedText =>
  relativityOfSimultaneityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RelativityOfSimultaneityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const relativityOfSimultaneitySchema: BundleSchema = {
  id: RELATIVITY_OF_SIMULTANEITY_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 기차가 오고, 번쩍이고, 두 판의 도착 순서가 남는다.
  parameters: [],

  stages: [
    {
      id: 'train',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        properLength: PROPER_LENGTH,
        lightSpeed: LIGHT_SPEED,
        detectorInset: DETECTOR_INSET,
        sleeperSpacing: SLEEPER_SPACING,
      },
    },
  ],

  environments: [],

  views: [{ id: 'two-frames', label: text('label.view'), default: true }],

  /** 가로 7.4 · 세로 3.75. 판 둘을 쌓아 세로가 조금 더 든다. */
  canvas: { height: 390, minHeight: 330 },

  /** 빛 · 감지기가 칸 채움 위에, 이름표가 맨 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 달려옴 → 번쩍임과 빛의 여행 → 멈춘 화면에서 읽기 → 흐려짐.
   * 두 판의 시각은 `travel` 시작에서 잰다 — 그 순간 등이 번쩍인다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'travel', duration: TRAVEL, caption: key('caption.travel') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 기차가 번쩍일 자리로 달려오는 중이다. */
  startAt: 0.8,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **닿는 순서**다. */

  messages: relativityOfSimultaneityMessages,
};
