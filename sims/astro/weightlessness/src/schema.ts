// ========================================================================
// weightlessness — 선언
// ========================================================================
// 질문: 우주 정거장 안에서 저울이 0 을 가리키는 것은 거기에 중력이 없어서인가.
//
// 아니다. 정거장이 도는 높이(약 400 km)는 지구 반지름의 6 % 남짓이라, 그곳의 중력은
// 지상의 약 89 % 로 거의 그대로다. 저울이 0 인 것은 정거장과 사람이 **같은 가속도로
// 함께 떨어지고** 있어서 사람이 저울을 누르지 않기 때문이다. 정거장을 그 높이에
// 붙잡아 두면 같은 중력이 사람을 저울에 누르고, 놓으면 곧바로 0 으로 돌아간다.
//
// 엘리베이터가 가속하며 눈금이 오르내리는 비교는 `apparent-weight` 의 몫이고,
// 궤도가 「계속 떨어지는 것」 이라는 것은 `circular-orbit` 의 몫이다. 이 조각은 그 둘
// 사이 — 「0 은 중력이 없어서가 아니라 함께 떨어져서」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:weightlessness` 와 문자 그대로 일치한다 (C4). */
export const WEIGHTLESSNESS_ID = 'weightlessness';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 지구 반지름(km). 궤도 그림의 지구와 궤도 반지름의 비를 정한다. */
export const EARTH_RADIUS_KM = 6371;
/** 정거장의 고도(km). 화면 이름표에 그대로 쓰인다. */
export const ALTITUDE_KM = 400;
/**
 * 그 높이의 중력 — 지상의 몇 % 인가. (6371 / 6771)² = 0.885 를 선언한 값이다.
 * 화면 이름표 · 중력 화살표 길이 · 붙잡힌 저울 눈금에 그대로 쓰인다 — 코드가 셈해 반올림하지 않는다.
 */
export const G_PERCENT = 89;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const weightlessnessMessages = Object.freeze({
  'label.title': { ko: '무중력', en: 'Weightlessness' },
  'label.stage': { ko: '지구 궤도의 정거장', en: 'Station in Earth orbit' },
  'label.view': { ko: '궤도와 정거장 안', en: 'Orbit and inside the station' },
  'label.earth': { ko: '지구', en: 'Earth' },
  'label.altitude': { ko: '고도 {h} km', en: 'altitude {h} km' },
  'label.inside': { ko: '정거장 안 (확대)', en: 'Inside the station (zoomed)' },
  /** 지상 중력을 기준으로 잰 화살표 두 개의 이름. */
  'label.gGround': { ko: '지상 100%', en: 'ground 100%' },
  'label.gHere': { ko: '여기 {pct}%', en: 'here {pct}%' },
  'label.ghost': { ko: '떨어지지 않았다면', en: 'if it did not fall' },
  'label.tower': { ko: '붙잡아 둔다면', en: 'if held in place' },
  /**
   * 저울 이름. 눈금은 kg 이 아니라 **지상에서 잰 몸무게를 100 으로 둔 %** 다 — 붙잡힌 눈금이
   * 중력 화살표의 「여기 89%」 와 같은 수로 읽혀야 하고, 선언값을 셈 없이 그대로 쓴다.
   */
  'label.scale': { ko: '저울 (지상 = 100)', en: 'scale (ground = 100)' },
  /** 저울 눈금 단위. 표기라 번역하지 않는다 (C1 판정 3). */
  'label.unit': { ko: '%', en: '%' },
  'caption.orbit': {
    ko: '정거장 높이에서도 중력은 지상과 거의 같다 — 그런데 저울은 0 을 가리킨다',
    en: "Up at the station gravity is almost as strong as on the ground — yet the scale reads 0",
  },
  'caption.fall': {
    ko: '정거장과 사람이 같은 가속도로 함께 떨어진다 — 발과 저울 사이는 그대로다',
    en: 'The station and the person fall together with the same acceleration — the gap under the feet stays the same',
  },
  'caption.held': {
    ko: '정거장을 그 높이에 붙잡아 두면, 같은 중력이 사람을 저울에 누른다',
    en: 'Hold the station still at that height, and the same gravity presses the person onto the scale',
  },
  'caption.release': {
    ko: '놓으면 다시 함께 떨어지고 저울은 0 — 중력이 없어서가 아니라 함께 떨어져서다',
    en: 'Let go and they fall together again: the scale reads 0 — not because gravity is gone, but because they fall together',
  },
} satisfies Record<string, LocalizedText>);

