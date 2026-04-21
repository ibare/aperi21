import type { PluginLogger, Plugin } from '@aperi21/schema';
import { Camera } from './camera';
import { ComputeRegistry } from './compute/registry';
import { gravityVectorField, uniformVectorField } from './compute/standard';
import { ControllerRegistry } from './controller/types';
import { AngleDialController } from './controller/angle-dial';
import { PinballLauncherController } from './controller/pinball-launcher';
import { PlacementController } from './controller/placement';
import { ValueEditController } from './controller/value-edit';
import { SliderController } from './controller/slider';
import { I18nResolver, type Dictionary, type HostI18n } from './i18n/resolver';
import { PluginManager, ServiceRegistry, type HostPlugin, type Logger } from './pluginManager';
import { CORE_RENDERERS } from './renderer/primitives';
import { RendererRegistry } from './renderer/registry';
import { getTheme, type HostTheme, type ThemeMode } from './theme';
import {
  createTimeEngine,
  type TimeEngine,
  type TimeEngineMode,
} from './time';

export interface HostConfig {
  plugins?: HostPlugin[];
  theme?: ThemeMode;
  lang?: string;
  dictionary?: Dictionary;
  logger?: PluginLogger;
  /**
   * 초기 시간 모델. Embed 가 실제 Bundle 을 연결하기 전까지 사용하는 값.
   * Bundle 이 붙으면 Embed 가 setTimeMode 로 갱신한다.
   */
  timeMode?: TimeEngineMode;
}

const defaultLogger: PluginLogger = {
  warn(msg) {
    console.warn(msg);
  },
  info() {
    /* 개발 중 원하면 외부에서 주입. */
  },
};

/** ServiceRegistry 에 Host 가 기본 노출하는 서비스 id. */
export const HOST_SERVICE_IDS = {
  renderer: 'host.renderer',
  compute: 'host.compute',
  controller: 'host.controller',
  camera: 'host.camera',
  time: 'host.time',
  theme: 'host.theme',
  i18n: 'host.i18n',
  services: 'host.services',
} as const;

export class Host {
  readonly pluginManager: PluginManager;
  readonly rendererRegistry: RendererRegistry;
  readonly computeRegistry: ComputeRegistry;
  readonly controllerRegistry: ControllerRegistry;
  readonly services: ServiceRegistry;
  readonly camera: Camera;

  timeEngine: TimeEngine;
  theme: HostTheme;
  i18n: HostI18n;

  private readonly logger: PluginLogger;
  private themeMode: ThemeMode;

  constructor(config: HostConfig = {}) {
    this.logger = config.logger ?? defaultLogger;

    this.rendererRegistry = new RendererRegistry();
    this.computeRegistry = new ComputeRegistry();
    this.services = new ServiceRegistry();
    this.pluginManager = new PluginManager(
      this.rendererRegistry,
      this.computeRegistry,
      this.services,
      this.logger,
    );
    this.controllerRegistry = new ControllerRegistry();
    this.timeEngine = createTimeEngine(config.timeMode ?? 'linear');
    this.camera = new Camera();

    // 코어 렌더러 등록
    for (const [type, renderer] of Object.entries(CORE_RENDERERS)) {
      this.rendererRegistry.register(type, renderer);
    }

    // 코어 컨트롤러 등록 (5종 전부)
    this.controllerRegistry.register(new PinballLauncherController());
    this.controllerRegistry.register(new AngleDialController());
    this.controllerRegistry.register(new PlacementController());
    this.controllerRegistry.register(new ValueEditController());
    this.controllerRegistry.register(new SliderController());

    // 코어 표준 compute 메서드 등록
    this.computeRegistry.registerVector('uniform', uniformVectorField);
    this.computeRegistry.registerVector('gravity', gravityVectorField);

    this.themeMode = config.theme ?? 'light';
    this.theme = getTheme(this.themeMode);
    this.i18n = new I18nResolver(config.lang ?? 'ko', config.dictionary ?? {});

    // 서비스 등록 — Plugin 의 HostAPI.getService 로 조회 가능.
    this.services.register(HOST_SERVICE_IDS.renderer, this.rendererRegistry);
    this.services.register(HOST_SERVICE_IDS.compute, this.computeRegistry);
    this.services.register(HOST_SERVICE_IDS.controller, this.controllerRegistry);
    this.services.register(HOST_SERVICE_IDS.camera, this.camera);
    this.services.register(HOST_SERVICE_IDS.time, this.timeEngine);
    this.services.register(HOST_SERVICE_IDS.theme, this.theme);
    this.services.register(HOST_SERVICE_IDS.i18n, this.i18n);
    this.services.register(HOST_SERVICE_IDS.services, this.services);

    for (const plugin of config.plugins ?? []) {
      this.pluginManager.register(plugin);
    }
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.theme = getTheme(mode);
    this.services.register(HOST_SERVICE_IDS.theme, this.theme);
  }

  getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  setLang(lang: string, dictionary?: Dictionary): void {
    this.i18n = new I18nResolver(lang, dictionary ?? {});
    this.services.register(HOST_SERVICE_IDS.i18n, this.i18n);
  }

  /** Bundle 의 시간 모델에 맞춰 시간 엔진을 교체. Embed 가 호출. */
  setTimeMode(mode: TimeEngineMode): void {
    if (this.timeEngine.mode === mode) return;
    this.timeEngine = createTimeEngine(mode);
    this.services.register(HOST_SERVICE_IDS.time, this.timeEngine);
  }
}

export function createHost(config?: HostConfig): Host {
  return new Host(config ?? {});
}

export type { Plugin };
