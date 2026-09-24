// ========================================================================
// phase-space — 선언
// ========================================================================
// 질문: 위상 평면에서 진동은 닫힌 고리라는데, 마찰이 있으면 그 고리는 어떻게 되나.
//
// 마찰이 있으면 상태점은 제 에너지 고리에 머물지 못하고 고리를 가로질러 바닥
// 한 점으로 감겨 든다.
//
// 원본: tasks/piece-lab/phase-space/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText, TimelineDef, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:phase-space` 와 문자 그대로 일치한다 (C4). */
export const PHASE_SPACE_ID = 'phase-space';

// ------------------------------------------------------------------------
// 원본의 논리 좌표
// ------------------------------------------------------------------------
//
// 원본은 880×340 논리 캔버스에 그렸다. **그 픽셀 값들이 이 조각의 배치 판단이다.**
// 숫자를 그대로 옮기고 월드 좌표로는 여기서 한 번만 바꾼다.

/** 논리 100 px = 월드 1. */
const PX_PER_UNIT = 100;
/** 원본 캔버스 크기(px). */
const CANVAS_PX = { w: 880, h: 340 } as const;
/**
 * 원본은 캔버스 아래 DOM 한 줄(여백 6 + 줄 높이)에 캡션과 마찰 조절기를 두었다.
 * 엔진에서는 둘 다 캔버스 안 아래 줄에 뜨므로 그만큼 프레임을 아래로 넓힌다.
 */
const ROW_PX = 40;

/** 원본 논리 좌표(px) → 월드. 월드는 y 가 위로 간다. */
export function fromPx(px: number, py: number): Vec2 {
  return [px / PX_PER_UNIT, (CANVAS_PX.h - py) / PX_PER_UNIT];
}

/** 원본의 길이(px) → 월드 길이. */
export function lengthFromPx(px: number): number {
  return px / PX_PER_UNIT;
}

// ------------------------------------------------------------------------
// 물리 — 감쇠 진자 θ'' = −ω0² sinθ − γ θ'
// ------------------------------------------------------------------------

/** 고유 각진동수 (작은 진폭 주기 π 초). */
export const W0 = 2;
export const W0SQ = W0 * W0;
/** 평면 세로 범위. 넘어감 경계의 최고 각속도는 2·W0 = 4 다. */
export const OMEGA_MAX = 5.2;
/** 마찰 기본값. 자동 진행은 이 값으로 주장을 마친다. */
export const DEFAULT_FRICTION = 0.4;
/** 마찰 조절기 범위와 간격. */
export const FRICTION_RANGE: [number, number] = [0, 0.8];
export const FRICTION_STEP = 0.05;

/** 상태점 무리의 수. 밀도가 「분포가 뭉친다」의 가독성을 정한다. */
export const CLOUD_COUNT = 520;
/** 잔상이 담는 걸음 수 (고정 1/60 초 걸음). */
export const TRAIL_TICKS = 10;
/** 한 걸음 안의 부분 단계 수 — 마찰 0 에서 고리가 번지지 않도록 한 심플렉틱 오일러. */
export const SUBSTEPS = 4;
/** 고정 걸음(초). 원본 하네스의 DT. 잔상 길이가 화면 갱신률을 따라가지 않게 한다. */
export const TICK = 1 / 60;
/** 추적 상태의 출발 — 바닥에서 크게 밀어 꼭대기 가까이 올라갔다가 붙잡히게 한다. */
export const TRACKED_START = { th: 0, om: 4.5 } as const;
/** 원본 하네스의 난수 시드(`?seed=` 기본값). 같은 시각은 언제나 같은 무리다. */
export const RNG_SEED = 1;
/** 추적 상태가 「멈췄다」고 말하는 문턱. */
export const SETTLED = { om: 0.3, th: 0.12 } as const;

/** 도착 순간 이미 진행 중이도록 앞당긴 시간(초). */
export const LEAD = 1.5;

// ------------------------------------------------------------------------
// 자리
// ------------------------------------------------------------------------

/** 위상 평면(원본 px). */
const PLANE_PX = { x0: 250, x1: 866, y0: 14, y1: 312 } as const;

export const PLANE = {
  x0: lengthFromPx(PLANE_PX.x0),
  x1: lengthFromPx(PLANE_PX.x1),
  /** 평면 아래 끝의 월드 y. */
  yBottom: fromPx(0, PLANE_PX.y1)[1],
  /** 평면 위 끝의 월드 y. */
  yTop: fromPx(0, PLANE_PX.y0)[1],
} as const;

