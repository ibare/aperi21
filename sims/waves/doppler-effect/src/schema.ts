// ========================================================================
// doppler-effect — 선언
// ========================================================================
// 질문: 구급차가 다가올 때 소리가 높아지는 것은 앞쪽으로 나가는 소리가 더
// 빨라져서인가.
//
// 아니다. 파면은 하나하나 같은 빠르기로 퍼지는 완전한 원인데, 원천이 자기
// 방출점을 앞으로 밀고 가므로 앞쪽에서 파면 **사이**가 좁아진다.
//
// 원본: tasks/piece-lab/doppler-effect/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:doppler-effect` 와 문자 그대로 일치한다 (C4). */
export const DOPPLER_EFFECT_ID = 'doppler-effect';

// ------------------------------------------------------------------------
// 눈금 — 월드와 화면 px 의 관계
// ------------------------------------------------------------------------
//
// 이 조각은 **파면을 `trace`(shape: 'ring' + `spreadTo`)로 그린다.** 그런데
// `trace` 의 `size`·`spreadTo` 는 화면 px 이고 `marks[].pos` 는 월드다. 곧 파면의
// 반지름은 배율을 따라가지 않고 방출점 사이 간격은 따라간다 — 둘의 비가 배율에
// 따라 달라지면 "파면이 퍼지는 속력은 그대로인데 방출점만 밀린다" 는 주장이
// 화면에서 틀린 그림이 된다.
//
// **그래서 경계를 이 배율이 나오는 크기로 고정한다.** 프레이밍은 주장의 일부라
// 선언에 있어야 하고(S-piece), 매 프레임 같은 값이라야 카메라가 흔들리지 않는다
// (원칙 6). 배율에 묶인 채로 고정하는 것이라 어휘가 `size` 를 월드로도 받게 되면
// 이 묶임은 풀린다 — NOTES.md 「어휘 부족」.
/** 월드 한 칸이 몇 화면 px 인가. 아래 경계가 이 배율을 내도록 맞춰져 있다. */
export const PX_PER_WORLD = 20;

/**
 * 고정 경계. 세로는 `canvas` 높이(480) ÷ 배율, 가로는 원본 폭(880) ÷ 배율이다.
 *
 * 원천이 지나는 구간(±24.5)보다 좁다 — 구급차가 화면 밖으로 나갔다 되돌아오는
 * 것이 이 조각의 이음매이고, 그 순간이 보이지 않아야 한다. 파면 반지름은 화면
 * px 라 경계와 무관하다.
 */
export const SCENE_BOUNDS = { minX: -22, maxX: 22, minY: -12, maxY: 12 } as const;

/** 구급차가 달리는 높이. 원본은 장면 한가운데(AXIS_Y = 146)였다. */
export const AXIS_Y = 0;

// ------------------------------------------------------------------------
// 물리 상수 — 원본 px 값을 월드로 옮긴 것
// ------------------------------------------------------------------------

/** 파면이 퍼지는 속력(월드/초). 모든 파면에 똑같이 걸린다. 원본 116 px/s. */
export const WAVE_SPEED = 5.8;
/** 자동 진행의 등속 구간 원천 속력(월드/초). v/c = 0.60. 원본 70 px/s. */
export const CRUISE_SPEED = 3.5;
/** 방출 주기(초). */
export const EMIT_PERIOD = 0.45;
/** 파면이 이 반지름(월드)에 이르면 사라진다. 원본 400 px. */
export const WAVE_RANGE = 20;

/**
 * 파면 하나의 수명(초) = 반지름 ÷ 속력. `trace.life` 다.
 *
 * 나이가 수명에 대한 비율로 반지름을 정하므로(`size` → `spreadTo`), 이 둘을
 * 함께 두어야 파면이 `WAVE_SPEED` 로 퍼진다.
 */
export const FRONT_LIFE = WAVE_RANGE / WAVE_SPEED;
/**
 * 다 자란 파면의 화면 반지름(px). 월드 반지름 × 배율이다.
 *
 * 이 값이 어긋나면 파면과 방출점이 따로 논다 — 파면은 화면 px 로, 방출점은
 * 월드로 놓이기 때문이다.
 */
export const RING_SPREAD_PX = WAVE_RANGE * PX_PER_WORLD;

// ------------------------------------------------------------------------
// 자동 진행 시간표
// ------------------------------------------------------------------------
//
// `BundleSchema.timeline` 으로 두지 못했다. 엔진은 시간표를 `scene` 에만
// 넘기는데(`Bundle.step` 의 인자에 없다) 이 조각의 단계가 모는 것은 **적분되는
// 위치**라 `step` 안에 있어야 하고, 독자가 슬라이더를 잡는 순간 자동 진행이
// 양보해야 해서 시계만 보고 도는 시간표로는 표현되지 않는다.
// NOTES.md 「어휘 부족」.

