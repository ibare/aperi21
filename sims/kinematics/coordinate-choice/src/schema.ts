// ========================================================================
// coordinate-choice — 선언
// ========================================================================
// 질문: 빗면 문제에서 왜 굳이 축을 빗면에 맞춰 기울이나? 수평·수직으로 두어도
// 같은 운동인데.
//
// 답의 동사는 **그림자 하나가 멈춘다.** 축을 빗면에 맞추면 빗면에 수직인 축의
// 그림자가 제자리에 선다 — 그 방향 식은 할 일이 없어진다.
//
// 값은 전부 원본(tasks/piece-lab/coordinate-choice/index.html)에서 그대로 가져왔다.
// 원본은 CSS 픽셀(840 × 260, 1 m = 30 px)로 짰으므로 배치 숫자를 **원본 픽셀 그대로**
// 여기 적고, 월드로 옮기는 나눗셈은 scene 이 한 곳에서 한다. 원본과 대조할 때 어느
// 숫자가 어디서 왔는지 한 줄로 보이게 하기 위해서다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:coordinate-choice` 와 문자 그대로 일치한다 (C4). */
export const COORDINATE_CHOICE_ID = 'coordinate-choice';

// ------------------------------------------------------------------------
// 물리 — 마찰 없는 빗면
// ------------------------------------------------------------------------

/** 빗면 각(라디안) = 20°. */
export const THETA = (20 * Math.PI) / 180;
/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 빗면 방향 가속도(m/s²) = g·sin20° ≈ 3.35. */
export const A_SLOPE = G * Math.sin(THETA);

// ------------------------------------------------------------------------
// 원본 배치 (픽셀)
// ------------------------------------------------------------------------

/** 원본 1 m = 30 px. **배율이 아니라 환산표다** — 그리는 배율은 카메라가 정한다. */
export const PX_PER_M = 30;
/** 원본 캔버스 높이(px). 캔버스 y(아래로) 를 월드 y(위로) 로 뒤집는 기준. */
export const CANVAS_H_PX = 260;
/** 오른쪽 패널이 놓이는 가로 자리(px). 두 패널은 한 월드에 나란히 놓인다. */
export const PANEL_OFFSET_PX = 420;

/** 출발 위치 — 꼭대기에서 빗면을 따라 간 거리(px). */
export const D0_PX = 15;
/** 도착 위치(px). */
export const D_END_PX = 285;
/** 물체 한 변(px). */
export const BLOCK_PX = 22;
/** 빗면 꼭대기(패널 안 캔버스 좌표, px). */
export const TOP_PX = { x: 70, y: 70 } as const;
/** 빗면 길이(px) = 10 m. */
export const SLOPE_LEN_PX = 300;
/** 빗면 판 두께(px). 오른쪽 x′ 축(빗면 40 px 아래)과 채움이 겹치지 않는 두께. */
export const SLOPE_THICK_PX = 14;

/** 왼쪽 x 축이 빗면 아래끝보다 이만큼 아래(px). */
export const LX_AXIS_BELOW_PX = 40;
/** 왼쪽 y 축의 가로 자리(px). */
export const LY_AXIS_X_PX = 30;
/** 오른쪽 x′ 축이 빗면과 나란히 떨어진 거리(px). */
export const R_OFF_PX = 40;
/** 오른쪽 y′ 축이 x′ 축과 만나는 자리 — x′ 축을 따라 간 거리(px). */
export const RY_ALONG_PX = 320;

/** 발자국 간격(초). */
export const STAMP_DT = 0.25;
/**
 * 발자국이 축에서 비껴 놓이는 자리(px) — 축 바깥쪽으로 `from` 에서 `to` 까지.
 *
 * **원본과 다르다.** 원본은 눈금을 축 위에 가로질러 그었는데, y′ 축에서는 모든
 * 눈금이 한 자리에 겹친 채 그림자 점(반지름 5 px)에 가려져 "멈춘다" 가 점이 안
 * 움직이는 것으로만 드러났다. 점 가장자리에서 1 px 띄워 축 옆에 세우면 겹친
 * 눈금이 그대로 보인다. 네 축이 같은 모양이어야 같은 표시로 읽히므로 넷 다 옮겼다
 * (NOTES (a)).
 */
