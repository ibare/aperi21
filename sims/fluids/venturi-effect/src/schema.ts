// ========================================================================
// venturi-effect — 선언
// ========================================================================
// 질문: 관이 좁아진 곳의 압력이 낮아진다는 것을 어떻게 눈으로 보나 — 그리고 그것이
// 어디에 쓰이나.
//
// 동사: **빨려 올라간다.** 바람이 불면 좁아진 목 아래에 꽂은 가는 관에서만 통의 액체가
// 빨려 올라가고, 넓은 곳 아래 관은 통의 수면 높이 그대로다. 바람이 세져 액체가 목까지
// 닿으면 바람에 뜯겨 물방울로 날아간다 — 분무기.
//
// 이웃과 겹치지 않는다. 「절반이면 두 배 빠르다」 는 `continuity-equation`, 「빨라진 만큼
// 물기둥이 내려간다」 는 `bernoullis-principle` 의 몫이다. 이 조각은 **장치** — 목의 낮은
// 압력이 바깥 공기에 눌린 통의 액체를 끌어올리는 일 — 에 머문다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:venturi-effect` 와 문자 그대로 일치한다 (C4). */
export const VENTURI_EFFECT_ID = 'venturi-effect';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바람이 가장 셀 때 넓은 곳의 공기 속력(m/s). */
export const AIR_SPEED = 12;
/** 목 단면 ÷ 넓은 곳 단면. 목에서 공기는 1 / 0.4 = 2.5 배 빠르다. */
export const AREA_RATIO = 0.4;
/** 공기 밀도(kg/m³). */
export const AIR_DENSITY = 1.2;
/** 통에 든 액체의 밀도(kg/m³). 물. */
export const LIQUID_DENSITY = 1000;
/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 cm. 관 중심선이 y = 0 이다.
// ------------------------------------------------------------------------

/**
 * 관 — 입구 · 좁아지기 시작 · 목 시작 · 목 끝 · 다시 넓어짐 끝 · 출구(열린 공기).
 * 출구가 넓은 곳과 같은 굵기로 바깥 공기에 열려 있어, 넓은 곳의 압력은 바깥 공기와 같다.
 */
export const PIPE = {
  xIn: -10,
  convergeStart: -5.6,
  throatStart: -1.1,
  throatEnd: 1.1,
  divergeEnd: 6.2,
  xOut: 9,
} as const;
/** 넓은 곳 관의 반 굵기(cm). 목의 반 굵기는 이것 × `areaRatio`. */
export const WIDE_HALF = 2;

/** 가는 관 둘의 자리 — 넓은 곳 아래 · 목 아래. 속 반폭(cm). */
export const WIDE_TUBE_X = -7.8;
export const THROAT_TUBE_X = 0;
export const TUBE_HALF = 0.2;

/** 통 — 왼 · 오른 벽, 수면, 바닥. 가는 관의 아래 끝(`tubeDip`)은 수면 아래에 잠긴다. */
export const TANK = { xLeft: -9.3, xRight: 1.7, surface: -3.8, bottom: -5.2, tubeDip: -4.7 } as const;

/** 관 밖으로 뿜어진 물방울이 날아가는 끝(cm). 경계 오른쪽 끝과 같다. */
export const JET_END_X = 13;

/**
 * 화면 속 공기의 빠르기(cm/s) — 넓은 곳, 바람이 가장 셀 때. 실제 공기(12 m/s)는 눈으로
 * 좇을 수 없어 느리게 보인다. 목에서 몇 배 빠른지(굵기 비)는 그대로다.
 */
export const SHOWN_SPEED = 5;
/** 공기 점 — 한 단면에 놓는 줄 수, 넓은 곳에서의 가로 간격(cm), 벽에서 띄우는 비율. */
export const AIR_DOTS = { rows: 5, spacingWide: 0.7, wallMargin: 0.84 } as const;
/** 점 · 물방울 꼬리 = 속도 × 이 시간(초). 목에서 꼬리가 길어 빠르기가 길이로 읽힌다. */
export const TRAIL_SECONDS = 0.22;
/** 공기 점 모양(화면 px) — 반지름 · 꼬리 굵기 · 꼬리 짙기. 액체보다 한 단 물러선다. */
export const AIR_DOT_STYLE = { size: 1.5, trailWidth: 1.1, trailOpacity: 0.5 } as const;
/** 물방울 모양(화면 px). */
export const DROP_STYLE = { size: 2.2, trailWidth: 1.6, trailOpacity: 0.6 } as const;
/**
 * 물방울 — 뜯겨 나오는 간격(초), 관 속에서 흐름에 섞여 퍼지는 시간 상수(초),
 * 관을 나온 뒤 처지는 정도(cm 당 cm).
 */
export const DROPS = { interval: 0.05, mixTau: 0.6, sagPerCm: 0.035 } as const;

