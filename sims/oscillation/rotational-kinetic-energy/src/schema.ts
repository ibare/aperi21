// ========================================================================
// rotational-kinetic-energy — 선언
// ========================================================================
// 질문: 같은 속력으로 달리는 두 물체 — 하나는 미끄러지고 하나는 구른다. 누가
// 에너지를 더 담고 있는가.
//
// 같은 고리 둘이 같은 속력 v 로 같은 비탈에 들어간다. 왼쪽 고리는 얼음 위를 돌지
// 않고 미끄러지고, 오른쪽 고리는 거친 면 위를 구른다. 고리는 질량이 모두 테에 있어
// 회전 몫 ½Iω² 이 병진 몫 ½mv² 과 같다. 그래서 구르는 고리는 같은 비탈을 **두 배
// 높이** 오른다 — 오른 높이가 곧 담고 있던 에너지다(mgh).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:rotational-kinetic-energy` 와 문자 그대로 일치한다 (C4). */
export const ROTATIONAL_KINETIC_ENERGY_ID = 'rotational-kinetic-energy';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;
/** 두 고리의 진입 속력(m/s). 둘이 같다 — 이 조각이 같게 두는 수. */
export const SPEED = 3.1;
/** 비탈 기울기(도). 두 판이 같다. */
export const SLOPE_DEG = 35;
/** 고리 반지름(m). 두 고리가 같다. */
export const RADIUS = 0.24;
/**
 * 관성 계수 k = I / mR². 고리는 질량이 모두 테에 있어 1 이다 — 회전 몫이 병진 몫과
 * 같아 구르는 고리가 정확히 두 배 높이 오른다. 원판이면 0.5(1.5 배), 공이면 0.4.
 */
export const INERTIA_FACTOR = 1;

/** 기본 상수에서 끌어낸 값 — 단계 길이 · 배치의 기본값을 정하는 데만 쓴다. */
const SIN = Math.sin((SLOPE_DEG * Math.PI) / 180);
/** 미끄러지는 고리가 비탈에서 멈출 때까지(초) = v / g sinθ. */
export const CLIMB_SLIDE = SPEED / (GRAVITY * SIN);
/** 구르는 고리는 감속이 1/(1+k) 라 그만큼 더 오래 오른다. 더 오르는 몫(초) = k · v / g sinθ. */
export const CLIMB_ROLL_EXTRA = INERTIA_FACTOR * CLIMB_SLIDE;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 한 바닥선 위에 두 판을 나란히 둔다.
// ------------------------------------------------------------------------

/**
 * 판마다 비탈 발치의 월드 x. 왼쪽 판 = 미끄러지는 고리, 오른쪽 판 = 구르는 고리.
 * **바닥선이 하나라** 두 판의 높이를 가로로 곧장 견줄 수 있다.
 */
export const FOOT_SLIDE_X = -2.1;
export const FOOT_ROLL_X = 1.55;
/** 판 안에서 발치 기준 왼쪽 끝 · 오른쪽 끝(비탈 끝). 두 판이 같다. */
export const PANEL_LEFT = -1.35;
export const PANEL_RIGHT = 1.9;
/** 바닥 결 띠의 두께(m). 바닥선 아래로 깔린다. */
export const FLOOR_DEPTH = 0.12;
/** 두 판 사이 칸막이의 위 끝(월드 y). */
export const DIVIDER_TOP = 1.45;

/** 높이 막대가 놓이는 자리 — 발치 기준 가로(m). 고리가 들어오는 길 위 빈 자리다. */
export const METER_X = -0.62;
/** 속도 화살표가 고리 윗면에서 떨어진 거리(m)와 속력 → 길이 배율(m per m/s). */
export const ARROW_GAP = 0.13;
export const ARROW_SCALE = 0.12;

