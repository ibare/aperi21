// ========================================================================
// uniform-field — 선언
// ========================================================================
// 질문: 평행판 사이의 장은 어디서나 같은가.
//
// 전지에 이은 두 판(위 +, 아래 −) 사이에서 장선이 고른 간격으로 곧게 내려간다.
// 판 사이 여러 자리에 시험 전하를 놓으면 받는 힘 화살표가 **모두 같은 길이 · 같은
// 방향**이다. 전하들이 자리를 옮겨도 — 판 가까이든 가운데든 — 화살표는 그대로다.
// 한 전하가 판 가장자리 밖으로 나가면 그곳에서만 장선이 휘어 있고, 힘 화살표가
// 기울며 짧아진다(가장자리 효과). 판 안의 화살표를 점선으로 곁에 두어 견준다.
//
// 이웃과 겹치지 않는 자리 — `field-lines` 는 점전하 둘레의 선 다발과 알갱이 흐름,
// `electric-field` 는 점전하 둘레 자리마다의 화살표다. `charge-in-uniform-field` 는
// 이 장 속에서 전하가 포물선으로 휘는 운동, `parallel-plate-capacitor` 는 판이 담는
// 전하량(용량)이다. 이 조각은 **판 사이 자리를 옮겨도 힘이 같다** 는 것만 한다 —
// 전하를 놓아주지 않고, 판 위 전하량을 세지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:uniform-field` 와 문자 그대로 일치한다 (C4). */
export const UNIFORM_FIELD_ID = 'uniform-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 임의 길이(판 간격 d 가 2.4), 전압은 V 다.
// ------------------------------------------------------------------------

/** 두 판 사이 전압(V). 판 사이 장의 세기 E = V / d 를 정한다. */
export const VOLTAGE = 12;
/** 판 간격 d(월드). 판은 y = ±d/2 에 놓인다. */
export const GAP = 2.4;
/** 판 길이(월드). 간격의 세 배 넘게 길어야 가운데 쪽 넓은 곳이 고르다. */
export const PLATE_LENGTH = 7.5;
/** 판 두께(월드) — 그림의 두께다. 장 계산은 얇은 판으로 한다. */
export const PLATE_THICKNESS = 0.12;
/**
 * 장 세기 → 힘 화살표 길이 배율(월드 길이 per V/월드). 판 사이 가운데에서 화살표
 * 길이 = 배율 × V/d. 시험 전하는 단위 전하라 받는 힘이 곧 이 화살표다.
 * 상한을 두지 않는다 — 판 밖에서 짧아지는 비례가 주장이다.
 */
export const FORCE_SCALE = 0.16;
/** 장선 가닥 수 — + 판 안쪽 면에 고른 간격으로 심는다. */
export const LINE_COUNT = 13;
/**
 * 판 끝 바깥 면에서 심는 장선 수(한쪽 끝마다). 가장자리에서 밖으로 부풀었다가
 * − 판으로 돌아가는 선이다. 끝에서부터 `TIP_SEED_STEP` 간격으로 안쪽으로 심는다.
 */
export const TIP_SEEDS = 2;
export const TIP_SEED_STEP = 0.15;
/** 시험 전하 그림 반지름(월드). */
export const PROBE_RADIUS = 0.15;

/**
 * 시험 전하 넷의 처음 자리(place)와 옮긴 자리(move) — 모두 판 사이, 판 끝에서
 * 간격의 절반 넘게 안쪽이다. 화살표(길이 0.8)가 아래 판에 닿지 않도록 y 는 −0.3 위다.
 * 목록이 스테이지 상수로 흩어져 있다 (장부 G105).
 */
export const PROBE_START: readonly (readonly [number, number])[] = [
  [-2.4, 0.7],
  [-0.9, -0.2],
  [0.8, 0.9],
  [2.2, 0.15],
];
export const PROBE_MOVED: readonly (readonly [number, number])[] = [
  [-1.5, -0.25],
  [-0.2, 0.9],
  [1.2, 0],
  [2.6, 0.75],
];
/**
 * 가장자리 밖으로 나가는 전하(`PROBE_MOVED` 의 마지막)가 닿는 자리 — 오른쪽 판 끝
 * 바깥, 위 판 높이 가까이. 장선이 휘어 나간 곳이라 힘이 기울고 짧다.
 */
export const EXIT_POINT: readonly [number, number] = [4.6, 0.9];

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 판(±3.75)과 양 끝 밖의 휜 장선, 나간 전하를 담고, 아래에
 * 캡션 띠를 남긴다(캡션 자리가 프레이밍 여백으로 잡히지 않는다 — 장부 G24).
 * 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6, maxX: 6, minY: -2.45, maxY: 1.85 } as const;
/** 장선을 자르는 사각형 — 캡션 띠 위까지. */
export const FIELD_CLIP = { min: [-6, -1.85], max: [6, 1.85] } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이 (저작자가 바꿀 수 있는 기본값)
// ------------------------------------------------------------------------

