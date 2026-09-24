// ========================================================================
// orbital-transfer — 선언
// ========================================================================
// 질문: 낮은 원 궤도에서 높은 원 궤도로 옮기려면 어떻게 미는가 — 그리고 올라가면 빨라지는가.
//
// 호만 전이. 한 우주선이 낮은 원 궤도를 돈다. 진행 방향으로 한 번 밀면(Δv₁) 그 자리가 가장
// 가까운 점인 타원(전이 궤도)이 되고, 반 바퀴를 날아 가장 먼 점에 닿았을 때 다시 한 번 밀면(Δv₂)
// 높은 원 궤도가 된다. 올라가는 동안 속도는 오히려 줄고, 높은 원 궤도의 속도는 낮은 쪽보다
// 느리다 — 두 번 밀었는데 느려졌다.
//
// 「옆으로 쏘는 속도만 바꾼 다섯 궤적」 은 `orbital-velocity` 의 몫이다. 이 조각은 궤적을 겹쳐
// 견주지 않고 **한 우주선의 두 번 밀기** 에 머문다. 견줄 것은 궤적의 모양이 아니라 속도 화살표의
// 길이 — 그래서 밀지 않고 낮은 궤도를 계속 돈 쌍둥이(옅은 점)를 곁에 둔다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:orbital-transfer` 와 문자 그대로 일치한다 (C4). */
export const ORBITAL_TRANSFER_ID = 'orbital-transfer';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 길이는 월드 단위다.
// ------------------------------------------------------------------------

/** 중력 상수 × 행성 질량(월드 단위계). 속도 · 주기가 이 값에서 나온다. */
export const GM = 1;
/** 낮은 원 궤도 반지름(월드). 첫 번째 밀기가 여기서 일어난다. */
export const INNER_RADIUS = 1;
/** 높은 원 궤도 반지름(월드). 전이 궤도의 가장 먼 점이고, 두 번째 밀기가 여기서 일어난다. */
export const OUTER_RADIUS = 3;
/** 행성 반지름(월드). 크기만 보이는 배경이다 — 궤도에는 들어가지 않는다. */
export const PLANET_RADIUS = 0.5;

// ------------------------------------------------------------------------
// 표현 — 스테이지 상수의 기본값이다.
// ------------------------------------------------------------------------

/**
 * 낮은 원 궤도 한 바퀴의 화면 시간(초). 모든 비행이 **같은 배율**로 흐른다 — 느려진 우주선은
 * 화면에서도 느리게 간다. 전이 단계 길이는 이 배율로 잰 반 바퀴 비행(약 5.09 초)에 맞춘다.
 */
export const LOW_LAP_SECONDS = 3.6;
/** 속도 화살표 길이(월드 per 속도). 낮은 원 궤도 속도가 2 월드 — Δv 가 눈에 보이려면 화살표가 길어야 한다. */
export const ARROW_PER_SPEED = 2;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 행성 중심이 원점, 첫 밀기 자리가 (0, −INNER_RADIUS) 다.
// ------------------------------------------------------------------------

/** 캡션이 서는 자리(월드). 궤도들 왼쪽 빈자리다. */
export const CAPTION_AT: readonly [number, number] = [-7.6, 0.9];

