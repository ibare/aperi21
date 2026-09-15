import type { Dictionary } from './resolver';

/**
 * 프레임워크 공통 문구의 locale 번들 — 조회 3층 중 **2층** (C1).
 *
 * 1층(저작자 선언)과 3층(호출부 en 원본) 사이에 놓인다. en 은 여기 두지 않는다 —
 * 호출부 리터럴이 그 역할을 하고, 그래야 추출기가 문안을 찾을 수 있다.
 *
 * 키 규약: `ui.<component>.<name>` (세그먼트는 lowerCamelCase).
 *
 * 저작자는 `BundleSchema.messages` 에 같은 키를 써서 이것을 덮어쓸 수 있다.
 */
export const FRAMEWORK_MESSAGES: Dictionary = {
  ko: {
    'ui.paramPanel.title': '파라미터',
    'ui.paramPanel.reset': '초기값',

    'ui.stageTabs.label': '스테이지',
    'ui.envToggles.label': '환경',
    'ui.resetButtons.camera': '카메라',
    'ui.resetButtons.state': '초기화',

    'ui.angleDial.label': '각도',
    'ui.pinballLauncher.label': '발사대 · {power}%',
    'ui.placement.label': '배치',
  },
};
