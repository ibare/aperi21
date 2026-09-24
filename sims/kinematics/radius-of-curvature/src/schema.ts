// ========================================================================
// radius-of-curvature — 선언
// ========================================================================
// 질문: 굽은 정도를 왜 하필 '반지름' 이라는 길이로 재는가.
//
// 점 하나가 닫힌 길 위를 호길이 등속으로 돈다. 그 자리의 곡률원이 점에 얹혀
// 함께 움직이는데, 반지름이 72 에서 288 까지 4배로 오간다. 가장 오므라들었을
// 때는 원이 통째로 화면에 담기고, 가장 부풀었을 때는 절반이 화면 밖으로 잘린다.
// **잘리는 것은 실패가 아니라 주장이다** — 그림 전체를 담도록 축소하면 크기
// 차이가 통째로 사라진다 (NOTES.md 「엔진이 강제하면 안 되는 것」).
// ========================================================================

import type { BundleSchema, Bounds, LocalizedText } from '@aperi21/schema';

/** 등록 키 `aperi21:radius-of-curvature` 와 문자 그대로 일치한다 (C4). */
export const RADIUS_OF_CURVATURE_ID = 'radius-of-curvature';

// ------------------------------------------------------------------------
// 길 — 곡률 반지름으로 정의한다
// ------------------------------------------------------------------------
//
// 곡선을 먼저 정하고 곡률을 미분해 얻는 방향은 실패한다. 타원은 곡률 반지름
// 비가 (a/b)³ 이라 조금만 길쭉해도 큰 원이 손을 벗어나고, 사인 곡선은 변곡점
// 에서 곡률이 0 이라 반지름이 무한대로 터진다. 그래서 거꾸로 세운다 —
// `R(φ)` 를 입력으로 주면 곡선도 축폐선도 호길이도 따라 나온다
// (`pathFromCurvatureRadius`).
//
//   R(φ) = MEAN_RADIUS − 3·WOBBLE·cos 2φ  →  좌우 끝 72, 위아래 288
//
// 1차 조화가 섞이지 않아 닫히고, 어디서나 R > 0 이라 볼록하다.

/** 평균 곡률 반지름(월드 단위 = 화면 px). 원본의 지지함수 `h = 180 + 36cos2φ` 의 C. */
export const MEAN_RADIUS = 180;
/** 흔들림 폭. R 은 `MEAN_RADIUS ∓ 3·WOBBLE` 사이를 오간다 — 72 ↔ 288, 4배. */
export const WOBBLE = 36;
/** φ 표본 수. 원본도 360 개 점으로 길과 축폐선을 그렸다. */
export const PATH_SAMPLES = 360;
/** 한 바퀴 도는 데 걸리는 시간(초). 둘레 2π·180 = 1131 을 이 시간에 돈다. */
export const PERIOD = 7;
/** 시작 자리 φ — 오른쪽 끝을 막 지난 자리. 도착한 순간 이미 부푸는 중이다. */
export const START_PHI = 0.6;

/**
 * 프레이밍 — **원본의 범위를 그대로 쓴다.**
 *
 * 원본은 캔버스 400px 높이에 배율 1, 월드 원점을 화면 y=180 에 두었다. 그래서
 * 보이는 세로는 월드 y ∈ [−220, 180] 이고 가장 부푼 원(R=288)의 아래쪽이 잘린다.
 *
 * 엔진은 bounds 의 **가운데**를 화면 가운데에 놓고 네 방향 가용 픽셀로 배율을
 * 정한다. 세로 가용은 `400/2 − (여백 24 + padding 12) = 164`. 그래서 midY 를
 * −20 에 두고 상하 span 을 164 로 주면 배율 1 · 원점 화면 y=180 이 그대로 나온다.
 * 가로 span 240 은 원본의 `SC = (W−56)/480` 축소 문턱(W ≈ 536)과 거의 같은 자리다.
 */
export const SCENE_BOUNDS: Bounds = { minX: -240, maxX: 240, minY: -184, maxY: 144 };

