// ========================================================================
// mechanical-advantage — 선언
// ========================================================================
// 질문: 지레나 빗면을 쓰면 힘이 덜 드는데, 그럼 공짜로 줄어드는 것인가.
//
// 동사는 **힘이 줄어든 만큼 민 거리가 늘어난다.** 같은 120 N 상자 셋이 같은 시각에
// 같은 높이(0.5 m)로 올라가고, 손의 힘 화살표는 80 : 40 : 20, 손이 민 거리 띠는
// 50 : 100 : 200 으로 자란다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mechanical-advantage` 와 문자 그대로 일치한다 (C4). */
export const MECHANICAL_ADVANTAGE_ID = 'mechanical-advantage';

// ------------------------------------------------------------------------
// 좌표 — 원본의 화면 픽셀을 월드로 옮긴 것
// ------------------------------------------------------------------------
//
// 원본(`tasks/piece-lab/mechanical-advantage/index.html`)은 860 × 310 px 캔버스에
// 바닥선을 y = 250 px 에 긋는다. **1 월드 단위 = 원본 100 px = 1 m** 이고(원본
// `PX_PER_M`), 캔버스 왼쪽 끝 · 바닥선이 월드 원점이다. y 는 위가 +.

/** 상자 무게(N). 원본 `WEIGHT_N`. */
export const WEIGHT_N = 120;
/** 올리는 높이(m). 원본 `RISE_M` — 같은 높이 점선의 자리이기도 하다. */
export const RISE = 0.5;
/** 힘 화살표 축척(m/N). 원본 `FORCE_PX_PER_N` = 80 px / 120 N. 세 칸이 같은 값이다. */
export const FORCE_PER_N = 0.8 / 120;
/** 상자 한 변. 원본 `BOX_S` 36 px. */
export const BOX_S = 0.36;
/** 바닥선 · 같은 높이 선의 양 끝. 원본 10 px ~ W − 10 px. */
export const FLOOR_X: readonly [number, number] = [0.1, 8.5];

/** 세 칸. 가운데 x 와 힘의 이득(손의 힘 = 무게 / ratio, 민 거리 = 높이 × ratio). */
export const TOOLS = [
  { id: 'lift', cx: 1.45, ratio: 1 },
  { id: 'lever', cx: 4.3, ratio: 2 },
  { id: 'incline', cx: 7.15, ratio: 4 },
] as const;

/** 손 · 원본 `hand()` 반지름 6 px. */
export const HAND_R = 0.06;
/** 그대로 들기 — 상자 윗면에서 손까지(밧줄 길이). 원본 60 px. */
export const LIFT_ROPE = 0.6;
/** 그대로 들기 — 손 위에서 화살표 꼬리까지. 원본 8 px. */
export const LIFT_ARROW_GAP = 0.08;

/** 지레 — 받침점이 칸 가운데에서 왼쪽으로 비킨 거리. 원본 35 px. */
export const LEVER_PIVOT_DX = 0.35;
/** 지레 — 상자 쪽 팔 · 손 쪽 팔. 원본 `L1` 70 · `L2` 140 px (1 : 2). */
export const LEVER_L1 = 0.7;
export const LEVER_L2 = 1.4;
/** 지레 — 시작 때 상자 끝이 받침점보다 낮은 정도. 원본 `RISE × 2/3`. */
export const LEVER_D0 = (RISE * 2) / 3;
/** 지레 — 받침 삼각형 밑변 반폭. 원본 14 px. */
export const FULCRUM_HALF = 0.14;
/** 지레 — 상자 밑면을 막대 끝보다 올린 거리. 원본 3 px. */
export const LEVER_BOX_LIFT = 0.03;
/** 지레 — 손을 막대 끝보다 올린 거리. 원본 8 px. */
export const LEVER_HAND_LIFT = 0.08;
/** 지레 — 막대 끝에서 화살표 머리까지. 원본 16 px. */
export const LEVER_ARROW_GAP = 0.16;

/** 빗면 — 받침대 폭. 원본 38 px. */
export const PLATFORM_W = 0.38;
/** 빗면 — 상자 밑면 가운데에서 손까지 비탈 방향 거리. 원본 `HB` = 18 + 8 px. */
export const INCLINE_HAND_BACK = BOX_S / 2 + 0.08;
/** 빗면 — 손에서 화살표 머리까지. 원본 9 px. */
export const INCLINE_ARROW_GAP = 0.09;

