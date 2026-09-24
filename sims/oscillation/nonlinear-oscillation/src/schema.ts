// ========================================================================
// nonlinear-oscillation — 선언
// ========================================================================
// 질문: 되미는 힘이 변위에 비례하지 않으면 진동은 어떻게 달라지는가.
//
// 같은 용수철 둘을 위 · 아래에 매단다. 이 용수철은 **많이 늘어날수록 단단해진다** —
// 되미는 힘이 F = −k·x·(1 + (x/L)⁴) 라서 작은 변위에서는 비례하는 용수철과 거의 같고,
// L 을 넘어서면 비례보다 훨씬 세진다. 위 추는 조금, 아래 추는 크게 당겨 놓는다.
//
// 각 추 옆 기록지에는 「힘이 비례했다면」 그렸을 사인 곡선이 점선으로 미리 깔려 있다.
// 위 기록은 그 점선을 거의 그대로 따라가고, 아래 기록은 끝에서 세게 되밀려 봉우리가
// 뾰족해지고 점선보다 먼저 돌아와 점점 앞서 간다 — 같은 용수철인데 진폭이 주기를 바꾼다.
//
// 진자의 큰 진폭(pendulum-amplitude-dependence) · 위상 공간(phase-space) · 사인 기록지
// (simple-harmonic-motion)는 이웃 조각의 몫이다. 이 조각은 복원력의 **모양**이 기록의
// 모양과 주기를 바꾸는 것에 머문다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:nonlinear-oscillation` 와 문자 그대로 일치한다 (C4). */
export const NONLINEAR_OSCILLATION_ID = 'nonlinear-oscillation';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 추의 질량(kg). 두 추가 같다. */
export const MASS = 0.5;
/** 작은 변위에서의 용수철 상수(N/m). 점선(비례하는 용수철)이 이 값 하나로 그려진다. */
export const STIFFNESS = 5;
/**
 * 단단해지기 시작하는 길이 L(m). 되미는 힘 = −k·x·(1 + (x/L)⁴). 변위가 L 보다 한참 작으면
 * 괄호가 1 에 가까워 비례하는 용수철과 같고, L 을 넘으면 괄호가 빠르게 커진다.
 */
export const STIFFEN_LENGTH = 0.75;
/** 위 추의 진폭(m). L 의 절반쯤이라 끝에서도 힘이 비례보다 5 % 세질 뿐이다. */
export const AMPLITUDE_SMALL = 0.35;
/** 아래 추의 진폭(m). 끝에서 되미는 힘이 비례의 네 배를 넘는다. */
export const AMPLITUDE_LARGE = 1;

/** 비례하는 용수철의 주기(초) = 2π√(m/k). 시간표 단계 길이의 기본값이 이것에서 나온다. */
export const PERIOD_LINEAR = 2 * Math.PI * Math.sqrt(MASS / STIFFNESS);

// ------------------------------------------------------------------------
// 배치 — 월드 미터. 추는 왼쪽, 기록지는 오른쪽. 레인 둘을 위아래로 둔다.
// ------------------------------------------------------------------------

/** 추가 오르내리는 세로줄의 x. */
export const MASS_X = 0;
/** 추 크기 [가로, 세로](m). 두 추가 같다 — 같은 추라는 것이 전제다. */
export const MASS_SIZE: readonly [number, number] = [0.36, 0.36];
/**
 * 큰 진폭의 추가 가장 높이 올라갔을 때 윗면과 천장 사이(m). 용수철이 가장 눌려도 코일이 덜
 * 뭉칠 만큼(G107). 두 레인의 천장이 이 값으로 평형선에서 같은 높이에 놓인다 — 같은 용수철이다.
 */
export const CEILING_GAP = 0.42;
/** 천장 판의 반폭 · 빗금 띠 두께. */
export const CEILING_HALF = 0.42;
export const CEILING_DEPTH = 0.12;
/** 용수철 감은 수. 두 용수철이 같다. */
export const SPRING_COILS = 8;

/** 아래 레인(큰 진폭)의 평형선 높이. */
export const LANE_LARGE_Y = 0;
/**
 * 위 레인(작은 진폭)의 평형선 높이. 위 추가 가장 내려와도 아래 천장 빗금 위에 떠 있게 —
 * 아래 천장(1.6) + 빗금(0.12) + 여유(0.12) + 작은 진폭(0.35) + 추 반높이(0.18).
 */
