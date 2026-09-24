// ========================================================================
// noise-cancellation — 선언
// ========================================================================
// 질문: 헤드폰은 어떻게 소리를 더해서 소리를 없애는가?
//
// 줄 셋을 위아래로 둔다. 위 줄은 마이크가 듣는 바깥 소음(불규칙한 파형), 가운데
// 줄은 헤드폰이 그 소음을 **위아래로 뒤집어** 스피커로 내는 소리, 아래 줄은 귀에
// 닿는 둘의 합이다. 뒤집은 소리가 나오기 시작하면 마루마다 골이 맞서 합이 거의
// 평평해진다. 뒤집는 데 늦으면(지연) 두 파형이 어긋난 만큼 지워지지 않고 남는다.
//
// 펄스가 만나 지나가는 것(superposition)과 같은 두 파동의 위상차 손잡이
// (constructive-destructive)는 이 조각의 몫이 아니다. 여기서 움직이는 것은
// 「뒤집기」 와 「늦음」 이고, 소음은 사인 하나가 아니라 불규칙하다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:noise-cancellation` 와 문자 그대로 일치한다 (C4). */
export const NOISE_CANCELLATION_ID = 'noise-cancellation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 줄 위의 거리(칸)다. 변위도 같은 단위라 모양이 찌그러지지 않는다.
// ------------------------------------------------------------------------

/** 소음 파형을 정하는 시드. 같은 시드면 언제나 같은 소음이다. */
export const NOISE_SEED = 5;
/** 소음을 이루는 사인 개수. 여럿이 겹쳐 불규칙하게 보인다. */
export const NOISE_PARTIALS = 6;
/** 성분 사인들의 진폭 합(칸). 모든 마루가 한 자리에 모여도 이 높이를 넘지 않는다. */
export const NOISE_PEAK = 1.2;
/** 성분 사인의 파장 범위(칸). 시드가 이 사이에서 고른다. */
export const WAVELENGTH_MIN = 0.9;
export const WAVELENGTH_MAX = 6;
/** 소리가 귀 쪽(오른쪽)으로 흐르는 속력(칸/초). 세 줄이 같다. */
export const SOUND_SPEED = 1.1;
/** 뒤집은 소리가 늦게 나오는 시간(초). `lag` 단계에서 0 부터 이 값까지 늦어진다. */
export const LAG_DELAY = 0.2;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 스피커가 꺼진 채 소음만 귀에 닿는 동안. */
export const NOISE_HOLD = 2.8;
/** 마이크가 들은 소음을 위아래로 뒤집는 동안. */
export const FLIP = 2.4;
/** 뒤집은 소리가 스피커에서 커지는 동안. */
export const PLAY = 2.2;
/** 거의 평평한 합을 읽는 동안. */
export const QUIET_HOLD = 3.0;
/** 뒤집은 소리가 늦어지는 동안. */
export const LAG = 2.2;
/** 늦은 채 남은 소리를 읽는 동안. */
export const LAG_HOLD = 3.0;
/** 스피커가 꺼지며 처음으로 돌아가는 동안. */
export const OFF = 1.4;

// ------------------------------------------------------------------------
// 배치 — 월드 칸. 위에서부터 바깥 소음 · 뒤집은 소리 · 귀에 닿는 합.
// ------------------------------------------------------------------------

/** 줄의 양끝(가로). */
export const STRING_HALF = 8.2;
/** 세 줄의 평형 높이. */
export const ROW_NOISE_Y = 2.8;
export const ROW_ANTI_Y = 0.0;
export const ROW_EAR_Y = -2.8;

