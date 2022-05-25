import { describe, expect, it } from 'vitest';
import { format, SchemaObjArray } from './array';

describe('booleanFormat', () => {
  describe('validate', () => {
    it('should return false for everything since anything can be interpreted as boolean', () => {
      const { validate } = format;

      const validateProxy = (v: unknown) => validate(v, {} as SchemaObjArray);

      expect(validateProxy([])).toBe(true);
      expect(validateProxy(['a'])).toBe(true);
      expect(validateProxy(['a', 'a'])).toBe(true);

      expect(validateProxy(['a', 1])).toBe(false);

      expect(validateProxy(0)).toBe(false);
      expect(validateProxy(null)).toBe(false);
      expect(validateProxy(NaN)).toBe(false);
      expect(validateProxy('')).toBe(false);
      expect(validateProxy(undefined)).toBe(false);
      expect(validateProxy(false)).toBe(false);
      expect(validateProxy(true)).toBe(false);
      expect(validateProxy(-10000)).toBe(false);
      expect(validateProxy(-1)).toBe(false);
      expect(validateProxy(1)).toBe(false);
      expect(validateProxy(1000)).toBe(false);
      expect(validateProxy(1.0)).toBe(false);
      expect(validateProxy(1.1)).toBe(false);
      expect(validateProxy(-1.1)).toBe(false);
      expect(validateProxy('-1')).toBe(false);
      expect(validateProxy('0')).toBe(false);
      expect(validateProxy('1')).toBe(false);
      expect(validateProxy('')).toBe(false);
      expect(validateProxy(/^/)).toBe(false);
      expect(validateProxy({})).toBe(false);
      expect(validateProxy(Infinity)).toBe(false);
      expect(validateProxy(-Infinity)).toBe(false);
    });
  });

  describe('coerce', () => {
    it('should coerce value to bool', () => {
      const { coerce } = format;

      const coerceProxy = (v: unknown) => coerce(v, {} as SchemaObjArray);

      expect(coerceProxy('a,b,c')).toEqual(['a', 'b', 'c']);
      expect(coerceProxy('a,b ,c')).toEqual(['a', 'b ', 'c']);
      expect(coerceProxy('a,b d,c')).toEqual(['a', 'b d', 'c']);
      expect(coerceProxy('a')).toEqual(['a']);
      expect(coerceProxy('')).toEqual([]);
    });
  });
});
