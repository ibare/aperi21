// ========================================================================
// sound-intensity — 선언
// ========================================================================
// 질문: 소리 나는 곳에서 두 배 멀어지면 소리는 얼마나 작아지는가.
//
// 음원에서 퍼져 나가는 소리 고리는 멀어질수록 같은 에너지를 더 넓은 구면에 나눠
// 옅어진다 — 세기는 거리의 제곱에 반비례한다. 귀가 r → 2r → 4r 로 물러나며 멈출
// 때마다 그 자리의 **세기 막대**와 **세기 준위(dB) 막대**를 한 쌍씩 남긴다. 세기는
// 1 → 1/4 → 1/16 로 꺼지는데 dB 는 80 → 74 → 68 로 조금씩만 낮아진다.
//
// 이웃 `inverse-square-law` 가 「같은 알갱이가 넓어지는 구면에 퍼진다」 를 이미 보였다.
// 이 조각은 구면 조각 · 창 안 알갱이 수를 되풀이하지 않고 **소리의 세기와 세기 준위(dB)
// 의 차이** 에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:sound-intensity` 와 문자 그대로 일치한다 (C4). */
export const SOUND_INTENSITY_ID = 'sound-intensity';

// ------------------------------------------------------------------------
// 물리 · 배치 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 기준 거리 r 의 월드 길이. 귀가 처음 멈추는 자리다. */
export const RADIUS = 1.8;
/** 둘째 · 셋째로 멈추는 거리 — r 의 몇 배인가. 화면의 `2r` · `4r` 이 이 값 그대로다. */
export const MULTIPLE_2 = 2;
export const MULTIPLE_3 = 4;
/**
 * 그 거리에서 세기가 r 의 몇 분의 1 인가 — 화면의 `1/4` · `1/16` 이 이 값 그대로다.
 * 거리 배수의 제곱이어야 한다(두 상수의 관계는 선언할 자리가 없다 — 장부 G143).
 */
export const INTENSITY_RATIO_2 = 4;
export const INTENSITY_RATIO_3 = 16;
/**
 * 세 자리의 세기 준위(dB) 정박값. 화면의 `80 dB` · `74 dB` · `68 dB` 가 이 값 그대로다.
 * 거리 두 배마다 20·log₁₀2 ≈ 6.02 dB 씩 준다 — 막대 높이는 그 식으로 계산하고, 글자는
 * 계산값을 반올림하지 않고 이 정박값을 쓴다 (S-piece 유효숫자).
 *
 * 음원 출력과 기준 세기(10⁻¹² W/m²)는 따로 두지 않는다. 화면에 나오는 것은 둘의 비 —
 * r 에서의 세기 준위(`level1`) — 하나뿐이라, 셋을 함께 두면 같은 수의 출처가 둘이 된다.
 */
export const LEVEL_1 = 80;
export const LEVEL_2 = 74;
export const LEVEL_3 = 68;
/** 소리 고리가 나오는 간격(초). 실제 소리의 주기가 아니라 퍼짐이 보이는 박자다. */
export const RING_PERIOD = 0.35;
/** 고리가 퍼지는 빠르기(월드/초). 눈으로 따라갈 만큼 늦췄다. */
export const SOUND_SPEED = 2.2;

/**
 * 막대 판의 배치. 고리가 퍼지는 띠(가운데 y = 0) 아래에 막대가 선다.
 * 막대 높이 `BAR_HEIGHT` 가 세기 1 · 세기 준위 `level1` 이다 — 두 막대는 r 에서 같은
 * 높이로 출발해 멀어질수록 갈라진다.
 */
export const BAND_HALF = 1.25;
export const BAR_BASE_Y = -3.35;
export const BAR_HEIGHT = 1.35;
/** 막대 한 개의 폭과 한 쌍 안의 틈(월드). */
export const BAR_WIDTH = 0.34;
export const BAR_GAP = 0.08;

