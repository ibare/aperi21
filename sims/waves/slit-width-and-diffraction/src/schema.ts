// ========================================================================
// slit-width-and-diffraction — 선언
// ========================================================================
// 질문: 틈을 지난 물결이 얼마나 퍼지는지는 무엇이 정할까?
//
// 동사: **폭이 파장만 해지면 크게 퍼진다.** 칸막이로 나눈 두 수조에 같은 곧은 물결이 들어간다.
// 위 수조의 틈은 파장의 5 배, 아래 수조의 틈은 파장만 하다. 위에서는 물결이 틈 폭의 줄기로
// 거의 곧게 지나가 벽 뒤에 그늘이 남고, 아래에서는 반원으로 번져 벽 바로 뒤까지 찬다.
// 두 물결 장은 틈 위 여러 점이 낸 파의 실제 합이다 — 퍼짐을 그려 넣은 것이 아니라 계산이 정한다.
//
// 두지 않은 것: 한 틈 뒤로 돌아 들어가는 모습 하나만 보는 화면(diffraction 몫) · 하위헌스 작은 파원
// 작도(huygens-principle 몫) · 첫 어두운 방향 표시선 · 회절각 수치 · 세기 그래프 · 조작기.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:slit-width-and-diffraction` 와 문자 그대로 일치한다 (C4). */
export const SLIT_WIDTH_AND_DIFFRACTION_ID = 'slit-width-and-diffraction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 파장(월드). 두 수조가 같은 물결을 받는다. */
export const WAVELENGTH = 14;
/** 물결의 속력(월드/초). */
export const WAVE_SPEED = 90;
/** 위 수조 틈 폭 = 파장 × 이 값. 파장보다 훨씬 넓은 틈. */
export const WIDE_RATIO = 5;
/** 아래 수조 틈 폭 = 파장 × 이 값. 파장만 한 틈. */
export const NARROW_RATIO = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(y 는 위). 위에서 내려다본 수조 두 판을 칸막이로 나눈다.
// ------------------------------------------------------------------------

/** 장 가로(월드). */
export const FIELD_W = 840;
/** 수조 한 판의 세로(월드). */
export const TANK_H = 170;
/** 두 수조를 가르는 칸막이 두께(월드). */
export const DIVIDER_H = 8;
/** 장 전체 세로 — 아래 수조 · 칸막이 · 위 수조. */
export const FIELD_H = TANK_H * 2 + DIVIDER_H;
/** 아래 수조(좁은 틈)의 바닥 y · 위 수조(넓은 틈)의 바닥 y. */
export const NARROW_TANK_Y = 0;
export const WIDE_TANK_Y = TANK_H + DIVIDER_H;
/** 벽의 왼쪽 면 x 와 두께. 틈을 나온 자리는 `WALL_X + WALL_THICKNESS`. */
export const WALL_X = 260;
export const WALL_THICKNESS = 10;

/** 장을 계산하는 격자 한 칸(월드). 파장 14 에 다섯 칸 — 상태로 계산하지 않는 표본 간격이다. */
export const CELL = 2.8;
/**
 * 틈 위 점파원을 파장 하나에 몇 개 놓는가 — 계산의 표본 밀도다(화면에 그리지 않는다).
 * 간격이 파장의 1/4 보다 좁아야 점마다의 무늬가 새지 않는다.
 */
export const SAMPLES_PER_WAVELENGTH = 5;
/**
 * 누르는 곡선이 자르는 크기. |변위| 를 이 값으로 자르고 나눈 뒤 `PRESS_EXPONENT` 제곱을 씌운다 —
 * 멀리 번져 약해진 물결도 보이도록. 색 사상이 아니라 값의 모양이다.
 */
export const PRESS_CLIP = 0.9;
/**
 * 누름 지수. diffraction 의 제곱근(0.5)보다 덜 누른다 — 넓은 틈 뒤 그늘의 약한 가장자리 물결까지
 * 끌어올리면 「그늘이 남는다」 가 흐려진다. 좁은 틈의 번진 물결은 이 값에서도 보인다.
 */
export const PRESS_EXPONENT = 0.75;

/**
 * 프레이밍 — 장 아래에 캡션 한 줄 자리를 둔다 (G24). 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: FIELD_W, minY: -44, maxY: FIELD_H } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------
// 물결 앞머리가 틈을 나오는 순간이 `spread` 의 시작이다. physics 는 이 상수를 보지 않고
// `timeline.start('spread')` 에게 묻는다.

/** 앞머리가 두 틈으로 다가가는 동안. */
export const APPROACH = 3;
/**
 * 틈을 나온 앞머리가 수조 끝(틈에서 가장 먼 모서리 약 590)까지 번지는 동안.
 * 속력 · 배치에서 나오는 길이인데 시간표가 그 계산을 받지 못한다 (G13).
 */
