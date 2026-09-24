// ========================================================================
// two-body-problem — 선언
// ========================================================================
// 질문: 별과 행성, 지구와 달 — 「큰 쪽은 가만히 있고 작은 쪽만 돈다」 는 맞는가.
//
// 아니다. 두 천체는 늘 질량 중심을 사이에 두고 반대편에 서서 **같은 주기로** 돈다.
// 반지름은 질량에 반비례한다(m₁r₁ = m₂r₂). 질량이 같으면 같은 원, 한쪽이 무거울수록
// 그쪽 원이 작아지고, 충분히 무거우면 질량 중심이 그 천체 속으로 들어간다 — 그때
// 큰 쪽이 가만히 있는 것처럼 보이는 것이다.
//
// 질량비는 시간표가 넘긴다(1 : 1 → 3 : 1 → 12 : 1 → 다시 1 : 1). 두 천체의 질량 합과
// 사이 거리는 그대로 두므로 한 바퀴 시간도 그대로다 — 바뀌는 것은 두 원의 몫뿐이다.
//
// 별이 흔들리는 것으로 행성을 찾는 일(광곡선 · 도플러)은 `exoplanet-detection` 의 몫이다.
// 고정된 중심 둘레의 원은 `circular-orbit` 이 했다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:two-body-problem` 와 문자 그대로 일치한다 (C4). */
export const TWO_BODY_PROBLEM_ID = 'two-body-problem';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 천체 사이 거리(월드 단위). 내내 그대로다 — 두 반지름의 합이 늘 이 값이다. */
export const SEPARATION = 2.6;
/** 가벼운 천체의 질량(상대값). 질량비 표시의 오른쪽 수다. */
export const MASS_LIGHT = 1;
/** 첫 단계 — 무거운 쪽 질량(상대값). 가벼운 쪽과 같다. */
export const MASS_EQUAL = 1;
/** 둘째 단계 — 무거운 쪽 질량(상대값). */
export const MASS_MID = 3;
/** 셋째 단계 — 무거운 쪽 질량(상대값). 질량 중심이 그 천체 속으로 들어갈 만큼 크다. */
export const MASS_HEAVY = 12;
/** 한 주기(시간표 한 바퀴) 동안 두 천체가 도는 바퀴 수. 정수라야 주기 끝에서 튀지 않는다. */
export const TURNS_PER_CYCLE = 5;
/**
 * 천체 반지름 배율(월드 단위). 반지름 = 배율 × (질량 몫)^(1/3) — 밀도가 같다고 보고 부피를
 * 질량에 비례시킨다. 12 : 1 에서 무거운 천체가 질량 중심을 덮을 만큼 크게 잡았다.
 */
export const BODY_SCALE = 0.36;
/** 주기 첫 순간 가벼운 천체가 선 자리(도, 질량 중심에서 +x 반시계). */
export const START_ANGLE_DEG = 20;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 질량 중심이 원점이다.
// ------------------------------------------------------------------------

/** 캡션 · 질량비 표시가 서는 자리(월드 x). 가장 큰 궤도의 오른쪽이다. */
export const TEXT_X = 3.0;
/** 질량비 표시 줄의 높이(월드 y). */
export const MASS_ROW_Y = 1.7;
/** 반지름비 표시 줄의 높이(월드 y). */
export const RADIUS_ROW_Y = 1.2;

