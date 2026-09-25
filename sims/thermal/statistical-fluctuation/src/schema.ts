// ========================================================================
// statistical-fluctuation — 선언
// ========================================================================
// 질문: 고르게 섞인 기체도 흔들리는가, 얼마나 흔들리는가.
//
// 입자 수만 다른 상자 셋(적은 · 중간 · 많은)이 나란히 있다. 입자는 이미 고르게 퍼져
// 움직이고, 오른쪽 한 축 그래프가 상자마다 가운데 점선 왼쪽에 든 몫을 시간에 따라
// 긋는다. 입자가 적은 상자의 곡선은 50% 선 위아래로 크게 널뛰고, 많은 상자의 곡선은
// 50% 선에 거의 붙어 있다. 동사: 널뛴다 / 붙어 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:statistical-fluctuation` 와 문자 그대로 일치한다 (C4). */
export const STATISTICAL_FLUCTUATION_ID = 'statistical-fluctuation';

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 맨 아래 상자의 왼쪽 아래 모서리가 원점, y 는 위가 양수.
// 물리량(입자 수 셋 · 시드 · 상자 크기 · 속력 척도)은 스테이지 상수다 (아래 `stages`).
// ------------------------------------------------------------------------

/** 세로로 쌓은 상자 사이 틈(월드). 틈에 이름표가 끼지 않게 상자 왼쪽에 붙인다. */
export const BOX_GAP = 0.3;

/**
 * 오른쪽 그래프 — 상자마다 왼쪽 칸에 든 몫의 시간 이력. 가로는 `draw` 단계 시작부터
 * `compare` 단계 끝까지(시간표에서 읽는다), 세로는 0% 에서 100% 까지.
 */
export const GRAPH = {
  /** 축 원점(월드). 상자 오른쪽에 둔다. */
  origin: [1.8, 0] as readonly [number, number],
  /** 가로 길이(월드). */
  width: 4.0,
  /**
   * 100% 의 높이(월드). 쌓은 상자 셋의 높이(3 × 0.62 + 2 × 0.3)와 같다 — 기본 상자
   * 크기에 맞춘 고정값이다 (원칙 6, NOTES (b)).
   */
  height: 2.46,
  /** 곡선 표본 간격(초). */
  sampleSeconds: 0.1,
} as const;

