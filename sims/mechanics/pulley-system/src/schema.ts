// ========================================================================
// pulley-system — 선언
// ========================================================================
// 질문: 도르래를 더 걸면 힘이 덜 든다는데, 대신 무엇이 달라지나.
//
// 짐을 받치는 줄 가닥이 n 개면 손은 짐 무게의 1/n 로 당기지만, 짐을 1 m 올리는
// 동안 줄을 n m 끌어내야 한다. 1 · 2 · 4 가닥 장치 셋을 나란히 둔다.
//
// 원본: tasks/piece-lab/pulley-system. 배치 상수는 원본의 논리 좌표(900 × 330 px,
// y 아래)를 그대로 옮겼다 — 월드로는 1 m = 50 px, 바닥선이 y = 0 이고 y 가 위다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pulley-system` 와 문자 그대로 일치한다 (C4). */
export const PULLEY_SYSTEM_ID = 'pulley-system';

// ------------------------------------------------------------------------
// 물리 설정 · 배치 (원본 상수 그대로)
// ------------------------------------------------------------------------

/** 짐 무게(N). 세 장치가 같다. */
export const WEIGHT_N = 40;
/** 올리는 높이(m). */
export const RISE_M = 1;
/** 원본 화면 축척 — 1 m = 50 px. 가로(당긴 줄)와 세로(오른 높이)가 같은 축척이다. */
export const PPM = 50;

/** 원본 논리 캔버스(px). */
export const WIDTH_PX = 900;
export const HEIGHT_PX = 330;

/** 이하 원본 논리 좌표(px, y 아래). */
export const CEIL_Y = 30;
/** 고정 도르래 중심 높이. */
export const FIX_CY = 70;
/** 도르래 반지름. */
export const R = 13;
export const FLOOR_Y = 296;
export const LOAD_W = 50;
export const LOAD_H = 36;
/** 처음 짐 윗면. */
export const LOAD_TOP0 = FLOOR_Y - 4 - LOAD_H;
/** 움직도르래 중심 ~ 짐 윗면. */
export const HOOK = 32;
/** 줄이 도르래를 떠난 곳 ~ 손 처음 자리. */
export const HAND_GAP = 22;

/** 세 장치: 받치는 줄 가닥 수 1 · 2 · 4. 패널 폭은 손이 물러날 거리만큼만 준다. */
export const PANELS: readonly { n: 1 | 2 | 4; x0: number; w: number; loadX: number }[] = [
  { n: 1, x0: 0, w: 232, loadX: 47 },
  { n: 2, x0: 232, w: 262, loadX: 50 },
  { n: 4, x0: 494, w: 406, loadX: 71 },
];

/**
 * 원본 캡션은 캔버스 아래 DOM 문단이었다(여백 6 px, 15 px × 행간 1.5). 그 한 줄의
 * 가운데 높이(논리 px). 캡션 슬롯의 월드 앵커로 쓴다.
 */
export const CAPTION_Y_PX = HEIGHT_PX + 6 + (15 * 1.5) / 2;
/** 캡션 줄의 아래 끝(논리 px). 경계가 여기까지 담는다. */
const CAPTION_BOTTOM_PX = HEIGHT_PX + 6 + 15 * 1.5;

/** 논리 px → 월드. */
export function worldX(px: number): number {
  return px / PPM;
}
export function worldY(py: number): number {
  return (FLOOR_Y - py) / PPM;
}

