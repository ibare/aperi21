// ========================================================================
// tension — 선언
// ========================================================================
// 질문: 줄이 도르래를 돌아 꺾이면 저쪽 끝에 전해지는 힘도 줄어들까?
//
// 아니다. 한 가닥 줄에서는 어디에 저울을 끼워도, 꺾인 뒤에도 눈금이 같다.
// 동사는 「함께 늘어난다」 — 손이 더 당기면 세 저울이 같은 길이만큼 함께 늘고,
// 풀면 함께 줄어든다.
//
// 원본: tasks/piece-lab/tension/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:tension` 와 문자 그대로 일치한다 (C4). */
export const TENSION_ID = 'tension';

// ------------------------------------------------------------------------
// 기하 — 원본 논리 좌표(860 × 310 캔버스, y 아래) 그대로 적고 월드로 옮긴다.
// 월드 1 단위 = 원본 100 px, 캔버스 가운데가 원점, y 는 위.
// ------------------------------------------------------------------------

/** 원본 px 을 월드로. */
export const PX = 0.01;
/** 원본 캔버스 너비. */
export const CANVAS_W = 860;
/**
 * 원본 캔버스 310 px 에 그 아래 캡션 문단(위 여백 6 · 줄 22.5 · 아래 여백 12)을 더한 높이.
 * 원본 좌표를 월드로 옮기는 기준이다.
 */
export const CANVAS_H = 350;
/**
 * 임베드 높이. 원본 높이(350)보다 30 px 크다 — 러너가 위아래로 36 px 씩(패딩 12 + 기본
 * 여백 24) 비우므로 350 이면 그림이 0.86 배로 줄어 용수철 물결이 뭉친다 (NOTES).
 */
export const EMBED_H = 380;

/** 원본 캔버스 좌표 → 월드. */
export function world(px: number, py: number): readonly [number, number] {
  return [(px - CANVAS_W / 2) * PX, (CANVAS_H / 2 - py) * PX];
}

/** 저울 늘음(px / N). 세 늘음의 합이 손의 이동이 되므로 조각이 고른다. 원본 PX_PER_N. */
export const PX_PER_N = 0.5;
/** 저울 눈금의 끝값(N)과 간격. 원본 F_MAX · 10 N. */
export const F_MAX = 80;
export const TICK_STEP = 10;
/** 긴 눈금 간격(N). 원본 `n % 40 === 0`. */
export const TICK_LONG_EVERY = 40;

/** 저울 치수(px) — 투명 몸통 길이 · 폭, F=0 용수철 길이, 바늘에서 아랫고리까지 막대. */
export const CASE_LEN = 84;
export const CASE_W = 20;
export const SPRING_REST = 20;
export const ROD_LEN = 62;
/** 고리 반지름 · 몸통이 윗고리에서 떨어진 자리(px). 원본 4 · 4. */
export const HOOK_R = 4;
/** 몸통 모서리 반지름(px). 원본 roundRect 4. */
export const CASE_CORNER = 4;
/** 용수철이 시작하는 자리(px). 원본 6. */
export const SPRING_START = 6;
/**
 * 용수철 물결 수. **원본은 9** 였다. 엔진 용수철은 양 끝에 곧은 목(길이의 15%씩)을 두고
 * 옆으로 7 px(원본 5) 벌어지며 굵기가 1.5(원본 1.3)라, 9 로 두면 15 N 에서 물결이 뭉쳐
 * 검은 덩어리가 된다. 원본의 물결 간격(15 N 에서 약 3 px)에 맞춰 6 으로 줄였다 (NOTES).
 */
export const SPRING_COILS = 6;
/** 눈금 길이(px) — 짧은 · 긴. */
export const TICK_SHORT = 4;
export const TICK_LONG = 6;

