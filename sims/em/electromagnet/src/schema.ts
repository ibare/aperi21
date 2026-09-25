// ========================================================================
// electromagnet — 선언
// ========================================================================
// 질문: 쇠못에 도선을 감아 전류를 흘리면 무엇이 달라지는가.
//
// 전류가 흐르는 동안에만 못이 자석이 된다. 스위치를 닫으면 못 양 끝에 N · S 극이
// 생기고 탁자 위 클립이 날아올라 끝마다 사슬로 매달린다. 스위치를 열면 극이 사라지고
// 클립은 떨어진다. 감은 수를 늘리거나(둘째 판) 전지를 하나 더 이어 전류를 늘리면
// (셋째 판) 같은 못에 더 많은 클립이 매달린다.
//
// 이웃 `field-of-straight-wire` 는 곧은 전선 둘레의 나침반이 도는 것을 보인다 — 여기서는
// 장을 보이지 않고, 쇠를 자석으로 만든 결과(끌려 올라간 클립)만 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:electromagnet` 와 문자 그대로 일치한다 (C4). */
export const ELECTROMAGNET_ID = 'electromagnet';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 첫째 · 셋째 판의 감은 수. 화면의 `6회 감음` 이 이 값을 그대로 쓴다. */
export const TURNS_BASE = 6;
/** 둘째 판의 감은 수. 코일이 같은 길이에 더 촘촘히 감긴다. */
export const TURNS_MORE = 12;
/** 전지 하나일 때의 전류(A). 화면의 `1 A` 가 이 값을 그대로 쓴다. */
export const CURRENT_BASE = 1;
/** 전지 둘일 때의 전류(A) — 셋째 판. */
export const CURRENT_MORE = 2;
/** 첫째 · 둘째 판의 전지 수 · 셋째 판의 전지 수. 전지 자리는 `CELL_X` 의 둘이다(NOTES (c)). */
export const CELLS_BASE = 1;
export const CELLS_MORE = 2;
/**
 * 판마다 **한 끝에** 매달리는 클립 수. 감은 수 × 전류가 같은 둘째 · 셋째 판은 같은
 * 값이다. 사슬 네 개까지가 탁자에 닿지 않고 들어간다(NOTES (b)).
 */
export const CLIPS_BASE = 2;
export const CLIPS_TURNS = 4;
export const CLIPS_CURRENT = 4;
/** 끝마다 탁자에 놓인 클립 수. 가장 많이 매달리는 판보다 많아 늘 남는 것이 있다. */
export const PILE_CLIPS = 6;
/** 탁자 위 클립의 흩어짐을 뽑는 시드. 같은 시드는 언제나 같은 더미다 (S-sim). */
export const SEED = 7;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2).
// ------------------------------------------------------------------------

/** 전류(A) → 도선 위 전류 화살표 길이(월드). 전류가 두 배면 화살표도 두 배다. */
export const ARROW_SCALE = 0.35;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 가운데에 가로로 누운 쇠못, 위에 회로, 아래에 탁자.
// ------------------------------------------------------------------------

/** 쇠못 몸통 — 가운데 높이, 왼끝(머리 쪽) · 오른끝(뾰족한 끝이 시작하는 곳), 반 두께. */
export const NAIL_Y = 3.6;
export const NAIL_LEFT = -3.0;
export const NAIL_RIGHT = 3.0;
export const NAIL_HALF = 0.13;
/** 못 머리 — 폭 · 반 높이. 뾰족한 끝의 길이. */
export const HEAD_WIDTH = 0.14;
export const HEAD_HALF = 0.34;
export const TIP_LENGTH = 0.45;

/** 코일 — 못 위에서 감긴 구간(좌 · 우)과 감긴 고리의 반 높이. */
export const COIL_LEFT = -2.0;
export const COIL_RIGHT = 2.0;
export const COIL_HALF = 0.28;

/** 회로 윗변의 높이. 코일 양 끝에서 올라온 도선이 여기서 만난다. */
export const TOP_WIRE_Y = 4.55;
/** 스위치 — 닿는 곳(왼쪽) · 경첩(오른쪽). */
export const SWITCH_CONTACT_X = -0.6;
export const SWITCH_HINGE_X = 0.2;
/** 전지 자리의 가운데 x. 전지가 하나면 첫 자리만 쓰고 둘째 자리는 도선이 잇는다. */
export const CELL_X: readonly number[] = [0.75, 1.25];
/** 전류 화살표가 시작하는 x (윗변 위, 왼쪽). */
export const ARROW_X = -1.85;