/**
 * 프레이밍. 왼쪽 상자 이름표(−0.8) · 상자(0~1.2) · 그래프(1.8~5.8) · 곡선 머리 이름표 자리,
 * 위로는 세로축 이름 줄, 아래로는 시간 축 이름과 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.8, maxX: 6.85, minY: -0.62, maxY: 2.78 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const statisticalFluctuationMessages = Object.freeze({
  'label.title': {
    ko: '요동',
    en: 'Statistical fluctuation',
    ja: '統計的ゆらぎ',
    zh: '统计涨落',
    ar: 'التقلّب الإحصائي',
    es: 'Fluctuación estadística',
    fr: 'Fluctuation statistique',
    hi: 'सांख्यिकीय उतार-चढ़ाव',
    id: 'Fluktuasi statistik',
    pt: 'Flutuação estatística',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '입자 수가 적을 때 커지는 흔들림',
    en: 'The wobble that grows when particles are few',
    ja: '粒子が少ないときに大きくなるゆらぎ',
    zh: '粒子少时变大的涨落',
    ar: 'التذبذب الذي يكبر حين تقلّ الجسيمات',
    es: 'La oscilación que crece cuando hay pocas partículas',
    fr: 'L’oscillation qui grandit quand les particules sont peu nombreuses',
    hi: 'कण कम हों तो बढ़ने वाला उतार-चढ़ाव',
    id: 'Goyangan yang membesar saat partikel sedikit',
    pt: 'A oscilação que cresce quando há poucas partículas',
  },
  'label.stage': {
    ko: '입자 수가 다른 상자 셋',
    en: 'Three boxes, three particle counts',
    ja: '粒子数の異なる三つの箱',
    zh: '三个盒子，三种粒子数',
    ar: 'ثلاثة صناديق بثلاثة أعداد من الجسيمات',
    es: 'Tres cajas, tres números de partículas',
    fr: 'Trois boîtes, trois nombres de particules',
    hi: 'तीन बक्से, तीन कण-संख्याएँ',
    id: 'Tiga kotak, tiga jumlah partikel',
    pt: 'Três caixas, três números de partículas',
  },
  'label.view': {
    ko: '상자와 왼쪽 칸의 몫',
    en: 'Boxes and left-half share',
    ja: '箱と左半分の割合',
    zh: '盒子与左半边的占比',
    ar: 'الصناديق وحصة النصف الأيسر',
    es: 'Cajas y fracción en la mitad izquierda',
    fr: 'Boîtes et part de la moitié gauche',
    hi: 'बक्से और बाएँ आधे का हिस्सा',
    id: 'Kotak dan bagian di separuh kiri',
    pt: 'Caixas e fração na metade esquerda',
  },
  /** 상자 · 곡선의 입자 수 표식. 기호 + 값이라 두 언어가 같다. */
  'label.n': {
    ko: 'N = {n}',
    en: 'N = {n}',
    ja: 'N = {n}',
    zh: 'N = {n}',
    ar: 'N = {n}',
    es: 'N = {n}',
    fr: 'N = {n}',
    hi: 'N = {n}',
    id: 'N = {n}',
    pt: 'N = {n}',
  },
  /** 그래프 세로축 이름. */
  'label.axisShare': {
    ko: '왼쪽 칸에 든 몫',
    en: 'Share in the left half',
    ja: '左半分にある割合',
    zh: '左半边的占比',
    ar: 'الحصة في النصف الأيسر',
    es: 'Fracción en la mitad izquierda',
    fr: 'Part dans la moitié gauche',
    hi: 'बाएँ आधे में हिस्सा',
    id: 'Bagian di separuh kiri',
    pt: 'Fração na metade esquerda',
  },
  /** 그래프 가로축 이름. */
  'label.axisTime': {
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
  /** 세로 눈금 표식 — % 는 축 눈금에만 쓴다 (지금 값 글자는 띄우지 않는다). */
  'label.tick0': {
    ko: '0%',
    en: '0%',
    ja: '0%',
    zh: '0%',
    ar: '0%',
    es: '0%',
    fr: '0%',
    hi: '0%',
    id: '0%',
    pt: '0%',
  },
  'label.tick50': {
    ko: '50%',
    en: '50%',
    ja: '50%',
    zh: '50%',
    ar: '50%',
    es: '50%',
    fr: '50%',
    hi: '50%',
    id: '50%',
    pt: '50%',
  },
  'label.tick100': {
    ko: '100%',
    en: '100%',
    ja: '100%',
    zh: '100%',
    ar: '100%',
    es: '100%',
    fr: '100%',
    hi: '100%',
    id: '100%',
    pt: '100%',
  },
  'caption.draw': {
    ko: '세 상자에서 입자 {a}개 · {b}개 · {c}개가 고르게 퍼져 움직인다. 그래프는 상자마다 가운데 점선 왼쪽에 든 몫을 긋는다.',
    en: 'In three boxes, {a}, {b} and {c} particles move about, evenly spread. The graph traces, for each box, the share left of the dashed midline.',
    ja: '三つの箱で {a}個・{b}個・{c}個の粒子が均等に広がって動いている。グラフは箱ごとに、中央の点線より左にある割合を描く。',
    zh: '三个盒子里分别有 {a}、{b}、{c} 个粒子均匀分布、四处运动。图线描出每个盒子中位于中间虚线左侧的占比。',
    ar: 'في ثلاثة صناديق تتحرك {a} و{b} و{c} جسيمًا موزعةً بالتساوي. يرسم المنحنى لكل صندوق الحصة الواقعة يسار الخط المتقطع في المنتصف.',
    es: 'En tres cajas, {a}, {b} y {c} partículas se mueven repartidas por igual. La gráfica traza, para cada caja, la fracción a la izquierda de la línea discontinua central.',
    fr: 'Dans trois boîtes, {a}, {b} et {c} particules se déplacent, réparties uniformément. Le graphe trace, pour chaque boîte, la part à gauche de la ligne médiane en pointillés.',
    hi: 'तीन बक्सों में {a}, {b} और {c} कण समान रूप से फैलकर घूम रहे हैं। ग्राफ़ हर बक्से के लिए बीच की बिंदुकित रेखा के बाईं ओर का हिस्सा खींचता है।',
    id: 'Di tiga kotak, {a}, {b}, dan {c} partikel bergerak, tersebar merata. Grafik menggambar, untuk tiap kotak, bagian di kiri garis tengah putus-putus.',
    pt: 'Em três caixas, {a}, {b} e {c} partículas se movem, espalhadas por igual. O gráfico traça, para cada caixa, a fração à esquerda da linha tracejada do meio.',
  },
  'caption.compare': {
    ko: 'N = {a} 곡선은 50% 선 위아래로 크게 널뛰고, N = {c} 곡선은 50% 선에 거의 붙어 있다.',
    en: 'The N = {a} curve leaps far above and below the 50% line; the N = {c} curve stays almost on it.',
    ja: 'N = {a} の曲線は 50% の線の上下に大きく跳ね、N = {c} の曲線は 50% の線にほとんど張りついている。',
    zh: 'N = {a} 的曲线在 50% 线上下大幅跳动；N = {c} 的曲线几乎贴在这条线上。',
    ar: 'يقفز منحنى N = {a} بعيدًا فوق خط 50% وتحته؛ أما منحنى N = {c} فيكاد يلازمه.',
    es: 'La curva de N = {a} salta muy por encima y por debajo de la línea del 50%; la de N = {c} se queda casi sobre ella.',
    fr: 'La courbe N = {a} bondit loin au-dessus et au-dessous de la ligne des 50% ; la courbe N = {c} reste presque dessus.',
    hi: 'N = {a} वक्र 50% रेखा के ऊपर-नीचे बहुत उछलता है; N = {c} वक्र लगभग उसी पर टिका रहता है।',
    id: 'Kurva N = {a} melonjak jauh di atas dan di bawah garis 50%; kurva N = {c} nyaris tetap menempel padanya.',
    pt: 'A curva N = {a} salta muito acima e abaixo da linha de 50%; a curva N = {c} fica quase sobre ela.',
  },
} satisfies Record<string, LocalizedText>);

