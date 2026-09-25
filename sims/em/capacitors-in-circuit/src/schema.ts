// ========================================================================
// capacitors-in-circuit — 선언
// ========================================================================
// 질문: 같은 축전기 둘을 같은 전지에 병렬 · 직렬로 이으면, 둘을 합친 것은 어떤
// 축전기 하나와 같은가.
//
// 두 패널이 나란히 선다 — 왼쪽은 병렬, 오른쪽은 직렬. 같은 전지(같은 V)에 같은 축전기
// (같은 넓이 A · 간격 d) 둘을 이었다. 병렬에서는 두 축전기가 옆으로 다가가 판이 한
// 장으로 붙는다 — **넓이가 합쳐진** 축전기 하나, 전하 표식은 하나일 때의 두 배다.
// 직렬에서는 두 축전기를 잇는 가운데 도체가 얇아져 사라진다 — **간격이 합쳐진**
// 축전기 하나, 전하 표식은 하나일 때의 절반이다. 합치는 동안 표식 수는 바뀌지 않는다
// — 합친 것은 원래 둘과 같은 축전기다.
//
// 이웃과 겹치지 않는 자리 — `parallel-plate-capacitor` 는 한 축전기의 넓이 · 간격을
// 바꿔 담기는 양이 바뀌는 것, `dc-circuit` 은 저항의 직렬 · 병렬 전류다. 이 조각은
// **두 축전기를 합친 모양** 만 한다. 넓이 · 간격을 움직여 전하가 드나드는 장면과
// 전류 · 전압 분배는 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:capacitors-in-circuit` 와 문자 그대로 일치한다 (C4). */
export const CAPACITORS_IN_CIRCUIT_ID = 'capacitors-in-circuit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 전지 전압(V). 두 패널이 같은 값이다. 화면에 `{v} V` 로 뜬다. */
export const VOLTAGE = 6;
/** 축전기 하나의 용량(μF). 도식의 두 기호 아래 `2μF` 로 뜬다 — 두 축전기가 같다는 표식이다. */
export const CAPACITANCE = 2;
/** 축전기 하나를 전지에 곧바로 이었을 때 판 한 장에 담기는 전하 표식 수(= Q). */
export const BASE_MARKS = 4;
/** 판 길이(옆에서 본 넓이 A, 월드 단위). 깊이는 같으므로 길이가 곧 넓이다. */
export const PLATE_LENGTH = 2;
/** 판 간격 d(월드 단위, 안쪽 면 사이). */
export const PLATE_GAP = 1.2;

/**
 * 장면이 그리는 축전기 수 — **구조다, 스테이지 상수가 아니다.** 배치(나란히 둘 ·
 * 한 줄로 둘)가 둘로 짜여 있어, 이 수를 편집할 수 있게 선언하면 쓴 대로 그려지지
 * 않는다 (S-render 「선언만 있고 구현이 없는 필드」). 이름표 `2Q` · `Q/2` · `2A` · `2d`
 * 와 캡션의 배수는 이 수를 `String` 그대로 끼운다.
 */
export const CAPACITOR_COUNT = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 패널이 가로로 나란히 선다.
// ------------------------------------------------------------------------

/** 패널 가운데의 가로 자리 — 왼쪽 병렬, 오른쪽 직렬. */
export const PARALLEL_CX = -5.1;
export const SERIES_CX = 5.4;
/** 패널 가운데에서 축전기 무리의 가운데까지(오른쪽으로). 왼쪽에 전지가 선다. */
export const DEVICE_DX = 0.6;
/** 판 그림의 세로 가운데. */
export const DEVICE_Y = -1.35;
/** 전지 기호의 가로 자리(패널 가운데에서). 기호는 가로로 누운 두 판이다 — 위의 긴 판이 + 다. */
export const BATTERY_DX = -3.4;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;
export const BATTERY_PLATE_GAP = 0.26;
/** 위 · 아래 도선이 가로로 지나는 높이. */
export const WIRE_TOP_Y = 0.75;
export const WIRE_BOTTOM_Y = -3.45;
/** 판 두께(월드 단위). */
export const PLATE_THICKNESS = 0.12;
/** 병렬 — 떨어져 있을 때 두 축전기 사이의 빈 폭. 붙으면 0 이 된다. */
export const PARALLEL_SPACE = 1.3;
/** 직렬 — 두 축전기를 잇는 가운데 도선의 길이. 가운데 도체가 사라지면 0 이 된다. */
export const SERIES_BRIDGE = 0.6;
/** 전하 표식이 판 안쪽 면에서 떨어진 거리 — 전하는 마주 보는 면에 모인다. */
export const MARK_INSET = 0.24;
/** 도식(회로 기호)이 놓이는 세로 자리. 병렬은 두 기호가 위아래로, 직렬은 한 줄로. */
export const SCHEMATIC_Y = 2.5;
/** 병렬 도식에서 두 기호 사이의 세로 간격. */
export const SCHEMATIC_PARALLEL_SPREAD = 1.0;

