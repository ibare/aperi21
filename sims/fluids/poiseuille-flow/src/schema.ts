// ========================================================================
// poiseuille-flow — 선언
// ========================================================================
// 질문: 관을 두 배 굵게 하면 흐르는 양이 왜 두 배도 네 배도 아니라 열여섯 배인가.
//
// 같은 압력으로 밀 때 반지름이 두 배인 관은 가운데가 네 배 빠르고 단면이 네 배
// 넓어, 가는 관이 한 칸을 채우는 동안 열여섯 칸을 채운다.
//
// 원본: tasks/piece-lab/poiseuille-flow. 좌표는 원본의 논리 픽셀(860×280)을 그대로
// 쓰되 월드 y 가 위를 향하도록 뒤집는다 — 월드 y = FRAME.height − 원본 y.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:poiseuille-flow` 와 문자 그대로 일치한다 (C4). */
export const POISEUILLE_FLOW_ID = 'poiseuille-flow';

/** 원본 캔버스의 논리 크기. 월드 단위 하나 = 원본 논리 픽셀 하나. */
export const FRAME = { width: 860, height: 280 } as const;

/** 관 옆모습의 입구 · 출구 x. 두 관에 같다 — 같은 길이. */
export const PIPE_X = { inlet: 110, outlet: 610 } as const;

/** 단면 원의 중심 x. */
export const SECTION_X = 46;

/** 가는 관 중심 속도(월드/초). 중심 속도는 반지름 제곱에 비례한다. */
export const U_BASE = 20;

/**
 * 두 관. 반지름 비 1 : 2 → 중심 속도 비 1 : 4 → 유량 비 1 : 16.
 * `cy` 는 원본 y(아래로 증가)이고 월드로는 `FRAME.height − cy` 다.
 */
export const PIPES: readonly {
  id: 'thin' | 'thick';
  cy: number;
  radius: number;
  /** 반지름 제곱 배수 — 중심 속도 = U_BASE × 이것. */
  speedFactor: number;
  /** 받는 칸 수. */
  cells: number;
  /** 받는 칸의 열 수. 아래 줄부터 쌓는다. */
  cols: number;
}[] = [
  { id: 'thin', cy: 72, radius: 14, speedFactor: 1, cells: 1, cols: 1 },
  { id: 'thick', cy: 196, radius: 28, speedFactor: 4, cells: 16, cols: 4 },
];

/** 흐름 점 — 반지름 7 당 12 개. 처음 자리만 시드 난수로 정한다. */
export const DOTS = { perSevenRadius: 12, seed: 1, inset: 2, size: 1.4 } as const;

/** 염료 전선 — 입구에서 곧게 긋는 간격(초)과 수명(초). 두 관에 같은 수명. */
export const DYE = { interval: 1.5, life: 6.2, samples: 40, width: 1.6 } as const;

/** 받는 칸 — 한 칸의 크기와 간격, 격자 왼쪽 x. 두 관에 같은 칸 크기. */
export const CELL = { size: 22, gap: 4, left: 650 } as const;

