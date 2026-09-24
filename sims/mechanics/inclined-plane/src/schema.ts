// ========================================================================
// inclined-plane — 선언
// ========================================================================
// 질문: 중력은 늘 같은데, 왜 빗면이 가파를수록 물체가 더 세게 끌려 내려가는가.
//
// 동사는 **면을 따라 끄는 몫이 커진다** — 중력 화살표는 길이가 그대로인 채로.
// 성분의 수치 · 수직항력 · 마찰 · 미끄러짐은 두지 않는다 (원본 NOTES (c)).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:inclined-plane` 와 문자 그대로 일치한다 (C4). */
export const INCLINED_PLANE_ID = 'inclined-plane';

// ------------------------------------------------------------------------
// 좌표 — 원본의 화면 픽셀을 월드로 옮긴 것
// ------------------------------------------------------------------------
//
// 원본(`tasks/piece-lab/inclined-plane/index.html`)은 860 × 370 px 캔버스에 빗면의
// 아래 모서리(각의 꼭짓점)를 (700, 290) 에 둔다. **1 월드 단위 = 원본 100 px** 이고
// 그 꼭짓점이 월드 원점이다. y 는 위가 +.

/** 빗면 길이. 원본 `SLOPE_LEN` 300 px. */
export const SLOPE_LEN = 3.0;
/** 꼭짓점에서 물체까지 빗면을 따라 잰 거리. 원본 `BLOCK_S` 190 px. */
export const BLOCK_S = 1.9;
/** 물체 크기 [면 방향, 법선 방향]. 원본 64 × 40 px. */
export const BLOCK_SIZE = [0.64, 0.4] as const;
/** 중력 화살표 길이 — **어떤 각에서도 그대로**. 원본 `G_LEN` 110 px. */
export const G_LEN = 1.1;
/** 기울기 각 호의 반지름. 원본 58 px. */
export const ARC_R = 0.58;
/** 화살촉(월드). 원본 `min(14, len × 0.6)` px 의 14. */
export const HEAD = 0.14;

/** 자동 진행의 가장 완만한 각과 가장 가파른 각(도). 원본 `35 ∓ 25`. */
export const ANGLE_MIN_DEG = 10;
export const ANGLE_MAX_DEG = 60;

/**
 * 고정 프레이밍. 원본 캔버스 860 × 370 px 에서 꼭짓점은 왼쪽 700 · 오른쪽 160 ·
 * 위 290 · 아래 80 px 자리다. 러너가 변마다 36 px(여백 24 + 패딩 12)를 비우므로
 * 그만큼 **안쪽**을 선언해 배율 100 px/단위와 꼭짓점 자리를 지킨다.
 */
export const SCENE_BOUNDS = { minX: -6.64, maxX: 1.24, minY: -0.44, maxY: 2.54 } as const;

// ------------------------------------------------------------------------
// 치수 — 이 그림 고유의 것 (화면 px)
// ------------------------------------------------------------------------

/** 중력 화살표 굵기. 원본 3. */
export const GRAVITY_WIDTH_PX = 3;
/** 면에 수직인 성분 굵기. 원본 2. */
export const NORMAL_WIDTH_PX = 2;
/** 면에 나란한 성분 굵기. 원본 4. */
export const PARALLEL_WIDTH_PX = 4;
/** 분해 보조선(점선) 굵기. 원본 1. */
export const GUIDE_WIDTH_PX = 1;
/** 기울기 각 호 굵기. 원본 1.5. */
export const ARC_WIDTH_PX = 1.5;
/** 라벨 글자 크기. 원본 15. */
export const LABEL_FONT_PX = 15;

/**
 * 라벨 자리(화면 px). 원본은 왼쪽 정렬 글을 기준선·위 기준으로 놓았고, readout 은
 * 글의 **가운데 높이**에 맞추므로 글자 반 줄만큼 옮겼다.
 * - 각도: 꼭짓점에서 (+12, −4) 기준선 → 가운데 (+12, −9)
 * - 중력: 화살표 끝에서 (+8, +2) 윗변 → 가운데 (+8, +10)
 * - 나란한 성분: 화살표 끝에서 (+12, −12) 가운데
 */
export const ANGLE_LABEL_OFFSET = [12, -9] as const;
export const GRAVITY_LABEL_OFFSET = [8, 10] as const;
export const PARALLEL_LABEL_OFFSET = [12, -12] as const;

// ------------------------------------------------------------------------
// 조작기와 자동 진행의 섞기 — 원본 `state.weight` · `state.idle`
// ------------------------------------------------------------------------

