// ========================================================================
// light-bending-by-gravity — 선언
// ========================================================================
// 질문: 먼 별의 빛이 태양 가장자리를 스쳐 지구에 온다. 태양의 질량은 그 빛에 무슨 일을 하는가.
//
// 빛의 길이 태양 쪽으로 휜다. 지구의 관측자는 빛이 **들어온 방향을 곧게 거슬러** 별을 찾으므로,
// 별은 실제 자리보다 태양에서 바깥쪽으로 비껴 보인다. 가장자리를 스치는 빛이 휘는 각은 1.75″ —
// 1919 년 일식 때 태양 곁 별들의 자리를 밤하늘 사진과 견주어 잰 값이다.
//
// 1.75″ 는 보이지 않는 각이라 **그림은 각을 키워 그린다.** 그 배율은 스테이지 상수
// `exaggeration` 으로 선언하고, 화면 왼쪽 위 한 줄이 과장했다고 말한다.
//
// 등가 원리(`equivalence-principle`)는 상자 안 공의 낙하로 「가속 = 중력」 에 머물렀다. 이 조각은
// 빛 하나의 길에 머문다. 지평선(`black-hole-horizon`)의 「빛이 못 나온다」 와도 다르다 — 여기서
// 빛은 빠져나가되 길이 꺾인다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:light-bending-by-gravity` 와 문자 그대로 일치한다 (C4). */
export const LIGHT_BENDING_BY_GRAVITY_ID = 'light-bending-by-gravity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 태양 가장자리를 스치는 빛이 휘는 각(각초, ″). 일반 상대론의 값 4GM/(c²R) 이다.
 * 화면의 각 이름표에 선언값 그대로 쓰인다(코드가 셈해 줄이지 않는다).
 */
export const DEFLECTION_ARCSEC = 1.75;
/**
 * 그림에서 휜 각을 키운 배율. 1.75″ × 18000 ≈ 8.8° — 이만큼 키워야 휜 것과 비껴 보이는 것이
 * 눈에 들어온다. 화면 왼쪽 위 과장 알림에 선언값 그대로 쓰인다.
 */
