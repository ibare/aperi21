// ========================================================================
// atwood-machine — 선언
// ========================================================================
// 질문: 도르래 양쪽 추 가운데 무엇이 가속도를 정하나 — 무거운 것인가, 두 추의 차이인가.
//
// 두 추 질량의 합을 5 kg 으로 묶어 두면 가속도 a = 차이·g/합 은 차이만 따라간다.
// 차이가 두 배면 같은 0.1 초 동안 내려오는 거리도 두 배다 — 자취 점 간격이 1:2 로 벌어진다.
//
// 원본: tasks/piece-lab/atwood-machine (사용자 검토 뒤 다시 만든 판).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:atwood-machine` 와 문자 그대로 일치한다 (C4). */
export const ATWOOD_MACHINE_ID = 'atwood-machine';

// ------------------------------------------------------------------------
// 물리 값 — 원본 상수 그대로
// ------------------------------------------------------------------------

/** 중력 가속도 (m/s²). */
export const G = 9.8;
/** 두 기계 모두 두 추 질량의 합 (kg). */
export const TOTAL = 5.0;
/** 왼쪽 기계의 차이 (고정, kg). */
export const DIFF_LEFT = 0.5;
/** 오른쪽 기계의 차이 기본값 (kg). */
export const DIFF_DEFAULT = 1.0;
/** 조절기 범위와 간격 (kg). */
export const DIFF_RANGE: readonly [number, number] = [0, 2];
export const DIFF_STEP = 0.1;
/** 무거운 추가 내려오는 거리 (m). */
export const DROP = 1.6;
/** 둘 다 닿은 뒤 멈춰 보여 주는 시간 (s). */
export const HOLD = 1.8;
/** 자취 간격 (s). */
export const STROBE = 0.1;
/** 첫 화면이 이미 움직이는 중이도록 앞당기는 시간 (s). */
export const LEAD = 0.2;
/** 왼쪽(차이 0.5 kg) 무거운 추의 착지 시각 √(2·DROP/(0.5·G/TOTAL)) (s). 시간표 첫 단계의 길이. */
export const FALL_PHASE = 1.807;
/** 한 주기 (s) — 시간표 단계 길이의 합. state 의 주기 안 시각이 여기서 되감긴다. */
export const PERIOD = FALL_PHASE + HOLD;

// ------------------------------------------------------------------------
// 배치 — 원본은 860×360 px 캔버스, 1 m = 130 px. 월드는 m, y 위, 바닥이 y = 0.
// ------------------------------------------------------------------------

/** 1 m 당 원본 픽셀. 원본 px 치수를 월드 m 로 옮길 때만 쓴다. */
export const PPM = 130;
/** 원본 캔버스 가로(px). */
export const WIDTH_PX = 860;
/** 원본 바닥선 높이(px, 위에서). */
export const FLOOR_Y_PX = 320;
/** 바닥선이 캔버스 양끝에서 들어온 거리(px). */
export const FLOOR_INSET_PX = 60;
/** 도르래 중심 높이(월드 m) — 원본 PULLEY_Y = 40 px. */
export const PULLEY_Y = (FLOOR_Y_PX - 40) / PPM;
/** 도르래 반지름(월드 m) — 원본 34 px. */
export const PULLEY_R = 34 / PPM;
/** 천장(캔버스 윗변, 월드 m). 도르래 매단 줄이 여기서 내려온다. */
export const CEILING_Y = FLOOR_Y_PX / PPM;
/** 두 도르래 중심 x (월드 m) — 원본 250 · 610 px. */
export const MACHINE_X: readonly [number, number] = [250 / PPM, 610 / PPM];
/** 3.0 kg 추의 한 변(월드 m) — 원본 46 px. 한 변은 질량의 세제곱근에 비례한다. */
export const BASE_SIDE = 46 / PPM;
/** 무거운 추 줄에서 자취열까지 왼쪽으로 떨어진 거리(월드 m) — 원본 44 px. */
export const TRAIL_OFFSET = 44 / PPM;
/** 출발 높이 점선이 자취열 왼쪽으로 더 나가는 길이 · 줄 오른쪽으로 나가는 길이(월드 m). */
export const START_LINE_LEFT = 16 / PPM;
export const START_LINE_RIGHT = 30 / PPM;

