// ========================================================================
// light-through-materials — 선언
// ========================================================================
// 질문: 같은 빛이 재료에 닿으면 무엇이 달라지는가.
//
// 어두운 방에 똑같은 램프 셋이 똑같은 평행 줄기를 아래 스크린으로 쏜다. 처음에는
// 스크린에 똑같은 밝은 자리 셋이 있다. 옆에 있던 판 셋(유리 · 간유리 · 나무판)이
// 줄기 안으로 미끄러져 들어가면, 유리 뒤는 줄기가 곧게 지나 밝은 자리가 그대로 또렷하고,
// 간유리 뒤는 줄기가 흩어져 넓고 흐린 빛이 되며, 나무판 뒤는 줄기가 끊겨 그림자가 된다.
// 판을 빼면 셋이 다시 같아진다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:light-through-materials` 와 문자 그대로 일치한다 (C4). */
export const LIGHT_THROUGH_MATERIALS_ID = 'light-through-materials';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 램프 줄기의 세기(0~1, 흰빛). 스크린의 밝은 자리 · 줄기의 밝기가 모두 이것에 비례한다. */
export const BEAM_INTENSITY = 1;
/** 유리 · 간유리 · 나무판이 줄기를 통과시키는 몫(투과율). */
export const TRANSMIT_GLASS = 0.92;
export const TRANSMIT_FROSTED = 0.8;
export const TRANSMIT_WOOD = 0;
/** 간유리를 지난 빛이 흩어지는 각의 폭(표준편차, 라디안)과 그 상한(라디안). */
export const SCATTER_SPREAD = 0.45;
export const SCATTER_MAX = 0.8;
/** 흩어짐 줄기 방향을 뽑는 시드 — 같은 시드는 언제나 같은 줄기다. */
export const SEED = 21;
/**
 * 그려 보이는 흩어진 줄기 하나의 밝기 몫(줄기 세기 × 투과율에 곱한다). 실제로는 한 줄기의
 * 빛이 무수한 방향으로 나뉘어 한 가닥은 훨씬 어둡다 — 그려 보이는 몇 가닥이 보이도록 올린 표시 배율이다.
 */
export const SCATTER_RAY_SHARE = 0.45;
/**
 * 판의 겉모습 — 빛 세기(무채색) · 채움 불투명도. 판은 빛이 아니라 색을 짓지 않고 세기와 채움으로 가른다:
 * 유리는 옅게 비치고(채움 옅음 · 테만 또렷), 간유리는 뿌옇고(밝은 회색 · 채움 짙음), 나무판은 막혔다(어두운 회색 · 꽉 참).
 */
export const GLASS_LOOK = 0.55;
export const GLASS_FILL = 0.15;
export const FROSTED_LOOK = 0.6;
export const FROSTED_FILL = 0.8;
export const WOOD_LOOK = 0.1;
export const WOOD_FILL = 1;

// ------------------------------------------------------------------------
// 배치 — 월드. y 위.
// ------------------------------------------------------------------------

/** 줄기 셋의 가운데 x — 왼쪽부터 유리 · 간유리 · 나무판 자리. */
export const COLUMN_X = [-3.5, -0.2, 3.1] as const;
/** 줄기 폭의 절반과 한 줄기를 긋는 선 수. */
export const BEAM_HALF = 0.5;
export const BEAM_LINES = 9;

/** 램프 — 아래 · 위 가장자리 y 와 줄기 폭 밖으로 넓힌 거리. */
export const LAMP_Y0 = 1.42;
export const LAMP_Y1 = 1.6;
export const LAMP_PAD = 0.12;

/** 판 — 가운데 y · 두께 절반 · 폭 절반. 판이 줄기 밖에서 쉬는 자리까지 가운데를 옮긴 거리. */
export const PLATE_Y = 0.15;
export const PLATE_HALF_T = 0.1;
export const PLATE_HALF_W = 0.75;
export const PLATE_REST_SHIFT = 1.45;

/** 스크린 — 아래 · 위 가장자리 y. 가로로 방 폭 전체에 놓인다. */
export const SCREEN_Y0 = -1.82;
export const SCREEN_Y1 = -1.56;

/** 어두운 방 — 빛 없음으로 칠한다. 재료 이름표와 캡션은 방 밖(테마 바탕)에 둔다. */
export const ROOM = { minX: -4.45, maxX: 5.5, minY: -2.0, maxY: 1.78 } as const;

/** 재료 이름표 y — 방 아래. */
export const LABEL_Y = -2.3;

/**
 * 프레이밍은 주장의 일부다. 방 전체 + 아래 이름표 줄 + 캡션 줄. 판이 쉬는 자리까지 들어간다.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.55, maxX: 5.6, minY: -3.05, maxY: 1.88 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 판 없이 비추는 동안 · 판을 넣는 동안 · 판이 줄기를 가린 동안 · 판을 빼는 동안(초). */
