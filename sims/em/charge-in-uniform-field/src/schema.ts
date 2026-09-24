// ========================================================================
// charge-in-uniform-field — 선언
// ========================================================================
// 질문: 균일한 전기장 속으로 옆에서 들어온 전하는 어떤 길을 가는가.
//
// 두 판(위 +, 아래 −) 사이로 양전하가 판과 나란하게 들어온다. 판과 나란한 쪽으로는
// 같은 시간마다 같은 걸음을 가고, − 판 쪽으로는 걸음마다 더 많이 내려온다 — 던진 공과
// 같은 포물선이다. 같은 시간 간격의 자국(스트로보)과, 장이 없었다면 갔을 곧은 점선
// 길에서 자국까지 내려온 거리(세로선)가 그것을 보인다. 이어 질량이 몇 배인 전하를 같은
// 속도로 들여보내면 같은 칸마다 내려온 거리가 그 배수의 역수다.
//
// 이웃과 겹치지 않는 자리 — `uniform-field` 는 판 사이 어디서나 힘이 같다는 것(전하를
// 놓아주지 않는다), `charged-particle-in-magnetic-field` 는 자기장 속 원운동이다.
// 이 조각은 **전기장 속 포물선** 에 머문다 — 원운동과 견주지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:charge-in-uniform-field` 와 문자 그대로 일치한다 (C4). */
export const CHARGE_IN_UNIFORM_FIELD_ID = 'charge-in-uniform-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이, 시간은 초다. 판 방향 가속 a = qE/m 이 일정하다.
// ------------------------------------------------------------------------

/** 전하량 q(두 전하 모두). 양전하라 − 판 쪽으로 힘을 받는다. */
export const CHARGE = 1;
/** 가벼운 전하의 질량 m. */
export const MASS = 1;
/** 두 번째 전하의 질량 배수 — 질량 = 배수 × m. 캡션 · 이름표에 그대로 뜬다. */
export const HEAVY_MASS_RATIO = 2;
/** 판 사이 장의 세기 E. 판 방향 가속 = qE/m. */
export const FIELD = 0.28;
/** 들어올 때의 속력 v₀(월드/초) — 판과 나란하다. 두 전하가 같다. */
export const SPEED = 2;
/** 판 간격(월드). 판은 y = ±간격/2 에 놓인다. */
export const GAP = 3;
/** 판 길이(월드). 판은 x = 0 에서 판 길이까지. 전하가 판 끝에 닿으면 비행이 끝난다. */
export const PLATE_LENGTH = 8;
/** 판 두께(월드) — 그림의 두께다. */
export const PLATE_THICKNESS = 0.12;
/** 전하가 들어오는 높이(월드). 위 판 조금 아래. */
export const ENTRY_Y = 1.1;
/** 판 앞에서 달려 들어오는 거리(월드). 장이 없는 곳이라 곧게 온다. */
export const APPROACH_LENGTH = 1.2;
/** 자국을 남기는 시간 간격(초). 판 길이 / 속력 을 이것으로 나눈 수만큼 칸이 생긴다. */
export const STROBE_INTERVAL = 0.5;
/** 힘 qE → 화살표 길이 배율(월드 per 힘). 두 전하의 화살표가 같은 길이다. */
export const FORCE_SCALE = 3;
/** 전하 그림 반지름(월드). */
export const CHARGE_RADIUS = 0.13;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 들어오는 길(x = −1.2)부터 판 끝과 이름표까지, 위 판 부호부터
 * 아래 판과 캡션 띠까지 담는다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -1.9, maxX: 8.9, minY: -2.35, maxY: 1.9 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 가벼운 전하가 판 앞에서 달려 들어오는 동안. */
