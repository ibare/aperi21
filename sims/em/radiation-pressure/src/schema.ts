// ========================================================================
// radiation-pressure — 선언
// ========================================================================
// 질문: 빛이 판을 민다면, 빛을 삼키는 판과 되튕기는 판 중 어느 쪽이 더 밀리는가?
//
// 두 레인에 같은 빛을 쬔다. 위는 검은 판(흡수), 아래는 거울 판(반사). 먼저 광자 하나씩을
// 보낸다 — 검은 판은 광자를 멈춰 세워 운동량 p 를 한 번 받고, 거울 판은 광자를 되돌려
// 보내며 p 를 한 번 더 받는다(판의 화살표가 p + p). 그다음 빛을 쉬지 않고 쬐면 두 판이
// 밀려나는데, 거울 판에 걸린 힘은 F + F 이고 밀린 거리도 그만큼 길다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radiation-pressure` 와 문자 그대로 일치한다 (C4). */
export const RADIATION_PRESSURE_ID = 'radiation-pressure';

// ------------------------------------------------------------------------
// 물리 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 1 = 1 m 로 그린다. 물리량은 SI 단위다.
// ------------------------------------------------------------------------

/** 빛의 세기(W/m²) — 지구 궤도의 햇빛. */
export const INTENSITY = 1361;
/** 빛의 속력(m/s). */
export const LIGHT_SPEED = 3e8;
/** 판 넓이(m²) · 질량(kg). 1 m² 에 10 g — 태양 돛 막의 면 밀도다. */
export const PLATE_AREA = 1;
export const PLATE_MASS = 0.01;

/**
 * 밀린 거리 과장 배율. 이 조건에서 검은 판은 밀기 단계 7 초 동안 약 1.1 cm 밀린다 — 그대로 그리면
 * 1 px 도 안 된다. 이 배율로 키우고 화면 모서리에 알린다 (NOTES b).
 */
export const PUSH_EXAGGERATION = 100;
/** 힘 → 화살표 길이 배율(m/N). 검은 판의 힘(약 4.5 μN)이 약 0.68 m 가 된다. */
export const FORCE_ARROW_SCALE = 1.5e5;
/** 광자 하나의 운동량 p 를 긋는 길이(m). 광자가 싣고 온 화살표와 판이 받은 화살표가 같은 배율이다. */
export const MOMENTUM_ARROW = 0.6;

/** 레인 가운데 높이(± m). 위가 검은 판, 아래가 거울 판이다. */
export const LANE_Y = 1.1;
/** 빛줄기의 반 높이(m). 흐르는 광자가 이 안에 흩어진다. */
export const BEAM_HALF = 0.3;
/** 광원 판의 x(m) · 판 앞면이 처음 선 x(m). */
export const SOURCE_X = -4.6;
export const PLATE_X = 0.2;
/** 판 두께 · 높이(m). */
export const PLATE_THICK = 0.16;
export const PLATE_HEIGHT = 1;

/** 광자 물결 묶음 — 길이(m) · 물결 수 · 진폭(m). 색이 아니라 물결로 빛임을 보인다 (G156). */
export const PACKET_LENGTH = 0.4;
export const PACKET_CYCLES = 4;
export const PACKET_AMPLITUDE = 0.07;
/** 흐르는 빛에서 한 레인에 초마다 떠나는 광자 수(그림용 — 세기는 `INTENSITY` 가 정한다, NOTES b). */
export const PHOTON_RATE = 6;
/** 흐르는 광자의 세로 자리를 뽑는 시드. 두 레인이 같은 빛을 받도록 같은 자리를 쓴다. */
export const SEED = 21;

// ------------------------------------------------------------------------
// 프레이밍 — 매 프레임 같은 값 (원칙 6)
// ------------------------------------------------------------------------

/**
 * 가로는 광원(−4.6)부터 가장 멀리 밀린 거울 판의 F + F 화살표 끝(약 4.0)과 이름표까지,
 * 세로는 위 레인 이름표부터 아래 레인 치수선까지. 아래에 캡션 띠를 더 둔다 (G24).
 */
