// ========================================================================
// atmospheric-pressure — 선언
// ========================================================================
// 질문: 높이 올라가면 공기가 누르는 압력은 왜 줄어드는가.
//
// 하늘에 공기 알갱이가 깔려 있다. 알갱이 하나하나가 **같은 양의 공기**다 — 그래서
// 땅 가까이는 빽빽하고 위로 갈수록 성기다. 센서 하나가 산을 오른다. 센서 머리 위의
// 공기 기둥이 강조색으로 밝혀지고, 그 기둥의 무게가 센서 윗면을 아래로 누르는
// 화살표가 된다. 오를수록 기둥 속 알갱이가 줄고 화살표가 짧아진다. 정상에서는
// 머리 위에 남은 공기가 절반이고, 화살표도 산 아래 잔상(p₀)의 절반이다.
//
// 이웃과 겹치지 않는다. 물속 압력이 깊이에 정비례하는 것은 `hydrostatic-pressure`,
// 기압을 수은 기둥으로 재는 것은 `barometer` 의 몫이다. 이 조각은 「머리 위 공기
// 기둥의 무게가 압력이다: 올라갈수록 위에 남은 공기가 줄어 압력이 준다」 에 머문다.
// 높이에 대해 압력이 어떤 곡선으로 주는지(지수 감소)는 주장하지 않는다 — 알갱이가
// 위로 성긴 것은 정직하게 두되 곡선을 따로 긋지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:atmospheric-pressure` 와 문자 그대로 일치한다 (C4). */
export const ATMOSPHERIC_PRESSURE_ID = 'atmospheric-pressure';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 대기의 척도 높이 H(km). 이만큼 오를 때마다 머리 위 공기가 e 분의 1 로 준다.
 * 지표 근처 평균 기온에서 약 8.4 km.
 */
export const SCALE_HEIGHT = 8.4;
/**
 * 정상에서 머리 위에 남는 공기의 몫. 0.5 — 이 조각이 견주는 것은 「절반」 이다.
 * 정상 높이는 여기서 나온다(H · ln 2 ≈ 5.8 km).
 */
export const SUMMIT_FRACTION = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 km. 땅이 y = 0, 위가 높은 쪽이다.
// ------------------------------------------------------------------------

/** 공기 알갱이 수. 알갱이 하나가 같은 양의 공기다(층화 분위수로 높이를 뽑는다). */
export const DOT_COUNT = 620;
/** 알갱이를 깔 가로 범위(km). 넓은 임베드에서도 하늘 끝이 비지 않게 뷰보다 넓다. */
export const DOT_SPAN_X = [-24, 24] as const;
/** 알갱이의 일렁임(km)과 빠르기(rad/s). 공기가 멈춰 있지 않다는 표시일 뿐이라 작게. */
export const DOT_JIGGLE = 0.16;
export const DOT_JIGGLE_SPEED = 0.9;

/** 센서 머리 위 공기 기둥의 반폭(km). */
export const COLUMN_HALF_WIDTH = 1.5;
/** 기둥이 뻗는 위 끝(km). 프레이밍 위 끝보다 높아 기둥이 하늘 끝까지 이어져 보인다. */
export const COLUMN_TOP = 30;

/** 센서 한 변(km). */
export const SENSOR_SIZE = 0.8;
/** 산 아래(머리 위 공기 전부)에서 압력 화살표의 길이(km). 정상에서는 몫만큼 준다. */
export const ARROW_AT_GROUND = 7;

/**
 * 산의 외곽선. `[x(km), 정상 높이에 대한 비]` — 정상 높이를 바꾸면 산이 함께 커진다.
 * 첫 점(왼쪽 기슭)부터 정상까지가 센서가 오르는 능선이다. 능선은 높이에 대해 단조라
 * 높이로 자리를 찾는다.
 */
export const MOUNTAIN: readonly (readonly [number, number])[] = [
  [-6.5, 0],
  [-4.2, 0.24],
  [-2.2, 0.47],
  [-0.4, 0.66],
  [1.4, 0.86],
  [3.2, 1],
  [4.6, 0.84],
  [6.2, 0.7],
  [7.6, 0.52],
  [9.6, 0.33],
  [12.4, 0.1],
  [14, 0],
];
/** `MOUNTAIN` 에서 정상의 인덱스. 여기까지가 오르는 능선이다. */
export const SUMMIT_INDEX = 5;

