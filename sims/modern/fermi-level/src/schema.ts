// ========================================================================
// fermi-level — 선언
// ========================================================================
// 질문: 금속의 전자는 띠를 어디까지 채우는가? 그리고 온도가 오르면 그 경계는 어떻게 되는가?
//
// 답: **채워진 데까지의 경계가 페르미 준위다.** 절대 0도에서 전자는 가장 낮은 자리부터
// 빈틈없이 차서 페르미 준위에서 칼같이 끊기고, 그 위는 텅 비어 있다. 온도를 올리면 페르미
// 준위 바로 아래의 전자 몇 개만 바로 위로 올라가 경계가 kT 폭만큼 무뎌진다(페르미-디랙 분포).
// kT 는 페르미 준위 높이(수 eV)에 비하면 아주 작아서, 깊은 곳의 전자는 꼼짝하지 않는다.
//
// 화면에서는 왼쪽에 띠 전체(구리)를, 가운데에 페르미 준위 둘레를 확대한 준위 그림을,
// 오른쪽에 같은 세로축의 「채워질 확률」 곡선을 둔다. 0 K → 300 K → 1000 K → 0 K 를 돈다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:fermi-level` 와 문자 그대로 일치한다 (C4). */
export const FERMI_LEVEL_ID = 'fermi-level';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 페르미 준위 — 띠 바닥에서 잰 높이(eV). 구리 7 eV. */
export const FERMI_EV = 7;
/** 왼쪽 띠 그림의 꼭대기(eV). 페르미 준위 위의 빈 자리를 보일 만큼. */
export const BAND_TOP_EV = 10;
/** 데운 두 온도(K)와 그때의 kT(eV). kT = k_B T — 둘 사이 관계는 저작자가 맞춘다 (NOTES c, G143). */
export const TEMP_LOW_K = 300;
export const KT_LOW_EV = 0.026;
export const TEMP_HIGH_K = 1000;
export const KT_HIGH_EV = 0.086;
/**
 * 확대 창의 반높이(eV) — 페르미 준위 위아래로 이만큼을 가운데 그림에 편다. 1000 K 에서도
 * 창의 맨 아래 준위들은 그대로여야 「깊은 곳은 꼼짝하지 않는다」 가 창 안에서도 보인다.
 */
export const ZOOM_HALF_EV = 0.35;
/** 확대 창 안 준위 간격(eV). 페르미 준위는 두 준위 한가운데에 온다. 간격 자체는 표현이다. */
export const LEVEL_SPACING_EV = 0.05;
/** 준위 하나에 앉는 전자 자리 수. */
export const SLOTS_PER_LEVEL = 12;
/** 데웠을 때 어느 칸의 전자가 떠나고 어느 칸에 앉는지 고르는 시드 (S-sim — 같은 시각은 같은 화면). */
export const SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 좌표. 왼쪽 띠 전체 · 가운데 확대 창 · 오른쪽 채움 확률 곡선.
// ------------------------------------------------------------------------

/** 세 그림이 서는 바닥과 높이(월드). 세 그림이 같은 높이를 쓴다. */
export const PANEL_BOTTOM_Y = 0;
export const PANEL_TOP_Y = 3;
/** 왼쪽 띠 그림의 가운데 x · 반너비. */
export const WHOLE_X = -4.3;
export const WHOLE_HALF_W = 0.45;
/** 가운데 확대 창의 왼쪽 · 오른쪽 x. */
export const ZOOM_LEFT_X = -3.0;
export const ZOOM_RIGHT_X = 0;
/** 채움 확률 곡선의 f = 0 · f = 1 자리 x. */
export const CURVE_X0 = 0.55;
export const CURVE_X1 = 2.55;