export const LANE_SMALL_Y = 2.38;

/** 펜이 적기 시작하는 자리(기록지 왼쪽 끝)와 기록지 길이. 두 레인이 같은 시간축을 쓴다. */
export const PAPER_START = 0.8;
export const PAPER_LENGTH = 7.6;
/** 시간축(평형선)의 오른쪽 끝 — 기록지보다 조금 더 간다. */
export const AXIS_END = PAPER_START + PAPER_LENGTH + 0.2;

/**
 * 힘 → 화살표 길이 배율(m per N). 아래 추가 가장 늘어났을 때의 힘(k·A·4.16 ≈ 21 N)이
 * 0.75 m 가 되게 — 화살표가 평형선을 넘지 않는다. 두 레인 · 두 화살표(실제 · 비례)가 **같은
 * 배율**이다. 그래서 위 레인의 화살표는 작고 둘이 거의 같으며, 그것이 곧 말하려는 것이다.
 */
export const FORCE_SCALE = 0.036;
/** 추 왼쪽 모서리에서 실제 힘 화살표까지 · 실제 힘에서 비례 힘 화살표까지의 거리(m). */
export const FORCE_GAP = 0.12;
export const GHOST_GAP = 0.16;

/**
 * 프레이밍은 주장의 일부다. 가로는 비례 힘 화살표부터 시간축 끝까지, 세로는 아래 추의
 * 가장 낮은 자리와 위 천장 빗금 위까지. 매 프레임 같은 값이다.
 */
