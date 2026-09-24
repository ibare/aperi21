// ========================================================================
// lenzs-law — 선언
// ========================================================================
// 질문: 자석을 넣을 때와 뺄 때 코일 전류는 방향이 반대다. 그러면 코일이
// 자석에게 주는 힘도 반대가 되는가.
//
// 되지 않는다. F ∝ −(dΦ/dx)²·v 이고 제곱이 부호를 지우므로, 힘의 부호는 오직
// v 의 반대다 — 언제나 움직임을 거스른다.
//
// 원본: tasks/piece-lab/lenzs-law/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:lenzs-law` 와 문자 그대로 일치한다 (C4). */
export const LENZ_LAW_ID = 'lenzs-law';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 원본 논리 좌표 100 px. 코일 중심이 원점, y 는 위.
//
// 원본이 자석 자리를 코일 반경 단위 u 로 두고 `SCALE = 100` 으로 px 에 옮겼으므로,
// 여기서는 **u 가 그대로 월드 x** 다. 옮기는 과정에서 수가 하나 줄었다.
// ------------------------------------------------------------------------

/** 옆에서 본 고리의 가로·세로 반지름. 원본 RX 15 · RY 62 px. */
export const RING_RX = 0.15;
export const RING_RY = 0.62;
/** 다섯 바퀴의 자리. 원본 RING_X. */
export const RING_X: readonly number[] = [-0.48, -0.24, 0, 0.24, 0.48];
/** 자석 폭·높이. 원본 84 × 30 px. */
export const MAGNET_W = 0.84;
export const MAGNET_H = 0.3;
/** 움직임 화살표 축. 원본 y = 42 px. */
export const Y_MOVE = 0.76;
/**
 * 힘 화살표 축. 원본 y = 202 px.
 *
 * 194 가 아니라 202 인 것은 원본이 스크린샷을 보고 고친 값이다 — 194 에서는 힘
 * 이름표가 코일 하단의 전류 화살촉과 겹쳐, 하필 "전류는 뒤집혔는데 힘은 그대로" 를
 * 읽어야 하는 프레임이 지저분했다.
 */
export const Y_FORCE = -0.84;
/** 캡션 줄. 원본 y = 232 px. */
export const Y_CAPTION = -1.14;

/**
 * 프레이밍 — 원본 860 × 250 캔버스를 그대로 옮긴 경계다.
 *
 * 자석이 끝(u = ±2.4)에 서도 화면 끝까지 1.5 단위가 남는다. 그 여백도 저작
 * 결정이라 내용에 맞춰 조이지 않는다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -4.3, maxX: 4.3, minY: -1.32, maxY: 1.18 } as const;

// ------------------------------------------------------------------------
// 운동 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 자동 진행 속도(u/s). 등속인 것이 결정이다 — 속도가 변하면 힘의 향이 바뀐 이유가 흐려진다. */
export const V0 = 1.6;
/** 왕복하는 양 끝(u). */
export const U_END = 2.4;
/** 끝에서 멈추는 시간(초). 방향 전환의 호흡이면서 "움직임이 없으면 유도도 없다" 를 겸한다. */
export const PAUSE = 0.55;

// ------------------------------------------------------------------------
// 문턱 — 화면에서 무엇이 사라지는 자리다. 원본의 값을 그대로 옮겼다.
// ------------------------------------------------------------------------

/** 이보다 느리면 움직임 화살표를 두지 않는다. */
export const V_EPS = 0.06;
/** 이보다 약하면 전류 화살촉을 두지 않는다. */
export const I_EPS = 0.035;
/**
 * 이보다 약하면 힘 화살표와 이름표가 **함께** 사라진다.
 *
 * 길이 0 인 화살표는 향이 없는데 남아 있으면 향이 있는 것처럼 보인다. 한가운데를
 * 지나는 한 프레임에서 강조색이 화면에서 완전히 사라지는 것이, 그 순간 아무 힘도
 * 없다는 가장 정확한 그림이다.
 */
