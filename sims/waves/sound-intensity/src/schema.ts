// ========================================================================
// sound-intensity — 선언
// ========================================================================
// 질문: 소리 나는 곳에서 두 배 멀어지면 소리는 얼마나 작아지는가.
//
// 음원에서 퍼져 나가는 소리 고리는 멀어질수록 같은 에너지를 더 넓은 구면에 나눠
// 옅어진다 — 세기는 거리의 제곱에 반비례한다. 귀가 r → 2r → 4r 로 물러나며 멈출
// 때마다 그 자리의 **세기 막대**와 **소리 크기(dB) 막대**를 한 쌍씩 남긴다. 세기는
// 1 → 1/4 → 1/16 로 꺼지는데 dB 는 80 → 74 → 68 로 조금씩만 낮아진다.
//
// 이웃 `inverse-square-law` 가 「같은 알갱이가 넓어지는 구면에 퍼진다」 를 이미 보였다.
// 이 조각은 구면 조각 · 창 안 알갱이 수를 되풀이하지 않고 **소리의 세기와 귀가 느끼는
// 크기의 차이** 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:sound-intensity` 와 문자 그대로 일치한다 (C4). */
export const SOUND_INTENSITY_ID = 'sound-intensity';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기준 거리 r 의 월드 길이. 귀가 처음 멈추는 자리다. */
export const RADIUS = 1.8;
/** 둘째 · 셋째로 멈추는 거리 — r 의 몇 배인가. 화면의 `2r` · `4r` 이 이 값 그대로다. */
export const MULTIPLE_2 = 2;
export const MULTIPLE_3 = 4;
/**
 * 그 거리에서 세기가 r 의 몇 분의 1 인가 — 화면의 `1/4` · `1/16` 이 이 값 그대로다.
 * 거리 배수의 제곱이어야 한다(두 상수의 관계는 선언할 자리가 없다 — 장부 G143).
 */
export const INTENSITY_RATIO_2 = 4;
export const INTENSITY_RATIO_3 = 16;
/**
 * 세 자리의 소리 크기(dB) 정박값. 화면의 `80 dB` · `74 dB` · `68 dB` 가 이 값 그대로다.
 * 거리 두 배마다 20·log₁₀2 ≈ 6.02 dB 씩 준다 — 막대 높이는 그 식으로 계산하고, 글자는
 * 계산값을 반올림하지 않고 이 정박값을 쓴다 (S-piece 유효숫자).
 *
 * 음원 출력과 기준 세기(10⁻¹² W/m²)는 따로 두지 않는다. 화면에 나오는 것은 둘의 비 —
 * r 에서의 소리 크기(`level1`) — 하나뿐이라, 셋을 함께 두면 같은 수의 출처가 둘이 된다.
 */
export const LEVEL_1 = 80;
export const LEVEL_2 = 74;
export const LEVEL_3 = 68;
/** 소리 고리가 나오는 간격(초). 실제 소리의 주기가 아니라 퍼짐이 보이는 박자다. */
export const RING_PERIOD = 0.35;
/** 고리가 퍼지는 빠르기(월드/초). 눈으로 따라갈 만큼 늦췄다. */
export const SOUND_SPEED = 2.2;

/**
 * 막대 판의 배치. 고리가 퍼지는 띠(가운데 y = 0) 아래에 막대가 선다.
 * 막대 높이 `BAR_HEIGHT` 가 세기 1 · 소리 크기 `level1` 이다 — 두 막대는 r 에서 같은
 * 높이로 출발해 멀어질수록 갈라진다.
 */
export const BAND_HALF = 1.25;
export const BAR_BASE_Y = -3.35;
export const BAR_HEIGHT = 1.35;
/** 막대 한 개의 폭과 한 쌍 안의 틈(월드). */
export const BAR_WIDTH = 0.34;
export const BAR_GAP = 0.08;

