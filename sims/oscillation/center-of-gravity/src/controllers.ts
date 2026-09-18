import type { ControllerSpec } from '@aperi21/schema';

/**
 * 조작기 없음. 자동 진행 한 주기가 갈림의 양쪽(되돌아옴 · 넘어짐)과 그 경계를 다 보인다.
 * 상자 비율 칩을 두면 「넓고 낮으면 잘 안 넘어진다」 라는 안정성 이야기로 넘어가 주장이
 * 둘이 된다 — `NOTES.md` (b).
 */
export const controllers: readonly ControllerSpec[] = [];
