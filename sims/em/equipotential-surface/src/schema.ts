// ========================================================================
// equipotential-surface — 선언
// ========================================================================
// 질문: 전기장은 왜 등전위면과 **늘** 수직인가.
//
// 전위를 높이로 세운 지형(왼쪽)과 같은 전위를 위에서 본 지도(오른쪽)를 나란히 둔다.
// 양전하에서 전기력선을 따라 옮기는 시험 전하가 가장 가파른 내리막(= 전기장)을 따라 내려가며, 지도에서
// 등전위선을 지날 때마다 그 자리에 직각 표시를 남긴다.
//
// 원본: tasks/piece-lab/equipotential-surface. 상수는 원본 그대로다. 화면 좌표는 원본
// 캔버스 px(900 × 330, y 아래)로 두고, 월드(y 위)로 뒤집는 것은 physics 의 `toWorld` 다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:equipotential-surface` 와 문자 그대로 일치한다 (C4). */
export const EQUIPOTENTIAL_SURFACE_ID = 'equipotential-surface';

/** 무대 — 원본 캔버스(px). */
export const STAGE = { width: 900, height: 330 } as const;

/** 물리 영역(단위 길이). */
export const DOMAIN = { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 } as const;

/** 점전하 특이점 완화. */
export const EPS = 0.06;
/** 높이 압축 척도: h = tanh(V / V0). 단조 변환이라 등전위선 · 내리막 방향이 그대로다. */
export const V0 = 2.2;
/** 등전위선 높이 값 — h 공간에서 같은 간격 9개. */
export const LEVELS = { min: -0.8, step: 0.2, count: 9 } as const;

/** 원천 전하 처음 배치. 크기가 달라 좌우 대칭이 아니다 (원본 NOTES (c)). */
export const CHARGES = [
  { x: -0.75, y: 0.2, q: 2 },
  { x: 0.85, y: -0.3, q: -1 },
] as const;

/** 오른쪽 — 위에서 본 전위 지도(px). */
export const MAP = { x: 490, y: 15, w: 400, h: 300 } as const;
/**
 * 지도 밝기 격자(칸). 원본은 픽셀마다 칠했다. 전위가 tanh 로 눌려 매끄러워 반 해상도로
 * 칠하고 늘려 그려도 같은 명암이다 — 등전위선은 따로 긋는다.
 */
export const MAP_GRID = { cols: 200, rows: 150 } as const;
/** 지도 등전위선 추출 격자(마디). */
export const MAP_CONTOUR_GRID = { nx: 161, ny: 121 } as const;

/** 왼쪽 — 비스듬히 내려다본 3차원 지형. 중심(px) · 배율 · 높이 배율 · 방위각 · 앙각. */
export const P3 = { cx: 240, cy: 168, s: 80, hs: 0.9, yaw: 0.5, el: 0.55 } as const;
/** 지형 격자(칸). */
export const MESH = { mx: 64, my: 48 } as const;
/** 지형 판의 너비(px). 깊이 판정 · 밝기 격자가 이 폭 × 무대 높이를 덮는다. */
export const SURFACE_W = 480;
/** 기울기 음영의 빛 방향과 음영 범위(0.7 ~ 1). */
export const LIGHT = { dir: [-0.5, 0.4, 0.77], base: 0.7, gain: 0.3 } as const;
/** 곡면 위 선 · 점 가려짐 판정의 깊이 여유. */
export const DEPTH_TOLERANCE = 0.05;
/** 곡면 위에 얹는 선 · 점을 면보다 띄우는 높이 — 등전위선 · 시험 전하 자취. */
export const LIFT = { contour: 0.01, path: 0.015 } as const;

/**
 * 원본 명암 대응(`rampRGB`)의 세 성분 평균 밝기(0~1). 낮은 전위 끝 · 높은 전위 끝.
 * 원본 페이지 바탕 밝기에 대한 빛의 양 비로 `scalarField` 값을 만든다 (physics `shadeValue`).
 */
export const RAMP = { dark: 92 / 255, bright: 242 / 255, paper: 251 / 255 } as const;

