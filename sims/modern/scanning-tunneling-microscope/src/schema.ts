// ========================================================================
// scanning-tunneling-microscope — 선언
// ========================================================================
// 질문: 빛으로는 볼 수 없는 원자 하나하나를 어떻게 그릴 수 있는가.
//
// 답: 뾰족한 탐침과 표면 사이의 진공 틈을 전자가 터널로 건너는데, 그 전류는 틈이 `decadeGap`(기본
// 0.1 nm) 좁아질 때마다 약 10 배가 될 만큼 틈에 민감하다. 캡션의 그 값은 state 를 거쳐 스테이지
// 상수에서 끼운다(G133 우회로). 전류를 일정하게 유지하도록 탐침 높이를
// 조절하며 표면을 훑으면, 탐침은 원자 윤곽을 따라 오르내리고 그 높이 기록이 원자 하나하나를
// 그린다.
//
// 이웃 `quantum-tunneling`(장벽 투과가 두께에 지수적)과 겹치지 않는다 — 거기서는 파동이 장벽을
// 지나는 모양을 보이고, 여기서는 그 지수적 민감함을 **도구로 써서 표면을 그린다.** 파동 묶음 ·
// |ψ|² 는 두지 않고, 전류는 틈을 건너는 전자 점의 잦기로 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:scanning-tunneling-microscope` 와 문자 그대로 일치한다 (C4). */
export const SCANNING_TUNNELING_MICROSCOPE_ID = 'scanning-tunneling-microscope';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 nm. 가로 = 표면을 따라간 자리, 세로 = 높이.
// ------------------------------------------------------------------------

/** 표면 원자 간격(nm). */
export const LATTICE_SPACING = 0.5;
/** 표면 원자 반지름(nm). 틈은 원자 겉면에서 잰다. */
export const ATOM_RADIUS = 0.2;
/** 탐침 끝 원자 반지름(nm). */
export const TIP_RADIUS = 0.12;
/** 맨 윗줄 원자 수. 가운데가 x = 0 이다. */
export const ATOM_COUNT = 11;
/** 터널 전류가 10 배 바뀌는 틈의 변화(nm) — 전류 ∝ 10^(−틈 / 이 값). */
export const DECADE_GAP = 0.1;
/** 접근 단계의 세 틈(nm) — 멀리 · 한 칸 가까이 · 맞춤값. 이웃한 둘의 차가 `decadeGap` 이다. */
export const GAP_FAR = 0.5;
export const GAP_MID = 0.4;
export const GAP_SET = 0.3;
/** 틈이 맞춤값일 때 초당 틈을 건너는 전자 점 수 — 그림의 전류 한 단위. */
export const ELECTRON_RATE = 28;
/** 전자 점 하나가 틈을 건너는 데 걸리는 그림 시간(초). */
export const CROSS_TIME = 0.26;
/** 훑기 처음 · 끝 자리(nm) — 둘 다 원자 바로 위다. */
export const SCAN_START = -2;
export const SCAN_END = 2;
/**
 * 기록 띠의 세로 배율. 원자 사이에서 탐침이 내려가는 깊이는 약 0.03 nm 라 제 크기로는 화면에서
 * 몇 픽셀이다. 기록만 이 배수로 키우고 이름표에 `×{gain}` 으로 알린다 (NOTES (b)).
 */
export const RECORD_GAIN = 4;
/**
 * 크기가 다른 원자 하나 — 윗줄 왼쪽에서 센 번호(0 부터)와 그 반지름(nm). 겉면이 낮아 기록에 낮은
 * 봉우리로 드러난다. 기록이 원자의 줄무늬가 아니라 **원자 하나하나**라는 것을 보이는 표지다.
 */
export const IMPURITY_INDEX = 7;
export const IMPURITY_RADIUS = 0.15;
/** 전자 점의 방출 시각 · 옆 흔들림 · 떨어질 원자를 뽑는 결정적 난수의 시드. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(nm)
// ------------------------------------------------------------------------

/** 아랫줄 원자가 윗줄 아래로 내려간 거리. 반 칸 어긋나 놓인다. */
export const SUBLAYER_DROP = 0.42;
/** 탐침 쐐기의 높이(끝 원자 중심에서 쐐기 윗변까지). */
export const TIP_HEIGHT = 0.6;
/** 기록 띠의 기준선 높이 — 탐침이 원자 바로 위에 있을 때 기록이 그리는 자리. */
export const RECORD_BASE = 1.85;
/** 기록지(옅은 띠)의 기준선 위 · 아래 여백. */
export const RECORD_PAPER_ABOVE = 0.1;
export const RECORD_PAPER_BELOW = 0.36;
/** 기록지가 훑기 구간 양옆으로 더 나간 거리. */
export const RECORD_PAPER_MARGIN = 0.12;

