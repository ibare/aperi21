// ========================================================================
// energy-dissipation — 선언
// ========================================================================
// 질문: 마찰이 가져간 에너지는 그냥 사라지는가, 아니면 어디에 남는가?
//
// 답의 동사는 **쌓인다**. 용수철에 매인 물체가 거친 바닥을 오가며 진폭이 줄어
// 멈추는 동안, 물체가 문지르고 지나간 자리마다 열이 쌓여 바닥이 뜨거워진다.
// 여러 번 문지른 가운데가 가장 뜨겁고, 곁의 막대에서는 역학적 에너지 몫이 줄어든
// 만큼 열의 몫이 정확히 올라온다 — 막대의 전체 길이는 변하지 않는다.
//
// 이 조각은 엔진 어휘 위에서 바로 지었다(자유 구현 원본 없음).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-dissipation` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_DISSIPATION_ID = 'energy-dissipation';

// ------------------------------------------------------------------------
// 운동 — 쿨롱 마찰이 걸린 용수철 진동자. 닫힌 해가 있어 상태를 쌓지 않는다.
// ------------------------------------------------------------------------

/** 반주기 수. 물체는 이만큼 오간 뒤 정확히 제자리(용수철 자연 길이)에서 멈춘다. */
export const HALF_CYCLES = 6;
/** 반주기 길이(초). 각진동수 ω = π/HALF_PERIOD. */
export const HALF_PERIOD = 1;
/** 처음 당긴 길이(월드 m). */
export const AMPLITUDE = 2.4;
/**
 * 마찰이 옮기는 평형점 δ = μmg/k (월드 m). 반주기마다 진폭이 2δ 씩 줄어든다.
 *
 * `AMPLITUDE = 2·HALF_CYCLES·δ` 로 맞췄다 — 마지막 반주기가 진폭 0 으로 끝나
 * 물체가 용수철이 늘지도 줄지도 않은 자리에 선다. 그래야 「처음 에너지가 남김없이
 * 열이 되었다」 가 화면에서 참이 된다 (남은 용수철 에너지가 없다).
 */
export const DELTA = AMPLITUDE / (2 * HALF_CYCLES);

// ------------------------------------------------------------------------
// 배치 — 월드 m. 가로로 넓고 세로로 좁은 임베드에 맞춘 치수다.
// ------------------------------------------------------------------------

/** 용수철을 매단 벽. */
export const WALL_X = -4.2;
export const WALL_TOP = 1.05;
/** 용수철이 늘지도 줄지도 않았을 때의 물체 중심. */
export const REST_X = -0.6;
/** 물체 크기 `[가로, 세로]`. */
export const BLOCK_W = 0.7;
export const BLOCK_H = 0.55;
/** 바닥 선의 오른쪽 끝. */
export const FLOOR_RIGHT = 3.0;
/** 열이 가장 두껍게 쌓인 자리(여섯 번 다 문지른 가운데)의 두께. */
export const BAND_H = 0.55;
/** 열이 밸 수 있는 구간 — 물체가 문지를 수 있는 모든 자리(중심 진폭 + 물체 반폭). */
export const BAND_X0 = REST_X - AMPLITUDE - BLOCK_W / 2;
export const BAND_X1 = REST_X + AMPLITUDE + BLOCK_W / 2;
/** 두께를 재는 칸 수. 칸 하나 ≈ 0.034 m. */
export const BAND_COLS = 160;

/** 에너지 막대 — 전체 길이가 처음 에너지다. 매 프레임 같은 자리·같은 길이. */
export const BAR_X0 = 3.55;
export const BAR_X1 = 3.95;
export const BAR_Y0 = 0;
export const BAR_H = 2;

