// ========================================================================
// barometer — 선언
// ========================================================================
// 질문: 수은 기둥의 높이는 왜 기압을 재는가.
//
// 위가 막힌 유리관을 수은 접시에 거꾸로 세웠다(토리첼리). 접시의 열린 수은 면을 바깥
// 공기가 내리누르는 화살표가 있고, 관 속 수은 기둥은 그 누름과 맞먹는 높이에 선다 —
// 기둥 위는 비어 있다(진공). 기압이 낮아지면 화살표가 짧아지고 기둥이 **내려앉으며**
// 위쪽 빈 곳이 늘어난다. 기압이 돌아오면 기둥도 다시 올라선다. 관 옆 눈금자는 접시
// 수면에서 잰 세로 높이다.
//
// 이웃과 겹치지 않는다. 머리 위 공기 기둥의 무게가 압력이라는 것(오를수록 준다)은
// `atmospheric-pressure`, 액주의 **차이**로 두 압력을 견주는 U자관은 `manometer` 의 몫이다.
// 이 조각은 「수은 기둥은 바깥 공기가 미는 만큼 서고, 기압이 바뀌면 그 높이가 따라
// 움직인다」 에 머문다. 기울인 관(세로 높이는 그대로)은 두 번째 주장이라 두지 않았다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:barometer` 와 문자 그대로 일치한다 (C4). */
export const BAROMETER_ID = 'barometer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 바닷가 기압(p₀)에서 수은 기둥의 세로 높이(cm). 눈금자에 이 값이 그대로 뜬다. */
export const COLUMN_HIGH = 76;
/**
 * 기압이 낮아졌을 때의 기둥 높이(cm). 57 — p₀ 의 ¾ 이다. 눈금자에 이 값이 그대로 뜨고,
 * 기압 화살표는 두 높이의 비(57/76)만큼 짧아진다.
 */
export const COLUMN_LOW = 57;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 cm. 접시의 열린 수은 면이 y = 0, 위가 높은 쪽이다.
// ------------------------------------------------------------------------

/** 유리관 바깥 반폭 · 안쪽 반폭(cm). 벽 두께는 선 굵기가 맡는다. */
export const TUBE_HALF = 3;
export const TUBE_INNER_HALF = 2.4;
/** 막힌 관 윗끝(cm)과 수은 속에 잠긴 아랫끝(cm). */
export const TUBE_TOP = 92;
export const TUBE_BOTTOM = -6;

/** 접시 — 반폭 · 바닥 · 가장자리 윗끝(cm). 수은은 수면(0)까지 차 있다. */
export const DISH_HALF = 36;
export const DISH_FLOOR = -10;
export const DISH_RIM = 4;

/** 기압 화살표가 놓이는 가로 자리(cm). 관 양쪽 수은 면 위. */
export const AIR_ARROWS_X: readonly number[] = [-28, -17, 17, 28];
/** 기압이 p₀ 일 때 화살표 길이(cm). 낮아지면 기둥 높이의 비만큼 준다. */
export const AIR_ARROW_AT_P0 = 30;

