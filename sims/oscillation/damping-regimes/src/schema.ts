// ========================================================================
// damping-regimes — 선언
// ========================================================================
// 질문: 흔들리는 것을 빨리 멈추게 하려면 감쇠를 세게 할수록 좋은가?
//
// 답: 아니다. 감쇠를 키우면 넘실거림은 사라지지만, 어느 선(임계 감쇠)을 넘으면
// 오히려 제자리에 늦게 돌아온다. **가장 빨리 멎는 것은 임계 감쇠**다.
//
// 화면에서는 같은 용수철 · 같은 추 셋을 같은 만큼 당겼다가 동시에 놓는다. 다른 것은
// 감쇠의 세기뿐이다. 각 추가 제 줄의 시간 곡선을 그리는 펜이 되고, 멎은 때에
// 눈금이 찍힌다 — 임계 감쇠의 눈금이 가장 앞에 선다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:damping-regimes` 와 문자 그대로 일치한다 (C4). */
export const DAMPING_REGIMES_ID = 'damping-regimes';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 고유 각진동수 ω₀(rad/s). 감쇠가 없을 때 주기 1.6 초. 세 추 모두 같다. */
export const OMEGA = (2 * Math.PI) / 1.6;
/** 당긴 거리(m). 세 추 모두 같은 만큼 아래로 당겼다가 놓는다. */
export const AMPLITUDE = 0.34;
/**
 * 부족 감쇠의 감쇠비 ζ. 한 번 지나칠 때마다 진폭이 약 0.62 배로 줄어 넘실거림이
 * 여러 번 보인다. 0.3 쯤으로 키우면 두어 번 만에 끝나 「넘실거린다」 가 약하다.
 */
export const ZETA_UNDER = 0.15;
/**
 * 임계 감쇠의 감쇠비. 정의상 1 이다 — 스테이지 상수로 두지 않는다. 바꾸면 이 줄은
 * 더 이상 「임계」 가 아니고, 이름표가 거짓말을 한다.
 */
export const ZETA_CRITICAL = 1;
/**
 * 과도 감쇠의 감쇠비 ζ. 3 이면 느린 쪽 지수가 ω₀ 의 0.17 배라 임계보다 네 배쯤 늦게
 * 멎는다. 이보다 작으면(1.5 쯤) 임계와 차이가 작아 「오히려 늦다」 가 눈에 덜 띈다.
 */
export const ZETA_OVER = 3;
/**
 * 멎었다고 보는 폭 — 당긴 거리의 이 몫 안으로 들어와 **다시 나가지 않는** 때.
 * 5 % 는 화면에서 1~2 px 이라 그 뒤로 눈에 보이는 움직임이 없다.
 */
export const SETTLE_BAND = 0.05;
/** 곡선이 그리는 시간 창(초). 과도 감쇠 · 부족 감쇠가 모두 멎는 데까지. */
export const WINDOW = 6;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위 = 1 m (세로 변위), 가로는 시간 1 초 = TIME_SCALE.
// 줄 셋을 위에서부터 부족 · 임계 · 과도 순으로 쌓는다 (감쇠가 아래로 갈수록 세다).
// ------------------------------------------------------------------------

/** 세 줄의 평형 높이(월드 y). 위에서부터 부족 · 임계 · 과도. */
export const ROW_Y = [1.12, 0, -1.12] as const;
/** 천장이 평형에서 위로 떨어진 거리. */
export const CEILING_RISE = 0.5;
/** 천장 보의 반너비. */
export const CEILING_HALF_W = 0.2;
/** 추의 반너비 · 반높이. */
export const MASS_HALF_W = 0.13;
export const MASS_HALF_H = 0.06;
/** 시간 곡선이 시작하는 x(월드). 추의 오른쪽에 조금 띄운다. */
export const PLOT_X0 = 0.45;
/** 시간 1 초가 차지하는 가로 길이(월드). */
export const TIME_SCALE = 0.9;
/** 곡선 표본 간격(초). */
export const SAMPLE_DT = 0.02;
/** 멎음 눈금의 반높이(월드). */
export const SETTLE_TICK_HALF = 0.2;

/**
 * 프레이밍 — 왼쪽은 천장 보, 오른쪽은 시간 창 끝, 아래는 캡션 줄 자리.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다).
 */
