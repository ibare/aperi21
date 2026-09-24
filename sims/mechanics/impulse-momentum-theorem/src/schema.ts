// ========================================================================
// impulse-momentum-theorem — 선언
// ========================================================================
// 질문: 공이 벽에 부딪혀 튕겨 나올 때, 공의 운동량은 얼마나 바뀌었고 그것을
// 정한 것은 무엇인가.
//
// 답: 벽이 미는 힘을 시간에 대해 쌓은 넓이(충격량 J)만큼 바뀐다. 넓이가 쌓이는
// 동안 운동량 화살표는 **쌓인 만큼** 옮겨 가고, 넓이가 처음 운동량만큼 쌓인
// 순간 공이 멈추며, 그 뒤로 쌓이는 넓이는 운동량을 반대쪽으로 키운다. 그래서
// 튕겨 나온 공의 운동량 변화는 처음 운동량보다 **크다**.
//
// 이웃 `impulse-force-relation` 은 「같은 충격량을 길게 받으면 힘이 작다」 이다.
// 여기는 힘의 모양을 견주지 않는다 — 한 물체가 받은 넓이와 그 물체의 운동량
// 변화가 같다는 것 하나에 머문다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:impulse-momentum-theorem` 와 문자 그대로 일치한다 (C4). */
export const IMPULSE_MOMENTUM_THEOREM_ID = 'impulse-momentum-theorem';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 운동량은 처음 운동량의 크기를 1 로 잡은 단위다. 화면에 수를 두지 않는다.
// ------------------------------------------------------------------------

/** 처음 운동량. 음수가 왼쪽(벽 쪽)이다. */
export const P_INITIAL = -1;
/** 반발 계수. 튕겨 나온 운동량 = −e · 처음 운동량. */
export const RESTITUTION = 0.6;
/** 벽에 닿아 있는 시간(조각 시계 초). 화면에서는 `CONTACT_TIME_SCALE` 만큼 느리게 흐른다. */
export const CONTACT_TIME = 0.2;
/** 운동량 1 당 공의 속력(월드/초). 화면에서 공이 움직이는 빠르기일 뿐이다. */
export const SPEED_PER_P = 0.7;

/**
 * 힘 F(τ) = Fmax · sin(πτ/T) 의 넓이가 J(τ) = J·(1 − cos(πτ/T))/2 이다.
 * 이 넓이가 |p₀| 가 되는 순간(공이 멈추는 순간)의 비율 — `stop` 단계 길이의 기본값이다.
 */
const J_TOTAL = (1 + RESTITUTION) * Math.abs(P_INITIAL);
const STOP_FRACTION = Math.acos(1 - (2 * Math.abs(P_INITIAL)) / J_TOTAL) / Math.PI;

// ------------------------------------------------------------------------
// 시간표 기본값(조각 시계 초)
// ------------------------------------------------------------------------

/** 벽까지 굴러가는 시간. */
export const APPROACH = 1.2;
/** 닿은 순간부터 멈출 때까지 · 멈춘 뒤 떨어질 때까지. 둘의 합이 `CONTACT_TIME`. */
export const STOP = CONTACT_TIME * STOP_FRACTION;
export const REBOUND = CONTACT_TIME - STOP;
/** 접촉 동안의 재생 속도. 0.2 초를 화면에서 2.4 초로 늘인다. */
export const CONTACT_TIME_SCALE = 1 / 12;
/** 튕겨 나가 달리는 시간 · 옅어지는 시간. */
export const LEAVE = 2.6;
export const FADE = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 벽 면이 x = 0.
// ------------------------------------------------------------------------

/** 공 반지름. */
export const BALL_R = 0.15;
/** 공이 가장 세게 눌렸을 때 가로로 줄어드는 양(반지름 비). 눌림은 힘에 비례한다. */
export const SQUASH_MAX = 0.22;
/** 바닥 높이. */
export const FLOOR_Y = 1.12;
/** 바닥선 오른쪽 끝. */
export const FLOOR_END_X = 2.0;
/** 벽 두께 · 높이. */
export const WALL_THICK = 0.1;
export const WALL_H = 0.5;

/** 운동량 수직선 — 높이 · 0 의 자리 · 운동량 1 의 길이 · 좌우 끝. */
export const P_AXIS_Y = 0.66;
export const P_ORIGIN_X = 1.15;
export const P_UNIT = 1.0;
export const P_AXIS_FROM = 0.0;
export const P_AXIS_TO = 2.0;
/** 충격량 화살표가 놓이는 줄 — 운동량 수직선 바로 아래. */
export const J_LANE_Y = 0.4;