export const SCENE_BOUNDS = { minX: -0.85, maxX: 8.75, minY: -1.3, maxY: 4.18 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이의 기본값은 비례하는 용수철의 주기에서 나온다
// ------------------------------------------------------------------------

/** 쓰는 두 단계가 점선의 한 주기씩이다. 기록지 한 장 = 점선 두 주기. */
export const WRITE = PERIOD_LINEAR;
/** 다 적힌 기록을 읽는 동안 · 기록이 흐려지며 추를 다시 당겨 놓는 동안. */
export const HOLD = 1.6 * PERIOD_LINEAR;
export const FADE = 0.5 * PERIOD_LINEAR;
/**
 * 쓰는 동안 재생 속도. 아래 추는 한 주기가 1.2 초 남짓이라 실시간이면 봉우리 모양을 눈으로
 * 따라가기 어렵다.
 */
export const WRITE_SPEED = 0.6;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const nonlinearOscillationMessages = Object.freeze({
  'label.title': {
    ko: '비선형 진동',
    en: 'Nonlinear oscillation',
    ja: '非線形振動',
    zh: '非线性振动',
    ar: 'الاهتزاز غير الخطي',
    es: 'Oscilación no lineal',
    fr: 'Oscillation non linéaire',
    hi: 'अरैखिक दोलन',
    id: 'Osilasi nonlinier',
    pt: 'Oscilação não linear',
  },
  'label.operation': {
    ko: '복원력이 비례를 벗어날 때',
    en: 'When the restoring force stops being proportional',
    ja: '復元力が比例しなくなるとき',
    zh: '当恢复力不再成正比时',
    ar: 'عندما تكفّ قوة الإرجاع عن التناسب',
    es: 'Cuando la fuerza restauradora deja de ser proporcional',
    fr: 'Quand la force de rappel cesse d’être proportionnelle',
    hi: 'जब प्रत्यानयन बल समानुपाती नहीं रहता',
    id: 'Saat gaya pemulih tidak lagi sebanding',
    pt: 'Quando a força restauradora deixa de ser proporcional',
  },
  'label.stage': {
    ko: '단단해지는 용수철',
    en: 'Stiffening spring',
    ja: '硬くなるばね',
    zh: '变硬的弹簧',
    ar: 'نابض يزداد صلابة',
    es: 'Resorte que se endurece',
    fr: 'Ressort qui se raidit',
    hi: 'कड़ी होती स्प्रिंग',
    id: 'Pegas yang makin kaku',
    pt: 'Mola que endurece',
  },
  'label.view': {
    ko: '두 레인 기록지',
    en: 'Two-lane chart',
    ja: '二段の記録紙',
    zh: '双道记录纸',
    ar: 'ورقة تسجيل بمسارين',
    es: 'Registro de dos pistas',
    fr: 'Enregistrement à deux pistes',
    hi: 'दो पंक्तियों वाला अभिलेख-पत्र',
    id: 'Kertas rekam dua jalur',
    pt: 'Registro de duas faixas',
  },
  /** 시간축 끝 기호. 수식 표기라 번역 대상이 아니다 (C1 판정 3). */
  'label.time': {
    ko: 't',
    en: 't',
    ja: 't',
    zh: 't',
    ar: 't',
    es: 't',
    fr: 't',
    hi: 't',
    id: 't',
    pt: 't',
  },
  'caption.release': {
    ko: '같은 용수철 둘 — 위는 조금, 아래는 크게 당겨 놓았다. 점선은 힘이 변위에 비례했다면 그렸을 기록',
    en: 'Two identical springs — the top one pulled a little, the bottom one a lot. The dashed line is what a proportional force would have drawn',
    ja: '同じばねが二つ — 上は少し、下は大きく引いてある。点線は力が変位に比例していたら描いたはずの記録',
    zh: '两根相同的弹簧 — 上面的拉开一点，下面的拉开很多。虚线是力与位移成正比时本该画出的记录',
    ar: 'نابضان متماثلان — العلوي مشدود قليلًا والسفلي كثيرًا. الخط المتقطع هو ما كانت سترسمه قوة متناسبة',
    es: 'Dos resortes idénticos — el de arriba estirado un poco, el de abajo mucho. La línea discontinua es lo que habría trazado una fuerza proporcional',
    fr: 'Deux ressorts identiques — celui du haut un peu tiré, celui du bas beaucoup. Les pointillés montrent ce qu’aurait tracé une force proportionnelle',
    hi: 'दो एक जैसी स्प्रिंग — ऊपर वाली थोड़ी, नीचे वाली बहुत खींची गई है। बिंदुदार रेखा वह है जो समानुपाती बल खींचता',
    id: 'Dua pegas identik — yang atas ditarik sedikit, yang bawah banyak. Garis putus-putus adalah rekaman yang akan tergambar jika gayanya sebanding',
    pt: 'Duas molas idênticas — a de cima puxada um pouco, a de baixo muito. A linha tracejada é o que uma força proporcional teria traçado',
  },
  'caption.stiffen': {
    ko: '평형점에서 멀리 벗어난 끝에서 되미는 힘이 비례보다 훨씬 세다 — 아래 추는 빨리 되돌아와 점선을 앞질러 간다',
    en: 'Far from equilibrium the spring pushes back much harder than proportional — the bottom mass returns early and pulls ahead of the dashed line',
    ja: '平衡点から遠く離れると、ばねは比例よりずっと強く押し戻す — 下のおもりは早く戻り、点線を追い越していく',
    zh: '远离平衡位置时，弹簧的回推力比成正比时强得多 — 下面的重物提前返回，跑到虚线前面',
    ar: 'بعيدًا عن الاتزان يدفع النابض إلى الخلف بقوة أكبر بكثير من التناسب — فتعود الكتلة السفلية مبكرًا وتسبق الخط المتقطع',
    es: 'Lejos del equilibrio, el resorte empuja de vuelta mucho más fuerte que lo proporcional — la masa de abajo regresa antes y se adelanta a la línea discontinua',
    fr: 'Loin de l’équilibre, le ressort repousse bien plus fort qu’en proportion — la masse du bas revient plus tôt et devance les pointillés',
    hi: 'संतुलन से दूर स्प्रिंग समानुपात से कहीं ज़्यादा ज़ोर से वापस धकेलती है — नीचे वाला भार जल्दी लौटता है और बिंदुदार रेखा से आगे निकल जाता है',
    id: 'Jauh dari kesetimbangan, pegas mendorong balik jauh lebih kuat daripada sebanding — beban bawah kembali lebih cepat dan mendahului garis putus-putus',
    pt: 'Longe do equilíbrio, a mola empurra de volta com muito mais força que o proporcional — a massa de baixo volta antes e passa à frente da linha tracejada',
  },
  'caption.result': {
    ko: '작게 흔들면 점선 그대로, 크게 흔들면 봉우리가 뾰족해지고 주기가 짧아진다',
    en: 'Small swings follow the dashed line; large swings get pointed peaks and a shorter period',
    ja: '小さく揺らすと点線どおり、大きく揺らすと山がとがり周期が短くなる',
    zh: '小幅振动与虚线一致；大幅振动则峰变尖、周期变短',
    ar: 'التأرجحات الصغيرة تتبع الخط المتقطع؛ أما الكبيرة فتصير قممها مدببة ودورها أقصر',
    es: 'Las oscilaciones pequeñas siguen la línea discontinua; las grandes tienen picos puntiagudos y un periodo más corto',
    fr: 'Les petites oscillations suivent les pointillés ; les grandes ont des pics pointus et une période plus courte',
    hi: 'छोटे दोलन बिंदुदार रेखा पर चलते हैं; बड़े दोलनों के शिखर नुकीले और आवर्तकाल छोटा हो जाता है',
    id: 'Ayunan kecil mengikuti garis putus-putus; ayunan besar puncaknya runcing dan periodenya lebih pendek',
    pt: 'Oscilações pequenas seguem a linha tracejada; as grandes ganham picos pontudos e um período mais curto',
  },
} satisfies Record<string, LocalizedText>);

export type NonlinearOscillationMessageKey = keyof typeof nonlinearOscillationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: NonlinearOscillationMessageKey): LocalizedText => nonlinearOscillationMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: NonlinearOscillationMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const nonlinearOscillationSchema: BundleSchema = {
  id: NONLINEAR_OSCILLATION_ID,
  label: text('label.title'),
  category: 'oscillation',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 두 추가 흔들리고, 두 펜이 점선 위에 기록을 적는다.
  parameters: [],

  stages: [
    {
      id: 'stiffening-spring',
      label: text('label.stage'),
      constants: {
        mass: MASS,
        stiffness: STIFFNESS,
        stiffenLength: STIFFEN_LENGTH,
        amplitudeSmall: AMPLITUDE_SMALL,
        amplitudeLarge: AMPLITUDE_LARGE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'chart', label: text('label.view'), default: true }],

  /**
   * 가로로 기록지 7.6 m 를 펼쳐야 하고, 세로는 두 레인(진폭 0.35 · 1)과 같은 길이의 용수철 둘이다.
   * 세로를 더 주면 가로가 먼저 차서 곡선만 작아진다 (S-piece — 세로가 비싸다).
   */
  canvas: { height: 440, minHeight: 400 },

  /**
   * 겹침이 판정 장치다. 점선은 기록 **아래** 로 깔려야 기록이 그 위를 따라가는지 벗어나는지
   * 읽히고, 펜 점은 기록 끝 위에 올라와야 한다.
   */
  drawOrder: 'scene',

  /**
   * 한 바퀴 = 첫 점선 주기(놓음) → 둘째 점선 주기(앞지름) → 다 적힌 기록 → 흐려짐.
   *
   * 펜의 자리는 `start('write-1')` ~ `end('write-2')` 구간의 진행도로, 추를 다시 당겨 놓는
   * 정도는 `at('fade')` 로 읽는다. 단계 경계를 코드에 두지 않는다 (S-piece).
   */
  timeline: {
    phases: [
      { id: 'write-1', duration: WRITE, timeScale: WRITE_SPEED, caption: key('caption.release') },
      { id: 'write-2', duration: WRITE, timeScale: WRITE_SPEED, caption: key('caption.stiffen') },
      { id: 'hold', duration: HOLD, caption: key('caption.result') },
      { id: 'fade', duration: FADE, ease: 'smooth', caption: key('caption.result') },
    ],
  },

  /**
   * 도착한 순간 이미 진행 중이다 — 두 추가 흔들리고 기록이 반 주기쯤 적힌 자리에서 연다.
   * 0 이면 빈 기록지와 멈춘 추가 먼저 보인다.
   */
  startAt: 0.45 * PERIOD_LINEAR,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 정의와 공식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 이 그림이 재라고 하는 것은 거리가 아니라 기록이
   * 점선에서 **벗어나는 정도**다. 격자를 깔면 「몇 미터인가」 가 끼어든다.
   */

  messages: nonlinearOscillationMessages,
};