/** 정지 구간 끝(초). 여기까지 원천이 멈춰 있다 — 비교의 기준선이다. */
export const PHASE_STOP_END = 3.0;
/** 가속 구간 끝(초). 이 사이 v/c 가 0 에서 0.60 으로 오른다. */
export const PHASE_ACCEL_END = 3.8;
/** 한 바퀴(초). 이 시각에 구급차는 화면 오른쪽 밖에 있어 되돌림이 보이지 않는다. */
export const CYCLE = 13.4;
/** 「출발한다」 캡션이 가속이 끝난 뒤에도 머무는 시간(초). */
export const STARTING_TAIL = 1.6;

/** 출발 자리(월드). 원본 x = 210. */
export const SOURCE_START_X = -11.5;
/** 여기를 넘으면 왼쪽 밖에서 다시 들어온다. 수동 조작 때만 쓰인다. 원본 930. */
export const SOURCE_WRAP_OUT = 24.5;
/** 되돌아 들어오는 자리. 원본 −50. */
export const SOURCE_WRAP_IN = -24.5;

/** 손으로 고른 v/c 가 이보다 작으면 「멈춰 있다」로 읽는다. */
export const STOPPED_EPS = 0.02;
/** 원천 속도 슬라이더의 상한. v ≥ c 의 충격파는 다른 주장이다. */
export const MAX_VC = 0.85;

/**
 * 마운트 전에 미리 굴리는 시간(초) = 멈춰 있던 파면 7개.
 *
 * 독자가 도착한 순간 이미 진행 중이어야 한다 (S-piece). 원본은 `for` 루프로
 * 목록에 직접 밀어 넣었고, 여기서는 `step` 을 그만큼 굴린다. 초기 `tau` 가
 * 이 값만큼 음수라 프리롤 구간이 통째로 정지 구간에 들어간다 — 마운트 시점의
 * `tau` 는 0 이고, 거기서 정지 구간이 3 초 더 남는다.
 */
export const PREROLL = 3.15;

// ------------------------------------------------------------------------
// 그리는 값 — 화면 px
// ------------------------------------------------------------------------

/** 파면 선 굵기(화면 px). 앞쪽 간격이 좁아도 두 선으로 읽히려면 얇아야 한다. */
export const RING_WIDTH_PX = 1.2;
/** 방출점 반지름(화면 px). */
export const EMISSION_DOT_PX = 1.9;
/** 파면의 잉크 농도. 여럿이 겹쳐도 한 겹씩 읽히는 정도. */
export const FRONT_OPACITY = 0.62;
/** 방출점의 잉크 농도. 파면보다 조금 짙다 — 점 하나가 파면 한 줄보다 작다. */
export const EMISSION_OPACITY = 0.8;
/** 캡션 글자 크기(화면 px). */
export const CAPTION_FONT_PX = 14;

/**
 * 구급차 외형. `pos` 기준 **월드 단위, y 는 위**이고 채움만 한다.
 *
 * 세 조각이다 — 차체 · 경광등 · 창. 창은 **반대로 감아** 구멍으로 둔다(nonzero
 * winding). 그래야 배경이 그대로 비쳐 원본의 밝은 창이 된다. 색을 하나 더 쓰면
 * 강조색이 두 뜻을 갖는다 (S-piece: 강조색은 한 가지 뜻에만).
 */
