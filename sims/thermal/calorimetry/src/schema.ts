// ========================================================================
// calorimetry — 선언
// ========================================================================
// 질문: 뜨거운 물을 찬 물에 부으면 어느 온도에서 멈추는가.
//
// 80 ℃ 물 100 g 을 20 ℃ 물 200 g 에 붓는다. 오른쪽 온도 축 위에 뜨거운 물이 잃은 열과
// 찬 물이 얻은 열을 직사각형(가로 = 질량, 세로 = 온도 변화)으로 쌓는데, 두 직사각형이
// 같은 칸 수로 자라다가 40 ℃ 에서 맞닿아 멈춘다 — 가운데(50 ℃)가 아니다.
// 두 번째 차례에는 질량을 맞바꿔(200 g 을 100 g 에) 멈추는 자리가 60 ℃ 로 옮겨 간다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:calorimetry` 와 문자 그대로 일치한다 (C4). */
export const CALORIMETRY_ID = 'calorimetry';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 붓는 물 · 받는 물의 처음 온도(℃). 두 차례가 같다. */
export const T_HOT = 80;
export const T_COLD = 20;
/** 두 처음 온도의 가운데(℃) — 「가운데가 아니다」 를 재는 선. 글자로 띄우는 정박값이다. */
export const T_MID = 50;
/** 첫 차례 — 붓는 뜨거운 물 · 받는 찬 물의 질량(g)과 멈추는 온도(℃, 정박값). */
export const M_HOT_A = 100;
export const M_COLD_A = 200;
export const T_FINAL_A = 40;
/** 두 번째 차례 — 질량을 맞바꾼다. */
export const M_HOT_B = 200;
export const M_COLD_B = 100;
export const T_FINAL_B = 60;
/** 비열(J/(kg·K)). 두 쪽 모두 물이다. */
export const C_HOT = 4180;
export const C_COLD = 4180;
/**
 * 열 직사각형의 한 칸 — 가로 `cellMass` g 의 물(비열 `cellSpec`) × 세로 `cellTemp` ℃.
 * 칸 하나가 같은 열이라, 두 직사각형의 칸 수가 같으면 넓이(열)가 같다.
 */
export const CELL_MASS = 50;
export const CELL_TEMP = 10;
export const CELL_SPEC = 4180;
/** 붓는 동안 컵에서 떨어지는 물방울 수 · 물방울 하나가 비커까지 가는 시간(초). */
export const DROPS = 16;
export const DROP_TRAVEL = 0.45;
/** 온도 축의 아래 · 위 끝(℃). 비커 물의 명암도 이 범위로 잰다. */
export const AXIS_MIN = 0;
export const AXIS_MAX = 90;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. y 는 위. 왼쪽에 컵과 비커, 오른쪽에 온도 축과 열 직사각형.
// ------------------------------------------------------------------------

/** 비커 — 왼쪽 · 오른쪽 벽 x, 바닥 · 테두리 y. */
export const BEAKER_X0 = -2.3;
export const BEAKER_X1 = -1.1;
export const BEAKER_BOTTOM = 0;
export const BEAKER_RIM = 2.1;
/** 비커 속 물 1 g 의 높이(월드). 두 차례 모두 합쳐 300 g 이 테두리 아래에 든다. */
export const BEAKER_H_PER_G = 0.006;
/** 컵 — 받침대 위에 올려 비커보다 높다. 오른쪽 위 모서리가 따르는 입이다. */
export const CUP_X0 = -4.2;
export const CUP_X1 = -3.2;
export const CUP_BOTTOM = 1.2;
export const CUP_RIM = 2.8;
/** 물방울이 떨어지는 자리의 x — 비커 안 오른쪽. 호의 솟음(월드). */
export const DROP_TO_X = -1.6;
export const DROP_ARC = 0.3;

/** 온도 축의 x · 열 직사각형의 왼쪽 변 x. */
export const AXIS_X = 0.4;
export const RECT_X = 0.6;
/** 온도 축 `AXIS_MIN` · `AXIS_MAX` 가 놓이는 y. */
export const SCALE_BOTTOM = 0;
export const SCALE_TOP = 3.0;
/** 열 직사각형 한 칸의 가로(월드). 세로는 온도 눈금이 정한다. */
export const CELL_W = 0.55;

