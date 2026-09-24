// ========================================================================
// pressure-and-container-shape — 선언
// ========================================================================
// 질문: 담긴 물의 양이 다른데 왜 바닥이 받는 압력은 같은가.
// 동사: 차오른다 · 나란해진다.
//
// 화면에 나타나는 모든 것 — 치수 · 문안 · 캔버스 높이 — 은 이 파일에 있다
// (원칙 2). 코드에는 키와 기본값만 남는다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pressure-and-container-shape` 와 문자 그대로 일치한다. */
export const PRESSURE_AND_CONTAINER_SHAPE_ID = 'pressure-and-container-shape';

// ------------------------------------------------------------------------
// 자유 렌더 계층이 그리는 프리미티브 타입 이름.
// 렌더러 등록 키와 문자 그대로 일치해야 한다 (NOTES.md 「등록」 참고).
// ------------------------------------------------------------------------


// ------------------------------------------------------------------------
// 그릇 셋의 치수 — 바닥 넓이는 같고 모양만 다르다.
//
// 단면 폭 w(y) 는 높이에 선형이고 깊이 d 는 일정하다. 따라서
//   단면 넓이 A(y) = d · w(y),  바닥 넓이 A(0) = d · w0 = 0.02 m²
//   부피 V(h)     = d · h · (w0 + w(h)) / 2
//
// 기준 수면 h = 0.30 m 에서
//   벌어지는 것 w(0.30) = 0.40 m → 9.0 L
//   곧은 것     w(0.30) = 0.20 m → 6.0 L
//   좁아지는 것 w(0.30) = 0.04 m → 3.6 L
// 부피는 2.5 배 차이인데 바닥 계기압은 셋 다 ρgh = 2940 Pa 이다.
// ------------------------------------------------------------------------

export type VesselId = 'flared' | 'straight' | 'tapered';

export interface VesselShape {
  id: VesselId;
  /** 그릇 중심의 월드 x (m). */
  centerX: number;
  /** 바닥 폭 (m). 셋 다 같다. */
  bottomWidth: number;
  /** 벽 꼭대기 폭 (m). */
  topWidth: number;
  /** 벽 높이 (m). */
  wallHeight: number;
  /** 화면 뒤쪽 깊이 (m). 부피 계산용 — 셋 다 같다. */
  depth: number;
}

export const VESSEL_SHAPES: readonly VesselShape[] = [
  { id: 'flared', centerX: -0.42, bottomWidth: 0.2, topWidth: 0.44, wallHeight: 0.36, depth: 0.1 },
  { id: 'straight', centerX: 0.1, bottomWidth: 0.2, topWidth: 0.2, wallHeight: 0.36, depth: 0.1 },
  { id: 'tapered', centerX: 0.52, bottomWidth: 0.2, topWidth: 0.008, wallHeight: 0.36, depth: 0.1 },
];

/** 물의 밀도 (kg/m³) — stage.constants 가 비었을 때의 기본값. */
export const WATER_DENSITY = 1000;
/** 중력 가속도 (m/s²) — stage.constants 가 비었을 때의 기본값. */
export const GRAVITY = 9.8;
/** 세 그릇에 똑같이 붓는 유량 (m³/s). 벌어지는 그릇이 3.6 초에 찬다. */
export const FILL_RATE = 0.0025;
/** 기준 수면 높이 (m). */
export const REFERENCE_LEVEL = 0.3;
/** 조작 가능한 수면 높이 범위 (m). 슬라이더·파라미터·물리가 같은 값을 쓴다. */
export const TARGET_LEVEL_RANGE: readonly [number, number] = [0.12, 0.32];

/** 바닥 화살표를 놓는 x 오프셋 (그릇 중심 기준, m). */
export const PRESSURE_ARROW_OFFSETS: readonly number[] = [-0.06, 0, 0.06];
/** 바닥 압력 화살표의 길이 = 수심 × 이 비율. P ∝ h 를 길이로 옮긴다. */
export const PRESSURE_ARROW_RATIO = 1 / 3;

/** 카메라가 매 프레임 맞추는 고정 프레임. 물이 차올라도 화면이 흔들리지 않는다. */
export const SCENE_BOUNDS = { minX: -0.74, maxX: 0.74, minY: -0.17, maxY: 0.4 } as const;

/** 수면 안내선의 x 구간. */
export const LEVEL_LINE_SPAN: readonly [number, number] = [-0.7, 0.72];
/** 수면 높이 표시의 월드 앵커 x (오른쪽 정렬). */
export const LEVEL_READOUT_X = 0.72;
/** 그릇 아래 숫자 줄의 월드 앵커 y. */
export const FOOTER_ANCHOR_Y = -0.12;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

