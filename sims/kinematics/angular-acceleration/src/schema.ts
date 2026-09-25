// ========================================================================
// angular-acceleration — 선언
// ========================================================================
// 질문: "각속도가 커진다" 는 것이 화면에서는 무엇으로 보이는가.
//
// 0.5 초마다 바퀴 테두리에 눈금을 하나씩 찍는다. 눈금은 각도자가 아니라 **시계**다 —
// 눈금 사이의 거리가 그 0.5 초 동안 바퀴가 돈 각이고, 그 사이가 갈수록 벌어진다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:angular-acceleration` 와 문자 그대로 일치한다 (C4). */
export const ANGULAR_ACCELERATION_ID = 'angular-acceleration';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 캔버스 100 px. 바퀴 중심이 원점, y 는 위.
// ------------------------------------------------------------------------

/** 바퀴 테두리 반지름. 원본 R = 108 px. */
export const RADIUS = 1.08;
/** 눈금 한가운데의 반지름. 원본은 R−8 에서 R+10 까지라 가운데가 R+1 이다. */
export const TICK_MID_RADIUS = 1.09;
/** 눈금 길이. 원본 18 px(R−8 → R+10). */
export const TICK_LENGTH = 0.18;
/** 회전축 점. 원본 3.5 px. */
export const HUB_RADIUS = 0.035;
/** 바퀴살 끝점. 원본 5 px. */
export const SPOKE_TIP_RADIUS = 0.05;

/** 눈금 획 굵기(화면 px). 원본 2. */
export const TICK_WIDTH_PX = 2;
/** 바퀴살 굵기(화면 px). 원본 2.5. */
export const SPOKE_WIDTH_PX = 2.5;
/** 부채꼴이 테두리 위에 덧긋는 호의 굵기(화면 px). 원본 5. */
export const SECTOR_RIM_PX = 5;
/** 부채꼴 채움의 옅음. 원본 알파 0.22. */
export const SECTOR_FILL_OPACITY = 0.22;
/**
 * 테두리·회전축의 옅음. 원본은 배경에 가까운 #ded7c9 라, `muted`·`subtle` 로도
 * 한 번 더 흐려야 같은 무게가 된다.
 */
export const RIM_OPACITY = 0.6;

/**
 * 프레이밍 — 눈금 바깥 끝(R+10 = 1.18)까지가 전부다. 정사각이라 낮은 캔버스에서는
 * 세로가 제약이 된다.
 */
export const SCENE_BOUNDS = { minX: -1.18, maxX: 1.18, minY: -1.18, maxY: 1.18 } as const;

// ------------------------------------------------------------------------
// 시간 — 원본 index.html 의 상수를 그대로 옮긴다.
// ------------------------------------------------------------------------

/** 눈금을 찍는 시간 간격(초). 원본 STAMP. **조작기로 열지 않는다** — 간격을 바꾸면
 *  "같은 시간인데" 라는 전제가 흔들린다. */
export const STAMP = 0.5;
/** 기록이 나타나는 시간(초). 원본 `fadeIn = min(1, tau / 0.35)`. */
export const APPEAR = 0.35;
/** 나머지 기록 구간(초). 원본 RUN 8.0 에서 `APPEAR` 를 뺀 값이다. */
export const RECORD = 7.65;
/** 기록이 흐려져 지워지는 시간(초). 원본 FADE. */
export const ERASE = 0.7;
/** 다음 주기까지 비워 두는 시간(초). 원본 CYCLE 9.2 − RUN 8.0 − FADE 0.7. */
export const BLANK = 0.5;

// ------------------------------------------------------------------------
// 조작기의 값
// ------------------------------------------------------------------------