/** 판과 장선만 있는 그림을 읽는 동안. */
export const PLATES_HOLD = 1.6;
/** 시험 전하 넷이 나타나는 동안 · 그 그림을 읽는 동안. */
export const PLACE = 0.8;
export const READ = 2.2;
/** 넷이 다른 자리로 옮겨 가는 동안 · 그 그림을 읽는 동안. */
export const MOVE = 1.8;
export const MOVED_HOLD = 1.8;
/** 한 전하가 가장자리 밖으로 나가는 동안 · 그 그림을 읽는 동안. */
export const EXIT = 1.8;
export const OUTSIDE_HOLD = 2.6;
/** 다음 주기로 넘어가며 전하들이 사라지는 동안. */
export const CLEAR = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const uniformFieldMessages = Object.freeze({
  'label.title': {
    ko: '균일한 전기장',
    en: 'Uniform electric field',
    ja: '一様な電場',
    zh: '匀强电场',
    ar: 'المجال الكهربائي المنتظم',
    es: 'Campo eléctrico uniforme',
    fr: 'Champ électrique uniforme',
    hi: 'एकसमान विद्युत क्षेत्र',
    id: 'Medan listrik homogen',
    pt: 'Campo elétrico uniforme',
  },
  'label.operation': {
    ko: '평행판 사이의 장',
    en: 'The field between parallel plates',
    ja: '平行板のあいだの電場',
    zh: '平行板之间的电场',
    ar: 'المجال بين لوحين متوازيين',
    es: 'El campo entre placas paralelas',
    fr: 'Le champ entre des plaques parallèles',
    hi: 'समांतर प्लेटों के बीच का क्षेत्र',
    id: 'Medan di antara pelat sejajar',
    pt: 'O campo entre placas paralelas',
  },
  'label.stage': {
    ko: '전지에 이은 두 판',
    en: 'Two plates on a battery',
    ja: '電池につないだ二枚の板',
    zh: '接在电池上的两块极板',
    ar: 'لوحان موصولان ببطارية',
    es: 'Dos placas conectadas a una batería',
    fr: 'Deux plaques reliées à une pile',
    hi: 'बैटरी से जुड़ी दो प्लेटें',
    id: 'Dua pelat yang terhubung ke baterai',
    pt: 'Duas placas ligadas a uma bateria',
  },
  'label.view': {
    ko: '옆에서 본 판',
    en: 'Side view',
    ja: '横から見た図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  /** 판 · 시험 전하 부호. 표식이라 번역하지 않는다 (C1 판정 3). */
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
  'caption.plates': {
    ko: '두 판 사이에서 장선이 고른 간격으로 곧게 내려간다',
    en: 'Between the two plates the field lines run straight down, evenly spaced',
    ja: '二枚の板のあいだで、電気力線が等しい間隔でまっすぐ下へ向かう',
    zh: '两极板之间，电场线以均匀的间距笔直向下',
    ar: 'بين اللوحين تمتد خطوط المجال مستقيمةً إلى الأسفل بتباعد متساوٍ',
    es: 'Entre las dos placas las líneas de campo bajan rectas, igualmente espaciadas',
    fr: 'Entre les deux plaques, les lignes de champ descendent tout droit, régulièrement espacées',
    hi: 'दोनों प्लेटों के बीच क्षेत्र रेखाएँ समान दूरी पर सीधी नीचे जाती हैं',
    id: 'Di antara kedua pelat, garis medan lurus ke bawah dengan jarak yang sama',
    pt: 'Entre as duas placas as linhas de campo descem retas, igualmente espaçadas',
  },
  'caption.place': {
    ko: '판 사이 여러 자리에 시험 전하를 놓으면, 힘 화살표가 모두 같은 길이 · 같은 방향이다',
    en: 'Place test charges at different spots between the plates — every force arrow has the same length and direction',
    ja: '板のあいだのいろいろな場所に試験電荷を置くと、力の矢印はどれも同じ長さ・同じ向きだ',
    zh: '在两极板之间的不同位置放上试探电荷 — 每个力的箭头长度相同、方向相同',
    ar: 'ضع شحنات اختبار في مواضع مختلفة بين اللوحين — لكل أسهم القوة الطول نفسه والاتجاه نفسه',
    es: 'Coloca cargas de prueba en distintos puntos entre las placas — todas las flechas de fuerza tienen la misma longitud y dirección',
    fr: 'Placez des charges d’essai à différents endroits entre les plaques — chaque flèche de force a la même longueur et la même direction',
    hi: 'प्लेटों के बीच अलग-अलग स्थानों पर परीक्षण आवेश रखें — हर बल-तीर की लंबाई और दिशा एक समान है',
    id: 'Letakkan muatan uji di berbagai titik di antara pelat — setiap panah gaya memiliki panjang dan arah yang sama',
    pt: 'Coloque cargas de prova em pontos diferentes entre as placas — toda seta de força tem o mesmo comprimento e a mesma direção',
  },
  'caption.move': {
    ko: '자리를 옮겨도 — 판 가까이든 가운데든 — 화살표는 그대로다',
    en: 'Move them around — near a plate or in the middle — and the arrows stay the same',
    ja: '場所を移しても — 板の近くでも真ん中でも — 矢印は変わらない',
    zh: '移动它们的位置 — 无论靠近极板还是在中间 — 箭头都不变',
    ar: 'حرّكها من مكانها — قرب أحد اللوحين أو في الوسط — وتبقى الأسهم كما هي',
    es: 'Muévelas — cerca de una placa o en el medio — y las flechas siguen iguales',
    fr: 'Déplacez-les — près d’une plaque ou au milieu — et les flèches restent les mêmes',
    hi: 'इन्हें इधर-उधर ले जाएँ — किसी प्लेट के पास या बीच में — तीर वैसे ही रहते हैं',
    id: 'Pindahkan muatan itu — dekat pelat atau di tengah — dan panahnya tetap sama',
    pt: 'Mova-as de lugar — perto de uma placa ou no meio — e as setas continuam iguais',
  },
  'caption.exit': {
    ko: '판 가장자리 밖으로 나가면 장선이 휘어 있고, 힘이 기울며 짧아진다',
    en: 'Past the edge of the plates the field lines bend, and the force tilts and shrinks',
    ja: '板の端より外に出ると電気力線が曲がっていて、力が傾き、短くなる',
    zh: '越过极板边缘，电场线发生弯曲，力也倾斜并变短',
    ar: 'خارج حافة اللوحين تنحني خطوط المجال، وتميل القوة وتقصر',
    es: 'Más allá del borde de las placas las líneas de campo se curvan, y la fuerza se inclina y se acorta',
    fr: 'Au-delà du bord des plaques, les lignes de champ se courbent, et la force s’incline et raccourcit',
    hi: 'प्लेटों के किनारे से बाहर क्षेत्र रेखाएँ मुड़ जाती हैं, और बल झुककर छोटा हो जाता है',
    id: 'Melewati tepi pelat, garis medan melengkung, dan gaya miring serta memendek',
    pt: 'Além da borda das placas as linhas de campo se curvam, e a força se inclina e encolhe',
  },
} satisfies Record<string, LocalizedText>);

export type UniformFieldMessageKey = keyof typeof uniformFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: UniformFieldMessageKey): LocalizedText => uniformFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: UniformFieldMessageKey): string {
  return k;
}

