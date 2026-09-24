// ========================================================================
// stern-gerlach — 선언
// ========================================================================
// 질문: 은 원자 빔을 위로 갈수록 센(불균일) 자기장에 통과시키면 스크린에 무엇이 남는가.
//
// 원자 하나하나를 작은 자석으로 보고 그 방향이 제멋대로라면, 자석이 위를 향한 만큼 위로,
// 아래를 향한 만큼 아래로 꺾여 스크린에 **세로 띠**가 번져야 한다. 실제로는 위아래 **두 점**에만
// 떨어진다 — 은 원자의 스핀이 가질 수 있는 값이 둘뿐이기 때문이다.
//
// 이웃과 겹치지 않는 자리 — `spin` 은 스핀이라는 각운동량 자체를 다룬다. 이 조각은 한 번의
// 갈라짐에서 「예상한 띠」 와 「실제 두 점」 의 대비만 한다. 자석을 이어 붙여 다시 재는 연속 측정은
// 하지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stern-gerlach` 와 문자 그대로 일치한다 (C4). */
export const STERN_GERLACH_ID = 'stern-gerlach';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 원자의 방향 · 갈래 · 출발 자리를 뽑는 시드. 주기마다 (시드, 주기 번호)로 새로 뽑는다. */
export const SEED = 11;

/** 「자석 방향이 제멋대로라면」 을 보이는 가정 원자 수(한 주기). */
export const EXPECT_COUNT = 36;

/** 실제로 보내는 원자 수(한 주기). 두 점이 점 무더기로 읽힐 만큼. */
export const REAL_COUNT = 44;

/** 원자가 날아가는 속력(월드 단위 / s, 화면 시간). */
export const ATOM_SPEED = 7.6;

/** 1922 년 실험의 자석 길이(mm). */
export const MAGNET_LENGTH_MM = 35;

/** 1922 년 실험에서 스크린의 두 자국 사이 거리(mm). 약 0.2 mm. */
export const SPLIT_MM = 0.2;

/**
 * 편향 배율 — 스크린 위 갈라짐을 자석 길이에 견줘 몇 배 키워 그리는가.
 * 실제 비(0.2 mm / 35 mm)대로면 두 점 사이가 자석 길이의 1/175 라 한 점으로 보인다.
 * 월드 편향(한쪽) = 자석 길이(월드) × (갈라짐 / 2) / 자석 길이(mm) × 이 값. 화면에 알리지 않은 이유는 NOTES (b).
 */
export const DEFLECTION_MAGNIFICATION = 100;

/** 빔 두께(월드, 세로 반폭). 슬릿이 좁아도 원자마다 출발 높이가 조금씩 다르다 — 점의 크기가 된다. */
export const BEAM_THICKNESS = 0.12;

/** 빔 폭(월드, 스크린 정면에서 가로 반폭). 세로 띠가 「띠」 로, 두 점이 「점」 으로 읽히는 폭. */
export const BEAM_WIDTH = 0.32;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원자는 왼쪽에서 +x 로 날아가고, 위가 +y(자석 N 극 쪽)다.
// ------------------------------------------------------------------------

/** 원자가 가마에서 나오는 자리. */
export const OVEN_X = -13;
/** 빔을 좁히는 슬릿. */
export const SLIT_X = -11;
/** 자석이 차지하는 구간. 이 길이가 `MAGNET_LENGTH_MM` 를 나타낸다. */
export const MAGNET_X0 = -8;
export const MAGNET_X1 = 0;
/** 자극 안쪽 면의 높이(±). 가장 크게 꺾인 원자도 자석 안에서 닿지 않는다. */
export const POLE_INNER = 1.3;
/** 자극 바깥 면의 높이(±). */
export const POLE_OUTER = 2.6;
/** 옆에서 본 스크린의 자리 · 세로 반높이. */
export const SCREEN_X = 6;
export const SCREEN_HALF = 3.2;
/** 스크린 정면 판의 가운데 · 가로 반폭. 세로는 옆 보기 스크린과 같은 높이를 쓴다 — 두 그림의 높이가 한 줄로 이어진다. */
export const PANEL_CX = 10;
export const PANEL_HALF = 1.4;

