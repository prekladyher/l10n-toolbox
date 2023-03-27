import { registerStruct, TypeRegistry } from '../../base/index.js';

// Helper type for unknown array types
const $EmptyArray = registerStruct([
  // FIXME This should be deserialized as empty array!
  { name: 'size', type: 'int', value: 0 },
]);

const Base = registerStruct([
  { name: 'm_GameObject', type: 'PPtr' /* GameObject */ },
  { name: 'm_Enabled', type: 'uint8', value: 1 },
  { name: 'm_Script', type: 'PPtr' /* MonoScript */ },
  { name: 'm_Name', type: 'string' },
]);

const PPtr = registerStruct([
  { name: 'm_FileID', type: 'uint32' },
  { name: 'm_PathID', type: 'uint64' },
]);

const Vector2f = registerStruct([
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
]);

const Vector3f = registerStruct([
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
  { name: 'z', type: 'float' },
]);

const Vector4f = registerStruct([
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
  { name: 'z', type: 'float' },
  { name: 'w', type: 'float' },
]);

const Rectf = registerStruct([
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
  { name: 'width', type: 'float' },
  { name: 'height', type: 'float' },
]);

const ColorRGBA = registerStruct([
  { name: 'r', type: 'float' },
  { name: 'g', type: 'float' },
  { name: 'b', type: 'float' },
  { name: 'a', type: 'float' },
]);

const UnityEvent = registerStruct([
  { name: 'm_PersistentCalls', type: 'PersistentCallGroup' }
]);

const PersistentCallGroup = registerStruct([
  { name: 'm_Calls', type: '$EmptyArray' }
]);

export default function registerTypes(): TypeRegistry {
  return {
    $EmptyArray,
    Base,
    PPtr,
    Vector2f,
    Vector3f,
    Vector4f,
    Rectf,
    ColorRGBA,
    UnityEvent,
    PersistentCallGroup
  };
}
