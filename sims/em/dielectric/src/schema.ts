// ========================================================================
// dielectric — 선언
// ========================================================================
// 질문: 전지에서 뗀 대전 판 사이에 유전체를 끼우면 판 사이 장은 어떻게 되는가.
//
// 전하 Q 가 갇힌 두 판 사이로 유전체 판을 밀어 넣으면, 들어오는 분자 쌍극자(작은 +− 짝)가
// 판 가장자리를 지나며 장 방향으로 돌아선다. 줄지어 선 쌍극자는 유전체 윗면에 −, 아랫면에
// + 를 드러내고, 판의 전하 표식 수는 그대로인데 판 사이 장 화살표가 1/κ 로 짧아진다.
// 빼면 쌍극자가 흐트러지고 장이 돌아온다.
//
// 이웃과 겹치지 않는 자리 — `parallel-plate-capacitor` 는 전지에 이은 판의 기하(간격 · 넓이)가
// 담는 전하를 정한다는 것이고, 이 조각은 **전하가 고정된 판 사이에 물질을 끼우면 장이
// 약해진다**는 것만 한다. 전지 · 도선 · 전류 · 용량 값 · 전압계를 두지 않는다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:dielectric` 와 문자 그대로 일치한다 (C4). */
export const DIELECTRIC_ID = 'dielectric';

// ------------------------------------------------------------------------
// 물리 · 표시 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// 화면에 뜨는 수는 계산값이 아니라 여기 선언한 정박값이다 (S-piece 유효숫자).
// ------------------------------------------------------------------------

/** 유전율 κ. 판 사이를 다 채우면 장이 1/κ 가 된다. 화면에 `κ = {k}` · `E/{k}` 로 뜬다. */
export const KAPPA = 3;
/** 판 간격(월드 단위, 안쪽 면 사이). */
export const PLATE_GAP = 2.6;
/** 판 길이(월드 단위). 유전체 판도 같은 길이라 다 들어가면 판 사이를 꼭 채운다. */
export const PLATE_LENGTH = 5.6;
/** 판 한 장의 자유 전하 표식 수 — 한 주기 내내 같다(전지에서 뗀 판). */
export const CHARGE_MARKS = 6;
/** 유전체 속 분자 쌍극자의 열 · 행 수. 장 화살표는 열 사이마다 하나(열 수 − 1)다. */
export const MOLECULE_COLUMNS = 7;
export const MOLECULE_ROWS = 3;
/** 쌍극자가 장 밖에서 향하는 무작위 방향을 뽑는 시드. */
export const SEED = 7;
/** 표시 배율 — 유전체 없는 판 사이 장 E 를 화살표 몇 월드 단위로 그리는가. E/κ 는 그 1/κ. */
export const FIELD_ARROW_LENGTH = 2.1;
/**
 * 판 가장자리 장의 폭(월드 단위). 쌍극자는 판 끝에서 이 폭의 반만큼 바깥부터 돌기 시작해
 * 반만큼 안에서 다 선다 — 가장자리 장이 판 밖으로 조금 새는 것의 근사다.
 */
export const FRINGE = 0.6;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 판 사이 한가운데가 y = 0.
// ------------------------------------------------------------------------

/** 판의 왼쪽 끝. */
export const PLATE_X0 = -2.8;
/** 판 두께. */
export const PLATE_THICKNESS = 0.14;
/** 자유 전하 표식이 판 안쪽 면에서 떨어진 거리 — 전하는 마주 보는 면에 모인다. */
export const MARK_INSET = 0.17;
/** 유전체 판 위아래와 판 안쪽 면 사이의 틈. 전하 표식이 이 틈에 놓인다. */
export const SLAB_CLEARANCE = 0.32;
/** 기다리는 유전체의 왼쪽 끝과 판 오른쪽 끝 사이의 틈. */
export const PARK_GAP = 0.5;

