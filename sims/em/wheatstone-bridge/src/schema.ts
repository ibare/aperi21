// ========================================================================
// wheatstone-bridge — 선언
// ========================================================================
// 질문: 모르는 저항을 전류 값 없이 어떻게 재는가.
//
// 전지에 두 가지가 나란히 걸려 있다. 위 가지는 R₁ · R₂ 가 가운데 마디 C 로, 아래 가지는
// 가변 저항 R₃ 와 모르는 저항 Rₓ 가 가운데 마디 D 로 이어진다. C 와 D 사이에 검류계가 있다.
// R₃ 를 한 칸씩 돌려 키우면 D 의 전위가 내려가 C 에 가까워지고, 두 전위가 같아지는 자리에서
// 검류계 바늘이 0 에 선다 — 그 R₃ 값으로 Rₓ 를 읽는다. 더 돌리면 바늘이 반대로 기운다.
// 오른쪽 판은 C · D 두 마디의 전위를 높이로 나란히 세운다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:wheatstone-bridge` 와 문자 그대로 일치한다 (C4). */
export const WHEATSTONE_BRIDGE_ID = 'wheatstone-bridge';

// ------------------------------------------------------------------------
// 물리량 · 표시 배율 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 전지 전압(V). 내부 저항 · 도선 저항은 없다고 둔다. */
export const EMF = 6;
/** 비율 가지 R₁ · R₂(Ω). */
export const R1 = 100;
export const R2 = 200;
/** 모르는 저항 Rₓ(Ω) — 평형에서 읽혀 나오는 값. */
export const RX = 300;
/** 검류계 내부 저항(Ω). 평형 자리에는 영향이 없고 벗어났을 때 전류 크기만 바꾼다. */
export const RG = 200;
/**
 * 가변 저항 R₃ 의 범위와 한 칸(Ω). R₃ 는 이 격자(`r3Low + k·r3Step`) 위에서만 선다 — 화면 글자가
 * 언제나 선언한 격자 값이게 하려는 것이다(S-piece 유효숫자). 평형 자리 `rx·r1/r2` 가 이 격자 위에,
 * 범위 안에 있어야 한다(G143).
 */
export const R3_LOW = 75;
export const R3_HIGH = 250;
export const R3_STEP = 25;
/** 표시 배율 — 검류계 바늘이 전류 1 mA 에 기우는 각(도)과 기울 수 있는 끝(도). */
export const NEEDLE_DEG_PER_MA = 22;
export const NEEDLE_MAX_DEG = 70;
/** 표시 배율 — 검류계 전류 1 mA 에 전류 화살표가 차지하는 길이(월드)와 길이 상한(월드). */
export const ARROW_PER_MA = 0.3;
export const ARROW_MAX = 0.8;
/**
 * 표시 배율 — 전위 판이 보이는 창(V). 바닥 · 꼭대기가 이 두 전위다. 두 가운데 마디의 전위는 이 창 안에서만
 * 오르내리므로 0 V ~ 전지 전압 전체 대신 이 몫을 판 높이 전체로 키워 둘의 어긋남이 보이게 한다.
 * 두 마디의 전위가 창 안에 들어야 한다(G143).
 */
export const PANEL_V_MIN = 3;
export const PANEL_V_MAX = 5;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 조각의 배치 계산이다.
// ------------------------------------------------------------------------

/** 두 끝 마디 P(전지 + 쪽) · Q(전지 − 쪽)의 x, 가운데 마디 C · D 와 검류계의 x. */
export const X_P = -6.4;
export const X_Q = 0.4;
export const X_MID = -3;
/** 위 가지 · 아래 가지의 높이. */
export const Y_TOP = 1.5;
export const Y_BOTTOM = -1.5;
/** 저항 기호 가운데 x — 왼쪽(R₁ · R₃) · 오른쪽(R₂ · Rₓ). 기호는 가운데에서 ±1 이 두 단자다. */
export const X_LEFT_R = -4.7;
export const X_RIGHT_R = -1.3;
/** plugin-circuit `circuitElement` 저항의 반 길이(월드) — 소자 로컬 ±1 이 두 단자다. */
export const RESISTOR_HALF = 1;

/** 검류계 — 원 가운데 높이 · 반지름(월드). */
export const GALV_Y = 0;
export const GALV_R = 0.85;

/** 전지 고리 아래 변 높이 · 전지 가운데 x · 두 판 사이 · 긴 판(+) · 짧은 판(−) 반 길이(월드). */
export const LOOP_BOTTOM = -2.6;
export const BATTERY_X = X_MID;
export const BATTERY_PLATE_GAP = 0.24;
export const BATTERY_LONG_HALF = 0.42;
export const BATTERY_SHORT_HALF = 0.22;

