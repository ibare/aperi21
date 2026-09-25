// ========================================================================
// newtons-first-law — 선언
// ========================================================================
// 질문: 급정거한 버스에서 승객을 앞으로 민 것은 무엇인가.
//
// 아무것도 밀지 않았다. 버스만 느려지고 승객은 원래 속도로 그대로 간다.
//
// 원본: tasks/piece-lab/newtons-first-law/ (자유 구현)
//
// ---- 좌표 ----
// 원본은 860 × 280 의 고정 화면 좌표(y 아래)로 그렸다. 여기서는 **월드 1 = 원본
// 100 px** 로 옮기고, **도로 윗면을 y = 0** 으로 삼아 y 를 위로 뒤집는다.
// 배율만 다르고 배치는 그대로라 화면에 나오는 그림이 같다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:newtons-first-law` 와 문자 그대로 일치한다 (C4). */
export const NEWTONS_FIRST_LAW_ID = 'newtons-first-law';

// ------------------------------------------------------------------------
// 원본 배치 (원본 화면 px). 값은 index.html 에서 그대로 옮겼다
// ------------------------------------------------------------------------

export const REF = {
  width: 860,
  height: 280,
  /** 도로 윗면 = 바퀴가 닿는 선. 월드 y = 0 의 자리다. */
  roadY: 212,
  roadH: 18,
  busLen: 280,
  busTop: 82,
  busBottom: 186,
  wheelY: 196,
  wheelR: 16,
  /** 버스 뒤끝에서 지붕 표식까지. */
  markDx: 64,
  /** 버스 뒤끝에서 앞칸 칸막이까지. */
  wallDx: 234,
  riderHalf: 11,
  /** 승객 발이 닿는 버스 안 바닥. */
  riderFoot: 182,
  trailBusY: 64,
  trailRiderY: 112,
  /** 버스 뒤끝의 출발 자리. */
  busStart: 40,
  /** 뒷문 두 줄의 x(버스 뒤끝 기준)와 위 끝 여백. */
  doorDx: [26, 48],
  doorTopInset: 20,
  /** 바퀴 둘의 x(버스 뒤끝 기준). */
  wheelDx: [58, 280 - 58],
} as const;

/** 원본 1 px 이 월드로 얼마인가. */
export const PX = 1 / 100;
/** 원본 px 길이를 월드 길이로. */
export function px(n: number): number {
  return n * PX;
}
/** 원본 화면 y(아래가 +)를 월드 y(위가 +)로. 도로 윗면이 0. */
export function wy(originalY: number): number {
  return px(REF.roadY - originalY);
}

// ------------------------------------------------------------------------
// 물리 — 원본의 px/s 를 월드로 옮긴 것뿐이다
// ------------------------------------------------------------------------

/** 등속 주행 속도. */
export const V0 = px(140);
/** 버스에 걸린 제동 가속도. **버스에만 걸린다.** */
export const A_BRAKE = px(120);
/** 마찰 조작기 최대. 제동(120)보다 크게 잡아, 끝까지 올리면 승객이 버스와 함께 선다. */
export const FRIC_MAX = px(200);
/** 미끄러짐과 함께 감을 가르는 상대속도 문턱. */
export const REL_EPS = px(0.5);
/** 자취를 찍는 간격(초). 42 px 라는 눈에 잡히는 간격이 나오도록 속도와 함께 고른 값이다. */
export const SAMPLE_DT = 0.3;
/** 표본이 같은 자리에 겹쳐 찍히지 않게 하는 최소 이동. */
export const SAMPLE_MOVE = px(1);
/**
 * 자취를 그리지 않는 왼쪽 끝. 원본이 `x < 4` 를 건너뛴 자리다 — 화면 왼쪽 밖으로
 * 나간 자국은 그리지 않는다.
 */
export const LEFT_CUT = px(4);
/** 앞칸에 닿은 표시가 사라지기까지(초). */
export const IMPACT_LIFE = 0.45;

// ------------------------------------------------------------------------
// 연출 시간표 — 단계 길이는 여기 한 곳에서만 센다
// ------------------------------------------------------------------------