/**
 * 프레이밍은 주장의 일부다. 세로는 높은 원 궤도 위 Δv₂ 글자부터 높은 원 궤도 아래까지, 가로는
 * 왼쪽 캡션부터 높은 원 궤도 오른쪽까지. 높은 궤도가 처음부터 들어가 있다 — 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -7.8, maxX: 3.25, minY: -3.2, maxY: 3.45 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const orbitalTransferMessages = Object.freeze({
  'label.title': {
    ko: '궤도 전이',
    en: 'Orbital transfer',
    ja: '軌道遷移',
    zh: '轨道转移',
    ar: 'الانتقال المداري',
    es: 'Transferencia orbital',
    fr: 'Transfert orbital',
    hi: 'कक्षीय स्थानांतरण',
    id: 'Transfer orbit',
    pt: 'Transferência orbital',
  },
  'label.operation': {
    ko: '호만 전이와 그 비용',
    en: 'The Hohmann transfer and what it costs',
    ja: 'ホーマン遷移とそのコスト',
    zh: '霍曼转移及其代价',
    ar: 'انتقال هوهمان وكلفته',
    es: 'La transferencia de Hohmann y lo que cuesta',
    fr: 'Le transfert de Hohmann et ce qu’il coûte',
    hi: 'होमान स्थानांतरण और उसकी लागत',
    id: 'Transfer Hohmann dan biayanya',
    pt: 'A transferência de Hohmann e o que ela custa',
  },
  'label.stage': {
    ko: '호만 전이',
    en: 'Hohmann transfer',
    ja: 'ホーマン遷移',
    zh: '霍曼转移',
    ar: 'انتقال هوهمان',
    es: 'Transferencia de Hohmann',
    fr: 'Transfert de Hohmann',
    hi: 'होमान स्थानांतरण',
    id: 'Transfer Hohmann',
    pt: 'Transferência de Hohmann',
  },
  'label.view': {
    ko: '두 번 밀기',
    en: 'Two pushes',
    ja: '二度押す',
    zh: '两次推动',
    ar: 'دفعتان',
    es: 'Dos empujones',
    fr: 'Deux poussées',
    hi: 'दो धक्के',
    id: 'Dua dorongan',
    pt: 'Dois empurrões',
  },
  /** 밀기 화살표의 기호 — 수식 표기라 두 언어가 같다 (C1 표식). */
  'label.dv1': {
    ko: 'Δv₁',
    en: 'Δv₁',
    ja: 'Δv₁',
    zh: 'Δv₁',
    ar: 'Δv₁',
    es: 'Δv₁',
    fr: 'Δv₁',
    hi: 'Δv₁',
    id: 'Δv₁',
    pt: 'Δv₁',
  },
  'label.dv2': {
    ko: 'Δv₂',
    en: 'Δv₂',
    ja: 'Δv₂',
    zh: 'Δv₂',
    ar: 'Δv₂',
    es: 'Δv₂',
    fr: 'Δv₂',
    hi: 'Δv₂',
    id: 'Δv₂',
    pt: 'Δv₂',
  },
  'caption.low': {
    ko: '낮은 원 궤도를 도는 우주선 — 화살표의 길이가 빠르기다',
    en: 'A spacecraft circles in a low orbit — the arrow’s length is its speed',
    ja: '低い円軌道を回る宇宙船 — 矢印の長さが速さだ',
    zh: '在低圆轨道上运行的航天器 — 箭头的长度就是它的速率',
    ar: 'مركبة فضائية تدور في مدار منخفض — طول السهم هو سرعتها',
    es: 'Una nave espacial gira en una órbita baja — la longitud de la flecha es su rapidez',
    fr: 'Un vaisseau spatial tourne sur une orbite basse — la longueur de la flèche, c’est sa vitesse',
    hi: 'निम्न कक्षा में चक्कर लगाता अंतरिक्ष यान — तीर की लंबाई ही उसकी चाल है',
    id: 'Wahana antariksa mengitari orbit rendah — panjang panah adalah kelajuannya',
    pt: 'Uma nave espacial circula numa órbita baixa — o comprimento da seta é a sua velocidade',
  },
  'caption.burn1': {
    ko: '진행 방향으로 한 번 민다 — 빨라진다',
    en: 'One push along the direction of travel — it speeds up',
    ja: '進行方向に一度押す — 速くなる',
    zh: '沿运动方向推一次 — 它变快了',
    ar: 'دفعة واحدة في اتجاه الحركة — فتزداد سرعتها',
    es: 'Un empujón en la dirección del movimiento — se acelera',
    fr: 'Une poussée dans le sens du déplacement — il accélère',
    hi: 'चलने की दिशा में एक धक्का — यान तेज़ हो जाता है',
    id: 'Satu dorongan searah gerak — ia menjadi lebih cepat',
    pt: 'Um empurrão no sentido do movimento — ela acelera',
  },
  'caption.transfer': {
    ko: '타원을 따라 올라가는 동안 점점 느려진다 — 밀지 않고 낮은 궤도에 남은 옅은 점보다도 느리다',
    en: 'Climbing along the ellipse, it slows down — soon slower than the faint twin that stayed in the low orbit unpushed',
    ja: '楕円に沿って上るあいだに遅くなっていく — やがて、押されずに低い軌道に残った淡い双子よりも遅くなる',
    zh: '沿椭圆上升时它逐渐变慢 — 很快就比那个没被推动、留在低轨道上的浅色双胞胎还慢',
    ar: 'وهي تصعد على طول القطع الناقص تتباطأ — وسرعان ما تصبح أبطأ من التوأم الباهت الذي بقي في المدار المنخفض دون دفع',
    es: 'Al subir por la elipse se frena — pronto va más lenta que su gemela tenue, que se quedó en la órbita baja sin empuje',
    fr: 'En montant le long de l’ellipse, il ralentit — bientôt plus lent que le jumeau pâle resté sur l’orbite basse sans poussée',
    hi: 'दीर्घवृत्त पर ऊपर चढ़ते हुए वह धीमा होता है — जल्द ही उस हल्के जुड़वाँ से भी धीमा, जो बिना धक्के के निम्न कक्षा में रह गया',
    id: 'Saat naik menyusuri elips, ia melambat — segera lebih lambat daripada kembarannya yang samar, yang tetap di orbit rendah tanpa didorong',
    pt: 'Subindo pela elipse, ela desacelera — logo fica mais lenta que a gêmea esmaecida que ficou na órbita baixa sem empurrão',
  },
  'caption.burn2': {
    ko: '반 바퀴 뒤 가장 높은 곳에서 한 번 더 민다',
    en: 'Half a lap later, at the highest point, one more push',
    ja: '半周後、いちばん高い所でもう一度押す',
    zh: '半圈之后，在最高点再推一次',
    ar: 'بعد نصف دورة، عند أعلى نقطة، دفعة أخرى',
    es: 'Media vuelta después, en el punto más alto, otro empujón',
    fr: 'Un demi-tour plus tard, au point le plus haut, une nouvelle poussée',
    hi: 'आधे चक्कर बाद, सबसे ऊँचे बिंदु पर, एक और धक्का',
    id: 'Setengah putaran kemudian, di titik tertinggi, satu dorongan lagi',
    pt: 'Meia volta depois, no ponto mais alto, mais um empurrão',
  },
  'caption.high': {
    ko: '높은 원 궤도에 올라섰다 — 두 번 밀었는데 처음보다 느리게 돈다',
    en: 'Now in the high circular orbit — pushed twice, yet it moves slower than at the start',
    ja: '高い円軌道に乗った — 二度押したのに、最初より遅く回る',
    zh: '现在进入了高圆轨道 — 推了两次，却比一开始转得更慢',
    ar: 'الآن في المدار الدائري المرتفع — دُفعت مرتين، ومع ذلك تتحرك أبطأ مما كانت في البداية',
    es: 'Ya en la órbita circular alta — con dos empujones, y aun así se mueve más lenta que al principio',
    fr: 'Le voici sur l’orbite circulaire haute — poussé deux fois, il va pourtant moins vite qu’au départ',
    hi: 'अब ऊँची वृत्ताकार कक्षा में — दो बार धक्का मिला, फिर भी शुरुआत से धीमा चलता है',
    id: 'Kini di orbit melingkar tinggi — sudah didorong dua kali, tetapi bergerak lebih lambat daripada semula',
    pt: 'Agora na órbita circular alta — empurrada duas vezes, mas se move mais devagar que no início',
  },
  'caption.cost': {
    ko: '옮겨 가는 데 든 것은 짧은 두 번의 밀기(Δv₁ · Δv₂)뿐이다',
    en: 'All the move took was two short pushes (Δv₁ and Δv₂)',
    ja: '移るのに要したのは、短く二度押すこと(Δv₁ と Δv₂)だけだ',
    zh: '这次转移只用了两次短暂的推动（Δv₁ 和 Δv₂）',
    ar: 'كل ما تطلّبه الانتقال دفعتان قصيرتان (Δv₁ و Δv₂)',
    es: 'Todo el traslado solo requirió dos empujones breves (Δv₁ y Δv₂)',
    fr: 'Tout le transfert n’a demandé que deux brèves poussées (Δv₁ et Δv₂)',
    hi: 'इस स्थानांतरण में बस दो छोटे धक्के लगे (Δv₁ और Δv₂)',
    id: 'Perpindahan ini hanya butuh dua dorongan singkat (Δv₁ dan Δv₂)',
    pt: 'A mudança toda só exigiu dois empurrões curtos (Δv₁ e Δv₂)',
  },
} satisfies Record<string, LocalizedText>);

