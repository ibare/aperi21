// ========================================================================
// shock-wave — 선언
// ========================================================================
// 질문: 음원이 소리보다 빨라지면 파면은 어떻게 되는가?
//
// 음원이 소리와 같은 빠르기면 앞으로 나간 파면이 떨어져 나가지 못하고 음원
// 코끝에 겹겹이 쌓여 **벽**이 된다. 그보다 빨라지면 음원이 제가 방금 낸 파면을
// **앞질러** 나가고, 모든 파면이 음원 끝에서 뒤로 뻗은 **원뿔 하나**에 모인다.
// 멈춰 세우면 한 파면이 퍼진 거리 vt 와 그동안 음원이 간 거리 ut 가 직각삼각형을
// 이룬다 — 원뿔은 그 삼각형의 각 θ 로 벌어진다.
//
// 이웃 `doppler-effect` 는 음원이 소리보다 **느릴** 때 앞쪽 파면이 몰리는 그림이다.
// 이 조각은 그 아음속 화면을 되풀이하지 않고 u = v 에서 시작한다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:shock-wave` 와 문자 그대로 일치한다 (C4). */
export const SHOCK_WAVE_ID = 'shock-wave';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 소리의 빠르기(m/s). 소리와 같은 빠르기로 달리는 동안 칩 글자로 보인다. */
export const SOUND_SPEED = 340;
/** 음원이 소리를 넘어선 뒤의 빠르기(m/s). 칩 글자로 보인다. 원뿔의 벌어짐을 정한다. */
export const SOURCE_SPEED = 680;
/**
 * 화면 위 파면의 빠르기(월드/초). 실제 340 m/s 를 그대로 옮기면 눈이 따라가지
 * 못하므로 느리게 돌린다 — 음원의 화면 빠르기는 여기에 u/v 를 곱한 값이다.
 */
export const SCREEN_WAVE_SPEED = 2.5;
/** 화면 위 파면 방출 간격(초). 실제 음원의 진동 주기를 느리게 돌린 값이다. */
export const SCREEN_PERIOD = 0.25;
/** 주기가 시작할 때 음원의 자리(월드 x). 그 전에는 소리 빠르기로 줄곧 달려왔다. */
export const SOURCE_START_X = -14;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. y 는 위.
// ------------------------------------------------------------------------

/** 음원이 달리는 축의 높이(월드 y). */
export const AXIS_Y = 0.6;
/** 파면을 그리는 판(월드). 판 밖으로 넘친 원은 잘린다 (`clip`). 아래 띠는 캡션 자리다. */
export const PANEL_MIN: readonly [number, number] = [-15.5, -5];
export const PANEL_MAX: readonly [number, number] = [15.5, 6.6];

/** 파면이 이 반지름(월드)에 이르면 사라진다. */
export const FRONT_REACH = 16;
/** 사라지기 전 옅어지는 구간(월드). */
export const FRONT_FADE_TAIL = 3;
/** 원 하나를 긋는 표본 수. */
export const CIRCLE_SEGMENTS = 120;

/** 속도 화살표 — 음원 머리 위 높이 · 소리 빠르기일 때의 길이(월드). 길이는 u/v 에 비례한다. */
export const ARROW_RISE = 1.1;
export const ARROW_UNIT = 1.8;

/**
 * 멈춰 세운 장면에서 삼각형을 걸 파면의 나이(초). 이 나이에 가장 가까운 파면을 고른다 —
 * 원뿔 시대에 난 파면이면서 판 안에 접점이 드는 크기다.
 */
export const TRIANGLE_AGE = 2;
/** 직각 표시의 한 변(월드). */
export const RIGHT_MARK = 0.42;
/** θ 부채꼴 반지름(월드). */
export const THETA_RADIUS = 3.4;
/** θ 글자를 부채꼴 가운데 방향으로 띄우는 거리(월드). */
export const THETA_LABEL_R = 4.3;

/**
 * 프레이밍 — 판 전체와 그 아래 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -15.8, maxX: 15.8, minY: -7.4, maxY: 6.9 } as const;

// ------------------------------------------------------------------------
// 그리는 값 — 화면 px · 불투명도
// ------------------------------------------------------------------------

/** 파면 선 굵기(화면 px). 겹겹이 쌓여도 선으로 읽힐 만큼 얇다. */
export const FRONT_WIDTH_PX = 1.2;
/** 파면의 잉크 농도. */
export const FRONT_OPACITY = 0.62;
/** 멈춰 세운 장면에서 파면을 물리는 농도 배율 — 원뿔 선과 삼각형이 앞에 서게. */
export const FRONT_HOLD_DIM = 0.55;
/** 원뿔 선 · 삼각형 변 굵기(화면 px). */
export const CONE_WIDTH_PX = 1.8;
export const TRIANGLE_WIDTH_PX = 2;
/** 직각 표시 굵기(화면 px). */
export const MARK_WIDTH_PX = 1.2;
/** θ 부채꼴 채움 · 테 굵기. */
export const THETA_FILL_OPACITY = 0.18;
export const THETA_RIM_PX = 1.4;
/** 판 바탕 칠의 농도. 파면이 어디까지 그려지는지 가를 만큼만. */
export const PANEL_FILL_OPACITY = 0.05;
/** 이름표 · 기호 글자 크기(화면 px). */
export const LABEL_PX = 11;
export const SYMBOL_PX = 14;
/** 속도 칩을 화살표에서 띄우는 거리(화면 px). 위로. */
export const LABEL_GAP_PX = 17;
/** 캡션 글자 크기(화면 px) · 줄바꿈 폭(화면 px). */
export const CAPTION_PX = 14;
export const CAPTION_WRAP_PX = 820;

