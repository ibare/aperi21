// ========================================================================
// magnitude-scale — 선언
// ========================================================================
// 질문: 별의 등급이 하나 커지면 밝기는 얼마나 줄어드나. 독자가 멈추는 자리는
// "한 칸마다 **같은 비**로 나뉘고, 다섯 칸이면 **딱 100분의 1**" 이다.
//
// 등급은 거꾸로 가는 곱셈 눈금이다 — 수가 커질수록 어둡고, 한 칸은 더하기가 아니라
// 같은 비로 나누기다. 그래서 1등성 하나의 빛을 6등성 100개가 나눠 가진다.
//
// 왼쪽 밤하늘 판에 1~6등급 별이 나란히 있고, 오른쪽 판의 1등성 하나가 6등성 몫으로
// 떼어져 100개로 흩어진다. 거리 · 실제 광도 · 별의 색은 다루지 않는다 — 이웃 조각
// (`apparent-brightness` · `stellar-luminosity` · `star-color-temperature`)의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnitude-scale` 와 문자 그대로 일치한다 (C4). */
export const MAGNITUDE_SCALE_ID = 'magnitude-scale';

// ------------------------------------------------------------------------
// 등급 눈금 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 한 등급의 밝기 비. **화면에 보이는 값**이다 — `÷{r}` 에 이 선언값의 문자열이 그대로 들어간다.
 * 정의는 100 의 다섯제곱근(2.51188…)이고, 이 값은 그것을 넷째 자리에서 끊은 표기다.
 * 별의 밝기 계산은 아래 `FACTOR` · `FACTOR_STEPS` 로 한다 — 다섯 칸이면 **정확히** 100 이어야 해서.
 */
export const STEP_RATIO = 2.512;
/** 등급 차 `FACTOR_STEPS` 에 해당하는 밝기 비. 등급 눈금의 정의 그 자체다. */
export const FACTOR = 100;
/** `FACTOR` 에 해당하는 등급 차. */
export const FACTOR_STEPS = 5;
/** 사다리 맨 앞 별의 등급. 사다리는 여기서 `FACTOR_STEPS` 칸 간다. */
export const FIRST_MAGNITUDE = 1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽이 등급 사다리 판, 오른쪽이 나눔 판.
// ------------------------------------------------------------------------

/** 사다리 판(빛 없음) — 왼쪽 아래 · 오른쪽 위. */
export const LADDER_MIN: readonly [number, number] = [0, 0];
export const LADDER_MAX: readonly [number, number] = [12, 2.6];
/** 사다리 첫 별의 x 와 별 사이 간격(월드). 별은 판 가운데 높이에 선다. */
export const LADDER_X0 = 1;
export const LADDER_GAP = 2;
/** 나눔 판(빛 없음) — 왼쪽 아래 · 오른쪽 위. 1등성이 가운데에 선다. */
export const SHARE_MIN: readonly [number, number] = [13.1, 0];
export const SHARE_MAX: readonly [number, number] = [15.7, 2.6];
/** 나눔 격자의 칸 간격(월드). 10 × 10 이 판 안에 여백을 두고 든다. */
export const SHARE_PITCH = 0.24;

/**
 * 별 하나의 반지름(월드). **사다리 · 나눔 판의 모든 별이 같은 크기다** — 빛의 세기가 같은
 * 원판끼리만 크기가 같아야 한 점의 빛의 양이 같다. 나뉜 점 하나가 사다리의 6등성과 같은
 * 빛이라는 것을 모양이 거들지, 크기로 속이지 않는다.
 */
export const STAR_R = 0.08;

/** 판 위 이름표(÷ 비)의 높이와 판 아래 이름표(등급)의 높이. */
export const RATIO_LABEL_Y = 2.95;
export const MAG_LABEL_Y = -0.4;
/** 1등성과 6등성을 묶는 괄호의 아래 끝 · 위 가로선 · 이름표 높이. */
export const BRACKET_FOOT_Y = 3.3;
export const BRACKET_Y = 3.5;
export const BRACKET_LABEL_Y = 3.85;

