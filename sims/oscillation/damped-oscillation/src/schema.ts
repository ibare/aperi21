// ========================================================================
// damped-oscillation — 선언
// ========================================================================
// 질문: 에너지가 빠져나가는 진동은 어떻게 잦아드는가.
//
// 천장에 매단 추가 액체 통 안에서 오르내린다. 추가 액체를 밀어낼 때마다 에너지가
// 빠져나가 흔들림이 작아진다. 추 옆에서 펜이 오른쪽으로 일정하게 나아가며 추의
// 높이를 적으면 잦아드는 물결이 펼쳐진다. 펜은 마루마다 축에서 마루까지 막대를
// 남기고, 이웃한 두 마루 사이에 「뒤 마루 ÷ 앞 마루」 를 적는다 — 그 값이 매번
// 같다. 줄어드는 **양**은 작아져도 줄어드는 **비율**은 같고, 마루 사이 간격(주기)도
// 처음과 같다. 다 적고 나면 마루를 잇는 매끄러운 포락선이 그려진다.
//
// 부족 · 임계 · 과도 감쇠(damping-regimes) · 공명 봉우리의 날카로움(quality-factor) ·
// 빠져나간 에너지의 행방(energy-dissipation)은 이웃 조각의 몫이다. 이 조각은
// 「진폭이 회마다 같은 비율로 줄어든다, 주기는 그대로」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:damped-oscillation` 와 문자 그대로 일치한다 (C4). */
export const DAMPED_OSCILLATION_ID = 'damped-oscillation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 추의 질량(kg). */
export const MASS = 0.5;
/** 용수철 상수(N/m). */
export const STIFFNESS = 5;
/**
 * 감쇠 계수 b(kg/s). 액체가 추에 거는 저항력 = −b · 속도. 이 값에서 한 주기마다
 * 마루 높이가 e^(−b·T/2m) ≈ 0.70 배가 된다 — 다섯 주기면 처음의 1/6 쯤으로, 잦아드는
 * 것은 뚜렷하고 마지막 마루도 아직 눈에 보인다.
 */
export const DAMPING = 0.18;
/** 진폭(m) — 처음 당겨 놓은 거리. 위 끝에서 가만히 놓는다. */
export const AMPLITUDE = 1;

/**
 * 감쇠 진동의 한 주기(초) = 2π / √(k/m − (b/2m)²). 시간표 단계 길이의 기본값이 이것에서
 * 나온다. 감쇠가 약해 감쇠 없는 주기와 0.2 % 도 다르지 않다.
 */
export const PERIOD = (2 * Math.PI) / Math.sqrt(STIFFNESS / MASS - (DAMPING / (2 * MASS)) ** 2);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 추와 액체 통은 왼쪽, 기록지는 오른쪽.
// ------------------------------------------------------------------------

/** 추가 오르내리는 세로줄의 x. 평형점은 y = 0 이다. */
export const MASS_X = 0;
/** 추 크기 [가로, 세로](m). */
export const MASS_SIZE: readonly [number, number] = [0.46, 0.46];
/** 천장 높이와 천장 판의 반폭. */
export const CEILING_Y = 1.95;
export const CEILING_HALF = 0.5;
/** 천장 위 빗금 띠의 두께. */
export const CEILING_DEPTH = 0.14;
/** 용수철 감은 수. */
export const SPRING_COILS = 9;

/** 액체 통의 안쪽 반폭 · 바닥 · 윗테 높이와 액체 높이. 추의 위 끝(A + 반높이)이 늘 잠겨 있다. */
export const TANK_HALF = 0.42;
export const TANK_BOTTOM = -1.3;
export const TANK_TOP = 1.62;
export const LIQUID_LEVEL = 1.45;

/** 펜이 적기 시작하는 자리(기록지 왼쪽 끝)와 기록지 길이 — 다섯 주기를 담는다. */
export const PAPER_START = 0.95;
export const PAPER_LENGTH = 7.6;
/** 시간축(평형선)의 오른쪽 끝 — 기록지보다 조금 더 간다. */
export const AXIS_END = PAPER_START + PAPER_LENGTH + 0.3;

/** 마루 비율을 적는 자릿수. 0.70 을 0.7 로 줄이지 않는다 (S-piece 유효숫자). */
export const RATIO_DIGITS = 2;

