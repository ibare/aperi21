// ========================================================================
// kirchhoffs-voltage-law — 선언
// ========================================================================
// 질문: 닫힌 고리를 한 바퀴 돌면 전위는 어떻게 되는가.
//
// 전지 둘 · 저항 셋이 한 줄로 이어진 고리가 왼쪽에 있다. 점 하나가 출발점에서 고리를
// 따라 돌고, 오른쪽 판에는 점이 지나는 자리의 전위가 높이로 그어진다 — 가로는 고리 위
// 자리다. 전지를 지나면 계단이 오르고 저항을 지나면 내려가, 한 바퀴를 마치면 출발한
// 높이로 돌아온다. 거꾸로 돌면 같은 계단을 오른쪽 끝부터 되짚는다 — 앞 바퀴의 계단과
// 오르내림 화살표가 옅게 남아, 소자마다 오름과 내림이 뒤바뀐 것이 나란히 보인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:kirchhoffs-voltage-law` 와 문자 그대로 일치한다 (C4). */
export const KIRCHHOFFS_VOLTAGE_LAW_ID = 'kirchhoffs-voltage-law';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 전지의 전압(V). 둘 다 같은 방향(시계 방향)으로 민다. 내부 저항 · 도선 저항은 없다고 둔다. */
export const E1 = 4;
export const E2 = 2;
/** 세 저항(Ω). */
export const R1 = 1;
export const R2 = 2;
export const R3 = 3;
/**
 * 표시 배율 — 전위 1 V 가 판에서 차지하는 높이(월드). 판의 높이(`GRAPH_HEIGHT`)는 배치라
 * 고정이므로, 두 전지의 합 × 이 값이 그 높이 안에 들어가야 한다.
 */
export const VOLT_HEIGHT = 0.8;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 고리 — 네 변. */
export const LOOP_LEFT = -6.6;
export const LOOP_RIGHT = -1.4;
export const LOOP_TOP = 1.8;
export const LOOP_BOTTOM = -1.8;
/** 출발점 — 왼쪽 변, 첫 전지 아래. 전위의 기준(0 V)이다. */
export const START: Vec2 = [LOOP_LEFT, -1.5];

/** 소자 자리 — 전지는 옆 변의 가운데, 저항은 위 · 아래 변. */
export const E1_POS: Vec2 = [LOOP_LEFT, 0];
export const E2_POS: Vec2 = [LOOP_RIGHT, 0];
export const R1_POS: Vec2 = [-5.3, LOOP_TOP];
export const R2_POS: Vec2 = [-2.7, LOOP_TOP];
export const R3_POS: Vec2 = [-4.0, LOOP_BOTTOM];

/**
 * 저항 기호의 반 길이(월드). plugin-circuit `circuitElement` 는 소자 로컬 ±1 을 두 단자로 쓰고
 * 가운데 ±0.5 에 지그재그를 긋는다 — 전위가 내려가는 구간이 이 지그재그다.
 */
export const RESISTOR_LEAD_HALF = 1;
export const RESISTOR_BODY_HALF = 0.5;
/** 전지 두 판 사이 간격 · 긴 판(+) · 짧은 판(−)의 반 길이(월드). */
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;

/**
 * 전위 판 — 원점(가로 = 출발점, 세로 = 0 V), 가로 길이 · 세로 높이(월드). 가로는 **고리 위 자리**다 —
 * 출발점에서 시계 방향으로 잰 호길이를 판 가로 길이로 줄였고, 오른쪽 끝은 한 바퀴 돌아온 출발점이다.
 * 바닥은 고리 아래 변과 같은 높이.
 */
export const GRAPH_X0 = 0.9;
export const GRAPH_Y0 = LOOP_BOTTOM;
export const GRAPH_WIDTH = 5.6;
export const GRAPH_HEIGHT = 3.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 첫 전지의 전압 글자부터 판 가로축 이름표까지, 세로는
 * 위 저항 이름표 위부터 판 아래 소자 이름표 · 캡션 줄 아래까지.
 */
