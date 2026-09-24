// ========================================================================
// reflection-of-waves — 선언
// ========================================================================
// 질문: 줄을 따라 간 펄스가 끝에서 되돌아올 때, 왜 어떤 줄에서는 뒤집혀 오고
// 어떤 줄에서는 그대로 오는가.
//
// 답: 끝이 무엇이냐가 정한다. 벽에 묶인 끝(고정단)은 움직이지 못해 줄을 반대로
// 당겨 되돌리고, 그래서 위로 솟아 간 펄스가 **아래로 솟아** 돌아온다. 막대를 따라
// 미끄러지는 고리 끝(자유단)은 펄스와 함께 올라갔다 내려오며, 펄스는 **위로 솟은
// 그대로** 돌아온다.
//
// 화면에서는 같은 펄스를 실은 두 줄을 위아래로 나란히 둔다 — 끝만 다르다.
// 뒤집힘은 줄의 모양(아래로 솟음)으로 보인다. 색으로 가르지 않는다 (S-piece).
//
// 두 매질 경계의 부분 반사 비율은 다루지 않는다 — `impedance-mismatch` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:reflection-of-waves` 와 문자 그대로 일치한다 (C4). */
export const REFLECTION_OF_WAVES_ID = 'reflection-of-waves';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 줄 위 거리 한 단위. 줄의 왼쪽 끝이 x = 0, 반사하는 끝이 x = L.
// ------------------------------------------------------------------------

/** 줄 길이(월드). 펄스가 들어오는 왼쪽 끝에서 반사하는 끝까지. */
export const STRING_LENGTH = 6;
/** 펄스 높이(월드). 두 줄에 같은 펄스를 싣는다. */
export const PULSE_AMPLITUDE = 0.42;
/** 펄스 폭(월드) — 가우스 꼴 `A·exp(−(d/w)²)` 의 w. */
export const PULSE_WIDTH = 0.42;
/**
 * 펄스가 처음 서는 자리가 줄 왼쪽 끝에서 바깥으로 떨어진 거리(월드). 펄스는 줄 밖에서
 * 들어와 줄 밖으로 나간다 — 주기 이음매에서 모양이 튀지 않는다.
 */
export const PULSE_ENTRY = 1.3;
/**
 * 「끝에 닿는 중」 구간의 반너비(월드). 펄스 중심이 `L − 이 값` 에서 `L + 이 값` 을 지나는
 * 동안이 시간표의 `hit` 단계다. 펄스가 끝과 겹쳐 있는 폭(약 2.5w)보다 넉넉하게 잡는다.
 */
export const HIT_REACH = 1.2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 위 줄(고정단) · 아래 줄(자유단)의 평형 높이(월드 y). */
export const FIXED_LANE_Y = 1.1;
export const FREE_LANE_Y = -1.1;
/** 벽이 줄 높이에서 위 · 아래로 뻗는 길이(월드). */
export const WALL_HALF = 0.6;
/** 고리가 미끄러지는 막대 — 줄 높이 아래로 · 위로 뻗는 길이(월드). 위는 고리가 두 배로 오르는 자리까지. */
export const ROD_BELOW = 0.6;
export const ROD_ABOVE = 1.0;
/** 끝 이름표가 끝에서 오른쪽으로 떨어진 거리(월드). */
export const END_LABEL_GAP = 0.32;

