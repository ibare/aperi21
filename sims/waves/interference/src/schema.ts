// ========================================================================
// interference — 선언
// ========================================================================
// 질문: 두 파원이 똑같이 물결을 내는데, 물이 더 세게 출렁여야 할 것 같은
// 자리에서 왜 오히려 물이 가만히 있는가.
//
// 두 파원의 물결이 겹치면 어떤 자리는 두 물결이 서로를 지워 줄지어 잠잠해진다.
//
// 원본: tasks/piece-lab/interference/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText, Vec2 } from '@aperi21/schema';

/** 등록 키 `aperi21:interference` 와 문자 그대로 일치한다 (C4). */
export const INTERFERENCE_ID = 'interference';

// ------------------------------------------------------------------------
// 월드 — 원본 화면 px 를 그대로 월드 단위로 쓴다 (y 는 위)
// ------------------------------------------------------------------------

/** 수면 가로(월드). 원본 캔버스 폭. */
export const WATER_W = 860;
/** 수면 세로(월드). 원본 캔버스 높이. */
export const WATER_H = 340;

/** 물결 한 마루에서 다음 마루까지(월드). */
export const WAVELENGTH = 56;
/** 물결이 번지는 빠르기(월드/초). */
export const WAVE_SPEED = 110;

/**
 * 두 파원. 화면 왼쪽 1/3 지점에 세로로 150(약 2.7 파장) 떨어뜨렸다 — 좌우 양쪽으로
 * 부채꼴 줄이 뻗고, 오른쪽이 넓어 줄이 화면 끝까지 길게 보인다.
 * 원본은 화면 y 가 아래라 위쪽 파원이 y = 95 였다. 월드는 y 가 위라 뒤집었다.
 */
export const SOURCE_1: Vec2 = [300, WATER_H / 2 + 75];
export const SOURCE_2: Vec2 = [300, WATER_H / 2 - 75];

/** 파원 점의 반지름(월드). 원본 6 px. */
export const SOURCE_RADIUS = 6;

/**
 * 수면 높이를 계산하는 격자 한 칸의 크기(월드). 원본 2 px 칸 그대로다 — 860 × 340 수면이
 * 430 × 170 칸. `scalarField` 하나로 그려 칸 수가 선언 개수를 늘리지 않는다.
 */
export const CELL = 2;

// ------------------------------------------------------------------------
// 시간표 — 원본 상수에서 단계 길이를 계산해 선언에 넣는다
// ------------------------------------------------------------------------

/** 한 바퀴 이야기의 길이(초). */
export const CYCLE = 20;
/** 둘째 파원이 물결을 내기 시작하는 시각(초). */
export const SECOND_ON = 1;
/** 둘째 파원이 멈추는 시각(초). */
export const SECOND_OFF = 12;

/**
 * 둘째 물결이 화면을 다 덮는(또는 다 빠져나가는) 데 걸리는 시간(초).
 *
 * 둘째 파원에서 가장 먼 모서리까지 + 부드러운 앞머리 폭(4분의 1 파장). 이 값으로
 * 캡션이 바뀌어야 캡션이 「자리를 지킨다」 라고 말할 때 화면 끝까지 실제로 덮여 있다.
 * 시간표가 이 계산을 받지 못해 여기서 계산해 단계 길이로 넣는다 (NOTES 「어휘 부족」).
 */
const FARTHEST = Math.max(
  ...([
    [0, 0],
    [WATER_W, 0],
    [0, WATER_H],
    [WATER_W, WATER_H],
  ] as const).map(([x, y]) => Math.hypot(x - SOURCE_2[0], y - SOURCE_2[1])),
);
export const COVER_TIME = (FARTHEST + WAVELENGTH * 0.25) / WAVE_SPEED;

/**
 * 프레이밍 — 수면 아래에 캡션 한 줄 자리를 둔다. 원본은 캔버스 밖 DOM 캡션이었다.
 * 매 프레임 같은 값이다 (원칙 6).
 */
export const SCENE_BOUNDS = { minX: 0, maxX: WATER_W, minY: -44, maxY: WATER_H } as const;