export const SCENE_BOUNDS = { minX: -7.9, maxX: 7.9, minY: -3.2, maxY: 2.5 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 한 바퀴 도는 동안 · 출발점에서 견주는 동안 · 방향을 바꾸는 동안. */
export const WALK = 7;
export const HOME = 3;
export const TURN = 1.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const kirchhoffsVoltageLawMessages = Object.freeze({
  'label.title': {
    ko: '키르히호프 전압 법칙',
    en: "Kirchhoff's voltage law",
    ja: 'キルヒホッフの電圧則',
    zh: '基尔霍夫电压定律',
    ar: 'قانون كيرشوف للجهد',
    es: 'Ley de tensiones de Kirchhoff',
    fr: 'Loi des mailles de Kirchhoff',
    hi: 'किरखॉफ का वोल्टता नियम',
    id: 'Hukum tegangan Kirchhoff',
    pt: 'Lei das tensões de Kirchhoff',
  },
  'label.operation': {
    ko: '고리에서의 에너지 보존',
    en: 'Conservation of energy around a loop',
    ja: '閉回路でのエネルギーの保存',
    zh: '回路中的能量守恒',
    ar: 'حفظ الطاقة حول حلقة مغلقة',
    es: 'Conservación de la energía en una malla',
    fr: 'Conservation de l’énergie le long d’une maille',
    hi: 'बंद पाश में ऊर्जा का संरक्षण',
    id: 'Kekekalan energi dalam satu loop',
    pt: 'Conservação da energia em uma malha',
  },
  'label.stage': {
    ko: '전지 둘 · 저항 셋',
    en: 'Two cells, three resistors',
    ja: '電池二つ・抵抗三つ',
    zh: '两节电池、三个电阻',
    ar: 'بطاريتان وثلاث مقاومات',
    es: 'Dos pilas, tres resistencias',
    fr: 'Deux piles, trois résistances',
    hi: 'दो सेल, तीन प्रतिरोध',
    id: 'Dua baterai, tiga hambatan',
    pt: 'Duas pilhas, três resistores',
  },
  'label.view': {
    ko: '고리',
    en: 'Loop',
    ja: '閉回路',
    zh: '回路',
    ar: 'الحلقة',
    es: 'Malla',
    fr: 'Maille',
    hi: 'पाश',
    id: 'Loop',
    pt: 'Malha',
  },
  'label.volt': {
    ko: '{v} V',
    en: '{v} V',
    ja: '{v} V',
    zh: '{v} V',
    ar: '{v} V',
    es: '{v} V',
    fr: '{v} V',
    hi: '{v} V',
    id: '{v} V',
    pt: '{v} V',
  },
  'label.start': {
    ko: '출발',
    en: 'start',
    ja: '出発点',
    zh: '起点',
    ar: 'البداية',
    es: 'inicio',
    fr: 'départ',
    hi: 'आरंभ',
    id: 'awal',
    pt: 'início',
  },
  'label.potential': {
    ko: '전위',
    en: 'potential',
    ja: '電位',
    zh: '电势',
    ar: 'الجهد',
    es: 'potencial',
    fr: 'potentiel',
    hi: 'विभव',
    id: 'potensial',
    pt: 'potencial',
  },
  'label.lap': {
    ko: '한 바퀴',
    en: 'one lap',
    ja: '一周',
    zh: '一圈',
    ar: 'دورة واحدة',
    es: 'una vuelta',
    fr: 'un tour',
    hi: 'एक चक्कर',
    id: 'satu putaran',
    pt: 'uma volta',
  },
  /** 소자 이름 · 전지 극 · 전류 기호. 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.e1': {
    ko: 'E₁',
    en: 'E₁',
    ja: 'E₁',
    zh: 'E₁',
    ar: 'E₁',
    es: 'E₁',
    fr: 'E₁',
    hi: 'E₁',
    id: 'E₁',
    pt: 'E₁',
  },
  'label.e2': {
    ko: 'E₂',
    en: 'E₂',
    ja: 'E₂',
    zh: 'E₂',
    ar: 'E₂',
    es: 'E₂',
    fr: 'E₂',
    hi: 'E₂',
    id: 'E₂',
    pt: 'E₂',
  },
  'label.r1': {
    ko: 'R₁',
    en: 'R₁',
    ja: 'R₁',
    zh: 'R₁',
    ar: 'R₁',
    es: 'R₁',
    fr: 'R₁',
    hi: 'R₁',
    id: 'R₁',
    pt: 'R₁',
  },
  'label.r2': {
    ko: 'R₂',
    en: 'R₂',
    ja: 'R₂',
    zh: 'R₂',
    ar: 'R₂',
    es: 'R₂',
    fr: 'R₂',
    hi: 'R₂',
    id: 'R₂',
    pt: 'R₂',
  },
  'label.r3': {
    ko: 'R₃',
    en: 'R₃',
    ja: 'R₃',
    zh: 'R₃',
    ar: 'R₃',
    es: 'R₃',
    fr: 'R₃',
    hi: 'R₃',
    id: 'R₃',
    pt: 'R₃',
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
  'label.current': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'caption.walk': {
    ko: '점이 고리를 따라 돌며 지나는 자리의 전위를 높이로 긋는다 — 전지를 지나면 오르고, 저항을 지나면 내려간다',
    en: 'A point travels round the loop, plotting the potential as height — it climbs across each cell and drops across each resistor',
    ja: '点が閉回路に沿って回り、通る場所の電位を高さで描く — 電池を通ると上がり、抵抗を通ると下がる',
    zh: '一个点沿回路绕行，把经过处的电势画成高度 — 经过电池时升高，经过电阻时降低',
    ar: 'نقطة تدور حول الحلقة وترسم الجهد ارتفاعًا — يصعد عبر كل بطارية وينخفض عبر كل مقاومة',
    es: 'Un punto recorre la malla y traza el potencial como altura — sube al cruzar cada pila y baja al cruzar cada resistencia',
    fr: 'Un point parcourt la maille en traçant le potentiel comme une hauteur — il monte à chaque pile et descend à chaque résistance',
    hi: 'एक बिंदु पाश के साथ घूमता है और विभव को ऊँचाई के रूप में खींचता है — हर सेल पर यह चढ़ता है और हर प्रतिरोध पर गिरता है',
    id: 'Sebuah titik mengelilingi loop dan menggambar potensial sebagai ketinggian — naik saat melewati tiap baterai dan turun saat melewati tiap hambatan',
    pt: 'Um ponto percorre a malha traçando o potencial como altura — sobe em cada pilha e desce em cada resistor',
  },
  'caption.home': {
    ko: '한 바퀴 돌아 출발점에 왔다 — 높이도 출발할 때와 같다. 오른 만큼 내려왔다',
    en: 'One lap brings it back to the start at the very height it began — every climb has been matched by a drop',
    ja: '一周して出発点に戻った — 高さも出発したときとまったく同じ。上がった分だけ下がった',
    zh: '绕一圈回到起点，高度也和出发时完全一样 — 每一次升高都被一次降低抵消',
    ar: 'دورة واحدة تعيده إلى البداية عند الارتفاع نفسه الذي بدأ منه — كل صعود قابله هبوط',
    es: 'Una vuelta lo trae de nuevo al inicio a la misma altura de partida — cada subida se compensó con una bajada',
    fr: 'Un tour le ramène au départ, exactement à la hauteur initiale — chaque montée a été compensée par une descente',
    hi: 'एक चक्कर उसे ठीक उसी ऊँचाई पर आरंभ बिंदु पर लौटा देता है — हर चढ़ाई की भरपाई एक गिरावट ने की है',
    id: 'Satu putaran membawanya kembali ke awal pada ketinggian yang persis sama — setiap kenaikan diimbangi oleh penurunan',
    pt: 'Uma volta o traz de volta ao início, exatamente na altura em que começou — cada subida foi compensada por uma descida',
  },
  'caption.turn': {
    ko: '출발점에서 방향을 거꾸로 바꾼다',
    en: 'At the start, the direction is reversed',
    ja: '出発点で向きを逆にする',
    zh: '在起点处反转方向',
    ar: 'عند البداية ينعكس الاتجاه',
    es: 'En el inicio, el sentido se invierte',
    fr: 'Au départ, le sens est inversé',
    hi: 'आरंभ बिंदु पर दिशा उलट दी जाती है',
    id: 'Di titik awal, arahnya dibalik',
    pt: 'No início, o sentido é invertido',
  },
  'caption.walkBack': {
    ko: '거꾸로 돌면 같은 계단을 반대로 밟는다 — 소자마다 오름과 내림이 뒤바뀌어 저항에서 오르고 전지에서 내려간다',
    en: 'In reverse it treads the same staircase backwards — every element flips, climbing across the resistors and dropping across the cells',
    ja: '逆に回ると同じ階段を反対にたどる — 素子ごとに上り下りが入れ替わり、抵抗で上がり電池で下がる',
    zh: '反向绕行时沿同一段台阶倒着走 — 每个元件的升降都颠倒了，经过电阻时升高，经过电池时降低',
    ar: 'في الاتجاه المعاكس يخطو على الدرج نفسه بالعكس — ينقلب كل عنصر، فيصعد عبر المقاومات وينخفض عبر البطاريات',
    es: 'En sentido contrario recorre la misma escalera al revés — cada elemento se invierte: sube al cruzar las resistencias y baja al cruzar las pilas',
    fr: 'En sens inverse, il parcourt le même escalier à rebours — chaque élément s’inverse : il monte dans les résistances et descend dans les piles',
    hi: 'उलटी दिशा में यह उसी सीढ़ी को पीछे की ओर तय करता है — हर अवयव पलट जाता है: प्रतिरोधों पर चढ़ता है और सेलों पर गिरता है',
    id: 'Saat berbalik ia menapaki tangga yang sama secara terbalik — setiap elemen berbalik: naik melewati hambatan dan turun melewati baterai',
    pt: 'No sentido inverso, percorre a mesma escada ao contrário — cada elemento se inverte: sobe nos resistores e desce nas pilhas',
  },
  'caption.homeBack': {
    ko: '거꾸로 돌아도 한 바퀴를 마치면 출발한 높이로 돌아온다',
    en: 'Going the other way, one full lap still ends at the height it started from',
    ja: '逆に回っても、一周し終えると出発した高さに戻る',
    zh: '反方向绕行，走完一整圈仍回到出发时的高度',
    ar: 'حتى في الاتجاه الآخر، تنتهي الدورة الكاملة عند الارتفاع الذي بدأت منه',
    es: 'En el otro sentido, una vuelta completa también termina a la altura de partida',
    fr: 'Dans l’autre sens, un tour complet se termine encore à la hauteur de départ',
    hi: 'दूसरी दिशा में भी एक पूरा चक्कर उसी ऊँचाई पर ख़त्म होता है जहाँ से शुरू हुआ था',
    id: 'Ke arah sebaliknya pun, satu putaran penuh tetap berakhir pada ketinggian awalnya',
    pt: 'No outro sentido, uma volta completa ainda termina na altura de onde partiu',
  },
  'caption.turnBack': {
    ko: '출발점에서 방향을 처음대로 되돌린다',
    en: 'At the start, the direction is switched back',
    ja: '出発点で向きを元に戻す',
    zh: '在起点处把方向改回原来',
    ar: 'عند البداية يعود الاتجاه كما كان',
    es: 'En el inicio, el sentido vuelve al original',
    fr: 'Au départ, le sens d’origine est rétabli',
    hi: 'आरंभ बिंदु पर दिशा फिर पहले जैसी कर दी जाती है',
    id: 'Di titik awal, arahnya dikembalikan seperti semula',
    pt: 'No início, o sentido volta ao original',
  },
} satisfies Record<string, LocalizedText>);

export type KirchhoffsVoltageLawMessageKey = keyof typeof kirchhoffsVoltageLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: KirchhoffsVoltageLawMessageKey): LocalizedText => kirchhoffsVoltageLawMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: KirchhoffsVoltageLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const kirchhoffsVoltageLawSchema: BundleSchema = {
  id: KIRCHHOFFS_VOLTAGE_LAW_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 점이 돌고, 한 바퀴를 마치고, 거꾸로 다시 돈다.
  parameters: [],

  stages: [
    {
      id: 'two-cells',
      label: text('label.stage'),
      constants: {
        e1: E1,
        e2: E2,
        r1: R1,
        r2: R2,
        r3: R3,
        voltHeight: VOLT_HEIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'loop', label: text('label.view'), default: true }],

  /** 고리 하나와 전위 판, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 걷는 점은 전선 · 저항 기호 **위**, 이름표는 맨 위. 층 순서로는 plugin 기호가 점 위로 올 수 있다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 시계 방향 한 바퀴 → 출발점에서 견줌 → 방향 바꿈 → 반시계 방향 한 바퀴 → 견줌 → 방향 바꿈.
   *
   * 반시계 방향 구간은 `turn-ccw` 부터 `home-ccw` 까지 붙어 있다 — physics 가 그 구간의
   * 시작 · 끝으로 지금 방향을 가른다(단계 목록이 프레임에 없다, G193).
   */
  timeline: {
    phases: [
      { id: 'walk-cw', duration: WALK, caption: key('caption.walk') },
      { id: 'home-cw', duration: HOME, caption: key('caption.home') },
      { id: 'turn-ccw', duration: TURN, caption: key('caption.turn') },
      { id: 'walk-ccw', duration: WALK, caption: key('caption.walkBack') },
      { id: 'home-ccw', duration: HOME, caption: key('caption.homeBack') },
      { id: 'turn-cw', duration: TURN, caption: key('caption.turnBack') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 점이 첫 전지와 두 저항을 지나 계단이 반쯤 그어져 있다. */
  startAt: 3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식 · 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 거리가 아니라 높이의 오르내림을 본다. */

  messages: kirchhoffsVoltageLawMessages,
};
