// ========================================================================
// efficiency — 선언
// ========================================================================
// 질문: 효율이 「얼마나 많이 내놓느냐」 가 아니라 「넣은 것 중 얼마를 내놓느냐」 라는 것이
// 그림으로 어떻게 보이는가.
//
// 두 기계가 나란히 에너지를 받는다. 들어가는 띠의 굵기가 넣은 양이고, 기계를 지나면
// 쓸모로 나가는 갈래(오른쪽)와 새어 나가는 갈래(아래)로 갈린다. 처음에는 A 가 더 많이
// 받아 쓸모 갈래도 A 가 굵다. B 의 입구를 A 와 같은 굵기로 늘리면 — 모든 갈래가 같은
// 비로 함께 굵어지고 — 쓸모 갈래는 B 쪽이 더 굵어진다. 굵기를 맞춰도 변하지 않는 것,
// 그 몫이 효율이다.
//
// `energy-flow-diagram` 은 갈래가 **어디서** 새는지를 보인다. 이 조각은 새는 곳이 아니라
// **몫**을 보인다 — 크기를 맞추는 동작이 「비」 를 화면에 세운다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:efficiency` 와 문자 그대로 일치한다 (C4). */
export const EFFICIENCY_ID = 'efficiency';

// ------------------------------------------------------------------------
// 에너지 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기계 A 가 받는 에너지 · 쓸모로 내놓는 에너지(J). 효율 40 %. */
export const IN_A = 10;
export const OUT_A = 4;
/** 기계 B 가 받는 에너지 · 쓸모로 내놓는 에너지(J). 효율 75 % — 적게 받지만 몫이 크다. */
export const IN_B = 4;
export const OUT_B = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 기계를 가로로 나란히 둔다 (세로가 비싸다, S-piece).
// ------------------------------------------------------------------------

/** 1 J 가 차지하는 띠의 굵기(월드). 굵기가 곧 양이다. */
export const UNIT = 0.12;
/** 모든 띠의 윗변 높이. 윗변을 맞춰야 굵기 차이가 아래쪽 한 곳에서 읽힌다. */
export const Y_TOP = 0;
/** 들어가는 띠의 길이 — 띠가 시작하는 자리부터 기계 왼쪽 벽까지. */
export const INLET_LEN = 2.4;
/** 기계 상자의 폭과, 띠 위아래로 남기는 여백. */
export const MACHINE_W = 0.9;
export const MACHINE_PAD = 0.14;
/** 쓸모 갈래가 기계를 나와 화살촉 밑동까지 가는 길이. */
export const OUTLET_LEN = 2.5;
/** 화살촉의 길이와, 띠 위아래로 벌어지는 폭. */
export const HEAD_LEN = 0.36;
export const HEAD_FLARE = 0.1;
/** 새는 갈래가 아래로 꺾일 때 안쪽 반지름. */
export const BEND_R = 0.22;
/** 새는 갈래가 닿는 높이. */
export const LOSS_FLOOR = -2.2;
/** 두 기계의 띠가 시작하는 자리(월드 x). */
export const ORIGIN_A = 0;
export const ORIGIN_B = 7.9;

/** 흐르는 점 — 1 J 마다 한 가닥. 점 사이 간격(월드) · 흐르는 빠르기(월드/초). */
export const DOT_SPACING = 0.34;
export const DOT_SPEED = 0.8;

