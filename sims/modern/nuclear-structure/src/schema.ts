// ========================================================================
// nuclear-structure — 선언
// ========================================================================
// 질문: 원자핵에 알갱이가 더 들어오면 다른 원소가 되는가?
//
// 답: 무엇이 들어오느냐에 달렸다. **양성자 수(Z)가 원소를 정하고, 중성자 수는
// 같은 원소 안에서 동위원소를 가른다.** 탄소-12 에 중성자 둘이 더 들어와도 여전히
// 탄소(탄소-14)이고, 탄소-14 의 중성자 하나가 양성자로 바뀌면 질량수(A)는 14 그대로인데
// 질소-14 가 된다.
//
// 화면에서는 세 자리에 핵이 차례로 지어진다. 알갱이가 들어오거나 바뀌는 순간 위의
// 이름표(ᴬ_Z X)가 따라 바뀐다 — A 만 바뀌면 기호는 그대로, Z 가 바뀌면 기호가 바뀐다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:nuclear-structure` 와 문자 그대로 일치한다 (C4). */
export const NUCLEAR_STRUCTURE_ID = 'nuclear-structure';

// ------------------------------------------------------------------------
// 핵종 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 목록을 선언할 수 없어 세 핵종의 양성자 · 중성자 수를 이름 여섯으로 흩는다 (장부 G105).
// ------------------------------------------------------------------------

/** 첫째 자리 — 탄소-12. */
export const Z1 = 6;
export const N1 = 6;
/** 둘째 자리 — 탄소-14. 첫째에서 중성자만 둘 더. */
export const Z2 = 6;
export const N2 = 8;
/** 셋째 자리 — 질소-14. 둘째에서 중성자 하나가 양성자로. */
export const Z3 = 7;
export const N3 = 7;

/**
 * 원자 번호 → 원소 기호 · 이름 문안 키. 기호는 표식(C1 판정 3), 이름은 문안이다.
 *
 * 스테이지 상수로 Z 를 바꿔도 이름표가 따라가도록 수소부터 산소까지 둔다. 표 자체는
 * 코드에 남는다 — 목록을 선언할 자리가 없다 (장부 G105).
 */
export const ELEMENTS: Readonly<Record<number, { symbol: string; name: NuclearStructureMessageKey }>> = {
  1: { symbol: 'H', name: 'name.1' },
  2: { symbol: 'He', name: 'name.2' },
  3: { symbol: 'Li', name: 'name.3' },
  4: { symbol: 'Be', name: 'name.4' },
  5: { symbol: 'B', name: 'name.5' },
  6: { symbol: 'C', name: 'name.6' },
  7: { symbol: 'N', name: 'name.7' },
  8: { symbol: 'O', name: 'name.8' },
};

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의(핵자 반지름이 0.2). 원점은 가운데 핵의 중심.
// ------------------------------------------------------------------------

/** 세 자리의 중심 x. */
export const SLOT_X = [-3, 0, 3] as const;
/** 핵자 반지름(월드). */
export const NUCLEON_R = 0.2;
/**
 * 핵자를 해바라기 씨 배열(황금각 나선)로 놓을 때의 간격 계수(월드).
 * i 번째 핵자는 중심에서 `NUCLEON_SPACING · √(i + ½)` 떨어진다. 핵자가 살짝 겹쳐 한 덩어리로 읽힌다.
 */
export const NUCLEON_SPACING = 0.185;
/** 새로 들어오는 핵자가 출발하는 거리 — 제자리에서 바깥쪽으로(월드). */
export const FLY_IN_DIST = 1.2;
/** 핵종 표기(ᴬ_Z X)의 세로 자리 · 이름(탄소-12)의 세로 자리(월드). */
export const NOTATION_Y = 1.3;
export const NAME_Y = -1.08;
/** 괄호의 세로 자리 · 괄호 끝이 위로 올라가는 길이 · 괄호가 자리 중심에서 물러나는 거리(월드). */
export const BRACKET_Y = -1.42;
export const BRACKET_TICK = 0.1;
export const BRACKET_INSET = 0.28;
/** 괄호 이름표의 세로 자리(월드). */
export const BRACKET_LABEL_Y = -1.66;

