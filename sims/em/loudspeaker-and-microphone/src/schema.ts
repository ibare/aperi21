// ========================================================================
// loudspeaker-and-microphone — 선언
// ========================================================================
// 질문: 스피커와 마이크는 무엇이 다른가.
//
// 답: 같은 장치다. 영구 자석 틈에 코일이 있고 코일에 진동판이 붙어 있다. 코일에 교류를
// 흘리면 자석이 코일을 앞뒤로 밀어 진동판이 떨고 공기를 민다(스피커). 거꾸로 공기가
// 진동판을 밀면 코일이 자석 틈에서 움직여 전류가 생긴다(마이크). 방향만 반대인 왕복이다.
//
// 동사: 스피커 판에서는 **전류가 진동이 되어** 공기로 나가고, 마이크 판에서는 들어온
// 소리가 진동판을 떨게 해 **진동이 전류가 된다.**
//
// 이웃 `force-on-current-wire` 는 자기장 속 전류가 받는 힘 하나를, `faradays-law` 는 움직이는
// 자석이 만드는 전압의 크기를 다룬다. 이 조각은 두 현상이 **한 장치 안에서 서로 거꾸로**
// 쓰인다는 것만 말한다 — 힘의 방향 · 전압의 크기는 두 이웃의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:loudspeaker-and-microphone` 와 문자 그대로 일치한다 (C4). */
export const LOUDSPEAKER_AND_MICROPHONE_ID = 'loudspeaker-and-microphone';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 진동수(Hz, 화면 시간). 실제 소리(수백 Hz)를 눈으로 따라갈 수 있게 늦춘 값이다. */
export const FREQUENCY = 1;
/** 진동판 · 공기 알갱이 변위의 진폭(월드). 실제 몇 mm 를 보이게 키운 표시값이다. */
export const AMPLITUDE = 0.25;
/** 공기 속 소리의 빠르기(월드/초, 화면 시간). 파장 = 빠르기 / 진동수. */
export const SOUND_SPEED = 2.5;
/** 기록지 한 폭이 담는 시간(초, 화면 시간). */
export const RECORD_SECONDS = 4;
/** 기록지 띠 반 높이 중 파형 봉우리가 차지하는 몫(0~1). */
export const TRACE_HEIGHT = 0.8;
/** 공기 알갱이 흩뿌림의 시드. */
export const SEED = 7;
/** 공기 알갱이를 격자 자리에서 흩는 폭(격자 간격에 대한 몫, 0~0.5). */
export const AIR_JITTER = 0.12;

// ------------------------------------------------------------------------
// 배치 — 공기가 차 있는 구간. 시간표의 조용한 단계 길이가 이 폭을 기준으로 잡힌다.
// ------------------------------------------------------------------------

/** 진동판 가장자리의 가로 자리(쉬는 때, 월드). 공기 속 파동은 여기서 나가고 여기로 들어온다. */
export const CONE_RIM_X = -0.6;
/** 공기 알갱이 구간의 가까운 끝 · 먼 끝(월드). */
export const AIR_NEAR = -0.05;
export const AIR_FAR = 4.4;

/**
 * 프레이밍. 왼쪽 기록지 두 띠, 가운데 스피커 단면, 오른쪽 공기, 아래 캡션 줄.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -9.2, maxX: 4.8, minY: -3.1, maxY: 2.7 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 아래). */
export const CAPTION_AT = [-9.0, -2.35] as const;

// ------------------------------------------------------------------------
// 시간표 기본값(초)
// ------------------------------------------------------------------------

const APPEAR = 0.4;
/**
 * 소리가 차오르는 단계 — 이 동안 원천의 진폭이 0 에서 가득 찬다. 기본 진동수(1 Hz)에서 한 주기다.
 * 진동수를 바꾸면 따라가지 않는다 (장부 G13).
 */
const RAMP = 1;
const SPEAK = 2;
const AIR = 3;
const STOP = 0.6;
/**
 * 조용한 단계 — 마지막 소리가 공기 구간을 다 빠져나가는 시간 이상이다. 들어오는 소리도 같은
 * 길이 동안 먼 끝에서 진동판까지 온다. 기본 상수에서 계산한 기본값이다 (장부 G13).
 */
