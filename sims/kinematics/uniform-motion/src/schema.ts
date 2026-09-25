// ========================================================================
// uniform-motion — 선언
// ========================================================================
// 질문: "속도가 변하지 않는다" 는 말은 눈으로 보면 무엇인가.
//
// 물체가 지나가며 1초마다 자국을 남긴다. 자국과 자국 사이가 모두 같다. 그 간격을
// 그 자리에서 떼어내 아래로 내려 왼쪽 끝을 맞춰 쌓으면 오른쪽 끝이 한 줄로 맞는다.
//
// 값은 모두 원본(tasks/piece-lab/uniform-motion/index.html)에서 그대로 옮겼다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:uniform-motion` 와 문자 그대로 일치한다 (C4). */
export const UNIFORM_MOTION_ID = 'uniform-motion';

// ------------------------------------------------------------------------
// 랩 — 한 바퀴의 시간 구조
// ------------------------------------------------------------------------

/**
 * 한 랩에서 남기는 걸음(구간) 수. 막대를 6개로 끊기 위해 고정한다 — 속도가
 * 느려도 자국이 열두 개로 불어나지 않는다. 속도가 바꾸는 것은 개수가 아니라
 * 간격이어야 한다.
 */
export const STEPS = 6;

/** 랩 주기(초) = 6초 진행 + 1초 마무리와 전환. */
export const LAP = 7.0;

/** 랩이 열릴 때 밝아지는 시간(초). */
export const FADE_IN = 0.28;

/**
 * 도착한 순간의 랩 위상(초). **랩이 막 열려 물체가 다 밝아진 참**이다 — 물체는 이미
 * 출발해 움직이고(S-piece: 빈 화면도 멈춘 화면도 아니다), 자국은 아직 없다.
 *
 * 원본은 3.05초(세 걸음째)에서 열었다. 그러면 막대가 이미 절반 쌓인 채로 보여
 * "자국이 하나씩 찍히고 쌓인다" 는 주장을 중간부터 읽게 된다 — 열면 중간부터
 * 시작한다는 사용자 판정으로 바꿨다 (2026-09-17).
 *
 * 이 조각은 `lapT` 를 **누적**하므로 `startAt`(시계 앞당김)으로는 옮겨지지 않는다.
 * 마운트 전에 실제로 그만큼 걸어야 한다 — 그것이 `preroll` 이다.
 */
export const PHASE0 = FADE_IN;
/** 랩이 저물기 시작하는 시각(초). */
export const FADE_OUT_START = 6.62;
/** 저무는 데 걸리는 시간(초). 6.62 + 0.38 = 7.0 — 랩 끝에 정확히 닿는다. */
export const FADE_OUT = 0.38;

/** 자국이 찍힌 뒤 강조가 잦아드는 시간(초). 반원 파동의 수명이기도 하다. */
export const MARK_LIFE = 0.42;

/** 구간 막대가 제자리에서 제 줄까지 내려가는 시간(초). */
export const BAR_TRAVEL = 0.5;
/** 막대가 떨어져 나오는 동안 옅음에서 벗어나는 구간(이동 진행도 기준). */
export const BAR_FADE_IN = 0.2;
/** 막 떨어져 나온 막대의 옅기. 제 줄에 닿을 즈음 1 이 된다. */
export const BAR_FADE_FLOOR = 0.35;

// ------------------------------------------------------------------------
// 빠르기 — 유일한 조작기가 바꾸는 값
// ------------------------------------------------------------------------

/**
 * 무차원. 1.00 이면 6초에 트랙을 끝까지 간다.
 *
 * 속도를 px/초 상수로 두지 않는다 — 트랙 폭에 비례해 잡으므로 컨테이너가
 * 좁아져도 랩이 깨지지 않는다 (원본 NOTES (d) 4).
 */
