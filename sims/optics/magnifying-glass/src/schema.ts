// ========================================================================
// magnifying-glass — 선언
// ========================================================================
// 질문: 돋보기로 보면 왜 크게 보이는가 — 눈에는 무엇이 들어오는가.
//
// 답: 개미를 볼록 렌즈의 초점 F 안에 두면 개미 머리에서 나온 줄기는 렌즈를 지나도
// 모이지 않고 벌어진 채 렌즈 너머의 눈으로 들어간다. 눈에 든 줄기를 거꾸로 이으면 개미
// 뒤쪽 먼 곳, 개미와 같은 쪽에 크고 바로 선 상(허상)이 선다. 개미를 F 가까이 옮기면
// 상이 더 커지고 더 멀어진다. 아래 줄에는 같은 개미를 맨눈으로 25 cm 에서 본 모습이
// 늘 놓여 있어, 눈에 드는 각(시야각)을 두 줄에서 나란히 견준다.
//
// 실상 · 허상의 구분은 `real-vs-virtual-image`, 초점 밖 물체의 상 크기는 `magnification`
// 의 몫이다. 이 조각은 **렌즈 너머의 눈이 보는 것** — 크고 바로 선 허상과 맨눈보다 넓은
// 각 — 만 말한다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnifying-glass` 와 문자 그대로 일치한다 (C4). */
export const MAGNIFYING_GLASS_ID = 'magnifying-glass';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위는 cm 다. 렌즈는 x = 0, 위 줄 광축은 y = 0 이다.
// ------------------------------------------------------------------------

/** 돋보기(볼록 렌즈)의 초점 거리(cm). */
export const FOCAL_LENGTH = 5;
/** 개미의 키(cm) — 발끝에서 머리 꼭대기까지. 줄기는 머리 꼭대기에서 나온다. */
export const ANT_HEIGHT = 0.8;
/** 첫 멈춤의 개미 거리(cm) — 초점 거리의 0.6 배. */
export const NEAR_DISTANCE = 3;
/** 둘째 멈춤의 개미 거리(cm) — 초점 거리의 0.8 배, F 에 더 가깝다. */
export const FAR_DISTANCE = 4;
/**
 * 두 멈춤의 배율 정박값 — 화면 글자 `×{m}` 과 캡션이 이 값을 그대로 쓴다.
 * 그림의 상 크기는 `findImage` 가 계산하고, 이 값과 같아야 한다는 관계는 NOTES (c) G143.
 */
export const NEAR_MAG = 2.5;
export const FAR_MAG = 5;
/** 맨눈으로 볼 때 개미를 눈에서 떨어뜨린 거리(cm). 화면 글자 `{d} cm` 도 이 값이다. */
export const NAKED_DISTANCE = 25;
/** 렌즈에서 동공까지(cm). 돋보기를 눈 가까이 든다. */
export const EYE_GAP = 1.5;
/** 동공의 반높이(cm). 줄기 셋이 동공 위 · 가운데 · 아래로 들어간다. */
export const PUPIL_HALF = 0.3;
/** 눈에 드는 줄기 수. */
export const RAY_COUNT = 3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위(cm).
// ------------------------------------------------------------------------

/** 렌즈 높이(cm). 가장 높은 줄기가 렌즈를 지나는 높이보다 넉넉하다. */
export const LENS_SIZE = 2.2;
/** 눈알 반지름(cm). */
export const EYE_RADIUS = 1.0;
/** 동공 표시(세로 막대)의 너비(cm). */
export const PUPIL_BAR_WIDTH = 0.16;
/** 아래 줄(맨눈) 광축의 y(cm). 두 줄의 눈알이 겹치지 않게 떨어뜨린다. */
export const NAKED_ROW_Y = -2.8;
/** 맨눈 줄의 거리 치수선이 광축 아래로 내려간 거리(cm). */
export const NAKED_DIM_DROP = 0.7;
/** 시야각 부채꼴의 반지름(cm). 두 줄이 같은 반지름이라 각을 나란히 견준다. */
export const ANGLE_ARC_RADIUS = 6;
/** 위 줄 광축 보조선의 왼쪽 끝(cm). 가장 먼 상보다 조금 더 간다. */
export const AXIS_FROM_X = -22;
/** 초점 점의 반지름(cm). */
export const FOCUS_DOT_RADIUS = 0.12;

