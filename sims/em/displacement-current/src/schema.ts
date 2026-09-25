// ========================================================================
// displacement-current — 선언
// ========================================================================
// 질문: 축전기가 차는 동안 두 판 사이로는 전하가 한 알도 건너가지 않는다. 그런데
// 그 틈을 두른 고리에도 자기장이 생기는가 — 생긴다면 얼마나.
//
// 옆에서 본 도선 — 원판 축전기 — 도선. 같은 반지름의 자기장 고리 셋이 왼쪽 도선 ·
// 판 사이 틈 · 오른쪽 도선을 두른다. 전류가 흐르는 동안 세 고리가 **같은 짙기 · 같은
// 길이의 B 화살표**로 함께 서고, 판 사이에서는 전하 대신 E 선이 늘어난다. 늘어나는
// 빠르기는 도선 전류를 따라 처음엔 빠르고 점점 느려진다. 다 차서 전류가 멎으면 E 선은
// 남아 있는데 고리는 셋 다 사라진다 — 자기장을 만든 것은 E 선의 **변화**였다.
// 거꾸로 비울 때는 셋이 함께 방향을 바꾼다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:displacement-current` 와 문자 그대로 일치한다 (C4). */
export const DISPLACEMENT_CURRENT_ID = 'displacement-current';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 충전 · 방전의 시간 상수 τ(초). 전류가 τ 마다 같은 비율로 잦아든다. */
export const TAU = 1.6;
/** 원판 반지름(월드). 판 사이 전기 선속이 이 원판을 지난다. */
export const PLATE_RADIUS = 1;
/** 두 판 사이 간격(월드). */
export const PLATE_GAP = 2;
/**
 * 자기장 고리의 반지름(월드). 세 고리가 같다. **원판 반지름보다 커야** 틈 고리가 판 사이
 * 전기 선속을 전부 두르고, 그때 도선 고리와 같은 세기가 된다 (NOTES (b)).
 */
export const RING_RADIUS = 1.3;
/** 다 찼을 때 판 사이 E 선 개수. 판의 +/− 표식 개수도 같다. */
export const E_LINE_COUNT = 7;

// ------------------------------------------------------------------------
// 표시 배율 — 이것도 선언이다 (원칙 2). 저작자가 스테이지에서 바꾼다.
// ------------------------------------------------------------------------

/** 전류(첫 순간 = 1) → 도선 위 I 화살표 길이(월드). */
export const I_ARROW_SCALE = 1.1;
/** 자기장(첫 순간 = 1) → 고리 앞쪽 B 화살표 길이(월드). 세 고리가 같은 배율이다. */
export const B_ARROW_SCALE = 0.75;
/**
 * 세기(첫 순간 = 1) → 고리 · B · I 화살표의 짙기 배율. 짙기 = min(1, 세기 × 이 값). 세기만큼
 * 곧바로 옅어지면 첫 순간부터 고리가 반쯤 비쳐 「고리가 있다」 가 약하고, 이 값이 없으면 잦아든
 * 화살표가 머리만 남아 `−` 처럼 읽힌다. 셋이 같은 배율이라 견줌은 그대로다 (NOTES (b)).
 */
export const FADE_GAIN = 1.5;
/** 옮겨 간 전하(다 참 = 1) → 도선 속 전자가 밀려간 거리(월드). */
export const FLOW_SCALE = 1.6;
/**
 * 비스듬한 투영 계수 — 앞으로 나온 깊이 1 이 화면 오른쪽으로 가는 길이. 원판과 고리가
 * 이만큼 납작한 타원으로 보인다.
 */
export const DEPTH_SKEW = 0.3;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 도선이 가로축(y = 0), 축전기가 가운데.
// ------------------------------------------------------------------------

/** 도선 두 끝. 화면 밖으로 이어지는 것처럼 경계 끝까지 긋는다. */
export const WIRE_END = 5.7;
/** 도선 고리가 놓인 자리(± x). */
export const WIRE_RING_X = 3.3;
/** I 화살표 가운데 자리(± x)와 높이. 도선 고리 바깥쪽이다. */
export const I_ARROW_X = 4.7;
export const I_ARROW_Y = 0.32;
/** 전자 알갱이 간격(월드). */
export const DOT_GAP = 0.36;
/** 전자 표식 `e⁻` 자리 — 왼쪽 도선 아래. */
export const ELECTRON_LABEL: readonly [number, number] = [-4.9, -0.3];

