import { defineBuffer } from '../../base/types/defineBuffer.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeFactory, TypeRegistry } from '../../base/types/TypeRegistry.js';
import { defineArray } from '../index.js';

const Sprite: TypeFactory<any> = (config, resolve) => {

  const RenderDataKey = defineStruct([
    { name: 'first', type: defineBuffer(16) },
    { name: 'second', type: 'int64'}
  ], resolve);

  const AABB = defineStruct([
    { name: 'm_Center', type: 'Vector3f' },
    { name: 'm_Extent', type: 'Vector3f' },
  ], resolve);

  const SubMesh = defineStruct([
    { name: 'firstByte', type: 'uint32' },
    { name: 'indexCount', type: 'uint32' },
    { name: 'topology', type: 'int32' },
    { name: 'baseVertex', type: 'uint32' },
    { name: 'firstVertex', type: 'uint32' },
    { name: 'vertexCount', type: 'uint32' },
    { name: 'localAABB', type: AABB },
  ], resolve);

  const ChannelInfo = defineStruct([
    { name: 'stream', type: 'uint8' },
    { name: 'offset', type: 'uint8' },
    { name: 'format', type: 'uint8' },
    { name: 'dimension', type: 'uint8' },
  ], resolve);

  const VertexData = defineStruct([
    { name: 'm_VertexCount', type: 'uint32' },
    { name: 'm_Channels', type: defineArray(ChannelInfo, resolve)},
    { name: 'm_DataSize', type: 'uint8[]'}
    ], resolve);

  const SpriteRenderData = defineStruct([
    { name: 'texture', type: 'PPtr' },
    { name: 'alphaTexture', type: 'PPtr' },
    { name: 'secondaryTextures', type: '$EmptyArray' },
    { name: 'm_SubMeshes', type: defineArray(SubMesh, resolve) },
    { name: 'm_IndexBuffer', type: defineArray('uint8', resolve) },
    { name: 'm_VertexData', type: VertexData },
    { name: 'm_Bindpose', type: '$EmptyArray' },
    { name: 'textureRect', type: 'Rectf' },
    { name: 'textureRectOffset', type: 'Vector2f' },
    { name: 'atlasRectOffset', type: 'Vector2f' },
    { name: 'settingsRaw', type: 'uint32' },
    { name: 'uvTransform', type: 'Vector4f' },
    { name: 'downscaleMultiplier', type: 'float' }
  ], resolve);

  return defineStruct([
    { name: 'm_Name', type: 'string' },
    { name: 'm_Rect', type: 'Rectf' },
    { name: 'm_Offset', type: 'Vector2f' },
    { name: 'm_Border', type: 'Vector4f' },
    { name: 'm_PixelsToUnits', type: 'float' },
    { name: 'm_Pivot', type: 'Vector2f' },
    { name: 'm_Extrude', type: 'uint32' },
    { name: 'm_IsPolygon', type: 'uint8' },
    { name: 'm_RenderDataKey', type: RenderDataKey },
    { name: 'm_AtlasTags', type: '$EmptyArray' },
    { name: 'm_SpriteAtlas', type: 'PPtr' },
    { name: 'm_RD', type: SpriteRenderData },
    { name: 'm_PhysicsShape', type: defineArray(defineArray('Vector2f', resolve), resolve) },
    { name: 'm_Bones', type: '$EmptyArray' }
  ], resolve);
};

export default function registerTypes(): TypeRegistry {
  return {
    Sprite
  };
}
