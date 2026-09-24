// ========================================================================
// conservative-force — 선언
// ========================================================================
// 질문: 같은 두 점 사이를 다른 길로 옮기면 중력이 한 일도 달라지는가.
//
// 같은 상자 둘을 A 에서 B 로 같은 시간 동안 옮긴다. 하나는 A 보다 높이 넘어가는
// 길, 하나는 B 보다 낮게 도는 길이다. 오른쪽 막대가 지금까지 중력이 한 일(W)을
// 쌓는다 — 한쪽은 올라가는 동안 깎였다가 되찾고, 한쪽은 내려가는 동안 넘쳤다가
// 돌려준다. 끝에서 두 막대는 A 와 B 의 높이 차 h 에서 **같이** 멈춘다.
// 중력이 한 일은 길이 아니라 두 끝의 높이만 센다.
//
// 이웃과 겹치지 않게 — conservation-of-mechanical-energy 는 「도착 속력이 같다」, non-conservative-force
// 는 「마찰은 긴 길일수록 더 잃는다」 를 말한다. 여기는 **힘이 한 일 자체**를 쌓는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:conservative-force` 와 문자 그대로 일치한다 (C4). */
export const CONSERVATIVE_FORCE_ID = 'conservative-force';

// ------------------------------------------------------------------------
// 길 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 미터. 두 길은 같은 가로 자리(TURN_X)에서 꼭대기 · 바닥을 돈다.
// ------------------------------------------------------------------------

/** 출발점 A 의 높이. */
export const A_Y = 2.0;
/** 도착점 B 의 가로 자리와 높이. A 는 가로 0 이다. */
export const B_X = 5.0;
export const B_Y = 0.6;
/** 두 길이 도는 가로 자리 — 위 길의 꼭대기, 아래 길의 바닥이 여기 있다. */
export const TURN_X = 2.2;
/** 위 길의 꼭대기 높이. A 보다 높다 — 올라가는 동안 중력의 일이 깎인다. */
export const PEAK_Y = 2.7;
/** 아래 길의 바닥 높이. B 보다 낮다 — 내려간 만큼 넘쳤다가 올라오며 돌려준다. */
export const TROUGH_Y = -0.1;

/** 길 하나를 표본하는 점 수(반쪽마다). 곡선 어휘가 없어 점으로 긋는다 (G28). */
export const PATH_SAMPLES = 48;

// ------------------------------------------------------------------------
// 배치 — 월드 미터
// ------------------------------------------------------------------------

/** 상자 크기 [가로, 세로](m). 둘이 같다 — 같은 상자라서 받는 중력도 같다. */
export const BOX_SIZE: readonly [number, number] = [0.34, 0.26];
/**
 * 중력 화살표 길이(m). 두 상자가 같은 길이다 — 같은 힘이기 때문이다. 이름표가 화살표의
 * 40% 자리에 붙으므로 상자 밖으로 나오게 충분히 길게 둔다 (0.5 에서는 상자 위에 얹혔다).
 */
export const MG_LEN = 0.7;

/** 두 막대의 왼쪽 가장자리와 폭. B 의 높이선 위에 선다. */
export const BAR_X1 = 6.05;
export const BAR_X2 = 6.75;
export const BAR_W = 0.42;
/** 막대 이름표가 놓이는 높이. 길 1 의 막대가 가장 깊이 음으로 내려가도(B − (PEAK − A)) 그 아래다. */
export const BAR_LABEL_Y = -0.42;
/** 높이 차 h 를 재는 치수선의 가로 자리와 그 이름표. */
export const MEASURE_X = 7.5;
export const MEASURE_LABEL_DX = 0.2;
/** 높이 안내선의 오른쪽 끝. */
export const GUIDE_END_X = 7.75;

