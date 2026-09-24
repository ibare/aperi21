// ========================================================================
// pressure-from-collisions — 선언
// ========================================================================
// 질문: 분자가 두 배 빨라지면 벽이 받는 압력은 몇 배가 되나.
//
// 같은 상자에 같은 분자를 담고 속력만 v · kv 로 다르게 한 둘을 나란히 둔다.
// 각 상자 아래 두 줄이 따로 선다 —
//   1) 한 번 때릴 때 벽이 받는 운동량 변화(2mv 화살표). kv 상자는 k 배 길다.
//   2) 같은 시간 동안 오른쪽 벽에 닿은 횟수(세는 눈금). kv 상자는 k 배 많다.
// 한 번 닿을 때마다 오른쪽 압력 막대에 그 세기만큼의 한 칸이 쌓인다. 그래서 막대는
// 「한 칸 높이 × 칸 수」 로 서고, kv 상자의 막대는 k × k 배가 된다.
//
// 이웃 `gas-pressure` 가 「압력 = 두드림의 합, 데우면 커진다」 를 보인다. 이 조각은
// 그것을 되풀이하지 않는다 — 온도 · 데우기는 없고, 두 배가 **두 번** 곱해지는 것만 보인다.
// `ideal-gas-law` 의 P · V · T 막대 · 자물쇠와도 겹치지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pressure-from-collisions` 와 문자 그대로 일치한다 (C4). */
export const PRESSURE_FROM_COLLISIONS_ID = 'pressure-from-collisions';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 분자 질량(임의 단위). 한 번의 운동량 변화 2mv 에 들어간다. */
export const MOLECULE_MASS = 1;
/** 왼쪽 상자 분자의 가로 속력 v(월드/초). 모든 분자가 같은 가로 속력으로 벽을 오간다. */
export const MOLECULE_SPEED = 0.8;
/** 오른쪽 상자의 속력 배수 k. */
export const SPEED_FACTOR = 2;
/** 상자마다 담긴 분자 수. 두 상자가 같은 분자를 담는다. */
export const MOLECULE_COUNT = 5;
/** 분자 배치를 뽑는 시드. */
export const MOLECULE_SEED = 11;
/** 세로로 오가는 빈도의 범위(회/초, 왼쪽 상자). 벽을 때리는 것과 무관한 겉모습이다. */
export const VERTICAL_RATE_MIN = 0.12;
export const VERTICAL_RATE_MAX = 0.34;

/** 상자 안쪽 가로 · 세로(월드). */
export const BOX_WIDTH = 1.7;
export const BOX_HEIGHT = 1.5;

/** 표시 배율 — 운동량 1 이 화살표에서 차지하는 길이(월드). 2mv = 1.6 → 0.4. */
export const ARROW_PER_MOMENTUM = 0.25;
/** 표시 배율 — 운동량 1 이 압력 막대 한 칸에서 차지하는 높이(월드). 2mv = 1.6 → 0.1. */
export const BLOCK_PER_MOMENTUM = 0.0625;
/** 벽이 받은 한 번이 섬광으로 남는 시간(초). 부딪힌 순간마다 다르므로 단계로 풀 수 없다. */
export const FLASH_SECONDS = 0.45;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 상자 둘이 나란히, 그 오른쪽에 압력 막대 둘.
// ------------------------------------------------------------------------

/** 왼쪽 상자의 왼쪽 아래 모서리. */
export const BOX_ORIGIN = { x: 0, y: 0.95 } as const;
/** 두 상자 사이 · 오른쪽 상자와 막대 사이 틈(월드). */
export const BOX_GAP = 0.6;
export const BAR_GAP = 0.55;
/** 분자가 벽에서 떨어져 있는 여유(월드). 점 반지름만큼 안으로 들인다. */
export const MOLECULE_MARGIN = 0.05;

/** 두 줄의 높이(월드 y) — 한 번의 세기 화살표 · 세는 눈금. */
export const ROW_ARROW_Y = 0.6;
export const ROW_TALLY_Y = 0.22;
/** 눈금 하나의 반 높이 · 눈금 사이(월드). 같은 간격이라 줄 길이로 횟수를 견준다. */
export const TALLY_HALF = 0.1;
export const TALLY_SPACING = 0.16;

