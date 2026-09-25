// ========================================================================
// twin-paradox — 선언
// ========================================================================
// 질문: 서로 상대가 느리게 늙는다면서, 다시 만나면 왜 한쪽만 덜 늙어 있는가?
//
// 시공간 도표(시간 ↑ · 공간 →)에 두 세계선을 둔다. 지구에 남은 쌍둥이는 곧은 세계선,
// 0.6c 로 6 광년을 갔다 돌아온 쌍둥이는 꺾인 세계선이다. 두 선 위에 한 해마다 점이
// 찍힌다 — 다시 만난 자리에서 곧은 선은 20 개, 꺾인 선은 16 개다. 꺾인 선이 도표에서
// 더 길어 보여도 제 시간(고유 시간)은 더 짧다.
//
// 비대칭은 **돌아서는 쪽만 틀을 바꾸는 데서** 온다. 여행자의 「지금」 선(동시선)이
// 가는 길에는 한쪽으로, 오는 길에는 다른 쪽으로 기운다 — 돌아서는 순간 그 선이 휙
// 돌아 지구 세계선의 한 토막을 건너뛴다. 지구 쌍둥이의 「지금」 은 늘 가로라 건너뛰는
// 토막이 없다.
//
// 이웃과 겹치지 않게 — 동시선이 세계선을 따라 기운다는 것은 `spacetime-diagram`,
// 지나가는 시계가 느리다(5 대 3)는 것은 `time-dilation`, 느려지는 까닭(빛의 비스듬한
// 길)은 `light-clock` 의 몫이다. 여기서 일어나는 것은 「두 세계선의 눈금 수가 갈린다」
// 와 「돌아설 때 지금 선이 건너뛴다」 둘이 한 문장을 이루는 것이다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:twin-paradox` 와 문자 그대로 일치한다 (C4). */
export const TWIN_PARADOX_ID = 'twin-paradox';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 월드 단위: 가로 광년, 세로 년(ct). 빛의 세계선이 45° 다.
// ------------------------------------------------------------------------

/** 여행자의 속력 v/c. γ = 1/√(1−β²) = 1.25 가 되는 값이다. */
export const BETA = 0.6;
/** 돌아서는 곳까지의 거리(광년, 지구 틀). 지구 틀에서 가는 데 거리/β = 10 년, 왕복 20 년이다. */
export const DISTANCE = 6;
/** 세계선 위 점 하나가 뜻하는 제 시간(년). 한 해마다 한 점. */
export const TICK_YEARS = 1;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초). 화면 속 시간(년)과 초의 대응은 physics 가 단계 진행도로 잇는다.
// ------------------------------------------------------------------------

/** 여행자가 떠나 돌아서는 곳에 닿기까지. 지구 틀 0 → 10 년. */
export const OUT = 4.2;
/** 여행자가 돌아서며 틀을 바꾸는 동안. 화면 속 시간은 멈추고 「지금」 선만 돈다. */
export const TURN = 1.8;
/** 돌아오는 길. 지구 틀 10 → 20 년. 가는 길과 같은 빠르기로 흐르도록 `OUT` 과 같게 둔다(G129). */
export const BACK = OUT;
/** 다시 만나 두 햇수가 굵어지는 동안. */
export const MEET = 0.6;
/** 두 세계선과 햇수를 읽는 동안. */
export const HOLD = 2.8;
/** 기록이 흐려지며 다음 주기로 넘어가는 동안. */
export const FADE = 0.7;

// ------------------------------------------------------------------------
// 배치 — 월드.
// ------------------------------------------------------------------------

