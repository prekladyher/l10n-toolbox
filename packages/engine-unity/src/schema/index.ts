import { Schema, SchemaFlags } from '@prekladyher/engine-base';
import { default as BaseScript } from './BaseScript';
import { default as LanguageSourceAsset } from './LanguageSourceAsset';

export function createSchema(flags: SchemaFlags): Schema {
  return {
    ...BaseScript(),
    ...LanguageSourceAsset(flags)
  };
}