/**
 * 프레이밍 — 가로는 맨눈 개미 왼쪽 이름표부터 눈알 오른쪽까지, 세로는 가장 큰 상의 배율
 * 글자부터 아래 줄 눈알 · 치수선과 캡션 한 줄까지. 매 프레임 같은 값이다 (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -27, maxX: 4.2, minY: -5.2, maxY: 4.8 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magnifyingGlassMessages = Object.freeze({
  'label.title': {
    ko: '돋보기',
    en: 'Magnifying glass',
    ja: '虫眼鏡',
    zh: '放大镜',
    ar: 'العدسة المكبِّرة',
    es: 'Lupa',
    fr: 'Loupe',
    hi: 'आवर्धक लेंस',
    id: 'Kaca pembesar',
    pt: 'Lupa',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '초점 안의 물체가 크고 바로 선 허상으로 보이는 것',
    en: 'An object inside the focal point seen as a large, upright virtual image',
    ja: '焦点の内側の物体が、大きく正立した虚像として見えること',
    zh: '焦点以内的物体被看成放大、正立的虚像',
    ar: 'جسم داخل البؤرة يُرى صورةً وهميةً كبيرة معتدلة',
    es: 'Un objeto dentro del foco que se ve como una imagen virtual grande y derecha',
    fr: 'Un objet en deçà du foyer vu comme une image virtuelle grande et droite',
    hi: 'फोकस के भीतर रखी वस्तु, जो बड़े और सीधे आभासी प्रतिबिंब के रूप में दिखती है',
    id: 'Benda di dalam titik fokus yang terlihat sebagai bayangan maya yang besar dan tegak',
    pt: 'Um objeto dentro do foco visto como uma imagem virtual grande e direita',
  },
  'label.stage': {
    ko: '돋보기와 맨눈',
    en: 'Magnifying glass and naked eye',
    ja: '虫眼鏡と肉眼',
    zh: '放大镜与肉眼',
    ar: 'العدسة المكبِّرة والعين المجردة',
    es: 'La lupa y el ojo desnudo',
    fr: 'La loupe et l’œil nu',
    hi: 'आवर्धक लेंस और नग्न आँख',
    id: 'Kaca pembesar dan mata telanjang',
    pt: 'A lupa e o olho nu',
  },
  'label.view': {
    ko: '개미 · 렌즈 · 눈',
    en: 'Ant, lens, eye',
    ja: 'アリ・レンズ・目',
    zh: '蚂蚁、透镜、眼睛',
    ar: 'النملة، العدسة، العين',
    es: 'Hormiga, lente, ojo',
    fr: 'Fourmi, lentille, œil',
    hi: 'चींटी, लेंस, आँख',
    id: 'Semut, lensa, mata',
    pt: 'Formiga, lente, olho',
  },

  /** 도식 이름표. */
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
  'label.naked': {
    ko: '맨눈',
    en: 'naked eye',
    ja: '肉眼',
    zh: '肉眼',
    ar: 'العين المجردة',
    es: 'ojo desnudo',
    fr: 'œil nu',
    hi: 'नग्न आँख',
    id: 'mata telanjang',
    pt: 'olho nu',
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
  /** 배율 글자. 값은 선언한 정박값이다. */
  'label.magnification': {
    ko: '×{m}',
    en: '×{m}',
    ja: '×{m}',
    zh: '×{m}',
    ar: '×{m}',
    es: '×{m}',
    fr: '×{m}',
    hi: '×{m}',
    id: '×{m}',
    pt: '×{m}',
  },
  /** 맨눈 거리 치수. 값은 선언한 거리다. */
  'label.distance': {
    ko: '{d} cm',
    en: '{d} cm',
    ja: '{d} cm',
    zh: '{d} cm',
    ar: '{d} cm',
    es: '{d} cm',
    fr: '{d} cm',
    hi: '{d} cm',
    id: '{d} cm',
    pt: '{d} cm',
  },

  'caption.emit': {
    ko: '개미를 초점 F 안에 두었다 — 렌즈를 지난 빛이 벌어진 채 눈으로 들어온다.',
    en: 'The ant sits inside the focal point F — light leaves the lens still spreading and enters the eye.',
    ja: 'アリは焦点 F の内側にある — レンズを出た光は広がったまま目に入る。',
    zh: '蚂蚁位于焦点 F 以内——光离开透镜后仍在发散，进入眼睛。',
    ar: 'النملة داخل البؤرة F — يغادر الضوء العدسة وهو ما زال منفرجًا ويدخل العين.',
    es: 'La hormiga está dentro del foco F — la luz sale de la lente todavía divergente y entra en el ojo.',
    fr: 'La fourmi est en deçà du foyer F — la lumière quitte la lentille encore divergente et entre dans l’œil.',
    hi: 'चींटी फोकस F के भीतर है — प्रकाश लेंस से निकलकर अब भी फैलता हुआ आँख में प्रवेश करता है।',
    id: 'Semut berada di dalam titik fokus F — cahaya keluar dari lensa masih menyebar dan masuk ke mata.',
    pt: 'A formiga está dentro do foco F — a luz sai da lente ainda divergindo e entra no olho.',
  },
  'caption.traceBack': {
    ko: '눈에 들어온 줄기를 렌즈 앞쪽으로 거꾸로 이어 본다.',
    en: 'Extend the beams that entered the eye backward, in front of the lens.',
    ja: '目に入った光束をレンズの手前へ逆向きに延ばしてみる。',
    zh: '把进入眼睛的光束向透镜前方反向延长。',
    ar: 'نمدّ الحزم التي دخلت العين إلى الوراء، أمام العدسة.',
    es: 'Se prolongan hacia atrás, delante de la lente, los haces que entraron en el ojo.',
    fr: 'On prolonge vers l’arrière, devant la lentille, les faisceaux entrés dans l’œil.',
    hi: 'आँख में आए किरण-पुंजों को लेंस के सामने की ओर पीछे बढ़ाकर देखते हैं।',
    id: 'Berkas yang masuk ke mata diperpanjang ke belakang, di depan lensa.',
    pt: 'Prolongam-se para trás, diante da lente, os feixes que entraram no olho.',
  },
  'caption.near': {
    ko: '점선이 개미 뒤쪽에서 만나 {m1}배 큰 바로 선 상이 선다 — 눈에 드는 각이 맨눈({d} cm)보다 넓다.',
    en: 'The dashed lines meet behind the ant, where an upright image {m1}× larger stands — it fills a wider angle at the eye than the ant at {d} cm.',
    ja: '点線はアリの後ろで交わり、{m1}× 大きい正立像ができる — 目に入る角は {d} cm のアリより広い。',
    zh: '虚线在蚂蚁后方相交，形成一个 {m1}× 大的正立像——它在眼中张开的角比 {d} cm 处的蚂蚁更大。',
    ar: 'تلتقي الخطوط المتقطعة خلف النملة، حيث تقوم صورة معتدلة أكبر بـ {m1}× — وتملأ عند العين زاوية أوسع من النملة على بُعد {d} cm.',
    es: 'Las líneas discontinuas se cortan detrás de la hormiga, donde se forma una imagen derecha {m1}× mayor — ocupa en el ojo un ángulo más amplio que la hormiga a {d} cm.',
    fr: 'Les pointillés se croisent derrière la fourmi, où se dresse une image droite {m1}× plus grande — elle occupe dans l’œil un angle plus large que la fourmi à {d} cm.',
    hi: 'बिंदुकित रेखाएँ चींटी के पीछे मिलती हैं, जहाँ {m1}× बड़ा सीधा प्रतिबिंब बनता है — यह आँख पर {d} cm पर रखी चींटी से चौड़ा कोण घेरता है।',
    id: 'Garis putus-putus bertemu di belakang semut, tempat berdiri bayangan tegak {m1}× lebih besar — sudutnya di mata lebih lebar daripada semut pada {d} cm.',
    pt: 'As linhas tracejadas se encontram atrás da formiga, onde se forma uma imagem direita {m1}× maior — ela ocupa no olho um ângulo mais largo que a formiga a {d} cm.',
  },
  'caption.move': {
    ko: '개미를 F 쪽으로 조금 옮긴다.',
    en: 'The ant moves a little closer to F.',
    ja: 'アリを F の方へ少し近づける。',
    zh: '蚂蚁向 F 稍稍靠近。',
    ar: 'تقترب النملة قليلًا من F.',
    es: 'La hormiga se acerca un poco a F.',
    fr: 'La fourmi se rapproche un peu de F.',
    hi: 'चींटी F के थोड़ा और पास खिसकती है।',
    id: 'Semut bergeser sedikit lebih dekat ke F.',
    pt: 'A formiga se aproxima um pouco de F.',
  },
  'caption.emitAgain': {
    ko: '렌즈를 지난 빛이 이번에도 벌어진 채 눈으로 들어온다.',
    en: 'Again the light leaves the lens spreading and enters the eye.',
    ja: '今度もレンズを出た光は広がったまま目に入る。',
    zh: '这一次，光离开透镜后仍在发散，进入眼睛。',
    ar: 'ومرة أخرى يغادر الضوء العدسة منفرجًا ويدخل العين.',
    es: 'De nuevo la luz sale de la lente divergente y entra en el ojo.',
    fr: 'De nouveau, la lumière quitte la lentille en divergeant et entre dans l’œil.',
    hi: 'फिर से प्रकाश लेंस से निकलकर फैलता हुआ आँख में प्रवेश करता है।',
    id: 'Sekali lagi cahaya keluar dari lensa dalam keadaan menyebar dan masuk ke mata.',
    pt: 'De novo a luz sai da lente divergindo e entra no olho.',
  },
  'caption.far': {
    ko: '상이 {m2}배로 더 크고 더 멀리 선다 — 여전히 맨눈({d} cm)보다 넓은 각으로 눈에 든다.',
    en: 'The image is now {m2}× larger and farther away — it still fills a wider angle at the eye than the ant at {d} cm.',
    ja: '像は {m2}× に大きくなり、さらに遠くにできる — それでも {d} cm のアリより広い角で目に入る。',
    zh: '像变为 {m2}× 大，而且更远——它在眼中张开的角仍比 {d} cm 处的蚂蚁更大。',
    ar: 'أصبحت الصورة الآن أكبر بـ {m2}× وأبعد — وما زالت تملأ عند العين زاوية أوسع من النملة على بُعد {d} cm.',
    es: 'Ahora la imagen es {m2}× mayor y está más lejos — sigue ocupando en el ojo un ángulo más amplio que la hormiga a {d} cm.',
    fr: 'L’image est maintenant {m2}× plus grande et plus éloignée — elle occupe toujours dans l’œil un angle plus large que la fourmi à {d} cm.',
    hi: 'अब प्रतिबिंब {m2}× बड़ा और अधिक दूर है — यह अब भी आँख पर {d} cm पर रखी चींटी से चौड़ा कोण घेरता है।',
    id: 'Kini bayangan {m2}× lebih besar dan lebih jauh — sudutnya di mata tetap lebih lebar daripada semut pada {d} cm.',
    pt: 'Agora a imagem é {m2}× maior e está mais longe — ainda ocupa no olho um ângulo mais largo que a formiga a {d} cm.',
  },
  'caption.return': {
    ko: '개미가 처음 자리로 돌아간다.',
    en: 'The ant goes back to where it started.',
    ja: 'アリが最初の位置に戻る。',
    zh: '蚂蚁回到起始位置。',
    ar: 'تعود النملة إلى موضعها الأول.',
    es: 'La hormiga vuelve a su posición inicial.',
    fr: 'La fourmi revient à sa position de départ.',
    hi: 'चींटी अपनी शुरुआती जगह पर लौटती है।',
    id: 'Semut kembali ke posisi semula.',
    pt: 'A formiga volta à posição inicial.',
  },
} satisfies Record<string, LocalizedText>);

