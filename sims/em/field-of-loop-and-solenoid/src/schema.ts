// ========================================================================
// field-of-loop-and-solenoid — 선언
// ========================================================================
// 질문: 전류가 흐르는 고리 하나가 만드는 자기장과, 그런 고리를 여러 개 나란히 겹친
// 솔레노이드의 자기장은 어떻게 다른가.
//
// 고리 축을 품은 단면을 본다. 고리 하나의 장은 고리 속을 지나며 가운데로 모였다가
// 곧바로 벌어져 밖으로 돌아 나간다. 고리를 3개, 9개로 나란히 겹치면 안쪽 선이 곧게
// 펴져 나란히 촘촘해지고(고르고 세다), 바깥은 선이 성기고 화살표가 짧아진다(약하다).
//
// 식은 쓰지 않는다 — 안쪽 선이 나란히 촘촘해지는 모양으로만 말한다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:field-of-loop-and-solenoid` 와 문자 그대로 일치한다 (C4). */
export const FIELD_OF_LOOP_AND_SOLENOID_ID = 'field-of-loop-and-solenoid';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// 코드는 `physics.readConstants` 로 이 기본값과 함께 읽는다.
// ------------------------------------------------------------------------

/** 고리 반지름(월드 단위). 단면에서 축과 도선 사이 거리다. */
export const LOOP_RADIUS = 1;
/** 고리마다 흐르는 전류(μ₀I/2π 를 1 로 잡은 단위). 모든 고리에 같다. */
export const LOOP_CURRENT = 1;
/** 나란히 겹친 고리 사이 간격(월드). */
export const LOOP_SPACING = 0.5;
/** 세 판의 고리 수 — 하나 → 몇 개 → 많이. */
export const LOOPS_ONE = 1;
export const LOOPS_FEW = 3;
export const LOOPS_MANY = 9;
/**
 * 장선 한 가닥이 맡는 몫. 가운데 단면(축에 수직인 면)을 따라 축에서부터 축 방향 장을
 * 더해 가며 이 값이 찰 때마다 한 가닥을 둔다 — 장이 셀수록 선이 촘촘하다.
 */
export const FLUX_STEP = 0.9;
/** 장선 씨앗을 두는 가장 먼 자리(고리 반지름에 대한 비). 도선에 바짝 붙어 도는 작은 고리는 두지 않는다. */
export const SEED_REACH = 0.75;
/** 장선 추적 한 걸음(월드). */
export const TRACE_STEP = 0.02;
/** 장 세기 → 화살표 길이(월드) 배율. 표시 배율이다. */
export const ARROW_SCALE = 0.05;
/** 화살표 길이 상한(월드). 도선 가까이서 비례가 끊긴다. */
export const ARROW_MAX = 0.6;
/** 화살표 격자의 가로 간격과 가장 먼 가로 자리(월드). */
export const ARROW_STEP = 0.7;
export const ARROW_SPAN = 3.5;
/** 화살표 줄 — 안쪽(축 위 · 축에서 이만큼) · 바깥(축에서 이만큼). */
export const ARROW_ROW_INNER = 0.5;
export const ARROW_ROW_OUTER = 1.6;
/** 도선에서 이보다 가까운 격자 자리에는 화살표를 두지 않는다(월드). */
export const ARROW_CLEAR = 0.28;
/** 고리 윤곽(세로 타원)의 가로 반폭 — 고리를 비스듬히 본 3D 투영의 몫(월드). */
export const LOOP_TILT = 0.12;
/** 단면 기호(⊙ · ⊗) 원의 반지름(월드). */
export const WIRE_MARK = 0.1;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 고리 하나. */
export const ONE = 3.4;
/** 고리를 더 놓는 동안 — 새 고리의 전류가 0 에서 오른다. */
export const ADD_FEW = 1.3;
/** 고리 몇 개. */
export const FEW = 3.4;
/** 고리를 더 겹치는 동안. */
export const ADD_MANY = 1.5;
/** 고리 많이 — 솔레노이드. */
export const MANY = 4.6;
/** 처음으로 돌아가는 동안 — 더한 고리의 전류가 0 으로 내린다. */
export const RESET = 1.3;

