// ========================================================================
// surface-tension — 선언
// ========================================================================
// 질문: 물보다 무거운 바늘이 어떻게 물 위에 떠 있는가.
//
// 바늘 단면 하나를 물 위에 살며시 놓는다. 수면이 오목하게 휘고, 막이 양쪽에서
// 수면을 따라 바늘을 당긴다. 당기는 힘 T 의 크기는 늘 같다 — 휘어진 만큼 방향이
// 위로 돌아설 뿐이다. 위에서 눌러 더 휘게 하면 T 가 더 위를 향해 더 받치고, 막이
// 곧추선 뒤로는 더 돌아설 방향이 없어 뚫린다.
//
// 곡률이 만드는 압력차(`laplace-pressure`) · 표면에 따른 접촉각(`wetting-and-contact-angle`)
// 은 뒤 조각의 몫이라 여기서 말하지 않는다. 이 조각은 「표면이 막처럼 당긴다」 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:surface-tension` 와 문자 그대로 일치한다 (C4). */
export const SURFACE_TENSION_ID = 'surface-tension';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 모세관 길이 lc 를 1 로 잰 단위, 힘은 단위 길이당 표면 장력 γ 를 1 로 잰 단위다.
// ------------------------------------------------------------------------

/** 표면 장력 γ — 막이 한쪽에서 당기는 힘(바늘 단위 길이당). 화살표 T 의 크기다. */
export const TENSION = 1;
/** 바늘의 무게(단위 길이당). γ 의 1.1 배 — 막 두 쪽이 33.4° 기울어 받친다(sin φ = mg/2γ). */
export const WEIGHT = 1.1;
/** 모세관 길이 lc = √(γ/ρg). 파인 수면이 얼마나 멀리까지 번지는지를 정한다. */
export const CAP_LENGTH = 1;
/** 바늘 단면 반지름(lc 단위). 실제 바늘보다 크게 그려 둘레가 읽히게 한다. */
export const NEEDLE_RADIUS = 0.4;
/** 내려놓기 시작할 때 바늘 밑면의 높이(수면 위, lc 단위). */
export const DROP_HEIGHT = 0.5;
/** 뚫린 뒤 바늘이 가라앉는 깊이(바늘 중심, 수면 아래). */
export const SINK_DEPTH = 2.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(lc)
// ------------------------------------------------------------------------

/** T 화살표 길이 = γ × 이 배율. F 화살표도 같은 배율이라 길이끼리 견줄 수 있다. */
export const FORCE_SCALE = 1.1;
/** 물의 가로 끝 · 바닥. 프레이밍보다 넓게 깔아 끝이 비치지 않게 한다. */
export const WATER_HALF_WIDTH = 6;
export const WATER_BOTTOM = -3.4;