/**
 * 프레이밍은 주장의 일부다. 세로는 출발 이름표 아래(캡션 줄 포함)부터 재회 이름표 위까지,
 * 가로는 지구 쪽 햇수 글자부터 돌아서는 곳 오른쪽 햇수 글자까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -6, maxX: 12, minY: -2.4, maxY: 21.2 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const twinParadoxMessages = Object.freeze({
  'label.title': {
    ko: '쌍둥이 역설',
    en: 'Twin paradox',
    ja: '双子のパラドックス',
    zh: '双生子佯谬',
    ar: 'مفارقة التوأم',
    es: 'Paradoja de los gemelos',
    fr: 'Paradoxe des jumeaux',
    hi: 'जुड़वाँ विरोधाभास',
    id: 'Paradoks kembar',
    pt: 'Paradoxo dos gêmeos',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '비대칭을 만드는 돌아섬',
    en: 'The turnaround that makes the asymmetry',
    ja: '非対称をつくる折り返し',
    zh: '造成不对称的掉头',
    ar: 'الاستدارة التي تصنع عدم التماثل',
    es: 'La media vuelta que crea la asimetría',
    fr: 'Le demi-tour qui crée l’asymétrie',
    hi: 'वह वापसी जो असममिति पैदा करती है',
    id: 'Putar balik yang menciptakan ketidaksimetrisan',
    pt: 'A inversão de marcha que cria a assimetria',
  },
  'label.stage': {
    ko: '0.6c 로 6 광년 왕복',
    en: 'A round trip of 6 light-years at 0.6c',
    ja: '0.6c で6光年を往復',
    zh: '以 0.6c 往返 6 光年',
    ar: 'رحلة ذهاب وإياب لمسافة 6 سنوات ضوئية بسرعة 0.6c',
    es: 'Un viaje de ida y vuelta de 6 años luz a 0.6c',
    fr: 'Un aller-retour de 6 années-lumière à 0.6c',
    hi: '0.6c से 6 प्रकाश-वर्ष की आने-जाने की यात्रा',
    id: 'Perjalanan pulang-pergi 6 tahun cahaya pada 0.6c',
    pt: 'Uma viagem de ida e volta de 6 anos-luz a 0.6c',
  },
  'label.view': {
    ko: '지구 틀의 시공간 도표',
    en: 'Spacetime diagram in Earth’s frame',
    ja: '地球の座標系での時空図',
    zh: '地球参考系中的时空图',
    ar: 'مخطط الزمكان في إطار الأرض',
    es: 'Diagrama espaciotemporal en el sistema de referencia de la Tierra',
    fr: 'Diagramme d’espace-temps dans le référentiel de la Terre',
    hi: 'पृथ्वी के निर्देश तंत्र में दिक्काल आरेख',
    id: 'Diagram ruang-waktu dalam kerangka acuan Bumi',
    pt: 'Diagrama de espaço-tempo no referencial da Terra',
  },
  /** 머리 옆에서 센 햇수 — 지나온 해마다의 점을 센 정수다. */
  'label.earthAge': {
    ko: '지구 {n}년',
    en: 'Earth {n} yr',
    ja: '地球 {n}年',
    zh: '地球 {n} 年',
    ar: 'الأرض {n} سنة',
    es: 'Tierra {n} años',
    fr: 'Terre {n} ans',
    hi: 'पृथ्वी {n} वर्ष',
    id: 'Bumi {n} thn',
    pt: 'Terra {n} anos',
  },
  'label.travelerAge': {
    ko: '여행자 {n}년',
    en: 'Traveler {n} yr',
    ja: '旅行者 {n}年',
    zh: '旅行者 {n} 年',
    ar: 'المسافر {n} سنة',
    es: 'Viajero {n} años',
    fr: 'Voyageur {n} ans',
    hi: 'यात्री {n} वर्ष',
    id: 'Pelancong {n} thn',
    pt: 'Viajante {n} anos',
  },
  /** 여행자의 속력과 방향. */
  'label.speedOut': {
    ko: '{beta}c →',
    en: '{beta}c →',
    ja: '{beta}c →',
    zh: '{beta}c →',
    ar: '{beta}c →',
    es: '{beta}c →',
    fr: '{beta}c →',
    hi: '{beta}c →',
    id: '{beta}c →',
    pt: '{beta}c →',
  },
  'label.speedBack': {
    ko: '← {beta}c',
    en: '← {beta}c',
    ja: '← {beta}c',
    zh: '← {beta}c',
    ar: '← {beta}c',
    es: '← {beta}c',
    fr: '← {beta}c',
    hi: '← {beta}c',
    id: '← {beta}c',
    pt: '← {beta}c',
  },
  /** 세 사건. */
  'label.depart': {
    ko: '출발',
    en: 'depart',
    ja: '出発',
    zh: '出发',
    ar: 'الانطلاق',
    es: 'salida',
    fr: 'départ',
    hi: 'प्रस्थान',
    id: 'berangkat',
    pt: 'partida',
  },
  'label.turn': {
    ko: '돌아섬',
    en: 'turnaround',
    ja: '折り返し',
    zh: '折返',
    ar: 'الاستدارة',
    es: 'media vuelta',
    fr: 'demi-tour',
    hi: 'वापसी मोड़',
    id: 'berbalik',
    pt: 'meia-volta',
  },
  'label.meet': {
    ko: '재회',
    en: 'reunion',
    ja: '再会',
    zh: '重逢',
    ar: 'اللقاء',
    es: 'reencuentro',
    fr: 'retrouvailles',
    hi: 'पुनर्मिलन',
    id: 'bertemu kembali',
    pt: 'reencontro',
  },
  'caption.out': {
    ko: '여행자가 멀어진다 — 기운 점선이 여행자의 ‘지금’, 여행자의 한 해마다 지구의 한 해보다 짧은 토막을 가리킨다',
    en: 'The traveler moves away — the tilted dashed line is the traveler’s ‘now’; each traveler year points to less than a year on Earth',
    ja: '旅行者が遠ざかる — 傾いた破線が旅行者の「今」で、旅行者の1年ごとに地球の1年より短い区間を指す',
    zh: '旅行者渐渐远去 — 倾斜的虚线是旅行者的“现在”，旅行者的每一年只对应地球上不到一年',
    ar: 'المسافر يبتعد — الخط المتقطع المائل هو «الآن» عند المسافر؛ كل سنة للمسافر تشير إلى أقل من سنة على الأرض',
    es: 'El viajero se aleja — la línea discontinua inclinada es el ‘ahora’ del viajero; cada año del viajero señala menos de un año en la Tierra',
    fr: 'Le voyageur s’éloigne — la ligne pointillée inclinée est le « maintenant » du voyageur ; chaque année du voyageur désigne moins d’une année sur Terre',
    hi: 'यात्री दूर जाता है — झुकी हुई डैश रेखा यात्री का ‘अभी’ है; यात्री का हर वर्ष पृथ्वी के एक वर्ष से कम हिस्से की ओर इशारा करता है',
    id: 'Pelancong menjauh — garis putus-putus yang miring adalah ‘sekarang’ bagi pelancong; setiap tahun pelancong menunjuk kurang dari setahun di Bumi',
    pt: 'O viajante se afasta — a linha tracejada inclinada é o ‘agora’ do viajante; cada ano do viajante aponta para menos de um ano na Terra',
  },
  'caption.turn': {
    ko: '돌아서는 쪽은 여행자뿐 — 틀을 바꾸는 순간 ‘지금’ 선이 돌아 지구 세계선의 한 토막을 건너뛴다',
    en: 'Only the traveler turns — as it switches frames, its ‘now’ swings and skips a whole stretch of Earth’s worldline',
    ja: '向きを変えるのは旅行者だけ — 座標系を乗り換える瞬間、「今」の線が回って地球の世界線の一区間を飛び越える',
    zh: '只有旅行者掉头 — 在切换参考系的瞬间，它的“现在”线一转，跳过地球世界线的一整段',
    ar: 'المسافر وحده يستدير — لحظة تبديله الإطار يدور خط «الآن» عنده ويقفز فوق قطعة كاملة من خط عالم الأرض',
    es: 'Solo el viajero da la vuelta — al cambiar de sistema, su ‘ahora’ gira y se salta todo un tramo de la línea de universo de la Tierra',
    fr: 'Seul le voyageur fait demi-tour — en changeant de référentiel, son « maintenant » pivote et saute tout un tronçon de la ligne d’univers de la Terre',
    hi: 'मुड़ता केवल यात्री है — निर्देश तंत्र बदलते ही उसकी ‘अभी’ रेखा घूमकर पृथ्वी की विश्व-रेखा का एक पूरा हिस्सा लाँघ जाती है',
    id: 'Hanya pelancong yang berbalik — saat berganti kerangka acuan, garis ‘sekarang’-nya berayun dan melompati seluruh ruas garis dunia Bumi',
    pt: 'Só o viajante dá meia-volta — ao trocar de referencial, seu ‘agora’ gira e salta todo um trecho da linha de mundo da Terra',
  },
  'caption.back': {
    ko: '돌아오는 길에도 여행자에게 지구의 해는 짧게 지나간다 — 건너뛴 토막만큼 지구가 앞서 있다',
    en: 'On the way back Earth’s years still pass slowly for the traveler — Earth is ahead by the skipped stretch',
    ja: '帰り道でも、旅行者にとって地球の年はゆっくり過ぎる — 飛び越えた区間の分だけ地球が先に進んでいる',
    zh: '返程中，对旅行者而言地球的年份依然过得很慢 — 地球领先了被跳过的那一段',
    ar: 'في طريق العودة تمرّ سنوات الأرض ببطء أيضًا بالنسبة إلى المسافر — والأرض متقدمة بمقدار القطعة التي قُفز فوقها',
    es: 'En el regreso los años de la Tierra siguen pasando despacio para el viajero — la Tierra va adelantada en el tramo saltado',
    fr: 'Au retour, les années de la Terre passent toujours lentement pour le voyageur — la Terre a d’avance le tronçon sauté',
    hi: 'लौटते समय भी यात्री के लिए पृथ्वी के वर्ष धीरे बीतते हैं — लाँघे गए हिस्से जितनी पृथ्वी आगे है',
    id: 'Dalam perjalanan pulang pun tahun-tahun Bumi tetap berlalu lambat bagi pelancong — Bumi unggul sebesar ruas yang dilompati',
    pt: 'Na volta os anos da Terra ainda passam devagar para o viajante — a Terra está à frente pelo trecho saltado',
  },
  'caption.meet': {
    ko: '다시 만나 세어 보면 곧은 세계선의 점이 더 많다 — 꺾인 세계선을 산 쌍둥이가 덜 늙었다',
    en: 'Count the dots at the reunion: the straight worldline has more — the twin on the bent worldline aged less',
    ja: '再会して数えると、まっすぐな世界線の点のほうが多い — 折れた世界線を生きた双子のほうが年をとっていない',
    zh: '重逢时数一数点：笔直的世界线上更多 — 走折线世界线的那个双胞胎老得更少',
    ar: 'عُدَّ النقاط عند اللقاء: خط العالم المستقيم فيه نقاط أكثر — التوأم على خط العالم المنكسر تقدّم في العمر أقل',
    es: 'Cuenta los puntos en el reencuentro: la línea de universo recta tiene más — el gemelo de la línea quebrada envejeció menos',
    fr: 'Comptez les points aux retrouvailles : la ligne d’univers droite en a plus — le jumeau de la ligne brisée a moins vieilli',
    hi: 'पुनर्मिलन पर बिंदु गिनें: सीधी विश्व-रेखा पर अधिक हैं — मुड़ी विश्व-रेखा वाला जुड़वाँ कम बूढ़ा हुआ',
    id: 'Hitung titiknya saat bertemu kembali: garis dunia yang lurus punya lebih banyak — si kembar di garis dunia yang tertekuk menua lebih sedikit',
    pt: 'Conte os pontos no reencontro: a linha de mundo reta tem mais — o gêmeo da linha de mundo quebrada envelheceu menos',
  },
} satisfies Record<string, LocalizedText>);

