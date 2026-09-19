// ========================================================================
// force-on-current-wire — 선언
// ========================================================================
// 질문: 자기장 속에 놓인 도선에 전류를 흘리면 무슨 일이 생기는가.
//
// 답: 도선이 힘을 받아 **튀어 나간다.** 힘은 자기장에도 전류에도 직각인 쪽이고,
// 전류 방향을 바꾸면 반대쪽, 전류를 키우면 더 세다. 그 힘은 도선 속을 흐르는 전하
// 하나하나가 받는 힘(로런츠 힘)이 모인 것이다.
//
// 동사: 스위치를 닫자 그네 도선이 한쪽으로 **튄다.**
//
// 이웃 `current-magnetic-field` 는 전류가 장을 **만드는** 이야기이고, 이 조각은 이미 있는
// 장이 전류를 **미는** 이야기다. 이웃 `lorentz-force` 는 전하 하나의 힘 방향을 3차원으로
// 다루므로, 여기서는 그 연결을 한 단계(`charges`)로 짧게만 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:force-on-current-wire` 와 문자 그대로 일치한다 (C4). */
export const FORCE_ON_CURRENT_WIRE_ID = 'force-on-current-wire';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자석 사이 자기장 세기(T). 방향은 N(위) → S(아래). */
export const FIELD = 0.2;
/** 처음 흘리는 전류(A). `on` · `reverse` 단계. */
export const CURRENT_LOW = 2;
/** 키운 전류(A). `more` · `charges` 단계. */
export const CURRENT_HIGH = 4;
/** 자기장 속에 든 도선 길이(m). */
export const WIRE_LENGTH = 0.15;
/** 그네 도선의 질량(kg). 평형각 tanθ = BIL / mg 의 mg 쪽이다. */
export const WIRE_MASS = 0.02;
/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;

// ------------------------------------------------------------------------
// 표시 — 화면 배율 · 흔들림의 모양. 역시 스테이지 상수다 (원칙 2).
// ------------------------------------------------------------------------

