// ========================================================================
// drift-velocity — 선언
// ========================================================================
// 질문: 전자는 도선 속을 초당 0.1 mm 쯤 기어간다는데, 왜 스위치를 켜면 등은 곧바로
// 켜지는가.
//
// 네모 고리 회로 — 왼쪽에 전지, 아래 변에 스위치, 오른쪽 변에 전구. 도선 속 전자는
// 스위치가 열려 있을 때도 제자리에서 마구 흔들린다(열운동). 스위치를 닫는 순간 등이
// 켜지고, 도선 **곳곳의** 전자가 한꺼번에 한 방향으로 조금씩 밀리기 시작한다. 그동안
// 스위치 옆에 표시한 전자 하나는 닫을 때의 자리에서 겨우 조금 나아갔을 뿐이다 —
// 등을 켠 것은 전구까지 달려간 전자가 아니라, 이미 도선 전체에 차 있던 전자들이
// 동시에 밀리기 시작한 것이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:drift-velocity` 와 문자 그대로 일치한다 (C4). */
export const DRIFT_VELOCITY_ID = 'drift-velocity';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전자의 표류 속력(mm/s) — 보통 구리 도선에 흔한 전류에서의 정박값. 화면 이름표가 이 값을 그대로 쓴다. */
export const DRIFT_MM_PER_S = 0.1;
/** 월드 한 단위가 나타내는 길이(mm). 고리 가로 10 단위 = 10 cm 짜리 작은 회로. */
export const WORLD_MM = 10;
/**
 * 표류 과장 배율. 실제 빠르기로는 한 주기(켜진 8 초) 동안 0.8 mm — 화면에서 5 px 쯤이라
 * 움직였는지 가릴 수 없다. 이 배율만큼 빠르게 보인다. 이름표는 실제 값(`DRIFT_MM_PER_S`)을 쓴다.
 */