export const SPEED_MIN = 0.45;
export const SPEED_MAX = 1.0;
export const SPEED_DEFAULT = 0.88;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const uniformMotionMessages = Object.freeze({
  'label.title': {
    ko: '등속 운동',
    en: 'Uniform motion',
    ja: '等速運動',
    zh: '匀速运动',
    ar: 'الحركة المنتظمة',
    es: 'Movimiento uniforme',
    fr: 'Mouvement uniforme',
    hi: 'एकसमान गति',
    id: 'Gerak lurus beraturan',
    pt: 'Movimento uniforme',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '속도가 변하지 않는 운동',
    en: 'Motion whose velocity does not change',
    ja: '速度が変わらない運動',
    zh: '速度不变的运动',
    ar: 'حركة لا تتغير سرعتها المتجهة',
    es: 'Movimiento cuya velocidad no cambia',
    fr: 'Mouvement dont la vitesse ne change pas',
    hi: 'ऐसी गति जिसका वेग नहीं बदलता',
    id: 'Gerak yang kecepatannya tidak berubah',
    pt: 'Movimento cuja velocidade não muda',
  },
  'label.stage': {
    ko: '바닥',
    en: 'Ground',
    ja: '地面',
    zh: '地面',
    ar: 'الأرض',
    es: 'Suelo',
    fr: 'Sol',
    hi: 'ज़मीन',
    id: 'Tanah',
    pt: 'Chão',
  },
  'label.view': {
    ko: '자국',
    en: 'Marks',
    ja: '跡',
    zh: '痕迹',
    ar: 'العلامات',
    es: 'Marcas',
    fr: 'Traces',
    hi: 'निशान',
    id: 'Jejak',
    pt: 'Marcas',
  },
  /**
   * 한 문장으로 고정한다. 빠르기를 바꾸든 말든 화면이 말하는 것은 하나다
   * (원본 NOTES (d) 「누가 강제하면 안 되는 것」).
   */
  'caption.main': {
    ko: '1초마다 자국 하나. 자국과 자국 사이가 모두 같다.',
    en: 'One mark every second — every gap the same.',
    ja: '1秒ごとに跡が1つ — 間隔はすべて同じ。',
    zh: '每秒一个痕迹——每个间隔都相同。',
    ar: 'علامة واحدة كل ثانية — وكل الفجوات متساوية.',
    es: 'Una marca cada segundo — todos los espacios iguales.',
    fr: 'Une trace chaque seconde — tous les écarts égaux.',
    hi: 'हर सेकंड एक निशान — हर अंतराल बराबर।',
    id: 'Satu jejak tiap detik — setiap jarak sama.',
    pt: 'Uma marca a cada segundo — todos os espaços iguais.',
  },
  /** 원본은 슬라이더 양옆에 「느리게 ↔ 빠르게」를 두었다. 코어 슬라이더는 이름표가 하나다. */
  'control.speed': {
    ko: '빠르기',
    en: 'Speed',
    ja: '速さ',
    zh: '速率',
    ar: 'السرعة',
    es: 'Rapidez',
    fr: 'Vitesse',
    hi: 'चाल',
    id: 'Kelajuan',
    pt: 'Velocidade',
  },
}) satisfies Record<string, LocalizedText>;

export type UniformMotionMessageKey = keyof typeof uniformMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: UniformMotionMessageKey): LocalizedText {
  return uniformMotionMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: UniformMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const uniformMotionSchema: BundleSchema = {
  id: UNIFORM_MOTION_ID,
  label: text('label.title'),
  category: 'kinematics',
  description: text('label.description'),
  timeModel: 'periodic',

  /** 빠르기는 조작기가 state 에 직접 쓴다. 파라미터 상자를 띄우지 않는다. */
  parameters: [],

  stages: [{ id: 'ground', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'marks', label: text('label.view'), default: true }],

  /**
   * 원본은 214px 캔버스 아래에 캡션과 조작기 줄을 따로 두었다. 엔진은 둘을 캔버스
   * 위에 얹으므로 그만큼 세로를 더 잡는다. 그림 자체의 세로 예산(바닥선 위 한 층,
   * 아래 자국, 그 아래 막대 6줄)은 원본 그대로다.
   */
  canvas: { height: 250, minHeight: 230 },

  /**
   * 마운트 전에 랩이 열리는 만큼(`PHASE0`)만 실제로 걷는다 (S-piece: 독자가 도착한 순간 이미 진행 중).
   *
   * `startAt` 이 아닌 이유 — 이 조각이 쌓는 것은 `lapT` 이고 자국·막대는 그 누적의
   * 함수다. 시계만 앞당기면 화면은 빈 트랙에서 시작한다.
   */
  preroll: PHASE0,

  /**
   * `timeline` 을 선언하지 않는다.
   *
   * 이 조각의 랩은 **독자가 되돌릴 수 있다** — 빠르기를 잡으면 처음으로 돌아간다.
   * 엔진 시간표는 임베드 시계의 순수 함수라 조각이 되돌릴 방법이 없고, 되돌지 않는
   * 시간표를 선언하면 화면과 선언이 어긋난다. 그래서 랩 시계는 `state.lapT` 에 두고
   * 그 사실을 NOTES.md 「어휘 부족」에 적는다.
   */

  /**
   * 그림이 겹치는 순서가 판정 장치다 — 바닥선 → 걸음 막대 → 자국 → 가는 것.
   * 층 기본값(`trace` 19 < `trajectory` 20 < `body` 40)은 바닥선을 자국 위에,
   * 막대를 자국 위에 올려 원본의 겹침을 뒤집는다.
   */
  drawOrder: 'scene',

  /**
   * 슬롯 하나. 원본에서는 캔버스 바로 아래 왼쪽에 놓인 한 줄이었다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'muted', emphasis: 'strong' },
    text: key('caption.main'),
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 길이를 재게 하려는 그림이 아니다. */

  messages: uniformMotionMessages,
};
