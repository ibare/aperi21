// ========================================================================
// position-time-graph — 선언
// ========================================================================
// 질문: 그래프의 선이 가파르다는 것은 무엇이 어떻다는 뜻일까.
//
// 더 빨리 오르는 구슬일수록 위치-시간 그래프에 더 가파른 선을 남긴다. 왼쪽 통로의
// 세로와 오른쪽 그래프의 세로축이 **같은 눈금**이라, 구슬이 있는 높이와 펜이 있는
// 높이가 화면에서 늘 같은 줄에 놓인다.
//
// 값은 모두 원본(tasks/piece-lab/position-time-graph/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:position-time-graph` 와 문자 그대로 일치한다 (C4). */
export const POSITION_TIME_GRAPH_ID = 'position-time-graph';

// ------------------------------------------------------------------------
// 시간표 — 한 판(주행 · 유지 · 지우기)을 둘 돌면 한 바퀴
// ------------------------------------------------------------------------

/** 장면이 옅은 데서 살아나는 시간(초). 원본의 `tr < 0.35` 페이드 인이다. */
export const APPEAR = 0.35;
/** 구슬이 오르며 선이 그려지는 시간(초). 페이드 인은 이 안에 든다. */
export const RUN = 6;
/** 다 그린 그래프를 그대로 두는 시간(초). */
export const HOLD = 2;
/** 지우는 시간(초). */
export const FADE = 0.6;
/** 한 판의 길이(초) = 8.6. */
export const ROUND_SPAN = RUN + HOLD + FADE;
/** 한 바퀴(초) = 17.2. 두 판이 한 바퀴다 — 둘째 판에서 빠르기를 맞바꾼다. */
export const CYCLE = ROUND_SPAN * 2;
/** 도착한 순간 이미 이만큼 흘러 있다(초). */
export const START_AT = 2.4;

/** 두 빠르기(통로 높이 비율 / 초). 판이 바뀌면 둘을 서로 맞바꾼다. */
export const V_SLOW = 0.083;
export const V_FAST = 0.152;
/** 빠르기 손잡이가 움직이는 범위. */
export const V_RANGE: readonly [number, number] = [0.04, 0.2];

/** 자취의 표본 간격(초). 끝점은 그릴 때 늘 덧붙인다. */
export const SAMPLE = 0.05;

/** 판(0 · 1)의 단계 이름. scene 이 `at('fade-1')` 처럼 부른다. */
export function phaseId(kind: 'appear' | 'run' | 'hold' | 'fade', round: number): string {
  return `${kind}-${round + 1}`;
}

