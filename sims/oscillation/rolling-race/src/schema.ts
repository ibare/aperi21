// ========================================================================
// rolling-race — 선언
// ========================================================================
// 질문: 같은 비탈 같은 높이에서 동시에 놓은 공 · 원판 · 고리 중 무엇이 먼저 닿는가.
//       크고 무거운 것이 먼저인가?
//
// 나란한 비탈 넷 — 고리 · 큰 원판 · 작은 원판 · 공(속이 찬 구). 같은 각도, 같은 길이,
// 같은 순간 놓는다. 굴러 내려가는 가속도는 g·sinθ/(1 + k) 이고 k = I/(mR²) 는 **모양만의
// 수**라서 질량도 반지름도 식에서 사라진다. 크기가 다른 원판 둘이 나란히 가고, 질량이
// 가운데 모인 공이 먼저, 질량이 모두 테에 있는 고리가 마지막에 닿는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rolling-race` 와 문자 그대로 일치한다 (C4). */
export const ROLLING_RACE_ID = 'rolling-race';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/** 비탈 각도(라디안). 네 레인이 같다. */
export const ANGLE = (10 * Math.PI) / 180;
/** 출발선에서 결승선까지 비탈을 따라 잰 길이(m). 네 레인이 같다. */
export const LENGTH = 7;

/**
 * 모양 계수 k = I/(mR²). **모양만의 수**다 — 질량 · 반지름이 들어 있지 않다.
 * 속이 찬 구 2/5, 원판 1/2, 얇은 고리 1.
 */
export const K_SPHERE = 2 / 5;
export const K_DISC = 1 / 2;
export const K_HOOP = 1;

/**
 * 물체의 반지름(m). **도착 순서에 들어가지 않는다** — 크기가 결과를 바꾸지 않는다는 것을
 * 보이려고 일부러 섞었다. 원판 둘은 반지름이 두 배 차이(같은 재질이면 질량은 네 배)다.
 */
export const R_HOOP = 0.24;
export const R_DISC_LARGE = 0.26;
export const R_DISC_SMALL = 0.13;
export const R_SPHERE = 0.19;

/** 굴러 내려가는 가속도와 도착 시각. 단계 길이의 기본값이 여기서 나온다. */
const accelOf = (k: number): number => (GRAVITY * Math.sin(ANGLE)) / (1 + k);
const arrivalOf = (k: number): number => Math.sqrt((2 * LENGTH) / accelOf(k));
export const T_SPHERE = arrivalOf(K_SPHERE);
export const T_HOOP = arrivalOf(K_HOOP);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 나란한 비탈을 위아래로 겹쳐 둔다.
// ------------------------------------------------------------------------

/** 레인 사이 세로 간격(m). 가장 큰 물체(지름 0.52)가 이웃 레인에 닿지 않을 만큼. */
export const LANE_GAP = 0.66;
/** 결승선 뒤 멈춤막의 높이(m). */
export const STOPPER_HEIGHT = 0.2;
/** 레인 이름표 · 순위 표지가 선에서 떨어진 가로 거리(m). */
export const NAME_DX = -0.5;
export const RANK_DX = 0.62;
/** 굴림 표지(반지름 선)가 시작하는 자리 — 반지름에 대한 비. 가운데는 비워 둔다. */
export const SPOKE_INNER = 0.3;

/**
 * 프레이밍은 주장의 일부다. 가로는 이름표(−1.1)부터 순위 표지 너머까지, 세로는 맨 아래
 * 레인 끝과 캡션 줄부터 맨 위 레인 출발점 위 물체까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.15, maxX: 8.05, minY: -0.62, maxY: 3.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 출발선에 넷이 나란히 서 있는 동안(초). */
