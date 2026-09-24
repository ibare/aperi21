// ========================================================================
// chromatic-aberration — 선언
// ========================================================================
// 질문: 흰빛을 볼록 렌즈 하나로 모으면 모든 색이 한 점에 모이는가.
//
// 답: 모이지 않는다. 렌즈 유리도 파장마다 굴절률이 달라(파랑 쪽이 높다) 파랑은 렌즈
// 가까이, 빨강은 멀리에서 축에 모인다 — 초점이 색마다 어긋난다. 그 사이에 스크린을 두면
// 한 색이 점으로 모인 자리에서 다른 색은 아직(또는 이미) 퍼져 있어 둘레에 색 테두리가 진다.
//
// 이웃과 겹치지 않게 — 한 면에서 색이 갈라지는 것 자체는 `dispersion`, 높이마다 모이는 자리가
// 다른 것은 `spherical-aberration`(원인이 곡면)의 몫이다. 여기서는 줄기 높이가 아니라 **색**이
// 모이는 자리를 가른다. 초점 거리는 렌즈 제작자 식의 비례 f ∝ 1/(n − 1) 로 계산한다(`physics.ts`).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:chromatic-aberration` 와 문자 그대로 일치한다 (C4). */
export const CHROMATIC_ABERRATION_ID = 'chromatic-aberration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 렌즈 유리(BK7 근사)의 굴절률 표 — 파랑 · 초록 · 빨강 세 파장(nm)과 그 굴절률.
 * 초록을 기준 색으로 둔다. 목록이 아니라 이름 여섯으로 흩었다 (NOTES (c) G105).
 */
export const NM_BLUE = 450;
export const N_BLUE = 1.525;
export const NM_GREEN = 546;
export const N_GREEN = 1.519;
export const NM_RED = 656;
export const N_RED = 1.514;
/** 기준 색(초록)의 초점 거리(월드). 다른 색의 초점 거리는 굴절률로 계산한다. */
export const FOCAL_GREEN = 2.2;
/**
 * 초점 어긋남의 과장 배율. 실제 어긋남(초록 기준 파랑 −1.1 % · 빨강 +1.0 %)은 화면에서
 * 한 점으로 겹친다 — 초록 초점에서 벗어난 몫을 이만큼 키운다. 화면 아래에 적는다.
 */
export const FOCUS_GAIN = 15;
/** 들어오는 흰 줄기 다발의 반높이(월드) — 가장 바깥 줄기의 높이. */
export const BEAM_HALF = 1.0;
/** 축 한쪽의 흰 줄기 수. 다발 반높이를 고르게 나눈다. */
export const RAY_PAIRS = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈 가운데가 원점, 광축이 y = 0 이다.
// ------------------------------------------------------------------------

/** 빛 없음 판. 흰 줄기가 라이트 바탕에 묻히지 않게 두 테마 모두 깐다 (G92). */
export const PANEL = { minX: -3.3, maxX: 6.35, minY: -1.55, maxY: 1.55 } as const;
/** 렌즈 반높이 · 가운데 두께(월드). 그림일 뿐 — 줄기는 얇은 렌즈로 꺾는다. */
export const LENS_HALF = 1.3;
export const LENS_THICKNESS = 0.3;
/** 줄기가 출발하는 x · 끝나는 x(월드). 끝은 빨강 초점을 지나 엇갈려 나가는 것이 보일 만큼. */
export const RAY_START_X = -3.1;
export const RAY_END_X = 3.45;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). 오른쪽은 스크린 정면 칸 앞에서 멈춘다. */
export const AXIS_FROM_X = -3.2;
export const AXIS_TO_X = 3.6;
/** 스크린(옆모습) 판의 반두께 · 반높이(월드). */
export const SCREEN_HALF_WIDTH = 0.04;
export const SCREEN_HALF = 1.35;
/** 스크린 정면 칸 — 가운데와 반크기(월드). 원판 반지름은 옆모습의 퍼진 높이에 `FACE_SCALE` 을 곱한다. */
export const FACE_CENTER: readonly [number, number] = [5.0, 0];
export const FACE_HALF = 1.2;
export const FACE_SCALE = 2.5;
/** 한 점으로 모인 색도 보이게 하는 원판의 가장 작은 반지름(월드). */
export const FACE_MIN_R = 0.05;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_R = 0.08;

