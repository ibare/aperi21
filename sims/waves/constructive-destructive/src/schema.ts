// ========================================================================
// constructive-destructive — 선언
// ========================================================================
// 질문: 똑같은 두 파동을 겹쳤는데, 왜 어떤 때는 두 배로 커지고 어떤 때는 사라지는가?
//
// 같은 진동수 · 같은 진폭의 두 파동을 한 줄에 겹친다. 둘 사이의 **위상차 하나** 만
// 바뀐다. 위상이 맞으면(Δφ = 0) 마루가 마루를 만나 합이 두 배 진폭으로 출렁이고,
// 반 파장 어긋나면(Δφ = π) 마루가 골을 만나 합이 평평해진다. 그 사이에서는 합의
// 진폭이 2A|cos(Δφ/2)| 로 연속해서 줄어든다.
//
// 펄스가 만나 지나가는 것(superposition) · 두 파원의 무늬(interference)는 이 조각의
// 몫이 아니다. 여기서 움직이는 손잡이는 위상차 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:constructive-destructive` 와 문자 그대로 일치한다 (C4). */
export const CONSTRUCTIVE_DESTRUCTIVE_ID = 'constructive-destructive';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 줄 위의 거리(칸)다. 진폭도 같은 단위라 모양이 찌그러지지 않는다.
// ------------------------------------------------------------------------

/** 두 파동 각각의 진폭(칸). 둘이 같다 — 다르면 π 에서도 합이 0 이 되지 않는다. */
export const AMPLITUDE = 0.75;
/** 두 파동의 파장(칸). 둘이 같다(같은 진동수 · 같은 매질). */
export const WAVELENGTH = 4;
/** 두 파동이 오른쪽으로 흐르는 속력(칸/초). 합도 같은 속력으로 흐른다. */
export const WAVE_SPEED = 0.8;
/** 위상차가 도는 끝값(라디안). π — 마루가 골을 만나는 자리다. */
export const PHASE_MAX = Math.PI;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 위상이 맞은 채 머무는 동안. 두 배로 출렁이는 합을 읽을 시간이다. */
export const IN_PHASE_HOLD = 2.6;
/** 위상차가 0 → π 로 벌어지는 동안. */
export const SLIDE_OUT = 4.4;
/** 반 파장 어긋난 채 머무는 동안. 평평해진 합을 읽을 시간이다. */
export const ANTI_PHASE_HOLD = 2.8;
/** 위상차가 π → 0 으로 돌아오는 동안. */
export const SLIDE_BACK = 3.4;

// ------------------------------------------------------------------------
// 배치 — 월드 칸. 위 줄은 두 파동, 아래 줄은 그 합이다.
// ------------------------------------------------------------------------

/** 줄의 양끝(가로). 네 파장 남짓이 들어간다 — 임베드는 가로로 넓고 세로로 좁다. */
export const STRING_HALF = 8.2;
/** 위 줄(두 파동) · 아래 줄(합)의 평형 높이. */
export const ROW_WAVES_Y = 1.75;
export const ROW_SUM_Y = -1.65;

/**
 * 프레이밍은 주장의 일부다. 가로는 줄 양끝과 오른쪽 표식 자리, 세로는 위 줄 이름표
 * 위부터 아래 줄 가장 깊은 골(−2A) 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -8.6, maxX: 9.1, minY: -4.0, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const constructiveDestructiveMessages = Object.freeze({
  'label.title': { ko: '보강과 상쇄', en: 'Constructive and destructive interference' },
  'label.operation': {
    ko: '위상차가 정하는 합의 크기',
    en: 'How phase difference sets the size of the sum',
  },
  'label.stage': { ko: '같은 두 파동', en: 'Two identical waves' },
  'label.view': { ko: '두 파동과 합', en: 'Two waves and their sum' },
  'label.waves': { ko: '두 파동', en: 'Two waves' },
  'label.sum': { ko: '합', en: 'Sum' },
  /** 진폭 기준선 표식. 수식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.amp': { ko: 'A', en: 'A' },
  'label.ampDouble': { ko: '2A', en: '2A' },
  'caption.inPhase': {
    ko: '위상이 같으면 마루가 마루와 겹쳐 합이 두 배 높이로 출렁인다',
    en: 'In phase, crest lands on crest and the sum swings twice as high',
  },
  'caption.slideOut': {
    ko: '점선 파동이 밀려 위상이 어긋날수록 합이 낮아진다',
    en: 'As the dashed wave slips out of phase, the sum gets smaller',
  },
  'caption.antiPhase': {
    ko: '반 파장 어긋나면 마루가 골을 만나 합이 사라진다',
    en: 'Half a wavelength apart, crest meets trough and the sum vanishes',
  },
  'caption.slideBack': {
    ko: '위상이 다시 맞아 가면 합이 되살아난다',
    en: 'As the waves slide back into phase, the sum grows back',
  },
} satisfies Record<string, LocalizedText>);

export type ConstructiveDestructiveMessageKey = keyof typeof constructiveDestructiveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConstructiveDestructiveMessageKey): LocalizedText =>
  constructiveDestructiveMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConstructiveDestructiveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const constructiveDestructiveSchema: BundleSchema = {
  id: CONSTRUCTIVE_DESTRUCTIVE_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 위상차가 벌어지는 중이고, 0 과 π 에서 한 번씩 머문다.
  parameters: [],

  stages: [
    {
      id: 'identical',
      label: text('label.stage'),
      constants: {
        amplitude: AMPLITUDE,
        wavelength: WAVELENGTH,
        speed: WAVE_SPEED,
        phaseMax: PHASE_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'rows', label: text('label.view'), default: true }],

  /** 가로 17.7 칸 · 세로 7.2 칸. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 기준선이 파동 아래, 점선 파동이 실선 파동 위에 와야 위상이
   * 맞았을 때 두 선이 한 줄로 포개져 보인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 위상 맞음(머묾) → 벌어짐 → 반 파장 어긋남(머묾) → 되돌아옴.
   * 위상차는 `slideOut` 의 진행도만큼 벌어지고 `slideBack` 의 진행도만큼 돌아온다.
   */
  timeline: {
    phases: [
      { id: 'inPhase', duration: IN_PHASE_HOLD, caption: key('caption.inPhase') },
      { id: 'slideOut', duration: SLIDE_OUT, ease: 'smooth', caption: key('caption.slideOut') },
      { id: 'antiPhase', duration: ANTI_PHASE_HOLD, caption: key('caption.antiPhase') },
      { id: 'slideBack', duration: SLIDE_BACK, ease: 'smooth', caption: key('caption.slideBack') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 배로 출렁이던 합이 막 줄어들기 시작하는 자리에서
   * 연다. 두 파동은 첫 프레임부터 줄 전체에 차 있다.
   */
  startAt: 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 2A|cos(Δφ/2)| 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **합의 높이** 이고,
   * 그 기준은 ±A · ±2A 기준선 둘이 준다.
   */

  messages: constructiveDestructiveMessages,
};
