// ========================================================================
// nuclear-fission — 선언
// ========================================================================
// 질문: 무거운 핵이 갈라질 때 무엇이 나오는가?
//
// 답: 느린 중성자 하나를 삼킨 우라늄-235 는 들뜬 우라늄-236 이 되어 흔들리다 길게
// 늘어나고, 가운데가 잘록해지며 **두 중간 크기 핵(바륨-141 · 크립톤-92)과 중성자 셋**으로
// 갈라진다. 두 조각은 서로 밀어내며 빨라진다 — 그 운동이 풀려난 약 200 MeV 다.
// 알갱이 수는 그대로다: 235 + 1 = 141 + 92 + 3.
//
// 연쇄(나온 중성자가 다른 핵을 쪼개는 것)는 이웃 `chain-reaction` 의 몫이라 하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:nuclear-fission` 와 문자 그대로 일치한다 (C4). */
export const NUCLEAR_FISSION_ID = 'nuclear-fission';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// 목록을 선언할 수 없어 핵종 셋을 이름으로 흩는다 (장부 G105).
// ------------------------------------------------------------------------

/** 쪼개지는 핵 — 우라늄-235. */
export const Z_TARGET = 92;
export const A_TARGET = 235;
/** 무거운 조각 — 바륨-141. */
export const Z_HEAVY = 56;
export const A_HEAVY = 141;
/** 가벼운 조각 — 크립톤-92. */
export const Z_LIGHT = 36;
export const A_LIGHT = 92;
/** 갈라질 때 나오는 중성자 수. A_TARGET + 1 = A_HEAVY + A_LIGHT + N_OUT 이어야 한다. */
export const N_OUT = 3;
/** 한 번의 핵분열이 내는 에너지(MeV) — 화면에 그대로 띄우는 정박값이다. */
export const ENERGY_MEV = 200;

/**
 * 핵 반지름 축척(월드 / A^⅓). 핵 반지름은 질량수의 세제곱근에 비례한다 — 중성자 하나의
 * 반지름이 이 값이다.
 */
export const RADIUS_SCALE = 0.15;
/**
 * 화면에서 키운 속력(월드/초). 실제 조각은 빛의 몇 % 로 날아가 눈에 보이지 않는다 — 보이게
 * 늦춘 배율이다. 가벼운 조각의 끝 속력이고, 무거운 조각은 운동량이 같도록 A 에 반비례한다.
 */
export const FRAGMENT_SPEED = 2.0;
/** 두 조각이 서로 밀어내며 빨라지는 시간 상수(조각 시계 초). */
export const REPULSION_TIME = 0.35;
/** 튀어나오는 중성자의 속력(월드/초) — 조각과 같은 배율로 늦췄다. */
export const NEUTRON_SPEED = 1.3;
/** 중성자가 튀어나오는 방향의 흩어짐을 뽑는 시드. 주기마다 (시드, 주기 번호)로 다시 뽑는다. */
export const SEED = 23;

/**
 * 원자 번호 → 원소 기호. 기호는 표식이다 (C1 판정 3).
 *
 * 스테이지 상수로 다른 핵분열 쌍(Xe · Sr, Cs · Rb 등)을 골라도 이름표가 따라가도록
 * 흔한 조각들을 둔다. 표 자체는 코드에 남는다 — 목록을 선언할 자리가 없다 (장부 G105).
 */
export const SYMBOLS: Readonly<Record<number, string>> = {
  35: 'Br',
  36: 'Kr',
  37: 'Rb',
  38: 'Sr',
  39: 'Y',
  40: 'Zr',
  42: 'Mo',
  50: 'Sn',
  52: 'Te',
  53: 'I',
  54: 'Xe',
  55: 'Cs',
  56: 'Ba',
  57: 'La',
  58: 'Ce',
  92: 'U',
  94: 'Pu',
};

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 처음 핵의 중심.
// ------------------------------------------------------------------------

/**
 * 들어오는 느린 중성자가 출발하는 x(월드). `approach` 단계 동안 핵 가장자리까지 오므로 이
 * 거리가 곧 느린 중성자의 화면 속력을 정한다 — 튀어나오는 중성자의 절반 아래가 되게 잡았다.
 */
export const INCOMING_X = -2.9;
/** 에너지 글자가 놓이는 자리(월드) — 두 조각이 떠난 가운데, 갈라진 곳 바로 위. */
export const ENERGY_POS = [0.3, 0] as const;
/**
 * 질량수 장부의 자리 — 캔버스 위 가운데(화면 px 띄움). 장부 글자는 두 조각 사이 틈보다
 * 넓어서 월드에 두면 조각에 닿는다.
 */
export const BALANCE_OFFSET = [0, 8] as const;

