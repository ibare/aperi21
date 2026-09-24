// ========================================================================
// work-energy-theorem — 선언
// ========================================================================
// 질문: 붙는 속력을 정하는 것은 힘인가, 거리인가.
//
// 둘 다 아니고 그 곱(한 일)이다. 같은 수레 둘을 마찰 없는 바닥에서 민다. 위 수레는
// 2F 로 d 만큼, 아래 수레는 F 로 2d 만큼. 미는 힘이 곧 알짜힘이다. 위는 빨리 끝나고
// 아래는 오래 밀리지만, 밀기가 끝났을 때 두 수레의 속력은 같다 — 한 일이 같기 때문이다.
//
// 한 일은 바닥 아래의 칸으로 보인다. 칸의 높이가 힘, 길이가 민 거리라 넓이가 일이고,
// 수레가 밀린 만큼 칠해진다. 두 칸은 모양이 달라도 넓이가 같다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:work-energy-theorem` 와 문자 그대로 일치한다 (C4). */
export const WORK_ENERGY_THEOREM_ID = 'work-energy-theorem';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 수레 질량(kg). 둘이 같다. */
export const MASS = 1;
/** 위 수레를 미는 힘(N) · 민 거리(m). 힘이 두 배, 거리가 절반. */
export const FORCE_BIG = 2;
export const DIST_SHORT = 1;
/** 아래 수레를 미는 힘(N) · 민 거리(m). 곱(한 일)은 위와 같다. */
export const FORCE_SMALL = 1;
export const DIST_LONG = 2;

/** 밀기가 끝나기까지의 시간(초) — 정지에서 등가속, √(2md/F). */
export const PUSH_TIME_SHORT = Math.sqrt((2 * MASS * DIST_SHORT) / FORCE_BIG);
export const PUSH_TIME_LONG = Math.sqrt((2 * MASS * DIST_LONG) / FORCE_SMALL);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 위 레인 · 아래 레인의 바닥 높이. */
export const LANE_TOP_Y = 1.45;
export const LANE_BOTTOM_Y = 0;

/** 수레 크기 [가로, 세로](m). 둘이 같다 — 질량이 같다는 것이 주장의 전제다. */
export const CART_SIZE: readonly [number, number] = [0.44, 0.3];

/**
 * 한 일 칸의 높이 배율(m per N). 칸은 바닥선 **아래**로 드리운다 — 높이가 힘, 길이가
 * 민 거리라 넓이가 일이다. 위 칸은 0.4 × 1, 아래 칸은 0.2 × 2 로 넓이가 같다.
 */
export const WORK_HEIGHT_PER_N = 0.2;
/** 칸 이름표를 칸 오른쪽 끝에서 띄우는 거리(m). */
export const WORK_LABEL_GAP = 0.1;

/** 속도 화살표가 놓이는 높이(바닥선 기준 m)와 속력 → 길이 배율(m per m/s). */
export const SPEED_ARROW_Y = 0.46;
export const SPEED_ARROW_SCALE = 0.3;
/** 미는 힘 화살표의 높이(바닥선 기준 m)와 힘 → 길이 배율(m per N). */
export const FORCE_ARROW_Y = 0.15;
export const FORCE_ARROW_SCALE = 0.3;

/** 눈금선의 위 · 아래 끝(월드 y)과 이름표 높이. 두 레인을 세로로 꿰어 d · 2d 를 맞댄다. */
export const TICK_TOP_Y = LANE_TOP_Y;
export const TICK_BOTTOM_Y = -0.28;
export const TICK_LABEL_Y = -0.4;