/**
 * 프레이밍은 주장의 일부다. 가로는 컵 왼쪽 벽부터 가장 넓은 직사각형 오른쪽의 글자까지,
 * 세로는 캡션 자리부터 온도 축 위 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.4, maxX: 3.9, minY: -0.6, maxY: 3.15 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 한 주기 = 첫 차례 → 두 번째 차례.
// ------------------------------------------------------------------------

/** 차례마다 물이 나타나는 동안 · 둘을 보여 두는 동안. */
export const SHOW = 0.5;
export const READY = 1.4;
/** 붓는 동안. */
export const POUR = 1.6;
/** 섞여 두 온도가 다가가는 동안. */
export const MIX = 3.2;
/** 멈춘 자리를 읽는 동안 · 다음 차례로 흐려지는 동안. */
export const HOLD = 2.8;
export const FADE = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const calorimetryMessages = Object.freeze({
  'label.title': {
    ko: '열량 측정',
    en: 'Calorimetry',
    ja: '熱量測定',
    zh: '量热法',
    ar: 'قياس كمية الحرارة',
    es: 'Calorimetría',
    fr: 'Calorimétrie',
    hi: 'ऊष्मामिति',
    id: 'Kalorimetri',
    pt: 'Calorimetria',
  },
  'label.operation': {
    ko: '섞었을 때의 최종 온도',
    en: 'The final temperature of a mixture',
    ja: '混ぜたときの最終温度',
    zh: '混合后的最终温度',
    ar: 'درجة الحرارة النهائية للمزيج',
    es: 'La temperatura final de una mezcla',
    fr: 'La température finale d’un mélange',
    hi: 'मिश्रण का अंतिम ताप',
    id: 'Suhu akhir suatu campuran',
    pt: 'A temperatura final de uma mistura',
  },
  'label.stage': {
    ko: '뜨거운 물을 찬 물에',
    en: 'Hot water into cold water',
    ja: '熱い水を冷たい水に',
    zh: '热水倒入冷水',
    ar: 'ماء ساخن في ماء بارد',
    es: 'Agua caliente en agua fría',
    fr: 'De l’eau chaude dans de l’eau froide',
    hi: 'गर्म पानी ठंडे पानी में',
    id: 'Air panas ke dalam air dingin',
    pt: 'Água quente em água fria',
  },
  'label.view': {
    ko: '비커와 열 직사각형',
    en: 'Beaker and heat rectangles',
    ja: 'ビーカーと熱の長方形',
    zh: '烧杯与热量矩形',
    ar: 'الكأس ومستطيلات الحرارة',
    es: 'Vaso de precipitados y rectángulos de calor',
    fr: 'Bécher et rectangles de chaleur',
    hi: 'बीकर और ऊष्मा के आयत',
    id: 'Gelas kimia dan persegi panjang kalor',
    pt: 'Béquer e retângulos de calor',
  },
  /** 온도 글자. 값은 선언한 온도를 끼운다 (C1). */
  'label.temp': {
    ko: '{t} ℃',
    en: '{t} ℃',
    ja: '{t} ℃',
    zh: '{t} ℃',
    ar: '{t} ℃',
    es: '{t} ℃',
    fr: '{t} ℃',
    hi: '{t} ℃',
    id: '{t} ℃',
    pt: '{t} ℃',
  },
  /** 질량 글자. */
  'label.mass': {
    ko: '{m} g',
    en: '{m} g',
    ja: '{m} g',
    zh: '{m} g',
    ar: '{m} g',
    es: '{m} g',
    fr: '{m} g',
    hi: '{m} g',
    id: '{m} g',
    pt: '{m} g',
  },
  /** 두 직사각형의 이름. */
  'label.lost': {
    ko: '잃은 열',
    en: 'heat lost',
    ja: '失った熱',
    zh: '放出的热量',
    ar: 'الحرارة المفقودة',
    es: 'calor perdido',
    fr: 'chaleur perdue',
    hi: 'खोई गई ऊष्मा',
    id: 'kalor yang dilepas',
    pt: 'calor perdido',
  },
  'label.gained': {
    ko: '얻은 열',
    en: 'heat gained',
    ja: '得た熱',
    zh: '吸收的热量',
    ar: 'الحرارة المكتسبة',
    es: 'calor ganado',
    fr: 'chaleur gagnée',
    hi: 'प्राप्त ऊष्मा',
    id: 'kalor yang diterima',
    pt: 'calor ganho',
  },
  'caption.readyA': {
    ko: '{th} ℃ 물 {mha} g 과 {tc} ℃ 물 {mca} g 이 있다',
    en: 'There are {mha} g of water at {th} ℃ and {mca} g at {tc} ℃',
    ja: '{th} ℃ の水 {mha} g と {tc} ℃ の水 {mca} g がある',
    zh: '有 {th} ℃ 的水 {mha} g 和 {tc} ℃ 的水 {mca} g',
    ar: 'لدينا {mha} g من الماء عند {th} ℃ و{mca} g عند {tc} ℃',
    es: 'Hay {mha} g de agua a {th} ℃ y {mca} g a {tc} ℃',
    fr: 'Il y a {mha} g d’eau à {th} ℃ et {mca} g à {tc} ℃',
    hi: '{th} ℃ पर {mha} g पानी और {tc} ℃ पर {mca} g पानी है',
    id: 'Ada {mha} g air bersuhu {th} ℃ dan {mca} g bersuhu {tc} ℃',
    pt: 'Há {mha} g de água a {th} ℃ e {mca} g a {tc} ℃',
  },
  'caption.pourA': {
    ko: '{th} ℃ 물 {mha} g 을 {tc} ℃ 물 {mca} g 에 붓는다',
    en: 'The {mha} g at {th} ℃ is poured into the {mca} g at {tc} ℃',
    ja: '{th} ℃ の水 {mha} g を {tc} ℃ の水 {mca} g に注ぐ',
    zh: '把 {th} ℃ 的 {mha} g 水倒入 {tc} ℃ 的 {mca} g 水中',
    ar: 'تُسكب الـ {mha} g التي عند {th} ℃ في الـ {mca} g التي عند {tc} ℃',
    es: 'Los {mha} g a {th} ℃ se vierten en los {mca} g a {tc} ℃',
    fr: 'Les {mha} g à {th} ℃ sont versés dans les {mca} g à {tc} ℃',
    hi: '{th} ℃ वाला {mha} g पानी {tc} ℃ वाले {mca} g पानी में डाला जाता है',
    id: 'Air {mha} g bersuhu {th} ℃ dituangkan ke air {mca} g bersuhu {tc} ℃',
    pt: 'Os {mha} g a {th} ℃ são despejados nos {mca} g a {tc} ℃',
  },
  'caption.mix': {
    ko: '위 직사각형은 아래로, 아래 직사각형은 위로 자라며 칸 수가 같게 늘어난다',
    en: 'The upper rectangle grows down and the lower one grows up, gaining squares at the same count',
    ja: '上の長方形は下へ、下の長方形は上へ伸び、同じ数ずつマスが増えていく',
    zh: '上面的矩形向下长，下面的矩形向上长，格子数增加得一样多',
    ar: 'ينمو المستطيل العلوي إلى الأسفل والسفلي إلى الأعلى، ويكسبان المربعات بالعدد نفسه',
    es: 'El rectángulo de arriba crece hacia abajo y el de abajo hacia arriba, sumando la misma cantidad de cuadros',
    fr: 'Le rectangle du haut grandit vers le bas et celui du bas vers le haut, en gagnant autant de cases l’un que l’autre',
    hi: 'ऊपर वाला आयत नीचे की ओर और नीचे वाला ऊपर की ओर बढ़ता है, दोनों में बराबर संख्या में खाने जुड़ते हैं',
    id: 'Persegi panjang atas tumbuh ke bawah dan yang bawah tumbuh ke atas, kotaknya bertambah dengan jumlah yang sama',
    pt: 'O retângulo de cima cresce para baixo e o de baixo para cima, ganhando quadradinhos na mesma quantidade',
  },
  'caption.holdA': {
    ko: '{tfa} ℃ 에서 맞닿아 멈췄다 — 가운데 {tm} ℃ 보다 찬 물 쪽에 가깝다',
    en: 'They meet and stop at {tfa} ℃ — nearer the cold water than the midpoint {tm} ℃',
    ja: '{tfa} ℃ で接して止まった — 中間の {tm} ℃ より冷たい水の側に近い',
    zh: '在 {tfa} ℃ 处相接并停下 — 比中点 {tm} ℃ 更靠近冷水一侧',
    ar: 'يلتقيان ويتوقفان عند {tfa} ℃ — أقرب إلى الماء البارد من المنتصف {tm} ℃',
    es: 'Se encuentran y se detienen en {tfa} ℃ — más cerca del agua fría que el punto medio, {tm} ℃',
    fr: 'Ils se rejoignent et s’arrêtent à {tfa} ℃ — plus près de l’eau froide que le milieu, {tm} ℃',
    hi: 'वे {tfa} ℃ पर मिलकर रुक जाते हैं — बीच के {tm} ℃ की तुलना में ठंडे पानी के ज़्यादा पास',
    id: 'Keduanya bertemu dan berhenti di {tfa} ℃ — lebih dekat ke air dingin daripada titik tengah {tm} ℃',
    pt: 'Eles se encontram e param em {tfa} ℃ — mais perto da água fria que o ponto médio, {tm} ℃',
  },
  'caption.readyB': {
    ko: '이번에는 {th} ℃ 물 {mhb} g 과 {tc} ℃ 물 {mcb} g 이다',
    en: 'This time: {mhb} g of water at {th} ℃ and {mcb} g at {tc} ℃',
    ja: '今度は {th} ℃ の水 {mhb} g と {tc} ℃ の水 {mcb} g だ',
    zh: '这一次：{th} ℃ 的水 {mhb} g 和 {tc} ℃ 的水 {mcb} g',
    ar: 'هذه المرة: {mhb} g من الماء عند {th} ℃ و{mcb} g عند {tc} ℃',
    es: 'Esta vez: {mhb} g de agua a {th} ℃ y {mcb} g a {tc} ℃',
    fr: 'Cette fois : {mhb} g d’eau à {th} ℃ et {mcb} g à {tc} ℃',
    hi: 'इस बार: {th} ℃ पर {mhb} g पानी और {tc} ℃ पर {mcb} g पानी',
    id: 'Kali ini: {mhb} g air bersuhu {th} ℃ dan {mcb} g bersuhu {tc} ℃',
    pt: 'Desta vez: {mhb} g de água a {th} ℃ e {mcb} g a {tc} ℃',
  },
  'caption.pourB': {
    ko: '{th} ℃ 물 {mhb} g 을 {tc} ℃ 물 {mcb} g 에 붓는다',
    en: 'The {mhb} g at {th} ℃ is poured into the {mcb} g at {tc} ℃',
    ja: '{th} ℃ の水 {mhb} g を {tc} ℃ の水 {mcb} g に注ぐ',
    zh: '把 {th} ℃ 的 {mhb} g 水倒入 {tc} ℃ 的 {mcb} g 水中',
    ar: 'تُسكب الـ {mhb} g التي عند {th} ℃ في الـ {mcb} g التي عند {tc} ℃',
    es: 'Los {mhb} g a {th} ℃ se vierten en los {mcb} g a {tc} ℃',
    fr: 'Les {mhb} g à {th} ℃ sont versés dans les {mcb} g à {tc} ℃',
    hi: '{th} ℃ वाला {mhb} g पानी {tc} ℃ वाले {mcb} g पानी में डाला जाता है',
    id: 'Air {mhb} g bersuhu {th} ℃ dituangkan ke air {mcb} g bersuhu {tc} ℃',
    pt: 'Os {mhb} g a {th} ℃ são despejados nos {mcb} g a {tc} ℃',
  },
  'caption.holdB': {
    ko: '이번에는 {tfb} ℃ 에서 멈췄다 — 가운데 {tm} ℃ 보다 뜨거운 물 쪽에 가깝다',
    en: 'This time they stop at {tfb} ℃ — nearer the hot water than the midpoint {tm} ℃',
    ja: '今度は {tfb} ℃ で止まった — 中間の {tm} ℃ より熱い水の側に近い',
    zh: '这一次在 {tfb} ℃ 处停下 — 比中点 {tm} ℃ 更靠近热水一侧',
    ar: 'هذه المرة يتوقفان عند {tfb} ℃ — أقرب إلى الماء الساخن من المنتصف {tm} ℃',
    es: 'Esta vez se detienen en {tfb} ℃ — más cerca del agua caliente que el punto medio, {tm} ℃',
    fr: 'Cette fois, ils s’arrêtent à {tfb} ℃ — plus près de l’eau chaude que le milieu, {tm} ℃',
    hi: 'इस बार वे {tfb} ℃ पर रुकते हैं — बीच के {tm} ℃ की तुलना में गर्म पानी के ज़्यादा पास',
    id: 'Kali ini keduanya berhenti di {tfb} ℃ — lebih dekat ke air panas daripada titik tengah {tm} ℃',
    pt: 'Desta vez eles param em {tfb} ℃ — mais perto da água quente que o ponto médio, {tm} ℃',
  },
} satisfies Record<string, LocalizedText>);

