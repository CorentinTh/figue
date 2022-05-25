import { describe, expect, it } from 'vitest';
import { flattenSchema, figue } from './figue';

describe('flattenSchema', () => {
  describe('when an empty schema is passed', () => {
    it('should return an empty array', () => {
      const flatSchema = flattenSchema({});

      expect(flatSchema).toHaveLength(0);
    });
  });

  describe('when a schema with only one depth items is passed', () => {
    it('should return an array of schema', () => {
      const flatSchema = flattenSchema({
        foo: {
          format: 'integer',
          default: 1,
        },
        bar: {
          format: 'integer',
          default: 1,
        },
      });

      expect(flatSchema).toHaveLength(2);
      expect(flatSchema).toEqual([
        {
          path: ['foo'],
          schema: {
            format: 'integer',
            default: 1,
          },
        },
        {
          path: ['bar'],
          schema: {
            format: 'integer',
            default: 1,
          },
        },
      ]);
    });

    describe('when a deep schema is  passed', () => {
      it('should return an array of schema', () => {
        const flatSchema = flattenSchema({
          baz: {
            foo: {
              format: 'integer',
              default: 1,
            },
            bar: {
              format: 'integer',
              default: 1,
            },
          },
          lorem: {
            ipsum: {
              dolor: {
                format: 'integer',
                default: 1,
              },
            },
          },
        });

        expect(flatSchema).toHaveLength(3);
        expect(flatSchema).toEqual([
          {
            path: ['baz', 'foo'],
            schema: {
              format: 'integer',
              default: 1,
            },
          },
          {
            path: ['baz', 'bar'],
            schema: {
              format: 'integer',
              default: 1,
            },
          },
          {
            path: ['lorem', 'ipsum', 'dolor'],
            schema: {
              format: 'integer',
              default: 1,
            },
          },
        ]);
      });
    });
  });
});

describe('figue', () => {
  describe('getConfig', () => {
    describe('value order', () => {
      it('when a env value is present the config variable should have the value of the env value', () => {
        const config = figue({
          foo: {
            format: 'integer',
            default: 1,
            env: 'FOO',
          },
        })
          .loadEnv({ FOO: 2 })
          .loadConfig({ foo: 3 })
          .getConfig();

        expect(config).toEqual({ foo: 2 });
      });

      it('when a env value is not present the config variable should have the value of the config arg', () => {
        const config = figue({
          foo: {
            format: 'integer',
            default: 1,
            env: 'FOO',
          },
        })
          .loadEnv({})
          .loadConfig({ foo: 3 })
          .getConfig();

        expect(config).toEqual({ foo: 3 });
      });

      it('when a env value an a config arg are not present the config variable should have the default value', () => {
        const config = figue({
          foo: {
            format: 'integer',
            default: 1,
            env: 'FOO',
          },
        })
          .loadEnv({})
          .loadConfig({})
          .getConfig();

        expect(config).toEqual({ foo: 1 });
      });
    });

    it('return the config', () => {
      const config = figue({
        foo: {
          bar: {
            format: 'integer',
            default: 1,
          },
          baz: {
            format: 'string',
            default: 'yo',
          },
        },
      }).getConfig();

      expect(config).toEqual({ foo: { bar: 1, baz: 'yo' } });
    });

    it('return the config', () => {
      const config = figue({
        db: {
          format: 'integer',
          default: 1,
          env: 'key',
        },
      })
        .loadEnv({ key: 2 })
        .getConfig();

      expect(config).toEqual({ db: 2 });
    });

    it('should validate', () => {
      const config = figue({
        db: {
          format: 'integer',
          default: 1,
          env: 'key',
        },
      })
        .loadEnv({ key: '2' })
        .validate()
        .getConfig();

      expect(config).toEqual({ db: 2 });
    });

    it('should config', () => {
      const config = figue({
        db: {
          format: 'integer',
          default: 1,
          env: 'key',
        },
      })
        .loadConfig({ db: 2 })
        .validate()
        .getConfig();

      expect(config).toEqual({ db: 2 });
    });

    it('should config', () => {
      const config = figue({
        db: {
          format: 'custom',
          default: 1,
          coerce: (value) => value.toString().split(','),
          env: 'key',
        },
      })
        .loadEnv({ key: 'a,b,c' })
        .validate()
        .getConfig();

      expect(config).toEqual({ db: ['a', 'b', 'c'] });
    });
  });
});
