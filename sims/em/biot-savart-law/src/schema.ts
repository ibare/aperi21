// ========================================================================
// biot-savart-law — 선언
// ========================================================================
// 질문: 휜 도선이 한 점에 만드는 자기장은 어디서 오는가.
//
// 전류가 도는 원형 고리를 조각으로 나누고 조각을 하나씩 켠다. 켜진 조각은 고리 축 위의
// 관측점 P 에 작은 장 dB 를 만든다. 그 화살표를 앞 화살표 끝에 이어 붙이면(머리-꼬리)
// 위쪽 반 조각의 dB 는 위로, 아래쪽 반 조각의 dB 는 아래로 기울어 있어 사슬이 아치를
// 그리며 축으로 되돌아온다. 기운 몫은 서로 지워지고, 합 B 는 축을 따라 곧게 선다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:biot-savart-law` 와 문자 그대로 일치한다 (C4). */
export const BIOT_SAVART_LAW_ID = 'biot-savart-law';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 고리를 나누는 조각 수. 짝수면 위 · 아래 반이 조각 경계에서 갈린다. */
export const PIECES = 12;
/** 고리에 흐르는 전류(임의 단위). 모든 dB 에 똑같이 곱해진다. */
export const CURRENT = 1;
/** 고리 반지름(월드 m). */
export const RING_RADIUS = 1;
/** 고리 중심에서 축을 따라 관측점 P 까지의 거리(월드 m). */
export const AXIAL_DISTANCE = 1;
/**
 * 표시 배율 — 장(비오-사바르 적분의 한 몫, 상수 μ₀/4π 를 1 로 둔 값)을 화살표 월드 길이로
 * 바꾸는 배율. 모든 조각 · 합에 같은 배율이라 길이의 비는 장의 비 그대로다.
 */
export const FIELD_TO_LENGTH = 1.4;
/**
 * 시점 — 수직축 둘레로 돌려 보는 각(도). 0 이면 고리가 옆선 하나로 보이고, 크게 하면
 * 축 방향 몫이 짧아져 사슬이 뒤로 감긴다. 30° 에서 모든 dB 가 화면 오른쪽으로 나아간다.
 */
export const VIEW_YAW_DEG = 30;
/**
 * 첫 조각이 시작하는 자리(도). 고리 위 각 φ 는 위쪽 꼭대기가 0, 보는 사람 쪽이 +90° 다.
 * −90°(뒤쪽 옆)에서 시작하면 앞의 반이 고리의 위쪽 반, 뒤의 반이 아래쪽 반이 된다.
 */
export const START_ANGLE_DEG = -90;

// ------------------------------------------------------------------------
// 배치 — 월드 m. 고리 중심이 원점, 축이 화면 가로다.
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 고리(가로 ±0.5 · 세로 ±1)와 전류 표식 I 부터, 축 위 P 에서
 * 오른쪽으로 뻗는 사슬 끝(약 3.6)과 합 B 의 이름표까지, 세로는 사슬 아치 꼭대기(약 1.0)와
 * 고리 아래 · 캡션 줄까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.9, maxX: 4.0, minY: -1.35, maxY: 1.2 } as const;

