// ========================================================================
// maxwells-equations — 선언
// ========================================================================
// 질문: 전기장과 자기장을 묶는 식들이 어떻게 「빛」 으로 이어지는가.
//
// 주장 하나 — 바뀌는 자기장이 전기장 고리를 만들고, 바뀌는 전기장이 자기장 고리를
// 만든다. 그 사슬이 원인 없이도 스스로 한쪽으로 번져 나가는 것이 전자기파다.
//
// 비스듬히 위에서 본 3차원. 누운 E 고리(실선)와 선 B 고리(점선)가 사슬 고리처럼 서로
// 꿰인다. 처음 자라는 B 화살표 하나가 첫 E 고리를 낳고, 그 E 가 B 고리를, 그 B 가 다시
// E 고리를 낳는다. 처음 B 는 곧 사라지는데도 고리가 번갈아 생기며 앞머리가 오른쪽으로
// 나아간다. 식은 쓰지 않는다 — 문단의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:maxwells-equations` 와 문자 그대로 일치한다 (C4). */
export const MAXWELLS_EQUATIONS_ID = 'maxwells-equations';

// ------------------------------------------------------------------------
// 사슬 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 고리 개수. 홀수 번째가 E, 짝수 번째가 B 다. 시간표의 `link1` … `link{개수}` 단계와
 * 개수가 같아야 한다 — 둘의 관계는 선언할 자리가 없다 (NOTES (c) G129 · G193).
 */
export const LINK_COUNT = 6;
/** 이웃 고리 가운데 사이 거리(월드). 고리 반길이의 두 배보다 짧아야 서로 꿰인다. */
export const LINK_SPACING = 1.4;
/** 고리의 진행 방향(가로) 반길이(월드). E · B 가 같다. */
export const LOOP_HALF_LENGTH = 1.1;
/** 선 B 고리의 세로 반높이(월드). */
export const B_LOOP_HALF_HEIGHT = 0.95;
/** 누운 E 고리의 앞뒤 반폭(월드, 깊이 방향). */
export const E_LOOP_HALF_DEPTH = 0.95;
/** 처음 자라는 B 화살표가 다 자란 길이(월드). 첫 E 고리를 세로로 꿴다. */
export const SEED_LENGTH = 1.8;

// ------------------------------------------------------------------------
// 투영 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 앞으로 나온 깊이 1 이 화면 왼쪽으로 가는 길이. */
export const DEPTH_SKEW_X = 0.2;
/** 앞으로 나온 깊이 1 이 화면 아래로 가는 길이. 누운 고리가 이만큼 납작한 타원으로 보인다. */
export const DEPTH_SKEW_Y = 0.45;

/**
 * 프레이밍 — 시드부터 여섯째 고리 끝까지, 위아래로 선 고리와 이름표 · 캡션 한 줄 자리.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.45, maxX: 8.25, minY: -1.55, maxY: 1.3 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 처음 B 가 홀로 자라는 동안(초). 첫 E 고리가 그려지는 `link1` 동안에도 계속 자란다. */
