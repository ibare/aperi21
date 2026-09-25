// ========================================================================
// force-on-current-wire — 선언
// ========================================================================
// 질문: 자기장 속에 놓인 도선에 전류를 흘리면 무슨 일이 생기는가.
//
// 답: 도선이 힘을 받아 **튀어 나간다.** 힘은 자기장에도 전류에도 직각인 쪽이고,
// 전류 방향을 바꾸면 반대쪽, 전류를 키우면 더 세다. 그 힘은 도선 속을 흐르는 전하
// 하나하나가 받는 힘(로런츠 힘)이 모인 것이다.
//
// 동사: 스위치를 닫자 그네 도선이 한쪽으로 **튄다.**
//
// 이웃 `field-of-straight-wire` 는 전류가 장을 **만드는** 이야기이고, 이 조각은 이미 있는
// 장이 전류를 **미는** 이야기다. 이웃 `lorentz-force` 는 전하 하나의 힘 방향을 3차원으로
// 다루므로, 여기서는 그 연결을 한 단계(`charges`)로 짧게만 보인다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:force-on-current-wire` 와 문자 그대로 일치한다 (C4). */
export const FORCE_ON_CURRENT_WIRE_ID = 'force-on-current-wire';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자석 사이 자기장 세기(T). 방향은 N(위) → S(아래). */
export const FIELD = 0.2;
/** 처음 흘리는 전류(A). `on` · `reverse` 단계. */
export const CURRENT_LOW = 2;
/** 키운 전류(A). `more` · `charges` 단계. */
export const CURRENT_HIGH = 4;
/** 자기장 속에 든 도선 길이(m). */
export const WIRE_LENGTH = 0.15;
/** 그네 도선의 질량(kg). 평형각 tanθ = BIL / mg 의 mg 쪽이다. */
export const WIRE_MASS = 0.02;
/** 중력 가속도(m/s²). */
export const GRAVITY = 9.8;

// ------------------------------------------------------------------------
// 표시 — 화면 배율 · 흔들림의 모양. 역시 스테이지 상수다 (원칙 2).
// ------------------------------------------------------------------------

/** 그네 막대 길이(월드). 받침점에서 도선 중심까지. */
export const SWING_LENGTH = 2.3;
/** 그네의 고유 각진동수(rad/s, 화면 시간). 힘이 바뀐 뒤 흔들리는 빠르기. */
export const SWING_OMEGA = 3.2;
/** 그네의 감쇠율(1/s). 흔들림이 가라앉는 빠르기 — 단계 안에서 멈추도록 둔다. */
export const SWING_DAMPING = 1.5;
/** 힘 1 N 이 차지하는 월드 길이 — F 화살표 길이 배율. 상한이 없다(가장 긴 것 0.9). */
export const FORCE_SCALE = 7.5;
/** `charges` 단계에 확대 창 속에 보이는 전자 수. */
export const CHARGE_COUNT = 3;
/** 확대 창에서 전자 하나가 받는 힘을 보이는 작은 화살표 길이(월드). 크기 비교가 아니라 방향 표시다. */
export const CHARGE_ARROW = 0.3;

// ------------------------------------------------------------------------
// 배치
// ------------------------------------------------------------------------

