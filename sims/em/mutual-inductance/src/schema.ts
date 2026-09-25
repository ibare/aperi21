// ========================================================================
// mutual-inductance — 선언
// ========================================================================
// 질문: 한 코일의 전류가 이웃 코일에 무슨 일을 하는가.
//
// 같은 축 위에 두 코일이 떨어져 놓여 있다. 두 코일은 도선으로 이어져 있지 않다.
// 1차 코일에 흐르는 전류가 자기력선을 만들고, 그 가운데 축 가까운 몫이 2차 코일의
// 고리를 꿴다. 1차 전류를 **올리는** 동안 2차 코일에 + 전압이 생기고, 전류가
// **일정한** 동안 전압은 0, 전류를 **내리는** 동안 전압은 − 로 뒤집힌다. 전류가
// 크다는 것만으로는 이웃에 아무 일도 없다 — 전압은 전류가 바뀌는 동안에만 있다.
//
// 감은 수 비로 전압을 바꾸는 것은 이웃 `transformer` 의 몫이다. 자석을 밀어 넣는
// 빠르기는 `faradays-law`, 자기 코일의 전압은 `self-inductance` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mutual-inductance` 와 문자 그대로 일치한다 (C4). */
export const MUTUAL_INDUCTANCE_ID = 'mutual-inductance';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 상호 인덕턴스(H). 2차 전압 = 이 값 × 1차 전류가 바뀌는 빠르기. */
export const MUTUAL = 0.4;
/** 1차 전류를 다 올렸을 때의 값(A). 올리는 · 내리는 빠르기 = 이 값 ÷ 그 단계의 길이. */
export const CURRENT_MAX = 4;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전류(A) → I₁ 기록지 높이(월드). */
export const CURRENT_SCALE = 0.3;
/**
 * 전압(V) → V₂ 기록지 높이(월드). 기본값에서 올리기 · 내리기 동안의 2차 전압
 * (0.4 H × 4 A ÷ 1.6 s = 1 V)이 0 선 위아래 0.8 에 온다.
 */
export const VOLT_SCALE = 0.8;
/** 기록지 가로 — 1 초가 차지하는 월드 길이. 두 기록지가 같은 배율이라 같은 순간이 세로로 맞선다. */
export const SECONDS_TO_WORLD = 0.85;
/** 기록지가 담는 시간(초). 기록 단계 길이의 합(0.8 + 1.6 × 3 + 1.4 = 7 s)과 같다. */
export const GRAPH_SECONDS = 7;
/** 1차 전류 화살표 — 전류(A) → 화살표 길이(월드). */
export const ARROW_SCALE = 0.2;
/** 전류를 다 올렸을 때 위 · 아래 반쪽에 각각 그리는 자기력선 수. 선의 수가 전류에 비례한다. */
export const FIELD_LINES = 4;
/** 2차 계기 바늘 — 전압(V) → 바늘이 가운데에서 기우는 각(도). */
export const NEEDLE_DEG_PER_VOLT = 45;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 두 코일, 오른쪽에 두 기록지.
// ------------------------------------------------------------------------

/** 두 코일이 함께 놓인 축의 높이. */
export const AXIS_Y = 0.3;
/** 1차 · 2차 코일의 가운데 x. */
export const PRIMARY_X = -5.4;
export const SECONDARY_X = -3.2;
/** 코일 하나의 길이(첫 고리 ~ 끝 고리)와 고리 수. */
export const COIL_LENGTH = 0.5;
export const COIL_RINGS = 4;
/** 옆에서 비스듬히 본 고리 — 가로 반지름(깊이) · 세로 반지름. */
export const RING_RX = 0.13;
export const RING_RY = 0.8;

/**
 * 자기력선 — 1차 코일 한가운데를 지나는 높이(축에서, 고리 반지름 대비 몫)와 코일 바깥으로
 * 돌아오는 높이, 축을 따라 뻗는 거리. 축 가까운 선일수록 멀리 뻗어 2차 고리를 꿴다.
 * 안쪽 선과 바깥쪽 선의 값을 주고 그 사이는 고르게 나눈다.
 */
export const LINE_INNER_FRAC = 0.12;
export const LINE_OUTER_FRAC = 0.75;
export const LINE_INNER_RETURN = 1.75;
export const LINE_OUTER_RETURN = 1.1;
export const LINE_INNER_REACH = 3.4;
export const LINE_OUTER_REACH = 0.9;

/** 코일 이음선이 내려가는 높이 — 1차는 단자 둘, 2차는 계기로 간다. */
export const LEAD_Y = -1.55;
/** 2차 계기 — 판의 가운데(바늘 축) · 반지름. 판은 위로 반원이다. */
export const METER_X = -1.95;
export const METER_Y = -1.85;
export const METER_R = 0.42;

