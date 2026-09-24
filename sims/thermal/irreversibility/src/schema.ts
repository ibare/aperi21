// ========================================================================
// irreversibility — 선언
// ========================================================================
// 질문: 튀다 멈춘 공을 거꾸로 돌리면 왜 어색한가.
//
// 공이 알갱이로 된 바닥 위에서 튈 때마다 덜 높이 오르고, 부딪힌 자리 알갱이들의 떨림이
// 커져 바닥 전체로 번진다. 공이 멈추면 같은 장면을 거꾸로 돌린다 — 바닥 곳곳에 흩어져
// 있던 떨림이 공 밑 한 점으로 모여 공을 차 올리고, 공은 튈 때마다 더 높이 오른다.
// 동사: 흩어진 떨림이 한 점으로 모여 공을 띄운다(거꾸로).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:irreversibility` 와 문자 그대로 일치한다 (C4). */
export const IRREVERSIBILITY_ID = 'irreversibility';

// ------------------------------------------------------------------------
// 배치 — 월드 단위(m). 바닥 윗면 가운데(공이 부딪히는 자리)가 원점, y 는 위가 양수.
// 물리량(중력 · 처음 높이 · 반발 계수 · 알갱이 격자 · 시드 · 떨림 배율 · 번짐)은
// 스테이지 상수다 (아래 `stages`).
// ------------------------------------------------------------------------

