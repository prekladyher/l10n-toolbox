import { calcPadding } from '../../base/support/calcPadding.js';
import { checkStrict } from '../../base/support/checkStrict.js';
import { defineAscii } from '../../base/types/defineAscii.js';
import { defineNative } from '../../base/types/defineNative.js';
import { defineStruct } from '../../base/types/defineStruct.js';
import { TypeHandler } from '../../base/types/TypeHandler.js';
import { TypeFactory, TypeRegistry } from '../../base/types/TypeRegistry.js';

export type PersistedType = {
  FileHeader: {
    signature: string,
    fileVersion: string,
    minPlayerVersion: string,
    totalFileSize: bigint,
    compressedSize: number,
    decompressedSize: number,
    flags: number
  },
};

// https://github.com/nesrak1/AssetsTools.NET/blob/master/AssetTools.NET/Standard/AssetsBundleFileFormat/AssetsBundleFile.cs
const AssetBundleFile: TypeFactory<PersistedType> = (config, resolve) => {

  const ascii = defineAscii()
  const uint32 = defineNative('UInt32BE');
  const int64 = defineNative('Int64BE');

  const FileHeader: TypeHandler<PersistedType['FileHeader']> = defineStruct([
    { name: 'signature', type: ascii, assert: checkStrict('UnityFS') },
    { name: 'fileVersion', type: uint32, value: 7 },
    { name: 'minPlayerVersion', type: ascii },
    { name: 'fileEngineVersion', type: ascii },
    { name: 'totalFileSize', type: int64 },
    { name: 'compressedSize', type: uint32 },
    { name: 'decompressedSize', type: uint32 },
    { name: 'flags', type: uint32 },
  ], resolve);


  return {
    read: source => {
      const fileHeader = FileHeader.read(source);
      source.skip(calcPadding(source.cursor(), 16));

      // TODO this is just a WIP

      return {
        FileHeader: fileHeader
      };
    },
    write: value => {
      const casted = value as PersistedType;
      const fileHeader = FileHeader.write(casted.FileHeader);

      // TODO this is just a WIP

      return [...fileHeader];
    }
  };
};

export default function registerTypes(): TypeRegistry {
  return {
    AssetBundleFile
  };
}
