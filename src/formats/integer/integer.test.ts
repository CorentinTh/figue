import { describe, expect, it } from 'vitest';
import { format, SchemaObjInteger } from './integer';

describe('integerFormat', () => {
  describe('validate', () => {
    it('should return true when an integer is passed a parameter, false otherwise', () => {
      const { validate } = format;

      const validateProxy = (v: unknown) => validate(v, {} as SchemaObjInteger);

      expect(validateProxy(-10000)).toBe(true);
      expect(validateProxy(-1)).toBe(true);
      expect(validateProxy(0)).toBe(true);
      expect(validateProxy(1)).toBe(true);
      expect(validateProxy(1000)).toBe(true);
      expect(validateProxy(1.0)).toBe(true);

      expect(validateProxy(null)).toBe(false);
      expect(validateProxy(NaN)).toBe(false);
      expect(validateProxy(1.1)).toBe(false);
      expect(validateProxy(-1.1)).toBe(false);
      expect(validateProxy('-1')).toBe(false);
      expect(validateProxy('0')).toBe(false);
      expect(validateProxy('1')).toBe(false);
      expect(validateProxy('')).toBe(false);
      expect(validateProxy(/^/)).toBe(false);
      expect(validateProxy({})).toBe(false);
      expect(validateProxy([])).toBe(false);
      expect(validateProxy(undefined)).toBe(false);
      expect(validateProxy(Infinity)).toBe(false);
      expect(validateProxy(-Infinity)).toBe(false);
    });
  });
});
