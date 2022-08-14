import { TypeRegistry } from '@prekladyher/engine-base';
import { EngineConfig } from '../EngineConfig.js';
import { default as BaseTypes } from './BaseScript.js';
import { default as BaseScript } from './BaseTypes.js';
import { default as LanguageSourceAsset } from './LanguageSourceAsset.js';

export function registerTypes(config: EngineConfig): TypeRegistry {
  return {
    ...BaseTypes(),
    ...BaseScript(),
    ...LanguageSourceAsset(config)
  };
}
