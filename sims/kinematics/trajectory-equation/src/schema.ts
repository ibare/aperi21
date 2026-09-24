// ========================================================================
// trajectory-equation — 선언
// ========================================================================
// 질문: x 도 시간에 따라 변하고 y 도 시간에 따라 변하는데, 시간을 소거하면
// 무엇이 남는가.
//
// 공이 지나간 점마다 붙어 있던 시각을 지워도 경로는 그대로 남는다. 동사는
// **지워진다** — 지우개가 왼쪽에서 오른쪽으로 쓸고 가며 시각 눈금만 걷어 낸다.
//
// 원본: tasks/piece-lab/trajectory-equation/index.html. 상수는 원본 그대로다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:trajectory-equation` 와 문자 그대로 일치한다 (C4). */
export const TRAJECTORY_EQUATION_ID = 'trajectory-equation';

// ------------------------------------------------------------------------
// 물리 — 원본 V0 · ANGLE · G
// ------------------------------------------------------------------------

/** 처음 속력(m/s). 계산에만 쓰고 화면에 두지 않는다 (NOTES). */
export const V0 = 20;
/** 발사각(라디안). 50° — 가로로 긴 포물선이라 세로를 아낀다. */
export const ANGLE = (50 * Math.PI) / 180;
/** 중력 가속도(m/s²). */
export const G = 9.8;

export const VX = V0 * Math.cos(ANGLE);
export const VY = V0 * Math.sin(ANGLE);
/** 떠 있는 시간(초). 약 3.13. 시간표의 첫 단계 길이다. */
export const T_FLIGHT = (2 * VY) / G;
/** 수평 도달 거리(m). 약 40.2. */
export const RANGE = VX * T_FLIGHT;

/** 시각 눈금 간격(초). 원본 TICK. */
export const TICK = 0.5;
/** 지우개가 지나간 뒤 눈금이 사라지는 거리(m). 원본 ERASE_FADE_M. */
export const ERASE_FADE_M = 2.5;
/** 지면 선이 도달 거리 양옆으로 더 뻗는 길이(m). 원본 `sx(-1.5)` · `sx(RANGE + 1.5)`. */
export const GROUND_OVERHANG = 1.5;

/**
 * 프레이밍. 원본 캔버스(폭 840 기준 · 높이 280)에서 배율은 세로가 정했다 —
 * `(280 − 44 − 34) / H_MAX ≈ 16.8 px/m`. 그 배율과 여백을 월드로 옮겼다.
 *
 * - 위 여백 44 px, 아래 여백 34 px, 좌우 48 px (원본 padTop · padBottom · padX)
 * - 원본은 캡션을 캔버스 **아래 줄**에 두었다. 엔진은 캔버스 안에 그리므로 그
 *   줄(약 40 px)을 아래 여백에 더했다.
 * - 러너가 변마다 비우는 36 px(맞춤 여백 12 + 기본 여백 24)를 빼고 옮긴다.
 *
 *   maxY = (246 − 36) / 16.8 = 12.5       (지면이 캔버스 위에서 246 px)
 *   minY = −(284 − 246) / 16.8 ≈ −2.26    (캔버스 320 − 여백 36)
 *   좌우 = (48 − 36) / 16.8 ≈ 0.71
 */
