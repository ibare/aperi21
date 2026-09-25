// ========================================================================
// vertical-loop — 선언
// ========================================================================
// 질문: 꼭대기에서 속력이 모자라면 왜 떨어지나 — 속력이 모자라다는 게 화면에서
// 무엇으로 드러나나?
// 답의 동사: 레일을 떠나 떨어진다.
//
// 들어온 속력만 다른 두 공을 나란히 고리에 넣는다. 느린 공은 꼭대기 전에 레일이
// 미는 힘이 0 이 되어 레일을 떠나 포물선으로 떨어지고, 빠른 공은 꼭대기에서도
// 최소 속력 기준보다 빨라 레일에 눌린 채 계속 돈다.
// 원본: tasks/piece-lab/vertical-loop
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';
import { CYCLE, FAIL_IMPACT, FAIL_SEP, G } from './physics';

/** 등록 키 `aperi21:vertical-loop` 와 문자 그대로 일치한다 (C4). */
export const VERTICAL_LOOP_ID = 'vertical-loop';

// ------------------------------------------------------------------------
// 기하 — 월드 1 단위 = 공 중심이 도는 원의 반지름. 고리 중심이 y = 0, y 는 위.
//
// 원본은 가로 900 px 캔버스에서 공 중심 원 반지름이 106.5 px 였다(레일 118 − 공 10
// − 1.5). 아래 값은 그 화면 px 를 106.5 로 나눈 것이다.
// ------------------------------------------------------------------------

/** 원본 화면에서 월드 1 단위의 길이(px). 화면 px 로 적힌 원본 치수를 옮길 때만 쓴다. */
const ORIGINAL_PX = 106.5;

/** 두 고리 중심의 x. 원본 W·0.28 / W·0.72 → 가운데에서 ±198 px. */
export const LOOPS: readonly { id: 'pass' | 'fail'; x: number }[] = [
  { id: 'pass', x: -198 / ORIGINAL_PX },
  { id: 'fail', x: 198 / ORIGINAL_PX },
];
/** 레일(회색 원) 반지름. 원본 118 px. */
export const RAIL_RADIUS = 118 / ORIGINAL_PX;
/** 공 반지름. 원본 BALL_R = 10 px. */
export const BALL_RADIUS = 10 / ORIGINAL_PX;
/** 꼭대기 최소 속력 기준 화살표의 높이 — 레일 꼭대기에서 14 px 위. */
export const REFERENCE_Y = RAIL_RADIUS + 14 / ORIGINAL_PX;
/** 속력 1 이 차지하는 월드 길이. 원본 √(gR) → 38 px. 기준 화살표와 공의 화살표가 같은 자를 쓴다. */
export const SPEED_SCALE = 38 / Math.sqrt(G) / ORIGINAL_PX;
/** 수직항력(질량당) 1 이 차지하는 월드 길이. 원본 g → 14 px. */
export const NORMAL_SCALE = 14 / G / ORIGINAL_PX;
/** 힘 화살표 이름표를 붙이는 최소 길이. 원본 22 px. */
export const NORMAL_LABEL_MIN = 22 / ORIGINAL_PX;
/** 화살촉 크기. 원본 최대 9 px. */
export const ARROW_HEAD = 9 / ORIGINAL_PX;
/** 레일을 떠난 지점 고리 반지름. 원본 BALL_R + 5 = 15 px. */
export const SEP_RING_RADIUS = 15 / ORIGINAL_PX;

/**
 * 프레이밍 — 고정 경계. 위는 기준 화살표 이름표(원본 y 34 px), 아래는 공 이름표(원본
 * y 324 px) 밑에 캡션 한 줄 자리까지. 세로가 배율을 정해 원본과 같은 106.5 px/단위가 된다
 * (캔버스 420, 여백 36 씩). 가로는 이름표 「레일을 떠남」 까지 담는다.
 */
export const SCENE_BOUNDS = { minX: -3.6, maxX: 3.6, minY: -1.77, maxY: 1.5 } as const;

