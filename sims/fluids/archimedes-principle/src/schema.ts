// ========================================================================
// archimedes-principle — 선언
// ========================================================================
// 질문: 부력은 왜 하필 밀려난 물의 무게와 같은가.
//
// 이 파일이 담는 것 (원칙 2):
//  - 화면에 뜨는 모든 문자 (`archimedesPrincipleMessages`)
//  - 물리 상수·연출 시간 (`stages[0].constants`)
//  - 임베드 치수 (`canvas`)
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

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
// 2. BundleSchema
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
