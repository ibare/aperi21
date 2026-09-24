// ========================================================================
// roche-limit — 선언
// ========================================================================
// 질문: 토성의 고리는 왜 위성으로 뭉치지 않고 고리로 남았나. 위성이 행성에
// 「너무 가까이」 가면 부서진다는데, 그 「너무」 는 어디서부터인가.
//
// 답: 제 중력으로 뭉친 알갱이 덩어리에서 알갱이를 **붙잡는** 힘(제 중력)은
// 행성과의 거리와 상관없이 그대로다. **떼어 내는** 힘(조석력)은 거리의 세제곱에
// 반비례해 자란다. 두 화살표의 길이가 같아지는 거리가 로슈 한계이고, 그 안쪽으로
// 들어서면 덩어리가 풀려 알갱이가 저마다 궤도를 돈다 — 안쪽 것이 더 빨라 궤도를
// 따라 번지고 고리가 된다.
//
// 떨어지는 먼지 구름이 양쪽으로 늘어나는 것은 `tidal-force` 의 몫이다. 이 조각의
// 주인은 **문턱 거리** 다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:roche-limit` 와 문자 그대로 일치한다 (C4). */
export const ROCHE_LIMIT_ID = 'roche-limit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 월드 단위이고 행성 반지름이 1 이다.
// ------------------------------------------------------------------------

/** 행성 반지름(월드 단위). 모든 거리의 잣대다. */
export const PLANET_RADIUS = 1;
/** 밀도 비 ρ행성 / ρ위성. 바위 행성과 얼음 덩어리쯤이다. */
export const DENSITY_RATIO = 5;
/**
 * 한계 거리 계수. 가까운 쪽 겉 알갱이에서 제 중력 Gm/a² 과 조석력 2GMa/d³ 이 같아지는
 * 거리가 d = 2^(1/3) · R · (ρ행성/ρ위성)^(1/3) 이다 — 두 화살표를 견준 그대로의 계수.
 */
export const ROCHE_COEFFICIENT = 1.26;
/** 덩어리 중심이 출발하는 거리(월드 단위). 조석력 화살표가 제 중력의 0.4 배쯤이다. */
export const START_DISTANCE = 3;
/**
 * 풀린 알갱이 무리의 중심이 멎는 거리(월드 단위). 다가오던 흐름이 풀리는 동안 조금 더
 * 이어져, 번진 고리가 한계 원 안쪽에 온전히 든다.
 */
export const DEBRIS_DISTANCE = 1.7;
/** 덩어리 반지름(월드 단위). 실제 위성보다 한참 크게 — 알갱이와 화살표가 보여야 한다. */
export const CLUMP_RADIUS = 0.42;
/** 알갱이 수. */
export const GRAIN_COUNT = 150;
/** 알갱이 배치의 난수 시드. 같은 시드는 언제나 같은 덩어리다. */
export const SEED = 7;
/** 로슈 한계 거리에서의 궤도 한 바퀴(조각 시계 초). 안팎의 빠르기는 케플러 제3법칙을 따른다. */
export const PERIOD_AT_LIMIT = 3.2;
/** 주기 첫 순간 덩어리의 자리(도, 행성에서 +x 반시계). */
export const START_ANGLE_DEG = -150;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 행성 중심이 원점이다.
// ------------------------------------------------------------------------

/**
 * 확대 판 — 덩어리를 가까이 본다. 덩어리 중심과 함께 도는 틀이라 행성은 늘 왼쪽이다.
 * 궤도 판에서 덩어리는 지름 40 px 남짓이라 두 화살표의 길이를 견줄 수 없어 따로 둔다.
 * `zoom` 은 월드 길이의 배율, (`cx`, `cy`) 는 판 안 덩어리 중심의 자리다.
 */
export const INSET = { x0: 3.95, x1: 9.9, y0: 0.25, y1: 3.4, zoom: 3.2, cx: 8.1, cy: 1.82 } as const;

/** 캡션이 서는 자리(월드). 확대 판 아래다 — 앵커는 글 덩이의 세로 가운데라 세 줄까지 판에 닿지 않게 내렸다. */
export const CAPTION_AT = [3.95, -0.95] as const;