export const READY = 1.1;
/** 공이 결승선에 닿기까지 — `roll` 단계. */
export const ROLL = T_SPHERE;
/** 공이 닿은 뒤 고리가 닿기까지 — `finish` 단계. 원판 둘이 이 안에서 함께 닿는다. */
export const FINISH = T_HOOP - T_SPHERE;
/** 결승선 부근을 눈으로 가르게 느리게 흘린다 — 공 · 원판의 차이는 0.1 초 남짓이다. */
export const FINISH_SLOW = 0.35;
/** 닿은 순서를 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rollingRaceMessages = Object.freeze({
  'label.title': {
    ko: '구르는 물체의 경주',
    en: 'Rolling race',
    ja: '転がる物体の競走',
    zh: '滚动物体赛跑',
    ar: 'سباق الأجسام المتدحرجة',
    es: 'Carrera de objetos rodantes',
    fr: 'Course d’objets qui roulent',
    hi: 'लुढ़कती वस्तुओं की दौड़',
    id: 'Balapan benda menggelinding',
    pt: 'Corrida de objetos rolando',
  },
  'label.operation': {
    ko: '질량 분포가 정하는 도착 순서',
    en: 'Arrival order set by mass distribution',
    ja: '質量分布が決める到着順',
    zh: '由质量分布决定的到达顺序',
    ar: 'ترتيب الوصول يحدده توزيع الكتلة',
    es: 'Orden de llegada fijado por la distribución de masa',
    fr: 'Ordre d’arrivée fixé par la répartition de la masse',
    hi: 'द्रव्यमान वितरण से तय होता पहुँचने का क्रम',
    id: 'Urutan tiba ditentukan oleh sebaran massa',
    pt: 'Ordem de chegada definida pela distribuição de massa',
  },
  'label.stage': {
    ko: '같은 비탈',
    en: 'Same incline',
    ja: '同じ斜面',
    zh: '同一斜面',
    ar: 'المستوى المائل نفسه',
    es: 'El mismo plano inclinado',
    fr: 'Même plan incliné',
    hi: 'एक ही आनत तल',
    id: 'Bidang miring yang sama',
    pt: 'Mesmo plano inclinado',
  },
  'label.view': {
    ko: '나란한 레인',
    en: 'Side-by-side lanes',
    ja: '並んだレーン',
    zh: '并排跑道',
    ar: 'مسارات متجاورة',
    es: 'Carriles lado a lado',
    fr: 'Couloirs côte à côte',
    hi: 'साथ-साथ लेन',
    id: 'Lintasan berdampingan',
    pt: 'Raias lado a lado',
  },
  'label.hoop': {
    ko: '고리',
    en: 'hoop',
    ja: '円環',
    zh: '圆环',
    ar: 'حلقة',
    es: 'aro',
    fr: 'anneau',
    hi: 'वलय',
    id: 'cincin',
    pt: 'aro',
  },
  'label.disc': {
    ko: '원판',
    en: 'disc',
    ja: '円板',
    zh: '圆盘',
    ar: 'قرص',
    es: 'disco',
    fr: 'disque',
    hi: 'डिस्क',
    id: 'cakram',
    pt: 'disco',
  },
  'label.sphere': {
    ko: '공',
    en: 'ball',
    ja: '球',
    zh: '球',
    ar: 'كرة',
    es: 'bola',
    fr: 'boule',
    hi: 'गेंद',
    id: 'bola',
    pt: 'bola',
  },
  /** 도착 순위. 표식이다 — 같이 닿은 둘은 같은 수를 받는다. */
  'label.rank1': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'label.rank2': {
    ko: '2',
    en: '2',
    ja: '2',
    zh: '2',
    ar: '2',
    es: '2',
    fr: '2',
    hi: '2',
    id: '2',
    pt: '2',
  },
  'label.rank3': {
    ko: '3',
    en: '3',
    ja: '3',
    zh: '3',
    ar: '3',
    es: '3',
    fr: '3',
    hi: '3',
    id: '3',
    pt: '3',
  },
  'caption.ready': {
    ko: '같은 높이, 같은 비탈 — 고리 · 큰 원판 · 작은 원판 · 공을 한꺼번에 놓는다',
    en: 'Same height, same slope — a hoop, a large disc, a small disc and a ball are released together',
    ja: '同じ高さ、同じ斜面 — 円環・大きな円板・小さな円板・球を同時に放す',
    zh: '同样的高度，同样的斜面 — 圆环、大圆盘、小圆盘和球同时释放',
    ar: 'الارتفاع نفسه والمنحدر نفسه — تُترك حلقة وقرص كبير وقرص صغير وكرة معًا',
    es: 'Misma altura, misma pendiente — se sueltan a la vez un aro, un disco grande, un disco pequeño y una bola',
    fr: 'Même hauteur, même pente — un anneau, un grand disque, un petit disque et une boule sont lâchés ensemble',
    hi: 'समान ऊँचाई, समान ढलान — एक वलय, एक बड़ी डिस्क, एक छोटी डिस्क और एक गेंद एक साथ छोड़े जाते हैं',
    id: 'Ketinggian sama, lereng sama — sebuah cincin, cakram besar, cakram kecil, dan bola dilepas bersamaan',
    pt: 'Mesma altura, mesma rampa — um aro, um disco grande, um disco pequeno e uma bola são soltos juntos',
  },
  'caption.roll': {
    ko: '크기가 다른 원판 둘은 나란히 구르고, 고리는 점점 처진다',
    en: 'The two discs of different size roll side by side; the hoop falls further behind',
    ja: '大きさの違う二つの円板は並んで転がり、円環はしだいに遅れていく',
    zh: '大小不同的两个圆盘并排滚动；圆环越落越远',
    ar: 'يتدحرج القرصان المختلفان في الحجم جنبًا إلى جنب، وتتأخر الحلقة أكثر فأكثر',
    es: 'Los dos discos de distinto tamaño ruedan a la par; el aro se va quedando atrás',
    fr: 'Les deux disques de tailles différentes roulent côte à côte ; l’anneau se laisse distancer',
    hi: 'अलग-अलग माप की दोनों डिस्क साथ-साथ लुढ़कती हैं; वलय और पीछे छूटता जाता है',
    id: 'Dua cakram berbeda ukuran menggelinding berdampingan; cincin makin tertinggal',
    pt: 'Os dois discos de tamanhos diferentes rolam lado a lado; o aro fica cada vez mais para trás',
  },
  'caption.finish': {
    ko: '공이 먼저 닿았다 — 원판 둘이 나란히 뒤따르고, 고리는 한참 뒤다',
    en: 'The ball got there first — the two discs follow side by side, the hoop far behind',
    ja: '球が最初に着いた — 二つの円板が並んで続き、円環はずっと後ろだ',
    zh: '球最先到达 — 两个圆盘并排紧随其后，圆环远远落在后面',
    ar: 'وصلت الكرة أولًا — يتبعها القرصان جنبًا إلى جنب، والحلقة متأخرة كثيرًا',
    es: 'La bola llegó primero — los dos discos la siguen a la par y el aro, muy atrás',
    fr: 'La boule est arrivée la première — les deux disques suivent côte à côte, l’anneau loin derrière',
    hi: 'गेंद सबसे पहले पहुँची — दोनों डिस्क साथ-साथ पीछे आईं, वलय बहुत पीछे रहा',
    id: 'Bola tiba lebih dulu — dua cakram menyusul berdampingan, cincin jauh di belakang',
    pt: 'A bola chegou primeiro — os dois discos vêm lado a lado, e o aro bem atrás',
  },
  'caption.result': {
    ko: '크기와 상관없이 모양이 순서를 갈랐다 — 질량이 테 쪽에 있을수록 늦게 닿았다',
    en: 'Size made no difference; shape set the order — the more mass out at the rim, the later it arrived',
    ja: '大きさは関係なく、形が順位を決めた — 質量が縁に寄っているほど遅く着いた',
    zh: '大小无关，形状决定了顺序 — 质量越靠近边缘，到达得越晚',
    ar: 'لم يُحدث الحجم فرقًا، بل حدد الشكل الترتيب — كلما ابتعدت الكتلة نحو الحافة تأخر الوصول',
    es: 'El tamaño no importó; la forma fijó el orden — cuanta más masa hacia el borde, más tarde llegó',
    fr: 'La taille n’a rien changé ; la forme a fixé l’ordre — plus la masse est vers le bord, plus l’arrivée est tardive',
    hi: 'माप से कोई फ़र्क नहीं पड़ा; आकृति ने क्रम तय किया — द्रव्यमान जितना किनारे की ओर, पहुँच उतनी देर से',
    id: 'Ukuran tidak berpengaruh; bentuklah yang menentukan urutan — makin banyak massa di tepi, makin lambat tiba',
    pt: 'O tamanho não fez diferença; a forma definiu a ordem — quanto mais massa na borda, mais tarde chegou',
  },
} satisfies Record<string, LocalizedText>);

