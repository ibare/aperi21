// ========================================================================
// standing-wave — 선언
// ========================================================================
// 질문: 두 파동이 서로 반대 방향으로 계속 달리고 있는데, 어째서 어떤 점은
// 전혀 움직이지 않는가.
//
// 반대로 달리는 두 파동이 겹치면 흘러가던 사선 무늬가 끊기고, 마디는 끊기지 않은
// 세로 빈 줄로 제자리에 고정된다.
//
// 원본: tasks/piece-lab/standing-wave/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:standing-wave` 와 문자 그대로 일치한다 (C4). */
export const STANDING_WAVE_ID = 'standing-wave';

// ------------------------------------------------------------------------
// 월드 — 원본 CSS px 를 그대로 월드 단위로 쓴다 (y 는 위)
// ------------------------------------------------------------------------

/** 원본 캔버스 높이(px). 월드 y = CANVAS_H − 원본 화면 y. */
export const CANVAS_H = 340;
/** 원본 조각 폭(px) — `.piece` 최대 900 에서 좌우 여백 16 을 뺀 캔버스 폭. */
export const CANVAS_W = 868;
/** 시간 눈금 글자 자리(왼쪽 여백). */
export const MARGIN_L = 56;
export const MARGIN_R = 16;
/** 줄 평형선 높이(월드 y). 원본 화면 y 76. */
export const STRING_Y = CANVAS_H - 76;
/** 성분 파동 하나의 진폭(월드). */
export const AMP = 30;
/** 시간 자취 무늬 위 · 아래(월드 y). 원본 화면 y 156 ~ 324. */
export const TRACE_TOP = CANVAS_H - 156;
export const TRACE_H = 168;
export const TRACE_BOTTOM = TRACE_TOP - TRACE_H;
/** 무늬가 담는 과거 길이(초). 세로축 위 = 지금, 아래 = 이만큼 전. */
export const HISTORY = 4;

/** 줄 · 무늬가 차지하는 가로 구간(월드 x). */
export const PLOT_LEFT = MARGIN_L;
export const PLOT_RIGHT = CANVAS_W - MARGIN_R;

// ------------------------------------------------------------------------
// 물리
// ------------------------------------------------------------------------

/** 진동 주기(초). */
export const PERIOD = 1.6;
/** 화면 폭에 들어가는 파장 수. */
export const WAVELENGTHS = 2.25;
/** 마디가 가장자리에 붙지 않도록 미는 거리(파장 단위). */
export const NODE_SHIFT = 0.125;
/** 화면 안 마디 수. */
export const NODE_COUNT = 5;

/**
 * 무늬 격자. 원본은 plot 폭 × 168 픽셀을 한 픽셀씩 칠했다. 가로는 절반 해상도로 칠하고
 * 엔진이 부드럽게 늘린다 — 한 파장이 약 177 칸이라 사선 결이 무너지지 않는다.
 */
export const TRACE_COLS = 398;
export const TRACE_ROWS = TRACE_H;

