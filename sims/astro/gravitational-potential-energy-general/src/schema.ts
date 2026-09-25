// ========================================================================
// gravitational-potential-energy-general — 선언
// ========================================================================
// 질문: 무한히 먼 곳을 0 으로 두면 중력 퍼텐셜 에너지는 왜 음수이고, 그 음수가 무슨 일을 하는가.
//
// 왼쪽은 U(r) = −GM/r 우물이다. 가로 한가운데가 행성 중심, 양쪽으로 거리 r. 맨 위 가로선이 0
// (무한히 먼 곳)이고 곡선은 어디서나 그 아래에 있으며 중심으로 갈수록 깊어진다. 역학적 에너지
// E 는 가로선 하나다. 물체(공)는 지금 거리 r 의 곡선 위에 얹혀 오른쪽 벽을 오르내린다.
//
// 오른쪽은 같은 축척의 궤도 그림이다. E 선이 우물 벽과 만나는 반지름을 점선 원으로 두른다 —
// 왼쪽 두 벽 사이의 폭과 원의 지름이 같다.
//
// 샷 셋. 근점(r = 1)에서 옆으로 쏜다.
//   E₁ < 0  선이 벽에 닿는다 — 공은 벽 안쪽 한 구간만 오가고, 궤도는 점선 원 안의 타원이다
//   E₂ < 0  근점에서 더 밀어 선을 올린다 — 벽이 밖으로 물러나지만 여전히 닿아 돌아온다
//   E₃ > 0  선을 0 위로 올린다 — 벽 어디에도 닿지 않아 공은 곡선을 타고 끝까지 올라가 빠져나간다
//
// 지표 근처 mgh(`gravitational-potential-energy`) · 곧장 위로 쏘는 문턱(`escape-velocity`) ·
// 속도별 궤적 비교(`orbital-velocity`)는 이 조각의 몫이 아니다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-potential-energy-general` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_POTENTIAL_ENERGY_GENERAL_ID = 'gravitational-potential-energy-general';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 무차원 단위: 길이는 쏘는 자리(근점)의 반지름, 에너지는 단위 질량당.
// ------------------------------------------------------------------------

/** 행성의 GM. 무차원 1 — 근점의 퍼텐셜이 U = −1 이다. */
export const GM = 1;
/** 쏘는 자리(근점)의 행성 중심으로부터 거리. */
export const LAUNCH_RADIUS = 1;
/** 행성 반지름. 근점보다 작다. */
export const PLANET_RADIUS = 0.4;
/**
 * 세 샷의 역학적 에너지(단위 질량당). 앞의 둘은 음수(묶임), 셋째는 양수(빠져나감).
 * 목록을 선언할 자리가 없어 이름 셋으로 흩는다 (장부 G105).
 */
export const ENERGY_1 = -0.4;
export const ENERGY_2 = -0.3;
export const ENERGY_3 = 0.1;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/** 월드 길이 per 무차원 길이. 우물의 가로축과 궤도 그림이 같은 배율을 쓴다. */
export const WORLD_PER_LENGTH = 1;
/** 월드 높이 per 무차원 에너지. 우물의 세로축. */
export const WORLD_PER_ENERGY = 5.5;
/** 빠져나가는 샷에서 물체가 이 거리에 닿는 순간 = 단계 진행도 `exitAt`. 둘 다 그림 밖이다. */
export const EXIT_RADIUS = 4.6;
export const EXIT_AT = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 단위.
// ------------------------------------------------------------------------

/** 우물의 가운데(행성 중심, r = 0)의 월드 x. */
export const WELL_X = -4.2;
/** 우물의 0 선(무한히 먼 곳)의 월드 y. */
export const ZERO_Y = 2.0;
/** 우물 판의 반폭(월드). 이 밖은 자른다. */
export const WELL_HALF = 4;
/** 우물이 잘리는 바닥(월드 y) — 곡선은 이 아래로 끝없이 깊어진다. */
export const FLOOR_Y = -3.8;

/** 궤도 그림의 행성 중심(월드). */
export const ORBIT_CENTER: readonly [number, number] = [4.6, -0.35];
/** 궤도 판의 반폭(월드). 이 밖은 자른다. */
export const ORBIT_HALF = 3.6;

