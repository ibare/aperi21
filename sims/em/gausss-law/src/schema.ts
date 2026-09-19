// ========================================================================
// gausss-law — 선언
// ========================================================================
// 질문: 전하를 감싼 닫힌 면을 어떤 모양 · 크기로 잡아도 뚫고 나가는 전기력선의 수는
// 같은가. 전하가 면 밖에 있으면 어떻게 되는가.
//
// 점전하 둘레의 전기력선 N 가닥 위에 닫힌 곡선(면의 2D 단면)을 하나 놓고, 곡선을 따라
// 한 바퀴 돌며 선이 곡선을 뚫는 자리마다 센다 — 나가면 하나 더하고, 들어오면 하나 뺀다.
// 작은 원 · 접힌 고리 · 큰 원을 차례로 세면 오른쪽 점 기둥이 늘 같은 N 에 닿고, 전하를
// 감싸지 않은 고리는 올랐던 기둥이 0 으로 돌아온다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gausss-law` 와 문자 그대로 일치한다 (C4). */
export const GAUSSS_LAW_ID = 'gausss-law';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전하량(임의 단위 q, 양수). 선 가닥 수 = 전하량 × 단위 전하당 가닥 수. */
export const CHARGE = 1;
/** 전하 q 하나에서 나가는 전기력선 가닥 수. 선의 수가 전하에 비례한다는 약속이다. */
export const LINES_PER_CHARGE = 8;
/** 첫 가닥의 방위각(도). 가닥이 곡선의 이음매(맨 아래)를 스치지 않게 비켜 둔다. */
export const LINE_OFFSET_DEG = 22.5;
/** 전기력선이 뻗는 길이(월드) — 가장 큰 고리 밖까지 닿는다. */
export const FIELD_REACH = 2.7;
/** 곡선을 세기 시작하는 매개 각(도). −90° 는 곡선의 맨 아래다. */
export const START_ANGLE_DEG = -90;

/**
 * 닫힌 곡선 넷은 한 가족이다 — 매개 s 에서
 *   ρ = 1 + wave · cos(lobes · s + phase),  φ = s + swirl · sin(lobes · s)
 *   자리 = 중심 + (rx · ρ cos φ, ry · ρ sin φ)
 * `swirl · lobes` 가 1 을 넘으면 곡선이 방위각을 거슬러 접혀, 전하에서 뻗은 한 선이 곡선을
 * 세 번(나감 · 들어옴 · 나감) 뚫는다. 위상 90° 는 거슬러 가는 동안 반지름이 함께 바뀌게 해
 * 곡선이 제 몸과 엇갈리는 매듭 대신 갈고리 모양으로 접히게 한다 — 매듭이 있으면 닫힌 면의
 * 단면이 아니다. 모양 사이를 넘어갈 때는 이 수들을 그대로 섞는다.
 */
/** 작은 원 — 전하를 중심으로 한 반지름. */
export const SMALL_RADIUS = 0.95;
/** 접힌 고리 — 중심 · 가로 · 세로 반지름 · 굽이 깊이 · 휘감김 · 굽이 수 · 굽이 위상(도). */
export const FOLD_X = 0;
export const FOLD_Y = 0.3;
export const FOLD_RX = 1.7;
export const FOLD_RY = 1.5;
export const FOLD_WAVE = 0.5;
export const FOLD_SWIRL = 1.05;
export const FOLD_LOBES = 3;
export const FOLD_PHASE_DEG = 90;
/** 큰 원 — 전하를 중심으로 한 반지름. */
export const BIG_RADIUS = 2.3;
/** 전하 밖 고리 — 전하 오른쪽에 선 타원. 전하를 감싸지 않는다. */
export const OUTSIDE_X = 1.55;
export const OUTSIDE_Y = 0;
export const OUTSIDE_RX = 0.55;
export const OUTSIDE_RY = 1.05;

// ------------------------------------------------------------------------
// 배치 — 월드. 전하가 원점이다.
// ------------------------------------------------------------------------

