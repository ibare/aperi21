// ========================================================================
// diffraction — 선언
// ========================================================================
// 질문: 벽에 난 좁은 틈으로 곧은 물결이 들어가면, 틈만 한 폭의 줄기로 곧게 지나가
// 벽 뒤에 날카로운 그늘을 남길까?
//
// 동사: **돌아 퍼진다.** 틈을 지난 물결이 둥글게 번지며 점선(곧게 지났다면의 그늘 경계)을
// 넘어 벽 뒤 그늘 자리까지 들어간다. 물결 장은 틈 위 여러 점이 낸 파의 실제 합이다 —
// 퍼지는 모양을 그려 넣은 것이 아니라 계산이 정한다.
//
// 두지 않은 것: 틈 폭 / 파장 비 비교(slit-width-and-diffraction 몫) · 하위헌스 작은 파원
// 작도(huygens-principle 몫) · 벽에서 되돌아오는 반사파(reflection-of-waves 몫) · 수치.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:diffraction` 와 문자 그대로 일치한다 (C4). */
export const DIFFRACTION_ID = 'diffraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파장(월드). */
export const WAVELENGTH = 40;
/** 물결의 속력(월드/초). */
export const WAVE_SPEED = 90;
/** 틈 폭(월드). 파장과 비슷한 크기라야 퍼짐이 크게 보인다 — 비교는 이웃 조각의 몫. */
export const SLIT_WIDTH = 48;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(y 는 위). 위에서 내려다본 수조 한 판.
// ------------------------------------------------------------------------

/** 장 가로 · 세로(월드). */
export const FIELD_W = 840;
export const FIELD_H = 340;
/** 벽의 왼쪽 면 x 와 두께. 틈을 나온 자리는 `WALL_X + WALL_THICKNESS`. */
export const WALL_X = 300;
export const WALL_THICKNESS = 12;
/** 틈 가운데 높이. */
export const SLIT_CENTER_Y = FIELD_H / 2;

/** 장을 계산하는 격자 한 칸(월드). 상태로 계산하지 않는 표본 간격이다. */
export const CELL = 4;
/** 틈 위에 놓는 점파원 수 — 계산의 표본 수다(화면에 그리지 않는다). 간격이 파장의 1/4 보다 좁다. */
export const SLIT_SAMPLES = 13;
/**
 * 누르는 곡선이 자르는 크기. |변위| 를 이 값으로 자르고 나눈 뒤 제곱근을 씌운다 —
 * 멀리 번져 약해진 물결도 보이도록. 색 사상이 아니라 값의 모양이다.
 */
export const PRESS_CLIP = 0.9;

/**
 * 프레이밍 — 장 아래에 캡션 한 줄 자리를 둔다 (G24). 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: -44, maxY: FIELD_H } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------
// 물결 앞머리가 틈을 나오는 순간이 `spread` 의 시작이다. physics 는 이 상수를 보지 않고
// `timeline.start('spread')` 에게 묻는다 — `approach` 를 늘이면 앞머리가 더 왼쪽에서 출발할 뿐이다.

/** 앞머리가 틈으로 다가가는 동안. */
export const APPROACH = 3;
/**
 * 틈을 나온 둥근 앞머리가 화면 끝(틈에서 가장 먼 모서리 약 555)까지 번지는 동안.
 * 속력 · 배치에서 나오는 길이인데 시간표가 그 계산을 받지 못한다 (G13).
 */
export const SPREAD = 6.5;
/** 다 번진 무늬를 읽는 동안. */
export const HOLD = 4;
/** 물결이 가라앉아 다음 주기로 넘어가는 동안. */
export const SETTLE = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const diffractionMessages = Object.freeze({
  'label.title': { ko: '회절', en: 'Diffraction' },
  'label.operation': { ko: '장애물을 돌아가는 파동', en: 'Waves bending around obstacles' },
  'label.stage': { ko: '틈이 난 벽', en: 'Wall with a gap' },
  'label.view': { ko: '위에서 본 수조', en: 'Ripple tank from above' },
  'label.shadow': { ko: '곧게 지났다면 그늘', en: 'Shadow, if waves went straight' },
  'caption.approach': {
    ko: '곧은 물결이 좁은 틈이 난 벽으로 다가간다',
    en: 'Straight waves head toward a wall with a narrow gap',
  },
  'caption.spread': {
    ko: '틈을 지난 물결이 곧게 나아가지 않고 둥글게 퍼진다',
    en: 'Past the gap, the waves do not go straight — they spread out in arcs',
  },
  'caption.hold': {
    ko: '점선 바깥, 벽 뒤 그늘이어야 할 자리까지 물결이 돌아 들어갔다',
    en: 'Beyond the dashed lines, the waves have bent into what should be the shadow behind the wall',
  },
} satisfies Record<string, LocalizedText>);

export type DiffractionMessageKey = keyof typeof diffractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DiffractionMessageKey): LocalizedText => diffractionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DiffractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const diffractionSchema: BundleSchema = {
  id: DIFFRACTION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 틈 폭을 바꿔 보는 것은 slit-width-and-diffraction 의 일이다.
  parameters: [],

  stages: [
    {
      id: 'gap',
      label: text('label.stage'),
      constants: { wavelength: WAVELENGTH, waveSpeed: WAVE_SPEED, slitWidth: SLIT_WIDTH },
    },
  ],

  environments: [],

  views: [{ id: 'tank', label: text('label.view'), default: true }],

  /** 가로로 넓은 수조 한 판 + 아래 캡션 한 줄. */
  canvas: { height: 400, minHeight: 340 },

  /** 물결 장 위에 벽, 그 위에 점선 · 이름표가 와야 한다. 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'spread', duration: SPREAD, caption: key('caption.spread') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'settle', duration: SETTLE, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 틈을 나온 둥근 물결이 막 번지기 시작한 자리에서 연다.
   * 0 이면 오른쪽이 빈 수조로 3 초를 기다린다.
   */
  startAt: APPROACH + 1.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 「점선 바깥에 물결이 있는가」 다.
   */

  messages: diffractionMessages,
};