/**
 * 프레이밍 — 왼쪽 전압 이름표부터 오른쪽 전하 이름표까지, 위의 도식부터 아래 도선과
 * 캡션 띠까지(장부 G24). 두 그림(떨어진 둘 · 합친 하나)이 모두 들어가는 고정값이다
 * (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -10.6, maxX: 9.6, minY: -4.55, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 떨어진 두 축전기를 읽는 동안. */
export const TWO_HOLD = 3.4;
/** 합치는 동안 · 합친 하나를 읽는 동안 · 다시 둘로 가르는 동안. */
export const MERGE = 1.8;
export const MERGED_HOLD = 3.6;
export const SPLIT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const capacitorsInCircuitMessages = Object.freeze({
  'label.title': {
    ko: '축전기의 연결',
    en: 'Connecting capacitors',
    ja: 'コンデンサーの接続',
    zh: '电容器的连接',
    ar: 'توصيل المكثفات',
    es: 'Conexión de condensadores',
    fr: 'Association de condensateurs',
    hi: 'संधारित्रों का संयोजन',
    id: 'Rangkaian kapasitor',
    pt: 'Associação de capacitores',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '직렬과 병렬의 합성',
    en: 'Combining in series and in parallel',
    ja: '直列と並列の合成',
    zh: '串联与并联的合成',
    ar: 'الجمع على التوالي وعلى التوازي',
    es: 'Combinación en serie y en paralelo',
    fr: 'Association en série et en parallèle',
    hi: 'श्रेणीक्रम और पार्श्वक्रम में संयोजन',
    id: 'Penggabungan seri dan paralel',
    pt: 'Associação em série e em paralelo',
  },
  'label.stage': {
    ko: '같은 전지에 같은 축전기 둘',
    en: 'Two equal capacitors on one battery',
    ja: '一つの電池に同じコンデンサー二つ',
    zh: '一个电池上两个相同的电容器',
    ar: 'مكثفان متماثلان على بطارية واحدة',
    es: 'Dos condensadores iguales en una batería',
    fr: 'Deux condensateurs identiques sur une pile',
    hi: 'एक बैटरी पर दो समान संधारित्र',
    id: 'Dua kapasitor identik pada satu baterai',
    pt: 'Dois capacitores iguais em uma bateria',
  },
  'label.view': {
    ko: '옆에서 본 판',
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
  /** 패널 이름. 도식 왼쪽에 붙는다. */
  'label.parallel': {
    ko: '병렬',
    en: 'Parallel',
    ja: '並列',
    zh: '并联',
    ar: 'على التوازي',
    es: 'Paralelo',
    fr: 'Parallèle',
    hi: 'पार्श्वक्रम',
    id: 'Paralel',
    pt: 'Paralelo',
  },
  'label.series': {
    ko: '직렬',
    en: 'Series',
    ja: '直列',
    zh: '串联',
    ar: 'على التوالي',
    es: 'Serie',
    fr: 'Série',
    hi: 'श्रेणीक्रम',
    id: 'Seri',
    pt: 'Série',
  },
  /** 전지 전압 — 값이 끼는 조립이라 문안이다 (C1). */
  'label.voltage': {
    ko: '{v} V',
    en: '{v} V',
    ja: '{v} V',
    zh: '{v} V',
    ar: '{v} V',
    es: '{v} V',
    fr: '{v} V',
    hi: '{v} V',
    id: '{v} V',
    pt: '{v} V',
  },
  /** 넓이 · 간격 · 전하 기호. 수식 표기라 표식이고, 배수는 축전기 수를 vars 로 끼운다. */
  'label.area': {
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
  'label.areaMultiplied': {
    ko: '{n}A',
    en: '{n}A',
    ja: '{n}A',
    zh: '{n}A',
    ar: '{n}A',
    es: '{n}A',
    fr: '{n}A',
    hi: '{n}A',
    id: '{n}A',
    pt: '{n}A',
  },
  'label.gap': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.gapMultiplied': {
    ko: '{n}d',
    en: '{n}d',
    ja: '{n}d',
    zh: '{n}d',
    ar: '{n}d',
    es: '{n}d',
    fr: '{n}d',
    hi: '{n}d',
    id: '{n}d',
    pt: '{n}d',
  },
  'label.chargePlus': {
    ko: '+Q',
    en: '+Q',
    ja: '+Q',
    zh: '+Q',
    ar: '+Q',
    es: '+Q',
    fr: '+Q',
    hi: '+Q',
    id: '+Q',
    pt: '+Q',
  },
  'label.chargeMinus': {
    ko: '−Q',
    en: '−Q',
    ja: '−Q',
    zh: '−Q',
    ar: '−Q',
    es: '−Q',
    fr: '−Q',
    hi: '−Q',
    id: '−Q',
    pt: '−Q',
  },
  'label.chargePlusMultiplied': {
    ko: '+{n}Q',
    en: '+{n}Q',
    ja: '+{n}Q',
    zh: '+{n}Q',
    ar: '+{n}Q',
    es: '+{n}Q',
    fr: '+{n}Q',
    hi: '+{n}Q',
    id: '+{n}Q',
    pt: '+{n}Q',
  },
  'label.chargeMinusMultiplied': {
    ko: '−{n}Q',
    en: '−{n}Q',
    ja: '−{n}Q',
    zh: '−{n}Q',
    ar: '−{n}Q',
    es: '−{n}Q',
    fr: '−{n}Q',
    hi: '−{n}Q',
    id: '−{n}Q',
    pt: '−{n}Q',
  },
  'label.chargePlusDivided': {
    ko: '+Q/{n}',
    en: '+Q/{n}',
    ja: '+Q/{n}',
    zh: '+Q/{n}',
    ar: '+Q/{n}',
    es: '+Q/{n}',
    fr: '+Q/{n}',
    hi: '+Q/{n}',
    id: '+Q/{n}',
    pt: '+Q/{n}',
  },
  'label.chargeMinusDivided': {
    ko: '−Q/{n}',
    en: '−Q/{n}',
    ja: '−Q/{n}',
    zh: '−Q/{n}',
    ar: '−Q/{n}',
    es: '−Q/{n}',
    fr: '−Q/{n}',
    hi: '−Q/{n}',
    id: '−Q/{n}',
    pt: '−Q/{n}',
  },
  'caption.two': {
    ko: '같은 축전기 {n}개, 같은 {v} V 전지 — 나란히 이으면 하나마다 Q, 한 줄로 이으면 하나마다 Q/{n}',
    en: '{n} equal capacitors, one {v} V battery — side by side each holds Q, in a line each holds Q/{n}',
    ja: '同じコンデンサー{n}個と{v} Vの電池一つ — 横に並べてつなぐとそれぞれQ、一列につなぐとそれぞれQ/{n}',
    zh: '{n}个相同的电容器，一个{v} V电池 — 并排连接时每个带Q，连成一串时每个带Q/{n}',
    ar: '{n} مكثفات متماثلة وبطارية واحدة {v} V — عند وصلها جنبًا إلى جنب يحمل كلٌّ منها Q، وعند وصلها في خط واحد يحمل كلٌّ منها Q/{n}',
    es: '{n} condensadores iguales, una batería de {v} V — lado a lado cada uno guarda Q; en fila, cada uno guarda Q/{n}',
    fr: '{n} condensateurs identiques, une pile de {v} V — côte à côte, chacun porte Q ; en ligne, chacun porte Q/{n}',
    hi: '{n} समान संधारित्र, {v} V की एक बैटरी — अगल-बगल जोड़ने पर हर एक पर Q, एक पंक्ति में जोड़ने पर हर एक पर Q/{n}',
    id: '{n} kapasitor identik, satu baterai {v} V — berdampingan masing-masing menyimpan Q, berderet masing-masing menyimpan Q/{n}',
    pt: '{n} capacitores iguais, uma bateria de {v} V — lado a lado cada um guarda Q; em fila, cada um guarda Q/{n}',
  },
  'caption.merge': {
    ko: '나란히 이은 판은 한 장으로 붙고, 한 줄로 이은 가운데 도체는 걷힌다 — 전하 표식은 그대로',
    en: 'The side-by-side plates join into one; the middle conductor of the line fades away — the charges stay put',
    ja: '並べた極板は一枚につながり、一列の真ん中の導体は消えていく — 電荷はそのまま',
    zh: '并排的极板合成一块，串成一行的中间导体渐渐消失 — 电荷保持不动',
    ar: 'تلتحم الألواح المتجاورة في لوح واحد، ويتلاشى الموصل الأوسط في الخط — وتبقى الشحنات في مكانها',
    es: 'Las placas lado a lado se unen en una; el conductor central de la fila se desvanece — las cargas no se mueven',
    fr: 'Les armatures côte à côte se rejoignent en une seule ; le conducteur du milieu de la ligne s’efface — les charges restent en place',
    hi: 'अगल-बगल की प्लेटें जुड़कर एक हो जाती हैं; पंक्ति का बीच वाला चालक मिट जाता है — आवेश अपनी जगह रहते हैं',
    id: 'Pelat yang berdampingan menyatu menjadi satu; konduktor tengah pada deret memudar — muatan tetap di tempatnya',
    pt: 'As placas lado a lado se unem em uma só; o condutor do meio da fila desaparece — as cargas ficam onde estão',
  },
  'caption.merged': {
    ko: '병렬은 넓이가 {n}배인 축전기 하나로 전하 {n}Q, 직렬은 간격이 {n}배인 축전기 하나로 전하 Q/{n}',
    en: 'Parallel acts as one capacitor with {n}× the area, holding {n}Q; series as one with {n}× the gap, holding Q/{n}',
    ja: '並列は面積が {n}× のコンデンサー一つとなって電荷{n}Q、直列は間隔が {n}× のコンデンサー一つとなって電荷Q/{n}',
    zh: '并联相当于面积为 {n}× 的一个电容器，带电{n}Q；串联相当于间距为 {n}× 的一个电容器，带电Q/{n}',
    ar: 'التوازي يعمل كمكثف واحد مساحته {n}× فيحمل {n}Q، والتوالي كمكثف واحد تباعد لوحيه {n}× فيحمل Q/{n}',
    es: 'En paralelo actúa como un condensador con {n}× el área, que guarda {n}Q; en serie, como uno con {n}× la separación, que guarda Q/{n}',
    fr: 'En parallèle, c’est un seul condensateur de surface {n}× plus grande, qui porte {n}Q ; en série, un seul d’écartement {n}× plus grand, qui porte Q/{n}',
    hi: 'पार्श्वक्रम {n}× क्षेत्रफल वाले एक संधारित्र जैसा है, जिस पर {n}Q; श्रेणीक्रम {n}× दूरी वाले एक संधारित्र जैसा, जिस पर Q/{n}',
    id: 'Paralel setara satu kapasitor dengan luas {n}×, menyimpan {n}Q; seri setara satu kapasitor dengan jarak {n}×, menyimpan Q/{n}',
    pt: 'Em paralelo age como um capacitor com {n}× a área, guardando {n}Q; em série, como um com {n}× a distância, guardando Q/{n}',
  },
  'caption.split': {
    ko: '다시 축전기 {n}개로 나뉜다',
    en: 'Back to {n} capacitors',
    ja: 'ふたたびコンデンサー{n}個に分かれる',
    zh: '又分回{n}个电容器',
    ar: 'تنفصل من جديد إلى {n} مكثفات',
    es: 'De nuevo {n} condensadores',
    fr: 'Retour à {n} condensateurs',
    hi: 'फिर से {n} संधारित्र',
    id: 'Kembali menjadi {n} kapasitor',
    pt: 'De volta a {n} capacitores',
  },
} satisfies Record<string, LocalizedText>);

export type CapacitorsInCircuitMessageKey = keyof typeof capacitorsInCircuitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CapacitorsInCircuitMessageKey): LocalizedText => capacitorsInCircuitMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CapacitorsInCircuitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const capacitorsInCircuitSchema: BundleSchema = {
  id: CAPACITORS_IN_CIRCUIT_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 떨어진 둘 → 합친 하나 → 다시 둘, 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'two-capacitors',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        capacitance: CAPACITANCE,
        baseMarks: BASE_MARKS,
        plateLength: PLATE_LENGTH,
        plateGap: PLATE_GAP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 두 패널이 옆으로 놓인다. 세로는 도식 한 줄 · 판 그림 · 캡션 줄. */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침은 scene 에 쓴 순서 — 도선 위에 판, 그 위에 전하 표식, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떨어진 둘 → 합침 → 합친 하나 → 다시 둘. 끝이 처음과 같은 그림이라
   * 흐려짐 없이 다음 주기로 잇는다. 판이 움직이는 단계는 `smooth` 로 선언한다.
   */
  timeline: {
    phases: [
      { id: 'two', duration: TWO_HOLD, caption: key('caption.two') },
      { id: 'merge', duration: MERGE, ease: 'smooth', caption: key('caption.merge') },
      { id: 'merged', duration: MERGED_HOLD, caption: key('caption.merged') },
      { id: 'split', duration: SPLIT, ease: 'smooth', caption: key('caption.split') },
    ],
  },

  /** 도착한 순간 두 축전기가 놓여 있고, 곧(2 초 뒤) 합치기 시작한다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  // 배수 · 전압은 state 에 옮겨 둔 선언값의 글자를 끼운다(장부 G133 우회로).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 820,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n: 'count', v: 'voltage' },
  },

  messages: capacitorsInCircuitMessages,
};
