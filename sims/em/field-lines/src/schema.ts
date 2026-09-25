// ========================================================================
// field-lines — 선언
// ========================================================================
// 질문: 전기력선은 사람이 그린 선인데, 선이 몰린 곳이 **정말로** 장이 센 곳인가.
//
// 선과 독립된 두 번째 표현 — 끈적한 매질 속 대전 알갱이 — 의 빠르기가 그 자리의
// 세기다. 선이 몰린 곳을 지나는 알갱이가 빨라진다.
//
// 원본: tasks/piece-lab/field-lines. 상수는 원본 그대로다. 좌표는 원본 캔버스의
// px(840 × 340, y 아래)로 두고, 월드(y 위)로 뒤집는 것은 scene 의 일이다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:field-lines` 와 문자 그대로 일치한다 (C4). */
export const FIELD_LINES_ID = 'field-lines';

/** 무대 — 원본 캔버스(px). */
export const STAGE = { width: 840, height: 340 } as const;

/**
 * 긴 대전 막대의 단면(2차원 장, 세기 ∝ 1/r). 선을 전하량에 비례한 개수로 고르게
 * 내보내면 선의 촘촘함이 세기와 **정확히** 비례한다 — 점전하(1/r²)의 평면 그림은
 * 그렇지 않다. 막대라는 설정은 화면에 쓰지 않고 문단의 몫으로 남긴다.
 */
export const PLUS = { x: 300, y: 170, q: 2 } as const;
export const MINUS_Q = -1;
/** 전하량 1당 선 가닥 수. 양전하 +2 → 24가닥. */
export const LINES_PER_Q = 12;

/** 음전하 자동 경로 — 양전하 둘레를 도는 타원. 주기(초)와 모양. */
export const ORBIT = { period: 18, phase: -0.9, cx: 505, cy: 170, rx: 160, ry: 110 } as const;
/** 음전하가 목표 자리를 따라가는 시상수(초). 놓으면 이 빠르기로 경로에 돌아간다. */
export const FOLLOW_TAU = 0.5;
/** 두 전하 중심 사이 최소 거리(px). 겹치지 않게. */
export const MIN_APART = 44;
/** 끌 때 음전하 중심이 무대 가장자리에서 떨어져 있어야 하는 거리(px). */
export const DRAG_MARGIN = 14;

/** 전기력선 추적 — 걸음(px) · 최대 걸음 수 · 출발 반지름(px) · 흡수 반지름(px) · 화면 밖 여유(px). */
export const TRACE = { step: 2.5, maxSteps: 1100, startR: 9, sinkR: 7, outMargin: 30 } as const;

/** 떠밀리는 알갱이. */
export const GRAINS = {
  count: 950,
  /** px/s 당 장 세기 — 종단 속도가 장에 비례한다. */
  mobility: 2600,
  /** 전하 바로 곁의 발산만 막는 속도 상한(px/s). */
  maxSpeed: 420,
  /** 꼬리 길이 = 속도 × 이 시간(초). */
  streakTime: 0.17,
  /** 꼬리 길이 상한(px). */
  streakMax: 60,
  /** 수명(초) = min + random × span. */
  lifeMin: 1.6,
  lifeSpan: 2.4,
  /** 태어나고 사라질 때 흐려지는 시간(초). */
  fade: 0.35,
  /** 꼬리 알파. */
  alpha: 0.75,
  /** 음전하에 빨려 드는 반지름(px). */
  sinkR: 9,
  /** 화면 밖 여유(px). 넘으면 다시 태어난다. */
  outMargin: 10,
} as const;