/** 화면에 뜨는 문안. 값은 `vars` 로 끼운다 (C1). */
export const pressureAndContainerShapeMessages = Object.freeze({
  'label.volume': {
    ko: '{v} L',
    en: '{v} L',
    ja: '{v} L',
    zh: '{v} L',
    ar: '{v} L',
    es: '{v} L',
    fr: '{v} L',
    hi: '{v} L',
    id: '{v} L',
    pt: '{v} L',
  },
  'label.pressure': {
    ko: '{p} Pa',
    en: '{p} Pa',
    ja: '{p} Pa',
    zh: '{p} Pa',
    ar: '{p} Pa',
    es: '{p} Pa',
    fr: '{p} Pa',
    hi: '{p} Pa',
    id: '{p} Pa',
    pt: '{p} Pa',
  },
  'label.level': {
    ko: 'h = {h} m',
    en: 'h = {h} m',
    ja: 'h = {h} m',
    zh: 'h = {h} m',
    ar: 'h = {h} m',
    es: 'h = {h} m',
    fr: 'h = {h} m',
    hi: 'h = {h} m',
    id: 'h = {h} m',
    pt: 'h = {h} m',
  },
  'label.constants': {
    ko: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    en: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    ja: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    zh: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    ar: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    es: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    fr: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    hi: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    id: 'ρ = {rho} kg/m³ · g = {g} m/s²',
    pt: 'ρ = {rho} kg/m³ · g = {g} m/s²',
  },
  'label.bottomArea': {
    ko: '바닥 넓이 A = {a} m² — 셋 다 같다',
    en: 'bottom area A = {a} m² — all equal',
    ja: '底面積 A = {a} m² — 三つとも同じ',
    zh: '底面积 A = {a} m² — 三者相同',
    ar: 'مساحة القاعدة A = {a} m² — متساوية في الثلاثة',
    es: 'área de la base A = {a} m² — igual en los tres',
    fr: 'aire du fond A = {a} m² — identique pour les trois',
    hi: 'तली का क्षेत्रफल A = {a} m² — तीनों में बराबर',
    id: 'luas alas A = {a} m² — ketiganya sama',
    pt: 'área da base A = {a} m² — igual nos três',
  },
  'label.vessel.flared': {
    ko: '위로 벌어지는',
    en: 'widening',
    ja: '上に広がる',
    zh: '向上变宽',
    ar: 'متّسع للأعلى',
    es: 'ensanchado',
    fr: 'évasé',
    hi: 'ऊपर चौड़ा',
    id: 'melebar ke atas',
    pt: 'alargado',
  },
  'label.vessel.straight': {
    ko: '곧은',
    en: 'straight',
    ja: 'まっすぐな',
    zh: '直筒',
    ar: 'مستقيم',
    es: 'recto',
    fr: 'droit',
    hi: 'सीधा',
    id: 'lurus',
    pt: 'reto',
  },
  'label.vessel.tapered': {
    ko: '위로 좁아지는',
    en: 'narrowing',
    ja: '上にすぼまる',
    zh: '向上变窄',
    ar: 'متضيّق للأعلى',
    es: 'estrechado',
    fr: 'rétréci',
    hi: 'ऊपर संकरा',
    id: 'menyempit ke atas',
    pt: 'estreitado',
  },
  'label.targetHeight': {
    ko: '수면 높이 h',
    en: 'Water level h',
    ja: '水面の高さ h',
    zh: '水面高度 h',
    ar: 'مستوى سطح الماء h',
    es: 'Nivel del agua h',
    fr: 'Niveau de l’eau h',
    hi: 'जल-स्तर h',
    id: 'Tinggi permukaan air h',
    pt: 'Nível da água h',
  },
} satisfies Record<string, LocalizedText>);

export type PressureMessageKey = keyof typeof pressureAndContainerShapeMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: PressureMessageKey): LocalizedText {
  return pressureAndContainerShapeMessages[key];
}

