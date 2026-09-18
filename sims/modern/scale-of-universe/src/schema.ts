// ========================================================================
// scale-of-universe — 선언
// ========================================================================
// 질문: 원자에서 우주까지는 얼마나 먼가. 「10배씩」 이 쌓이면 무슨 일이 벌어지나.
//
// 한 칸 = 10배. 화면 틀 한 변이 10^z m 인 채로 z 를 한 칸씩 올리면, 틀 안의 모든 것이
// 한 칸마다 10분의 1로 줄어든다. 방금 틀을 채우던 원자는 두세 칸 만에 점이 되어 사라지고,
// 다음 대상(세포)은 틀 밖에서 줄어들며 들어와 틀을 채운다. 원자(10⁻¹⁰ m) → 세포 → 사람 →
// 지구 → 태양계 → 우리 은하 → 관측 가능한 우주(10²⁶ m)를 그렇게 잇는다 (Powers of Ten).
//
// 배율 전환은 카메라가 아니다 — 한 장면 안에서 대상마다 선언한 지수(스테이지 상수)로
// 크기를 정하고, boundsHint 는 고정이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:scale-of-universe` 와 문자 그대로 일치한다 (C4). */
export const SCALE_OF_UNIVERSE_ID = 'scale-of-universe';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 대상마다의 크기 — 지름(m)의 10 지수. 틀 한 변이 10^z m 일 때 대상의 지름은 틀 × 10^(지수 − z) 다.
 * 이름표 `size.*` 문안이 이 값을 그대로 쓰고 있으므로 바꾸면 문안도 함께 바꾼다(NOTES (c)).
 */
export const EXP_ATOM = -10;
export const EXP_CELL = -5;
export const EXP_PERSON = 0;
export const EXP_EARTH = 7;
export const EXP_SOLAR = 13;
export const EXP_GALAXY = 21;
export const EXP_UNIVERSE = 26;

/**
 * 태양계 그림의 행성 궤도 반지름(AU). 바깥 궤도(해왕성)가 태양계 지름 10¹³ m 의 가장자리다.
 * 지구 궤도가 해왕성 궤도의 30분의 1이라 틀을 채운 태양계에서 지구 궤도가 겨우 보인다.
 */
export const ORBIT_EARTH_AU = 1;
export const ORBIT_JUPITER_AU = 5.2;
export const ORBIT_SATURN_AU = 9.6;
export const ORBIT_URANUS_AU = 19.2;
export const ORBIT_NEPTUNE_AU = 30.1;

/**
 * 보이지 않을 만큼 작은 것을 키운 배율 — 대상 반지름에 대한 비. 실제 원자핵은 원자의 10만분의 1,
 * 태양은 태양계의 수천분의 1이라 틀을 채운 그림에서 보이지 않는다. 화면에 알리지 않는다(NOTES (b)).
 */
export const NUCLEUS_SHARE = 0.06;
export const SUN_SHARE = 0.012;

/** 흩뿌림 난수의 씨앗. 같은 씨앗은 언제나 같은 전자 구름 · 은하 · 우주다. */
export const SEED = 21;
/** 원자 전자 구름의 점 수 · 우리 은하의 별 점 수 · 우주의 은하 점 수. */
export const ATOM_CLOUD_COUNT = 70;
export const GALAXY_STAR_COUNT = 420;
export const UNIVERSE_GALAXY_COUNT = 360;