/**
 * 프레이밍 — 도선 두 끝과 고리 위아래, 아래로 캡션 한 줄 자리. 매 프레임 같은 값이다
 * (원칙 6).
 */
export const SCENE_BOUNDS = { minX: -5.8, maxX: 5.8, minY: -2.05, maxY: 1.6 } as const;

// ------------------------------------------------------------------------
// 시간표 — 차는 동안 · 다 참 · 비우는 동안 · 빔
// ------------------------------------------------------------------------

/** 차는 동안(초). 3τ — 끝날 무렵 전류는 처음의 5 % 아래라 고리가 거의 사라져 있다. */
export const CHARGE_S = 4.8;
/** 다 찬 채로 머무는 동안. E 선은 남고 고리는 없는 화면을 보는 시간이라 길다. */
export const FULL_S = 2.4;
/** 비우는 동안. 차는 동안과 같다. */
export const DISCHARGE_S = 4.8;
/** 빈 채로 머무는 동안. */
export const EMPTY_S = 1.4;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const displacementCurrentMessages = Object.freeze({
  'label.title': {
    ko: '변위 전류',
    en: 'Displacement current',
    ja: '変位電流',
    zh: '位移电流',
    ar: 'تيار الإزاحة',
    es: 'Corriente de desplazamiento',
    fr: 'Courant de déplacement',
    hi: 'विस्थापन धारा',
    id: 'Arus perpindahan',
    pt: 'Corrente de deslocamento',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '축전기 사이를 잇는 항',
    en: 'The term that bridges the capacitor gap',
    ja: 'コンデンサーのすき間をつなぐ項',
    zh: '跨越电容器间隙的那一项',
    ar: 'الحدّ الذي يعبر فجوة المكثف',
    es: 'El término que salva el hueco del condensador',
    fr: 'Le terme qui franchit l’espace du condensateur',
    hi: 'वह पद जो संधारित्र के अंतराल को पाटता है',
    id: 'Suku yang menjembatani celah kapasitor',
    pt: 'O termo que atravessa o vão do capacitor',
  },
  'label.stage': {
    ko: '도선과 원판 축전기',
    en: 'Wire and disc capacitor',
    ja: '導線と円板コンデンサー',
    zh: '导线与圆板电容器',
    ar: 'سلك ومكثف قرصي',
    es: 'Cable y condensador de discos',
    fr: 'Fil et condensateur à disques',
    hi: 'तार और डिस्क संधारित्र',
    id: 'Kawat dan kapasitor keping cakram',
    pt: 'Fio e capacitor de discos',
  },
  'label.view': {
    ko: '비스듬히 옆에서',
    en: 'From the side, at an angle',
    ja: '斜め横から',
    zh: '从侧面斜看',
    ar: 'من الجانب بزاوية مائلة',
    es: 'De lado, en ángulo',
    fr: 'De côté, en biais',
    hi: 'बगल से, तिरछे कोण पर',
    id: 'Dari samping, miring',
    pt: 'De lado, em ângulo',
  },
  /** 물리 기호 — 표식이라 번역하지 않는다 (C1 판정 3). */
  'label.current': {
    ko: 'I',
    en: 'I',
    ja: 'I',
    zh: 'I',
    ar: 'I',
    es: 'I',
    fr: 'I',
    hi: 'I',
    id: 'I',
    pt: 'I',
  },
  'label.field': {
    ko: 'B',
    en: 'B',
    ja: 'B',
    zh: 'B',
    ar: 'B',
    es: 'B',
    fr: 'B',
    hi: 'B',
    id: 'B',
    pt: 'B',
  },
  'label.efield': {
    ko: 'E',
    en: 'E',
    ja: 'E',
    zh: 'E',
    ar: 'E',
    es: 'E',
    fr: 'E',
    hi: 'E',
    id: 'E',
    pt: 'E',
  },
  'label.electron': {
    ko: 'e⁻',
    en: 'e⁻',
    ja: 'e⁻',
    zh: 'e⁻',
    ar: 'e⁻',
    es: 'e⁻',
    fr: 'e⁻',
    hi: 'e⁻',
    id: 'e⁻',
    pt: 'e⁻',
  },
  'caption.charge': {
    ko: '차는 동안 — 판 사이로는 전하가 건너가지 않는데, 늘어나는 E 선을 두른 고리에도 도선과 같은 자기장이 돈다',
    en: 'While it charges — no charge crosses the gap, yet the ring around the growing E lines carries the same magnetic field as the wire',
    ja: '充電中 — 極板の間を電荷は渡らないのに、増えていく E 線を囲む輪にも導線と同じ磁場が生じる',
    zh: '充电时——没有电荷越过间隙，但环绕不断增多的 E 线的圆环上，也有与导线相同的磁场',
    ar: 'أثناء الشحن — لا تعبر أي شحنة الفجوة، ومع ذلك تحمل الحلقة المحيطة بخطوط E المتزايدة المجالَ المغناطيسي نفسه الذي حول السلك',
    es: 'Mientras se carga — ninguna carga cruza el hueco, pero el anillo que rodea las líneas E crecientes tiene el mismo campo magnético que el cable',
    fr: 'Pendant la charge — aucune charge ne franchit l’espace, pourtant l’anneau autour des lignes E qui se multiplient porte le même champ magnétique que le fil',
    hi: 'आवेशन के दौरान — कोई आवेश अंतराल पार नहीं करता, फिर भी बढ़ती E रेखाओं को घेरे वलय पर तार जैसा ही चुंबकीय क्षेत्र होता है',
    id: 'Saat mengisi — tak ada muatan yang menyeberangi celah, namun cincin yang melingkari garis E yang bertambah memiliki medan magnet yang sama dengan kawat',
    pt: 'Enquanto carrega — nenhuma carga atravessa o vão, mas o anel em volta das linhas E crescentes tem o mesmo campo magnético que o fio',
  },
  'caption.full': {
    ko: '다 찼다 — 전류가 멎고 E 선이 더 늘지 않자, 세 고리의 자기장이 함께 사라졌다',
    en: 'Fully charged — the current stops, the E lines stop growing, and all three magnetic rings vanish together',
    ja: '充電完了 — 電流が止まり E 線が増えなくなると、三つの磁場の輪がそろって消える',
    zh: '充满了——电流停止，E 线不再增多，三个磁场环一起消失',
    ar: 'اكتمل الشحن — يتوقف التيار، وتكفّ خطوط E عن الازدياد، وتختفي الحلقات المغناطيسية الثلاث معًا',
    es: 'Carga completa — la corriente se detiene, las líneas E dejan de crecer y los tres anillos magnéticos desaparecen a la vez',
    fr: 'Complètement chargé — le courant s’arrête, les lignes E cessent de se multiplier, et les trois anneaux magnétiques disparaissent ensemble',
    hi: 'पूरा आवेशित — धारा रुक जाती है, E रेखाएँ बढ़ना बंद कर देती हैं, और तीनों चुंबकीय वलय एक साथ गायब हो जाते हैं',
    id: 'Terisi penuh — arus berhenti, garis E berhenti bertambah, dan ketiga cincin magnet lenyap bersamaan',
    pt: 'Totalmente carregado — a corrente para, as linhas E deixam de crescer e os três anéis magnéticos somem juntos',
  },
  'caption.discharge': {
    ko: '비우는 동안 — E 선이 줄어드는 틈 둘레에서도 자기장이 도선과 함께 방향을 바꿔 돈다',
    en: 'While it discharges — around the shrinking E lines the field reverses right along with the wire',
    ja: '放電中 — 減っていく E 線のまわりでも、磁場が導線と一緒に向きを変える',
    zh: '放电时——在不断减少的 E 线周围，磁场也与导线一起反向',
    ar: 'أثناء التفريغ — حول خطوط E المتناقصة ينعكس المجال مع السلك تمامًا',
    es: 'Mientras se descarga — alrededor de las líneas E menguantes, el campo se invierte a la par que en el cable',
    fr: 'Pendant la décharge — autour des lignes E qui diminuent, le champ s’inverse en même temps que celui du fil',
    hi: 'निरावेशन के दौरान — घटती E रेखाओं के चारों ओर भी क्षेत्र तार के साथ-साथ दिशा पलटता है',
    id: 'Saat melepas muatan — di sekitar garis E yang berkurang, medan berbalik arah bersamaan dengan kawat',
    pt: 'Enquanto descarrega — em volta das linhas E que diminuem, o campo se inverte junto com o do fio',
  },
  'caption.empty': {
    ko: '비었다 — 전류도, E 선의 변화도 없어 자기장이 없다',
    en: 'Empty — no current and no changing E lines, so no magnetic field',
    ja: '空になった — 電流も E 線の変化もなく、磁場はない',
    zh: '放空了——没有电流，E 线也没有变化，所以没有磁场',
    ar: 'فارغ — لا تيار ولا تغيّر في خطوط E، فلا مجال مغناطيسي',
    es: 'Descargado — sin corriente ni líneas E que cambien, no hay campo magnético',
    fr: 'Déchargé — ni courant ni lignes E qui varient, donc pas de champ magnétique',
    hi: 'खाली — न धारा है, न E रेखाओं में बदलाव, इसलिए कोई चुंबकीय क्षेत्र नहीं',
    id: 'Kosong — tak ada arus dan tak ada perubahan garis E, jadi tak ada medan magnet',
    pt: 'Vazio — sem corrente e sem linhas E variando, não há campo magnético',
  },
} satisfies Record<string, LocalizedText>);