/**
 * 프레이밍은 주장의 일부다. 가로는 A 의 입구부터 B 의 % 이름표까지, 세로는 기계 이름표
 * 위부터 새는 갈래 이름표 아래까지. B 가 A 의 굵기로 늘어나도 이 안에 담긴다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.35, maxX: 15.2, minY: -2.95, maxY: 0.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이는 저작 결정이다. scene 은 `at('scale')` · `at('unscale')` 로 읽는다.
// ------------------------------------------------------------------------

/** 제 크기로 흐르는 동안 · 입구를 맞추는 동안 · 맞춘 채 흐르는 동안 · 되돌리는 동안(초). */
export const AMOUNTS = 4.5;
export const SCALE = 1.6;
export const RATIO = 4.5;
export const UNSCALE = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const efficiencyMessages = Object.freeze({
  'label.title': {
    ko: '효율',
    en: 'Efficiency',
    ja: '効率',
    zh: '效率',
    ar: 'الكفاءة',
    es: 'Eficiencia',
    fr: 'Rendement',
    hi: 'दक्षता',
    id: 'Efisiensi',
    pt: 'Eficiência',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '넣은 것 가운데 쓸모로 나오는 몫',
    en: 'The share of what goes in that comes out as useful output',
    ja: '入れたもののうち役に立つ出力として出てくる割合',
    zh: '输入之中作为有用输出出来的份额',
    ar: 'الحصة مما يدخل التي تخرج ناتجًا مفيدًا',
    es: 'La parte de lo que entra que sale como salida útil',
    fr: 'La part de ce qui entre qui ressort sous forme utile',
    hi: 'जो डाला जाता है उसका वह हिस्सा जो उपयोगी निकास बनकर निकलता है',
    id: 'Bagian dari masukan yang keluar sebagai keluaran berguna',
    pt: 'A parte do que entra que sai como saída útil',
  },
  'label.stage': {
    ko: '두 기계',
    en: 'Two machines',
    ja: '二つの機械',
    zh: '两台机器',
    ar: 'آلتان',
    es: 'Dos máquinas',
    fr: 'Deux machines',
    hi: 'दो मशीनें',
    id: 'Dua mesin',
    pt: 'Duas máquinas',
  },
  'label.view': {
    ko: '흐름',
    en: 'Flow',
    ja: '流れ',
    zh: '流向图',
    ar: 'التدفق',
    es: 'Flujo',
    fr: 'Flux',
    hi: 'प्रवाह',
    id: 'Aliran',
    pt: 'Fluxo',
  },
  /** 기계 이름. 도형에 붙는 기호라 번역 대상이 아니다 (C1 판정 1). */
  'label.machineA': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.machineB': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  /** 띠의 양. 값 + 단위 표기다 (C1 판정 3). */
  'label.joules': {
    ko: '{v} J',
    en: '{v} J',
    ja: '{v} J',
    zh: '{v} J',
    ar: '{v} J',
    es: '{v} J',
    fr: '{v} J',
    hi: '{v} J',
    id: '{v} J',
    pt: '{v} J',
  },
  'label.percent': {
    ko: '{v} %',
    en: '{v} %',
    ja: '{v} %',
    zh: '{v} %',
    ar: '{v} %',
    es: '{v} %',
    fr: '{v} %',
    hi: '{v} %',
    id: '{v} %',
    pt: '{v} %',
  },
  'caption.amounts': {
    ko: 'A 가 더 많이 받아 더 많이 내놓는다 — 쓸모로 나가는 갈래는 A 쪽이 더 굵다',
    en: 'A takes in more and puts out more — its useful branch is the thicker one',
    ja: 'A のほうが多く受け取り、多く出す — 役に立つ分の枝は A のほうが太い',
    zh: 'A 输入更多，输出也更多——有用的那一支是 A 更粗',
    ar: 'تأخذ A أكثر وتُخرج أكثر — فرعها المفيد هو الأعرض',
    es: 'A recibe más y entrega más — su rama útil es la más gruesa',
    fr: 'A reçoit plus et fournit plus — sa branche utile est la plus épaisse',
    hi: 'A अधिक लेती है और अधिक देती है — उसकी उपयोगी शाखा ही ज़्यादा मोटी है',
    id: 'A menerima lebih banyak dan mengeluarkan lebih banyak — cabang bergunanya yang lebih tebal',
    pt: 'A recebe mais e entrega mais — seu ramo útil é o mais grosso',
  },
  'caption.scale': {
    ko: 'B 의 입구를 A 와 같은 굵기로 늘리면, 갈래들도 같은 비로 함께 굵어진다',
    en: "Widen B's inlet to match A's, and each of its branches widens in the same proportion",
    ja: 'B の入口を A と同じ太さに広げると、どの枝も同じ比で太くなる',
    zh: '把 B 的入口加宽到与 A 相同，它的每一支都按同一比例变粗',
    ar: 'عند توسيع مدخل B ليطابق مدخل A، يتسع كل فرع من فروعها بالنسبة نفسها',
    es: 'Al ensanchar la entrada de B hasta igualar la de A, cada una de sus ramas se ensancha en la misma proporción',
    fr: 'Quand l’entrée de B s’élargit jusqu’à celle de A, chacune de ses branches s’élargit dans la même proportion',
    hi: 'B के प्रवेश को A के बराबर चौड़ा करने पर उसकी हर शाखा उसी अनुपात में चौड़ी होती है',
    id: 'Saat saluran masuk B dilebarkan menyamai A, setiap cabangnya melebar dengan perbandingan yang sama',
    pt: 'Ao alargar a entrada de B até igualar a de A, cada um de seus ramos se alarga na mesma proporção',
  },
  'caption.ratio': {
    ko: '같은 굵기로 들여보내니 쓸모로 나가는 갈래는 B 쪽이 더 굵다',
    en: "With the same inflow, B's useful branch is now the thicker one",
    ja: '同じ太さで流し込むと、今度は役に立つ分の枝が B のほうが太い',
    zh: '输入相同时，现在是 B 的有用分支更粗',
    ar: 'مع التدفق الداخل نفسه، صار الفرع المفيد لـ B هو الأعرض',
    es: 'Con la misma entrada, ahora la rama útil más gruesa es la de B',
    fr: 'À débit d’entrée égal, c’est maintenant la branche utile de B qui est la plus épaisse',
    hi: 'समान अंतर्वाह पर अब B की उपयोगी शाखा ज़्यादा मोटी है',
    id: 'Dengan aliran masuk yang sama, kini cabang berguna B yang lebih tebal',
    pt: 'Com a mesma entrada, agora o ramo útil de B é o mais grosso',
  },
  'caption.unscale': {
    ko: 'B 를 제 크기로 되돌린다 — 굵기는 줄어도 갈래가 나뉘는 몫은 그대로다',
    en: 'B shrinks back to its own size — the branches thin, but their shares stay the same',
    ja: 'B が元の大きさに戻る — 枝は細くなっても、分かれる割合はそのまま',
    zh: 'B 缩回原来的大小——各支变细了，但所占的份额不变',
    ar: 'تعود B إلى حجمها الأصلي — تضيق الفروع، لكن حصصها تبقى كما هي',
    es: 'B vuelve a su propio tamaño — las ramas adelgazan, pero sus proporciones se mantienen',
    fr: 'B reprend sa propre taille — les branches s’amincissent, mais leurs parts restent les mêmes',
    hi: 'B वापस अपने आकार में सिकुड़ जाती है — शाखाएँ पतली होती हैं, पर उनके हिस्से वही रहते हैं',
    id: 'B menyusut kembali ke ukurannya sendiri — cabang-cabangnya menipis, tetapi bagiannya tetap sama',
    pt: 'B volta ao seu próprio tamanho — os ramos afinam, mas suas parcelas continuam as mesmas',
  },
} satisfies Record<string, LocalizedText>);