/**
 * 프레이밍은 주장의 일부다. 가로는 사다리 판 왼쪽부터 나눔 판 오른쪽까지, 세로는 캡션 줄부터
 * 괄호 이름표 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.4, maxX: 16.1, minY: -1.35, maxY: 4.15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magnitudeScaleMessages = Object.freeze({
  'label.title': {
    ko: '별의 등급',
    en: 'Stellar magnitude',
    ja: '星の等級',
    zh: '星等',
    ar: 'القدر النجمي',
    es: 'Magnitud estelar',
    fr: 'Magnitude stellaire',
    hi: 'तारकीय कांतिमान',
    id: 'Magnitudo bintang',
    pt: 'Magnitude estelar',
  },
  'label.operation': {
    ko: '밝기를 등급으로 나타내는 방식',
    en: 'How brightness is written as magnitude',
    ja: '明るさを等級で表す方法',
    zh: '如何用星等表示亮度',
    ar: 'كيف يُعبَّر عن السطوع بالقدر',
    es: 'Cómo se expresa el brillo en magnitudes',
    fr: 'Comment l’éclat s’exprime en magnitude',
    hi: 'चमक को कांतिमान में कैसे लिखा जाता है',
    id: 'Cara kecerahan dinyatakan sebagai magnitudo',
    pt: 'Como o brilho é expresso em magnitude',
  },
  'label.stage': {
    ko: '1등성부터 6등성까지',
    en: 'First to sixth magnitude',
    ja: '1等星から6等星まで',
    zh: '从一等星到六等星',
    ar: 'من القدر الأول إلى القدر السادس',
    es: 'De primera a sexta magnitud',
    fr: 'De la première à la sixième magnitude',
    hi: 'पहले से छठे कांतिमान तक',
    id: 'Magnitudo pertama hingga keenam',
    pt: 'Da primeira à sexta magnitude',
  },
  'label.view': {
    ko: '등급 사다리',
    en: 'Magnitude ladder',
    ja: '等級のはしご',
    zh: '星等阶梯',
    ar: 'سلّم الأقدار',
    es: 'Escalera de magnitudes',
    fr: 'Échelle des magnitudes',
    hi: 'कांतिमान की सीढ़ी',
    id: 'Tangga magnitudo',
    pt: 'Escada de magnitudes',
  },
  /** 판 아래 등급 이름. 값이 끼어드는 조립문이라 문안이다 (C1). */
  'label.magnitude': {
    ko: '{m}등급',
    en: 'mag {m}',
    ja: '{m}等級',
    zh: '{m} 等',
    ar: 'القدر {m}',
    es: 'mag {m}',
    fr: 'mag {m}',
    hi: 'कांतिमान {m}',
    id: 'mag {m}',
    pt: 'mag {m}',
  },
  /** 이웃 별 사이의 비 · 괄호의 비. 기호와 수뿐인 표식이지만 수가 선언값이라 자리표시로 끼운다. */
  'label.ratio': {
    ko: '÷{r}',
    en: '÷{r}',
    ja: '÷{r}',
    zh: '÷{r}',
    ar: '÷{r}',
    es: '÷{r}',
    fr: '÷{r}',
    hi: '÷{r}',
    id: '÷{r}',
    pt: '÷{r}',
  },
  /** 나눔 판 위 — 이 판이 담은 것. 별이 다 나뉜 뒤에도 판의 빛 총량은 이것이다. */
  'label.source': {
    ko: '{m}등성 하나의 빛',
    en: 'light of one mag-{m} star',
    ja: '{m}等星1つの光',
    zh: '一颗 {m} 等星的光',
    ar: 'ضوء نجم واحد من القدر {m}',
    es: 'luz de una estrella de mag {m}',
    fr: 'lumière d’une étoile de mag {m}',
    hi: 'कांतिमान {m} के एक तारे का प्रकाश',
    id: 'cahaya satu bintang mag {m}',
    pt: 'luz de uma estrela de mag {m}',
  },
  /** 나눔 판 아래 — 별을 떠난 몫의 수. 별에 남은 빛과 짝이 맞는 수다. */
  'label.count': {
    ko: '{m}등성 {n}개',
    en: '{n} mag-{m} stars',
    ja: '{m}等星 {n}個',
    zh: '{n} 颗 {m} 等星',
    ar: '{n} من نجوم القدر {m}',
    es: '{n} estrellas de mag {m}',
    fr: '{n} étoiles de mag {m}',
    hi: 'कांतिमान {m} के {n} तारे',
    id: '{n} bintang mag {m}',
    pt: '{n} estrelas de mag {m}',
  },
  'caption.step': {
    ko: '등급 수가 하나 커질 때마다 밝기가 같은 비로 나뉜다 — 눈에는 고른 계단으로 보인다',
    en: 'Each step up in magnitude number divides the brightness by the same ratio — to the eye, even steps',
    ja: '等級の数が1つ大きくなるごとに、明るさは同じ比で割られる — 目には均等な階段に見える',
    zh: '星等数每增大 1，亮度就除以同一个比值 — 在眼中是均匀的台阶',
    ar: 'كل زيادة بمقدار واحد في رقم القدر تقسم السطوع على النسبة نفسها — وتبدو للعين درجات متساوية',
    es: 'Cada paso hacia arriba en el número de magnitud divide el brillo por la misma razón — a la vista, escalones iguales',
    fr: 'Chaque cran de plus dans le nombre de magnitude divise l’éclat par le même rapport — à l’œil, des marches égales',
    hi: 'कांतिमान की संख्या हर बार एक बढ़ने पर चमक उसी अनुपात से भाग होती है — आँख को ये समान सीढ़ियाँ लगती हैं',
    id: 'Setiap kenaikan satu angka magnitudo membagi kecerahan dengan rasio yang sama — di mata, anak tangganya rata',
    pt: 'Cada passo acima no número de magnitude divide o brilho pela mesma razão — para o olho, degraus iguais',
  },
  'caption.hundred': {
    ko: '같은 비로 다섯 번 나누면 딱 떨어지는 수가 된다 — 1등성과 6등성 사이다',
    en: 'Divide by that ratio five times and it comes out even — first to sixth magnitude',
    ja: 'その比で5回割ると、ちょうど割り切れる数になる — 1等星と6等星の間だ',
    zh: '用这个比值连除五次，就得到一个整数 — 正是一等星到六等星之间',
    ar: 'اقسم على تلك النسبة خمس مرات فتحصل على عدد صحيح تمامًا — من القدر الأول إلى السادس',
    es: 'Divide por esa razón cinco veces y sale un número redondo — de primera a sexta magnitud',
    fr: 'Divisez cinq fois par ce rapport et le compte tombe juste — de la première à la sixième magnitude',
    hi: 'उस अनुपात से पाँच बार भाग दें तो संख्या पूरी बैठती है — पहले से छठे कांतिमान तक',
    id: 'Bagi dengan rasio itu lima kali dan hasilnya bilangan bulat — dari magnitudo pertama hingga keenam',
    pt: 'Divida por essa razão cinco vezes e dá um número redondo — da primeira à sexta magnitude',
  },
  'caption.split': {
    ko: '1등성 하나의 빛을 6등성 몫씩 떼어 낸다 — 뗄수록 별이 옅어진다',
    en: 'The light of one first-magnitude star is split off in sixth-magnitude shares — it fades as they leave',
    ja: '1等星1つの光を6等星の分ずつ切り分ける — 切り分けるほど星は暗くなる',
    zh: '把一颗一等星的光按六等星的份额一份份分出去 — 分出越多，星越暗',
    ar: 'يُقسَم ضوء نجم واحد من القدر الأول إلى حصص بقدر نجوم القدر السادس — ويخفت كلما انفصلت',
    es: 'La luz de una estrella de primera magnitud se reparte en porciones de sexta magnitud — se apaga a medida que se van',
    fr: 'La lumière d’une étoile de première magnitude est détachée en parts de sixième magnitude — elle pâlit à mesure qu’elles partent',
    hi: 'प्रथम कांतिमान के एक तारे का प्रकाश छठे कांतिमान के हिस्सों में अलग किया जाता है — हिस्से निकलते जाते हैं तो तारा मंद होता जाता है',
    id: 'Cahaya satu bintang magnitudo pertama dipisahkan menjadi bagian-bagian magnitudo keenam — bintangnya meredup saat bagian-bagian itu pergi',
    pt: 'A luz de uma estrela de primeira magnitude é separada em porções de sexta magnitude — ela se apaga à medida que elas saem',
  },
  'caption.share': {
    ko: '남김없이 나뉘었다 — 1등성 하나의 빛을 6등성들이 나눠 가진다',
    en: 'Nothing is left over — the light of one first-magnitude star is shared among sixth-magnitude stars',
    ja: '余すところなく分けられた — 1等星1つの光を6等星たちが分け合う',
    zh: '一点不剩 — 一颗一等星的光由多颗六等星分享',
    ar: 'لم يتبقَّ شيء — ضوء نجم واحد من القدر الأول تتقاسمه نجوم من القدر السادس',
    es: 'No sobra nada — la luz de una estrella de primera magnitud se reparte entre estrellas de sexta magnitud',
    fr: 'Il ne reste rien — la lumière d’une étoile de première magnitude se partage entre des étoiles de sixième magnitude',
    hi: 'कुछ भी नहीं बचा — प्रथम कांतिमान के एक तारे का प्रकाश छठे कांतिमान के तारों में बँट गया है',
    id: 'Tidak ada yang tersisa — cahaya satu bintang magnitudo pertama dibagi di antara bintang-bintang magnitudo keenam',
    pt: 'Não sobra nada — a luz de uma estrela de primeira magnitude é repartida entre estrelas de sexta magnitude',
  },
  'caption.gather': {
    ko: '다시 모으면 1등성 하나로 돌아온다',
    en: 'Gathered back, they make one first-magnitude star again',
    ja: '再び集めると、1等星1つに戻る',
    zh: '重新聚拢，又成为一颗一等星',
    ar: 'إذا جُمعت من جديد عادت نجمًا واحدًا من القدر الأول',
    es: 'Reunidas de nuevo, vuelven a formar una estrella de primera magnitud',
    fr: 'Rassemblées, elles redonnent une étoile de première magnitude',
    hi: 'फिर से इकट्ठा करने पर वे फिर प्रथम कांतिमान का एक तारा बन जाते हैं',
    id: 'Dikumpulkan kembali, mereka menjadi satu bintang magnitudo pertama lagi',
    pt: 'Reunidas de novo, elas voltam a formar uma estrela de primeira magnitude',
  },
} satisfies Record<string, LocalizedText>);

