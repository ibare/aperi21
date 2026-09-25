// ========================================================================
// viscosity — 선언
// ========================================================================
// 질문: 「끈적하다」 는 흐름에서 무엇이 다르다는 뜻인가.
//
// 두 판 사이에 유체를 채우고 윗판을 끈다. 판에 닿은 층이 끌려가고, 그 층이
// 바로 아래 층을 끌고, 아래로 갈수록 덜 끌린다 — 층과 층 사이의 마찰이다.
// 같은 빠르기로 끌면 층들이 끌려가는 모양은 묽은 유체와 끈적한 유체가 **같다.**
// 다른 것은 끄는 데 드는 힘이다. 점성이 n 배면 힘도 n 배다 (F = η·A·U / h).
//
// 화면에서는 위아래 두 레인이 똑같이 계단으로 벌어지는 염료 토막을 보이고,
// 윗판을 끄는 화살표만 길이가 다르다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:viscosity` 와 문자 그대로 일치한다 (C4). */
export const VISCOSITY_ID = 'viscosity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 윗판을 끄는 빠르기(월드/초). 두 레인에 같다 — 같은 빠르기로 끄는 것이 비교의 조건이다. */
export const PLATE_SPEED = 0.65;
/** 묽은 유체의 점성(상대값). */
export const VISCOSITY_THIN = 1;
/** 끈적한 유체의 점성이 묽은 쪽의 몇 배인가. 화면의 `{n}η` · `{n}F` 는 이 선언값을 그대로 쓴다. */
export const VISCOSITY_RATIO = 4;
/** 두 판 사이를 나눠 보이는 층 수. */
export const LAYER_COUNT = 6;
/**
 * 힘 화살표 길이 배율 — 화살표 길이(월드) = 이 값 × η · U / h.
 * 묽은 유체(η = 1, U = 0.65, h = 0.9)에서 약 0.45 가 된다.
 */
export const FORCE_SCALE = 0.62;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 원점은 아래 레인(끈적한 유체) 유체의 왼쪽 아래 모서리.
// ------------------------------------------------------------------------

/** 유체가 차 있는 가로 폭. */
export const LANE_WIDTH = 6;
/** 두 판 사이 틈(유체 두께) h. 두 레인에 같다. */
export const GAP = 0.9;
/** 윗판 두께. */
export const PLATE_THICK = 0.1;
/** 붙박인 아랫판 두께. */
export const BASE_THICK = 0.14;
/** 윗판이 유체 양옆으로 비져나오는 길이. 판은 이 폭 안에서만 보인다. */
export const PLATE_OVERHANG = 0.15;
/** 레인 사이 간격(아래 레인 윗판 윗면 → 위 레인 아랫판 아랫면). */
export const LANE_SPACING = 0.5;
/** 윗판 위 눈금의 간격 · 높이. 판이 움직이는 것은 이 눈금이 흘러가는 것으로 보인다. */
export const PLATE_TICK = { spacing: 0.32, height: 0.09 } as const;
/** 염료 토막이 처음 서 있는 자리(유체 왼쪽 끝에서). */
export const DYE_X = 0.5;
/** 층마다 띄우는 흐름 점의 간격. */
export const DOT_SPACING = 0.46;

