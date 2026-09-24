// ========================================================================
// gravitational-slingshot — 선언
// ========================================================================
// 질문: 행성 곁을 스쳐 지나기만 했는데 왜 탐사선이 빨라지는가 — 중력은 들어올 때 당긴 만큼
// 나갈 때 도로 당기지 않는가.
//
// 같은 비행 하나를 두 틀에서 나란히 본다.
//
// - 왼쪽(행성과 함께 움직이는 틀) — 행성은 가만히 있고, 탐사선은 쌍곡선을 그리며 행성 뒤를
//   돌아 나간다. 들어올 때와 나갈 때의 빠르기가 같다(점 간격 · 화살표 길이가 같다). 방향만 꺾였다.
// - 오른쪽(태양 틀) — 행성이 공전 속도 V 로 오른쪽으로 달린다. 같은 비행인데 나갈 때가 들어올
//   때보다 훨씬 빠르다(점 간격이 벌어진다). 꺾인 속도 u 에 행성의 속도 V 가 더해지기 때문이고,
//   마지막에 두 끝에서 V + u 를 이어 붙여 보인다. 꺾인 뒤의 u 가 V 와 같은 쪽을 보니 더 길다.
//
// 늘어난 에너지는 행성의 공전에서 빌려 온 것이다 — 행성은 그만큼 느려지지만 너무 무거워서
// 화면에 드러나지 않는다. 이것은 캡션이 말하고 그림은 만들지 않는다 (NOTES (b)).
//
// 엔진으로 두 번 밀어 궤도를 옮기는 것(`orbital-transfer`)은 이 조각의 몫이 아니다 — 여기서는
// 엔진을 켜지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:gravitational-slingshot` 와 문자 그대로 일치한다 (C4). */
export const GRAVITATIONAL_SLINGSHOT_ID = 'gravitational-slingshot';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위계다 — 길이 · 시간 · 속도가 한 벌의 무차원 단위라 화면에 수를 띄우지 않는다.
// ------------------------------------------------------------------------

/** 중력 상수 × 행성 질량(월드 단위계). 접근 속도 · 꺾임 각과 함께 가장 가까운 거리를 정한다. */
export const GM = 2;
/** 행성 틀에서 본 먼 곳의 접근 속도 u∞. */
export const APPROACH_SPEED = 1;
/** 태양 틀에서 행성이 공전하는 속도 V. 화면 안에서는 오른쪽으로 곧게 달린다. */
export const PLANET_SPEED = 1;
/**
 * 행성 틀에서 탐사선의 방향이 꺾이는 각(도). 꺾임의 두 방향은 행성 진행 방향에 수직인 축을
 * 사이에 두고 대칭이다 — 같은 꺾임에서 속도를 가장 크게 얻는 배치다 (행성 뒤를 돈다).
 */
export const DEFLECTION_DEG = 120;
/** 비행의 반(월드 시간). 가장 가까운 순간 앞뒤로 이만큼을 그린다. */
export const FLIGHT_HALF = 1;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/** 속도 화살표 길이 배율(월드 길이 per 속도). 두 판 · 삼각형이 모두 같은 배율이다. */
export const ARROW_SCALE = 0.5;
/** 같은 시간 간격 점을 찍는 간격(월드 시간). 두 판이 같은 순간에 찍는다. */
export const STROBE_STEP = 0.1;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 두 판이 한 월드에 나란히 놓인다.
// ------------------------------------------------------------------------

/** 왼쪽 판(행성 틀)의 행성 자리. */
export const PLANET_FRAME_ORIGIN: readonly [number, number] = [0, 0];
/** 오른쪽 판(태양 틀)에서 가장 가까운 순간 행성이 지나는 자리. */
export const SUN_FRAME_ORIGIN: readonly [number, number] = [3.9, 0];
/** 두 판을 가르는 세로선의 x. */
export const DIVIDER_X = 2.3;
/** 판 이름표의 높이(월드 y)와 왼쪽 판 이름표의 왼쪽 끝 · 오른쪽 판 이름표의 오른쪽 끝. */
export const PANEL_LABEL_Y = 2.0;
export const PLANET_FRAME_LABEL_X = -0.6;
export const SUN_FRAME_LABEL_X = 7.45;