// ------------------------------------------------------------------------
// 연출 — 순환 6 초. 캡션 전환 시각은 느린 공의 사건 시각에서 나온다
// ------------------------------------------------------------------------

/** 느린 공이 레일을 떠나기 이만큼 앞서 캡션이 바뀐다(초). 원본 0.3. */
const LEAVE_CAPTION_LEAD = 0.3;
/** 순환 끝에서 떨어진 공과 그 흔적이 흐려지는 시간(초). 원본 0.4. */
const FADE_OUT = 0.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const verticalLoopMessages = Object.freeze({
  'label.title': {
    ko: '연직 원운동',
    en: 'Vertical loop',
    ja: '鉛直ループ',
    zh: '竖直圆环轨道',
    ar: 'الحلقة الرأسية',
    es: 'Rizo vertical',
    fr: 'Looping vertical',
    hi: 'ऊर्ध्वाधर लूप',
    id: 'Lintasan loop vertikal',
    pt: 'Loop vertical',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '고리를 돌기에 속력이 모자라면 레일을 떠나는 자리',
    en: 'The point where a body leaves the rail when it is too slow to go round the loop',
    ja: '輪を回るには速さが足りないとき、レールを離れる位置',
    zh: '速度不足以绕过圆环时离开轨道的位置',
    ar: 'النقطة التي يترك عندها الجسم القضيب حين تكون سرعته غير كافية للدوران في الحلقة',
    es: 'El punto donde un cuerpo deja el riel cuando no tiene rapidez suficiente para dar la vuelta al rizo',
    fr: 'L’endroit où un corps quitte le rail quand il est trop lent pour faire le tour de la boucle',
    hi: 'वह स्थान जहाँ पिंड लूप का चक्कर लगाने लायक चाल न होने पर पटरी छोड़ देता है',
    id: 'Titik tempat benda meninggalkan rel ketika kelajuannya tidak cukup untuk memutari lingkaran',
    pt: 'O ponto em que um corpo deixa o trilho quando não tem velocidade suficiente para dar a volta ao loop',
  },
  'label.stage': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.view': {
    ko: '기본',
    en: 'Default',
    ja: '標準',
    zh: '默认',
    ar: 'افتراضي',
    es: 'Predeterminada',
    fr: 'Par défaut',
    hi: 'डिफ़ॉल्ट',
    id: 'Bawaan',
    pt: 'Padrão',
  },
  'label.minSpeed': {
    ko: '꼭대기에서 필요한 최소 속력',
    en: 'Minimum speed needed at the top',
    ja: '頂上で必要な最小の速さ',
    zh: '最高点所需的最小速率',
    ar: 'أقل سرعة لازمة عند القمة',
    es: 'Rapidez mínima necesaria en lo más alto',
    fr: 'Vitesse minimale nécessaire au sommet',
    hi: 'शीर्ष पर आवश्यक न्यूनतम चाल',
    id: 'Kelajuan minimum yang diperlukan di puncak',
    pt: 'Velocidade mínima necessária no topo',
  },
  'label.normal': {
    ko: '레일이 미는 힘',
    en: 'Push from the rail',
    ja: 'レールが押す力',
    zh: '轨道的推力',
    ar: 'دفع السكة',
    es: 'Empuje del riel',
    fr: 'Poussée du rail',
    hi: 'पटरी का धक्का',
    id: 'Dorongan rel',
    pt: 'Empurrão do trilho',
  },
  'label.leftRail': {
    ko: '레일을 떠남',
    en: 'Leaves the rail',
    ja: 'レールを離れる',
    zh: '离开轨道',
    ar: 'تغادر السكة',
    es: 'Deja el riel',
    fr: 'Quitte le rail',
    hi: 'पटरी छोड़ देती है',
    id: 'Meninggalkan rel',
    pt: 'Deixa o trilho',
  },
  'label.fastBall': {
    ko: '빠르게 들어온 공',
    en: 'Ball that came in fast',
    ja: '速く入ってきた球',
    zh: '较快进入的小球',
    ar: 'كرة دخلت بسرعة',
    es: 'Bola que entró rápido',
    fr: 'Bille entrée vite',
    hi: 'तेज़ी से आई गेंद',
    id: 'Bola yang masuk dengan cepat',
    pt: 'Bola que entrou rápido',
  },
  'label.slowBall': {
    ko: '조금 느리게 들어온 공',
    en: 'Ball that came in a little slower',
    ja: '少し遅く入ってきた球',
    zh: '稍慢进入的小球',
    ar: 'كرة دخلت أبطأ قليلًا',
    es: 'Bola que entró un poco más lenta',
    fr: 'Bille entrée un peu moins vite',
    hi: 'थोड़ी धीमी आई गेंद',
    id: 'Bola yang masuk sedikit lebih lambat',
    pt: 'Bola que entrou um pouco mais devagar',
  },
  'caption.rise': {
    ko: '두 공 모두 레일에 눌린 채 올라간다 — 높아질수록 느려지고, 레일이 미는 힘도 줄어든다',
    en: 'Both balls climb pressed against the rail — the higher they go, the slower they move and the weaker the rail pushes',
    ja: '二つの球はどちらもレールに押しつけられたまま上る — 高くなるほど遅くなり、レールが押す力も弱まる',
    zh: '两个小球都贴着轨道向上爬 — 越高越慢，轨道的推力也越弱',
    ar: 'تصعد الكرتان مضغوطتين على السكة — كلما ارتفعتا تباطأتا وضعف دفع السكة',
    es: 'Ambas bolas suben apretadas contra el riel — cuanto más alto, más lentas van y más débil empuja el riel',
    fr: 'Les deux billes montent plaquées contre le rail — plus elles montent, plus elles ralentissent et plus la poussée du rail faiblit',
    hi: 'दोनों गेंदें पटरी से दबी हुई ऊपर चढ़ती हैं — जितनी ऊँची जाती हैं, उतनी धीमी होती हैं और पटरी का धक्का उतना कमज़ोर होता है',
    id: 'Kedua bola naik sambil tertekan ke rel — makin tinggi, makin lambat geraknya dan makin lemah dorongan rel',
    pt: 'As duas bolas sobem pressionadas contra o trilho — quanto mais alto, mais devagar vão e mais fraco o trilho empurra',
  },
  'caption.leave': {
    ko: '오른쪽 공은 레일이 미는 힘이 0 이 되자 꼭대기에 닿기 전에 레일을 떠나 떨어진다',
    en: 'When the rail’s push on the right ball reaches zero, it leaves the rail before the top and falls',
    ja: '右の球はレールが押す力が 0 になると、頂上に届く前にレールを離れて落ちる',
    zh: '当轨道对右边小球的推力降为 0 时，它在到达最高点之前离开轨道落下',
    ar: 'عندما يبلغ دفع السكة على الكرة اليمنى الصفر، تغادر السكة قبل القمة وتسقط',
    es: 'Cuando el empuje del riel sobre la bola derecha llega a cero, esta deja el riel antes de lo más alto y cae',
    fr: 'Quand la poussée du rail sur la bille de droite tombe à zéro, elle quitte le rail avant le sommet et tombe',
    hi: 'जब दाईं गेंद पर पटरी का धक्का शून्य हो जाता है, तो वह शीर्ष से पहले ही पटरी छोड़कर गिर जाती है',
    id: 'Saat dorongan rel pada bola kanan mencapai nol, bola itu meninggalkan rel sebelum puncak dan jatuh',
    pt: 'Quando o empurrão do trilho sobre a bola da direita chega a zero, ela deixa o trilho antes do topo e cai',
  },
  'caption.pass': {
    ko: '왼쪽 공은 꼭대기에서도 최소 속력보다 빨라, 레일에 눌린 채 계속 돈다',
    en: 'The left ball is faster than the minimum speed even at the top, so it stays pressed to the rail and keeps looping',
    ja: '左の球は頂上でも最小の速さより速いので、レールに押しつけられたまま回り続ける',
    zh: '左边的小球即使在最高点也比最小速率快，所以一直贴着轨道继续转圈',
    ar: 'الكرة اليسرى أسرع من السرعة الدنيا حتى عند القمة، فتبقى مضغوطة على السكة وتواصل الدوران',
    es: 'La bola izquierda supera la rapidez mínima incluso en lo más alto, así que sigue apretada contra el riel y continúa dando vueltas',
    fr: 'La bille de gauche dépasse la vitesse minimale même au sommet, elle reste donc plaquée contre le rail et continue de boucler',
    hi: 'बाईं गेंद शीर्ष पर भी न्यूनतम चाल से तेज़ है, इसलिए वह पटरी से दबी रहकर घूमती रहती है',
    id: 'Bola kiri lebih cepat daripada kelajuan minimum bahkan di puncak, jadi tetap tertekan ke rel dan terus berputar',
    pt: 'A bola da esquerda supera a velocidade mínima mesmo no topo, então continua pressionada contra o trilho e segue dando voltas',
  },
} satisfies Record<string, LocalizedText>);

