// ========================================================================
// law-of-reflection — 선언
// ========================================================================
// 질문: 거울에 들어온 빛은 어느 쪽으로 나가는가.
//
// 답: 거울에 세운 법선을 사이에 두고, 들어온 빛과 같은 각으로 반대쪽에 나간다.
// 들어오는 빛을 20° → 45° → 70° 로 눕히면 나가는 빛도 반대쪽에서 같은 값으로 따라
// 눕고, 두 각을 표시한 호는 법선을 접는 선으로 한 거울상이다.
//
// 거울을 기울이는 경우(거울이 θ 돌면 반사 광선은 2θ)는 넣지 않는다 — 주장 하나.
// 물결의 반사(`reflection-of-waves`)는 줄 끝의 위상을 말하므로 겹치지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:law-of-reflection` 와 문자 그대로 일치한다 (C4). */
export const LAW_OF_REFLECTION_ID = 'law-of-reflection';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 각은 모두 **법선에서 잰 입사각(도)** 이다. 화면의 각도 글자는 이 값 그대로다.
// ------------------------------------------------------------------------

/** 첫 멈춤의 입사각(°). */
export const ANGLE_A = 20;
/** 둘째 멈춤의 입사각(°). */
export const ANGLE_B = 45;
/** 셋째 멈춤의 입사각(°). */
export const ANGLE_C = 70;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 거울면이 y = 0, 빛이 닿는 점이 원점이다.
// ------------------------------------------------------------------------

/** 거울 길이의 절반(월드). */
export const MIRROR_HALF = 3.4;
/** 들어오는 빛 · 나가는 빛의 길이(월드). 둘이 같아 끝점도 거울상이다. */
export const RAY_LENGTH = 3;
/** 법선 점선의 길이(월드). 광선보다 조금 길게 — 20° 에서도 광선 끝 위로 올라온다. */
export const NORMAL_LENGTH = 3.3;
/** 각을 표시하는 호의 반지름(월드). */
export const ARC_RADIUS = 1.3;
/**
 * 각도 글자가 놓이는 반지름(월드). 호 바깥, 호를 이등분하는 방향. 20° 에서도 두 글자가
 * 법선 양쪽으로 떨어져 서도록 멀리 둔다 — 가까우면 이등분선이 법선에 붙어 두 칩이 맞붙는다.
 */
export const ARC_LABEL_RADIUS = 2.05;
/** 광선 이름표가 광선 바깥 끝에서 더 나간 거리(월드). */
export const RAY_LABEL_GAP = 0.42;
/** 법선 이름표가 법선 위 끝에서 더 올라간 거리(월드). */
export const NORMAL_LABEL_GAP = 0.25;
/** 「거울」 이름표 자리(월드). 거울 오른쪽 끝 아래. */
export const MIRROR_LABEL_POS: readonly [number, number] = [2.85, -0.42];

/**
 * 프레이밍 — 가로는 70° 에서 누운 광선의 이름표까지, 세로는 20° 에서 선 광선의 이름표와
 * 거울 뒤 결 · 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -4.4, maxX: 4.4, minY: -0.95, maxY: 3.65 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lawOfReflectionMessages = Object.freeze({
  'label.title': { ko: '반사 법칙', en: 'Law of reflection' },
  'label.stage': { ko: '평면거울', en: 'Flat mirror' },
  'label.view': { ko: '거울 앞', en: 'In front of the mirror' },

  /** 도식 이름표. */
  'label.normal': { ko: '법선', en: 'normal' },
  'label.mirror': { ko: '거울', en: 'mirror' },
  'label.incident': { ko: '들어오는 빛', en: 'incoming light' },
  'label.reflected': { ko: '나가는 빛', en: 'outgoing light' },
  /** 호 옆 각도. 값은 스테이지 상수 그대로 끼운다 (C1 · S-piece 유효숫자). */
  'label.degree': { ko: '{deg}°', en: '{deg}°' },

  'caption.holdA': {
    ko: '들어오는 빛이 법선과 {a}° — 나가는 빛도 법선 반대쪽에서 {a}° 를 이룬다.',
    en: 'The incoming light makes {a}° with the normal — the outgoing light makes {a}° on the other side.',
  },
  'caption.holdB': {
    ko: '들어오는 빛이 법선과 {b}° — 나가는 빛도 법선 반대쪽에서 {b}° 를 이룬다.',
    en: 'The incoming light makes {b}° with the normal — the outgoing light makes {b}° on the other side.',
  },
  'caption.holdC': {
    ko: '들어오는 빛이 법선과 {c}° — 나가는 빛도 법선 반대쪽에서 {c}° 를 이룬다.',
    en: 'The incoming light makes {c}° with the normal — the outgoing light makes {c}° on the other side.',
  },
  'caption.tilt': {
    ko: '들어오는 빛을 더 눕힌다 — 나가는 빛이 반대쪽으로 함께 눕고, 두 호가 같이 벌어진다.',
    en: 'The incoming light tilts further — the outgoing light tilts with it on the other side, and both arcs widen together.',
  },
  'caption.raise': {
    ko: '들어오는 빛을 다시 세운다 — 나가는 빛도 함께 서고, 두 호가 같이 좁아진다.',
    en: 'The incoming light rises again — the outgoing light rises with it, and both arcs narrow together.',
  },
} satisfies Record<string, LocalizedText>);