export const AMBULANCE_PATH =
  'M -0.5 0.35 L 0.5 0.35 Q 0.65 0.35 0.65 0.2 L 0.65 -0.15 Q 0.65 -0.3 0.5 -0.3 ' +
  'L -0.5 -0.3 Q -0.65 -0.3 -0.65 -0.15 L -0.65 0.2 Q -0.65 0.35 -0.5 0.35 Z ' +
  'M -0.19 0.5 L -0.01 0.5 Q 0.05 0.5 0.05 0.44 L 0.05 0.41 Q 0.05 0.35 -0.01 0.35 ' +
  'L -0.19 0.35 Q -0.25 0.35 -0.25 0.41 L -0.25 0.44 Q -0.25 0.5 -0.19 0.5 Z ' +
  'M 0.195 0.225 Q 0.125 0.225 0.125 0.155 L 0.125 0.045 Q 0.125 -0.025 0.195 -0.025 ' +
  'L 0.405 -0.025 Q 0.475 -0.025 0.475 0.045 L 0.475 0.155 Q 0.475 0.225 0.405 0.225 Z';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dopplerEffectMessages = Object.freeze({
  'label.title': {
    ko: '도플러 효과',
    en: 'Doppler effect',
    ja: 'ドップラー効果',
    zh: '多普勒效应',
    ar: 'تأثير دوبلر',
    es: 'Efecto Doppler',
    fr: 'Effet Doppler',
    hi: 'डॉप्लर प्रभाव',
    id: 'Efek Doppler',
    pt: 'Efeito Doppler',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '움직이는 원천이 앞뒤 파면 간격을 갈라 놓는 것',
    en: 'How a moving source splits the spacing of the wavefronts ahead and behind',
    ja: '動く波源が前後の波面の間隔を分けること',
    zh: '运动的波源让前后波面的间距分开',
    ar: 'كيف يفرّق المصدر المتحرك المسافات بين جبهات الموجة أمامه وخلفه',
    es: 'Cómo una fuente en movimiento separa el espaciado de los frentes de onda por delante y por detrás',
    fr: 'Comment une source en mouvement sépare l’écartement des fronts d’onde devant et derrière',
    hi: 'गतिशील स्रोत आगे और पीछे के तरंगाग्रों के अंतराल को कैसे अलग कर देता है',
    id: 'Bagaimana sumber yang bergerak memisahkan jarak antarmuka gelombang di depan dan di belakang',
    pt: 'Como uma fonte em movimento separa o espaçamento das frentes de onda à frente e atrás',
  },
  'label.stage': {
    ko: '매질',
    en: 'Medium',
    ja: '媒質',
    zh: '介质',
    ar: 'الوسط',
    es: 'Medio',
    fr: 'Milieu',
    hi: 'माध्यम',
    id: 'Medium',
    pt: 'Meio',
  },
  'label.view': {
    ko: '파면',
    en: 'Wavefronts',
    ja: '波面',
    zh: '波前',
    ar: 'جبهات الموجة',
    es: 'Frentes de onda',
    fr: 'Fronts d’onde',
    hi: 'तरंगाग्र',
    id: 'Muka gelombang',
    pt: 'Frentes de onda',
  },
  /** 원천 속도 슬라이더의 이름표. */
  'label.speed': {
    ko: '원천 속도',
    en: 'Source speed',
    ja: '波源の速さ',
    zh: '波源速率',
    ar: 'سرعة المصدر',
    es: 'Rapidez de la fuente',
    fr: 'Vitesse de la source',
    hi: 'स्रोत की चाल',
    id: 'Kelajuan sumber',
    pt: 'Velocidade da fonte',
  },
  'caption.stopped': {
    ko: '구급차가 멈춰 있다 — 파면이 사방으로 같은 간격으로 퍼진다.',
    en: 'The ambulance stands still — the fronts spread evenly in every direction.',
    ja: '救急車は止まっている — 波面は四方へ同じ間隔で広がる。',
    zh: '救护车静止不动 — 波前向四面八方均匀散开。',
    ar: 'سيارة الإسعاف متوقفة — تنتشر الجبهات بتباعد متساوٍ في كل الاتجاهات.',
    es: 'La ambulancia está parada — los frentes se propagan por igual en todas direcciones.',
    fr: 'L’ambulance est à l’arrêt — les fronts s’étalent uniformément dans toutes les directions.',
    hi: 'एम्बुलेंस खड़ी है — तरंगाग्र हर दिशा में समान दूरी पर फैलते हैं।',
    id: 'Ambulans diam — muka gelombang menyebar merata ke segala arah.',
    pt: 'A ambulância está parada — as frentes se espalham por igual em todas as direções.',
  },
  'caption.starting': {
    ko: '구급차가 출발한다 — 새로 나가는 파면이 앞쪽에서 서로 가까워진다.',
    en: 'The ambulance sets off — the new fronts close in on each other ahead of it.',
    ja: '救急車が動き出す — 新しく出る波面が前方で互いに近づく。',
    zh: '救护车起步了 — 新发出的波前在它前方彼此靠拢。',
    ar: 'تنطلق سيارة الإسعاف — تتقارب الجبهات الجديدة بعضها من بعض أمامها.',
    es: 'La ambulancia arranca — los nuevos frentes se acercan entre sí por delante de ella.',
    fr: 'L’ambulance démarre — les nouveaux fronts se rapprochent les uns des autres devant elle.',
    hi: 'एम्बुलेंस चल पड़ती है — नए तरंगाग्र उसके आगे एक-दूसरे के पास आते जाते हैं।',
    id: 'Ambulans mulai bergerak — muka gelombang baru saling merapat di depannya.',
    pt: 'A ambulância arranca — as novas frentes se aproximam umas das outras à frente dela.',
  },
  'caption.running': {
    ko: '앞쪽은 촘촘하고 뒤쪽은 성기다 — 파면은 그대로 퍼지고, 방출점만 앞으로 밀렸다.',
    en: 'Crowded ahead, spread out behind — the fronts are unchanged; only the emission points moved.',
    ja: '前方は詰まり、後方はまばら — 波面そのものは変わらず、放出点だけが前へ動いた。',
    zh: '前方密集，后方稀疏 — 波前本身没变，只是发射点向前移了。',
    ar: 'متزاحمة في الأمام، متباعدة في الخلف — الجبهات لم تتغير؛ إنما تحرّكت نقاط الانبعاث وحدها.',
    es: 'Apiñados delante, espaciados detrás — los frentes no cambian; solo se movieron los puntos de emisión.',
    fr: 'Serrés devant, espacés derrière — les fronts sont inchangés ; seuls les points d’émission ont bougé.',
    hi: 'आगे घने, पीछे विरल — तरंगाग्र वैसे ही हैं; केवल उत्सर्जन बिंदु खिसके हैं।',
    id: 'Rapat di depan, renggang di belakang — muka gelombang tidak berubah; hanya titik-titik pancarnya yang bergeser.',
    pt: 'Apertadas à frente, espaçadas atrás — as frentes não mudaram; só os pontos de emissão se moveram.',
  },
} satisfies Record<string, LocalizedText>);

