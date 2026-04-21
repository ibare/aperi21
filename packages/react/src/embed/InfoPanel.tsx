import type { CSSProperties } from 'react';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface InfoPanelProps {
  theme: HostTheme;
  i18n: HostI18n;
  derived: Record<string, number> | null;
}

const LABEL_MAP: Record<string, { ko: string; en: string; unit?: string; digits?: number }> = {
  t: { ko: '시간', en: 't', unit: 's', digits: 2 },
  speed: { ko: '속도', en: '|v|', unit: 'm/s', digits: 2 },
  maxHeight: { ko: '최고점', en: 'y_max', unit: 'm', digits: 1 },
  range: { ko: '비거리', en: 'x_max', unit: 'm', digits: 1 },
  flightTime: { ko: '체공', en: 't_f', unit: 's', digits: 2 },
};

export function InfoPanel({ theme, i18n, derived }: InfoPanelProps) {
  if (!derived) return null;

  const wrap: CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 180,
    padding: '10px 12px',
    background: theme.resolveColor('muted', 'subtle'),
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    fontFamily: theme.fontFamilyMono,
    fontSize: 12,
    color: theme.foreground,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: 10,
    rowGap: 4,
  };
  const title: CSSProperties = {
    gridColumn: '1 / span 2',
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: theme.muted,
    marginBottom: 4,
  };
  const key: CSSProperties = { color: theme.muted };
  const val: CSSProperties = { textAlign: 'right' };

  const rows = Object.entries(derived)
    .filter(([k]) => LABEL_MAP[k])
    .map(([k, v]) => {
      const meta = LABEL_MAP[k]!;
      const label = i18n.lang === 'ko' ? meta.ko : meta.en;
      const digits = meta.digits ?? 2;
      const valueText = Number.isFinite(v)
        ? `${v.toFixed(digits)}${meta.unit ? ' ' + meta.unit : ''}`
        : '—';
      return { label, valueText };
    });

  if (rows.length === 0) return null;

  return (
    <div style={wrap}>
      <div style={title}>info</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'contents' }}>
          <div style={key}>{r.label}</div>
          <div style={val}>{r.valueText}</div>
        </div>
      ))}
    </div>
  );
}
