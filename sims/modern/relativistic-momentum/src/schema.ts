// ========================================================================
// relativistic-momentum — 선언
// ========================================================================
// 질문: 같은 힘으로 계속 밀면 물체는 언젠가 빛보다 빨라지는가?
//
// 운동량-속도 곡선 판 하나. 같은 힘으로 계속 미는 물체의 점이 곡선을 오른다.
// 운동량은 같은 시간마다 똑같이 쌓이는데(세로축 자국이 고르다), 속도는 점점 덜
// 늘어(가로축 자국이 c 앞에서 촘촘해진다) 곡선 p = γmv 가 c 앞에서 위로 치솟는다.
// 느릴 때 그 곡선은 고전 직선 p = mv 와 겹친다. 같은 운동량의 「고전이라면」 점은
// c 를 넘어 판 밖으로 나가지만, 실제 점은 c 에 다가갈 뿐 넘지 못한다.
//
// 시계 · 시간 지연은 이웃 `time-dilation` 의 몫이고, 속도 합성은
// `relativistic-velocity-addition` 의 몫이다. 여기에는 시계도 배도 없다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:relativistic-momentum` 와 문자 그대로 일치한다 (C4). */
export const RELATIVISTIC_MOMENTUM_ID = 'relativistic-momentum';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 단위 — 속도는 c 를 1 로, 운동량은 (질량 단위 × c) 를 1 로 센다.
// ------------------------------------------------------------------------

/** 미는 물체의 (정지) 질량. */
export const MASS = 1;
/** 물체를 미는 한결같은 힘 — 1 초에 쌓이는 운동량(질량 단위 × c). */
export const FORCE = 0.6;
/**
 * 자국을 찍는 시간 간격(초). 같은 힘이라 자국마다 운동량은 똑같이 `FORCE × 간격` 만큼 쌓인다.
 * 미는 동안(`slow` + `part` + `fast`)이 이 간격의 정수배여야 마지막 자국이 미는 끝에 떨어진다(G129).
 */
export const STAMP_INTERVAL = 0.5;
/** 가로축에 이름을 붙일 속도 눈금(c 단위). 화면에는 이 선언값 그대로 뜬다. */
export const SPEED_TICKS = [0.5, 0.8, 0.9] as const;
/** 속도 눈금의 스테이지 상수 키. 스테이지 상수가 수 하나씩이라 목록을 키로 흩는다(G105). */
export const speedTickKey = (i: number): string => `speedTick${i + 1}`;

// ------------------------------------------------------------------------
// 배치 — 월드. 원점은 속도 0 · 운동량 0.
// ------------------------------------------------------------------------

export const PLOT = {
  /** 속도 c 의 가로 길이(월드). */
  perC: 6,
  /** 운동량 1(질량 단위 × c)의 세로 길이(월드). */
  perP: 0.8,
  /** 가로축 끝(c 단위). c 너머를 조금 남겨야 고전 직선과 「고전이라면」 점이 c 를 넘는 것이 보인다. */
  vEnd: 1.3,
  /** 세로축 끝(운동량). 곡선은 여기서 판을 벗어난다 — 끝없이 치솟는 곡선을 판이 자른다. */
  pTop: 4,
} as const;

/** 곡선 이름표가 붙는 곡선 위 운동량. c 앞에서 치솟는 구간 옆이다. */
export const CURVE_LABEL_P = 3.1;

