// ========================================================================
// light-bending-by-gravity — 선언
// ========================================================================
// 질문: 먼 별의 빛이 태양 가장자리를 스쳐 지구에 온다. 태양의 질량은 그 빛에 무슨 일을 하는가.
//
// 빛의 길이 태양 쪽으로 휜다. 지구의 관측자는 빛이 **들어온 방향을 곧게 거슬러** 별을 찾으므로,
// 별은 실제 자리보다 태양에서 바깥쪽으로 비껴 보인다. 가장자리를 스치는 빛이 휘는 각은 1.75″ —
// 1919 년 일식 때 태양 곁 별들의 자리를 밤하늘 사진과 견주어 잰 값이다.
//
// 1.75″ 는 보이지 않는 각이라 **그림은 각을 키워 그린다.** 그 배율은 스테이지 상수
// `exaggeration` 으로 선언하고, 화면 왼쪽 위 한 줄이 과장했다고 말한다.
//
// 등가 원리(`equivalence-principle`)는 상자 안 공의 낙하로 「가속 = 중력」 에 머물렀다. 이 조각은
// 빛 하나의 길에 머문다. 지평선(`black-hole-horizon`)의 「빛이 못 나온다」 와도 다르다 — 여기서
// 빛은 빠져나가되 길이 꺾인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:light-bending-by-gravity` 와 문자 그대로 일치한다 (C4). */
export const LIGHT_BENDING_BY_GRAVITY_ID = 'light-bending-by-gravity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 태양 가장자리를 스치는 빛이 휘는 각(각초, ″). 일반 상대론의 값 4GM/(c²R) 이다.
 * 화면의 각 이름표에 선언값 그대로 쓰인다(코드가 셈해 줄이지 않는다).
 */
export const DEFLECTION_ARCSEC = 1.75;
/**
 * 그림에서 휜 각을 키운 배율. 1.75″ × 18000 ≈ 8.8° — 이만큼 키워야 휜 것과 비껴 보이는 것이
 * 눈에 들어온다. 화면 왼쪽 위 과장 알림에 선언값 그대로 쓰인다.
 */
export const EXAGGERATION = 18000;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lightBendingByGravityMessages = Object.freeze({
  'label.title': { ko: '빛의 휨', en: 'Bending of light' },
  'label.operation': { ko: '질량 근처에서 휘는 경로', en: 'The path of light bends near a mass' },
  'label.stage': { ko: '태양 가장자리를 스치는 별빛', en: 'Starlight grazing the Sun' },
  'label.view': { ko: '별 · 태양 · 지구', en: 'Star, Sun and Earth' },
  'label.sun': { ko: '태양', en: 'Sun' },
  'label.earth': { ko: '지구', en: 'Earth' },
  'label.star': { ko: '별', en: 'star' },
  'label.truePos': { ko: '실제 자리', en: 'true position' },
  'label.seenPos': { ko: '보이는 자리', en: 'where it appears' },
  'label.unbent': { ko: '휘지 않았다면', en: 'if it did not bend' },
  /** 휜 각. 값은 선언된 각초를 그대로 끼운다. `″` 는 단위 기호(표식)다. */
  'label.angle': { ko: '{a}″', en: '{a}″' },
  /** 과장 알림. 값은 선언된 배율을 그대로 끼운다. */
  'label.exaggerated': {
    ko: '휜 각은 {x}배로 키워 그렸다',
    en: 'Bending angle drawn {x}× larger than real',
  },
  'caption.approach': {
    ko: '먼 별의 빛이 태양 가장자리를 스치러 다가간다',
    en: 'Light from a distant star heads past the edge of the Sun',
  },
  'caption.bend': {
    ko: '태양 곁을 지나며 빛의 길이 태양 쪽으로 휜다',
    en: 'Passing the Sun, the path of the light bends toward it',
  },
  'caption.trace': {
    ko: '지구에서는 빛이 들어온 방향을 곧게 거슬러 별을 찾는다',
    en: 'On Earth we trace the incoming light straight back to find the star',
  },
  'caption.shifted': {
    ko: '그래서 별은 실제 자리보다 태양에서 바깥쪽으로 비껴 보인다',
    en: 'So the star appears shifted outward, away from the Sun',
  },
} satisfies Record<string, LocalizedText>);

export type LightBendingByGravityMessageKey = keyof typeof lightBendingByGravityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LightBendingByGravityMessageKey): LocalizedText => lightBendingByGravityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LightBendingByGravityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lightBendingByGravitySchema: BundleSchema = {
  id: LIGHT_BENDING_BY_GRAVITY_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 바꿔 볼 만한 것은 스치는 거리(멀수록 덜 휜다)인데, 그것은 이 조각의
  // 주장(휜다 → 비껴 보인다)과 다른 주장이다. 한 번의 자동 진행이 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'grazing',
      label: text('label.stage'),
      constants: {
        deflectionArcsec: DEFLECTION_ARCSEC,
        exaggeration: EXAGGERATION,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 별 · 태양 · 지구가 가로로 길게 놓인다. 세로는 캡션 한 줄 몫까지만. */
  canvas: { height: 320, minHeight: 280 },

  /** 겹침이 뜻을 갖는다 — 태양 위에 빛의 길, 그 위에 광자와 별, 이름표는 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 다가감 → 휨 → 거슬러 봄 → 표시 → 견줌 → 비움.
   *
   * - `approach` 별에서 나온 빛(광자)이 태양 가장자리로 다가간다. 지나온 길이 남는다.
   * - `bend` 태양 곁을 지나며 길이 태양 쪽으로 꺾여 지구에 닿는다. 휘지 않았다면 갔을 곧은 길이
   *   점선으로 따라 뻗어, 꺾인 만큼이 보인다.
   * - `trace` 지구에서 빛이 들어온 방향을 곧게 거슬러 점선이 뻗고, 그 끝에 보이는 별이 떠오른다.
   * - `mark` 「실제 자리」 · 「보이는 자리」 이름표, 바깥쪽 화살표, 휜 각의 부채꼴이 나타난다.
   * - `compare` 머문다 — 두 자리를 견준다.
   * - `reset` 빛의 길과 표시가 사라지고 별 · 태양 · 지구만 남는다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 1.6, caption: key('caption.approach') },
      { id: 'bend', duration: 1.8, caption: key('caption.bend') },
      { id: 'trace', duration: 1.4, ease: 'smooth', caption: key('caption.trace') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.shifted') },
      { id: 'compare', duration: 3.2, caption: key('caption.shifted') },
      { id: 'reset', duration: 0.7, ease: 'smooth', caption: key('caption.shifted') },
    ],
  },

  /**
   * 도착한 순간 빛이 막 태양 곁을 지나 휘고 있다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 2.2,

  // 슬롯 하나. 그림 아래 한 줄 — 지금 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 각을 과장해 그렸으므로 격자로 잴 수 있는 거리가 없다.
   */

  messages: lightBendingByGravityMessages,
};