export type LawOfReflectionMessageKey = keyof typeof lawOfReflectionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LawOfReflectionMessageKey): LocalizedText => lawOfReflectionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LawOfReflectionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lawOfReflectionSchema: BundleSchema = {
  id: LAW_OF_REFLECTION_ID,
  title: text('label.title'),
  category: 'optics',
  timeModel: 'periodic',

  // 조작기가 없다. 세 입사각을 차례로 멈춰 보여 주는 것으로 비교가 끝난다 — 각을 끌게
  // 하면 멈춘 값이 선언값이 아니게 되어 각도 글자를 띄울 수 없다(계산값 반올림 금지).
  parameters: [],

  stages: [
    {
      id: 'flat-mirror',
      label: text('label.stage'),
      constants: { angleA: ANGLE_A, angleB: ANGLE_B, angleC: ANGLE_C },
    },
  ],

  environments: [],

  views: [{ id: 'mirror', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 누운 광선이 좌우로 뻗는다. 세로는 선 광선과 캡션 한 줄이면 된다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 호 → 법선 → 거울 → 광선 → 글자 순. 호의 옅은 채움이 광선 · 법선 아래에 깔려야 한다.
   * plugin 어휘(`ray` · `opticalElement`)는 층에서 호보다 앞설 수 있어 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 20° 멈춤 → 45° 로 눕힘 → 45° 멈춤 → 70° 로 눕힘 → 70° 멈춤 → 20° 로 되세움.
   *
   * 입사각은 `turn-*` 단계의 진행도를 세 선언값 사이에 이어 얻는다(`physics.ts incidenceDeg`).
   * 각도 글자는 `hold-*` 단계에서만 뜬다 — 도는 동안의 각은 계산값이라 띄우지 않는다.
   */
  timeline: {
    phases: [
      { id: 'hold-a', duration: 2.8, caption: key('caption.holdA') },
      { id: 'turn-ab', duration: 1.5, ease: 'smooth', caption: key('caption.tilt') },
      { id: 'hold-b', duration: 2.8, caption: key('caption.holdB') },
      { id: 'turn-bc', duration: 1.5, ease: 'smooth', caption: key('caption.tilt') },
      { id: 'hold-c', duration: 2.8, caption: key('caption.holdC') },
      { id: 'turn-ca', duration: 1.9, ease: 'smooth', caption: key('caption.raise') },
    ],
  },

  /** 도착한 순간 두 광선과 두 호가 이미 서 있다 — 첫 멈춤 한가운데서 연다 (S-piece). */
  startAt: 0.6,

  /** 슬롯 하나. 거울 아래 가운데 한 줄. 각도는 state 가 스테이지 상수에서 옮긴 글자다(G133). */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { a: 'angleA', b: 'angleB', c: 'angleC' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 거리가 아니라 법선에서 잰 각이고,
  // 그것은 호와 각도 글자가 직접 보인다.

  messages: lawOfReflectionMessages,
};
