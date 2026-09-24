// ========================================================================
// exchange-particles — 선언
// ========================================================================
// 질문: 서로 닿지도 않는 두 전자가 어떻게 서로를 밀어내는가.
//
// 양자장 이론은 힘을 **주고받음**으로 그린다. 한 전자가 광자 하나를 내놓으며 반대로 튕겨
// 나고, 그 광자를 받은 다른 전자도 밀려난다. 파인만 도형은 이것을 세로 시간 · 가로 공간 위의
// 선으로 그린다 — 곧은 선은 전자(페르미온), 물결선은 광자, 두 선이 만나는 점이 주고받는 자리다.
//
// 같은 문법이 다른 힘에도 선다. 쿼크 둘 사이에서는 같은 자리를 글루온(고리 감긴 선)이 잇는다 —
// 강한 힘이다. 선 모양이 매개 입자를 가르고, 색은 가르지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 전자-양전자 소멸은 이웃 `antimatter`, 핵 안 알갱이의 수와 종류는 이웃 `nuclear-structure` 의 몫이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:exchange-particles` 와 문자 그대로 일치한다 (C4). */
export const EXCHANGE_PARTICLES_ID = 'exchange-particles';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 도형 좌표는 세로가 시간, 가로가 공간이고 빛의 빠르기를 1 로 둔다 — 광자 선은 45° 로 선다.
// ------------------------------------------------------------------------

/** 전자의 빠르기(v/c) — 세계선의 기울기(가로 / 세로). 1 보다 작아 광자 선보다 가파르다. */
export const ELECTRON_SPEED = 0.55;
/** 왼쪽 전자가 광자를 내놓는 꼭짓점 — 시각과 자리. */
export const EMIT_TIME = 2;
export const EMIT_X = -1.8;
/**
 * 두 꼭짓점 사이 가로 거리. 광자는 빛의 빠르기로 건너가므로 받는 꼭짓점의 시각은
 * 내놓은 시각 + 이 거리다 (c = 1).
 */
export const VERTEX_GAP = 3.6;
/**
 * 도형의 위 끝 시각 — 시간 조각이 여기까지 오른다. 기본값은 2 × 방출 시각 + 꼭짓점 거리라
 * 도형이 가운데에 대해 점대칭이 된다(들어오는 다리와 나가는 다리의 길이가 같다).
 */
export const DIAGRAM_TOP = 7.6;
/**
 * 광자 물결 간격과 글루온 고리 간격(도형 단위). 선의 **모양**을 가르는 표시값이지 광자의
 * 파장이 아니다 — 가상 광자에는 정해진 파장이 없다 (NOTES (b)).
 */
export const PHOTON_WAVELENGTH = 0.55;
export const GLUON_LOOP_PITCH = 0.48;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 두 전자가 다가오며 시간 조각이 방출 꼭짓점까지 오른다. */
export const PHASE_APPROACH = 2.2;
/** 광자가 건너가는 동안 — 조각이 방출 꼭짓점에서 흡수 꼭짓점까지. */
export const PHASE_TRAVEL = 3.0;
/** 두 전자가 멀어지며 조각이 도형 위 끝까지. */
export const PHASE_APART = 2.2;
/** 시간 조각이 걷히는 틈. */
export const PHASE_SETTLE = 0.5;
/** 다 그려진 도형을 보는 틈. */
export const PHASE_HOLD = 2.6;
/** 광자 물결이 글루온 고리로, 전자가 쿼크로 바뀐다. */
export const PHASE_MORPH = 1.0;
/** 글루온 도형을 보는 틈. */
export const PHASE_GLUON = 3.2;
export const PHASE_FADE = 0.8;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 1.5;