/**
 * 프레이밍 — 원본 캔버스 340 px 아래에 캡션 한 줄 자리를 둔다. 원본은 캔버스 밖 DOM 캡션이었다.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: CANVAS_W, minY: -34, maxY: CANVAS_H } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const standingWaveMessages = Object.freeze({
  'label.title': {
    ko: '정상파',
    en: 'Standing wave',
    ja: '定常波',
    zh: '驻波',
    ar: 'الموجة الموقوفة',
    es: 'Onda estacionaria',
    fr: 'Onde stationnaire',
    hi: 'अप्रगामी तरंग',
    id: 'Gelombang stasioner',
    pt: 'Onda estacionária',
  },
  'label.operation': {
    ko: '반대로 달리는 두 파동이 겹치면 마디가 제자리에 고정된다',
    en: 'Two waves running in opposite directions pin the nodes in place',
    ja: '逆向きに進む2つの波が重なると、節がその場に固定される',
    zh: '两列反向传播的波叠加，把波节固定在原处',
    ar: 'موجتان تسيران في اتجاهين متعاكسين تثبّتان العُقد في مكانها',
    es: 'Dos ondas que viajan en sentidos opuestos fijan los nodos en su lugar',
    fr: 'Deux ondes allant en sens opposés figent les nœuds sur place',
    hi: 'विपरीत दिशाओं में चलती दो तरंगें निस्पंदों को अपनी जगह स्थिर कर देती हैं',
    id: 'Dua gelombang yang merambat berlawanan arah menahan simpul di tempatnya',
    pt: 'Duas ondas em sentidos opostos fixam os nós no lugar',
  },
  'label.stage': {
    ko: '줄',
    en: 'String',
    ja: '弦',
    zh: '弦',
    ar: 'وتر',
    es: 'Cuerda',
    fr: 'Corde',
    hi: 'डोरी',
    id: 'Tali',
    pt: 'Corda',
  },
  'label.view': {
    ko: '줄과 시간 자취',
    en: 'String and time trace',
    ja: '弦と時間の軌跡',
    zh: '弦与时间轨迹',
    ar: 'الوتر وأثره عبر الزمن',
    es: 'Cuerda y traza temporal',
    fr: 'Corde et trace temporelle',
    hi: 'डोरी और समय-चिह्न',
    id: 'Tali dan jejak waktu',
    pt: 'Corda e traço temporal',
  },
  /** 무늬 세로축 위 끝 — 지금. */
  'label.now': {
    ko: '지금',
    en: 'now',
    ja: '今',
    zh: '现在',
    ar: 'الآن',
    es: 'ahora',
    fr: 'maintenant',
    hi: 'अभी',
    id: 'sekarang',
    pt: 'agora',
  },
  /** 무늬 세로축 아래 끝 — 과거. 수는 선언의 값이다. */
  'label.past': {
    ko: '{s}초 전',
    en: '{s} s ago',
    ja: '{s} 秒前',
    zh: '{s} 秒前',
    ar: 'قبل {s} s',
    es: 'hace {s} s',
    fr: 'il y a {s} s',
    hi: '{s} s पहले',
    id: '{s} s lalu',
    pt: 'há {s} s',
  },
  'caption.standing': {
    ko: '반대로 달리는 두 파동이 겹친 줄 — 마디는 제자리에 멈춰 있고, 그 사이 배만 위아래로 흔들린다.',
    en: 'Two waves running opposite ways overlap — the nodes stay put, and only the antinodes between them swing.',
    ja: '逆向きに進む2つの波が重なる — 節はその場にとどまり、そのあいだの腹だけが上下にゆれる。',
    zh: '两列反向传播的波叠加 — 波节停在原处，只有它们之间的波腹上下摆动。',
    ar: 'موجتان تسيران في اتجاهين متعاكسين تتراكبان — تبقى العُقد في مكانها، ولا تتأرجح إلا البطون بينها.',
    es: 'Dos ondas que viajan en sentidos opuestos se superponen — los nodos no se mueven, y solo oscilan los antinodos entre ellos.',
    fr: 'Deux ondes allant en sens opposés se superposent — les nœuds restent fixes, et seuls les ventres entre eux oscillent.',
    hi: 'विपरीत दिशाओं में चलती दो तरंगें अध्यारोपित होती हैं — निस्पंद अपनी जगह टिके रहते हैं, और केवल उनके बीच के प्रस्पंद ऊपर-नीचे झूलते हैं।',
    id: 'Dua gelombang yang merambat berlawanan arah bertumpuk — simpul tetap di tempat, dan hanya perut di antaranya yang berayun.',
    pt: 'Duas ondas em sentidos opostos se sobrepõem — os nós ficam parados, e só os ventres entre eles oscilam.',
  },
  'caption.removing': {
    ko: '왼쪽으로 가는 파동이 빠지는 중 — 마디 자리의 세로 빈 줄이 끊기고 사선이 돌아온다.',
    en: 'The left-moving wave is fading out — the blank vertical lines at the nodes break and the slant returns.',
    ja: '左へ進む波が消えていく — 節の位置の縦の空白線がとぎれ、斜めの筋が戻ってくる。',
    zh: '向左传播的波正在消退 — 波节处的竖直空白线断开，斜纹又回来了。',
    ar: 'الموجة المتجهة يسارًا تتلاشى — تنقطع الخطوط الرأسية الفارغة عند العُقد ويعود الميل.',
    es: 'La onda que va hacia la izquierda se desvanece — las líneas verticales vacías en los nodos se rompen y vuelve la inclinación.',
    fr: 'L’onde allant vers la gauche s’estompe — les lignes verticales vides aux nœuds se rompent et l’oblique revient.',
    hi: 'बाईं ओर जाती तरंग धीमी पड़ रही है — निस्पंदों पर खाली खड़ी रेखाएँ टूटती हैं और तिरछापन लौट आता है।',
    id: 'Gelombang yang bergerak ke kiri memudar — garis tegak kosong di simpul terputus dan kemiringan kembali.',
    pt: 'A onda que vai para a esquerda está sumindo — as linhas verticais vazias nos nós se rompem e a inclinação volta.',
  },
  'caption.single': {
    ko: '한 방향 파동만 있으면 마루가 오른쪽으로 흘러가, 멈춰 있는 점이 없다.',
    en: 'With a wave going one way only, the crests drift right and no point stays still.',
    ja: '一方向の波だけだと山が右へ流れていき、止まっている点はない。',
    zh: '只有一个方向的波时，波峰向右漂移，没有静止不动的点。',
    ar: 'بموجة تسير في اتجاه واحد فقط، تنجرف القمم يمينًا ولا تبقى أي نقطة ساكنة.',
    es: 'Con una onda que va en un solo sentido, las crestas se desplazan a la derecha y ningún punto queda quieto.',
    fr: 'Avec une onde allant dans un seul sens, les crêtes dérivent vers la droite et aucun point ne reste immobile.',
    hi: 'केवल एक दिशा में जाती तरंग हो तो शिखर दाईं ओर बहते हैं और कोई बिंदु स्थिर नहीं रहता।',
    id: 'Dengan gelombang yang bergerak satu arah saja, puncak-puncaknya hanyut ke kanan dan tak ada titik yang diam.',
    pt: 'Com uma onda indo num só sentido, as cristas deslizam para a direita e nenhum ponto fica parado.',
  },
  'caption.adding': {
    ko: '왼쪽으로 가는 파동이 더해지는 중 — 흐르던 사선이 끊기며 마디 자리에 세로 빈 줄이 생기기 시작한다.',
    en: 'The left-moving wave is coming back — the drifting slant breaks and blank vertical lines start to form at the nodes.',
    ja: '左へ進む波が戻ってくる — 流れていた斜めの筋がとぎれ、節の位置に縦の空白線ができはじめる。',
    zh: '向左传播的波回来了 — 漂移的斜纹断开，波节处开始出现竖直空白线。',
    ar: 'الموجة المتجهة يسارًا تعود — ينقطع الميل المنجرف وتبدأ خطوط رأسية فارغة بالتشكّل عند العُقد.',
    es: 'La onda que va hacia la izquierda regresa — la inclinación que se desplazaba se rompe y empiezan a formarse líneas verticales vacías en los nodos.',
    fr: 'L’onde allant vers la gauche revient — l’oblique qui dérivait se rompt et des lignes verticales vides commencent à se former aux nœuds.',
    hi: 'बाईं ओर जाती तरंग लौट रही है — बहता तिरछापन टूटता है और निस्पंदों पर खाली खड़ी रेखाएँ बनने लगती हैं।',
    id: 'Gelombang yang bergerak ke kiri kembali — kemiringan yang hanyut terputus dan garis tegak kosong mulai terbentuk di simpul.',
    pt: 'A onda que vai para a esquerda está voltando — a inclinação que deslizava se rompe e linhas verticais vazias começam a se formar nos nós.',
  },
} satisfies Record<string, LocalizedText>);

