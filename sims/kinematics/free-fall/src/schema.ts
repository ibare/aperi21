// ========================================================================
// free-fall — 선언
// ========================================================================
// 질문: 무거운 공과 가벼운 공을 같은 높이에서 동시에 놓으면 어느 쪽이 먼저
// 바닥에 닿을까.
//
// 답의 동사는 "나란히 떨어진다" 다. 같음은 두 숫자를 대조해야 알지만 나란함은
// 한눈에 보인다 — 그래서 두 공에 막대를 걸쳐 놓고, 지나온 높이를 사다리로 남긴다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:free-fall` 와 문자 그대로 일치한다 (C4). */
export const FREE_FALL_ID = 'free-fall';

// ------------------------------------------------------------------------
// 원본의 px 기하 → 월드(m)
// ------------------------------------------------------------------------
//
// 원본(`tasks/piece-lab/free-fall/index.html`)은 캔버스 px 로 그리고 `PPM` 으로만
// 물리와 이었다. 여기서는 반대로 **월드가 먼저**이고 배율은 카메라가 정한다.
// 아래 수는 전부 원본의 px 상수를 `PX_PER_M` 으로 나눈 것이다 — 기억으로 옮기지
// 않기 위해 나눗셈을 지우지 않고 남겨 둔다.

/** 원본: `PPM = (Y_LAND - Y_TOP) / DROP_M = (269 - 48) / 5`. */
const PX_PER_M = (269 - 48) / 5;

/** 떨어뜨리는 높이(m). 낙하 시간이 약 1 초가 되도록 역산한 값이다. */
export const DROP_M = 5;
/** 공 반지름(m). 원본 `R = 13` px. 두 공이 **같은 크기**인 것이 이 조각의 결정이다. */
export const BALL_R = 13 / PX_PER_M;
/** 공 중심이 멈추는 높이(m) — 공이 땅에 닿은 자리. 원본 `Y_LAND = Y_GROUND - R`. */
export const Y_LAND = BALL_R;
/** 공 중심의 출발 높이(m). 원본 `Y_TOP`. */
export const Y_TOP = Y_LAND + DROP_M;

/**
 * 공 중심의 가로 자리(m). 무거운 공이 `-BALL_X`, 가벼운 공이 `+BALL_X`.
 *
 * 원본은 `xH = W * 0.34` · `xL = W * 0.66` 으로 **화면 폭의 비율**이었다. 월드에는
 * 화면 폭이 없으므로 원본 무대의 최대 폭(`#stage { max-width: 860px }`)에서 굳혔다 —
 * `0.16 * 860 = 137.6` px.
 */
export const BALL_X = (0.16 * 860) / PX_PER_M;

/** 땅 아래 옅은 띠의 두께(m). 원본 `fillRect(0, Y_GROUND, W, 10)`. */
export const GROUND_BAND = 10 / PX_PER_M;

/**
 * 프레이밍. **고정값이다** — 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (S-piece).
 *
 * 세로는 원본 캔버스를 그대로 옮겼다: 땅 위로 `282` px, 땅 아래로 `340 - 282 = 58` px.
 * 아래쪽 58 px 은 띠(10 px)와 캡션 자리다 — 원본은 처음에 캔버스 끝까지 땅을 칠했다가
 * 캡션이 땅속에 묻혀 고쳤다. 그 자리를 여기서도 비워 둔다.
 *
 * 가로는 원본 캔버스 폭(±430 px)을 쓰지 않는다. 그러면 좁은 임베드에서 가로가 배율을
 * 잡아 낙하가 통째로 작아진다. 두 공과 그 바깥의 kg 딱지가 들어갈 만큼만 잡는다.
 */
export const SCENE_BOUNDS = {
  minX: -4.6,
  maxX: 4.6,
  minY: -58 / PX_PER_M,
  maxY: 282 / PX_PER_M,
} as const;

// ------------------------------------------------------------------------
// 시간표 상수 — 선언과 물리가 같은 수를 본다
// ------------------------------------------------------------------------
//
// `step` 은 `timeline` 을 받지 않는다(`Bundle.step` 의 인자에 없다). 그래서 누적
// 적분을 하는 조각은 주기 안 시각을 상태에 따로 쌓아야 하고, 그 시계가 시간표와
// 어긋나지 않게 **같은 상수**를 본다. `inertial-frame` 이 같은 모양이다.

/** 한 번 떨어뜨리고 다시 드는 데 걸리는 시간(초). */
export const CYCLE = 4.3;
/** 놓기 전 들고 있는 시간(초). */
export const HOLD = 0.35;
/** 착지한 화면을 보여 주는 끝 시각(초). 이 뒤로 걷힌다. */
export const SETTLE = 3.55;
/** 다시 들 때 무대가 나타나는 시간(초). 원본 `tau < 0.12`. */
export const APPEAR = 0.12;
/** 잔상을 남기는 간격(초). */
export const STROBE = 0.09;

