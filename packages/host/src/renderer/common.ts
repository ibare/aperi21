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
 * BaseMeta.style.colorRole + emphasis 를 읽어서 실제 색상 문자열로 변환.
 * style 이나 colorRole 이 없으면 기본값 (primary, medium) 사용.
 *
 * `luminance` 를 선언했으면 그 빛의 양으로 섞은 색을 준다 — 알파가 아니라 색이다.
 */
export function primitiveColor(
  rc: RenderContext,
  p: Primitive,
  defaults: { role?: ColorRole; emphasis?: Emphasis } = {},
): string {
  const style = (p as { style?: { colorRole?: ColorRole; emphasis?: Emphasis } }).style;
  const role = style?.colorRole ?? defaults.role ?? 'primary';
  const emphasis = style?.emphasis ?? defaults.emphasis ?? 'medium';
  const color = rc.theme.resolveColor(role, emphasis);
  const lum = (p as { luminance?: number }).luminance;
  if (typeof lum === 'number') return luminanceColor(rc, color, lum) ?? color;
  return color;
}
