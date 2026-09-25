// ========================================================================
// field-of-dipole — 선언
// ========================================================================
// 질문: 가까이 붙은 +q · −q 한 쌍(쌍극자)의 전기장은 전하 하나의 장과 어떻게 다른가.
//
// 두 가지를 차례로 본다.
//   1. 모양 — 두 전하 사이의 선은 촘촘히 모여 거의 곧게 건너가고, 바깥의 선은 크게
//      휘어 돌아 반대편 전하로 들어간다. 같은 그림에서 사이 선 · 바깥 선을 번갈아 짙게 한다.
//   2. 멀어질 때 — 축을 따라 멀어지며 전하 하나의 장과 쌍극자의 장을 같은 세기에서
//      출발시켜 견준다. 쌍극자 쪽 곡선이 훨씬 빨리 바닥으로 떨어진다.
//
// 이웃 `field-lines` 가 끌 수 있는 +·− 선 그림을 이미 갖고 있다 — 여기서는 끌기를
// 되풀이하지 않고 전하는 제자리에 둔다. 식은 쓰지 않는다 — 문단의 몫이다.
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:field-of-dipole` 와 문자 그대로 일치한다 (C4). */
export const FIELD_OF_DIPOLE_ID = 'field-of-dipole';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// 코드는 `physics.readConstants` 로 이 기본값과 함께 읽는다.
// ------------------------------------------------------------------------

/** 두 전하 사이 거리 d(월드). +q 는 x = −d/2, −q 는 x = +d/2 에 놓인다. */
export const SEPARATION = 1.6;
/** 전하의 크기(두 전하 같은 크기, 부호만 반대). 곡선은 같은 세기로 맞추므로 모양에만 쓰인다. */
export const CHARGE = 1;
/** +q 둘레에서 고른 각으로 내보내는 전기력선 가닥 수. */
export const LINE_COUNT = 24;
/** 전기력선 추적 한 걸음(월드). */
export const TRACE_STEP = 0.01;
/**
 * 「사이 선」 판정 폭(월드). 선이 축에서 가장 멀리 벗어난 거리가 이 값 이하이면 두 전하
 * 사이를 건너는 선으로 친다. 그보다 멀리 부푸는 선은 「바깥 선」 이다.
 */
export const INNER_REACH = 0.45;
/** 견주기 출발 거리 r(월드, 쌍극자 가운데에서 축을 따라). 두 장을 여기서 같은 세기로 맞춘다. */
export const PROBE_START = 2;
/** 탐침이 나가는 가장 먼 거리의 배수 — r 의 몇 배까지 가는가. */
export const PROBE_REACH = 3;

// ------------------------------------------------------------------------
// 판 배치 — 고정값 (원칙 6 · S-piece)
// ------------------------------------------------------------------------

/** 전기력선 판 — 선을 긋는 사각형. 캡션 줄 위에서 끊는다. */
export const FIELD_CLIP = { min: [-2.45, -1.72], max: [2.45, 1.72] } as const;
/** 전기력선 추적을 멈추는 사각형. 바깥 선이 크게 돌아 들어오도록 긋는 사각형보다 넓다. */
export const TRACE_BOX = { minX: -9, maxX: 9, minY: -9, maxY: 9 } as const;
/**
 * 견주기 판 — 가로축 왼쪽 끝(x0) · 바닥(y0) · 가로 길이 · 세기 1 의 높이(월드).
 * 가로축 왼쪽 끝이 거리 r, 오른쪽 끝이 (배수)·r 이다.
 */
export const GRAPH = { x0: 3.5, y0: -1.35, width: 5.4, top: 2.4 } as const;
/** 세로축 윗끝 — 세기 1 보다 조금 위(월드). */
export const GRAPH_AXIS_TOP = 3.0;

/** 두 판과 아래 캡션 줄이 들어가는 고정 경계. 매 프레임 같은 값이다. */
export const SCENE_BOUNDS = { minX: -2.55, maxX: 9.95, minY: -2.35, maxY: 1.85 } as const;

/** 캡션 글자 크기 · 줄바꿈 폭 · 바닥에서 띄움(화면 px), 페이드(초). */
export const CAPTION_PX = 13;
export const CAPTION_WRAP_PX = 760;
export const CAPTION_LIFT_PX = -4;
export const CAPTION_FADE_S = 0.25;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 사이 선이 짙다. */
export const BETWEEN_S = 3.4;
/** 사이 선이 옅어지고 바깥 선이 짙어진다. */
export const TO_OUTSIDE_S = 0.6;
/** 바깥 선이 짙다. */
export const OUTSIDE_S = 3.4;
/** 선이 모두 짙어지고, 견주기 판의 출발점에 두 탐침이 나타난다. */
export const ALIGN_S = 1.8;
/** 탐침이 축을 따라 멀어지며 두 곡선이 자란다. */
export const WALK_S = 4.4;
/** 다 자란 두 곡선. */
export const HOLD_S = 3.6;
/** 곡선이 흐려지고 바깥 선이 다시 옅어진다. */
export const RESET_S = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fieldOfDipoleMessages = Object.freeze({
  'label.title': {
    ko: '쌍극자의 전기장',
    en: 'Electric field of a dipole',
    ja: '双極子の電場',
    zh: '偶极子的电场',
    ar: 'المجال الكهربائي لثنائي القطب',
    es: 'Campo eléctrico de un dipolo',
    fr: 'Champ électrique d’un dipôle',
    hi: 'द्विध्रुव का विद्युत क्षेत्र',
    id: 'Medan listrik dipol',
    pt: 'Campo elétrico de um dipolo',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '가까운 두 반대 전하',
    en: 'Two nearby opposite charges',
    ja: '近くにある二つの反対符号の電荷',
    zh: '两个相邻的异号电荷',
    ar: 'شحنتان متعاكستان متقاربتان',
    es: 'Dos cargas opuestas cercanas',
    fr: 'Deux charges opposées proches',
    hi: 'दो पास-पास के विपरीत आवेश',
    id: 'Dua muatan berlawanan yang berdekatan',
    pt: 'Duas cargas opostas próximas',
  },
  'label.stage': {
    ko: '쌍극자 하나',
    en: 'One dipole',
    ja: '双極子一つ',
    zh: '一个偶极子',
    ar: 'ثنائي قطب واحد',
    es: 'Un dipolo',
    fr: 'Un dipôle',
    hi: 'एक द्विध्रुव',
    id: 'Satu dipol',
    pt: 'Um dipolo',
  },
  'label.view': {
    ko: '선 모양과 멀어질 때의 세기',
    en: 'Line shape and strength with distance',
    ja: '線の形と、離れたときの強さ',
    zh: '线的形状与随距离变化的强度',
    ar: 'شكل الخطوط والشدة مع المسافة',
    es: 'Forma de las líneas e intensidad con la distancia',
    fr: 'Forme des lignes et intensité selon la distance',
    hi: 'रेखाओं का आकार और दूरी के साथ तीव्रता',
    id: 'Bentuk garis dan kuat medan terhadap jarak',
    pt: 'Forma das linhas e intensidade com a distância',
  },
  'mark.plus': {
    ko: '+',
    en: '+',
    ja: '+',
    zh: '+',
    ar: '+',
    es: '+',
    fr: '+',
    hi: '+',
    id: '+',
    pt: '+',
  },
  'mark.minus': {
    ko: '−',
    en: '−',
    ja: '−',
    zh: '−',
    ar: '−',
    es: '−',
    fr: '−',
    hi: '−',
    id: '−',
    pt: '−',
  },
  'mark.r': {
    ko: 'r',
    en: 'r',
    ja: 'r',
    zh: 'r',
    ar: 'r',
    es: 'r',
    fr: 'r',
    hi: 'r',
    id: 'r',
    pt: 'r',
  },
  'mark.nr': {
    ko: '{n}r',
    en: '{n}r',
    ja: '{n}r',
    zh: '{n}r',
    ar: '{n}r',
    es: '{n}r',
    fr: '{n}r',
    hi: '{n}r',
    id: '{n}r',
    pt: '{n}r',
  },
  'label.single': {
    ko: '전하 하나',
    en: 'one charge',
    ja: '電荷一つ',
    zh: '单个电荷',
    ar: 'شحنة واحدة',
    es: 'una carga',
    fr: 'une charge',
    hi: 'एक आवेश',
    id: 'satu muatan',
    pt: 'uma carga',
  },
  'label.dipole': {
    ko: '쌍극자',
    en: 'dipole',
    ja: '双極子',
    zh: '偶极子',
    ar: 'ثنائي القطب',
    es: 'dipolo',
    fr: 'dipôle',
    hi: 'द्विध्रुव',
    id: 'dipol',
    pt: 'dipolo',
  },
  'label.strength': {
    ko: '장의 세기',
    en: 'field strength',
    ja: '電場の強さ',
    zh: '场强',
    ar: 'شدة المجال',
    es: 'intensidad del campo',
    fr: 'intensité du champ',
    hi: 'क्षेत्र की तीव्रता',
    id: 'kuat medan',
    pt: 'intensidade do campo',
  },
  'label.distance': {
    ko: '축을 따라 잰 거리',
    en: 'distance along the axis',
    ja: '軸に沿った距離',
    zh: '沿轴的距离',
    ar: 'المسافة على امتداد المحور',
    es: 'distancia a lo largo del eje',
    fr: 'distance le long de l’axe',
    hi: 'अक्ष के अनुदिश दूरी',
    id: 'jarak sepanjang sumbu',
    pt: 'distância ao longo do eixo',
  },
  'caption.between': {
    ko: '두 전하 사이 — 선이 촘촘히 모여 거의 곧게 건너간다',
    en: 'Between the two charges the lines crowd close and cross almost straight',
    ja: '二つの電荷の間では、線が密に集まり、ほぼまっすぐに渡る',
    zh: '在两个电荷之间，线密集地聚在一起，几乎笔直地穿过',
    ar: 'بين الشحنتين تتزاحم الخطوط وتعبر في خط شبه مستقيم',
    es: 'Entre las dos cargas, las líneas se apiñan y cruzan casi rectas',
    fr: 'Entre les deux charges, les lignes se resserrent et traversent presque en ligne droite',
    hi: 'दोनों आवेशों के बीच रेखाएँ घनी होकर लगभग सीधी पार जाती हैं',
    id: 'Di antara kedua muatan, garis-garis merapat dan menyeberang hampir lurus',
    pt: 'Entre as duas cargas, as linhas se aglomeram e atravessam quase retas',
  },
  'caption.outside': {
    ko: '바깥 — 선이 크게 휘어 돌아 반대편 전하로 들어간다',
    en: 'Outside, the lines bow out wide and curve back into the other charge',
    ja: '外側では、線が大きく張り出して曲がり、反対側の電荷に戻って入る',
    zh: '在外侧，线向外大幅弯出，再绕回另一个电荷',
    ar: 'في الخارج تنحني الخطوط بعيدًا ثم تلتف عائدةً إلى الشحنة الأخرى',
    es: 'Por fuera, las líneas se abren mucho y se curvan de vuelta hacia la otra carga',
    fr: 'À l’extérieur, les lignes s’arrondissent largement et reviennent vers l’autre charge',
    hi: 'बाहर की ओर रेखाएँ चौड़ा चाप बनाकर मुड़ती हैं और दूसरे आवेश में लौट जाती हैं',
    id: 'Di luar, garis-garis melengkung lebar lalu berbelok kembali masuk ke muatan yang lain',
    pt: 'Por fora, as linhas se abrem em arco largo e se curvam de volta para a outra carga',
  },
  'caption.align': {
    ko: '축 위 거리 r 에서 전하 하나의 장과 쌍극자의 장을 같은 세기로 맞춘다',
    en: 'At distance r on the axis, start a single charge’s field and the dipole’s field at the same strength',
    ja: '軸上の距離 r で、電荷一つの電場と双極子の電場を同じ強さからそろえる',
    zh: '在轴上距离 r 处，让单个电荷的电场与偶极子的电场从同一强度开始',
    ar: 'عند المسافة r على المحور، يبدأ مجال الشحنة الواحدة ومجال ثنائي القطب بالشدة نفسها',
    es: 'A la distancia r sobre el eje, el campo de una sola carga y el del dipolo parten con la misma intensidad',
    fr: 'À la distance r sur l’axe, le champ d’une charge seule et celui du dipôle partent de la même intensité',
    hi: 'अक्ष पर दूरी r पर, एक आवेश का क्षेत्र और द्विध्रुव का क्षेत्र एक ही तीव्रता से शुरू किए जाते हैं',
    id: 'Pada jarak r di sumbu, medan satu muatan dan medan dipol dimulai dengan kuat yang sama',
    pt: 'Na distância r sobre o eixo, o campo de uma carga única e o do dipolo partem da mesma intensidade',
  },
  'caption.walk': {
    ko: '축을 따라 멀어지면 둘 다 약해지지만, 점선(쌍극자)이 훨씬 빨리 떨어진다',
    en: 'Moving out along the axis both weaken, but the dashed dipole curve drops much faster',
    ja: '軸に沿って離れると両方とも弱まるが、点線(双極子)の曲線のほうがずっと速く下がる',
    zh: '沿轴向外移动，两者都减弱，但虚线（偶极子）曲线下降得快得多',
    ar: 'بالابتعاد على امتداد المحور يضعف كلاهما، لكن المنحنى المتقطع (ثنائي القطب) ينخفض أسرع بكثير',
    es: 'Al alejarse a lo largo del eje ambos se debilitan, pero la curva discontinua del dipolo cae mucho más rápido',
    fr: 'En s’éloignant le long de l’axe, les deux faiblissent, mais la courbe en pointillés du dipôle chute bien plus vite',
    hi: 'अक्ष के साथ दूर जाने पर दोनों कमज़ोर होते हैं, पर द्विध्रुव का बिंदुकित वक्र कहीं तेज़ी से गिरता है',
    id: 'Menjauh sepanjang sumbu, keduanya melemah, tetapi kurva putus-putus dipol turun jauh lebih cepat',
    pt: 'Afastando-se ao longo do eixo, ambos enfraquecem, mas a curva tracejada do dipolo cai muito mais rápido',
  },
  'caption.hold': {
    ko: '{n}배 멀어진 곳 — 쌍극자의 장은 바닥에 거의 붙었고 전하 하나의 장은 아직 남아 있다',
    en: '{n} times farther out — the dipole’s field has all but vanished; the single charge’s field is still there',
    ja: '{n} 倍離れたところ — 双極子の電場はほぼ消えたが、電荷一つの電場はまだ残っている',
    zh: '远了 {n} 倍的地方 — 偶极子的电场几乎消失，单个电荷的电场仍然存在',
    ar: 'على بُعد {n} أضعاف — كاد مجال ثنائي القطب يتلاشى، بينما لا يزال مجال الشحنة الواحدة قائمًا',
    es: '{n} veces más lejos — el campo del dipolo casi ha desaparecido; el de la carga única sigue ahí',
    fr: '{n} fois plus loin — le champ du dipôle a presque disparu ; celui de la charge seule est toujours là',
    hi: '{n} गुना दूर — द्विध्रुव का क्षेत्र लगभग मिट चुका है; एक आवेश का क्षेत्र अब भी मौजूद है',
    id: '{n} kali lebih jauh — medan dipol nyaris lenyap; medan satu muatan masih ada',
    pt: '{n} vezes mais longe — o campo do dipolo quase sumiu; o da carga única ainda está lá',
  },
} satisfies Record<string, LocalizedText>);

export type FieldOfDipoleMessageKey = keyof typeof fieldOfDipoleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FieldOfDipoleMessageKey): LocalizedText => fieldOfDipoleMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FieldOfDipoleMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fieldOfDipoleSchema: BundleSchema = {
  id: FIELD_OF_DIPOLE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 전하를 끄는 그림은 이웃 `field-lines` 의 몫이다.
  parameters: [],

  stages: [
    {
      id: 'dipole',
      label: text('label.stage'),
      constants: {
        separation: SEPARATION,
        charge: CHARGE,
        lineCount: LINE_COUNT,
        traceStep: TRACE_STEP,
        innerReach: INNER_REACH,
        probeStart: PROBE_START,
        probeReach: PROBE_REACH,
      },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 너비 · 높이 비가 약 3 : 1 인 두 판 + 캡션 줄. 마운트 후 바뀌지 않는다 (원칙 6). */
  canvas: { height: 340, minHeight: 300 },

  /**
   * 한 주기 = 사이 선 → (전환) → 바깥 선 → 맞추기 → 멀어지기 → 머묾 → 되돌리기.
   * 짙기 전환은 짧은 단계로 선언하고 scene 이 `at()` 으로 읽는다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'between', duration: BETWEEN_S, caption: key('caption.between') },
      { id: 'toOutside', duration: TO_OUTSIDE_S, ease: 'smooth', caption: key('caption.outside') },
      { id: 'outside', duration: OUTSIDE_S, caption: key('caption.outside') },
      { id: 'align', duration: ALIGN_S, ease: 'smooth', caption: key('caption.align') },
      { id: 'walk', duration: WALK_S, ease: 'smooth', caption: key('caption.walk') },
      { id: 'hold', duration: HOLD_S, caption: key('caption.hold') },
      { id: 'reset', duration: RESET_S, ease: 'smooth', caption: key('caption.between') },
    ],
  },

  /** 그리는 순서가 곧 겹침이다 — 선 → 전하(선 끝을 덮는다) → 부호 → 견주기 판. */
  drawOrder: 'scene',

  /** 도착한 순간 이미 사이 선이 짙게 서 있다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, CAPTION_LIFT_PX] },
    fontSize: CAPTION_PX,
    wrapWidth: CAPTION_WRAP_PX,
    fade: CAPTION_FADE_S,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 배수는 스테이지 상수의 글자다 (state.ts, G133 우회).
    vars: { n: 'reachText' },
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 선 모양과 곡선의 떨어짐이다.

  messages: fieldOfDipoleMessages,
};