/** 캡션이 서는 자리(월드). 두 판 위쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [-8.2, 3.9];

/**
 * 프레이밍은 주장의 일부다. 가로는 우물 판 왼쪽 끝부터 궤도 판 오른쪽 끝까지, 세로는
 * 우물 바닥부터 캡션까지. 매 프레임 같은 값이다 — 빠져나가는 물체는 판 밖에서 잘린다.
 */
export const SCENE_BOUNDS = { minX: -8.5, maxX: 8.4, minY: -4.0, maxY: 4.25 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergyGeneralMessages = Object.freeze({
  'label.title': {
    ko: '중력 퍼텐셜 에너지(일반)',
    en: 'Gravitational potential energy (general)',
    ja: '万有引力による位置エネルギー（一般）',
    zh: '引力势能（一般）',
    ar: 'طاقة الوضع الجاذبية (الحالة العامة)',
    es: 'Energía potencial gravitatoria (general)',
    fr: 'Énergie potentielle gravitationnelle (cas général)',
    hi: 'गुरुत्वीय स्थितिज ऊर्जा (व्यापक)',
    id: 'Energi potensial gravitasi (umum)',
    pt: 'Energia potencial gravitacional (geral)',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '무한대를 기준으로 한 음의 에너지',
    en: 'A negative energy measured from infinity',
    ja: '無限遠を基準にした負のエネルギー',
    zh: '以无穷远处为基准的负能量',
    ar: 'طاقة سالبة تُقاس من اللانهاية',
    es: 'Una energía negativa medida desde el infinito',
    fr: 'Une énergie négative mesurée depuis l’infini',
    hi: 'अनंत से मापी गई ऋणात्मक ऊर्जा',
    id: 'Energi negatif yang diukur dari tak hingga',
    pt: 'Uma energia negativa medida a partir do infinito',
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
    ko: '우물과 궤도',
    en: 'Well and orbit',
    ja: '井戸と軌道',
    zh: '势阱与轨道',
    ar: 'البئر والمدار',
    es: 'Pozo y órbita',
    fr: 'Puits et orbite',
    hi: 'कूप और कक्षा',
    id: 'Sumur dan orbit',
    pt: 'Poço e órbita',
  },
  /** 0 선의 이름. 조사가 붙는 말이라 문안이다 (C1). */
  'label.zero': {
    ko: '0 · 무한히 먼 곳',
    en: '0 · infinitely far',
    ja: '0 · 無限遠',
    zh: '0 · 无穷远处',
    ar: '0 · بعيد إلى ما لا نهاية',
    es: '0 · infinitamente lejos',
    fr: '0 · infiniment loin',
    hi: '0 · अनंत दूरी पर',
    id: '0 · jauh tak hingga',
    pt: '0 · infinitamente longe',
  },
  /** 곡선 이름 — 수식 표식이라 두 언어가 같다. */
  'label.curve': {
    ko: '−GM/r',
    en: '−GM/r',
    ja: '−GM/r',
    zh: '−GM/r',
    ar: '−GM/r',
    es: '−GM/r',
    fr: '−GM/r',
    hi: '−GM/r',
    id: '−GM/r',
    pt: '−GM/r',
  },
  /** 에너지 선 이름 — 부호 표식. 선이 0 아래인지 위인지에 따라 둘 중 하나. */
  'label.energyNegative': {
    ko: 'E < 0',
    en: 'E < 0',
    ja: 'E < 0',
    zh: 'E < 0',
    ar: 'E < 0',
    es: 'E < 0',
    fr: 'E < 0',
    hi: 'E < 0',
    id: 'E < 0',
    pt: 'E < 0',
  },
  'label.energyPositive': {
    ko: 'E > 0',
    en: 'E > 0',
    ja: 'E > 0',
    zh: 'E > 0',
    ar: 'E > 0',
    es: 'E > 0',
    fr: 'E > 0',
    hi: 'E > 0',
    id: 'E > 0',
    pt: 'E > 0',
  },
  'caption.bound': {
    ko: '에너지 선이 0 아래라 우물 벽에 닿는다 — 물체는 벽 안쪽(점선 원 안)만 오간다',
    en: 'The energy line sits below 0, so it meets the walls — the body only moves inside them (within the dashed circle)',
    ja: 'エネルギーの線が 0 より下にあるので井戸の壁に当たる — 物体は壁の内側（破線の円の中）だけを行き来する',
    zh: '能量线在 0 以下，所以与势阱壁相交 — 物体只在壁内（虚线圆内）往返',
    ar: 'خط الطاقة تحت 0، فيلتقي بالجدران — لا يتحرك الجسم إلا داخلها (ضمن الدائرة المتقطعة)',
    es: 'La línea de energía está por debajo de 0, así que toca las paredes — el cuerpo solo se mueve entre ellas (dentro del círculo discontinuo)',
    fr: 'La ligne d’énergie est sous 0, elle rencontre donc les parois — le corps ne se déplace qu’entre elles (dans le cercle en pointillés)',
    hi: 'ऊर्जा रेखा 0 से नीचे है, इसलिए वह दीवारों से मिलती है — पिंड केवल उनके भीतर (टूटी रेखा वाले वृत्त के अंदर) चलता है',
    id: 'Garis energi berada di bawah 0, jadi menyentuh dinding — benda hanya bergerak di dalamnya (di dalam lingkaran putus-putus)',
    pt: 'A linha de energia está abaixo de 0, então encontra as paredes — o corpo só se move entre elas (dentro do círculo tracejado)',
  },
  'caption.raise': {
    ko: '근점에서 더 세게 밀면 선이 올라가고 벽이 밖으로 물러난다',
    en: 'A harder push at the closest point lifts the line, and the walls step outward',
    ja: '最も近い点でもっと強く押すと線が上がり、壁が外へ退く',
    zh: '在最近点推得更猛，线就升高，壁向外退去',
    ar: 'دفعة أقوى عند أقرب نقطة ترفع الخط، فتتراجع الجدران إلى الخارج',
    es: 'Un empujón más fuerte en el punto más cercano sube la línea, y las paredes se retiran hacia fuera',
    fr: 'Une poussée plus forte au point le plus proche élève la ligne, et les parois s’écartent',
    hi: 'सबसे निकट बिंदु पर ज़ोर से धक्का देने पर रेखा ऊपर उठती है, और दीवारें बाहर खिसक जाती हैं',
    id: 'Dorongan lebih kuat di titik terdekat menaikkan garis, dan dinding bergeser ke luar',
    pt: 'Um empurrão mais forte no ponto mais próximo sobe a linha, e as paredes recuam para fora',
  },
  'caption.again': {
    ko: '더 멀리 가지만 선은 여전히 0 아래 — 벽에 막혀 다시 돌아온다',
    en: 'It goes farther, but the line is still below 0 — the walls turn it back',
    ja: 'より遠くまで行くが、線はまだ 0 より下 — 壁に阻まれて戻ってくる',
    zh: '它走得更远，但线仍在 0 以下 — 壁把它挡了回来',
    ar: 'يذهب أبعد، لكن الخط ما زال تحت 0 — فتردّه الجدران',
    es: 'Llega más lejos, pero la línea sigue por debajo de 0 — las paredes lo hacen volver',
    fr: 'Il va plus loin, mais la ligne reste sous 0 — les parois le renvoient',
    hi: 'वह और दूर जाता है, पर रेखा अब भी 0 से नीचे है — दीवारें उसे लौटा देती हैं',
    id: 'Benda pergi lebih jauh, tetapi garis masih di bawah 0 — dinding membaliknya kembali',
    pt: 'Vai mais longe, mas a linha continua abaixo de 0 — as paredes o fazem voltar',
  },
  'caption.cross': {
    ko: '선을 0 위로 올리면 우물 벽 어디에도 닿지 않는다',
    en: 'Lift the line above 0, and it meets the walls nowhere',
    ja: '線を 0 より上に上げると、井戸の壁のどこにも当たらない',
    zh: '把线升到 0 以上，它就与势阱壁处处不相交',
    ar: 'ارفع الخط فوق 0، فلا يلتقي بالجدران في أي مكان',
    es: 'Sube la línea por encima de 0 y no toca las paredes en ningún punto',
    fr: 'Élève la ligne au-dessus de 0, et elle ne rencontre les parois nulle part',
    hi: 'रेखा को 0 से ऊपर उठाओ, तो वह दीवारों से कहीं नहीं मिलती',
    id: 'Naikkan garis di atas 0, maka garis itu tidak menyentuh dinding di mana pun',
    pt: 'Suba a linha acima de 0, e ela não encontra as paredes em lugar nenhum',
  },
  'caption.escape': {
    ko: '막아 줄 벽이 없다 — 물체는 우물을 빠져나가 돌아오지 않는다',
    en: 'No wall to stop it — the body climbs out of the well and never returns',
    ja: '止める壁がない — 物体は井戸を抜け出し、二度と戻らない',
    zh: '没有壁能挡住它 — 物体爬出势阱，再也不回来',
    ar: 'لا جدار يوقفه — يتسلق الجسم خارج البئر ولا يعود أبدًا',
    es: 'No hay pared que lo detenga — el cuerpo sale del pozo y no vuelve nunca',
    fr: 'Aucune paroi pour l’arrêter — le corps sort du puits et ne revient jamais',
    hi: 'उसे रोकने को कोई दीवार नहीं — पिंड कूप से बाहर चढ़ जाता है और कभी नहीं लौटता',
    id: 'Tak ada dinding yang menahannya — benda memanjat keluar dari sumur dan tak pernah kembali',
    pt: 'Não há parede que o detenha — o corpo sai do poço e nunca mais volta',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalPotentialEnergyGeneralMessageKey = keyof typeof gravitationalPotentialEnergyGeneralMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalPotentialEnergyGeneralMessageKey): LocalizedText =>
  gravitationalPotentialEnergyGeneralMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalPotentialEnergyGeneralMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalPotentialEnergyGeneralSchema: BundleSchema = {
  id: GRAVITATIONAL_POTENTIAL_ENERGY_GENERAL_ID,
  label: text('label.title'),
  category: 'astro',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 선을 올려 보는 일은 세 샷의 자동 진행이 한다 — NOTES (b).
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        gm: GM,
        launchRadius: LAUNCH_RADIUS,
        planetRadius: PLANET_RADIUS,
        energy1: ENERGY_1,
        energy2: ENERGY_2,
        energy3: ENERGY_3,
        worldPerLength: WORLD_PER_LENGTH,
        worldPerEnergy: WORLD_PER_ENERGY,
        exitRadius: EXIT_RADIUS,
        exitAt: EXIT_AT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'well', label: text('label.view'), default: true }],

  /** 두 판을 가로로 나란히 — 세로가 비싸다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 0 선 · 에너지 선 · 곡선 · 지나간 구간 · 공의 겹침 순서가 뜻을 갖는다. */
  drawOrder: 'scene',

  /**
   * 샷 셋과 그 사이의 올리기 둘.
   *
   * - `shot1` · `shot2` — 묶인 궤도 한 바퀴. 근점에서 떠나 원점을 돌아 근점으로 온다. 한 바퀴의
   *   물리 시간을 단계 길이에 맞춘다(샷마다 배율이 다르다 — NOTES (b)).
   * - `raise1` · `raise2` — 근점에 선 채 에너지 선이 다음 샷의 값으로 올라간다.
   * - `shot3` — 빠져나가는 샷. 단계 진행도 `exitAt` 에서 거리 `exitRadius`(그림 밖)에 닿는다.
   * - `hold` — 물체는 떠났고 선은 0 위에 있다.
   * - `fade` — 흐려지고 다음 주기로 넘어간다.
   */
  timeline: {
    phases: [
      { id: 'shot1', duration: 6.5, caption: key('caption.bound') },
      { id: 'raise1', duration: 1.8, ease: 'smooth', caption: key('caption.raise') },
      { id: 'shot2', duration: 7.5, caption: key('caption.again') },
      { id: 'raise2', duration: 2.2, ease: 'smooth', caption: key('caption.cross') },
      { id: 'shot3', duration: 4.5, caption: key('caption.escape') },
      { id: 'hold', duration: 1.8, caption: key('caption.escape') },
      { id: 'fade', duration: 0.6, caption: key('caption.escape') },
    ],
  },

  /** 도착한 순간 첫 샷의 물체가 이미 근점을 떠나 벽을 오르고 있다. */
  startAt: 1.2,

  // 슬롯 하나. 두 판 위 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 읽을 것은 눈금의 값이 아니라 선이 벽에 닿는지다 —
   * 격자를 깔면 「몇 칸」 을 세는 다른 읽기가 끼어든다.
   */

  messages: gravitationalPotentialEnergyGeneralMessages,
};
