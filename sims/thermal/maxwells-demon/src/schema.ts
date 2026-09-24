// ========================================================================
// maxwells-demon — 선언
// ========================================================================
// 질문: 같은 온도의 두 칸을 저절로 뜨거운 칸과 찬 칸으로 가를 수 있나.
//
// 칸막이 문 위의 도깨비가 문으로 다가오는 알갱이의 속력을 재고, 빠른 것은 왼쪽 → 오른쪽,
// 느린 것은 오른쪽 → 왼쪽으로만 문을 열어 준다. 두 칸의 온도 막대가 벌어진다. 그런데
// 도깨비는 다가오는 알갱이를 **하나도 빼놓지 않고** 재야 하고, 잴 때마다 공책에 한 줄을
// 적는다 — 문을 연 횟수보다 공책의 줄이 훨씬 빨리 는다. 동사: 갈라지고, 적힌다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:maxwells-demon` 와 문자 그대로 일치한다 (C4). */
export const MAXWELLS_DEMON_ID = 'maxwells-demon';

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 상자 왼쪽 아래 모서리가 원점, y 는 위가 양수.
// 물리량(분자 수 · 시드 · 상자 · 속력 · 문턱 · 문 · 막대 배율)은 스테이지 상수다 (아래 `stages`).
// 아래 자리는 기본 상자(2.4 × 1.2)에 맞춘 고정값이다 (원칙 6).
// ------------------------------------------------------------------------

/** 온도 막대 두 개 — 상자 오른쪽. 바닥은 상자 바닥과 같은 높이다. */
export const BARS = {
  /** 왼쪽 칸 막대 · 오른쪽 칸 막대의 가운데 x(월드). */
  centers: [2.95, 3.45] as readonly [number, number],
  /** 막대 폭(월드). */
  width: 0.3,
  /** 「처음 높이」 점선이 막대 바깥으로 삐져나오는 길이(월드). */
  guideOvershoot: 0.08,
} as const;

/** 도깨비의 공책 — 막대 오른쪽. 판정 한 번에 한 줄, 칸이 차면 옆 칸으로 넘어간다. */
export const NOTEBOOK = {
  /** 공책 왼쪽 아래 · 오른쪽 위 모서리(월드). */
  min: [3.95, 0] as readonly [number, number],
  max: [5.3, 1.2] as readonly [number, number],
  /** 공책 안 여백(월드). */
  pad: 0.07,
  /** 줄 칸 — 세로 줄 수 · 가로 칸 수. 판정이 이보다 많으면 넘치는 줄은 적지 않는다 (NOTES (b)). */
  rows: 22,
  cols: 3,
  /** 칸 사이 가로 틈(월드). */
  gutter: 0.06,
  /** 줄 길이의 짧은 끝 — 칸 폭에 대한 비. 손으로 적은 줄처럼 길이가 조금씩 다르다. */
  minLength: 0.55,
} as const;

/** 도깨비 머리 자리(월드) — 칸막이 위, 상자 윗벽 바로 위. */
export const DEMON_POS = [1.2, 1.33] as readonly [number, number];

/**
 * 도깨비 외형 — 둥근 머리에 뿔 둘. SVG 경로, 좌표는 `DEMON_POS` 기준 월드 단위, y 위.
 * 모양은 저작 결정이라 선언에 둔다.
 */
export const DEMON_PATH =
  'M -0.075 0 A 0.075 0.075 0 1 0 0.075 0 A 0.075 0.075 0 1 0 -0.075 0 Z ' +
  'M -0.058 0.045 L -0.085 0.135 L -0.022 0.07 Z ' +
  'M 0.058 0.045 L 0.085 0.135 L 0.022 0.07 Z';

