// ========================================================================
// beats — 선언
// ========================================================================
// 질문: 두 음은 각각 세기가 조금도 변하지 않는데, 왜 합쳐진 소리만 커졌다
// 작아졌다 할까.
//
// 아무것도 세지거나 약해지지 않는다. 두 음의 발걸음이 밀려 어긋날 뿐이고,
// 어긋난 만큼 서로를 지운다.
//
// 원본: tasks/piece-lab/beats/ (자유 구현)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:beats` 와 문자 그대로 일치한다 (C4). */
export const BEATS_ID = 'beats';

// ------------------------------------------------------------------------
// 자 — 원본의 픽셀을 월드로 옮긴다
// ------------------------------------------------------------------------
//
// 원본은 860×400 캔버스에 픽셀로 그렸다. 엔진은 월드 좌표를 카메라가 화면에
// 맞추므로, **위 트랙의 진폭 46 px 를 1 로** 두고 나머지를 그 자로 잰다.
// 그래야 두 트랙의 높이 비(46 대 92)가 화면 크기와 무관하게 지켜진다 — 그 비는
// 합의 최대 진폭이 원본의 두 배라는 물리에서 나온 값이라 균등 분할로 바꿀 수 없다.

/** 원본 46 px = 월드 1. */
const PX = 1 / 46;
/** 원본에서 위 트랙 기준선의 세로 자리(px). 이것이 월드 y = 0 이다. */
const ORIGIN_PY = 84;
/** 원본의 세로 픽셀 좌표 → 월드 y (위가 +). */
const wy = (py: number): number => (ORIGIN_PY - py) * PX;
/** 원본의 픽셀 길이 → 월드 길이. */
const wl = (px: number): number => px * PX;

/** 판이 담는 시간창의 가로 길이(월드). 원본 X0=20 … X1=828 의 808 px. */
export const TRACK_SPAN = wl(808);
/** 위 트랙 기준선 — 두 음의 변위 0. */
export const TONE_Y = wy(84);
/** 아래 트랙 기준선 — 합친 소리의 변위 0. 원본 YB=246. */
export const SUM_Y = wy(246);
/** 마디 세로 획의 길이(월드). 원본은 y 30 에서 344 까지 판을 관통했다. */
export const NODE_SPAN = wl(344 - 30);
/** 마디 세로 획의 한가운데. `trace` 의 tick 은 자리를 중심으로 위아래로 자란다. */
export const NODE_MID = wy((30 + 344) / 2);
/** '울렁임 한 칸' 이 놓이는 줄. 원본 y=356. */
export const BEAT_ROW_Y = wy(356);
/** 지금 흔들리는 두 음의 원 — 반지름(월드). 원본 5.5 px. */
export const TONE_DOT = wl(5.5);
/** 지금 들리는 소리의 원 — 반지름(월드). 원본 7.5 px. */
export const SUM_DOT = wl(7.5);
/**
 * '울렁임 한 칸' 에 글자를 넣는 최소 폭(월드).
 *
 * 원본은 글자 폭 + 44 px 보다 칸이 좁으면 글자를 빼고 선만 남겼다. 칸이 좁아지면
 * 글자가 스스로 사라지는 것이 이 표시의 규칙이다.
 */
export const BEAT_LABEL_MIN = wl(110);

/** 선 굵기(화면 px). 굵기는 물리량이 아니라 위계라 배율을 따라가지 않는다. */
export const TONE_LINE = 1.3;
export const SUM_LINE = 2.1;
export const GUIDE_LINE = 1;

/**
 * 프레이밍은 주장의 일부다 — 고정값을 준다 (S-piece).
 *
 * 원본이 실제로 그린 범위 그대로다. 가로는 시간창 전체(808 px), 세로는 마디 획의
 * 위 끝(30 px)부터 합친 파형이 가장 낮게 내려가는 자리 아래(362 px)까지.
 */
export const SCENE_BOUNDS = {
  minX: -TRACK_SPAN,
  maxX: 0,
  minY: wy(362),
  maxY: wy(30),
} as const;

