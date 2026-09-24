// ========================================================================
// black-hole-horizon — 선언
// ========================================================================
// 질문: 같은 질량을 점점 작게 짜부라뜨리면 표면에서 쏜 빛은 어떻게 되는가.
//
// 질량은 그대로 두고 반지름만 줄인다. 표면의 탈출 속도 √(2GM/R) 는 반지름이 줄수록 커지다가
// R = 2GM/c² (태양 질량이면 약 3 km) 에서 광속이 된다. 그 안으로 짜부라뜨리면 표면에서 바깥으로
// 쏜 빛조차 지평선을 넘지 못하고 되돌아온다 — 그 반지름이 안과 밖을 가르는 지평선이다.
//
// 곧장 위로 쏘는 레인(`escape-velocity`) · −GM/r 우물 그래프(`gravitational-potential-energy-general`)
// 는 이 조각의 몫이 아니다. 여기서 움직이는 것은 쏘는 속도가 아니라 **별의 반지름**이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:black-hole-horizon` 와 문자 그대로 일치한다 (C4). */
export const BLACK_HOLE_HORIZON_ID = 'black-hole-horizon';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 만유인력 상수 G(m³/(kg·s²)). */
export const GRAVITATIONAL_CONSTANT = 6.674e-11;
/** 별의 질량 M(kg). 태양 질량 — 조각 내내 그대로다. */
export const STAR_MASS_KG = 1.989e30;
/** 광속 c(m/s). */
export const LIGHT_SPEED = 299792458;
/**
 * 짜부라뜨리는 동안 멈춰 서는 반지름 셋(km). 태양 크기 · 그 100 분의 1 · 중성자별 크기.
 * 화면의 반지름 글자는 이 값을 그대로 쓴다 (S-piece 유효숫자).
 * 목록을 선언할 자리가 없어 이름 셋으로 흩는다 (장부 G105).
 */
export const RADIUS_1_KM = 696000;
export const RADIUS_2_KM = 7000;
export const RADIUS_3_KM = 12;
/**
 * 지평선을 지나 더 짜부라뜨린 마지막 반지름 — 지평선 반지름의 몇 배인가.
 * 0.5 이면 표면에서 쏜 빛이 (뉴턴 역학으로) 정확히 지평선까지 올랐다가 돌아온다 — NOTES (b).
 */
export const INSIDE_FACTOR = 0.5;
/**
 * 지평선 이름표에 쓰는 반지름(km). 2GM/c² 를 계산하면 2.95… 가 나오지만 화면에는 이 선언값을
 * 그대로 쓴다 — 계산값을 줄여 적지 않는다 (S-piece 유효숫자).
 */
export const HORIZON_LABEL_KM = 3;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/** 지평선 반지름이 차지하는 월드 길이. 별 중심은 월드 원점이다. */
export const HORIZON_WORLD = 1;
/**
 * 반지름을 줄이지 않고 그대로(선형으로) 그리는 한계 — 지평선 반지름의 몇 배까지인가.
 * 그 밖(태양 크기 · 그 100 분의 1)은 한 자리수마다 `WORLD_PER_DECADE` 만 커지게 눌러 그린다.
 * 지평선 원은 별이 이 선형 구간에 들어온 뒤에만 나타난다 — 눌러 그린 곳에서는 비율이 거짓이다.
 */
export const LINEAR_UP_TO = 2;
/** 선형 구간 밖에서 반지름 한 자리수(10 배)가 차지하는 월드 길이. */
export const WORLD_PER_DECADE = 0.2;
/** 탈출 속도 막대에서 광속 c 가 차지하는 월드 길이. */
export const BAR_LENGTH = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 탈출 속도 막대가 시작하는 자리(월드). 막대는 오른쪽으로 자란다. */
export const BAR_ORIGIN: readonly [number, number] = [3.1, -1.1];