/** 축 점선이 뻗는 가로 범위(축 좌표 a, 월드 m). 고리 속에서 사슬 끝 너머까지 — 고리 밖 왼쪽은 전류 표식 I 의 자리다. */
export const AXIS_FROM = -0.4;
export const AXIS_TO = 4.3;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 고리와 조각 경계, P 가 보이는 동안. */
export const SHOW = 1.8;
/** 앞 반(위쪽 조각) · 뒤 반(아래쪽 조각)을 하나씩 켜는 동안. 둘이 같아야 경계가 조각 수의 절반이다. */
export const ADD_HALF = 4.2;
/** 합 B 가 P 에서 뻗어 나가는 동안. */
export const SUM = 1.2;
/** 다 이은 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const biotSavartLawMessages = Object.freeze({
  'label.title': {
    ko: '비오-사바르 법칙',
    en: 'Biot–Savart law',
    ja: 'ビオ・サバールの法則',
    zh: '毕奥–萨伐尔定律',
    ar: 'قانون بيو–سافار',
    es: 'Ley de Biot–Savart',
    fr: 'Loi de Biot–Savart',
    hi: 'बायो–सावर्ट नियम',
    id: 'Hukum Biot–Savart',
    pt: 'Lei de Biot–Savart',
  },
  'label.operation': {
    ko: '전류 요소가 만드는 자기장',
    en: 'The magnetic field of current elements',
    ja: '電流素片がつくる磁場',
    zh: '电流元产生的磁场',
    ar: 'المجال المغناطيسي لعناصر التيار',
    es: 'El campo magnético de los elementos de corriente',
    fr: 'Le champ magnétique des éléments de courant',
    hi: 'धारा अवयवों का चुंबकीय क्षेत्र',
    id: 'Medan magnet elemen-elemen arus',
    pt: 'O campo magnético dos elementos de corrente',
  },
  'label.stage': {
    ko: '고리 축 위의 점',
    en: 'A point on the loop axis',
    ja: '円形電流の軸上の点',
    zh: '圆环轴线上的一点',
    ar: 'نقطة على محور الحلقة',
    es: 'Un punto en el eje de la espira',
    fr: 'Un point sur l’axe de la spire',
    hi: 'लूप के अक्ष पर एक बिंदु',
    id: 'Sebuah titik pada sumbu kawat melingkar',
    pt: 'Um ponto no eixo da espira',
  },
  'label.view': {
    ko: '비스듬히 본 고리',
    en: 'Loop seen at an angle',
    ja: '斜めから見た円形電流',
    zh: '斜看圆环',
    ar: 'الحلقة منظورًا إليها بزاوية',
    es: 'Espira vista en ángulo',
    fr: 'Spire vue de biais',
    hi: 'तिरछे देखा गया लूप',
    id: 'Kawat melingkar dilihat miring',
    pt: 'Espira vista em ângulo',
  },
  /** 도식 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.point': {
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
  'label.current': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'label.pieceField': {
    ko: 'dB',
    en: 'dB',
    ja: 'dB',
    zh: 'dB',
    ar: 'dB',
    es: 'dB',
    fr: 'dB',
    hi: 'dB',
    id: 'dB',
    pt: 'dB',
  },
  'label.totalField': {
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
  'caption.divide': {
    ko: '전류가 도는 고리를 {n} 조각으로 나눈다',
    en: 'The current loop is cut into {n} pieces',
    ja: '電流が流れる円形の導線を {n} 個の小片に分ける',
    zh: '把通电圆环分成 {n} 小段',
    ar: 'تُقسَّم حلقة التيار إلى {n} قطعة',
    es: 'La espira con corriente se divide en {n} trozos',
    fr: 'La spire parcourue par le courant est découpée en {n} morceaux',
    hi: 'धारा वाले लूप को {n} टुकड़ों में बाँटा जाता है',
    id: 'Kawat melingkar berarus dipotong menjadi {n} bagian',
    pt: 'A espira com corrente é dividida em {n} pedaços',
  },
  'caption.upper': {
    ko: '조각 하나가 P 에 만든 작은 장을 앞 화살표 끝에 잇는다 — 위쪽 조각의 장은 위로 기운다',
    en: 'Each piece’s small field at P is placed at the tip of the last arrow — upper pieces tilt it upward',
    ja: '各小片が P につくる小さな磁場を、前の矢印の先につなぐ — 上側の小片の磁場は上に傾く',
    zh: '每一小段在 P 处产生的小磁场接在前一个箭头的末端 — 上半部分小段的磁场向上倾斜',
    ar: 'يُوضع المجال الصغير لكل قطعة عند P على رأس السهم السابق — القطع العلوية تميله إلى الأعلى',
    es: 'El pequeño campo de cada trozo en P se coloca en la punta de la flecha anterior — los trozos de arriba lo inclinan hacia arriba',
    fr: 'Le petit champ de chaque morceau en P est placé au bout de la flèche précédente — les morceaux du haut l’inclinent vers le haut',
    hi: 'हर टुकड़े का P पर बना छोटा क्षेत्र पिछले तीर की नोक पर जोड़ा जाता है — ऊपरी टुकड़े उसे ऊपर की ओर झुकाते हैं',
    id: 'Medan kecil tiap bagian di P diletakkan di ujung panah sebelumnya — bagian atas memiringkannya ke atas',
    pt: 'O pequeno campo de cada pedaço em P é colocado na ponta da seta anterior — os pedaços de cima o inclinam para cima',
  },
  'caption.lower': {
    ko: '아래쪽 조각의 장은 아래로 기울어, 이어 붙인 화살표가 축으로 되돌아온다',
    en: 'Lower pieces tilt it downward, and the chain of arrows comes back to the axis',
    ja: '下側の小片は磁場を下に傾け、つないだ矢印の列が軸に戻ってくる',
    zh: '下半部分小段使磁场向下倾斜，箭头链又回到轴线上',
    ar: 'القطع السفلية تميله إلى الأسفل، فتعود سلسلة الأسهم إلى المحور',
    es: 'Los trozos de abajo lo inclinan hacia abajo, y la cadena de flechas vuelve al eje',
    fr: 'Les morceaux du bas l’inclinent vers le bas, et la chaîne de flèches revient sur l’axe',
    hi: 'निचले टुकड़े उसे नीचे की ओर झुकाते हैं, और तीरों की शृंखला अक्ष पर लौट आती है',
    id: 'Bagian bawah memiringkannya ke bawah, dan rantai panah kembali ke sumbu',
    pt: 'Os pedaços de baixo o inclinam para baixo, e a cadeia de setas volta ao eixo',
  },
  'caption.sum': {
    ko: '옆으로 기운 몫은 모두 지워지고, 합한 장 B 는 축을 따라 곧게 뻗는다',
    en: 'The sideways tilts all cancel, and the total field B points straight along the axis',
    ja: '横向きの傾きはすべて打ち消し合い、合成磁場 B は軸に沿ってまっすぐ向く',
    zh: '侧向的倾斜全部抵消，总磁场 B 沿轴线笔直指向',
    ar: 'تتلاشى الميول الجانبية كلها، ويشير المجال الكلي B مستقيمًا على امتداد المحور',
    es: 'Las inclinaciones laterales se anulan todas, y el campo total B apunta recto a lo largo del eje',
    fr: 'Les inclinaisons latérales s’annulent toutes, et le champ total B pointe droit le long de l’axe',
    hi: 'बगल की ओर के सारे झुकाव कट जाते हैं, और कुल क्षेत्र B अक्ष के साथ सीधा इंगित करता है',
    id: 'Kemiringan ke samping semuanya saling meniadakan, dan medan total B mengarah lurus sepanjang sumbu',
    pt: 'As inclinações laterais se cancelam todas, e o campo total B aponta reto ao longo do eixo',
  },
} satisfies Record<string, LocalizedText>);

export type BiotSavartLawMessageKey = keyof typeof biotSavartLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BiotSavartLawMessageKey): LocalizedText => biotSavartLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BiotSavartLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const biotSavartLawSchema: BundleSchema = {
  id: BIOT_SAVART_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 조각이 하나씩 켜지며 사슬이 자라고, 합이 서고, 다시 시작한다.
  parameters: [],

  stages: [
    {
      id: 'on-axis',
      label: text('label.stage'),
      constants: {
        pieces: PIECES,
        current: CURRENT,
        ringRadius: RING_RADIUS,
        axialDistance: AXIAL_DISTANCE,
        fieldToLength: FIELD_TO_LENGTH,
        viewYawDeg: VIEW_YAW_DEG,
        startAngleDeg: START_ANGLE_DEG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'oblique', label: text('label.view'), default: true }],

  /** 가로로 뻗는 사슬 하나와 고리 하나 — 세로는 고리 지름과 캡션 줄이면 된다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 고리의 뒤쪽 반은 옅게 먼저, 사슬은 그 위에, 지금 켜진 조각의
   * dB 는 사슬 맨 위에 와야 새로 붙는 화살표가 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나눔 → 위쪽 반 켜기 → 아래쪽 반 켜기 → 합 → 읽기 → 흐려짐.
   *
   * 조각 i 가 켜지는 시각은 `add-upper` 시작부터 `add-lower` 끝까지를 조각 수로 고르게 나눈
   * 자리다. 두 단계 길이가 같으므로 캡션이 바뀌는 경계는 언제나 조각 수의 절반이다.
   */
  timeline: {
    phases: [
      { id: 'show', duration: SHOW, caption: key('caption.divide') },
      { id: 'add-upper', duration: ADD_HALF, caption: key('caption.upper') },
      { id: 'add-lower', duration: ADD_HALF, caption: key('caption.lower') },
      { id: 'sum', duration: SUM, ease: 'smooth', caption: key('caption.sum') },
      { id: 'hold', duration: HOLD, caption: key('caption.sum') },
      { id: 'fade', duration: FADE, caption: key('caption.sum') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 위쪽 조각 몇 개가 이어 붙은 자리에서 연다.
   * 0 이면 빈 고리만 보이고 사슬이 없다.
   */
  startAt: 3.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 조각 수는 스테이지 상수의 글자다 — `initialState` 가 state 에 옮겨 둔다 (G133). */
    vars: { n: 'pieces' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **방향**이다 — 화살표가 위로
   * 기우는지 아래로 기우는지, 합이 축 위에 놓이는지는 축 점선 하나가 기준이 된다.
   */

  messages: biotSavartLawMessages,
};
