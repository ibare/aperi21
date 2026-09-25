// ========================================================================
// geostationary-orbit — 선언
// ========================================================================
// 질문: 왜 어떤 위성은 하늘의 한 자리에 멈춰 있는가.
//
// 북극 위에서 내려다본, 도는 지구와 그 위의 기지국 하나. 세 높이의 원 궤도에 위성이
// 하나씩 돈다. 낮은 위성은 지구보다 빨리 돌아 기지국을 앞질러 가고, 높은 위성은 뒤처진다.
// 딱 한 높이에서만 한 바퀴가 지구의 한 바퀴와 같아 — 기지국과 이은 선이 늘 곧게 서 있고,
// 기지국에서 올려다본 하늘에서 그 위성은 머리 위에 멈춰 있다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가깝게 잡은 임의 단위, y 는 위.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:geostationary-orbit` 와 문자 그대로 일치한다 (C4). */
export const GEOSTATIONARY_ORBIT_ID = 'geostationary-orbit';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 지구의 중력 변수 GM (km³/s²). 위성의 주기는 이것과 반지름에서 나온다. */
export const GM_KM3_S2 = 398600;
/** 지구가 한 바퀴 도는 시간(초) — 항성일. 「하루」 의 물리값이다. */
export const ROTATION_SECONDS = 86164;
/** 지구 반지름(km). */
export const EARTH_RADIUS_KM = 6371;
/** 세 궤도의 반지름(지구 중심에서, km). 낮은 것은 GPS 높이(주기 약 반나절). */
export const LOW_RADIUS_KM = 26560;
/** 정지 궤도 — 주기가 지구의 한 바퀴와 같은 높이. */
export const GEO_RADIUS_KM = 42164;
/** 높은 것은 주기가 하루 반인 높이 — 사흘에 두 바퀴라 한 주기(사흘) 끝에 제자리로 온다. */
export const HIGH_RADIUS_KM = 55250;

/**
 * 첫 순간 각 위성이 기지국 머리 위에서 얼마나 떨어져 있는지(도, 동쪽 = 자전 방향이 +).
 * 정지 위성은 머리 위(0). 높은 위성은 첫날 한낮에, 낮은 위성은 둘째 날 조금 늦게 머리 위를
 * 지나도록 골랐다 — 두 위성이 한꺼번에 머리 위를 지나 정지 위성과 한 선에 겹치지 않게.
 */
export const GEO_START_DEG = 0;
export const LOW_START_DEG = 144;
export const HIGH_START_DEG = 60;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 840), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 840;

/**
 * 왼쪽 판 — 북극 위에서 내려다본 지구와 궤도. 지구 · 궤도는 같은 축척이다(km → 월드).
 * 가장 높은 궤도(55250 km)가 반지름 165 가 되는 축척.
 */
export const ORBIT_VIEW = { cx: 215, cy: 190, kmPerUnit: 335 } as const;
/** 기지국이 첫 순간 선 자리(라디안) — 지구 꼭대기. */
export const STATION_START_ANGLE = Math.PI / 2;
/** 도는 지구를 드러내는 경선 살의 수(가운데를 지나는 지름 수). */
export const MERIDIAN_COUNT = 3;

/** 오른쪽 판 — 기지국에서 올려다본 하늘(적도면의 반원). 가운데가 기지국, 꼭대기가 머리 위. */
export const SKY = { cx: 640, cy: 118, R: 150 } as const;

