// ========================================================================
// brownian-motion — 선언
// ========================================================================
// 질문: 물에 뜬 꽃가루 알갱이는 왜 아무도 밀지 않는데 혼자 비틀거리나.
//
// 보이지 않는 작은 물 분자들이 사방에서 쉬지 않고 알갱이를 때린다. 때린 수가
// 사방에서 똑같지 않으므로, 한쪽에서 우연히 더 많이 맞는 순간 알갱이는 그
// 반대쪽으로 밀려 튄다. 보통 배율에서는 분자는 보이지 않고 알갱이의 비틀거리는
// 자취만 남는다.
//
// 걸음 거리의 제곱근 법칙(random-walk) · 퍼짐(diffusion) · 평균 자유 행로
// (mean-free-path)는 이 조각의 몫이 아니다. 여기서 일어나는 것은 「보이지 않는
// 것이 때려 보이는 것이 튄다」 하나다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:brownian-motion` 와 문자 그대로 일치한다 (C4). */
export const BROWNIAN_MOTION_ID = 'brownian-motion';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이 단위는 알갱이 반지름이다. 확대 창에서 월드 1 이 반지름 하나다.
// ------------------------------------------------------------------------

/** 충돌 목록을 뽑는 시드. 같은 시드 · 같은 시각은 언제나 같은 화면이다. */
export const SEED = 7;
/** 분자 질량(기준 1). */
export const MOLECULE_MASS = 1;
/** 알갱이 질량 — 분자 질량의 몇 배인가. 실제로는 훨씬 크다(NOTES (b)). */
export const GRAIN_MASS = 30;
/** 분자 속력(반지름/초). 확대 창에서 분자가 날아오는 속력이기도 하다. */
export const MOLECULE_SPEED = 6;
/** 알갱이 둘레를 때리는 분자의 초당 수. */
export const HIT_RATE = 20;
/** 충돌을 뽑는 칸의 길이(초). 칸마다 수가 `HIT_RATE × 길이` 로 정해진다. */
export const BIN_SECONDS = 0.5;
/** 물의 끌림 — 알갱이 속도가 초당 줄어드는 비율(1/초). */
export const DRAG = 4;
/** 비스듬히 들어오는 분자의 최대 기울기(라디안, 법선에서). */
export const MAX_TILT = 0.6;
/**
 * `kick` 단계 충돌 칸의 구성 — 많이 맞는 쪽 · 적게 맞는 쪽 충돌 수. 뽑아 고르지 않고 이 수대로
 * 구성해 「한쪽에서 때린 수가 우연히 더 많다」 가 모든 주기에서 참이다 (NOTES (b)).
 * 어느 쪽이 많이 맞는지(방향)는 (시드, 주기)에서 정한다.
 */
export const KICK_HEAVY = 10;
export const KICK_LIGHT = 2;
/** kick 충돌 자리가 축에서 벌어지는 최대 각(라디안). 튐 하한이 문턱에 못 미치면 physics 가 좁힌다. */
export const KICK_SPREAD = 0.9;
/**
 * 보통 배율 판에서 알갱이 경로를 키우는 배율(월드 / 반지름). 알갱이 점은 반지름
 * `PLAIN_GRAIN_R` 로 그리는데 경로는 이 배율로 그린다 — 몇 초 만에 눈에 띄게
 * 헤매도록 과장한 것이다 (NOTES (b)).
 */
export const PATH_SCALE = 1.2;
/** 보통 배율 판에 남기는 자취의 길이(초). */
export const TRAIL_SECONDS = 8;
/**
 * 확대 창이 알갱이를 따라가는 늦음(초). 창은 알갱이의 느린 떠돌이를 따라가고,
 * 빠른 튐만 창 안에서 알갱이의 움직임으로 남는다.
 */
export const TRACK_SECONDS = 1.5;
/**
 * kick 시작부터 튐 단계 끝까지 알갱이가 순 충격 쪽으로 움직이는 거리의 문턱(반지름).
 * 구성이 이 하한을 넘도록 kick 충돌의 벌림각을 정한다 — 「적게 맞은 쪽으로 튄다」 의 보장.
 */
