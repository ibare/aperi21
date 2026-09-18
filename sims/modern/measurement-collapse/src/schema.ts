// ========================================================================
// measurement-collapse — 선언
// ========================================================================
// 질문: 퍼져 있던 입자를 재면 무슨 일이 일어나는가.
//
// 답: 재는 순간 결과는 한 자리다. 그 직후 상태는 더 이상 넓게 퍼진 모양이 아니라
// 그 자리에 모인 좁은 묶음이고, 곧바로 다시 재면 같은 자리가 나온다. 어느 자리가
// 나올지는 주기마다 다르다(같은 퍼진 상태를 새로 준비해 잰다).
//
// 이웃과 나눈 몫 — |ψ|² 모양으로 점이 쌓이는 것은 `wave-function`, 두 상태가 겹쳐
// 분포가 출렁이는 것은 `superposition-quantum` 이다. 여기에는 점 모음도 출렁임도 없다.
// 한 번의 측정이 상태를 바꾸는 순간 하나만 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:measurement-collapse` 와 문자 그대로 일치한다 (C4). */
export const MEASUREMENT_COLLAPSE_ID = 'measurement-collapse';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
//
// 재기 전 분포 |ψ|² 는 가우스 봉우리 둘을 몫대로 더한 모양이다(길이 단위). 측정 직후
// 상태는 결과 자리에 선 폭 `collapseWidth` 의 가우스 묶음이다 — 이 폭이 측정의 분해능이다.
// ------------------------------------------------------------------------

/** 왼쪽 봉우리의 가운데 · 폭(표준 편차) · 몫. */
export const LEFT_CENTER = -1.5;
export const LEFT_WIDTH = 0.7;
export const LEFT_WEIGHT = 0.45;
/** 오른쪽 봉우리의 가운데 · 폭 · 몫. 두 몫은 코드가 합이 1 이 되게 나눈다. */
export const RIGHT_CENTER = 1.4;
export const RIGHT_WIDTH = 0.85;
export const RIGHT_WEIGHT = 0.55;
/** 측정 직후 묶음의 폭(표준 편차) — 측정의 분해능. */
export const COLLAPSE_WIDTH = 0.3;
/**
 * 측정 결과를 뽑는 시드. 주기 번호가 섞여 주기마다 다른 자리가 나온다 — 29 는 첫 주기가
 * 왼쪽 봉우리, 다음 주기가 오른쪽 봉우리에 떨어지는 시드다.
 */
export const SEED = 29;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 위는 |ψ|² 판, 아래는 측정 결과 두 줄(첫 측정 · 다시 잰 것).
// ------------------------------------------------------------------------

/** 보이는 x 범위의 반(길이 단위). */
export const X_HALF = 4;
/** x 한 단위의 월드 가로. */
export const X_SCALE = 2.5;
/**
 * 측정 직후 좁은 묶음의 꼭대기가 닿는 높이(축에서). 넓은 분포도 **같은 배율**을 쓴다 —
 * 두 모양의 넓이(확률 1)가 같아야 「퍼져 있던 몫이 한 자리로 모였다」 가 참이다.
 */
export const NARROW_PEAK_H = 6.5;
/** 측정 섬광이 시작하는 높이 — 좁은 묶음 꼭대기 위. */
export const FLASH_TOP = 7.1;
/** 측정 결과 두 줄의 높이. 첫 측정 줄이 위, 다시 잰 줄이 바로 아래다. */
export const ROW_FIRST_Y = -1.0;
export const ROW_AGAIN_Y = -1.9;
/** 판 기호 · 줄 이름표가 축 왼쪽 끝에서 떨어진 거리(월드). */
export const LABEL_GAP = 0.5;