/** 힘-시간 그래프 — 원점 · 가로 길이 · 최대 힘의 높이 · 세로축 길이. */
export const GRAPH_X = 2.62;
export const GRAPH_Y = 0.3;
export const GRAPH_W = 1.9;
export const GRAPH_H = 1.0;
export const GRAPH_AXIS_H = 1.28;
/** 그래프 가로축이 담는 접촉 앞뒤 여유(접촉 시간 비). */
export const GRAPH_MARGIN = 0.18;
/** 힘 곡선을 자르는 마디 수. */
export const GRAPH_SAMPLES = 64;

/** 힘 화살표 — 최대 힘일 때 길이(월드). 그래프와 같은 모양으로 자라고 준다. */
export const FORCE_ARROW_LEN = 0.55;

/** 고정 경계. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다). */
export const SCENE_BOUNDS = { minX: -0.42, maxX: 4.86, minY: -0.12, maxY: 1.72 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const impulseMomentumTheoremMessages = Object.freeze({
  'label.title': {
    ko: '충격량-운동량 정리',
    en: 'Impulse–momentum theorem',
    ja: '力積と運動量の関係',
    zh: '动量定理',
    ar: 'مبرهنة الدفع والزخم',
    es: 'Teorema del impulso y el momento lineal',
    fr: 'Théorème impulsion–quantité de mouvement',
    hi: 'आवेग–संवेग प्रमेय',
    id: 'Teorema impuls–momentum',
    pt: 'Teorema do impulso e da quantidade de movimento',
  },
  'label.operation': {
    ko: '충격량이 운동량 변화와 같음',
    en: 'Impulse equals the change in momentum',
    ja: '力積は運動量の変化に等しい',
    zh: '冲量等于动量的变化',
    ar: 'الدفع يساوي التغير في الزخم',
    es: 'El impulso es igual al cambio del momento lineal',
    fr: 'L’impulsion est égale à la variation de la quantité de mouvement',
    hi: 'आवेग संवेग में परिवर्तन के बराबर है',
    id: 'Impuls sama dengan perubahan momentum',
    pt: 'O impulso é igual à variação da quantidade de movimento',
  },
  'label.stage': {
    ko: '벽에 튕기는 공',
    en: 'Ball bouncing off a wall',
    ja: '壁ではね返るボール',
    zh: '从墙上弹回的球',
    ar: 'كرة ترتد عن جدار',
    es: 'Bola que rebota en una pared',
    fr: 'Balle qui rebondit sur un mur',
    hi: 'दीवार से टकराकर लौटती गेंद',
    id: 'Bola yang memantul dari dinding',
    pt: 'Bola que ricocheteia numa parede',
  },
  'label.view': {
    ko: '운동량과 넓이',
    en: 'Momentum and area',
    ja: '運動量と面積',
    zh: '动量与面积',
    ar: 'الزخم والمساحة',
    es: 'Momento lineal y área',
    fr: 'Quantité de mouvement et aire',
    hi: 'संवेग और क्षेत्रफल',
    id: 'Momentum dan luas',
    pt: 'Quantidade de movimento e área',
  },

  /** 수직선 이름. 조사가 붙지 않는 한 낱말이지만 언어마다 다른 말이라 문안이다 (C1 판정 4). */
  'label.momentum': {
    ko: '운동량',
    en: 'momentum',
    ja: '運動量',
    zh: '动量',
    ar: 'الزخم',
    es: 'momento lineal',
    fr: 'quantité de mouvement',
    hi: 'संवेग',
    id: 'momentum',
    pt: 'quantidade de movimento',
  },
  /** 그래프 세로축 이름. 누가 누구를 미는지가 들어가 문안이다. */
  'label.force': {
    ko: '벽이 공을 미는 힘',
    en: 'push of the wall on the ball',
    ja: '壁がボールを押す力',
    zh: '墙推球的力',
    ar: 'القوة التي يدفع بها الجدار الكرة',
    es: 'empuje de la pared sobre la bola',
    fr: 'poussée du mur sur la balle',
    hi: 'दीवार द्वारा गेंद पर धक्का',
    id: 'dorongan dinding pada bola',
    pt: 'empurrão da parede na bola',
  },
  /** 넓이가 처음 운동량만큼 쌓인 자리 — 공이 멈춘 순간. */
  'label.stop': {
    ko: '멈춤',
    en: 'stops',
    ja: '止まる',
    zh: '停住',
    ar: 'تتوقف',
    es: 'se detiene',
    fr: 's’arrête',
    hi: 'रुकती है',
    id: 'berhenti',
    pt: 'para',
  },

  /** 기호는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.p': {
    ko: 'p',
    en: 'p',
    ja: 'p',
    zh: 'p',
    ar: 'p',
    es: 'p',
    fr: 'p',
    hi: 'p',
    id: 'p',
    pt: 'p',
  },
  'label.p0': {
    ko: 'p₀',
    en: 'p₀',
    ja: 'p₀',
    zh: 'p₀',
    ar: 'p₀',
    es: 'p₀',
    fr: 'p₀',
    hi: 'p₀',
    id: 'p₀',
    pt: 'p₀',
  },
  'label.J': {
    ko: 'J',
    en: 'J',
    ja: 'J',
    zh: 'J',
    ar: 'J',
    es: 'J',
    fr: 'J',
    hi: 'J',
    id: 'J',
    pt: 'J',
  },
  'label.F': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.t': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },

  'caption.approach': {

    ko: '공이 벽을 향해 간다. 운동량 p 는 왼쪽을 향한다.',

    en: 'The ball heads for the wall. Its momentum p points left.',

    ja: 'ボールが壁に向かう。運動量 p は左向きだ。',

    zh: '球冲向墙。它的动量 p 指向左方。',

    ar: 'تتجه الكرة نحو الجدار. زخمها p يشير إلى اليسار.',

    es: 'La bola se dirige a la pared. Su momento lineal p apunta a la izquierda.',

    fr: 'La balle se dirige vers le mur. Sa quantité de mouvement p pointe vers la gauche.',

    hi: 'गेंद दीवार की ओर जाती है। उसका संवेग p बाईं ओर है।',

    id: 'Bola menuju dinding. Momentumnya p mengarah ke kiri.',

    pt: 'A bola segue para a parede. Sua quantidade de movimento p aponta para a esquerda.',

  },
  'caption.stop': {
    ko: '벽이 미는 동안 힘-시간 넓이 J 가 쌓이고, 운동량 화살표는 쌓인 넓이만큼 오른쪽으로 옮겨 간다.',
    en: 'While the wall pushes, the force–time area J builds up, and the momentum arrow shifts right by exactly that much.',
    ja: '壁が押す間、力–時間の面積 J がたまり、運動量の矢印はちょうどその分だけ右へ移る。',
    zh: '墙推球的同时，力–时间面积 J 不断累积，动量箭头恰好向右移动同样多。',
    ar: 'بينما يضغط الجدار، تتراكم مساحة القوة–الزمن J، وينتقل سهم الزخم إلى اليمين بالمقدار نفسه تمامًا.',
    es: 'Mientras la pared empuja, el área fuerza–tiempo J se acumula, y la flecha del momento lineal se desplaza a la derecha exactamente esa cantidad.',
    fr: 'Pendant que le mur pousse, l’aire force–temps J s’accumule, et la flèche de quantité de mouvement se décale vers la droite d’exactement autant.',
    hi: 'जब तक दीवार धकेलती है, बल–समय क्षेत्रफल J बढ़ता जाता है, और संवेग तीर ठीक उतना ही दाईं ओर खिसकता है।',
    id: 'Selama dinding mendorong, luas gaya–waktu J bertambah, dan panah momentum bergeser ke kanan tepat sebanyak itu.',
    pt: 'Enquanto a parede empurra, a área força–tempo J se acumula, e a seta da quantidade de movimento se desloca para a direita exatamente nessa medida.',
  },
  'caption.rebound': {
    ko: '넓이가 처음 운동량만큼 쌓인 순간 공이 멈췄다. 그 뒤로 쌓이는 넓이만큼 운동량이 반대쪽으로 자란다.',
    en: 'The ball stopped the moment the area matched its first momentum. Every bit of area after that grows the momentum the other way.',
    ja: '面積が最初の運動量に等しくなった瞬間、ボールは止まった。その後にたまる面積はすべて、運動量を反対向きに大きくする。',
    zh: '面积等于初动量的那一刻，球停住了。此后累积的每一点面积都使动量朝反方向增大。',
    ar: 'توقفت الكرة لحظة ساوت المساحةُ زخمَها الأول. وكل جزء من المساحة بعد ذلك يزيد الزخم في الاتجاه المعاكس.',
    es: 'La bola se detuvo en el instante en que el área igualó su momento lineal inicial. Cada porción de área posterior hace crecer el momento lineal en sentido contrario.',
    fr: 'La balle s’est arrêtée à l’instant où l’aire a égalé sa quantité de mouvement initiale. Chaque parcelle d’aire ensuite fait croître la quantité de mouvement dans l’autre sens.',
    hi: 'जिस क्षण क्षेत्रफल उसके प्रारंभिक संवेग के बराबर हुआ, गेंद रुक गई। उसके बाद जुड़ने वाला हर अंश संवेग को उलटी दिशा में बढ़ाता है।',
    id: 'Bola berhenti tepat saat luasnya menyamai momentum awalnya. Setiap tambahan luas setelah itu memperbesar momentum ke arah sebaliknya.',
    pt: 'A bola parou no instante em que a área igualou sua quantidade de movimento inicial. Cada pedaço de área depois disso faz a quantidade de movimento crescer no sentido oposto.',
  },
  'caption.leave': {
    ko: '튕겨 나간 공의 운동량 변화는 받은 넓이 J 와 같다 — 멈추는 몫과 되돌리는 몫을 합해 처음 운동량보다 길다.',
    en: 'The rebounding ball’s change in momentum equals the area J it received — stopping plus sending back, longer than the first momentum.',
    ja: 'はね返ったボールの運動量の変化は、受けた面積 J に等しい — 止める分と押し返す分を合わせ、最初の運動量より長い。',
    zh: '弹回的球的动量变化等于它所受的面积 J——停下的部分加上弹回的部分，比初动量更长。',
    ar: 'التغير في زخم الكرة المرتدة يساوي المساحة J التي تلقتها — الإيقاف مضافًا إليه الإرجاع، أطول من الزخم الأول.',
    es: 'El cambio del momento lineal de la bola que rebota es igual al área J que recibió — detenerla más devolverla, más largo que el momento lineal inicial.',
    fr: 'La variation de quantité de mouvement de la balle qui rebondit est égale à l’aire J qu’elle a reçue — l’arrêt plus le renvoi, plus longue que la quantité de mouvement initiale.',
    hi: 'लौटती गेंद के संवेग में परिवर्तन उसे मिले क्षेत्रफल J के बराबर है — रोकना और वापस भेजना मिलाकर, प्रारंभिक संवेग से लंबा।',
    id: 'Perubahan momentum bola yang memantul sama dengan luas J yang diterimanya — menghentikan ditambah memantulkan balik, lebih panjang dari momentum awal.',
    pt: 'A variação da quantidade de movimento da bola que volta é igual à área J que ela recebeu — parar mais mandar de volta, maior que a quantidade de movimento inicial.',
  },
} satisfies Record<string, LocalizedText>);

export type ImpulseMomentumTheoremMessageKey = keyof typeof impulseMomentumTheoremMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ImpulseMomentumTheoremMessageKey): LocalizedText =>
  impulseMomentumTheoremMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ImpulseMomentumTheoremMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const impulseMomentumTheoremSchema: BundleSchema = {
  id: IMPULSE_MOMENTUM_THEOREM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'wall-bounce',
      label: text('label.stage'),
      constants: {
        pInitial: P_INITIAL,
        restitution: RESTITUTION,
        contactTime: CONTACT_TIME,
        speedPerP: SPEED_PER_P,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 왼쪽 벽 · 공 · 운동량 수직선, 오른쪽 힘-시간 그래프. 두 판이
   * 같은 높이를 나눠 쓰므로 세로를 더 주면 그림만 작아진다.
   */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 넓이 칸이 힘 곡선 **아래**, 공이 벽 **앞**에 와야 한다.
   * 층 순서로는 `region` 이 곡선 위로 올라온다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 공이 이미 벽을 향해 굴러가는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 — 다가감 → 멈출 때까지 밀림 → 되밀림 → 튕겨 나감 → 흐려짐.
   *
   * 접촉은 실제로 순식간이라 `stop` · `rebound` 를 느리게 흘린다(`timeScale`). 두 단계의
   * 경계 기본값은 물리에서 끌어온다 — 넓이가 |p₀| 가 되는 순간이 곧 `stop` 의 끝이라
   * 「공이 멈췄다」 는 캡션이 화면과 어긋날 수 없다. 물리는 이 경계를 쓰지 않는다 —
   * 닿는 **시작** 시각(`start('stop')`)만 묻고 그 뒤는 접촉 시간으로 센다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      {
        id: 'stop',
        duration: STOP,
        timeScale: CONTACT_TIME_SCALE,
        caption: key('caption.stop'),
      },
      {
        id: 'rebound',
        duration: REBOUND,
        timeScale: CONTACT_TIME_SCALE,
        caption: key('caption.rebound'),
      },
      { id: 'leave', duration: LEAVE, caption: key('caption.leave') },
      { id: 'fade', duration: FADE, caption: key('caption.leave') },
    ],
  },

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정리와 공식은 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 재는 것은 화살표의
  // 길이와 넓이의 **같음**이고, 거리 눈금은 「몇 미터인가」 라는 다른 질문을 부른다.

  messages: impulseMomentumTheoremMessages,
};