/**
 * 프레이밍 — 왼쪽은 줄 왼쪽 끝, 오른쪽은 끝 이름표, 아래는 캡션 한 줄 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.3, maxX: 9.1, minY: -2.35, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const reflectionOfWavesMessages = Object.freeze({
  'label.title': { ko: '파동의 반사', en: 'Reflection of waves' },
  'label.stage': { ko: '끝이 다른 두 줄', en: 'Two strings, two kinds of end' },
  'label.view': { ko: '나란한 두 줄', en: 'Two strings side by side' },

  /** 끝 이름. 두 줄을 가르는 것은 색이 아니라 이 이름과 끝의 생김새다. */
  'label.fixedEnd': { ko: '고정단', en: 'Fixed end' },
  'label.fixedEndNote': { ko: '벽에 묶인 끝', en: 'tied to a wall' },
  'label.freeEnd': { ko: '자유단', en: 'Free end' },
  'label.freeEndNote': { ko: '막대를 미끄러지는 고리', en: 'ring sliding on a rod' },

  'caption.approach': {
    ko: '같은 모양의 펄스가 두 줄을 따라 끝으로 달려간다 — 둘 다 위로 솟아 있다.',
    en: 'The same pulse runs along both strings toward the end — both bulge upward.',
  },
  'caption.hit': {
    ko: '끝에 닿는 동안 — 벽에 묶인 끝은 꼼짝하지 않고, 고리는 펄스 높이의 두 배까지 올라갔다 내려온다.',
    en: 'At the end — the tied end never moves, while the ring rides up to twice the pulse height and back down.',
  },
  'caption.return': {
    ko: '되돌아오는 펄스 — 벽에 묶인 줄에서는 아래로 뒤집혔고, 고리 끝 줄에서는 위로 솟은 그대로다.',
    en: 'The pulse comes back — flipped downward on the tied string, still bulging upward on the ring string.',
  },
} satisfies Record<string, LocalizedText>);

export type ReflectionOfWavesMessageKey = keyof typeof reflectionOfWavesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: ReflectionOfWavesMessageKey): LocalizedText => reflectionOfWavesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ReflectionOfWavesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const reflectionOfWavesSchema: BundleSchema = {
  id: REFLECTION_OF_WAVES_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 조작기가 없다. 두 끝을 나란히 두어 자동 진행만으로 비교가 끝난다 — 독자가 고를 것이
  // 끝의 종류뿐인데 그것은 이미 두 줄로 함께 보인다.
  parameters: [],

  stages: [
    {
      id: 'two-strings',
      label: text('label.stage'),
      constants: {
        stringLength: STRING_LENGTH,
        amplitude: PULSE_AMPLITUDE,
        pulseWidth: PULSE_WIDTH,
        entry: PULSE_ENTRY,
        hitReach: HIT_REACH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'strings', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 줄 둘이 위아래로 선다. 세로는 두 줄과 캡션 한 줄이면 된다. */
  canvas: { height: 380, minHeight: 340 },

  /** 막대 · 벽을 먼저, 줄을 그 위에, 고리 · 매듭을 맨 위에 — 줄 끝이 고리에 걸려 보여야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 6.02 초(조각 시계). 펄스는 줄 밖 왼쪽에서 들어와 끝에서 되돌아 줄 밖 왼쪽으로 나간다.
   *
   * - `approach` — 펄스 중심이 `−entry` 에서 `L − hitReach` 까지 간다.
   * - `hit` — `L − hitReach` 에서 `L + hitReach` 까지(펼친 좌표). 펄스가 끝과 겹친 동안이라
   *   **느리게 보여 준다**(`timeScale` 0.35 → 화면에서 약 2.4 초). 이 단계가 주장의 절반이다.
   * - `return` — 되돌아 `2L + entry` 까지, 곧 줄 밖 왼쪽으로 나간다.
   * - `rest` — 줄이 잠잠한 사이. 다음 펄스가 앞 펄스와 섞이지 않게 한다.
   *
   * 단계마다 진행도를 제 구간에 선형으로 잇는다 — 캡션과 펄스 자리가 어긋날 수 없다. 펄스가
   * 한 빠르기로 달리려면 단계 길이가 구간 길이(6.1 · 2.4 · 6.1)에 비례해야 한다. 그 관계를
   * 선언할 자리가 없어 여기 적는다(장부 G129 · G13) — 한쪽만 고치면 단계 경계에서 빠르기가 바뀐다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 2.14, caption: key('caption.approach') },
      { id: 'hit', duration: 0.84, timeScale: 0.35, caption: key('caption.hit') },
      { id: 'return', duration: 2.14, caption: key('caption.return') },
      { id: 'rest', duration: 0.9, caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 펄스가 이미 두 줄 위를 달리고 있다 (S-piece). */
  startAt: 0.9,

  /** 슬롯 하나. 아래 줄 밑 왼쪽 한 줄. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 보는 것은 펄스가 위로 솟았는지 아래로
  // 솟았는지이고, 거리 눈금은 다른 질문을 부른다.

  messages: reflectionOfWavesMessages,
};
