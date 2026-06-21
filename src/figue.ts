import type { ConfigDefinition, ConfigDefinitionElement, ConfigIssue, EnvRecord, InferSchemaType, ValidateFn, ValidateResult } from './figue.types';
import type { Falsy } from './types';
import { createConfigValidationError } from './figue.errors';
import { castArray, mapValues, mergeDeep } from './utils';

function validateConfig({
  configDefinition,
  configValues,
  path = [],
}: {
  configDefinition: ConfigDefinition;
  configValues: Record<string, unknown>;
  path?: string[];
}) {
  const config: Record<string, unknown> = {};
  const issues: ConfigIssue[] = [];

  for (const key in configDefinition) {
    const currentPath = [...path, key];
    const value = configValues[key];
    const definition = configDefinition[key] as ConfigDefinitionElement;

    const nestedResult = validateConfigElement({ definition, value, currentPath });

    config[key] = nestedResult.config;
    issues.push(...nestedResult.issues);
  }

  return { config, issues };
}

function validateConfigDefinitionElement({
  definition,
  value,
  currentPath,
}: {
  definition: ConfigDefinitionElement;
  value: unknown;
  currentPath: string[];
}): { config?: unknown; issues: ConfigIssue[] } {
  const validation = definition.schema['~standard'].validate(value);

  // Guard against async validation supported by standard schema
  if (validation instanceof Promise) {
    throw new TypeError('Schema validation must be synchronous');
  }

  if (validation.issues) {
    return { issues: validation.issues.map(issue => ({ ...issue, path: currentPath, definition })) };
  }

  return { config: validation.value, issues: [] };
}

function validateConfigElement({
  definition,
  value,
  currentPath,
}: {
  definition: ConfigDefinitionElement;
  value: unknown;
  currentPath: string[];
}): { config?: unknown; issues: ConfigIssue[] } {
  // Handle config leaf
  if (isConfigDefinitionElement(definition)) {
    return validateConfigDefinitionElement({ definition, value, currentPath });
  }

  // Handle config non-leaf node
  if (typeof value === 'object' && value !== null) {
    return validateConfig({
      configDefinition: definition as ConfigDefinition,
      configValues: value as Record<string, unknown>,
      path: currentPath,
    });
  }

  return {
    issues: [
      {
        path: currentPath,
        message: `Expected object with schema at ${currentPath.join('.')}, got ${typeof value}`,
      },
    ],
  };
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

export function validator<Config = any, Value = any>(fn: ValidateFn<Value, Config>): ValidateFn<Value, Config> {
  return fn;
}

function normalizeValidateResult({ result, currentPath, definition }: { result: ValidateResult; currentPath: string[]; definition: ConfigDefinitionElement }): ConfigIssue[] {
  if (result === undefined || result === null || result === true) {
    return [];
  }

  if (result === false) {
    return [{ path: currentPath, message: `Validation failed at ${currentPath.join('.')}`, definition }];
  }

  if (typeof result === 'string') {
    return [{ path: currentPath, message: result, definition }];
  }

  const issues = Array.isArray(result) ? result : [result];

  return issues.map(issue => ({
    path: issue.path ?? currentPath,
    message: issue.message,
    definition,
  }));
}

function runValidateHooks({
  configDefinition,
  config,
  fullConfig,
  path = [],
}: {
  configDefinition: ConfigDefinition;
  config: Record<string, unknown>;
  fullConfig: Record<string, unknown>;
  path?: string[];
}): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  for (const key in configDefinition) {
    const currentPath = [...path, key];
    const definition = configDefinition[key] as ConfigDefinitionElement;
    const value = config[key];

    if (isConfigDefinitionElement(definition)) {
      if (typeof definition.validate !== 'function') {
        continue;
      }

      try {
        const result = definition.validate({ value, config: fullConfig });
        issues.push(...normalizeValidateResult({ result, currentPath, definition }));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        issues.push({ path: currentPath, message, definition });
      }
    } else if (typeof value === 'object' && value !== null) {
      issues.push(...runValidateHooks({
        configDefinition: definition as ConfigDefinition,
        config: value as Record<string, unknown>,
        fullConfig,
        path: currentPath,
      }));
    }
  }

  return issues;
}

function buildEnvConfig({ configDefinition, env }: { configDefinition: ConfigDefinition; env: EnvRecord }): Record<string, unknown> {
  return mapValues(configDefinition, (config) => {
    if (isConfigDefinitionElement(config)) {
      const { env: envKey } = config;

      if (envKey === undefined) {
        return undefined;
      }

      const envKeys = castArray(envKey);

      // Find the first environment variable that is set
      const key = envKeys.find(key => key in env);

      if (key === undefined) {
        return undefined;
      }

      return env[key];
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

export function defineConfig<T extends ConfigDefinition, Config extends Record<string, unknown> = InferSchemaType<T>>(
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

  const validateIssues = runValidateHooks({
    configDefinition,
    config,
    fullConfig: config,
  });

  if (validateIssues.length > 0) {
    throw createConfigValidationError({ issues: validateIssues });
  }

  return { config: config as Config, env, envConfig };
}
