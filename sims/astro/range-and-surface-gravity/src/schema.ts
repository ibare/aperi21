// ========================================================================
// range-and-surface-gravity — 선언
// ========================================================================
// 질문: 같은 힘으로 같은 각도로 던졌는데, 왜 달에서는 훨씬 멀리 가는가.
//
// 두 레인이 위아래로 놓인다. 위는 지구, 아래는 달. 발사 화살표가 둘 다 같은
// 각도 · 같은 길이다 — **다른 것은 표면 중력 하나뿐이다.** 두 공은 같은 순간
// 떠나 같은 가로 속력으로 나아가고, 땅 위에는 지금까지 나아간 가로 거리가 띠로
// 자란다. 지구의 공은 첫 칸에서 띠가 멈추고, 달의 공은 계속 날며 띠를 여섯 칸
// 너머까지 끌고 간다. 한 칸은 지구에서의 사거리 R 이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:range-and-surface-gravity` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const RANGE_AND_SURFACE_GRAVITY_ID = 'range-and-surface-gravity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 발사 속력(m/s). 두 레인이 같다 — 같은 발사라는 것이 주장의 전제다. */
export const V0 = 5;
/** 발사각(°). 두 레인이 같다. 45° 와 보각의 이야기는 이웃 `projectile-range` 의 몫이라 비껴 잡았다. */
export const ANGLE_DEG = 50;
/** 지구의 표면 중력(m/s²). */
export const G_EARTH = 9.8;
/** 달의 표면 중력(m/s²). 지구의 약 1/6 — 이 조각이 바꾸는 유일한 수다. */
export const G_MOON = 1.62;
/**
 * 눈금 칸 수. 한 칸은 지구에서의 사거리 R 이고, 달의 공은 이 칸 수를 지나 떨어진다.
 * 바꾸면 `CELL_LABELS` 의 이름표 수도 함께 바꿔야 한다.
 */
export const CELL_COUNT = 6;
/** 발사 속력 → 화살표 길이 배율(m per m/s). 표시 배율도 선언이다 (원칙 2). */
export const ARROW_SCALE = 0.26;

/** 발사각(라디안). */
export const ANGLE_RAD = (ANGLE_DEG * Math.PI) / 180;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 두 레인을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 아래 레인(달)의 땅 높이. 발사점은 두 레인 모두 x = 0 이다. */
export const LANE_MOON_Y = 0;
/**
 * 위 레인(지구)의 땅 높이. 달의 공이 솟는 높이(약 4.53 m)보다 위에 둔다 —
 * 아래 레인의 포물선이 위 레인의 땅을 뚫으면 두 하늘이 한 하늘로 읽힌다.
 */
export const LANE_EARTH_Y = 5.35;

/** 공의 반지름(m). 두 공이 같다 — 같은 공이라는 것이 전제다. */
export const BALL_R = 0.18;
/** 나아간 가로 거리를 보이는 땅 위 띠의 두께(m). */
export const REACH_THICKNESS = 0.11;
/** 발사각을 보이는 부채꼴의 반지름(m). */
export const ANGLE_R = 0.62;

/** 눈금선의 아래 끝(월드 y). 위 끝은 위 레인의 땅이라 두 레인이 한 자로 꿰인다. */
export const TICK_BOTTOM_Y = -0.34;
/** 눈금 이름표가 놓이는 높이. */
export const TICK_LABEL_Y = -0.68;

/**
 * 레인 이름 · g 값이 놓이는 자리 — 발사점 왼쪽, 땅 바로 위. 발사 화살표의 이름표
 * (`v₀`)가 발사점 왼쪽 위에 붙으므로 그것과 글자가 붙지 않을 만큼 떼어 놓는다.
 */
export const LANE_LABEL_X = -0.55;
export const LANE_NAME_DY = 0.68;
export const LANE_G_DY = 0.26;

/**
 * 프레이밍은 주장의 일부다. 가로는 레인 이름 자리부터 달의 착지점 너머까지,
 * 세로는 눈금 이름표 아래(캡션 자리를 포함해) 지구 레인의 발사 화살표 위까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.9, maxX: 16.2, minY: -1.75, maxY: 6.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 체공 시간(초) = 2 v₀ sinθ / g. 달 쪽이 여섯 배 오래 떠 있다. */
