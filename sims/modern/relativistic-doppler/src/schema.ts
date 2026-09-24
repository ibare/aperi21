// ========================================================================
// relativistic-doppler — 선언
// ========================================================================
// 질문: 달리는 광원이 낸 빛은 어느 쪽에서 받느냐에 따라 색이 어떻게 달라지는가?
//
// 앞으로 간 빛은 파장이 줄어 푸르고, 뒤로 간 빛은 늘어 붉다. 여기까지는 소리와 모양이 같다.
// 빛에는 하나가 더 있다 — **바로 옆으로 낸 빛도 붉다.** 다가오지도 멀어지지도 않는 방향인데
// 광원의 제 빛보다 파장이 γ 배 길다. 달리는 광원의 시간이 느리게 가서, 물결을 γ 배 드물게
// 내기 때문이다(시간 지연).
//
// 화면은 실험실 틀이다. 광원이 낸 파면은 낸 자리를 중심으로 c 로 퍼지는 원이고, 원 위 한 점의
// 색은 그 방향으로 받는 빛의 파장 λ(φ) = λ₀ · γ · (1 − β cos φ) 이다. 그래서 파면 하나가 앞은
// 보랏빛, 뒤는 빨강, 옆은 광원보다 조금 붉은 연두로 칠해진다.
//
// 음원과 관찰자 중 누가 움직이느냐의 비대칭(`doppler-source-vs-observer`), 파면이 앞에서
// 촘촘해지는 음파 그림(`doppler-effect`)은 이 조각의 몫이 아니다. 중력으로 붉어지는 빛은
// `gravitational-redshift`, 시계가 느리게 가는 모습 자체는 `time-dilation` 이 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:relativistic-doppler` 와 문자 그대로 일치한다 (C4). */
export const RELATIVISTIC_DOPPLER_ID = 'relativistic-doppler';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 광원의 빠르기 β = v/c. 0.28 이면 γ = 25/24, 앞뒤 도플러 배수가 정확히 4/3 · 3/4 라 세 방향의
 * 파장이 모두 가시광 안에 든다(405 · 562.5 · 720 nm). 더 빠르면 뒤쪽이 적외선으로 넘어간다.
 */
export const BETA = 0.28;
/** 광원이 제 틀에서 내는 빛의 파장(nm). 화면 글자에 그대로 쓰인다. */
export const SOURCE_NM = 540;
/**
 * 받는 파장(nm) — 화면 글자로 쓰는 선언값. `sourceNm × √((1−β)/(1+β))` · `sourceNm × γ` ·
 * `sourceNm × √((1+β)/(1−β))` 를 계산해 띄우지 않는다. β · 제 파장과 짝으로 바꾼다 (G143).
 */
export const FRONT_NM = 405;
export const SIDE_NM = 562.5;
export const BACK_NM = 720;
/**
 * **그림 배율** — 파장 1 nm 를 월드 몇 단위로 그리나. 540 nm 를 0.81 월드로 그린다. 파면 간격이
 * 곧 그 방향의 파장이므로 모든 방향에 똑같이 걸린다 — 비율은 키우지 않는다.
 */
export const WORLD_PER_NM = 0.0015;
/**
 * **그림 빛의 빠르기**(월드/초). 빛을 이만큼 느리게 그린다 — 파면이 퍼지는 것이 눈에 보여야 한다.
 * 광원의 빠르기는 이 값의 β 배라, 빛과 광원의 빠르기 비는 그대로다.
 */
export const LIGHT_SPEED = 3;

// ------------------------------------------------------------------------
// 배치 — 월드. 광원은 가로 길(LANE_Y)을 왼쪽에서 오른쪽으로 달린다.
// ------------------------------------------------------------------------

/** 광원이 달리는 길의 높이. 앞 · 뒤 관찰자도 이 높이에 있다. */
export const LANE_Y = 0.95;
/** 앞 · 뒤 관찰자의 x(절댓값). 앞은 오른쪽, 뒤는 왼쪽. */
export const OBSERVER_X = 5.5;
/**
 * 옆 관찰자 — 길 가운데(x = 0) 아래 이만큼. 광원이 바로 위(x = 0)에서 옆으로 낸 빛이
 * `reach` 가 시작할 때 이 관찰자에게 닿도록 광원의 자리를 시간표에서 잡는다(physics).
 */