/**
 * 프레이밍 — 왼쪽 띠 전체와 그 이름표, 오른쪽 kT 치수와 그 값. 아래는 그림 이름과 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -5.6, maxX: 4.9, minY: -1.05, maxY: 3.4 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fermiLevelMessages = Object.freeze({
  'label.title': {
    ko: '페르미 준위',
    en: 'Fermi level',
    ja: 'フェルミ準位',
    zh: '费米能级',
    ar: 'مستوى فيرمي',
    es: 'Nivel de Fermi',
    fr: 'Niveau de Fermi',
    hi: 'फर्मी स्तर',
    id: 'Tingkat Fermi',
    pt: 'Nível de Fermi',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '전자가 채워진 높이',
    en: 'How high the electrons fill',
    ja: '電子が満たす高さ',
    zh: '电子填充到多高',
    ar: 'إلى أي ارتفاع تمتلئ الإلكترونات',
    es: 'Hasta qué altura llenan los electrones',
    fr: 'Hauteur de remplissage des électrons',
    hi: 'इलेक्ट्रॉन कितनी ऊँचाई तक भरते हैं',
    id: 'Seberapa tinggi elektron terisi',
    pt: 'Até que altura os elétrons preenchem',
  },
  'label.stage': {
    ko: '구리',
    en: 'Copper',
    ja: '銅',
    zh: '铜',
    ar: 'النحاس',
    es: 'Cobre',
    fr: 'Cuivre',
    hi: 'ताँबा',
    id: 'Tembaga',
    pt: 'Cobre',
  },
  'label.view': {
    ko: '띠 그림과 채워질 확률',
    en: 'Band diagram and occupation',
    ja: 'バンド図と占有確率',
    zh: '能带图与占据概率',
    ar: 'مخطط النطاقات والإشغال',
    es: 'Diagrama de bandas y ocupación',
    fr: 'Diagramme de bandes et occupation',
    hi: 'बैंड आरेख और अधिभोग',
    id: 'Diagram pita dan okupasi',
    pt: 'Diagrama de bandas e ocupação',
  },

  /** 그림 이름. */
  'label.whole': {
    ko: '띠 전체',
    en: 'Whole band',
    ja: 'バンド全体',
    zh: '整个能带',
    ar: 'النطاق كاملًا',
    es: 'Banda completa',
    fr: 'Bande entière',
    hi: 'पूरा बैंड',
    id: 'Seluruh pita',
    pt: 'Banda inteira',
  },
  'label.zoom': {
    ko: '페르미 준위 둘레 (확대)',
    en: 'Around the Fermi level (magnified)',
    ja: 'フェルミ準位付近（拡大）',
    zh: '费米能级附近（放大）',
    ar: 'حول مستوى فيرمي (مكبَّر)',
    es: 'Alrededor del nivel de Fermi (ampliado)',
    fr: 'Autour du niveau de Fermi (agrandi)',
    hi: 'फर्मी स्तर के आसपास (आवर्धित)',
    id: 'Sekitar tingkat Fermi (diperbesar)',
    pt: 'Em torno do nível de Fermi (ampliado)',
  },
  'label.occupancy': {
    ko: '채워질 확률',
    en: 'Chance of being filled',
    ja: '占有される確率',
    zh: '被占据的概率',
    ar: 'احتمال الامتلاء',
    es: 'Probabilidad de estar ocupado',
    fr: 'Probabilité d’être occupé',
    hi: 'भरे होने की प्रायिकता',
    id: 'Peluang terisi',
    pt: 'Probabilidade de estar ocupado',
  },
  /** 기호 · 단위 · 눈금 숫자. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.fermi': {
    ko: 'E_F',
    en: 'E_F',
    ja: 'E_F',
    zh: 'E_F',
    ar: 'E_F',
    es: 'E_F',
    fr: 'E_F',
    hi: 'E_F',
    id: 'E_F',
    pt: 'E_F',
  },
  'label.energy': {
    ko: '{e} eV',
    en: '{e} eV',
    ja: '{e} eV',
    zh: '{e} eV',
    ar: '{e} eV',
    es: '{e} eV',
    fr: '{e} eV',
    hi: '{e} eV',
    id: '{e} eV',
    pt: '{e} eV',
  },
  'label.kT': {
    ko: 'kT = {e} eV',
    en: 'kT = {e} eV',
    ja: 'kT = {e} eV',
    zh: 'kT = {e} eV',
    ar: 'kT = {e} eV',
    es: 'kT = {e} eV',
    fr: 'kT = {e} eV',
    hi: 'kT = {e} eV',
    id: 'kT = {e} eV',
    pt: 'kT = {e} eV',
  },
  'label.temp': {
    ko: 'T = {t} K',
    en: 'T = {t} K',
    ja: 'T = {t} K',
    zh: 'T = {t} K',
    ar: 'T = {t} K',
    es: 'T = {t} K',
    fr: 'T = {t} K',
    hi: 'T = {t} K',
    id: 'T = {t} K',
    pt: 'T = {t} K',
  },
  'label.tempZero': {
    ko: 'T = 0 K',
    en: 'T = 0 K',
    ja: 'T = 0 K',
    zh: 'T = 0 K',
    ar: 'T = 0 K',
    es: 'T = 0 K',
    fr: 'T = 0 K',
    hi: 'T = 0 K',
    id: 'T = 0 K',
    pt: 'T = 0 K',
  },
  'label.zero': {
    ko: '0',
    en: '0',
    ja: '0',
    zh: '0',
    ar: '0',
    es: '0',
    fr: '0',
    hi: '0',
    id: '0',
    pt: '0',
  },
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

  'caption.cold': {
    ko: '절대 0도 — 전자가 페르미 준위까지 빈틈없이 차 있고 그 위는 텅 비어 있다. 채움이 칼같이 끊긴다.',
    en: 'At absolute zero the electrons fill every state up to the Fermi level and none above it. The filling stops with a sharp edge.',
    ja: '絶対零度では、電子はフェルミ準位までのすべての状態を満たし、その上は一つも占めない。占有は鋭い境界でとぎれる。',
    zh: '在绝对零度，电子填满费米能级以下的所有状态，其上一个也不占。填充在一道锐利的边界处截止。',
    ar: 'عند الصفر المطلق تملأ الإلكترونات كل الحالات حتى مستوى فيرمي ولا تشغل أيًّا فوقه. يتوقف الامتلاء عند حافة حادة.',
    es: 'En el cero absoluto, los electrones llenan todos los estados hasta el nivel de Fermi y ninguno por encima. El llenado se corta en un borde nítido.',
    fr: 'Au zéro absolu, les électrons occupent tous les états jusqu’au niveau de Fermi et aucun au-dessus. Le remplissage s’arrête sur un bord franc.',
    hi: 'परम शून्य पर इलेक्ट्रॉन फर्मी स्तर तक की हर अवस्था भर देते हैं और उसके ऊपर एक भी नहीं। भराव एक तीखे किनारे पर रुक जाता है।',
    id: 'Pada nol mutlak, elektron mengisi setiap keadaan hingga tingkat Fermi dan tidak satu pun di atasnya. Pengisian berhenti pada tepi yang tajam.',
    pt: 'No zero absoluto, os elétrons preenchem todos os estados até o nível de Fermi e nenhum acima dele. O preenchimento termina numa borda nítida.',
  },
  'caption.warm': {
    ko: '상온으로 데우면 페르미 준위 바로 아래의 전자 몇 개만 바로 위로 올라간다. 경계가 kT 폭만큼 무뎌진다.',
    en: 'Warm it to room temperature and only a few electrons just below the Fermi level move just above it. The edge blurs by about kT.',
    ja: '室温まで温めると、フェルミ準位のすぐ下にある電子のうち数個だけがすぐ上へ移る。境界が kT ほどの幅でぼやける。',
    zh: '加热到室温，只有费米能级正下方的少数电子跃到正上方。边界模糊了约 kT 的宽度。',
    ar: 'عند تسخينه إلى درجة حرارة الغرفة تنتقل بضعة إلكترونات فقط من تحت مستوى فيرمي مباشرة إلى فوقه مباشرة. تتشوش الحافة بمقدار kT تقريبًا.',
    es: 'Al calentarlo a temperatura ambiente, solo unos pocos electrones justo por debajo del nivel de Fermi pasan justo por encima. El borde se difumina en unos kT.',
    fr: 'Chauffé à température ambiante, seuls quelques électrons juste sous le niveau de Fermi passent juste au-dessus. Le bord s’estompe sur environ kT.',
    hi: 'कमरे के ताप तक गर्म करने पर फर्मी स्तर के ठीक नीचे के केवल कुछ इलेक्ट्रॉन ठीक ऊपर चले जाते हैं। किनारा लगभग kT जितना धुँधला हो जाता है।',
    id: 'Hangatkan hingga suhu ruang, dan hanya beberapa elektron tepat di bawah tingkat Fermi berpindah tepat ke atasnya. Tepinya kabur sekitar kT.',
    pt: 'Aquecido até a temperatura ambiente, só alguns elétrons logo abaixo do nível de Fermi passam para logo acima dele. A borda se esfuma em cerca de kT.',
  },
  'caption.hot': {
    ko: '더 뜨겁게 하면 무뎌지는 폭이 kT 를 따라 넓어진다. 그래도 kT 는 페르미 준위 높이에 비하면 아주 작아, 깊은 곳의 전자는 꼼짝하지 않는다.',
    en: 'Hotter still, the blur widens with kT. But kT is tiny next to the Fermi energy, so the electrons deep below never move.',
    ja: 'さらに熱くすると、ぼやける幅が kT とともに広がる。だが kT はフェルミエネルギーに比べてごく小さく、深いところの電子はまったく動かない。',
    zh: '再热一些，模糊的宽度随 kT 变宽。但 kT 与费米能相比非常小，深处的电子始终不动。',
    ar: 'وبمزيد من التسخين يتسع التشوش مع kT. لكن kT ضئيلة جدًّا مقارنة بطاقة فيرمي، فلا تتحرك الإلكترونات العميقة أبدًا.',
    es: 'Aún más caliente, el difuminado se ensancha con kT. Pero kT es diminuto frente a la energía de Fermi, así que los electrones profundos nunca se mueven.',
    fr: 'Plus chaud encore, le flou s’élargit avec kT. Mais kT est minuscule devant l’énergie de Fermi, si bien que les électrons profonds ne bougent jamais.',
    hi: 'और गर्म करने पर धुँधलापन kT के साथ चौड़ा होता है। पर फर्मी ऊर्जा की तुलना में kT बहुत छोटा है, इसलिए गहराई के इलेक्ट्रॉन कभी नहीं हिलते।',
    id: 'Lebih panas lagi, kekaburan melebar seiring kT. Namun kT sangat kecil dibandingkan energi Fermi, sehingga elektron di kedalaman tidak pernah bergerak.',
    pt: 'Mais quente ainda, o esfumado se alarga com kT. Mas kT é minúsculo perto da energia de Fermi, então os elétrons lá no fundo nunca se movem.',
  },
  'caption.cool': {
    ko: '식히면 올라갔던 전자가 빈자리로 돌아와 경계가 다시 날카로워진다.',
    en: 'Cool it down and the raised electrons drop back into the gaps; the edge turns sharp again.',
    ja: '冷やすと、上がった電子が空いた場所へ戻り、境界が再び鋭くなる。',
    zh: '冷却后，升上去的电子落回空位，边界重新变得锐利。',
    ar: 'عند تبريده تعود الإلكترونات المرتفعة إلى الفراغات، وتصبح الحافة حادة من جديد.',
    es: 'Al enfriarlo, los electrones que subieron vuelven a caer en los huecos; el borde vuelve a ser nítido.',
    fr: 'Quand on le refroidit, les électrons montés retombent dans les places vides ; le bord redevient net.',
    hi: 'ठंडा करने पर ऊपर गए इलेक्ट्रॉन खाली जगहों में लौट आते हैं; किनारा फिर से तीखा हो जाता है।',
    id: 'Dinginkan, dan elektron yang naik turun kembali ke celah-celah kosong; tepinya kembali tajam.',
    pt: 'Ao resfriá-lo, os elétrons que subiram voltam às lacunas; a borda fica nítida de novo.',
  },
} satisfies Record<string, LocalizedText>);

export type FermiLevelMessageKey = keyof typeof fermiLevelMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FermiLevelMessageKey): LocalizedText => fermiLevelMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FermiLevelMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fermiLevelSchema: BundleSchema = {
  id: FERMI_LEVEL_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'copper',
      label: text('label.stage'),
      constants: {
        fermiEv: FERMI_EV,
        bandTopEv: BAND_TOP_EV,
        tempLowK: TEMP_LOW_K,
        kTLowEv: KT_LOW_EV,
        tempHighK: TEMP_HIGH_K,
        kTHighEv: KT_HIGH_EV,
        zoomHalfEv: ZOOM_HALF_EV,
        levelSpacingEv: LEVEL_SPACING_EV,
        slotsPerLevel: SLOTS_PER_LEVEL,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'bands', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 세 그림이 나란히. 세로는 확대 창의 준위 열네 줄이 정한다. */
  canvas: { height: 400, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 띠 · 준위 · 창 테두리 · 전자 · 페르미 준위 · 곡선 · 이름표.
   * 페르미 준위 점선이 전자 점 위를 지나야 경계로 읽힌다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 절대 0도의 날카로운 경계가 서 있다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 13 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `cold` — 절대 0도. 채움이 페르미 준위에서 칼같이 끊긴다.
   * - `warm` · `warmHold` — 상온(`tempLowK`)으로 데운다. 페르미 준위 바로 아래 전자 몇 개가 바로 위로
   *   오르고, 곡선의 모서리가 kT 폭으로 무뎌진다.
   * - `hot` · `hotHold` — 더 뜨겁게(`tempHighK`). 더 많은 전자가 오르고 무뎌진 폭이 넓어진다.
   * - `cool` · `coolHold` — 절대 0도로 식힌다. 올라갔던 전자가 제자리로 돌아온다. 다음 주기의 `cold` 로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'cold', duration: 2.6, caption: key('caption.cold') },
      { id: 'warm', duration: 1.3, ease: 'smooth', caption: key('caption.warm') },
      { id: 'warmHold', duration: 2.4, caption: key('caption.warm') },
      { id: 'hot', duration: 1.5, ease: 'smooth', caption: key('caption.hot') },
      { id: 'hotHold', duration: 3.0, caption: key('caption.hot') },
      { id: 'cool', duration: 1.4, ease: 'smooth', caption: key('caption.cool') },
      { id: 'coolHold', duration: 0.8, caption: key('caption.cool') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: fermiLevelMessages,
};