// ------------------------------------------------------------------------
// 프레이밍 — 고정값 (원칙 6 · S-piece)
// ------------------------------------------------------------------------

/**
 * 가장 긴 솔레노이드(9개 · 간격 0.5 → 길이 4)의 양 끝에서 선이 벌어져 돌아 나가는 자리와
 * 그 아래 캡션 줄. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -2.45, maxY: 1.95 } as const;
/** 장선을 긋는 사각형 — 캡션 줄 위에서 끊는다. 가로는 넓은 임베드의 양옆까지 채운다. */
export const FIELD_CLIP = { min: [-7, -2.0], max: [7, 1.95] } as const;
/** 장선 추적을 멈추는 사각형. 긋는 사각형보다 조금 넓다. */
export const TRACE_BOX = { minX: -7.5, maxX: 7.5, minY: -2.7, maxY: 2.7 } as const;

/** 캡션 글자 크기 · 줄바꿈 폭 · 바닥에서 띄움(화면 px), 페이드(초). */
export const CAPTION_PX = 13;
export const CAPTION_WRAP_PX = 760;
export const CAPTION_LIFT_PX = -4;
export const CAPTION_FADE_S = 0.25;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fieldOfLoopAndSolenoidMessages = Object.freeze({
  'label.title': {
    ko: '고리와 솔레노이드',
    en: 'Loop and solenoid',
    ja: '円形コイルとソレノイド',
    zh: '线圈与螺线管',
    ar: 'الحلقة والملف اللولبي',
    es: 'Espira y solenoide',
    fr: 'Spire et solénoïde',
    hi: 'लूप और परिनालिका',
    id: 'Kawat melingkar dan solenoida',
    pt: 'Espira e solenoide',
  },
  'label.operation': {
    ko: '축 위의 자기장',
    en: 'The magnetic field along the axis',
    ja: '軸上の磁場',
    zh: '轴线上的磁场',
    ar: 'المجال المغناطيسي على امتداد المحور',
    es: 'El campo magnético a lo largo del eje',
    fr: 'Le champ magnétique le long de l’axe',
    hi: 'अक्ष के अनुदिश चुंबकीय क्षेत्र',
    id: 'Medan magnet di sepanjang sumbu',
    pt: 'O campo magnético ao longo do eixo',
  },
  'label.stage': {
    ko: '고리 겹치기',
    en: 'Stacking loops',
    ja: 'コイルを重ねる',
    zh: '叠加线圈',
    ar: 'تكديس الحلقات',
    es: 'Apilar espiras',
    fr: 'Empiler des spires',
    hi: 'लूप जोड़ते जाना',
    id: 'Menumpuk kawat melingkar',
    pt: 'Empilhando espiras',
  },
  'label.view': {
    ko: '축을 품은 단면',
    en: 'Cross-section through the axis',
    ja: '軸を含む断面',
    zh: '过轴线的截面',
    ar: 'مقطع يمر بالمحور',
    es: 'Sección que contiene el eje',
    fr: 'Coupe passant par l’axe',
    hi: 'अक्ष से होकर जाता अनुप्रस्थ काट',
    id: 'Penampang melalui sumbu',
    pt: 'Corte que passa pelo eixo',
  },
  'caption.one': {
    ko: '고리 {one}개를 축을 따라 자른 면 — 고리 속을 지난 선이 곧바로 벌어져 밖으로 돌아 나간다',
    en: '{one} loop, cut along its axis — lines squeeze through the loop, then spread straight back out',
    ja: 'コイル {one} 個を軸に沿って切った面 — 線はコイルの中を狭く抜け、すぐに広がって外へ戻る',
    zh: '沿轴线剖开的 {one} 个线圈 — 线从线圈中挤过，随即散开绕回外面',
    ar: '{one} حلقة مقطوعة على امتداد محورها — تنضغط الخطوط عبر الحلقة ثم تنتشر فورًا عائدةً إلى الخارج',
    es: '{one} espira, cortada a lo largo de su eje — las líneas se estrechan al pasar por la espira y enseguida se abren hacia fuera',
    fr: '{one} spire, coupée le long de son axe — les lignes se resserrent dans la spire puis s’écartent aussitôt vers l’extérieur',
    hi: '{one} लूप, अपने अक्ष के साथ कटा हुआ — रेखाएँ लूप के भीतर से सिकुड़कर गुज़रती हैं, फिर तुरंत फैलकर बाहर लौटती हैं',
    id: '{one} kawat melingkar, dipotong sepanjang sumbunya — garis-garis berdesakan melewati lingkaran, lalu langsung menyebar kembali keluar',
    pt: '{one} espira, cortada ao longo do eixo — as linhas se espremem pela espira e logo se abrem de volta para fora',
  },
  'caption.addFew': {
    ko: '같은 고리를 양옆에 나란히 놓아 {few}개로',
    en: 'Place identical loops side by side — {few} in all',
    ja: '同じコイルを横に並べる — 全部で {few} 個',
    zh: '把相同的线圈并排放置 — 共 {few} 个',
    ar: 'توضع حلقات متطابقة جنبًا إلى جنب — {few} في المجموع',
    es: 'Se colocan espiras idénticas una al lado de otra — {few} en total',
    fr: 'On place des spires identiques côte à côte — {few} en tout',
    hi: 'एक जैसे लूप अगल-बगल रखे जाते हैं — कुल {few}',
    id: 'Kawat melingkar yang sama diletakkan berdampingan — {few} seluruhnya',
    pt: 'Coloque espiras idênticas lado a lado — {few} ao todo',
  },
  'caption.few': {
    ko: '고리 {few}개 — 안쪽 선이 곧게 펴지고 더 촘촘해진다',
    en: '{few} loops — the lines inside straighten out and crowd closer',
    ja: 'コイル {few} 個 — 内側の線がまっすぐになり、さらに密になる',
    zh: '{few} 个线圈 — 内部的线变直，也更密集',
    ar: '{few} حلقات — تستقيم الخطوط في الداخل وتتقارب أكثر',
    es: '{few} espiras — las líneas del interior se enderezan y se apiñan más',
    fr: '{few} spires — à l’intérieur, les lignes se redressent et se resserrent',
    hi: '{few} लूप — भीतर की रेखाएँ सीधी होकर और घनी हो जाती हैं',
    id: '{few} kawat melingkar — garis-garis di dalam menjadi lurus dan makin rapat',
    pt: '{few} espiras — as linhas de dentro se endireitam e ficam mais juntas',
  },
  'caption.addMany': {
    ko: '고리를 더 겹쳐 {many}개로',
    en: 'Stack more loops — {many} in all',
    ja: 'さらにコイルを重ねる — 全部で {many} 個',
    zh: '再叠加更多线圈 — 共 {many} 个',
    ar: 'تُكدَّس حلقات أخرى — {many} في المجموع',
    es: 'Se apilan más espiras — {many} en total',
    fr: 'On empile d’autres spires — {many} en tout',
    hi: 'और लूप जोड़े जाते हैं — कुल {many}',
    id: 'Lebih banyak kawat melingkar ditumpuk — {many} seluruhnya',
    pt: 'Mais espiras empilhadas — {many} ao todo',
  },
  'caption.many': {
    ko: '고리 {many}개 — 안쪽은 곧은 선이 고르게 늘어서고 화살표가 한결같다. 바깥은 선이 성기고 화살표가 짧다',
    en: '{many} loops — inside, straight evenly spaced lines and matching arrows; outside, sparse lines and short arrows',
    ja: 'コイル {many} 個 — 内側はまっすぐな線が等間隔に並び、矢印がそろう。外側は線がまばらで矢印が短い',
    zh: '{many} 个线圈 — 内部是等间距的直线和一致的箭头；外部线稀疏、箭头短',
    ar: '{many} حلقة — في الداخل خطوط مستقيمة متساوية التباعد وأسهم متماثلة؛ وفي الخارج خطوط متفرقة وأسهم قصيرة',
    es: '{many} espiras — dentro, líneas rectas equiespaciadas y flechas iguales; fuera, líneas escasas y flechas cortas',
    fr: '{many} spires — à l’intérieur, des lignes droites régulièrement espacées et des flèches identiques ; à l’extérieur, des lignes clairsemées et des flèches courtes',
    hi: '{many} लूप — भीतर सीधी, समान दूरी वाली रेखाएँ और एक जैसे तीर; बाहर विरल रेखाएँ और छोटे तीर',
    id: '{many} kawat melingkar — di dalam, garis lurus berjarak sama dan panah yang seragam; di luar, garis jarang dan panah pendek',
    pt: '{many} espiras — dentro, linhas retas igualmente espaçadas e setas iguais; fora, linhas esparsas e setas curtas',
  },
  'caption.reset': {
    ko: '다시 고리 {one}개로',
    en: 'Back to {one} loop',
    ja: 'コイル {one} 個に戻る',
    zh: '回到 {one} 个线圈',
    ar: 'العودة إلى {one} حلقة',
    es: 'De vuelta a {one} espira',
    fr: 'Retour à {one} spire',
    hi: 'फिर से {one} लूप',
    id: 'Kembali ke {one} kawat melingkar',
    pt: 'De volta a {one} espira',
  },
} satisfies Record<string, LocalizedText>);