/**
 * 마운트 전에 `step` 을 미리 굴리는 시간(초).
 *
 * 원본의 「과거 채우기」다 — 잔상 버퍼와 마디 자국을 t<0 구간까지 역산해 채워
 * 두고 시작한다. 빈 화면이 오른쪽부터 차오르는 4.5 초를 기다리게 하지 않는다
 * (S-piece: 독자가 도착한 순간 이미 진행 중).
 *
 * **20/3 초인 것은 우연이 아니다.** f₁=3 Hz · Δf=0.45 Hz 에서 이 시간은 기준 음
 * 20 주기 · 둘째 음 23 주기 · 울렁임 3 주기와 **정확히** 같다. 그래서 굴리고 난
 * 자리가 위상 0 으로 되돌아와, 마운트한 첫 화면이 원본의 t=0 과 같은 화면이 된다
 * (두 원이 포개지고 합이 가장 크게 흔들리는 자리). 시간창 4.5 초보다 길어서
 * 잔상도 이미 가득 차 있다.
 */
export const PREROLL = 20 / 3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const beatsMessages = Object.freeze({
  'label.title': {
    ko: '맥놀이',
    en: 'Beats',
    ja: 'うなり',
    zh: '拍',
    ar: 'الضربات',
    es: 'Pulsaciones',
    fr: 'Battements',
    hi: 'विस्पंद',
    id: 'Pelayangan',
    pt: 'Batimentos',
  },
  'label.operation': {
    ko: '두 음이 어긋나는 만큼 합이 지워진다',
    en: 'The sum cancels as the two drift apart',
    ja: '2つの音がずれるほど和が打ち消される',
    zh: '两个音错开多少，合成就抵消多少',
    ar: 'يُلغى المجموع كلما انزاحت النغمتان إحداهما عن الأخرى',
    es: 'La suma se anula a medida que los dos se desfasan',
    fr: 'La somme s’annule à mesure que les deux se décalent',
    hi: 'दोनों के खिसकने के साथ योग मिटता जाता है',
    id: 'Jumlahnya saling meniadakan saat keduanya bergeser',
    pt: 'A soma se anula à medida que os dois se defasam',
  },
  'label.stage': {
    ko: '두 음',
    en: 'Two tones',
    ja: '2つの音',
    zh: '两个音',
    ar: 'نغمتان',
    es: 'Dos tonos',
    fr: 'Deux sons',
    hi: 'दो स्वर',
    id: 'Dua nada',
    pt: 'Dois tons',
  },
  'label.view': {
    ko: '파형',
    en: 'Waveform',
    ja: '波形',
    zh: '波形',
    ar: 'الشكل الموجي',
    es: 'Forma de onda',
    fr: 'Forme d’onde',
    hi: 'तरंगरूप',
    id: 'Bentuk gelombang',
    pt: 'Forma de onda',
  },
  /** 마디 둘을 잇는 칸의 이름표. 칸이 좁아지면 scene 이 이것을 빼고 선만 남긴다. */
  'label.beat': {
    ko: '울렁임 한 번',
    en: 'one beat',
    ja: 'うなり1回',
    zh: '一拍',
    ar: 'ضربة واحدة',
    es: 'una pulsación',
    fr: 'un battement',
    hi: 'एक विस्पंद',
    id: 'satu pelayangan',
    pt: 'um batimento',
  },
  /** 조작기 이름표. */
  'control.df': {
    ko: '두 음의 진동수 차이',
    en: 'Difference between the two tones',
    ja: '2つの音の振動数の差',
    zh: '两个音的频率差',
    ar: 'الفرق بين النغمتين',
    es: 'Diferencia entre los dos tonos',
    fr: 'Écart entre les deux sons',
    hi: 'दोनों स्वरों के बीच अंतर',
    id: 'Selisih antara kedua nada',
    pt: 'Diferença entre os dois tons',
  },
  'caption.locked': {
    ko: '두 음이 한 치도 어긋나지 않는다 — 합친 소리가 줄곧 크다',
    en: 'The two never drift at all — the sum stays loud throughout',
    ja: '2つの音は少しもずれない — 合わさった音はずっと大きいまま',
    zh: '两个音丝毫没有错开 — 合成声始终很响',
    ar: 'لا تنزاح النغمتان أبدًا — ويبقى المجموع عاليًا طوال الوقت',
    es: 'Los dos no se desfasan en absoluto — la suma sigue fuerte todo el tiempo',
    fr: 'Les deux ne se décalent jamais — la somme reste forte tout du long',
    hi: 'दोनों ज़रा भी नहीं खिसकते — योग लगातार तेज़ बना रहता है',
    id: 'Keduanya sama sekali tidak bergeser — jumlahnya tetap keras sepanjang waktu',
    pt: 'Os dois nunca se defasam — a soma continua forte o tempo todo',
  },
  'caption.inPhase': {
    ko: '두 음이 발맞춰 흔들린다 — 합친 소리가 가장 크다',
    en: 'The two swing in step — the sum is at its loudest',
    ja: '2つの音が足並みをそろえて揺れる — 合わさった音が最も大きい',
    zh: '两个音步调一致地振动 — 合成声最响',
    ar: 'تتأرجح النغمتان بخطى متوافقة — والمجموع في أعلى صوته',
    es: 'Los dos oscilan al compás — la suma está en su punto más fuerte',
    fr: 'Les deux oscillent au pas — la somme est à son plus fort',
    hi: 'दोनों कदम मिलाकर झूलते हैं — योग सबसे तेज़ है',
    id: 'Keduanya berayun seirama — jumlahnya paling keras',
    pt: 'Os dois oscilam em compasso — a soma está no máximo',
  },
  'caption.opposed': {
    ko: '두 음이 정반대로 엇갈렸다 — 합친 소리가 사라진다',
    en: 'The two are exactly opposed — the sum vanishes',
    ja: '2つの音がちょうど逆向きになった — 合わさった音が消える',
    zh: '两个音恰好相反 — 合成声消失',
    ar: 'النغمتان متعاكستان تمامًا — ويختفي المجموع',
    es: 'Los dos están exactamente opuestos — la suma desaparece',
    fr: 'Les deux sont exactement opposés — la somme s’évanouit',
    hi: 'दोनों ठीक उलटे हैं — योग लुप्त हो जाता है',
    id: 'Keduanya tepat berlawanan — jumlahnya lenyap',
    pt: 'Os dois estão exatamente opostos — a soma desaparece',
  },
  'caption.drifting': {
    ko: '두 음이 어긋나는 중 — 합친 소리가 잦아든다',
    en: 'The two are drifting apart — the sum is dying away',
    ja: '2つの音がずれていく — 合わさった音が弱まっていく',
    zh: '两个音正在错开 — 合成声渐渐减弱',
    ar: 'النغمتان تنزاحان — والمجموع يخفت',
    es: 'Los dos se están desfasando — la suma se va apagando',
    fr: 'Les deux se décalent — la somme s’éteint peu à peu',
    hi: 'दोनों खिसकते जा रहे हैं — योग धीमा पड़ता जा रहा है',
    id: 'Keduanya makin bergeser — jumlahnya makin meredup',
    pt: 'Os dois estão se defasando — a soma vai sumindo',
  },
  'caption.returning': {
    ko: '두 음이 다시 발맞추는 중 — 합친 소리가 되살아난다',
    en: 'The two are falling back in step — the sum is coming back',
    ja: '2つの音がふたたび足並みをそろえていく — 合わさった音がよみがえる',
    zh: '两个音正重新步调一致 — 合成声又回来了',
    ar: 'تعود النغمتان إلى التوافق — ويعود المجموع',
    es: 'Los dos vuelven a ir al compás — la suma regresa',
    fr: 'Les deux se remettent au pas — la somme revient',
    hi: 'दोनों फिर कदम मिला रहे हैं — योग लौट रहा है',
    id: 'Keduanya kembali seirama — jumlahnya pulih kembali',
    pt: 'Os dois voltam a entrar em compasso — a soma está voltando',
  },
} satisfies Record<string, LocalizedText>);