function roundPhases(round: number, caption: string): TimelinePhase[] {
  return [
    { id: phaseId('appear', round), duration: APPEAR, caption },
    { id: phaseId('run', round), duration: RUN - APPEAR, caption },
    { id: phaseId('hold', round), duration: HOLD, caption },
    { id: phaseId('fade', round), duration: FADE, caption },
  ];
}

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const positionTimeGraphMessages = Object.freeze({
  'label.title': {
    ko: '위치-시간 그래프',
    en: 'Position-time graph',
    ja: '位置-時間グラフ',
    zh: '位置-时间图像',
    ar: 'التمثيل البياني للموضع والزمن',
    es: 'Gráfica posición-tiempo',
    fr: 'Graphique position-temps',
    hi: 'स्थिति-समय ग्राफ़',
    id: 'Grafik posisi-waktu',
    pt: 'Gráfico posição-tempo',
  },
  'label.operation': {
    ko: '빨리 오를수록 남기는 선이 가파르다',
    en: 'The faster it rises, the steeper the line it leaves',
    ja: '速く上がるほど、残す線は急になる',
    zh: '上升得越快，留下的线就越陡',
    ar: 'كلما ارتفع أسرع، كان الخط الذي يتركه أشد انحدارًا',
    es: 'Cuanto más rápido sube, más empinada es la línea que deja',
    fr: 'Plus il monte vite, plus la ligne qu’il laisse est raide',
    hi: 'जितनी तेज़ी से ऊपर चढ़े, छोड़ी गई रेखा उतनी ही खड़ी',
    id: 'Makin cepat naik, makin curam garis yang ditinggalkannya',
    pt: 'Quanto mais rápido sobe, mais íngreme é a linha que deixa',
  },
  'label.stage': {
    ko: '오르는 두 길',
    en: 'Two rising lanes',
    ja: '上っていく二つのレーン',
    zh: '两条上升的通道',
    ar: 'مساران صاعدان',
    es: 'Dos carriles que suben',
    fr: 'Deux couloirs qui montent',
    hi: 'ऊपर चढ़ती दो लेन',
    id: 'Dua lajur naik',
    pt: 'Duas faixas que sobem',
  },
  'label.view': {
    ko: '통로와 그래프',
    en: 'Lanes and graph',
    ja: 'レーンとグラフ',
    zh: '通道与图像',
    ar: 'المساران والتمثيل البياني',
    es: 'Carriles y gráfica',
    fr: 'Couloirs et graphique',
    hi: 'लेन और ग्राफ़',
    id: 'Lajur dan grafik',
    pt: 'Faixas e gráfico',
  },

  /** 세로축 이름. 통로와 그래프가 공유하는 눈금이라 통로 머리에 한 번만 쓴다. */
  'label.height': {
    ko: '높이',
    en: 'height',
    ja: '高さ',
    zh: '高度',
    ar: 'الارتفاع',
    es: 'altura',
    fr: 'hauteur',
    hi: 'ऊँचाई',
    id: 'ketinggian',
    pt: 'altura',
  },
  /** 가로축 이름. */
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

  /** 손잡이 이름. 원본은 캔버스 밖 HTML 라벨이었다. */
  'label.speedA': {
    ko: '왼쪽 구슬 빠르기',
    en: 'Left bead speed',
    ja: '左の玉の速さ',
    zh: '左边珠子的速率',
    ar: 'سرعة الخرزة اليسرى',
    es: 'Rapidez de la cuenta izquierda',
    fr: 'Vitesse de la perle de gauche',
    hi: 'बाएँ मनके की चाल',
    id: 'Kelajuan manik kiri',
    pt: 'Velocidade da conta da esquerda',
  },
  'label.speedB': {
    ko: '오른쪽 구슬 빠르기',
    en: 'Right bead speed',
    ja: '右の玉の速さ',
    zh: '右边珠子的速率',
    ar: 'سرعة الخرزة اليمنى',
    es: 'Rapidez de la cuenta derecha',
    fr: 'Vitesse de la perle de droite',
    hi: 'दाएँ मनके की चाल',
    id: 'Kelajuan manik kanan',
    pt: 'Velocidade da conta da direita',
  },

  'caption.round1': {
    ko: '더 빨리 오르는 구슬일수록 남기는 선이 더 가파르다.',
    en: 'The faster a bead rises, the steeper the line it leaves.',
    ja: '速く上がる玉ほど、残す線は急になる。',
    zh: '珠子上升得越快，留下的线就越陡。',
    ar: 'كلما ارتفعت الخرزة أسرع، كان الخط الذي تتركه أشد انحدارًا.',
    es: 'Cuanto más rápido sube una cuenta, más empinada es la línea que deja.',
    fr: 'Plus une perle monte vite, plus la ligne qu’elle laisse est raide.',
    hi: 'मनका जितनी तेज़ी से चढ़ता है, उसकी छोड़ी रेखा उतनी ही खड़ी होती है।',
    id: 'Makin cepat sebuah manik naik, makin curam garis yang ditinggalkannya.',
    pt: 'Quanto mais rápido uma conta sobe, mais íngreme é a linha que deixa.',
  },
  'caption.round2': {
    ko: '두 구슬의 빠르기를 맞바꾸자, 가파른 선도 따라 바뀌었다.',
    en: 'Swap the two speeds and the steep line swaps with them.',
    ja: '二つの玉の速さを入れ替えると、急な線も入れ替わる。',
    zh: '两颗珠子的速率一交换，陡的那条线也跟着换了。',
    ar: 'بادِل السرعتين، فيتبادل الخط المنحدر معهما.',
    es: 'Intercambia las dos rapideces y la línea empinada se intercambia con ellas.',
    fr: 'Échangez les deux vitesses et la ligne raide s’échange avec elles.',
    hi: 'दोनों चालें आपस में बदलो, तो खड़ी रेखा भी उनके साथ बदल जाती है।',
    id: 'Tukar kedua kelajuan, dan garis yang curam ikut bertukar.',
    pt: 'Troque as duas velocidades e a linha íngreme troca junto.',
  },
  'caption.manual': {
    ko: '빠르기를 올린 구슬의 선이 더 가파르게 선다.',
    en: 'Raise a bead’s speed and its line stands up steeper.',
    ja: '玉の速さを上げると、その線はより急に立つ。',
    zh: '调高一颗珠子的速率，它的线就立得更陡。',
    ar: 'ارفع سرعة خرزة، فيقف خطها أشد انحدارًا.',
    es: 'Sube la rapidez de una cuenta y su línea se vuelve más empinada.',
    fr: 'Augmentez la vitesse d’une perle et sa ligne se redresse.',
    hi: 'किसी मनके की चाल बढ़ाओ, तो उसकी रेखा और खड़ी हो जाती है।',
    id: 'Naikkan kelajuan sebuah manik, dan garisnya berdiri lebih curam.',
    pt: 'Aumente a velocidade de uma conta e sua linha fica mais íngreme.',
  },
} satisfies Record<string, LocalizedText>);