export const FLIGHT_EARTH = (2 * V0 * Math.sin(ANGLE_RAD)) / G_EARTH;
export const FLIGHT_MOON = (2 * V0 * Math.sin(ANGLE_RAD)) / G_MOON;

/** 둘 다 나는 동안 — 지구의 공이 떨어지는 순간 끝난다. */
export const FLY_BOTH = FLIGHT_EARTH;
/** 달의 공만 나는 동안. */
export const FLY_MOON_ONLY = FLIGHT_MOON - FLIGHT_EARTH;
/** 떨어진 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rangeAndSurfaceGravityMessages = Object.freeze({
  'label.title': {
    ko: '중력과 사거리',
    en: 'Gravity and range',
    ja: '重力と水平到達距離',
    zh: '重力与射程',
    ar: 'الجاذبية والمدى',
    es: 'Gravedad y alcance',
    fr: 'Gravité et portée',
    hi: 'गुरुत्व और परास',
    id: 'Gravitasi dan jangkauan',
    pt: 'Gravidade e alcance',
  },
  'label.operation': {
    ko: '같은 발사, 다른 중력',
    en: 'Same launch, different gravity',
    ja: '同じ発射、違う重力',
    zh: '相同的发射，不同的重力',
    ar: 'الإطلاق نفسه، وجاذبية مختلفة',
    es: 'Mismo lanzamiento, distinta gravedad',
    fr: 'Même lancer, gravité différente',
    hi: 'एक जैसा प्रक्षेपण, अलग गुरुत्व',
    id: 'Peluncuran sama, gravitasi berbeda',
    pt: 'Mesmo lançamento, gravidade diferente',
  },
  'label.stage': {
    ko: '지구와 달',
    en: 'Earth and Moon',
    ja: '地球と月',
    zh: '地球与月球',
    ar: 'الأرض والقمر',
    es: 'La Tierra y la Luna',
    fr: 'La Terre et la Lune',
    hi: 'पृथ्वी और चंद्रमा',
    id: 'Bumi dan Bulan',
    pt: 'A Terra e a Lua',
  },
  'label.view': {
    ko: '두 레인',
    en: 'Two lanes',
    ja: '2本のレーン',
    zh: '两条跑道',
    ar: 'مساران',
    es: 'Dos carriles',
    fr: 'Deux couloirs',
    hi: 'दो लेन',
    id: 'Dua lajur',
    pt: 'Duas faixas',
  },
  /** 레인 이름. 어순 · 조사가 언어마다 다른 낱말이라 문안이다 (C1 판정 4). */
  'label.earth': {
    ko: '지구',
    en: 'Earth',
    ja: '地球',
    zh: '地球',
    ar: 'الأرض',
    es: 'Tierra',
    fr: 'Terre',
    hi: 'पृथ्वी',
    id: 'Bumi',
    pt: 'Terra',
  },
  'label.moon': {
    ko: '달',
    en: 'Moon',
    ja: '月',
    zh: '月球',
    ar: 'القمر',
    es: 'Luna',
    fr: 'Lune',
    hi: 'चंद्रमा',
    id: 'Bulan',
    pt: 'Lua',
  },
  /** 값이 끼는 조립문이라 문안이다. 값은 스테이지 상수에서 그대로 온다 (C1 · S-piece 유효숫자). */
  'label.gValue': {
    ko: 'g = {g} m/s²',
    en: 'g = {g} m/s²',
    ja: 'g = {g} m/s²',
    zh: 'g = {g} m/s²',
    ar: 'g = {g} m/s²',
    es: 'g = {g} m/s²',
    fr: 'g = {g} m/s²',
    hi: 'g = {g} m/s²',
    id: 'g = {g} m/s²',
    pt: 'g = {g} m/s²',
  },
  /** 발사 화살표에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.v0': {
    ko: 'v₀',
    en: 'v₀',
    ja: 'v₀',
    zh: 'v₀',
    ar: 'v₀',
    es: 'v₀',
    fr: 'v₀',
    hi: 'v₀',
    id: 'v₀',
    pt: 'v₀',
  },
  /** 눈금 이름표. R 은 지구에서의 사거리다. 표식이다. */
  'label.cell1': {
    ko: 'R',
    en: 'R',
    ja: 'R',
    zh: 'R',
    ar: 'R',
    es: 'R',
    fr: 'R',
    hi: 'R',
    id: 'R',
    pt: 'R',
  },
  'label.cell2': {
    ko: '2R',
    en: '2R',
    ja: '2R',
    zh: '2R',
    ar: '2R',
    es: '2R',
    fr: '2R',
    hi: '2R',
    id: '2R',
    pt: '2R',
  },
  'label.cell3': {
    ko: '3R',
    en: '3R',
    ja: '3R',
    zh: '3R',
    ar: '3R',
    es: '3R',
    fr: '3R',
    hi: '3R',
    id: '3R',
    pt: '3R',
  },
  'label.cell4': {
    ko: '4R',
    en: '4R',
    ja: '4R',
    zh: '4R',
    ar: '4R',
    es: '4R',
    fr: '4R',
    hi: '4R',
    id: '4R',
    pt: '4R',
  },
  'label.cell5': {
    ko: '5R',
    en: '5R',
    ja: '5R',
    zh: '5R',
    ar: '5R',
    es: '5R',
    fr: '5R',
    hi: '5R',
    id: '5R',
    pt: '5R',
  },
  'label.cell6': {
    ko: '6R',
    en: '6R',
    ja: '6R',
    zh: '6R',
    ar: '6R',
    es: '6R',
    fr: '6R',
    hi: '6R',
    id: '6R',
    pt: '6R',
  },
  'caption.launch': {
    ko: '같은 각도, 같은 속력으로 두 공이 함께 떠난다 — 위는 지구, 아래는 달',
    en: 'Both balls leave together at the same angle and speed — Earth above, Moon below',
    ja: '2つのボールが同じ角度・同じ速さでいっしょに飛び出す — 上は地球、下は月',
    zh: '两个球以相同的角度和速率一起出发 — 上面是地球，下面是月球',
    ar: 'تنطلق الكرتان معًا بالزاوية نفسها والسرعة نفسها — الأرض في الأعلى، والقمر في الأسفل',
    es: 'Las dos bolas salen juntas con el mismo ángulo y la misma velocidad — arriba la Tierra, abajo la Luna',
    fr: 'Les deux balles partent ensemble, même angle, même vitesse — la Terre en haut, la Lune en bas',
    hi: 'दोनों गेंदें एक ही कोण और एक ही चाल से साथ-साथ निकलती हैं — ऊपर पृथ्वी, नीचे चंद्रमा',
    id: 'Kedua bola berangkat bersamaan dengan sudut dan kelajuan yang sama — Bumi di atas, Bulan di bawah',
    pt: 'As duas bolas partem juntas com o mesmo ângulo e a mesma velocidade — a Terra em cima, a Lua embaixo',
  },
  'caption.earthDown': {
    ko: '지구의 공은 첫 칸에 떨어졌다 — 달의 공은 아직 떠 있고 띠는 계속 자란다',
    en: 'The Earth ball has landed in the first cell — the Moon ball is still up, and its band keeps growing',
    ja: '地球のボールは最初のマスに落ちた — 月のボールはまだ空中にあり、帯は伸び続ける',
    zh: '地球的球落在了第一格 — 月球的球还在空中，它的色带继续变长',
    ar: 'هبطت كرة الأرض في الخانة الأولى — أما كرة القمر فما زالت في الهواء، وشريطها يواصل النمو',
    es: 'La bola de la Tierra ha caído en la primera casilla — la de la Luna sigue en el aire y su franja sigue creciendo',
    fr: 'La balle de la Terre est retombée dans la première case — celle de la Lune est encore en l’air, et sa bande continue de grandir',
    hi: 'पृथ्वी की गेंद पहले खाने में गिर चुकी है — चंद्रमा की गेंद अभी भी हवा में है, और उसकी पट्टी बढ़ती जा रही है',
    id: 'Bola Bumi sudah mendarat di petak pertama — bola Bulan masih melayang, dan pitanya terus memanjang',
    pt: 'A bola da Terra caiu na primeira casa — a da Lua ainda está no ar, e sua faixa continua crescendo',
  },
  'caption.result': {
    ko: '달의 공은 눈금 {cells} 칸을 지나 떨어졌다 — 가로로 나아간 속력은 둘이 같았다',
    en: 'The Moon ball landed past {cells} cells — both moved sideways at the same speed',
    ja: '月のボールは目盛り {cells} マスを越えて落ちた — 横に進む速さは2つとも同じだった',
    zh: '月球的球越过 {cells} 格才落下 — 两个球水平前进的速率相同',
    ar: 'هبطت كرة القمر بعد {cells} خانات — وكانت سرعة التقدم الأفقي واحدة للكرتين',
    es: 'La bola de la Luna cayó pasadas {cells} casillas — las dos avanzaron en horizontal a la misma velocidad',
    fr: 'La balle de la Lune est retombée au-delà de {cells} cases — les deux avançaient à l’horizontale à la même vitesse',
    hi: 'चंद्रमा की गेंद {cells} खानों के पार जाकर गिरी — दोनों की क्षैतिज चाल एक समान थी',
    id: 'Bola Bulan mendarat melewati {cells} petak — keduanya bergerak mendatar dengan kelajuan yang sama',
    pt: 'A bola da Lua caiu depois de {cells} casas — as duas avançaram na horizontal com a mesma velocidade',
  },
} satisfies Record<string, LocalizedText>);

