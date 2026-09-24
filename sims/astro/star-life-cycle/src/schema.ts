// ========================================================================
// star-life-cycle — 선언
// ========================================================================
// 질문: 별은 어떻게 끝나고, 무엇이 그 끝을 가르는가.
//
// 질량만 다른 두 별(태양 정도 · 태양의 20 배)이 같은 때 주계열에서 시작한다.
// 무거운 별은 1000만 년 만에 붉은 초거성으로 부풀어 초신성으로 끝나고(중성자별 ·
// 블랙홀), 그동안 가벼운 별은 제자리다. 가벼운 별은 100억 년을 주계열에서 보낸 뒤
// 붉은 거성 → 행성상 성운 → 백색 왜성으로 식어 간다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:star-life-cycle` 와 문자 그대로 일치한다 (C4). */
export const STAR_LIFE_CYCLE_ID = 'star-life-cycle';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값 (원칙 2). 코드는 `readConstants` 로 읽는다.
// ------------------------------------------------------------------------

/** 두 별의 질량(태양 질량). 화면의 `{m} M☉` 이름표에 그대로 들어간다. */
export const MASS_LIGHT = 1;
export const MASS_HEAVY = 20;
/** 무거운 별의 주계열 수명 · 초신성까지의 일생(년). */
export const MS_HEAVY = 9e6;
export const END_HEAVY = 1e7;
/** 가벼운 별의 주계열 수명 · 붉은 거성 끝(껍질을 벗는 때)까지의 일생(년). */
export const MS_LIGHT = 1e10;
export const TIP_LIGHT = 1.2e10;
/** 시간 자의 오른쪽 끝(년) — 백색 왜성이 식는 동안 시계가 여기까지 간다. */
export const AGE_END = 1.4e10;
/** 태양의 유효 온도(K). 별 반지름을 태양 기준으로 잴 때(L = 4πR²σT⁴) 기준점이다. */
export const SUN_TEMPERATURE_K = 5772;
/** 행성상 성운 고리의 빛 — 이온화된 산소의 초록빛 선(nm). */
export const NEBULA_NM = 501;

// ------------------------------------------------------------------------
// 배치 — 월드 = 화면 px 설계값(860 × 480), y 만 뒤집는다(`at`).
// ------------------------------------------------------------------------

export const CANVAS_W = 860;
export const CANVAS_H = 480;

/** HR 도 그림 영역(설계 px). */
export const PLOT = { left: 96, right: 840, top: 12, bottom: 296 } as const;
/** 가로축 = log10 표면 온도(K), 왼쪽이 뜨겁다. */
export const T_AXIS = { left: 5.25, right: 3.4 } as const;
/** 세로축 = log10 광도(태양 = 0). */
export const L_AXIS = { top: 6.3, bottom: -3.8 } as const;

/** 시간 자(설계 px). 두 줄 — 무거운 별 · 가벼운 별 — 과 눈금 줄. */
export const RULER = {
  left: 96,
  right: 840,
  rowHeavy: 358,
  rowLight: 382,
  base: 400,
} as const;

/** 프레이밍 — 설계 캔버스 전체(아래 캡션 줄 포함). 매 프레임 같은 값 (S-piece). */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -CANVAS_H, maxY: 0 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const starLifeCycleMessages = Object.freeze({
  'label.title': { ko: '별의 일생', en: 'Life cycle of a star' },
  'label.stage': { ko: '두 별', en: 'Two stars' },
  'label.view': { ko: 'HR 도', en: 'HR diagram' },

  /** 온도 눈금. 수와 단위는 표식이라 두 언어가 같다 (C1 판정 3). */
  'tick.t100000': { ko: '100000K', en: '100000K' },
  'tick.t30000': { ko: '30000K', en: '30000K' },
  'tick.t10000': { ko: '10000K', en: '10000K' },
  'tick.t3000': { ko: '3000K', en: '3000K' },
  /**
   * 광도 눈금(태양 = 1). 로그 축이라 10 의 거듭제곱을 문안으로 둔다 — 코드에서 조립하지 않는다.
   * 음의 지수는 위 첨자 빼기(⁻)가 글꼴에서 떨어져 나와 분수로 쓴다.
   */
  'tick.l6': { ko: '10⁶', en: '10⁶' },
  'tick.l4': { ko: '10⁴', en: '10⁴' },
  'tick.l2': { ko: '10²', en: '10²' },
  'tick.l0': { ko: '1', en: '1' },
  'tick.l-2': { ko: '1/100', en: '1/100' },
  'axis.temperature': {
    ko: '표면 온도 — 왼쪽이 뜨겁다',
    en: 'Surface temperature — hotter to the left',
  },
  'axis.luminosity': { ko: '광도', en: 'Luminosity' },
  'axis.luminosityUnit': { ko: '(태양 = 1)', en: '(Sun = 1)' },

  /** 질량 이름표. `M☉` 는 기호라 두 언어가 같다 — 값은 스테이지 상수 그대로 (S-piece 유효숫자). */
  'label.mass': { ko: '{m} M☉', en: '{m} M☉' },

  /** 지나는 자리의 이름. 별이 거기 닿을 때 나타난다. */
  'label.mainSequence': { ko: '주계열', en: 'Main sequence' },
  'label.supergiant': { ko: '붉은 초거성', en: 'Red supergiant' },
  'label.heavyEnd': { ko: '초신성 → 중성자별 · 블랙홀', en: 'Supernova → neutron star · black hole' },
  'label.giant': { ko: '붉은 거성', en: 'Red giant' },
  'label.nebula': { ko: '행성상 성운', en: 'Planetary nebula' },
  'label.whiteDwarf': { ko: '백색 왜성', en: 'White dwarf' },

  /** 시간 자. 큰 수는 단위가 언어마다 달라(만 · 억 / million · billion) 보일 문자열 그대로 둔다. */
  'axis.age': { ko: '나이', en: 'Age' },
  'tick.age0': { ko: '0', en: '0' },
  'tick.age5e9': { ko: '50억 년', en: '5 billion yr' },
  'tick.age1e10': { ko: '100억 년', en: '10 billion yr' },
  /** 두 별의 일생 끝 — 스테이지 상수 `endHeavy` · `tipLight` 의 기본값과 같은 값이다 (NOTES). */
  'label.lifeHeavy': { ko: '1000만 년', en: '10 million yr' },
  'label.lifeLight': { ko: '120억 년', en: '12 billion yr' },

  'caption.bothMs': {
    ko: '두 별이 주계열에서 중심의 수소를 태운다 — 무거운 별이 훨씬 밝고 뜨겁다',
    en: 'Both stars burn hydrogen in their cores on the main sequence — the heavy one is far brighter and hotter',
  },
  'caption.heavyOff': {
    ko: '무거운 별은 벌써 수소를 다 쓰고 부풀어 붉은 초거성이 된다',
    en: 'The heavy star has already used up its hydrogen and swells into a red supergiant',
  },
  'caption.heavyEnd': {
    ko: '무거운 별은 초신성으로 끝나 중성자별이나 블랙홀을 남긴다 — 가벼운 별은 아직 처음 자리에 있다',
    en: 'The heavy star ends as a supernova, leaving a neutron star or black hole — the light star has not moved yet',
  },
  'caption.lightMs': {
    ko: '가벼운 별은 그 뒤로도 훨씬 오래 주계열에 머물며 천천히 수소를 태운다',
    en: 'The light star stays on the main sequence far longer, slowly burning its hydrogen',
  },
  'caption.lightGiant': {
    ko: '가벼운 별도 마침내 수소가 떨어져 부풀어 붉은 거성이 된다',
    en: 'At last the light star runs out of hydrogen too and swells into a red giant',
  },
  'caption.lightShed': {
    ko: '바깥 껍질을 벗어 행성상 성운으로 흩뜨리고, 뜨거운 중심이 드러난다',
    en: 'It sheds its outer layers as a planetary nebula, exposing the hot core',
  },
  'caption.lightCool': {
    ko: '남은 중심은 백색 왜성 — 더 타지 않고 식어 가며 어두워진다',
    en: 'The leftover core is a white dwarf — it no longer burns, and it cools and fades',
  },
} satisfies Record<string, LocalizedText>);

