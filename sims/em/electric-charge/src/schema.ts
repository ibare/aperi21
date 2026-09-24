// ========================================================================
// electric-charge — 선언
// ========================================================================
// 질문: 전하에 「두 종류」 가 있다는 것은 무엇으로 알 수 있는가?
//
// 답: 서로에게 하는 일이 둘로 갈린다. **같은 종류끼리는 밀고, 다른 종류끼리는
// 당긴다.** 크기가 같은 전하를 띤 공 세 쌍을 같은 실에 매달아 놓으면, 부호만
// 다른데 + · + 와 − · − 는 벌어지고 + · − 만 모여 붙는다.
//
// 이 조각은 방향에만 머문다. 힘이 거리에 따라 얼마나 세지는지(coulombs-law),
// 전기력선(field-lines), 전하를 띠게 하는 과정(charging-methods)은 하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electric-charge` 와 문자 그대로 일치한다 (C4). */
export const ELECTRIC_CHARGE_ID = 'electric-charge';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 쿨롱 상수(N·m²/C²). */
export const COULOMB_K = 8.99e9;
/** 공 하나의 전하 크기(μC). 세 쌍 모두 같은 크기다 — 다른 것은 부호뿐이다. */
export const CHARGE_MICRO_C = 0.3;
/** 공 하나의 질량(kg). 스티로폼 공 정도. */
export const BALL_MASS = 0.002;
/** 공의 반지름(m). 다른 종류 쌍이 붙는 거리(2r)를 정한다. */
export const BALL_RADIUS = 0.05;
/** 실 길이(m). */
export const STRING_LENGTH = 0.5;
/** 한 쌍의 두 실이 걸린 자리 사이 거리(m). 전하가 없으면 공도 이만큼 떨어져 드리운다. */
export const PIVOT_GAP = 0.3;
/** 중력 가속도(m/s²). */
export const G = 9.8;
/**
 * 흔들림의 감쇠비(무차원). 공기가 가벼운 공을 붙잡아 몇 번 흔들리지 않고 자리를
 * 잡는다. 1 이면 넘치지 않고 곧장 선다.
 */
export const DAMPING_RATIO = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. y = 0 이 실을 거는 천장.
// ------------------------------------------------------------------------

/** 세 쌍의 가운데 x. 왼쪽부터 + · +, − · −, + · −. */
export const PAIR_X = [-1.05, 0, 1.05] as const;
/** 천장 막대의 좌우 끝. */
export const CEILING_HALF_W = 1.5;

/**
 * 프레이밍 — 천장부터 공 아래 이름표까지. 캡션 줄은 아래 여백이 받는다.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.55, maxX: 1.55, minY: -0.8, maxY: 0.06 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electricChargeMessages = Object.freeze({
  'label.title': { ko: '전하', en: 'Electric charge' },
  'label.stage': { ko: '실에 매단 공', en: 'Hanging balls' },
  'label.view': { ko: '세 쌍', en: 'Three pairs' },

  /** 전하 부호 표식. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'mark.plus': { ko: '+', en: '+' },
  'mark.minus': { ko: '−', en: '−' },
  /** 쌍 아래 이름. 쌍을 가르는 것은 색이 아니라 이 이름과 부호 표식이다. */
  'label.like': { ko: '같은 종류', en: 'Like charges' },
  'label.unlike': { ko: '다른 종류', en: 'Unlike charges' },

  'caption.appear': {
    ko: '세 쌍 모두 크기가 같은 전하를 띤 공이다. 다른 것은 부호뿐이다.',
    en: 'All three pairs carry charges of the same size. Only the signs differ.',
  },
  'caption.release': {
    ko: '+ 와 +, − 와 − 는 서로 밀어 벌어지고, + 와 − 는 서로 당겨 붙는다.',
    en: '+ and +, and − and −, push each other apart, while + and − pull together.',
  },
  'caption.hold': {
    ko: '같은 종류는 벌어진 채로, 다른 종류는 붙은 채로 머문다. 점선은 전하가 없을 때 실이 드리우는 자리다.',
    en: 'Like charges stay apart, unlike charges stay together. The dashed lines show where the strings would hang without charge.',
  },
} satisfies Record<string, LocalizedText>);

export type ElectricChargeMessageKey = keyof typeof electricChargeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectricChargeMessageKey): LocalizedText => electricChargeMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectricChargeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electricChargeSchema: BundleSchema = {
  id: ELECTRIC_CHARGE_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'hanging-balls',
      label: text('label.stage'),
      constants: {
        k: COULOMB_K,
        chargeMicroC: CHARGE_MICRO_C,
        ballMass: BALL_MASS,
        ballRadius: BALL_RADIUS,
        stringLength: STRING_LENGTH,
        pivotGap: PIVOT_GAP,
        g: G,
        dampingRatio: DAMPING_RATIO,
      },
    },
  ],
  environments: [],
  views: [{ id: 'pairs', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 쌍이 나란하다. 세로는 실 길이와 이름표 · 캡션만큼이면 된다. */
  canvas: { height: 300, minHeight: 270 },

  /** 도착한 순간 이미 공들이 움직이기 시작했다 (S-piece). */
  startAt: 0.7,

  /**
   * 한 주기.
   *
   * - `appear` — 전하를 띤 공이 곧게 드리운 채 나타난다. 놓기 직전이다.
   * - `release` — 놓는다. `duration` 은 물리 시간(초)이고, 다른 종류 쌍은 0.2 초 만에
   *   붙어 버려 눈으로 따라갈 수 없으므로 `timeScale` 로 늦춰 보인다. 공의 움직임은
   *   이 단계에 흐른 물리 시간의 함수다.
   * - `hold` — 자리 잡은 모습을 그대로 둔다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.6, caption: key('caption.appear') },
      { id: 'release', duration: 1.3, timeScale: 0.4, caption: key('caption.release') },
      { id: 'hold', duration: 3.4, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 묻는 것은 거리가 아니라
  // 방향(벌어지는가 모이는가)이다 — 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: electricChargeMessages,
};
