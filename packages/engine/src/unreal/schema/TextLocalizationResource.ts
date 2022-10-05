import { defineStruct, TypeFactory, TypeRegistry } from '../../base/index.js';
import { defineArray, defineString } from '../types/index.js';

type PersistedType = {
  Header: {
    MagicNumber: string,
    Version: number,
    LocalizedStringArrayOffset: number
  },
  NamespaceTable: {
    Namespace: string,
    KeyTable: {
      Key: string,
      SourceStringHash: number,
      LocalizedStringIndex: number
    }[]
  }[],
  StringTable: string[]
};

type TextLocalizationResource = {
  Header: {
    MagicNumber: string,
    Version: number,
  },
  NamespaceTable: {
    Namespace: string,
    Strings: {
      Key: string,
      SourceStringHash: number,
      LocalizedString: string
    }[]
  }[],
};

function persist(source: TextLocalizationResource): Pick<PersistedType, "NamespaceTable" | "StringTable"> {
  const namespaceTable: PersistedType["NamespaceTable"] = [];
  const stringLookup = new Map<string, number>();
  const stringTable = [];
  for (const namespace of source.NamespaceTable) {
    const keyTable: PersistedType["NamespaceTable"][number]["KeyTable"] = [];
    for (const string of namespace.Strings) {
      let index = stringLookup.get(string.LocalizedString);
      if (index === undefined) {
        index = stringTable.length;
        stringTable.push(string.LocalizedString);
      }
      keyTable.push({
        Key: string.Key,
        SourceStringHash: string.SourceStringHash,
        LocalizedStringIndex: index
      });
    }
    namespaceTable.push({ Namespace: namespace.Namespace, KeyTable: keyTable });
  }
  return { NamespaceTable: namespaceTable, StringTable: stringTable };
}

function restore(source: PersistedType): TextLocalizationResource["NamespaceTable"] {
  const namespaceTable: TextLocalizationResource["NamespaceTable"] = [];
  for (const namespace of source.NamespaceTable) {
    const strings: TextLocalizationResource["NamespaceTable"][number]["Strings"] = [];
    for (const key of namespace.KeyTable) {
      strings.push({
        Key: key.Key,
        SourceStringHash: key.SourceStringHash,
        LocalizedString: source.StringTable[key.LocalizedStringIndex]
      });
    }
    namespaceTable.push({
      Namespace: namespace.Namespace,
      Strings: strings
    });
  }
  return namespaceTable;
}

// https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Private/Internationalization/TextLocalizationResource.cpp#L233
const TextLocalizationResource: TypeFactory<TextLocalizationResource> = (config, resolve) => {

  const Header = defineStruct<PersistedType["Header"]>([
    { name: 'MagicNumber', type: 'guid' },
    { name: 'Version', type: 'uint8' },
    { name: 'LocalizedStringArrayOffset', type: 'uint64' },
  ], resolve);

  const NamespaceTable = defineArray(defineStruct<PersistedType["NamespaceTable"][number]>([
    { name: 'Namespace', type: 'string' },
    {
      name: 'KeyTable',
      type: defineArray(defineStruct([
        { name: 'Key', type: 'string' },
        { name: 'SourceStringHash', type: 'uint32' },
        { name: 'LocalizedStringIndex', type: 'int32' },
      ], resolve))
    }
  ], resolve));

  const StringTable = defineArray(defineString());

  return {
    read: source => {
      const state: PersistedType = {
        Header: Header.read(source),
        NamespaceTable: NamespaceTable.read(source),
        StringTable: StringTable.read(source)
      };
      return {
        Header: {
          MagicNumber: state.Header.MagicNumber,
          Version: state.Header.Version
        },
        NamespaceTable: restore(state),
      };
    },
    write: value => {
      const casted = value as TextLocalizationResource;
      const state = persist(casted as TextLocalizationResource);
      const namespaceTable = Buffer.concat(NamespaceTable.write(state.NamespaceTable));
      return [
        ...Header.write({
          ...(value as TextLocalizationResource).Header,
          LocalizedStringArrayOffset: 17 + namespaceTable.length
        }),
        namespaceTable,
        ...StringTable.write(state.StringTable)
      ];
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    TextLocalizationResource
  };
}