export type StarLifeCycleMessageKey = keyof typeof starLifeCycleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StarLifeCycleMessageKey): LocalizedText => starLifeCycleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StarLifeCycleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const starLifeCycleSchema: BundleSchema = {
  id: STAR_LIFE_CYCLE_ID,
  title: text('label.title'),
  category: 'astro',
  timeModel: 'periodic',

  // 조작기가 없다. 시계가 저절로 흐르고 두 별이 차례로 끝난다.
  parameters: [],

  stages: [
    {
      id: 'two-stars',
      label: text('label.stage'),
      constants: {
        massLight: MASS_LIGHT,
        massHeavy: MASS_HEAVY,
        msHeavy: MS_HEAVY,
        endHeavy: END_HEAVY,
        msLight: MS_LIGHT,
        tipLight: TIP_LIGHT,
        ageEnd: AGE_END,
        sunTemperatureK: SUN_TEMPERATURE_K,
        nebulaNm: NEBULA_NM,
      },
    },
  ],
  environments: [],
  views: [{ id: 'hr', label: text('label.view'), default: true }],

  /** 위 HR 도 + 아래 시간 자 두 줄 + 캡션 한 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침 순서가 판정 장치다 — 밤하늘 위에 띠 · 지나온 길 · 별 · 이름표 순으로 쌓는다. */
  drawOrder: 'scene',

  /**
   * 한 주기 26 초. 무거운 별이 먼저 일생을 마치고(both-ms → heavy-end), 그 뒤 가벼운 별이
   * 같은 길을 훨씬 오래 걸어 다른 끝에 닿는다(light-ms → light-cool). 단계마다 시간 자의 시계가
   * 스테이지 상수의 나이 구간을 지난다 — 무거운 별의 단계들은 시계가 거의 움직이지 않는다.
   */
  timeline: {
    phases: [
      { id: 'both-ms', duration: 3, caption: key('caption.bothMs') },
      { id: 'heavy-cross', duration: 2.2, ease: 'smooth', caption: key('caption.heavyOff') },
      { id: 'heavy-rsg', duration: 1.8, caption: key('caption.heavyOff') },
      { id: 'heavy-collapse', duration: 0.6, caption: key('caption.heavyEnd') },
      { id: 'heavy-end', duration: 2.6, caption: key('caption.heavyEnd') },
      { id: 'light-ms', duration: 3.5, caption: key('caption.lightMs') },
      { id: 'light-giant', duration: 3.8, ease: 'smooth', caption: key('caption.lightGiant') },
      { id: 'light-shed', duration: 2.6, ease: 'smooth', caption: key('caption.lightShed') },
      { id: 'light-cool', duration: 3.4, ease: 'smooth', caption: key('caption.lightCool') },
      { id: 'hold', duration: 2.5, caption: key('caption.lightCool') },
    ],
  },

  /** 도착하면 두 별이 이미 주계열에서 타는 중이고, 무거운 별이 띠를 따라 조금 올라와 있다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    fade: 0.25,
    style: { colorRole: 'ink', emphasis: 'medium' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 축과 눈금은 scene 이 선언한다.

  messages: starLifeCycleMessages,
};
