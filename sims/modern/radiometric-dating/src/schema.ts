// ========================================================================
// radiometric-dating — 선언
// ========================================================================
// 질문: 시료에 남은 탄소-14 의 비율만 재서 어떻게 그것이 얼마나 오래되었는지 아는가.
//
// 답: 붕괴 곡선을 **거꾸로 읽는다.** 남은 비율의 높이에서 가로로 곡선까지 가고, 거기서
// 곧장 내려오면 지난 시간이다. 살아 있을 때의 1/4 이면 반감기 두 번 — 되짚을 때마다
// 비율이 두 배가 되어 1/4 → 1/2 → 1 — 5730 년 × 2, 약 11460 년.
//
// 이웃 `radioactive-decay` 는 원자가 붕괴하며 곡선이 **그려지는** 것을 보인다. 이 조각은
// 곡선을 이미 그려 둔 **읽기 도구**로 쓴다 — 움직이는 것은 곡선이 아니라 읽는 경로다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radiometric-dating` 와 문자 그대로 일치한다 (C4). */
export const RADIOMETRIC_DATING_ID = 'radiometric-dating';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radiometricDatingMessages = Object.freeze({
  'label.title': {
    ko: '방사성 연대 측정',
    en: 'Radiometric dating',
    ja: '放射年代測定',
    zh: '放射性测年',
    ar: 'التأريخ الإشعاعي',
    es: 'Datación radiométrica',
    fr: 'Datation radiométrique',
    hi: 'रेडियोमितीय काल-निर्धारण',
    id: 'Penanggalan radiometrik',
    pt: 'Datação radiométrica',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '남은 비율로 재는 시간',
    en: 'Telling time by what remains',
    ja: '残った割合で時間を測る',
    zh: '用剩余比例测定时间',
    ar: 'قياس الزمن بما تبقّى',
    es: 'Medir el tiempo por lo que queda',
    fr: 'Mesurer le temps par ce qui reste',
    hi: 'जो बचा है उससे समय जानना',
    id: 'Mengukur waktu dari yang tersisa',
    pt: 'Medir o tempo pelo que resta',
  },
  'label.stage': {
    ko: '탄소-14',
    en: 'Carbon-14',
    ja: '炭素14',
    zh: '碳-14',
    ar: 'الكربون-14',
    es: 'Carbono-14',
    fr: 'Carbone 14',
    hi: 'कार्बन-14',
    id: 'Karbon-14',
    pt: 'Carbono-14',
  },
  'label.view': {
    ko: '곡선 거꾸로 읽기',
    en: 'Reading the curve backward',
    ja: '曲線を逆向きに読む',
    zh: '反向读曲线',
    ar: 'قراءة المنحنى بالعكس',
    es: 'Leer la curva hacia atrás',
    fr: 'Lire la courbe à rebours',
    hi: 'वक्र को उल्टा पढ़ना',
    id: 'Membaca kurva mundur',
    pt: 'Ler a curva de trás para frente',
  },

  /** 시료 막대 위 · 아래 이름. 조사가 붙는 말이라 문안이다 (C1 판정 4). */
  'label.alive': {
    ko: '살아 있을 때',
    en: 'when alive',
    ja: '生きていたとき',
    zh: '活着时',
    ar: 'حين كان حيًّا',
    es: 'en vida',
    fr: 'du vivant',
    hi: 'जीवित अवस्था में',
    id: 'saat hidup',
    pt: 'em vida',
  },
  'label.sample': {
    ko: '시료',
    en: 'sample',
    ja: '試料',
    zh: '样品',
    ar: 'العيّنة',
    es: 'muestra',
    fr: 'échantillon',
    hi: 'नमूना',
    id: 'sampel',
    pt: 'amostra',
  },
  /** 축 이름. */
  'label.axisRatio': {
    ko: '남은 탄소-14 비율',
    en: 'carbon-14 remaining',
    ja: '残っている炭素14',
    zh: '剩余的碳-14',
    ar: 'الكربون-14 المتبقي',
    es: 'carbono-14 restante',
    fr: 'carbone 14 restant',
    hi: 'शेष कार्बन-14',
    id: 'karbon-14 tersisa',
    pt: 'carbono-14 restante',
  },
  'label.axisTime': {
    ko: '지난 시간 →',
    en: 'time elapsed →',
    ja: '経過時間 →',
    zh: '经过的时间 →',
    ar: 'الزمن المنقضي →',
    es: 'tiempo transcurrido →',
    fr: 'temps écoulé →',
    hi: 'बीता समय →',
    id: 'waktu berlalu →',
    pt: 'tempo decorrido →',
  },
  /** 세로축 눈금 — 수 · 분수는 표식이다 (C1 판정 3). */
  'label.one': {
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
  'label.fraction': {
    ko: '{n}/{d}',
    en: '{n}/{d}',
    ja: '{n}/{d}',
    zh: '{n}/{d}',
    ar: '{n}/{d}',
    es: '{n}/{d}',
    fr: '{n}/{d}',
    hi: '{n}/{d}',
    id: '{n}/{d}',
    pt: '{n}/{d}',
  },
  /** 되짚는 화살표 하나 = 반감기 하나. 값은 선언된 반감기를 그대로 끼운다 (S-piece 유효숫자). */
  'label.halfLife': {
    ko: '{half} 년',
    en: '{half} yr',
    ja: '{half} 年',
    zh: '{half} 年',
    ar: '{half} سنة',
    es: '{half} años',
    fr: '{half} ans',
    hi: '{half} वर्ष',
    id: '{half} tahun',
    pt: '{half} anos',
  },
  /** 읽어 낸 연대 — 선언된 정박값을 그대로 끼운다. */
  'label.age': {
    ko: '약 {age} 년',
    en: '≈ {age} years',
    ja: '≈ {age} 年',
    zh: '≈ {age} 年',
    ar: '≈ {age} سنة',
    es: '≈ {age} años',
    fr: '≈ {age} ans',
    hi: '≈ {age} वर्ष',
    id: '≈ {age} tahun',
    pt: '≈ {age} anos',
  },

  'caption.level': {

    ko: '시료에 남은 탄소-14 는 살아 있을 때의 {num}/{den} — 그 높이를 따라 곡선까지 간다',

    en: 'The sample keeps {num}/{den} of the carbon-14 it had when alive — follow that level across to the curve',

    ja: '試料には生きていたときの炭素14の{num}/{den}が残っている — その高さのまま横にたどって曲線まで行く',

    zh: '样品保留着活着时碳-14的{num}/{den}——沿着这个高度横向走到曲线',

    ar: 'تحتفظ العيّنة بـ {num}/{den} من الكربون-14 الذي كان فيها حين كانت حيّة — اتبع ذلك المستوى أفقيًا حتى المنحنى',

    es: 'La muestra conserva {num}/{den} del carbono-14 que tenía en vida — sigue ese nivel en horizontal hasta la curva',

    fr: 'L’échantillon garde {num}/{den} du carbone 14 qu’il avait de son vivant — suivez ce niveau à l’horizontale jusqu’à la courbe',

    hi: 'नमूने में जीवित अवस्था वाले कार्बन-14 का {num}/{den} बचा है — उसी ऊँचाई पर क्षैतिज चलकर वक्र तक जाइए',

    id: 'Sampel menyimpan {num}/{den} karbon-14 yang dimilikinya saat hidup — ikuti ketinggian itu mendatar sampai ke kurva',

    pt: 'A amostra guarda {num}/{den} do carbono-14 que tinha em vida — siga esse nível na horizontal até a curva',

  },
  'caption.drop': {
    ko: '곡선에 닿은 자리에서 곧장 내려오면 지난 시간이 나온다',
    en: 'From where it meets the curve, drop straight down to read the time elapsed',
    ja: '曲線に当たったところからまっすぐ下りると、経過時間が読める',
    zh: '从与曲线相交处竖直向下，就能读出经过的时间',
    ar: 'من نقطة التقائه بالمنحنى، انزل مباشرةً لتقرأ الزمن المنقضي',
    es: 'Desde donde toca la curva, baja en vertical para leer el tiempo transcurrido',
    fr: 'Là où il rencontre la courbe, descendez tout droit pour lire le temps écoulé',
    hi: 'जहाँ यह वक्र से मिलता है, वहाँ से सीधे नीचे उतरकर बीता समय पढ़िए',
    id: 'Dari titik pertemuannya dengan kurva, turun lurus ke bawah untuk membaca waktu yang berlalu',
    pt: 'De onde encontra a curva, desça em linha reta para ler o tempo decorrido',
  },
  'caption.count': {
    ko: '거꾸로 한 번 되짚을 때마다 비율이 두 배가 된다 — 한 번이 반감기 {half} 년',
    en: 'Each step back doubles the fraction — one step is one half-life, {half} years',
    ja: '一段さかのぼるごとに割合は2倍になる — 一段が半減期一つ、{half} 年',
    zh: '每往回退一步，比例就翻一倍——一步就是一个半衰期，{half} 年',
    ar: 'كل خطوة إلى الوراء تضاعف الكسر — الخطوة الواحدة عمر نصف واحد، {half} سنة',
    es: 'Cada paso atrás duplica la fracción — un paso es una semivida, {half} años',
    fr: 'Chaque pas en arrière double la fraction — un pas vaut une demi-vie, {half} ans',
    hi: 'हर कदम पीछे जाने पर अंश दोगुना होता है — एक कदम एक अर्ध-आयु है, {half} वर्ष',
    id: 'Setiap langkah mundur menggandakan pecahan — satu langkah adalah satu waktu paruh, {half} tahun',
    pt: 'Cada passo atrás dobra a fração — um passo é uma meia-vida, {half} anos',
  },
  'caption.age': {
    ko: '반감기 {n}번 — 이 생물은 약 {age} 년 전에 죽었다',
    en: '{n} half-lives — this organism died about {age} years ago',
    ja: '半減期{n}回 — この生物は約 {age} 年前に死んだ',
    zh: '{n} 个半衰期——这个生物大约在 {age} 年前死亡',
    ar: '{n} من أعمار النصف — مات هذا الكائن الحي قبل نحو {age} سنة',
    es: '{n} semividas — este organismo murió hace unos {age} años',
    fr: '{n} demi-vies — cet organisme est mort il y a environ {age} ans',
    hi: '{n} अर्ध-आयु — यह जीव लगभग {age} वर्ष पहले मरा था',
    id: '{n} waktu paruh — organisme ini mati sekitar {age} tahun lalu',
    pt: '{n} meias-vidas — este organismo morreu há cerca de {age} anos',
  },
} satisfies Record<string, LocalizedText>);

export type RadiometricDatingMessageKey = keyof typeof radiometricDatingMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RadiometricDatingMessageKey): LocalizedText => radiometricDatingMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RadiometricDatingMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다 (원칙 2). 읽는 곳은 `physics.readConstants`.
// ------------------------------------------------------------------------

