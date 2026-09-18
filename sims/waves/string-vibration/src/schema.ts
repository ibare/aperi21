// ========================================================================
// string-vibration — 선언
// ========================================================================
// 질문: 기타 줄을 손가락으로 누르면 왜 음이 높아지는가.
//
// 답: 누른 자리부터 줄받침까지만 흔들린다. 그 부분이 기본 모양 — 반파장 하나 — 으로
// 흔들리므로 흔들리는 길이가 짧아지면 반파장이 짧아지고, 같은 파속에서 더 빨리
// 흔들린다(f₁ = v / 2L). 길이가 2/3 이면 3/2 배, 절반이면 두 배 — 한 옥타브 위다.
// 손가락이 줄을 따라 미끄러지는 동안 줄이 점점 빨리 흔들리고, 아래 파형창에는 같은
// 시간 동안 흔들린 횟수가 누르지 않은 줄(점선)보다 많이 담긴다.
//
// 배음(한 줄이 여러 모양으로 흔들리는 것)은 `harmonics` 의 몫이다 — 여기서는 언제나
// 기본 모양 하나만 흔들리고, 바뀌는 것은 흔들리는 길이 하나다. 장력 · 굵기는 두지 않았다
// (NOTES).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:string-vibration` 와 문자 그대로 일치한다 (C4). */
export const STRING_VIBRATION_ID = 'string-vibration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 줄 위 거리 한 단위. 너트가 x = 0, 줄받침이 x = L.
// ------------------------------------------------------------------------

/** 줄 전체 길이(너트 ~ 줄받침, 월드). */
export const STRING_LENGTH = 6;
/** 파속(월드/초). 누르지 않은 줄의 f₁ = v / 2L = 0.6 Hz — 흔들림을 눈으로 셀 수 있는 빠르기다. */
export const WAVE_SPEED = 7.2;
/** 배(가장 크게 흔들리는 자리)의 높이(월드). 흔들리는 길이와 무관하게 같게 둔다. */
export const AMPLITUDE = 0.45;
/**
 * 첫 번째로 누르는 자리 — 흔들리는 길이가 전체의 `num / den`. 기본 2/3(완전 5도 위).
 * 진동수 배수는 그 역수 `den / num` 이다. 화면 글자도 이 두 수를 그대로 쓴다 (S-piece 유효숫자).
 */
export const STOP1_NUM = 2;
export const STOP1_DEN = 3;
/** 두 번째로 누르는 자리 — 기본 1/2(한 옥타브 위). */
export const STOP2_NUM = 1;
export const STOP2_DEN = 2;
/** 파형창에 담기는 시간 — 누르지 않은 줄이 이만큼 흔들리는 시간이다. */
export const SCOPE_CYCLES = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 줄의 평형 높이(월드 y). */
export const STRING_Y = 1.05;
/** 흔들리는 길이를 재는 치수선 높이(월드 y). 줄이 가장 낮게 내려와도 닿지 않는다. */
export const DIMENSION_Y = 0.2;
/** 파형창 — 가로 기준선 높이 · 흔들림 높이(월드). 가로는 줄과 같은 폭을 쓴다. */
export const SCOPE_BASE_Y = -1.05;
export const SCOPE_AMPLITUDE = 0.42;
/** 너트 · 줄받침 받침대 크기(월드, [가로, 세로]). */
export const END_BLOCK: readonly [number, number] = [0.14, 0.34];
/** 손가락 끝(누르는 자리) 반지름(월드). */
export const FINGER_RADIUS = 0.13;
/** 프렛(누를 자리 표시) 반길이(월드). */
export const FRET_HALF = 0.16;

