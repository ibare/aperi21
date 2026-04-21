import type { CSSProperties } from 'react';
import type { BundleSchema } from '@aperi21/schema';
import type { HostI18n, HostTheme } from '@aperi21/host';

export interface ParamPanelProps {
  theme: HostTheme;
  i18n: HostI18n;
  schema: BundleSchema;
  values: Record<string, number>;
  onChange(id: string, value: number): void;
  onReset(): void;
}

/**
 * Bundle.schema.parameters 를 슬라이더로 렌더한다. range/step/unit 이 정의되면
 * 해당 값으로 렌더; range 미정의 파라미터는 number input 으로 폴백한다.
 *
 * docs/08-mvp-scope §C1 요구: 파라미터 라이브 조작.
 */
export function ParamPanel({ theme, i18n, schema, values, onChange, onReset }: ParamPanelProps) {
  if (!schema.parameters || schema.parameters.length === 0) return null;

  const wrap: CSSProperties = {
    // ViewTabs 바로 아래(좌상단 영역). 하단은 angle-dial/pinball-launcher 가 점유.
    position: 'absolute',
    top: 56,
    left: 12,
    minWidth: 240,
    maxWidth: 320,
    padding: '10px 12px',
    background: theme.resolveColor('muted', 'subtle'),
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    fontFamily: theme.fontFamilyMono,
    fontSize: 12,
    color: theme.foreground,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };
  const headerRow: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  };
  const title: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: theme.muted,
  };
  const resetBtn: CSSProperties = {
    background: 'transparent',
    color: theme.muted,
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    padding: '2px 8px',
    fontFamily: theme.fontFamilyMono,
    fontSize: 10,
    cursor: 'pointer',
  };
  const row: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    rowGap: 2,
    columnGap: 8,
    alignItems: 'center',
  };
  const labelStyle: CSSProperties = { color: theme.muted };
  const valStyle: CSSProperties = {
    color: theme.foreground,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  };
  const sliderStyle: CSSProperties = {
    gridColumn: '1 / span 2',
    width: '100%',
    accentColor: theme.resolveColor('primary', 'strong'),
  };
  const numberInput: CSSProperties = {
    gridColumn: '1 / span 2',
    background: theme.background,
    color: theme.foreground,
    border: `1px solid ${theme.line}`,
    borderRadius: theme.radiusSmall,
    fontFamily: theme.fontFamilyMono,
    fontSize: 12,
    padding: '2px 6px',
  };

  return (
    <div style={wrap} data-aperi21="param-panel">
      <div style={headerRow}>
        <div style={title}>{i18n.lang === 'ko' ? '파라미터' : 'params'}</div>
        <button type="button" style={resetBtn} onClick={onReset}>
          {i18n.lang === 'ko' ? '초기값' : 'reset'}
        </button>
      </div>
      {schema.parameters.map((p) => {
        const current = values[p.id] ?? p.default;
        const digits = decimalsForStep(p.step);
        const valueText = `${current.toFixed(digits)}${p.unit ? ' ' + p.unit : ''}`;
        return (
          <div key={p.id} style={row}>
            <div style={labelStyle}>{i18n.resolve(p.label)}</div>
            <div style={valStyle}>{valueText}</div>
            {p.range ? (
              <input
                style={sliderStyle}
                type="range"
                min={p.range[0]}
                max={p.range[1]}
                step={p.step ?? autoStep(p.range)}
                value={current}
                onChange={(e) => onChange(p.id, Number(e.target.value))}
              />
            ) : (
              <input
                style={numberInput}
                type="number"
                step={p.step ?? 1}
                value={current}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) onChange(p.id, v);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function autoStep(range: [number, number]): number {
  const span = Math.abs(range[1] - range[0]);
  if (span >= 100) return 1;
  if (span >= 10) return 0.1;
  return 0.01;
}

function decimalsForStep(step: number | undefined): number {
  if (!step || step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}
