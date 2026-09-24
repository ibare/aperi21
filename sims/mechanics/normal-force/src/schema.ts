// ========================================================================
// normal-force — 선언
// ========================================================================
// 질문: 바닥은 늘 물체의 무게만큼 미는가?
//
// 바닥은 무게만큼 미는 것이 아니라 뚫리지 않을 만큼만 민다 — 위로 당기면 덜 밀고,
// 누르면 더 밀고, 떨어지면 0 이다. 원본: tasks/piece-lab/normal-force (자유 구현).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:normal-force` 와 문자 그대로 일치한다 (C4). */
export const NORMAL_FORCE_ID = 'normal-force';

// ------------------------------------------------------------------------
// 물리 — 원본 그대로
// ------------------------------------------------------------------------

/**
 * 스테이지 상수. 물리가 읽는 값은 저작자가 바꿀 수 있어야 한다 (원칙 2).
 *
 * `rodForce.<단계 id>` 는 그 단계가 **끝날 때** 막대가 상자에 주는 힘(N, 위가 +: 당김).
 * 단계의 시작 값은 앞 단계의 끝 값이고, 첫 단계는 마지막 단계의 끝 값에서 출발한다
 * (한 바퀴가 이어진다). 당김 최대 20.3 N 은 무게를 아주 조금 넘겨 상자가 천천히 뜨게
 * 한 원본의 값이다 (원본 NOTES (c) 「뜨는 구간 설계」).
 */
export const DEFAULT_CONSTANTS = {
  g: 10,
  mass: 2,
  'rodForce.pull': 20.3,
  'rodForce.hold': 20.3,
  'rodForce.letGo': 8,
  'rodForce.ease': 0,
  'rodForce.rest': 0,
  'rodForce.press': -16,
  'rodForce.pressHold': -16,
  'rodForce.return': 4,
} as const;

// ------------------------------------------------------------------------
// 화면 — 원본 캔버스(840 × 290 px). 월드는 원본 px 를 그대로 쓰고 y 만 뒤집는다.
// ------------------------------------------------------------------------

export const W_PX = 840;
/** 바닥 윗면(px). */
export const FLOOR_Y = 222;
/** 바닥 판 두께(px). */
export const FLOOR_DEPTH = 36;
/** 상자 중심 x(px). */
export const CX = 420;
/** 상자 폭·높이(px). */
export const BW = 110;
export const BH = 70;
/** 힘 화살표 척도 — 1 N 이 몇 px. 세 화살표가 같은 척도를 쓴다. */
export const PX_PER_N = 3;
/** 바닥이 눌린 깊이 — 수직항력 1 N 당 px (과장). */
export const DENT_PER_N = 0.32;
/** 뜬 높이 — 1 m 가 몇 px. */
export const PX_PER_M = 200;
/** 바닥 판 반폭(px). */
export const MAT_HALF = 260;
/** 눌린 자리가 평평한 윗면으로 이어지는 폭(px). */
export const DENT_EASE = 34;