/**
 * 프레이밍은 주장의 일부다. 음원(x = 0)부터 가장 먼 자리(4r = 7.2)와 고리가 퍼져 나가는
 * 끝까지, 아래에는 막대 판과 캡션 자리. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.9, maxX: 8.5, minY: -4.35, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const soundIntensityMessages = Object.freeze({
  'label.title': { ko: '음의 세기', en: 'Sound intensity' },
  'label.operation': { ko: '거리 제곱에 반비례하는 감쇠', en: 'Falling off with the square of distance' },
  'label.stage': { ko: '물러나는 귀', en: 'Stepping back' },
  'label.view': { ko: '옆모습', en: 'Side view' },
  'label.source': { ko: '음원', en: 'Source' },
  'label.ear': { ko: '귀', en: 'Ear' },
  /** 막대 이름. 첫 쌍 아래에만 붙는다. */
  'label.intensity': { ko: '세기', en: 'Intensity' },
  'label.level': { ko: '소리 크기', en: 'Loudness' },
  /** 거리 이름표. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.distanceBase': { ko: 'r', en: 'r' },
  'label.distanceScaled': { ko: '{n}r', en: '{n}r' },
  /** 세기 — r 의 세기를 1 로 둔 비. 수식 표기다. */
  'label.intensityBase': { ko: '1', en: '1' },
  'label.intensityScaled': { ko: '1/{n}', en: '1/{n}' },
  /** 소리 크기 — 값 + 단위 표식. 값은 스테이지 정박값 그대로 끼운다. */
  'label.level.value': { ko: '{db} dB', en: '{db} dB' },
  'caption.base': {
    ko: '음원에서 r 떨어진 귀 — 이 자리의 세기를 1 로 두면 소리 크기는 {db1} dB',
    en: 'An ear at distance r from the source — call the intensity here 1; the loudness is {db1} dB',
  },
  'caption.moving': {
    ko: '물러날수록 같은 소리가 더 넓게 퍼져 고리가 옅어진다',
    en: 'Stepping back, the same sound is spread wider and the rings grow faint',
  },
  'caption.far2': {
    ko: '거리 {m2}배 — 세기는 1/{i2} 로 줄었는데, 소리 크기는 {db1} dB 에서 {db2} dB 로 조금 낮아졌을 뿐이다',
    en: 'At {m2}× the distance — the intensity is down to 1/{i2}, yet the loudness only dips from {db1} dB to {db2} dB',
  },
  'caption.far3': {
    ko: '거리 {m3}배 — 고리는 거의 보이지 않을 만큼 옅어져 세기가 1/{i3} 인데, 귀에는 아직 {db3} dB 다',
    en: 'At {m3}× the distance — the rings are barely visible and the intensity is 1/{i3}, yet the ear still hears {db3} dB',
  },
} satisfies Record<string, LocalizedText>);

export type SoundIntensityMessageKey = keyof typeof soundIntensityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SoundIntensityMessageKey): LocalizedText => soundIntensityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SoundIntensityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const soundIntensitySchema: BundleSchema = {
  id: SOUND_INTENSITY_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 소리가 이미 퍼지고 있고, 귀가 r · 2r · 4r 에서 차례로 멈춘다.
  parameters: [],

  stages: [
    {
      id: 'stepping-back',
      label: text('label.stage'),
      constants: {
        radius: RADIUS,
        multiple2: MULTIPLE_2,
        multiple3: MULTIPLE_3,
        intensityRatio2: INTENSITY_RATIO_2,
        intensityRatio3: INTENSITY_RATIO_3,
        level1: LEVEL_1,
        level2: LEVEL_2,
        level3: LEVEL_3,
        ringPeriod: RING_PERIOD,
        soundSpeed: SOUND_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 고리 띠 하나와 막대 판 하나를 세로로 얹는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 한 주기 = r 에서 듣기 → 2r 로 물러남 → 듣기 → 4r 로 물러남 → 듣기 → 되돌아옴.
   *
   * 물러나는 동안 귀 아래 막대가 함께 움직이며 줄어든다(세기는 빠르게, dB 는 느리게).
   * 멈춘 자리마다 그 쌍이 남아 세 쌍이 나란히 견주어진다.
   */
  timeline: {
    phases: [
      { id: 'hold1', duration: 2.6, caption: key('caption.base') },
      { id: 'move2', duration: 1.6, ease: 'smooth', caption: key('caption.moving') },
      { id: 'hold2', duration: 3.4, caption: key('caption.far2') },
      { id: 'move3', duration: 2.0, ease: 'smooth', caption: key('caption.moving') },
      { id: 'hold3', duration: 3.8, caption: key('caption.far3') },
      { id: 'back', duration: 1.2, ease: 'smooth', caption: key('caption.far3') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 고리는 시각의 함수라 첫 프레임부터 띠를 채우고 있고,
   * 귀는 r 에 서 있다.
   */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 역제곱 식 · dB 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션에 끼우는 수는 스테이지 상수 그대로다 — state 에 글자로 옮겨 둔다 (장부 G133).
    vars: {
      m2: 'multiple2',
      m3: 'multiple3',
      i2: 'intensityRatio2',
      i3: 'intensityRatio3',
      db1: 'level1',
      db2: 'level2',
      db3: 'level3',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 미터가 아니라 **r 의 몇 배인가** 와 두 막대의
   * 높이라서, 거리 이름표 r · 2r · 4r 과 막대 위 값만 둔다.
   */

  messages: soundIntensityMessages,
};