/**
 * 프레이밍. 기본 알갱이 격자(25 × 4, 간격 0.13 → 가로 ±1.56) · 공의 처음 높이(1 m + 반지름)와
 * 왼쪽 위 재생 표식, 아래 캡션 줄의 자리까지. 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -1.75, maxX: 1.75, minY: -0.78, maxY: 1.26 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const irreversibilityMessages = Object.freeze({
  'label.title': {
    ko: '엔트로피와 비가역성',
    en: 'Entropy and irreversibility',
    ja: 'エントロピーと不可逆性',
    zh: '熵与不可逆性',
    ar: 'الإنتروبيا واللاانعكاسية',
    es: 'Entropía e irreversibilidad',
    fr: 'Entropie et irréversibilité',
    hi: 'एन्ट्रॉपी और अनुत्क्रमणीयता',
    id: 'Entropi dan ketakterbalikan',
    pt: 'Entropia e irreversibilidade',
  },
  'label.operation': {
    ko: '되돌릴 수 없는 이유',
    en: 'Why it cannot be undone',
    ja: '元に戻せない理由',
    zh: '为什么无法复原',
    ar: 'لماذا لا يمكن التراجع عنه',
    es: 'Por qué no se puede deshacer',
    fr: 'Pourquoi on ne peut pas revenir en arrière',
    hi: 'इसे वापस क्यों नहीं किया जा सकता',
    id: 'Mengapa tidak bisa dibalikkan',
    pt: 'Por que não pode ser desfeito',
  },
  'label.stage': {
    ko: '알갱이 바닥 위의 공',
    en: 'Ball on a grainy floor',
    ja: '粒でできた床の上のボール',
    zh: '颗粒地面上的球',
    ar: 'كرة على أرضية من حبيبات',
    es: 'Pelota sobre un suelo granular',
    fr: 'Balle sur un sol granuleux',
    hi: 'दानेदार फ़र्श पर गेंद',
    id: 'Bola di atas lantai berbutir',
    pt: 'Bola sobre um piso granulado',
  },
  'label.view': {
    ko: '정방향 · 거꾸로',
    en: 'Forward · reversed',
    ja: '順方向 · 逆再生',
    zh: '正放 · 倒放',
    ar: 'أماميًا · معكوسًا',
    es: 'Hacia adelante · al revés',
    fr: 'Endroit · à rebours',
    hi: 'सीधा · उल्टा',
    id: 'Maju · mundur',
    pt: 'Para frente · ao contrário',
  },
  /** 재생 방향 표식 — 기호라 번역하지 않는다 (C1 판정 1). 글자 모양 선택자(U+FE0E)로 그림 글자가 되지 않게 한다. */
  'label.forward': {
    ko: '▶︎',
    en: '▶︎',
    ja: '▶︎',
    zh: '▶︎',
    ar: '▶︎',
    es: '▶︎',
    fr: '▶︎',
    hi: '▶︎',
    id: '▶︎',
    pt: '▶︎',
  },
  'label.reverse': {
    ko: '◀︎',
    en: '◀︎',
    ja: '◀︎',
    zh: '◀︎',
    ar: '◀︎',
    es: '◀︎',
    fr: '◀︎',
    hi: '◀︎',
    id: '◀︎',
    pt: '◀︎',
  },
  /** 처음 높이 점선의 표식 — 기호 (C1 판정 3). */
  'label.startHeight': {
    ko: 'h₀',
    en: 'h₀',
    ja: 'h₀',
    zh: 'h₀',
    ar: 'h₀',
    es: 'h₀',
    fr: 'h₀',
    hi: 'h₀',
    id: 'h₀',
    pt: 'h₀',
  },
  'caption.ready': {
    ko: '공을 놓기 직전. 바닥 알갱이들이 잔잔하게 떨고 있다.',
    en: 'Just before the ball is let go. The floor grains jiggle quietly.',
    ja: 'ボールを放す直前。床の粒が静かに揺れている。',
    zh: '即将放开球。地面的颗粒在轻轻抖动。',
    ar: 'قبيل إفلات الكرة. حبيبات الأرضية تهتز بهدوء.',
    es: 'Justo antes de soltar la pelota. Los granos del suelo se agitan suavemente.',
    fr: 'Juste avant de lâcher la balle. Les grains du sol s’agitent doucement.',
    hi: 'गेंद छोड़ने से ठीक पहले। फ़र्श के दाने धीरे-धीरे काँप रहे हैं।',
    id: 'Tepat sebelum bola dilepas. Butir-butir lantai bergetar pelan.',
    pt: 'Logo antes de soltar a bola. Os grãos do piso se agitam de leve.',
  },
  'caption.play': {
    ko: '공이 튈 때마다 덜 높이 오른다. 부딪힌 자리의 알갱이들이 세게 떨고, 그 떨림이 바닥 전체로 번진다.',
    en: 'Each bounce is lower than the last. Grains where it lands shake hard, and the shaking spreads through the floor.',
    ja: '跳ねるたびに前より低くなる。落ちた所の粒が激しく揺れ、その揺れが床全体に広がる。',
    zh: '每次弹起都比上一次低。落点处的颗粒剧烈抖动，这种抖动扩散到整个地面。',
    ar: 'كل ارتدادة أخفض من سابقتها. تهتز الحبيبات بشدة حيث تسقط الكرة، وينتشر الاهتزاز في الأرضية كلها.',
    es: 'Cada rebote es más bajo que el anterior. Los granos donde cae se agitan con fuerza, y la agitación se extiende por el suelo.',
    fr: 'Chaque rebond est plus bas que le précédent. Les grains où elle tombe s’agitent fort, et l’agitation se propage dans tout le sol.',
    hi: 'हर उछाल पिछले से नीचा है। जहाँ गेंद गिरती है वहाँ के दाने ज़ोर से काँपते हैं, और यह कंपन पूरे फ़र्श में फैल जाता है।',
    id: 'Setiap pantulan lebih rendah daripada sebelumnya. Butir di tempat bola jatuh bergetar kuat, dan getarannya menyebar ke seluruh lantai.',
    pt: 'Cada quique é mais baixo que o anterior. Os grãos onde ela cai se agitam com força, e a agitação se espalha pelo piso.',
  },
  'caption.settle': {
    ko: '공이 멈췄다. 바닥 알갱이들이 처음보다 세게, 고르게 떤다.',
    en: 'The ball has stopped. The floor grains jiggle harder than before, all over.',
    ja: 'ボールが止まった。床の粒は最初より強く、全体に揺れている。',
    zh: '球停下了。地面的颗粒比开始时抖得更厉害，而且遍布各处。',
    ar: 'توقفت الكرة. حبيبات الأرضية تهتز أشد مما كانت، في كل مكان.',
    es: 'La pelota se ha detenido. Los granos del suelo se agitan más que antes, por todas partes.',
    fr: 'La balle s’est arrêtée. Les grains du sol s’agitent plus fort qu’au début, partout.',
    hi: 'गेंद रुक गई है। फ़र्श के दाने पहले से ज़्यादा ज़ोर से, हर जगह काँप रहे हैं।',
    id: 'Bola sudah berhenti. Butir-butir lantai bergetar lebih kuat daripada semula, di mana-mana.',
    pt: 'A bola parou. Os grãos do piso se agitam mais que antes, por toda parte.',
  },
  'caption.turn': {
    ko: '같은 장면을 거꾸로 돌린다.',
    en: 'Now the same scene runs backwards.',
    ja: '今度は同じ場面を逆に再生する。',
    zh: '现在把同一个场景倒着放。',
    ar: 'الآن يُعرض المشهد نفسه بالعكس.',
    es: 'Ahora la misma escena corre hacia atrás.',
    fr: 'Maintenant, la même scène défile à rebours.',
    hi: 'अब वही दृश्य उल्टा चलता है।',
    id: 'Sekarang adegan yang sama diputar mundur.',
    pt: 'Agora a mesma cena passa ao contrário.',
  },
  'caption.rewindSettle': {
    ko: '멈춘 공 아래에서 바닥 곳곳의 알갱이들이 떨고 있다.',
    en: 'Under the resting ball, grains all over the floor are jiggling.',
    ja: '止まったボールの下で、床じゅうの粒が揺れている。',
    zh: '静止的球下方，整个地面的颗粒都在抖动。',
    ar: 'تحت الكرة الساكنة، تهتز الحبيبات في كل أرجاء الأرضية.',
    es: 'Bajo la pelota en reposo, los granos de todo el suelo se agitan.',
    fr: 'Sous la balle immobile, les grains de tout le sol s’agitent.',
    hi: 'रुकी हुई गेंद के नीचे पूरे फ़र्श के दाने काँप रहे हैं।',
    id: 'Di bawah bola yang diam, butir-butir di seluruh lantai bergetar.',
    pt: 'Sob a bola parada, os grãos de todo o piso se agitam.',
  },
  'caption.rewindPlay': {
    ko: '흩어져 있던 떨림이 공 밑 한 점으로 모여 공을 차 올린다. 공은 튈 때마다 더 높이 오른다.',
    en: 'Shaking from all over the floor gathers under the ball and kicks it up. Each bounce is higher than the last.',
    ja: '床じゅうの揺れがボールの下に集まり、ボールを蹴り上げる。跳ねるたびに前より高くなる。',
    zh: '来自整个地面的抖动汇聚到球下，把球踢起来。每次弹起都比上一次高。',
    ar: 'يتجمع الاهتزاز من كل أرجاء الأرضية تحت الكرة ويقذفها إلى أعلى. كل ارتدادة أعلى من سابقتها.',
    es: 'La agitación de todo el suelo se reúne bajo la pelota y la lanza hacia arriba. Cada rebote es más alto que el anterior.',
    fr: 'L’agitation venue de tout le sol se rassemble sous la balle et la projette vers le haut. Chaque rebond est plus haut que le précédent.',
    hi: 'पूरे फ़र्श का कंपन गेंद के नीचे इकट्ठा होकर उसे ऊपर उछाल देता है। हर उछाल पिछले से ऊँचा है।',
    id: 'Getaran dari seluruh lantai berkumpul di bawah bola dan menendangnya ke atas. Setiap pantulan lebih tinggi daripada sebelumnya.',
    pt: 'A agitação de todo o piso se junta sob a bola e a lança para cima. Cada quique é mais alto que o anterior.',
  },
  'caption.rewindReady': {
    ko: '공이 처음 높이에 멈춰 섰다. 바닥의 떨림은 처음처럼 잔잔하다.',
    en: 'The ball hangs still at its starting height. The floor jiggles quietly again.',
    ja: 'ボールが最初の高さで静止している。床はまた静かに揺れている。',
    zh: '球静止在起始高度。地面又轻轻抖动起来。',
    ar: 'تقف الكرة ساكنة عند ارتفاعها الأول. وتعود الأرضية تهتز بهدوء.',
    es: 'La pelota queda quieta a su altura inicial. El suelo vuelve a agitarse suavemente.',
    fr: 'La balle reste immobile à sa hauteur de départ. Le sol s’agite de nouveau doucement.',
    hi: 'गेंद अपनी शुरुआती ऊँचाई पर स्थिर है। फ़र्श फिर से धीरे-धीरे काँपता है।',
    id: 'Bola diam di ketinggian awalnya. Lantai kembali bergetar pelan.',
    pt: 'A bola fica parada na altura inicial. O piso volta a se agitar de leve.',
  },
  'caption.rewound': {
    ko: '처음 장면으로 돌아왔다. 재생 표식이 다시 정방향으로 바뀐다.',
    en: 'Back to the first frame. The marker turns back to forward.',
    ja: '最初の場面に戻った。再生マークが再び順方向に変わる。',
    zh: '回到第一帧。播放标记又变回正向。',
    ar: 'عدنا إلى اللقطة الأولى. تعود العلامة إلى الاتجاه الأمامي.',
    es: 'De vuelta al primer fotograma. El indicador vuelve a apuntar hacia adelante.',
    fr: 'Retour à la première image. Le repère repasse en lecture normale.',
    hi: 'पहले फ़्रेम पर वापस। चिह्न फिर से सीधी दिशा में बदल जाता है।',
    id: 'Kembali ke bingkai pertama. Penanda berubah lagi menjadi maju.',
    pt: 'De volta ao primeiro quadro. O marcador volta a indicar para frente.',
  },
} satisfies Record<string, LocalizedText>);