/**
 * 프레이밍은 주장의 일부다. 음원(x = 0)부터 가장 먼 자리(4r = 7.2)와 고리가 퍼져 나가는
 * 끝까지, 아래에는 막대 판과 캡션 자리. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.9, maxX: 8.5, minY: -4.35, maxY: 1.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const soundIntensityMessages = Object.freeze({
  'label.title': {
    ko: '음의 세기',
    en: 'Sound intensity',
    ja: '音の強さ',
    zh: '声强',
    ar: 'شدة الصوت',
    es: 'Intensidad del sonido',
    fr: 'Intensité sonore',
    hi: 'ध्वनि की तीव्रता',
    id: 'Intensitas bunyi',
    pt: 'Intensidade sonora',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '거리 제곱에 반비례해 꺼지는 세기와 조금씩만 낮아지는 데시벨',
    en: 'Intensity falling with the square of distance while the decibel level dips only a little',
    ja: '距離の2乗に反比例して弱まる強さと、少しずつしか下がらないデシベル',
    zh: '声强与距离平方成反比地减弱，而分贝只下降一点',
    ar: 'شدة تتناقص مع مربع المسافة بينما لا ينخفض مستوى الديسيبل إلا قليلًا',
    es: 'La intensidad cae con el cuadrado de la distancia mientras el nivel en decibelios baja solo un poco',
    fr: 'L’intensité chute avec le carré de la distance tandis que le niveau en décibels baisse à peine',
    hi: 'दूरी के वर्ग के साथ घटती तीव्रता, जबकि डेसिबल स्तर थोड़ा ही गिरता है',
    id: 'Intensitas yang turun berbanding terbalik dengan kuadrat jarak, sementara taraf desibel hanya turun sedikit',
    pt: 'A intensidade cai com o quadrado da distância enquanto o nível em decibéis baixa só um pouco',
  },
  'label.stage': {
    ko: '물러나는 귀',
    en: 'Stepping back',
    ja: '離れていく耳',
    zh: '向后退开',
    ar: 'الابتعاد',
    es: 'Alejarse',
    fr: 'Reculer',
    hi: 'पीछे हटना',
    id: 'Mundur menjauh',
    pt: 'Afastando-se',
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
  'label.source': {
    ko: '음원',
    en: 'Source',
    ja: '音源',
    zh: '声源',
    ar: 'المصدر',
    es: 'Fuente',
    fr: 'Source',
    hi: 'स्रोत',
    id: 'Sumber',
    pt: 'Fonte',
  },
  'label.ear': {
    ko: '귀',
    en: 'Ear',
    ja: '耳',
    zh: '耳朵',
    ar: 'الأذن',
    es: 'Oído',
    fr: 'Oreille',
    hi: 'कान',
    id: 'Telinga',
    pt: 'Ouvido',
  },
  /** 막대 이름. 첫 쌍 아래에만 붙는다. */
  'label.intensity': {
    ko: '세기',
    en: 'Intensity',
    ja: '強さ',
    zh: '强度',
    ar: 'الشدة',
    es: 'Intensidad',
    fr: 'Intensité',
    hi: 'तीव्रता',
    id: 'Intensitas',
    pt: 'Intensidade',
  },
  'label.level': {
    ko: '세기 준위',
    en: 'Sound level',
    ja: '音の強さのレベル',
    zh: '声强级',
    ar: 'مستوى شدة الصوت',
    es: 'Nivel sonoro',
    fr: 'Niveau sonore',
    hi: 'ध्वनि-तीव्रता स्तर',
    id: 'Taraf intensitas',
    pt: 'Nível sonoro',
  },
  /** 거리 이름표. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.distanceBase': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'label.distanceScaled': {
    ko: '{n}r',
    en: '{n}r',
    ja: '{n}r',
    zh: '{n}r',
    ar: '{n}r',
    es: '{n}r',
    fr: '{n}r',
    hi: '{n}r',
    id: '{n}r',
    pt: '{n}r',
  },
  /** 세기 — r 의 세기를 1 로 둔 비. 수식 표기다. */
  'label.intensityBase': {
    ko: '1',
    en: '1',
    ja: '1',
    zh: '1',
    ar: '1',
    es: '1',
    fr: '1',
    hi: '1',
    id: '1',
    pt: '1',
  },
  'label.intensityScaled': {
    ko: '1/{n}',
    en: '1/{n}',
    ja: '1/{n}',
    zh: '1/{n}',
    ar: '1/{n}',
    es: '1/{n}',
    fr: '1/{n}',
    hi: '1/{n}',
    id: '1/{n}',
    pt: '1/{n}',
  },
  /** 세기 준위 — 값 + 단위 표식. 값은 스테이지 정박값 그대로 끼운다. */
  'label.level.value': {
    ko: '{db} dB',
    en: '{db} dB',
    ja: '{db} dB',
    zh: '{db} dB',
    ar: '{db} dB',
    es: '{db} dB',
    fr: '{db} dB',
    hi: '{db} dB',
    id: '{db} dB',
    pt: '{db} dB',
  },
  'caption.base': {
    ko: '음원에서 r 떨어진 귀 — 이 자리의 세기를 1 로 두면 세기 준위는 {db1} dB',
    en: 'An ear at distance r from the source — call the intensity here 1; the sound level is {db1} dB',
    ja: '音源から r 離れた耳 — ここでの強さを1とすると、音の強さのレベルは{db1} dB',
    zh: '距声源 r 处的耳朵——把这里的强度记为 1，声强级为 {db1} dB',
    ar: 'أذن على بعد r من المصدر — لنعتبر الشدة هنا 1؛ فيكون مستوى شدة الصوت {db1} dB',
    es: 'Un oído a una distancia r de la fuente — llamemos 1 a la intensidad aquí; el nivel sonoro es {db1} dB',
    fr: 'Une oreille à la distance r de la source — prenons l’intensité ici égale à 1 ; le niveau sonore est de {db1} dB',
    hi: 'स्रोत से r दूरी पर एक कान — यहाँ की तीव्रता को 1 मानें; ध्वनि-तीव्रता स्तर {db1} dB है',
    id: 'Telinga pada jarak r dari sumber — anggap intensitas di sini 1; taraf intensitasnya {db1} dB',
    pt: 'Um ouvido à distância r da fonte — chame de 1 a intensidade aqui; o nível sonoro é {db1} dB',
  },
  'caption.moving': {
    ko: '물러날수록 같은 소리가 더 넓게 퍼져 고리가 옅어진다',
    en: 'Stepping back, the same sound is spread wider and the rings grow faint',
    ja: '離れるほど同じ音がより広く広がり、輪が薄くなる',
    zh: '越往后退，同样的声音散布得越广，圆环越来越淡',
    ar: 'كلما ابتعدنا انتشر الصوت نفسه على مساحة أوسع وبهتت الحلقات',
    es: 'Al alejarse, el mismo sonido se reparte más y los anillos se desvanecen',
    fr: 'En reculant, le même son s’étale plus largement et les anneaux pâlissent',
    hi: 'पीछे हटने पर वही ध्वनि और फैल जाती है और वलय फीके पड़ते हैं',
    id: 'Makin menjauh, bunyi yang sama menyebar makin luas dan cincinnya memudar',
    pt: 'Ao se afastar, o mesmo som se espalha mais e os anéis ficam fracos',
  },
  'caption.far2': {
    ko: '거리 {m2}배 — 세기는 1/{i2} 로 줄었는데, 세기 준위는 {db1} dB 에서 {db2} dB 로 조금 낮아졌을 뿐이다',
    en: 'At {m2}× the distance — the intensity is down to 1/{i2}, yet the sound level only dips from {db1} dB to {db2} dB',
    ja: '距離 {m2}× — 強さは1/{i2}に減ったのに、音の強さのレベルは{db1} dBから{db2} dBへ少し下がっただけ',
    zh: '距离为 {m2}×——强度降到 1/{i2}，声强级却只从 {db1} dB 略降到 {db2} dB',
    ar: 'عند {m2}× المسافة — انخفضت الشدة إلى 1/{i2}، لكن مستوى شدة الصوت هبط قليلًا فقط من {db1} dB إلى {db2} dB',
    es: 'A {m2}× la distancia — la intensidad baja a 1/{i2}, pero el nivel sonoro solo baja de {db1} dB a {db2} dB',
    fr: 'À {m2}× la distance — l’intensité tombe à 1/{i2}, mais le niveau sonore ne baisse que de {db1} dB à {db2} dB',
    hi: '{m2}× दूरी पर — तीव्रता घटकर 1/{i2} रह गई, फिर भी ध्वनि-तीव्रता स्तर {db1} dB से केवल {db2} dB तक गिरा',
    id: 'Pada {m2}× jarak — intensitas turun menjadi 1/{i2}, tetapi taraf intensitas hanya turun dari {db1} dB ke {db2} dB',
    pt: 'A {m2}× a distância — a intensidade cai para 1/{i2}, mas o nível sonoro só desce de {db1} dB para {db2} dB',
  },
  'caption.far3': {
    ko: '거리 {m3}배 — 고리는 거의 보이지 않을 만큼 옅어져 세기가 1/{i3} 인데, 세기 준위는 아직 {db3} dB 다',
    en: 'At {m3}× the distance — the rings are barely visible and the intensity is 1/{i3}, yet the sound level is still {db3} dB',
    ja: '距離 {m3}× — 輪はほとんど見えず強さは1/{i3}なのに、音の強さのレベルはまだ{db3} dB',
    zh: '距离为 {m3}×——圆环几乎看不见，强度只有 1/{i3}，声强级却仍有 {db3} dB',
    ar: 'عند {m3}× المسافة — بالكاد تُرى الحلقات والشدة 1/{i3}، ومع ذلك ما زال مستوى شدة الصوت {db3} dB',
    es: 'A {m3}× la distancia — los anillos apenas se ven y la intensidad es 1/{i3}, pero el nivel sonoro aún es de {db3} dB',
    fr: 'À {m3}× la distance — les anneaux se voient à peine et l’intensité vaut 1/{i3}, mais le niveau sonore vaut encore {db3} dB',
    hi: '{m3}× दूरी पर — वलय मुश्किल से दिखते हैं और तीव्रता 1/{i3} है, फिर भी ध्वनि-तीव्रता स्तर अब भी {db3} dB है',
    id: 'Pada {m3}× jarak — cincin nyaris tak terlihat dan intensitasnya 1/{i3}, tetapi taraf intensitasnya masih {db3} dB',
    pt: 'A {m3}× a distância — os anéis mal aparecem e a intensidade é 1/{i3}, mas o nível sonoro ainda é de {db3} dB',
  },
} satisfies Record<string, LocalizedText>);

