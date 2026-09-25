// ========================================================================
// angle-of-friction — 선언
// ========================================================================
// 질문: 무거운 물건은 더 세게 눌리니 더 기울여야 미끄러지지 않을까?
//
// 동사: **같은 각에서 함께 미끄러진다.** 같은 재질의 판 위에 상자 1개와 같은 상자 N개
// 더미를 올리고 판을 기울이면, 둘은 같은 프레임에 같은 각에서 미끄러지기 시작한다.
//
// 힘 화살표 · μ 숫자 · 공식 · 질량 숫자는 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:angle-of-friction` 와 문자 그대로 일치한다 (C4). */
export const ANGLE_OF_FRICTION_ID = 'angle-of-friction';

// ------------------------------------------------------------------------
// 물리 상수 — 원본 그대로
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). 원본 `G`. */
export const G = 9.8;
/** 정지 마찰 계수 — 두 상자가 같은 재질. 원본 `MU_S`. */
export const MU_S = 0.5;
/** 운동 마찰 계수. 원본 `MU_K`. */
export const MU_K = 0.35;
/** 미끄러지기 시작하는 각(도) — tanθ = μs. 원본 `THETA_S` (26.565…°). */
export const THETA_S_DEG = (Math.atan(MU_S) * 180) / Math.PI;
/** 판 위 1 m 가 원본 몇 px 인지. 원본 `PX_PER_M`. */
export const PX_PER_M = 200;

/** 도착했을 때 이미 이만큼 기울어 있다(도). 원본 `START_DEG`. */
export const START_DEG = 12;
/** 기울이는 빠르기(도/초). 원본 `TILT_RATE`. */
export const TILT_RATE = 4;
/**
 * 기울이는 단계의 길이(초) — 12° 에서 마찰각까지 4°/s. 원본은 각이 문턱에 닿는 순간
 * 단계를 넘겼으므로 그 시각을 길이로 옮긴다 (≈ 3.641 초).
 */
export const TILT_SECONDS = (THETA_S_DEG - START_DEG) / TILT_RATE;
/** 원본 `REST_END` — 주기 안에서 미끄러진 뒤 멈춰 보여 주기가 끝나는 시각. */
const REST_END = 7.2;

/** 건드리지 않으면 이 순서로 더미 수를 바꾼다. 원본 `AUTO_SEQ`. */
export const AUTO_SEQ = [3, 5, 2, 4] as const;
/** 기록은 최근 이만큼만 남긴다. 원본 4줄. */
export const RECORD_MAX = 4;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 860 × 290 px 의 상수를 그대로 두고 한 배율로 월드로 옮긴다
// ------------------------------------------------------------------------

/**
 * 숫자는 원본 그대로다. **1 월드 단위 = 원본 100 px**, 경첩(PIVOT)이 월드 원점이고
 * y 는 위가 +.
 */
export const LAYOUT = {
  widthPx: 860,
  heightPx: 290,
  /** PIVOT — 경첩. */
  pivotXPx: 110,
  pivotYPx: 252,
  /** 바닥선 양 끝 x. */
  floorX0Px: 40,
  floorX1Px: 820,
  /** ARC_R — 각도 호 반지름. */
  arcRPx: 110,
  /** 각도 숫자 — 호 끝 아래로 띄우는 거리(글 윗변 기준)와 글자 크기. */
  angleLabelDyPx: 6,
  angleLabelFontPx: 15,
  /** 미끄러진 각 눈금 — 호 안팎으로 뻗는 길이. */
  slipTickHalfPx: 12,
  /** BOARD_LEN · BOARD_THICK — 나무판. */
  boardLenPx: 560,
  boardThickPx: 10,
  /** STOPPER — 아래 끝 턱의 두께와 높이. */
  stopperPx: 6,
  stopperHPx: 16,
  /** 받침대 — 판 끝에서 안쪽으로, 판 아래로 띄우는 거리. */
  postInsetPx: 6,
  postDropPx: 12,
  /** 경첩 반지름. */
  hingeRPx: 5,
  /** BOX — 상자 한 변. */
  boxPx: 28,
  /** HEAVY_S0 · LIGHT_S0 — 판 위 처음 자리(경첩에서 판을 따라 잰 거리). */
  heavyS0Px: 170,
  lightS0Px: 400,
  /** 기록 — 왼쪽 위 자리, 제목 뒤 첫 줄까지, 줄 간격, 값의 오른쪽 끝까지. */
  recordX0Px: 672,
  recordY0Px: 34,
  recordFirstDyPx: 26,
  recordRowPx: 24,
  recordValueDxPx: 160,
  recordTitleFontPx: 13,
  recordRowFontPx: 15,
  /** 캡션 글자 크기. */
  captionFontPx: 16,
} as const;