/**
 * 프레이밍 — 왼쪽의 장 이름표부터 오른쪽에 기다리는 유전체 끝까지, 위아래 전하 이름표와
 * 캡션 띠(장부 G24). 유전체가 판 밖에 있는 가장 넓은 장면이 들어가도록 처음부터 잡는다
 * (S-piece · 원칙 6).
 */
export const SCENE_BOUNDS = { minX: -4.1, maxX: 9.2, minY: -2.95, maxY: 2.2 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 빈 판 사이 장을 읽는 동안. */
export const EMPTY_HOLD = 2.0;
/** 유전체를 밀어 넣는 동안 · 다 들어간 판을 읽는 동안 · 빼는 동안. */
export const INSERT = 2.8;
export const FILLED_HOLD = 3.4;
export const WITHDRAW = 1.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const dielectricMessages = Object.freeze({
  'label.title': {
    ko: '유전체',
    en: 'Dielectric',
    ja: '誘電体',
    zh: '电介质',
    ar: 'العازل الكهربائي',
    es: 'Dieléctrico',
    fr: 'Diélectrique',
    hi: 'परावैद्युत',
    id: 'Dielektrik',
    pt: 'Dielétrico',
  },
  'label.operation': {
    ko: '분극과 전기장의 약화',
    en: 'Polarization weakens the field',
    ja: '分極が電場を弱める',
    zh: '极化削弱电场',
    ar: 'الاستقطاب يُضعف المجال',
    es: 'La polarización debilita el campo',
    fr: 'La polarisation affaiblit le champ',
    hi: 'ध्रुवण क्षेत्र को कमज़ोर करता है',
    id: 'Polarisasi melemahkan medan',
    pt: 'A polarização enfraquece o campo',
  },
  'label.stage': {
    ko: '전지에서 뗀 대전 판',
    en: 'Charged plates cut off from the battery',
    ja: '電池から切り離した帯電極板',
    zh: '与电池断开的带电极板',
    ar: 'ألواح مشحونة مفصولة عن البطارية',
    es: 'Placas cargadas desconectadas de la batería',
    fr: 'Plaques chargées débranchées de la pile',
    hi: 'बैटरी से अलग की गई आवेशित प्लेटें',
    id: 'Keping bermuatan yang dilepas dari baterai',
    pt: 'Placas carregadas desligadas da bateria',
  },
  'label.view': {
    ko: '옆에서 본 판',
    en: 'Side view',
    ja: '横から見た図',
    zh: '侧视图',
    ar: 'منظر جانبي',
    es: 'Vista lateral',
    fr: 'Vue de côté',
    hi: 'पार्श्व दृश्य',
    id: 'Tampak samping',
    pt: 'Vista lateral',
  },
  /** 판 전하 · 장 · 유전율 기호. 수식 표기라 표식이고, κ 는 스테이지 상수를 vars 로 끼운다. */
  'label.chargePlus': {
    ko: '+Q',
    en: '+Q',
    ja: '+Q',
    zh: '+Q',
    ar: '+Q',
    es: '+Q',
    fr: '+Q',
    hi: '+Q',
    id: '+Q',
    pt: '+Q',
  },
  'label.chargeMinus': {
    ko: '−Q',
    en: '−Q',
    ja: '−Q',
    zh: '−Q',
    ar: '−Q',
    es: '−Q',
    fr: '−Q',
    hi: '−Q',
    id: '−Q',
    pt: '−Q',
  },
  'label.field': {
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
  'label.fieldDivided': {
    ko: 'E/{k}',
    en: 'E/{k}',
    ja: 'E/{k}',
    zh: 'E/{k}',
    ar: 'E/{k}',
    es: 'E/{k}',
    fr: 'E/{k}',
    hi: 'E/{k}',
    id: 'E/{k}',
    pt: 'E/{k}',
  },
  'label.kappa': {
    ko: 'κ = {k}',
    en: 'κ = {k}',
    ja: 'κ = {k}',
    zh: 'κ = {k}',
    ar: 'κ = {k}',
    es: 'κ = {k}',
    fr: 'κ = {k}',
    hi: 'κ = {k}',
    id: 'κ = {k}',
    pt: 'κ = {k}',
  },
  'caption.empty': {
    ko: '전지에서 뗀 두 판 — 판의 전하는 들어오지도 나가지도 않고, 판 사이에 장이 서 있다',
    en: 'Two charged plates cut off from the battery — no charge comes or goes, and a field stands between them',
    ja: '電池から切り離した二枚の帯電極板 — 電荷は出入りせず、極板の間に電場がある',
    zh: '与电池断开的两块带电极板——电荷既不进也不出，两板之间存在电场',
    ar: 'لوحان مشحونان مفصولان عن البطارية — لا تدخل شحنة ولا تخرج، وبينهما مجال قائم',
    es: 'Dos placas cargadas desconectadas de la batería — ninguna carga entra ni sale, y entre ellas hay un campo',
    fr: "Deux plaques chargées débranchées de la pile — aucune charge n'entre ni ne sort, et un champ règne entre elles",
    hi: 'बैटरी से अलग की गई दो आवेशित प्लेटें — कोई आवेश न आता है न जाता है, और उनके बीच एक क्षेत्र बना रहता है',
    id: 'Dua keping bermuatan yang dilepas dari baterai — tak ada muatan yang masuk atau keluar, dan di antaranya ada medan',
    pt: 'Duas placas carregadas desligadas da bateria — nenhuma carga entra ou sai, e entre elas há um campo',
  },
  'caption.insert': {
    ko: '유전체가 들어오는 동안 분자들이 장을 따라 돌아서고, 판 사이 장이 약해진다',
    en: 'As the dielectric slides in, its molecules swing round to follow the field, and the field between the plates weakens',
    ja: '誘電体が入っていく間、分子が電場に沿って向きを変え、極板の間の電場が弱まる',
    zh: '电介质滑入时，其分子转向顺着电场排列，两板之间的电场减弱',
    ar: 'بينما ينزلق العازل إلى الداخل، تدور جزيئاته لتتبع المجال، ويضعف المجال بين اللوحين',
    es: 'Mientras el dieléctrico entra, sus moléculas giran para seguir el campo, y el campo entre las placas se debilita',
    fr: 'Pendant que le diélectrique glisse entre les plaques, ses molécules pivotent pour suivre le champ, et le champ entre les plaques faiblit',
    hi: 'जैसे-जैसे परावैद्युत भीतर सरकता है, उसके अणु घूमकर क्षेत्र की दिशा में आ जाते हैं, और प्लेटों के बीच का क्षेत्र कमज़ोर होता है',
    id: 'Saat dielektrik masuk, molekulnya berputar mengikuti medan, dan medan di antara keping melemah',
    pt: 'Enquanto o dielétrico entra, suas moléculas giram para seguir o campo, e o campo entre as placas enfraquece',
  },
  'caption.filled': {
    ko: '줄지어 선 분자들이 윗면에 −, 아랫면에 + 를 드러낸다 — 판의 전하는 그대로인데 장은 {k}분의 1 로 약해졌다',
    en: 'The lined-up molecules show − on the top face and + on the bottom — the plate charge is unchanged, yet the field is 1/{k} as strong',
    ja: '整列した分子が上面に −、下面に + を現す — 極板の電荷は変わらないのに、電場は 1/{k} の強さになった',
    zh: '排列整齐的分子在上表面显出 −，下表面显出 + ——极板电荷不变，电场却只有原来的 1/{k}',
    ar: 'تُظهر الجزيئات المصطفّة − على الوجه العلوي و+ على السفلي — شحنة اللوحين لم تتغير، لكن شدة المجال صارت 1/{k}',
    es: 'Las moléculas alineadas muestran − en la cara superior y + en la inferior — la carga de las placas no cambia, pero el campo queda en 1/{k} de su intensidad',
    fr: "Les molécules alignées font apparaître − sur la face du haut et + sur celle du bas — la charge des plaques n'a pas changé, mais le champ ne vaut plus que 1/{k}",
    hi: 'कतार में लगे अणु ऊपरी सतह पर − और निचली पर + दिखाते हैं — प्लेटों का आवेश वही है, फिर भी क्षेत्र 1/{k} गुना रह गया है',
    id: 'Molekul yang berjajar menampakkan − di permukaan atas dan + di bawah — muatan keping tak berubah, tetapi kuat medannya tinggal 1/{k}',
    pt: 'As moléculas alinhadas mostram − na face de cima e + na de baixo — a carga das placas não muda, mas o campo fica com 1/{k} da intensidade',
  },
  'caption.withdraw': {
    ko: '유전체를 빼면 분자들이 흐트러지고 장이 처음 세기로 돌아온다',
    en: 'Pull the dielectric out and the molecules scatter; the field returns to its first strength',
    ja: '誘電体を抜くと分子がばらばらになり、電場はもとの強さに戻る',
    zh: '抽出电介质，分子变得杂乱，电场恢复到最初的强度',
    ar: 'اسحب العازل فتتبعثر الجزيئات، ويعود المجال إلى شدته الأولى',
    es: 'Al sacar el dieléctrico, las moléculas se desordenan; el campo vuelve a su intensidad inicial',
    fr: 'Retirez le diélectrique : les molécules se désordonnent et le champ retrouve son intensité initiale',
    hi: 'परावैद्युत निकालते ही अणु बिखर जाते हैं; क्षेत्र अपनी पहली तीव्रता पर लौट आता है',
    id: 'Tarik keluar dielektrik, molekulnya berhamburan; medan kembali ke kuat semula',
    pt: 'Tire o dielétrico e as moléculas se desordenam; o campo volta à intensidade inicial',
  },
} satisfies Record<string, LocalizedText>);

export type DielectricMessageKey = keyof typeof dielectricMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: DielectricMessageKey): LocalizedText => dielectricMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: DielectricMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const dielectricSchema: BundleSchema = {
  id: DIELECTRIC_ID,
  label: text('label.title'),
  category: 'em',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 밀어 넣고, 읽고, 빼는 한 주기로 할 말을 마친다.
  parameters: [],

  stages: [
    {
      id: 'isolated-plates',
      label: text('label.stage'),
      constants: {
        kappa: KAPPA,
        plateGap: PLATE_GAP,
        plateLength: PLATE_LENGTH,
        chargeMarks: CHARGE_MARKS,
        moleculeColumns: MOLECULE_COLUMNS,
        moleculeRows: MOLECULE_ROWS,
        seed: SEED,
        fieldArrowLength: FIELD_ARROW_LENGTH,
        fringe: FRINGE,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 판과 옆에서 기다리는 유전체가 나란히 놓인다. */
  canvas: { height: 360, minHeight: 320 },

  /** 겹침은 scene 에 쓴 순서 — 유전체 면 위에 쌍극자, 그 위에 장 화살표, 판, 전하, 이름표. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 빈 판 → 유전체를 밀어 넣음 → 다 들어간 판 → 뺌. 끝이 처음과 같은 그림이라
   * 흐려짐 없이 다음 주기로 잇는다. 유전체가 움직이는 단계는 `smooth` 로 선언한다.
   */
  timeline: {
    phases: [
      { id: 'empty', duration: EMPTY_HOLD, caption: key('caption.empty') },
      { id: 'insert', duration: INSERT, ease: 'smooth', caption: key('caption.insert') },
      { id: 'filled', duration: FILLED_HOLD, caption: key('caption.filled') },
      { id: 'withdraw', duration: WITHDRAW, ease: 'smooth', caption: key('caption.withdraw') },
    ],
  },

  /** 도착한 순간 빈 판 사이 장이 서 있고, 곧(1 초 뒤) 유전체가 들어오기 시작한다. */
  startAt: 1.0,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 식과 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 760,
    style: { colorRole: 'muted', emphasis: 'strong' },
    // 캡션 속 κ 는 스테이지 상수의 글자다 — state 가 선언값을 그대로 옮겨 둔다(장부 G133).
    vars: { k: 'kappa' },
  },

  messages: dielectricMessages,
};
