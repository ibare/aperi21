// ========================================================================
// photovoltaic-effect — 선언
// ========================================================================
// 질문: 태양 전지는 어떻게 빛만으로 전압을 만드는가?
//
// 답: pn 접합의 경계(공핍층)에는 n쪽에서 p쪽으로 향한 내부 전기장이 있다. 띠 간격보다
// 에너지가 큰 광자가 그 자리에서 흡수되면 전자-양공 쌍이 생기고, 전기장이 전자는 n쪽으로,
// 양공은 p쪽으로 갈라 놓는다. 갈라진 전하가 두 끝에 쌓이면 n쪽은 −, p쪽은 + 가 되어
// 두 끝 사이에 전압이 생긴다. 띠 간격보다 에너지가 작은 적외선 광자는 쌍을 만들지 못하고
// 그대로 빠져나가 전압이 생기지 않는다.
//
// 공핍층이 생기는 과정과 건 전압에 따른 폭 변화는 `pn-junction` 의 몫, 금속에서 전자가
// 튀어나오는 문턱은 `photoelectric-effect` 의 몫이라 두지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:photovoltaic-effect` 와 문자 그대로 일치한다 (C4). */
export const PHOTOVOLTAIC_EFFECT_ID = 'photovoltaic-effect';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 실리콘의 띠 간격(eV). 화면에 `1.1 eV` 로 뜬다. 광자 에너지가 이보다 커야 쌍이 생긴다. */
export const BAND_GAP_EV = 1.1;
/** 적외선 · 초록빛의 파장(nm). 물결 간격이 여기서 나오고, 초록빛은 빛 색도 여기서 나온다. */
export const LAMBDA_IR_NM = 1500;
export const LAMBDA_VISIBLE_NM = 530;
/**
 * 광자 하나의 에너지(eV) — 화면에 띄우는 정박값이다. 1240 / λ 를 유효숫자 둘로 둔 값이라
 * 파장을 바꾸면 이것도 함께 바꾼다 (NOTES (c) G143).
 */
export const PHOTON_EV_IR = 0.8;
export const PHOTON_EV_VISIBLE = 2.3;
/** 빛을 쬐는 동안 두 끝 사이에 서는 전압(V) — 실리콘 전지의 개방 전압 무렵. 화면에 `0.6 V` 로 뜬다. */
export const OPEN_CIRCUIT_VOLTAGE = 0.6;
/** 램프가 내보내는 광자 수(개/초) — 적외선 · 초록빛. 두 빛의 세기를 같게 둔다. */
export const RATE_IR = 2;
export const RATE_VISIBLE = 2;
/** 광자가 나는 빠르기(월드/초). 빛의 속력이 아니라 눈으로 따라갈 수 있는 빠르기다. */
export const PHOTON_SPEED = 4;
/**
 * 갈라진 전자 · 양공이 끝으로 가는 화면 빠르기(월드/초). 실제 표류 속도를 보이게 한 **표현값**이라
 * 화면에 알리지 않는다 (NOTES b).
 */
export const DRIFT_SPEED = 1.35;
/**
 * 물결 간격 배율(월드/nm). 파장을 화면에 보이는 크기로 키운다 — 1500 nm 가 0.48 월드.
 * 화면에 알리지 않는다: 두 빛의 간격 **비**가 주장이고 절대 길이는 뜻이 없다 (NOTES b).
 */
export const WAVE_SCALE = 0.00032;
/** 공핍층 반폭(월드). 쌍이 생기는 자리이자 전기장이 있는 곳. */
export const DEPLETION_HALF = 0.9;
/**
 * 한쪽 끝에 쌓이는 운반자 수 — 이만큼 쌓이면 바늘이 개방 전압에 선다. 넘쳐 온 운반자는
 * 전극에 닿아 사라진다(빛을 쬐는 동안 전압이 그대로 유지된다).
 */
export const STACK_CAP = 6;
/** 운반자 하나가 도착해 바늘이 그만큼 옮겨 가는 데 걸리는 시간(초). 알갱이마다 다른 시각이라 단계로 풀 수 없다 (NOTES c). */
export const NEEDLE_SETTLE = 0.45;
/** 쌍이 생긴 자리에서 퍼지는 고리가 사라지기까지(초). 알갱이마다 다른 시각이다. */
export const FLASH_LIFE = 0.6;
/** 광자 일정 · 겨냥 자리를 뽑는 시드. 같은 시드 · 같은 주기는 언제나 같은 화면이다. */
export const SEED = 11;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 막대 가운데(x = 0)가 접합면이다.
// ------------------------------------------------------------------------