export type CalorimetryMessageKey = keyof typeof calorimetryMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CalorimetryMessageKey): LocalizedText => calorimetryMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CalorimetryMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const calorimetrySchema: BundleSchema = {
  id: CALORIMETRY_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 질량 · 온도 · 비열은 스테이지 상수다. 「질량을 바꾸면 멈추는 자리가
  // 옮겨 간다」 는 두 번째 차례가 누르지 않아도 보여 준다.
  parameters: [],

  stages: [
    {
      id: 'water-into-water',
      label: text('label.stage'),
      constants: {
        tHot: T_HOT,
        tCold: T_COLD,
        tMid: T_MID,
        mHotA: M_HOT_A,
        mColdA: M_COLD_A,
        tFinalA: T_FINAL_A,
        mHotB: M_HOT_B,
        mColdB: M_COLD_B,
        tFinalB: T_FINAL_B,
        cHot: C_HOT,
        cCold: C_COLD,
        cellMass: CELL_MASS,
        cellTemp: CELL_TEMP,
        cellSpec: CELL_SPEC,
        drops: DROPS,
        dropTravel: DROP_TRAVEL,
        axisMin: AXIS_MIN,
        axisMax: AXIS_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'beaker-and-rectangles', label: text('label.view'), default: true }],

  /** 세로가 비싸다. 컵 · 비커 · 온도 축 + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 물방울은 비커 벽 위에, 칸 타일은 축 선 위에, 온도 글자는
   * 맨 위에 그려야 한다. 층 순서로는 `region`(물 · 칸)이 물방울(`body`)을 덮는다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 첫 차례(나타남 → 둠 → 부음 → 섞임 → 멈춤 → 흐려짐) → 두 번째 차례(같은 순서). */
  timeline: {
    phases: [
      { id: 'showA', duration: SHOW, ease: 'smooth', caption: key('caption.readyA') },
      { id: 'readyA', duration: READY, caption: key('caption.readyA') },
      { id: 'pourA', duration: POUR, caption: key('caption.pourA') },
      { id: 'mixA', duration: MIX, ease: 'smooth', caption: key('caption.mix') },
      { id: 'holdA', duration: HOLD, caption: key('caption.holdA') },
      { id: 'fadeA', duration: FADE, ease: 'smooth', caption: key('caption.holdA') },
      { id: 'showB', duration: SHOW, ease: 'smooth', caption: key('caption.readyB') },
      { id: 'readyB', duration: READY, caption: key('caption.readyB') },
      { id: 'pourB', duration: POUR, caption: key('caption.pourB') },
      { id: 'mixB', duration: MIX, ease: 'smooth', caption: key('caption.mix') },
      { id: 'holdB', duration: HOLD, caption: key('caption.holdB') },
      { id: 'fadeB', duration: FADE, ease: 'smooth', caption: key('caption.holdB') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 첫 차례의 붓기가 시작되고 조금 지난 자리에서 연다. */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 열량 보존의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: {
      th: 'hotText',
      tc: 'coldText',
      tm: 'midText',
      tfa: 'finalAText',
      tfb: 'finalBText',
      mha: 'massHotAText',
      mca: 'massColdAText',
      mhb: 'massHotBText',
      mcb: 'massColdBText',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 직사각형의 칸 수와
   * 맞닿은 높이** 다. 칸 타일이 스스로 잣대가 된다.
   */

  messages: calorimetryMessages,
};