export type MagnifyingGlassMessageKey = keyof typeof magnifyingGlassMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagnifyingGlassMessageKey): LocalizedText => magnifyingGlassMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagnifyingGlassMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magnifyingGlassSchema: BundleSchema = {
  id: MAGNIFYING_GLASS_ID,
  label: text('label.title'),
  category: 'optics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다. 개미를 F 안 두 자리에 두는 것을 자동 진행으로 보인다 (controllers.ts).
  parameters: [],

  stages: [
    {
      id: 'glass-and-naked-eye',
      label: text('label.stage'),
      constants: {
        focalLength: FOCAL_LENGTH,
        antHeight: ANT_HEIGHT,
        nearDistance: NEAR_DISTANCE,
        farDistance: FAR_DISTANCE,
        nearMag: NEAR_MAG,
        farMag: FAR_MAG,
        nakedDistance: NAKED_DISTANCE,
        eyeGap: EYE_GAP,
        pupilHalf: PUPIL_HALF,
        rayCount: RAY_COUNT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'ant-lens-eye', label: text('label.view'), default: true }],

  /** 가로로 넓은 두 줄 그림 — 위는 돋보기, 아래는 맨눈. */
  canvas: { height: 320, minHeight: 280 },

  /**
   * 축 → 시야각 → 렌즈 → 줄기 → 점선 → 개미 · 상 · 눈 → 글자 순. plugin 어휘(`ray` ·
   * `opticalElement`)가 층에서 어디 끼는지에 기대지 않게 scene 순서로 고정한다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = [가까운 자리 0.6f] 줄기가 눈으로 → 거꾸로 잇기 → 허상 · 시야각 → 멈춤 → 걷힘,
   * 개미를 F 쪽으로, [먼 자리 0.8f] 같은 순서, 처음 자리로 돌아감.
   *
   * 줄기 앞머리 · 꼬리의 x 는 `emit-*` · `clear-*` 진행도로, 개미 자리는 `move` · `return`
   * 진행도로, 점선 · 허상 · 시야각의 짙기는 `trace-*` · `mark-*` · `clear-*` 진행도로 읽는다
   * (`physics.ts`). 맨눈 줄은 늘 그대로다.
   */
  timeline: {
    phases: [
      { id: 'emit-near', duration: 1.4, caption: key('caption.emit') },
      { id: 'trace-near', duration: 1.4, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'mark-near', duration: 0.5, ease: 'smooth', caption: key('caption.near') },
      { id: 'hold-near', duration: 3.4, caption: key('caption.near') },
      { id: 'clear-near', duration: 0.7, ease: 'smooth', caption: key('caption.near') },
      { id: 'move', duration: 1.4, ease: 'smooth', caption: key('caption.move') },
      { id: 'emit-far', duration: 1.4, caption: key('caption.emitAgain') },
      { id: 'trace-far', duration: 1.4, ease: 'smooth', caption: key('caption.traceBack') },
      { id: 'mark-far', duration: 0.5, ease: 'smooth', caption: key('caption.far') },
      { id: 'hold-far', duration: 3.4, caption: key('caption.far') },
      { id: 'clear-far', duration: 0.7, ease: 'smooth', caption: key('caption.far') },
      { id: 'return', duration: 1.4, ease: 'smooth', caption: key('caption.return') },
    ],
  },

  /** 도착한 순간 줄기가 눈에 들어와 있고 허상 · 두 시야각이 서 있다 — 가까운 자리 멈춤 안에서 연다 (S-piece). */
  startAt: 3.6,

  /**
   * 슬롯 하나. 그림 아래 가운데. `{m1}` · `{m2}` · `{d}` 는 state 의 글자를 가리킨다(G133 우회,
   * `state.ts`). `vars` 는 state 경로만 가리키므로 멈춤마다 이름을 따로 두어 캡션 틀이 고른다.
   */
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    align: 'center',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0.25,
    vars: { m1: 'nearMag', m2: 'farMag', d: 'nakedDistance' },
  },

  // 그리드 · 카메라 단추 · 범례 · 제목 없음(기본). 잴 것은 두 시야각의 견줌이지 눈금이 아니다.

  messages: magnifyingGlassMessages,
};