export type BeatsMessageKey = keyof typeof beatsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1). */
export function text(key: BeatsMessageKey): LocalizedText {
  return beatsMessages[key];
}

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: BeatsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const beatsSchema: BundleSchema = {
  id: BEATS_ID,
  label: text('label.title'),
  category: 'waves',
  operation: text('label.operation'),
  timeModel: 'linear',

  /**
   * 파라미터가 없다. 독자가 만지는 것은 조작기 하나(두 음의 진동수 차이)이고
   * 그것은 `controllers` 의 선언이다.
   *
   * 2026-09-14 이전에는 "파라미터로 두면 상시 값 표시줄이 자동으로 선다" 가
   * 근거였는데, 그 자동 동작은 사라졌다(`param-panel` 을 선언해야 뜬다). 그래도
   * 파라미터를 두지 않는다 — 여기서 만질 것은 **차이** 하나이고, 값 둘을 따로
   * 내놓으면 무엇을 보라는 그림인지가 흐려진다.
   */
  parameters: [],

  /**
   * 화면에 적지 않는 수들. 기준 음 3 Hz 는 눈으로 흔들림을 셀 수 있게 실제 소리보다
   * 100 배쯤 늦춘 값이고, 늦춰도 어긋남과 울렁임의 관계는 그대로라 화면에 두지
   * 않았다 — 적으면 3 Hz 가 소리처럼 읽힌다 (원본 NOTES).
   */
  stages: [
    {
      id: 'tones',
      label: text('label.stage'),
      constants: { f1: 3, df0: 0.45, window: 4.5 },
    },
  ],

  environments: [],

  views: [{ id: 'waveform', label: text('label.view'), default: true }],


  /** 원본 판과 같은 크기(860×400). 마운트 뒤에는 바뀌지 않는다 (원칙 6). */
  canvas: { height: 400, minHeight: 360 },

  /**
   * **겹침이 판정 장치다.** 기본 층 순서에서는 매질(`region` 45)이 궤적(20)과
   * 물체(40) 위로 올라와, 「두 음이 벌어진 자리」 띠가 두 음의 파형과 원을 덮는다.
   * 원본은 띠를 깔고 그 위에 파형을 긋는다 — 벌어진 자리는 두 곡선 **사이**에
   * 있는 것이지 곡선을 가리는 것이 아니다. 그래서 순서를 scene 이 쥔다 (S-render).
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 진행 중. 자세한 이유는 위 `PREROLL`. */
  preroll: PREROLL,

  /**
   * 캡션 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다.
   *
   * **시각이 아니라 상태로 고른다.** 이 조각에는 주기 안 단계가 없다 — 문장이
   * 갈리는 시점은 두 음의 위상차가 어디에 있느냐에 달려 있고, 독자가 진동수 차이를
   * 바꾸면 그 시점 자체가 옮겨 간다. 시간표로는 나눌 수 없다 (`CaptionSlotDef.cases`).
   *
   * 순서가 규칙이다 — 위에서부터 훑어 참인 첫 항목을 쓴다. 조건을 세는 것은
   * `physics.ts` 이고 여기서는 그 결과가 놓인 자리만 가리킨다 (원칙 2).
   */
  caption: {
    anchor: { screen: 'bottom-left' },
    align: 'left',
    fontSize: 15,
    cases: [
      { when: 'phase.locked', text: key('caption.locked') },
      { when: 'phase.inPhase', text: key('caption.inPhase') },
      { when: 'phase.opposed', text: key('caption.opposed') },
      { when: 'phase.drifting', text: key('caption.drifting') },
      { when: 'phase.returning', text: key('caption.returning') },
    ],
    text: key('caption.returning'),
  },

  /**
   * 크롬은 켜지 않는다 (기본값). 그리드는 "여기서 거리를 재라" 는 지시인데 이
   * 그림에서 재야 할 것은 거리가 아니라 **마디 사이의 간격**이고, 그것은 이미
   * '울렁임 한 칸' 이 재어 보이고 있다.
   */

  messages: beatsMessages,
};
