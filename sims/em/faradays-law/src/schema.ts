// ========================================================================
// faradays-law — 선언
// ========================================================================
// 질문: 코일 속으로 자석을 밀어 넣으면 전압이 생긴다. 그 크기는 무엇이 정하는가.
//
// 같은 자석을 같은 거리만큼 밀어 넣는데 빠르기만 바꾼다. 느리게 밀면 기록지의
// 자취가 낮고 넓게 부풀고, 빠르게 밀면 좁고 높게 튄다. 자석이 멈추면 어느 쪽이든
// 자취는 곧바로 바닥(0)으로 내려앉는다. 마지막으로 감은 수를 늘린 코일에 같은
// 빠르기로 밀면 한 번 더 높이 튄다.
//
// 전압의 방향(부호)은 이웃 조각 `lenzs-law` 의 몫이다 — 여기서는 밀어 넣기만 하므로
// 한쪽 부호만 나오고, 그것을 위로 그린다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:faradays-law` 와 문자 그대로 일치한다 (C4). */
export const FARADAYS_LAW_ID = 'faradays-law';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 느린 판의 미는 속력(월드 단위/초). */
export const V_SLOW = 1;
/** 빠른 판 속력 ÷ 느린 판 속력. 화면의 `2v` 이름표가 이 값을 그대로 쓴다. */
export const SPEED_RATIO = 2;
/** 처음 코일의 감은 수. 코일에 그려지는 고리 수이기도 하다. */
export const TURNS = 5;
/** 마지막 판 코일의 감은 수 ÷ 처음 감은 수. 화면의 `2N` 이름표가 이 값을 그대로 쓴다. */
export const TURNS_RATIO = 2;
/** 자석이 코일 한가운데 있을 때 한 고리를 지나는 자기 선속(임의 단위). */
export const FLUX_PEAK = 1;
/**
 * 선속이 자석 거리에 따라 줄어드는 폭(월드 단위). 코일 반지름 정도의 길이다 —
 * 선속은 Φ(d) = Φ₀ / (1 + (d/a)²)^(3/2) 로 둔다(고리 축 위 쌍극자의 모양).
 */
export const FLUX_WIDTH = 0.6;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전압(임의 단위) → 기록지 높이(월드). 가장 큰 봉우리(빠르게 · 많이 감음)가 판 안에 들도록 잡았다. */
export const VOLT_SCALE = 0.08;
/** 기록지 가로 — 1 초가 차지하는 월드 길이. 세 판이 같은 배율이라 폭을 견줄 수 있다. */
export const SECONDS_TO_WORLD = 1;
/** 기록지가 담는 시간(초). 느린 판의 밀기 + 멈춤이 다 들어가는 길이다. */
export const GRAPH_SECONDS = 4.4;
/** 자석 위 움직임 화살표 — 속력(월드/초) → 화살표 길이(월드). */
export const ARROW_SCALE = 0.45;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 왼쪽에 코일과 자석, 오른쪽에 기록지.
// ------------------------------------------------------------------------

/** 코일 한가운데. 자석이 여기서 멈춘다. */
export const COIL_X = -2;
export const COIL_Y = 0.3;
/** 코일의 축 방향 길이 — 감은 수가 늘어도 같다(더 촘촘히 감는다). */
export const COIL_LENGTH = 0.8;
/** 옆에서 본 고리의 가로 · 세로 반지름. */
export const RING_RX = 0.11;
export const RING_RY = 0.55;
/** 자석이 밀려 들어가는 거리 — 출발 자리에서 코일 한가운데까지. */
export const TRAVEL = 3;
/** 자석 폭 · 높이. */
export const MAGNET_W = 1.2;
export const MAGNET_H = 0.34;
/** 움직임 화살표가 놓이는 높이(자석 중심 기준). 코일 위로 지나가야 가리지 않는다. */
export const ARROW_RISE = 0.8;
/** 감은 수 이름표 자리(코일 아래). */
export const TURNS_LABEL_Y = COIL_Y - RING_RY - 0.22;

/** 기록지 원점(시간 0 · 전압 0)과 세로 높이. */
export const GRAPH_X = 0.6;
export const GRAPH_Y = -0.8;
export const GRAPH_H = 2.45;
/** 코일 두 끝에서 기록지로 가는 도선이 꺾이는 높이. */
export const LEAD_Y = -1.05;