/** 전위 판 — 세로축 x, 바닥(창 아래 끝) · 꼭대기(창 위 끝) 높이. C 표식 · D 표식의 가로 구간. */
export const PANEL_AXIS_X = 2;
export const PANEL_Y0 = Y_BOTTOM;
export const PANEL_Y1 = Y_TOP;
export const PANEL_C_X0 = 2.4;
export const PANEL_C_X1 = 3.3;
export const PANEL_D_X0 = 3.7;
export const PANEL_D_X1 = 4.6;

/**
 * 프레이밍은 주장의 일부다. 가로는 P 마디 · 전지 고리 왼쪽부터 판의 D 이름표까지,
 * 세로는 판 이름 · 위 저항 이름표 위부터 전지 전압 글자 · 캡션 줄 아래까지.
 */
export const SCENE_BOUNDS = { minX: -7.1, maxX: 5.3, minY: -4.0, maxY: 2.4 } as const;

// ------------------------------------------------------------------------
// 시간표 — 조각 시계(초)
// ------------------------------------------------------------------------

/** 처음 자리에서 읽는 동안 · 평형까지 돌리는 동안 · 평형에서 읽는 동안 · 넘겨 돌리는 동안 · 끝에서 읽는 동안 · 되돌리는 동안. */
export const HOLD_LOW = 2.4;
export const TURN_UP = 3;
export const HOLD_BALANCE = 3.6;
export const TURN_OVER = 2.4;
export const HOLD_HIGH = 2.4;
export const BACK = 3;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const wheatstoneBridgeMessages = Object.freeze({
  'label.title': {
    ko: '휘트스톤 브리지',
    en: 'Wheatstone bridge',
    ja: 'ホイートストンブリッジ',
    zh: '惠斯通电桥',
    ar: 'قنطرة ويتستون',
    es: 'Puente de Wheatstone',
    fr: 'Pont de Wheatstone',
    hi: 'व्हीटस्टोन सेतु',
    id: 'Jembatan Wheatstone',
    pt: 'Ponte de Wheatstone',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '평형으로 재는 저항',
    en: 'Measuring a resistance by balance',
    ja: 'つり合いで抵抗を測る',
    zh: '用平衡测电阻',
    ar: 'قياس مقاومة بالاتزان',
    es: 'Medir una resistencia por equilibrio',
    fr: 'Mesurer une résistance par l’équilibre',
    hi: 'संतुलन से प्रतिरोध मापना',
    id: 'Mengukur hambatan dengan kesetimbangan',
    pt: 'Medir uma resistência pelo equilíbrio',
  },
  'label.stage': {
    ko: '비율 가지 · 가변 저항 · 모르는 저항',
    en: 'Ratio arms, variable resistor, unknown resistor',
    ja: '比例辺、可変抵抗、未知抵抗',
    zh: '比例臂、可变电阻、未知电阻',
    ar: 'ذراعا النسبة، مقاومة متغيرة، مقاومة مجهولة',
    es: 'Brazos de razón, resistencia variable, resistencia desconocida',
    fr: 'Bras de rapport, résistance variable, résistance inconnue',
    hi: 'अनुपात भुजाएँ, परिवर्ती प्रतिरोध, अज्ञात प्रतिरोध',
    id: 'Lengan rasio, hambatan variabel, hambatan tak diketahui',
    pt: 'Braços de razão, resistor variável, resistor desconhecido',
  },
  'label.view': {
    ko: '브리지',
    en: 'Bridge',
    ja: 'ブリッジ',
    zh: '电桥',
    ar: 'القنطرة',
    es: 'Puente',
    fr: 'Pont',
    hi: 'सेतु',
    id: 'Jembatan',
    pt: 'Ponte',
  },
  'label.volt': { ko: '{v} V', en: '{v} V', ja: '{v} V', zh: '{v} V', ar: '{v} V', es: '{v} V', fr: '{v} V', hi: '{v} V', id: '{v} V', pt: '{v} V' },
  'label.ohm': { ko: '{r} Ω', en: '{r} Ω', ja: '{r} Ω', zh: '{r} Ω', ar: '{r} Ω', es: '{r} Ω', fr: '{r} Ω', hi: '{r} Ω', id: '{r} Ω', pt: '{r} Ω' },
  'label.unknownValue': { ko: '? Ω', en: '? Ω', ja: '? Ω', zh: '? Ω', ar: '? Ω', es: '? Ω', fr: '? Ω', hi: '? Ω', id: '? Ω', pt: '? Ω' },
  'label.potential': {
    ko: '전위',
    en: 'potential',
    ja: '電位',
    zh: '电势',
    ar: 'الجهد',
    es: 'potencial',
    fr: 'potentiel',
    hi: 'विभव',
    id: 'potensial',
    pt: 'potencial',
  },
  /** 소자 · 마디 이름과 극 · 계기 각인. 표식이라 번역하지 않는다 (C1 판정 1 · 3). */
  'label.r1': { ko: 'R₁', en: 'R₁', ja: 'R₁', zh: 'R₁', ar: 'R₁', es: 'R₁', fr: 'R₁', hi: 'R₁', id: 'R₁', pt: 'R₁' },
  'label.r2': { ko: 'R₂', en: 'R₂', ja: 'R₂', zh: 'R₂', ar: 'R₂', es: 'R₂', fr: 'R₂', hi: 'R₂', id: 'R₂', pt: 'R₂' },
  'label.r3': { ko: 'R₃', en: 'R₃', ja: 'R₃', zh: 'R₃', ar: 'R₃', es: 'R₃', fr: 'R₃', hi: 'R₃', id: 'R₃', pt: 'R₃' },
  'label.rx': { ko: 'Rₓ', en: 'Rₓ', ja: 'Rₓ', zh: 'Rₓ', ar: 'Rₓ', es: 'Rₓ', fr: 'Rₓ', hi: 'Rₓ', id: 'Rₓ', pt: 'Rₓ' },
  'label.nodeC': { ko: 'C', en: 'C', ja: 'C', zh: 'C', ar: 'C', es: 'C', fr: 'C', hi: 'C', id: 'C', pt: 'C' },
  'label.nodeD': { ko: 'D', en: 'D', ja: 'D', zh: 'D', ar: 'D', es: 'D', fr: 'D', hi: 'D', id: 'D', pt: 'D' },
  'label.galvanometer': { ko: 'G', en: 'G', ja: 'G', zh: 'G', ar: 'G', es: 'G', fr: 'G', hi: 'G', id: 'G', pt: 'G' },
  'label.current': { ko: 'I', en: 'I', ja: 'I', zh: 'I', ar: 'I', es: 'I', fr: 'I', hi: 'I', id: 'I', pt: 'I' },
  'label.plus': { ko: '+', en: '+', ja: '+', zh: '+', ar: '+', es: '+', fr: '+', hi: '+', id: '+', pt: '+' },
  'label.minus': { ko: '−', en: '−', ja: '−', zh: '−', ar: '−', es: '−', fr: '−', hi: '−', id: '−', pt: '−' },
  'caption.low': {
    ko: 'D 의 전위가 C 보다 높다 — 검류계로 전류가 흘러 바늘이 한쪽으로 기운다',
    en: 'D sits at a higher potential than C — current flows through the galvanometer and the needle leans one way',
    ja: 'D の電位が C より高い — 検流計に電流が流れ、針が一方に振れる',
    zh: 'D 的电势比 C 高 — 电流流过检流计，指针偏向一侧',
    ar: 'جهد D أعلى من جهد C — يمر تيار عبر الجلفانومتر ويميل المؤشر إلى جهة',
    es: 'D está a un potencial más alto que C — circula corriente por el galvanómetro y la aguja se inclina hacia un lado',
    fr: 'D est à un potentiel plus élevé que C — un courant traverse le galvanomètre et l’aiguille penche d’un côté',
    hi: 'D का विभव C से अधिक है — गैल्वेनोमीटर से धारा बहती है और सुई एक ओर झुकती है',
    id: 'Potensial D lebih tinggi daripada C — arus mengalir melalui galvanometer dan jarum condong ke satu sisi',
    pt: 'D está num potencial mais alto que C — passa corrente pelo galvanômetro e o ponteiro pende para um lado',
  },
  'caption.turnUp': {
    ko: '가변 저항 R₃ 를 한 칸씩 키운다 — D 의 전위가 내려가 C 에 다가가고, 바늘이 0 쪽으로 돌아온다',
    en: 'The variable resistor R₃ is turned up step by step — D’s potential falls toward C and the needle swings back toward 0',
    ja: '可変抵抗 R₃ を一段ずつ大きくする — D の電位が下がって C に近づき、針が 0 のほうへ戻る',
    zh: '把可变电阻 R₃ 一格一格调大 — D 的电势下降、接近 C，指针向 0 摆回',
    ar: 'تُرفع المقاومة المتغيرة R₃ خطوة بخطوة — ينخفض جهد D نحو C ويعود المؤشر نحو 0',
    es: 'La resistencia variable R₃ se sube paso a paso — el potencial de D baja hacia C y la aguja vuelve hacia 0',
    fr: 'On augmente la résistance variable R₃ cran par cran — le potentiel de D descend vers C et l’aiguille revient vers 0',
    hi: 'परिवर्ती प्रतिरोध R₃ को कदम-दर-कदम बढ़ाया जाता है — D का विभव घटकर C की ओर आता है और सुई 0 की ओर लौटती है',
    id: 'Hambatan variabel R₃ dinaikkan setahap demi setahap — potensial D turun mendekati C dan jarum berayun kembali ke arah 0',
    pt: 'O resistor variável R₃ é aumentado passo a passo — o potencial de D cai em direção a C e o ponteiro volta para o 0',
  },
  'caption.balance': {
    ko: 'C 와 D 의 높이가 같아졌다 — 검류계에 전류가 흐르지 않고 바늘이 0 에 선다. 이 R₃ 에서 모르는 저항의 값을 읽는다',
    en: 'C and D now stand at the same height — no current flows through the galvanometer and the needle stands at 0. At this R₃ the unknown resistance is read',
    ja: 'C と D の高さがそろった — 検流計に電流が流れず、針は 0 に止まる。この R₃ から未知抵抗の値を読む',
    zh: 'C 与 D 现在一样高 — 检流计中没有电流，指针停在 0。由此时的 R₃ 读出未知电阻的值',
    ar: 'صار C وD على الارتفاع نفسه — لا يمر تيار عبر الجلفانومتر ويستقر المؤشر عند 0. عند قيمة R₃ هذه تُقرأ المقاومة المجهولة',
    es: 'C y D quedan ahora a la misma altura — no circula corriente por el galvanómetro y la aguja se detiene en 0. Con esta R₃ se lee la resistencia desconocida',
    fr: 'C et D sont maintenant à la même hauteur — aucun courant ne traverse le galvanomètre et l’aiguille s’arrête sur 0. Avec cette R₃, on lit la résistance inconnue',
    hi: 'अब C और D एक ही ऊँचाई पर हैं — गैल्वेनोमीटर से धारा नहीं बहती और सुई 0 पर रुकती है। इस R₃ से अज्ञात प्रतिरोध का मान पढ़ा जाता है',
    id: 'Kini C dan D sama tinggi — tidak ada arus melalui galvanometer dan jarum berhenti di 0. Pada R₃ ini, nilai hambatan yang tak diketahui dibaca',
    pt: 'C e D agora estão na mesma altura — não passa corrente pelo galvanômetro e o ponteiro para no 0. Com este R₃ se lê a resistência desconhecida',
  },
  'caption.turnOver': {
    ko: 'R₃ 를 더 키운다 — D 의 전위가 C 아래로 내려가고 바늘이 반대쪽으로 기운다',
    en: 'R₃ is turned further — D’s potential drops below C and the needle leans the other way',
    ja: 'R₃ をさらに大きくする — D の電位が C より下がり、針が反対側に振れる',
    zh: '继续调大 R₃ — D 的电势降到 C 以下，指针偏向另一侧',
    ar: 'تُرفع R₃ أكثر — ينخفض جهد D تحت C ويميل المؤشر إلى الجهة الأخرى',
    es: 'R₃ se sube más — el potencial de D cae por debajo de C y la aguja se inclina hacia el otro lado',
    fr: 'On augmente encore R₃ — le potentiel de D passe sous celui de C et l’aiguille penche de l’autre côté',
    hi: 'R₃ को और बढ़ाया जाता है — D का विभव C से नीचे गिरता है और सुई दूसरी ओर झुकती है',
    id: 'R₃ dinaikkan lagi — potensial D turun di bawah C dan jarum condong ke sisi lain',
    pt: 'R₃ é aumentado ainda mais — o potencial de D cai abaixo do de C e o ponteiro pende para o outro lado',
  },
  'caption.high': {
    ko: 'D 의 전위가 C 보다 낮다 — 검류계로 전류가 반대로 흐른다',
    en: 'D sits at a lower potential than C — current flows the other way through the galvanometer',
    ja: 'D の電位が C より低い — 検流計に逆向きの電流が流れる',
    zh: 'D 的电势比 C 低 — 电流反向流过检流计',
    ar: 'جهد D أقل من جهد C — يمر التيار عبر الجلفانومتر في الاتجاه المعاكس',
    es: 'D está a un potencial más bajo que C — la corriente circula en sentido contrario por el galvanómetro',
    fr: 'D est à un potentiel plus bas que C — le courant traverse le galvanomètre dans l’autre sens',
    hi: 'D का विभव C से कम है — गैल्वेनोमीटर से धारा उलटी दिशा में बहती है',
    id: 'Potensial D lebih rendah daripada C — arus mengalir berlawanan arah melalui galvanometer',
    pt: 'D está num potencial mais baixo que C — a corrente passa no sentido contrário pelo galvanômetro',
  },
  'caption.back': {
    ko: 'R₃ 를 되돌린다 — 바늘이 0 을 지나 처음 쪽으로 넘어간다',
    en: 'R₃ is turned back — the needle passes through 0 and returns to its first side',
    ja: 'R₃ を戻す — 針は 0 を過ぎて最初の側へ戻る',
    zh: '把 R₃ 调回 — 指针越过 0，回到最初的一侧',
    ar: 'تُعاد R₃ — يعبر المؤشر 0 ويرجع إلى جهته الأولى',
    es: 'R₃ vuelve atrás — la aguja pasa por 0 y regresa a su primer lado',
    fr: 'On ramène R₃ — l’aiguille repasse par 0 et revient de son premier côté',
    hi: 'R₃ को वापस लाया जाता है — सुई 0 से गुज़रकर अपनी पहली ओर लौटती है',
    id: 'R₃ dikembalikan — jarum melewati 0 dan kembali ke sisi semula',
    pt: 'R₃ é trazido de volta — o ponteiro passa pelo 0 e volta ao primeiro lado',
  },
} satisfies Record<string, LocalizedText>);