export type DopplerEffectMessageKey = keyof typeof dopplerEffectMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: DopplerEffectMessageKey): LocalizedText {
  return dopplerEffectMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DopplerEffectMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dopplerEffectSchema: BundleSchema = {
  id: DOPPLER_EFFECT_ID,
  label: text('label.title'),
  category: 'waves',
  description: text('label.description'),
  timeModel: 'linear',

  // 파라미터를 두지 않는다. 독자가 손대는 것은 원천 속도 하나이고 그것은
  // 조작기다 — 파라미터로 두면 패널이 뜨고, 패널은 크롬이다 (S-piece).
  parameters: [],

  /**
   * 자동 진행의 단계 길이를 **선언에 둔다** (S-piece 「시간표는 선언이다」).
   *
   * `BundleSchema.timeline` 으로는 두지 못했다 — 엔진이 시간표를 `scene` 에만
   * 넘기는데 이 조각의 단계가 모는 것은 적분되는 위치라 `step` 안에 있어야 하고,
   * 독자가 슬라이더를 잡는 순간 자동 진행이 양보해야 해서 시계만 보고 도는
   * 시간표로는 표현되지 않는다 (NOTES 「어휘 부족」).
   *
   * 그렇다고 코드 상수로 두면 저작자가 "정지 구간을 0.3 초 더" 를 할 수 없다.
   * 스테이지 상수는 그 둘 사이의 자리다 — `physics.readConstants` 가 읽고,
   * 아래 모듈 상수는 값이 비었을 때의 기본값으로만 남는다.
   */
  stages: [
    {
      id: 'medium',
      label: text('label.stage'),
      constants: {
        stopEnd: PHASE_STOP_END,
        accelEnd: PHASE_ACCEL_END,
        cycle: CYCLE,
        cruise: CRUISE_SPEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'fronts', label: text('label.view'), default: true }],

  /**
   * 원본은 880 × 330 이었다. 세로를 480 으로 두는 것은 러너 둘이 같은 화면을
   * 열게 하기 위한 것이다 — react 임베드의 무대는 CSS 로 480 에 잡혀 있고
   * `runBundle` 만 이 선언을 읽는다.
   */
  canvas: { height: 480, minHeight: 420 },

  /**
   * 도착한 순간 이미 멈춰 있던 파면 7개가 퍼져 있다. 첫 화면이 비면 "앞뒤
   * 간격이 같다" 는 기준선이 없어 뒤이어 좁아지는 것을 견줄 데가 없다.
   */
  preroll: PREROLL,

  /**
   * 슬롯 하나. 시각이 아니라 **상태**로 고른다 — 독자가 슬라이더로 속도를 0 으로
   * 내리면 시계와 무관하게 「멈춰 있다」로 돌아가야 한다. 위에서부터 훑어 참인
   * 첫 항목을 쓰고, 아무것도 참이 아니면 `text` 다.
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    fontSize: CAPTION_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
    text: key('caption.running'),
    cases: [
      { when: 'says.stopped', text: key('caption.stopped') },
      { when: 'says.starting', text: key('caption.starting') },
    ],
  },

  /**
   * 그리드도 카메라 버튼도 없다 (기본값). 간격은 파면끼리의 관계라 바깥 자가
   * 필요 없고, 그리드는 "여기서 거리를 재라" 는 지시라 오독의 경로가 된다.
   */

  messages: dopplerEffectMessages,
};
