// ========================================================================
// electrostatic-shielding — 선언
// ========================================================================
// 질문: 도체 상자 안은 왜 바깥 장이 들어오지 못하는가.
//
// 고른 바깥 장(왼쪽 → 오른쪽) 속에 작은 시험 전하가 있다 — 장 방향으로 힘을 받는다.
// 그 둘레에 속 빈 도체(단면은 두꺼운 고리)를 놓으면, 도체 속 전자가 장을 거슬러 왼쪽
// 겉면으로 몰리고(−) 오른쪽 겉면에는 + 가 남는다. 그 전하가 만든 장이 안쪽에서 바깥 장을
// 꼭 지운다 — 바깥 선은 휘어 겉면에 수직으로 닿아 끝나고, 안의 선은 벌어져 사라지며,
// 시험 전하가 받던 힘이 0 이 된다. 도체를 치우면 장이 다시 들어온다.
//
// 겉면 전하가 어떻게 한쪽에 몰리는지(뾰족한 곳 · 곡률)는 이웃 `charge-on-conductor-surface`,
// 대전된 구 안이 0 인 까닭은 이웃 `field-of-charged-sphere` 의 몫이다. 여기서 도체는
// 전하를 받지 않은 중성이고, 주장은 「바깥 장이 들어오지 못한다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electrostatic-shielding` 와 문자 그대로 일치한다 (C4). */
export const ELECTROSTATIC_SHIELDING_ID = 'electrostatic-shielding';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이, 장은 바깥 장 세기 E₀ 가 1 인 단위다.
// ------------------------------------------------------------------------

/** 바깥 고른 장의 세기 E₀(장 단위). +x 방향. */
export const FIELD_STRENGTH = 1;
/** 도체 고리의 바깥 반지름 a(월드) — 유도 전하가 모이는 겉면. */
export const OUTER_RADIUS = 0.95;
/** 도체 고리의 안 반지름(월드) — 속 빈 자리의 가장자리. */
export const INNER_RADIUS = 0.72;
/**
 * 장선 간격(월드) — 멀리서 본 고른 장의 선 사이. 선은 반 칸 어긋난 높이(±½, ±1½ …)에서
 * 출발해 한가운데(시험 전하 자리)를 지나는 선이 없다.
 */
