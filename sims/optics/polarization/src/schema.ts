// ========================================================================
// polarization — 선언
// ========================================================================
// 질문: 축이 직각인 두 편광판은 빛을 막는다. 그런데 판을 하나 더 끼웠을 뿐인데 왜 빛이 다시 나오는가.
//
// 동사: 되살아난다 — 비스듬한 판이 진동을 기울여 놓아, 마지막 판을 지날 몫이 생긴다.
// 원본: tasks/piece-lab/polarization.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:polarization` 와 문자 그대로 일치한다 (C4). */
export const POLARIZATION_ID = 'polarization';

// ------------------------------------------------------------------------
// 물리 · 배치 상수 — 원본 index.html 의 값 그대로
// ------------------------------------------------------------------------

/** 편광판 반쪽 크기(세계 길이). */
export const HALF = 1.2;
/** 뺀 가운데 판이 떠 있는 높이. */
export const LIFT = 2.6;
/** 관찰자 쪽 가로축(x)의 비스듬한 투영 — 가로 1 이 화면에서 (DX, −DY) 로 간다. */
export const DX = -0.55;
export const DY = 0.45;
/** 파장 · 진행 빠르기 · 편광되지 않은 빛의 묶음 길이. */
export const LAMBDA = 0.9;
export const SPEED = 1.3;
export const PACKET = 1.35;
/** 묶음 방향 표. 원본은 시드 난수(mulberry32, seed 1)로 64 개를 뽑는다. */
export const PACKET_COUNT = 64;
export const PACKET_SEED = 1;
/** 진동 곡선 표본 간격 · 시작에서 진폭이 차오르는 길이. */
export const FIELD_DZ = 0.05;
export const FIELD_FADE_IN = 0.6;
/** 결(해칭) 간격과 범위, 축선 반길이 — 판 좌표. */
export const HATCH_GAP = 0.24;
export const HATCH_REACH = 1.7;
export const SLOT_REACH = 2;
/** 스크린 빛 번짐 반지름과 그라데이션 중간 멈춤(자리 0.45 에서 세기 0.55). */
export const GLOW_RADIUS = 1.05;
export const GLOW_MID = { at: 0.45, level: 0.55 } as const;
/** 스크린 칠 격자 — 원본 배율에서 칸 하나가 화면 약 1 px. */
export const SCREEN_GRID = { cols: 66, rows: 174 } as const;
/** 캡션 구간 — 상대 세기 3% 미만 「막힌다」, 50% 미만 「희미하게」. */
export const DIM_BELOW = 0.03;
export const REVIVED_FROM = 0.5;
/** 조작 시 가운데 판이 빛길 안팎으로 옮겨 가는 시간(초). */
export const MOVE_SECONDS = 0.7;

/**
 * 원본 캔버스 — 폭 876(촬영 창 900 에서 여백을 뺀 값) × 높이 330 px. 원본은 폭에서 판 자리를 정하므로
 * 그 폭 하나로 고정해 옮긴다. 배율 S 와 원점은 원본 `layout()` 의 식 그대로다.
 */
export const ORIGINAL_CANVAS = { width: 876, height: 330 } as const;
const TOP = HALF + LIFT + DY * HALF + 0.15;
const BOTTOM = HALF + DY * HALF + 0.1;
/** 원본 배율(px / 세계 1). */
export const ORIGINAL_S = (ORIGINAL_CANVAS.height - 16) / (TOP + BOTTOM);
const OY = 8 + TOP * ORIGINAL_S;
const OX = 16 + -DX * HALF * ORIGINAL_S;
const Z_END = (ORIGINAL_CANVAS.width - OX - -DX * HALF * ORIGINAL_S - 12) / ORIGINAL_S;

/** 진행 축 위의 자리 — 첫 판 · 가운데 판 · 마지막 판 · 스크린. */
export const Z = {
  start: 0,
  p1: Z_END * 0.25,
  p2: Z_END * 0.52,
  p3: Z_END * 0.79,
  screen: Z_END,
} as const;

/** 캡션 · 조작 줄 자리(화면 px). 원본에서 캔버스 아래 두 줄이던 것. */
export const BOTTOM_BAND_PX = 92;