/** I₁ 기록지 원점(시간 0 · 전류 0)과 세로 높이. */
export const GRAPH_X = -0.8;
export const I_GRAPH_Y = 0.75;
export const I_GRAPH_H = 1.45;
/** V₂ 기록지 0 선의 높이와 위 · 아래로 뻗는 높이. */
export const V_GRAPH_Y = -1.25;
export const V_GRAPH_H = 1.05;

/**
 * 프레이밍 — 1차 자기력선 왼끝부터 기록지 축 이름 너머, 세로는 캡션 줄부터 자기력선 위까지.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -8.95, maxX: 5.6, minY: -2.75, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 1차 전류가 0 인 채로 시작하는 동안. */
export const REST = 0.8;
/** 1차 전류를 0 에서 다 올리는 동안. 곧게 올린다(빠르기 일정). */
export const RISE = 1.6;
/** 1차 전류가 일정한 동안. */
export const HOLD = 1.6;
/** 1차 전류를 0 으로 내리는 동안. 곧게 내린다. */
export const FALL = 1.6;
/** 1차 전류가 다시 0 인 채로 기록이 이어지는 동안. */
export const AFTER = 1.4;
/** 기록을 지우는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const mutualInductanceMessages = Object.freeze({
  'label.title': {
    ko: '상호 인덕턴스',
    en: 'Mutual inductance',
    ja: '相互インダクタンス',
    zh: '互感',
    ar: 'المحاثة المتبادلة',
    es: 'Inductancia mutua',
    fr: 'Inductance mutuelle',
    hi: 'अन्योन्य प्रेरकत्व',
    id: 'Induktansi bersama',
    pt: 'Indutância mútua',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '이웃 회로에 유도되는 기전력',
    en: 'An EMF induced in a neighbouring circuit',
    ja: '隣の回路に誘導される起電力',
    zh: '在相邻电路中感应出的电动势',
    ar: 'قوة دافعة كهربائية مستحثة في دائرة مجاورة',
    es: 'Una fem inducida en un circuito vecino',
    fr: 'Une f.é.m. induite dans un circuit voisin',
    hi: 'पास के परिपथ में प्रेरित विद्युत वाहक बल',
    id: 'GGL yang terinduksi pada rangkaian di dekatnya',
    pt: 'Uma fem induzida em um circuito vizinho',
  },
  'label.stage': {
    ko: '나란한 두 코일',
    en: 'Two coils on one axis',
    ja: '同じ軸上の二つのコイル',
    zh: '同轴的两个线圈',
    ar: 'ملفان على محور واحد',
    es: 'Dos bobinas en un mismo eje',
    fr: 'Deux bobines sur un même axe',
    hi: 'एक ही अक्ष पर दो कुंडलियाँ',
    id: 'Dua kumparan pada satu sumbu',
    pt: 'Duas bobinas no mesmo eixo',
  },
  'label.view': {
    ko: '코일과 기록',
    en: 'Coils and record',
    ja: 'コイルと記録',
    zh: '线圈与记录',
    ar: 'الملفان والسجل',
    es: 'Bobinas y registro',
    fr: 'Bobines et enregistrement',
    hi: 'कुंडलियाँ और रिकॉर्ड',
    id: 'Kumparan dan rekaman',
    pt: 'Bobinas e registro',
  },
  'label.primary': {
    ko: '1차 코일',
    en: 'primary',
    ja: '一次コイル',
    zh: '初级线圈',
    ar: 'الملف الابتدائي',
    es: 'primario',
    fr: 'primaire',
    hi: 'प्राथमिक',
    id: 'primer',
    pt: 'primário',
  },
  'label.secondary': {
    ko: '2차 코일',
    en: 'secondary',
    ja: '二次コイル',
    zh: '次级线圈',
    ar: 'الملف الثانوي',
    es: 'secundario',
    fr: 'secondaire',
    hi: 'द्वितीयक',
    id: 'sekunder',
    pt: 'secundário',
  },
  /** 전류 · 전압 · 부호 · 축 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.current': {
    ko: 'I₁',
    en: 'I₁',
    ja: 'I₁',
    zh: 'I₁',
    ar: 'I₁',
    es: 'I₁',
    fr: 'I₁',
    hi: 'I₁',
    id: 'I₁',
    pt: 'I₁',
  },
  'label.voltage': {
    ko: 'V₂',
    en: 'V₂',
    ja: 'V₂',
    zh: 'V₂',
    ar: 'V₂',
    es: 'V₂',
    fr: 'V₂',
    hi: 'V₂',
    id: 'V₂',
    pt: 'V₂',
  },
  'label.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'label.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
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
  'label.axisT': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  'caption.rest': {
    ko: '1차 코일에 전류가 없다 — 2차 코일의 전압도 0 이다',
    en: 'No current in the primary coil — no voltage across the secondary either',
    ja: '一次コイルに電流がない — 二次コイルにも電圧はない',
    zh: '初级线圈中没有电流 — 次级线圈两端也没有电压',
    ar: 'لا تيار في الملف الابتدائي — ولا جهد على الملف الثانوي أيضًا',
    es: 'No hay corriente en la bobina primaria — tampoco hay voltaje en la secundaria',
    fr: 'Aucun courant dans la bobine primaire — aucune tension aux bornes de la secondaire non plus',
    hi: 'प्राथमिक कुंडली में कोई धारा नहीं — द्वितीयक पर भी कोई वोल्टता नहीं',
    id: 'Tidak ada arus di kumparan primer — tidak ada tegangan pada kumparan sekunder juga',
    pt: 'Sem corrente na bobina primária — nem tensão na secundária',
  },
  'caption.rise': {
    ko: '1차 전류를 올린다 — 2차 고리를 꿰는 자기력선이 늘고, 2차에 + 전압이 생긴다',
    en: 'The primary current is ramped up — more field lines thread the secondary, and a + voltage appears across it',
    ja: '一次電流を増やす — 二次コイルを貫く磁力線が増え、二次に + の電圧が現れる',
    zh: '初级电流逐渐增大 — 穿过次级线圈的磁感线增多，次级两端出现 + 电压',
    ar: 'يُرفع تيار الملف الابتدائي تدريجيًا — تخترق خطوط مجال أكثر الملف الثانوي، ويظهر عليه جهد +',
    es: 'La corriente primaria sube poco a poco — más líneas de campo atraviesan la secundaria y aparece en ella un voltaje +',
    fr: 'Le courant primaire augmente progressivement — plus de lignes de champ traversent la secondaire, et une tension + apparaît à ses bornes',
    hi: 'प्राथमिक धारा धीरे-धीरे बढ़ाई जाती है — द्वितीयक से अधिक क्षेत्र रेखाएँ गुज़रती हैं और उस पर + वोल्टता आती है',
    id: 'Arus primer dinaikkan perlahan — lebih banyak garis medan menembus kumparan sekunder, dan muncul tegangan + padanya',
    pt: 'A corrente primária é aumentada aos poucos — mais linhas de campo atravessam a secundária, e surge nela uma tensão +',
  },
  'caption.hold': {
    ko: '1차 전류가 크지만 일정하다 — 자기력선이 그대로라 2차 전압은 0 이다',
    en: 'The primary current is large but steady — the field lines stay put, so the secondary voltage is zero',
    ja: '一次電流は大きいが一定 — 磁力線が変わらないので、二次の電圧はゼロだ',
    zh: '初级电流大但保持不变 — 磁感线不变，所以次级电压为零',
    ar: 'تيار الملف الابتدائي كبير لكنه ثابت — تبقى خطوط المجال على حالها، فيكون جهد الملف الثانوي صفرًا',
    es: 'La corriente primaria es grande pero constante — las líneas de campo no cambian, así que el voltaje secundario es cero',
    fr: 'Le courant primaire est fort mais constant — les lignes de champ ne bougent pas, donc la tension secondaire est nulle',
    hi: 'प्राथमिक धारा बड़ी पर स्थिर है — क्षेत्र रेखाएँ वैसी ही रहती हैं, इसलिए द्वितीयक वोल्टता शून्य है',
    id: 'Arus primer besar tetapi tetap — garis medan tidak berubah, jadi tegangan sekunder nol',
    pt: 'A corrente primária é grande mas constante — as linhas de campo não mudam, então a tensão secundária é zero',
  },
  'caption.fall': {
    ko: '1차 전류를 내린다 — 2차를 꿰는 자기력선이 줄고, 2차 전압이 − 로 뒤집힌다',
    en: 'The primary current is ramped down — fewer field lines thread the secondary, and its voltage flips to −',
    ja: '一次電流を減らす — 二次を貫く磁力線が減り、二次の電圧は − に反転する',
    zh: '初级电流逐渐减小 — 穿过次级的磁感线减少，次级电压反转为 −',
    ar: 'يُخفض تيار الملف الابتدائي تدريجيًا — تخترق خطوط مجال أقل الملف الثانوي، وينقلب جهده إلى −',
    es: 'La corriente primaria baja poco a poco — menos líneas de campo atraviesan la secundaria y su voltaje se invierte a −',
    fr: 'Le courant primaire diminue progressivement — moins de lignes de champ traversent la secondaire, et sa tension bascule à −',
    hi: 'प्राथमिक धारा धीरे-धीरे घटाई जाती है — द्वितीयक से कम क्षेत्र रेखाएँ गुज़रती हैं और उसकी वोल्टता − में पलट जाती है',
    id: 'Arus primer diturunkan perlahan — lebih sedikit garis medan menembus kumparan sekunder, dan tegangannya berbalik menjadi −',
    pt: 'A corrente primária é reduzida aos poucos — menos linhas de campo atravessam a secundária, e sua tensão se inverte para −',
  },
  'caption.after': {
    ko: '1차 전류가 0 에 멈추자 2차 전압도 0 — 전압은 전류가 바뀌는 동안에만 있었다',
    en: 'With the primary current back at zero, the secondary voltage is zero — it was there only while the current changed',
    ja: '一次電流がゼロに戻ると、二次の電圧もゼロ — 電圧は電流が変わっている間にだけあった',
    zh: '初级电流回到零，次级电压也为零 — 电压只在电流变化时才存在',
    ar: 'مع عودة تيار الملف الابتدائي إلى الصفر، يصبح جهد الملف الثانوي صفرًا — لم يكن موجودًا إلا أثناء تغيّر التيار',
    es: 'Con la corriente primaria de nuevo en cero, el voltaje secundario es cero — solo existió mientras la corriente cambiaba',
    fr: 'Le courant primaire revenu à zéro, la tension secondaire est nulle — elle n’existait que pendant que le courant variait',
    hi: 'प्राथमिक धारा के वापस शून्य पर आने पर द्वितीयक वोल्टता भी शून्य है — वह केवल तभी थी जब धारा बदल रही थी',
    id: 'Saat arus primer kembali nol, tegangan sekunder nol — tegangan itu hanya ada selama arus berubah',
    pt: 'Com a corrente primária de volta a zero, a tensão secundária é zero — ela só existiu enquanto a corrente mudava',
  },
  'caption.clear': {
    ko: '기록을 지운다',
    en: 'The record is cleared',
    ja: '記録を消す',
    zh: '记录被清除',
    ar: 'يُمسح السجل',
    es: 'Se borra el registro',
    fr: 'L’enregistrement est effacé',
    hi: 'रिकॉर्ड मिटा दिया जाता है',
    id: 'Rekaman dihapus',
    pt: 'O registro é apagado',
  },
} satisfies Record<string, LocalizedText>);

export type MutualInductanceMessageKey = keyof typeof mutualInductanceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MutualInductanceMessageKey): LocalizedText => mutualInductanceMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MutualInductanceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const mutualInductanceSchema: BundleSchema = {
  id: MUTUAL_INDUCTANCE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 1차 전류가 오르고 있고, 일정해지고, 내려간다.
  parameters: [],

  stages: [
    {
      id: 'coils',
      label: text('label.stage'),
      constants: {
        mutual: MUTUAL,
        currentMax: CURRENT_MAX,
        currentScale: CURRENT_SCALE,
        voltScale: VOLT_SCALE,
        secondsToWorld: SECONDS_TO_WORLD,
        graphSeconds: GRAPH_SECONDS,
        arrowScale: ARROW_SCALE,
        fieldLines: FIELD_LINES,
        needleDegPerVolt: NEEDLE_DEG_PER_VOLT,
      },
    },
  ],

  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 두 코일과 기록지 두 장이 나란하다. */
  canvas: { height: 340, minHeight: 300 },

  /** 자기력선은 고리 뒤 반쪽 위 · 앞 반쪽 아래, 바늘은 계기판 위에 와야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 0 → 올리기 → 일정 → 내리기 → 다시 0 → 기록 지우기.
   *
   * 1차 전류는 `rise` 동안 곧게 오르고 `fall` 동안 곧게 내린다(이징 없음) — 빠르기가
   * 일정해야 2차 전압이 한 높이로 선다. 올리기 · 내리기의 빠르기는 단계 길이에서 온다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'rise', duration: RISE, caption: key('caption.rise') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'fall', duration: FALL, caption: key('caption.fall') },
      { id: 'after', duration: AFTER, caption: key('caption.after') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.clear') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 1차 전류가 오르는 한가운데, 2차 전압이 이미 서 있다. */
  startAt: 1.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.2,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 기록지에 눈금 수를 달지 않는다 — 잴 것은 몇 볼트인가가
   * 아니라 2차 전압이 **언제 서고 어느 쪽으로 서는가** 다.
   */

  messages: mutualInductanceMessages,
};