export type IrreversibilityMessageKey = keyof typeof irreversibilityMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: IrreversibilityMessageKey): LocalizedText =>
  irreversibilityMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: IrreversibilityMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const irreversibilitySchema: BundleSchema = {
  id: IRREVERSIBILITY_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 공이 떨어져 튀다 멈추고, 같은 장면이 거꾸로 돈다.
  parameters: [],

  /**
   * 공과 알갱이 바닥.
   *
   * - `gravity` 중력 가속도(m/s²) · `dropHeight` 공 아랫면의 처음 높이(m) · `restitution` 반발 계수 ·
   *   `ballRadius` 공 반지름(m).
   * - `grainCols` × `grainRows` 알갱이 격자, `grainSpacing` 알갱이 간격(m). 격자 윗줄이 바닥 윗면이다.
   * - `seed` 알갱이마다의 떨림 진동수 · 위상을 뽑는 난수 시드 (같은 시각 = 같은 화면).
   * - `jitterFreq` · `jitterFreqSpread` 떨림 각진동수의 가운데 값 · 퍼짐(rad/s).
   * - `baseJitter` 처음 바닥의 잔떨림 진폭(m), `heatJitter` 공의 처음 역학적 에너지를 알갱이 **하나가**
   *   다 받았을 때의 진폭(m). 둘 다 눈에 보이게 키운 **표시 배율**이다 — 실제 열운동은 보이지 않는다.
   * - `impactWidth` 부딪힌 순간 떨림이 모인 폭(m), `diffusivity` 그 떨림이 번지는 빠르기(m²/s).
   * - `heatShadeFull` 바닥 열 명암이 가득 차는 알갱이 하나의 몫(공의 처음 에너지에 대한 비) — 표시 배율.
   *   기본 0.04 에서 다 번진 뒤(몫 1/100)의 바닥은 4분의 1 짙기다.
   */
  stages: [
    {
      id: 'grainy-floor',
      label: text('label.stage'),
      constants: {
        gravity: 9.8,
        dropHeight: 1,
        restitution: 0.7,
        ballRadius: 0.1,
        grainCols: 25,
        grainRows: 4,
        grainSpacing: 0.13,
        seed: 7,
        jitterFreq: 22,
        jitterFreqSpread: 8,
        baseJitter: 0.004,
        heatJitter: 0.22,
        impactWidth: 0.07,
        diffusivity: 0.2,
        heatShadeFull: 0.04,
      },
    },
  ],

  environments: [],

  views: [{ id: 'forward-and-reversed', label: text('label.view'), default: true }],

  /** 가로로 넓은 바닥 위의 공 하나와 캡션 한두 줄. 세로가 비싸다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 바닥 열 명암이 알갱이 밑에, 공이 알갱이 위에 놓여야 한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 — 정방향 세 단계(`ready` · `play` · `settle`), 뒤집기(`turn`), 그것을 거꾸로 되짚는
   * 세 단계(`rewind-settle` · `rewind-play` · `rewind-ready`), 되감김(`rewound`).
   *
   * 장면의 시각(필름 시각)은 정방향 단계의 진행도 × 길이를 더하고 거꾸로 단계의 진행도 × **짝 정방향
   * 단계의 길이**를 뺀 값이다 — 거꾸로 단계의 길이는 되감는 빠르기만 바꾼다. `turn` · `rewound` 에는
   * 필름이 멈추고 재생 표식만 바뀐다. `rewound` 가 끝나면 필름이 처음 장면에 있어 다음 주기의
   * `ready` 와 이어진다 — 주기 끝에 사라졌다 나타나는 단계가 없다.
   *
   * `play` · `rewind-play` 는 반으로 느리게 흐른다 — 튀는 동안 알갱이 떨림이 번지고 모이는 것을
   * 눈으로 따라가게. 공은 `play` 길이(물리 시간) 안에 멈춰야 한다 — 기본 상수에서 약 2.6 초다.
   */
  timeline: {
    phases: [
      { id: 'ready', duration: 1.2, caption: key('caption.ready') },
      { id: 'play', duration: 3, timeScale: 0.5, caption: key('caption.play') },
      { id: 'settle', duration: 2.2, caption: key('caption.settle') },
      { id: 'turn', duration: 1.2, ease: 'smooth', caption: key('caption.turn') },
      { id: 'rewind-settle', duration: 2.2, caption: key('caption.rewindSettle') },
      { id: 'rewind-play', duration: 3, timeScale: 0.5, caption: key('caption.rewindPlay') },
      { id: 'rewind-ready', duration: 1.2, caption: key('caption.rewindReady') },
      { id: 'rewound', duration: 1.2, ease: 'smooth', caption: key('caption.rewound') },
    ],
  },

  /** 도착한 순간 이미 바닥이 떨고 있고 공은 곧 떨어진다 — `ready` 한가운데서 연다. */
  startAt: 0.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 왜 어색한지는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -6] },
    fontSize: 13,
    wrapWidth: 640,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: irreversibilityMessages,
};