export const KICK_MIN_SHIFT = 0.35;
/** 순 충격 화살표 길이 배율(월드 / (반지름/초)) — 한 칸 동안 얻은 속도에 곱한다. */
export const ARROW_SCALE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드. 왼쪽이 보통 배율 판, 오른쪽이 확대 창이다.
// ------------------------------------------------------------------------

/** 보통 배율 판(물). */
export const PLAIN = { minX: 0, maxX: 6.4, minY: 0, maxY: 4.4 } as const;
/** 확대 창. 가운데에 알갱이(반지름 1)가 온다. */
export const ZOOM = { minX: 7.2, maxX: 11.6, minY: 0, maxY: 4.4 } as const;
/** 보통 배율 판에 그리는 알갱이 점의 반지름(월드). 확대 창의 알갱이(1)와의 비가 확대율이다. */
export const PLAIN_GRAIN_R = 0.1;
/** 두 판 위 이름표 높이(월드). */
export const LABEL_Y = 4.62;

/**
 * 프레이밍은 주장의 일부다. 두 판과 그 위 이름표, 아래 캡션 줄까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.2, maxX: 11.8, minY: -0.95, maxY: 4.95 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const brownianMotionMessages = Object.freeze({
  'label.title': {
    ko: '브라운 운동',
    en: 'Brownian motion',
    ja: 'ブラウン運動',
    zh: '布朗运动',
    ar: 'الحركة البراونية',
    es: 'Movimiento browniano',
    fr: 'Mouvement brownien',
    hi: 'ब्राउनी गति',
    id: 'Gerak Brown',
    pt: 'Movimento browniano',
  },
  'label.operation': {
    ko: '분자 충돌이 만드는 무작위 운동',
    en: 'Random motion driven by molecular collisions',
    ja: '分子の衝突が引き起こす不規則な運動',
    zh: '由分子碰撞驱动的无规则运动',
    ar: 'حركة عشوائية تُحدثها التصادمات الجزيئية',
    es: 'Movimiento aleatorio impulsado por choques moleculares',
    fr: 'Mouvement aléatoire provoqué par les collisions moléculaires',
    hi: 'आण्विक टक्करों से होने वाली यादृच्छिक गति',
    id: 'Gerak acak yang digerakkan tumbukan molekul',
    pt: 'Movimento aleatório causado por colisões moleculares',
  },
  'label.stage': {
    ko: '물에 뜬 꽃가루 알갱이',
    en: 'A pollen grain in water',
    ja: '水に浮かぶ花粉の粒',
    zh: '水中的花粉颗粒',
    ar: 'حبة لقاح في الماء',
    es: 'Un grano de polen en el agua',
    fr: 'Un grain de pollen dans l’eau',
    hi: 'पानी में एक परागकण',
    id: 'Sebutir serbuk sari di air',
    pt: 'Um grão de pólen na água',
  },
  'label.view': {
    ko: '보통 배율과 확대',
    en: 'Ordinary and magnified',
    ja: '通常倍率と拡大',
    zh: '普通倍率与放大',
    ar: 'التكبير العادي والمكبَّر',
    es: 'Aumento normal y ampliado',
    fr: 'Grossissement ordinaire et agrandi',
    hi: 'सामान्य आवर्धन और आवर्धित',
    id: 'Perbesaran biasa dan diperbesar',
    pt: 'Ampliação comum e ampliada',
  },
  'label.plain': {
    ko: '보통 배율',
    en: 'ordinary magnification',
    ja: '通常倍率',
    zh: '普通倍率',
    ar: 'تكبير عادي',
    es: 'aumento normal',
    fr: 'grossissement ordinaire',
    hi: 'सामान्य आवर्धन',
    id: 'perbesaran biasa',
    pt: 'ampliação comum',
  },
  'label.zoom': {
    ko: '확대',
    en: 'magnified',
    ja: '拡大',
    zh: '放大',
    ar: 'مكبَّر',
    es: 'ampliado',
    fr: 'agrandi',
    hi: 'आवर्धित',
    id: 'diperbesar',
    pt: 'ampliado',
  },
  'caption.wander': {
    ko: '물에 뜬 꽃가루 알갱이가 혼자 비틀거린다 — 미는 것은 보이지 않는다',
    en: 'A pollen grain in water jitters about on its own — nothing pushing it can be seen',
    ja: '水に浮かぶ花粉の粒がひとりでにふらつく — 押しているものは見えない',
    zh: '水中的花粉颗粒自己晃来晃去 — 看不到任何推动它的东西',
    ar: 'حبة لقاح في الماء تترنح من تلقاء نفسها — ولا يُرى شيء يدفعها',
    es: 'Un grano de polen en el agua se agita por sí solo — no se ve nada que lo empuje',
    fr: 'Un grain de pollen dans l’eau s’agite tout seul — on ne voit rien qui le pousse',
    hi: 'पानी में एक परागकण अपने-आप डगमगाता है — उसे धकेलने वाला कुछ दिखाई नहीं देता',
    id: 'Sebutir serbuk sari di air bergoyang sendiri — tak terlihat apa pun yang mendorongnya',
    pt: 'Um grão de pólen na água se agita sozinho — não se vê nada que o empurre',
  },
  'caption.open': {
    ko: '알갱이 둘레를 크게 확대한다',
    en: 'Zooming in close around the grain',
    ja: '粒のまわりを大きく拡大する',
    zh: '把颗粒周围大幅放大',
    ar: 'تكبير المنطقة المحيطة بالحبة عن قرب',
    es: 'Ampliando de cerca alrededor del grano',
    fr: 'Zoom rapproché autour du grain',
    hi: 'कण के आस-पास के हिस्से को पास से आवर्धित किया जाता है',
    id: 'Memperbesar dari dekat di sekitar butir',
    pt: 'Ampliando de perto em torno do grão',
  },
  'caption.bombard': {
    ko: '보이지 않던 물 분자들이 사방에서 쉬지 않고 알갱이를 때린다',
    en: 'Water molecules, invisible before, strike the grain from every side without pause',
    ja: '見えなかった水分子が、四方八方から休みなく粒をたたく',
    zh: '之前看不见的水分子从四面八方不停地撞击颗粒',
    ar: 'جزيئات الماء، التي لم تكن تُرى من قبل، تصطدم بالحبة من كل جانب دون توقف',
    es: 'Las moléculas de agua, antes invisibles, golpean el grano por todos lados sin pausa',
    fr: 'Les molécules d’eau, invisibles jusque-là, frappent le grain de tous côtés sans relâche',
    hi: 'पहले अदृश्य रहे पानी के अणु हर ओर से बिना रुके कण से टकराते हैं',
    id: 'Molekul air, yang tadinya tak terlihat, menumbuk butir dari segala sisi tanpa henti',
    pt: 'As moléculas de água, antes invisíveis, atingem o grão por todos os lados sem parar',
  },
  'caption.kick': {
    ko: '이번에는 한쪽에서 때린 수가 우연히 더 많다',
    en: 'This time, by chance, more of them strike from one side',
    ja: '今回は偶然、一方の側からたたく数のほうが多い',
    zh: '这一次，碰巧从一侧撞击的更多',
    ar: 'هذه المرة، وبالمصادفة، يصطدم منها عدد أكبر من جهة واحدة',
    es: 'Esta vez, por azar, golpean más desde un lado',
    fr: 'Cette fois, par hasard, davantage frappent d’un même côté',
    hi: 'इस बार संयोग से एक ओर से ज़्यादा अणु टकराते हैं',
    id: 'Kali ini, secara kebetulan, lebih banyak yang menumbuk dari satu sisi',
    pt: 'Desta vez, por acaso, mais delas atingem de um lado',
  },
  'caption.push': {
    ko: '알갱이가 적게 맞은 쪽으로 튄다',
    en: 'The grain jumps toward the side that was struck less',
    ja: '粒は、たたかれた数が少ない側へ跳ぶ',
    zh: '颗粒向被撞击较少的一侧跳去',
    ar: 'تقفز الحبة نحو الجهة التي تلقّت اصطدامات أقل',
    es: 'El grano salta hacia el lado que recibió menos golpes',
    fr: 'Le grain saute vers le côté le moins frappé',
    hi: 'कण उस ओर उछलता है जिस ओर कम टक्करें लगीं',
    id: 'Butir melompat ke arah sisi yang lebih sedikit ditumbuk',
    pt: 'O grão salta para o lado que foi menos atingido',
  },
  'caption.settle': {
    ko: '다시 사방에서 맞으며 비틀거림이 이어진다',
    en: 'Struck from every side again, the grain keeps jittering',
    ja: '再び四方からたたかれ、粒はふらつき続ける',
    zh: '颗粒再次受到四面八方的撞击，继续晃动',
    ar: 'تتلقى الحبة الاصطدامات من كل جانب مجددًا، فتستمر في الترنح',
    es: 'Golpeado de nuevo por todos lados, el grano sigue agitándose',
    fr: 'Frappé de nouveau de tous côtés, le grain continue de s’agiter',
    hi: 'फिर से हर ओर से टक्करें खाकर कण डगमगाता रहता है',
    id: 'Ditumbuk lagi dari segala sisi, butir terus bergoyang',
    pt: 'Atingido de novo por todos os lados, o grão continua se agitando',
  },
} satisfies Record<string, LocalizedText>);

export type BrownianMotionMessageKey = keyof typeof brownianMotionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: BrownianMotionMessageKey): LocalizedText => brownianMotionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BrownianMotionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const brownianMotionSchema: BundleSchema = {
  id: BROWNIAN_MOTION_ID,
  label: text('label.title'),
  category: 'thermal',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 알갱이가 비틀거리고, 창이 열려 까닭을 보이고, 다시 닫힌다.
  parameters: [],

  stages: [
    {
      id: 'pollen-in-water',
      label: text('label.stage'),
      constants: {
        seed: SEED,
        moleculeMass: MOLECULE_MASS,
        grainMass: GRAIN_MASS,
        moleculeSpeed: MOLECULE_SPEED,
        hitRate: HIT_RATE,
        binSeconds: BIN_SECONDS,
        drag: DRAG,
        maxTilt: MAX_TILT,
        kickHeavy: KICK_HEAVY,
        kickLight: KICK_LIGHT,
        kickSpread: KICK_SPREAD,
        pathScale: PATH_SCALE,
        trailSeconds: TRAIL_SECONDS,
        trackSeconds: TRACK_SECONDS,
        arrowScale: ARROW_SCALE,
        kickMinShift: KICK_MIN_SHIFT,
      },
    },
  ],

  environments: [],

  views: [{ id: 'two-scales', label: text('label.view'), default: true }],

  /** 가로 12 · 세로 5.9 월드. 두 판을 나란히 둔다 — 세로가 비싸다. */
  canvas: { height: 360, minHeight: 320 },

  /**
   * 쓴 순서대로 그린다. 확대 창의 물(`region`)이 층 순서로는 물체 위에 덮여 창 속 알갱이 ·
   * 분자가 가려진다 — 이 그림에서 물은 비쳐 보이는 매질이 아니라 창의 바탕이다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 헤맴 → 창이 열림 → 사방의 두드림 → 한쪽이 많은 칸(느리게) → 튐(느리게)
   * → 다시 두드림 → 창이 닫힘. 충돌은 창이 닫혀 있을 때도 일어난다 — 알갱이를 헤매게
   * 하는 것이 바로 그것이다. 창은 그것을 보여 줄 뿐이다.
   */
  timeline: {
    phases: [
      { id: 'wander', duration: 3.2, caption: key('caption.wander') },
      { id: 'open', duration: 0.6, ease: 'smooth', caption: key('caption.open') },
      { id: 'bombard', duration: 2.8, caption: key('caption.bombard') },
      { id: 'kick', duration: 0.6, timeScale: 0.3, caption: key('caption.kick') },
      { id: 'push', duration: 0.8, timeScale: 0.5, caption: key('caption.push') },
      { id: 'settle', duration: 1.4, caption: key('caption.settle') },
      { id: 'close', duration: 0.6, ease: 'smooth', caption: key('caption.wander') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 알갱이가 자취를 끌며 헤매는 중이다. */
  startAt: 1,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 법칙은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **어느 쪽이 더 맞았나**다. */

  messages: brownianMotionMessages,
};