export type TwinParadoxMessageKey = keyof typeof twinParadoxMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TwinParadoxMessageKey): LocalizedText => twinParadoxMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TwinParadoxMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const twinParadoxSchema: BundleSchema = {
  id: TWIN_PARADOX_ID,
  label: text('label.title'),
  category: 'modern',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 여행자가 가고, 돌아서고, 돌아와 두 햇수가 갈린다.
  parameters: [],

  stages: [
    {
      id: 'round-trip',
      label: text('label.stage'),
      constants: {
        beta: BETA,
        distance: DISTANCE,
        tickYears: TICK_YEARS,
      },
    },
  ],

  environments: [],

  views: [{ id: 'earth-frame', label: text('label.view'), default: true }],

  /** 세로 20 년을 담아야 해서 기본보다 조금 높다. 가로는 햇수 글자가 쓴다. */
  canvas: { height: 460, minHeight: 400 },

  /** 부채(지난 「지금」 선)가 세계선 아래로, 머리 · 글자가 맨 위로 오도록 scene 순서로 그린다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 가는 길 → 돌아섬(지금 선이 돈다) → 오는 길 → 재회 → 읽기 → 흐려짐.
   * 지구 틀 시각 T 는 `out` · `back` 의 진행도로만 흐르고, `turn` 동안은 멈춘다.
   */
  timeline: {
    phases: [
      { id: 'out', duration: OUT, caption: key('caption.out') },
      { id: 'turn', duration: TURN, ease: 'smooth', caption: key('caption.turn') },
      { id: 'back', duration: BACK, caption: key('caption.back') },
      { id: 'meet', duration: MEET, caption: key('caption.meet') },
      { id: 'hold', duration: HOLD, caption: key('caption.meet') },
      { id: 'fade', duration: FADE, caption: key('caption.meet') },
    ],
  },

  /** 도착한 순간 이미 여행 중이다 — 가는 길의 절반쯤, 부채가 몇 가닥 깔려 있다. */
  startAt: 2.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 견줄 것은 거리가 아니라 **점의 개수**다 — 그리드를
   * 켜면 꺾인 세계선이 도표에서 더 길다는 것(유클리드 길이)을 재라는 지시가 되어 거꾸로 읽힌다.
   */

  messages: twinParadoxMessages,
};