// ------------------------------------------------------------------------
// 수면 색 사상 — 한 가지 물빛의 명암
// ------------------------------------------------------------------------

/** 명암 누름 계수. tanh(h · k) — 파원 근처가 하얗게 타지 않게. 원본 0.9. */
export const TONE_GAIN = 0.9;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const interferenceMessages = Object.freeze({
  'label.title': {
    ko: '간섭',
    en: 'Interference',
    ja: '干渉',
    zh: '干涉',
    ar: 'التداخل',
    es: 'Interferencia',
    fr: 'Interférences',
    hi: 'व्यतिकरण',
    id: 'Interferensi',
    pt: 'Interferência',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '두 파원이 만드는 무늬',
    en: 'The pattern made by two sources',
    ja: '二つの波源がつくる模様',
    zh: '两个波源形成的图样',
    ar: 'النمط الذي يصنعه مصدران',
    es: 'El patrón que forman dos fuentes',
    fr: 'La figure formée par deux sources',
    hi: 'दो स्रोतों से बनने वाला प्रतिरूप',
    id: 'Pola yang dibentuk dua sumber',
    pt: 'O padrão formado por duas fontes',
  },
  'label.stage': {
    ko: '수면',
    en: 'Water surface',
    ja: '水面',
    zh: '水面',
    ar: 'سطح الماء',
    es: 'Superficie del agua',
    fr: 'Surface de l’eau',
    hi: 'जल की सतह',
    id: 'Permukaan air',
    pt: 'Superfície da água',
  },
  'label.view': {
    ko: '위에서 본 수면',
    en: 'Surface from above',
    ja: '上から見た水面',
    zh: '俯视水面',
    ar: 'السطح من الأعلى',
    es: 'La superficie vista desde arriba',
    fr: 'La surface vue de dessus',
    hi: 'ऊपर से देखी गई सतह',
    id: 'Permukaan dilihat dari atas',
    pt: 'A superfície vista de cima',
  },
  'caption.solo': {
    ko: '파원 하나뿐인 물에서는 어디든 출렁인다',
    en: 'With a single source, the water moves everywhere',
    ja: '波源が一つだけなら、水はどこでも揺れる',
    zh: '只有一个波源时，水面处处起伏',
    ar: 'مع مصدر واحد فقط، يتحرك الماء في كل مكان',
    es: 'Con una sola fuente, el agua se mueve en todas partes',
    fr: 'Avec une seule source, l’eau bouge partout',
    hi: 'एक ही स्रोत हो तो पानी हर जगह हिलता है',
    id: 'Dengan satu sumber saja, air bergerak di mana-mana',
    pt: 'Com uma única fonte, a água se move em toda parte',
  },
  'caption.spreading': {
    ko: '둘째 물결이 닿는 곳마다 잠잠한 줄이 생긴다',
    en: 'Wherever the second ripples arrive, calm lines appear',
    ja: '二つ目の波紋が届いたところから、静かな線が現れる',
    zh: '第二组水波所到之处，出现平静的线',
    ar: 'حيثما تصل التموجات الثانية تظهر خطوط ساكنة',
    es: 'Allí donde llegan las segundas ondas, aparecen líneas en calma',
    fr: 'Partout où arrivent les secondes rides, des lignes calmes apparaissent',
    hi: 'जहाँ-जहाँ दूसरी लहरें पहुँचती हैं, वहाँ शांत रेखाएँ उभरती हैं',
    id: 'Di mana pun riak kedua tiba, muncul garis-garis tenang',
    pt: 'Onde quer que as segundas ondulações cheguem, surgem linhas calmas',
  },
  'caption.holding': {
    ko: '두 물결이 겹친 수면에 잠잠한 줄이 자리를 지킨다',
    en: 'Where the two ripples overlap, the calm lines hold their place',
    ja: '二つの波紋が重なった水面で、静かな線はその場にとどまる',
    zh: '在两组水波重叠的水面上，平静的线保持不动',
    ar: 'حيث تتراكب التموجتان، تثبت الخطوط الساكنة في مكانها',
    es: 'Donde las dos ondas se superponen, las líneas en calma permanecen en su sitio',
    fr: 'Là où les deux rides se superposent, les lignes calmes restent en place',
    hi: 'जहाँ दोनों लहरें एक-दूसरे पर चढ़ती हैं, वहाँ शांत रेखाएँ अपनी जगह टिकी रहती हैं',
    id: 'Di tempat kedua riak bertumpuk, garis-garis tenang tetap di tempatnya',
    pt: 'Onde as duas ondulações se sobrepõem, as linhas calmas permanecem no lugar',
  },
  'caption.withdrawing': {
    ko: '둘째 파원이 멈추자, 그 물결이 빠져나간 곳부터 다시 출렁인다',
    en: 'The second source stops, and the water moves again where its ripples have passed',
    ja: '二つ目の波源が止まると、その波紋が抜けたところから水は再び揺れる',
    zh: '第二个波源停下后，它的水波经过之处，水面又开始起伏',
    ar: 'يتوقف المصدر الثاني، فيعود الماء إلى الحركة حيث مرّت تموجاته',
    es: 'La segunda fuente se detiene, y el agua vuelve a moverse allí donde sus ondas ya han pasado',
    fr: 'La seconde source s’arrête, et l’eau se remet à bouger là où ses rides sont passées',
    hi: 'दूसरा स्रोत रुक जाता है, और जहाँ से उसकी लहरें निकल चुकी हैं वहाँ पानी फिर हिलने लगता है',
    id: 'Sumber kedua berhenti, dan air kembali bergerak di tempat yang sudah dilewati riaknya',
    pt: 'A segunda fonte para, e a água volta a se mover onde suas ondulações já passaram',
  },
} satisfies Record<string, LocalizedText>);