/**
 * 프레이밍 — 왼쪽은 레인 이름, 오른쪽은 힘 화살표와 그 이름, 아래는 캡션 줄.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.75, maxX: 8.55, minY: -0.78, maxY: 2.9 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const viscosityMessages = Object.freeze({
  'label.title': {
    ko: '점성',
    en: 'Viscosity',
    ja: '粘性',
    zh: '黏性',
    ar: 'اللزوجة',
    es: 'Viscosidad',
    fr: 'Viscosité',
    hi: 'श्यानता',
    id: 'Viskositas',
    pt: 'Viscosidade',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '층 사이의 마찰',
    en: 'Friction between layers',
    ja: '層と層の間の摩擦',
    zh: '层与层之间的摩擦',
    ar: 'الاحتكاك بين الطبقات',
    es: 'Rozamiento entre capas',
    fr: 'Frottement entre les couches',
    hi: 'परतों के बीच घर्षण',
    id: 'Gesekan antarlapisan',
    pt: 'Atrito entre camadas',
  },
  'label.stage': {
    ko: '두 판 사이',
    en: 'Between two plates',
    ja: '二枚の板の間',
    zh: '两块板之间',
    ar: 'بين لوحين',
    es: 'Entre dos placas',
    fr: 'Entre deux plaques',
    hi: 'दो प्लेटों के बीच',
    id: 'Di antara dua pelat',
    pt: 'Entre duas placas',
  },
  'label.view': {
    ko: '옆모습',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },

  /** 레인 이름. 두 유체를 가르는 것은 색이 아니라 이 이름이다. */
  'label.thin': {
    ko: '묽은 유체',
    en: 'Runny fluid',
    ja: 'さらさらした流体',
    zh: '稀的流体',
    ar: 'مائع رقيق القوام',
    es: 'Fluido poco espeso',
    fr: 'Fluide peu épais',
    hi: 'पतला तरल',
    id: 'Fluida encer',
    pt: 'Fluido ralo',
  },
  'label.thick': {
    ko: '끈적한 유체',
    en: 'Thick fluid',
    ja: 'どろどろした流体',
    zh: '黏稠的流体',
    ar: 'مائع كثيف القوام',
    es: 'Fluido espeso',
    fr: 'Fluide épais',
    hi: 'गाढ़ा तरल',
    id: 'Fluida kental',
    pt: 'Fluido espesso',
  },
  /** 점성 기호. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.viscosity': {
    ko: 'η',
    en: 'η',
    ja: 'η',
    zh: 'η',
    ar: 'η',
    es: 'η',
    fr: 'η',
    hi: 'η',
    id: 'η',
    pt: 'η',
  },
  'label.viscosityTimes': {
    ko: '{n}η',
    en: '{n}η',
    ja: '{n}η',
    zh: '{n}η',
    ar: '{n}η',
    es: '{n}η',
    fr: '{n}η',
    hi: '{n}η',
    id: '{n}η',
    pt: '{n}η',
  },
  /** 끄는 힘 기호 (C1 판정 3). */
  'label.force': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.forceTimes': {
    ko: '{n}F',
    en: '{n}F',
    ja: '{n}F',
    zh: '{n}F',
    ar: '{n}F',
    es: '{n}F',
    fr: '{n}F',
    hi: '{n}F',
    id: '{n}F',
    pt: '{n}F',
  },

  'caption.still': {
    ko: '두 판 사이에 유체가 차 있다. 아래 판은 붙박여 있고, 위 판은 아직 서 있다.',
    en: 'Fluid fills the gap between two plates. The bottom plate is fixed; the top plate has not moved yet.',
    ja: '二枚の板の間を流体が満たしている。下の板は固定され、上の板はまだ動いていない。',
    zh: '两块板之间充满了流体。下板固定不动，上板还没有移动。',
    ar: 'يملأ مائعٌ الفجوة بين لوحين. اللوح السفلي مثبّت، واللوح العلوي لم يتحرك بعد.',
    es: 'Un fluido llena el hueco entre dos placas. La placa inferior está fija; la superior aún no se ha movido.',
    fr: 'Un fluide remplit l’espace entre deux plaques. La plaque du bas est fixe ; celle du haut n’a pas encore bougé.',
    hi: 'दो प्लेटों के बीच की जगह में तरल भरा है। नीचे की प्लेट स्थिर है; ऊपर की प्लेट अभी हिली नहीं है।',
    id: 'Fluida mengisi celah di antara dua pelat. Pelat bawah terpasang tetap; pelat atas belum bergerak.',
    pt: 'Um fluido preenche o espaço entre duas placas. A placa de baixo está fixa; a de cima ainda não se moveu.',
  },
  'caption.drag': {
    ko: '위 판을 끌면 판에 닿은 층이 끌려가고, 그 층이 바로 아래 층을 끈다 — 아래로 갈수록 덜 끌린다.',
    en: 'Pulling the top plate drags the layer touching it, and that layer drags the one below — the lower the layer, the less it is dragged.',
    ja: '上の板を引くと、板に触れた層が引きずられ、その層がすぐ下の層を引きずる — 下の層ほど引きずられ方が小さい。',
    zh: '拉动上板时，与它接触的层被带动，这一层又带动下面的一层 — 越往下的层被带动得越少。',
    ar: 'سحبُ اللوح العلوي يجرّ الطبقة الملامسة له، وتلك الطبقة تجرّ التي تحتها — كلما انخفضت الطبقة قلّ انجرارها.',
    es: 'Al tirar de la placa superior, arrastra la capa que la toca, y esa capa arrastra a la de abajo — cuanto más baja la capa, menos se arrastra.',
    fr: 'Tirer la plaque du haut entraîne la couche qui la touche, et cette couche entraîne celle du dessous — plus la couche est basse, moins elle est entraînée.',
    hi: 'ऊपर की प्लेट खींचने पर उसे छूती परत खिंचती है, और वह परत अपने नीचे वाली परत को खींचती है — परत जितनी नीचे, उतनी कम खिंचती है।',
    id: 'Menarik pelat atas menyeret lapisan yang menyentuhnya, dan lapisan itu menyeret lapisan di bawahnya — makin rendah lapisannya, makin sedikit ia terseret.',
    pt: 'Puxar a placa de cima arrasta a camada que a toca, e essa camada arrasta a de baixo — quanto mais baixa a camada, menos ela é arrastada.',
  },
  'caption.compare': {
    ko: '두 유체의 층은 똑같이 끌려간다. 다른 것은 끄는 힘 — 점성이 {ratio}배인 쪽은 같은 빠르기로 끄는 데 힘이 {ratio}배 든다.',
    en: 'The layers of both fluids slide the same way. What differs is the pull — the fluid with {ratio}× the viscosity needs {ratio}× the force to move at the same speed.',
    ja: '二つの流体の層は同じように引きずられる。違うのは引く力 — 粘性が {ratio}× の流体は、同じ速さで動かすのに {ratio}× の力がいる。',
    zh: '两种流体的层以同样的方式滑动。不同的是拉力 — 黏性为 {ratio}× 的流体，要以同样的速率移动需要 {ratio}× 的力。',
    ar: 'تنزلق طبقات المائعين بالطريقة نفسها. ما يختلف هو قوة السحب — المائع ذو اللزوجة {ratio}× يحتاج إلى قوة {ratio}× ليتحرك بالسرعة نفسها.',
    es: 'Las capas de ambos fluidos se deslizan igual. Lo que cambia es el tirón — el fluido con {ratio}× la viscosidad necesita {ratio}× la fuerza para moverse con la misma rapidez.',
    fr: 'Les couches des deux fluides glissent de la même façon. Ce qui change, c’est la traction — le fluide {ratio}× plus visqueux demande une force {ratio}× plus grande pour avancer à la même vitesse.',
    hi: 'दोनों तरलों की परतें एक ही तरह खिसकती हैं। अलग है खिंचाव — {ratio}× श्यानता वाले तरल को उसी चाल से चलाने के लिए {ratio}× बल चाहिए।',
    id: 'Lapisan kedua fluida bergeser dengan cara yang sama. Yang berbeda adalah tarikannya — fluida dengan viskositas {ratio}× perlu gaya {ratio}× untuk bergerak dengan kelajuan yang sama.',
    pt: 'As camadas dos dois fluidos deslizam do mesmo jeito. O que muda é o puxão — o fluido com {ratio}× a viscosidade precisa de {ratio}× a força para se mover com a mesma velocidade.',
  },
} satisfies Record<string, LocalizedText>);

