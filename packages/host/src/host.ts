import { Camera } from './camera';
import { ComputeRegistry } from './compute/registry';
import { gravityVectorField, uniformVectorField } from './compute/standard';
import { ControllerRegistry } from './controller/types';
import { AngleDialController } from './controller/angle-dial';
import { PinballLauncherController } from './controller/pinball-launcher';
import { I18nResolver, type Dictionary, type HostI18n } from './i18n/resolver';
import { PluginManager, type HostPlugin, type Logger } from './pluginManager';
import { CORE_RENDERERS } from './renderer/primitives';
import { RendererRegistry } from './renderer/registry';
import { getTheme, type HostTheme, type ThemeMode } from './theme';
import { LinearTimeEngine, type TimeEngine } from './time';

export interface HostConfig {
  plugins?: HostPlugin[];
  theme?: ThemeMode;
  lang?: string;
  dictionary?: Dictionary;
  logger?: Logger;
}

const defaultLogger: Logger = {
  warn(msg) {
    console.warn(msg);
  },
  info() {
    /* 기본 로거는 info 를 무시. 개발 중에는 주입해서 확인. */
  },
};

export class Host {
  readonly pluginManager: PluginManager;
  readonly rendererRegistry: RendererRegistry;
  readonly computeRegistry: ComputeRegistry;
  readonly controllerRegistry: ControllerRegistry;
  readonly timeEngine: TimeEngine;
  readonly camera: Camera;

  theme: HostTheme;
  i18n: HostI18n;

  private readonly logger: Logger;
  private themeMode: ThemeMode;

  constructor(config: HostConfig = {}) {
    this.logger = config.logger ?? defaultLogger;

    this.rendererRegistry = new RendererRegistry();
    this.computeRegistry = new ComputeRegistry();
    this.pluginManager = new PluginManager(
      this.rendererRegistry,
      this.computeRegistry,
      this.logger,
    );
    this.controllerRegistry = new ControllerRegistry();
    this.timeEngine = new LinearTimeEngine();
    this.camera = new Camera();

    // 코어 렌더러 등록
    for (const [type, renderer] of Object.entries(CORE_RENDERERS)) {
      this.rendererRegistry.register(type, renderer);
    }

    // 코어 컨트롤러 등록
    this.controllerRegistry.register(new PinballLauncherController());
    this.controllerRegistry.register(new AngleDialController());

    // 코어 표준 compute 메서드 등록
    this.computeRegistry.registerVector('uniform', uniformVectorField);
    this.computeRegistry.registerVector('gravity', gravityVectorField);

    this.themeMode = config.theme ?? 'light';
    this.theme = getTheme(this.themeMode);
    this.i18n = new I18nResolver(config.lang ?? 'ko', config.dictionary ?? {});

    for (const plugin of config.plugins ?? []) {
      this.pluginManager.register(plugin);
    }
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.theme = getTheme(mode);
  }

  getThemeMode(): ThemeMode {
    return this.themeMode;
  }

  setLang(lang: string, dictionary?: Dictionary): void {
    this.i18n = new I18nResolver(lang, dictionary ?? {});
  }
}

export function createHost(config?: HostConfig): Host {
  return new Host(config ?? {});
}
