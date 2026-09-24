// ========================================================================
// magnetic-materials — 선언
// ========================================================================
// 질문: 자석은 재료마다 같은 세기로 당기는가.
//
// 철 · 알루미늄 · 비스무트 막대가 실에 나란히 매달려 있고, 막대마다 옆에 같은 막대자석의
// N극이 다가온다. **철(강자성)은 세게 끌려 자석에 붙고, 알루미늄(상자성)은 아주 조금
// 끌리고, 비스무트(반자성)는 조금 밀린다.** 막대 안의 작은 자기 쌍극자(화살표)가 그 까닭을
// 보인다 — 강자성은 구역째 자석 쪽으로 정렬하고, 상자성은 제멋대로 흔들리던 것이 조금만
// 기울고, 반자성은 없던 쌍극자가 반대로 생겨 선다.
//
// 「무엇이 붙는가」 는 `magnet-attraction` 의 몫이다. 이 조각은 붙느냐 마느냐가 아니라
// 끌림의 방향 · 크기와 그 안쪽을 본다. 엔진 위에서 바로 만든 조각이다 — 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:magnetic-materials` 와 문자 그대로 일치한다 (C4). */
export const MAGNETIC_MATERIALS_ID = 'magnetic-materials';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 약한 자성체의 기울기: 매단 막대가 받는 자기력 / 무게 = χ·B(dB/dx) / (μ₀ ρ g).
 * 부피가 약분되므로 막대 크기와 무관하다.
 */
/** 진공 투자율 μ₀ (T·m/A). */
export const MU0 = 1.2566e-6;
/** 중력 가속도 g (m/s²). */
export const GRAVITY = 9.8;
/** 자석 극 앞, 막대 자리의 B·dB/dx (T²/m). 흔한 네오디뮴 자석 가까이의 크기다. */
export const B_GRAD_B = 20;
/** 알루미늄(상자성)의 부피 자화율 χ 와 밀도 ρ (kg/m³). */
export const ALUMINUM_CHI = 2.2e-5;
export const ALUMINUM_DENSITY = 2700;
/** 비스무트(반자성)의 부피 자화율 χ 와 밀도 ρ (kg/m³). 반자성체 가운데 가장 세다. */
export const BISMUTH_CHI = -1.66e-4;
export const BISMUTH_DENSITY = 9780;
/**
 * 약한 두 기울기(상자성 · 반자성)의 과장 배율. 실제 기울기는 1~2° 라 임베드 크기에서
 * 보이지 않는다. 캡션이 이 값을 그대로 말한다(`{k}`). 강자성에는 걸지 않는다 — 닿을 때까지 간다.
 */
export const WEAK_EXAGGERATION = 5;

// ------------------------------------------------------------------------
// 배치 (월드) — 스테이지 상수의 기본값
// ------------------------------------------------------------------------

/** 세 줄의 매단 점 x — 강자성 · 상자성 · 반자성 순서. */
export const FERRO_X = -5.45;
export const PARA_X = -1.35;
export const DIA_X = 2.75;
/** 매단 점의 높이, 매단 점에서 막대 가운데까지의 길이. */
export const PIVOT_Y = 2.3;
export const PENDULUM_LENGTH = 1.7;
/** 막대 가로 · 세로. */
export const BAR_WIDTH = 1.0;
export const BAR_HEIGHT = 1.2;
/** 막대 안 쌍극자 격자 — 가로 · 세로 간격, 화살표 길이. */
export const DIPOLE_GAP_X = 0.32;
export const DIPOLE_GAP_Y = 0.36;
export const DIPOLE_LENGTH = 0.24;
/** 반자성에 생기는 쌍극자의 길이 — 영구 쌍극자보다 짧다(유도된 것이라 약하다). */
export const DIA_DIPOLE_LENGTH = 0.2;
/** 막대자석의 길이 · 두께, 가운데 높이. N 끝이 막대 쪽(−x)이다. */
export const MAGNET_LENGTH = 1.2;
export const MAGNET_THICKNESS = 0.7;
export const MAGNET_Y = 0.5;
/** 다가온 뒤 자석 N 끝면과 (곧게 매달린) 막대 오른쪽 면 사이의 틈. */
export const MAGNET_GAP = 0.8;
/** 자석이 다가오는 거리 — 처음엔 이만큼 더 떨어져 있다. */
export const APPROACH_TRAVEL = 0.7;
/**
 * 상자성 쌍극자가 자기장 쪽으로 도는 몫(0~1). 열 흔들림이 정렬을 막아 일부만 기운다.
 * 강자성은 1(모두), 반자성은 영구 쌍극자가 없다.
 */
