import type { Format } from '..';
import type { SchemaObjBase } from '../../figue';

export interface SchemaObjCustom extends SchemaObjBase<unknown> {
  format: 'custom';
  validate?: (value: unknown) => boolean;
  coerce?: (value: unknown) => unknown;
}

export const format: Format = {
  validate: (value, { validate }: SchemaObjCustom) => validate?.(value) ?? true,
  coerce: (value, { coerce }: SchemaObjCustom) => coerce?.(value) ?? value,
};