export type StatisticalFluctuationMessageKey = keyof typeof statisticalFluctuationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StatisticalFluctuationMessageKey): LocalizedText => statisticalFluctuationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StatisticalFluctuationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const statisticalFluctuationSchema: BundleSchema = {
  id: STATISTICAL_FLUCTUATION_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 세 상자가 움직이고 곡선 셋이 자란다.
  parameters: [],

  /**
   * 기체 셋과 상자. `count1` · `count2` · `count3` 은 위 · 가운데 · 아래 상자의 입자 수 N,
   * `seed` 는 처음 자리 · 속도를 뽑는 난수 시드(상자마다 `seed + 순번`, 같은 시각 = 같은 화면),
   * `boxWidth` · `boxHeight` 는 상자 하나의 크기(월드), `speedScale` 은 속도 성분의
   * 표준편차(월드/초)다. 시드 2 · 척도 0.5 에서 `compare` 단계 동안 N = 10 곡선은 10% 와
   * 80% 를 모두 찍고, N = 1000 곡선은 47~52% 안에 머문다 (NOTES (b) 캡션 참 보장).
   * 시드를 바꾸면 캡션이 여전히 참인지 촬영으로 다시 본다.
   */
  stages: [
    {
      id: 'three-boxes',
      label: text('label.stage'),
      constants: {
        count1: 10,
        count2: 100,
        count3: 1000,
        seed: 2,
        boxWidth: 1.2,
        boxHeight: 0.62,
        speedScale: 0.5,
      },
    },
  ],

  environments: [],

  views: [{ id: 'boxes-and-share', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림(상자 기둥 + 그래프)에 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /** 지금 점은 곡선 위에, 곡선은 50% 선 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 긋기 · 견주기 · 흐려짐.
   *
   * 입자는 처음부터 고르게 퍼져 있다 — 퍼지는 과정은 이웃 `second-law-of-thermodynamics` 의
   * 몫이다. `draw` 동안 곡선 셋이 자라기 시작하고, `compare` 동안 흔들림의 크기 차이가 쌓인다.
   * `compare` 가 가장 길다: 「널뛴다 / 붙어 있다」 는 쌓인 곡선의 폭으로 보인다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.draw') },
      { id: 'draw', duration: 4, caption: key('caption.draw') },
      { id: 'compare', duration: 9, caption: key('caption.compare') },
      { id: 'fade', duration: 0.8, caption: key('caption.compare') },
    ],
  },

  /** 도착한 순간 이미 입자가 움직이고 곡선 셋이 2 초쯤 자라 있다. */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 1/√N 과 확률은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { a: 'countText1', b: 'countText2', c: 'countText3' },
  },

  messages: statisticalFluctuationMessages,
};
