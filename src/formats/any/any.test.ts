import { describe, expect, it } from 'vitest';
import { format, SchemaObjAny } from './any';

describe('anyFormat', () => {
  describe('validate', () => {
    it('should return true every time', () => {
      const { validate } = format;

      const validateProxy = (v: unknown) => validate(v, {} as SchemaObjAny);

      expect(validateProxy(-10000)).toBe(true);
      expect(validateProxy(-1)).toBe(true);
      expect(validateProxy(0)).toBe(true);
      expect(validateProxy(1)).toBe(true);
      expect(validateProxy(1000)).toBe(true);
      expect(validateProxy(1.0)).toBe(true);
      expect(validateProxy(1.1)).toBe(true);
      expect(validateProxy(-1.1)).toBe(true);
      expect(validateProxy(null)).toBe(true);
      expect(validateProxy(NaN)).toBe(true);
      expect(validateProxy('-1')).toBe(true);
      expect(validateProxy('0')).toBe(true);
      expect(validateProxy('1')).toBe(true);
      expect(validateProxy('')).toBe(true);
      expect(validateProxy(/^/)).toBe(true);
      expect(validateProxy({})).toBe(true);
      expect(validateProxy([])).toBe(true);
      expect(validateProxy(undefined)).toBe(true);
      expect(validateProxy(Infinity)).toBe(true);
      expect(validateProxy(-Infinity)).toBe(true);
    });
  });
});
