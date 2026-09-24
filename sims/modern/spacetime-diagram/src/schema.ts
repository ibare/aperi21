// ========================================================================
// spacetime-diagram — 선언
// ========================================================================
// 질문: 움직이는 관찰자의 '지금'은 왜 가로선이 아닌가, 그러면 무엇이 달라지나.
//
// 관찰자의 세계선이 빛의 선 쪽으로 기우는 만큼 그의 동시선도 같은 빛의 선 쪽으로
// 기울어, 정지한 쪽에서 한꺼번에 일어난 세 사건이 움직이는 관찰자에게는 차례로 일어난다.
//
// 원본: tasks/piece-lab/spacetime-diagram (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:spacetime-diagram` 와 문자 그대로 일치한다 (C4). */
export const SPACETIME_DIAGRAM_ID = 'spacetime-diagram';

// ------------------------------------------------------------------------
// 확정값 — 원본 index.html 의 상수를 그대로 옮겼다
// ------------------------------------------------------------------------

/** 좌표: x 는 공간, ct 는 시간(빛의 속도 = 1). 화면 세로 절반이 ct 3.6. */
export const CT_HALF = 3.6;

/**
 * 원본 캔버스(860 × 340 px)에서 ct 한 칸이 차지하던 화면 px. 원본은 화면 px 로
 * 고정한 크기(호 반지름 · 기준 점선 길이)를 이것으로 월드 단위로 옮긴다.
 */
export const PX_PER_CT = 340 / 2 / CT_HALF;

/** 원본 캔버스 가로 절반(월드). '관찰자의 지금' 이름표를 선 끝에 붙이는 자리. */
export const X_HALF = 860 / 2 / PX_PER_CT;

/** 정지한 쪽에서 같은 순간(ct = 0)에 일어난 세 사건. */
export const EVENTS: readonly { id: string; x: number }[] = [
  { id: 'left', x: -2.4 },
  { id: 'center', x: 0 },
  { id: 'right', x: 2.4 },
];

/**
 * 자동 진행의 세 장면. 오른쪽 0.60c → 왼쪽 0.60c → 정지 를 돈다.
 * 순서가 곧 시간표 단계의 순서다 — 첫 장면의 '앞 장면' 은 마지막 장면이다.
 */
export const SCENES: readonly { id: 'right' | 'left' | 'rest'; beta: number }[] = [
  { id: 'right', beta: 0.6 },
  { id: 'left', beta: -0.6 },
  { id: 'rest', beta: 0 },
];

/** 조작 모드에서 한 번 훑은 뒤 머무는 시간(초). 훑는 시간은 시간표의 `sweep` 단계를 쓴다. */
export const MANUAL_REST = 1.5;

/** 속도 조작기 범위와 간격 (v/c). */
export const SPEED_RANGE: [number, number] = [-0.8, 0.8];
export const SPEED_STEP = 0.01;

