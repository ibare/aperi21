// ========================================================================
// mass-spectrometer — 선언
// ========================================================================
// 질문: 속력과 전하가 같고 질량만 다른 이온(동위원소)을 자기장에 들여보내면 어떻게 되는가.
//
// 답: 자기장 속 이온은 원을 그리고 그 반지름은 r = mv/qB 다. v · q · B 가 같으면 반지름은
// 질량에 비례한다 — 무거운 이온이 더 큰 반원을 그려 입구에서 더 먼 자리에 떨어진다.
// 한 입구로 함께 들어온 두 이온이 자기장 속에서 **갈라져** 판에 두 점을 남긴다.
//
// 동사: 무거울수록 큰 원을 그려 **갈라진다**.
//
// 이웃 `velocity-selector` 는 속력을 골라내는 교차장을, `charged-particle-in-magnetic-field` 는
// 같은 전하가 속력에 따라 다른 원을 그리되 한 주기에 함께 돌아오는 것을 말한다. 여기서는
// 속력을 같게 고정하고 **질량만** 바꾼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mass-spectrometer` 와 문자 그대로 일치한다 (C4). */
export const MASS_SPECTROMETER_ID = 'mass-spectrometer';

// ------------------------------------------------------------------------
// 물리 · 장치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 길이는 임의 단위, 원점은 입구 슬릿. 이온은 아래에서 +y 로 들어오고, 자기장은
// 종이 밖(⊙)이라 양이온이 오른쪽으로 휜다.
// 반지름은 r = mass · speed / (charge · fieldB) 월드다.
// ------------------------------------------------------------------------

/** 가벼운 · 무거운 이온의 질량수(u). 기호의 위첨자 질량수는 이 값에서 옮긴다(state, G133 우회). */
export const MASS_LIGHT = 20;
export const MASS_HEAVY = 22;
/** 이온 전하(기본 전하 단위). 두 이온이 같다. */
export const CHARGE = 1;
/** 이온 속력(월드/초). 두 이온이 같다 — 앞단의 속도 선택기가 고른 속력이다. */
export const SPEED = 1.5;
/** 자기장 세기(임의 단위). 방향은 종이 밖(⊙)으로 고정이다. */
export const FIELD_B = 15;

/** 이온원에서 입구 슬릿까지 곧게 오는 길이(월드). 장이 없는 곳이다. */
export const BEAM_LENGTH = 0.7;
/** 입구 슬릿 폭의 반(월드). */
export const SLIT_HALF = 0.07;
/** 판의 왼쪽 · 오른쪽 끝(월드 x). 판 윗면이 y = 0 이다. */
export const PLATE_LEFT = -0.8;
export const PLATE_RIGHT = 5;
/** 자기장 무늬를 까는 영역(월드). 판 위, 가장 큰 반원을 덮는다. */
export const FIELD_MIN_X = 0.3;
export const FIELD_MAX_X = 4.9;
export const FIELD_MIN_Y = 0.35;
export const FIELD_MAX_Y = 2.4;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽 이온원부터 오른쪽 판 끝까지, 위는 가장 큰 반원과 그 이름표, 아래는 판 밑
 * 이름표와 캡션 자리. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1, maxX: 5.3, minY: -1.2, maxY: 2.65 } as const;
/** 캡션을 세우는 월드 자리 — 판 밑, 이온원 오른쪽에서 왼쪽 정렬로 시작한다. */
export const CAPTION_AT = [0.45, -0.75] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const massSpectrometerMessages = Object.freeze({
  'label.title': { ko: '질량 분석기', en: 'Mass spectrometer' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },

  /**
   * 핵종 · 장 기호. 표식이라 두 언어가 같다 (C1 판정 3). 질량수 `{a}` 는 스테이지 상수
   * `massLight` · `massHeavy` 를 위첨자 글자로 옮겨 끼운다 (state.ts).
   */
  'label.ion': { ko: '{a}Ne', en: '{a}Ne' },
  'label.fieldB': { ko: 'B', en: 'B' },

  'caption.enter': {
    ko: '속력도 전하도 같은 두 이온이 한 입구로 자기장에 들어간다.',
    en: 'Two ions with the same speed and the same charge enter the magnetic field through one slit.',
  },
  'caption.split': {
    ko: '무거운 이온일수록 덜 휘어 더 큰 원을 그린다 — 두 길이 갈라진다.',
    en: 'The heavier ion turns less and sweeps a wider circle, so the two paths split apart.',
  },
  'caption.land': {
    ko: '가벼운 이온은 입구 가까이, 무거운 이온은 더 먼 자리에 떨어져 판에 두 점이 남았다.',
    en: 'The lighter ion lands near the slit and the heavier one farther out, leaving two separate spots on the plate.',
  },
} satisfies Record<string, LocalizedText>);

export type MassSpectrometerMessageKey = keyof typeof massSpectrometerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MassSpectrometerMessageKey): LocalizedText => massSpectrometerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MassSpectrometerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const massSpectrometerSchema: BundleSchema = {
  id: MASS_SPECTROMETER_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        massLight: MASS_LIGHT,
        massHeavy: MASS_HEAVY,
        charge: CHARGE,
        speed: SPEED,
        fieldB: FIELD_B,
        beamLength: BEAM_LENGTH,
        slitHalf: SLIT_HALF,
        plateLeft: PLATE_LEFT,
        plateRight: PLATE_RIGHT,
        fieldMinX: FIELD_MIN_X,
        fieldMaxX: FIELD_MAX_X,
        fieldMinY: FIELD_MIN_Y,
        fieldMaxY: FIELD_MAX_Y,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 반원이 가로로 2r · 세로로 r 이라 가로로 넓다. 세로는 반원 · 빔 · 캡션 한 줄. */
  canvas: { height: 400, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 장 무늬 · 판 · 궤적 · 떨어진 자리 · 이온 · 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 두 이온이 이미 자기장 속에서 갈라지고 있다 (S-piece). */
  startAt: 3,

  /**
   * 한 주기 11.7 초.
   *
   * - `appear` — 장치만 있다. 앞 주기의 궤적이 물러난 뒤 한 박자.
   * - `enter` · `split` — 두 이온이 함께 이온원을 떠나 입구를 지나 반원을 그린다. 발사 뒤 흐른
   *   시간은 두 단계의 진행도 × 길이의 합이다(`ease` 없음). 판에 닿으면 그 자리에 멈춘다.
   *   `enter` 는 입구를 지나 막 휘기 시작할 때까지, `split` 은 무거운 이온이 떨어질 때까지다 —
   *   비행 시간이 속력 · 질량 상수를 따라가지 않는다(NOTES c, G13).
   * - `hold` — 두 반원과 판의 두 점이 한 화면에 남는다.
   * - `fade` — 궤적이 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5 },
      { id: 'enter', duration: 1.2, caption: key('caption.enter') },
      { id: 'split', duration: 4.4, caption: key('caption.split') },
      { id: 'hold', duration: 5, caption: key('caption.land') },
      { id: 'fade', duration: 0.6, caption: key('caption.land') },
    ],
  },

  /** 슬롯 하나. 판 밑 — 반원 안쪽은 궤적 자리라 비워 둔다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 440,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본). 떨어진 자리의 순서가 주장이지 거리 눈금이 아니다.

  messages: massSpectrometerMessages,
};
