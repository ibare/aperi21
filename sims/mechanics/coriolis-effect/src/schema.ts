// ========================================================================
// coriolis-effect — 선언
// ========================================================================
// 질문: 도는 원판 한가운데서 과녁을 똑바로 겨눠 던졌는데, 왜 공은 휘어서 과녁을
// 비껴 가는가? 공에 옆으로 미는 힘이 있는가?
//
// 같은 공 하나를 두 판에 나란히 그린다. 바깥에서 보면 곧게, 원판 위에서 보면 휘어
// 날아간다. 휨은 공에 있지 않고 보는 자리가 돌기 때문에 생긴다.
//
// 값은 모두 원본(tasks/piece-lab/coriolis-effect/index.html)에서 그대로 옮겼다.
// 원본은 화면 단위(px, 초)였고 여기서도 원본 1px = 월드 1 이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:coriolis-effect` 와 문자 그대로 일치한다 (C4). */
export const CORIOLIS_EFFECT_ID = 'coriolis-effect';

// ------------------------------------------------------------------------
// 배치 — 원본 논리 좌표 840 × 350
// ------------------------------------------------------------------------

export const W = 840;
export const H = 350;
/** 두 판의 원판 중심. 왼쪽이 바깥에서 본 판, 오른쪽이 원판 위에서 본 판. */
export const OUTSIDE_CX = 215;
export const ON_DISK_CX = 625;
export const PANEL_CY = 185;

// ------------------------------------------------------------------------
// 운동 상수 (화면 단위: px, 초)
// ------------------------------------------------------------------------

/** 원판 반지름. */
export const R = 130;
/** 원판 각속도 [rad/s]. 원본 화면(y 아래)에서 시계 방향으로 돈다. */
export const OMEGA = 0.7;
/** 공이 한가운데서 가장자리까지 가는 시간 — 시간표 `fly` 단계의 길이와 같다. */
export const FLIGHT = 2.4;
/** 착지 뒤 길과 공이 흐려지는 시간 — 시간표 `fade` 단계의 길이와 같다. */
export const FADE = 1.2;
/** 원판 위에 고정된 과녁의 각도 (원본 화면 좌표, 위쪽). */
export const AIM = -Math.PI / 2;
/** 지나간 길을 해석식으로 샘플링하는 등분 수. */
export const TRAIL_SEG = 64;

/**
 * 도착한 순간 공이 이미 반쯤 날아가 있다 — 원본이 주기를 1초 당겼다(`OFFSET`).
 * 모든 것이 시각의 함수라 시계만 앞당기면 된다.
 */
export const START_AT = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const coriolisEffectMessages = Object.freeze({
  'label.title': { ko: '코리올리 효과', en: 'Coriolis effect' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 판 이름표 — 어느 쪽이 도는 틀인지 무늬로만 추리하지 않게 한다 (원본 NOTES (c)). */
  'label.outside': { ko: '바깥에서 보면', en: 'Seen from outside' },
  'label.onDisk': { ko: '원판 위에서 보면', en: 'Seen on the disk' },
  'caption.main': {
    ko: '같은 공인데, 바깥에서는 곧게 날아가고 도는 원판 위에서는 휘어 과녁을 비껴 간다',
    en: 'The same ball flies straight seen from outside, but on the spinning disk it curves and misses the target',
  },
} satisfies Record<string, LocalizedText>);

export type CoriolisEffectMessageKey = keyof typeof coriolisEffectMessages;

export const text = (key: CoriolisEffectMessageKey): LocalizedText => coriolisEffectMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CoriolisEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const coriolisEffectSchema: BundleSchema = {
  id: CORIOLIS_EFFECT_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다. 누를 것 없이 되풀이만으로 주장이 끝난다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 폭 900 에서 논리 840 × 350 캔버스 + 아래 한 줄 캡션이었다. */
  canvas: { height: 400, minHeight: 320 },

  /** 원본 `OFFSET`. */
  startAt: START_AT,

  /**
   * 한 주기 3.6 s. 원본 `throwState(t)` 의 경계를 단계로 옮겼다.
   *
   * - fly — 던진 뒤 흐른 시간. 진행도 × 길이가 곧 비행 시간이라 이징은 선형이다
   * - fade — 가장자리에 닿은 공과 길이 흐려진다 (알파 1→0)
   */
  timeline: {
    phases: [
      { id: 'fly', duration: FLIGHT },
      { id: 'fade', duration: FADE },
    ],
  },

  /**
   * 겹침이 원본의 순서여야 한다 — 이름표 → 원판 → 살 → 과녁 → 사람 → 길 → 공.
   * 층 기본값은 `trajectory`(살)를 `body`(원판) 아래에 두어 살이 가려진다.
   */
  drawOrder: 'scene',

  /** 슬롯 하나. 원본은 캔버스 아래 가운데 한 줄(DOM, 15px)이었다. */
  caption: {
    anchor: { world: [W / 2, -(H + 16)] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  /** 그리드도 카메라 버튼도 없다 — 원본에 없다. */

  messages: coriolisEffectMessages,
};
