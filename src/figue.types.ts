import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Expand } from './types';

export type ConfigDefinitionElement<
  T extends StandardSchemaV1 = StandardSchemaV1,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = {
  schema: T;
  env?: string | string[];
  doc?: string;
  default?: StandardSchemaV1.InferOutput<T>;
} & Extra;

export type ConfigDefinition<Extra extends Record<string, unknown> = Record<string, unknown>> = {
  [P in keyof any]: ConfigDefinitionElement<StandardSchemaV1, Extra> | ConfigDefinitionObject<Extra>;
};

// Helper type for nested ConfigDefinition to avoid direct recursive type alias
export type ConfigDefinitionObject<Extra extends Record<string, unknown> = Record<string, unknown>> = {
  [K in keyof any]: ConfigDefinitionElement<StandardSchemaV1, Extra> | ConfigDefinition<Extra>;
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
