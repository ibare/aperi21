// ========================================================================
// concave-mirror — 선언
// ========================================================================
// 질문: 오목거울 앞의 물체를 거울 쪽으로 옮겨 가면 상은 어떻게 되는가.
//
// 답: 물체를 C 바깥 → C 와 F 사이 → F 안쪽으로 옮기며 자리마다 주광선 둘(축에 나란히 →
// F 를 지나 돌아옴, F 를 지나 → 나란히 돌아옴)을 긋는다. 앞의 두 자리에서는 비친 두 줄기가
// 거울 앞에서 실제로 만나 거꾸로 선 실상이 서고, F 안쪽에서는 비친 줄기가 벌어져 만나지
// 않으며 거울 뒤로 거꾸로 이은 점선이 만나 바로 선 허상이 선다.
//
// 얇은 렌즈의 세 광선 결상은 `ray-tracing`, 볼록 렌즈의 배율은 `magnification`, 렌즈의
// 실상 · 허상과 스크린은 `real-vs-virtual-image` 의 몫이다. 이 조각은 거울 하나에서 물체
// 자리에 따라 상이 뒤바뀌는 것만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:concave-mirror` 와 문자 그대로 일치한다 (C4). */
export const CONCAVE_MIRROR_ID = 'concave-mirror';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 오목거울의 초점 거리(월드). 곡률 중심 C 는 그 두 배 자리다. */
export const FOCAL_LENGTH = 1.5;
/** 물체(화살표)의 높이(월드). */
export const OBJECT_HEIGHT = 0.8;
/** 세 멈춤 자리의 물체 거리 — 초점 거리의 몇 배인가. C 바깥 · C 와 F 사이 · F 안쪽. */
export const FAR_FACTOR = 3;
export const MID_FACTOR = 1.5;
export const NEAR_FACTOR = 0.5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 거울 꼭짓점은 (0, 0), 광축은 y = 0, 물체는 왼쪽(x < 0)에 선다.
// ------------------------------------------------------------------------

/** 거울 반높이(월드). 주광선이 거울에 닿는 가장 높은 자리(상 높이)보다 넉넉하다. */
export const MIRROR_HALF = 1.9;
/**
 * 거울 가장자리가 물체 쪽으로 휜 깊이(월드). **그림의 휨** 이다 — 참 곡률(반지름 2f)로
 * 그리면 가장자리가 크게 휘어 줄기가 닿는 자리가 꼭짓점 면에서 멀어진다. 얕게 두고
 * 줄기는 이 곡선 위에서 비치게 한다(NOTES (b)).
 */
export const MIRROR_SAG = 0.07;
/** 거울 뒷면 띠의 두께(월드). */
export const MIRROR_BACK = 0.09;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -5.1;
export const AXIS_TO_X = 2.3;
/** 실상을 지난 줄기가 더 뻗는 길이(월드). 두 줄기가 상 끝에서 엇갈리는 것이 보인다. */
export const RAY_TAIL = 0.45;
/** 허상 자리에서 비친 줄기가 거울 앞으로 뻗는 길이(월드). */
export const DIVERGE_REACH = 2.3;
/** 초점 · 곡률 중심 점의 반지름(월드). */
export const POINT_RADIUS = 0.045;

