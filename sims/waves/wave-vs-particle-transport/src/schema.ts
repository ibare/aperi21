// ========================================================================
// wave-vs-particle-transport — 선언
// ========================================================================
// 질문: 파동이 줄을 건너갈 때 무엇이 건너가나 — 줄의 조각인가, 에너지인가.
//
// 왼쪽 손잡이가 한 번 튕겨 보낸 펄스 하나가 줄을 따라 오른쪽으로 건너간다. 줄 위 세
// 자리에 표시한 조각은 펄스가 지나갈 때 솟았다가 **처음 자리 고리 안으로 돌아온다.**
// 펄스는 줄 끝에 매단 용수철 추에 닿아 사라지고, 추는 그 에너지를 받아 오르내린다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wave-vs-particle-transport` 와 문자 그대로 일치한다 (C4). */
export const WAVE_VS_PARTICLE_TRANSPORT_ID = 'wave-vs-particle-transport';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 펄스의 높이(진폭, m). */
export const AMPLITUDE = 0.8;
/** 펄스의 폭(가우스 펄스의 표준 편차, m). */
export const PULSE_WIDTH = 0.5;
/** 줄 위 파속(m/s). */
export const WAVE_SPEED = 2.5;
/** 끝 추의 고유 주기(s) — 용수철과 추가 정한다. */
export const RECEIVER_PERIOD = 1.1;
/** 끝 추의 감쇠율(1/s). 다음 펄스가 올 때쯤 흔들림이 가장 컸을 때의 약 1할로 잦아든다. */
export const RECEIVER_DAMPING = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 미터
// ------------------------------------------------------------------------

/** 줄의 왼쪽 끝(손잡이) — 좌표 원점이다. */
export const ROPE_START = 0;
/**
 * 줄의 오른쪽 끝(추에 매인 자리, m). 펄스가 건너가는 거리를 정하는 물리량이라 스테이지 상수
 * `ropeEnd` 의 기본값이다 (원칙 2).
 */
export const ROPE_END = 8.5;
/**
 * 표시한 줄 조각의 자리. 펄스가 지나가도 이 x 에서 벗어나지 않는다. 스테이지 상수는 수 하나씩뿐이라
 * 목록을 선언할 수 없어 모듈 상수로 둔다 (장부 G105).
 */
export const MARKED_XS: readonly number[] = [2, 4, 6];
/** 펄스가 출발하는 중심 자리(m) — 손잡이 뒤, 펄스가 아직 줄에 올라오지 않은 곳. 스테이지 상수 `launchX` 의 기본값. */
export const PULSE_LAUNCH_X = -1.5;
/** 추를 매단 천장 높이. */
export const CEILING_Y = 2.0;

/**
 * 프레이밍은 주장의 일부다. 가로는 손잡이부터 추 너머까지, 세로는 추가 가장 내려간
 * 자리부터 천장 위 캡션 줄 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.7, maxX: 9.5, minY: -1.1, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이
// ------------------------------------------------------------------------

/**
 * 펄스가 출발 자리에서 줄 끝(추)까지 건너가는 동안. 기본값은 스테이지 상수 기본값으로 센
 * (ropeEnd − launchX) / waveSpeed = 4 초다. 펄스의 자리는 이 단계의 진행도가 아니라 파속 × 흐른 시간으로 센다 —
 * 이 길이를 바꾸면 캡션이 바뀌는 순간만 달라진다(장부 G129).
 */
export const TRAVEL = (ROPE_END - PULSE_LAUNCH_X) / WAVE_SPEED;
/** 펄스가 추에 닿아 추가 크게 흔들리는 동안. */
export const ARRIVE = 1.6;
/** 줄은 잔잔하고 추만 잦아드는 동안. 다음 주기 전에 추가 거의 멈춘다. */
export const REST = 2.6;
/**
 * 도착한 순간 이미 진행 중이다 — 펄스가 줄 가운데쯤 와서 첫 조각은 고리로 돌아오는 중,
 * 둘째 조각은 곧 솟는다.
 */
export const START_AT = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const waveVsParticleTransportMessages = Object.freeze({
  'label.title': { ko: '파동이 나르는 것', en: 'What a wave carries' },
  'label.stage': { ko: '펄스 하나와 끝의 추', en: 'One pulse and a weight at the end' },
  'label.view': { ko: '줄과 표시한 조각', en: 'The rope and its marked pieces' },
  'caption.travel': {
    ko: '펄스가 줄을 건너간다 — 표시한 조각은 솟았다가 제 고리로 돌아온다',
    en: 'A pulse crosses the rope — each marked piece rises, then drops back into its ring',
  },
  'caption.arrive': {
    ko: '줄 끝에 닿은 펄스가 추를 흔든다',
    en: 'The pulse reaches the end and sets the weight bouncing',
  },
  'caption.rest': {
    ko: '표시한 조각은 모두 제자리에 있고, 추는 건너온 에너지로 흔들린다',
    en: 'Every marked piece is back where it started — the weight bounces with the energy that came across',
  },
} satisfies Record<string, LocalizedText>);

export type WaveVsParticleTransportMessageKey = keyof typeof waveVsParticleTransportMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WaveVsParticleTransportMessageKey): LocalizedText =>
  waveVsParticleTransportMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WaveVsParticleTransportMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const waveVsParticleTransportSchema: BundleSchema = {
  id: WAVE_VS_PARTICLE_TRANSPORT_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 펄스가 건너가고, 추가 흔들리고, 다음 펄스가 나간다.
  parameters: [],

  stages: [
    {
      id: 'pulse-and-weight',
      label: text('label.stage'),
      constants: {
        amplitude: AMPLITUDE,
        pulseWidth: PULSE_WIDTH,
        waveSpeed: WAVE_SPEED,
        receiverPeriod: RECEIVER_PERIOD,
        receiverDamping: RECEIVER_DAMPING,
        ropeEnd: ROPE_END,
        launchX: PULSE_LAUNCH_X,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rope', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 줄 한 가닥과 끝의 추뿐이다 (S-piece — 세로가 비싸다). */
  canvas: { height: 300, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 조각은 제 고리 **위**에 얹혀야 「고리 안에 돌아왔다」 가 읽히고,
   * 펄스의 강조 띠는 줄 위, 조각은 그 위, 추는 용수철 끝 위에 얹힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 펄스가 건너감 → 추에 닿음 → 잦아듦. 주기마다 손잡이가 펄스를 하나 새로 보낸다.
   * 펄스와 추는 `travel` 시작부터 흐른 시간의 함수라, 단계 경계로 자리를 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'travel', duration: TRAVEL, caption: key('caption.travel') },
      { id: 'arrive', duration: ARRIVE, caption: key('caption.arrive') },
      { id: 'rest', duration: REST, caption: key('caption.rest') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'top-left', offset: [4, 4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 720,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 「고리 안에 있는가」 다.

  messages: waveVsParticleTransportMessages,
};