/**
 * 프레이밍은 주장의 일부다. 가로는 천장 판 왼쪽 끝부터 시간축 이름표까지, 세로는 액체 통
 * 바닥과 천장 빗금 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.75, maxX: 9.2, minY: -1.45, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값은 주기에서 나온다
// ------------------------------------------------------------------------

/** 쓰는 다섯 단계가 한 주기씩이다. 단계 하나에 마루 하나가 새로 적힌다. */
export const WRITE = PERIOD;
/** 다 적은 기록 위로 포락선이 그려지고 머무는 동안. */
export const ENVELOPE = 1.3 * PERIOD;
/** 기록이 흐려지며 추를 처음 자리로 다시 당기는 동안. */
export const RESET = 0.7 * PERIOD;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dampedOscillationMessages = Object.freeze({
  'label.title': {
    ko: '감쇠 진동',
    en: 'Damped oscillation',
    ja: '減衰振動',
    zh: '阻尼振动',
    ar: 'التذبذب المُخمَّد',
    es: 'Oscilación amortiguada',
    fr: 'Oscillation amortie',
    hi: 'अवमंदित दोलन',
    id: 'Osilasi teredam',
    pt: 'Oscilação amortecida',
  },
  'label.operation': {
    ko: '에너지가 빠져나가는 진동',
    en: 'An oscillation that loses energy',
    ja: 'エネルギーを失っていく振動',
    zh: '不断损失能量的振动',
    ar: 'تذبذب يفقد الطاقة',
    es: 'Una oscilación que pierde energía',
    fr: 'Une oscillation qui perd de l’énergie',
    hi: 'ऊर्जा खोता दोलन',
    id: 'Osilasi yang kehilangan energi',
    pt: 'Uma oscilação que perde energia',
  },
  'label.stage': {
    ko: '액체 속 용수철',
    en: 'Spring in liquid',
    ja: '液体の中のばね',
    zh: '液体中的弹簧',
    ar: 'نابض في سائل',
    es: 'Resorte en un líquido',
    fr: 'Ressort dans un liquide',
    hi: 'द्रव में स्प्रिंग',
    id: 'Pegas dalam cairan',
    pt: 'Mola em um líquido',
  },
  'label.view': {
    ko: '추와 기록지',
    en: 'Mass and chart',
    ja: 'おもりと記録紙',
    zh: '重物与记录纸',
    ar: 'الثقل وورقة التسجيل',
    es: 'Masa y registro',
    fr: 'Masse et enregistrement',
    hi: 'भार और अभिलेख-पत्र',
    id: 'Beban dan kertas rekam',
    pt: 'Massa e registro',
  },
  /** 시간축 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.time': {
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
  /** 이웃한 두 마루의 비. 곱셈 기호 + 값이라 표식이다 (C1 판정 3). */
  'label.ratio': {
    ko: '×{r}',
    en: '×{r}',
    ja: '×{r}',
    zh: '×{r}',
    ar: '×{r}',
    es: '×{r}',
    fr: '×{r}',
    hi: '×{r}',
    id: '×{r}',
    pt: '×{r}',
  },
  'caption.drain': {
    ko: '추가 액체를 밀어낼 때마다 에너지가 빠져나가, 한 번 오갈 때마다 흔들림이 작아진다',
    en: 'Every swing pushes through the liquid and loses energy — each round trip is smaller than the last',
    ja: '揺れるたびに液体を押しのけてエネルギーを失う — 往復するごとに前より小さくなる',
    zh: '每次摆动都要推开液体而损失能量 — 每一次往返都比上一次小',
    ar: 'كل تأرجح يشقّ طريقه عبر السائل ويفقد طاقة — كل ذهاب وإياب أصغر من سابقه',
    es: 'Cada vaivén empuja el líquido y pierde energía — cada ida y vuelta es menor que la anterior',
    fr: 'Chaque oscillation pousse le liquide et perd de l’énergie — chaque aller-retour est plus petit que le précédent',
    hi: 'हर झूला द्रव को धकेलते हुए ऊर्जा खोता है — हर आना-जाना पिछले से छोटा होता है',
    id: 'Setiap ayunan mendorong cairan dan kehilangan energi — tiap bolak-balik lebih kecil dari sebelumnya',
    pt: 'Cada oscilação empurra o líquido e perde energia — cada ida e volta é menor que a anterior',
  },
  'caption.ratio': {
    ko: '마루는 매번 바로 앞 마루의 같은 몫이다 — 줄어드는 양은 작아져도 비율은 같다',
    en: 'Each crest is the same fraction of the one before — the drop gets smaller, the ratio stays the same',
    ja: 'どの山も直前の山の同じ割合だ — 減る量は小さくなっても、比は変わらない',
    zh: '每个波峰都是前一个波峰的同一比例 — 减少的量变小了，比值却不变',
    ar: 'كل قمة هي الكسر نفسه من القمة التي قبلها — يصغر النقصان وتبقى النسبة كما هي',
    es: 'Cada cresta es la misma fracción de la anterior — la caída se achica, la razón se mantiene',
    fr: 'Chaque crête est la même fraction de la précédente — la baisse diminue, le rapport reste le même',
    hi: 'हर शिखर पिछले शिखर का वही अंश है — गिरावट छोटी होती जाती है, अनुपात वही रहता है',
    id: 'Setiap puncak adalah pecahan yang sama dari puncak sebelumnya — penurunannya mengecil, rasionya tetap',
    pt: 'Cada crista é a mesma fração da anterior — a queda diminui, a razão continua a mesma',
  },
  'caption.envelope': {
    ko: '마루를 이으면 매끄럽게 잦아드는 곡선이 된다 — 마루 사이 간격은 처음과 같다',
    en: 'Joining the crests gives a smoothly fading curve — and the crests stay evenly spaced',
    ja: '山を結ぶと、なめらかに小さくなる曲線になる — 山どうしの間隔は変わらない',
    zh: '把波峰连起来，就是一条平滑衰减的曲线 — 波峰之间的间隔始终相等',
    ar: 'وصل القمم يعطي منحنى يخفت بسلاسة — وتبقى القمم متباعدة بالتساوي',
    es: 'Al unir las crestas sale una curva que se apaga suavemente — y las crestas siguen igual de espaciadas',
    fr: 'En reliant les crêtes, on obtient une courbe qui s’éteint en douceur — et les crêtes restent régulièrement espacées',
    hi: 'शिखरों को जोड़ने पर धीरे-धीरे मंद पड़ता एक चिकना वक्र बनता है — और शिखरों के बीच की दूरी बराबर रहती है',
    id: 'Menghubungkan puncak-puncak menghasilkan kurva yang meluruh mulus — dan jarak antarpuncak tetap sama',
    pt: 'Unindo as cristas surge uma curva que se apaga suavemente — e as cristas continuam igualmente espaçadas',
  },
  'caption.reset': {
    ko: '추를 다시 당겨 놓는다',
    en: 'Pull the mass back and let go again',
    ja: 'おもりをもう一度引いて放す',
    zh: '把重物再拉开后松手',
    ar: 'اسحب الثقل من جديد ثم أفلته',
    es: 'Tira de la masa otra vez y suéltala',
    fr: 'Tirez de nouveau la masse et relâchez-la',
    hi: 'भार को फिर खींचकर छोड़ें',
    id: 'Tarik beban lagi lalu lepaskan',
    pt: 'Puxe a massa de novo e solte',
  },
} satisfies Record<string, LocalizedText>);

