// ========================================================================
// archimedes-principle — 선언
// ========================================================================
// 질문: 부력은 왜 하필 밀려난 물의 무게와 같은가.
//
// 이 파일이 담는 것 (원칙 2):
//  - 화면에 뜨는 모든 문자 (`archimedesPrincipleMessages`)
//  - 물리 상수·연출 시간 (`stages[0].constants`)
//  - 임베드 치수 (`canvas`)
//  - 표준 8종으로 표현되지 않는 것을 그리기 위한 자유 렌더 계층 프리미티브 선언
// ========================================================================

import type {
  BaseMeta,
  BundleSchema,
  LocalizedText,
  Primitive,
  Vec2,
} from '@aperi21/schema';

/** 등록 키 `aperi21:archimedes-principle` 와 문자 그대로 일치한다 (C4). */
export const ARCHIMEDES_PRINCIPLE_ID = 'archimedes-principle';

// ------------------------------------------------------------------------
// 1. 화면 문안 — 저작자가 정한 1층 (C1)
// ------------------------------------------------------------------------

/**
 * 정의 시점에 `LocalizedText` 적합성을 강제하면서 키 집합은 그대로 보존한다.
 * 코드에는 키만 남고 문안은 이 선언이 유일한 출처다.
 */
function defineMessages<T extends Record<string, LocalizedText>>(m: T): T {
  return m;
}

export const archimedesPrincipleMessages = defineMessages({
  'label.title': {
    ko: '아르키메데스 원리 — 부력의 크기',
    en: 'Archimedes principle — the size of the buoyant force',
  },
  'label.operation': {
    ko: '2.0 kg · 1.0 L 물체를 주둥이까지 가득 찬 물에 천천히 담근다. 밀려난 물이 주둥이로 넘쳐 컵에 모이고, 물체 쪽 저울이 줄어드는 만큼 넘친 물 쪽 저울이 늘어난다.',
    en: 'A 2.0 kg, 1.0 L object is lowered into a can filled to its spout. The displaced water pours into the cup, and the scale holding the water gains exactly what the scale holding the object loses.',
  },
  'label.stage': { ko: '실험대', en: 'lab bench' },
  'label.stageNote': {
    ko: '물 밀도 1000 kg/m³, 중력 가속도 9.8 m/s²',
    en: 'water density 1000 kg/m³, gravity 9.8 m/s²',
  },
  'label.view': { ko: '두 저울', en: 'the two scales' },

  'label.objectScale': { ko: '물체 쪽 저울', en: 'scale holding the object' },
  'label.waterScale': { ko: '넘친 물 쪽 저울', en: 'scale holding the spilled water' },
  'label.buoyancy': { ko: '부력', en: 'buoyant force' },
  'label.brimFull': { ko: '주둥이까지 가득', en: 'full to the spout' },
  'label.claim': {
    ko: '줄어든 무게 = 넘친 물의 무게',
    en: 'weight lost = weight of the water that left',
  },

  'control.submersion': { ko: '잠긴 정도', en: 'how deep' },
} satisfies Record<string, LocalizedText>);

export type ArchimedesMessageKey = keyof typeof archimedesPrincipleMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export function text(key: ArchimedesMessageKey): LocalizedText {
  return archimedesPrincipleMessages[key];
}

/**
 * 뉴턴 단위 표식. C1 판정표 3번(수식·기호·단위 표기)에 따라 번역 대상이 아니다 —
 * 키를 주면 어느 언어에서 `N` 이 다른 글자로 바뀔 여지가 생긴다.
 */
export const FORCE_UNIT: LocalizedText = 'N';

// ------------------------------------------------------------------------
// 2. 자유 렌더 계층 프리미티브 (원칙 4)
// ------------------------------------------------------------------------
// 표준 8종(body·trajectory·vector·surface·marker·graph·event·gauge)으로는
// 이 조각의 동사 — "넘친다", "두 저울이 마주 움직인다" — 가 화면에서 일어나지
// 않는다. 아래 3종은 이 sim 이 직접 그린다. 렌더러는
// `archimedes-principle-stage.ts` 에 있고, 등록은 호스트가 한다 (NOTES.md).