/**
 * 고정 경계. 가로는 세로축 이름부터 가로축 끝 이름까지, 세로는 세로축 이름 위부터 속도 눈금
 * 글자 아래 캡션 한 줄 자리까지 — 캡션 슬롯은 프레이밍 여백으로 잡히지 않는다(G24). 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.7, maxX: 8.4, minY: -1.05, maxY: 3.65 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const relativisticMomentumMessages = Object.freeze({
  'label.title': {
    ko: '상대론적 운동량',
    en: 'Relativistic momentum',
    ja: '相対論的運動量',
    zh: '相对论动量',
    ar: 'الزخم النسبي',
    es: 'Momento lineal relativista',
    fr: 'Quantité de mouvement relativiste',
    hi: 'आपेक्षिक संवेग',
    id: 'Momentum relativistik',
    pt: 'Quantidade de movimento relativística',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '광속에 다가갈수록 끝없이 커지는 운동량',
    en: 'Momentum growing without bound as the speed approaches the speed of light',
    ja: '光速に近づくほど限りなく大きくなる運動量',
    zh: '速率越接近光速就无限增大的动量',
    ar: 'زخم يتزايد بلا حدّ كلما اقتربت السرعة من سرعة الضوء',
    es: 'Un momento lineal que crece sin límite cuando la rapidez se acerca a la velocidad de la luz',
    fr: 'Une quantité de mouvement qui croît sans limite quand la vitesse approche celle de la lumière',
    hi: 'संवेग जो चाल के प्रकाश की चाल के पास पहुँचने पर असीमित रूप से बढ़ता है',
    id: 'Momentum yang bertambah tanpa batas saat kelajuan mendekati kecepatan cahaya',
    pt: 'Uma quantidade de movimento que cresce sem limite quando a velocidade se aproxima da velocidade da luz',
  },
  'label.stage': {
    ko: '한결같은 힘으로 미는 물체',
    en: 'A body pushed by a steady force',
    ja: '一定の力で押される物体',
    zh: '受恒力推动的物体',
    ar: 'جسم تدفعه قوة ثابتة',
    es: 'Un cuerpo empujado por una fuerza constante',
    fr: 'Un corps poussé par une force constante',
    hi: 'स्थिर बल से धकेली जाती वस्तु',
    id: 'Benda yang didorong gaya tetap',
    pt: 'Um corpo empurrado por uma força constante',
  },
  'label.view': {
    ko: '운동량-속도 곡선',
    en: 'Momentum-speed curve',
    ja: '運動量-速さ曲線',
    zh: '动量-速率曲线',
    ar: 'منحنى الزخم-السرعة',
    es: 'Curva momento lineal-rapidez',
    fr: 'Courbe quantité de mouvement-vitesse',
    hi: 'संवेग-चाल वक्र',
    id: 'Kurva momentum-kelajuan',
    pt: 'Curva quantidade de movimento-velocidade',
  },
  'label.axisMomentum': {
    ko: '운동량 p',
    en: 'momentum p',
    ja: '運動量 p',
    zh: '动量 p',
    ar: 'الزخم p',
    es: 'momento lineal p',
    fr: 'quantité de mouvement p',
    hi: 'संवेग p',
    id: 'momentum p',
    pt: 'quantidade de movimento p',
  },
  'label.axisSpeed': {
    ko: '속도 v',
    en: 'speed v',
    ja: '速さ v',
    zh: '速率 v',
    ar: 'السرعة v',
    es: 'rapidez v',
    fr: 'vitesse v',
    hi: 'चाल v',
    id: 'kelajuan v',
    pt: 'velocidade v',
  },
  /** 속도 눈금. 선언값을 그대로 끼운다 (S-piece 유효숫자). */
  'label.speedTick': {
    ko: '{v}c',
    en: '{v}c',
    ja: '{v}c',
    zh: '{v}c',
    ar: '{v}c',
    es: '{v}c',
    fr: '{v}c',
    hi: '{v}c',
    id: '{v}c',
    pt: '{v}c',
  },
  /** 광속 눈금 — 기호라 표식이다. */
  'label.light': {
    ko: 'c',
    en: 'c',
    ja: 'c',
    zh: 'c',
    ar: 'c',
    es: 'c',
    fr: 'c',
    hi: 'c',
    id: 'c',
    pt: 'c',
  },
  'label.relativistic': {
    ko: '실제 p = γmv',
    en: 'actual p = γmv',
    ja: '実際 p = γmv',
    zh: '实际 p = γmv',
    ar: 'الفعلي p = γmv',
    es: 'real p = γmv',
    fr: 'réel p = γmv',
    hi: 'वास्तविक p = γmv',
    id: 'sebenarnya p = γmv',
    pt: 'real p = γmv',
  },
  'label.classical': {
    ko: '고전 p = mv',
    en: 'classical p = mv',
    ja: '古典 p = mv',
    zh: '经典 p = mv',
    ar: 'الكلاسيكي p = mv',
    es: 'clásico p = mv',
    fr: 'classique p = mv',
    hi: 'चिरसम्मत p = mv',
    id: 'klasik p = mv',
    pt: 'clássico p = mv',
  },
  'caption.slow': {
    ko: '같은 힘으로 계속 민다 — 느릴 때는 곡선과 고전 직선이 겹친다',
    en: 'A steady force keeps pushing — at low speed the curve and the classical line coincide',
    ja: '一定の力で押し続ける — 遅いうちは曲線と古典の直線が重なる',
    zh: '恒力持续推动——速率低时，曲线与经典直线重合',
    ar: 'قوة ثابتة تواصل الدفع — عند السرعة المنخفضة ينطبق المنحنى على الخط الكلاسيكي',
    es: 'Una fuerza constante sigue empujando — a baja rapidez, la curva y la recta clásica coinciden',
    fr: 'Une force constante continue de pousser — à basse vitesse, la courbe et la droite classique se confondent',
    hi: 'स्थिर बल धकेलता रहता है — कम चाल पर वक्र और चिरसम्मत रेखा एक-दूसरे पर पड़ती हैं',
    id: 'Gaya tetap terus mendorong — pada kelajuan rendah, kurva dan garis klasik berimpit',
    pt: 'Uma força constante continua empurrando — em baixa velocidade, a curva e a reta clássica coincidem',
  },
  'caption.part': {
    ko: '같은 운동량인데 두 점이 벌어진다 — 고전 점은 c 를 넘어 판 밖으로 간다',
    en: 'Same momentum, yet the two dots pull apart — the classical dot runs past c and off the chart',
    ja: '運動量は同じなのに二つの点が離れていく — 古典の点は c を越えてグラフの外へ出る',
    zh: '动量相同，两个点却分开了——经典的点越过 c，跑出图外',
    ar: 'الزخم نفسه، ومع ذلك تتباعد النقطتان — النقطة الكلاسيكية تتجاوز c وتخرج من الرسم',
    es: 'El mismo momento lineal, pero los dos puntos se separan — el punto clásico pasa de c y sale del gráfico',
    fr: 'Même quantité de mouvement, et pourtant les deux points s’écartent — le point classique dépasse c et sort du graphique',
    hi: 'संवेग वही, फिर भी दोनों बिंदु अलग हो जाते हैं — चिरसम्मत बिंदु c को पार कर आलेख से बाहर चला जाता है',
    id: 'Momentumnya sama, tetapi kedua titik berpisah — titik klasik melewati c dan keluar dari grafik',
    pt: 'A mesma quantidade de movimento, mas os dois pontos se separam — o ponto clássico passa de c e sai do gráfico',
  },
  'caption.fast': {
    ko: '운동량은 같은 시간마다 똑같이 쌓이는데 속도는 점점 덜 늘어 — 곡선이 c 앞에서 치솟는다',
    en: 'Momentum grows by the same step each moment, yet speed gains less and less — the curve shoots up before c',
    ja: '運動量は同じ時間ごとに同じだけ増えるのに、速さの増え方はしだいに小さくなる — 曲線は c の手前で急上昇する',
    zh: '动量每一刻都增加同样的一步，速率的增加却越来越少——曲线在 c 之前陡然上升',
    ar: 'يزداد الزخم بالخطوة نفسها في كل لحظة، لكن السرعة تكسب أقل فأقل — ينطلق المنحنى صعودًا قبل c',
    es: 'El momento lineal crece el mismo paso en cada instante, pero la rapidez gana cada vez menos — la curva se dispara antes de c',
    fr: 'La quantité de mouvement croît du même pas à chaque instant, mais la vitesse gagne de moins en moins — la courbe s’envole avant c',
    hi: 'संवेग हर क्षण उतना ही बढ़ता है, फिर भी चाल कम से कम बढ़ती है — वक्र c से पहले तेज़ी से ऊपर उठता है',
    id: 'Momentum bertambah sama besar setiap saat, tetapi kelajuan makin sedikit bertambah — kurva melonjak sebelum c',
    pt: 'A quantidade de movimento cresce o mesmo passo a cada instante, mas a velocidade ganha cada vez menos — a curva dispara antes de c',
  },
  'caption.hold': {
    ko: '고전대로라면 c 를 한참 넘었을 운동량 — 실제 속도는 c 에 다가갈 뿐 넘지 못한다',
    en: 'Classically this momentum would be far past c — the actual speed only creeps toward c',
    ja: '古典的にはこの運動量なら c をはるかに越えている — 実際の速さは c に近づいていくだけだ',
    zh: '按经典理论，这个动量早已远超 c——实际速率只是慢慢逼近 c',
    ar: 'كلاسيكيًا، هذا الزخم يعني تجاوز c بكثير — أما السرعة الفعلية فلا تزحف إلا نحو c',
    es: 'Clásicamente, este momento lineal estaría muy por encima de c — la rapidez real solo se acerca poco a poco a c',
    fr: 'Classiquement, cette quantité de mouvement dépasserait largement c — la vitesse réelle ne fait que s’approcher de c',
    hi: 'चिरसम्मत रूप से यह संवेग c से बहुत आगे होता — वास्तविक चाल बस धीरे-धीरे c की ओर बढ़ती है',
    id: 'Secara klasik, momentum ini sudah jauh melewati c — kelajuan sebenarnya hanya merayap mendekati c',
    pt: 'Classicamente, esta quantidade de movimento estaria muito além de c — a velocidade real só se arrasta rumo a c',
  },
} satisfies Record<string, LocalizedText>);