export const DRIFT_EXAGGERATION = 4;
/** 열운동 흔들림의 크기(월드) — 전자의 제자리 둘레에서 벗어나는 거리. 실제 크기가 아니라 표현이다 (NOTES (b)). */
export const THERMAL_AMPLITUDE = 0.07;
/** 열운동 흔들림이 방향을 바꾸는 빈도(Hz). 1 초에 이만큼 새 자리로 튄다. */
export const THERMAL_RATE = 6;
/** 전자 사이 간격(월드). 고리 둘레에 맞춰 조금 고쳐 고르게 놓는다. */
export const CARRIER_SPACING = 0.4;
/** 표류 꼬리 길이 = 화면 표류 속력 × 이 시간(초). 밀리는 방향을 정지 화면에서도 읽히게 한다. */
export const TRAIL_SECONDS = 4;
/** 열운동 잡음의 시드. 같은 시드 · 같은 시각은 언제나 같은 화면이다. */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 전자가 도는 방향(왼쪽 변 아래로 → 아래 변 오른쪽으로 → 오른쪽 변 위로 →
// 위 변 왼쪽으로)으로 고리를 적는다.
// ------------------------------------------------------------------------

export const LOOP_LEFT = -5;
export const LOOP_RIGHT = 5;
export const LOOP_TOP = 1.5;
export const LOOP_BOTTOM = -1.5;

/** 전지 — 왼쪽 변 위의 가운데 높이와 두 판 사이 간격. 긴 판(+)이 위, 짧은 판(−)이 아래. */
export const BATTERY_Y = 0.2;
export const BATTERY_PLATE_GAP = 0.28;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;
/** 전지 부호(+ · −) 이름표의 x. */
export const BATTERY_SIGN_X = -5.72;

/** 스위치 — 아래 변 위의 경첩과 닿는 자리(x). 전지 가까이 둔다. */
export const SWITCH_HINGE_X = -3.6;
export const SWITCH_CONTACT_X = -2.8;

/** 표시할 전자를 고르는 자리(x, 아래 변 위) — 스위치 바로 옆. */
export const TAG_SITE_X = -2.1;

/** 전구 — 오른쪽 변 가운데. 스위치에서 도선을 따라 가장 먼 쪽에 가깝다. */
export const LAMP_Y = 0;
export const LAMP_RADIUS = 0.42;

/** 전자 방향 표식(`e⁻` 화살표)의 꼬리 자리 · 길이. 고리 안쪽, 아래 변 위에 놓는다. */
export const ELECTRON_ARROW_FROM = [0.2, -0.95] as const;
export const ELECTRON_ARROW_LEN = 1.1;

/**
 * 프레이밍은 주장의 일부다. 가로는 전지 부호부터 전구 빛살 끝까지, 세로는 캡션 줄부터
 * 위 변 위 여유까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6.2, maxX: 6.3, minY: -2.35, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 표시 고리가 나타나는 동안 · 열린 채 흔들리기만 하는 동안. */
export const TAG = 0.6;
export const OPEN = 1.8;
/** 스위치 레버가 내려와 닿는 동안. 닿는 순간(이 단계의 끝)이 닫힘이다. */
export const CLOSE = 0.5;
/** 켜진 채 흐르는 동안 — 앞은 「한꺼번에 밀린다」, 뒤는 「표시한 전자는 겨우 이만큼」. */
export const LIT = 4;
export const COMPARE = 4;
/** 레버가 들리는 동안 · 표시가 사라지는 동안. 들리기 시작하는 순간(이 단계의 시작)이 끊김이다. */
export const RELEASE = 0.5;
export const UNTAG = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const driftVelocityMessages = Object.freeze({
  'label.title': {
    ko: '표류 속도',
    en: 'Drift velocity',
    ja: 'ドリフト速度',
    zh: '漂移速度',
    ar: 'سرعة الانجراف',
    es: 'Velocidad de deriva',
    fr: 'Vitesse de dérive',
    hi: 'अपवाह वेग',
    id: 'Kecepatan hanyut',
    pt: 'Velocidade de deriva',
  },
  'label.operation': {
    ko: '느린 전자와 빠른 신호',
    en: 'Slow electrons, fast signal',
    ja: '遅い電子と速い信号',
    zh: '缓慢的电子与快速的信号',
    ar: 'إلكترونات بطيئة وإشارة سريعة',
    es: 'Electrones lentos, señal rápida',
    fr: 'Électrons lents, signal rapide',
    hi: 'धीमे इलेक्ट्रॉन, तेज़ संकेत',
    id: 'Elektron lambat, sinyal cepat',
    pt: 'Elétrons lentos, sinal rápido',
  },
  'label.stage': {
    ko: '작은 회로',
    en: 'A small circuit',
    ja: '小さな回路',
    zh: '一个小电路',
    ar: 'دائرة صغيرة',
    es: 'Un circuito pequeño',
    fr: 'Un petit circuit',
    hi: 'एक छोटा परिपथ',
    id: 'Sebuah rangkaian kecil',
    pt: 'Um circuito pequeno',
  },
  'label.view': {
    ko: '고리 회로',
    en: 'Circuit loop',
    ja: '環状の回路',
    zh: '环形电路',
    ar: 'حلقة الدائرة',
    es: 'Lazo del circuito',
    fr: 'Boucle du circuit',
    hi: 'परिपथ लूप',
    id: 'Loop rangkaian',
    pt: 'Laço do circuito',
  },
  /** 전자 · 전지 극 기호 (C1 판정 3 — 표식). */
  'label.electron': { ko: 'e⁻', en: 'e⁻', ja: 'e⁻', zh: 'e⁻', ar: 'e⁻', es: 'e⁻', fr: 'e⁻', hi: 'e⁻', id: 'e⁻', pt: 'e⁻' },
  'label.plus': { ko: '+', en: '+', ja: '+', zh: '+', ar: '+', es: '+', fr: '+', hi: '+', id: '+', pt: '+' },
  'label.minus': { ko: '−', en: '−', ja: '−', zh: '−', ar: '−', es: '−', fr: '−', hi: '−', id: '−', pt: '−' },
  /** 표시한 전자의 실제 빠르기. 값은 스테이지 상수를 그대로 끼운다. */
  'label.realSpeed': {
    ko: '실제 약 {v} mm/s',
    en: 'really about {v} mm/s',
    ja: '実際は約 {v} mm/s',
    zh: '实际约 {v} mm/s',
    ar: 'في الواقع نحو {v} mm/s',
    es: 'en realidad unos {v} mm/s',
    fr: 'en réalité environ {v} mm/s',
    hi: 'वास्तव में लगभग {v} mm/s',
    id: 'sebenarnya sekitar {v} mm/s',
    pt: 'na verdade cerca de {v} mm/s',
  },
  'caption.open': {
    ko: '스위치가 열려 있다 — 도선 속 전자는 제자리에서 마구 흔들릴 뿐 어느 쪽으로도 나아가지 않는다',
    en: 'The switch is open — the electrons in the wire jiggle wildly in place but go nowhere',
    ja: 'スイッチが開いている — 導線の中の電子はその場で激しく揺れるだけで、どこへも進まない',
    zh: '开关断开 — 导线中的电子只在原地剧烈抖动，哪儿也不去',
    ar: 'المفتاح مفتوح — الإلكترونات في السلك تهتز بعنف في أماكنها لكنها لا تتقدم إلى أي مكان',
    es: 'El interruptor está abierto — los electrones del cable se agitan con fuerza en su sitio, pero no avanzan hacia ningún lado',
    fr: 'L’interrupteur est ouvert — les électrons du fil s’agitent fortement sur place mais n’avancent nulle part',
    hi: 'स्विच खुला है — तार के इलेक्ट्रॉन अपनी जगह पर तेज़ी से काँपते हैं पर कहीं आगे नहीं बढ़ते',
    id: 'Sakelar terbuka — elektron di dalam kawat bergetar hebat di tempatnya tetapi tidak bergerak ke mana pun',
    pt: 'A chave está aberta — os elétrons no fio se agitam intensamente no lugar, mas não vão a lugar nenhum',
  },
  'caption.close': {
    ko: '스위치를 닫는다',
    en: 'The switch closes',
    ja: 'スイッチを閉じる',
    zh: '闭合开关',
    ar: 'يُغلَق المفتاح',
    es: 'El interruptor se cierra',
    fr: 'L’interrupteur se ferme',
    hi: 'स्विच बंद होता है',
    id: 'Sakelar ditutup',
    pt: 'A chave se fecha',
  },
  'caption.lit': {
    ko: '등이 곧바로 켜졌다 — 도선 곳곳의 전자가 한꺼번에 한쪽으로 밀리기 시작했다',
    en: 'The lamp lights at once — electrons all along the wire start drifting together',
    ja: '電球はすぐに点く — 導線のいたるところの電子が一斉にドリフトし始める',
    zh: '灯泡立刻亮了 — 导线各处的电子一齐开始漂移',
    ar: 'يضيء المصباح فورًا — تبدأ الإلكترونات على طول السلك كله بالانجراف معًا',
    es: 'La bombilla se enciende al instante — los electrones de todo el cable empiezan a derivar a la vez',
    fr: 'La lampe s’allume aussitôt — les électrons tout le long du fil se mettent à dériver ensemble',
    hi: 'बल्ब तुरंत जल उठता है — पूरे तार में इलेक्ट्रॉन एक साथ अपवाहित होने लगते हैं',
    id: 'Lampu langsung menyala — elektron di sepanjang kawat mulai hanyut bersama-sama',
    pt: 'A lâmpada acende na hora — os elétrons ao longo de todo o fio começam a derivar juntos',
  },
  'caption.compare': {
    ko: '그동안 표시한 전자는 닫을 때의 자리에서 겨우 이만큼 나아갔다',
    en: 'Meanwhile the marked electron has crept only this far from where it was',
    ja: 'その間、印をつけた電子は元の位置からこれだけしか進んでいない',
    zh: '与此同时，做了标记的电子离原来的位置只挪动了这么一点',
    ar: 'في هذه الأثناء لم يزحف الإلكترون المُعلَّم عن موضعه الأول إلا هذه المسافة',
    es: 'Mientras tanto, el electrón marcado solo ha avanzado esto desde donde estaba',
    fr: 'Pendant ce temps, l’électron marqué n’a progressé que jusque-là depuis sa position de départ',
    hi: 'इस बीच चिह्नित इलेक्ट्रॉन अपनी जगह से बस इतना ही सरका है',
    id: 'Sementara itu elektron yang ditandai baru merayap sejauh ini dari tempatnya semula',
    pt: 'Enquanto isso, o elétron marcado avançou só até aqui desde onde estava',
  },
  'caption.release': {
    ko: '스위치를 열자 등이 곧바로 꺼지고, 전자들도 한꺼번에 밀리기를 멈춘다',
    en: 'Open the switch and the lamp goes out at once — every electron stops drifting together',
    ja: 'スイッチを開くと電球はすぐに消える — どの電子も一斉にドリフトをやめる',
    zh: '断开开关，灯泡立刻熄灭 — 所有电子一齐停止漂移',
    ar: 'افتح المفتاح فينطفئ المصباح فورًا — ويتوقف كل إلكترون عن الانجراف في اللحظة نفسها',
    es: 'Abre el interruptor y la bombilla se apaga al instante — todos los electrones dejan de derivar a la vez',
    fr: 'On ouvre l’interrupteur et la lampe s’éteint aussitôt — tous les électrons cessent de dériver ensemble',
    hi: 'स्विच खोलते ही बल्ब तुरंत बुझ जाता है — हर इलेक्ट्रॉन एक साथ अपवाहित होना बंद कर देता है',
    id: 'Buka sakelar dan lampu langsung padam — semua elektron berhenti hanyut bersama-sama',
    pt: 'Abra a chave e a lâmpada apaga na hora — todos os elétrons param de derivar juntos',
  },
} satisfies Record<string, LocalizedText>);

export type DriftVelocityMessageKey = keyof typeof driftVelocityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DriftVelocityMessageKey): LocalizedText => driftVelocityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DriftVelocityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const driftVelocitySchema: BundleSchema = {
  id: DRIFT_VELOCITY_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흔들리고, 닫히면 켜지며 밀리고, 표시한 전자를 견주고, 다시 연다.
  parameters: [],

  stages: [
    {
      id: 'small-circuit',
      label: text('label.stage'),
      constants: {
        driftMmPerS: DRIFT_MM_PER_S,
        worldMm: WORLD_MM,
        driftExaggeration: DRIFT_EXAGGERATION,
        thermalAmplitude: THERMAL_AMPLITUDE,
        thermalRate: THERMAL_RATE,
        carrierSpacing: CARRIER_SPACING,
        trailSeconds: TRAIL_SECONDS,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'loop', label: text('label.view'), default: true }],

  /** 고리 하나와 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 340, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 전자는 도선 띠 **위**에, 표시 고리는 전자 위에, 전구 둘레는
   * 빛 위에 와야 한다. 층 순서로는 선 묶음이 입자 위로 올라와 전자가 띠에 묻힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 표시 → 열림 → 닫힘 → 켜짐(한꺼번에 밀림) → 견줌 → 열림 → 표시 지움.
   *
   * 닫힘의 끝과 열림의 시작이 곧 전류가 흐르기 시작 · 멈추는 순간이다. 전구 · 표류 ·
   * 꼬리가 모두 이 두 경계를 함께 읽어 **같은 순간에** 바뀐다.
   */
  timeline: {
    phases: [
      { id: 'tag', duration: TAG, caption: key('caption.open') },
      { id: 'open', duration: OPEN, caption: key('caption.open') },
      { id: 'close', duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
      { id: 'lit', duration: LIT, caption: key('caption.lit') },
      { id: 'compare', duration: COMPARE, caption: key('caption.compare') },
      { id: 'release', duration: RELEASE, ease: 'smooth', caption: key('caption.release') },
      { id: 'untag', duration: UNTAG, caption: key('caption.release') },
    ],
  },

  /** 도착한 순간 이미 흔들리고 있다 — 전자는 모든 시각에 도선을 채우고 떤다. */
  startAt: 0.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 「거의 제자리」 라는 견줌이다. */

  messages: driftVelocityMessages,
};
