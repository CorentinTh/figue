import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Expand } from './types';

export type ConfigDefinitionElement<T extends StandardSchemaV1 = StandardSchemaV1> = {
  schema: T;
  env?: string | string[];
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

export type InferSchemaType<T extends ConfigDefinition> = Expand<{
  [P in keyof T]: T[P] extends ConfigDefinitionElement ? StandardSchemaV1.InferOutput<T[P]['schema']> : T[P] extends ConfigDefinition ? Expand<InferSchemaType<T[P]>> : never;
}>;

export type EnvRecord = Record<string, unknown>;

export type ConfigIssue = {
  path: string[];
  message: string;
  definition?: ConfigDefinitionElement;
};
