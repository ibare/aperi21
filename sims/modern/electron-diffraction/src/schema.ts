// ========================================================================
// electron-diffraction — 선언
// ========================================================================
// 질문: 전자가 파동이라는 것을 어떻게 눈으로 보는가.
//
// 전자총에서 나온 전자빔이 얇은 흑연 박막(결정)을 지나 형광 스크린에 닿는다.
// 전자 하나하나는 점으로 떨어지지만, 그 점들이 스크린에 **동심 고리**를 그린다 —
// 결정의 원자 줄에서 회절한 파동만이 만드는 무늬다(데이비슨-거머 · 톰슨).
// 가속 전압을 올려 전자를 빠르게 하면 파장(λ = h/p)이 짧아져 고리가 **안쪽으로
// 좁아진다.** 그것이 이 조각의 동사다.
//
// 이웃 `double-slit-with-electrons` 는 점이 **쌓여** 줄무늬가 되는 것을 보인다. 여기서는
// 점이 쌓이지 않는다 — 형광의 잔광처럼 잠깐 빛나고 사라져서, 전압이 바뀌면 새 점이
// 새 반지름에 떨어지며 고리가 움직인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:electron-diffraction` 와 문자 그대로 일치한다 (C4). */
export const ELECTRON_DIFFRACTION_ID = 'electron-diffraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 cm(월드 단위와 같다), 전압은 kV, 격자 간격 · 파장은 nm.
// ------------------------------------------------------------------------

/** 처음 가속 전압(kV). 화면의 `{v} kV` 가 이 값을 그대로 쓴다. */
export const VOLTAGE_LOW_KV = 2;
/**
 * 올린 가속 전압(kV). 처음의 다섯 배 — 전자는 √5 배 빨라지고 고리 반지름은 1/√5 로 준다.
 * 네 배(반지름 절반)로 두면 올린 뒤의 바깥 고리가 처음 안쪽 고리 자리 점선에 거의 붙어
 * 「바깥 고리가 안쪽 고리 자리로 옮겼다」 로 짝을 잘못 짓게 된다 (NOTES (b)).
 */
export const VOLTAGE_HIGH_KV = 10;
/**
 * 1 kV 로 가속한 전자의 드브로이 파장(nm). λ = 1.226 nm·√V / √V 를 kV 로 옮긴 값이다
 * (비상대론 근사 — 10 kV 에서도 어긋남이 0.5 % 아래다).
 */
export const LAMBDA_AT_1KV_NM = 0.03877;
/** 흑연 박막에서 스크린까지의 거리(cm). 교실용 회절관의 크기다. */
export const SCREEN_DISTANCE_CM = 13.5;
/** 흑연의 두 격자면 간격(nm) — 안쪽 고리 · 바깥 고리를 만든다. 비는 √3 이다. */
export const LATTICE_D1_NM = 0.213;
export const LATTICE_D2_NM = 0.123;

// ------------------------------------------------------------------------
// 도착 점 — 스테이지 상수의 기본값.
// ------------------------------------------------------------------------

/** 도착 점을 뽑는 시드. 같은 시각은 언제나 같은 점이다. */
export const SEED = 21;
/** 스크린에 닿는 전자 수(초당, 조각 시계). */
export const ARRIVAL_RATE = 700;
/** 점 하나가 빛나다 사라지는 잔광 시간(초). 이 동안 고르게 옅어진다. */
export const GLOW_LIFE = 1.3;
/** 도착한 전자 중 곧게 지나가 가운데 점이 되는 몫 · 안쪽 고리 몫. 나머지가 바깥 고리다. */
export const SHARE_CENTER = 0.26;
export const SHARE_INNER = 0.42;
/** 고리의 반지름 방향 퍼짐(반지름에 대한 표준편차 비). 박막이 다결정이라 고리가 굵다. */
export const RING_SPREAD = 0.04;
/** 가운데 점의 퍼짐(표준편차, cm). 빔의 굵기다. */
export const CENTER_SPREAD = 0.12;
/** 한 점의 빛 세기 0~1. 겹친 점은 더해져(`blend: 'add'`) 고리가 몰린 곳이 밝다. */
export const DOT_LIGHT = 0.6;
/**
 * 빔 속 전자가 흘러가는 빠르기 — 처음 전압에서 월드 단위/초. 실제 전자(초속 수만 km)는
 * 보이지 않으므로 느리게 보인다. 전압에 따른 **비**(√5 배)만 보존한다 (NOTES (b)).
 */
export const BEAM_FLOW = 1.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(cm). 왼쪽 옆모습, 오른쪽 스크린 정면.
// ------------------------------------------------------------------------

/** 전자총의 가운데 · 크기. */
export const GUN_X = -3.7;
export const GUN_W = 0.9;
export const GUN_H = 0.56;
/** 흑연 박막(옆모습)의 자리 · 두께 · 높이. */
export const FOIL_X = 0;
export const FOIL_W = 0.09;
export const FOIL_H = 1.1;
/**
 * 옆모습의 스크린 자리. 박막에서 13.5 cm 떨어져 있지만 옆모습의 가로만 줄여 6 에 둔다 —
 * 세로(고리 높이)는 그대로라 정면 스크린의 고리와 같은 높이에서 만난다 (NOTES (b)).
 */
