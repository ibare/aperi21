// ========================================================================
// ac-generation — 선언
// ========================================================================
// 질문: 자기장 속에서 코일을 일정하게 돌리면 기전력은 어떤 모양으로 나오는가.
//
// 왼쪽에 굴대 쪽에서 본 코일(N · S 극 사이에서 도는 선 하나), 오른쪽에 기전력–시간
// 기록지. 코일이 도는 대로 기록지에 사인파가 적힌다. 기록지 아래에는 사분 주기마다
// 그 순간의 코일 자세를 작게 새기고 곡선 위 점과 점선으로 잇는다 — 코일 면이 자기장과
// **나란할 때 마루, 수직일 때 0** 이 한눈에 짝지어진다.
//
// 그다음 같은 코일을 더 빨리 돌리면 새 자취의 마루가 **더 높고 더 촘촘하다.** 앞 자취는
// 점선으로 남아 견준다.
//
// 이웃 — `generator` 는 전구를 켜면 손이 무거워지는 것(에너지), `faradays-law` 는 자석을
// 빨리 밀면 봉우리가 높은 것(선속 변화의 빠르기)이다. 이 조각은 회전이 만드는 **파형의
// 모양과 코일 자세의 대응**만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:ac-generation` 와 문자 그대로 일치한다 (C4). */
export const AC_GENERATION_ID = 'ac-generation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 코일의 감은 수 N. */
export const TURNS = 100;
/** 극 사이 자기장 세기 B(T). */
export const FIELD_B = 0.2;
/** 코일 한 바퀴의 넓이 A(m²). */
export const COIL_AREA = 0.01;
/** 처음(느린) 돌림의 1 초당 바퀴 수. ω = 2π × 이 값. */
export const TURNS_PER_SECOND = 0.5;
/** 빠른 돌림이 처음 돌림의 몇 배인가. */
export const SPEED_RATIO = 2;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 기전력(V) → 기록지 높이(월드). 기본값에서 빠른 마루(≈ 1.26 V)가 축 끝 아래에 든다. */
export const EMF_TO_WORLD = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 코일, 오른쪽에 기록지.
// ------------------------------------------------------------------------

/** 굴대(회전 중심). */
export const AXLE: readonly [number, number] = [-3.3, 0.2];
/** 극 조각 — 가로 · 세로 크기와, 굴대에서 극면까지의 거리. */
export const POLE_W = 0.7;
export const POLE_H = 2.2;
export const POLE_GAP_HALF = 1.2;
/** 옆에서 본 코일의 반폭(굴대에서 도선까지). */
export const COIL_RADIUS = 0.85;
/** 극 사이 자기력선 — 가닥 수와 간격. */
export const FIELD_LINE_COUNT = 5;
export const FIELD_LINE_STEP = 0.45;

/** 기록지 원점(시간 0 · 기전력 0). */
export const GRAPH_ORIGIN: readonly [number, number] = [-0.6, 0.2];
/** 기록지 가로 — 한 단계(한 번의 돌림)가 이 폭을 채운다. */
export const GRAPH_WIDTH = 5.6;
/** 세로축 반높이 · 가로축이 기록지 끝을 넘어 뻗는 길이. */
export const AXIS_HALF_HEIGHT = 1.45;
export const AXIS_OVERHANG = 0.25;
/** 코일 자세 글리프 줄의 높이(월드). 가장 낮은 마루 아래에 둔다. */
export const GLYPH_ROW_Y = -1.55;
/** 글리프 선의 반길이(월드). */
export const GLYPH_HALF = 0.14;

/**
 * 프레이밍 — N 극 왼끝 조금 밖부터 가로축 끝 이름표 너머, 세로는 캡션 자리를 둔 글리프 줄
 * 밑부터 세로축 이름표 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.45, maxX: 5.55, minY: -2.3, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 느린 돌림 — 기록지를 한 번 채운다(초). */