/**
 * 길 이름표 자리 — 가로 자리와 길 바깥쪽으로 띄우는 거리(m). 상자는 길을 다 지나가므로
 * 언젠가는 스친다. 상자가 빠르게 지나는 비탈에 두어 겹치는 순간을 짧게 한다.
 */
export const PATH_LABEL_X = 1.6;
export const PATH_LABEL_GAP = 0.42;

/**
 * 프레이밍은 주장의 일부다. 가로는 A 왼쪽 이름표부터 치수선 이름표까지, 세로는 위 길
 * 꼭대기의 상자부터 막대 이름표 · 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.65, maxX: 8.05, minY: -0.95, maxY: 3.15 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 경계는 여기서만 정한다. 물리는 `timeline` 에게 묻는다.
// ------------------------------------------------------------------------

/** A 에서 도는 자리까지(초). 위 길은 올라가고, 아래 길은 내려간다. */
export const OUT = 3.0;
/** 도는 자리에서 B 까지(초). */
export const BACK = 3.0;
/** 멈춘 그림을 읽는 동안 · 다음 주기로 넘어가며 흐려지는 동안. */
export const HOLD = 3.2;
export const FADE = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const conservativeForceMessages = Object.freeze({
  'label.title': {
    ko: '보존력',
    en: 'Conservative force',
    ja: '保存力',
    zh: '保守力',
    ar: 'القوة المحافظة',
    es: 'Fuerza conservativa',
    fr: 'Force conservative',
    hi: 'संरक्षी बल',
    id: 'Gaya konservatif',
    pt: 'Força conservativa',
  },
  'label.operation': {
    ko: '경로에 무관한 힘과 퍼텐셜의 존재',
    en: 'A force whose work ignores the path — and the potential it allows',
    ja: '仕事が経路によらない力 — そしてそれが許すポテンシャル',
    zh: '做功与路径无关的力 — 以及它所允许的势',
    ar: 'قوة لا يتوقف شغلها على المسار — والجهد الذي تتيحه',
    es: 'Una fuerza cuyo trabajo no depende de la trayectoria — y el potencial que permite',
    fr: 'Une force dont le travail ne dépend pas du chemin — et le potentiel qu’elle permet',
    hi: 'ऐसा बल जिसका कार्य पथ पर निर्भर नहीं करता — और वह विभव जिसे यह संभव बनाता है',
    id: 'Gaya yang usahanya tidak bergantung pada lintasan — dan potensial yang dimungkinkannya',
    pt: 'Uma força cujo trabalho não depende do caminho — e o potencial que ela permite',
  },
  'label.stage': {
    ko: '두 길',
    en: 'Two paths',
    ja: '2つの経路',
    zh: '两条路径',
    ar: 'مساران',
    es: 'Dos trayectorias',
    fr: 'Deux chemins',
    hi: 'दो पथ',
    id: 'Dua lintasan',
    pt: 'Dois caminhos',
  },
  'label.view': {
    ko: '중력이 한 일',
    en: 'Work done by gravity',
    ja: '重力がした仕事',
    zh: '重力做的功',
    ar: 'الشغل الذي تبذله الجاذبية',
    es: 'Trabajo realizado por la gravedad',
    fr: 'Travail de la pesanteur',
    hi: 'गुरुत्व द्वारा किया गया कार्य',
    id: 'Usaha oleh gravitasi',
    pt: 'Trabalho realizado pela gravidade',
  },
  /** 두 점의 이름. 도식 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.pointA': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.pointB': {
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
  /** 길 이름. 낱말이라 문안이다. */
  'label.path1': {
    ko: '길 1',
    en: 'path 1',
    ja: '経路 1',
    zh: '路径 1',
    ar: 'المسار 1',
    es: 'trayectoria 1',
    fr: 'chemin 1',
    hi: 'पथ 1',
    id: 'lintasan 1',
    pt: 'caminho 1',
  },
  'label.path2': {
    ko: '길 2',
    en: 'path 2',
    ja: '経路 2',
    zh: '路径 2',
    ar: 'المسار 2',
    es: 'trayectoria 2',
    fr: 'chemin 2',
    hi: 'पथ 2',
    id: 'lintasan 2',
    pt: 'caminho 2',
  },
  /** 수식 기호 — 표식 (C1 판정 3). */
  'label.gravity': {
    ko: 'mg',
    en: 'mg',
    ja: 'mg',
    zh: 'mg',
    ar: 'mg',
    es: 'mg',
    fr: 'mg',
    hi: 'mg',
    id: 'mg',
    pt: 'mg',
  },
  'label.work1': {
    ko: 'W₁',
    en: 'W₁',
    ja: 'W₁',
    zh: 'W₁',
    ar: 'W₁',
    es: 'W₁',
    fr: 'W₁',
    hi: 'W₁',
    id: 'W₁',
    pt: 'W₁',
  },
  'label.work2': {
    ko: 'W₂',
    en: 'W₂',
    ja: 'W₂',
    zh: 'W₂',
    ar: 'W₂',
    es: 'W₂',
    fr: 'W₂',
    hi: 'W₂',
    id: 'W₂',
    pt: 'W₂',
  },
  'label.height': {
    ko: 'h',
    en: 'h',
    ja: 'h',
    zh: 'h',
    ar: 'h',
    es: 'h',
    fr: 'h',
    hi: 'h',
    id: 'h',
    pt: 'h',
  },
  'caption.out': {
    ko: '길 1 은 올라가는 동안 중력이 한 일이 깎이고, 길 2 는 내려가는 만큼 쌓인다',
    en: 'On path 1 gravity’s work shrinks while climbing; on path 2 it piles up while descending',
    ja: '経路 1 では上る間に重力の仕事が減り、経路 2 では下る間に積み上がる',
    zh: '在路径 1 上，上升时重力做的功减少；在路径 2 上，下降时它不断累积',
    ar: 'على المسار 1 يتناقص شغل الجاذبية أثناء الصعود، وعلى المسار 2 يتراكم أثناء النزول',
    es: 'En la trayectoria 1 el trabajo de la gravedad disminuye al subir; en la trayectoria 2 se acumula al bajar',
    fr: 'Sur le chemin 1, le travail de la pesanteur diminue pendant la montée ; sur le chemin 2, il s’accumule pendant la descente',
    hi: 'पथ 1 पर चढ़ते समय गुरुत्व का कार्य घटता है; पथ 2 पर उतरते समय यह बढ़ता जाता है',
    id: 'Pada lintasan 1 usaha gravitasi menyusut saat naik; pada lintasan 2 usaha itu menumpuk saat turun',
    pt: 'No caminho 1 o trabalho da gravidade diminui na subida; no caminho 2 ele se acumula na descida',
  },
  'caption.back': {
    ko: '길 1 은 내려오며 되찾고, 길 2 는 올라오며 넘친 만큼 돌려준다',
    en: 'Path 1 wins it back coming down; path 2 gives back the excess climbing up',
    ja: '経路 1 は下りながら取り戻し、経路 2 は上りながら余った分を返す',
    zh: '路径 1 在下降时把它赢回来，路径 2 在上升时把多出的部分还回去',
    ar: 'يستعيده المسار 1 أثناء النزول، ويردّ المسار 2 الفائض أثناء الصعود',
    es: 'La trayectoria 1 lo recupera al bajar; la trayectoria 2 devuelve el exceso al subir',
    fr: 'Le chemin 1 le regagne en descendant ; le chemin 2 rend l’excédent en remontant',
    hi: 'पथ 1 नीचे आते हुए उसे वापस पा लेता है; पथ 2 ऊपर चढ़ते हुए अतिरिक्त भाग लौटा देता है',
    id: 'Lintasan 1 merebutnya kembali saat turun; lintasan 2 mengembalikan kelebihannya saat naik',
    pt: 'O caminho 1 o recupera na descida; o caminho 2 devolve o excesso na subida',
  },
  'caption.result': {
    ko: '두 길 모두 중력이 한 일은 A 와 B 의 높이 차 h 에서 멈췄다',
    en: 'Along both paths, gravity’s work stopped at the same height difference h between A and B',
    ja: 'どちらの経路でも、重力の仕事は A と B の同じ高さの差 h で止まった',
    zh: '沿两条路径，重力做的功都停在 A 与 B 之间相同的高度差 h 处',
    ar: 'على كلا المسارين، توقف شغل الجاذبية عند فرق الارتفاع نفسه h بين A و B',
    es: 'En ambas trayectorias, el trabajo de la gravedad se detuvo en la misma diferencia de altura h entre A y B',
    fr: 'Sur les deux chemins, le travail de la pesanteur s’est arrêté à la même différence de hauteur h entre A et B',
    hi: 'दोनों पथों पर गुरुत्व का कार्य A और B के बीच समान ऊँचाई-अंतर h पर रुका',
    id: 'Pada kedua lintasan, usaha gravitasi berhenti pada beda ketinggian h yang sama antara A dan B',
    pt: 'Nos dois caminhos, o trabalho da gravidade parou na mesma diferença de altura h entre A e B',
  },
} satisfies Record<string, LocalizedText>);