export const SIDE_SCREEN_X = 6;
export const SIDE_SCREEN_W = 0.14;
/** 정면 스크린의 가운데 · 반지름. 처음 전압의 바깥 고리(약 3 cm)가 넉넉히 든다. */
export const FACE_X = 10.9;
export const SCREEN_R = 3.4;
/** 빔 속 전자 사이 간격. */
export const BEAM_GAP = 0.42;

/**
 * 프레이밍은 주장의 일부다. 가로는 전자총부터 정면 스크린까지, 세로는 스크린 위 이름표부터
 * 아래 이름표와 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -4.5, maxX: 14.6, minY: -4.75, maxY: 4.05 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 — 기본값. 물리는 이 상수를 보지 않고 시간표에게 묻는다.
// ------------------------------------------------------------------------

/** 처음 전압으로 고리를 보는 동안. */
export const LOW = 3.2;
/** 전압을 올리는 동안 — `linear`. 전압이 고르게 오른다. */
export const RAISE = 2.6;
/** 올린 전압으로 좁아진 고리를 보는 동안. */
export const HIGH = 3.6;
/** 전압을 처음 값으로 내리는 동안 — `linear`. 다음 주기의 처음과 이어진다. */
export const LOWER = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electronDiffractionMessages = Object.freeze({
  'label.title': { ko: '전자 회절', en: 'Electron diffraction' },
  'label.stage': { ko: '흑연 박막', en: 'Graphite film' },
  'label.view': { ko: '옆모습과 정면', en: 'Side and front' },
  'label.gun': { ko: '전자총', en: 'Electron gun' },
  'label.foil': { ko: '흑연 박막', en: 'Graphite film' },
  'label.screen': { ko: '형광 스크린 (정면)', en: 'Fluorescent screen (front)' },
  /** 가속 전압. 값이 끼는 조립문이라 문안이다 — `{v}` 는 스테이지 상수 그대로 (C1). */
  'label.voltage': { ko: '{v} kV', en: '{v} kV' },
  'caption.low': {
    ko: '결정을 지난 전자들이 스크린에 동심 고리를 그린다',
    en: 'Electrons that pass through the crystal draw concentric rings on the screen',
  },
  'caption.raise': {
    ko: '전압을 올려 전자를 빠르게 하면 고리가 안쪽으로 좁아진다',
    en: 'Raise the voltage to speed the electrons up — the rings close inward',
  },
  'caption.high': {
    ko: '빠른 전자의 고리는 처음 자리(점선)보다 안쪽에 선다',
    en: 'The faster electrons land in rings inside where the rings first stood (dashed)',
  },
  'caption.lower': {
    ko: '전압을 내리면 고리가 다시 넓어진다',
    en: 'Lower the voltage and the rings widen again',
  },
} satisfies Record<string, LocalizedText>);

export type ElectronDiffractionMessageKey = keyof typeof electronDiffractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectronDiffractionMessageKey): LocalizedText => electronDiffractionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectronDiffractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electronDiffractionSchema: BundleSchema = {
  id: ELECTRON_DIFFRACTION_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 고리가 있고, 전압이 오르고, 고리가 좁아진다.
  parameters: [],

  stages: [
    {
      id: 'graphite',
      label: text('label.stage'),
      constants: {
        voltageLowKv: VOLTAGE_LOW_KV,
        voltageHighKv: VOLTAGE_HIGH_KV,
        lambdaAt1kvNm: LAMBDA_AT_1KV_NM,
        screenDistanceCm: SCREEN_DISTANCE_CM,
        latticeD1Nm: LATTICE_D1_NM,
        latticeD2Nm: LATTICE_D2_NM,
        seed: SEED,
        arrivalRate: ARRIVAL_RATE,
        glowLife: GLOW_LIFE,
        shareCenter: SHARE_CENTER,
        shareInner: SHARE_INNER,
        ringSpread: RING_SPREAD,
        centerSpread: CENTER_SPREAD,
        dotLight: DOT_LIGHT,
        beamFlow: BEAM_FLOW,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side-and-front', label: text('label.view'), default: true }],

  /** 옆모습과 정면 스크린을 가로로 잇는다. 세로는 스크린 지름과 이름표 · 캡션 줄이면 된다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서를 scene 에 쓴 대로 둔다 — 빛 없음 원판 위에 잔광 점을 더해 칠하고(`blend: 'add'`),
   * 처음 고리 자리 점선은 점 **위**에 얹혀야 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 전압 → 올린다 → 올린 전압 → 내린다. 내리는 단계 끝이 다음 주기 처음과 같은
   * 전압이라 주기가 이음매 없이 돈다. 두 경사 단계는 `linear` — 물리가 지난 도착 시각의 전압을
   * 이 가정으로 다시 센다 (NOTES (c) G59).
   */
  timeline: {
    phases: [
      { id: 'low', duration: LOW, caption: key('caption.low') },
      { id: 'raise', duration: RAISE, ease: 'linear', caption: key('caption.raise') },
      { id: 'high', duration: HIGH, caption: key('caption.high') },
      { id: 'lower', duration: LOWER, ease: 'linear', caption: key('caption.lower') },
    ],
  },

  /** 도착한 순간 이미 빔이 흐르고 스크린에 고리가 빛나고 있다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — λ = h/p 와 브래그 조건은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 재는 것은 거리가 아니라 **처음 자리보다 안쪽인가** 라서
  // 거리 격자 대신 처음 고리 자리 점선 원이 자 노릇을 한다.

  messages: electronDiffractionMessages,
};
