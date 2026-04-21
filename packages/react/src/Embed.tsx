import type { CSSProperties } from 'react';
import type { Bundle } from '@aperi21/schema';
import { useHost } from './hooks/useHost';
import { useI18n } from './hooks/useI18n';
import { useTheme } from './hooks/useTheme';

export interface EmbedProps {
  bundle: Bundle;
  stageId?: string;
  initialValues?: Record<string, number>;
  initialView?: string;
  initialEnvironments?: string[];
}

export function Embed({ bundle, stageId, initialView }: EmbedProps) {
  useHost();
  const theme = useTheme();
  const i18n = useI18n();

  const schema = bundle.schema;
  const stage = schema.stages.find((s) => s.id === stageId) ?? schema.stages[0];
  const view =
    schema.views.find((v) => v.id === initialView) ??
    schema.views.find((v) => v.default) ??
    schema.views[0];

  const wrapper: CSSProperties = {
    background: theme.background,
    color: theme.foreground,
    padding: '20px 24px',
    borderRadius: theme.radiusMedium * 2,
    fontFamily: theme.fontFamily,
    minHeight: 280,
    border: `1px solid ${theme.line}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const kicker: CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.14em',
    color: theme.muted,
    fontFamily: theme.fontFamilyMono,
    textTransform: 'uppercase',
  };

  const title: CSSProperties = {
    fontSize: 18,
    fontStyle: 'italic',
    color: theme.foreground,
  };

  const metaList: CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    color: theme.muted,
    fontFamily: theme.fontFamilyMono,
    lineHeight: 1.7,
  };

  const badge: CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 10,
    letterSpacing: '0.08em',
    borderRadius: theme.radiusSmall,
    background: theme.resolveColor('accent', 'subtle'),
    color: theme.resolveColor('accent', 'strong'),
    textTransform: 'uppercase',
    fontFamily: theme.fontFamilyMono,
  };

  return (
    <div className="aperi21-embed" data-theme={theme.mode} style={wrapper}>
      <div style={kicker}>
        <span style={badge}>Phase 1</span>{' '}
        APERI21 · {schema.category.toUpperCase()} · {i18n.resolve(schema.label).toUpperCase()}
      </div>
      <div style={title}>
        {i18n.resolve(schema.operation)}
      </div>
      <div style={metaList}>
        bundle <strong style={{ color: theme.foreground }}>{schema.id}</strong>
        <br />
        stage <strong style={{ color: theme.foreground }}>{stage?.id ?? 'none'}</strong>
        {stage && <> &middot; {i18n.resolve(stage.label)}</>}
        <br />
        view <strong style={{ color: theme.foreground }}>{view?.id ?? 'default'}</strong>
        {view && <> &middot; {i18n.resolve(view.label)}</>}
      </div>
      <div style={{ fontSize: 12, color: theme.muted, marginTop: 'auto' }}>
        실제 Scene Graph 렌더러는 Phase 2 에서 구현됩니다.
      </div>
    </div>
  );
}
