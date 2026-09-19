// ========================================================================
// magnetic-poles — 선언
// ========================================================================
// 질문: 자석끼리는 서로 당기는가, 미는가?
//
// 답: 어느 극이 마주 보느냐에 달렸다. 선로 끝에 고정한 막대자석 앞에, 수레 위
// 돌림판에 얹은 자석이 있다. S극이 고정 자석의 N극을 마주 보게 돌리면 수레가 끌려
// 다가와 붙고, 같은 자석을 돌려 N극끼리 마주 보게 하면 수레가 밀려 물러난다.
// 바꾼 것은 자석의 방향 하나뿐이다.
//
// 이 조각은 「다른 극은 당기고 같은 극은 민다」 에 머문다. 둘레의 자기장 모양은
// magnetic-field(쇳가루), 자기력선은 magnetic-field-lines 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-poles` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_POLES_ID = 'magnetic-poles';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이다. 화면에 수치를 띄우지 않으므로 절대 단위를 쓰지 않는다.
// ------------------------------------------------------------------------

/** 막대자석의 길이 · 폭. 두 자석이 같은 크기다. */
export const MAGNET_LENGTH = 1.2;
export const MAGNET_WIDTH = 0.3;
/**
 * 자극이 자석 끝에서 안쪽으로 들어간 거리. 자극은 끝면이 아니라 끝 가까이에
 * 모여 있다고 보고, 극 하나를 이 자리의 점 하나로 둔다.
 */
export const POLE_INSET = 0.15;
/**
 * 극 세기 배율. 극 둘 사이 힘 = 이 값 × (±1)(±1) / 거리² 을 수레 질량으로 나눈
 * 가속도다. 자극 세기 · 수레 질량을 한 수로 묶은 **표시 배율**이다 — 이 값이 정하는
 * 것은 「멀리서는 느리게 끌려오다 가까워질수록 빨라진다」 의 시간 척도다.
 */
export const POLE_STRENGTH = 30;
/**
 * 바퀴 · 공기가 수레를 붙잡는 감쇠(1/s). 속도에 비례해 늦춘다. 이것이 없으면
 * 밀려난 수레가 멈춤막이에 세게 부딪치고, 끌려온 수레가 튀어 오른다.
 */
export const DAMPING = 3.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 선로는 x 축을 따라 눕고, 위에서 내려다본다.
// ------------------------------------------------------------------------

/** 고정 자석의 가운데 x. 왼쪽 끝이 고정대에 닿는다. N극이 오른쪽(수레 쪽)이다. */
export const FIXED_MAGNET_X = -1.9;
/**
 * 수레 판의 선로 방향 길이. 돌림판 위 자석이 돌 때 판 밖으로 나가지 않을 만큼 크다.
 * 수레가 고정 자석에 붙어도 두 자석 끝 사이에 (판 − 자석 길이)/2 의 틈이 남는다.
 */
export const DECK_SIZE = 1.8;
/** 선로 오른쪽 끝의 멈춤막이 x. 밀려난 수레가 여기서 선다. */
export const TRACK_END_X = 2.6;

/**
 * 프레이밍 — 왼쪽 고정대부터 오른쪽 멈춤막이까지, 아래로는 캡션 줄.
 * 매 프레임 같은 값이다 (원칙 6 · S-piece).
 */