/** 막대 바닥(월드 y) · 막대 폭 · 두 막대 사이 가운데 거리(월드). */
export const BAR_BASE = 0.12;
export const BAR_WIDTH = 0.42;
export const BAR_PITCH = 0.62;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 줄 이름표부터 오른쪽 막대까지, 세로는 상자 위
 * 속력 표식부터 아래 캡션 줄까지. 가장 큰 장면(오른쪽 막대가 다 선 때)이 들어가도록
 * 기본 상수 기준으로 고정한다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 6.0, minY: -0.6, maxY: 2.72 } as const;

// ------------------------------------------------------------------------
// 문안 (C1)
// ------------------------------------------------------------------------

export const pressureFromCollisionsMessages = Object.freeze({
  'label.title': {
    ko: '충돌이 만드는 압력',
    en: 'Pressure from collisions',
    ja: '衝突が生む圧力',
    zh: '碰撞产生的压强',
    ar: 'الضغط الناتج عن التصادمات',
    es: 'Presión debida a los choques',
    fr: 'La pression due aux chocs',
    hi: 'टक्करों से बनने वाला दाब',
    id: 'Tekanan dari tumbukan',
    pt: 'Pressão devida às colisões',
  },
  'label.operation': {
    ko: '벽에 부딪는 분자의 운동량',
    en: 'The momentum molecules bring to the wall',
    ja: '分子が壁にもたらす運動量',
    zh: '分子带给器壁的动量',
    ar: 'الزخم الذي تحمله الجزيئات إلى الجدار',
    es: 'El momento lineal que las moléculas llevan a la pared',
    fr: 'La quantité de mouvement que les molécules apportent à la paroi',
    hi: 'अणुओं द्वारा दीवार तक लाया गया संवेग',
    id: 'Momentum yang dibawa molekul ke dinding',
    pt: 'A quantidade de movimento que as moléculas levam à parede',
  },
  'label.stage': {
    ko: '두 상자',
    en: 'Two boxes',
    ja: '二つの箱',
    zh: '两个盒子',
    ar: 'صندوقان',
    es: 'Dos cajas',
    fr: 'Deux boîtes',
    hi: 'दो डिब्बे',
    id: 'Dua kotak',
    pt: 'Duas caixas',
  },
  'label.view': {
    ko: '상자와 막대',
    en: 'Boxes and bars',
    ja: '箱と棒',
    zh: '盒子与柱条',
    ar: 'الصندوقان والأعمدة',
    es: 'Cajas y barras',
    fr: 'Boîtes et barres',
    hi: 'डिब्बे और पट्टियाँ',
    id: 'Kotak dan batang',
    pt: 'Caixas e barras',
  },

  /** 속력 표식 — 물리 기호라 번역하지 않는다 (C1 판정 3). 배수는 선언값을 끼운다. */
  'label.speed': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.speedTimes': {
    ko: '{k}v',
    en: '{k}v',
    ja: '{k}v',
    zh: '{k}v',
    ar: '{k}v',
    es: '{k}v',
    fr: '{k}v',
    hi: '{k}v',
    id: '{k}v',
    pt: '{k}v',
  },
  /** 한 번의 운동량 변화 표식. */
  'label.impulse': {
    ko: '2mv',
    en: '2mv',
    ja: '2mv',
    zh: '2mv',
    ar: '2mv',
    es: '2mv',
    fr: '2mv',
    hi: '2mv',
    id: '2mv',
    pt: '2mv',
  },
  'label.impulseTimes': {
    ko: '2m({k}v)',
    en: '2m({k}v)',
    ja: '2m({k}v)',
    zh: '2m({k}v)',
    ar: '2m({k}v)',
    es: '2m({k}v)',
    fr: '2m({k}v)',
    hi: '2m({k}v)',
    id: '2m({k}v)',
    pt: '2m({k}v)',
  },
  /** 압력 기호. */
  'label.pressure': {
    ko: 'P',
    en: 'P',
    ja: 'P',
    zh: 'P',
    ar: 'P',
    es: 'P',
    fr: 'P',
    hi: 'P',
    id: 'P',
    pt: 'P',
  },

  /** 두 줄의 이름. */
  'label.rowHit': {
    ko: '한 번의 세기',
    en: 'one hit',
    ja: '1回の衝突',
    zh: '一次碰撞',
    ar: 'تصادم واحد',
    es: 'un choque',
    fr: 'un choc',
    hi: 'एक टक्कर',
    id: 'satu tumbukan',
    pt: 'um choque',
  },
  'label.rowCount': {
    ko: '센 횟수',
    en: 'hits counted',
    ja: '数えた衝突',
    zh: '计数的碰撞',
    ar: 'التصادمات المعدودة',
    es: 'choques contados',
    fr: 'chocs comptés',
    hi: 'गिनी गई टक्करें',
    id: 'tumbukan terhitung',
    pt: 'choques contados',
  },

  /** 결과 배수. 값은 스테이지 상수를 그대로 끼운다 — 곱한 값을 코드가 만들지 않는다. */
  'label.times': {
    ko: '×{k}',
    en: '×{k}',
    ja: '×{k}',
    zh: '×{k}',
    ar: '×{k}',
    es: '×{k}',
    fr: '×{k}',
    hi: '×{k}',
    id: '×{k}',
    pt: '×{k}',
  },
  'label.timesTimes': {
    ko: '×{k}×{k}',
    en: '×{k}×{k}',
    ja: '×{k}×{k}',
    zh: '×{k}×{k}',
    ar: '×{k}×{k}',
    es: '×{k}×{k}',
    fr: '×{k}×{k}',
    hi: '×{k}×{k}',
    id: '×{k}×{k}',
    pt: '×{k}×{k}',
  },

  'caption.watch': {
    ko: '같은 상자, 같은 분자 — 오른쪽 상자는 속력만 {k}배다',
    en: 'Same box, same molecules — only the speed on the right is ×{k}',
    ja: '同じ箱、同じ分子 — 右の箱は速さだけが ×{k}',
    zh: '同样的盒子，同样的分子 — 右边只有速率是 ×{k}',
    ar: 'الصندوق نفسه والجزيئات نفسها — السرعة وحدها في اليمين ×{k}',
    es: 'Misma caja, mismas moléculas — solo la rapidez de la derecha es ×{k}',
    fr: 'Même boîte, mêmes molécules — seule la vitesse à droite est ×{k}',
    hi: 'वही डिब्बा, वही अणु — दाईं ओर केवल चाल ×{k} है',
    id: 'Kotak sama, molekul sama — hanya kelajuan di kanan yang ×{k}',
    pt: 'Mesma caixa, mesmas moléculas — só a velocidade da direita é ×{k}',
  },
  'caption.hit': {
    ko: '벽에 한 번 부딪힐 때 벽이 받는 세기 — 오른쪽 화살표가 {k}배 길다',
    en: 'What the wall gets from one hit — the right arrow is ×{k} longer',
    ja: '1回の衝突で壁が受けるもの — 右の矢印が ×{k} 長い',
    zh: '一次碰撞中器壁得到的 — 右边的箭头长 ×{k}',
    ar: 'ما يتلقاه الجدار من تصادم واحد — السهم الأيمن أطول ×{k}',
    es: 'Lo que recibe la pared en un choque — la flecha de la derecha es ×{k} más larga',
    fr: 'Ce que la paroi reçoit d’un choc — la flèche de droite est ×{k} plus longue',
    hi: 'एक टक्कर से दीवार को जो मिलता है — दायाँ तीर ×{k} लंबा है',
    id: 'Yang diterima dinding dari satu tumbukan — panah kanan ×{k} lebih panjang',
    pt: 'O que a parede recebe de um choque — a seta da direita é ×{k} mais longa',
  },
  'caption.count': {
    ko: '같은 시간 동안 오른쪽 벽에 닿는 횟수를 센다 — 한 번마다 막대에 한 칸씩',
    en: 'Counting hits on the right wall over the same time — one block per hit',
    ja: '同じ時間に右の壁に当たる回数を数える — 1回ごとに1段',
    zh: '数同一段时间内撞到右壁的次数 — 每撞一次加一格',
    ar: 'عدّ التصادمات بالجدار الأيمن خلال الزمن نفسه — خانة واحدة لكل تصادم',
    es: 'Contando los choques contra la pared derecha en el mismo tiempo — un bloque por choque',
    fr: 'On compte les chocs sur la paroi de droite pendant le même temps — un bloc par choc',
    hi: 'उसी समय में दाईं दीवार पर टक्करें गिनी जा रही हैं — हर टक्कर पर एक खाना',
    id: 'Menghitung tumbukan pada dinding kanan selama waktu yang sama — satu blok per tumbukan',
    pt: 'Contando os choques na parede direita no mesmo tempo — um bloco por choque',
  },
  'caption.hold': {
    ko: '한 칸 높이 {k}배, 칸 수 {k}배 — 오른쪽 압력 막대는 {k}×{k}배 높이다',
    en: 'Each block ×{k} taller, ×{k} as many blocks — the right pressure bar is ×{k}×{k} as tall',
    ja: '1段の高さが ×{k}、段の数が ×{k} — 右の圧力の棒の高さは ×{k}×{k}',
    zh: '每格高度 ×{k}，格数 ×{k} — 右边的压强柱条高度 ×{k}×{k}',
    ar: 'كل خانة أطول ×{k}، وعدد الخانات ×{k} — عمود الضغط الأيمن أطول ×{k}×{k}',
    es: 'Cada bloque ×{k} más alto y el número de bloques ×{k} — la barra de presión de la derecha es ×{k}×{k} más alta',
    fr: 'Chaque bloc ×{k} plus haut, le nombre de blocs ×{k} — la barre de pression de droite est ×{k}×{k} plus haute',
    hi: 'हर खाना ×{k} ऊँचा, खानों की संख्या ×{k} — दाईं दाब पट्टी ×{k}×{k} ऊँची है',
    id: 'Tiap blok ×{k} lebih tinggi, jumlah blok ×{k} — batang tekanan kanan ×{k}×{k} lebih tinggi',
    pt: 'Cada bloco ×{k} mais alto, número de blocos ×{k} — a barra de pressão da direita é ×{k}×{k} mais alta',
  },
  'caption.clear': {
    ko: '다시 센다',
    en: 'Counting again',
    ja: 'もう一度数える',
    zh: '重新计数',
    ar: 'العدّ من جديد',
    es: 'Contando de nuevo',
    fr: 'On recompte',
    hi: 'फिर से गिनती',
    id: 'Menghitung lagi',
    pt: 'Contando de novo',
  },
} satisfies Record<string, LocalizedText>);

