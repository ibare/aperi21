// ========================================================================
// mass-spring-system — 선언
// ========================================================================
// 질문: 용수철에 매단 추가 한 번 오가는 시간은 무엇이 정하는가 — 얼마나 멀리
// 당겼는가, 얼마나 무거운가?
//
// 답: 질량이 정하고 진폭은 상관없다. 같은 용수철에서 **질량을 네 배로 하면 주기가
// 두 배**이고, 두 배 멀리 당긴 추도 같은 순간에 돌아온다 (T = 2π√(m/k)).
//
// 화면에서는 같은 용수철 셋이 동시에 놓인다. 위 둘(같은 질량, 진폭 A · 2A)은 늘
// 같은 순간 출발 자리로 돌아오고, 아래(네 배 질량)는 그 두 번에 한 번 돌아온다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:mass-spring-system` 와 문자 그대로 일치한다 (C4). */
export const MASS_SPRING_SYSTEM_ID = 'mass-spring-system';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 용수철 상수(N/m). 세 레인이 모두 같은 용수철이다. */
export const SPRING_K = 10;
/** 가벼운 추의 질량(kg). 위 두 레인. */
export const LIGHT_MASS = 0.4;
/** 무거운 추의 질량(kg). 가벼운 추의 네 배. */
export const HEAVY_MASS = 1.6;
/** 작은 진폭(m). 위 · 아래 레인. */
export const AMPLITUDE = 0.45;
/** 큰 진폭(m). 가운데 레인 — 작은 진폭의 두 배. */
export const WIDE_AMPLITUDE = 0.9;

/** 무거운 추의 주기(s). 시간표의 흔들림 단계 길이가 이 값이다 — 아래 `timeline` 참고. */
export const HEAVY_PERIOD = 2 * Math.PI * Math.sqrt(HEAVY_MASS / SPRING_K);

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 추가 쉬는 자리(중심)의 x.
// ------------------------------------------------------------------------

/** 용수철을 거는 벽의 x. */
export const WALL_X = -2.3;
/** 가벼운 추의 한 변(m). 무거운 추는 넓이가 질량에 비례하도록 √(M/m) 배다. */
export const LIGHT_SIDE = 0.24;

/** 한 레인 — 높이와, 스테이지 상수 중 어느 질량 · 진폭을 쓰는지. */
export interface LaneDef {
  id: string;
  /** 추 중심의 y. */
  y: number;
  mass: 'lightMass' | 'heavyMass';
  amplitude: 'amplitude' | 'wideAmplitude';
  /** 벽 왼쪽 이름표(질량 기호). */
  massLabel: MassSpringSystemMessageKey;
  /** 진폭 치수선 글자. */
  ampLabel: MassSpringSystemMessageKey;
}

export const LANES: readonly LaneDef[] = [
  { id: 'light', y: 0.95, mass: 'lightMass', amplitude: 'amplitude', massLabel: 'label.massLight', ampLabel: 'label.ampSmall' },
  { id: 'wide', y: 0.3, mass: 'lightMass', amplitude: 'wideAmplitude', massLabel: 'label.massLight', ampLabel: 'label.ampWide' },
  { id: 'heavy', y: -0.42, mass: 'heavyMass', amplitude: 'amplitude', massLabel: 'label.massHeavy', ampLabel: 'label.ampSmall' },
];

/** 돌아온 횟수 점 줄의 첫 점 x 와 점 간격(m). 가운데 레인이 가장 멀리 가는 자리(1.02)보다 오른쪽. */
export const COUNT_X = 1.36;
export const COUNT_GAP = 0.16;

