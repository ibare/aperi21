// ========================================================================
// pv-diagram — 선언
// ========================================================================
// 질문: 같은 처음(A)과 끝(B) 사이를 가는데, 기체가 한 일은 길마다 같은가.
//
// P-V 그림에서 A → B 를 두 길로 간다. 먼저 부피를 늘리고 압력을 낮추는 길(a)과
// 먼저 압력을 낮추고 부피를 늘리는 길(b). 지나온 길 아래가 칠해지고, 옆 실린더에서는
// 받침 위 추가 올라간다. 압력은 받침에 얹힌 추의 개수라서, 칠해진 넓이의 띠 수와
// 올라간 추의 수가 같다 — a 는 3, b 는 1. 동사: (넓이가) 다르게 칠해진다.
// ========================================================================

import type { BundleSchema, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:pv-diagram` 와 문자 그대로 일치한다 (C4). */
export const PV_DIAGRAM_ID = 'pv-diagram';

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const pvDiagramMessages = Object.freeze({
  'label.title': { ko: 'PV 그림', en: 'PV diagram' },
  'label.stage': { ko: '추를 얹은 기체', en: 'Gas under weights' },
  'label.view': { ko: 'P-V 그림과 실린더', en: 'P-V diagram and cylinder' },

  'label.heat': { ko: '가열', en: 'Heating' },
  'label.cool': { ko: '식힘', en: 'Cooling' },

  'caption.a.intro': {
    ko: '상태 A — 피스톤 받침에 추 {na}개',
    en: 'State A — {na} weights on the piston',
  },
  'caption.a.expand': {
    ko: '추 {na}개를 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다',
    en: 'Heating with all {na} weights on — the volume grows and the area under the path fills',
  },
  'caption.drop': {
    ko: '부피를 그대로 두고 식히며 추를 하나씩 선반에 내린다 — 칠해지는 넓이가 없다',
    en: 'Volume held, cooling and sliding weights off one at a time — no area fills',
  },
  'caption.a.result': {
    ko: 'B 에 닿았다 — 추 {na}개가 모두 올라갔고, 칠해진 넓이는 {na}띠',
    en: 'At B — all {na} weights were raised, and {na} bands are shaded',
  },
  'caption.b.intro': {
    ko: '다시 상태 A, 추 {na}개 — 점선은 앞의 길과 넓이',
    en: 'Back at state A with {na} weights — dashed: the previous path and area',
  },
  'caption.b.expand': {
    ko: '추 {nb}개만 얹은 채 데워 부피를 늘린다 — 지나온 길 아래가 칠해진다',
    en: 'Heating with only {nb} left on — the volume grows and the area under the path fills',
  },
  'caption.b.result': {
    ko: '같은 B 에 닿았다 — 이번에는 추 {nb}개가 올라갔고 넓이는 {nb}띠, 앞의 길은 {na}띠',
    en: 'The same B — weights raised this time: {nb}, bands shaded: {nb} (the other path: {na})',
  },
} satisfies Record<string, LocalizedText>);

export type PvDiagramMessageKey = keyof typeof pvDiagramMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: PvDiagramMessageKey): LocalizedText => pvDiagramMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: PvDiagramMessageKey): string {
  return k;
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const pvDiagramSchema: BundleSchema = {
  id: PV_DIAGRAM_ID,
  title: text('label.title'),
  category: 'thermal',
  timeModel: 'periodic',
  parameters: [],

  /**
   * 두 상태 — 모두 선언이다.
   *
   * - `blocksA` 상태 A 의 추 개수 · `blocksB` 상태 B 의 추 개수. 피스톤 위가 진공이고
   *   피스톤 · 받침의 무게를 치지 않으므로 **압력 = 추 개수 × 추 하나의 압력** 이다.
   *   P 축의 단위가 추 하나다.
   * - `v1` 상태 A 의 부피 · `v2` 상태 B 의 부피 (L).
   *
   * 추를 하나 내릴 때마다 단계가 하나다 — 시간표의 `a-drop*` · `b-drop*` 수가
   * `blocksA − blocksB` 와 같아야 한다 (장부 G13).
   */
  stages: [
    {
      id: 'weights',
      label: text('label.stage'),
      constants: {
        blocksA: 3,
        blocksB: 1,
        v1: 1,
        v2: 3,
      },
    },
  ],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],

  canvas: { height: 380, minHeight: 340 },

  /** 쓴 순서대로 — 넓이가 축 · 길 아래에, 실린더 벽이 피스톤 위에, 옮겨 가는 추가 맨 위에 온다. */
  drawOrder: 'scene',

  /**
   * 두 길을 차례로. 길의 모양은 **단계의 순서** 가 정한다 — a 는 늘림 다음 내림,
   * b 는 내림 다음 늘림. scene 은 단계가 시작하는 시각 순서대로 다리를 잇는다.
   */
  timeline: {
    phases: [
      { id: 'a-in', duration: 0.4, caption: key('caption.a.intro') },
      { id: 'a-show', duration: 1.2, caption: key('caption.a.intro') },
      { id: 'a-expand', duration: 2.6, ease: 'smooth', caption: key('caption.a.expand') },
      { id: 'a-drop1', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'a-drop2', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'a-hold', duration: 2.8, caption: key('caption.a.result') },
      { id: 'a-out', duration: 0.5, caption: key('caption.a.result') },
      { id: 'b-in', duration: 0.4, caption: key('caption.b.intro') },
      { id: 'b-show', duration: 1.4, caption: key('caption.b.intro') },
      { id: 'b-drop1', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'b-drop2', duration: 1.0, ease: 'smooth', caption: key('caption.drop') },
      { id: 'b-expand', duration: 2.6, ease: 'smooth', caption: key('caption.b.expand') },
      { id: 'b-hold', duration: 3.4, caption: key('caption.b.result') },
      { id: 'b-out', duration: 0.5, caption: key('caption.b.result') },
    ],
  },

  /** 도착한 순간 이미 추 세 개가 올라가는 중이다. */
  startAt: 2.2,

  caption: {
    anchor: { screen: 'bottom-left', offset: [16, -12] },
    align: 'left',
    fontSize: 14,
    wrapWidth: 640,
    style: { colorRole: 'ink', emphasis: 'strong' },
    vars: {
      na: 'nAText',
      nb: 'nBText',
    },
  },

  messages: pvDiagramMessages,
};
