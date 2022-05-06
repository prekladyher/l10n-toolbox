import { TypeResolver } from "@prekladyher/engine-base/dist";

/**
 * Decode asset data object.
 * @param type Asset type tag.
 * @param source Source buffer with asset data.
 * @param resolve Type resolver.
 * @returns Decoded asset object.
 */
export function decodeAsset(type: string, source: Buffer, resolve: TypeResolver): unknown {
  const handler = resolve(type);
  if (!handler) {
    throw new Error(`Unknown type ${type}`);
  }
  return handler.decode(source, 0)[1];
}
