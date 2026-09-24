// ========================================================================
// wetting-and-contact-angle — 선언
// ========================================================================
// 질문: 같은 물방울이 왜 어떤 표면에서는 얇게 퍼지고 어떤 표면에서는 구슬처럼 뭉치는가.
//
// 물방울 가장자리(세 상이 만나는 선)에서 세 장력이 줄다리기를 한다 — 고체·공기 장력은
// 가장자리를 바깥으로, 고체·물 장력은 안으로, 물·공기 장력은 물 표면을 따라 끈다.
// 가로 몫이 맞는 각에서 가장자리가 멈추고, 그 각이 접촉각이다(영의 식). 표면을 깨끗한
// 유리에서 왁스로 바꾸면 바깥으로 끄는 힘이 약해지고 안으로 끄는 힘이 세져 가장자리가
// 밀려 들어오고, 방울은 다시 맞는 높은 각까지 뭉친다.
//
// 막이 휘어 받치는 것(`surface-tension`) · 곡률이 만드는 압력차(`laplace-pressure`) ·
// 관 속으로 오르는 것(`capillary-action`)은 이웃 조각의 몫이라 여기서 말하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wetting-and-contact-angle` 와 문자 그대로 일치한다 (C4). */
export const WETTING_AND_CONTACT_ANGLE_ID = 'wetting-and-contact-angle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 장력은 물·공기 표면 장력 γ 를 1 로 잰 단위(단위 길이당), 길이는 월드 단위다.
// ------------------------------------------------------------------------

/** 물·공기 표면 장력 γ. 두 표면에서 같다 — 바뀌는 것은 고체 쪽 둘뿐이다. */
export const LIQUID_TENSION = 1;
/** 깨끗한 유리의 고체·공기 장력. 바깥으로 세게 끈다. */
export const GLASS_SOLID_AIR = 1.2;
/** 깨끗한 유리의 고체·물 장력. 약하다 — cos θ = (1.2 − 0.33)/1 = 0.87, θ ≈ 30°. */
export const GLASS_SOLID_LIQUID = 0.33;
/** 왁스의 고체·공기 장력. 바깥으로 약하게 끈다. */
export const WAX_SOLID_AIR = 0.5;
/** 왁스의 고체·물 장력. 세다 — cos θ = (0.5 − 1.1)/1 = −0.6, θ ≈ 127°. */
export const WAX_SOLID_LIQUID = 1.1;
/** 물방울 단면의 넓이(월드 단위²). 두 표면에서 같은 방울이다 — 모양만 바뀐다. */
export const DROP_AREA = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 장력 화살표 길이 = 장력 × 이 배율. 세 장력과 알짜 힘이 같은 배율이라 길이끼리 견준다. */
export const FORCE_SCALE = 0.75;
/** 고체 판의 가로 끝 · 두께. 프레이밍보다 넓게 깔아 끝이 비치지 않게 한다. */
export const PLATE_HALF_WIDTH = 5;
export const PLATE_DEPTH = 0.42;
/** 알짜 힘 화살표를 고체 면 아래로 내리는 거리 — 세 장력과 한 줄에 겹치지 않게. */
export const NET_DROP = 0.22;
/** 접촉각 부채꼴의 반지름. */
export const ANGLE_RADIUS = 0.3;
/** 표면 이름을 적는 자리(판 안, 왼쪽). */
export const SURFACE_LABEL_AT = [-2.3, -PLATE_DEPTH / 2] as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 유리 위에서 퍼진 방울(반폭 약 1.7)과 오른쪽 가장자리의
 * 고체·공기 화살표 끝까지, 세로는 판 밑부터 왁스 위에서 뭉친 방울 꼭대기 위 캡션 줄까지.
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.8, maxX: 3.0, minY: -0.62, maxY: 1.62 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 (초)
// ------------------------------------------------------------------------