export const LINE_SPACING = 0.34;
/** 장선을 까는 반높이(월드). 이 높이 안의 출발점만 긋는다. */
export const LINE_HALF_HEIGHT = 2.25;
/** 장선이 펼쳐지는 반폭(월드). */
export const FIELD_HALF_WIDTH = 3.8;
/** 장 → 힘 화살표 길이 배율(월드 길이 per 장 단위). 시험 전하는 단위 전하다. */
export const ARROW_SCALE = 0.55;
/** 시험 전하 그림 반지름(월드). */
export const PROBE_RADIUS = 0.09;
/** 겉면 한쪽(왼쪽 − · 오른쪽 +)에 찍는 유도 전하 표식 개수. 같은 전하량마다 하나다. */
export const CHARGE_MARKS = 5;
/** 장선 방향 촉을 다는 자리 — 양 끝에서 안으로 들어온 거리(월드) · 촉 화살표 길이(월드). */
export const CHEVRON_INSET = 0.45;
export const CHEVRON_LENGTH = 0.3;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 장선 판(가로 ±3.8, 세로 ±2.25 와 휜 선)과 시험 전하 이름표,
 * 그리고 아래 캡션 띠를 담는다 (캡션 슬롯이 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.9, maxX: 3.9, minY: -2.85, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 고른 장과 힘을 받는 시험 전하만 있는 그림을 읽는 동안. */
export const FIELD_HOLD = 1.8;
/** 도체가 시험 전하 둘레에 나타나는 동안. */
export const PLACE = 0.8;
/** 도체 속 전하가 겉면으로 몰리며 장이 바뀌는 동안. */
export const INDUCE = 2.4;
/** 차폐된 그림을 읽는 동안. */
export const SHIELDED_HOLD = 3.4;
/** 도체를 치워 장이 다시 들어오는 동안. */
export const REMOVE = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electrostaticShieldingMessages = Object.freeze({
  'label.title': { ko: '정전기 차폐', en: 'Electrostatic shielding' },
  'label.operation': { ko: '도체 내부의 장이 0인 이유', en: 'Why the field inside a conductor is zero' },
  'label.stage': { ko: '고른 장 속의 속 빈 도체', en: 'Hollow conductor in a uniform field' },
  'label.view': { ko: '장선', en: 'Field lines' },
  /** 전하 부호 · 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  'mark.minus': { ko: '−', en: '−' },
  'mark.q': { ko: '+q', en: '+q' },
  'caption.field': {
    ko: '고른 장 속의 시험 전하가 장 방향으로 힘을 받고 있다',
    en: 'The test charge in the uniform field is pushed along the field',
  },
  'caption.place': {
    ko: '시험 전하 둘레에 속 빈 도체를 놓는다',
    en: 'A hollow conductor is placed around the test charge',
  },
  'caption.induce': {
    ko: '도체 속 전자가 왼쪽 겉면으로 몰리고, 오른쪽 겉면에는 + 가 남는다',
    en: 'Electrons in the conductor crowd to the left surface, and + is left on the right',
  },
  'caption.shielded': {
    ko: '장선은 겉면에 수직으로 닿아 끝나고 안은 비었다 — 시험 전하는 힘을 받지 않는다',
    en: 'Field lines end square-on at the surface and the inside is empty — the test charge feels no force',
  },
  'caption.remove': {
    ko: '도체를 치우자 장선이 다시 안으로 들어온다',
    en: 'With the conductor gone, the field lines come back in',
  },
} satisfies Record<string, LocalizedText>);

export type ElectrostaticShieldingMessageKey = keyof typeof electrostaticShieldingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectrostaticShieldingMessageKey): LocalizedText => electrostaticShieldingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectrostaticShieldingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electrostaticShieldingSchema: BundleSchema = {
  id: ELECTROSTATIC_SHIELDING_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 장이 흐르고, 도체가 놓이고, 안이 비워진다.
  parameters: [],

  stages: [
    {
      id: 'hollow-conductor',
      label: text('label.stage'),
      constants: {
        fieldStrength: FIELD_STRENGTH,
        outerRadius: OUTER_RADIUS,
        innerRadius: INNER_RADIUS,
        lineSpacing: LINE_SPACING,
        lineHalfHeight: LINE_HALF_HEIGHT,
        fieldHalfWidth: FIELD_HALF_WIDTH,
        arrowScale: ARROW_SCALE,
        probeRadius: PROBE_RADIUS,
        chargeMarks: CHARGE_MARKS,
        chevronInset: CHEVRON_INSET,
        chevronLength: CHEVRON_LENGTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 도체와 그 곁에서 휘는 선이 주인공이라 세로를 조금 더 잡는다 — 장선 판이 세로로 배율을 정한다. */
  canvas: { height: 440, minHeight: 380 },

  /**
   * 한 주기 = 고른 장 속 시험 전하 → 둘레에 도체를 놓음 → 겉면에 전하가 몰리며 안이 비워짐 →
   * 차폐된 그림 → 도체를 치워 장이 돌아옴.
   */
  timeline: {
    phases: [
      { id: 'field', duration: FIELD_HOLD, caption: key('caption.field') },
      { id: 'place', duration: PLACE, ease: 'smooth', caption: key('caption.place') },
      { id: 'induce', duration: INDUCE, ease: 'smooth', caption: key('caption.induce') },
      { id: 'shielded', duration: SHIELDED_HOLD, caption: key('caption.shielded') },
      { id: 'remove', duration: REMOVE, ease: 'smooth', caption: key('caption.remove') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 장과 힘 화살표는 첫 프레임부터 온전히 있다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **선이 어디서 끝나는가**와
   * 안이 비었는가다.
   */

  messages: electrostaticShieldingMessages,
};