/** 탄소-14 반감기(년). */
export const HALF_LIFE_YEARS = 5730;
/** 측정한 비율 = 분자 / 분모 (살아 있을 때를 1 로). 화면에 분수 그대로 띄운다. */
export const RATIO_NUMERATOR = 1;
export const RATIO_DENOMINATOR = 4;
/** 그 비율까지 걸린 반감기 수. 비율과 어긋나면 `readConstants` 가 던진다. */
export const HALF_LIVES = 2;
/** 읽어 낸 연대(년) — 화면에 띄우는 정박값. 반감기 × 횟수와 어긋나면 던진다. */
export const AGE_YEARS = 11460;

/**
 * 거꾸로 되짚는 단계 — 반감기 하나에 하나. 단계 수가 상수를 따라가지 못해(장부 G13)
 * `readConstants` 가 반감기 수의 올림과 이 길이가 같은지 확인한다.
 */
export const HOP_PHASES = ['hop-1', 'hop-2'] as const;

// ------------------------------------------------------------------------
// 배치 — 월드 단위는 임의. 원점은 지난 시간 0 · 비율 0.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 반감기 하나의 가로 길이(월드). */
  perHalfLife: 3,
  /** 비율 1 의 세로 길이(월드). */
  perRatio: 4,
  /** 가로축 끝(반감기 수). 읽은 자리 너머로 곡선이 조금 더 이어져야 「곡선 위의 한 점」 으로 읽힌다. */
  endHalfLives: 3.4,
  /** 세로축이 비율 1 위로 더 나가는 길이(월드). */
  axisOvershoot: 0.3,
} as const;

