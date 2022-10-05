import { TypeRegistry } from '../../base/index.js';
import { default as BaseTypes } from './BaseTypes.js';
import { default as TextLocalizationResource } from './TextLocalizationResource.js';

export function registerTypes(): TypeRegistry {
  return {
    ...BaseTypes(),
    ...TextLocalizationResource()
  };
}
