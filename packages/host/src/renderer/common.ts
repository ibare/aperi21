import type { ColorRole, Primitive, RenderContext } from '@aperi21/schema';

type Emphasis = 'strong' | 'medium' | 'subtle';

/** 흐리게(`highlight: 'dimmed'`) 그릴 때의 알파. */
const DIMMED_ALPHA = 0.3;

/**
 * 지금 그리는 프리미티브의 기준 알파를 캔버스에 붙여 두는 자리.
 *
 * 렌더러는 반투명 채움·페이드처럼 **자기 알파**를 쓴다. 그것을 `globalAlpha = x` 로
 * 대입하면 강조 상태와 `opacity` 가 지워진다 — 잔상이 옅어지지 않는데 예외도 없고
 * 타입도 통과한다. 그래서 알파는 반드시 `setAlpha` 로 기준에 곱해 넣는다.
 * 모듈 상태가 아니라 그 캔버스 컨텍스트에 붙는 값이라 인스턴스끼리 섞이지 않는다.
 */
const BASE_ALPHA = Symbol('aperi21.baseAlpha');
type AlphaContext = CanvasRenderingContext2D & { [BASE_ALPHA]?: number };

/** 이 프리미티브의 기준 알파 — 강조 상태 × `opacity`. */
export function baseAlpha(p: Primitive): number {
  const highlight = p.highlight === 'dimmed' ? DIMMED_ALPHA : 1;
  const opacity = typeof p.opacity === 'number' ? Math.max(0, Math.min(1, p.opacity)) : 1;
  return highlight * opacity;
}

/** 렌더러 자신의 알파를 기준 알파에 곱해 넣는다. `globalAlpha` 에 직접 대입하지 않는다. */
export function setAlpha(c: CanvasRenderingContext2D, alpha: number): void {
  c.globalAlpha = alpha * ((c as AlphaContext)[BASE_ALPHA] ?? 1);
}

/**
 * BaseMeta 의 강조 상태·불투명도를 적용한다.
 * ctx.save() 로 상태를 저장하므로 반드시 finalizeBaseMeta 로 restore 해야 한다.
 */
export function applyBaseMeta(rc: RenderContext, p: Primitive): void {
  const c = rc.ctx;
  c.save();
  (c as AlphaContext)[BASE_ALPHA] = baseAlpha(p);
  setAlpha(c, 1);
  if (p.clip) {
    // 이 save 안에서 자르므로 finalizeBaseMeta 의 restore 가 함께 푼다. 월드 y 가 위라
    // 화면으로 옮기면 위아래가 뒤집힌다 — 모서리를 다시 세운다.
    const [ax, ay] = rc.toScreen(p.clip.min);
    const [bx, by] = rc.toScreen(p.clip.max);
    c.beginPath();
    c.rect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay));
    c.clip();
    // clip() 은 경로를 비우지 않는다. beginPath 없이 moveTo 부터 긋는 렌더러가 오면
    // 이 사각형이 그 렌더러의 선·채움에 섞인다.
    c.beginPath();
  }
  switch (p.highlight ?? 'normal') {
    case 'focused':
      c.shadowColor = rc.theme.resolveColor('accent', 'strong');
      c.shadowBlur = 8;
      break;
    case 'warning':
      c.shadowColor = rc.theme.resolveColor('negative', 'strong');
      c.shadowBlur = 6;
      break;
    default:
      break;
  }
}

export function finalizeBaseMeta(rc: RenderContext, _p: Primitive): void {
  rc.ctx.restore();
  // save/restore 는 붙여 둔 값을 되돌리지 않는다. 다음 프리미티브가 물려받지 않게.
  (rc.ctx as AlphaContext)[BASE_ALPHA] = 1;
}

// ------------------------------------------------------------------------
// 선형광 — 밝기가 주장인 그림을 위한 것
// ------------------------------------------------------------------------
//
// 알파로 섞으면 화면값이 섞인다. 화면값은 감마로 눌려 있어서 1/4 로 칠한 것이
// 눈에는 절반쯤으로 보인다 — "네 배 옅다" 가 거짓이 된다. 빛의 양을 말하려면
// 선형으로 되돌려 섞고 다시 인코딩해야 한다.
//
// C2 Exception: 색 공간 변환의 수학 상수는 색 리터럴이 아니다.

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
}

/**
 * 색 문자열을 **선형광** 0~1 세 성분으로. `#rgb` · `#rrggbb` · `rgb(...)` · `rgba(...)` 를 읽는다
 * (테마의 `medium` · `subtle` 은 `rgba` 로 온다 — 알파는 버린다). 다른 표기는 null.
 *
 * 값을 명암으로 칠하는 어휘(`scalarField`)가 테마 색을 섞을 때 쓴다. 섞기는 선형광에서 한다 —
 * `luminance` 와 같은 셈이라야 같은 비율이 같은 빛의 양으로 보인다.
 */