/** 무거운 공이 차례로 갖는 질량(kg). */
export const MASSES = [2, 10, 50] as const;
/** 가벼운 공의 질량(kg). */
export const M_LIGHT = 1;
/** 조작기의 "차례로 바꾸기" — 어느 수도 고르지 않은 상태. */
export const AUTO = 'auto';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const freeFallMessages = Object.freeze({
  'label.title': { ko: '자유 낙하', en: 'Free fall' },
  'label.operation': {
    ko: '무게가 달라도 두 공은 나란히 내려가 함께 닿는다',
    en: 'However different their weights, the two balls fall together and land together',
  },
  'label.stage': { ko: '낙하', en: 'The drop' },
  'label.view': { ko: '나란한 낙하', en: 'Side by side' },

  /** 공 옆에 붙어 함께 내려가는 무게. 수와 단위는 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.mass': { ko: '{m} kg', en: '{m} kg' },

  'caption.hold': {
    ko: '무게가 다른 두 공을 같은 높이에서 든다',
    en: 'Two balls of different weight, held at the same height',
  },
  'caption.parallel': {
    ko: '두 공이 같은 높이를 나란히 지나간다',
    en: 'The two balls pass the same height side by side',
  },
  /**
   * 착지 문안 셋. 원본은 `mH + '배 무거운 공도…'` 한 줄이었다 — 캡션 슬롯에는
   * `vars` 가 없어 후보 수만큼 키로 쪼갰다 (NOTES 「어휘 부족」).
   */
  'caption.landed2': {
    ko: '2배 무거운 공도 바닥에 같이 닿았다',
    en: 'The ball 2× heavier reached the ground at the same moment',
  },
  'caption.landed10': {
    ko: '10배 무거운 공도 바닥에 같이 닿았다',
    en: 'The ball 10× heavier reached the ground at the same moment',
  },
  'caption.landed50': {
    ko: '50배 무거운 공도 바닥에 같이 닿았다',
    en: 'The ball 50× heavier reached the ground at the same moment',
  },

  'control.mass': { ko: '무거운 공의 무게', en: 'Weight of the heavy ball' },
  'option.auto': { ko: '차례로 바꾸기', en: 'Cycle through' },
  /** 칩의 문안. 값이 끼어들지 않는 표식이라 후보마다 하나씩 둔다. */
  'option.mass2': { ko: '2 kg', en: '2 kg' },
  'option.mass10': { ko: '10 kg', en: '10 kg' },
  'option.mass50': { ko: '50 kg', en: '50 kg' },
} satisfies Record<string, LocalizedText>);

export type FreeFallMessageKey = keyof typeof freeFallMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: FreeFallMessageKey): LocalizedText {
  return freeFallMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FreeFallMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const freeFallSchema: BundleSchema = {
  id: FREE_FALL_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  /**
   * 파라미터 상자를 쓰지 않는다. 무거운 공의 무게는 **후보 넷 중 하나를 고르는 것**이지
   * 연속으로 미는 값이 아니다 — 슬라이더로 두면 "2.7 kg" 같은 자리가 생기고, 그 순간
   * 독자가 고르는 것이 극단값이 아니라 눈금이 된다 (`controllers.ts`).
   */
  parameters: [],

  stages: [{ id: 'drop', label: text('label.stage'), constants: { g: 9.8 } }],
  environments: [],
  views: [{ id: 'fall', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스는 340 px 이고 버튼 줄은 그 **아래** DOM 에 있었다. 엔진의 조작기는
   * 캔버스 위에 얹히므로 그만큼을 높이로 돌려준다 — 340 + 칩 한 줄.
   */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 그리는 순서를 scene 에 쓴 순서로 둔다. 원본의 겹침이 판정 장치다 — 잔상 원은
   * 가로대 **위**에 있어야 칸이 "두 공이 있던 자리" 로 읽히고, 두 공은 잣대 **위**에
   * 있어야 막대가 공에 걸쳐진 것으로 읽힌다. 층 기본값(`trace` 19 < `trajectory` 20)은
   * 그 둘을 뒤집는다.
   */
  drawOrder: 'scene',

  /**
   * 시간표 — 한 주기 4.3 초.
   *
   * `appear` + `hold` 가 원본의 `HOLD = 0.35`, `show` 가 놓고 나서 감상까지
   * (`SETTLE - HOLD`), `fade` 가 걷히는 구간(`CYCLE - SETTLE`)이다.
   *
   * **착지는 단계가 아니다.** 언제 닿는지는 적분이 정하는 것이지 연출이 정하는 것이
   * 아니라서 시간표에 경계를 두지 않았다 — 캡션은 상태(`cases`)가 고른다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.hold') },
      { id: 'hold', duration: HOLD - APPEAR, caption: key('caption.hold') },
      { id: 'show', duration: SETTLE - HOLD, caption: key('caption.parallel') },
      // 걷히는 동안에도 하던 말을 이어 한다 — 같은 키라 다시 페이드하지 않는다.
      { id: 'fade', duration: CYCLE - SETTLE, caption: key('caption.parallel') },
    ],
  },

  /**
   * 슬롯 하나. 드는 중 · 나란히 지나가는 중은 단계가 말하고, **같이 닿음**은 상태가
   * 말한다 — 닿은 시점은 시각이 아니라 적분이 정하기 때문이다.
   *
   * 위에서부터 훑어 참인 첫 항목이 이긴다. 조건을 세는 것은 `physics.ts` 이고 여기는
   * 그 결과가 놓인 자리만 가리킨다 (원칙 2).
   */
  caption: {
    anchor: { screen: 'bottom-center' },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'landedAs2', text: key('caption.landed2') },
      { when: 'landedAs10', text: key('caption.landed10') },
      { when: 'landedAs50', text: key('caption.landed50') },
    ],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 여기서 높이를 읽을 일이 없다 — 눈금 구실은
   * 사다리 칸이 겸하고, 잴 것은 거리가 아니라 **두 공이 같은 높이에 있는가**다.
   *
   * `startAt` 도 두지 않는다. 원본은 주기 첫머리에서 두 공이 **이미 들려 있는** 채로
   * 열고 0.35 초 뒤에 놓는다 — 빈 화면이 채워지기를 기다리는 구간이 없으므로 시계를
   * 앞당길 이유가 없다 (S-piece).
   */

  messages: freeFallMessages,
};
