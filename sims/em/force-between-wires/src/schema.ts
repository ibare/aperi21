// ========================================================================
// force-between-wires — 선언
// ========================================================================
// 질문: 나란한 두 도선에 전류가 흐르면 서로에게 무슨 일을 하는가.
//
// 답: 같은 방향으로 흐르면 **당기고**, 반대 방향이면 **민다.** 한 도선이 만든 자기장 속에
// 다른 도선이 놓여 있어서, 그 도선의 전류가 힘을 받는다. 장은 그대로인데 한쪽 전류만 뒤집어도
// 힘이 뒤집힌다.
//
// 동사: 두 도선이 서로를 향해 **휜다** — 전류를 뒤집으면 바깥으로 휜다.
//
// 이웃 `current-magnetic-field` 는 전류가 장을 **만드는** 이야기(나침반), `force-on-current-wire`
// 는 자석의 장이 전류를 **미는** 이야기(단면 그네)다. 이 조각은 둘을 잇는다 — 장을 만드는 것도,
// 밀리는 것도 전류다. 그래서 단면이 아니라 두 도선을 세워 본 옆모습으로 둔다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:force-between-wires` 와 문자 그대로 일치한다 (C4). */
export const FORCE_BETWEEN_WIRES_ID = 'force-between-wires';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 도선에 흐르는 전류의 크기(A). 방향은 단계가 정한다. */
export const CURRENT = 5;
/** 두 도선 사이 간격(m). */
export const GAP = 0.05;
/** 두 받침 사이 도선 길이(m). */
export const WIRE_LENGTH = 0.08;
/** μ₀/2π (T·m/A). 단위 길이당 힘 F/L = (μ₀/2π) I₁I₂ / d 의 앞 계수다. */
export const MAGNETIC_CONSTANT = 2e-7;

// ------------------------------------------------------------------------
// 표시 — 화면 배율 · 흔들림의 모양. 역시 스테이지 상수다 (원칙 2).
// ------------------------------------------------------------------------

/** 1 m 가 차지하는 월드 길이 — 간격 · 도선 길이를 화면에 놓는 축척. */
export const WORLD_PER_METER = 40;
/**
 * 과장 배율 — 단위 길이당 힘 1 N/m 가 만드는 가운데 휨(월드). 실제 도선은 눈에 보이지 않을 만큼만
 * 휜다. 이 값이 그것을 보이는 크기로 키운다 (NOTES (b)).
 */
export const BOW_SCALE = 3000;
/** 단위 길이당 힘 1 N/m 가 차지하는 월드 길이 — F 화살표 길이 배율. 상한이 없다. */
export const FORCE_SCALE = 5000;
/** 휨의 고유 각진동수(rad/s, 화면 시간). 전류가 바뀐 뒤 흔들리는 빠르기. */
export const BOW_OMEGA = 4;
/** 휨의 감쇠율(1/s). 흔들림이 단계 안에서 가라앉도록 둔다. */
export const BOW_DAMPING = 1.6;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽은 두 도선 · 받침 · 왼쪽 도선의 장 표식, 오른쪽은 캡션 자리.
 * 가장 긴 간격 · 도선 길이 기본값이 들어가게 처음부터 잡는다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -2.9, maxX: 6.4, minY: -2.15, maxY: 2.15 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝, 세로 가운데 조금 위). */
export const CAPTION_AT = [3.1, 0.7] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const forceBetweenWiresMessages = Object.freeze({
  'label.title': { ko: '도선 사이의 힘', en: 'Force between parallel wires' },
  'label.operation': { ko: '나란한 두 전류의 인력·척력', en: 'Two parallel currents attract or repel' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 화살표 · 장 이름. 기호라 두 언어가 같다 (C1 판정 3). */
  'label.current': { ko: 'I', en: 'I' },
  'label.force': { ko: 'F', en: 'F' },
  'label.field': { ko: 'B', en: 'B' },

  'caption.rest': {
    ko: '전류가 흐르지 않으면 나란한 두 도선은 곧게 서 있다.',
    en: 'With no current, the two parallel wires stand straight.',
  },
  'caption.same': {
    ko: '같은 방향으로 전류가 흐르자 두 도선이 서로 끌어당겨 안쪽으로 휜다. 오른쪽 도선은 왼쪽 도선이 만든 자기장(⊗) 속에 있다.',
    en: 'Currents in the same direction: the wires pull on each other and bow inward. The right wire sits in the field (⊗) of the left one.',
  },
  'caption.opposite': {
    ko: '오른쪽 전류만 뒤집자 같은 자기장 속에서 힘이 뒤집혀, 두 도선이 서로 밀어내며 바깥으로 휜다.',
    en: 'Reverse only the right current. In the same field the force flips, and the wires push apart and bow outward.',
  },
} satisfies Record<string, LocalizedText>);

export type ForceBetweenWiresMessageKey = keyof typeof forceBetweenWiresMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ForceBetweenWiresMessageKey): LocalizedText => forceBetweenWiresMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ForceBetweenWiresMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const forceBetweenWiresSchema: BundleSchema = {
  id: FORCE_BETWEEN_WIRES_ID,
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
        current: CURRENT,
        gap: GAP,
        wireLength: WIRE_LENGTH,
        magneticConstant: MAGNETIC_CONSTANT,
        worldPerMeter: WORLD_PER_METER,
        bowScale: BOW_SCALE,
        forceScale: FORCE_SCALE,
        bowOmega: BOW_OMEGA,
        bowDamping: BOW_DAMPING,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 두 도선, 오른쪽 캡션. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 받침, 장 표식, 도선, 전류 화살표, 힘, 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 전류가 막 흘러 두 도선이 안쪽으로 휘는 중이다 (S-piece). */
  startAt: 2.1,

  /**
   * 한 주기 9.4 초. 전류는 단계가 시작하는 순간 바뀐다 — 스위치는 순간이다.
   *
   * - `appear` — 옅게 떠오른다. 앞 주기 끝 화면(바깥으로 휜 도선)에서 이어지지 않도록.
   * - `rest` — 두 전류 0. 도선이 곧다.
   * - `same` — 두 도선 모두 위로 `current`. 왼쪽 도선의 장이 생기고 두 도선이 안쪽으로 휜다.
   * - `opposite` — 오른쪽만 아래로. 왼쪽 도선의 장은 그대로, 두 도선이 바깥으로 휜다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4 },
      { id: 'rest', duration: 1.2, caption: key('caption.rest') },
      { id: 'same', duration: 3.6, caption: key('caption.same') },
      { id: 'opposite', duration: 3.6, caption: key('caption.opposite') },
      { id: 'fade', duration: 0.6, caption: key('caption.opposite') },
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

  // 그리드 · 카메라 단추 · 조작기 없음. 잴 거리가 없고, 자동 진행이 당김 · 밀어냄을 모두 지난다.

  messages: forceBetweenWiresMessages,
};