export const SCENE_BOUNDS = { minX: -0.4, maxX: 6.04, minY: -1.9, maxY: 1.72 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dampingRegimesMessages = Object.freeze({
  'label.title': {
    ko: '감쇠의 세 양상',
    en: 'Three regimes of damping',
    ja: '減衰の三つの状態',
    zh: '阻尼的三种情形',
    ar: 'ثلاثة أنظمة للتخميد',
    es: 'Tres regímenes de amortiguamiento',
    fr: 'Trois régimes d’amortissement',
    hi: 'अवमंदन की तीन अवस्थाएँ',
    id: 'Tiga rezim redaman',
    pt: 'Três regimes de amortecimento',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '부족·임계·과도 감쇠',
    en: 'Underdamped, critically damped and overdamped motion',
    ja: '不足減衰・臨界減衰・過減衰の運動',
    zh: '欠阻尼、临界阻尼与过阻尼运动',
    ar: 'الحركة المخمَّدة تخميدًا ناقصًا وحرجًا ومفرطًا',
    es: 'Movimiento subamortiguado, críticamente amortiguado y sobreamortiguado',
    fr: 'Mouvement sous-amorti, à amortissement critique et suramorti',
    hi: 'अल्प-अवमंदित, क्रांतिक अवमंदित और अति-अवमंदित गति',
    id: 'Gerak teredam kurang, teredam kritis, dan teredam lebih',
    pt: 'Movimento subamortecido, criticamente amortecido e superamortecido',
  },
  'label.stage': {
    ko: '같은 용수철 셋',
    en: 'Three identical springs',
    ja: '同じばね三つ',
    zh: '三根相同的弹簧',
    ar: 'ثلاثة نوابض متماثلة',
    es: 'Tres resortes idénticos',
    fr: 'Trois ressorts identiques',
    hi: 'तीन एक जैसी स्प्रिंगें',
    id: 'Tiga pegas identik',
    pt: 'Três molas idênticas',
  },
  'label.view': {
    ko: '시간 곡선',
    en: 'Time traces',
    ja: '時間変化の曲線',
    zh: '时间曲线',
    ar: 'منحنيات زمنية',
    es: 'Trazas temporales',
    fr: 'Tracés temporels',
    hi: 'समय-वक्र',
    id: 'Kurva waktu',
    pt: 'Traçados no tempo',
  },

  /** 줄 이름표. ζ 와 값은 표식이지만 이름과 이어 쓰므로 조립문으로 둔다 (C1). */
  'label.under': {
    ko: '부족 감쇠 · ζ = {zeta}',
    en: 'Underdamped · ζ = {zeta}',
    ja: '不足減衰 · ζ = {zeta}',
    zh: '欠阻尼 · ζ = {zeta}',
    ar: 'تخميد ناقص · ζ = {zeta}',
    es: 'Subamortiguado · ζ = {zeta}',
    fr: 'Sous-amorti · ζ = {zeta}',
    hi: 'अल्प-अवमंदित · ζ = {zeta}',
    id: 'Teredam kurang · ζ = {zeta}',
    pt: 'Subamortecido · ζ = {zeta}',
  },
  'label.critical': {
    ko: '임계 감쇠 · ζ = {zeta}',
    en: 'Critically damped · ζ = {zeta}',
    ja: '臨界減衰 · ζ = {zeta}',
    zh: '临界阻尼 · ζ = {zeta}',
    ar: 'تخميد حرج · ζ = {zeta}',
    es: 'Críticamente amortiguado · ζ = {zeta}',
    fr: 'Amortissement critique · ζ = {zeta}',
    hi: 'क्रांतिक अवमंदित · ζ = {zeta}',
    id: 'Teredam kritis · ζ = {zeta}',
    pt: 'Criticamente amortecido · ζ = {zeta}',
  },
  'label.over': {
    ko: '과도 감쇠 · ζ = {zeta}',
    en: 'Overdamped · ζ = {zeta}',
    ja: '過減衰 · ζ = {zeta}',
    zh: '过阻尼 · ζ = {zeta}',
    ar: 'تخميد مفرط · ζ = {zeta}',
    es: 'Sobreamortiguado · ζ = {zeta}',
    fr: 'Suramorti · ζ = {zeta}',
    hi: 'अति-अवमंदित · ζ = {zeta}',
    id: 'Teredam lebih · ζ = {zeta}',
    pt: 'Superamortecido · ζ = {zeta}',
  },
  /** 제자리로 돌아와 머물기 시작한 때의 눈금. 강조색은 이 한 가지 뜻에만 쓴다. */
  'label.settled': {
    ko: '멎음',
    en: 'settled',
    ja: '静止',
    zh: '停稳',
    ar: 'استقرّ',
    es: 'en reposo',
    fr: 'stabilisé',
    hi: 'स्थिर',
    id: 'diam',
    pt: 'parado',
  },

  'caption.hold': {
    ko: '같은 용수철 · 같은 추 셋을 같은 만큼 당겨 두었다. 다른 것은 감쇠의 세기뿐이다.',
    en: 'Three identical springs and masses, pulled down by the same amount. Only the damping differs.',
    ja: '同じばねと同じおもり三組を、同じだけ下に引いておいた。違うのは減衰の強さだけだ。',
    zh: '三根相同的弹簧挂着相同的物块，向下拉开同样的距离。唯一不同的是阻尼。',
    ar: 'ثلاثة نوابض وكتل متماثلة، سُحبت إلى الأسفل بالمقدار نفسه. لا يختلف إلا التخميد.',
    es: 'Tres resortes y masas idénticos, estirados hacia abajo la misma distancia. Solo cambia el amortiguamiento.',
    fr: 'Trois ressorts et masses identiques, tirés vers le bas de la même longueur. Seul l’amortissement diffère.',
    hi: 'तीन एक जैसी स्प्रिंगें और पिंड, बराबर दूरी तक नीचे खींचे गए। अंतर केवल अवमंदन का है।',
    id: 'Tiga pegas dan beban yang identik, ditarik ke bawah sejauh yang sama. Hanya redamannya yang berbeda.',
    pt: 'Três molas e massas idênticas, puxadas para baixo na mesma medida. Só o amortecimento é diferente.',
  },
  'caption.early': {
    ko: '임계 감쇠는 제자리를 넘치지 않고 곧장 돌아와 멎는다. 부족 감쇠는 제자리를 지나쳐 넘실거린다.',
    en: 'The critically damped mass comes straight back and stops without overshooting. The underdamped one sails past and keeps swinging.',
    ja: '臨界減衰のおもりは行き過ぎずにまっすぐ戻って止まる。不足減衰のおもりは通り過ぎて揺れ続ける。',
    zh: '临界阻尼的物块不越过平衡位置，径直回来并停下。欠阻尼的物块冲过头，继续来回振荡。',
    ar: 'الكتلة ذات التخميد الحرج تعود مباشرة وتتوقف دون أن تتجاوز. أما ذات التخميد الناقص فتندفع متجاوزةً وتظل تتأرجح.',
    es: 'La masa críticamente amortiguada vuelve directa y se detiene sin pasarse. La subamortiguada se pasa de largo y sigue oscilando.',
    fr: 'La masse à amortissement critique revient tout droit et s’arrête sans dépasser. La masse sous-amortie file au-delà et continue d’osciller.',
    hi: 'क्रांतिक अवमंदित पिंड बिना आगे निकले सीधे लौटकर रुक जाता है। अल्प-अवमंदित पिंड आगे निकल जाता है और झूलता रहता है।',
    id: 'Beban teredam kritis langsung kembali dan berhenti tanpa melewati titik setimbang. Beban teredam kurang melesat lewat dan terus berayun.',
    pt: 'A massa criticamente amortecida volta direto e para sem ultrapassar. A subamortecida passa do ponto e continua oscilando.',
  },
  'caption.late': {
    ko: '과도 감쇠는 넘실거리지 않지만 느릿느릿 기어 온다 — 감쇠를 더 키웠는데 오히려 늦다.',
    en: 'The overdamped mass never overshoots, but it creeps back slowly — more damping, yet later.',
    ja: '過減衰のおもりは行き過ぎないが、のろのろと這うように戻る — 減衰を強めたのに、かえって遅い。',
    zh: '过阻尼的物块从不越过，却慢吞吞地爬回来 — 阻尼更大，反而更晚。',
    ar: 'الكتلة ذات التخميد المفرط لا تتجاوز أبدًا، لكنها تزحف عائدةً ببطء — تخميد أكبر، ومع ذلك وصول أبطأ.',
    es: 'La masa sobreamortiguada nunca se pasa, pero vuelve arrastrándose despacio — más amortiguamiento, y aun así más tarde.',
    fr: 'La masse suramortie ne dépasse jamais, mais revient en rampant lentement — plus d’amortissement, et pourtant plus tard.',
    hi: 'अति-अवमंदित पिंड कभी आगे नहीं निकलता, पर धीरे-धीरे रेंगता हुआ लौटता है — अवमंदन ज़्यादा, फिर भी देर से।',
    id: 'Beban teredam lebih tak pernah melewati titik setimbang, tetapi merayap kembali pelan-pelan — redaman lebih besar, justru lebih lambat.',
    pt: 'A massa superamortecida nunca ultrapassa, mas volta se arrastando devagar — mais amortecimento, e ainda assim mais tarde.',
  },
  'caption.rest': {
    ko: '가장 먼저 멎은 것은 임계 감쇠다. 감쇠가 모자라면 넘실거리고, 넘치면 늦어진다.',
    en: 'The critically damped one settled first. Too little damping swings; too much drags.',
    ja: '最初に止まったのは臨界減衰だ。減衰が足りなければ揺れ、多すぎればもたつく。',
    zh: '最先停稳的是临界阻尼。阻尼太小会来回振荡，太大则拖拖拉拉。',
    ar: 'ذات التخميد الحرج استقرت أولًا. التخميد القليل يُبقيها تتأرجح، والكثير يُبطئها.',
    es: 'La críticamente amortiguada se asentó primero. Con poco amortiguamiento oscila; con demasiado, se arrastra.',
    fr: 'La masse à amortissement critique s’est stabilisée la première. Trop peu d’amortissement : elle oscille ; trop : elle traîne.',
    hi: 'सबसे पहले क्रांतिक अवमंदित पिंड थमा। कम अवमंदन से वह झूलता है; ज़्यादा से घिसटता है।',
    id: 'Yang teredam kritis diam paling dulu. Redaman terlalu kecil membuatnya berayun; terlalu besar membuatnya lamban.',
    pt: 'A criticamente amortecida parou primeiro. Com pouco amortecimento, oscila; com demais, se arrasta.',
  },
} satisfies Record<string, LocalizedText>);

export type DampingRegimesMessageKey = keyof typeof dampingRegimesMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DampingRegimesMessageKey): LocalizedText => dampingRegimesMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DampingRegimesMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dampingRegimesSchema: BundleSchema = {
  id: DAMPING_REGIMES_ID,
  label: text('label.title'),
  category: 'oscillation',
  description: text('label.description'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'three-springs',
      label: text('label.stage'),
      constants: {
        omega: OMEGA,
        amplitude: AMPLITUDE,
        zetaUnder: ZETA_UNDER,
        zetaOver: ZETA_OVER,
        settleBand: SETTLE_BAND,
        window: WINDOW,
      },
    },
  ],
  environments: [],
  views: [{ id: 'traces', label: text('label.view'), default: true }],

  /**
   * 가로로 넓다 — 줄마다 왼쪽에 추, 오른쪽에 6 초 창. 세로는 줄 셋과 캡션 한 줄이
   * 쓴다. 줄 하나의 높이는 가장 크게 넘친 부족 감쇠 추가 천장에 닿지 않을 만큼이다.
   */
  canvas: { height: 430, minHeight: 380 },

  /** 도착한 순간 이미 세 추가 놓여 움직이는 중이다 (S-piece). */
  startAt: 1.2,

  /**
   * 한 주기 9.9 초.
   *
   * - `hold` — 세 추가 같은 만큼 당겨진 채 멈춰 있다. 곡선은 아직 없다.
   * - `early` · `late` — 놓은 뒤. 두 단계를 합친 동안이 시간 창(`window`) 하나를
   *   고르게 흐른다. 둘로 나눈 것은 캡션 때문이다 — 앞은 임계가 멎는 때,
   *   뒤는 과도 감쇠가 기어 오는 때.
   * - `rest` — 세 곡선과 멎음 눈금 셋이 다 선 채로 머문다. 눈금의 앞뒤를 견줄 시간.
   * - `fade` — 옅어지며 물러난다. 끝난 화면이 남지 않도록 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'hold', duration: 0.9, caption: key('caption.hold') },
      { id: 'early', duration: 1.6, ease: 'linear', caption: key('caption.early') },
      { id: 'late', duration: 4.4, ease: 'linear', caption: key('caption.late') },
      { id: 'rest', duration: 2.4, caption: key('caption.rest') },
      { id: 'fade', duration: 0.6, caption: key('caption.rest') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 780,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 이 그림에서 견주는 것은 세 눈금의
  // 앞뒤이지 거리 눈금이 아니다 (S-piece).

  messages: dampingRegimesMessages,
};