export type FieldOfLoopAndSolenoidMessageKey = keyof typeof fieldOfLoopAndSolenoidMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FieldOfLoopAndSolenoidMessageKey): LocalizedText => fieldOfLoopAndSolenoidMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FieldOfLoopAndSolenoidMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fieldOfLoopAndSolenoidSchema: BundleSchema = {
  id: FIELD_OF_LOOP_AND_SOLENOID_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 고리가 하나 → 몇 개 → 많이 로 늘었다가 돌아간다.
  parameters: [],

  stages: [
    {
      id: 'stacking',
      label: text('label.stage'),
      constants: {
        loopRadius: LOOP_RADIUS,
        loopCurrent: LOOP_CURRENT,
        loopSpacing: LOOP_SPACING,
        loopsOne: LOOPS_ONE,
        loopsFew: LOOPS_FEW,
        loopsMany: LOOPS_MANY,
        fluxStep: FLUX_STEP,
        seedReach: SEED_REACH,
        traceStep: TRACE_STEP,
        arrowScale: ARROW_SCALE,
        arrowMax: ARROW_MAX,
        arrowStep: ARROW_STEP,
        arrowSpan: ARROW_SPAN,
        arrowRowInner: ARROW_ROW_INNER,
        arrowRowOuter: ARROW_ROW_OUTER,
        arrowClear: ARROW_CLEAR,
        loopTilt: LOOP_TILT,
        wireMark: WIRE_MARK,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /**
   * 한 주기 = 고리 하나 → 더 놓기 → 몇 개 → 더 겹치기 → 많이 → 돌아가기.
   *
   * 더 놓는 단계는 새 고리의 전류가 0 에서 오르는 동안이다 — 장은 전류에 비례해 겹치므로
   * 화살표는 두 배치 사이를 진행도만큼 옮겨 가고, 새 고리의 단면 기호가 같은 진행도로 짙어진다.
   */
  timeline: {
    phases: [
      { id: 'one', duration: ONE, caption: key('caption.one') },
      { id: 'addFew', duration: ADD_FEW, ease: 'smooth', caption: key('caption.addFew') },
      { id: 'few', duration: FEW, caption: key('caption.few') },
      { id: 'addMany', duration: ADD_MANY, ease: 'smooth', caption: key('caption.addMany') },
      { id: 'many', duration: MANY, caption: key('caption.many') },
      { id: 'reset', duration: RESET, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 고리 하나의 장이 서 있다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, CAPTION_LIFT_PX] },
    fontSize: CAPTION_PX,
    wrapWidth: CAPTION_WRAP_PX,
    fade: CAPTION_FADE_S,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 고리 수는 스테이지 상수의 글자다 (state.ts, G133 우회).
    vars: { one: 'oneText', few: 'fewText', many: 'manyText' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 선의 모양과 간격이다.

  messages: fieldOfLoopAndSolenoidMessages,
};
