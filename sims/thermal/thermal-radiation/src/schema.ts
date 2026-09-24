// ========================================================================
// thermal-radiation — 선언
// ========================================================================
// 질문: 닿지도 않고 사이에 공기도 없는데, 뜨거운 것이 찬 것을 데울 수 있는가.
//
// 공기를 뺀 상자 안에 뜨거운 덩이와 떨어진 판이 있다. 둘은 아무것에도 닿아 있지
// 않다 — 전도할 길도, 흐를 공기(대류)도 없다. 가리개를 걷으면 덩이에서 나온 물결이
// 빈 곳을 건너 판에 닿고 판의 온도 막대가 오른다. 가리개를 다시 내리면 막대가 멈춘다.
//
// 복사는 적외선이라 색을 지어내지 않는다 — 물결 간격과 줄기 모양으로만 보인다.
// 스펙트럼 · T⁴ 는 이 조각의 질문이 아니다 (`blackbody-radiation` · `stefan-boltzmann-law`).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:thermal-radiation` 와 문자 그대로 일치한다 (C4). */
export const THERMAL_RADIATION_ID = 'thermal-radiation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 뜨거운 덩이의 온도(℃). 이름표에 그대로 뜬다. */
export const BLOCK_TEMP = 400;
/** 판의 처음 온도(℃) · 가리개가 다시 막을 때까지 오른 온도(℃). 막대 눈금에 그대로 뜬다. */
export const PLATE_START = 20;
export const PLATE_END = 45;
/** 판 온도 막대의 눈금 범위(℃). 아래 끝 · 위 끝. */
export const GAUGE_MIN = 0;
export const GAUGE_MAX = 60;
/** 덩이 오른쪽 면에서 판 왼쪽 면까지의 빈 거리(월드). */
export const GAP = 5.1;
/** 물결의 간격(월드) · 줄기 옆 흔들림 폭(월드) · 물결이 흘러가는 빠르기(월드/초). 표시 배율이다. */
export const WAVE_LENGTH = 0.42;
export const WAVE_AMP = 0.08;
export const RIPPLE_SPEED = 0.9;
/** 빼내기 전 상자 안 공기 알갱이 수 · 알갱이 속력(월드/초) · 흩뿌림 시드. */
export const AIR_COUNT = 34;
export const AIR_SPEED = 0.8;
export const AIR_SEED = 7;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 덩이는 왼쪽, 판은 오른쪽, 가리개는 그 사이.
// ------------------------------------------------------------------------

/** 진공 상자의 안쪽 벽. */
export const BOX = { minX: -4.1, maxX: 4.3, minY: -1.0, maxY: 1.0 } as const;

/** 뜨거운 덩이의 중심 x 와 크기 [가로, 세로]. 오른쪽 면이 물결이 나가는 자리다. */
export const BLOCK_X = -3.2;
export const BLOCK_SIZE: readonly [number, number] = [0.7, 1.0];

/** 판의 두께 · 높이. 판의 왼쪽 면 = 덩이 오른쪽 면 + `gap`. */
export const PLATE_SIZE: readonly [number, number] = [0.2, 1.1];

/** 물결 줄기가 지나는 높이. 셋이 판의 높이 안에 든다. */
export const BEAM_YS: readonly number[] = [0.3, 0, -0.3];

/** 가리개 — 덩이 면에서 `gap` 의 이만큼 떨어진 자리에 선다. 두께 · 높이. */
export const SHIELD_AT = 0.3;
export const SHIELD_SIZE: readonly [number, number] = [0.14, 0.95];
/** 걷은 가리개의 아래 끝이 윗벽에서 떨어지는 높이. 윗벽 틈으로 빠져나가 있다. */
export const SHIELD_CLEAR = 0.06;

/** 판 온도 막대 — 판 오른쪽 면에서 떨어진 거리 · 막대 폭 · 아래 · 위 끝 높이. */
export const GAUGE_OFFSET = 0.6;
export const GAUGE_W = 0.18;
export const GAUGE_BOTTOM = -0.6;
export const GAUGE_TOP = 0.6;

/** 펌프로 가는 구멍 — 아랫벽의 x · 구멍 반폭 · 관 길이. */
export const PORT_X = 1.4;
export const PORT_HALF = 0.12;
export const PIPE_LEN = 0.35;

/** 이름표 높이 — 덩이 · 판 · 막대 밑. `진공` 이름표 자리. */
export const LABEL_Y = -0.78;
export const VACUUM_LABEL: readonly [number, number] = [0.9, 0.72];

