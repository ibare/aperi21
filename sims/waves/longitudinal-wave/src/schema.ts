// ========================================================================
// longitudinal-wave — 선언
// ========================================================================
// 질문: 입자는 진행 방향을 따라 앞뒤로만 흔들린다는데, 그러면 오른쪽으로
// 나아가는 것은 대체 무엇인가.
//
// 매질의 입자는 제자리에서 앞뒤로만 흔들리고, 앞으로 나아가는 것은 입자가
// 빽빽하게 몰린 자리다.
//
// 원본: tasks/piece-lab/longitudinal-wave/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:longitudinal-wave` 와 문자 그대로 일치한다 (C4). */
export const LONGITUDINAL_WAVE_ID = 'longitudinal-wave';

// ------------------------------------------------------------------------
// 월드 — 원본 화면 px 를 그대로 월드 단위로 쓴다 (y 는 위)
// ------------------------------------------------------------------------

/**
 * 판 가로(월드). 원본은 캔버스 폭을 따라갔다 — 대조 창 900 px 에서 좌우 여백 16 을 뺀 868.
 * 엔진은 카메라가 판을 맞추므로 폭을 한 값으로 고정하고 파장 · 진폭을 그 비율로 둔다.
 */
export const FIELD_W = 868;
/** 판 세로(월드). 원본 캔버스 높이 250. */
export const FIELD_H_TOTAL = 250;

/** 입자 영역 — 원본 화면 y 10 ~ 180. 월드로 뒤집으면 70 ~ 240. */
export const PARTICLE_TOP = FIELD_H_TOTAL - 10;
export const PARTICLE_H = 170;
/** 입자를 흩뿌릴 때 영역 위아래에서 비우는 여백(원본 4). */
export const PARTICLE_INSET = 4;

/** 빽빽함 띠 — 원본 화면 y 204 ~ 230. 월드로 뒤집으면 20 ~ 46. */
export const STRIP_TOP = FIELD_H_TOTAL - 204;
export const STRIP_H = 26;

/** 띠 이름 글자의 세로 가운데(월드). 원본은 기준선이 띠 위 4 px, 글자 12 px 이라 가운데가 화면 y 194. */
export const STRIP_LABEL_Y = FIELD_H_TOTAL - 194;

// ------------------------------------------------------------------------
// 파동 — 원본 상수
// ------------------------------------------------------------------------

/** 한 입자가 한 번 왕복하는 시간(초). */
export const PERIOD = 2.4;
/** 파장 = 판 가로의 3분의 1 — 압축부 셋이 한 화면에 보인다. */
export const WAVELENGTH = FIELD_W / 3;
/** kA. 1 을 넘으면 입자가 이웃을 앞지른다. */
export const KA = 0.7;
/** 판 가로 한 폭에 흩뿌릴 입자 수. 화면 밖 여유 폭만큼 비례해 더 뿌린다. */
export const PARTICLES_PER_WIDTH = 2600;

/** 강조 입자 셋 — 판 가로 비율 자리, 가운데 줄에서 38 씩 위아래. */
export const TAGGED_FX: readonly number[] = [0.2, 0.5, 0.8];
export const TAGGED_GAP_Y = 38;

// ------------------------------------------------------------------------
// 크기 — 화면 px (원본 그대로)
// ------------------------------------------------------------------------

/** 입자 점 반지름(화면 px). */
export const PARTICLE_RADIUS = 1.3;
/** 입자 점 불투명도. */
export const PARTICLE_OPACITY = 0.55;
/** 강조 입자 반지름(월드 — 배율 1 에서 원본 5 px). */
export const TAGGED_RADIUS = 5;
/** 흔들림 폭 양 끝 눈금의 반 길이(월드). */
export const RANGE_TICK = 5;
/** 띠 테두리 불투명도. */
export const STRIP_BORDER_OPACITY = 0.5;
/** 띠 이름 글자 크기(화면 px). */
export const STRIP_LABEL_FONT = 12;