export type RelativisticMomentumMessageKey = keyof typeof relativisticMomentumMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RelativisticMomentumMessageKey): LocalizedText => relativisticMomentumMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RelativisticMomentumMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const relativisticMomentumSchema: BundleSchema = {
  id: RELATIVISTIC_MOMENTUM_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 밀기 시작하고, 곡선을 오르고, c 앞에서 멈칫한 채 다시 온다.
  parameters: [],

  stages: [
    {
      id: 'steady-push',
      label: text('label.stage'),
      constants: {
        mass: MASS,
        force: FORCE,
        stampInterval: STAMP_INTERVAL,
        ...Object.fromEntries(SPEED_TICKS.map((v, i) => [speedTickKey(i), v])),
      },
    },
  ],

  environments: [],

  views: [{ id: 'momentum-speed', label: text('label.view'), default: true }],

  /** 가로로 넓은 곡선 판 하나. 세로는 기본 크기로 담긴다. */
  canvas: { height: 360, minHeight: 320 },

  /** 쓴 순서대로 겹친다 — 축 · 직선 · 곡선 위에 자국, 그 위에 점과 글자. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 밀고 있다 — 점이 원점을 막 떠나 곡선을 오르는 중이다 (S-piece). */
  startAt: 0.4,

  /**
   * 한 주기 = 느릴 때(두 점이 붙어 있음) → 벌어짐(고전 점이 c 를 넘어 판 밖으로) → 치솟음 →
   * 멈추어 읽음 → 흐려짐. 미는 동안은 `slow` 시작부터 `fast` 끝까지(`slow` · `part` · `fast`)이고,
   * 운동량은 그 시작에서 잰 시각의 함수다. 세 단계의 경계는 캡션이 바뀌는 자리일 뿐 힘은 끊기지 않는다.
   * `slow` 는 두 점이 붙어 있는 동안만큼, `part` 는 고전 점이 판 밖으로 나갈 때까지로 잡았다 —
   * `force` 를 바꾸면 이 길이도 함께 고친다(G143).
   */
  timeline: {
    phases: [
      { id: 'slow', duration: 0.6, caption: key('caption.slow') },
      { id: 'part', duration: 1.6, caption: key('caption.part') },
      { id: 'fast', duration: 3.8, caption: key('caption.fast') },
      { id: 'hold', duration: 2.6, caption: key('caption.hold') },
      { id: 'fade', duration: 0.6, caption: key('caption.hold') },
    ],
  },

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [4, -4] },
    align: 'left',
    fontSize: 13,
    wrapWidth: 820,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 읽을 것은 거리가 아니라 **자국의 간격**이다 —
   * 세로축 자국은 고르고 가로축 자국은 c 앞에서 촘촘해진다. 그 둘이 자다.
   */

  messages: relativisticMomentumMessages,
};