export type ViscosityMessageKey = keyof typeof viscosityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ViscosityMessageKey): LocalizedText => viscosityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ViscosityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const viscositySchema: BundleSchema = {
  id: VISCOSITY_ID,
  label: text('label.title'),
  category: 'fluids',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 자동 진행 한 번으로 「모양은 같고 힘만 다르다」 가 끝난다.
  parameters: [],
  stages: [
    {
      id: 'two-plates',
      label: text('label.stage'),
      constants: {
        plateSpeed: PLATE_SPEED,
        viscosityThin: VISCOSITY_THIN,
        viscosityRatio: VISCOSITY_RATIO,
        layerCount: LAYER_COUNT,
        forceScale: FORCE_SCALE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 레인 둘을 위아래로 쌓고 캡션 한 줄을 더한 높이. */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 쓴 순서대로 겹친다 — 유체 → 층 경계 → 흐름 점 → 염료 → 판 → 화살표 → 이름.
   * 층 순서로는 유체(`region`)가 점 · 염료 위에 덮인다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 윗판이 끌리고 있다 (S-piece). */
  startAt: 1.8,

  /**
   * 한 주기 9.2 초.
   *
   * - `still` — 판이 서 있다. 염료 토막이 곧은 한 줄이다.
   * - `drag` — 윗판을 일정한 빠르기로 끈다. 층마다 염료 토막이 제 빠르기로 흘러가
   *   계단이 된다. 끄는 힘 화살표가 나온다.
   * - `compare` — 끌기가 이어진다. 끈적한 쪽 화살표에 F 한 칸씩 눈금이 붙는다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'still', duration: 1.4, caption: key('caption.still') },
      { id: 'drag', duration: 3.6, caption: key('caption.drag') },
      { id: 'compare', duration: 3.6, caption: key('caption.compare') },
      { id: 'fade', duration: 0.6, caption: key('caption.compare') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -6] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { ratio: 'ratioText' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 재는 것은 화살표 길이의
  // 비이고, 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: viscosityMessages,
};