/**
 * 프레이밍은 주장의 일부다. 세로는 누르는 힘 F 꼬리의 가장 높은 자리(약 1.5, 캡션 줄
 * 포함)부터 가라앉은 바늘 밑까지이고, 이것이 배율을 정한다. 가로는 파인 수면이 잦아드는
 * 곳까지 — 넓은 임베드에서는 그 너머 평평한 수면이 더 보일 뿐이다. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -2.6, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 시간표 길이 (초)
// ------------------------------------------------------------------------

export const DROP = 0.9;
export const SETTLE = 1.3;
export const HOLD = 3.2;
export const PRESS = 3.4;
export const LIMIT = 1.4;
export const SINK = 1.6;
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const surfaceTensionMessages = Object.freeze({
  'label.title': {
    ko: '표면 장력',
    en: 'Surface tension',
    ja: '表面張力',
    zh: '表面张力',
    ar: 'التوتر السطحي',
    es: 'Tensión superficial',
    fr: 'Tension superficielle',
    hi: 'पृष्ठ तनाव',
    id: 'Tegangan permukaan',
    pt: 'Tensão superficial',
  },
  'label.operation': {
    ko: '표면을 줄이려는 힘',
    en: 'The pull that shrinks a surface',
    ja: '表面を縮めようとする力',
    zh: '使表面收缩的拉力',
    ar: 'الشدّ الذي يقلّص السطح',
    es: 'El tirón que encoge una superficie',
    fr: 'La traction qui contracte une surface',
    hi: 'सतह को सिकोड़ने वाला खिंचाव',
    id: 'Tarikan yang menyusutkan permukaan',
    pt: 'A tração que encolhe uma superfície',
  },
  'label.stage': {
    ko: '물 위의 바늘',
    en: 'Needle on water',
    ja: '水面の針',
    zh: '水面上的针',
    ar: 'إبرة على الماء',
    es: 'Aguja sobre el agua',
    fr: 'Aiguille sur l’eau',
    hi: 'पानी पर सुई',
    id: 'Jarum di atas air',
    pt: 'Agulha sobre a água',
  },
  'label.view': {
    ko: '단면',
    en: 'Cross-section',
    ja: '断面',
    zh: '截面',
    ar: 'المقطع العرضي',
    es: 'Sección transversal',
    fr: 'Coupe',
    hi: 'अनुप्रस्थ काट',
    id: 'Penampang',
    pt: 'Corte transversal',
  },
  /** 화살표 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.tension': {
    ko: 'T',
    en: 'T',
    ja: 'T',
    zh: 'T',
    ar: 'T',
    es: 'T',
    fr: 'T',
    hi: 'T',
    id: 'T',
    pt: 'T',
  },
  'label.load': {
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
  'caption.drop': {
    ko: '바늘 하나를 물 위에 살며시 내려놓는다',
    en: 'A needle is laid gently on the water',
    ja: '針を1本、水面にそっと置く',
    zh: '把一根针轻轻放在水面上',
    ar: 'تُوضَع إبرة برفق على الماء',
    es: 'Se deposita suavemente una aguja sobre el agua',
    fr: 'On pose délicatement une aiguille sur l’eau',
    hi: 'एक सुई को धीरे से पानी पर रखा जाता है',
    id: 'Sebatang jarum diletakkan perlahan di atas air',
    pt: 'Uma agulha é pousada suavemente sobre a água',
  },
  'caption.settle': {
    ko: '수면이 오목하게 휘며 막처럼 바늘을 받쳐 든다',
    en: 'The surface dips and holds the needle up like a stretched sheet',
    ja: '水面がくぼみ、張った膜のように針を支える',
    zh: '水面向下凹陷，像绷紧的薄膜一样托住针',
    ar: 'ينخفض السطح ويحمل الإبرة كغشاء مشدود',
    es: 'La superficie se hunde y sostiene la aguja como una lámina tensa',
    fr: 'La surface se creuse et soutient l’aiguille comme une membrane tendue',
    hi: 'सतह नीचे धँसती है और तनी हुई झिल्ली की तरह सुई को थामे रखती है',
    id: 'Permukaan melekuk dan menahan jarum seperti lembaran yang teregang',
    pt: 'A superfície afunda e sustenta a agulha como uma película esticada',
  },
  'caption.hold': {
    ko: '막이 양쪽에서 수면을 따라 당긴다 — 위쪽 몫(점선) 둘을 합치면 누르는 힘 F 와 같다',
    en: 'The film pulls along the surface on both sides — its two upward parts (dashed) add up to the load F',
    ja: '膜は両側で水面に沿って引く — その上向きの成分(点線)2つを合わせると荷重 F になる',
    zh: '薄膜在两侧沿水面拉 — 两个向上的分量（虚线）加起来等于负载 F',
    ar: 'يشدّ الغشاء على امتداد السطح من الجانبين — مجموع جزأيه الصاعدين (المتقطّعين) يساوي الحِمل F',
    es: 'La película tira a lo largo de la superficie a ambos lados — sus dos partes hacia arriba (discontinuas) suman la carga F',
    fr: 'Le film tire le long de la surface des deux côtés — ses deux parts vers le haut (en pointillés) font ensemble la charge F',
    hi: 'झिल्ली दोनों ओर सतह के साथ खींचती है — इसके ऊपर की ओर वाले दो भाग (टूटी रेखा) मिलकर भार F के बराबर होते हैं',
    id: 'Lapisan menarik sepanjang permukaan di kedua sisi — dua bagian ke atasnya (putus-putus) berjumlah sama dengan beban F',
    pt: 'A película puxa ao longo da superfície dos dois lados — suas duas partes para cima (tracejadas) somam a carga F',
  },
  'caption.press': {
    ko: '위에서 누를수록 더 휜다 — T 의 크기는 그대로, 방향만 위로 돌아선다',
    en: 'Press harder and it dips deeper — T keeps its size and only turns upward',
    ja: '強く押すほど深くくぼむ — T の大きさは変わらず、向きだけが上へ回る',
    zh: '压得越用力，凹得越深 — T 的大小不变，只是方向向上转',
    ar: 'اضغط أكثر فينخفض أعمق — يحتفظ T بمقداره ويستدير نحو الأعلى فقط',
    es: 'Presiona más y se hunde más — T conserva su tamaño y solo gira hacia arriba',
    fr: 'Appuyez plus fort et elle se creuse davantage — T garde sa taille et ne fait que se redresser',
    hi: 'और ज़ोर से दबाएँ तो यह और गहरा धँसता है — T का परिमाण वही रहता है, केवल वह ऊपर की ओर मुड़ता है',
    id: 'Tekan lebih kuat dan permukaan melekuk lebih dalam — besar T tetap, hanya arahnya berputar ke atas',
    pt: 'Pressione mais e ela afunda mais — T mantém o tamanho e só gira para cima',
  },
  'caption.limit': {
    ko: '막이 곧추섰다 — T 가 모두 위를 향해 이보다 더 받칠 수 없다',
    en: 'The film stands upright — T points straight up and cannot hold any more',
    ja: '膜が垂直に立った — T は真上を向き、これ以上は支えられない',
    zh: '薄膜竖直了 — T 指向正上方，再也托不住更多',
    ar: 'انتصب الغشاء — يشير T إلى الأعلى مباشرة ولا يستطيع حمل المزيد',
    es: 'La película queda vertical — T apunta hacia arriba y no puede sostener más',
    fr: 'Le film se dresse à la verticale — T pointe droit vers le haut et ne peut plus soutenir davantage',
    hi: 'झिल्ली सीधी खड़ी हो गई — T ठीक ऊपर की ओर है और इससे अधिक नहीं थाम सकता',
    id: 'Lapisan berdiri tegak — T menunjuk lurus ke atas dan tak mampu menahan lebih lagi',
    pt: 'A película fica na vertical — T aponta direto para cima e não aguenta mais',
  },
  'caption.sink': {
    ko: '더 돌아설 방향이 없다 — 막이 뚫리고 바늘이 가라앉는다',
    en: 'There is no further to turn — the film gives way and the needle sinks',
    ja: 'もう回る余地がない — 膜が破れ、針が沈む',
    zh: '已无可再转 — 薄膜破开，针沉了下去',
    ar: 'لم يعد هناك مجال للدوران — ينفتق الغشاء وتغرق الإبرة',
    es: 'Ya no puede girar más — la película cede y la aguja se hunde',
    fr: 'Impossible de tourner davantage — le film cède et l’aiguille coule',
    hi: 'अब और मुड़ने की जगह नहीं — झिल्ली टूट जाती है और सुई डूब जाती है',
    id: 'Tak ada lagi arah untuk berputar — lapisan jebol dan jarum tenggelam',
    pt: 'Não há mais para onde girar — a película cede e a agulha afunda',
  },
} satisfies Record<string, LocalizedText>);

export type SurfaceTensionMessageKey = keyof typeof surfaceTensionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SurfaceTensionMessageKey): LocalizedText => surfaceTensionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SurfaceTensionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const surfaceTensionSchema: BundleSchema = {
  id: SURFACE_TENSION_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 놓이고, 받쳐지고, 눌리고, 뚫린다. 아무것도 누르지 않아도 끝난다.
  parameters: [],

  stages: [
    {
      id: 'needle-on-water',
      label: text('label.stage'),
      constants: {
        tension: TENSION,
        weight: WEIGHT,
        capLength: CAP_LENGTH,
        needleRadius: NEEDLE_RADIUS,
        dropHeight: DROP_HEIGHT,
        sinkDepth: SINK_DEPTH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'section', label: text('label.view'), default: true }],

  /** 세로 4.65 를 담는다. 세로가 배율을 정하는 그림이라 기본(360)보다 조금 높인다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 가라앉은 바늘은 **물 아래** 로 비쳐야 「잠겼다」 로 읽히고,
   * 수면 막 선은 물 면 **위** 로 그어져야 막으로 읽힌다. 층 순서로는 궤적(20)이 물(45)
   * 아래로 깔려 막 선이 반쯤 묻힌다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 내려놓음 → 받쳐짐 → 읽기 → 누름 → 곧추섬 → 뚫림 → 흐려짐.
   *
   * 누름은 `smooth` 로 끝을 늦춘다 — 곧추서기 직전 각이 가장 빨리 변하는데(asin),
   * 그 순간이 이 조각이 보여야 하는 자리다.
   */
  timeline: {
    phases: [
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'settle', duration: SETTLE, ease: 'smooth', caption: key('caption.settle') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'press', duration: PRESS, ease: 'smooth', caption: key('caption.press') },
      { id: 'limit', duration: LIMIT, caption: key('caption.limit') },
      { id: 'sink', duration: SINK, ease: 'smooth', caption: key('caption.sink') },
      { id: 'fade', duration: FADE, caption: key('caption.sink') },
    ],
  },

  /** 도착한 순간 바늘이 이미 수면을 향해 내려오는 중이다. 0 이면 멈춘 바늘이 먼저 보인다. */
  startAt: 0.35,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  // 아래는 물이 덮고 가운데 위로는 누르는 힘 F 가 서므로 왼쪽 위에 둔다.
  caption: {
    anchor: { screen: 'top-left', offset: [12, 10] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 300,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **방향**(T 가 얼마나 위로
   * 돌았나)과 길이 비(점선 둘 = F)라 거리 격자는 다른 질문을 부른다.
   */

  messages: surfaceTensionMessages,
};