export const F_EPS = 0.035;
/** 캡션이 「한가운데」 로 갈리는 전류 세기. */
export const I_TURN = 0.06;
/** 전류가 고리를 도는 각속도 계수(rad/s, 정규화 전류 1 기준). 원본 3.4. */
export const SPIN = 3.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lenzLawMessages = Object.freeze({
  'label.title': {
    ko: '렌츠 법칙',
    en: "Lenz's law",
    ja: 'レンツの法則',
    zh: '楞次定律',
    ar: 'قانون لنز',
    es: 'Ley de Lenz',
    fr: 'Loi de Lenz',
    hi: 'लेन्ज़ का नियम',
    id: 'Hukum Lenz',
    pt: 'Lei de Lenz',
  },
  'label.operation': {
    ko: '전류는 뒤집혀도 힘은 늘 움직임을 거스른다',
    en: 'The current flips, the force never does',
    ja: '電流は反転しても、力は決して反転しない',
    zh: '电流会反向，力却从不反向',
    ar: 'ينقلب التيار، أما القوة فلا تنقلب أبدًا',
    es: 'La corriente se invierte, la fuerza nunca',
    fr: 'Le courant s’inverse, la force jamais',
    hi: 'धारा पलटती है, बल कभी नहीं',
    id: 'Arus berbalik, gayanya tidak pernah',
    pt: 'A corrente se inverte, a força nunca',
  },
  'label.stage': {
    ko: '코일과 자석',
    en: 'Coil and magnet',
    ja: 'コイルと磁石',
    zh: '线圈与磁铁',
    ar: 'الملف والمغناطيس',
    es: 'Bobina e imán',
    fr: 'Bobine et aimant',
    hi: 'कुंडली और चुंबक',
    id: 'Kumparan dan magnet',
    pt: 'Bobina e ímã',
  },
  'label.view': {
    ko: '옆에서',
    en: 'From the side',
    ja: '横から',
    zh: '侧视',
    ar: 'من الجانب',
    es: 'De lado',
    fr: 'De côté',
    hi: 'बगल से',
    id: 'Dari samping',
    pt: 'De lado',
  },
  /** 자석에 새겨진 극 표식. 도형에 새겨진 글자라 번역 대상이 아니다 (C1 판정 1). */
  'label.poleN': {
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
  'label.poleS': {
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
  /**
   * 화살표 둘에 붙인 이름. 범례가 아니라 대상에 직접 붙인 이름이다 — 두 화살표가
   * 무엇인지 모르면 "반대편을 가리킨다" 가 읽히지 않으므로 주장에 필요하다.
   */
  'label.motion': {
    ko: '자석의 움직임',
    en: "The magnet's motion",
    ja: '磁石の動き',
    zh: '磁铁的运动',
    ar: 'حركة المغناطيس',
    es: 'El movimiento del imán',
    fr: 'Le mouvement de l’aimant',
    hi: 'चुंबक की गति',
    id: 'Gerak magnet',
    pt: 'O movimento do ímã',
  },
  'label.force': {
    ko: '코일이 주는 힘',
    en: 'The force from the coil',
    ja: 'コイルが及ぼす力',
    zh: '线圈施加的力',
    ar: 'القوة من الملف',
    es: 'La fuerza de la bobina',
    fr: 'La force exercée par la bobine',
    hi: 'कुंडली का बल',
    id: 'Gaya dari kumparan',
    pt: 'A força da bobina',
  },
  'caption.still': {
    ko: '자석이 멈춰 있다 — 전류도 없다',
    en: 'The magnet is still — and so is the current',
    ja: '磁石は止まっている — 電流も流れない',
    zh: '磁铁静止不动 — 电流也没有',
    ar: 'المغناطيس ساكن — ولا تيار كذلك',
    es: 'El imán está quieto — y no hay corriente',
    fr: 'L’aimant est immobile — et aucun courant ne passe',
    hi: 'चुंबक स्थिर है — और धारा भी नहीं है',
    id: 'Magnet diam — arus pun tidak ada',
    pt: 'O ímã está parado — e não há corrente',
  },
  'caption.turning': {
    ko: '자석이 코일 한가운데 — 지금 전류가 방향을 바꾼다',
    en: 'The magnet is at the middle of the coil — the current is turning around',
    ja: '磁石がコイルの真ん中にある — いま電流が向きを変える',
    zh: '磁铁位于线圈正中 — 电流此刻正在改变方向',
    ar: 'المغناطيس في منتصف الملف — والتيار يغيّر اتجاهه الآن',
    es: 'El imán está en el centro de la bobina — la corriente está cambiando de sentido',
    fr: 'L’aimant est au milieu de la bobine — le courant est en train de changer de sens',
    hi: 'चुंबक कुंडली के ठीक बीच में है — धारा अभी दिशा बदल रही है',
    id: 'Magnet berada di tengah kumparan — arus sedang berbalik arah',
    pt: 'O ímã está no meio da bobina — a corrente está mudando de sentido',
  },
  'caption.approaching': {
    ko: '자석이 다가온다 — 코일이 되민다',
    en: 'The magnet comes closer — the coil pushes it back',
    ja: '磁石が近づく — コイルが押し返す',
    zh: '磁铁靠近 — 线圈把它推回去',
    ar: 'يقترب المغناطيس — فيدفعه الملف إلى الخلف',
    es: 'El imán se acerca — la bobina lo empuja de vuelta',
    fr: 'L’aimant s’approche — la bobine le repousse',
    hi: 'चुंबक पास आता है — कुंडली उसे पीछे धकेलती है',
    id: 'Magnet mendekat — kumparan mendorongnya balik',
    pt: 'O ímã se aproxima — a bobina o empurra de volta',
  },
  'caption.receding': {
    ko: '자석이 멀어진다 — 코일이 붙잡는다',
    en: 'The magnet moves away — the coil holds it back',
    ja: '磁石が遠ざかる — コイルが引き止める',
    zh: '磁铁远离 — 线圈把它拉住',
    ar: 'يبتعد المغناطيس — فيشدّه الملف إلى الوراء',
    es: 'El imán se aleja — la bobina lo retiene',
    fr: 'L’aimant s’éloigne — la bobine le retient',
    hi: 'चुंबक दूर जाता है — कुंडली उसे थामे रखती है',
    id: 'Magnet menjauh — kumparan menahannya',
    pt: 'O ímã se afasta — a bobina o segura',
  },
} satisfies Record<string, LocalizedText>);

export type LenzLawMessageKey = keyof typeof lenzLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: LenzLawMessageKey): LocalizedText {
  return lenzLawMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LenzLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lenzLawSchema: BundleSchema = {
  id: LENZ_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 자동 진행만으로 주장은 끝난다. 그와 별개로 자석을 직접 끌 수 있다
  // (controllers.ts) — "내가 어느 쪽으로 끌든 힘은 내 반대편" 은 손으로 해 봐야
  // 몸에 남는다.
  parameters: [],

  stages: [
    {
      id: 'coil',
      label: text('label.stage'),
      constants: { v0: V0, uEnd: U_END, pause: PAUSE },
    },
  ],

  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 원본 860 × 250. 가로로 넓고 세로로 좁다 — 자석이 지나가는 축이 전부다. */
  canvas: { height: 250, minHeight: 250 },

  /**
   * 도착한 순간 자석은 이미 u = −1.2 에서 오른쪽으로 달리고 있고, 힘 화살표도
   * 벌써 서 있다 (S-piece — 빈 화면이 채워지기를 기다리게 하지 않는다).
   *
   * **시계가 아니라 상태를 굴린다.** 이 조각은 자리·방향·전류 위상을 프레임마다
   * 쌓으므로 `startAt` 으로 시계만 앞당기면 화면은 출발점 그대로다. 왕복은
   * u = −2.4 에서 열고, 0.75 초 × 1.6 = 1.2 만큼 미리 굴려 그 자리에 이르게 한다.
   */
  preroll: 0.75,

  /**
   * 원본이 그린 순서 그대로 겹친다 — 고리를 도는 전하가 **코일선 위에** 얹힌다.
   * 층 순서(`trace` 19 < `trajectory` 20)로는 전하가 코일선 아래로 깔려, 굵기
   * 2.4 의 선이 반지름 2.3 의 점을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 슬롯 하나. 네 문장이 국면에 따라 갈아 끼워지지만 전부 같은 주장의 국면
   * 서술이다 — 정의도 공식도 쓰지 않는다.
   *
   * 국면이 갈리는 시점은 시각이 아니라 **상태**다(멈춤 / 한가운데 / 다가옴 /
   * 멀어짐). 그래서 시간표 단계가 아니라 `cases` 로 고른다. 위에서부터 훑어 참인
   * 첫 항목을 쓰고, 아무것도 참이 아니면 `text` — 원본 `if` 사슬의 순서 그대로다.
   */
  caption: {
    anchor: { world: [0, Y_CAPTION] },
    align: 'center',
    fontSize: 15,
    cases: [
      { when: 'still', text: key('caption.still') },
      { when: 'turning', text: key('caption.turning') },
      { when: 'approaching', text: key('caption.approaching') },
    ],
    text: key('caption.receding'),
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 이 조각은 **크기를 말하지 않는 것**이
   * 결정이었다 — 눈금이 붙는 순간 독자가 재기 시작하고, 향(向)만 남긴 화면이
   * 흐려진다.
   */

  messages: lenzLawMessages,
};