/** 손을 뗀 뒤 자동 진행으로 돌아가기 시작할 때까지(초). 원본 3. */
export const RETURN_WAIT = 3;
/** 자동 진행으로 돌아가는 데 걸리는 시간(초). 원본 1 (weight 가 1 초에 1 씩 준다). */
export const RETURN_TIME = 1;
/** 슬라이더 범위(도). 원본 `min=5 max=70 step=1`. */
export const SLIDER_RANGE: [number, number] = [5, 70];
export const SLIDER_STEP = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const inclinedPlaneMessages = Object.freeze({
  'label.title': {
    ko: '빗면',
    en: 'Inclined plane',
    ja: '斜面',
    zh: '斜面',
    ar: 'المستوى المائل',
    es: 'Plano inclinado',
    fr: 'Plan incliné',
    hi: 'आनत तल',
    id: 'Bidang miring',
    pt: 'Plano inclinado',
  },
  'label.operation': {
    ko: '중력을 면에 나란한 성분과 수직 성분으로',
    en: 'Splitting gravity along and into the slope',
    ja: '重力を斜面に沿う向きと斜面に垂直な向きに分ける',
    zh: '把重力分解为沿斜面和垂直于斜面的分量',
    ar: 'تحليل الجاذبية على امتداد المنحدر وعموديًا عليه',
    es: 'Descomponer la gravedad paralela y perpendicular a la pendiente',
    fr: 'Décomposer la pesanteur parallèlement et perpendiculairement à la pente',
    hi: 'गुरुत्व को ढलान के अनुदिश और उसके लंबवत बाँटना',
    id: 'Menguraikan gravitasi sejajar dan tegak lurus bidang miring',
    pt: 'Decompor a gravidade paralela e perpendicular à rampa',
  },
  'label.stage': {
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

    ko: '빗면 기울기',

    en: 'Slope angle',

    ja: '斜面の角度',

    zh: '斜面倾角',

    ar: 'زاوية الميل',

    es: 'Ángulo de la pendiente',

    fr: 'Angle de la pente',

    hi: 'ढलान का कोण',

    id: 'Sudut kemiringan',

    pt: 'Ângulo da rampa',

  },
  'label.gravity': {
    ko: '중력',
    en: 'Gravity',
    ja: '重力',
    zh: '重力',
    ar: 'الجاذبية',
    es: 'Gravedad',
    fr: 'Pesanteur',
    hi: 'गुरुत्व',
    id: 'Gravitasi',
    pt: 'Gravidade',
  },
  'label.parallel': {
    ko: '면을 따라 끄는 몫',
    en: 'Pull along the slope',
    ja: '斜面に沿って引く分',
    zh: '沿斜面下拉的分量',
    ar: 'السحب على امتداد المنحدر',
    es: 'Tirón a lo largo de la pendiente',
    fr: 'Traction le long de la pente',
    hi: 'ढलान के अनुदिश खिंचाव',
    id: 'Tarikan sepanjang bidang miring',
    pt: 'Puxão ao longo da rampa',
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

  'caption.main': {

    ko: '중력은 그대로인데, 빗면이 기울수록 면을 따라 끄는 몫이 커진다',

    en: 'Gravity stays the same, but the steeper the slope, the larger its pull along the slope',

    ja: '重力は変わらないのに、斜面が急になるほど斜面に沿って引く分が大きくなる',

    zh: '重力保持不变，但斜面越陡，沿斜面下拉的分量就越大',

    ar: 'تبقى الجاذبية كما هي، لكن كلما ازداد انحدار المنحدر ازداد سحبها على امتداده',

    es: 'La gravedad no cambia, pero cuanto más empinada es la pendiente, mayor es su tirón a lo largo de ella',

    fr: 'La pesanteur reste la même, mais plus la pente est raide, plus sa traction le long de la pente est grande',

    hi: 'गुरुत्व वही रहता है, पर ढलान जितनी खड़ी होती है, ढलान के अनुदिश उसका खिंचाव उतना बड़ा होता है',

    id: 'Gravitasi tetap sama, tetapi makin curam bidang miringnya, makin besar tarikannya sepanjang bidang miring',

    pt: 'A gravidade continua a mesma, mas quanto mais íngreme a rampa, maior o seu puxão ao longo dela',

  },
} satisfies Record<string, LocalizedText>);

export type InclinedPlaneMessageKey = keyof typeof inclinedPlaneMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: InclinedPlaneMessageKey): LocalizedText => inclinedPlaneMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InclinedPlaneMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const inclinedPlaneSchema: BundleSchema = {
  id: INCLINED_PLANE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 370 px. 캡션도 그 안(왼쪽 아래)에 얹힌다. */
  canvas: { height: 370, minHeight: 320 },

  /**
   * 원본의 겹침 순서 — 빗면 · 각 · 물체 · 보조선 · 중력 · 수직 성분 · 나란한 성분.
   * 강조색 화살표가 맨 위에 와야 수직 성분과 겹칠 때 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 12 초 — 6 초 동안 10° → 60° 로 가팔라지고 6 초 동안 다시 눕는다.
   * 원본 `35 − 25·cos(2π t / 12)` 의 반주기 둘이다. 단계 진행도는 선형이고,
   * 코사인 모양은 scene 이 각으로 옮길 때 입힌다 (NOTES 「어휘 부족」 1).
   */
  timeline: {
    phases: [
      { id: 'steepen', duration: 6 },
      { id: 'flatten', duration: 6 },
    ],
  },

  /**
   * 원본은 t = 0 에서 20° 를 지나 가팔라지는 중이다 — `cos = 0.6` 인 자리.
   * 10° 에서 출발하는 주기를 `12 · acos(0.6) / 2π ≈ 1.771` 초 앞당겨 연다.
   */
  startAt: 1.771,

  /** 왼쪽 아래 한 줄. 원본은 (24, H − 18) 기준선에 16 px 로 쓴다. 페이드 없음. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 10] },
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드도 카메라 버튼도 없다 (기본값).

  messages: inclinedPlaneMessages,
};
