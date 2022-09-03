import { registerStruct, TypeRegistry } from '@prekladyher/engine-base';

const TextAsset = registerStruct([
  { name: 'm_Name', type: 'string' },
  { name: 'm_Script', type: 'string' }
]);

export default function registerTypes(): TypeRegistry {
  return {
    TextAsset
  };
}