export const STAMP_SPAN_PX = { from: 6, to: 18 } as const;

/** 그림자 점 반지름(px). */
export const SHADOW_R_PX = 5;
/** 축 화살촉 길이(px). */
export const AXIS_HEAD_PX = 8;
/** 축 선 굵기(화면 px). */
export const AXIS_WIDTH_PX = 1.4;
/** 축 이름 글자 크기(화면 px). */
export const AXIS_LABEL_FONT_PX = 15;
/** 빗면 윗변 굵기(화면 px). */
export const SLOPE_EDGE_WIDTH_PX = 1.2;
/** 발자국 획 굵기(화면 px). */
export const STAMP_WIDTH_PX = 2;
/** 발자국 진하기. */
export const STAMP_ALPHA = 0.55;
/** 투영선 진하기. */
export const GUIDE_ALPHA = 0.45;
/** 투영선 굵기(화면 px). */
export const GUIDE_WIDTH_PX = 1;

/**
 * 미끄러지는 시간(초) ≈ 2.317 — 출발 자리에서 도착 자리까지 ½·a·t² 로 가는 데
 * 걸리는 시간. 시간표의 `slide` 길이가 이 값이다. 늘이면 물체가 도착 자리를
 * 지나 계속 가속한다(물리에 맞지만 빗면 끝을 넘는다).
 */
export const T_SLIDE = Math.sqrt((2 * ((D_END_PX - D0_PX) / PX_PER_M)) / A_SLOPE);

/**
 * 프레이밍(월드 m). 원본 캔버스에서 그림이 차지한 자리(가로 15~835 px, 세로 20~250 px)
 * 에 캡션 한 줄 자리(30 px)를 아래에 더했다. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = {
  minX: 15 / PX_PER_M,
  maxX: 835 / PX_PER_M,
  minY: (CANVAS_H_PX - 280) / PX_PER_M,
  maxY: (CANVAS_H_PX - 20) / PX_PER_M,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const coordinateChoiceMessages = Object.freeze({
  'label.title': {
    ko: '좌표계 선택',
    en: 'Choosing axes',
    ja: '座標軸の選び方',
    zh: '坐标轴的选取',
    ar: 'اختيار المحاور',
    es: 'Elección de los ejes',
    fr: 'Choix des axes',
    hi: 'अक्षों का चयन',
    id: 'Memilih sumbu',
    pt: 'Escolha dos eixos',
  },
  'label.operation': {
    ko: '축을 어디에 두느냐가 식을 바꾸는 방식',
    en: 'How the choice of axes changes the equations',
    ja: '軸の置き方で式が変わるしくみ',
    zh: '坐标轴的选取如何改变方程',
    ar: 'كيف يغيّر اختيار المحاور المعادلات',
    es: 'Cómo la elección de los ejes cambia las ecuaciones',
    fr: 'Comment le choix des axes change les équations',
    hi: 'अक्षों का चयन समीकरणों को कैसे बदलता है',
    id: 'Bagaimana pilihan sumbu mengubah persamaan',
    pt: 'Como a escolha dos eixos muda as equações',
  },
  'label.stage': {
    ko: '빗면',
    en: 'Incline',
    ja: '斜面',
    zh: '斜面',
    ar: 'المستوى المائل',
    es: 'Plano inclinado',
    fr: 'Plan incliné',
    hi: 'आनत तल',
    id: 'Bidang miring',
    pt: 'Plano inclinado',
  },
  'label.view': {
    ko: '두 벌의 축',
    en: 'Two sets of axes',
    ja: '二組の軸',
    zh: '两套坐标轴',
    ar: 'مجموعتان من المحاور',
    es: 'Dos pares de ejes',
    fr: 'Deux systèmes d’axes',
    hi: 'अक्षों के दो समुच्चय',
    id: 'Dua pasang sumbu',
    pt: 'Dois pares de eixos',
  },
  /** 축 이름은 기호라 번역 대상이 아니다 (C1 판정 3). 저작자가 바꿀 수 있게 선언에 둔다. */
  'label.axisX': {
    ko: 'x',
    en: 'x',
    ja: 'x',
    zh: 'x',
    ar: 'x',
    es: 'x',
    fr: 'x',
    hi: 'x',
    id: 'x',
    pt: 'x',
  },
  'label.axisY': {
    ko: 'y',
    en: 'y',
    ja: 'y',
    zh: 'y',
    ar: 'y',
    es: 'y',
    fr: 'y',
    hi: 'y',
    id: 'y',
    pt: 'y',
  },
  'label.axisXp': {
    ko: 'x′',
    en: 'x′',
    ja: 'x′',
    zh: 'x′',
    ar: 'x′',
    es: 'x′',
    fr: 'x′',
    hi: 'x′',
    id: 'x′',
    pt: 'x′',
  },
  'label.axisYp': {
    ko: 'y′',
    en: 'y′',
    ja: 'y′',
    zh: 'y′',
    ar: 'y′',
    es: 'y′',
    fr: 'y′',
    hi: 'y′',
    id: 'y′',
    pt: 'y′',
  },
  'caption.main': {
    ko: '같은 미끄럼을 두 벌의 축으로 본다 — 빗면을 따라 축을 두면 그림자 하나가 제자리에 멈춘다.',
    en: 'One slide, two sets of axes — tilt the axes along the incline and one shadow stands still.',
    ja: '同じすべりを二組の軸で見る — 軸を斜面に沿って傾けると、影の一つが止まる。',
    zh: '同一次下滑，两套坐标轴 — 把坐标轴沿斜面倾斜，其中一个投影就静止不动。',
    ar: 'انزلاق واحد ومجموعتان من المحاور — أمِل المحاور على طول المستوى المائل فيثبت أحد الظلّين.',
    es: 'Un deslizamiento, dos pares de ejes — inclina los ejes a lo largo del plano y una sombra se queda quieta.',
    fr: 'Une glissade, deux systèmes d’axes — inclinez les axes le long du plan et une ombre s’immobilise.',
    hi: 'एक फिसलन, अक्षों के दो समुच्चय — अक्षों को आनत तल के अनुदिश झुकाएँ तो एक छाया स्थिर हो जाती है।',
    id: 'Satu luncuran, dua pasang sumbu — miringkan sumbu searah bidang miring dan satu bayangan diam di tempat.',
    pt: 'Um deslizamento, dois pares de eixos — incline os eixos ao longo do plano e uma sombra fica parada.',
  },
} satisfies Record<string, LocalizedText>);

