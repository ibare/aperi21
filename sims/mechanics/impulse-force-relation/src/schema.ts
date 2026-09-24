// ========================================================================
// impulse-force-relation — 선언
// ========================================================================
// 질문: 운동량 변화가 같다면, 공을 천천히 멈추게 하는 게 왜 받는 힘을 줄이나.
//
// 같은 공 두 개가 같은 속력으로 딱딱한 벽과 푹신한 방석에 닿아 둘 다 멈춘다. 받는 힘은
// 반사인 모양 F = Fmax·sin(πτ/T) 이고 넓이 2·Fmax·T/π 를 두 줄 같게 두었다 — 오래 걸려
// 멈추면 힘이 낮게 퍼진다.
//
// 원본: tasks/piece-lab/impulse-force-relation (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:impulse-force-relation` 와 문자 그대로 일치한다 (C4). */
export const IMPULSE_FORCE_RELATION_ID = 'impulse-force-relation';

// ------------------------------------------------------------------------
// 물리 값 — 원본 상수 그대로
// ------------------------------------------------------------------------

/** 공 속력 (원본 화면 px/초 = 월드 단위/초). */
export const V0 = 100;
/** 딱딱한 벽에서 멈추는 데 걸리는 시간 (초). */
export const T_HARD = 0.25;
/** 방석에서 멈추는 시간 — 기본값 · 범위 · 간격 (초). */
export const T_SOFT_DEFAULT = 1.5;
export const T_SOFT_RANGE: readonly [number, number] = [0.25, 2];
export const T_SOFT_STEP = 0.25;
/** 한 주기 안에서 부딪히는 시각 (초). 시간표 `approach` 단계의 길이와 같다. */
export const T_HIT = 1.0;
/** 한 주기 (초). 시간표 단계 길이의 합과 같다. state 의 주기 안 시각이 여기서 되감긴다. */
export const CYCLE = 6.5;

// ------------------------------------------------------------------------
// 배치 — 원본은 876×300 px 캔버스(900 px 창 · 좌우 12 px 여백). 월드 단위 = 원본 px,
// y 는 위로 뒤집었다 (월드 y = 300 − 원본 y).
// ------------------------------------------------------------------------

/** 원본 캔버스 가로 · 세로 (px). */
export const WIDTH = 876;
export const HEIGHT = 300;
/** 두 줄 사이 틈 (px). */
export const LANE_GAP = 28;
/** 한 줄의 폭 (px). */
export const LANE_W = (WIDTH - LANE_GAP) / 2;
/** 두 줄의 왼쪽 끝 x. */
export const LANE_X: readonly [number, number] = [0, LANE_W + LANE_GAP];

/** 공 반지름 (px). */
export const R = 18;
/** 방석 두께 (px). */
export const CUSHION = 120;
/** 공 중심 높이 — 원본 y 70. */
export const BALL_Y = HEIGHT - 70;
/** 벽 왼쪽 면이 줄 오른쪽 끝에서 들어온 거리 · 벽 두께 · 벽 반높이 (px). */
export const WALL_INSET = 16;
export const WALL_THICK = 10;
export const WALL_HALF = 42;
/** 방석 반높이 · 결 선 반높이 · 결 선 수(칸 수) (px · 개). */
export const CUSHION_HALF = 40;
export const GRAIN_HALF = 38;
export const GRAIN_CELLS = 6;

/** 속도 화살표 — 공 위로 띄운 거리(R + 12) · 최대 길이 · 굵기. */
export const VEL_LIFT = R + 12;
export const VEL_LEN = 60;
export const VEL_WIDTH = 2.5;
/** 힘 화살표 — 벽 최대 힘일 때 길이 · 굵기. 두 줄 같은 배율이다. */
export const FORCE_LEN = 110;
export const FORCE_WIDTH = 4;
/** 화살촉 크기 (px). 원본 min(9, 길이·0.6). */
export const ARROW_HEAD = 9;

