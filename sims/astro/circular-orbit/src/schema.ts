// ========================================================================
// circular-orbit — 선언
// ========================================================================
// 질문: 중력이 끌어당기는데 위성은 왜 떨어지지 않고 원을 도는가.
//
// 중력은 늘 행성 중심을 향하고, 위성의 속도는 늘 옆을 향한다 — 둘이 직각이다.
// 직각으로 당기는 힘은 빠르기를 바꾸지 못하고 방향만 꺾는다. 중력이 없었다면
// 곧게 나가 멀어졌을 길에서, 위성은 매 순간 중심 쪽으로 떨어진다. 그런데 떨어진
// 만큼 길이 휘어 행성까지의 거리는 그대로다. 그 꺾임이 이어져 원이 닫힌다.
//
// 속도를 바꿔 궤도 모양이 갈리는 비교는 하지 않는다 — `orbital-velocity` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:circular-orbit` 와 문자 그대로 일치한다 (C4). */
export const CIRCULAR_ORBIT_ID = 'circular-orbit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 궤도 반지름(월드 단위). 행성 중심에서 위성까지의 거리 — 이 조각 내내 그대로다. */
export const ORBIT_RADIUS = 1.5;
/** 행성 반지름(월드 단위). 궤도보다 충분히 작아야 「행성 둘레를 돈다」 로 읽힌다. */
export const PLANET_RADIUS = 0.5;
/**
 * 「중력이 없다면」 유령이 떠나는 자리(도, 행성 중심에서 +x 반시계). 90 이면 궤도 꼭대기에서
 * 왼쪽으로 떠난다 — 오른쪽의 캡션 자리를 비켜 간다.
 */
export const GHOST_ANGLE_DEG = 90;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 궤도 중심이 원점이다.
// ------------------------------------------------------------------------

/** 캡션이 서는 자리(월드 x). 궤도와 화살표 이름표 오른쪽이다. */
export const CAPTION_X = 2.25;