/**
 * 프레이밍 — 가로는 윗줄 원자와 틈 이름표(탐침이 끝까지 갔을 때), 아래는 아랫줄 원자와 캡션 자리,
 * 위는 기록지와 그 위 이름표. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.9, maxX: 2.9, minY: -1.0, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const scanningTunnelingMicroscopeMessages = Object.freeze({
  'label.title': { ko: '주사 터널 현미경', en: 'Scanning tunneling microscope' },
  'label.stage': { ko: '원자 한 줄을 훑는 탐침', en: 'A tip scanning a row of atoms' },
  'label.view': { ko: '탐침과 높이 기록', en: 'Tip and height record' },

  /** 틈 — 값이 끼는 조립문이라 문안이다 (C1). */
  'label.gap': { ko: '{g} nm', en: '{g} nm' },
  /** 전자 기호 — 표식이라 두 언어가 같다 (C1). */
  'label.electron': { ko: 'e⁻', en: 'e⁻' },
  /** 기록 띠 이름표 — 세로 배율을 함께 알린다. */
  'label.record': { ko: '탐침 높이 기록 (세로 ×{gain})', en: 'Tip height record (vertical ×{gain})' },

  'caption.far': {
    ko: '탐침 끝과 표면 원자 사이는 진공이다. 틈이 넓으면 그 틈을 터널로 건너는 전자가 거의 없다.',
    en: 'Between the tip and the surface atoms is vacuum. With a wide gap, almost no electrons tunnel across it.',
  },
  'caption.closer': {
    ko: '틈이 {gap} nm 좁아질 때마다 틈을 건너는 전자 — 터널 전류 — 가 약 10 배로 는다.',
    en: 'Each time the gap narrows by {gap} nm, the electrons crossing it — the tunneling current — grow about tenfold.',
  },
  'caption.scan': {
    ko: '전류가 늘 같도록 탐침을 올리고 내리며 표면을 훑는다. 그 높이가 위에 기록된다.',
    en: 'The tip scans the surface, rising and falling so the current stays the same. Its height is recorded above.',
  },
  'caption.image': {
    ko: '기록의 봉우리 하나가 원자 하나다 — 크기가 작은 원자 하나까지 낮은 봉우리로 드러난다.',
    en: 'Each bump in the record is one atom — even the one smaller atom shows up as a lower bump.',
  },
} satisfies Record<string, LocalizedText>);

export type ScanningTunnelingMicroscopeMessageKey = keyof typeof scanningTunnelingMicroscopeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: ScanningTunnelingMicroscopeMessageKey): LocalizedText =>
  scanningTunnelingMicroscopeMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ScanningTunnelingMicroscopeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const scanningTunnelingMicroscopeSchema: BundleSchema = {
  id: SCANNING_TUNNELING_MICROSCOPE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 손댈 만한 것(틈)은 접근 단계가 세 값으로 이미 보인다 — 슬라이더로
  // 틈을 밀면 「한 칸에 10 배」 를 전자 점의 잦기로 기억해 견주어야 한다.
  parameters: [],

  stages: [
    {
      id: 'atom-row',
      label: text('label.stage'),
      constants: {
        latticeSpacing: LATTICE_SPACING,
        atomRadius: ATOM_RADIUS,
        tipRadius: TIP_RADIUS,
        atomCount: ATOM_COUNT,
        decadeGap: DECADE_GAP,
        gapFar: GAP_FAR,
        gapMid: GAP_MID,
        gapSet: GAP_SET,
        electronRate: ELECTRON_RATE,
        crossTime: CROSS_TIME,
        scanStart: SCAN_START,
        scanEnd: SCAN_END,
        impurityIndex: IMPURITY_INDEX,
        impurityRadius: IMPURITY_RADIUS,
        recordGain: RECORD_GAIN,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tip-and-record', label: text('label.view'), default: true }],

  /** 원자 두 줄 · 탐침 · 기록 띠가 위아래로 선다. 아래 캡션 한 줄 반. */
  canvas: { height: 420, minHeight: 360 },

  /** 기록지 · 원자 · 탐침을 먼저, 그 위에 전자 · 틈 표시, 맨 위에 기록 곡선과 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 16.6 초.
   *
   * `far` · `mid` · `set` 은 탐침이 첫 원자 위에 멈춰 있는 세 틈이고, `step1` · `step2` 는 그 사이를
   * 한 칸(`decadeGap`)씩 내려가는 동안이다. 틈을 건너는 전자 점의 잦기가 칸마다 약 10 배가 된다.
   * `scan` 동안 탐침이 같은 빠르기로 `scanStart` 에서 `scanEnd` 로 가며, 전류가 맞춤값에 머물도록
   * 높이를 바꾼다 — 그 높이가 기록 띠에 자란다. `image` 는 다 그린 기록을 두고, `fade` 에서
   * 탐침과 기록이 흐려진 뒤 `enter` 에서 탐침이 처음 자리에 다시 나타난다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 0.6, ease: 'smooth', caption: key('caption.far') },
      { id: 'far', duration: 1.8, caption: key('caption.far') },
      { id: 'step1', duration: 0.7, caption: key('caption.closer') },
      { id: 'mid', duration: 1.6, caption: key('caption.closer') },
      { id: 'step2', duration: 0.7, caption: key('caption.closer') },
      { id: 'set', duration: 1.6, caption: key('caption.closer') },
      { id: 'scan', duration: 6.6, caption: key('caption.scan') },
      { id: 'image', duration: 2.2, caption: key('caption.image') },
      { id: 'fade', duration: 0.8, ease: 'smooth', caption: key('caption.image') },
    ],
  },

  /** 도착한 순간 탐침이 이미 첫 원자 위에 떠 있다. */
  startAt: 0.9,

  /** 슬롯 하나. 아랫줄 원자 밑 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    /** 「틈이 {gap} nm」 — 스테이지 상수 `decadeGap` 을 `initialState` 가 글자로 옮긴 자리 (G133 우회로). */
    vars: { gap: 'decadeGap' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 월드 거리가 아니라 기록의 봉우리다.

  messages: scanningTunnelingMicroscopeMessages,
};
