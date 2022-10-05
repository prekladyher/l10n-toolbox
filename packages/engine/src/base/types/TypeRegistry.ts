import { TypeHandler } from './TypeHandler.js';
import { TypeResolver } from './TypeResolver.js';

/**
 * Type definition registry.
 */
export type TypeRegistry = Record<string, TypeFactory<unknown>>;

/**
 * Factory method creating type handler based on the provided config.
 */
export interface TypeFactory<T> {

  /**
   * Create schema based on the provided configuration.
   * @param config Type configuration.
   * @param resolve Type resolver.
   * @returns Constructed type handler.
   */
  (config: TypeConfig, resolve: TypeResolver): TypeHandler<T>;

}

/**
 * Type configuration.
 */
export type TypeConfig = unknown;