export const PARA_ALIGN = 0.5;
/** 상자성 쌍극자의 열 흔들림 — 진폭(도) · 진동수(Hz). */
export const THERMAL_WOBBLE_DEG = 22;
export const THERMAL_HZ = 0.6;
/** 쌍극자 처음 방향을 뽑는 시드 (S-sim — 같은 시드는 같은 화면). */
export const SEED = 7;

/**
 * 프레이밍은 주장의 일부다. 왼쪽 막대(반자성 쪽으로 밀린 자리 포함)부터 멀리 있던 자석의
 * 오른쪽 끝까지, 위는 매단 막대, 아래는 재료 이름표 두 줄과 캡션 줄 (원칙 6 · S-piece · G24).
 */
export const SCENE_BOUNDS = { minX: -6.1, maxX: 6.1, minY: -1.25, maxY: 2.45 } as const;

// ------------------------------------------------------------------------
// 시간표 — 단계 길이(초)
// ------------------------------------------------------------------------

/** 막대와 자석이 나타나는 동안. */
export const APPEAR = 0.6;
/** 자석이 떨어져 있는 동안 — 막대는 곧게 매달려 있다. */
export const SHOW = 2.2;
/** 자석이 막대 쪽으로 다가오는 동안. 끌림 · 밀림이 함께 자란다. */
export const APPROACH = 2.2;
/** 기울기를 읽는 동안. */
export const HOLD = 3.4;
/** 안쪽 쌍극자를 읽는 동안. */
export const INSIDE = 3.8;
/** 흐려지며 다음 주기로 넘어가는 동안. */
export const CLEAR = 0.8;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const magneticMaterialsMessages = Object.freeze({
  'label.title': { ko: '자성체', en: 'Magnetic materials' },
  'label.stage': { ko: '센 자석 옆에 매단 세 막대', en: 'Three hanging bars beside a strong magnet' },
  'label.view': { ko: '옆에서 본 모습', en: 'Side view' },
  /** 자극 표식. 자석에 새겨진 글자라 번역하지 않는다 (C1 판정 1). */
  'mark.north': { ko: 'N', en: 'N' },
  'mark.south': { ko: 'S', en: 'S' },
  'material.iron': { ko: '철', en: 'iron' },
  'material.aluminum': { ko: '알루미늄', en: 'aluminium' },
  'material.bismuth': { ko: '비스무트', en: 'bismuth' },
  'class.ferro': { ko: '강자성', en: 'ferromagnetic' },
  'class.para': { ko: '상자성', en: 'paramagnetic' },
  'class.dia': { ko: '반자성', en: 'diamagnetic' },
  'caption.intro': {
    ko: '세 막대가 실에 곧게 매달려 있고, 옆의 자석은 아직 멀다',
    en: 'Three bars hang straight on threads; the magnets beside them are still far away',
  },
  'caption.approach': {
    ko: '똑같은 자석 셋의 N극을 세 막대 쪽으로 가까이 가져온다',
    en: 'Three identical magnets bring their N poles close to the three bars',
  },
  'caption.tilt': {
    ko: '강자성은 세게 끌려 붙고, 상자성은 조금 끌리고, 반자성은 조금 밀린다 — 약한 두 기울기는 {k}배로 키웠다',
    en: 'The ferromagnet is pulled hard and sticks, the paramagnet leans in a little, the diamagnet is pushed away a little — the two weak tilts are drawn {k}× larger',
  },
  'caption.inside': {
    ko: '안쪽 작은 자석들 — 강자성은 구역째 한 방향으로 서고, 상자성은 흔들리며 조금만 기울고, 반자성은 거꾸로 생겨 선다',
    en: 'The tiny magnets inside: the ferromagnet’s line up region by region, the paramagnet’s jiggle and lean only a little, the diamagnet’s appear pointing the opposite way',
  },
} satisfies Record<string, LocalizedText>);