/** 압력 이름표를 화살표 가운데에서 왼쪽으로 띄우는 거리(km). 기둥 밖에 선다. */
export const LABEL_OFFSET_X = COLUMN_HALF_WIDTH + 0.7;

/**
 * 프레이밍은 주장의 일부다. 가로는 산 양쪽 기슭과 산 아래 기둥까지, 세로는 땅 아래
 * 캡션 줄부터 하늘까지. 위쪽 여백이 넓은 것은 공기가 위로 성기게 이어지는 것을
 * 보이려는 것이다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -15, maxX: 15, minY: -1.6, maxY: 17.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 산 아래에서 기둥 전체가 누르는 것을 보는 동안(초). */
export const GROUND = 1.8;
/** 기슭에서 정상까지 오르는 동안. */
export const CLIMB = 4.2;
/** 정상에서 절반을 읽는 동안. 주장이 마무리되는 자리라 길게 둔다. */
export const SUMMIT = 3.6;
/** 다음 주기로 넘어가며 흐려지는 동안. */
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const atmosphericPressureMessages = Object.freeze({
  'label.title': { ko: '대기압', en: 'Atmospheric pressure' },
  'label.stage': { ko: '산', en: 'Mountain' },
  'label.view': { ko: '옆에서 본 산과 하늘', en: 'Mountain and sky from the side' },
  /** 압력 이름표. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.pressureGround': { ko: 'p₀', en: 'p₀' },
  'label.pressureSummit': { ko: '½ p₀', en: '½ p₀' },
  'caption.ground': {
    ko: '산 아래 — 머리 위 공기 기둥 전체의 무게가 누른다',
    en: 'At the foot, the whole column of air overhead presses down',
  },
  'caption.climb': {
    ko: '오를수록 머리 위에 남은 공기가 줄어 덜 누른다',
    en: 'Climbing, less air is left overhead, so it presses less',
  },
  'caption.summit': {
    ko: '정상 — 머리 위 공기가 절반이니 압력도 절반',
    en: 'At the top, half the air is left overhead — and half the pressure',
  },
} satisfies Record<string, LocalizedText>);

export type AtmosphericPressureMessageKey = keyof typeof atmosphericPressureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AtmosphericPressureMessageKey): LocalizedText => atmosphericPressureMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AtmosphericPressureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const atmosphericPressureSchema: BundleSchema = {
  id: ATMOSPHERIC_PRESSURE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 센서가 산을 오르고, 정상에서 멈추고, 다시 기슭에서 시작한다.
  parameters: [],

  stages: [
    {
      id: 'mountain',
      label: text('label.stage'),
      constants: { scaleHeight: SCALE_HEIGHT, summitFraction: SUMMIT_FRACTION },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 하늘이 위로 이어지는 것을 담을 만큼. 세로를 더 주면 그림만 작아진다 (S-piece). */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 기둥 속 알갱이는 바깥 알갱이 **위**, 산은 알갱이 위(산속에
   * 공기가 비치지 않게), 화살표 · 센서는 맨 위. 층 순서로는 `region`(산 · 기둥)이
   * 물체와 화살표 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 산 아래 → 오름 → 정상(절반) → 흐려짐. 이름표 `½ p₀` 는 정상 단계에
   * 들어서며 켜진다.
   */
  timeline: {
    phases: [
      { id: 'ground', duration: GROUND, caption: key('caption.ground') },
      { id: 'climb', duration: CLIMB, ease: 'smooth', caption: key('caption.climb') },
      { id: 'summit', duration: SUMMIT, caption: key('caption.summit') },
      { id: 'fade', duration: FADE, caption: key('caption.summit') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 공기 알갱이는 첫 프레임부터 일렁이고, 산 아래
   * 장면을 잠깐 본 뒤 곧 오르기 시작하는 자리에서 연다.
   */
  startAt: 1.1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 km 가 아니라 **두 화살표의 길이 비**라
   * 거리 격자를 깔지 않는다.
   */

  messages: atmosphericPressureMessages,
};