export type CoordinateChoiceMessageKey = keyof typeof coordinateChoiceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CoordinateChoiceMessageKey): LocalizedText => coordinateChoiceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CoordinateChoiceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const coordinateChoiceSchema: BundleSchema = {
  id: COORDINATE_CHOICE_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 어떤 각이든 y′ 는 멈추므로 각을 바꿔 볼 필요가 주장에 들지 않는다.
  parameters: [],

  stages: [{ id: 'incline', label: text('label.stage'), constants: { g: G } }],

  environments: [],

  views: [{ id: 'axes', label: text('label.view'), default: true }],

  /** 원본 캔버스 260 px + 캡션 한 줄. 좌우로 나란히 두어 세로를 아꼈다. */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 겹침 순서가 원본 그대로여야 한다 — 빗면 · 축 · 투영선 · 발자국 · 그림자 · 물체.
   * 어휘별 층으로는 축(vector)이 그림자 점(body) 위로 올라간다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 물체가 이미 0.6 초째 미끄러지는 중이다 (원본 `PHASE0`). */
  startAt: 0.6,

  /**
   * 한 주기 ≈ 3.6 초 — 미끄러지고(slide), 끝에서 멈춘 모습을 보이고(hold),
   * 물체·그림자·발자국이 흐려진 뒤(fade) 꼭대기에서 다시 시작한다.
   */
  timeline: {
    phases: [
      { id: 'slide', duration: T_SLIDE, caption: key('caption.main') },
      { id: 'hold', duration: 0.8, caption: key('caption.main') },
      { id: 'fade', duration: 0.48, caption: key('caption.main') },
    ],
  },

  /** 원본은 캔버스 아래 왼쪽 정렬 문단(15 px, 먹색)이었다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-8, -2] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    text: key('caption.main'),
  },

  /**
   * 그리드를 켜지 않는다. 멈춤은 값 없이 보이고, 눈금 숫자가 동사를 대신하게 두지
   * 않는다 (원본 NOTES (c)).
   */

  messages: coordinateChoiceMessages,
};
