// ========================================================================
// angular-momentum — 선언
// ========================================================================
// 질문: 도는 팽이는 왜 쳐도 쓰러지지 않는가.
//
// 같은 팽이 셋이 끝점으로 서 있다 — 하나는 안 돌고, 하나는 천천히, 하나는 빠르게 돈다.
// 셋의 머리를 옆에서 **똑같이** 툭 친다. 안 도는 팽이는 그대로 쓰러지고, 천천히 도는
// 팽이는 크게 휘청이고, 빠르게 도는 팽이는 거의 기울지 않는다. 같은 충격이 더한
// 각운동량이 이미 가진 각운동량에 견주어 작을수록 축의 방향이 덜 바뀐다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:angular-momentum` 와 문자 그대로 일치한다 (C4). */
export const ANGULAR_MOMENTUM_ID = 'angular-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위는 팽이 하나를 기준으로 맞춘 약속이다 (길이: 팽이 높이 ≈ 1).
// ------------------------------------------------------------------------

/** 무게가 만드는 돌림힘의 크기 m·g·l — 축이 1 rad 기울 때가 아니라 수평일 때의 값. */
export const GRAVITY_TORQUE = 4.9;
/** 끝점을 지나고 축에 수직인 축에 대한 관성 모멘트. 세 팽이가 같다 — 같은 팽이다. */
export const INERTIA_PERP = 0.35;
/** 머리를 친 충격이 더하는 각운동량(충격량 × 끝점에서의 높이). 셋에게 같다. */
export const TAP_IMPULSE = 0.5;
/**
 * 제 축으로 도는 각운동량. 이 조각이 셋 사이에서 바꾸는 유일한 수다.
 * 느린 쪽은 서 있을 수 있는 경계(4·I⊥·mgl 의 제곱근 ≈ 2.62)를 조금 넘는다 — 휘청이되 선다.
 */
export const SPIN_STILL = 0;
export const SPIN_SLOW = 2.9;
export const SPIN_FAST = 14;

// ------------------------------------------------------------------------
// 팽이 모양 — 끝점 기준, 축 방향 높이(월드 단위)
// ------------------------------------------------------------------------

/** 원판이 놓인 높이와 반지름. 쓰러진 팽이는 원판 테가 바닥에 닿는 기울기에서 멈춘다. */
export const DISC_HEIGHT = 0.45;
export const DISC_RADIUS = 0.34;
/** 머리(친 자리)의 높이. 축 막대의 위 끝이다. */
export const CROWN_HEIGHT = 0.95;
/** 곧게 선 축을 보이는 기준선의 높이. 기울기를 이것에 견줘 읽는다. */
export const PLUMB_HEIGHT = 1.12;

// ------------------------------------------------------------------------
// 배치 — 월드. 세 팽이를 가로로 나란히 둔다.
// ------------------------------------------------------------------------

/** 세 팽이 끝점의 가로 자리. 쓰러진 팽이는 오른쪽으로 누워 약 0.7 을 차지한다. */
export const TOP_X: readonly [number, number, number] = [-2.3, 0, 2.3];
/**
 * 바닥 판의 앞 · 뒤 가장자리 높이(화면 세로, 월드). 비스듬히 내려다보므로 바닥은 선이
 * 아니라 판이다 — 누운 팽이의 원판 테처럼 앞쪽에 닿는 점은 끝점보다 아래에 보인다.
 */
export const FLOOR_FRONT_Y = -0.34;
export const FLOOR_BACK_Y = 0.3;
/** 이름표가 놓이는 높이(바닥 판 아래). */
export const LABEL_Y = -0.52;
/** 치는 화살표의 길이와, 다가올 때 머리에서 떨어져 출발하는 거리. */
export const TAP_ARROW_LEN = 0.62;
export const TAP_ARROW_GAP = 0.5;

/**
 * 고정 시점 — 옆으로 돌린 각과 내려다보는 각(rad). 도는 팽이는 치는 방향으로만
 * 기울지 않고 둘레를 돌며 휘청인다 — 안쪽으로 기운 몫이 세로 단축으로만 보이지 않게
 * 조금 비껴 본다. 치는 방향(+x)은 거의 화면 가로에 남고, 친 쪽으로 누운 팽이의 원판
 * 윗면이 보이도록 치는 방향 쪽에서 비껴 본다 — 반대로 비끼면 누운 원판이 선으로 보인다.
 */
export const YAW = 0.3;
export const ELEV = 0.45;

