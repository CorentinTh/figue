import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjBoolean extends SchemaObjBase<boolean> {
  format: 'boolean';
}

export const format: Format = {
  validate: () => true,
  coerce: (value) => Boolean(value),
};
