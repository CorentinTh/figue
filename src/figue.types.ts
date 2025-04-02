import type { StandardSchemaV1 } from '@standard-schema/spec';

export type ConfigDefinitionElement<T extends StandardSchemaV1 = StandardSchemaV1> = {
  schema: T;
  env?: string;
  doc?: string;
  default?: StandardSchemaV1.InferOutput<T>;
};

export type ConfigDefinition = {
  [P in keyof any]: ConfigDefinitionElement | ConfigDefinitionObject;
};

// Helper type for nested ConfigDefinition to avoid direct recursive type alias
export type ConfigDefinitionObject = {
  [K in keyof any]: ConfigDefinitionElement | ConfigDefinition;
};

export type InferSchemaType<T extends ConfigDefinition> = {
  [P in keyof T]: T[P] extends ConfigDefinitionElement ? StandardSchemaV1.InferOutput<T[P]['schema']> : T[P] extends ConfigDefinition ? InferSchemaType<T[P]> : never;
};

export type EnvRecord = Record<string, unknown>;