/** 프레이밍 — 가마부터 스크린 정면 판 오른쪽 이름표까지, 아래로 캡션 띠(장부 G24). */
export const SCENE_BOUNDS = { minX: -16, maxX: 16.6, minY: -4.9, maxY: 4.1 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 가정 원자를 차례로 보내는 동안 · 마지막 원자가 스크린에 닿기까지. */
export const EXPECT = 6.0;
export const EXPECT_LAND = 2.8;
/** 예상한 띠가 옅은 흔적으로 물러나는 동안. */
export const DIM = 0.8;
/** 실제 원자를 차례로 보내는 동안 · 마지막 원자가 스크린에 닿기까지. */
export const REAL = 6.0;
export const REAL_LAND = 2.8;
/** 두 점의 ↑ · ↓ 표식이 나타나는 동안. */
export const REVEAL = 0.6;
/** 두 점과 비어 있는 띠를 함께 보이며 머무는 동안 · 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const sternGerlachMessages = Object.freeze({
  'label.title': { ko: '슈테른-게를라흐 실험', en: 'Stern–Gerlach experiment' },
  'label.operation': { ko: '갈라지는 원자 빔', en: 'An atomic beam that splits' },
  'label.stage': { ko: '은 원자 빔', en: 'Silver atom beam' },
  'label.view': { ko: '옆에서 본 장치와 스크린 정면', en: 'Side view and screen, face-on' },
  'label.oven': { ko: '은 원자', en: 'silver atoms' },
  'label.magnet': { ko: '불균일 자기장', en: 'non-uniform magnetic field' },
  'label.screen': { ko: '스크린', en: 'screen' },
  'label.face': { ko: '스크린 정면', en: 'screen, face-on' },
  'label.expected': { ko: '예상한 띠', en: 'expected band' },
  /** 자극 · 스핀 표식 — 도형에 새긴 기호라 번역하지 않는다 (C1 판정 1 · 3). */
  'mark.north': { ko: 'N', en: 'N' },
  'mark.south': { ko: 'S', en: 'S' },
  'mark.up': { ko: '↑', en: '↑' },
  'mark.down': { ko: '↓', en: '↓' },
  'caption.expect': {
    ko: '원자 속 자석의 방향이 제멋대로라면, 저마다 다르게 꺾여 스크린에 세로 띠로 번져야 한다',
    en: "If each atom's tiny magnet pointed any which way, each would bend differently and smear into a vertical band",
  },
  'caption.real': {
    ko: '실제 은 원자는 위 아니면 아래, 두 갈래로만 꺾인다',
    en: 'Real silver atoms bend only two ways — up or down',
  },
  'caption.hold': {
    ko: '띠의 가운데는 비고, 위아래 두 점에만 쌓였다',
    en: 'The middle of the band stays empty — atoms piled up in just two spots',
  },
} satisfies Record<string, LocalizedText>);

export type SternGerlachMessageKey = keyof typeof sternGerlachMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SternGerlachMessageKey): LocalizedText => sternGerlachMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SternGerlachMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const sternGerlachSchema: BundleSchema = {
  id: STERN_GERLACH_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 예상한 띠와 실제 두 점을 차례로 보이며 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'silver-beam',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        expectCount: EXPECT_COUNT,
        realCount: REAL_COUNT,
        atomSpeed: ATOM_SPEED,
        magnetLengthMm: MAGNET_LENGTH_MM,
        splitMm: SPLIT_MM,
        deflectionMagnification: DEFLECTION_MAGNIFICATION,
        beamThickness: BEAM_THICKNESS,
        beamWidth: BEAM_WIDTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side-and-face', label: text('label.view'), default: true }],

  /** 가로로 긴 장치 한 줄과 캡션 한 줄. 세로가 비싸다 (S-piece PREFER). */
  canvas: { height: 320, minHeight: 300 },

  /** 겹침은 scene 에 쓴 순서 — 판 · 자극 위에 지나간 길, 그 위에 자국 · 원자, 맨 위에 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 가정 원자를 보냄 → 마지막 가정 원자가 닿음 → 예상한 띠가 흔적으로 물러남 → 실제 원자를 보냄 →
   * 마지막 실제 원자가 닿음 → ↑ · ↓ 표식 → 머묾 → 흐려짐. 흐려진 뒤 새 시드 주기로 다시 보낸다.
   * `expectLand` · `realLand` 는 원자가 가마에서 스크린까지 가는 시간(약 2.5 초)보다 길게 둔다 (NOTES (c)).
   */
  timeline: {
    phases: [
      { id: 'expect', duration: EXPECT, caption: key('caption.expect') },
      { id: 'expectLand', duration: EXPECT_LAND, caption: key('caption.expect') },
      { id: 'dim', duration: DIM, ease: 'smooth', caption: key('caption.real') },
      { id: 'real', duration: REAL, caption: key('caption.real') },
      { id: 'realLand', duration: REAL_LAND, caption: key('caption.real') },
      { id: 'reveal', duration: REVEAL, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 가정 원자들이 날아가고 있고, 스크린에 띠가 반쯤 차 있다. */
  startAt: 4.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 스핀의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: sternGerlachMessages,
};
