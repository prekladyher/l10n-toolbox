import { Schema, StructSchema } from '@prekladyher/engine-base';

// Helper type for unknown array types
const $EmptyArray: StructSchema = [
  { name: 'size', type: 'int', value: 0 },
];

const Base: StructSchema = [
  { name: 'm_GameObject', type: 'PPtr' /* GameObject */ },
  { name: 'm_Enabled', type: 'uint8', value: 1 },
  { name: 'm_Script', type: 'PPtr' /* MonoScript */ },
  { name: 'm_Name', type: 'string' },
];

const PPtr: StructSchema = [
  { name: 'm_FileID', type: 'uint32' },
  { name: 'm_PathID', type: 'uint64' },
];

const Vector2f: StructSchema = [
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
];

const Rectf: StructSchema = [
  { name: 'x', type: 'float' },
  { name: 'y', type: 'float' },
  { name: 'width', type: 'float' },
  { name: 'height', type: 'float' },
];

const ColorRGBA: StructSchema = [
  { name: 'r', type: 'float' },
  { name: 'g', type: 'float' },
  { name: 'b', type: 'float' },
  { name: 'a', type: 'float' },
];

const UnityEvent: StructSchema = [
  { name: 'm_PersistentCalls', type: 'PersistentCallGroup' }
];

const PersistentCallGroup: StructSchema = [
  { name: 'm_Calls', type: '$EmptyArray' }
];

export default function createSchema(): Schema {
  return {
    $EmptyArray,
    Base,
    PPtr,
    Vector2f,
    Rectf,
    ColorRGBA,
    UnityEvent,
    PersistentCallGroup
  };
}