export type VerticalLoopMessageKey = keyof typeof verticalLoopMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 통로. */
export const text = (key: VerticalLoopMessageKey): LocalizedText => verticalLoopMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VerticalLoopMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

const RISE_END = FAIL_SEP.t - LEAVE_CAPTION_LEAD;
const FADE_START = CYCLE - FADE_OUT;

export const verticalLoopSchema: BundleSchema = {
  id: VERTICAL_LOOP_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 두 속력의 대비로 주장이 끝나고, 속력을 바꿔 보게 하면 주장이
  // "경계값 찾기" 로 옮겨 간다 (원본 NOTES (c)).
  parameters: [],

  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본은 캔버스 360 px + 캡션 한 줄. 캡션이 캔버스 안으로 들어오고 엔진 여백(위아래 36)이
   * 붙어, 공 이름표와 캡션 사이를 원본만큼(약 55 px) 띄우려면 420 이 필요하다.
   */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 한 순환 6 초 = 통과 공 두 바퀴. 단계는 캡션이 하는 말과 끝의 흐려짐으로 나뉜다.
   *
   * - rise  — 두 공이 함께 오른다. 느린 공이 떠나기 0.3 초 전까지.
   * - leave — 느린 공이 레일을 떠나 떨어진다. 착지까지(약 3.60 초).
   * - pass  — 떨어진 공은 멈춰 있고, 빠른 공이 계속 돈다.
   * - fade  — 마지막 0.4 초, 떨어진 공과 흔적이 흐려진다. 캡션은 pass 와 같은 문장이다.
   *
   * 단계 경계는 느린 공의 사건 시각에서 계산한다 — 운동을 바꾸면 캡션이 함께 따라간다.
   * 운동 자체는 단계가 아니라 조각 시계(`u`)로 표를 읽는다.
   */
  timeline: {
    phases: [
      { id: 'rise', duration: RISE_END, caption: key('caption.rise') },
      { id: 'leave', duration: FAIL_IMPACT.t - RISE_END, caption: key('caption.leave') },
      { id: 'pass', duration: FADE_START - FAIL_IMPACT.t, caption: key('caption.pass') },
      { id: 'fade', duration: FADE_OUT, caption: key('caption.pass') },
    ],
  },

  // 원본 순서 그대로 겹친다 — 공이 제 화살표의 꼬리를 덮는다.
  drawOrder: 'scene',

  // 원본은 캔버스 아래 가운데 한 줄, 15 px 본문 먹색. 바로 바뀐다(페이드 없음).
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -20] },
    align: 'center',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드도 카메라 버튼도 없다 (기본값). 숫자·공식·중력 화살표는 원본 inventory 「hidden」.

  messages: verticalLoopMessages,
};