/**
 * 프레이밍 — 왼쪽은 파형창 이름표, 오른쪽은 진동수 글자, 아래는 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.5, maxX: 7.1, minY: -2.05, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stringVibrationMessages = Object.freeze({
  'label.title': { ko: '줄의 진동', en: 'Vibrating string' },
  'label.operation': { ko: '양끝이 고정된 줄의 모드', en: 'Modes of a string fixed at both ends' },
  'label.stage': { ko: '손가락으로 누르는 줄', en: 'String stopped by a finger' },
  'label.view': { ko: '줄과 파형', en: 'String and waveform' },

  /** 누르는 손가락. */
  'label.finger': { ko: '손가락', en: 'finger' },
  /** 흔들리는 길이 — 치수선 글자. 분수는 스테이지 상수 그대로다. */
  'label.len.open': { ko: 'L', en: 'L' },
  'label.len.frac': { ko: '{a}/{b} L', en: '{a}/{b} L' },
  /** 진동수 — 파형 끝 글자. 기호라 두 언어가 같다(C1 표식). */
  'label.freq.open': { ko: 'f₁', en: 'f₁' },
  'label.freq.whole': { ko: '{n} f₁', en: '{n} f₁' },
  'label.freq.frac': { ko: '{a}/{b} f₁', en: '{a}/{b} f₁' },
  /** 파형창 이름과 점선 이름. */
  'label.scope': { ko: '가운데 점의 흔들림 — 같은 시간 동안', en: 'Swing of the middle point — same time span' },
  'label.reference': { ko: '누르지 않은 줄', en: 'open string' },

  'caption.open': {
    ko: '누르지 않은 줄 — 너트에서 줄받침까지 줄 전체가 반파장 하나로 흔들린다.',
    en: 'Open string — the whole string, nut to bridge, swings as one half-wavelength.',
  },
  'caption.slide': {
    ko: '손가락이 줄을 누르며 미끄러진다 — 흔들리는 부분이 짧아질수록 더 빨리 흔들린다.',
    en: 'The finger slides along the string — the shorter the swinging part, the faster it swings.',
  },
  'caption.short': {
    ko: '누른 자리부터 줄받침까지만 흔들린다 — 같은 시간에 더 여러 번, 음이 높아진다.',
    en: 'Only the part from finger to bridge swings — more swings in the same time, a higher note.',
  },
  'caption.octave': {
    ko: '흔들리는 길이가 절반 — 두 배 빠르게 흔들린다. 한 옥타브 위 음이다.',
    en: 'Half the swinging length — twice as fast. The note is an octave higher.',
  },
  'caption.release': {
    ko: '손가락을 떼며 돌아간다 — 길어지는 만큼 느려진다.',
    en: 'The finger slides back and lifts — longer again, slower again.',
  },
} satisfies Record<string, LocalizedText>);

export type StringVibrationMessageKey = keyof typeof stringVibrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: StringVibrationMessageKey): LocalizedText => stringVibrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StringVibrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stringVibrationSchema: BundleSchema = {
  id: STRING_VIBRATION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 손가락이 정해진 자리(개방 → 2/3 → 1/2)를 차례로 누르며 주장을 마친다 —
  // 독자가 손가락을 옮기게 해도 새로 보이는 것이 없고, 비교할 정박값이 흐트러진다.
  parameters: [],

  stages: [
    {
      id: 'stopped-string',
      label: text('label.stage'),
      constants: {
        stringLength: STRING_LENGTH,
        waveSpeed: WAVE_SPEED,
        amplitude: AMPLITUDE,
        stop1Num: STOP1_NUM,
        stop1Den: STOP1_DEN,
        stop2Num: STOP2_NUM,
        stop2Den: STOP2_DEN,
        scopeCycles: SCOPE_CYCLES,
      },
    },
  ],

  environments: [],

  views: [{ id: 'string', label: text('label.view'), default: true }],

  /** 줄 한 줄 + 치수선 + 파형창 + 캡션 한 줄. */
  canvas: { height: 400, minHeight: 360 },

  /** 프렛 · 점선 틀을 먼저, 줄을 그 위에, 손가락 · 받침을 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 13.9 초. 흔들리는 길이(전체 대비)가 단계마다 이렇게 간다 —
   *
   * - `open` 1 · `slide-1` 1 → stop1 · `stop-1` stop1 · `slide-2` stop1 → stop2 · `stop-2` stop2 ·
   *   `release` stop2 → 1 · `mute` 1 에서 흔들림이 잦아든다(손가락을 떼며 줄을 멈춘다).
   * - 주기가 돌아오면 줄을 다시 튕긴다 — 가장 높은 자리에서 놓아 준다.
   * - 미끄러지는 단계는 진행도를 길이에 **선형으로** 잇는다 — 진동 위상은 진동수를 시간으로
   *   적분한 값이라(`physics.ts vibrationPhase`) 이징을 주면 그 적분이 어긋난다.
   */
  timeline: {
    phases: [
      { id: 'open', duration: 3.0, caption: key('caption.open') },
      { id: 'slide-1', duration: 1.4, caption: key('caption.slide') },
      { id: 'stop-1', duration: 3.0, caption: key('caption.short') },
      { id: 'slide-2', duration: 1.2, caption: key('caption.slide') },
      { id: 'stop-2', duration: 3.4, caption: key('caption.octave') },
      { id: 'release', duration: 1.4, caption: key('caption.release') },
      { id: 'mute', duration: 0.5, caption: key('caption.release') },
    ],
  },

  /** 도착한 순간 누르지 않은 줄이 이미 흔들리고 파형창이 차 있다. */
  startAt: 1.2,

  /** 슬롯 하나. 파형창 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본).

  messages: stringVibrationMessages,
};