/**
 * 고정 경계. 원본 캔버스 전체(0~860 px, 위 0 px) 에 더해 아래로 차이 이름표 · 캡션 ·
 * 조절기 줄이 들어갈 자리를 둔다 — 원본은 캡션과 조절기가 캔버스 밖 DOM 이었다.
 */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: WIDTH_PX / PPM,
  minY: -0.95,
  maxY: CEILING_Y,
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const atwoodMachineMessages = Object.freeze({
  'label.title': {
    ko: '애트우드 기계',
    en: 'Atwood machine',
    ja: 'アトウッドの装置',
    zh: '阿特伍德机',
    ar: 'آلة أتوود',
    es: 'Máquina de Atwood',
    fr: 'Machine d’Atwood',
    hi: 'एटवुड मशीन',
    id: 'Mesin Atwood',
    pt: 'Máquina de Atwood',
  },
  'label.operation': {
    ko: '두 추의 합이 같으면 차이가 가속도를 정한다',
    en: 'With the same total mass, the difference sets the acceleration',
    ja: '質量の合計が同じなら、差が加速度を決める',
    zh: '总质量相同时，质量差决定加速度',
    ar: 'عند تساوي الكتلة الكلية، يحدد الفرق التسارع',
    es: 'Con la misma masa total, la diferencia fija la aceleración',
    fr: 'À masse totale égale, c’est la différence qui fixe l’accélération',
    hi: 'कुल द्रव्यमान समान हो तो अंतर त्वरण तय करता है',
    id: 'Dengan massa total yang sama, selisihnya menentukan percepatan',
    pt: 'Com a mesma massa total, a diferença define a aceleração',
  },
  'label.stage': {
    ko: '두 기계',
    en: 'Two machines',
    ja: '二つの装置',
    zh: '两台机器',
    ar: 'آلتان',
    es: 'Dos máquinas',
    fr: 'Deux machines',
    hi: 'दो मशीनें',
    id: 'Dua mesin',
    pt: 'Duas máquinas',
  },
  'label.view': {
    ko: '자취',
    en: 'Strobe',
    ja: 'ストロボ',
    zh: '频闪',
    ar: 'الومضات',
    es: 'Estroboscopio',
    fr: 'Stroboscope',
    hi: 'स्ट्रोब',
    id: 'Stroboskop',
    pt: 'Estroboscópio',
  },
  /** 기계 아래 이름표. 값은 소수 첫째 자리로 끼운다. */
  'label.diff': {
    ko: '두 추의 차이 {d} kg',
    en: 'Difference {d} kg',
    ja: '差 {d} kg',
    zh: '质量差 {d} kg',
    ar: 'الفرق {d} kg',
    es: 'Diferencia {d} kg',
    fr: 'Différence {d} kg',
    hi: 'अंतर {d} kg',
    id: 'Selisih {d} kg',
    pt: 'Diferença {d} kg',
  },
  /** 추 안의 질량. 수만 있는 표식이다 (C1 판정 3). */
  'label.mass': {
    ko: '{m}',
    en: '{m}',
    ja: '{m}',
    zh: '{m}',
    ar: '{m}',
    es: '{m}',
    fr: '{m}',
    hi: '{m}',
    id: '{m}',
    pt: '{m}',
  },
  /** 조절기 이름표. */
  'label.slider': {
    ko: '오른쪽 기계의 두 추 차이',
    en: 'Right machine: mass difference',
    ja: '右の装置: 質量の差',
    zh: '右边装置：质量差',
    ar: 'الآلة اليمنى: فرق الكتلة',
    es: 'Máquina derecha: diferencia de masa',
    fr: 'Machine de droite : différence de masse',
    hi: 'दाईं मशीन: द्रव्यमान का अंतर',
    id: 'Mesin kanan: selisih massa',
    pt: 'Máquina da direita: diferença de massa',
  },
  'caption.falling': {
    ko: '합은 둘 다 5 kg, 차이는 {ratio}배 — 오른쪽 점 간격이 왼쪽의 {ratio}배로 벌어진다',
    en: 'Both total 5 kg, the difference is {ratio}× — the right dots spread {ratio}× as far apart',
    ja: '合計はどちらも 5 kg、差は {ratio}× — 右の点の間隔が {ratio}× に広がる',
    zh: '总质量都是 5 kg，质量差是 {ratio}× — 右边的点间距拉开到 {ratio}×',
    ar: 'المجموع 5 kg في كلتيهما، والفرق {ratio}× — تتباعد نقاط اليمين {ratio}× أكثر',
    es: 'Ambas suman 5 kg, la diferencia es {ratio}× — los puntos de la derecha se separan {ratio}× más',
    fr: 'Les deux totalisent 5 kg, la différence est {ratio}× — les points de droite s’écartent {ratio}× plus',
    hi: 'दोनों का कुल 5 kg, अंतर {ratio}× — दाईं ओर के बिंदु {ratio}× दूर-दूर फैलते हैं',
    id: 'Keduanya total 5 kg, selisihnya {ratio}× — titik-titik kanan merenggang {ratio}× lebih jauh',
    pt: 'Ambas somam 5 kg, a diferença é {ratio}× — os pontos da direita se afastam {ratio}× mais',
  },
  'caption.equal': {
    ko: '합도 차이도 같다 — 두 자취열의 점 간격이 똑같이 벌어진다',
    en: 'Same total, same difference — both rows of dots spread apart alike',
    ja: '合計も差も同じ — 二列の点の間隔が同じように広がる',
    zh: '总质量和质量差都相同 — 两列点的间距同样拉开',
    ar: 'المجموع نفسه والفرق نفسه — تتباعد نقاط الصفّين بالقدر نفسه',
    es: 'Mismo total, misma diferencia — las dos filas de puntos se separan igual',
    fr: 'Même total, même différence — les deux rangées de points s’écartent de la même façon',
    hi: 'कुल भी समान, अंतर भी समान — बिंदुओं की दोनों पंक्तियाँ एक जैसी फैलती हैं',
    id: 'Total sama, selisih sama — kedua deret titik merenggang dengan cara yang sama',
    pt: 'Mesmo total, mesma diferença — as duas fileiras de pontos se afastam igualmente',
  },
  'caption.rightFirst': {
    ko: '오른쪽 추가 먼저 닿았다 — 왼쪽은 같은 0.1초에 더 짧게 내려오는 중이다',
    en: 'The right block lands first — the left one still falls less in each 0.1 s',
    ja: '右のおもりが先に着いた — 左はまだ 0.1 s ごとに、より短く下りている',
    zh: '右边的重物先着地 — 左边的仍在下落，每 0.1 s 落得更少',
    ar: 'تصل الكتلة اليمنى أولًا — واليسرى ما زالت تنزل مسافة أقل في كل 0.1 s',
    es: 'El bloque de la derecha llega primero — el de la izquierda aún baja menos en cada 0.1 s',
    fr: 'Le bloc de droite touche le sol en premier — celui de gauche descend encore moins à chaque 0.1 s',
    hi: 'दायाँ गुटका पहले पहुँचा — बायाँ अब भी हर 0.1 s में कम नीचे आ रहा है',
    id: 'Balok kanan mendarat lebih dulu — yang kiri masih turun lebih sedikit tiap 0.1 s',
    pt: 'O bloco da direita chega primeiro — o da esquerda ainda desce menos a cada 0.1 s',
  },
  'caption.leftFirst': {
    ko: '왼쪽 추가 먼저 닿았다 — 오른쪽은 같은 0.1초에 더 짧게 내려오는 중이다',
    en: 'The left block lands first — the right one still falls less in each 0.1 s',
    ja: '左のおもりが先に着いた — 右はまだ 0.1 s ごとに、より短く下りている',
    zh: '左边的重物先着地 — 右边的仍在下落，每 0.1 s 落得更少',
    ar: 'تصل الكتلة اليسرى أولًا — واليمنى ما زالت تنزل مسافة أقل في كل 0.1 s',
    es: 'El bloque de la izquierda llega primero — el de la derecha aún baja menos en cada 0.1 s',
    fr: 'Le bloc de gauche touche le sol en premier — celui de droite descend encore moins à chaque 0.1 s',
    hi: 'बायाँ गुटका पहले पहुँचा — दायाँ अब भी हर 0.1 s में कम नीचे आ रहा है',
    id: 'Balok kiri mendarat lebih dulu — yang kanan masih turun lebih sedikit tiap 0.1 s',
    pt: 'O bloco da esquerda chega primeiro — o da direita ainda desce menos a cada 0.1 s',
  },
  'caption.arrival': {
    ko: '1.6 m 를 내려오는 데 왼쪽 {tLeft}초, 오른쪽 {tRight}초',
    en: 'Falling 1.6 m takes {tLeft} s on the left, {tRight} s on the right',
    ja: '1.6 m 下りるのに、左は {tLeft} s、右は {tRight} s',
    zh: '下落 1.6 m，左边用时 {tLeft} s，右边 {tRight} s',
    ar: 'النزول مسافة 1.6 m يستغرق على اليسار {tLeft} s وعلى اليمين {tRight} s',
    es: 'Bajar 1.6 m toma {tLeft} s a la izquierda y {tRight} s a la derecha',
    fr: 'Descendre de 1.6 m prend {tLeft} s à gauche, {tRight} s à droite',
    hi: '1.6 m नीचे आने में बाईं ओर {tLeft} s, दाईं ओर {tRight} s लगते हैं',
    id: 'Turun 1.6 m butuh {tLeft} s di kiri, {tRight} s di kanan',
    pt: 'Descer 1.6 m leva {tLeft} s à esquerda e {tRight} s à direita',
  },
  'caption.still': {
    ko: '오른쪽 두 추의 차이가 0 — 합은 5 kg 그대로인데 추가 움직이지 않는다',
    en: 'No difference on the right — still 5 kg in total, yet the blocks do not move',
    ja: '右は差が 0 — 合計は 5 kg のままなのに、おもりは動かない',
    zh: '右边没有质量差 — 总质量仍是 5 kg，重物却不动',
    ar: 'لا فرق في اليمين — المجموع ما زال 5 kg، لكن الكتلتين لا تتحركان',
    es: 'Sin diferencia a la derecha — siguen siendo 5 kg en total, pero los bloques no se mueven',
    fr: 'Aucune différence à droite — toujours 5 kg au total, et pourtant les blocs ne bougent pas',
    hi: 'दाईं ओर कोई अंतर नहीं — कुल अब भी 5 kg, फिर भी गुटके नहीं हिलते',
    id: 'Tanpa selisih di kanan — total tetap 5 kg, tetapi balok-baloknya tidak bergerak',
    pt: 'Sem diferença à direita — ainda 5 kg no total, mas os blocos não se movem',
  },
} satisfies Record<string, LocalizedText>);

