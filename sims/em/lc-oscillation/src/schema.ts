// ========================================================================
// lc-oscillation — 선언
// ========================================================================
// 질문: 저항 없는 LC 회로에서 에너지는 어디에 있고, 어떻게 오가는가.
//
// 왼쪽 가지의 축전기 판 사이에는 전기장이, 오른쪽 가지의 코일을 꿰어서는 자기장이 있다.
// 판의 전하가 빠지는 동안 전류가 늘어 판 사이 장선이 줄어든 만큼 코일을 꿰는 장선이
// 늘고, 전류가 0 이 되는 순간 판은 반대 부호로 가득하다. 오른쪽의 두 막대 — 판 사이
// 장에 든 전기 에너지 · 코일 장에 든 자기 에너지 — 는 한쪽이 빈 만큼 다른 쪽이 찬다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lc-oscillation` 와 문자 그대로 일치한다 (C4). */
export const LC_OSCILLATION_ID = 'lc-oscillation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 인덕턴스(mH). */
export const INDUCTANCE_MH = 10;
/** 전기 용량(μF). */
export const CAPACITANCE_UF = 100;
/** 처음 판 전하(μC). 위 판이 + 로 가득한 자리에서 출발한다. */
export const INITIAL_CHARGE_UC = 30;

/**
 * 화면 시간을 늘리는 배율. 이 회로의 실제 주기는 2π√(LC) ≈ 6.3 ms 라 눈으로 볼 수 없다 —
 * 화면의 1 초가 실제 1/1250 초다. 화면에 알리지 않는 이유는 NOTES (b).
 */
export const SLOW_MOTION = 1250;

// ------------------------------------------------------------------------
// 표시 배율 — 장 세기를 선 개수로, 전류를 화살표 길이로 바꾸는 값 (원칙 2)
// ------------------------------------------------------------------------

/** 판 위 +/− 표식 하나(= 전기력선 한 가닥)가 나타내는 전하(μC). */
export const CHARGE_PER_MARK_UC = 5;
/** 코일을 꿰는 자기력선 한 가닥(코일 양쪽 한 쌍)이 나타내는 전류(mA). */
export const CURRENT_PER_LINE_MA = 10;
/** 전류 화살표 I 의 길이 배율(월드 per mA). */
export const CURRENT_ARROW_SCALE = 0.025;

/** 사분 주기(초, 화면 시간) — 시간표 단계 길이의 기본값이다. */
export const QUARTER_PERIOD =
  (Math.PI / 2) * Math.sqrt(INDUCTANCE_MH * 1e-3 * CAPACITANCE_UF * 1e-6) * SLOW_MOTION;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 회로 고리는 왼쪽 가지(축전기) · 오른쪽 가지(코일)로 된 사각형이다.
// ------------------------------------------------------------------------

/** 고리의 왼쪽 가지(축전기) x · 오른쪽 가지(코일 축) x · 윗도선 y · 아랫도선 y. */
export const LOOP_LEFT = -2.0;
export const LOOP_RIGHT = 0.3;
export const LOOP_TOP = 1.55;
export const LOOP_BOTTOM = -1.15;

/** 축전기 판 — 반폭과 위 · 아래 판의 y. */
export const PLATE_HALF_WIDTH = 0.55;
export const PLATE_TOP_Y = 0.75;
export const PLATE_BOTTOM_Y = -0.35;
/** 판 가장자리에서 첫 표식까지 들인 거리. */
export const PLATE_MARGIN = 0.1;
/** 표식이 판 안쪽 면에서 떨어진 거리 · 표식 반 크기. */
export const MARK_INSET = 0.09;
export const MARK_HALF = 0.035;
/** 전기력선이 판 안쪽 면에서 떨어져 시작하는 거리(표식 아래). */
export const FIELD_INSET = 0.2;

/** 코일 — 가운데 y · 반 높이 · 반지름 · 감은 수 · 옆에서 본 고리의 눌린 반높이. */
export const COIL_CENTER_Y = 0.2;
export const COIL_HALF_HEIGHT = 0.6;
export const COIL_RADIUS = 0.22;
export const COIL_TURNS = 7;
export const COIL_TILT = 0.07;

/**
 * 자기력선 한 가닥 = 코일 속을 지나 한쪽 바깥으로 돌아 나오는 닫힌 고리.
 * 가닥 번호가 클수록 바깥이다. 안쪽 변 x 오프셋 · 바깥 변 x 오프셋 · 반 높이의 첫 값과 증분.
 */
