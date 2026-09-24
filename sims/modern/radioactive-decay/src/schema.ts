// ========================================================================
// radioactive-decay — 선언
// ========================================================================
// 질문: 반감기가 지나 절반이 붕괴했다면, 남은 절반은 다음 반감기에 전부 붕괴하는가?
//
// 아니다 — 남은 것이 다시 절반이 된다. 원자 400개가 각자 지수 분포 수명을 갖고,
// 오른쪽 곡선의 반감기 구간마다 「그 구간을 시작할 때의 절반」 목표선이 새로 생긴다.
//
// 원본: tasks/piece-lab/radioactive-decay (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radioactive-decay` 와 문자 그대로 일치한다 (C4). */
export const RADIOACTIVE_DECAY_ID = 'radioactive-decay';

// ------------------------------------------------------------------------
// 원본 상수 (index.html 그대로)
// ------------------------------------------------------------------------

/** 원자 수 (20 × 20). */
export const N = 400;
export const COLS = 20;
/** 반감기(초). */
export const HALF = 2.0;
/** 한 순환에 보여 주는 반감기 수. */
export const SPAN = 5;
/** 다섯 번째 반감기 뒤 멈춰 보여 주는 시간(초). */
export const HOLD = 2.0;
/** 도착한 순간 이미 붕괴가 진행 중이도록 시계를 앞당기는 양(초). */
export const OFFSET = 0.6;
/** 방금 붕괴한 원자를 표시하는 시간(초). */
export const FLASH = 0.4;
/** 난수 시드. 원본 조각 도구의 기본 시드와 같다 — 같은 시각은 같은 원자가 붕괴한다. */
export const SEED = 1;

/** 반감기 구간 단계 id. 시간표와 scene 이 같은 이름을 쓴다. */
export const HALF_PHASES = ['half-1', 'half-2', 'half-3', 'half-4', 'half-5'] as const;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 픽셀(가로 868 · 세로 300, y 아래)을 그대로 월드로 쓴다
// ------------------------------------------------------------------------

/** 원본 캔버스 세로(px). 월드 y 는 이것에서 뺀 값이다. */
export const CANVAS_H = 300;
/** 원본 캔버스 가로(px). 촬영 창 900 px 에서 여백 16 px 두 번을 뺀 값. */
export const CANVAS_W = 868;

/** 왼쪽 원자 격자. */
export const GRID = { box: 270, x: 10, y: (CANVAS_H - 270) / 2 } as const;

/** 오른쪽 곡선 판. 위 = N, 아래 = 0. */
export const PLOT = {
  x0: GRID.x + GRID.box + 56,
  x1: CANVAS_W - 24,
  top: 22,
  bottom: CANVAS_H - 34,
} as const;

/**
 * 고정 경계. 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로
 * 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -34, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radioactiveDecayMessages = Object.freeze({
  'label.title': { ko: '방사성 붕괴', en: 'Radioactive decay' },
  'label.operation': { ko: '반감기와 지수 감소', en: 'Half-life and exponential decay' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 곡선 아래 반감기 경계 이름. */
  'label.halfLife': { ko: '반감기 {n}', en: 'half-life {n}' },
  /** 첫 구간 목표선에만 붙는 글자. */
  'label.halfOfStart': { ko: '시작할 때의 절반', en: 'half of the start' },
  /** 세로축 끝 값 400 · 0. 수는 표식이다 (C1 판정 3). */
  'label.count': { ko: '{v}', en: '{v}' },
  /** 반감기 진행 중 — 화면에 그려진 실제 수를 그대로 쓴다. 난수라 「절반」 이라 단정하지 않는다. */
  'caption.decay': {
    ko: '{n}번째 반감기 — 이 구간을 시작할 때 {start}개였던 원자가 지금 {now}개 남았다',
    en: 'Half-life {n} — of the {start} atoms at the start of this interval, {now} remain now',
  },
  /** 멈춤 구간 — 경계마다 실제 수만 나열한다. */
  'caption.hold': {
    ko: '반감기 경계마다 남은 원자 수: {counts}',
    en: 'Atoms remaining at each half-life boundary: {counts}',
  },
} satisfies Record<string, LocalizedText>);

export type RadioactiveDecayMessageKey = keyof typeof radioactiveDecayMessages;

export const text = (key: RadioactiveDecayMessageKey): LocalizedText => radioactiveDecayMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RadioactiveDecayMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const radioactiveDecaySchema: BundleSchema = {
  id: RADIOACTIVE_DECAY_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행만으로 주장이 끝난다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 300 px + 캡션 한 줄. */
  canvas: { height: 360, minHeight: 330 },

  /** 원본은 그리는 순서가 곧 겹침이다 — 빈자리 위 잔광, 그 위 살아 있는 원자, 눈금 위 곡선. */
  drawOrder: 'scene',

  /** 원본 `OFFSET` — 첫 화면에 이미 붕괴가 일어나고 있다. */
  startAt: OFFSET,

  /**
   * 한 순환 12 초 — 반감기 2 초 × 5 + 멈춤 2 초. 순환마다 새 수명을 뽑는다.
   * 반감기 구간마다 캡션 문장은 같고 수만 바뀐다(이웃 단계가 같은 키라 다시 페이드하지 않는다).
   */
  timeline: {
    phases: [
      ...HALF_PHASES.map((id) => ({ id, duration: HALF, caption: key('caption.decay') })),
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 수는 화면에 그려진 원자 수를 physics 가 문자열로 만들어 둔다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { n: 'caption.n', start: 'caption.start', now: 'caption.now', counts: 'caption.counts' },
  },

  messages: radioactiveDecayMessages,
};
