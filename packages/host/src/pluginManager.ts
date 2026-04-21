import type {
  Plugin as SchemaPlugin,
  ScalarComputeFn,
  VectorComputeFn,
} from '@aperi21/schema';
import type { ComputeRegistry } from './compute/registry';
import type { RendererRegistry } from './renderer/registry';

/**
 * 호스트에서 쓰는 확장 Plugin 인터페이스. `docs/07-plugin-design.md` §2 에 따라
 * schema 의 최소 Plugin 에 수명 주기 훅·의존성·유틸리티 필드를 얹었다.
 */
export interface HostPlugin extends SchemaPlugin {
  version?: string;
  zHints?: Record<string, number>;
  utilities?: Record<string, unknown>;
  requires?: string[];
  conflicts?: string[];
  onRegister?(api: HostAPI): void;
  onUnregister?(): void;
}

export interface Logger {
  warn(msg: string): void;
  info(msg: string): void;
}

/**
 * Plugin 등록 시 전달되는 호스트 조작 인터페이스. Plugin 은 onRegister 훅에서
 * 이 API 를 통해 추가 등록이나 로깅을 수행한다.
 */
export interface HostAPI {
  registerComputeMethod(kind: 'vector', name: string, fn: VectorComputeFn): void;
  registerComputeMethod(kind: 'scalar', name: string, fn: ScalarComputeFn): void;
  registerUtility(pluginId: string, key: string, value: unknown): void;
  getService<T>(id: string): T | undefined;
  logger: Logger;
}

interface RegistrationRecord {
  plugin: HostPlugin;
  rendererTypes: string[];
  vectorComputeNames: string[];
  scalarComputeNames: string[];
  utilityKeys: string[];
}

/** 호스트 입장에서 Plugin 한 개 등록을 관리하는 서브시스템. */
export class PluginManager {
  private readonly plugins = new Map<string, HostPlugin>();
  private readonly records = new Map<string, RegistrationRecord>();
  private readonly utilities = new Map<string, Map<string, unknown>>();

  constructor(
    private readonly rendererRegistry: RendererRegistry,
    private readonly computeRegistry: ComputeRegistry,
    private readonly logger: Logger,
  ) {}

  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  get(pluginId: string): HostPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  list(): HostPlugin[] {
    return [...this.plugins.values()];
  }

  getUtility<T = unknown>(pluginId: string, key: string): T | undefined {
    return this.utilities.get(pluginId)?.get(key) as T | undefined;
  }

  register(plugin: HostPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`[aperi21] plugin '${plugin.id}' already registered`);
    }

    // 의존성 확인
    for (const required of plugin.requires ?? []) {
      if (!this.plugins.has(required)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' requires '${required}' which is not registered`,
        );
      }
    }

    // 충돌 확인
    for (const conflicting of plugin.conflicts ?? []) {
      if (this.plugins.has(conflicting)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' conflicts with already registered '${conflicting}'`,
        );
      }
    }

    // 프리미티브 타입 네임스페이스 충돌 확인
    for (const type of plugin.primitiveTypes) {
      if (this.rendererRegistry.has(type)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register primitive type '${type}' which is already taken`,
        );
      }
    }

    // computeMethods 네임스페이스 충돌 확인
    const vectorNames = Object.keys(plugin.computeMethods?.vector ?? {});
    const scalarNames = Object.keys(plugin.computeMethods?.scalar ?? {});
    for (const name of vectorNames) {
      if (this.computeRegistry.hasVector(name)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register vector compute '${name}' which is already taken`,
        );
      }
    }
    for (const name of scalarNames) {
      if (this.computeRegistry.hasScalar(name)) {
        throw new Error(
          `[aperi21] plugin '${plugin.id}' tries to register scalar compute '${name}' which is already taken`,
        );
      }
    }

    const record: RegistrationRecord = {
      plugin,
      rendererTypes: [],
      vectorComputeNames: [],
      scalarComputeNames: [],
      utilityKeys: [],
    };

    try {
      // 렌더러 등록
      for (const type of plugin.primitiveTypes) {
        const renderer = plugin.renderers[type];
        if (!renderer) {
          throw new Error(
            `[aperi21] plugin '${plugin.id}' declares primitive type '${type}' but provides no renderer`,
          );
        }
        const zHint = plugin.zHints?.[type];
        this.rendererRegistry.register(type, renderer, zHint);
        record.rendererTypes.push(type);
      }

      // compute 등록
      for (const [name, fn] of Object.entries(plugin.computeMethods?.vector ?? {})) {
        this.computeRegistry.registerVector(name, fn);
        record.vectorComputeNames.push(name);
      }
      for (const [name, fn] of Object.entries(plugin.computeMethods?.scalar ?? {})) {
        this.computeRegistry.registerScalar(name, fn);
        record.scalarComputeNames.push(name);
      }

      // 유틸리티 등록
      if (plugin.utilities) {
        const bucket = new Map<string, unknown>();
        for (const [key, value] of Object.entries(plugin.utilities)) {
          bucket.set(key, value);
          record.utilityKeys.push(key);
        }
        this.utilities.set(plugin.id, bucket);
      }

      // onRegister 훅
      plugin.onRegister?.(this.buildHostAPI());

      this.plugins.set(plugin.id, plugin);
      this.records.set(plugin.id, record);
      this.logger.info(`[aperi21] plugin '${plugin.id}' registered`);
    } catch (err) {
      // 전체 롤백
      this.rollback(record);
      throw err;
    }
  }

  unregister(pluginId: string): void {
    const record = this.records.get(pluginId);
    if (!record) return;

    try {
      record.plugin.onUnregister?.();
    } catch (err) {
      this.logger.warn(
        `[aperi21] plugin '${pluginId}' onUnregister threw: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    this.rollback(record);
    this.plugins.delete(pluginId);
    this.records.delete(pluginId);
  }

  private rollback(record: RegistrationRecord): void {
    for (const type of record.rendererTypes) {
      this.rendererRegistry.unregister(type);
    }
    for (const name of record.vectorComputeNames) {
      this.computeRegistry.unregisterVector(name);
    }
    for (const name of record.scalarComputeNames) {
      this.computeRegistry.unregisterScalar(name);
    }
    if (record.utilityKeys.length > 0) {
      this.utilities.delete(record.plugin.id);
    }
  }

  private buildHostAPI(): HostAPI {
    const computeRegistry = this.computeRegistry;
    const utilities = this.utilities;
    const logger = this.logger;

    return {
      registerComputeMethod(kind: 'vector' | 'scalar', name: string, fn: unknown) {
        if (kind === 'vector') {
          computeRegistry.registerVector(name, fn as VectorComputeFn);
        } else {
          computeRegistry.registerScalar(name, fn as ScalarComputeFn);
        }
      },
      registerUtility(pluginId: string, key: string, value: unknown) {
        const bucket = utilities.get(pluginId) ?? new Map<string, unknown>();
        bucket.set(key, value);
        utilities.set(pluginId, bucket);
      },
      getService<T>(_id: string): T | undefined {
        // Phase 2 에서 Controller/Time/Camera 서비스가 추가될 때 구현.
        return undefined;
      },
      logger,
    };
  }
}
