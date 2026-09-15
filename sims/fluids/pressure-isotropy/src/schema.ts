import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/**
 * 등록 키 `aperi21:pressure-isotropy` 와 문자 그대로 일치한다 (C4).
 */
export const PRESSURE_ISOTROPY_ID = 'pressure-isotropy';

/**
 * 화면에 그려지는 모든 문자. 코드가 아니라 **선언**에 있다 (C1 · 원칙 2).
 *
 * C1 「표식이냐 문안이냐」 판정:
 * - `conditions` · `depth` · `pressure` · `areaAndForce` · `forceSymbol`
 *   은 수식·기호·단위 표기라 **표식**이다. 번역하면 오히려 화면과 어긋난다.
 * - `water` · `claim` · `trailDone` 은 어순이 언어마다 달라지는 **문안**이라
 *   `{ ko, en }` 을 둔다.
 */
export const pressureIsotropyText = {
  /** 유체 조건. 호스트가 확정한 값. */
  conditions: 'ρ = 1000 kg/m³   g = 9.8 m/s²',
  /** 판이 놓인 깊이. */
  depth: 'h = 0.20 m',
  /** 그 깊이의 계기압. */
  pressure: 'P = ρgh = 1960 Pa',
  /** 판의 면적과 판이 받는 힘의 크기. */
  areaAndForce: 'A = 1 cm²   |F| = P·A = 0.196 N',
  /** 힘 화살표에 새겨진 글자. */
  forceSymbol: 'F',
  water: { ko: '물', en: 'water' },
  claim: {
    ko: '판을 어느 쪽으로 돌려도 화살표 길이는 그대로다',
    en: 'turn the plate any way — the arrow length does not change',
  },
  trailDone: {
    ko: '화살표 꼬리가 그린 자취는 원이다',
    en: 'the arrow tails have traced a circle',
  },
} satisfies Record<string, LocalizedText>;

/**
 * 압력의 등방성 — 조각 하나.
 *
 * 질문: 압력은 힘에서 나오는데 왜 방향이 없는가.
 * 동사: 돌린다. 유체 속 한 점에 놓인 판의 각도가 바뀌어도 판이 받는 힘의
 *       크기가 변하지 않는다.
 *
 * 파라미터가 없다. 이 조각은 주장 하나만 하고, 그 주장에 필요한 값(ρ · g · h ·
 * A)은 전부 stage 상수로 고정돼 있다. 깊이를 바꿔 보는 것은 다른 주장이다.
 */
export const pressureIsotropySchema: BundleSchema = {
  id: PRESSURE_ISOTROPY_ID,
  label: { ko: '압력의 등방성', en: 'Pressure isotropy' },
  category: 'fluids',
  operation: {
    ko: '판이 저절로 반 바퀴 돌아 자취를 원으로 닫고, 그다음 독자가 다이얼로 직접 돌린다',
    en: 'the plate turns half a revolution to close the trail into a circle, then the reader turns it by hand',
  },
  // 판을 천천히 돌려 각 방향을 차례로 들르는 준정적 과정이다. 관성도 흐름도 없다.
  timeModel: 'quasistatic',
  parameters: [],
  stages: [
    {
      id: 'water',
      label: { ko: '물속', en: 'In water' },
      description: {
        ko: '수면에서 0.20 m 아래, 물이 정지해 있는 한 점',
        en: 'a point 0.20 m below the surface of still water',
      },
      // 화면에 쓰는 값은 전부 여기에서 온다. physics 는 이 상수만 읽는다.
      constants: { rho: 1000, g: 9.8, depth: 0.2, area: 0.0001 },
    },
  ],
  environments: [],
  views: [
    {
      id: 'plate',
      label: { ko: '판', en: 'Plate' },
      default: true,
    },
  ],
  // 에너지 오버레이는 이 조각과 무관하다.
  // 글 한복판에 박히는 그림이라 마운트 후 높이가 바뀌지 않는다 (원칙 6).
  // 호스트 카메라는 세로 가용 픽셀이 (height/2 - 84) 로 제한되므로, 자취 원과
  // 깊이 눈금이 함께 읽히려면 기본값 360 보다 자리가 조금 더 필요하다.
  canvas: { height: 440, minHeight: 400 },
};
