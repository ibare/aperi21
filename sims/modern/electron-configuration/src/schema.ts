// ========================================================================
// electron-configuration — 선언
// ========================================================================
// 질문: 주기율표는 왜 그런 모양인가 — 왜 줄 길이가 2 · 8 · 8 · 18 이고, 가운데가 비어 있다가
// 넷째 줄에서야 채워지는가.
//
// 원자 번호를 하나 올릴 때마다 전자가 하나 는다. 전자는 쌓음 원리의 순서
// (1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p)로 부껍질을 채우고, 원소를 그 순서대로 늘어놓되
// **바깥 껍질이 닫힐 때마다 줄을 바꾸면** 주기율표가 나온다. 같은 부껍질에 전자가 든 원소가
// 세로로 모여 s · d · p 블록이 되고, 3d 가 4s 뒤에 차서 d 블록이 넷째 줄에 끼어든다.
//
// 이웃과 겹치지 않는 자리 — `pauli-exclusion` 은 준위마다 ↑ · ↓ 두 자리에 전자가 앉는 것,
// `atomic-orbital` 은 궤도 하나의 모양이다. 이 조각은 준위 · 상자 그림을 되풀이하지 않고
// **원소 칸이 차례로 켜지는 표** 하나로 말한다 (NOTES (b)).
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { BundleSchema, LocalizedText, TimelinePhase } from '@aperi21/schema';

/** 등록 키 `aperi21:electron-configuration` 와 문자 그대로 일치한다 (C4). */
export const ELECTRON_CONFIGURATION_ID = 'electron-configuration';

// ------------------------------------------------------------------------
// 스테이지 상수의 기본값 — 저작자가 스테이지에서 바꾼다 (원칙 2).
// ------------------------------------------------------------------------

/**
 * 보일 원소 수(원자 번호 1 부터). 1 ~ 36 — 기호 표가 크립톤(36)까지다 (physics `SYMBOLS`).
 * 줄이면 그 번호 뒤 칸은 켜지지 않는다. 시간표 단계는 따라 줄지 않는다 (NOTES (c) G13).
 */
export const ELEMENT_COUNT = 36;

// ------------------------------------------------------------------------
// 배치 — 월드 단위. 1 족 · 1 주기 칸의 가운데가 원점, 족마다 1, 주기마다 `ROW_PITCH` 아래.
// ------------------------------------------------------------------------

/** 줄 사이 간격(월드). 칸 아래에 부껍질 괄호 · 이름표 자리가 있다. */
export const ROW_PITCH = 1.65;
/** 원소 칸의 한 변(월드). 족 간격 1 보다 조금 작아 칸 사이가 떨어져 보인다. */
export const TILE = 0.9;
/** 칸 아래 부껍질 괄호가 칸 밑변에서 떨어진 거리 · 끝 꺾쇠 높이(월드). */
export const BRACKET = { gap: 0.22, tick: 0.14 } as const;
/** 주기 번호 열의 가로 자리(월드). */
export const PERIOD_X = -1.25;
/** 블록 이름 괄호가 첫 줄 칸 윗변에서 뜨는 높이(월드). */
export const BLOCK_RISE = 0.35;

/** 프레이밍 — 주기 번호 열부터 18 족까지, 위 블록 이름 · 아래 캡션 띠(장부 G24)를 더했다. */
export const SCENE_BOUNDS = { minX: -2.1, maxX: 18.1, minY: -6.7, maxY: 1.75 } as const;

// ------------------------------------------------------------------------
// 시간표 — 전자 하나가 드는 데 걸리는 시간(초). 자리 하나가 단계 하나다.
// ------------------------------------------------------------------------

