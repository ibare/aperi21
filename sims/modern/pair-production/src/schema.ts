// ========================================================================
// pair-production — 선언
// ========================================================================
// 질문: 빛의 에너지가 물질이 될 수 있나.
//
// 감마선 광자 하나가 원자핵 곁을 지나다 사라지고, 그 자리에서 전자와 양전자 한 쌍이 생긴다.
// 둘의 정지 에너지를 합친 2mₑc² = 1.022 MeV 가 문턱이다 — 이보다 약한 광자는 그냥 지나간다.
// 문턱을 넘은 몫은 두 입자의 운동 에너지가 되고, 자기장 속에서 둘은 전하가 반대라 반대로 휜다.
// 거품 상자 속이라 달리며 에너지를 잃어 안쪽으로 감긴다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 광자가 전자와 부딪혀 튕겨 나가는 것은 이웃 `compton-scattering` 의 몫, 양전자가 전자를 만나
// 사라지는 것은 `antimatter` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pair-production` 와 문자 그대로 일치한다 (C4). */
export const PAIR_PRODUCTION_ID = 'pair-production';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 쌍생성 문턱(MeV) = 2mₑc². 화면에 그대로 띄우는 정박값이다. 전자 정지 에너지의 두 배라
 * 한쪽만 바꾸면 둘이 어긋난다 (장부 G143).
 */
export const THRESHOLD_MEV = 1.022;
/** 전자(와 양전자)의 정지 에너지 mₑc²(MeV). 운동 에너지에서 운동량을 셀 때 쓴다. */
export const ELECTRON_REST_MEV = 0.511;
/** 거품 상자의 자기장(T). 종이 면에서 나오는 쪽(⊙). */
export const FIELD_T = 1;
/**
 * 회전 반지름 환산(mm · T / (MeV/c)) — r = 이 값 × p / B. 1/(0.2998) 에서 온다.
 */
export const MM_PER_MEV_TESLA = 3.336;
/** 발마다 들어오는 광자의 에너지(MeV) — 차례대로. 첫 발은 문턱 아래 (장부 G105). */
export const ENERGIES_MEV = [0.8, 2, 5] as const;
/**
 * 거품 상자 속 에너지 손실 길이(mm) — 이만큼 달릴 때마다 운동량이 1/e 로 준다. 감기는 나선의
 * 모양만 정한다. 실제 손실(이온화 · 제동 복사)을 한 지수로 근사했다 (NOTES (b)).
 */
export const LOSS_LENGTH_MM = 25;
/** 회전 반지름이 이만큼(mm)으로 줄면 멈춘 것으로 보고 궤적을 끝낸다. */
export const STOP_RADIUS_MM = 1;
/** 광자 물결 뭉치의 길이(mm). 에너지와 무관하게 같아서 물결 간격만 다르다. */
export const PACKET_MM = 4;
/**
 * 1 MeV 광자의 물결 간격(mm) — 간격은 에너지에 반비례한다. 감마선의 실제 파장(pm 미만)이 아니라
 * 에너지 순서만 보이는 배율이라 화면에 알리지 않는다 (NOTES (b)).
 */
export const WAVE_AT_ONE_MEV_MM = 1.6;

// ------------------------------------------------------------------------
// 배치 — 월드 단위 mm. 원자핵이 원점, 광자는 x 축을 따라 왼쪽에서 온다.
// ------------------------------------------------------------------------

/** 광자 머리가 출발하는 자리(원자핵 왼쪽 거리). */
export const START_X = 24;
/** 문턱 아래 광자가 원자핵을 지나 꼬리가 닿는 자리 — 프레이밍 밖이다. */
export const EXIT_X = 28;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 3.2;

/**
 * 프레이밍은 고정 — 가장 큰 나선(5 MeV)의 위 · 아래 끝과 이름표, 광자 출발점과 문턱 아래 광자가
 * 빠져나가는 오른쪽 끝이 들어간다.
 */
