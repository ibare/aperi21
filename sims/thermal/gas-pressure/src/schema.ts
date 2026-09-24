// ========================================================================
// gas-pressure — 선언
// ========================================================================
// 질문: 압력이라는 게 대체 뭐길래, 온도를 올리면 커지나.
//
// 분자가 벽을 때리는 두드림의 **합**이다. 온도를 올리면 분자가 빨라져 더 자주,
// 더 세게 때린다. 압력이 매끈한 숫자로 보이는 것은 두드림이 많아서일 뿐이다.
//
// 이 파일이 담는 것 (원칙 2):
//  - 화면에 뜨는 모든 문자 (`gasPressureMessages`)
//  - 무대 치수와 물리 상수
//  - 자동 진행 시간표 (`TIMELINE`) 와 캡션 슬롯
//  - 프리롤 — 도착한 순간 이미 진행 중이게 하는 선언
//
// 원본: tasks/piece-lab/gas-pressure/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText, TimelineDef } from '@aperi21/schema';

/** 등록 키 `aperi21:gas-pressure` 와 문자 그대로 일치한다 (C4). */
export const GAS_PRESSURE_ID = 'gas-pressure';

// ------------------------------------------------------------------------
// 1. 무대 — 월드 단위는 원본의 논리 px 그대로, y 만 위로 뒤집었다
// ------------------------------------------------------------------------
//
// 배율을 1 에 가깝게 두는 선택이다. `trace` 의 자국 길이는 월드 길이에 배율을
// 곱해 나오므로, 월드 단위를 원본 px 에 맞춰 두면 원본이 재던 길이(7~29 px)를
// 그대로 선언할 수 있다. 미터로 줄여 잡으면 같은 그림을 위해 0.07~0.29 같은
// 수를 적게 되고, 그 수가 무엇을 재는 것인지 읽히지 않는다.

/** 원본 캔버스와 같은 틀. `boundsHint` 가 이 사각형을 화면에 맞춘다. */
export const STAGE = { width: 860, height: 356 } as const;

/** 기체를 가두는 상자. `right` 가 압력을 재는 벽이다. */
export const BOX = { left: 22, right: 690, bottom: 56, top: 334 } as const;

/** 분자 반지름(화면 px). */
export const MOLECULE_RADIUS = 3;

/** 압력 막대. `max` 는 가장 뜨거울 때의 평균 높이(월드). */
export const BAR = { left: 758, right: 818, bottom: 56, max: 230 } as const;

/** 분자 개수. */
export const MOLECULE_COUNT = 280;

/** 자동 진행이 오가는 온도(K). */
export const T_COLD = 180;
export const T_HOT = 720;

/** 속력 눈금 — `v(T) = V_MAX·√(T/T_MAX)` (월드/초). */
export const T_MAX = 750;
export const V_MAX = 300;

/**
 * 분자 배치를 뽑는 시드. 같은 시드는 언제나 같은 첫 화면을 만든다.
 *
 * 난수를 쓰는 것은 `physics.createMolecules` 이고 시드는 인자로 받는다 (S-sim).
 */
export const MOLECULE_SEED = 1;

/** 압력 = 이 시간창에 벽이 받은 충격량의 합 / 창 (초). */
export const PRESSURE_WINDOW = 0.9;

/** 벽 자국이 사라지기까지(초). */
export const HIT_FADE = 0.7;

/** 벽 자국의 길이(월드) — 가장 약한 두드림과 가장 센 두드림. */
export const HIT_TICK_MIN = 7;
export const HIT_TICK_MAX = 29;
/** 자국이 벽에서 떨어져 시작하는 거리(월드). */
export const HIT_TICK_GAP = 3;

/** 압력을 재는 벽의 굵기(화면 px). 나머지 세 벽보다 굵다 — 두께가 곧 뜻이다. */
export const GAUGE_WALL_WIDTH = 5;

/** 수동으로 넘어갔을 때 캡션이 갈리는 온도(K). */
export const CAPTION_COLD_BELOW = 330;
export const CAPTION_HOT_ABOVE = 570;

// ------------------------------------------------------------------------
// 2. 화면 문안 — 저작자가 정한 1층 (C1)
// ------------------------------------------------------------------------