export const SPREAD = 2.4;
export const COAT = 0.8;
export const BEAD = 2.6;
export const BEADED = 2.6;
export const STRIP = 0.8;
export const SPREAD_OUT = 2.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const wettingAndContactAngleMessages = Object.freeze({
  'label.title': { ko: '젖음과 접촉각', en: 'Wetting and contact angle' },
  'label.stage': { ko: '유리와 왁스 위의 물방울', en: 'A drop on glass and on wax' },
  'label.view': { ko: '단면', en: 'Cross-section' },
  'label.glass': { ko: '깨끗한 유리', en: 'Clean glass' },
  'label.wax': { ko: '왁스 칠한 면', en: 'Waxed surface' },
  'label.solidAir': { ko: '고체·공기', en: 'solid–air' },
  'label.solidLiquid': { ko: '고체·물', en: 'solid–water' },
  'label.liquidAir': { ko: '물·공기', en: 'water–air' },
  'label.net': { ko: '알짜 힘', en: 'net pull' },
  /** 각의 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.theta': { ko: 'θ', en: 'θ' },
  'caption.spread': {
    ko: '깨끗한 유리 위 — 세 장력이 맞서는 낮은 각에서 물방울이 얇게 퍼져 있다',
    en: 'On clean glass — the three pulls balance at a low angle and the drop lies thin and wide',
  },
  'caption.coat': {
    ko: '표면을 왁스로 바꾸자 바깥으로 끄는 힘은 약해지고 안으로 끄는 힘은 세진다',
    en: 'Switch the surface to wax — the outward pull weakens and the inward pull grows',
  },
  'caption.bead': {
    ko: '안쪽이 이긴다 — 가장자리가 밀려 들어오며 물방울이 둥글게 뭉친다',
    en: 'The inward side wins — the edge is drawn in and the drop gathers into a bead',
  },
  'caption.beaded': {
    ko: '왁스 위 — 세 장력이 다시 맞서는 높은 각에서 멈춘다',
    en: 'On wax — the three pulls balance again, now at a high angle',
  },
  'caption.strip': {
    ko: '다시 깨끗한 유리 — 이번엔 바깥으로 끄는 힘이 이긴다',
    en: 'Back to clean glass — this time the outward pull wins',
  },
  'caption.spreadOut': {
    ko: '가장자리가 밀려 나가며 같은 물방울이 얇게 퍼진다',
    en: 'The edge is pushed out and the same drop spreads thin',
  },
} satisfies Record<string, LocalizedText>);

export type WettingAndContactAngleMessageKey = keyof typeof wettingAndContactAngleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WettingAndContactAngleMessageKey): LocalizedText => wettingAndContactAngleMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WettingAndContactAngleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const wettingAndContactAngleSchema: BundleSchema = {
  id: WETTING_AND_CONTACT_ANGLE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 표면이 바뀌고, 가장자리가 밀리고, 다시 맞선다. 아무것도 누르지 않아도 끝난다.
  parameters: [],

  stages: [
    {
      id: 'glass-and-wax',
      label: text('label.stage'),
      constants: {
        liquidTension: LIQUID_TENSION,
        glassSolidAir: GLASS_SOLID_AIR,
        glassSolidLiquid: GLASS_SOLID_LIQUID,
        waxSolidAir: WAX_SOLID_AIR,
        waxSolidLiquid: WAX_SOLID_LIQUID,
        dropArea: DROP_AREA,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /**
   * 겹침이 판정 장치다. 방울 윤곽선은 방울 면 **위**, 세 장력 화살표는 윤곽선 **위**로
   * 그어져야 가장자리에서 읽힌다. 층 순서로는 궤적(20)이 물(45) 아래로 깔린다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 유리 위 퍼짐 → 왁스로 바뀜 → 뭉침 → 왁스 위 멈춤 → 유리로 되돌림 → 퍼짐.
   *
   * 뭉침 · 퍼짐은 `smooth` — 맞서는 각에 다가갈수록 느려져 멈춤이 부드럽다. 시작도 느린 것은
   * 이징의 한계다(끝만 늦추는 이징이 없다 — NOTES 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'spread', duration: SPREAD, caption: key('caption.spread') },
      { id: 'coat', duration: COAT, ease: 'smooth', caption: key('caption.coat') },
      { id: 'bead', duration: BEAD, ease: 'smooth', caption: key('caption.bead') },
      { id: 'beaded', duration: BEADED, caption: key('caption.beaded') },
      { id: 'strip', duration: STRIP, ease: 'smooth', caption: key('caption.strip') },
      { id: 'spread-out', duration: SPREAD_OUT, ease: 'smooth', caption: key('caption.spreadOut') },
    ],
  },

  /** 도착한 순간 유리 위 방울이 이미 놓여 있고, 곧 표면이 바뀐다. */
  startAt: 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 영의 식은 문단의 몫이다.
  // 아래는 판이 덮고 오른쪽은 장력 화살표가 서므로 왼쪽 위에 둔다.
  caption: {
    anchor: { screen: 'top-left', offset: [12, 10] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 320,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 세 화살표의 길이 견줌과
   * 가장자리의 각이다.
   */

  messages: wettingAndContactAngleMessages,
};