/** s 부껍질 — 두 자리뿐이라 한 칸씩 천천히. */
export const SEAT_S = 0.8;
/** p 부껍질 여섯 자리. */
export const SEAT_P = 0.55;
/** d 부껍질 열 자리. */
export const SEAT_D = 0.5;
/** 껍질이 닫힌 뒤 줄이 끝난 것을 읽을 틈. */
export const CLOSE = 1.8;
/** 블록 이름이 떠오르는 동안 · 다 켜진 표에 머무는 동안 · 비우는 동안. */
export const BLOCKS = 1.2;
export const HOLD = 3.8;
export const FADE = 1;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const electronConfigurationMessages = Object.freeze({
  'label.title': { ko: '전자 배치', en: 'Electron configuration' },
  'label.operation': { ko: '주기율표가 나오는 방식', en: 'How the periodic table arises' },
  'label.stage': { ko: '수소에서 크립톤까지', en: 'Hydrogen to krypton' },
  'label.view': { ko: '채우는 순서대로 놓은 원소', en: 'Elements in filling order' },
  /** 줄 번호 열의 머리. */
  'label.period': { ko: '주기', en: 'Period' },
  /** 표 위 블록 이름. `s` · `d` · `p` 는 표식이지만 「블록」 이 붙어 문안이다 (C1). */
  'label.blockS': { ko: 's 블록', en: 's-block' },
  'label.blockD': { ko: 'd 블록', en: 'd-block' },
  'label.blockP': { ko: 'p 블록', en: 'p-block' },

  'caption.fill1s': {
    ko: '원자 번호가 하나 오를 때마다 전자가 하나 는다 — 첫 두 전자는 1s 에 든다',
    en: 'Each step up in atomic number adds one electron — the first two go into 1s',
  },
  'caption.close1': {
    ko: '1s 가 두 자리로 찼다 — 첫 껍질이 닫혀 첫 주기가 여기서 끝난다',
    en: '1s is full with two — the first shell is closed and the first period ends here',
  },
  'caption.fill2s': {
    ko: '다음 전자는 새 껍질의 2s 에 든다 — 새 줄의 맨 앞 칸이다',
    en: 'The next electron goes into 2s of a new shell — the first cell of a new row',
  },
  'caption.fill2p': {
    ko: '2p 는 여섯 자리 — 줄의 오른쪽 여섯 칸이 차례로 켜진다',
    en: '2p has six places — the six cells at the right of the row light up in turn',
  },
  'caption.close2': {
    ko: '2s · 2p 여덟 자리가 찼다 — 둘째 껍질이 닫혀 둘째 주기가 끝난다',
    en: 'All eight places of 2s and 2p are full — the second shell closes and the second period ends',
  },
  'caption.fill3': {
    ko: '셋째 줄도 같은 모양 — 3s 두 칸, 그리고 3p 여섯 칸',
    en: 'The third row has the same shape — two cells of 3s, then six of 3p',
  },
  'caption.close3': {
    ko: '3p 까지 찼다 — 셋째 주기가 끝난다. 가운데는 아직 비어 있다',
    en: 'Filled through 3p — the third period ends. The middle is still empty',
  },
  'caption.fill4s': {
    ko: '3d 보다 4s 가 먼저 찬다 — 넷째 줄 맨 앞 칸이 켜진다',
    en: '4s fills before 3d — the first cells of the fourth row light up',
  },
  'caption.fill3d': {
    ko: '4s 다음에야 3d 열 자리가 찬다 — 넷째 줄 가운데에 열 칸이 끼어든다',
    en: 'Only after 4s do the ten places of 3d fill — ten cells wedge into the middle of the fourth row',
  },
  'caption.fill4p': {
    ko: '이어서 4p 여섯 자리가 줄의 끝을 채운다',
    en: 'Then the six places of 4p fill the end of the row',
  },
  'caption.close4': {
    ko: '4p 까지 찼다 — 넷째 주기가 끝난다',
    en: 'Filled through 4p — the fourth period ends',
  },
  'caption.blocks': {
    ko: '채우는 순서대로 늘어놓고 껍질이 닫힐 때마다 줄을 바꾸면 주기율표 — 같은 부껍질이 세로로 모여 블록이 된다',
    en: 'Lay the elements out in filling order and start a new row whenever a shell closes: the periodic table — the same subshell stacks into a block',
  },
} satisfies Record<string, LocalizedText>);

export type ElectronConfigurationMessageKey = keyof typeof electronConfigurationMessages;

