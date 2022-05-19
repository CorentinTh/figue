import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjAny extends SchemaObjBase<unknown> {
  format: 'any';
}

export const format: Format = {
  validate: () => true,
  coerce: (value) => value,
};
