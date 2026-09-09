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
  // 문안은 키로 조회한다. en 원본은 호출부 리터럴로 남겨 추출 대상이 되게 한다 (C1).
  const t = i18n.t.bind(i18n);
  return (
    <div style={wrap}>
      <button
        type="button"
        style={btn}
        onClick={onReset}
        title={t('ui.cameraControls.cameraTitle', 'Camera reset')}
      >
        {t('ui.cameraControls.camera', 'Camera')}
      </button>
      <button
        type="button"
        style={btn}
        onClick={onResetBundle}
        title={t('ui.cameraControls.resetTitle', 'Reset')}
      >
        {t('ui.cameraControls.reset', 'Reset')}
      </button>
    </div>
  );
}
