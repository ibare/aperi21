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

/**
 * BaseMeta.style.colorRole + emphasis 를 읽어서 실제 색상 문자열로 변환.
 * style 이나 colorRole 이 없으면 기본값 (primary, medium) 사용.
 */
export function primitiveColor(
  rc: RenderContext,
  p: Primitive,
  defaults: { role?: ColorRole; emphasis?: Emphasis } = {},
): string {
  const style = (p as { style?: { colorRole?: ColorRole; emphasis?: Emphasis } }).style;
  const role = style?.colorRole ?? defaults.role ?? 'primary';
  const emphasis = style?.emphasis ?? defaults.emphasis ?? 'medium';
  return rc.theme.resolveColor(role, emphasis);
}
