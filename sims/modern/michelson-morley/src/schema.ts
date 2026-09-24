// ========================================================================
// michelson-morley — 선언
// ========================================================================
// 질문: 지구가 에테르 속을 30 km/s 로 달린다면, 빛을 두 팔로 나눠 보냈다가 합친
// 간섭계를 돌릴 때 무엇이 보여야 했고, 실제로는 무엇이 보였나.
//
// 답: 에테르 바람이 있다면 바람을 따라 놓인 팔과 가로지른 팔의 왕복 시간이 달라서,
// 간섭계를 90° 돌리면 두 팔의 역할이 바뀌며 무늬가 약 0.4 무늬 밀려야 한다.
// 실제 무늬는 제자리였다.
//
// 화면에서는 한 간섭계가 돌고, 옆의 망원경 속 무늬 띠 두 줄 중 **예측 띠만 밀리고
// 관측 띠는 기준선에 붙어 있다.** 같은 회전에 두 띠가 다르게 반응하는 것이 주장이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:michelson-morley` 와 문자 그대로 일치한다 (C4). */
export const MICHELSON_MORLEY_ID = 'michelson-morley';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 팔 길이(m). 1887 년 장치는 거울을 여러 번 되튕겨 유효 길이 11 m 를 얻었다. */
export const ARM_LENGTH_M = 11;
/** 빛의 파장(nm). */
export const WAVELENGTH_NM = 500;
/** 가정한 에테르 바람의 속력(km/s) — 지구의 공전 속력. */
export const ETHER_SPEED_KMS = 30;
/** 빛의 속력(km/s). */
export const LIGHT_SPEED_KMS = 299792.458;
/**
 * 화면에 띄우는 예측 무늬 이동의 정박값(무늬 수). 위 네 값에서 나오는 2L(v/c)²/λ 는
 * 0.44 이고, 띠가 밀리는 거리는 그 계산값을 쓴다. 글자는 이 선언값을 그대로 쓴다 —
 * 계산값을 반올림해 띄우지 않는다 (S-piece 유효숫자).
 */
export const PREDICTED_SHIFT_LABEL = 0.4;
/** 간섭계를 돌리는 각(도). */
export const TURN_DEGREES = 90;
/** 에테르 바람 줄무늬를 흩뿌리는 시드. */
export const WIND_SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽은 위에서 본 간섭계, 오른쪽은 망원경 속 무늬 띠 둘.
// ------------------------------------------------------------------------

/** 간섭계(돌판) 중심 — 반거울 자리. 회전의 중심이다. */
export const RIG_CENTER = [-3.1, 0.05] as const;
/** 돌판 반변. 45° 에서 꼭짓점이 바람 이름표 · 캡션 줄에 닿지 않는 크기다. */
export const SLAB_HALF = 1.3;
/** 반거울에서 거울 · 광원 · 망원경까지의 거리(그림의 팔 길이). 실제 길이는 이름표가 말한다. */
export const ARM = 1.05;

/** 에테르 바람이 부는 영역 — 간섭계를 감싸고 넉넉히. */
export const WIND_MIN = [-5.55, -1.95] as const;
export const WIND_MAX = [-0.65, 2.05] as const;

/** 무늬 띠 — 가로 범위와 한 무늬의 폭(월드). 가운데 밝은 무늬가 기준선에 놓인다. */
export const STRIP_X0 = 0.75;
export const STRIP_X1 = 5.05;
export const FRINGE_PERIOD = 1;
/** 위 띠(예측) · 아래 띠(관측)의 세로 범위. */
export const PREDICT_Y0 = 0.55;
export const PREDICT_Y1 = 1.15;
export const OBSERVE_Y0 = -1.25;
export const OBSERVE_Y1 = -0.65;

