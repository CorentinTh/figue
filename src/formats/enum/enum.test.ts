import { describe, expect, it } from 'vitest';
import { format, SchemaObjEnum } from './enum';

describe('enumFormat', () => {
  describe('validate', () => {
    it('should return true when the value is from the values array', () => {
      const { validate } = format;

      expect(validate('foo', { values: ['foo'] } as SchemaObjEnum)).toBe(true);
      expect(validate('foo', { values: ['bar', 'foo'] } as SchemaObjEnum)).toBe(true);
      expect(validate('', { values: [''] } as SchemaObjEnum)).toBe(true);

      expect(validate('Foo', { values: ['foo'] } as SchemaObjEnum)).toBe(false);
      expect(validate('foo', { values: [] } as SchemaObjEnum)).toBe(false);

      expect(validate('', { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(undefined, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(null, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(NaN, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(1.1, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(-1.1, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate('-1', { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate('0', { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate('1', { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate('', { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate(/^/, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate({}, { values: [] } as SchemaObjEnum)).toBe(false);
      expect(validate([], { values: [] } as SchemaObjEnum)).toBe(false);
    });
  });
});
