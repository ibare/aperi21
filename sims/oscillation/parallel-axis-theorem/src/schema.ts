// ========================================================================
// parallel-axis-theorem — 선언
// ========================================================================
// 질문: 같은 물체인데 축만 옮기면 왜 돌리기 어려워지는가? 얼마나 어려워지는가?
//
// 답: 축이 질량 중심에서 d 만큼 떨어지면, 물체는 제자리에서 도는 동시에 질량
// 중심 전체가 축 둘레로 반지름 d 원을 돈다. 그 몫이 Md² 이고, 옮긴 축의 관성
// 모멘트는 질량 중심 축의 것에 그 조각이 얹힌 것이다.
//
// 화면에서는 같은 원판 둘을 같은 돌림힘으로 함께 돌린다 — 옮긴 축의 원판이
// 뒤처지고, 그 원판의 질량 중심이 그리는 원(강조색)과 막대 위에 얹힌 Md²
// 조각(강조색)이 같은 것을 가리킨다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:parallel-axis-theorem` 와 문자 그대로 일치한다 (C4). */
export const PARALLEL_AXIS_THEOREM_ID = 'parallel-axis-theorem';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 원판 질량(kg). 두 원판이 같다. */
export const MASS = 2;
/** 원판 반지름(m). 월드 1 단위 = 1 m. */
export const RADIUS = 0.5;
/** 두 축에 똑같이 거는 돌림힘(N·m). 가운데 축 원판이 돌림 단계 동안 약 290° 돈다. */
export const TORQUE = 0.16;

/**
 * 칩이 고르는 축 거리 d 를 반지름에 대한 비로 준다 — 0 · ½ · 1.
 *
 * 0 은 두 축이 같아지는 확인용이다. ½ 과 1 은 d 가 두 배일 때 얹히는 조각이
 * 네 배라는 것을 막대로 보인다.
 */
export const OFFSET_OPTIONS = [0, 0.5, 1] as const;
/** 도착했을 때의 d/R 기본값. 가장 또렷하게 갈리는 가장자리 축이다. 스테이지 상수 `offsetRatioDefault` 로 선언한다 (원칙 2). */
export const OFFSET_DEFAULT: number = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원판은 탁자 위에 눕혀 위에서 본다(중력 없음).
// ------------------------------------------------------------------------

/** 가운데 축 원판의 중심(= 축) x. */
export const CENTER_AXIS_X = -2.05;
/** 옮긴 축의 자리 x. 원판은 이 둘레로 반지름 d 원을 돈다. */
export const SHIFTED_AXIS_X = -0.3;
/** 두 축의 높이. */
export const AXIS_Y = 0.05;
/**
 * 옮긴 축 원판의 질량 중심이 처음 놓이는 방향(라디안) — 축의 오른쪽.
 * 돌면서 위로 올라가 왼쪽으로 넘어간다.
 */
export const OFFSET_START_ANGLE = 0;
/** 두 원판에 새긴 표시선의 처음 방향(라디안) — 위. 둘 다 같은 방향에서 출발한다. */
export const MARK_START_ANGLE = Math.PI / 2;

/** 돈 각을 쓰는 부채꼴 반지름(m). 두 축에 같은 크기라 각을 바로 견준다. */
export const SWEEP_RADIUS = 0.36;
/** 돌림힘 원호 화살표의 반지름(m). */
export const TORQUE_ARC_RADIUS = 0.15;

/** 원판 아래 이름표의 높이(월드 y). 가장 큰 자취(d = R) 아래에 둔다. */
export const NAME_Y = -1.02;

/** 관성 모멘트 막대 — 가운데 축 · 옮긴 축의 중심 x, 반너비, 바닥. */
export const BAR_CENTER_X = 1.3;
export const BAR_SHIFTED_X = 2.0;
export const BAR_HALF_W = 0.19;
export const BAR_BASE_Y = -0.8;
/** 가장 큰 막대(d = R)의 높이(m). 막대 비율은 이 높이에 맞춘다. */
export const BAR_FULL = 1.6;

/**
 * 프레이밍 — 왼쪽 원판 · 가운데 옮긴 축의 자취(반지름 d + R) · 오른쪽 막대 둘과 이름표.
 * 위쪽은 칩 줄, 아래쪽은 캡션 줄 자리까지 잡는다. 매 프레임 같은 값이다 (S-piece).
 */