/** 점 기둥 넷의 첫 가운데 · 사이. 고리 순서(작은 원 · 접힌 · 큰 원 · 밖)대로 놓인다. */
export const COLUMN_FIRST_X = 3.75;
export const COLUMN_GAP = 0.72;
/** 기둥 바닥(셈 0)의 높이와 기둥이 쓸 수 있는 가장 큰 높이 · 점 사이 간격의 상한. */
export const COLUMN_BASE_Y = -2.05;
export const COLUMN_HEIGHT = 4.5;
export const DOT_PITCH = 0.42;
/** 기둥 아래 작은 고리 그림의 가운데 높이와 축척. 어느 기둥이 어느 고리인지 글자 없이 잇는다. */
export const MINI_Y = -2.55;
export const MINI_SCALE = 0.12;

/**
 * 프레이밍은 주장의 일부다. 가로는 전기력선 왼끝(−2.7)부터 넷째 기둥과 기준선 끝까지,
 * 세로는 기둥 아래 작은 그림 · 캡션 줄부터 전기력선 위끝까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.85, maxX: 6.45, minY: -3.2, maxY: 2.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 곡선 하나를 한 바퀴 돌며 세는 동안. 긴 곡선일수록 조금 더 준다 — 도는 빠르기가 비슷하게. */