/** 시작 각속도 ω₀ (rad/s). */
export const OMEGA0_DEFAULT = 0.1;
export const OMEGA0_RANGE: [number, number] = [0, 0.25];
/** 각가속도 α (rad/s²). 0 으로 내리면 눈금 간격이 완전히 고르게 된다. */
export const ALPHA_DEFAULT = 0.1;
export const ALPHA_RANGE: [number, number] = [0, 0.11];

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const angularAccelerationMessages = Object.freeze({
  'label.title': {
    ko: '각가속도',
    en: 'Angular acceleration',
    ja: '角加速度',
    zh: '角加速度',
    ar: 'التسارع الزاوي',
    es: 'Aceleración angular',
    fr: 'Accélération angulaire',
    hi: 'कोणीय त्वरण',
    id: 'Percepatan sudut',
    pt: 'Aceleração angular',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '각속도의 변화율',
    en: 'The rate of change of angular velocity',
    ja: '角速度の変化率',
    zh: '角速度的变化率',
    ar: 'معدل تغيّر السرعة الزاوية',
    es: 'La tasa de cambio de la velocidad angular',
    fr: 'Le taux de variation de la vitesse angulaire',
    hi: 'कोणीय वेग के परिवर्तन की दर',
    id: 'Laju perubahan kecepatan sudut',
    pt: 'A taxa de variação da velocidade angular',
  },
  'label.stage': {
    ko: '도는 바퀴',
    en: 'A turning wheel',
    ja: '回る車輪',
    zh: '转动的轮子',
    ar: 'عجلة تدور',
    es: 'Una rueda que gira',
    fr: 'Une roue qui tourne',
    hi: 'घूमता पहिया',
    id: 'Roda yang berputar',
    pt: 'Uma roda girando',
  },
  'label.view': {
    ko: '0.5초 눈금',
    en: 'Half-second marks',
    ja: '0.5秒ごとの目盛り',
    zh: '每0.5秒的刻痕',
    ar: 'علامات كل نصف ثانية',
    es: 'Marcas cada medio segundo',
    fr: 'Repères toutes les demi-secondes',
    hi: 'आधे-आधे सेकंड के निशान',
    id: 'Tanda tiap setengah detik',
    pt: 'Marcas a cada meio segundo',
  },
  /** 화면에 뜨는 문장은 이 하나뿐이다. 숫자는 한 개도 두지 않는다. */
  'caption.main': {
    ko: '0.5초마다 테두리에 눈금 하나 — 같은 0.5초인데 눈금 사이가 갈수록 벌어진다',
    en: 'One mark on the rim every half-second — the same half-second, yet the gaps keep widening',
    ja: '0.5秒ごとに縁に目盛りを一つ — 同じ0.5秒なのに、目盛りの間隔はどんどん広がる',
    zh: '每0.5秒在轮缘上刻一道 — 同样是0.5秒，刻痕之间的间隔却越来越大',
    ar: 'علامة واحدة على الإطار كل نصف ثانية — نصف الثانية نفسه، ومع ذلك تتسع الفجوات باستمرار',
    es: 'Una marca en el borde cada medio segundo — el mismo medio segundo, y sin embargo los huecos no dejan de ensancharse',
    fr: 'Un repère sur la jante toutes les demi-secondes — la même demi-seconde, et pourtant les écarts ne cessent de s’élargir',
    hi: 'हर आधे सेकंड पर किनारे पर एक निशान — वही आधा सेकंड, फिर भी निशानों के बीच की दूरी बढ़ती ही जाती है',
    id: 'Satu tanda di tepi roda tiap setengah detik — setengah detik yang sama, tetapi celahnya terus melebar',
    pt: 'Uma marca na borda a cada meio segundo — o mesmo meio segundo, mas os intervalos não param de aumentar',
  },
  'control.omega0': {
    ko: '시작 각속도 ω₀',
    en: 'Initial angular speed ω₀',
    ja: '初めの角速度 ω₀',
    zh: '初始角速度 ω₀',
    ar: 'السرعة الزاوية الابتدائية ω₀',
    es: 'Rapidez angular inicial ω₀',
    fr: 'Vitesse angulaire initiale ω₀',
    hi: 'प्रारंभिक कोणीय चाल ω₀',
    id: 'Kelajuan sudut awal ω₀',
    pt: 'Velocidade angular inicial ω₀',
  },
  'control.alpha': {
    ko: '각가속도 α',
    en: 'Angular acceleration α',
    ja: '角加速度 α',
    zh: '角加速度 α',
    ar: 'التسارع الزاوي α',
    es: 'Aceleración angular α',
    fr: 'Accélération angulaire α',
    hi: 'कोणीय त्वरण α',
    id: 'Percepatan sudut α',
    pt: 'Aceleração angular α',
  },
} satisfies Record<string, LocalizedText>);