/** 프레이밍은 고정 — 시간 축 · 공간 축과 도형, 아래 캡션 띠가 들어간다. */
export const SCENE_BOUNDS = {
  minX: -7.8,
  maxX: 7.6,
  minY: -0.9 - CAPTION_BAND,
  maxY: 8.8,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const exchangeParticlesMessages = Object.freeze({
  'label.title': { ko: '교환 입자', en: 'Exchange particles' },
  'label.stage': { ko: '전자 둘의 광자 주고받기', en: 'Two electrons trading a photon' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.time': { ko: '시간', en: 'time' },
  'label.space': { ko: '공간', en: 'space' },
  'label.now': { ko: '지금', en: 'now' },
  'mark.electron': { ko: 'e⁻', en: 'e⁻' },
  'mark.quark': { ko: 'q', en: 'q' },
  'mark.photon': { ko: 'γ', en: 'γ' },
  'mark.gluon': { ko: 'g', en: 'g' },
  'caption.approach': {
    ko: '두 전자가 서로 다가간다 — 세로는 시간, 가로는 공간이다',
    en: 'Two electrons head toward each other — time runs up, space runs across',
  },
  'caption.travel': {
    ko: '한 전자가 광자를 내놓으며 반대로 튕겨 나고, 광자가 다른 전자로 건너간다',
    en: 'One electron gives off a photon and recoils; the photon crosses to the other electron',
  },
  'caption.apart': {
    ko: '광자를 받은 전자도 밀려나 둘이 멀어진다',
    en: 'The electron that takes the photon is pushed away too, and the two part',
  },
  'caption.hold': {
    ko: '둘은 한 번도 닿지 않았다 — 광자 하나를 주고받은 것이 밀어냄이다',
    en: 'They never touched — trading one photon was the push',
  },
  'caption.gluon': {
    ko: '쿼크 둘 사이에서는 같은 자리를 글루온이 잇는다 — 강한 힘도 주고받음이다',
    en: 'Between two quarks a gluon takes the same place — the strong force is a trade as well',
  },
} satisfies Record<string, LocalizedText>);

export type ExchangeParticlesMessageKey = keyof typeof exchangeParticlesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ExchangeParticlesMessageKey): LocalizedText => exchangeParticlesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ExchangeParticlesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const exchangeParticlesSchema: BundleSchema = {
  id: EXCHANGE_PARTICLES_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 시간 조각이 아래서 위로 쓸며 주고받음을 한 번 그리고, 매개 입자를 바꿔 보인다.
  parameters: [],

  stages: [
    {
      id: 'photon-exchange',
      label: text('label.stage'),
      constants: {
        electronSpeed: ELECTRON_SPEED,
        emitTime: EMIT_TIME,
        emitX: EMIT_X,
        vertexGap: VERTEX_GAP,
        diagramTop: DIAGRAM_TOP,
        photonWavelength: PHOTON_WAVELENGTH,
        gluonLoopPitch: GLUON_LOOP_PITCH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 도형 하나 · 캡션 한 줄. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 440, minHeight: 320 },

  /**
   * 한 주기 = 광자 주고받기를 시간 조각으로 쓸어 그리고(approach → travel → apart), 조각을 걷어
   * 다 그린 도형을 보고(settle · hold), 같은 자리를 글루온으로 바꿔 보인 뒤(morph · gluon) 흐려진다.
   *
   * 조각이 오르는 도형 시각은 세 단계의 진행도를 꼭짓점 시각으로 이어 붙인 것이다 — 단계 길이는
   * 꼭짓점 시각을 따라가지 않는다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: PHASE_APPROACH, caption: key('caption.approach') },
      { id: 'travel', duration: PHASE_TRAVEL, caption: key('caption.travel') },
      { id: 'apart', duration: PHASE_APART, caption: key('caption.apart') },
      { id: 'settle', duration: PHASE_SETTLE, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: PHASE_HOLD, caption: key('caption.hold') },
      { id: 'morph', duration: PHASE_MORPH, ease: 'smooth', caption: key('caption.gluon') },
      { id: 'gluon', duration: PHASE_GLUON, caption: key('caption.gluon') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.gluon') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 두 전자가 다가오는 중에 연다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 결합 상수 · 운동량 보존 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: exchangeParticlesMessages,
};