/** 월드 한 단위 = 원본 100 px. */
export const PX_PER_UNIT = 100;

/** 원본의 가로 px(캔버스 왼쪽 기준)를 월드 x 로. 경첩이 0 이다. */
export function worldX(px: number): number {
  return (px - LAYOUT.pivotXPx) / PX_PER_UNIT;
}

/** 원본의 캔버스 y(아래로 증가)를 월드 y(위로 증가)로. 경첩이 0 이다. */
export function worldY(px: number): number {
  return (LAYOUT.pivotYPx - px) / PX_PER_UNIT;
}

/** 원본의 길이 px 를 월드 길이로. */
export function toUnit(px: number): number {
  return px / PX_PER_UNIT;
}

/**
 * 프레이밍 — 원본 캔버스 860 × 290 px 그대로. 매 프레임 같은 값이다 (S-piece).
 * 캡션은 경계에 넣지 않는다 — 러너가 둘레에 두는 여백 아래에 선다.
 */
export const SCENE_BOUNDS = {
  minX: worldX(0),
  maxX: worldX(LAYOUT.widthPx),
  minY: worldY(LAYOUT.heightPx),
  maxY: worldY(0),
} as const;

// ------------------------------------------------------------------------
// 조작기
// ------------------------------------------------------------------------

/** 무거운 쪽 상자 수. 원본 `min=2 max=5 step=1`. */
export const STACK_RANGE: [number, number] = [2, 5];
export const STACK_STEP = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const angleOfFrictionMessages = Object.freeze({
  'label.title': {
    ko: '마찰각',
    en: 'Angle of friction',
    ja: '摩擦角',
    zh: '摩擦角',
    ar: 'زاوية الاحتكاك',
    es: 'Ángulo de rozamiento',
    fr: 'Angle de frottement',
    hi: 'घर्षण कोण',
    id: 'Sudut gesek',
    pt: 'Ângulo de atrito',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '미끄러지기 시작하는 경사',
    en: 'The slope at which sliding begins',
    ja: 'すべり始める傾き',
    zh: '开始滑动时的斜面倾角',
    ar: 'الميل الذي يبدأ عنده الانزلاق',
    es: 'La inclinación a la que empieza el deslizamiento',
    fr: 'La pente à laquelle le glissement commence',
    hi: 'वह ढलान जिस पर फिसलना शुरू होता है',
    id: 'Kemiringan saat mulai tergelincir',
    pt: 'A inclinação em que o deslizamento começa',
  },
  'label.stage': {
    ko: '같은 재질의 판',
    en: 'Board of one material',
    ja: '同じ材質の板',
    zh: '同一材质的木板',
    ar: 'لوح من مادة واحدة',
    es: 'Tabla de un mismo material',
    fr: 'Planche en un seul matériau',
    hi: 'एक ही पदार्थ का तख़्ता',
    id: 'Papan dari satu bahan',
    pt: 'Tábua de um só material',
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

  'label.slider': {
    ko: '무거운 쪽 상자 수',
    en: 'Boxes in the heavy stack',
    ja: '重いほうの箱の数',
    zh: '重的一堆的箱子数',
    ar: 'عدد الصناديق في الكومة الثقيلة',
    es: 'Cajas en la pila pesada',
    fr: 'Caisses dans la pile lourde',
    hi: 'भारी ढेर में डिब्बे',
    id: 'Kotak di tumpukan berat',
    pt: 'Caixas na pilha pesada',
  },
  /** 각도 표식. 수 뒤에 붙는 기호라 두 언어가 같다. */
  'label.angle': {
    ko: '{deg}°',
    en: '{deg}°',
    ja: '{deg}°',
    zh: '{deg}°',
    ar: '{deg}°',
    es: '{deg}°',
    fr: '{deg}°',
    hi: '{deg}°',
    id: '{deg}°',
    pt: '{deg}°',
  },
  'label.recordTitle': {
    ko: '미끄러지기 시작한 각',
    en: 'Angle where sliding began',
    ja: 'すべり始めた角度',
    zh: '开始滑动的角度',
    ar: 'الزاوية التي بدأ عندها الانزلاق',
    es: 'Ángulo en que empezó el deslizamiento',
    fr: 'Angle où le glissement a commencé',
    hi: 'वह कोण जिस पर फिसलना शुरू हुआ',
    id: 'Sudut saat mulai tergelincir',
    pt: 'Ângulo em que o deslizamento começou',
  },
  'label.recordRow': {
    ko: '1개 · {n}개 더미',
    en: '1 box · stack of {n}',
    ja: '1個 · {n}個の山',
    zh: '1 个 · {n} 个一堆',
    ar: 'صندوق واحد · كومة من {n}',
    es: '1 caja · pila de {n}',
    fr: '1 caisse · pile de {n}',
    hi: '1 डिब्बा · {n} का ढेर',
    id: '1 kotak · tumpukan {n}',
    pt: '1 caixa · pilha de {n}',
  },

  'caption.tilt': {
    ko: '판을 천천히 기울인다. 상자 1개도, {n}개 더미도 아직 버틴다.',
    en: 'The board tilts slowly. The single box and the stack of {n} both still hold.',
    ja: '板がゆっくり傾く。1個の箱も {n}個の山も、まだ止まっている。',
    zh: '木板慢慢倾斜。单个箱子和 {n} 个一堆的箱子都还稳住不动。',
    ar: 'يميل اللوح ببطء. الصندوق المنفرد والكومة المكوّنة من {n} ما زالا ثابتين.',
    es: 'La tabla se inclina despacio. La caja sola y la pila de {n} aún se sostienen.',
    fr: 'La planche s’incline lentement. La caisse seule et la pile de {n} tiennent encore.',
    hi: 'तख़्ता धीरे-धीरे झुकता है। अकेला डिब्बा और {n} का ढेर दोनों अभी टिके हैं।',
    id: 'Papan miring perlahan. Kotak tunggal dan tumpukan {n} masih bertahan.',
    pt: 'A tábua se inclina devagar. A caixa sozinha e a pilha de {n} ainda se seguram.',
  },
  'caption.sliding': {
    ko: '상자 1개와 {n}개 더미가 같은 {angle}°에서 함께 미끄러진다.',
    en: 'The single box and the stack of {n} slide together at the same {angle}°.',
    ja: '1個の箱と {n}個の山が、同じ {angle}° でいっしょにすべる。',
    zh: '单个箱子和 {n} 个一堆的箱子在同一个 {angle}° 一起滑动。',
    ar: 'ينزلق الصندوق المنفرد والكومة المكوّنة من {n} معًا عند الزاوية نفسها {angle}°.',
    es: 'La caja sola y la pila de {n} se deslizan juntas al mismo {angle}°.',
    fr: 'La caisse seule et la pile de {n} glissent ensemble au même angle de {angle}°.',
    hi: 'अकेला डिब्बा और {n} का ढेर एक ही {angle}° पर साथ-साथ फिसलते हैं।',
    id: 'Kotak tunggal dan tumpukan {n} tergelincir bersama pada sudut {angle}° yang sama.',
    pt: 'A caixa sozinha e a pilha de {n} deslizam juntas no mesmo {angle}°.',
  },
  'caption.slid': {
    ko: '상자 1개와 {n}개 더미가 같은 {angle}°에서 함께 미끄러졌다.',
    en: 'The single box and the stack of {n} slid together at the same {angle}°.',
    ja: '1個の箱と {n}個の山が、同じ {angle}° でいっしょにすべった。',
    zh: '单个箱子和 {n} 个一堆的箱子在同一个 {angle}° 一起滑了下去。',
    ar: 'انزلق الصندوق المنفرد والكومة المكوّنة من {n} معًا عند الزاوية نفسها {angle}°.',
    es: 'La caja sola y la pila de {n} se deslizaron juntas al mismo {angle}°.',
    fr: 'La caisse seule et la pile de {n} ont glissé ensemble au même angle de {angle}°.',
    hi: 'अकेला डिब्बा और {n} का ढेर एक ही {angle}° पर साथ-साथ फिसल गए।',
    id: 'Kotak tunggal dan tumpukan {n} telah tergelincir bersama pada sudut {angle}° yang sama.',
    pt: 'A caixa sozinha e a pilha de {n} deslizaram juntas no mesmo {angle}°.',
  },
  'caption.lower': {
    ko: '판을 다시 눕힌다.',
    en: 'The board is laid back down.',
    ja: '板をふたたび寝かせる。',
    zh: '木板重新放平。',
    ar: 'يُعاد اللوح إلى وضعه المنبسط.',
    es: 'La tabla vuelve a bajar.',
    fr: 'La planche est reposée à plat.',
    hi: 'तख़्ते को फिर से नीचे लिटाया जाता है।',
    id: 'Papan diturunkan kembali.',
    pt: 'A tábua volta a abaixar.',
  },
  'caption.next': {
    ko: '이번엔 {n}개 더미를 올려 다시 기울인다.',
    en: 'This time a stack of {n} goes on, and the board tilts again.',
    ja: '今度は {n}個の山をのせて、もう一度傾ける。',
    zh: '这次放上 {n} 个一堆的箱子，木板再次倾斜。',
    ar: 'هذه المرة توضع كومة من {n}، ويميل اللوح من جديد.',
    es: 'Esta vez va una pila de {n}, y la tabla se inclina otra vez.',
    fr: 'Cette fois, une pile de {n} est posée, et la planche s’incline de nouveau.',
    hi: 'इस बार {n} का ढेर रखा जाता है, और तख़्ता फिर झुकता है।',
    id: 'Kali ini tumpukan {n} dipasang, dan papan dimiringkan lagi.',
    pt: 'Desta vez entra uma pilha de {n}, e a tábua se inclina de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type AngleOfFrictionMessageKey = keyof typeof angleOfFrictionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: AngleOfFrictionMessageKey): LocalizedText => angleOfFrictionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AngleOfFrictionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const angleOfFrictionSchema: BundleSchema = {
  id: ANGLE_OF_FRICTION_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 290 px 에 러너의 프레이밍 여백과 캡션 한 줄을 더한다. */
  canvas: { height: 340, minHeight: 320 },

  /** 원본의 겹침 순서 — 바닥 · 받침대 · 호 · 판 · 눈금 · 경첩 · 더미 · 상자 · 기록. */
  drawOrder: 'scene',

  /**
   * 한 회차 9 초 (원본 `CYCLE`).
   *
   * - `tilt` — 12° 에서 마찰각까지 4°/s 로 기울인다. 끝나는 순간 두 상자가 함께 미끄러진다.
   * - `slide` — 판은 그 각에 멈추고 상자가 턱까지 미끄러져 멈춰 보인다 (원본 `REST_END` 7.2 초까지).
   * - `vanish` 0.6 초 — 상자가 사라진다. 판은 여기서부터 `lowered` 끝까지 12° 로 눕는다(smooth).
   * - `lowered` 0.6 초 — 비어 있다.
   * - `appear` 0.6 초 — 다음 더미가 나타난다.
   *
   * 원본은 주기 첫머리(판이 이미 12°)에서 열린다 — `startAt` · `preroll` 이 없다.
   */
  timeline: {
    phases: [
      { id: 'tilt', duration: TILT_SECONDS, caption: key('caption.tilt') },
      { id: 'slide', duration: REST_END - TILT_SECONDS, caption: key('caption.sliding') },
      { id: 'vanish', duration: 0.6, caption: key('caption.lower') },
      { id: 'lowered', duration: 0.6, caption: key('caption.lower') },
      { id: 'appear', duration: 0.6, caption: key('caption.next') },
    ],
  },

  /**
   * 슬롯 하나. 원본처럼 캔버스 아래 왼쪽 한 줄, 16 px, 페이드 없음.
   * 미끄러진 두 상자가 모두 멈추면 문장이 과거형으로 바뀐다 — 시각이 아니라 상태다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 10] },
    align: 'left',
    fontSize: LAYOUT.captionFontPx,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [{ when: 'stopped', text: key('caption.slid') }],
    vars: { n: 'nText', angle: 'slipText' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: angleOfFrictionMessages,
};
