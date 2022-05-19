import { describe, expect, it } from 'vitest';
import { format, SchemaObjString } from './string';

describe('stringFormat', () => {
  describe('validate', () => {
    it('should return true when a string is passed a parameter, false otherwise', () => {
      const { validate } = format;

      const validateProxy = (v: unknown) => validate(v, {} as SchemaObjString);

      expect(validateProxy('foo')).toBe(true);
      expect(validateProxy('')).toBe(true);
      expect(validateProxy('-1')).toBe(true);
      expect(validateProxy('0')).toBe(true);
      expect(validateProxy('1')).toBe(true);

      expect(validateProxy(-10000)).toBe(false);
      expect(validateProxy(-1)).toBe(false);
      expect(validateProxy(0)).toBe(false);
      expect(validateProxy(1)).toBe(false);
      expect(validateProxy(1000)).toBe(false);
      expect(validateProxy(1.0)).toBe(false);
      expect(validateProxy(1.1)).toBe(false);
      expect(validateProxy(-1.1)).toBe(false);
      expect(validateProxy(null)).toBe(false);
      expect(validateProxy(NaN)).toBe(false);
      expect(validateProxy(/^/)).toBe(false);
      expect(validateProxy({})).toBe(false);
      expect(validateProxy([])).toBe(false);
      expect(validateProxy(undefined)).toBe(false);
      expect(validateProxy(Infinity)).toBe(false);
      expect(validateProxy(-Infinity)).toBe(false);
    });
  });
});
