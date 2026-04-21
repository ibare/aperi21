import type { Primitive, RenderContext } from '@aperi21/schema';

/**
 * BaseMeta 의 highlight 상태에 따른 alpha / shadow 를 적용한다.
 * ctx.ctx.save() 로 상태를 저장하므로 반드시 finalizeBaseMeta 로 restore 해야 한다.
 */
export function applyBaseMeta(rc: RenderContext, p: Primitive): void {
  const c = rc.ctx;
  c.save();
  switch (p.highlight ?? 'normal') {
    case 'focused':
      c.globalAlpha = 1;
      c.shadowColor = rc.theme.resolveColor('accent', 'strong');
      c.shadowBlur = 8;
      break;
    case 'dimmed':
      c.globalAlpha = 0.3;
      break;
    case 'warning':
      c.globalAlpha = 1;
      c.shadowColor = rc.theme.resolveColor('negative', 'strong');
      c.shadowBlur = 6;
      break;
    default:
      c.globalAlpha = 1;
  }
}

export function finalizeBaseMeta(rc: RenderContext, _p: Primitive): void {
  rc.ctx.restore();
}

/**
 * BaseMeta.style.colorRole + emphasis 를 읽어서 실제 색상 문자열로 변환.
 * style 이나 colorRole 이 없으면 기본값 (primary, medium) 사용.
 */
export function primitiveColor(
  rc: RenderContext,
  p: Primitive,
  defaults: { role?: 'primary' | 'secondary' | 'accent' | 'muted' | 'positive' | 'negative'; emphasis?: 'strong' | 'medium' | 'subtle' } = {},
): string {
  const style = (p as { style?: { colorRole?: 'primary' | 'secondary' | 'accent' | 'muted' | 'positive' | 'negative'; emphasis?: 'strong' | 'medium' | 'subtle' } }).style;
  const role = style?.colorRole ?? defaults.role ?? 'primary';
  const emphasis = style?.emphasis ?? defaults.emphasis ?? 'medium';
  return rc.theme.resolveColor(role, emphasis);
}
