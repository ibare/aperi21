// ========================================================================
// random-walk — 선언
// ========================================================================
// 질문: 제멋대로 걷는 이는 걸음을 많이 걸을수록 처음 자리에서 얼마나 멀어지나.
//
// 한 줄 위 걷는 이 여럿이 걸음마다 동전을 던져 왼쪽이나 오른쪽으로 한 칸씩 간다.
// 걸음 수를 네 배로 늘려도 무리가 흩어진 폭(처음 자리에서의 제곱평균 거리)은 두 배로만
// 는다. 화면에서는 걸음 막대가 네 배로 길어지는 동안 폭 괄호가 두 배로만 벌어진다.
//
// 한 알갱이가 왜 비틀거리나(brownian-motion) · 무리가 번져 고르게 되나(diffusion)는
// 이 조각의 몫이 아니다. 여기서 일어나는 것은 「걸음 수와 멀어진 거리가 같은 비로
// 늘지 않는다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:random-walk` 와 문자 그대로 일치한다 (C4). */
export const RANDOM_WALK_ID = 'random-walk';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이 단위는 한 걸음(한 칸)이다. 월드 가로 1 이 한 칸이다.
// ------------------------------------------------------------------------

/**
 * 동전 던지기를 뽑는 시드. 이 시드에서 30 명의 제곱평균 거리가 100 걸음에 10.007 칸,
 * 400 걸음에 19.980 칸이라 폭 괄호(선언값)에 맞는다 (NOTES (b)). 주기마다 같은 걸음이다.
 */
export const SEED = 134;
/** 걷는 이의 수. 한 사람이 한 줄(레인)을 쓴다. */
export const WALKERS = 30;
/** 첫 멈춤까지의 걸음 수. */
export const STEPS_FIRST = 100;
/** 두 번째 멈춤까지의 걸음 수(처음부터 센 것). */
export const STEPS_SECOND = 400;
/** 첫 멈춤에서 긋는 폭 괄호의 반폭(칸) — 걷는 이의 제곱평균 거리로 선언한 값. */
export const SPREAD_FIRST = 10;
/** 두 번째 멈춤에서 긋는 폭 괄호의 반폭(칸). */
export const SPREAD_SECOND = 20;
/** 걸음 막대 배율(월드 / 걸음). 막대 길이가 걸음 수에 비례한다. */
export const BAR_SCALE = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드. 아래부터 걸음 막대 · 수직선 · 레인 · 폭 괄호.
// ------------------------------------------------------------------------

/** 수직선의 높이(월드) · 가로 끝(칸). */
export const AXIS_Y = 6;
export const AXIS_HALF = 62;
/** 수직선 눈금 간격(칸) · 눈금이 닿는 끝(칸). */
export const TICK_EVERY = 10;
export const TICK_HALF = 60;
/** 첫 레인의 높이 · 레인 간격(월드). */
export const LANE_BASE = 8.5;
export const LANE_GAP = 1.0;
/** 첫 멈춤 · 두 번째 멈춤 폭 괄호의 높이(월드). 두 번째가 위다 — 둘이 함께 보인다. */
export const BRACKET_FIRST_Y = 41;
export const BRACKET_SECOND_Y = 45;
/** 괄호 끝 눈금이 아래로 내려오는 길이(월드). */
export const BRACKET_DROP = 1.4;
/** 걸음 막대 — 시작 자리(칸) · 아래 · 위(월드). */
export const BAR_X0 = -60;
export const BAR_Y0 = -1.2;
export const BAR_Y1 = 1.2;
/** 걸음 막대 이름표 높이(월드). */
export const BAR_LABEL_Y = 2.6;
/** 「처음 자리」 이름표 높이(월드). */
export const ORIGIN_LABEL_Y = 3.9;

