// ========================================================================
// spherical-aberration — 선언
// ========================================================================
// 질문: 구면으로 깎은 렌즈에 나란한 빛을 넣으면 줄기가 모두 한 점에 모이는가.
//
// 답: 모이지 않는다. 두 면이 구면인 두꺼운 볼록 렌즈에 축에서 높이가 다른 평행 줄기를
// 넣고 두 면에서 굴절 법칙으로 실제 추적하면, 바깥 줄기일수록 렌즈 가까이에서 축을
// 건넌다 — 줄기가 축을 건너는 자리가 한 점이 아니라 축을 따라 퍼진다. 조리개로 바깥
// 줄기를 막으면 남은 줄기가 건너는 자리가 좁아진다.
//
// plugin-optics `traceRay` 의 얇은 렌즈는 근축 근사라 수차를 만들지 않는다 — 조각이
// `refract` 로 면마다 계산한다(`physics.ts`). 색 수차는 `chromatic-aberration`, 평행광이
// 초점에 모이는 것 자체는 `converging-diverging-lens` 의 몫이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:spherical-aberration` 와 문자 그대로 일치한다 (C4). */
export const SPHERICAL_ABERRATION_ID = 'spherical-aberration';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 두 면의 곡률 반지름(월드). 앞면 · 뒷면이 같은 양볼록 렌즈. */
export const SURFACE_RADIUS = 2.6;
/** 렌즈 가운데 두께(월드). */
export const LENS_THICKNESS = 0.9;
/** 렌즈 유리의 굴절률. 바깥은 공기(1)로 둔다. */
export const REFRACTIVE_INDEX = 1.5;
/** 축 한쪽의 줄기 수. 축 위아래로 같은 높이의 줄기가 한 쌍씩 들어온다. */
export const RAY_PAIRS = 4;
/** 이웃 줄기 높이 사이 간격(월드). 가장 안쪽 줄기의 높이도 이 값이다. */
export const RAY_SPACING = 0.3;
/** 조리개를 닫았을 때 열린 구멍의 반높이(월드). 이보다 높은 줄기는 막힌다. */
export const STOP_HALF = 0.75;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈 가운데가 원점, 광축이 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 반높이(월드). 가장 바깥 줄기보다 조금 크고, 곡률 반지름보다 작아야 한다. */
export const LENS_HALF = 1.35;
/** 줄기가 출발하는 x(월드). */
export const RAY_START_X = -3.4;
/** 줄기가 끝나는 x(월드). 가장 먼 교차점을 지나 엇갈려 나가는 것이 보일 만큼 더 간다. */
export const RAY_END_X = 3.9;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -3.6;
export const AXIS_TO_X = 4.1;

/** 조리개 판이 서는 x(월드). 렌즈 앞면 꼭짓점 바로 앞. */
export const STOP_X = -0.75;
/** 조리개 판의 반두께(월드). */
export const STOP_PLATE_HALF_WIDTH = 0.05;
/** 조리개 판의 바깥 끝 높이(월드). 렌즈보다 위아래로 더 뻗는다. */
export const STOP_PLATE_OUTER = 1.6;
/** 조리개가 열려 있을 때 판 안쪽 끝의 높이(월드). 렌즈 가장자리보다 바깥이라 아무 줄기도 막지 않는다. */
export const STOP_OPEN_EDGE = 1.45;
/** 조리개 이름표가 판 바깥 끝에서 더 올라간 거리(월드). */
export const STOP_LABEL_GAP = 0.22;

/** 교차점 치수선이 축 아래로 내려간 거리(월드). */
export const SPREAD_DROP = 0.32;
/** 교차점 점의 반지름(월드). */
export const CROSS_DOT_RADIUS = 0.045;

