// ========================================================================
// real-vs-virtual-image — 선언
// ========================================================================
// 질문: 실상과 허상은 무엇이 다른가 — 상 자리에 스크린을 대면 무엇이 맺히는가.
//
// 답: 볼록 렌즈 앞 초점 밖(2f)의 물체 끝에서 나온 줄기는 렌즈를 지나 스크린 위 한 점에
// 실제로 모이고, 스크린에 거꾸로 선 밝은 상이 맺힌다(실상). 물체를 초점 안으로 옮기면
// 줄기는 렌즈를 지나도 벌어져 스크린에는 흐린 빛만 번진다. 벌어진 줄기를 거꾸로 이은
// 점선만 렌즈 앞 한 점에서 만나고, 거기 선 상(허상)으로는 실제 줄기가 가지 않는다.
//
// 평행광 · 초점은 `converging-diverging-lens`, 물체 자리에 따른 상 크기는 `magnification`
// 의 몫이다. 이 조각은 **실제 줄기(실선)가 모이느냐, 연장선(점선)만 만나느냐** 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:real-vs-virtual-image` 와 문자 그대로 일치한다 (C4). */
export const REAL_VS_VIRTUAL_IMAGE_ID = 'real-vs-virtual-image';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 볼록 렌즈의 초점 거리(월드). */
export const FOCAL_LENGTH = 1.2;
/** 물체(화살표)의 높이(월드). */
export const OBJECT_HEIGHT = 0.5;
/** 실상 장면의 물체 거리(월드) — 초점 밖(2f). */
export const REAL_OBJECT_DISTANCE = 2.4;
/** 허상 장면의 물체 거리(월드) — 초점 안. */
export const VIRTUAL_OBJECT_DISTANCE = 0.7;
/**
 * 스크린의 x(월드). 실상 장면의 상 거리에 세운다 — 그 자리여야 실상이 스크린에 맺힌다.
 * 두 상수(물체 거리 · 초점 거리)와 이 값이 맞아야 한다는 관계는 NOTES (c) G143.
 */
export const SCREEN_X = 2.4;
/** 물체 끝에서 나오는 줄기 수. */
export const RAY_COUNT = 5;
/** 줄기가 렌즈에 닿는 높이의 간격(월드). 줄기 묶음은 물체 끝 높이를 가운데로 한다. */
export const RAY_SPACING = 0.25;
/** 스크린에 맺힌 실상의 빛 세기(0~1, 빛 채널). */
export const IMAGE_LIGHT = 1;
/** 허상 장면에서 스크린에 번진 빛의 세기(0~1, 빛 채널). 한 점에 모이지 않아 옅다. */
export const SMEAR_LIGHT = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 렌즈는 x = 0, 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 렌즈 높이(월드). 가장 높은 줄기(물체 끝 + 간격 × 2)보다 넉넉하다. */
export const LENS_SIZE = 2.5;
/** 광축 보조선의 왼쪽 · 오른쪽 끝(월드). */
export const AXIS_FROM_X = -2.75;
export const AXIS_TO_X = 2.75;
/** 스크린 판의 반너비(월드). */
export const SCREEN_HALF_WIDTH = 0.07;
/** 스크린 판의 위 · 아래 끝(월드). 실상(축 아래)과 허상 장면에서 번진 빛이 모두 판 위에 떨어진다. */
export const SCREEN_TOP = 1.1;
export const SCREEN_BOTTOM = -2.0;
/** 스크린 위 실상 화살촉의 길이(월드). */
export const IMAGE_HEAD = 0.13;
/** 스크린 위 실상 화살촉의 반너비(월드). 판 너비 안에 든다. */
export const IMAGE_HEAD_HALF_WIDTH = 0.065;
/** 초점 점의 반지름(월드). */
export const FOCUS_DOT_RADIUS = 0.045;