export type PressureFromCollisionsMessageKey = keyof typeof pressureFromCollisionsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PressureFromCollisionsMessageKey): LocalizedText => pressureFromCollisionsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PressureFromCollisionsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 세는 동안(초). **기본 상수에서 분자가 왼쪽 상자를 한 번 오가는 시간**(2 × 1.6 / 0.8)과 같다 —
 * 그래서 왼쪽 상자의 분자는 저마다 정확히 한 번, 오른쪽은 k 번 벽에 닿는다. 상자 폭이나
 * 속력을 바꾸면 이 길이도 함께 맞춰야 횟수가 딱 떨어진다 (NOTES (b)).
 */
const COUNT_S = 4;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pressureFromCollisionsSchema: BundleSchema = {
  id: PRESSURE_FROM_COLLISIONS_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 분자가 움직이고, 세기가 서고, 횟수가 쌓이고, 막대가 선다.
  parameters: [],

  stages: [
    {
      id: 'two-boxes',
      label: text('label.stage'),
      constants: {
        mass: MOLECULE_MASS,
        speed: MOLECULE_SPEED,
        speedFactor: SPEED_FACTOR,
        molecules: MOLECULE_COUNT,
        seed: MOLECULE_SEED,
        verticalRateMin: VERTICAL_RATE_MIN,
        verticalRateMax: VERTICAL_RATE_MAX,
        boxWidth: BOX_WIDTH,
        boxHeight: BOX_HEIGHT,
        arrowPerMomentum: ARROW_PER_MOMENTUM,
        blockPerMomentum: BLOCK_PER_MOMENTUM,
        flashSeconds: FLASH_SECONDS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'boxes', label: text('label.view'), default: true }],

  // 가로로 긴 배치 — 상자 둘 + 막대 둘. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다.
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 보기 → 한 번의 세기 → 세기 → 결과 → 비우기.
   * 분자는 단계와 무관하게 늘 움직인다(시각의 닫힌 식). 세는 단계는 `linear` 다 —
   * 눈금과 칸은 진행도가 아니라 실제 부딪힌 시각으로 쌓이므로 이징이 끼면 캡션과 어긋난다.
   */
  timeline: {
    phases: [
      { id: 'watch', duration: 2.6, caption: key('caption.watch') },
      { id: 'hit', duration: 2.8, caption: key('caption.hit') },
      { id: 'count', duration: COUNT_S, caption: key('caption.count') },
      { id: 'hold', duration: 3.6, caption: key('caption.hold') },
      { id: 'clear', duration: 1.0, caption: key('caption.clear') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 분자가 벽을 오가는 중에 연다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙의 진술은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 14,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 배수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다(장부 G133 우회).
    vars: { k: 'k' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **한 칸 높이와 칸 수**라,
   * 칸 경계선이 그 눈금 노릇을 한다.
   */

  messages: pressureFromCollisionsMessages,
};