/** 시험 전하 — 경로 적분 걸음 · 속력(단위/초) · 끝에서 흐려지는 시간(초). */
export const TEST = {
  ds: 0.02,
  speed: 0.8,
  pause: 1.2,
  /** 출발 시각을 어긋나게 두는 앞당김(초). 도착한 순간 이미 여러 단계가 섞여 진행 중이다. */
  offsets: [0.4, 2.1, 3.9, 1.3, 5.2, 3.0],
  /** 양전하 둘레 출발 반지름 · 각도 비틀기(라디안). */
  startR: 0.16,
  startTwist: 0.3,
  maxSteps: 800,
  /** 음전하에 흡수되는 반지름. */
  sinkR: 0.12,
} as const;

/** 끌기 — 무대 가장자리 여유 · 두 전하 최소 거리(단위 길이) · 잡히는 반경(px). */
export const DRAG = { margin: 0.25, minApart: 0.45, grabRadius: 16 } as const;

/** 그림 치수(px). 원본 그대로. */
export const MARKS = {
  /** 시험 전하 점 반지름 — 지형 · 지도. */
  headSurface: 4,
  headMap: 4.5,
  /** 원천 전하 원 반지름 — 지형 · 지도. 기호 반길이는 반지름의 절반. */
  chargeSurface: 6,
  chargeMap: 9,
  /** 직각 표시 변 길이. */
  rightAngle: 7,
  /** 굵기 — 자취 · 직각 표시 · 등전위선 · 원천 전하 테두리. */
  pathWidth: 2,
  rightAngleWidth: 1.2,
  contourWidth: 1,
  chargeStroke: 1.5,
} as const;

/** 캡션 띠(px). 원본 캡션은 캔버스 밖 문단이었다 — 슬롯이 캔버스 안이라 그림 아래를 비운다. */
export const CAPTION_BAND = 52;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const equipotentialSurfaceMessages = Object.freeze({
  'label.title': {
    ko: '등전위면',
    en: 'Equipotential surfaces',
    ja: '等電位面',
    zh: '等势面',
    ar: 'أسطح تساوي الجهد',
    es: 'Superficies equipotenciales',
    fr: 'Surfaces équipotentielles',
    hi: 'समविभव पृष्ठ',
    id: 'Permukaan ekuipotensial',
    pt: 'Superfícies equipotenciais',
  },
  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */
  'label.description': {
    ko: '전기장과 수직인 면',
    en: 'Surfaces perpendicular to the field',
    ja: '電場に垂直な面',
    zh: '与电场垂直的面',
    ar: 'أسطح عمودية على المجال',
    es: 'Superficies perpendiculares al campo',
    fr: 'Surfaces perpendiculaires au champ',
    hi: 'क्षेत्र के लंबवत पृष्ठ',
    id: 'Permukaan yang tegak lurus medan',
    pt: 'Superfícies perpendiculares ao campo',
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
    ko: '지형과 지도',
    en: 'Terrain and map',
    ja: '地形と地図',
    zh: '地形与地图',
    ar: 'التضاريس والخريطة',
    es: 'Relieve y mapa',
    fr: 'Relief et carte',
    hi: 'भू-आकृति और मानचित्र',
    id: 'Topografi dan peta',
    pt: 'Relevo e mapa',
  },
  'caption.main': {
    ko: '시험 전하를 양전하에서 전기력선을 따라 옮기면, 전위 지형의 가장 가파른 내리막을 따라 내려가며 등전위선을 만날 때마다 직각으로 가로지른다.',
    en: 'Moved from the positive charge along an electric field line, a test charge follows the steepest slope of the potential terrain and crosses every equipotential line at a right angle.',
    ja: '試験電荷を正電荷から電気力線に沿って動かすと、電位の地形のいちばん急な下り坂に沿って下り、等電位線に出会うたびに直角に横切る。',
    zh: '把试探电荷从正电荷处沿电场线移动，它沿电势地形最陡的下坡而下，每遇到一条等势线都垂直穿过。',
    ar: 'إذا نُقلت شحنة اختبار من الشحنة الموجبة على طول خط المجال الكهربائي، فإنها تنحدر على أشد منحدرات تضاريس الجهد وتقطع كل خط تساوي جهد بزاوية قائمة.',
    es: 'Llevada desde la carga positiva a lo largo de una línea de campo eléctrico, una carga de prueba baja por la pendiente más pronunciada del relieve de potencial y cruza cada línea equipotencial en ángulo recto.',
    fr: 'Déplacée depuis la charge positive le long d’une ligne de champ électrique, une charge d’essai descend la plus forte pente du relief du potentiel et coupe chaque ligne équipotentielle à angle droit.',
    hi: 'धनावेश से परीक्षण आवेश को विद्युत क्षेत्र रेखा के साथ-साथ ले जाने पर वह विभव की भू-आकृति की सबसे तीखी ढलान पर नीचे जाता है और हर समविभव रेखा को समकोण पर काटता है।',
    id: 'Jika dipindahkan dari muatan positif menyusuri garis medan listrik, sebuah muatan uji menuruni lereng paling curam pada topografi potensial dan memotong setiap garis ekuipotensial dengan sudut siku-siku.',
    pt: 'Levada a partir da carga positiva ao longo de uma linha de campo elétrico, uma carga de prova desce pela encosta mais íngreme do relevo do potencial e cruza cada linha equipotencial em ângulo reto.',
  },
} satisfies Record<string, LocalizedText>);