/**
 * 프레이밍은 주장의 일부다. 가로는 상자, 세로는 걷어 올린 가리개 위 이름표부터 펌프 이름표와
 * 캡션 줄까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.35, maxX: 4.55, minY: -2.05, maxY: 2.25 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

export const PUMP = 3;
/** 가리개가 오르내리는 동안. 줄기마다 가려짐이 풀리는 시각을 이 진행도에서 되짚으므로 `linear` 다. */
export const LIFT = 1;
/** 물결 앞머리가 가리개 자리에서 판까지 건너가는 동안. */
export const CROSS = 1.8;
export const WARM = 3;
export const DROP = 0.8;
/** 가리개를 이미 지난 물결 꼬리가 판까지 가는 동안. `cross` 와 같게 둬야 물결 빠르기가 같다. */
export const DRAIN = 1.8;
export const BLOCKED = 3;
export const FADE = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const thermalRadiationMessages = Object.freeze({
  'label.title': {
    ko: '열복사',
    en: 'Thermal radiation',
    ja: '熱放射',
    zh: '热辐射',
    ar: 'الإشعاع الحراري',
    es: 'Radiación térmica',
    fr: 'Rayonnement thermique',
    hi: 'ऊष्मीय विकिरण',
    id: 'Radiasi termal',
    pt: 'Radiação térmica',
  },
  'label.operation': {
    ko: '매질 없이 전달되는 열',
    en: 'Heat that travels without a medium',
    ja: '媒質なしに伝わる熱',
    zh: '无需介质传递的热',
    ar: 'حرارة تنتقل دون وسط',
    es: 'Calor que viaja sin un medio',
    fr: 'De la chaleur qui se propage sans milieu',
    hi: 'बिना माध्यम के चलने वाली ऊष्मा',
    id: 'Kalor yang merambat tanpa medium',
    pt: 'Calor que se propaga sem um meio',
  },
  'label.stage': {
    ko: '진공 상자',
    en: 'Vacuum box',
    ja: '真空の箱',
    zh: '真空箱',
    ar: 'صندوق مفرَّغ',
    es: 'Caja de vacío',
    fr: 'Boîte sous vide',
    hi: 'निर्वात बक्सा',
    id: 'Kotak vakum',
    pt: 'Caixa de vácuo',
  },
  'label.view': {
    ko: '옆에서 본 상자',
    en: 'Side view',
    ja: '側面図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  'label.block': {
    ko: '뜨거운 덩이 {t} ℃',
    en: 'Hot block {t} °C',
    ja: '熱いかたまり {t} °C',
    zh: '热块 {t} °C',
    ar: 'كتلة ساخنة {t} °C',
    es: 'Bloque caliente {t} °C',
    fr: 'Bloc chaud {t} °C',
    hi: 'गरम गुटका {t} °C',
    id: 'Balok panas {t} °C',
    pt: 'Bloco quente {t} °C',
  },
  'label.plate': {
    ko: '판',
    en: 'Plate',
    ja: '板',
    zh: '板',
    ar: 'اللوح',
    es: 'Placa',
    fr: 'Plaque',
    hi: 'प्लेट',
    id: 'Pelat',
    pt: 'Placa',
  },
  'label.gauge': {
    ko: '판의 온도',
    en: 'Plate temp.',
    ja: '板の温度',
    zh: '板的温度',
    ar: 'درجة حرارة اللوح',
    es: 'Temp. de la placa',
    fr: 'Temp. de la plaque',
    hi: 'प्लेट का ताप',
    id: 'Suhu pelat',
    pt: 'Temp. da placa',
  },
  'label.vacuum': {
    ko: '진공',
    en: 'Vacuum',
    ja: '真空',
    zh: '真空',
    ar: 'فراغ',
    es: 'Vacío',
    fr: 'Vide',
    hi: 'निर्वात',
    id: 'Vakum',
    pt: 'Vácuo',
  },
  'label.pump': {
    ko: '펌프로',
    en: 'To pump',
    ja: 'ポンプへ',
    zh: '通往泵',
    ar: 'إلى المضخة',
    es: 'A la bomba',
    fr: 'Vers la pompe',
    hi: 'पंप की ओर',
    id: 'Ke pompa',
    pt: 'Para a bomba',
  },
  'label.shield': {
    ko: '가리개',
    en: 'Shield',
    ja: '遮へい板',
    zh: '挡板',
    ar: 'الحاجز',
    es: 'Pantalla',
    fr: 'Écran',
    hi: 'ढाल',
    id: 'Penghalang',
    pt: 'Anteparo',
  },
  /** 막대 눈금 글자. 값은 스테이지 상수에서 온다. */
  'label.degC': {
    ko: '{t} ℃',
    en: '{t} °C',
    ja: '{t} °C',
    zh: '{t} °C',
    ar: '{t} °C',
    es: '{t} °C',
    fr: '{t} °C',
    hi: '{t} °C',
    id: '{t} °C',
    pt: '{t} °C',
  },
  'caption.pump': {
    ko: '상자에서 공기를 빼낸다 — 덩이와 판 사이는 가리개가 막고 있다',
    en: 'The air is pumped out of the box — a shield stands between the block and the plate',
    ja: '箱から空気を抜く — かたまりと板のあいだは遮へい板がふさいでいる',
    zh: '把箱内的空气抽出 — 热块与板之间有挡板隔着',
    ar: 'يُسحب الهواء من الصندوق — ويقف حاجز بين الكتلة واللوح',
    es: 'Se extrae el aire de la caja — una pantalla se interpone entre el bloque y la placa',
    fr: 'On pompe l’air hors de la boîte — un écran se dresse entre le bloc et la plaque',
    hi: 'बक्से से हवा निकाली जा रही है — गुटके और प्लेट के बीच एक ढाल खड़ी है',
    id: 'Udara dipompa keluar dari kotak — sebuah penghalang berdiri di antara balok dan pelat',
    pt: 'O ar é bombeado para fora da caixa — um anteparo fica entre o bloco e a placa',
  },
  'caption.lift': {
    ko: '가리개를 걷는다',
    en: 'The shield is lifted away',
    ja: '遮へい板を取り除く',
    zh: '挡板被移开',
    ar: 'يُرفع الحاجز بعيدًا',
    es: 'Se retira la pantalla',
    fr: 'L’écran est levé',
    hi: 'ढाल हटा दी जाती है',
    id: 'Penghalang diangkat',
    pt: 'O anteparo é retirado',
  },
  'caption.cross': {
    ko: '덩이에서 나온 물결이 빈 곳을 건너 판으로 간다',
    en: 'Waves from the block cross the empty space toward the plate',
    ja: 'かたまりから出た波が何もない空間を渡って板へ向かう',
    zh: '从热块发出的波穿过空无一物的空间射向板',
    ar: 'تعبر الموجات الخارجة من الكتلة الفراغ نحو اللوح',
    es: 'Las ondas del bloque cruzan el espacio vacío hacia la placa',
    fr: 'Les ondes issues du bloc traversent l’espace vide vers la plaque',
    hi: 'गुटके से निकली तरंगें खाली जगह पार करके प्लेट की ओर जाती हैं',
    id: 'Gelombang dari balok melintasi ruang kosong menuju pelat',
    pt: 'As ondas do bloco atravessam o espaço vazio em direção à placa',
  },
  'caption.warm': {
    ko: '물결을 받는 판이 {t0} ℃ 에서 데워진다 — 판은 아무것에도 닿지 않았고 사이에 공기도 없다',
    en: 'The plate, hit by the waves, warms up from {t0} °C — it touches nothing, and there is no air in between',
    ja: '波を受けた板が {t0} °C から温まる — 板は何にも触れておらず、あいだに空気もない',
    zh: '受到波照射的板从 {t0} °C 开始升温 — 它什么也没接触，中间也没有空气',
    ar: 'يسخن اللوح الذي تصيبه الموجات بدءًا من {t0} °C — وهو لا يلمس شيئًا، ولا هواء بينهما',
    es: 'La placa, alcanzada por las ondas, se calienta desde {t0} °C — no toca nada y no hay aire en medio',
    fr: 'La plaque, frappée par les ondes, se réchauffe à partir de {t0} °C — elle ne touche rien et il n’y a pas d’air entre les deux',
    hi: 'तरंगों से टकराई प्लेट {t0} °C से गरम होने लगती है — वह किसी चीज़ को नहीं छूती और बीच में हवा भी नहीं है',
    id: 'Pelat yang terkena gelombang menghangat dari {t0} °C — pelat tidak menyentuh apa pun, dan tak ada udara di antaranya',
    pt: 'A placa, atingida pelas ondas, esquenta a partir de {t0} °C — ela não toca em nada e não há ar no meio',
  },
  'caption.drop': {
    ko: '가리개를 다시 내린다',
    en: 'The shield is lowered again',
    ja: '遮へい板をふたたび下ろす',
    zh: '挡板再次放下',
    ar: 'يُنزَل الحاجز مرة أخرى',
    es: 'Se vuelve a bajar la pantalla',
    fr: 'L’écran est de nouveau abaissé',
    hi: 'ढाल फिर नीचे कर दी जाती है',
    id: 'Penghalang diturunkan lagi',
    pt: 'O anteparo é baixado de novo',
  },
  'caption.drain': {
    ko: '이미 가리개를 지난 물결이 판에 마저 닿는다',
    en: 'Waves already past the shield still reach the plate',
    ja: 'すでに遮へい板を過ぎた波は、そのまま板に届く',
    zh: '已越过挡板的波仍会到达板',
    ar: 'الموجات التي تجاوزت الحاجز بالفعل تظل تصل إلى اللوح',
    es: 'Las ondas que ya pasaron la pantalla aún llegan a la placa',
    fr: 'Les ondes déjà passées au-delà de l’écran atteignent encore la plaque',
    hi: 'जो तरंगें ढाल पार कर चुकी हैं, वे फिर भी प्लेट तक पहुँचती हैं',
    id: 'Gelombang yang sudah melewati penghalang tetap sampai ke pelat',
    pt: 'As ondas que já passaram o anteparo ainda chegam à placa',
  },
  'caption.blocked': {
    ko: '가리개가 물결을 막는 동안 판은 {t1} ℃ 에서 더 오르지 않는다',
    en: 'While the shield blocks the waves, the plate stays at {t1} °C',
    ja: '遮へい板が波をさえぎるあいだ、板は {t1} °C のままだ',
    zh: '挡板挡住波的时候，板保持在 {t1} °C',
    ar: 'ما دام الحاجز يصد الموجات يبقى اللوح عند {t1} °C',
    es: 'Mientras la pantalla bloquea las ondas, la placa se queda en {t1} °C',
    fr: 'Tant que l’écran bloque les ondes, la plaque reste à {t1} °C',
    hi: 'जब तक ढाल तरंगों को रोकती है, प्लेट {t1} °C पर बनी रहती है',
    id: 'Selama penghalang menahan gelombang, pelat tetap pada {t1} °C',
    pt: 'Enquanto o anteparo bloqueia as ondas, a placa fica em {t1} °C',
  },
} satisfies Record<string, LocalizedText>);

