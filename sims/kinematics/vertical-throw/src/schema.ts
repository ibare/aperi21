// ========================================================================
// vertical-throw — 선언
// ========================================================================
// 질문: 위로 던진 공이 내려올 때, 올라갈 때 지났던 그 높이에서는 얼마나 빠른가.
//
// 답: 같은 높이에서 같은 빠르기다. 방향만 거꾸로다. 동사는 **겹친다**.
// 원본: tasks/piece-lab/vertical-throw (엔진 없이 손으로 짠 것).
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:vertical-throw` 와 문자 그대로 일치한다 (C4). */
export const VERTICAL_THROW_ID = 'vertical-throw';

/** 중력 가속도(m/s²). */
export const G = 9.8;
/** 던지는 속력(m/s) — 올라가는 시간이 1.5 s 로 떨어져 섬광 간격과 맞는다. */
export const V0 = 14.7;
/** 올라가는 시간(s). */
export const T_TOP = V0 / G;
/** 체공 시간(s). 시간표 `flight` 단계의 길이가 이것이다. */
export const T_FLIGHT = 2 * T_TOP;
/** 최고점(m). */
export const H_MAX = (V0 * V0) / (2 * G);

/**
 * 섬광 도장의 연출. 단계 경계가 아니라 **도장 하나마다의 시차 출발**이라
 * scene 이 `timeline.span(s, s + SLIDE)` 로 읽는다.
 *
 * - STROBE 는 T_TOP 의 약수여야 한다 — 그래야 내려올 때 섬광이 올라갈 때 섬광과
 *   정확히 같은 높이(시각 s 와 T_FLIGHT − s)에서 일어난다.
 */
export const STROBE = 0.25;
/** 도장이 옆 칸으로 밀려나는 시간(s). */
export const SLIDE = 0.2;
/** 거울 사본이 건너가며 뒤집히는 시간(s). */
export const MIRROR = 0.5;
/** 포개진 짝을 잇는 점선이 나타나는 시간(s). */
export const LINK_FADE_IN = 0.2;

/**
 * 원본의 배율 — 세로 310px 캔버스에서 최고점 11.025 m 를 234px 로 담았다.
 * 아래 치수는 모두 원본의 화면 px 를 이 배율로 월드 m 로 옮긴 것이다.
 * 프레이밍이 고정(`boundsHint`)이라 월드 길이가 곧 화면 길이다.
 */
export const PX_PER_M = 234 / H_MAX;
const px = (n: number): number => n / PX_PER_M;

/** 속도 화살표 척도(m per m/s) — 원본 3 px per m/s. 조각 전체에서 하나다. */
export const ARROW_M_PER_MS = px(3);
/** 가운데 칸에서 옆 칸까지(m) — 원본 min(110, W·0.14) px 의 넓은 화면 값. */
export const COL_GAP = px(110);
/** 공 반지름(m) — 원본 9 px. */
export const BALL_R = px(9);
/** 도장 반지름(m) — 원본 7 px. */
export const STAMP_R = px(7);
/** 땅 선 — 공 중심보다 9 px 아래, 옆 칸보다 40 px 더 뻗는다. */
export const GROUND = { y: -px(9), overhang: px(40) } as const;
/** 짝을 잇는 점선이 도장에서 떨어지는 틈(m) — 원본 12 px. */
export const LINK_INSET = px(12);

/** 도장 채움의 불투명도 — 원본 0.35. 테두리는 온전히 긋는다. */
export const STAMP_FILL_OPACITY = 0.35;
/** 거울 사본의 불투명도 — 원본 0.55, 끝 15% 에서 흐려진다. */
export const MIRROR_OPACITY = 0.55;
export const MIRROR_FADE_FROM = 0.85;
/** 짝 잇는 점선의 옅기 — 원본 rgba(먹, 0.18). */
export const LINK_OPACITY = 0.18;

/**
 * 고정 경계. 러너가 사방 36px(12 + 24)을 더 비우므로 그만큼 안으로 들인다.
 * 위: 최고점 위 24px, 아래: 땅 아래 52px 에 캡션 한 줄 자리를 더했다.
 * 캔버스 높이 350 에서 배율이 원본과 같아진다.
 */
export const SCENE_BOUNDS = {
  minX: -(COL_GAP + GROUND.overhang),
  maxX: COL_GAP + GROUND.overhang,
  minY: -px(56),
  maxY: H_MAX - px(12),
} as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const verticalThrowMessages = Object.freeze({
  'label.title': {
    ko: '연직 투상',
    en: 'Vertical throw',
    ja: '鉛直投げ上げ',
    zh: '竖直上抛',
    ar: 'القذف الرأسي',
    es: 'Lanzamiento vertical',
    fr: 'Lancer vertical',
    hi: 'ऊर्ध्वाधर प्रक्षेप',
    id: 'Gerak vertikal ke atas',
    pt: 'Lançamento vertical',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '올라갔다 내려오는 운동의 대칭',
    en: 'The symmetry of going up and coming down',
    ja: '上がって下りる運動の対称性',
    zh: '上升与下降运动的对称性',
    ar: 'تماثل الصعود والهبوط',
    es: 'La simetría entre subir y bajar',
    fr: 'La symétrie de la montée et de la descente',
    hi: 'ऊपर जाने और नीचे आने की सममिति',
    id: 'Simetri gerak naik dan turun',
    pt: 'A simetria entre subir e descer',
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
  'caption.main': {
    ko: '내려오는 공은 올라갈 때 지난 높이마다 같은 빠르기로 지난다 — 방향만 거꾸로.',
    en: 'Coming down, the ball passes each height at the same speed it had going up — only reversed.',
    ja: '下りてくるボールは、上がるときに通った高さをそれぞれ同じ速さで通る — 向きだけが逆だ。',
    zh: '下落时，球经过每个高度的速率与上升时相同 — 只是方向相反。',
    ar: 'في الهبوط، تمرّ الكرة بكل ارتفاع بالسرعة نفسها التي كانت لها في الصعود — لكن في الاتجاه المعاكس.',
    es: 'Al bajar, la pelota pasa por cada altura con la misma rapidez que tenía al subir — solo que en sentido contrario.',
    fr: 'En redescendant, la balle passe à chaque hauteur à la même vitesse qu’à la montée — seulement en sens inverse.',
    hi: 'नीचे आते समय गेंद हर ऊँचाई से उसी चाल से गुज़रती है जो ऊपर जाते समय थी — बस दिशा उलटी है।',
    id: 'Saat turun, bola melewati setiap ketinggian dengan kelajuan yang sama seperti saat naik — hanya arahnya terbalik.',
    pt: 'Na descida, a bola passa por cada altura com a mesma velocidade que tinha na subida — só que no sentido oposto.',
  },
} satisfies Record<string, LocalizedText>);

export type VerticalThrowMessageKey = keyof typeof verticalThrowMessages;

export const text = (key: VerticalThrowMessageKey): LocalizedText => verticalThrowMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: VerticalThrowMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const verticalThrowSchema: BundleSchema = {
  id: VERTICAL_THROW_ID,
  label: text('label.title'),
  category: 'kinematics',
  description: text('label.description'),
  timeModel: 'periodic',
  // 조작기 없음 — 던지는 속력을 바꿔도 주장이 달라지지 않고, 섬광이 어긋나면 짝이 안 맞는다.
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: { g: G, v0: V0 } }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 310px + 캡션 한 줄. */
  canvas: { height: 350, minHeight: 350 },

  /** 도장 위에 화살표, 그 위에 사본, 맨 위에 공 — 원본이 그린 순서가 겹침의 뜻이다. */
  drawOrder: 'scene',

  /** 도착한 순간 공이 이미 올라가는 중이다 (원본 위상 오프셋 0.6 s). */
  startAt: 0.6,

  /**
   * 한 주기 4.8 s — 던져서 받고(flight), 완성된 좌우 대칭 그림을 보여 주고(hold),
   * 도장이 흐려진다(fade). 도장 하나하나의 밀려남·건너감은 flight 시각에 묶인
   * 시차 출발이라 단계가 아니다 (scene 의 `span`).
   */
  timeline: {
    phases: [
      { id: 'flight', duration: T_FLIGHT },
      { id: 'hold', duration: 1.4 },
      { id: 'fade', duration: 0.4 },
    ],
  },

  // 슬롯 하나, 고정 한 줄. 지금 화면에서 벌어지는 포개짐을 말한다.
  // 원본은 캔버스 아래 문단이었다 — 땅 아래 화살표(44px)에 닿지 않게 바닥에 붙인다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, 8] },
    fontSize: 15,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  messages: verticalThrowMessages,
};