/** 힘-시간 곡선 — 줄 왼쪽에서 들어온 거리 · 폭 줄임 · 기준선 높이(원본 y 282) · 벽 최대 높이. */
export const GRAPH_INSET = 22;
export const GRAPH_SHRINK = 40;
export const GRAPH_BASE_Y = HEIGHT - 282;
export const GRAPH_H = 128;
/** 곡선 가로축이 담는 접촉 뒤 시간 범위 (초). */
export const GRAPH_TAU: readonly [number, number] = [-0.25, 2.25];
/** 곡선을 자르는 마디 수. */
export const GRAPH_SAMPLES = 80;
/** 세로축이 기준 높이 위로 더 나가는 길이 (px). */
export const AXIS_OVERSHOOT = 6;

/**
 * 고정 경계. 원본 캔버스 전체에 더해 아래로 캡션 · 조절기 줄 자리를 둔다 — 원본은 둘이 캔버스
 * 밖 DOM 이었다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: WIDTH, minY: -44, maxY: HEIGHT } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const impulseForceRelationMessages = Object.freeze({
  'label.title': {
    ko: '힘과 충격량',
    en: 'Force and impulse',
    ja: '力と力積',
    zh: '力与冲量',
    ar: 'القوة والدفع',
    es: 'Fuerza e impulso',
    fr: 'Force et impulsion',
    hi: 'बल और आवेग',
    id: 'Gaya dan impuls',
    pt: 'Força e impulso',
  },
  'label.operation': {
    ko: '짧고 큰 힘과 길고 작은 힘',
    en: 'A short, large force and a long, small one',
    ja: '短く大きな力と、長く小さな力',
    zh: '短而大的力与长而小的力',
    ar: 'قوة قصيرة كبيرة وأخرى طويلة صغيرة',
    es: 'Una fuerza breve y grande y otra larga y pequeña',
    fr: 'Une force brève et grande, et une autre longue et faible',
    hi: 'कम समय का बड़ा बल और लंबे समय का छोटा बल',
    id: 'Gaya singkat yang besar dan gaya lama yang kecil',
    pt: 'Uma força curta e grande e outra longa e pequena',
  },
  'label.stage': {
    ko: '벽과 방석',
    en: 'Wall and cushion',
    ja: '壁とクッション',
    zh: '墙与垫子',
    ar: 'الجدار والوسادة',
    es: 'Pared y cojín',
    fr: 'Mur et coussin',
    hi: 'दीवार और गद्दा',
    id: 'Dinding dan bantalan',
    pt: 'Parede e almofada',
  },
  'label.view': {
    ko: '나란히',
    en: 'Side by side',
    ja: '並べて',
    zh: '并排',
    ar: 'جنبًا إلى جنب',
    es: 'Lado a lado',
    fr: 'Côte à côte',
    hi: 'साथ-साथ',
    id: 'Berdampingan',
    pt: 'Lado a lado',
  },
  'label.hard': {
    ko: '딱딱한 벽',
    en: 'Hard wall',
    ja: '硬い壁',
    zh: '坚硬的墙',
    ar: 'جدار صلب',
    es: 'Pared dura',
    fr: 'Mur dur',
    hi: 'कठोर दीवार',
    id: 'Dinding keras',
    pt: 'Parede dura',
  },
  'label.soft': {
    ko: '푹신한 방석',
    en: 'Soft cushion',
    ja: '柔らかいクッション',
    zh: '柔软的垫子',
    ar: 'وسادة لينة',
    es: 'Cojín blando',
    fr: 'Coussin moelleux',
    hi: 'नरम गद्दा',
    id: 'Bantalan empuk',
    pt: 'Almofada macia',
  },
  'label.force': {
    ko: '힘',
    en: 'force',
    ja: '力',
    zh: '力',
    ar: 'القوة',
    es: 'fuerza',
    fr: 'force',
    hi: 'बल',
    id: 'gaya',
    pt: 'força',
  },
  'label.time': {
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
  'label.slider': {
    ko: '방석에서 멈추는 데 걸리는 시간',
    en: 'Time to stop on the cushion',
    ja: 'クッションで止まるまでの時間',
    zh: '在垫子上停下所需的时间',
    ar: 'زمن التوقف على الوسادة',
    es: 'Tiempo en detenerse en el cojín',
    fr: 'Temps d’arrêt sur le coussin',
    hi: 'गद्दे पर रुकने में लगने वाला समय',
    id: 'Waktu untuk berhenti di bantalan',
    pt: 'Tempo para parar na almofada',
  },
  'caption.approach': {
    ko: '같은 공이 같은 속력으로 벽과 방석을 향해 간다',
    en: 'Identical balls head for the wall and the cushion at the same speed',
    ja: '同じボールが同じ速さで壁とクッションに向かう',
    zh: '相同的球以相同的速率冲向墙和垫子',
    ar: 'كرتان متماثلتان تتجهان نحو الجدار والوسادة بالسرعة نفسها',
    es: 'Bolas idénticas se dirigen a la pared y al cojín con la misma rapidez',
    fr: 'Des balles identiques filent vers le mur et le coussin à la même vitesse',
    hi: 'एक जैसी गेंदें समान चाल से दीवार और गद्दे की ओर बढ़ती हैं',
    id: 'Bola-bola identik melaju ke dinding dan bantalan dengan kelajuan yang sama',
    pt: 'Bolas idênticas seguem para a parede e a almofada com a mesma velocidade',
  },
  'caption.hardHit': {
    ko: '벽에 닿은 공은 순식간에 멈추며 큰 힘을 받는다',
    en: 'The ball at the wall stops in an instant and feels a large force',
    ja: '壁のボールは一瞬で止まり、大きな力を受ける',
    zh: '撞墙的球瞬间停下，受到很大的力',
    ar: 'الكرة عند الجدار تتوقف في لحظة وتتلقى قوة كبيرة',
    es: 'La bola de la pared se detiene en un instante y recibe una fuerza grande',
    fr: 'La balle contre le mur s’arrête en un instant et subit une grande force',
    hi: 'दीवार वाली गेंद पल भर में रुकती है और बड़ा बल महसूस करती है',
    id: 'Bola di dinding berhenti seketika dan menerima gaya besar',
    pt: 'A bola na parede para num instante e sente uma força grande',
  },
  'caption.sameShort': {
    ko: '둘 다 같은 짧은 시간에 멈추며 같은 큰 힘을 받는다',
    en: 'Both stop in the same short time and feel the same large force',
    ja: 'どちらも同じ短い時間で止まり、同じ大きな力を受ける',
    zh: '两个球都在同样短的时间内停下，受到同样大的力',
    ar: 'تتوقف الكرتان في الزمن القصير نفسه وتتلقيان القوة الكبيرة نفسها',
    es: 'Ambas se detienen en el mismo tiempo corto y reciben la misma fuerza grande',
    fr: 'Les deux s’arrêtent dans le même temps court et subissent la même grande force',
    hi: 'दोनों एक ही कम समय में रुकती हैं और एक जैसा बड़ा बल महसूस करती हैं',
    id: 'Keduanya berhenti dalam waktu singkat yang sama dan menerima gaya besar yang sama',
    pt: 'Ambas param no mesmo tempo curto e sentem a mesma força grande',
  },
  'caption.softStopping': {
    ko: '방석에 닿은 공은 아직 멈추는 중 — 힘이 낮게 오래 이어진다',
    en: 'The ball in the cushion is still stopping — the force stays low for longer',
    ja: 'クッションのボールはまだ止まる途中 — 力は低いまま長く続く',
    zh: '垫子上的球还在停下的过程中——力保持较低，持续更久',
    ar: 'الكرة في الوسادة ما زالت تتوقف — تبقى القوة منخفضة مدة أطول',
    es: 'La bola del cojín aún se está deteniendo — la fuerza se mantiene baja durante más tiempo',
    fr: 'La balle dans le coussin est encore en train de s’arrêter — la force reste faible plus longtemps',
    hi: 'गद्दे वाली गेंद अभी भी रुक रही है — बल देर तक कम बना रहता है',
    id: 'Bola di bantalan masih dalam proses berhenti — gayanya tetap rendah lebih lama',
    pt: 'A bola na almofada ainda está parando — a força fica baixa por mais tempo',
  },
  'caption.sameDone': {
    ko: '같은 시간에 멈추면 힘도 같다',
    en: 'Stopping in the same time means the same force',
    ja: '同じ時間で止まれば、力も同じ',
    zh: '在相同的时间内停下，力也相同',
    ar: 'التوقف في الزمن نفسه يعني القوة نفسها',
    es: 'Detenerse en el mismo tiempo significa la misma fuerza',
    fr: 'S’arrêter dans le même temps, c’est subir la même force',
    hi: 'एक ही समय में रुकने का अर्थ है एक जैसा बल',
    id: 'Berhenti dalam waktu yang sama berarti gaya yang sama',
    pt: 'Parar no mesmo tempo significa a mesma força',
  },
  'caption.done': {
    ko: '둘 다 멈췄다 — 오래 걸려 멈춘 쪽의 힘이 훨씬 낮았다',
    en: 'Both have stopped — the one that took longer felt a much lower force',
    ja: 'どちらも止まった — 時間をかけて止まったほうの力がずっと低かった',
    zh: '两个球都停下了——停得更久的那个受到的力要小得多',
    ar: 'توقفت الكرتان — التي استغرقت وقتًا أطول تلقت قوة أقل بكثير',
    es: 'Ambas se han detenido — la que tardó más recibió una fuerza mucho menor',
    fr: 'Les deux se sont arrêtées — celle qui a mis plus longtemps a subi une force bien plus faible',
    hi: 'दोनों रुक गईं — जिसे अधिक समय लगा उसने बहुत कम बल महसूस किया',
    id: 'Keduanya telah berhenti — yang butuh waktu lebih lama menerima gaya yang jauh lebih kecil',
    pt: 'Ambas pararam — a que demorou mais sentiu uma força muito menor',
  },
} satisfies Record<string, LocalizedText>);

export type ImpulseForceRelationMessageKey = keyof typeof impulseForceRelationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: ImpulseForceRelationMessageKey): LocalizedText =>
  impulseForceRelationMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ImpulseForceRelationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const impulseForceRelationSchema: BundleSchema = {
  id: IMPULSE_FORCE_RELATION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { v0: V0, tHard: T_HARD },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px + 캡션 · 조절기 줄. */
  canvas: { height: 350, minHeight: 320 },

  /** 겹침이 원본 순서여야 한다 — 벽 · 방석 · 결 · 공 · 속도 · 힘 · 이름 · 축 · 기록. */
  drawOrder: 'scene',

  /**
   * 한 주기 6.5 s — 날아간다(approach 1.0) · 벽 쪽이 멈춘다(hardContact 0.25) · 방석 쪽이 마저
   * 멈추고 두 곡선이 남는다(settle 5.25).
   *
   * 도착 순간(t = 0)에 공은 이미 날아가는 중이다 — 원본도 주기 첫머리에서 연다. 그래서 `startAt`
   * 이 없다.
   *
   * 공 · 화살표 · 곡선은 모두 접촉 뒤 시각 τ = u − start('hardContact') 의 닫힌 식이라, 조절기가
   * 시계를 0 으로 되돌리면 그대로 처음이 된다. 단계는 캡션을 말하지 않는다 — 방석 쪽이 멈추는
   * 시각(1 + 조절기 값)이 단계로 나뉘지 않아서 문장은 state 로 고른다(아래 `caption.cases`).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: T_HIT },
      { id: 'hardContact', duration: T_HARD },
      { id: 'settle', duration: CYCLE - T_HIT - T_HARD },
    ],
  },

  /**
   * 슬롯 하나. 원본은 그림 아래 왼쪽 정렬 15 px 한 줄이었다.
   *
   * 원본은 매 프레임 접촉 뒤 시각과 방석 멈춤 시간을 견줘 문장을 골랐다. 여기서는 physics 가
   * 같은 비교를 해 state 에 두고, 슬롯은 위에서부터 참인 첫 항목을 쓴다. 아무것도 참이 아니면
   * (둘 다 멈췄고 방석이 더 오래 걸렸다) 마무리 문장이다.
   */
  caption: {
    anchor: { world: [0, -22] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.done'),
    cases: [
      { when: 'approaching', text: key('caption.approach') },
      { when: 'sameShort', text: key('caption.sameShort') },
      { when: 'hardHit', text: key('caption.hardHit') },
      { when: 'softStopping', text: key('caption.softStopping') },
      { when: 'sameDone', text: key('caption.sameDone') },
    ],
  },

  // 그리드 · 카메라 버튼은 원본에 없다 — 켜지 않는다.

  messages: impulseForceRelationMessages,
};
