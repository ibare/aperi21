// ========================================================================
// banked-curve — 선언
// ========================================================================
// 질문: 마찰이 없는 빙판길인데, 무엇이 차를 커브 안쪽으로 돌려 주는가?
// 답의 동사: (기울기를 맞추면) 돈다 — 모자라면 바깥으로, 넘치면 안쪽으로 미끄러져 나간다.
//
// 왼쪽 칸은 길을 반지름 방향으로 자른 단면(기울기 · 힘), 오른쪽 칸은 위에서 본 둥근 길
// (도는지). 차는 마찰 없는 원뿔면 위의 질점으로 적분된다. 0° · 15° · 45° · 맞춘 각을
// 차례로 시도하고, 앞 시도의 자취를 흐리게 남긴다.
// 원본: tasks/piece-lab/banked-curve
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:banked-curve` 와 문자 그대로 일치한다 (C4). */
export const BANKED_CURVE_ID = 'banked-curve';

// ------------------------------------------------------------------------
// 물리 — 원본 상수 그대로
// ------------------------------------------------------------------------

/** 중력 가속도 (m/s²). */
export const G = 9.8;
/** 차의 빠르기 (m/s). */
export const V = 15;
/** 길 가운데 반지름 (m). */
export const R0 = 40;
/** 길 너비의 절반 (m) → 34 m ~ 46 m. */
export const HALF_W = 6;
export const R_IN = R0 - HALF_W;
export const R_OUT = R0 + HALF_W;
/** 맞춘 각(도) = atan(v²/(r g)) ≈ 29.85°. */
export const THETA_MATCH = (Math.atan((V * V) / (R0 * G)) * 180) / Math.PI;
/** 화면 1초 = 물리 2초 (한 바퀴 16.8초 → 8.4초). 화면에 적지 않는다 (원본 inventory 「hidden」). */
export const TIME_SCALE = 2;
/** 한 걸음 안의 RK4 부분 단계. */
export const SUB = 4;
/**
 * 적분 걸음(초). 원본은 이 고정 걸음으로만 적분했다. 러너의 걸음은 기기마다 다르므로
 * `step` 이 이 걸음으로 쪼개 쌓는다 — 결과 미리 알기(`predict`)와 실제 달리기가 같은
 * 걸음이어야 캡션이 말한 결과가 화면에서 그대로 일어난다.
 */
export const FIXED_DT = 1 / 60;
/** 결과 미리 알기가 보는 최대 걸음 수 (12 초). */
export const PREDICT_FRAMES = 60 * 12;

/** 자동으로 시도하는 기울기(도) — 0° · 모자람 · 넘침 · 맞춤. 순서는 주장이 정한다. */
export const ATTEMPTS: readonly number[] = [0, 15, 45, THETA_MATCH];

/** 길이 기우는 시간(초). */
export const T_TILT = 0.8;
/** 길을 벗어난 뒤 곧게 나아가며 흐려지는 시간(초). */
export const T_FLY = 0.45;
/** 벗어난 뒤 멈춰 보이는 시간(초). */
export const T_HOLD = 0.7;
/** 한 바퀴를 마친 뒤 멈춰 보이는 시간(초). */
export const T_HOLD_LAP = 1.2;

/** 이 각(도) 아래는 평평한 길로 본다 — 호를 긋지 않고 캡션이 「빙판」을 말한다. */
export const FLAT_EPS = 0.05;

// ------------------------------------------------------------------------
// 배치 — 원본 캔버스 880×340 px 의 좌표를 그대로 적는다.
// 월드 1 단위 = 원본 100 px, y 는 위 (`px` · `py` 는 scene 이 월드로 옮긴다).
// ------------------------------------------------------------------------

/** 원본 캔버스 크기(px). */
export const ORIGIN_CANVAS = { width: 880, height: 340 } as const;

/** 단면도: 중심점 · m 당 px · 1 m/s² 당 화살표 px · 길 바닥 높이. 왼쪽이 원의 중심 쪽. */
export const SECTION = { cx: 205, cy: 190, pxPerM: 15, pxPerAccel: 8.5, floorY: 300 } as const;
/** 경사각 표시: 수평 점선 길이 · 호 반지름 · 글자 자리. */
export const ANGLE_MARK = { lineLength: 70, arcRadius: 52, textDx: 4, textDy: 14 } as const;
/** 「원의 중심 쪽」 화살표와 글자 자리. */
export const CENTER_MARK = { fromX: 60, toX: 22, y: 312, textX: 66 } as const;
/** 「길을 벗어났다」 글자 높이. */
export const OFF_ROAD_Y = 40;
/** 단면 위 차의 크기(px). */
export const SECTION_CAR = { width: 30, height: 16 } as const;
/** 위쪽 두 줄의 높이(px) — 필요한 만큼 막대 · 안쪽 몫 화살표. */
export const COMPARE_ROWS = { needY: 40, inwardY: 68, tick: 6, textDx: 10 } as const;
/** 무게 글자 자리(화살표 끝에서). 길이 미는 힘 글자는 화살표 가운데에서 오른쪽으로 띄운다. */
export const FORCE_LABELS = { weightDx: 8, weightDy: -8, normalDx: 10 } as const;
/** 화살촉 크기(px). 원본 min(9, 길이/2). */
export const ARROW_HEAD = 9;
/** 안쪽 몫이 이 길이(px) 아래면 화살표 대신 점을 찍는다. */
export const INWARD_DOT_BELOW = 1;

/** 위에서 본 길: 중심 · m 당 px · 중심 점 반지름(px). */
export const TOP = { cx: 640, cy: 158, pxPerM: 3.2, hubRadius: 2.5 } as const;
/** 위에서 본 차의 크기(px). */
export const TOP_CAR = { width: 18, height: 10 } as const;
/** 지난 시도의 각도 글자 자리(자취 끝에서, px). */
export const PAST_LABEL = { dx: 6, dy: -8 } as const;

/**
 * 프레이밍 — 원본 캔버스 전체와, 그 아래 캡션·조작기 줄. 원본은 캡션과 조작기를 캔버스
 * **아래** DOM 에 두었다. 임베드에서는 그림 위에 얹히므로 그 몫만큼 경계를 아래로 넓혀
 * 자리를 비운다. 고정값이라 카메라가 흔들리지 않는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: 8.8, minY: -0.62, maxY: 3.4 } as const;

// ------------------------------------------------------------------------
// 조작기
// ------------------------------------------------------------------------

export const SLIDER_RANGE: [number, number] = [0, 50];
export const SLIDER_STEP = 0.1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const bankedCurveMessages = Object.freeze({
  'label.title': {
    ko: '경사진 커브',
    en: 'Banked curve',
    ja: '傾斜したカーブ',
    zh: '倾斜弯道',
    ar: 'المنعطف المائل',
    es: 'Curva peraltada',
    fr: 'Virage relevé',
    hi: 'ढालू मोड़',
    id: 'Tikungan miring',
    pt: 'Curva sobrelevada',
  },
  'label.operation': {
    ko: '마찰 없이도 도는 각도',
    en: 'The bank angle that turns a car without friction',
    ja: '摩擦なしで車を曲がらせる傾斜角',
    zh: '无需摩擦就能让汽车转弯的倾角',
    ar: 'زاوية الميل التي تُدير السيارة دون احتكاك',
    es: 'El ángulo de peralte que hace girar un coche sin rozamiento',
    fr: 'L’angle de relèvement qui fait tourner une voiture sans frottement',
    hi: 'वह ढाल कोण जो बिना घर्षण के कार को मोड़ देता है',
    id: 'Sudut kemiringan yang membelokkan mobil tanpa gesekan',
    pt: 'O ângulo de inclinação que faz um carro fazer a curva sem atrito',
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
  'label.slider': {
    ko: '경사각',
    en: 'Bank angle',
    ja: '傾斜角',
    zh: '倾角',
    ar: 'زاوية الميل',
    es: 'Ángulo de peralte',
    fr: 'Angle de relèvement',
    hi: 'ढाल कोण',
    id: 'Sudut kemiringan',
    pt: 'Ângulo de inclinação',
  },
  'label.auto': {
    ko: '자동으로 보기',
    en: 'Play automatically',
    ja: '自動で見る',
    zh: '自动播放',
    ar: 'تشغيل تلقائي',
    es: 'Reproducir automáticamente',
    fr: 'Lecture automatique',
    hi: 'स्वतः चलाएँ',
    id: 'Putar otomatis',
    pt: 'Reproduzir automaticamente',
  },
  'label.angle': {
    ko: '{deg}°',
    en: '{deg}°',
    ja: '{deg}°',
    zh: '{deg}°',
    ar: '{deg}°',
    es: '{deg}°',
    fr: '{deg}°',
    hi: '{deg}°',
    id: '{deg}°',
    pt: '{deg}°',
  },
  'label.center': {
    ko: '원의 중심 쪽',
    en: 'toward the centre',
    ja: '円の中心の方へ',
    zh: '指向圆心',
    ar: 'نحو المركز',
    es: 'hacia el centro',
    fr: 'vers le centre',
    hi: 'केंद्र की ओर',
    id: 'ke arah pusat',
    pt: 'para o centro',
  },
  'label.offRoad': {
    ko: '길을 벗어났다',
    en: 'Off the road',
    ja: '道を外れた',
    zh: '冲出了路面',
    ar: 'خرجت عن الطريق',
    es: 'Fuera de la carretera',
    fr: 'Sorti de la route',
    hi: 'सड़क से बाहर',
    id: 'Keluar jalan',
    pt: 'Fora da pista',
  },
  'label.weight': {
    ko: '무게',
    en: 'weight',
    ja: '重さ',
    zh: '重力',
    ar: 'الوزن',
    es: 'peso',
    fr: 'poids',
    hi: 'भार',
    id: 'berat',
    pt: 'peso',
  },
  'label.normal': {
    ko: '길이 미는 힘',
    en: 'push of the road',
    ja: '道が押す力',
    zh: '路面的推力',
    ar: 'دفع الطريق',
    es: 'empuje de la carretera',
    fr: 'poussée de la route',
    hi: 'सड़क का धक्का',
    id: 'dorongan jalan',
    pt: 'empurrão da pista',
  },
  'label.need': {
    ko: '돌기에 필요한 만큼',
    en: 'needed to turn',
    ja: '曲がるのに必要な分',
    zh: '转弯所需',
    ar: 'اللازم للدوران',
    es: 'lo necesario para girar',
    fr: 'ce qu’il faut pour tourner',
    hi: 'मुड़ने के लिए आवश्यक',
    id: 'yang diperlukan untuk berbelok',
    pt: 'o necessário para fazer a curva',
  },
  'label.inward': {
    ko: '길이 안쪽으로 미는 몫',
    en: 'inward share of the push',
    ja: '道が内側へ押す分',
    zh: '推力指向内侧的分量',
    ar: 'الحصة الداخلية من الدفع',
    es: 'parte del empuje hacia dentro',
    fr: 'part de la poussée vers l’intérieur',
    hi: 'धक्के का भीतरी अंश',
    id: 'bagian dorongan ke dalam',
    pt: 'parcela do empurrão para dentro',
  },
  'caption.tilt': {
    ko: '길을 {to}°로 기울인다',
    en: 'The road tilts to {to}°',
    ja: '道が {to}° に傾く',
    zh: '路面倾斜到 {to}°',
    ar: 'يميل الطريق إلى {to}°',
    es: 'La carretera se inclina a {to}°',
    fr: 'La route s’incline à {to}°',
    hi: 'सड़क {to}° तक झुकती है',
    id: 'Jalan miring hingga {to}°',
    pt: 'A pista se inclina até {to}°',
  },
  'caption.round': {
    ko: '기울기 {deg}° — 마찰 없이도 차가 원을 따라 돈다',
    en: 'Bank {deg}° — the car goes round the circle with no friction at all',
    ja: '傾き {deg}° — 摩擦がまったくなくても車は円に沿って回る',
    zh: '倾角 {deg}° — 完全没有摩擦，汽车也沿着圆周转弯',
    ar: 'الميل {deg}° — تدور السيارة على الدائرة دون أي احتكاك',
    es: 'Peralte {deg}° — el coche recorre el círculo sin ningún rozamiento',
    fr: 'Relèvement {deg}° — la voiture suit le cercle sans aucun frottement',
    hi: 'ढाल {deg}° — बिल्कुल घर्षण के बिना भी कार वृत्त पर घूमती है',
    id: 'Kemiringan {deg}° — mobil berputar mengikuti lingkaran tanpa gesekan sama sekali',
    pt: 'Inclinação {deg}° — o carro percorre o círculo sem nenhum atrito',
  },
  'caption.flat': {
    ko: '기울기 {deg}° — 빙판 위의 차는 곧게 나아가 바깥으로 미끄러져 나간다',
    en: 'Bank {deg}° — on ice the car goes straight and slides off the outside',
    ja: '傾き {deg}° — 氷の上の車はまっすぐ進み、外側へ滑り出ていく',
    zh: '倾角 {deg}° — 冰面上的汽车径直前进，从外侧滑出',
    ar: 'الميل {deg}° — على الجليد تمضي السيارة مستقيمةً وتنزلق خارجةً من الجهة الخارجية',
    es: 'Peralte {deg}° — sobre hielo el coche sigue recto y se sale deslizando por fuera',
    fr: 'Relèvement {deg}° — sur la glace, la voiture file tout droit et glisse vers l’extérieur',
    hi: 'ढाल {deg}° — बर्फ़ पर कार सीधी चलती है और बाहर की ओर फिसल जाती है',
    id: 'Kemiringan {deg}° — di atas es mobil melaju lurus dan tergelincir keluar',
    pt: 'Inclinação {deg}° — no gelo o carro segue reto e escorrega para fora',
  },
  'caption.out': {
    ko: '기울기 {deg}° — 안쪽으로 미는 몫이 모자라 바깥으로 밀려난다',
    en: 'Bank {deg}° — the inward share falls short, so the car is pushed outward',
    ja: '傾き {deg}° — 内側へ押す分が足りず、外側へ押し出される',
    zh: '倾角 {deg}° — 指向内侧的分量不够，汽车被推向外侧',
    ar: 'الميل {deg}° — الحصة الداخلية غير كافية، فتُدفَع السيارة إلى الخارج',
    es: 'Peralte {deg}° — la parte hacia dentro se queda corta, así que el coche es empujado hacia fuera',
    fr: 'Relèvement {deg}° — la part vers l’intérieur est insuffisante, donc la voiture est poussée vers l’extérieur',
    hi: 'ढाल {deg}° — भीतरी अंश कम पड़ता है, इसलिए कार बाहर की ओर धकेली जाती है',
    id: 'Kemiringan {deg}° — bagian ke dalam kurang, sehingga mobil terdorong ke luar',
    pt: 'Inclinação {deg}° — a parcela para dentro não basta, então o carro é empurrado para fora',
  },
  'caption.in': {
    ko: '기울기 {deg}° — 안쪽으로 미는 몫이 넘쳐 안쪽으로 미끄러져 내려간다',
    en: 'Bank {deg}° — the inward share is too much, so the car slides down inward',
    ja: '傾き {deg}° — 内側へ押す分が多すぎて、内側へ滑り落ちる',
    zh: '倾角 {deg}° — 指向内侧的分量过多，汽车向内侧滑下',
    ar: 'الميل {deg}° — الحصة الداخلية زائدة، فتنزلق السيارة نازلةً إلى الداخل',
    es: 'Peralte {deg}° — la parte hacia dentro sobra, así que el coche se desliza hacia dentro, pendiente abajo',
    fr: 'Relèvement {deg}° — la part vers l’intérieur est trop grande, donc la voiture glisse vers le bas, vers l’intérieur',
    hi: 'ढाल {deg}° — भीतरी अंश ज़्यादा है, इसलिए कार भीतर की ओर नीचे फिसलती है',
    id: 'Kemiringan {deg}° — bagian ke dalam berlebih, sehingga mobil tergelincir turun ke dalam',
    pt: 'Inclinação {deg}° — a parcela para dentro é demais, então o carro escorrega para baixo, para dentro',
  },
} satisfies Record<string, LocalizedText>);

export type BankedCurveMessageKey = keyof typeof bankedCurveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: BankedCurveMessageKey): LocalizedText => bankedCurveMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BankedCurveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const bankedCurveSchema: BundleSchema = {
  id: BANKED_CURVE_ID,
  label: text('label.title'),
  category: 'mechanics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 빠르기·반지름은 주장이 아니다 (원본 inventory 「hidden」). 경사각만 조작기로 둔다.
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 340 px + 캡션 줄 + 조작기 줄. */
  canvas: { height: 430, minHeight: 400 },

  /**
   * 시간표를 두지 않는다. 원본은 단계 경계가 아니라 **누적 상태**로 움직인다 — 시도마다
   * 차가 적분되고, 벗어나는 시각은 기울기에 달렸으며(0° 는 0.77 초, 15° 는 약 1.1 초),
   * 조작기가 시도를 아무 때나 끊는다. 그래서 `step` 이 상태를 쌓는다.
   * 원본은 t = 0 에 차가 막 출발한 채로 열리므로 `startAt` · `preroll` 도 없다.
   */

  // 원본이 그린 순서 그대로 겹친다 — 안쪽 원판이 바깥 원판을 덮어 고리가 되고,
  // 단면의 차가 길 윗변을, 자취 위에 차가 얹힌다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 한 줄, 16 px 본문 먹색. 문장은 상태(단계 · 미리 안 결과 · 기울기)로 갈린다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [-12, -40] },
    align: 'left',
    fontSize: 16,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.in'),
    cases: [
      { when: 'caption.tilt', text: key('caption.tilt') },
      { when: 'caption.round', text: key('caption.round') },
      { when: 'caption.flat', text: key('caption.flat') },
      { when: 'caption.out', text: key('caption.out') },
    ],
    vars: { deg: 'caption.deg', to: 'caption.to' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 공식·빠르기·반지름·합력은 원본 inventory 「hidden」.

  messages: bankedCurveMessages,
};