/** 프레이밍 — 원본 캔버스 사각형에 아래 띠를 더한 것(투영 평면 단위, y 위). */
export const SCENE_BOUNDS = {
  minX: -OX / ORIGINAL_S,
  maxX: (ORIGINAL_CANVAS.width - OX) / ORIGINAL_S,
  minY: -(ORIGINAL_CANVAS.height - OY + BOTTOM_BAND_PX) / ORIGINAL_S,
  maxY: OY / ORIGINAL_S,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const polarizationMessages = Object.freeze({
  'label.title': { ko: '편광', en: 'Polarization' },
  'label.stage': { ko: '기본', en: 'Default' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 판 각도 표식. 기호라 두 언어가 같다 (C1 판정 3). */
  'label.first': { ko: '0°', en: '0°' },
  'label.last': { ko: '90°', en: '90°' },
  'label.middle': { ko: '{deg}°', en: '{deg}°' },
  'control.remove': { ko: '가운데 판 빼기', en: 'Remove middle sheet' },
  'control.insert': { ko: '가운데 판 끼우기', en: 'Insert middle sheet' },
  'control.angle': { ko: '가운데 판 각도', en: 'Middle sheet angle' },
  'caption.blocked': {
    ko: '두 판의 축이 직각이다. 첫 판을 지난 세로 진동은 가로 축 판에서 남김없이 사라져 스크린이 어둡다.',
    en: 'The two axes are at right angles. The vertical vibration leaving the first sheet vanishes completely at the horizontal sheet, so the screen is dark.',
  },
  'caption.inserting': {
    ko: '두 판 사이에 세 번째 판을 끼운다.',
    en: 'A third sheet slides in between the two.',
  },
  'caption.removing': {
    ko: '가운데 판을 빛길에서 뺀다.',
    en: 'The middle sheet is pulled out of the beam.',
  },
  'caption.parallel': {
    ko: '가운데 판이 첫 판과 나란하다. 진동이 세로 그대로라 마지막 판에서 막힌다.',
    en: 'The middle sheet is parallel to the first. The vibration stays vertical, so the last sheet blocks it.',
  },
  'caption.crossed': {
    ko: '가운데 판이 첫 판과 직각이다. 세로 진동이 가운데 판에서 이미 사라진다.',
    en: 'The middle sheet is at right angles to the first. The vertical vibration already vanishes at the middle sheet.',
  },
  'caption.dim': {
    ko: '가운데 판이 조금만 기울었다. 진동이 그만큼만 기울어 스크린이 희미하게 밝아진다.',
    en: 'The middle sheet is only slightly tilted. The vibration tilts just that much, and the screen glows faintly.',
  },
  'caption.revived': {
    ko: '비스듬한 가운데 판이 진동을 기울여 놓는다. 기운 진동의 가로 몫이 마지막 판을 지나 빛이 되살아난다.',
    en: 'The slanted middle sheet tilts the vibration. The horizontal share of the tilted vibration passes the last sheet, and the light comes back.',
  },
} satisfies Record<string, LocalizedText>);

export type PolarizationMessageKey = keyof typeof polarizationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: PolarizationMessageKey): LocalizedText => polarizationMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PolarizationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const polarizationSchema: BundleSchema = {
  id: POLARIZATION_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 330 px 에 캡션 · 조작 줄을 더한 높이. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 330 + BOTTOM_BAND_PX, minHeight: 360 },

  /** 겹침은 원본 그리기 순서 — 빛길 · 진동 · 첫 판 · 가운데 판 · 마지막 판 · 스크린. */
  drawOrder: 'scene',

  /**
   * 14 초 주기. 원본 `applyAuto` 의 구간 그대로다. 도착 순간은 원본처럼 주기 첫머리 —
   * 판이 떠 있고 진동은 이미 흐른다(진동은 시각의 함수라 비어 있는 순간이 없다).
   *
   * 판을 돌리는 두 단계(`turn90` · `turn180`)는 캡션이 **값**(상대 세기)으로 갈려 단계 캡션이 없다.
   * 그 동안은 캡션 슬롯의 `cases` 가 문장을 고른다(NOTES 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'out', duration: 2.5, caption: key('caption.blocked') },
      { id: 'insert', duration: 0.7, ease: 'smooth', caption: key('caption.inserting') },
      { id: 'bright', duration: 2.8, caption: key('caption.revived') },
      { id: 'turn90', duration: 2, ease: 'smooth' },
      { id: 'turn180', duration: 3, ease: 'smooth' },
      { id: 'hold180', duration: 0.7, caption: key('caption.parallel') },
      { id: 'remove', duration: 0.7, ease: 'smooth', caption: key('caption.removing') },
      { id: 'reset', duration: 1.6, ease: 'smooth', caption: key('caption.blocked') },
    ],
  },

  caption: {
    anchor: { screen: 'bottom-left', offset: [0, -40] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'capBlocked', text: key('caption.blocked') },
      { when: 'capInserting', text: key('caption.inserting') },
      { when: 'capRemoving', text: key('caption.removing') },
      { when: 'capParallel', text: key('caption.parallel') },
      { when: 'capCrossed', text: key('caption.crossed') },
      { when: 'capDim', text: key('caption.dim') },
      { when: 'capRevived', text: key('caption.revived') },
    ],
  },

  // 그리드 · 카메라 버튼 없음 (기본). 원본에 없다.

  messages: polarizationMessages,
};