/** 배치(px) — 천장 · 도르래 · 바닥 · 바닥 고리. */
export const CEIL_Y = 30;
export const PULLEY = { x: 640, y: 88, r: 26 } as const;
export const FLOOR_Y = 292;
export const ANCHOR = { x: PULLEY.x + PULLEY.r, y: FLOOR_Y - 14 } as const;
/** 수평 줄 높이 · 수직 줄 x. */
export const ROPE_TOP_Y = PULLEY.y - PULLEY.r;
export const VERT_X = PULLEY.x + PULLEY.r;
/** 줄 조각 길이(px). 도르래 꼭대기 → a → 저울2 → b → 저울1 → c → 손, 바닥 고리 → d → 저울3. */
export const ROPE_A = 80;
export const ROPE_B = 80;
export const ROPE_C = 40;
export const ROPE_D = 20;

/** 손 잡는 반경(화면 px). 원본 가로·세로 40 px 안. */
export const GRAB_RADIUS_PX = 40;

/** 캡션 줄 — 원본은 캔버스 아래 DOM 문단(왼쪽 여백 16, 위 여백 6, 줄 높이 22.5). */
export const CAPTION_AT = world(16, 310 + 6 + 11.25);

/**
 * 프레이밍 — 그림이 실제로 차지하는 자리에 캡션 줄을 더한 경계다(원본 px).
 * 원본 캔버스 전체(860 × 350)를 경계로 두면 임베드가 원본보다 좁을 때 그림이 줄어
 * 용수철 물결이 뭉친다. 왼쪽 0 은 원본 캔버스 가장자리(팔이 들어오는 자리), 오른쪽 800 은
 * 바닥 선 끝(760) 너머, 위 16 은 천장 빗금 위, 아래 340 은 캡션 줄 아래다.
 * 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece).
 */
