// ========================================================================
// projectile-range — 선언
// ========================================================================
// 질문: 같은 속력으로 던질 때 어느 각도가 가장 멀리 가는가.
//
// 한 발사점에서 다섯 공이 **같은 속력으로 동시에** 떠난다. 다른 것은 각도뿐이다
// (15° · 30° · 45° · 60° · 75°). 낮게 쏜 것부터 차례로 내려앉고, 뒤늦게 내려온
// 60° 는 30° 가 이미 남긴 자국 **위에** 내려앉는다. 75° 는 15° 의 자국 위에.
// 짝이 없는 자국은 45° 하나뿐이고, 그것이 가장 멀다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:projectile-range` 와 문자 그대로 같아야 한다 (C4). 바꾸지 않는다. */
export const PROJECTILE_RANGE_ID = 'projectile-range';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 다섯 공의 처음 속력(m/s). **다섯이 같다** — 이 조각의 전제다. */
export const SPEED = 10;
/** 중력가속도(m/s²). 크기를 바꾸는 것은 이 조각의 주장이 아니다 (이웃 조각의 몫). */
export const GRAVITY = 9.8;

/**
 * 다섯 발사각(°). 45° 를 가운데 두고 양쪽으로 같은 만큼 벌어진 짝이다 —
 * 30° 와 60° 는 45° 에서 15° 씩, 15° 와 75° 는 30° 씩. 그 짝이 같은 자리에
 * 떨어지는 것이 화면에서 벌어지는 일이다.
 */
export const ANGLE_SHALLOW = 15;
export const ANGLE_LOW = 30;
export const ANGLE_BEST = 45;
export const ANGLE_HIGH = 60;
export const ANGLE_STEEP = 75;

/** 한 발의 체공 시간(초) — 2·v·sinθ/g. 시간표 단계 길이의 기본값이 여기서 온다. */
function flightTime(deg: number): number {
  return (2 * SPEED * Math.sin((deg * Math.PI) / 180)) / GRAVITY;
}

/** 사거리(m) — v²·sin2θ/g. 프레이밍을 잡는 데만 쓴다. */
function range(deg: number): number {
  return (SPEED * SPEED * Math.sin((2 * deg * Math.PI) / 180)) / GRAVITY;
}

// ------------------------------------------------------------------------
// 배치 — 월드 미터
// ------------------------------------------------------------------------

/** 지면 높이와 발사점. 다섯이 같은 자리에서 떠난다. */
export const GROUND_Y = 0;

/** 공 반지름(m). 다섯이 같다 — 같은 공이라는 것이 전제다. */
export const BALL_R = 0.17;

/** 착지 자국(지면을 가로지르는 짧은 획)의 길이(m). */
export const MARK_LEN = 0.5;

/**
 * 발사 화살표의 길이 배율(m per m/s). 다섯 화살표가 **같은 길이**로 나오는 것이
 * 「같은 속력」 을 말하는 방식이다 — 수로 적지 않는다.
 */
export const ARROW_SCALE = 0.22;
/** 각도 이름표가 화살표 끝 너머에 놓이는 반지름(m). */
export const ANGLE_LABEL_R = SPEED * ARROW_SCALE + 0.65;

/**
 * 착지한 각도 이름표가 놓이는 두 줄의 높이(m). 짝의 **나중에 내려온 쪽**이 둘째
 * 줄이다 — 같은 자리에 이름표 둘이 겹치면 두 각도가 한 자리에 내려앉았다는 것이
 * 가려진다.
 */
export const MARK_LABEL_Y_FIRST = -0.85;
export const MARK_LABEL_Y_SECOND = -1.35;

/**
 * 45° 자국이 그 짝보다 더 간 거리를 재는 치수선의 높이(m). 재는 구간은 짝이 있는
 * 자국 중 가장 먼 것(30° · 60° 가 함께 쓰는 자국)에서 홀로 남은 45° 의 자국까지다.
 */
export const EXTRA_DIM_Y = -0.38;