export const COUNT_SMALL = 4.5;
export const COUNT_FOLD = 7;
export const COUNT_BIG = 6.5;
export const COUNT_OUTSIDE = 4.5;
/** 다 센 기둥을 읽는 동안 · 곡선이 다음 모양으로 바뀌는 동안. */
export const READ = 2.2;
export const MORPH = 1.6;
/** 네 기둥을 나란히 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.4;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gausssLawMessages = Object.freeze({
  'label.title': { ko: '가우스 법칙', en: 'Gauss’s law' },
  'label.operation': {
    ko: '닫힌 면을 지나는 전기력선속',
    en: 'Electric flux through a closed surface',
  },
  'label.stage': { ko: '점전하 둘레의 네 곡선', en: 'Four closed curves around a point charge' },
  'label.view': { ko: '면의 단면', en: 'Cross-section of the surface' },
  /** 기준선 이름표. 값은 스테이지 상수에서 온 가닥 수다 (C1 — 값은 vars 로). */
  'label.count': { ko: '{n}', en: '{n}' },
  /** 도식 기호. 수 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.zero': { ko: '0', en: '0' },
  'caption.countSmall': {
    ko: '작은 원을 한 바퀴 돌며, 원을 뚫고 나가는 선을 하나씩 센다',
    en: 'Going once around the small circle, we count each line that pierces it on the way out',
  },
  'caption.readSmall': {
    ko: '원을 뚫고 나가는 선은 {n} 가닥이다',
    en: '{n} lines leave through the circle',
  },
  'caption.morphFold': {
    ko: '곡선을 찌그러뜨려 접는다',
    en: 'Now we squash and fold the curve',
  },
  'caption.countFold': {
    ko: '접힌 곳에서는 선이 나갔다 들어와 다시 나간다 — 들어오면 하나를 뺀다',
    en: 'Where the curve folds, a line leaves, comes back in and leaves again — coming in takes one away',
  },
  'caption.readFold': {
    ko: '들어온 만큼 빼면, 나가는 선은 여전히 {n} 가닥이다',
    en: 'Take away the ones coming in, and still {n} lines leave',
  },
  'caption.morphBig': {
    ko: '곡선을 크게 넓힌다',
    en: 'Now we widen the curve',
  },
  'caption.countBig': {
    ko: '큰 원 — 선은 전하에서 더 먼 곳에서 곡선을 뚫는다',
    en: 'A big circle — the lines pierce it much farther from the charge',
  },
  'caption.readBig': {
    ko: '크기를 키워도 나가는 선은 {n} 가닥이다',
    en: 'Bigger, yet {n} lines still leave',
  },
  'caption.morphOutside': {
    ko: '곡선을 전하 바깥으로 옮긴다',
    en: 'Now we move the curve off the charge',
  },
  'caption.countOutside': {
    ko: '전하를 감싸지 않은 곡선 — 나가는 선은 더하고, 들어오는 선은 뺀다',
    en: 'A curve that misses the charge — lines going out add one, lines coming in take one away',
  },
  'caption.readOutside': {
    ko: '들어온 선이 모두 다시 나가, 남는 것은 0 이다',
    en: 'Every line that came in goes out again, leaving zero',
  },
  'caption.hold': {
    ko: '전하를 감싼 세 곡선의 기둥은 모두 {n} 에, 감싸지 않은 곡선의 기둥은 0 에 닿았다',
    en: 'The three curves around the charge all reach {n}; the one that misses it reaches 0',
  },
} satisfies Record<string, LocalizedText>);

export type GausssLawMessageKey = keyof typeof gausssLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GausssLawMessageKey): LocalizedText => gausssLawMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GausssLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gausssLawSchema: BundleSchema = {
  id: GAUSSS_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 네 곡선을 차례로 세고, 나란히 읽고, 다시 시작한다.
  parameters: [],

  stages: [
    {
      id: 'point-charge',
      label: text('label.stage'),
      constants: {
        charge: CHARGE,
        linesPerCharge: LINES_PER_CHARGE,
        lineOffsetDeg: LINE_OFFSET_DEG,
        fieldReach: FIELD_REACH,
        startAngleDeg: START_ANGLE_DEG,
        smallRadius: SMALL_RADIUS,
        foldX: FOLD_X,
        foldY: FOLD_Y,
        foldRx: FOLD_RX,
        foldRy: FOLD_RY,
        foldWave: FOLD_WAVE,
        foldSwirl: FOLD_SWIRL,
        foldLobes: FOLD_LOBES,
        foldPhaseDeg: FOLD_PHASE_DEG,
        bigRadius: BIG_RADIUS,
        outsideX: OUTSIDE_X,
        outsideY: OUTSIDE_Y,
        outsideRx: OUTSIDE_RX,
        outsideRy: OUTSIDE_RY,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 둥근 선 다발과 점 기둥 넷을 가로로 놓는다. 360 에서는 세로에 묶여 교차점이 붙는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 전기력선 위에 곡선, 그 위에 교차점 표식이 와야 뚫는 자리가 가려지지
   * 않는다. 전하는 선의 뿌리를 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 작은 원 세기 → 읽기 → 접기 → 세기 → 읽기 → 넓히기 → 세기 → 읽기 → 밖으로
   * 옮기기 → 세기 → 읽기 → 네 기둥 나란히 → 흐려짐. 세는 단계는 `linear` — 도는 빠르기가
   * 고르다. 모양이 바뀌는 단계는 `smooth`.
   */
  timeline: {
    phases: [
      { id: 'count-small', duration: COUNT_SMALL, caption: key('caption.countSmall') },
      { id: 'read-small', duration: READ, caption: key('caption.readSmall') },
      { id: 'morph-fold', duration: MORPH, ease: 'smooth', caption: key('caption.morphFold') },
      { id: 'count-fold', duration: COUNT_FOLD, caption: key('caption.countFold') },
      { id: 'read-fold', duration: READ, caption: key('caption.readFold') },
      { id: 'morph-big', duration: MORPH, ease: 'smooth', caption: key('caption.morphBig') },
      { id: 'count-big', duration: COUNT_BIG, caption: key('caption.countBig') },
      { id: 'read-big', duration: READ, caption: key('caption.readBig') },
      { id: 'morph-outside', duration: MORPH, ease: 'smooth', caption: key('caption.morphOutside') },
      { id: 'count-outside', duration: COUNT_OUTSIDE, caption: key('caption.countOutside') },
      { id: 'read-outside', duration: READ, caption: key('caption.readOutside') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 작은 원을 반쯤 돌아 기둥이 반쯤 쌓인 자리에서 연다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    /** 가닥 수는 스테이지 상수에서 온다 — state 가 글자로 옮겨 둔다 (G133). */
    vars: { n: 'lineCount' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **기둥이 기준선에 닿는가**다 —
   * N 점선과 0 선 둘이 그 기준이다.
   */

  messages: gausssLawMessages,
};