/**
 * 프레이밍은 주장의 일부다. 세로 · 가로 왼쪽은 12 : 1 에서 가장 멀리 나가는 가벼운 천체의
 * 원(반지름 2.4 + 천체 0.15 ≈ 2.55)까지, 오른쪽은 캡션 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.6, maxX: 7.4, minY: -2.6, maxY: 2.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const twoBodyProblemMessages = Object.freeze({
  'label.title': {
    ko: '이체 문제',
    en: 'Two-body problem',
    ja: '二体問題',
    zh: '二体问题',
    ar: 'مسألة الجسمين',
    es: 'Problema de los dos cuerpos',
    fr: 'Problème à deux corps',
    hi: 'द्वि-पिंड समस्या',
    id: 'Masalah dua benda',
    pt: 'Problema de dois corpos',
  },
  'label.operation': {
    ko: '질량 중심 둘레를 도는 두 천체',
    en: 'Two bodies orbiting their common center of mass',
    ja: '共通の重心のまわりを回る二つの天体',
    zh: '绕共同质心公转的两个天体',
    ar: 'جرمان يدوران حول مركز كتلتهما المشترك',
    es: 'Dos cuerpos que orbitan su centro de masa común',
    fr: 'Deux corps en orbite autour de leur centre de masse commun',
    hi: 'अपने साझा द्रव्यमान केंद्र की परिक्रमा करते दो पिंड',
    id: 'Dua benda yang mengorbit pusat massa bersamanya',
    pt: 'Dois corpos orbitando seu centro de massa comum',
  },
  'label.stage': {
    ko: '두 천체',
    en: 'Two bodies',
    ja: '二つの物体',
    zh: '两个物体',
    ar: 'جسمان',
    es: 'Dos cuerpos',
    fr: 'Deux corps',
    hi: 'दो पिंड',
    id: 'Dua benda',
    pt: 'Dois corpos',
  },
  'label.view': {
    ko: '궤도',
    en: 'Orbits',
    ja: '軌道',
    zh: '轨道',
    ar: 'المداران',
    es: 'Órbitas',
    fr: 'Orbites',
    hi: 'कक्षाएँ',
    id: 'Orbit',
    pt: 'Órbitas',
  },
  'label.barycenter': {
    ko: '질량 중심',
    en: 'center of mass',
    ja: '重心',
    zh: '质心',
    ar: 'مركز الكتلة',
    es: 'centro de masa',
    fr: 'centre de masse',
    hi: 'द्रव्यमान केंद्र',
    id: 'pusat massa',
    pt: 'centro de massa',
  },
  /** 값이 끼어드는 조립문이라 문안이다 (C1). 무거운 쪽을 앞에 쓴다. */
  'label.massRatio': {
    ko: '질량 {heavy} : {light}',
    en: 'mass {heavy} : {light}',
    ja: '質量 {heavy} : {light}',
    zh: '质量 {heavy} : {light}',
    ar: 'الكتلة {heavy} : {light}',
    es: 'masa {heavy} : {light}',
    fr: 'masse {heavy} : {light}',
    hi: 'द्रव्यमान {heavy} : {light}',
    id: 'massa {heavy} : {light}',
    pt: 'massa {heavy} : {light}',
  },
  /** 같은 순서(무거운 쪽 먼저)로 쓰면 수가 뒤집힌다 — 그 뒤집힘이 반비례다. */
  'label.radiusRatio': {
    ko: '반지름 {light} : {heavy}',
    en: 'radius {light} : {heavy}',
    ja: '半径 {light} : {heavy}',
    zh: '半径 {light} : {heavy}',
    ar: 'نصف القطر {light} : {heavy}',
    es: 'radio {light} : {heavy}',
    fr: 'rayon {light} : {heavy}',
    hi: 'त्रिज्या {light} : {heavy}',
    id: 'jari-jari {light} : {heavy}',
    pt: 'raio {light} : {heavy}',
  },
  'caption.equal': {
    ko: '질량이 같으면 두 천체는 같은 원을 그린다 — 질량 중심을 사이에 두고 늘 마주 본 채로',
    en: 'With equal masses the two bodies trace the same circle — always facing each other across the center of mass',
    ja: '質量が同じなら二つの天体は同じ円を描く — 重心をはさんでいつも向かい合ったまま',
    zh: '质量相同时，两个天体画出同一个圆 — 始终隔着质心相对',
    ar: 'عندما تتساوى الكتلتان يرسم الجرمان الدائرة نفسها — متقابلين دائمًا عبر مركز الكتلة',
    es: 'Con masas iguales, los dos cuerpos trazan el mismo círculo — siempre frente a frente a través del centro de masa',
    fr: 'À masses égales, les deux corps tracent le même cercle — toujours face à face de part et d’autre du centre de masse',
    hi: 'द्रव्यमान बराबर हों तो दोनों पिंड एक ही वृत्त बनाते हैं — द्रव्यमान केंद्र के आर-पार हमेशा आमने-सामने',
    id: 'Dengan massa sama, kedua benda menjejak lingkaran yang sama — selalu berhadapan di seberang pusat massa',
    pt: 'Com massas iguais, os dois corpos traçam o mesmo círculo — sempre frente a frente, com o centro de massa entre eles',
  },
  'caption.shift': {
    ko: '한쪽이 무거워질수록 그쪽 원은 작아지고, 가벼운 쪽 원은 커진다',
    en: "As one grows heavier its circle shrinks, and the lighter one's circle grows",
    ja: '一方が重くなるほどその円は小さくなり、軽いほうの円は大きくなる',
    zh: '一方变得越重，它的圆就越小，较轻一方的圆则变大',
    ar: 'كلما ازداد أحدهما ثقلًا صغرت دائرته، وكبرت دائرة الأخف',
    es: 'A medida que uno se vuelve más pesado su círculo se encoge, y el del más ligero crece',
    fr: 'Quand l’un s’alourdit, son cercle rétrécit, et celui du plus léger grandit',
    hi: 'एक जितना भारी होता है, उसका वृत्त उतना छोटा होता जाता है और हल्के का वृत्त बड़ा',
    id: 'Makin berat salah satunya, makin kecil lingkarannya, dan lingkaran yang lebih ringan membesar',
    pt: 'À medida que um fica mais pesado, seu círculo encolhe, e o do mais leve cresce',
  },
  'caption.mid': {
    ko: '질량이 몇 배면 반지름은 그만큼 짧다 — 그래도 둘은 같은 주기로, 반대편에서 돈다',
    en: 'So many times the mass, so many times shorter the radius — yet both go round in the same time, on opposite sides',
    ja: '質量が何倍なら半径はその分だけ短い — それでも二つは同じ周期で、反対側を回る',
    zh: '质量是几倍，半径就短几倍 — 但两者仍以相同周期在相对两侧运转',
    ar: 'كم ضعفًا في الكتلة، كم ضعفًا أقصر في نصف القطر — ومع ذلك يدور الاثنان في الزمن نفسه، على جانبين متقابلين',
    es: 'Tantas veces la masa, tantas veces más corto el radio — pero ambos dan la vuelta en el mismo tiempo, en lados opuestos',
    fr: 'Tant de fois la masse, tant de fois plus court le rayon — pourtant tous deux font le tour dans le même temps, de part et d’autre',
    hi: 'द्रव्यमान जितने गुना, त्रिज्या उतने गुना छोटी — फिर भी दोनों एक ही समय में, आमने-सामने की ओर से चक्कर लगाते हैं',
    id: 'Massa sekian kali lipat, jari-jari sekian kali lebih pendek — namun keduanya berputar dalam waktu yang sama, di sisi yang berseberangan',
    pt: 'Tantas vezes a massa, tantas vezes mais curto o raio — mas os dois dão a volta no mesmo tempo, em lados opostos',
  },
  'caption.heavy': {
    ko: '훨씬 무거우면 질량 중심이 그 천체 속으로 들어간다 — 가만히 있는 듯해도 작은 원을 그리며 흔들린다',
    en: 'Much heavier, and the center of mass sinks inside it — it seems to sit still, yet it wobbles round a small circle',
    ja: 'ずっと重いと重心がその天体の中に入る — じっとしているようでも小さな円を描いて揺れている',
    zh: '重得多时，质心沉入这个天体内部 — 它看似静止，其实在绕一个小圆晃动',
    ar: 'وإذا كان أثقل بكثير غاص مركز الكتلة داخله — يبدو ساكنًا، لكنه يتمايل على دائرة صغيرة',
    es: 'Mucho más pesado, y el centro de masa se hunde dentro de él — parece quieto, pero se bambolea en un pequeño círculo',
    fr: 'Bien plus lourd, et le centre de masse s’enfonce en lui — il semble immobile, mais il oscille sur un petit cercle',
    hi: 'बहुत भारी हो तो द्रव्यमान केंद्र उसके भीतर चला जाता है — वह स्थिर-सा लगता है, फिर भी एक छोटे वृत्त पर डगमगाता है',
    id: 'Jauh lebih berat, dan pusat massa tenggelam di dalamnya — tampak diam, padahal bergoyang mengitari lingkaran kecil',
    pt: 'Muito mais pesado, e o centro de massa afunda dentro dele — parece parado, mas balança em um pequeno círculo',
  },
  'caption.back': {
    ko: '질량이 다시 같아지면 두 원도 다시 같아진다',
    en: 'Make the masses equal again, and the two circles match again',
    ja: '質量が再び同じになると、二つの円もまた同じになる',
    zh: '质量再次相等，两个圆也再次一样大',
    ar: 'اجعل الكتلتين متساويتين من جديد، فتتطابق الدائرتان من جديد',
    es: 'Iguala de nuevo las masas, y los dos círculos vuelven a coincidir',
    fr: 'Rendez les masses de nouveau égales, et les deux cercles redeviennent pareils',
    hi: 'द्रव्यमान फिर बराबर करें, तो दोनों वृत्त फिर एक जैसे हो जाते हैं',
    id: 'Samakan lagi massanya, dan kedua lingkaran kembali sama',
    pt: 'Iguale de novo as massas, e os dois círculos voltam a coincidir',
  },
} satisfies Record<string, LocalizedText>);

