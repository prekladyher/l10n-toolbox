import { registerStruct, TypeRegistry } from '../../base/index.js';

const TextAsset = registerStruct([
  { name: 'm_Name', type: 'string' },
  { name: 'm_Script', type: 'string' }
]);

export default function registerTypes(): TypeRegistry {
  return {
    TextAsset
  };
}