/**
 * 프레이밍. 왼쪽은 자석 · 그네(가장 멀리 튄 순간의 F 이름표까지), 오른쪽은 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -2.8, maxX: 5.6, minY: -1.45, maxY: 2.6 } as const;
/** 캡션을 세우는 월드 자리(왼쪽 끝, 세로 가운데 조금 위). */
export const CAPTION_AT = [2.35, 0.6] as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const forceOnCurrentWireMessages = Object.freeze({
  'label.title': {
    ko: '전류가 받는 힘',
    en: 'Force on a current-carrying wire',
    ja: '電流が流れる導線にはたらく力',
    zh: '通电导线受到的力',
    ar: 'القوة المؤثرة في سلك يحمل تيارًا',
    es: 'Fuerza sobre un hilo con corriente',
    fr: 'Force sur un fil parcouru par un courant',
    hi: 'धारावाही तार पर बल',
    id: 'Gaya pada kawat berarus',
    pt: 'Força sobre um fio percorrido por corrente',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '도선에 작용하는 자기력',
    en: 'The magnetic force on a wire carrying a current',
    ja: '電流が流れる導線にはたらく磁気力',
    zh: '通电导线受到的磁场力',
    ar: 'القوة المغناطيسية على سلك يمر فيه تيار',
    es: 'La fuerza magnética sobre un hilo que lleva corriente',
    fr: 'La force magnétique sur un fil parcouru par un courant',
    hi: 'धारा ले जाते तार पर चुंबकीय बल',
    id: 'Gaya magnet pada kawat yang dialiri arus',
    pt: 'A força magnética sobre um fio que conduz corrente',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },

  /** 극 · 화살표 이름. 기호라 두 언어가 같다 (C1 판정 1 · 3). */
  'label.north': {
    ko: 'N',
    en: 'N',
    ja: 'N',
    zh: 'N',
    ar: 'N',
    es: 'N',
    fr: 'N',
    hi: 'N',
    id: 'N',
    pt: 'N',
  },
  'label.south': {
    ko: 'S',
    en: 'S',
    ja: 'S',
    zh: 'S',
    ar: 'S',
    es: 'S',
    fr: 'S',
    hi: 'S',
    id: 'S',
    pt: 'S',
  },
  'label.field': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.force': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  /** 지금 전류. 값이 끼는 조립문이라 문안이다 (C1). 값은 선언한 정박값의 글자다. */
  'label.current': {
    ko: 'I = {i} A',
    en: 'I = {i} A',
    ja: 'I = {i} A',
    zh: 'I = {i} A',
    ar: 'I = {i} A',
    es: 'I = {i} A',
    fr: 'I = {i} A',
    hi: 'I = {i} A',
    id: 'I = {i} A',
    pt: 'I = {i} A',
  },

  'caption.rest': {
    ko: '전류가 흐르지 않으면 도선은 자석 사이에 곧게 매달려 있다.',
    en: 'With no current, the wire hangs straight down between the poles.',
    ja: '電流がなければ、導線は磁極の間にまっすぐ垂れ下がっている。',
    zh: '没有电流时，导线在两磁极之间笔直下垂。',
    ar: 'عند غياب التيار، يتدلّى السلك مستقيمًا بين القطبين.',
    es: 'Sin corriente, el hilo cuelga recto entre los polos.',
    fr: 'Sans courant, le fil pend tout droit entre les pôles.',
    hi: 'धारा न होने पर तार ध्रुवों के बीच सीधा नीचे लटकता है।',
    id: 'Tanpa arus, kawat tergantung lurus di antara kedua kutub.',
    pt: 'Sem corrente, o fio pende reto entre os polos.',
  },
  'caption.on': {
    ko: '전류를 흘리는 순간 도선이 한쪽으로 튀어 나간다. 자기장이 전류를 민다.',
    en: 'Switch the current on and the wire kicks sideways. The field pushes on the current.',
    ja: '電流を流すと導線は横へはじかれる。磁場が電流を押す。',
    zh: '接通电流，导线向一侧弹出。磁场推动电流。',
    ar: 'شغّل التيار فيندفع السلك جانبًا. المجال يدفع التيار.',
    es: 'Enciende la corriente y el hilo salta de lado. El campo empuja la corriente.',
    fr: 'Allumez le courant et le fil part sur le côté. Le champ pousse le courant.',
    hi: 'धारा चालू करें और तार झटके से एक ओर हटता है। क्षेत्र धारा को धकेलता है।',
    id: 'Nyalakan arus dan kawat tersentak ke samping. Medan mendorong arus.',
    pt: 'Ligue a corrente e o fio salta para o lado. O campo empurra a corrente.',
  },
  'caption.reverse': {
    ko: '전류 방향을 바꾸면 힘도 뒤집혀 도선이 반대쪽으로 튄다.',
    en: 'Reverse the current and the force flips. The wire kicks the other way.',
    ja: '電流を逆にすると力も反転する。導線は反対側へはじかれる。',
    zh: '电流反向，力也反向。导线弹向另一侧。',
    ar: 'اعكس التيار فتنقلب القوة. يندفع السلك إلى الجهة الأخرى.',
    es: 'Invierte la corriente y la fuerza se invierte. El hilo salta hacia el otro lado.',
    fr: 'Inversez le courant et la force s’inverse. Le fil part de l’autre côté.',
    hi: 'धारा उलटें और बल पलट जाता है। तार झटके से दूसरी ओर हटता है।',
    id: 'Balik arus dan gayanya berbalik. Kawat tersentak ke arah lain.',
    pt: 'Inverta a corrente e a força se inverte. O fio salta para o outro lado.',
  },
  'caption.off': {
    ko: '전류를 끊으면 힘이 사라져 도선이 제자리로 돌아온다.',
    en: 'Switch the current off and the force is gone. The wire swings back.',
    ja: '電流を切ると力が消える。導線は元に戻る。',
    zh: '切断电流，力就消失。导线摆回原位。',
    ar: 'أوقف التيار فتختفي القوة. يعود السلك إلى مكانه.',
    es: 'Apaga la corriente y la fuerza desaparece. El hilo vuelve a su sitio.',
    fr: 'Coupez le courant et la force disparaît. Le fil revient en place.',
    hi: 'धारा बंद करें और बल गायब हो जाता है। तार वापस लौट आता है।',
    id: 'Matikan arus dan gayanya hilang. Kawat berayun kembali.',
    pt: 'Desligue a corrente e a força some. O fio volta ao lugar.',
  },
  'caption.more': {
    ko: '전류를 키우면 힘이 커져 도선이 더 멀리 튄다. 점선은 앞서 작은 전류일 때다.',
    en: 'Turn the current up and the force grows. The wire swings farther than before (dashed).',
    ja: '電流を大きくすると力も大きくなる。導線は前（破線）より遠くまで振れる。',
    zh: '增大电流，力随之变大。导线摆得比之前（虚线）更远。',
    ar: 'زِد التيار فتكبر القوة. يتأرجح السلك أبعد مما كان من قبل (الخط المتقطع).',
    es: 'Sube la corriente y la fuerza crece. El hilo se desvía más que antes (línea discontinua).',
    fr: 'Augmentez le courant et la force grandit. Le fil s’écarte plus qu’avant (pointillés).',
    hi: 'धारा बढ़ाएँ और बल बढ़ता है। तार पहले (डैश रेखा) से ज़्यादा दूर तक झूलता है।',
    id: 'Besarkan arus dan gayanya bertambah. Kawat berayun lebih jauh daripada sebelumnya (garis putus-putus).',
    pt: 'Aumente a corrente e a força cresce. O fio se desloca mais do que antes (tracejado).',
  },
  'caption.charges': {
    ko: '도선 속 전자 하나하나가 같은 쪽으로 밀린다. 그 힘이 모두 모인 것이 도선이 받는 힘이다.',
    en: 'Every electron in the wire is pushed the same way. Together those pushes are the force on the wire.',
    ja: '導線の中の電子一つ一つが同じ向きに押される。それらを合わせたものが導線にはたらく力だ。',
    zh: '导线中的每个电子都被推向同一方向。这些推力合起来就是导线受到的力。',
    ar: 'كل إلكترون في السلك يُدفع في الاتجاه نفسه. ومجموع هذه الدفعات هو القوة المؤثرة في السلك.',
    es: 'Cada electrón del hilo es empujado en el mismo sentido. Juntos, esos empujes son la fuerza sobre el hilo.',
    fr: 'Chaque électron du fil est poussé dans le même sens. Ensemble, ces poussées font la force sur le fil.',
    hi: 'तार का हर इलेक्ट्रॉन एक ही ओर धकेला जाता है। ये सब धक्के मिलकर तार पर लगने वाला बल हैं।',
    id: 'Setiap elektron di dalam kawat terdorong ke arah yang sama. Gabungan dorongan itulah gaya pada kawat.',
    pt: 'Cada elétron do fio é empurrado no mesmo sentido. Juntos, esses empurrões são a força sobre o fio.',
  },
} satisfies Record<string, LocalizedText>);

