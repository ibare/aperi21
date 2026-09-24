// ========================================================================
// magnetic-field — 선언
// ========================================================================
// 질문: 자석 둘레의 「자기장」 은 눈에 보이지 않는데, 그 모양을 어떻게 아는가.
//
// 종이 위에 쇳가루를 흩뿌린다. 방향이 제각각이다. 막대자석을 내려놓으면 쇳가루가
// **제자리에서** 그 자리 자기력의 방향으로 돌아선다 — 옮겨 가지 않고 돌기만 하는데도
// 한 극에서 뻗어 나와 다른 극으로 휘어 드는 무늬가 드러난다. 극 가까이는 힘이 세서 먼저 · 곧게
// 늘어서고, 먼 곳은 힘이 약해 늦게 · 덜 돌아선다. 무늬의 방향이 장의 방향이고, 무늬가
// 얼마나 또렷한지가 장의 세기다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-field` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_FIELD_ID = 'magnetic-field';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 막대자석의 길이 · 폭(월드 단위). N극이 오른쪽(+x)이다. */
export const MAGNET_LENGTH = 2.2;
export const MAGNET_WIDTH = 0.5;
/**
 * 자극의 세기(무차원). 장의 세기는 이 값에 비례하고, 쇳가루가 돌아서는 빠르기도 이
 * 값을 따른다. 절대 단위를 쓰지 않는 것은 화면에 세기 수치를 두지 않기 때문이다.
 */
export const POLE_STRENGTH = 1;
/**
 * 정렬 배율(1/s per 세기 단위). 쇳가루가 장을 따라 도는 빠르기 = 이 값 × 그 자리 장의
 * 세기. 종이의 마찰 · 쇳가루 질량을 한 수로 묶은 **표시 배율**이다 — 이 값이 정하는 것은
 * 「극 가까이는 순식간, 가장자리는 몇 초가 지나도 덜 돈다」 는 시간 척도다.
 */
export const ALIGN_RATE = 2.4;
/** 흩뿌린 쇳가루 수. */
export const FILING_COUNT = 2400;
/** 흩뿌림의 시드. 같은 시드는 같은 자리 · 같은 처음 방향이다 (S-sim). */
export const SEED = 21;

// ------------------------------------------------------------------------
// 배치 — 월드 단위
// ------------------------------------------------------------------------

/** 쇳가루 한 알의 길이(월드). 알마다 이 값의 `FILING_LENGTH_SPREAD` 배 안에서 다르다. */
export const FILING_LENGTH = 0.105;
/** 쇳가루 길이의 흩어짐 [최소 배, 최대 배]. 고른 막대가 아니라 가루로 읽히게 한다. */
export const FILING_LENGTH_SPREAD: readonly [number, number] = [0.6, 1.35];
/** 자석 둘레에서 쇳가루를 뿌리지 않는 틈(월드). 자석 위에 올라앉은 가루는 무늬가 아니다. */
export const MAGNET_CLEARANCE = 0.1;

/** 쇳가루를 뿌리는 종이의 범위. 아래쪽은 캡션 줄에 내준다. */
export const PAPER = { minX: -3.7, maxX: 3.7, minY: -1.72, maxY: 1.86 } as const;

/**
 * 프레이밍은 주장의 일부다. 종이 전체와 그 아래 캡션 줄. 매 프레임 같은 값이다
 * (원칙 6 · S-piece).
 */