/**
 * 프레이밍은 주장의 일부다. 세로는 궤도 꼭대기의 유령 이름표부터 바닥 화살표까지,
 * 가로는 멀리 나간 유령(왼쪽)부터 캡션 끝(오른쪽)까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.05, maxX: 5.6, minY: -1.72, maxY: 1.88 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const circularOrbitMessages = Object.freeze({
  'label.title': {
    ko: '원 궤도',
    en: 'Circular orbit',
    ja: '円軌道',
    zh: '圆轨道',
    ar: 'المدار الدائري',
    es: 'Órbita circular',
    fr: 'Orbite circulaire',
    hi: 'वृत्ताकार कक्षा',
    id: 'Orbit melingkar',
    pt: 'Órbita circular',
  },
  'label.operation': {
    ko: '구심력이 중력인 운동',
    en: 'Motion in which gravity is the centripetal force',
    ja: '重力が向心力となる運動',
    zh: '引力充当向心力的运动',
    ar: 'حركة تكون فيها الجاذبية هي القوة المركزية',
    es: 'Movimiento en el que la gravedad es la fuerza centrípeta',
    fr: 'Mouvement où la gravité joue le rôle de force centripète',
    hi: 'वह गति जिसमें गुरुत्व ही अभिकेंद्र बल है',
    id: 'Gerak dengan gravitasi sebagai gaya sentripetal',
    pt: 'Movimento em que a gravidade é a força centrípeta',
  },
  'label.stage': {
    ko: '행성 둘레',
    en: 'Around a planet',
    ja: '惑星のまわり',
    zh: '行星周围',
    ar: 'حول كوكب',
    es: 'Alrededor de un planeta',
    fr: 'Autour d’une planète',
    hi: 'एक ग्रह के चारों ओर',
    id: 'Mengelilingi planet',
    pt: 'Ao redor de um planeta',
  },
  'label.view': {
    ko: '궤도',
    en: 'Orbit',
    ja: '軌道',
    zh: '轨道',
    ar: 'المدار',
    es: 'Órbita',
    fr: 'Orbite',
    hi: 'कक्षा',
    id: 'Orbit',
    pt: 'Órbita',
  },
  /** 화살표 이름. 조사 없는 도식 낱말이지만 기호가 아니라 말이라 번역한다. */
  'label.velocity': {
    ko: '속도',
    en: 'velocity',
    ja: '速度',
    zh: '速度',
    ar: 'السرعة',
    es: 'velocidad',
    fr: 'vitesse',
    hi: 'वेग',
    id: 'kecepatan',
    pt: 'velocidade',
  },
  'label.gravity': {
    ko: '중력',
    en: 'gravity',
    ja: '重力',
    zh: '引力',
    ar: 'الجاذبية',
    es: 'gravedad',
    fr: 'gravité',
    hi: 'गुरुत्व',
    id: 'gravitasi',
    pt: 'gravidade',
  },
  'label.ghost': {
    ko: '중력이 없다면',
    en: 'without gravity',
    ja: '重力がなければ',
    zh: '若没有引力',
    ar: 'دون جاذبية',
    es: 'sin gravedad',
    fr: 'sans gravité',
    hi: 'गुरुत्व न हो तो',
    id: 'tanpa gravitasi',
    pt: 'sem gravidade',
  },
  'caption.turn': {
    ko: '중력은 늘 행성 중심을, 속도는 늘 옆을 향한다 — 둘은 직각이다',
    en: "Gravity always points to the planet's center, velocity always sideways — they meet at a right angle",
    ja: '重力はいつも惑星の中心を、速度はいつも横を向く — 二つは直角だ',
    zh: '引力始终指向行星中心，速度始终指向侧面——二者互相垂直',
    ar: 'تتجه الجاذبية دائمًا نحو مركز الكوكب، والسرعة دائمًا نحو الجانب — فهما متعامدتان',
    es: 'La gravedad siempre apunta al centro del planeta, la velocidad siempre de lado — forman un ángulo recto',
    fr: 'La gravité pointe toujours vers le centre de la planète, la vitesse toujours de côté — elles forment un angle droit',
    hi: 'गुरुत्व हमेशा ग्रह के केंद्र की ओर, वेग हमेशा बगल की ओर — दोनों समकोण पर हैं',
    id: 'Gravitasi selalu mengarah ke pusat planet, kecepatan selalu ke samping — keduanya saling tegak lurus',
    pt: 'A gravidade sempre aponta para o centro do planeta, a velocidade sempre para o lado — elas formam um ângulo reto',
  },
  'caption.ghost': {
    ko: '중력이 없다면 위성은 곧게 나가 행성에서 멀어졌을 것이다',
    en: 'Without gravity the satellite would fly straight on, away from the planet',
    ja: '重力がなければ、衛星はまっすぐ進み、惑星から遠ざかっていただろう',
    zh: '若没有引力，卫星会沿直线飞出，远离行星',
    ar: 'لولا الجاذبية لانطلق القمر الصناعي في خط مستقيم مبتعدًا عن الكوكب',
    es: 'Sin gravedad, el satélite seguiría en línea recta, alejándose del planeta',
    fr: 'Sans gravité, le satellite filerait tout droit, loin de la planète',
    hi: 'गुरुत्व न होता तो उपग्रह सीधा आगे निकलकर ग्रह से दूर चला जाता',
    id: 'Tanpa gravitasi, satelit akan melaju lurus, menjauhi planet',
    pt: 'Sem gravidade, o satélite seguiria em linha reta, afastando-se do planeta',
  },
  'caption.fall': {
    ko: '중력은 그 길에서 중심 쪽으로 끌어내린다 — 떨어진 만큼 길이 휘어, 행성까지의 거리는 그대로다',
    en: "Gravity pulls it down toward the center — it falls just as far as the path curves, so its distance from the planet stays the same",
    ja: '重力はその道から中心の方へ引き下ろす — 落ちた分だけ道が曲がり、惑星までの距離は変わらない',
    zh: '引力把它从那条路径上拉向中心——它下落多少，路径就弯曲多少，所以到行星的距离保持不变',
    ar: 'تسحبه الجاذبية نحو المركز — فيسقط بقدر ما ينحني المسار تمامًا، فتبقى المسافة إلى الكوكب كما هي',
    es: 'La gravedad lo tira hacia el centro — cae justo lo que se curva la trayectoria, así que su distancia al planeta no cambia',
    fr: 'La gravité le tire vers le centre — il tombe exactement autant que la trajectoire s’incurve, si bien que sa distance à la planète reste la même',
    hi: 'गुरुत्व उसे केंद्र की ओर नीचे खींचता है — जितना वह गिरता है, पथ उतना ही मुड़ता है, इसलिए ग्रह से उसकी दूरी वही रहती है',
    id: 'Gravitasi menariknya turun ke arah pusat — ia jatuh tepat sejauh lintasannya melengkung, sehingga jaraknya dari planet tetap sama',
    pt: 'A gravidade o puxa para o centro — ele cai exatamente o quanto a trajetória se curva, e por isso sua distância ao planeta continua a mesma',
  },
  'caption.close': {
    ko: '빠르기는 그대로, 방향만 꺾이는 일이 이어져 원이 닫힌다',
    en: 'Speed unchanged, only the direction bends, again and again — and the bends close into a circle',
    ja: '速さはそのまま、向きだけが曲がることが繰り返され — その曲がりが円を閉じる',
    zh: '速率不变，只有方向一次次转弯——这些转弯合成一个闭合的圆',
    ar: 'السرعة لا تتغير، والاتجاه وحده ينعطف مرة بعد مرة — فتنغلق الانعطافات في دائرة',
    es: 'La rapidez no cambia, solo la dirección se curva, una y otra vez — y las curvas cierran un círculo',
    fr: 'La vitesse ne change pas, seule la direction s’infléchit, encore et encore — et les inflexions referment un cercle',
    hi: 'चाल वही रहती है, केवल दिशा बार-बार मुड़ती है — और ये मोड़ मिलकर एक वृत्त पूरा करते हैं',
    id: 'Kelajuan tetap, hanya arah yang berbelok, lagi dan lagi — dan belokan itu menutup menjadi lingkaran',
    pt: 'A velocidade não muda, só a direção se curva, de novo e de novo — e as curvas fecham um círculo',
  },
} satisfies Record<string, LocalizedText>);