export type RangeAndSurfaceGravityMessageKey = keyof typeof rangeAndSurfaceGravityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RangeAndSurfaceGravityMessageKey): LocalizedText =>
  rangeAndSurfaceGravityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RangeAndSurfaceGravityMessageKey): string {
  return k;
}

/** 눈금 칸마다의 이름표 키. 칸 수(`CELL_COUNT`)가 바뀌면 여기도 함께 바꾼다. */
export const CELL_LABELS: readonly RangeAndSurfaceGravityMessageKey[] = [
  'label.cell1',
  'label.cell2',
  'label.cell3',
  'label.cell4',
  'label.cell5',
  'label.cell6',
];

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rangeAndSurfaceGravitySchema: BundleSchema = {
  id: RANGE_AND_SURFACE_GRAVITY_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 공이 이미 날고 있고, 떨어지고, 다시 떠난다.
  parameters: [],

  stages: [
    {
      id: 'earth-and-moon',
      label: text('label.stage'),
      constants: {
        v0: V0,
        angleDeg: ANGLE_DEG,
        gEarth: G_EARTH,
        gMoon: G_MOON,
        cells: CELL_COUNT,
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /**
   * 가로 18 m 를 담아야 하고 세로는 두 레인과 눈금 이름표 · 캡션 줄뿐이다. 세로를
   * 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 눈금선은 두 땅과 띠 **아래**로 지나가야 자로 읽히고,
   * 나아간 띠는 땅 위 · 공 아래에 깔려야 공이 끌고 온 것으로 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 둘 다 낢 → 달의 공만 낢 → 떨어진 그림 → 흐려짐.
   *
   * 단계 길이를 물리에서 끌어온다. 지구의 공이 떨어지는 순간(2v₀sinθ/g)이 곧
   * `fly-both` 의 끝이라서, 「지구의 공은 떨어졌다」 는 캡션이 화면과 어긋날 수 없다.
   * 두 낢 단계의 재생 속도가 같아야 달의 공이 중간에 갑자기 빨라지지 않는다.
   */
  timeline: {
    phases: [
      { id: 'fly-both', duration: FLY_BOTH, caption: key('caption.launch') },
      { id: 'fly-moon', duration: FLY_MOON_ONLY, caption: key('caption.earthDown') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 지구의 공이 꼭대기를 넘어 내려오고 달의 공은
   * 아직 오르는 자리에서 연다. 0 이면 두 공이 발사대에 붙어 있어 빈 땅이 먼저 보인다.
   */
  startAt: 0.45,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 까닭은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 780,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { cells: 'cells' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **칸 수**라,
   * 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 칸은 눈금선으로
   * 직접 긋는다 — 지구에서의 사거리 R 한 칸이 이 그림의 자다.
   */

  messages: rangeAndSurfaceGravityMessages,
};
