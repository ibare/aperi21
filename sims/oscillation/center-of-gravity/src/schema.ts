// ========================================================================
// center-of-gravity — 선언
// ========================================================================
// 질문: 기울인 물체가 어떤 때는 제자리로 돌아오고 어떤 때는 넘어진다. 그 갈림은
// 무엇이 정하는가?
//
// 답: 무게 중심에서 내린 수직선이 **받침면 안에 떨어지는 동안은** 놓으면 되돌아오고,
// 그 선이 받침면 끝(모서리)을 **넘는 순간** 넘어진다.
//
// 화면에서는 상자 하나를 같은 모서리로 두 번 기울인다 — 조금 기울였다 놓으면 되돌아와
// 서고, 수직선이 모서리를 넘도록 기울이면 놓지 않아도 넘어간다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:center-of-gravity` 와 문자 그대로 일치한다 (C4). */
export const CENTER_OF_GRAVITY_ID = 'center-of-gravity';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 상자 너비(m). 받침면의 폭이다. */
export const BOX_WIDTH = 0.6;
/** 상자 높이(m). 무게 중심은 가운데라 높이의 절반에 있다. */
export const BOX_HEIGHT = 1;
/**
 * 첫 번째로 기울이는 각을 경계각(수직선이 모서리에 닿는 각)의 몇 배로 할지.
 * 1 보다 작아야 되돌아온다 — 이 조각이 주장하는 갈림의 안쪽이다.
 */
export const SMALL_TILT_RATIO = 0.55;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m. 원점은 서 있는 상자 밑면의 가운데.
// ------------------------------------------------------------------------

/** 미는 손 화살표 길이(m). 기울이는 단계에만 나온다. */
export const PUSH_LENGTH = 0.32;
/** 미는 손 화살표를 상자 옆면에서 띄우는 거리(m). */
export const PUSH_GAP = 0.04;

