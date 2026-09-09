import type { CSSProperties } from 'react';
import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface StageOverlayProps {
  theme: HostTheme;
  i18n: HostI18n;
  stage: StageDef;
  environments: EnvironmentDef[];
}

/**
 * Stage 라벨(g 표기) + 중력 화살표 + 활성 환경 뱃지를 캔버스 좌상단에 띄우는
 * HTML 오버레이. 과거에는 scene graph 의 월드 좌표 marker 였으나 줌아웃 시
 * 한 점으로 응집되어 가독성이 떨어져 스크린 좌표 오버레이로 옮겼다.
 */
export function StageOverlay({ theme, i18n, stage, environments }: StageOverlayProps) {
  const g = stage.constants.g ?? 0;
  const hasAtmosphere = (stage.constants.hasAtmosphere ?? 0) > 0;
  const stageText = `${i18n.resolve(stage.label)} · g=${g.toFixed(1)} m/s²`;

  // InfoPanel(top:12, right:12, 약 110px 높이) 아래로 배치.
  // 자리는 부모(오른쪽 오버레이 열)가 정한다. 예전에는 top:140 으로 InfoPanel
  // 아래를 가정했는데, 패널 높이는 파생값 개수에 따라 달라져 큰 화면에서 겹쳤다.
  const wrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    pointerEvents: 'none',
    fontFamily: theme.fontFamilyMono,
  };
  const stageBadge: CSSProperties = {
    padding: '4px 10px',
    background: theme.resolveColor('muted', 'subtle'),
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    color: theme.foreground,
    fontSize: 11,
    letterSpacing: '0.04em',
  };
  const arrowRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: theme.muted,
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };
  const envWrap: CSSProperties = {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  };
  const envBadge: CSSProperties = {
    padding: '2px 8px',
    background: theme.resolveColor('accent', 'subtle'),
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    color: theme.foreground,
    fontSize: 10,
    letterSpacing: '0.04em',
  };

  // 화살표 길이는 g 에 비례하지만 최대 36px.
  const arrowLen = Math.min(36, Math.max(0, g) * 3.6);

  return (
    <div style={wrap}>
      <div style={stageBadge}>{stageText}</div>
      {g > 0 && (
        <div style={arrowRow}>
          <span>g</span>
          <svg width={12} height={arrowLen + 8} viewBox={`0 0 12 ${arrowLen + 8}`}>
            <line
              x1={6}
              y1={2}
              x2={6}
              y2={arrowLen + 2}
              stroke={theme.muted}
              strokeWidth={1.5}
            />
            <polygon
              points={`6,${arrowLen + 6} 2,${arrowLen} 10,${arrowLen}`}
              fill={theme.muted}
            />
          </svg>
        </div>
      )}
      {hasAtmosphere && environments.length > 0 && (
        <div style={envWrap}>
          {environments.map((env) => (
            <span key={env.id} style={envBadge}>
              {i18n.resolve(env.label)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
