// ========================================================================
// air-column-resonance — 선언
// ========================================================================
// 질문: 같은 길이의 관인데 한쪽 끝을 막으면 왜 더 낮은 소리가 나고, 울리는 소리의
// 모임이 달라지는가.
//
// 답: 관 끝이 공기가 흔들리는 모양을 정한다. 열린 끝에서는 공기가 가장 크게 움직이고(배),
// 막힌 끝에서는 공기가 움직이지 못한다(마디). 양쪽이 열린 관은 두 끝이 모두 배라
// 반파장이 관 길이에 딱 맞아야 울리고(L = nλ/2), 한쪽을 막은 관은 한 끝이 배 · 한 끝이
// 마디라 사분의 일 파장부터 맞는다(L = (2n−1)λ/4). 그래서 막힌 관은 열린 관의 절반
// 진동수에서 먼저 울리고, 그 홀수 배에서만 울린다.
//
// 화면: 같은 길이의 관 둘을 위(양쪽 열림) · 아래(오른쪽 막힘)에 두고, 왼쪽 입구의 음원이
// 같은 진동수를 v/4L 의 1 · 2 · 3 · 4 · 5 배로 계단처럼 올린다. 계단마다 한 관만 크게
// 울린다 — 관 안 공기 알갱이가 크게 흔들리고 점선 봉투가 그 모양을 보인다. 오른쪽 작은
// 사다리가 울린 계단을 채워, 두 관의 빗살이 서로 엇갈리는 것이 남는다.
//
// 줄의 모드(배음 차수 · 진동수 훑기 · 응답 곡선)는 `harmonics`, 길이를 바꿔 음이 오르는
// 것은 `string-vibration` 의 몫이다 — 여기서 바뀌는 것은 관 끝 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:air-column-resonance` 와 문자 그대로 일치한다 (C4). */
export const AIR_COLUMN_RESONANCE_ID = 'air-column-resonance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 단위 = 관 위 거리 한 단위. 두 관 모두 입구(왼쪽)가 x = 0, 오른쪽 끝이 x = L.
// 끝 보정(열린 끝의 배가 관 밖으로 조금 나가는 것)은 뺀다 — NOTES (b).
// ------------------------------------------------------------------------

/** 관 길이(월드). 두 관이 같다. */
export const TUBE_LENGTH = 6;
/**
 * 소리 빠르기(월드/초). 계단 한 칸 v/4L = 0.35 Hz — 다섯째 계단(1.75 Hz)도 알갱이의
 * 흔들림을 눈으로 따라갈 수 있는 빠르기다.
 */
export const SOUND_SPEED = 8.4;
/** 크게 울릴 때 배(가장 크게 움직이는 자리)의 공기 변위(월드). */
export const PEAK_DISPLACEMENT = 0.3;
/**
 * 감쇠(무차원). 모양이 맞지 않는 관의 흔들림은 크게 울릴 때의 약 이 배다.
 */
export const DAMPING = 0.12;
/**
 * 계단 수 — 진동수가 v/4L 의 1 배부터 이 배까지 오른다. 시간표의 `ring-n` · `shift-n`
 * 단계와 짝이다 — 이 값을 바꾸면 단계도 함께 선언해야 한다 (NOTES 「어휘 부족」 G13).
 */
export const RUNG_COUNT = 5;
/** 공기 알갱이 흩뿌림 시드. 같은 시드는 언제나 같은 알갱이 자리다. */
export const AIR_SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 관 중심 높이(월드 y). 위가 양쪽 열린 관, 아래가 한쪽 막힌 관. */
export const OPEN_TUBE_Y = 1.1;
export const CLOSED_TUBE_Y = -0.75;
/** 관 안쪽 반지름(월드). */
export const TUBE_RADIUS = 0.5;
/** 음원 판 — 입구에서 떨어진 거리 · 판 두께(월드). */
export const SOURCE_GAP = 0.22;
export const SOURCE_THICKNESS = 0.07;
/** 사다리 — 첫 칸의 x · 칸 간격(월드). 칸은 관 중심 높이에 한 줄씩. */
export const LADDER_X = 7.2;
export const LADDER_STEP = 0.62;