const QUIET = Math.ceil(((AIR_FAR - CONE_RIM_X) / SOUND_SPEED) * 10) / 10;
const LISTEN = 2;
const CURRENT = 3;
const HUSH = 0.6;
const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const loudspeakerAndMicrophoneMessages = Object.freeze({
  'label.title': { ko: '스피커와 마이크', en: 'Loudspeaker and microphone' },
  'label.operation': { ko: '전류와 진동을 오가는 변환', en: 'Turning current into vibration and back' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 지금 장치가 하는 일. 낱말이라 문안이다 (C1). */
  'label.speaker': { ko: '스피커', en: 'Loudspeaker' },
  'label.microphone': { ko: '마이크', en: 'Microphone' },
  /** 기록지 띠 이름 — 낱말 + 기호. */
  'label.current': { ko: '전류 I', en: 'current I' },
  'label.displacement': { ko: '진동판 x', en: 'cone x' },
  'label.air': { ko: '공기', en: 'air' },
  /** 극 · 장 기호. 두 언어가 같다 (C1 판정 1 · 3). */
  'label.north': { ko: 'N', en: 'N' },
  'label.south': { ko: 'S', en: 'S' },
  'label.field': { ko: 'B', en: 'B' },

  'caption.speak': {
    ko: '스피커 — 코일에 교류가 흐르면 자석이 코일을 앞뒤로 밀어, 진동판이 전류를 따라 떤다.',
    en: 'Loudspeaker: an alternating current in the coil lets the magnet push it back and forth, so the cone shakes in step with the current.',
  },
  'caption.air': {
    ko: '떨리는 진동판이 공기를 밀고 당겨, 촘촘한 곳과 성긴 곳이 퍼져 나간다.',
    en: 'The shaking cone pushes and pulls the air, and bands of crowded and sparse air spread outward.',
  },
  'caption.stop': {
    ko: '전류가 잦아들자 진동판의 떨림도 함께 잦아든다.',
    en: 'As the current dies down, the cone\'s shaking dies down with it.',
  },
  'caption.quiet': {
    ko: '전류가 멎고 진동판도 멈췄다. 마지막 소리가 빠져나간다.',
    en: 'The current has stopped and so has the cone. The last of the sound moves away.',
  },
  'caption.arrive': {
    ko: '이번에는 소리가 들어온다. 촘촘한 곳과 성긴 곳이 진동판 쪽으로 다가온다.',
    en: 'Now sound comes in. Crowded and sparse bands of air travel toward the cone.',
  },
  'caption.listen': {
    ko: '마이크 — 공기가 진동판을 밀고 당기면 코일이 자석 틈에서 앞뒤로 움직여 전류가 생긴다.',
    en: 'Microphone: the air pushes and pulls the cone, the coil moves back and forth in the magnet gap, and a current appears.',
  },
  'caption.current': {
    ko: '진동판이 한 번 떨 때마다 코일의 전류도 한 번 오르내린다. 진동이 전류가 되었다.',
    en: 'Each time the cone shakes, the coil current rises and falls once. The vibration has become a current.',
  },
  'caption.hush': {
    ko: '소리가 잦아들자 진동판도 전류도 잦아든다.',
    en: 'As the sound dies away, the cone and the current die away too.',
  },
} satisfies Record<string, LocalizedText>);

export type LoudspeakerAndMicrophoneMessageKey = keyof typeof loudspeakerAndMicrophoneMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LoudspeakerAndMicrophoneMessageKey): LocalizedText => loudspeakerAndMicrophoneMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LoudspeakerAndMicrophoneMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const loudspeakerAndMicrophoneSchema: BundleSchema = {
  id: LOUDSPEAKER_AND_MICROPHONE_ID,
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
        frequency: FREQUENCY,
        amplitude: AMPLITUDE,
        soundSpeed: SOUND_SPEED,
        recordSeconds: RECORD_SECONDS,
        traceHeight: TRACE_HEIGHT,
        seed: SEED,
        airJitter: AIR_JITTER,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 기록지 · 장치 · 공기가 한 줄, 캡션이 그 아래 한 줄. */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 쓴 순서대로 겹친다 — 공기, 기록지, 바구니 · 자석, 자기장, 코일 · 진동판, 표식, 이름표.
   * 층 순서로는 「코일 속 칠이 자기장 화살표를 가린다」 를 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 코일에 교류가 흐르고 진동판이 이미 떨고 있다 (S-piece). */
  startAt: 2,

  /**
   * 한 주기. 스피커 판 → 조용함 → 마이크 판.
   *
   * - `appear` — 옅게 떠오른다. 장치는 쉬고 있다.
   * - `speak-ramp` — 코일에 교류가 흐르기 시작한다. 이 단계 동안 진폭이 0 에서 가득 찬다(곧바로 가득 찬 사인이면
   *   마이크 쪽 전류가 첫 순간 계단처럼 튀므로 두 판 모두 차오르게 둔다).
   * - `speak` — 가득 찬 교류. 진동판이 전류를 따라 떤다.
   * - `air` — 같은 일이 이어진다. 공기에 촘촘한 곳 · 성긴 곳이 퍼져 나간다.
   * - `stop` — 전류가 이 단계 동안 잦아들어 0 이 된다.
   * - `quiet` — 전류 0. 마지막 소리가 공기 구간을 빠져나간다. 스피커 기록지가 물러난다.
   * - `arrive` — 오른쪽 끝에서 들어오는 소리가 진동판 쪽으로 온다. 이 단계가 끝나는 순간 진동판에 닿는다.
   * - `listen-ramp` — 들어온 소리가 진동판에 닿아 떨림이 차오른다. 코일에 전류가 생기기 시작한다.
   * - `listen` — 가득 찬 떨림. 공기가 진동판을 흔들고 코일에 전류가 흐른다.
   * - `current` — 같은 일이 이어진다.
   * - `hush` — 들어오는 소리가 이 단계 동안 잦아든다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR },
      { id: 'speak-ramp', duration: RAMP, caption: key('caption.speak') },
      { id: 'speak', duration: SPEAK, caption: key('caption.speak') },
      { id: 'air', duration: AIR, caption: key('caption.air') },
      { id: 'stop', duration: STOP, caption: key('caption.stop') },
      { id: 'quiet', duration: QUIET, caption: key('caption.quiet') },
      { id: 'arrive', duration: QUIET, caption: key('caption.arrive') },
      { id: 'listen-ramp', duration: RAMP, caption: key('caption.listen') },
      { id: 'listen', duration: LISTEN, caption: key('caption.listen') },
      { id: 'current', duration: CURRENT, caption: key('caption.current') },
      { id: 'hush', duration: HUSH, caption: key('caption.hush') },
      { id: 'fade', duration: FADE, caption: key('caption.hush') },
    ],
  },

  /** 슬롯 하나. 그림 아래 줄에 왼쪽 맞춤으로 세운다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 620,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 조작기 없음. 잴 거리가 없고, 자동 진행이 두 방향을 모두 지난다.

  messages: loudspeakerAndMicrophoneMessages,
};
