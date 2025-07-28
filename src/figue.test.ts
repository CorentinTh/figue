import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { defineConfig } from './figue';

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
});