/**
 * 프레이밍 — 왼쪽은 캡션 자리, 오른쪽은 넘어진 상자가 눕는 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -1.55, maxX: 1.95, minY: -0.5, maxY: 1.28 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const centerOfGravityMessages = Object.freeze({
  'label.title': {
    ko: '무게 중심',
    en: 'Center of gravity',
    ja: '重心',
    zh: '重心',
    ar: 'مركز الثقل',
    es: 'Centro de gravedad',
    fr: 'Centre de gravité',
    hi: 'गुरुत्व केंद्र',
    id: 'Titik berat',
    pt: 'Centro de gravidade',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '넘어지는 조건을 정하는 점',
    en: 'The point that decides when things tip over',
    ja: '物が倒れるかどうかを決める点',
    zh: '决定物体何时倾倒的点',
    ar: 'النقطة التي تحدد متى تنقلب الأشياء',
    es: 'El punto que decide cuándo algo se vuelca',
    fr: 'Le point qui décide quand un objet bascule',
    hi: 'वह बिंदु जो तय करता है कि चीज़ें कब पलटती हैं',
    id: 'Titik yang menentukan kapan benda terguling',
    pt: 'O ponto que decide quando algo tomba',
  },
  'label.stage': {
    ko: '바닥 위 상자',
    en: 'Box on the floor',
    ja: '床の上の箱',
    zh: '地面上的箱子',
    ar: 'صندوق على الأرض',
    es: 'Caja sobre el suelo',
    fr: 'Boîte sur le sol',
    hi: 'फ़र्श पर रखा डिब्बा',
    id: 'Kotak di lantai',
    pt: 'Caixa no chão',
  },
  'label.view': {
    ko: '기울이기',
    en: 'Tilting',
    ja: '傾ける',
    zh: '倾斜',
    ar: 'الإمالة',
    es: 'Inclinación',
    fr: 'Inclinaison',
    hi: 'झुकाना',
    id: 'Memiringkan',
    pt: 'Inclinação',
  },

  /** 도식 이름표. 짧은 명사라 번역한다 — 조사·어순이 붙지 않는다. */
  'label.cog': {
    ko: '무게 중심',
    en: 'Center of gravity',
    ja: '重心',
    zh: '重心',
    ar: 'مركز الثقل',
    es: 'Centro de gravedad',
    fr: 'Centre de gravité',
    hi: 'गुरुत्व केंद्र',
    id: 'Titik berat',
    pt: 'Centro de gravidade',
  },
  'label.base': {
    ko: '받침면',
    en: 'Base',
    ja: '支持面',
    zh: '支撑面',
    ar: 'القاعدة',
    es: 'Base',
    fr: 'Base',
    hi: 'आधार',
    id: 'Bidang tumpu',
    pt: 'Base',
  },

  'caption.lean': {
    ko: '상자를 조금 기울였다. 무게 중심에서 내린 수직선은 아직 받침면 안에 떨어진다.',
    en: 'The box is tilted a little. The line straight down from its center of gravity still lands inside the base.',
    ja: '箱を少し傾けた。重心から真下に下ろした線は、まだ支持面の内側に落ちる。',
    zh: '箱子稍稍倾斜。从重心竖直向下的线仍落在支撑面之内。',
    ar: 'أُميل الصندوق قليلًا. الخط النازل رأسيًا من مركز ثقله ما زال يقع داخل القاعدة.',
    es: 'La caja está un poco inclinada. La línea que baja recta desde su centro de gravedad aún cae dentro de la base.',
    fr: 'La boîte est un peu inclinée. La verticale issue de son centre de gravité tombe encore à l’intérieur de la base.',
    hi: 'डिब्बा थोड़ा झुका है। उसके गुरुत्व केंद्र से सीधी नीचे जाती रेखा अब भी आधार के भीतर पड़ती है।',
    id: 'Kotak dimiringkan sedikit. Garis lurus ke bawah dari titik beratnya masih jatuh di dalam bidang tumpu.',
    pt: 'A caixa está um pouco inclinada. A linha que desce reta do seu centro de gravidade ainda cai dentro da base.',
  },
  'caption.return': {
    ko: '손을 놓으면 되돌아와 선다 — 수직선이 받침면 안에 있는 동안은 무게가 상자를 되세운다.',
    en: 'Let go and it rocks back upright — while the line stays inside the base, the weight pulls the box back.',
    ja: '手を離すと揺れ戻って立つ — 線が支持面の内側にある間は、重さが箱を引き戻す。',
    zh: '一松手，它就摇回来立住 — 只要这条线还在支撑面内，重力就会把箱子拉回。',
    ar: 'اتركه فيعود متأرجحًا إلى وضعه القائم — ما دام الخط داخل القاعدة، يشدّ الوزن الصندوق إلى الخلف.',
    es: 'Suéltala y vuelve a quedar de pie — mientras la línea siga dentro de la base, el peso tira de la caja hacia atrás.',
    fr: 'Lâchez-la et elle revient d’aplomb — tant que la verticale reste dans la base, le poids ramène la boîte.',
    hi: 'छोड़ते ही वह झूलकर फिर सीधा खड़ा हो जाता है — जब तक रेखा आधार के भीतर है, भार डिब्बे को वापस खींचता है।',
    id: 'Lepaskan dan kotak berayun kembali tegak — selama garis tetap di dalam bidang tumpu, berat menarik kotak kembali.',
    pt: 'Solte e ela volta a ficar de pé — enquanto a linha fica dentro da base, o peso puxa a caixa de volta.',
  },
  'caption.leanMore': {
    ko: '이번에는 더 기울인다. 수직선이 받침면 끝, 모서리로 다가간다.',
    en: 'Now tilt it further. The line moves toward the end of the base — the corner.',
    ja: '今度はもっと傾ける。線は支持面の端、角へ近づく。',
    zh: '这次倾斜得更多。这条线移向支撑面的尽头 — 边角。',
    ar: 'الآن أمِله أكثر. يتحرك الخط نحو طرف القاعدة — الزاوية.',
    es: 'Ahora inclínala más. La línea se acerca al extremo de la base — la esquina.',
    fr: 'Inclinez-la davantage. La verticale se rapproche du bout de la base — le coin.',
    hi: 'अब इसे और झुकाइए। रेखा आधार के छोर — कोने — की ओर बढ़ती है।',
    id: 'Sekarang miringkan lebih jauh. Garis bergerak ke ujung bidang tumpu — sudutnya.',
    pt: 'Agora incline mais. A linha se aproxima da ponta da base — a quina.',
  },
  'caption.edge': {
    ko: '수직선이 모서리에 닿았다. 여기가 되돌아오느냐 넘어지느냐의 경계다.',
    en: 'The line has reached the corner. This is the boundary between rocking back and tipping over.',
    ja: '線が角に届いた。ここが揺れ戻るか倒れるかの境目だ。',
    zh: '这条线到达了边角。这里就是摇回与倾倒的分界。',
    ar: 'وصل الخط إلى الزاوية. هنا الحدّ الفاصل بين العودة والانقلاب.',
    es: 'La línea ha llegado a la esquina. Esta es la frontera entre volver y volcarse.',
    fr: 'La verticale atteint le coin. C’est la limite entre revenir et basculer.',
    hi: 'रेखा कोने तक पहुँच गई है। यही वापस लौटने और पलट जाने के बीच की सीमा है।',
    id: 'Garis telah mencapai sudut. Inilah batas antara berayun kembali dan terguling.',
    pt: 'A linha chegou à quina. Este é o limite entre voltar e tombar.',
  },
  'caption.tip': {
    ko: '수직선이 받침면 밖으로 나가는 순간, 무게가 상자를 바깥으로 끌어 넘어뜨린다.',
    en: 'The moment the line leaves the base, the weight pulls the box outward and it tips over.',
    ja: '線が支持面の外へ出た瞬間、重さが箱を外側へ引き、箱は倒れる。',
    zh: '这条线一离开支撑面，重力就把箱子往外拉，箱子随之倾倒。',
    ar: 'في اللحظة التي يغادر فيها الخط القاعدة، يشدّ الوزن الصندوق إلى الخارج فينقلب.',
    es: 'En cuanto la línea sale de la base, el peso tira de la caja hacia afuera y se vuelca.',
    fr: 'Dès que la verticale quitte la base, le poids entraîne la boîte vers l’extérieur et elle bascule.',
    hi: 'जिस क्षण रेखा आधार से बाहर निकलती है, भार डिब्बे को बाहर की ओर खींचता है और वह पलट जाता है।',
    id: 'Begitu garis keluar dari bidang tumpu, berat menarik kotak ke luar dan kotak terguling.',
    pt: 'No instante em que a linha sai da base, o peso puxa a caixa para fora e ela tomba.',
  },
  'caption.fallen': {
    ko: '누운 자리에서는 수직선이 다시 새 받침면 안에 떨어진다. 이제 그대로 있다.',
    en: 'Lying down, the line lands inside the new base again. Now it stays put.',
    ja: '横倒しになると、線は再び新しい支持面の内側に落ちる。もう動かない。',
    zh: '躺倒之后，这条线又落在新的支撑面之内。现在它不再动了。',
    ar: 'وهو ممدد، يقع الخط داخل القاعدة الجديدة من جديد. الآن يبقى في مكانه.',
    es: 'Tumbada, la línea vuelve a caer dentro de la nueva base. Ahora se queda quieta.',
    fr: 'Couchée, la verticale retombe dans la nouvelle base. Désormais elle ne bouge plus.',
    hi: 'लेटने पर रेखा फिर से नए आधार के भीतर पड़ती है। अब वह वहीं टिका रहता है।',
    id: 'Setelah rebah, garis kembali jatuh di dalam bidang tumpu yang baru. Kini kotak diam di tempat.',
    pt: 'Deitada, a linha volta a cair dentro da nova base. Agora ela fica parada.',
  },
} satisfies Record<string, LocalizedText>);