/** 그네 막대 길이(월드). 받침점에서 도선 중심까지. */
export const SWING_LENGTH = 2.3;
/** 그네의 고유 각진동수(rad/s, 화면 시간). 힘이 바뀐 뒤 흔들리는 빠르기. */
export const SWING_OMEGA = 3.2;
/** 그네의 감쇠율(1/s). 흔들림이 가라앉는 빠르기 — 단계 안에서 멈추도록 둔다. */
export const SWING_DAMPING = 1.5;
/** 힘 1 N 이 차지하는 월드 길이 — F 화살표 길이 배율. 상한이 없다(가장 긴 것 0.9). */
export const FORCE_SCALE = 7.5;
/** `charges` 단계에 확대 창 속에 보이는 전자 수. */
export const CHARGE_COUNT = 3;
/** 확대 창에서 전자 하나가 받는 힘을 보이는 작은 화살표 길이(월드). 크기 비교가 아니라 방향 표시다. */
export const CHARGE_ARROW = 0.3;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽은 자석 · 그네(가장 멀리 튄 순간의 F 이름표까지), 오른쪽은 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -2.8, maxX: 5.6, minY: -1.45, maxY: 2.6 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝, 세로 가운데 조금 위). */
export const CAPTION_AT = [2.35, 0.6] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const forceOnCurrentWireMessages = Object.freeze({
  'label.title': { ko: '전류가 받는 힘', en: 'Force on a current-carrying wire' },
  'label.operation': { ko: '도선에 작용하는 자기력', en: 'The magnetic force on a wire carrying a current' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 극 · 화살표 이름. 기호라 두 언어가 같다 (C1 판정 1 · 3). */
  'label.north': { ko: 'N', en: 'N' },
  'label.south': { ko: 'S', en: 'S' },
  'label.field': { ko: 'B', en: 'B' },
  'label.force': { ko: 'F', en: 'F' },
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  /** 지금 전류. 값이 끼는 조립문이라 문안이다 (C1). 값은 선언한 정박값의 글자다. */
  'label.current': { ko: 'I = {i} A', en: 'I = {i} A' },

  'caption.rest': {
    ko: '전류가 흐르지 않으면 도선은 자석 사이에 곧게 매달려 있다.',
    en: 'With no current, the wire hangs straight down between the poles.',
  },
  'caption.on': {
    ko: '전류를 흘리는 순간 도선이 한쪽으로 튀어 나간다. 자기장이 전류를 민다.',
    en: 'Switch the current on and the wire kicks sideways. The field pushes on the current.',
  },
  'caption.reverse': {
    ko: '전류 방향을 바꾸면 힘도 뒤집혀 도선이 반대쪽으로 튄다.',
    en: 'Reverse the current and the force flips. The wire kicks the other way.',
  },
  'caption.off': {
    ko: '전류를 끊으면 힘이 사라져 도선이 제자리로 돌아온다.',
    en: 'Switch the current off and the force is gone. The wire swings back.',
  },
  'caption.more': {
    ko: '전류를 키우면 힘이 커져 도선이 더 멀리 튄다. 점선은 앞서 작은 전류일 때다.',
    en: 'Turn the current up and the force grows. The wire swings farther than before (dashed).',
  },
  'caption.charges': {
    ko: '도선 속 전자 하나하나가 같은 쪽으로 밀린다. 그 힘이 모두 모인 것이 도선이 받는 힘이다.',
    en: 'Every electron in the wire is pushed the same way. Together those pushes are the force on the wire.',
  },
} satisfies Record<string, LocalizedText>);

export type ForceOnCurrentWireMessageKey = keyof typeof forceOnCurrentWireMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ForceOnCurrentWireMessageKey): LocalizedText => forceOnCurrentWireMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ForceOnCurrentWireMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const forceOnCurrentWireSchema: BundleSchema = {
  id: FORCE_ON_CURRENT_WIRE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        field: FIELD,
        currentLow: CURRENT_LOW,
        currentHigh: CURRENT_HIGH,
        wireLength: WIRE_LENGTH,
        wireMass: WIRE_MASS,
        gravity: GRAVITY,
        swingLength: SWING_LENGTH,
        swingOmega: SWING_OMEGA,
        swingDamping: SWING_DAMPING,
        forceScale: FORCE_SCALE,
        chargeCount: CHARGE_COUNT,
        chargeArrow: CHARGE_ARROW,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 자석과 그네, 오른쪽 캡션. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 자석, 자기장 선, 잔상, 그네 막대, 도선(속을 바탕으로 덮어 장선을
   * 가린다), 전류 표식, 힘, 이름표. 층 순서로는 「도선 속이 장선을 가린다」 를 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 스위치가 막 닫혀 도선이 튀는 중이다 (S-piece). */
  startAt: 2,

  /**
   * 한 주기 17.1 초. 전류는 단계가 시작하는 순간 바뀐다 — 스위치는 순간이다.
   *
   * - `appear` — 옅게 떠오른다. 앞 주기 끝 화면(멀리 튄 도선)에서 이어지지 않도록.
   * - `rest` — 전류 0. 도선이 곧게 매달려 있다.
   * - `on` — 전류 `currentLow`(⊗, 화면 안쪽). 힘이 왼쪽으로 생기고 도선이 튀었다 가라앉는다.
   * - `reverse` — 전류 −`currentLow`(⊙). 힘이 오른쪽으로 뒤집히고 도선이 반대로 튄다.
   * - `off` — 전류 0. 도선이 돌아온다.
   * - `more` — 전류 `currentHigh`(⊗). 힘이 커지고 더 멀리 튄다. `on` 의 평형을 점선으로 남긴다.
   * - `charges` — 같은 전류. 도선을 키워 보인 확대 창 속 전자마다 같은 쪽으로 향한 작은 힘을 보인다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4 },
      { id: 'rest', duration: 1.3, caption: key('caption.rest') },
      { id: 'on', duration: 3, caption: key('caption.on') },
      { id: 'reverse', duration: 3, caption: key('caption.reverse') },
      { id: 'off', duration: 2.2, caption: key('caption.off') },
      { id: 'more', duration: 3.2, caption: key('caption.more') },
      { id: 'charges', duration: 3.4, caption: key('caption.charges') },
      { id: 'fade', duration: 0.6, caption: key('caption.charges') },
    ],
  },

  /** 슬롯 하나. 오른쪽 빈 자리에 세운다 — 세로가 비싸 아래 줄을 쓰지 않는다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 290,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 조작기 없음. 잴 거리가 없고, 자동 진행이 켜기 · 뒤집기 · 키우기를 모두 지난다.

  messages: forceOnCurrentWireMessages,
};
