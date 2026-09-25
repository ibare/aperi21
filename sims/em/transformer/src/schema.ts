// ========================================================================
// transformer — 선언
// ========================================================================
// 질문: 철심 하나에 감은 두 코일에서 2차 전압은 무엇으로 정해지는가.
//
// 네모난 철심의 왼 다리에 1차 코일, 오른 다리에 2차 코일이 감겨 있다. 1차 코일에
// 교류 전압을 걸면 철심 속 선속 Φ 가 흔들리고, 같은 선속이 2차 코일의 **한 바퀴마다
// 같은 전압**을 만든다. 그 몫이 감은 수만큼 쌓이므로 2차 전압의 높이는 감은 수의 비를
// 따른다. 2차를 1차의 두 배로 감으면 두 배 높이로, 절반으로 감으면 절반 높이로
// 흔들린다. 전류는 반대로 바뀐다 — 짧게만 보인다.
//
// 1차 · 2차 전압의 기록지는 같은 시간축 · 같은 전압 배율이고, 가는 가로줄 하나의
// 간격이 **한 바퀴 몫의 전압**이다. 1차 파형은 N₁ 번째 줄에, 2차 파형은 N₂ 번째 줄에
// 닿는다.
//
// 한 코일의 전류 변화가 이웃 코일에 전압을 만드는 것 자체는 이웃 `mutual-inductance`
// 의 몫이다. 여기서는 그것을 전제로 **감은 수 비** 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:transformer` 와 문자 그대로 일치한다 (C4). */
export const TRANSFORMER_ID = 'transformer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 1차 코일의 감은 수. */
export const PRIMARY_TURNS = 2;
/** 앞 기록의 2차 감은 수 — 1차의 두 배(1 : 2). */
export const SECONDARY_TURNS_UP = 4;
/** 뒤 기록의 2차 감은 수 — 1차의 절반(2 : 1). */
export const SECONDARY_TURNS_DOWN = 1;
/** 1차 교류 전압의 봉우리(V). 한 바퀴 몫 = 이 값 ÷ 1차 감은 수. */
export const PRIMARY_PEAK = 4;
/** 1차 전류의 봉우리(A). 2차 전류 = 이 값 × N₁ / N₂ (이상 변압기, NOTES (b)). */
export const PRIMARY_CURRENT_PEAK = 1;
/** 교류 진동수(Hz). 눈으로 따라가도록 늦춘 값이다(NOTES (b)). */
export const FREQUENCY = 0.5;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전압(V) → 기록지 높이(월드). 두 기록지가 같은 배율이라 높이를 곧바로 견준다. */
export const VOLT_SCALE = 0.12;
/** 기록지 가로 — 1 초가 차지하는 월드 길이. 두 기록지가 같다. */
export const SECONDS_TO_WORLD = 0.9;
/** 기록지가 담는 시간(초). 한 설정의 기록 단계 길이 합(4 + 2)과 같다. */
export const GRAPH_SECONDS = 6;
/** 전류(A) → 전류 화살표 길이(월드). */
export const CURRENT_ARROW_SCALE = 0.45;
/** 선속(Wb) → 선속 화살표 길이(월드). */
export const FLUX_ARROW_SCALE = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 철심과 두 코일, 오른쪽에 두 기록지.
// ------------------------------------------------------------------------

/** 철심 바깥 사각형과 다리 · 멍에의 두께. */
export const CORE_MIN_X = -6.1;
export const CORE_MAX_X = -3.3;
export const CORE_MIN_Y = -1.45;
export const CORE_MAX_Y = 1.45;
export const CORE_THICKNESS = 0.5;

/** 코일 고리 — 다리 밖으로 비어져 나오는 가로 몫, 세로 반지름(비스듬히 본 깊이), 고리 사이 간격. */
export const LOOP_OVERHANG = 0.08;
export const LOOP_RY = 0.07;
export const LOOP_PITCH = 0.2;
/** 코일 두 끝이 이음선으로 나가는 높이(축에서 위 · 아래). 가장 많이 감은 코일보다 바깥이다. */
export const LEAD_Y = 0.62;

/** 교류 전원 — 원의 가운데 x · 반지름. */
export const SOURCE_X = -7.0;
export const SOURCE_R = 0.3;
/** 부하 — 지그재그가 놓이는 x 와 위 · 아래 끝 높이, 꺾임 수, 꺾임 폭. */
export const LOAD_X = -2.1;
export const LOAD_HALF = 0.4;
export const LOAD_ZIGS = 6;
export const LOAD_ZIG_W = 0.13;