export type StandingWaveMessageKey = keyof typeof standingWaveMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: StandingWaveMessageKey): LocalizedText => standingWaveMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: StandingWaveMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const standingWaveSchema: BundleSchema = {
  id: STANDING_WAVE_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 자동 진행으로 사선 → 세로 빈 줄 전환을 보여 주는 것으로 주장이 끝난다.
  parameters: [],
  stages: [{ id: 'string', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'string', label: text('label.view'), default: true }],

  /** 원본은 340 px 캔버스 + 아래 캡션 한 줄이었다. */
  canvas: { height: 380, minHeight: 340 },

  /**
   * 원본은 시계 0 에서 열린다. 모든 것이 시각의 함수라 그 순간 이미 무늬가 4 초치
   * 차 있다(과거 행도 시각의 함수로 다시 계산한다). 앞당길 것이 없어 `startAt` 기본값 0.
   */

  /**
   * 한 주기 18 초 — 반대 방향(왼쪽으로 가는) 파동을 뺐다가 다시 넣는다.
   *
   * - `standing` 9 s → `removing` 1.5 s(부드럽게 빠짐) → `single` 4.5 s →
   *   `adding` 1.5 s(부드럽게 더해짐) → `standing-tail` 1.5 s.
   * - 단계 id 는 겹칠 수 없어 주기 끝의 정상파 구간을 `standing-tail` 로 나눴다. 캡션 키가
   *   같아 주기를 넘어갈 때 다시 페이드하지 않는다.
   * - scene 은 지금의 진폭을 `at('removing')` · `at('adding')` 으로 읽고, 무늬의 과거 행은
   *   `start` · `duration` 으로 같은 곡선을 다시 계산한다 (NOTES 「어휘 부족」 G59).
   */
  timeline: {
    phases: [
      { id: 'standing', duration: 9, caption: key('caption.standing') },
      { id: 'removing', duration: 1.5, ease: 'smooth', caption: key('caption.removing') },
      { id: 'single', duration: 4.5, caption: key('caption.single') },
      { id: 'adding', duration: 1.5, ease: 'smooth', caption: key('caption.adding') },
      { id: 'standing-tail', duration: 1.5, caption: key('caption.standing') },
    ],
  },

  /** 원본 캡션은 캔버스 아래 왼쪽 정렬 한 줄, 먹색 15 px, 바로 바뀐다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [0, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    fade: 0,
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 무늬의 세로축은 거리가 아니라 시간이고,
   * 양 끝만 글자로 표시한다 — 그 밖의 축 · 격자는 두지 않는다.
   */

  messages: standingWaveMessages,
};
