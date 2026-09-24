// ========================================================================
// laplace-pressure — 선언
// ========================================================================
// 질문: 같은 비누막인데 왜 작은 거품이 큰 거품으로 빨려 들어가는가.
//
// 크기만 다른 비누 거품 둘이 U자 관 양 끝에 붙어 있고, 가운데 밸브가 닫혀 있다. 막이
// 휜 만큼 안쪽 공기를 누르므로 더 굽은(작은) 거품 안의 압력이 더 크다. 밸브를 열면
// 작은 거품이 큰 거품 쪽으로 쪼그라든다 — 작아질수록 더 굽어 더 세게 밀어 걷잡을 수
// 없이 빨라지고, 반구를 지나 막이 펴지다가 두 막의 휜 정도가 같아지면 멈춘다.
//
// 막이 바늘을 떠받치는 당김(`surface-tension`)은 앞 조각의 몫이고, 막이 벽에 닿는 각
// (`wetting-and-contact-angle`)은 뒤 조각의 몫이다. 이 조각은 「굽을수록 안이 세게
// 눌린다」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:laplace-pressure` 와 문자 그대로 일치한다 (C4). */
export const LAPLACE_PRESSURE_ID = 'laplace-pressure';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 관 입 지름 정도를 잰 임의 단위, 압력은 표면 장력 γ 를 1 로 잰 단위다.
// ------------------------------------------------------------------------

/** 표면 장력 γ. 비누막은 겉 · 속 두 면이라 안팎 압력차가 4γ/R 이다. */
export const TENSION = 1;
/** 관 입의 반지름 a. 거품은 이 입 위에 얹힌 구면 캡이다. */
export const MOUTH_RADIUS = 0.3;
/** 처음 작은 거품의 반지름. */
export const SMALL_RADIUS = 0.55;
/** 처음 큰 거품의 반지름. */
export const LARGE_RADIUS = 1.0;
/**
 * 관의 전도도 k — 압력차 1 이 1 초에 옮기는 공기 부피. dV/dt = −k·(p작 − p큰).
 * 흐름 단계 안에 작은 거품이 다 쪼그라드는 빠르기로 골랐다.
 */
export const CONDUCTANCE = 0.03;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 두 관 입의 가로 자리(작은 거품 · 큰 거품). */
export const SMALL_X = -1.7;
export const LARGE_X = 1.7;
/** 관 가로 토막의 가운데 높이. 관 입은 y = 0 이다. */
export const PIPE_Y = -0.95;
/** 압력 화살표 길이 = 압력 × 이 배율. 두 화살표가 같은 배율이라 길이끼리 견준다. */
export const PRESSURE_SCALE = 0.11;
/** 공기 흐름 획의 빠르기 = 옮기는 부피 빠르기 × 이 배율(월드/초). */
export const FLOW_SPEED_SCALE = 14;

/**
 * 프레이밍은 주장의 일부다. 세로는 관 바닥 아래부터 부푼 큰 거품 꼭대기 위(캡션 줄 포함)
 * 까지, 가로는 작은 거품 왼쪽 끝부터 큰 거품 오른쪽 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.5, maxX: 2.95, minY: -1.45, maxY: 2.35 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 (초)
// ------------------------------------------------------------------------

export const CLOSED = 3.4;
export const OPEN = 0.7;
export const FLOW = 5.0;
export const REST = 3.2;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const laplacePressureMessages = Object.freeze({
  'label.title': { ko: '라플라스 압력', en: 'Laplace pressure' },
  'label.stage': { ko: '이어진 두 거품', en: 'Two connected bubbles' },
  'label.view': { ko: '단면', en: 'Cross-section' },
  /** 화살표 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.pressure': { ko: 'Δp', en: 'Δp' },
  'caption.closed': {
    ko: '크기만 다른 비누 거품 둘 — 밸브가 닫혀 있고, 작은 거품 안의 공기가 더 세게 민다',
    en: 'Two soap bubbles that differ only in size — the valve is shut, and the air in the small one pushes harder',
  },
  'caption.flow': {
    ko: '밸브를 열자 작은 거품이 큰 거품 쪽으로 쪼그라든다',
    en: 'Open the valve and the small bubble empties into the large one',
  },
  'caption.rest': {
    ko: '두 거품 안의 압력이 같아지자 멈춘다 — 작은 쪽은 거의 평평한 막만 남았다',
    en: 'It stops once the pressures inside match — only a nearly flat film is left of the small one',
  },
} satisfies Record<string, LocalizedText>);

export type LaplacePressureMessageKey = keyof typeof laplacePressureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LaplacePressureMessageKey): LocalizedText => laplacePressureMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LaplacePressureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const laplacePressureSchema: BundleSchema = {
  id: LAPLACE_PRESSURE_ID,
  title: text('label.title'),
  category: 'fluids',
  timeModel: 'periodic',

  // 조작기가 없다 — 닫힌 채 견주고, 열리고, 쪼그라들고, 멈춘다.
  parameters: [],

  stages: [
    {
      id: 'two-bubbles',
      label: text('label.stage'),
      constants: {
        tension: TENSION,
        mouthRadius: MOUTH_RADIUS,
        smallRadius: SMALL_RADIUS,
        largeRadius: LARGE_RADIUS,
        conductance: CONDUCTANCE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 세로 3.8 을 담는다. 큰 거품이 위로 솟아 기본(360)보다 조금 높인다. */
  canvas: { height: 400, minHeight: 330 },

  /**
   * 겹침이 판정 장치다. 공기 면 → 관 벽 → 흐름 → 막 선 → 밸브 → 압력 화살표 순서로
   * 쌓아야 화살표가 흐름 획 위에서 읽히고, 막 선이 공기 면 위로 그어진다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 닫힌 채 견줌 → 밸브 열림 → 흐름 → 멈춤 → 흐려짐.
   *
   * 흐름은 `linear` 다 — 이 단계의 진행도는 물리 시계(흐른 초)로 쓰인다. 빨라지고 느려지는
   * 것은 이징이 아니라 압력차가 정한다.
   */
  timeline: {
    phases: [
      { id: 'closed', duration: CLOSED, caption: key('caption.closed') },
      { id: 'open', duration: OPEN, ease: 'smooth', caption: key('caption.flow') },
      { id: 'flow', duration: FLOW, caption: key('caption.flow') },
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'fade', duration: FADE, caption: key('caption.rest') },
    ],
  },

  /** 도착한 순간 이미 두 거품이 견주고 있다 — 캡션을 읽을 시간은 남긴다. */
  startAt: 0.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 오른쪽 위는 큰 거품이 솟고, 작은 거품 위 왼쪽이 비어 있다.
  caption: {
    anchor: { screen: 'top-left', offset: [12, 10] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 280,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **두 화살표의 길이 비**와
   * 거품의 크기 변화다.
   */

  messages: laplacePressureMessages,
};