/** V₁ 기록지 원점(시간 0 · 전압 0)과 위 · 아래로 뻗는 높이. */
export const GRAPH_X = -0.9;
export const V1_GRAPH_Y = 1.35;
export const V1_GRAPH_H = 0.6;
/** V₂ 기록지 0 선의 높이와 위 · 아래로 뻗는 높이. */
export const V2_GRAPH_Y = -0.95;
export const V2_GRAPH_H = 1.05;

/**
 * 프레이밍 — 전원 왼끝부터 기록지 축 이름 너머, 세로는 캡션 줄부터 V₁ 축 이름 위까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -7.85, maxX: 4.95, minY: -2.7, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 2차를 두 배로 감은 채 전압을 기록하는 동안. */
export const UP_RECORD = 4;
/** 같은 기록이 이어지며 전류를 짚는 동안. */
export const UP_NOTE = 2;
/** 기록을 지우며 2차 코일을 절반 감은 수로 줄이는 동안 — 옛 고리 · 옛 이름표가 사라진다. */
export const SWAP_DOWN = 1.2;
/** 줄인 코일의 새 감은 수 이름표가 스며드는 동안. */
export const LABEL_DOWN = 0.8;
/** 2차를 절반으로 감은 채 전압을 기록하는 동안. */
export const DOWN_RECORD = 4;
/** 같은 기록이 이어지며 전류를 짚는 동안. */
export const DOWN_NOTE = 2;
/** 기록을 지우며 2차 코일을 다시 두 배 감은 수로 감는 동안 — 새 고리가 스며든다. */
export const SWAP_UP = 1.2;
/** 다시 감은 코일의 감은 수 이름표가 스며드는 동안. */
export const LABEL_UP = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const transformerMessages = Object.freeze({
  'label.title': {
    ko: '변압기',
    en: 'Transformer',
    ja: '変圧器',
    zh: '变压器',
    ar: 'المحوّل',
    es: 'Transformador',
    fr: 'Transformateur',
    hi: 'ट्रांसफ़ॉर्मर',
    id: 'Transformator',
    pt: 'Transformador',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '감은 수와 전압비',
    en: 'Turns and the voltage ratio',
    ja: '巻き数と電圧の比',
    zh: '匝数与电压比',
    ar: 'عدد اللفات ونسبة الجهد',
    es: 'Las espiras y la razón de voltajes',
    fr: 'Les spires et le rapport des tensions',
    hi: 'फेरे और वोल्टता अनुपात',
    id: 'Jumlah lilitan dan perbandingan tegangan',
    pt: 'As espiras e a razão de tensões',
  },
  'label.stage': {
    ko: '철심에 감은 두 코일',
    en: 'Two coils on one iron core',
    ja: '一つの鉄心に巻いた二つのコイル',
    zh: '同一铁芯上的两个线圈',
    ar: 'ملفان على قلب حديدي واحد',
    es: 'Dos bobinas en un mismo núcleo de hierro',
    fr: 'Deux bobines sur un même noyau de fer',
    hi: 'एक लौह क्रोड पर दो कुंडलियाँ',
    id: 'Dua kumparan pada satu inti besi',
    pt: 'Duas bobinas em um mesmo núcleo de ferro',
  },
  'label.view': {
    ko: '변압기와 기록',
    en: 'Transformer and record',
    ja: '変圧器と記録',
    zh: '变压器与记录',
    ar: 'المحوّل والتسجيل',
    es: 'Transformador y registro',
    fr: 'Transformateur et enregistrement',
    hi: 'ट्रांसफ़ॉर्मर और अभिलेख',
    id: 'Transformator dan rekaman',
    pt: 'Transformador e registro',
  },
  /** 감은 수 이름표 — 값이 끼는 조립문이라 문안이다 (C1). */
  'label.n1': {
    ko: 'N₁ = {n}',
    en: 'N₁ = {n}',
    ja: 'N₁ = {n}',
    zh: 'N₁ = {n}',
    ar: 'N₁ = {n}',
    es: 'N₁ = {n}',
    fr: 'N₁ = {n}',
    hi: 'N₁ = {n}',
    id: 'N₁ = {n}',
    pt: 'N₁ = {n}',
  },
  'label.n2': {
    ko: 'N₂ = {n}',
    en: 'N₂ = {n}',
    ja: 'N₂ = {n}',
    zh: 'N₂ = {n}',
    ar: 'N₂ = {n}',
    es: 'N₂ = {n}',
    fr: 'N₂ = {n}',
    hi: 'N₂ = {n}',
    id: 'N₂ = {n}',
    pt: 'N₂ = {n}',
  },
  /** 전압 · 전류 · 선속 · 교류 · 축 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.v1': {
    ko: 'V₁',
    en: 'V₁',
    ja: 'V₁',
    zh: 'V₁',
    ar: 'V₁',
    es: 'V₁',
    fr: 'V₁',
    hi: 'V₁',
    id: 'V₁',
    pt: 'V₁',
  },
  'label.v2': {
    ko: 'V₂',
    en: 'V₂',
    ja: 'V₂',
    zh: 'V₂',
    ar: 'V₂',
    es: 'V₂',
    fr: 'V₂',
    hi: 'V₂',
    id: 'V₂',
    pt: 'V₂',
  },
  'label.i1': {
    ko: 'I₁',
    en: 'I₁',
    ja: 'I₁',
    zh: 'I₁',
    ar: 'I₁',
    es: 'I₁',
    fr: 'I₁',
    hi: 'I₁',
    id: 'I₁',
    pt: 'I₁',
  },
  'label.i2': {
    ko: 'I₂',
    en: 'I₂',
    ja: 'I₂',
    zh: 'I₂',
    ar: 'I₂',
    es: 'I₂',
    fr: 'I₂',
    hi: 'I₂',
    id: 'I₂',
    pt: 'I₂',
  },
  'label.flux': {
    ko: 'Φ',
    en: 'Φ',
    ja: 'Φ',
    zh: 'Φ',
    ar: 'Φ',
    es: 'Φ',
    fr: 'Φ',
    hi: 'Φ',
    id: 'Φ',
    pt: 'Φ',
  },
  'label.ac': {
    ko: '~',
    en: '~',
    ja: '~',
    zh: '~',
    ar: '~',
    es: '~',
    fr: '~',
    hi: '~',
    id: '~',
    pt: '~',
  },
  'label.axisT': {
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
  'caption.upRecord': {
    ko: '1차 {n1}바퀴, 2차 {n2up}바퀴 — 같은 선속이 한 바퀴마다 같은 전압을 만들어, 2차 전압이 더 높이 흔들린다',
    en: 'Primary {n1} turns, secondary {n2up} turns — the same flux gives each turn the same voltage, so the secondary swings higher',
    ja: '一次 {n1} 回巻き、二次 {n2up} 回巻き — 同じ磁束が一巻きごとに同じ電圧を生むので、二次電圧はより高く振れる',
    zh: '初级 {n1} 匝，次级 {n2up} 匝 — 相同的磁通量使每一匝产生相同的电压，所以次级电压摆得更高',
    ar: 'لفات الابتدائي {n1}، ولفات الثانوي {n2up} — التدفق نفسه يعطي كل لفة الجهد نفسه، فيتأرجح جهد الثانوي أعلى',
    es: 'Primario de {n1} espiras, secundario de {n2up} espiras — el mismo flujo da a cada espira el mismo voltaje, así que el secundario oscila más alto',
    fr: 'Primaire à {n1} spires, secondaire à {n2up} spires — le même flux donne à chaque spire la même tension, donc le secondaire oscille plus haut',
    hi: 'प्राथमिक {n1} फेरे, द्वितीयक {n2up} फेरे — वही फ्लक्स हर फेरे को वही वोल्टता देता है, इसलिए द्वितीयक अधिक ऊँचा दोलन करता है',
    id: 'Primer {n1} lilitan, sekunder {n2up} lilitan — fluks yang sama memberi setiap lilitan tegangan yang sama, sehingga sekunder berayun lebih tinggi',
    pt: 'Primário com {n1} espiras, secundário com {n2up} espiras — o mesmo fluxo dá a cada espira a mesma tensão, então o secundário oscila mais alto',
  },
  'caption.upNote': {
    ko: '전압이 높아진 대신 2차 전류 I₂ 는 1차 전류 I₁ 보다 작다',
    en: 'The voltage is stepped up, but the secondary current I₂ is smaller than the primary current I₁',
    ja: '電圧は上がったが、そのかわり二次電流 I₂ は一次電流 I₁ より小さい',
    zh: '电压升高了，但次级电流 I₂ 比初级电流 I₁ 小',
    ar: 'ارتفع الجهد، لكن التيار الثانوي I₂ أصغر من التيار الابتدائي I₁',
    es: 'El voltaje se eleva, pero la corriente secundaria I₂ es menor que la corriente primaria I₁',
    fr: 'La tension est élevée, mais le courant secondaire I₂ est plus faible que le courant primaire I₁',
    hi: 'वोल्टता बढ़ गई, पर द्वितीयक धारा I₂ प्राथमिक धारा I₁ से कम है',
    id: 'Tegangan dinaikkan, tetapi arus sekunder I₂ lebih kecil daripada arus primer I₁',
    pt: 'A tensão é elevada, mas a corrente secundária I₂ é menor que a corrente primária I₁',
  },
  'caption.swapDown': {
    ko: '2차 코일을 {n2down}바퀴로 줄인다',
    en: 'The secondary is rewound to {n2down} turns',
    ja: '二次コイルを {n2down} 回巻きに巻き直す',
    zh: '次级线圈改绕为 {n2down} 匝',
    ar: 'يُعاد لفّ الملف الثانوي ليصير عدد لفاته {n2down}',
    es: 'El secundario se rebobina a {n2down} espiras',
    fr: 'Le secondaire est rebobiné à {n2down} spires',
    hi: 'द्वितीयक को {n2down} फेरों में फिर से लपेटा जाता है',
    id: 'Kumparan sekunder dililit ulang menjadi {n2down} lilitan',
    pt: 'O secundário é rebobinado para {n2down} espiras',
  },
  'caption.downRecord': {
    ko: '1차 {n1}바퀴, 2차 {n2down}바퀴 — 한 바퀴의 몫은 그대로라, 2차 전압이 더 낮게 흔들린다',
    en: 'Primary {n1} turns, secondary {n2down} turns — each turn still gets the same share, so the secondary swings lower',
    ja: '一次 {n1} 回巻き、二次 {n2down} 回巻き — 一巻きの分け前は変わらないので、二次電圧はより低く振れる',
    zh: '初级 {n1} 匝，次级 {n2down} 匝 — 每一匝分到的份额不变，所以次级电压摆得更低',
    ar: 'لفات الابتدائي {n1}، ولفات الثانوي {n2down} — ما زالت كل لفة تنال الحصة نفسها، فيتأرجح جهد الثانوي أدنى',
    es: 'Primario de {n1} espiras, secundario de {n2down} espiras — cada espira sigue recibiendo la misma parte, así que el secundario oscila más bajo',
    fr: 'Primaire à {n1} spires, secondaire à {n2down} spires — chaque spire reçoit toujours la même part, donc le secondaire oscille plus bas',
    hi: 'प्राथमिक {n1} फेरे, द्वितीयक {n2down} फेरे — हर फेरे को अब भी वही हिस्सा मिलता है, इसलिए द्वितीयक कम ऊँचा दोलन करता है',
    id: 'Primer {n1} lilitan, sekunder {n2down} lilitan — setiap lilitan tetap mendapat bagian yang sama, sehingga sekunder berayun lebih rendah',
    pt: 'Primário com {n1} espiras, secundário com {n2down} espiras — cada espira ainda recebe a mesma parte, então o secundário oscila mais baixo',
  },
  'caption.downNote': {
    ko: '전압이 낮아진 대신 2차 전류 I₂ 는 1차 전류 I₁ 보다 크다',
    en: 'The voltage is stepped down, but the secondary current I₂ is larger than the primary current I₁',
    ja: '電圧は下がったが、そのかわり二次電流 I₂ は一次電流 I₁ より大きい',
    zh: '电压降低了，但次级电流 I₂ 比初级电流 I₁ 大',
    ar: 'انخفض الجهد، لكن التيار الثانوي I₂ أكبر من التيار الابتدائي I₁',
    es: 'El voltaje se reduce, pero la corriente secundaria I₂ es mayor que la corriente primaria I₁',
    fr: 'La tension est abaissée, mais le courant secondaire I₂ est plus fort que le courant primaire I₁',
    hi: 'वोल्टता घट गई, पर द्वितीयक धारा I₂ प्राथमिक धारा I₁ से अधिक है',
    id: 'Tegangan diturunkan, tetapi arus sekunder I₂ lebih besar daripada arus primer I₁',
    pt: 'A tensão é reduzida, mas a corrente secundária I₂ é maior que a corrente primária I₁',
  },
  'caption.swapUp': {
    ko: '2차 코일을 다시 {n2up}바퀴로 감는다',
    en: 'The secondary is wound back to {n2up} turns',
    ja: '二次コイルをふたたび {n2up} 回巻きに巻く',
    zh: '次级线圈重新绕回 {n2up} 匝',
    ar: 'يُلَفّ الملف الثانوي من جديد ليصير عدد لفاته {n2up}',
    es: 'El secundario se vuelve a bobinar a {n2up} espiras',
    fr: 'Le secondaire est de nouveau bobiné à {n2up} spires',
    hi: 'द्वितीयक को फिर से {n2up} फेरों में लपेटा जाता है',
    id: 'Kumparan sekunder dililit kembali menjadi {n2up} lilitan',
    pt: 'O secundário é bobinado de volta para {n2up} espiras',
  },
} satisfies Record<string, LocalizedText>);

export type TransformerMessageKey = keyof typeof transformerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TransformerMessageKey): LocalizedText => transformerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TransformerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const transformerSchema: BundleSchema = {
  id: TRANSFORMER_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 1 : 2 로 감은 변압기가 돌고 있고, 다음에 2 : 1 로 바뀐다.
  parameters: [],

  stages: [
    {
      id: 'core',
      label: text('label.stage'),
      constants: {
        primaryTurns: PRIMARY_TURNS,
        secondaryTurnsUp: SECONDARY_TURNS_UP,
        secondaryTurnsDown: SECONDARY_TURNS_DOWN,
        primaryPeak: PRIMARY_PEAK,
        primaryCurrentPeak: PRIMARY_CURRENT_PEAK,
        frequency: FREQUENCY,
        voltScale: VOLT_SCALE,
        secondsToWorld: SECONDS_TO_WORLD,
        graphSeconds: GRAPH_SECONDS,
        currentArrowScale: CURRENT_ARROW_SCALE,
        fluxArrowScale: FLUX_ARROW_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 철심과 기록지 두 장이 나란하다. */
  canvas: { height: 340, minHeight: 300 },

  /** 고리 앞 반쪽은 철심 위, 뒤 반쪽은 철심 아래에 와야 코일이 다리를 감은 것으로 읽힌다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 1 : 2 기록 → 2차를 줄임 → 2 : 1 기록 → 2차를 다시 감음.
   *
   * 기록 단계 둘(`*Record` · `*Note`)이 한 기록지를 함께 채운다 — 뒤 단계는 캡션만
   * 전류 쪽으로 옮긴다. 코일을 바꾸는 것은 두 단계다 — `swap*` 동안 기록 · 옛 고리 · 옛
   * 이름표가 사라지고(새 고리는 스며들고), `label*` 동안 새 감은 수 이름표가 스며든다.
   * 두 단계는 같은 캡션 키라 문장이 끊기지 않는다.
   */
  timeline: {
    phases: [
      { id: 'upRecord', duration: UP_RECORD, caption: key('caption.upRecord') },
      { id: 'upNote', duration: UP_NOTE, caption: key('caption.upNote') },
      { id: 'swapDown', duration: SWAP_DOWN, ease: 'smooth', caption: key('caption.swapDown') },
      { id: 'labelDown', duration: LABEL_DOWN, ease: 'smooth', caption: key('caption.swapDown') },
      { id: 'downRecord', duration: DOWN_RECORD, caption: key('caption.downRecord') },
      { id: 'downNote', duration: DOWN_NOTE, caption: key('caption.downNote') },
      { id: 'swapUp', duration: SWAP_UP, ease: 'smooth', caption: key('caption.swapUp') },
      { id: 'labelUp', duration: LABEL_UP, ease: 'smooth', caption: key('caption.swapUp') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 1 : 2 기록이 한 주기 넘게 적혀 있다. */
  startAt: 2.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식(V₂/V₁ = N₂/N₁)은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 780,
    fade: 0.2,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 감은 수는 스테이지 상수다 — state 가 그 글자를 들고 있다 (장부 G133).
    vars: { n1: 'n1', n2up: 'n2Up', n2down: 'n2Down' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 기록지의 가는 가로줄은 크롬이 아니라 장치다 —
   * 한 칸이 한 바퀴 몫의 전압이라 봉우리가 닿은 줄 수가 감은 수다. 볼트 수는 쓰지 않는다.
   */

  messages: transformerMessages,
};