/** 그릇 안에 담긴 물. `level` 이 오르내리고 수면이 일렁인다. */
export interface WaterVolumePrimitive extends BaseMeta {
  type: 'waterVolume';
  /** 물이 갇히는 안쪽 영역 (월드 좌표). */
  bounds: { min: Vec2; max: Vec2 };
  /** 수면 높이 (월드 y). `bounds.min[1]` 이하이면 아무것도 그리지 않는다. */
  level: number;
  /** 수면 일렁임 진폭 (m). 0 이면 평평. */
  ripple?: number;
}

/** 주둥이에서 쏟아져 나오는 물줄기. `flow` 가 0 이면 그리지 않는다. */
export interface WaterStreamPrimitive extends BaseMeta {
  type: 'waterStream';
  /** 주둥이 끝. */
  from: Vec2;
  /** 떨어지는 지점 (받는 물의 수면). */
  to: Vec2;
  /** 0 = 멈춤, 1 = 최대. 굵기와 물방울 속도를 정한다. */
  flow: number;
  /** flow === 1 일 때의 물줄기 굵기 (m). */
  width: number;
}

/**
 * 눈금판 저울. `origin` 에서 `value` 까지 부채꼴이 자란다.
 * 두 저울이 같은 매핑을 쓰므로 부채꼴의 각도 폭이 곧 변화량이고,
 * 그 둘이 매 순간 합동인 것이 이 조각의 주장이다.
 */
export interface DialScalePrimitive extends BaseMeta {
  type: 'dialScale';
  /** 눈금판 중심 (월드). */
  pos: Vec2;
  /** 눈금판 반지름 (m). */
  radius: number;
  /** 지금 가리키는 값. */
  value: number;
  /** 담그기 전에 가리키던 값. 여기서 `value` 까지가 변화 부채꼴. */
  origin: number;
  /** 눈금 범위. 두 저울이 같은 값을 써야 부채꼴이 비교된다. */
  range: readonly [number, number];
  /** 값 옆에 붙는 단위 표식. */
  unit?: LocalizedText;
  /** 눈금판에서 내려가 매달린 것에 닿는 줄. 없으면 줄을 그리지 않는다. */
  tether?: Vec2;
}

export type ArchimedesPrimitive =
  | WaterVolumePrimitive
  | WaterStreamPrimitive
  | DialScalePrimitive;

/** 호스트 렌더러 레지스트리에 등록될 타입 이름들. */
export const ARCHIMEDES_PRIMITIVE_TYPES = [
  'waterVolume',
  'waterStream',
  'dialScale',
] as const;

/**
 * z-레이어 힌트. 물은 물체(40)보다 위에 반투명으로 덮여야 "잠겼다" 로 읽히고,
 * 눈금판은 주석(60) 위에 온다.
 */
export const ARCHIMEDES_Z_HINTS: Record<string, number> = {
  waterVolume: 45,
  waterStream: 46,
  dialScale: 62,
};

/**
 * `SceneGraph` 는 `Primitive` 유니온의 배열이고 그 유니온은 schema 패키지에서
 * 닫혀 있다. 자유 렌더 계층의 프리미티브는 이 경계를 한 곳에서만 넘는다.
 */
export function asPrimitive(p: ArchimedesPrimitive): Primitive {
  return p as unknown as Primitive;
}

// ------------------------------------------------------------------------
// 3. BundleSchema
// ------------------------------------------------------------------------

export const archimedesPrincipleSchema: BundleSchema = {
  id: ARCHIMEDES_PRINCIPLE_ID,
  label: text('label.title'),
  category: 'fluids',
  operation: text('label.operation'),
  timeModel: 'linear',

  // 조각이다. 읽는 사람이 고를 것은 없다.
  parameters: [],

  stages: [
    {
      id: 'bench',
      label: text('label.stage'),
      description: text('label.stageNote'),
      constants: {
        // 물리 — 호스트가 확정한 값.
        g: 9.8,
        rhoWater: 1000,
        objectMass: 2.0,
        objectVolume: 0.001,
        // 연출 시간 — 시작 시점도 저작 결정이다 (원칙 2).
        approachSeconds: 1.2,
        submergeSeconds: 4.6,
      },
    },
  ],

  environments: [],

  views: [{ id: 'balance', label: text('label.view'), default: true }],

  autoViews: { energy: false },

  // 마운트 후 바뀌지 않는다 (원칙 6).
  canvas: { height: 460, minHeight: 460 },

  messages: archimedesPrincipleMessages,
};