/** 프레이밍은 주장의 일부다. 매 프레임 같은 값이다. 아래 띠는 이름표와 캡션 자리다. */
export const SCENE_BOUNDS = { minX: -3.55, maxX: 3.05, minY: -0.95, maxY: 1.25 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 조각 시계(물리 시간)로 센다
// ------------------------------------------------------------------------

/** 세 팽이가 서서 도는 동안. */
export const SPIN_PHASE = 0.55;
/** 화살표가 다가와 머리에 닿는 동안 — 끝나는 순간 충격이 들어간다. */
export const TAP_PHASE = 0.25;
/** 충격 뒤 — 안 도는 팽이가 쓰러지고 느린 팽이가 두 번쯤 휘청이는 길이. */
export const RESPOND_PHASE = 1.7;
/** 결과를 읽는 동안. 도는 팽이는 계속 흔들린다 — 멈춘 그림이 아니다. */
export const HOLD_PHASE = 1.3;
export const FADE_PHASE = 0.25;
/** 전부를 약 세 배 느리게 흘린다 — 실시간 0.5 초 만에 쓰러지는 것은 눈으로 따라가기 짧다. */
export const SLOW_MOTION = 0.35;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const angularMomentumMessages = Object.freeze({
  'label.title': {
    ko: '각운동량',
    en: 'Angular momentum',
    ja: '角運動量',
    zh: '角动量',
    ar: 'الزخم الزاوي',
    es: 'Momento angular',
    fr: 'Moment cinétique',
    hi: 'कोणीय संवेग',
    id: 'Momentum sudut',
    pt: 'Momento angular',
  },
  'label.operation': {
    ko: '회전에서 운동량에 해당하는 양',
    en: 'The rotational counterpart of momentum',
    ja: '回転において運動量に相当する量',
    zh: '转动中与动量相对应的量',
    ar: 'المقدار المقابل للزخم في الدوران',
    es: 'El equivalente del momento lineal en la rotación',
    fr: 'L’équivalent de la quantité de mouvement pour la rotation',
    hi: 'घूर्णन में संवेग के समतुल्य राशि',
    id: 'Besaran rotasi yang setara dengan momentum',
    pt: 'O equivalente da quantidade de movimento na rotação',
  },
  'label.stage': {
    ko: '바닥 위 팽이 셋',
    en: 'Three tops on a floor',
    ja: '床の上の三つのコマ',
    zh: '地面上的三个陀螺',
    ar: 'ثلاثة خذاريف على أرضية',
    es: 'Tres trompos en el suelo',
    fr: 'Trois toupies sur un sol',
    hi: 'फ़र्श पर तीन लट्टू',
    id: 'Tiga gasing di lantai',
    pt: 'Três piões no chão',
  },
  'label.view': {
    ko: '비스듬히 내려다본 모습',
    en: 'Oblique view',
    ja: '斜めから見下ろした図',
    zh: '斜俯视图',
    ar: 'منظر مائل',
    es: 'Vista oblicua',
    fr: 'Vue oblique',
    hi: 'तिरछा दृश्य',
    id: 'Tampak miring',
    pt: 'Vista oblíqua',
  },
  'label.still': {
    ko: '안 돈다',
    en: 'not spinning',
    ja: '回っていない',
    zh: '不转',
    ar: 'لا يدور',
    es: 'sin girar',
    fr: 'immobile',
    hi: 'घूम नहीं रहा',
    id: 'tidak berputar',
    pt: 'parado',
  },
  'label.slow': {
    ko: '천천히 돈다',
    en: 'spinning slowly',
    ja: 'ゆっくり回る',
    zh: '慢慢转',
    ar: 'يدور ببطء',
    es: 'girando despacio',
    fr: 'tourne lentement',
    hi: 'धीरे घूम रहा',
    id: 'berputar pelan',
    pt: 'girando devagar',
  },
  'label.fast': {
    ko: '빠르게 돈다',
    en: 'spinning fast',
    ja: '速く回る',
    zh: '快速转',
    ar: 'يدور بسرعة',
    es: 'girando rápido',
    fr: 'tourne vite',
    hi: 'तेज़ घूम रहा',
    id: 'berputar cepat',
    pt: 'girando rápido',
  },
  'caption.spin': {
    ko: '같은 팽이 셋 — 하나는 안 돌고, 하나는 천천히, 하나는 빠르게 돈다',
    en: 'Three identical tops — one still, one spinning slowly, one spinning fast',
    ja: '同じコマが三つ — 一つは回らず、一つはゆっくり、一つは速く回る',
    zh: '三个相同的陀螺 — 一个不转，一个慢转，一个快转',
    ar: 'ثلاثة خذاريف متماثلة — واحد ساكن، وواحد يدور ببطء، وواحد يدور بسرعة',
    es: 'Tres trompos idénticos — uno quieto, uno girando despacio, uno girando rápido',
    fr: 'Trois toupies identiques — l’une immobile, l’une qui tourne lentement, l’une qui tourne vite',
    hi: 'तीन एक जैसे लट्टू — एक स्थिर, एक धीरे घूमता, एक तेज़ घूमता',
    id: 'Tiga gasing identik — satu diam, satu berputar pelan, satu berputar cepat',
    pt: 'Três piões idênticos — um parado, um girando devagar, um girando rápido',
  },
  'caption.tap': {
    ko: '셋의 머리를 옆에서 똑같이 툭 친다',
    en: 'Each one gets the same sideways tap on the head',
    ja: '三つとも頭を横から同じだけ軽くたたく',
    zh: '从侧面在每个陀螺的顶端轻敲同样一下',
    ar: 'يتلقى كل منها النقرة الجانبية نفسها على رأسه',
    es: 'Cada uno recibe el mismo golpecito lateral en la cabeza',
    fr: 'Chacune reçoit la même petite tape latérale sur la tête',
    hi: 'हर एक के सिर पर बगल से एक जैसी हल्की थपकी दी जाती है',
    id: 'Masing-masing mendapat ketukan samping yang sama di kepalanya',
    pt: 'Cada um recebe o mesmo toque lateral na cabeça',
  },
  'caption.respond': {
    ko: '안 도는 팽이는 쓰러지고, 천천히 도는 팽이는 크게 휘청인다 — 빠른 팽이는 거의 기울지 않는다',
    en: 'The still top falls over, the slow one sways wide — the fast one barely tilts',
    ja: '回っていないコマは倒れ、ゆっくりのコマは大きくふらつく — 速いコマはほとんど傾かない',
    zh: '不转的陀螺倒下，慢转的剧烈摇晃 — 快转的几乎不倾斜',
    ar: 'الخذروف الساكن يسقط، والبطيء يتمايل بشدة — أما السريع فبالكاد يميل',
    es: 'El trompo quieto se cae, el lento se tambalea mucho — el rápido apenas se inclina',
    fr: 'La toupie immobile tombe, la lente oscille largement — la rapide penche à peine',
    hi: 'स्थिर लट्टू गिर जाता है, धीमा वाला ज़ोर से डगमगाता है — तेज़ वाला मुश्किल से झुकता है',
    id: 'Gasing yang diam roboh, yang pelan bergoyang lebar — yang cepat nyaris tidak miring',
    pt: 'O pião parado cai, o lento balança muito — o rápido mal se inclina',
  },
  'caption.result': {
    ko: '많이 도는 팽이일수록 같은 충격에도 축이 덜 기운다',
    en: 'The more a top spins, the less the same tap tilts its axis',
    ja: 'よく回るコマほど、同じ衝撃でも軸は傾きにくい',
    zh: '陀螺转得越快，同样的轻敲让它的轴倾斜得越少',
    ar: 'كلما زاد دوران الخذروف، قلّ ميل محوره من النقرة نفسها',
    es: 'Cuanto más gira un trompo, menos inclina su eje el mismo golpecito',
    fr: 'Plus une toupie tourne, moins la même tape incline son axe',
    hi: 'लट्टू जितना अधिक घूमता है, उतनी ही वही थपकी उसकी अक्ष को कम झुकाती है',
    id: 'Makin kencang gasing berputar, makin sedikit ketukan yang sama memiringkan sumbunya',
    pt: 'Quanto mais um pião gira, menos o mesmo toque inclina seu eixo',
  },
} satisfies Record<string, LocalizedText>);

export type AngularMomentumMessageKey = keyof typeof angularMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AngularMomentumMessageKey): LocalizedText => angularMomentumMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AngularMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const angularMomentumSchema: BundleSchema = {
  id: ANGULAR_MOMENTUM_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 셋이 돌고 있고, 곧 같은 충격을 받는다.
  parameters: [],

  stages: [
    {
      id: 'three-tops',
      label: text('label.stage'),
      constants: {
        gravityTorque: GRAVITY_TORQUE,
        inertiaPerp: INERTIA_PERP,
        tapImpulse: TAP_IMPULSE,
        spinStill: SPIN_STILL,
        spinSlow: SPIN_SLOW,
        spinFast: SPIN_FAST,
      },
    },
  ],

  environments: [],

  views: [{ id: 'oblique', label: text('label.view'), default: true }],

  /** 가로로 셋을 늘어놓은 그림이라 세로는 팽이 하나 높이와 이름표 · 캡션 줄이면 된다. */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다 — 원판 윗면이 보이는지 아랫면이 보이는지에 따라 몸통과 원판의
   * 순서가 바뀐다. 층 순서로는 이것을 가를 수 없어 scene 이 순서를 정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 서서 돎 → 화살표가 다가와 침 → 충격 뒤 → 결과 → 흐려짐.
   * 충격은 `tap` 이 끝나는 순간 들어간다 — 물리가 `end('tap')` 을 묻는다.
   */
  timeline: {
    phases: [
      { id: 'spin', duration: SPIN_PHASE, timeScale: SLOW_MOTION, caption: key('caption.spin') },
      { id: 'tap', duration: TAP_PHASE, timeScale: SLOW_MOTION, caption: key('caption.tap') },
      {
        id: 'respond',
        duration: RESPOND_PHASE,
        timeScale: SLOW_MOTION,
        caption: key('caption.respond'),
      },
      { id: 'hold', duration: HOLD_PHASE, timeScale: SLOW_MOTION, caption: key('caption.result') },
      { id: 'fade', duration: FADE_PHASE, timeScale: SLOW_MOTION, caption: key('caption.result') },
    ],
  },

  /** 도착한 순간 셋이 이미 돌고 있다. 0 이어도 돌지만 곧바로 치기 직전이 되도록 당긴다. */
  startAt: 0.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 곧게 선 기준선에서 벗어난 정도다.

  messages: angularMomentumMessages,
};
