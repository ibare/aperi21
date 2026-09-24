// ========================================================================
// net-force — 선언
// ========================================================================
// 질문: 세 방향에서 동시에 당기면, 물체는 가장 세게 당기는 쪽으로 가는가.
//
// 아니다. 세 힘의 화살표를 끝과 끝으로 이어 붙이면 처음과 끝을 잇는 화살표 하나가
// 남고, 물체는 그 하나의 방향으로 빨라진다. 동사는 **모인다**.
//
// 원본: tasks/piece-lab/net-force/index.html. 상수는 원본 그대로다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:net-force` 와 문자 그대로 일치한다 (C4). */
export const NET_FORCE_ID = 'net-force';

/**
 * 월드 1 단위 = 1 N 의 화살표 길이. 원본은 이것이 화면 1.6 px 였다 — 그 배율이
 * 나오도록 `SCENE_BOUNDS` 를 잡는다.
 */
export const PX_PER_UNIT = 1.6;

/**
 * 힘 조합 [크기(N), 방향(도, 위가 +)]. 주기마다 하나씩 돌아가며 보인다.
 * 셋 다 가장 센 힘과 알짜힘의 방향이 약 30°·30°·70° 어긋나게 골랐다.
 */
export const CONFIGS: readonly (readonly (readonly [number, number])[])[] = [
  [[120, 0], [100, 115], [70, 245]],
  [[115, 180], [90, 60], [50, -70]],
  [[105, -30], [90, 100], [45, 190]],
];

/** kg — 화면에는 두지 않는다. */
export const MASS = 1;
/**
 * 가속도(월드 단위/s²) = 알짜힘(N) / 질량 × 이 값. **모든 조합에 같게** 건다 —
 * 조합마다 바꾸면 조합 사이의 빠르기 비교가 거짓이 된다.
 */
export const ACCEL_SCALE = 0.15;
/** 같은 시간 간격 자리 점의 간격(초). */
export const DOT_EVERY = 0.3;

/** 물체 반지름(월드). 원본 15 px. */
export const BODY_RADIUS = 15 / PX_PER_UNIT;
/** 화살촉 크기(월드). 원본 `min(10, len × 0.45)` 의 10. */
export const HEAD_SIZE = 10;
/** 힘 화살표 굵기(화면 px). */
export const FORCE_WIDTH_PX = 3;
/** 알짜힘 화살표 굵기(화면 px). */
export const NET_WIDTH_PX = 4.5;
/** 자리 점 반지름(화면 px). */
export const DOT_RADIUS_PX = 3;
/** 알짜힘이 드러난 뒤 세 힘이 물러나는 만큼(진하기). */
export const FORCE_RECEDE = 0.55;

/**
 * 원본 캔버스 860 × 360 에서 월드 원점이 가운데, 1 N = 1.6 px. 여기에 캡션 줄
 * 40 px 를 아래에 더해 캔버스 400 px 로 둔다.
 *
 * 엔진은 경계를 맞출 때 변마다 36 px(맞춤 여백 12 + 기본 여백 24)를 비운다. 그래서
 * 배율이 1.6 이 되려면 가로 반폭 (430 − 36) / 1.6, 세로 반폭 (200 − 36) / 1.6 이다.
 * 세로 중심은 캡션 줄만큼 아래(−12.5)라 그림 영역의 위아래가 원본의 ±112.5 에 맞는다.
 * 경계는 배율과 중심을 정할 뿐 그림을 자르지 않는다.
 */
export const SCENE_BOUNDS = {
  minX: -246.25,
  maxX: 246.25,
  minY: -12.5 - 102.5,
  maxY: -12.5 + 102.5,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const netForceMessages = Object.freeze({
  'label.title': { ko: '알짜힘', en: 'Net force' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'caption.join': {
    ko: '세 힘을 끝과 끝으로 이어 붙인다',
    en: 'Join the three forces tip to tail',
  },
  'caption.single': {
    ko: '처음과 끝을 잇는 화살표 하나가 남는다',
    en: 'One arrow from the first tail to the last tip remains',
  },
  'caption.faster': {
    ko: '물체는 가장 센 힘이 아니라 이 화살표 쪽으로 점점 빨라진다',
    en: 'The object speeds up along this arrow, not along the strongest force',
  },
} satisfies Record<string, LocalizedText>);

export type NetForceMessageKey = keyof typeof netForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NetForceMessageKey): LocalizedText => netForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NetForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const netForceSchema: BundleSchema = {
  id: NET_FORCE_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다. 조합 셋을 돌아가며 보이는 것으로 "특정 경우가 아니다" 가 전해진다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 그림 360 px + 캡션 줄 40 px. */
  canvas: { height: 400, minHeight: 360 },

  /** 원본의 그리는 순서(점 → 물체 → 힘 → 알짜힘)를 그대로 따른다. */
  drawOrder: 'scene',

  /**
   * 한 주기 8.4 초. 주기 번호로 조합을 고른다(주기 0 → 조합 0, …).
   *
   * - slide2 · slide3: 둘째 힘이 첫째 끝으로, 셋째 힘이 둘째 끝으로 미끄러진다.
   *   원본은 시작부터 가장 빠른 감속 곡선(sin)이었다. 어휘에 없어 `linear` 로
   *   근사한다 — 역시 첫 순간부터 움직인다 (NOTES 「어휘 부족」).
   * - grow: 알짜힘 화살표가 처음에서 끝으로 뻗고 세 힘이 물러난다.
   * - move: 물체가 풀려나 알짜힘 쪽으로 빨라진다.
   * - fade: 움직임을 이어 가며 전체가 흐려진다.
   */
  timeline: {
    phases: [
      { id: 'slide2', duration: 1.1, caption: key('caption.join') },
      { id: 'slide3', duration: 1.1, caption: key('caption.join') },
      { id: 'grow', duration: 0.8, ease: 'smooth', caption: key('caption.single') },
      { id: 'move', duration: 4.8, caption: key('caption.faster') },
      { id: 'fade', duration: 0.6, ease: 'smooth', caption: key('caption.faster') },
    ],
  },

  // 슬롯 하나. 원본은 캔버스 아래 가운데 15 px 한 줄이었다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -12] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  messages: netForceMessages,
};
