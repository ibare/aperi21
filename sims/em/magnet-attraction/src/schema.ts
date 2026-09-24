// ========================================================================
// magnet-attraction — 선언
// ========================================================================
// 질문: 자석은 아무것이나 당기는가.
//
// 책상 위에 여러 물건이 한 줄로 놓여 있다 — 나무 조각 · 쇠못 · 구리선 · 플라스틱 뚜껑 ·
// 클립 · 알루미늄 조각. 그 바로 위로 막대자석을 왼쪽에서 오른쪽으로 지나가게 하면
// **쇠붙이(쇠못 · 클립)만 튀어 올라 자석에 붙어 딸려 가고**, 구리 · 알루미늄 · 나무 ·
// 플라스틱은 자석이 바로 위를 지나가도 꿈쩍하지 않는다. 금속이라고 다 붙는 것이 아니다.
//
// 자성체의 미시 원리(자기 구역)는 이 조각의 몫이 아니다 — `magnetic-materials` 가 한다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnet-attraction` 와 문자 그대로 일치한다 (C4). */
export const MAGNET_ATTRACTION_ID = 'magnet-attraction';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 막대자석의 길이 · 폭(월드). N 끝이 오른쪽(+x) — 지나가는 쪽을 앞장선다. */
export const MAGNET_LENGTH = 2.4;
export const MAGNET_WIDTH = 0.5;
/** 자석 가운데의 높이(월드). 책상 면이 y = 0 이다. */
export const MAGNET_HEIGHT = 1.5;
/** 자석이 지나가는 구간 — 가운데 x 의 처음 · 끝(월드). */
export const SWEEP_FROM = -4.3;
export const SWEEP_TO = 3.6;
/**
 * 끌림이 닿는 거리(월드). 쇠붙이는 자석이 붙을 자리가 자기 위로 이만큼 다가왔을 때
 * 책상을 떠나기 시작해, 그 자리가 바로 위에 왔을 때 붙는다. 자석의 세기와 물건의 무게를
 * 한 수로 묶은 값이다 — 화면에 수로 띄우지 않는다.
 */
export const PULL_REACH = 0.45;
/** 물건 줄 — 첫 자리의 x 와 자리 간격(월드). */
export const ROW_START = -2.75;
export const ROW_GAP = 1.1;

/**
 * 물건 목록. 종류마다 줄 안의 자리(0 부터)와 자석이 당기는지(1 · 0).
 * 스테이지 상수가 수 하나씩뿐이라 종류마다 두 이름으로 흩었다 (장부 G105).
 * 모양 · 치수 표는 `physics.ts` 의 `ITEM_KINDS` 에 남는다.
 */
export const WOOD_SLOT = 0;
export const NAIL_SLOT = 1;
export const COPPER_SLOT = 2;
export const PLASTIC_SLOT = 3;
export const CLIP_SLOT = 4;
export const ALUMINUM_SLOT = 5;
export const WOOD_ATTRACTED = 0;
export const NAIL_ATTRACTED = 1;
export const COPPER_ATTRACTED = 0;
export const PLASTIC_ATTRACTED = 0;
export const CLIP_ATTRACTED = 1;
export const ALUMINUM_ATTRACTED = 0;

/**
 * 프레이밍은 주장의 일부다. 처음 자리의 자석 왼쪽 끝부터 끝 자리 자석 앞 끝에 붙은
 * 클립까지, 위는 자석 윗면, 아래는 물건 이름표와 캡션 줄 (원칙 6 · S-piece · G24).
 */