/**
 * 고정 경계. 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로
 * 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -2.2, maxY: 1.62 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nuclearStructureMessages = Object.freeze({
  'label.title': { ko: '원자핵의 구성', en: 'What a nucleus is made of' },
  'label.stage': { ko: '탄소와 질소', en: 'Carbon and nitrogen' },
  'label.view': { ko: '세 핵', en: 'Three nuclei' },

  /** 수 · 기호 하나를 그대로 띄우는 자리. 핵종 표기의 A · Z · 기호는 표식이다 (C1 판정 3). */
  'label.value': { ko: '{v}', en: '{v}' },

  /** 원소 이름 + 질량수. 값이 끼는 조립문이라 문안이다. */
  'name.1': { ko: '수소-{a}', en: 'hydrogen-{a}' },
  'name.2': { ko: '헬륨-{a}', en: 'helium-{a}' },
  'name.3': { ko: '리튬-{a}', en: 'lithium-{a}' },
  'name.4': { ko: '베릴륨-{a}', en: 'beryllium-{a}' },
  'name.5': { ko: '붕소-{a}', en: 'boron-{a}' },
  'name.6': { ko: '탄소-{a}', en: 'carbon-{a}' },
  'name.7': { ko: '질소-{a}', en: 'nitrogen-{a}' },
  'name.8': { ko: '산소-{a}', en: 'oxygen-{a}' },

  /** 괄호 이름표. Z · A 는 기호라 번역하지 않는다. */
  'label.sameElement': { ko: 'Z 같음 — 같은 원소', en: 'same Z — same element' },
  'label.otherElement': { ko: 'A 같음, Z 다름 — 다른 원소', en: 'same A, new Z — new element' },

  'caption.first': {
    ko: '양성자 {z1}개(+)와 중성자 {n1}개가 뭉친 핵이다.',
    en: 'A nucleus of {z1} protons (+) and {n1} neutrons packed together.',
  },
  'caption.add': {
    ko: '중성자가 더 들어온다 — 질량수는 {a1} 에서 {a2} 로 늘지만 양성자는 그대로 {z2}개다.',
    en: 'More neutrons join — the mass number goes from {a1} to {a2}, but there are still {z2} protons.',
  },
  'caption.same': {
    ko: '양성자 수가 같으니 기호도 같다 — 중성자 수만 다른 동위원소다.',
    en: 'The proton count is the same, so the symbol is the same — isotopes differ only in neutrons.',
  },
  'caption.change': {
    ko: '중성자 하나가 양성자로 바뀐다 — 알갱이 수는 {a2}개 그대로다.',
    en: 'One neutron turns into a proton — there are still {a2} particles.',
  },
  'caption.other': {
    ko: '질량수가 같아도 양성자가 {z3}개가 되자 기호가 {s3} 로 바뀌었다 — 다른 원소다.',
    en: 'Same mass number, but with {z3} protons the symbol has become {s3} — a different element.',
  },
} satisfies Record<string, LocalizedText>);

export type NuclearStructureMessageKey = keyof typeof nuclearStructureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NuclearStructureMessageKey): LocalizedText => nuclearStructureMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NuclearStructureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nuclearStructureSchema: BundleSchema = {
  id: NUCLEAR_STRUCTURE_ID,
  title: text('label.title'),
  category: 'modern',
  timeModel: 'periodic',

  // 조작기가 없다. 세 핵이 차례로 지어지는 자동 진행만으로 주장이 끝난다.
  parameters: [],
  stages: [
    {
      id: 'carbon-nitrogen',
      label: text('label.stage'),
      constants: { z1: Z1, n1: N1, z2: Z2, n2: N2, z3: Z3, n3: N3 },
    },
  ],
  environments: [],
  views: [{ id: 'three-nuclei', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 핵을 한 줄에 세운다. 세로는 이름표 · 핵 · 괄호 · 캡션 한 줄. */
  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 겹친다 — 핵자 위에 + 표식, 그 위에 방금 바뀐 알갱이 고리. */
  drawOrder: 'scene',

  /** 도착한 순간 첫 핵이 이미 서 있고, 곧 둘째 자리로 옮겨 간다 (S-piece). */
  startAt: 1.4,

  /**
   * 한 주기 13.8 초.
   *
   * - `first` — 첫 핵 하나만 서 있다.
   * - `copyA` — 첫 핵과 같은 것이 둘째 자리로 옮겨 간다.
   * - `add` — 둘째 핵에 모자란 알갱이가 바깥에서 들어온다(기본값에서는 중성자 둘).
   * - `sameIn` · `same` — 첫째 · 둘째를 잇는 괄호(같은 Z)가 나타나 머문다.
   * - `copyB` — 둘째 핵과 같은 것이 셋째 자리로 옮겨 간다.
   * - `change` — 종류가 다른 자리의 알갱이가 바뀐다(기본값에서는 중성자 하나 → 양성자).
   * - `otherIn` · `other` — 둘째 · 셋째를 잇는 괄호(같은 A, 다른 Z)가 나타나 머문다.
   * - `fade` — 둘째 · 셋째가 물러나고 첫 핵만 남아 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'first', duration: 2.4, caption: key('caption.first') },
      { id: 'copyA', duration: 1.0, ease: 'smooth', caption: key('caption.first') },
      { id: 'add', duration: 1.4, ease: 'smooth', caption: key('caption.add') },
      { id: 'sameIn', duration: 0.5, ease: 'smooth', caption: key('caption.same') },
      { id: 'same', duration: 2.3, caption: key('caption.same') },
      { id: 'copyB', duration: 1.0, ease: 'smooth', caption: key('caption.change') },
      { id: 'change', duration: 1.4, ease: 'smooth', caption: key('caption.change') },
      { id: 'otherIn', duration: 0.5, ease: 'smooth', caption: key('caption.other') },
      { id: 'other', duration: 2.5, caption: key('caption.other') },
      { id: 'fade', duration: 0.8, caption: key('caption.other') },
    ],
  },

  /** 슬롯 하나. 수 · 기호는 state 가 스테이지 상수에서 만들어 둔다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      z1: 'caption.z1',
      n1: 'caption.n1',
      a1: 'caption.a1',
      a2: 'caption.a2',
      z2: 'caption.z2',
      z3: 'caption.z3',
      s3: 'caption.s3',
    },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것이 거리가 아니다 (S-piece).

  messages: nuclearStructureMessages,
};