export type TwoBodyProblemMessageKey = keyof typeof twoBodyProblemMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TwoBodyProblemMessageKey): LocalizedText => twoBodyProblemMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TwoBodyProblemMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const twoBodyProblemSchema: BundleSchema = {
  id: TWO_BODY_PROBLEM_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 질량비는 시간표가 세 값을 차례로 보인다 — 끌게 하면 「어느 값에서
  // 중심이 천체 속으로 들어가나」 를 찾는 다른 놀이가 되고, 자동 진행만으로 주장이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'pair',
      label: text('label.stage'),
      constants: {
        separation: SEPARATION,
        massLight: MASS_LIGHT,
        massEqual: MASS_EQUAL,
        massMid: MASS_MID,
        massHeavy: MASS_HEAVY,
        turnsPerCycle: TURNS_PER_CYCLE,
        bodyScale: BODY_SCALE,
        startAngle: START_ANGLE_DEG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'orbits', label: text('label.view'), default: true }],

  /** 궤도를 왼쪽에, 질량비 · 캡션을 오른쪽에 둬 세로를 아낀다 (S-piece — 세로가 비싸다). */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서가 뜻을 갖는다 — 궤도 원과 잇는 선은 천체 아래로, 질량 중심 표지는 천체
   * **위**로 지나야 12 : 1 에서 「무거운 천체 속에 들어갔다」 가 보인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 20 초 = 다섯 바퀴(`turnsPerCycle`). 한 바퀴 4 초.
   *
   * - `equal` · `mid` · `heavy` 에서 질량비는 스테이지 상수 `massEqual` · `massMid` · `massHeavy`
   *   (가벼운 쪽 `massLight`)에 머문다.
   * - `shift` · `deepen` · `back` 동안 질량비가 다음 값으로 옮겨 가고, 두 원이 그만큼 서로
   *   크기를 주고받는다. 도는 것은 멈추지 않는다.
   * - 각속도는 「주기 / 바퀴 수」 에서 나온다 — 단계를 늘이면 도는 빠르기도 따라 바뀐다(G129).
   */
  timeline: {
    phases: [
      { id: 'equal', duration: 4.4, caption: key('caption.equal') },
      { id: 'shift', duration: 1.6, ease: 'smooth', caption: key('caption.shift') },
      { id: 'mid', duration: 5.2, caption: key('caption.mid') },
      { id: 'deepen', duration: 1.6, ease: 'smooth', caption: key('caption.shift') },
      { id: 'heavy', duration: 5.6, caption: key('caption.heavy') },
      { id: 'back', duration: 1.6, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다. */
  startAt: 1,

  // 슬롯 하나. 궤도 오른쪽, 질량비 표시 아래에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: [TEXT_X, 0.2] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 320,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리의 값이 아니라 두 원의 **몫**이고,
   * 그 몫은 질량비 · 반지름비 표시가 수로 말한다.
   */

  messages: twoBodyProblemMessages,
};
