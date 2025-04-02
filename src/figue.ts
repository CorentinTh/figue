import type { StandardSchemaV1 } from '@standard-schema/spec';
import { createConfigValidationError } from './figue.errors';
import { castArray, mapValues, mergeDeep } from './utils';
import type { ConfigDefinition, ConfigDefinitionElement, EnvRecord, InferSchemaType } from './figue.types';
import type { Falsy } from './types';

export { defineConfig };

function validateConfig({ configDefinition, configValues }: { configDefinition: ConfigDefinition; configValues: Record<string, unknown> }): { config: unknown; issues: ReadonlyArray<StandardSchemaV1.Issue> } {
  const issues: StandardSchemaV1.Issue[] = [];

  function validateRecursive({ definition, values, path = [] }: { definition: ConfigDefinition; values: Record<string, unknown>; path?: string[] }): unknown {
    const result: Record<string, unknown> = {};

    for (const key in definition) {
      const currentPath = [...path, key];
      const value = values[key];
      const defElement = definition[key];

      if (isConfigDefinitionElement(defElement)) {
        const validation = defElement.schema['~standard'].validate(value);

        if (validation instanceof Promise) {
          throw new TypeError('Schema validation must be synchronous');
        }

        if (validation.issues) {
          issues.push(...validation.issues.map(issue => ({ ...issue, path: currentPath })));
        } else {
          result[key] = validation.value;
        }
      } else {
        if (typeof value === 'object' && value !== null) {
          result[key] = validateRecursive(
            { definition: defElement as ConfigDefinition, values: value as Record<string, unknown>, path: currentPath },
          );
        } else {
          issues.push({ message: 'Expected object', path: currentPath });
        }
      }
    }

    return result;
  }

  const config = validateRecursive({ definition: configDefinition, values: configValues });

  return { issues, config };
}

function isConfigDefinitionElement(config: unknown): config is ConfigDefinitionElement {
  return (
    typeof config === 'object'
    && config !== null
    && 'schema' in config
    && typeof config.schema === 'object'
    && config.schema !== null
    && '~standard' in config.schema
  );
}

function buildEnvConfig({ configDefinition, env }: { configDefinition: ConfigDefinition; env: EnvRecord }): Record<string, unknown> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { env: envKey } = config;

      if (envKey === undefined) {
        return undefined;
      }

      const value = env[envKey as string];
      return value;
    } else {
      return buildEnvConfig({ configDefinition: config, env });
    }
  });
}

function getConfigDefaults({ configDefinition }: { configDefinition: ConfigDefinition }): Record<string, unknown> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { default: defaultValue } = config;

      return defaultValue;
    } else {
      return getConfigDefaults({
        configDefinition: config,
      });
    }
  });
}

const isNotFalsy = <T>(value: T | Falsy): value is T => Boolean(value);

function buildDefaultsConfig(
  {
    rawDefaults,
    getDefaults,
    envConfig,
    configDefaults,
  }: {
    rawDefaults: (Record<string, unknown> | Falsy)[] | Record<string, unknown>;
    envConfig: Record<string, unknown>;
    configDefaults: Record<string, unknown>;
    getDefaults?: ((args: {
      configDefaults: Record<string, unknown>;
      envConfig: Record<string, unknown>;
      config: Record<string, unknown>;
    }) => (Record<string, unknown> | Falsy)[] | Record<string, unknown>);
  },
): Record<string, unknown> {
  const config = mergeDeep(configDefaults, envConfig);
  const defaults = castArray(rawDefaults).filter(isNotFalsy);

  const gotDefaultsRaw = getDefaults?.({ configDefaults, envConfig, config });
  const gotDefaults = castArray(gotDefaultsRaw).filter(isNotFalsy);

  return mergeDeep(...defaults, ...gotDefaults);
}

function defineConfig<T extends ConfigDefinition, Config extends Record<string, unknown> = InferSchemaType<T>>(
  configDefinition: T,
  {
    envSources = [],
    envSource = {},
    defaults: rawDefaults = [],
    priority = 'env',
    getDefaults,
  }: {
    envSources?: EnvRecord[];
    envSource?: EnvRecord;
    defaults?: (Record<string, unknown> | Falsy)[] | Record<string, unknown>;
    getDefaults?: ((args: {
      configDefaults: Record<string, unknown>;
      envConfig: Record<string, unknown>;
      config: Record<string, unknown>;
    }) => (Record<string, unknown> | Falsy)[] | Record<string, unknown>);
    priority?: 'env' | 'defaults';
  } = {},
) {
  const env: EnvRecord = [...envSources, envSource].reduce((acc, env) => ({ ...acc, ...env }), {});

  // The default config coming from zod schema defaults
  const configDefaults = getConfigDefaults({ configDefinition });

  // The config coming from env variables
  const envConfig = buildEnvConfig({ configDefinition, env });

  // The config coming from defaults and getDefaults arguments
  const defaultsConfig = buildDefaultsConfig({ rawDefaults, envConfig, configDefaults, getDefaults });

  const mergedConfig = priority === 'env'
    ? mergeDeep(configDefaults, envConfig, defaultsConfig)
    : mergeDeep(configDefaults, defaultsConfig, envConfig);

  const { issues, config } = validateConfig({ configDefinition, configValues: mergedConfig });

  if (issues.length > 0) {
    throw createConfigValidationError({ issues });
  }

  return { config: config as Config, env, envConfig };
}
