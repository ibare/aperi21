// ========================================================================
// energy-in-capacitor — 선언
// ========================================================================
// 질문: 축전기에 쌓인 에너지는 왜 QV 가 아니라 그 절반인가.
//
// 빈 축전기의 아래 판에서 위 판으로 전하를 한 몫(Δq)씩 옮긴다. 옮긴 만큼 판 전압이
// 올라, 다음 몫을 옮길 때 드는 일이 점점 커진다. 몫마다 든 일을 V–Q 그래프에 띠
// 하나로 쌓으면 띠들이 직선 아래 **삼각형**을 채운다. 끝 전압 그대로 전부 옮겼을
// 때의 일(QV, 점선 직사각형)의 절반이라는 것이 모양으로 보인다.
//
// 이웃과 겹치지 않는 자리 — `rc-circuit` 은 충전이 시간에 따라 잦아드는 곡선,
// `parallel-plate-capacitor` 는 판의 기하가 담는 전하량이다. 이 조각은 **쌓인 전하에
// 든 일** 만 말한다. 전지 · 도선 · 저항 · 시간축을 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:energy-in-capacitor` 와 문자 그대로 일치한다 (C4). */
export const ENERGY_IN_CAPACITOR_ID = 'energy-in-capacitor';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 용량(μF). 축전기 옆에 `{c} μF` 로 뜬다. */
export const CAPACITANCE = 2;
/** 다 옮긴 뒤 판 전압(V). 그래프 세로축 끝에 `{v} V` 로 뜬다. */
export const FINAL_VOLTAGE = 6;
/** 전하를 몇 몫으로 나눠 옮기는가. 띠 수 · 판 위 표식 자리 수와 같다. */
export const CHUNKS = 8;
/** 판 안쪽 면 사이 간격(월드 단위). 몫이 올라가는 거리다. */
export const PLATE_GAP = 2.6;
/**
 * 표시 배율 — 한 몫을 옮기는 데 필요한 미는 힘 화살표의 길이(월드 단위)를 그 몫이
 * 넘는 평균 전압(V)에 곱해 얻는다. 판 간격이 같으니 힘은 전압에 비례한다.
 */
export const FORCE_ARROW_PER_VOLT = 0.28;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 옆에서 본 두 판, 오른쪽이 V–Q 그래프.
// ------------------------------------------------------------------------

/** 판의 왼쪽 끝 · 길이. */
export const PLATE_LEFT = -6.3;
export const PLATE_LENGTH = 2.8;
/** 아래 판 안쪽 면의 높이. 위 판 안쪽 면은 여기서 간격만큼 위다. */
export const PLATE_BOTTOM_Y = 0.1;
/** 판 두께. */
export const PLATE_THICKNESS = 0.14;
/** 전하 표식이 판 안쪽 면에서 떨어진 거리 — 전하는 마주 보는 면에 모인다. */
export const MARK_INSET = 0.22;
/** 미는 힘 화살표가 서는 가로 자리 — 판 오른쪽 바깥. */
export const FORCE_X = PLATE_LEFT + PLATE_LENGTH + 0.62;

/** 그래프 원점 · 가로(Q) 길이 · 세로(V) 길이. 다 옮긴 Q 와 끝 전압 V 가 축 끝에 온다. */
export const GRAPH_X0 = -0.7;
export const GRAPH_Y0 = 0.1;
export const GRAPH_W = 5.6;
export const GRAPH_H = 3.1;
/** 축이 Q · V 끝을 넘어 더 가는 길이 — 축 이름이 놓일 자리. */
export const AXIS_OVERHANG = 0.45;

/**
 * 프레이밍 — 왼쪽 용량 이름표부터 그래프 가로축 이름표까지, 위 판 위의 여백과
 * 아래 캡션 띠(장부 G24). 가장 큰 장면(다 채운 띠 + 점선 직사각형)이 처음부터 들어간다.
 */