/** 캡션이 서는 자리(월드). 막대 위 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [3.1, 1.3];

/**
 * 프레이밍은 주장의 일부다. 가로는 지평선 원(왼쪽 끝 −1)부터 막대가 광속을 넘어 자라는 자리
 * 너머까지, 세로는 지평선 원 · 캡션 · 막대를 담는다. 태양 크기의 별은 위아래 · 왼쪽으로 넘친다 —
 * 도착한 순간 거대한 별이 화면 왼쪽을 채운다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.35, maxX: 7.6, minY: -1.55, maxY: 1.55 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const blackHoleHorizonMessages = Object.freeze({
  'label.title': { ko: '사건 지평선', en: 'Event horizon' },
  'label.operation': { ko: '탈출 속도가 광속이 되는 반지름', en: 'The radius where escape speed reaches light speed' },
  'label.stage': { ko: '태양 질량', en: 'One solar mass' },
  'label.view': { ko: '짜부라뜨리기', en: 'Squeezing' },
  /** 별 반지름. 값은 스테이지 상수 그대로 끼운다. */
  'label.radius': { ko: '반지름 {r} km', en: 'radius {r} km' },
  /** 지평선 이름표. 값은 스테이지 상수 그대로 끼운다. */
  'label.horizon': { ko: '사건 지평선 · 약 {r} km', en: 'event horizon · about {r} km' },
  'label.escape': { ko: '표면의 탈출 속도', en: 'escape speed at the surface' },
  'label.light': { ko: '광속 c', en: 'light speed c' },
  'caption.sun': {
    ko: '태양만 한 별의 표면에서 쏜 빛은 그대로 빠져나간다 — 탈출 속도는 광속에 비하면 거의 0 이다',
    en: 'Light fired from the surface of a Sun-sized star simply leaves — its escape speed is next to nothing beside light speed',
  },
  'caption.squeeze': {
    ko: '질량은 그대로 두고 반지름만 줄인다 — 표면의 탈출 속도가 커진다',
    en: 'Keep the mass, shrink the radius — the escape speed at the surface grows',
  },
  'caption.still': {
    ko: '탈출 속도가 광속에 못 미치는 한, 표면에서 쏜 빛은 빠져나간다',
    en: 'As long as the escape speed falls short of light speed, light from the surface gets out',
  },
  'caption.horizon': {
    ko: '이 반지름에서 탈출 속도가 광속에 닿는다 — 이 반지름이 지평선이다',
    en: 'At this radius the escape speed reaches light speed — this radius is the horizon',
  },
  'caption.deeper': {
    ko: '더 짜부라뜨리면 별 전체가 지평선 안으로 들어간다',
    en: 'Squeeze further, and the whole star sinks inside the horizon',
  },
  'caption.inside': {
    ko: '지평선 안에서는 바깥으로 쏜 빛조차 지평선을 넘지 못하고 되돌아온다',
    en: 'Inside the horizon, even light fired outward cannot cross it and falls back',
  },
} satisfies Record<string, LocalizedText>);

