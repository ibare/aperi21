// ========================================================================
// manometer — 선언
// ========================================================================
// 질문: U자관 압력계는 압력 차를 어떻게 보이고, 어떤 액체를 채워야 잘 읽히나.
//
// 가운데 기체 통에서 관이 양쪽으로 나가 두 U자관의 안쪽 팔에 이어진다. 바깥 팔은
// 바깥 공기에 열려 있다. 왼쪽 U자관에는 물, 오른쪽에는 수은이 들어 있다. 기체 쪽
// 압력이 오르면 **같은 압력 차**가 두 관의 안쪽 액면을 똑같이 누르고, 안쪽 액면이
// 밀려 내려간 만큼 바깥 액면이 올라간다. 두 액면의 높이 차 h = Δp / (ρ g) —
// 가벼운 물은 크게 벌어지고, 13.6 배 무거운 수은은 겨우 벌어진다.
//
// 이웃과 겹치지 않는다. 깊이에 정비례는 `hydrostatic-pressure`, 좁은 목에서 빨려
// 오르는 액주는 `venturi-effect`, 빨라진 만큼 내려가는 물기둥은 `bernoullis-principle`
// 의 몫이다. 이 조각은 **측정 장치** — 압력 차가 높이 차로 읽힌다는 것과 액체가
// 가벼울수록 잘 읽힌다는 것에 머문다. 대기압을 재는 수은 기둥은 `barometer` 가 한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:manometer` 와 문자 그대로 일치한다 (C4). */
export const MANOMETER_ID = 'manometer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 왼쪽 U자관 액체(물)의 밀도(kg/m³). */
export const RHO_LIGHT = 1000;
/** 오른쪽 U자관 액체(수은)의 밀도(kg/m³). */
export const RHO_HEAVY = 13600;
/** 중력 가속도(m/s²). */
export const G = 9.8;
/**
 * 기체 통이 바깥 공기보다 높아지는 압력 차의 최댓값(Pa). 물 20 cm 가 되도록 잡았다
 * (1960 = 1000 × 9.8 × 0.2) — 대기압의 2 % 쯤이라 실험실 U자관의 흔한 크기다.
 */
export const DP_MAX = 1960;

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 굽이 중심(곧은 팔이 끝나는 높이)이 y = 0 이다.
// ------------------------------------------------------------------------

/** 관 안쪽 폭의 절반(m). 안지름 18 mm. */
export const TUBE_HALF = 0.009;
/** 한 U자관의 두 팔 사이 거리의 절반 = 굽이 반지름(m). */
export const BEND_RADIUS = 0.07;
/** 기체 쪽 팔(안쪽)의 x — 가운데에서 떨어진 거리. 왼쪽 관은 음수 쪽이다. */
export const GAS_ARM_X = 0.18;
/** 바깥에 열린 팔의 x. */
export const OPEN_ARM_X = GAS_ARM_X + 2 * BEND_RADIUS;
/** 압력 차가 없을 때 두 액면의 높이. */
export const REST_LEVEL = 0.15;
/** 열린 팔의 위 끝. */
export const OPEN_TOP = 0.3;
/** 기체 통과 팔을 잇는 가로 관의 아래 · 위 벽 높이. */
export const PIPE_BOTTOM = 0.31;
export const PIPE_TOP = PIPE_BOTTOM + 2 * TUBE_HALF;
/** 기체 통 — 가운데 사각형의 반폭 · 바닥 · 천장. */
export const TANK_HALF = 0.08;
export const TANK_BOTTOM = 0.25;
export const TANK_TOP = 0.39;
/** 압력 차 최대일 때 액면을 누르는 화살표 길이(m). 길이가 압력 차에 비례한다. */
export const ARROW_MAX = 0.07;
/** 높이 차 치수선의 x — 열린 팔 바깥. */
export const BRACKET_X = OPEN_ARM_X + 0.04;
/** 액체 이름표 높이 — 굽이 아래. */
export const LIQUID_LABEL_Y = -0.115;
/** 「대기」 이름표 높이 — 열린 팔 위 끝 바로 위. */
export const AIR_LABEL_Y = OPEN_TOP + 0.03;

/**
 * 프레이밍은 주장의 일부다. 가로는 두 치수선까지, 세로는 기체 통 천장부터 굽이 아래
 * 이름표와 그 밑 캡션 줄까지(캡션 자리는 경계에 손으로 더했다 — G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.44, maxX: 0.44, minY: -0.19, maxY: 0.41 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 두 입구에 같은 압력(대기압)이 걸려 액면이 나란한 동안(초). */
