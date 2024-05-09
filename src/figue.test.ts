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
  });
});