/**
 * 프레이밍 — 가로는 줄기 출발점부터 줄기 끝까지, 세로는 조리개 이름표부터 엇갈려
 * 내려간 바깥 줄기 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 4.1, minY: -2.05, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const sphericalAberrationMessages = Object.freeze({
  'label.title': {
    ko: '구면 수차',
    en: 'Spherical aberration',
    ja: '球面収差',
    zh: '球差',
    ar: 'الزيغ الكروي',
    es: 'Aberración esférica',
    fr: 'Aberration sphérique',
    hi: 'गोलीय विपथन',
    id: 'Aberasi sferis',
    pt: 'Aberração esférica',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '가장자리 광선이 다른 곳에 모임',
    en: 'Edge rays come to focus at a different place',
    ja: '縁の光線は別の場所に集まる',
    zh: '边缘光线会聚在不同的位置',
    ar: 'الأشعة الطرفية تتجمع في موضع مختلف',
    es: 'Los rayos del borde se enfocan en otro lugar',
    fr: 'Les rayons du bord convergent à un autre endroit',
    hi: 'किनारे की किरणें किसी दूसरी जगह फोकस होती हैं',
    id: 'Sinar tepi terfokus di tempat lain',
    pt: 'Os raios da borda se focalizam em outro lugar',
  },
  'label.stage': {
    ko: '두꺼운 구면 렌즈',
    en: 'Thick spherical lens',
    ja: '厚い球面レンズ',
    zh: '厚球面透镜',
    ar: 'عدسة كروية سميكة',
    es: 'Lente esférica gruesa',
    fr: 'Lentille sphérique épaisse',
    hi: 'मोटा गोलीय लेंस',
    id: 'Lensa sferis tebal',
    pt: 'Lente esférica espessa',
  },
  'label.view': {
    ko: '렌즈와 광축',
    en: 'Lens and axis',
    ja: 'レンズと光軸',
    zh: '透镜与主光轴',
    ar: 'العدسة والمحور',
    es: 'Lente y eje',
    fr: 'Lentille et axe',
    hi: 'लेंस और अक्ष',
    id: 'Lensa dan sumbu',
    pt: 'Lente e eixo',
  },

  /** 도식 이름표. */
  'label.stop': {
    ko: '조리개',
    en: 'aperture stop',
    ja: '絞り',
    zh: '光阑',
    ar: 'حاجز الفتحة',
    es: 'diafragma',
    fr: 'diaphragme',
    hi: 'द्वारक रोधक',
    id: 'diafragma',
    pt: 'diafragma',
  },

  'caption.enter': {
    ko: '나란한 빛 줄기가 두 면이 둥근 볼록 렌즈로 들어간다.',
    en: 'Parallel beams of light head into a convex lens with two rounded faces.',
    ja: '平行な光束が、両面が丸い凸レンズに入る。',
    zh: '平行光束射向两面都是球面的凸透镜。',
    ar: 'حزم ضوئية متوازية تتجه إلى عدسة محدبة ذات وجهين مستديرين.',
    es: 'Haces paralelos de luz se dirigen a una lente convexa de dos caras curvas.',
    fr: 'Des faisceaux parallèles de lumière arrivent sur une lentille convexe à deux faces bombées.',
    hi: 'प्रकाश के समांतर किरण-पुंज दो गोल सतहों वाले उत्तल लेंस की ओर जाते हैं।',
    id: 'Berkas-berkas cahaya sejajar menuju lensa cembung dengan dua muka lengkung.',
    pt: 'Feixes paralelos de luz seguem para uma lente convexa de duas faces curvas.',
  },
  'caption.pass': {
    ko: '렌즈를 지난 줄기가 축 쪽으로 꺾여 축을 건너간다.',
    en: 'Past the lens, the beams bend toward the axis and cross it.',
    ja: 'レンズを通った光束は光軸の側へ曲がり、光軸を横切る。',
    zh: '光束穿过透镜后向主光轴偏折，并越过主光轴。',
    ar: 'بعد العدسة تنحني الحزم نحو المحور وتعبره.',
    es: 'Tras la lente, los haces se desvían hacia el eje y lo cruzan.',
    fr: 'Après la lentille, les faisceaux s’infléchissent vers l’axe et le traversent.',
    hi: 'लेंस से निकलकर किरण-पुंज अक्ष की ओर मुड़ते हैं और उसे पार करते हैं।',
    id: 'Setelah melewati lensa, berkas-berkas membelok ke arah sumbu dan memotongnya.',
    pt: 'Depois da lente, os feixes se desviam em direção ao eixo e o cruzam.',
  },
  'caption.spread': {
    ko: '가장 바깥 줄기는 렌즈 가까이에서, 가장 안쪽 줄기는 멀리서 축을 건넌다 — 줄기들이 한 점에 모이지 않는다.',
    en: 'The outermost beams cross the axis close to the lens, the innermost ones far from it — the beams do not meet at one point.',
    ja: 'いちばん外側の光束はレンズの近くで、いちばん内側の光束は遠くで光軸を横切る — 光束は1点に集まらない。',
    zh: '最外侧的光束在靠近透镜处越过主光轴，最内侧的则在远处——光束不会聚于一点。',
    ar: 'تعبر الحزم الخارجية القصوى المحورَ قرب العدسة، والداخلية القصوى بعيدًا عنها — فلا تلتقي الحزم في نقطة واحدة.',
    es: 'Los haces más exteriores cruzan el eje cerca de la lente; los más interiores, lejos de ella — los haces no se juntan en un punto.',
    fr: 'Les faisceaux les plus extérieurs traversent l’axe près de la lentille, les plus intérieurs loin d’elle — les faisceaux ne se rejoignent pas en un point.',
    hi: 'सबसे बाहरी किरण-पुंज लेंस के पास अक्ष को पार करते हैं, सबसे भीतरी उससे दूर — किरण-पुंज एक बिंदु पर नहीं मिलते।',
    id: 'Berkas terluar memotong sumbu dekat lensa, berkas terdalam jauh darinya — berkas-berkas tidak bertemu di satu titik.',
    pt: 'Os feixes mais externos cruzam o eixo perto da lente; os mais internos, longe dela — os feixes não se encontram em um ponto.',
  },
  'caption.stopIn': {
    ko: '조리개가 들어와 바깥 줄기를 막는다.',
    en: 'An aperture stop closes in and blocks the outer beams.',
    ja: '絞りが閉じてきて外側の光束をさえぎる。',
    zh: '光阑合拢，挡住外侧的光束。',
    ar: 'يُغلَق حاجز الفتحة فيحجب الحزم الخارجية.',
    es: 'Un diafragma se cierra y bloquea los haces exteriores.',
    fr: 'Un diaphragme se referme et bloque les faisceaux extérieurs.',
    hi: 'द्वारक रोधक भीतर आकर बाहरी किरण-पुंजों को रोक देता है।',
    id: 'Diafragma menutup dan menghalangi berkas-berkas luar.',
    pt: 'Um diafragma se fecha e bloqueia os feixes externos.',
  },
  'caption.narrow': {
    ko: '안쪽 줄기만 남자 축을 건너는 자리가 좁게 모였다.',
    en: 'With only the inner beams left, the places where they cross the axis are packed close together.',
    ja: '内側の光束だけが残ると、光軸を横切る位置が狭い範囲に集まった。',
    zh: '只剩内侧光束后，它们越过主光轴的位置紧紧聚在一起。',
    ar: 'مع بقاء الحزم الداخلية وحدها، تقاربت مواضع عبورها للمحور تقاربًا شديدًا.',
    es: 'Con solo los haces interiores, los puntos donde cruzan el eje quedan muy juntos.',
    fr: 'Avec seulement les faisceaux intérieurs, les points où ils traversent l’axe sont resserrés.',
    hi: 'केवल भीतरी किरण-पुंज बचने पर, अक्ष को पार करने की उनकी जगहें पास-पास सिमट गईं।',
    id: 'Dengan hanya berkas dalam yang tersisa, titik-titik tempat mereka memotong sumbu berdekatan rapat.',
    pt: 'Com só os feixes internos, os pontos onde eles cruzam o eixo ficam bem próximos.',
  },
} satisfies Record<string, LocalizedText>);