/**
 * 프레이밍은 주장의 일부다. 왼쪽에 틀, 오른쪽에 10의 거듭제곱 사다리, 아래에 틀의 치수선과
 * 캡션 자리. 대상이 커지고 줄어도 경계는 고정이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.2, maxX: 3.6, minY: -2.05, maxY: 1.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const scaleOfUniverseMessages = Object.freeze({
  'label.title': { ko: '우주의 규모', en: 'The scale of the universe' },
  'label.operation': {
    ko: '원자에서 우주까지 10의 거듭제곱으로 잇는 크기',
    en: 'Sizes from the atom to the universe, joined by powers of ten',
  },
  'label.stage': { ko: '10의 거듭제곱 사다리', en: 'Powers-of-ten ladder' },
  'label.view': { ko: '한 칸씩 물러나기', en: 'Stepping back one power at a time' },

  /** 대상 이름 — 사다리 왼쪽과, 줄어드는 대상 옆에 붙는다. */
  'name.atom': { ko: '원자', en: 'Atom' },
  'name.cell': { ko: '세포', en: 'Cell' },
  'name.person': { ko: '사람', en: 'Person' },
  'name.earth': { ko: '지구', en: 'Earth' },
  'name.solar': { ko: '태양계', en: 'Solar system' },
  'name.galaxy': { ko: '우리 은하', en: 'Milky Way' },
  'name.universe': { ko: '관측 가능한 우주', en: 'Observable universe' },

  /**
   * 크기 — 거듭제곱 표기라 번역 대상이 아니다 (C1 판정 3). 지수를 코드에서 조립하지 않는다 —
   * 보일 문자열 그대로 문안에 둔다 (지시서 · S-piece 유효숫자).
   */
  'size.atom': { ko: '10⁻¹⁰ m', en: '10⁻¹⁰ m' },
  'size.cell': { ko: '10⁻⁵ m', en: '10⁻⁵ m' },
  'size.person': { ko: '10⁰ m', en: '10⁰ m' },
  'size.earth': { ko: '10⁷ m', en: '10⁷ m' },
  'size.solar': { ko: '10¹³ m', en: '10¹³ m' },
  'size.galaxy': { ko: '10²¹ m', en: '10²¹ m' },
  'size.universe': { ko: '10²⁶ m', en: '10²⁶ m' },

  /** 사다리 한 칸의 뜻 — 사다리 맨 위에 붙는 표식. */
  'label.step': { ko: '한 칸 = ×10', en: 'one step = ×10' },

  'caption.atom': { ko: '원자 하나가 틀을 채운다', en: 'A single atom fills the frame' },
  'caption.zoom': {
    ko: '한 칸 물러날 때마다 틀 속 모든 것이 10분의 1로 줄어든다',
    en: 'Each step back shrinks everything in the frame to a tenth',
  },
  'caption.cell': {
    ko: '세포 — 방금 틀을 채우던 원자는 점이 되어 사라졌다',
    en: 'A cell — the atom that filled the frame shrank to a dot and vanished',
  },
  'caption.person': {
    ko: '사람 — 세포도 몇 칸 만에 점이 되어 사라졌다',
    en: 'A person — the cell too became a dot within a few steps',
  },
  'caption.earth': {
    ko: '지구 — 사람은 벌써 보이지 않는다',
    en: 'Earth — the person is long out of sight',
  },
  'caption.solar': {
    ko: '태양계 — 지구는 점 하나로도 남지 않는다',
    en: 'The solar system — Earth is too small to leave even a dot',
  },
  'caption.galaxy': {
    ko: '우리 은하 — 태양계가 사라진 뒤로도 빈 칸을 한참 지나 왔다',
    en: 'The Milky Way — many empty steps passed after the solar system vanished',
  },
  'caption.universe': {
    ko: '관측 가능한 우주 — 원자에서 여기까지 한 칸씩 물러나 왔다',
    en: 'The observable universe — reached from the atom one step at a time',
  },
} satisfies Record<string, LocalizedText>);