/**
 * 고정 경계. 두 판 + 아래 캡션 두 줄 자리. 캡션 슬롯이 그림을 덮지 않게 세로를 아래로
 * 늘렸다 (장부 G24). 가장 높은 궤도가 들어가도록 처음부터 잡는다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -54, maxY: 372 } as const;

// ------------------------------------------------------------------------
// 시간표 — 한 주기 = 사흘. 하루가 한 단계다.
// ------------------------------------------------------------------------

/** 화면에서 지구가 한 바퀴 도는 시간(초) = 한 단계의 길이. */
export const DAY_SECONDS = 6;
/** 도착한 순간 — 첫날의 10 분의 1. 정지 위성은 머리 위, 높은 위성은 동쪽 하늘에 있다. */
export const START_AT = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const geostationaryOrbitMessages = Object.freeze({
  'label.title': {
    ko: '정지 궤도',
    en: 'Geostationary orbit',
    ja: '静止軌道',
    zh: '地球静止轨道',
    ar: 'المدار الثابت بالنسبة للأرض',
    es: 'Órbita geoestacionaria',
    fr: 'Orbite géostationnaire',
    hi: 'भूस्थिर कक्षा',
    id: 'Orbit geostasioner',
    pt: 'Órbita geoestacionária',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '자전 주기와 같은 궤도',
    en: 'An orbit as long as one turn of Earth',
    ja: '地球の自転一回と同じ長さの軌道',
    zh: '周期与地球自转一圈相同的轨道',
    ar: 'مدار يستغرق ما تستغرقه دورة واحدة للأرض حول نفسها',
    es: 'Una órbita que dura lo mismo que una vuelta de la Tierra',
    fr: 'Une orbite qui dure autant qu’un tour de la Terre',
    hi: 'पृथ्वी के एक घूर्णन जितनी लंबी कक्षा',
    id: 'Orbit yang lamanya sama dengan satu putaran Bumi',
    pt: 'Uma órbita que dura o mesmo que uma volta da Terra',
  },
  'label.stage': {
    ko: '지구와 세 위성',
    en: 'Earth and three satellites',
    ja: '地球と三つの衛星',
    zh: '地球和三颗卫星',
    ar: 'الأرض وثلاثة أقمار صناعية',
    es: 'La Tierra y tres satélites',
    fr: 'La Terre et trois satellites',
    hi: 'पृथ्वी और तीन उपग्रह',
    id: 'Bumi dan tiga satelit',
    pt: 'A Terra e três satélites',
  },
  'label.view': {
    ko: '북극 위에서',
    en: 'From above the North Pole',
    ja: '北極の上から',
    zh: '从北极上方看',
    ar: 'من فوق القطب الشمالي',
    es: 'Desde encima del Polo Norte',
    fr: 'Vu au-dessus du pôle Nord',
    hi: 'उत्तरी ध्रुव के ऊपर से',
    id: 'Dari atas Kutub Utara',
    pt: 'Visto de cima do Polo Norte',
  },
  'label.topView': {
    ko: '북극 위에서 내려다본 지구',
    en: 'Earth seen from above the North Pole',
    ja: '北極の上から見下ろした地球',
    zh: '从北极上方俯视的地球',
    ar: 'الأرض كما تُرى من فوق القطب الشمالي',
    es: 'La Tierra vista desde encima del Polo Norte',
    fr: 'La Terre vue au-dessus du pôle Nord',
    hi: 'उत्तरी ध्रुव के ऊपर से देखी गई पृथ्वी',
    id: 'Bumi dilihat dari atas Kutub Utara',
    pt: 'A Terra vista de cima do Polo Norte',
  },
  'label.lowOrbit': {
    ko: '낮은 궤도',
    en: 'low orbit',
    ja: '低い軌道',
    zh: '低轨道',
    ar: 'مدار منخفض',
    es: 'órbita baja',
    fr: 'orbite basse',
    hi: 'निम्न कक्षा',
    id: 'orbit rendah',
    pt: 'órbita baixa',
  },
  'label.geoOrbit': {
    ko: '정지 궤도',
    en: 'geostationary orbit',
    ja: '静止軌道',
    zh: '地球静止轨道',
    ar: 'مدار ثابت بالنسبة للأرض',
    es: 'órbita geoestacionaria',
    fr: 'orbite géostationnaire',
    hi: 'भूस्थिर कक्षा',
    id: 'orbit geostasioner',
    pt: 'órbita geoestacionária',
  },
  'label.highOrbit': {
    ko: '높은 궤도',
    en: 'high orbit',
    ja: '高い軌道',
    zh: '高轨道',
    ar: 'مدار مرتفع',
    es: 'órbita alta',
    fr: 'orbite haute',
    hi: 'उच्च कक्षा',
    id: 'orbit tinggi',
    pt: 'órbita alta',
  },
  'label.geoRadius': {
    ko: '{r} km',
    en: '{r} km',
    ja: '{r} km',
    zh: '{r} km',
    ar: '{r} km',
    es: '{r} km',
    fr: '{r} km',
    hi: '{r} km',
    id: '{r} km',
    pt: '{r} km',
  },
  'label.station': {
    ko: '기지국',
    en: 'station',
    ja: '地上局',
    zh: '地面站',
    ar: 'المحطة',
    es: 'estación',
    fr: 'station',
    hi: 'स्टेशन',
    id: 'stasiun',
    pt: 'estação',
  },
  'label.sky': {
    ko: '기지국에서 올려다본 하늘',
    en: 'The sky seen from the station',
    ja: '地上局から見上げた空',
    zh: '从地面站仰望的天空',
    ar: 'السماء كما تُرى من المحطة',
    es: 'El cielo visto desde la estación',
    fr: 'Le ciel vu depuis la station',
    hi: 'स्टेशन से दिखता आकाश',
    id: 'Langit dilihat dari stasiun',
    pt: 'O céu visto da estação',
  },
  'label.overhead': {
    ko: '머리 위',
    en: 'overhead',
    ja: '真上',
    zh: '头顶',
    ar: 'سمت الرأس',
    es: 'cenit',
    fr: 'zénith',
    hi: 'सिर के ऊपर',
    id: 'tepat di atas',
    pt: 'zênite',
  },
  'label.west': {
    ko: '서',
    en: 'W',
    ja: '西',
    zh: '西',
    ar: 'غرب',
    es: 'O',
    fr: 'O',
    hi: 'पश्चिम',
    id: 'B',
    pt: 'O',
  },
  'label.east': {
    ko: '동',
    en: 'E',
    ja: '東',
    zh: '东',
    ar: 'شرق',
    es: 'E',
    fr: 'E',
    hi: 'पूर्व',
    id: 'T',
    pt: 'L',
  },
  'caption.high': {
    ko: '높은 궤도의 위성은 지구보다 느리게 돈다 — 기지국이 앞서 가 버려, 하늘에서 서쪽으로 처진다.',
    en: 'The high satellite goes round more slowly than Earth turns — the station runs ahead, and the satellite falls behind to the west.',
    ja: '高い軌道の衛星は地球の自転よりゆっくり回る — 地上局が先に進んでしまい、衛星は空で西へ遅れていく。',
    zh: '高轨道卫星绕行比地球自转慢 — 地面站跑到前面，卫星在天空中向西落后。',
    ar: 'يدور القمر الصناعي المرتفع أبطأ من دوران الأرض — تسبقه المحطة، فيتخلّف القمر نحو الغرب.',
    es: 'El satélite alto da la vuelta más despacio de lo que gira la Tierra — la estación se adelanta y el satélite se queda atrás hacia el oeste.',
    fr: 'Le satellite haut tourne plus lentement que la Terre — la station prend de l’avance, et le satellite recule vers l’ouest.',
    hi: 'ऊँचा उपग्रह पृथ्वी के घूमने से धीमे चक्कर लगाता है — स्टेशन आगे निकल जाता है, और उपग्रह पश्चिम की ओर पिछड़ जाता है।',
    id: 'Satelit tinggi beredar lebih lambat daripada putaran Bumi — stasiun melaju lebih dulu, dan satelit tertinggal ke arah barat.',
    pt: 'O satélite alto dá a volta mais devagar do que a Terra gira — a estação passa à frente, e o satélite fica para trás, a oeste.',
  },
  'caption.low': {
    ko: '낮은 궤도의 위성은 지구보다 빨리 돈다 — 서쪽에서 떠올라 기지국 머리 위를 앞질러 동쪽으로 진다.',
    en: 'The low satellite goes round faster than Earth turns — it rises in the west, overtakes the station overhead and sets in the east.',
    ja: '低い軌道の衛星は地球の自転より速く回る — 西から昇り、地上局の真上を追い越して東に沈む。',
    zh: '低轨道卫星绕行比地球自转快 — 它从西方升起，在地面站头顶上方超过去，在东方落下。',
    ar: 'يدور القمر الصناعي المنخفض أسرع من دوران الأرض — يشرق من الغرب، ويتجاوز المحطة من فوق رأسها، ويغرب في الشرق.',
    es: 'El satélite bajo da la vuelta más deprisa de lo que gira la Tierra — sale por el oeste, adelanta a la estación por el cenit y se pone por el este.',
    fr: 'Le satellite bas tourne plus vite que la Terre — il se lève à l’ouest, dépasse la station au zénith et se couche à l’est.',
    hi: 'नीचा उपग्रह पृथ्वी के घूमने से तेज़ चक्कर लगाता है — वह पश्चिम में उगता है, स्टेशन के सिर के ऊपर से आगे निकलता है और पूर्व में डूबता है।',
    id: 'Satelit rendah beredar lebih cepat daripada putaran Bumi — ia terbit di barat, menyalip stasiun tepat di atasnya, lalu terbenam di timur.',
    pt: 'O satélite baixo dá a volta mais depressa do que a Terra gira — nasce no oeste, ultrapassa a estação pelo zênite e se põe no leste.',
  },
  'caption.geo': {
    ko: '이 높이에서만 한 바퀴가 지구의 한 바퀴와 같다 — 기지국과 이은 선이 늘 곧게 서 있고, 위성은 머리 위에 멈춰 있다.',
    en: 'Only at this height does one lap take exactly one turn of Earth — the line to the station stays upright, and the satellite hangs overhead.',
    ja: 'この高さでだけ、一周がちょうど地球の自転一回と同じになる — 地上局と結んだ線はいつもまっすぐ立ち、衛星は真上に止まっている。',
    zh: '只有在这个高度，绕行一圈恰好等于地球自转一圈 — 与地面站的连线始终竖直，卫星停在头顶。',
    ar: 'عند هذا الارتفاع وحده تستغرق الدورة الواحدة دورة واحدة للأرض تمامًا — يبقى الخط الواصل بالمحطة قائمًا، ويظل القمر الصناعي معلقًا في سمت الرأس.',
    es: 'Solo a esta altura una vuelta dura exactamente un giro de la Tierra — la línea hasta la estación se mantiene vertical y el satélite queda fijo en el cenit.',
    fr: 'À cette hauteur seulement, un tour dure exactement une rotation de la Terre — la ligne vers la station reste droite, et le satellite reste suspendu au zénith.',
    hi: 'केवल इसी ऊँचाई पर एक चक्कर ठीक पृथ्वी के एक घूर्णन जितना होता है — स्टेशन से जुड़ी रेखा सदा सीधी खड़ी रहती है, और उपग्रह सिर के ऊपर ठहरा रहता है।',
    id: 'Hanya pada ketinggian ini satu putaran tepat sama dengan satu putaran Bumi — garis ke stasiun tetap tegak, dan satelit diam tepat di atas.',
    pt: 'Só nesta altura uma volta leva exatamente um giro da Terra — a linha até a estação fica sempre de pé, e o satélite fica parado no zênite.',
  },
} satisfies Record<string, LocalizedText>);

