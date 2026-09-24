// ========================================================================
// solar-altitude-shadow — 선언
// ========================================================================
// 질문: 해가 높이 뜨면 왜 그림자가 짧아지고 땅이 더 데워지는가.
//
// 땅 위에 막대 하나를 세우고 옆에서 본다. 햇빛은 평행하게 고도 α 로 들어온다.
// - 그림자 길이 = 막대 높이 / tan α — 해가 낮으면 그림자가 길게 눕는다.
// - 같은 폭 W 의 햇빛 다발이 땅에 닿는 길이 = W / sin α — 해가 낮으면 같은 빛이 넓게
//   퍼져 땅 한 칸이 받는 빛(넓이당)은 sin α 배로 줄어든다. 그래서 덜 데워진다.
//
// 하늘에서 태양이 지나는 길 · 낮 길이는 이웃 조각(seasonal-sun-path)의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// 월드 단위는 캔버스 px 에 가까운 임의 단위, y 는 위, 땅이 y = 0.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:solar-altitude-shadow` 와 문자 그대로 일치한다 (C4). */
export const SOLAR_ALTITUDE_SHADOW_ID = 'solar-altitude-shadow';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 태양 고도(도)의 세 정박값 — 낮게 · 중간 · 높게. 화면의 「{alt}°」 는 이 값을 그대로 쓴다. */
export const ALT_LOW_DEG = 20;
export const ALT_MID_DEG = 45;
export const ALT_HIGH_DEG = 70;
/** 막대 높이(월드). 그림자 길이 = 이 값 / tan α. */
export const STICK_HEIGHT = 90;
/** 햇빛 다발의 폭(월드) — 다발에 수직으로 잰 폭. 땅에 닿는 길이 = 이 값 / sin α. */
export const BEAM_WIDTH = 46;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(가로 900 판), y 위
// ------------------------------------------------------------------------

export const CANVAS_W = 900;

/** 왼쪽 판 — 막대와 그림자. 땅 띠의 가로 범위와 막대 발 자리. */
export const SHADOW_PANEL = { x0: 20, x1: 480, footX: 190 } as const;
/** 오른쪽 판 — 햇빛 다발이 닿는 땅. 땅 띠의 가로 범위와 다발이 닿는 가운데. */
export const BEAM_PANEL = { x0: 510, x1: 810, hitX: 690 } as const;
/** 땅 띠의 두께(월드) — 땅선 아래로 햇빛을 받는 면 · 그림자를 칠하는 띠. */
export const GROUND_BAND = 9;
/** 태양 원판 — 막대 끝에서 햇빛 쪽으로 이만큼 떨어진 자리(월드) · 반지름. */
export const SUN_DISTANCE = 160;
export const SUN_R = 15;
/** 햇빛 다발의 길이(월드) — 땅에서 태양 쪽으로 이만큼 그린다. */
export const BEAM_LENGTH = 150;
/** 다발 안에 긋는 빛줄기 수(가장자리 포함). 땅에 닿는 간격이 벌어지는 것이 보인다. */
export const BEAM_RAYS = 6;
/** 「넓이당 햇빛」 막대 — 가운데 가로 자리 · 폭 · 해가 머리 위(sin α = 1)일 때 높이(월드). */
export const PER_AREA_BAR = { x: 852, w: 20, full: 150 } as const;
/**
 * 그늘 · 다발 밖 땅의 빛 세기 — 0 이면 다크 바탕과 같아진다(이웃 조각과 같은 값). 햇빛 받는 땅은 1.
 */
export const NIGHT_LIGHT = 0.04;