export type DampedOscillationMessageKey = keyof typeof dampedOscillationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DampedOscillationMessageKey): LocalizedText => dampedOscillationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DampedOscillationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dampedOscillationSchema: BundleSchema = {
  id: DAMPED_OSCILLATION_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 추가 잦아들며 오르내리고, 펜이 물결을 펼친다.
  parameters: [],

  stages: [
    {
      id: 'spring-in-liquid',
      label: text('label.stage'),
      constants: { mass: MASS, stiffness: STIFFNESS, damping: DAMPING, amplitude: AMPLITUDE },
    },
  ],

  environments: [],

  views: [{ id: 'chart', label: text('label.view'), default: true }],

  /**
   * 가로로 다섯 주기(7.6 m)를 펼쳐야 하고 세로는 진폭 둘과 천장뿐이다. 세로를 더 주면 가로가
   * 먼저 차서 물결만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 마루 막대는 곡선 **아래** 로 깔려 곡선이 그 끝을 지나가야 하고,
   * 액체는 추 **위** 에 반투명으로 덮여야 추가 잠긴 것으로 읽히며, 펜 점은 곡선 끝 위에 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 바퀴 = 다섯 주기 쓰기 → 포락선 → 다시 당김.
   *
   * 펜의 자리는 `start('write-1')` ~ `end('write-5')` 구간의 진행도로, 포락선은
   * `at('envelope')` 으로, 흐려짐과 다시 당김은 `at('reset')` 으로 읽는다. 단계 경계를
   * 코드에 두지 않는다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'write-1', duration: WRITE, caption: key('caption.drain') },
      { id: 'write-2', duration: WRITE, caption: key('caption.drain') },
      { id: 'write-3', duration: WRITE, caption: key('caption.ratio') },
      { id: 'write-4', duration: WRITE, caption: key('caption.ratio') },
      { id: 'write-5', duration: WRITE, caption: key('caption.ratio') },
      { id: 'envelope', duration: ENVELOPE, ease: 'smooth', caption: key('caption.envelope') },
      { id: 'reset', duration: RESET, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 추가 첫 골을 지나 올라오는 중이고 첫 마루 막대와 물결
   * 반 개가 적혀 있는 자리에서 연다. 0 이면 빈 기록지가 먼저 보인다.
   */
  startAt: 0.6 * PERIOD,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 이 그림이 재라고 하는 것은 미터가 아니라 마루 높이의
   * **비** 와 마루 사이 **간격이 같음** 이다. 격자를 깔면 「몇 미터인가」 가 끼어든다.
   */

  messages: dampedOscillationMessages,
};
