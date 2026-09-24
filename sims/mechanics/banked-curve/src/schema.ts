// ========================================================================
// banked-curve — 선언
// ========================================================================
// 질문: 마찰이 없는 빙판길인데, 무엇이 차를 커브 안쪽으로 돌려 주는가?
// 답의 동사: (기울기를 맞추면) 돈다 — 모자라면 바깥으로, 넘치면 안쪽으로 미끄러져 나간다.
//
// 왼쪽 칸은 길을 반지름 방향으로 자른 단면(기울기 · 힘), 오른쪽 칸은 위에서 본 둥근 길
// (도는지). 차는 마찰 없는 원뿔면 위의 질점으로 적분된다. 0° · 15° · 45° · 맞춘 각을
// 차례로 시도하고, 앞 시도의 자취를 흐리게 남긴다.
// 원본: tasks/piece-lab/banked-curve
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:banked-curve` 와 문자 그대로 일치한다 (C4). */
export const BANKED_CURVE_ID = 'banked-curve';

// ------------------------------------------------------------------------
// 물리 — 원본 상수 그대로
// ------------------------------------------------------------------------

/** 중력 가속도 (m/s²). */
export const G = 9.8;
/** 차의 빠르기 (m/s). */
export const V = 15;
/** 길 가운데 반지름 (m). */
export const R0 = 40;
/** 길 너비의 절반 (m) → 34 m ~ 46 m. */
export const HALF_W = 6;
export const R_IN = R0 - HALF_W;
export const R_OUT = R0 + HALF_W;
/** 맞춘 각(도) = atan(v²/(r g)) ≈ 29.85°. */
export const THETA_MATCH = (Math.atan((V * V) / (R0 * G)) * 180) / Math.PI;
/** 화면 1초 = 물리 2초 (한 바퀴 16.8초 → 8.4초). 화면에 적지 않는다 (원본 inventory 「hidden」). */
export const TIME_SCALE = 2;
/** 한 걸음 안의 RK4 부분 단계. */
export const SUB = 4;
/**
 * 적분 걸음(초). 원본은 이 고정 걸음으로만 적분했다. 러너의 걸음은 기기마다 다르므로
 * `step` 이 이 걸음으로 쪼개 쌓는다 — 결과 미리 알기(`predict`)와 실제 달리기가 같은
 * 걸음이어야 캡션이 말한 결과가 화면에서 그대로 일어난다.
 */
export const FIXED_DT = 1 / 60;
/** 결과 미리 알기가 보는 최대 걸음 수 (12 초). */
export const PREDICT_FRAMES = 60 * 12;

/** 자동으로 시도하는 기울기(도) — 0° · 모자람 · 넘침 · 맞춤. 순서는 주장이 정한다. */
export const ATTEMPTS: readonly number[] = [0, 15, 45, THETA_MATCH];

/** 길이 기우는 시간(초). */
export const T_TILT = 0.8;
/** 길을 벗어난 뒤 곧게 나아가며 흐려지는 시간(초). */
export const T_FLY = 0.45;
/** 벗어난 뒤 멈춰 보이는 시간(초). */
export const T_HOLD = 0.7;
/** 한 바퀴를 마친 뒤 멈춰 보이는 시간(초). */
export const T_HOLD_LAP = 1.2;

/** 이 각(도) 아래는 평평한 길로 본다 — 호를 긋지 않고 캡션이 「빙판」을 말한다. */
export const FLAT_EPS = 0.05;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 880×340 px 의 좌표를 그대로 적는다.
// 월드 1 단위 = 원본 100 px, y 는 위 (`px` · `py` 는 scene 이 월드로 옮긴다).
// ------------------------------------------------------------------------

/** 원본 캔버스 크기(px). */
export const ORIGIN_CANVAS = { width: 880, height: 340 } as const;

/** 단면도: 중심점 · m 당 px · 1 m/s² 당 화살표 px · 길 바닥 높이. 왼쪽이 원의 중심 쪽. */
export const SECTION = { cx: 205, cy: 190, pxPerM: 15, pxPerAccel: 8.5, floorY: 300 } as const;
/** 경사각 표시: 수평 점선 길이 · 호 반지름 · 글자 자리. */
export const ANGLE_MARK = { lineLength: 70, arcRadius: 52, textDx: 4, textDy: 14 } as const;
/** 「원의 중심 쪽」 화살표와 글자 자리. */
export const CENTER_MARK = { fromX: 60, toX: 22, y: 312, textX: 66 } as const;
/** 「길을 벗어났다」 글자 높이. */
export const OFF_ROAD_Y = 40;
/** 단면 위 차의 크기(px). */
export const SECTION_CAR = { width: 30, height: 16 } as const;
/** 위쪽 두 줄의 높이(px) — 필요한 만큼 막대 · 안쪽 몫 화살표. */
export const COMPARE_ROWS = { needY: 40, inwardY: 68, tick: 6, textDx: 10 } as const;
/** 무게 글자 자리(화살표 끝에서). 길이 미는 힘 글자는 화살표 가운데에서 오른쪽으로 띄운다. */
export const FORCE_LABELS = { weightDx: 8, weightDy: -8, normalDx: 10 } as const;
/** 화살촉 크기(px). 원본 min(9, 길이/2). */
export const ARROW_HEAD = 9;
/** 안쪽 몫이 이 길이(px) 아래면 화살표 대신 점을 찍는다. */
export const INWARD_DOT_BELOW = 1;

/** 위에서 본 길: 중심 · m 당 px · 중심 점 반지름(px). */
export const TOP = { cx: 640, cy: 158, pxPerM: 3.2, hubRadius: 2.5 } as const;
/** 위에서 본 차의 크기(px). */
export const TOP_CAR = { width: 18, height: 10 } as const;
/** 지난 시도의 각도 글자 자리(자취 끝에서, px). */
export const PAST_LABEL = { dx: 6, dy: -8 } as const;

/**
 * 프레이밍 — 원본 캔버스 전체와, 그 아래 캡션·조작기 줄. 원본은 캡션과 조작기를 캔버스
 * **아래** DOM 에 두었다. 임베드에서는 그림 위에 얹히므로 그 몫만큼 경계를 아래로 넓혀
 * 자리를 비운다. 고정값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 8.8, minY: -0.62, maxY: 3.4 } as const;

// ------------------------------------------------------------------------
// 조작기
// ------------------------------------------------------------------------

export const SLIDER_RANGE: [number, number] = [0, 50];
export const SLIDER_STEP = 0.1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bankedCurveMessages = Object.freeze({
  'label.title': { ko: '경사진 커브', en: 'Banked curve' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  'label.slider': { ko: '경사각', en: 'Bank angle' },
  'label.auto': { ko: '자동으로 보기', en: 'Play automatically' },
  'label.angle': { ko: '{deg}°', en: '{deg}°' },
  'label.center': { ko: '원의 중심 쪽', en: 'toward the centre' },
  'label.offRoad': { ko: '길을 벗어났다', en: 'Off the road' },
  'label.weight': { ko: '무게', en: 'weight' },
  'label.normal': { ko: '길이 미는 힘', en: 'push of the road' },
  'label.need': { ko: '돌기에 필요한 만큼', en: 'needed to turn' },
  'label.inward': { ko: '길이 안쪽으로 미는 몫', en: 'inward share of the push' },
  'caption.tilt': { ko: '길을 {to}°로 기울인다', en: 'The road tilts to {to}°' },
  'caption.round': {
    ko: '기울기 {deg}° — 마찰 없이도 차가 원을 따라 돈다',
    en: 'Bank {deg}° — the car goes round the circle with no friction at all',
  },
  'caption.flat': {
    ko: '기울기 {deg}° — 빙판 위의 차는 곧게 나아가 바깥으로 미끄러져 나간다',
    en: 'Bank {deg}° — on ice the car goes straight and slides off the outside',
  },
  'caption.out': {
    ko: '기울기 {deg}° — 안쪽으로 미는 몫이 모자라 바깥으로 밀려난다',
    en: 'Bank {deg}° — the inward share falls short, so the car is pushed outward',
  },
  'caption.in': {
    ko: '기울기 {deg}° — 안쪽으로 미는 몫이 넘쳐 안쪽으로 미끄러져 내려간다',
    en: 'Bank {deg}° — the inward share is too much, so the car slides down inward',
  },
} satisfies Record<string, LocalizedText>);

export type BankedCurveMessageKey = keyof typeof bankedCurveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: BankedCurveMessageKey): LocalizedText => bankedCurveMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BankedCurveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bankedCurveSchema: BundleSchema = {
  id: BANKED_CURVE_ID,
  title: text('label.title'),
  category: 'mechanics',
  timeModel: 'periodic',

  // 빠르기·반지름은 주장이 아니다 (원본 inventory 「hidden」). 경사각만 조작기로 둔다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px + 캡션 줄 + 조작기 줄. */
  canvas: { height: 430, minHeight: 400 },

  /**
   * 시간표를 두지 않는다. 원본은 단계 경계가 아니라 **누적 상태**로 움직인다 — 시도마다
   * 차가 적분되고, 벗어나는 시각은 기울기에 달렸으며(0° 는 0.77 초, 15° 는 약 1.1 초),
   * 조작기가 시도를 아무 때나 끊는다. 그래서 `step` 이 상태를 쌓는다.
   * 원본은 t = 0 에 차가 막 출발한 채로 열리므로 `startAt` · `preroll` 도 없다.
   */

  // 원본이 그린 순서 그대로 겹친다 — 안쪽 원판이 바깥 원판을 덮어 고리가 되고,
  // 단면의 차가 길 윗변을, 자취 위에 차가 얹힌다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 한 줄, 16 px 본문 먹색. 문장은 상태(단계 · 미리 안 결과 · 기울기)로 갈린다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [-12, -40] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.in'),
    cases: [
      { when: 'caption.tilt', text: key('caption.tilt') },
      { when: 'caption.round', text: key('caption.round') },
      { when: 'caption.flat', text: key('caption.flat') },
      { when: 'caption.out', text: key('caption.out') },
    ],
    vars: { deg: 'caption.deg', to: 'caption.to' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 공식·빠르기·반지름·합력은 원본 inventory 「hidden」.

  messages: bankedCurveMessages,
};