/**
 * 민 거리 띠를 손이 지나온 길에서 옆으로 띄운 거리. 손 반지름 6 px + 띠 반폭 3 px +
 * 틈 1 px. 원본은 22 px(들기) · 18~35 px(지레) · 48 px(빗면)로 떨어져 있었다
 * (NOTES (a) 2).
 */
export const BAND_OFFSET = 0.1;
/** 띠의 출발점 눈금 길이. 원본 14 px. */
export const BAND_TICK = 0.14;
/**
 * 되돌아갈 때 띠가 옅어지는 빠르기 — 되돌림 단계의 1/1.6 동안 다 옅어진다.
 * 원본 `fade = 1 − smooth(r × 1.6)`.
 */
export const BAND_FADE_RATE = 1.6;

/**
 * 도구 이름 · 수치 두 줄의 세로 자리. 원본은 기준선 274 · 296 px 에 13 px 글자를
 * 썼고, readout 은 글의 가운데 높이에 맞추므로 글자 3분의 1 줄(≈4.5 px) 올렸다.
 */
export const NAME_Y = -0.195;
export const READING_Y = -0.415;
/** 같은 높이 글자 — 원본 (12, TOP_Y − 3) 아래 기준선, 12 px. 가운데 높이로 옮겼다. */
export const SAME_HEIGHT_LABEL_AT: readonly [number, number] = [0.12, RISE + 0.09];

/**
 * 고정 프레이밍. 원본 캔버스 860 × 310 px 아래에 캡션 자리(50 px)를 더해 360 px 을
 * 담는다. 러너가 변마다 36 px(여백 24 + 패딩 12)를 비우므로 그만큼 **안쪽**을 선언해
 * 배율 100 px/m 와 바닥선 자리를 지킨다.
 */
export const SCENE_BOUNDS = { minX: 0.36, maxX: 8.24, minY: -0.74, maxY: 2.14 } as const;

// ------------------------------------------------------------------------
// 치수 — 이 그림 고유의 것 (화면 px)
// ------------------------------------------------------------------------