/** 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로. */
export const text = (key: ElectronConfigurationMessageKey): LocalizedText => electronConfigurationMessages[key];

/** 시간표 · 캡션 슬롯이 부르는 문안 키. 없는 키를 쓰면 여기서 타입이 막는다. */
function key(k: ElectronConfigurationMessageKey): string {
  return k;
}

/**
 * 부껍질 하나를 채우는 단계들 — 자리마다 단계 하나, id 는 `fill-<부껍질>-<k>`(k 는 0 부터).
 * physics 가 이 이름으로 부른다. 캡션은 부껍질마다 하나라 이웃 단계끼리 같은 키 — 다시 페이드하지 않는다.
 */
function fill(subshell: string, seats: number, seat: number, caption: ElectronConfigurationMessageKey): TimelinePhase[] {
  return Array.from({ length: seats }, (_, k) => ({
    id: `fill-${subshell}-${k}`,
    duration: seat,
    caption: key(caption),
  }));
}

// ------------------------------------------------------------------------
// BundleSchema
// ------------------------------------------------------------------------

export const electronConfigurationSchema: BundleSchema = {
  id: ELECTRON_CONFIGURATION_ID,
  label: text('label.title'),
  category: 'modern',
  operation: text('label.operation'),
  timeModel: 'periodic',

  // 조작기가 없다 — 한 주기 안에 표가 다 나온다.
  parameters: [],

  stages: [
    {
      id: 'default',
      label: text('label.stage'),
      constants: { elementCount: ELEMENT_COUNT },
    },
  ],

  environments: [],

  views: [{ id: 'main', label: text('label.view'), default: true }],

  /** 가로로 넓다 — 18 족이 옆으로 놓인다. 세로는 넷째 줄과 캡션 줄. */
  canvas: { height: 380, minHeight: 340 },

  /** 겹침은 scene 에 쓴 순서 — 칸 위에 기호, 맨 위에 커서. */
  drawOrder: 'scene',

  /**
   * 한 주기 = 부껍질을 쌓음 원리 순서로 한 자리씩 채움(`fill-<부껍질>-<k>`, 전자 하나가 단계 하나)
   * · 껍질이 닫힐 때마다 읽을 틈(`close-*`) → 블록 이름 → 다 켜진 표에 머묾 → 비움.
   * 단계 수가 `elementCount` 를 따라가지 않는다 (NOTES (c) G13).
   */
  timeline: {
    phases: [
      ...fill('1s', 2, SEAT_S, 'caption.fill1s'),
      { id: 'close-1', duration: CLOSE, caption: key('caption.close1') },
      ...fill('2s', 2, SEAT_S, 'caption.fill2s'),
      ...fill('2p', 6, SEAT_P, 'caption.fill2p'),
      { id: 'close-2', duration: CLOSE, caption: key('caption.close2') },
      ...fill('3s', 2, SEAT_S, 'caption.fill3'),
      ...fill('3p', 6, SEAT_P, 'caption.fill3'),
      { id: 'close-3', duration: CLOSE, caption: key('caption.close3') },
      ...fill('4s', 2, SEAT_S, 'caption.fill4s'),
      ...fill('3d', 10, SEAT_D, 'caption.fill3d'),
      ...fill('4p', 6, SEAT_P, 'caption.fill4p'),
      { id: 'close-4', duration: CLOSE, caption: key('caption.close4') },
      { id: 'blocks', duration: BLOCKS, ease: 'smooth', caption: key('caption.blocks') },
      { id: 'hold', duration: HOLD, caption: key('caption.blocks') },
      { id: 'fade', duration: FADE, caption: key('caption.blocks') },
    ],
  },

  /** 도착한 순간 첫 줄은 닫혀 있고, 둘째 줄의 2p 가 차오르는 중이다. */
  startAt: 5.6,

  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다 — 쌓음 원리의 정의는 문단의 몫이다.
  caption: {
    anchor: { screen: 'bottom-center', offset: [0, -4] },
    fontSize: 13,
    wrapWidth: 720,
    style: { colorRole: 'muted', emphasis: 'strong' },
  },

  messages: electronConfigurationMessages,
};