/** 급정거 시각(사이클 안). `roll` 단계의 길이이자 physics 의 제동 시작이다. */
export const T_BRAKE = 2.0;
/** 잦아듦이 시작하는 시각. */
export const T_FADE = 7.4;
/** 한 사이클. 단계 길이의 합과 같다. */
export const CYCLE = 8.0;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const newtonsFirstLawMessages = Object.freeze({
  'label.title': {
    ko: '관성 기준계',
    en: 'Inertial frame',
    ja: '慣性系',
    zh: '惯性参考系',
    ar: 'الإطار المرجعي القصوري',
    es: 'Sistema de referencia inercial',
    fr: 'Référentiel inertiel',
    hi: 'जड़त्वीय निर्देश तंत्र',
    id: 'Kerangka acuan inersial',
    pt: 'Referencial inercial',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '알짜힘이 없을 때의 운동 상태',
    en: 'The state of motion when there is no net force',
    ja: '合力がないときの運動の状態',
    zh: '不受合力时的运动状态',
    ar: 'حالة الحركة عند غياب القوة المحصلة',
    es: 'El estado de movimiento cuando no hay fuerza neta',
    fr: 'L’état de mouvement en l’absence de force résultante',
    hi: 'नेट बल न होने पर गति की अवस्था',
    id: 'Keadaan gerak saat tidak ada gaya total',
    pt: 'O estado de movimento quando não há força resultante',
  },
  'label.stage': {
    ko: '도로',
    en: 'Road',
    ja: '道路',
    zh: '道路',
    ar: 'الطريق',
    es: 'Carretera',
    fr: 'Route',
    hi: 'सड़क',
    id: 'Jalan',
    pt: 'Estrada',
  },
  'label.view': {
    ko: '땅에서 본 장면',
    en: 'From the ground',
    ja: '地上から',
    zh: '从地面看',
    ar: 'من الأرض',
    es: 'Desde el suelo',
    fr: 'Depuis le sol',
    hi: 'धरती से',
    id: 'Dari permukaan tanah',
    pt: 'Do chão',
  },

  /** 자취 줄에 붙는 이름. 범례 대신 대상 옆에 붙는다. */
  'label.bus': {
    ko: '버스',
    en: 'bus',
    ja: 'バス',
    zh: '公交车',
    ar: 'الحافلة',
    es: 'autobús',
    fr: 'bus',
    hi: 'बस',
    id: 'bus',
    pt: 'ônibus',
  },
  'label.rider': {
    ko: '승객',
    en: 'passenger',
    ja: '乗客',
    zh: '乘客',
    ar: 'الراكب',
    es: 'pasajero',
    fr: 'passager',
    hi: 'यात्री',
    id: 'penumpang',
    pt: 'passageiro',
  },
  /** 조작기 이름. */
  'label.friction': {
    ko: '승객의 신발과 바닥 사이 마찰',
    en: 'Friction between the passenger’s shoes and the floor',
    ja: '乗客の靴と床の間の摩擦',
    zh: '乘客的鞋与地板之间的摩擦',
    ar: 'الاحتكاك بين حذاء الراكب والأرضية',
    es: 'Rozamiento entre los zapatos del pasajero y el suelo',
    fr: 'Frottement entre les chaussures du passager et le plancher',
    hi: 'यात्री के जूतों और फ़र्श के बीच घर्षण',
    id: 'Gesekan antara sepatu penumpang dan lantai',
    pt: 'Atrito entre os sapatos do passageiro e o piso',
  },

  'caption.rolling': {
    ko: '버스와 승객이 같은 속도로 간다.',
    en: 'The bus and the passenger move at the same speed.',
    ja: 'バスと乗客が同じ速さで進む。',
    zh: '公交车和乘客以相同的速率前进。',
    ar: 'تتحرك الحافلة والراكب بالسرعة نفسها.',
    es: 'El autobús y el pasajero avanzan con la misma rapidez.',
    fr: 'Le bus et le passager avancent à la même vitesse.',
    hi: 'बस और यात्री एक ही चाल से चलते हैं।',
    id: 'Bus dan penumpang bergerak dengan kelajuan yang sama.',
    pt: 'O ônibus e o passageiro andam com a mesma velocidade.',
  },
  'caption.busOnly': {
    ko: '버스만 느려진다. 승객의 자취 간격은 그대로다 — 승객을 민 것은 아무것도 없다.',
    en: 'Only the bus slows. The spacing of the passenger’s trail is unchanged — nothing pushed the passenger.',
    ja: 'バスだけが減速する。乗客の軌跡の間隔は変わらない — 乗客を押したものは何もない。',
    zh: '只有公交车在减速。乘客轨迹的间隔没有变 — 没有任何东西推乘客。',
    ar: 'الحافلة وحدها تتباطأ. تباعد آثار الراكب لم يتغير — لم يدفع الراكبَ شيء.',
    es: 'Solo frena el autobús. La separación del rastro del pasajero no cambia — nada empujó al pasajero.',
    fr: 'Seul le bus ralentit. L’espacement de la trace du passager ne change pas — rien n’a poussé le passager.',
    hi: 'केवल बस धीमी होती है। यात्री के निशानों की दूरी नहीं बदलती — यात्री को किसी ने नहीं धकेला।',
    id: 'Hanya bus yang melambat. Jarak jejak penumpang tidak berubah — tidak ada yang mendorong penumpang.',
    pt: 'Só o ônibus freia. O espaçamento do rastro do passageiro não muda — nada empurrou o passageiro.',
  },
  'caption.grip': {
    ko: '발이 바닥을 붙잡은 만큼만 승객이 느려진다 — 그만큼 자취 간격도 좁아진다.',
    en: 'The passenger slows only as much as the feet grip the floor — and the trail spacing narrows by just that much.',
    ja: '足が床をつかんだ分だけ乗客は減速する — その分だけ軌跡の間隔も狭まる。',
    zh: '脚抓住地板多少，乘客就减速多少 — 轨迹的间隔也相应变窄。',
    ar: 'يتباطأ الراكب بقدر ما تتشبث قدماه بالأرضية فقط — ويضيق تباعد الآثار بالقدر نفسه.',
    es: 'El pasajero frena solo en la medida en que sus pies se agarran al suelo — y la separación del rastro se reduce justo en esa medida.',
    fr: 'Le passager ne ralentit que dans la mesure où ses pieds adhèrent au plancher — et l’espacement de la trace se resserre d’autant.',
    hi: 'पैर जितना फ़र्श को पकड़ते हैं, यात्री उतना ही धीमा होता है — और निशानों की दूरी भी उतनी ही घटती है।',
    id: 'Penumpang melambat hanya sebesar cengkeraman kakinya pada lantai — dan jarak jejaknya menyempit sebesar itu pula.',
    pt: 'O passageiro freia só na medida em que os pés se prendem ao piso — e o espaçamento do rastro diminui na mesma medida.',
  },
  'caption.stopped': {
    ko: '발이 바닥을 붙잡은 만큼 승객도 느려져, 버스와 함께 섰다.',
    en: 'Gripped by the floor, the passenger slowed too and came to rest with the bus.',
    ja: '床に足をつかまれて乗客も減速し、バスといっしょに止まった。',
    zh: '脚被地板抓住，乘客也减速了，和公交车一起停下。',
    ar: 'بفعل تشبث قدميه بالأرضية تباطأ الراكب أيضًا وتوقف مع الحافلة.',
    es: 'Sujeto por el suelo, el pasajero también frenó y se detuvo junto con el autobús.',
    fr: 'Retenu par le plancher, le passager a ralenti lui aussi et s’est arrêté avec le bus.',
    hi: 'फ़र्श की पकड़ से यात्री भी धीमा हुआ और बस के साथ रुक गया।',
    id: 'Tertahan oleh lantai, penumpang ikut melambat dan berhenti bersama bus.',
    pt: 'Preso pelo piso, o passageiro também freou e parou junto com o ônibus.',
  },
  'caption.contact': {
    ko: '앞칸에 닿고서야 승객에게 처음으로 힘이 걸린다. 그 전까지 승객은 원래 속도로 그냥 가고 있었다.',
    en: 'Only on reaching the partition does a force finally act on the passenger. Until then the passenger simply kept going at the original speed.',
    ja: '前の仕切りに達して初めて、乗客に力がはたらく。それまで乗客は元の速さのまま進んでいただけだ。',
    zh: '直到碰到前方的隔板，乘客才第一次受到力。在那之前，乘客只是以原来的速率继续前进。',
    ar: 'لا تؤثر قوة في الراكب لأول مرة إلا عند وصوله إلى الحاجز. وحتى ذلك الحين كان الراكب يواصل حركته بسرعته الأصلية فحسب.',
    es: 'Solo al llegar a la mampara actúa por fin una fuerza sobre el pasajero. Hasta entonces, el pasajero simplemente siguió con su rapidez original.',
    fr: 'Ce n’est qu’en atteignant la cloison qu’une force s’exerce enfin sur le passager. Jusque-là, le passager continuait simplement à sa vitesse initiale.',
    hi: 'विभाजक तक पहुँचने पर ही यात्री पर पहली बार कोई बल लगता है। तब तक यात्री बस अपनी मूल चाल से चलता जा रहा था।',
    id: 'Baru saat mencapai sekat, sebuah gaya akhirnya bekerja pada penumpang. Sampai saat itu penumpang hanya terus melaju dengan kelajuan semula.',
    pt: 'Só ao chegar à divisória uma força finalmente age sobre o passageiro. Até então, o passageiro simplesmente seguia com a velocidade original.',
  },
} satisfies Record<string, LocalizedText>);

