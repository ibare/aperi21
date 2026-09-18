// ========================================================================
// pn-junction — 선언
// ========================================================================
// 질문: p형과 n형 반도체를 붙이면 경계에서 무슨 일이 일어나고, 왜 전류가 한쪽으로만
// 흐르는가?
//
// 답: 붙이는 순간 경계 가까이의 전자(n쪽)와 양공(p쪽)이 건너가 만나 함께 사라진다.
// 그 자리에는 움직이지 못하는 이온(p쪽 −, n쪽 +)만 남아 **운반자 없는 공핍층**이 되고,
// 드러난 이온 전하가 n쪽에서 p쪽으로 향하는 전기장을 만들어 더 건너오지 못하게 막는다.
// p쪽에 +를 걸면(순방향) 운반자가 경계 쪽으로 밀려 공핍층이 얇아지고 전자와 양공이 경계를
// 건너 계속 흐른다. 반대로 걸면(역방향) 운반자가 양 끝으로 끌려가 공핍층이 넓어지고
// 아무것도 건너지 못한다.
//
// 화면에서는 가로 막대 하나(왼쪽 p형 · 오른쪽 n형)가 두 조각에서 붙고, 공핍층이 생기고,
// 순방향에서 얇아져 흐르고, 역방향에서 넓어져 멈춘다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pn-junction` 와 문자 그대로 일치한다 (C4). */
export const PN_JUNCTION_ID = 'pn-junction';

// ------------------------------------------------------------------------
// 물리 — 스테이지 상수의 기본값이다. 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/** 실리콘 pn 접합의 내부 전위차(V). 공핍층 폭이 `√(내부 전위차 − 건 전압)` 을 따른다. */
export const BUILT_IN_VOLTAGE = 0.7;
/** 순방향으로 건 전압(V). 화면에 `0.5 V` 로 뜬다. 내부 전위차보다 작아야 한다. */
export const FORWARD_VOLTAGE = 0.5;
/** 역방향으로 건 전압의 크기(V). 화면에 `2 V` 로 뜬다. */
export const REVERSE_VOLTAGE = 2;
/**
 * 전압을 걸지 않았을 때 공핍층의 반폭 — 이온 열 수로 센다. 붙인 뒤 경계에서 만나 사라지는
 * 전자 · 양공이 이 열 수만큼이다. 건 전압에 따른 폭은 여기서 `√` 비로 나온다 (NOTES b).
 */
export const ZERO_BIAS_COLS = 2;
/**
 * 순방향에서 운반자가 흐르는 화면 속력(월드/초). 실제 표류 속도를 보이게 한 **표현값**이다 —
 * 「흐른다 · 안 흐른다」 와 방향만 가른다. 화면에 알리지 않는다 (NOTES b).
 */
export const FLOW_SPEED = 0.8;
/** 운반자의 열 흔들림 — 진폭(월드) · 진동수(Hz). 운반자가 자유롭게 움직이는 알갱이로 읽히게 한다. */
export const JITTER = 0.06;
export const JITTER_HZ = 0.9;
/** 흔들림 위상을 뽑는 시드. 같은 시각은 언제나 같은 화면이다 (S-sim). */
export const SEED = 21;

// ------------------------------------------------------------------------
// 배치 — 월드 1 단위. 막대 가운데(x = 0)가 접합면이다.
// ------------------------------------------------------------------------

/** 한쪽 조각의 이온 열 수 · 열 간격(월드). 막대 반길이 = 열 수 × 간격. */
export const COLS_PER_SIDE = 10;
export const SPACING = 0.5;
/** 이온 · 운반자의 줄 수와 줄 간격(월드). 가운데 줄이 y = 0. */
export const ROWS = 3;
export const ROW_GAP = 0.55;
/** 막대 반높이(월드). */
export const BAR_HALF_H = 0.95;
/** 붙이기 전 두 조각 사이 틈(월드). */
export const APART_GAP = 1.2;
/** 전극 판의 너비(월드). 막대 양 끝에 붙는다. */
export const PLATE_W = 0.22;