export type ThermalRadiationMessageKey = keyof typeof thermalRadiationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ThermalRadiationMessageKey): LocalizedText => thermalRadiationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ThermalRadiationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const thermalRadiationSchema: BundleSchema = {
  id: THERMAL_RADIATION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 공기가 빠지고, 가리개가 걷히고, 판이 데워지고, 다시 막힌다.
  parameters: [],

  stages: [
    {
      id: 'vacuum-box',
      label: text('label.stage'),
      constants: {
        blockTemp: BLOCK_TEMP,
        plateStart: PLATE_START,
        plateEnd: PLATE_END,
        gaugeMin: GAUGE_MIN,
        gaugeMax: GAUGE_MAX,
        gap: GAP,
        waveLength: WAVE_LENGTH,
        waveAmp: WAVE_AMP,
        rippleSpeed: RIPPLE_SPEED,
        airCount: AIR_COUNT,
        airSpeed: AIR_SPEED,
        seed: AIR_SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  canvas: { height: 360, minHeight: 320 },

  /**
   * 겹침이 판정 장치다. 가리개는 물결 **위**에 놓여야 물결이 가리개에서 끊긴 것으로
   * 읽히고, 공기 알갱이는 덩이 · 판 뒤로 지나가야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 공기 빼기 → 가리개 걷기 → 물결이 건너감 → 판이 데워짐 → 가리개 내리기 →
   * 지난 물결이 마저 닿음 → 막힌 채 멈춘 막대 → 흐려짐.
   *
   * `lift` · `drop` 은 `linear` 여야 한다 — 가리개 아래 끝이 줄기를 지나는 시각을 그
   * 진행도에서 되짚는다. `cross` · `drain` 은 같은 길이여야 물결 빠르기가 같다 (G129).
   */
  timeline: {
    phases: [
      { id: 'pump', duration: PUMP, ease: 'smooth', caption: key('caption.pump') },
      { id: 'lift', duration: LIFT, ease: 'linear', caption: key('caption.lift') },
      { id: 'cross', duration: CROSS, caption: key('caption.cross') },
      { id: 'warm', duration: WARM, caption: key('caption.warm') },
      { id: 'drop', duration: DROP, ease: 'linear', caption: key('caption.drop') },
      { id: 'drain', duration: DRAIN, caption: key('caption.drain') },
      { id: 'blocked', duration: BLOCKED, caption: key('caption.blocked') },
      { id: 'fade', duration: FADE, caption: key('caption.blocked') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 상자에 찬 공기 알갱이가 펌프 구멍 쪽으로 끌려가기 시작했다. */
  startAt: 0.3,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙 · 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 문안의 수는 스테이지 상수에서 온다 — initialState 가 글자로 옮겨 둔 state 경로 (G133).
    vars: { t0: 'plateStartText', t1: 'plateEndText' },
  },

  messages: thermalRadiationMessages,
};