export const SCENE_BOUNDS = { minX: -7.5, maxX: 5.8, minY: -1.35, maxY: 3.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 한 몫을 옮기는 동안(초). `charge` 단계 길이는 이것 × 몫 수의 기본값이다. */
export const CARRY_EACH = 0.9;
/** 다 채운 삼각형을 읽는 동안. */
export const FILLED_HOLD = 2.4;
/** 점선 직사각형이 떠오르는 동안 · 그것을 읽는 동안. */
export const RECT_IN = 0.8;
export const RECT_HOLD = 2.4;
/** 절반을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HALF_HOLD = 3.4;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const energyInCapacitorMessages = Object.freeze({
  'label.title': { ko: '축전기의 에너지', en: 'Energy in a capacitor' },
  'label.stage': { ko: '한 몫씩 옮겨 충전', en: 'Charging one chunk at a time' },
  'label.view': { ko: '판과 V–Q 그래프', en: 'Plates and V–Q graph' },
  /** 값이 끼는 조립이라 문안이다 (C1). 값은 스테이지 상수 그대로. */
  'label.capacitance': { ko: '{c} μF', en: '{c} μF' },
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  /** 축 이름 · 기호. 수식 표기라 표식이다 (C1 판정 3). */
  'label.axisQ': { ko: 'Q', en: 'Q' },
  'label.axisV': { ko: 'V', en: 'V' },
  'label.chunk': { ko: 'Δq', en: 'Δq' },
  'label.force': { ko: 'F', en: 'F' },
  'label.rect': { ko: 'QV', en: 'QV' },
  'label.half': { ko: '½QV', en: '½QV' },
  'caption.charge': {
    ko: '전하를 한 몫씩 아래 판에서 위 판으로 옮긴다 — 판 전압이 오를수록 한 몫에 드는 일(띠)이 커진다',
    en: 'Charge is carried from the lower plate to the upper one, a chunk at a time — as the voltage rises, each chunk takes more work (strip)',
  },
  'caption.filled': {
    ko: '다 옮기고 나니 띠들이 직선 아래 삼각형을 빈틈없이 채웠다',
    en: 'With all the charge moved, the strips fill the triangle under the line with no gaps',
  },
  'caption.rect': {
    ko: '모든 몫을 끝 전압으로 옮겼다면 든 일은 점선 직사각형이다',
    en: 'Had every chunk been moved at the final voltage, the work would be the dashed rectangle',
  },
  'caption.half': {
    ko: '쌓인 에너지는 그 직사각형이 아니라 절반인 삼각형이다',
    en: 'The stored energy is not that rectangle but half of it — the triangle',
  },
} satisfies Record<string, LocalizedText>);

export type EnergyInCapacitorMessageKey = keyof typeof energyInCapacitorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EnergyInCapacitorMessageKey): LocalizedText => energyInCapacitorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EnergyInCapacitorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const energyInCapacitorSchema: BundleSchema = {
  id: ENERGY_IN_CAPACITOR_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 옮기고, 채우고, 직사각형과 견주는 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'chunk-charging',
      label: text('label.stage'),
      constants: {
        capacitance: CAPACITANCE,
        finalVoltage: FINAL_VOLTAGE,
        chunks: CHUNKS,
        plateGap: PLATE_GAP,
        forceArrowPerVolt: FORCE_ARROW_PER_VOLT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'plates-graph', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 판과 그래프가 옆으로 놓인다. 세로는 판 한 쌍 · 그래프 높이와 캡션 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침은 scene 에 쓴 순서다 — 띠(region)가 V–Q 직선 · 축 **아래** 로 깔려야 직선이
   * 띠의 윗변으로 읽힌다. 층 순서로는 `region` 이 선 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 한 몫씩 옮김 → 다 채운 삼각형 → 점선 직사각형이 떠오름 → 그것을 읽음 →
   * 절반 → 흐려짐. 몫마다의 시각은 `charge` 단계의 진행도를 몫 수로 나눠 읽는다 —
   * 몫 수가 스테이지 상수라 단계로 풀어 적을 수 없다 (NOTES (c) G13).
   */
  timeline: {
    phases: [
      { id: 'charge', duration: CARRY_EACH * CHUNKS, caption: key('caption.charge') },
      { id: 'filled', duration: FILLED_HOLD, caption: key('caption.filled') },
      { id: 'rect-in', duration: RECT_IN, ease: 'smooth', caption: key('caption.rect') },
      { id: 'rect', duration: RECT_HOLD, caption: key('caption.rect') },
      { id: 'half', duration: HALF_HOLD, caption: key('caption.half') },
      { id: 'fade', duration: FADE, caption: key('caption.half') },
    ],
  },

  /** 도착한 순간 셋째 몫이 올라가는 중이다 — 띠 둘이 이미 쌓여 있다. */
  startAt: 2.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: energyInCapacitorMessages,
};
