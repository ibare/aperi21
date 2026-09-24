// ========================================================================
// superposition — 선언
// ========================================================================
// 질문: 두 파동이 한 자리에서 만나면 서로 부딪혀 모양이 바뀌는가?
//
// 줄 두 가닥에서 펄스 둘이 양끝에서 마주 온다. 위 줄은 둘 다 위로 솟은 펄스,
// 아래 줄은 하나는 위로 · 하나는 아래로 꺼진 펄스다. 겹치는 동안 줄의 모양은 두
// 펄스의 변위를 **점마다 더한 것** 이라 위 줄은 높아지고 아래 줄은 납작해진다.
// 지나간 뒤에는 두 펄스가 **처음 모양 그대로** 제 갈 길을 간다 — 좁고 높은 펄스가
// 오른쪽으로 빠져나가는 것이 「서로를 바꾸지 않았다」 의 증거다.
//
// 위상차 일반론(보강 · 상쇄, constructive-destructive)과 역위상 소음 제거
// (noise-cancellation)는 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:superposition` 와 문자 그대로 일치한다 (C4). */
export const SUPERPOSITION_ID = 'superposition';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 줄 위의 거리(칸)다. 진폭도 같은 단위라 모양이 찌그러지지 않는다.
// ------------------------------------------------------------------------

/** 펄스 A(왼쪽에서 오는 것)의 높이 · 폭(밑변 전체). 좁고 높다. */
export const AMP_A = 1.5;
export const WIDTH_A = 1.3;
/**
 * 펄스 B(오른쪽에서 오는 것)의 높이 · 폭. A 보다 낮고 두 배 넓다 — 두 펄스의 모양이
 * 달라야 지나간 뒤 「어느 것이 어디로 갔는가」 가 읽힌다. 모양이 같으면 서로 튕겨
 * 돌아간 것과 통과한 것이 화면에서 똑같다.
 */
export const AMP_B = 0.9;
export const WIDTH_B = 2.6;
/** 두 펄스의 속력(칸/초). 같은 줄이라 같다. */
export const SPEED = 1.5;
/** 출발할 때 두 펄스 중심이 줄 가운데에서 떨어진 거리(칸). 좌우 대칭이다. */
export const START_OFFSET = 4.6;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이는 위 물리가 정한다 (경계 상수를 따로 두지 않는다)
// ------------------------------------------------------------------------

/** 두 펄스 가장자리가 닿는 순간 · 중심이 포개지는 순간 · 떨어지는 순간 · 제자리(±출발 거리)에 닿는 순간. */
const HALF_SPAN = (WIDTH_A + WIDTH_B) / 4;
const TOUCH = (START_OFFSET - HALF_SPAN) / SPEED;
const COINCIDE = START_OFFSET / SPEED;
const PART = (START_OFFSET + HALF_SPAN) / SPEED;
const ARRIVE = (2 * START_OFFSET) / SPEED;

/** 주기 처음 펄스가 나타나는 동안(초). 이 동안도 펄스는 움직인다. */
export const APPEAR = 0.5;
/** 포개진 순간에 멈춰 두는 동안(초). 겹친 모양과 더하기 화살표를 읽을 시간이다. */
export const PEAK_HOLD = 1.6;
/** 주기 끝에 흐려지는 동안(초). */
export const FADE = 0.6;
/** 겹치는 동안 재생 속도. 실시간 1.3 초는 「점마다 더해진다」 를 눈으로 따라가기 짧다. */
export const SLOW_MOTION = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 칸. 두 줄을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 줄의 양끝(가로). 출발한 펄스의 바깥 끝(4.6 + 1.3)이 안에 든다. */
export const STRING_HALF = 6.2;
/** 위 줄(위 · 위) · 아래 줄(위 · 아래)의 평형 높이. */
export const LANE_SAME_Y = 0.95;
export const LANE_OPPOSITE_Y = -2;