export type AtwoodMachineMessageKey = keyof typeof atwoodMachineMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: AtwoodMachineMessageKey): LocalizedText => atwoodMachineMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AtwoodMachineMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const atwoodMachineSchema: BundleSchema = {
  id: ATWOOD_MACHINE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { g: G, total: TOTAL, drop: DROP },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 360 px + 이름표 · 캡션 · 조절기 줄. */
  canvas: { height: 480, minHeight: 420 },

  /** 겹침이 원본 순서여야 한다 — 바닥 · 이름표 · 점선 · 자취 · 줄 · 도르래 · 추. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 내려오는 중 — 원본은 주기 0.2 초째로 앞당겨 열었다. */
  startAt: LEAD,

  /**
   * 한 주기 — 내려오다(fall) · 둘 다 닿은 채 멈춘다(hold). 왼쪽 착지
   * √(2·1.6/0.98) = 1.807 s + 멈춤 1.8 s = 3.607 s. 원본의 기본 주기(가장 늦은 착지 + 멈춤)와 같다.
   *
   * 추의 자리는 단계가 아니라 주기 안 시각의 닫힌 식이라, 조절기가 시계를 0 으로 되돌리면
   * 그대로 처음이 된다. 단계는 주기의 길이만 정하고 캡션을 말하지 않는다 — 문장은 조절기
   * 값에 따라 달라지는 **실제 착지**로 고른다(아래 `caption.cases`).
   *
   * 한계 — 주기 길이가 조절기 값을 따라가지 못한다 (NOTES.md 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'fall', duration: FALL_PHASE },
      { id: 'hold', duration: HOLD },
    ],
  },

  /**
   * 슬롯 하나. 원본은 그림 아래 왼쪽 정렬 15 px 한 줄이었다.
   *
   * 원본은 매 프레임 착지 시각과 주기 안 시각을 견줘 문장을 골랐다. 여기서는 physics 가
   * 같은 비교를 해 착지 여부를 state 에 두고, 슬롯은 위에서부터 참인 첫 항목을 쓴다.
   * 아무것도 참이 아니면(둘 다 내려오는 중) 배수 문장이다.
   */
  caption: {
    anchor: { world: [16 / PPM, -0.42] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.falling'),
    cases: [
      { when: 'still', text: key('caption.still') },
      { when: 'bothLanded', text: key('caption.arrival') },
      { when: 'rightOnlyLanded', text: key('caption.rightFirst') },
      { when: 'leftOnlyLanded', text: key('caption.leftFirst') },
      { when: 'equal', text: key('caption.equal') },
    ],
    vars: { ratio: 'ratioText', tLeft: 'tLeftText', tRight: 'tRightText' },
  },

  // 그리드 · 카메라 버튼은 원본에 없다 — 켜지 않는다.

  messages: atwoodMachineMessages,
};
