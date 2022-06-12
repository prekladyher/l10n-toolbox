import { default as BaseScript } from './BaseTypes';
import { default as BaseTypes } from './BaseScript';
import { default as LanguageSourceAsset } from './LanguageSourceAsset';
import { EngineConfig } from '../EngineConfig';
import { TypeRegistry } from '@prekladyher/engine-base';

export function registerTypes(config: EngineConfig): TypeRegistry {
  return {
    ...BaseTypes(),
    ...BaseScript(),
    ...LanguageSourceAsset(config)
  };
}