/**
 * 프레이밍 — 왼쪽은 음원 이름, 오른쪽은 사다리 눈금 글자, 위는 관 이름, 아래는 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.5, maxX: 10.2, minY: -1.85, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const airColumnResonanceMessages = Object.freeze({
  'label.title': { ko: '기주 공명', en: 'Air-column resonance' },
  'label.stage': { ko: '같은 길이의 관 둘', en: 'Two pipes of equal length' },
  'label.view': { ko: '관과 울린 진동수', en: 'Pipes and resonances' },

  /** 관 이름. */
  'label.openTube': { ko: '양쪽이 열린 관', en: 'open at both ends' },
  'label.closedTube': { ko: '한쪽을 막은 관', en: 'closed at one end' },
  /** 음원 이름. */
  'label.source': { ko: '음원', en: 'source' },
  /** 사다리 이름. */
  'label.ladder': { ko: '크게 울린 진동수', en: 'rang loudly at' },
  /** 사다리 눈금 — 열린 관의 기본 진동수 f₁ 의 배수. 기호라 두 언어가 같다(C1 표식). */
  'label.f1': { ko: 'f₁', en: 'f₁' },
  'label.fn': { ko: '{n}f₁', en: '{n}f₁' },
  'label.fHalf': { ko: '{n}/2 f₁', en: '{n}/2 f₁' },

  'caption.closed': {
    ko: '막힌 관만 크게 울린다 — 막힌 끝은 공기가 움직이지 못하는 마디, 열린 입구는 가장 크게 움직이는 배다.',
    en: 'Only the closed pipe rings — air cannot move at the closed end (a node) and moves most at the open mouth (an antinode).',
  },
  'caption.open': {
    ko: '이번엔 열린 관만 크게 울린다 — 두 끝이 모두 배인 모양이 관 길이에 맞았다.',
    en: 'Now only the open pipe rings — a shape with antinodes at both ends fits its length.',
  },
  'caption.shift': {
    ko: '음을 올리는 중 — 두 관 모두 모양이 끝에 맞지 않아 조용하다.',
    en: 'Raising the pitch — neither shape fits its ends, so both pipes stay quiet.',
  },
  'caption.rest': {
    ko: '막힌 관은 열린 관의 절반 진동수에서 먼저 울렸고, 그 홀수 배에서만 울렸다 — 짝수 배 자리는 열린 관이 울렸다.',
    en: 'The closed pipe rang first, at half the open pipe’s lowest frequency, and then only at odd multiples of it — the even ones belonged to the open pipe.',
  },
} satisfies Record<string, LocalizedText>);

export type AirColumnResonanceMessageKey = keyof typeof airColumnResonanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AirColumnResonanceMessageKey): LocalizedText => airColumnResonanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AirColumnResonanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const airColumnResonanceSchema: BundleSchema = {
  id: AIR_COLUMN_RESONANCE_ID,
  title: text('label.title'),
  category: 'waves',
  timeModel: 'periodic',

  // 조작기가 없다. 계단이 자동으로 모든 후보를 지나며 두 관이 번갈아 울리는 것을 보인다 —
  // 독자가 관 끝을 여닫게 하면 한 번에 한 관만 보여 「엇갈림」 을 나란히 볼 수 없다.
  parameters: [],

  stages: [
    {
      id: 'two-pipes',
      label: text('label.stage'),
      constants: {
        tubeLength: TUBE_LENGTH,
        soundSpeed: SOUND_SPEED,
        peakDisplacement: PEAK_DISPLACEMENT,
        damping: DAMPING,
        rungCount: RUNG_COUNT,
        seed: AIR_SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'pipes', label: text('label.view'), default: true }],

  /** 관 두 줄 + 캡션 한 줄. 세로가 비싸 관을 가로로 눕혔다. */
  canvas: { height: 360, minHeight: 320 },

  /** 봉투 칠을 먼저, 알갱이를 그 위에, 봉투 점선 · 관 벽 · 마디 · 사다리를 맨 위에. */
  drawOrder: 'scene',

  /**
   * 한 주기 19.8 초. 진동수(v/4L 단위)가 단계마다 이렇게 간다 —
   *
   * - `rise` 1 에서 소리가 커짐 · `ring-1` 1 에 머묾 · `shift-2` 1 → 2 · `ring-2` 2 · … ·
   *   `ring-5` 5 · `rest` 5 에 머물며 다 채운 사다리를 보여 줌 · `fade` 소리가 잦아듦.
   * - 머무는 단계는 한 관의 모양이 맞는 자리다 — 홀수는 막힌 관, 짝수는 열린 관.
   * - 옮기는 단계는 진행도를 진동수에 **선형으로** 잇는다. 흔들림 위상은 진동수를 시간으로
   *   적분한 값이라(`physics.ts drivePhase`) 이징을 주면 적분이 어긋난다.
   * - `fade` 가 소리를 0 으로 줄여 주기 이음매(5 → 1)에서 알갱이가 튀지 않는다.
   * - 계단 수(`rungCount`)와 `ring-n` · `shift-n` 단계는 짝이다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'rise', duration: 0.8, caption: key('caption.closed') },
      { id: 'ring-1', duration: 2.6, caption: key('caption.closed') },
      { id: 'shift-2', duration: 0.8, caption: key('caption.shift') },
      { id: 'ring-2', duration: 2.6, caption: key('caption.open') },
      { id: 'shift-3', duration: 0.8, caption: key('caption.shift') },
      { id: 'ring-3', duration: 2.4, caption: key('caption.closed') },
      { id: 'shift-4', duration: 0.8, caption: key('caption.shift') },
      { id: 'ring-4', duration: 2.4, caption: key('caption.open') },
      { id: 'shift-5', duration: 0.8, caption: key('caption.shift') },
      { id: 'ring-5', duration: 2.4, caption: key('caption.closed') },
      { id: 'rest', duration: 2.6, caption: key('caption.rest') },
      { id: 'fade', duration: 0.8, caption: key('caption.rest') },
    ],
  },

  /** 도착한 순간 막힌 관이 이미 가장 낮은 음으로 크게 울리고 있다. */
  startAt: 1.6,

  /** 슬롯 하나. 아래 관 밑 왼쪽. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본).

  messages: airColumnResonanceMessages,
};