export const EXAGGERATION = 18000;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const lightBendingByGravityMessages = Object.freeze({
  'label.title': {
    ko: '빛의 휨',
    en: 'Bending of light',
    ja: '光の曲がり',
    zh: '光的弯曲',
    ar: 'انحناء الضوء',
    es: 'Curvatura de la luz',
    fr: 'Déviation de la lumière',
    hi: 'प्रकाश का मुड़ना',
    id: 'Pembelokan cahaya',
    pt: 'Curvatura da luz',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '질량 근처에서 휘는 경로',
    en: 'The path of light bends near a mass',
    ja: '質量の近くで光の経路が曲がる',
    zh: '光的路径在质量附近弯曲',
    ar: 'ينحني مسار الضوء قرب الكتلة',
    es: 'La trayectoria de la luz se curva cerca de una masa',
    fr: 'Le trajet de la lumière s’incurve près d’une masse',
    hi: 'द्रव्यमान के पास प्रकाश का पथ मुड़ जाता है',
    id: 'Lintasan cahaya membelok di dekat massa',
    pt: 'A trajetória da luz se curva perto de uma massa',
  },
  'label.stage': {
    ko: '태양 가장자리를 스치는 별빛',
    en: 'Starlight grazing the Sun',
    ja: '太陽の縁をかすめる星の光',
    zh: '掠过太阳边缘的星光',
    ar: 'ضوء نجم يمرّ مُلامسًا الشمس',
    es: 'Luz estelar que roza el Sol',
    fr: 'Lumière d’étoile qui frôle le Soleil',
    hi: 'सूर्य को छूकर गुज़रता तारे का प्रकाश',
    id: 'Cahaya bintang yang menyerempet Matahari',
    pt: 'Luz estelar rasante ao Sol',
  },
  'label.view': {
    ko: '별 · 태양 · 지구',
    en: 'Star, Sun and Earth',
    ja: '星・太陽・地球',
    zh: '恒星、太阳和地球',
    ar: 'النجم والشمس والأرض',
    es: 'Estrella, Sol y Tierra',
    fr: 'Étoile, Soleil et Terre',
    hi: 'तारा, सूर्य और पृथ्वी',
    id: 'Bintang, Matahari, dan Bumi',
    pt: 'Estrela, Sol e Terra',
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
  'label.earth': {
    ko: '지구',
    en: 'Earth',
    ja: '地球',
    zh: '地球',
    ar: 'الأرض',
    es: 'Tierra',
    fr: 'Terre',
    hi: 'पृथ्वी',
    id: 'Bumi',
    pt: 'Terra',
  },
  'label.star': {
    ko: '별',
    en: 'star',
    ja: '星',
    zh: '恒星',
    ar: 'نجم',
    es: 'estrella',
    fr: 'étoile',
    hi: 'तारा',
    id: 'bintang',
    pt: 'estrela',
  },
  'label.truePos': {
    ko: '실제 자리',
    en: 'true position',
    ja: '実際の位置',
    zh: '实际位置',
    ar: 'الموضع الحقيقي',
    es: 'posición real',
    fr: 'position réelle',
    hi: 'वास्तविक स्थिति',
    id: 'posisi sebenarnya',
    pt: 'posição real',
  },
  'label.seenPos': {
    ko: '보이는 자리',
    en: 'where it appears',
    ja: '見かけの位置',
    zh: '看到的位置',
    ar: 'حيث يظهر',
    es: 'donde se ve',
    fr: 'où elle apparaît',
    hi: 'जहाँ दिखता है',
    id: 'tempat ia tampak',
    pt: 'onde aparece',
  },
  'label.unbent': {
    ko: '휘지 않았다면',
    en: 'if it did not bend',
    ja: '曲がらなかったら',
    zh: '如果不弯曲',
    ar: 'لو لم ينحنِ',
    es: 'si no se curvara',
    fr: 'sans déviation',
    hi: 'यदि न मुड़ता',
    id: 'jika tidak membelok',
    pt: 'se não se curvasse',
  },
  /** 휜 각. 값은 선언된 각초를 그대로 끼운다. `″` 는 단위 기호(표식)다. */
  'label.angle': {
    ko: '{a}″',
    en: '{a}″',
    ja: '{a}″',
    zh: '{a}″',
    ar: '{a}″',
    es: '{a}″',
    fr: '{a}″',
    hi: '{a}″',
    id: '{a}″',
    pt: '{a}″',
  },
  /** 과장 알림. 값은 선언된 배율을 그대로 끼운다. */
  'label.exaggerated': {
    ko: '휜 각은 {x}배로 키워 그렸다',
    en: 'Bending angle drawn {x}× larger than real',
    ja: '曲がる角は {x}× に拡大して描いた',
    zh: '弯曲角放大 {x}× 绘制',
    ar: 'رُسمت زاوية الانحناء أكبر من الحقيقة {x}×',
    es: 'Ángulo de desviación dibujado {x}× mayor que el real',
    fr: 'Angle de déviation dessiné {x}× plus grand que la réalité',
    hi: 'मुड़ने का कोण वास्तविक से {x}× बड़ा बनाया गया है',
    id: 'Sudut belokan digambar {x}× lebih besar dari aslinya',
    pt: 'Ângulo de curvatura desenhado {x}× maior que o real',
  },
  'caption.approach': {
    ko: '먼 별의 빛이 태양 가장자리를 스치러 다가간다',
    en: 'Light from a distant star heads past the edge of the Sun',
    ja: '遠い星の光が太陽の縁をかすめようと近づいていく',
    zh: '远处恒星的光朝太阳边缘掠去',
    ar: 'يتجه ضوء نجم بعيد ليمرّ بحافة الشمس',
    es: 'La luz de una estrella lejana se dirige a pasar junto al borde del Sol',
    fr: 'La lumière d’une étoile lointaine file vers le bord du Soleil',
    hi: 'दूर के तारे का प्रकाश सूर्य के किनारे के पास से गुज़रता हुआ आगे बढ़ता है',
    id: 'Cahaya dari bintang jauh melaju menuju tepi Matahari',
    pt: 'A luz de uma estrela distante segue rumo à borda do Sol',
  },
  'caption.bend': {
    ko: '태양 곁을 지나며 빛의 길이 태양 쪽으로 휜다',
    en: 'Passing the Sun, the path of the light bends toward it',
    ja: '太陽のそばを通るとき、光の経路が太陽の方へ曲がる',
    zh: '经过太阳旁时，光的路径向太阳弯曲',
    ar: 'عند مروره بالشمس، ينحني مسار الضوء نحوها',
    es: 'Al pasar junto al Sol, la trayectoria de la luz se curva hacia él',
    fr: 'En passant près du Soleil, le trajet de la lumière s’incurve vers lui',
    hi: 'सूर्य के पास से गुज़रते हुए प्रकाश का पथ उसकी ओर मुड़ जाता है',
    id: 'Saat melewati Matahari, lintasan cahaya membelok ke arahnya',
    pt: 'Ao passar pelo Sol, a trajetória da luz se curva em direção a ele',
  },
  'caption.trace': {
    ko: '지구에서는 빛이 들어온 방향을 곧게 거슬러 별을 찾는다',
    en: 'On Earth we trace the incoming light straight back to find the star',
    ja: '地球では、届いた光の方向をまっすぐさかのぼって星を探す',
    zh: '在地球上，人们沿光射来的方向笔直反推去找恒星',
    ar: 'على الأرض نتتبّع الضوء الوارد في خط مستقيم إلى الوراء لنجد النجم',
    es: 'En la Tierra seguimos la luz entrante en línea recta hacia atrás para hallar la estrella',
    fr: 'Sur Terre, on remonte en ligne droite la lumière reçue pour trouver l’étoile',
    hi: 'पृथ्वी पर हम आते प्रकाश को सीधा पीछे की ओर खींचकर तारे को खोजते हैं',
    id: 'Di Bumi kita menelusuri cahaya yang datang lurus ke belakang untuk menemukan bintang',
    pt: 'Na Terra, seguimos a luz que chega em linha reta para trás para achar a estrela',
  },
  'caption.shifted': {
    ko: '그래서 별은 실제 자리보다 태양에서 바깥쪽으로 비껴 보인다',
    en: 'So the star appears shifted outward, away from the Sun',
    ja: 'だから星は実際の位置より太陽から外側にずれて見える',
    zh: '所以恒星看起来向外偏移，远离太阳',
    ar: 'لذلك يبدو النجم مُزاحًا إلى الخارج، بعيدًا عن الشمس',
    es: 'Por eso la estrella parece desplazada hacia fuera, lejos del Sol',
    fr: 'L’étoile paraît donc décalée vers l’extérieur, à l’écart du Soleil',
    hi: 'इसलिए तारा सूर्य से दूर, बाहर की ओर खिसका हुआ दिखता है',
    id: 'Maka bintang tampak bergeser ke luar, menjauhi Matahari',
    pt: 'Por isso a estrela parece deslocada para fora, longe do Sol',
  },
} satisfies Record<string, LocalizedText>);

export type LightBendingByGravityMessageKey = keyof typeof lightBendingByGravityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: LightBendingByGravityMessageKey): LocalizedText => lightBendingByGravityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: LightBendingByGravityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const lightBendingByGravitySchema: BundleSchema = {
  id: LIGHT_BENDING_BY_GRAVITY_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 독자가 바꿔 볼 만한 것은 스치는 거리(멀수록 덜 휜다)인데, 그것은 이 조각의
  // 주장(휜다 → 비껴 보인다)과 다른 주장이다. 한 번의 자동 진행이 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'grazing',
      label: text('label.stage'),
      constants: {
        deflectionArcsec: DEFLECTION_ARCSEC,
        exaggeration: EXAGGERATION,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 별 · 태양 · 지구가 가로로 길게 놓인다. 세로는 캡션 한 줄 몫까지만. */
  canvas: { height: 320, minHeight: 280 },

  /** 겹침이 뜻을 갖는다 — 태양 위에 빛의 길, 그 위에 광자와 별, 이름표는 맨 위. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 다가감 → 휨 → 거슬러 봄 → 표시 → 견줌 → 비움.
   *
   * - `approach` 별에서 나온 빛(광자)이 태양 가장자리로 다가간다. 지나온 길이 남는다.
   * - `bend` 태양 곁을 지나며 길이 태양 쪽으로 꺾여 지구에 닿는다. 휘지 않았다면 갔을 곧은 길이
   *   점선으로 따라 뻗어, 꺾인 만큼이 보인다.
   * - `trace` 지구에서 빛이 들어온 방향을 곧게 거슬러 점선이 뻗고, 그 끝에 보이는 별이 떠오른다.
   * - `mark` 「실제 자리」 · 「보이는 자리」 이름표, 바깥쪽 화살표, 휜 각의 부채꼴이 나타난다.
   * - `compare` 머문다 — 두 자리를 견준다.
   * - `reset` 빛의 길과 표시가 사라지고 별 · 태양 · 지구만 남는다.
   */
  timeline: {
    phases: [
      { id: 'approach', duration: 1.6, caption: key('caption.approach') },
      { id: 'bend', duration: 1.8, caption: key('caption.bend') },
      { id: 'trace', duration: 1.4, ease: 'smooth', caption: key('caption.trace') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.shifted') },
      { id: 'compare', duration: 3.2, caption: key('caption.shifted') },
      { id: 'reset', duration: 0.7, ease: 'smooth', caption: key('caption.shifted') },
    ],
  },

  /**
   * 도착한 순간 빛이 막 태양 곁을 지나 휘고 있다. 쌓는 상태가 없어 `preroll` 은 쓰지 않는다.
   */
  startAt: 2.2,

  // 슬롯 하나. 그림 아래 한 줄 — 지금 벌어지는 일만 말한다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 각을 과장해 그렸으므로 격자로 잴 수 있는 거리가 없다.
   */

  messages: lightBendingByGravityMessages,
};