export const SPREAD = 6.8;
/** 다 번진 두 무늬를 견주는 동안. */
export const HOLD = 4.5;
/** 물결이 가라앉아 다음 주기로 넘어가는 동안. */
export const SETTLE = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const slitWidthAndDiffractionMessages = Object.freeze({
  'label.title': {
    ko: '슬릿 폭과 회절',
    en: 'Slit Width and Diffraction',
    ja: 'スリット幅と回折',
    zh: '狭缝宽度与衍射',
    ar: 'عرض الشق والحيود',
    es: 'Ancho de la rendija y difracción',
    fr: 'Largeur de la fente et diffraction',
    hi: 'झिरी की चौड़ाई और विवर्तन',
    id: 'Lebar Celah dan Difraksi',
    pt: 'Largura da Fenda e Difração',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '파장과 폭의 비가 정하는 퍼짐',
    en: 'How the gap-to-wavelength ratio sets the spread',
    ja: 'すき間と波長の比が広がりを決める',
    zh: '缝宽与波长之比决定扩散程度',
    ar: 'كيف تحدّد نسبة عرض الفتحة إلى الطول الموجي مقدار الانتشار',
    es: 'Cómo la razón entre abertura y longitud de onda fija cuánto se abren las ondas',
    fr: 'Comment le rapport ouverture/longueur d’onde fixe l’étalement',
    hi: 'छिद्र और तरंगदैर्घ्य का अनुपात फैलाव कैसे तय करता है',
    id: 'Bagaimana perbandingan celah dan panjang gelombang menentukan penyebaran',
    pt: 'Como a razão entre abertura e comprimento de onda define o espalhamento',
  },
  'label.stage': {
    ko: '폭이 다른 두 틈',
    en: 'Two gaps of different width',
    ja: '幅の異なる2つのすき間',
    zh: '宽度不同的两条缝隙',
    ar: 'فتحتان مختلفتا العرض',
    es: 'Dos aberturas de distinto ancho',
    fr: 'Deux ouvertures de largeurs différentes',
    hi: 'अलग-अलग चौड़ाई के दो छिद्र',
    id: 'Dua celah dengan lebar berbeda',
    pt: 'Duas aberturas de larguras diferentes',
  },
  'label.view': {
    ko: '위에서 본 두 수조',
    en: 'Two ripple tanks from above',
    ja: '上から見た二つのリップルタンク',
    zh: '俯视两个水波槽',
    ar: 'حوضا موجات من الأعلى',
    es: 'Dos cubetas de ondas vistas desde arriba',
    fr: 'Deux cuves à ondes vues de dessus',
    hi: 'ऊपर से देखे गए दो रिपल टैंक',
    id: 'Dua tangki riak dilihat dari atas',
    pt: 'Duas cubas de ondas vistas de cima',
  },
  'label.ratio': {
    ko: '틈 폭 = 파장 × {n}',
    en: 'gap = wavelength × {n}',
    ja: 'すき間 = 波長 × {n}',
    zh: '缝宽 = 波长 × {n}',
    ar: 'عرض الفتحة = الطول الموجي × {n}',
    es: 'abertura = longitud de onda × {n}',
    fr: 'ouverture = longueur d’onde × {n}',
    hi: 'छिद्र = तरंगदैर्घ्य × {n}',
    id: 'celah = panjang gelombang × {n}',
    pt: 'abertura = comprimento de onda × {n}',
  },
  'caption.approach': {
    ko: '같은 곧은 물결이 폭이 다른 두 틈으로 다가간다',
    en: 'The same straight waves head toward two gaps of different width',
    ja: '同じまっすぐな波が、幅の異なる2つのすき間へ向かう',
    zh: '相同的直线波向两条宽度不同的缝隙前进',
    ar: 'موجات مستقيمة متماثلة تتجه نحو فتحتين مختلفتي العرض',
    es: 'Las mismas ondas rectas avanzan hacia dos aberturas de distinto ancho',
    fr: 'Les mêmes ondes rectilignes avancent vers deux ouvertures de largeurs différentes',
    hi: 'एक जैसी सीधी तरंगें अलग-अलग चौड़ाई के दो छिद्रों की ओर बढ़ती हैं',
    id: 'Gelombang lurus yang sama bergerak menuju dua celah dengan lebar berbeda',
    pt: 'As mesmas ondas retas avançam em direção a duas aberturas de larguras diferentes',
  },
  'caption.spread': {
    ko: '넓은 틈을 지난 물결은 거의 곧게, 파장만 한 틈을 지난 물결은 둥글게 퍼진다',
    en: 'Through the wide gap the waves go almost straight; through the narrow one they spread in arcs',
    ja: '広いすき間を通った波はほぼまっすぐ進み、狭いすき間を通った波は円弧を描いて広がる',
    zh: '穿过宽缝的波几乎直行；穿过窄缝的波呈弧形散开',
    ar: 'عبر الفتحة الواسعة تسير الموجات مستقيمة تقريبًا؛ وعبر الضيقة تنتشر على شكل أقواس',
    es: 'Por la abertura ancha las ondas pasan casi rectas; por la estrecha se abren en arcos',
    fr: 'Par l’ouverture large, les ondes passent presque tout droit ; par l’étroite, elles s’étalent en arcs',
    hi: 'चौड़े छिद्र से तरंगें लगभग सीधी जाती हैं; संकरे छिद्र से वे चापों में फैल जाती हैं',
    id: 'Melalui celah lebar gelombang berjalan hampir lurus; melalui celah sempit gelombang menyebar membentuk busur',
    pt: 'Pela abertura larga as ondas passam quase retas; pela estreita elas se espalham em arcos',
  },
  'caption.hold': {
    ko: '넓은 틈 뒤에는 그늘이 남고, 좁은 틈 뒤에는 벽 바로 뒤까지 물결이 찼다',
    en: 'A shadow stays behind the wide gap; behind the narrow gap, waves fill right up to the wall',
    ja: '広いすき間の後ろには影が残り、狭いすき間の後ろでは壁のすぐ後ろまで波が満ちた',
    zh: '宽缝后面留下了阴影；窄缝后面，波一直充满到紧贴墙后的地方',
    ar: 'يبقى ظل خلف الفتحة الواسعة؛ أما خلف الفتحة الضيقة فتملأ الموجات المكان حتى الجدار مباشرةً',
    es: 'Tras la abertura ancha queda una sombra; tras la estrecha, las ondas llenan todo hasta la misma pared',
    fr: 'Une ombre subsiste derrière l’ouverture large ; derrière l’étroite, les ondes remplissent tout jusqu’au mur',
    hi: 'चौड़े छिद्र के पीछे छाया बनी रहती है; संकरे छिद्र के पीछे तरंगें दीवार के ठीक पीछे तक भर जाती हैं',
    id: 'Bayang-bayang tetap ada di balik celah lebar; di balik celah sempit, gelombang mengisi hingga tepat di belakang dinding',
    pt: 'Uma sombra permanece atrás da abertura larga; atrás da estreita, as ondas preenchem tudo até junto à parede',
  },
} satisfies Record<string, LocalizedText>);