export type RollingRaceMessageKey = keyof typeof rollingRaceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RollingRaceMessageKey): LocalizedText => rollingRaceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RollingRaceMessageKey): string {
  return k;
}

/** 도착 순위 → 표지 키. 순위가 늘면 여기서 타입이 막는다. */
export const RANK_LABELS: readonly RollingRaceMessageKey[] = ['label.rank1', 'label.rank2', 'label.rank3'];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rollingRaceSchema: BundleSchema = {
  id: ROLLING_RACE_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 굴러 내려가는 중이고, 닿고, 다시 놓인다.
  parameters: [],

  stages: [
    {
      id: 'same-incline',
      label: text('label.stage'),
      constants: {
        g: GRAVITY,
        angle: ANGLE,
        length: LENGTH,
        kSphere: K_SPHERE,
        kDisc: K_DISC,
        kHoop: K_HOOP,
        rHoop: R_HOOP,
        rDiscLarge: R_DISC_LARGE,
        rDiscSmall: R_DISC_SMALL,
        rSphere: R_SPHERE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 9 m 를 담아야 하고 세로는 레인 넷과 캡션 줄이다. 세로를 더 주면 가로가 먼저
   * 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 겹침이 판정 장치다. 출발선 · 결승선은 물체 **뒤** 로 지나가야 하고, 굴림 표지는
   * 물체 **위** 에 얹혀야 돈다는 것이 보인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 출발선에 섬 → 굴러 내려감(공이 닿을 때까지) → 결승 (고리가 닿을 때까지,
   * 느리게) → 순서를 읽음 → 흐려짐.
   *
   * `roll` · `finish` 의 길이를 물리에서 끌어온다. 공이 닿는 순간이 곧 `roll` 의 끝이라
   * 「공이 먼저 닿는다」 캡션이 화면과 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: READY, caption: key('caption.ready') },
      { id: 'roll', duration: ROLL, caption: key('caption.roll') },
      { id: 'finish', duration: FINISH, timeScale: FINISH_SLOW, caption: key('caption.finish') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 넷이 비탈 중간쯤을 굴러 내려가는 자리에서 연다.
   * 0 이면 멈춰 선 넷이 먼저 보인다.
   */
  startAt: 2.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **누가 먼저 선을 넘었나**라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: rollingRaceMessages,
};