export const SCENE_BOUNDS = {
  minX: -0.71,
  maxX: RANGE + 0.71,
  minY: -2.26,
  maxY: 12.5,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const trajectoryEquationMessages = Object.freeze({
  'label.title': {
    ko: '궤적 방정식',
    en: 'Trajectory equation',
    ja: '軌跡の方程式',
    zh: '轨迹方程',
    ar: 'معادلة المسار',
    es: 'Ecuación de la trayectoria',
    fr: 'Équation de la trajectoire',
    hi: 'प्रक्षेप-पथ समीकरण',
    id: 'Persamaan lintasan',
    pt: 'Equação da trajetória',
  },
  'label.operation': {
    ko: '시간을 소거해 얻은 경로의 식',
    en: 'The path left when time is eliminated',
    ja: '時間を消去したあとに残る経路',
    zh: '消去时间后留下的路径',
    ar: 'المسار المتبقي عند حذف الزمن',
    es: 'La trayectoria que queda al eliminar el tiempo',
    fr: 'La trajectoire qui reste quand on élimine le temps',
    hi: 'समय को विलोपित करने पर बचा पथ',
    id: 'Lintasan yang tersisa ketika waktu dieliminasi',
    pt: 'A trajetória que resta quando o tempo é eliminado',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  /** 경로 위 시각 눈금. 값이 끼어드는 조립문이라 문안이다 (C1). */
  'label.tick': {
    ko: '{t}초',
    en: '{t} s',
    ja: '{t} s',
    zh: '{t} s',
    ar: '{t} s',
    es: '{t} s',
    fr: '{t} s',
    hi: '{t} s',
    id: '{t} s',
    pt: '{t} s',
  },
  'caption.flying': {
    ko: '공은 시각마다 한 점씩 지나간다',
    en: 'At each instant the ball passes one point',
    ja: 'ボールは各時刻に一点ずつ通り過ぎる',
    zh: '球在每个时刻经过一个点',
    ar: 'في كل لحظة تمر الكرة بنقطة واحدة',
    es: 'En cada instante la pelota pasa por un punto',
    fr: 'À chaque instant, la balle passe par un point',
    hi: 'हर क्षण गेंद एक बिंदु से गुज़रती है',
    id: 'Pada setiap saat bola melewati satu titik',
    pt: 'A cada instante a bola passa por um ponto',
  },
  'caption.tagged': {
    ko: '지나간 점마다 시각이 붙어 있다',
    en: 'Every point it passed carries a time',
    ja: '通った点にはそれぞれ時刻がついている',
    zh: '经过的每个点都带着一个时刻',
    ar: 'كل نقطة مرّت بها تحمل زمنًا',
    es: 'Cada punto por el que pasó lleva un tiempo',
    fr: 'Chaque point traversé porte un instant',
    hi: 'जिस हर बिंदु से यह गुज़री, उस पर एक समय अंकित है',
    id: 'Setiap titik yang dilewati membawa satu waktu',
    pt: 'Cada ponto por onde passou carrega um instante',
  },
  'caption.erasing': {
    ko: '시각을 지운다',
    en: 'Erase the times',
    ja: '時刻を消す',
    zh: '擦去时刻',
    ar: 'نمحو الأزمنة',
    es: 'Borramos los tiempos',
    fr: 'On efface les instants',
    hi: 'समय मिटाते हैं',
    id: 'Hapus waktunya',
    pt: 'Apagamos os instantes',
  },
  'caption.remains': {
    ko: '시각이 없어도 경로는 그대로 남는다',
    en: 'Without the times, the path stays just the same',
    ja: '時刻がなくても、経路はそのまま残る',
    zh: '没有了时刻，路径依然不变',
    ar: 'من دون الأزمنة يبقى المسار كما هو تمامًا',
    es: 'Sin los tiempos, la trayectoria sigue igual',
    fr: 'Sans les instants, la trajectoire reste la même',
    hi: 'समय के बिना भी पथ ज्यों का त्यों रहता है',
    id: 'Tanpa waktu, lintasan tetap sama',
    pt: 'Sem os instantes, a trajetória continua igual',
  },
} satisfies Record<string, LocalizedText>);

export type TrajectoryEquationMessageKey = keyof typeof trajectoryEquationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: TrajectoryEquationMessageKey): LocalizedText {
  return trajectoryEquationMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TrajectoryEquationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

/** 캡션 글자 크기(화면 px). 원본 `.caption { font-size: 15px }`. */
const CAPTION_FONT_PX = 15;

export const trajectoryEquationSchema: BundleSchema = {
  id: TRAJECTORY_EQUATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 발사각 슬라이더는 "각에 따라 경로가 달라진다" 는 다른 주장이다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: { v0: V0, g: G } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 280 px + 아래 캡션 줄 40 px (`min-height 1.6em` + 위아래 여백 16). */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 그리는 순서가 원본과 같아야 한다 — 지면 → 경로 → 시각 눈금 → 지우개 → 공.
   * 지우개 띠가 지워지는 중인 눈금 **위에** 옅게 덮여야 "쓸고 간다" 로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 시간표 — 한 바퀴 10 초. 원본 PERIOD 와 단계 경계
   * (T_FLIGHT · LAND_HOLD_END 4.2 · ERASE_END 6.0 · FADE_START 9.0 · 페이드 0.8)를 그대로 옮겼다.
   *
   * - fly    — 공이 날며 0.5 초마다 눈금을 남긴다
   * - land   — 착지 뒤 공이 옅어지며 퇴장한다
   * - erase  — 지우개가 왼쪽에서 오른쪽으로 지나간다 (원본 `ease` = smoothstep)
   * - remain — 경로만 남은 화면을 보여 준다
   * - fade   — 경로가 흐려진다. 캡션은 말하지 않는다 (원본 빈 문자열)
   * - rest   — 빈 화면. 다음 발사를 기다린다
   */
  timeline: {
    phases: [
      { id: 'fly', duration: T_FLIGHT, caption: key('caption.flying') },
      { id: 'land', duration: 4.2 - T_FLIGHT, caption: key('caption.tagged') },
      { id: 'erase', duration: 1.8, ease: 'smooth', caption: key('caption.erasing') },
      { id: 'remain', duration: 3.0, caption: key('caption.remains') },
      { id: 'fade', duration: 0.8 },
      { id: 'rest', duration: 0.2 },
    ],
  },

  /** 도착한 순간 공이 이미 날고 있고 눈금 세 개가 찍혀 있다. 원본 OFFSET. */
  startAt: 1.2,

  /** 슬롯 하나. 원본은 캔버스 아래 줄 왼쪽(왼쪽 여백 16 px)에 문장을 둔다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [-8, 12] },
    align: 'left',
    fontSize: CAPTION_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 주장은 모양이 남는다는 것이라 좌표를
   * 읽을 필요가 없다.
   */

  messages: trajectoryEquationMessages,
};