/**
 * 프레이밍은 주장의 일부다. 가장 멀리 간 이(48 칸) · 걸음 막대 끝(60 칸) · 두 번째 괄호
 * 이름표 · 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -64, maxX: 64, minY: -7.5, maxY: 48 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const randomWalkMessages = Object.freeze({
  'label.title': {
    ko: '무작위 걸음',
    en: 'Random walk',
    ja: 'ランダムウォーク',
    zh: '随机游走',
    ar: 'المشي العشوائي',
    es: 'Camino aleatorio',
    fr: 'Marche aléatoire',
    hi: 'यादृच्छिक भ्रमण',
    id: 'Langkah acak',
    pt: 'Passeio aleatório',
  },
  'label.operation': {
    ko: '제곱근에 비례하는 이동 거리',
    en: 'Distance that grows as a square root',
    ja: '平方根で増える距離',
    zh: '按平方根增长的距离',
    ar: 'مسافة تنمو كجذر تربيعي',
    es: 'Una distancia que crece como una raíz cuadrada',
    fr: 'Une distance qui croît comme une racine carrée',
    hi: 'वर्गमूल की तरह बढ़ने वाली दूरी',
    id: 'Jarak yang tumbuh seperti akar kuadrat',
    pt: 'Uma distância que cresce como raiz quadrada',
  },
  'label.stage': {
    ko: '동전을 던지며 걷는 사람들',
    en: 'Walkers flipping coins',
    ja: 'コインを投げて歩く人たち',
    zh: '抛硬币行走的人',
    ar: 'مشاة يرمون قطعًا نقدية',
    es: 'Caminantes que lanzan monedas',
    fr: 'Des marcheurs qui tirent à pile ou face',
    hi: 'सिक्का उछालते हुए चलने वाले',
    id: 'Pejalan yang melempar koin',
    pt: 'Caminhantes jogando moedas',
  },
  'label.view': {
    ko: '레인과 걸음 막대',
    en: 'Lanes and step bar',
    ja: 'レーンと歩数の棒',
    zh: '通道与步数柱条',
    ar: 'المسارات وعمود الخطوات',
    es: 'Carriles y barra de pasos',
    fr: 'Couloirs et barre des pas',
    hi: 'लेन और कदम पट्टी',
    id: 'Lajur dan batang langkah',
    pt: 'Faixas e barra de passos',
  },
  'label.origin': {
    ko: '처음 자리',
    en: 'start',
    ja: '出発点',
    zh: '起点',
    ar: 'البداية',
    es: 'inicio',
    fr: 'départ',
    hi: 'आरंभ',
    id: 'awal',
    pt: 'início',
  },
  'label.steps': {
    ko: '{n} 걸음',
    en: '{n} steps',
    ja: '{n} 歩',
    zh: '{n} 步',
    ar: '{n} خطوة',
    es: '{n} pasos',
    fr: '{n} pas',
    hi: '{n} कदम',
    id: '{n} langkah',
    pt: '{n} passos',
  },
  'label.spread': {
    ko: '±{d} 칸',
    en: '±{d} cells',
    ja: '±{d} マス',
    zh: '±{d} 格',
    ar: '±{d} خانة',
    es: '±{d} casillas',
    fr: '±{d} cases',
    hi: '±{d} खाने',
    id: '±{d} petak',
    pt: '±{d} casas',
  },
  'caption.gather': {
    ko: '{w} 사람이 한 줄에 한 사람씩 같은 자리에 선다',
    en: '{w} walkers stand at the same spot, one per lane',
    ja: '{w} 人が一つのレーンに一人ずつ、同じ位置に立つ',
    zh: '{w} 个人站在同一位置，每条通道一人',
    ar: 'يقف {w} من المشاة في الموضع نفسه، واحد في كل مسار',
    es: '{w} caminantes se colocan en el mismo punto, uno por carril',
    fr: '{w} marcheurs se placent au même endroit, un par couloir',
    hi: '{w} चलने वाले एक ही जगह खड़े हैं, हर लेन में एक',
    id: '{w} pejalan berdiri di titik yang sama, satu per lajur',
    pt: '{w} caminhantes ficam no mesmo ponto, um por faixa',
  },
  'caption.walk': {
    ko: '걸음마다 동전을 던져 왼쪽이나 오른쪽으로 한 칸 — 무리가 흩어진다',
    en: 'Each step a coin flip sends each walker one cell left or right — the crowd spreads',
    ja: '一歩ごとにコインを投げ、それぞれが左か右へ1マス — 群れが広がる',
    zh: '每一步抛一次硬币，让每个人向左或向右走一格 — 人群散开',
    ar: 'في كل خطوة ترسل رمية العملة كل ماشٍ خانة واحدة يسارًا أو يمينًا — وتنتشر الجماعة',
    es: 'En cada paso, una moneda manda a cada caminante una casilla a la izquierda o a la derecha — el grupo se dispersa',
    fr: 'À chaque pas, un pile ou face envoie chaque marcheur d’une case à gauche ou à droite — la foule s’étale',
    hi: 'हर कदम पर सिक्का उछालकर हर चलने वाला एक खाना बाएँ या दाएँ जाता है — भीड़ फैलती है',
    id: 'Tiap langkah, lemparan koin membuat tiap pejalan bergeser satu petak ke kiri atau kanan — kerumunan menyebar',
    pt: 'A cada passo, uma moeda manda cada caminhante uma casa para a esquerda ou para a direita — o grupo se espalha',
  },
  'caption.first': {
    ko: '{n1} 걸음 — 흩어진 폭(처음 자리에서의 제곱평균 거리)은 ±{d1} 칸',
    en: '{n1} steps — the spread (root-mean-square distance from the start) is ±{d1} cells',
    ja: '{n1} 歩 — 広がり（出発点からの二乗平均平方根距離）は ±{d1} マス',
    zh: '{n1} 步 — 散开的宽度（离起点的方均根距离）是 ±{d1} 格',
    ar: '{n1} خطوة — الانتشار (جذر متوسط مربع البعد عن البداية) هو ±{d1} خانة',
    es: '{n1} pasos — la dispersión (distancia cuadrática media desde el inicio) es ±{d1} casillas',
    fr: '{n1} pas — l’étalement (distance quadratique moyenne au départ) est de ±{d1} cases',
    hi: '{n1} कदम — फैलाव (आरंभ से वर्ग-माध्य-मूल दूरी) ±{d1} खाने है',
    id: '{n1} langkah — sebaran (jarak akar rata-rata kuadrat dari awal) adalah ±{d1} petak',
    pt: '{n1} passos — o espalhamento (distância quadrática média a partir do início) é ±{d1} casas',
  },
  'caption.more': {
    ko: '같은 규칙으로 계속 걷는다 — 걸음 막대가 길어진다',
    en: 'They keep walking by the same rule — the step bar grows',
    ja: '同じ規則で歩き続ける — 歩数の棒が伸びる',
    zh: '按同样的规则继续走 — 步数柱条变长',
    ar: 'يواصلون المشي بالقاعدة نفسها — ويطول عمود الخطوات',
    es: 'Siguen caminando con la misma regla — la barra de pasos crece',
    fr: 'Ils continuent de marcher selon la même règle — la barre des pas s’allonge',
    hi: 'वे उसी नियम से चलते रहते हैं — कदम पट्टी बढ़ती है',
    id: 'Mereka terus berjalan dengan aturan yang sama — batang langkah memanjang',
    pt: 'Eles seguem caminhando pela mesma regra — a barra de passos cresce',
  },
  'caption.second': {
    ko: '{n2} 걸음 — 흩어진 폭은 ±{d2} 칸. 점선은 {n1} 걸음 때의 폭이고, 막대의 금은 {n1} 걸음마다다',
    en: '{n2} steps — the spread is ±{d2} cells. The dashed bracket is the spread at {n1} steps; the bar is marked every {n1} steps',
    ja: '{n2} 歩 — 広がりは ±{d2} マス。点線の括弧は {n1} 歩のときの広がりで、棒の目盛りは {n1} 歩ごと',
    zh: '{n2} 步 — 散开的宽度是 ±{d2} 格。虚线括号是 {n1} 步时的宽度，柱条每 {n1} 步有一道刻线',
    ar: '{n2} خطوة — الانتشار ±{d2} خانة. القوس المتقطع هو الانتشار عند {n1} خطوة، والعمود مُعلَّم كل {n1} خطوة',
    es: '{n2} pasos — la dispersión es ±{d2} casillas. El corchete discontinuo es la dispersión a los {n1} pasos; la barra tiene una marca cada {n1} pasos',
    fr: '{n2} pas — l’étalement est de ±{d2} cases. Le crochet en pointillés est l’étalement à {n1} pas ; la barre porte une marque tous les {n1} pas',
    hi: '{n2} कदम — फैलाव ±{d2} खाने है। बिंदुदार कोष्ठक {n1} कदम पर का फैलाव है; पट्टी पर हर {n1} कदम पर निशान है',
    id: '{n2} langkah — sebaran ±{d2} petak. Kurung putus-putus adalah sebaran pada {n1} langkah; batang ditandai tiap {n1} langkah',
    pt: '{n2} passos — o espalhamento é ±{d2} casas. O colchete tracejado é o espalhamento aos {n1} passos; a barra tem uma marca a cada {n1} passos',
  },
} satisfies Record<string, LocalizedText>);

export type RandomWalkMessageKey = keyof typeof randomWalkMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RandomWalkMessageKey): LocalizedText => randomWalkMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RandomWalkMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const randomWalkSchema: BundleSchema = {
  id: RANDOM_WALK_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 무리가 걷고, 두 번 멈춰 폭을 재고, 다시 모인다.
  parameters: [],

  stages: [
    {
      id: 'coin-walkers',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        walkers: WALKERS,
        stepsFirst: STEPS_FIRST,
        stepsSecond: STEPS_SECOND,
        spreadFirst: SPREAD_FIRST,
        spreadSecond: SPREAD_SECOND,
        barScale: BAR_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /** 가로 128 · 세로 55.5 월드. 레인을 위아래로 쌓고 막대를 그 아래 둔다 — 같은 가로축이 아니어도 된다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 모임 → 첫 걸음들 → 첫 폭 → 멈춤 → 더 걷기 → 두 번째 폭 → 멈춤 → 사라짐.
   * 걸음 번호는 `walkFirst` · `walkSecond` 의 진행도에 걸음 수(스테이지 상수)를 곱해 얻는다 —
   * 단계 길이는 빠르기, 걸음 수는 얼마나 걷나다.
   */
  timeline: {
    phases: [
      { id: 'gather', duration: 1, ease: 'smooth', caption: key('caption.gather') },
      { id: 'walkFirst', duration: 3.5, caption: key('caption.walk') },
      { id: 'markFirst', duration: 0.7, ease: 'smooth', caption: key('caption.first') },
      { id: 'holdFirst', duration: 2.4, caption: key('caption.first') },
      { id: 'walkSecond', duration: 6, caption: key('caption.more') },
      { id: 'markSecond', duration: 0.7, ease: 'smooth', caption: key('caption.second') },
      { id: 'holdSecond', duration: 4, caption: key('caption.second') },
      { id: 'clear', duration: 0.8, ease: 'smooth', caption: key('caption.second') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 무리가 막 흩어지는 중이다. */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 제곱근 법칙은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { w: 'walkersText', n1: 'stepsFirstText', n2: 'stepsSecondText', d1: 'spreadFirstText', d2: 'spreadSecondText' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 수직선 눈금과 괄호가 준다. */

  messages: randomWalkMessages,
};
