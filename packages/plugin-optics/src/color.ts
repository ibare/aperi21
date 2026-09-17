/**
 * 빛의 색 — 파장 · 스펙트럼을 **선형광 RGB** 로 옮기는 순수 계산.
 *
 * 빛의 색은 테마 색 역할이 아니라 물리량이다(사용자 결정, 「빛 색」 트랙). 조각은 여기서 얻은
 * 세 성분을 host 의 빛 채널(`light: { rgb }` · `scalarField` 의 `colors: 'lightRgb'`)에 넘기고,
 * 화면값으로 옮기는 일은 렌더러가 한다. 성분은 **가득 찬 흰빛 = 1** 을 기준으로 한다.
 *
 * 여기 있는 수치(색맞춤 함수 계수 · XYZ→sRGB 행렬 · sRGB 전달 곡선)는 색 공간 변환의 수학 상수다 (C2 예외).
 */

/** 선형광 RGB 세 성분. 가득 찬 흰빛이 [1, 1, 1]. */
export type LinearRgb = readonly [number, number, number];

/** 가시광 파장 범위(nm). */
export const VISIBLE_NM = { min: 380, max: 780 } as const;

const srgbToLinear = (v: number): number =>
  v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

/** 선형광 한 성분을 화면값 0~1 로. 0~1 밖은 자른다. */
export function linearToSrgb(v: number): number {
  const c = Math.max(0, Math.min(1, v));
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * 단색광 한 파장의 색. 단색광은 sRGB 색역 밖이라 **색상을 옮기는 구간 근사**(Bruton)다 —
 * 밝기는 담지 않는다(가시광 양 끝도 1). 눈의 감도로 어둡게 할지는 조각이 세기로 곱한다.
 * 380~780 nm 밖은 검정.
 */
export function wavelengthToLinearRgb(nm: number): LinearRgb {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    b = 1;
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440);
    b = 1;
  } else if (nm >= 490 && nm < 510) {
    g = 1;
    b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1;
  } else if (nm >= 580 && nm < 645) {
    r = 1;
    g = -(nm - 645) / (645 - 580);
  } else if (nm >= 645 && nm <= 780) {
    r = 1;
  }
  return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
}

// ---- CIE 1931 색맞춤 함수 (Wyman · Sloan · Shirley 2013 다중 가우스 근사) ----

const lobe = (x: number, mu: number, s1: number, s2: number): number => {
  const t = (x - mu) / (x < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};
const xBar = (l: number): number =>
  1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2);
const yBar = (l: number): number => 0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1);
const zBar = (l: number): number => 1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8);

/** 적분 간격(nm). */
const STEP_NM = 5;
const SAMPLES: readonly number[] = Array.from(
  { length: Math.floor((VISIBLE_NM.max - VISIBLE_NM.min) / STEP_NM) + 1 },
  (_, i) => VISIBLE_NM.min + i * STEP_NM,
);
const CMF: readonly (readonly [number, number, number])[] = SAMPLES.map((l) => [xBar(l), yBar(l), zBar(l)]);

function integrate(spectrum: (nm: number) => number): LinearRgb {
  let X = 0;
  let Y = 0;
  let Z = 0;
  for (let i = 0; i < SAMPLES.length; i++) {
    const s = spectrum(SAMPLES[i]!);
    const c = CMF[i]!;
    X += s * c[0];
    Y += s * c[1];
    Z += s * c[2];
  }
  return [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.204 * Y + 1.057 * Z,
  ];
}

/** 모든 파장이 1 인 스펙트럼의 적분 — 이것을 흰빛 [1, 1, 1] 로 맞춘다. */
const WHITE = integrate(() => 1);

/**
 * 스펙트럼(파장 nm → 상대 세기)을 눈에 보이는 색으로. CIE 1931 색맞춤 함수로 적분해 sRGB 선형광으로 옮기고,
 * **모든 파장이 1 인 스펙트럼이 [1, 1, 1]** 이 되게 맞춘다. 그래서 반사율 · 투과율 같은 0~1 스펙트럼을 넘기면
 * 「다 돌아오면 흰빛」 기준의 색이 나온다. sRGB 색역 밖 성분은 음수 · 1 초과일 수 있다 — 렌더러가 자른다.
 */
export function spectrumToLinearRgb(spectrum: (nm: number) => number): LinearRgb {
  const v = integrate(spectrum);
  return [v[0] / WHITE[0], v[1] / WHITE[1], v[2] / WHITE[2]];
}