export function linearRgbOf(color: string): [number, number, number] | null {
  const hex = parseHex(color);
  const rgb =
    hex ??
    ((): [number, number, number] | null => {
      const m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color.trim());
      return m ? [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255] : null;
    })();
  if (!rgb) return null;
  return [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
}

/** 선형광 한 성분을 화면값 0~255 정수로. */
export function linearToByte(c: number): number {
  return linearToSrgb(c);
}

/** 입자별 · 선별 불투명도를 묶는 단계 수. 단계마다 경로 하나라 그리기 호출이 이 수를 넘지 않는다. */
export const OPACITY_LEVELS = 8;

/**
 * 항목별 불투명도를 `OPACITY_LEVELS` 단계로 묶는다. 돌려주는 것은 `[단계 알파, 항목 번호들]` 목록이고
 * 알파 0 인 항목은 빠진다. `opacities` 를 생략하면 모든 항목이 알파 1 한 단계다.
 */
export function opacityBuckets(
  count: number,
  opacities: readonly number[] | undefined,
): { alpha: number; indices: number[] }[] {
  if (!opacities) return count > 0 ? [{ alpha: 1, indices: Array.from({ length: count }, (_, i) => i) }] : [];
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < count; i++) {
    const a = Math.max(0, Math.min(1, opacities[i] ?? 1));
    const level = Math.round(a * OPACITY_LEVELS);
    if (level === 0) continue;
    const list = buckets.get(level);
    if (list) list.push(i);
    else buckets.set(level, [i]);
  }
  return [...buckets.entries()].map(([level, indices]) => ({ alpha: level / OPACITY_LEVELS, indices }));
}

/** `#rgb` · `#rrggbb` 를 0~1 세 성분으로. 다른 표기는 null. */
function parseHex(color: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return null;
  const h = m[1]!;
  const full = h.length === 3 ? h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]! : h;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

/**
 * 선언한 `luminance` 만큼의 **빛의 양**으로 색을 만든다.
 *
 * 배경 위에 그 비율의 빛을 얹은 결과를 돌려준다. 배경색이나 전경색을 해석할 수
 * 없으면(그라디언트 · 이름 색) `null` 을 주고, 그때는 렌더러가 알파로 떨어진다.
 */
export function luminanceColor(rc: RenderContext, color: string, amount: number): string | null {
  const fg = parseHex(color);
  const bg = parseHex(rc.theme.background);
  if (!fg || !bg) return null;
  const a = Math.max(0, Math.min(1, amount));
  const mix = (i: number): number => {
    const lin = srgbToLinear(bg[i]!) + (srgbToLinear(fg[i]!) - srgbToLinear(bg[i]!)) * a;
    return linearToSrgb(lin);
  };
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

/**
 * 테마와 무관한 **빛의 세기** 0~1 을 색으로. 테마의 `light.none` 과 `light.full` 을 선형광으로 섞는다.
 * 양 끝을 해석할 수 없으면(hex 가 아니면) 반올림한 끝 색을 준다.
 */
export function lightColor(rc: RenderContext, amount: number): string {
  const a = Math.max(0, Math.min(1, amount));
  const lo = parseHex(rc.theme.light.none);
  const hi = parseHex(rc.theme.light.full);
  if (!lo || !hi) return a < 0.5 ? rc.theme.light.none : rc.theme.light.full;
  const mix = (i: number): number =>
    linearToSrgb(srgbToLinear(lo[i]!) + (srgbToLinear(hi[i]!) - srgbToLinear(lo[i]!)) * a);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

/**
 * BaseMeta.style.colorRole + emphasis 를 읽어서 실제 색상 문자열로 변환.
 * style 이나 colorRole 이 없으면 기본값 (primary, medium) 사용.
 *
 * `luminance` 를 선언했으면 그 빛의 양으로 섞은 색을 준다 — 알파가 아니라 색이다.
 * `light` 를 선언했으면 역할 · 강조 · `luminance` 를 보지 않고 그 빛의 세기의 색을 준다 (장부 G34).
 */
export function primitiveColor(
  rc: RenderContext,
  p: Primitive,
  defaults: { role?: ColorRole; emphasis?: Emphasis } = {},
): string {
  const light = (p as { light?: number }).light;
  if (typeof light === 'number') return lightColor(rc, light);
  const style = (p as { style?: { colorRole?: ColorRole; emphasis?: Emphasis } }).style;
  const role = style?.colorRole ?? defaults.role ?? 'primary';
  const emphasis = style?.emphasis ?? defaults.emphasis ?? 'medium';
  const color = rc.theme.resolveColor(role, emphasis);
  const lum = (p as { luminance?: number }).luminance;
  if (typeof lum === 'number') return luminanceColor(rc, color, lum) ?? color;
  return color;
}