/**
 * 프레이밍은 주장의 일부다. 가로는 수레 뒤의 미는 화살표(−0.82)부터 한 주기 끝에
 * 위 수레가 닿는 자리와 그 속도 화살표까지, 세로는 눈금 이름표 아래부터 위 레인
 * 화살표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.15, maxX: 6.2, minY: -0.62, maxY: 2.12 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값을 물리에서 끌어온다
// ------------------------------------------------------------------------

/** 정지한 두 수레를 보이는 동안(초). 한 주기가 돌아올 때 빈 칸에서 다시 시작한다. */
export const READY = 0.6;
/** 둘 다 밀리는 동안 — 위 수레의 밀기가 끝나는 순간(√(2md/2F)) 끝난다. */
export const PUSH_BOTH = PUSH_TIME_SHORT;
/** 아래 수레만 밀리는 동안. */
export const PUSH_LONG_ONLY = PUSH_TIME_LONG - PUSH_TIME_SHORT;
/** 밀기가 끝난 두 수레가 같은 속력으로 달리는 동안 · 흐려지는 동안(물리 시간). */
export const COAST = 0.9;
export const FADE = 0.3;
/** 밀리는 동안의 재생 속도. 실시간 2 초는 속력이 붙는 것을 견주기에 짧다. */
export const PUSH_MOTION = 0.5;
/** 달리는 동안의 재생 속도. 같은 속력이라는 결론을 읽을 시간을 준다. */
export const COAST_MOTION = 0.3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const workEnergyTheoremMessages = Object.freeze({
  'label.title': { ko: '일-운동 에너지 정리', en: 'Work-energy theorem' },
  'label.operation': {
    ko: '알짜일이 운동 에너지 변화와 같음',
    en: 'Net work equals the change in kinetic energy',
  },
  'label.stage': { ko: '마찰 없는 바닥', en: 'Frictionless floor' },
  'label.view': { ko: '두 레인', en: 'Two lanes' },
  /** 화살표에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.forceBig': { ko: '2F', en: '2F' },
  'label.forceSmall': { ko: 'F', en: 'F' },
  'label.speed': { ko: 'v', en: 'v' },
  /** 한 일 칸의 이름표 — 높이 × 길이. 수식 표기다. */
  'label.workShort': { ko: '2F × d', en: '2F × d' },
  'label.workLong': { ko: 'F × 2d', en: 'F × 2d' },
  /** 눈금 이름표. d 는 위 수레가 밀린 거리다. 표식이다. */
  'label.tick1': { ko: 'd', en: 'd' },
  'label.tick2': { ko: '2d', en: '2d' },
  'caption.push': {
    ko: '같은 수레 둘을 민다 — 위는 2F 로 d 까지, 아래는 F 로 2d 까지',
    en: 'Two identical carts are pushed — the upper one with 2F up to d, the lower one with F up to 2d',
  },
  'caption.split': {
    ko: '위 수레는 밀기가 끝났다 — 아래 수레는 아직 밀리며 속력이 붙는 중이다',
    en: 'The upper cart is no longer pushed — the lower one is still being pushed and still gaining speed',
  },
  'caption.result': {
    ko: '힘과 거리는 달랐지만 한 일이 같다 — 두 수레에 같은 속력이 붙어 간격을 그대로 두고 달린다',
    en: 'Different force, different distance, the same work — both carts gained the same speed and keep their gap',
  },
} satisfies Record<string, LocalizedText>);

export type WorkEnergyTheoremMessageKey = keyof typeof workEnergyTheoremMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WorkEnergyTheoremMessageKey): LocalizedText => workEnergyTheoremMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WorkEnergyTheoremMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const workEnergyTheoremSchema: BundleSchema = {
  id: WORK_ENERGY_THEOREM_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 밀리고, 같은 속력으로 달리고, 다시 선다.
  parameters: [],

  stages: [
    {
      id: 'frictionless',
      label: text('label.stage'),
      constants: {
        mass: MASS,
        forceBig: FORCE_BIG,
        distShort: DIST_SHORT,
        forceSmall: FORCE_SMALL,
        distLong: DIST_LONG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 7.4 m 를 담아야 하고 세로는 두 레인과 눈금 이름표 · 캡션 줄뿐이다. 세로를
   * 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 344 },

  /**
   * 겹침이 판정 장치다. 칠해지는 일 칸은 테두리 **안**에 깔려야 「아직 남은 몫」 이
   * 읽히고, 눈금선은 수레 뒤로 지나가야 한다. 층 순서로는 `region` 이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 정지 → 둘 다 밀림 → 아래만 밀림 → 같은 속력으로 달림 → 흐려짐.
   *
   * `push-both` · `push-long` 의 기본 길이를 물리에서 끌어온다. 위 수레의 밀기가
   * 끝나는 순간(√(2md/2F))이 곧 `push-both` 의 끝이라, 「위 수레는 밀기가 끝났다」 는
   * 캡션이 화면과 어긋날 수 없다. 물리는 이 경계를 쓰지 않는다 — 밀기가 끝나는 것은
   * 수레가 제 거리를 다 갔을 때다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: READY, caption: key('caption.push') },
      {
        id: 'push-both',
        duration: PUSH_BOTH,
        timeScale: PUSH_MOTION,
        caption: key('caption.push'),
      },
      {
        id: 'push-long',
        duration: PUSH_LONG_ONLY,
        timeScale: PUSH_MOTION,
        caption: key('caption.split'),
      },
      {
        id: 'coast',
        duration: COAST,
        timeScale: COAST_MOTION,
        caption: key('caption.result'),
      },
      {
        id: 'fade',
        duration: FADE,
        timeScale: COAST_MOTION,
        caption: key('caption.result'),
      },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 수레가 막 밀려 나가는 자리에서 연다.
   * 0 이면 정지한 수레와 빈 칸이 먼저 보인다.
   */
  startAt: READY + 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정리와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **d 와 2d** 라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: workEnergyTheoremMessages,
};