export const SLOW_SPAN = 4;
/** 빠른 돌림 — 같은 폭을 같은 시간에 채운다(초). 느린 돌림과 같아야 촘촘함을 견줄 수 있다. */
export const FAST_SPAN = 4;
/** 두 자취를 나란히 두고 보는 동안(초). 코일은 빠르게 계속 돈다. */
export const COMPARE_SPAN = 2.4;
/** 기록지를 비우는 동안(초). */
export const CLEAR_SPAN = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const acGenerationMessages = Object.freeze({
  'label.title': { ko: '교류의 발생', en: 'Generating alternating current' },
  'label.stage': { ko: '자기장 속 코일', en: 'Coil in a magnetic field' },
  'label.view': { ko: '굴대 쪽에서', en: 'Along the axle' },
  /** 극에 새겨진 표식 (C1 판정 1). */
  'label.poleN': { ko: 'N', en: 'N' },
  'label.poleS': { ko: 'S', en: 'S' },
  /** 축 기호 (C1 판정 3). */
  'label.axisEmf': { ko: 'ε', en: 'ε' },
  'label.axisT': { ko: 't', en: 't' },
  /** 자취 표식 — 돌림 빠르기 (C1 판정 3). 배수는 스테이지 상수를 끼운다. */
  'label.omega': { ko: 'ω', en: 'ω' },
  'label.omegaTimes': { ko: '{k}ω', en: '{k}ω' },
  'caption.slow': {
    ko: '코일이 돌면 기전력이 사인파로 오르내린다 — 코일 면이 자기장과 나란할 때 마루, 수직일 때 0',
    en: 'As the coil turns, the EMF rises and falls as a sine wave — a crest when the coil lies along the field, zero when it stands across it',
  },
  'caption.fast': {
    ko: '같은 코일을 {k}배 빠르게 돌린다 — 마루가 {k}배 높아지고 {k}배 촘촘해진다',
    en: 'The same coil turns {k} times faster — the crests grow {k} times taller and come {k} times closer',
  },
  'caption.compare': {
    ko: '빨리 돌린 자취가 더 높고 더 촘촘하다 — 코일 자세와 마루 · 0 의 짝은 그대로다',
    en: 'The faster trace is taller and tighter — crests and zeros still match the same coil positions',
  },
} satisfies Record<string, LocalizedText>);

export type AcGenerationMessageKey = keyof typeof acGenerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AcGenerationMessageKey): LocalizedText => acGenerationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AcGenerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const acGenerationSchema: BundleSchema = {
  id: AC_GENERATION_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 돌고 있고, 느린 돌림과 빠른 돌림을 저절로 되풀이한다.
  parameters: [],

  stages: [
    {
      id: 'coil',
      label: text('label.stage'),
      constants: {
        turns: TURNS,
        fieldB: FIELD_B,
        coilArea: COIL_AREA,
        turnsPerSecond: TURNS_PER_SECOND,
        speedRatio: SPEED_RATIO,
        emfToWorld: EMF_TO_WORLD,
      },
    },
  ],

  environments: [],
  views: [{ id: 'axle', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 코일 하나와 기록지 하나가 전부다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 자기력선은 코일 아래, 대응 점선은 자취 아래, 지금 적는 점은
   * 모든 것 위에 와야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 느린 돌림 → 빠른 돌림 → 견줌 → 비움. 코일의 각은 단계마다의 빠르기를
   * 이어 붙인 시계의 함수다(`physics.coilAngle`). 기본값에서 한 주기 동안 코일이 정확히
   * 아홉 바퀴를 돌아, 다음 주기의 느린 돌림이 코일 면이 장에 수직인 자세(기전력 0)에서
   * 다시 시작한다.
   */
  timeline: {
    phases: [
      { id: 'slow', duration: SLOW_SPAN, caption: key('caption.slow') },
      { id: 'fast', duration: FAST_SPAN, caption: key('caption.fast') },
      { id: 'compare', duration: COMPARE_SPAN, caption: key('caption.compare') },
      { id: 'clear', duration: CLEAR_SPAN, caption: key('caption.compare') },
    ],
  },

  /**
   * 도착한 순간 이미 돌고 있다 — 느린 돌림의 첫 마루와 첫 골을 지난 자리(1.3 초)에서
   * 연다. 기록지에는 이미 자취와 자세 글리프가 몇 개 적혀 있다.
   */
  startAt: 1.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 배수는 스테이지 상수의 글자다 — state 가 옮겨 둔다(G133). */
    vars: { k: 'speedRatio' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 기록지에 눈금 수를 달지 않는다 — 잴 것은 몇
   * 볼트인가가 아니라 **어느 자취가 더 높고 촘촘한가, 마루가 어느 자세에 오는가** 다.
   */

  messages: acGenerationMessages,
};
