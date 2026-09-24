// ========================================================================
// microscope — 선언
// ========================================================================
// 질문: 현미경은 작은 시료를 어떻게 그렇게 크게 보이게 하는가.
//
// 답: 두 번 키운다. 초점 거리가 짧은 대물렌즈가 초점 바로 바깥의 시료로부터 경통 안에
// 거꾸로 선 확대 실상을 만들고(첫 확대), 그 실상이 접안렌즈 초점 안에 놓여 돋보기처럼
// 한 번 더 커진 허상이 된다(둘째 확대). 오른쪽 막대 셋이 그 곱을 길이로 보인다 — 대물
// 막대가 늘고, 접안 막대가 늘고, 전체 막대에 대물 막대가 접안 칸 수만큼 이어 붙는다.
//
// 렌즈 하나의 배율은 `magnification`, 접안렌즈 하나로 보는 돋보기는 `magnifying-glass`,
// 맞붙인 두 렌즈는 `lens-combination` 의 몫이다. 이 조각은 떨어진 두 렌즈가 **차례로**
// 키우는 것만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:microscope` 와 문자 그대로 일치한다 (C4). */
export const MICROSCOPE_ID = 'microscope';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 대물렌즈의 초점 거리(월드). 짧다. */
export const OBJECTIVE_FOCAL = 0.6;
/** 시료가 대물렌즈에서 떨어진 거리(월드). 초점 거리 바로 바깥이다. */
export const SPECIMEN_DISTANCE = 0.75;
/** 시료(화살표)의 높이(월드). 막대 한 칸의 길이이기도 하다. */
export const SPECIMEN_HEIGHT = 0.2;
/** 경통 길이 — 대물렌즈와 접안렌즈 사이 거리(월드). */
export const TUBE_LENGTH = 3.6;
/** 접안렌즈의 초점 거리(월드). 실상이 이 거리 안쪽에 놓이도록 잡는다. */
export const EYEPIECE_FOCAL = 0.9;

/**
 * 배율 정박값 — 화면 글자 `×{m}` · 캡션 · 막대 칸 수가 이 값을 그대로 쓴다. 위 거리에서
 * 계산하지 않는다(S-piece 유효숫자). 그림의 상 자리 · 크기는 `findImage` 가 거리에서 계산하고,
 * 둘이 같아야 한다는 관계는 NOTES (c) G143.
 */
export const OBJECTIVE_MAG = 4;
export const EYEPIECE_MAG = 3;
export const TOTAL_MAG = 12;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 대물렌즈가 x = 0, 광축이 y = 0 이다.
// ------------------------------------------------------------------------

/** 대물렌즈 높이(월드). 작은 렌즈다. */
export const OBJECTIVE_SIZE = 0.7;
/** 접안렌즈 높이(월드). 실상 끝에서 나란히 오는 줄기를 받을 만큼. */
export const EYEPIECE_SIZE = 2.0;
/** 경통 벽의 높이(월드, 광축에서). 접안렌즈 반높이보다 조금 크다. */
export const TUBE_HALF = 1.05;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -1.1;
export const AXIS_TO_X = 4.9;
/** 접안렌즈를 지난 줄기가 더 뻗는 길이(월드). */
export const EXIT_LENGTH = 0.9;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.04;

/** 막대 묶음 — 칸이 시작하는 x(월드). 칸 한 개의 길이는 시료 높이와 같다. */
export const BAR_X = 5.3;
/** 막대 세 줄(대물 · 접안 · 전체)의 가운데 y(월드). */
export const BAR_ROW_Y_OBJECTIVE = -0.7;
export const BAR_ROW_Y_EYEPIECE = -1.2;
export const BAR_ROW_Y_TOTAL = -1.7;
/** 막대 두께(월드). */
export const BAR_THICKNESS = 0.18;