export const REST = 1.6;
/** 기체 쪽 압력이 오르며 액면이 벌어지는 동안. */
export const PRESS = 2.6;
/** 압력 차가 최대로 머물러 두 관의 높이 차를 견주는 동안. 주장이 서는 자리라 길다. */
export const HOLD = 3.8;
/** 압력 차가 빠지며 액면이 다시 나란해지는 동안. */
export const RELEASE = 2.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const manometerMessages = Object.freeze({
  'label.title': {
    ko: '압력계',
    en: 'Manometer',
    ja: 'マノメーター',
    zh: '压强计',
    ar: 'المانومتر',
    es: 'Manómetro',
    fr: 'Manomètre',
    hi: 'मैनोमीटर',
    id: 'Manometer',
    pt: 'Manômetro',
  },
  'label.operation': {
    ko: '액주 차이로 재는 압력',
    en: 'Reading pressure from a liquid column',
    ja: '液柱で圧力を読む',
    zh: '用液柱读出压强',
    ar: 'قراءة الضغط من عمود سائل',
    es: 'Leer la presión en una columna de líquido',
    fr: 'Lire la pression sur une colonne de liquide',
    hi: 'द्रव-स्तंभ से दाब पढ़ना',
    id: 'Membaca tekanan dari kolom cairan',
    pt: 'Ler a pressão numa coluna de líquido',
  },
  'label.stage': {
    ko: '물과 수은 U자관',
    en: 'Water and mercury U-tubes',
    ja: '水と水銀の U 字管',
    zh: '水和水银的 U 形管',
    ar: 'أنابيب على شكل U بالماء والزئبق',
    es: 'Tubos en U de agua y de mercurio',
    fr: 'Tubes en U à eau et à mercure',
    hi: 'पानी और पारे की U-नलियाँ',
    id: 'Pipa U berisi air dan raksa',
    pt: 'Tubos em U de água e de mercúrio',
  },
  'label.view': {
    ko: '옆에서 본 압력계',
    en: 'Manometers from the side',
    ja: '横から見たマノメーター',
    zh: '从侧面看压强计',
    ar: 'المانومترات من الجانب',
    es: 'Los manómetros vistos de lado',
    fr: 'Les manomètres vus de côté',
    hi: 'बगल से दिखते मैनोमीटर',
    id: 'Manometer dari samping',
    pt: 'Os manômetros vistos de lado',
  },
  /** 도식 이름표. 값이 끼어들지 않는 한 단어지만 언어마다 다른 낱말이라 문안이다 (C1). */
  'label.gas': {
    ko: '기체',
    en: 'gas',
    ja: '気体',
    zh: '气体',
    ar: 'غاز',
    es: 'gas',
    fr: 'gaz',
    hi: 'गैस',
    id: 'gas',
    pt: 'gás',
  },
  'label.air': {
    ko: '대기',
    en: 'air',
    ja: '大気',
    zh: '大气',
    ar: 'الهواء',
    es: 'aire',
    fr: 'air',
    hi: 'वायु',
    id: 'udara',
    pt: 'ar',
  },
  'label.water': {
    ko: '물',
    en: 'water',
    ja: '水',
    zh: '水',
    ar: 'الماء',
    es: 'agua',
    fr: 'eau',
    hi: 'जल',
    id: 'air',
    pt: 'água',
  },
  'label.mercury': {
    ko: '수은',
    en: 'mercury',
    ja: '水銀',
    zh: '水银',
    ar: 'الزئبق',
    es: 'mercurio',
    fr: 'mercure',
    hi: 'पारा',
    id: 'raksa',
    pt: 'mercúrio',
  },
  'caption.rest': {
    ko: '기체 쪽과 바깥 공기의 압력이 같으면 두 액면의 높이가 같다',
    en: 'When the gas and the outside air press equally, both levels stand even',
    ja: '気体と外の空気が同じ強さで押すと、二つの液面は同じ高さにそろう',
    zh: '气体与外面的空气压强相等时，两边液面一样高',
    ar: 'حين يضغط الغاز والهواء الخارجي بالقدر نفسه، يستوي السطحان',
    es: 'Cuando el gas y el aire exterior presionan igual, los dos niveles quedan parejos',
    fr: 'Quand le gaz et l’air extérieur pressent autant l’un que l’autre, les deux niveaux sont à égalité',
    hi: 'जब गैस और बाहर की हवा बराबर दबाती हैं, तो दोनों तल एक ही ऊँचाई पर रहते हैं',
    id: 'Saat gas dan udara luar menekan sama kuat, kedua permukaan sama tinggi',
    pt: 'Quando o gás e o ar de fora pressionam igualmente, os dois níveis ficam iguais',
  },
  'caption.press': {
    ko: '기체 쪽 압력이 커지면 그쪽 액면이 밀려 내려가고 반대쪽 액면이 올라간다',
    en: 'As the gas pressure rises, it pushes its level down and the other level climbs',
    ja: '気体の圧力が上がると、その側の液面が押し下げられ、反対側の液面が上がる',
    zh: '气体压强增大时，把这一侧的液面压下去，另一侧的液面升起',
    ar: 'كلما ارتفع ضغط الغاز دفع سطحه إلى الأسفل وصعد السطح الآخر',
    es: 'Al subir la presión del gas, empuja su nivel hacia abajo y el otro nivel sube',
    fr: 'À mesure que la pression du gaz monte, elle pousse son niveau vers le bas et l’autre niveau grimpe',
    hi: 'गैस का दाब बढ़ने पर वह अपनी ओर का तल नीचे धकेलता है और दूसरा तल ऊपर चढ़ता है',
    id: 'Saat tekanan gas naik, permukaan di sisinya terdorong turun dan permukaan lainnya naik',
    pt: 'Conforme a pressão do gás sobe, ela empurra seu nível para baixo e o outro nível sobe',
  },
  'caption.hold': {
    ko: '같은 압력 차인데 가벼운 물은 높이 차가 크고, 무거운 수은은 겨우 벌어진다',
    en: 'The same pressure difference opens a tall gap in light water, barely one in heavy mercury',
    ja: '同じ圧力差でも、軽い水では高さの差が大きく開き、重い水銀ではわずかしか開かない',
    zh: '同样的压强差，在轻的水中拉开很大的高度差，在重的水银中几乎拉不开',
    ar: 'فرق الضغط نفسه يفتح فجوة كبيرة في الماء الخفيف، وبالكاد يفتحها في الزئبق الثقيل',
    es: 'La misma diferencia de presión abre un desnivel grande en el agua ligera y apenas uno en el mercurio pesado',
    fr: 'La même différence de pression ouvre un grand écart dans l’eau légère, à peine un dans le mercure lourd',
    hi: 'दाब का वही अंतर हल्के पानी में ऊँचाई का बड़ा अंतर खोल देता है, भारी पारे में बस ज़रा-सा',
    id: 'Beda tekanan yang sama membuka selisih tinggi yang besar pada air yang ringan, dan nyaris tidak ada pada raksa yang berat',
    pt: 'A mesma diferença de pressão abre um desnível grande na água leve e mal abre um no mercúrio pesado',
  },
  'caption.release': {
    ko: '압력 차가 빠지면 두 액면이 다시 나란해진다',
    en: 'As the difference drains away, the levels even out again',
    ja: '圧力差が抜けていくと、二つの液面は再びそろう',
    zh: '压强差消退后，两边液面又重新齐平',
    ar: 'مع تلاشي الفرق يستوي السطحان من جديد',
    es: 'Al desaparecer la diferencia, los niveles vuelven a igualarse',
    fr: 'À mesure que la différence s’évacue, les niveaux s’égalisent de nouveau',
    hi: 'अंतर घटते-घटते दोनों तल फिर बराबर हो जाते हैं',
    id: 'Saat selisihnya hilang, kedua permukaan kembali sama tinggi',
    pt: 'Conforme a diferença se esvai, os níveis voltam a se igualar',
  },
} satisfies Record<string, LocalizedText>);

