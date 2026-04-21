import type { CSSProperties } from 'react';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface CameraControlsProps {
  theme: HostTheme;
  i18n: HostI18n;
  onReset(): void;
  onResetBundle(): void;
}

export function CameraControls({ theme, i18n, onReset, onResetBundle }: CameraControlsProps) {
  const wrap: CSSProperties = {
    position: 'absolute',
    bottom: 12,
    right: 12,
    display: 'flex',
    gap: 6,
  };
  const btn: CSSProperties = {
    padding: '4px 10px',
    borderRadius: theme.radiusSmall,
    border: `1px solid ${theme.line}`,
    background: theme.background,
    color: theme.foreground,
    fontFamily: theme.fontFamilyMono,
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
  const ko = i18n.lang === 'ko';
  return (
    <div style={wrap}>
      <button type="button" style={btn} onClick={onReset} title={ko ? '카메라 리셋' : 'Camera reset'}>
        {ko ? '카메라' : 'Camera'}
      </button>
      <button type="button" style={btn} onClick={onResetBundle} title={ko ? '상태 초기화' : 'Reset'}>
        {ko ? '초기화' : 'Reset'}
      </button>
    </div>
  );
}