export const LOOP_INNER_BASE = 0.05;
export const LOOP_INNER_STEP = 0.07;
export const LOOP_OUTER_BASE = 0.45;
export const LOOP_OUTER_STEP = 0.22;
export const LOOP_HALF_H_BASE = 0.8;
export const LOOP_HALF_H_STEP = 0.12;

/** 장선 방향 꺾쇠의 반 크기. */
export const CHEVRON = 0.06;

/** 전류 화살표가 윗도선 위로 뜬 거리. */
export const CURRENT_ARROW_LIFT = 0.16;

/** 에너지 막대 두 개 — 왼쪽 막대(전기)의 x 범위, 오른쪽 막대(자기)의 x 범위, 바닥 y, 틀 높이(= 합). */
export const BAR_E_LEFT = 1.5;
export const BAR_E_RIGHT = 1.85;
export const BAR_B_LEFT = 2.1;
export const BAR_B_RIGHT = 2.45;
export const BAR_BOTTOM = -0.95;
export const BAR_HEIGHT = 2.1;
/** 합의 선이 막대 바깥으로 삐져나오는 길이. */
export const TOTAL_OVERHANG = 0.1;

/**
 * 프레이밍은 주장의 일부다. 가로는 축전기 이름표부터 막대까지, 세로는 캡션 줄 아래에서
 * 전류 화살표 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -2.85, maxX: 2.8, minY: -1.75, maxY: 1.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lcOscillationMessages = Object.freeze({
  'label.title': {
    ko: 'LC 진동',
    en: 'LC oscillation',
    ja: 'LC振動',
    zh: 'LC 振荡',
    ar: 'تذبذب LC',
    es: 'Oscilación LC',
    fr: 'Oscillations LC',
    hi: 'LC दोलन',
    id: 'Osilasi LC',
    pt: 'Oscilação LC',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '전기와 자기 에너지의 교환',
    en: 'Electric and magnetic energy trade places',
    ja: '電気エネルギーと磁気エネルギーが入れ替わる',
    zh: '电能与磁能相互交换',
    ar: 'تتبادل الطاقتان الكهربائية والمغناطيسية الأدوار',
    es: 'La energía eléctrica y la magnética se intercambian',
    fr: 'Les énergies électrique et magnétique s’échangent',
    hi: 'विद्युत और चुंबकीय ऊर्जा आपस में जगह बदलती हैं',
    id: 'Energi listrik dan energi magnet bertukar tempat',
    pt: 'As energias elétrica e magnética trocam de lugar',
  },
  'label.stage': {
    ko: '저항 없는 회로',
    en: 'Circuit without resistance',
    ja: '抵抗のない回路',
    zh: '无电阻电路',
    ar: 'دائرة بلا مقاومة',
    es: 'Circuito sin resistencia',
    fr: 'Circuit sans résistance',
    hi: 'प्रतिरोध-रहित परिपथ',
    id: 'Rangkaian tanpa hambatan',
    pt: 'Circuito sem resistência',
  },
  'label.view': {
    ko: '회로와 에너지 막대',
    en: 'Circuit and energy bars',
    ja: '回路とエネルギーの棒',
    zh: '电路与能量柱',
    ar: 'الدائرة وأعمدة الطاقة',
    es: 'Circuito y barras de energía',
    fr: 'Circuit et barres d’énergie',
    hi: 'परिपथ और ऊर्जा पट्टियाँ',
    id: 'Rangkaian dan batang energi',
    pt: 'Circuito e barras de energia',
  },
  /** 도식 표식 — 소자 · 전류 기호라 번역하지 않는다 (C1 판정 3). */
  'label.capacitor': {
    ko: 'C',
    en: 'C',
    ja: 'C',
    zh: 'C',
    ar: 'C',
    es: 'C',
    fr: 'C',
    hi: 'C',
    id: 'C',
    pt: 'C',
  },
  'label.inductor': {
    ko: 'L',
    en: 'L',
    ja: 'L',
    zh: 'L',
    ar: 'L',
    es: 'L',
    fr: 'L',
    hi: 'L',
    id: 'L',
    pt: 'L',
  },
  'label.current': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'label.electric': {
    ko: '전기',
    en: 'electric',
    ja: '電気',
    zh: '电',
    ar: 'كهربائية',
    es: 'eléctrica',
    fr: 'électrique',
    hi: 'विद्युत',
    id: 'listrik',
    pt: 'elétrica',
  },
  'label.magnetic': {
    ko: '자기',
    en: 'magnetic',
    ja: '磁気',
    zh: '磁',
    ar: 'مغناطيسية',
    es: 'magnética',
    fr: 'magnétique',
    hi: 'चुंबकीय',
    id: 'magnet',
    pt: 'magnética',
  },
  'label.total': {
    ko: '합',
    en: 'total',
    ja: '合計',
    zh: '总和',
    ar: 'المجموع',
    es: 'total',
    fr: 'total',
    hi: 'कुल',
    id: 'total',
    pt: 'total',
  },
  'caption.drain': {
    ko: '축전기가 비며 전류가 는다 — 판 사이 장이 줄어든 만큼 코일을 꿰는 장이 커지고, 두 막대를 더한 높이는 그대로다',
    en: 'The capacitor drains and the current grows — the field between the plates shrinks as the field through the coil grows, and the two bars always add up to the same height',
    ja: 'コンデンサーが放電し電流が増える — 極板間の場が弱まった分だけコイルを貫く場が強まり、二本の棒を合わせた高さはいつも同じだ',
    zh: '电容器放电，电流增大 — 极板间的场减弱多少，穿过线圈的场就增强多少，两根柱子加起来的高度始终不变',
    ar: 'يفرغ المكثف ويزداد التيار — يضعف المجال بين اللوحين بقدر ما يقوى المجال عبر الملف، ومجموع ارتفاعَي العمودين ثابت دائمًا',
    es: 'El condensador se descarga y la corriente crece — el campo entre las placas se debilita mientras crece el campo a través de la bobina, y las dos barras siempre suman la misma altura',
    fr: 'Le condensateur se décharge et le courant augmente — le champ entre les armatures faiblit tandis que celui qui traverse la bobine grandit, et les deux barres totalisent toujours la même hauteur',
    hi: 'संधारित्र खाली होता है और धारा बढ़ती है — प्लेटों के बीच का क्षेत्र जितना घटता है, कुंडली से गुज़रने वाला क्षेत्र उतना बढ़ता है, और दोनों पट्टियों की कुल ऊँचाई सदा वही रहती है',
    id: 'Kapasitor mengosong dan arus membesar — medan di antara pelat melemah seiring medan yang menembus kumparan menguat, dan tinggi kedua batang selalu berjumlah sama',
    pt: 'O capacitor se descarrega e a corrente cresce — o campo entre as placas diminui enquanto cresce o campo através da bobina, e as duas barras sempre somam a mesma altura',
  },
  'caption.refill': {
    ko: '전류가 줄며 코일의 에너지가 판 사이로 돌아간다 — 판은 반대 부호로 찬다',
    en: 'The current dies down and the coil’s energy flows back between the plates — which fill with the opposite sign',
    ja: '電流が弱まり、コイルのエネルギーが極板の間へ戻る — 極板は逆の符号でたまる',
    zh: '电流逐渐减弱，线圈的能量流回极板之间 — 极板以相反的符号充满',
    ar: 'يخبو التيار وتعود طاقة الملف إلى ما بين اللوحين — فيمتلئان بإشارة معاكسة',
    es: 'La corriente se apaga y la energía de la bobina vuelve entre las placas — que se cargan con el signo opuesto',
    fr: 'Le courant s’éteint et l’énergie de la bobine revient entre les armatures — qui se chargent avec le signe opposé',
    hi: 'धारा घटती जाती है और कुंडली की ऊर्जा प्लेटों के बीच लौट जाती है — प्लेटें उलटे चिह्न से भरती हैं',
    id: 'Arus meredup dan energi kumparan mengalir kembali ke antara pelat — yang terisi dengan tanda berlawanan',
    pt: 'A corrente se extingue e a energia da bobina volta para entre as placas — que se carregam com o sinal oposto',
  },
  'caption.drainBack': {
    ko: '이번엔 반대로 — 축전기가 비며 전류가 거꾸로 흐르고, 코일을 꿰는 장도 거꾸로 커진다',
    en: 'Now the other way — the capacitor drains, the current runs backwards, and the field through the coil grows the other way',
    ja: '今度は逆向き — コンデンサーが放電し、電流は逆に流れ、コイルを貫く場も逆向きに強まる',
    zh: '这次反过来 — 电容器放电，电流反向流动，穿过线圈的场也反向增强',
    ar: 'والآن بالعكس — يفرغ المكثف، ويجري التيار في الاتجاه المعاكس، ويقوى المجال عبر الملف في الاتجاه الآخر',
    es: 'Ahora al revés — el condensador se descarga, la corriente circula en sentido contrario y el campo a través de la bobina crece en el otro sentido',
    fr: 'Maintenant dans l’autre sens — le condensateur se décharge, le courant circule à rebours et le champ dans la bobine grandit dans l’autre sens',
    hi: 'अब उलटी ओर — संधारित्र खाली होता है, धारा उलटी बहती है, और कुंडली से गुज़रने वाला क्षेत्र भी उलटी दिशा में बढ़ता है',
    id: 'Kini sebaliknya — kapasitor mengosong, arus mengalir terbalik, dan medan yang menembus kumparan menguat ke arah sebaliknya',
    pt: 'Agora ao contrário — o capacitor se descarrega, a corrente corre no sentido inverso e o campo através da bobina cresce no outro sentido',
  },
  'caption.refillBack': {
    ko: '전류가 줄며 에너지가 다시 판 사이로 돌아간다 — 판은 처음 부호로 찬다',
    en: 'The current dies down and the energy returns between the plates — which fill with their original sign',
    ja: '電流が弱まり、エネルギーが再び極板の間へ戻る — 極板は最初の符号でたまる',
    zh: '电流逐渐减弱，能量又回到极板之间 — 极板以原来的符号充满',
    ar: 'يخبو التيار وتعود الطاقة إلى ما بين اللوحين — فيمتلئان بإشارتهما الأصلية',
    es: 'La corriente se apaga y la energía vuelve entre las placas — que se cargan con su signo original',
    fr: 'Le courant s’éteint et l’énergie revient entre les armatures — qui se chargent avec leur signe d’origine',
    hi: 'धारा घटती जाती है और ऊर्जा फिर प्लेटों के बीच लौट आती है — प्लेटें अपने मूल चिह्न से भरती हैं',
    id: 'Arus meredup dan energi kembali ke antara pelat — yang terisi dengan tanda semula',
    pt: 'A corrente se extingue e a energia volta para entre as placas — que se carregam com seu sinal original',
  },
} satisfies Record<string, LocalizedText>);