export const SCENE_BOUNDS = { minX: -2.75, maxX: 2.8, minY: -1.3, maxY: 0.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticPolesMessages = Object.freeze({
  'label.title': { ko: '자석의 두 극', en: 'The two poles of a magnet' },
  'label.operation': {
    ko: '같은 극은 밀고 다른 극은 당긴다',
    en: 'Like poles repel, unlike poles attract',
  },
  'label.stage': { ko: '고정 자석과 수레 위 자석', en: 'A fixed magnet and a magnet on a cart' },
  'label.view': { ko: '위에서 본 선로', en: 'Track seen from above' },

  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
  'mark.north': { ko: 'N', en: 'N' },
  'mark.south': { ko: 'S', en: 'S' },

  'caption.turnAttract': {
    ko: '수레를 붙잡고 위의 자석을 돌려, S극이 고정된 자석의 N극을 마주 보게 한다',
    en: "Holding the cart, turn its magnet so its S pole faces the fixed magnet's N pole",
  },
  'caption.attract': {
    ko: '다른 극끼리 마주 보면 당긴다 — 수레가 끌려 다가온다',
    en: 'Unlike poles facing each other attract — the cart is pulled in',
  },
  'caption.near': {
    ko: 'N극과 S극이 서로 당겨, 수레가 고정된 자석에 붙어 있다',
    en: 'N and S pull on each other, holding the cart against the fixed magnet',
  },
  'caption.turnRepel': {
    ko: '수레를 붙잡고 자석을 돌려, 이번에는 N극끼리 마주 보게 한다',
    en: 'Holding the cart, turn the magnet so that now N faces N',
  },
  'caption.repel': {
    ko: '같은 극끼리 마주 보면 민다 — 수레가 밀려 물러난다',
    en: 'Like poles facing each other repel — the cart is pushed away',
  },
  'caption.far': {
    ko: '같은 수레, 같은 자석 — 돌려서 마주 보는 극만 바꿨다',
    en: 'Same cart, same magnet — only the facing pole was turned around',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticPolesMessageKey = keyof typeof magneticPolesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticPolesMessageKey): LocalizedText => magneticPolesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticPolesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticPolesSchema: BundleSchema = {
  id: MAGNETIC_POLES_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에서 자석이 두 번 돌고, 당김과 밀림이 차례로 일어난다.
  parameters: [],

  stages: [
    {
      id: 'fixed-and-cart',
      label: text('label.stage'),
      constants: {
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        poleInset: POLE_INSET,
        poleStrength: POLE_STRENGTH,
        damping: DAMPING,
        fixedMagnetX: FIXED_MAGNET_X,
        deckSize: DECK_SIZE,
        trackEndX: TRACK_END_X,
      },
    },
  ],

  environments: [],

  views: [{ id: 'top', label: text('label.view'), default: true }],

  /** 가로로 누운 선로 하나. 세로는 수레 판과 캡션 줄만큼이면 된다 (S-piece — 세로가 비싸다). */
  canvas: { height: 320, minHeight: 280 },

  /** 겹침 순서 — 판 · 돌림판 · 자석의 N 반쪽 채움 · 자석 둘레 · 표식 순으로 쌓는다. */
  drawOrder: 'scene',

  /**
   * 한 주기.
   *
   * - `turnAttract` — 수레가 멈춤막이에 선 채로 자석이 돈다. 끝나면 S극이 고정 자석의
   *   N극을 마주 본다.
   * - `attract` · `near` — 수레를 놓는다. 수레의 자리는 놓은 뒤 흐른 시간의 함수다
   *   (physics.cartX). 멀리서는 느리게 끌려오다 가까워질수록 빨라져 붙고, 붙은 채 머문다.
   * - `turnRepel` — 붙은 자리에서 자석이 돈다. 끝나면 N극끼리 마주 본다.
   * - `repel` · `far` — 놓으면 밀려 물러나다 느려져 멈춤막이에 선다.
   *
   * 끝나면 멈춤막이에 선 수레에서 다시 돌리기 시작하므로 주기가 이어진다.
   */
  timeline: {
    phases: [
      { id: 'turnAttract', duration: 1, ease: 'smooth', caption: key('caption.turnAttract') },
      { id: 'attract', duration: 3.6, caption: key('caption.attract') },
      { id: 'near', duration: 1.4, caption: key('caption.near') },
      { id: 'turnRepel', duration: 1, ease: 'smooth', caption: key('caption.turnRepel') },
      { id: 'repel', duration: 1.6, caption: key('caption.repel') },
      { id: 'far', duration: 1.4, caption: key('caption.far') },
    ],
  },

  /** 도착한 순간 이미 자석이 돌고 있다 (S-piece). */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 14,
    wrapWidth: 760,
    fade: 0.2,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 묻는 것은 거리가 아니라
  // 수레가 어느 쪽으로 가는가다 — 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: magneticPolesMessages,
};
