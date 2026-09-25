// ========================================================================
// chain-reaction — 선언
// ========================================================================
// 질문: 핵분열에서 나온 중성자는 무엇을 하는가 — 왜 어떤 때는 폭발하고 어떤 때는
// 원자로처럼 일정하게 타는가?
//
// 답: 분열마다 나온 중성자가 이웃 핵을 쪼개면 그 분열이 다시 중성자를 낸다. 분열 하나가
// 다음 세대에 부르는 분열 수 k 가 갈림길이다 — 세대마다 분열 수가 k 배가 되어, k > 1 이면
// 걷잡을 수 없이 불어나고(폭주), k = 1 이면 일정하게 이어지며(임계), k < 1 이면 꺼진다.
//
// 같은 연료 세 판을 나란히 두고 k 만 다르게 한다. 한 번의 분열 모습(흔들림 · 아령 ·
// 조각의 반발)은 이웃 `nuclear-fission` 의 몫이라 되풀이하지 않는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:chain-reaction` 와 문자 그대로 일치한다 (C4). */
export const CHAIN_REACTION_ID = 'chain-reaction';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 세 판의 증배 계수 k — 분열 하나가 다음 세대에 부르는 분열 수. 왼쪽 · 가운데 · 오른쪽. */
export const K_SUPER = 2;
export const K_CRITICAL = 1;
export const K_SUB = 0.5;
/** 처음 세대(0 세대)의 분열 수 — 세 판이 같다. */
export const START_FISSIONS = 2;
/**
 * 분열 하나가 내놓는 중성자 수. 실제 U-235 는 평균 약 2.4 개지만 화면의 알갱이는 정수라
 * 2 로 둔다. k 가 이 값을 넘을 수는 없다 — 나온 중성자가 모두 닿아도 이만큼이다.
 */
export const NEUTRONS_PER_FISSION = 2;
/**
 * 쪼개지는 세대 수(0 세대 포함). 시간표의 `split0` … `split{G−1}` · `fly1` … `fly{G−1}` 과
 * 짝이 맞아야 한다 — 어긋나면 scene 이 없는 단계를 불러 던진다 (장부 G129).
 */
export const GENERATIONS = 4;
/** 핵 배치의 흔들림 · 중성자 방향을 뽑는 시드. 같은 시드면 세 판의 연료 배치가 같다. */
export const SEED = 235;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 가운데 판의 핵 격자 중심.
// ------------------------------------------------------------------------

/** 판 하나의 폭 · 판 사이 간격(월드). 세 판이 가로로 나란하다. */
export const PANEL_W = 4.0;
export const PANEL_GAP = 0.7;
/** 핵 격자 — 육각 격자 열 · 행 수와 간격(월드). */
export const LATTICE_COLS = 8;
export const LATTICE_ROWS = 8;
export const LATTICE_SPACING = 0.5;
/** 격자점을 흩는 폭(월드) — 연료가 줄 맞춘 결정으로 읽히지 않을 만큼. */
export const LATTICE_JITTER = 0.09;
/** 격자 중심의 높이(월드) — 위로 k 이름표, 아래로 세대 막대 자리를 남긴다. */
export const LATTICE_CY = 0.6;
/** 핵 반지름(월드). */
export const NUCLEUS_R = 0.1;
/** 빠져나가는 중성자가 한 세대 동안 날아가는 거리(월드). */
export const LOST_FLIGHT = 1.0;
/** 처음 중성자가 출발하는 거리(월드) — 첫 핵에서 이만큼 떨어진 곳에서 들어온다. */
export const IGNITE_FLIGHT = 1.1;
/** 세대 막대 — 바닥 y · 한 분열의 높이 · 막대 폭 · 막대 간격(월드). */
export const BAR_BASE_Y = -2.2;
export const BAR_UNIT = 0.0625;
export const BAR_W = 0.42;
export const BAR_PITCH = 0.72;
/** k 이름표의 높이(월드). */
export const K_LABEL_Y = 2.75;

