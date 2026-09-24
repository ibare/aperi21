// ========================================================================
// rocket-equation — 선언
// ========================================================================
// 질문: 연료를 같은 양씩 같은 빠르기로 뿜는데, 왜 속도가 연료에 비례하지 않나?
//
// 답의 동사는 **커진다** 다. 칸마다 담긴 연료도 같고 뿜는 빠르기도 같은데, 한 칸이
// 붙이는 속도는 뒤로 갈수록 커진다 — 먼저 태운 칸은 아직 실려 있는 연료까지 함께
// 밀어야 하기 때문이다. 화면에서는 칸 아래 막대가 점점 길어지고, 로켓 곁을 지나는
// 별의 획이 점점 길어진다.
//
// 이 조각은 엔진 어휘 위에서 바로 지었다(자유 구현 원본 없음).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rocket-equation` 와 문자 그대로 일치한다 (C4). */
export const ROCKET_EQUATION_ID = 'rocket-equation';

// ------------------------------------------------------------------------
// 로켓 — 질량은 「칸」 을 단위로 잰다. 칸 하나가 질량 1.
// ------------------------------------------------------------------------

/** 연료 칸 수. 뒤(왼쪽) 칸부터 태운다. */
export const BLOCKS = 8;
/** 연료가 아닌 몫(짐 + 구조)의 질량. 칸 두 개어치. */
export const DRY_MASS = 2;

/**
 * 뿜는 빠르기(월드 단위/초). 로켓과 함께 가는 눈으로 보면 배기는 언제나 이 속도로
 * 뒤로 나간다 — 칸마다 같다는 것이 이 조각의 전제다.
 *
 * 최종 속도는 `EXHAUST_SPEED × ln(10/2)` = 3.70 월드/초.
 */
export const EXHAUST_SPEED = 2.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가로가 넓고 세로가 좁은 임베드를 가정한다 (S-piece).
// ------------------------------------------------------------------------

/** 로켓 몸통의 가운데 높이와 반높이. */
export const BODY_Y = 1.3;
export const BODY_HALF_H = 0.22;
/** 연료 칸 줄의 뒤 끝 x 와 칸 하나의 폭. */
export const TANK_REAR_X = -2.55;
export const BLOCK_W = 0.52;
/** 연료 칸 줄의 앞 끝 = 짐이 시작하는 자리. */
export const TANK_FRONT_X = TANK_REAR_X + BLOCKS * BLOCK_W;
/** 뾰족한 앞 끝. */
export const NOSE_TIP_X = TANK_FRONT_X + 0.84;
/** 노즐이 뒤로 벌어지는 길이와 끝 반높이. */
export const NOZZLE_LEN = 0.18;
export const NOZZLE_HALF_H = 0.31;

/** 막대가 서는 바닥. */
export const BAR_BASE_Y = -1.05;
/** 막대 폭과 높이 배율(속도 1 = `EXHAUST_SPEED` 단위당 월드 길이). */
export const BAR_W = 0.34;
/** 가장 긴 막대(마지막 칸)가 별 띠 바로 아래까지 서게 잡은 값. */
export const BAR_SCALE = 4.686;

/** 별이 깔리는 띠와 감기는 가로 범위. */
export const STAR_BAND: readonly [number, number] = [1.0, 2.08];
export const STAR_SPAN: readonly [number, number] = [-4.4, 4.4];
export const STAR_COUNT = 38;
/** 별 획의 길이 = 속도 × 이 시간(초). 정지 화면에서도 속력이 길이로 읽힌다. */
export const STAR_TRAIL_SECONDS = 0.2;

/**
 * 프레이밍. 매 프레임 같은 값이다 — 프레이밍은 주장의 일부다 (S-piece).
 * 아래쪽 여백은 캡션 줄의 자리다.
 */