export type CenterOfGravityMessageKey = keyof typeof centerOfGravityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: CenterOfGravityMessageKey): LocalizedText => centerOfGravityMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: CenterOfGravityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const centerOfGravitySchema: BundleSchema = {
  id: CENTER_OF_GRAVITY_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'box-on-floor',
      label: text('label.stage'),
      constants: {
        boxWidth: BOX_WIDTH,
        boxHeight: BOX_HEIGHT,
        smallTiltRatio: SMALL_TILT_RATIO,
      },
    },
  ],
  environments: [],
  views: [{ id: 'tilt', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 가운데 상자, 오른쪽은 넘어진 상자가 눕는 자리, 왼쪽 아래는 캡션.
   * 세로는 모서리로 선 상자의 대각선 높이(약 1.17 m)면 된다.
   */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 쓴 순서대로 겹친다 — 바닥 → 상자 → 받침면 → 수직선 → 무게 중심. 수직선이 상자 면 위로
   * 지나가야 「어디에 떨어지는가」 가 읽힌다. 층 순서로는 `region` 이 선보다 위에 온다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 상자가 기울고 있다 (S-piece). */
  startAt: 0.9,

  /**
   * 한 주기 10.8 초. 같은 상자를 같은 모서리로 두 번 기울인다.
   *
   * - `lean` — 손이 경계각의 일부까지 기울인다.
   * - `hold` — 그 자리에서 잠깐 멈춘다. 수직선이 받침면 안에 있다.
   * - `return` — 놓는다. 되돌아와 선다(떨어지듯 빨라진다).
   * - `rest` — 선 채로 잠깐.
   * - `leanMore` — 경계각까지 기울인다.
   * - `edge` — 수직선이 모서리에 닿은 채 멈춘다.
   * - `tip` — 선이 모서리를 넘는 순간 스스로 넘어간다(빨라지며 눕는다).
   * - `fallen` — 옆으로 누운 채. 수직선이 새 받침면 안이다.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'lean', duration: 1.8, ease: 'smooth', caption: key('caption.lean') },
      { id: 'hold', duration: 0.7, caption: key('caption.lean') },
      { id: 'return', duration: 0.9, caption: key('caption.return') },
      { id: 'rest', duration: 0.9, caption: key('caption.return') },
      { id: 'leanMore', duration: 2.4, ease: 'smooth', caption: key('caption.leanMore') },
      { id: 'edge', duration: 1, caption: key('caption.edge') },
      { id: 'tip', duration: 1.2, caption: key('caption.tip') },
      { id: 'fallen', duration: 1.4, caption: key('caption.fallen') },
      { id: 'fade', duration: 0.5, caption: key('caption.fallen') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림이 묻는 것은 「수직선이
  // 받침면 안인가 밖인가」 이고, 거리 눈금은 오독의 경로가 된다 (S-piece).

  messages: centerOfGravityMessages,
};