/** 바닥선 · 비탈 윤곽 굵기. 원본 2. */
export const FLOOR_WIDTH_PX = 2;
/** 같은 높이 점선 굵기. 원본 1. */
export const TARGET_WIDTH_PX = 1;
/** 밧줄 굵기. 원본 1.5. */
export const ROPE_WIDTH_PX = 1.5;
/** 지레 막대 굵기. 원본 5. */
export const ROD_WIDTH_PX = 5;
/** 손의 힘 화살표 굵기. 원본 3. */
export const ARROW_WIDTH_PX = 3;
/** 화살촉 크기(월드). 원본 9 px. */
export const ARROW_HEAD = 0.09;
/** 민 거리 띠 굵기. 원본 6. */
export const BAND_WIDTH_PX = 6;
/** 출발점 눈금 굵기. 원본 2. */
export const TICK_WIDTH_PX = 2;
/** 상자 무게 글자. 원본 11. */
export const WEIGHT_FONT_PX = 11;
/** 같은 높이 글자. 원본 12. */
export const SAME_HEIGHT_FONT_PX = 12;
/** 도구 이름 · 수치 글자. 원본 13. */
export const TOOL_FONT_PX = 13;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const mechanicalAdvantageMessages = Object.freeze({
  'label.title': {
    ko: '힘의 이득',
    en: 'Mechanical advantage',
    ja: '力の利得',
    zh: '机械利益',
    ar: 'الفائدة الآلية',
    es: 'Ventaja mecánica',
    fr: 'Avantage mécanique',
    hi: 'यांत्रिक लाभ',
    id: 'Keuntungan mekanis',
    pt: 'Vantagem mecânica',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '지레와 빗면이 드는 힘을 줄이는 방식',
    en: 'How levers and ramps cut the force you need',
    ja: 'てこと斜面が必要な力を減らすしくみ',
    zh: '杠杆和斜面如何减小所需的力',
    ar: 'كيف تقلل الروافع والسطوح المائلة القوة اللازمة',
    es: 'Cómo las palancas y las rampas reducen la fuerza necesaria',
    fr: 'Comment leviers et plans inclinés réduisent la force nécessaire',
    hi: 'उत्तोलक और आनत तल आवश्यक बल को कैसे घटाते हैं',
    id: 'Cara tuas dan bidang miring mengurangi gaya yang diperlukan',
    pt: 'Como alavancas e rampas reduzem a força necessária',
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

  'label.sameHeight': {
    ko: '같은 높이 {h} m',
    en: 'Same height {h} m',
    ja: '同じ高さ {h} m',
    zh: '相同高度 {h} m',
    ar: 'الارتفاع نفسه {h} m',
    es: 'Misma altura {h} m',
    fr: 'Même hauteur {h} m',
    hi: 'समान ऊँचाई {h} m',
    id: 'Tinggi sama {h} m',
    pt: 'Mesma altura {h} m',
  },
  /** 상자에 새긴 무게. 수와 단위라 두 언어가 같다 (C1 판정 3). */
  'label.weight': {
    ko: '{w} N',
    en: '{w} N',
    ja: '{w} N',
    zh: '{w} N',
    ar: '{w} N',
    es: '{w} N',
    fr: '{w} N',
    hi: '{w} N',
    id: '{w} N',
    pt: '{w} N',
  },
  'label.tool.lift': {
    ko: '그대로 들기',
    en: 'Lift it straight up',
    ja: 'そのまま持ち上げる',
    zh: '直接提起',
    ar: 'الرفع مباشرةً إلى أعلى',
    es: 'Levantarlo en vertical',
    fr: 'Le soulever à la verticale',
    hi: 'सीधे ऊपर उठाना',
    id: 'Angkat lurus ke atas',
    pt: 'Levantar direto para cima',
  },
  'label.tool.lever': {
    ko: '지레 (팔 길이 1 : 2)',
    en: 'Lever (arms 1 : 2)',
    ja: 'てこ（腕の長さ 1 : 2）',
    zh: '杠杆（力臂 1 : 2）',
    ar: 'رافعة (الذراعان 1 : 2)',
    es: 'Palanca (brazos 1 : 2)',
    fr: 'Levier (bras 1 : 2)',
    hi: 'उत्तोलक (भुजाएँ 1 : 2)',
    id: 'Tuas (lengan 1 : 2)',
    pt: 'Alavanca (braços 1 : 2)',
  },
  'label.tool.incline': {
    ko: '빗면 (길이가 높이의 4배)',
    en: 'Ramp (4 times as long as high)',
    ja: '斜面（長さが高さの4倍）',
    zh: '斜面（长度是高度的4倍）',
    ar: 'سطح مائل (طوله 4 أضعاف ارتفاعه)',
    es: 'Rampa (4 veces más larga que alta)',
    fr: 'Plan incliné (4 fois plus long que haut)',
    hi: 'आनत तल (लंबाई ऊँचाई की 4 गुना)',
    id: 'Bidang miring (panjangnya 4 kali tingginya)',
    pt: 'Rampa (4 vezes mais longa que alta)',
  },
  'label.reading': {
    ko: '손의 힘 {f} N  ·  민 거리 {d} m',
    en: 'Hand force {f} N  ·  pushed {d} m',
    ja: '手の力 {f} N  ·  押した距離 {d} m',
    zh: '手的力 {f} N  ·  推动距离 {d} m',
    ar: 'قوة اليد {f} N  ·  مسافة الدفع {d} m',
    es: 'Fuerza de la mano {f} N  ·  empujó {d} m',
    fr: 'Force de la main {f} N  ·  poussée sur {d} m',
    hi: 'हाथ का बल {f} N  ·  धकेली दूरी {d} m',
    id: 'Gaya tangan {f} N  ·  didorong {d} m',
    pt: 'Força da mão {f} N  ·  empurrou {d} m',
  },

  'caption.lifting': {
    ko: '같은 상자를 같은 높이까지 올리는 동안, 힘이 작은 쪽일수록 손은 더 긴 거리를 민다',
    en: 'Raising the same box to the same height, the smaller the force, the farther the hand pushes',
    ja: '同じ箱を同じ高さまで上げる間、力が小さいほど手は長い距離を押す',
    zh: '把同一个箱子提到相同高度时，力越小，手推动的距离就越长',
    ar: 'أثناء رفع الصندوق نفسه إلى الارتفاع نفسه، كلما صغرت القوة طالت المسافة التي تدفعها اليد',
    es: 'Al subir la misma caja a la misma altura, cuanto menor es la fuerza, más lejos empuja la mano',
    fr: 'En montant la même caisse à la même hauteur, plus la force est petite, plus la main pousse loin',
    hi: 'एक ही बक्से को उतनी ही ऊँचाई तक उठाते समय, बल जितना छोटा, हाथ उतनी लंबी दूरी तक धकेलता है',
    id: 'Saat menaikkan kotak yang sama ke ketinggian yang sama, makin kecil gayanya, makin jauh tangan mendorong',
    pt: 'Ao erguer a mesma caixa à mesma altura, quanto menor a força, mais longe a mão empurra',
  },
  'caption.result': {
    ko: '힘이 절반이면 두 배, 4분의 1이면 네 배 긴 거리를 밀어야 같은 높이에 닿았다',
    en: 'Half the force took twice the distance, a quarter took four times, to reach the same height',
    ja: '力が半分なら2倍、4分の1なら4倍の距離を押して、同じ高さに届いた',
    zh: '力减半就要推两倍的距离，力为四分之一就要推四倍，才到达相同高度',
    ar: 'احتاجت نصف القوة إلى ضعف المسافة، وربعها إلى أربعة أضعافها، للوصول إلى الارتفاع نفسه',
    es: 'La mitad de la fuerza necesitó el doble de distancia, y un cuarto, cuatro veces más, para llegar a la misma altura',
    fr: 'La moitié de la force a demandé deux fois la distance, le quart quatre fois plus, pour atteindre la même hauteur',
    hi: 'आधे बल को दुगुनी दूरी लगी, चौथाई को चार गुनी, उसी ऊँचाई तक पहुँचने के लिए',
    id: 'Setengah gaya butuh dua kali jarak, seperempatnya empat kali, untuk mencapai ketinggian yang sama',
    pt: 'Metade da força levou o dobro da distância, um quarto levou quatro vezes, para chegar à mesma altura',
  },
} satisfies Record<string, LocalizedText>);

export type MechanicalAdvantageMessageKey = keyof typeof mechanicalAdvantageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: MechanicalAdvantageMessageKey): LocalizedText => mechanicalAdvantageMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MechanicalAdvantageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const mechanicalAdvantageSchema: BundleSchema = {
  id: MECHANICAL_ADVANTAGE_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 자동 진행만으로 주장이 끝난다 (원본 NOTES (c)).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 310 px + 캔버스 아래 캡션 자리. 캡션 슬롯은 캔버스 안에 그려지므로 수치 줄과 겹치지 않게 50 px 을 더 잡는다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 원본의 겹침 순서 — 칸마다 띠 · 밧줄/받침/막대 · 상자 · 손 · 화살표. 띠가 상자와
   * 손 아래에 깔려야 손이 띠의 끝으로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 6.5 초 — 4 초 동안 함께 올리고(smoothstep), 1.5 초 멈춰 세 띠 길이를
   * 나란히 보이고, 1 초 동안 내려놓는다. 세 칸이 **같은 시간에** 끝난다 (원본 NOTES (c)).
   * 캡션은 올리는 동안 과정을, 멈춘 뒤로는 결과를 말한다 (원본 `stage === 'lift'`).
   */
  timeline: {
    phases: [
      { id: 'lift', duration: 4.0, ease: 'smooth', caption: key('caption.lifting') },
      { id: 'hold', duration: 1.5, caption: key('caption.result') },
      { id: 'return', duration: 1.0, ease: 'smooth', caption: key('caption.result') },
    ],
  },

  /** t = 0 에 상자가 이미 떠올라 있도록 0.8 초 앞당긴다. 원본 `OFFSET`. */
  startAt: 0.8,

  /** 캔버스 아래 가운데 한 줄. 원본 15 px 본문색. 페이드 없음(원본은 바로 바꾼다). */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -2] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 원본에 없다.

  messages: mechanicalAdvantageMessages,
};