/**
 * 고정 경계. 가장 높은 태양(70°)과 아래 캡션 두 줄 자리까지 처음부터 담는다.
 * 캡션 슬롯이 그림을 덮지 않게 세로를 아래로 늘렸다 (장부 G24).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -100, maxY: 286 } as const;

// ------------------------------------------------------------------------
// 시간표
// ------------------------------------------------------------------------

/** 정박 고도에 머무는 시간(초). */
export const HOLD = 3.2;
/** 다음 정박 고도로 오르는 시간(초). */
export const RISE = 2.2;
/** 높은 고도에서 낮은 고도로 다시 내려가는 시간(초). */
export const FALL = 3;
/** 도착한 순간 — 낮은 해가 이미 긴 그림자를 드리운 채 머물고 있다. */
export const START_AT = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const solarAltitudeShadowMessages = Object.freeze({
  'label.title': {
    ko: '태양 고도와 그림자',
    en: 'Solar altitude and shadows',
    ja: '太陽高度と影',
    zh: '太阳高度与影子',
    ar: 'ارتفاع الشمس والظلال',
    es: 'Altura del Sol y sombras',
    fr: 'Hauteur du Soleil et ombres',
    hi: 'सूर्य की ऊँचाई और छायाएँ',
    id: 'Ketinggian Matahari dan bayang-bayang',
    pt: 'Altura do Sol e sombras',
  },
  'label.operation': {
    ko: '고도가 바뀌면 그림자 길이와 기온이 함께 바뀐다',
    en: 'As the Sun’s altitude changes, shadow length and warmth change together',
    ja: '太陽高度が変わると、影の長さと暖かさがいっしょに変わる',
    zh: '太阳高度改变时，影子的长短和温暖程度一起改变',
    ar: 'مع تغيّر ارتفاع الشمس يتغيّر طول الظل والدفء معًا',
    es: 'Al cambiar la altura del Sol, cambian a la vez la longitud de la sombra y el calor',
    fr: 'Quand la hauteur du Soleil change, la longueur de l’ombre et la chaleur changent ensemble',
    hi: 'सूर्य की ऊँचाई बदलने पर छाया की लंबाई और गर्माहट साथ-साथ बदलती हैं',
    id: 'Saat ketinggian Matahari berubah, panjang bayang-bayang dan kehangatan ikut berubah bersama',
    pt: 'Quando a altura do Sol muda, o comprimento da sombra e o calor mudam juntos',
  },
  'label.stage': {
    ko: '땅 위의 막대',
    en: 'A stick on the ground',
    ja: '地面に立てた棒',
    zh: '地上的一根竿',
    ar: 'عصا على الأرض',
    es: 'Un palo en el suelo',
    fr: 'Un bâton sur le sol',
    hi: 'ज़मीन पर एक छड़ी',
    id: 'Sebatang tongkat di tanah',
    pt: 'Uma vara no chão',
  },
  'label.view': {
    ko: '옆에서',
    en: 'From the side',
    ja: '横から',
    zh: '侧视',
    ar: 'من الجانب',
    es: 'De lado',
    fr: 'De côté',
    hi: 'बगल से',
    id: 'Dari samping',
    pt: 'De lado',
  },
  'label.sun': {
    ko: '태양',
    en: 'Sun',
    ja: '太陽',
    zh: '太阳',
    ar: 'الشمس',
    es: 'Sol',
    fr: 'Soleil',
    hi: 'सूर्य',
    id: 'Matahari',
    pt: 'Sol',
  },
  'label.stick': {
    ko: '막대',
    en: 'stick',
    ja: '棒',
    zh: '竿',
    ar: 'العصا',
    es: 'palo',
    fr: 'bâton',
    hi: 'छड़ी',
    id: 'tongkat',
    pt: 'vara',
  },
  'label.shadow': {
    ko: '그림자',
    en: 'shadow',
    ja: '影',
    zh: '影子',
    ar: 'الظل',
    es: 'sombra',
    fr: 'ombre',
    hi: 'छाया',
    id: 'bayang-bayang',
    pt: 'sombra',
  },
  'label.altitude': {
    ko: '{alt}°',
    en: '{alt}°',
    ja: '{alt}°',
    zh: '{alt}°',
    ar: '{alt}°',
    es: '{alt}°',
    fr: '{alt}°',
    hi: '{alt}°',
    id: '{alt}°',
    pt: '{alt}°',
  },
  'label.sameWidth': {
    ko: '같은 폭의 햇빛',
    en: 'same width of sunlight',
    ja: '同じ幅の日光',
    zh: '同样宽的阳光',
    ar: 'ضوء الشمس بالعرض نفسه',
    es: 'el mismo ancho de luz solar',
    fr: 'même largeur de lumière du Soleil',
    hi: 'सूर्य के प्रकाश की समान चौड़ाई',
    id: 'lebar sinar Matahari yang sama',
    pt: 'mesma largura de luz solar',
  },
  'label.litGround': {
    ko: '닿는 땅',
    en: 'ground it covers',
    ja: '照らされる地面',
    zh: '照到的地面',
    ar: 'الأرض التي يغطيها',
    es: 'suelo que cubre',
    fr: 'sol couvert',
    hi: 'ढकी गई ज़मीन',
    id: 'tanah yang disinari',
    pt: 'chão que cobre',
  },
  'label.perArea': {
    ko: '넓이당 햇빛',
    en: 'light per area',
    ja: '面積あたりの日光',
    zh: '单位面积的光',
    ar: 'الضوء لكل وحدة مساحة',
    es: 'luz por área',
    fr: 'lumière par unité de surface',
    hi: 'प्रति क्षेत्रफल प्रकाश',
    id: 'cahaya per luas',
    pt: 'luz por área',
  },
  'caption.low': {
    ko: '해가 낮게 뜨면 막대 그림자가 길게 눕고, 같은 폭의 햇빛이 넓은 땅에 퍼진다 — 땅 한 칸이 받는 빛이 적다.',
    en: 'With the Sun low, the stick’s shadow lies long, and the same width of sunlight spreads over wide ground — each patch gets little light.',
    ja: '太陽が低いと棒の影は長く伸び、同じ幅の日光が広い地面に広がる — 地面の一区画が受ける光は少ない。',
    zh: '太阳低时，竿的影子长长地躺在地上，同样宽的阳光铺满一大片地面 — 每一小块地面得到的光很少。',
    ar: 'حين تكون الشمس منخفضة يمتدّ ظل العصا طويلًا، وينتشر ضوء الشمس بالعرض نفسه على أرض واسعة — فكل رقعة تنال ضوءًا قليلًا.',
    es: 'Con el Sol bajo, la sombra del palo se alarga y el mismo ancho de luz solar se reparte sobre mucho suelo — cada trozo recibe poca luz.',
    fr: 'Avec le Soleil bas, l’ombre du bâton s’allonge et la même largeur de lumière du Soleil s’étale sur un large sol — chaque parcelle reçoit peu de lumière.',
    hi: 'सूर्य नीचा हो तो छड़ी की छाया लंबी पड़ती है, और सूर्य के प्रकाश की समान चौड़ाई चौड़ी ज़मीन पर फैल जाती है — हर टुकड़े को कम प्रकाश मिलता है।',
    id: 'Saat Matahari rendah, bayang-bayang tongkat memanjang, dan lebar sinar Matahari yang sama tersebar di tanah yang luas — tiap petak mendapat sedikit cahaya.',
    pt: 'Com o Sol baixo, a sombra da vara fica longa e a mesma largura de luz solar se espalha por muito chão — cada pedaço recebe pouca luz.',
  },
  'caption.rise': {
    ko: '해가 높이 오른다. 그림자가 줄어들고, 햇빛이 닿는 땅이 좁아지며 밝아진다.',
    en: 'The Sun climbs. The shadow shrinks, and the sunlit ground narrows and brightens.',
    ja: '太陽が昇る。影が縮み、日の当たる地面が狭く、明るくなる。',
    zh: '太阳升高。影子变短，被照亮的地面变窄、变亮。',
    ar: 'تصعد الشمس. يقصر الظل، وتضيق الأرض المضاءة وتزداد سطوعًا.',
    es: 'El Sol sube. La sombra se acorta y el suelo iluminado se estrecha y se vuelve más brillante.',
    fr: 'Le Soleil monte. L’ombre raccourcit, et le sol éclairé se rétrécit et s’illumine.',
    hi: 'सूर्य ऊपर चढ़ता है। छाया सिकुड़ती है, और धूप वाली ज़मीन सँकरी और अधिक चमकीली होती जाती है।',
    id: 'Matahari naik. Bayang-bayang memendek, dan tanah yang disinari menyempit dan makin terang.',
    pt: 'O Sol sobe. A sombra encolhe, e o chão iluminado se estreita e fica mais claro.',
  },
  'caption.mid': {
    ko: '고도가 오른 만큼 그림자가 짧아졌다. 같은 햇빛이 더 좁은 땅에 모인다.',
    en: 'Higher Sun, shorter shadow. The same sunlight gathers on narrower ground.',
    ja: '太陽が高いほど影は短い。同じ日光がより狭い地面に集まる。',
    zh: '太阳越高，影子越短。同样的阳光聚集在更窄的地面上。',
    ar: 'شمس أعلى، ظل أقصر. يتجمّع ضوء الشمس نفسه على أرض أضيق.',
    es: 'Sol más alto, sombra más corta. La misma luz solar se concentra en un suelo más estrecho.',
    fr: 'Soleil plus haut, ombre plus courte. La même lumière se concentre sur un sol plus étroit.',
    hi: 'सूर्य जितना ऊँचा, छाया उतनी छोटी। वही सूर्य का प्रकाश और सँकरी ज़मीन पर सिमटता है।',
    id: 'Matahari lebih tinggi, bayang-bayang lebih pendek. Sinar Matahari yang sama berkumpul di tanah yang lebih sempit.',
    pt: 'Sol mais alto, sombra mais curta. A mesma luz solar se concentra num chão mais estreito.',
  },
  'caption.high': {
    ko: '해가 높으면 그림자가 짧고, 같은 햇빛이 좁은 땅에 모인다 — 땅 한 칸이 받는 빛이 많아 땅이 더 데워진다.',
    en: 'With the Sun high, the shadow is short and the same sunlight lands on a narrow patch — each patch gets more light, so the ground warms more.',
    ja: '太陽が高いと影は短く、同じ日光が狭い範囲に当たる — 一区画が受ける光が多く、地面はより暖まる。',
    zh: '太阳高时，影子短，同样的阳光落在一小块地面上 — 每块地面得到的光更多，地面升温更多。',
    ar: 'حين تكون الشمس عالية يكون الظل قصيرًا ويسقط ضوء الشمس نفسه على رقعة ضيقة — فكل رقعة تنال ضوءًا أكثر، فتسخن الأرض أكثر.',
    es: 'Con el Sol alto, la sombra es corta y la misma luz solar cae sobre un trozo estrecho — cada trozo recibe más luz, así que el suelo se calienta más.',
    fr: 'Avec le Soleil haut, l’ombre est courte et la même lumière tombe sur une parcelle étroite — chaque parcelle reçoit plus de lumière, donc le sol se réchauffe davantage.',
    hi: 'सूर्य ऊँचा हो तो छाया छोटी होती है और वही सूर्य का प्रकाश सँकरे टुकड़े पर पड़ता है — हर टुकड़े को अधिक प्रकाश मिलता है, इसलिए ज़मीन अधिक गर्म होती है।',
    id: 'Saat Matahari tinggi, bayang-bayang pendek dan sinar Matahari yang sama jatuh di petak sempit — tiap petak mendapat lebih banyak cahaya, sehingga tanah makin hangat.',
    pt: 'Com o Sol alto, a sombra é curta e a mesma luz solar cai num pedaço estreito — cada pedaço recebe mais luz, então o chão esquenta mais.',
  },
  'caption.fall': {
    ko: '해가 다시 낮아지면 그림자가 길어지고, 햇빛이 넓게 흩어져 땅 한 칸이 받는 빛이 줄어든다.',
    en: 'As the Sun sinks again, the shadow stretches and the sunlight spreads thin — each patch gets less.',
    ja: '太陽が再び低くなると影は伸び、日光は薄く広がる — 一区画が受ける光は減る。',
    zh: '太阳再次降低时，影子拉长，阳光铺得更薄 — 每块地面得到的光变少。',
    ar: 'حين تنخفض الشمس من جديد يطول الظل وينتشر ضوء الشمس رقيقًا — فتنال كل رقعة ضوءًا أقل.',
    es: 'Cuando el Sol vuelve a bajar, la sombra se estira y la luz solar se reparte más fina — cada trozo recibe menos.',
    fr: 'Quand le Soleil redescend, l’ombre s’étire et la lumière s’étale en couche mince — chaque parcelle en reçoit moins.',
    hi: 'सूर्य फिर नीचे जाने पर छाया लंबी होती है और सूर्य का प्रकाश पतला होकर फैल जाता है — हर टुकड़े को कम मिलता है।',
    id: 'Saat Matahari turun lagi, bayang-bayang memanjang dan sinar Matahari menyebar tipis — tiap petak mendapat lebih sedikit.',
    pt: 'Quando o Sol baixa de novo, a sombra se estica e a luz solar se espalha rala — cada pedaço recebe menos.',
  },
} satisfies Record<string, LocalizedText>);