export type ConservativeForceMessageKey = keyof typeof conservativeForceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConservativeForceMessageKey): LocalizedText => conservativeForceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConservativeForceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const conservativeForceSchema: BundleSchema = {
  id: CONSERVATIVE_FORCE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 상자가 이미 옮겨지고 있고, 같은 높이에서 멈추고, 다시 떠난다.
  parameters: [],

  stages: [
    {
      id: 'two-paths',
      label: text('label.stage'),
      constants: {
        aY: A_Y,
        bX: B_X,
        bY: B_Y,
        turnX: TURN_X,
        peakY: PEAK_Y,
        troughY: TROUGH_Y,
      },
    },
  ],

  environments: [],

  views: [{ id: 'work', label: text('label.view'), default: true }],

  /**
   * 가로 8.7 m 를 담아야 하고 세로는 4.1 m 다. 세로를 더 주면 가로가 먼저 차서
   * 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 344 },

  /**
   * 겹침이 판정 장치다. 높이 안내선은 막대 **뒤**로 지나가야 막대 끝이 선에 닿는 것이
   * 읽히고, 상자는 길 위에 얹혀야 한다. 층 순서로는 `region`(막대)이 물체 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떠남 → 돌아옴 → 멈춘 그림 → 흐려짐.
   *
   * 두 길은 같은 가로 자리에서 꼭대기 · 바닥을 돈다. `out` 이 끝나는 순간이 곧 위 길은
   * 가장 높고 아래 길은 가장 낮은 순간이라, 캡션이 「올라가는 동안 / 내려오며」 로
   * 갈리는 자리와 화면이 어긋날 수 없다. 두 단계 모두 `smooth` — 도는 자리에서 잠깐
   * 멎어 막대가 가장 깎이고 가장 넘친 모습이 읽힌다.
   */
  timeline: {
    phases: [
      { id: 'out', duration: OUT, ease: 'smooth', caption: key('caption.out') },
      { id: 'back', duration: BACK, ease: 'smooth', caption: key('caption.back') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 상자가 A 를 떠나 갈라진 자리에서 연다.
   * 0 이면 두 상자가 A 에 겹쳐 있고 막대가 비어 있다.
   */
  startAt: 0.9,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 거리가 아니라 **A 와 B 의 높이 차
   * 하나**라, 거리 격자를 깔면 「몇 미터인가」 라는 다른 질문이 끼어든다. 그 높이 차는
   * 안내선 둘과 치수선 h 가 직접 긋는다.
   */

  messages: conservativeForceMessages,
};
