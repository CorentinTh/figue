import { describe, expect, it } from 'vitest';
import { format, SchemaObjCustom } from './custom';

describe('customFormat', () => {
  describe('validate', () => {
    it('should use the custom validate function', () => {
      const { validate } = format;

      expect(validate(1, { validate: (value) => value === 1 } as SchemaObjCustom)).toBe(true);
      expect(validate(1, { validate: (value) => value === 2 } as SchemaObjCustom)).toBe(false);
    });
  });

  describe('coerce', () => {
    it('should use the custom coerce function', () => {
      const { coerce } = format;

      expect(coerce(1, { coerce: (value) => Number(value) + 1 } as SchemaObjCustom)).toBe(2);
    });
  });
});