/**
 * 프레이밍은 주장의 일부다. 가로는 두 판 전체, 세로는 바닥 결 띠 아래(캡션 줄 자리 포함)
 * 부터 비탈 끝과 정점 고리 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.55, maxX: 3.55, minY: -0.72, maxY: 1.58 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값은 물리가 정한다
// ------------------------------------------------------------------------

/** 들어오는 동안(초) — `enter` 단계. 물리는 이 상수를 보지 않고 시간표에게 묻는다. */
export const APPROACH = 0.4;
/** 되돌아 내려오는 것을 보며 결과를 읽는 동안 · 흐려지는 동안. */
export const HOLD = 2.8;
export const FADE = 0.6;
/** 들어오기 · 오르기를 느리게 흘린다 — 실시간 1 초 안에 끝나 눈으로 따라가기 어렵다. */
export const SLOW_ENTER = 0.5;
export const SLOW_CLIMB = 0.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rotationalKineticEnergyMessages = Object.freeze({
  'label.title': {
    ko: '회전 운동 에너지',
    en: 'Rotational kinetic energy',
    ja: '回転の運動エネルギー',
    zh: '转动动能',
    ar: 'الطاقة الحركية الدورانية',
    es: 'Energía cinética de rotación',
    fr: 'Énergie cinétique de rotation',
    hi: 'घूर्णी गतिज ऊर्जा',
    id: 'Energi kinetik rotasi',
    pt: 'Energia cinética de rotação',
  },
  'label.operation': {
    ko: '각속도가 담은 에너지',
    en: 'The energy that spin carries',
    ja: '回転が蓄えるエネルギー',
    zh: '转动所携带的能量',
    ar: 'الطاقة التي يحملها الدوران',
    es: 'La energía que lleva el giro',
    fr: 'L’énergie que porte la rotation',
    hi: 'घूर्णन में निहित ऊर्जा',
    id: 'Energi yang dibawa putaran',
    pt: 'A energia que o giro carrega',
  },
  'label.stage': {
    ko: '고리 둘',
    en: 'Two hoops',
    ja: '二つの円環',
    zh: '两个圆环',
    ar: 'حلقتان',
    es: 'Dos aros',
    fr: 'Deux anneaux',
    hi: 'दो वलय',
    id: 'Dua cincin',
    pt: 'Dois aros',
  },
  'label.view': {
    ko: '두 비탈',
    en: 'Two slopes',
    ja: '二つの斜面',
    zh: '两个斜面',
    ar: 'منحدران',
    es: 'Dos pendientes',
    fr: 'Deux pentes',
    hi: 'दो ढलान',
    id: 'Dua lereng',
    pt: 'Duas rampas',
  },
  /** 화살표 · 높이 막대에 붙는 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.speed': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.translational': {
    ko: '½mv²',
    en: '½mv²',
    ja: '½mv²',
    zh: '½mv²',
    ar: '½mv²',
    es: '½mv²',
    fr: '½mv²',
    hi: '½mv²',
    id: '½mv²',
    pt: '½mv²',
  },
  'label.rotational': {
    ko: '½Iω²',
    en: '½Iω²',
    ja: '½Iω²',
    zh: '½Iω²',
    ar: '½Iω²',
    es: '½Iω²',
    fr: '½Iω²',
    hi: '½Iω²',
    id: '½Iω²',
    pt: '½Iω²',
  },
  'caption.enter': {
    ko: '같은 고리 둘이 같은 속력으로 달린다 — 왼쪽은 얼음 위를 돌지 않고 미끄러지고, 오른쪽은 구른다',
    en: 'Two identical hoops at the same speed — the left one slides on ice without turning, the right one rolls',
    ja: '同じ円環二つが同じ速さで走る — 左は氷の上を回らずに滑り、右は転がる',
    zh: '两个相同的圆环以相同速率运动 — 左边的在冰面上不转动地滑行，右边的在滚动',
    ar: 'حلقتان متماثلتان بالسرعة نفسها — اليسرى تنزلق على الجليد دون أن تدور، واليمنى تتدحرج',
    es: 'Dos aros idénticos a la misma rapidez — el de la izquierda se desliza sobre hielo sin girar; el de la derecha rueda',
    fr: 'Deux anneaux identiques à la même vitesse — celui de gauche glisse sur la glace sans tourner, celui de droite roule',
    hi: 'समान चाल से चलते दो एक जैसे वलय — बायाँ बर्फ़ पर बिना घूमे फिसलता है, दायाँ लुढ़कता है',
    id: 'Dua cincin identik dengan kelajuan sama — yang kiri meluncur di atas es tanpa berputar, yang kanan menggelinding',
    pt: 'Dois aros idênticos com a mesma velocidade — o da esquerda desliza no gelo sem girar, o da direita rola',
  },
  'caption.climb': {
    ko: '둘 다 같은 비탈을 오른다 — 구르는 고리는 오르면서 회전도 함께 느려진다',
    en: 'Both climb the same slope — as the rolling hoop rises, its spin slows too',
    ja: 'どちらも同じ斜面を上る — 転がる円環は上りながら回転も遅くなる',
    zh: '两者都爬上同样的斜面 — 滚动的圆环在上升时，转动也随之变慢',
    ar: 'تصعد الحلقتان المنحدر نفسه — ومع ارتفاع الحلقة المتدحرجة يتباطأ دورانها أيضًا',
    es: 'Ambos suben la misma pendiente — mientras el aro que rueda asciende, su giro también se frena',
    fr: 'Tous deux montent la même pente — à mesure que l’anneau qui roule s’élève, sa rotation ralentit aussi',
    hi: 'दोनों एक ही ढलान पर चढ़ते हैं — लुढ़कता वलय ऊपर उठते हुए अपना घूर्णन भी धीमा करता है',
    id: 'Keduanya mendaki lereng yang sama — saat cincin yang menggelinding naik, putarannya ikut melambat',
    pt: 'Os dois sobem a mesma rampa — enquanto o aro que rola sobe, seu giro também diminui',
  },
  'caption.climbRoll': {
    ko: '미끄러지던 고리는 이 높이에서 되돌아섰다 — 구르는 고리는 회전에 담긴 몫으로 더 오른다',
    en: 'The sliding hoop turned back at this height — the rolling one climbs on with what its spin held',
    ja: '滑っていた円環はこの高さで引き返した — 転がる円環は回転に蓄えていた分でさらに上る',
    zh: '滑行的圆环在这个高度折返了 — 滚动的圆环凭借转动中储存的那部分能量继续上升',
    ar: 'عادت الحلقة المنزلقة أدراجها عند هذا الارتفاع — أما المتدحرجة فتواصل الصعود بما كان يختزنه دورانها',
    es: 'El aro que se deslizaba dio la vuelta a esta altura — el que rueda sigue subiendo con lo que guardaba su giro',
    fr: 'L’anneau qui glissait a fait demi-tour à cette hauteur — celui qui roule continue de monter grâce à ce que stockait sa rotation',
    hi: 'फिसलता वलय इस ऊँचाई पर लौट पड़ा — लुढ़कता वलय अपने घूर्णन में संचित हिस्से से और ऊपर चढ़ता है',
    id: 'Cincin yang meluncur berbalik di ketinggian ini — yang menggelinding terus naik dengan bagian yang tersimpan dalam putarannya',
    pt: 'O aro que deslizava voltou nesta altura — o que rola continua subindo com o que seu giro guardava',
  },
  'caption.result': {
    ko: '같은 속력이었는데 구르던 고리가 두 배 높이 올랐다 — 회전에 같은 만큼이 더 담겨 있었다',
    en: 'Same speed, yet the rolling hoop climbed twice as high — its spin held as much again',
    ja: '同じ速さだったのに、転がっていた円環は2倍の高さまで上った — 回転に同じだけのエネルギーがさらに蓄えられていた',
    zh: '速率相同，滚动的圆环却升到了两倍的高度 — 转动中还另外储存了同样多的能量',
    ar: 'السرعة نفسها، ومع ذلك صعدت الحلقة المتدحرجة إلى ضعف الارتفاع — فقد اختزن دورانها قدرًا مساويًا إضافيًا',
    es: 'Misma rapidez, pero el aro que rodaba subió el doble de alto — su giro guardaba otro tanto',
    fr: 'Même vitesse, et pourtant l’anneau qui roulait est monté deux fois plus haut — sa rotation en stockait tout autant',
    hi: 'चाल समान थी, फिर भी लुढ़कता वलय दोगुनी ऊँचाई तक चढ़ा — उसके घूर्णन में उतनी ही ऊर्जा और संचित थी',
    id: 'Kelajuannya sama, tetapi cincin yang menggelinding naik dua kali lebih tinggi — putarannya menyimpan sebanyak itu lagi',
    pt: 'Mesma velocidade, mas o aro que rolava subiu duas vezes mais alto — seu giro guardava outro tanto',
  },
} satisfies Record<string, LocalizedText>);

export type RotationalKineticEnergyMessageKey = keyof typeof rotationalKineticEnergyMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RotationalKineticEnergyMessageKey): LocalizedText =>
  rotationalKineticEnergyMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RotationalKineticEnergyMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rotationalKineticEnergySchema: BundleSchema = {
  id: ROTATIONAL_KINETIC_ENERGY_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 달려 들어와 오르고, 되돌아 내려오고, 다시 들어온다.
  parameters: [],

  stages: [
    {
      id: 'two-hoops',
      label: text('label.stage'),
      constants: {
        gravity: GRAVITY,
        speed: SPEED,
        slopeDeg: SLOPE_DEG,
        radius: RADIUS,
        inertiaFactor: INERTIA_FACTOR,
      },
    },
  ],

  environments: [],

  views: [{ id: 'slopes', label: text('label.view'), default: true }],

  /**
   * 가로 7.1 m 에 두 판을 담고, 세로는 비탈 높이(1.33 m)와 캡션 줄뿐이다. 세로를 더
   * 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 겹침이 판정 장치다. 높이 막대 · 안내선은 **고리 아래** 로 깔려야 한다 — 되돌아
   * 내려오는 고리가 막대를 지나갈 때 막대가 고리를 가리면 고리가 끊겨 보인다. 층
   * 순서로는 `dimension` 이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 들어옴 → 둘 다 오름 → 구르는 고리만 오름 → 되돌아 내려옴 → 흐려짐.
   *
   * 단계 길이의 기본값을 물리에서 끌어온다. 미끄러지는 고리가 멈추는 순간(v / g sinθ)이
   * 곧 `climb` 의 끝이라 「이 높이에서 되돌아섰다」 는 캡션이 화면과 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'enter', duration: APPROACH, timeScale: SLOW_ENTER, caption: key('caption.enter') },
      { id: 'climb', duration: CLIMB_SLIDE, timeScale: SLOW_CLIMB, caption: key('caption.climb') },
      {
        id: 'climb-roll',
        duration: CLIMB_ROLL_EXTRA,
        timeScale: SLOW_CLIMB,
        caption: key('caption.climbRoll'),
      },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 고리가 판 안에서 비탈을 향해 달리는 자리에서
   * 연다. 0 이면 고리가 판 왼쪽 끝에 반쯤 잘려 있다.
   */
  startAt: 0.12,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **두 고리가 오른
   * 높이의 비**다. 높이는 판 앞의 막대가 직접 잰다.
   */

  messages: rotationalKineticEnergyMessages,
};