/** 프레이밍은 주장의 일부다. 매 프레임 같은 값이다 (원칙 6). */
export const SCENE_BOUNDS = { minX: -5.7, maxX: 5.3, minY: -2.55, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 — 기본값. 물리는 이 상수를 보지 않고 시간표에게 묻는다.
// ------------------------------------------------------------------------

/** 처음 방향에서 두 띠를 보여 주는 동안. */
export const REST = 2;
/**
 * 90° 돌리는 동안은 두 단계다 — 앞머리 `turnIn`(처음 방향 점선이 나타나고 팔 길이 치수선이
 * 걷히는 동안)과 나머지 `turn`. 회전 자체는 두 단계를 이어 한 번의 `smooth` 로 돈다(합 4 초).
 */
export const TURN_IN = 1;
export const TURN = 3;
/** 다 돌린 뒤 두 띠를 견주는 동안. */
export const COMPARE = 3.6;
/** 처음 방향으로 되돌리는 동안. 끝나면 첫 화면과 같아 주기가 이어진다. */
export const RETURN = 3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const michelsonMorleyMessages = Object.freeze({
  'label.title': { ko: '마이컬슨-몰리 실험', en: 'Michelson–Morley experiment' },
  'label.operation': { ko: '에테르가 없다는 증거', en: 'Evidence that there is no ether' },
  'label.stage': { ko: '1887 년 간섭계', en: 'The 1887 interferometer' },
  'label.view': { ko: '돌리는 간섭계', en: 'Rotating interferometer' },

  /** 거울 기호. 표식이다 (C1 판정 3). */
  'label.mirror1': { ko: 'M₁', en: 'M₁' },
  'label.mirror2': { ko: 'M₂', en: 'M₂' },
  /** 팔 길이 — 값이 끼는 조립이지만 기호 · 단위뿐이다. */
  'label.arm': { ko: 'L = {l} m', en: 'L = {l} m' },
  /** 가정한 바람. 값이 끼는 조립문이라 문안이다. */
  'label.wind': { ko: '에테르 바람이 있다면 · {v} km/s', en: 'Ether wind, if any · {v} km/s' },
  /** 돌린 각. */
  'label.turned': { ko: '{deg}°', en: '{deg}°' },
  /** 두 띠의 이름 — 가르는 것은 색이 아니라 이 이름이다. */
  'label.predicted': { ko: '에테르가 있다면 (예측)', en: 'If there were an ether (predicted)' },
  'label.observed': { ko: '실제로 본 무늬 (1887)', en: 'What was actually seen (1887)' },
  /** 예측 이동량. `{n}` 은 선언된 정박값이다. */
  'label.shift': { ko: '≈ {n} 무늬', en: '≈ {n} fringe' },
  'label.still': { ko: '제자리', en: 'No shift' },

  'caption.rest': {
    ko: 'M₁ 팔은 에테르 바람을 따라, M₂ 팔은 가로질러 놓였다 — 두 띠의 밝은 무늬가 기준선에 있다',
    en: 'The M₁ arm lies along the ether wind, the M₂ arm across it — both bright fringes sit on the reference line',
  },
  'caption.turn': {
    ko: '간섭계를 돌린다 — 두 팔의 역할이 바뀌면 예측 무늬는 밀려야 한다',
    en: 'The interferometer turns — as the arms swap roles, the predicted fringes should slide',
  },
  'caption.compare': {
    ko: '다 돌렸다 — 예측 무늬는 기준선에서 밀려났지만, 실제 무늬는 움직이지 않았다',
    en: 'Fully turned — the predicted fringes slid off the reference line, but the real ones never moved',
  },
  'caption.return': {
    ko: '되돌려도 마찬가지다 — 어느 방향으로 놓아도 실제 무늬는 제자리다',
    en: 'Turning it back changes nothing — in every orientation the real fringes stay put',
  },
} satisfies Record<string, LocalizedText>);

export type MichelsonMorleyMessageKey = keyof typeof michelsonMorleyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MichelsonMorleyMessageKey): LocalizedText => michelsonMorleyMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MichelsonMorleyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const michelsonMorleySchema: BundleSchema = {
  id: MICHELSON_MORLEY_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 돌리는 일은 자동 진행이 한다. 독자가 각을 고르게 해도 주장은
  // 「어느 각에서나 관측 띠는 제자리」 로 같고, 그건 되돌리는 단계가 이미 보인다.
  parameters: [],

  stages: [
    {
      id: 'interferometer-1887',
      label: text('label.stage'),
      constants: {
        armLengthM: ARM_LENGTH_M,
        wavelengthNm: WAVELENGTH_NM,
        etherSpeedKms: ETHER_SPEED_KMS,
        lightSpeedKms: LIGHT_SPEED_KMS,
        predictedShiftLabel: PREDICTED_SHIFT_LABEL,
        turnDegrees: TURN_DEGREES,
        seed: WIND_SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rotating', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 간섭계, 오른쪽 띠 둘. 세로는 돌판 한 변과 캡션 줄이면 된다. */
  canvas: { height: 384, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 돌판 위에 빛줄기와 거울, 그 위로 에테르 바람 줄무늬가 지나간다.
   * 무늬 띠 위에 기준선이 그어져야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 방향 → 90° 돌리기(`turnIn` + `turn`) → 견주기 → 되돌리기.
   * 돌리기와 되돌리기는 `smooth` — 돌판을 천천히 밀어 돌리고 천천히 세운다. 돌리기는
   * 두 단계에 걸치므로 physics 가 `span(start('turnIn'), end('turn'), 'smooth')` 로 읽는다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'turnIn', duration: TURN_IN, caption: key('caption.turn') },
      { id: 'turn', duration: TURN, caption: key('caption.turn') },
      { id: 'compare', duration: COMPARE, caption: key('caption.compare') },
      { id: 'return', duration: RETURN, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 이미 에테르 바람이 흐르고, 곧 돌기 시작한다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 왕복 시간 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 기준선에서 밝은 무늬까지의
  // 어긋남이고, 거리 눈금은 그 판정을 흐린다 (S-piece).

  messages: michelsonMorleyMessages,
};
