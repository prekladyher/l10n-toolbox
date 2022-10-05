import { TypeRegistry } from './TypeRegistry.js';
import { TypeResolver } from './TypeResolver.js';

/**
 * Common key for array type handler.
 */
const ARRAY_TYPE_KEY = 'array';

/**
 * Create default type resolver for the given type registry.
 */
export function createResolver(registry: TypeRegistry): TypeResolver  {
  // FIXME Allow passing type config
  const resolve: TypeResolver = (key: string) => {
    if (key.endsWith('[]')) {
      // We expect array type to be in the registry
      return registry[ARRAY_TYPE_KEY](key.substring(0, key.length - 2), resolve);
    }
    const factory = registry[key];
    if (!factory) {
      throw Error(`Unknown type key: ${key}`);
    }
    return factory(undefined, resolve);
  };
  return resolve;
}