/**
 * 프레이밍. 상자(0~2.4) · 막대(2.8~3.6) · 공책(3.95~5.3) 가로, 위로는 도깨비와 제목 줄,
 * 아래로는 막대 이름과 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.1, maxX: 5.4, minY: -0.62, maxY: 1.56 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const maxwellsDemonMessages = Object.freeze({
  'label.title': {
    ko: '맥스웰의 도깨비',
    en: "Maxwell's demon",
    ja: 'マクスウェルの悪魔',
    zh: '麦克斯韦妖',
    ar: 'شيطان ماكسويل',
    es: 'El demonio de Maxwell',
    fr: 'Le démon de Maxwell',
    hi: 'मैक्सवेल का दानव',
    id: 'Iblis Maxwell',
    pt: 'O demônio de Maxwell',
  },
  'label.operation': {
    ko: '정보와 엔트로피의 관계',
    en: 'Information and entropy',
    ja: '情報とエントロピー',
    zh: '信息与熵',
    ar: 'المعلومات والإنتروبيا',
    es: 'Información y entropía',
    fr: 'Information et entropie',
    hi: 'सूचना और एन्ट्रॉपी',
    id: 'Informasi dan entropi',
    pt: 'Informação e entropia',
  },
  'label.stage': {
    ko: '문 달린 상자',
    en: 'Box with a trapdoor',
    ja: '仕切り戸つきの箱',
    zh: '带活门的盒子',
    ar: 'صندوق ذو باب صغير',
    es: 'Caja con compuerta',
    fr: 'Boîte à trappe',
    hi: 'छोटे दरवाज़े वाला बक्सा',
    id: 'Kotak dengan pintu kecil',
    pt: 'Caixa com alçapão',
  },
  'label.view': {
    ko: '상자 · 온도 막대 · 공책',
    en: 'Box, temperature bars, notebook',
    ja: '箱・温度バー・ノート',
    zh: '盒子、温度柱、笔记本',
    ar: 'الصندوق وأعمدة درجة الحرارة والدفتر',
    es: 'Caja, barras de temperatura, cuaderno',
    fr: 'Boîte, barres de température, carnet',
    hi: 'बक्सा, ताप पट्टियाँ, नोटबुक',
    id: 'Kotak, batang suhu, buku catatan',
    pt: 'Caixa, barras de temperatura, caderno',
  },
  /** 도깨비 이름표. */
  'label.demon': {
    ko: '도깨비',
    en: 'demon',
    ja: '悪魔',
    zh: '妖',
    ar: 'الشيطان',
    es: 'demonio',
    fr: 'démon',
    hi: 'दानव',
    id: 'iblis',
    pt: 'demônio',
  },
  /** 막대 묶음 제목. */
  'label.temperature': {
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
  /** 막대 이름. */
  'label.left': {
    ko: '왼쪽',
    en: 'left',
    ja: '左',
    zh: '左',
    ar: 'اليسار',
    es: 'izquierda',
    fr: 'gauche',
    hi: 'बायाँ',
    id: 'kiri',
    pt: 'esquerda',
  },
  'label.right': {
    ko: '오른쪽',
    en: 'right',
    ja: '右',
    zh: '右',
    ar: 'اليمين',
    es: 'derecha',
    fr: 'droite',
    hi: 'दायाँ',
    id: 'kanan',
    pt: 'direita',
  },
  /** 처음 높이 점선의 이름. */
  'label.start': {
    ko: '처음',
    en: 'start',
    ja: '最初',
    zh: '初始',
    ar: 'البداية',
    es: 'inicio',
    fr: 'départ',
    hi: 'आरंभ',
    id: 'awal',
    pt: 'início',
  },
  /** 공책 제목. */
  'label.notebook': {
    ko: '도깨비의 공책',
    en: "demon's notebook",
    ja: '悪魔のノート',
    zh: '妖的笔记本',
    ar: 'دفتر الشيطان',
    es: 'cuaderno del demonio',
    fr: 'carnet du démon',
    hi: 'दानव की नोटबुक',
    id: 'buku catatan iblis',
    pt: 'caderno do demônio',
  },
  'caption.mixed': {
    ko: '문이 닫혀 있다. 두 칸 모두 큰(빠른) 알갱이와 작은(느린) 알갱이가 {n}개씩 섞여 있고, 두 온도 막대의 높이가 같다.',
    en: 'The door is shut. Each side holds {n} molecules, big (fast) and small (slow) mixed, and the two temperature bars stand level.',
    ja: '戸は閉じている。どちらの側にも大きい（速い）分子と小さい（遅い）分子が混ざって{n}個ずつあり、二本の温度バーの高さは同じだ。',
    zh: '门是关着的。两侧各有{n}个分子，大的（快）和小的（慢）混在一起，两根温度柱一样高。',
    ar: 'الباب مغلق. في كل جانب {n} من الجزيئات، كبيرة (سريعة) وصغيرة (بطيئة) مختلطة، وعمودا درجة الحرارة متساويان في الارتفاع.',
    es: 'La puerta está cerrada. Cada lado tiene {n} moléculas, grandes (rápidas) y pequeñas (lentas) mezcladas, y las dos barras de temperatura están a la misma altura.',
    fr: 'La porte est fermée. Chaque côté contient {n} molécules, grosses (rapides) et petites (lentes) mêlées, et les deux barres de température sont à égalité.',
    hi: 'दरवाज़ा बंद है। दोनों ओर {n} अणु हैं, बड़े (तेज़) और छोटे (धीमे) मिले-जुले, और दोनों ताप पट्टियाँ बराबर ऊँचाई पर हैं।',
    id: 'Pintu tertutup. Tiap sisi berisi {n} molekul, besar (cepat) dan kecil (lambat) bercampur, dan kedua batang suhu sama tinggi.',
    pt: 'A porta está fechada. Cada lado tem {n} moléculas, grandes (rápidas) e pequenas (lentas) misturadas, e as duas barras de temperatura estão no mesmo nível.',
  },
  'caption.sort': {
    ko: '도깨비가 문으로 다가오는 알갱이마다 속력을 재어 본다. 빠른 것은 오른쪽으로, 느린 것은 왼쪽으로만 문을 열어 주고, 하나를 볼 때마다 공책에 한 줄을 적는다.',
    en: 'The demon times every molecule that comes to the door. It opens only for fast ones going right and slow ones going left, and writes one line for every molecule it looks at.',
    ja: '悪魔は戸に近づく分子ごとに速さを測る。速いものは右へ、遅いものは左へ行くときだけ戸を開け、一つ見るたびにノートに一行書く。',
    zh: '妖对每个来到门前的分子测速。只为向右的快分子和向左的慢分子开门，每看一个分子就在笔记本上写一行。',
    ar: 'يقيس الشيطان سرعة كل جزيء يقترب من الباب. لا يفتح إلا للسريعة المتجهة يمينًا وللبطيئة المتجهة يسارًا، ويكتب سطرًا لكل جزيء ينظر إليه.',
    es: 'El demonio cronometra cada molécula que llega a la puerta. Solo abre a las rápidas que van a la derecha y a las lentas que van a la izquierda, y anota una línea por cada molécula que mira.',
    fr: 'Le démon chronomètre chaque molécule qui arrive à la porte. Il n’ouvre qu’aux rapides allant à droite et aux lentes allant à gauche, et écrit une ligne pour chaque molécule qu’il examine.',
    hi: 'दानव दरवाज़े तक आने वाले हर अणु की चाल मापता है। वह केवल दाईं ओर जाते तेज़ अणुओं और बाईं ओर जाते धीमे अणुओं के लिए दरवाज़ा खोलता है, और हर देखे गए अणु के लिए एक पंक्ति लिखता है।',
    id: 'Iblis mengukur kelajuan setiap molekul yang mendekati pintu. Ia hanya membuka pintu untuk yang cepat menuju kanan dan yang lambat menuju kiri, dan menulis satu baris untuk setiap molekul yang dilihatnya.',
    pt: 'O demônio cronometra cada molécula que chega à porta. Só abre para as rápidas indo para a direita e as lentas indo para a esquerda, e escreve uma linha para cada molécula que observa.',
  },
  'caption.sorted': {
    ko: '오른쪽에 큰 알갱이가, 왼쪽에 작은 알갱이가 모인다 — 오른쪽 막대가 오르고 왼쪽 막대가 내려간다. 닫힌 문에 튕겨 나간 알갱이도 공책에 한 줄씩 적힌다.',
    en: 'Big molecules gather on the right, small ones on the left — the right bar rises and the left bar sinks. Molecules turned back at the shut door get a line in the notebook too.',
    ja: '右に大きい分子が、左に小さい分子が集まる — 右のバーが上がり、左のバーが下がる。閉じた戸で跳ね返された分子も、ノートに一行ずつ書かれる。',
    zh: '大分子聚到右边，小分子聚到左边 — 右边的柱升高，左边的柱下降。在关着的门前被弹回的分子，也在笔记本上各记一行。',
    ar: 'تتجمّع الجزيئات الكبيرة في اليمين والصغيرة في اليسار — يرتفع العمود الأيمن وينخفض الأيسر. والجزيئات المرتدّة عن الباب المغلق يُكتب لكلٍّ منها سطر في الدفتر أيضًا.',
    es: 'Las moléculas grandes se reúnen a la derecha y las pequeñas a la izquierda — la barra derecha sube y la izquierda baja. Las moléculas rechazadas en la puerta cerrada también reciben una línea en el cuaderno.',
    fr: 'Les grosses molécules se rassemblent à droite, les petites à gauche — la barre de droite monte et celle de gauche descend. Les molécules renvoyées par la porte fermée ont aussi leur ligne dans le carnet.',
    hi: 'बड़े अणु दाईं ओर और छोटे बाईं ओर जमा होते हैं — दाईं पट्टी चढ़ती है और बाईं पट्टी गिरती है। बंद दरवाज़े से लौटाए गए अणुओं की भी नोटबुक में एक-एक पंक्ति लिखी जाती है।',
    id: 'Molekul besar berkumpul di kanan, yang kecil di kiri — batang kanan naik dan batang kiri turun. Molekul yang terpantul di pintu tertutup juga mendapat satu baris di buku catatan.',
    pt: 'As moléculas grandes se reúnem à direita e as pequenas à esquerda — a barra da direita sobe e a da esquerda desce. As moléculas barradas na porta fechada também ganham uma linha no caderno.',
  },
  'caption.hold': {
    ko: '문이 멈췄다. 오른쪽은 뜨거운 칸, 왼쪽은 찬 칸이 되었고, 공책에는 재어 본 횟수만큼 줄이 남았다.',
    en: 'The door stops. The right side is now hot and the left cold, and the notebook keeps one line for every molecule timed.',
    ja: '戸が止まった。右は熱い側、左は冷たい側になり、ノートには測った分子1個につき1行が残った。',
    zh: '门停下了。右边成了热的一侧，左边成了冷的一侧，笔记本上每测过一个分子就留下一行。',
    ar: 'توقّف الباب. صار الجانب الأيمن ساخنًا والأيسر باردًا، وبقي في الدفتر سطر لكل جزيء قيست سرعته.',
    es: 'La puerta se detiene. El lado derecho ahora está caliente y el izquierdo frío, y el cuaderno guarda una línea por cada molécula cronometrada.',
    fr: 'La porte s’arrête. Le côté droit est maintenant chaud et le gauche froid, et le carnet garde une ligne par molécule chronométrée.',
    hi: 'दरवाज़ा रुक गया। अब दायाँ भाग गर्म है और बायाँ ठंडा, और नोटबुक में हर मापे गए अणु के लिए एक पंक्ति बची है।',
    id: 'Pintu berhenti. Sisi kanan kini panas dan sisi kiri dingin, dan buku catatan menyimpan satu baris untuk setiap molekul yang diukur.',
    pt: 'A porta para. O lado direito agora está quente e o esquerdo frio, e o caderno guarda uma linha para cada molécula cronometrada.',
  },
} satisfies Record<string, LocalizedText>);