export type InterferenceMessageKey = keyof typeof interferenceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export const text = (key: InterferenceMessageKey): LocalizedText => interferenceMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: InterferenceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const interferenceSchema: BundleSchema = {
  id: INTERFERENCE_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'periodic',

  // 파원 거리 · 파장 조절을 두지 않는다 — 「줄 개수가 바뀐다」 는 다른 주장이다.
  parameters: [],
  stages: [{ id: 'water', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'surface', label: text('label.view'), default: true }],

  /** 원본은 860 × 340 캔버스 + 아래 캡션 한 줄이었다. */
  canvas: { height: 420, minHeight: 360 },

  /**
   * 수면(`scalarField`) 위에 파원(`body`)이 와야 한다. scene 에 쓴 순서대로 그린다.
   */
  drawOrder: 'scene',

  /**
   * 원본은 시계 0 에서 열린다 — 그 순간 이미 첫째 파원의 물결이 수면 전체를 덮고
   * 있으므로(모든 것이 시각의 함수) 앞당길 것이 없다. 기본값 0 그대로다.
   */

  /**
   * 한 주기 = 20 초. 단계 경계는 둘째 파원의 켜짐 · 다 덮음 · 꺼짐 · 다 빠짐이다.
   * scene 은 `start('spread')` · `start('withdraw')` 로 앞머리 · 꼬리를 잰다.
   */
  timeline: {
    phases: [
      { id: 'solo', duration: SECOND_ON, caption: key('caption.solo') },
      { id: 'spread', duration: COVER_TIME, caption: key('caption.spreading') },
      { id: 'hold', duration: SECOND_OFF - SECOND_ON - COVER_TIME, caption: key('caption.holding') },
      { id: 'withdraw', duration: COVER_TIME, caption: key('caption.withdrawing') },
      { id: 'rest', duration: CYCLE - SECOND_OFF - COVER_TIME, caption: key('caption.solo') },
    ],
  },

  /** 원본 캡션은 수면 아래 왼쪽 정렬 한 줄, 바로 바뀐다(페이드 없음). */
  caption: {
    anchor: { screen: 'bottom-left', offset: [2, 0] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'medium' },
    fade: 0,
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 잴 것이 거리가 아니고, 마디선 · 경로차 ·
   * 파장 수치도 두지 않는다 — 잠잠함은 수면 자체에서 보여야 한다.
   */

  messages: interferenceMessages,
};