/**
 * 프레이밍은 주장의 일부다. 세로 · 왼쪽은 출발 궤도(3.0)에 덩어리 반지름(0.42)을 더한 것까지,
 * 오른쪽은 확대 판 끝까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.45, maxX: 10, minY: -3.45, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const rocheLimitMessages = Object.freeze({
  'label.title': {
    ko: '로슈 한계',
    en: 'Roche limit',
    ja: 'ロッシュ限界',
    zh: '洛希极限',
    ar: 'حد روش',
    es: 'Límite de Roche',
    fr: 'Limite de Roche',
    hi: 'रोश सीमा',
    id: 'Batas Roche',
    pt: 'Limite de Roche',
  },
  'label.operation': {
    ko: '조석력이 천체를 부수는 거리',
    en: 'The distance at which tides tear a body apart',
    ja: '潮汐力が天体を引き裂く距離',
    zh: '潮汐力把天体撕裂的距离',
    ar: 'المسافة التي تمزّق عندها قوى المد جرمًا سماويًا',
    es: 'La distancia a la que las mareas despedazan un cuerpo',
    fr: 'La distance à laquelle les marées disloquent un corps',
    hi: 'वह दूरी जिस पर ज्वारीय बल किसी पिंड को चीर देता है',
    id: 'Jarak tempat gaya pasang surut mengoyak sebuah benda',
    pt: 'A distância em que as marés despedaçam um corpo',
  },
  'label.stage': {
    ko: '행성과 알갱이 덩어리',
    en: 'A planet and a rubble moon',
    ja: '惑星とがれきの衛星',
    zh: '行星与碎石卫星',
    ar: 'كوكب وقمر من الركام',
    es: 'Un planeta y una luna de escombros',
    fr: 'Une planète et une lune de débris',
    hi: 'एक ग्रह और मलबे से बना चंद्रमा',
    id: 'Sebuah planet dan bulan puing',
    pt: 'Um planeta e uma lua de escombros',
  },
  'label.view': {
    ko: '위에서 본 궤도',
    en: 'Orbit from above',
    ja: '上から見た軌道',
    zh: '从上方看的轨道',
    ar: 'المدار من الأعلى',
    es: 'La órbita vista desde arriba',
    fr: 'L’orbite vue de dessus',
    hi: 'ऊपर से देखी गई कक्षा',
    id: 'Orbit dilihat dari atas',
    pt: 'A órbita vista de cima',
  },

  /** 점선 원의 이름. 강조색은 이 한 뜻(문턱 거리)에만 쓴다. */
  'label.limit': {
    ko: '로슈 한계',
    en: 'Roche limit',
    ja: 'ロッシュ限界',
    zh: '洛希极限',
    ar: 'حد روش',
    es: 'Límite de Roche',
    fr: 'Limite de Roche',
    hi: 'रोश सीमा',
    id: 'Batas Roche',
    pt: 'Limite de Roche',
  },
  /** 확대 판의 이름 — 틀이 바뀌었다(덩어리와 함께 돈다)는 사실은 그림만으로 알 수 없어 둔다. */
  'label.inset': {
    ko: '덩어리 가까이 — 행성은 왼쪽',
    en: 'Clump up close · planet at left',
    ja: '塊の拡大 · 惑星は左',
    zh: '团块特写 · 行星在左侧',
    ar: 'التكتل عن قرب · الكوكب إلى اليسار',
    es: 'El cúmulo de cerca · planeta a la izquierda',
    fr: 'L’amas de près · planète à gauche',
    hi: 'पास से गुच्छा · ग्रह बाईं ओर',
    id: 'Gumpalan dari dekat · planet di kiri',
    pt: 'O aglomerado de perto · planeta à esquerda',
  },
  /** 두 화살표의 이름. 같은 색이고 가르는 것은 이 이름과 방향이다. */
  'label.selfGravity': {
    ko: '제 중력',
    en: 'self-gravity',
    ja: '自己重力',
    zh: '自引力',
    ar: 'الجاذبية الذاتية',
    es: 'autogravedad',
    fr: 'autogravité',
    hi: 'स्व-गुरुत्व',
    id: 'gravitasi diri',
    pt: 'autogravidade',
  },
  'label.tidal': {
    ko: '조석력',
    en: 'tidal pull',
    ja: '潮汐力',
    zh: '潮汐力',
    ar: 'قوة المد',
    es: 'fuerza de marea',
    fr: 'force de marée',
    hi: 'ज्वारीय खिंचाव',
    id: 'tarikan pasang surut',
    pt: 'força de maré',
  },

  'caption.approach': {
    ko: '알갱이를 붙잡는 제 중력은 거리와 상관없이 그대로다. 행성에 다가갈수록 떼어 내는 조석력만 빠르게 자란다.',
    en: 'The self-gravity holding the grains stays the same at any distance. Closer to the planet, only the tidal pull tearing them away grows — and fast.',
    ja: '粒をつなぎとめる自己重力は、距離によらず変わらない。惑星に近づくほど、引きはがす潮汐力だけが急速に大きくなる。',
    zh: '束缚颗粒的自引力不随距离改变。越靠近行星，只有把颗粒拉开的潮汐力在增大 — 而且增大得很快。',
    ar: 'الجاذبية الذاتية التي تمسك الحبيبات تبقى كما هي عند أي مسافة. وكلما اقتربنا من الكوكب، نمت قوة المد التي تنتزعها وحدها — وبسرعة.',
    es: 'La autogravedad que mantiene unidos los granos es la misma a cualquier distancia. Más cerca del planeta, solo crece la fuerza de marea que los arranca — y rápido.',
    fr: 'L’autogravité qui retient les grains reste la même à toute distance. Plus près de la planète, seule la force de marée qui les arrache grandit — et vite.',
    hi: 'कणों को थामे रखने वाला स्व-गुरुत्व हर दूरी पर एक-सा रहता है। ग्रह के पास जाने पर केवल उन्हें खींचकर अलग करने वाला ज्वारीय खिंचाव बढ़ता है — और तेज़ी से।',
    id: 'Gravitasi diri yang menahan butiran tetap sama pada jarak berapa pun. Makin dekat ke planet, hanya tarikan pasang surut yang merenggutnya yang membesar — dan dengan cepat.',
    pt: 'A autogravidade que segura os grãos é a mesma a qualquer distância. Mais perto do planeta, só a força de maré que os arranca cresce — e depressa.',
  },
  'caption.limit': {
    ko: '로슈 한계 — 떼어 내는 조석력이 붙잡는 제 중력과 같아졌다.',
    en: 'The Roche limit — the tidal pull has grown as strong as the self-gravity.',
    ja: 'ロッシュ限界 — 引きはがす潮汐力が、つなぎとめる自己重力と等しくなった。',
    zh: '洛希极限 — 潮汐力已增大到与自引力一样强。',
    ar: 'حد روش — نمت قوة المد حتى صارت بقوة الجاذبية الذاتية.',
    es: 'El límite de Roche — la fuerza de marea ya es tan intensa como la autogravedad.',
    fr: 'La limite de Roche — la force de marée est devenue aussi forte que l’autogravité.',
    hi: 'रोश सीमा — ज्वारीय खिंचाव बढ़कर स्व-गुरुत्व जितना प्रबल हो गया है।',
    id: 'Batas Roche — tarikan pasang surut kini sama kuatnya dengan gravitasi diri.',
    pt: 'O limite de Roche — a força de maré ficou tão forte quanto a autogravidade.',
  },
  'caption.breakup': {
    ko: '한계 안쪽에서는 조석력이 이긴다. 덩어리가 풀린다.',
    en: 'Inside the limit the tidal pull wins. The clump comes apart.',
    ja: '限界の内側では潮汐力が勝つ。塊はばらばらになる。',
    zh: '在极限以内，潮汐力占了上风。团块散开了。',
    ar: 'داخل الحد تنتصر قوة المد. فيتفكك التكتل.',
    es: 'Dentro del límite gana la fuerza de marea. El cúmulo se deshace.',
    fr: 'À l’intérieur de la limite, la force de marée l’emporte. L’amas se disloque.',
    hi: 'सीमा के भीतर ज्वारीय खिंचाव जीत जाता है। गुच्छा बिखर जाता है।',
    id: 'Di dalam batas, tarikan pasang surut menang. Gumpalan itu tercerai-berai.',
    pt: 'Dentro do limite, a força de maré vence. O aglomerado se desfaz.',
  },
  'caption.spread': {
    ko: '풀린 알갱이는 저마다 궤도를 돈다. 안쪽 것이 더 빨라, 궤도를 따라 번진다.',
    en: 'Each freed grain now keeps its own orbit. The inner ones run faster, so they smear out along the orbit.',
    ja: 'ばらけた粒はそれぞれ自分の軌道を回る。内側のものほど速く、軌道に沿って広がっていく。',
    zh: '散开的颗粒各自沿自己的轨道运行。内侧的更快，于是沿轨道拖散开来。',
    ar: 'كل حبيبة حرة تسير الآن في مدارها الخاص. والداخلية أسرع، فتنتشر على طول المدار.',
    es: 'Cada grano liberado sigue ahora su propia órbita. Los interiores van más rápido, así que se esparcen a lo largo de la órbita.',
    fr: 'Chaque grain libéré suit désormais sa propre orbite. Les plus intérieurs vont plus vite et s’étalent le long de l’orbite.',
    hi: 'हर मुक्त कण अब अपनी कक्षा में घूमता है। भीतरी कण अधिक तेज़ चलते हैं, इसलिए वे कक्षा के साथ-साथ फैल जाते हैं।',
    id: 'Setiap butiran yang terlepas kini menempuh orbitnya sendiri. Butiran di sisi dalam bergerak lebih cepat, sehingga tersebar di sepanjang orbit.',
    pt: 'Cada grão liberado segue agora sua própria órbita. Os de dentro andam mais rápido e se espalham ao longo da órbita.',
  },
  'caption.ring': {
    ko: '위성이 있던 자리에 고리가 남았다. 한계 안쪽이라 다시 뭉치지 못한다.',
    en: 'Where the moon was, a ring remains. Inside the limit it cannot pull itself back together.',
    ja: '衛星があった場所に環が残った。限界の内側なので、ふたたび集まることはできない。',
    zh: '卫星原来的位置留下了一道环。它在极限以内，无法重新聚合。',
    ar: 'في موضع القمر بقيت حلقة. ولأنها داخل الحد، لا تستطيع أن تتجمع من جديد.',
    es: 'Donde estaba la luna queda un anillo. Dentro del límite, no puede volver a juntarse.',
    fr: 'Là où était la lune, il reste un anneau. À l’intérieur de la limite, elle ne peut pas se rassembler.',
    hi: 'जहाँ चंद्रमा था, वहाँ एक वलय बचा है। सीमा के भीतर होने से वह फिर से जुड़ नहीं पाता।',
    id: 'Di tempat bulan tadi berada, tersisa sebuah cincin. Karena di dalam batas, ia tak bisa menyatu kembali.',
    pt: 'Onde estava a lua, resta um anel. Dentro do limite, ela não consegue se juntar de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type RocheLimitMessageKey = keyof typeof rocheLimitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RocheLimitMessageKey): LocalizedText => rocheLimitMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RocheLimitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const rocheLimitSchema: BundleSchema = {
  id: ROCHE_LIMIT_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 다가오는 한 번이 모든 거리를 훑으므로 거리를 끌어 새로 알게 되는 것이
  // 없다. 밀도 비를 고르게 하면 「한계가 어디로 옮겨 가나」 라는 다른 질문이 된다 (NOTES).
  parameters: [],

  stages: [
    {
      id: 'rubble-moon',
      label: text('label.stage'),
      constants: {
        planetRadius: PLANET_RADIUS,
        densityRatio: DENSITY_RATIO,
        rocheCoefficient: ROCHE_COEFFICIENT,
        startDistance: START_DISTANCE,
        debrisDistance: DEBRIS_DISTANCE,
        clumpRadius: CLUMP_RADIUS,
        grainCount: GRAIN_COUNT,
        seed: SEED,
        periodAtLimit: PERIOD_AT_LIMIT,
        startAngle: START_ANGLE_DEG,
      },
    },
  ],

  environments: [],

  views: [{ id: 'orbit', label: text('label.view'), default: true }],

  /** 궤도를 왼쪽에, 확대 판과 캡션을 오른쪽에 둬 세로를 아낀다 (S-piece — 세로가 비싸다). */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 겹침 순서가 뜻을 갖는다 — 한계 원과 지나온 자취는 알갱이 아래, 확대 판의 두 화살표는
   * 알갱이 위로 지나야 덩어리 속을 가로지르는 「제 중력」 이 읽힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 17 초(조각 시계).
   *
   * - `approach` — 덩어리가 돌면서 행성 쪽으로 다가온다. 거리는 진행도에 곧게 따라가고,
   *   조석력 화살표는 (한계 / 거리)³ 로 자란다. 제 중력 화살표는 그대로다.
   * - `limit` — 한계 원 위. 확대 판의 두 화살표가 같은 길이다. 0.35 배로 흘러 화면에서 약 1.7 초 머문다.
   * - `breakup` — 한계 안쪽으로 들어서며 덩어리가 풀린다. 알갱이는 이 단계 첫 순간부터
   *   저마다의 케플러 궤도를 돌고, 무리는 `debrisDistance` 까지 조금 더 들어온다. 확대 판은 흐려진다.
   * - `spread` — 안쪽 알갱이가 앞서 나가 무리가 궤도를 따라 번진다.
   * - `ring` — 궤도를 한 바퀴 덮은 고리.
   * - `fade` — 알갱이가 흐려지고 다음 주기의 덩어리로 돌아간다.
   *
   * 알갱이의 각은 지난 시각의 거리를 적분해야 해서, physics 가 이 선언의 이징 이름을 읽어
   * 같은 식을 건다 (G59).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 6.5, ease: 'linear', caption: key('caption.approach') },
      { id: 'limit', duration: 0.6, timeScale: 0.35, caption: key('caption.limit') },
      { id: 'breakup', duration: 1.6, ease: 'smooth', caption: key('caption.breakup') },
      { id: 'spread', duration: 5.5, caption: key('caption.spread') },
      { id: 'ring', duration: 2, caption: key('caption.ring') },
      { id: 'fade', duration: 0.8, caption: key('caption.ring') },
    ],
  },

  /** 도착한 순간 이미 돌며 다가오는 중이다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다. */
  startAt: 1.5,

  // 슬롯 하나. 확대 판 아래에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    wrapWidth: 300,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 것은 거리의 값이 아니라 두 화살표의
  // 길이가 같아지는 **자리** 이고, 그 자리는 점선 원이 말한다.

  messages: rocheLimitMessages,
};