export type MaxwellsDemonMessageKey = keyof typeof maxwellsDemonMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MaxwellsDemonMessageKey): LocalizedText => maxwellsDemonMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MaxwellsDemonMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const maxwellsDemonSchema: BundleSchema = {
  id: MAXWELLS_DEMON_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 섞여 있고, 도깨비가 가르고, 멈춘다.
  parameters: [],

  /**
   * 기체와 문.
   * - `perSide` 한 칸의 분자 수, `seed` 처음 자리 · 속도 시드(같은 시각 = 같은 화면).
   *   두 칸은 **같은 속력 목록**을 나눠 가진다 — 처음 온도가 정확히 같다.
   * - `boxWidth` · `boxHeight` 상자(월드), `speedScale` 속도 성분 정규분포의 표준편차(월드/초).
   * - `speedThreshold` 도깨비의 문턱 속력(월드/초). 이보다 빠르면 「빠름」.
   * - `doorLow` · `doorHigh` 칸막이에 난 문의 아래 · 위 높이(월드).
   * - `doorOpenSeconds` 문이 활짝 열려 있는 시간, `doorSwingSeconds` 여닫는 데 드는 시간(초).
   *   알갱이마다 지나는 시각이 달라 시간표 단계로 풀 수 없어 상수로 둔다 (NOTES (c)).
   * - `ringSeconds` 도깨비가 잰 자리에 번지는 고리 · 공책의 새 줄 강조가 남는 시간(초).
   * - `barScale` 온도 막대 배율 — 처음 온도가 이 높이(월드)다.
   *
   * 시드 6 에서 도깨비가 일하는 12 초 동안 판정 58회 · 문 열림 12회, 끝에 두 칸 18 : 18,
   * 온도는 처음의 0.38 배 : 1.62 배다 (NOTES (d)). 시드를 바꾸면 캡션이 참인지 다시 찍어 본다.
   */
  stages: [
    {
      id: 'trapdoor-box',
      label: text('label.stage'),
      constants: {
        perSide: 18,
        seed: 6,
        boxWidth: 2.4,
        boxHeight: 1.2,
        speedScale: 0.6,
        speedThreshold: 0.7,
        doorLow: 0.3,
        doorHigh: 0.9,
        doorOpenSeconds: 0.3,
        doorSwingSeconds: 0.15,
        ringSeconds: 0.6,
        barScale: 0.5,
      },
    },
  ],

  environments: [],

  views: [{ id: 'box-bars-notebook', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림(상자 + 막대 + 공책)에 캡션 두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 350, minHeight: 320 },

  /** 문은 칸막이 위에, 알갱이는 문 위에, 지금 판정 고리는 맨 위에 얹혀야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 나타남 · 섞임 · 가름(앞 · 뒤) · 멈춤 · 흐려짐.
   *
   * 도깨비는 `sort` 시작부터 `sorted` 끝까지 일한다. 앞 · 뒤로 나눈 것은 캡션 때문이다 —
   * 막대가 벌어진다는 문장은 벌어진 뒤에야 참이다. 주기가 끝날 때 알갱이를 되섞어 보이지
   * 않고 흐려졌다가 새로 나타난다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.4, caption: key('caption.mixed') },
      { id: 'mixed', duration: 2.6, caption: key('caption.mixed') },
      { id: 'sort', duration: 5, caption: key('caption.sort') },
      { id: 'sorted', duration: 7, caption: key('caption.sorted') },
      { id: 'hold', duration: 3.5, caption: key('caption.hold') },
      { id: 'fade', duration: 0.8, caption: key('caption.hold') },
    ],
  },

  /** 도착한 순간 이미 알갱이들이 두 칸에서 튀고 있다 — 나타남 단계를 건너뛴다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정보 · 엔트로피의 셈은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { n: 'perSideText' },
  },

  messages: maxwellsDemonMessages,
};