/**
 * 프레이밍 — 자석 출발 자리 왼끝(−5.6)부터 기록지 오른끝(5.0) 너머, 세로는 도선
 * 아래부터 가장 높은 봉우리 이름표 위까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.85, maxX: 5.45, minY: -1.3, maxY: 1.95 } as const;

// ------------------------------------------------------------------------
// 시간표 — 밀기 단계의 길이는 물리가 정한다 (거리 ÷ 속력)
// ------------------------------------------------------------------------

/** 자석이 처음 자리에 나타나는 동안(초). */
export const APPEAR = 0.5;
/** 느린 판 · 빠른 판(과 마지막 판) 밀기. 자석이 코일 한가운데에 닿는 순간 끝난다. */
export const PUSH_SLOW = TRAVEL / V_SLOW;
export const PUSH_FAST = TRAVEL / (V_SLOW * SPEED_RATIO);
/** 멈춘 뒤 자취가 바닥을 따라가는 동안. */
export const REST = 1.4;
/** 자석이 사라지는 동안. */
export const VANISH = 0.5;
/** 코일을 다시 감는 동안(고리가 촘촘해진다). */
export const REWIND = 0.8;
/** 마지막 판의 멈춤 — 세 자취를 한꺼번에 견주는 시간이라 길다. */
export const FINAL_REST = 2.6;
/** 모두 흐려지고 처음으로 돌아가는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const faradaysLawMessages = Object.freeze({
  'label.title': {
    ko: '패러데이 법칙',
    en: "Faraday's law",
    ja: 'ファラデーの法則',
    zh: '法拉第定律',
    ar: 'قانون فاراداي',
    es: 'Ley de Faraday',
    fr: 'Loi de Faraday',
    hi: 'फैराडे का नियम',
    id: 'Hukum Faraday',
    pt: 'Lei de Faraday',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '자속 변화가 만드는 기전력',
    en: 'The EMF made by a changing flux',
    ja: '磁束の変化が生む起電力',
    zh: '磁通量变化产生的电动势',
    ar: 'القوة الدافعة الكهربائية الناتجة عن تغيّر التدفق',
    es: 'La fem producida por un flujo variable',
    fr: 'La f.é.m. créée par un flux variable',
    hi: 'बदलते फ्लक्स से उत्पन्न विद्युत वाहक बल',
    id: 'GGL yang ditimbulkan oleh perubahan fluks',
    pt: 'A fem gerada por um fluxo variável',
  },
  'label.stage': {
    ko: '코일과 자석',
    en: 'Coil and magnet',
    ja: 'コイルと磁石',
    zh: '线圈与磁铁',
    ar: 'الملف والمغناطيس',
    es: 'Bobina e imán',
    fr: 'Bobine et aimant',
    hi: 'कुंडली और चुंबक',
    id: 'Kumparan dan magnet',
    pt: 'Bobina e ímã',
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
  /** 자석에 새겨진 극 표식 (C1 판정 1). */
  'label.poleN': {
    ko: 'N',
    en: 'N',
    ja: 'N',
    zh: 'N',
    ar: 'N',
    es: 'N',
    fr: 'N',
    hi: 'N',
    id: 'N',
    pt: 'N',
  },
  'label.poleS': {
    ko: 'S',
    en: 'S',
    ja: 'S',
    zh: 'S',
    ar: 'S',
    es: 'S',
    fr: 'S',
    hi: 'S',
    id: 'S',
    pt: 'S',
  },
  /** 기록지 축 이름. 기호라 번역 대상이 아니다 (C1 판정 3). */
  'label.axisV': {
    ko: 'V',
    en: 'V',
    ja: 'V',
    zh: 'V',
    ar: 'V',
    es: 'V',
    fr: 'V',
    hi: 'V',
    id: 'V',
    pt: 'V',
  },
  'label.axisT': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  /**
   * 속력 · 감은 수 기호. 배수는 스테이지 상수를 그대로 끼운다 — `2` 가 코드에 박히면
   * 저작자가 배수를 바꿨을 때 이름표가 거짓말을 한다.
   */
  'label.speed': {
    ko: 'v',
    en: 'v',
    ja: 'v',
    zh: 'v',
    ar: 'v',
    es: 'v',
    fr: 'v',
    hi: 'v',
    id: 'v',
    pt: 'v',
  },
  'label.speedTimes': {
    ko: '{k}v',
    en: '{k}v',
    ja: '{k}v',
    zh: '{k}v',
    ar: '{k}v',
    es: '{k}v',
    fr: '{k}v',
    hi: '{k}v',
    id: '{k}v',
    pt: '{k}v',
  },
  'label.turns': {
    ko: 'N',
    en: 'N',
    ja: 'N',
    zh: 'N',
    ar: 'N',
    es: 'N',
    fr: 'N',
    hi: 'N',
    id: 'N',
    pt: 'N',
  },
  'label.turnsTimes': {
    ko: '{k}N',
    en: '{k}N',
    ja: '{k}N',
    zh: '{k}N',
    ar: '{k}N',
    es: '{k}N',
    fr: '{k}N',
    hi: '{k}N',
    id: '{k}N',
    pt: '{k}N',
  },
  'label.speedTurns': {
    ko: '{s}v · {n}N',
    en: '{s}v · {n}N',
    ja: '{s}v · {n}N',
    zh: '{s}v · {n}N',
    ar: '{s}v · {n}N',
    es: '{s}v · {n}N',
    fr: '{s}v · {n}N',
    hi: '{s}v · {n}N',
    id: '{s}v · {n}N',
    pt: '{s}v · {n}N',
  },
  'caption.setup': {
    ko: '코일 옆에 자석을 놓았다',
    en: 'A magnet waits beside the coil',
    ja: 'コイルの横に磁石が置かれている',
    zh: '线圈旁放着一块磁铁',
    ar: 'مغناطيس ينتظر بجانب الملف',
    es: 'Un imán espera junto a la bobina',
    fr: 'Un aimant attend à côté de la bobine',
    hi: 'कुंडली के पास एक चुंबक रखा है',
    id: 'Sebuah magnet menunggu di samping kumparan',
    pt: 'Um ímã espera ao lado da bobina',
  },
  'caption.slow': {
    ko: '자석을 천천히 밀어 넣는다 — 전압이 낮게 오른다',
    en: 'The magnet goes in slowly — the voltage rises only a little',
    ja: '磁石がゆっくり入っていく — 電圧は少ししか上がらない',
    zh: '磁铁缓缓插入 — 电压只升高一点',
    ar: 'يدخل المغناطيس ببطء — فيرتفع الجهد قليلًا فقط',
    es: 'El imán entra despacio — el voltaje sube solo un poco',
    fr: 'L’aimant entre lentement — la tension ne monte qu’un peu',
    hi: 'चुंबक धीरे-धीरे अंदर जाता है — वोल्टता बस थोड़ी-सी बढ़ती है',
    id: 'Magnet masuk perlahan — tegangan hanya naik sedikit',
    pt: 'O ímã entra devagar — a tensão sobe só um pouco',
  },
  'caption.slowStop': {
    ko: '자석이 멈췄다 — 전압도 0 으로 돌아왔다',
    en: 'The magnet has stopped — the voltage is back to zero',
    ja: '磁石が止まった — 電圧も 0 に戻った',
    zh: '磁铁停下了 — 电压也回到 0',
    ar: 'توقف المغناطيس — وعاد الجهد إلى الصفر',
    es: 'El imán se ha detenido — el voltaje vuelve a cero',
    fr: 'L’aimant s’est arrêté — la tension est revenue à zéro',
    hi: 'चुंबक रुक गया — वोल्टता फिर शून्य पर आ गई',
    id: 'Magnet berhenti — tegangan kembali ke nol',
    pt: 'O ímã parou — a tensão voltou a zero',
  },
  'caption.again': {
    ko: '같은 자석을 처음 자리로 되돌렸다',
    en: 'The same magnet is back at the start',
    ja: '同じ磁石が最初の位置に戻った',
    zh: '同一块磁铁回到了起点',
    ar: 'عاد المغناطيس نفسه إلى نقطة البداية',
    es: 'El mismo imán vuelve al punto de partida',
    fr: 'Le même aimant est revenu au départ',
    hi: 'वही चुंबक फिर शुरुआती जगह पर है',
    id: 'Magnet yang sama kembali ke posisi awal',
    pt: 'O mesmo ímã está de volta ao início',
  },
  'caption.fast': {
    ko: '이번에는 더 빠르게 밀어 넣는다 — 전압이 더 높이 튄다',
    en: 'This time it goes in faster — the voltage jumps higher',
    ja: '今度はもっと速く入っていく — 電圧がより高く跳ね上がる',
    zh: '这次插得更快 — 电压跳得更高',
    ar: 'هذه المرة يدخل أسرع — فيقفز الجهد أعلى',
    es: 'Esta vez entra más rápido — el voltaje salta más alto',
    fr: 'Cette fois il entre plus vite — la tension bondit plus haut',
    hi: 'इस बार वह और तेज़ी से अंदर जाता है — वोल्टता और ऊँची उछलती है',
    id: 'Kali ini masuk lebih cepat — tegangan melonjak lebih tinggi',
    pt: 'Desta vez ele entra mais rápido — a tensão salta mais alto',
  },
  'caption.fastStop': {
    ko: '멈추면 다시 0 — 빠르게 밀 때 더 높이 튀었다',
    en: 'Stopped, back to zero — the faster push made it jump higher',
    ja: '止まればまた 0 — 速く押したときのほうが高く跳ねた',
    zh: '停下又回到 0 — 推得快时跳得更高',
    ar: 'توقف فعاد إلى الصفر — الدفع الأسرع جعله يقفز أعلى',
    es: 'Detenido, de vuelta a cero — el empuje más rápido hizo saltar más alto el voltaje',
    fr: 'Arrêt, retour à zéro — la poussée plus rapide l’a fait bondir plus haut',
    hi: 'रुकते ही फिर शून्य — तेज़ धक्के से वोल्टता और ऊँची उछली',
    id: 'Berhenti, kembali ke nol — dorongan yang lebih cepat membuatnya melonjak lebih tinggi',
    pt: 'Parado, de volta a zero — o empurrão mais rápido fez a tensão saltar mais alto',
  },
  'caption.rewind': {
    ko: '코일을 더 많이 감았다 — 자석은 다시 처음 자리에',
    en: 'The coil now has more turns — the magnet is back at the start',
    ja: 'コイルの巻き数を増やした — 磁石はまた最初の位置に',
    zh: '线圈多绕了几匝 — 磁铁又回到起点',
    ar: 'صار للملف لفات أكثر — والمغناطيس عاد إلى نقطة البداية',
    es: 'La bobina ahora tiene más vueltas — el imán vuelve al punto de partida',
    fr: 'La bobine compte maintenant plus de spires — l’aimant est revenu au départ',
    hi: 'कुंडली में अब अधिक फेरे हैं — चुंबक फिर शुरुआती जगह पर है',
    id: 'Kumparan kini punya lebih banyak lilitan — magnet kembali ke posisi awal',
    pt: 'A bobina agora tem mais espiras — o ímã está de volta ao início',
  },
  'caption.turns': {
    ko: '같은 빠르기로 밀어 넣는다 — 전압이 한 번 더 커진다',
    en: 'The same fast push — the voltage grows once more',
    ja: '同じ速さで押し込む — 電圧がもう一段大きくなる',
    zh: '同样快速地推入 — 电压又增大了一次',
    ar: 'الدفع السريع نفسه — فيكبر الجهد مرة أخرى',
    es: 'El mismo empuje rápido — el voltaje crece una vez más',
    fr: 'La même poussée rapide — la tension grandit encore',
    hi: 'वही तेज़ धक्का — वोल्टता एक बार फिर बढ़ती है',
    id: 'Dorongan cepat yang sama — tegangan membesar sekali lagi',
    pt: 'O mesmo empurrão rápido — a tensão cresce mais uma vez',
  },
  'caption.turnsStop': {
    ko: '감은 수가 많은 코일에서 더 높이 튀었다 — 멈추면 역시 0',
    en: 'More turns, a higher jump — and zero again once it stops',
    ja: '巻き数が多いほど高く跳ねる — 止まればやはり 0',
    zh: '匝数更多，跳得更高 — 停下后同样归 0',
    ar: 'لفات أكثر، قفزة أعلى — ثم صفر من جديد حين يتوقف',
    es: 'Más vueltas, un salto más alto — y cero otra vez al detenerse',
    fr: 'Plus de spires, un bond plus haut — et de nouveau zéro dès qu’il s’arrête',
    hi: 'अधिक फेरे, ऊँची उछाल — और रुकते ही फिर शून्य',
    id: 'Lebih banyak lilitan, lonjakan lebih tinggi — dan kembali nol begitu berhenti',
    pt: 'Mais espiras, um salto mais alto — e zero de novo quando para',
  },
} satisfies Record<string, LocalizedText>);