/**
 * 프레이밍 — 가로는 먼 물체부터 스크린 이름표까지, 세로는 렌즈 위 끝 · 스크린 이름표부터
 * 스크린 아래 끝과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -2.85, maxX: 3.25, minY: -2.5, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const realVsVirtualImageMessages = Object.freeze({
  'label.title': {
    ko: '실상과 허상',
    en: 'Real and virtual images',
    ja: '実像と虚像',
    zh: '实像与虚像',
    ar: 'الصور الحقيقية والوهمية',
    es: 'Imágenes reales y virtuales',
    fr: 'Images réelles et virtuelles',
    hi: 'वास्तविक और आभासी प्रतिबिंब',
    id: 'Bayangan nyata dan maya',
    pt: 'Imagens reais e virtuais',
  },
  'label.operation': {
    ko: '빛이 실제로 모이는가',
    en: 'Does the light really meet?',
    ja: '光は本当に集まるのか？',
    zh: '光真的会聚吗？',
    ar: 'هل يلتقي الضوء فعلًا؟',
    es: '¿La luz se junta de verdad?',
    fr: 'La lumière se rejoint-elle vraiment ?',
    hi: 'क्या प्रकाश सचमुच मिलता है?',
    id: 'Apakah cahaya benar-benar bertemu?',
    pt: 'A luz se encontra de verdade?',
  },
  'label.stage': {
    ko: '볼록 렌즈와 스크린',
    en: 'A converging lens and a screen',
    ja: '凸レンズとスクリーン',
    zh: '凸透镜与光屏',
    ar: 'عدسة مجمعة وشاشة',
    es: 'Una lente convergente y una pantalla',
    fr: 'Une lentille convergente et un écran',
    hi: 'उत्तल लेंस और पर्दा',
    id: 'Lensa cembung dan layar',
    pt: 'Uma lente convergente e uma tela',
  },
  'label.view': {
    ko: '물체 · 렌즈 · 스크린',
    en: 'Object, lens, screen',
    ja: '物体・レンズ・スクリーン',
    zh: '物体、透镜、光屏',
    ar: 'الجسم والعدسة والشاشة',
    es: 'Objeto, lente, pantalla',
    fr: 'Objet, lentille, écran',
    hi: 'वस्तु, लेंस, पर्दा',
    id: 'Benda, lensa, layar',
    pt: 'Objeto, lente, tela',
  },

  /** 도식 이름표. */
  'label.screen': {
    ko: '스크린',
    en: 'screen',
    ja: 'スクリーン',
    zh: '光屏',
    ar: 'الشاشة',
    es: 'pantalla',
    fr: 'écran',
    hi: 'पर्दा',
    id: 'layar',
    pt: 'tela',
  },
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
  /** 초점 표식 — 기호라 두 언어가 같다. */
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

  'caption.realEmit': {

    ko: '물체 끝에서 나온 빛이 볼록 렌즈를 지나 스크린으로 간다.',

    en: 'Light from the tip of the object passes through the lens toward the screen.',

    ja: '物体の先端から出た光がレンズを通ってスクリーンへ向かう。',

    zh: '从物体顶端发出的光穿过透镜射向光屏。',

    ar: 'يمر الضوء الخارج من طرف الجسم عبر العدسة نحو الشاشة.',

    es: 'La luz que sale de la punta del objeto atraviesa la lente hacia la pantalla.',

    fr: 'La lumière issue de la pointe de l’objet traverse la lentille vers l’écran.',

    hi: 'वस्तु के सिरे से निकला प्रकाश लेंस से होकर पर्दे की ओर जाता है।',

    id: 'Cahaya dari ujung benda melewati lensa menuju layar.',

    pt: 'A luz que sai da ponta do objeto atravessa a lente em direção à tela.',

  },
  'caption.real': {
    ko: '줄기가 스크린 위 한 점에 실제로 모인다 — 스크린에 거꾸로 선 밝은 상이 맺힌다.',
    en: 'The beams really meet at one point on the screen — a bright, upside-down image forms there.',
    ja: '光線がスクリーン上の1点に実際に集まる — そこに明るい倒立像ができる。',
    zh: '光束真的会聚到光屏上的一点——那里形成明亮的倒立像。',
    ar: 'تلتقي الحزم فعلًا عند نقطة واحدة على الشاشة — فتتكوّن هناك صورة ساطعة مقلوبة.',
    es: 'Los haces se juntan de verdad en un punto de la pantalla — allí se forma una imagen brillante e invertida.',
    fr: 'Les faisceaux se rejoignent vraiment en un point de l’écran — une image lumineuse et renversée s’y forme.',
    hi: 'किरणपुंज सचमुच पर्दे के एक बिंदु पर मिलते हैं — वहाँ एक चमकीला, उल्टा प्रतिबिंब बनता है।',
    id: 'Berkas-berkas benar-benar bertemu di satu titik pada layar — di sana terbentuk bayangan terang yang terbalik.',
    pt: 'Os feixes se encontram de verdade num ponto da tela — ali se forma uma imagem brilhante e invertida.',
  },
  'caption.move': {
    ko: '물체를 초점 F 안쪽으로 옮긴다.',
    en: 'The object moves inside the focal point F.',
    ja: '物体を焦点 F の内側へ動かす。',
    zh: '物体移到焦点 F 以内。',
    ar: 'ينتقل الجسم إلى داخل البؤرة F.',
    es: 'El objeto se mueve dentro del foco F.',
    fr: 'L’objet passe en deçà du foyer F.',
    hi: 'वस्तु फोकस F के भीतर खिसकती है।',
    id: 'Benda bergeser ke dalam titik fokus F.',
    pt: 'O objeto passa para dentro do foco F.',
  },
  'caption.virtualEmit': {
    ko: '이번에는 렌즈를 지난 줄기가 모이지 않고 벌어진다.',
    en: 'This time the beams leaving the lens spread apart instead of meeting.',
    ja: '今度はレンズを出た光線が集まらずに広がる。',
    zh: '这一次，离开透镜的光束不会聚，而是散开。',
    ar: 'هذه المرة تتباعد الحزم الخارجة من العدسة بدل أن تلتقي.',
    es: 'Esta vez los haces que salen de la lente se separan en lugar de juntarse.',
    fr: 'Cette fois, les faisceaux qui quittent la lentille s’écartent au lieu de se rejoindre.',
    hi: 'इस बार लेंस से निकलते किरणपुंज मिलने के बजाय फैल जाते हैं।',
    id: 'Kali ini berkas yang keluar dari lensa menyebar alih-alih bertemu.',
    pt: 'Desta vez os feixes que saem da lente se afastam em vez de se encontrar.',
  },
  'caption.smear': {
    ko: '스크린에는 흐린 빛만 번진다 — 맺힌 상이 없다.',
    en: 'Only a faint smear of light reaches the screen — no image forms on it.',
    ja: 'スクリーンにはぼんやりした光がにじむだけ — 像はできない。',
    zh: '光屏上只有一片模糊的光——没有成像。',
    ar: 'لا يصل إلى الشاشة إلا ضوء باهت منتشر — لا تتكوّن عليها صورة.',
    es: 'A la pantalla solo llega una mancha tenue de luz — no se forma ninguna imagen.',
    fr: 'Seule une vague tache de lumière atteint l’écran — aucune image ne s’y forme.',
    hi: 'पर्दे पर केवल हल्का धुंधला प्रकाश फैलता है — कोई प्रतिबिंब नहीं बनता।',
    id: 'Hanya sebaran cahaya redup yang sampai ke layar — tidak ada bayangan yang terbentuk.',
    pt: 'Só uma mancha fraca de luz chega à tela — nenhuma imagem se forma nela.',
  },
  'caption.traceBack': {
    ko: '벌어진 줄기를 렌즈 앞쪽으로 거꾸로 이어 본다.',
    en: 'Extend the spreading beams backward, in front of the lens.',
    ja: '広がる光線を、レンズの手前側へ逆向きに延ばしてみる。',
    zh: '把散开的光束反向延长到透镜前方。',
    ar: 'مُدّ الحزم المتباعدة إلى الخلف، أمام العدسة.',
    es: 'Prolonga hacia atrás los haces que se abren, delante de la lente.',
    fr: 'Prolongeons vers l’arrière les faisceaux qui s’écartent, devant la lentille.',
    hi: 'फैलते किरणपुंजों को पीछे की ओर, लेंस के सामने तक बढ़ाएँ।',
    id: 'Perpanjang berkas yang menyebar ke belakang, di depan lensa.',
    pt: 'Prolongue para trás os feixes que se afastam, na frente da lente.',
  },
  'caption.virtual': {
    ko: '점선만 렌즈 앞 한 점에서 만나 바로 선 상이 선다 — 그 자리로 간 실제 줄기는 없다.',
    en: 'Only the dashed lines meet, in front of the lens, where an upright image stands — no actual beam goes there.',
    ja: '点線だけがレンズの手前で交わり、そこに正立像が立つ — その場所へ行く実際の光線はない。',
    zh: '只有虚线在透镜前方相交，那里立着一个正立的像——并没有实际的光束到达那里。',
    ar: 'الخطوط المتقطعة وحدها تلتقي أمام العدسة، حيث تقوم صورة معتدلة — ولا تصل إلى هناك أي حزمة حقيقية.',
    es: 'Solo las líneas discontinuas se cruzan, delante de la lente, donde aparece una imagen derecha — ningún haz real llega allí.',
    fr: 'Seuls les pointillés se rejoignent, devant la lentille, là où se dresse une image droite — aucun faisceau réel n’y passe.',
    hi: 'केवल बिंदुकित रेखाएँ लेंस के सामने मिलती हैं, जहाँ एक सीधा प्रतिबिंब खड़ा होता है — वहाँ कोई वास्तविक किरणपुंज नहीं जाता।',
    id: 'Hanya garis putus-putus yang bertemu, di depan lensa, tempat bayangan tegak berdiri — tidak ada berkas nyata yang ke sana.',
    pt: 'Só as linhas tracejadas se encontram, na frente da lente, onde fica uma imagem direita — nenhum feixe real chega lá.',
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

export type RealVsVirtualImageMessageKey = keyof typeof realVsVirtualImageMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: RealVsVirtualImageMessageKey): LocalizedText => realVsVirtualImageMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: RealVsVirtualImageMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const realVsVirtualImageSchema: BundleSchema = {
  id: REAL_VS_VIRTUAL_IMAGE_ID,
  label: text('label.title'),
  category: 'optics',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 물체를 초점 밖 → 안으로 옮기는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'lens-and-screen',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        objectHeight: OBJECT_HEIGHT,
        realObjectDistance: REAL_OBJECT_DISTANCE,
        virtualObjectDistance: VIRTUAL_OBJECT_DISTANCE,
        screenX: SCREEN_X,
        rayCount: RAY_COUNT,
        raySpacing: RAY_SPACING,
        imageLight: IMAGE_LIGHT,
        smearLight: SMEAR_LIGHT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'object-lens-screen', label: text('label.view'), default: true }],

  /** 가로로 넓은 한 줄 그림 — 물체 · 렌즈 · 스크린이 광축 하나에 늘어선다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 축 → 스크린 판 → 스크린 위 빛 → 렌즈 → 줄기 → 점선 → 화살표 → 글자 순. plugin 어휘(`ray` ·
   * `opticalElement`)가 층에서 어디 끼는지에 기대지 않게 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [실상] 줄기가 스크린으로 → 맺힘 → 멈춤 → 빠져나감, 물체를 초점 안으로,
   * [허상] 줄기가 벌어져 스크린으로 → 번짐 → 멈춤 → 거꾸로 잇기 → 허상 → 멈춤 → 빠져나감, 되돌아감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `*-emit` · `*-drain` 진행도로, 물체 자리는 `move` · `return`
   * 진행도로, 스크린 위 빛 · 점선 · 허상의 짙기는 `real-form` · `smear` · `trace-back` ·
   * `virtual-mark` 와 `*-drain` 진행도로 읽는다(`physics.ts`).
   */
  timeline: {
    phases: [
      { id: 'real-emit', duration: 1.6, caption: key('caption.realEmit') },
      { id: 'real-form', duration: 0.5, ease: 'smooth', caption: key('caption.real') },
      { id: 'real-hold', duration: 2.8, caption: key('caption.real') },
      { id: 'real-drain', duration: 1.0, caption: key('caption.real') },
      { id: 'move', duration: 1.6, ease: 'smooth', caption: key('caption.move') },
      { id: 'virtual-emit', duration: 1.6, caption: key('caption.virtualEmit') },
      { id: 'smear', duration: 0.5, ease: 'smooth', caption: key('caption.smear') },
      { id: 'smear-hold', duration: 2.4, caption: key('caption.smear') },
      { id: 'trace-back', duration: 1.6, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'virtual-mark', duration: 0.5, ease: 'smooth', caption: key('caption.virtual') },
      { id: 'virtual-hold', duration: 3.0, caption: key('caption.virtual') },
      { id: 'virtual-drain', duration: 1.0, caption: key('caption.virtual') },
      { id: 'return', duration: 1.4, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 줄기가 스크린에 모여 있고 밝은 실상이 맺혀 있다 — 실상 멈춤 안에서 연다 (S-piece). */
  startAt: 2.9,

  /** 슬롯 하나. 그림 아래 가운데 한 줄. */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것이 없다 — 줄기가 스크린에서 모이느냐,
  // 점선만 렌즈 앞에서 만나느냐가 주장이다.

  messages: realVsVirtualImageMessages,
};
