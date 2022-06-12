import { defineStruct, TypeFactory, TypeRegistry } from '@prekladyher/engine-base';
import { defineArray, defineString } from '../types';

// https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Private/Internationalization/TextLocalizationResource.cpp#L233
const TextLocalizationResource: TypeFactory<unknown> = (config, resolve) => {
  const $TextLocalizationResourceVersion = defineStruct([
    { name: 'MagicNumber', type: 'guid' },
    { name: 'Version', type: 'uint8' },
  ], resolve);
  const $NamespaceTable = defineArray(defineStruct([
    { name: 'Namespace', type: 'string' },
    {
      name: 'KeyTable',
      type: defineArray(defineStruct([
        { name: 'Key', type: 'string' },
        { name: 'SourceStringHash', type: 'uint32' },
        { name: 'LocalizedStringIndex', type: 'int' },
      ], resolve))
    }
  ], resolve));
  const $StringTable = defineArray(defineString());
  return {
    read: (source) => {
      const TextLocalizationResourceVersion = $TextLocalizationResourceVersion.read(source);
      const LocalizedStringArrayOffset = Number(source.read(8).readBigUint64LE());
      const NamespaceTable = $NamespaceTable.read(source);
      const StringTable = $StringTable.read(source);
      return {
        ...TextLocalizationResourceVersion,
        LocalizedStringArrayOffset,
        NamespaceTable,
        StringTable
      };
    },
    write: () => {
      return [];
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    TextLocalizationResource
  };
}