/** (각도, 각속도) → 월드. 각도는 −π~π 로 감겨 있다. */
export function planePos(th: number, om: number): Vec2 {
  const x = PLANE.x0 + ((th + Math.PI) / (2 * Math.PI)) * (PLANE.x1 - PLANE.x0);
  const yMid = (PLANE.yTop + PLANE.yBottom) / 2;
  const y = yMid + (om / OMEGA_MAX) * ((PLANE.yTop - PLANE.yBottom) / 2);
  return [x, y];
}

/** 진자 그림(원본 px 로 중심 120,165 · 길이 105). */
export const PENDULUM = {
  pivot: fromPx(120, 165),
  length: lengthFromPx(105),
  /** 받침 막대 28×4 px. */
  mount: [lengthFromPx(28), lengthFromPx(4)] as Vec2,
  /** 추 반지름 9 px. */
  bobRadius: lengthFromPx(9),
} as const;

/** 추적 상태점 반지름 5 px. */
export const TRACKED_DOT_RADIUS = lengthFromPx(5);

/**
 * 축 이름 자리(월드). 원본은 12 px 글자의 **윗선**을 평면 아래 6 px 에 맞췄다.
 * `readout` 의 월드 앵커는 글자 **가운데**라 반 글자(6 px)를 더 내린다.
 */
const AXIS_FONT_HALF_PX = 6;
export const AXIS_LABELS = {
  /** '각도 →' — 평면 오른쪽 끝에 오른쪽 맞춤. */
  angle: fromPx(PLANE_PX.x1, PLANE_PX.y1 + 6 + AXIS_FONT_HALF_PX),
  /** '거꾸로 섬' — 평면 왼쪽 끝 +4 px 에 가운데 맞춤. */
  inverted: fromPx(PLANE_PX.x0 + 4, PLANE_PX.y1 + 6 + AXIS_FONT_HALF_PX),
  /**
   * '각속도' — 원본은 x0−8 에 붙여 위로 세운 글자였다. 세울 수 없어 같은 x 에
   * 오른쪽 맞춤으로 눕히고, 평면 위 끝에 글자 가운데를 맞춘다 (NOTES 「어휘 부족」).
   */
  angularVelocity: fromPx(PLANE_PX.x0 - 8, PLANE_PX.y0 + AXIS_FONT_HALF_PX),
} as const;

/** 에너지 고리 — 닫힌 고리의 E/ω0² 비율 다섯과 넘어가는 물결의 E/ω0² 두 개. */
export const CLOSED_LOOP_FRACTIONS: readonly number[] = [-0.8, -0.5, -0.15, 0.25, 0.65];
export const OPEN_CURVE_FRACTIONS: readonly number[] = [1.45, 2.3];

/**
 * 프레이밍은 주장의 일부다. 원본 캔버스 전체에 캡션·조절기 줄을 더한 고정 경계.
 */