/** 막대 반길이 · 반높이(월드). */
export const HALF_LEN = 4;
export const BAR_HALF_H = 0.8;
/** 전극 판 너비(월드). 막대 양 끝에 붙는다. */
export const PLATE_W = 0.22;
/** 램프 구멍(빛이 나오는 자리)의 높이. */
export const LAMP_Y = 2.35;
/** 전압계 가운데 높이 · 반지름(월드). 막대 아래, 두 전극에서 도선이 내려와 닿는다. */
export const METER_Y = -1.9;
export const METER_R = 0.42;

/** 캡션 자리(월드). 캡션 슬롯은 프레이밍 여백으로 잡히지 않아(장부 G24) 경계에 직접 더한다. */
export const CAPTION_BAND = 0.7;

/** 프레이밍은 고정 — 램프 위부터 전압계 · 캡션 띠까지 (S-piece · 원칙 6). */
export const SCENE_BOUNDS = {
  minX: -4.75,
  maxX: 4.75,
  minY: METER_Y - METER_R - 0.12 - CAPTION_BAND,
  maxY: LAMP_Y + 0.45,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const photovoltaicEffectMessages = Object.freeze({
  'label.title': { ko: '광전지 효과', en: 'Photovoltaic effect' },
  'label.operation': { ko: '빛이 만드는 전위차', en: 'A voltage made by light' },
  'label.stage': { ko: '실리콘 태양 전지', en: 'Silicon solar cell' },
  'label.view': { ko: '접합 단면', en: 'Junction cross-section' },

  'label.pType': { ko: 'p형', en: 'p-type' },
  'label.nType': { ko: 'n형', en: 'n-type' },
  /** 광자 하나의 에너지 · 띠 간격 · 전압. 값은 스테이지 상수의 정박값, 단위는 표식이다 (C1 판정 3). */
  'label.irPhoton': { ko: '적외선 광자 {e} eV', en: 'infrared photon {e} eV' },
  'label.visiblePhoton': { ko: '초록빛 광자 {e} eV', en: 'green photon {e} eV' },
  'label.bandGap': { ko: '띠 간격 {g} eV', en: 'band gap {g} eV' },
  'label.voltage': { ko: '{v} V', en: '{v} V' },
  /** 전기장 · 극성 · 전압계 기호. 표식이라 번역 대상이 아니다 (C1 판정 1 · 3). */
  'label.field': { ko: 'E', en: 'E' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },
  'label.meter': { ko: 'V', en: 'V' },

  'caption.dark': {
    ko: 'p형과 n형이 맞닿은 경계(옅은 띠)에는 n쪽에서 p쪽으로 향한 전기장 E가 있다. 두 끝에 이은 전압계는 0이다.',
    en: 'Where p-type meets n-type (the shaded band) a field E points from n to p. The meter across the two ends reads zero.',
  },
  'caption.ir': {
    ko: '적외선 광자는 에너지가 띠 간격보다 작아 전자-양공 쌍을 만들지 못하고 그대로 빠져나간다. 바늘은 움직이지 않는다.',
    en: 'Infrared photons carry less energy than the band gap, so they pass straight through without making electron–hole pairs. The needle stays put.',
  },
  'caption.switch': {
    ko: '램프를 적외선에서 초록빛으로 바꾼다.',
    en: 'The lamp switches from infrared to green light.',
  },
  'caption.pairs': {
    ko: '띠 간격보다 에너지가 큰 초록빛 광자는 경계에서 전자(●)와 양공(○) 쌍을 만들고, 전기장이 전자는 n쪽으로, 양공은 p쪽으로 가른다.',
    en: 'A green photon, with more energy than the band gap, makes an electron (●) and hole (○) pair at the boundary, and the field sends the electron toward n and the hole toward p.',
  },
  'caption.build': {
    ko: '갈라진 전자는 n쪽 끝에, 양공은 p쪽 끝에 쌓여 n쪽은 −, p쪽은 +가 되고 전압계 바늘이 올라간다.',
    en: 'Electrons pile up at the n end and holes at the p end, making n negative and p positive, and the meter needle rises.',
  },
  'caption.hold': {
    ko: '빛을 쬐는 동안 쌍이 계속 생겨 두 끝 사이의 전압이 그대로 유지된다.',
    en: 'As long as the light shines, new pairs keep coming and the voltage across the two ends holds.',
  },
} satisfies Record<string, LocalizedText>);

export type PhotovoltaicEffectMessageKey = keyof typeof photovoltaicEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhotovoltaicEffectMessageKey): LocalizedText => photovoltaicEffectMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhotovoltaicEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const photovoltaicEffectSchema: BundleSchema = {
  id: PHOTOVOLTAIC_EFFECT_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 「적외선은 안 된다」 와 「초록빛은 전압을 만든다」 가 모두 일어난다.
  parameters: [],

  stages: [
    {
      id: 'silicon',
      label: text('label.stage'),
      constants: {
        bandGap: BAND_GAP_EV,
        lambdaIr: LAMBDA_IR_NM,
        lambdaVisible: LAMBDA_VISIBLE_NM,
        photonEvIr: PHOTON_EV_IR,
        photonEvVisible: PHOTON_EV_VISIBLE,
        openCircuitVoltage: OPEN_CIRCUIT_VOLTAGE,
        rateIr: RATE_IR,
        rateVisible: RATE_VISIBLE,
        photonSpeed: PHOTON_SPEED,
        driftSpeed: DRIFT_SPEED,
        waveScale: WAVE_SCALE,
        depletionHalf: DEPLETION_HALF,
        stackCap: STACK_CAP,
        needleSettle: NEEDLE_SETTLE,
        flashLife: FLASH_LIFE,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'cross-section', label: text('label.view'), default: true }],

  /** 램프 · 막대 · 전압계를 위아래로 쌓고 캡션 두 줄. 마운트 뒤 바뀌지 않는다 (원칙 6). */
  canvas: { height: 440, minHeight: 360 },

  /**
   * 쓴 순서대로 겹친다 — 빛줄기 · 막대 · 공핍층 · 도선 · 운반자 · 광자 · 램프 · 이름표.
   * 광자가 막대 칠 위로 지나가야 「막대 안으로 들어간다」 로 읽힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 막대와 전기장이 서 있다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 16.6 초. 단계의 길이 · 이징 · 캡션이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `appear` · `dark` — 막대 · 공핍층 · 전기장 · 바늘 0. 램프는 꺼져 있다.
   * - `irIn` · `ir` — 램프가 적외선을 낸다. 광자가 막대를 그대로 지나 아래로 빠져나간다.
   * - `switchOut` · `switchIn` — 램프가 적외선을 끄고 초록빛을 켠다(두 이름표가 겹치지 않게 차례로). 첫 초록빛 광자가
   *   날아가지만 이 두 단계 안에는 닿지 않는다.
   * - `pairs` — 초록빛 광자가 날아가 공핍층에서 쌍을 만들고, 전자는 n쪽 · 양공은 p쪽으로 간다. 이 단계 길이는
   *   가장 빨리 끝에 닿는 운반자(이 단계 시작 + 3.04 / `driftSpeed` ≈ 2.25 초)보다 짧게 잡았다 — 쌓임(바늘)은
   *   `build` 에서만 일어난다 (NOTES c G129).
   * - `build` — 끝에 운반자가 쌓이며 전극 극성이 드러나고 바늘이 오른다.
   * - `holdIn` · `hold` — 전압 값이 나타나고, 넘쳐 온 운반자는 전극에 닿아 사라진다. 바늘은 그대로.
   * - `fade` — 옅어지며 다음 주기로 잇는다.
   *
   * 단계마다 램프가 내는 빛은 physics 의 `EMISSION` 이 안다 — 단계에 값을 실을 자리가 없다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.dark') },
      { id: 'dark', duration: 1.4, caption: key('caption.dark') },
      { id: 'irIn', duration: 1.0, caption: key('caption.ir') },
      { id: 'ir', duration: 3.0, caption: key('caption.ir') },
      { id: 'switchOut', duration: 0.5, ease: 'smooth', caption: key('caption.switch') },
      { id: 'switchIn', duration: 0.5, ease: 'smooth', caption: key('caption.switch') },
      { id: 'pairs', duration: 2.0, caption: key('caption.pairs') },
      { id: 'build', duration: 3.5, caption: key('caption.build') },
      { id: 'holdIn', duration: 0.5, ease: 'smooth', caption: key('caption.hold') },
      { id: 'hold', duration: 3.0, caption: key('caption.hold') },
      { id: 'fade', duration: 0.7, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다 — 에너지 식은 문단의 몫이다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: photovoltaicEffectMessages,
};