export const SCENE_BOUNDS = {
  minX: -26,
  maxX: 26,
  minY: -12 - CAPTION_BAND,
  maxY: 12,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 광자가 왼쪽에서 날아와 원자핵에 닿기까지. */
export const PHASE_IN = 1.8;
/** 문턱 아래 광자가 원자핵을 지나 화면 밖으로 나가기까지. */
export const PHASE_PASS = 1.8;
/** 한 쌍이 생겨 감기며 멈추기까지. */
export const PHASE_PAIR = 3.4;
/** 다 그려진 두 쌍을 견줘 보는 틈. */
export const PHASE_HOLD = 1.6;
export const PHASE_FADE = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pairProductionMessages = Object.freeze({
  'label.title': { ko: '쌍생성', en: 'Pair production' },
  'label.operation': { ko: '에너지가 물질이 되는 것', en: 'Energy turning into matter' },
  'label.stage': { ko: '거품 상자 속 감마선', en: 'Gamma rays in a bubble chamber' },
  'label.view': { ko: '기본', en: 'Default' },
  /** 날아가는 광자. 값은 선언한 광자 에너지를 끼운다 (C1 · S-piece 유효숫자). */
  'label.photon': { ko: 'γ {e} MeV', en: 'γ {e} MeV' },
  /** 쌍생성 문턱. 값은 선언한 정박값이다. */
  'label.threshold': { ko: '문턱 {t} MeV', en: 'threshold {t} MeV' },
  /** 자기장 — 종이 면에서 나오는 쪽. */
  'label.field': { ko: '자기장 ⊙ {b} T', en: 'magnetic field ⊙ {b} T' },
  'mark.nucleus': { ko: '원자핵', en: 'nucleus' },
  'mark.electron': { ko: 'e⁻', en: 'e⁻' },
  'mark.positron': { ko: 'e⁺', en: 'e⁺' },
  'caption.belowIn': {
    ko: '문턱에 못 미치는 감마선 광자가 원자핵 쪽으로 날아간다',
    en: 'A gamma photon below the threshold flies toward a nucleus',
  },
  'caption.belowOut': {
    ko: '문턱에 못 미치는 광자는 원자핵 곁을 그대로 지나간다 — 아무것도 생기지 않는다',
    en: 'Below the threshold, the photon simply passes the nucleus by — nothing is made',
  },
  'caption.aboveIn': {
    ko: '이번에는 문턱을 넘는 광자가 날아간다',
    en: 'This time the photon is above the threshold',
  },
  'caption.aboveOut': {
    ko: '광자가 사라지고 전자와 양전자가 생겨난다 — 자기장 속에서 서로 반대로 휜다',
    en: 'The photon vanishes and an electron and a positron appear — the field bends them opposite ways',
  },
  'caption.moreIn': {
    ko: '에너지가 더 큰 광자가 날아간다',
    en: 'A photon with more energy comes in',
  },
  'caption.moreOut': {
    ko: '문턱을 넘은 몫은 운동이 된다 — 더 빠른 한 쌍이 더 크게 휘며 감긴다',
    en: 'The energy beyond the threshold becomes motion — a faster pair curls in wider spirals',
  },
} satisfies Record<string, LocalizedText>);

export type PairProductionMessageKey = keyof typeof pairProductionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PairProductionMessageKey): LocalizedText => pairProductionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PairProductionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pairProductionSchema: BundleSchema = {
  id: PAIR_PRODUCTION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 문턱 아래 · 위 · 더 위 세 광자가 차례로 나와 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'bubble-chamber',
      label: text('label.stage'),
      constants: {
        thresholdMeV: THRESHOLD_MEV,
        electronRestMeV: ELECTRON_REST_MEV,
        fieldT: FIELD_T,
        mmPerMeVTesla: MM_PER_MEV_TESLA,
        energy1: ENERGIES_MEV[0],
        energy2: ENERGIES_MEV[1],
        energy3: ENERGIES_MEV[2],
        lossLength: LOSS_LENGTH_MM,
        stopRadius: STOP_RADIUS_MM,
        packetLength: PACKET_MM,
        waveAtOneMeV: WAVE_AT_ONE_MEV_MM,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 긴 상자 하나 · 캡션 한 줄. 마운트 뒤 바뀌지 않는다. */
  canvas: { height: 400, minHeight: 320 },

  /**
   * 한 주기 = 광자 세 발. 발마다 들어옴(in) → 그 뒤(out). 문턱 아래 광자는 out 동안 지나가고,
   * 문턱 위 광자는 out 동안 한 쌍이 생겨 감긴다 — 어느 쪽인지는 physics 가 광자 에너지와 문턱으로
   * 가른다. 앞 발의 궤적은 다음 발이 들어오는 동안 옅어져 남는다. 끝에 멈춰 보고 흐려진다.
   *
   * 단계 id 에서 몇 번째 발인지로 가는 짝은 physics 의 `SHOTS` 가 안다 — 단계에 값을 실을
   * 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'in-1', duration: PHASE_IN, caption: key('caption.belowIn') },
      { id: 'out-1', duration: PHASE_PASS, caption: key('caption.belowOut') },
      { id: 'in-2', duration: PHASE_IN, caption: key('caption.aboveIn') },
      { id: 'out-2', duration: PHASE_PAIR, caption: key('caption.aboveOut') },
      { id: 'in-3', duration: PHASE_IN, caption: key('caption.moreIn') },
      { id: 'out-3', duration: PHASE_PAIR, caption: key('caption.moreOut') },
      { id: 'hold', duration: PHASE_HOLD, caption: key('caption.moreOut') },
      { id: 'fade', duration: PHASE_FADE, caption: key('caption.moreOut') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 첫 광자가 원자핵 쪽으로 날아가는 중에 연다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — E = mc² 와 문턱 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: pairProductionMessages,
};
