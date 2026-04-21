import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Bundle, BundleState } from '@aperi21/schema';
import { useHost } from './hooks/useHost';
import { useI18n } from './hooks/useI18n';
import { useTheme } from './hooks/useTheme';
import { BundleCanvas } from './embed/Canvas';
import { TopBar } from './embed/TopBar';
import { ViewTabs } from './embed/ViewTabs';
import { InfoPanel } from './embed/InfoPanel';
import { CameraControls } from './embed/CameraControls';
import { EnergyHUD } from './embed/EnergyHUD';
import { ParamPanel } from './embed/ParamPanel';
import { useBundleRuntime } from './embed/useBundleRuntime';

export interface EmbedProps {
  bundle: Bundle;
  stageId?: string;
  initialValues?: Record<string, number>;
  initialView?: string;
  initialEnvironments?: string[];
}

export function Embed({ bundle, stageId, initialView, initialEnvironments }: EmbedProps) {
  const host = useHost();
  const theme = useTheme();
  const i18n = useI18n();

  const runtime = useBundleRuntime<BundleState>(
    bundle,
    stageId,
    initialView,
    initialEnvironments,
  );

  const [derived, setDerived] = useState<Record<string, number> | null>(null);
  const resetCameraRef = useRef<() => void>(() => {});
  const registerResetCamera = useCallback((fn: () => void) => {
    resetCameraRef.current = fn;
  }, []);

  // stage 변경 시 카메라·타임엔진도 함께 리셋 (userAdjusted=false 로)
  useEffect(() => {
    host.camera.reset();
    host.timeEngine.reset();
    host.timeEngine.start();
  }, [host, runtime.resetSignal, runtime.stageId]);

  const wrapper: CSSProperties = {
    background: theme.background,
    color: theme.foreground,
    borderRadius: theme.radiusMedium * 2,
    fontFamily: theme.fontFamily,
    border: `1px solid ${theme.line}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 480,
  };
  const stageArea: CSSProperties = {
    position: 'relative',
    flex: 1,
    minHeight: 400,
    background: theme.background,
  };

  const showEnergy =
    runtime.viewId === 'energy' && bundle.schema.autoViews?.energy !== false;

  return (
    <div className="aperi21-embed" data-theme={theme.mode} style={wrapper}>
      <TopBar
        schema={bundle.schema}
        theme={theme}
        i18n={i18n}
        stageId={runtime.stageId}
        envIds={runtime.envIds}
        onSelectStage={runtime.setStageId}
        onToggleEnv={runtime.toggleEnv}
      />
      <div style={stageArea}>
        <BundleCanvas
          host={host}
          bundle={bundle}
          stage={runtime.stage}
          view={runtime.view}
          environments={runtime.environments}
          stateRef={runtime.stateRef}
          onStateChange={runtime.replaceState}
          onDerived={setDerived}
          registerResetCamera={registerResetCamera}
        />
        <ViewTabs
          schema={bundle.schema}
          theme={theme}
          i18n={i18n}
          viewId={runtime.viewId}
          onSelectView={runtime.setViewId}
        />
        <InfoPanel theme={theme} i18n={i18n} derived={derived} />
        {showEnergy && <EnergyHUD theme={theme} i18n={i18n} derived={derived} />}
        <ParamPanel
          theme={theme}
          i18n={i18n}
          schema={bundle.schema}
          values={runtime.paramValues}
          onChange={runtime.setParam}
          onReset={runtime.reset}
        />
        <CameraControls
          theme={theme}
          i18n={i18n}
          onReset={() => resetCameraRef.current()}
          onResetBundle={runtime.reset}
        />
      </div>
    </div>
  );
}