export const SCENE_BOUNDS = { minX: -2.72, maxX: 2.62, minY: -1.34, maxY: 1.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const parallelAxisTheoremMessages = Object.freeze({
  'label.title': {
    ko: '평행축 정리',
    en: 'Parallel axis theorem',
    ja: '平行軸の定理',
    zh: '平行轴定理',
    ar: 'مبرهنة المحاور المتوازية',
    es: 'Teorema de los ejes paralelos',
    fr: 'Théorème des axes parallèles',
    hi: 'समांतर अक्ष प्रमेय',
    id: 'Teorema sumbu sejajar',
    pt: 'Teorema dos eixos paralelos',
  },
  'label.operation': {
    ko: '축을 옮길 때의 관성 모멘트',
    en: 'Moment of inertia when the axis is moved',
    ja: '軸をずらしたときの慣性モーメント',
    zh: '移动转轴时的转动惯量',
    ar: 'عزم القصور الذاتي عند إزاحة المحور',
    es: 'Momento de inercia al desplazar el eje',
    fr: 'Moment d’inertie quand on déplace l’axe',
    hi: 'अक्ष खिसकाने पर जड़त्व आघूर्ण',
    id: 'Momen inersia saat sumbu digeser',
    pt: 'Momento de inércia quando o eixo é deslocado',
  },
  'label.stage': {
    ko: '누운 원판',
    en: 'Flat disc',
    ja: '寝かせた円板',
    zh: '平放的圆盘',
    ar: 'قرص أفقي',
    es: 'Disco horizontal',
    fr: 'Disque à plat',
    hi: 'सपाट रखी डिस्क',
    id: 'Cakram mendatar',
    pt: 'Disco deitado',
  },
  'label.view': {
    ko: '두 축',
    en: 'Two axes',
    ja: '二つの軸',
    zh: '两条轴',
    ar: 'محوران',
    es: 'Dos ejes',
    fr: 'Deux axes',
    hi: 'दो अक्ष',
    id: 'Dua sumbu',
    pt: 'Dois eixos',
  },

  /** 원판과 막대 아래 이름. 두 곳이 같은 이름을 쓴다 — 같은 대상이다. */
  'label.centerAxis': {
    ko: '질량 중심 축',
    en: 'Centre axis',
    ja: '重心を通る軸',
    zh: '质心轴',
    ar: 'محور مركز الكتلة',
    es: 'Eje del centro de masa',
    fr: 'Axe du centre de masse',
    hi: 'द्रव्यमान केंद्र अक्ष',
    id: 'Sumbu pusat massa',
    pt: 'Eixo do centro de massa',
  },
  'label.shiftedAxis': {
    ko: '옮긴 축',
    en: 'Moved axis',
    ja: 'ずらした軸',
    zh: '移动后的轴',
    ar: 'المحور المُزاح',
    es: 'Eje desplazado',
    fr: 'Axe déplacé',
    hi: 'खिसकाया गया अक्ष',
    id: 'Sumbu yang digeser',
    pt: 'Eixo deslocado',
  },
  /** 기호 — 번역 대상이 아니다 (C1 판정 3). */
  'label.d': {
    ko: 'd',
    en: 'd',
    ja: 'd',
    zh: 'd',
    ar: 'd',
    es: 'd',
    fr: 'd',
    hi: 'd',
    id: 'd',
    pt: 'd',
  },
  'label.torque': {
    ko: 'τ',
    en: 'τ',
    ja: 'τ',
    zh: 'τ',
    ar: 'τ',
    es: 'τ',
    fr: 'τ',
    hi: 'τ',
    id: 'τ',
    pt: 'τ',
  },
  'label.icm': {
    ko: 'I_cm',
    en: 'I_cm',
    ja: 'I_cm',
    zh: 'I_cm',
    ar: 'I_cm',
    es: 'I_cm',
    fr: 'I_cm',
    hi: 'I_cm',
    id: 'I_cm',
    pt: 'I_cm',
  },
  'label.md2': {
    ko: '+ Md²',
    en: '+ Md²',
    ja: '+ Md²',
    zh: '+ Md²',
    ar: '+ Md²',
    es: '+ Md²',
    fr: '+ Md²',
    hi: '+ Md²',
    id: '+ Md²',
    pt: '+ Md²',
  },

  'control.offset': {
    ko: '축 거리',
    en: 'Axis offset',
    ja: '軸の距離',
    zh: '轴的距离',
    ar: 'إزاحة المحور',
    es: 'Desplazamiento del eje',
    fr: 'Décalage de l’axe',
    hi: 'अक्ष की दूरी',
    id: 'Jarak sumbu',
    pt: 'Deslocamento do eixo',
  },
  /** 칩 글자. 기호 조립이라 번역 대상이 아니다 (C1 판정 3). */
  'option.d0': {
    ko: 'd = 0',
    en: 'd = 0',
    ja: 'd = 0',
    zh: 'd = 0',
    ar: 'd = 0',
    es: 'd = 0',
    fr: 'd = 0',
    hi: 'd = 0',
    id: 'd = 0',
    pt: 'd = 0',
  },
  'option.dHalf': {
    ko: 'd = R/2',
    en: 'd = R/2',
    ja: 'd = R/2',
    zh: 'd = R/2',
    ar: 'd = R/2',
    es: 'd = R/2',
    fr: 'd = R/2',
    hi: 'd = R/2',
    id: 'd = R/2',
    pt: 'd = R/2',
  },
  'option.dFull': {
    ko: 'd = R',
    en: 'd = R',
    ja: 'd = R',
    zh: 'd = R',
    ar: 'd = R',
    es: 'd = R',
    fr: 'd = R',
    hi: 'd = R',
    id: 'd = R',
    pt: 'd = R',
  },

  'caption.spin': {
    ko: '같은 원판에 같은 돌림힘 τ 를 건다. 축을 d 만큼 옮긴 쪽이 뒤처진다 — 질량 중심까지 축 둘레로 끌고 돌아야 한다.',
    en: 'Same disc, same torque τ. The one on the moved axis falls behind — it has to drag its centre of mass around the axis too.',
    ja: '同じ円板に同じトルク τ。ずらした軸のほうが遅れる — 重心まで軸のまわりに引き回さなければならない。',
    zh: '同样的圆盘，同样的力矩 τ。绕移动后的轴转的那个落在后面 — 它还得拖着质心绕轴转。',
    ar: 'القرص نفسه وعزم الدوران نفسه τ. القرص الذي على المحور المُزاح يتأخر — فعليه أن يجرّ مركز كتلته حول المحور أيضًا.',
    es: 'Mismo disco, mismo torque τ. El del eje desplazado se queda atrás — también tiene que arrastrar su centro de masa alrededor del eje.',
    fr: 'Même disque, même couple τ. Celui sur l’axe déplacé prend du retard — il doit aussi entraîner son centre de masse autour de l’axe.',
    hi: 'वही डिस्क, वही बल-आघूर्ण τ। खिसकाए गए अक्ष वाली डिस्क पिछड़ जाती है — उसे अपने द्रव्यमान केंद्र को भी अक्ष के चारों ओर घुमाना पड़ता है।',
    id: 'Cakram sama, torsi sama τ. Yang pada sumbu yang digeser tertinggal — ia juga harus menyeret pusat massanya mengelilingi sumbu.',
    pt: 'Mesmo disco, mesmo torque τ. O do eixo deslocado fica para trás — ele também precisa arrastar seu centro de massa em volta do eixo.',
  },
  'caption.hold': {
    ko: '옮긴 축의 막대는 질량 중심 축의 막대 위에 Md² 한 조각이 얹힌 것이다 — 질량 중심이 반지름 d 원을 도는 몫이다.',
    en: 'The moved-axis bar is the centre-axis bar with one Md² piece on top — the share of the centre of mass circling at radius d.',
    ja: 'ずらした軸の棒は、重心を通る軸の棒の上に Md² のひと切れが載ったものだ — 重心が半径 d の円を回る分だ。',
    zh: '移动后的轴的柱条，就是质心轴的柱条上再叠一块 Md² — 这是质心沿半径 d 的圆转动所占的份额。',
    ar: 'عمود المحور المُزاح هو عمود محور مركز الكتلة وفوقه قطعة Md² واحدة — وهي نصيب دوران مركز الكتلة على دائرة نصف قطرها d.',
    es: 'La barra del eje desplazado es la barra del eje del centro de masa con una pieza Md² encima — la parte del centro de masa que gira con radio d.',
    fr: 'La barre de l’axe déplacé est celle de l’axe du centre de masse avec un morceau Md² posé dessus — la part du centre de masse qui tourne sur un cercle de rayon d.',
    hi: 'खिसकाए गए अक्ष का स्तंभ, द्रव्यमान केंद्र अक्ष के स्तंभ के ऊपर रखा Md² का एक टुकड़ा है — यह त्रिज्या d के वृत्त पर घूमते द्रव्यमान केंद्र का हिस्सा है।',
    id: 'Batang sumbu yang digeser adalah batang sumbu pusat massa dengan satu potong Md² di atasnya — bagian dari pusat massa yang berputar pada jari-jari d.',
    pt: 'A barra do eixo deslocado é a barra do eixo do centro de massa com um pedaço Md² em cima — a parcela do centro de massa girando em raio d.',
  },
  'caption.same': {
    ko: 'd = 0 이면 두 축이 같은 자리다. 얹히는 조각이 없고 두 원판이 나란히 돈다.',
    en: 'With d = 0 the two axes coincide. Nothing is added and the two discs turn together.',
    ja: 'd = 0 なら二つの軸は同じ位置だ。載る分はなく、二つの円板は並んで回る。',
    zh: 'd = 0 时两条轴重合。没有叠加的部分，两个圆盘并排转动。',
    ar: 'عندما d = 0 ينطبق المحوران. لا يُضاف شيء، ويدور القرصان معًا.',
    es: 'Con d = 0 los dos ejes coinciden. No se añade nada y los dos discos giran juntos.',
    fr: 'Avec d = 0, les deux axes coïncident. Rien ne s’ajoute et les deux disques tournent ensemble.',
    hi: 'd = 0 होने पर दोनों अक्ष एक ही जगह होते हैं। कुछ नहीं जुड़ता और दोनों डिस्क साथ-साथ घूमती हैं।',
    id: 'Dengan d = 0 kedua sumbu berimpit. Tidak ada yang ditambahkan dan kedua cakram berputar bersama.',
    pt: 'Com d = 0 os dois eixos coincidem. Nada é somado e os dois discos giram juntos.',
  },
} satisfies Record<string, LocalizedText>);

export type ParallelAxisTheoremMessageKey = keyof typeof parallelAxisTheoremMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ParallelAxisTheoremMessageKey): LocalizedText =>
  parallelAxisTheoremMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ParallelAxisTheoremMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const parallelAxisTheoremSchema: BundleSchema = {
  id: PARALLEL_AXIS_THEOREM_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'flat-disc',
      label: text('label.stage'),
      constants: { mass: MASS, radius: RADIUS, torque: TORQUE, offsetRatioDefault: OFFSET_DEFAULT },
    },
  ],
  environments: [],
  views: [{ id: 'two-axes', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 원판 둘과 막대 둘이 한 줄에 선다. 세로는 옮긴 축의 자취 지름이 정한다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 부채꼴을 먼저 깔고, 원판 테두리 · 표시선 · 축을 그 위에.
   * 층 순서로는 `sector` 가 원판 위로 올라와 표시선을 덮는다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 둘이 돌고 있고 벌써 조금 갈라져 있다 (S-piece). */
  startAt: 1.8,

  /**
   * 한 주기 8.4 초.
   *
   * - `spin` — 두 원판을 같은 돌림힘으로 멈춘 자리에서 함께 돌린다. 진행도가 곧 흐른
   *   시간이라(linear) 각이 시간의 제곱으로 자란다.
   * - `hold` — 돌림을 멈춘 채 둔다. 뒤처진 각과 막대 위 조각을 견줄 시간이다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'spin', duration: 4, ease: 'linear', caption: key('caption.spin') },
      { id: 'hold', duration: 3.8, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  /** 슬롯 하나. d = 0 을 고르면 「뒤처진다」 가 거짓이 되므로 상태로 문안을 바꾼다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [{ when: 'sameAxis', text: key('caption.same') }],
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것은 도는 각과 막대 높이이고
  // 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: parallelAxisTheoremMessages,
};