export const gasPressureMessages = Object.freeze({
  'label.title': {
    ko: '기체 분자와 압력',
    en: 'Molecules and pressure',
    ja: '分子と圧力',
    zh: '分子与压强',
    ar: 'الجزيئات والضغط',
    es: 'Moléculas y presión',
    fr: 'Molécules et pression',
    hi: 'अणु और दाब',
    id: 'Molekul dan tekanan',
    pt: 'Moléculas e pressão',
  },
  'label.operation': {
    ko: '두드림이 쌓여 압력이 된다',
    en: 'Pressure is the sum of the knocks',
    ja: '圧力は衝突の総和',
    zh: '压强是撞击的总和',
    ar: 'الضغط هو مجموع الطرقات',
    es: 'La presión es la suma de los golpes',
    fr: 'La pression est la somme des chocs',
    hi: 'दाब टक्करों का योग है',
    id: 'Tekanan adalah jumlah ketukan',
    pt: 'A pressão é a soma das batidas',
  },
  'label.stage': {
    ko: '상자',
    en: 'Box',
    ja: '箱',
    zh: '箱子',
    ar: 'الصندوق',
    es: 'Caja',
    fr: 'Boîte',
    hi: 'डिब्बा',
    id: 'Kotak',
    pt: 'Caixa',
  },
  'label.view': {
    ko: '분자',
    en: 'Molecules',
    ja: '分子',
    zh: '分子',
    ar: 'الجزيئات',
    es: 'Moléculas',
    fr: 'Molécules',
    hi: 'अणु',
    id: 'Molekul',
    pt: 'Moléculas',
  },

  /** 막대 바닥의 두 글자. 범례가 아니라 "이것이 무엇인가" 한 마디다. */
  'label.pressure': {
    ko: '압력',
    en: 'pressure',
    ja: '圧力',
    zh: '压强',
    ar: 'الضغط',
    es: 'presión',
    fr: 'pression',
    hi: 'दाब',
    id: 'tekanan',
    pt: 'pressão',
  },

  'control.temperature': {
    ko: '온도',
    en: 'temperature',
    ja: '温度',
    zh: '温度',
    ar: 'درجة الحرارة',
    es: 'temperatura',
    fr: 'température',
    hi: 'ताप',
    id: 'suhu',
    pt: 'temperatura',
  },

  'caption.cold': {
    ko: '차가운 기체 — 분자가 느리고, 벽을 드문드문 때린다',
    en: 'Cold gas — the molecules are slow and the wall is struck now and then',
    ja: '冷たい気体 — 分子は遅く、壁にはときどきしか当たらない',
    zh: '冷的气体 — 分子很慢，壁只是偶尔被撞一下',
    ar: 'غاز بارد — الجزيئات بطيئة، والجدار لا يُطرَق إلا بين حين وآخر',
    es: 'Gas frío — las moléculas son lentas y la pared recibe un golpe de vez en cuando',
    fr: 'Gaz froid — les molécules sont lentes et la paroi n’est frappée que de temps en temps',
    hi: 'ठंडी गैस — अणु धीमे हैं और दीवार से कभी-कभार ही टकराते हैं',
    id: 'Gas dingin — molekul bergerak lambat dan dinding hanya sesekali terbentur',
    pt: 'Gás frio — as moléculas são lentas e a parede é atingida de vez em quando',
  },
  'caption.warming': {
    ko: '온도를 올린다 — 분자가 빨라진다',
    en: 'Turning the temperature up — the molecules speed up',
    ja: '温度を上げる — 分子が速くなる',
    zh: '升高温度 — 分子变快',
    ar: 'رفع درجة الحرارة — تتسارع الجزيئات',
    es: 'Subiendo la temperatura — las moléculas se aceleran',
    fr: 'On monte la température — les molécules accélèrent',
    hi: 'ताप बढ़ाते हैं — अणु तेज़ हो जाते हैं',
    id: 'Suhu dinaikkan — molekul makin cepat',
    pt: 'Subindo a temperatura — as moléculas aceleram',
  },
  'caption.hot': {
    ko: '뜨거운 기체 — 같은 벽을 더 자주, 더 세게 때린다',
    en: 'Hot gas — the same wall is struck more often and harder',
    ja: '熱い気体 — 同じ壁が、より頻繁に、より強くたたかれる',
    zh: '热的气体 — 同一面壁被撞得更频繁、更用力',
    ar: 'غاز ساخن — يُطرَق الجدار نفسه أكثر وبقوة أكبر',
    es: 'Gas caliente — la misma pared recibe golpes más frecuentes y más fuertes',
    fr: 'Gaz chaud — la même paroi est frappée plus souvent et plus fort',
    hi: 'गर्म गैस — उसी दीवार से अधिक बार और अधिक ज़ोर से टक्कर होती है',
    id: 'Gas panas — dinding yang sama terbentur lebih sering dan lebih keras',
    pt: 'Gás quente — a mesma parede é atingida com mais frequência e mais força',
  },
  'caption.cooling': {
    ko: '온도를 내린다 — 두드림이 잦아들고 압력이 내려간다',
    en: 'Turning the temperature down — the knocks thin out and the pressure falls',
    ja: '温度を下げる — 衝突がまばらになり、圧力が下がる',
    zh: '降低温度 — 撞击变得稀疏，压强下降',
    ar: 'خفض درجة الحرارة — تقلّ الطرقات وينخفض الضغط',
    es: 'Bajando la temperatura — los golpes se espacian y la presión baja',
    fr: 'On baisse la température — les chocs se raréfient et la pression diminue',
    hi: 'ताप घटाते हैं — टक्करें विरल होती हैं और दाब घटता है',
    id: 'Suhu diturunkan — ketukan makin jarang dan tekanan turun',
    pt: 'Baixando a temperatura — as batidas rareiam e a pressão cai',
  },
  /** 독자가 슬라이더를 잡은 뒤, 차갑지도 뜨겁지도 않은 구간에서. */
  'caption.manual': {
    ko: '온도를 바꾸면 두드림의 빈도와 세기가 함께 바뀐다',
    en: 'Change the temperature and both how often and how hard change together',
    ja: '温度を変えると、衝突の頻度と強さがいっしょに変わる',
    zh: '改变温度，撞击的频率和力度会一起改变',
    ar: 'غيّر درجة الحرارة فيتغيّر معًا عدد الطرقات وشدّتها',
    es: 'Cambia la temperatura y cambian a la vez la frecuencia y la fuerza de los golpes',
    fr: 'Changez la température : la fréquence et la force des chocs changent ensemble',
    hi: 'ताप बदलो तो टक्करों की आवृत्ति और ज़ोर दोनों साथ बदलते हैं',
    id: 'Ubah suhu, maka seberapa sering dan seberapa keras ketukan terjadi berubah bersama',
    pt: 'Mude a temperatura e a frequência e a força das batidas mudam juntas',
  },
} satisfies Record<string, LocalizedText>);

