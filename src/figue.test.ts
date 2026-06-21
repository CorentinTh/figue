import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import { defineConfig, validator } from './figue';

describe('figue tests', () => {
  describe('defineConfig', () => {
    test('simple valid config without default', () => {
      const { config } = defineConfig(
        {
          foo: {
            bar: {
              schema: z.string(),
              env: 'BAR',
            },
          },
          baz: {
            schema: z.coerce.number(),
            env: 'BAZ',
          },
        },
        {
          envSource: {
            BAR: 'bar',
            BAZ: '42',
          },
        },
      );

      expect(config).toEqual({
        foo: {
          bar: 'bar',
        },
        baz: 42,
      });
    });

    test('when a provided config is not valid, an error is thrown', () => {
      expect(() => defineConfig({
        foo: {
          schema: z.string(),
        },
        bar: {
          schema: z.url(),
          env: 'BAR',
        },
      }, {
        envSource: {
          BAR: 'bar',
        },
      })).toThrow('foo: Invalid input: expected string, received undefined\nbar (BAR): Invalid URL');

      expect(() => defineConfig({
        foo: {
          schema: z.string(),
          env: 'FOO',
        },
      })).toThrow('foo (FOO): Invalid input: expected string, received undefined');
    });

    test('default value can be defined with zod default or using the default key', () => {
      const { config } = defineConfig({
        foo: {
          bar: {
            schema: z.string().default('default'),
          },
        },
        baz: {
          schema: z.coerce.number(),
          default: 42,
        },
      });

      expect(config).toEqual({
        foo: {
          bar: 'default',
        },
        baz: 42,
      });
    });

    test('getDefaults can be used to define defaults', () => {
      const { config } = defineConfig({
        foo: {
          bar: {
            schema: z.string().default('baz'),
          },
          biz: {
            schema: z.string(),
          },
          bep: {
            schema: z.string(),
            env: 'BEP',
          },
        },
      }, {
        getDefaults: () => ({
          foo: {
            biz: 'bul',
          },
        }),
        envSource: {
          BEP: '42',
        },
      });

      expect(config).toEqual({
        foo: {
          bar: 'baz',
          biz: 'bul',
          bep: '42',
        },
      });
    });

    test('getDefaults args can be used to define defaults', () => {
      let isGetDefaultsCalled = false;

      defineConfig({
        foo: {
          bar: {
            schema: z.string(),
            default: 'baz',
          },
          biz: {
            schema: z.string(),
            default: 'bul',
          },
          bep: {
            schema: z.string(),
            env: 'BEP',
          },
        },
      }, {
        getDefaults: (args) => {
          isGetDefaultsCalled = true;

          expect(args).to.eql({
            config: {
              foo: {
                bar: 'baz',
                biz: 'bul',
                bep: '42',
              },
            },
            configDefaults: {
              foo: {
                bar: 'baz',
                biz: 'bul',
                bep: undefined,
              },
            },
            envConfig: {
              foo: {
                bar: undefined,
                biz: undefined,
                bep: '42',
              },
            },
          });

          return {
            foo: {
              biz: 'bul',
            },
          };
        },
        envSource: {
          BEP: '42',
        },
      });

      expect(isGetDefaultsCalled).toBe(true);
    });
  });

  describe('the env option can be an array of env variables', () => {
    test('the first env variable found is used', () => {
      const { config } = defineConfig({
        value: {
          schema: z.any(),
          env: ['NOT_EXISTING', 'BAR', 'ALSO_NOT_EXISTING', 'FOO'],
          default: 'default',
        },
      }, {
        envSource: {
          FOO: 'foo',
          BAR: 'bar',
        },
      });

      expect(config).toEqual({
        value: 'bar',
      });
    });

    test('if an env variable exists but is empty, it is used', () => {
      const { config } = defineConfig({
        value: {
          schema: z.any(),
          env: ['NOT_EXISTING', 'BAR', 'ALSO_NOT_EXISTING', 'FOO'],
        },
      }, {
        envSource: {
          FOO: 'foo',
          BAR: undefined,
        },
      });

      expect(config).toEqual({
        value: undefined,
      });
    });

    test('if an env variable exists but is falsy, it is used', () => {
      const { config } = defineConfig({
        value: {
          schema: z.any(),
          env: ['NOT_EXISTING', 'BAR', 'ALSO_NOT_EXISTING', 'FOO'],
        },
      }, {
        envSource: {
          FOO: 'foo',
          BAR: false,
        },
      });

      expect(config).toEqual({
        value: false,
      });
    });
  });

  describe('any validation libraries can be used', () => {
    test('you can merge some schema from zod and some from valibot', () => {
      const { config } = defineConfig({
        foo: {
          schema: z.string(),
          default: 'foo',
          doc: 'The foo config',
        },
        bar: {
          schema: v.string(),
          default: 'bar',
          doc: 'The bar config',
        },
      });

      expect(config).toEqual({
        foo: 'foo',
        bar: 'bar',
      });
    });
  });

  describe('per-field validate (cross-field rules)', () => {
    test('a string return becomes the issue message', () => {
      type Cfg = { adapters: { id: string; url: string }[]; defaultAdapterId: string };

      expect(() => defineConfig({
        adapters: {
          schema: v.array(v.object({ id: v.string(), url: v.string() })),
          default: [{ id: 'a', url: 'https://a' }],
        },
        defaultAdapterId: {
          schema: v.string(),
          default: 'missing',
          env: 'DEFAULT_ADAPTER_ID',
          validate: validator<Cfg>(({ value, config }) => {
            if (!config.adapters.some(a => a.id === value)) {
              return `must match one of adapters[].id (got "${value}")`;
            }
          }),
        },
      })).toThrow('defaultAdapterId (DEFAULT_ADAPTER_ID): must match one of adapters[].id (got "missing")');
    });

    test('a thrown error is caught and surfaced as an issue', () => {
      expect(() => defineConfig({
        port: {
          schema: z.number(),
          default: 0,
          validate: ({ value }) => {
            if (value === 0) {
              throw new Error('port must not be zero');
            }
          },
        },
      })).toThrow('port: port must not be zero');
    });

    test('an object return can override the path', () => {
      expect(() => defineConfig({
        a: {
          schema: z.string(),
          default: 'x',
          validate: () => ({ message: 'cross-field error', path: ['somewhere', 'else'] }),
        },
      })).toThrow('somewhere.else: cross-field error');
    });

    test('returning void/true passes', () => {
      const { config } = defineConfig({
        a: {
          schema: z.string(),
          default: 'ok',
          validate: () => undefined,
        },
        b: {
          schema: z.string(),
          default: 'ok',
          validate: () => true,
        },
      });

      expect(config).toEqual({ a: 'ok', b: 'ok' });
    });

    test('returning false produces a generic issue', () => {
      expect(() => defineConfig({
        a: {
          schema: z.string(),
          default: 'x',
          validate: () => false,
        },
      })).toThrow('a: Validation failed at a');
    });

    test('validate is skipped when schema validation already failed', () => {
      const validateSpy = vi.fn();

      expect(() => defineConfig({
        a: {
          schema: z.string(),
        },
        b: {
          schema: z.string(),
          default: 'b',
          validate: validateSpy,
        },
      })).toThrow();

      expect(validateSpy).not.toHaveBeenCalled();
    });

    test('runs on nested leaves and receives the full config', () => {
      type Cfg = { adapters: { id: string }[]; nested: { defaultId: string } };
      let seenConfig: unknown;

      expect(() => defineConfig({
        adapters: {
          schema: v.array(v.object({ id: v.string() })),
          default: [{ id: 'a' }],
        },
        nested: {
          defaultId: {
            schema: v.string(),
            default: 'nope',
            validate: validator<Cfg>(({ value, config }) => {
              seenConfig = config;
              if (!config.adapters.some(a => a.id === value)) {
                return 'unknown id';
              }
            }),
          },
        },
      })).toThrow('nested.defaultId: unknown id');

      expect(seenConfig).toEqual({
        adapters: [{ id: 'a' }],
        nested: { defaultId: 'nope' },
      });
    });

    test('multiple validate issues are merged in a single error', () => {
      expect(() => defineConfig({
        a: {
          schema: z.string(),
          default: 'x',
          validate: () => 'first',
        },
        b: {
          schema: z.string(),
          default: 'y',
          validate: () => [{ message: 'second' }, { message: 'third' }],
        },
      })).toThrow('a: first\nb: second\nb: third');
    });

    test('validator helper provides typed config', () => {
      type Config = { adapters: { id: string }[]; defaultAdapterId: string };

      const { config } = defineConfig({
        adapters: {
          schema: v.array(v.object({ id: v.string() })),
          default: [{ id: 'a' }],
        },
        defaultAdapterId: {
          schema: v.string(),
          default: 'a',
          validate: validator<Config>(({ value, config }) => {
            if (!config.adapters.some(a => a.id === value)) {
              return 'unknown adapter id';
            }
          }),
        },
      });

      expect(config).toEqual({ adapters: [{ id: 'a' }], defaultAdapterId: 'a' });
    });
  });
});