/** 클립 사슬이 매달리는 x — 못 양 끝 바로 안쪽. 왼쪽이 N, 오른쪽이 S. */
export const CHAIN_X: readonly [number, number] = [-2.75, 2.8];
/** 탁자 윗면 높이. */
export const TABLE_Y = 0.55;
/** 탁자 위 더미가 사슬 x 를 가운데로 퍼지는 반 폭. */
export const PILE_HALF_SPREAD = 1.45;

/** 클립 — 길이 · 반 폭, 사슬에서 아래 클립이 위 클립에 걸려 겹치는 길이. */
export const CLIP_LENGTH = 0.62;
export const CLIP_HALF_WIDTH = 0.1;
export const CLIP_HOOK = 0.14;

/**
 * 프레이밍 — 가로는 탁자 위 더미 양끝과 극 글자까지, 세로는 캡션 줄부터 전류 기호
 * 높이까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.9, maxX: 4.9, minY: -0.4, maxY: 5.3 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기는 세 판, 판마다 같은 여덟 단계
// ------------------------------------------------------------------------

/** 전지 · 감은 수가 바뀌는 동안(초). 첫째 판에서는 셋째 판의 전지 하나를 뗀다. */
export const WIND = 1.0;
/** 스위치가 열린 채 머무는 동안. */
export const REST = 0.9;
/** 스위치 날이 내려와 닿는 동안. */
export const CLOSE = 0.25;
/** 클립이 날아올라 사슬로 매달리는 동안. */
export const LIFT = 0.7;
/** 매달린 채 머무는 동안. */
export const HOLD = 2.0;
/** 스위치 날이 들리는 동안 — 이 단계가 시작하는 순간 전류가 끊긴다. */
export const OPEN = 0.15;
/** 클립이 떨어지는 동안. */
export const FALL = 0.55;
/** 떨어진 뒤 머무는 동안. */
export const AFTER = 1.0;

/**
 * 판 목록. 판마다 어느 스테이지 상수를 쓰는지와 캡션 키를 가리킨다.
 * 판의 수와 순서가 코드에 남는다 — 스테이지 상수가 수 하나씩뿐이다 (NOTES (c) G105).
 */
export const ROUNDS = [
  {
    id: 'r1',
    turns: 'turnsBase',
    current: 'currentBase',
    cells: 'cellsBase',
    clips: 'clipsBase',
    rest: 'caption.rest1',
    on: 'caption.on1',
  },
  {
    id: 'r2',
    turns: 'turnsMore',
    current: 'currentBase',
    cells: 'cellsBase',
    clips: 'clipsTurns',
    rest: 'caption.rest2',
    on: 'caption.on2',
  },
  {
    id: 'r3',
    turns: 'turnsBase',
    current: 'currentMore',
    cells: 'cellsMore',
    clips: 'clipsCurrent',
    rest: 'caption.rest3',
    on: 'caption.on3',
  },
] as const satisfies readonly {
  id: string;
  turns: string;
  current: string;
  cells: string;
  clips: string;
  rest: ElectromagnetMessageKey;
  on: ElectromagnetMessageKey;
}[];

