// ========================================================================
// equivalence-principle — 선언
// ========================================================================
// 질문: 창 없는 상자 안에서 공을 놓았더니 바닥으로 떨어졌다. 이 상자는 지구 위에 서 있는가,
// 아니면 우주에서 g 로 가속하고 있는가 — 안에서 가릴 수 있는가.
//
// 가릴 수 없다. 바깥에서 보면 두 일은 다르다 — 우주의 상자에서는 공이 제자리에 떠 있고
// **바닥이 공을 향해 올라오며**, 지구의 상자에서는 **공이 바닥으로 떨어진다.** 그런데 상자 안에
// 남는 기록(같은 시간 간격으로 찍은 공의 자리)은 두 상자가 똑같다. 창을 가리면 두 상자 안의
// 낙하는 한 치도 다르지 않다.
//
// 무중력(`weightlessness`)이 「함께 떨어지면 중력이 사라진 것처럼 보인다」 를 맡고, 이 조각은
// 그 짝 — 「가속하면 중력이 생긴 것처럼 보인다」 에 머문다. 빛의 휨은 `light-bending-by-gravity`
// 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:equivalence-principle` 와 문자 그대로 일치한다 (C4). */
export const EQUIVALENCE_PRINCIPLE_ID = 'equivalence-principle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * g(m/s²). 우주 상자의 가속도이자 지구 상자의 중력 가속도 — 둘이 같은 값이라는 것이 이 그림의
 * 조건이다. 화살표 두 개의 길이와 이름표에 그대로 쓰인다(코드가 셈해 줄이지 않는다).
 */
export const G_MS2 = 9.8;
/** 공을 놓는 높이 — 상자 바닥에서 공 아래 끝까지(m). 월드 1 = 1 m. */
export const DROP_HEIGHT_M = 1.3;
/** 우주 쪽 배경 별을 흩뿌리는 결정적 난수의 시드. */
export const STAR_SEED = 7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const equivalencePrincipleMessages = Object.freeze({
  'label.title': { ko: '등가 원리', en: 'Equivalence principle' },
  'label.stage': { ko: '가속하는 상자와 지구 위 상자', en: 'Accelerating box and box on Earth' },
  'label.view': { ko: '두 상자 나란히', en: 'Two boxes side by side' },
  'label.space': { ko: '우주 — 가속하는 상자', en: 'In space — accelerating' },
  'label.earth': { ko: '지구 위 — 서 있는 상자', en: 'On Earth — standing still' },
  /** 창을 가린 뒤 두 상자 위에 뜨는 표식. */
  'label.unknown': { ko: '?', en: '?' },
  /** 상자의 가속도. 값은 선언된 g 를 그대로 끼운다. */
  'label.accel': { ko: 'a = {g} m/s²', en: 'a = {g} m/s²' },
  /** 공에 걸린 중력 가속도. */
  'label.gravity': { ko: 'g = {g} m/s²', en: 'g = {g} m/s²' },
  'caption.setup': {
    ko: '왼쪽 상자는 우주에서 g 로 가속하고, 오른쪽 상자는 지구 위에 서 있다',
    en: 'The left box accelerates at g through space; the right box stands on Earth',
  },
  'caption.drop': {
    ko: '공을 놓으면 — 왼쪽은 바닥이 공을 향해 올라오고, 오른쪽은 공이 바닥으로 떨어진다',
    en: 'Let go of the ball: on the left the floor rises to meet it, on the right the ball falls to the floor',
  },
  'caption.same': {
    ko: '그런데 상자 안에 남은 공의 자국은 두 상자가 똑같다',
    en: 'Yet the marks the ball left inside each box are exactly the same',
  },
  'caption.close': {
    ko: '창을 가리고 상자 안에서만 본다',
    en: 'Cover the windows and watch only from inside',
  },
  'caption.inside': {
    ko: '안에서 보면 두 공은 똑같이 떨어진다 — 가속인지 중력인지 가릴 수 없다',
    en: 'From inside both balls fall exactly alike — no way to tell acceleration from gravity',
  },
} satisfies Record<string, LocalizedText>);