export const BARE = 3;
export const SLIDE_IN = 1.4;
export const COVERED = 5;
export const SLIDE_OUT = 1.2;
/** 도착한 순간 이미 스크린이 밝다 — 판 없는 단계 안에서 연다. */
export const START_AT = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lightThroughMaterialsMessages = Object.freeze({
  'label.title': {
    ko: '빛과 재료',
    en: 'Light and materials',
    ja: '光と素材',
    zh: '光与材料',
    ar: 'الضوء والمواد',
    es: 'La luz y los materiales',
    fr: 'La lumière et les matériaux',
    hi: 'प्रकाश और पदार्थ',
    id: 'Cahaya dan bahan',
    pt: 'A luz e os materiais',
  },
  'label.operation': {
    ko: '재료에 따라 갈리는 빛의 통과',
    en: 'How light gets through depends on the material',
    ja: '素材によって変わる光の通り方',
    zh: '光的透过取决于材料',
    ar: 'نفاذ الضوء يتوقف على المادة',
    es: 'Cómo pasa la luz depende del material',
    fr: 'Le passage de la lumière dépend du matériau',
    hi: 'प्रकाश का पार जाना पदार्थ पर निर्भर करता है',
    id: 'Cara cahaya menembus bergantung pada bahannya',
    pt: 'Como a luz atravessa depende do material',
  },
  'label.stage': {
    ko: '세 판',
    en: 'Three boards',
    ja: '三枚の板',
    zh: '三块板',
    ar: 'ثلاثة ألواح',
    es: 'Tres placas',
    fr: 'Trois plaques',
    hi: 'तीन प्लेटें',
    id: 'Tiga papan',
    pt: 'Três placas',
  },
  'label.view': {
    ko: '램프 · 판 · 스크린',
    en: 'Lamps, boards, screen',
    ja: 'ランプ・板・スクリーン',
    zh: '灯、板、屏幕',
    ar: 'المصابيح والألواح والشاشة',
    es: 'Lámparas, placas, pantalla',
    fr: 'Lampes, plaques, écran',
    hi: 'लैंप, प्लेटें, पर्दा',
    id: 'Lampu, papan, layar',
    pt: 'Lâmpadas, placas, tela',
  },
  'label.glass': {
    ko: '유리',
    en: 'Glass',
    ja: 'ガラス',
    zh: '玻璃',
    ar: 'زجاج',
    es: 'Vidrio',
    fr: 'Verre',
    hi: 'काँच',
    id: 'Kaca',
    pt: 'Vidro',
  },
  'label.frosted': {
    ko: '간유리',
    en: 'Frosted glass',
    ja: 'すりガラス',
    zh: '毛玻璃',
    ar: 'زجاج مصنفر',
    es: 'Vidrio esmerilado',
    fr: 'Verre dépoli',
    hi: 'घिसा काँच',
    id: 'Kaca buram',
    pt: 'Vidro fosco',
  },
  'label.wood': {
    ko: '나무판',
    en: 'Wood',
    ja: '木の板',
    zh: '木板',
    ar: 'خشب',
    es: 'Madera',
    fr: 'Bois',
    hi: 'लकड़ी',
    id: 'Kayu',
    pt: 'Madeira',
  },
  'caption.bare': {
    ko: '같은 빛 줄기 셋이 스크린에 똑같은 밝은 자리를 남긴다',
    en: 'Three identical beams leave three identical bright patches on the screen',
    ja: '同じ三本の光線がスクリーンに同じ明るい部分を三つ残す',
    zh: '三束相同的光在屏幕上留下三块相同的亮斑',
    ar: 'ثلاث حزم متماثلة تترك ثلاث بقع مضيئة متماثلة على الشاشة',
    es: 'Tres haces idénticos dejan tres manchas brillantes idénticas en la pantalla',
    fr: 'Trois faisceaux identiques laissent trois taches lumineuses identiques sur l’écran',
    hi: 'तीन एक-जैसे किरण-पुंज पर्दे पर तीन एक-जैसे चमकीले धब्बे छोड़ते हैं',
    id: 'Tiga berkas yang sama meninggalkan tiga bercak terang yang sama di layar',
    pt: 'Três feixes idênticos deixam três manchas claras idênticas na tela',
  },
  'caption.slideIn': {
    ko: '세 판을 빛 앞에 넣는다',
    en: 'Three boards slide into the light',
    ja: '三枚の板が光の前に入る',
    zh: '三块板滑入光路',
    ar: 'تنزلق الألواح الثلاثة إلى مسار الضوء',
    es: 'Las tres placas se deslizan hacia la luz',
    fr: 'Les trois plaques glissent dans la lumière',
    hi: 'तीनों प्लेटें प्रकाश के आगे खिसकती हैं',
    id: 'Tiga papan digeser ke depan cahaya',
    pt: 'As três placas deslizam para a frente da luz',
  },
  'caption.covered': {
    ko: '유리 뒤에는 또렷한 밝은 자리, 간유리 뒤에는 넓고 흐린 빛, 나무판 뒤에는 그림자가 남는다',
    en: 'Behind the glass a sharp bright patch, behind the frosted glass a wide dim glow, behind the wood a shadow',
    ja: 'ガラスの後ろにはくっきりした明るい部分、すりガラスの後ろには広くぼんやりした光、木の板の後ろには影',
    zh: '玻璃后是清晰的亮斑，毛玻璃后是宽而暗淡的光，木板后是影子',
    ar: 'خلف الزجاج بقعة مضيئة واضحة، وخلف الزجاج المصنفر وهج واسع خافت، وخلف الخشب ظل',
    es: 'Tras el vidrio, una mancha brillante nítida; tras el vidrio esmerilado, un resplandor amplio y tenue; tras la madera, una sombra',
    fr: 'Derrière le verre, une tache lumineuse nette ; derrière le verre dépoli, une lueur large et faible ; derrière le bois, une ombre',
    hi: 'काँच के पीछे एक स्पष्ट चमकीला धब्बा, घिसे काँच के पीछे एक चौड़ी धुँधली चमक, लकड़ी के पीछे एक छाया',
    id: 'Di balik kaca bercak terang yang tajam, di balik kaca buram cahaya lebar yang redup, di balik kayu bayangan',
    pt: 'Atrás do vidro, uma mancha clara nítida; atrás do vidro fosco, um brilho largo e fraco; atrás da madeira, uma sombra',
  },
  'caption.slideOut': {
    ko: '판을 뺀다',
    en: 'The boards slide out',
    ja: '板が抜ける',
    zh: '板滑出',
    ar: 'تنزلق الألواح خارجًا',
    es: 'Las placas se retiran',
    fr: 'Les plaques se retirent',
    hi: 'प्लेटें बाहर खिसकती हैं',
    id: 'Papan-papan digeser keluar',
    pt: 'As placas deslizam para fora',
  },
} satisfies Record<string, LocalizedText>);

