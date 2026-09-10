import type { CSSProperties } from 'react';
import type { BundleSchema } from '@aperi21/schema';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface ViewTabsProps {
  schema: BundleSchema;
  theme: HostTheme;
  i18n: HostI18n;
  viewId: string;
  onSelectView(id: string): void;
}

export function ViewTabs({ schema, theme, i18n, viewId, onSelectView }: ViewTabsProps) {
  // 뷰가 하나면 고를 것이 없다. 탭 하나는 조작기가 아니라 크롬이다 (S-piece).
  // Canvas 의 프레이밍 여백도 같은 조건으로 이 자리를 뺀다.
  if (schema.views.length <= 1) return null;

  const wrap: CSSProperties = {
    position: 'absolute',
    top: 12,
    left: 12,
    display: 'flex',
    gap: 4,
    padding: 4,
    background: theme.resolveColor('muted', 'subtle'),
    borderRadius: theme.radiusSmall,
    border: `1px solid ${theme.line}`,
  };
  return (
    <div style={wrap}>
      {schema.views.map((v) => {
        const active = v.id === viewId;
        const style: CSSProperties = {
          padding: '4px 10px',
          border: 'none',
          borderRadius: theme.radiusSmall,
          background: active ? theme.resolveColor('primary', 'strong') : 'transparent',
          color: active ? theme.background : theme.muted,
          fontFamily: theme.fontFamilyMono,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        };
        return (
          <button key={v.id} type="button" style={style} onClick={() => onSelectView(v.id)}>
            {i18n.resolve(v.label)}
          </button>
        );
      })}
    </div>
  );
}