/**
 * 음원 외형 — 오른쪽으로 나는 뾰족한 몸체. `pos` 기준 월드 단위, y 는 위.
 * 코끝이 `pos` 에 온다 — 파면이 겹치는 자리 · 원뿔의 꼭짓점이 바로 그 점이다.
 */
export const SOURCE_PATH =
  'M 0 0 L -0.75 0.26 L -1.05 0.62 L -1.25 0.62 L -1.15 0.2 L -1.5 0.16 L -1.5 -0.16 ' +
  'L -1.15 -0.2 L -1.25 -0.62 L -1.05 -0.62 L -0.75 -0.26 Z';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const shockWaveMessages = Object.freeze({
  'label.title': { ko: '충격파', en: 'Shock wave' },
  'label.stage': { ko: '공기', en: 'Air' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 값이 끼어드는 칩 — 수식 표기지만 값 자리가 있어 문안 키로 둔다 (C1). */
  'label.speedSonic': { ko: 'u = v = {v} m/s', en: 'u = v = {v} m/s' },
  'label.speed': { ko: 'u = {u} m/s', en: 'u = {u} m/s' },
  /** 삼각형의 변 · 각 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.vt': { ko: 'vt', en: 'vt' },
  'label.ut': { ko: 'ut', en: 'ut' },
  'label.theta': { ko: 'θ', en: 'θ' },

  'caption.sonic': {
    ko: '음원이 소리와 같은 빠르기로 달린다 — 앞으로 나간 파면이 떨어져 나가지 못하고 코끝에 겹겹이 쌓여 벽이 된다.',
    en: 'The source runs exactly as fast as sound — the fronts it sends ahead cannot pull away, and they pile up at its nose into a wall.',
  },
  'caption.accel': {
    ko: '음원이 더 빨라진다 — 방금 낸 파면을 앞질러 벽을 뚫고 나간다.',
    en: 'The source speeds up — it overtakes the fronts it just sent out and breaks through the wall.',
  },
  'caption.cone': {
    ko: '이제 음원이 소리보다 빠르다 — 모든 파면이 음원 뒤로 처져, 음원 끝에서 뻗은 원뿔 하나에 모인다.',
    en: 'Now the source outruns sound — every front falls behind it, and they all gather on one cone that trails from its tip.',
  },
  'caption.hold': {
    ko: '멈춰 세우면 — 한 파면이 퍼진 거리 vt 가 원뿔에 직각으로 닿고, 그동안 음원은 ut 를 갔다. 원뿔은 이 삼각형의 각 θ 로 벌어진다.',
    en: 'Frozen — the distance vt one front has spread meets the cone at a right angle, while the source has gone ut. The cone opens at this triangle’s angle θ.',
  },
} satisfies Record<string, LocalizedText>);

export type ShockWaveMessageKey = keyof typeof shockWaveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ShockWaveMessageKey): LocalizedText => shockWaveMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ShockWaveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const shockWaveSchema: BundleSchema = {
  id: SHOCK_WAVE_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 파라미터 · 조작기를 두지 않는다. 주장은 「넘으면 원뿔」 하나이고, 자동 진행이
  // u = v 와 u > v 를 한 주기 안에 모두 세운다.
  parameters: [],

  stages: [
    {
      id: 'air',
      label: text('label.stage'),
      constants: {
        soundSpeed: SOUND_SPEED,
        sourceSpeed: SOURCE_SPEED,
        screenWaveSpeed: SCREEN_WAVE_SPEED,
        screenPeriod: SCREEN_PERIOD,
        sourceStartX: SOURCE_START_X,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 음원이 왼쪽에서 오른쪽으로 가로지른다. */
  canvas: { height: 420, minHeight: 380 },

  /** 도착한 순간 이미 음원이 소리 빠르기로 달리며 코끝에 벽이 서 있다 (S-piece). */
  startAt: 1,

  /**
   * 한 주기 10.2 초.
   *
   * - `appear` — 옅게 나타난다. 음원은 이미 소리 빠르기로 달리고 있다.
   * - `sonic` — u = v. 파면이 코끝에 겹겹이 쌓여 벽이 된다.
   * - `accel` — u 가 v 에서 선언값까지 고르게 오른다. 음원이 벽을 뚫고 나간다.
   * - `cone` — u 가 선언값. 새 파면이 모두 음원 뒤로 처져 원뿔에 모인다.
   * - `hold` — 멈춰 세운 장면에서 원뿔 선과 삼각형(vt · ut · θ)을 건다.
   * - `fade` — 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.sonic') },
      { id: 'sonic', duration: 2.4, caption: key('caption.sonic') },
      { id: 'accel', duration: 1.2, caption: key('caption.accel') },
      { id: 'cone', duration: 2.8, caption: key('caption.cone') },
      { id: 'hold', duration: 2.8, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: CAPTION_PX,
    wrapWidth: CAPTION_WRAP_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 견주는 것은 파면과 원뿔의 모양이고,
  // 바깥 거리 눈금은 오독의 경로가 된다.

  messages: shockWaveMessages,
};