/**
 * 프레이밍 — 가운데 막대, 위에 전기장 · 전압 이름, 아래에 공핍층 치수선과 캡션.
 * 매 프레임 같은 값이다 (S-piece — 프레이밍은 주장의 일부다). 역방향의 가장 넓은 공핍층과
 * 붙이기 전 벌어진 두 조각이 모두 들어가게 잡았다.
 */
export const SCENE_BOUNDS = { minX: -6.25, maxX: 6.25, minY: -2.65, maxY: 2.15 } as const;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pnJunctionMessages = Object.freeze({
  'label.title': { ko: 'pn 접합', en: 'p–n junction' },
  'label.operation': { ko: '공핍층과 정류', en: 'Depletion layer and rectification' },
  'label.stage': { ko: '실리콘 pn 접합', en: 'Silicon p–n junction' },
  'label.view': { ko: '접합 단면', en: 'Junction cross-section' },

  /** 조각 이름. */
  'label.pType': { ko: 'p형', en: 'p-type' },
  'label.nType': { ko: 'n형', en: 'n-type' },
  'label.depletion': { ko: '공핍층', en: 'depletion layer' },
  /** 건 전압. 값은 스테이지 상수, 단위는 표식이다 (C1 판정 3). */
  'label.forward': { ko: '순방향 {v} V', en: 'forward bias {v} V' },
  'label.reverse': { ko: '역방향 {v} V', en: 'reverse bias {v} V' },
  /** 전기장 · 전극 극성 기호. 표식이라 번역 대상이 아니다 (C1 판정 3). */
  'label.field': { ko: 'E', en: 'E' },
  'label.plus': { ko: '+', en: '+' },
  'label.minus': { ko: '−', en: '−' },

  'caption.apart': {
    ko: 'p형에는 양공(○)이 고정된 음이온(−) 곁에, n형에는 전자(●)가 고정된 양이온(+) 곁에 퍼져 있다. 두 조각을 붙인다.',
    en: 'In p-type, holes (○) sit beside fixed negative ions (−); in n-type, electrons (●) sit beside fixed positive ions (+). The two pieces are joined.',
  },
  'caption.meet': {
    ko: '경계 가까이의 전자와 양공이 건너가 만나 함께 사라진다.',
    en: 'Near the boundary, electrons and holes cross over, meet and vanish together.',
  },
  'caption.depleted': {
    ko: '운반자가 사라진 자리(공핍층)에는 이온만 남고, 드러난 이온이 n쪽에서 p쪽으로 전기장을 만들어 더 건너오지 못하게 막는다.',
    en: 'Where the carriers vanished (the depletion layer) only ions remain, and their exposed charge sets up a field from n to p that stops any more from crossing.',
  },
  'caption.forward': {
    ko: '순방향 — p쪽에 +, n쪽에 −를 걸면 공핍층이 얇아지고 전자와 양공이 경계를 건너 계속 흐른다.',
    en: 'Forward bias — with + on the p side and − on the n side, the depletion layer thins and electrons and holes keep crossing the boundary.',
  },
  'caption.off': {
    ko: '전압을 끄면 공핍층이 처음 폭으로 돌아온다.',
    en: 'Switch the voltage off and the depletion layer returns to its original width.',
  },
  'caption.reverse': {
    ko: '역방향 — 반대로 걸면 전자와 양공이 양 끝으로 끌려가 공핍층이 넓어지고, 아무것도 경계를 건너지 못한다.',
    en: 'Reverse bias — flip the voltage and electrons and holes are pulled to the ends; the depletion layer widens and nothing crosses.',
  },
} satisfies Record<string, LocalizedText>);