/**
 * 프레이밍은 주장의 일부다. 가로는 줄 양끝, 세로는 위 줄 이름표 위부터 아래 줄의
 * 가장 깊은 골 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.6, maxX: 8.6, minY: -4.6, maxY: 4.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const noiseCancellationMessages = Object.freeze({
  'label.title': { ko: '능동 소음 제거', en: 'Active noise cancellation' },
  'label.operation': { ko: '역위상 파동의 중첩', en: 'Superposing an inverted wave' },
  'label.stage': { ko: '헤드폰', en: 'Headphones' },
  'label.view': { ko: '소음 · 뒤집은 소리 · 합', en: 'Noise · flipped copy · sum' },
  'label.noise': { ko: '바깥 소음 (마이크)', en: 'Outside noise (mic)' },
  'label.anti': { ko: '뒤집은 소리 (스피커)', en: 'Flipped copy (speaker)' },
  'label.ear': { ko: '귀에 닿는 소리', en: 'What reaches the ear' },
  'caption.noise': {
    ko: '스피커가 꺼져 있으면 바깥 소음이 그대로 귀에 닿는다',
    en: 'With the speaker off, the outside noise reaches the ear unchanged',
  },
  'caption.flip': {
    ko: '헤드폰이 마이크로 들은 소음을 위아래로 뒤집는다',
    en: 'The headphones flip the noise picked up by the mic upside down',
  },
  'caption.play': {
    ko: '뒤집은 소리를 함께 내보내면 마루마다 골이 맞서 귀에 닿는 소리가 거의 평평해진다',
    en: 'Played together, every crest meets a trough and the sound at the ear goes almost flat',
  },
  'caption.lag': {
    ko: '뒤집은 소리가 늦게 나오면 어긋난 만큼 지워지지 않고 남는다',
    en: 'If the flipped copy comes out late, whatever is out of step is left behind',
  },
} satisfies Record<string, LocalizedText>);

export type NoiseCancellationMessageKey = keyof typeof noiseCancellationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NoiseCancellationMessageKey): LocalizedText => noiseCancellationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NoiseCancellationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const noiseCancellationSchema: BundleSchema = {
  id: NOISE_CANCELLATION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 소음이 흐르고, 뒤집히고, 지워지고, 늦어지면 남는다.
  parameters: [],

  stages: [
    {
      id: 'headphones',
      label: text('label.stage'),
      constants: {
        seed: NOISE_SEED,
        partials: NOISE_PARTIALS,
        noisePeak: NOISE_PEAK,
        wavelengthMin: WAVELENGTH_MIN,
        wavelengthMax: WAVELENGTH_MAX,
        speed: SOUND_SPEED,
        lagDelay: LAG_DELAY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rows', label: text('label.view'), default: true }],

  /** 가로 17.2 칸 · 세로 9 칸. 줄이 셋이라 이웃보다 조금 높다. */
  canvas: { height: 420, minHeight: 360 },

  /** 평형선 · 옛 소음의 흔적이 위에 그린 곡선에 가려야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 소음만 → 뒤집기 → 함께 내보냄 → 조용함 → 늦어짐 → 늦은 채 → 끔.
   * 뒤집힌 정도는 `flip`, 스피커 크기는 `play` − `off`, 지연은 `lag` 의 진행도다.
   */
  timeline: {
    phases: [
      { id: 'noise', duration: NOISE_HOLD, caption: key('caption.noise') },
      { id: 'flip', duration: FLIP, ease: 'smooth', caption: key('caption.flip') },
      { id: 'play', duration: PLAY, ease: 'smooth', caption: key('caption.play') },
      { id: 'quiet', duration: QUIET_HOLD, caption: key('caption.play') },
      { id: 'lag', duration: LAG, ease: 'smooth', caption: key('caption.lag') },
      { id: 'lagHold', duration: LAG_HOLD, caption: key('caption.lag') },
      { id: 'off', duration: OFF, ease: 'smooth', caption: key('caption.noise') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 소음이 흐르는 가운데 곧 뒤집기가 시작된다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **모양**(뒤집힘 · 평평함 ·
   * 남은 출렁임)이다.
   */

  messages: noiseCancellationMessages,
};