/**
 * 프레이밍은 주장의 일부다. 가로는 발사점 왼쪽 여백부터 45° 자국 너머까지,
 * 세로는 가장 높이 오르는 75° 의 꼭대기 위부터 둘째 줄 이름표 아래까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = {
  minX: -1,
  maxX: range(ANGLE_BEST) + 1.2,
  minY: -2,
  maxY: 5,
} as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 겨누고 있는 동안(초). 다섯 화살표가 같은 길이로 벌어져 있다. */
export const AIM = 0.9;
/** 쏘는 순간(초) — 화살표가 걷히고 공이 떠난다. */
export const RELEASE = 0.3;
/** 셋(15° · 30° · 45°)이 내려앉기까지. 45° 가 닿는 순간 끝난다. */
export const FLY = flightTime(ANGLE_BEST) - RELEASE;
/** 60° 가 내려앉기까지. */
export const SINK = flightTime(ANGLE_HIGH) - flightTime(ANGLE_BEST);
/** 75° 가 내려앉기까지 — 가장 가파른 공이 마지막이다. */
export const LAST = flightTime(ANGLE_STEEP) - flightTime(ANGLE_HIGH);
/** 짝지어 남은 자국을 읽는 동안. */
export const PAIRS = 2.4;
/** 45° 가 더 간 거리를 재는 치수선이 그어지는 동안 — 짧은 단계 하나다. */
export const REVEAL = 0.35;
/** 그 치수선을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const FAR = 2.4;
export const FADE = 0.7;

/** 나는 동안의 재생 속도. 실시간 2 초는 다섯을 눈으로 좇기 짧다. */
export const SLOW_MOTION = 0.7;