/**
 * 고정 경계 (원칙 6). 세 판 · k 이름표 · 세대 막대가 들어가고, 아래로 캡션 한 줄 자리를
 * 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -6.6, maxX: 6.6, minY: -2.95, maxY: 3.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const chainReactionMessages = Object.freeze({
  'label.title': {
    ko: '연쇄 반응',
    en: 'Chain reaction',
    ja: '連鎖反応',
    zh: '链式反应',
    ar: 'التفاعل المتسلسل',
    es: 'Reacción en cadena',
    fr: 'Réaction en chaîne',
    hi: 'श्रृंखला अभिक्रिया',
    id: 'Reaksi berantai',
    pt: 'Reação em cadeia',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '중성자가 이어가는 분열',
    en: 'Fission carried on by neutrons',
    ja: '中性子がつないでいく核分裂',
    zh: '由中子延续的裂变',
    ar: 'انشطار تواصله النيوترونات',
    es: 'Fisión sostenida por neutrones',
    fr: 'Une fission entretenue par les neutrons',
    hi: 'न्यूट्रॉनों द्वारा आगे बढ़ता विखंडन',
    id: 'Fisi yang diteruskan oleh neutron',
    pt: 'Fissão levada adiante por nêutrons',
  },
  'label.stage': {
    ko: '세 가지 k',
    en: 'Three values of k',
    ja: 'k の三つの値',
    zh: '三个 k 值',
    ar: 'ثلاث قيم لـ k',
    es: 'Tres valores de k',
    fr: 'Trois valeurs de k',
    hi: 'k के तीन मान',
    id: 'Tiga nilai k',
    pt: 'Três valores de k',
  },
  'label.view': {
    ko: '나란히',
    en: 'Side by side',
    ja: '並べて',
    zh: '并排',
    ar: 'جنبًا إلى جنب',
    es: 'Lado a lado',
    fr: 'Côte à côte',
    hi: 'साथ-साथ',
    id: 'Berdampingan',
    pt: 'Lado a lado',
  },

  /** 증배 계수 이름표 — 기호 k 와 선언값이 끼는 식이라 문안으로 둔다. */
  'label.k': {
    ko: 'k = {k}',
    en: 'k = {k}',
    ja: 'k = {k}',
    zh: 'k = {k}',
    ar: 'k = {k}',
    es: 'k = {k}',
    fr: 'k = {k}',
    hi: 'k = {k}',
    id: 'k = {k}',
    pt: 'k = {k}',
  },
  'label.super': {
    ko: '폭주',
    en: 'runaway',
    ja: '暴走',
    zh: '失控',
    ar: 'جامح',
    es: 'desbocada',
    fr: 'emballement',
    hi: 'अनियंत्रित',
    id: 'tak terkendali',
    pt: 'descontrolada',
  },
  'label.critical': {
    ko: '임계',
    en: 'critical',
    ja: '臨界',
    zh: '临界',
    ar: 'حرج',
    es: 'crítica',
    fr: 'critique',
    hi: 'क्रांतिक',
    id: 'kritis',
    pt: 'crítica',
  },
  'label.sub': {
    ko: '꺼짐',
    en: 'dies out',
    ja: '途絶える',
    zh: '熄灭',
    ar: 'تخمد',
    es: 'se apaga',
    fr: 's’éteint',
    hi: 'बुझ जाती है',
    id: 'padam',
    pt: 'se apaga',
  },

  'caption.ignite': {
    ko: '같은 우라늄 연료 세 판 — 저마다 중성자 {n0}개가 첫 핵으로 날아든다.',
    en: 'Three trays of the same uranium fuel — in each, {n0} neutrons fly in toward the first nuclei.',
    ja: '同じウラン燃料を並べた三つの皿 — それぞれで中性子 {n0} 個が最初の原子核へ飛び込む。',
    zh: '三盘相同的铀燃料 — 每盘各有 {n0} 个中子飞向最初的原子核。',
    ar: 'ثلاث صوانٍ من وقود اليورانيوم نفسه — في كل منها يندفع {n0} من النيوترونات نحو النوى الأولى.',
    es: 'Tres bandejas del mismo combustible de uranio — en cada una, {n0} neutrones vuelan hacia los primeros núcleos.',
    fr: 'Trois plateaux du même combustible d’uranium — dans chacun, {n0} neutrons filent vers les premiers noyaux.',
    hi: 'एक ही यूरेनियम ईंधन की तीन ट्रे — हर एक में {n0} न्यूट्रॉन पहले नाभिकों की ओर उड़ते हैं।',
    id: 'Tiga baki berisi bahan bakar uranium yang sama — di masing-masing, {n0} neutron melesat ke inti-inti pertama.',
    pt: 'Três bandejas do mesmo combustível de urânio — em cada uma, {n0} nêutrons voam rumo aos primeiros núcleos.',
  },
  'caption.emit': {
    ko: '핵이 쪼개지며 중성자가 {nu}개씩 튀어나와, 이웃 핵에 닿거나 빠져나가 사라진다.',
    en: 'Each nucleus splits and throws out {nu} neutrons — some strike a neighbour, some escape and are lost.',
    ja: '原子核が分裂して中性子を {nu} 個ずつ放つ — 隣の原子核に当たるものもあれば、外へ逃げて失われるものもある。',
    zh: '每个原子核分裂并放出 {nu} 个中子 — 有的击中相邻的核，有的逃逸而损失。',
    ar: 'تنشطر كل نواة وتقذف {nu} من النيوترونات — بعضها يصيب نواة مجاورة، وبعضها يفلت ويضيع.',
    es: 'Cada núcleo se divide y lanza {nu} neutrones — unos golpean a un vecino, otros escapan y se pierden.',
    fr: 'Chaque noyau se scinde et projette {nu} neutrons — certains frappent un voisin, d’autres s’échappent et sont perdus.',
    hi: 'हर नाभिक टूटकर {nu} न्यूट्रॉन बाहर फेंकता है — कुछ पड़ोसी नाभिक से टकराते हैं, कुछ निकलकर खो जाते हैं।',
    id: 'Setiap inti membelah dan melontarkan {nu} neutron — sebagian mengenai inti tetangga, sebagian lolos dan hilang.',
    pt: 'Cada núcleo se divide e lança {nu} nêutrons — alguns atingem um vizinho, outros escapam e se perdem.',
  },
  'caption.spread': {
    ko: '닿은 중성자만 다음 세대를 쪼갠다 — 왼쪽은 세대마다 불어나고, 가운데는 그대로 이어지고, 오른쪽은 줄다가 끊긴다.',
    en: 'Only the neutrons that hit split the next generation — on the left each generation grows, in the middle it holds, on the right it shrinks and stops.',
    ja: '当たった中性子だけが次の世代を分裂させる — 左は世代ごとに増え、真ん中はそのまま続き、右は減って途切れる。',
    zh: '只有击中的中子才会使下一代分裂 — 左边每一代都在增多，中间保持不变，右边逐渐减少直至中断。',
    ar: 'وحدها النيوترونات التي تصيب تشطر الجيل التالي — على اليسار يكبر كل جيل، وفي الوسط يثبت، وعلى اليمين يتناقص ثم يتوقف.',
    es: 'Solo los neutrones que aciertan dividen la siguiente generación — a la izquierda cada generación crece, en el centro se mantiene, a la derecha mengua y se detiene.',
    fr: 'Seuls les neutrons qui touchent font se scinder la génération suivante — à gauche chaque génération grandit, au milieu elle se maintient, à droite elle diminue puis s’arrête.',
    hi: 'केवल टकराने वाले न्यूट्रॉन ही अगली पीढ़ी को तोड़ते हैं — बाईं ओर हर पीढ़ी बढ़ती है, बीच में वैसी ही रहती है, दाईं ओर घटकर रुक जाती है।',
    id: 'Hanya neutron yang mengenai sasaran yang membelah generasi berikutnya — di kiri tiap generasi bertambah, di tengah tetap, di kanan menyusut lalu berhenti.',
    pt: 'Só os nêutrons que acertam dividem a geração seguinte — à esquerda cada geração cresce, no meio se mantém, à direita diminui e para.',
  },
  'caption.renew': {
    ko: '새 연료와 다음 중성자가 제자리에 선다.',
    en: 'Fresh fuel and the next neutrons take their places.',
    ja: '新しい燃料と次の中性子が所定の位置につく。',
    zh: '新的燃料和下一批中子各就各位。',
    ar: 'يأخذ الوقود الجديد والنيوترونات التالية أماكنها.',
    es: 'El combustible nuevo y los siguientes neutrones ocupan su lugar.',
    fr: 'Du combustible neuf et les neutrons suivants prennent place.',
    hi: 'नया ईंधन और अगले न्यूट्रॉन अपनी जगह ले लेते हैं।',
    id: 'Bahan bakar baru dan neutron berikutnya mengambil tempatnya.',
    pt: 'Combustível novo e os próximos nêutrons tomam seus lugares.',
  },
  'caption.verdict': {
    ko: 'k 가 1 보다 크면 걷잡을 수 없이 번지고, 1 이면 일정하게 이어지며, 1 보다 작으면 꺼진다.',
    en: 'With k above 1 it runs away, at exactly 1 it holds steady, below 1 it dies out.',
    ja: 'k が 1 より大きいと暴走し、ちょうど 1 なら一定に続き、1 より小さいと途絶える。',
    zh: 'k 大于 1 时失控蔓延，恰好为 1 时稳定持续，小于 1 时熄灭。',
    ar: 'إذا كان k أكبر من 1 انفلت التفاعل، وإذا كان 1 تمامًا استمر بثبات، وإذا كان أقل من 1 خمد.',
    es: 'Con k mayor que 1 se desboca, con k exactamente 1 se mantiene estable, por debajo de 1 se apaga.',
    fr: 'Avec k au-dessus de 1, elle s’emballe ; à exactement 1, elle reste stable ; en dessous de 1, elle s’éteint.',
    hi: 'k के 1 से अधिक होने पर अभिक्रिया अनियंत्रित हो जाती है, ठीक 1 पर स्थिर बनी रहती है, 1 से कम पर बुझ जाती है।',
    id: 'Dengan k di atas 1 reaksi tak terkendali, tepat 1 tetap stabil, di bawah 1 padam.',
    pt: 'Com k acima de 1 ela dispara, exatamente em 1 se mantém estável, abaixo de 1 se apaga.',
  },
} satisfies Record<string, LocalizedText>);