/**
 * 고정 경계. 조각이 가장 멀리 간 자리(사라지는 단계 끝)까지 들어가게 처음부터 잡는다
 * (원칙 6). 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지
 * 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -6.2, maxX: 6.2, minY: -3.1, maxY: 2.7 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nuclearFissionMessages = Object.freeze({
  'label.title': { ko: '핵분열', en: 'Nuclear fission' },
  'label.operation': { ko: '무거운 핵이 갈라지며 내는 에너지', en: 'The energy released when a heavy nucleus splits' },
  'label.stage': { ko: '우라늄-235', en: 'Uranium-235' },
  'label.view': { ko: '한 번의 분열', en: 'One fission' },

  /** 수 · 기호 하나를 그대로 띄우는 자리. 핵종 표기의 A · 기호 · n 은 표식이다 (C1 판정 3). */
  'label.value': { ko: '{v}', en: '{v}' },
  /** 질량수 장부 — 값이 끼는 조립식이라 문안으로 둔다. */
  'label.balance': { ko: '{aT} + 1 = {aH} + {aL} + {n}', en: '{aT} + 1 = {aH} + {aL} + {n}' },
  'label.energy': { ko: '약 {e} MeV', en: '≈ {e} MeV' },

  'caption.approach': {
    ko: '느린 중성자 하나가 {sT}-{aT} 핵으로 다가간다.',
    en: 'A slow neutron drifts toward a {sT}-{aT} nucleus.',
  },
  'caption.absorb': {
    ko: '중성자를 삼킨 핵은 {sT}-{aC} 이 되어 크게 흔들린다.',
    en: 'Having swallowed the neutron, the nucleus becomes {sT}-{aC} and wobbles hard.',
  },
  'caption.stretch': {
    ko: '흔들림을 못 이기고 길게 늘어나며 가운데가 잘록해진다.',
    en: 'The wobble wins: it stretches out and pinches in the middle.',
  },
  'caption.split': {
    ko: '{sH}-{aH} 과 {sL}-{aL} 로 갈라지며 중성자 {n}개가 튀어나온다 — 두 조각은 서로 밀어내며 빨라진다.',
    en: 'It splits into {sH}-{aH} and {sL}-{aL}, throwing out {n} neutrons — the two pieces push apart and speed up.',
  },
  'caption.tally': {
    ko: '알갱이 수는 그대로다 — 그런데 조각들이 약 {e} MeV 의 에너지를 싣고 날아간다.',
    en: 'No particle is lost — yet the pieces fly off carrying about {e} MeV.',
  },
} satisfies Record<string, LocalizedText>);

export type NuclearFissionMessageKey = keyof typeof nuclearFissionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NuclearFissionMessageKey): LocalizedText => nuclearFissionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NuclearFissionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nuclearFissionSchema: BundleSchema = {
  id: NUCLEAR_FISSION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 한 번의 분열이 자동으로 일어나며 주장이 끝난다.
  parameters: [],
  stages: [
    {
      id: 'uranium-235',
      label: text('label.stage'),
      constants: {
        zTarget: Z_TARGET,
        aTarget: A_TARGET,
        zHeavy: Z_HEAVY,
        aHeavy: A_HEAVY,
        zLight: Z_LIGHT,
        aLight: A_LIGHT,
        nOut: N_OUT,
        energyMeV: ENERGY_MEV,
        radiusScale: RADIUS_SCALE,
        fragmentSpeed: FRAGMENT_SPEED,
        repulsionTime: REPULSION_TIME,
        neutronSpeed: NEUTRON_SPEED,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'one-fission', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 갈라진 두 조각이 좌우로 날아간다. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 핵 위에 중성자, 그 위에 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 느린 중성자가 이미 핵으로 가는 중이다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기 — 조각 시계 9.6 초, 화면에서는 `reveal` · `tally` 가 다섯 배 느려 12.0 초.
   *
   * - `approach` — 느린 중성자가 왼쪽에서 U-235 로 다가간다.
   * - `absorb` — 중성자가 핵 속으로 들어가고, 이름표가 ²³⁶U 로 바뀐다.
   * - `wobble` — 들뜬 핵이 점점 크게 흔들린다(길쭉 ↔ 납작).
   * - `stretch` — 길게 늘어나며 가운데가 잘록해져 끊기기 직전까지 간다.
   * - `split` — 두 조각이 떨어져 서로 밀어내며 빨라지고, 중성자가 튀어나온다.
   * - `reveal` — 느린 화면(×0.2)으로 넘어가며 질량수 장부와 에너지가 떠오른다.
   * - `tally` — 느린 화면 그대로 머문다. 조각 · 중성자는 멈추지 않고 천천히 나아간다.
   * - `clear` — 조각 · 중성자 · 글자가 물러난다.
   * - `renew` — 다음 U-235 와 느린 중성자가 제자리에 선다. 둘을 나눈 것은 떠나는 조각 위에
   *   새 핵이 겹쳐 나타나지 않게 하려는 것이다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 2.6, caption: key('caption.approach') },
      { id: 'absorb', duration: 0.6, ease: 'smooth', caption: key('caption.absorb') },
      { id: 'wobble', duration: 2.2, caption: key('caption.absorb') },
      { id: 'stretch', duration: 1.4, ease: 'smooth', caption: key('caption.stretch') },
      { id: 'split', duration: 1.4, caption: key('caption.split') },
      { id: 'reveal', duration: 0.1, timeScale: 0.2, caption: key('caption.tally') },
      { id: 'tally', duration: 0.5, timeScale: 0.2, caption: key('caption.tally') },
      { id: 'clear', duration: 0.4, caption: key('caption.tally') },
      { id: 'renew', duration: 0.4, caption: key('caption.approach') },
    ],
  },

  /** 슬롯 하나. 기호 · 수는 state 가 스테이지 상수에서 만들어 둔다 (장부 G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      sT: 'caption.sT',
      aT: 'caption.aT',
      aC: 'caption.aC',
      sH: 'caption.sH',
      aH: 'caption.aH',
      sL: 'caption.sL',
      aL: 'caption.aL',
      n: 'caption.n',
      e: 'caption.e',
    },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것이 거리가 아니다 (S-piece).

  messages: nuclearFissionMessages,
};