export const SCENE_BOUNDS = { minX: -4.25, maxX: 4.25, minY: -1.8, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 화면 치수 — 물리량이 아니라 표현이라 배율을 따라가지 않는다.
// ------------------------------------------------------------------------

/** 별 획의 굵기 · 짙기(화면 px). */
export const STAR_TRAIL_WIDTH_PX = 1.2;
export const STAR_TRAIL_OPACITY = 0.6;
/** 배기 획의 굵기와 끝 흩날림(화면 px). */
export const EXHAUST_WIDTH_PX = 3;
export const EXHAUST_JITTER_PX = 7;
/**
 * 초당 배기 획 수와 획 하나의 수명(초). 획 하나가 짧아(속도 × 0.02 초) 성기면
 * 점선으로 읽힌다 — 촘촘히 뿜어야 「연료가 뒤로 나간다」 로 보인다.
 */
export const EXHAUST_RATE = 96;
export const EXHAUST_LIFE = 0.5;
/** 칸 이름표 · 막대 이름표 글자 크기(화면 px). */
export const LABEL_FONT_PX = 12;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rocketEquationMessages = Object.freeze({
  'label.title': { ko: '로켓 방정식', en: 'The rocket equation' },
  'label.stage': { ko: '연료 여덟 칸', en: 'Eight fuel compartments' },
  'label.view': { ko: '로켓과 얻은 속도', en: 'Rocket and the speed it gained' },

  /** 막대 줄의 이름. 막대가 무엇인지 말해 주는 유일한 글자다. */
  'label.gain': { ko: '한 칸이 붙인 속도', en: 'speed added by one compartment' },

  'caption.early': {
    ko: '칸마다 같은 양의 연료를 같은 빠르기로 뒤로 뿜는다. 아직 실려 있는 연료가 무거워 한 칸이 붙이는 속도는 작다.',
    en: 'Each compartment throws the same fuel backward at the same exhaust speed. The fuel still aboard is heavy, so one compartment adds little speed.',
  },
  'caption.later': {
    ko: '로켓이 가벼워질수록 같은 한 칸이 붙이는 속도가 커진다 — 아래 막대가 길어지고, 지나가는 별의 획도 길어진다.',
    en: 'As the rocket gets lighter, the same one compartment adds more speed — the bars below grow longer, and so do the star streaks going past.',
  },
  'caption.hold': {
    ko: '마지막 칸이 붙인 속도는 첫 칸의 네 배에 가깝다. 먼저 태운 칸은 뒤에 남은 연료까지 함께 밀어야 했다.',
    en: 'The last compartment added nearly four times what the first did. The earlier ones had to push the fuel still aboard as well.',
  },
} satisfies Record<string, LocalizedText>);

export type RocketEquationMessageKey = keyof typeof rocketEquationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로 (C1). */
export const text = (key: RocketEquationMessageKey): LocalizedText => rocketEquationMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RocketEquationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rocketEquationSchema: BundleSchema = {
  id: ROCKET_EQUATION_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다. 아무것도 누르지 않아도 여덟 칸이 차례로 타며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'eight-blocks',
      label: text('label.stage'),
      constants: { blocks: BLOCKS, dryMass: DRY_MASS, exhaustSpeed: EXHAUST_SPEED },
    },
  ],

  environments: [],

  views: [{ id: 'gain', label: text('label.view'), default: true }],

  /**
   * 가로 8.5 · 세로 3.95 월드를 담는다. 900 px 폭 임베드에서 가로가 먼저 차도록
   * 세로를 잡았다 — 세로가 먼저 차면 막대 줄이 작아져 길이 차이가 죽는다.
   */
  canvas: { height: 430, minHeight: 390 },

  /**
   * 쓴 순서대로 겹친다 — 별은 몸통 뒤로 지나가고(몸통 안쪽 면이 별을 가린다),
   * 막대는 별 띠 아래라 겹치지 않는다. 층 순서로는 별(`particleSystem`)이 면 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 도착한 순간 이미 다섯 번째 칸을 태우는 중이다 (S-piece). 네 칸의 막대가 이미
   * 서 있고 별이 흐르고 있어, 빈 화면이 채워지기를 기다리지 않는다.
   */
  startAt: 4.6,

  /**
   * 한 주기 12.3 초. 칸마다 태우기(0.75) + 쉬기(0.35)를 여덟 번 하고, 다 탄 막대 줄을
   * 2.6 초 보여 준 뒤(`hold`), 0.9 초 동안 막대가 옅어지며 연료가 다시 찬다(`clear`).
   *
   * 태우는 동안의 이징은 `linear` 여야 한다 — 연료가 일정한 유량으로 나가는 것이
   * 「같은 양의 연료」 라는 전제이고, 막대가 자라는 모양이 곧 그 적분이다.
   *
   * 캡션은 앞 세 칸과 뒤 다섯 칸이 다르게 말한다. 이웃 단계가 같은 키면 다시 페이드하지
   * 않으므로 한 문장이 칸을 넘어 이어진다.
   */
  timeline: {
    phases: [
      { id: 'burn-1', duration: 0.75, caption: key('caption.early') },
      { id: 'coast-1', duration: 0.35, caption: key('caption.early') },
      { id: 'burn-2', duration: 0.75, caption: key('caption.early') },
      { id: 'coast-2', duration: 0.35, caption: key('caption.early') },
      { id: 'burn-3', duration: 0.75, caption: key('caption.early') },
      { id: 'coast-3', duration: 0.35, caption: key('caption.early') },
      { id: 'burn-4', duration: 0.75, caption: key('caption.later') },
      { id: 'coast-4', duration: 0.35, caption: key('caption.later') },
      { id: 'burn-5', duration: 0.75, caption: key('caption.later') },
      { id: 'coast-5', duration: 0.35, caption: key('caption.later') },
      { id: 'burn-6', duration: 0.75, caption: key('caption.later') },
      { id: 'coast-6', duration: 0.35, caption: key('caption.later') },
      { id: 'burn-7', duration: 0.75, caption: key('caption.later') },
      { id: 'coast-7', duration: 0.35, caption: key('caption.later') },
      { id: 'burn-8', duration: 0.75, caption: key('caption.later') },
      { id: 'coast-8', duration: 0.35, caption: key('caption.later') },
      { id: 'hold', duration: 2.6, caption: key('caption.hold') },
      { id: 'clear', duration: 0.9, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 (S-piece). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 800,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.later'),
  },

  // 그리드 · 축 눈금 · 값 표시를 두지 않는다. 잴 것은 거리가 아니라 **막대끼리의
  // 길이 비**이고, 그것은 한 바닥 위에 나란히 선 막대가 직접 보여 준다.

  messages: rocketEquationMessages,
};