/** 원본 PieceKit 과 같은 시드. 같은 시드는 같은 알갱이 배치를 만든다. */
export const GRAIN_SEED = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const fieldLinesMessages = Object.freeze({
  'label.title': {
    ko: '전기력선',
    en: 'Electric field lines',
    ja: '電気力線',
    zh: '电场线',
    ar: 'خطوط المجال الكهربائي',
    es: 'Líneas de campo eléctrico',
    fr: 'Lignes de champ électrique',
    hi: 'विद्युत क्षेत्र रेखाएँ',
    id: 'Garis medan listrik',
    pt: 'Linhas de campo elétrico',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '장을 그리는 규약과 그 뜻',
    en: 'The convention for drawing a field, and what it means',
    ja: '場を描く約束ごととその意味',
    zh: '描绘场的约定及其含义',
    ar: 'اصطلاح رسم المجال ومعناه',
    es: 'La convención para dibujar un campo y su significado',
    fr: 'La convention pour dessiner un champ, et ce qu’elle signifie',
    hi: 'क्षेत्र को खींचने की परिपाटी और उसका अर्थ',
    id: 'Konvensi menggambar medan dan maknanya',
    pt: 'A convenção para desenhar um campo, e o que ela significa',
  },
  'label.stage': {
    ko: '두 전하',
    en: 'Two charges',
    ja: '二つの電荷',
    zh: '两个电荷',
    ar: 'شحنتان',
    es: 'Dos cargas',
    fr: 'Deux charges',
    hi: 'दो आवेश',
    id: 'Dua muatan',
    pt: 'Duas cargas',
  },
  'label.view': {
    ko: '선과 알갱이',
    en: 'Lines and grains',
    ja: '線と粒',
    zh: '线与颗粒',
    ar: 'الخطوط والحبيبات',
    es: 'Líneas y granos',
    fr: 'Lignes et grains',
    hi: 'रेखाएँ और कण',
    id: 'Garis dan butiran',
    pt: 'Linhas e grãos',
  },
  'caption.main': {
    ko: '선이 몰린 곳을 지나는 알갱이는 빨라지고, 선이 성긴 곳에서는 느려진다',
    en: 'Grains speed up where the lines crowd together and slow down where they spread apart',
    ja: '線が密集するところを通る粒は速くなり、線がまばらなところでは遅くなる',
    zh: '颗粒经过线密集处时变快，在线稀疏处变慢',
    ar: 'تتسارع الحبيبات حيث تتزاحم الخطوط وتتباطأ حيث تتباعد',
    es: 'Los granos se aceleran donde las líneas se aprietan y se frenan donde se separan',
    fr: 'Les grains accélèrent là où les lignes se resserrent et ralentissent là où elles s’écartent',
    hi: 'जहाँ रेखाएँ पास-पास सिमटती हैं वहाँ कण तेज़ हो जाते हैं, और जहाँ वे फैलती हैं वहाँ धीमे पड़ जाते हैं',
    id: 'Butiran melaju cepat di tempat garis-garis rapat dan melambat di tempat garis-garis renggang',
    pt: 'Os grãos aceleram onde as linhas se aglomeram e desaceleram onde elas se afastam',
  },
} satisfies Record<string, LocalizedText>);

export type FieldLinesMessageKey = keyof typeof fieldLinesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: FieldLinesMessageKey): LocalizedText => fieldLinesMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: FieldLinesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const fieldLinesSchema: BundleSchema = {
  id: FIELD_LINES_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'continuous',

  // 고를 값이 없다. 손잡이는 음전하 끌기 하나뿐이다 (controllers.ts).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /**
   * 원본 캔버스 840 × 340 에 캡션 띠를 더한 높이. 마운트 후 바뀌지 않는다 (원칙 6).
   * 원본은 캡션이 캔버스 밖 figcaption 이었다 — 슬롯이 캔버스 안에 있으므로 그림
   * 아래에 띠를 비워 둔다 (scene.ts `boundsHint`).
   */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 원본에는 주기 안 단계가 없다 — 음전하가 18초 주기로 돌고 알갱이는 쉬지 않고
   * 흐르며, 캡션은 고정 한 문장이다. 그래서 `timeline` 을 두지 않는다.
   *
   * 음전하의 18초 경로는 `step` 안에 있다. 손을 뗀 뒤 0.5초 시상수로 경로에
   * 돌아가는 누적 상태라 시각의 함수가 아니고, `step` 은 시간표 프레임을 받지
   * 못한다 (NOTES.md 「어휘 부족」 G01).
   *
   * 프리롤도 없다 — 원본이 그랬듯 알갱이가 **처음부터 수명 중간의 나이**로 태어나
   * 도착한 순간 이미 흐르고 있다 (state.ts).
   */

  /** 그리는 순서가 곧 겹침이다 — 알갱이 → 선 → 양전하 → 음전하 (원본 그대로). */
  drawOrder: 'scene',

  // 슬롯 하나, 고정 문장. 어느 배치 · 조작에서도 "선이 몰린 곳이 빠르다" 는 참이다 —
  // 같은 장에서 나온 두 표현이라서.
  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -6] },
    align: 'left',
    fontSize: 15,
    style: { colorRole: 'muted', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 촘촘함과 빠르기다.

  messages: fieldLinesMessages,
};