export type MagneticMaterialsMessageKey = keyof typeof magneticMaterialsMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: MagneticMaterialsMessageKey): LocalizedText => magneticMaterialsMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: MagneticMaterialsMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const magneticMaterialsSchema: BundleSchema = {
  id: MAGNETIC_MATERIALS_ID,
  title: text('label.title'),
  category: 'em',
  timeModel: 'periodic',

  // 조작기가 없다 — 자석이 다가오는 것을 시간표가 보여 준다.
  parameters: [],

  stages: [
    {
      id: 'three-bars',
      label: text('label.stage'),
      constants: {
        mu0: MU0,
        gravity: GRAVITY,
        bGradB: B_GRAD_B,
        aluminumChi: ALUMINUM_CHI,
        aluminumDensity: ALUMINUM_DENSITY,
        bismuthChi: BISMUTH_CHI,
        bismuthDensity: BISMUTH_DENSITY,
        weakExaggeration: WEAK_EXAGGERATION,
        ferroX: FERRO_X,
        paraX: PARA_X,
        diaX: DIA_X,
        pivotY: PIVOT_Y,
        pendulumLength: PENDULUM_LENGTH,
        barWidth: BAR_WIDTH,
        barHeight: BAR_HEIGHT,
        dipoleGapX: DIPOLE_GAP_X,
        dipoleGapY: DIPOLE_GAP_Y,
        dipoleLength: DIPOLE_LENGTH,
        diaDipoleLength: DIA_DIPOLE_LENGTH,
        magnetLength: MAGNET_LENGTH,
        magnetThickness: MAGNET_THICKNESS,
        magnetY: MAGNET_Y,
        magnetGap: MAGNET_GAP,
        approachTravel: APPROACH_TRAVEL,
        paraAlign: PARA_ALIGN,
        thermalWobbleDeg: THERMAL_WOBBLE_DEG,
        thermalHz: THERMAL_HZ,
        seed: SEED,
      },
    },
  ],

  environments: [],

  views: [{ id: 'side', label: text('label.view'), default: true }],

  /** 가로로 세 줄. 세로를 더 주어도 가로가 먼저 차서 그림만 작아진다 (S-piece — 세로가 비싸다). */
  canvas: { height: 320, minHeight: 280 },

  /**
   * 한 주기 = 나타남 → 자석이 멀다 → 자석이 다가온다 → 기울기 → 안쪽 → 흐려짐.
   * 끌림 · 밀림 · 정렬은 모두 `approach` 진행도(자석이 얼마나 다가왔나)의 함수다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: APPEAR, ease: 'smooth', caption: key('caption.intro') },
      { id: 'show', duration: SHOW, caption: key('caption.intro') },
      { id: 'approach', duration: APPROACH, ease: 'smooth', caption: key('caption.approach') },
      { id: 'hold', duration: HOLD, caption: key('caption.tilt') },
      { id: 'inside', duration: INSIDE, caption: key('caption.inside') },
      { id: 'clear', duration: CLEAR, ease: 'smooth', caption: key('caption.inside') },
    ],
  },

  /** 도착한 순간 이미 진행 중이다 — 막대와 자석이 놓여 있고 곧 자석이 다가온다. */
  startAt: 1.2,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 까닭(χ 의 부호)은 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    fade: 0.25,
    style: { colorRole: 'muted', emphasis: 'strong' },
    vars: { k: 'exaggeration' },
  },

  /** 그리드 · 카메라 단추 없음(기본값). 잴 것이 거리가 아니라 기우는 방향이다. */

  /**
   * 쓴 순서대로 그린다 — 점선 추선을 막대 **아래**에 깔아, 곧게 매달렸던 자리는 막대 밖에서만
   * 보이고 막대 안 화살표를 가리지 않는다.
   */
  drawOrder: 'scene',

  messages: magneticMaterialsMessages,
};