/** 눈금자 — 관 오른쪽, 수면(0)에서 위로. 가로 자리 · 길이 · 눈금(cm). */
export const RULER_X = 8;
export const RULER_LENGTH = 90;
export const RULER_TICKS: readonly number[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

/**
 * 프레이밍은 주장의 일부다. 세로는 접시 바닥 아래 캡션 줄부터 관 윗끝 조금 위까지,
 * 가로는 접시 양 끝까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -44, maxX: 44, minY: -24, maxY: 98 } as const;

// ------------------------------------------------------------------------
// 시간표 — 길이의 기본값 (단계 경계는 scene · physics 가 timeline 에게 묻는다)
// ------------------------------------------------------------------------

/** 바닷가 기압에서 기둥이 76 에 서 있는 동안(초). */
export const HIGH = 2.6;
/** 기압이 낮아지며 기둥이 내려앉는 동안. */
export const DROP = 2.6;
/** 낮은 기압에서 기둥이 57 에 머무는 동안. 비교가 끝나는 자리라 길게. */
export const LOW = 2.8;
/** 기압이 돌아오며 기둥이 다시 올라서는 동안. */
export const RISE = 2.2;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const barometerMessages = Object.freeze({
  'label.title': {
    ko: '기압계',
    en: 'Barometer',
    ja: '気圧計',
    zh: '气压计',
    ar: 'البارومتر',
    es: 'Barómetro',
    fr: 'Baromètre',
    hi: 'वायुदाबमापी',
    id: 'Barometer',
    pt: 'Barômetro',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '수은 기둥의 높이',
    en: 'The height of a mercury column',
    ja: '水銀柱の高さ',
    zh: '水银柱的高度',
    ar: 'ارتفاع عمود الزئبق',
    es: 'La altura de una columna de mercurio',
    fr: 'La hauteur d’une colonne de mercure',
    hi: 'पारे के स्तंभ की ऊँचाई',
    id: 'Tinggi kolom raksa',
    pt: 'A altura de uma coluna de mercúrio',
  },
  'label.stage': {
    ko: '바닷가와 낮은 기압',
    en: 'Sea level and low pressure',
    ja: '海面と低い気圧',
    zh: '海平面与低气压',
    ar: 'مستوى سطح البحر والضغط المنخفض',
    es: 'Nivel del mar y baja presión',
    fr: 'Niveau de la mer et basse pression',
    hi: 'समुद्र तल और निम्न दाब',
    id: 'Permukaan laut dan tekanan rendah',
    pt: 'Nível do mar e baixa pressão',
  },
  'label.view': {
    ko: '옆에서 본 토리첼리 관',
    en: "Torricelli's tube from the side",
    ja: '横から見たトリチェリ管',
    zh: '从侧面看托里拆利管',
    ar: 'أنبوب تورشيلي من الجانب',
    es: 'El tubo de Torricelli visto de lado',
    fr: 'Le tube de Torricelli vu de côté',
    hi: 'बगल से दिखती टॉरिसेली नली',
    id: 'Tabung Torricelli dari samping',
    pt: 'O tubo de Torricelli visto de lado',
  },
  /** 기압 기호. 수식 글자라 번역 대상이 아니다 (C1 판정 3). */
  'label.pressure': {
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
  'label.pressureP0': {
    ko: 'p₀',
    en: 'p₀',
    ja: 'p₀',
    zh: 'p₀',
    ar: 'p₀',
    es: 'p₀',
    fr: 'p₀',
    hi: 'p₀',
    id: 'p₀',
    pt: 'p₀',
  },
  /** 눈금자 단위. 표식이다 (C1 판정 3). */
  'label.unit': {
    ko: 'cm',
    en: 'cm',
    ja: 'cm',
    zh: 'cm',
    ar: 'cm',
    es: 'cm',
    fr: 'cm',
    hi: 'cm',
    id: 'cm',
    pt: 'cm',
  },
  'label.vacuum': {
    ko: '진공',
    en: 'vacuum',
    ja: '真空',
    zh: '真空',
    ar: 'فراغ',
    es: 'vacío',
    fr: 'vide',
    hi: 'निर्वात',
    id: 'vakum',
    pt: 'vácuo',
  },
  'caption.high': {
    ko: '공기가 수은 면을 누르는 만큼, 관 속 수은이 밀려 올라가 선다',
    en: 'Air presses on the open mercury, pushing the column up as far as that push can hold',
    ja: '空気がむき出しの水銀面を押し、その押す力が支えられるところまで柱を押し上げる',
    zh: '空气压在敞开的水银面上，把水银柱推高到这股压力能托住的高度',
    ar: 'يضغط الهواء على سطح الزئبق المكشوف، فيدفع العمود إلى أعلى بقدر ما يستطيع هذا الدفع أن يحمل',
    es: 'El aire presiona el mercurio al descubierto y empuja la columna hacia arriba hasta donde ese empuje puede sostenerla',
    fr: 'L’air appuie sur le mercure à l’air libre et pousse la colonne aussi haut que cette poussée peut la soutenir',
    hi: 'हवा खुले पारे पर दबाती है और स्तंभ को उतना ऊपर धकेलती है जितना वह दबाव थाम सकता है',
    id: 'Udara menekan permukaan raksa yang terbuka, mendorong kolom naik setinggi yang dapat ditahan dorongan itu',
    pt: 'O ar pressiona o mercúrio exposto e empurra a coluna para cima até onde esse empurrão consegue sustentá-la',
  },
  'caption.drop': {
    ko: '공기가 덜 누르면 기둥이 내려앉고, 위쪽 빈 곳이 늘어난다',
    en: 'When the air presses less, the column sinks and the empty space above it grows',
    ja: '空気の押す力が弱まると柱は下がり、その上の空いた部分が広がる',
    zh: '空气压得轻了，水银柱就下沉，上方的空隙变大',
    ar: 'عندما يقلّ ضغط الهواء، يهبط العمود ويتّسع الفراغ فوقه',
    es: 'Cuando el aire presiona menos, la columna baja y el espacio vacío de arriba crece',
    fr: 'Quand l’air appuie moins, la colonne descend et l’espace vide au-dessus s’agrandit',
    hi: 'जब हवा कम दबाती है, तो स्तंभ नीचे बैठ जाता है और उसके ऊपर का खाली स्थान बढ़ जाता है',
    id: 'Saat udara menekan lebih lemah, kolom turun dan ruang kosong di atasnya bertambah',
    pt: 'Quando o ar pressiona menos, a coluna desce e o espaço vazio acima dela aumenta',
  },
  'caption.low': {
    ko: '기압이 낮은 동안 기둥은 낮은 높이에 머문다',
    en: 'While the pressure stays low, the column stays low',
    ja: '気圧が低いあいだ、柱も低いままだ',
    zh: '气压低的时候，水银柱也一直低',
    ar: 'ما دام الضغط منخفضًا، يبقى العمود منخفضًا',
    es: 'Mientras la presión sigue baja, la columna sigue baja',
    fr: 'Tant que la pression reste basse, la colonne reste basse',
    hi: 'जब तक दाब कम रहता है, स्तंभ भी नीचा रहता है',
    id: 'Selama tekanan tetap rendah, kolom tetap rendah',
    pt: 'Enquanto a pressão fica baixa, a coluna fica baixa',
  },
  'caption.rise': {
    ko: '기압이 돌아오면 기둥도 다시 올라선다',
    en: 'When the pressure returns, the column climbs back up',
    ja: '気圧が戻ると、柱もふたたび上がる',
    zh: '气压恢复后，水银柱又升了回去',
    ar: 'عندما يعود الضغط، يرتفع العمود من جديد',
    es: 'Cuando la presión vuelve, la columna sube de nuevo',
    fr: 'Quand la pression revient, la colonne remonte',
    hi: 'दाब लौटने पर स्तंभ फिर ऊपर चढ़ जाता है',
    id: 'Saat tekanan kembali, kolom naik lagi',
    pt: 'Quando a pressão volta, a coluna sobe de novo',
  },
} satisfies Record<string, LocalizedText>);

export type BarometerMessageKey = keyof typeof barometerMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BarometerMessageKey): LocalizedText => barometerMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BarometerMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const barometerSchema: BundleSchema = {
  id: BAROMETER_ID,
  label: text('label.title'),
  category: 'fluids',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 기압이 낮아졌다 돌아오고, 기둥이 따라 내려앉았다 올라선다.
  parameters: [],

  stages: [
    {
      id: 'sea-level',
      label: text('label.stage'),
      constants: { columnHigh: COLUMN_HIGH, columnLow: COLUMN_LOW },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 관이 세로로 길다. 세로를 더 주면 그림만 작아진다 (S-piece). */
  canvas: { height: 420, minHeight: 380 },

  /**
   * 겹침이 판정 장치다. 수은은 관 벽 **아래**(벽이 수은 기둥을 감싸 보이게), 화살표 ·
   * 이름표는 맨 위. 층 순서로는 `region`(수은)이 선과 화살표 위로 올라온다.
   */
  drawOrder: 'scene',

  /** 한 주기 = 바닷가 기압 → 낮아짐 → 낮은 기압 → 돌아옴. 되돌아오므로 흐려짐 단계가 없다. */
  timeline: {
    phases: [
      { id: 'high', duration: HIGH, caption: key('caption.high') },
      { id: 'drop', duration: DROP, ease: 'smooth', caption: key('caption.drop') },
      { id: 'low', duration: LOW, caption: key('caption.low') },
      { id: 'rise', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 76 에 선 기둥을 잠깐 본 뒤 곧 기압이 낮아지기 시작한다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 세로 높이 하나라 관 옆 눈금자만 둔다. */

  messages: barometerMessages,
};