/**
 * 프레이밍은 주장의 일부다. 가로는 줄 양끝, 세로는 위 줄의 가장 높은 합(A + B = 2.4)
 * 바로 위부터 아래 줄의 가장 깊은 골(−0.9) 아래와 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.5, maxX: 6.5, minY: -3.7, maxY: 3.5 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const superpositionMessages = Object.freeze({
  'label.title': {
    ko: '중첩 원리',
    en: 'Superposition',
    ja: '重ね合わせ',
    zh: '叠加',
    ar: 'التراكب',
    es: 'Superposición',
    fr: 'Superposition',
    hi: 'अध्यारोपण',
    id: 'Superposisi',
    pt: 'Superposição',
  },
  'label.operation': {
    ko: '파동이 겹칠 때의 합',
    en: 'What happens when waves overlap',
    ja: '波が重なるとき何が起こるか',
    zh: '波相互重叠时会发生什么',
    ar: 'ماذا يحدث حين تتداخل الموجات',
    es: 'Qué ocurre cuando las ondas se superponen',
    fr: 'Ce qui se passe quand des ondes se superposent',
    hi: 'तरंगें एक-दूसरे पर पड़ें तो क्या होता है',
    id: 'Apa yang terjadi ketika gelombang saling bertumpuk',
    pt: 'O que acontece quando ondas se sobrepõem',
  },
  'label.stage': {
    ko: '마주 오는 두 펄스',
    en: 'Two pulses meeting',
    ja: '出会う二つのパルス',
    zh: '相遇的两个脉冲',
    ar: 'نبضتان تلتقيان',
    es: 'Dos pulsos que se encuentran',
    fr: 'Deux impulsions qui se rencontrent',
    hi: 'मिलते हुए दो स्पंद',
    id: 'Dua pulsa yang bertemu',
    pt: 'Dois pulsos que se encontram',
  },
  'label.view': {
    ko: '두 줄',
    en: 'Two strings',
    ja: '二本の弦',
    zh: '两根绳',
    ar: 'وتران',
    es: 'Dos cuerdas',
    fr: 'Deux cordes',
    hi: 'दो डोरियाँ',
    id: 'Dua tali',
    pt: 'Duas cordas',
  },
  /** 펄스 이름. 도식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.pulseA': { ko: 'A', en: 'A', ja: 'A', zh: 'A', ar: 'A', es: 'A', fr: 'A', hi: 'A', id: 'A', pt: 'A' },
  'label.pulseB': { ko: 'B', en: 'B', ja: 'B', zh: 'B', ar: 'B', es: 'B', fr: 'B', hi: 'B', id: 'B', pt: 'B' },
  'caption.approach': {
    ko: '두 펄스가 줄 양끝에서 서로를 향해 온다 — 위 줄은 둘 다 위로, 아래 줄은 하나가 아래로',
    en: 'Two pulses travel toward each other — on the top string both point up, on the bottom one points down',
    ja: '二つのパルスが互いに向かって進む — 上の弦では両方が上向き、下の弦では一つが下向き',
    zh: '两个脉冲相向而行 — 上面的绳上两个都朝上，下面的绳上有一个朝下',
    ar: 'نبضتان تتجهان نحو بعضهما — على الوتر العلوي تشير كلتاهما إلى الأعلى، وعلى السفلي تشير إحداهما إلى الأسفل',
    es: 'Dos pulsos avanzan uno hacia el otro — en la cuerda de arriba ambos apuntan hacia arriba, en la de abajo uno apunta hacia abajo',
    fr: 'Deux impulsions avancent l’une vers l’autre — sur la corde du haut, les deux pointent vers le haut ; sur celle du bas, l’une pointe vers le bas',
    hi: 'दो स्पंद एक-दूसरे की ओर बढ़ते हैं — ऊपर की डोरी पर दोनों ऊपर की ओर, नीचे की डोरी पर एक नीचे की ओर',
    id: 'Dua pulsa bergerak saling mendekat — pada tali atas keduanya mengarah ke atas, pada tali bawah satu mengarah ke bawah',
    pt: 'Dois pulsos avançam um em direção ao outro — na corda de cima os dois apontam para cima, na de baixo um aponta para baixo',
  },
  'caption.overlap': {
    ko: '겹친 자리에서는 두 변위가 점마다 더해진다 — 위 줄은 높아지고 아래 줄은 납작해진다',
    en: 'Where they overlap, the two displacements add point by point — the top string rises, the bottom one flattens',
    ja: '重なった所では二つの変位が点ごとに足し合わされる — 上の弦は高くなり、下の弦は平らになる',
    zh: '在重叠处，两个位移逐点相加 — 上面的绳升高，下面的绳变平',
    ar: 'حيث تتداخلان تُجمَع الإزاحتان نقطةً نقطة — يرتفع الوتر العلوي ويتسطّح السفلي',
    es: 'Donde se superponen, los dos desplazamientos se suman punto a punto — la cuerda de arriba sube, la de abajo se aplana',
    fr: 'Là où elles se superposent, les deux déplacements s’additionnent point par point — la corde du haut s’élève, celle du bas s’aplatit',
    hi: 'जहाँ वे एक-दूसरे पर पड़ते हैं, वहाँ दोनों विस्थापन बिंदु-दर-बिंदु जुड़ते हैं — ऊपर की डोरी ऊँची होती है, नीचे की चपटी हो जाती है',
    id: 'Di tempat keduanya bertumpuk, dua simpangan dijumlahkan titik demi titik — tali atas meninggi, tali bawah mendatar',
    pt: 'Onde eles se sobrepõem, os dois deslocamentos se somam ponto a ponto — a corda de cima sobe, a de baixo se achata',
  },
  'caption.depart': {
    ko: '지나간 뒤 두 펄스는 처음 모양 그대로 제 갈 길을 간다',
    en: 'Once past each other, both pulses carry on with exactly their original shapes',
    ja: 'すれ違った後、二つのパルスはもとの形のまま進み続ける',
    zh: '彼此穿过之后，两个脉冲都保持原来的形状继续前进',
    ar: 'بعد أن تتجاوز كلٌّ منهما الأخرى، تمضي النبضتان بشكليهما الأصليين تمامًا',
    es: 'Una vez que se cruzan, ambos pulsos siguen su camino con exactamente su forma original',
    fr: 'Une fois croisées, les deux impulsions poursuivent leur route avec exactement leur forme d’origine',
    hi: 'एक-दूसरे को पार करने के बाद दोनों स्पंद ठीक अपने मूल आकार में आगे बढ़ते रहते हैं',
    id: 'Setelah saling melewati, kedua pulsa terus melaju dengan bentuk aslinya persis',
    pt: 'Depois de se cruzarem, os dois pulsos seguem em frente com exatamente sua forma original',
  },
} satisfies Record<string, LocalizedText>);

export type SuperpositionMessageKey = keyof typeof superpositionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SuperpositionMessageKey): LocalizedText => superpositionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SuperpositionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const superpositionSchema: BundleSchema = {
  id: SUPERPOSITION_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 펄스가 달려오고, 겹치고, 빠져나간다.
  parameters: [],

  stages: [
    {
      id: 'meeting',
      label: text('label.stage'),
      constants: {
        ampA: AMP_A,
        widthA: WIDTH_A,
        ampB: AMP_B,
        widthB: WIDTH_B,
        speed: SPEED,
        startOffset: START_OFFSET,
      },
    },
  ],

  environments: [],

  views: [{ id: 'strings', label: text('label.view'), default: true }],

  /** 가로 13 칸 · 세로 7.2 칸. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 각 펄스의 점선은 **줄 아래** 로 깔려야 겹치지 않는 동안 줄에
   * 가려져 하나로 보이고, 겹치는 동안에만 줄에서 떨어져 나와 보인다. 더하기 화살표는
   * 줄 위에 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나타남 → 다가옴 → 겹쳐 듦 → 포개짐(멈춤) → 겹쳐 남 → 멀어짐 → 흐려짐.
   *
   * 단계 길이는 펄스의 폭 · 속력 · 출발 거리에서 끌어온다. 가장자리가 닿는 순간이 곧
   * `merge` 의 시작이라 「겹친 자리에서는」 캡션이 화면과 어긋나지 않는다. 겹치는 동안은
   * 느리게 흘리고, 중심이 포개지는 순간 한 번 멈춘다 — 그 순간 합이 가장 크고(위 줄)
   * 가장 납작하다(아래 줄).
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.approach') },
      { id: 'approach', duration: TOUCH - APPEAR, caption: key('caption.approach') },
      {
        id: 'merge',
        duration: COINCIDE - TOUCH,
        timeScale: SLOW_MOTION,
        caption: key('caption.overlap'),
      },
      { id: 'peak', duration: PEAK_HOLD, caption: key('caption.overlap') },
      {
        id: 'split',
        duration: PART - COINCIDE,
        timeScale: SLOW_MOTION,
        caption: key('caption.overlap'),
      },
      { id: 'depart', duration: ARRIVE - PART, caption: key('caption.depart') },
      { id: 'fade', duration: FADE, caption: key('caption.depart') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 펄스가 서로를 향해 달리는 한가운데에서 연다.
   * 0 이면 펄스가 막 나타나는 옅은 화면이 먼저 보인다.
   */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 원리의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 **모양**(높아짐 · 납작해짐 ·
   * 그대로임)이라 거리 격자를 깔면 「몇 칸인가」 라는 다른 질문이 끼어든다.
   */

  messages: superpositionMessages,
};