// ------------------------------------------------------------------------
// 빽빽함 띠 — 화면의 점에서 세는 밀도
// ------------------------------------------------------------------------

/** 세는 칸 폭(월드). */
export const DENSITY_BIN = 3;
/** 가우스 번짐 반경(칸). 점 수가 유한해서 생기는 알갱이만 지운다. */
export const DENSITY_BLUR_RADIUS = 4;
/** 가우스 번짐 폭(칸). */
export const DENSITY_BLUR_SIGMA = 2.2;
/**
 * 농도 사상 — 평균 대비 빽빽함 `rel` 이 이 범위를 바탕에서 먹색까지로 칠한다.
 * 원본 `(rel − 0.25) / 2.6` 을 0~1 로 자른 것과 같은 범위다.
 */
export const DENSITY_RANGE: readonly [number, number] = [0.25, 0.25 + 2.6];

/**
 * 프레이밍 — 원본 캔버스 그대로. 캡션 한 줄 자리는 캡션 슬롯이 화면 여백으로 잡으므로
 * 경계에 따로 두지 않는다 (두면 세로가 조여 판이 작아진다). 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: 0, maxY: FIELD_H_TOTAL } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const longitudinalWaveMessages = Object.freeze({
  'label.title': { ko: '종파', en: 'Longitudinal wave' },
  'label.operation': {
    ko: '입자는 제자리에서 흔들리고, 빽빽한 자리가 나아간다',
    en: 'Particles sway in place while the crowded places travel on',
  },
  'label.stage': { ko: '공기', en: 'Air' },
  'label.view': { ko: '입자와 빽빽함', en: 'Particles and crowding' },
  'label.strip': { ko: '입자가 몰린 정도', en: 'How crowded the particles are' },
  'caption.main': {
    ko: '점 하나하나는 제자리에서 좌우로만 흔들리는데, 빽빽한 자리는 오른쪽으로 계속 나아간다.',
    en: 'Each dot only sways left and right in place, yet the crowded places keep moving to the right.',
  },
} satisfies Record<string, LocalizedText>);

export type LongitudinalWaveMessageKey = keyof typeof longitudinalWaveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: LongitudinalWaveMessageKey): LocalizedText => longitudinalWaveMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LongitudinalWaveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const longitudinalWaveSchema: BundleSchema = {
  id: LONGITUDINAL_WAVE_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 진폭 · 파장 손잡이를 두지 않는다 — 「무엇이 나아가는가」 에 답을 더하지 않는다.
  parameters: [],

  /**
   * `seed` — 입자를 흩뿌리는 난수의 시드. 원본 하니스 기본값 1 과 같다.
   * 격자가 아니라 시드 난수라 모아레가 없고, 같은 시각은 언제나 같은 화면이다.
   */
  stages: [{ id: 'air', label: text('label.stage'), constants: { seed: 1 } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본은 250 px 캔버스 + 아래 캡션 한 줄이었다. */
  canvas: { height: 310, minHeight: 300 },

  /**
   * 입자 → 흔들림 폭 선분 → 강조 입자 순서로 겹쳐야 한다(원본 그리기 순서).
   * 선분이 강조 입자를 가리면 「제자리」 표식이 대상을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 입자 한 번 왕복. 단계는 하나뿐이다 — 이 조각에는 연출 단계가 없고
   * 모든 것이 시각의 함수다. 원본은 시계 0 에서 열리고 그 순간 이미 줄무늬가 차 있어
   * `startAt` 으로 앞당길 것이 없다 (기본 0).
   */
  timeline: {
    phases: [{ id: 'sway', duration: PERIOD }],
  },

  /** 원본 캡션은 판 아래 왼쪽 정렬 한 줄 15 px, 고정 문장. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0,
    text: key('caption.main'),
  },

  /** 그리드 · 카메라 버튼 없음 (기본값). 잴 것이 거리가 아니다. */

  messages: longitudinalWaveMessages,
};
