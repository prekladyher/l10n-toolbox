import { Schema } from "@prekladyher/engine-base/dist";
import { createResolver } from "./handlers";

/**
 * Decode asset data object.
 * @param schema Type schema dictionary.
 * @param type Asset type tag.
 * @param source Source buffer with asset data.
 * @returns Decoded asset object.
 */
export function decodeAsset(schema: Schema, type: string, source: Buffer): unknown {
  const resolve = createResolver(schema);
  const handler = resolve(type);
  if (!handler) {
    throw new Error(`Unknown type ${type}`);
  }
  return handler.decode(source, 0)[1];
}