export type Round = (typeof ROUNDS)[number];

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electromagnetMessages = Object.freeze({
  'label.title': {
    ko: '전자석',
    en: 'Electromagnet',
    ja: '電磁石',
    zh: '电磁铁',
    ar: 'مغناطيس كهربائي',
    es: 'Electroimán',
    fr: 'Électroaimant',
    hi: 'विद्युत चुंबक',
    id: 'Elektromagnet',
    pt: 'Eletroímã',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '전류가 흐를 때만 자석이 되는 것',
    en: 'A magnet only while current flows',
    ja: '電流が流れているときだけ磁石になるもの',
    zh: '只在有电流时才是磁铁',
    ar: 'مغناطيس لا يعمل إلا أثناء سريان التيار',
    es: 'Un imán solo mientras circula corriente',
    fr: 'Un aimant seulement tant que le courant passe',
    hi: 'केवल धारा बहते समय बनने वाला चुंबक',
    id: 'Magnet hanya selama arus mengalir',
    pt: 'Um ímã só enquanto a corrente flui',
  },
  'label.stage': {
    ko: '쇠못과 코일',
    en: 'Iron nail and coil',
    ja: '鉄くぎとコイル',
    zh: '铁钉与线圈',
    ar: 'مسمار حديدي وملف',
    es: 'Clavo de hierro y bobina',
    fr: 'Clou en fer et bobine',
    hi: 'लोहे की कील और कुंडली',
    id: 'Paku besi dan kumparan',
    pt: 'Prego de ferro e bobina',
  },
  'label.view': {
    ko: '클립 들어 올리기',
    en: 'Lifting paper clips',
    ja: 'クリップを持ち上げる',
    zh: '吸起回形针',
    ar: 'رفع مشابك الورق',
    es: 'Levantar clips',
    fr: 'Soulever des trombones',
    hi: 'पेपर क्लिप उठाना',
    id: 'Mengangkat penjepit kertas',
    pt: 'Erguendo clipes',
  },
  /** 극 · 전류 기호. 표식이라 번역하지 않는다 (C1 판정 1 · 3). */
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
  /** 값이 끼는 조립문 — 값은 스테이지 상수를 그대로 끼운다. */
  'label.amps': {
    ko: '{i} A',
    en: '{i} A',
    ja: '{i} A',
    zh: '{i} A',
    ar: '{i} A',
    es: '{i} A',
    fr: '{i} A',
    hi: '{i} A',
    id: '{i} A',
    pt: '{i} A',
  },
  'label.turns': {
    ko: '{n}회 감음',
    en: '{n} turns',
    ja: '{n}回巻き',
    zh: '{n} 匝',
    ar: '{n} لفة',
    es: '{n} vueltas',
    fr: '{n} spires',
    hi: '{n} फेरे',
    id: '{n} lilitan',
    pt: '{n} espiras',
  },
  'caption.rest1': {
    ko: '스위치가 열려 있다 — 전류가 없는 쇠못은 클립을 끌어당기지 않는다',
    en: 'The switch is open — with no current, the iron nail does not pull on the clips',
    ja: 'スイッチが開いている — 電流がないと、鉄くぎはクリップを引きつけない',
    zh: '开关断开 — 没有电流时，铁钉不吸引回形针',
    ar: 'المفتاح مفتوح — من دون تيار لا يجذب المسمار الحديدي المشابك',
    es: 'El interruptor está abierto — sin corriente, el clavo de hierro no atrae los clips',
    fr: 'L’interrupteur est ouvert — sans courant, le clou en fer n’attire pas les trombones',
    hi: 'स्विच खुला है — धारा न होने पर लोहे की कील क्लिपों को नहीं खींचती',
    id: 'Sakelar terbuka — tanpa arus, paku besi tidak menarik penjepit kertas',
    pt: 'A chave está aberta — sem corrente, o prego de ferro não atrai os clipes',
  },
  'caption.on1': {
    ko: '스위치를 닫자 코일에 전류가 흐르고 — 쇠못 양 끝이 N · S 극이 되어 클립을 들어 올린다',
    en: 'Close the switch and current flows in the coil — the nail’s ends become N and S poles and lift the clips',
    ja: 'スイッチを閉じるとコイルに電流が流れ — くぎの両端が N 極・S 極になってクリップを持ち上げる',
    zh: '闭合开关，线圈中有电流流过 — 铁钉两端成为 N 极和 S 极，把回形针吸起',
    ar: 'أغلق المفتاح فيسري التيار في الملف — يصبح طرفا المسمار قطبين N وS ويرفعان المشابك',
    es: 'Al cerrar el interruptor, circula corriente por la bobina — los extremos del clavo se vuelven polos N y S y levantan los clips',
    fr: 'Fermez l’interrupteur : le courant circule dans la bobine — les extrémités du clou deviennent des pôles N et S et soulèvent les trombones',
    hi: 'स्विच बंद करते ही कुंडली में धारा बहती है — कील के दोनों सिरे N और S ध्रुव बन जाते हैं और क्लिपों को उठा लेते हैं',
    id: 'Tutup sakelar dan arus mengalir di kumparan — kedua ujung paku menjadi kutub N dan S lalu mengangkat penjepit kertas',
    pt: 'Feche a chave e a corrente percorre a bobina — as pontas do prego viram polos N e S e erguem os clipes',
  },
  'caption.off': {
    ko: '스위치를 열자 전류가 끊기고 — 쇠못은 자석이 아니게 되어 클립을 떨어뜨린다',
    en: 'Open the switch and the current stops — the nail is no longer a magnet and drops the clips',
    ja: 'スイッチを開くと電流が止まり — くぎは磁石でなくなってクリップを落とす',
    zh: '断开开关，电流中断 — 铁钉不再是磁铁，回形针掉落',
    ar: 'افتح المفتاح فينقطع التيار — لا يعود المسمار مغناطيسًا فيُسقط المشابك',
    es: 'Al abrir el interruptor, la corriente se detiene — el clavo deja de ser un imán y suelta los clips',
    fr: 'Ouvrez l’interrupteur : le courant s’arrête — le clou n’est plus un aimant et lâche les trombones',
    hi: 'स्विच खोलते ही धारा रुक जाती है — कील चुंबक नहीं रहती और क्लिपें गिरा देती है',
    id: 'Buka sakelar dan arus berhenti — paku tidak lagi menjadi magnet dan menjatuhkan penjepit kertas',
    pt: 'Abra a chave e a corrente para — o prego deixa de ser ímã e solta os clipes',
  },
  /** 날이 움직이는 동안 — 전류는 아직(닫힘) 또는 이미(열림) 흐르지 않는다. 클립 이야기는 다음 단계의 몫이다. */
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
  'caption.open': {
    ko: '스위치를 연다',
    en: 'The switch opens',
    ja: 'スイッチを開く',
    zh: '断开开关',
    ar: 'يُفتَح المفتاح',
    es: 'El interruptor se abre',
    fr: 'L’interrupteur s’ouvre',
    hi: 'स्विच खुलता है',
    id: 'Sakelar dibuka',
    pt: 'A chave se abre',
  },
  'caption.rest2': {
    ko: '같은 못에 코일을 더 많이 감는다 — 스위치는 열려 있다',
    en: 'More turns of wire go onto the same nail — the switch is open',
    ja: '同じくぎに導線をさらに多く巻く — スイッチは開いている',
    zh: '在同一根铁钉上多绕几匝导线 — 开关是断开的',
    ar: 'تُلَفّ لفات أكثر من السلك على المسمار نفسه — والمفتاح مفتوح',
    es: 'Se enrollan más vueltas de alambre en el mismo clavo — el interruptor está abierto',
    fr: 'On enroule plus de spires de fil sur le même clou — l’interrupteur est ouvert',
    hi: 'उसी कील पर तार के और फेरे लपेटे जाते हैं — स्विच खुला है',
    id: 'Lebih banyak lilitan kawat dililitkan pada paku yang sama — sakelar terbuka',
    pt: 'Mais espiras de fio são enroladas no mesmo prego — a chave está aberta',
  },
  'caption.on2': {
    ko: '감은 수가 늘자 — 같은 전류로 더 많은 클립이 매달린다',
    en: 'With more turns — the same current holds up more clips',
    ja: '巻き数が増えると — 同じ電流でより多くのクリップがぶら下がる',
    zh: '匝数增加后 — 同样的电流吸起更多回形针',
    ar: 'مع لفات أكثر — يحمل التيار نفسه مشابك أكثر',
    es: 'Con más vueltas — la misma corriente sostiene más clips',
    fr: 'Avec plus de spires — le même courant retient plus de trombones',
    hi: 'फेरे बढ़ने पर — उतनी ही धारा अधिक क्लिपें थामे रखती है',
    id: 'Dengan lilitan lebih banyak — arus yang sama menahan lebih banyak penjepit kertas',
    pt: 'Com mais espiras — a mesma corrente segura mais clipes',
  },
  'caption.rest3': {
    ko: '감은 수를 처음대로 되돌리고 전지를 더 잇는다 — 스위치는 열려 있다',
    en: 'The turns go back to the start and more cells are added — the switch is open',
    ja: '巻き数を元に戻し、電池をさらにつなぐ — スイッチは開いている',
    zh: '匝数恢复到最初，再多接几节电池 — 开关是断开的',
    ar: 'يعود عدد اللفات إلى ما كان عليه وتُوصَل بطاريات أكثر — والمفتاح مفتوح',
    es: 'Las vueltas vuelven a las del principio y se añaden más pilas — el interruptor está abierto',
    fr: 'On revient au nombre de spires initial et on ajoute des piles — l’interrupteur est ouvert',
    hi: 'फेरे पहले जितने कर दिए जाते हैं और अधिक सेल जोड़े जाते हैं — स्विच खुला है',
    id: 'Lilitan dikembalikan seperti semula dan lebih banyak baterai dipasang — sakelar terbuka',
    pt: 'As espiras voltam ao número inicial e mais pilhas são ligadas — a chave está aberta',
  },
  'caption.on3': {
    ko: '전류가 늘자 — 처음과 같은 감은 수로도 더 많은 클립이 매달린다',
    en: 'With more current — the original number of turns holds up more clips',
    ja: '電流が増えると — 最初と同じ巻き数でもより多くのクリップがぶら下がる',
    zh: '电流增大后 — 即使是最初的匝数，也能吸起更多回形针',
    ar: 'مع تيار أكبر — يحمل عدد اللفات الأصلي مشابك أكثر',
    es: 'Con más corriente — el número de vueltas inicial sostiene más clips',
    fr: 'Avec plus de courant — le nombre de spires initial retient plus de trombones',
    hi: 'धारा बढ़ने पर — पहले जितने फेरे भी अधिक क्लिपें थामे रखते हैं',
    id: 'Dengan arus lebih besar — jumlah lilitan semula menahan lebih banyak penjepit kertas',
    pt: 'Com mais corrente — o número inicial de espiras segura mais clipes',
  },
} satisfies Record<string, LocalizedText>);

