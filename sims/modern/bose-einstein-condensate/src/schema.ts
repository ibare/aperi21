// ========================================================================
// bose-einstein-condensate — 선언
// ========================================================================
// 질문: 원자 기체를 식히면 원자들이 느려진다. 끝까지 식히면 그저 「더 느려진」
// 기체가 되는가?
//
// 보손 원자는 아니다. 임계 온도 Tc 위에서는 식힐수록 둥근 언덕(속도 분포)이 매끄럽게
// 좁아질 뿐이지만, Tc 아래로 내려가면 많은 원자가 **가장 낮은 한 상태**로 몰린다 —
// 덫 속 구름 한가운데에 원자들이 한 점으로 무너지고, 속도 분포 한가운데에 뾰족한
// 봉우리가 선다(1995 년 루비듐 실험의 세 봉우리 그림).
//
// 준위를 아래부터 채우는 그림(파울리 배타 원리)은 이웃 조각 `pauli-exclusion` 의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:bose-einstein-condensate` 와 문자 그대로 일치한다 (C4). */
export const BOSE_EINSTEIN_CONDENSATE_ID = 'bose-einstein-condensate';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 온도는 임계 온도 Tc 를 1 로 둔 상대 단위다.
// ------------------------------------------------------------------------

/** 식히기 시작하는 온도(Tc 배). 응축이 없는 뜨거운 기체다. */
export const T_HIGH = 2;
/** 첫 멈춤 — Tc 바로 아래. 원자의 일부만 바닥 상태로 몰린 두 겹 분포(언덕 + 봉우리)다. */
export const T_MID = 0.8;
/** 마지막 멈춤 — 거의 모든 원자가 바닥 상태에 있다. */
export const T_LOW = 0.3;
/**
 * 바닥 상태 몫의 거듭제곱 — 조화 덫 속 이상 보스 기체의 N₀/N = 1 − (T/Tc)^n, n = 3.
 * Tc 위에서는 0 이다.
 */
export const CONDENSATE_EXPONENT = 3;
/** 그리는 원자 수. 실제 실험은 수천 개이지만 점 밀도가 읽히는 만큼만 둔다. */
export const ATOM_COUNT = 600;
/** Tc 에서 열운동 구름의 폭(월드, 표준편차). 폭은 √T 에 비례한다. */
export const THERMAL_WIDTH_AT_TC = 0.6;
/**
 * 바닥 상태의 폭(월드, 표준편차). 온도와 무관하다 — 덫의 가장 낮은 상태의 크기다.
 * 실제로는 열 구름보다 훨씬 작지만, 봉우리 옆 열 언덕이 판에서 보일 만큼 키웠다
 * (NOTES (b)).
 */
export const GROUND_WIDTH = 0.12;
/**
 * 원자 하나가 바닥 상태로 건너가는 몫의 너비(바닥 상태 몫 단위). 원자마다 건너가는
 * 문턱이 다르므로 단계로 풀 수 없어 상수로 둔다 — 0 이면 원자가 순간 이동한다.
 */
export const JOIN_SPREAD = 0.08;
/** 덫 속 진동의 각진동수(rad/s, 화면 시간) — 가로 · 세로. 덫이 조금 찌그러져 있어 둘이 다르다. */
export const TRAP_OMEGA_X = 0.9;
export const TRAP_OMEGA_Y = 1.17;
/** 원자 흩뿌림의 시드. 같은 시드는 언제나 같은 구름이다 (S-sim). */
export const SEED = 1995;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 덫 속 원자 구름의 가운데. */
export const CLOUD_CENTER = [-3.6, 0.3] as const;
/** 속도 분포 판 — 가로축의 가운데(v = 0) · 바닥 높이 · 반폭. 가로 배율은 구름과 같다. */
export const PROFILE_CENTER_X = 4.3;
export const PROFILE_BASE_Y = -2.1;
export const PROFILE_HALF_WIDTH = 3.3;
/** 가장 높은 봉우리(T_LOW)의 높이(월드). 세로 배율은 이 값에 맞춰 한 번 정한다 — 매 프레임 같다. */
export const PROFILE_PEAK_HEIGHT = 4.5;
/** 온도계 — 가로 자리 · 바닥 · 꼭대기(T_HIGH 가 닿는 높이) · 반폭. */
export const THERMO_X = -8.1;
export const THERMO_BOTTOM = -2.1;
export const THERMO_TOP = 2.4;
export const THERMO_HALF_WIDTH = 0.16;