export type MagnitudeScaleMessageKey = keyof typeof magnitudeScaleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagnitudeScaleMessageKey): LocalizedText => magnitudeScaleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagnitudeScaleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magnitudeScaleSchema: BundleSchema = {
  id: MAGNITUDE_SCALE_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  /**
   * 조작기가 없다. 넣을 만한 것은 "등급 슬라이더" 인데, 사다리가 이미 여섯 등급을 나란히
   * 보이고 있어 독자가 직접 옮겨 봐야 새로 알게 되는 것이 없다.
   */
  parameters: [],

  stages: [
    {
      id: 'first-to-sixth',
      label: text('label.stage'),
      constants: {
        stepRatio: STEP_RATIO,
        factor: FACTOR,
        factorSteps: FACTOR_STEPS,
        firstMagnitude: FIRST_MAGNITUDE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ladder', label: text('label.view'), default: true }],

  /** 가로로 넓은 그림이다. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 320, minHeight: 280 },

  /**
   * 한 주기 = 사다리를 한 칸씩 → 괄호 → 1등성을 떼어 냄 → 나뉜 채 머묾 → 다시 모음.
   *
   * 사다리 단계는 칸마다 하나다. 강조 고리의 자리는 `at('step-k')` 를 더해 얻으므로 저작자가
   * 한 칸만 길게 잡아도 따라간다.
   */
  timeline: {
    phases: [
      { id: 'step-1', duration: 1.1, ease: 'smooth', caption: key('caption.step') },
      { id: 'step-2', duration: 1.1, ease: 'smooth', caption: key('caption.step') },
      { id: 'step-3', duration: 1.1, ease: 'smooth', caption: key('caption.step') },
      { id: 'step-4', duration: 1.1, ease: 'smooth', caption: key('caption.step') },
      { id: 'step-5', duration: 1.1, ease: 'smooth', caption: key('caption.step') },
      { id: 'hundred', duration: 1.8, ease: 'smooth', caption: key('caption.hundred') },
      { id: 'split', duration: 3.6, caption: key('caption.split') },
      { id: 'share', duration: 3.0, caption: key('caption.share') },
      { id: 'gather', duration: 1.8, caption: key('caption.gather') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 고리가 2등급을 지나 3등급으로 옮겨 가는 중이다. */
  startAt: 1.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 포그슨 식 · 로그의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.3,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음 (기본값). 잴 것이 거리가 아니다.
   * 겹침 순서가 판정 장치다 — 별은 빛 없음 판 **위**에 떠야 한다. 층 순서로는 `region`(매질)이
   * 물체 위로 덮인다.
   */
  drawOrder: 'scene',

  messages: magnitudeScaleMessages,
};