export type OrbitalTransferMessageKey = keyof typeof orbitalTransferMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: OrbitalTransferMessageKey): LocalizedText => orbitalTransferMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: OrbitalTransferMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const orbitalTransferSchema: BundleSchema = {
  id: ORBITAL_TRANSFER_ID,
  label: text('label.title'),
  category: 'astro',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다. 두 번의 밀기는 정해진 자리 · 정해진 크기에서만 원에서 원으로 옮긴다 —
  // 독자가 밀기를 바꿔 보게 하면 「밀었는데 느려진다」 가 아니라 과녁 맞히기가 된다.
  parameters: [],

  stages: [
    {
      id: 'hohmann',
      label: text('label.stage'),
      constants: {
        gm: GM,
        innerRadius: INNER_RADIUS,
        outerRadius: OUTER_RADIUS,
        planetRadius: PLANET_RADIUS,
        lowLapSeconds: LOW_LAP_SECONDS,
        arrowPerSpeed: ARROW_PER_SPEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'two-pushes', label: text('label.view'), default: true }],

  /** 궤도는 오른쪽, 캡션은 왼쪽 빈자리 — 세로가 비싸다 (S-piece). */
  canvas: { height: 420, minHeight: 340 },

  /** 안내 원 · 자취 · 화살표 · 우주선의 겹침 순서가 뜻을 갖는다 — 우주선이 맨 위. */
  drawOrder: 'scene',

  /**
   * - `low` — 낮은 원 궤도 반 바퀴. 끝나는 순간 우주선이 첫 밀기 자리(아래)에 닿는다.
   * - `burn1` — 우주선이 멈춘 채 속도 화살표 끝에 Δv₁ 이 자란다(밀기를 눈으로 보는 느린 순간).
   * - `transfer` — 전이 타원 반 바퀴. 낮은 궤도와 같은 화면 배율로 잰 비행이 약 5.09 초라 거기에 맞춘다.
   * - `burn2` — 가장 먼 점(위)에서 Δv₂ 가 자란다.
   * - `high` · `hold` — 높은 원 궤도를 돈다. `fade` — 자취가 흐려지고 다음 주기로.
   *
   * 전이 단계를 비행보다 짧게 줄이면 우주선이 가장 먼 점에 닿기 전에 두 번째 밀기가 온다(장부 G13).
   */
  timeline: {
    phases: [
      { id: 'low', duration: 1.8, caption: key('caption.low') },
      { id: 'burn1', duration: 1.4, ease: 'smooth', caption: key('caption.burn1') },
      { id: 'transfer', duration: 5.1, caption: key('caption.transfer') },
      { id: 'burn2', duration: 1.4, ease: 'smooth', caption: key('caption.burn2') },
      { id: 'high', duration: 3.6, caption: key('caption.high') },
      { id: 'hold', duration: 3.2, caption: key('caption.cost') },
      { id: 'fade', duration: 0.7, caption: key('caption.cost') },
    ],
  },

  /** 도착한 순간 우주선이 이미 낮은 궤도를 돌고 있다. */
  startAt: 0.4,

  // 슬롯 하나. 궤도들 왼쪽 빈자리에 세운다 — 그림에 딸린 자리라 월드 앵커다.
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    wrapWidth: 240,
    fade: 0.3,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 읽을 것은 거리가 아니라 화살표 길이의 변화다. */

  messages: orbitalTransferMessages,
};
