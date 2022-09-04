import { describe, expect, it } from 'vitest';
import { buildEnvObject, figue, getEnvMapper } from './figue';

describe('figue tests', () => {
  describe('getEnvMapper', () => {
    it('flatten a schema to a record', () => {
      const schema = {
        type: 'object',
        properties: {
          a: {
            type: 'string',
            env: 'ENV_A',
          },
          b: {
            type: 'object',
            properties: {
              c: {
                type: 'number',
                env: 'ENV_C',
              },
            },
          },
        },
      } as const;

      const expectedEnvMapper = {
        ENV_A: 'a',
        ENV_C: 'b.c',
      };

      const envMapper = getEnvMapper({ schema });

      expect(envMapper).to.eql(expectedEnvMapper);
    });
  });

  describe('buildEnvObject', () => {
    it('build an object from an envMapper', () => {
      const envVariables = {
        ENV_A: 'foo',
        ENV_B: 'bar',
        ENV_C: 'baz',
      };

      const envMapper = {
        ENV_A: 'a',
        ENV_C: 'b.c',
      };

      const expectedObject = {
        a: 'foo',
        b: { c: 'baz' },
      };

      const builtObject = buildEnvObject({ envVariables, envMapper });

      expect(builtObject).to.eql(expectedObject);
    });

    it('return an empty object if their is no intersection with envMapper', () => {
      const envVariables = {
        ENV_A: 'foo',
        ENV_B: 'bar',
        ENV_C: 'baz',
      };

      const envMapper = {
        otherKey: 'p.o',
      };

      const expectedObject = {};

      const builtObject = buildEnvObject({ envVariables, envMapper });

      expect(builtObject).to.eql(expectedObject);
    });
  });

  describe('figue', () => {
    it('parses defaults args', () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'value' },
        },
      } as const;

      const config = figue(schema).getConfig();
      const expectedConfig = { a: 'value' };

      expect(config).to.eql(expectedConfig);
    });

    it('create config with value from env ', () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'default value', env: 'ENV_A' },
          b: {
            type: 'object',
            properties: {
              c: {
                type: 'number',
                env: 'ENV_C',
              },
            },
          },
        },
      } as const;

      const env = {
        ENV_A: 'value A from env',
        ENV_C: 'value C from env',
      };

      const config = figue(schema).loadEnv(env).getConfig();
      const expectedConfig = { a: 'value A from env', b: { c: 'value C from env' } };

      expect(config).to.eql(expectedConfig);
    });

    it('replace config with value from the loaded config ', () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'default value', env: 'ENV_A' },
          b: {
            type: 'object',
            properties: {
              c: {
                type: 'number',
                env: 'ENV_C',
              },
            },
          },
        },
      } as const;

      const configToLoad = {
        a: 'foo',
        b: { c: 'bar' },
      };

      const config = figue(schema).loadConfig(configToLoad).getConfig();
      const expectedConfig = { a: 'foo', b: { c: 'bar' } };

      expect(config).to.eql(expectedConfig);
    });

    it('takes env value in priority', () => {
      const schema = {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'default value', env: 'ENV_A' },
          b: {
            type: 'object',
            properties: {
              c: {
                type: 'number',
                env: 'ENV_C',
              },
              d: {
                type: 'number',
                default: 'd default',
              },
            },
          },
        },
      } as const;

      const configToLoad = {
        a: 'foo',
        b: { c: 'bar' },
      };

      const env = {
        ENV_A: 'value A from env',
      };

      const config = figue(schema).loadConfig(configToLoad).loadEnv(env).getConfig();
      const expectedConfig = { a: 'value A from env', b: { c: 'bar', d: 'd default' } };

      expect(config).to.eql(expectedConfig);
    });
  });
});