export const SCENE_BOUNDS = { minX: -3.75, maxX: 3.75, minY: -2.12, maxY: 1.9 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 쇳가루가 종이에 내려앉는 동안. */
export const SPRINKLE = 0.6;
/** 흩어진 채로 놓여 있는 동안 — 자석이 없으면 방향이 제각각이라는 것을 본다. */
export const REST = 1.6;
/** 자석을 내려놓는 동안. */
export const PLACE = 0.5;
/** 쇳가루가 돌아서는 동안 — 극 가까이가 먼저 선다. */
export const ALIGN = 3.2;
/** 드러난 무늬를 읽는 동안. 가장자리는 이때도 조금씩 더 돈다. */
export const HOLD = 4;
/** 종이를 털어 다음 주기로 넘어가는 동안. */
export const CLEAR = 0.7;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticFieldMessages = Object.freeze({
  'label.title': {
    ko: '자기장',
    en: 'Magnetic field',
    ja: '磁場',
    zh: '磁场',
    ar: 'المجال المغناطيسي',
    es: 'Campo magnético',
    fr: 'Champ magnétique',
    hi: 'चुंबकीय क्षेत्र',
    id: 'Medan magnet',
    pt: 'Campo magnético',
  },
  'label.operation': {
    ko: '자기력의 분포',
    en: 'How magnetic force is spread around a magnet',
    ja: '磁石のまわりに磁気力がどう広がっているか',
    zh: '磁力如何分布在磁铁周围',
    ar: 'كيف تتوزع القوة المغناطيسية حول المغناطيس',
    es: 'Cómo se reparte la fuerza magnética alrededor de un imán',
    fr: 'Comment la force magnétique se répartit autour d’un aimant',
    hi: 'चुंबक के चारों ओर चुंबकीय बल कैसे फैला होता है',
    id: 'Bagaimana gaya magnet tersebar di sekitar magnet',
    pt: 'Como a força magnética se distribui ao redor de um ímã',
  },
  'label.stage': {
    ko: '막대자석과 쇳가루',
    en: 'Bar magnet and iron filings',
    ja: '棒磁石と砂鉄',
    zh: '条形磁铁与铁屑',
    ar: 'مغناطيس قضيبي وبرادة حديد',
    es: 'Imán de barra y limaduras de hierro',
    fr: 'Aimant droit et limaille de fer',
    hi: 'छड़ चुंबक और लोहे का बुरादा',
    id: 'Magnet batang dan serbuk besi',
    pt: 'Ímã em barra e limalha de ferro',
  },
  'label.view': {
    ko: '종이 위',
    en: 'On the paper',
    ja: '紙の上',
    zh: '纸面上',
    ar: 'على الورقة',
    es: 'Sobre el papel',
    fr: 'Sur le papier',
    hi: 'कागज़ पर',
    id: 'Di atas kertas',
    pt: 'Sobre o papel',
  },
  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
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
  'caption.scatter': {
    ko: '종이 위에 흩뿌린 쇳가루 — 방향이 제각각이다',
    en: 'Iron filings sprinkled on paper — they point every which way',
    ja: '紙の上にまいた砂鉄 — 向きはばらばらだ',
    zh: '撒在纸上的铁屑 — 指向四面八方',
    ar: 'برادة حديد منثورة على ورقة — تتجه في كل اتجاه',
    es: 'Limaduras de hierro esparcidas sobre papel — apuntan en todas direcciones',
    fr: 'De la limaille de fer répandue sur du papier — elle pointe dans tous les sens',
    hi: 'कागज़ पर छिड़का लोहे का बुरादा — कण हर दिशा में इशारा करते हैं',
    id: 'Serbuk besi ditaburkan di atas kertas — arahnya ke mana-mana',
    pt: 'Limalha de ferro espalhada no papel — aponta para todos os lados',
  },
  'caption.place': {
    ko: '그 한가운데에 막대자석을 내려놓는다',
    en: 'A bar magnet is set down in the middle',
    ja: 'その真ん中に棒磁石を置く',
    zh: '在正中间放下一根条形磁铁',
    ar: 'يوضع مغناطيس قضيبي في المنتصف',
    es: 'Se coloca un imán de barra en el centro',
    fr: 'On pose un aimant droit au milieu',
    hi: 'बीच में एक छड़ चुंबक रखा जाता है',
    id: 'Sebuah magnet batang diletakkan di tengah',
    pt: 'Um ímã em barra é colocado no meio',
  },
  'caption.align': {
    ko: '쇳가루가 제자리에서 돌아선다 — 극 가까이부터 먼저',
    en: 'The filings turn where they lie — those near the poles first',
    ja: '砂鉄がその場で向きを変える — 極の近くから先に',
    zh: '铁屑在原地转向 — 靠近磁极的先转',
    ar: 'تدور البرادة في مكانها — القريبة من القطبين أولًا',
    es: 'Las limaduras giran donde están — primero las cercanas a los polos',
    fr: 'La limaille pivote sur place — d’abord près des pôles',
    hi: 'बुरादे के कण अपनी जगह पर घूम जाते हैं — ध्रुवों के पास वाले पहले',
    id: 'Serbuk besi berputar di tempatnya — yang dekat kutub lebih dulu',
    pt: 'A limalha gira onde está — primeiro perto dos polos',
  },
  'caption.hold': {
    ko: '한 극에서 뻗어 나와 다른 극으로 휘어 드는 무늬 — 극 가까이일수록 곧게 늘어섰다',
    en: 'A pattern that fans out of one pole and curves into the other — straightest near the poles',
    ja: '一方の極から広がり出て、もう一方の極へ曲がって入る模様 — 極に近いほどまっすぐ並ぶ',
    zh: '从一极散出、弯入另一极的图样 — 越靠近磁极排列得越直',
    ar: 'نمط ينتشر من أحد القطبين وينحني داخلًا إلى الآخر — أكثر استقامة قرب القطبين',
    es: 'Un patrón que se abre desde un polo y se curva hasta el otro — más recto cerca de los polos',
    fr: 'Un motif qui s’évase depuis un pôle et s’incurve vers l’autre — plus droit près des pôles',
    hi: 'एक ध्रुव से फैलकर निकलता और दूसरे ध्रुव में मुड़कर जाता पैटर्न — ध्रुवों के पास सबसे सीधा',
    id: 'Pola yang menyebar dari satu kutub dan melengkung masuk ke kutub lain — paling lurus di dekat kutub',
    pt: 'Um padrão que se abre a partir de um polo e se curva até o outro — mais reto perto dos polos',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticFieldMessageKey = keyof typeof magneticFieldMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticFieldMessageKey): LocalizedText => magneticFieldMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticFieldMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticFieldSchema: BundleSchema = {
  id: MAGNETIC_FIELD_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 흩어진 쇳가루 위에 자석이 놓이고, 무늬가 드러나고, 다시 털린다.
  parameters: [],

  stages: [
    {
      id: 'bar-magnet',
      label: text('label.stage'),
      constants: {
        magnetLength: MAGNET_LENGTH,
        magnetWidth: MAGNET_WIDTH,
        poleStrength: POLE_STRENGTH,
        alignRate: ALIGN_RATE,
        filingCount: FILING_COUNT,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'paper', label: text('label.view'), default: true }],

  /**
   * 가로로 넓은 종이 한 장. 막대자석은 가로로 누워 있고 무늬도 양옆으로 퍼지므로
   * 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 384, minHeight: 340 },

  /**
   * 한 주기 = 내려앉음 → 흩어진 채 → 자석을 놓음 → 돌아섬 → 무늬 → 털어 냄.
   *
   * 돌아서는 시각은 단계로 가르지 않는다 — 쇳가루마다 그 자리 장의 세기로 저절로
   * 갈린다(physics.filingAngle). 시간표는 「자석이 놓인 순간」 하나만 정한다.
   */
  timeline: {
    phases: [
      { id: 'sprinkle', duration: SPRINKLE, ease: 'smooth', caption: key('caption.scatter') },
      { id: 'rest', duration: REST, caption: key('caption.scatter') },
      { id: 'place', duration: PLACE, ease: 'smooth', caption: key('caption.place') },
      { id: 'align', duration: ALIGN, caption: key('caption.align') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.hold') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 흩어진 쇳가루가 종이에 놓여 있고 자석이 곧 내려오는
   * 자리에서 연다. 0 이면 빈 종이에 가루가 내려앉는 것부터 기다리게 된다.
   */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 무늬의 모양이다 — 격자를
   * 깔면 쇳가루 선분과 섞여 무늬가 흐려진다.
   */

  messages: magneticFieldMessages,
};
