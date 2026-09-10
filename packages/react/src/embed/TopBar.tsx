import type { CSSProperties } from 'react';
import type { BundleSchema } from '@aperi21/schema';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface TopBarProps {
  schema: BundleSchema;
  theme: HostTheme;
  i18n: HostI18n;
  stageId: string;
  envIds: string[];
  onSelectStage(id: string): void;
  onToggleEnv(id: string): void;
}

export function TopBar({ schema, theme, i18n, stageId, envIds, onSelectStage, onToggleEnv }: TopBarProps) {
  // 고를 것이 없으면 줄째로 없다. 스테이지 하나만 뜬 탭은 조작기가 아니라 크롬이다
  // (S-piece). **선언만 보고** 정한다 — 스테이지에 따라 환경 목록이 달라지므로
  // 런타임 값으로 정하면 스테이지를 바꿀 때 높이가 바뀐다 (원칙 6).
  if (schema.stages.length <= 1 && schema.environments.length === 0) return null;

  const wrap: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    padding: '8px 12px',
    background: theme.background,
    borderBottom: `1px solid ${theme.line}`,
    fontFamily: theme.fontFamilyMono,
    fontSize: 12,
  };
  const group: CSSProperties = { display: 'flex', gap: 4, alignItems: 'center' };
  const label: CSSProperties = {
    color: theme.muted,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontSize: 10,
    marginRight: 6,
  };

  const availableEnvs = schema.environments.filter(
    (e) => !e.availableInStages || e.availableInStages.includes(stageId),
  );

  return (
    <div style={wrap}>
      {schema.stages.length > 1 && (
      <div style={group}>
        <span style={label}>{i18n.t('ui.topBar.stage', 'stage')}</span>
        {schema.stages.map((s) => (
          <Tab
            key={s.id}
            theme={theme}
            active={s.id === stageId}
            onClick={() => onSelectStage(s.id)}
          >
            {i18n.resolve(s.label)}
          </Tab>
        ))}
      </div>
      )}
      {availableEnvs.length > 0 && (
        <div style={group}>
          <span style={label}>{i18n.t('ui.topBar.env', 'env')}</span>
          {availableEnvs.map((e) => (
            <Tab
              key={e.id}
              theme={theme}
              active={envIds.includes(e.id)}
              onClick={() => onToggleEnv(e.id)}
              mode="toggle"
            >
              {i18n.resolve(e.label)}
            </Tab>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  theme,
  active,
  onClick,
  children,
  mode = 'tab',
}: {
  theme: HostTheme;
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
  mode?: 'tab' | 'toggle';
}) {
  const style: CSSProperties = {
    padding: '4px 10px',
    borderRadius: theme.radiusSmall,
    border: `1px solid ${active ? theme.resolveColor('primary', 'strong') : theme.line}`,
    background: active
      ? mode === 'toggle'
        ? theme.resolveColor('accent', 'subtle')
        : theme.resolveColor('primary', 'subtle')
      : 'transparent',
    color: active ? theme.foreground : theme.muted,
    fontSize: 12,
    fontFamily: theme.fontFamilyMono,
    cursor: 'pointer',
  };
  return (
    <button type="button" style={style} onClick={onClick}>
      {children}
    </button>
  );
}
