import { TypeRegistry } from '@prekladyher/engine-base';
import { default as BaseTypes } from './BaseTypes';
import { default as TextLocalizationResource } from './TextLocalizationResource';

export function registerTypes(): TypeRegistry {
  return {
    ...BaseTypes(),
    ...TextLocalizationResource()
  };
}
