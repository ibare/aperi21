// ========================================================================
// stellar-parallax — 선언
// ========================================================================
// 질문: 별까지의 거리를 어떻게 재는가 — 지구가 공전하면 왜 가까운 별만 자리가 바뀌는가.
//
// 지구가 태양 둘레를 돌면 별을 보는 자리가 1 AU 씩 옮겨 간다. 가까운 별은 그만큼 먼 배경
// 별들 사이에서 자리가 어긋나 보이고, 아주 먼 별은 거의 그대로다. 별에서 1 AU(태양–지구)가
// 보이는 각이 연주시차 p 이고, 반 년 사이 두 시선이 이루는 각의 절반이다. 별이 두 배 멀면
// p 가 절반이다 — d(pc) = 1 / p(″).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위. 각은 월드 +x 에서 반시계다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:stellar-parallax` 와 문자 그대로 일치한다 (C4). */
export const STELLAR_PARALLAX_ID = 'stellar-parallax';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 가까운 별의 거리(pc) — 이름표에 그대로 뜬다. */
export const NEAR_DISTANCE_PC = 1;
/** 가까운 별의 연주시차(″). 1 pc 의 정의 그대로 1″. 별의 자리(거리)는 이 각에서 정한다. */
export const NEAR_PARALLAX_ARCSEC = 1;
/** 두 배 먼 별의 거리(pc). */
export const FAR_DISTANCE_PC = 2;
/** 두 배 먼 별의 연주시차(″) — 절반. */
export const FAR_PARALLAX_ARCSEC = 0.5;
/**
 * 그림의 각 과장 배율. 실제 1″ 는 보이지 않으므로 모든 각을 이 배율로 키워 그린다 —
 * 1″ × 45000 = 12.5°. 화면 모서리에 그대로 밝힌다.
 */
export const ANGLE_EXAGGERATION = 45000;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;

/** 태양 자리 · 공전 궤도 반지름(= 1 AU 의 그림 길이). */
export const SUN = { x: 92, y: 196 } as const;
export const SUN_R = 13;
export const ORBIT_R = 58;
export const EARTH_R = 7;
export const STAR_R = 5;
/** 보이는 자리 점의 반지름. */
export const IMAGE_R = 4;

/**
 * 태양에서 본 두 별의 방향(도). 한 줄에 두면 먼 별이 가까운 별 뒤에 숨어 두 시선이 겹친다 —
 * 위 · 아래로 벌린다. 방향은 p 에 영향이 없다(p 는 거리만의 함수).
 */
export const NEAR_DIR_DEG = 12;
export const FAR_DIR_DEG = -9;

/**
 * 배경 별 원호의 반지름 — 별을 중심으로 둔다. 배경은 무한히 멀어 **방향**만 뜻이 있으므로,
 * 별 중심 원호 위의 자리는 곧 그 별이 보이는 방향이다. 두 별에 같은 반지름을 주면 원호 위를
 * 오가는 폭이 각에 정확히 비례한다 — 가까운 별의 폭이 먼 별의 두 배.
 */
export const BG_R = 200;
/** 원호가 흔들림 폭 너머로 더 뻗는 각(도) — 끝에 걸린 점이 원호 끝에 붙지 않게. */
export const BG_MARGIN_DEG = 8;
/** 원호마다 흩뿌리는 배경 별 수 · 시드 · 반지름 방향 퍼짐(±, 월드). */
export const BG_STARS_PER_ARC = 22;
export const BG_SEED = 41;
export const BG_SPREAD = 14;

/** 고정 경계 — 판 전체 + 아래 캡션 두 줄 자리 (장부 G24). */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -44, maxY: 374 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 해를 두 번 돈다
// ------------------------------------------------------------------------

