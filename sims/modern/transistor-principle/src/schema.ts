// ========================================================================
// transistor-principle — 선언
// ========================================================================
// 질문: 트랜지스터는 어떻게 작은 전류 하나로 큰 전류를 켜고 끄고, 그 양까지 정하는가?
//
// 답: npn 트랜지스터는 n형(이미터) · 얇은 p형(베이스) · n형(컬렉터)이 이어 붙은 막대다. 베이스로
// 전류를 흘려 넣지 않으면 이미터의 전자가 베이스를 건너지 못해 이미터-컬렉터 사이에 전류가 없다.
// 베이스로 작은 전류를 흘려 넣으면 이미터의 전자가 얇은 베이스를 건너 컬렉터로 쏟아지고, 그 전류는
// 베이스 전류의 β 배(예 100 배)다. 베이스 전류를 두 배로 하면 컬렉터 전류도 두 배, 끊으면 멎는다.
//
// 화면에서는 왼쪽 막대 안의 전자가 베이스 전류에 비례한 빠르기로 이미터 → 컬렉터로 흐르고, 오른쪽
// 같은 눈금의 두 막대에서 베이스 전류(거의 보이지 않는 한 줄)와 컬렉터 전류(높은 막대)가 함께 자란다.
//
// 공핍층이 생기고 얇아지는 그림은 `pn-junction`, 전류-전압 곡선과 빛은 `diode-and-led` 의 몫이라
// 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:transistor-principle` 와 문자 그대로 일치한다 (C4). */
export const TRANSISTOR_PRINCIPLE_ID = 'transistor-principle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전류 증폭률 β = 컬렉터 전류 / 베이스 전류. 화면에 `×100` 으로 뜬다. */
export const BETA = 100;
/** 처음 흘려 넣는 베이스 전류 · 두 배로 늘린 베이스 전류(mA). 화면에 `0.1 mA` · `0.2 mA` 로 뜬다. */
export const BASE_CURRENT_LOW = 0.1;
export const BASE_CURRENT_HIGH = 0.2;
/**
 * 그때의 컬렉터 전류(mA). 화면에 `10 mA` · `20 mA` 로 뜬다 — β × 베이스 전류를 계산해 띄우면
 * `String(100 * 0.1)` 이 `10.000000000000002` 가 되므로 표시값을 따로 선언한다. 베이스 전류 · β 와 함께
 * 바꾼다 (NOTES (c) G143). 막대 높이는 β × 베이스 전류에서 나오고, 두 막대 눈금의 꼭대기가
 * `COLLECTOR_CURRENT_HIGH` 다.
 */
export const COLLECTOR_CURRENT_LOW = 10;
export const COLLECTOR_CURRENT_HIGH = 20;
/**
 * 베이스 전류가 `BASE_CURRENT_HIGH` 일 때 전자가 흐르는 화면 속력(월드/초). 흐르는 빠르기는 베이스
 * 전류에 비례한다. 실제 표류 속도를 보이게 한 **표현값**이라 화면에 알리지 않는다 (NOTES b).
 */
export const FLOW_SPEED = 1.5;
/** 전자의 열 흔들림 — 진폭(월드) · 진동수(Hz). 멈춰 있어도 자유 전자로 읽히게 한다. */
export const JITTER = 0.05;
export const JITTER_HZ = 0.8;
/** 흔들림 위상을 뽑는 시드. 같은 시각은 언제나 같은 화면이다 (S-sim). */
export const SEED = 11;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 막대 반높이(월드). */
export const BAR_HALF_H = 0.8;
/** 이미터 · 베이스 · 컬렉터의 왼쪽 끝과 컬렉터 오른쪽 끝(월드 x). 베이스가 얇다. */
export const EMITTER_X0 = -6.0;
export const BASE_X0 = -2.3;
export const BASE_X1 = -1.7;
export const COLLECTOR_X1 = 2.0;
/** 전극 판의 너비(월드). 막대 양 끝에 붙는다. */
export const PLATE_W = 0.22;
/** 베이스 도선의 윗끝(월드 y). */
export const LEAD_TOP = 1.75;
/** 전자 줄 수 · 줄 간격(월드) · 한 줄의 전자 간격(월드, 대략값 — 막대 길이에 맞춰 나눈다). */
export const ROWS = 3;
export const ROW_GAP = 0.45;
export const SLOT = 0.4;

/** 전류 막대 — 바닥 높이 · 눈금 전체 높이 · 막대 너비(월드) · 두 막대의 가운데 x. */
export const METER_BASE_Y = -1.25;
export const METER_H = 3.0;
export const METER_W = 1.1;
export const BASE_METER_X = 3.7;
export const COLLECTOR_METER_X = 5.85;