export const SEED_S = 1.1;
/** 고리 하나가 한 바퀴 그려지는 동안(초). */
export const LINK_S = 0.95;
/** 사슬이 다 번진 뒤 모두 옅어지는 동안(초). */
export const FADE_S = 1.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const maxwellsEquationsMessages = Object.freeze({
  'label.title': {
    ko: '맥스웰 방정식',
    en: "Maxwell's equations",
    ja: 'マクスウェル方程式',
    zh: '麦克斯韦方程组',
    ar: 'معادلات ماكسويل',
    es: 'Ecuaciones de Maxwell',
    fr: 'Équations de Maxwell',
    hi: 'मैक्सवेल के समीकरण',
    id: 'Persamaan Maxwell',
    pt: 'Equações de Maxwell',
  },
  'label.operation': {
    ko: '전자기를 묶는 네 식',
    en: 'Four equations that bind electromagnetism',
    ja: '電磁気をまとめる四つの式',
    zh: '统一电磁学的四个方程',
    ar: 'أربع معادلات تجمع الكهرومغناطيسية',
    es: 'Cuatro ecuaciones que unen el electromagnetismo',
    fr: 'Quatre équations qui unissent l’électromagnétisme',
    hi: 'विद्युत चुंबकत्व को बाँधने वाले चार समीकरण',
    id: 'Empat persamaan yang mengikat elektromagnetisme',
    pt: 'Quatro equações que unem o eletromagnetismo',
  },
  'label.stage': {
    ko: '고리 사슬',
    en: 'Chain of loops',
    ja: 'ループの連鎖',
    zh: '环的链条',
    ar: 'سلسلة من الحلقات',
    es: 'Cadena de bucles',
    fr: 'Chaîne de boucles',
    hi: 'लूपों की शृंखला',
    id: 'Rantai lingkaran',
    pt: 'Cadeia de laços',
  },
  'label.view': {
    ko: '비스듬히 위에서',
    en: 'From above, at an angle',
    ja: '斜め上から',
    zh: '从斜上方看',
    ar: 'من الأعلى بزاوية مائلة',
    es: 'Desde arriba, en ángulo',
    fr: 'D’en haut, en biais',
    hi: 'ऊपर से, तिरछे कोण से',
    id: 'Dari atas, miring',
    pt: 'De cima, em ângulo',
  },
  /** 물리 기호 — 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.e': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.b': {
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
  'caption.seed': {
    ko: '자기장 B 가 커진다',
    en: 'A magnetic field B grows',
    ja: '磁場 B が強くなる',
    zh: '磁场 B 增强',
    ar: 'يتزايد مجال مغناطيسي B',
    es: 'Un campo magnético B crece',
    fr: 'Un champ magnétique B augmente',
    hi: 'एक चुंबकीय क्षेत्र B बढ़ता है',
    id: 'Medan magnet B membesar',
    pt: 'Um campo magnético B cresce',
  },
  'caption.eFromB': {
    ko: '커지는 B 를 전기장 E 의 고리가 두른다',
    en: 'A loop of electric field E wraps around the growing B',
    ja: '強くなる B を電場 E のループが取り巻く',
    zh: '电场 E 形成的环围绕着增强的 B',
    ar: 'حلقة من المجال الكهربائي E تلتف حول B المتزايد',
    es: 'Un bucle de campo eléctrico E rodea al B que crece',
    fr: 'Une boucle de champ électrique E entoure le B qui augmente',
    hi: 'बढ़ते B को विद्युत क्षेत्र E का एक लूप घेर लेता है',
    id: 'Lingkaran medan listrik E melingkupi B yang membesar',
    pt: 'Um laço de campo elétrico E envolve o B que cresce',
  },
  'caption.bFromE': {
    ko: '새로 생긴 E 를 자기장 B 의 고리가 두른다',
    en: 'A loop of magnetic field B wraps around the newly formed E',
    ja: '新しく生じた E を磁場 B のループが取り巻く',
    zh: '磁场 B 形成的环围绕着新产生的 E',
    ar: 'حلقة من المجال المغناطيسي B تلتف حول E المتكوّن حديثًا',
    es: 'Un bucle de campo magnético B rodea al E recién formado',
    fr: 'Une boucle de champ magnétique B entoure le E nouvellement formé',
    hi: 'नए बने E को चुंबकीय क्षेत्र B का एक लूप घेर लेता है',
    id: 'Lingkaran medan magnet B melingkupi E yang baru terbentuk',
    pt: 'Um laço de campo magnético B envolve o E recém-formado',
  },
  'caption.chain': {
    ko: '처음 B 는 사라졌는데도 E 고리와 B 고리가 번갈아 생기며 사슬이 한쪽으로 번져 간다 — 전자기파다',
    en: 'The first B is gone, yet E loops and B loops keep forming in turn and the chain spreads one way — an electromagnetic wave',
    ja: '最初の B は消えたのに、E のループと B のループが交互に生じ続け、連鎖が一方向へ広がっていく — 電磁波だ',
    zh: '最初的 B 已经消失，E 环和 B 环却仍交替产生，链条向一个方向扩展 — 这就是电磁波',
    ar: 'اختفى B الأول، ومع ذلك تظل حلقات E وحلقات B تتكوّن بالتناوب وتمتد السلسلة في اتجاه واحد — إنها موجة كهرومغناطيسية',
    es: 'El primer B ya no está, pero los bucles de E y de B siguen formándose por turnos y la cadena avanza en un sentido — una onda electromagnética',
    fr: 'Le premier B a disparu, pourtant des boucles de E et de B continuent de se former tour à tour et la chaîne se propage d’un côté — une onde électromagnétique',
    hi: 'पहला B मिट चुका है, फिर भी E के लूप और B के लूप बारी-बारी से बनते रहते हैं और शृंखला एक ओर फैलती जाती है — यह विद्युत चुंबकीय तरंग है',
    id: 'B yang pertama sudah hilang, namun lingkaran E dan lingkaran B terus terbentuk bergantian dan rantainya merambat ke satu arah — gelombang elektromagnetik',
    pt: 'O primeiro B sumiu, mas laços de E e de B continuam se formando alternadamente e a cadeia se espalha para um lado — uma onda eletromagnética',
  },
} satisfies Record<string, LocalizedText>);

export type MaxwellsEquationsMessageKey = keyof typeof maxwellsEquationsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MaxwellsEquationsMessageKey): LocalizedText => maxwellsEquationsMessages[key];

/** 시간표가 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MaxwellsEquationsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const maxwellsEquationsSchema: BundleSchema = {
  id: MAXWELLS_EQUATIONS_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 사슬이 번지는 중이다. 독자가 직접 해 볼 것이 없다.
  parameters: [],

  stages: [
    {
      id: 'chain',
      label: text('label.stage'),
      constants: {
        linkCount: LINK_COUNT,
        linkSpacing: LINK_SPACING,
        loopHalfLength: LOOP_HALF_LENGTH,
        bLoopHalfHeight: B_LOOP_HALF_HEIGHT,
        eLoopHalfDepth: E_LOOP_HALF_DEPTH,
        seedLength: SEED_LENGTH,
        depthSkewX: DEPTH_SKEW_X,
        depthSkewY: DEPTH_SKEW_Y,
      },
    },
  ],

  environments: [],
  views: [{ id: 'oblique', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 사슬 한 줄이 전부다. */
  canvas: { height: 280, minHeight: 260 },

  /**
   * 겹침이 판정 장치다. 고리가 서로 **꿰이려면** 누운 E 고리의 뒤 반쪽은 선 B 고리 아래,
   * 앞 반쪽은 위를 지나야 한다. 층 순서로는 이 앞뒤를 가를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 B 가 자람 → 고리 여섯이 차례로 생김 → 모두 옅어짐. 고리 단계의 캡션은
   * 첫 둘이 인과(B → E, E → B)를 한 번씩 말하고, 셋째부터는 같은 문장이 이어진다(다시
   * 페이드하지 않는다). `fade` 에는 캡션이 없다 — 그때는 아무것도 생기지 않는다.
   */
  timeline: {
    phases: [
      { id: 'seed', duration: SEED_S, caption: key('caption.seed') },
      { id: 'link1', duration: LINK_S, caption: key('caption.eFromB') },
      { id: 'link2', duration: LINK_S, caption: key('caption.bFromE') },
      { id: 'link3', duration: LINK_S, caption: key('caption.chain') },
      { id: 'link4', duration: LINK_S, caption: key('caption.chain') },
      { id: 'link5', duration: LINK_S, caption: key('caption.chain') },
      { id: 'link6', duration: LINK_S, caption: key('caption.chain') },
      { id: 'fade', duration: FADE_S },
    ],
  },

  /** 도착한 순간 이미 번지는 중이다 — 셋째 고리가 그려지고 있다. */
  startAt: 3.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 고리가 고리를 낳는 차례다. */

  messages: maxwellsEquationsMessages,
};
