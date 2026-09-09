import type { CSSProperties } from 'react';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface EnergyHUDProps {
  theme: HostTheme;
  i18n: HostI18n;
  derived: Record<string, number> | null;
}

/**
 * schema.autoViews.energy === true 이고 뷰가 'energy' 일 때 표시.
 * bundle.derivedValues 의 ke/pe/lost/initialTotal 을 써서 자동으로 에너지 바 생성.
 */
export function EnergyHUD({ theme, i18n, derived }: EnergyHUDProps) {
  if (!derived) return null;
  const ke = derived.ke ?? 0;
  const pe = derived.pe ?? 0;
  const lost = derived.lost ?? 0;
  const initial = derived.initialTotal ?? Math.max(1, ke + pe + lost);
  // 문안은 키로 조회한다 (C1). KE/PE 는 그 분야에서 원어로 통용되는 표식이라
  // en 원본이 곧 표식이고, ko 번들이 문안을 준다.
  const t = i18n.t.bind(i18n);

  const wrap: CSSProperties = {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 240,
    padding: '10px 12px',
    background: theme.resolveColor('muted', 'subtle'),
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    fontFamily: theme.fontFamilyMono,
    fontSize: 11,
    color: theme.foreground,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };
  const header: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: theme.muted,
  };
  const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
  const label: CSSProperties = { width: 52, color: theme.muted };
  const track: CSSProperties = {
    flex: 1,
    height: 10,
    background: theme.line,
    borderRadius: 4,
    overflow: 'hidden',
  };
  const val: CSSProperties = { width: 56, textAlign: 'right' };

  const bar = (
    role: 'primary' | 'accent' | 'negative',
    v: number,
  ): CSSProperties => ({
    width: `${Math.max(0, Math.min(100, (v / initial) * 100))}%`,
    height: '100%',
    background: theme.resolveColor(role, 'strong'),
    transition: 'width 120ms linear',
  });

  return (
    <div style={wrap}>
      <div style={header}>{t('ui.energyHud.title', 'Energy')}</div>
      <Row label={t('ui.energyHud.kinetic', 'KE')} value={ke} />
      <Row label={t('ui.energyHud.potential', 'PE')} value={pe} role="accent" />
      <Row label={t('ui.energyHud.lost', 'LOST')} value={lost} role="negative" />
      <div style={{ ...row, marginTop: 4, color: theme.muted }}>
        <span style={label}>{t('ui.energyHud.initial', 'INIT')}</span>
        <span style={{ flex: 1 }} />
        <span style={val}>{initial.toFixed(1)} J</span>
      </div>
    </div>
  );

  function Row({
    label: lbl,
    value,
    role = 'primary',
  }: {
    label: string;
    value: number;
    role?: 'primary' | 'accent' | 'negative';
  }) {
    return (
      <div style={row}>
        <span style={label}>{lbl}</span>
        <div style={track}>
          <div style={bar(role, value)} />
        </div>
        <span style={val}>{value.toFixed(1)} J</span>
      </div>
    );
  }
}