export type DisplacementCurrentMessageKey = keyof typeof displacementCurrentMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DisplacementCurrentMessageKey): LocalizedText => displacementCurrentMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DisplacementCurrentMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const displacementCurrentSchema: BundleSchema = {
  id: DISPLACEMENT_CURRENT_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 이미 차는 중이고, 멎고, 비우고, 다시 찬다.
  parameters: [],

  stages: [
    {
      id: 'capacitor',
      label: text('label.stage'),
      constants: {
        tau: TAU,
        plateRadius: PLATE_RADIUS,
        plateGap: PLATE_GAP,
        ringRadius: RING_RADIUS,
        eLineCount: E_LINE_COUNT,
        iArrowScale: I_ARROW_SCALE,
        bArrowScale: B_ARROW_SCALE,
        fadeGain: FADE_GAIN,
        flowScale: FLOW_SCALE,
        depthSkew: DEPTH_SKEW,
      },
    },
  ],

  environments: [],
  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓고 세로로 좁다 — 도선 한 줄과 그것을 두른 고리가 전부다. */
  canvas: { height: 300, minHeight: 280 },

  /**
   * 겹침이 판정 장치다. 고리가 도선과 틈을 **두르려면** 고리의 뒤 반쪽은 도선 · E 선
   * 아래, 앞 반쪽은 위를 지나야 한다. 왼쪽 판은 안쪽 면이 보이고(E 선이 그 위에서
   * 나온다) 오른쪽 판은 바깥 면이 보인다(E 선이 그 뒤로 들어간다). 층 순서로는
   * 이 앞뒤를 가를 수 없다.
   */
  drawOrder: 'scene',

  /**
   * 한 주기 = 차는 동안 → 다 참 → 비우는 동안 → 빔. 전류 · 전하는 단계 진행도의
   * 함수다 (physics `chargeAt` · `currentAt`). 차고 비우는 단계의 길이는 τ 의 배수로
   * 잡았다 — 둘 사이 관계는 선언할 자리가 없다 (NOTES (c) G129).
   */
  timeline: {
    phases: [
      { id: 'charge', duration: CHARGE_S, caption: key('caption.charge') },
      { id: 'full', duration: FULL_S, caption: key('caption.full') },
      { id: 'discharge', duration: DISCHARGE_S, caption: key('caption.discharge') },
      { id: 'empty', duration: EMPTY_S, caption: key('caption.empty') },
    ],
  },

  /** 도착한 순간 이미 차는 중이다 — E 선 몇 가닥이 섰고 세 고리가 짙다. */
  startAt: 0.45,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /**
   * 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 **세 고리가 같은가** 다.
   */

  messages: displacementCurrentMessages,
};