export type SphericalAberrationMessageKey = keyof typeof sphericalAberrationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: SphericalAberrationMessageKey): LocalizedText => sphericalAberrationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: SphericalAberrationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const sphericalAberrationSchema: BundleSchema = {
  id: SPHERICAL_ABERRATION_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 조리개를 닫는 것까지 자동 진행으로 보인다 — 조리개 크기를 끌게 해도
  // 교차점이 하나씩 사라질 뿐 주장이 늘지 않는다.
  parameters: [],

  stages: [
    {
      id: 'thick-lens',
      label: text('label.stage'),
      constants: {
        surfaceRadius: SURFACE_RADIUS,
        thickness: LENS_THICKNESS,
        refractiveIndex: REFRACTIVE_INDEX,
        rayPairs: RAY_PAIRS,
        raySpacing: RAY_SPACING,
        stopHalf: STOP_HALF,
      },
    },
  ],

  environments: [],

  views: [{ id: 'lens', label: text('label.view'), default: true }],

  /**
   * 축 → 렌즈 → 줄기 → 조리개 → 치수선 → 교차점 → 글자 순. plugin 어휘(`ray`)가 층에서
   * region 보다 앞설 수 있어 scene 순서로 고정한다 — 줄기가 렌즈 유리 위로 지나가고,
   * 조리개 판은 막힌 줄기 끝을 덮는다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 들어옴 → 렌즈 지남 → 교차점 표시 → 멈춤 → 조리개 닫힘 → 멈춤 → 빠져나감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `enter` · `pass` · `drain` 진행도로, 교차점 · 치수선의 짙기는
   * `mark` · `drain` 진행도로, 조리개 판의 자리 · 짙기는 `stop-in` · `drain` 진행도로 읽는다
   * (`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'enter', duration: 1.4, caption: key('caption.enter') },
      { id: 'pass', duration: 1.6, caption: key('caption.pass') },
      { id: 'mark', duration: 0.6, ease: 'smooth', caption: key('caption.spread') },
      { id: 'hold-open', duration: 3.0, caption: key('caption.spread') },
      { id: 'stop-in', duration: 1.4, ease: 'smooth', caption: key('caption.stopIn') },
      { id: 'hold-stop', duration: 3.0, caption: key('caption.narrow') },
      { id: 'drain', duration: 1.3, caption: key('caption.narrow') },
    ],
  },

  /** 도착한 순간 줄기가 다 지나가 있고 교차점이 축 위에 퍼져 서 있다 — 열린 멈춤 안에서 연다 (S-piece). */
  startAt: 4.2,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 교차점이 퍼진 폭인데, 그것은
  // 치수선 하나가 수 없이 가리킨다.

  messages: sphericalAberrationMessages,
};