export const SCENE_BOUNDS = {
  minX: fromPx(0, 0)[0],
  maxX: fromPx(CANVAS_PX.w, 0)[0],
  minY: fromPx(0, CANVAS_PX.h + ROW_PX)[1],
  maxY: fromPx(0, 0)[1],
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const phaseSpaceMessages = Object.freeze({
  'label.title': {
    ko: '위상 공간',
    en: 'Phase space',
    ja: '位相空間',
    zh: '相空间',
    ar: 'فضاء الطور',
    es: 'Espacio de fases',
    fr: 'Espace des phases',
    hi: 'कला समष्टि',
    id: 'Ruang fase',
    pt: 'Espaço de fases',
  },
  'label.operation': {
    ko: '위치-속도 평면에서 본 운동',
    en: 'Motion seen on the position–velocity plane',
    ja: '位置–速度平面で見た運動',
    zh: '在位置–速度平面上看运动',
    ar: 'الحركة كما تُرى على مستوى الموضع–السرعة',
    es: 'El movimiento visto en el plano posición–velocidad',
    fr: 'Le mouvement vu dans le plan position–vitesse',
    hi: 'स्थिति–वेग तल पर देखी गई गति',
    id: 'Gerak yang dilihat pada bidang posisi–kecepatan',
    pt: 'O movimento visto no plano posição–velocidade',
  },
  'label.stage': {
    ko: '감쇠 진자',
    en: 'Damped pendulum',
    ja: '減衰振り子',
    zh: '阻尼摆',
    ar: 'بندول مُخمَّد',
    es: 'Péndulo amortiguado',
    fr: 'Pendule amorti',
    hi: 'अवमंदित लोलक',
    id: 'Bandul teredam',
    pt: 'Pêndulo amortecido',
  },
  'label.view': {
    ko: '위상 평면',
    en: 'Phase plane',
    ja: '位相平面',
    zh: '相平面',
    ar: 'مستوى الطور',
    es: 'Plano de fases',
    fr: 'Plan de phase',
    hi: 'कला तल',
    id: 'Bidang fase',
    pt: 'Plano de fase',
  },
  /** 평면 가로축 이름. */
  'axis.angle': {
    ko: '각도 →',
    en: 'angle →',
    ja: '角度 →',
    zh: '角度 →',
    ar: 'الزاوية →',
    es: 'ángulo →',
    fr: 'angle →',
    hi: 'कोण →',
    id: 'sudut →',
    pt: 'ângulo →',
  },
  /** 평면 세로축 이름. 원본은 세운 글자에 '→' 였다 — 가로 글자라 화살표를 위로 둔다. */
  'axis.angularVelocity': {
    ko: '각속도 ↑',
    en: 'angular velocity ↑',
    ja: '角速度 ↑',
    zh: '角速度 ↑',
    ar: 'السرعة الزاوية ↑',
    es: 'velocidad angular ↑',
    fr: 'vitesse angulaire ↑',
    hi: 'कोणीय वेग ↑',
    id: 'kecepatan sudut ↑',
    pt: 'velocidade angular ↑',
  },
  /** 가로축 양 끝 자리 — 좌우 가장자리는 같은 「거꾸로 선 자리」다. */
  'axis.inverted': {
    ko: '거꾸로 섬',
    en: 'upside down',
    ja: '逆立ち',
    zh: '倒立',
    ar: 'مقلوب',
    es: 'invertido',
    fr: 'à l’envers',
    hi: 'उल्टा',
    id: 'terbalik',
    pt: 'invertido',
  },
  /** 가로축 가운데 자리. */
  'axis.bottom': {
    ko: '바닥',
    en: 'bottom',
    ja: '最下点',
    zh: '最低点',
    ar: 'القاع',
    es: 'punto más bajo',
    fr: 'point bas',
    hi: 'निम्नतम बिंदु',
    id: 'titik terendah',
    pt: 'ponto mais baixo',
  },
  /** 조작기 이름. */
  'control.friction': {
    ko: '마찰',
    en: 'Friction',
    ja: '摩擦',
    zh: '摩擦',
    ar: 'الاحتكاك',
    es: 'Rozamiento',
    fr: 'Frottement',
    hi: 'घर्षण',
    id: 'Gesekan',
    pt: 'Atrito',
  },
  'caption.zero': {
    ko: '마찰이 없으면 상태점은 제가 선 고리를 따라 돌 뿐, 안쪽 고리로 옮겨 가지 않는다.',
    en: 'Without friction a state point only circles its own loop and never moves inward.',
    ja: '摩擦がなければ、状態点は自分のいる輪をなぞって回るだけで、内側へは移らない。',
    zh: '没有摩擦时，状态点只沿自己所在的环线绕行，永远不会向内移动。',
    ar: 'بلا احتكاك، تدور نقطة الحالة على حلقتها فقط ولا تنتقل إلى الداخل أبدًا.',
    es: 'Sin rozamiento, un punto de estado solo recorre su propio lazo y nunca se desplaza hacia dentro.',
    fr: 'Sans frottement, un point d’état ne fait que parcourir sa propre boucle et ne se déplace jamais vers l’intérieur.',
    hi: 'घर्षण के बिना अवस्था बिंदु केवल अपने ही लूप पर घूमता है और कभी भीतर की ओर नहीं जाता।',
    id: 'Tanpa gesekan, titik keadaan hanya mengitari lingkarannya sendiri dan tak pernah bergeser ke dalam.',
    pt: 'Sem atrito, um ponto de estado só percorre o próprio laço e nunca se desloca para dentro.',
  },
  'caption.spiral': {
    ko: '마찰이 에너지를 빼는 만큼 상태점이 고리를 가로질러 바닥 한 점으로 감겨 든다.',
    en: 'As friction drains energy, the state points cut across the loops and spiral into one point at the bottom.',
    ja: '摩擦がエネルギーを奪うにつれて、状態点は輪を横切り、最下点の一点へと渦を巻いて入っていく。',
    zh: '随着摩擦带走能量，状态点穿过一圈圈环线，螺旋落入最低点处的一点。',
    ar: 'بقدر ما يستنزف الاحتكاك الطاقة، تقطع نقاط الحالة الحلقات وتلتف حلزونيًا نحو نقطة واحدة في القاع.',
    es: 'A medida que el rozamiento resta energía, los puntos de estado atraviesan los lazos y caen en espiral hacia un único punto abajo.',
    fr: 'À mesure que le frottement draine l’énergie, les points d’état coupent les boucles et s’enroulent en spirale vers un seul point en bas.',
    hi: 'जैसे-जैसे घर्षण ऊर्जा खींचता है, अवस्था बिंदु लूपों को काटते हुए निम्नतम स्थान के एक बिंदु की ओर सर्पिल में घूमते जाते हैं।',
    id: 'Saat gesekan menguras energi, titik-titik keadaan memotong lingkaran-lingkaran dan berpilin menuju satu titik di dasar.',
    pt: 'À medida que o atrito drena energia, os pontos de estado cruzam os laços e espiralam até um único ponto embaixo.',
  },
  'caption.settled': {
    ko: '고리를 하나씩 가로지른 상태점이 바닥 한 점에 감겨 들어 멈췄다.',
    en: 'Having crossed the loops one by one, the state point has spiralled into the bottom and stopped.',
    ja: '輪を一つずつ横切った状態点が、最下点の一点に巻き込まれて止まった。',
    zh: '状态点一圈圈穿过环线，螺旋落入最低点后停了下来。',
    ar: 'بعد أن عبرت نقطة الحالة الحلقات واحدة تلو الأخرى، التفّت نحو القاع وتوقفت.',
    es: 'Tras cruzar los lazos uno a uno, el punto de estado ha caído en espiral hasta abajo y se ha detenido.',
    fr: 'Après avoir traversé les boucles une à une, le point d’état s’est enroulé jusqu’en bas et s’est arrêté.',
    hi: 'लूपों को एक-एक करके पार करने के बाद अवस्था बिंदु सर्पिल में निम्नतम स्थान तक पहुँचकर रुक गया है।',
    id: 'Setelah melintasi lingkaran satu per satu, titik keadaan telah berpilin ke dasar dan berhenti.',
    pt: 'Depois de cruzar os laços um a um, o ponto de estado espiralou até embaixo e parou.',
  },
} satisfies Record<string, LocalizedText>);

export type PhaseSpaceMessageKey = keyof typeof phaseSpaceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PhaseSpaceMessageKey): LocalizedText => phaseSpaceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PhaseSpaceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/**
 * 16 초마다 무리를 다시 흩뿌린다. 시작 0.5 초에 나타나고 끝 0.8 초에 흐려진다.
 * 흩뿌리는 일 자체는 상태라 `step` 이 하고, 그 주기는 이 선언의 길이 합에서 읽는다
 * (`physics.ts` `cycleLength`) — 같은 숫자를 두 곳에 두지 않는다.
 */