/**
 * 프레이밍은 주장의 일부다. 가로는 왼쪽 판(행성 뒤 가장 가까운 점 −0.31 · 판 이름표 −0.6)부터
 * 오른쪽 판(나가는 화살표 끝 약 7.3 · 판 이름표 7.45)까지, 세로는 들어오고 나가는 화살표 끝
 * (±2.15)에 캡션 줄을 아래에 더한다. 판 이름표는 두 판의 빈 위 모서리에 들어가 줄을 따로 쓰지
 * 않는다 — 세로가 비싸다 (S-piece). 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -0.7, maxX: 7.55, minY: -2.72, maxY: 2.28 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const gravitationalSlingshotMessages = Object.freeze({
  'label.title': {
    ko: '중력 도움',
    en: 'Gravity assist',
    ja: 'スイングバイ',
    zh: '引力助推',
    ar: 'المساعدة بالجاذبية',
    es: 'Asistencia gravitatoria',
    fr: 'Assistance gravitationnelle',
    hi: 'गुरुत्वीय सहायता',
    id: 'Asistensi gravitasi',
    pt: 'Assistência gravitacional',
  },
  'label.operation': {
    ko: '천체를 이용한 속도 변화',
    en: 'Changing speed by passing a planet',
    ja: '惑星のそばを通って速さを変える',
    zh: '掠过行星来改变速度',
    ar: 'تغيير السرعة بالمرور قرب كوكب',
    es: 'Cambiar de velocidad al pasar junto a un planeta',
    fr: 'Changer de vitesse en passant près d’une planète',
    hi: 'किसी ग्रह के पास से गुज़रकर चाल बदलना',
    id: 'Mengubah kelajuan dengan melintasi planet',
    pt: 'Mudar de velocidade passando por um planeta',
  },
  'label.stage': {
    ko: '행성 곁을 스치는 탐사선',
    en: 'A probe grazing a planet',
    ja: '惑星をかすめる探査機',
    zh: '掠过行星的探测器',
    ar: 'مسبار يمر محاذيًا لكوكب',
    es: 'Una sonda que roza un planeta',
    fr: 'Une sonde qui frôle une planète',
    hi: 'ग्रह के पास से गुज़रता अंतरिक्ष यान',
    id: 'Wahana yang melintas dekat planet',
    pt: 'Uma sonda que passa rente a um planeta',
  },
  'label.view': {
    ko: '두 틀',
    en: 'Two frames',
    ja: '二つの座標系',
    zh: '两个参考系',
    ar: 'إطاران مرجعيان',
    es: 'Dos sistemas de referencia',
    fr: 'Deux référentiels',
    hi: 'दो निर्देश तंत्र',
    id: 'Dua kerangka acuan',
    pt: 'Dois referenciais',
  },
  'label.planetFrame': {
    ko: '행성과 함께 보면',
    en: 'Moving with the planet',
    ja: '惑星とともに動いて見ると',
    zh: '随行星一起运动来看',
    ar: 'بالتحرك مع الكوكب',
    es: 'Moviéndose con el planeta',
    fr: 'En suivant la planète',
    hi: 'ग्रह के साथ चलते हुए',
    id: 'Bergerak bersama planet',
    pt: 'Movendo-se com o planeta',
  },
  'label.sunFrame': {
    ko: '태양에서 보면',
    en: 'Seen from the Sun',
    ja: '太陽から見ると',
    zh: '从太阳看',
    ar: 'كما يُرى من الشمس',
    es: 'Visto desde el Sol',
    fr: 'Vu depuis le Soleil',
    hi: 'सूर्य से देखने पर',
    id: 'Dilihat dari Matahari',
    pt: 'Visto do Sol',
  },
  /** 화살표 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.u': { ko: 'u', en: 'u', ja: 'u', zh: 'u', ar: 'u', es: 'u', fr: 'u', hi: 'u', id: 'u', pt: 'u' },
  'label.vIn': { ko: 'v₁', en: 'v₁', ja: 'v₁', zh: 'v₁', ar: 'v₁', es: 'v₁', fr: 'v₁', hi: 'v₁', id: 'v₁', pt: 'v₁' },
  'label.vOut': { ko: 'v₂', en: 'v₂', ja: 'v₂', zh: 'v₂', ar: 'v₂', es: 'v₂', fr: 'v₂', hi: 'v₂', id: 'v₂', pt: 'v₂' },
  'label.planetVelocity': { ko: 'V', en: 'V', ja: 'V', zh: 'V', ar: 'V', es: 'V', fr: 'V', hi: 'V', id: 'V', pt: 'V' },
  'caption.watch': {
    ko: '같은 비행을 두 곳에서 본다 — 점은 같은 시간마다 찍힌다',
    en: 'One flyby, watched from two places — a dot is left at every equal tick of time',
    ja: '一つのフライバイを二つの場所から見る — 点は等しい時間ごとに打たれる',
    zh: '同一次飞掠，从两处观看 — 每隔相等的时间留下一个点',
    ar: 'تحليق واحد يُشاهَد من مكانين — تُترك نقطة عند كل فترة زمنية متساوية',
    es: 'Un mismo sobrevuelo, visto desde dos lugares — se deja un punto a cada intervalo igual de tiempo',
    fr: 'Un même survol, vu de deux endroits — un point est laissé à chaque intervalle de temps égal',
    hi: 'एक ही उड़ान, दो जगहों से देखी गई — समय के हर बराबर अंतराल पर एक बिंदु छूटता है',
    id: 'Satu terbang lintas, diamati dari dua tempat — sebuah titik ditinggalkan setiap selang waktu yang sama',
    pt: 'Um mesmo sobrevoo, visto de dois lugares — um ponto é deixado a cada intervalo igual de tempo',
  },
  'caption.swing': {
    ko: '탐사선이 행성 뒤를 돌며 방향을 꺾는다',
    en: 'The probe swings around behind the planet and turns',
    ja: '探査機が惑星の後ろを回り込み、向きを変える',
    zh: '探测器绕到行星后方，改变方向',
    ar: 'يلتف المسبار خلف الكوكب ويغيّر اتجاهه',
    es: 'La sonda gira por detrás del planeta y cambia de dirección',
    fr: 'La sonde contourne la planète par l’arrière et change de direction',
    hi: 'यान ग्रह के पीछे से घूमकर मुड़ जाता है',
    id: 'Wahana berayun mengitari bagian belakang planet dan berbelok',
    pt: 'A sonda contorna o planeta por trás e muda de direção',
  },
  'caption.depart': {
    ko: '왼쪽에서는 점 간격이 들어올 때와 같아지고, 오른쪽에서는 점점 벌어진다',
    en: 'On the left the dots space out just as they came in; on the right they spread ever wider',
    ja: '左では点の間隔が入ってきたときと同じになり、右ではどんどん広がっていく',
    zh: '左边的点间距与进来时相同；右边的点间距越来越大',
    ar: 'على اليسار تتباعد النقاط كما كانت عند الدخول؛ وعلى اليمين تتسع أكثر فأكثر',
    es: 'A la izquierda los puntos se separan igual que al llegar; a la derecha se abren cada vez más',
    fr: 'À gauche, les points s’espacent comme à l’arrivée ; à droite, ils s’écartent de plus en plus',
    hi: 'बाईं ओर बिंदुओं की दूरी आते समय जितनी ही रहती है; दाईं ओर वे लगातार और फैलते जाते हैं',
    id: 'Di kiri jarak antartitik sama seperti saat datang; di kanan jaraknya makin lebar',
    pt: 'À esquerda os pontos se espaçam como na chegada; à direita se afastam cada vez mais',
  },
  'caption.compare': {
    ko: '행성과 함께 보면 같은 빠르기로 방향만 꺾였다 — 태양에서 보면 나갈 때가 훨씬 빠르다',
    en: 'Riding with the planet, it left at the same speed, only turned — seen from the Sun, it leaves far faster',
    ja: '惑星とともに見ると、同じ速さのまま向きだけが変わった — 太陽から見ると、出ていくときのほうがずっと速い',
    zh: '随行星来看，它以同样的快慢离开，只是转了向 — 从太阳看，它离开时快得多',
    ar: 'مع الكوكب، غادر بالسرعة نفسها ولم يتغير إلا اتجاهه — ومن الشمس، يغادر أسرع بكثير',
    es: 'Viajando con el planeta, salió con la misma rapidez, solo cambió de dirección — visto desde el Sol, sale mucho más rápido',
    fr: 'Avec la planète, il repart à la même vitesse, seulement dévié — vu depuis le Soleil, il repart bien plus vite',
    hi: 'ग्रह के साथ चलकर देखें तो वह उसी चाल से निकला, केवल मुड़ा — सूर्य से देखें तो वह कहीं अधिक तेज़ निकलता है',
    id: 'Bila ikut bergerak bersama planet, wahana pergi dengan kelajuan yang sama, hanya berbelok — dilihat dari Matahari, ia pergi jauh lebih cepat',
    pt: 'Acompanhando o planeta, saiu com a mesma rapidez, só mudou de direção — visto do Sol, sai muito mais rápido',
  },
  'caption.triangle': {
    ko: '꺾인 속도 u 에 행성의 속도 V 를 이어 붙이면 태양에서 본 속도다 — 나갈 때의 u 는 V 와 같은 쪽을 본다',
    en: 'Put the planet’s velocity V before the turned velocity u and you get the speed seen from the Sun — on the way out, u points along V',
    ja: '向きを変えた速度 u の前に惑星の速度 V をつなぐと、太陽から見た速度になる — 出ていくとき、u は V と同じ向きを向く',
    zh: '把行星的速度 V 接在转向后的速度 u 前面，就得到从太阳看的速度 — 离开时，u 指向与 V 相同的一侧',
    ar: 'ضع سرعة الكوكب V قبل السرعة المنحرفة u فتحصل على السرعة كما تُرى من الشمس — عند الخروج، تتجه u على امتداد V',
    es: 'Pon la velocidad del planeta V antes de la velocidad desviada u y obtienes la velocidad vista desde el Sol — a la salida, u apunta en el sentido de V',
    fr: 'Place la vitesse de la planète V avant la vitesse déviée u et tu obtiens la vitesse vue depuis le Soleil — à la sortie, u pointe dans le sens de V',
    hi: 'मुड़े हुए वेग u से पहले ग्रह का वेग V जोड़ो तो सूर्य से दिखने वाला वेग मिलता है — बाहर जाते समय u, V की ही दिशा में होता है',
    id: 'Pasang kecepatan planet V sebelum kecepatan u yang telah berbelok, maka didapat kecepatan dilihat dari Matahari — saat keluar, u searah dengan V',
    pt: 'Coloque a velocidade do planeta V antes da velocidade desviada u e você obtém a velocidade vista do Sol — na saída, u aponta no sentido de V',
  },
  'caption.borrow': {
    ko: '늘어난 에너지는 행성의 공전에서 빌려 왔다 — 행성은 그만큼 느려지지만 너무 무거워 드러나지 않는다',
    en: 'The extra energy was borrowed from the planet’s orbit — it slows by that much, too heavy for it to show',
    ja: '増えたエネルギーは惑星の公転から借りてきた — 惑星はその分だけ遅くなるが、重すぎて表に現れない',
    zh: '多出的能量是从行星的公转中借来的 — 行星因此慢了那么多，但它太重，看不出来',
    ar: 'الطاقة الزائدة مقترضة من مدار الكوكب — يتباطأ الكوكب بقدرها، لكنه أثقل من أن يظهر ذلك',
    es: 'La energía extra se tomó prestada de la órbita del planeta — este se frena en esa medida, pero es demasiado pesado para que se note',
    fr: 'L’énergie en plus a été empruntée à l’orbite de la planète — elle ralentit d’autant, mais elle est trop lourde pour que cela se voie',
    hi: 'बढ़ी हुई ऊर्जा ग्रह की परिक्रमा से उधार ली गई — ग्रह उतना धीमा होता है, पर इतना भारी है कि यह दिखता नहीं',
    id: 'Energi tambahan itu dipinjam dari orbit planet — planet melambat sebesar itu, tetapi terlalu berat untuk terlihat',
    pt: 'A energia extra foi emprestada da órbita do planeta — ele desacelera nessa medida, mas é pesado demais para que se note',
  },
} satisfies Record<string, LocalizedText>);

export type GravitationalSlingshotMessageKey = keyof typeof gravitationalSlingshotMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GravitationalSlingshotMessageKey): LocalizedText => gravitationalSlingshotMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GravitationalSlingshotMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const gravitationalSlingshotSchema: BundleSchema = {
  id: GRAVITATIONAL_SLINGSHOT_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 비행 하나를 두 틀로 견주는 것이 전부라, 값을 바꿔 볼 것이 주장에 없다 (NOTES (b)).
  parameters: [],

  stages: [
    {
      id: 'flyby',
      label: text('label.stage'),
      constants: {
        gm: GM,
        approachSpeed: APPROACH_SPEED,
        planetSpeed: PLANET_SPEED,
        deflectionDeg: DEFLECTION_DEG,
        flightHalf: FLIGHT_HALF,
        arrowScale: ARROW_SCALE,
        strobeStep: STROBE_STEP,
      },
    },
  ],

  environments: [],

  views: [{ id: 'two-frames', label: text('label.view'), default: true }],

  /**
   * 비행이 세로로 길다(들어오고 나가는 두 다리가 위아래로 벌어진다). 두 판을 가로로 나란히
   * 두어 세로를 한 번만 쓴다. 캡션 줄이 아래에 붙는다.
   */
  canvas: { height: 440, minHeight: 400 },

  /** 길 · 점 · 탐사선 · 화살표의 겹침 순서가 뜻을 갖는다 — 화살표가 맨 위다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 다가옴 → 스침 → 떠남 → (나가는 화살표) 견줌 → (삼각형) 이어 붙임 → 빌려 옴 → 흐려짐.
   *
   * 비행은 앞 세 단계에 걸친다. 물리는 `approach` 의 시작부터 `depart` 의 끝까지를 비행의 처음과
   * 끝(−flightHalf ~ +flightHalf)으로 읽는다 — 단계 경계를 코드에 두지 않는다. 가장 가까운 순간이
   * 빠르게 지나가므로 스침을 더 느리게 흘린다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 0.7, timeScale: 0.5, caption: key('caption.watch') },
      { id: 'swing', duration: 0.6, timeScale: 0.35, caption: key('caption.swing') },
      { id: 'depart', duration: 0.7, timeScale: 0.5, caption: key('caption.depart') },
      { id: 'reveal', duration: 0.4, ease: 'smooth', caption: key('caption.compare') },
      { id: 'compare', duration: 3.4, caption: key('caption.compare') },
      { id: 'build', duration: 0.6, ease: 'smooth', caption: key('caption.triangle') },
      { id: 'triangle', duration: 4.4, caption: key('caption.triangle') },
      { id: 'borrow', duration: 3.4, caption: key('caption.borrow') },
      { id: 'fade', duration: 0.6, caption: key('caption.borrow') },
    ],
  },

  /** 도착한 순간 탐사선이 이미 두 판에서 행성을 향해 날고 있다. */
  startAt: 0.15,

  // 슬롯 하나. 두 판 아래에 걸친다 — 두 판을 함께 말하는 문장이라 한쪽 판에 붙이지 않는다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 거리가 아니라 **같은 시간 간격 점의 간격**과
   * 화살표 길이다 — 격자를 깔면 「몇 칸 갔나」 라는 다른 읽기가 끼어든다.
   */

  messages: gravitationalSlingshotMessages,
};