/** 벽 두께 · 입구출구 타원의 굵기 · 가로 반지름 비 · 단면 원 테두리 굵기(화면 px). */
export const WALL = { rimWidth: 3, ellipseWidth: 1.5, ellipseRatio: 0.28, cellWidth: 1 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const poiseuilleFlowMessages = Object.freeze({
  'label.title': {
    ko: '관 속의 층류',
    en: 'Laminar flow in a pipe',
    ja: '管の中の層流',
    zh: '管中的层流',
    ar: 'الجريان الطبقي في أنبوب',
    es: 'Flujo laminar en un tubo',
    fr: 'Écoulement laminaire dans un tuyau',
    hi: 'नली में स्तरीय प्रवाह',
    id: 'Aliran laminar dalam pipa',
    pt: 'Escoamento laminar em um tubo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '반지름 4제곱에 비례하는 유량',
    en: 'Flow rate grows as the fourth power of the radius',
    ja: '流量は半径の4乗に比例して増える',
    zh: '流量随半径的四次方增长',
    ar: 'يزداد معدل التدفق مع القوة الرابعة لنصف القطر',
    es: 'El caudal crece con la cuarta potencia del radio',
    fr: 'Le débit croît comme la puissance quatrième du rayon',
    hi: 'प्रवाह दर त्रिज्या की चौथी घात के अनुपात में बढ़ती है',
    id: 'Debit bertambah sebanding dengan pangkat empat jari-jari',
    pt: 'A vazão cresce com a quarta potência do raio',
  },
  'label.stage': {
    ko: '두 관',
    en: 'Two pipes',
    ja: '二本の管',
    zh: '两根管',
    ar: 'أنبوبان',
    es: 'Dos tubos',
    fr: 'Deux tuyaux',
    hi: 'दो नलियाँ',
    id: 'Dua pipa',
    pt: 'Dois tubos',
  },
  'label.view': {
    ko: '옆모습',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  /** 고정 한 문장 — 채우는 중 · 머무는 중 · 비운 직후 어느 순간에도 참이다. */
  'caption.main': {
    ko: '같은 압력으로 밀 때, 가는 관이 한 칸을 채우는 동안 반지름이 두 배인 관은 열여섯 칸을 채운다.',
    en: 'Pushed by the same pressure, a pipe of twice the radius fills sixteen cells while the thin pipe fills one.',
    ja: '同じ圧力で押すと、細い管が1マスを満たすあいだに、半径が2倍の管は16マスを満たす。',
    zh: '用同样的压强推动时，细管装满一格的工夫，半径加倍的管装满十六格。',
    ar: 'عند الدفع بالضغط نفسه، يملأ أنبوب نصف قطره ضعف الآخر ست عشرة خانة بينما يملأ الأنبوب الرفيع خانة واحدة.',
    es: 'Empujado por la misma presión, un tubo del doble de radio llena dieciséis celdas mientras el tubo delgado llena una.',
    fr: 'Poussé par la même pression, un tuyau de rayon double remplit seize cases pendant que le tuyau fin en remplit une.',
    hi: 'एक ही दाब से धकेलने पर, दोगुनी त्रिज्या वाली नली सोलह खाने भरती है, जबकि पतली नली एक खाना भरती है।',
    id: 'Didorong oleh tekanan yang sama, pipa berjari-jari dua kali lipat mengisi enam belas kotak selagi pipa tipis mengisi satu.',
    pt: 'Empurrado pela mesma pressão, um tubo com o dobro do raio enche dezesseis células enquanto o tubo fino enche uma.',
  },
} satisfies Record<string, LocalizedText>);

export type PoiseuilleFlowMessageKey = keyof typeof poiseuilleFlowMessages;

export const text = (key: PoiseuilleFlowMessageKey): LocalizedText => poiseuilleFlowMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PoiseuilleFlowMessageKey): string {
  return k;
}

/**
 * 프레이밍. 원본 캔버스 전체에 캡션 한 줄 자리를 아래로 더한다 — 원본은 캡션을
 * 캔버스 밖 문단으로 두었다.
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FRAME.width, minY: -34, maxY: FRAME.height } as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const poiseuilleFlowSchema: BundleSchema = {
  id: POISEUILLE_FLOW_ID,
  label: text('label.title'),
  category: 'fluids',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 반지름을 바꾸면 칸 수가 정수가 아니게 되어 「한 칸 대 열여섯 칸」 셈이 흐려진다.
  parameters: [],
  stages: [{ id: 'pipes', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁은 원본(860×280)에 캡션 한 줄을 더한 비율. */
  canvas: { height: 400, minHeight: 320 },

  /** 원본의 그리기 순서(단면 → 물 → 점 → 염료 → 벽 → 칸)가 겹침을 정한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 10 초 — 가는 관이 한 칸을 채우는 8 초(fill), 다 찬 채 머무는 2 초(hold).
   * 굵은 관은 같은 8 초에 열여섯 칸을 채운다. 채움은 일정 유량이라 이징이 없다.
   */
  timeline: {
    phases: [
      { id: 'fill', duration: 8 },
      { id: 'hold', duration: 2 },
    ],
  },

  /** 도착한 순간 이미 가는 관 칸이 8분의 1, 굵은 관 칸이 두 개 차 있다 (원본 위상 1 초). */
  startAt: 1,

  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  messages: poiseuilleFlowMessages,
};
