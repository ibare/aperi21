// ========================================================================
// albedo — 선언
// ========================================================================
// 질문: 같은 햇빛이 닿아도 왜 어떤 땅은 뜨거워지고 어떤 땅은 덜 뜨거워지는가.
//
// 네 칸 — 눈 · 사막 · 숲 · 바다 — 에 같은 시각, 같은 수의 햇빛 알갱이가 떨어진다.
// 표면마다 되튀어 돌아가는 알갱이 수가 다르고, 되튀지 않은 알갱이는 표면에 먹혀
// 그 칸의 온도 막대를 한 칸씩 올린다. 눈이 녹아 바다가 드러나면 그 칸에서 되튀는
// 알갱이가 줄고 막대가 더 가파르게 오른다.
//
// 이웃 `thermal-radiation` 은 「닿지 않고 건너가 데운다」 이고, 이 조각은 「닿은 빛 중
// 얼마가 돌아가는가」 다. 스펙트럼 · 온실 효과 · 복사 평형은 이 조각의 질문이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:albedo` 와 문자 그대로 일치한다 (C4). */
export const ALBEDO_ID = 'albedo';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 표면마다의 반사율(되튀는 몫). 이름표에 그대로 뜬다. 녹은 눈은 바다의 값을 쓴다. */
export const ALBEDO_SNOW = 0.8;
export const ALBEDO_DESERT = 0.35;
export const ALBEDO_FOREST = 0.15;
export const ALBEDO_OCEAN = 0.06;
/** 칸마다 초당 떨어지는 햇빛 알갱이 수. 네 칸이 같다. */
export const RAY_RATE = 5;
/** 알갱이 자리 흩뿌림 · 되튐 순번 어긋남의 시드. */
export const RAY_SEED = 11;
/**
 * 알갱이가 하늘 위 끝에서 표면까지 오는 시간(초) · 먹힌 알갱이가 표면 속으로 가라앉으며
 * 사라지는 시간(초). 알갱이마다 닿는 시각이 달라 단계로 풀 수 없어 상수로 둔다. 표시 배율이다.
 */
export const FALL_TIME = 1.2;
export const SINK_TIME = 0.4;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 네 칸이 가로로 선다.
// ------------------------------------------------------------------------

/** 칸 폭 · 칸 사이 틈. */
export const LANE_W = 2.3;
export const LANE_GAP = 0.3;
/** 하늘 위 끝 높이 · 표면 두께(표면 윗면은 y = 0). */
export const SKY_TOP = 1.7;
export const GROUND_DEPTH = 0.32;
/** 햇빛이 비스듬히 드는 기울기 — 가로 이동 / 세로 이동. */
export const SUN_SLANT = 0.18;
/** 알갱이가 칸 벽에서 떨어져 떨어지는 여백. */
export const RAY_MARGIN = 0.12;

/** 이름표 · 반사율 글자 · 온도 막대 — 칸 가운데에서의 가로 자리와 높이. */
export const TEXT_DX = -0.35;
export const NAME_Y = -0.62;
export const VALUE_Y = -0.98;
export const BAR_DX = 0.72;
export const BAR_W = 0.2;
export const BAR_BOTTOM = -1.45;
export const BAR_TOP = -0.5;
export const BAR_LABEL_Y = -1.66;

