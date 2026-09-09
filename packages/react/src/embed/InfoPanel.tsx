import type { CSSProperties } from 'react';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface InfoPanelProps {
  theme: HostTheme;
  i18n: HostI18n;
  derived: Record<string, number> | null;
}

/**
 * 파생값 행의 표시 규약.
 *
 * `unit` 과 `digits` 는 데이터라 여기 둔다. **라벨은 문안이므로 코드에 두지 않는다** —
 * 조회 키와 en 원본만 갖고, 실제 문자는 i18n 3층이 정한다 (C1).
 *
 * en 원본이 `t` · `|v|` · `y_max` 처럼 기호인 것은 그것이 **표식**이기 때문이다
 * (C1 「표식이냐 문안이냐」 3번 — 수식·기호 표기). ko 번들이 문안을 준다.
 */
const ROW_SPEC: Record<string, { key: string; en: string; unit?: string; digits?: number }> = {
  t: { key: 'ui.infoPanel.time', en: 't', unit: 's', digits: 2 },
  speed: { key: 'ui.infoPanel.speed', en: '|v|', unit: 'm/s', digits: 2 },
  maxHeight: { key: 'ui.infoPanel.maxHeight', en: 'y_max', unit: 'm', digits: 1 },
  range: { key: 'ui.infoPanel.range', en: 'x_max', unit: 'm', digits: 1 },
  flightTime: { key: 'ui.infoPanel.flightTime', en: 't_f', unit: 's', digits: 2 },
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
    .filter(([k]) => ROW_SPEC[k])
    .map(([k, v]) => {
      const meta = ROW_SPEC[k]!;
      const label = i18n.t(meta.key, meta.en);
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