const FRAME_PX = { left: 0, right: 800, top: 16, bottom: 340 } as const;
export const SCENE_BOUNDS = {
  minX: world(FRAME_PX.left, 0)[0],
  maxX: world(FRAME_PX.right, 0)[0],
  minY: world(0, FRAME_PX.bottom)[1],
  maxY: world(0, FRAME_PX.top)[1],
} as const;

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 대본이 오가는 네 힘(N). 원본 KEYS 30 → 70 → 15 → 50 → 30. */
export const FORCE_START = 30;
export const FORCE_HIGH = 70;
export const FORCE_LOW = 15;
export const FORCE_MID = 50;
/** 손을 놓은 뒤 자동 진행 값으로 돌아가는 시간(초). 원본 BLEND. */
export const RELEASE_BLEND = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const tensionMessages = Object.freeze({
  'label.title': {
    ko: '장력',
    en: 'Tension',
    ja: '張力',
    zh: '张力',
    ar: 'قوة الشد',
    es: 'Tensión',
    fr: 'Tension',
    hi: 'तनाव',
    id: 'Tegangan tali',
    pt: 'Tração',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '줄이 당기는 힘과 그 전달',
    en: 'How a rope carries a pull',
    ja: 'ロープが引く力を伝えるしくみ',
    zh: '绳子如何传递拉力',
    ar: 'كيف ينقل الحبل قوة السحب',
    es: 'Cómo una cuerda transmite un tirón',
    fr: 'Comment une corde transmet une traction',
    hi: 'रस्सी खिंचाव को कैसे आगे पहुँचाती है',
    id: 'Bagaimana tali meneruskan tarikan',
    pt: 'Como uma corda transmite um puxão',
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
  /** 저울이 읽은 값. 값은 반올림한 정수 하나에서 온다. */
  'label.reading': {
    ko: '{force} N',
    en: '{force} N',
    ja: '{force} N',
    zh: '{force} N',
    ar: '{force} N',
    es: '{force} N',
    fr: '{force} N',
    hi: '{force} N',
    id: '{force} N',
    pt: '{force} N',
  },
  'caption.reading': {
    ko: '줄 어디에 끼운 저울도 — 도르래를 돌아 꺾인 뒤에도 — 모두 {force} N을 가리킨다.',
    en: 'Every scale on the rope — even past the turn around the pulley — reads {force} N.',
    ja: 'ロープのどこにはさんだばねばかりも — 滑車を回って折れ曲がった先でも — みな {force} N を指す。',
    zh: '绳上任何位置的弹簧秤——即使绕过滑轮拐弯之后——读数都是 {force} N。',
    ar: 'كل ميزان نابضي على الحبل — حتى بعد الالتفاف حول البكرة — يقرأ {force} N.',
    es: 'Cada dinamómetro de la cuerda — incluso después de la vuelta en la polea — marca {force} N.',
    fr: 'Chaque dynamomètre sur la corde — même après le virage autour de la poulie — indique {force} N.',
    hi: 'रस्सी पर लगा हर कमानीदार तुला — घिरनी के चारों ओर मुड़ने के बाद भी — {force} N दिखाता है।',
    id: 'Setiap neraca pegas pada tali — bahkan setelah berbelok mengitari katrol — menunjukkan {force} N.',
    pt: 'Todo dinamômetro na corda — mesmo depois da volta em torno da polia — marca {force} N.',
  },
} satisfies Record<string, LocalizedText>);

export type TensionMessageKey = keyof typeof tensionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: TensionMessageKey): LocalizedText => tensionMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: TensionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const tensionSchema: BundleSchema = {
  id: TENSION_ID,
  label: text('label.title'),
  category: 'mechanics',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: {
        forceStart: FORCE_START,
        forceHigh: FORCE_HIGH,
        forceLow: FORCE_LOW,
        forceMid: FORCE_MID,
        forceMax: F_MAX,
        releaseBlend: RELEASE_BLEND,
      },
    },
  ],

  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  canvas: { height: EMBED_H, minHeight: EMBED_H },

  /**
   * 원본이 그린 순서 그대로 겹친다 — 천장·바닥 · 도르래 · 바닥 고리 · 줄 · 저울 셋 · 손.
   * 도르래 바탕 칠이 매단 막대를 가리고, 주먹 바탕 칠이 팔 끝을 가려야 한다.
   */
  drawOrder: 'scene',

  /**
   * 손이 당기는 힘의 대본 — 13 초 주기. 원본 KEYS 의 구간을 그대로 단계로 옮겼고
   * 구간마다 smoothstep 이다. 단계마다 힘이 어디서 어디로 가는지는
   * `physics.PHASE_FORCES` 가 스테이지 상수 이름으로 가리킨다.
   *
   * 힘은 `step` 이 상태에 둔다 — 손을 놓은 뒤 0.8 초 동안 섞어 돌아가는 것이 누적
   * 상태라서다. `step` 은 시간표 프레임을 받지 못하므로 상태 시계로 이 선언을 직접
   * 읽는다 (NOTES 「어휘 부족」). 원본은 시계를 0 에서 열었다 — 0 초에 이미 30 N 에서
   * 당기기 시작하므로 `startAt` · `preroll` 은 두지 않는다.
   */
  timeline: {
    phases: [
      { id: 'pull', duration: 1.6, ease: 'smooth' },
      { id: 'holdHigh', duration: 2.6, ease: 'smooth' },
      { id: 'letOut', duration: 1.8, ease: 'smooth' },
      { id: 'holdLow', duration: 2.4, ease: 'smooth' },
      { id: 'pullAgain', duration: 1.6, ease: 'smooth' },
      { id: 'holdMid', duration: 1.6, ease: 'smooth' },
      { id: 'settle', duration: 1.4, ease: 'smooth' },
    ],
  },

  /**
   * 슬롯 하나 — 늘어나는 중·멈춘 중을 나누지 않는다(원본 NOTES). 수는 세 저울 글자와
   * 같은 반올림 값(`reading`) 하나에서 나오므로 어느 순간에도 화면과 어긋나지 않는다.
   */
  caption: {
    anchor: { world: CAPTION_AT },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.reading'),
    vars: { force: 'reading' },
  },

  /** 그리드도 카메라 버튼도 없다 (기본값). 힘의 크기는 저울의 눈금이 보인다. */

  messages: tensionMessages,
};