export type PnJunctionMessageKey = keyof typeof pnJunctionMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PnJunctionMessageKey): LocalizedText => pnJunctionMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PnJunctionMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pnJunctionSchema: BundleSchema = {
  id: PN_JUNCTION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [
    {
      id: 'silicon',
      label: text('label.stage'),
      constants: {
        builtInVoltage: BUILT_IN_VOLTAGE,
        forwardVoltage: FORWARD_VOLTAGE,
        reverseVoltage: REVERSE_VOLTAGE,
        zeroBiasCols: ZERO_BIAS_COLS,
        flowSpeed: FLOW_SPEED,
        jitter: JITTER,
        jitterHz: JITTER_HZ,
        seed: SEED,
      },
    },
  ],
  environments: [],
  views: [{ id: 'cross-section', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 막대 하나. 세로는 막대 · 위아래 이름표 · 캡션이 정한다. */
  canvas: { height: 320, minHeight: 300 },

  /**
   * 쓴 순서대로 겹친다 — 막대 · 공핍층 · 이온 · 운반자 · 만남 고리 · 화살표 · 이름표.
   * 공핍층 칠 위로 이온이, 이온 위로 운반자가 지나가야 한다.
   */
  drawOrder: 'scene',

  /** 도착한 순간 이미 두 조각의 운반자가 흔들리고 있다 (S-piece). */
  startAt: 0.8,

  /**
   * 한 주기 16.2 초. 단계의 길이 · 이징이 곧 연출이라 모두 여기 둔다 (S-piece · 원칙 2).
   *
   * - `appear` · `apart` — 떨어진 두 조각. p형에 양공, n형에 전자가 이온 곁에서 흔들린다.
   * - `join` — 두 조각이 붙는다.
   * - `diffuse` · `recombine` — 경계 가까이(`zeroBiasCols` 열)의 전자와 양공이 접합면으로 건너가 만나고,
   *   고리를 남기며 함께 사라진다. 그 자리의 이온이 드러난다.
   * - `fieldIn` · `depleted` — 공핍층 칠 · 치수선과 내부 전기장 `E` 가 나타난다. 아무것도 건너지 않는다.
   * - `fwdIn` · `fwd` · `fwdOut` — 순방향 전압이 걸려 운반자가 경계 쪽으로 밀리고 공핍층이 얇아진 뒤,
   *   전자와 양공이 경계를 건너 흐른다. 전압을 끄면 제 폭으로 돌아온다.
   * - `revIn` · `rev` — 역방향 전압이 걸려 운반자가 양 끝으로 끌려가고 공핍층이 넓어진다. 멈춰 있다.
   * - `fade` — 옅어지며 다음 주기로 잇는다.
   */
  timeline: {
    phases: [
      { id: 'appear', duration: 0.5, caption: key('caption.apart') },
      { id: 'apart', duration: 1.6, caption: key('caption.apart') },
      { id: 'join', duration: 0.9, ease: 'smooth', caption: key('caption.apart') },
      { id: 'diffuse', duration: 1.3, ease: 'smooth', caption: key('caption.meet') },
      { id: 'recombine', duration: 0.6, caption: key('caption.meet') },
      { id: 'fieldIn', duration: 0.7, ease: 'smooth', caption: key('caption.depleted') },
      { id: 'depleted', duration: 1.6, caption: key('caption.depleted') },
      { id: 'fwdIn', duration: 1.0, ease: 'smooth', caption: key('caption.forward') },
      { id: 'fwd', duration: 3.0, caption: key('caption.forward') },
      { id: 'fwdOut', duration: 1.0, ease: 'smooth', caption: key('caption.off') },
      { id: 'revIn', duration: 1.0, ease: 'smooth', caption: key('caption.reverse') },
      { id: 'rev', duration: 2.4, caption: key('caption.reverse') },
      { id: 'fade', duration: 0.6, caption: key('caption.reverse') },
    ],
  },

  /** 슬롯 하나. 단계마다 지금 화면에서 벌어지는 일만 말한다. */
  caption: {
    anchor: { screen: 'bottom-left', offset: [18, -4] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 820,
    style: { colorRole: 'ink', emphasis: 'strong' },
  },

  // 그리드 · 카메라 단추 · 제목 · 범례 없음(기본). 잴 거리가 없다 (S-piece).

  messages: pnJunctionMessages,
};