/**
 * 프레이밍 — 왼쪽 막대 · 위 베이스 도선 · 오른쪽 두 막대, 아래에 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -6.7, maxX: 6.7, minY: -2.75, maxY: 2.3 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const transistorPrincipleMessages = Object.freeze({
  'label.title': { ko: '트랜지스터', en: 'Transistor' },
  'label.operation': { ko: '작은 신호가 큰 전류를 제어', en: 'A small signal controls a large current' },
  'label.stage': { ko: 'npn 트랜지스터', en: 'npn transistor' },
  'label.view': { ko: '소자 단면과 두 전류', en: 'Device cross-section and two currents' },

  /** 세 부분의 이름. */
  'label.emitter': { ko: '이미터', en: 'emitter' },
  'label.base': { ko: '베이스', en: 'base' },
  'label.collector': { ko: '컬렉터', en: 'collector' },
  /** 반도체 종류 기호. 표식이라 번역 대상이 아니다 (C1 판정 2). */
  'label.n': { ko: 'n', en: 'n' },
  'label.p': { ko: 'p', en: 'p' },

  /** 두 전류 막대의 이름. */
  'label.baseCurrent': { ko: '베이스 전류', en: 'base current' },
  'label.collectorCurrent': { ko: '컬렉터 전류', en: 'collector current' },
  /** 전류값. 값은 스테이지 상수, 단위는 표식이다 (C1 판정 3). */
  'label.ma': { ko: '{v} mA', en: '{v} mA' },
  'label.zero': { ko: '0 mA', en: '0 mA' },
  /** 두 전류의 배율. 값은 스테이지 상수 β. */
  'label.ratio': { ko: '×{beta}', en: '×{beta}' },

  'caption.off': {
    ko: '베이스로 흘려 넣는 전류가 없으면 이미터의 전자(●)는 얇은 베이스를 건너지 못한다 — 컬렉터 쪽에도 전류가 없다.',
    en: 'With no current fed into the base, the emitter’s electrons (●) cannot cross the thin base — no current reaches the collector either.',
  },
  'caption.on': {
    ko: '베이스로 작은 전류를 흘려 넣자 이미터의 전자가 베이스를 건너 컬렉터로 쏟아진다 — 컬렉터 전류가 베이스 전류보다 훨씬 크다.',
    en: 'Feed a small current into the base and the emitter’s electrons pour across it into the collector — the collector current is far larger than the base current.',
  },
  'caption.up': {
    ko: '베이스 전류를 두 배로 늘리면 컬렉터 전류도 두 배가 된다 — 작은 전류가 큰 전류의 양을 정한다.',
    en: 'Double the base current and the collector current doubles too — the small current sets the size of the large one.',
  },
  'caption.cut': {
    ko: '베이스 전류를 끊으면 큰 전류도 함께 멎는다.',
    en: 'Cut the base current and the large current stops with it.',
  },
} satisfies Record<string, LocalizedText>);

export type TransistorPrincipleMessageKey = keyof typeof transistorPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TransistorPrincipleMessageKey): LocalizedText => transistorPrincipleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TransistorPrincipleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const transistorPrincipleSchema: BundleSchema = {
  id: TRANSISTOR_PRINCIPLE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'npn',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        baseCurrentLow: BASE_CURRENT_LOW,
        baseCurrentHigh: BASE_CURRENT_HIGH,
        collectorCurrentLow: COLLECTOR_CURRENT_LOW,
        collectorCurrentHigh: COLLECTOR_CURRENT_HIGH,
        flowSpeed: FLOW_SPEED,
        jitter: JITTER,
        jitterHz: JITTER_HZ,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'device', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 막대 · 오른쪽 두 전류 막대. 세로는 전류 막대 높이와 캡션이 정한다. */
  canvas: { height: 330, minHeight: 300 },

  /** 쓴 순서대로 겹친다 — 막대 · 도선 · 전자 · 전류 막대 · 이름표. */
  drawOrder: 'scene',

  /** 도착한 순간 전자가 이미 막대 안에서 흔들리며 기다리고 있다 (S-piece). */
  startAt: 0.6,

  /**
   * 한 주기 12.2 초. 단계의 길이 · 순서가 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `off` — 베이스 전류 0. 전자는 이미터 · 컬렉터에서 흔들리기만 하고 베이스에는 아무것도 없다.
   * - `onIn` · `on` — 베이스 전류가 `baseCurrentLow` 로 오르고 전자가 이미터 → 컬렉터로 흐른다.
   * - `upIn` · `up` — 베이스 전류가 `baseCurrentHigh` 로 두 배가 되고 흐름도 두 배 빨라진다.
   * - `offIn` · `offEnd` — 베이스 전류를 끊는다. 흐름이 멎는다.
   *
   * 오르내리는 단계(`onIn` · `upIn` · `offIn`)는 `linear` 다 — 흐른 거리를 전류의 적분으로 계산하는데
   * `TimelineFrame` 이 지금 시각의 진행도만 주므로, 지난 시각의 진행도를 시간표 경계에서 직접 센다
   * (NOTES (c) 새 부족). 이징을 바꾸면 적분과 막대가 어긋난다.
   */
  timeline: {
    phases: [
      { id: 'off', duration: 2.2, caption: key('caption.off') },
      { id: 'onIn', duration: 0.8, ease: 'linear', caption: key('caption.on') },
      { id: 'on', duration: 3.2, caption: key('caption.on') },
      { id: 'upIn', duration: 0.8, ease: 'linear', caption: key('caption.up') },
      { id: 'up', duration: 3.0, caption: key('caption.up') },
      { id: 'offIn', duration: 0.6, ease: 'linear', caption: key('caption.cut') },
      { id: 'offEnd', duration: 1.6, caption: key('caption.cut') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: transistorPrincipleMessages,
};