/**
 * 프레이밍은 주장의 일부다. 가로는 네 칸, 세로는 하늘 위 끝부터 막대 이름표와 캡션 줄까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.45, maxX: 5.45, minY: -2.2, maxY: 1.8 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const FALL = 2;
export const SHINE = 7;
/** 눈이 녹는 동안. 알갱이가 닿는 시각의 반사율을 이 단계의 시작 · 끝에서 선형으로 되짚으므로 `linear` 다. */
export const MELT = 1.2;
/** 녹은 칸의 새 이름표가 떠오르는 동안. 옛 이름표가 다 사라진 뒤라 둘이 겹치지 않는다. */
export const REVEAL = 0.5;
export const MELTED = 6.8;
/** 막대를 비우고 녹은 칸을 눈으로 되돌리는 동안. 표면 반사율을 이 단계의 시작 · 끝에서 선형으로 되짚는다. */
export const CLEAR = 1;
/** 눈 이름표가 다시 떠오르는 동안. */
export const REFROZEN = 0.5;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const albedoMessages = Object.freeze({
  'label.title': {
    ko: '반사율',
    en: 'Albedo',
    ja: 'アルベド',
    zh: '反照率',
    ar: 'الألبيدو',
    es: 'Albedo',
    fr: 'Albédo',
    hi: 'ऐल्बिडो',
    id: 'Albedo',
    pt: 'Albedo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '되돌아가는 빛의 몫',
    en: 'The share of light sent back',
    ja: '送り返される光の割合',
    zh: '被送回的光所占的份额',
    ar: 'نسبة الضوء المُرتدّ',
    es: 'La fracción de luz devuelta',
    fr: 'La part de lumière renvoyée',
    hi: 'वापस भेजे गए प्रकाश का हिस्सा',
    id: 'Bagian cahaya yang dipantulkan kembali',
    pt: 'A fração de luz devolvida',
  },
  'label.stage': {
    ko: '네 표면',
    en: 'Four surfaces',
    ja: '四つの地表',
    zh: '四种地表',
    ar: 'أربعة أسطح',
    es: 'Cuatro superficies',
    fr: 'Quatre surfaces',
    hi: 'चार सतहें',
    id: 'Empat permukaan',
    pt: 'Quatro superfícies',
  },
  'label.view': {
    ko: '옆에서 본 땅',
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
  'label.snow': {
    ko: '눈',
    en: 'Snow',
    ja: '雪',
    zh: '雪',
    ar: 'ثلج',
    es: 'Nieve',
    fr: 'Neige',
    hi: 'बर्फ़',
    id: 'Salju',
    pt: 'Neve',
  },
  'label.desert': {
    ko: '사막',
    en: 'Desert',
    ja: '砂漠',
    zh: '沙漠',
    ar: 'صحراء',
    es: 'Desierto',
    fr: 'Désert',
    hi: 'रेगिस्तान',
    id: 'Gurun',
    pt: 'Deserto',
  },
  'label.forest': {
    ko: '숲',
    en: 'Forest',
    ja: '森林',
    zh: '森林',
    ar: 'غابة',
    es: 'Bosque',
    fr: 'Forêt',
    hi: 'वन',
    id: 'Hutan',
    pt: 'Floresta',
  },
  'label.ocean': {
    ko: '바다',
    en: 'Ocean',
    ja: '海',
    zh: '海洋',
    ar: 'محيط',
    es: 'Océano',
    fr: 'Océan',
    hi: 'महासागर',
    id: 'Laut',
    pt: 'Oceano',
  },
  'label.meltedSea': {
    ko: '드러난 바다',
    en: 'Open sea',
    ja: '現れた海',
    zh: '露出的海面',
    ar: 'بحر مكشوف',
    es: 'Mar al descubierto',
    fr: 'Mer découverte',
    hi: 'खुला समुद्र',
    id: 'Laut terbuka',
    pt: 'Mar descoberto',
  },
  /** 반사율 글자. 값은 스테이지 상수에서 온다. */
  'label.albedo': {
    ko: '반사율 {a}',
    en: 'albedo {a}',
    ja: 'アルベド {a}',
    zh: '反照率 {a}',
    ar: 'الألبيدو {a}',
    es: 'albedo {a}',
    fr: 'albédo {a}',
    hi: 'ऐल्बिडो {a}',
    id: 'albedo {a}',
    pt: 'albedo {a}',
  },
  'label.temp': {
    ko: '온도',
    en: 'Temp.',
    ja: '温度',
    zh: '温度',
    ar: 'درجة الحرارة',
    es: 'Temp.',
    fr: 'Temp.',
    hi: 'ताप',
    id: 'Suhu',
    pt: 'Temp.',
  },
  'caption.fall': {
    ko: '같은 햇빛 알갱이가 같은 수만큼 눈 · 사막 · 숲 · 바다에 떨어진다',
    en: 'The same sunlight falls in equal numbers on snow, desert, forest and ocean',
    ja: '同じ日光の粒が、雪・砂漠・森林・海に同じ数ずつ降り注ぐ',
    zh: '同样的阳光颗粒以相同的数量落在雪地、沙漠、森林和海洋上',
    ar: 'تسقط حبيبات ضوء الشمس نفسها بأعداد متساوية على الثلج والصحراء والغابة والمحيط',
    es: 'La misma luz solar cae en granos, en igual número, sobre la nieve, el desierto, el bosque y el océano',
    fr: 'La même lumière du Soleil tombe en grains, en nombre égal, sur la neige, le désert, la forêt et l’océan',
    hi: 'सूर्य के प्रकाश के वही कण बराबर संख्या में बर्फ़, रेगिस्तान, वन और महासागर पर गिरते हैं',
    id: 'Butir-butir sinar Matahari yang sama jatuh dalam jumlah sama di salju, gurun, hutan, dan laut',
    pt: 'A mesma luz solar cai em grãos, em número igual, sobre a neve, o deserto, a floresta e o oceano',
  },
  'caption.shine': {
    ko: '되튀어 돌아가는 알갱이 수가 표면마다 다르다 — 먹힌 알갱이만큼 온도 막대가 오른다',
    en: 'Each surface sends back a different number of grains — the bar rises by each grain it keeps',
    ja: '跳ね返る粒の数は地表ごとに違う — 吸収された粒の分だけ温度の棒が上がる',
    zh: '每种地表弹回的颗粒数不同 — 留下一粒，温度条就升高一格',
    ar: 'يُعيد كل سطح عددًا مختلفًا من الحبيبات — ويرتفع العمود مع كل حبيبة يحتفظ بها',
    es: 'Cada superficie devuelve un número distinto de granos — la barra sube con cada grano que retiene',
    fr: 'Chaque surface renvoie un nombre différent de grains — la barre monte à chaque grain qu’elle garde',
    hi: 'हर सतह अलग संख्या में कण लौटाती है — जो कण वह रख लेती है, उसी के साथ पट्टी ऊपर चढ़ती है',
    id: 'Setiap permukaan memantulkan jumlah butir yang berbeda — batangnya naik untuk setiap butir yang ditahannya',
    pt: 'Cada superfície devolve um número diferente de grãos — a barra sobe a cada grão que ela retém',
  },
  'caption.melt': {
    ko: '눈이 녹아 바다가 드러난다',
    en: 'The snow melts and the sea shows through',
    ja: '雪が融けて海が現れる',
    zh: '雪融化，海面露了出来',
    ar: 'ينصهر الثلج فيظهر البحر من تحته',
    es: 'La nieve se funde y el mar queda al descubierto',
    fr: 'La neige fond et la mer apparaît',
    hi: 'बर्फ़ पिघलती है और समुद्र दिखने लगता है',
    id: 'Salju mencair dan laut pun tampak',
    pt: 'A neve derrete e o mar aparece',
  },
  'caption.melted': {
    ko: '드러난 바다에서는 되튀는 알갱이가 줄고 온도 막대가 더 가파르게 오른다',
    en: 'Over the open sea fewer grains bounce back, and its bar climbs faster',
    ja: '現れた海では跳ね返る粒が減り、温度の棒がより急に上がる',
    zh: '在露出的海面上，弹回的颗粒变少，它的温度条升得更快',
    ar: 'فوق البحر المكشوف ترتد حبيبات أقل، ويصعد عموده أسرع',
    es: 'Sobre el mar al descubierto rebotan menos granos, y su barra sube más rápido',
    fr: 'Au-dessus de la mer découverte, moins de grains rebondissent, et sa barre monte plus vite',
    hi: 'खुले समुद्र पर कम कण लौटते हैं, और उसकी पट्टी अधिक तेज़ी से चढ़ती है',
    id: 'Di atas laut terbuka lebih sedikit butir yang memantul, dan batangnya naik lebih cepat',
    pt: 'Sobre o mar descoberto menos grãos voltam, e sua barra sobe mais rápido',
  },
  'caption.reset': {
    ko: '막대를 비우고 녹은 자리를 다시 눈으로 덮는다',
    en: 'The bars are emptied and the melted patch is covered with snow again',
    ja: '棒を空にし、融けた所を再び雪でおおう',
    zh: '温度条清空，融化的地方重新被雪覆盖',
    ar: 'تُفرَّغ الأعمدة ويُغطّى الموضع المنصهر بالثلج من جديد',
    es: 'Las barras se vacían y la zona fundida vuelve a cubrirse de nieve',
    fr: 'Les barres se vident et la zone fondue se recouvre de neige',
    hi: 'पट्टियाँ खाली हो जाती हैं और पिघली जगह फिर से बर्फ़ से ढक जाती है',
    id: 'Batang-batang dikosongkan dan bagian yang mencair kembali tertutup salju',
    pt: 'As barras se esvaziam e a parte derretida volta a ser coberta de neve',
  },
} satisfies Record<string, LocalizedText>);

export type AlbedoMessageKey = keyof typeof albedoMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: AlbedoMessageKey): LocalizedText => albedoMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: AlbedoMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const albedoSchema: BundleSchema = {
  id: ALBEDO_ID,
  label: text('label.title'),
  category: 'thermal',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 햇빛이 네 표면에 떨어지고, 눈이 녹고, 막대가 갈린다.
  parameters: [],

  stages: [
    {
      id: 'four-surfaces',
      label: text('label.stage'),
      constants: {
        albedoSnow: ALBEDO_SNOW,
        albedoDesert: ALBEDO_DESERT,
        albedoForest: ALBEDO_FOREST,
        albedoOcean: ALBEDO_OCEAN,
        rayRate: RAY_RATE,
        seed: RAY_SEED,
        fallTime: FALL_TIME,
        sinkTime: SINK_TIME,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  canvas: { height: 360, minHeight: 320 },

  /** 하늘 · 표면을 먼저 깔고 그 위로 알갱이가 지나간다 — 먹힌 알갱이는 표면 위에서 가라앉는다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 떨어지기 시작 → 네 표면에 쌓이는 차이 → 눈이 녹음 → 새 이름표 → 드러난 바다 →
   * 막대 비우고 눈으로 되돌림 → 눈 이름표. 햇빛은 주기 내내 같은 빠르기로 떨어진다.
   * 막대는 주기 처음에 비어 있고 `clear` 에서 다시 빈다.
   *
   * `melt` · `clear` 는 `linear` 여야 한다 — 알갱이가 닿은 지난 시각의 반사율을 그 단계의
   * 시작 · 끝에서 선형으로 되짚는다.
   */
  timeline: {
    phases: [
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'shine', duration: SHINE, caption: key('caption.shine') },
      { id: 'melt', duration: MELT, ease: 'linear', caption: key('caption.melt') },
      { id: 'reveal', duration: REVEAL, caption: key('caption.melt') },
      { id: 'melted', duration: MELTED, caption: key('caption.melted') },
      { id: 'clear', duration: CLEAR, ease: 'linear', caption: key('caption.reset') },
      { id: 'refrozen', duration: REFROZEN, caption: key('caption.reset') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 알갱이가 떨어지고 있고 막대가 오르기 시작했다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙 · 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: albedoMessages,
};