/** 공전 한 바퀴(초). */
export const YEAR = 8;
/** 도착한 순간 — 지구가 이미 돌고 있다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const stellarParallaxMessages = Object.freeze({
  'label.title': {
    ko: '연주시차',
    en: 'Stellar parallax',
    ja: '年周視差',
    zh: '周年视差',
    ar: 'اختلاف المنظر النجمي',
    es: 'Paralaje estelar',
    fr: 'Parallaxe stellaire',
    hi: 'तारकीय लंबन',
    id: 'Paralaks bintang',
    pt: 'Paralaxe estelar',
  },
  'label.operation': {
    ko: '지구가 공전하며 가까운 별이 어긋나 보이는 각',
    en: 'The angle by which a nearby star shifts as Earth orbits the Sun',
    ja: '地球の公転につれて近くの星がずれて見える角度',
    zh: '地球绕太阳公转时近处恒星位置偏移的角度',
    ar: 'الزاوية التي ينزاح بها نجم قريب بينما تدور الأرض حول الشمس',
    es: 'El ángulo que se desplaza una estrella cercana mientras la Tierra orbita el Sol',
    fr: 'L’angle dont se décale une étoile proche quand la Terre tourne autour du Soleil',
    hi: 'वह कोण जिससे पृथ्वी के सूर्य की परिक्रमा करते समय पास का तारा खिसकता दिखता है',
    id: 'Sudut pergeseran bintang dekat saat Bumi mengorbit Matahari',
    pt: 'O ângulo em que uma estrela próxima se desloca enquanto a Terra orbita o Sol',
  },
  'label.stage': {
    ko: '태양 · 지구 · 가까운 별 둘',
    en: 'Sun, Earth and two nearby stars',
    ja: '太陽・地球・近くの二つの星',
    zh: '太阳、地球和两颗近处的恒星',
    ar: 'الشمس والأرض ونجمان قريبان',
    es: 'El Sol, la Tierra y dos estrellas cercanas',
    fr: 'Le Soleil, la Terre et deux étoiles proches',
    hi: 'सूर्य, पृथ्वी और पास के दो तारे',
    id: 'Matahari, Bumi, dan dua bintang dekat',
    pt: 'Sol, Terra e duas estrelas próximas',
  },
  'label.view': {
    ko: '공전면 위에서',
    en: 'From above the orbit',
    ja: '公転面の上から',
    zh: '从轨道上方',
    ar: 'من فوق المدار',
    es: 'Desde encima de la órbita',
    fr: 'Vu au-dessus de l’orbite',
    hi: 'कक्षा के ऊपर से',
    id: 'Dari atas orbit',
    pt: 'De cima da órbita',
  },
  'label.sun': {
    ko: '태양',
    en: 'Sun',
    ja: '太陽',
    zh: '太阳',
    ar: 'الشمس',
    es: 'Sol',
    fr: 'Soleil',
    hi: 'सूर्य',
    id: 'Matahari',
    pt: 'Sol',
  },
  'label.orbit': {
    ko: '지구 궤도',
    en: 'Earth’s orbit',
    ja: '地球の軌道',
    zh: '地球轨道',
    ar: 'مدار الأرض',
    es: 'Órbita de la Tierra',
    fr: 'Orbite de la Terre',
    hi: 'पृथ्वी की कक्षा',
    id: 'Orbit Bumi',
    pt: 'Órbita da Terra',
  },
  'label.background': {
    ko: '먼 배경 별',
    en: 'distant background stars',
    ja: '遠くの背景の星',
    zh: '遥远的背景恒星',
    ar: 'نجوم الخلفية البعيدة',
    es: 'estrellas lejanas de fondo',
    fr: 'étoiles lointaines d’arrière-plan',
    hi: 'दूर के पृष्ठभूमि तारे',
    id: 'bintang latar yang jauh',
    pt: 'estrelas distantes ao fundo',
  },
  'label.star': {
    ko: '{d} pc · p = {p}″',
    en: '{d} pc · p = {p}″',
    ja: '{d} pc · p = {p}″',
    zh: '{d} pc · p = {p}″',
    ar: '{d} pc · p = {p}″',
    es: '{d} pc · p = {p}″',
    fr: '{d} pc · p = {p}″',
    hi: '{d} pc · p = {p}″',
    id: '{d} pc · p = {p}″',
    pt: '{d} pc · p = {p}″',
  },
  'label.exaggeration': {
    ko: '각은 실제의 {k}배로 키워 그렸다',
    en: 'angles drawn {k}× larger than real',
    ja: '角度は実際の {k}× に拡大して描いた',
    zh: '角度按实际的 {k}× 放大绘制',
    ar: 'رُسمت الزوايا أكبر من حقيقتها {k}×',
    es: 'ángulos dibujados {k}× más grandes que los reales',
    fr: 'angles dessinés {k}× plus grands que la réalité',
    hi: 'कोण वास्तविक से {k}× बड़े बनाए गए हैं',
    id: 'sudut digambar {k}× lebih besar dari aslinya',
    pt: 'ângulos desenhados {k}× maiores que os reais',
  },
  'caption.sweep': {
    ko: '지구가 궤도를 도는 동안 가까운 별은 먼 배경 별 사이에서 크게 오가고, 두 배 먼 별은 절반만 오간다. 배경 별은 그대로다.',
    en: 'As Earth goes round its orbit, the nearby star swings back and forth among the distant background stars; the star twice as far swings only half as much. The background stays put.',
    ja: '地球が軌道を回る間、近い星は遠くの背景の星の間を大きく行き来し、2倍遠い星は半分しか行き来しない。背景の星は動かない。',
    zh: '地球沿轨道运行时，近处的星在遥远的背景恒星之间大幅来回摆动；远一倍的星只摆动一半。背景恒星保持不动。',
    ar: 'بينما تدور الأرض في مدارها، يتأرجح النجم القريب ذهابًا وإيابًا بين نجوم الخلفية البعيدة، أما النجم الأبعد بمرتين فيتأرجح نصف ذلك فقط. وتبقى الخلفية في مكانها.',
    es: 'Mientras la Tierra recorre su órbita, la estrella cercana oscila de un lado a otro entre las lejanas estrellas de fondo; la que está al doble de distancia oscila solo la mitad. El fondo no se mueve.',
    fr: 'Tandis que la Terre parcourt son orbite, l’étoile proche oscille d’un côté à l’autre parmi les étoiles lointaines d’arrière-plan ; celle deux fois plus loin n’oscille que de moitié. L’arrière-plan ne bouge pas.',
    hi: 'जैसे-जैसे पृथ्वी अपनी कक्षा में घूमती है, पास का तारा दूर के पृष्ठभूमि तारों के बीच खूब आगे-पीछे झूलता है; दोगुनी दूरी वाला तारा केवल आधा झूलता है। पृष्ठभूमि अपनी जगह पर रहती है।',
    id: 'Saat Bumi mengelilingi orbitnya, bintang dekat berayun bolak-balik di antara bintang latar yang jauh; bintang yang dua kali lebih jauh hanya berayun setengahnya. Latar tetap diam.',
    pt: 'Enquanto a Terra percorre sua órbita, a estrela próxima oscila de um lado para o outro entre as estrelas distantes ao fundo; a que está duas vezes mais longe oscila só a metade. O fundo fica parado.',
  },
  'caption.measure': {
    ko: '반 년 사이 두 시선이 이루는 각의 절반이 연주시차 p — 별에서 태양–지구 거리가 보이는 각이다. 두 배 먼 별은 p 가 절반이다.',
    en: 'Half the angle between two sight lines half a year apart is the parallax p — the angle the Sun–Earth distance spans seen from the star. Twice as far, p is halved.',
    ja: '半年を隔てた二つの視線がなす角の半分が年周視差 p — 星から見て太陽–地球間の距離が張る角だ。2倍遠い星では p は半分になる。',
    zh: '相隔半年的两条视线所成角的一半就是周年视差 p — 从恒星看去日地距离所张的角。远一倍，p 就减半。',
    ar: 'نصف الزاوية بين خطَّي نظر يفصل بينهما نصف عام هو اختلاف المنظر p — الزاوية التي تشغلها المسافة بين الشمس والأرض حين تُرى من النجم. وإذا بَعُد النجم مرتين صار p نصفًا.',
    es: 'La mitad del ángulo entre dos visuales separadas medio año es el paralaje p — el ángulo que abarca la distancia Sol–Tierra vista desde la estrella. Al doble de distancia, p se reduce a la mitad.',
    fr: 'La moitié de l’angle entre deux lignes de visée à six mois d’écart est la parallaxe p — l’angle sous lequel on voit la distance Soleil–Terre depuis l’étoile. Deux fois plus loin, p est divisé par deux.',
    hi: 'आधे वर्ष के अंतर वाली दो दृष्टि-रेखाओं के बीच के कोण का आधा लंबन p है — तारे से देखने पर सूर्य–पृथ्वी दूरी जो कोण बनाती है। दोगुनी दूरी पर p आधा हो जाता है।',
    id: 'Setengah sudut antara dua garis pandang yang berselang setengah tahun adalah paralaks p — sudut yang dibentuk jarak Matahari–Bumi jika dilihat dari bintang. Dua kali lebih jauh, p menjadi setengahnya.',
    pt: 'A metade do ângulo entre duas linhas de visada separadas por meio ano é a paralaxe p — o ângulo que a distância Sol–Terra abrange vista da estrela. Com o dobro da distância, p cai pela metade.',
  },
} satisfies Record<string, LocalizedText>);

export type StellarParallaxMessageKey = keyof typeof stellarParallaxMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: StellarParallaxMessageKey): LocalizedText => stellarParallaxMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StellarParallaxMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const stellarParallaxSchema: BundleSchema = {
  id: STELLAR_PARALLAX_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 두 별이 배경 사이를 오가는 폭이 한 해 동안 드러난다.
  parameters: [],

  stages: [
    {
      id: 'two-stars',
      label: text('label.stage'),
      constants: {
        nearDistancePc: NEAR_DISTANCE_PC,
        nearParallaxArcsec: NEAR_PARALLAX_ARCSEC,
        farDistancePc: FAR_DISTANCE_PC,
        farParallaxArcsec: FAR_PARALLAX_ARCSEC,
        angleExaggeration: ANGLE_EXAGGERATION,
      },
    },
  ],
  environments: [],
  views: [{ id: 'above-orbit', label: text('label.view'), default: true }],

  /** 판 840 × 420 + 캡션 두 줄. 세로는 가까운 별의 배경 원호가 정한다. */
  canvas: { height: 440, minHeight: 400 },

  /** 겹침이 판정 장치다 — 쐐기는 시선 아래, 보이는 자리 점은 배경 별 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 해를 두 번 돈다. 첫 해(`sweep`)는 두 별이 배경 사이를 오가는 폭이 자라고, 둘째 해
   * (`measure`)는 그 폭의 절반인 각 p 를 별에 매단다. 지구 자리는 두 단계 진행도의 합에서 읽는다
   * (physics `orbitTurns`) — 캡션과 지구 자리가 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'sweep', duration: YEAR, ease: 'linear', caption: key('caption.sweep') },
      { id: 'measure', duration: YEAR, ease: 'linear', caption: key('caption.measure') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 두 별이 어떻게 오가는지만 말한다 — d = 1/p 의 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것은 거리가 아니라 각이다.

  messages: stellarParallaxMessages,
};