export const PHASE_SPACE_TIMELINE: TimelineDef = {
  phases: [
    { id: 'appear', duration: 0.5 },
    { id: 'spiral', duration: 14.7 },
    { id: 'vanish', duration: 0.8 },
  ],
};

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const phaseSpaceSchema: BundleSchema = {
  id: PHASE_SPACE_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 마찰은 조작기가 쥔다 (controllers.ts). 파라미터 상자를 띄우지 않는다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 880×340 캔버스 + 캡션·조절기 한 줄. 세로가 비싸다 — 프레이밍 여백을 빼고도
   * 가로에 맞춰 그려질 만큼만 잡는다.
   */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 옅은 고리 위에 무리가, 그 위에 추적 궤적과 점이 올라가야
   * 「한 상태가 어떤 길로 가는지」 가 무리에 묻히지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 무리와 추적 궤적은 **누적 적분**이라 시계만 앞당기면 화면이 비어 있다.
   * 원본이 1.5 초 앞당겨 흘려 둔 만큼 상태를 굴리고(`preroll`), 흐려짐 시간표도
   * 같은 만큼 앞당긴다(`startAt`). 둘이 어긋나면 흩뿌림과 페이드가 따로 논다.
   */
  preroll: LEAD,
  startAt: LEAD,
  timeline: PHASE_SPACE_TIMELINE,

  /**
   * 슬롯 하나. 문장은 시각이 아니라 조작값과 추적 상태로 갈린다 — 마찰 0 인지,
   * 추적 상태가 바닥에 멈췄는지는 `physics.ts` 가 세고 선언은 그 자리만 가리킨다.
   */
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -10] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.spiral'),
    cases: [
      { when: 'frictionZero', text: key('caption.zero') },
      { when: 'settled', text: key('caption.settled') },
    ],
  },

  // 그리드·카메라 버튼 없음 (기본값). 주장은 모양이지 값이 아니다.

  messages: phaseSpaceMessages,
};