export type EquivalencePrincipleMessageKey = keyof typeof equivalencePrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EquivalencePrincipleMessageKey): LocalizedText => equivalencePrincipleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EquivalencePrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const equivalencePrincipleSchema: BundleSchema = {
  id: EQUIVALENCE_PRINCIPLE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다. 주장의 조건이 「가속도 = g」 하나라, 독자가 한쪽 값을 끌면 두 상자가 달라져
  // 「구별할 수 있다」 는 반대 그림이 된다. 바꿔 볼 것이 주장에 없다.
  parameters: [],

  stages: [
    {
      id: 'boxes',
      label: text('label.stage'),
      constants: {
        gMs2: G_MS2,
        dropHeightM: DROP_HEIGHT_M,
        seed: STAR_SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 두 상자를 가로로 나란히 둔다. 왼쪽 상자가 낙하 높이만큼 올라오는 몫을 세로에 잡는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 겹침이 뜻을 갖는다 — 별과 땅은 상자 뒤, 상자 속 칠은 별을 가리고, 자국 · 공 · 선반은
   * 그 위, 화살표와 이름표는 맨 위.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 준비 → 바깥에서 본 낙하 → 자국 비교 → 창을 가림 → 안에서 본 낙하 → 머묾 → 창을 엶.
   *
   * - `hold` 두 상자 안에서 공이 선반 끝에 놓여 있다. 왼쪽 상자에는 불꽃과 위로 향한 가속도,
   *   오른쪽 상자 옆에는 아래로 향한 중력 — 같은 길이.
   * - `drop` 바깥에서 본다. 왼쪽은 공이 제자리에 있고 상자가 올라와 바닥이 공에 닿는다.
   *   오른쪽은 상자가 서 있고 공이 떨어진다. 두 상자 안에 같은 시간 간격의 자국이 쌓인다.
   * - `landed` 두 상자가 같은 높이에 나란히 멈춘 순간 — 자국이 똑같다.
   * - `close` 창을 가린다 — 별 · 불꽃 · 땅 · 화살표 · 이름이 사라지고 `?` 가 뜬다. 공은 선반으로.
   * - `inside` · `insideHold` 안에서 본 낙하. 두 상자 모두 서 있는 것처럼 그려지고 공이 똑같이 떨어진다.
   * - `open` 창을 다시 열고 왼쪽 상자가 처음 자리로 돌아간다.
   *
   * 낙하 단계는 실제 낙하 시간(√(2h/g) ≈ 0.5 초)보다 느리게 둔다 — 자국 사이 간격이 보여야 한다.
   * 모양(진행도의 제곱)은 등가속 그대로다.
   */
  timeline: {
    phases: [
      { id: 'hold', duration: 1.2, caption: key('caption.setup') },
      { id: 'drop', duration: 1.6, caption: key('caption.drop') },
      { id: 'landed', duration: 1.8, caption: key('caption.same') },
      { id: 'close', duration: 0.9, ease: 'smooth', caption: key('caption.close') },
      { id: 'inside', duration: 1.6, caption: key('caption.inside') },
      { id: 'insideHold', duration: 1.8, caption: key('caption.inside') },
      { id: 'open', duration: 0.9, ease: 'smooth', caption: key('caption.setup') },
    ],
  },

  /**
   * 도착한 순간 이미 공이 떨어지고 있다 — 바깥에서 본 낙하의 한가운데에서 연다.
   * 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 1.9,

  // 슬롯 하나. 두 상자 아래 한 줄 — 지금 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 거리가 아니라 **두 상자 안 자국의 모양**이다.
   * 격자를 깔면 격자 자체가 「바깥에서 재는 자」 가 되어 창을 가린다는 설정과 어긋난다.
   */

  messages: equivalencePrincipleMessages,
};