/**
 * 프레이밍 — 가로는 시료 왼쪽 이름표부터 전체 막대 값 글자까지, 세로는 경통 이름표부터
 * 허상 끝 아래 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.25, maxX: 8.35, minY: -2.95, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const microscopeMessages = Object.freeze({
  'label.title': { ko: '현미경', en: 'Microscope' },
  'label.operation': { ko: '대물과 접안의 배율 곱', en: 'Objective and eyepiece magnifications multiply' },
  'label.stage': { ko: '대물렌즈와 접안렌즈', en: 'Objective and eyepiece' },
  'label.view': { ko: '경통과 배율 막대', en: 'Tube and magnification bars' },

  /** 도식 이름표. */
  'label.specimen': { ko: '시료', en: 'specimen' },
  'label.objective': { ko: '대물렌즈', en: 'objective' },
  'label.eyepiece': { ko: '접안렌즈', en: 'eyepiece' },
  'label.tube': { ko: '경통', en: 'tube' },
  'label.realImage': { ko: '실상', en: 'real image' },
  'label.virtualImage': { ko: '허상', en: 'virtual image' },
  /** 초점 표식 — 기호라 두 언어가 같다. */
  'label.focus': { ko: 'F', en: 'F' },
  /** 막대 줄 이름. */
  'label.barObjective': { ko: '대물', en: 'objective' },
  'label.barEyepiece': { ko: '접안', en: 'eyepiece' },
  'label.barTotal': { ko: '전체', en: 'total' },
  /** 막대 값 글자. 값은 선언한 정박값이다. */
  'label.mag': { ko: '×{m}', en: '×{m}' },

  'caption.objRays': {
    ko: '시료 끝에서 나온 빛이 대물렌즈를 지나 경통 안의 한 점으로 모인다.',
    en: 'Light from the tip of the specimen passes the objective and meets at one point inside the tube.',
  },
  'caption.objGrow': {
    ko: '경통 안에 거꾸로 선 실상이 생기고, 대물 막대가 늘어난다.',
    en: 'An upside-down real image forms inside the tube, and the objective bar grows.',
  },
  'caption.objImage': {
    ko: '경통 안의 실상은 시료의 {m1}배다. 대물 막대가 {m1}칸이 됐다.',
    en: 'The real image in the tube is {m1}× the specimen. The objective bar is now {m1} cells long.',
  },
  'caption.eyeRays': {
    ko: '실상 끝에서 나온 빛이 접안렌즈를 지나 퍼져 나간다.',
    en: 'Light from the tip of the real image passes the eyepiece and spreads out.',
  },
  'caption.eyeGrow': {
    ko: '퍼지는 빛을 거꾸로 이은 곳에 더 큰 허상이 서고, 접안 막대가 늘어난다.',
    en: 'Traced back, the spreading light meets in a larger virtual image, and the eyepiece bar grows.',
  },
  'caption.eyeImage': {
    ko: '허상은 실상의 {m2}배다. 접안 막대가 {m2}칸이 됐다.',
    en: 'The virtual image is {m2}× the real image. The eyepiece bar is now {m2} cells long.',
  },
  'caption.copy': {
    ko: '전체 막대에 대물 막대 하나가 놓인다.',
    en: 'One objective bar is laid on the total bar.',
  },
  'caption.stack': {
    ko: '전체 막대에 대물 막대가 접안 칸 하나마다 하나씩 이어 붙는다.',
    en: 'On the total bar, one objective bar is laid down for each eyepiece cell.',
  },
  'caption.total': {
    ko: '대물 막대 {m2}개가 이어져 {m}칸 — 허상은 시료의 {m}배다.',
    en: '{m2} objective bars end to end make {m} cells — the virtual image is {m}× the specimen.',
  },
  'caption.reset': {
    ko: '상과 줄기가 사라지고 두 막대가 1칸으로 돌아간다.',
    en: 'The images and beams fade, and both bars go back to one cell.',
  },
} satisfies Record<string, LocalizedText>);

export type MicroscopeMessageKey = keyof typeof microscopeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MicroscopeMessageKey): LocalizedText => microscopeMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MicroscopeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const microscopeSchema: BundleSchema = {
  id: MICROSCOPE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두 번의 확대를 자동 진행으로 차례로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'two-lenses',
      label: text('label.stage'),
      constants: {
        objectiveFocal: OBJECTIVE_FOCAL,
        specimenDistance: SPECIMEN_DISTANCE,
        specimenHeight: SPECIMEN_HEIGHT,
        tubeLength: TUBE_LENGTH,
        eyepieceFocal: EYEPIECE_FOCAL,
        objectiveMag: OBJECTIVE_MAG,
        eyepieceMag: EYEPIECE_MAG,
        totalMag: TOTAL_MAG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tube-and-bars', label: text('label.view'), default: true }],

  /** 광축 한 줄과 옆의 막대 묶음. 가로로 넓고, 세로는 허상 끝과 캡션이 정한다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 축 → 경통 → 초점 → 렌즈 → 연장 점선 → 줄기 → 화살표 → 글자 → 막대 순. plugin 어휘가 층에서
   * 어디 끼는지에 기대지 않게 scene 순서로 고정한다 — 줄기가 렌즈 위로, 화살표가 줄기 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 첫 확대(대물) → 둘째 확대(접안) → 막대 곱 → 되돌림.
   *
   * 줄기가 뻗는 길이는 `obj-rays` · `eye-rays` 진행도, 상 화살표 · 연장 점선 · 막대 칸 길이는
   * `obj-image` · `eye-image` · `copy` · `stack` 진행도, 값 글자는 `*-mark` 진행도, 되돌림은 `reset`
   * 진행도로 읽는다 (`physics.ts`). 단계 경계를 코드 상수로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'obj-rays', duration: 1.6, caption: key('caption.objRays') },
      { id: 'obj-image', duration: 1.0, ease: 'smooth', caption: key('caption.objGrow') },
      { id: 'obj-mark', duration: 0.35, ease: 'smooth', caption: key('caption.objImage') },
      { id: 'hold-obj', duration: 2.6, caption: key('caption.objImage') },
      { id: 'eye-rays', duration: 1.6, caption: key('caption.eyeRays') },
      { id: 'eye-image', duration: 1.2, ease: 'smooth', caption: key('caption.eyeGrow') },
      { id: 'eye-mark', duration: 0.35, ease: 'smooth', caption: key('caption.eyeImage') },
      { id: 'hold-eye', duration: 2.8, caption: key('caption.eyeImage') },
      { id: 'copy', duration: 0.5, ease: 'smooth', caption: key('caption.copy') },
      { id: 'stack', duration: 2.4, caption: key('caption.stack') },
      { id: 'total-mark', duration: 0.35, ease: 'smooth', caption: key('caption.total') },
      { id: 'hold-total', duration: 3.2, caption: key('caption.total') },
      { id: 'reset', duration: 1.2, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 첫 확대가 끝나 실상과 대물 막대 `×4` 가 서 있다 — `hold-obj` 안에서 연다 (S-piece). */
  startAt: 3.3,

  /**
   * 슬롯 하나. 그림 아래 가운데. `{m1}` · `{m2}` · `{m}` 은 state 의 정박값 글자를 가리킨다
   * (G133 우회, `state.ts`).
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { m1: 'objectiveMag', m2: 'eyepieceMag', m: 'totalMag' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 견줄 것은 막대 칸 수와 화살표 길이다.

  messages: microscopeMessages,
};