export type ForceOnCurrentWireMessageKey = keyof typeof forceOnCurrentWireMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ForceOnCurrentWireMessageKey): LocalizedText => forceOnCurrentWireMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ForceOnCurrentWireMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const forceOnCurrentWireSchema: BundleSchema = {
  id: FORCE_ON_CURRENT_WIRE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        field: FIELD,
        currentLow: CURRENT_LOW,
        currentHigh: CURRENT_HIGH,
        wireLength: WIRE_LENGTH,
        wireMass: WIRE_MASS,
        gravity: GRAVITY,
        swingLength: SWING_LENGTH,
        swingOmega: SWING_OMEGA,
        swingDamping: SWING_DAMPING,
        forceScale: FORCE_SCALE,
        chargeCount: CHARGE_COUNT,
        chargeArrow: CHARGE_ARROW,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 왼쪽 자석과 그네, 오른쪽 캡션. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 겹친다 — 자석, 자기장 선, 잔상, 그네 막대, 도선(속을 바탕으로 덮어 장선을
   * 가린다), 전류 표식, 힘, 이름표. 층 순서로는 「도선 속이 장선을 가린다」 를 고를 수 없다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 스위치가 막 닫혀 도선이 튀는 중이다 (S-piece). */
  startAt: 2,

  /**
   * 한 주기 17.1 초. 전류는 단계가 시작하는 순간 바뀐다 — 스위치는 순간이다.
   *
   * - `appear` — 옅게 떠오른다. 앞 주기 끝 화면(멀리 튄 도선)에서 이어지지 않도록.
   * - `rest` — 전류 0. 도선이 곧게 매달려 있다.
   * - `on` — 전류 `currentLow`(⊗, 화면 안쪽). 힘이 왼쪽으로 생기고 도선이 튀었다 가라앉는다.
   * - `reverse` — 전류 −`currentLow`(⊙). 힘이 오른쪽으로 뒤집히고 도선이 반대로 튄다.
   * - `off` — 전류 0. 도선이 돌아온다.
   * - `more` — 전류 `currentHigh`(⊗). 힘이 커지고 더 멀리 튄다. `on` 의 평형을 점선으로 남긴다.
   * - `charges` — 같은 전류. 도선을 키워 보인 확대 창 속 전자마다 같은 쪽으로 향한 작은 힘을 보인다.
   * - `fade` — 옅어지며 물러난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4 },
      { id: 'rest', duration: 1.3, caption: key('caption.rest') },
      { id: 'on', duration: 3, caption: key('caption.on') },
      { id: 'reverse', duration: 3, caption: key('caption.reverse') },
      { id: 'off', duration: 2.2, caption: key('caption.off') },
      { id: 'more', duration: 3.2, caption: key('caption.more') },
      { id: 'charges', duration: 3.4, caption: key('caption.charges') },
      { id: 'fade', duration: 0.6, caption: key('caption.charges') },
    ],
  },

  /** 슬롯 하나. 오른쪽 빈 자리에 세운다 — 세로가 비싸 아래 줄을 쓰지 않는다. */
  caption: {
    anchor: { world: [CAPTION_AT[0], CAPTION_AT[1]] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 290,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 조작기 없음. 잴 거리가 없고, 자동 진행이 켜기 · 뒤집기 · 키우기를 모두 지난다.

  messages: forceOnCurrentWireMessages,
};