export type GasPressureMessageKey = keyof typeof gasPressureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: GasPressureMessageKey): LocalizedText {
  return gasPressureMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GasPressureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 3. 자동 진행 시간표
// ------------------------------------------------------------------------

/**
 * 한 주기 16 초 — 차가운 채로 → 올린다 → 뜨거운 채로 → 내린다.
 *
 * 원본은 이 경계 숫자를 `tempAt` 의 if 사다리와 `captionAt` 의 if 사다리에 **손으로
 * 두 번** 적고 있었고, 한쪽만 고치면 캡션이 화면과 어긋나도 타입도 테스트도 잡지
 * 못했다. 여기 한 벌만 둔다 — 캡션은 엔진이 이 선언에서 고르고, 온도는 `physics`
 * 가 같은 선언을 읽어 낸다.
 *
 * 별도로 내보내는 것은 `physics` 가 읽어야 하기 때문이다. `step` 은 `timeline` 을
 * 받지 않는다(`scene` 만 받는다) — 그래도 숫자의 출처는 이 선언 하나다.
 */
export const TIMELINE: TimelineDef = {
  phases: [
    { id: 'cold', duration: 3.5, caption: key('caption.cold') },
    { id: 'warming', duration: 4.5, ease: 'smooth', caption: key('caption.warming') },
    { id: 'hot', duration: 3.5, caption: key('caption.hot') },
    { id: 'cooling', duration: 4.5, ease: 'smooth', caption: key('caption.cooling') },
  ],
};

/**
 * 마운트 전에 미리 굴리는 시간(초).
 *
 * 압력 막대는 최근 0.9 초의 이력에서 나오므로 아무것도 굴리지 않으면 t=0 에서 0 이다.
 * 도착하자마자 막대가 바닥에서 자라 오르는 것은 *도착한 순간 이미 진행 중* 을 어긴다
 * (S-piece). 원본은 초기화에서 `t = -2 → 0` 을 손으로 돌렸고, 그 2 초가 이 한 줄이다.
 *
 * `initialState` 가 시계를 `-2` 에서 시작하므로 프리롤이 끝나면 조각 시계와 엔진
 * 시계가 둘 다 0 이다 — 시간표가 주기 함수라 음수 시각도 그대로 정의된다.
 */
export const PREROLL_SECONDS = 2;

// ------------------------------------------------------------------------
// 4. BundleSchema
// ------------------------------------------------------------------------

export const gasPressureSchema: BundleSchema = {
  id: GAS_PRESSURE_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 읽는 사람이 고를 것은 없다. 손잡이는 조작기 하나뿐이다 (controllers.ts).
  parameters: [],

  stages: [{ id: 'box', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'molecules', label: text('label.view'), default: true }],


  // 마운트 후 바뀌지 않는다 (원칙 6). 원본 캔버스와 같은 비율이다.
  canvas: { height: 356, minHeight: 320 },

  preroll: PREROLL_SECONDS,
  timeline: TIMELINE,

  /**
   * 캡션 슬롯 하나.
   *
   * 자동 진행 중에는 시간표의 단계가 말하고, 독자가 슬라이더를 잡은 뒤에는
   * **상태**가 말한다 — 그때는 시각이 아니라 지금 온도가 문장을 가른다.
   * 위에서부터 훑어 참인 첫 항목을 쓴다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    cases: [
      { when: 'caption.manualCold', text: key('caption.cold') },
      { when: 'caption.manualHot', text: key('caption.hot') },
      { when: 'caption.manualMid', text: key('caption.manual') },
    ],
  },

  /**
   * 크롬은 하나도 켜지 않는다 (기본값). 특히 **압력에 눈금도 기준선도 두지
   * 않는다** — 축을 세우는 순간 조각이 그래프가 되고, 압력은 임의 단위라 눈금은
   * 거짓 정밀이기도 하다. "커졌다" 는 자취 길이 · 벽 자국의 밀도 · 막대 높이
   * 셋이 함께 움직이는 것으로 읽힌다.
   */

  messages: gasPressureMessages,
};