export type SlitWidthAndDiffractionMessageKey = keyof typeof slitWidthAndDiffractionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SlitWidthAndDiffractionMessageKey): LocalizedText =>
  slitWidthAndDiffractionMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SlitWidthAndDiffractionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const slitWidthAndDiffractionSchema: BundleSchema = {
  id: SLIT_WIDTH_AND_DIFFRACTION_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 폭을 나란히 두어 자동 진행만으로 견줌이 끝난다.
  parameters: [],

  stages: [
    {
      id: 'two-gaps',
      label: text('label.stage'),
      constants: {
        wavelength: WAVELENGTH,
        waveSpeed: WAVE_SPEED,
        wideRatio: WIDE_RATIO,
        narrowRatio: NARROW_RATIO,
      },
    },
  ],

  environments: [],

  views: [{ id: 'tanks', label: text('label.view'), default: true }],

  /** 가로로 넓은 수조 두 판 + 아래 캡션 한 줄. */
  canvas: { height: 420, minHeight: 360 },

  /** 물결 장 위에 벽 · 칸막이, 그 위에 점선 · 이름표가 와야 한다. 쓴 순서대로 그린다. */
  drawOrder: 'scene',

  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'spread', duration: SPREAD, caption: key('caption.spread') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'settle', duration: SETTLE, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 틈을 나온 물결이 막 갈라지기 시작한 자리에서 연다.
   * 0 이면 오른쪽이 빈 수조로 3 초를 기다린다.
   */
  startAt: APPROACH + 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식(sin θ = λ/a)은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 14,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 「점선 바깥에 물결이 있는가」 다.
   */

  messages: slitWidthAndDiffractionMessages,
};