export type ScaleOfUniverseMessageKey = keyof typeof scaleOfUniverseMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ScaleOfUniverseMessageKey): LocalizedText => scaleOfUniverseMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ScaleOfUniverseMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const scaleOfUniverseSchema: BundleSchema = {
  id: SCALE_OF_UNIVERSE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 물러나는 중이고, 원자에서 우주까지 스스로 간다.
  parameters: [],

  stages: [
    {
      id: 'powers-of-ten',
      label: text('label.stage'),
      constants: {
        expAtom: EXP_ATOM,
        expCell: EXP_CELL,
        expPerson: EXP_PERSON,
        expEarth: EXP_EARTH,
        expSolar: EXP_SOLAR,
        expGalaxy: EXP_GALAXY,
        expUniverse: EXP_UNIVERSE,
        orbitEarthAu: ORBIT_EARTH_AU,
        orbitJupiterAu: ORBIT_JUPITER_AU,
        orbitSaturnAu: ORBIT_SATURN_AU,
        orbitUranusAu: ORBIT_URANUS_AU,
        orbitNeptuneAu: ORBIT_NEPTUNE_AU,
        nucleusShare: NUCLEUS_SHARE,
        sunShare: SUN_SHARE,
        seed: SEED,
        atomCloudCount: ATOM_CLOUD_COUNT,
        galaxyStarCount: GALAXY_STAR_COUNT,
        universeGalaxyCount: UNIVERSE_GALAXY_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'step-back', label: text('label.view'), default: true }],

  /** 가로로 틀과 사다리가 나란하다. 세로는 틀 하나 높이면 된다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서를 조각이 정한다 — 대상이 맨 아래, 그 위에 10배 겹 정사각 · 틀 테두리 · 사다리 ·
   * 이름표. 겹 정사각이 대상의 채움(세포핵 · 지구)에 가려 잘리면 잔상처럼 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 원자 → (물러남 → 대상)×6 → 흐려짐.
   *
   * 물러나는 단계는 `linear` 다 — 한 칸마다 같은 박자라야 「한 칸씩」 이 보인다. 그래서 단계
   * 길이는 **칸 수 × 0.4 초** 로 적었다(세포 5칸 2.0 · 사람 5칸 2.0 · 지구 7칸 2.8 · 태양계 6칸 2.4 ·
   * 은하 8칸 3.2 · 우주 5칸 2.0). 지수 상수를 바꾸면 이 길이도 손으로 맞춘다 (장부 G13 · G129).
   * 우주에서 원자로 되감지 않고 흐려졌다가 원자에서 다시 시작한다 — 되감기는 다른 주장(확대)이다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.atom') },
      { id: 'atom', duration: 1.8, caption: key('caption.atom') },
      { id: 'toCell', duration: 2.0, caption: key('caption.zoom') },
      { id: 'cell', duration: 1.8, caption: key('caption.cell') },
      { id: 'toPerson', duration: 2.0, caption: key('caption.zoom') },
      { id: 'person', duration: 1.8, caption: key('caption.person') },
      { id: 'toEarth', duration: 2.8, caption: key('caption.zoom') },
      { id: 'earth', duration: 1.8, caption: key('caption.earth') },
      { id: 'toSolar', duration: 2.4, caption: key('caption.zoom') },
      { id: 'solar', duration: 1.8, caption: key('caption.solar') },
      { id: 'toGalaxy', duration: 3.2, caption: key('caption.zoom') },
      { id: 'galaxy', duration: 1.8, caption: key('caption.galaxy') },
      { id: 'toUniverse', duration: 2.0, caption: key('caption.zoom') },
      { id: 'universe', duration: 2.6, caption: key('caption.universe') },
      { id: 'fade', duration: 0.6, caption: key('caption.universe') },
    ],
  },

  /**
   * 도착한 순간 이미 물러나는 중이다 — 원자가 틀을 채운 뒤 막 줄어들기 시작한 자리에서 연다.
   * 0 이면 흐려진 빈 틀이 먼저 보인다.
   */
  startAt: 2.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 거듭제곱의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 크롬 그리드 · 카메라 단추 없음(기본값). 미터 격자는 배율이 바뀌면 뜻을 잃는다 — 대신 틀 안에
   * 10배 간격 정사각 겹을 그려 한 칸 = 10배를 보인다.
   */

  messages: scaleOfUniverseMessages,
};