export type SoundIntensityMessageKey = keyof typeof soundIntensityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SoundIntensityMessageKey): LocalizedText => soundIntensityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SoundIntensityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const soundIntensitySchema: BundleSchema = {
  id: SOUND_INTENSITY_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 소리가 이미 퍼지고 있고, 귀가 r · 2r · 4r 에서 차례로 멈춘다.
  parameters: [],

  stages: [
    {
      id: 'stepping-back',
      label: text('label.stage'),
      constants: {
        radius: RADIUS,
        multiple2: MULTIPLE_2,
        multiple3: MULTIPLE_3,
        intensityRatio2: INTENSITY_RATIO_2,
        intensityRatio3: INTENSITY_RATIO_3,
        level1: LEVEL_1,
        level2: LEVEL_2,
        level3: LEVEL_3,
        ringPeriod: RING_PERIOD,
        soundSpeed: SOUND_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 긴 그림이다 — 고리 띠 하나와 막대 판 하나를 세로로 얹는다. */
  canvas: { height: 420, minHeight: 340 },

  /**
   * 한 주기 = r 에서 듣기 → 2r 로 물러남 → 듣기 → 4r 로 물러남 → 듣기 → 되돌아옴.
   *
   * 물러나는 동안 귀 아래 막대가 함께 움직이며 줄어든다(세기는 빠르게, dB 는 느리게).
   * 멈춘 자리마다 그 쌍이 남아 세 쌍이 나란히 견주어진다.
   */
  timeline: {
    phases: [
      { id: 'hold1', duration: 2.6, caption: key('caption.base') },
      { id: 'move2', duration: 1.6, ease: 'smooth', caption: key('caption.moving') },
      { id: 'hold2', duration: 3.4, caption: key('caption.far2') },
      { id: 'move3', duration: 2.0, ease: 'smooth', caption: key('caption.moving') },
      { id: 'hold3', duration: 3.8, caption: key('caption.far3') },
      { id: 'back', duration: 1.2, ease: 'smooth', caption: key('caption.far3') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 고리는 시각의 함수라 첫 프레임부터 띠를 채우고 있고,
   * 귀는 r 에 서 있다.
   */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 역제곱 식 · dB 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션에 끼우는 수는 스테이지 상수 그대로다 — state 에 글자로 옮겨 둔다 (장부 G133).
    vars: {
      m2: 'multiple2',
      m3: 'multiple3',
      i2: 'intensityRatio2',
      i3: 'intensityRatio3',
      db1: 'level1',
      db2: 'level2',
      db3: 'level3',
    },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 미터가 아니라 **r 의 몇 배인가** 와 두 막대의
   * 높이라서, 거리 이름표 r · 2r · 4r 과 막대 위 값만 둔다.
   */

  messages: soundIntensityMessages,
};