/** 조작한 뒤 현재 속도가 목표 속도로 다가가는 빠르기(1/초). */
export const SPEED_FOLLOW = 5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const spacetimeDiagramMessages = Object.freeze({
  'label.title': {
    ko: '시공간 도표',
    en: 'Spacetime diagram',
    ja: '時空図',
    zh: '时空图',
    ar: 'مخطط الزمكان',
    es: 'Diagrama espaciotemporal',
    fr: 'Diagramme d’espace-temps',
    hi: 'दिक्काल आरेख',
    id: 'Diagram ruang-waktu',
    pt: 'Diagrama de espaço-tempo',
  },
  'label.operation': {
    ko: '세계선과 동시선',
    en: 'Worldline and line of simultaneity',
    ja: '世界線と同時刻線',
    zh: '世界线与同时线',
    ar: 'خط العالم وخط التزامن',
    es: 'Línea de universo y línea de simultaneidad',
    fr: 'Ligne d’univers et ligne de simultanéité',
    hi: 'विश्व रेखा और समकालिकता रेखा',
    id: 'Garis dunia dan garis keserentakan',
    pt: 'Linha de universo e linha de simultaneidade',
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
  /** 눈금 없는 축 약속 — 세로가 시간, 가로가 공간. */
  'label.timeAxis': {
    ko: '시간 ↑',
    en: 'time ↑',
    ja: '時間 ↑',
    zh: '时间 ↑',
    ar: 'الزمن ↑',
    es: 'tiempo ↑',
    fr: 'temps ↑',
    hi: 'समय ↑',
    id: 'waktu ↑',
    pt: 'tempo ↑',
  },
  'label.spaceAxis': {
    ko: '공간 →',
    en: 'space →',
    ja: '空間 →',
    zh: '空间 →',
    ar: 'المكان →',
    es: 'espacio →',
    fr: 'espace →',
    hi: 'दिक् →',
    id: 'ruang →',
    pt: 'espaço →',
  },
  'label.light': {
    ko: '빛',
    en: 'light',
    ja: '光',
    zh: '光',
    ar: 'الضوء',
    es: 'luz',
    fr: 'lumière',
    hi: 'प्रकाश',
    id: 'cahaya',
    pt: 'luz',
  },
  'label.observer': {
    ko: '관찰자',
    en: 'observer',
    ja: '観測者',
    zh: '观察者',
    ar: 'الراصد',
    es: 'observador',
    fr: 'observateur',
    hi: 'प्रेक्षक',
    id: 'pengamat',
    pt: 'observador',
  },
  'label.now': {
    ko: '관찰자의 지금',
    en: "observer's now",
    ja: '観測者の今',
    zh: '观察者的此刻',
    ar: '«الآن» عند الراصد',
    es: 'el ahora del observador',
    fr: 'le maintenant de l’observateur',
    hi: 'प्रेक्षक का अभी',
    id: 'kini pengamat',
    pt: 'o agora do observador',
  },
  'label.order1': {
    ko: '1번째',
    en: '1st',
    ja: '1番目',
    zh: '第1个',
    ar: 'الأول',
    es: '1.º',
    fr: '1er',
    hi: '1ला',
    id: 'ke-1',
    pt: '1º',
  },
  'label.order2': {
    ko: '2번째',
    en: '2nd',
    ja: '2番目',
    zh: '第2个',
    ar: 'الثاني',
    es: '2.º',
    fr: '2e',
    hi: '2रा',
    id: 'ke-2',
    pt: '2º',
  },
  'label.order3': {
    ko: '3번째',
    en: '3rd',
    ja: '3番目',
    zh: '第3个',
    ar: 'الثالث',
    es: '3.º',
    fr: '3e',
    hi: '3रा',
    id: 'ke-3',
    pt: '3º',
  },
  'label.speed': {
    ko: '관찰자 속도',
    en: 'Observer speed',
    ja: '観測者の速さ',
    zh: '观察者的速度',
    ar: 'سرعة الراصد',
    es: 'Rapidez del observador',
    fr: 'Vitesse de l’observateur',
    hi: 'प्रेक्षक की चाल',
    id: 'Kelajuan pengamat',
    pt: 'Velocidade do observador',
  },
  'caption.changing': {
    ko: '속도가 바뀌는 중 — 세계선이 기우는 만큼 동시선도 같은 쪽으로 기운다',
    en: 'Speed changing — the line of simultaneity tilts as far as the worldline does',
    ja: '速さが変わっている — 世界線が傾くのと同じだけ、同時刻線も傾く',
    zh: '速度正在变化——世界线倾斜多少，同时线也倾斜多少',
    ar: 'السرعة تتغير — يميل خط التزامن بقدر ما يميل خط العالم',
    es: 'La rapidez cambia — la línea de simultaneidad se inclina tanto como la línea de universo',
    fr: 'La vitesse change — la ligne de simultanéité s’incline autant que la ligne d’univers',
    hi: 'चाल बदल रही है — विश्व रेखा जितनी झुकती है, समकालिकता रेखा भी उतनी ही झुकती है',
    id: 'Kelajuan berubah — garis keserentakan miring sejauh garis dunia miring',
    pt: 'A velocidade muda — a linha de simultaneidade se inclina tanto quanto a linha de universo',
  },
  'caption.rest': {
    ko: '정지한 관찰자 — 세 사건이 한꺼번에 ‘지금’에 닿는다',
    en: "Observer at rest — all three events reach 'now' at once",
    ja: '静止した観測者 — 三つの事象がいっせいに「今」に届く',
    zh: '静止的观察者——三个事件同时到达“现在”',
    ar: 'راصد ساكن — تبلغ الأحداث الثلاثة «الآن» معًا',
    es: 'Observador en reposo — los tres sucesos llegan a la vez al «ahora»',
    fr: 'Observateur au repos — les trois événements atteignent « maintenant » en même temps',
    hi: 'स्थिर प्रेक्षक — तीनों घटनाएँ एक साथ ‘अभी’ तक पहुँचती हैं',
    id: 'Pengamat diam — ketiga peristiwa mencapai ‘kini’ bersamaan',
    pt: 'Observador em repouso — os três eventos chegam ao “agora” ao mesmo tempo',
  },
  'caption.right': {
    ko: '오른쪽으로 {v}c — 동시선이 기울어 오른쪽 사건부터 차례로 ‘지금’에 닿는다',
    en: "Moving right at {v}c — the tilted line reaches the right event first, then the others in turn",
    ja: '右へ {v}c — 傾いた線はまず右の事象に届き、それから残りに順に届く',
    zh: '以 {v}c 向右运动——倾斜的线先到达右边的事件，再依次到达其余事件',
    ar: 'متحرك إلى اليمين بسرعة {v}c — يبلغ الخط المائل الحدث الأيمن أولًا، ثم الباقي تباعًا',
    es: 'Moviéndose a la derecha a {v}c — la línea inclinada alcanza primero el suceso de la derecha y luego los demás, por turno',
    fr: 'En mouvement vers la droite à {v}c — la ligne inclinée atteint d’abord l’événement de droite, puis les autres tour à tour',
    hi: 'दाईं ओर {v}c से गतिमान — झुकी रेखा पहले दाईं घटना तक पहुँचती है, फिर बारी-बारी से बाकी तक',
    id: 'Bergerak ke kanan pada {v}c — garis miring mencapai peristiwa kanan lebih dulu, lalu yang lain bergiliran',
    pt: 'Movendo-se para a direita a {v}c — a linha inclinada alcança primeiro o evento da direita e depois os outros, em sequência',
  },
  'caption.left': {
    ko: '왼쪽으로 {v}c — 동시선이 기울어 왼쪽 사건부터 차례로 ‘지금’에 닿는다',
    en: "Moving left at {v}c — the tilted line reaches the left event first, then the others in turn",
    ja: '左へ {v}c — 傾いた線はまず左の事象に届き、それから残りに順に届く',
    zh: '以 {v}c 向左运动——倾斜的线先到达左边的事件，再依次到达其余事件',
    ar: 'متحرك إلى اليسار بسرعة {v}c — يبلغ الخط المائل الحدث الأيسر أولًا، ثم الباقي تباعًا',
    es: 'Moviéndose a la izquierda a {v}c — la línea inclinada alcanza primero el suceso de la izquierda y luego los demás, por turno',
    fr: 'En mouvement vers la gauche à {v}c — la ligne inclinée atteint d’abord l’événement de gauche, puis les autres tour à tour',
    hi: 'बाईं ओर {v}c से गतिमान — झुकी रेखा पहले बाईं घटना तक पहुँचती है, फिर बारी-बारी से बाकी तक',
    id: 'Bergerak ke kiri pada {v}c — garis miring mencapai peristiwa kiri lebih dulu, lalu yang lain bergiliran',
    pt: 'Movendo-se para a esquerda a {v}c — a linha inclinada alcança primeiro o evento da esquerda e depois os outros, em sequência',
  },
} satisfies Record<string, LocalizedText>);

export type SpacetimeDiagramMessageKey = keyof typeof spacetimeDiagramMessages;

export const text = (key: SpacetimeDiagramMessageKey): LocalizedText => spacetimeDiagramMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SpacetimeDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 한 장면 7 초 — 원본의 `[0,1.5) 속도 바꾸기, [1.5,1.8) 지금을 아래로, [1.8,6.3) 훑기,
 * [6.3,7) 머물기` 를 단계로 옮겼다.
 *
 * 속도 바꾸기는 둘로 나눈다. 원본은 그 1.5 초 동안 속도를 바꾸면서 **앞 0.5 초에** 지금
 * 선을 원점으로 내린다. `lower`(0.5) + `turn`(1.0) 으로 나누고, 속도는 두 단계에 걸친
 * 구간(`span`)으로 읽는다.
 */
function scenePhases(id: string, caption: SpacetimeDiagramMessageKey): TimelinePhase[] {
  return [
    { id: `${id}-lower`, duration: 0.5, ease: 'smooth', caption: key('caption.changing') },
    { id: `${id}-turn`, duration: 1.0, caption: key('caption.changing') },
    { id: `${id}-drop`, duration: 0.3, ease: 'smooth', caption: key(caption) },
    { id: `${id}-sweep`, duration: 4.5, caption: key(caption) },
    { id: `${id}-hold`, duration: 0.7, caption: key(caption) },
  ];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const spacetimeDiagramSchema: BundleSchema = {
  id: SPACETIME_DIAGRAM_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 340 px + 캡션 · 조작기 줄. 원본은 그 줄을 캔버스 아래 DOM 에 두었다.
   * 원점을 10 px 올려 도표(ct ±3.6)를 위 약 344 px 에 담고, 아래 56 px 는 선을 잘라
   * 캡션 · 조작기 줄로 비운다. 가로가 배율을 정한다(원본 가로 폭 그대로).
   */
  canvas: { height: 400, minHeight: 400 },
  camera: { screenYBias: -10 },

  /** 도착한 순간 오른쪽 0.60c 장면에서 이미 훑는 중이다 (원본 `OFFSET`). */
  startAt: 3.5,

  /** 겹침 순서가 원본의 그리는 순서여야 한다 — 빈 사건 원이 그 아래 선들을 가린다. */
  drawOrder: 'scene',

  timeline: {
    phases: [
      ...scenePhases('right', 'caption.right'),
      ...scenePhases('left', 'caption.left'),
      ...scenePhases('rest', 'caption.rest'),
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -4] },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'ink', emphasis: 'strong' },
    // 조작 모드에서는 시간표가 아니라 상태가 문안을 고른다.
    cases: [
      { when: 'manualCaption.changing', text: key('caption.changing') },
      { when: 'manualCaption.rest', text: key('caption.rest') },
      { when: 'manualCaption.right', text: key('caption.right') },
      { when: 'manualCaption.left', text: key('caption.left') },
    ],
    vars: { v: 'speedText' },
  },

  messages: spacetimeDiagramMessages,
};
