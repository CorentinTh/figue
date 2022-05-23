import { describe, expect, it } from 'vitest';
import { format, SchemaObjBoolean } from './boolean';

describe('booleanFormat', () => {
  describe('validate', () => {
    it('should return true for everything since anything can be interpreted as boolean', () => {
      const { validate } = format;

      const validateProxy = (v: unknown) => validate(v, {} as SchemaObjBoolean);

      expect(validateProxy(0)).toBe(true);
      expect(validateProxy(null)).toBe(true);
      expect(validateProxy(NaN)).toBe(true);
      expect(validateProxy('')).toBe(true);
      expect(validateProxy(undefined)).toBe(true);
      expect(validateProxy(false)).toBe(true);
      expect(validateProxy(true)).toBe(true);
      expect(validateProxy(-10000)).toBe(true);
      expect(validateProxy(-1)).toBe(true);
      expect(validateProxy(1)).toBe(true);
      expect(validateProxy(1000)).toBe(true);
      expect(validateProxy(1.0)).toBe(true);
      expect(validateProxy(1.1)).toBe(true);
      expect(validateProxy(-1.1)).toBe(true);
      expect(validateProxy('-1')).toBe(true);
      expect(validateProxy('0')).toBe(true);
      expect(validateProxy('1')).toBe(true);
      expect(validateProxy('')).toBe(true);
      expect(validateProxy(/^/)).toBe(true);
      expect(validateProxy({})).toBe(true);
      expect(validateProxy([])).toBe(true);
      expect(validateProxy(Infinity)).toBe(true);
      expect(validateProxy(-Infinity)).toBe(true);
    });
  });

  describe('coerce', () => {
    it('should coerce value to bool', () => {
      const { coerce } = format;

      const coerceProxy = (v: unknown) => coerce(v, {} as SchemaObjBoolean);

      expect(coerceProxy(0)).toBe(false);
      expect(coerceProxy('false')).toBe(false);
      expect(coerceProxy('')).toBe(false);
      expect(coerceProxy('sdsq')).toBe(false);

      expect(coerceProxy('true ')).toBe(true);
      expect(coerceProxy('true')).toBe(true);
      expect(coerceProxy('True')).toBe(true);
      expect(coerceProxy(' True ')).toBe(true);
    });
  });
});