/** 그릇 이름 문안. */
export function vesselText(id: VesselId): LocalizedText {
  return text(`label.vessel.${id}` as PressureMessageKey);
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pressureAndContainerShapeSchema: BundleSchema = {
  id: PRESSURE_AND_CONTAINER_SHAPE_ID,
  label: {
    ko: '그릇 모양과 바닥 압력',
    en: 'Container shape and bottom pressure',
    ja: '容器の形と底の圧力',
    zh: '容器形状与底部压强',
    ar: 'شكل الوعاء والضغط عند القاعدة',
    es: 'Forma del recipiente y presión en el fondo',
    fr: 'Forme du récipient et pression au fond',
    hi: 'बर्तन का आकार और तली पर दाब',
    id: 'Bentuk wadah dan tekanan di dasar',
    pt: 'Forma do recipiente e pressão no fundo',
  },
  category: 'fluids',
  operation: {
    ko: '수면 높이를 옮겨 세 그릇을 다시 채운다',
    en: 'Move the water level and refill all three',
    ja: '水面の高さを変えて三つの容器を満たし直す',
    zh: '调整水面高度，重新给三个容器注水',
    ar: 'حرّك مستوى سطح الماء وأعد ملء الأوعية الثلاثة',
    es: 'Mueve el nivel del agua y vuelve a llenar los tres',
    fr: 'Déplace le niveau de l’eau et remplis à nouveau les trois',
    hi: 'जल-स्तर बदलो और तीनों को फिर से भरो',
    id: 'Geser tinggi permukaan air dan isi ulang ketiganya',
    pt: 'Mude o nível da água e encha os três de novo',
  },
  timeModel: 'linear',
  parameters: [
    {
      id: 'targetHeight',
      label: {
        ko: '수면 높이',
        en: 'Water level',
        ja: '水面の高さ',
        zh: '水面高度',
        ar: 'مستوى سطح الماء',
        es: 'Nivel del agua',
        fr: 'Niveau de l’eau',
        hi: 'जल-स्तर',
        id: 'Tinggi permukaan air',
        pt: 'Nível da água',
      },
      unit: 'm',
      range: [TARGET_LEVEL_RANGE[0], TARGET_LEVEL_RANGE[1]],
      default: REFERENCE_LEVEL,
      step: 0.01,
      statePath: 'targetHeight',
    },
  ],
  stages: [
    {
      id: 'water',
      label: {
        ko: '물',
        en: 'Water',
        ja: '水',
        zh: '水',
        ar: 'الماء',
        es: 'Agua',
        fr: 'Eau',
        hi: 'जल',
        id: 'Air',
        pt: 'Água',
      },
      description: {
        ko: '밀도 1000 kg/m³ 의 물, 중력 가속도 9.8 m/s²',
        en: 'Water at 1000 kg/m³ under gravity 9.8 m/s²',
        ja: '密度 1000 kg/m³ の水、重力加速度 9.8 m/s²',
        zh: '密度 1000 kg/m³ 的水，重力加速度 9.8 m/s²',
        ar: 'ماء كثافته 1000 kg/m³ تحت جاذبية 9.8 m/s²',
        es: 'Agua de 1000 kg/m³ con gravedad 9.8 m/s²',
        fr: 'Eau à 1000 kg/m³ sous une pesanteur de 9.8 m/s²',
        hi: '1000 kg/m³ घनत्व का पानी, गुरुत्वीय त्वरण 9.8 m/s²',
        id: 'Air 1000 kg/m³ dengan gravitasi 9.8 m/s²',
        pt: 'Água a 1000 kg/m³ sob gravidade 9.8 m/s²',
      },
      constants: { rho: WATER_DENSITY, g: GRAVITY, fillRate: FILL_RATE },
    },
  ],
  environments: [],
  views: [
    {
      id: 'fill',
      label: {
        ko: '차오름',
        en: 'Filling',
        ja: '満ちていく水',
        zh: '注水',
        ar: 'الامتلاء',
        es: 'Llenado',
        fr: 'Remplissage',
        hi: 'भराव',
        id: 'Pengisian',
        pt: 'Enchimento',
      },
      description: {
        ko: '같은 유량으로 세 그릇을 채우고, 수면이 나란해지는 순간을 본다',
        en: 'Fill all three at one rate and watch the surfaces line up',
        ja: '三つを同じ流量で満たし、水面がそろう瞬間を見る',
        zh: '以同样的流量给三个容器注水，看水面齐平的那一刻',
        ar: 'املأ الأوعية الثلاثة بمعدل واحد وراقب الأسطح وهي تتساوى',
        es: 'Llena los tres al mismo ritmo y mira cómo se alinean las superficies',
        fr: 'Remplis les trois au même débit et regarde les surfaces s’aligner',
        hi: 'तीनों को एक ही दर से भरो और सतहों को एक सीध में आते देखो',
        id: 'Isi ketiganya dengan laju yang sama dan lihat permukaannya menjadi sejajar',
        pt: 'Encha os três no mesmo ritmo e veja as superfícies se alinharem',
      },
      default: true,
    },
  ],
  canvas: { height: 400, minHeight: 360 },
  messages: pressureAndContainerShapeMessages,
};