export type LcOscillationMessageKey = keyof typeof lcOscillationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LcOscillationMessageKey): LocalizedText => lcOscillationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LcOscillationMessageKey): string {
  return k;
}

/**
 * 사분 주기 단계의 id — 한 주기를 이 순서로 돈다. physics 는 이 넷의 진행도를 더해
 * 위상각을 얻는다. 단계 **길이**는 선언(`timeline`)이 정한다.
 */
export const QUARTER_PHASES = ['drain', 'refill', 'drainBack', 'refillBack'] as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lcOscillationSchema: BundleSchema = {
  id: LC_OSCILLATION_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 오가고, 두 막대가 서로를 채운다.
  parameters: [],

  stages: [
    {
      id: 'lossless',
      label: text('label.stage'),
      constants: {
        inductance: INDUCTANCE_MH,
        capacitance: CAPACITANCE_UF,
        initialCharge: INITIAL_CHARGE_UC,
        slowMotion: SLOW_MOTION,
        chargePerMark: CHARGE_PER_MARK_UC,
        currentPerLine: CURRENT_PER_LINE_MA,
        currentArrowScale: CURRENT_ARROW_SCALE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'circuit-bars', label: text('label.view'), default: true }],

  /** 회로 고리와 막대가 가로로 나란하다. 세로는 고리 높이와 캡션 두 줄. */
  canvas: { height: 440, minHeight: 360 },

  /**
   * 한 주기 = 위 판이 + 로 가득 → 빔(전류 최대) → 위 판이 − 로 가득 → 빔(전류 반대로 최대) → 처음.
   *
   * 네 단계 모두 사분 주기다. 진행도가 **선형**이어야 단계 진행도를 더한 값이 위상각이
   * 된다 — 이징을 걸면 전하가 조화 진동하지 않는다. 단계 경계가 곧 전류 0 · 전하 0 의 순간이다.
   */
  timeline: {
    phases: [
      { id: 'drain', duration: QUARTER_PERIOD, caption: key('caption.drain') },
      { id: 'refill', duration: QUARTER_PERIOD, caption: key('caption.refill') },
      { id: 'drainBack', duration: QUARTER_PERIOD, caption: key('caption.drainBack') },
      { id: 'refillBack', duration: QUARTER_PERIOD, caption: key('caption.refillBack') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 판이 막 비기 시작해 전류 화살표와 코일 장선이 돋아나는
   * 자리에서 연다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 0.5,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 주기 식 · ½CV² · ½LI² 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 합의 선은 막대 **위** 에 놓여야 막대 꼭대기가 그 선에 닿는 것으로 읽힌다. 층 순서로는
   * `region`(막대)이 선 위로 올라온다.
   */
  drawOrder: 'scene',

  messages: lcOscillationMessages,
};