export type ManometerMessageKey = keyof typeof manometerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ManometerMessageKey): LocalizedText => manometerMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ManometerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const manometerSchema: BundleSchema = {
  id: MANOMETER_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 압력이 오르고, 머물고, 빠진다.
  parameters: [],

  stages: [
    {
      id: 'water-mercury',
      label: text('label.stage'),
      constants: { rhoLight: RHO_LIGHT, rhoHeavy: RHO_HEAVY, g: G, dpMax: DP_MAX },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 물의 높이 차(20 cm)를 담을 만큼 세로를 쓴다. 가로는 두 관이 나란히 쓴다. */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 겹침이 판정 장치다. 기체 · 액체 면 위에 관 벽, 그 위에 기준선 · 화살표 · 치수선이
   * 와야 한다. 층 순서로는 `region`(액체)이 화살표 · 선 위로 올라온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 나란함 → 압력이 오름 → 머묾 → 빠짐. 오르고 빠지는 동안 두 관의 액면이
   * 함께 움직여, 같은 순간 같은 압력 차가 두 관에서 다른 높이 차가 되는 것이 보인다.
   */
  timeline: {
    phases: [
      { id: 'rest', duration: REST, caption: key('caption.rest') },
      { id: 'press', duration: PRESS, ease: 'smooth', caption: key('caption.press') },
      { id: 'hold', duration: HOLD, caption: key('caption.hold') },
      { id: 'release', duration: RELEASE, ease: 'smooth', caption: key('caption.release') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 기체 쪽 압력이 오르기 시작해 물의 액면이 벌어지고
   * 있는 자리에서 연다. 0 이면 나란한 액면이 먼저 보여 멈춘 그림으로 읽힌다.
   */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — Δp = ρgh 는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 임의의 미터가 아니라 **두 관의 높이 차
   * 둘**이라 거리 격자를 깔지 않고 치수선 둘만 긋는다.
   */

  messages: manometerMessages,
};