export const APPROACH = 0.6;
/** 판 사이를 지나는 동안. 진행도가 곧 비행 시각이라 이징을 걸지 않는다(linear). */
export const FLY = 4;
/** 판 끝에 닿은 전하가 사라지는 동안 · 남은 자국을 읽는 동안. */
export const LEAVE = 0.4;
export const HOLD = 1.4;
/** 무거운 전하가 달려 들어오는 동안 · 판 사이를 지나는 동안 · 사라지는 동안. */
export const HEAVY_APPROACH = 0.6;
export const HEAVY_FLY = 4;
export const HEAVY_LEAVE = 0.4;
/** 두 자국 줄을 견주는 동안. */
export const COMPARE = 2.4;
/** 다음 주기로 넘어가며 자국이 사라지는 동안. */
export const CLEAR = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chargeInUniformFieldMessages = Object.freeze({
  'label.title': {
    ko: '균일장 속 전하',
    en: 'A charge in a uniform field',
    ja: '一様な電場中の電荷',
    zh: '匀强电场中的电荷',
    ar: 'شحنة في مجال منتظم',
    es: 'Una carga en un campo uniforme',
    fr: 'Une charge dans un champ uniforme',
    hi: 'एकसमान क्षेत्र में एक आवेश',
    id: 'Muatan dalam medan homogen',
    pt: 'Uma carga em um campo uniforme',
  },
  'label.operation': {
    ko: '포물선 운동과의 대응',
    en: 'Just like a projectile',
    ja: '放物運動と同じ',
    zh: '就像抛体一样',
    ar: 'تمامًا مثل المقذوف',
    es: 'Igual que un proyectil',
    fr: 'Comme un projectile',
    hi: 'बिल्कुल एक प्रक्षेप्य की तरह',
    id: 'Persis seperti gerak parabola',
    pt: 'Igual a um projétil',
  },
  'label.stage': {
    ko: '판 사이로 들어온 두 전하',
    en: 'Two charges sent between the plates',
    ja: '極板の間に送り込む二つの電荷',
    zh: '射入两板之间的两个电荷',
    ar: 'شحنتان تُطلقان بين اللوحين',
    es: 'Dos cargas lanzadas entre las placas',
    fr: 'Deux charges lancées entre les armatures',
    hi: 'प्लेटों के बीच भेजे गए दो आवेश',
    id: 'Dua muatan dilepas di antara pelat',
    pt: 'Duas cargas lançadas entre as placas',
  },
  'label.view': {
    ko: '옆에서 본 판',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  /** 판 부호 · 힘 · 질량 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'mark.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'mark.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
  },
  'mark.force': {
    ko: 'qE',
    en: 'qE',
    ja: 'qE',
    zh: 'qE',
    ar: 'qE',
    es: 'qE',
    fr: 'qE',
    hi: 'qE',
    id: 'qE',
    pt: 'qE',
  },
  'mark.mass': {
    ko: 'm',
    en: 'm',
    ja: 'm',
    zh: 'm',
    ar: 'm',
    es: 'm',
    fr: 'm',
    hi: 'm',
    id: 'm',
    pt: 'm',
  },
  /** 질량 배수가 끼는 기호. 값은 `vars` 로 끼운다. */
  'mark.heavyMass': {
    ko: '{ratio}m',
    en: '{ratio}m',
    ja: '{ratio}m',
    zh: '{ratio}m',
    ar: '{ratio}m',
    es: '{ratio}m',
    fr: '{ratio}m',
    hi: '{ratio}m',
    id: '{ratio}m',
    pt: '{ratio}m',
  },
  'caption.approach': {
    ko: '양전하가 두 판과 나란하게 들어온다',
    en: 'A positive charge comes in parallel to the plates',
    ja: '正電荷が極板と平行に入ってくる',
    zh: '一个正电荷平行于两板射入',
    ar: 'تدخل شحنة موجبة موازيةً للوحين',
    es: 'Una carga positiva entra paralela a las placas',
    fr: 'Une charge positive entre parallèlement aux armatures',
    hi: 'एक धनावेश प्लेटों के समांतर प्रवेश करता है',
    id: 'Sebuah muatan positif masuk sejajar pelat',
    pt: 'Uma carga positiva entra paralela às placas',
  },
  'caption.fly': {
    ko: '판과 나란하게는 같은 걸음, − 판 쪽으로는 걸음마다 더 많이 — 던진 공처럼 포물선으로 휜다',
    en: 'Equal steps along the plates, a bigger drop toward the − plate at every step — it curves in a parabola, like a thrown ball',
    ja: '極板に沿っては同じ歩幅、− 極板の方へは一歩ごとに大きく落ちる — 投げたボールのように放物線を描いて曲がる',
    zh: '沿两板方向步子相同，朝 − 板方向每一步落得更多 — 像抛出的球一样沿抛物线弯曲',
    ar: 'خطوات متساوية على امتداد اللوحين، وهبوط أكبر نحو اللوح − في كل خطوة — فينحني في قطع مكافئ كالكرة المقذوفة',
    es: 'Pasos iguales a lo largo de las placas, una caída mayor hacia la placa − en cada paso — se curva en una parábola, como una pelota lanzada',
    fr: 'Des pas égaux le long des armatures, une chute plus grande vers l’armature − à chaque pas — elle s’incurve en parabole, comme une balle lancée',
    hi: 'प्लेटों के साथ-साथ बराबर कदम, − प्लेट की ओर हर कदम पर ज़्यादा गिरावट — यह फेंकी गई गेंद की तरह परवलय में मुड़ता है',
    id: 'Langkah sama panjang sejajar pelat, jatuh makin jauh ke arah pelat − di setiap langkah — lintasannya melengkung parabola, seperti bola yang dilempar',
    pt: 'Passos iguais ao longo das placas, uma queda maior em direção à placa − a cada passo — ela se curva em parábola, como uma bola lançada',
  },
  'caption.heavyApproach': {
    ko: '질량이 {ratio}배인 전하를 같은 속도로 들여보낸다',
    en: 'Now a charge with {ratio}× the mass goes in at the same speed',
    ja: '今度は質量が {ratio}× の電荷を同じ速さで入れる',
    zh: '现在让质量为 {ratio}× 的电荷以相同速率射入',
    ar: 'والآن تدخل شحنة كتلتها {ratio}× بالسرعة نفسها',
    es: 'Ahora entra a la misma rapidez una carga con {ratio}× la masa',
    fr: 'Cette fois, une charge de masse {ratio}× plus grande entre à la même vitesse',
    hi: 'अब {ratio}× द्रव्यमान वाला आवेश उसी चाल से भेजा जाता है',
    id: 'Kini muatan bermassa {ratio}× masuk dengan kelajuan yang sama',
    pt: 'Agora uma carga com {ratio}× a massa entra com a mesma velocidade',
  },
  'caption.heavyFly': {
    ko: '힘도 가로 걸음도 같은데, 칸마다 내려온 거리는 1/{ratio} 이다',
    en: 'Same force, same steps along the plates — but at every step it has dropped only 1/{ratio} as far',
    ja: '力も極板に沿った歩幅も同じ — だが一歩ごとに落ちた距離は1/{ratio}しかない',
    zh: '力相同，沿两板的步子也相同 — 但每一步落下的距离只有1/{ratio}',
    ar: 'القوة نفسها والخطوات نفسها على امتداد اللوحين — لكنها في كل خطوة لم تهبط إلا 1/{ratio} من المسافة',
    es: 'Misma fuerza, mismos pasos a lo largo de las placas — pero en cada paso ha caído solo 1/{ratio} de la distancia',
    fr: 'Même force, mêmes pas le long des armatures — mais à chaque pas elle n’est descendue que de 1/{ratio} de la distance',
    hi: 'वही बल, प्लेटों के साथ वही कदम — पर हर कदम पर यह केवल 1/{ratio} जितना ही गिरा है',
    id: 'Gaya sama, langkah sejajar pelat sama — tetapi di setiap langkah ia hanya turun 1/{ratio} kali jaraknya',
    pt: 'Mesma força, mesmos passos ao longo das placas — mas a cada passo ela caiu só 1/{ratio} da distância',
  },
} satisfies Record<string, LocalizedText>);

export type ChargeInUniformFieldMessageKey = keyof typeof chargeInUniformFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChargeInUniformFieldMessageKey): LocalizedText => chargeInUniformFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChargeInUniformFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chargeInUniformFieldSchema: BundleSchema = {
  id: CHARGE_IN_UNIFORM_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 전하가 날고 있고, 두 번째 전하가 이어서 난다.
  parameters: [],

  stages: [
    {
      id: 'two-charges',
      label: text('label.stage'),
      constants: {
        charge: CHARGE,
        mass: MASS,
        heavyMassRatio: HEAVY_MASS_RATIO,
        field: FIELD,
        speed: SPEED,
        gap: GAP,
        plateLength: PLATE_LENGTH,
        plateThickness: PLATE_THICKNESS,
        entryY: ENTRY_Y,
        approachLength: APPROACH_LENGTH,
        strobeInterval: STROBE_INTERVAL,
        forceScale: FORCE_SCALE,
        chargeRadius: CHARGE_RADIUS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 긴 판 한 쌍과 캡션 한 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 판 → 곧은 점선 길 → 포물선 → 내려온 거리 → 자국 → 전하 · 힘
   * 순으로 쌓아야 강조색 세로선이 곡선에 가려지지 않고 자국이 그 끝을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 가벼운 전하가 들어와 날고 사라짐 → 자국을 읽음 → 무거운 전하가 같은 길로
   * 들어와 날고 사라짐 → 두 줄을 견줌 → 지움. 비행 단계는 진행도가 곧 비행 시각이라
   * linear 다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'fly', duration: FLY, caption: key('caption.fly') },
      { id: 'leave', duration: LEAVE, ease: 'smooth', caption: key('caption.fly') },
      { id: 'hold', duration: HOLD, caption: key('caption.fly') },
      { id: 'heavyApproach', duration: HEAVY_APPROACH, caption: key('caption.heavyApproach') },
      { id: 'heavyFly', duration: HEAVY_FLY, caption: key('caption.heavyFly') },
      { id: 'heavyLeave', duration: HEAVY_LEAVE, ease: 'smooth', caption: key('caption.heavyFly') },
      { id: 'compare', duration: COMPARE, caption: key('caption.heavyFly') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.heavyFly') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 가벼운 전하가 판 사이 가운데쯤을 지나고 있고 자국
   * 여럿이 이미 찍혀 있다.
   */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 질량 배수는 스테이지 상수다 — state 가 그 글자를 들고 있다 (장부 G133).
    vars: { ratio: 'ratio' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 걸음이 같은지는 곧은 점선 위 눈금이, 내려온 거리는
   * 세로선끼리의 견줌이 말한다 — 거리 격자는 「몇인가」 라는 다른 질문을 끌어온다.
   */

  messages: chargeInUniformFieldMessages,
};