export type AngularAccelerationMessageKey = keyof typeof angularAccelerationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: AngularAccelerationMessageKey): LocalizedText {
  return angularAccelerationMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AngularAccelerationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const angularAccelerationSchema: BundleSchema = {
  id: ANGULAR_ACCELERATION_ID,
  label: text('label.title'),
  category: 'kinematics',
  description: text('label.description'),
  timeModel: 'periodic',

  /**
   * ω₀ · α 는 파라미터가 아니라 **상태**에 둔다. 슬라이더가 잡는 순간부터 그 값이
   * 화면 전체(이미 찍힌 과거 눈금까지)를 다시 잡으므로, 조각이 읽는 자리가 하나여야
   * 한다 — 조작기는 `binds.value` 로 상태 경로를 곧바로 가리킨다.
   */
  parameters: [],

  stages: [{ id: 'wheel', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'marks', label: text('label.view'), default: true }],

  /**
   * 원본은 캔버스 280 px 아래에 캡션 한 줄과 슬라이더 한 줄을 따로 놓았다. 엔진은
   * 셋이 한 캔버스에 얹히므로 그 두 줄만큼(약 68 px) 아래를 비운다.
   *
   * 340 = 위 여백 36 + 바퀴 236(반지름 118 px × 2) + 아래 여백 68. 이 높이에서
   * 배율이 원본과 같은 100 px/단위가 된다.
   */
  canvas: { height: 340, minHeight: 320 },

  /**
   * 바퀴를 화면 가운데에서 16 px 올린다. 아래 띠를 캡션과 슬라이더에 내주면서도
   * 원본의 배율을 지키려면 원점이 가운데보다 위여야 한다.
   */
  camera: { screenYBias: -16 },

  // 겹침이 이 그림의 판정 장치다 — 테두리 위로 눈금이 지나가야 눈금이 「테두리를 가로지르는
  // 시간 기록」 으로 읽힌다. 테두리가 `surface` 원호(구조물 층 10)라 기본 층 순서
  // (테두리 < 부채꼴 18 < 눈금 19 < 바퀴살 20)만으로 성립한다 — `drawOrder: 'scene'` 은 두지 않는다.

  /**
   * 도착한 순간 이미 진행 중 — 원본 PHASE. 눈금 열한 개(0~10번)가 찍혀 있고 붉은
   * 부채꼴이 열한 번째 0.5 초를 절반 넘게 채운 자리다. 빈 바퀴가 채워지길 기다리게
   * 하지 않는다.
   */
  startAt: 5.3,

  /**
   * 한 주기 9.2 초 — 기록이 나타나고(appear), 8 초까지 눈금을 찍고(record),
   * 0.7 초에 걸쳐 흐려져 지워지고(erase), 0.5 초 비운다(blank).
   *
   * `appear` + `record` = 8.0 이 원본 RUN 이다. 기록이 멈추는 시각을 조각이 상수로
   * 들고 있지 않도록 `end('record')` 로 읽는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.main') },
      { id: 'record', duration: RECORD, caption: key('caption.main') },
      { id: 'erase', duration: ERASE, caption: key('caption.main') },
      { id: 'blank', duration: BLANK, caption: key('caption.main') },
    ],
  },

  /**
   * 슬롯 하나. 문장이 주기 내내 같아 페이드하지 않는다 — 원본도 캡션을 바꾸지 않는다.
   * 원본의 캡션은 본문 먹색(`--ink`)이라 기본값(`muted`)을 덮는다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -46] },
    fontSize: 14,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). **각도 눈금자는 특히 두면 안 된다** —
   * 테두리 위의 눈금이 각도 표시로 읽히는 순간 "간격이 벌어진다" 가 "눈금이 원래
   * 그렇게 생겼다" 로 뒤집힌다 (원본 NOTES 「두지 않은 것」).
   */

  messages: angularAccelerationMessages,
};