/**
 * 고정 경계 — 원본 캔버스 전체와 그 아래 캡션 한 줄. 원본 캡션은 캔버스 밖 DOM 이었다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: W_PX, minY: -322, maxY: 0 } as const;
/** 캡션 줄의 가운데 높이(px). 캔버스 290 + 여백 6 + 줄 반 높이. */
export const CAPTION_Y = 306;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const normalForceMessages = Object.freeze({
  'label.title': { ko: '수직항력', en: 'Normal force' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 무게 화살표 이름. 값은 vars 로 끼운다 (C1). */
  'label.weight': { ko: '무게 {w} N', en: 'weight {w} N' },
  /** 막대 힘 — 당김 · 누름 · 0. */
  'label.pull': { ko: '당김 {f} N', en: 'pull {f} N' },
  'label.push': { ko: '누름 {f} N', en: 'push {f} N' },
  'label.rodZero': { ko: '막대 힘 0 N', en: 'rod force 0 N' },
  /** 수직항력 — 0 일 때도 같은 문안에 0 을 끼운다. */
  'label.normal': { ko: '수직항력 {n} N', en: 'normal force {n} N' },
  'caption.floating': {
    ko: '상자가 떴다 — 바닥은 더 밀 것이 없다',
    en: 'The box has lifted off — the floor has nothing left to push',
  },
  'caption.falling': {
    ko: '놓인 상자가 내려온다 — 닿기 전까지 바닥은 밀지 않는다',
    en: 'The released box comes down — the floor pushes nothing until it touches',
  },
  'caption.balanced': {
    ko: '당김이 무게와 같아졌다 — 바닥은 밀지 않는다',
    en: 'The pull now equals the weight — the floor does not push',
  },
  'caption.pulling': {
    ko: '위로 당기는 만큼 바닥이 덜 민다',
    en: 'The harder the rod pulls up, the less the floor pushes',
  },
  'caption.pressing': {
    ko: '아래로 누르는 만큼 바닥이 더 민다',
    en: 'The harder the rod presses down, the more the floor pushes',
  },
  'caption.rest': {
    ko: '막대가 힘을 주지 않으면 바닥은 무게만큼 민다',
    en: 'With no force from the rod, the floor pushes exactly the weight',
  },
} satisfies Record<string, LocalizedText>);

export type NormalForceMessageKey = keyof typeof normalForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: NormalForceMessageKey): LocalizedText => normalForceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NormalForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const normalForceSchema: BundleSchema = {
  id: NORMAL_FORCE_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 조작기가 없다 — 자동 진행 한 바퀴가 당김 · 뜸 · 0 · 누름을 모두 보여 준다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: { ...DEFAULT_CONSTANTS } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 840 × 290 캔버스 + 캡션 한 줄. 세로가 비싸다. */
  canvas: { height: 340, minHeight: 280 },

  /**
   * 막대 힘의 한 바퀴 12 s. 원본 키프레임 [0,4] [2.6,20.3] [4,20.3] [4.2,8] [5.6,0]
   * [7,0] [8.5,−16] [10.3,−16] [12,4] 의 구간마다 smoothstep 을 걸었다.
   *
   * 단계마다의 힘 값은 스테이지 상수 `rodForce.<id>` 가 정한다. 상자의 접촉 · 뜬 높이 ·
   * 속도는 이 힘을 **누적 적분**한 결과라 `step` 이 쌓는다 — 그래서 캡션은 단계가 아니라
   * 상태(`caption.cases`)가 고른다. 원본은 시계를 앞당기지 않았다(t = 0 에 이미 4 N 로
   * 당기는 중) — `startAt` · `preroll` 없음.
   */
  timeline: {
    phases: [
      { id: 'pull', duration: 2.6, ease: 'smooth' },
      { id: 'hold', duration: 1.4, ease: 'smooth' },
      { id: 'letGo', duration: 0.2, ease: 'smooth' },
      { id: 'ease', duration: 1.4, ease: 'smooth' },
      { id: 'rest', duration: 1.4, ease: 'smooth' },
      { id: 'press', duration: 1.5, ease: 'smooth' },
      { id: 'pressHold', duration: 1.8, ease: 'smooth' },
      { id: 'return', duration: 1.7, ease: 'smooth' },
    ],
  },

  /**
   * 슬롯 하나. 원본 캡션 자리(캔버스 아래 가운데 · 16px · 본문 먹색).
   *
   * 문장은 접촉 여부와 **화면에 표시한 정수 힘**에서 고른다 — 캡션과 화면 숫자가 어긋날
   * 수 없게 (원본 NOTES (c)). 조건을 세는 것은 `physics.step` 이고 선언은 이름만 가리킨다.
   * 위에서부터 참인 첫 항목, 아무것도 아니면 막대 힘 0 의 문장.
   */
  caption: {
    anchor: { world: [W_PX / 2, -CAPTION_Y] },
    align: 'center',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'floating', text: key('caption.floating') },
      { when: 'falling', text: key('caption.falling') },
      { when: 'balanced', text: key('caption.balanced') },
      { when: 'pulling', text: key('caption.pulling') },
      { when: 'pressing', text: key('caption.pressing') },
    ],
    text: key('caption.rest'),
  },

  /** 원본의 그리기 순서가 겹침 순서다. 그리드 · 카메라 버튼은 원본에 없다. */
  drawOrder: 'scene',

  messages: normalForceMessages,
};