export type CircularOrbitMessageKey = keyof typeof circularOrbitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CircularOrbitMessageKey): LocalizedText => circularOrbitMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CircularOrbitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const circularOrbitSchema: BundleSchema = {
  id: CIRCULAR_ORBIT_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 이 조각이 답하는 것은 「왜 떨어지지 않는가」 하나이고, 속도를 끌게
  // 하면 궤도 모양이 갈리는 다른 질문(`orbital-velocity`)이 끼어든다.
  parameters: [],

  stages: [
    {
      id: 'planet',
      label: text('label.stage'),
      constants: {
        orbitRadius: ORBIT_RADIUS,
        planetRadius: PLANET_RADIUS,
        ghostAngle: GHOST_ANGLE_DEG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'orbit', label: text('label.view'), default: true }],

  /**
   * 궤도를 왼쪽에, 캡션을 오른쪽에 둬 세로를 아낀다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침 순서가 뜻을 갖는다 — 자취는 위성 아래로, 화살표는 위성 위로 지나야 한다.
   * 층 순서로는 `trajectory` · `vector` · `body` 의 관계를 고를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = **두 바퀴**. 첫 바퀴에 자취가 자라며 원이 닫히고, 둘째 바퀴에 그 원 위를
   * 돌다가 자취가 흐려진다.
   *
   * - 위성의 각속도는 `close` 가 끝나는 시각에서 나온다 — 그때 정확히 한 바퀴다.
   *   (turn 1.8 + ghost 1.4 + fall 1.4 + close 3.4 = 8 초)
   * - `hold` + `fade` 도 한 바퀴(8 초)라 주기 끝에서 위성이 제자리로 이어진다. 둘을 따로
   *   고치면 주기 끝에서 위성이 튄다 — 단계 길이 사이의 관계를 선언할 자리가 없다(G129).
   * - `ghost` 동안 「중력이 없다면」 유령이 접선으로 곧게 나간다. 떠나는 자리는 스테이지
   *   상수 `ghostAngle` 이고, 그 자리에 위성이 `ghost` 시작 시각에 닿도록 출발각을 되짚는다.
   * - `fall` 동안 유령과 끌어내림 화살표가 멈춘 채 흐려진다. 위성은 계속 돈다.
   */
  timeline: {
    phases: [
      { id: 'turn', duration: 1.8, caption: key('caption.turn') },
      { id: 'ghost', duration: 1.4, caption: key('caption.ghost') },
      { id: 'fall', duration: 1.4, caption: key('caption.fall') },
      { id: 'close', duration: 3.4, caption: key('caption.close') },
      { id: 'hold', duration: 6.8, caption: key('caption.close') },
      { id: 'fade', duration: 1.2, caption: key('caption.close') },
    ],
  },

  /**
   * 도착한 순간 이미 돌고 있다 — 자취가 한 뼘 자란 자리에서 연다. 0 이면 자취 없이
   * 위성만 한 점으로 서 있다.
   */
  startAt: 0.9,

  // 슬롯 하나. 궤도 오른쪽 가운데 높이에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: [CAPTION_X, 0] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 300,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 **방향**이다 — 격자를 깔면
   * 「몇 단위 떨어졌나」 라는 다른 질문이 끼어든다.
   */

  messages: circularOrbitMessages,
};
