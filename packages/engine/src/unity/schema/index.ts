import { TypeRegistry } from '../../base/index.js';
import { EngineConfig } from '../EngineConfig.js';
import { default as BaseTypes } from './BaseScript.js';
import { default as BaseScript } from './BaseTypes.js';
import { default as LanguageSourceAsset } from './LanguageSourceAsset.js';
import { default as TextAsset } from './TextAsset.js';

export function registerTypes(config: EngineConfig): TypeRegistry {
  return {
    ...BaseTypes(),
    ...BaseScript(),
    ...LanguageSourceAsset(config),
    ...TextAsset(),
  };
}