/** 원본 캔버스 전체 + 아래 캡션 줄. 매 프레임 같은 값이라 카메라가 흔들리지 않는다. */
export const SCENE_BOUNDS = {
  minX: 0,
  maxX: worldX(WIDTH_PX),
  minY: worldY(CAPTION_BOTTOM_PX),
  maxY: worldY(0),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pulleySystemMessages = Object.freeze({
  'label.title': {
    ko: '도르래',
    en: 'Pulleys',
    ja: '滑車',
    zh: '滑轮',
    ar: 'البكرات',
    es: 'Poleas',
    fr: 'Poulies',
    hi: 'घिरनियाँ',
    id: 'Katrol',
    pt: 'Polias',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '줄 가닥이 늘수록 드는 힘은 줄고 당길 줄은 길어지는 장치',
    en: 'A device where more strands mean a smaller pull and more rope to draw',
    ja: 'ロープの本数が増えるほど引く力は小さく、たぐるロープは長くなる装置',
    zh: '绳段越多、拉力越小而要拉的绳越长的装置',
    ar: 'أداة كلما زادت فيها فروع الحبل قلّت قوة الشد وطال الحبل المسحوب',
    es: 'Un dispositivo en el que más tramos de cuerda significan menos fuerza y más cuerda por tirar',
    fr: 'Un dispositif où plus de brins signifient une traction plus faible et plus de corde à tirer',
    hi: 'वह युक्ति जिसमें रस्सी के अधिक भाग होने पर खींचने का बल घटता है और खींचनी पड़ने वाली रस्सी बढ़ती है',
    id: 'Alat yang makin banyak utas talinya makin kecil tarikannya dan makin panjang tali yang ditarik',
    pt: 'Um dispositivo em que mais trechos de corda significam menos força e mais corda a puxar',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  /** 짐 안의 무게. 수와 단위는 표식이다 (C1 판정 3). */
  'label.weight': {
    ko: '{w} N',
    en: '{w} N',
    ja: '{w} N',
    zh: '{w} N',
    ar: '{w} N',
    es: '{w} N',
    fr: '{w} N',
    hi: '{w} N',
    id: '{w} N',
    pt: '{w} N',
  },
  'label.rise': {
    ko: '오른 높이',
    en: 'Raised',
    ja: '上がった高さ',
    zh: '升高的高度',
    ar: 'الارتفاع المكتسب',
    es: 'Altura subida',
    fr: 'Hauteur levée',
    hi: 'उठाई गई ऊँचाई',
    id: 'Tinggi naik',
    pt: 'Altura erguida',
  },
  /** 오른 높이 값. 표식. */
  'label.riseValue': {
    ko: '{h} m',
    en: '{h} m',
    ja: '{h} m',
    zh: '{h} m',
    ar: '{h} m',
    es: '{h} m',
    fr: '{h} m',
    hi: '{h} m',
    id: '{h} m',
    pt: '{h} m',
  },
  'label.pulled': {
    ko: '당긴 줄 {d} m',
    en: 'Rope pulled {d} m',
    ja: '引いたロープ {d} m',
    zh: '拉出的绳 {d} m',
    ar: 'الحبل المسحوب {d} m',
    es: 'Cuerda tirada {d} m',
    fr: 'Corde tirée {d} m',
    hi: 'खींची गई रस्सी {d} m',
    id: 'Tali ditarik {d} m',
    pt: 'Corda puxada {d} m',
  },
  'label.force': {
    ko: '힘 {f} N',
    en: 'Force {f} N',
    ja: '力 {f} N',
    zh: '力 {f} N',
    ar: 'القوة {f} N',
    es: 'Fuerza {f} N',
    fr: 'Force {f} N',
    hi: 'बल {f} N',
    id: 'Gaya {f} N',
    pt: 'Força {f} N',
  },
  'label.strands': {
    ko: '짐을 받치는 줄 {n}가닥',
    en: 'Load held by {n} strands',
    ja: '荷物を支えるロープ {n} 本',
    zh: '承重的绳 {n} 段',
    ar: 'يسند الحمل {n} من أفرع الحبل',
    es: 'Carga sostenida por {n} tramos de cuerda',
    fr: 'Charge tenue par {n} brins',
    hi: 'भार को थामे रस्सी के {n} भाग',
    id: 'Beban ditahan {n} utas tali',
    pt: 'Carga sustentada por {n} trechos de corda',
  },
  'caption.rise': {
    ko: '세 짐이 똑같이 오르는 동안, 받치는 줄이 많은 쪽일수록 손은 약하게 당기며 더 멀리 물러난다.',
    en: 'As the three loads rise together, the more strands hold a load, the weaker the pull and the farther the hand backs away.',
    ja: '三つの荷物がそろって上がる間、支えるロープが多いほど、手の引く力は弱く、手は遠くまで下がる。',
    zh: '三个重物一起上升时，承重的绳段越多，手拉得越轻，也退得越远。',
    ar: 'بينما ترتفع الأحمال الثلاثة معًا، كلما زاد عدد أفرع الحبل التي تسند الحمل، ضعف السحب وابتعدت اليد أكثر.',
    es: 'Mientras las tres cargas suben a la vez, cuantos más tramos sostienen una carga, más débil es el tirón y más lejos retrocede la mano.',
    fr: 'Pendant que les trois charges montent ensemble, plus il y a de brins pour tenir une charge, plus la traction est faible et plus la main recule loin.',
    hi: 'जब तीनों भार साथ-साथ उठते हैं, तो जिस भार को रस्सी के जितने अधिक भाग थामते हैं, खिंचाव उतना कम होता है और हाथ उतना अधिक पीछे हटता है।',
    id: 'Saat ketiga beban naik bersama, makin banyak utas tali yang menahan beban, makin lemah tarikannya dan makin jauh tangan mundur.',
    pt: 'Enquanto as três cargas sobem juntas, quanto mais trechos sustentam uma carga, mais fraco é o puxão e mais longe a mão recua.',
  },
  'caption.hold': {
    ko: '같은 1.00 m를 올리려고 당겨 낸 줄: 1.00 m, 2.00 m, 4.00 m.',
    en: 'Rope pulled to raise the same 1.00 m: 1.00 m, 2.00 m, 4.00 m.',
    ja: '同じ 1.00 m を上げるために引いたロープ: 1.00 m、2.00 m、4.00 m。',
    zh: '为把重物同样提升 1.00 m 而拉出的绳：1.00 m、2.00 m、4.00 m。',
    ar: 'الحبل المسحوب لرفع الـ 1.00 m نفسها: 1.00 m، 2.00 m، 4.00 m.',
    es: 'Cuerda tirada para subir el mismo 1.00 m: 1.00 m, 2.00 m, 4.00 m.',
    fr: 'Corde tirée pour lever le même 1.00 m : 1.00 m, 2.00 m, 4.00 m.',
    hi: 'वही 1.00 m उठाने के लिए खींची गई रस्सी: 1.00 m, 2.00 m, 4.00 m।',
    id: 'Tali yang ditarik untuk menaikkan 1.00 m yang sama: 1.00 m, 2.00 m, 4.00 m.',
    pt: 'Corda puxada para erguer o mesmo 1.00 m: 1.00 m, 2.00 m, 4.00 m.',
  },
  'caption.lower': {
    ko: '짐을 내려놓고 다시 올린다.',
    en: 'The loads come down, then rise again.',
    ja: '荷物が下り、また上がる。',
    zh: '重物放下，再次升起。',
    ar: 'تنزل الأحمال ثم ترتفع من جديد.',
    es: 'Las cargas bajan y vuelven a subir.',
    fr: 'Les charges redescendent, puis remontent.',
    hi: 'भार नीचे आते हैं, फिर दोबारा उठते हैं।',
    id: 'Beban turun, lalu naik lagi.',
    pt: 'As cargas descem e sobem de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type PulleySystemMessageKey = keyof typeof pulleySystemMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: PulleySystemMessageKey): LocalizedText => pulleySystemMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PulleySystemMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pulleySystemSchema: BundleSchema = {
  id: PULLEY_SYSTEM_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 가닥 수를 바꾸는 조작기보다 셋을 같은 순간 나란히 보는 것이 주장이다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { weight: WEIGHT_N, rise: RISE_M },
    },
  ],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 330 px 캔버스 + 아래 캡션 한 줄(약 35 px). 카탈로그 폭(약 780 px)에서 가로가 제약이
   * 되는 높이다 — 360 으로 줄이면 세로가 제약이 되어 그림이 더 작아진다(대조 스크린샷으로 확인).
   */
  canvas: { height: 390, minHeight: 330 },

  /**
   * 겹침이 원본 순서여야 한다 — 천장·바닥 · 짐 자리 · 고정 도르래 · 줄 · 움직도르래 · 짐 ·
   * 오른 높이 · 당긴 줄 · 손 · 힘 · 가닥 수. 줄은 고정 도르래 위를, 움직도르래는 줄 위를 덮는다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 오르는 중 — 원본은 주기를 0.8 초 앞당겨 열었다. */
  startAt: 0.8,

  /**
   * 한 주기 8 초 — 오르기 4.5 · 멈춤 2 · 내리기 1.5.
   *
   * 원본의 오르내림은 코사인 이징 `(1 − cos πx) / 2` 다. 선언의 이징 이름에 그 곡선이
   * 없어(`smooth` 는 smoothstep) 진행도는 `linear` 로 받고 scene 이 코사인을 건다
   * (NOTES.md 「어휘 부족」).
   */
  timeline: {
    phases: [
      { id: 'rise', duration: 4.5, caption: key('caption.rise') },
      { id: 'hold', duration: 2, caption: key('caption.hold') },
      { id: 'lower', duration: 1.5, caption: key('caption.lower') },
    ],
  },

  /** 슬롯 하나. 원본은 그림 아래 왼쪽 여백 12 px, 15 px 한 줄이었다. */
  caption: {
    anchor: { world: [worldX(12), worldY(CAPTION_Y_PX)] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 원본에 축·격자가 없다.

  messages: pulleySystemMessages,
};