export type NewtonsFirstLawMessageKey = keyof typeof newtonsFirstLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: NewtonsFirstLawMessageKey): LocalizedText {
  return newtonsFirstLawMessages[key];
}

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NewtonsFirstLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const newtonsFirstLawSchema: BundleSchema = {
  id: NEWTONS_FIRST_LAW_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'linear',

  /** 조작기는 하나뿐이고 그것은 `controllers` 의 슬라이더다. 파라미터 패널을 띄우지 않는다. */
  parameters: [],

  stages: [{ id: 'road', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'ground', label: text('label.view'), default: true }],

  /** 원본 캔버스는 860 × 280 한 장이고 캡션까지 그 안에 있었다. 러너의 사방 여백만큼 더 잡는다. */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 한 사이클 8 s — 등속(roll) → 급정거 뒤(brake) → 잦아듦(fade).
   *
   * 원본이 코드에 흩어 두었던 `BRAKE_T` · `FADE_T` · `CYCLE` 이 이 셋이다. scene 은
   * `at('fade')` 로 잦아듦의 진행도만 읽는다 — 경계를 상수로 두고 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'roll', duration: T_BRAKE, caption: key('caption.rolling') },
      { id: 'brake', duration: T_FADE - T_BRAKE, caption: key('caption.busOnly') },
      // 잦아드는 동안에도 하던 말을 이어 한다 — 같은 키라 다시 페이드하지 않는다.
      { id: 'fade', duration: CYCLE - T_FADE, caption: key('caption.busOnly') },
    ],
  },

  /**
   * 슬롯 하나. 시각으로 갈리는 두 문장(등속 · 버스만 느려짐)은 단계가 말하고,
   * **상태로 갈리는 셋**은 `cases` 가 말한다 — 앞칸에 닿았는가 · 함께 섰는가 ·
   * 발이 붙잡고 있는가는 시각이 아니라 마찰 조작기와 접촉이 정하기 때문이다.
   *
   * 위에서부터 훑어 참인 첫 항목이 이긴다. 순서는 원본 `captionText()` 의 if 사슬
   * 그대로다. 조건을 계산하는 것은 `physics.ts` 이고 여기는 그 결과가 놓인 자리만
   * 가리킨다 (원칙 2).
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 14,
    cases: [
      { when: 'hitWall', text: key('caption.contact') },
      { when: 'stoppedTogether', text: key('caption.stopped') },
      { when: 'gripping', text: key('caption.grip') },
    ],
  },

  /**
   * 원본이 그린 순서 그대로 겹친다. 기본 층으로는 매질(`region` 45)이 물체(`body` 40)
   * 위에 와서 **도로가 버스를 덮는다** — 이 그림에서 `region` 은 물이 아니라 도로와
   * 차체라 그 관계가 뒤집혀 있다.
   */
  drawOrder: 'scene',

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 땅에 고정된 기준은 **움직이지 않는 도로
   * 점선 하나로 충분하다** — 좌표축이나 격자를 두면 잴 것이 거리인 것처럼 읽힌다.
   * 카메라를 주면 독자가 프레임을 옮겨 "카메라가 땅에 붙어 있다" 는 이 조각의
   * 전부를 흔들 수 있다.
   */

  messages: newtonsFirstLawMessages,
};