/** 전하 자리 목록을 스테이지 상수 이름으로 흩는다 — `start0x` · `start0y` … (장부 G105). */
function spotConstants(prefix: string, spots: readonly (readonly [number, number])[]): Record<string, number> {
  const out: Record<string, number> = {};
  spots.forEach(([x, y], i) => {
    out[`${prefix}${i}x`] = x;
    out[`${prefix}${i}y`] = y;
  });
  return out;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const uniformFieldSchema: BundleSchema = {
  id: UNIFORM_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 장선이 있고, 전하가 놓이고, 옮겨 가고, 하나가 밖으로 나간다.
  parameters: [],

  stages: [
    {
      id: 'two-plates',
      label: text('label.stage'),
      constants: {
        voltage: VOLTAGE,
        gap: GAP,
        plateLength: PLATE_LENGTH,
        plateThickness: PLATE_THICKNESS,
        forceScale: FORCE_SCALE,
        lineCount: LINE_COUNT,
        tipSeeds: TIP_SEEDS,
        tipSeedStep: TIP_SEED_STEP,
        probeRadius: PROBE_RADIUS,
        ...spotConstants('start', PROBE_START),
        ...spotConstants('moved', PROBE_MOVED),
        exitX: EXIT_POINT[0],
        exitY: EXIT_POINT[1],
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 긴 판 한 쌍과 캡션 한 줄. 세로를 더 주면 그림만 작아진다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 장선 → 판 → 판 안 화살표 점선(견줌) → 시험 전하 → 힘 화살표
   * 순으로 쌓아야 강조색 힘 화살표가 장선 · 판에 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 판과 장선 → 전하 넷을 놓음 → 옮김 → 하나가 밖으로 → 사라짐.
   * 움직이는 단계만 `smooth` 로 흘린다.
   */
  timeline: {
    phases: [
      { id: 'plates', duration: PLATES_HOLD, caption: key('caption.plates') },
      { id: 'place', duration: PLACE, ease: 'smooth', caption: key('caption.place') },
      { id: 'read', duration: READ, caption: key('caption.place') },
      { id: 'move', duration: MOVE, ease: 'smooth', caption: key('caption.move') },
      { id: 'moved', duration: MOVED_HOLD, caption: key('caption.move') },
      { id: 'exit', duration: EXIT, ease: 'smooth', caption: key('caption.exit') },
      { id: 'outside', duration: OUTSIDE_HOLD, caption: key('caption.exit') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.exit') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 장선은 첫 프레임부터 온전히 있고, 0.6 초 뒤
   * 시험 전하가 놓이기 시작한다.
   */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **화살표 길이의 견줌**이라
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: uniformFieldMessages,
};