/** 착지 파문이 사는 시간(초). */
export const SPLASH_LIFE = 0.55;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const projectileRangeMessages = Object.freeze({
  'label.title': {
    ko: '사거리와 발사각',
    en: 'Range and launch angle',
    ja: '水平到達距離と投射角',
    zh: '射程与抛射角',
    ar: 'المدى وزاوية الإطلاق',
    es: 'Alcance y ángulo de lanzamiento',
    fr: 'Portée et angle de tir',
    hi: 'परास और प्रक्षेपण कोण',
    id: 'Jangkauan dan sudut lemparan',
    pt: 'Alcance e ângulo de lançamento',
  },
  'label.operation': {
    ko: '던지는 각도가 날아가는 거리를 바꾸는 방식',
    en: 'How the launch angle changes how far it flies',
    ja: '投射角が飛ぶ距離をどう変えるか',
    zh: '抛射角如何改变飞行的距离',
    ar: 'كيف تغيّر زاوية الإطلاق المسافة التي يقطعها',
    es: 'Cómo el ángulo de lanzamiento cambia lo lejos que llega',
    fr: 'Comment l’angle de tir change la distance parcourue',
    hi: 'प्रक्षेपण कोण उड़ान की दूरी को कैसे बदलता है',
    id: 'Bagaimana sudut lemparan mengubah seberapa jauh benda terbang',
    pt: 'Como o ângulo de lançamento muda a distância que ele voa',
  },
  'label.stage': {
    ko: '같은 속력, 다섯 각도',
    en: 'Same speed, five angles',
    ja: '同じ速さ、五つの角度',
    zh: '相同速率，五个角度',
    ar: 'السرعة نفسها، خمس زوايا',
    es: 'Misma rapidez, cinco ángulos',
    fr: 'Même vitesse, cinq angles',
    hi: 'समान चाल, पाँच कोण',
    id: 'Kelajuan sama, lima sudut',
    pt: 'Mesma velocidade, cinco ângulos',
  },
  'label.view': {
    ko: '다섯 발사',
    en: 'Five launches',
    ja: '五回の投射',
    zh: '五次抛射',
    ar: 'خمس عمليات إطلاق',
    es: 'Cinco lanzamientos',
    fr: 'Cinq tirs',
    hi: 'पाँच प्रक्षेपण',
    id: 'Lima lemparan',
    pt: 'Cinco lançamentos',
  },
  /** 각도 표기. 수식·단위 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.deg15': {
    ko: '15°',
    en: '15°',
    ja: '15°',
    zh: '15°',
    ar: '15°',
    es: '15°',
    fr: '15°',
    hi: '15°',
    id: '15°',
    pt: '15°',
  },
  'label.deg30': {
    ko: '30°',
    en: '30°',
    ja: '30°',
    zh: '30°',
    ar: '30°',
    es: '30°',
    fr: '30°',
    hi: '30°',
    id: '30°',
    pt: '30°',
  },
  'label.deg45': {
    ko: '45°',
    en: '45°',
    ja: '45°',
    zh: '45°',
    ar: '45°',
    es: '45°',
    fr: '45°',
    hi: '45°',
    id: '45°',
    pt: '45°',
  },
  'label.deg60': {
    ko: '60°',
    en: '60°',
    ja: '60°',
    zh: '60°',
    ar: '60°',
    es: '60°',
    fr: '60°',
    hi: '60°',
    id: '60°',
    pt: '60°',
  },
  'label.deg75': {
    ko: '75°',
    en: '75°',
    ja: '75°',
    zh: '75°',
    ar: '75°',
    es: '75°',
    fr: '75°',
    hi: '75°',
    id: '75°',
    pt: '75°',
  },
  'caption.aim': {
    ko: '다섯 화살표의 길이가 같다 — 같은 속력, 다른 각도',
    en: 'Five arrows of equal length — same speed, different angles',
    ja: '長さの等しい五本の矢印 — 同じ速さ、違う角度',
    zh: '五个长度相等的箭头 — 相同速率，不同角度',
    ar: 'خمسة أسهم متساوية الطول — السرعة نفسها، وزوايا مختلفة',
    es: 'Cinco flechas de igual longitud — misma rapidez, ángulos distintos',
    fr: 'Cinq flèches de même longueur — même vitesse, angles différents',
    hi: 'बराबर लंबाई के पाँच तीर — समान चाल, अलग-अलग कोण',
    id: 'Lima panah sama panjang — kelajuan sama, sudut berbeda',
    pt: 'Cinco setas de mesmo comprimento — mesma velocidade, ângulos diferentes',
  },
  'caption.fly': {
    ko: '다섯 공이 같은 속력으로 한꺼번에 떠났다',
    en: 'Five balls left at once with the same speed',
    ja: '五つのボールが同じ速さでいっせいに飛び出した',
    zh: '五个球以相同的速率同时出发',
    ar: 'انطلقت خمس كرات دفعةً واحدة بالسرعة نفسها',
    es: 'Cinco bolas salieron a la vez con la misma rapidez',
    fr: 'Cinq balles sont parties en même temps à la même vitesse',
    hi: 'पाँच गेंदें एक ही चाल से एक साथ निकलीं',
    id: 'Lima bola berangkat serentak dengan kelajuan yang sama',
    pt: 'Cinco bolas partiram ao mesmo tempo com a mesma velocidade',
  },
  'caption.sink': {
    ko: '낮게 쏜 셋은 이미 내려앉았고, 가파른 둘은 아직 공중에 있다',
    en: 'The three shallower ones have already landed; the two steeper are still in the air',
    ja: '低く打ち出した三つはもう着地し、急な二つはまだ空中にある',
    zh: '较平的三个已经落地，较陡的两个还在空中',
    ar: 'الثلاث الأقل ميلًا هبطت بالفعل، والاثنتان الأشد انحدارًا ما زالتا في الهواء',
    es: 'Las tres más rasantes ya aterrizaron; las dos más empinadas siguen en el aire',
    fr: 'Les trois plus rasantes ont déjà atterri ; les deux plus raides sont encore en l’air',
    hi: 'कम कोण वाली तीन गेंदें उतर चुकी हैं; खड़े कोण वाली दो अभी हवा में हैं',
    id: 'Tiga yang lebih landai sudah mendarat; dua yang lebih curam masih di udara',
    pt: 'As três mais rasantes já pousaram; as duas mais íngremes ainda estão no ar',
  },
  'caption.last': {
    ko: '60° 가 30° 의 자국 위에 내려앉았다',
    en: 'The 60° ball came down on the mark the 30° one left',
    ja: '60° のボールが 30° の残した跡に降りた',
    zh: '60° 的球落在了 30° 留下的印迹上',
    ar: 'هبطت كرة 60° على الأثر الذي تركته كرة 30°',
    es: 'La bola de 60° cayó sobre la marca que dejó la de 30°',
    fr: 'La balle à 60° est retombée sur la marque laissée par celle à 30°',
    hi: '60° वाली गेंद 30° वाली के छोड़े निशान पर उतरी',
    id: 'Bola 60° turun tepat di bekas yang ditinggalkan bola 30°',
    pt: 'A bola de 60° caiu sobre a marca deixada pela de 30°',
  },
  'caption.pairs': {
    ko: '75° 는 15° 의 자국 위에, 60° 는 30° 의 자국 위에 내려앉았다',
    en: 'The 75° ball landed on the 15° mark, the 60° on the 30° mark',
    ja: '75° のボールは 15° の跡に、60° は 30° の跡に着地した',
    zh: '75° 的球落在 15° 的印迹上，60° 的落在 30° 的印迹上',
    ar: 'هبطت كرة 75° على أثر 15°، وكرة 60° على أثر 30°',
    es: 'La bola de 75° aterrizó sobre la marca de 15°, la de 60° sobre la de 30°',
    fr: 'La balle à 75° a atterri sur la marque de 15°, celle à 60° sur celle de 30°',
    hi: '75° वाली गेंद 15° के निशान पर उतरी, 60° वाली 30° के निशान पर',
    id: 'Bola 75° mendarat di bekas 15°, bola 60° di bekas 30°',
    pt: 'A bola de 75° pousou na marca de 15°, a de 60° na de 30°',
  },
  'caption.far': {
    ko: '45° 의 자국만 짝 없이, 그 둘보다 멀리 홀로 있다',
    en: 'Only the 45° mark has no partner — it stands alone, farther than the rest',
    ja: '45° の跡だけが相手を持たず、ほかより遠くにひとつだけある',
    zh: '只有 45° 的印迹没有配对 — 它独自落在比其余都远的地方',
    ar: 'أثر 45° وحده بلا شريك — يقف منفردًا، أبعد من البقية',
    es: 'Solo la marca de 45° no tiene pareja — queda sola, más lejos que las demás',
    fr: 'Seule la marque de 45° n’a pas de partenaire — elle reste seule, plus loin que les autres',
    hi: 'केवल 45° के निशान का कोई जोड़ा नहीं — वह अकेला है, बाकी सबसे दूर',
    id: 'Hanya bekas 45° yang tanpa pasangan — ia sendirian, lebih jauh dari yang lain',
    pt: 'Só a marca de 45° não tem par — fica sozinha, mais longe que as demais',
  },
} satisfies Record<string, LocalizedText>);

export type ProjectileRangeMessageKey = keyof typeof projectileRangeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ProjectileRangeMessageKey): LocalizedText =>
  projectileRangeMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ProjectileRangeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const projectileRangeSchema: BundleSchema = {
  id: PROJECTILE_RANGE_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 쏘고, 내려앉고, 다시 겨눈다.
  parameters: [],

  stages: [
    {
      id: 'same-speed',
      label: text('label.stage'),
      constants: {
        speed: SPEED,
        g: GRAVITY,
        angleShallow: ANGLE_SHALLOW,
        angleLow: ANGLE_LOW,
        angleBest: ANGLE_BEST,
        angleHigh: ANGLE_HIGH,
        angleSteep: ANGLE_STEEP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'fan', label: text('label.view'), default: true }],

  /**
   * 세로가 비싼 줄 알면서도 384 에서 420 으로 올렸다. 담을 세로(7.0 m)가 가로(12.4 m)의
   * 절반을 넘어 **세로가 배율을 정한다** — 384 에서는 그림이 가로의 60 % 만 쓰고 남은
   * 좌우가 빈 여백이 됐다. 36 px 을 더 주면 배율이 42 → 50 px/m 로 올라 짝지은 자국
   * 사이와 치수선이 그만큼 커진다 (촬영본으로 확인).
   */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 착지 자국은 공 **아래** 로 깔려야 나중에 온 공이 이미 있는
   * 자국 위에 내려앉는 것으로 읽히고, 경로는 그 둘 뒤로 지나가야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 겨눔 → 쏨 → 셋이 내려앉음 → 60° 가 내려앉음 → 75° 가 내려앉음 →
   * 짝을 읽음 → 홀로 남은 자국이 더 간 거리를 잼 → 읽음 → 흐려짐.
   *
   * 단계 길이를 물리에서 끌어온다. 45° · 60° · 75° 가 닿는 순간(2v sinθ/g)이 곧
   * 단계 경계라서, 「60° 가 30° 의 자국 위에 내려앉았다」 는 캡션이 화면과 어긋날
   * 수 없다. 나는 동안은 0.7 배 속도로 흘린다.
   */
  timeline: {
    phases: [
      { id: 'aim', duration: AIM, caption: key('caption.aim') },
      {
        id: 'release',
        duration: RELEASE,
        timeScale: SLOW_MOTION,
        caption: key('caption.fly'),
      },
      { id: 'fly', duration: FLY, timeScale: SLOW_MOTION, caption: key('caption.fly') },
      { id: 'sink', duration: SINK, timeScale: SLOW_MOTION, caption: key('caption.sink') },
      { id: 'last', duration: LAST, timeScale: SLOW_MOTION, caption: key('caption.last') },
      { id: 'pairs', duration: PAIRS, caption: key('caption.pairs') },
      { id: 'reveal', duration: REVEAL, caption: key('caption.far') },
      { id: 'far', duration: FAR, caption: key('caption.far') },
      { id: 'fade', duration: FADE, caption: key('caption.far') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 다섯 공이 이미 날고 있고 낮은 것은 곧 내려앉는
   * 자리에서 연다. 0 이면 겨눈 화살표만 서 있는 정지 화면이 먼저 보인다.
   */
  startAt: 1.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 법칙은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **자국끼리의
   * 자리**라, 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다.
   */

  messages: projectileRangeMessages,
};