export type ElectromagnetMessageKey = keyof typeof electromagnetMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectromagnetMessageKey): LocalizedText => electromagnetMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectromagnetMessageKey): string {
  return k;
}

/** 한 판의 여덟 단계. 판 id 를 앞에 붙여 한 시간표 안에서 겹치지 않게 한다. */
function roundPhases(r: Round): TimelinePhase[] {
  return [
    { id: `${r.id}-wind`, duration: WIND, ease: 'smooth', caption: key(r.rest) },
    { id: `${r.id}-rest`, duration: REST, caption: key(r.rest) },
    { id: `${r.id}-close`, duration: CLOSE, ease: 'smooth', caption: key('caption.close') },
    { id: `${r.id}-lift`, duration: LIFT, ease: 'smooth', caption: key(r.on) },
    { id: `${r.id}-hold`, duration: HOLD, caption: key(r.on) },
    { id: `${r.id}-open`, duration: OPEN, ease: 'smooth', caption: key('caption.open') },
    { id: `${r.id}-fall`, duration: FALL, ease: 'inOutCubic', caption: key('caption.off') },
    { id: `${r.id}-after`, duration: AFTER, caption: key('caption.off') },
  ];
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electromagnetSchema: BundleSchema = {
  id: ELECTROMAGNET_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 독자가 손으로 해 보고 싶은 셋(닫으면? 열면? 더 감거나 전류를
  // 늘리면?)을 자동 진행이 한 주기 안에 모두 훑는다.
  parameters: [],

  stages: [
    {
      id: 'nail',
      label: text('label.stage'),
      constants: {
        turnsBase: TURNS_BASE,
        turnsMore: TURNS_MORE,
        currentBase: CURRENT_BASE,
        currentMore: CURRENT_MORE,
        cellsBase: CELLS_BASE,
        cellsMore: CELLS_MORE,
        clipsBase: CLIPS_BASE,
        clipsTurns: CLIPS_TURNS,
        clipsCurrent: CLIPS_CURRENT,
        pileClips: PILE_CLIPS,
        seed: SEED,
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'lift', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 누운 못 하나와 양 끝의 사슬 · 더미가 나란하다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 코일 뒤쪽 가닥은 못 **뒤로**, 앞쪽 가닥은 못 **앞으로** 지나가야
   * 도선이 못을 감은 것으로 읽힌다. 층 순서로는 가닥 둘이 같은 층이다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 기본 판 → 감은 수를 늘린 판 → 전류를 늘린 판. 끝나면 처음 판으로 돌아간다. */
  timeline: { phases: ROUNDS.flatMap(roundPhases) },

  /**
   * 도착한 순간 이미 진행 중이다 — 첫째 판에서 스위치가 막 닫혀 클립이 날아오르는 중이다
   * (감기 1.0 + 쉼 0.9 + 닫힘 0.25 + 들어올림의 0.3 초).
   */
  startAt: 2.45,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.2,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **매달린 클립의 수**다 —
   * 사슬의 길이가 그 자다.
   */

  messages: electromagnetMessages,
};
