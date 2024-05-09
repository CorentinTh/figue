import type { ZodType } from 'zod';

export type ConfigDefinitionElement<T = unknown> = {
  schema: ZodType<T>;
  env?: string;
  doc?: string;
  default?: T;
};

export type ConfigDefinition = {
  [P in keyof any]: ConfigDefinitionElement | ConfigDefinitionObject;
};

// Helper type for nested ConfigDefinition to avoid direct recursive type alias
export type ConfigDefinitionObject = {
  [K in keyof any]: ConfigDefinitionElement | ConfigDefinition;
};

export type InferSchemaType<T extends ConfigDefinition> = {
  [P in keyof T]: T[P] extends ConfigDefinitionElement ? T[P]['schema']['_output'] : T[P] extends ConfigDefinition ? InferSchemaType<T[P]> : never;
};

export type EnvRecord = Record<string, unknown>;