export const SCENE_BOUNDS = { minX: -5.6, maxX: 5.65, minY: -1.05, maxY: 1.85 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 물건과 자석이 나타나는 동안. */
export const APPEAR = 0.6;
/** 줄을 읽는 동안 — 자석은 왼쪽에서 기다린다. */
export const SHOW = 1.6;
/** 자석이 줄 위를 지나가는 동안. */
export const SWEEP = 4.6;
/** 결과를 읽는 동안. */
export const HOLD = 3;
/** 자석과 물건이 흐려지며 다음 주기로 넘어가는 동안. */
export const CLEAR = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magnetAttractionMessages = Object.freeze({
  'label.title': {
    ko: '자석에 붙는 것',
    en: 'What sticks to a magnet',
    ja: '磁石につくもの',
    zh: '能被磁铁吸住的东西',
    ar: 'ما يلتصق بالمغناطيس',
    es: 'Lo que se pega a un imán',
    fr: 'Ce qui colle à un aimant',
    hi: 'चुंबक से क्या चिपकता है',
    id: 'Yang menempel pada magnet',
    pt: 'O que gruda em um ímã',
  },
  'label.operation': {
    ko: '자석이 당기는 물체와 당기지 않는 물체',
    en: 'Things a magnet pulls and things it does not',
    ja: '磁石が引きつけるものと引きつけないもの',
    zh: '磁铁吸引的物体与不吸引的物体',
    ar: 'أشياء يجذبها المغناطيس وأشياء لا يجذبها',
    es: 'Cosas que un imán atrae y cosas que no',
    fr: 'Ce qu’un aimant attire et ce qu’il n’attire pas',
    hi: 'वे चीज़ें जिन्हें चुंबक खींचता है और जिन्हें नहीं',
    id: 'Benda yang ditarik magnet dan yang tidak',
    pt: 'Coisas que um ímã atrai e coisas que não',
  },
  'label.stage': {
    ko: '책상 위 물건 한 줄',
    en: 'A row of things on a desk',
    ja: '机の上に並んだ物',
    zh: '桌上的一排物品',
    ar: 'صف من الأشياء على مكتب',
    es: 'Una fila de objetos sobre un escritorio',
    fr: 'Une rangée d’objets sur un bureau',
    hi: 'मेज़ पर रखी चीज़ों की एक पंक्ति',
    id: 'Sederet benda di atas meja',
    pt: 'Uma fileira de objetos sobre uma mesa',
  },
  'label.view': {
    ko: '옆에서 본 책상',
    en: 'Desk seen from the side',
    ja: '横から見た机',
    zh: '从侧面看桌子',
    ar: 'المكتب من الجانب',
    es: 'El escritorio visto de lado',
    fr: 'Le bureau vu de côté',
    hi: 'बगल से दिखती मेज़',
    id: 'Meja dilihat dari samping',
    pt: 'A mesa vista de lado',
  },
  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
  'mark.north': {
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
  'mark.south': {
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
  'item.wood': {
    ko: '나무 조각',
    en: 'wood block',
    ja: '木片',
    zh: '木块',
    ar: 'قطعة خشب',
    es: 'bloque de madera',
    fr: 'bloc de bois',
    hi: 'लकड़ी का टुकड़ा',
    id: 'balok kayu',
    pt: 'bloco de madeira',
  },
  'item.nail': {
    ko: '쇠못',
    en: 'iron nail',
    ja: '鉄くぎ',
    zh: '铁钉',
    ar: 'مسمار حديدي',
    es: 'clavo de hierro',
    fr: 'clou en fer',
    hi: 'लोहे की कील',
    id: 'paku besi',
    pt: 'prego de ferro',
  },
  'item.copper': {
    ko: '구리선',
    en: 'copper wire',
    ja: '銅線',
    zh: '铜线',
    ar: 'سلك نحاسي',
    es: 'alambre de cobre',
    fr: 'fil de cuivre',
    hi: 'ताँबे का तार',
    id: 'kawat tembaga',
    pt: 'fio de cobre',
  },
  'item.plastic': {
    ko: '플라스틱 뚜껑',
    en: 'plastic cap',
    ja: 'プラスチックのふた',
    zh: '塑料盖',
    ar: 'غطاء بلاستيكي',
    es: 'tapa de plástico',
    fr: 'bouchon en plastique',
    hi: 'प्लास्टिक का ढक्कन',
    id: 'tutup plastik',
    pt: 'tampa de plástico',
  },
  'item.clip': {
    ko: '클립',
    en: 'paper clip',
    ja: 'クリップ',
    zh: '回形针',
    ar: 'مشبك ورق',
    es: 'clip',
    fr: 'trombone',
    hi: 'पेपर क्लिप',
    id: 'penjepit kertas',
    pt: 'clipe',
  },
  'item.aluminum': {
    ko: '알루미늄 조각',
    en: 'aluminium foil',
    ja: 'アルミホイル',
    zh: '铝箔',
    ar: 'رقاقة ألومنيوم',
    es: 'papel de aluminio',
    fr: 'papier d’aluminium',
    hi: 'एल्युमिनियम पन्नी',
    id: 'foil aluminium',
    pt: 'papel-alumínio',
  },
  'caption.intro': {
    ko: '책상 위에 여러 물건이 한 줄로 놓여 있다',
    en: 'A row of different things lies on a desk',
    ja: '机の上にいろいろな物が一列に並んでいる',
    zh: '桌上一排放着各种不同的物品',
    ar: 'صف من أشياء مختلفة موضوع على مكتب',
    es: 'Una fila de objetos distintos descansa sobre un escritorio',
    fr: 'Une rangée d’objets différents est posée sur un bureau',
    hi: 'मेज़ पर तरह-तरह की चीज़ें एक पंक्ति में रखी हैं',
    id: 'Sederet benda yang berbeda-beda terletak di atas meja',
    pt: 'Uma fileira de objetos diferentes está sobre uma mesa',
  },
  'caption.sweep': {
    ko: '자석이 물건들 바로 위를 지나간다',
    en: 'A magnet passes just above them',
    ja: '磁石がそのすぐ上を通り過ぎる',
    zh: '磁铁从它们正上方经过',
    ar: 'يمر مغناطيس فوقها مباشرة',
    es: 'Un imán pasa justo por encima de ellos',
    fr: 'Un aimant passe juste au-dessus',
    hi: 'एक चुंबक उनके ठीक ऊपर से गुज़रता है',
    id: 'Sebuah magnet lewat tepat di atasnya',
    pt: 'Um ímã passa logo acima deles',
  },
  'caption.result': {
    ko: '붙은 것만 자석에 딸려 가고, 나머지는 자석이 바로 위를 지나가도 그대로다',
    en: 'Only what stuck rode along with the magnet — the rest stayed put though it passed right overhead',
    ja: 'くっついたものだけが磁石についていく — ほかは磁石が真上を通ってもそのままだ',
    zh: '只有被吸住的东西跟着磁铁走了 — 其余的即使磁铁从正上方经过也纹丝不动',
    ar: 'لم يرافق المغناطيس إلا ما التصق به — وبقي الباقي في مكانه مع أنه مرّ فوقه مباشرة',
    es: 'Solo lo que se pegó se fue con el imán — lo demás se quedó quieto aunque pasó justo por encima',
    fr: 'Seul ce qui a collé est parti avec l’aimant — le reste n’a pas bougé, même s’il est passé juste au-dessus',
    hi: 'केवल जो चिपका वही चुंबक के साथ चला गया — बाकी चीज़ें अपनी जगह रहीं, भले चुंबक ठीक ऊपर से गुज़रा',
    id: 'Hanya yang menempel ikut terbawa magnet — sisanya tetap diam meski magnet lewat tepat di atasnya',
    pt: 'Só o que grudou foi junto com o ímã — o resto ficou parado, embora ele tenha passado bem por cima',
  },
} satisfies Record<string, LocalizedText>);

export type MagnetAttractionMessageKey = keyof typeof magnetAttractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagnetAttractionMessageKey): LocalizedText => magnetAttractionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagnetAttractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magnetAttractionSchema: BundleSchema = {
  id: MAGNET_ATTRACTION_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 자석이 줄 위를 지나가는 것을 시간표가 보여 준다.
  parameters: [],

  stages: [
    {
      id: 'desk-row',
      label: text('label.stage'),
      constants: {
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        magnetHeight: MAGNET_HEIGHT,
        sweepFrom: SWEEP_FROM,
        sweepTo: SWEEP_TO,
        pullReach: PULL_REACH,
        rowStart: ROW_START,
        rowGap: ROW_GAP,
        woodSlot: WOOD_SLOT,
        nailSlot: NAIL_SLOT,
        copperSlot: COPPER_SLOT,
        plasticSlot: PLASTIC_SLOT,
        clipSlot: CLIP_SLOT,
        aluminumSlot: ALUMINUM_SLOT,
        woodAttracted: WOOD_ATTRACTED,
        nailAttracted: NAIL_ATTRACTED,
        copperAttracted: COPPER_ATTRACTED,
        plasticAttracted: PLASTIC_ATTRACTED,
        clipAttracted: CLIP_ATTRACTED,
        aluminumAttracted: ALUMINUM_ATTRACTED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /**
   * 가로로 긴 책상 한 줄. 자석이 줄 끝에서 끝까지 지나가므로 세로를 더 주어도 가로가
   * 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 270, minHeight: 250 },

  /**
   * 한 주기 = 나타남 → 줄을 읽음 → 자석이 지나감 → 결과 → 흐려짐.
   *
   * 쇠붙이가 튀어 오르는 시각은 단계로 가르지 않는다 — 자석이 그 물건 위에 다가온
   * 자리가 정한다(physics.pullProgress). 시간표는 자석이 언제 지나가는지만 정한다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.intro') },
      { id: 'show', duration: SHOW, caption: key('caption.intro') },
      { id: 'sweep', duration: SWEEP, caption: key('caption.sweep') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 물건 줄과 자석이 이미 놓여 있고 자석이 곧 출발하는
   * 자리에서 연다.
   */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 까닭은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 붙느냐 마느냐다. */

  messages: magnetAttractionMessages,
};