/**
 * 프레이밍 — 가로는 판 전체와 왼쪽 여백, 세로는 판 위 이름표부터 판 아래 초점 이름표와
 * 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.45, maxX: 6.5, minY: -2.55, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chromaticAberrationMessages = Object.freeze({
  'label.title': { ko: '색수차', en: 'Chromatic aberration' },
  'label.stage': { ko: '유리 볼록 렌즈', en: 'Convex glass lens' },
  'label.view': { ko: '렌즈와 스크린', en: 'Lens and screen' },

  /** 도식 이름표. */
  'label.focusBlue': { ko: '파랑 초점', en: 'blue focus' },
  'label.focusRed': { ko: '빨강 초점', en: 'red focus' },
  'label.screen': { ko: '스크린', en: 'screen' },
  'label.face': { ko: '스크린 정면', en: 'screen, face on' },
  /** 과장 배율. 스테이지 상수를 끼운다. */
  'label.gain': { ko: '두 초점 사이 거리 {k}배 과장', en: 'Gap between the foci exaggerated ×{k}' },

  'caption.enter': {
    ko: '흰빛 나란한 줄기가 볼록 렌즈로 들어간다.',
    en: 'Parallel beams of white light head into a convex lens.',
  },
  'caption.split': {
    ko: '렌즈를 지난 빛이 색 줄기로 나뉘며 축 쪽으로 꺾인다.',
    en: 'Past the lens, the light parts into coloured beams bending toward the axis.',
  },
  'caption.foci': {
    ko: '파랑 줄기는 렌즈 가까이에서, 빨강 줄기는 더 멀리에서 축에 모인다.',
    en: 'The blue beams meet on the axis close to the lens, the red beams farther away.',
  },
  'caption.screenIn': {
    ko: '파랑 초점 자리에 스크린을 세운다.',
    en: 'A screen is set up at the blue focus.',
  },
  'caption.atBlue': {
    ko: '스크린 위에서 파랑은 한 점으로 모였고, 아직 모이지 않은 빨강이 둘레에 테두리를 두른다.',
    en: 'On the screen the blue has gathered to a point, while the red, not yet converged, rings the edge.',
  },
  'caption.slide': {
    ko: '스크린을 빨강 초점 쪽으로 옮긴다.',
    en: 'The screen moves toward the red focus.',
  },
  'caption.atRed': {
    ko: '이번엔 빨강이 한 점으로 모였고, 모였다가 다시 퍼진 파랑이 둘레에 테두리를 두른다.',
    en: 'Now the red has gathered to a point, and the blue, already past its focus and spreading again, rings the edge.',
  },
} satisfies Record<string, LocalizedText>);

export type ChromaticAberrationMessageKey = keyof typeof chromaticAberrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChromaticAberrationMessageKey): LocalizedText => chromaticAberrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChromaticAberrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chromaticAberrationSchema: BundleSchema = {
  id: CHROMATIC_ABERRATION_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 스크린이 두 초점 사이를 옮겨 가는 것까지 자동 진행으로 보인다.
  parameters: [],

  stages: [
    {
      id: 'glass-lens',
      label: text('label.stage'),
      constants: {
        nmBlue: NM_BLUE,
        nBlue: N_BLUE,
        nmGreen: NM_GREEN,
        nGreen: N_GREEN,
        nmRed: NM_RED,
        nRed: N_RED,
        focalGreen: FOCAL_GREEN,
        focusGain: FOCUS_GAIN,
        faceScale: FACE_SCALE,
        beamHalf: BEAM_HALF,
        rayPairs: RAY_PAIRS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lens', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 렌즈와 줄기, 오른쪽 스크린 정면, 아래 이름표 · 캡션 줄. */
  canvas: { height: 400, minHeight: 320 },

  /**
   * scene 에 쓴 순서대로 그린다. 빛 없음 판(`region`)이 줄기(`trajectory`) 위로 올라와
   * 덮으면 안 된다 — 판이 맨 아래, 렌즈 · 줄기 · 스크린 · 원판이 그 위, 글자가 가장 나중이다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 15.6 초.
   *
   * - `enter` — 흰 줄기 앞머리가 렌즈까지 온다.
   * - `split` — 렌즈 뒤로 색 줄기가 자라 각자 초점을 지나 엇갈려 나간다.
   * - `mark` · `hold-foci` — 파랑 · 빨강 초점 점과 이름표가 뜨고 머문다.
   * - `screen-in` — 파랑 초점 자리에 스크린과 정면 칸이 나타난다. 스크린 뒤 줄기가 옅어진다.
   * - `hold-blue` — 파랑 점 둘레에 빨강 테두리.
   * - `slide` — 스크린이 빨강 초점으로 옮겨 간다. 정면의 원판들이 크기를 바꾼다.
   * - `hold-red` — 빨강 점 둘레에 파랑 테두리.
   * - `fade` — 모두 옅어진다. 다음 주기에 흰 줄기가 다시 들어온다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.2, caption: key('caption.enter') },
      { id: 'split', duration: 1.6, ease: 'smooth', caption: key('caption.split') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.foci') },
      { id: 'hold-foci', duration: 2.6, caption: key('caption.foci') },
      { id: 'screen-in', duration: 0.8, ease: 'smooth', caption: key('caption.screenIn') },
      { id: 'hold-blue', duration: 2.8, caption: key('caption.atBlue') },
      { id: 'slide', duration: 2.2, ease: 'smooth', caption: key('caption.slide') },
      { id: 'hold-red', duration: 2.8, caption: key('caption.atRed') },
      { id: 'fade', duration: 1.0, ease: 'smooth', caption: key('caption.atRed') },
    ],
  },

  /** 도착한 순간 색 줄기가 이미 두 초점으로 갈려 서 있다 — `hold-foci` 안에서 연다 (S-piece). */
  startAt: 4.0,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본).

  messages: chromaticAberrationMessages,
};