/**
 * 프레이밍 — 왼쪽은 줄 이름표, 위는 좁은 묶음 꼭대기와 섬광 시작점, 아래는 결과 두 줄과
 * 캡션 한 줄(캡션 자리가 프레이밍에 잡히지 않아 경계로 비운다 — 장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -15.2, maxX: 10.8, minY: -3.6, maxY: 7.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const measurementCollapseMessages = Object.freeze({
  'label.title': { ko: '측정과 붕괴', en: 'Measurement and collapse' },
  'label.operation': { ko: '관측이 상태를 정하는 것', en: 'How observing settles the state' },
  'label.stage': { ko: '두 봉우리로 퍼진 상태', en: 'State spread over two lobes' },
  'label.view': { ko: '분포와 측정 결과', en: 'Distribution and results' },

  /** 판 기호 — 수식 표식이라 두 언어가 같다 (C1 판정 3). */
  'label.prob': { ko: '|ψ|²', en: '|ψ|²' },
  /** 결과 줄 이름. 조사가 붙는 낱말이라 문안이다 (C1 판정 4). */
  'label.first': { ko: '첫 측정', en: 'first' },
  'label.again': { ko: '다시 잰 값', en: 'again' },

  'caption.ready': {
    ko: '재기 전 — 입자가 있을 곳이 두 봉우리로 넓게 퍼져 있다',
    en: 'Before measuring — where the particle may be is spread over two wide lobes',
  },
  'caption.measure': {
    ko: '재는 순간 결과는 한 자리다',
    en: 'The moment it is measured, the result is one spot',
  },
  'caption.collapse': {
    ko: '측정 직후 상태는 그 자리에 모인 좁은 묶음이다 — 퍼져 있던 몫이 모두 그리로 모였다',
    en: 'Right after, the state is a narrow bundle at that spot — all of the spread has gathered there',
  },
  'caption.again': {
    ko: '곧바로 다시 재면 같은 자리가 나온다',
    en: 'Measure again right away and the same spot comes up',
  },
  'caption.prepare': {
    ko: '같은 퍼진 상태를 새로 준비한다',
    en: 'The same spread-out state is prepared afresh',
  },
} satisfies Record<string, LocalizedText>);

export type MeasurementCollapseMessageKey = keyof typeof measurementCollapseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MeasurementCollapseMessageKey): LocalizedText => measurementCollapseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MeasurementCollapseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const measurementCollapseSchema: BundleSchema = {
  id: MEASUREMENT_COLLAPSE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행이 측정 · 붕괴 · 다시 재기를 모두 지나가고, 주기마다 새 결과가
  // 나온다. 「재 보기」 단추를 두어도 자동 주기가 이미 보이는 것 말고 새로 해 볼 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'two-lobes',
      label: text('label.stage'),
      constants: {
        leftCenter: LEFT_CENTER,
        leftWidth: LEFT_WIDTH,
        leftWeight: LEFT_WEIGHT,
        rightCenter: RIGHT_CENTER,
        rightWidth: RIGHT_WIDTH,
        rightWeight: RIGHT_WEIGHT,
        collapseWidth: COLLAPSE_WIDTH,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 판 하나와 결과 두 줄. 아래 캡션 한 줄. */
  canvas: { height: 380, minHeight: 320 },

  /** 축 · 줄을 먼저, 분포를 그 위에, 섬광 · 결과 원을 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 11.3 초.
   *
   * - `prepare` — 넓게 퍼진 분포가 떠오른다. `ready` — 그대로 둔다.
   * - `measure` — 강조색 섬광이 결과 자리에 떨어지고, 첫 측정 줄에 결과 원이 선다.
   * - `collapse` — 분포가 넓이를 지키며 그 자리의 좁은 묶음으로 모인다. 넓었던 모양은
   *   옅은 점선으로 남는다. `hold` — 그대로 둔다.
   * - `remeasure` — 두 번째 섬광이 떨어지고 다시 잰 줄에 원이 선다 — 첫 원 바로 아래.
   * - `again` — 두 원이 한 세로줄에 선 채 둔다.
   * - `clear` — 모두 걷힌다. 다음 주기는 같은 퍼진 상태를 새로 준비해 잰다.
   */
  timeline: {
    phases: [
      { id: 'prepare', duration: 0.8, ease: 'smooth', caption: key('caption.prepare') },
      { id: 'ready', duration: 2.6, caption: key('caption.ready') },
      { id: 'measure', duration: 0.6, ease: 'smooth', caption: key('caption.measure') },
      { id: 'collapse', duration: 0.7, ease: 'smooth', caption: key('caption.collapse') },
      { id: 'hold', duration: 2.2, caption: key('caption.collapse') },
      { id: 'remeasure', duration: 0.6, ease: 'smooth', caption: key('caption.collapse') },
      { id: 'again', duration: 3.0, caption: key('caption.again') },
      { id: 'clear', duration: 0.8, ease: 'smooth', caption: key('caption.prepare') },
    ],
  },

  /** 도착한 순간 퍼진 분포가 떠 있고, 1 초 뒤 첫 측정이 떨어진다. */
  startAt: 2.4,

  /** 슬롯 하나. 결과 줄 아래 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 축 눈금도 없다 — 재는 것은 자리가 같은지이지 값이 아니다.

  messages: measurementCollapseMessages,
};