/**
 * 세로 400px.
 *
 * 더 줄이면 가장 부푼 원의 중심이 화면 밖으로 나가 반지름 선분이 끊긴다. 이
 * 값은 "가장 부푼 원의 중심이 아슬아슬하게 화면 안에 남는" 값으로 역산한 것이라
 * `minHeight` 도 같이 묶는다 — 마운트 뒤 높이는 바뀌지 않는다 (원칙 6).
 */
export const CANVAS_HEIGHT = 400;

// ------------------------------------------------------------------------
// 문안
// ------------------------------------------------------------------------

export const radiusOfCurvatureMessages = Object.freeze({
  'label.title': { ko: '곡률 반지름', en: 'Radius of curvature' },
  'label.operation': {
    ko: '굽은 정도에 맞는 원이 경로에 얹힌다',
    en: 'A circle matching the bend rides the path',
  },
  'label.stage': { ko: '곡률 반지름', en: 'Radius of curvature' },
  'label.view': { ko: '곡률 반지름', en: 'Radius of curvature' },
  /** dR/dφ > 0 — 원이 커지는 중. */
  'caption.swelling': {
    ko: '길이 펴진다 — 얹힌 원이 부푼다',
    en: 'The path straightens — the riding circle swells',
  },
  /** dR/dφ ≤ 0 — 원이 작아지는 중. */
  'caption.shrinking': {
    ko: '길이 굽는다 — 얹힌 원이 오므라든다',
    en: 'The path bends — the riding circle shrinks',
  },
}) satisfies Record<string, LocalizedText>;

export type RadiusOfCurvatureMessageKey = keyof typeof radiusOfCurvatureMessages;

/**
 * 선언에서 문안을 꺼낸다. 호출부에 문자열 리터럴을 두지 않기 위한 유일한 통로 (C1).
 *
 * **표를 찾아 `{ko, en}` 을 돌려준다.** `{ key: k }` 를 돌려주면 `LocalizedText` 의
 * 인덱스 시그니처 갈래에 걸려 tsc 가 통과시키는데, 러너의 조회기는 `ko` → `en` →
 * 첫 값 순으로 내려가 **문안 대신 키 문자열을 그린다.** 예외도 안 나고 타입도 통과한다.
 */
export const text = (k: RadiusOfCurvatureMessageKey): LocalizedText =>
  radiusOfCurvatureMessages[k];

/** 캡션 글자 크기(화면 px). 원본의 15px. */
const CAPTION_FONT_PX = 15;

export const radiusOfCurvatureSchema: BundleSchema = {
  id: RADIUS_OF_CURVATURE_ID,
  label: text('label.title'),
  category: 'kinematics',
  operation: text('label.operation'),
  timeModel: 'periodic',
  parameters: [],
  stages: [{ id: 'main', label: text('label.stage'), constants: {} }],
  environments: [],
  views: [{ id: 'main', label: text('label.view'), default: true }],
  canvas: { height: CANVAS_HEIGHT, minHeight: CANVAS_HEIGHT },

  /**
   * 캡션은 **위치가 아니라 변화 방향**으로 고른다.
   *
   * 위치로 고르면 "가장 굽은 자리를 막 지나 부푸는 중" 에 '오므라든다' 라고 써서
   * 화면과 어긋난다. `when` 은 state 의 boolean 경로 **이름**이고, 부호 판정
   * (`dR/dφ = 6·WOBBLE·sin 2φ`)은 physics 가 한다 (원칙 2).
   *
   * 단조 구간마다 한 번씩만 갈리므로 깜빡이지 않는다 — 페이드를 두지 않는다.
   */
  caption: {
    anchor: { screen: 'bottom-center' },
    align: 'center',
    fontSize: CAPTION_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
    cases: [{ when: 'swelling', text: 'caption.swelling' }],
    text: 'caption.shrinking',
  },

  messages: radiusOfCurvatureMessages,
};