/**
 * 프레이밍. 벽·막대·바닥 띠와 그 아래 캡션 줄을 담는 고정 경계다. 매 프레임 같은
 * 값이라야 카메라가 흔들리지 않는다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -4.55, maxX: 5.55, minY: -1.35, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 화면 치수 — 물리량이 아니라 표현이다.
// ------------------------------------------------------------------------

/** 이름표 글자 크기(화면 px). */
export const LABEL_FONT_PX = 13;
/** 막대 옆 이름표를 띄우는 간격(화면 px). */
export const LABEL_GAP_PX = 8;
/** 막대의 한 몫이 이보다 짧으면 이름표를 달지 않는다(월드 m) — 글자가 겹친다. */
export const LABEL_MIN_H = 0.3;
/** 용수철 코일 수. 늘어남이 간격으로 보이게 넉넉히 감는다. */
export const SPRING_COILS = 11;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyDissipationMessages = Object.freeze({
  'label.title': { ko: '에너지 소산', en: 'Energy dissipation' },
  'label.operation': {
    ko: '마찰이 가져가는 몫과 그 행방',
    en: 'The share friction takes, and where it goes',
  },
  'label.stage': { ko: '거친 바닥', en: 'Rough floor' },
  'label.view': { ko: '기본', en: 'Default' },

  /** 막대의 두 몫과 바닥 띠. 이름이 없으면 무엇의 몫인지 읽히지 않는다. */
  'label.mechanical': { ko: '역학적 에너지', en: 'Mechanical energy' },
  'label.heat': { ko: '열', en: 'Heat' },
  'label.floorHeat': {
    ko: '문지른 자리에 쌓인 열',
    en: 'Heat piled up where it rubbed',
  },

  'caption.slide': {
    ko: '오갈 때마다 물체가 바닥을 문지른다. 역학적 에너지 몫이 줄어든 만큼 열의 몫이 올라오고, 줄어든 에너지는 문지른 자리에 그대로 쌓인다.',
    en: 'Each pass rubs the block across the floor. The heat share rises by exactly what the mechanical share loses, and the lost energy piles up right where it rubbed.',
  },
  'caption.rest': {
    ko: '물체가 멈췄다. 처음 에너지는 남김없이 열이 되었고, 가장 여러 번 문지른 가운데에 가장 두껍게 쌓여 있다.',
    en: 'The block has stopped. All of the initial energy has become heat, piled thickest in the middle, where it rubbed the most times.',
  },
  'caption.reset': {
    ko: '쌓인 열을 치우고 물체를 처음 자리로 다시 당긴다.',
    en: 'The piled-up heat is cleared away and the block is pulled back to the start.',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyDissipationMessageKey = keyof typeof energyDissipationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로 (C1). */
export const text = (key: EnergyDissipationMessageKey): LocalizedText =>
  energyDissipationMessages[key];

/** 시간표·캡션이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyDissipationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyDissipationSchema: BundleSchema = {
  id: ENERGY_DISSIPATION_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'rough-floor', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 세로는 비싸다. 벽(1.05) · 막대(2.0) 위로 여유를 조금 두고, 아래는 바닥에 밴
   * 열과 그 이름표 · 캡션 한두 줄만큼만 잡았다.
   */
  canvas: { height: 348, minHeight: 320 },

  /**
   * 쌓인 열이 **바닥 선 아래**로 배고 그 위를 물체가 지난다 — 겹침 순서가
   * 「바닥에 배었다」 를 만든다. 층 순서로는 열(region)이 물체 위로 덮여 올라온다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 두 번째 왕복 중이다 — 열이 이미 배어 있고 막대는 나뉘어 있다. */
  startAt: 1.4,

  /**
   * 한 주기 9.5 초.
   *
   * - `slide` — 6 초. 반주기 1 초씩 여섯 번 오가며 진폭이 줄어 제자리에 선다.
   * - `rest` — 멈춘 화면. 쌓인 열의 모양(가운데가 가장 두껍다)을 읽는 시간이다.
   * - `reset` — 띠와 막대가 사라지고 물체가 처음 자리로 당겨진다. 열이 되돌아오는
   *   것이 아니라 **치우고 다시 시작**하는 것이라 캡션이 그렇게 말한다.
   */
  timeline: {
    phases: [
      { id: 'slide', duration: HALF_CYCLES * HALF_PERIOD, caption: key('caption.slide') },
      { id: 'rest', duration: 2.5, caption: key('caption.rest') },
      { id: 'reset', duration: 1, ease: 'smooth', caption: key('caption.reset') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다 (S-piece). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 760,
    fade: 0.35,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.slide'),
  },

  // 그리드 · 축 · 카메라 단추 없음(기본). 잴 것이 거리가 아니라 **몫**이라 그리드는
  // 오독의 경로가 된다 (S-piece).

  messages: energyDissipationMessages,
};
