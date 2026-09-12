// ========================================================================
// beats — 선언
// ========================================================================
// 질문: 두 음은 각각 세기가 조금도 변하지 않는데, 왜 합쳐진 소리만 커졌다
// 작아졌다 할까.
//
// 아무것도 세지거나 약해지지 않는다. 두 음의 발걸음이 밀려 어긋날 뿐이고,
// 어긋난 만큼 서로를 지운다.
//
// 원본: tasks/piece-lab/beats/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:beats` 와 문자 그대로 일치한다 (C4). */
export const BEATS_ID = 'beats';

// ------------------------------------------------------------------------
// 자 — 원본의 픽셀을 월드로 옮긴다
// ------------------------------------------------------------------------
//
// 원본은 860×400 캔버스에 픽셀로 그렸다. 엔진은 월드 좌표를 카메라가 화면에
// 맞추므로, **위 트랙의 진폭 46 px 를 1 로** 두고 나머지를 그 자로 잰다.
// 그래야 두 트랙의 높이 비(46 대 92)가 화면 크기와 무관하게 지켜진다 — 그 비는
// 합의 최대 진폭이 원본의 두 배라는 물리에서 나온 값이라 균등 분할로 바꿀 수 없다.

/** 원본 46 px = 월드 1. */
const PX = 1 / 46;
/** 원본에서 위 트랙 기준선의 세로 자리(px). 이것이 월드 y = 0 이다. */
const ORIGIN_PY = 84;
/** 원본의 세로 픽셀 좌표 → 월드 y (위가 +). */
const wy = (py: number): number => (ORIGIN_PY - py) * PX;
/** 원본의 픽셀 길이 → 월드 길이. */
const wl = (px: number): number => px * PX;

/** 판이 담는 시간창의 가로 길이(월드). 원본 X0=20 … X1=828 의 808 px. */
export const TRACK_SPAN = wl(808);
/** 위 트랙 기준선 — 두 음의 변위 0. */
export const TONE_Y = wy(84);
/** 아래 트랙 기준선 — 합친 소리의 변위 0. 원본 YB=246. */
export const SUM_Y = wy(246);
/** 마디 세로 획의 길이(월드). 원본은 y 30 에서 344 까지 판을 관통했다. */
export const NODE_SPAN = wl(344 - 30);
/** 마디 세로 획의 한가운데. `trace` 의 tick 은 자리를 중심으로 위아래로 자란다. */
export const NODE_MID = wy((30 + 344) / 2);
/** '울렁임 한 칸' 이 놓이는 줄. 원본 y=356. */
export const BEAT_ROW_Y = wy(356);
/** 지금 흔들리는 두 음의 원 — 반지름(월드). 원본 5.5 px. */
export const TONE_DOT = wl(5.5);
/** 지금 들리는 소리의 원 — 반지름(월드). 원본 7.5 px. */
export const SUM_DOT = wl(7.5);
/**
 * '울렁임 한 칸' 에 글자를 넣는 최소 폭(월드).
 *
 * 원본은 글자 폭 + 44 px 보다 칸이 좁으면 글자를 빼고 선만 남겼다. 칸이 좁아지면
 * 글자가 스스로 사라지는 것이 이 표시의 규칙이다.
 */
export const BEAT_LABEL_MIN = wl(110);

/** 선 굵기(화면 px). 굵기는 물리량이 아니라 위계라 배율을 따라가지 않는다. */
export const TONE_LINE = 1.3;
export const SUM_LINE = 2.1;
export const GUIDE_LINE = 1;

/**
 * 프레이밍은 주장의 일부다 — 고정값을 준다 (S-piece).
 *
 * 원본이 실제로 그린 범위 그대로다. 가로는 시간창 전체(808 px), 세로는 마디 획의
 * 위 끝(30 px)부터 합친 파형이 가장 낮게 내려가는 자리 아래(362 px)까지.
 */
export const SCENE_BOUNDS = {
  minX: -TRACK_SPAN,
  maxX: 0,
  minY: wy(362),
  maxY: wy(30),
} as const;

/**
 * 마운트 전에 `step` 을 미리 굴리는 시간(초).
 *
 * 원본의 「과거 채우기」다 — 잔상 버퍼와 마디 자국을 t<0 구간까지 역산해 채워
 * 두고 시작한다. 빈 화면이 오른쪽부터 차오르는 4.5 초를 기다리게 하지 않는다
 * (S-piece: 독자가 도착한 순간 이미 진행 중).
 *
 * **20/3 초인 것은 우연이 아니다.** f₁=3 Hz · Δf=0.45 Hz 에서 이 시간은 기준 음
 * 20 주기 · 둘째 음 23 주기 · 울렁임 3 주기와 **정확히** 같다. 그래서 굴리고 난
 * 자리가 위상 0 으로 되돌아와, 마운트한 첫 화면이 원본의 t=0 과 같은 화면이 된다
 * (두 원이 포개지고 합이 가장 크게 흔들리는 자리). 시간창 4.5 초보다 길어서
 * 잔상도 이미 가득 차 있다.
 */
