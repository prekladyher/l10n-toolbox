import { StructSchema } from './StructSchema';

/**
 * Mapped object type schema.
 */
export interface ObjectSchema {

  /**
   * Struct defining object state layout.
   */
  layout: StructSchema;

  /**
   * Restore object state from loaded data.
   */
  restore: (loaded: object) => unknown;

  /**
   * Persist object state.
   */
  persist: (object: unknown) => object;

}