/**
 * 프레이밍 — 왼쪽은 질량 이름표, 오른쪽은 돌아온 횟수 점 줄, 아래는 캡션 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -2.72, maxX: 1.98, minY: -1.0, maxY: 1.32 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const massSpringSystemMessages = Object.freeze({
  'label.title': {
    ko: '용수철 진자',
    en: 'Mass on a spring',
    ja: 'ばね振り子',
    zh: '弹簧振子',
    ar: 'كتلة معلّقة بنابض',
    es: 'Masa en un resorte',
    fr: 'Masse suspendue à un ressort',
    hi: 'स्प्रिंग से लटका पिंड',
    id: 'Beban pada pegas',
    pt: 'Massa presa a uma mola',
  },
  'label.operation': {
    ko: '질량과 탄성 계수가 정하는 주기',
    en: 'The period set by mass and spring constant',
    ja: '質量とばね定数で決まる周期',
    zh: '由质量和劲度系数决定的周期',
    ar: 'الدور الذي تحدده الكتلة وثابت النابض',
    es: 'El periodo que fijan la masa y la constante del resorte',
    fr: 'La période fixée par la masse et la raideur du ressort',
    hi: 'द्रव्यमान और स्प्रिंग नियतांक से तय होने वाला आवर्तकाल',
    id: 'Periode yang ditentukan oleh massa dan konstanta pegas',
    pt: 'O período definido pela massa e pela constante elástica',
  },
  'label.stage': {
    ko: '같은 용수철 셋',
    en: 'Three identical springs',
    ja: '同じばね三つ',
    zh: '三根相同的弹簧',
    ar: 'ثلاثة نوابض متماثلة',
    es: 'Tres resortes idénticos',
    fr: 'Trois ressorts identiques',
    hi: 'तीन एक जैसी स्प्रिंगें',
    id: 'Tiga pegas identik',
    pt: 'Três molas idênticas',
  },
  'label.view': {
    ko: '나란한 세 레인',
    en: 'Three lanes',
    ja: '並んだ三つのレーン',
    zh: '三条并排的通道',
    ar: 'ثلاثة مسارات',
    es: 'Tres carriles',
    fr: 'Trois couloirs',
    hi: 'तीन पंक्तियाँ',
    id: 'Tiga lajur',
    pt: 'Três faixas',
  },

  /** 질량 · 진폭 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.massLight': {
    ko: 'm',
    en: 'm',
    ja: 'm',
    zh: 'm',
    ar: 'm',
    es: 'm',
    fr: 'm',
    hi: 'm',
    id: 'm',
    pt: 'm',
  },
  'label.massHeavy': {
    ko: '4m',
    en: '4m',
    ja: '4m',
    zh: '4m',
    ar: '4m',
    es: '4m',
    fr: '4m',
    hi: '4m',
    id: '4m',
    pt: '4m',
  },
  'label.ampSmall': {
    ko: 'A',
    en: 'A',
    ja: 'A',
    zh: 'A',
    ar: 'A',
    es: 'A',
    fr: 'A',
    hi: 'A',
    id: 'A',
    pt: 'A',
  },
  'label.ampWide': {
    ko: '2A',
    en: '2A',
    ja: '2A',
    zh: '2A',
    ar: '2A',
    es: '2A',
    fr: '2A',
    hi: '2A',
    id: '2A',
    pt: '2A',
  },

  'caption.hold': {
    ko: '같은 용수철 셋. 아래 추만 네 배 무겁고, 가운데 추만 두 배 멀리 당겨 두었다.',
    en: 'Three identical springs. Only the bottom mass is four times heavier; only the middle one is pulled twice as far.',
    ja: '同じばね三つ。下のおもりだけ四倍重く、真ん中のおもりだけ二倍遠くまで引いてある。',
    zh: '三根相同的弹簧。只有下面的物块重四倍；只有中间的物块被拉开两倍远。',
    ar: 'ثلاثة نوابض متماثلة. الكتلة السفلى وحدها أثقل بأربع مرات؛ والوسطى وحدها سُحبت ضعف المسافة.',
    es: 'Tres resortes idénticos. Solo la masa de abajo es cuatro veces más pesada; solo la del medio está estirada el doble.',
    fr: 'Trois ressorts identiques. Seule la masse du bas est quatre fois plus lourde ; seule celle du milieu est tirée deux fois plus loin.',
    hi: 'तीन एक जैसी स्प्रिंगें। केवल नीचे वाला पिंड चार गुना भारी है; केवल बीच वाला दोगुनी दूरी तक खींचा गया है।',
    id: 'Tiga pegas identik. Hanya beban bawah yang empat kali lebih berat; hanya beban tengah yang ditarik dua kali lebih jauh.',
    pt: 'Três molas idênticas. Só a massa de baixo é quatro vezes mais pesada; só a do meio foi puxada o dobro da distância.',
  },
  'caption.swingA': {
    ko: '위의 두 추는 당긴 거리가 달라도 같은 순간 출발 자리로 돌아온다 — 돌아올 때마다 오른쪽에 점이 하나씩 찍힌다.',
    en: 'The top two return to where they started at the same instant, even though one was pulled twice as far — each return adds a dot on the right.',
    ja: '上の二つは、一方が二倍遠くまで引かれていても、同じ瞬間に出発点へ戻る — 戻るたびに右側に点が一つ打たれる。',
    zh: '上面两个物块虽然有一个被拉开两倍远，却在同一瞬间回到出发位置 — 每回来一次，右边就多一个点。',
    ar: 'تعود الكتلتان العلويتان إلى نقطة انطلاقهما في اللحظة نفسها، مع أن إحداهما سُحبت ضعف المسافة — وكل عودة تضيف نقطة على اليمين.',
    es: 'Las dos de arriba vuelven a su punto de partida en el mismo instante, aunque una se estiró el doble — cada regreso añade un punto a la derecha.',
    fr: 'Les deux du haut reviennent à leur point de départ au même instant, bien que l’une ait été tirée deux fois plus loin — chaque retour ajoute un point à droite.',
    hi: 'ऊपर के दोनों पिंड एक ही क्षण अपनी शुरुआती जगह पर लौटते हैं, भले ही एक को दोगुनी दूरी तक खींचा गया था — हर वापसी पर दाईं ओर एक बिंदु जुड़ता है।',
    id: 'Dua beban atas kembali ke titik awalnya pada saat yang sama, meski salah satunya ditarik dua kali lebih jauh — setiap kali kembali, satu titik bertambah di kanan.',
    pt: 'As duas de cima voltam ao ponto de partida no mesmo instante, embora uma tenha sido puxada o dobro da distância — cada volta acrescenta um ponto à direita.',
  },
  'caption.swingB': {
    ko: '네 배 무거운 추가 한 번 오가는 동안 가벼운 추는 두 번 오간다.',
    en: 'While the four-times-heavier mass goes back and forth once, the light ones do it twice.',
    ja: '四倍重いおもりが一往復する間に、軽いおもりは二往復する。',
    zh: '四倍重的物块往返一次的时间里，轻的物块往返两次。',
    ar: 'بينما تذهب الكتلة الأثقل بأربع مرات وتعود مرة واحدة، تفعل الخفيفتان ذلك مرتين.',
    es: 'Mientras la masa cuatro veces más pesada va y viene una vez, las ligeras lo hacen dos veces.',
    fr: 'Pendant que la masse quatre fois plus lourde fait un aller-retour, les légères en font deux.',
    hi: 'जितनी देर में चार गुना भारी पिंड एक बार आता-जाता है, उतनी देर में हल्के पिंड दो बार आते-जाते हैं।',
    id: 'Selama beban yang empat kali lebih berat bolak-balik sekali, beban-beban ringan bolak-balik dua kali.',
    pt: 'Enquanto a massa quatro vezes mais pesada vai e volta uma vez, as leves fazem isso duas vezes.',
  },
  'caption.together': {
    ko: '네 번과 두 번 — 세 추가 다시 함께 출발 자리에 섰다.',
    en: 'Four and two — all three are back at the start together.',
    ja: '四回と二回 — 三つのおもりがまたそろって出発点に立った。',
    zh: '四次与两次 — 三个物块又一起回到了出发位置。',
    ar: 'أربع مرات ومرتان — عادت الكتل الثلاث معًا إلى نقطة البداية.',
    es: 'Cuatro y dos — las tres vuelven a estar juntas en el punto de partida.',
    fr: 'Quatre et deux — les trois sont revenues ensemble au départ.',
    hi: 'चार और दो — तीनों पिंड फिर एक साथ शुरुआती जगह पर हैं।',
    id: 'Empat dan dua — ketiga beban kembali bersama di titik awal.',
    pt: 'Quatro e dois — as três estão de volta juntas ao ponto de partida.',
  },
} satisfies Record<string, LocalizedText>);

export type MassSpringSystemMessageKey = keyof typeof massSpringSystemMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MassSpringSystemMessageKey): LocalizedText => massSpringSystemMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MassSpringSystemMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const massSpringSystemSchema: BundleSchema = {
  id: MASS_SPRING_SYSTEM_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-springs',
      label: text('label.stage'),
      constants: {
        springK: SPRING_K,
        lightMass: LIGHT_MASS,
        heavyMass: HEAVY_MASS,
        amplitude: AMPLITUDE,
        wideAmplitude: WIDE_AMPLITUDE,
      },
    },
  ],
  environments: [],
  views: [{ id: 'lanes', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 레인 셋이 가로로 달린다. 세로는 레인 셋과 캡션 한 줄. */
  canvas: { height: 400, minHeight: 352 },

  /**
   * 쓴 순서대로 겹친다 — 바닥 · 눈금 · 용수철을 먼저, 추를 나중에, 돌아옴 섬광을 맨 위에.
   * 층 순서로는 섬광(`trace`)이 추(`body`) 아래로 들어갈 수 있다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 셋이 흔들리는 중이다 (S-piece). hold 1 초 + 흔들림 0.3 초. */
  startAt: 1.3,

  /**
   * 한 주기 = 붙잡음 + 무거운 추 두 주기 + 모임.
   *
   * - `hold` — 세 추를 출발 자리에 붙잡아 둔다. 진폭 치수선(A · 2A)이 이때만 보인다.
   * - `swingA` · `swingB` — 셋을 동시에 놓는다. 각 단계의 길이가 **무거운 추의 한 주기**라
   *   단계가 끝날 때마다 셋이 모두 출발 자리에 온다. 가벼운 추는 단계마다 두 번 돌아온다.
   *   추의 자리는 물리 시계(단계 시작부터 흐른 초)로 계산하고 진행도로 늘이지 않는다.
   * - `together` — 셋이 출발 자리에 모인 채 돌아온 횟수(4 · 4 · 2)를 보인다.
   * - `clear` — 점이 옅어지고 치수선이 돌아온다. 끝 자리가 `hold` 와 같아 이음매가 없다.
   *
   * 흔들림 단계 길이는 기본 상수에서 계산한 수(`HEAVY_PERIOD`)다. 스테이지 상수를 바꾸면
   * 단계 길이는 따라가지 않는다 (장부 G13).
   */
  timeline: {
    phases: [
      { id: 'hold', duration: 1, caption: key('caption.hold') },
      { id: 'swingA', duration: HEAVY_PERIOD, caption: key('caption.swingA') },
      { id: 'swingB', duration: HEAVY_PERIOD, caption: key('caption.swingB') },
      { id: 'together', duration: 1.6, caption: key('caption.together') },
      { id: 'clear', duration: 0.5, caption: key('caption.hold') },
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

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 견주는 것은 돌아오는
  // 순간과 횟수이고, 거리 눈금은 「멀리 간 추가 늦다」 는 오독을 부른다 (S-piece).

  messages: massSpringSystemMessages,
};