/**
 * 프레이밍은 주장의 일부다. 가로는 온도계 이름표(왼쪽)부터 속도축 이름(오른쪽)까지,
 * 세로는 판 이름표와 캡션 한 줄(아래)부터 가장 높은 봉우리 이름표(위)까지. 캡션 슬롯은
 * 프레이밍 여백으로 잡히지 않아 아래 자리를 미리 잡는다 (장부 G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -9.3, maxX: 8.4, minY: -3.75, maxY: 3.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이. 경계는 선언이 정하고 physics 는 `at()` 으로 묻는다.
// ------------------------------------------------------------------------

/** 새 주기의 구름이 나타나는 동안(초). */
export const APPEAR = 0.5;
/** 뜨거운 기체를 보는 동안(초). */
export const HOT = 1.2;
/** T_HIGH → Tc 로 식히는 동안(초). 언덕이 좁아지기만 한다. */
export const COOL_TO_TC = 3.2;
/** Tc → T_MID 로 식히는 동안(초). 봉우리가 서기 시작한다. */
export const COOL_BELOW = 2.4;
/** 두 겹 분포(언덕 + 봉우리)를 보는 동안(초). */
export const HOLD_MID = 1.4;
/** T_MID → T_LOW 로 더 식히는 동안(초). */
export const COOL_DEEP = 2.4;
/** 다 식힌 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안(초). */
export const HOLD = 2.6;
export const FADE = 0.6;
/** 도착한 순간 이미 식고 있도록 시계를 앞당기는 양(초). */
export const START_AT = 2.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const boseEinsteinCondensateMessages = Object.freeze({
  'label.title': {
    ko: '보스-아인슈타인 응축',
    en: 'Bose–Einstein condensation',
    ja: 'ボース＝アインシュタイン凝縮',
    zh: '玻色-爱因斯坦凝聚',
    ar: 'تكاثف بوز–أينشتاين',
    es: 'Condensación de Bose–Einstein',
    fr: 'Condensation de Bose–Einstein',
    hi: 'बोस–आइंस्टाइन संघनन',
    id: 'Kondensasi Bose–Einstein',
    pt: 'Condensação de Bose–Einstein',
  },
  'label.operation': {
    ko: '같은 상태로 몰리는 저온의 입자',
    en: 'Cold particles crowding into one state',
    ja: '一つの状態に押し寄せる冷たい粒子',
    zh: '挤进同一状态的低温粒子',
    ar: 'جسيمات باردة تتزاحم في حالة واحدة',
    es: 'Partículas frías que se agolpan en un solo estado',
    fr: 'Des particules froides qui s’entassent dans un seul état',
    hi: 'एक ही अवस्था में सिमटते ठंडे कण',
    id: 'Partikel dingin yang berdesakan ke satu keadaan',
    pt: 'Partículas frias que se amontoam num só estado',
  },
  'label.stage': {
    ko: '루비듐 원자 기체',
    en: 'A gas of rubidium atoms',
    ja: 'ルビジウム原子の気体',
    zh: '铷原子气体',
    ar: 'غاز من ذرات الروبيديوم',
    es: 'Un gas de átomos de rubidio',
    fr: 'Un gaz d’atomes de rubidium',
    hi: 'रुबिडियम परमाणुओं की गैस',
    id: 'Gas atom rubidium',
    pt: 'Um gás de átomos de rubídio',
  },
  'label.view': {
    ko: '덫 속 원자와 속도 분포',
    en: 'Trapped atoms and their velocity distribution',
    ja: 'トラップ中の原子とその速度分布',
    zh: '阱中的原子及其速度分布',
    ar: 'الذرات المحتجزة وتوزيع سرعاتها',
    es: 'Átomos atrapados y su distribución de velocidades',
    fr: 'Atomes piégés et leur distribution des vitesses',
    hi: 'फँसे परमाणु और उनका वेग वितरण',
    id: 'Atom terperangkap dan distribusi kecepatannya',
    pt: 'Átomos aprisionados e sua distribuição de velocidades',
  },
  /** 판 이름. */
  'label.cloud': {
    ko: '덫 속 원자',
    en: 'atoms in the trap',
    ja: 'トラップ中の原子',
    zh: '阱中的原子',
    ar: 'الذرات في المصيدة',
    es: 'átomos en la trampa',
    fr: 'atomes dans le piège',
    hi: 'जाल में परमाणु',
    id: 'atom di dalam perangkap',
    pt: 'átomos na armadilha',
  },
  'label.profile': {
    ko: '속도 분포',
    en: 'velocity distribution',
    ja: '速度分布',
    zh: '速度分布',
    ar: 'توزيع السرعات',
    es: 'distribución de velocidades',
    fr: 'distribution des vitesses',
    hi: 'वेग वितरण',
    id: 'distribusi kecepatan',
    pt: 'distribuição de velocidades',
  },
  'label.thermo': {
    ko: '온도',
    en: 'temperature',
    ja: '温度',
    zh: '温度',
    ar: 'درجة الحرارة',
    es: 'temperatura',
    fr: 'température',
    hi: 'तापमान',
    id: 'suhu',
    pt: 'temperatura',
  },
  /** 임계 온도 눈금. 기호라 표식이지만 저작자가 바꿀 수 있게 문안 키로 둔다. */
  'label.tc': {
    ko: 'Tc',
    en: 'Tc',
    ja: 'Tc',
    zh: 'Tc',
    ar: 'Tc',
    es: 'Tc',
    fr: 'Tc',
    hi: 'Tc',
    id: 'Tc',
    pt: 'Tc',
  },
  /** 속도축 · 그 가운데. 기호와 수는 표식이다 (C1 판정 3). */
  'label.v': {
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
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
  /** 봉우리 이름. 봉우리가 서는 동안 나타난다. */
  'label.peak': {
    ko: '가장 낮은 한 상태',
    en: 'the single lowest state',
    ja: 'ただ一つの最低の状態',
    zh: '唯一的最低状态',
    ar: 'الحالة الأدنى الوحيدة',
    es: 'el único estado más bajo',
    fr: 'l’unique état le plus bas',
    hi: 'एकमात्र न्यूनतम अवस्था',
    id: 'satu keadaan terendah',
    pt: 'o único estado mais baixo',
  },
  'caption.hot': {
    ko: '뜨거운 원자 기체 — 속도가 제각각이라 덫 속에 넓게 퍼져 있다',
    en: 'A hot gas of atoms — their speeds vary widely, so they spread across the trap',
    ja: '熱い原子の気体 — 速さがまちまちなので、トラップ中に広く散らばっている',
    zh: '热的原子气体 — 它们的速率各不相同，因此散布在整个阱中',
    ar: 'غاز ذرات ساخن — تتفاوت سرعاتها كثيرًا، فتنتشر في أرجاء المصيدة',
    es: 'Un gas caliente de átomos — sus rapideces varían mucho, así que se reparten por la trampa',
    fr: 'Un gaz d’atomes chaud — leurs vitesses varient beaucoup, ils s’étalent donc dans tout le piège',
    hi: 'परमाणुओं की गर्म गैस — उनकी चालें बहुत अलग-अलग हैं, इसलिए वे पूरे जाल में फैले हैं',
    id: 'Gas atom yang panas — kelajuannya sangat beragam, sehingga tersebar di seluruh perangkap',
    pt: 'Um gás quente de átomos — suas velocidades variam muito, então se espalham pela armadilha',
  },
  'caption.coolToTc': {
    ko: '식히면 구름이 줄어들고 속도 분포도 좁아진다 — 아직 둥근 언덕 하나다',
    en: 'Cooling shrinks the cloud and narrows the distribution — still one rounded hill',
    ja: '冷やすと雲は縮み、分布も狭まる — まだ丸い山が一つだけだ',
    zh: '冷却使原子云收缩，分布变窄 — 仍是一个圆润的山丘',
    ar: 'التبريد يقلّص السحابة ويضيّق التوزيع — ما زال تلًّا مستديرًا واحدًا',
    es: 'Al enfriar, la nube se encoge y la distribución se estrecha — sigue siendo una sola colina redondeada',
    fr: 'Refroidir contracte le nuage et resserre la distribution — toujours une seule colline arrondie',
    hi: 'ठंडा करने से बादल सिकुड़ता है और वितरण संकरा होता है — अब भी एक ही गोल पहाड़ी है',
    id: 'Pendinginan menyusutkan awan dan menyempitkan distribusi — masih satu bukit yang membulat',
    pt: 'O resfriamento encolhe a nuvem e estreita a distribuição — ainda uma só colina arredondada',
  },
  'caption.below': {
    ko: '임계 온도 아래 — 원자들이 가장 낮은 한 상태로 몰려 한가운데에 봉우리가 선다',
    en: 'Below the critical temperature, atoms crowd into the single lowest state and a spike rises in the middle',
    ja: '臨界温度より下では、原子がただ一つの最低の状態に押し寄せ、真ん中に鋭いピークが立つ',
    zh: '低于临界温度时，原子挤进唯一的最低状态，中间耸起一个尖峰',
    ar: 'تحت درجة الحرارة الحرجة، تتزاحم الذرات في الحالة الأدنى الوحيدة ويرتفع نتوء حادّ في المنتصف',
    es: 'Por debajo de la temperatura crítica, los átomos se agolpan en el único estado más bajo y se alza un pico agudo en el centro',
    fr: 'Sous la température critique, les atomes s’entassent dans l’unique état le plus bas et un pic étroit se dresse au milieu',
    hi: 'क्रांतिक तापमान से नीचे परमाणु एकमात्र न्यूनतम अवस्था में सिमट जाते हैं और बीच में एक नुकीला शिखर उठता है',
    id: 'Di bawah suhu kritis, atom-atom berdesakan ke satu keadaan terendah dan sebuah puncak tajam muncul di tengah',
    pt: 'Abaixo da temperatura crítica, os átomos se amontoam no único estado mais baixo e um pico agudo se ergue no meio',
  },
  'caption.deep': {
    ko: '더 식히면 언덕은 사라져 가고, 원자들은 거의 모두 봉우리로 들어간다',
    en: 'Cooling further, the hill fades away and nearly every atom joins the spike',
    ja: 'さらに冷やすと山は消えていき、ほとんどすべての原子が鋭いピークに加わる',
    zh: '继续冷却，山丘渐渐消失，几乎所有原子都汇入尖峰',
    ar: 'مع مزيد من التبريد يتلاشى التل، وتنضمّ الذرات كلها تقريبًا إلى النتوء',
    es: 'Al enfriar más, la colina se desvanece y casi todos los átomos se suman al pico',
    fr: 'En refroidissant encore, la colline s’efface et presque tous les atomes rejoignent le pic',
    hi: 'और ठंडा करने पर पहाड़ी मिटती जाती है और लगभग हर परमाणु शिखर में जा मिलता है',
    id: 'Didinginkan lebih jauh, bukit memudar dan hampir semua atom bergabung ke puncak',
    pt: 'Resfriando mais, a colina se desfaz e quase todos os átomos se juntam ao pico',
  },
  'caption.hold': {
    ko: '원자 대부분이 한 상태에 있다 — 구름은 한 점으로 무너졌다',
    en: 'Most atoms now share one state — the cloud has collapsed to a point',
    ja: 'いまや原子の大半が一つの状態にある — 雲は一点に崩れ落ちた',
    zh: '现在大多数原子处于同一状态 — 原子云坍缩成一个点',
    ar: 'معظم الذرات الآن في حالة واحدة — انهارت السحابة إلى نقطة',
    es: 'Ahora la mayoría de los átomos comparten un estado — la nube se ha colapsado en un punto',
    fr: 'La plupart des atomes partagent désormais un seul état — le nuage s’est effondré en un point',
    hi: 'अब अधिकांश परमाणु एक ही अवस्था में हैं — बादल एक बिंदु में सिमट गया है',
    id: 'Kini sebagian besar atom berada dalam satu keadaan — awan telah runtuh menjadi satu titik',
    pt: 'Agora a maioria dos átomos compartilha um só estado — a nuvem colapsou num ponto',
  },
} satisfies Record<string, LocalizedText>);

export type BoseEinsteinCondensateMessageKey = keyof typeof boseEinsteinCondensateMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BoseEinsteinCondensateMessageKey): LocalizedText => boseEinsteinCondensateMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BoseEinsteinCondensateMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const boseEinsteinCondensateSchema: BundleSchema = {
  id: BOSE_EINSTEIN_CONDENSATE_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 식고 있고, 봉우리가 서고, 다시 데워져 처음부터 식는다.
  parameters: [],

  stages: [
    {
      id: 'rubidium',
      label: text('label.stage'),
      constants: {
        tHigh: T_HIGH,
        tMid: T_MID,
        tLow: T_LOW,
        condensateExponent: CONDENSATE_EXPONENT,
        atomCount: ATOM_COUNT,
        thermalWidthAtTc: THERMAL_WIDTH_AT_TC,
        groundWidth: GROUND_WIDTH,
        joinSpread: JOIN_SPREAD,
        trapOmegaX: TRAP_OMEGA_X,
        trapOmegaY: TRAP_OMEGA_Y,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'trap-and-velocity', label: text('label.view'), default: true }],

  /** 가로로 넓은 세 판(온도계 · 구름 · 분포)과 캡션 한 줄. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 한 주기 = 나타남 → 뜨거움 → Tc 까지 식힘 → Tc 아래로 식힘 → 두 겹 분포 → 더 식힘
   * → 읽기 → 흐려짐. 온도는 식힘 단계들의 진행도 합이라 멈춤 단계에서는 저절로 멈춘다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, caption: key('caption.hot') },
      { id: 'hot', duration: HOT, caption: key('caption.hot') },
      { id: 'cool-to-tc', duration: COOL_TO_TC, ease: 'smooth', caption: key('caption.coolToTc') },
      { id: 'cool-below', duration: COOL_BELOW, ease: 'smooth', caption: key('caption.below') },
      { id: 'hold-mid', duration: HOLD_MID, caption: key('caption.below') },
      { id: 'cool-deep', duration: COOL_DEEP, ease: 'smooth', caption: key('caption.deep') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fade', duration: FADE, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 구름이 이미 줄어들고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 「퍼졌는가, 한 점으로
   * 몰렸는가」 이고, 속도 분포의 세로축에도 값이 없다 — 높이의 대비가 전부다.
   */

  messages: boseEinsteinCondensateMessages,
};