/** 선 굵기(화면 px). 굵기는 물리량이 아니라 위계다. */
export const LINE_PX = { wall: 2, tube: 1.4, tank: 1.6, level: 1 } as const;
/** 액체 채움 짙기. 통과 관 속이 겹쳐도 짙어지지 않게 불투명하게 깐다. */
export const LIQUID_FILL = 0.55;
/** 수면 기준 점선이 통 밖으로 뻗는 길이(cm). */
export const LEVEL_OVERHANG = 0.4;

/**
 * 프레이밍은 주장의 일부다. 가로는 관 입구부터 뿜어진 물방울 끝까지, 세로는 관 윗벽부터
 * 통 바닥과 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -10.4, maxX: 13.2, minY: -6.6, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 기본값
// ------------------------------------------------------------------------

/** 바람이 없는 동안. 두 관의 액면이 통의 수면과 같다. */
export const STILL = 1.4;
/** 바람이 세지는 동안. 목 아래 관의 액면만 올라간다. */
export const BLOW_UP = 3.0;
/** 가장 센 바람이 이어지는 동안. 목까지 오른 액체가 물방울로 뜯겨 나간다. */
export const SPRAY = 3.4;
/** 바람이 잦아드는 동안. 액면이 통 높이로 내려앉는다. */
export const BLOW_DOWN = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const venturiEffectMessages = Object.freeze({
  'label.title': { ko: '벤투리 효과', en: 'Venturi effect' },
  'label.stage': { ko: '벤투리관과 액체 통', en: 'Venturi tube over a liquid tank' },
  'label.view': { ko: '옆에서 본 장치', en: 'Side view' },
  'caption.still': {
    ko: '바람이 없으면 두 관 속 액면은 통의 수면과 같은 높이다',
    en: 'With no wind, the liquid in both tubes sits level with the tank',
  },
  'caption.blowUp': {
    ko: '바람이 불자 좁아진 목 아래 관에서만 액체가 빨려 올라간다 — 넓은 곳 아래 관은 그대로다',
    en: 'As the air blows, liquid climbs only the tube under the narrow throat — the tube under the wide part stays put',
  },
  'caption.spray': {
    ko: '목까지 빨려 올라온 액체가 바람에 뜯겨 물방울로 날아간다 — 분무기가 뿜는 방식이다',
    en: 'Liquid drawn up to the throat is torn off by the air into droplets — this is how a sprayer works',
  },
  'caption.blowDown': {
    ko: '바람이 잦아들면 목 아래 관의 액면도 통 높이로 내려앉는다',
    en: 'As the wind dies down, the liquid under the throat sinks back to the tank level',
  },
} satisfies Record<string, LocalizedText>);

export type VenturiEffectMessageKey = keyof typeof venturiEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: VenturiEffectMessageKey): LocalizedText => venturiEffectMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VenturiEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const venturiEffectSchema: BundleSchema = {
  id: VENTURI_EFFECT_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바람이 세지고, 뿜고, 잦아들고, 다시 분다.
  parameters: [],

  stages: [
    {
      id: 'venturi-sprayer',
      label: text('label.stage'),
      constants: {
        airSpeed: AIR_SPEED,
        areaRatio: AREA_RATIO,
        airDensity: AIR_DENSITY,
        liquidDensity: LIQUID_DENSITY,
        g: GRAVITY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 긴 장치 하나와 캡션 한 줄. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다 — 통 속 액체 위에 가는 관 속 액주, 그 위에 벽, 관 속 공기 점과
   * 물방울이 벽 위, 수면 기준 점선이 맨 위(액주가 그 선을 넘는 것이 보여야 한다).
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 고요 → 세지는 바람 → 뿜기 → 잦아드는 바람.
   *
   * 바람의 세기는 단계 진행도에서 나온다(`physics.flowAt`). 목 아래 액면은 바람 세기의
   * 제곱으로 오르고, 목에 닿는 순간부터 뿜는다 — 언제 닿는지는 단계가 아니라 스테이지
   * 상수(바람 속력 · 굵기 비 · 밀도)가 정한다.
   */
  timeline: {
    phases: [
      { id: 'still', duration: STILL, caption: key('caption.still') },
      { id: 'blowUp', duration: BLOW_UP, ease: 'smooth', caption: key('caption.blowUp') },
      { id: 'spray', duration: SPRAY, caption: key('caption.spray') },
      { id: 'blowDown', duration: BLOW_DOWN, ease: 'smooth', caption: key('caption.blowDown') },
    ],
  },

  /** 도착한 순간 이미 바람이 세지는 중이고 목 아래 액면이 오르고 있다. */
  startAt: STILL + 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 베르누이 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 cm 가 아니라 두 관의 액면 차이다. */

  messages: venturiEffectMessages,
};