export type EfficiencyMessageKey = keyof typeof efficiencyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EfficiencyMessageKey): LocalizedText => efficiencyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EfficiencyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const efficiencySchema: BundleSchema = {
  id: EFFICIENCY_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흐르고, 입구가 맞춰지고, 되돌아간다.
  parameters: [],

  stages: [
    {
      id: 'two-machines',
      label: text('label.stage'),
      constants: { inA: IN_A, outA: OUT_A, inB: IN_B, outB: OUT_B },
    },
  ],

  environments: [],

  views: [{ id: 'flow', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다. */
  canvas: { height: 280, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 흐르는 점은 띠 **위**, 기계 상자 **아래** 로 지나가야 점이
   * 기계 안으로 들어갔다 나오는 것으로 읽힌다. 층 순서로는 `region` 이 입자 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 제 크기로 흐름 → B 의 입구를 A 의 굵기로 늘림 → 맞춘 채 흐름 → 되돌림.
   * 늘리고 되돌리는 동안은 `smooth` — 굵기가 변하는 것이 눈에 따라가져야 한다.
   */
  timeline: {
    phases: [
      { id: 'amounts', duration: AMOUNTS, caption: key('caption.amounts') },
      { id: 'scale', duration: SCALE, ease: 'smooth', caption: key('caption.scale') },
      { id: 'ratio', duration: RATIO, caption: key('caption.ratio') },
      { id: 'unscale', duration: UNSCALE, ease: 'smooth', caption: key('caption.unscale') },
    ],
  },

  /** 도착한 순간 이미 흐르는 중이다. 흐름은 시각의 함수라 첫 프레임부터 차 있다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 효율의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: efficiencyMessages,
};