export const SCENE_BOUNDS = { minX: -4.9, maxX: 4.6, minY: -2.5, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 광자 하나가 날아가는 동안 · 판에 닿아 멈추거나 되튕기는 동안 · 결과를 읽는 동안. */
const APPROACH = 2.4;
const HIT = 2;
const READ = 2.6;
/** 빛줄기가 판까지 차는 동안 · 판을 미는 동안 · 다음 주기로 흐려지는 동안. */
const FILL = 1.6;
const PUSH = 7;
const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radiationPressureMessages = Object.freeze({
  'label.title': {
    ko: '복사압',
    en: 'Radiation pressure',
    ja: '放射圧',
    zh: '辐射压',
    ar: 'ضغط الإشعاع',
    es: 'Presión de radiación',
    fr: 'Pression de radiation',
    hi: 'विकिरण दाब',
    id: 'Tekanan radiasi',
    pt: 'Pressão de radiação',
  },
  'label.operation': {
    ko: '빛이 미는 힘',
    en: 'The push of light',
    ja: '光が押す力',
    zh: '光的推力',
    ar: 'دفع الضوء',
    es: 'El empuje de la luz',
    fr: 'La poussée de la lumière',
    hi: 'प्रकाश का धक्का',
    id: 'Dorongan cahaya',
    pt: 'O empurrão da luz',
  },
  'label.stage': {
    ko: '햇빛',
    en: 'Sunlight',
    ja: '日光',
    zh: '阳光',
    ar: 'ضوء الشمس',
    es: 'Luz solar',
    fr: 'Lumière du Soleil',
    hi: 'सूर्य का प्रकाश',
    id: 'Sinar Matahari',
    pt: 'Luz solar',
  },
  'label.view': {
    ko: '옆에서 본 두 판',
    en: 'Two plates, side view',
    ja: '横から見た二枚の板',
    zh: '侧视的两块板',
    ar: 'لوحان، منظر جانبي',
    es: 'Dos placas, vista lateral',
    fr: 'Deux plaques, vue de côté',
    hi: 'दो प्लेटें, पार्श्व दृश्य',
    id: 'Dua pelat, tampak samping',
    pt: 'Duas placas, vista lateral',
  },
  'label.absorber': {
    ko: '검은 판',
    en: 'Black plate',
    ja: '黒い板',
    zh: '黑色板',
    ar: 'اللوح الأسود',
    es: 'Placa negra',
    fr: 'Plaque noire',
    hi: 'काली प्लेट',
    id: 'Pelat hitam',
    pt: 'Placa preta',
  },
  'label.mirror': {
    ko: '거울 판',
    en: 'Mirror plate',
    ja: '鏡の板',
    zh: '镜面板',
    ar: 'اللوح العاكس',
    es: 'Placa espejo',
    fr: 'Plaque miroir',
    hi: 'दर्पण प्लेट',
    id: 'Pelat cermin',
    pt: 'Placa espelhada',
  },
  /** 운동량 · 힘 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.p': {
    ko: 'p',
    en: 'p',
    ja: 'p',
    zh: 'p',
    ar: 'p',
    es: 'p',
    fr: 'p',
    hi: 'p',
    id: 'p',
    pt: 'p',
  },
  'label.f': {
    ko: 'F',
    en: 'F',
    ja: 'F',
    zh: 'F',
    ar: 'F',
    es: 'F',
    fr: 'F',
    hi: 'F',
    id: 'F',
    pt: 'F',
  },
  'label.exaggeration': {
    ko: '밀린 거리는 {k}배로 키워 그렸다',
    en: 'Displacement drawn {k}× larger',
    ja: '変位は {k}× に拡大して描いた',
    zh: '位移放大 {k}× 绘制',
    ar: 'الإزاحة مرسومة أكبر بـ {k}×',
    es: 'Desplazamiento dibujado {k}× más grande',
    fr: 'Déplacement dessiné {k}× plus grand',
    hi: 'विस्थापन {k}× बड़ा करके दिखाया गया',
    id: 'Perpindahan digambar {k}× lebih besar',
    pt: 'Deslocamento desenhado {k}× maior',
  },
  'caption.approach': {
    ko: '광자 하나하나가 운동량 p 를 싣고 판으로 날아간다',
    en: 'Each photon carries momentum p toward its plate',
    ja: '光子の一つひとつが運動量 p を運んで板へ飛んでいく',
    zh: '每个光子都携带动量 p 飞向它的板',
    ar: 'يحمل كل فوتون زخمًا p نحو لوحه',
    es: 'Cada fotón lleva un momento lineal p hacia su placa',
    fr: 'Chaque photon porte une quantité de mouvement p vers sa plaque',
    hi: 'प्रत्येक फोटॉन संवेग p लेकर अपनी प्लेट की ओर जाता है',
    id: 'Setiap foton membawa momentum p menuju pelatnya',
    pt: 'Cada fóton leva uma quantidade de movimento p rumo à sua placa',
  },
  'caption.hit': {
    ko: '검은 판은 광자를 멈춰 세우며 p 를 받고, 거울 판은 광자를 되돌려 보내며 p 를 한 번 더 받는다',
    en: 'The black plate stops its photon and takes p; the mirror sends its photon back and takes p once more',
    ja: '黒い板は光子を止めて p を受け取り、鏡の板は光子を跳ね返して p をもう一度受け取る',
    zh: '黑色板挡住光子并获得 p；镜面板把光子反弹回去，再获得一次 p',
    ar: 'يوقف اللوح الأسود فوتونه ويأخذ p؛ ويردّ اللوح العاكس فوتونه ويأخذ p مرة أخرى',
    es: 'La placa negra detiene su fotón y recibe p; el espejo devuelve su fotón y recibe p una vez más',
    fr: 'La plaque noire arrête son photon et reçoit p ; le miroir renvoie son photon et reçoit p une fois de plus',
    hi: 'काली प्लेट अपने फोटॉन को रोककर p लेती है; दर्पण अपने फोटॉन को लौटाकर एक बार और p लेता है',
    id: 'Pelat hitam menghentikan fotonnya dan menerima p; cermin memantulkan fotonnya dan menerima p sekali lagi',
    pt: 'A placa preta para seu fóton e recebe p; o espelho devolve seu fóton e recebe p mais uma vez',
  },
  'caption.fill': {
    ko: '이제 같은 빛을 두 판에 쉬지 않고 쬔다',
    en: 'Now the same light shines on both plates without pause',
    ja: '今度は同じ光を二枚の板に絶え間なく当てる',
    zh: '现在同样的光不间断地照在两块板上',
    ar: 'الآن يسطع الضوء نفسه على اللوحين دون توقف',
    es: 'Ahora la misma luz ilumina ambas placas sin pausa',
    fr: 'Maintenant la même lumière éclaire les deux plaques sans interruption',
    hi: 'अब वही प्रकाश दोनों प्लेटों पर बिना रुके पड़ता है',
    id: 'Kini cahaya yang sama menyinari kedua pelat tanpa henti',
    pt: 'Agora a mesma luz incide nas duas placas sem pausa',
  },
  'caption.push': {
    ko: '쉼 없이 부딪히는 광자가 판을 밀어 낸다 — 거울 판에는 같은 힘 F 가 겹으로 걸려 더 멀리 밀린다',
    en: 'Photons striking without pause push the plates — the mirror feels the same force F twice over and moves farther',
    ja: '絶え間なくぶつかる光子が板を押す — 鏡の板には同じ力 F が二重にかかり、より遠くへ押される',
    zh: '不断撞击的光子推动着板 — 镜面板受到两份同样的力 F，被推得更远',
    ar: 'الفوتونات التي تصطدم دون توقف تدفع اللوحين — ويتلقى اللوح العاكس القوة نفسها F مضاعفة فيتحرك أبعد',
    es: 'Los fotones que chocan sin pausa empujan las placas — el espejo recibe la misma fuerza F por partida doble y se aleja más',
    fr: 'Les photons qui frappent sans relâche poussent les plaques — le miroir subit deux fois la même force F et va plus loin',
    hi: 'बिना रुके टकराते फोटॉन प्लेटों को धकेलते हैं — दर्पण पर वही बल F दोगुना लगता है और वह अधिक दूर खिसकता है',
    id: 'Foton yang terus menumbuk mendorong pelat — cermin menerima gaya F yang sama dua kali lipat dan bergeser lebih jauh',
    pt: 'Os fótons que batem sem pausa empurram as placas — o espelho sente a mesma força F em dobro e vai mais longe',
  },
} satisfies Record<string, LocalizedText>);

export type RadiationPressureMessageKey = keyof typeof radiationPressureMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RadiationPressureMessageKey): LocalizedText => radiationPressureMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RadiationPressureMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const radiationPressureSchema: BundleSchema = {
  id: RADIATION_PRESSURE_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 빛이 두 판을 밀고 있다.
  parameters: [],

  stages: [
    {
      id: 'sunlight',
      label: text('label.stage'),
      constants: {
        intensity: INTENSITY,
        lightSpeed: LIGHT_SPEED,
        plateArea: PLATE_AREA,
        plateMass: PLATE_MASS,
        pushExaggeration: PUSH_EXAGGERATION,
        forceArrowScale: FORCE_ARROW_SCALE,
        momentumArrow: MOMENTUM_ARROW,
        laneY: LANE_Y,
        beamHalf: BEAM_HALF,
        sourceX: SOURCE_X,
        plateX: PLATE_X,
        plateThick: PLATE_THICK,
        plateHeight: PLATE_HEIGHT,
        packetLength: PACKET_LENGTH,
        packetCycles: PACKET_CYCLES,
        packetAmplitude: PACKET_AMPLITUDE,
        photonRate: PHOTON_RATE,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로 9.5 m · 세로 4.45 m. 세로가 비싸다 — 두 레인과 캡션 띠만 담는다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 겹침이 판정 장치다. 광자 묶음은 광원 판 **아래**로 지나 광원에서 막 나오는 것으로 읽히고,
   * 판이 받은 화살표는 판 몸통 **위**에 놓여야 가려지지 않는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 광자 하나씩 날아간다 → 판에 닿아 멈추거나 되튕긴다 → 받은 운동량을 읽는다
   * → 빛줄기가 찬다 → 두 판이 밀린다 → 흐려짐. 단계 경계는 여기에만 있다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'approach', duration: APPROACH, caption: key('caption.approach') },
      { id: 'hit', duration: HIT, ease: 'smooth', caption: key('caption.hit') },
      { id: 'read', duration: READ, caption: key('caption.hit') },
      { id: 'fill', duration: FILL, caption: key('caption.fill') },
      { id: 'push', duration: PUSH, caption: key('caption.push') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.push') },
    ],
  },

  /** 도착한 순간 이미 빛이 두 판을 밀고 있다 — 밀기 단계 한가운데에서 연다. */
  startAt: APPROACH + HIT + READ + FILL + PUSH / 2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 640,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것은 절대 거리가 아니라 두 판의 견줌이다.

  messages: radiationPressureMessages,
};