export type EquipotentialSurfaceMessageKey = keyof typeof equipotentialSurfaceMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: EquipotentialSurfaceMessageKey): LocalizedText => equipotentialSurfaceMessages[key];

/** 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: EquipotentialSurfaceMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const equipotentialSurfaceSchema: BundleSchema = {
  id: EQUIPOTENTIAL_SURFACE_ID,
  label: text('label.title'),
  category: 'em',
  description: text('label.description'),
  timeModel: 'continuous',

  // 고를 값이 없다. 손잡이는 지도 위 원천 전하 끌기 둘이다 (controllers.ts).
  parameters: [],
  stages: [{ id: 'default', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'default', label: text('label.view'), default: true }],

  /** 원본 캔버스 900 × 330 에 캡션 띠를 더한 비율. 마운트 후 바뀌지 않는다 (원칙 6). */
  canvas: { height: 380, minHeight: 330 },

  /**
   * 시간표를 두지 않는다. 원본에는 주기 안 단계가 없다 — 시험 전하 여섯이 **제 경로 길이로
   * 정해지는 주기**(내려가는 시간 + 흐려지는 1.2초)를 따로 돌고, 경로 길이는 전하 배치의
   * 함수라 끌면 바뀐다. 단계 길이가 상태를 따라가지 못하므로 시계는 `step` 이 상태에 쌓는다
   * (NOTES.md 「어휘 부족」 G13).
   *
   * 앞당김(`startAt`)도 없다 — 원본은 t = 0 에서 열고, 출발 시각 어긋남(`TEST.offsets`)이
   * 도착한 순간을 이미 진행 중으로 만든다.
   */

  /**
   * 그리는 순서가 곧 겹침이다 — 지형 → 지형 위 등전위선 → 지형 위 원천 전하 → 지형 위 시험 전하
   * → 지도 → 지도 등전위선 → 자취 → 직각 표시 → 시험 전하 → 원천 전하 (원본 그대로).
   */
  drawOrder: 'scene',

  // 슬롯 하나, 고정 문장. 어느 배치에서도 참이다 — 경로가 장을 따르므로.
  caption: {
    anchor: { screen: 'bottom-left', offset: [12, -6] },
    align: 'left',
    fontSize: 15,
    wrapWidth: 760,
    style: { colorRole: 'ink', emphasis: 'strong' },
    text: key('caption.main'),
  },

  // 그리드 · 카메라 단추 없음(기본값). 주장은 모양(직각)에 있고 잴 것이 거리가 아니다.

  messages: equipotentialSurfaceMessages,
};