export type ChainReactionMessageKey = keyof typeof chainReactionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ChainReactionMessageKey): LocalizedText => chainReactionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ChainReactionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const chainReactionSchema: BundleSchema = {
  id: CHAIN_REACTION_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 세 판이 k 만 다르게 나란히 번지며 주장이 끝난다.
  parameters: [],
  stages: [
    {
      id: 'three-k',
      label: text('label.stage'),
      constants: {
        kSuper: K_SUPER,
        kCritical: K_CRITICAL,
        kSub: K_SUB,
        startFissions: START_FISSIONS,
        neutronsPerFission: NEUTRONS_PER_FISSION,
        generations: GENERATIONS,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side-by-side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 판이 나란하다. */
  canvas: { height: 380, minHeight: 330 },

  /** 쓴 순서대로 겹친다 — 핵 위에 중성자, 그 위에 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 첫 중성자가 이미 핵으로 가는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 9.4 초.
   *
   * - `ignite` — 판마다 중성자가 들어와 0 세대 핵에 닿는다.
   * - `split{g}` — g 세대 핵이 쪼개진다(강조색 고리가 번지고 핵이 두 조각이 된다). 막대 하나가 선다.
   * - `fly{g}` — 앞 세대가 낸 중성자가 날아간다. 닿는 것은 이웃 핵으로, 빠지는 것은 바깥으로 흐려진다.
   * - `verdict` — 세 판 이름표 아래에 폭주 · 임계 · 꺼짐이 떠오른다.
   * - `hold` — 다 번진 판과 세대 막대가 머문다.
   * - `clear` · `renew` — 조각 · 막대가 물러나고 새 연료가 선다.
   */
  timeline: {
    phases: [
      { id: 'ignite', duration: 1.1, caption: key('caption.ignite') },
      { id: 'split0', duration: 0.35, caption: key('caption.emit') },
      { id: 'fly1', duration: 1.0, caption: key('caption.emit') },
      { id: 'split1', duration: 0.35, caption: key('caption.emit') },
      { id: 'fly2', duration: 1.0, caption: key('caption.spread') },
      { id: 'split2', duration: 0.35, caption: key('caption.spread') },
      { id: 'fly3', duration: 1.0, caption: key('caption.spread') },
      { id: 'split3', duration: 0.35, caption: key('caption.spread') },
      { id: 'verdict', duration: 0.4, ease: 'smooth', caption: key('caption.verdict') },
      { id: 'hold', duration: 2.4, caption: key('caption.verdict') },
      { id: 'clear', duration: 0.6, ease: 'smooth', caption: key('caption.verdict') },
      { id: 'renew', duration: 0.5, ease: 'smooth', caption: key('caption.renew') },
    ],
  },

  /** 슬롯 하나. 수는 state 가 스테이지 상수에서 만들어 둔다 (장부 G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { n0: 'caption.n0', nu: 'caption.nu' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 재는 것이 거리가 아니다 (S-piece).

  messages: chainReactionMessages,
};