export type SolarAltitudeShadowMessageKey = keyof typeof solarAltitudeShadowMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SolarAltitudeShadowMessageKey): LocalizedText => solarAltitudeShadowMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SolarAltitudeShadowMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const solarAltitudeShadowSchema: BundleSchema = {
  id: SOLAR_ALTITUDE_SHADOW_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 시간표가 고도를 낮게 → 중간 → 높게 → 다시 낮게 옮기며 견주기까지 마친다.
  parameters: [],

  stages: [
    {
      id: 'stick-on-ground',
      label: text('label.stage'),
      constants: {
        altLow: ALT_LOW_DEG,
        altMid: ALT_MID_DEG,
        altHigh: ALT_HIGH_DEG,
        stickHeight: STICK_HEIGHT,
        beamWidth: BEAM_WIDTH,
      },
    },
  ],
  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 판 900 × 약 280 + 캡션 두 줄. */
  canvas: { height: 400, minHeight: 360 },

  /**
   * 겹침이 판정 장치다 — 햇빛 받는 땅 띠 위에 그림자가, 다발 밖 어두운 띠 위에 닿는 땅이,
   * 빛줄기 위에 막대가 와야 한다. 층 순서로는 `region`(띠)이 막대 · 선 위로 덮인다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 낮게 머묾 → 중간으로 오름 → 중간에 머묾 → 높게 오름 → 높게 머묾 → 다시 낮게 내려감.
   * 지금 고도를 오름 · 내림 단계의 진행도에서 읽으므로(physics `altitudeNow`) 캡션과 고도가
   * 어긋날 수 없다.
   */
  timeline: {
    phases: [
      { id: 'low', duration: HOLD, ease: 'linear', caption: key('caption.low') },
      { id: 'riseMid', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
      { id: 'mid', duration: HOLD, ease: 'linear', caption: key('caption.mid') },
      { id: 'riseHigh', duration: RISE, ease: 'smooth', caption: key('caption.rise') },
      { id: 'high', duration: HOLD, ease: 'linear', caption: key('caption.high') },
      { id: 'fall', duration: FALL, ease: 'smooth', caption: key('caption.fall') },
    ],
  },

  /** 도착한 순간 낮은 해가 이미 긴 그림자를 드리우고 있다. */
  startAt: START_AT,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — tan · sin 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -8] },
    align: 'left',
    fontSize: 14,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'medium' },
    wrapWidth: CANVAS_W - 40,
  },

  // 그리드 · 카메라 단추 없음 — 잴 것은 길이의 눈금이 아니라 「길다 / 짧다 · 넓다 / 좁다」 다.

  messages: solarAltitudeShadowMessages,
};