export type WheatstoneBridgeMessageKey = keyof typeof wheatstoneBridgeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: WheatstoneBridgeMessageKey): LocalizedText => wheatstoneBridgeMessages[key];

/** 시간표·캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: WheatstoneBridgeMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const wheatstoneBridgeSchema: BundleSchema = {
  id: WHEATSTONE_BRIDGE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'periodic',

  // 조작기가 없다 — 열면 R₃ 가 처음 자리에서 평형을 지나 끝까지 돌았다가 되돌아온다.
  parameters: [],

  stages: [
    {
      id: 'bridge',
      label: text('label.stage'),
      constants: {
        emf: EMF,
        r1: R1,
        r2: R2,
        rx: RX,
        rg: RG,
        r3Low: R3_LOW,
        r3High: R3_HIGH,
        r3Step: R3_STEP,
        needleDegPerMilliamp: NEEDLE_DEG_PER_MA,
        needleMaxDeg: NEEDLE_MAX_DEG,
        arrowPerMilliamp: ARROW_PER_MA,
        arrowMax: ARROW_MAX,
        panelVMin: PANEL_V_MIN,
        panelVMax: PANEL_V_MAX,
      },
    },
  ],

  environments: [],

  views: [{ id: 'bridge', label: text('label.view'), default: true }],

  /** 브리지 하나와 전위 판, 캡션 한 줄. 세로를 더 주면 가로가 먼저 차서 그림만 작아진다 (S-piece). */
  canvas: { height: 360, minHeight: 320 },

  /** 도선 위에 소자 · 마디 점, 계기 위에 바늘, 이름표는 맨 위. 겹침을 scene 순서로 정한다. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 처음 자리 → 평형까지 돌림 → 평형에서 읽음 → 넘겨 돌림 → 끝에서 읽음 → 처음 자리로 되돌림.
   * R₃ 는 physics 가 세 돌림 단계의 진행도(`at`)를 더해 얻는다 — 단계 경계를 코드로 가르지 않는다.
   */
  timeline: {
    phases: [
      { id: 'hold-low', duration: HOLD_LOW, caption: key('caption.low') },
      { id: 'turn-up', duration: TURN_UP, ease: 'smooth', caption: key('caption.turnUp') },
      { id: 'hold-balance', duration: HOLD_BALANCE, caption: key('caption.balance') },
      { id: 'turn-over', duration: TURN_OVER, ease: 'smooth', caption: key('caption.turnOver') },
      { id: 'hold-high', duration: HOLD_HIGH, caption: key('caption.high') },
      { id: 'back', duration: BACK, ease: 'smooth', caption: key('caption.back') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — R₃ 를 평형 쪽으로 돌리는 중이다. */
  startAt: 3.4,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 평형 조건식은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것은 거리가 아니라 바늘의 0 과 두 높이의 같음이다. */

  messages: wheatstoneBridgeMessages,
};