export type FaradaysLawMessageKey = keyof typeof faradaysLawMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FaradaysLawMessageKey): LocalizedText => faradaysLawMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FaradaysLawMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const faradaysLawSchema: BundleSchema = {
  id: FARADAYS_LAW_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 바로 밀어 넣고, 멈추고, 더 빠르게 다시 민다.
  parameters: [],

  stages: [
    {
      id: 'coil',
      label: text('label.stage'),
      constants: {
        vSlow: V_SLOW,
        speedRatio: SPEED_RATIO,
        turns: TURNS,
        turnsRatio: TURNS_RATIO,
        fluxPeak: FLUX_PEAK,
        fluxWidth: FLUX_WIDTH,
        voltScale: VOLT_SCALE,
        secondsToWorld: SECONDS_TO_WORLD,
        graphSeconds: GRAPH_SECONDS,
        arrowScale: ARROW_SCALE,
      },
    },
  ],

  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 자석이 지나가는 축과 기록지 한 장이 전부다. */
  canvas: { height: 300, minHeight: 280 },

  /**
   * 겹침이 판정 장치다. 자석이 코일 **속으로** 들어가야 한다 — 고리의 뒤 반쪽 위,
   * 앞 반쪽 아래를 지나야 「고리 속을 지난다」 로 읽힌다. 층 순서로는 자석(body)과
   * 고리(lineSet)의 앞뒤를 반쪽마다 가를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 느리게 · 빠르게 · 감은 수를 늘려 빠르게, 세 판. 판마다
   * 나타남 → 밀기 → 멈춤 → 사라짐.
   *
   * 밀기 단계의 길이는 거리 ÷ 속력이다 — 자석이 코일 한가운데에 닿는 순간 단계가
   * 끝나서 「멈췄다」 캡션이 화면과 어긋나지 않는다. 멈춤 자체는 물리가 정한다
   * (physics `magnetAt`) — 저작자가 밀기 단계를 늘이면 자석이 먼저 멈추고 기다린다.
   */
  timeline: {
    phases: [
      { id: 'slow-in', duration: APPEAR, caption: key('caption.setup') },
      { id: 'slow-push', duration: PUSH_SLOW, caption: key('caption.slow') },
      { id: 'slow-rest', duration: REST, caption: key('caption.slowStop') },
      { id: 'slow-out', duration: VANISH, caption: key('caption.slowStop') },
      { id: 'fast-in', duration: APPEAR, caption: key('caption.again') },
      { id: 'fast-push', duration: PUSH_FAST, caption: key('caption.fast') },
      { id: 'fast-rest', duration: REST, caption: key('caption.fastStop') },
      { id: 'fast-out', duration: VANISH, caption: key('caption.fastStop') },
      { id: 'turns-in', duration: REWIND, ease: 'smooth', caption: key('caption.rewind') },
      { id: 'turns-push', duration: PUSH_FAST, caption: key('caption.turns') },
      { id: 'turns-rest', duration: FINAL_REST, caption: key('caption.turnsStop') },
      { id: 'clear', duration: CLEAR, caption: key('caption.turnsStop') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 느린 판의 자석이 코일에 다가가고, 기록지의
   * 자취가 막 부풀기 시작한 자리에서 연다.
   */
  startAt: 2.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙과 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 기록지에 눈금 수를 달지 않는다 — 잴 것은
   * 몇 볼트인가가 아니라 **어느 자취가 더 높은가** 다.
   */

  messages: faradaysLawMessages,
};