export type GeostationaryOrbitMessageKey = keyof typeof geostationaryOrbitMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: GeostationaryOrbitMessageKey): LocalizedText => geostationaryOrbitMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: GeostationaryOrbitMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const geostationaryOrbitSchema: BundleSchema = {
  id: GEOSTATIONARY_ORBIT_ID,
  label: text('label.title'),
  category: 'astro',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 지구가 돌고 있고, 세 위성이 제 빠르기로 돈다.
  parameters: [],

  stages: [
    {
      id: 'earth-satellites',
      label: text('label.stage'),
      constants: {
        gm: GM_KM3_S2,
        rotationSeconds: ROTATION_SECONDS,
        earthRadiusKm: EARTH_RADIUS_KM,
        lowRadiusKm: LOW_RADIUS_KM,
        geoRadiusKm: GEO_RADIUS_KM,
        highRadiusKm: HIGH_RADIUS_KM,
        lowStartDeg: LOW_START_DEG,
        geoStartDeg: GEO_START_DEG,
        highStartDeg: HIGH_START_DEG,
      },
    },
  ],
  environments: [],
  views: [{ id: 'north-pole', label: text('label.view'), default: true }],

  /** 판 840 × 372 + 캡션 두 줄. 세로는 가장 높은 궤도의 지름이 정한다. */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다 — 정지 위성과 이은 선은 「머리 위」 점선 **위**에 얹혀야 그 선과
   * 하나로 겹친 것이 보이고, 위성 점은 선 위에 와야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 사흘, 하루가 한 단계다. 지구의 회전각을 세 단계의 진행도 합에서 읽는다
   * (physics `elapsedDays`) — 단계 하나 = 지구 한 바퀴. 고르게 돈다(linear).
   * 세 궤도의 주기가 하루의 ½ · 1 · 1½ 배라 사흘 끝에 모두 첫 자리로 돌아와 튀지 않는다.
   * 단계마다 캡션이 한 위성에 초점을 둔다 — 높은 것(첫날 한낮에 머리 위를 지난다) ·
   * 낮은 것(둘째 날 머리 위를 앞지른다) · 정지 위성(셋째 날 — 앞머리에는 둘이 모두 져서 혼자 남는다).
   */
  timeline: {
    phases: [
      { id: 'high', duration: DAY_SECONDS, ease: 'linear', caption: key('caption.high') },
      { id: 'low', duration: DAY_SECONDS, ease: 'linear', caption: key('caption.low') },
      { id: 'geo', duration: DAY_SECONDS, ease: 'linear', caption: key('caption.geo') },
    ],
  },

  /** 도착한 순간 이미 돌고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 궤도 주기의 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 32,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것이 거리가 아니라 「기지국과 이은 선이 서 있나」 다.

  messages: geostationaryOrbitMessages,
};