export const SIDE_X = 0;
export const SIDE_DIST = 2.45;
/** 파면을 이 사각형 안에만 긋는다 — 아래 띠는 캡션 자리다. */
export const WAVE_CLIP = { min: [-6.5, -2.05], max: [6.5, 2.75] } as const;

/**
 * 프레이밍은 주장의 일부다. 가로는 앞 · 뒤 관찰자 글자까지, 세로는 광원 글자 위부터 옆 관찰자
 * 글자 · 캡션 줄 아래까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.5, maxX: 6.5, minY: -2.75, maxY: 2.75 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const relativisticDopplerMessages = Object.freeze({
  'label.title': { ko: '상대론적 도플러', en: 'Relativistic Doppler effect' },
  'label.stage': { ko: '0.28c 로 달리는 광원', en: 'A source moving at 0.28c' },
  'label.view': { ko: '실험실에서 본 파면', en: 'Wavefronts in the lab frame' },
  /** 파장. 값은 선언값을 그대로 끼운다 (S-piece 유효숫자). */
  'label.nm': { ko: '{l} nm', en: '{l} nm' },
  /** 광원의 빠르기. β 는 선언값 그대로. */
  'label.speed': { ko: '{b}c', en: '{b}c' },
  'label.source': { ko: '광원 {l} nm', en: 'source {l} nm' },
  'label.sideways': { ko: '옆으로 간 빛', en: 'sent sideways' },
  'caption.run': {
    ko: '달리는 광원이 낸 빛 — 앞으로 간 물결은 촘촘하고 푸르게, 뒤로 간 물결은 성기고 붉게 받힌다',
    en: 'Light from a moving source — waves sent ahead arrive bunched and blue, waves sent behind stretched and red',
  },
  'caption.hold': {
    ko: '바로 옆으로 낸 빛도 광원의 제 빛보다 붉다 — 달리는 광원의 시간이 느리게 가, 물결을 드물게 낸다',
    en: 'Even light sent straight sideways is redder than the source’s own — its clock runs slow, so it sends waves less often',
  },
} satisfies Record<string, LocalizedText>);

export type RelativisticDopplerMessageKey = keyof typeof relativisticDopplerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RelativisticDopplerMessageKey): LocalizedText => relativisticDopplerMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RelativisticDopplerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const relativisticDopplerSchema: BundleSchema = {
  id: RELATIVISTIC_DOPPLER_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 광원이 달리며 앞은 푸르고 뒤는 붉은 파면을 낸다. β 슬라이더는 두지
  // 않았다: 받는 파장 글자가 선언값이라 따라가지 못하고(G143), 끌어 올리면 뒤쪽 빛이 적외선으로
  // 넘어가 색을 지어낼 수 없다.
  parameters: [],

  stages: [
    {
      id: 'beta-028',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        sourceNm: SOURCE_NM,
        frontNm: FRONT_NM,
        sideNm: SIDE_NM,
        backNm: BACK_NM,
        worldPerNm: WORLD_PER_NM,
        lightSpeed: LIGHT_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 파면이 맨 아래, 관찰자 · 광원 · 글자가 그 위로 간다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 달림 → 멈춰 견줌 → 사라짐.
   *
   * - 광원은 늘 달리고 있었다 — 주기 처음에도 왼쪽 밖에서 낸 파면이 화면에 차 있다.
   * - `reach` 가 시작하는 순간 광원이 바로 위(x = 0)에서 옆으로 낸 파면이 옆 관찰자에게 닿는다.
   *   광원의 자리는 이 시각에서 거꾸로 잡는다(physics `movingSource`). 그 뒤로는 장면을 멈춰
   *   세운다 — `reach` 동안 옆으로 간 빛의 점선 · 받은 파장 글자가 나타나고, `hold` 동안 견준다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.6, ease: 'smooth', caption: key('caption.run') },
      { id: 'run', duration: 5.4, caption: key('caption.run') },
      { id: 'reach', duration: 0.5, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: 3.7, caption: key('caption.hold') },
      { id: 'fade', duration: 0.8, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 광원이 화면 왼쪽 절반을 달리고 있다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 파면의 색과 간격이다. */

  messages: relativisticDopplerMessages,
};