/**
 * 프레이밍 — 가로는 가장 먼 물체 · 가장 먼 실상의 줄기 끝부터 거울 뒤 허상 이름표까지,
 * 세로는 거울 위 끝부터 거울 아래 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.25, maxX: 2.45, minY: -2.5, maxY: 2.05 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const concaveMirrorMessages = Object.freeze({
  'label.title': {
    ko: '오목거울',
    en: 'Concave mirror',
    ja: '凹面鏡',
    zh: '凹面镜',
    ar: 'المرآة المقعرة',
    es: 'Espejo cóncavo',
    fr: 'Miroir concave',
    hi: 'अवतल दर्पण',
    id: 'Cermin cekung',
    pt: 'Espelho côncavo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '물체가 초점 밖이면 실상, 안이면 허상',
    en: 'A real image while the object is outside the focal point, a virtual one once inside',
    ja: '物体が焦点の外なら実像、内なら虚像',
    zh: '物体在焦点外成实像，在焦点内成虚像',
    ar: 'صورة حقيقية ما دام الجسم خارج البؤرة، ووهمية حين يدخلها',
    es: 'Imagen real mientras el objeto está fuera del foco, virtual cuando está dentro',
    fr: 'Une image réelle tant que l’objet est au-delà du foyer, virtuelle une fois en deçà',
    hi: 'वस्तु फोकस के बाहर हो तो वास्तविक प्रतिबिंब, भीतर हो तो आभासी',
    id: 'Bayangan nyata selama benda di luar titik fokus, bayangan maya begitu di dalamnya',
    pt: 'Imagem real enquanto o objeto está fora do foco, virtual quando está dentro',
  },
  'label.stage': {
    ko: '거울 앞 세 자리',
    en: 'Three spots before the mirror',
    ja: '鏡の前の三つの位置',
    zh: '镜前的三个位置',
    ar: 'ثلاثة مواضع أمام المرآة',
    es: 'Tres posiciones frente al espejo',
    fr: 'Trois positions devant le miroir',
    hi: 'दर्पण के सामने तीन स्थान',
    id: 'Tiga posisi di depan cermin',
    pt: 'Três posições diante do espelho',
  },
  'label.view': {
    ko: '물체와 상',
    en: 'Object and image',
    ja: '物体と像',
    zh: '物体与像',
    ar: 'الجسم والصورة',
    es: 'Objeto e imagen',
    fr: 'Objet et image',
    hi: 'वस्तु और प्रतिबिंब',
    id: 'Benda dan bayangan',
    pt: 'Objeto e imagem',
  },

  /** 초점 · 곡률 중심 표식 — 기호라 두 언어가 같다. */
  'label.focus': {
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
  'label.center': {
    ko: 'C',
    en: 'C',
    ja: 'C',
    zh: 'C',
    ar: 'C',
    es: 'C',
    fr: 'C',
    hi: 'C',
    id: 'C',
    pt: 'C',
  },
  /** 상 이름표. */
  'label.real': {
    ko: '실상',
    en: 'real image',
    ja: '実像',
    zh: '实像',
    ar: 'صورة حقيقية',
    es: 'imagen real',
    fr: 'image réelle',
    hi: 'वास्तविक प्रतिबिंब',
    id: 'bayangan nyata',
    pt: 'imagem real',
  },
  'label.virtual': {
    ko: '허상',
    en: 'virtual image',
    ja: '虚像',
    zh: '虚像',
    ar: 'صورة وهمية',
    es: 'imagen virtual',
    fr: 'image virtuelle',
    hi: 'आभासी प्रतिबिंब',
    id: 'bayangan maya',
    pt: 'imagem virtual',
  },

  'caption.rays': {
    ko: '물체 끝에서 나온 두 줄기가 거울에 비친다.',
    en: 'Two beams from the tip of the object bounce off the mirror.',
    ja: '物体の先端から出た二本の光束が鏡で反射する。',
    zh: '从物体顶端发出的两束光被镜面反射。',
    ar: 'تنعكس عن المرآة حزمتان صادرتان من طرف الجسم.',
    es: 'Dos haces que salen de la punta del objeto se reflejan en el espejo.',
    fr: 'Deux faisceaux issus du sommet de l’objet se réfléchissent sur le miroir.',
    hi: 'वस्तु के सिरे से निकले दो किरण-पुंज दर्पण से परावर्तित होते हैं।',
    id: 'Dua berkas dari ujung benda dipantulkan oleh cermin.',
    pt: 'Dois feixes que saem da ponta do objeto refletem no espelho.',
  },
  'caption.far': {
    ko: '물체는 C 바깥 — 비친 두 줄기가 C 와 F 사이에서 만나 거꾸로 선 작은 상이 선다.',
    en: 'The object is beyond C — the reflected beams meet between C and F, forming a small upside-down image.',
    ja: '物体は C の外側 — 反射した光束が C と F の間で交わり、倒立した小さな像ができる。',
    zh: '物体在 C 之外 — 反射光束在 C 与 F 之间相交，形成倒立缩小的像。',
    ar: 'الجسم أبعد من C — تلتقي الحزم المنعكسة بين C و F مكوّنةً صورة صغيرة مقلوبة.',
    es: 'El objeto está más allá de C — los haces reflejados se cruzan entre C y F y forman una imagen pequeña e invertida.',
    fr: 'L’objet est au-delà de C — les faisceaux réfléchis se croisent entre C et F et forment une petite image renversée.',
    hi: 'वस्तु C से आगे है — परावर्तित किरण-पुंज C और F के बीच मिलते हैं और एक छोटा उल्टा प्रतिबिंब बनाते हैं।',
    id: 'Benda berada di luar C — berkas pantul bertemu di antara C dan F, membentuk bayangan kecil yang terbalik.',
    pt: 'O objeto está além de C — os feixes refletidos se encontram entre C e F, formando uma imagem pequena e invertida.',
  },
  'caption.moveMid': {
    ko: '물체를 C 와 F 사이로 옮긴다.',
    en: 'Move the object between C and F.',
    ja: '物体を C と F の間へ動かす。',
    zh: '把物体移到 C 与 F 之间。',
    ar: 'حرّك الجسم إلى ما بين C و F.',
    es: 'Mueve el objeto entre C y F.',
    fr: 'Déplacez l’objet entre C et F.',
    hi: 'वस्तु को C और F के बीच ले जाएँ।',
    id: 'Pindahkan benda ke antara C dan F.',
    pt: 'Mova o objeto para entre C e F.',
  },
  'caption.mid': {
    ko: '비친 두 줄기가 C 바깥에서 만나 거꾸로 선 큰 상이 선다.',
    en: 'The reflected beams meet beyond C, forming a large upside-down image.',
    ja: '反射した光束が C の外側で交わり、倒立した大きな像ができる。',
    zh: '反射光束在 C 之外相交，形成倒立放大的像。',
    ar: 'تلتقي الحزم المنعكسة أبعد من C مكوّنةً صورة كبيرة مقلوبة.',
    es: 'Los haces reflejados se cruzan más allá de C y forman una imagen grande e invertida.',
    fr: 'Les faisceaux réfléchis se croisent au-delà de C et forment une grande image renversée.',
    hi: 'परावर्तित किरण-पुंज C से आगे मिलते हैं और एक बड़ा उल्टा प्रतिबिंब बनाते हैं।',
    id: 'Berkas pantul bertemu di luar C, membentuk bayangan besar yang terbalik.',
    pt: 'Os feixes refletidos se encontram além de C, formando uma imagem grande e invertida.',
  },
  'caption.moveNear': {
    ko: '물체를 F 안쪽으로 옮긴다.',
    en: 'Move the object inside F.',
    ja: '物体を F の内側へ動かす。',
    zh: '把物体移到 F 以内。',
    ar: 'حرّك الجسم إلى داخل F.',
    es: 'Mueve el objeto dentro de F.',
    fr: 'Déplacez l’objet en deçà de F.',
    hi: 'वस्तु को F के भीतर ले जाएँ।',
    id: 'Pindahkan benda ke dalam F.',
    pt: 'Mova o objeto para dentro de F.',
  },
  'caption.traceBack': {
    ko: '비친 두 줄기는 벌어져 만나지 않는다 — 거울 뒤로 거꾸로 이어 본다.',
    en: 'The reflected beams spread apart and never meet — extend them backward behind the mirror.',
    ja: '反射した光束は広がって交わらない — 鏡の後ろへ逆向きに延ばしてみる。',
    zh: '反射光束彼此散开，永不相交 — 把它们反向延长到镜后。',
    ar: 'تتباعد الحزم المنعكسة ولا تلتقي أبدًا — مُدّها إلى الخلف وراء المرآة.',
    es: 'Los haces reflejados se separan y nunca se cruzan — prolóngalos hacia atrás, detrás del espejo.',
    fr: 'Les faisceaux réfléchis s’écartent et ne se croisent jamais — prolongez-les vers l’arrière, derrière le miroir.',
    hi: 'परावर्तित किरण-पुंज फैल जाते हैं और कभी नहीं मिलते — उन्हें पीछे की ओर दर्पण के पीछे तक बढ़ाएँ।',
    id: 'Berkas pantul menyebar dan tidak pernah bertemu — perpanjang ke belakang, di belakang cermin.',
    pt: 'Os feixes refletidos se afastam e nunca se encontram — prolongue-os para trás, atrás do espelho.',
  },
  'caption.near': {
    ko: '점선이 거울 뒤에서 만나 바로 선 큰 상이 선다 — 실제 줄기는 그 점에 닿지 않는다.',
    en: 'The dashed lines meet behind the mirror, forming a large upright image — no actual beam reaches that point.',
    ja: '点線が鏡の後ろで交わり、正立した大きな像ができる — 実際の光束はその点に届かない。',
    zh: '虚线在镜后相交，形成正立放大的像 — 并没有实际的光束到达那一点。',
    ar: 'تلتقي الخطوط المتقطعة خلف المرآة مكوّنةً صورة كبيرة معتدلة — لا تصل أي حزمة فعلية إلى تلك النقطة.',
    es: 'Las líneas discontinuas se cruzan detrás del espejo y forman una imagen grande y derecha — ningún haz real llega a ese punto.',
    fr: 'Les pointillés se croisent derrière le miroir et forment une grande image droite — aucun faisceau réel n’atteint ce point.',
    hi: 'बिंदुकित रेखाएँ दर्पण के पीछे मिलती हैं और एक बड़ा सीधा प्रतिबिंब बनाती हैं — कोई वास्तविक किरण-पुंज उस बिंदु तक नहीं पहुँचता।',
    id: 'Garis putus-putus bertemu di belakang cermin, membentuk bayangan besar yang tegak — tidak ada berkas nyata yang sampai ke titik itu.',
    pt: 'As linhas tracejadas se encontram atrás do espelho, formando uma imagem grande e direita — nenhum feixe real chega a esse ponto.',
  },
  'caption.return': {
    ko: '물체가 처음 자리로 돌아간다.',
    en: 'The object goes back to where it started.',
    ja: '物体が最初の位置に戻る。',
    zh: '物体回到起始位置。',
    ar: 'يعود الجسم إلى موضعه الأول.',
    es: 'El objeto vuelve a su posición inicial.',
    fr: 'L’objet revient à sa position de départ.',
    hi: 'वस्तु अपनी शुरुआती जगह पर लौट आती है।',
    id: 'Benda kembali ke posisi awalnya.',
    pt: 'O objeto volta à posição inicial.',
  },
} satisfies Record<string, LocalizedText>);