/** 시료 막대 — 세로축 왼쪽. 높이는 세로축과 같은 눈금이다(위 끝 = 살아 있을 때 = 1). */
export const BAR = { x0: -2.2, x1: -1.4 } as const;

/** 되짚는 화살표가 가로축 아래로 떨어진 거리(월드) · 연대 글자의 높이(월드). */
export const HOP_DROP = 0.5;
export const AGE_Y = -1.3;

/**
 * 고정 경계. 막대 이름 · 축 이름 · 되짚는 화살표 · 연대가 들어가게 처음부터 잡는다 (원칙 6).
 * 아래로 캡션 한 줄 자리를 더 잡는다 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: -3.0, maxX: 10.9, minY: -2.3, maxY: 4.7 } as const;

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const radiometricDatingSchema: BundleSchema = {
  id: RADIOMETRIC_DATING_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 읽는 동작은 한 번 보면 되고, 비율을 끌어 바꾸게 하면 연대 글자를
  // 계산해 반올림해야 해서 선언값 그대로 띄우는 약속이 깨진다 (NOTES (b)).
  parameters: [],
  stages: [
    {
      id: 'carbon-14',
      label: text('label.stage'),
      constants: {
        halfLifeYears: HALF_LIFE_YEARS,
        ratioNumerator: RATIO_NUMERATOR,
        ratioDenominator: RATIO_DENOMINATOR,
        halfLives: HALF_LIVES,
        ageYears: AGE_YEARS,
      },
    },
  ],
  environments: [],
  views: [{ id: 'read-backward', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 곡선이 반감기 셋 너머까지 이어진다. 아래로 화살표 · 연대 · 캡션. */
  canvas: { height: 420, minHeight: 360 },

  /** 쓴 순서대로 겹친다 — 축 · 곡선 위에 읽기 선, 그 위에 점과 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 읽기 선이 이미 곡선을 향해 나아가는 중이다 (S-piece). */
  startAt: 0.5,

  /**
   * 한 주기 — 9.5 초.
   *
   * - `level` — 시료 막대의 채움 높이에서 강조색 가로선이 곡선을 향해 자란다.
   * - `meet` — 곡선에 닿은 자리에 점이 선다.
   * - `drop` — 그 점에서 가로축까지 세로선이 내려온다.
   * - `hop-1` · `hop-2` — 가로축 아래에서 반감기 하나씩 거꾸로 되짚는 화살표가 자라고,
   *   점이 곡선을 거슬러 오른다(1/4 → 1/2 → 1).
   * - `age-in` · `age` — 내려온 자리 아래에 읽어 낸 연대가 뜨고 머문다.
   * - `clear` — 읽기 선 · 화살표 · 연대가 물러난다.
   */
  timeline: {
    phases: [
      { id: 'level', duration: 1.6, ease: 'smooth', caption: key('caption.level') },
      { id: 'meet', duration: 0.4, ease: 'smooth', caption: key('caption.level') },
      { id: 'drop', duration: 1.2, ease: 'smooth', caption: key('caption.drop') },
      ...HOP_PHASES.map((id) => ({ id, duration: 1.4, ease: 'smooth' as const, caption: key('caption.count') })),
      { id: 'age-in', duration: 0.5, ease: 'smooth', caption: key('caption.age') },
      { id: 'age', duration: 2.4, caption: key('caption.age') },
      { id: 'clear', duration: 0.6, ease: 'smooth', caption: key('caption.age') },
    ],
  },

  /** 슬롯 하나. 수는 스테이지 상수에서 만든 문자열을 state 가 들고 있다 (장부 G133). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: { num: 'caption.num', den: 'caption.den', half: 'caption.half', n: 'caption.n', age: 'caption.age' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 읽을 것은 눈금값이 아니라 읽는 경로다 (S-piece).

  messages: radiometricDatingMessages,
};