export type WeightlessnessMessageKey = keyof typeof weightlessnessMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WeightlessnessMessageKey): LocalizedText => weightlessnessMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WeightlessnessMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const weightlessnessSchema: BundleSchema = {
  id: WEIGHTLESSNESS_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 바꿔 볼 값이 주장에 없다 — 높이를 끌게 하면 「높이에 따라
  // 중력이 얼마나 약해지나」 라는 다른 질문(`gravity-inside-earth` · 역제곱)이 끼어든다.
  parameters: [],

  stages: [
    {
      id: 'station',
      label: text('label.stage'),
      constants: {
        earthRadiusKm: EARTH_RADIUS_KM,
        altitudeKm: ALTITUDE_KM,
        gPercent: G_PERCENT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 궤도와 확대 그림을 가로로 나란히 둔다 — 세로가 비싸다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 뜻을 갖는다 — 정거장 선체는 사람 뒤, 화살표는 사람 위로 지나야 하고,
   * 떨어지지 않았다면의 점선 선체는 모든 것 아래에 깔린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떠 있음 → 함께 떨어짐 → 붙잡음 → 붙잡힌 채 → 놓음 → 되돌림.
   *
   * - `orbit` 정거장 안을 정거장과 함께 보는 그림. 사람은 저울 위에 떠 있고 눈금은 0,
   *   그런데 사람에게 걸린 중력 화살표는 지상 화살표와 거의 같은 길이다.
   * - `fall` 같은 그림을 「떨어지지 않았다면」 의 자리(점선)에 대어 본다. 선체 · 저울 ·
   *   사람이 같은 가속도로 함께 내려가고 발과 저울 사이는 그대로다. 눈금은 0.
   * - `catch` · `held` 정거장을 그 높이에 붙잡아 두면(아래 받침) 사람이 저울로 내려앉고
   *   눈금이 오른다. 궤도의 정거장도 멈춘다.
   * - `release` 받침이 사라지면 다시 함께 떨어지고 눈금은 곧바로 0.
   * - `reset` 확대 그림이 처음 자리로 돌아간다.
   *
   * 궤도의 정거장은 `catch` · `held` 에서 멈추고, 그 밖의 시간을 모두 합쳐 한 바퀴를 돈다
   * — 각속도는 시간표에서 끌어온다(physics `orbitAngle`).
   */
  timeline: {
    phases: [
      { id: 'orbit', duration: 3.2, caption: key('caption.orbit') },
      { id: 'fall', duration: 2.6, caption: key('caption.fall') },
      { id: 'catch', duration: 0.6, ease: 'smooth', caption: key('caption.held') },
      { id: 'held', duration: 2.8, caption: key('caption.held') },
      { id: 'release', duration: 2.6, caption: key('caption.release') },
      { id: 'reset', duration: 0.8, ease: 'smooth', caption: key('caption.release') },
    ],
  },

  /**
   * 도착한 순간 이미 정거장이 궤도를 돌고 있다 — 궤도의 첫 몫이 지나간 자리에서 연다.
   * 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 0.6,

  // 슬롯 하나. 궤도와 확대 그림 아래 한 줄 — 지금 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 화살표의 길이 비**와
   * **눈금이 0 인가** 다 — 격자를 깔면 「몇 미터 떨어졌나」 가 끼어든다.
   */

  messages: weightlessnessMessages,
};