export type PositionTimeGraphMessageKey = keyof typeof positionTimeGraphMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: PositionTimeGraphMessageKey): LocalizedText {
  return positionTimeGraphMessages[key];
}

/** 캡션 슬롯·단계가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PositionTimeGraphMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const positionTimeGraphSchema: BundleSchema = {
  id: POSITION_TIME_GRAPH_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 빠르기는 손잡이가 state 경로를 직접 쥔다 (`controllers.ts`). 자동 진행이 같은
  // 자리에 값을 쓰므로 손대기 전에는 손잡이가 지금 빠르기를 비춘다.
  parameters: [],

  stages: [{ id: 'main', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 원본 캔버스가 860 × 342 다. 러너가 사방에 여백을 두므로 그만큼 더 잡는다. */
  canvas: { height: 356, minHeight: 320 },

  /**
   * 도착한 순간 이미 2.4 초째다 — 열자마자 선 둘이 서로 다른 기울기로 자라고 있다.
   *
   * 시계(`startAt`)와 상태(`preroll`)를 **둘 다** 앞당긴다. 이 조각은 높이를 빠르기로
   * 적분해 쌓고 자취를 표본으로 남기므로, 시계만 옮기면 화면은 빈 그래프 그대로다.
   */
  startAt: START_AT,
  preroll: START_AT,

  /**
   * 한 바퀴 17.2 초 — 한 판(주행 6 · 유지 2 · 지우기 0.6)을 둘 돌린다. 둘째 판은
   * 두 구슬의 빠르기를 맞바꾼 것이고, 그 맞바꿈이 이 조각의 증명이다. 색은 그대로인데
   * 가파른 선이 반대쪽으로 뒤집힌다 — 가파름은 색이 아니라 빠르기에 붙어 있다.
   *
   * 주행의 첫머리(`appear-*`)에 장면이 옅은 데서 살아난다. `appear` + `run` 이 주행
   * 6 초다.
   */
  timeline: {
    phases: [
      ...roundPhases(0, key('caption.round1')),
      ...roundPhases(1, key('caption.round2')),
    ],
  },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 구슬은 자취와 자국 **위에**, 자국의 점은 선
   * 위에 얹힌다. 층 순서로는 `trace`(19) 가 `trajectory`(20) 아래로 깔려, 굵기 2.6 의
   * 자취가 통로를 가로지르는 금을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 슬롯 하나. 판마다 문구만 갈아 끼운다 — 둘 다 같은 주장의 변주다. 손잡이를 잡은
   * 뒤에는 `cases` 가 셋째 문구를 고른다. 시각이 아니라 **상태**로 갈리는 자리다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [{ when: 'manual', text: key('caption.manual') }],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 눈금 숫자와 격자를 두지 않은 것은 원본의
   * 결정이다 — 두 선을 서로 견주는 데 절대값이 필요 없고, 격자가 있으면 독자가
   * 기울기 대신 칸을 세게 된다.
   */

  messages: positionTimeGraphMessages,
};