export const PREROLL = 20 / 3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const beatsMessages = Object.freeze({
  'label.title': { ko: '맥놀이', en: 'Beats' },
  'label.operation': {
    ko: '두 음이 어긋나는 만큼 합이 지워진다',
    en: 'The sum cancels as the two drift apart',
  },
  'label.stage': { ko: '두 음', en: 'Two tones' },
  'label.view': { ko: '파형', en: 'Waveform' },
  /** 마디 둘을 잇는 칸의 이름표. 칸이 좁아지면 scene 이 이것을 빼고 선만 남긴다. */
  'label.beat': { ko: '울렁임 한 번', en: 'one beat' },
  /** 조작기 이름표. */
  'control.df': { ko: '두 음의 진동수 차이', en: 'Difference between the two tones' },
  'caption.locked': {
    ko: '두 음이 한 치도 어긋나지 않는다 — 합친 소리가 줄곧 크다',
    en: 'The two never drift at all — the sum stays loud throughout',
  },
  'caption.inPhase': {
    ko: '두 음이 발맞춰 흔들린다 — 합친 소리가 가장 크다',
    en: 'The two swing in step — the sum is at its loudest',
  },
  'caption.opposed': {
    ko: '두 음이 정반대로 엇갈렸다 — 합친 소리가 사라진다',
    en: 'The two are exactly opposed — the sum vanishes',
  },
  'caption.drifting': {
    ko: '두 음이 어긋나는 중 — 합친 소리가 잦아든다',
    en: 'The two are drifting apart — the sum is dying away',
  },
  'caption.returning': {
    ko: '두 음이 다시 발맞추는 중 — 합친 소리가 되살아난다',
    en: 'The two are falling back in step — the sum is coming back',
  },
} satisfies Record<string, LocalizedText>);

export type BeatsMessageKey = keyof typeof beatsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: BeatsMessageKey): LocalizedText {
  return beatsMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BeatsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const beatsSchema: BundleSchema = {
  id: BEATS_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'linear',

  /**
   * 파라미터가 없다. 독자가 만지는 것은 조작기 하나(두 음의 진동수 차이)이고
   * 그것은 `controllers` 의 선언이다 — 파라미터로 두면 그림 옆에 상시 값 표시줄
   * (ParamPanel)이 서고, 그것은 조각이 두지 않기로 한 크롬이다 (S-piece).
   */
  parameters: [],

  /**
   * 화면에 적지 않는 수들. 기준 음 3 Hz 는 눈으로 흔들림을 셀 수 있게 실제 소리보다
   * 100 배쯤 늦춘 값이고, 늦춰도 어긋남과 울렁임의 관계는 그대로라 화면에 두지
   * 않았다 — 적으면 3 Hz 가 소리처럼 읽힌다 (원본 NOTES).
   */
  stages: [
    {
      id: 'tones',
      label: text('label.stage'),
      constants: { f1: 3, df0: 0.45, window: 4.5 },
    },
  ],

  environments: [],

  views: [{ id: 'waveform', label: text('label.view'), default: true }],

  autoViews: { energy: false },

  /** 원본 판과 같은 크기(860×400). 마운트 뒤에는 바뀌지 않는다 (원칙 6). */
  canvas: { height: 400, minHeight: 360 },

  /**
   * **겹침이 판정 장치다.** 기본 층 순서에서는 매질(`region` 45)이 궤적(20)과
   * 물체(40) 위로 올라와, 「두 음이 벌어진 자리」 띠가 두 음의 파형과 원을 덮는다.
   * 원본은 띠를 깔고 그 위에 파형을 긋는다 — 벌어진 자리는 두 곡선 **사이**에
   * 있는 것이지 곡선을 가리는 것이 아니다. 그래서 순서를 scene 이 쥔다 (S-render).
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 진행 중. 자세한 이유는 위 `PREROLL`. */
  preroll: PREROLL,

  /**
   * 캡션 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
   *
   * **시각이 아니라 상태로 고른다.** 이 조각에는 주기 안 단계가 없다 — 문장이
   * 갈리는 시점은 두 음의 위상차가 어디에 있느냐에 달려 있고, 독자가 진동수 차이를
   * 바꾸면 그 시점 자체가 옮겨 간다. 시간표로는 나눌 수 없다 (`CaptionSlotDef.cases`).
   *
   * 순서가 규칙이다 — 위에서부터 훑어 참인 첫 항목을 쓴다. 조건을 세는 것은
   * `physics.ts` 이고 여기서는 그 결과가 놓인 자리만 가리킨다 (원칙 2).
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    cases: [
      { when: 'phase.locked', text: key('caption.locked') },
      { when: 'phase.inPhase', text: key('caption.inPhase') },
      { when: 'phase.opposed', text: key('caption.opposed') },
      { when: 'phase.drifting', text: key('caption.drifting') },
      { when: 'phase.returning', text: key('caption.returning') },
    ],
    text: key('caption.returning'),
  },

  /**
   * 크롬은 켜지 않는다 (기본값). 그리드는 "여기서 거리를 재라" 는 지시인데 이
   * 그림에서 재야 할 것은 거리가 아니라 **마디 사이의 간격**이고, 그것은 이미
   * '울렁임 한 칸' 이 재어 보이고 있다.
   */

  messages: beatsMessages,
};