export type ConcaveMirrorMessageKey = keyof typeof concaveMirrorMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ConcaveMirrorMessageKey): LocalizedText => concaveMirrorMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ConcaveMirrorMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const concaveMirrorSchema: BundleSchema = {
  id: CONCAVE_MIRROR_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 세 자리로 옮기는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'three-spots',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectHeight: OBJECT_HEIGHT,
        farFactor: FAR_FACTOR,
        midFactor: MID_FACTOR,
        nearFactor: NEAR_FACTOR,
      },
    },
  ],

  environments: [],

  views: [{ id: 'object-and-image', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 그림 — 물체 · C · F · 거울 · (거울 뒤) 허상이 광축 하나에 늘어선다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 축 → 거울 → 점 → 줄기 → 점선 → 화살표 → 글자 순. plugin 어휘(`ray`)가 층에서 어디 끼는지에
   * 기대지 않게 scene 순서로 고정한다 — 화살표가 줄기 위로 온다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 세 자리(C 바깥 · C 와 F 사이 · F 안쪽)마다 [줄기 → 상 → 멈춤 → 걷힘], 그 사이의
   * 옮김, 그리고 처음 자리로 돌아감.
   *
   * 물체의 x 는 `move-*` · `return` 진행도의 합으로(`physics.ts`), 자리마다 줄기 앞머리 · 꼬리는
   * `rays-k` · `clear-k` 진행도로, 상 짙기와 거꾸로 이은 점선 길이는 `image-k` 진행도로 읽는다.
   * 허상 자리는 `image-k` 가 길다 — 점선이 거울 뒤로 자라는 동안 상이 드러난다.
   */
  timeline: {
    phases: [
      { id: 'rays-1', duration: 1.6, caption: key('caption.rays') },
      { id: 'image-1', duration: 0.6, ease: 'smooth', caption: key('caption.far') },
      { id: 'hold-1', duration: 2.8, caption: key('caption.far') },
      { id: 'clear-1', duration: 0.8, caption: key('caption.far') },
      { id: 'move-12', duration: 1.6, ease: 'smooth', caption: key('caption.moveMid') },
      { id: 'rays-2', duration: 1.6, caption: key('caption.rays') },
      { id: 'image-2', duration: 0.6, ease: 'smooth', caption: key('caption.mid') },
      { id: 'hold-2', duration: 2.8, caption: key('caption.mid') },
      { id: 'clear-2', duration: 0.8, caption: key('caption.mid') },
      { id: 'move-23', duration: 1.6, ease: 'smooth', caption: key('caption.moveNear') },
      { id: 'rays-3', duration: 1.6, caption: key('caption.rays') },
      { id: 'image-3', duration: 1.8, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'hold-3', duration: 3.2, caption: key('caption.near') },
      { id: 'clear-3', duration: 0.8, caption: key('caption.near') },
      { id: 'return', duration: 1.6, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 C 바깥 자리의 두 줄기가 다 그어져 있고 실상이 서 있다 — 첫 멈춤 안에서 연다 (S-piece). */
  startAt: 2.6,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 상이 거울 앞인지 뒤인지,
  // 거꾸로인지 바로인지가 주장이고, 그것은 C · F 점과 화살표 방향으로 보인다.

  messages: concaveMirrorMessages,
};