export type LightThroughMaterialsMessageKey = keyof typeof lightThroughMaterialsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LightThroughMaterialsMessageKey): LocalizedText => lightThroughMaterialsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LightThroughMaterialsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lightThroughMaterialsSchema: BundleSchema = {
  id: LIGHT_THROUGH_MATERIALS_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 판이 들어가고, 갈리고, 다시 빠진다.
  parameters: [],

  stages: [
    {
      id: 'three-boards',
      label: text('label.stage'),
      constants: {
        beamIntensity: BEAM_INTENSITY,
        transmitGlass: TRANSMIT_GLASS,
        transmitFrosted: TRANSMIT_FROSTED,
        transmitWood: TRANSMIT_WOOD,
        scatterSpread: SCATTER_SPREAD,
        scatterMax: SCATTER_MAX,
        seed: SEED,
        scatterRayShare: SCATTER_RAY_SHARE,
        glassLook: GLASS_LOOK,
        glassFill: GLASS_FILL,
        frostedLook: FROSTED_LOOK,
        frostedFill: FROSTED_FILL,
        woodLook: WOOD_LOOK,
        woodFill: WOOD_FILL,
      },
    },
  ],

  environments: [],

  views: [{ id: 'room', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 세 줄기를 나란히 둔다 (S-piece — 세로가 비싸다). */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 빛 없음 방을 먼저 깔고, 스크린 → 줄기 → 판 순서로 얹는다.
   * 층 순서로는 `region`(방)이 줄기 위로 올라와 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 판 없음 → 판 넣기 → 가림 → 판 빼기. 넣고 빼는 동안 판이 `smooth` 로
   * 미끄러지고, 가려진 줄만 재료에 따라 갈린다.
   */
  timeline: {
    phases: [
      { id: 'bare', duration: BARE, caption: key('caption.bare') },
      { id: 'slide-in', duration: SLIDE_IN, ease: 'smooth', caption: key('caption.slideIn') },
      { id: 'covered', duration: COVERED, caption: key('caption.covered') },
      { id: 'slide-out', duration: SLIDE_OUT, ease: 'smooth', caption: key('caption.slideOut') },
    ],
  },

  startAt: START_AT,

  // 슬롯 하나. 방 아래 테마 바탕 위에 둔다 — 빛 없음 방 위에서는 라이트 테마의 먹색 글자가 묻힌다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -8] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 680,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 거리가 없다.

  messages: lightThroughMaterialsMessages,
};