export type BlackHoleHorizonMessageKey = keyof typeof blackHoleHorizonMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BlackHoleHorizonMessageKey): LocalizedText => blackHoleHorizonMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BlackHoleHorizonMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const blackHoleHorizonSchema: BundleSchema = {
  id: BLACK_HOLE_HORIZON_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 반지름을 줄여 가는 일은 자동 진행이 한다 — 슬라이더를 주면 지평선 근처
  // (선형 구간)와 태양 크기(눌러 그린 구간)를 한 손잡이로 오가야 해 광속에 닿는 순간을 짚기 어렵다.
  parameters: [],

  stages: [
    {
      id: 'solar-mass',
      label: text('label.stage'),
      constants: {
        gravitationalConstant: GRAVITATIONAL_CONSTANT,
        massKg: STAR_MASS_KG,
        lightSpeed: LIGHT_SPEED,
        radius1Km: RADIUS_1_KM,
        radius2Km: RADIUS_2_KM,
        radius3Km: RADIUS_3_KM,
        insideFactor: INSIDE_FACTOR,
        horizonLabelKm: HORIZON_LABEL_KM,
        horizonWorld: HORIZON_WORLD,
        linearUpTo: LINEAR_UP_TO,
        worldPerDecade: WORLD_PER_DECADE,
        barLength: BAR_LENGTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'squeeze', label: text('label.view'), default: true }],

  /** 가로로 넓게 — 세로가 비싸다 (S-piece). 별은 왼쪽, 막대와 캡션은 오른쪽. */
  canvas: { height: 300, minHeight: 280 },

  /** 별 위에 지평선 원, 그 위에 빛 펄스. 겹침 순서가 뜻을 갖는다. */
  drawOrder: 'scene',

  /**
   * 정지 셋 · 짜부라뜨리기 넷 · 지평선 · 지평선 안.
   *
   * - `sun-*` · `dwarf-*` · `neutron-*` — 반지름 `radius1Km` · `radius2Km` · `radius3Km` 에 멈춰 표면에서 빛을
   *   한 번 쏜다. 멈춤마다 셋으로 쪼갠다 — `-before`(펄스 전) · `-pulse`(펄스가 표면을 떠나 화면 끝을
   *   벗어날 때까지) · `-after`(펄스 뒤). 빛은 빠져나간다. 캡션은 셋이 같은 키를 되풀이해 한 문장이다.
   * - `squeeze1`~`squeeze3` — 다음 반지름으로 줄인다(로그 등간격). `squeeze3` 은 지평선 반지름에서 멈춘다.
   * - `horizon` — 표면이 지평선에 닿았다. 막대가 c 선에 닿는다.
   * - `squeeze4` — 지평선의 `insideFactor` 배까지 더 줄인다.
   * - `trapped-before` · `trapped-pulse` · `trapped-after` — 표면에서 바깥으로 쏜 빛이 `trapped-pulse` 동안
   *   지평선까지 올랐다가 되돌아온다.
   * - `fade` — 흐려지고 다음 주기로 넘어간다.
   */
  timeline: {
    phases: [
      { id: 'sun-before', duration: 0.384, caption: key('caption.sun') },
      { id: 'sun-pulse', duration: 2.176, caption: key('caption.sun') },
      { id: 'sun-after', duration: 0.64, caption: key('caption.sun') },
      { id: 'squeeze1', duration: 1.8, ease: 'smooth', caption: key('caption.squeeze') },
      { id: 'dwarf-before', duration: 0.312, caption: key('caption.still') },
      { id: 'dwarf-pulse', duration: 1.768, caption: key('caption.still') },
      { id: 'dwarf-after', duration: 0.52, caption: key('caption.still') },
      { id: 'squeeze2', duration: 1.8, ease: 'smooth', caption: key('caption.squeeze') },
      { id: 'neutron-before', duration: 0.312, caption: key('caption.still') },
      { id: 'neutron-pulse', duration: 1.768, caption: key('caption.still') },
      { id: 'neutron-after', duration: 0.52, caption: key('caption.still') },
      { id: 'squeeze3', duration: 2.4, ease: 'smooth', caption: key('caption.squeeze') },
      { id: 'horizon', duration: 3.0, caption: key('caption.horizon') },
      { id: 'squeeze4', duration: 2.0, ease: 'smooth', caption: key('caption.deeper') },
      { id: 'trapped-before', duration: 0.312, caption: key('caption.inside') },
      { id: 'trapped-pulse', duration: 3.952, caption: key('caption.inside') },
      { id: 'trapped-after', duration: 0.936, caption: key('caption.inside') },
      { id: 'fade', duration: 0.8, caption: key('caption.inside') },
    ],
  },

  /** 도착한 순간 거대한 별의 표면에서 빛이 이미 떠나 있다. */
  startAt: 1.0,

  // 슬롯 하나. 막대 위 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 14,
    wrapWidth: 380,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 별의 반지름은 눌러 그린 구간이 있어 격자로 잴 수 없다 —
   * 크기는 반지름 글자가 말한다.
   */

  messages: blackHoleHorizonMessages,
};
